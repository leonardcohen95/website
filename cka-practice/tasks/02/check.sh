#!/bin/bash
source /opt/cka/lib/common.sh
CR=$(kubectl get clusterrole deployment-clusterrole -o json 2>/dev/null)
if [ -z "$CR" ]; then fail "ClusterRole deployment-clusterrole 不存在"; else
  VERBS=$(echo "$CR" | jq -r '[.rules[].verbs[]]|unique|sort|join(",")')
  RES=$(echo "$CR" | jq -r '[.rules[].resources[]]|unique|sort|join(",")')
  assert_eq "ClusterRole verbs 为 create" "create" "$VERBS"
  assert_eq "ClusterRole resources 正确" "daemonsets,deployments,statefulsets" "$RES"
fi
SA=$(kubectl get sa cicd-token -n app-team1 -o name 2>/dev/null)
assert_eq "SA cicd-token 存在于 app-team1" "serviceaccount/cicd-token" "$SA"
RB=$(kubectl get rolebinding deployment-clusterrole -n app-team1 -o json 2>/dev/null)
if [ -z "$RB" ]; then fail "RoleBinding deployment-clusterrole 不存在"; else
  assert_eq "RoleBinding 引用 ClusterRole" "ClusterRole/deployment-clusterrole" "$(echo "$RB" | jq -r '.roleRef.kind + "/" + .roleRef.name')"
  assert_eq "RoleBinding 绑定到 cicd-token" "ServiceAccount/cicd-token" "$(echo "$RB" | jq -r '.subjects[0].kind + "/" + .subjects[0].name')"
fi
true