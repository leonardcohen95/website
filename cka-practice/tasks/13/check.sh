#!/bin/bash
source /opt/cka/lib/common.sh
NP=$(kubectl get networkpolicy -n backend -o json 2>/dev/null)
CNT=$(echo "$NP" | jq '.items|length')
if [ "${CNT:-0}" -eq 0 ]; then fail "backend 命名空间没有 NetworkPolicy"; else
  OK=$(echo "$NP" | jq -r '[.items[] | select(
      (.spec.podSelector.matchLabels.app=="backend") and
      ([.spec.ingress[]?.from[]? | select(.namespaceSelector.matchLabels.name=="frontend" and .podSelector.matchLabels.app=="frontend")]|length>0)
    )]|length')
  assert_ge "存在正确的 frontend→backend 策略" 1 "${OK:-0}"
fi
true