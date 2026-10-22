#!/bin/bash
TITLE='创建 Role 并绑定到 ServiceAccount'
CATEGORY='集群架构'
WEIGHT=8
DESCRIPTION=$(cat <<'CKA_META_EOF'
1. 在 `development` 命名空间创建 SA `dev-user`。
2. 创建 Role `dev-role`：pods 允许 get/list/watch；deployments 与 services 允许 get/list。
3. 创建 RoleBinding `dev-user-binding` 绑定到该 SA。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl create sa dev-user -n development
cat <<'EOF' | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dev-role
  namespace: development
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get","list","watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get","list"]
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get","list"]
EOF
kubectl create rolebinding dev-user-binding -n development --role=dev-role --serviceaccount=development:dev-user
kubectl auth can-i get pods --as=system:serviceaccount:development:dev-user -n development
CKA_META_EOF
)
