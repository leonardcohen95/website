#!/bin/bash
TITLE='提取 Pod 日志中的特定错误行'
CATEGORY='故障排查'
WEIGHT=8
DESCRIPTION=$(cat <<'CKA_META_EOF'
命名空间 `prod` 的 Pod `monitor-log` 持续输出日志。
提取包含 `unable-to-access-website` 的行，写入 `/opt/KULM00201/foo`。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl logs monitor-log -n prod | grep "unable-to-access-website" > /opt/KULM00201/foo
# 确认每行都包含关键字：cat /opt/KULM00201/foo
CKA_META_EOF
)
