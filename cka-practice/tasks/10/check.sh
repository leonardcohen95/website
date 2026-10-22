#!/bin/bash
source /opt/cka/lib/common.sh
D=$(kubectl get deployment web-app -n cka-rollout -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment web-app 不存在"; else
  IMG=$(echo "$D" | jq -r '.spec.template.spec.containers[0].image')
  assert_eq "最终镜像已回滚到 nginx:1.25" "nginx:1.25" "$IMG"
  REV=$(echo "$D" | jq -r '.metadata.annotations["deployment.kubernetes.io/revision"]')
  assert_ge "Rollout 版本号（证明执行过更新+回滚）" 3 "${REV:-0}"
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_eq "2 个副本就绪" "2" "$READY"
fi
true