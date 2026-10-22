#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod web-app -n prod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
clean_ns prod
true