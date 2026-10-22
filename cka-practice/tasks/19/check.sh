#!/bin/bash
source /opt/cka/lib/common.sh
PVC=$(kubectl get pvc mariadb -n mariadb -o json 2>/dev/null)
if [ -z "$PVC" ]; then fail "PVC mariadb 不存在"; else
  assert_eq "PVC 已绑定" "Bound" "$(echo "$PVC" | jq -r '.status.phase')"
  assert_eq "PVC 容量 250Mi" "250Mi" "$(echo "$PVC" | jq -r '.spec.resources.requests.storage')"
  assert_eq "PVC 绑定到 mariadb-pv" "mariadb-pv" "$(echo "$PVC" | jq -r '.spec.volumeName')"
  assert_contains "访问模式 RWO" "ReadWriteOnce" "$(echo "$PVC" | jq -r '.spec.accessModes|join(",")')"
fi
D=$(kubectl get deployment mariadb -n mariadb -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment mariadb 不存在"; else
  CL=$(echo "$D" | jq -r '.spec.template.spec.volumes[]? | select(.persistentVolumeClaim) | .persistentVolumeClaim.claimName' | head -1)
  assert_eq "Deployment 挂载了 PVC mariadb" "mariadb" "$CL"
  MP=$(echo "$D" | jq -r '.spec.template.spec.containers[0].volumeMounts[]? | select(.mountPath=="/var/lib/mysql") | .mountPath' | head -1)
  assert_eq "挂载路径为 /var/lib/mysql" "/var/lib/mysql" "$MP"
fi
true