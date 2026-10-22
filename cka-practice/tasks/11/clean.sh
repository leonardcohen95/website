#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment wordpress -n cka-schedule --ignore-not-found >/dev/null 2>&1
clean_ns cka-schedule
true