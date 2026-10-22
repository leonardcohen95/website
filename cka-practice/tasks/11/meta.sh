#!/bin/bash
TITLE='cert-manager CRD 列表 + 提取 subject 字段文档'
CATEGORY='集群架构'
WEIGHT=7
DESCRIPTION=$(cat <<'CKA_META_EOF'
1. kubectl get crd 列出所有 cert-manager 的 CRD，保存到 ~/resources.yaml（默认输出，不加 -o）
2. kubectl explain certificate.spec.subject，保存到 ~/subject.yaml
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get crd | grep cert-manager > ~/resources.yaml
kubectl explain certificate.spec.subject > ~/subject.yaml
CKA_META_EOF
)
