#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns development
kubectl delete pod nginx -n development --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true