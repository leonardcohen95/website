#!/bin/bash
TITLE='从样本中选 NetworkPolicy 应用'
CATEGORY='服务与网络'
WEIGHT=7
DESCRIPTION=$(cat <<'CKA_META_EOF'
frontend/backend namespace 各有一个 Deployment，backend 有默认 deny-all NetworkPolicy。
/home/student/netpol 里有 3 个 YAML 样本（netpol1 过度宽松、netpol2 过度严格、netpol3 正确）。
选一个应用，让 frontend namespace 下 app=frontend 的 Pod 能访问 backend namespace 下 app=backend 的 Pod。
不要修改/删除 netpol 文件夹里的文件。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
ls /home/student/netpol/
# 看每个 YAML 的 spec
kubectl apply -f /home/student/netpol/netpol3.yaml
kubectl -n backend get networkpolicy
CKA_META_EOF
)
