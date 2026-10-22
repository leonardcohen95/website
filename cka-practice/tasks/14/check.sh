#!/bin/bash
source /opt/cka/lib/common.sh
CM=$(kubectl get cm nginx-config -n nginx-static -o json 2>/dev/null)
if [ -z "$CM" ]; then fail "ConfigMap nginx-config 不存在"; else
  DATA=$(echo "$CM" | jq -r '.data["default.conf"] // .data | tostring')
  assert_contains "ConfigMap 允许 TLSv1.2" "TLSv1.2" "$DATA"
  assert_not_contains "已移除单独的 TLSv1.1" "ssl_protocols TLSv1.1;" "$DATA"
fi
D=$(kubectl get deployment nginx-static -n nginx-static -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment nginx-static 不存在"; else
  RA=$(echo "$D" | jq -r '.spec.template.metadata.annotations["kubectl.kubernetes.io/restartedAt"] // ""')
  if [ -n "$RA" ]; then pass "Deployment 已滚动重启（restartedAt=$RA）"; else fail "Deployment 未滚动重启"; fi
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_ge "Deployment 就绪" 1 "${READY:-0}"
fi
true