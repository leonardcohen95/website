/* ============================================================
   导航配置 - 单一数据源
   驱动：侧边目录、顶部导航、翻页、当前页高亮
   ============================================================ */
window.SITE_CONFIG = {
  siteName: "AI Agent 搭建教程",
  chapters: [
    {
      id: "01-intro",
      file: "chapters/01-intro.html",
      title: "认识 AI Agent",
      group: "基础概念",
      desc: "什么是 Agent？和普通聊天机器人有什么区别？",
    },
    {
      id: "02-setup",
      file: "chapters/02-setup.html",
      title: "环境准备",
      group: "基础概念",
      desc: "安装 Python、获取 API Key、配置开发环境",
    },
    {
      id: "03-first-agent",
      file: "chapters/03-first-agent.html",
      title: "第一个 Agent",
      group: "核心能力",
      desc: "用 20 行代码让大模型回答你的问题",
    },
    {
      id: "04-memory",
      file: "chapters/04-memory.html",
      title: "给 Agent 加记忆",
      group: "核心能力",
      desc: "理解上下文窗口，实现多轮对话",
    },
    {
      id: "05-tools",
      file: "chapters/05-tools.html",
      title: "让 Agent 会用工具",
      group: "核心能力",
      desc: "Function Calling 让 Agent 能查天气、做计算",
    },
    {
      id: "06-planning",
      file: "chapters/06-planning.html",
      title: "规划与反思",
      group: "进阶",
      desc: "ReAct 模式：让 Agent 先思考再行动",
    },
    {
      id: "07-multi-agent",
      file: "chapters/07-multi-agent.html",
      title: "多 Agent 协作",
      group: "进阶",
      desc: "多个 Agent 分工合作完成复杂任务",
    },
    {
      id: "08-deploy",
      file: "chapters/08-deploy.html",
      title: "部署与总结",
      group: "进阶",
      desc: "把 Agent 放到公网，并回顾学习路线",
    },
  ],
};

/* 当前页面标识（每个页面会在 <body> 上设置 data-page）*/
function getCurrentPageId() {
  return document.body.getAttribute("data-page") || "home";
}

/* 路径前缀：首页在根目录用 ""，章节页在 chapters/ 下用 "../" */
function getPathPrefix() {
  return getCurrentPageId() === "home" ? "" : "../";
}

/* 渲染顶部导航 */
function renderTopNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  const current = getCurrentPageId();
  const prefix = getPathPrefix();
  const links = [
    { href: prefix + "index.html", label: "首页", id: "home" },
    ...window.SITE_CONFIG.chapters.map((c) => ({
      href: prefix + c.file,
      label: c.title,
      id: c.id,
    })),
  ];
  nav.innerHTML =
    "<ul>" +
    links
      .map(
        (l) =>
          `<li><a href="${l.href}" class="${
            l.id === current ? "active" : ""
          }">${l.label}</a></li>`
      )
      .join("") +
    "</ul>";
}

/* 渲染侧边目录 */
function renderSidebar() {
  const sidebar = document.getElementById("sidebar-list");
  if (!sidebar) return;
  const current = getCurrentPageId();
  const prefix = getPathPrefix();
  const chapters = window.SITE_CONFIG.chapters;
  sidebar.innerHTML = chapters
    .map((c, i) => {
      const active = c.id === current ? "active" : "";
      return `<li><a href="${prefix}${c.file}" class="${active}">
        <span class="chapter-num">${i + 1}</span>${c.title}
      </a></li>`;
    })
    .join("");
}

/* 渲染翻页导航 */
function renderPageNav() {
  const container = document.getElementById("page-nav");
  if (!container) return;
  const current = getCurrentPageId();
  const prefix = getPathPrefix();
  const chapters = window.SITE_CONFIG.chapters;
  const idx = chapters.findIndex((c) => c.id === current);
  if (idx === -1) return;

  let html = "";
  if (idx > 0) {
    const prev = chapters[idx - 1];
    html += `<a href="${prefix}${prev.file}" class="prev">
      <span class="label">上一章</span>
      <span class="title">${prev.title}</span>
    </a>`;
  }
  if (idx < chapters.length - 1) {
    const next = chapters[idx + 1];
    html += `<a href="${prefix}${next.file}" class="next">
      <span class="label">下一章</span>
      <span class="title">${next.title}</span>
    </a>`;
  }
  container.innerHTML = html;
}

/* 移动端菜单切换 */
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  // 点击链接后关闭菜单
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });
}

/* 页面加载完成后初始化 */
document.addEventListener("DOMContentLoaded", () => {
  renderTopNav();
  renderSidebar();
  renderPageNav();
  initMobileNav();
});
