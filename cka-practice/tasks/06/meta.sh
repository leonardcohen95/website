#!/bin/bash
TITLE='列出 cert-manager CRD 并提取字段说明'
CATEGORY='集群架构'
WEIGHT=7
DESCRIPTION=$(cat <<'CKA_META_EOF'
1. 列出所有 cert-manager 相关 CRD，保存到 `~/resources.yaml`（使用默认输出格式，不加 -o）。
2. 将 Certificate CR 的 `spec.subject` 字段说明输出到 `~/subject.yaml`。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get crd | grep cert-manager | awk '{print $1}' | xargs kubectl get crd > ~/resources.yaml
kubectl explain certificate.spec.subject > ~/subject.yaml
CKA_META_EOF
)
