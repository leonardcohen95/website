/* ============================================================
   LangChain Quest 后端服务（零依赖版）
   仅使用 Node 内置模块，无需 npm install，可直接 node server.js 启动
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const init = { users: {}, progress: {}, totalStars: {}, spentStars: {}, nextId: 1 };
      fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    return { users: {}, progress: {}, totalStars: {}, spentStars: {}, nextId: 1 };
  }
}

function calcEarnedStars(userId, data) {
  const chapters = data.progress?.[userId] || {};
  return Object.values(chapters).reduce((sum, ch) => sum + (ch?.stars || 0), 0);
}

function getUserStars(userId, data) {
  const earned = calcEarnedStars(userId, data);
  const spent = data.spentStars?.[userId] || 0;
  return Math.max(0, earned - spent);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 章节题目数配置（每章 10 题）
const QUESTION_COUNTS = {
  '01-intro':10,'02-setup':10,'03-llm-basics':10,'04-prompt':10,'05-chain':10,
  '06-memory':10,'07-data':10,'08-embeddings':10,'09-rag':10,'10-retriever':10,
  '11-agent':10,'12-tools':10,'13-lcel':10,'14-multimodal':10,'15-chatbot':10,
  '16-eval':10,'17-production':10,'18-project-cs':10,'19-project-kb':10,'20-interview':10
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
  data.spentStars[id] = 0;
  data.progress[id] = {};
  saveData(data);

  sendJson(res, 200, { success: true, userId: id, token: `${id}:${Date.now()}` });
}

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

function apiProgress(req, res) {
  const userId = getUserId(req);
  if (!userId) return sendJson(res, 401, { error: '未登录' });

  const data = loadData();
  const user = data.users[userId];
  if (!user) return sendJson(res, 404, { error: '用户不存在' });

  sendJson(res, 200, {
    nickname: user.nickname,
    stars: getUserStars(userId, data),
    chapters: data.progress[userId] || {}
  });
}

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
    return sendJson(res, 200, { alreadyDone: true, stars: getUserStars(userId, data) });
  }

  questions[questionId] = true;
  ch.stars += starCount;

  const totalQ = QUESTION_COUNTS[chapterId] || 1;
  const doneQ = Object.keys(questions).length;
  let bonus = 0;
  if (!ch.completed && doneQ / totalQ >= 0.8) {
    ch.completed = true;
    bonus = 5;
    ch.stars += bonus;
  }

  data.progress[userId][chapterId] = ch;
  data.totalStars[userId] = calcEarnedStars(userId, data);
  saveData(data);

  sendJson(res, 200, { alreadyDone: false, newStars: starCount + bonus, stars: getUserStars(userId, data), chapterCompleted: ch.completed });
}

function apiSpend(req, res, body) {
  const userId = getUserId(req);
  if (!userId) return sendJson(res, 401, { error: '未登录' });

  const count = parseInt(body.count) || 1;
  const data = loadData();
  const stars = getUserStars(userId, data);
  if (stars < count) {
    return sendJson(res, 200, { success: false, reason: 'stars', stars });
  }
  if (!data.spentStars) data.spentStars = {};
  data.spentStars[userId] = (data.spentStars[userId] || 0) + count;
  saveData(data);
  sendJson(res, 200, { success: true, stars: getUserStars(userId, data) });
}

function apiLeaderboard(req, res, query) {
  const limit = parseInt(query.limit) || 50;
  const data = loadData();
  const rows = Object.keys(data.users)
    .map(uid => {
      const userId = parseInt(uid);
      return {
        user_id: userId,
        nickname: data.users[uid].nickname || '匿名',
        stars: getUserStars(userId, data)
      };
    })
    .filter(row => row.stars > 0)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit);
  sendJson(res, 200, rows);
}

function apiRank(req, res) {
  const userId = getUserId(req);
  if (!userId) return sendJson(res, 401, { error: '未登录' });

  const data = loadData();
  const myStars = getUserStars(userId, data);
  const rank = Object.keys(data.users)
    .filter(uid => getUserStars(parseInt(uid), data) > myStars).length + 1;
  sendJson(res, 200, { rank, stars: myStars });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

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

  return serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`LangChain Quest server running at http://localhost:${PORT}`);
});
