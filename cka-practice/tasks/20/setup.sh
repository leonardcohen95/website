#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pv app-data --ignore-not-found >/dev/null 2>&1
true