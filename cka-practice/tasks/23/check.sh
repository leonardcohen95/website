#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pod web-app -n prod -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod web-app 不存在于 prod"; else
  IMG=$(echo "$P" | jq -r '.spec.containers[0].image')
  assert_eq "镜像已修复为 nginx:1.25" "nginx:1.25" "$IMG"
  PHASE=$(echo "$P" | jq -r '.status.phase')
  assert_eq "Pod 处于 Running" "Running" "$PHASE"
  READY=$(echo "$P" | jq -r '[.status.containerStatuses[]?|select(.ready==true)]|length')
  assert_ge "容器 Ready" 1 "${READY:-0}"
  RS=$(echo "$P" | jq -r '.status.containerStatuses[0].restartCount // 0')
  echo "RESULT|1|当前重启次数：$RS（修复后应稳定）"
fi
true