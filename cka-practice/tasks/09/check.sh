#!/bin/bash
source /opt/cka/lib/common.sh
if kubectl get ingress web >/dev/null 2>&1; then fail "旧 Ingress web 未删除"; else pass "旧 Ingress web 已删除"; fi
GW=$(kubectl get gateway web-gateway -o json 2>/dev/null)
if [ -z "$GW" ]; then fail "Gateway web-gateway 不存在"; else
  assert_eq "gatewayClass=nginx" "nginx" "$(echo "$GW" | jq -r '.spec.gatewayClassName')"
  assert_eq "host=gateway.web.k8s.local" "gateway.web.k8s.local" "$(echo "$GW" | jq -r '.spec.listeners[0].hostname')"
fi
HR=$(kubectl get httproute web-route -o json 2>/dev/null)
if [ -z "$HR" ]; then fail "HTTPRoute web-route 不存在"; else
  assert_eq "host=gateway.web.k8s.local" "gateway.web.k8s.local" "$(echo "$HR" | jq -r '.spec.hostnames[0]')"
  assert_eq "backend service=web" "web" "$(echo "$HR" | jq -r '.spec.rules[0].backendRefs[0].name')"
  assert_eq "backend port=80" "80" "$(echo "$HR" | jq -r '.spec.rules[0].backendRefs[0].port // 0')"
fi
