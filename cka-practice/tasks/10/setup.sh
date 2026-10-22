#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns cka-rollout
kubectl delete deployment web-app -n cka-rollout --ignore-not-found >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: cka-rollout
spec:
  replicas: 2
  selector:
    matchLabels: {app: web}
  template:
    metadata:
      labels: {app: web}
    spec:
      containers:
      - name: web
        image: nginx:1.25
YAML
true