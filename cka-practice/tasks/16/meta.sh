#!/bin/bash
TITLE='创建 Ingress'
CATEGORY='服务与网络'
WEIGHT=3
DESCRIPTION=$(cat <<'CKA_META_EOF'
在命名空间 `web` 创建 Ingress `web-ingress`：
- 域名 `app.example.com`
- 路径 `/` 转发到 Service `web-svc` 的 80 端口
（IngressClass 使用集群已有的 traefik）
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl create ingress web-ingress -n web --rule="app.example.com/=web-svc:80" --class=traefik
# 或手写 YAML（ingressClassName: traefik）
CKA_META_EOF
)
