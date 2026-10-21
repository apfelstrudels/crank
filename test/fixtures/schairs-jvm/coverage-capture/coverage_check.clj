(ns schairs-user-service.coverage-check
  (:require [clojure.test :refer [deftest is]]
            [schairs-user-service.core]
            [schairs-user-service.users :as users]))

(deftest fixture-coverage-shape
  (is (= {:id 1} (users/find-user {1 {:id 1}} 1)))
  (is (thrown? clojure.lang.ExceptionInfo (users/find-user {} 9)))
  (is (= {2 {:id 2 :name "n" :email "e" :role "member"}}
         (users/create-user {} {:id 2 :name "n" :email "e"})))
  (is (= 8080 (#'schairs-user-service.core/parse-port nil)))
  (is (= 9090 (#'schairs-user-service.core/parse-port "9090"))))
