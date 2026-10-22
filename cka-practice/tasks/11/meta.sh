#!/bin/bash
TITLE='调整资源请求让 Pod 可调度'
CATEGORY='工作负载'
WEIGHT=2
DESCRIPTION=$(cat <<'CKA_META_EOF'
命名空间 `cka-schedule` 的 Deployment `wordpress`（3 副本）因资源请求过高导致 Pod 一直 Pending。
调整 requests，使 3 个 Pod 都能被调度并进入 Running。
（提示：先查看节点可分配容量）
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl describe node | grep -A6 Capacity
# 节点总计 2 核 / 约 3.4Gi，可分给 3 个 Pod：cpu=100m, memory=128Mi
kubectl set resources deployment wordpress -n cka-schedule --requests=cpu=100m,memory=128Mi
kubectl get pods -n cka-schedule -w
CKA_META_EOF
)
