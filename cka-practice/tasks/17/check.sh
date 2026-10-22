#!/bin/bash
source /opt/cka/lib/common.sh
D=$(kubectl get networkpolicy deny-all-ingress -n secure -o json 2>/dev/null)
if [ -z "$D" ]; then fail "deny-all-ingress 不存在"; else
  assert_eq "deny-all-ingress 的 podSelector 为空" "{}" "$(echo "$D" | jq -c '.spec.podSelector')"
  assert_contains "包含 Ingress 策略类型" "Ingress" "$(echo "$D" | jq -r '.spec.policyTypes|join(",")')"
  assert_eq "deny-all-ingress 没有放行规则" "0" "$(echo "$D" | jq '.spec.ingress|length')"
fi
A=$(kubectl get networkpolicy allow-web-ingress -n secure -o json 2>/dev/null)
if [ -z "$A" ]; then fail "allow-web-ingress 不存在"; else
  assert_eq "允许 role=frontend" "frontend" "$(echo "$A" | jq -r '.spec.ingress[0].from[0].podSelector.matchLabels.role')"
  assert_eq "允许端口 80" "80" "$(echo "$A" | jq -r '.spec.ingress[0].ports[0].port')"
fi
true