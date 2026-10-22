#!/bin/bash
TITLE='用 Helm 生成 Argo CD 清单（不装 CRD）'
CATEGORY='生态工具'
WEIGHT=10
DESCRIPTION=$(cat <<'CKA_META_EOF'
1. 添加官方 Argo CD Helm 仓库，命名为 `argo`。
2. 为 `argocd` 命名空间生成 Argo CD 7.7.3 版本的模板，保存到 `~/argo-helm.yaml`。
3. 配置为不安装 CRD（crds.install=false）。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update argo    # 若报 EOF / 超时，重试一次即可
helm template argocd argo/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false > ~/argo-helm.yaml
head -20 ~/argo-helm.yaml
CKA_META_EOF
)
