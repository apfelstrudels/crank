(ns crank.honesty-test
  "One test per honest-by-construction rule (design spec §7)."
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]
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
                 (catch clojure.lang.ExceptionInfo e (ex-data e))))))))

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
        (is (str/includes? err "named defns failed the CC<->extent match"))
        (is (str/includes? err ": f"))))))

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
