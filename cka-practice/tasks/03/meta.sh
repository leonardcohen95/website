#!/bin/bash
TITLE='sidecar 并置容器'
CATEGORY='工作负载'
WEIGHT=7
DESCRIPTION=$(cat <<'CKA_META_EOF'
为 synergy-leverager Deployment 加一个 sidecar：
- 容器名 sidecar，镜像 busybox，命令 /bin/sh -c 'tail -n+1 -f /var/log/synergy-leverager.log'
- 加 emptyDir 卷 varlog，挂到两个容器的 /var/log
- 不要修改主容器 spec
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
kubectl get deployment synergy-leverager -o yaml > sidecar.yaml
# 编辑：containers 列表加第二个 name: sidecar image: busybox args: [...]
# 主容器 volumesMounts 加 - name: varlog, mountPath: /var/log
# volumes 加 emptyDir varlog
kubectl apply -f sidecar.yaml
kubectl get pod -w
CKA_META_EOF
)
