(ns crank.kondo-test
  (:require [clojure.data.json :as json]
            [clojure.test :refer [deftest is testing]]
            [crank.core :as core]
            [crank.kondo :as kondo]))

(defn- var-def [lang]
  {:filename "src/a/shared.cljc" :ns "a.shared" :name "parse" :row 3 :end-row 9
   :lang lang :defined-by (if (= lang "cljs") "cljs.core/defn" "clojure.core/defn")})

(deftest cljc-defn-is-one-extent
  (let [json-text (json/write-str {:analysis {:var-definitions [(var-def "clj") (var-def "cljs")]}})
        extents (kondo/parse-extents json-text ["src"])]
    (testing "a .cljc defn reported per language yields a single extent"
      (is (= [{:file "a/shared.cljc" :name "parse" :ns "a.shared" :row 3 :end-row 9 :fn? true}]
             extents)))
    (testing "sift and crapper entries for it match instead of being ambiguous"
      (doseq [cc-entry [{:name "parse" :file "a/shared.cljc" :line 3 :cc 4}
                        {:name "parse" :ns "a.shared" :cc 4}]]
        (is (= ["parse"]
               (map :name (:rows (core/join {:cc-entries [cc-entry] :extents extents
                                             :records [{:file "a/shared.cljc" :line 4 :hits 1}]
                                             :metric :line-coverage :na []})))))))))
