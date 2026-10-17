/* ============================================================
   LangChain Quest - 游戏化核心系统
   星星、头衔、进度、排行榜、成就、后端同步
   ============================================================ */

const GameSystem = (function () {
  const STORAGE_KEY = "langchain-quest-progress";
  const AUTH_KEY = "langchain-quest-auth";
  const ACCOUNTS_KEY = "langchain-quest-accounts";

  // 头衔定义
  const TITLES = [
    { id: "newbie", name: "LLM 新手", emoji: "🌱", stars: 0, desc: "刚踏上 LLM 应用开发之旅" },
    { id: "prompt-apprentice", name: "Prompt 学徒", emoji: "✍️", stars: 10, desc: "初识 Prompt 工程" },
    { id: "chain-builder", name: "Chain 构建师", emoji: "⛓️", stars: 30, desc: "能搭建链式调用" },
    { id: "memory-master", name: "记忆大师", emoji: "🧠", stars: 60, desc: "掌握对话记忆系统" },
    { id: "rag-engineer", name: "RAG 工程师", emoji: "📚", stars: 100, desc: "精通检索增强生成" },
    { id: "vector-expert", name: "向量专家", emoji: "🔢", stars: 150, desc: "驾驭向量数据库" },
    { id: "agent-maker", name: "Agent 造物者", emoji: "🤖", stars: 200, desc: "打造智能体应用" },
    { id: "tool-smith", name: "工具锻造师", emoji: "🔧", stars: 260, desc: "精通工具与函数调用" },
    { id: "lcel-wizard", name: "LCEL 魔法师", emoji: "🪄", stars: 330, desc: "LCEL 表达式大师" },
    { id: "llm-architect", name: "LLM 应用架构师", emoji: "👑", stars: 400, desc: "征服 LLM 应用开发全境" },
  ];

  // 成就定义
  const ACHIEVEMENTS = [
    { id: "first-star", name: "初露锋芒", emoji: "⭐", desc: "获得第一颗星星", check: d => d.stars >= 1 },
    { id: "ten-stars", name: "小有所成", emoji: "🌟", desc: "累计获得 10 颗星星", check: d => d.stars >= 10 },
    { id: "fifty-stars", name: "答题达人", emoji: "💫", desc: "累计获得 50 颗星星", check: d => d.stars >= 50 },
    { id: "hundred-stars", name: "星星猎手", emoji: "✨", desc: "累计获得 100 颗星星", check: d => d.stars >= 100 },
    { id: "first-chapter", name: "初战告捷", emoji: "🎯", desc: "通关第一个章节", check: d => Object.values(d.chapters).some(c => c.completed) },
    { id: "five-chapters", name: "渐入佳境", emoji: "📚", desc: "通关 5 个章节", check: d => Object.values(d.chapters).filter(c => c.completed).length >= 5 },
    { id: "ten-chapters", name: "半程冠军", emoji: "🏅", desc: "通关 10 个章节", check: d => Object.values(d.chapters).filter(c => c.completed).length >= 10 },
    { id: "all-chapters", name: "LangChain 征服者", emoji: "👑", desc: "通关全部 20 个章节", check: d => Object.values(d.chapters).filter(c => c.completed).length >= 20 },
    { id: "architect-title", name: "登顶之路", emoji: "🏆", desc: "达到 LLM 应用架构师头衔", check: d => d.stars >= 400 },
  ];

  // 后端检测
  let backendAvailable = false;
  let authToken = null;
  let userId = null;
  let nickname = null;

  function defaultProgress() {
    return { stars: 0, chapters: {}, achievements: [] };
  }

  function getAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; }
    catch { return null; }
  }

  function setAuth(auth) {
    if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    else localStorage.removeItem(AUTH_KEY);
    authToken = auth?.token || null;
    userId = auth?.userId || null;
    nickname = auth?.nickname || null;
  }

  function isLoggedIn() {
    return !!authToken;
  }

  function isBackendAuthed() {
    return backendAvailable && !!authToken && /^\d+:/.test(authToken);
  }

  function restoreAuth() {
    const auth = getAuth();
    if (auth) setAuth(auth);
  }

  async function checkBackend() {
    try {
      const res = await fetch('/api/leaderboard?limit=1');
      if (res.ok) { backendAvailable = true; return true; }
    } catch {}
    backendAvailable = false;
    return false;
  }

  function getAccounts() {
    try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}; }
    catch { return {}; }
  }
  function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  function notifyAuth() {
    try { window.dispatchEvent(new CustomEvent("langchainquest:auth")); } catch {}
  }
  function localRegister(username, password, nickname) {
    const accounts = getAccounts();
    if (accounts[username]) return { success: false, error: "用户名已存在" };
    accounts[username] = { password, nickname: nickname || username };
    saveAccounts(accounts);
    setAuth({ token: `local:${username}`, userId: username, nickname: nickname || username });
    notifyAuth();
    return { success: true };
  }
  function localLogin(username, password) {
    const accounts = getAccounts();
    const user = accounts[username];
    if (!user || user.password !== password) return { success: false, error: "用户名或密码错误" };
    setAuth({ token: `local:${username}`, userId: username, nickname: user.nickname });
    notifyAuth();
    return { success: true };
  }

  async function login(username, password) {
    if (!username || !password) return { success: false, error: "请输入用户名和密码" };
    if (backendAvailable) {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          setAuth({ token: data.token, userId: data.userId, nickname: data.nickname });
          notifyAuth();
          return { success: true };
        }
        return { success: false, error: data.error };
      } catch {}
    }
    return localLogin(username, password);
  }

  async function register(username, password, nickname) {
    if (!username || !password) return { success: false, error: "请输入用户名和密码" };
    if (backendAvailable) {
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, nickname })
        });
        const data = await res.json();
        if (data.success) {
          setAuth({ token: data.token, userId: data.userId, nickname: nickname || username });
          notifyAuth();
          return { success: true };
        }
        return { success: false, error: data.error };
      } catch {}
    }
    return localRegister(username, password, nickname);
  }

  function logout() {
    setAuth(null);
    notifyAuth();
  }

  async function load() {
    if (isBackendAuthed()) {
      try {
        const res = await fetch('/api/progress', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          const chapterSum = Object.values(data.chapters || {}).reduce((s, c) => s + (c?.stars || 0), 0);
          const safeStars = Math.max(data.stars || 0, chapterSum);
          const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          const merged = {
            stars: safeStars,
            chapters: data.chapters,
            nickname: data.nickname,
            spentStars: local.spentStars || 0,
            achievements: local.achievements || []
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch {}
    }
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultProgress();
      const merged = { ...defaultProgress(), ...data };
      if (merged.spentStars) {
        merged.stars = Math.max(0, (merged.stars || 0) - merged.spentStars);
      }
      return merged;
    } catch { return defaultProgress(); }
  }

  function saveLocal(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getCurrentTitle(stars) {
    let current = TITLES[0];
    for (const t of TITLES) if (stars >= t.stars) current = t;
    return current;
  }

  function getNextTitle(stars) {
    for (const t of TITLES) if (stars < t.stars) return t;
    return null;
  }

  function checkAchievements(data) {
    const unlocked = data.achievements || [];
    const newlyUnlocked = [];
    for (const a of ACHIEVEMENTS) {
      if (!unlocked.includes(a.id) && a.check(data)) {
        unlocked.push(a.id);
        newlyUnlocked.push(a);
      }
    }
    data.achievements = unlocked;
    return newlyUnlocked;
  }

  async function addStars(chapterId, questionId, starCount) {
    if (isBackendAuthed()) {
      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ chapterId, questionId, starCount })
        });
        if (res.ok) {
          const result = await res.json();
          const data = await load();
          const newAchievements = checkAchievements(data);
          const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          local.achievements = data.achievements;
          saveLocal(local);
          return { ...result, data, newAchievements };
        }
      } catch {}
    }
    const data = await load();
    if (!data.chapters[chapterId]) data.chapters[chapterId] = { completed: false, stars: 0, questions: {} };
    const ch = data.chapters[chapterId];
    if (ch.questions[questionId]) return { alreadyDone: true, data };
    ch.questions[questionId] = true;
    ch.stars += starCount;
    data.stars += starCount;

    const totalQ = window.QUESTION_COUNTS?.[chapterId] || Object.keys(ch.questions).length || 1;
    const doneQ = Object.keys(ch.questions).length;
    let chapterCompleted = false;
    if (!ch.completed && doneQ / totalQ >= 0.8) {
      ch.completed = true;
      ch.stars += 5;
      data.stars += 5;
      chapterCompleted = true;
    }
    const newAchievements = checkAchievements(data);
    saveLocal(data);
    return { alreadyDone: false, newStars: starCount + (chapterCompleted ? 5 : 0), data, chapterCompleted, newAchievements };
  }

  async function spendStars(count = 1) {
    if (isBackendAuthed()) {
      try {
        const res = await fetch('/api/spend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ count })
        });
        if (res.ok) {
          const result = await res.json();
          return result;
        }
      } catch {}
    }
    const data = await load();
    if (data.stars < count) {
      return { success: false, reason: 'stars', data };
    }
    data.stars -= count;
    saveLocal(data);
    return { success: true, data };
  }

  function isChapterCompleted(chapterId) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data.chapters?.[chapterId]?.completed || false;
  }
  function getChapterStars(chapterId) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data.chapters?.[chapterId]?.stars || 0;
  }
  function isQuestionDone(chapterId, questionId) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data.chapters?.[chapterId]?.questions?.[questionId] || false;
  }

  function flyStars(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'star-fly';
        el.textContent = '⭐';
        el.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
        el.style.top = y + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
      }, i * 150);
    }
  }

  function showAchievementPopup(achievement) {
    const popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f;padding:16px 20px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);z-index:9999;animation:slideIn 0.3s ease;max-width:280px;';
    popup.innerHTML = `<div style="font-size:1.8rem;text-align:center;">${achievement.emoji}</div><div style="font-weight:700;text-align:center;margin-top:4px;">成就解锁！</div><div style="text-align:center;font-size:0.9rem;margin-top:2px;">${achievement.name}</div><div style="text-align:center;font-size:0.78rem;opacity:0.8;margin-top:2px;">${achievement.desc}</div>`;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.opacity = '0'; popup.style.transition = 'opacity 0.5s'; setTimeout(() => popup.remove(), 500); }, 4000);
  }

  function renderStarDisplay() {
    const display = document.getElementById('star-count');
    const auth = getAuth();
    if (display) display.textContent = auth ? '加载中' : '0';
    load().then(data => {
      if (display) display.textContent = data.stars;
      const titleEl = document.getElementById('nav-title');
      if (titleEl) {
        const t = getCurrentTitle(data.stars);
        titleEl.textContent = t.emoji + ' ' + t.name;
      }
      const authEl = document.getElementById('nav-auth');
      if (authEl) {
        if (isLoggedIn()) {
          const isLocal = authToken && authToken.startsWith('local:');
          const localBadge = (backendAvailable && isLocal)
            ? `<a href="#" onclick="GameSystem.showLoginModal();return false;" style="font-size:0.7rem;color:#f59e0b;margin-left:4px;text-decoration:none;border:1px solid #fbbf24;padding:1px 6px;border-radius:4px;">本地账号·点此同步</a>`
            : '';
          const logoutLink = `<a href="#" onclick="GameSystem.logout();GameSystem.renderStarDisplay();return false;" style="font-size:0.78rem;color:var(--color-text-light);margin-left:8px;opacity:0.7;">退出</a>`;
          authEl.innerHTML = `<span style="font-size:0.85rem;color:var(--color-text-light)">${data.nickname || nickname}</span>${localBadge}${logoutLink}`;
        } else {
          authEl.innerHTML = `<a href="#" onclick="GameSystem.showLoginModal();return false;" style="color:var(--color-primary);font-weight:600;">登录</a>`;
        }
      }
    });
  }

  function renderTitleBar() {
    const container = document.getElementById('title-bar');
    if (!container) return;
    load().then(data => {
      const cur = getCurrentTitle(data.stars);
      const next = getNextTitle(data.stars);
      let progress, label;
      if (next) {
        const range = next.stars - cur.stars;
        progress = Math.min(100, ((data.stars - cur.stars) / range) * 100);
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
        </div>`;
    });
  }

  function showToast(msg, type = 'success') {
    const color = type === 'success' ? '#16a34a' : '#dc2626';
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);background:${color};color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:10001;font-weight:600;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 2200);
  }

  function showLoginModal() {
    const existing = document.getElementById('auth-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:grid;place-items:center;';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:28px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">登录 / 注册</h3>
          <button onclick="document.getElementById('auth-modal').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;">&times;</button>
        </div>
        <p style="color:#64748b;font-size:0.88rem;margin-bottom:16px;">登录后进度会同步到服务器，排行榜也会显示你的名字哦！</p>
        <input id="auth-username" placeholder="用户名" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;font-size:0.95rem;" />
        <input id="auth-password" type="password" placeholder="密码" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;font-size:0.95rem;" />
        <input id="auth-nickname" placeholder="昵称（可选，注册时填）" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:16px;font-size:0.95rem;" />
        <div id="auth-error" style="color:#ef4444;font-size:0.85rem;margin-bottom:10px;display:none;"></div>
        <div style="display:flex;gap:10px;">
          <button id="btn-login" style="flex:1;padding:10px;background:#00a3c4;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">登录</button>
          <button id="btn-register" style="flex:1;padding:10px;background:#8b5cf6;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">注册</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('btn-login').onclick = async () => {
      const u = document.getElementById('auth-username').value.trim();
      const p = document.getElementById('auth-password').value;
      const err = document.getElementById('auth-error');
      const r = await login(u, p);
      if (r.success) { modal.remove(); renderStarDisplay(); showToast('登录成功！'); }
      else { err.textContent = r.error; err.style.display = 'block'; }
    };
    document.getElementById('btn-register').onclick = async () => {
      const u = document.getElementById('auth-username').value.trim();
      const p = document.getElementById('auth-password').value;
      const n = document.getElementById('auth-nickname').value.trim();
      const err = document.getElementById('auth-error');
      const r = await register(u, p, n);
      if (r.success) { modal.remove(); renderStarDisplay(); showToast('注册成功！欢迎加入 LangChain Quest！'); }
      else { err.textContent = r.error; err.style.display = 'block'; }
    };
  }

  return {
    TITLES, ACHIEVEMENTS,
    load, saveLocal,
    getCurrentTitle, getNextTitle,
    addStars, spendStars, isChapterCompleted, getChapterStars, isQuestionDone,
    flyStars, showAchievementPopup,
    renderStarDisplay, renderTitleBar,
    showLoginModal, login, register, logout, isLoggedIn, isBackendAuthed, getAuth, restoreAuth,
    checkBackend, backendAvailable: () => backendAvailable
  };
})();

document.addEventListener('DOMContentLoaded', async function () {
  GameSystem.restoreAuth();
  await GameSystem.checkBackend();
  GameSystem.renderStarDisplay();
  try { window.dispatchEvent(new CustomEvent("langchainquest:auth")); } catch {}
});
