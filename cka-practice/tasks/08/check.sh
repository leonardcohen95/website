#!/bin/bash
source /opt/cka/lib/common.sh
N=$(kubectl get ns development -o name 2>/dev/null)
assert_eq "命名空间 development 存在" "namespace/development" "$N"
P=$(kubectl get pod nginx -n development -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod nginx 不存在于 development"; else
  assert_contains "镜像为 nginx" "nginx" "$(echo "$P" | jq -r '.spec.containers[0].image')"
  assert_eq "Pod 不重启策略" "Never" "$(echo "$P" | jq -r '.spec.restartPolicy')"
fi
true