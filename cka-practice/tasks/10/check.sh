#!/bin/bash
source /opt/cka/lib/common.sh

NP=$(kubectl get networkpolicy -n backend -o json 2>/dev/null)
if [ -z "$NP" ]; then fail "backend namespace 没有 NetworkPolicy"; else
  # 至少有一个策略是允许 app=backend Pod 接受来自 frontend namespace + app=frontend Pod 入站
  OK=$(echo "$NP" | jq -r '[.items[] | select(
      (.spec.podSelector.matchLabels.app=="backend") and
      ([.spec.ingress[]?.from[]? | select(.namespaceSelector.matchLabels.name=="frontend" and .podSelector.matchLabels.app=="frontend")]|length>0)
    )]|length')
  assert_ge "应用了正确的 frontend→backend 策略" 1 "${OK:-0}"
  # 确认默认拒绝策略没被删除
  DENY=$(echo "$NP" | jq -r '[.items[] | select(.metadata.name=="deny-all-ingress")]|length')
  assert_eq "未删除默认 deny-all-ingress" "1" "${DENY}"
fi
# 确认样本文件没被用户删/改
for f in netpol1.yaml netpol2.yaml netpol3.yaml; do
  if [ ! -f "/home/student/netpol/$f" ]; then fail "/home/student/netpol/$f 被删除"; fi
done
pass "三个样本文件都还在"

true
