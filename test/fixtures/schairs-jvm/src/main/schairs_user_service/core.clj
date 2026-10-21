(ns schairs-user-service.core
  (:require [schairs-user-service.users :as users])
  (:gen-class))

(defn- parse-port [s]
  (if (nil? s)
    8080
    (Integer/parseInt s)))

(defn -main [& args]
  (let [port (parse-port (first args))
        db (atom {})]
    (when (and (seq args) (some #{"--seed"} args))
      (swap! db assoc 1 (users/create-user {} {:id 1 :name "admin" :email "a@b.c"})))
    (cond
      (< port 0) (println "invalid port" port)
      (< port 1024) (println "refusing privileged port" port)
      :else (println "starting server on port" port))))
