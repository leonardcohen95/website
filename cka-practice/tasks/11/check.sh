#!/bin/bash
source /opt/cka/lib/common.sh
D=$(kubectl get deployment wordpress -n cka-schedule -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment wordpress 不存在"; else
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_eq "3 个 Pod 全部就绪" "3" "$READY"
  CPU=$(echo "$D" | jq -r '.spec.template.spec.containers[0].resources.requests.cpu')
  MEM=$(echo "$D" | jq -r '.spec.template.spec.containers[0].resources.requests.memory')
  echo "RESULT|1|当前 requests: cpu=$CPU memory=$MEM"
fi
true