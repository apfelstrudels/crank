(ns crank.sift-test
  (:require [clojure.test :refer [deftest is testing]]
            [crank.cc.sift :as sift]))

(defn- finding [file]
  {:rule :crank/cyclomatic-complexity :symbol 'step :file file :line 10 :cyclomatic 4})

(deftest findings-are-root-relative-or-loud
  (testing "a file under a configured root is made root-relative"
    (is (= [{:name "step" :file "a/core.clj" :line 10 :cc 4}]
           (sift/findings->cc-entries [(finding "src/main/a/core.clj")] ["src/main/"]))))
  (testing "a file outside every configured root is a hard config error, never passed through"
    (is (= :config
           (:crank/error
            (try (sift/findings->cc-entries [(finding "../other/src/main/a/core.clj")] ["src/main"])
                 nil
                 (catch clojure.lang.ExceptionInfo e (ex-data e))))))))
