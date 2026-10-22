#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete storageclass ran-local-path --ignore-not-found >/dev/null 2>&1

true
