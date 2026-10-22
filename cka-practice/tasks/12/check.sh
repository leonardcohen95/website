#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pod hungry-bear -n cka-init -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod hungry-bear 不存在于 cka-init"; else
  N=$(echo "$P" | jq '.spec.initContainers|length')
  assert_ge "存在 init container" 1 "${N:-0}"
  IMG=$(echo "$P" | jq -r '.spec.initContainers[0].image')
  assert_contains "init 容器镜像为 busybox" "busybox" "$IMG"
  PHASE=$(echo "$P" | jq -r '.status.phase')
  assert_eq "Pod 处于 Running" "Running" "$PHASE"
fi
true