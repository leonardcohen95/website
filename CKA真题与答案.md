# CKA 最新真题与答案（2026 年 10 月整理）

> ⚠️ **说明**：CKA 是**纯实操（Performance-Based）**考试，15–20 道任务题、2 小时、满分 1000、及格 700。题目由 Linux Foundation 定期轮换，以下为公开渠道（actual4test / certsteps / examcert / sailor.sh / dumpscollection，更新于 2026 年 10 月）整理的**高频真题 + 参考答案**，用于备考练习，不保证与你当场抽到的题目完全一致。

---

## 目录

- [一、集群架构、安装与配置（25%）](#一集群架构安装与配置25)
- [二、工作负载与调度（15%）](#二工作负载与调度15)
- [三、服务与网络（20%）](#三服务与网络20)
- [四、存储（10%）](#四存储10)
- [五、故障排查（30%）](#五故障排查30)
- [六、Helm / 生态工具](#六helm--生态工具)
- [附：考试高频命令速查](#附考试高频命令速查)

---

## 一、集群架构、安装与配置（25%）

### 题 1：修复迁移后损坏的单节点集群（外部 etcd）

**题目**：kubeadm 集群迁移到新机器后损坏，原集群使用外部 etcd。找出并修复所有损坏的组件。

**答案**：
```bash
ssh cka000059
# 1. 查看 kubelet 和控制面 Pod 状态
sudo systemctl status kubelet
sudo crictl ps -a | grep kube
# 2. 检查 apiserver 清单
sudo nano /etc/kubernetes/manifests/kube-apiserver.yaml
#    修正 --etcd-servers= 指向新的外部 etcd 地址
#    确认 --etcd-cafile/--etcd-certfile/--etcd-keyfile 路径正确
# 3. 保存后静态 Pod 自动被 kubelet 拉起
kubectl get nodes
kubectl get componentstatuses
```

### 题 2：创建 ClusterRole 并绑定到指定 SA（限定命名空间）

**题目**：创建 ClusterRole `deployment-clusterrole`，只允许 create Deployment/StatefulSet/DaemonSet；在 `app-team1` 命名空间创建 SA `cicd-token`；将该 ClusterRole 绑定到此 SA，仅限 `app-team1` 命名空间。

**答案**：
```bash
kubectl create clusterrole deployment-clusterrole \
  --verb=create --resource=deployments,statefulsets,daemonsets

kubectl create serviceaccount cicd-token -n app-team1

kubectl create rolebinding deployment-clusterrole \
  --clusterrole=deployment-clusterrole \
  --serviceaccount=app-team1:cicd-token \
  -n app-team1
```

### 题 3：用 kubeadm 升级控制面节点 1.29 → 1.30

**题目**：将控制面节点从 v1.29.x 升级到 v1.30.0，并升级该节点上的 kubelet 和 kubectl。

**答案**：
```bash
apt-get update
apt-cache madison kubeadm | grep 1.30
apt-get install -y kubeadm=1.30.0-1.1
kubeadm upgrade plan
kubeadm upgrade apply v1.30.0

# 排空节点
kubectl drain <cp-node> --ignore-daemonsets --delete-emptydir-data

# 升级 kubelet + kubectl
apt-get install -y kubelet=1.30.0-1.1 kubectl=1.30.0-1.1
systemctl daemon-reload
systemctl restart kubelet

kubectl uncordon <cp-node>
kubectl get nodes   # 确认 v1.30.0
```

### 题 4：etcd 数据备份

**题目**：将 etcd 数据备份到 `/opt/etcd-snapshot.db`，etcd 端点 `https://127.0.0.1:2379`，证书在默认 `/etc/kubernetes/pki/etcd/`。

**答案**：
```bash
ETCDCTL_API=3 etcdctl snapshot save /opt/etcd-snapshot.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

# 验证
ETCDCTL_API=3 etcdctl snapshot status /opt/etcd-snapshot.db --write-out=table
```

### 题 5：RBAC —— 多资源 Role 绑定 SA

**题目**：在 `development` 命名空间创建 SA `dev-user`；创建 Role `dev-role`，允许对 pods 执行 get/list/watch，对 deployments 和 services 执行 get/list；绑定到 SA。

**答案**：
```bash
kubectl create sa dev-user -n development
kubectl create role dev-role -n development \
  --verb=get,list,watch --resource=pods \
  --verb=get,list --resource=deployments,deployments.apps \
  --verb=get,list --resource=services
kubectl create rolebinding dev-user-binding -n development \
  --role=dev-role --serviceaccount=development:dev-user

# 验证
kubectl auth can-i get pods --as=system:serviceaccount:development:dev-user -n development
kubectl auth can-i delete pods --as=system:serviceaccount:development:dev-user -n development
```

### 题 6：列出 cert-manager CRDs 并提取字段说明

**题目**：用 kubectl 列出所有 cert-manager CRD，保存到 `~/resources.yaml`（用默认输出格式，不要加 -o）；提取 Certificate CR 的 `spec.subject` 字段说明到 `~/subject.yaml`。

**答案**：
```bash
ssh cka000055
kubectl get crds | grep cert-manager | awk '{print $1}' | xargs kubectl get crd > ~/resources.yaml
kubectl explain certificate.spec.subject > ~/subject.yaml
```

---

## 二、工作负载与调度（15%）

### 题 7：创建含两个容器的 Pod

**题目**：创建 Pod `kucc1`，包含 2 个应用容器，镜像分别为 `redis` 和 `memcached`。

**答案**：
```yaml
# kucc1.yaml
apiVersion: v1
kind: Pod
metadata:
  name: kucc1
spec:
  containers:
  - name: redis
    image: redis
  - name: memcached
    image: memcached
```
```bash
kubectl apply -f kucc1.yaml
```

### 题 8：创建 namespace 并在其中运行 Pod

**题目**：创建命名空间 `development`，在其中运行镜像为 nginx 的 Pod `nginx`。

**答案**：
```bash
kubectl create namespace development
kubectl run nginx --image=nginx --restart=Never -n development
```

### 题 9：创建带资源限制的 Pod

**题目**：创建 Pod `memory-pod`，镜像 `nginx:latest`，memory request 128Mi / limit 256Mi，CPU request 100m / limit 500m。

**答案**：
```bash
kubectl run memory-pod --image=nginx:latest \
  --requests=memory=128Mi,cpu=100m \
  --limits=memory=256Mi,cpu=500m
```
或 YAML：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: memory-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest
    resources:
      requests: {memory: "128Mi", cpu: "100m"}
      limits:   {memory: "256Mi", cpu: "500m"}
```

### 题 10：Deployment 滚动更新与回滚

**题目**：Deployment `web-app`（5 副本，`myapp:v1`）升级镜像到 `myapp:v2`，查看滚动状态和历史，必要时回滚。

**答案**：
```bash
# 更新镜像
kubectl set image deployment/web-app myapp=myapp:v2 --record
# 或：kubectl patch deployment web-app -p '{"spec":{"template":{"spec":{"containers":[{"name":"myapp","image":"myapp:v2"}]}}}}'

# 监控
kubectl rollout status deployment/web-app --watch
# 历史
kubectl rollout history deployment/web-app
# 回滚到上一版本
kubectl rollout undo deployment/web-app
# 或回滚到指定版本
kubectl rollout undo deployment/web-app --to-revision=1
```

### 题 11：按节点容量均分资源请求（Pod 起不来）

**题目**：`relative-fawn` 命名空间的 WordPress Deployment（3 副本）因资源请求过高 Pod 无法启动。将节点 CPU/内存均分给 3 个 Pod。

**答案**：
```bash
ssh cka000058
# 查看节点容量
kubectl describe node | grep -A5 "Capacity"
# 例如 cpu:3, memory:3Gi → 每个 pod cpu:1, memory:1Gi
kubectl edit deployment wordpress -n relative-fawn
# 在 spec.template.spec.containers[].resources.requests 中设置：
#   cpu: "1"
#   memory: "1Gi"
kubectl get pods -n relative-fawn   # 确认全部 Running
```

### 题 12：给 Pod 添加 init container

**题目**：修改 `/opt/KUCC00108/pod-spec-KUCC00108.yaml`，为 Pod `hungry-bear` 添加 init container，创建空文件 `/workdir/calm.txt`；主容器检测不到该文件则退出。然后创建 Pod。

**答案**：
```yaml
spec:
  initContainers:
  - name: init
    image: busybox
    command: ["sh", "-c", "touch /workdir/calm.txt"]
    volumeMounts:
    - name: workdir
      mountPath: /workdir
  containers:
  - name: hungry-bear
    image: busybox
    command: ["sh", "-c", "if [ ! -f /workdir/calm.txt ]; then exit 1; fi; sleep 3600"]
    volumeMounts:
    - name: workdir
      mountPath: /workdir
  volumes:
  - name: workdir
    emptyDir: {}
```
```bash
kubectl apply -f /opt/KUCC00108/pod-spec-KUCC00108.yaml
```

---

## 三、服务与网络（20%）

### 题 13：NetworkPolicy —— 只允许 frontend 访问 backend

**题目**：从 `~/netpol` 目录的样例中选一个 NetworkPolicy 应用，使 `frontend` 命名空间的 Pod 能访问 `backend` 命名空间的 Pod，但不要过度宽松。

**答案**：
```bash
ssh cka000056
kubectl get deploy -n frontend -o yaml   # 查看 label
kubectl get deploy -n backend -o yaml
ls ~/netpol && cat ~/netpol/*.yaml       # 审查样例
kubectl apply -f ~/netpol/<chosen>.yaml
```
正确策略示例：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: backend
spec:
  podSelector:
    matchLabels: {app: backend}
  ingress:
  - from:
    - namespaceSelector:
        matchLabels: {name: frontend}
      podSelector:
        matchLabels: {app: frontend}
```

### 题 14：ConfigMap 更新 TLS 配置并滚动重启 Deployment

**题目**：`nginx-static` 命名空间的 Deployment `nginx-static` 使用 ConfigMap `nginx-config`。更新 ConfigMap 使其允许 TLSv1.2，并用 `curl --tls-max 1.2 https://web.k8s.local` 验证。

**答案**：
```bash
ssh cka000048b
kubectl get cm nginx-config -n nginx-static -o yaml > cm.yaml
# 编辑：ssl_protocols TLSv1.2 TLSv1.3;
kubectl apply -f cm.yaml
kubectl rollout restart deploy nginx-static -n nginx-static
curl --tls-max 1.2 https://web.k8s.local
```

### 题 15：统计可调度的 Ready 节点数并写入文件

**题目**：统计 Ready 且可调度（不含 NoSchedule 污点）的节点数，写入 `/opt/KUSC00402/kusc00402.txt`。

**答案**：
```bash
kubectl describe nodes | grep -i ready | wc -l
kubectl describe nodes | grep -i taint | grep -i noschedule | wc -l
# 总数 - NoSchedule 数 = 可调度数
echo 3 > /opt/KUSC00402/kusc00402.txt
```

### 题 16：创建 Ingress

**题目**：在 `web` 命名空间创建 Ingress `web-ingress`，将 `app.example.com/` 路由到 Service `web-svc:80`。Ingress 控制器已安装。

**答案**：
```bash
kubectl create ingress web-ingress -n web \
  --rule="app.example.com/=web-svc:80" --class=nginx
# 或 YAML：
kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: web
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service: {name: web-svc, port: {number: 80}}
EOF
kubectl get ingress -n web
```

### 题 17：NetworkPolicy —— 默认拒绝 + 按需放行

**题目**：在 `secure` 命名空间创建 `deny-all-ingress` 拒绝所有入站；再创建 `allow-web-ingress` 只允许带 `role=frontend` 标签的 Pod 访问 80 端口。

**答案**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: secure
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-ingress
  namespace: secure
spec:
  podSelector: {}
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector:
        matchLabels: {role: frontend}
    ports:
    - port: 80
```
```bash
kubectl apply -f policies.yaml
```

### 题 18：用 custom-columns 输出 Pod

**题目**：列出 nginx Pod，自定义列名为 `POD_NAME` 和 `POD_STATUS`。

**答案**：
```bash
kubectl get po -o=custom-columns="POD_NAME:.metadata.name,POD_STATUS:.status.containerStatuses[].state"
```

---

## 四、存储（10%）

### 题 19：用保留的 PV 创建 PVC 并恢复 MariaDB

**题目**：`mariadb` 命名空间的 MariaDB Deployment 被误删，需恢复数据持久化。用唯一现存的 Retain PV 创建 PVC `mariadb`（RWO，250Mi），修改 `~/mariadb-deployment.yaml` 使用该 PVC 并应用。

**答案**：
```bash
ssh cka000047
kubectl get pv   # 记下唯一的 Retain PV 名，如 mariadb-pv

cat <<EOF > mariadb-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mariadb
  namespace: mariadb
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 250Mi
  volumeName: mariadb-pv
EOF
kubectl apply -f mariadb-pvc.yaml

# 编辑 deployment，在容器加 volumeMounts，在 pod spec 加 volumes
nano ~/mariadb-deployment.yaml
#   volumeMounts:
#   - name: mariadb-storage
#     mountPath: /var/lib/mysql
#   volumes:
#   - name: mariadb-storage
#     persistentVolumeClaim:
#       claimName: mariadb
kubectl apply -f ~/mariadb-deployment.yaml
kubectl get pods -n mariadb
```

### 题 20：创建 hostPath PV（ReadWriteMany）

**题目**：创建 PV `app-data`，容量 2Gi，访问模式 ReadWriteMany，类型 hostPath，路径 `/srv/app-data`。

**答案**：
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-data
spec:
  capacity:
    storage: 2Gi
  accessModes: ["ReadWriteMany"]
  hostPath:
    path: /srv/app-data
```
```bash
kubectl apply -f pv.yaml
kubectl get pv app-data
```

### 题 21：创建 PV + PVC 并绑定

**题目**：创建 PV `pv-data`（2Gi，RWO，Retain，hostPath `/mnt/data`），再创建 PVC `pvc-data`（1Gi，RWO，default 命名空间）。

**答案**：
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity: {storage: 2Gi}
  accessModes: [ReadWriteOnce]
  persistentVolumeReclaimPolicy: Retain
  hostPath: {path: /mnt/data}
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data
  namespace: default
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests: {storage: 1Gi}
```
```bash
kubectl apply -f pv-pvc.yaml
kubectl get pvc pvc-data    # 状态应为 Bound
```

---

## 五、故障排查（30%）

### 题 22：提取 Pod 日志中的特定错误行

**题目**：监控 Pod `foo` 的日志，提取含 `unable-to-access-website` 的行，写入 `/opt/KULM00201/foo`。

**答案**：
```bash
kubectl config use-context k8s
kubectl logs foo | grep "unable-to-access-website" > /opt/KULM00201/foo
cat /opt/KULM00201/foo
```

### 题 23：排查 CrashLoopBackOff Pod

**题目**：`prod` 命名空间的 Pod `web-app` 处于 CrashLoopBackOff，查明原因并修复，使其运行 `nginx:1.25` 并转为 Running。

**答案**：
```bash
kubectl describe pod web-app -n prod     # 看 Events
kubectl logs web-app -n prod             # 当前日志
kubectl logs web-app -n prod --previous  # 上一次崩溃的日志
# 常见原因：镜像 tag 错误、缺少 ConfigMap/Secret 挂载、command/args 错误
# 修复：
kubectl get pod web-app -n prod -o yaml > web-app.yaml
# 编辑修正后重建
kubectl delete pod web-app -n prod && kubectl apply -f web-app.yaml
```

### 题 24：修复 NotReady 节点

**题目**：节点 `worker-01` 状态 NotReady，排查并恢复为 Ready（不能重启节点）。

**答案**：
```bash
kubectl describe node worker-01    # 看 Conditions 和 Events
ssh worker-01
systemctl status kubelet           # kubelet 是否运行
journalctl -u kubelet --since "10 minutes ago" --no-pager
# 常见修复：
systemctl start kubelet
systemctl enable kubelet
# 容器运行时：
systemctl status containerd
crictl ps
# 从控制面验证：
kubectl get nodes   # worker-01 应为 Ready
```

---

## 六、Helm / 生态工具

### 题 25：用 Helm 生成 Argo CD 清单（不装 CRD）

**题目**：添加官方 Argo CD Helm 仓库 `argo`；为 `argocd` 命名空间生成 Argo CD 7.7.3 的模板，保存到 `~/argo-helm.yaml`，配置不安装 CRD。

**答案**：
```bash
ssh cka000060
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm template argocd argo/argo-cd \
  --version 7.7.3 \
  --namespace argocd \
  --set crds.install=false \
  > ~/argo-helm.yaml
```

---

## 附：考试高频命令速查

| 场景 | 命令 |
|------|------|
| 切上下文（必考开头） | `kubectl config use-context <ctx>` |
| 查资源字段 | `kubectl explain <res>.<field>` |
| 快速生成 YAML | `kubectl <create> ... --dry-run=client -o yaml > f.yaml` |
| 查看事件 | `kubectl get events --sort-by=.metadata.creationTimestamp` |
| 进容器调试 | `kubectl exec -it <pod> -- sh` |
| 临时调试 Pod | `kubectl debug <pod> -it --image=busybox` |
| 节点资源 | `kubectl describe node \| grep -A5 Capacity` |
| 污点/容忍 | `kubectl taint node <n> key=val:NoSchedule` |
| 回滚 Deployment | `kubectl rollout undo deploy/<name>` |
| 重启 Deployment | `kubectl rollout restart deploy/<name>` |
| 查看 rollout 历史 | `kubectl rollout history deploy/<name>` |
| 权限验证 | `kubectl auth can-i <verb> <res> --as=<user> -n <ns>` |
| 节点排水/恢复调度 | `kubectl drain/uncordon <node>` |

---

## 备考建议

| 领域 | 权重 | 重点命令 |
|------|------|----------|
| 集群架构/安装/配置 | 25% | `kubeadm upgrade`、`systemctl`、静态 Pod 清单 `/etc/kubernetes/manifests`、RBAC、etcd 备份恢复 |
| 工作负载/调度 | 15% | `kubectl run/create/apply`、Deployment、Pod 多容器、Taint/Toleration、资源 requests/limits |
| 服务/网络 | 20% | Service、DNS、NetworkPolicy、Ingress、CoreDNS |
| 存储 | 10% | PV/PVC、StorageClass、Volume 挂载 |
| 故障排查 | 30% | `kubectl logs/describe/exec`、`crictl`、节点 NotReady 排查 |

**考试技巧**：
1. 每道题开头都有 `ssh <host>`，**必须先切换到正确节点**，否则 0 分
2. 善用 `kubectl explain <resource>.<field>` 查字段
3. 不会的命令用 `kubectl <cmd> --help`，考试环境允许查官方文档（kubernetes.io/docs）
4. 优先做高分题（标了 Score 的），卡住先跳过
5. 用 `--dry-run=client -o yaml` 快速生成 YAML 再编辑，比手写快且不易错
