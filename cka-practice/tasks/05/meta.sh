#!/bin/bash
TITLE='Service NodePort 暴露容器端口'
CATEGORY='服务与网络'
WEIGHT=6
DESCRIPTION=$(cat <<'CKA_META_EOF'
在 spline-reticulator namespace：
1. 修改 front-end Deployment：容器 nginx 暴露 containerPort 80
2. 创建 NodePort Service front-end-svc：targetPort 80，NodePort 自动分配
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl -n spline-reticulator edit deployment front-end
# 在 containers[0] 下加：ports: [{containerPort: 80}]
kubectl -n spline-reticulator expose deployment front-end --type=NodePort --port=80 --target-port=80 --name=front-end-svc
kubectl -n spline-reticulator get svc front-end-svc -o wide
CKA_META_EOF
)
