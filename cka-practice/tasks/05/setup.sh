#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns spline-reticulator
kubectl delete deployment front-end -n spline-reticulator --ignore-not-found >/dev/null 2>&1
kubectl delete svc front-end-svc -n spline-reticulator --ignore-not-found >/dev/null 2>&1
kubectl -n spline-reticulator create deployment front-end --image=nginx:1.25 >/dev/null
kubectl rollout status deployment/front-end -n spline-reticulator --timeout=120s >/dev/null 2>&1

true
