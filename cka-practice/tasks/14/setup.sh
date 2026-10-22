#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns relative-fawn
kubectl delete deployment wordpress -n relative-fawn >/dev/null 2>&1 || true
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordpress
  namespace: relative-fawn
spec:
  replicas: 3
  selector: {matchLabels: {app: wordpress}}
  template:
    metadata: {labels: {app: wordpress}}
    spec:
      initContainers:
      - name: init
        image: busybox:1.36
        command: ["sh","-c","echo init"]
        resources:
          requests: {cpu: "8", memory: "8Gi"}
          limits:   {cpu: "8", memory: "8Gi"}
      containers:
      - name: wordpress
        image: nginx:1.25
        resources:
          requests: {cpu: "8", memory: "8Gi"}
          limits:   {cpu: "8", memory: "8Gi"}
YAML

true
