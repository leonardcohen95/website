#!/bin/bash
source /opt/cka/lib/common.sh
D=$(kubectl get deployment synergy-leverager -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment synergy-leverager 不存在"; else
  N=$(echo "$D" | jq ".spec.template.spec.containers | length")
  assert_ge "容器数 >= 2（有 sidecar）" 2 "$N"
  S=$(echo "$D" | jq -r '.spec.template.spec.containers[] | select(.name=="sidecar") | .image' | head -1)
  assert_contains "sidecar 容器用 busybox" "busybox" "$S"
  CMD=$(echo "$D" | jq -r '.spec.template.spec.containers[] | select(.name=="sidecar") | (.args//[]) + (.command//[]) | join(" ")')
  assert_contains "sidecar 命令 tail 日志" "tail" "$CMD"
  assert_contains "sidecar 命令包含 /var/log" "/var/log" "$CMD"
  VMN=$(echo "$D" | jq -r '.spec.template.spec.volumes[].name // ""' 2>/dev/null | tr '\n' ' ')
  assert_contains "存在 varlog 卷" "varlog" "$VMN"
fi
