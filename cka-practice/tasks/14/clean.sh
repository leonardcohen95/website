#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment nginx-static -n nginx-static --ignore-not-found >/dev/null 2>&1
kubectl delete cm nginx-config -n nginx-static --ignore-not-found >/dev/null 2>&1
clean_ns nginx-static
true