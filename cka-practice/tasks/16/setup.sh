#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns web
kubectl delete ingress web-ingress -n web --ignore-not-found >/dev/null 2>&1
kubectl delete svc web-svc -n web --ignore-not-found >/dev/null 2>&1
kubectl create deployment web --image=nginx:1.25 -n web >/dev/null 2>&1
kubectl expose deployment web --name=web-svc --port=80 -n web >/dev/null 2>&1
true