#!/bin/bash
source /opt/cka/lib/common.sh

PVC=$(kubectl get pvc mariadb -n mariadb -o json 2>/dev/null)
if [ -z "$PVC" ]; then fail "PVC mariadb 不存在"; else
  assert_eq "PVC Bound" "Bound" "$(echo "$PVC" | jq -r '.status.phase')"
  assert_eq "volumeName=mariadb-pv" "mariadb-pv" "$(echo "$PVC" | jq -r '.spec.volumeName')"
  assert_eq "capacity=250Mi" "250Mi" "$(echo "$PVC" | jq -r '.spec.resources.requests.storage')"
fi
D=$(kubectl get deployment mariadb -n mariadb -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment mariadb 不存在"; else
  pass "Deployment mariadb 已应用"
  CL=$(echo "$D" | jq -r '.spec.template.spec.volumes[]? | select(.persistentVolumeClaim) | .persistentVolumeClaim.claimName')
  assert_eq "mount 了 PVC mariadb" "mariadb" "$CL"
  MP=$(echo "$D" | jq -r '.spec.template.spec.containers[0].volumeMounts[]? | select(.mountPath=="/var/lib/mysql") | .mountPath')
  assert_eq "挂载到 /var/lib/mysql" "/var/lib/mysql" "$MP"
fi

true
