(ns crank.cc.crapper
  "ComplexitySource :crapper - shells out to unclebob/crapper (Python, installed
   from the pinned git commit, see :cc :pin in config) in --no-coverage mode.
   crapper's own coverage lane is JVM-only and silently dishonest on CLJS
   (feasibility §2.2); crank never lets crapper touch coverage.

   crapper's .metrics/crap.edn carries NO line numbers, so entries join to
   kondo extents by (ns, name) - duplicate names in one ns are a loud error,
   never a guess (design spec §4.2)."
  (:require [clojure.edn :as edn]
            [clojure.java.io :as io]
            [clojure.java.shell :as sh]
            [clojure.string :as str]
            [crank.core :as core]))

(def metrics-file ".metrics/crap.edn")

(defn parse-crapper-edn
  "Parse crapper's .metrics/crap.edn -> [{:name :ns :cc}]. :coverage/:crap are
   always nil in --no-coverage mode and are tolerated, never read."
  [edn-text]
  (let [entries (edn/read-string edn-text)]
    (when-not (sequential? entries)
      (throw (ex-info "crapper metrics are not a vector of entries"
                      {:crank/error :cc-tool-failed})))
    (mapv (fn [{:keys [name namespace complexity]}]
            (when-not (and name namespace (number? complexity))
              (throw (ex-info (str "malformed crapper entry: " (pr-str name))
                              {:crank/error :cc-tool-failed})))
            {:name (str name) :ns (str namespace) :cc complexity})
          entries)))

(defrecord CrapperSource []
  core/ComplexitySource
  (measure [_ {:keys [paths] :as cfg}]
    (let [{:keys [exit err]} (apply sh/sh "python" "-m" "crapper" "--no-coverage" paths)
          f (io/file metrics-file)]
      (when-not (and (zero? exit) (.exists f))
        (throw (ex-info (str "crapper --no-coverage failed (expected crapper "
                             (get-in cfg [:cc :pin]) " installed as the python 'crapper' module): "
                             (str/trim (str err)))
                        {:crank/error :cc-tool-failed :exit exit})))
      (parse-crapper-edn (slurp f)))))
