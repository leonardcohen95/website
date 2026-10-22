#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns cka-inspect
kubectl delete deployment nginx-demo -n cka-inspect --ignore-not-found >/dev/null 2>&1
kubectl create deployment nginx-demo --image=nginx:1.25 --replicas=2 -n cka-inspect >/dev/null 2>&1
kubectl rollout status deployment/nginx-demo -n cka-inspect --timeout=180s >/dev/null 2>&1 || true
rm -f "$HOME/custom-columns.txt"
true