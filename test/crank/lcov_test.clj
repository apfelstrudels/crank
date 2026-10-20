(ns crank.lcov-test
  (:require [clojure.test :refer [deftest is testing]]
            [crank.core :as core]
            [crank.cov.lcov :as lcov])
  (:import [java.io File]))

(defn- temp-file ^File [content]
  (let [f (File/createTempFile "crank-lcov" ".info")]
    (.deleteOnExit f)
    (spit f content)
    f))

(deftest parse-multi-sf
  (let [text (str "TN:\nSF:src/main/a/core.clj\nDA:10,1\nDA:11,0\nend_of_record\n"
                  "TN:\nSF:src/main/a/util.clj\nDA:3,5\nend_of_record\n")
        {:keys [records files]} (lcov/parse-lcov text ["src/main"])]
    (is (= 2 files))
    (is (= [{:file "a/core.clj" :line 10 :hits 1}
            {:file "a/core.clj" :line 11 :hits 0}
            {:file "a/util.clj" :line 3 :hits 5}]
           records))))

(deftest parse-out-of-order-and-ignored-records
  (testing "out-of-order DA lines are kept in order; BRDA/FN ignored and counted"
    (let [text (str "SF:src/main/a.clj\nFN:3,a$f\nFNDA:0,a$f\nDA:20,0\nBRDA:20,0,0,-\nDA:4,2\nDA:9,1\nend_of_record\n")
          {:keys [records ignored]} (lcov/parse-lcov text ["src/main"])]
      (is (= [20 4 9] (map :line records)))
      (is (= 3 ignored)))))

(deftest sf-outside-roots-is-loud
  (is (thrown-with-msg? clojure.lang.ExceptionInfo #"outside the configured :paths"
                        (lcov/parse-lcov "SF:other/checkout/a.clj\nDA:1,1\n" ["src/main"])))
  (is (= :config (:crank/error (try (lcov/parse-lcov "SF:x/a.clj\nDA:1,1\n" ["src/main"])
                                    (catch clojure.lang.ExceptionInfo e (ex-data e)))))))

(deftest validation
  (let [adapter (lcov/->CloverageLcov)]
    (testing "missing file => missing-coverage (rule 1: never default to 0% or 100%)"
      (let [e (try (core/validate-inputs adapter {:coverage {:lcov "no/such/lcov.info"}}) nil
                   (catch clojure.lang.ExceptionInfo e (ex-data e)))]
        (is (= :missing-coverage (:crank/error e)))
        (is (= "no/such/lcov.info" (:path e)))))
    (testing "empty file => missing-coverage"
      (let [f (temp-file "")
            e (try (core/validate-inputs adapter {:coverage {:lcov (str f)}}) nil
                   (catch clojure.lang.ExceptionInfo e (ex-data e)))]
        (is (= :missing-coverage (:crank/error e)))))
    (testing "zero DA records => missing-coverage naming the path"
      (let [f (temp-file "TN:\nSF:src/main/a.clj\nend_of_record\n")
            e (try (core/collect adapter {:coverage {:lcov (str f)} :paths ["src/main"]}) nil
                   (catch clojure.lang.ExceptionInfo e (ex-data e)))]
        (is (= :missing-coverage (:crank/error e)))
        (is (= (str f) (:path e)))))))

(deftest collect-metric
  (let [f (temp-file "SF:src/main/a.clj\nDA:1,1\nend_of_record\n")
        {:keys [metric records counters]}
        (core/collect (lcov/->CloverageLcov) {:coverage {:lcov (str f)} :paths ["src/main"]})]
    (is (= :line-coverage metric))
    (is (= 1 (count records)))
    (is (= 1 (get-in counters [:throughput :records])))))
