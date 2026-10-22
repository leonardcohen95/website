#!/bin/bash
TITLE='创建 ClusterRole 并绑定到指定 SA'
CATEGORY='集群架构'
WEIGHT=10
DESCRIPTION=$(cat <<'CKA_META_EOF'
1. 创建 ClusterRole `deployment-clusterrole`，只允许对 Deployment / StatefulSet / DaemonSet 执行 create。
2. 在命名空间 `app-team1` 创建 ServiceAccount `cicd-token`。
3. 创建 RoleBinding `deployment-clusterrole`，把该 ClusterRole 绑定到该 SA（仅限 app-team1 命名空间）。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl create clusterrole deployment-clusterrole --verb=create --resource=deployments,statefulsets,daemonsets
kubectl create sa cicd-token -n app-team1
kubectl create rolebinding deployment-clusterrole --clusterrole=deployment-clusterrole --serviceaccount=app-team1:cicd-token -n app-team1
CKA_META_EOF
)
