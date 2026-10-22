#!/bin/bash
source /opt/cka/lib/common.sh

D=$(kubectl get deployment front-end -n spline-reticulator -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment front-end 不存在"; else
  P=$(echo "$D" | jq -r '.spec.template.spec.containers[0].ports[]? | select(.containerPort==80) | .containerPort')
  assert_eq "Deployment 暴露 containerPort 80" "80" "$P"
fi
S=$(kubectl get svc front-end-svc -n spline-reticulator -o json 2>/dev/null)
if [ -z "$S" ]; then fail "Service front-end-svc 不存在"; else
  assert_eq "Service 类型 NodePort" "NodePort" "$(echo "$S" | jq -r '.spec.type')"
  assert_eq "port=80" "80" "$(echo "$S" | jq -r '.spec.ports[0].port')"
  assert_eq "targetPort=80" "80" "$(echo "$S" | jq -r '.spec.ports[0].targetPort')"
fi

true
