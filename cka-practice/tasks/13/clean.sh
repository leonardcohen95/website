#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete networkpolicy --all -n backend >/dev/null 2>&1
kubectl delete deployment frontend -n frontend --ignore-not-found >/dev/null 2>&1
kubectl delete deployment backend  -n backend  --ignore-not-found >/dev/null 2>&1
clean_ns frontend; clean_ns backend
true