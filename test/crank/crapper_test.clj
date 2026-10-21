(ns crank.crapper-test
  "crapper EDN parser tests: the regression anchor against a real crapper
   9f1bead capture (fixture provenance: test/fixtures/crapper-crank-src/README.md),
   plus the loud rejections the honesty contract requires for anything that is
   not the real {:entries [...]} shape."
  (:require [clojure.test :refer [deftest is testing]]
            [crank.cc.crapper :as crapper]))

(deftest parses-real-crapper-capture
  (testing "the parser consumes a real crapper 9f1bead .metrics/crap.edn verbatim"
    (let [entries (crapper/parse-crapper-edn
                   (slurp "test/fixtures/crapper-crank-src/crap.edn"))]
      (is (= 36 (count entries)))
      (is (= [{:name "validate-config" :ns "crank.main" :cc 16}
              {:name "join" :ns "crank.core" :cc 15}
              {:name "match-extent" :ns "crank.core" :cc 15}
              {:name "parse-args" :ns "crank.main" :cc 15}
              {:name "run" :ns "crank.main" :cc 9}
              {:name "parse-lcov" :ns "crank.cov.lcov" :cc 8}
              {:name "attribute" :ns "crank.core" :cc 7}
              {:name "expand" :ns "crank.cc.sift" :cc 6}
              {:name "fidelity-report" :ns "crank.core" :cc 6}
              {:name "parse-crapper-edn" :ns "crank.cc.crapper" :cc 5}
              {:name "var-langs" :ns "crank.kondo" :cc 5}
              {:name "band" :ns "crank.core" :cc 4}
              {:name "table" :ns "crank.core" :cc 4}
              {:name "exit-code" :ns "crank.main" :cc 4}
              {:name "root-relative" :ns "crank.cc.sift" :cc 3}
              {:name "describe-cc-entry" :ns "crank.core" :cc 3}
              {:name "extents" :ns "crank.kondo" :cc 3}
              {:name "root-relative" :ns "crank.kondo" :cc 3}
              {:name "file-units" :ns "crank.cc.sift" :cc 2}
              {:name "units->cc-entries" :ns "crank.cc.sift" :cc 2}
              {:name "lane-mismatched?" :ns "crank.core" :cc 2}
              {:name "coverage-files" :ns "crank.cov.v8" :cc 2}
              {:name "remap-script" :ns "crank.cov.v8" :cc 2}
              {:name "parse-extents" :ns "crank.kondo" :cc 2}
              {:name "version" :ns "crank.kondo" :cc 2}
              {:name "load-config" :ns "crank.main" :cc 2}
              {:name "clj-file?" :ns "crank.cc.sift" :cc 1}
              {:name "cljc-file?" :ns "crank.cc.sift" :cc 1}
              {:name "cljs-feature-copy" :ns "crank.cc.sift" :cc 1}
              {:name "crap" :ns "crank.core" :cc 1}
              {:name "edn-report" :ns "crank.core" :cc 1}
              {:name "fmt" :ns "crank.core" :cc 1}
              {:name "pct" :ns "crank.core" :cc 1}
              {:name "provenance" :ns "crank.core" :cc 1}
              {:name "-main" :ns "crank.main" :cc 1}
              {:name "config-error" :ns "crank.main" :cc 1}]
             entries)))))

(deftest rejects-non-real-shapes-loudly
  (testing "a bare vector of entries - the shape the old constructed fixture used,
            which real crapper never writes - is a loud error, not a silent accept"
    (is (thrown-with-msg? clojure.lang.ExceptionInfo
                          #"\{:entries \[\.\.\.\]\} map"
                          (crapper/parse-crapper-edn
                           "[{:name \"f\" :namespace \"a.b\" :complexity 2 :coverage nil :crap nil}]"))))
  (testing "a map without an :entries vector is a loud error"
    (is (thrown-with-msg? clojure.lang.ExceptionInfo
                          #"no :entries vector"
                          (crapper/parse-crapper-edn "{:entries \"not-a-vector\"}")))
    (is (thrown-with-msg? clojure.lang.ExceptionInfo
                          #"no :entries vector"
                          (crapper/parse-crapper-edn "{:functions []}"))))
  (testing "entries missing name, namespace, or a numeric complexity are loud errors"
    (is (thrown-with-msg? clojure.lang.ExceptionInfo
                          #"malformed crapper entry"
                          (crapper/parse-crapper-edn
                           "{:entries [{:name \"f\" :namespace \"a.b\" :complexity nil}]}")))
    (is (thrown-with-msg? clojure.lang.ExceptionInfo
                          #"malformed crapper entry"
                          (crapper/parse-crapper-edn
                           "{:entries [{:name \"f\" :namespace \"a.b\" :complexity \"high\"}]}")))
    (is (thrown-with-msg? clojure.lang.ExceptionInfo
                          #"malformed crapper entry"
                          (crapper/parse-crapper-edn
                           "{:entries [{:namespace \"a.b\" :complexity 2}]}")))))
