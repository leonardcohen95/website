#!/bin/bash
TITLE='给 Pod 添加 init container'
CATEGORY='工作负载'
WEIGHT=3
DESCRIPTION=$(cat <<'CKA_META_EOF'
修改 `/opt/KUCC00108/pod-spec-KUCC00108.yaml`，为 Pod `hungry-bear` 添加 init container：
- init 容器用 busybox，创建空文件 `/workdir/calm.txt`
- 主容器检测不到该文件则退出
然后创建该 Pod（命名空间 cka-init）。
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
在 spec 中加入：
initContainers:
- name: init
  image: busybox
  command: ["sh","-c","touch /workdir/calm.txt"]
  volumeMounts: [{name: workdir, mountPath: /workdir}]
并在主容器挂载同一个 emptyDir 卷 workdir。
最后 kubectl apply -f /opt/KUCC00108/pod-spec-KUCC00108.yaml
CKA_META_EOF
)
