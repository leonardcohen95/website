#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns cka-schedule
kubectl delete deployment wordpress -n cka-schedule --ignore-not-found >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordpress
  namespace: cka-schedule
spec:
  replicas: 3
  selector:
    matchLabels: {app: wordpress}
  template:
    metadata:
      labels: {app: wordpress}
    spec:
      containers:
      - name: wordpress
        image: nginx:1.25
        resources:
          requests:
            cpu: "8"
            memory: "8Gi"
YAML
true