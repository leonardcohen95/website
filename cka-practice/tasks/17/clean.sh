#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete networkpolicy --all -n secure >/dev/null 2>&1
kubectl delete deployment web -n secure --ignore-not-found >/dev/null 2>&1
clean_ns secure
true