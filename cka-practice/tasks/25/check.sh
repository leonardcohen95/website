#!/bin/bash
source /opt/cka/lib/common.sh
if [ -s "$HOME/argo-helm.yaml" ]; then
  pass "argo-helm.yaml 已创建"
  T=$(cat "$HOME/argo-helm.yaml")
  assert_contains "包含 Deployment 清单" "kind: Deployment" "$T"
  assert_not_contains "未安装 CRD" "kind: CustomResourceDefinition" "$T"
  assert_contains "包含 argocd 命名空间" "namespace: argocd" "$T"
else
  fail "~/argo-helm.yaml 不存在或为空"
fi
true