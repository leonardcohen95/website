#!/bin/bash
TITLE='etcd 数据备份'
CATEGORY='集群架构'
WEIGHT=0
DESCRIPTION=$(cat <<'CKA_META_EOF'
将 etcd 数据备份到 /opt/etcd-snapshot.db。
etcd 端点 https://127.0.0.1:2379，证书位于 /etc/kubernetes/pki/etcd/。

本题为理论题：当前 k3s 使用 sqlite（/var/lib/rancher/k3s/server/db/state.db），没有独立 etcdctl 端点。
请阅读解题步骤后运行：cka done 04 标记完成。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
ETCDCTL_API=3 etcdctl snapshot save /opt/etcd-snapshot.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key
ETCDCTL_API=3 etcdctl snapshot status /opt/etcd-snapshot.db --write-out=table
CKA_META_EOF
)
