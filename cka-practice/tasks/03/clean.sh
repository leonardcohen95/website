#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete deployment synergy-leverager --ignore-not-found >/dev/null 2>&1

true
