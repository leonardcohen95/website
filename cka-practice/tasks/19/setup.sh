#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns mariadb
kubectl delete deployment mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pvc mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pv mariadb-pv --ignore-not-found >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mariadb-pv
spec:
  capacity: {storage: 1Gi}
  accessModes: ["ReadWriteOnce"]
  persistentVolumeReclaimPolicy: Retain
  storageClassName: ""
  hostPath: {path: /mnt/mariadb}
YAML
cat <<'YAML' > "$HOME/mariadb-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mariadb
  namespace: mariadb
spec:
  replicas: 1
  selector:
    matchLabels: {app: mariadb}
  template:
    metadata:
      labels: {app: mariadb}
    spec:
      containers:
      - name: mariadb
        image: busybox:1.36
        command: ["sh","-c","sleep 3600"]
YAML
true