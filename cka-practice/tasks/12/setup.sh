#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns nginx-static
kubectl delete deployment nginx-static -n nginx-static >/dev/null 2>&1 || true
kubectl delete configmap nginx-config -n nginx-static >/dev/null 2>&1 || true
cat > /tmp/nginx-default.conf <<'CONF'
server {
    listen 80;
    ssl_protocols TLSv1.1;
    location / { return 200 "ok"; }
}
CONF
kubectl -n nginx-static create configmap nginx-config --from-file=default.conf=/tmp/nginx-default.conf >/dev/null
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-static
  namespace: nginx-static
spec:
  replicas: 1
  selector: {matchLabels: {app: nginx-static}}
  template:
    metadata: {labels: {app: nginx-static}}
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        volumeMounts:
        - name: conf
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: conf
        configMap:
          name: nginx-config
YAML
kubectl rollout status deployment/nginx-static -n nginx-static --timeout=120s >/dev/null 2>&1

true
