#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pv pv-data -o json 2>/dev/null)
if [ -z "$P" ]; then fail "PV pv-data 不存在"; else
  assert_eq "PV 容量 2Gi" "2Gi" "$(echo "$P" | jq -r '.spec.capacity.storage')"
  assert_contains "PV 访问模式 RWO" "ReadWriteOnce" "$(echo "$P" | jq -r '.spec.accessModes|join(",")')"
  assert_eq "PV 回收策略 Retain" "Retain" "$(echo "$P" | jq -r '.spec.persistentVolumeReclaimPolicy')"
  assert_eq "PV hostPath 路径" "/mnt/data" "$(echo "$P" | jq -r '.spec.hostPath.path')"
fi
C=$(kubectl get pvc pvc-data -n default -o json 2>/dev/null)
if [ -z "$C" ]; then fail "PVC pvc-data 不存在"; else
  assert_eq "PVC 状态 Bound" "Bound" "$(echo "$C" | jq -r '.status.phase')"
  assert_eq "PVC 容量 1Gi" "1Gi" "$(echo "$C" | jq -r '.spec.resources.requests.storage')"
fi
true