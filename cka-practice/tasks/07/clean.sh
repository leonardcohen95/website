#!/bin/bash
source /opt/cka/lib/setup.sh

helm uninstall argocd -n argocd >/dev/null 2>&1 || true
helm repo remove argo >/dev/null 2>&1 || true
kubectl delete ns argocd --wait=false >/dev/null 2>&1
rm -f /root/work/argo-helm.yaml /root/argo-helm.yaml

true
