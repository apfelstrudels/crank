(ns crank.core
  "The one CRAP math core, the one join, and the honest-by-construction rules
   (design spec §7). Adapters never see defns; extents never see adapters.

   IR hit records: {:file :line :hits} - one per instrumentation unit (LCOV:
   per DA line; v8-shadow: per V8 block, block-start attribution). Extents:
   {:file :name :ns :row :end-row :fn?} from clj-kondo. CC entries: sift
   {:name :file :line :cc} or crapper {:name :ns :cc}; an entry marked
   {:skip reason} is a CC unit that is not a defn, counted and never matched."
  (:require [clojure.string :as str]))

(defprotocol CoverageAdapter
  (validate-inputs [this cfg])
  (collect [this cfg]))

(defprotocol ComplexitySource
  (measure [this cfg]))

(defn crap
  "CRAP(f) = CC^2 * (1-cov)^3 + CC"
  ^double [cc cov]
  (+ (* cc cc (Math/pow (- 1.0 cov) 3.0)) cc))

;; ---- CC entry <-> extent match (rule 4: unmatched named defn is a loud error) ---

(defn- match-extent
  "sift join: (file, name, line exact else line±2). crapper join: (ns, name).
   Returns the extent, :ambiguous, or nil."
  [extent-index cc-entry]
  (let [{:keys [name ns file line]} cc-entry
        candidates (if (and file line)
                     (filter #(and (= file (:file %)) (= name (:name %))) extent-index)
                     (filter #(and (= ns (:ns %)) (= name (:name %))) extent-index))]
    (cond
      (empty? candidates) nil
      (and file line)
      (let [exact (filter #(= line (:row %)) candidates)
            near (filter #(<= (abs (- line (:row %))) 2) candidates)]
        (cond (= 1 (count exact)) (first exact)
              (seq exact) :ambiguous
              (= 1 (count near)) (first near)
              (seq near) :ambiguous
              :else nil))
      (= 1 (count candidates)) (first candidates)
      :else :ambiguous)))

(defn- describe-cc-entry
  "The unmatched form as the user wrote it: (kind name) at file:line for sift,
   ns/name for crapper (which reports no form kind or location)."
  [{:keys [name kind ns file line]}]
  (str (if kind (str "(" kind " " name ")") name)
       (if file (str " at " file ":" line) (str " in " ns))))

;; ---- IR record -> extent attribution ------------------------------------------

(defn- attribute
  "Attribute each IR record to the innermost extent (last by row, extents are
   sorted) enclosing its line. Records whose file has no extents are outside
   the gate (e.g. test namespaces); records between defns are inter-defn.
   Both are skipped and counted - never silently dropped."
  [records extents-by-file]
  (reduce (fn [acc {:keys [file line] :as rec}]
            (if-let [exts (get extents-by-file file)]
              (if-let [e (reduce (fn [best e]
                                   (if (<= (:row e) line (:end-row e)) e best))
                                 nil exts)]
                (-> acc
                    (update-in [:per-extent e :total] (fnil inc 0))
                    (update-in [:per-extent e :covered] (fnil + 0) (if (pos? (:hits rec)) 1 0)))
                (update-in acc [:skipped :inter-defn] (fnil inc 0)))
              (update-in acc [:skipped :outside-gate] (fnil inc 0))))
          {:per-extent {} :skipped {}}
          records))

;; ---- the join -------------------------------------------------------------------

(defn join
  "Join CC entries, extents and IR records into per-defn rows.

   Honesty rules enforced here (design spec §7):
   1. coverage that reaches zero gated extents (wrong build) is a hard error;
   2. zero records in a loaded file is a true 0%, not N/A;
   3. no coverage path (file produced no records) requires a declared :na
      with a written reason, else a hard error; a declared :na always yields
      N/A rows (loaded file or not), and N/A never enters the gate;
   4. a named defn failing the CC<->extent match is a hard error, and the
      matched/unmatched counts and the per-reason CC skips are reported."
  [{:keys [cc-entries extents records metric na]}]
  (let [extents (vec (sort-by (juxt :file :row) extents))
        extents-by-file (group-by :file extents)
        files-with-records (set (map :file records))
        {:keys [per-extent skipped]} (attribute records extents-by-file)
        attributed (reduce + 0 (map :total (vals per-extent)))
        _ (when (and (seq records) (zero? attributed))
            (throw (ex-info "coverage remaps into zero gated source files - wrong build or wrong :paths"
                            {:crank/error :unjoinable-coverage
                             :records (count records) :skipped skipped})))
        na-by-file (into {} (map (juxt :file :reason)) na)
        _ (doseq [{:keys [file] :as entry} na]
            (when-not (contains? extents-by-file file)
              (throw (ex-info (str ":na entry matches nothing in the extents: " file)
                              {:crank/error :config :na entry}))))
        cc-skipped (frequencies (keep :skip cc-entries))
        matched (map (fn [cc] {:cc cc :extent (match-extent extents cc)})
                     (remove :skip cc-entries))
        unmatched (into [] (comp (filter #(nil? (:extent %))) (map :cc)) matched)
        ambiguous (into [] (comp (filter #(= :ambiguous (:extent %))) (map :cc)) matched)
        _ (when (or (seq unmatched) (seq ambiguous))
            (throw (ex-info (str "CC entries failed the CC<->extent match - refusing to score a subset: "
                                 (str/join ", " (map describe-cc-entry (concat unmatched ambiguous)))
                                 ". Each must be a top-level var clj-kondo analyzes: for a custom def"
                                 " macro add a {:lint-as {my.ns/defthing clojure.core/def}} entry to"
                                 " .clj-kondo/config.edn so its var gets extents, or declare an :na"
                                 " entry with a :reason for the file if the form should leave the gate")
                            {:crank/error :unmatched-defn
                             :unmatched unmatched :ambiguous ambiguous})))
        rows (reduce (fn [acc {:keys [cc extent]}]
                       (if-not (:fn? extent)
                         (update-in acc [:fidelity :non-function-units] (fnil inc 0))
                         (let [{:keys [total covered]} (get per-extent extent)
                               file-loaded? (contains? files-with-records (:file extent))]
                           (cond
                             (contains? na-by-file (:file extent))
                             (update acc :na-rows conj
                                     (merge (select-keys extent [:name :ns :file])
                                            {:cc (:cc cc)
                                             :reason (get na-by-file (:file extent))}))

                             total
                             (let [cov (/ (double (or covered 0)) total)]
                               (update acc :rows conj
                                       (merge (select-keys extent [:name :ns :file :row])
                                              {:cc (:cc cc) :units total :covered (or covered 0)
                                               :cov cov :crap (crap (:cc cc) cov)})))

                             file-loaded?
                             ;; file was loaded but no record landed in this defn
                             ;; (uncalled, or compiled away): true 0% (rule 2)
                             (let [cov 0.0]
                               (-> acc
                                   (update :rows conj
                                           (merge (select-keys extent [:name :ns :file :row])
                                                  {:cc (:cc cc) :units 0 :covered 0
                                                   :cov cov :crap (crap (:cc cc) cov)}))
                                   (update-in [:fidelity :zero-record-defns] (fnil inc 0))))

                             :else
                             (update acc :no-coverage-path conj
                                     (select-keys extent [:name :ns :file]))))))
                     {:rows [] :na-rows [] :no-coverage-path [] :fidelity {}}
                     matched)]
    (when (seq (:no-coverage-path rows))
      (throw (ex-info (str "defns with no coverage path and no declared :na: "
                           (str/join ", " (map #(str (:file %) "/" (:name %)) (:no-coverage-path rows)))
                           " - declare them with a written reason, or provide coverage")
                      {:crank/error :undeclared-no-coverage-path
                       :defns (:no-coverage-path rows)})))
    {:metric metric
     :rows (vec (sort-by :crap > (:rows rows)))
     :na-rows (:na-rows rows)
     :fidelity (merge {:records (count records)
                       :attributed attributed
                       :skipped (merge {:outside-gate 0 :inter-defn 0} skipped)
                       :cc-entries (count cc-entries)
                       :cc-matched (count matched)
                       :cc-skipped cc-skipped}
                      (:fidelity rows))}))

;; ---- report -------------------------------------------------------------------

(defn band
  [crap {:keys [fail warn]}]
  (cond (> crap fail) :fail
        (> crap warn) :warn
        :else :ok))

(defn- fmt
  "Locale-independent formatting: the table must read identically in every CI."
  [fmt-str & args]
  (String/format java.util.Locale/US fmt-str (to-array args)))

(defn- pct [x] (fmt "%.1f" (* 100.0 (double x))))

(defn table
  "The one worst-first table: scored rows by CRAP desc, warn band marked,
   then the N/A section with each row's configured reason."
  [{:keys [rows na-rows metric]} threshold]
  (let [unit-name (if (= metric :block-coverage) "blocks" "lines")
        header (fmt "%-28s %-34s %3s %7s %6s %8s" "fn" "file" "CC" unit-name "cov%" "CRAP")
        line (apply str (repeat (count header) "-"))
        row-str (fn [{:keys [name file cc units cov crap]}]
                  (str (fmt "%-28s %-34s %3d %7d %6s %8.2f"
                            name file cc units (pct cov) crap)
                       (case (band crap threshold)
                         :fail " FAIL"
                         :warn " warn"
                         "")))
        na-str (fn [{:keys [name file reason]}]
                 (fmt "  %-28s %-34s %s" name file reason))]
    (str/join "\n"
              (concat [header line]
                      (map row-str rows)
                      (when (seq na-rows)
                        (concat [""
                                 (str "N/A (" (count na-rows) " defns, declared with written reasons; never gated):")]
                                (map na-str na-rows)))))))

(defn fidelity-report [{:keys [fidelity metric]}]
  (let [{:keys [records attributed skipped cc-entries cc-matched cc-skipped
                non-function-units zero-record-defns adapter]} fidelity
        kvs #(str/join ", " (map (fn [[k v]] (str (name k) " " v)) (sort-by key %)))]
    (str/join "\n"
              [(str "fidelity: adapter throughput: " (kvs (:throughput adapter))
                    "; skipped before the join: " (kvs (:skipped adapter)))
               (fmt "fidelity: %d IR records (%s), %d attributed, %d skipped (outside-gate %d, inter-defn %d)"
                    records (name metric) attributed
                    (+ (:outside-gate skipped) (:inter-defn skipped))
                    (:outside-gate skipped) (:inter-defn skipped))
               (fmt "fidelity: %d of %d CC entries matched to extents (an unmatched defn is exit 1); CC entries skipped: %s; %d non-function units excluded; %d defns at true 0%% in loaded files"
                    cc-matched cc-entries (if (seq cc-skipped) (kvs cc-skipped) "none")
                    (or non-function-units 0) (or zero-record-defns 0))])))

(def precision-notes
  {:block-coverage ["v8-shadow: block-start attribution wobbles +/-1 block at defn boundaries; blocks between defns are skipped by design"
                    "CC is tool-relative; compare only within one pinned CC tool"
                    "shadow-cljs upgrades can shift codegen and coverage anchors - re-validate after any bump"]
   :line-coverage ["cloverage-lcov: line coverage; cov = covered DA / total DA inside each defn extent"
                   "CC is tool-relative; compare only within one pinned CC tool"]})

(defn provenance
  "Rule 5: every tool and version a number depends on, so it can be re-derived."
  [{:keys [versions]} {:keys [cc coverage]}]
  (str "inputs: cc " (name (:tool cc)) " " (:pin cc)
       ", adapter " (name (:adapter coverage))
       (str/join (map (fn [[k v]] (str ", " (name k) " " v)) (sort-by key versions)))))

(defn edn-report
  "The machine report: schema-versioned EDN with inputs + pins, per-defn rows,
   and fidelity counters (design spec §6, §7 rule 5)."
  [{:keys [rows na-rows fidelity metric versions]} {:keys [cc coverage] :as _cfg} threshold]
  {:schema "crank.report/v1"
   :header {:tool "crank (git dep; the pin is the version)"
            :cc-tool (:tool cc) :cc-pin (:pin cc)
            :adapter (:adapter coverage) :metric metric
            :versions versions
            :precision (get precision-notes metric)}
   :threshold threshold
   :rows (mapv (fn [r] (update r :crap #(/ (Math/round (* 100.0 %)) 100.0))) rows)
   :na-rows na-rows
   :fidelity fidelity})
