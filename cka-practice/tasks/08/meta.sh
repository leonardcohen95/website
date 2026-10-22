#!/bin/bash
TITLE='用 Retain PV 创建 PVC 并恢复 MariaDB'
CATEGORY='存储'
WEIGHT=7
DESCRIPTION=$(cat <<'CKA_META_EOF'
mariadb namespace 里 Deployment 被误删。恢复步骤：
1. 已有 Retain 策略 PV mariadb-pv，先查它的 StorageClass
2. 创建 PVC mariadb（RWO，250Mi，绑定到 mariadb-pv）
3. 修改 /home/student/mariadb-deployment.yaml 挂 PVC 到 /var/lib/mysql
4. apply
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get pv
# pvc.yaml：
# name: mariadb, ns: mariadb
# accessModes: [ReadWriteOnce]
# volumeName: mariadb-pv
# storageClassName: ""（pv 没设 SC 时）
# storage: 250Mi
kubectl apply -f pvc.yaml
# 然后修改 mariadb-deployment.yaml 加 volume + volumeMounts /var/lib/mysql
CKA_META_EOF
)
