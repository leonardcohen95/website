#!/bin/bash
source /opt/cka/lib/common.sh
SA=$(kubectl get sa dev-user -n development -o name 2>/dev/null)
assert_eq "SA dev-user 存在" "serviceaccount/dev-user" "$SA"
ROLE=$(kubectl get role dev-role -n development -o json 2>/dev/null)
if [ -z "$ROLE" ]; then fail "Role dev-role 不存在"; else
  P=$(echo "$ROLE" | jq -r '.rules[]|select(.resources[]?=="pods")|.verbs|sort|join(",")' | head -1)
  assert_eq "Role 对 pods 的权限" "get,list,watch" "$P"
  D=$(echo "$ROLE" | jq -r '.rules[]|select((.resources[]?=="deployments") or (.resources[]?=="deployments.apps"))|.verbs|sort|join(",")' | head -1)
  assert_eq "Role 对 deployments 的权限" "get,list" "$D"
  S=$(echo "$ROLE" | jq -r '.rules[]|select(.resources[]?=="services")|.verbs|sort|join(",")' | head -1)
  assert_eq "Role 对 services 的权限" "get,list" "$S"
fi
RB=$(kubectl get rolebinding dev-user-binding -n development -o json 2>/dev/null)
if [ -z "$RB" ]; then fail "RoleBinding dev-user-binding 不存在"; else
  assert_eq "RoleBinding 引用 dev-role" "Role/dev-role" "$(echo "$RB" | jq -r '.roleRef.kind + "/" + .roleRef.name')"
fi
CANI=$(kubectl auth can-i get pods --as=system:serviceaccount:development:dev-user -n development 2>/dev/null)
assert_eq "SA 实际可以 get pods" "yes" "$CANI"
CANID=$(kubectl auth can-i delete pods --as=system:serviceaccount:development:dev-user -n development 2>/dev/null)
assert_eq "SA 不应能 delete pods" "no" "$CANID"
true