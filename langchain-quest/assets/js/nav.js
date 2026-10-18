/* ============================================================
   LangChain Quest - 章节配置与导航
   ============================================================ */

window.QUEST_CONFIG = {
  siteName: "LangChain Quest",
  chapters: [
    { id: "01-intro", file: "chapters/01-intro.html", title: "LangChain 是什么", group: "基础入门", desc: "LLM 应用开发框架的核心价值与应用场景", stars: 12, questions: 10, difficulty: "easy" },
    { id: "02-setup", file: "chapters/02-setup.html", title: "环境搭建与首个调用", group: "基础入门", desc: "Python 环境、安装依赖、第一次调用 LLM", stars: 12, questions: 10, difficulty: "easy" },
    { id: "03-llm-basics", file: "chapters/03-llm-basics.html", title: "LLM 基础概念", group: "基础入门", desc: "模型、Token、Temperature、Prompt 原理", stars: 14, questions: 10, difficulty: "easy" },
    { id: "04-prompt", file: "chapters/04-prompt.html", title: "Prompt 工程", group: "基础入门", desc: "PromptTemplate、FewShot、OutputParser", stars: 14, questions: 10, difficulty: "easy" },
    { id: "05-chain", file: "chapters/05-chain.html", title: "Chain 链式调用", group: "核心组件", desc: "LLMChain、SequentialChain、RouterChain", stars: 15, questions: 10, difficulty: "medium" },
    { id: "06-memory", file: "chapters/06-memory.html", title: "记忆系统 Memory", group: "核心组件", desc: "对话记忆、摘要记忆、实体记忆", stars: 15, questions: 10, difficulty: "medium" },
    { id: "07-data", file: "chapters/07-data.html", title: "数据连接", group: "核心组件", desc: "Document Loaders 与 Text Splitters", stars: 14, questions: 10, difficulty: "medium" },
    { id: "08-embeddings", file: "chapters/08-embeddings.html", title: "向量数据库与 Embeddings", group: "核心组件", desc: "向量存储、相似度搜索、Embedding 模型", stars: 15, questions: 10, difficulty: "medium" },
    { id: "09-rag", file: "chapters/09-rag.html", title: "RAG 检索增强生成", group: "RAG 实战", desc: "从文档到问答的完整 RAG 流程", stars: 16, questions: 10, difficulty: "medium" },
    { id: "10-retriever", file: "chapters/10-retriever.html", title: "检索器 Retriever", group: "RAG 实战", desc: "检索策略、重排序、多查询检索", stars: 16, questions: 10, difficulty: "hard" },
    { id: "11-agent", file: "chapters/11-agent.html", title: "Agent 智能体", group: "智能体", desc: "ReAct、Tool、AgentExecutor", stars: 16, questions: 10, difficulty: "hard" },
    { id: "12-tools", file: "chapters/12-tools.html", title: "工具与函数调用", group: "智能体", desc: "Tool、StructuredTool、Function Calling", stars: 16, questions: 10, difficulty: "hard" },
    { id: "13-lcel", file: "chapters/13-lcel.html", title: "LCEL 表达式语言", group: "高级特性", desc: "链式组合、Runnable 接口、流式处理", stars: 16, questions: 10, difficulty: "hard" },
    { id: "14-multimodal", file: "chapters/14-multimodal.html", title: "多模态与流式输出", group: "高级特性", desc: "图像理解、音频、Streaming", stars: 16, questions: 10, difficulty: "medium" },
    { id: "15-chatbot", file: "chapters/15-chatbot.html", title: "对话系统构建", group: "高级特性", desc: "Chatbot、多轮对话、上下文管理", stars: 16, questions: 10, difficulty: "medium" },
    { id: "16-eval", file: "chapters/16-eval.html", title: "评估与监控", group: "工程化", desc: "LangSmith、评估指标、可观测性", stars: 16, questions: 10, difficulty: "hard" },
    { id: "17-production", file: "chapters/17-production.html", title: "生产部署", group: "工程化", desc: "异步、并发、缓存、限流、部署", stars: 18, questions: 10, difficulty: "hard" },
    { id: "18-project-cs", file: "chapters/18-project-cs.html", title: "实战：智能客服", group: "项目实战", desc: "从零构建客服机器人", stars: 18, questions: 10, difficulty: "hard" },
    { id: "19-project-kb", file: "chapters/19-project-kb.html", title: "实战：企业知识库", group: "项目实战", desc: "企业级知识库问答系统", stars: 18, questions: 10, difficulty: "hard" },
    { id: "20-interview", file: "chapters/20-interview.html", title: "面试与就业准备", group: "项目实战", desc: "常见面试题、简历要点、求职策略", stars: 20, questions: 10, difficulty: "hard" },
  ],
};

// 各章题目数量（用于判定章节完成）
window.QUESTION_COUNTS = {};
window.QUEST_CONFIG.chapters.forEach(c => { window.QUESTION_COUNTS[c.id] = c.questions; });

function getCurrentChapterId() {
  return document.body.getAttribute("data-chapter") || "";
}

function getPathPrefix() {
  // 只有章节页位于 chapters/ 子目录，需回退一级；
  // 首页/排行榜/我的 与 index.html 同级（都在 /langchain-learning/ 下），无需回退。
  return document.body.getAttribute("data-page") === "chapter" ? "../" : "";
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
  const isMobile = window.innerWidth <= 640;
  const linkHtml = links.map(l => {
    const icon = l.id === 'home' ? '🏠' : l.id === 'leaderboard' ? '🏆' : '👤';
    const label = isMobile ? '' : `<span class="nav-link-text">${l.label}</span>`;
    return `<a href="${l.href}" class="nav-link ${page === l.id ? "active" : ""}" title="${l.label}">${icon}${label}</a>`;
  }).join("");

  nav.innerHTML = `
    <span class="star-display">⭐ <span id="star-count">0</span></span>
    <span id="nav-title" style="font-size:0.85rem;color:var(--color-text-light);display:none;"></span>
    <span id="nav-auth"></span>
    ${linkHtml}
  `;
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
