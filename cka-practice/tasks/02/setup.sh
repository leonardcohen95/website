#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns sound-repeater
kubectl delete ingress echo -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl delete svc echoserver-service -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl delete deployment echoserver -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl -n sound-repeater create deployment echoserver --image=nginx:1.25 --port=8080 >/dev/null
kubectl -n sound-repeater expose deployment echoserver --name=echoserver-service --port=8080 --target-port=8080 >/dev/null
kubectl rollout status deployment/echoserver -n sound-repeater --timeout=120s >/dev/null 2>&1

true
