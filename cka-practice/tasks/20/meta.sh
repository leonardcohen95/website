#!/bin/bash
TITLE='创建 hostPath PV（ReadWriteMany）'
CATEGORY='存储'
WEIGHT=3
DESCRIPTION=$(cat <<'CKA_META_EOF'
创建 PV `app-data`：容量 2Gi，访问模式 ReadWriteMany，类型 hostPath，路径 `/srv/app-data`。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
apiVersion: v1
kind: PersistentVolume
metadata: {name: app-data}
spec:
  capacity: {storage: 2Gi}
  accessModes: ["ReadWriteMany"]
  hostPath: {path: /srv/app-data}
CKA_META_EOF
)
