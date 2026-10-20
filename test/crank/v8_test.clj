(ns crank.v8-test
  (:require [clojure.edn :as edn]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]
            [crank.core :as core]
            [crank.cov.v8 :as v8]))

(def fixture "test/fixtures/moonlander-cljs")

(def fixture-cfg
  {:coverage {:adapter :v8-shadow
              :v8-dirs [(str fixture "/coverage/sim") (str fixture "/coverage/render")]
              :cljs-runtime (str fixture "/cljs-runtime")
              :include-glob #"moonlander[^/]*\.js$"}})

(deftest collect-on-golden-fixture
  (testing "real remap through node + trace-mapping reproduces the pinned counters"
    (let [{:keys [metric records counters versions]} (core/collect (v8/->V8Shadow) fixture-cfg)
          expected (:fidelity (edn/read-string (slurp (str fixture "/expected.edn"))))]
      (is (= :block-coverage metric))
      (is (= (:records expected) (count records)))
      (is (= (:unmapped expected) (:unmapped counters)))
      (is (= (:map-missing expected) (:mapMissing counters)))
      (is (= "0.3.31" (:trace-mapping versions)))
      (is (str/starts-with? (:node versions) "v"))
      (is (every? #(and (string? (:file %)) (pos-int? (:line %)) (nat-int? (:hits %))) records)))))

(deftest validation
  (let [adapter (v8/->V8Shadow)]
    (testing "missing coverage dir => exit 1 naming the path"
      (let [e (try (core/validate-inputs adapter {:coverage {:v8-dirs ["no/such/dir"]}}) nil
                   (catch clojure.lang.ExceptionInfo e (ex-data e)))]
        (is (= :missing-coverage (:crank/error e)))
        (is (= "no/such/dir" (:path e)))))
    (testing "dir with no coverage-*.json => exit 1"
      (let [dir (io/file (System/getProperty "java.io.tmpdir") (str "crank-v8-" (System/nanoTime)))]
        (.mkdirs dir)
        (let [e (try (core/validate-inputs adapter {:coverage {:v8-dirs [(str dir)]}}) nil
                     (catch clojure.lang.ExceptionInfo e (ex-data e)))]
          (is (= :missing-coverage (:crank/error e))))))))

(deftest zero-remapped-records-is-unjoinable
  (testing "coverage whose urls match nothing under --include => unjoinable, never 0% (rule 1)"
    (let [dir (io/file (System/getProperty "java.io.tmpdir") (str "crank-v8z-" (System/nanoTime)))]
      (.mkdirs dir)
      (spit (io/file dir "coverage-1.json")
            (str "{\"result\":[{\"url\":\"file:///tmp/other.js\",\"functions\":[]}]}"))
      (let [e (try (core/collect (v8/->V8Shadow)
                               {:coverage {:v8-dirs [(str dir)]
                                           :cljs-runtime (str fixture "/cljs-runtime")
                                           :include-glob #"moonlander[^/]*\.js$"}})
                   nil
                   (catch clojure.lang.ExceptionInfo e (ex-data e)))]
        (is (= :unjoinable-coverage (:crank/error e)))))))
