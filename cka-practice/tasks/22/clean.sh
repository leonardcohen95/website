#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod monitor-log -n prod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
rm -rf /opt/KULM00201
clean_ns prod
true