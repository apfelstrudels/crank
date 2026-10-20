(ns crank.main
  "CLI surface, config load/validate, orchestration, exit codes.

   Exit codes (aligned with crapper's convention):
   0 - all scored functions <= threshold, or --report-only with honest inputs
   2 - gate breach (suppressed by --report-only)
   1 - dishonesty/usage error - never suppressed (design spec §6)"
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [crank.cc.crapper :as crapper]
            [crank.cc.sift :as sift]
            [crank.core :as core]
            [crank.cov.lcov :as lcov]
            [crank.cov.v8 :as v8]
            [crank.kondo :as kondo])
  (:gen-class))

(def cc-sources {:crapper (crapper/->CrapperSource)
                 :sift (sift/->SiftSource)})

(def coverage-adapters {:cloverage-lcov (lcov/->CloverageLcov)
                        :v8-shadow (v8/->V8Shadow)})

(def usage
  (str/join "\n"
            ["crank - the fleet's first-party CRAP tool"
             ""
             "  clojure -M:crank                    gate mode, config from .crank.edn"
             "  clojure -M:crank --report-only      report; threshold breaches do not fail"
             "  clojure -M:crank --threshold 30     override fail threshold"
             "  clojure -M:crank --warn 10          override warn band floor"
             "  clojure -M:crank --check            join-fidelity diagnostics only"
             "  clojure -M:crank --config path.edn"
             "  clojure -M:crank --help"]))

;; ---- config ---------------------------------------------------------------------

(def config-keys #{:paths :cc :coverage :threshold :na :report})

(defn- config-error [msg data]
  (throw (ex-info msg (assoc data :crank/error :config))))

(defn validate-config
  "Unknown keys, wrong types, or an adapter missing its required inputs are all
   hard config errors (design spec §8)."
  [{:keys [paths cc coverage threshold na] :as cfg}]
  (doseq [k (keys cfg)]
    (when-not (config-keys k)
      (config-error (str "unknown .crank.edn key: " k) {:key k})))
  (when-not (and (vector? paths) (seq paths) (every? string? paths))
    (config-error ":paths must be a non-empty vector of source roots" {:paths paths}))
  (when-not (contains? cc-sources (:tool cc))
    (config-error (str ":cc :tool must be one of " (sort (keys cc-sources))) {:cc cc}))
  (when-not (string? (:pin cc))
    (config-error ":cc :pin is required and recorded in every report header" {:cc cc}))
  (let [unknown (remove #{:tool :pin} (keys cc))]
    (when (seq unknown) (config-error (str "unknown :cc keys: " unknown) {:keys unknown})))
  (let [adapter (:adapter coverage)
        required (case adapter
                   :cloverage-lcov #{:adapter :lcov}
                   :v8-shadow #{:adapter :v8-dirs :cljs-runtime :include-glob}
                   nil)
        unknown (remove #{:adapter :lcov :v8-dirs :cljs-runtime :include-glob} (keys coverage))]
    (when-not required
      (config-error (str ":coverage :adapter must be one of " (sort (keys coverage-adapters))) {:coverage coverage}))
    (when (seq unknown) (config-error (str "unknown :coverage keys: " unknown) {:keys unknown}))
    (doseq [k (disj required :adapter)]
      (when-not (contains? coverage k)
        (config-error (str adapter " requires :coverage " k) {:coverage coverage}))))
  (doseq [k (keys threshold)]
    (when-not (contains? #{:fail :warn} k)
      (config-error (str "unknown :threshold key: " k) {:key k})))
  (doseq [{:keys [file reason] :as entry} na]
    (when-not (and (string? file) (string? reason) (not (str/blank? reason)))
      (config-error (str "every :na entry needs a :file and a non-blank written :reason: " entry)
                    {:na entry})))
  cfg)

(defn load-config [path]
  (let [f (io/file path)]
    (when-not (.exists f)
      (config-error (str "config not found: " path) {:path path}))
    ;; the config format allows regex literals (#"..." for :include-glob), which
    ;; clojure.edn rejects; read with the Clojure reader, *read-eval* off.
    (validate-config (binding [*read-eval* false] (read-string (slurp f))))))

;; ---- CLI --------------------------------------------------------------------------

(defn parse-args [args]
  (loop [[a & more :as args] args opts {:config ".crank.edn"}]
    (cond
      (empty? args) opts
      (= a "--help") (assoc opts :help true)
      (= a "--report-only") (recur more (assoc opts :report-only true))
      (= a "--check") (recur more (assoc opts :check true))
      (= a "--threshold") (recur (rest more) (assoc opts :threshold (or (some-> (first more) parse-long)
                                                                       (config-error "--threshold needs a number" {:args args}))))
      (= a "--warn") (recur (rest more) (assoc opts :warn (or (some-> (first more) parse-long)
                                                             (config-error "--warn needs a number" {:args args}))))
      (= a "--config") (recur (rest more) (assoc opts :config (or (first more)
                                                                 (config-error "--config needs a path" {:args args}))))
      :else (config-error (str "unknown argument: " a "\n" usage) {:args args}))))

;; ---- orchestration ------------------------------------------------------------------

(defn run
  "Returns a process exit code."
  [args]
  (let [{:keys [help report-only check config threshold warn] :as opts} (parse-args args)]
    (if help
      (do (println usage) 0)
      (let [cfg (load-config config)
            threshold (cond-> (merge {:fail 30 :warn 10} (:threshold cfg))
                        threshold (assoc :fail threshold)
                        warn (assoc :warn warn))
            extents (kondo/extents cfg)
            cc-source (get cc-sources (get-in cfg [:cc :tool]))
            cc-entries (core/measure cc-source cfg)
            adapter (get coverage-adapters (get-in cfg [:coverage :adapter]))
            _ (core/validate-inputs adapter cfg)
            {:keys [metric records counters versions]} (core/collect adapter cfg)
            result (core/join {:cc-entries cc-entries :extents extents
                               :records records :metric metric :na (:na cfg)})
            result (-> result
                       (update :fidelity merge {:adapter counters})
                       (assoc :versions (merge {:clj-kondo (kondo/version)} versions)))]
        (println (core/provenance result cfg))
        (println (core/fidelity-report result))
        (doseq [note (core/precision-notes metric)]
          (println "precision:" note))
        (if check
          0
          (do
            (println)
            (println (core/table result threshold))
            (when-let [report-path (get-in cfg [:report :edn])]
              (io/make-parents report-path)
              (spit report-path (pr-str (core/edn-report result cfg threshold)))
              (println "\nreport:" report-path))
            (let [breach (boolean (some #(= :fail (core/band (:crap %) threshold)) (:rows result)))]
              (cond (and breach (not report-only)) 2
                    :else 0))))))))

(defn exit-code
  "run, with the exit-code policy applied: honesty/usage errors are exit 1 and
   are never suppressed, including under --report-only."
  [args]
  (try (run args)
       (catch clojure.lang.ExceptionInfo e
         (if (:crank/error (ex-data e))
           (do (binding [*out* *err*]
                 (println "crank:" (ex-message e))
                 (println "crank: honesty/usage errors are exit 1 and are never suppressed"))
               1)
           (throw e)))
       (catch Throwable t
         (binding [*out* *err*]
           (println "crank: unexpected failure:" (ex-message t)))
         1)))

(defn -main [& args]
  (System/exit (exit-code args)))
