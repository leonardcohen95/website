#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns default
kubectl delete deployment synergy-leverager --ignore-not-found >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: synergy-leverager
spec:
  replicas: 1
  selector:
    matchLabels: {app: synergy-leverager}
  template:
    metadata:
      labels: {app: synergy-leverager}
    spec:
      containers:
      - name: synergy
        image: busybox:1.36
        command: ["sh","-c","mkdir -p /var/log && touch /var/log/synergy-leverager.log && echo started >> /var/log/synergy-leverager.log && sleep 3600"]
YAML
kubectl rollout status deployment/synergy-leverager --timeout=120s >/dev/null 2>&1

true
