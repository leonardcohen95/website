#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns secure
kubectl delete networkpolicy --all -n secure >/dev/null 2>&1
kubectl create deployment web --image=nginx:1.25 -n secure >/dev/null 2>&1
kubectl label pods -n secure app=web --overwrite >/dev/null 2>&1
true