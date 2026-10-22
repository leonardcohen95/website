#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns cka-init
kubectl delete pod hungry-bear -n cka-init --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
mkdir -p /opt/KUCC00108
cat <<'YAML' > /opt/KUCC00108/pod-spec-KUCC00108.yaml
apiVersion: v1
kind: Pod
metadata:
  name: hungry-bear
  namespace: cka-init
spec:
  containers:
  - name: hungry-bear
    image: busybox
    command: ["sh","-c","if [ ! -f /workdir/calm.txt ]; then echo missing; exit 1; fi; sleep 3600"]
    volumeMounts:
    - name: workdir
      mountPath: /workdir
  volumes:
  - name: workdir
    emptyDir: {}
YAML
true