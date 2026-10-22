#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns autoscale
kubectl delete deployment apache-server -n autoscale --ignore-not-found >/dev/null 2>&1
kubectl create deployment apache-server -n autoscale --image=nginx:1.25 --port=80 >/dev/null
kubectl rollout status deployment/apache-server -n autoscale --timeout=120s >/dev/null 2>&1

true
