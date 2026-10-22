#!/bin/bash
TITLE='创建含两个容器的 Pod'
CATEGORY='工作负载'
WEIGHT=3
DESCRIPTION=$(cat <<'CKA_META_EOF'
创建 Pod `kucc1`（default 命名空间），包含 2 个应用容器，镜像分别为 `redis` 和 `memcached`。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl run kucc1 --image=redis --restart=Never --dry-run=client -o yaml > kucc1.yaml
# 手动在 containers 下追加 memcached 容器，然后：
kubectl apply -f kucc1.yaml
CKA_META_EOF
)
