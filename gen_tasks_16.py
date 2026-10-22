#!/usr/bin/env python3
"""按 docx 原文生成 16 道 CKA 真题练习环境。
每题包含 meta.sh / setup.sh / check.sh / clean.sh。
"""
import os

TASKS = os.environ.get("CKA_TASKS_DIR", "/workspace/cka-practice/tasks")

def write(dirname, fname, content):
    d = os.path.join(TASKS, dirname)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, fname), "w", encoding="utf-8") as f:
        f.write(content)
    if fname.endswith(".sh"):
        os.chmod(os.path.join(d, fname), 0o755)


def meta(id_num, title, category, weight, description, hint):
    return f'''#!/bin/bash
TITLE={title!r}
CATEGORY={category!r}
WEIGHT={weight}
DESCRIPTION=$(cat <<'CKA_META_EOF'
{description}
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
{hint}
CKA_META_EOF
)
'''


def setup(id_num, code):
    return f'''#!/bin/bash
source /opt/cka/lib/setup.sh
{code}
true
'''


def check(id_num, code):
    return f'''#!/bin/bash
source /opt/cka/lib/common.sh
{code}
true
'''


def clean(id_num, code):
    return f'''#!/bin/bash
{code}
true
'''

# ===== 01 HPA 自动扩缩容 =====
write("01", "meta.sh", meta(
    "01", "HPA 自动扩缩容", "工作负载", 7,
    """在 autoscale namespace 中创建名为 apache-server 的 Deployment，并为其创建 HPA：
- CPU 使用率目标 50%
- min=1, max=4
- scaleDown.stabilizationWindowSeconds=30""",
    """kubectl create ns autoscale
kubectl -n autoscale create deployment apache-server --image=nginx:1.25 --port=80
kubectl -n autoscale autoscale deployment apache-server --cpu=50% --min=1 --max=4
kubectl -n autoscale edit hpa apache-server
# 在 maxReplicas: 4 下加：
# behavior:
#   scaleDown:
#     stabilizationWindowSeconds: 30
kubectl -n autoscale get hpa"""
))
write("01", "setup.sh", setup("01", """
ensure_ns autoscale
kubectl delete deployment apache-server -n autoscale --ignore-not-found >/dev/null 2>&1
kubectl create deployment apache-server -n autoscale --image=nginx:1.25 --port=80 >/dev/null
kubectl rollout status deployment/apache-server -n autoscale --timeout=120s >/dev/null 2>&1
"""))
write("01", "check.sh", check("01", """
H=$(kubectl get hpa apache-server -n autoscale -o json 2>/dev/null)
if [ -z "$H" ]; then fail "HPA apache-server 不存在"; else
  assert_eq "target CPU 使用率" "50" "$(echo "$H" | jq -r '.spec.metrics[0].resource.target.averageUtilization // 0')"
  assert_eq "minReplicas" "1" "$(echo "$H" | jq -r '.spec.minReplicas // 0')"
  assert_eq "maxReplicas" "4" "$(echo "$H" | jq -r '.spec.maxReplicas')"
  assert_eq "scaleDown stabilizationWindowSeconds=30" "30" "$(echo "$H" | jq -r '.spec.behavior.scaleDown.stabilizationWindowSeconds // 0')"
fi
"""))
write("01", "clean.sh", clean("01", """
kubectl delete hpa apache-server -n autoscale --ignore-not-found >/dev/null 2>&1
kubectl delete deployment apache-server -n autoscale --ignore-not-found >/dev/null 2>&1
clean_ns autoscale
"""))

# ===== 02 Ingress =====
write("02", "meta.sh", meta(
    "02", "Ingress", "服务与网络", 6,
    """创建 Ingress：
- 名称 echo，Namespace sound-repeater
- Service echoserver-service，端口 8080
- Host example.org，路径 /echo，pathType Prefix
- ingressClassName 使用集群默认值""",
    """kubectl get ingressclass
# YAML：
# apiVersion: networking.k8s.io/v1
# kind: Ingress
# metadata: {name: echo, namespace: sound-repeater}
# spec:
#   ingressClassName: traefik
#   rules:
#   - host: example.org
#     http:
#       paths:
#       - path: /echo
#         pathType: Prefix
#         backend:
#           service:
#             name: echoserver-service
#             port: {number: 8080}
kubectl apply -f ingress.yaml"""))
write("02", "setup.sh", setup("02", """
ensure_ns sound-repeater
kubectl delete ingress echo -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl delete svc echoserver-service -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl delete deployment echoserver -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl -n sound-repeater create deployment echoserver --image=nginx:1.25 --port=8080 >/dev/null
kubectl -n sound-repeater expose deployment echoserver --name=echoserver-service --port=8080 --target-port=8080 >/dev/null
kubectl rollout status deployment/echoserver -n sound-repeater --timeout=120s >/dev/null 2>&1
"""))
write("02", "check.sh", check("02", """
I=$(kubectl get ingress echo -n sound-repeater -o json 2>/dev/null)
if [ -z "$I" ]; then fail "Ingress echo 不存在"; else
  assert_eq "host=example.org" "example.org" "$(echo "$I" | jq -r '.spec.rules[0].host')"
  assert_eq "path=/echo" "/echo" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].path')"
  assert_eq "pathType=Prefix" "Prefix" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].pathType')"
  assert_eq "backend service=echoserver-service" "echoserver-service" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].backend.service.name')"
  assert_eq "backend port=8080" "8080" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].backend.service.port.number')"
fi
"""))
write("02", "clean.sh", clean("02", """
kubectl delete ingress echo -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl delete svc echoserver-service -n sound-repeater --ignore-not-found >/dev/null 2>&1
kubectl delete deployment echoserver -n sound-repeater --ignore-not-found >/dev/null 2>&1
clean_ns sound-repeater
"""))

# ===== 03 sidecar =====
write("03", "meta.sh", meta(
    "03", "sidecar 并置容器", "工作负载", 7,
    """为 synergy-leverager Deployment 加一个 sidecar：
- 容器名 sidecar，镜像 busybox，命令 /bin/sh -c 'tail -n+1 -f /var/log/synergy-leverager.log'
- 加 emptyDir 卷 varlog，挂到两个容器的 /var/log
- 不要修改主容器 spec""",
    """kubectl get deployment synergy-leverager -o yaml > sidecar.yaml
# 编辑：containers 列表加第二个 name: sidecar image: busybox args: [...]
# 主容器 volumesMounts 加 - name: varlog, mountPath: /var/log
# volumes 加 emptyDir varlog
kubectl apply -f sidecar.yaml
kubectl get pod -w"""))
write("03", "setup.sh", setup("03", """
ensure_ns default
kubectl delete deployment synergy-leverager --ignore-not-found >/dev/null 2>&1
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: synergy-leverager
spec:
  replicas: 1
  selector:
    matchLabels: {app: synergy-leverager}
  template:
    metadata:
      labels: {app: synergy-leverager}
    spec:
      containers:
      - name: synergy
        image: busybox:1.36
        command: ["sh","-c","mkdir -p /var/log && touch /var/log/synergy-leverager.log && echo started >> /var/log/synergy-leverager.log && sleep 3600"]
YAML
kubectl rollout status deployment/synergy-leverager --timeout=120s >/dev/null 2>&1
"""))
write("03", "check.sh", check("03", """
D=$(kubectl get deployment synergy-leverager -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment synergy-leverager 不存在"; else
  N=$(echo "$D" | jq '.spec.template.spec.containers | length')
  assert_ge "容器数 >= 2（有 sidecar）" 2 "$N"
  S=$(echo "$D" | jq -r '.spec.template.spec.containers[] | select(.name=="sidecar") | .image' | head -1)
  assert_contains "sidecar 容器用 busybox" "busybox" "$S"
  CMD=$(echo "$D" | jq -r '.spec.template.spec.containers[] | select(.name=="sidecar") | (.args|join(" ")) + " " + (.command|join(" "))')
  assert_contains "sidecar 命令 tail 日志" "tail" "$CMD"
  assert_contains "sidecar 挂载 /var/log" "/var/log" "$CMD"
  VMN=$(echo "$D" | jq -r '.spec.template.spec.volumes[].name' | tr '
' ' ')
  assert_contains "存在 varlog 卷" "varlog" "$VMN"
fi
"""))
write("03", "clean.sh", clean("03", """
kubectl delete deployment synergy-leverager --ignore-not-found >/dev/null 2>&1
"""))

# ===== 04 StorageClass =====
write("04", "meta.sh", meta(
    "04", "StorageClass + 默认类", "存储", 7,
    """创建 StorageClass ran-local-path：
- provisioner: rancher.io/local-path
- volumeBindingMode: WaitForFirstConsumer
- 设置为集群默认 StorageClass""",
    """kubectl get storageclass
# YAML：
# apiVersion: storage.k8s.io/v1
# kind: StorageClass
# metadata:
#   name: ran-local-path
#   annotations: {storageclass.kubernetes.io/is-default-class: "true"}
# provisioner: rancher.io/local-path
# volumeBindingMode: WaitForFirstConsumer
kubectl apply -f storage.yaml
kubectl get storageclass"""))
write("04", "setup.sh", setup("04", """
kubectl delete storageclass ran-local-path --ignore-not-found >/dev/null 2>&1
"""))
write("04", "check.sh", check("04", """
SC=$(kubectl get storageclass ran-local-path -o json 2>/dev/null)
if [ -z "$SC" ]; then fail "StorageClass ran-local-path 不存在"; else
  assert_eq "provisioner=rancher.io/local-path" "rancher.io/local-path" "$(echo "$SC" | jq -r '.provisioner')"
  assert_eq "volumeBindingMode=WaitForFirstConsumer" "WaitForFirstConsumer" "$(echo "$SC" | jq -r '.volumeBindingMode')"
  assert_eq "annotation is-default-class=true" "true" "$(echo "$SC" | jq -r '.metadata.annotations["storageclass.kubernetes.io/is-default-class"] // ""')"
fi
"""))
write("04", "clean.sh", clean("04", """
kubectl delete storageclass ran-local-path --ignore-not-found >/dev/null 2>&1
"""))

# ===== 05 Service NodePort =====
write("05", "meta.sh", meta(
    "05", "Service NodePort 暴露容器端口", "服务与网络", 6,
    """在 spline-reticulator namespace：
1. 修改 front-end Deployment：容器 nginx 暴露 containerPort 80
2. 创建 NodePort Service front-end-svc：targetPort 80，NodePort 自动分配""",
    """kubectl -n spline-reticulator edit deployment front-end
# 在 containers[0] 下加：ports: [{containerPort: 80}]
kubectl -n spline-reticulator expose deployment front-end --type=NodePort --port=80 --target-port=80 --name=front-end-svc
kubectl -n spline-reticulator get svc front-end-svc -o wide"""))
write("05", "setup.sh", setup("05", """
ensure_ns spline-reticulator
kubectl delete deployment front-end -n spline-reticulator --ignore-not-found >/dev/null 2>&1
kubectl delete svc front-end-svc -n spline-reticulator --ignore-not-found >/dev/null 2>&1
kubectl -n spline-reticulator create deployment front-end --image=nginx:1.25 >/dev/null
kubectl rollout status deployment/front-end -n spline-reticulator --timeout=120s >/dev/null 2>&1
"""))
write("05", "check.sh", check("05", """
D=$(kubectl get deployment front-end -n spline-reticulator -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment front-end 不存在"; else
  P=$(echo "$D" | jq -r '.spec.template.spec.containers[0].ports[]? | select(.containerPort==80) | .containerPort')
  assert_eq "Deployment 暴露 containerPort 80" "80" "$P"
fi
S=$(kubectl get svc front-end-svc -n spline-reticulator -o json 2>/dev/null)
if [ -z "$S" ]; then fail "Service front-end-svc 不存在"; else
  assert_eq "Service 类型 NodePort" "NodePort" "$(echo "$S" | jq -r '.spec.type')"
  assert_eq "port=80" "80" "$(echo "$S" | jq -r '.spec.ports[0].port')"
  assert_eq "targetPort=80" "80" "$(echo "$S" | jq -r '.spec.ports[0].targetPort')"
fi
"""))
write("05", "clean.sh", clean("05", """
kubectl delete deployment front-end -n spline-reticulator --ignore-not-found >/dev/null 2>&1
kubectl delete svc front-end-svc -n spline-reticulator --ignore-not-found >/dev/null 2>&1
clean_ns spline-reticulator
"""))

# ===== 06 PriorityClass =====
write("06", "meta.sh", meta(
    "06", "PriorityClass + 修改 Deployment 优先级", "调度", 6,
    """1. 创建 PriorityClass high-priority，value 比现有用户自定义最高优先级类小 1。
   （本环境预设 max-user-priority=1000000000，所以 high-priority 的 value 是 999999999）
2. 修改 priority namespace 的 busybox-logger Deployment，priorityClassName 设为 high-priority。""",
    """kubectl get pc                          # 看到 max-user-priority value=1000000000
kubectl create pc high-priority --value=999999999
kubectl -n priority edit deployment busybox-logger
# 在 spec.template.spec 加：priorityClassName: high-priority"""))
write("06", "setup.sh", setup("06", """
ensure_ns priority
kubectl delete priorityclass high-priority --ignore-not-found >/dev/null 2>&1
kubectl create priorityclass max-user-priority --value=1000000000 >/dev/null 2>&1 || true
kubectl delete deployment busybox-logger -n priority --ignore-not-found >/dev/null 2>&1
kubectl -n priority create deployment busybox-logger --image=busybox:1.36 \
  -- /bin/sh -c 'while true; do sleep 30; done' >/dev/null 2>&1
kubectl rollout status deployment/busybox-logger -n priority --timeout=120s >/dev/null 2>&1
"""))
write("06", "check.sh", check("06", """
PC=$(kubectl get priorityclass high-priority -o json 2>/dev/null)
if [ -z "$PC" ]; then fail "PriorityClass high-priority 不存在"; else
  assert_eq "value=999999999" "999999999" "$(echo "$PC" | jq -r '.value')"
fi
D=$(kubectl get deployment busybox-logger -n priority -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment busybox-logger 不存在"; else
  assert_eq "priorityClassName=high-priority" "high-priority" "$(echo "$D" | jq -r '.spec.template.spec.priorityClassName // ""')"
fi
"""))
write("06", "clean.sh", clean("06", """
kubectl delete priorityclass high-priority --ignore-not-found >/dev/null 2>&1
kubectl delete priorityclass max-user-priority --ignore-not-found >/dev/null 2>&1
kubectl delete deployment busybox-logger -n priority --ignore-not-found >/dev/null 2>&1
clean_ns priority
"""))

# ===== 07 Argo CD Helm =====
write("07", "meta.sh", meta(
    "07", "Argo CD Helm 安装 + 模板输出", "生态工具", 8,
    """1. helm repo add argo https://argoproj.github.io/argo-helm
2. helm template argocd argo/argo-cd --namespace argocd --version 7.7.3 --set crds.install=false > ~/argo-helm.yaml
3. helm install argocd argo/argo-cd -n argocd --version 7.7.3 --set crds.install=false""",
    """helm repo add argo https://argoproj.github.io/argo-helm
helm repo update argo    # 若 EOF/超时重试一次
helm template argocd argo/argo-cd -n argocd --version 7.7.3 --set crds.install=false > ~/argo-helm.yaml
helm install argocd argo/argo-cd -n argocd --version 7.7.3 --set crds.install=false"""))
write("07", "setup.sh", setup("07", """
kubectl delete ns argocd --wait=false >/dev/null 2>&1
kubectl create ns argocd >/dev/null 2>&1 || true
kubectl label ns argocd cka-practice=true --overwrite >/dev/null 2>&1
helm repo remove argo >/dev/null 2>&1 || true
rm -f /root/work/argo-helm.yaml /root/argo-helm.yaml
"""))
write("07", "check.sh", check("07", """
YAML_FILE=$(ls /root/argo-helm.yaml /root/work/argo-helm.yaml 2>/dev/null | head -1)
if [ -z "$YAML_FILE" ] || [ ! -s "$YAML_FILE" ]; then fail "~/argo-helm.yaml 不存在或为空"; else
  T=$(cat "$YAML_FILE")
  assert_contains "包含 Deployment 清单" "kind: Deployment" "$T"
  assert_not_contains "未安装 CRD" "kind: CustomResourceDefinition" "$T"
fi
RELEASE=$(helm list -n argocd -o json 2>/dev/null | jq -r '.[] | select(.name=="argocd") | .name')
if [ -z "$RELEASE" ]; then fail "helm install 未执行（argocd release 不存在）"; else
  pass "helm release argocd 已安装"
fi
"""))
write("07", "clean.sh", clean("07", """
helm uninstall argocd -n argocd >/dev/null 2>&1 || true
helm repo remove argo >/dev/null 2>&1 || true
kubectl delete ns argocd --wait=false >/dev/null 2>&1
rm -f /root/work/argo-helm.yaml /root/argo-helm.yaml
"""))

# ===== 08 PVC mariadb 恢复 =====
write("08", "meta.sh", meta(
    "08", "用 Retain PV 创建 PVC 并恢复 MariaDB", "存储", 7,
    """mariadb namespace 里 Deployment 被误删。恢复步骤：
1. 已有 Retain 策略 PV mariadb-pv，先查它的 StorageClass
2. 创建 PVC mariadb（RWO，250Mi，绑定到 mariadb-pv）
3. 修改 /home/student/mariadb-deployment.yaml 挂 PVC 到 /var/lib/mysql
4. apply""",
    """kubectl get pv
# pvc.yaml：
# name: mariadb, ns: mariadb
# accessModes: [ReadWriteOnce]
# volumeName: mariadb-pv
# storageClassName: ""（pv 没设 SC 时）
# storage: 250Mi
kubectl apply -f pvc.yaml
# 然后修改 mariadb-deployment.yaml 加 volume + volumeMounts /var/lib/mysql"""))
write("08", "setup.sh", setup("08", """
ensure_ns mariadb
kubectl delete deployment mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pvc mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pv mariadb-pv --ignore-not-found >/dev/null 2>&1
mkdir -p /home/student /root/work
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
cat > /home/student/mariadb-deployment.yaml <<'YAML'
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
ln -sf /home/student/mariadb-deployment.yaml /root/work/mariadb-deployment.yaml 2>/dev/null || true
"""))
write("08", "check.sh", check("08", """
PVC=$(kubectl get pvc mariadb -n mariadb -o json 2>/dev/null)
if [ -z "$PVC" ]; then fail "PVC mariadb 不存在"; else
  assert_eq "PVC Bound" "Bound" "$(echo "$PVC" | jq -r '.status.phase')"
  assert_eq "volumeName=mariadb-pv" "mariadb-pv" "$(echo "$PVC" | jq -r '.spec.volumeName')"
  assert_eq "capacity=250Mi" "250Mi" "$(echo "$PVC" | jq -r '.spec.resources.requests.storage')"
fi
D=$(kubectl get deployment mariadb -n mariadb -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment mariadb 不存在"; else
  pass "Deployment mariadb 已应用"
  CL=$(echo "$D" | jq -r '.spec.template.spec.volumes[]? | select(.persistentVolumeClaim) | .persistentVolumeClaim.claimName')
  assert_eq "mount 了 PVC mariadb" "mariadb" "$CL"
  MP=$(echo "$D" | jq -r '.spec.template.spec.containers[0].volumeMounts[]? | select(.mountPath=="/var/lib/mysql") | .mountPath')
  assert_eq "挂载到 /var/lib/mysql" "/var/lib/mysql" "$MP"
fi
"""))
write("08", "clean.sh", clean("08", """
kubectl delete deployment mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pvc mariadb -n mariadb --ignore-not-found >/dev/null 2>&1
kubectl delete pv mariadb-pv --ignore-not-found >/dev/null 2>&1
clean_ns mariadb
"""))

# ===== 09 Gateway API =====
write("09", "meta.sh", meta(
    "09", "Gateway API 迁移 Ingress", "服务与网络", 8,
    """将现有名为 web 的 Ingress 迁移到 Gateway API，保持 host + TLS + 路由：
1. 创建 Gateway web-gateway，host gateway.web.k8s.local
2. 创建 HTTPRoute web-route，保持原 Ingress 的路由规则
3. 删除旧 Ingress web""",
    """kubectl get ingress web -o yaml   # 抄 host/TLS/paths/service/port
# gateway.yaml + httproute.yaml
kubectl apply -f gateway.yaml
kubectl apply -f httproute.yaml
kubectl delete ingress web"""))
write("09", "setup.sh", setup("09", """
ensure_ns default
kubectl delete gateway web-gateway -o jsonpath={.metadata.name} >/dev/null 2>&1 || kubectl delete gateway web-gateway 2>/dev/null || true
kubectl delete httproute web-route 2>/dev/null || true
kubectl delete ingress web 2>/dev/null || true
# 建 GatewayClass（Traefik 的 provider）
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: nginx
spec:
  controllerName: traefik.io/gateway-controller
YAML
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: Secret
metadata:
  name: web-tls
type: kubernetes.io/tls
data:
  tls.crt: $(openssl req -x509 -nodes -newkey rsa:2048 -keyout /tmp/tls.key -out /tmp/tls.crt -days 1 -subj '/CN=gateway.web.k8s.local' 2>/dev/null; base64 -w0 /tmp/tls.crt)
  tls.key: $(base64 -w0 /tmp/tls.key)
YAML
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: v1
kind: ServiceAccount
metadata: {name: web-app}
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: web-app}
spec:
  replicas: 1
  selector: {matchLabels: {app: web-app}}
  template:
    metadata: {labels: {app: web-app}}
    spec:
      serviceAccountName: web-app
      containers:
      - name: web
        image: nginx:1.25
---
apiVersion: v1
kind: Service
metadata: {name: web}
spec:
  selector: {app: web-app}
  ports: [{port: 80}]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: {name: web}
spec:
  ingressClassName: traefik
  tls: [{hosts: ["gateway.web.k8s.local"], secretName: web-tls}]
  rules:
  - host: gateway.web.k8s.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port: {number: 80}
YAML
kubectl rollout status deployment/web-app --timeout=120s >/dev/null 2>&1
"""))
write("09", "check.sh", check("09", """
if kubectl get ingress web >/dev/null 2>&1; then fail "旧 Ingress web 未删除"; else pass "旧 Ingress web 已删除"; fi
GW=$(kubectl get gateway web-gateway -o json 2>/dev/null)
if [ -z "$GW" ]; then fail "Gateway web-gateway 不存在"; else
  assert_eq "gatewayClass=nginx" "nginx" "$(echo "$GW" | jq -r '.spec.gatewayClassName')"
  assert_eq "host=gateway.web.k8s.local" "gateway.web.k8s.local" "$(echo "$GW" | jq -r '.spec.listeners[0].hostname')"
fi
HR=$(kubectl get httproute web-route -o json 2>/dev/null)
if [ -z "$HR" ]; then fail "HTTPRoute web-route 不存在"; else
  assert_eq "host=gateway.web.k8s.local" "gateway.web.k8s.local" "$(echo "$HR" | jq -r '.spec.hostnames[0]')"
  assert_eq "backend service=web" "web" "$(echo "$HR" | jq -r '.spec.rules[0].backendRefs[0].name')"
  assert_eq "backend port=80" "80" "$(echo "$HR" | jq -r '.spec.rules[0].backendRefs[0].port.number')"
fi
"""))
write("09", "clean.sh", clean("09", """
kubectl delete gateway web-gateway 2>/dev/null || true
kubectl delete httproute web-route 2>/dev/null || true
kubectl delete ingress web 2>/dev/null || true
kubectl delete deploy web-app >/dev/null 2>&1 || true
kubectl delete svc web >/dev/null 2>&1 || true
kubectl delete sa web-app >/dev/null 2>&1 || true
kubectl delete secret web-tls >/dev/null 2>&1 || true
kubectl delete gatewayclass nginx >/dev/null 2>&1 || true
"""))

# ===== 10 NetworkPolicy 样本选应用 =====
write("10", "meta.sh", meta(
    "10", "从样本中选 NetworkPolicy 应用", "服务与网络", 7,
    """frontend/backend namespace 各有一个 Deployment，backend 有默认 deny-all NetworkPolicy。
/home/student/netpol 里有 3 个 YAML 样本（netpol1 过度宽松、netpol2 过度严格、netpol3 正确）。
选一个应用，让 frontend namespace 下 app=frontend 的 Pod 能访问 backend namespace 下 app=backend 的 Pod。
不要修改/删除 netpol 文件夹里的文件。""",
    """ls /home/student/netpol/
# 看每个 YAML 的 spec
kubectl apply -f /home/student/netpol/netpol3.yaml
kubectl -n backend get networkpolicy"""))
write("10", "setup.sh", setup("10", """
ensure_ns frontend; kubectl label ns frontend name=frontend --overwrite >/dev/null
ensure_ns backend;  kubectl label ns backend  name=backend  --overwrite
kubectl delete networkpolicy --all -n backend >/dev/null 2>&1
kubectl delete deployment frontend -n frontend >/dev/null 2>&1 || true
kubectl delete deployment backend  -n backend  >/dev/null 2>&1 || true
kubectl -n frontend create deployment frontend --image=nginx:1.25 >/dev/null && kubectl label pods -n frontend app=frontend --overwrite >/dev/null 2>&1
kubectl -n backend  create deployment backend  --image=nginx:1.25 >/dev/null && kubectl label pods -n backend  app=backend  --overwrite >/dev/null 2>&1
# 默认拒绝所有入站流量（让用户的策略能应用）
kubectl -n backend apply -f - >/dev/null <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: deny-all-ingress}
spec:
  podSelector: {}
  policyTypes: [Ingress]
YAML
# 默认拒绝所有出站流量（按题目原文）
kubectl -n backend apply -f - >/dev/null <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: deny-all-egress}
spec:
  podSelector: {}
  policyTypes: [Egress]
YAML
# 预置 3 个样本 YAML
mkdir -p /home/student/netpol /root/work/netpol
cp -r /home/student/netpol/. /root/work/netpol/ 2>/dev/null
cat > /home/student/netpol/netpol1.yaml <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all
  namespace: backend
spec:
  podSelector: {}
  policyTypes: [Ingress]
  ingress:
  - {}
YAML
cat > /home/student/netpol/netpol2.yaml <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-from-frontend
  namespace: backend
spec:
  podSelector:
    matchLabels: {app: backend}
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector: {matchLabels: {app: frontend}}
    to:
    - ports: [{port: 443}]
YAML
cat > /home/student/netpol/netpol3.yaml <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: backend
spec:
  podSelector:
    matchLabels: {app: backend}
  policyTypes: [Ingress]
  ingress:
  - from:
    - namespaceSelector: {matchLabels: {name: frontend}}
      podSelector: {matchLabels: {app: frontend}}
YAML
cp -r /home/student/netpol/. /root/work/netpol/ 2>/dev/null || true
kubectl rollout status deployment/frontend -n frontend --timeout=120s >/dev/null 2>&1 || true
kubectl rollout status deployment/backend  -n backend  --timeout=120s >/dev/null 2>&1 || true
"""))
write("10", "check.sh", check("10", """
NP=$(kubectl get networkpolicy -n backend -o json 2>/dev/null)
if [ -z "$NP" ]; then fail "backend namespace 没有 NetworkPolicy"; else
  # 至少有一个策略是允许 app=backend Pod 接受来自 frontend namespace + app=frontend Pod 入站
  OK=$(echo "$NP" | jq -r '[.items[] | select(
      (.spec.podSelector.matchLabels.app=="backend") and
      ([.spec.ingress[]?.from[]? | select(.namespaceSelector.matchLabels.name=="frontend" and .podSelector.matchLabels.app=="frontend")]|length>0)
    )]|length')
  assert_ge "应用了正确的 frontend→backend 策略" 1 "${OK:-0}"
  # 确认默认拒绝策略没被删除
  DENY=$(echo "$NP" | jq -r '[.items[] | select(.metadata.name=="deny-all-ingress")]|length')
  assert_eq "未删除默认 deny-all-ingress" "1" "${DENY}"
fi
# 确认样本文件没被用户删/改
for f in netpol1.yaml netpol2.yaml netpol3.yaml; do
  if [ ! -f "/home/student/netpol/$f" ]; then fail "/home/student/netpol/$f 被删除"; fi
done
pass "三个样本文件都还在"
"""))
write("10", "clean.sh", clean("10", """
kubectl delete networkpolicy --all -n backend >/dev/null 2>&1 || true
kubectl delete deployment frontend -n frontend >/dev/null 2>&1 || true
kubectl delete deployment backend  -n backend  >/dev/null 2>&1 || true
clean_ns frontend
clean_ns backend
rm -rf /home/student/netpol /root/work/netpol
"""))

# ===== 11 cert-manager CRD + explain =====
write("11", "meta.sh", meta(
    "11", "cert-manager CRD 列表 + 提取 subject 字段文档", "集群架构", 7,
    """1. kubectl get crd 列出所有 cert-manager 的 CRD，保存到 ~/resources.yaml（默认输出，不加 -o）
2. kubectl explain certificate.spec.subject，保存到 ~/subject.yaml""",
    """kubectl get crd | grep cert-manager > ~/resources.yaml
kubectl explain certificate.spec.subject > ~/subject.yaml"""))
write("11", "setup.sh", setup("11", """
rm -f /root/work/resources.yaml /root/resources.yaml /root/work/subject.yaml /root/subject.yaml
"""))
write("11", "check.sh", check("11", """
if [ -s "$HOME/resources.yaml" ]; then
  pass "resources.yaml 已创建"
  assert_contains "resources.yaml 含 cert-manager CRD" "certificates.cert-manager.io" "$(cat "$HOME/resources.yaml")"
else
  fail "resources.yaml 不存在或为空"
fi
if [ -s "$HOME/subject.yaml" ]; then
  pass "subject.yaml 已创建"
  assert_contains "subject.yaml 含 subject 字段说明" "subject" "$(cat "$HOME/subject.yaml")"
else
  fail "subject.yaml 不存在或为空"
fi
"""))
write("11", "clean.sh", clean("11", """
rm -f /root/work/resources.yaml /root/resources.yaml /root/work/subject.yaml /root/subject.yaml
"""))

# ===== 12 ConfigMap ssl_protocols + immutable =====
write("12", "meta.sh", meta(
    "12", "更新 ConfigMap TLS 配置 + rollout restart", "服务与网络", 6,
    """nginx-static namespace 的 nginx-static Deployment 用 ConfigMap nginx-config。
1. 修改 nginx-config：ssl_protocols 改为 TLSv1.2 TLSv1.3
2. 设置 nginx-config 为 immutable
3. rollout restart Deployment nginx-static 让配置生效""",
    """kubectl -n nginx-static edit configmap nginx-config
# data.default.conf 里把 ssl_protocols 改成 TLSv1.2 TLSv1.3
# 顶层加 immutable: true
kubectl -n nginx-static rollout restart deployment nginx-static"""))
write("12", "setup.sh", setup("12", """
ensure_ns nginx-static
kubectl delete deployment nginx-static -n nginx-static >/dev/null 2>&1 || true
kubectl delete configmap nginx-config -n nginx-static >/dev/null 2>&1 || true
cat > /tmp/nginx-default.conf <<'CONF'
server {
    listen 80;
    ssl_protocols TLSv1.1;
    location / { return 200 "ok"; }
}
CONF
kubectl -n nginx-static create configmap nginx-config --from-file=default.conf=/tmp/nginx-default.conf >/dev/null
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-static
  namespace: nginx-static
spec:
  replicas: 1
  selector: {matchLabels: {app: nginx-static}}
  template:
    metadata: {labels: {app: nginx-static}}
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
kubectl rollout status deployment/nginx-static -n nginx-static --timeout=120s >/dev/null 2>&1
"""))
write("12", "check.sh", check("12", """
CM=$(kubectl get cm nginx-config -n nginx-static -o json 2>/dev/null)
if [ -z "$CM" ]; then fail "ConfigMap nginx-config 不存在"; else
  DATA=$(echo "$CM" | jq -r '.data["default.conf"] // .data')
  assert_contains "ssl_protocols 包含 TLSv1.2" "TLSv1.2" "$DATA"
  assert_contains "ssl_protocols 包含 TLSv1.3" "TLSv1.3" "$DATA"
  assert_not_contains "已移除 TLSv1.1" "ssl_protocols TLSv1.1" "$DATA"
  assert_eq "ConfigMap immutable=true" "true" "$(echo "$CM" | jq -r '.immutable // false')"
fi
D=$(kubectl get deployment nginx-static -n nginx-static -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment 不存在"; else
  RA=$(echo "$D" | jq -r '.metadata.annotations["kubectl.kubernetes.io/restartedAt"] // ""')
  if [ -n "$RA" ]; then pass "已执行 rollout restart"
  else fail "Deployment 未 rollout restart（restartedAt 为空）"; fi
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_ge "Deployment 就绪" 1 "${READY:-0}"
fi
"""))
write("12", "clean.sh", clean("12", """
kubectl delete deployment nginx-static -n nginx-static >/dev/null 2>&1 || true
kubectl delete configmap nginx-config -n nginx-static >/dev/null 2>&1 || true
clean_ns nginx-static
"""))

# ===== 13 Calico ===== (理论题)
write("13", "meta.sh", meta(
    "13", "安装 Calico 3.28.2（CNI 替换）", "网络基础", 0,
    """（理论题）集群 CNI 被移除，需要安装 Calico 3.28.2。
1. kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/tigera-operator.yaml
2. kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/custom-resources.yaml
3. 等 Pod 全部 Running，检查 Pod 能互相通信 + NetworkPolicy 生效""",
    """kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/tigera-operator.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/custom-resources.yaml
kubectl get pods -n calico-system -w
# 注意：当前 k3s 用 flannel 做 CNI，安装 Calico 会替换 CNI 导致集群重新初始化。
# 本题作为理论题，标记完成即可。"""))
write("13", "setup.sh", setup("13", """
# 理论题：什么都不做（避免替换 CNI 搞挂集群）
"""))
write("13", "check.sh", check("13", """
pass "理论题：Calico 3.28.2 / Flannel 0.26.1 题目需要替换 CNI，在单节点 k3s 上作为理论题处理。"
pass "执行 cka done 13 标记完成"
"""))
write("13", "clean.sh", clean("13", ""))

# ===== 14 wordpress resources 平均分配 =====
write("14", "meta.sh", meta(
    "14", "平均分配资源 requests（先 scale 到 0）", "工作负载", 7,
    """relative-fawn namespace 的 Deployment wordpress 3 副本。requests 过高导致 Pending。
1. 先 scale 到 0
2. 计算节点可分配资源，除以 3，得到每个 Pod 的 requests
3. 同时修改容器和 init 容器的 requests（题目原文要求两者一致）
4. scale 回 3，等所有 Pod Running/Ready""",
    """kubectl -n relative-fawn scale deployment wordpress --replicas=0
kubectl get nodes; kubectl describe node | grep -A5 Allocatable
# 假设节点 2C / 3.4Gi，平均每 Pod cpu=100m memory=128Mi
kubectl -n relative-fawn edit deployment wordpress
# 两个 containers 的 resources.requests 都改
kubectl -n relative-fawn scale deployment wordpress --replicas=3
kubectl -n relative-fawn get pod -w"""))
write("14", "setup.sh", setup("14", """
ensure_ns relative-fawn
kubectl delete deployment wordpress -n relative-fawn >/dev/null 2>&1 || true
cat <<'YAML' | kubectl apply -f - >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordpress
  namespace: relative-fawn
spec:
  replicas: 3
  selector: {matchLabels: {app: wordpress}}
  template:
    metadata: {labels: {app: wordpress}}
    spec:
      initContainers:
      - name: init
        image: busybox:1.36
        command: ["sh","-c","echo init"]
        resources:
          requests: {cpu: "8", memory: "8Gi"}
          limits:   {cpu: "8", memory: "8Gi"}
      containers:
      - name: wordpress
        image: nginx:1.25
        resources:
          requests: {cpu: "8", memory: "8Gi"}
          limits:   {cpu: "8", memory: "8Gi"}
YAML
"""))
write("14", "check.sh", check("14", """
D=$(kubectl get deployment wordpress -n relative-fawn -o json 2>/dev/null)
if [ -z "$D" ]; then fail "Deployment wordpress 不存在"; else
  READY=$(echo "$D" | jq -r '.status.readyReplicas // 0')
  assert_eq "3 副本 Ready" "3" "$READY"
  REQ_CPU=$(echo "$D" | jq -r '.spec.template.spec.containers[0].resources.requests.cpu')
  REQ_MEM=$(echo "$D" | jq -r '.spec.template.spec.containers[0].resources.requests.memory')
  assert_ne "requests.cpu 不再是 8" "8" "$REQ_CPU"
  assert_ne "requests.memory 不再是 8Gi" "8Gi" "$REQ_MEM"
  INIT_CPU=$(echo "$D" | jq -r '.spec.template.spec.initContainers[0].resources.requests.cpu')
  INIT_MEM=$(echo "$D" | jq -r '.spec.template.spec.initContainers[0].resources.requests.memory')
  assert_eq "init 容器与主容器 cpu requests 一致" "$REQ_CPU" "$INIT_CPU"
  assert_eq "init 容器与主容器 memory requests 一致" "$REQ_MEM" "$INIT_MEM"
fi
"""))
write("14", "clean.sh", clean("14", """
kubectl delete deployment wordpress -n relative-fawn >/dev/null 2>&1 || true
clean_ns relative-fawn
"""))

# ===== 15 etcd 修复 ===== (理论题)
write("15", "meta.sh", meta(
    "15", "修复迁移后损坏的单节点集群（外部 etcd）", "集群架构", 0,
    """（理论题）kubeadm 集群迁移到新机器后损坏，使用外部 etcd。
修复步骤：
1. ssh 到目标节点，sudo -i 切 root
2. 检查 /etc/kubernetes/manifests/kube-apiserver.yaml 里 --etcd-servers / --etcd-cafile / --etcd-certfile / --etcd-keyfile
3. 指向新机器或正确路径，保存
4. systemctl daemon-reload && systemctl restart kubelet
5. kubectl get nodes 全 Ready""",
    """sudo -i
vim /etc/kubernetes/manifests/kube-apiserver.yaml
# --etcd-servers=https://127.0.0.1:2379
# --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt
# --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt
# --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key
systemctl daemon-reload && systemctl restart kubelet
kubectl get nodes
exit 2次"""))
write("15", "setup.sh", setup("15", ""))
write("15", "check.sh", check("15", """
pass "理论题：kubeadm + 外部 etcd 迁移损坏修复步骤"
pass "当前 k3s 单节点用 sqlite 做后端，无法真实复现 kubeadm 的外部 etcd 场景"
pass "执行 cka done 15 标记完成"
"""))
write("15", "clean.sh", clean("15", ""))

# ===== 16 cri-dockerd + sysctl ===== (理论题)
write("16", "meta.sh", meta(
    "16", "cri-dockerd + sysctl 参数配置", "集群架构", 0,
    """（理论题）为 kubeadm 准备 Linux 系统：
1. sudo dpkg -i /home/student/cri-dockerd_0.3.6.3-0.ubuntu-jammy_amd64.deb
2. sudo systemctl enable --now cri-docker
3. /etc/sysctl.conf 末尾加：
   net.bridge.bridge-nf-call-iptables = 1
   net.ipv6.conf.all.forwarding = 1
   net.ipv4.ip_forward = 1
   net.netfilter.nf_conntrack_max = 131072
4. sudo sysctl -p""",
    """sudo dpkg -i cri-dockerd_0.3.6.3-0.ubuntu-jammy_amd64.deb
sudo systemctl enable --now cri-docker
sudo vim /etc/sysctl.conf
sudo sysctl -p"""))
write("16", "setup.sh", setup("16", ""))
write("16", "check.sh", check("16", """
pass "理论题：cri-dockerd + sysctl 宿主机配置"
pass "当前 Pod 内无法 dpkg / systemctl / sysctl 配置宿主机内核参数"
pass "执行 cka done 16 标记完成"
"""))
write("16", "clean.sh", clean("16", ""))

print("done", len([d for d in os.listdir(TASKS) if os.path.isdir(os.path.join(TASKS, d))]))


# ===== 辅助函数 =====
def meta(id_num, title, category, weight, description, hint):
    # 此函数会被覆盖，上面的 write 会自动用同名定义。
    return ''
