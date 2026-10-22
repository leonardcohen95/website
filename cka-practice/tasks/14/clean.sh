#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete deployment wordpress -n relative-fawn >/dev/null 2>&1 || true
clean_ns relative-fawn

true
