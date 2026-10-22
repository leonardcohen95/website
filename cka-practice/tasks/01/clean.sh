#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete hpa apache-server -n autoscale --ignore-not-found >/dev/null 2>&1
kubectl delete deployment apache-server -n autoscale --ignore-not-found >/dev/null 2>&1
clean_ns autoscale

true
