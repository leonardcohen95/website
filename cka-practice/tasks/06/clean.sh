#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete priorityclass high-priority --ignore-not-found >/dev/null 2>&1
kubectl delete priorityclass max-user-priority --ignore-not-found >/dev/null 2>&1
kubectl delete deployment busybox-logger -n priority --ignore-not-found >/dev/null 2>&1
clean_ns priority

true
