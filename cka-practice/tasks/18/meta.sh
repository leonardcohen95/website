#!/bin/bash
TITLE='用 custom-columns 输出 Pod 信息'
CATEGORY='服务与网络'
WEIGHT=2
DESCRIPTION=$(cat <<'CKA_META_EOF'
命名空间 `cka-inspect` 中有若干 nginx Pod。
用 `custom-columns` 列出 Pod 名称和状态，列名分别为 `POD_NAME`、`POD_STATUS`，
将输出保存到 `~/custom-columns.txt`。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get po -n cka-inspect -o=custom-columns="POD_NAME:.metadata.name,POD_STATUS:.status.containerStatuses[].state" > ~/custom-columns.txt
CKA_META_EOF
)
