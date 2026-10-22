#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete networkpolicy --all -n backend >/dev/null 2>&1 || true
kubectl delete deployment frontend -n frontend >/dev/null 2>&1 || true
kubectl delete deployment backend  -n backend  >/dev/null 2>&1 || true
clean_ns frontend
clean_ns backend
rm -rf /home/student/netpol /root/work/netpol

true
