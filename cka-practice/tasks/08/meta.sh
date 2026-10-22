#!/bin/bash
TITLE='创建命名空间并运行 Pod'
CATEGORY='工作负载'
WEIGHT=3
DESCRIPTION=$(cat <<'CKA_META_EOF'
创建命名空间 `development`，并在其中运行镜像为 `nginx` 的 Pod `nginx`（restartPolicy 为 `Never`）。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl create namespace development
kubectl run nginx --image=nginx --restart=Never -n development
CKA_META_EOF
)
