(ns crank.golden-test
  "The two golden fixtures (design spec §11.1/§11.2): real or honestly-labeled
   inputs through the real parsers, adapters and join; pinned expected tables."
  (:require [clojure.edn :as edn]
            [clojure.test :refer [deftest is testing]]
            [crank.cc.crapper :as crapper]
            [crank.cc.sift :as sift]
            [crank.core :as core]
            [crank.cov.lcov :as lcov]
            [crank.cov.v8 :as v8]
            [crank.kondo :as kondo]))

;; ---- moonlander (CLJS, :v8-shadow) - captured inputs, spec anchors ---------------------

(def ml "test/fixtures/moonlander-cljs")

(defn- moonlander-result []
  (let [cfg (binding [*read-eval* false] (read-string (slurp (str ml "/crank.edn"))))
        cov-cfg (update cfg :coverage
                        #(-> %
                             (assoc :v8-dirs [(str ml "/coverage/sim") (str ml "/coverage/render")]
                                    :cljs-runtime (str ml "/cljs-runtime"))))
        extents (kondo/parse-extents (slurp (str ml "/kondo-analysis.json")) ["src/main"])
        cc (sift/units->cc-entries (edn/read-string (slurp (str ml "/sift-units.edn"))) ["../moonlander/src/main"])
        {:keys [metric records counters]} (core/collect (v8/->V8Shadow) cov-cfg)]
    (assoc (core/join {:cc-entries cc :extents extents :records records
                       :metric metric :na (:na cfg)})
           :adapter-counters counters)))

(deftest moonlander-golden-anchors
  (let [expected (edn/read-string (slurp (str ml "/expected.edn")))
        {:keys [rows na-rows fidelity adapter-counters]} (moonlander-result)]
    (testing "the validated anchors reproduce exactly (feasibility §2.6)"
      (doseq [{:keys [name file cc blocks covered cov crap]} (:anchors expected)]
        (let [row (first (filter #(and (= name (:name %)) (= file (:file %))) rows))]
          (is (some? row) (str name " must be a scored row"))
          (when cc (is (= cc (:cc row)) (str name " CC")))
          (when blocks (is (= blocks (:units row)) (str name " blocks")))
          (when covered (is (= covered (:covered row)) (str name " covered")))
          (when cov (is (< (abs (- cov (:cov row))) 0.001) (str name " cov")))
          (when crap (is (< (abs (- crap (:crap row))) 0.005) (str name " CRAP"))))))
    (testing "pixi and boot are N/A via their declared reasons, never gated"
      (is (= (set (:na-files expected)) (set (map :file na-rows))))
      (is (every? :reason na-rows))
      (is (not-any? #(contains? (set (:na-files expected)) (:file %)) rows)))
    (testing "fidelity: remap counters and the attribution invariant"
      (let [{:keys [records attributed skipped]} fidelity]
        (is (= (get-in expected [:fidelity :records]) records))
        (is (= (get-in expected [:fidelity :unmapped]) (get-in adapter-counters [:skipped :unmapped])))
        (is (= records (+ attributed (:outside-gate skipped) (:inter-defn skipped))))))
    (testing "join invariants: cov in [0,1]; every CC entry scored, N/A, or counted out"
      (is (every? #(<= 0.0 (:cov %) 1.0) rows))
      (let [{:keys [cc-entries cc-skipped non-function-units]} fidelity]
        (is (= {:non-defn-unit 55} cc-skipped))
        (is (= cc-entries
               (+ (count rows) (count na-rows) (or non-function-units 0)
                  (reduce + 0 (vals cc-skipped)))))))))

;; ---- schairs (JVM, :cloverage-lcov) - constructed inputs, hand-computed table ---------

(def sc "test/fixtures/schairs-jvm")

(deftest schairs-golden-table
  (let [expected (edn/read-string (slurp (str sc "/expected.edn")))
        extents (kondo/parse-extents (slurp (str sc "/kondo-analysis.json")) ["src/main"])
        cc (crapper/parse-crapper-edn (slurp (str sc "/crapper.edn")))
        {:keys [metric records]} (core/collect (lcov/->CloverageLcov)
                                               {:paths ["src/main"]
                                                :coverage {:lcov (str sc "/lcov.info")}})
        {:keys [rows fidelity]}
        (core/join {:cc-entries cc :extents extents :records records
                    :metric metric :na []})]
    (testing "metric is stated: line coverage for the LCOV lane (rule 6)"
      (is (= :line-coverage metric)))
    (testing "worst-first table matches the hand-computed expectation row for row"
      (is (= (map :name (:anchors expected)) (map :name rows)))
      (doseq [[exp row] (map vector (:anchors expected) rows)]
        (is (= (:cc exp) (:cc row)) (str (:name exp) " CC"))
        (is (= (:lines exp) (:units row)) (str (:name exp) " lines"))
        (is (= (:covered exp) (:covered row)) (str (:name exp) " covered"))
        (is (< (abs (- (:cov exp) (:cov row))) 0.001) (str (:name exp) " cov"))
        (is (< (abs (- (:crap exp) (:crap row))) 0.005) (str (:name exp) " CRAP"))))
    (testing "bands: -main breaches the 30 gate, delete-user! sits in the warn band"
      (let [threshold {:fail 30 :warn 10}]
        (is (= :fail (core/band (:crap (first rows)) threshold)))
        (is (= :warn (core/band (:crap (second rows)) threshold)))))
    (testing "all records attributed inside defn extents"
      (is (= 19 (get fidelity :records)))
      (is (= 19 (get fidelity :attributed))))))
