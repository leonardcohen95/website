#!/bin/bash
TITLE='StorageClass + 默认类'
CATEGORY='存储'
WEIGHT=7
DESCRIPTION=$(cat <<'CKA_META_EOF'
创建 StorageClass ran-local-path：
- provisioner: rancher.io/local-path
- volumeBindingMode: WaitForFirstConsumer
- 设置为集群默认 StorageClass
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get storageclass
# YAML：
# apiVersion: storage.k8s.io/v1
# kind: StorageClass
# metadata:
#   name: ran-local-path
#   annotations: {storageclass.kubernetes.io/is-default-class: "true"}
# provisioner: rancher.io/local-path
# volumeBindingMode: WaitForFirstConsumer
kubectl apply -f storage.yaml
kubectl get storageclass
CKA_META_EOF
)
