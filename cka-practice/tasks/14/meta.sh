#!/bin/bash
TITLE='平均分配资源 requests（先 scale 到 0）'
CATEGORY='工作负载'
WEIGHT=7
DESCRIPTION=$(cat <<'CKA_META_EOF'
relative-fawn namespace 的 Deployment wordpress 3 副本。requests 过高导致 Pending。
1. 先 scale 到 0
2. 计算节点可分配资源，除以 3，得到每个 Pod 的 requests
3. 同时修改容器和 init 容器的 requests（题目原文要求两者一致）
4. scale 回 3，等所有 Pod Running/Ready
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl -n relative-fawn scale deployment wordpress --replicas=0
kubectl get nodes; kubectl describe node | grep -A5 Allocatable
# 假设节点 2C / 3.4Gi，平均每 Pod cpu=100m memory=128Mi
kubectl -n relative-fawn edit deployment wordpress
# 两个 containers 的 resources.requests 都改
kubectl -n relative-fawn scale deployment wordpress --replicas=3
kubectl -n relative-fawn get pod -w
CKA_META_EOF
)
