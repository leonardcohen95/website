#!/bin/bash
TITLE='安装 Calico 3.28.2（CNI 替换）'
CATEGORY='网络基础'
WEIGHT=0
DESCRIPTION=$(cat <<'CKA_META_EOF'
（理论题）集群 CNI 被移除，需要安装 Calico 3.28.2。
1. kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/tigera-operator.yaml
2. kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/custom-resources.yaml
3. 等 Pod 全部 Running，检查 Pod 能互相通信 + NetworkPolicy 生效
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/tigera-operator.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/custom-resources.yaml
kubectl get pods -n calico-system -w
# 注意：当前 k3s 用 flannel 做 CNI，安装 Calico 会替换 CNI 导致集群重新初始化。
# 本题作为理论题，标记完成即可。
CKA_META_EOF
)
