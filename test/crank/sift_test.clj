(ns crank.sift-test
  (:require [clojure.test :refer [deftest is testing]]
            [crank.cc.sift :as sift]))

(defn- unit
  ([kind name line] (unit kind name line []))
  ([kind name line children]
   {:kind kind :name name :line line :cyclomatic 4 :children children}))

(deftest units-are-root-relative-or-loud
  (testing "a file under a configured root is made root-relative"
    (is (= [{:name "step" :kind "defn" :file "a/core.clj" :line 10 :cc 4}]
           (sift/units->cc-entries [{:file "src/main/a/core.clj" :units [(unit "defn" "step" 10)]}]
                                   ["src/main/"]))))
  (testing "a file outside every configured root is a hard config error, never passed through"
    (is (= :config
           (:crank/error
            (try (sift/units->cc-entries [{:file "../other/src/main/a/core.clj"
                                           :units [(unit "defn" "step" 10)]}]
                                         ["src/main"])
                 nil
                 (catch clojure.lang.ExceptionInfo e (ex-data e))))))))

(deftest only-top-level-def-form-units-are-defn-candidates
  (let [entries (sift/units->cc-entries
                 [{:file "src/a.clj"
                   :units [(unit "defn" "f" 1 [(unit "letfn" "g" 2 [(unit "fn" "<fn>" 3)])
                                               (unit "fn" "named" 4)])
                           (unit "def" "table" 6)
                           (unit "defmethod" "area" 8)
                           (unit "method" "Foo/bar" 9)]}]
                 ["src"])]
    (is (= [["f" nil] ["g" :non-defn-unit] ["<fn>" :non-defn-unit] ["named" :non-defn-unit]
            ["table" nil] ["area" :non-defn-unit] ["Foo/bar" :non-defn-unit]]
           (map (juxt :name :skip) entries)))))
