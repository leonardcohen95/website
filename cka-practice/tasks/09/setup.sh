#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns default
kubectl delete gateway web-gateway 2>/dev/null || kubectl delete gateway web-gateway -o jsonpath={.metadata.name} >/dev/null 2>&1 || true
kubectl delete httproute web-route 2>/dev/null || true
kubectl delete ingress web 2>/dev/null || true

# 建 GatewayClass
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata: {name: nginx}
spec:
  controllerName: traefik.io/gateway-controller
YAML

# 生成 TLS 证书和 secret
openssl req -x509 -nodes -newkey rsa:2048 -keyout /tmp/tls.key -out /tmp/tls.crt -days 1 -subj '/CN=gateway.web.k8s.local' 2>/dev/null || true
CRT_B64=$(base64 -w0 /tmp/tls.crt)
KEY_B64=$(base64 -w0 /tmp/tls.key)
kubectl delete secret web-tls 2>/dev/null || true
kubectl create secret tls web-tls --cert=/tmp/tls.crt --key=/tmp/tls.key >/dev/null 2>&1 ||   kubectl apply -f - >/dev/null <<EOT
apiVersion: v1
kind: Secret
metadata: {name: web-tls}
type: kubernetes.io/tls
data:
  tls.crt: $CRT_B64
  tls.key: $KEY_B64
EOT

cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: ServiceAccount
metadata: {name: web-app}
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: web-app}
spec:
  replicas: 1
  selector: {matchLabels: {app: web-app}}
  template:
    metadata: {labels: {app: web-app}}
    spec:
      serviceAccountName: web-app
      containers:
      - name: web
        image: nginx:1.25
---
apiVersion: v1
kind: Service
metadata: {name: web}
spec:
  selector: {app: web-app}
  ports: [{port: 80}]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: {name: web}
spec:
  ingressClassName: traefik
  tls: [{hosts: [gateway.web.k8s.local], secretName: web-tls}]
  rules:
  - host: gateway.web.k8s.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend: {service: {name: web, port: {number: 80}}}
YAML
kubectl rollout status deployment/web-app --timeout=120s >/dev/null 2>&1
echo SETUP_DONE
