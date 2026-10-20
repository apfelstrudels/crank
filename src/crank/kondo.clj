(ns crank.kondo
  "clj-kondo --analysis: defn extents (file, row..end-row per var-definition).
   Stack-neutral: clj-kondo parses both .clj and .cljs."
  (:require [clojure.data.json :as json]
            [clojure.java.shell :as sh]
            [clojure.string :as str]))

(defn- root-relative
  "Strip the matching configured source root from a kondo filename.
   A file outside every root means the kondo run and the config disagree - loud."
  [source-roots filename]
  (or (some (fn [root]
              (let [prefix (str (str/replace root #"/+$" "") "/")]
                (when (str/starts-with? filename prefix)
                  (subs filename (count prefix)))))
            source-roots)
      (throw (ex-info (str "kondo reported a file outside the configured :paths: " filename)
                      {:crank/error :config :file filename :paths source-roots}))))

(defn parse-extents
  "Parse clj-kondo analysis JSON into extents:
   {:file :name :ns :row :end-row :fn?} - :file relative to a configured source root.
   A .cljc defn is reported once per language; it is one extent."
  [json-text source-roots]
  (let [analysis (:analysis (json/read-str json-text :key-fn keyword))]
    (->> (:var-definitions analysis)
         (map (fn [v]
                {:file (root-relative source-roots (:filename v))
                 :name (str (:name v))
                 :ns (str (:ns v))
                 :row (:row v)
                 :end-row (:end-row v)
                 :fn? (boolean (some #(str/ends-with? (str (:defined-by v)) %)
                                     ["/defn" "/defn-" "/defmulti"]))}))
         (reduce (fn [m e] (assoc m ((juxt :file :ns :name :row) e) e)) {})
         vals
         (sort-by (juxt :file :row)))))

(defn version []
  (let [{:keys [exit out]} (sh/sh "clj-kondo" "--version")]
    (when-not (zero? exit)
      (throw (ex-info "clj-kondo --version failed" {:crank/error :kondo-failed})))
    (str/replace (str/trim out) #"^clj-kondo\s+" "")))

(defn extents
  "Run clj-kondo over the configured :paths and return parsed extents.
   clj-kondo exits non-zero when lint findings exist (2) or on errors (3);
   the analysis JSON on stdout is authoritative, not the exit code."
  [{:keys [paths] :as _cfg}]
  (let [{:keys [out err]} (apply sh/sh "clj-kondo" "--lint" (concat paths ["--config" "{:output {:analysis true :format :json}}"]))]
    (if (str/starts-with? (str/triml (str out)) "{")
      (let [xs (parse-extents out paths)]
        (when (empty? xs)
          (throw (ex-info (str "clj-kondo found no var-definitions under " paths " - wrong :paths?")
                          {:crank/error :config :paths paths})))
        xs)
      (throw (ex-info (str "clj-kondo produced no analysis JSON: " (str/trim (str err)))
                      {:crank/error :kondo-failed :paths paths})))))
