#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod memory-pod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true