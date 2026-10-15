/* ============================================================
   K8s Quest 后端服务（零依赖版）
   仅使用 Node 内置模块，无需 npm install，工作区重置后可直接 node server.js 启动
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(__dirname, 'data.json');

// ===== 数据持久化（JSON 文件） =====
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const init = { users: {}, progress: {}, totalStars: {}, nextId: 1 };
      fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    return { users: {}, progress: {}, totalStars: {}, nextId: 1 };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 章节题目数配置（每章 10 题）
const QUESTION_COUNTS = {
  '01-intro':10,'02-arch':10,'03-core':10,'04-kubectl':10,'05-setup':10,
  '06-pod':10,'07-deployment':10,'08-workload':10,'09-service':10,'10-ingress':10,
  '11-volume':10,'12-pv-pvc':10,'13-configmap':10,'14-secret':10,'15-rbac':10,
  '16-scheduling':10,'17-hpa':10,'18-helm':10,'19-monitor':10,'20-troubleshoot':10
};

function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

function getUserId(req) {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!token) return null;
  const id = parseInt(token.split(':')[0]);
  return Number.isNaN(id) ? null : id;
}

// ===== HTTP 辅助 =====
const MIME = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.webp':'image/webp',
  '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf',
  '.epub':'application/epub+zip', '.map':'application/json; charset=utf-8'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function sendJson(res, status, obj) {
  res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS));
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const safeRel = path.normalize(rel).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT, safeRel);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

// ===== API 处理 =====

// 注册
function apiRegister(req, res, body) {
  const { username, password, nickname } = body;
  if (!username || !password) return sendJson(res, 400, { error: '用户名和密码不能为空' });
  if (username.length < 2) return sendJson(res, 400, { error: '用户名至少 2 个字符' });
  if (password.length < 4) return sendJson(res, 400, { error: '密码至少 4 个字符' });

  const data = loadData();
  const exists = Object.values(data.users).find(u => u.username === username);
  if (exists) return sendJson(res, 400, { error: '用户名已存在' });

  const id = data.nextId++;
  data.users[id] = { id, username, password: hashPassword(password), nickname: nickname || username };
  data.totalStars[id] = 0;
  data.progress[id] = {};
  saveData(data);

  sendJson(res, 200, { success: true, userId: id, token: `${id}:${Date.now()}` });
}

// 登录
function apiLogin(req, res, body) {
  const { username, password } = body;
  if (!username || !password) return sendJson(res, 400, { error: '用户名和密码不能为空' });

  const data = loadData();
  const user = Object.values(data.users).find(u => u.username === username);
  if (!user || user.password !== hashPassword(password)) {
    return sendJson(res, 401, { error: '用户名或密码错误' });
  }
  sendJson(res, 200, { success: true, userId: user.id, nickname: user.nickname, token: `${user.id}:${Date.now()}` });
}

// 获取进度
function apiProgress(req, res) {
  const userId = getUserId(req);
  if (!userId) return sendJson(res, 401, { error: '未登录' });

  const data = loadData();
  const user = data.users[userId];
  if (!user) return sendJson(res, 404, { error: '用户不存在' });

  sendJson(res, 200, {
    nickname: user.nickname,
    stars: data.totalStars[userId] || 0,
    chapters: data.progress[userId] || {}
  });
}

// 提交答题
function apiSubmit(req, res, body) {
  const userId = getUserId(req);
  if (!userId) return sendJson(res, 401, { error: '未登录' });

  const { chapterId, questionId, starCount } = body;
  if (!chapterId || !questionId || !starCount) {
    return sendJson(res, 400, { error: '参数不完整' });
  }

  const data = loadData();
  if (!data.progress[userId]) data.progress[userId] = {};
  const ch = data.progress[userId][chapterId] || { stars: 0, completed: false, questions: {} };
  const questions = ch.questions;

  if (questions[questionId]) {
    return sendJson(res, 200, { alreadyDone: true, stars: data.totalStars[userId] || 0 });
  }

  questions[questionId] = true;
  ch.stars += starCount;

  const totalQ = QUESTION_COUNTS[chapterId] || 1;
  const doneQ = Object.keys(questions).length;
  let bonus = 0;
  if (!ch.completed && doneQ / totalQ >= 0.8) {
    ch.completed = true;
    bonus = 5;
  }

  data.progress[userId][chapterId] = ch;
  data.totalStars[userId] = (data.totalStars[userId] || 0) + starCount + bonus;
  saveData(data);

  sendJson(res, 200, { alreadyDone: false, newStars: starCount + bonus, stars: data.totalStars[userId], chapterCompleted: ch.completed });
}

// 消耗星星（重新答题）
function apiSpend(req, res, body) {
  const userId = getUserId(req);
  if (!userId) return sendJson(res, 401, { error: '未登录' });

  const count = parseInt(body.count) || 1;
  const data = loadData();
  const stars = data.totalStars[userId] || 0;
  if (stars < count) {
    return sendJson(res, 200, { success: false, reason: 'stars', stars });
  }
  data.totalStars[userId] = stars - count;
  saveData(data);
  sendJson(res, 200, { success: true, stars: data.totalStars[userId] });
}

// 排行榜
function apiLeaderboard(req, res, query) {
  const limit = parseInt(query.limit) || 50;
  const data = loadData();
  const rows = Object.entries(data.totalStars)
    .filter(([, stars]) => stars > 0)
    .map(([uid, stars]) => ({
      user_id: parseInt(uid),
      nickname: (data.users[uid] && data.users[uid].nickname) || '匿名',
      stars
    }))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit);
  sendJson(res, 200, rows);
}

// 用户排名
function apiRank(req, res) {
  const userId = getUserId(req);
  if (!userId) return sendJson(res, 401, { error: '未登录' });

  const data = loadData();
  const myStars = data.totalStars[userId] || 0;
  const rank = Object.values(data.totalStars).filter(s => s > myStars).length + 1;
  sendJson(res, 200, { rank, stars: myStars });
}

// ===== 服务器 =====
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const method = req.method;

  // CORS 预检
  if (method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  // API 路由
  if (pathname.startsWith('/api/')) {
    const body = (method === 'POST') ? await readBody(req) : {};
    switch (pathname) {
      case '/api/register':    return apiRegister(req, res, body);
      case '/api/login':       return apiLogin(req, res, body);
      case '/api/progress':    return apiProgress(req, res);
      case '/api/submit':      return apiSubmit(req, res, body);
      case '/api/spend':       return apiSpend(req, res, body);
      case '/api/leaderboard': return apiLeaderboard(req, res, url.searchParams);
      case '/api/rank':        return apiRank(req, res);
      default:                 return sendJson(res, 404, { error: 'Not found' });
    }
  }

  // 静态资源
  return serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`K8s Quest server running at http://localhost:${PORT}`);
});
