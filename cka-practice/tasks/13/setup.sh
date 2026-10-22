#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns frontend; kubectl label ns frontend name=frontend --overwrite >/dev/null
ensure_ns backend;  kubectl label ns backend  name=backend  --overwrite >/dev/null
kubectl delete networkpolicy --all -n backend >/dev/null 2>&1
kubectl delete deployment frontend -n frontend --ignore-not-found >/dev/null 2>&1
kubectl delete deployment backend  -n backend  --ignore-not-found >/dev/null 2>&1
kubectl create deployment frontend --image=nginx:1.25 -n frontend >/dev/null 2>&1
kubectl label pods -n frontend app=frontend --overwrite >/dev/null 2>&1
kubectl create deployment backend --image=nginx:1.25 -n backend >/dev/null 2>&1
kubectl label pods -n backend app=backend --overwrite >/dev/null 2>&1
true