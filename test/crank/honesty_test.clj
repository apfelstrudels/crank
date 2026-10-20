(ns crank.honesty-test
  "One test per honest-by-construction rule (design spec §7)."
  (:require [clojure.data.json :as json]
            [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]
            [crank.cc.sift :as sift]
            [crank.core :as core]
            [crank.cov.lcov :as lcov]
            [crank.kondo]
            [crank.main :as main])
  (:import [java.io File]))

;; ---- rules 1-3 and 6 live at the adapter/core seam -------------------------------------

(deftest rule-1-never-fabricate-coverage
  (testing "missing coverage input is a hard error naming the path; no code path defaults cov"
    (is (= :missing-coverage
           (:crank/error (try (core/validate-inputs (lcov/->CloverageLcov)
                                                    {:coverage {:lcov "definitely/missing.info"}})
                              (catch clojure.lang.ExceptionInfo e (ex-data e))))))))

(deftest rule-2-zero-blocks-is-not-zero-coverage
  (let [extents [{:file "a.clj" :name "f" :ns "a" :row 1 :end-row 10 :fn? true}
                 {:file "b.clj" :name "g" :ns "b" :row 1 :end-row 10 :fn? true}]
        cc [{:name "f" :file "a.clj" :line 1 :cc 6}
            {:name "g" :file "b.clj" :line 1 :cc 6}]]
    (testing "never-called defn (records at hits 0) is a true 0% and is scored"
      (let [res (core/join {:cc-entries cc :extents extents
                            :records [{:file "a.clj" :line 2 :hits 0}
                                      {:file "b.clj" :line 2 :hits 0}]
                            :metric :block-coverage :na []})]
        (is (= [0.0 0.0] (map :cov (:rows res))))
        (is (= [42.0 42.0] (map :crap (:rows res))))))
    (testing "never-loaded defn (file produced no records) is NOT 0% - it needs :na"
      (is (= :undeclared-no-coverage-path
             (:crank/error
              (try (core/join {:cc-entries cc :extents extents
                               :records [{:file "a.clj" :line 2 :hits 0}]
                               :metric :block-coverage :na []})
                   (catch clojure.lang.ExceptionInfo e (ex-data e)))))))))

(deftest rule-3-na-requires-written-justification
  (let [extents [{:file "a.clj" :name "f" :ns "a" :row 1 :end-row 10 :fn? true}
                 {:file "b.clj" :name "g" :ns "b" :row 1 :end-row 10 :fn? true}]
        cc [{:name "f" :file "a.clj" :line 1 :cc 6}
            {:name "g" :file "b.clj" :line 1 :cc 60}]
        records [{:file "a.clj" :line 2 :hits 1}]]
    (testing "declared :na yields an N/A row with the reason and never enters the gate"
      (let [res (core/join {:cc-entries cc :extents extents :records records
                            :metric :block-coverage
                            :na [{:file "b.clj" :reason "no coverage path in this lane"}]})]
        (is (= ["g"] (map :name (:na-rows res))))
        (is (= ["no coverage path in this lane"] (map :reason (:na-rows res))))
        ;; g would breach at CC 60, cov 0 (CRAP 3660) - as N/A it must not gate
        (is (not-any? #(= "g" (:name %)) (:rows res)))
        (is (not-any? #(= :fail (core/band (:crap %) {:fail 30 :warn 10})) (:rows res)))))
    (testing "a declared :na on a LOADED file still yields N/A rows with the reason, never gated"
      (let [res (core/join {:cc-entries cc :extents extents
                            :records (conj records {:file "b.clj" :line 2 :hits 0})
                            :metric :block-coverage
                            :na [{:file "b.clj" :reason "grandfathered"}]})]
        (is (= [["g" "grandfathered"]] (map (juxt :name :reason) (:na-rows res))))
        (is (= ["f"] (map :name (:rows res))))))
    (testing "an :na entry matching nothing in the extents is a hard config error"
      (is (= :config
             (:crank/error
              (try (core/join {:cc-entries cc :extents extents :records records
                               :metric :line-coverage
                               :na [{:file "nope.clj" :reason "stale"}]})
                   (catch clojure.lang.ExceptionInfo e (ex-data e)))))))))

(deftest rule-4-unmatched-named-defn-is-loud
  (testing "a CC entry with no extent is exit 1, never a silently dropped row"
    (is (= :unmatched-defn
           (:crank/error
            (try (core/join {:cc-entries [{:name "phantom" :file "a.clj" :line 99 :cc 3}]
                             :extents [{:file "a.clj" :name "f" :ns "a" :row 1 :end-row 10 :fn? true}]
                             :records [{:file "a.clj" :line 2 :hits 1}]
                             :metric :line-coverage :na []})
                 (catch clojure.lang.ExceptionInfo e (ex-data e)))))))
  (testing "the error names the actual unmatched form and points at the remedies"
    (let [msg (try (core/join {:cc-entries [{:name "conn" :kind "defstate" :file "a.clj" :line 12 :cc 2}]
                               :extents [{:file "a.clj" :name "f" :ns "a" :row 1 :end-row 10 :fn? true}]
                               :records [{:file "a.clj" :line 2 :hits 1}]
                               :metric :line-coverage :na []})
                   nil
                   (catch clojure.lang.ExceptionInfo e (ex-message e)))]
      (is (str/includes? msg "(defstate conn) at a.clj:12"))
      (is (not (str/includes? msg "named defns")))
      (is (str/includes? msg ":lint-as"))
      (is (str/includes? msg ":na")))))

;; ---- exit-code policy: --report-only relaxes the gate, never the honesty rules ---------

(defn- temp-config ^File [edn]
  (let [f (File/createTempFile "crank" ".edn")]
    (.deleteOnExit f)
    (spit f edn)
    f))

(def fake-extents [{:file "a.clj" :name "f" :ns "a" :row 1 :end-row 10 :fn? true}])
(def fake-cc [{:name "f" :file "a.clj" :line 1 :cc 6}])

(defn- fake-adapter [behavior]
  (reify core/CoverageAdapter
    (validate-inputs [_ _]
      (when (= :missing behavior)
        (throw (ex-info "coverage input missing: fake" {:crank/error :missing-coverage}))))
    (collect [_ _]
      {:metric :line-coverage
       :records [{:file "a.clj" :line 2 :hits 0}]
       :counters {:throughput {:records 1} :skipped {:unmapped 38}}
       :versions {:node "v22.0.0" :trace-mapping "0.3.31"}})))

(defn- fake-cc-source []
  (reify core/ComplexitySource (measure [_ _] fake-cc)))

(deftest report-only-relaxes-gate-never-honesty
  (let [cfg-file (temp-config
                  (pr-str {:paths ["src/main"]
                           :cc {:tool :crapper :pin "test"}
                           :coverage {:adapter :cloverage-lcov :lcov "fake.info"}
                           :threshold {:fail 30 :warn 10}
                           :na []}))]
    (with-redefs [crank.kondo/extents (fn [_] fake-extents)
                  crank.kondo/version (constantly "v2025.10.23")
                  crank.main/cc-sources {:crapper (fake-cc-source)}
                  crank.main/coverage-adapters {:cloverage-lcov (fake-adapter :breach)}]
      (testing "gate breach (CRAP 42 > 30) is exit 2 in gate mode"
        (is (= 2 (main/exit-code ["--config" (str cfg-file)]))))
      (testing "--report-only converts the same breach to exit 0"
        (is (= 0 (main/exit-code ["--config" (str cfg-file) "--report-only"])))))
    (with-redefs [crank.kondo/extents (fn [_] fake-extents)
                  crank.kondo/version (constantly "v2025.10.23")
                  crank.main/cc-sources {:crapper (fake-cc-source)}
                  crank.main/coverage-adapters {:cloverage-lcov (fake-adapter :missing)}]
      (testing "missing coverage stays exit 1 in gate mode"
        (is (= 1 (main/exit-code ["--config" (str cfg-file)]))))
      (testing "missing coverage stays exit 1 under --report-only"
        (is (= 1 (main/exit-code ["--config" (str cfg-file) "--report-only"])))))))

(def sift-source
  ["(ns a)"
   "(defmulti area :shape)"
   "(defmethod area :circle [s] (* 3 (:r s)))"
   "(defprotocol P (m [x]))"
   "(defrecord Foo [] P (m [_] 1))"
   "(extend-protocol P String (m [s] (count s)))"
   "(defn f [x]"
   "  (letfn [(g [y] (if y 1 2))]"
   "    (let [h (fn named [z] (when z z))]"
   "      (map #(inc %) [(g x) (h x) (reify P (m [_] 2))]))))"])

(deftest rule-4-defmacro-is-gated
  (testing "a defmacro is a function unit: matched, scored, and gated - never silently excluded"
    (let [json-text (json/write-str {:analysis {:var-definitions [{:filename "src/a/core.clj"
                                                                   :ns "a.core" :name "defthing"
                                                                   :row 1 :end-row 8
                                                                   :defined-by "clojure.core/defmacro"}]}})
          extents (crank.kondo/parse-extents json-text ["src"])
          res (core/join {:cc-entries [{:name "defthing" :file "a/core.clj" :line 1 :cc 8}]
                          :extents extents
                          :records [{:file "a/core.clj" :line 2 :hits 0}]
                          :metric :line-coverage :na []})]
      (is (:fn? (first extents)))
      (is (= ["defthing"] (map :name (:rows res))))
      (testing "at cov 0 it breaches the gate like any other defn (CRAP 8^2+8 = 72 > 30)"
        (is (= :fail (core/band (:crap (first (:rows res))) {:fail 30 :warn 10})))))))

(deftest rule-2-lane-mismatched-defns-are-excluded-and-counted
  (let [shared {:file "a/shared.cljc" :name "shared" :ns "a.shared" :row 8 :end-row 12
                :fn? true :langs #{:clj :cljs}}
        shared-cc {:name "shared" :file "a/shared.cljc" :line 8 :cc 2}
        records [{:file "a/shared.cljc" :line 9 :hits 1}]]
    (testing "a clj-only defn in the CLJS lane (v8-shadow) is never scored at a fabricated 0%"
      (let [res (core/join {:cc-entries [{:name "server-only" :file "a/shared.cljc" :line 1 :cc 9}
                                         shared-cc]
                            :extents [{:file "a/shared.cljc" :name "server-only" :ns "a.shared"
                                       :row 1 :end-row 6 :fn? true :langs #{:clj}}
                                      shared]
                            :records records
                            :metric :block-coverage :na []})]
        (is (= ["shared"] (map :name (:rows res))))
        (testing "it is counted under its own named skip reason, and the count is printed"
          (is (= 1 (get-in res [:fidelity :lane-mismatched-defns])))
          (is (str/includes? (core/fidelity-report res) "1 lane-mismatched defns excluded")))))
    (testing "a cljs-only defn in the JVM lane (cloverage-lcov) is excluded the same way"
      (let [res (core/join {:cc-entries [{:name "ui-only" :file "a/ui.cljs" :line 1 :cc 9}
                                         shared-cc]
                            :extents [{:file "a/ui.cljs" :name "ui-only" :ns "a.ui"
                                       :row 1 :end-row 6 :fn? true :langs #{:cljs}}
                                      shared]
                            :records records
                            :metric :line-coverage :na []})]
        (is (= ["shared"] (map :name (:rows res))))
        (is (= 1 (get-in res [:fidelity :lane-mismatched-defns])))))))

(deftest rule-4-cljc-cljs-feature-pass-in-the-v8-lane
  (let [dir (doto (File/createTempFile "crank-cljc" "") (.delete) (.mkdirs))
        _ (spit (File. dir "util.cljc")
                (str/join "\n" ["(ns util)"
                                "(defn shared [x] (inc x))"
                                "#?(:clj (defn server-only [x] (if x 1 2)))"
                                "#?(:cljs (defn format-cell [x] (if x (str x) \"-\")))"]))
        measure (fn [adapter]
                  (core/measure (sift/->SiftSource) {:paths [(str dir)] :coverage {:adapter adapter}}))
        v8-entries (measure :v8-shadow)
        v8-defns (remove :skip v8-entries)]
    (testing "the cljs pass adds exactly the cljs-only units; shared defns are not doubled"
      (is (= ["format-cell" "server-only" "shared"] (sort (map :name v8-defns))))
      (is (= ["shared"] (map :name (filter #(= "shared" (:name %)) v8-defns)))))
    (testing "the lcov lane is unchanged: no cljs pass, the cljs-only defn stays unseen by design"
      (is (= ["server-only" "shared"] (sort (map :name (remove :skip (measure :cloverage-lcov)))))))
    (testing "the cljs-only defn joins, gets a row, and gates in the v8-shadow lane"
      (let [extents [{:file "util.cljc" :name "shared" :ns "util" :row 2 :end-row 2 :fn? true :langs #{:clj :cljs}}
                     {:file "util.cljc" :name "server-only" :ns "util" :row 3 :end-row 3 :fn? true :langs #{:clj}}
                     {:file "util.cljc" :name "format-cell" :ns "util" :row 4 :end-row 4 :fn? true :langs #{:cljs}}]
            res (core/join {:cc-entries v8-entries :extents extents
                            :records [{:file "util.cljc" :line 2 :hits 1}
                                      {:file "util.cljc" :line 4 :hits 0}]
                            :metric :block-coverage :na []})
            format-cell (first (filter #(= "format-cell" (:name %)) (:rows res)))]
        (is (some? format-cell))
        (is (= 0.0 (:cov format-cell)))
        (is (= 6.0 (:crap format-cell)))
        (is (= :ok (core/band (:crap format-cell) {:fail 30 :warn 10})))
        (testing "the clj-only defn stays excluded-and-counted per the lane ruling"
          (is (= 1 (get-in res [:fidelity :lane-mismatched-defns])))
          (is (not-any? #(= "server-only" (:name %)) (:rows res))))
        (testing "the cljs-feature pass is counted and printed, never silent"
          (is (= 2 (get-in res [:fidelity :cljc-cljs-pass-entries])))
          (is (str/includes? (core/fidelity-report res)
                             "2 CC entries via the .cljc cljs-feature pass")))
        (testing "the discarded clj reading of the shared defn is counted under its named reason"
          (is (= {:deduped-cross-lane-unit 1} (get-in res [:fidelity :cc-skipped])))
          (is (str/includes? (core/fidelity-report res) "deduped-cross-lane-unit 1")))))))

(deftest rule-4-cljc-shared-defn-gates-at-the-lane-matched-cc
  (let [dir (doto (File/createTempFile "crank-cljc" "") (.delete) (.mkdirs))
        _ (spit (File. dir "util.cljc")
                (str/join "\n" ["(ns util)"
                                "(defn handle [x]"
                                "  #?(:clj x"
                                "     :cljs (cond (nil? x) 0 (string? x) 1 (keyword? x) 2 (symbol? x) 3 :else 4)))"]))
        extent [{:file "util.cljc" :name "handle" :ns "util" :row 2 :end-row 4 :fn? true :langs #{:clj :cljs}}]
        v8-entries (core/measure (sift/->SiftSource) {:paths [(str dir)] :coverage {:adapter :v8-shadow}})
        handle (first (remove :skip v8-entries))]
    (testing "the cljs-pass reading (CC 5) is the measurement of record, not the clj reading (CC 1)"
      (is (= 5 (:cc handle)))
      (is (= :cljc-cljs-pass (:via handle))))
    (testing "the discarded clj reading is counted under its own named reason, never silently dropped"
      (is (= [:deduped-cross-lane-unit] (map :skip (filter :skip v8-entries)))))
    (testing "the defn gates at the cljs CC: CRAP 5 breaches a fail-3 gate the clj reading (CRAP 1) would pass"
      (let [res (core/join {:cc-entries v8-entries :extents extent
                            :records [{:file "util.cljc" :line 3 :hits 1}]
                            :metric :block-coverage :na []})
            row (first (:rows res))]
        (is (= 5 (:cc row)))
        (is (= 5.0 (:crap row)))
        (is (= :fail (core/band (:crap row) {:fail 3 :warn 1})))
        (is (= {:deduped-cross-lane-unit 1} (get-in res [:fidelity :cc-skipped])))))
  (let [dir (doto (File/createTempFile "crank-cljc" "") (.delete) (.mkdirs))
        _ (spit (File. dir "util.cljc")
                (str/join "\n" ["(ns util)"
                                "(defn handle [x]"
                                "  #?(:clj (cond (nil? x) 0 (string? x) 1 (keyword? x) 2 (symbol? x) 3 :else 4)"
                                "     :cljs x))"]))
        entries (core/measure (sift/->SiftSource) {:paths [(str dir)] :coverage {:adapter :cloverage-lcov}})]
    (testing "the lcov lane symmetrically gates at the clj reading, with no cljs pass and no discards"
      (is (= [5] (map :cc entries)))
      (is (not-any? :via entries))
      (is (not-any? :skip entries))
      (let [res (core/join {:cc-entries entries
                            :extents [{:file "util.cljc" :name "handle" :ns "util" :row 2 :end-row 4 :fn? true :langs #{:clj :cljs}}]
                            :records [{:file "util.cljc" :line 3 :hits 1}]
                            :metric :line-coverage :na []})]
        (is (= :fail (core/band (:crap (first (:rows res))) {:fail 3 :warn 1}))))))))

(deftest rule-4-nested-defn-records-attribute-to-the-scored-outer-defn
  (let [res (core/join {:cc-entries [{:name "outer" :file "a.clj" :line 1 :cc 4}
                                     {:name "inner" :file "a.clj" :line 3 :cc 2 :skip :non-defn-unit}]
                        :extents [{:file "a.clj" :name "outer" :ns "a" :row 1 :end-row 10 :fn? true}
                                  {:file "a.clj" :name "inner" :ns "a" :row 3 :end-row 5 :fn? true}]
                        :records [{:file "a.clj" :line 2 :hits 1}
                                  {:file "a.clj" :line 4 :hits 1}]
                        :metric :line-coverage :na []})
        outer (first (:rows res))]
    (testing "records on the nested defn's lines count toward the enclosing scored defn"
      (is (= ["outer"] (map :name (:rows res))))
      (is (= 2 (:units outer)))
      (is (= 2 (:covered outer))))
    (testing "the skipped nested defn is counted, never a row"
      (is (= {:non-defn-unit 1} (get-in res [:fidelity :cc-skipped]))))))

(deftest rule-4-sift-non-defn-units-are-counted-not-matched
  (let [dir (doto (File/createTempFile "crank-sift" "") (.delete) (.mkdirs))
        _ (spit (File. dir "a.clj") (str/join "\n" sift-source))
        cfg-file (temp-config
                  (pr-str {:paths [(str dir)]
                           :cc {:tool :sift :pin "8125fe8"}
                           :coverage {:adapter :cloverage-lcov :lcov "fake.info"}
                           :na []}))
        area {:file "a.clj" :name "area" :ns "a" :row 2 :end-row 2 :fn? true}
        f {:file "a.clj" :name "f" :ns "a" :row 7 :end-row 10 :fn? true}
        run (fn [extents]
              (with-redefs [crank.kondo/extents (fn [_] extents)
                            crank.kondo/version (constantly "v2025.10.23")
                            crank.main/coverage-adapters {:cloverage-lcov (fake-adapter :breach)}]
                (let [err (java.io.StringWriter.)
                      exit (volatile! nil)
                      out (with-out-str
                            (binding [*err* err]
                              (vreset! exit (main/exit-code ["--config" (str cfg-file) "--check"]))))]
                  {:exit @exit :out out :err (str err)})))]
    (testing "defmethod, record/protocol/reify methods, letfn and inner fns are skipped and counted, not exit 1"
      (let [{:keys [exit out]} (run [area f])]
        (is (= 0 exit))
        (is (str/includes? out "2 of 9 CC entries matched to extents"))
        (is (str/includes? out "CC entries skipped: non-defn-unit 7"))))
    (testing "a top-level defn failing the CC<->extent match is still exit 1"
      (let [{:keys [exit err]} (run [area])]
        (is (= 1 exit))
        (is (str/includes? err "failed the CC<->extent match - refusing to score a subset: (defn f) at a.clj:7"))))))

(deftest unknown-config-key-is-a-hard-error
  (let [cfg-file (temp-config
                  (pr-str {:paths ["src/main"]
                           :cc {:tool :sift :pin "8125fe8"}
                           :coverage {:adapter :cloverage-lcov :lcov "x"}
                           :threshold {:fail 30}
                           :na []
                           :grandfathered ["old/code.clj"]}))]
    (is (= 1 (main/exit-code ["--config" (str cfg-file)])))))

(deftest every-run-prints-provenance-and-adapter-skips
  (let [cfg-file (temp-config
                  (pr-str {:paths ["src/main"]
                           :cc {:tool :crapper :pin "test"}
                           :coverage {:adapter :cloverage-lcov :lcov "fake.info"}
                           :na []}))]
    (with-redefs [crank.kondo/extents (fn [_] fake-extents)
                  crank.kondo/version (constantly "v2025.10.23")
                  crank.main/cc-sources {:crapper (fake-cc-source)}
                  crank.main/coverage-adapters {:cloverage-lcov (fake-adapter :breach)}]
      (let [out (with-out-str (main/exit-code ["--config" (str cfg-file) "--check"]))]
        (testing "rule 5: CC tool + pin, adapter, clj-kondo, node and trace-mapping versions"
          (is (str/includes? out "inputs: cc crapper test, adapter cloverage-lcov, clj-kondo v2025.10.23, node v22.0.0, trace-mapping 0.3.31")))
        (testing "rule 4: adapter-side skips (unmapped) are printed, not only recorded"
          (is (str/includes? out "adapter throughput: records 1; skipped before the join: unmapped 38")))))))
