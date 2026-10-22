#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete ingress web-ingress -n web --ignore-not-found >/dev/null 2>&1
kubectl delete svc web-svc -n web --ignore-not-found >/dev/null 2>&1
kubectl delete deployment web -n web --ignore-not-found >/dev/null 2>&1
clean_ns web
true