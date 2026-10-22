#!/bin/bash
source /opt/cka/lib/common.sh
CM=$(kubectl get cm nginx-config -n nginx-static -o json 2>/dev/null)
if [ -z "$CM" ]; then fail "ConfigMap nginx-config 不存在"; else
  DATA=$(echo "$CM" | jq -r '.data["default.conf"] // ""')
  assert_contains "ssl_protocols 包含 TLSv1.2" "TLSv1.2" "$DATA"
  assert_contains "ssl_protocols 包含 TLSv1.3" "TLSv1.3" "$DATA"
  assert_not_contains "已移除 TLSv1.1" "ssl_protocols TLSv1.1" "$DATA"
  assert_eq "ConfigMap immutable=true" "true" "$(echo "$CM" | jq -r '.immutable // false')"
fi
D=$(kubectl get deployment nginx-static -n nginx-static -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment 不存在"; else
  REV=$(echo "$D" | jq -r '.metadata.annotations["deployment.kubernetes.io/revision"] // 1')
  assert_ge "已执行 rollout restart（revision>=2）" 2 "${REV:-1}"
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_ge "Deployment 就绪" 1 "${READY:-0}"
fi
