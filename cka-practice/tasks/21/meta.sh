#!/bin/bash
TITLE='创建 PV + PVC 并绑定'
CATEGORY='存储'
WEIGHT=3
DESCRIPTION=$(cat <<'CKA_META_EOF'
1. 创建 PV `pv-data`：2Gi，ReadWriteOnce，回收策略 Retain，hostPath `/mnt/data`。
2. 在 default 命名空间创建 PVC `pvc-data`：1Gi，ReadWriteOnce，状态应为 Bound。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
先创建 PV（persistentVolumeReclaimPolicy: Retain, storageClassName: ""），
再创建 PVC（storageClassName: ""），kubectl get pvc pvc-data 应为 Bound。
CKA_META_EOF
)
