#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete sa dev-user -n development --ignore-not-found >/dev/null 2>&1
kubectl delete role dev-role -n development --ignore-not-found >/dev/null 2>&1
kubectl delete rolebinding dev-user-binding -n development --ignore-not-found >/dev/null 2>&1
clean_ns development
true