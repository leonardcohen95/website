#!/bin/bash
source /opt/cka/lib/common.sh

D=$(kubectl get deployment wordpress -n relative-fawn -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment wordpress 不存在"; else
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_eq "3 副本 Ready" "3" "$READY"
  REQ_CPU=$(echo "$D" | jq -r '.spec.template.spec.containers[0].resources.requests.cpu')
  REQ_MEM=$(echo "$D" | jq -r '.spec.template.spec.containers[0].resources.requests.memory')
  assert_ne "requests.cpu 不再是 8" "8" "$REQ_CPU"
  assert_ne "requests.memory 不再是 8Gi" "8Gi" "$REQ_MEM"
  INIT_CPU=$(echo "$D" | jq -r '.spec.template.spec.initContainers[0].resources.requests.cpu')
  INIT_MEM=$(echo "$D" | jq -r '.spec.template.spec.initContainers[0].resources.requests.memory')
  assert_eq "init 容器与主容器 cpu requests 一致" "$REQ_CPU" "$INIT_CPU"
  assert_eq "init 容器与主容器 memory requests 一致" "$REQ_MEM" "$INIT_MEM"
fi

true
