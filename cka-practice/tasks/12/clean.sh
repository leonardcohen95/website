#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete deployment nginx-static -n nginx-static >/dev/null 2>&1 || true
kubectl delete configmap nginx-config -n nginx-static >/dev/null 2>&1 || true
clean_ns nginx-static

true
