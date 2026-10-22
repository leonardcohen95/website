#!/bin/bash
TITLE='Argo CD Helm 安装 + 模板输出'
CATEGORY='生态工具'
WEIGHT=8
DESCRIPTION=$(cat <<'CKA_META_EOF'
1. helm repo add argo https://argoproj.github.io/argo-helm
2. helm template argocd argo/argo-cd --namespace argocd --version 7.7.3 --set crds.install=false > ~/argo-helm.yaml
3. helm install argocd argo/argo-cd -n argocd --version 7.7.3 --set crds.install=false
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update argo    # 若 EOF/超时重试一次
helm template argocd argo/argo-cd -n argocd --version 7.7.3 --set crds.install=false > ~/argo-helm.yaml
helm install argocd argo/argo-cd -n argocd --version 7.7.3 --set crds.install=false
CKA_META_EOF
)
