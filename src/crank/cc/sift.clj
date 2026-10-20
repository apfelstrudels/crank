(ns crank.cc.sift
  "ComplexitySource :sift - in-process sift (pinned, see deps.edn) cyclomatic
   complexity per top-level defn. sift scores every function unit it models;
   only top-level def-form units can be top-level defns. Every other unit -
   <fn>, named inner fns, letfn bindings, defmethod bodies, and
   defrecord/deftype/reify/extend-* methods - has no var-definition extent, so
   it is excluded by design and counted as a :non-defn-unit skip, never fed to
   the extent match."
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [crank.core :as core]
            [net.typemark.sift.complexity :as complexity]))

(def non-defn-kinds #{"fn" "letfn" "defmethod" "method"})

(defn- clj-file? [f] (re-find #"\.clj[csx]?$" (.getName (io/file f))))

(defn- expand [path]
  (let [f (io/file path)]
    (cond (.isFile f) (if (clj-file? f) [f] [])
          (.isDirectory f) (sort-by str (filter #(and (.isFile %) (clj-file? %)) (file-seq f)))
          :else (throw (ex-info (str "sift: not a file or directory: " path)
                                {:crank/error :config :path path})))))

(defn- root-relative
  "Strip the matching configured source root from a sift :file.
   A file outside every root means sift and the config disagree - loud."
  [source-roots file]
  (or (some (fn [root]
              (let [prefix (str (str/replace root #"/+$" "") "/")]
                (when (str/starts-with? file prefix)
                  (subs file (count prefix)))))
            source-roots)
      (throw (ex-info (str "sift reported a file outside the configured :paths: " file)
                      {:crank/error :config :file file :paths source-roots}))))

(defn units->cc-entries
  "sift unit trees per file ([{:file :units}]) -> [{:name :file :line :cc}].
   A top-level unit of a def-form kind is a defn candidate; every other unit
   (nested children included) is an entry marked :skip :non-defn-unit.
   Paths are made relative to their source root so they meet the kondo extents
   and the coverage IR on the same normalized footing."
  [file-units source-roots]
  (into []
        (mapcat (fn [{:keys [file units]}]
                  (let [file (root-relative source-roots file)
                        entry (fn [{:keys [name line cyclomatic]}]
                                {:name name :file file :line line :cc cyclomatic})]
                    (mapcat (fn [{:keys [kind children] :as u}]
                              (cons (cond-> (entry u)
                                      (non-defn-kinds kind) (assoc :skip :non-defn-unit))
                                    (map #(assoc (entry %) :skip :non-defn-unit)
                                         (complexity/flatten-units children))))
                            units))))
        file-units))

(defn- file-units [f]
  (let [path (str f)
        {:keys [ok? error functions]} (complexity/report (slurp f) path)]
    (when-not ok?
      (throw (ex-info (str "sift could not score " path ": " error)
                      {:crank/error :cc-tool-failed :file path})))
    {:file path :units functions}))

(defrecord SiftSource []
  core/ComplexitySource
  (measure [_ {:keys [paths]}]
    (units->cc-entries (map file-units (mapcat expand paths)) paths)))
