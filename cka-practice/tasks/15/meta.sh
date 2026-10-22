#!/bin/bash
TITLE='统计可调度的 Ready 节点数'
CATEGORY='服务与网络'
WEIGHT=3
DESCRIPTION=$(cat <<'CKA_META_EOF'
统计集群中「Ready 且可调度」的节点数量（排除带 NoSchedule 污点的节点），
将数字写入 `/opt/KUSC00402/kusc00402.txt`。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get nodes
kubectl describe nodes | grep -i taint
# 总数 - NoSchedule 数 = 可调度数
echo <数字> > /opt/KUSC00402/kusc00402.txt
CKA_META_EOF
)
