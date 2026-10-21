(ns schairs-user-service.users)

(def default-role "member")

(defn find-user [db id]
  (if (contains? db id)
    (get db id)
    (throw (ex-info "unknown user" {:id id}))))

(defn create-user [db {:keys [id name email role] :as user}]
  (when-not name
    (throw (ex-info "name required" {:user user})))
  (when-not email
    (throw (ex-info "email required" {:user user})))
  (assoc db id (assoc user :role (or role default-role))))

(defn delete-user! [db id]
  (when (or (nil? db) (empty? db))
    (throw (ex-info "empty user store" {})))
  (if (contains? db id)
    (dissoc db id)
    (throw (ex-info "unknown user" {:id id}))))
