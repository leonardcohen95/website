# Kubernetes 命令实战手册

> 一本面向运维与开发者的 kubectl 速查与实战指南，从入门到精通。

---

## 前言

`kubectl` 是 Kubernetes 的官方命令行工具，也是日常运维中使用最频繁的工具。本手册按使用场景分类，收录了最常用的命令及其典型用法与实战用例，适合随身携带、随时查阅。

**版本说明：** 本手册以 Kubernetes 1.27+ 为准，命令语法兼容 1.20+ 版本。

---

## 目录

1. kubectl 基础与配置
2. 资源查看：get 命令详解
3. 资源详情：describe 命令
4. 资源创建与管理：create / apply / delete
5. Pod 管理与调试
6. 工作负载：Deployment / StatefulSet / DaemonSet
7. Service 与网络
8. 存储管理：PV / PVC / StorageClass
9. 配置管理：ConfigMap / Secret
10. 日志与排障
11. 集群节点与调度
12. 发布与回滚：rollout
13. 扩缩容：scale / autoscale
14. 标签、注解与污点
15. Helm 包管理器
16. 实战故障排查案例
17. 速查表

---

# 第1章 kubectl 基础与配置

## 1.1 安装与版本查看

```bash
# 查看 kubectl 版本
kubectl version --client

# 查看客户端和服务端版本（需要集群连接）
kubectl version

# 以 YAML 格式输出详细版本信息
kubectl version -o yaml
```

## 1.2 集群连接配置

`kubectl` 通过 kubeconfig 文件连接集群，默认路径为 `~/.kube/config`。

```bash
# 查看当前 kubeconfig 配置
kubectl config view

# 查看所有集群
kubectl config get-clusters

# 查看所有上下文（context）
kubectl config get-contexts

# 查看当前上下文
kubectl config current-context

# 切换上下文
kubectl config use-context my-cluster

# 查看当前命名空间
kubectl config view --minify | grep namespace:
```

### 实战：切换命名空间并设置默认

```bash
# 设置当前 context 的默认命名空间为 production
kubectl config set-context --current --namespace=production

# 验证
kubectl config view --minify -o jsonpath='{..namespace}'
```

## 1.3 多集群管理

```bash
# 添加一个新的集群
kubectl config set-cluster mycluster --server=https://1.2.3.4:6443

# 添加用户凭证
kubectl config set-credentials admin --token=xxxxx

# 创建上下文（绑定集群与用户）
kubectl config set-context mycluster-ctx --cluster=mycluster --user=admin

# 切换到该上下文
kubectl config use-context mycluster-ctx
```

## 1.4 命令自动补全

```bash
# Bash 自动补全（临时生效）
source <(kubectl completion bash)

# 永久生效
echo "source <(kubectl completion bash)" >> ~/.bashrc

# Zsh 自动补全
source <(kubectl completion zsh)
echo "source <(kubectl completion zsh)" >> ~/.zshrc
```

---

# 第2章 资源查看：get 命令详解

`kubectl get` 是最常用的命令，用于列出集群资源。

## 2.1 基础语法

```bash
kubectl get <资源类型> [资源名称] [选项]
```

常见资源类型缩写：

| 全称 | 缩写 |
|------|------|
| pods | po |
| services | svc |
| deployments | deploy |
| replicasets | rs |
| daemonsets | ds |
| statefulsets | sts |
| configmaps | cm |
| secrets | sec |
| persistentvolumeclaims | pvc |
| persistentvolumes | pv |
| nodes | no |
| namespaces | ns |
| jobs | job |
| cronjobs | cj |
| ingress | ing |
| horizontalpodautoscalers | hpa |
| serviceaccounts | sa |
| roles | - |
| clusterroles | - |
| rolebindings | - |
| clusterrolebindings | - |

## 2.2 查看 Pod

```bash
# 查看 default 命名空间的所有 Pod
kubectl get pods

# 查看所有命名空间的 Pod
kubectl get pods -A
# 或
kubectl get pods --all-namespaces

# 查看指定命名空间的 Pod
kubectl get pods -n kube-system

# 查看 Pod 的更多信息（IP、节点）
kubectl get pods -o wide

# 查看单个 Pod 的详细信息
kubectl get pod nginx-7d8b4f5c6d-abcde

# 以 YAML 格式输出
kubectl get pod nginx-7d8b4f5c6d-abcde -o yaml

# 以 JSON 格式输出
kubectl get pod nginx-7d8b4f5c6d-abcde -o json

# 只显示名称
kubectl get pods -o name

# 显示 Pod 的标签
kubectl get pods --show-labels

# 按标签筛选
kubectl get pods -l app=nginx
kubectl get pods -l app in (nginx,redis)
kubectl get pods -l 'environment in (production),tier in (frontend)'

# 按字段筛选
kubectl get pods --field-selector status.phase=Running

# 按节点筛选
kubectl get pods --field-selector spec.nodeName=node01

# 排序输出
kubectl get pods --sort-by=.metadata.name
kubectl get pods --sort-by=.status.startTime

# 自定义列输出
kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName
```

## 2.3 查看其他资源

```bash
# 查看所有 Service
kubectl get svc

# 查看所有 Deployment
kubectl get deploy

# 查看所有命名空间
kubectl get ns

# 查看所有节点
kubectl get nodes

# 查看节点标签
kubectl get nodes --show-labels

# 查看节点的资源使用情况
kubectl get nodes -o wide

# 查看 Ingress
kubectl get ing

# 查看 PV 和 PVC
kubectl get pv,pvc

# 查看所有资源（简写）
kubectl get all

# 查看指定命名空间下的所有资源
kubectl get all -n production

# 查看事件
kubectl get events
kubectl get events -n kube-system --sort-by='.lastTimestamp'
```

## 2.4 格式化输出

```bash
# jsonpath 提取特定字段
kubectl get pod nginx -o jsonpath='{.status.podIP}'

# 提取所有 Pod 的 IP
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}'

# 提取 Pod 的容器镜像
kubectl get pod nginx -o jsonpath='{.spec.containers[*].image}'

# 将资源导出为 YAML（去掉运行时字段）
kubectl get pod nginx -o yaml --export  # 旧版本
kubectl get pod nginx -o yaml  # 新版本手动去除 status 字段
```

---

# 第3章 资源详情：describe 命令

`kubectl describe` 显示资源的详细信息，包括事件（Events），是排障的利器。

## 3.1 基础用法

```bash
kubectl describe <资源类型> <资源名称>
```

## 3.2 常用 describe 命令

```bash
# 查看 Pod 详情（含事件）
kubectl describe pod nginx-7d8b4f5c6d-abcde

# 查看指定命名空间的 Pod
kubectl describe pod nginx -n production

# 查看 Deployment 详情
kubectl describe deploy nginx

# 查看 Service 详情
kubectl describe svc nginx

# 查看 Node 详情（含资源分配、污点）
kubectl describe node node01

# 查看 Namespace 详情
kubectl describe ns production

# 查看 PVC 详情（排查挂载失败）
kubectl describe pvc data-nginx-0

# 查看 PV 详情
kubectl describe pv pv-001

# 查看 Secret 详情（注意不会直接显示 base64 内容）
kubectl describe secret my-secret

# 查看所有事件
kubectl describe events

# 不指定名称时，列出该类型所有资源的详情
kubectl describe pods
```

## 3.3 describe 输出结构

describe Pod 时输出包含以下关键部分：

```
Name:         nginx-7d8b4f5c6d-abcde
Namespace:    default
Priority:     0
Node:         node01/192.168.1.10
Start Time:   ...
Labels:       app=nginx
Status:       Running
IP:           10.244.1.5
IPs:
  IP:           10.244.1.5
Containers:
  nginx:
    Image:          nginx:latest
    State:          Running
    Ready:          True
    Restart Count:  0
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Events:            <事件列表，排障关键>
```

---

# 第4章 资源创建与管理：create / apply / delete

## 4.1 create 命令

`create` 用于创建资源，如果资源已存在会报错。

```bash
# 基于 YAML 文件创建
kubectl create -f nginx-deployment.yaml

# 基于目录创建所有资源
kubectl create -f ./manifests/

# 基于 URL 创建
kubectl create -f https://example.com/nginx.yaml

# 命令行直接创建命名空间
kubectl create namespace production

# 创建 ConfigMap
kubectl create configmap app-config --from-literal=log_level=info

# 创建 Secret
kubectl create secret generic db-pass --from-literal=password=123456

# 创建 ServiceAccount
kubectl create serviceaccount my-sa

# 创建 Deployment（运行镜像）
kubectl create deployment nginx --image=nginx:latest

# 创建 Service
kubectl create service clusterip nginx --tcp=80:80

# 创建 Job
kubectl create job myjob --image=busybox -- echo "hello"

# 试运行（不真正创建）
kubectl create -f nginx.yaml --dry-run=client

# 输出 YAML（用于生成模板）
kubectl create deployment nginx --image=nginx --dry-run=client -o yaml
```

## 4.2 apply 命令

`apply` 是声明式管理的核心，会根据 YAML 文件的期望状态进行创建或更新。

```bash
# 创建或更新资源
kubectl apply -f nginx-deployment.yaml

# 应用目录下所有文件
kubectl apply -f ./manifests/

# 应用 URL
kubectl apply -f https://example.com/nginx.yaml

# 试运行，显示将要执行的变更
kubectl apply -f nginx.yaml --dry-run=client

# 显示 diff
kubectl apply -f nginx.yaml --server-dry-run

# 应用时添加标签
kubectl apply -f nginx.yaml -l app=nginx

# 强制更新（先删后建）
kubectl apply -f nginx.yaml --force

# 递归应用目录
kubectl apply -f ./k8s/ --recursive
```

### 实战：用 apply 更新镜像

```bash
# 方法一：修改 YAML 后 apply
kubectl apply -f deployment.yaml

# 方法二：直接 set image（不需要改 YAML）
kubectl set image deployment/nginx nginx=nginx:1.25.3
```

## 4.3 edit 命令

```bash
# 在线编辑资源（会打开默认编辑器）
kubectl edit deploy nginx

# 编辑指定命名空间的资源
kubectl edit pod nginx -n production

# 指定编辑器
KUBE_EDITOR="nano" kubectl edit deploy nginx
```

## 4.4 patch 命令

```bash
# 部分更新资源
kubectl patch deploy nginx -p '{"spec":{"replicas":5}}'

# patch 容器镜像
kubectl patch deploy nginx --type='json' -p='[{"op":"replace","path":"/spec/template/spec/containers/0/image","value":"nginx:1.25.3"}]'

# patch 节点添加标签
kubectl patch node node01 -p '{"metadata":{"labels":{"gpu":"true"}}}'

# 添加注解
kubectl patch svc nginx -p '{"metadata":{"annotations":{"description":"nginx service"}}}'
```

## 4.5 delete 命令

```bash
# 删除指定 Pod
kubectl delete pod nginx-7d8b4f5c6d-abcde

# 强制删除（不等待优雅终止）
kubectl delete pod nginx --grace-period=0 --force

# 按标签删除
kubectl delete pod -l app=nginx

# 删除所有 Pod（危险）
kubectl delete pods --all

# 删除 Deployment
kubectl delete deploy nginx

# 删除 Service
kubectl delete svc nginx

# 删除命名空间（会删除该空间下所有资源）
kubectl delete namespace production

# 基于 YAML 文件删除
kubectl delete -f nginx-deployment.yaml

# 删除多个资源
kubectl delete pod,svc -l app=nginx

# 级联删除（默认）与非级联删除
kubectl delete deploy nginx                    # 级联删除 Pod
kubectl delete deploy nginx --cascade=orphan   # 不删除 Pod
```

---

# 第5章 Pod 管理与调试

## 5.1 进入容器

```bash
# 进入 Pod 中的容器（多容器时指定 -c）
kubectl exec -it nginx-7d8b4f5c6d-abcde -- /bin/bash

# 指定容器
kubectl exec -it nginx-pod -c nginx -- /bin/sh

# 执行单条命令
kubectl exec nginx-pod -- ls /usr/share/nginx/html

# 执行多条命令
kubectl exec nginx-pod -- sh -c "echo hello && echo world"
```

## 5.2 端口转发

```bash
# 将本地 8080 端口转发到 Pod 的 80 端口
kubectl port-forward pod/nginx-7d8b4f5c6d-abcde 8080:80

# 转发到 Service
kubectl port-forward svc/nginx 8080:80

# 转发到 Deployment
kubectl port-forward deploy/nginx 8080:80

# 监听所有网卡（默认只监听 127.0.0.1）
kubectl port-forward --address 0.0.0.0 pod/nginx 8080:80

# 转发多个端口
kubectl port-forward pod/nginx 8080:80 8443:443
```

## 5.3 复制文件

```bash
# 从本地复制到 Pod
kubectl cp ./index.html nginx-7d8b4f5c6d-abcde:/usr/share/nginx/html/

# 指定容器
kubectl cp ./index.html nginx-pod:/usr/share/nginx/html/ -c nginx

# 从 Pod 复制到本地
kubectl cp nginx-7d8b4f5c6d-abcde:/var/log/nginx/access.log ./access.log

# 从 Pod 复制目录
kubectl cp nginx-pod:/etc/nginx ./nginx-config
```

## 5.4 日志查看

```bash
# 查看 Pod 日志
kubectl logs nginx-7d8b4f5c6d-abcde

# 查看指定容器的日志
kubectl logs nginx-pod -c nginx

# 实时跟踪日志（类似 tail -f）
kubectl logs -f nginx-7d8b4f5c6d-abcde

# 查看最后 100 行
kubectl logs --tail=100 nginx-pod

# 查看最近 1 小时的日志
kubectl logs --since=1h nginx-pod

# 查看指定时间之后的日志
kubectl logs --since-time=2024-01-01T00:00:00Z nginx-pod

# 查看上一个容器的日志（容器重启后）
kubectl logs --previous nginx-pod

# 查看 Pod 中所有容器的日志
kubectl logs --all-containers=true my-pod

# 按标签查看多个 Pod 的日志（kubectl 1.27+）
kubectl logs -l app=nginx --all-containers=true
```

## 5.5 调试容器

```bash
# 在运行中的 Pod 中创建临时调试容器
kubectl debug nginx-pod -it --image=busybox:1.35 --target=nginx

# 复制 Pod 进行调试（不影响原 Pod）
kubectl debug nginx-pod -it --copy-to=nginx-debug --image=busybox

# 在特定节点上启动调试 Pod
kubectl debug node/node01 -it --image=busybox

# 调试完成后清理
kubectl delete pod nginx-debug
```

---

# 第6章 工作负载

## 6.1 Deployment

Deployment 用于管理无状态应用，支持滚动更新和回滚。

```bash
# 查看 Deployment
kubectl get deploy

# 查看 Deployment 详情
kubectl describe deploy nginx

# 查看 Deployment 状态
kubectl rollout status deploy/nginx

# 查看历史版本
kubectl rollout history deploy/nginx

# 查看指定版本的详情
kubectl rollout history deploy/nginx --revision=2

# 回滚到上一版本
kubectl rollout undo deploy/nginx

# 回滚到指定版本
kubectl rollout undo deploy/nginx --to-revision=2

# 暂停滚动更新
kubectl rollout pause deploy/nginx

# 继续滚动更新
kubectl rollout resume deploy/nginx

# 更新镜像
kubectl set image deploy/nginx nginx=nginx:1.25.3

# 查看 Deployment 的 YAML
kubectl get deploy nginx -o yaml
```

### 滚动更新策略

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # 更新时最多可超出的 Pod 数
      maxUnavailable: 25%  # 更新时最多不可用的 Pod 数
```

## 6.2 StatefulSet

StatefulSet 用于管理有状态应用，提供稳定的网络标识和持久化存储。

```bash
# 查看 StatefulSet
kubectl get sts

# 查看 StatefulSet 详情
kubectl describe sts mysql

# 查看 StatefulSet 的 Pod（有序命名）
kubectl get pods -l app=mysql

# 查看 Headless Service
kubectl get svc mysql

# 更新 StatefulSet 镜像
kubectl set image sts/mysql mysql=mysql:8.0

# 查看更新状态
kubectl rollout status sts/mysql

# 手动管理（Partition 滚动更新）
kubectl patch sts mysql -p '{"spec":{"updateStrategy":{"type":"RollingUpdate","rollingUpdate":{"partition":2}}}}'
```

### 实战：扩容 StatefulSet

```bash
# 扩容到 5 个副本
kubectl scale sts mysql --replicas=5

# 缩容（注意：缩容不会删除 PVC）
kubectl scale sts mysql --replicas=3

# 删除 StatefulSet 但保留 Pod
kubectl delete sts mysql --cascade=orphan
```

## 6.3 DaemonSet

DaemonSet 确保每个节点上运行一个 Pod 副本。

```bash
# 查看 DaemonSet
kubectl get ds

# 查看 DaemonSet 详情
kubectl describe ds fluentd

# 查看 DaemonSet 的 Pod
kubectl get pods -l app=fluentd -o wide

# 更新镜像
kubectl set image ds/fluentd fluentd=fluentd:latest

# 查看更新状态
kubectl rollout status ds/fluentd
```

## 6.4 Job 与 CronJob

```bash
# 创建一次性 Job
kubectl create job myjob --image=busybox -- echo "hello"

# 查看 Job
kubectl get jobs

# 查看 Job 详情
kubectl describe job myjob

# 查看 Job 的 Pod
kubectl get pods -l job-name=myjob

# 创建 CronJob
kubectl create cronjob my-cron --image=busybox --schedule="*/5 * * * *" -- echo "hello"

# 查看 CronJob
kubectl get cj

# 手动触发 CronJob
kubectl create job --from=cronjob/my-cron my-cron-manual

# 查看 CronJob 详情
kubectl describe cj my-cron

# 暂停 CronJob
kubectl patch cronjob my-cron -p '{"spec":{"suspend":true}}'
```

---

# 第7章 Service 与网络

## 7.1 Service 类型

- **ClusterIP**（默认）：集群内部访问
- **NodePort**：通过节点端口暴露
- **LoadBalancer**：云服务商负载均衡器
- **ExternalName**：DNS 别名

## 7.2 Service 管理

```bash
# 查看 Service
kubectl get svc

# 查看 Service 详情（含 Endpoints）
kubectl describe svc nginx

# 查看 Endpoints
kubectl get endpoints
kubectl get endpoints nginx

# 为 Deployment 创建 ClusterIP Service
kubectl expose deploy nginx --port=80 --target-port=80 --type=ClusterIP

# 创建 NodePort Service
kubectl expose deploy nginx --port=80 --type=NodePort

# 创建 LoadBalancer Service
kubectl expose deploy nginx --port=80 --type=LoadBalancer

# 修改 Service 类型
kubectl patch svc nginx -p '{"spec":{"type":"NodePort"}}'
```

## 7.3 Ingress

```bash
# 查看 Ingress
kubectl get ing

# 查看 Ingress 详情
kubectl describe ing my-ingress

# 创建 Ingress（需要 Ingress Controller）
kubectl apply -f ingress.yaml

# 查看 Ingress 控制器 Pod
kubectl get pods -n ingress-nginx
```

### Ingress 示例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

## 7.4 网络策略 NetworkPolicy

```bash
# 查看 NetworkPolicy
kubectl get networkpolicy

# 创建网络策略
kubectl apply -f networkpolicy.yaml

# 查看详情
kubectl describe networkpolicy allow-nginx
```

---

# 第8章 存储管理

## 8.1 PV 与 PVC

```bash
# 查看 PV
kubectl get pv

# 查看 PVC
kubectl get pvc

# 查看 PV 详情
kubectl describe pv pv-001

# 查看 PVC 详情
kubectl describe pvc data-nginx

# 查看 StorageClass
kubectl get sc

# 查看默认 StorageClass
kubectl get sc -o default
```

### 实战：排查 PVC 挂载失败

```bash
# 1. 查看 PVC 状态
kubectl get pvc
# NAME        STATUS    VOLUME   CAPACITY   ACCESS MODES
# data-nginx  Pending

# 2. 查看 PVC 事件
kubectl describe pvc data-nginx
# Events 中会显示失败原因，如 "no persistent volumes available"

# 3. 查看可用 PV
kubectl get pv

# 4. 查看 StorageClass
kubectl get sc
```

## 8.2 存储类 StorageClass

```bash
# 查看所有 StorageClass
kubectl get sc

# 查看详情
kubectl describe sc standard

# 设置默认 StorageClass
kubectl patch sc standard -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

# 取消默认
kubectl patch sc standard -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```

## 8.3 Volume 快照

```bash
# 查看 VolumeSnapshot
kubectl get volumesnapshot

# 创建快照
kubectl apply -f snapshot.yaml

# 从快照恢复 PVC
kubectl apply -f pvc-from-snapshot.yaml
```

---

# 第9章 配置管理：ConfigMap / Secret

## 9.1 ConfigMap

```bash
# 从字面量创建
kubectl create configmap app-config \
  --from-literal=log_level=info \
  --from-literal=max_connections=100

# 从文件创建
kubectl create configmap nginx-config --from-file=nginx.conf

# 从目录创建
kubectl create configmap app-config --from-file=./config/

# 从 env 文件创建
kubectl create configmap env-config --from-env-file=.env

# 查看 ConfigMap
kubectl get cm

# 查看 ConfigMap 内容
kubectl get cm app-config -o yaml

# 编辑 ConfigMap
kubectl edit cm app-config
```

### ConfigMap 使用示例

```yaml
# 作为环境变量
env:
  - name: LOG_LEVEL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: log_level

# 作为卷挂载
volumes:
  - name: config-volume
    configMap:
      name: app-config
containers:
  - volumeMounts:
      - name: config-volume
        mountPath: /etc/config
```

## 9.2 Secret

```bash
# 从字面量创建 generic secret
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=secret123

# 从文件创建
kubectl create secret generic tls-secret \
  --from-file=tls.crt=cert.pem \
  --from-file=tls.key=key.pem

# 创建 TLS secret
kubectl create secret tls my-tls --cert=cert.pem --key=key.pem

# 创建 docker-registry secret（用于拉取私有镜像）
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=admin \
  --docker-password=password \
  --docker-email=admin@example.com

# 查看 Secret（base64 编码）
kubectl get secret db-credentials -o yaml

# 解码查看
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d

# 查看 Secret 类型
kubectl get secret --show-type
```

---

# 第10章 日志与排障

## 10.1 日志查看

```bash
# 查看 Pod 日志
kubectl logs <pod-name>

# 实时跟踪
kubectl logs -f <pod-name>

# 多容器指定
kubectl logs <pod-name> -c <container-name>

# 查看上一个崩溃容器的日志
kubectl logs <pod-name> --previous

# 查看最近 N 行
kubectl logs --tail=100 <pod-name>

# 按时间筛选
kubectl logs --since=30m <pod-name>

# 显示时间戳
kubectl logs --timestamps <pod-name>

# 输出到文件
kubectl logs <pod-name> > pod.log
```

## 10.2 节点资源监控

```bash
# 查看节点资源使用（需要 metrics-server）
kubectl top nodes

# 查看 Pod 资源使用
kubectl top pods

# 查看指定命名空间
kubectl top pods -n kube-system

# 查看 Pod 的容器级资源
kubectl top pod <pod-name> --containers

# 按 CPU 排序
kubectl top pods --sort-by=cpu

# 按内存排序
kubectl top pods --sort-by=memory
```

## 10.3 排障常用命令组合

```bash
# 1. 查看异常 Pod（非 Running 状态）
kubectl get pods -A | grep -v Running

# 2. 查看 Pod 事件
kubectl describe pod <pod-name> | grep -A 20 Events

# 3. 查看节点状态
kubectl get nodes
kubectl describe node <node-name> | grep -A 10 Conditions

# 4. 查看集群事件
kubectl get events -A --sort-by='.lastTimestamp'

# 5. 查看 Pod 为什么调度失败
kubectl describe pod <pending-pod> | grep -A 10 Events

# 6. 查看 kube-system 组件状态
kubectl get pods -n kube-system

# 7. 查看 API Server 日志
kubectl logs -n kube-system kube-apiserver-<node>

# 8. 查看 kubelet 日志（需在节点上执行）
journalctl -u kubelet -f
```

---

# 第11章 集群节点与调度

## 11.1 节点管理

```bash
# 查看节点
kubectl get nodes

# 查看节点详情
kubectl describe node node01

# 查看节点标签
kubectl get nodes --show-labels

# 给节点打标签
kubectl label node node01 disktype=ssd

# 删除标签
kubectl label node node01 disktype-

# 给节点打污点
kubectl taint node node01 key=value:NoSchedule

# 删除污点
kubectl taint node node01 key:NoSchedule-

# 查看节点污点
kubectl describe node node01 | grep Taints

# 封锁节点（不调度新 Pod）
kubectl cordon node01

# 解除封锁
kubectl uncordon node01

# 驱逐节点上的 Pod
kubectl drain node01 --ignore-daemonsets --delete-emptydir-data

# 查看节点资源分配
kubectl describe node node01 | grep -A 5 "Allocated resources"
```

### 实战：节点维护流程

```bash
# 1. 封锁节点
kubectl cordon node01

# 2. 驱逐 Pod（排除 DaemonSet 和本地存储）
kubectl drain node01 --ignore-daemonsets --delete-emptydir-data --force

# 3. 执行维护操作...

# 4. 恢复调度
kubectl uncordon node01
```

## 11.2 调度相关

```bash
# 查看 Pod 调度的节点
kubectl get pods -o wide

# 查看为什么 Pod 无法调度
kubectl describe pod <pending-pod>

# 手动绑定（将 Pod 调度到指定节点）
kubectl patch pod <pod-name> -p '{"spec":{"nodeName":"node01"}}'
```

---

# 第12章 发布与回滚：rollout

## 12.1 rollout 命令

```bash
# 查看部署状态
kubectl rollout status deploy/nginx

# 查看历史版本
kubectl rollout history deploy/nginx

# 回滚到上一版本
kubectl rollout undo deploy/nginx

# 回滚到指定版本
kubectl rollout undo deploy/nginx --to-revision=3

# 暂停部署
kubectl rollout pause deploy/nginx

# 继续部署
kubectl rollout resume deploy/nginx

# 重启 Deployment（创建新的 ReplicaSet）
kubectl rollout restart deploy/nginx

# 重启 StatefulSet
kubectl rollout restart sts/mysql

# 重启 DaemonSet
kubectl rollout restart ds/fluentd
```

## 12.2 滚动更新实战

```bash
# 1. 更新镜像
kubectl set image deploy/nginx nginx=nginx:1.25.3

# 2. 观察更新过程
kubectl rollout status deploy/nginx

# 3. 如果出错，立即回滚
kubectl rollout undo deploy/nginx

# 4. 查看更新前后的 Pod
kubectl get pods -l app=nginx
```

---

# 第13章 扩缩容：scale / autoscale

## 13.1 手动扩缩容

```bash
# 扩容 Deployment
kubectl scale deploy/nginx --replicas=5

# 缩容
kubectl scale deploy/nginx --replicas=1

# 扩容 StatefulSet
kubectl scale sts/mysql --replicas=5

# 同时扩缩多个资源
kubectl scale deploy/nginx deploy/api --replicas=3

# 条件扩缩容（当前副本数大于等于 3 时才缩容到 2）
kubectl scale deploy/nginx --current-replicas=3 --replicas=2
```

## 13.2 自动扩缩容 HPA

```bash
# 创建 HPA
kubectl autoscale deploy/nginx --min=2 --max=10 --cpu-percent=80

# 查看 HPA
kubectl get hpa

# 查看 HPA 详情
kubectl describe hpa nginx

# 删除 HPA
kubectl delete hpa nginx
```

### HPA YAML 示例

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
```

## 13.3 集群节点自动扩缩容（Cluster Autoscaler）

```bash
# 查看集群自动扩缩容状态（云厂商相关）
kubectl get nodes

# 查看不可调度的节点
kubectl get nodes | grep SchedulingDisabled
```

---

# 第14章 标签、注解与污点

## 14.1 标签 Label

```bash
# 给 Pod 打标签
kubectl label pod nginx-pod env=production

# 给节点打标签
kubectl label node node01 zone=us-east-1a

# 给 Deployment 打标签
kubectl label deploy nginx tier=frontend

# 覆盖已有标签
kubectl label pod nginx-pod env=staging --overwrite

# 删除标签
kubectl label pod nginx-pod env-

# 查看资源标签
kubectl get pods --show-labels

# 按标签查询
kubectl get pods -l app=nginx
kubectl get pods -l 'app in (nginx,redis)'
kubectl get pods -l env=production,tier=frontend
```

## 14.2 注解 Annotation

```bash
# 添加注解
kubectl annotate pod nginx-pod description="This is nginx"

# 覆盖注解
kubectl annotate pod nginx-pod description="Updated" --overwrite

# 删除注解
kubectl annotate pod nginx-pod description-

# 查看注解
kubectl describe pod nginx-pod | grep -A 10 Annotations
```

## 14.3 污点与容忍 Taint & Toleration

```bash
# 给节点添加污点
kubectl taint node node01 dedicated=gpu:NoSchedule

# 污点效果类型：
# NoSchedule - 不调度新 Pod（已有 Pod 不受影响）
# PreferNoSchedule - 尽量不调度
# NoExecute - 不调度且驱逐已有 Pod

# 删除污点
kubectl taint node node01 dedicated:NoSchedule-

# 查看节点污点
kubectl describe node node01 | grep Taints
```

---

# 第15章 Helm 包管理器

## 15.1 Helm 基础

```bash
# 查看 Helm 版本
helm version

# 添加仓库
helm repo add bitnami https://charts.bitnami.com/bitnami

# 更新仓库索引
helm repo update

# 查看已添加的仓库
helm repo list

# 搜索 Chart
helm search repo nginx

# 搜索 Artifact Hub
helm search hub nginx

# 查看 Chart 信息
helm show chart bitnami/nginx

# 查看 Chart 的 values
helm show values bitnami/nginx
```

## 15.2 安装与管理 Release

```bash
# 安装 Chart
helm install my-nginx bitnami/nginx

# 安装到指定命名空间
helm install my-nginx bitnami/nginx -n production --create-namespace

# 自定义 values 安装
helm install my-nginx bitnami/nginx -f values.yaml

# 命令行覆盖 values
helm install my-nginx bitnami/nginx --set service.type=NodePort

# 查看已安装的 Release
helm list

# 查看所有命名空间的 Release
helm list -A

# 查看 Release 状态
helm status my-nginx

# 升级 Release
helm upgrade my-nginx bitnami/nginx

# 升级并指定 values
helm upgrade my-nginx bitnami/nginx -f values.yaml

# 回滚 Release
helm rollback my-nginx 1

# 查看历史版本
helm history my-nginx

# 卸载 Release
helm uninstall my-nginx
```

## 15.3 本地 Chart 开发

```bash
# 创建本地 Chart
helm create mychart

# 检查 Chart 语法
helm lint mychart

# 渲染模板（不安装）
helm template mychart

# 安装本地 Chart
helm install my-release ./mychart

# 打包 Chart
helm package mychart
```

---

# 第16章 实战故障排查案例

## 案例1：Pod 一直处于 Pending 状态

```bash
# 1. 查看 Pod 事件
kubectl describe pod my-pod | grep -A 20 Events

# 常见原因：
# - 资源不足："Insufficient cpu/memory"
# - 没有匹配的节点："0/3 nodes are available"
# - PVC 无法绑定："pod has unbound immediate PersistentVolumeClaims"
# - 节点污点不匹配："node(s) had taints that the pod didn't tolerate"

# 2. 查看节点资源
kubectl top nodes

# 3. 查看节点是否可调度
kubectl get nodes | grep SchedulingDisabled

# 4. 解决方案：扩容节点、调整 request、添加容忍、修复 PVC
```

## 案例2：Pod 处于 CrashLoopBackOff

```bash
# 1. 查看 Pod 状态
kubectl get pods
# NAME                     READY   STATUS             RESTARTS
# my-app-7d8b4f5c6d-abcde  0/1     CrashLoopBackOff   3

# 2. 查看容器日志
kubectl logs my-app-7d8b4f5c6d-abcde

# 3. 查看上一次崩溃的日志
kubectl logs my-app-7d8b4f5c6d-abcde --previous

# 4. 查看事件
kubectl describe pod my-app-7d8b4f5c6d-abcde | grep -A 20 Events

# 常见原因：
# - 应用启动失败（配置错误、依赖不可用）
# - 健康检查失败
# - OOMKilled（内存不足）
# - 端口冲突
```

## 案例3：Service 无法访问

```bash
# 1. 检查 Service 是否存在
kubectl get svc my-service

# 2. 检查 Endpoints
kubectl get endpoints my-service
# 如果为空，说明没有匹配的 Pod

# 3. 检查 Pod 标签是否匹配 Service selector
kubectl get pods --show-labels
kubectl describe svc my-service | grep Selector

# 4. 检查 Pod 是否 Ready
kubectl get pods -l app=my-app

# 5. 测试连通性（从集群内）
kubectl run curl --image=curlimages/curl -it --rm -- curl http://my-service:80

# 6. 端口转发测试
kubectl port-forward svc/my-service 8080:80
curl localhost:8080
```

## 案例4：节点 NotReady

```bash
# 1. 查看节点状态
kubectl get nodes

# 2. 查看节点详情
kubectl describe node node01 | grep -A 10 Conditions

# 3. 登录节点检查 kubelet
systemctl status kubelet
journalctl -u kubelet -f

# 4. 检查网络
ping <apiserver-ip>

# 5. 检查磁盘空间
df -h
```

## 案例5：镜像拉取失败 ImagePullBackOff

```bash
# 1. 查看事件
kubectl describe pod my-pod | grep -A 10 Events
# Failed to pull image "xxx": rpc error: code = Unknown desc = Error response from daemon

# 2. 常见原因：
# - 镜像名或标签错误
# - 私有仓库需要认证
# - 网络问题

# 3. 解决方案：私有仓库创建 imagePullSecret
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass

# 4. 在 Pod 中引用
spec:
  imagePullSecrets:
  - name: my-registry
```

---

# 第17章 速查表

## 常用命令速查

| 功能 | 命令 |
|------|------|
| 查看所有 Pod | `kubectl get pods -A` |
| 查看 Pod 详情 | `kubectl describe pod <name>` |
| 进入容器 | `kubectl exec -it <pod> -- /bin/sh` |
| 查看日志 | `kubectl logs -f <pod>` |
| 端口转发 | `kubectl port-forward <pod> 8080:80` |
| 复制文件 | `kubectl cp <local> <pod>:<path>` |
| 应用配置 | `kubectl apply -f <file>` |
| 删除资源 | `kubectl delete -f <file>` |
| 更新镜像 | `kubectl set image deploy/<name> <container>=<image>` |
| 扩容 | `kubectl scale deploy/<name> --replicas=N` |
| 回滚 | `kubectl rollout undo deploy/<name>` |
| 查看节点 | `kubectl get nodes` |
| 节点资源 | `kubectl top nodes` |
| Pod 资源 | `kubectl top pods` |
| 查看事件 | `kubectl get events -A --sort-by='.lastTimestamp'` |

## 资源状态速查

| 状态 | 含义 |
|------|------|
| Pending | Pod 已创建，等待调度 |
| Running | Pod 正在运行 |
| Succeeded | Pod 成功完成（Job） |
| Failed | Pod 失败 |
| Unknown | 状态未知 |
| CrashLoopBackOff | 容器崩溃重启中 |
| ImagePullBackOff | 镜像拉取失败 |
| ErrImagePull | 镜像拉取错误 |
| CreateContainerConfigError | 容器配置错误 |
| CreateContainerError | 容器创建失败 |
| OOMKilled | 内存不足被杀 |
| Terminating | Pod 正在终止 |

## 输出格式速查

| 格式 | 说明 |
|------|------|
| `-o wide` | 显示更多列 |
| `-o yaml` | YAML 格式 |
| `-o json` | JSON 格式 |
| `-o name` | 仅名称 |
| `-o jsonpath` | 自定义 JSONPath |
| `-o custom-columns` | 自定义列 |

---

## 附录：常用资源 YAML 模板

### Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 500m
        memory: 256Mi
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 10
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 15
      periodSeconds: 20
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
```

---

**结语**

本手册覆盖了 Kubernetes 日常运维中最常用的命令与场景。建议结合实际集群多加练习，熟练掌握 `get`、`describe`、`logs`、`exec`、`apply` 等核心命令，并养成看 Events 排障的习惯。祝运维顺利！
