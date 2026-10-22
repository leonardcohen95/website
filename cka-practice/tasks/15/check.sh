#!/bin/bash
source /opt/cka/lib/common.sh
EXP=$(kubectl get nodes -o json | jq -r '[.items[] | select((.status.conditions[]|select(.type=="Ready").status)=="True") | select(([.spec.taints[]?|select(.effect=="NoSchedule")]|length)==0)] | length')
if [ -f /opt/KUSC00402/kusc00402.txt ]; then
  GOT=$(tr -d ' 
' < /opt/KUSC00402/kusc00402.txt)
  assert_eq "文件中的可调度节点数正确" "$EXP" "$GOT"
else
  fail "/opt/KUSC00402/kusc00402.txt 不存在"
fi
true