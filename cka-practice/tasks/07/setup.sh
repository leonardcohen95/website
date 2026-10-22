#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod kucc1 --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true