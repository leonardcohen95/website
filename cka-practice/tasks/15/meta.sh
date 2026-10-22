#!/bin/bash
TITLE='修复迁移后损坏的单节点集群（外部 etcd）'
CATEGORY='集群架构'
WEIGHT=0
DESCRIPTION=$(cat <<'CKA_META_EOF'
（理论题）kubeadm 集群迁移到新机器后损坏，使用外部 etcd。
修复步骤：
1. ssh 到目标节点，sudo -i 切 root
2. 检查 /etc/kubernetes/manifests/kube-apiserver.yaml 里 --etcd-servers / --etcd-cafile / --etcd-certfile / --etcd-keyfile
3. 指向新机器或正确路径，保存
4. systemctl daemon-reload && systemctl restart kubelet
5. kubectl get nodes 全 Ready
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
sudo -i
vim /etc/kubernetes/manifests/kube-apiserver.yaml
# --etcd-servers=https://127.0.0.1:2379
# --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt
# --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt
# --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key
systemctl daemon-reload && systemctl restart kubelet
kubectl get nodes
exit 2次
CKA_META_EOF
)
