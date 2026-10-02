#!/usr/bin/env python3
"""构建 K8s 常用命令手册 EPUB"""
import os, zipfile, html

OUTPUT = "/workspace/K8s常用命令手册.epub"

CSS = """body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.8; color: #222; margin: 5%; }
h1 { font-size: 1.8em; border-bottom: 3px solid #326ce5; padding-bottom: 0.3em; color: #1a3a6e; }
h2 { font-size: 1.4em; border-left: 4px solid #326ce5; padding-left: 0.6em; margin-top: 1.8em; color: #1a3a6e; }
h3 { font-size: 1.15em; color: #2c5282; margin-top: 1.4em; }
p { margin: 0.6em 0; }
ul, ol { padding-left: 1.6em; }
li { margin: 0.3em 0; }
pre { background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 1em; overflow-x: auto; font-size: 0.85em; line-height: 1.5; }
code { font-family: "SF Mono", Consolas, "Courier New", monospace; background: #f6f8fa; padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.9em; }
pre code { background: none; padding: 0; }
.tip { background: #eef6ff; border-left: 4px solid #326ce5; padding: 0.8em 1em; margin: 1em 0; border-radius: 0 4px 4px 0; }
.warn { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 0.8em 1em; margin: 1em 0; border-radius: 0 4px 4px 0; }
"""

def cmd(title, desc, examples, note=""):
    s = f'<h3>{title}</h3>\n<p>{desc}</p>\n'
    s += '<pre><code>' + html.escape(examples) + '</code></pre>\n'
    if note:
        s += f'<div class="tip">{html.escape(note)}</div>\n'
    return s

# ============ 内容章节 ============

chapter1 = f'''<h1>Kubernetes 常用命令手册</h1>
<p>本手册系统整理 Kubernetes 日常运维中最常用的命令，每条命令均配有真实用例，适合运维与开发人员随时查阅。按资源类型与场景分类，便于快速定位。</p>
<div class="tip">建议：kubectl 支持 <code>--dry-run=client -o yaml</code> 预览 YAML，是学习命令的最佳方式。</div>
<h2>目录</h2>
<ol>
  <li>kubectl 基础与配置</li>
  <li>集群与节点管理</li>
  <li>命名空间</li>
  <li>Pod 管理</li>
  <li>Workload（Deployment/StatefulSet/DaemonSet/Job）</li>
  <li>服务发现与网络（Service/Ingress）</li>
  <li>存储（PV/PVC/StorageClass）</li>
  <li>配置与密钥（ConfigMap/Secret）</li>
  <li>安全与权限（RBAC/ServiceAccount）</li>
  <li>调度与扩缩容</li>
  <li>日志、调试与故障排查</li>
  <li>资源查看与编辑</li>
</ol>
'''

chapter2 = f'''<h1>一、kubectl 基础与配置</h1>

<h2>1.1 查看版本与集群信息</h2>
{cmd("kubectl version", "查看客户端和服务端版本",
'''kubectl version
kubectl version --short
kubectl version --output=yaml''',
"客户端版本与服务端版本差距建议不超过 1 个小版本。")}

{cmd("kubectl cluster-info", "查看集群核心组件地址",
'''kubectl cluster-info
kubectl cluster-info dump   # 导出详细诊断信息''')}

{cmd("kubectl config view", "查看 kubeconfig 配置",
'''kubectl config view
kubectl config view --minify    # 仅显示当前上下文
kubectl config view --raw       # 显示原始数据（含证书）''')}

<h2>1.2 上下文与集群切换</h2>
{cmd("kubectl config get-contexts", "列出所有上下文",
'''kubectl config get-contexts
kubectl config current-context    # 查看当前上下文''')}

{cmd("kubectl config use-context", "切换集群/上下文",
'''kubectl config use-context prod-cluster
kubectl config use-context kind-kind''')}

{cmd("kubectl config set-context", "设置命名空间默认值",
'''kubectl config set-context --current --namespace=dev
# 之后所有命令默认在 dev 命名空间执行''')}

<h2>1.3 自动补全与别名</h2>
{cmd("kubectl completion", "启用命令自动补全（大幅提升效率）",
'''# bash
echo 'source <(kubectl completion bash)' >> ~/.bashrc
# zsh
echo 'source <(kubectl completion zsh)' >> ~/.zshrc
# 别名
echo 'alias k=kubectl' >> ~/.bashrc
complete -o default -F __start_kubectl k''')}

<h2>1.4 全局 Flags</h2>
{cmd("常用全局参数", "所有子命令通用",
'''-n, --namespace=       指定命名空间
-A, --all-namespaces     所有命名空间
-o, --output=           输出格式: yaml/json/wide/custom-columns
--dry-run=client        仅在客户端预览，不真正执行
--kubeconfig=           指定 kubeconfig 文件
--context=              指定上下文
--as=                   以指定用户身份执行''')}
'''

chapter3 = f'''<h1>二、集群与节点管理</h1>

{cmd("kubectl get nodes", "查看节点列表",
'''kubectl get nodes
kubectl get nodes -o wide          # 显示节点 IP、OS、内核等
kubectl get nodes --show-labels    # 显示标签
kubectl get node node1 -o yaml     # 查看单个节点详情''')}

{cmd("kubectl describe node", "查看节点详细信息",
'''kubectl describe node node1
# 重点关注 Conditions、Allocatable、Events、Pod 列表与资源占用''')}

{cmd("kubectl top node", "查看节点实时资源占用",
'''kubectl top nodes
kubectl top node node1
# 需要 metrics-server 已部署''')}

{cmd("kubectl label node", "管理节点标签",
'''kubectl label nodes node1 disktype=ssd
kubectl label nodes node1 disktype-    # 删除标签''')}

{cmd("kubectl taint node", "管理节点污点",
'''kubectl taint nodes node1 key=value:NoSchedule
kubectl taint nodes node1 key:NoSchedule-     # 删除污点''',
"Master 节点默认有 node-role.kubernetes.io/control-plane:NoSchedule 污点，业务 Pod 不会调度上去。")}

{cmd("kubectl cordon / drain / uncordon", "节点维护",
'''kubectl cordon node1               # 标记不可调度（新 Pod 不上去）
kubectl drain node1 --ignore-daemonsets --delete-emptydir-data   # 驱逐 Pod
kubectl uncordon node1             # 恢复可调度''',
"drain 会驱逐该节点上的所有 Pod，升级节点前使用。")}

{cmd("kubectl get componentstatuses", "查看控制平面组件状态",
'''kubectl get cs
kubectl get componentstatuses''')}
'''

chapter4 = f'''<h1>三、命名空间</h1>

{cmd("kubectl get namespaces", "列出命名空间",
'''kubectl get ns
kubectl get ns -o wide''')}

{cmd("kubectl create namespace", "创建命名空间",
'''kubectl create namespace dev
kubectl create ns staging''')}

{cmd("kubectl delete namespace", "删除命名空间",
'''kubectl delete namespace dev''',
"删除命名空间会同时删除该命名空间下的所有资源，操作前务必确认！")}

{cmd("kubectl label namespace", "命名空间标签",
'''kubectl label ns dev environment=development''')}
'''

chapter5 = f'''<h1>四、Pod 管理</h1>

<h2>4.1 查看 Pod</h2>
{cmd("kubectl get pods", "查看 Pod 列表",
'''kubectl get pods
kubectl get pods -n kube-system
kubectl get pods -A                        # 所有命名空间
kubectl get pods -o wide                   # 显示节点和 IP
kubectl get pods -o yaml                   # YAML 格式
kubectl get pods --show-labels             # 显示标签
kubectl get pods -l app=nginx              # 按标签筛选
kubectl get pods --field-selector=status.phase=Running   # 按字段筛选''')}

{cmd("kubectl describe pod", "查看 Pod 详情",
'''kubectl describe pod nginx-xxx
# 重点看 Events 部分，排障第一步''')}

<h2>4.2 创建与删除 Pod</h2>
{cmd("kubectl run", "快速创建 Pod",
'''kubectl run nginx --image=nginx
kubectl run nginx --image=nginx --restart=Never    # 仅创建 Pod（不创建 Deployment）
kubectl run busybox --image=busybox -- sleep 3600''')}

{cmd("kubectl apply -f", "声明式创建",
'''kubectl apply -f pod.yaml
kubectl apply -f ./manifests/          # 目录下所有文件
kubectl apply -f https://example.com/pod.yaml''')}

{cmd("kubectl delete pod", "删除 Pod",
'''kubectl delete pod nginx-xxx
kubectl delete pod -l app=nginx        # 按标签删除
kubectl delete pod --all -n dev        # 删除命名空间所有 Pod
kubectl delete pod nginx-xxx --force --grace-period=0   # 强制立即删除''')}

<h2>4.3 进入 Pod 与执行命令</h2>
{cmd("kubectl exec", "在 Pod 中执行命令",
'''kubectl exec nginx-xxx -- ls /
kubectl exec -it nginx-xxx -- /bin/sh          # 交互式进入
kubectl exec nginx-xxx -c sidecar -- ls         # 指定容器
kubectl exec -it pod-name -- env               # 查看环境变量''')}

{cmd("kubectl logs", "查看 Pod 日志",
'''kubectl logs nginx-xxx
kubectl logs -f nginx-xxx                          # 实时跟随
kubectl logs --tail=100 nginx-xxx                  # 最后 100 行
kubectl logs --previous nginx-xxx                  # 上一个容器（崩溃前）的日志
kubectl logs -l app=nginx                          # 按标签查看所有 Pod 日志
kubectl logs -c sidecar nginx-xxx                  # 指定容器日志
kubectl logs nginx-xxx --since=1h                  # 最近 1 小时''')}

{cmd("kubectl port-forward", "端口转发（本地调试）",
'''kubectl port-forward pod/nginx-xxx 8080:80
kubectl port-forward svc/nginx 8080:80
kubectl port-forward deploy/nginx 8080:80''')}

{cmd("kubectl cp", "文件传输",
'''kubectl cp nginx-xxx:/etc/nginx/nginx.conf ./nginx.conf    # Pod -> 本地
kubectl cp ./local.txt nginx-xxx:/tmp/local.txt              # 本地 -> Pod''')}

<h2>4.4 Pod 调试</h2>
{cmd("kubectl debug", "调试运行中的 Pod（K8s 1.23+）",
'''# 启动一个临时调试容器附加到 Pod
kubectl debug -it nginx-xxx --image=busybox --target=nginx
# 复制 Pod 并加调试容器
kubectl debug -it nginx-xxx --image=busybox --share-processes --copy-to=nginx-debug''',
"当目标镜像没有 shell 工具（如 distroless）时，debug 非常有用。")}
'''

chapter6 = f'''<h1>五、Workload 管理</h1>

<h2>5.1 Deployment</h2>
{cmd("kubectl create deployment", "创建 Deployment",
'''kubectl create deployment nginx --image=nginx
kubectl create deployment nginx --image=nginx --replicas=3''')}

{cmd("kubectl get deployments", "查看 Deployment",
'''kubectl get deploy
kubectl get deploy -o wide
kubectl get deploy nginx -o yaml''')}

{cmd("kubectl scale deployment", "扩缩容",
'''kubectl scale deploy nginx --replicas=5
kubectl scale deploy nginx --replicas=0    # 缩到 0''')}

{cmd("kubectl set image", "更新镜像（滚动更新）",
'''kubectl set image deploy/nginx nginx=nginx:1.21
kubectl set image deploy/nginx *=nginx:1.21''')}

{cmd("kubectl rollout", "滚动更新管理",
'''kubectl rollout status deploy/nginx              # 查看更新状态
kubectl rollout history deploy/nginx             # 查看历史版本
kubectl rollout undo deploy/nginx                # 回滚到上一版本
kubectl rollout undo deploy/nginx --to-revision=2  # 回滚到指定版本
kubectl rollout pause deploy/nginx               # 暂停更新
kubectl rollout resume deploy/nginx              # 恢复更新''')}

{cmd("kubectl expose", "创建 Service",
'''kubectl expose deploy nginx --port=80 --type=NodePort
kubectl expose deploy nginx --port=80 --target-port=8080''')}

<h2>5.2 StatefulSet</h2>
{cmd("StatefulSet 相关命令", "有状态应用",
'''kubectl get statefulsets
kubectl get sts
kubectl describe sts mysql
kubectl scale sts mysql --replicas=3
kubectl delete pod mysql-0          # StatefulSet 会自动重建同名 Pod''',
"StatefulSet 的 Pod 名固定（mysql-0, mysql-1...），删除会重建但数据保留。")}

<h2>5.3 DaemonSet</h2>
{cmd("DaemonSet 相关命令", "每个节点运行一个副本",
'''kubectl get daemonsets
kubectl get ds
kubectl describe ds fluentd -n kube-system''')}

<h2>5.4 Job 与 CronJob</h2>
{cmd("Job / CronJob 命令", "一次性与定时任务",
'''kubectl get jobs
kubectl get cronjobs
kubectl create job backup --image=busybox -- ls /data
kubectl create cronjob backup --schedule="0 2 * * *" --image=busybox -- ls /data
kubectl logs job/backup
kubectl get cronjob backup -o yaml''')}
'''

chapter7 = f'''<h1>六、服务发现与网络</h1>

<h2>6.1 Service</h2>
{cmd("kubectl get services", "查看 Service",
'''kubectl get svc
kubectl get svc -o wide
kubectl get svc -n dev''')}

{cmd("kubectl describe service", "查看 Service 详情",
'''kubectl describe svc nginx
# 查看 Endpoints（Service 关联的 Pod IP）''')}

{cmd("kubectl get endpoints", "查看 Endpoints",
'''kubectl get endpoints
kubectl get ep
# Endpoints 为空说明 selector 没匹配到 Pod''',
"Service 不通第一时间检查 Endpoints 是否为空！")}

{cmd("Service 类型", "ClusterIP / NodePort / LoadBalancer / ExternalName",
'''# YAML 中指定 type
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  type: NodePort          # ClusterIP(默认) / NodePort / LoadBalancer / ExternalName
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080       # NodePort 固定端口（可选）''')}

<h2>6.2 Ingress</h2>
{cmd("Ingress 相关命令", "HTTP 七层路由",
'''kubectl get ingress
kubectl get ing
kubectl describe ing web-ingress
kubectl apply -f ingress.yaml''')}

{cmd("Ingress YAML 示例", "基于域名路由",
'''apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80''')}

<h2>6.3 网络策略</h2>
{cmd("kubectl get networkpolicy", "查看网络策略",
'''kubectl get networkpolicies
kubectl get netpol
kubectl describe netpol default-deny''')}
'''

chapter8 = f'''<h1>七、存储管理</h1>

<h2>7.1 PV / PVC</h2>
{cmd("kubectl get pv", "查看 PersistentVolume",
'''kubectl get pv
kubectl get pv -o wide
kubectl describe pv pv-name''')}

{cmd("kubectl get pvc", "查看 PersistentVolumeClaim",
'''kubectl get pvc
kubectl get pvc -n dev
kubectl describe pvc data-claim''',
"PVC 状态为 Pending 通常是没有匹配的 PV 或 StorageClass。")}

<h2>7.2 StorageClass</h2>
{cmd("kubectl get storageclass", "查看存储类",
'''kubectl get storageclass
kubectl get sc
kubectl describe sc standard
kubectl patch storageclass standard -p '{{"metadata": {{"annotations":{{"storageclass.kubernetes.io/is-default-class":"true"}}}}}}'
# 设为默认 StorageClass''')}

<h2>7.3 Volume 挂载</h2>
{cmd("查看 Pod 的 Volume 挂载", "",
'''kubectl get pod nginx-xxx -o jsonpath='{{.spec.volumes}}'
kubectl describe pod nginx-xxx | grep -A5 Volumes''')}
'''

chapter9 = f'''<h1>八、配置与密钥</h1>

<h2>8.1 ConfigMap</h2>
{cmd("kubectl create configmap", "创建 ConfigMap",
'''# 从字面量创建
kubectl create configmap app-config --from-literal=key1=value1 --from-literal=key2=value2
# 从文件创建
kubectl create configmap app-config --from-file=app.properties
# 从目录创建
kubectl create configmap app-config --from-file=config/
# 从 env 文件
kubectl create configmap app-config --from-env-file=app.env''')}

{cmd("kubectl get configmap", "查看 ConfigMap",
'''kubectl get configmaps
kubectl get cm
kubectl get cm app-config -o yaml''')}

<h2>8.2 Secret</h2>
{cmd("kubectl create secret", "创建 Secret",
'''# generic 类型
kubectl create secret generic db-secret \\
  --from-literal=username=admin \\
  --from-literal=password=123456
# docker-registry 类型（拉取私有镜像）
kubectl create secret docker-registry regcred \\
  --docker-server=registry.example.com \\
  --docker-username=user \\
  --docker-password=pass \\
  --docker-email=user@example.com
# tls 类型
kubectl create secret tls tls-cert --cert=tls.crt --key=tls.key''')}

{cmd("kubectl get secret", "查看 Secret",
'''kubectl get secrets
kubectl get secret db-secret -o yaml
# Secret 值是 base64 编码，不是加密！生产建议开启 etcd 加密
echo "YWRtaW4=" | base64 -d     # 解码查看''',
"Secret 只是 base64 编码，并非加密，敏感数据建议配合 Vault 等外部密钥管理。")}
'''

chapter10 = f'''<h1>九、安全与权限（RBAC）</h1>

<h2>9.1 ServiceAccount</h2>
{cmd("ServiceAccount 相关命令", "Pod 的身份标识",
'''kubectl get serviceaccounts
kubectl get sa
kubectl create sa app-sa
kubectl get sa app-sa -o yaml''')}

<h2>9.2 Role / ClusterRole</h2>
{cmd("kubectl get role / clusterrole", "查看角色",
'''kubectl get roles
kubectl get clusterroles
kubectl describe clusterrole view''')}

<h2>9.3 RoleBinding / ClusterRoleBinding</h2>
{cmd("kubectl get rolebinding / clusterrolebinding", "查看绑定",
'''kubectl get rolebindings
kubectl get clusterrolebindings
kubectl describe clusterrolebinding admin''')}

{cmd("kubectl auth can-i", "检查权限（非常重要！）",
'''kubectl auth can-i get pods
kubectl auth can-i create deployments
kubectl auth can-i --list                          # 列出当前用户所有权限
kubectl auth can-i get pods --as=system:serviceaccount:dev:app-sa
kubectl auth can-i get pods -n dev                  # 指定命名空间''',
"排查权限问题第一用 `kubectl auth can-i`。")}

<h2>9.4 创建 RBAC 示例</h2>
{cmd("创建一个只读 Pod 的 Role 并绑定", "",
'''kubectl create role pod-reader \\
  --verb=get,list,watch \\
  --resource=pods

kubectl create rolebinding pod-reader-binding \\
  --role=pod-reader \\
  --serviceaccount=dev:app-sa''')}
'''

chapter11 = f'''<h1>十、调度与弹性伸缩</h1>

<h2>10.1 调度相关</h2>
{cmd("kubectl get events", "查看调度事件",
'''kubectl get events --sort-by=.metadata.creationTimestamp
kubectl get events -A --sort-by=.lastTimestamp | tail -20''')}

{cmd("Pod 调度状态排查", "",
'''kubectl describe pod pending-pod | grep -A5 Events
# Pending 常见原因：资源不足、污点不匹配、PVC 未绑定、镜像拉取失败''')}

<h2>10.2 HPA 自动扩缩容</h2>
{cmd("kubectl get hpa", "查看 HorizontalPodAutoscaler",
'''kubectl get hpa
kubectl describe hpa nginx-hpa
kubectl autoscale deploy nginx --min=2 --max=10 --cpu-percent=80
# 需要 metrics-server，且 Pod 设置了 resources.requests.cpu''')}

<h2>10.3 资源配额</h2>
{cmd("ResourceQuota / LimitRange", "",
'''kubectl get resourcequota
kubectl get limitranges
kubectl describe resourcequota compute-quota -n dev''')}
'''

chapter12 = f'''<h1>十一、日志、调试与故障排查</h1>

{cmd("kubectl get events", "集群事件（排障核心）",
'''kubectl get events -A --sort-by=.lastTimestamp
kubectl get events --field-selector type=Warning
kubectl get events -n default''',
"事件是排障的第一手信息，所有异常都会记录在这里。")}

{cmd("kubectl top", "资源占用",
'''kubectl top pods
kubectl top pods -A
kubectl top nodes
kubectl top pod my-pod -n my-namespace''')}

{cmd("Pod 排障标准流程", "Pod 起不来时按此顺序排查",
'''# 1. 查看 Pod 状态和事件
kubectl describe pod <pod-name>

# 2. 查看日志
kubectl logs <pod-name>
kubectl logs <pod-name> --previous   # 上一次崩溃的日志

# 3. 进入 Pod 内部排查
kubectl exec -it <pod-name> -- /bin/sh

# 4. 查看节点资源
kubectl top nodes
kubectl describe node <node-name>

# 5. 查看事件
kubectl get events --sort-by=.lastTimestamp | tail -20''',
"记住这个顺序，90% 的 Pod 问题都能定位。")}

{cmd("kubectl api-resources", "查看 API 资源",
'''kubectl api-resources
kubectl api-resources --namespaced=false    # 集群级资源
kubectl api-resources -o wide               # 显示简称、版本等''')}

{cmd("kubectl explain", "查看资源字段说明（自带文档）",
'''kubectl explain pod
kubectl explain pod.spec
kubectl explain pod.spec.containers
kubectl explain deployment.spec.strategy.rollingUpdate
# 不确定字段怎么写时，用 explain 查''',
"kubectl explain 是最好的离线文档，不用联网就能查字段说明。")}
'''

chapter13 = f'''<h1>十二、资源编辑与通用操作</h1>

{cmd("kubectl edit", "在线编辑资源",
'''kubectl edit deploy nginx
kubectl edit svc nginx
# 等价于 get -o yaml -> 修改 -> apply''')}

{cmd("kubectl patch", "局部更新（不打开编辑器）",
'''kubectl patch deploy nginx -p '{{"spec":{{"replicas":5}}}}'
kubectl patch svc nginx -p '{{"spec":{{"type":"LoadBalancer"}}}}' ''')}

{cmd("kubectl replace", "整体替换",
'''kubectl replace -f nginx.yaml
kubectl replace --force -f nginx.yaml    # 先删后建''')}

{cmd("kubectl annotate", "管理注解",
'''kubectl annotate pod nginx-xxx description="web server"
kubectl annotate pod nginx-xxx description-     # 删除注解''')}

{cmd("kubectl label", "管理标签",
'''kubectl label pod nginx-xxx env=prod
kubectl label pod nginx-xxx env-    # 删除标签''')}

{cmd("kubectl wait", "等待资源就绪",
'''kubectl wait --for=condition=ready pod/nginx-xxx --timeout=120s
kubectl wait --for=condition=available deploy/nginx --timeout=300s''')}

{cmd("kubectl diff", "对比差异（不应用）",
'''kubectl diff -f nginx.yaml
# 显示当前集群资源与 YAML 的差异''')}

<h1>附录：速查清单</h1>

<div class="tip">
<p><strong>最常用 10 条命令（记住这些能应对 80% 日常）</strong></p>
<ol>
<li><code>kubectl get pods -A -o wide</code> — 看所有 Pod</li>
<li><code>kubectl describe pod &lt;name&gt;</code> — 看 Pod 详情和事件</li>
<li><code>kubectl logs -f &lt;pod&gt;</code> — 看实时日志</li>
<li><code>kubectl exec -it &lt;pod&gt; -- /bin/sh</code> — 进入 Pod</li>
<li><code>kubectl get svc,ep</code> — 看服务和端点</li>
<li><code>kubectl get events --sort-by=.lastTimestamp</code> — 看事件</li>
<li><code>kubectl top pods -A</code> — 看资源占用</li>
<li><code>kubectl apply -f xxx.yaml</code> — 应用配置</li>
<li><code>kubectl rollout undo deploy/xxx</code> — 回滚</li>
<li><code>kubectl explain &lt;resource&gt;</code> — 查字段文档</li>
</ol>
</div>
'''

chapters = [
    ("cover.xhtml", chapter1),
    ("ch01.xhtml", chapter2),
    ("ch02.xhtml", chapter3),
    ("ch03.xhtml", chapter4),
    ("ch04.xhtml", chapter5),
    ("ch05.xhtml", chapter6),
    ("ch06.xhtml", chapter7),
    ("ch07.xhtml", chapter8),
    ("ch08.xhtml", chapter9),
    ("ch09.xhtml", chapter10),
    ("ch10.xhtml", chapter11),
    ("ch11.xhtml", chapter12),
    ("ch12.xhtml", chapter13),
]

# ============ 构建 EPUB ============

def build_epub():
    files = {}
    # mimetype 必须第一个且不压缩
    files["mimetype"] = "application/epub+zip"
    
    files["META-INF/container.xml"] = '''<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>'''

    files["OEBPS/css/style.css"] = CSS

    # content.opf
    manifest_items = ""
    spine_items = ""
    play_order = 0
    nav_points = ""
    titles = [
        "封面与目录", "一、kubectl 基础与配置", "二、集群与节点管理", "三、命名空间",
        "四、Pod 管理", "五、Workload 管理", "六、服务发现与网络", "七、存储管理",
        "八、配置与密钥", "九、安全与权限（RBAC）", "十、调度与弹性伸缩",
        "十一、日志、调试与故障排查", "十二、资源编辑与通用操作"
    ]
    
    manifest_items += '<item id="css" href="css/style.css" media-type="text/css"/>\n    '
    manifest_items += '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n    '
    manifest_items += '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n    '
    
    for i, (fname, content) in enumerate(chapters):
        cid = f"ch{i:02d}"
        manifest_items += f'<item id="{cid}" href="{fname}" media-type="application/xhtml+xml"/>\n    '
        spine_items += f'<itemref idref="{cid}"/>\n    '
        nav_points += f'''<navPoint id="navPoint-{i}" playOrder="{i+1}">
      <navLabel><text>{titles[i]}</text></navLabel>
      <content src="{fname}"/>
    </navPoint>
    '''
    
    files["OEBPS/content.opf"] = f'''<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:k8s-cmd-cheatsheet-2026</dc:identifier>
    <dc:title>Kubernetes 常用命令手册</dc:title>
    <dc:creator>运维知识教程</dc:creator>
    <dc:language>zh-CN</dc:language>
    <meta property="dcterms:modified">2026-10-02T00:00:00Z</meta>
  </metadata>
  <manifest>
    {manifest_items}
  </manifest>
  <spine>
    {spine_items}
  </spine>
</package>'''

    files["OEBPS/toc.ncx"] = f'''<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:k8s-cmd-cheatsheet-2026"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>Kubernetes 常用命令手册</text></docTitle>
  <navMap>
    {nav_points}
  </navMap>
</ncx>'''

    nav_items = ""
    for i, (fname, content) in enumerate(chapters):
        nav_items += f'<li><a href="{fname}">{titles[i]}</a></li>\n      '
    
    files["OEBPS/nav.xhtml"] = f'''<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="zh-CN">
<head><meta charset="UTF-8"/><title>目录</title><link rel="stylesheet" href="css/style.css"/></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>目录</h1>
    <ol>
      {nav_items}
    </ol>
  </nav>
</body>
</html>'''

    for fname, content in chapters:
        files[f"OEBPS/{fname}"] = f'''<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN">
<head><meta charset="UTF-8"/><link rel="stylesheet" href="css/style.css"/></head>
<body>
{content}
</body>
</html>'''

    # 写入 ZIP
    with zipfile.ZipFile(OUTPUT, 'w', zipfile.ZIP_DEFLATED) as z:
        # mimetype 必须不压缩且第一个
        zi = zipfile.ZipInfo("mimetype")
        zi.compress_type = zipfile.ZIP_STORED
        z.writestr(zi, files["mimetype"])
        for fname, data in files.items():
            if fname == "mimetype":
                continue
            z.writestr(fname, data)
    
    print(f"EPUB 已生成: {OUTPUT}")
    print(f"文件大小: {os.path.getsize(OUTPUT)} bytes")
    print(f"章节数: {len(chapters)}")

build_epub()
