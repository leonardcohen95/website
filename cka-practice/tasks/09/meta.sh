#!/bin/bash
TITLE='创建带资源限制的 Pod'
CATEGORY='工作负载'
WEIGHT=2
DESCRIPTION=$(cat <<'CKA_META_EOF'
创建 Pod `memory-pod`（default），镜像 `nginx:latest`：
- memory request 128Mi，limit 256Mi
- CPU request 100m，limit 500m
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl run memory-pod --image=nginx:latest --restart=Never --dry-run=client -o yaml > memory-pod.yaml
# 然后在 containers[0] 下加入：
#   resources:
#     requests: {memory: 128Mi, cpu: 100m}
#     limits:   {memory: 256Mi, cpu: 500m}
kubectl apply -f memory-pod.yaml
CKA_META_EOF
)
