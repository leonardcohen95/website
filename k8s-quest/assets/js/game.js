/* ============================================================
   K8s Quest - 游戏化核心系统
   星星、头衔、进度、排行榜
   ============================================================ */

const GameSystem = (function () {
  const STORAGE_KEY = "k8s-quest-progress";

  // 头衔定义
  const TITLES = [
    { id: "newbie", name: "K8s 新手", emoji: "🌱", stars: 0, desc: "刚踏上 K8s 之旅" },
    { id: "container-apprentice", name: "容器学徒", emoji: "📦", stars: 10, desc: "初识容器世界" },
    { id: "pod-driver", name: "Pod 驾驶员", emoji: "🚢", stars: 30, desc: "能驾驶 Pod 航行" },
    { id: "deploy-engineer", name: "部署工程师", emoji: "⚙️", stars: 60, desc: "掌握滚动部署" },
    { id: "network-engineer", name: "网络工程师", emoji: "🌐", stars: 100, desc: "精通服务发现" },
    { id: "storage-admin", name: "存储管理员", emoji: "💾", stars: 150, desc: "驾驭数据持久化" },
    { id: "security-guard", name: "安全卫士", emoji: "🔐", stars: 200, desc: "守护集群安全" },
    { id: "scheduler-master", name: "调度大师", emoji: "🎛️", stars: 260, desc: "掌控资源调度" },
    { id: "helm-expert", name: "包管理专家", emoji: "📦", stars: 330, desc: "Helm 大魔法师" },
    { id: "architect", name: "K8s 架构师", emoji: "👑", stars: 400, desc: "征服 K8s 全境" },
  ];

  // 默认进度
  function defaultProgress() {
    return {
      stars: 0,
      chapters: {}, // { chapterId: { completed: true, stars: 5, questions: {q1: true} } }
      userName: "学员" + Math.floor(Math.random() * 9000 + 1000),
    };
  }

  function load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return defaultProgress();
      return { ...defaultProgress(), ...JSON.parse(data) };
    } catch (e) {
      return defaultProgress();
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getCurrentTitle(stars) {
    let current = TITLES[0];
    for (const t of TITLES) {
      if (stars >= t.stars) current = t;
    }
    return current;
  }

  function getNextTitle(stars) {
    for (const t of TITLES) {
      if (stars < t.stars) return t;
    }
    return null;
  }

  // 给某题加星
  function addStars(chapterId, questionId, starCount) {
    const data = load();
    if (!data.chapters[chapterId]) {
      data.chapters[chapterId] = { completed: false, stars: 0, questions: {} };
    }
    const ch = data.chapters[chapterId];
    // 如果这道题已经答对过，不重复加星
    if (ch.questions[questionId]) return { data, alreadyDone: true };
    ch.questions[questionId] = true;
    ch.stars += starCount;
    data.stars += starCount;

    // 检查章节是否完成（答对 80% 以上算完成）
    const totalQ = getChapterTotalQuestions(chapterId);
    const doneQ = Object.keys(ch.questions).length;
    if (totalQ > 0 && doneQ / totalQ >= 0.8) {
      if (!ch.completed) {
        ch.completed = true;
        data.stars += 5; // 通关奖励
      }
    }

    save(data);
    return { data, alreadyDone: false, newStars: starCount };
  }

  // 获取某章总题数（由 nav.js 中的章节配置提供，这里做兼容）
  function getChapterTotalQuestions(chapterId) {
    if (window.QUESTION_COUNTS && window.QUESTION_COUNTS[chapterId]) {
      return window.QUESTION_COUNTS[chapterId];
    }
    return Object.keys(load().chapters[chapterId]?.questions || {}).length || 1;
  }

  function isChapterCompleted(chapterId) {
    const data = load();
    return data.chapters[chapterId]?.completed || false;
  }

  function getChapterStars(chapterId) {
    const data = load();
    return data.chapters[chapterId]?.stars || 0;
  }

  function isQuestionDone(chapterId, questionId) {
    const data = load();
    return data.chapters[chapterId]?.questions?.[questionId] || false;
  }

  // 星星飞舞动画
  function flyStars(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement("div");
        el.className = "star-fly";
        el.textContent = "⭐";
        el.style.left = (x + (Math.random() - 0.5) * 60) + "px";
        el.style.top = y + "px";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
      }, i * 150);
    }
  }

  // 渲染顶部星星数
  function renderStarDisplay() {
    const data = load();
    const display = document.getElementById("star-count");
    if (display) display.textContent = data.stars;
    const titleEl = document.getElementById("nav-title");
    if (titleEl) {
      const t = getCurrentTitle(data.stars);
      titleEl.textContent = t.emoji + " " + t.name;
    }
  }

  // 渲染头衔进度条
  function renderTitleBar() {
    const data = load();
    const container = document.getElementById("title-bar");
    if (!container) return;
    const cur = getCurrentTitle(data.stars);
    const next = getNextTitle(data.stars);
    let progress, label;
    if (next) {
      const range = next.stars - cur.stars;
      const curProgress = data.stars - cur.stars;
      progress = Math.min(100, (curProgress / range) * 100);
      label = `${cur.emoji} ${cur.name} → ${next.emoji} ${next.name}（还需 ${next.stars - data.stars} ⭐）`;
    } else {
      progress = 100;
      label = `${cur.emoji} ${cur.name}（最高头衔）`;
    }
    container.innerHTML = `
      <div class="title-icon">${cur.emoji}</div>
      <div style="flex:1">
        <div class="title-name">${cur.name}</div>
        <div class="title-desc">${cur.desc}</div>
        <div class="progress-bar-wrap" style="margin-top:8px">
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress}%"></div></div>
        </div>
      </div>
    `;
  }

  return {
    TITLES,
    load, save,
    getCurrentTitle, getNextTitle,
    addStars, isChapterCompleted, getChapterStars, isQuestionDone,
    flyStars, renderStarDisplay, renderTitleBar,
  };
})();

// 页面加载时渲染星星显示
document.addEventListener("DOMContentLoaded", function () {
  GameSystem.renderStarDisplay();
});
