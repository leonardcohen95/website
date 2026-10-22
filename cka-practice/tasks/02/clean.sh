#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete ingress echo -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl delete svc echoserver-service -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl delete deployment echoserver -n sound-repeater --ignore-not-found >/dev/null 2>&1
clean_ns sound-repeater

true
