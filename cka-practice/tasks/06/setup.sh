#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns priority
kubectl delete priorityclass high-priority --ignore-not-found >/dev/null 2>&1
kubectl create priorityclass max-user-priority --value=1000000000 >/dev/null 2>&1 || true
kubectl delete deployment busybox-logger -n priority --ignore-not-found >/dev/null 2>&1
kubectl -n priority create deployment busybox-logger --image=busybox:1.36   -- /bin/sh -c 'while true; do sleep 30; done' >/dev/null 2>&1
kubectl rollout status deployment/busybox-logger -n priority --timeout=120s >/dev/null 2>&1

true
