#!/bin/bash
TITLE='Gateway API 迁移 Ingress'
CATEGORY='服务与网络'
WEIGHT=8
DESCRIPTION=$(cat <<'CKA_META_EOF'
将现有名为 web 的 Ingress 迁移到 Gateway API，保持 host + TLS + 路由：
1. 创建 Gateway web-gateway，host gateway.web.k8s.local
2. 创建 HTTPRoute web-route，保持原 Ingress 的路由规则
3. 删除旧 Ingress web
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get ingress web -o yaml   # 抄 host/TLS/paths/service/port
# gateway.yaml + httproute.yaml
kubectl apply -f gateway.yaml
kubectl apply -f httproute.yaml
kubectl delete ingress web
CKA_META_EOF
)
