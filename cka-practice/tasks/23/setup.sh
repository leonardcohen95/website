#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns prod
kubectl delete pod web-app -n prod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: Pod
metadata:
  name: web-app
  namespace: prod
  labels: {app: web-app}
spec:
  containers:
  - name: web
    image: busybox:1.36
    command: ["sh","-c","echo 'starting web-app...'; exit 1"]
YAML
true