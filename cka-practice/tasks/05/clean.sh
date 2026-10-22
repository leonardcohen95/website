#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete deployment front-end -n spline-reticulator --ignore-not-found >/dev/null 2>&1
kubectl delete svc front-end-svc -n spline-reticulator --ignore-not-found >/dev/null 2>&1
clean_ns spline-reticulator

true
