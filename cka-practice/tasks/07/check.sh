#!/bin/bash
source /opt/cka/lib/common.sh
YAML_FILE=$(ls "$HOME/argo-helm.yaml" "$HOME/work/argo-helm.yaml" 2>/dev/null | head -1)
if [ -z "$YAML_FILE" ] || [ ! -s "$YAML_FILE" ]; then fail "~/argo-helm.yaml 不存在或为空"; else
  T=$(cat "$YAML_FILE")
  assert_contains "包含 Deployment 清单" "kind: Deployment" "$T"
  assert_not_contains "未安装 CRD" "kind: CustomResourceDefinition" "$T"
fi
# 可选：检查 release 是否存在
RELEASE=$(helm list -n argocd -o json 2>/dev/null | jq -r '.[] | select(.name=="argocd") | .name')
if [ -n "$RELEASE" ]; then pass "helm release argocd 已安装（可选）"; else pass "helm install 可选，已跳过"; fi
