(ns crank.cov.lcov
  "CoverageAdapter :cloverage-lcov - parses an LCOV file produced by the
   project's own Cloverage run (crank never runs the coverage build; missing
   coverage is a crisp, loud precondition failure).

   One IR record per DA:<line>,<hits> entry (line coverage). BRDA/FN records
   are ignored by design - v1 is statement/line coverage (design spec §13)."
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [crank.core :as core]))

(defn parse-lcov
  "LCOV text -> {:records [{:file :line :hits}] :files n :ignored n}.
   SF: paths are relativized against the configured source roots; a record
   outside all roots is a loud config error (the lcov belongs to a different
   checkout, or the roots are wrong)."
  [text source-roots]
  (let [state (atom {:file nil :records [] :files 0 :ignored 0})]
    (doseq [line (str/split-lines text)]
      (cond
        (str/starts-with? line "SF:")
        (let [raw (subs line 3)]
          (swap! state assoc :file
                 (or (some (fn [root]
                             (let [prefix (str (str/replace root #"/+$" "") "/")]
                               (when (str/starts-with? raw prefix)
                                 (subs raw (count prefix)))))
                           source-roots)
                     (throw (ex-info (str "LCOV SF path outside the configured :paths: " raw)
                                     {:crank/error :config :file raw :paths source-roots}))))
          (swap! state update :files inc))

        (str/starts-with? line "DA:")
        (let [[l h] (str/split (subs line 3) #",")]
          (swap! state update :records conj
                 {:file (:file @state) :line (parse-long l) :hits (parse-long h)}))

        (or (str/starts-with? line "BRDA:") (str/starts-with? line "FN"))
        (swap! state update :ignored inc)

        :else nil))
    @state))

(defrecord CloverageLcov []
  core/CoverageAdapter
  (validate-inputs [_ {:keys [coverage] :as _cfg}]
    (let [f (io/file (:lcov coverage))]
      (when-not (.exists f)
        (throw (ex-info (str "coverage input missing: " (:lcov coverage)
                             " - run the project's Cloverage step first (crank never generates coverage)")
                        {:crank/error :missing-coverage :path (:lcov coverage)})))
      (when (or (zero? (.length f)) (str/blank? (slurp f)))
        (throw (ex-info (str "coverage input is empty: " (:lcov coverage))
                        {:crank/error :missing-coverage :path (:lcov coverage)}))))
    nil)
  (collect [_ {:keys [coverage paths] :as _cfg}]
    (let [{:keys [records] :as parsed} (parse-lcov (slurp (:lcov coverage)) paths)]
      (when (empty? records)
        (throw (ex-info (str "coverage input contains zero DA records: " (:lcov coverage)
                             " - wrong file, or a Cloverage run that instrumented nothing")
                        {:crank/error :missing-coverage :path (:lcov coverage)})))
      {:metric :line-coverage
       :records records
       :counters {:records (count records)
                  :files (:files parsed)
                  :fn-br-records-ignored (:ignored parsed)}})))
