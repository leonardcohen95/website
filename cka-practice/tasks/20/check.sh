#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pv app-data -o json 2>/dev/null)
if [ -z "$P" ]; then fail "PV app-data 不存在"; else
  assert_eq "容量 2Gi" "2Gi" "$(echo "$P" | jq -r '.spec.capacity.storage')"
  assert_contains "访问模式包含 RWX" "ReadWriteMany" "$(echo "$P" | jq -r '.spec.accessModes|join(",")')"
  assert_eq "hostPath 路径" "/srv/app-data" "$(echo "$P" | jq -r '.spec.hostPath.path')"
fi
true