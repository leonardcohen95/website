#!/bin/bash
source /opt/cka/lib/common.sh

PC=$(kubectl get priorityclass high-priority -o json 2>/dev/null)
if [ -z "$PC" ]; then fail "PriorityClass high-priority 不存在"; else
  assert_eq "value=999999999" "999999999" "$(echo "$PC" | jq -r '.value')"
fi
D=$(kubectl get deployment busybox-logger -n priority -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment busybox-logger 不存在"; else
  assert_eq "priorityClassName=high-priority" "high-priority" "$(echo "$D" | jq -r '.spec.template.spec.priorityClassName // ""')"
fi

true
