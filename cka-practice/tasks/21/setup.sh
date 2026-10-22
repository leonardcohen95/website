#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pvc pvc-data -n default --ignore-not-found >/dev/null 2>&1
kubectl delete pv pv-data --ignore-not-found >/dev/null 2>&1
true