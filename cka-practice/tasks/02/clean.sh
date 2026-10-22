#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete clusterrole deployment-clusterrole --ignore-not-found >/dev/null 2>&1
kubectl delete rolebinding deployment-clusterrole -n app-team1 --ignore-not-found >/dev/null 2>&1
kubectl delete sa cicd-token -n app-team1 --ignore-not-found >/dev/null 2>&1
clean_ns app-team1
true