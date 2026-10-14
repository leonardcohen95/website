const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return parseInt(token.split(':')[0]);
  } catch { return null; }
}

// ===== API =====

// 注册
app.post('/api/register', (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
  if (username.length < 2) return res.status(400).json({ error: '用户名至少 2 个字符' });
  if (password.length < 4) return res.status(400).json({ error: '密码至少 4 个字符' });

  const data = loadData();
  const exists = Object.values(data.users).find(u => u.username === username);
  if (exists) return res.status(400).json({ error: '用户名已存在' });

  const id = data.nextId++;
  data.users[id] = { id, username, password: hashPassword(password), nickname: nickname || username };
  data.totalStars[id] = 0;
  data.progress[id] = {};
  saveData(data);

  res.json({ success: true, userId: id, token: `${id}:${Date.now()}` });
});

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });

  const data = loadData();
  const user = Object.values(data.users).find(u => u.username === username);
  if (!user || user.password !== hashPassword(password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  res.json({ success: true, userId: user.id, nickname: user.nickname, token: `${user.id}:${Date.now()}` });
});

// 获取进度
app.get('/api/progress', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: '未登录' });

  const data = loadData();
  const user = data.users[userId];
  if (!user) return res.status(404).json({ error: '用户不存在' });

  res.json({
    nickname: user.nickname,
    stars: data.totalStars[userId] || 0,
    chapters: data.progress[userId] || {}
  });
});

// 提交答题
app.post('/api/submit', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: '未登录' });

  const { chapterId, questionId, starCount } = req.body;
  if (!chapterId || !questionId || !starCount) {
    return res.status(400).json({ error: '参数不完整' });
  }

  const data = loadData();
  if (!data.progress[userId]) data.progress[userId] = {};
  const ch = data.progress[userId][chapterId] || { stars: 0, completed: false, questions: {} };
  const questions = ch.questions;

  if (questions[questionId]) {
    return res.json({ alreadyDone: true, stars: data.totalStars[userId] || 0 });
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

  res.json({ alreadyDone: false, newStars: starCount + bonus, stars: data.totalStars[userId], chapterCompleted: ch.completed });
});

// 消耗星星（重新答题）
app.post('/api/spend', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: '未登录' });

  const count = parseInt(req.body.count) || 1;
  const data = loadData();
  const stars = data.totalStars[userId] || 0;
  if (stars < count) {
    return res.json({ success: false, reason: 'stars', stars });
  }
  data.totalStars[userId] = stars - count;
  saveData(data);
  res.json({ success: true, stars: data.totalStars[userId] });
});

// 排行榜
app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const data = loadData();
  const rows = Object.entries(data.totalStars)
    .filter(([, stars]) => stars > 0)
    .map(([uid, stars]) => ({
      user_id: parseInt(uid),
      nickname: data.users[uid]?.nickname || '匿名',
      stars
    }))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit);
  res.json(rows);
});

// 用户排名
app.get('/api/rank', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: '未登录' });

  const data = loadData();
  const myStars = data.totalStars[userId] || 0;
  const rank = Object.values(data.totalStars).filter(s => s > myStars).length + 1;
  res.json({ rank, stars: myStars });
});

app.listen(PORT, () => {
  console.log(`K8s Quest server running at http://localhost:${PORT}`);
});
