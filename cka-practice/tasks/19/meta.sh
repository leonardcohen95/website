#!/bin/bash
TITLE='用保留的 PV 创建 PVC 并恢复 MariaDB'
CATEGORY='存储'
WEIGHT=4
DESCRIPTION=$(cat <<'CKA_META_EOF'
命名空间 `mariadb` 的 Deployment `mariadb` 被误删，数据需要恢复。
1. 集群中存在唯一一个 Retain 策略的 PV `mariadb-pv`；
2. 创建 PVC `mariadb`（命名空间 mariadb，RWO，250Mi，绑定到该 PV）；
3. 修改 `~/mariadb-deployment.yaml`，挂载该 PVC 到 `/var/lib/mysql` 并应用。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get pv
# 创建 PVC（volumeName: mariadb-pv, storage: 250Mi, storageClassName: ""）
# 在 deployment 中加 volumeMounts(/var/lib/mysql) 和 volumes.persistentVolumeClaim.claimName=mariadb
kubectl apply -f ~/mariadb-deployment.yaml
CKA_META_EOF
)
