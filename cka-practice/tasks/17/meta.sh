#!/bin/bash
TITLE='NetworkPolicy：默认拒绝 + 按需放行'
CATEGORY='服务与网络'
WEIGHT=4
DESCRIPTION=$(cat <<'CKA_META_EOF'
在命名空间 `secure` 中：
1. 创建 `deny-all-ingress`：拒绝所有入站流量。
2. 创建 `allow-web-ingress`：只允许带 label `role=frontend` 的 Pod 访问 80 端口。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
deny-all-ingress: podSelector {} + policyTypes [Ingress]，不要 ingress 规则
allow-web-ingress: ingress.from.podSelector.matchLabels.role=frontend，ports: [{port: 80}]
CKA_META_EOF
)
