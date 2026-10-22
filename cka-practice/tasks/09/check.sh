#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pod memory-pod -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod memory-pod 不存在"; else
  assert_eq "镜像 nginx:latest" "nginx:latest" "$(echo "$P" | jq -r '.spec.containers[0].image')"
  assert_eq "memory request" "128Mi" "$(echo "$P" | jq -r '.spec.containers[0].resources.requests.memory')"
  assert_eq "memory limit" "256Mi" "$(echo "$P" | jq -r '.spec.containers[0].resources.limits.memory')"
  assert_eq "cpu request" "100m" "$(echo "$P" | jq -r '.spec.containers[0].resources.requests.cpu')"
  assert_eq "cpu limit" "500m" "$(echo "$P" | jq -r '.spec.containers[0].resources.limits.cpu')"
fi
true