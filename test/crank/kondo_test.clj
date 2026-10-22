(ns crank.kondo-test
  (:require [clojure.data.json :as json]
            [clojure.test :refer [deftest is testing]]
            [crank.core :as core]
            [crank.kondo :as kondo]))

(defn- var-def [lang]
  {:filename "src/a/shared.cljc" :ns "a.shared" :name "parse" :row 3 :end-row 9
   :lang lang :defined-by (if (= lang "cljs") "cljs.core/defn" "clojure.core/defn")})

(deftest declare-defn-pair-resolves-to-the-defn
  ;; the schairs differential blocker: kondo emits one var-definition extent
  ;; for (declare mailer) and one for (defn mailer ...) - the declare is a
  ;; forward declaration, not a duplicate definition
  (let [declare-extent {:filename "src/a/mailer.clj" :ns "a.mailer" :name "mailer"
                        :row 3 :end-row 3 :defined-by "clojure.core/declare"}
        defn-extent {:filename "src/a/mailer.clj" :ns "a.mailer" :name "mailer"
                     :row 6 :end-row 10 :defined-by "clojure.core/defn"}
        parse #(kondo/parse-extents (json/write-str {:analysis {:var-definitions %}}) ["src"])
        extents (parse [declare-extent defn-extent])]
    (testing "parse-extents keeps both extents and marks the declare"
      (is (= [{:file "a/mailer.clj" :name "mailer" :ns "a.mailer" :row 3 :end-row 3
               :fn? false :declared? true :langs #{:clj}}
              {:file "a/mailer.clj" :name "mailer" :ns "a.mailer" :row 6 :end-row 10
               :fn? true :declared? false :langs #{:clj}}]
             extents)))
    (testing "sift and crapper entries match the defn extent - not exit 1, not the declare row"
      (doseq [cc-entry [;; line within ±2 of BOTH the declare row and the defn row:
                        ;; without declare resolution the sift join is ambiguous
                        {:name "mailer" :file "a/mailer.clj" :line 4 :cc 4}
                        ;; crapper join: two candidates, ambiguous without the fix
                        {:name "mailer" :ns "a.mailer" :cc 4}]]
        (let [rows (:rows (core/join {:cc-entries [cc-entry] :extents extents
                                      :records [{:file "a/mailer.clj" :line 7 :hits 1}]
                                      :metric :line-coverage :na []}))]
          (is (= [{:name "mailer" :row 6}] (map #(select-keys % [:name :row]) rows)))
          (testing "coverage attributes to the defn's rows"
            (is (= [1] (map :covered rows)))))))
    (testing "two defn extents for the same var are a genuine duplicate: still a loud :ambiguous"
      (doseq [[cc-entry dup-defn] [;; sift: the CC line is within ±2 of both defn rows
                                   [{:name "mailer" :file "a/mailer.clj" :line 8 :cc 4}
                                    (assoc defn-extent :row 9 :end-row 16)]
                                   ;; crapper: two defns in one ns
                                   [{:name "mailer" :ns "a.mailer" :cc 4}
                                    (assoc defn-extent :row 12 :end-row 16)]]]
        (is (thrown-with-msg? clojure.lang.ExceptionInfo #"CC<->extent"
                              (core/join {:cc-entries [cc-entry]
                                          :extents (parse [defn-extent dup-defn])
                                          :records [{:file "a/mailer.clj" :line 7 :hits 1}]
                                          :metric :line-coverage :na []})))))))

(deftest cljc-defn-is-one-extent
  (let [json-text (json/write-str {:analysis {:var-definitions [(var-def "clj") (var-def "cljs")]}})
        extents (kondo/parse-extents json-text ["src"])]
    (testing "a .cljc defn reported per language yields a single extent with the union of languages"
      (is (= [{:file "a/shared.cljc" :name "parse" :ns "a.shared" :row 3 :end-row 9 :fn? true :declared? false :langs #{:clj :cljs}}]
             extents)))
    (testing "sift and crapper entries for it match instead of being ambiguous"
      (doseq [cc-entry [{:name "parse" :file "a/shared.cljc" :line 3 :cc 4}
                        {:name "parse" :ns "a.shared" :cc 4}]]
        (is (= ["parse"]
               (map :name (:rows (core/join {:cc-entries [cc-entry] :extents extents
                                             :records [{:file "a/shared.cljc" :line 4 :hits 1}]
                                             :metric :line-coverage :na []})))))))))
