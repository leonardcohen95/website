#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns prod
kubectl delete pod monitor-log -n prod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
mkdir -p /opt/KULM00201
rm -f /opt/KULM00201/foo
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: Pod
metadata:
  name: monitor-log
  namespace: prod
spec:
  restartPolicy: Never
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh","-c","for i in $(seq 1 5); do echo 'INFO request ok '$i; echo 'ERROR unable-to-access-website code='$i; sleep 2; done; sleep 3600"]
YAML
sleep 15
true