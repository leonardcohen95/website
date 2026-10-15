/* ============================================================
   K8s Quest - 题库（支持多套变体，答错可消耗1星换题）
   每个 slot 有多道变体题，重新答题时切换到不同变体
   ============================================================ */
window.QUESTION_BANK = {
  "01-intro": [
    { slot: "q1", variants: [
      { type: "choice", q: "Kubernetes 的主要用途是什么？", options: ["单机数据库管理", "容器编排与集群管理", "网页服务器", "代码版本控制"], answer: 1, stars: 1, explain: "Kubernetes 是一个开源的容器编排平台，用于自动化部署、扩缩容和管理容器化应用。" },
      { type: "choice", q: "K8s 这个缩写是怎么来的？", options: ["Kubernetes 的首字母 K 加 8 个字母", "K 后面有 8 个字符", "Kubernetes 中 K 和 s 之间有 8 个字母", "随便起的名字"], answer: 2, stars: 1, explain: "K8s 是 Kubernetes 的缩写，K 和 s 之间有 8 个字母（ubernete）。" },
      { type: "choice", q: "Kubernetes 最初是由哪家公司开发的？", options: ["Microsoft", "Google", "Amazon", "Red Hat"], answer: 1, stars: 1, explain: "Kubernetes 最初由 Google 开发，基于其内部 Borg 系统的经验，后捐赠给 CNCF。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "容器相比虚拟机的主要优势是什么？", options: ["更安全", "启动更快、资源开销更小", "功能更强", "不需要操作系统"], answer: 1, stars: 1, explain: "容器共享宿主机内核，启动秒级，资源开销远小于虚拟机，非常适合微服务架构。" },
      { type: "choice", q: "Docker 和 Kubernetes 的关系是？", options: ["互相竞争的容器技术", "K8s 可以管理 Docker 等容器运行时", "Docker 包含 Kubernetes", "没有关系"], answer: 1, stars: 1, explain: "Docker 是容器运行时/镜像工具，K8s 是编排平台，可以调度和管理 Docker 等容器。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Kubernetes 只能管理 Docker 容器。", answer: false, stars: 1, explain: "K8s 通过 CRI（容器运行时接口）支持多种容器运行时，如 containerd、CRI-O 等，不局限于 Docker。" },
      { type: "judge", q: "Kubernetes 是一个闭源的商业产品。", answer: false, stars: 1, explain: "Kubernetes 是完全开源的项目，由 CNCF 托管，遵循 Apache 2.0 许可证。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是 Kubernetes 的核心特性？（多选）", options: ["自动扩缩容", "滚动更新与回滚", "服务发现与负载均衡", "自我修复"], answer: [0,1,2,3], stars: 2, explain: "自动扩缩容、滚动更新、服务发现、负载均衡、自我修复都是 K8s 的核心特性。" },
      { type: "multi", q: "容器编排平台解决了哪些问题？（多选）", options: ["容器调度", "服务发现", "故障恢复", "批量计算"], answer: [0,1,2], stars: 2, explain: "编排平台主要解决调度、服务发现、故障恢复等问题，批量计算是 Job 的功能。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "CNCF 的全称是什么？", options: ["Cloud Native Computing Foundation", "Container Network Cloud Foundation", "Cloud Native Container Federation", "Container Native Cloud Forum"], answer: 0, stars: 1, explain: "CNCF 即 Cloud Native Computing Foundation，是托管 Kubernetes 的云原生计算基金会。" },
      { type: "choice", q: "Kubernetes 项目的吉祥物是什么？", options: ["鲸鱼", "舵轮/七角海星", "企鹅", "章鱼"], answer: 1, stars: 1, explain: "Kubernetes 的 Logo 是一个舵轮形状，吉祥物与航海主题相关（希腊语中意为舵手）。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Kubernetes 这个单词在希腊语中的意思是______。", answer: "舵手|飞行员|helmsman|pilot", stars: 2, explain: "Kubernetes 源自希腊语，意为舵手或飞行员，这也是其 Logo 为舵轮的原因。" },
      { type: "text", q: "K8s 中 K 和 s 之间有 ______ 个字母。", answer: "8", stars: 1, explain: "Kubernetes 中 K 和 s 之间有 8 个字母，因此缩写为 K8s。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "以下哪项不是容器编排平台？", options: ["Kubernetes", "Docker Swarm", "Apache Mesos", "Nginx"], answer: 3, stars: 1, explain: "Nginx 是 Web 服务器/反向代理，不是容器编排平台。其他三个都是编排工具。" },
      { type: "choice", q: "云原生应用的典型特征不包括？", options: ["微服务架构", "容器化部署", "单体巨石应用", "自动化运维"], answer: 2, stars: 1, explain: "云原生强调微服务、容器化、自动化，单体巨石应用不是云原生的特征。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "使用 Kubernetes 后，应用就不会再出现故障了。", answer: false, stars: 1, explain: "K8s 能提升可用性和自愈能力，但不能完全消除故障，应用本身的健壮性仍很重要。" },
      { type: "judge", q: "Kubernetes 可以跨多个可用区部署以实现高可用。", answer: true, stars: 1, explain: "K8s 支持多节点、多可用区部署，通过副本和调度策略实现高可用。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "以下哪个不是 Kubernetes 的核心优势？", options: ["自我修复", "自动扩缩容", "提升单机性能上限", "服务发现"], answer: 2, stars: 1, explain: "K8s 通过多副本和调度提升可用性和弹性，但不能突破单机硬件性能上限。" },
      { type: "choice", q: "Kubernetes 主要解决的问题不包括？", options: ["容器编排", "服务发现", "代码编译", "故障自愈"], answer: 2, stars: 1, explain: "K8s 不负责代码编译，那是 CI/CD 工具的职责。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Kubernetes 这个单词在希腊语中的意思是______。", answer: "舵手|飞行员|helmsman|pilot", stars: 2, explain: "Kubernetes 源自希腊语，意为舵手或飞行员，这也是其 Logo 为舵轮的原因。" },
      { type: "text", q: "K8s 中 K 和 s 之间有 ______ 个字母。", answer: "8", stars: 1, explain: "Kubernetes 中 K 和 s 之间有 8 个字母，因此缩写为 K8s。" }
    ]}
  ],
  "02-arch": [
    { slot: "q1", variants: [
      { type: "choice", q: "Kubernetes 控制平面（Master）的核心组件不包括？", options: ["kube-apiserver", "etcd", "kubelet", "kube-scheduler"], answer: 2, stars: 1, explain: "kubelet 是运行在每个 Node 上的节点代理，属于数据平面，不是控制平面组件。" },
      { type: "choice", q: "Kubernetes 集群中，负责存储所有集群数据的组件是？", options: ["kube-apiserver", "etcd", "kube-controller-manager", "kube-proxy"], answer: 1, stars: 1, explain: "etcd 是 K8s 的后端存储，以键值对形式保存集群的所有状态数据。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "kube-apiserver 的主要作用是？", options: ["调度 Pod 到节点", "提供 REST API 作为集群唯一入口", "存储集群数据", "管理网络"], answer: 1, stars: 1, explain: "kube-apiserver 是 K8s 的前端，所有组件和用户都通过它的 REST API 与集群交互。" },
      { type: "choice", q: "所有对集群的操作都必须通过哪个组件？", options: ["etcd", "kube-apiserver", "kubelet", "kube-scheduler"], answer: 1, stars: 1, explain: "kube-apiserver 是集群的唯一入口，所有读写操作都必须经过它，保证了一致性。" }
    ]},
    { slot: "q3", variants: [
      { type: "choice", q: "kube-scheduler 的职责是？", options: ["运行容器", "为新创建的 Pod 选择合适的节点", "提供 API", "存储数据"], answer: 1, stars: 1, explain: "调度器监视未分配节点的 Pod，并根据资源、策略等为其选择最合适的节点。" },
      { type: "choice", q: "kube-controller-manager 运行的控制器不包括？", options: ["Node Controller", "Deployment Controller", "kube-proxy", "ReplicaSet Controller"], answer: 2, stars: 1, explain: "kube-proxy 是独立的网络代理组件，运行在 Node 上，不属于 controller-manager。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "Node 节点上负责与容器运行时交互、管理 Pod 生命周期的组件是？", options: ["kube-proxy", "kubelet", "containerd", "etcd"], answer: 1, stars: 1, explain: "kubelet 是节点代理，接收 apiserver 的 Pod 规格并确保容器在节点上正确运行。" },
      { type: "choice", q: "Node 节点上负责 Service 网络转发规则的组件是？", options: ["kubelet", "kube-proxy", "containerd", "kube-scheduler"], answer: 1, stars: 1, explain: "kube-proxy 在每个节点上维护网络规则，实现 Service 的负载均衡和转发。" }
    ]},
    { slot: "q5", variants: [
      { type: "judge", q: "etcd 是一个关系型数据库。", answer: false, stars: 1, explain: "etcd 是一个分布式的键值（KV）存储数据库，不是关系型数据库。" },
      { type: "judge", q: "控制平面组件可以部署在多个节点上以实现高可用。", answer: true, stars: 1, explain: "生产环境通常部署多 Master 节点，etcd 多副本，保证控制平面的高可用。" }
    ]},
    { slot: "q6", variants: [
      { type: "multi", q: "以下哪些属于控制平面（Master）组件？（多选）", options: ["kube-apiserver", "kube-scheduler", "kubelet", "etcd"], answer: [0,1,3], stars: 2, explain: "kube-apiserver、kube-scheduler、etcd 都属于控制平面；kubelet 属于数据平面（Node）。" },
      { type: "multi", q: "以下哪些运行在 Node（工作节点）上？（多选）", options: ["kubelet", "kube-proxy", "容器运行时", "kube-controller-manager"], answer: [0,1,2], stars: 2, explain: "kubelet、kube-proxy、容器运行时运行在工作节点上；controller-manager 在控制平面。" }
    ]},
    { slot: "q7", variants: [
      { type: "text", q: "K8s 集群中，用户通过命令行工具 ______ 与集群交互。", answer: "kubectl", stars: 1, explain: "kubectl 是 K8s 的官方命令行工具，用于与集群交互、部署和管理应用。" },
      { type: "text", q: "K8s 后端存储使用的分布式 KV 数据库是 ______。", answer: "etcd", stars: 1, explain: "etcd 是 K8s 默认的后端存储，保存集群所有状态数据。" }
    ]},
    { slot: "q8", variants: [
      { type: "choice", q: "云控制器管理器（cloud-controller-manager）的作用是？", options: ["管理存储卷", "对接云厂商 API，集成负载均衡等", "调度 Pod", "管理用户认证"], answer: 1, stars: 2, explain: "cloud-controller-manager 负责与云提供商 API 集成，管理云负载均衡器、存储卷等。" },
      { type: "choice", q: "关于 kube-proxy，下列说法正确的是？", options: ["它是 HTTP 代理", "它维护 iptables/ipvs 规则实现 Service 转发", "它运行在 Master 节点", "它负责调度 Pod"], answer: 1, stars: 2, explain: "kube-proxy 运行在每个节点上，通过 iptables 或 ipvs 规则实现 Service 的网络转发。" }
    ]},
    { slot: "q9", variants: [
      { type: "judge", q: "kube-scheduler 是有状态的组件，必须存储调度历史。", answer: false, stars: 2, explain: "kube-scheduler 是无状态的，每次调度独立决策，不存储历史状态。" },
      { type: "judge", q: "etcd 可以部署为多节点集群以实现高可用。", answer: true, stars: 1, explain: "生产环境通常部署 3 或 5 个 etcd 节点组成集群，保证高可用和数据一致性。" }
    ]},
    { slot: "q10", variants: [
      { type: "choice", q: "K8s 中负责维持期望状态（如副本数）的控制器运行在哪个组件？", options: ["kube-apiserver", "kube-controller-manager", "kube-scheduler", "etcd"], answer: 1, stars: 2, explain: "kube-controller-manager 运行各种控制器（如 Deployment、ReplicaSet 控制器），不断将实际状态调和到期望状态。" },
      { type: "text", q: "K8s 控制平面中，所有组件通信的唯一入口是 ______。", answer: "kube-apiserver|apiserver", stars: 2, explain: "kube-apiserver 是控制平面的唯一入口，所有组件都通过它交互，保证一致性。" }
    ]}
  ],
  "03-core": [
    { slot: "q1", variants: [
      { type: "choice", q: "Kubernetes 中最小的部署单元是？", options: ["Container", "Pod", "Deployment", "Node"], answer: 1, stars: 1, explain: "Pod 是 K8s 中最小的可部署单元，包含一个或多个紧密协作的容器。" },
      { type: "choice", q: "以下哪个不是 K8s 的核心资源对象？", options: ["Pod", "Deployment", "Service", "Dockerfile"], answer: 3, stars: 1, explain: "Dockerfile 是构建镜像的文件，不是 K8s 的资源对象。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "Deployment 的主要作用是？", options: ["运行单个容器", "管理无状态应用的部署、扩缩容和滚动更新", "提供存储", "管理网络入口"], answer: 1, stars: 1, explain: "Deployment 用于管理无状态应用，提供声明式更新、扩缩容、回滚等能力。" },
      { type: "choice", q: "ReplicaSet 的作用是？", options: ["服务发现", "确保指定数量的 Pod 副本在运行", "数据持久化", "负载均衡"], answer: 1, stars: 1, explain: "ReplicaSet 确保集群中始终运行指定数量的 Pod 副本，是 Deployment 的底层实现。" }
    ]},
    { slot: "q3", variants: [
      { type: "choice", q: "Service 的主要作用是？", options: ["存储数据", "为一组 Pod 提供稳定的网络访问入口", "调度 Pod", "管理配置"], answer: 1, stars: 1, explain: "Service 为一组 Pod 提供稳定的虚拟 IP 和 DNS 名称，实现服务发现和负载均衡。" },
      { type: "choice", q: "Pod 的 IP 地址是由谁分配的？", options: ["kubelet", "CNI 网络插件", "kube-proxy", "etcd"], answer: 1, stars: 1, explain: "Pod 的 IP 由 CNI（容器网络接口）插件分配和管理，如 Calico、Flannel 等。" }
    ]},
    { slot: "q4", variants: [
      { type: "judge", q: "一个 Pod 内的多个容器共享网络命名空间。", answer: true, stars: 1, explain: "同一 Pod 内的容器共享网络命名空间，可以通过 localhost 互相通信。" },
      { type: "judge", q: "Pod 被删除后会自动恢复。", answer: false, stars: 1, explain: "直接创建的 Pod 删除后不会恢复；通过 Deployment/ReplicaSet 管理的 Pod 才会被自动重建。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "以下哪些是 K8s 的核心工作负载资源？（多选）", options: ["Deployment", "StatefulSet", "DaemonSet", "Ingress"], answer: [0,1,2], stars: 2, explain: "Deployment、StatefulSet、DaemonSet 是工作负载资源；Ingress 是网络资源。" },
      { type: "multi", q: "Service 的类型有哪些？（多选）", options: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"], answer: [0,1,2,3], stars: 2, explain: "Service 支持 ClusterIP、NodePort、LoadBalancer、ExternalName 四种类型。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "K8s 中用于管理有状态应用的工作负载是 ______。", answer: "statefulset", stars: 2, explain: "StatefulSet 用于管理有状态应用，提供稳定的网络标识和持久化存储。" },
      { type: "text", q: "K8s 中确保每个节点都运行一个 Pod 副本的工作负载是 ______。", answer: "daemonset", stars: 2, explain: "DaemonSet 确保每个（或匹配的）节点上都运行一个 Pod 副本，常用于日志收集、监控等。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 Pod 与 Deployment 的关系，说法正确的是？", options: ["Deployment 直接创建容器", "Deployment 通过 ReplicaSet 管理 Pod 副本", "Pod 管理 Deployment", "两者无关"], answer: 1, stars: 2, explain: "Deployment 不直接管理 Pod，而是通过创建和管理 ReplicaSet 来控制 Pod 副本数量。" },
      { type: "choice", q: "以下哪种资源最适合运行一次性任务？", options: ["Deployment", "StatefulSet", "Job", "DaemonSet"], answer: 2, stars: 2, explain: "Job 用于运行一次性或批处理任务，完成后 Pod 正常退出。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Service 的 ClusterIP 在集群外部可以直接访问。", answer: false, stars: 1, explain: "ClusterIP 仅在集群内部可达，外部访问需要通过 NodePort、LoadBalancer 或 Ingress。" },
      { type: "judge", q: "Namespace 可以实现资源的逻辑隔离。", answer: true, stars: 1, explain: "Namespace 提供了资源的逻辑隔离机制，可用于多团队共享同一集群。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "ConfigMap 和 Secret 的主要区别是？", options: ["没有区别", "Secret 专门存储敏感数据并做 base64 编码", "ConfigMap 只能存数字", "Secret 不能挂载到 Pod"], answer: 1, stars: 1, explain: "Secret 用于存储敏感信息（密码、密钥等），数据以 base64 编码存储。" },
      { type: "choice", q: "以下哪个资源用于七层 HTTP 路由？", options: ["Service", "Ingress", "NetworkPolicy", "Endpoint"], answer: 1, stars: 1, explain: "Ingress 提供七层（HTTP/HTTPS）路由规则，可根据域名和路径转发流量。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "K8s 中以键值对形式附加到资源上的元数据标签称为 ______。", answer: "label|labels", stars: 1, explain: "Label 是附加到 K8s 资源上的键值对，用于组织和选择资源。" },
      { type: "text", q: "通过 ______ 可以按标签选择一组资源（如 Pod）。", answer: "selector|label selector", stars: 1, explain: "Label Selector 用于按标签筛选资源，是 Service、Deployment 等关联 Pod 的核心机制。" }
    ]}
  ],
  "04-kubectl": [
    { slot: "q1", variants: [
      { type: "choice", q: "查看当前命名空间下所有 Pod 的命令是？", options: ["kubectl get pods", "kubectl list pods", "kubectl show pods", "kubectl pods"], answer: 0, stars: 1, explain: "kubectl get pods 列出当前命名空间的所有 Pod。" },
      { type: "choice", q: "查看所有命名空间的 Pod，应该加什么参数？", options: ["--all", "-A", "-n all", "--global"], answer: 1, stars: 1, explain: "-A 或 --all-namespaces 表示查看所有命名空间的资源。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "创建资源最常用的命令是？", options: ["kubectl create", "kubectl apply", "kubectl run", "kubectl new"], answer: 1, stars: 1, explain: "kubectl apply -f file.yaml 是声明式创建/更新资源的推荐方式。" },
      { type: "choice", q: "kubectl apply 与 kubectl create 的主要区别是？", options: ["没有区别", "apply 是声明式，可重复执行更新；create 是命令式", "create 更快", "apply 不能创建资源"], answer: 1, stars: 1, explain: "apply 是声明式管理，可幂等执行；create 是命令式，资源已存在时会报错。" }
    ]},
    { slot: "q3", variants: [
      { type: "choice", q: "查看 Pod 详细信息和事件的命令是？", options: ["kubectl get pod", "kubectl describe pod", "kubectl info pod", "kubectl details pod"], answer: 1, stars: 1, explain: "kubectl describe pod <name> 显示资源的详细信息和相关事件，适合排障。" },
      { type: "choice", q: "查看 Pod 日志的命令是？", options: ["kubectl log <pod>", "kubectl logs <pod>", "kubectl show logs <pod>", "kubectl print <pod>"], answer: 1, stars: 1, explain: "kubectl logs <pod-name> 查看 Pod 中容器的标准输出日志。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "删除一个 Deployment 的命令是？", options: ["kubectl delete deployment <name>", "kubectl remove deployment <name>", "kubectl drop deployment <name>", "kubectl destroy deployment <name>"], answer: 0, stars: 1, explain: "kubectl delete <资源类型> <名称> 删除指定资源。" },
      { type: "choice", q: "进入 Pod 内部执行命令，应使用？", options: ["kubectl enter <pod>", "kubectl exec -it <pod> -- bash", "kubectl ssh <pod>", "kubectl shell <pod>"], answer: 1, stars: 1, explain: "kubectl exec -it <pod> -- <命令> 在 Pod 中执行命令，-it 表示交互式终端。" }
    ]},
    { slot: "q5", variants: [
      { type: "judge", q: "kubectl get pods -o wide 可以显示 Pod 所在节点信息。", answer: true, stars: 1, explain: "-o wide 输出更详细的信息，包括 Pod IP、所在节点等。" },
      { type: "judge", q: "kubectl edit 可以直接编辑运行中的资源配置。", answer: true, stars: 1, explain: "kubectl edit <资源类型> <名称> 会打开编辑器修改资源配置并保存生效。" }
    ]},
    { slot: "q6", variants: [
      { type: "multi", q: "以下哪些是 kubectl 的有效输出格式？（多选）", options: ["yaml", "json", "wide", "table"], answer: [0,1,2], stars: 2, explain: "-o 支持 yaml、json、wide、name、custom-columns 等，table 不是标准 -o 值。" },
      { type: "multi", q: "以下哪些命令可以查看资源的 YAML 配置？（多选）", options: ["kubectl get pod <name> -o yaml", "kubectl describe pod <name>", "kubectl get pod <name> -o json", "kubectl logs <name>"], answer: [0,2], stars: 2, explain: "get -o yaml/json 可查看资源完整配置；describe 是格式化描述；logs 看日志。" }
    ]},
    { slot: "q7", variants: [
      { type: "text", q: "实时跟踪 Pod 日志需要加 ______ 参数。", answer: "-f|--follow|f", stars: 1, explain: "kubectl logs -f <pod> 可以实时跟踪日志输出，类似 tail -f。" },
      { type: "text", q: "强制删除 Pod 且不等待优雅终止，加 ______ 参数。", answer: "--force|--grace-period=0", stars: 2, explain: "--force --grace-period=0 可强制立即删除 Pod，跳过优雅终止。" }
    ]},
    { slot: "q8", variants: [
      { type: "choice", q: "kubectl rollout 子命令主要用于？", options: ["滚动更新和回滚 Deployment", "重启节点", "扩缩容", "查看日志"], answer: 0, stars: 2, explain: "kubectl rollout 用于管理 Deployment 的滚动更新，包括 status、history、undo 等。" },
      { type: "choice", q: "查看 Deployment 滚动更新历史，应使用？", options: ["kubectl history deployment <name>", "kubectl rollout history deployment <name>", "kubectl logs deployment <name>", "kubectl events deployment <name>"], answer: 1, stars: 2, explain: "kubectl rollout history deployment <name> 查看滚动更新的历史版本。" }
    ]},
    { slot: "q9", variants: [
      { type: "judge", q: "kubectl scale 可以调整 Deployment 的副本数。", answer: true, stars: 1, explain: "kubectl scale deployment <name> --replicas=N 可动态调整副本数。" },
      { type: "judge", q: "kubectl top 可以查看节点和 Pod 的资源使用情况。", answer: true, stars: 1, explain: "kubectl top nodes/pods 显示资源使用率，但需要 metrics-server 支持。" }
    ]},
    { slot: "q10", variants: [
      { type: "choice", q: "导出资源为 YAML 并保存到文件，可用？", options: ["kubectl get pod <name> -o yaml > pod.yaml", "kubectl export pod <name>", "kubectl save pod <name> -o yaml", "kubectl dump pod <name>"], answer: 0, stars: 2, explain: "使用 -o yaml 输出并重定向到文件即可导出资源配置。" },
      { type: "choice", q: "查看集群中所有可用的 API 资源类型，用？", options: ["kubectl api-resources", "kubectl types", "kubectl resources", "kubectl list-all"], answer: 0, stars: 2, explain: "kubectl api-resources 列出集群支持的所有 API 资源类型。" }
    ]}
  ],
  "05-setup": [
    { slot: "q1", variants: [
      { type: "choice", q: "以下哪个不是本地搭建 K8s 集群的工具？", options: ["minikube", "kind", "k3s", "kubectl"], answer: 3, stars: 1, explain: "kubectl 是命令行客户端工具，不是集群搭建工具。minikube/kind/k3s 都可本地搭集群。" },
      { type: "choice", q: "minikube 启动集群的命令是？", options: ["minikube start", "minikube up", "minikube run", "minikube init"], answer: 0, stars: 1, explain: "minikube start 启动本地单节点 K8s 集群。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "minikube 的默认驱动（driver）通常是？", options: ["virtualbox", "docker", "hyperv", "vmware"], answer: 1, stars: 1, explain: "现代 minikube 默认使用 docker 驱动，利用本机 Docker 运行集群节点。" },
      { type: "choice", q: "使用 minikube 时，访问集群内 Service 的命令是？", options: ["minikube service <name>", "minikube expose <name>", "minikube open <name>", "minikube tunnel"], answer: 0, stars: 1, explain: "minikube service <name> 可以打开浏览器或获取 URL 访问指定 Service。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "minikube 默认创建一个单节点集群。", answer: true, stars: 1, explain: "minikube 默认创建单节点集群，也可通过 --nodes 参数创建多节点。" },
      { type: "judge", q: "kind 是使用 Docker 容器作为节点的 K8s 集群工具。", answer: true, stars: 1, explain: "kind（Kubernetes IN Docker）用 Docker 容器模拟 K8s 节点，适合 CI/CD。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "kubectl 连接集群的配置文件默认路径是？", options: ["~/.kube/config", "/etc/k8s/config", "~/.k8s/config", "/var/lib/kube/config"], answer: 0, stars: 1, explain: "kubectl 默认读取 ~/.kube/config 作为 kubeconfig 文件。" },
      { type: "choice", q: "切换 kubectl 使用的 context，用哪个命令？", options: ["kubectl config use-context <name>", "kubectl context <name>", "kubectl switch <name>", "kubectl use <name>"], answer: 0, stars: 1, explain: "kubectl config use-context <name> 切换当前使用的集群上下文。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "以下哪些是本地/轻量级 K8s 发行版？（多选）", options: ["minikube", "k3s", "kind", "OpenShift"], answer: [0,1,2], stars: 2, explain: "minikube、k3s、kind 都是轻量级本地 K8s；OpenShift 是企业级发行版，较重。" },
      { type: "multi", q: "minikube 支持的功能包括？（多选）", options: ["多节点集群", "多种驱动（docker/vm）", "插件管理", "内置镜像仓库"], answer: [0,1,2,3], stars: 2, explain: "minikube 支持多节点、多驱动、插件管理和内置镜像仓库等功能。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "minikube 中启用插件（如 dashboard）的命令是 minikube ______ dashboard。", answer: "addons enable|addon enable", stars: 2, explain: "minikube addons enable <name> 启用插件，如 dashboard、ingress、metrics-server。" },
      { type: "text", q: "使用 minikube 时，获取集群节点的命令是 kubectl ______ nodes。", answer: "get", stars: 1, explain: "kubectl get nodes 列出集群中的所有节点及其状态。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 k3s，说法正确的是？", options: ["是重量级 K8s 发行版", "是轻量级 K8s，二进制小于 100MB，适合边缘/IoT", "不兼容标准 K8s API", "只能运行在 Windows"], answer: 1, stars: 2, explain: "k3s 是 Rancher 推出的轻量级 K8s，单二进制，适合资源受限和边缘场景。" },
      { type: "choice", q: "kind 创建集群的配置文件通常定义什么？", options: ["Pod 数量", "节点数量和角色", "镜像大小", "网络带宽"], answer: 1, stars: 2, explain: "kind 的配置文件主要定义节点数量和角色（control-plane/worker）。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "kubeadm 是生产环境搭建 K8s 集群的官方推荐工具。", answer: true, stars: 1, explain: "kubeadm 是官方工具，用于引导生产级 K8s 集群，负责初始化控制平面和加入节点。" },
      { type: "judge", q: "minikube 适合运行生产工作负载。", answer: false, stars: 1, explain: "minikube 主要用于本地开发和学习，不适合生产环境，生产应使用 kubeadm 或托管服务。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "minikube dashboard 命令的作用是？", options: ["打开 K8s 仪表盘 Web UI", "查看节点资源", "重启集群", "查看日志"], answer: 0, stars: 1, explain: "minikube dashboard 启动并打开 K8s 官方 Dashboard Web 界面。" },
      { type: "choice", q: "查看 minikube 集群状态用？", options: ["minikube status", "minikube info", "minikube state", "minikube check"], answer: 0, stars: 1, explain: "minikube status 显示集群、节点、kubelet 等组件的运行状态。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "删除 minikube 集群的命令是 minikube ______。", answer: "delete|stop -p", stars: 1, explain: "minikube delete 删除集群及所有资源；minikube stop 仅停止集群。" },
      { type: "text", q: "进入 minikube 节点的命令是 minikube ______。", answer: "ssh", stars: 1, explain: "minikube ssh 登录到 minikube 节点内部进行操作。" }
    ]}
  ],
  "06-pod": [
    { slot: "q1", variants: [
      { type: "choice", q: "Kubernetes 中最小的部署单元是什么？", options: ["Container", "Pod", "Deployment", "Node"], answer: 1, stars: 1, explain: "Pod 是 K8s 最小的部署单元，K8s 以 Pod 为单位调度和管理，而非直接管理容器。" },
      { type: "choice", q: "同一个 Pod 内的容器之间如何通信？", options: ["通过 Service", "通过 Ingress", "通过 localhost 直接通信", "无法通信"], answer: 2, stars: 1, explain: "同 Pod 内的容器共享网络命名空间，可通过 localhost 直接通信，并共享 Volume。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "Pod 被调度到节点并开始运行容器时的状态是？", options: ["Pending", "Succeeded", "Running", "Completed"], answer: 2, stars: 1, explain: "Running 表示 Pod 已调度到节点且至少有一个容器在运行。" },
      { type: "choice", q: "Pod 已被 API Server 接收但尚未调度到节点的状态是？", options: ["Pending", "Running", "Succeeded", "Failed"], answer: 0, stars: 1, explain: "Pending 是 Pod 创建后的初始状态，表示尚未被调度或镜像还在拉取。" }
    ]},
    { slot: "q3", variants: [
      { type: "choice", q: "关于 Init 容器，说法正确的是？", options: ["在主容器启动前运行，用于初始化准备", "和主容器同时启动并行运行", "在主容器退出后运行做清理", "只能有一个且必须成功退出"], answer: 0, stars: 2, explain: "Init 容器按顺序在主容器启动前运行，所有 Init 容器成功后主容器才启动。" },
      { type: "judge", q: "Init 容器支持 readinessProbe 探针。", answer: false, stars: 1, explain: "Init 容器不支持 readinessProbe，因为它们必须运行完成后才启动主容器。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些属于 Sidecar 模式的典型应用？（多选）", options: ["日志收集容器采集主容器日志", "主容器启动前初始化数据库", "envoy 代理容器实现服务治理", "定时执行批处理任务"], answer: [0,2], stars: 2, explain: "Sidecar 是常驻辅助容器（日志、代理）；初始化用 Init 容器；批处理用 Job。" },
      { type: "choice", q: "Sidecar 容器与 Init 容器的主要区别是？", options: ["Sidecar 是一次性的", "Init 容器常驻运行", "Sidecar 常驻运行，Init 一次性", "没有区别"], answer: 2, stars: 2, explain: "Sidecar 常驻与主容器同生命周期；Init 容器一次性，运行完退出。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "K8s 资源配置中 requests 的作用是？", options: ["限制容器最多使用的资源量", "声明容器保证可获得的资源量，作为调度依据", "监控实际资源使用量", "设置扩缩容阈值"], answer: 1, stars: 2, explain: "requests 是调度器分配资源的依据，保证容器至少能获得这么多资源。" },
      { type: "choice", q: "容器内存使用超过 limits 会怎样？", options: ["被限流", "被 OOMKilled", "自动扩容", "无影响"], answer: 1, stars: 2, explain: "内存超过 limits 会触发 OOMKilled；CPU 超过 limits 会被限流（throttled）。" }
    ]},
    { slot: "q6", variants: [
      { type: "judge", q: "readinessProbe 失败时，K8s 会将 Pod 从 Service 端点移除但不杀容器。", answer: true, stars: 2, explain: "readinessProbe 失败只摘除流量，不杀容器；livenessProbe 失败才会杀容器重启。" },
      { type: "choice", q: "哪种探针失败会导致容器被杀掉并重启？", options: ["readinessProbe", "livenessProbe", "startupProbe", "都不会"], answer: 1, stars: 2, explain: "livenessProbe 失败会让 kubelet 杀掉容器并按 restartPolicy 重启。" }
    ]},
    { slot: "q7", variants: [
      { type: "text", q: "控制 Pod 优雅终止超时时间的参数是 ______（默认 30 秒）。", answer: "terminationgraceperiodseconds", stars: 2, explain: "terminationGracePeriodSeconds 控制优雅终止超时，默认 30 秒，超时后 SIGKILL。" },
      { type: "text", q: "Pod 优雅终止时，K8s 首先向容器发送 ______ 信号。", answer: "sigterm", stars: 2, explain: "优雅终止流程先发送 SIGTERM，超时后才发送 SIGKILL。" }
    ]},
    { slot: "q8", variants: [
      { type: "choice", q: "startupProbe 的主要作用是？", options: ["检测容器是否存活", "检测容器是否就绪", "保护慢启动应用不被 liveness 误杀", "检测资源使用"], answer: 2, stars: 2, explain: "startupProbe 成功前会临时禁用 liveness/readiness，防止慢启动应用被误杀。" },
      { type: "judge", q: "preStop 钩子的执行时间不计入 terminationGracePeriodSeconds。", answer: false, stars: 2, explain: "preStop 钩子的执行时间也计入 terminationGracePeriodSeconds，需要合理设置超时。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "Pod 中所有容器都成功退出（退出码 0）且不再重启，状态是？", options: ["Running", "Succeeded", "Failed", "Pending"], answer: 1, stars: 1, explain: "Succeeded 表示所有容器成功退出，常见于 Job 类型任务。" },
      { type: "choice", q: "Pod 中至少有一个容器以非零状态码退出，状态是？", options: ["Succeeded", "Failed", "Unknown", "Terminating"], answer: 1, stars: 1, explain: "Failed 表示所有容器终止且至少一个非零退出或被系统杀死。" }
    ]},
    { slot: "q10", variants: [
      { type: "multi", q: "探针支持的检测方式有哪些？（多选）", options: ["httpGet", "tcpSocket", "exec", "grpc"], answer: [0,1,2,3], stars: 2, explain: "探针支持 httpGet、tcpSocket、exec 三种方式，新版还支持 grpc。" },
      { type: "choice", q: "以下哪个不是 Pod 共享的资源？", options: ["网络命名空间", "存储卷", "进程命名空间（默认）", "IP 地址"], answer: 2, stars: 2, explain: "Pod 默认共享网络和存储，但不共享进程命名空间（需显式开启 shareProcessNamespace）。" }
    ]}
  ],
  "07-deployment": [
    { slot: "q1", variants: [
      { type: "choice", q: "Deployment 管理的底层资源是？", options: ["Pod", "ReplicaSet", "StatefulSet", "DaemonSet"], answer: 1, stars: 1, explain: "Deployment 通过管理 ReplicaSet 来控制 Pod 副本，实现声明式更新。" },
      { type: "choice", q: "Deployment 的主要用途不包括？", options: ["滚动更新", "回滚", "扩缩容", "数据持久化"], answer: 3, stars: 1, explain: "Deployment 负责无状态应用的部署、更新、扩缩容；数据持久化由 Volume/PVC 负责。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "Deployment 滚动更新时，默认的 maxSurge 和 maxUnavailable 各是多少？", options: ["25%, 25%", "50%, 50%", "1, 0", "0, 1"], answer: 0, stars: 2, explain: "默认 maxSurge=25%, maxUnavailable=25%，即最多超出 25% 副本，最多不可用 25%。" },
      { type: "choice", q: "maxUnavailable 的含义是？", options: ["最多可超出的副本数", "滚动更新中最多不可用的副本数/比例", "最大副本数", "最小副本数"], answer: 1, stars: 2, explain: "maxUnavailable 表示滚动更新过程中允许不可用的 Pod 数量或比例。" }
    ]},
    { slot: "q3", variants: [
      { type: "choice", q: "回滚 Deployment 到上一个版本的命令是？", options: ["kubectl rollback deployment <name>", "kubectl rollout undo deployment <name>", "kubectl revert deployment <name>", "kubectl undo <name>"], answer: 1, stars: 1, explain: "kubectl rollout undo deployment <name> 回滚到上一版本；--to-revision=N 指定版本。" },
      { type: "choice", q: "查看 Deployment 滚动更新状态用？", options: ["kubectl rollout status deployment <name>", "kubectl status deployment <name>", "kubectl get deployment <name>", "kubectl describe rollout <name>"], answer: 0, stars: 1, explain: "kubectl rollout status 实时显示滚动更新的进度和结果。" }
    ]},
    { slot: "q4", variants: [
      { type: "judge", q: "Deployment 只适用于无状态应用。", answer: true, stars: 1, explain: "Deployment 假设 Pod 是无状态、可互换的；有状态应用应使用 StatefulSet。" },
      { type: "judge", q: "更新 Deployment 的镜像会触发滚动更新。", answer: true, stars: 1, explain: "修改 Pod 模板（如镜像）会创建新的 ReplicaSet 并滚动替换旧 Pod。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "Deployment 的滚动更新策略可通过哪些参数控制？（多选）", options: ["maxSurge", "maxUnavailable", "minReadySeconds", "replicas"], answer: [0,1,2], stars: 2, explain: "maxSurge、maxUnavailable、minReadySeconds 控制滚动更新策略；replicas 是副本数。" },
      { type: "multi", q: "以下哪些情况会触发 Deployment 创建新 ReplicaSet？（多选）", options: ["修改容器镜像", "修改环境变量", "修改副本数 replicas", "修改资源限制"], answer: [0,1,3], stars: 2, explain: "修改 Pod 模板（镜像、env、resources 等）会创建新 RS；仅改 replicas 不创建新 RS。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "暂停 Deployment 滚动更新的命令是 kubectl rollout ______ deployment <name>。", answer: "pause", stars: 1, explain: "kubectl rollout pause 暂停更新，resume 恢复，方便多次修改后统一更新。" },
      { type: "text", q: "Deployment 的更新策略类型默认是 ______。", answer: "rollingupdate|rolling update", stars: 2, explain: "Deployment 默认 strategy 为 RollingUpdate，另一种是 Recreate（先删后建）。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "Recreate 策略与 RollingUpdate 的区别是？", options: ["Recreate 更快", "Recreate 先删所有旧 Pod 再建新 Pod，期间服务不可用", "Recreate 不能回滚", "没有区别"], answer: 1, stars: 2, explain: "Recreate 先终止所有旧 Pod 再创建新 Pod，会有服务中断；RollingUpdate 逐步替换。" },
      { type: "choice", q: "设置 Deployment 保留的历史版本数量用哪个字段？", options: ["revisionHistoryLimit", "historyLimit", "maxRevisions", "keepRevisions"], answer: 0, stars: 2, explain: "revisionHistoryLimit 控制保留的 ReplicaSet 历史版本数量，默认 10。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "minReadySeconds 可以让新 Pod 就绪后等待一段时间再继续滚动更新。", answer: true, stars: 2, explain: "minReadySeconds 确保新 Pod 就绪并稳定运行指定秒数后才继续替换，避免抖动。" },
      { type: "judge", q: "回滚 Deployment 不会影响当前运行的 Pod。", answer: false, stars: 1, explain: "回滚会创建旧版本 ReplicaSet 并滚动替换当前 Pod，是有影响的。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "以下哪个字段用于声明 Deployment 的副本数？", options: ["count", "replicas", "instances", "scale"], answer: 1, stars: 1, explain: "spec.replicas 声明期望的 Pod 副本数量。" },
      { type: "choice", q: "Deployment 通过什么机制选择它管理的 Pod？", options: ["Pod 名称", "标签选择器 selector", "节点名称", "命名空间"], answer: 1, stars: 1, explain: "Deployment 通过 spec.selector.matchLabels 选择匹配标签的 Pod。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Deployment 的完整滚动更新历史可通过 kubectl rollout ______ 查看。", answer: "history", stars: 1, explain: "kubectl rollout history deployment <name> 查看所有历史版本及变更原因。" },
      { type: "text", q: "调整 Deployment 副本数的命令是 kubectl ______ deployment <name> --replicas=N。", answer: "scale", stars: 1, explain: "kubectl scale deployment <name> --replicas=N 动态调整副本数量。" }
    ]}
  ],
  "08-workload": [
    { slot: "q1", variants: [
      { type: "choice", q: "管理有状态应用（如数据库）最合适的工作负载是？", options: ["Deployment", "StatefulSet", "DaemonSet", "Job"], answer: 1, stars: 1, explain: "StatefulSet 为有状态应用提供稳定的网络标识和持久化存储，适合数据库等。" },
      { type: "choice", q: "StatefulSet 创建的 Pod 名称有什么特点？", options: ["随机生成", "固定且有序，如 web-0、web-1", "与 Deployment 相同", "无名称"], answer: 1, stars: 1, explain: "StatefulSet 的 Pod 名称有序且稳定：<statefulset-name>-<ordinal>，如 web-0、web-1。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "DaemonSet 的作用是？", options: ["运行一次性任务", "确保每个节点运行一个 Pod 副本", "管理有状态应用", "负载均衡"], answer: 1, stars: 1, explain: "DaemonSet 确保每个（匹配的）节点上都运行一个 Pod，常用于日志、监控 agent。" },
      { type: "choice", q: "以下哪种场景不适合用 DaemonSet？", options: ["日志收集 agent", "节点监控 agent", "运行 Web 应用", "网络插件（如 Calico）"], answer: 2, stars: 1, explain: "Web 应用用 Deployment；DaemonSet 适合每个节点都需要运行的守护进程。" }
    ]},
    { slot: "q3", variants: [
      { type: "choice", q: "Job 控制器的主要用途是？", options: ["长期运行服务", "一次性或批处理任务", "每节点运行一个 Pod", "有状态应用"], answer: 1, stars: 1, explain: "Job 管理一次性任务，确保指定数量的 Pod 成功完成后退出。" },
      { type: "choice", q: "CronJob 的作用是？", options: ["一次性任务", "定时执行 Job", "长期运行", "守护进程"], answer: 1, stars: 1, explain: "CronJob 按 Cron 表达式定时创建 Job 执行任务，类似 Linux crontab。" }
    ]},
    { slot: "q4", variants: [
      { type: "judge", q: "StatefulSet 的 Pod 在重启后会保持相同的名称和 DNS 名称。", answer: true, stars: 2, explain: "StatefulSet 提供稳定的网络标识，Pod 重启后名称和 DNS 不变。" },
      { type: "judge", q: "StatefulSet 默认按从大到小的顺序删除 Pod。", answer: true, stars: 2, explain: "StatefulSet 按 ordinal 从大到小有序终止，从小到大有序创建。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "StatefulSet 相比 Deployment 的特有能力包括？（多选）", options: ["稳定的 Pod 名称", "稳定的 DNS 名称", "稳定的持久化存储", "滚动更新"], answer: [0,1,2], stars: 2, explain: "稳定的名称、DNS、存储是 StatefulSet 特有；滚动更新两者都有。" },
      { type: "multi", q: "以下哪些场景适合用 Job？（多选）", options: ["数据迁移", "定时备份", "运行到完成的计算任务", "Web 服务器"], answer: [0,2], stars: 2, explain: "Job 适合一次性运行到完成的任务；定时用 CronJob；Web 服务器用 Deployment。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "StatefulSet 中用于解析 Pod DNS 的 Headless Service 字段 clusterIP 应设为 ______。", answer: "none", stars: 2, explain: "Headless Service 的 clusterIP 设为 None，不分配虚拟 IP，直接返回 Pod IP。" },
      { type: "text", q: "CronJob 使用 ______ 表达式定义调度时间。", answer: "cron", stars: 1, explain: "CronJob 使用标准 Cron 表达式（5 个字段）定义调度时间。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "Job 中 completions 字段的含义是？", options: ["并行度", "需要成功完成的 Pod 总数", "失败重试次数", "超时时间"], answer: 1, stars: 2, explain: "completions 表示 Job 需要成功完成的 Pod 数量；parallelism 是并行度。" },
      { type: "choice", q: "Job 中 parallelism 字段的含义是？", options: ["需要成功完成的 Pod 数", "同时运行的 Pod 数", "失败重试次数", "超时时间"], answer: 1, stars: 2, explain: "parallelism 控制同时并行运行的 Pod 数量。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "DaemonSet 创建的 Pod 在新节点加入集群时会自动调度上去。", answer: true, stars: 2, explain: "DaemonSet 控制器会监视新节点，并在新节点上自动创建对应的 Pod。" },
      { type: "judge", q: "CronJob 每次调度只会创建一个 Pod。", answer: false, stars: 1, explain: "CronJob 创建的是 Job，Job 内部可配置 completions 和 parallelism，可能有多个 Pod。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "StatefulSet 中 volumeClaimTemplates 的作用是？", options: ["定义容器镜像", "为每个 Pod 自动创建独立 PVC", "定义 Service", "设置调度策略"], answer: 1, stars: 2, explain: "volumeClaimTemplates 为每个 Pod 自动创建独立的 PVC，实现稳定持久化存储。" },
      { type: "choice", q: "以下哪个工作负载支持有序部署和扩展？", options: ["Deployment", "DaemonSet", "StatefulSet", "ReplicaSet"], answer: 2, stars: 1, explain: "StatefulSet 支持按 ordinal 有序部署、扩展和收缩。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Job 的 spec.backoffLimit 控制 ______ 次数。", answer: "失败重试", stars: 2, explain: "backoffLimit 控制 Job 失败后的重试次数，默认 6 次。" },
      { type: "text", q: "CronJob 中用于防止并发执行的策略字段是 ______。", answer: "concurrencypolicy", stars: 2, explain: "concurrencyPolicy 可设为 Allow/Forbid/Replace，控制是否允许并发执行。" }
    ]}
  ],
  "09-service": [
    { slot: "q1", variants: [
      { type: "choice", q: "Service 默认的类型是？", options: ["NodePort", "ClusterIP", "LoadBalancer", "ExternalName"], answer: 1, stars: 1, explain: "不指定 type 时，Service 默认为 ClusterIP，仅在集群内部可达。" },
      { type: "choice", q: "Service 通过什么机制选择后端 Pod？", options: ["Pod 名称", "标签选择器 selector", "节点名称", "IP 地址"], answer: 1, stars: 1, explain: "Service 通过 spec.selector 选择匹配标签的 Pod 作为后端。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "ClusterIP 类型的 Service 特点是？", options: ["集群外部可直接访问", "仅集群内部可达，分配虚拟 IP", "每个节点开一个端口", "绑定云厂商负载均衡"], answer: 1, stars: 1, explain: "ClusterIP 分配一个集群内部虚拟 IP，仅供集群内部访问。" },
      { type: "choice", q: "NodePort 类型 Service 的特点是？", options: ["仅集群内部可达", "在每个节点上开放一个端口，外部可通过节点 IP:端口访问", "绑定云 LB", "映射外部域名"], answer: 1, stars: 1, explain: "NodePort 在每个节点上开放 30000-32767 范围的端口，外部可通过 <NodeIP>:<NodePort> 访问。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Service 的 ClusterIP 会随 Pod 重启而变化。", answer: false, stars: 1, explain: "ClusterIP 是稳定的虚拟 IP，与后端 Pod 生命周期无关，Pod 变化不影响 Service。" },
      { type: "judge", q: "Service 可以跨命名空间选择 Pod。", answer: false, stars: 2, explain: "Service 的 selector 只能选择同一命名空间内的 Pod，跨命名空间需用 FQDN。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "LoadBalancer 类型 Service 通常用于？", options: ["内部服务发现", "云环境中自动创建外部负载均衡器", "每节点端口", "映射外部域名"], answer: 1, stars: 1, explain: "LoadBalancer 在云环境中自动创建外部负载均衡器，分配公网 IP。" },
      { type: "choice", q: "ExternalName 类型 Service 的作用是？", options: ["分配虚拟 IP", "返回 CNAME 映射到外部域名", "每节点端口", "集群内部访问"], answer: 1, stars: 2, explain: "ExternalName 将 Service 映射为外部 DNS 名称（CNAME），用于访问集群外服务。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "Service 的类型包括哪些？（多选）", options: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"], answer: [0,1,2,3], stars: 2, explain: "四种标准类型：ClusterIP、NodePort、LoadBalancer、ExternalName。" },
      { type: "multi", q: "关于 kube-proxy 的工作模式，正确的有？（多选）", options: ["iptables 模式", "ipvs 模式", "userspace 模式", "eBPF 模式"], answer: [0,1,2], stars: 2, explain: "kube-proxy 支持 iptables（默认）、ipvs、userspace 三种模式，eBPF 是 Cilium 的方案。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Service 后端实际存储 Pod IP 和端口的资源对象是 ______。", answer: "endpoint|endpoints|endpointslice", stars: 2, explain: "Endpoints（或新版 EndpointSlice）存储 Service 后端的 Pod IP 列表，由 endpoint-controller 维护。" },
      { type: "text", q: "NodePort 默认端口范围是 30000-______。", answer: "32767", stars: 1, explain: "NodePort 默认端口范围是 30000-32767，可通过 apiserver 参数修改。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "Service 的 sessionAffinity 设为 ClientIP 的作用是？", options: ["所有请求轮询", "同一客户端 IP 的请求转发到同一后端 Pod", "禁用负载均衡", "随机转发"], answer: 1, stars: 2, explain: "sessionAffinity: ClientIP 实现会话保持，同客户端 IP 请求落到同一 Pod。" },
      { type: "choice", q: "以下哪个不是 Service 的负载均衡策略？", options: ["轮询（RoundRobin）", "随机", "最少连接", "ipvs 的 rr/lc/sh"], answer: 2, stars: 2, explain: "iptables 模式用随机；ipvs 支持 rr、lc、sh 等算法，但没有独立的最少连接模式选项叫最少连接。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Headless Service（clusterIP: None）不会分配虚拟 IP。", answer: true, stars: 2, explain: "Headless Service 不分配 ClusterIP，DNS 查询直接返回后端 Pod IP 列表。" },
      { type: "judge", q: "Service 只能转发 TCP 和 UDP 流量。", answer: true, stars: 1, explain: "K8s Service 支持 TCP、UDP、SCTP 协议，不直接处理 HTTP（需 Ingress）。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "Service 中 targetPort 的含义是？", options: ["Service 监听的端口", "后端 Pod 上的端口", "节点端口", "负载均衡端口"], answer: 1, stars: 1, explain: "targetPort 是后端 Pod 监听的端口；port 是 Service 暴露的端口；nodePort 是节点端口。" },
      { type: "choice", q: "Service 的 port 字段含义是？", options: ["Service 自身暴露的端口", "后端 Pod 端口", "节点端口", "容器端口"], answer: 0, stars: 1, explain: "port 是 Service 在 ClusterIP 上监听的端口，客户端访问此端口。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "访问集群内 Service 的 DNS 格式通常是 <service>.<namespace>.svc.______。", answer: "cluster.local", stars: 2, explain: "集群内 Service 的 FQDN 为 <service>.<namespace>.svc.cluster.local。" },
      { type: "text", q: "不带 selector 的 Service 通常需要手动维护 ______ 资源。", answer: "endpoints|endpointslice", stars: 2, explain: "无 selector 的 Service 不会自动创建 Endpoints，需手动维护以指向外部服务。" }
    ]}
  ],
  "10-ingress": [
    { slot: "q1", variants: [
      { type: "choice", q: "Ingress 的主要作用是？", options: ["四层负载均衡", "七层 HTTP/HTTPS 路由", "服务发现", "存储管理"], answer: 1, stars: 1, explain: "Ingress 提供七层（HTTP/HTTPS）路由，可按域名和路径转发到不同 Service。" },
      { type: "choice", q: "Ingress 自身是一个什么类型的资源？", options: ["它就是负载均衡器", "路由规则定义，需要 Ingress Controller 实现", "Service 的一种", "Pod 的一种"], answer: 1, stars: 1, explain: "Ingress 只是路由规则定义，需要部署 Ingress Controller（如 Nginx Ingress）才生效。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "以下哪个不是常见的 Ingress Controller？", options: ["Nginx Ingress", "Traefik", "Istio Gateway", "kube-proxy"], answer: 3, stars: 1, explain: "kube-proxy 是 Service 网络代理，不是 Ingress Controller。" },
      { type: "choice", q: "Nginx Ingress Controller 默认通过什么方式暴露到集群外？", options: ["ClusterIP Service", "LoadBalancer 或 NodePort Service", "直接 Pod IP", "HostNetwork"], answer: 1, stars: 2, explain: "Ingress Controller 通常通过 LoadBalancer 或 NodePort Service 对外暴露。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Ingress 可以基于域名（host）进行路由。", answer: true, stars: 1, explain: "Ingress 支持 host 路由，不同域名可指向不同后端 Service。" },
      { type: "judge", q: "Ingress 可以基于 URL 路径进行路由。", answer: true, stars: 1, explain: "Ingress 支持 path 路由，同一域名下不同路径可指向不同 Service。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "Ingress 中配置 TLS 证书需要使用哪种资源？", options: ["ConfigMap", "Secret", "Certificate", "TLSMap"], answer: 1, stars: 1, explain: "Ingress 的 TLS 配置引用 Secret（类型 kubernetes.io/tls）存储证书和私钥。" },
      { type: "choice", q: "Ingress 的 pathType 不支持以下哪个？", options: ["Prefix", "Exact", "ImplementationSpecific", "Regex"], answer: 3, stars: 2, explain: "标准 pathType 有 Prefix、Exact、ImplementationSpecific；Regex 由特定控制器实现。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "Ingress 相比 NodePort 的优势有哪些？（多选）", options: ["支持域名路由", "支持路径路由", "支持 TLS 终止", "可统一入口"], answer: [0,1,2,3], stars: 2, explain: "Ingress 提供统一入口、域名/路径路由、TLS 终止等七层能力，NodePort 只是端口转发。" },
      { type: "multi", q: "Ingress 可实现的功能包括？（多选）", options: ["基于域名的虚拟主机", "基于路径的路由", "TLS/SSL 终止", "四层 TCP 转发"], answer: [0,1,2], stars: 2, explain: "Ingress 主要做七层 HTTP/HTTPS 路由和 TLS；四层 TCP 转发需特定控制器或 Service。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Ingress 路由规则中，匹配路径前缀的 pathType 是 ______。", answer: "prefix", stars: 1, explain: "pathType: Prefix 匹配路径前缀，如 /api 匹配 /api、/api/v1 等。" },
      { type: "text", q: "Ingress 中指定后端服务端口的字段是 service.______。", answer: "port", stars: 1, explain: "backend.service.port.number 指定后端 Service 的端口号。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 Ingress 和 Service 的关系，说法正确的是？", options: ["Ingress 替代 Service", "Ingress 将外部流量路由到 Service，Service 再转发到 Pod", "Ingress 直接转发到 Pod", "两者无关"], answer: 1, stars: 2, explain: "Ingress 接收外部流量，按规则路由到对应 Service，Service 再负载均衡到 Pod。" },
      { type: "choice", q: "pathType 为 Exact 时，路径 /foo 能匹配哪个请求？", options: ["/foo", "/foo/bar", "/foobar", "/"], answer: 0, stars: 2, explain: "Exact 要求精确匹配，只有 /foo 能匹配，/foo/bar 等不行。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "一个集群可以同时部署多个 Ingress Controller。", answer: true, stars: 2, explain: "可通过 ingressClassName 区分多个 Ingress Controller。" },
      { type: "judge", q: "Ingress 可以实现基于 cookie 的会话保持。", answer: true, stars: 2, explain: "通过注解（如 nginx.ingress.kubernetes.io/affinity）可实现会话保持。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "Ingress 资源中用于指定使用哪个 Ingress Controller 的字段是？", options: ["class", "ingressClassName", "controller", "provider"], answer: 1, stars: 2, explain: "ingressClassName 字段指定使用哪个 Ingress Controller 类。" },
      { type: "choice", q: "以下哪个注解常用于 Nginx Ingress 开启 WebSocket 支持？", options: ["nginx.ingress.kubernetes.io/websocket-services", "nginx.ingress.kubernetes.io/enable-websocket", "kubernetes.io/websocket", "ingress.websocket"], answer: 0, stars: 2, explain: "nginx.ingress.kubernetes.io/websocket-services 注解开启 WebSocket 支持。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Ingress 配置 HTTPS 时，spec.tls[].secretName 引用的是 ______ 类型资源。", answer: "secret", stars: 1, explain: "secretName 引用存储 TLS 证书和私钥的 Secret 资源。" },
      { type: "text", q: "Ingress 注解的键通常以 ______ 开头（如 Nginx Ingress）。", answer: "nginx.ingress.kubernetes.io", stars: 2, explain: "Nginx Ingress 的注解以 nginx.ingress.kubernetes.io/ 开头。" }
    ]}
  ],
  "11-volume": [
    { slot: "q1", variants: [
      { type: "choice", q: "K8s Volume 的主要作用是？", options: ["网络隔离", "容器数据持久化与共享", "负载均衡", "资源限制"], answer: 1, stars: 1, explain: "Volume 解决容器数据持久化和 Pod 内容器间数据共享的问题。" },
      { type: "choice", q: "emptyDir 类型 Volume 的特点是？", options: ["永久持久化", "Pod 生命周期内存在，Pod 删除后数据丢失", "跨节点共享", "只能读"], answer: 1, stars: 1, explain: "emptyDir 随 Pod 创建而创建，Pod 删除时数据也被删除，适合临时存储。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "hostPath 类型 Volume 将什么挂载到容器？", options: ["网络存储", "宿主机文件系统上的目录", "内存", "ConfigMap"], answer: 1, stars: 1, explain: "hostPath 将宿主机节点上的目录或文件挂载到 Pod 中。" },
      { type: "judge", q: "hostPath 适合在生产环境大规模使用。", answer: false, stars: 1, explain: "hostPath 绑定到特定节点，Pod 漂移后数据丢失，生产环境应使用 PV/PVC。" }
    ]},
    { slot: "q3", variants: [
      { type: "choice", q: "哪个 Volume 类型使用内存作为存储？", options: ["emptyDir", "hostPath", "configMap", "emptyDir 的 medium: Memory"], answer: 3, stars: 2, explain: "emptyDir 设置 medium: Memory 后使用 tmpfs（内存），速度快但重启丢失。" },
      { type: "choice", q: "ConfigMap 作为 Volume 挂载后，更新 ConfigMap 会怎样？", options: ["立即反映到容器", "kubelet 会定期同步更新挂载内容", "永远不更新", "需要重启 Pod"], answer: 1, stars: 2, explain: "挂载的 ConfigMap 更新后，kubelet 会定期（约 60s）同步更新挂载内容（非子路径挂载）。" }
    ]},
    { slot: "q4", variants: [
      { type: "judge", q: "同一 Pod 内的多个容器可以挂载同一个 Volume 实现数据共享。", answer: true, stars: 1, explain: "Pod 内的 Volume 可被多个容器挂载，实现容器间数据共享。" },
      { type: "judge", q: "emptyDir 的数据在容器重启后会丢失。", answer: false, stars: 2, explain: "emptyDir 生命周期与 Pod 相同，容器重启（非 Pod 删除）数据仍在。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "以下哪些是 K8s 支持的 Volume 类型？（多选）", options: ["emptyDir", "hostPath", "configMap", "secret"], answer: [0,1,2,3], stars: 2, explain: "emptyDir、hostPath、configMap、secret 都是 K8s 支持的 Volume 类型。" },
      { type: "multi", q: "关于 emptyDir，正确的有？（多选）", options: ["Pod 删除时数据丢失", "可用于容器间共享数据", "可设置 medium: Memory 使用内存", "数据跨节点持久化"], answer: [0,1,2], stars: 2, explain: "emptyDir 不跨节点持久化；其他三项正确。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Volume 中使用内存文件系统的配置项是 medium: ______。", answer: "memory", stars: 1, explain: "emptyDir.medium 设为 Memory 时使用 tmpfs 内存文件系统。" },
      { type: "text", q: "将宿主机目录挂载到 Pod 的 Volume 类型是 ______。", answer: "hostpath", stars: 1, explain: "hostPath 将节点上的文件或目录挂载到 Pod 中。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "以下哪种 Volume 类型支持多 Pod 读写共享且持久化？", options: ["emptyDir", "hostPath", "NFS / PersistentVolume", "configMap"], answer: 2, stars: 2, explain: "NFS 或基于 PV 的网络存储支持多 Pod 共享和持久化；emptyDir/hostPath 不满足。" },
      { type: "choice", q: "Secret 作为 Volume 挂载时，数据以什么形式呈现？", options: ["明文文件", "base64 解码后的明文文件", "二进制", "环境变量"], answer: 1, stars: 2, explain: "Secret 挂载为 Volume 时，数据会自动 base64 解码为明文文件呈现。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "一个容器可以同时挂载多个 Volume。", answer: true, stars: 1, explain: "容器可在 volumeMounts 中挂载多个不同的 Volume。" },
      { type: "judge", q: "subPath 允许在同一个 Volume 中挂载不同的子目录给不同容器。", answer: true, stars: 2, explain: "subPath 用于在同一 Volume 中挂载不同子路径，避免互相覆盖。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "downwardAPI Volume 的作用是？", options: ["存储日志", "将 Pod/容器的元数据信息暴露给容器", "挂载 ConfigMap", "挂载 Secret"], answer: 1, stars: 2, explain: "downwardAPI 将 Pod 自身的元数据（如名称、命名空间、资源限制）以文件形式暴露给容器。" },
      { type: "choice", q: "projected Volume 的作用是？", options: ["投影多个 Volume 源到同一个目录", "创建持久化存储", "网络存储", "临时存储"], answer: 0, stars: 2, explain: "projected Volume 可将多个 Volume 源（如 secret、configMap、downwardAPI）投影到同一挂载目录。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Volume 挂载时指定只读的字段是 readOnly: ______。", answer: "true", stars: 1, explain: "volumeMounts.readOnly: true 将卷以只读方式挂载到容器。" },
      { type: "text", q: "K8s 中临时存储（emptyDir）的默认大小受限于 ______。", answer: "节点磁盘空间|节点存储", stars: 2, explain: "emptyDir 默认存储在节点磁盘上，大小受节点存储限制。" }
    ]}
  ],
  "12-pv-pvc": [
    { slot: "q1", variants: [
      { type: "choice", q: "PersistentVolume（PV）的定义是？", options: ["Pod 中的存储卷", "集群中的一块持久化存储资源", "容器内的目录", "网络插件"], answer: 1, stars: 1, explain: "PV 是集群中由管理员 provision 的持久化存储资源，独立于 Pod 生命周期。" },
      { type: "choice", q: "PersistentVolumeClaim（PVC）的作用是？", options: ["直接提供存储", "用户对存储的请求声明", "管理网络", "调度 Pod"], answer: 1, stars: 1, explain: "PVC 是用户对存储的请求（大小、访问模式等），系统会匹配绑定 PV。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "PVC 与 PV 的关系是？", options: ["一对一绑定", "一对多", "多对一", "无关系"], answer: 0, stars: 1, explain: "一个 PVC 绑定一个 PV，绑定后独占使用。" },
      { type: "choice", q: "PV 的访问模式 ReadWriteOnce（RWO）表示？", options: ["多节点读写", "单节点读写", "多节点只读", "单节点只读"], answer: 1, stars: 1, explain: "RWO 表示只能被一个节点以读写模式挂载（同一节点上多 Pod 可共享）。" }
    ]},
    { slot: "q3", variants: [
      { type: "choice", q: "StorageClass 的作用是？", options: ["静态分配存储", "动态按需创建 PV", "管理 Pod", "调度节点"], answer: 1, stars: 1, explain: "StorageClass 定义存储类型和 provisioner，支持 PVC 动态创建 PV。" },
      { type: "choice", q: "PV 的回收策略 Retain 表示？", options: ["删除 PVC 后自动删除 PV", "删除 PVC 后保留 PV 及数据", "删除 PVC 后清空数据但保留 PV", "删除 Pod 后删除 PV"], answer: 1, stars: 2, explain: "Retain 策略下，PVC 删除后 PV 和数据保留，需手动清理。" }
    ]},
    { slot: "q4", variants: [
      { type: "judge", q: "PV 是命名空间级别的资源。", answer: false, stars: 1, explain: "PV 是集群级资源；PVC 是命名空间级别资源。" },
      { type: "judge", q: "PVC 必须指定 storageClassName 才能绑定 PV。", answer: false, stars: 2, explain: "不指定 storageClassName 时会绑定到没有 class 的 PV 或默认 StorageClass。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "PV 的访问模式有哪些？（多选）", options: ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany", "ReadWriteOncePod"], answer: [0,1,2,3], stars: 2, explain: "四种访问模式：RWO、ROX、RWX、RWOP（K8s 1.27+）。" },
      { type: "multi", q: "PV 的回收策略（reclaimPolicy）有哪些？（多选）", options: ["Retain", "Delete", "Recycle", "Archive"], answer: [0,1,2], stars: 2, explain: "回收策略有 Retain、Delete、Recycle（已废弃）。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "PVC 绑定 PV 的过程称为 ______。", answer: "binding|绑定", stars: 1, explain: "PVC 与 PV 通过绑定（binding）关联，匹配后 PVC 即可使用。" },
      { type: "text", q: "允许同时被多个节点以读写模式挂载的访问模式是 ______。", answer: "readwritemany|rwx", stars: 2, explain: "ReadWriteMany（RWX）允许多个节点同时读写挂载。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "PVC 状态为 Pending 可能的原因是？", options: ["已绑定 PV", "没有匹配的 PV 且未配置动态 provisioning", "Pod 已使用", "存储已满"], answer: 1, stars: 2, explain: "Pending 表示没有匹配的 PV，且 StorageClass 动态创建失败或未配置。" },
      { type: "choice", q: "关于动态存储供给，说法正确的是？", options: ["需要管理员预先创建 PV", "用户创建 PVC 时由 StorageClass 自动创建 PV", "不需要 StorageClass", "只能用 hostPath"], answer: 1, stars: 2, explain: "动态供给下，用户创建 PVC 时，provisioner 根据 StorageClass 自动创建 PV。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "一个 PV 可以被多个 PVC 同时绑定。", answer: false, stars: 1, explain: "PV 与 PVC 是一对一绑定，一个 PV 只能绑定一个 PVC。" },
      { type: "judge", q: "PVC 绑定的 PV 在 PVC 删除后会根据 reclaimPolicy 决定是否保留。", answer: true, stars: 1, explain: "reclaimPolicy 决定 PVC 删除后 PV 的处理方式（Retain/Delete/Recycle）。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "以下哪种存储后端通常支持 RWX 模式？", options: ["本地磁盘", "NFS", "块存储 iSCSI", "hostPath"], answer: 1, stars: 2, explain: "NFS 等文件存储支持 RWX；块存储（iSCSI）通常只支持 RWO。" },
      { type: "choice", q: "PV 状态 Released 表示？", options: ["可用", "已绑定 PVC", "PVC 已删除，等待回收处理", "失败"], answer: 2, stars: 2, explain: "Released 表示绑定的 PVC 已删除，PV 等待回收策略处理。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "PVC 中指定存储大小的字段是 resources.requests.______。", answer: "storage", stars: 1, explain: "PVC 通过 resources.requests.storage 请求存储容量。" },
      { type: "text", q: "PV 中指定存储容量的字段是 ______。", answer: "capacity.storage|capacity", stars: 2, explain: "PV 的 capacity.storage 定义存储容量大小。" }
    ]}
  ],
  "13-configmap": [
    { slot: "q1", variants: [
      { type: "choice", q: "ConfigMap 的主要作用是？", options: ["存储敏感信息", "存储非敏感的应用配置数据", "存储镜像", "管理网络"], answer: 1, stars: 1, explain: "ConfigMap 用于存储非敏感的配置数据（键值对），与容器镜像解耦。" },
      { type: "choice", q: "ConfigMap 中的数据以什么形式存储？", options: ["二进制", "键值对", "加密文件", "数据库"], answer: 1, stars: 1, explain: "ConfigMap 以键值对形式存储配置数据，值可以是字符串或多行文本。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "将 ConfigMap 注入容器的方式不包括？", options: ["环境变量", "Volume 挂载", "直接写入镜像", "命令行参数"], answer: 2, stars: 1, explain: "ConfigMap 可通过环境变量、Volume 挂载、命令参数注入；写入镜像不是 ConfigMap 的方式。" },
      { type: "choice", q: "从 ConfigMap 创建环境变量使用哪个字段？", options: ["envFrom", "configMapKeyRef", "两者都可以", "volumeMounts"], answer: 2, stars: 2, explain: "env.configMapKeyRef 注入单个键；envFrom.configMapRef 注入整个 ConfigMap 为环境变量。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "ConfigMap 中存储的数据是加密的。", answer: false, stars: 1, explain: "ConfigMap 以明文存储，敏感信息应使用 Secret。" },
      { type: "judge", q: "ConfigMap 可以挂载为 Volume，且更新后容器内文件会自动更新。", answer: true, stars: 2, explain: "ConfigMap 挂载为 Volume 时，kubelet 会定期同步更新（非 subPath 挂载）。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "ConfigMap 挂载为 Volume 时，每个键对应什么？", options: ["一个目录", "一个文件", "一个环境变量", "一个 Pod"], answer: 1, stars: 1, explain: "ConfigMap 挂载为 Volume 时，每个键对应挂载目录下的一个文件，值为文件内容。" },
      { type: "choice", q: "使用 subPath 挂载 ConfigMap 的单个键时，更新 ConfigMap 会怎样？", options: ["自动更新", "不会自动更新，需重启 Pod", "立即生效", "报错"], answer: 1, stars: 2, explain: "使用 subPath 挂载单个文件时，ConfigMap 更新不会自动反映，需重启 Pod。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "ConfigMap 的使用方式有哪些？（多选）", options: ["环境变量", "Volume 挂载", "命令行参数", "Dockerfile"], answer: [0,1,2], stars: 2, explain: "ConfigMap 可通过环境变量、Volume、命令行参数使用；Dockerfile 不直接用 ConfigMap。" },
      { type: "multi", q: "关于 ConfigMap，正确的有？（多选）", options: ["存储非敏感配置", "可作为 Volume 挂载", "可作为环境变量注入", "数据加密存储"], answer: [0,1,2], stars: 2, explain: "ConfigMap 存非敏感配置，支持 Volume 和环境变量；不加密。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "将整个 ConfigMap 注入为环境变量使用 envFrom 下的 ______ 字段。", answer: "configmapref", stars: 2, explain: "envFrom.configMapRef 将整个 ConfigMap 的键值对注入为环境变量。" },
      { type: "text", q: "ConfigMap 中存储多行配置文件时，值的类型通常是 ______。", answer: "string", stars: 1, explain: "ConfigMap 的值都是字符串类型，多行内容用字符串保存。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "ConfigMap 与 Secret 的主要区别是？", options: ["没有区别", "Secret 存储敏感数据并 base64 编码，ConfigMap 存明文", "ConfigMap 只能存数字", "Secret 不能挂载"], answer: 1, stars: 1, explain: "Secret 用于敏感数据，base64 编码；ConfigMap 存非敏感明文配置。" },
      { type: "choice", q: "创建 ConfigMap 时从文件导入数据用哪个参数？", options: ["--from-file", "--from-literal", "--from-env", "--from-config"], answer: 0, stars: 2, explain: "kubectl create configmap <name> --from-file=<path> 从文件创建 ConfigMap。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "一个 Pod 可以同时引用多个 ConfigMap。", answer: true, stars: 1, explain: "Pod 可在 env 和 volumeMounts 中引用多个 ConfigMap。" },
      { type: "judge", q: "ConfigMap 的键名可以包含大写字母和特殊字符。", answer: false, stars: 2, explain: "ConfigMap 键名需符合 DNS 子域命名规范，不能含大写和特殊字符。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "ConfigMap 以环境变量注入后，更新 ConfigMap 会怎样？", options: ["环境变量立即更新", "环境变量不会自动更新，需重启 Pod", "环境变量报错", "容器崩溃"], answer: 1, stars: 2, explain: "环境变量在容器启动时注入，ConfigMap 更新后环境变量不变，需重启 Pod。" },
      { type: "choice", q: "immutable ConfigMap 的特点是？", options: ["可以随时修改", "创建后不可修改，提升性能和安全性", "自动删除", "只能被一个 Pod 使用"], answer: 1, stars: 2, explain: "immutable: true 的 ConfigMap 创建后不可修改，减少 kubelet 同步开销。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "ConfigMap 挂载为 Volume 时，设置自定义文件名用 items[].______ 字段。", answer: "path", stars: 2, explain: "items[].path 可自定义挂载后的文件名，而非使用键名。" },
      { type: "text", q: "ConfigMap 挂载为 Volume 时设置文件权限的字段是 ______。", answer: "defaultmode", stars: 2, explain: "defaultMode 设置挂载文件的权限位（如 0644）。" }
    ]}
  ],
  "14-secret": [
    { slot: "q1", variants: [
      { type: "choice", q: "Secret 的主要作用是？", options: ["存储普通配置", "存储敏感信息（密码、密钥、token）", "存储镜像", "管理网络"], answer: 1, stars: 1, explain: "Secret 用于存储敏感信息，如密码、OAuth token、SSH 密钥等。" },
      { type: "choice", q: "Secret 中的数据以什么编码存储？", options: ["明文", "base64 编码", "AES 加密", "MD5 哈希"], answer: 1, stars: 1, explain: "Secret 的 data 字段以 base64 编码存储（非加密），挂载时自动解码。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "Secret 最常用的类型是？", options: ["Opaque", "kubernetes.io/tls", "kubernetes.io/dockerconfigjson", "service-account-token"], answer: 0, stars: 1, explain: "Opaque 是默认类型，用于存储任意用户定义的敏感数据。" },
      { type: "choice", q: "kubernetes.io/tls 类型 Secret 用于存储？", options: ["用户名密码", "TLS 证书和私钥", "Docker 镜像仓库凭据", "API token"], answer: 1, stars: 1, explain: "kubernetes.io/tls 用于存储 TLS 证书和私钥，供 Ingress 等使用。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Secret 的数据是加密存储的，任何人都看不到。", answer: false, stars: 1, explain: "Secret 默认是 base64 编码而非加密。etcd 可启用加密，但 base64 可解码。" },
      { type: "judge", q: "Secret 挂载为 Volume 时，数据以明文文件形式呈现。", answer: true, stars: 1, explain: "Secret 挂载为 Volume 时会自动 base64 解码，以明文文件呈现。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "从 Docker Hub 拉取私有镜像，需要创建哪种类型的 Secret？", options: ["Opaque", "kubernetes.io/tls", "kubernetes.io/dockerconfigjson", "basic-auth"], answer: 2, stars: 2, explain: "kubernetes.io/dockerconfigjson 存储 Docker registry 凭据，用于拉取私有镜像。" },
      { type: "choice", q: "Pod 中使用 imagePullSecrets 字段的作用是？", options: ["挂载 Secret 数据", "指定拉取私有镜像所需的凭据 Secret", "设置环境变量", "挂载 Volume"], answer: 1, stars: 2, explain: "imagePullSecrets 指定拉取私有镜像时使用的 docker-registry 类型 Secret。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "Secret 的使用方式有哪些？（多选）", options: ["环境变量", "Volume 挂载", "imagePullSecrets", "直接写入代码"], answer: [0,1,2], stars: 2, explain: "Secret 可作为环境变量、Volume 挂载、imagePullSecrets 使用。" },
      { type: "multi", q: "Secret 的内置类型有哪些？（多选）", options: ["Opaque", "kubernetes.io/tls", "kubernetes.io/dockerconfigjson", "kubernetes.io/basic-auth"], answer: [0,1,2,3], stars: 2, explain: "内置类型包括 Opaque、tls、dockerconfigjson、basic-auth、ssh-auth、service-account-token 等。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Secret 中存储原始（非 base64）数据的字段是 ______。", answer: "stringdata", stars: 2, explain: "stringData 字段允许直接写入明文，K8s 会自动 base64 编码存入 data 字段。" },
      { type: "text", q: "Secret 以环境变量注入时，使用 env.valueFrom.______ 引用。", answer: "secretkeyref", stars: 2, explain: "env.valueFrom.secretKeyRef 引用 Secret 中指定的键作为环境变量。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 Secret 与 ConfigMap，说法正确的是？", options: ["Secret 加密，ConfigMap 不加密", "两者都只是 base64/明文，区别在用途和访问控制", "ConfigMap 更安全", "Secret 可以替代 ConfigMap"], answer: 1, stars: 2, explain: "两者存储机制类似（base64/明文），区别在用途和 RBAC 访问控制；Secret 可被 etcd 加密。" },
      { type: "choice", q: "Secret 默认挂载到容器中的文件权限是？", options: ["0644", "0600", "0666", "0777"], answer: 1, stars: 2, explain: "Secret 挂载文件默认权限是 0600，比 ConfigMap 更严格，防止其他用户读取。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Secret 作为环境变量注入后，更新 Secret 环境变量会自动更新。", answer: false, stars: 2, explain: "环境变量在容器启动时确定，Secret 更新后环境变量不变，需重启 Pod。" },
      { type: "judge", q: "可以通过 etcd 加密配置让 Secret 在存储时加密。", answer: true, stars: 2, explain: "通过 apiserver 的 --encryption-provider-config 可启用 etcd 静态加密保护 Secret。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "basic-auth 类型 Secret 必须包含哪两个键？", options: ["username 和 password", "user 和 pass", "name 和 secret", "id 和 token"], answer: 0, stars: 2, explain: "kubernetes.io/basic-auth 类型必须包含 username 和 password 两个键。" },
      { type: "choice", q: "ssh-auth 类型 Secret 的私钥键名是？", options: ["id_rsa", "ssh-privatekey", "privatekey", "key"], answer: 1, stars: 2, explain: "kubernetes.io/ssh-auth 类型使用 ssh-privatekey 作为私钥键名。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Secret 挂载为 Volume 时设置文件权限的字段是 ______。", answer: "defaultmode", stars: 2, explain: "defaultMode 设置 Secret 挂载文件的权限，默认 0600。" },
      { type: "text", q: "拉取私有镜像时，Pod 通过 spec.______ 字段引用凭据 Secret。", answer: "imagepullsecrets", stars: 2, explain: "spec.imagePullSecrets 引用 dockerconfigjson 类型的 Secret 拉取私有镜像。" }
    ]}
  ],
  "15-rbac": [
    { slot: "q1", variants: [
      { type: "choice", q: "RBAC 的全称是？", options: ["Role-Based Access Control", "Resource-Based Access Control", "Rule-Based Access Control", "Request-Based Access Control"], answer: 0, stars: 1, explain: "RBAC 即 Role-Based Access Control，基于角色的访问控制。" },
      { type: "choice", q: "RBAC 中定义权限规则的资源是？", options: ["Role 和 ClusterRole", "User 和 Group", "Pod 和 Service", "Namespace"], answer: 0, stars: 1, explain: "Role（命名空间级）和 ClusterRole（集群级）定义具体的权限规则。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "将角色绑定到用户的资源是？", options: ["RoleBinding 和 ClusterRoleBinding", "Role 和 ClusterRole", "User 和 Group", "ServiceAccount"], answer: 0, stars: 1, explain: "RoleBinding/ClusterRoleBinding 将 Role/ClusterRole 绑定到主体（用户、组、ServiceAccount）。" },
      { type: "choice", q: "Role 与 ClusterRole 的区别是？", options: ["没有区别", "Role 是命名空间级，ClusterRole 是集群级", "Role 权限更大", "ClusterRole 只能绑 Pod"], answer: 1, stars: 1, explain: "Role 作用于特定命名空间；ClusterRole 作用于整个集群。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "ClusterRole 只能通过 ClusterRoleBinding 绑定。", answer: false, stars: 2, explain: "ClusterRole 可通过 ClusterRoleBinding 绑定（集群级），也可通过 RoleBinding 绑定（特定命名空间）。" },
      { type: "judge", q: "ServiceAccount 是 Pod 访问 K8s API 的身份。", answer: true, stars: 1, explain: "ServiceAccount 为 Pod 内进程提供访问 K8s API 的身份标识。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "Role 规则中 apiGroups 字段的作用是？", options: ["指定 API 版本", "指定资源所属的 API 组", "指定命名空间", "指定用户"], answer: 1, stars: 2, explain: "apiGroups 指定资源所在的 API 组，如 \"\"（核心组）、\"apps\"、\"batch\" 等。" },
      { type: "choice", q: "Role 规则中 verbs 字段不包括？", options: ["get", "list", "watch", "run"], answer: 3, stars: 2, explain: "标准 verbs 有 get、list、watch、create、update、patch、delete、deletecollection，没有 run。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "RBAC 的主体（subjects）可以是？（多选）", options: ["User", "Group", "ServiceAccount", "Pod"], answer: [0,1,2], stars: 2, explain: "RBAC 主体包括 User、Group、ServiceAccount；Pod 不是主体，通过 ServiceAccount 访问。" },
      { type: "multi", q: "以下哪些是 RBAC 资源？（多选）", options: ["Role", "RoleBinding", "ClusterRole", "ClusterRoleBinding"], answer: [0,1,2,3], stars: 2, explain: "四种核心 RBAC 资源：Role、RoleBinding、ClusterRole、ClusterRoleBinding。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Pod 中通过 spec.serviceAccountName 指定使用的 ______。", answer: "serviceaccount", stars: 1, explain: "spec.serviceAccountName 指定 Pod 使用的 ServiceAccount 名称。" },
      { type: "text", q: "授予集群管理员权限的内置 ClusterRole 是 ______。", answer: "cluster-admin", stars: 2, explain: "cluster-admin 是内置的超级管理员 ClusterRole，拥有所有权限。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 RoleBinding，说法正确的是？", options: ["只能绑定 Role", "可以绑定 Role 或 ClusterRole", "集群级资源", "不需要主体"], answer: 1, stars: 2, explain: "RoleBinding 可绑定 Role 或 ClusterRole，作用于当前命名空间。" },
      { type: "choice", q: "以下哪个内置 ClusterRole 拥有只读权限？", options: ["admin", "edit", "view", "cluster-admin"], answer: 2, stars: 2, explain: "view 角色提供大部分资源的只读权限；edit 可读写；admin 管理命名空间。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "默认情况下，新建的 ServiceAccount 没有任何权限。", answer: true, stars: 2, explain: "默认 ServiceAccount 没有权限，需通过 RoleBinding 显式授权。" },
      { type: "judge", q: "RBAC 权限是累加的，多个 Role 绑定的权限会合并。", answer: true, stars: 1, explain: "RBAC 权限是纯累加（allow-only），没有 deny 规则，多个绑定的权限取并集。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "Role 规则中 resources 字段指定的是？", options: ["资源名称", "资源类型（如 pods、services）", "API 版本", "命名空间"], answer: 1, stars: 1, explain: "resources 指定资源类型，如 pods、services、deployments 等。" },
      { type: "choice", q: "限定 Role 只能操作特定资源实例，用哪个字段？", options: ["resourceNames", "names", "labels", "selector"], answer: 0, stars: 2, explain: "resourceNames 限定只能操作指定名称的资源实例。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "检查用户是否有某个权限的命令是 kubectl ______ can-i <verb> <resource>。", answer: "auth", stars: 2, explain: "kubectl auth can-i 检查当前用户（或指定用户）是否有指定权限。" },
      { type: "text", q: "RoleBinding 中绑定主体的列表字段是 ______。", answer: "subjects", stars: 1, explain: "subjects 字段列出要绑定的主体（User/Group/ServiceAccount）。" }
    ]}
  ],
  "16-scheduling": [
    { slot: "q1", variants: [
      { type: "choice", q: "K8s 中负责将 Pod 调度到合适节点的组件是？", options: ["kube-apiserver", "kube-scheduler", "kubelet", "kube-controller-manager"], answer: 1, stars: 1, explain: "kube-scheduler 负责为未调度的 Pod 选择合适的节点。" },
      { type: "choice", q: "指定 Pod 只能运行在特定节点上，最简单的方式是？", options: ["nodeSelector", "affinity", "taint", "toleration"], answer: 0, stars: 1, explain: "nodeSelector 通过标签选择节点，是最简单的节点选择方式。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "nodeAffinity 相比 nodeSelector 的优势是？", options: ["更简单", "支持更灵活的匹配规则（如 In、NotIn、Exists）", "不需要标签", "自动调度"], answer: 1, stars: 2, explain: "nodeAffinity 支持丰富的操作符（In、NotIn、Exists 等），比 nodeSelector 更灵活。" },
      { type: "choice", q: "podAffinity 的作用是？", options: ["让 Pod 调度到特定节点", "让 Pod 与已有的某些 Pod 调度到同一拓扑域", "限制 CPU 使用", "设置污点"], answer: 1, stars: 2, explain: "podAffinity 基于已有 Pod 的标签来决定新 Pod 的调度位置（同节点/同区域等）。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Taint（污点）是打在节点上的，Toleration（容忍）是打在 Pod 上的。", answer: true, stars: 1, explain: "Taint 打在节点上排斥 Pod；Pod 通过 Toleration 来容忍污点并调度上去。" },
      { type: "judge", q: "设置了 nodeSelector 的 Pod 一定会调度到匹配节点。", answer: false, stars: 2, explain: "nodeSelector 是硬性要求，但如果匹配节点资源不足，Pod 仍会处于 Pending。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "Taint 的 effect 不包括以下哪个？", options: ["NoSchedule", "PreferNoSchedule", "NoExecute", "MustSchedule"], answer: 3, stars: 2, explain: "Taint effect 有 NoSchedule、PreferNoSchedule、NoExecute 三种，没有 MustSchedule。" },
      { type: "choice", q: "NoExecute 效果的 Taint 会怎样？", options: ["只影响新 Pod 调度", "不仅排斥新 Pod，还会驱逐已在节点上的不容忍 Pod", "只驱逐，不影响调度", "无影响"], answer: 1, stars: 2, explain: "NoExecute 会驱逐节点上不容忍该污点的已有 Pod，并阻止新 Pod 调度。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "K8s 调度器的调度阶段包括？（多选）", options: ["过滤（Filtering）", "打分（Scoring）", "绑定（Binding）", "执行（Executing）"], answer: [0,1,2], stars: 2, explain: "调度分过滤（排除不合适节点）、打分（对候选节点排序）、绑定（将 Pod 绑定到节点）三步。" },
      { type: "multi", q: "以下哪些是节点亲和性（nodeAffinity）的操作符？（多选）", options: ["In", "NotIn", "Exists", "DoesNotExist"], answer: [0,1,2,3], stars: 2, explain: "nodeAffinity 支持 In、NotIn、Exists、DoesNotExist、Gt、Lt 操作符。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "让 Pod 可以调度到有特定污点节点的配置是 spec.tolerations 下的 ______。", answer: "tolerations", stars: 1, explain: "tolerations 字段声明 Pod 对节点污点的容忍规则。" },
      { type: "text", q: "节点亲和性的 requiredDuringSchedulingIgnoredDuringExecution 表示 ______ 规则。", answer: "硬|必须|required", stars: 2, explain: "required... 是硬性规则，必须满足；preferred... 是软性偏好。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 podAntiAffinity，说法正确的是？", options: ["让 Pod 尽量调度在一起", "让 Pod 尽量不要调度到同一拓扑域（如节点）", "等同于 podAffinity", "等同于 nodeSelector"], answer: 1, stars: 2, explain: "podAntiAffinity 让 Pod 尽量分散到不同拓扑域，提升高可用。" },
      { type: "choice", q: "调度时优先考虑节点资源使用均衡的插件是？", options: ["NodeResourcesFit", "NodeResourcesBalancedAllocation", "ImageLocality", "PodTopologySpread"], answer: 1, stars: 2, explain: "NodeResourcesBalancedAllocation 让资源使用更均衡，避免单节点过载。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "调度器可以同时为多个 Pod 调度（并行）。", answer: true, stars: 2, explain: "kube-scheduler 支持并行调度多个 Pod，提升吞吐。" },
      { type: "judge", q: "Pod 设置了 nodeName 后，调度器仍会参与调度。", answer: false, stars: 2, explain: "nodeName 直接指定节点，跳过调度器的调度流程。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "PodTopologySpreadConstraints 的作用是？", options: ["限制资源使用", "控制 Pod 在拓扑域中的均匀分布", "设置污点", "节点亲和"], answer: 1, stars: 2, explain: "PodTopologySpreadConstraints 控制 Pod 在拓扑域（如节点、区域）中的均匀分布。" },
      { type: "choice", q: "maxSkew 字段的含义是？", options: ["最大副本数", "任意两个拓扑域中 Pod 数量差的最大值", "最小副本数", "调度超时"], answer: 1, stars: 2, explain: "maxSkew 限制拓扑域之间 Pod 数量差异的最大容忍度。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Pod 优先级由 spec.priorityClassName 引用的 ______ 资源定义。", answer: "priorityclass", stars: 2, explain: "PriorityClass 定义优先级数值，priorityClassName 引用它来设置 Pod 优先级。" },
      { type: "text", q: "抢占式调度中，高优先级 Pod 可以 ______ 低优先级 Pod。", answer: "驱逐|抢占|evict|preempt", stars: 2, explain: "高优先级 Pod 在资源不足时可抢占（驱逐）低优先级 Pod。" }
    ]}
  ],
  "17-hpa": [
    { slot: "q1", variants: [
      { type: "choice", q: "HPA 的全称是？", options: ["High Performance Auto", "Horizontal Pod Autoscaler", "Host Process Allocator", "Hybrid Pod Adapter"], answer: 1, stars: 1, explain: "HPA 即 Horizontal Pod Autoscaler，Pod 水平自动扩缩容。" },
      { type: "choice", q: "HPA 的作用是？", options: ["垂直调整 Pod 资源", "根据指标自动调整 Pod 副本数", "调整节点数量", "管理网络"], answer: 1, stars: 1, explain: "HPA 根据 CPU、内存或自定义指标自动增减 Pod 副本数。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "HPA 默认基于什么指标扩缩容？", options: ["内存", "CPU 使用率", "QPS", "网络流量"], answer: 1, stars: 1, explain: "HPA v1 默认基于 CPU 使用率扩缩容。" },
      { type: "choice", q: "HPA 工作需要哪个组件提供指标？", options: ["kube-proxy", "metrics-server", "kubelet", "etcd"], answer: 1, stars: 1, explain: "metrics-server 提供资源指标（CPU/内存），HPA 依赖它获取数据。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "HPA 可以同时控制 Deployment 和 StatefulSet。", answer: true, stars: 2, explain: "HPA 支持 scaleTargetRef 指向 Deployment、StatefulSet、ReplicaSet 等可伸缩资源。" },
      { type: "judge", q: "HPA 设置的 minReplicas 可以为 0。", answer: false, stars: 2, explain: "HPA 的 minReplicas 最小为 1（除非启用了 ScaleToZero 特性），不能为 0。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "VPA（Vertical Pod Autoscaler）的作用是？", options: ["调整 Pod 副本数", "自动调整 Pod 的 CPU/内存 requests 和 limits", "调整节点数量", "管理网络"], answer: 1, stars: 2, explain: "VPA 自动调整容器的资源 requests/limits，而非副本数。" },
      { type: "choice", q: "关于 HPA 与 VPA，说法正确的是？", options: ["两者作用相同", "HPA 调副本数，VPA 调资源配额", "HPA 调资源，VPA 调副本", "两者冲突不能同时用"], answer: 1, stars: 2, explain: "HPA 水平扩缩（副本数），VPA 垂直扩缩（资源配额），通常不建议同时管理同一资源。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "HPA 可以基于哪些指标扩缩容？（多选）", options: ["CPU 使用率", "内存使用率", "自定义指标（如 QPS）", "外部指标"], answer: [0,1,2,3], stars: 2, explain: "HPA 支持资源指标（CPU/内存）、自定义指标和外部指标。" },
      { type: "multi", q: "关于 HPA，正确的有？（多选）", options: ["基于 metrics-server 或 Prometheus Adapter", "有 minReplicas 和 maxReplicas 限制", "可设置扩缩容冷却时间", "能调整节点数量"], answer: [0,1,2], stars: 2, explain: "HPA 调整 Pod 副本数，不调整节点；节点由 Cluster Autoscaler 调整。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "HPA 中设置期望 CPU 使用率百分比的字段是 targetCPUUtilizationPercentage 或 metrics 下的 ______。", answer: "averageutilization", stars: 2, explain: "HPA v2 使用 averageUtilization 指定目标 CPU 使用率百分比。" },
      { type: "text", q: "HPA 扩缩容的冷却/稳定窗口由 behavior.scaleDown.stabilizationWindowSeconds 控制，默认 ______ 秒。", answer: "300", stars: 2, explain: "scaleDown 默认 stabilizationWindowSeconds 为 300 秒，防止频繁缩容。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "查看 HPA 状态的命令是？", options: ["kubectl get hpa", "kubectl list hpa", "kubectl describe autoscaler", "kubectl get autoscaler"], answer: 0, stars: 1, explain: "kubectl get hpa 查看所有 HPA 资源及其当前指标和副本数。" },
      { type: "choice", q: "HPA 无法获取指标，可能的原因不包括？", options: ["未部署 metrics-server", "Pod 未设置 resources.requests", "节点宕机", "指标适配器未配置"], answer: 2, stars: 2, explain: "节点宕机不直接导致 HPA 拿不到指标；缺少 metrics-server、requests 或适配器才是常见原因。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "HPA 扩容是立即执行的，缩容有冷却时间。", answer: true, stars: 2, explain: "HPA 扩容较快，缩容默认有 5 分钟稳定窗口，避免抖动。" },
      { type: "judge", q: "HPA 可以基于多个指标同时决策。", answer: true, stars: 2, explain: "HPA v2 可配置多个指标，取所有指标计算出的期望副本数的最大值。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "Cluster Autoscaler 的作用是？", options: ["调整 Pod 副本数", "调整 Pod 资源", "根据 Pod 调度需求自动增减集群节点数", "管理网络"], answer: 2, stars: 2, explain: "Cluster Autoscaler 根据 Pod 是否能被调度自动增减节点数量。" },
      { type: "choice", q: "自定义指标 HPA 需要依赖什么？", options: ["metrics-server", "Prometheus Adapter 或 custom metrics API", "kubelet", "etcd"], answer: 1, stars: 2, explain: "自定义指标需通过 custom.metrics.k8s.io API，通常由 Prometheus Adapter 提供。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "HPA 中指定伸缩目标资源的字段是 scaleTargetRef 下的 ______。", answer: "kind|name", stars: 1, explain: "scaleTargetRef.kind 和 .name 指定目标资源类型和名称。" },
      { type: "text", q: "HPA 的最小和最大副本数由 minReplicas 和 ______ 控制。", answer: "maxreplicas", stars: 1, explain: "minReplicas 和 maxReplicas 分别控制副本数的上下限。" }
    ]}
  ],
  "18-helm": [
    { slot: "q1", variants: [
      { type: "choice", q: "Helm 的定位是？", options: ["K8s 的包管理工具", "容器运行时", "网络插件", "监控工具"], answer: 0, stars: 1, explain: "Helm 是 Kubernetes 的包管理工具，类似 apt/yum，用于打包、分发和管理 K8s 应用。" },
      { type: "choice", q: "Helm 中打包好的应用称为？", options: ["Image", "Chart", "Template", "Release"], answer: 1, stars: 1, explain: "Chart 是 Helm 的应用打包格式，包含部署应用所需的所有 K8s 资源模板。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "Helm 中部署到集群的一个 Chart 实例称为？", options: ["Chart", "Release", "Template", "Repo"], answer: 1, stars: 1, explain: "Release 是 Chart 在集群中的一次部署实例，一个 Chart 可部署多个 Release。" },
      { type: "choice", q: "Helm Chart 的目录结构中，模板文件放在哪个目录？", options: ["templates/", "charts/", "values/", "manifests/"], answer: 0, stars: 1, explain: "templates/ 目录存放 K8s 资源的 Go 模板文件。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "values.yaml 用于覆盖模板中的默认值。", answer: true, stars: 1, explain: "values.yaml 定义模板变量的默认值，部署时可通过 --values 或 --set 覆盖。" },
      { type: "judge", q: "Chart 可以依赖其他 Chart。", answer: true, stars: 1, explain: "Chart.yaml 中的 dependencies 可声明对其他 Chart 的依赖，类似包依赖。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "安装 Helm Chart 的命令是？", options: ["helm install <release> <chart>", "helm deploy <chart>", "helm run <chart>", "helm create <chart>"], answer: 0, stars: 1, explain: "helm install <release-name> <chart> 安装一个 Chart 并创建 Release。" },
      { type: "choice", q: "升级已部署的 Helm Release 用？", options: ["helm update", "helm upgrade <release> <chart>", "helm install --upgrade", "helm rollout"], answer: 1, stars: 1, explain: "helm upgrade <release> <chart> 升级已存在的 Release。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "Helm 的核心概念包括？（多选）", options: ["Chart", "Release", "Repository", "Template"], answer: [0,1,2,3], stars: 2, explain: "Chart（包）、Release（实例）、Repository（仓库）、Template（模板）都是 Helm 核心概念。" },
      { type: "multi", q: "Helm 模板支持哪些功能？（多选）", options: ["变量替换", "条件判断", "循环", "函数管道"], answer: [0,1,2,3], stars: 2, explain: "Helm 模板基于 Go template，支持变量、条件、循环和丰富的函数管道。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Helm 中定义 Chart 元信息（名称、版本、依赖）的文件是 ______。", answer: "chart.yaml", stars: 1, explain: "Chart.yaml 包含 Chart 的名称、版本、描述、依赖等元信息。" },
      { type: "text", q: "Helm 渲染模板但不实际部署的命令是 helm ______。", answer: "template|lint", stars: 2, explain: "helm template 渲染模板输出 YAML；helm lint 检查 Chart 语法。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "查看 Release 的历史版本用？", options: ["helm history <release>", "helm log <release>", "helm list", "helm status <release>"], answer: 0, stars: 1, explain: "helm history <release> 查看 Release 的所有历史版本。" },
      { type: "choice", q: "回滚 Helm Release 到上一版本用？", options: ["helm rollback <release> 0", "helm undo <release>", "helm revert <release>", "helm back <release>"], answer: 0, stars: 1, explain: "helm rollback <release> <revision> 回滚到指定版本，0 或上一版本号。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Helm 3 移除了 Tiller 组件，直接通过 K8s API 操作。", answer: true, stars: 2, explain: "Helm 3 不再需要 Tiller，直接与 K8s API Server 交互，更安全简单。" },
      { type: "judge", q: "helm uninstall 会删除 Release 的所有历史记录。", answer: true, stars: 2, explain: "helm uninstall 默认删除 Release 及其历史；--keep-history 可保留历史。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "Helm Chart 中 _helpers.tpl 的作用是？", options: ["定义变量默认值", "定义可复用的模板辅助函数", "定义依赖", "定义资源清单"], answer: 1, stars: 2, explain: "_helpers.tpl 定义可复用的模板辅助函数（如 labels、selector），通过 include 引用。" },
      { type: "choice", q: "覆盖 Chart 默认值的方式不包括？", options: ["--set key=value", "-f values.yaml", "修改 Chart 内 values.yaml", "--values"], answer: 2, stars: 2, explain: "安装时通过 --set、-f/--values 覆盖；不应直接修改 Chart 内的 values.yaml。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "列出所有已部署的 Release 用 helm ______。", answer: "list|ls", stars: 1, explain: "helm list 或 helm ls 列出当前命名空间的所有 Release。" },
      { type: "text", q: "Helm 中添加 Chart 仓库的命令是 helm repo ______ <name> <url>。", answer: "add", stars: 1, explain: "helm repo add <name> <url> 添加一个 Chart 仓库。" }
    ]}
  ],
  "19-monitor": [
    { slot: "q1", variants: [
      { type: "choice", q: "K8s 生态中最常用的监控系统是？", options: ["Zabbix", "Prometheus", "Nagios", "ELK"], answer: 1, stars: 1, explain: "Prometheus 是 K8s 生态事实标准的监控系统，采用拉取模型和多维指标。" },
      { type: "choice", q: "Prometheus 的数据模型是？", options: ["日志", "时序指标（metric）", "事件", "追踪"], answer: 1, stars: 1, explain: "Prometheus 以时序指标（metric）为核心，带有标签（label）进行多维描述。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "Prometheus 采集指标的方式是？", options: ["推送（Push）", "拉取（Pull）", "混合", "被动接收"], answer: 1, stars: 1, explain: "Prometheus 默认通过 HTTP 拉取（pull）目标暴露的指标。" },
      { type: "choice", q: "Prometheus 查询语言是？", options: ["SQL", "PromQL", "Lucene", "Gremlin"], answer: 1, stars: 1, explain: "PromQL 是 Prometheus 的查询语言，用于查询和计算时序指标。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Grafana 主要用于数据可视化和仪表盘展示。", answer: true, stars: 1, explain: "Grafana 是开源的数据可视化平台，可接入 Prometheus 等数据源创建仪表盘。" },
      { type: "judge", q: "Prometheus 适合存储长期历史数据。", answer: false, stars: 2, explain: "Prometheus 适合短期监控数据，长期存储需配合 Thanos、Mimir、VictoriaMetrics 等。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "让 Prometheus 自动发现 K8s 中 Pod/Service 指标的组件是？", options: ["ServiceMonitor / PodMonitor", "ConfigMap", "Secret", "Ingress"], answer: 0, stars: 2, explain: "Prometheus Operator 通过 ServiceMonitor/PodMonitor 自动发现监控目标。" },
      { type: "choice", q: "kube-state-metrics 的作用是？", options: ["采集节点资源指标", "暴露 K8s 资源对象（Pod、Deployment 等）的状态指标", "采集容器日志", "告警"], answer: 1, stars: 2, explain: "kube-state-metrics 监听 K8s API，将资源对象状态转换为 Prometheus 指标。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "Prometheus 生态的核心组件包括？（多选）", options: ["Prometheus Server", "Alertmanager", "Grafana", "node_exporter"], answer: [0,1,2,3], stars: 2, explain: "Prometheus Server、Alertmanager、Grafana、各类 exporter 构成监控体系。" },
      { type: "multi", q: "以下哪些是 Prometheus 的指标类型？（多选）", options: ["Counter", "Gauge", "Histogram", "Summary"], answer: [0,1,2,3], stars: 2, explain: "Prometheus 四种核心指标类型：Counter、Gauge、Histogram、Summary。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Prometheus 中只增不减的计数器指标类型是 ______。", answer: "counter", stars: 1, explain: "Counter 是单调递增的计数器，重启后重置，适合累计值。" },
      { type: "text", q: "可增可减、表示瞬时值的指标类型是 ______。", answer: "gauge", stars: 1, explain: "Gauge 表示可增可减的瞬时值，如温度、内存使用量、队列长度。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "Prometheus 告警由哪个组件处理和分发？", options: ["Prometheus Server", "Alertmanager", "Grafana", "node_exporter"], answer: 1, stars: 1, explain: "Alertmanager 接收 Prometheus 的告警，进行分组、抑制、静默和通知分发。" },
      { type: "choice", q: "以下哪个 exporter 用于采集节点级操作系统指标？", options: ["kube-state-metrics", "node_exporter", "blackbox_exporter", "cadvisor"], answer: 1, stars: 2, explain: "node_exporter 采集节点的 CPU、内存、磁盘、网络等操作系统指标。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Prometheus 支持通过 Pushgateway 让短命任务推送指标。", answer: true, stars: 2, explain: "Pushgateway 允许短期任务将指标推送到中间网关，Prometheus 再从网关拉取。" },
      { type: "judge", q: "Histogram 类型指标可以计算分位数（如 P99）。", answer: true, stars: 2, explain: "Histogram 将观测值分桶存储，可计算分位数（如 P95、P99）。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "Prometheus Operator 的主要优势是？", options: ["更快", "用 K8s CRD 声明式管理 Prometheus、Alertmanager 和监控目标", "不需要配置", "自动告警"], answer: 1, stars: 2, explain: "Prometheus Operator 通过 CRD（Prometheus、ServiceMonitor 等）声明式管理监控栈。" },
      { type: "choice", q: "采集容器资源使用率（CPU/内存）的组件是？", options: ["node_exporter", "cAdvisor（集成在 kubelet 中）", "blackbox_exporter", "snmp_exporter"], answer: 1, stars: 2, explain: "cAdvisor 集成在 kubelet 中，采集容器的 CPU、内存等资源使用指标。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Prometheus 中用于探测 HTTP/TCP 端点可用性的 exporter 是 ______。", answer: "blackbox_exporter", stars: 2, explain: "blackbox_exporter 通过 HTTP、HTTPS、DNS、TCP、ICMP 等探测端点可用性。" },
      { type: "text", q: "Prometheus 配置告警规则后，告警发送到 ______ 组件进行处理。", answer: "alertmanager", stars: 1, explain: "Prometheus 触发告警后发送给 Alertmanager，由其分组、抑制和通知。" }
    ]}
  ],
  "20-troubleshoot": [
    { slot: "q1", variants: [
      { type: "choice", q: "Pod 一直处于 Pending 状态，最可能的原因是？", options: ["镜像拉取失败", "调度器找不到合适节点（资源不足/污点/亲和性）", "容器崩溃", "网络故障"], answer: 1, stars: 1, explain: "Pending 表示 Pod 未被调度，通常是资源不足、节点污点、亲和性不满足等原因。" },
      { type: "choice", q: "Pod 处于 CrashLoopBackOff 意味着？", options: ["调度失败", "容器反复启动后崩溃退出", "镜像拉取中", "网络不通"], answer: 1, stars: 1, explain: "CrashLoopBackOff 表示容器启动后崩溃，kubelet 反复重启且退避等待。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "排查 Pod 调度失败问题，应使用哪个命令？", options: ["kubectl logs <pod>", "kubectl describe pod <pod>", "kubectl exec <pod>", "kubectl top pod"], answer: 1, stars: 1, explain: "kubectl describe pod 查看 Pod 事件（Events），可看到调度失败的具体原因。" },
      { type: "choice", q: "排查容器崩溃，应首先查看？", options: ["Pod 事件", "容器日志（kubectl logs）", "节点状态", "网络策略"], answer: 1, stars: 1, explain: "容器崩溃先看 kubectl logs 了解应用报错，再看 events 辅助判断。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "ImagePullBackOff 表示镜像拉取失败。", answer: true, stars: 1, explain: "ImagePullBackOff 表示镜像拉取失败，kubelet 在退避重试，常见于镜像名错误或凭据缺失。" },
      { type: "judge", q: "Pod 状态为 Error 一定是应用代码错误。", answer: false, stars: 2, explain: "Error 可能是配置错误、命令不存在、权限问题等，不一定是应用代码问题。" }
    ]},
    { slot: "q4", variants: [
      { type: "choice", q: "Service 无法访问后端 Pod，首先检查？", options: ["Service 的 selector 是否匹配 Pod 标签", "节点磁盘", "镜像版本", "API Server"], answer: 0, stars: 2, explain: "Service 通过 selector 匹配 Pod，先确认 selector 与 Pod 标签一致，Endpoints 是否有后端。" },
      { type: "choice", q: "查看 Service 的后端 Pod 列表，用？", options: ["kubectl get endpoints <service>", "kubectl describe service <service>", "kubectl get pods", "kubectl get svc -o yaml"], answer: 0, stars: 2, explain: "kubectl get endpoints <service> 查看 Service 对应的后端 Pod IP 列表。" }
    ]},
    { slot: "q5", variants: [
      { type: "multi", q: "Pod 排障常用命令有哪些？（多选）", options: ["kubectl describe pod", "kubectl logs", "kubectl exec", "kubectl get events"], answer: [0,1,2,3], stars: 2, explain: "describe 看事件、logs 看日志、exec 进容器、get events 看集群事件都是排障常用命令。" },
      { type: "multi", q: "Pod 一直 Pending 的可能原因有？（多选）", options: ["节点资源不足", "存在无法容忍的污点", "PVC 未绑定", "镜像不存在"], answer: [0,1,2], stars: 2, explain: "Pending 是调度问题，资源不足、污点、PVC 未绑定都可能；镜像不存在是 ImagePullBackOff。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "查看前一个崩溃容器的日志用 kubectl logs <pod> ______。", answer: "--previous|-p", stars: 2, explain: "--previous（-p）查看上一个（已崩溃）容器的日志。" },
      { type: "text", q: "实时查看集群所有事件用 kubectl get events ______。", answer: "--watch|-w|-A", stars: 2, explain: "kubectl get events -A -w 实时查看所有命名空间的事件。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "节点 NotReady 状态可能的原因不包括？", options: ["kubelet 停止", "网络分区", "节点宕机", "Pod 数量过多"], answer: 3, stars: 2, explain: "NotReady 通常是 kubelet 故障、网络问题、节点宕机；Pod 数量多不会直接导致 NotReady。" },
      { type: "choice", q: "Pod 内无法访问其他 Service，最不可能的原因是？", options: ["NetworkPolicy 阻止", "kube-proxy 异常", "CoreDNS 异常", "容器资源限制过高"], answer: 3, stars: 2, explain: "网络访问问题通常是 NetworkPolicy、kube-proxy、DNS；资源限制高不影响网络。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "kubectl exec 进入容器需要容器内有 shell（如 sh/bash）。", answer: true, stars: 1, explain: "kubectl exec 需要容器内存在可执行命令，精简镜像可能没有 shell。" },
      { type: "judge", q: "OOMKilled 表示容器因内存超出 limits 被杀死。", answer: true, stars: 1, explain: "OOMKilled 是容器内存使用超过 limits 被系统 OOM Killer 终止。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "Pod DNS 解析失败，应首先检查？", options: ["CoreDNS Pod 是否正常运行", "节点磁盘", "镜像版本", "RBAC 权限"], answer: 0, stars: 2, explain: "DNS 解析失败先检查 CoreDNS（或 kube-dns）Pod 状态和日志。" },
      { type: "choice", q: "排查集群级问题，查看节点状态用？", options: ["kubectl get nodes", "kubectl get pods -A", "kubectl cluster-info", "kubectl top nodes"], answer: 0, stars: 1, explain: "kubectl get nodes 查看所有节点状态（Ready/NotReady）。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "查看 Pod 中所有容器的日志用 kubectl logs <pod> ______。", answer: "--all-containers", stars: 2, explain: "--all-containers 输出 Pod 中所有容器的日志。" },
      { type: "text", q: "Pod 状态中表示容器启动失败但会重试的状态是 ______。", answer: "crashloopbackoff", stars: 1, explain: "CrashLoopBackOff 表示容器反复崩溃，kubelet 以指数退避方式重启。" }
    ]}
  ]
};
