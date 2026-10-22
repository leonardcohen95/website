#!/bin/bash
TITLE='更新 ConfigMap TLS 配置 + rollout restart'
CATEGORY='服务与网络'
WEIGHT=6
DESCRIPTION=$(cat <<'CKA_META_EOF'
nginx-static namespace 的 nginx-static Deployment 用 ConfigMap nginx-config。
1. 修改 nginx-config：ssl_protocols 改为 TLSv1.2 TLSv1.3
2. 设置 nginx-config 为 immutable
3. rollout restart Deployment nginx-static 让配置生效
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl -n nginx-static edit configmap nginx-config
# data.default.conf 里把 ssl_protocols 改成 TLSv1.2 TLSv1.3
# 顶层加 immutable: true
kubectl -n nginx-static rollout restart deployment nginx-static
CKA_META_EOF
)
