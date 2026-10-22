#!/bin/bash
TITLE='排查并修复 CrashLoopBackOff 的 Pod'
CATEGORY='故障排查'
WEIGHT=12
DESCRIPTION=$(cat <<'CKA_META_EOF'
命名空间 `prod` 的 Pod `web-app` 处于 CrashLoopBackOff。
排查原因并修复，使其运行镜像 `nginx:1.25` 并处于 Running/Ready 状态。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl describe pod web-app -n prod
kubectl logs web-app -n prod --previous
# 当前容器启动即退出，需替换为可正常运行的 nginx:1.25
kubectl get pod web-app -n prod -o yaml > web-app.yaml
# 修改 image 为 nginx:1.25 并删除 command，重建 Pod
kubectl delete pod web-app -n prod && kubectl apply -f web-app.yaml
CKA_META_EOF
)
