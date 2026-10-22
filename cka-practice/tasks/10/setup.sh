#!/bin/bash
source /opt/cka/lib/setup.sh

ensure_ns frontend; kubectl label ns frontend name=frontend --overwrite >/dev/null
ensure_ns backend;  kubectl label ns backend  name=backend  --overwrite
kubectl delete networkpolicy --all -n backend >/dev/null 2>&1
kubectl delete deployment frontend -n frontend >/dev/null 2>&1 || true
kubectl delete deployment backend  -n backend  >/dev/null 2>&1 || true
kubectl -n frontend create deployment frontend --image=nginx:1.25 >/dev/null && kubectl label pods -n frontend app=frontend --overwrite >/dev/null 2>&1
kubectl -n backend  create deployment backend  --image=nginx:1.25 >/dev/null && kubectl label pods -n backend  app=backend  --overwrite >/dev/null 2>&1
# 默认拒绝所有入站流量（让用户的策略能应用）
kubectl -n backend apply -f - >/dev/null <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: deny-all-ingress}
spec:
  podSelector: {}
  policyTypes: [Ingress]
YAML
# 默认拒绝所有出站流量（按题目原文）
kubectl -n backend apply -f - >/dev/null <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: deny-all-egress}
spec:
  podSelector: {}
  policyTypes: [Egress]
YAML
# 预置 3 个样本 YAML
mkdir -p /home/student/netpol /root/work/netpol
cp -r /home/student/netpol/. /root/work/netpol/ 2>/dev/null
cat > /home/student/netpol/netpol1.yaml <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all
  namespace: backend
spec:
  podSelector: {}
  policyTypes: [Ingress]
  ingress:
  - {}
YAML
cat > /home/student/netpol/netpol2.yaml <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-from-frontend
  namespace: backend
spec:
  podSelector:
    matchLabels: {app: backend}
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector: {matchLabels: {app: frontend}}
    to:
    - ports: [{port: 443}]
YAML
cat > /home/student/netpol/netpol3.yaml <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: backend
spec:
  podSelector:
    matchLabels: {app: backend}
  policyTypes: [Ingress]
  ingress:
  - from:
    - namespaceSelector: {matchLabels: {name: frontend}}
      podSelector: {matchLabels: {app: frontend}}
YAML
cp -r /home/student/netpol/. /root/work/netpol/ 2>/dev/null || true
kubectl rollout status deployment/frontend -n frontend --timeout=120s >/dev/null 2>&1 || true
kubectl rollout status deployment/backend  -n backend  --timeout=120s >/dev/null 2>&1 || true

true
