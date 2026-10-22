#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pod kucc1 -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod kucc1 不存在"; else
  N=$(echo "$P" | jq '.spec.containers|length')
  assert_eq "容器数量为 2" "2" "$N"
  IMGS=$(echo "$P" | jq -r '[.spec.containers[].image]|sort|join(",")')
  assert_contains "包含 redis 镜像" "redis" "$IMGS"
  assert_contains "包含 memcached 镜像" "memcached" "$IMGS"
fi
true