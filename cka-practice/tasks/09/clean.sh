#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete gateway web-gateway 2>/dev/null || true
kubectl delete httproute web-route 2>/dev/null || true
kubectl delete ingress web 2>/dev/null || true
kubectl delete deploy web-app >/dev/null 2>&1 || true
kubectl delete svc web >/dev/null 2>&1 || true
kubectl delete sa web-app >/dev/null 2>&1 || true
kubectl delete secret web-tls >/dev/null 2>&1 || true
kubectl delete gatewayclass nginx >/dev/null 2>&1 || true

true
