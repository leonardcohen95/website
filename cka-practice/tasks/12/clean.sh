#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod hungry-bear -n cka-init --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
clean_ns cka-init
rm -rf /opt/KUCC00108
true