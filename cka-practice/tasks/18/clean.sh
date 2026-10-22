#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment nginx-demo -n cka-inspect --ignore-not-found >/dev/null 2>&1
clean_ns cka-inspect
rm -f "$HOME/custom-columns.txt"
true