#!/bin/bash
source /opt/cka/lib/common.sh
I=$(kubectl get ingress web-ingress -n web -o json 2>/dev/null)
if [ -z "$I" ]; then fail "Ingress web-ingress 不存在于 web"; else
  assert_eq "域名正确" "app.example.com" "$(echo "$I" | jq -r '.spec.rules[0].host')"
  assert_eq "路径为 /" "/" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].path')"
  assert_eq "后端 Service 为 web-svc" "web-svc" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].backend.service.name')"
  assert_eq "后端端口为 80" "80" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].backend.service.port.number')"
fi
true