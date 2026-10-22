#!/bin/bash
TITLE='修复迁移后损坏的单节点集群（外部 etcd）'
CATEGORY='集群架构'
WEIGHT=0
DESCRIPTION=$(cat <<'CKA_META_EOF'
kubeadm 集群迁移到新机器后损坏，原集群使用外部 etcd。找出并修复所有损坏的组件。

本题为理论题：当前环境是 k3s 单节点（sqlite 数据存储），无法复现 kubeadm + 外部 etcd 的迁移损坏场景。
请阅读解题步骤后运行：cka done 01 标记完成。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
1) systemctl status kubelet / crictl ps -a 看组件状态
2) 检查 /etc/kubernetes/manifests/kube-apiserver.yaml 的 --etcd-servers 指向
3) 确认 --etcd-cafile/--etcd-certfile/--etcd-keyfile 路径正确
4) 保存后静态 Pod 由 kubelet 自动拉起，验证 kubectl get componentstatuses
CKA_META_EOF
)
