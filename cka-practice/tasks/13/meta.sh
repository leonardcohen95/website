#!/bin/bash
TITLE='NetworkPolicy：只允许 frontend 访问 backend'
CATEGORY='服务与网络'
WEIGHT=4
DESCRIPTION=$(cat <<'CKA_META_EOF'
命名空间 `frontend` 中的 Pod（label app=frontend）需要访问 `backend` 命名空间的 Pod（label app=backend）。
在 `backend` 命名空间创建 NetworkPolicy，只允许来自 frontend 命名空间、且 label app=frontend 的 Pod 入站，不要过度宽松。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
在 backend 命名空间创建：
spec:
  podSelector: {matchLabels: {app: backend}}
  ingress:
  - from:
    - namespaceSelector: {matchLabels: {name: frontend}}
      podSelector: {matchLabels: {app: frontend}}
CKA_META_EOF
)
