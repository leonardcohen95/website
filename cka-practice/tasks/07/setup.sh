#!/bin/bash
source /opt/cka/lib/setup.sh

kubectl delete ns argocd --wait=false >/dev/null 2>&1
kubectl create ns argocd >/dev/null 2>&1 || true
kubectl label ns argocd cka-practice=true --overwrite >/dev/null 2>&1
helm repo remove argo >/dev/null 2>&1 || true
rm -f /root/work/argo-helm.yaml /root/argo-helm.yaml

true
