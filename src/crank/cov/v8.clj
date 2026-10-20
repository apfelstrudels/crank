(ns crank.cov.v8
  "CoverageAdapter :v8-shadow - raw NODE_V8_COVERAGE block coverage remapped
   through shadow-cljs source maps by resources/crank/remap.mjs (node, with the
   adopting repo's pinned @jridgewell/trace-mapping). One IR record per V8
   block per run (block coverage); counting happens in crank.core.

   This adapter only ever runs in the shadow-cljs lane, which has node by
   definition. Blocks remapping into test namespaces or between defns are
   skipped and counted by the core, never silently dropped."
  (:require [clojure.data.json :as json]
            [clojure.java.io :as io]
            [clojure.java.shell :as sh]
            [clojure.string :as str]
            [crank.core :as core]))

(defn- remap-script
  "Locate resources/crank/remap.mjs on the classpath (crank ships as a git
   dep, a plain directory, so it is a real file node can run)."
  []
  (let [u (io/resource "crank/remap.mjs")]
    (when-not u
      (throw (ex-info "crank/remap.mjs not found on the classpath"
                      {:crank/error :config})))
    (str (io/file u))))

(defn- coverage-files [dir]
  (let [f (io/file dir)]
    (when (.isDirectory f)
      (->> (.listFiles f)
           (filter #(str/ends-with? (.getName %) ".json"))
           (sort-by str)))))

(defrecord V8Shadow []
  core/CoverageAdapter
  (validate-inputs [_ {:keys [coverage] :as _cfg}]
    (doseq [dir (:v8-dirs coverage)]
      (when-not (.isDirectory (io/file dir))
        (throw (ex-info (str "V8 coverage dir missing: " dir
                             " - run the shadow-cljs test builds with NODE_V8_COVERAGE first")
                        {:crank/error :missing-coverage :path dir})))
      (when (empty? (coverage-files dir))
        (throw (ex-info (str "V8 coverage dir has no coverage-*.json: " dir
                             " - NODE_V8_COVERAGE wrote nothing (wrong dir, or the run crashed)")
                        {:crank/error :missing-coverage :path dir}))))
    nil)
  (collect [_ {:keys [coverage] :as _cfg}]
    (let [script (remap-script)
          pair-args (mapcat (fn [dir] ["--pair" (str dir "=" (:cljs-runtime coverage))])
                            (:v8-dirs coverage))
          include (str (:include-glob coverage))
          {:keys [exit out err]}
          (apply sh/sh "node" script
                 (concat pair-args ["--include" include]))]
      (when-not (zero? exit)
        (throw (ex-info (str "coverage remap failed: " (str/trim (str err)))
                        {:crank/error :unjoinable-coverage :exit exit})))
      (let [lines (str/split-lines (str/trim out))
            parsed (map #(json/read-str % :key-fn keyword) lines)
            summary (some :summary parsed)
            records (into [] (remove :summary) parsed)
            versions (some :versions parsed)]
        (when (empty? records)
          (throw (ex-info (str "zero V8 blocks remapped into the configured source roots - "
                               "wrong build, stale maps, or an :include-glob that matches nothing")
                          {:crank/error :unjoinable-coverage
                           :include-glob include
                           :counters summary})))
        {:metric :block-coverage
         :records (mapv (fn [{:keys [file line hits]}]
                          {:file file :line line :hits hits})
                        records)
         :counters {:throughput (select-keys summary [:records :entries])
                    :skipped (select-keys summary [:unmapped :mapMissing :outsideInclude])}
         :versions {:node (:node versions) :trace-mapping (:traceMapping versions)}}))))
