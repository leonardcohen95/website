#!/bin/bash
TITLE='Ingress'
CATEGORY='服务与网络'
WEIGHT=6
DESCRIPTION=$(cat <<'CKA_META_EOF'
创建 Ingress：
- 名称 echo，Namespace sound-repeater
- Service echoserver-service，端口 8080
- Host example.org，路径 /echo，pathType Prefix
- ingressClassName 使用集群默认值
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get ingressclass
# YAML：
# apiVersion: networking.k8s.io/v1
# kind: Ingress
# metadata: {name: echo, namespace: sound-repeater}
# spec:
#   ingressClassName: traefik
#   rules:
#   - host: example.org
#     http:
#       paths:
#       - path: /echo
#         pathType: Prefix
#         backend:
#           service:
#             name: echoserver-service
#             port: {number: 8080}
kubectl apply -f ingress.yaml
CKA_META_EOF
)
