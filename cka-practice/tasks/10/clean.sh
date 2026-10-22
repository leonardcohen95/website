#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment web-app -n cka-rollout --ignore-not-found >/dev/null 2>&1
clean_ns cka-rollout
true