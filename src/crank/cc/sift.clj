(ns crank.cc.sift
  "ComplexitySource :sift - in-process sift (pinned, see deps.edn) cyclomatic
   complexity per defn. sift is asked for exactly one rule: a metric finding
   per unit with cyclomatic >= 1, i.e. every top-level form it models. <fn>
   anonymous units are skipped by design (they cannot be named in a gate)."
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [crank.core :as core]
            [net.typemark.sift :as sift]))

(def crank-rule
  {:rulesets #{}
   :rules {:crank/cyclomatic-complexity {:extends :metric :measure :cyclomatic :max 0}}})

(defn- clj-file? [f] (re-find #"\.clj[csx]?$" (.getName (io/file f))))

(defn- expand [path]
  (let [f (io/file path)]
    (cond (.isFile f) (if (clj-file? f) [f] [])
          (.isDirectory f) (sort-by str (filter #(and (.isFile %) (clj-file? %)) (file-seq f)))
          :else (throw (ex-info (str "sift: not a file or directory: " path)
                                {:crank/error :config :path path})))))

(defn root-relative
  "Make a sift :file relative to a configured source root. Handles both the
   normal case (file starts with the root) and invocation from another cwd
   (file merely contains the root) - the prototype's greedy strip semantics."
  [source-roots file]
  (or (some (fn [root]
              (let [root (str/replace root #"/+$" "")]
                (cond (str/starts-with? file (str root "/"))
                      (subs file (inc (count root)))
                      (str/includes? file (str "/" root "/"))
                      (subs file (+ (str/last-index-of file (str "/" root "/"))
                                    (count root) 2)))))
            source-roots)
      file))

(defn findings->cc-entries
  "sift findings (data or EDN-parsed) -> [{:name :file :line :cc}], <fn> skipped.
   Paths are made relative to their source root so they meet the kondo extents
   and the coverage IR on the same normalized footing."
  [findings source-roots]
  (into []
        (keep (fn [{:keys [rule symbol file line cyclomatic]}]
                (when (and (= :crank/cyclomatic-complexity rule)
                           (not= "<fn>" (str symbol)))
                  {:name (str symbol)
                   :file (root-relative source-roots file)
                   :line line
                   :cc cyclomatic})))
        findings))

(defrecord SiftSource []
  core/ComplexitySource
  (measure [_ {:keys [paths] :as cfg}]
    (let [linter (sift/linter crank-rule)
          inputs (into []
                       (comp (mapcat expand)
                             (map (fn [f] {:path (str f) :text (slurp f)})))
                       paths)
          findings (:findings (sift/lint linter inputs))]
      (findings->cc-entries findings paths))))
