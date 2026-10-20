(ns crank.core-test
  (:require [clojure.test :refer [deftest is testing]]
            [crank.core :as core]))

;; ---- CRAP math (spec §11.3) -----------------------------------------------------

(deftest crap-math
  (testing "cov 1 => CRAP = CC exactly"
    (is (= 7.0 (core/crap 7 1.0))))
  (testing "cov 0 => CRAP = CC^2 + CC (the on-key! canary: 18^2+18 = 342)"
    (is (= 342.0 (core/crap 18 0.0))))
  (testing "monotonic in CC and in (1-cov)"
    (is (< (core/crap 5 0.5) (core/crap 6 0.5)))
    (is (< (core/crap 5 0.9) (core/crap 5 0.4)))))

;; ---- join fixtures ----------------------------------------------------------------

(defn- extent [file name ns row end-row fn?]
  {:file file :name name :ns ns :row row :end-row end-row :fn? fn?})

(def exts
  [(extent "a/core.clj" "step" "a.core" 10 30 true)
   (extent "a/core.clj" "on-key!" "a.core" 40 60 true)
   (extent "a/core.clj" "pi" "a.core" 65 65 false)
   (extent "a/util.clj" "helper" "a.util" 5 12 true)
   (extent "b/dead.clj" "ghost" "b.dead" 3 20 true)])

(defn- sift-entry [name file line cc]
  {:name name :file file :line line :cc cc})

(defn- crapper-entry [name ns cc]
  {:name name :ns ns :cc cc})

;; ---- CC<->extent match --------------------------------------------------------------

(deftest match-by-file-name-line
  (testing "exact line match succeeds; the defn then surfaces under rule 3 (no coverage path)"
    (let [e (try (core/join {:cc-entries [(sift-entry "ghost" "b/dead.clj" 3 6)]
                             :extents exts :records [] :metric :block-coverage :na []})
                 nil
                 (catch clojure.lang.ExceptionInfo e (ex-data e)))]
      (is (= :undeclared-no-coverage-path (:crank/error e)))
      (is (= ["ghost"] (map :name (:defns e)))))))

(deftest sift-line-tolerance-and-ambiguity
  (let [run (fn [cc-entries extents]
              (core/join {:cc-entries cc-entries :extents extents
                          :records [{:file "a/core.clj" :line 10 :hits 1}]
                          :metric :block-coverage :na []}))]
    (testing "line+-2 matches"
      (let [res (run [(sift-entry "step" "a/core.clj" 12 22)] [(extent "a/core.clj" "step" "a.core" 10 30 true)])]
        (is (= ["step"] (map :name (:rows res))))))
    (testing "beyond line+-2 is unmatched -> exit-1 error"
      (is (thrown-with-msg? clojure.lang.ExceptionInfo #"CC<->extent"
                            (run [(sift-entry "step" "a/core.clj" 14 22)]
                                 [(extent "a/core.clj" "step" "a.core" 10 11 true)]))))
    (testing "two same-name extents at the same row are ambiguous -> exit-1 error"
      (is (thrown-with-msg? clojure.lang.ExceptionInfo #"CC<->extent"
                            (run [(sift-entry "dup" "a/core.clj" 10 2)]
                                 [(extent "a/core.clj" "dup" "a.core" 10 12 true)
                                  (extent "a/core.clj" "dup" "a.core" 10 13 true)]))))))

(deftest crapper-ns-name-match-and-ambiguity
  (let [run (fn [cc-entries extents]
              (core/join {:cc-entries cc-entries :extents extents
                          :records [{:file "a/core.clj" :line 15 :hits 1}]
                          :metric :line-coverage :na []}))]
    (testing "(ns, name) match without line numbers"
      (let [res (run [(crapper-entry "step" "a.core" 22)] [(extent "a/core.clj" "step" "a.core" 10 30 true)])]
        (is (= ["step"] (map :name (:rows res))))))
    (testing "duplicate name in one ns is a loud error, never a guess"
      (is (thrown-with-msg? clojure.lang.ExceptionInfo #"CC<->extent"
                            (run [(crapper-entry "step" "a.core" 22)]
                                 [(extent "a/core.clj" "step" "a.core" 10 30 true)
                                  (extent "a/core.clj" "step" "a.core" 40 50 true)]))))))

;; ---- attribution, coverage semantics -------------------------------------------------

(deftest coverage-semantics
  (let [cc [(sift-entry "step" "a/core.clj" 10 22)
            (sift-entry "on-key!" "a/core.clj" 40 18)]
        extents [(extent "a/core.clj" "step" "a.core" 10 30 true)
                 (extent "a/core.clj" "on-key!" "a.core" 40 60 true)]]
    (testing "records at hits 0 in a loaded file => true 0%, scored, not N/A (rule 2)"
      (let [res (core/join {:cc-entries cc :extents extents
                            :records [{:file "a/core.clj" :line 12 :hits 5}
                                      {:file "a/core.clj" :line 45 :hits 0}
                                      {:file "a/core.clj" :line 50 :hits 0}]
                            :metric :block-coverage :na []})
            on-key (first (filter #(= "on-key!" (:name %)) (:rows res)))]
        (is (= 0.0 (:cov on-key)))
        (is (= 342.0 (:crap on-key)))
        (is (empty? (:na-rows res)))))
    (testing "defn with zero records in a file that HAS records is 0%, counted (rule 2)"
      (let [res (core/join {:cc-entries cc :extents extents
                            :records [{:file "a/core.clj" :line 12 :hits 1}]
                            :metric :block-coverage :na []})
            on-key (first (filter #(= "on-key!" (:name %)) (:rows res)))]
        (is (= 0.0 (:cov on-key)))
        (is (= 1 (get-in res [:fidelity :zero-record-defns])))))
    (testing "records between defns and outside the gate are skipped and counted"
      (let [res (core/join {:cc-entries cc :extents extents
                            :records [{:file "a/core.clj" :line 12 :hits 1}
                                      {:file "a/core.clj" :line 35 :hits 1}
                                      {:file "test/core_test.cljs" :line 3 :hits 1}]
                            :metric :block-coverage :na []})]
        (is (= {:outside-gate 1 :inter-defn 1} (get-in res [:fidelity :skipped]))))
      )
    (testing "coverage reaching zero gated extents is a hard error (wrong build)"
      (is (thrown-with-msg? clojure.lang.ExceptionInfo #"zero gated source files"
                            (core/join {:cc-entries cc :extents extents
                                        :records [{:file "other/x.clj" :line 1 :hits 1}]
                                        :metric :block-coverage :na []}))))))

(deftest non-function-units-excluded
  (testing "sift units matched to a `def` extent are excluded and counted, never scored"
    (let [res (core/join {:cc-entries [(sift-entry "pi" "a/core.clj" 65 1)
                                       (sift-entry "step" "a/core.clj" 10 22)]
                          :extents [(extent "a/core.clj" "pi" "a.core" 65 65 false)
                                    (extent "a/core.clj" "step" "a.core" 10 30 true)]
                          :records [{:file "a/core.clj" :line 12 :hits 1}]
                          :metric :block-coverage :na []})]
      (is (= ["step"] (map :name (:rows res))))
      (is (= 1 (get-in res [:fidelity :non-function-units]))))))

;; ---- join invariants (spec §11.6) ------------------------------------------------------

(deftest join-invariants
  (let [records [{:file "a/core.clj" :line 11 :hits 3}
                 {:file "a/core.clj" :line 12 :hits 0}
                 {:file "a/core.clj" :line 45 :hits 0}
                 {:file "a/core.clj" :line 70 :hits 1}
                 {:file "a/util.clj" :line 6 :hits 2}
                 {:file "elsewhere.clj" :line 1 :hits 9}]
        res (core/join {:cc-entries [(sift-entry "step" "a/core.clj" 10 22)
                                     (sift-entry "on-key!" "a/core.clj" 40 18)
                                     (sift-entry "helper" "a/util.clj" 5 4)
                                     (sift-entry "ghost" "b/dead.clj" 3 6)]
                        :extents exts
                        :records records
                        :metric :block-coverage
                        :na [{:file "b/dead.clj" :reason "no coverage path in this lane"}]})]
    (testing "every scored row has 0 <= cov <= 1"
      (is (every? #(<= 0.0 (:cov %) 1.0) (:rows res))))
    (testing "every CC entry appears exactly once (scored or N/A)"
      (is (= ["ghost" "helper" "on-key!" "step"]
             (sort (map :name (concat (:rows res) (:na-rows res)))))))
    (testing "fidelity counters sum to the total record count"
      (let [{:keys [records attributed skipped]} (:fidelity res)]
        (is (= 6 records))
        (is (= 6 (+ attributed (:outside-gate skipped) (:inter-defn skipped))))))
    (testing "N/A rows carry their configured reason and never enter the gate"
      (is (= ["no coverage path in this lane"] (map :reason (:na-rows res))))
      (is (not-any? #(= "ghost" (:name %)) (:rows res))))
    (testing "worst-first ordering"
      (is (= (sort > (map :crap (:rows res))) (map :crap (:rows res)))))))

;; ---- table + report ---------------------------------------------------------------------

(deftest table-and-report
  (let [res (core/join {:cc-entries [(sift-entry "step" "a/core.clj" 10 22)
                                     (sift-entry "ghost" "b/dead.clj" 3 6)]
                        :extents exts
                        :records [{:file "a/core.clj" :line 11 :hits 1}]
                        :metric :block-coverage
                        :na [{:file "b/dead.clj" :reason "browser only"}]})
        tbl (core/table res {:fail 30 :warn 10})]
    (testing "N/A section prints each row with its reason"
      (is (re-find #"N/A \(1 defns" tbl))
      (is (re-find #"browser only" tbl)))
    (let [report (core/edn-report res {:cc {:tool :sift :pin "8125fe8"}
                                       :coverage {:adapter :v8-shadow}}
                                      {:fail 30 :warn 10})]
      (is (= "crank.report/v1" (:schema report)))
      (is (= :sift (get-in report [:header :cc-tool])))
      (is (= "8125fe8" (get-in report [:header :cc-pin])))
      (is (= :v8-shadow (get-in report [:header :adapter])))
      (is (= :block-coverage (get-in report [:header :metric]))))))
