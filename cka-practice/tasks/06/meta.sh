#!/bin/bash
TITLE='PriorityClass + 修改 Deployment 优先级'
CATEGORY='调度'
WEIGHT=6
DESCRIPTION=$(cat <<'CKA_META_EOF'
1. 创建 PriorityClass high-priority，value 比现有用户自定义最高优先级类小 1。
   （本环境预设 max-user-priority=1000000000，所以 high-priority 的 value 是 999999999）
2. 修改 priority namespace 的 busybox-logger Deployment，priorityClassName 设为 high-priority。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get pc                          # 看到 max-user-priority value=1000000000
kubectl create pc high-priority --value=999999999
kubectl -n priority edit deployment busybox-logger
# 在 spec.template.spec 加：priorityClassName: high-priority
CKA_META_EOF
)
