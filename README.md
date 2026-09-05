# AI Agent 搭建教程

面向 **Python 初学者**的 AI Agent 搭建教程网站。从「什么是 Agent」一路讲到「把 Agent 部署到公网」，每章都包含概念讲解、可运行代码和互动测验。

## 课程目录

| 章节 | 标题 | 内容 |
|------|------|------|
| 第 1 章 | [认识 AI Agent](chapters/01-intro.html) | Agent 的概念、核心能力、与聊天机器人的区别 |
| 第 2 章 | [环境准备](chapters/02-setup.html) | 安装 Python、获取 API Key、安全存放密钥 |
| 第 3 章 | [第一个 Agent](chapters/03-first-agent.html) | 调用大模型 API，理解 prompt 和消息角色 |
| 第 4 章 | [给 Agent 加记忆](chapters/04-memory.html) | 上下文窗口、短期记忆、长期记忆 |
| 第 5 章 | [让 Agent 会用工具](chapters/05-tools.html) | Function Calling，让 Agent 调用外部工具 |
| 第 6 章 | [规划与反思](chapters/06-planning.html) | ReAct 模式，让 Agent 先思考再行动 |
| 第 7 章 | [多 Agent 协作](chapters/07-multi-agent.html) | 多 Agent 分工协作模式与实现 |
| 第 8 章 | [部署与总结](chapters/08-deploy.html) | 免费公网部署、免费域名、学习路线总结 |

## 项目结构

```
.
├── index.html              # 首页
├── assets/
│   ├── css/
│   │   └── style.css       # 全局样式（移动端优先响应式）
│   └── js/
│       ├── nav.js          # 导航配置（单一数据源驱动目录/翻页）
│       └── quiz.js         # 测验交互逻辑（单选+简答）
├── chapters/
│   ├── 01-intro.html
│   ├── 02-setup.html
│   ├── 03-first-agent.html
│   ├── 04-memory.html
│   ├── 05-tools.html
│   ├── 06-planning.html
│   ├── 07-multi-agent.html
│   └── 08-deploy.html
└── README.md
```

## 本地预览

本网站是纯静态 HTML，无需构建工具。任选一种方式：

**方式一：Python 启动本地服务器**
```bash
cd ai-agent-tutorial
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

**方式二：直接双击打开**
直接双击 `index.html` 即可在浏览器中查看。

## 免费部署到公网（GitHub Pages）

本项目是纯静态网站，可以用 **GitHub Pages** 免费部署到公网，并获得免费域名。

### 步骤

1. **在 GitHub 上创建仓库**
   - 登录 GitHub，点击「New repository」
   - 仓库名建议：`ai-agent-tutorial`
   - 设为 Public，点击创建

2. **把本项目推送到 GitHub**
   ```bash
   cd ai-agent-tutorial
   git init
   git add .
   git commit -m "初版：AI Agent 搭建教程"
   git branch -M main
   git remote add origin https://github.com/你的用户名/ai-agent-tutorial.git
   git push -u origin main
   ```

3. **开启 GitHub Pages**
   - 进入仓库页面 → 「Settings」→ 左侧「Pages」
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main`，目录选 `/ (root)`，点击 Save
   - 等待 1-2 分钟，网站就会发布在：
     ```
     https://你的用户名.github.io/ai-agent-tutorial/
     ```

### 绑定自定义免费域名（可选）

如果想要更短的域名，可以申请免费子域名：

- **[is-a.dev](https://www.is-a.dev)**：申请 `你的名字.is-a.dev`
- **[js.org](https://js.org)**：面向 JS 项目的 `你的项目.js.org`
- **[GitHub Pages 自定义域名](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site)**：在仓库 Settings → Pages 里填入你的域名，并在 DNS 服务商添加 CNAME 记录

## 技术特点

- **纯静态**：HTML + CSS + 原生 JS，无构建依赖，双击即可运行
- **移动端优先**：响应式设计，手机/平板/桌面都完美适配
- **互动测验**：每章配有单选题和简答题，提交后即时显示对错和解析
- **单一配置源**：章节信息统一在 `nav.js` 中维护，自动渲染目录和翻页

## 学习建议

1. 按章节顺序学习，每章读完后完成测验
2. 把代码示例复制到本地实际运行
3. 学完第 3 章后，尝试修改 prompt 看模型回答的变化
4. 学完第 5 章后，尝试给 Agent 加一个新工具（如查新闻）
5. 学完第 8 章后，把自己写的 Agent 部署到公网分享给朋友

## 许可证

本教程仅供学习使用，欢迎自由分享。
