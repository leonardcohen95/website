#!/bin/bash
kubectl delete deployment memory-pod --ignore-not-found >/dev/null 2>&1
kubectl delete pod memory-pod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true