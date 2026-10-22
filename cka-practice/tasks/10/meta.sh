#!/bin/bash
TITLE='Deployment 滚动更新与回滚'
CATEGORY='工作负载'
WEIGHT=2
DESCRIPTION=$(cat <<'CKA_META_EOF'
命名空间 `cka-rollout` 中的 Deployment `web-app`（2 副本，镜像 nginx:1.25）：
1. 将镜像更新为 `nginx:1.26`，等待滚动更新完成；
2. 查看 rollout 历史；
3. 回滚到上一版本（nginx:1.25）。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl set image deployment/web-app web=nginx:1.26 -n cka-rollout
kubectl rollout status deployment/web-app -n cka-rollout
kubectl rollout history deployment/web-app -n cka-rollout
kubectl rollout undo deployment/web-app -n cka-rollout
CKA_META_EOF
)
