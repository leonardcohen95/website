#!/bin/bash
source /opt/cka/lib/common.sh

H=$(kubectl get hpa apache-server -n autoscale -o json 2>/dev/null)
if [ -z "$H" ]; then fail "HPA apache-server 不存在"; else
  assert_eq "target CPU 使用率" "50" "$(echo "$H" | jq -r '.spec.metrics[0].resource.target.averageUtilization // 0')"
  assert_eq "minReplicas" "1" "$(echo "$H" | jq -r '.spec.minReplicas // 0')"
  assert_eq "maxReplicas" "4" "$(echo "$H" | jq -r '.spec.maxReplicas')"
  assert_eq "scaleDown stabilizationWindowSeconds=30" "30" "$(echo "$H" | jq -r '.spec.behavior.scaleDown.stabilizationWindowSeconds // 0')"
fi

true
