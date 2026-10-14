/* ============================================================
   K8s Quest - 章节配置与导航
   ============================================================ */

window.QUEST_CONFIG = {
  siteName: "K8s Quest",
  chapters: [
    { id: "01-intro", file: "chapters/01-intro.html", title: "什么是 Kubernetes", group: "基础概念", desc: "容器编排的由来与核心价值", stars: 5, questions: 5, difficulty: "easy" },
    { id: "02-arch", file: "chapters/02-arch.html", title: "K8s 架构总览", group: "基础概念", desc: "Master 与 Node、控制平面与数据平面", stars: 5, questions: 5, difficulty: "easy" },
    { id: "03-core", file: "chapters/03-core.html", title: "核心概念速览", group: "基础概念", desc: "Pod、Deployment、Service 是什么", stars: 5, questions: 6, difficulty: "easy" },
    { id: "04-kubectl", file: "chapters/04-kubectl.html", title: "kubectl 入门", group: "基础概念", desc: "常用命令与资源管理", stars: 5, questions: 6, difficulty: "easy" },
    { id: "05-setup", file: "chapters/05-setup.html", title: "搭建本地集群", group: "实战入门", desc: "用 minikube 搭建你的第一个集群", stars: 10, questions: 6, difficulty: "medium" },
    { id: "06-pod", file: "chapters/06-pod.html", title: "Pod 详解", group: "工作负载", desc: "生命周期、容器设计模式", stars: 10, questions: 7, difficulty: "medium" },
    { id: "07-deployment", file: "chapters/07-deployment.html", title: "Deployment 部署", group: "工作负载", desc: "滚动更新与回滚", stars: 10, questions: 7, difficulty: "medium" },
    { id: "08-workload", file: "chapters/08-workload.html", title: "其他工作负载", group: "工作负载", desc: "StatefulSet、DaemonSet、Job", stars: 10, questions: 7, difficulty: "medium" },
    { id: "09-service", file: "chapters/09-service.html", title: "Service 服务发现", group: "网络", desc: "ClusterIP、NodePort、LoadBalancer", stars: 10, questions: 7, difficulty: "medium" },
    { id: "10-ingress", file: "chapters/10-ingress.html", title: "Ingress 路由", group: "网络", desc: "七层路由与 TLS", stars: 10, questions: 7, difficulty: "medium" },
    { id: "11-volume", file: "chapters/11-volume.html", title: "Volume 数据卷", group: "存储", desc: "容器数据持久化入门", stars: 10, questions: 6, difficulty: "medium" },
    { id: "12-pv-pvc", file: "chapters/12-pv-pvc.html", title: "PV 与 PVC", group: "存储", desc: "持久化存储体系", stars: 10, questions: 7, difficulty: "medium" },
    { id: "13-configmap", file: "chapters/13-configmap.html", title: "ConfigMap 配置", group: "配置", desc: "应用配置管理", stars: 10, questions: 6, difficulty: "easy" },
    { id: "14-secret", file: "chapters/14-secret.html", title: "Secret 密钥", group: "配置", desc: "敏感信息管理", stars: 10, questions: 6, difficulty: "medium" },
    { id: "15-rbac", file: "chapters/15-rbac.html", title: "RBAC 权限", group: "安全", desc: "角色与权限控制", stars: 15, questions: 8, difficulty: "hard" },
    { id: "16-scheduling", file: "chapters/16-scheduling.html", title: "调度与亲和性", group: "高级", desc: "节点选择与调度策略", stars: 15, questions: 8, difficulty: "hard" },
    { id: "17-hpa", file: "chapters/17-hpa.html", title: "自动扩缩容", group: "高级", desc: "HPA 与 VPA", stars: 15, questions: 7, difficulty: "hard" },
    { id: "18-helm", file: "chapters/18-helm.html", title: "Helm 包管理", group: "高级", desc: "Chart 与模板", stars: 15, questions: 8, difficulty: "hard" },
    { id: "19-monitor", file: "chapters/19-monitor.html", title: "监控体系", group: "运维", desc: "Prometheus 与 Grafana", stars: 15, questions: 8, difficulty: "hard" },
    { id: "20-troubleshoot", file: "chapters/20-troubleshoot.html", title: "故障排查实战", group: "运维", desc: "常见问题定位思路", stars: 20, questions: 10, difficulty: "hard" },
  ],
};

// 各章题目数量（用于判定章节完成）
window.QUESTION_COUNTS = {};
window.QUEST_CONFIG.chapters.forEach(c => { window.QUESTION_COUNTS[c.id] = c.questions; });

function getCurrentChapterId() {
  return document.body.getAttribute("data-chapter") || "";
}

function getPathPrefix() {
  return document.body.getAttribute("data-page") === "home" ? "" : "../";
}

// 渲染顶部导航
function renderTopNav() {
  const nav = document.getElementById("top-nav-right");
  if (!nav) return;
  const prefix = getPathPrefix();
  const page = document.body.getAttribute("data-page");
  const links = [
    { href: prefix + "index.html", label: "首页", id: "home" },
    { href: prefix + "leaderboard.html", label: "排行榜", id: "leaderboard" },
    { href: prefix + "profile.html", label: "我的", id: "profile" },
  ];
  nav.innerHTML = links.map(l =>
    `<a href="${l.href}" class="nav-link ${page === l.id ? "active" : ""}">${l.label}</a>`
  ).join("");
}

// 渲染侧边章节目录
function renderSidebar() {
  const sidebar = document.getElementById("sidebar-list");
  if (!sidebar) return;
  const prefix = getPathPrefix();
  const current = getCurrentChapterId();
  const chapters = window.QUEST_CONFIG.chapters;
  sidebar.innerHTML = chapters.map((c, i) => {
    const done = GameSystem.isChapterCompleted(c.id);
    const active = c.id === current ? "active" : "";
    return `<li><a href="${prefix}${c.file}" class="${active} ${done ? "done" : ""}">
      <span class="ch-num">${i + 1}</span>${c.title}
    </a></li>`;
  }).join("");
}

// 渲染翻页
function renderPageNav() {
  const container = document.getElementById("page-nav");
  if (!container) return;
  const current = getCurrentChapterId();
  const prefix = getPathPrefix();
  const chapters = window.QUEST_CONFIG.chapters;
  const idx = chapters.findIndex(c => c.id === current);
  if (idx === -1) return;
  let html = "";
  if (idx > 0) {
    const prev = chapters[idx - 1];
    html += `<a href="${prefix}${prev.file}" class="prev"><span class="label">上一章</span><span class="title">${prev.title}</span></a>`;
  }
  if (idx < chapters.length - 1) {
    const next = chapters[idx + 1];
    html += `<a href="${prefix}${next.file}" class="next"><span class="label">下一章</span><span class="title">${next.title}</span></a>`;
  }
  container.innerHTML = html;
}

// 渲染章节元信息
function renderChapterMeta() {
  const meta = document.getElementById("chapter-meta");
  if (!meta) return;
  const current = getCurrentChapterId();
  const ch = window.QUEST_CONFIG.chapters.find(c => c.id === current);
  if (!ch) return;
  const done = GameSystem.isChapterCompleted(current);
  const myStars = GameSystem.getChapterStars(current);
  meta.innerHTML = `
    <span class="meta-tag">第 ${parseInt(current)} 章</span>
    <span class="meta-tag">${ch.group}</span>
    <span class="meta-tag difficulty ${ch.difficulty}">${ch.difficulty === "easy" ? "简单" : ch.difficulty === "medium" ? "中等" : "困难"}</span>
    <span class="meta-tag">可获 ⭐ ${ch.stars}</span>
    ${done ? '<span class="meta-tag" style="background:#dcfce7;color:#15803d;">✓ 已通关</span>' : ""}
    ${myStars > 0 ? `<span class="meta-tag" style="background:#fef3c7;color:#92400e;">已得 ⭐ ${myStars}</span>` : ""}
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderTopNav();
  renderSidebar();
  renderPageNav();
  renderChapterMeta();
});
