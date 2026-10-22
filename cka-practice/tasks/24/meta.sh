#!/bin/bash
TITLE='修复 NotReady 节点'
CATEGORY='故障排查'
WEIGHT=0
DESCRIPTION=$(cat <<'CKA_META_EOF'
节点 `worker-01` 状态为 NotReady，排查并恢复为 Ready（不能重启节点）。

本题为理论题：当前是单节点生产集群，不能安全复现节点故障。
请阅读解题步骤后运行：cka done 24 标记完成。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl describe node worker-01   # 看 Conditions / Events
ssh worker-01
systemctl status kubelet; journalctl -u kubelet --since "10 minutes ago" --no-pager
systemctl start kubelet; systemctl enable kubelet
systemctl status containerd; crictl ps
kubectl get nodes
CKA_META_EOF
)
