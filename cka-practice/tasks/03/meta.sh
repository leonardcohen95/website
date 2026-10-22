#!/bin/bash
TITLE='用 kubeadm 升级控制面节点'
CATEGORY='集群架构'
WEIGHT=0
DESCRIPTION=$(cat <<'CKA_META_EOF'
将控制面节点从 v1.29.x 升级到 v1.30.0，并升级该节点上的 kubelet 和 kubectl。

本题为理论题：当前为 k3s 集群，升级方式与 kubeadm 不同，无法实操。
请阅读解题步骤后运行：cka done 03 标记完成。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
apt-get update
apt-cache madison kubeadm | grep 1.30
apt-get install -y kubeadm=1.30.0-1.1
kubeadm upgrade plan
kubeadm upgrade apply v1.30.0
kubectl drain <cp-node> --ignore-daemonsets --delete-emptydir-data
apt-get install -y kubelet=1.30.0-1.1 kubectl=1.30.0-1.1
systemctl daemon-reload && systemctl restart kubelet
kubectl uncordon <cp-node>
CKA_META_EOF
)
