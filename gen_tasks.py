#!/usr/bin/env python3
# 生成 CKA 25 道题的练习目录（meta/setup/check/clean）
import os, textwrap

BASE = "/workspace/cka-practice/tasks"

def shq(x):
    return "'" + x.replace("'", "'\\''") + "'"
os.makedirs(BASE, exist_ok=True)

SETUP_LIB = r'''#!/bin/bash
source /opt/cka/lib/common.sh
ensure_ns(){
  local ns="$1"
  kubectl get ns "$ns" >/dev/null 2>&1 || kubectl create ns "$ns"
  kubectl label ns "$ns" cka-practice=true --overwrite >/dev/null 2>&1
}
clean_ns(){
  local ns="$1"
  if kubectl get ns "$ns" -o jsonpath='{.metadata.labels.cka-practice}' 2>/dev/null | grep -q true; then
    kubectl delete ns "$ns" --wait=false >/dev/null 2>&1
  fi
}
'''

TASKS = {}

def add(tid, title, category, weight, desc, hint, setup, check, clean):
    TASKS[tid] = dict(title=title, category=category, weight=weight,
                      desc=desc, hint=hint, setup=setup, check=check, clean=clean)

# ---------------- 01 理论 ----------------
add("01", "修复迁移后损坏的单节点集群（外部 etcd）", "集群架构", 0,
"""kubeadm 集群迁移到新机器后损坏，原集群使用外部 etcd。找出并修复所有损坏的组件。

本题为理论题：当前环境是 k3s 单节点（sqlite 数据存储），无法复现 kubeadm + 外部 etcd 的迁移损坏场景。
请阅读解题步骤后运行：cka done 01 标记完成。""",
"""1) systemctl status kubelet / crictl ps -a 看组件状态
2) 检查 /etc/kubernetes/manifests/kube-apiserver.yaml 的 --etcd-servers 指向
3) 确认 --etcd-cafile/--etcd-certfile/--etcd-keyfile 路径正确
4) 保存后静态 Pod 由 kubelet 自动拉起，验证 kubectl get componentstatuses""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
pass "理论题：请阅读答案后执行 cka done 01 标记完成""" + '"' + """
""",
"""#!/bin/bash
true""")

# ---------------- 02 ClusterRole ----------------
add("02", "创建 ClusterRole 并绑定到指定 SA", "集群架构", 10,
"""1. 创建 ClusterRole `deployment-clusterrole`，只允许对 Deployment / StatefulSet / DaemonSet 执行 create。
2. 在命名空间 `app-team1` 创建 ServiceAccount `cicd-token`。
3. 创建 RoleBinding `deployment-clusterrole`，把该 ClusterRole 绑定到该 SA（仅限 app-team1 命名空间）。""",
"""kubectl create clusterrole deployment-clusterrole --verb=create --resource=deployments,statefulsets,daemonsets
kubectl create sa cicd-token -n app-team1
kubectl create rolebinding deployment-clusterrole --clusterrole=deployment-clusterrole --serviceaccount=app-team1:cicd-token -n app-team1""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns app-team1
kubectl delete clusterrole deployment-clusterrole --ignore-not-found >/dev/null 2>&1
kubectl delete sa cicd-token -n app-team1 --ignore-not-found >/dev/null 2>&1
kubectl delete rolebinding deployment-clusterrole -n app-team1 --ignore-not-found >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
CR=$(kubectl get clusterrole deployment-clusterrole -o json 2>/dev/null)
if [ -z "$CR" ]; then fail "ClusterRole deployment-clusterrole 不存在"; else
  VERBS=$(echo "$CR" | jq -r '[.rules[].verbs[]]|unique|sort|join(",")')
  RES=$(echo "$CR" | jq -r '[.rules[].resources[]]|unique|sort|join(",")')
  assert_eq "ClusterRole verbs 为 create" "create" "$VERBS"
  assert_eq "ClusterRole resources 正确" "daemonsets,deployments,statefulsets" "$RES"
fi
SA=$(kubectl get sa cicd-token -n app-team1 -o name 2>/dev/null)
assert_eq "SA cicd-token 存在于 app-team1" "serviceaccount/cicd-token" "$SA"
RB=$(kubectl get rolebinding deployment-clusterrole -n app-team1 -o json 2>/dev/null)
if [ -z "$RB" ]; then fail "RoleBinding deployment-clusterrole 不存在"; else
  assert_eq "RoleBinding 引用 ClusterRole" "ClusterRole/deployment-clusterrole" "$(echo "$RB" | jq -r '.roleRef.kind + "/" + .roleRef.name')"
  assert_eq "RoleBinding 绑定到 cicd-token" "ServiceAccount/cicd-token" "$(echo "$RB" | jq -r '.subjects[0].kind + "/" + .subjects[0].name')"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete clusterrole deployment-clusterrole --ignore-not-found >/dev/null 2>&1
kubectl delete rolebinding deployment-clusterrole -n app-team1 --ignore-not-found >/dev/null 2>&1
kubectl delete sa cicd-token -n app-team1 --ignore-not-found >/dev/null 2>&1
clean_ns app-team1
true""")

# ---------------- 03 理论 ----------------
add("03", "用 kubeadm 升级控制面节点", "集群架构", 0,
"""将控制面节点从 v1.29.x 升级到 v1.30.0，并升级该节点上的 kubelet 和 kubectl。

本题为理论题：当前为 k3s 集群，升级方式与 kubeadm 不同，无法实操。
请阅读解题步骤后运行：cka done 03 标记完成。""",
"""apt-get update
apt-cache madison kubeadm | grep 1.30
apt-get install -y kubeadm=1.30.0-1.1
kubeadm upgrade plan
kubeadm upgrade apply v1.30.0
kubectl drain <cp-node> --ignore-daemonsets --delete-emptydir-data
apt-get install -y kubelet=1.30.0-1.1 kubectl=1.30.0-1.1
systemctl daemon-reload && systemctl restart kubelet
kubectl uncordon <cp-node>""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
pass "理论题：请阅读答案后执行 cka done 03 标记完成""" + '"' + """
""",
"""#!/bin/bash
true""")

# ---------------- 04 理论 ----------------
add("04", "etcd 数据备份", "集群架构", 0,
"""将 etcd 数据备份到 /opt/etcd-snapshot.db。
etcd 端点 https://127.0.0.1:2379，证书位于 /etc/kubernetes/pki/etcd/。

本题为理论题：当前 k3s 使用 sqlite（/var/lib/rancher/k3s/server/db/state.db），没有独立 etcdctl 端点。
请阅读解题步骤后运行：cka done 04 标记完成。""",
"""ETCDCTL_API=3 etcdctl snapshot save /opt/etcd-snapshot.db \\
  --endpoints=https://127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key
ETCDCTL_API=3 etcdctl snapshot status /opt/etcd-snapshot.db --write-out=table""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
pass "理论题：请阅读答案后执行 cka done 04 标记完成""" + '"' + """
""",
"""#!/bin/bash
true""")

# ---------------- 05 RBAC Role ----------------
add("05", "创建 Role 并绑定到 ServiceAccount", "集群架构", 8,
"""1. 在 `development` 命名空间创建 SA `dev-user`。
2. 创建 Role `dev-role`：pods 允许 get/list/watch；deployments 与 services 允许 get/list。
3. 创建 RoleBinding `dev-user-binding` 绑定到该 SA。""",
"""kubectl create sa dev-user -n development
kubectl create role dev-role -n development --verb=get,list,watch --resource=pods
kubectl create role dev-role -n development --verb=get,list --resource=deployments.apps,services （合并写法见答案）
kubectl create rolebinding dev-user-binding -n development --role=dev-role --serviceaccount=development:dev-user
kubectl auth can-i get pods --as=system:serviceaccount:development:dev-user -n development""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns development
kubectl delete sa dev-user -n development --ignore-not-found >/dev/null 2>&1
kubectl delete role dev-role -n development --ignore-not-found >/dev/null 2>&1
kubectl delete rolebinding dev-user-binding -n development --ignore-not-found >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
SA=$(kubectl get sa dev-user -n development -o name 2>/dev/null)
assert_eq "SA dev-user 存在" "serviceaccount/dev-user" "$SA"
ROLE=$(kubectl get role dev-role -n development -o json 2>/dev/null)
if [ -z "$ROLE" ]; then fail "Role dev-role 不存在"; else
  P=$(echo "$ROLE" | jq -r '.rules[]|select(.resources[]?=="pods")|.verbs|sort|join(",")' | head -1)
  assert_eq "Role 对 pods 的权限" "get,list,watch" "$P"
  D=$(echo "$ROLE" | jq -r '.rules[]|select((.resources[]?=="deployments") or (.resources[]?=="deployments.apps"))|.verbs|sort|join(",")' | head -1)
  assert_eq "Role 对 deployments 的权限" "get,list" "$D"
  S=$(echo "$ROLE" | jq -r '.rules[]|select(.resources[]?=="services")|.verbs|sort|join(",")' | head -1)
  assert_eq "Role 对 services 的权限" "get,list" "$S"
fi
RB=$(kubectl get rolebinding dev-user-binding -n development -o json 2>/dev/null)
if [ -z "$RB" ]; then fail "RoleBinding dev-user-binding 不存在"; else
  assert_eq "RoleBinding 引用 dev-role" "Role/dev-role" "$(echo "$RB" | jq -r '.roleRef.kind + "/" + .roleRef.name')"
fi
CANI=$(kubectl auth can-i get pods --as=system:serviceaccount:development:dev-user -n development 2>/dev/null)
assert_eq "SA 实际可以 get pods" "yes" "$CANI"
CANID=$(kubectl auth can-i delete pods --as=system:serviceaccount:development:dev-user -n development 2>/dev/null)
assert_eq "SA 不应能 delete pods" "no" "$CANID"
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete sa dev-user -n development --ignore-not-found >/dev/null 2>&1
kubectl delete role dev-role -n development --ignore-not-found >/dev/null 2>&1
kubectl delete rolebinding dev-user-binding -n development --ignore-not-found >/dev/null 2>&1
clean_ns development
true""")

# ---------------- 06 CRD ----------------
add("06", "列出 cert-manager CRD 并提取字段说明", "集群架构", 7,
"""1. 列出所有 cert-manager 相关 CRD，保存到 `~/resources.yaml`（使用默认输出格式，不加 -o）。
2. 将 Certificate CR 的 `spec.subject` 字段说明输出到 `~/subject.yaml`。""",
"""kubectl get crd | grep cert-manager | awk '{print $1}' | xargs kubectl get crd > ~/resources.yaml
kubectl explain certificate.spec.subject > ~/subject.yaml""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
rm -f "$HOME/resources.yaml" "$HOME/subject.yaml"
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
if [ -s "$HOME/resources.yaml" ]; then
  pass "resources.yaml 已创建"
  assert_contains "resources.yaml 含 cert-manager CRD" "certificates.cert-manager.io" "$(cat "$HOME/resources.yaml")"
  assert_not_contains "resources.yaml 未使用 -o 自定义输出" "apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition" "$(head -3 "$HOME/resources.yaml")"
else
  fail "resources.yaml 不存在或为空"
fi
if [ -s "$HOME/subject.yaml" ]; then
  pass "subject.yaml 已创建"
  assert_contains "subject.yaml 含 subject 字段说明" "subject" "$(cat "$HOME/subject.yaml")"
else
  fail "subject.yaml 不存在或为空"
fi
true""",
"""#!/bin/bash
rm -f "$HOME/resources.yaml" "$HOME/subject.yaml"
true""")

# ---------------- 07 双容器 Pod ----------------
add("07", "创建含两个容器的 Pod", "工作负载", 3,
"""创建 Pod `kucc1`（default 命名空间），包含 2 个应用容器，镜像分别为 `redis` 和 `memcached`。""",
"""kubectl run kucc1 --image=redis --restart=Never --dry-run=client -o yaml > kucc1.yaml
# 手动在 containers 下追加 memcached 容器，然后：
kubectl apply -f kucc1.yaml""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod kucc1 --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pod kucc1 -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod kucc1 不存在"; else
  N=$(echo "$P" | jq '.spec.containers|length')
  assert_eq "容器数量为 2" "2" "$N"
  IMGS=$(echo "$P" | jq -r '[.spec.containers[].image]|sort|join(",")')
  assert_contains "包含 redis 镜像" "redis" "$IMGS"
  assert_contains "包含 memcached 镜像" "memcached" "$IMGS"
fi
true""",
"""#!/bin/bash
kubectl delete pod kucc1 --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true""")

# ---------------- 08 ns + pod ----------------
add("08", "创建命名空间并运行 Pod", "工作负载", 3,
"""创建命名空间 `development`，并在其中运行镜像为 `nginx` 的 Pod `nginx`。""",
"""kubectl create namespace development
kubectl run nginx --image=nginx --restart=Never -n development""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns development
kubectl delete pod nginx -n development --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
N=$(kubectl get ns development -o name 2>/dev/null)
assert_eq "命名空间 development 存在" "namespace/development" "$N"
P=$(kubectl get pod nginx -n development -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod nginx 不存在于 development"; else
  assert_contains "镜像为 nginx" "nginx" "$(echo "$P" | jq -r '.spec.containers[0].image')"
  assert_eq "Pod 不重启策略" "Never" "$(echo "$P" | jq -r '.spec.restartPolicy')"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod nginx -n development --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
clean_ns development
true""")

# ---------------- 09 资源限制 ----------------
add("09", "创建带资源限制的 Pod", "工作负载", 2,
"""创建 Pod `memory-pod`（default），镜像 `nginx:latest`：
- memory request 128Mi，limit 256Mi
- CPU request 100m，limit 500m""",
"""kubectl run memory-pod --image=nginx:latest \\
  --requests=memory=128Mi,cpu=100m \\
  --limits=memory=256Mi,cpu=500m""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod memory-pod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pod memory-pod -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod memory-pod 不存在"; else
  assert_eq "镜像 nginx:latest" "nginx:latest" "$(echo "$P" | jq -r '.spec.containers[0].image')"
  assert_eq "memory request" "128Mi" "$(echo "$P" | jq -r '.spec.containers[0].resources.requests.memory')"
  assert_eq "memory limit" "256Mi" "$(echo "$P" | jq -r '.spec.containers[0].resources.limits.memory')"
  assert_eq "cpu request" "100m" "$(echo "$P" | jq -r '.spec.containers[0].resources.requests.cpu')"
  assert_eq "cpu limit" "500m" "$(echo "$P" | jq -r '.spec.containers[0].resources.limits.cpu')"
fi
true""",
"""#!/bin/bash
kubectl delete pod memory-pod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
true""")

# ---------------- 10 rollout ----------------
add("10", "Deployment 滚动更新与回滚", "工作负载", 2,
"""命名空间 `cka-rollout` 中的 Deployment `web-app`（2 副本，镜像 nginx:1.25）：
1. 将镜像更新为 `nginx:1.26`，等待滚动更新完成；
2. 查看 rollout 历史；
3. 回滚到上一版本（nginx:1.25）。""",
"""kubectl set image deployment/web-app web=nginx:1.26 -n cka-rollout
kubectl rollout status deployment/web-app -n cka-rollout
kubectl rollout history deployment/web-app -n cka-rollout
kubectl rollout undo deployment/web-app -n cka-rollout""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns cka-rollout
kubectl delete deployment web-app -n cka-rollout --ignore-not-found >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: cka-rollout
spec:
  replicas: 2
  selector:
    matchLabels: {app: web}
  template:
    metadata:
      labels: {app: web}
    spec:
      containers:
      - name: web
        image: nginx:1.25
YAML
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
D=$(kubectl get deployment web-app -n cka-rollout -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment web-app 不存在"; else
  IMG=$(echo "$D" | jq -r '.spec.template.spec.containers[0].image')
  assert_eq "最终镜像已回滚到 nginx:1.25" "nginx:1.25" "$IMG"
  REV=$(echo "$D" | jq -r '.metadata.annotations["deployment.kubernetes.io/revision"]')
  assert_ge "Rollout 版本号（证明执行过更新+回滚）" 3 "${REV:-0}"
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_eq "2 个副本就绪" "2" "$READY"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment web-app -n cka-rollout --ignore-not-found >/dev/null 2>&1
clean_ns cka-rollout
true""")

# ---------------- 11 资源均分 ----------------
add("11", "调整资源请求让 Pod 可调度", "工作负载", 2,
"""命名空间 `cka-schedule` 的 Deployment `wordpress`（3 副本）因资源请求过高导致 Pod 一直 Pending。
调整 requests，使 3 个 Pod 都能被调度并进入 Running。
（提示：先查看节点可分配容量）""",
"""kubectl describe node | grep -A6 Capacity
# 节点总计 2 核 / 约 3.4Gi，可分给 3 个 Pod：cpu=200m, memory=256Mi
kubectl set resources deployment wordpress -n cka-schedule --requests=cpu=200m,memory=256Mi
kubectl get pods -n cka-schedule -w""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns cka-schedule
kubectl delete deployment wordpress -n cka-schedule --ignore-not-found >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordpress
  namespace: cka-schedule
spec:
  replicas: 3
  selector:
    matchLabels: {app: wordpress}
  template:
    metadata:
      labels: {app: wordpress}
    spec:
      containers:
      - name: wordpress
        image: nginx:1.25
        resources:
          requests:
            cpu: "8"
            memory: "8Gi"
YAML
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
D=$(kubectl get deployment wordpress -n cka-schedule -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment wordpress 不存在"; else
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_eq "3 个 Pod 全部就绪" "3" "$READY"
  CPU=$(echo "$D" | jq -r '.spec.template.spec.containers[0].resources.requests.cpu')
  MEM=$(echo "$D" | jq -r '.spec.template.spec.containers[0].resources.requests.memory')
  echo "RESULT|1|当前 requests: cpu=$CPU memory=$MEM"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment wordpress -n cka-schedule --ignore-not-found >/dev/null 2>&1
clean_ns cka-schedule
true""")

# ---------------- 12 init container ----------------
add("12", "给 Pod 添加 init container", "工作负载", 3,
"""修改 `/opt/KUCC00108/pod-spec-KUCC00108.yaml`，为 Pod `hungry-bear` 添加 init container：
- init 容器用 busybox，创建空文件 `/workdir/calm.txt`
- 主容器检测不到该文件则退出
然后创建该 Pod（命名空间 cka-init）。""",
"""在 spec 中加入：
initContainers:
- name: init
  image: busybox
  command: ["sh","-c","touch /workdir/calm.txt"]
  volumeMounts: [{name: workdir, mountPath: /workdir}]
并在主容器挂载同一个 emptyDir 卷 workdir。
最后 kubectl apply -f /opt/KUCC00108/pod-spec-KUCC00108.yaml""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns cka-init
kubectl delete pod hungry-bear -n cka-init --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
mkdir -p /opt/KUCC00108
cat <<'YAML' > /opt/KUCC00108/pod-spec-KUCC00108.yaml
apiVersion: v1
kind: Pod
metadata:
  name: hungry-bear
  namespace: cka-init
spec:
  containers:
  - name: hungry-bear
    image: busybox
    command: ["sh","-c","if [ ! -f /workdir/calm.txt ]; then echo missing; exit 1; fi; sleep 3600"]
    volumeMounts:
    - name: workdir
      mountPath: /workdir
  volumes:
  - name: workdir
    emptyDir: {}
YAML
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pod hungry-bear -n cka-init -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod hungry-bear 不存在于 cka-init"; else
  N=$(echo "$P" | jq '.spec.initContainers|length')
  assert_ge "存在 init container" 1 "${N:-0}"
  IMG=$(echo "$P" | jq -r '.spec.initContainers[0].image')
  assert_contains "init 容器镜像为 busybox" "busybox" "$IMG"
  PHASE=$(echo "$P" | jq -r '.status.phase')
  assert_eq "Pod 处于 Running" "Running" "$PHASE"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod hungry-bear -n cka-init --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
clean_ns cka-init
rm -rf /opt/KUCC00108
true""")

# ---------------- 13 NetworkPolicy ----------------
add("13", "NetworkPolicy：只允许 frontend 访问 backend", "服务与网络", 4,
"""命名空间 `frontend` 中的 Pod（label app=frontend）需要访问 `backend` 命名空间的 Pod（label app=backend）。
在 `backend` 命名空间创建 NetworkPolicy，只允许来自 frontend 命名空间、且 label app=frontend 的 Pod 入站，不要过度宽松。""",
"""在 backend 命名空间创建：
spec:
  podSelector: {matchLabels: {app: backend}}
  ingress:
  - from:
    - namespaceSelector: {matchLabels: {name: frontend}}
      podSelector: {matchLabels: {app: frontend}}""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns frontend; kubectl label ns frontend name=frontend --overwrite >/dev/null
ensure_ns backend;  kubectl label ns backend  name=backend  --overwrite >/dev/null
kubectl delete networkpolicy --all -n backend >/dev/null 2>&1
kubectl delete deployment frontend -n frontend --ignore-not-found >/dev/null 2>&1
kubectl delete deployment backend  -n backend  --ignore-not-found >/dev/null 2>&1
kubectl create deployment frontend --image=nginx:1.25 -n frontend >/dev/null 2>&1
kubectl label pods -n frontend app=frontend --overwrite >/dev/null 2>&1
kubectl create deployment backend --image=nginx:1.25 -n backend >/dev/null 2>&1
kubectl label pods -n backend app=backend --overwrite >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
NP=$(kubectl get networkpolicy -n backend -o json 2>/dev/null)
CNT=$(echo "$NP" | jq '.items|length')
if [ "${CNT:-0}" -eq 0 ]; then fail "backend 命名空间没有 NetworkPolicy"; else
  OK=$(echo "$NP" | jq -r '[.items[] | select(
      (.spec.podSelector.matchLabels.app=="backend") and
      ([.spec.ingress[]?.from[]? | select(.namespaceSelector.matchLabels.name=="frontend" and .podSelector.matchLabels.app=="frontend")]|length>0)
    )]|length')
  assert_ge "存在正确的 frontend→backend 策略" 1 "${OK:-0}"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete networkpolicy --all -n backend >/dev/null 2>&1
kubectl delete deployment frontend -n frontend --ignore-not-found >/dev/null 2>&1
kubectl delete deployment backend  -n backend  --ignore-not-found >/dev/null 2>&1
clean_ns frontend; clean_ns backend
true""")

# ---------------- 14 ConfigMap TLS ----------------
add("14", "更新 ConfigMap 的 TLS 配置并滚动重启", "服务与网络", 4,
"""命名空间 `nginx-static` 的 Deployment `nginx-static` 使用 ConfigMap `nginx-config`。
更新该 ConfigMap，使其允许 TLSv1.2（ssl_protocols 包含 TLSv1.2），并滚动重启 Deployment 使配置生效。""",
"""kubectl get cm nginx-config -n nginx-static -o yaml > cm.yaml
# 编辑 ssl_protocols 行，加入 TLSv1.2
kubectl apply -f cm.yaml
kubectl rollout restart deployment/nginx-static -n nginx-static
kubectl rollout status deployment/nginx-static -n nginx-static""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns nginx-static
kubectl delete deployment nginx-static -n nginx-static --ignore-not-found >/dev/null 2>&1
cat > /tmp/nginx-default.conf <<'CONF'
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/certs/tls.crt;
    ssl_certificate_key /etc/nginx/certs/tls.key;
    ssl_protocols TLSv1.1;
    location / { return 200 "ok"; }
}
CONF
kubectl create configmap nginx-config -n nginx-static --from-file=default.conf=/tmp/nginx-default.conf --dry-run=client -o yaml | kubectl apply -f - >/dev/null
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-static
  namespace: nginx-static
spec:
  replicas: 1
  selector:
    matchLabels: {app: nginx-static}
  template:
    metadata:
      labels: {app: nginx-static}
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        volumeMounts:
        - name: conf
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: conf
        configMap:
          name: nginx-config
YAML
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
CM=$(kubectl get cm nginx-config -n nginx-static -o json 2>/dev/null)
if [ -z "$CM" ]; then fail "ConfigMap nginx-config 不存在"; else
  DATA=$(echo "$CM" | jq -r '.data["default.conf"] // .data | tostring')
  assert_contains "ConfigMap 允许 TLSv1.2" "TLSv1.2" "$DATA"
  assert_not_contains "已移除单独的 TLSv1.1" "ssl_protocols TLSv1.1;" "$DATA"
fi
D=$(kubectl get deployment nginx-static -n nginx-static -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment nginx-static 不存在"; else
  RA=$(echo "$D" | jq -r '.spec.template.metadata.annotations["kubectl.kubernetes.io/restartedAt"] // ""')
  if [ -n "$RA" ]; then pass "Deployment 已滚动重启（restartedAt=$RA）"; else fail "Deployment 未滚动重启"; fi
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_ge "Deployment 就绪" 1 "${READY:-0}"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment nginx-static -n nginx-static --ignore-not-found >/dev/null 2>&1
kubectl delete cm nginx-config -n nginx-static --ignore-not-found >/dev/null 2>&1
clean_ns nginx-static
true""")

# ---------------- 15 统计节点 ----------------
add("15", "统计可调度的 Ready 节点数", "服务与网络", 3,
"""统计集群中「Ready 且可调度」的节点数量（排除带 NoSchedule 污点的节点），
将数字写入 `/opt/KUSC00402/kusc00402.txt`。""",
"""kubectl get nodes
kubectl describe nodes | grep -i taint
# 总数 - NoSchedule 数 = 可调度数
echo <数字> > /opt/KUSC00402/kusc00402.txt""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
mkdir -p /opt/KUSC00402
rm -f /opt/KUSC00402/kusc00402.txt
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
EXP=$(kubectl get nodes -o json | jq -r '[.items[] | select((.status.conditions[]|select(.type=="Ready").status)=="True") | select(([.spec.taints[]?|select(.effect=="NoSchedule")]|length)==0)] | length')
if [ -f /opt/KUSC00402/kusc00402.txt ]; then
  GOT=$(tr -d ' \n\r' < /opt/KUSC00402/kusc00402.txt)
  assert_eq "文件中的可调度节点数正确" "$EXP" "$GOT"
else
  fail "/opt/KUSC00402/kusc00402.txt 不存在"
fi
true""",
"""#!/bin/bash
rm -f /opt/KUSC00402/kusc00402.txt
true""")

# ---------------- 16 Ingress ----------------
add("16", "创建 Ingress", "服务与网络", 3,
"""在命名空间 `web` 创建 Ingress `web-ingress`：
- 域名 `app.example.com`
- 路径 `/` 转发到 Service `web-svc` 的 80 端口
（IngressClass 使用集群已有的 traefik）""",
"""kubectl create ingress web-ingress -n web --rule="app.example.com/=web-svc:80" --class=traefik
# 或手写 YAML（ingressClassName: traefik）""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns web
kubectl delete ingress web-ingress -n web --ignore-not-found >/dev/null 2>&1
kubectl delete svc web-svc -n web --ignore-not-found >/dev/null 2>&1
kubectl create deployment web --image=nginx:1.25 -n web >/dev/null 2>&1
kubectl expose deployment web --name=web-svc --port=80 -n web >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
I=$(kubectl get ingress web-ingress -n web -o json 2>/dev/null)
if [ -z "$I" ]; then fail "Ingress web-ingress 不存在于 web"; else
  assert_eq "域名正确" "app.example.com" "$(echo "$I" | jq -r '.spec.rules[0].host')"
  assert_eq "路径为 /" "/" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].path')"
  assert_eq "后端 Service 为 web-svc" "web-svc" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].backend.service.name')"
  assert_eq "后端端口为 80" "80" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].backend.service.port.number')"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete ingress web-ingress -n web --ignore-not-found >/dev/null 2>&1
kubectl delete svc web-svc -n web --ignore-not-found >/dev/null 2>&1
kubectl delete deployment web -n web --ignore-not-found >/dev/null 2>&1
clean_ns web
true""")

# ---------------- 17 默认拒绝 ----------------
add("17", "NetworkPolicy：默认拒绝 + 按需放行", "服务与网络", 4,
"""在命名空间 `secure` 中：
1. 创建 `deny-all-ingress`：拒绝所有入站流量。
2. 创建 `allow-web-ingress`：只允许带 label `role=frontend` 的 Pod 访问 80 端口。""",
"""deny-all-ingress: podSelector {} + policyTypes [Ingress]，不要 ingress 规则
allow-web-ingress: ingress.from.podSelector.matchLabels.role=frontend，ports: [{port: 80}]""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns secure
kubectl delete networkpolicy --all -n secure >/dev/null 2>&1
kubectl create deployment web --image=nginx:1.25 -n secure >/dev/null 2>&1
kubectl label pods -n secure app=web --overwrite >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
D=$(kubectl get networkpolicy deny-all-ingress -n secure -o json 2>/dev/null)
if [ -z "$D" ]; then fail "deny-all-ingress 不存在"; else
  assert_eq "deny-all-ingress 的 podSelector 为空" "{}" "$(echo "$D" | jq -c '.spec.podSelector')"
  assert_contains "包含 Ingress 策略类型" "Ingress" "$(echo "$D" | jq -r '.spec.policyTypes|join(",")')"
  assert_eq "deny-all-ingress 没有放行规则" "0" "$(echo "$D" | jq '.spec.ingress|length')"
fi
A=$(kubectl get networkpolicy allow-web-ingress -n secure -o json 2>/dev/null)
if [ -z "$A" ]; then fail "allow-web-ingress 不存在"; else
  assert_eq "允许 role=frontend" "frontend" "$(echo "$A" | jq -r '.spec.ingress[0].from[0].podSelector.matchLabels.role')"
  assert_eq "允许端口 80" "80" "$(echo "$A" | jq -r '.spec.ingress[0].ports[0].port')"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete networkpolicy --all -n secure >/dev/null 2>&1
kubectl delete deployment web -n secure --ignore-not-found >/dev/null 2>&1
clean_ns secure
true""")

# ---------------- 18 custom-columns ----------------
add("18", "用 custom-columns 输出 Pod 信息", "服务与网络", 2,
"""命名空间 `cka-inspect` 中有若干 nginx Pod。
用 `custom-columns` 列出 Pod 名称和状态，列名分别为 `POD_NAME`、`POD_STATUS`，
将输出保存到 `~/custom-columns.txt`。""",
"""kubectl get po -n cka-inspect -o=custom-columns="POD_NAME:.metadata.name,POD_STATUS:.status.containerStatuses[].state" > ~/custom-columns.txt""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns cka-inspect
kubectl delete deployment nginx-demo -n cka-inspect --ignore-not-found >/dev/null 2>&1
kubectl create deployment nginx-demo --image=nginx:1.25 --replicas=2 -n cka-inspect >/dev/null 2>&1
rm -f "$HOME/custom-columns.txt"
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
if [ -s "$HOME/custom-columns.txt" ]; then
  T=$(cat "$HOME/custom-columns.txt")
  assert_contains "包含列名 POD_NAME" "POD_NAME" "$T"
  assert_contains "包含列名 POD_STATUS" "POD_STATUS" "$T"
  LINES=$(echo "$T" | grep -c "nginx-demo")
  assert_ge "列出了 nginx Pod 行" 2 "${LINES:-0}"
else
  fail "~/custom-columns.txt 不存在或为空"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment nginx-demo -n cka-inspect --ignore-not-found >/dev/null 2>&1
clean_ns cka-inspect
rm -f "$HOME/custom-columns.txt"
true""")

# ---------------- 19 PV + PVC 恢复 MariaDB ----------------
add("19", "用保留的 PV 创建 PVC 并恢复 MariaDB", "存储", 4,
"""命名空间 `mariadb` 的 Deployment `mariadb` 被误删，数据需要恢复。
1. 集群中存在唯一一个 Retain 策略的 PV `mariadb-pv`；
2. 创建 PVC `mariadb`（命名空间 mariadb，RWO，250Mi，绑定到该 PV）；
3. 修改 `~/mariadb-deployment.yaml`，挂载该 PVC 到 `/var/lib/mysql` 并应用。""",
"""kubectl get pv
# 创建 PVC（volumeName: mariadb-pv, storage: 250Mi）
# 在 deployment 中加 volumeMounts(/var/lib/mysql) 和 volumes.persistentVolumeClaim.claimName=mariadb
kubectl apply -f ~/mariadb-deployment.yaml""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns mariadb
kubectl delete deployment mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pvc mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pv mariadb-pv --ignore-not-found >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mariadb-pv
spec:
  capacity: {storage: 1Gi}
  accessModes: ["ReadWriteOnce"]
  persistentVolumeReclaimPolicy: Retain
  storageClassName: ""
  hostPath: {path: /mnt/mariadb}
YAML
cat <<'YAML' > "$HOME/mariadb-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mariadb
  namespace: mariadb
spec:
  replicas: 1
  selector:
    matchLabels: {app: mariadb}
  template:
    metadata:
      labels: {app: mariadb}
    spec:
      containers:
      - name: mariadb
        image: busybox:1.36
        command: ["sh","-c","sleep 3600"]
YAML
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
PVC=$(kubectl get pvc mariadb -n mariadb -o json 2>/dev/null)
if [ -z "$PVC" ]; then fail "PVC mariadb 不存在"; else
  assert_eq "PVC 已绑定" "Bound" "$(echo "$PVC" | jq -r '.status.phase')"
  assert_eq "PVC 容量 250Mi" "250Mi" "$(echo "$PVC" | jq -r '.spec.resources.requests.storage')"
  assert_eq "PVC 绑定到 mariadb-pv" "mariadb-pv" "$(echo "$PVC" | jq -r '.spec.volumeName')"
  assert_contains "访问模式 RWO" "ReadWriteOnce" "$(echo "$PVC" | jq -r '.spec.accessModes|join(",")')"
fi
D=$(kubectl get deployment mariadb -n mariadb -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment mariadb 不存在"; else
  CL=$(echo "$D" | jq -r '.spec.template.spec.volumes[]? | select(.persistentVolumeClaim) | .persistentVolumeClaim.claimName' | head -1)
  assert_eq "Deployment 挂载了 PVC mariadb" "mariadb" "$CL"
  MP=$(echo "$D" | jq -r '.spec.template.spec.containers[0].volumeMounts[]? | select(.mountPath=="/var/lib/mysql") | .mountPath' | head -1)
  assert_eq "挂载路径为 /var/lib/mysql" "/var/lib/mysql" "$MP"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete deployment mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pvc mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pv mariadb-pv --ignore-not-found >/dev/null 2>&1
clean_ns mariadb
rm -f "$HOME/mariadb-deployment.yaml"
true""")

# ---------------- 20 hostPath PV ----------------
add("20", "创建 hostPath PV（ReadWriteMany）", "存储", 3,
"""创建 PV `app-data`：容量 2Gi，访问模式 ReadWriteMany，类型 hostPath，路径 `/srv/app-data`。""",
"""apiVersion: v1
kind: PersistentVolume
metadata: {name: app-data}
spec:
  capacity: {storage: 2Gi}
  accessModes: ["ReadWriteMany"]
  hostPath: {path: /srv/app-data}""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pv app-data --ignore-not-found >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pv app-data -o json 2>/dev/null)
if [ -z "$P" ]; then fail "PV app-data 不存在"; else
  assert_eq "容量 2Gi" "2Gi" "$(echo "$P" | jq -r '.spec.capacity.storage')"
  assert_contains "访问模式包含 RWX" "ReadWriteMany" "$(echo "$P" | jq -r '.spec.accessModes|join(",")')"
  assert_eq "hostPath 路径" "/srv/app-data" "$(echo "$P" | jq -r '.spec.hostPath.path')"
fi
true""",
"""#!/bin/bash
kubectl delete pv app-data --ignore-not-found >/dev/null 2>&1
true""")

# ---------------- 21 PV + PVC ----------------
add("21", "创建 PV + PVC 并绑定", "存储", 3,
"""1. 创建 PV `pv-data`：2Gi，ReadWriteOnce，回收策略 Retain，hostPath `/mnt/data`。
2. 在 default 命名空间创建 PVC `pvc-data`：1Gi，ReadWriteOnce，状态应为 Bound。""",
"""先创建 PV（persistentVolumeReclaimPolicy: Retain, storageClassName: ""），
再创建 PVC（storageClassName: ""），kubectl get pvc pvc-data 应为 Bound。""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pvc pvc-data -n default --ignore-not-found >/dev/null 2>&1
kubectl delete pv pv-data --ignore-not-found >/dev/null 2>&1
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pv pv-data -o json 2>/dev/null)
if [ -z "$P" ]; then fail "PV pv-data 不存在"; else
  assert_eq "PV 容量 2Gi" "2Gi" "$(echo "$P" | jq -r '.spec.capacity.storage')"
  assert_contains "PV 访问模式 RWO" "ReadWriteOnce" "$(echo "$P" | jq -r '.spec.accessModes|join(",")')"
  assert_eq "PV 回收策略 Retain" "Retain" "$(echo "$P" | jq -r '.spec.persistentVolumeReclaimPolicy')"
  assert_eq "PV hostPath 路径" "/mnt/data" "$(echo "$P" | jq -r '.spec.hostPath.path')"
fi
C=$(kubectl get pvc pvc-data -n default -o json 2>/dev/null)
if [ -z "$C" ]; then fail "PVC pvc-data 不存在"; else
  assert_eq "PVC 状态 Bound" "Bound" "$(echo "$C" | jq -r '.status.phase')"
  assert_eq "PVC 容量 1Gi" "1Gi" "$(echo "$C" | jq -r '.spec.resources.requests.storage')"
fi
true""",
"""#!/bin/bash
kubectl delete pvc pvc-data -n default --ignore-not-found >/dev/null 2>&1
kubectl delete pv pv-data --ignore-not-found >/dev/null 2>&1
true""")

# ---------------- 22 日志提取 ----------------
add("22", "提取 Pod 日志中的特定错误行", "故障排查", 8,
"""命名空间 `prod` 的 Pod `monitor-log` 持续输出日志。
提取包含 `unable-to-access-website` 的行，写入 `/opt/KULM00201/foo`。""",
"""kubectl logs monitor-log -n prod | grep "unable-to-access-website" > /opt/KULM00201/foo
# 确认每行都包含关键字：cat /opt/KULM00201/foo""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns prod
kubectl delete pod monitor-log -n prod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
mkdir -p /opt/KULM00201
rm -f /opt/KULM00201/foo
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: Pod
metadata:
  name: monitor-log
  namespace: prod
spec:
  restartPolicy: Never
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh","-c","for i in $(seq 1 5); do echo \"INFO request ok $i\"; echo \"ERROR unable-to-access-website code=$i\"; sleep 2; done; sleep 3600"]
YAML
sleep 3
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
if [ -s /opt/KULM00201/foo ]; then
  pass "文件 /opt/KULM00201/foo 已创建"
  BAD=$(grep -vc "unable-to-access-website" /opt/KULM00201/foo || true)
  assert_eq "文件内每行都包含关键字" "0" "${BAD:-0}"
  N=$(wc -l < /opt/KULM00201/foo)
  assert_ge "提取了多条匹配日志" 3 "${N:-0}"
else
  fail "/opt/KULM00201/foo 不存在或为空"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod monitor-log -n prod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
rm -f /opt/KULM00201/foo
clean_ns prod
true""")

# ---------------- 23 修复 CrashLoop ----------------
add("23", "排查并修复 CrashLoopBackOff 的 Pod", "故障排查", 12,
"""命名空间 `prod` 的 Pod `web-app` 处于 CrashLoopBackOff。
排查原因并修复，使其运行镜像 `nginx:1.25` 并处于 Running/Ready 状态。""",
"""kubectl describe pod web-app -n prod
kubectl logs web-app -n prod --previous
# 当前容器启动即退出，需替换为可正常运行的 nginx:1.25
kubectl get pod web-app -n prod -o yaml > web-app.yaml
# 修改 image 为 nginx:1.25 并删除 command，重建 Pod
kubectl delete pod web-app -n prod && kubectl apply -f web-app.yaml""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
ensure_ns prod
kubectl delete pod web-app -n prod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: Pod
metadata:
  name: web-app
  namespace: prod
  labels: {app: web-app}
spec:
  containers:
  - name: web
    image: busybox:1.36
    command: ["sh","-c","echo 'starting web-app...'; exit 1"]
YAML
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
P=$(kubectl get pod web-app -n prod -o json 2>/dev/null)
if [ -z "$P" ]; then fail "Pod web-app 不存在于 prod"; else
  IMG=$(echo "$P" | jq -r '.spec.containers[0].image')
  assert_eq "镜像已修复为 nginx:1.25" "nginx:1.25" "$IMG"
  PHASE=$(echo "$P" | jq -r '.status.phase')
  assert_eq "Pod 处于 Running" "Running" "$PHASE"
  READY=$(echo "$P" | jq -r '[.status.containerStatuses[]?|select(.ready==true)]|length')
  assert_ge "容器 Ready" 1 "${READY:-0}"
  RS=$(echo "$P" | jq -r '.status.containerStatuses[0].restartCount // 0')
  echo "RESULT|1|当前重启次数：$RS（修复后应稳定）"
fi
true""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
kubectl delete pod web-app -n prod --ignore-not-found --grace-period=0 --force >/dev/null 2>&1
clean_ns prod
true""")

# ---------------- 24 理论 ----------------
add("24", "修复 NotReady 节点", "故障排查", 0,
"""节点 `worker-01` 状态为 NotReady，排查并恢复为 Ready（不能重启节点）。

本题为理论题：当前是单节点生产集群，不能安全复现节点故障。
请阅读解题步骤后运行：cka done 24 标记完成。""",
"""kubectl describe node worker-01   # 看 Conditions / Events
ssh worker-01
systemctl status kubelet; journalctl -u kubelet --since "10 minutes ago" --no-pager
systemctl start kubelet; systemctl enable kubelet
systemctl status containerd; crictl ps
kubectl get nodes""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
pass "理论题：请阅读答案后执行 cka done 24 标记完成""" + '"' + """
""",
"""#!/bin/bash
true""")

# ---------------- 25 Helm ----------------
add("25", "用 Helm 生成 Argo CD 清单（不装 CRD）", "生态工具", 10,
"""1. 添加官方 Argo CD Helm 仓库，命名为 `argo`。
2. 为 `argocd` 命名空间生成 Argo CD 7.7.3 版本的模板，保存到 `~/argo-helm.yaml`。
3. 配置为不安装 CRD（crds.install=false）。""",
"""helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm template argocd argo/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false > ~/argo-helm.yaml
head -20 ~/argo-helm.yaml""",
"""#!/bin/bash
source /opt/cka/lib/setup.sh
rm -f "$HOME/argo-helm.yaml"
true""",
"""#!/bin/bash
source /opt/cka/lib/common.sh
if [ -s "$HOME/argo-helm.yaml" ]; then
  pass "argo-helm.yaml 已创建"
  T=$(cat "$HOME/argo-helm.yaml")
  assert_contains "包含 Deployment 清单" "kind: Deployment" "$T"
  assert_not_contains "未安装 CRD" "kind: CustomResourceDefinition" "$T"
  assert_contains "包含 argocd 命名空间" "namespace: argocd" "$T"
else
  fail "~/argo-helm.yaml 不存在或为空"
fi
true""",
"""#!/bin/bash
rm -f "$HOME/argo-helm.yaml"
true""")

# ---------------- 写出文件 ----------------
os.makedirs("/workspace/cka-practice/lib", exist_ok=True)
with open("/workspace/cka-practice/lib/setup.sh", "w") as f:
    f.write(SETUP_LIB)

for tid, t in TASKS.items():
    slug = tid
    d = os.path.join(BASE, slug)
    os.makedirs(d, exist_ok=True)
    meta = f"""#!/bin/bash
TITLE={shq(t['title'])}
CATEGORY={shq(t['category'])}
WEIGHT={t['weight']}
DESCRIPTION=$(cat <<'CKA_META_EOF'
{t['desc']}
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
{t['hint']}
CKA_META_EOF
)
"""
    with open(os.path.join(d, "meta.sh"), "w") as f:
        f.write(meta)
    for name, content in (("setup.sh", t["setup"]), ("check.sh", t["check"]), ("clean.sh", t["clean"])):
        with open(os.path.join(d, name), "w") as f:
            f.write(content)
    for name in ("setup.sh", "check.sh", "clean.sh"):
        os.chmod(os.path.join(d, name), 0o755)

print(f"生成完成：{len(TASKS)} 道题")
print("权重合计:", sum(t["weight"] for t in TASKS.values()))
