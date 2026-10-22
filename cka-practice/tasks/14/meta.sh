#!/bin/bash
TITLE='更新 ConfigMap 的 TLS 配置并滚动重启'
CATEGORY='服务与网络'
WEIGHT=4
DESCRIPTION=$(cat <<'CKA_META_EOF'
命名空间 `nginx-static` 的 Deployment `nginx-static` 使用 ConfigMap `nginx-config`。
更新该 ConfigMap，使其允许 TLSv1.2（ssl_protocols 包含 TLSv1.2），并滚动重启 Deployment 使配置生效。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get cm nginx-config -n nginx-static -o yaml > cm.yaml
# 编辑 ssl_protocols 行，加入 TLSv1.2
kubectl apply -f cm.yaml
kubectl rollout restart deployment/nginx-static -n nginx-static
kubectl rollout status deployment/nginx-static -n nginx-static
CKA_META_EOF
)
