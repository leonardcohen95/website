#!/bin/bash
TITLE='HPA 自动扩缩容'
CATEGORY='工作负载'
WEIGHT=7
DESCRIPTION=$(cat <<'CKA_META_EOF'
在 autoscale namespace 中创建名为 apache-server 的 Deployment，并为其创建 HPA：
- CPU 使用率目标 50%
- min=1, max=4
- scaleDown.stabilizationWindowSeconds=30
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl create ns autoscale
kubectl -n autoscale create deployment apache-server --image=nginx:1.25 --port=80
kubectl -n autoscale autoscale deployment apache-server --cpu=50% --min=1 --max=4
kubectl -n autoscale edit hpa apache-server
# 在 maxReplicas: 4 下加：
# behavior:
#   scaleDown:
#     stabilizationWindowSeconds: 30
kubectl -n autoscale get hpa
CKA_META_EOF
)
