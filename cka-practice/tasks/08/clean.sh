#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete deployment mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pvc mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pv mariadb-pv --ignore-not-found >/dev/null 2>&1
clean_ns mariadb

true
