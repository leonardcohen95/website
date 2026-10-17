/* ============================================================
   LangChain Quest - 题库（支持多套变体，答错可消耗1星换题）
   每个 slot 有多道变体题，重新答题时切换到不同变体
   ============================================================ */
window.QUESTION_BANK = {
  "01-intro": [
    { slot: "q1", variants: [
      { type: "choice", q: "LangChain 的主要用途是什么？", options: ["容器编排", "构建 LLM 应用的开发框架", "数据库管理", "前端 UI 框架"], answer: 1, stars: 1, explain: "LangChain 是一个用于构建基于大语言模型（LLM）应用的开发框架，提供链式调用、记忆、检索等能力。" },
      { type: "choice", q: "LangChain 最初是用哪种语言编写的？", options: ["JavaScript", "Python", "Go", "Java"], answer: 1, stars: 1, explain: "LangChain 最初由 Harrison Chase 用 Python 开发，后来推出了 JavaScript/TypeScript 版本。" },
      { type: "choice", q: "LangChain 这个名字中的 'Chain' 指的是什么？", options: ["区块链", "将多个组件链接在一起的链式调用", "供应链", "锁链"], answer: 1, stars: 1, explain: "Chain 指的是将 LLM、Prompt、工具等组件链接（Chain）在一起形成完整的应用流程。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "以下哪项不是 LangChain 的核心模块？", options: ["Chains", "Agents", "Memory", "Docker"], answer: 3, stars: 1, explain: "Docker 是容器技术，不是 LangChain 的模块。LangChain 核心包括 Chains、Agents、Memory、Retrievers 等。" },
      { type: "choice", q: "LangChain 中负责与外部世界交互的模块是？", options: ["Prompts", "Agents / Tools", "Memory", "Callbacks"], answer: 1, stars: 1, explain: "Agents 通过 Tools 与外部世界交互，如调用搜索引擎、数据库、API 等。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "LangChain 只能使用 OpenAI 的模型。", answer: false, stars: 1, explain: "LangChain 支持多种 LLM 提供商，包括 OpenAI、Anthropic、HuggingFace、本地模型等。" },
      { type: "judge", q: "LangChain 是一个闭源的商业框架。", answer: false, stars: 1, explain: "LangChain 是完全开源的项目，遵循 MIT 许可证，社区活跃。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是 LangChain 的典型应用场景？（多选）", options: ["智能客服机器人", "文档问答系统", "自动化数据分析", "操作系统内核开发"], answer: [0,1,2], stars: 2, explain: "LangChain 适合构建对话系统、RAG 问答、Agent 自动化等 LLM 应用，不涉及操作系统内核开发。" },
      { type: "multi", q: "LangChain 相比直接调用 LLM API 的优势有哪些？（多选）", options: ["链式编排多个步骤", "内置记忆系统", "丰富的工具集成", "完全替代 LLM"], answer: [0,1,2], stars: 2, explain: "LangChain 提供编排、记忆、工具等能力，但底层仍需调用 LLM，不能替代 LLM 本身。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "LangChain 中 'LCEL' 是什么的缩写？", options: ["LangChain Expression Language", "Large Chain Execution Logic", "Language Chain Engine Layer", "LangChain Embedding Library"], answer: 0, stars: 1, explain: "LCEL 即 LangChain Expression Language，是 LangChain 用于组合组件的声明式表达式语言。" },
      { type: "choice", q: "LangChain 的吉祥物/Logo 是什么动物？", options: ["鲸鱼", "鹦鹉/鸟", "企鹅", "章鱼"], answer: 1, stars: 1, explain: "LangChain 的 Logo 是一只鹦鹉（🦜），寓意语言与沟通。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "LangChain 中用于组合各个组件的声明式表达式语言简称是 ______。", answer: "LCEL|lcel", stars: 2, explain: "LCEL（LangChain Expression Language）是 LangChain 的表达式语言，用于灵活组合 Runnable 组件。" },
      { type: "text", q: "LangChain 的创始人是 ______ Chase。", answer: "Harrison|harrison", stars: 1, explain: "LangChain 由 Harrison Chase 于 2022 年创立。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "以下哪个不是 LangChain 支持的模型提供商？", options: ["OpenAI", "Anthropic", "HuggingFace", "Adobe Photoshop"], answer: 3, stars: 1, explain: "Adobe Photoshop 是图像编辑软件，不是 LLM 提供商。其他三个都是 LangChain 支持的模型提供商。" },
      { type: "choice", q: "LangChain 的核心设计理念不包括？", options: ["组件化", "链式组合", "可观测性", "替代数据库"], answer: 3, stars: 1, explain: "LangChain 强调组件化、链式组合和可观测性，但不替代数据库，反而可以连接各种数据源。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "使用 LangChain 后，应用就不需要写业务代码了。", answer: false, stars: 1, explain: "LangChain 是辅助框架，业务逻辑、数据处理等仍需开发者编写。" },
      { type: "judge", q: "LangChain 可以连接本地部署的开源大模型。", answer: true, stars: 1, explain: "LangChain 支持通过 HuggingFace、Ollama、vLLM 等集成本地开源模型。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LangChain 生态中用于监控和调试 LLM 应用的产品是？", options: ["LangSmith", "LangServe", "LangGraph", "LangStore"], answer: 0, stars: 1, explain: "LangSmith 是 LangChain 推出的 LLM 应用监控、调试和评估平台。" },
      { type: "choice", q: "LangChain 生态中用于构建有状态多智能体应用的是？", options: ["LangSmith", "LangServe", "LangGraph", "LangCLI"], answer: 2, stars: 1, explain: "LangGraph 用于构建有状态的、多智能体协作的应用，支持复杂的工作流编排。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "LangChain 生态中用于监控和调试 LLM 应用的产品是 ______。", answer: "LangSmith|langsmith", stars: 2, explain: "LangSmith 是 LangChain 官方的 LLM 应用可观测性平台。" },
      { type: "text", q: "LangChain 中构建状态化多 Agent 应用的库是 ______。", answer: "LangGraph|langgraph", stars: 2, explain: "LangGraph 扩展了 LangChain，支持构建循环、状态化的 Agent 工作流。" }
    ]}
  ],
  "02-setup": [
    { slot: "q1", variants: [
      { type: "choice", q: "安装 LangChain 的 pip 命令是？", options: ["pip install langchain", "pip install lang-chain", "npm install langchain", "apt install langchain"], answer: 0, stars: 1, explain: "Python 版使用 pip install langchain，JS 版使用 npm install langchain。" },
      { type: "choice", q: "要使用 OpenAI 的模型，还需额外安装哪个包？", options: ["langchain-openai", "openai-sdk", "langchain-anthropic", "openai-langchain"], answer: 0, stars: 1, explain: "langchain-openai 提供了与 OpenAI API 的集成封装。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "LangChain 推荐的 Python 版本是？", options: ["Python 2.7", "Python 3.8+", "Python 3.11+", "Python 3.6"], answer: 2, stars: 1, explain: "LangChain 0.2+ 推荐 Python 3.8.1+，实际生产建议 3.10 或 3.11。" },
      { type: "choice", q: "设置 OpenAI API Key 的环境变量名通常是？", options: ["OPENAI_API_KEY", "API_KEY", "OPENAI_KEY", "AI_API_KEY"], answer: 0, stars: 1, explain: "LangChain 默认从环境变量 OPENAI_API_KEY 读取 OpenAI 的 API 密钥。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "使用 LangChain 必须安装 langchain 包。", answer: true, stars: 1, explain: "langchain 是核心包，提供 Chains、Agents、Memory 等核心功能。" },
      { type: "judge", q: "LangChain 的 JS 版本和 Python 版本功能完全一致。", answer: false, stars: 1, explain: "两个版本功能相近但并非完全一致，Python 版本功能更丰富、迭代更快。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是 LangChain 常用的集成包？（多选）", options: ["langchain-openai", "langchain-community", "langchain-core", "langchain-docker"], answer: [0,1,2], stars: 2, explain: "langchain-core 是核心抽象，langchain-community 是社区集成，langchain-openai 是 OpenAI 集成；没有 langchain-docker。" },
      { type: "multi", q: "使用 LangChain 前需要准备哪些？（多选）", options: ["Python 环境", "LLM API Key", "安装依赖包", "购买商用授权"], answer: [0,1,2], stars: 2, explain: "需要 Python 环境、API Key 和依赖包，LangChain 本身是开源免费的，无需商用授权。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "在 Python 中导入 LangChain 的 ChatOpenAI 类的语句是？", options: ["from langchain_openai import ChatOpenAI", "import langchain.ChatOpenAI", "from langchain import ChatOpenAI", "from openai import ChatOpenAI"], answer: 0, stars: 1, explain: "新版 LangChain 中 ChatOpenAI 位于 langchain_openai 包中。" },
      { type: "choice", q: "以下哪个导入路径是新版 LangChain 正确的？", options: ["from langchain.llms import OpenAI", "from langchain_community.llms import OpenAI", "from langchain_openai import OpenAI", "from langchain_openai import ChatOpenAI"], answer: 3, stars: 1, explain: "新版推荐 from langchain_openai import ChatOpenAI，旧的 langchain.llms 已弃用。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "安装 OpenAI 集成包的命令是 pip install ______。", answer: "langchain-openai", stars: 1, explain: "langchain-openai 是 LangChain 与 OpenAI 的集成包。" },
      { type: "text", q: "设置 OpenAI API Key 的环境变量是 ______。", answer: "OPENAI_API_KEY", stars: 1, explain: "OPENAI_API_KEY 是 LangChain 默认读取的 OpenAI 密钥环境变量。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "以下哪种方式可以在代码中设置 API Key？", options: ["os.environ['OPENAI_API_KEY'] = 'xxx'", "直接硬编码在调用参数中", "创建 .env 文件并用 load_dotenv 加载", "以上都可以"], answer: 3, stars: 1, explain: "三种方式都可以，但推荐使用环境变量或 .env 文件，避免硬编码密钥。" },
      { type: "choice", q: "关于虚拟环境，下列说法正确的是？", options: ["虚拟环境会污染系统 Python", "虚拟环境可以隔离项目依赖", "虚拟环境只能在 Linux 使用", "虚拟环境是必须的，不用无法安装"], answer: 1, stars: 1, explain: "虚拟环境用于隔离不同项目的依赖，避免版本冲突，推荐但非强制。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "langchain-core 包包含了所有第三方集成。", answer: false, stars: 1, explain: "langchain-core 只包含核心抽象，第三方集成在 langchain-community 或各自的 langchain-xxx 包中。" },
      { type: "judge", q: "可以同时使用 langchain 和 langchain-core，它们不会冲突。", answer: true, stars: 1, explain: "langchain 依赖 langchain-core，两者可以同时使用，langchain-core 提供基础抽象。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LangChain 0.2 版本的重要变化是？", options: ["完全重写为闭源", "将第三方集成拆分到独立包", "不再支持 Python", "只支持 OpenAI"], answer: 1, stars: 1, explain: "LangChain 0.2 将第三方集成从 langchain 拆分到 langchain-community 和独立的 langchain-xxx 包。" },
      { type: "choice", q: "验证 LangChain 安装成功可以执行？", options: ["python -c 'import langchain; print(langchain.__version__)'", "langchain --version", "pip langchain version", "python langchain.py"], answer: 0, stars: 1, explain: "通过导入 langchain 包并打印版本号可以验证安装是否成功。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "LangChain 核心抽象所在的包是 langchain-______。", answer: "core", stars: 1, explain: "langchain-core 包含 LangChain 的核心抽象（Runnable、BaseLLM 等）。" },
      { type: "text", q: "加载 .env 文件中的环境变量需要调用 ______ 函数。", answer: "load_dotenv", stars: 1, explain: "python-dotenv 库的 load_dotenv() 函数可以加载 .env 文件中的环境变量。" }
    ]}
  ],
  "03-llm-basics": [
    { slot: "q1", variants: [
      { type: "choice", q: "LLM 中的 Token 是什么？", options: ["一个完整的单词", "文本的最小处理单位", "一个句子", "一个字符"], answer: 1, stars: 1, explain: "Token 是 LLM 处理文本的基本单位，可以是一个词、词的一部分或标点，英文约 4 个字符对应 1 个 token。" },
      { type: "choice", q: "Temperature 参数控制的是？", options: ["输出长度", "生成的随机性/创造性", "响应速度", "token 数量"], answer: 1, stars: 1, explain: "Temperature 控制生成的随机性，值越高越随机有创造性，值越低越确定保守。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "max_tokens 参数的作用是？", options: ["限制输入长度", "限制生成的最大 token 数", "设置模型温度", "设置重试次数"], answer: 1, stars: 1, explain: "max_tokens 限制模型生成回复的最大 token 数量，避免输出过长。" },
      { type: "choice", q: "top_p 参数（核采样）控制的是？", options: ["只从概率最高的前 p 比例的 token 中采样", "输出的温度", "最大长度", "停止条件"], answer: 0, stars: 1, explain: "top_p 是核采样参数，只从累积概率达到 p 的 token 集合中采样，控制多样性。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Temperature 设为 0 时，输出总是确定的。", answer: false, stars: 1, explain: "Temperature 为 0 时输出高度确定，但在极少数情况下浮点运算差异可能导致微小变化，且部分模型有固有的非确定性。" },
      { type: "judge", q: "Token 数量越多，API 调用费用越高。", answer: true, stars: 1, explain: "LLM API 通常按 token 计费，输入和输出 token 都计费，token 越多费用越高。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是 LLM 的常见生成参数？（多选）", options: ["temperature", "max_tokens", "top_p", "font_size"], answer: [0,1,2], stars: 2, explain: "temperature、max_tokens、top_p 都是 LLM 生成参数，font_size 是前端字体大小，与 LLM 无关。" },
      { type: "multi", q: "关于 Token，下列说法正确的是？（多选）", options: ["Token 是 LLM 处理文本的基本单位", "中文一个字可能就是一个 token", "Token 数量影响费用和速度", "Token 就是字符"], answer: [0,1,2], stars: 2, explain: "Token 是基本单位，中文通常一个字就是一个 token，数量影响费用和速度，但 Token 不等于字符。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "ChatOpenAI 的 temperature 默认值大约是？", options: ["0", "0.7", "1.0", "2.0"], answer: 1, stars: 1, explain: "ChatOpenAI 的默认 temperature 约为 0.7，平衡了创造性和确定性。" },
      { type: "choice", q: "要让模型输出更确定、更一致，应该？", options: ["调高 temperature", "调低 temperature", "调高 max_tokens", "调低 top_p 到 0"], answer: 1, stars: 1, explain: "调低 temperature（如 0-0.3）可以让输出更确定一致，适合事实性问答。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "LLM 处理文本的基本单位称为 ______。", answer: "token|Token|TOKEN", stars: 1, explain: "Token 是 LLM 处理文本的基本单位。" },
      { type: "text", q: "控制 LLM 生成随机性的参数是 ______。", answer: "temperature", stars: 1, explain: "temperature 参数控制生成的随机性，值越高越随机。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "LangChain 中 ChatOpenAI 和 OpenAI 的主要区别是？", options: ["没有区别", "ChatOpenAI 针对聊天模型，OpenAI 针对补全模型", "OpenAI 更快", "ChatOpenAI 不支持 temperature"], answer: 1, stars: 1, explain: "ChatOpenAI 封装 chat 模型（如 gpt-3.5-turbo、gpt-4），OpenAI 封装补全模型（如 text-davinci）。" },
      { type: "choice", q: "调用 ChatOpenAI 时传入的消息格式是？", options: ["纯字符串", "SystemMessage/HumanMessage/AIMessage 列表", "字典列表", "JSON 字符串"], answer: 1, stars: 1, explain: "LangChain 使用 SystemMessage、HumanMessage、AIMessage 等消息类型表示对话。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "SystemMessage 用于设定 AI 的角色和行为。", answer: true, stars: 1, explain: "SystemMessage 是系统消息，用于设定 AI 的角色、风格和行为规则。" },
      { type: "judge", q: "HumanMessage 和 AIMessage 可以互相替代。", answer: false, stars: 1, explain: "HumanMessage 表示用户输入，AIMessage 表示 AI 回复，两者角色不同不能替代。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "以下哪个不是 LangChain 的消息类型？", options: ["SystemMessage", "HumanMessage", "AIMessage", "DatabaseMessage"], answer: 3, stars: 1, explain: "LangChain 没有 DatabaseMessage，消息类型包括 SystemMessage、HumanMessage、AIMessage、FunctionMessage 等。" },
      { type: "choice", q: "关于上下文窗口（context window），说法正确的是？", options: ["输入 token 不受限制", "输入+输出 token 总和不能超过模型上下文窗口", "只有输入受限制", "上下文窗口不影响费用"], answer: 1, stars: 1, explain: "模型有上下文窗口限制，输入和输出 token 总和不能超过该限制，超出会报错或截断。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "LangChain 中表示系统设定的消息类是 ______Message。", answer: "System|system", stars: 1, explain: "SystemMessage 用于设定 AI 的角色和行为规则。" },
      { type: "text", q: "控制生成最大 token 数的参数是 ______。", answer: "max_tokens|maxTokens", stars: 1, explain: "max_tokens 限制模型生成回复的最大 token 数量。" }
    ]}
  ],
  "04-prompt": [
    { slot: "q1", variants: [
      { type: "choice", q: "PromptTemplate 的作用是？", options: ["直接调用 LLM", "创建可复用的提示模板，支持变量插值", "存储对话历史", "连接数据库"], answer: 1, stars: 1, explain: "PromptTemplate 用于创建带有变量占位符的提示模板，调用时传入具体值生成最终 prompt。" },
      { type: "choice", q: "PromptTemplate 中的变量用什么语法表示？", options: ["{{ variable }}", "{variable}", "$variable", "<variable>"], answer: 1, stars: 1, explain: "LangChain PromptTemplate 默认使用 {variable} 语法（f-string 风格）表示变量占位符。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "FewShotPromptTemplate 是什么？", options: ["只包含一个示例的模板", "包含多个示例（few-shot）的提示模板", "不包含示例的模板", "只用于图片的模板"], answer: 1, stars: 1, explain: "FewShotPromptTemplate 通过提供少量示例（few-shot examples）引导模型按期望格式输出。" },
      { type: "choice", q: "OutputParser 的主要作用是？", options: ["解析用户输入", "将 LLM 的文本输出解析为结构化数据", "生成 prompt", "存储数据"], answer: 1, stars: 1, explain: "OutputParser 将 LLM 返回的文本解析为结构化数据（如 JSON、列表、日期等）。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "PromptTemplate 可以包含多个变量。", answer: true, stars: 1, explain: "PromptTemplate 支持多个变量，如 '给{audience}解释{concept}' 包含 audience 和 concept 两个变量。" },
      { type: "judge", q: "Few-shot 示例越多，模型输出质量一定越好。", answer: false, stars: 1, explain: "示例过多会占用大量 token、增加费用，且可能导致模型过度模仿，并非越多越好。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是常见的 OutputParser？（多选）", options: ["StructuredOutputParser", "PydanticOutputParser", "CommaSeparatedListOutputParser", "DatabaseOutputParser"], answer: [0,1,2], stars: 2, explain: "StructuredOutputParser、PydanticOutputParser、CommaSeparatedListOutputParser 都是常见的 OutputParser；没有 DatabaseOutputParser。" },
      { type: "multi", q: "好的 Prompt 应该具备哪些要素？（多选）", options: ["清晰的角色设定", "明确的任务描述", "期望的输出格式", "大量无关背景"], answer: [0,1,2], stars: 2, explain: "好的 prompt 应包含角色、任务、输出格式，无关背景会干扰模型，应精简。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "PydanticOutputParser 的特点是？", options: ["只能输出字符串", "基于 Pydantic 模型将输出解析为强类型对象", "不支持嵌套结构", "只能用于数字"], answer: 1, stars: 1, explain: "PydanticOutputParser 基于 Pydantic 模型，将 LLM 输出解析为类型安全的 Python 对象，支持嵌套。" },
      { type: "choice", q: "要从 PromptTemplate 生成最终 prompt，调用的方法是？", options: [".format()", ".generate()", ".run()", ".invoke()"], answer: 0, stars: 1, explain: "PromptTemplate 通过 .format(variable=value) 方法生成最终的 prompt 字符串。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "PromptTemplate 中变量占位符使用的语法是 ______（用花括号）。", answer: "{variable}|{ }", stars: 1, explain: "LangChain 默认使用 {variable} 语法表示 prompt 中的变量。" },
      { type: "text", q: "提供少量示例引导模型输出的模板叫 ______PromptTemplate。", answer: "FewShot|fewshot|few-shot", stars: 1, explain: "FewShotPromptTemplate 通过 few-shot 示例引导模型。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 PydanticOutputParser，下列说法错误的是？", options: ["需要定义 Pydantic 模型", "可以生成格式说明注入 prompt", "解析失败时会抛出异常", "不需要 LLM 输出 JSON"], answer: 3, stars: 1, explain: "PydanticOutputParser 需要 LLM 输出符合 JSON 格式的文本，然后解析为 Pydantic 对象。" },
      { type: "choice", q: "PromptTemplate 的 input_variables 属性表示？", options: ["模板的输入类型", "模板中使用的变量名列表", "模板的输出", "模板的版本"], answer: 1, stars: 1, explain: "input_variables 是模板中所有变量名的列表，调用 format 时必须提供这些变量。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "OutputParser 可以处理 LLM 输出格式不符合预期的情况。", answer: true, stars: 1, explain: "OutputParser 通常有修复机制（如 OutputFixingParser、RetryOutputParser）来处理格式错误的输出。" },
      { type: "judge", q: "PromptTemplate 的变量名可以和 Python 关键字重名。", answer: false, stars: 1, explain: "虽然可以使用，但建议避免与 Python 关键字重名，以免造成混淆和错误。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "ChatPromptTemplate 与 PromptTemplate 的区别是？", options: ["没有区别", "ChatPromptTemplate 用于聊天消息列表，PromptTemplate 用于纯文本", "PromptTemplate 更高级", "ChatPromptTemplate 不支持变量"], answer: 1, stars: 1, explain: "ChatPromptTemplate 构造 SystemMessage/HumanMessage 等消息列表，PromptTemplate 构造纯文本 prompt。" },
      { type: "choice", q: "MessagesPlaceholder 的作用是？", options: ["占位一条消息", "占位一组消息（如历史对话）", "占位系统消息", "占位变量"], answer: 1, stars: 1, explain: "MessagesPlaceholder 用于在聊天模板中占位一组消息，常用于插入对话历史。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "基于 Pydantic 模型解析 LLM 输出的 Parser 是 ______OutputParser。", answer: "Pydantic|pydantic", stars: 1, explain: "PydanticOutputParser 基于 Pydantic 模型解析输出。" },
      { type: "text", q: "用于聊天消息的模板类是 ______PromptTemplate。", answer: "Chat|chat", stars: 1, explain: "ChatPromptTemplate 用于构造聊天消息列表。" }
    ]}
  ],
  "05-chain": [
    { slot: "q1", variants: [
      { type: "choice", q: "LangChain 中 Chain 的核心思想是？", options: ["数据加密", "将多个组件按顺序链接执行", "网络请求", "数据库查询"], answer: 1, stars: 1, explain: "Chain 将 Prompt、LLM、Parser 等组件链接在一起，按顺序执行形成完整流程。" },
      { type: "choice", q: "LLMChain 由哪几个核心组件组成？", options: ["Prompt + LLM + 可选 OutputParser", "Memory + Retriever", "Tool + Agent", "VectorStore + Embedding"], answer: 0, stars: 1, explain: "LLMChain = PromptTemplate + LLM +（可选）OutputParser，是最基本的链。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "SequentialChain 的作用是？", options: ["并行执行多个链", "按顺序串联多个链，前一个输出作为后一个输入", "随机选择一个链执行", "只执行第一个链"], answer: 1, stars: 1, explain: "SequentialChain 按顺序串联多个链，将前一个链的输出作为后一个链的输入。" },
      { type: "choice", q: "RouterChain 的作用是？", options: ["固定路由到一个链", "根据输入动态选择合适的子链执行", "同时执行所有链", "不执行任何链"], answer: 1, stars: 1, explain: "RouterChain 根据输入内容动态路由到最合适的子链处理。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "LLMChain 的输出总是字符串。", answer: false, stars: 1, explain: "如果配置了 OutputParser，LLMChain 的输出可以是解析后的结构化对象，不一定是字符串。" },
      { type: "judge", q: "SimpleSequentialChain 只传递一个变量在链之间。", answer: true, stars: 1, explain: "SimpleSequentialChain 中每个链只有一个输入输出，前一个输出直接作为后一个输入。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是 LangChain 的 Chain 类型？（多选）", options: ["LLMChain", "SequentialChain", "RouterChain", "DatabaseChain"], answer: [0,1,2], stars: 2, explain: "LLMChain、SequentialChain、RouterChain 都是 LangChain 的 Chain 类型，DatabaseChain 不是标准名称。" },
      { type: "multi", q: "使用 Chain 相比直接调用 LLM 的优势有？（多选）", options: ["可组合性强", "支持复杂工作流", "便于复用和维护", "完全不需要 prompt"], answer: [0,1,2], stars: 2, explain: "Chain 提供可组合、可复用的工作流，但仍需要 prompt 来引导 LLM。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "在新版 LangChain（LCEL）中，推荐用什么替代传统的 LLMChain？", options: ["pipe 操作符 | 组合 Runnable", "继续用 LLMChain", "用 SQL 查询", "用 Bash 命令"], answer: 0, stars: 1, explain: "LCEL 推荐使用 pipe 操作符（|）将 prompt | llm | parser 等 Runnable 组合起来。" },
      { type: "choice", q: "LCEL 中组合 prompt 和 llm 的写法是？", options: ["prompt + llm", "prompt | llm", "prompt & llm", "prompt -> llm"], answer: 1, stars: 1, explain: "LCEL 使用 | 操作符组合 Runnable，如 prompt | llm。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "按顺序串联多个链，前一个输出作为后一个输入的链叫 ______Chain。", answer: "Sequential|sequential", stars: 1, explain: "SequentialChain 按顺序串联多个链。" },
      { type: "text", q: "LCEL 中组合 Runnable 的操作符是 ______。", answer: "|", stars: 1, explain: "LCEL 使用管道符 | 组合 Runnable 组件。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "TransformChain 的作用是？", options: ["转换数据格式，不调用 LLM", "转换 LLM 模型", "转换数据库", "转换图片"], answer: 0, stars: 1, explain: "TransformChain 对输入进行自定义函数转换，不涉及 LLM 调用，常用于数据预处理。" },
      { type: "choice", q: "关于 SequentialChain 的 input/output key，说法正确的是？", options: ["所有链必须有相同的 key", "需要显式声明每个链的 input_keys 和 output_keys", "不能有多个 key", "key 会自动生成"], answer: 1, stars: 1, explain: "SequentialChain 需要显式声明每个子链的 input_keys 和 output_keys，以便正确传递数据。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "RouterChain 可以根据输入内容动态选择处理链。", answer: true, stars: 1, explain: "RouterChain 正是通过分析输入来决定将请求路由到哪个子链。" },
      { type: "judge", q: "在 LCEL 中，prompt | llm 这种写法是错误的。", answer: false, stars: 1, explain: "prompt | llm 是 LCEL 的标准写法，表示将 prompt 的输出传给 llm 处理。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LLMChain 调用时传入的参数名应该与什么一致？", options: ["PromptTemplate 的变量名", "LLM 的参数名", "Parser 的字段名", "任意名称"], answer: 0, stars: 1, explain: "LLMChain 的输入参数名应与 PromptTemplate 中定义的变量名一致。" },
      { type: "choice", q: "以下哪个不是 Chain 的执行方法？", options: [".run()", ".invoke()", ".predict()", ".execute_sql()"], answer: 3, stars: 1, explain: "run、invoke、predict 都是 Chain 的执行方法，execute_sql 不是。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "最基本的链，由 Prompt + LLM 组成的是 ______Chain。", answer: "LLM|llm", stars: 1, explain: "LLMChain 是最基本的链。" },
      { type: "text", q: "根据输入动态选择子链的链叫 ______Chain。", answer: "Router|router", stars: 1, explain: "RouterChain 根据输入路由到合适的子链。" }
    ]}
  ],
  "06-memory": [
    { slot: "q1", variants: [
      { type: "choice", q: "LangChain 中 Memory 的作用是？", options: ["存储文件", "在对话中保持上下文记忆", "加速模型", "加密数据"], answer: 1, stars: 1, explain: "Memory 用于在对话或链的多次调用间保持上下文，使 LLM 具备多轮对话能力。" },
      { type: "choice", q: "ConversationBufferMemory 的特点是？", options: ["只存储最近 N 轮", "存储完整对话历史", "只存储摘要", "不存储任何内容"], answer: 1, stars: 1, explain: "ConversationBufferMemory 存储完整的对话历史，简单直接但会占用越来越多 token。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "ConversationBufferWindowMemory 的作用是？", options: ["存储所有历史", "只保留最近 K 轮对话", "存储对话摘要", "存储关键词"], answer: 1, stars: 1, explain: "ConversationBufferWindowMemory 只保留最近 K 轮对话，控制 token 消耗。" },
      { type: "choice", q: "ConversationSummaryMemory 的特点是？", options: ["逐字存储对话", "用 LLM 生成对话摘要来存储", "不存储任何内容", "只存用户消息"], answer: 1, stars: 1, explain: "ConversationSummaryMemory 用 LLM 将对话历史压缩为摘要，节省 token 但可能丢失细节。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Memory 可以让 Chain 在多次调用间共享上下文。", answer: true, stars: 1, explain: "Memory 的核心作用就是在多次调用间传递和保持上下文信息。" },
      { type: "judge", q: "ConversationBufferMemory 不会消耗过多 token。", answer: false, stars: 1, explain: "ConversationBufferMemory 存储完整历史，对话越长消耗 token 越多，可能超出上下文窗口。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是 LangChain 的 Memory 类型？（多选）", options: ["ConversationBufferMemory", "ConversationSummaryMemory", "ConversationEntityMemory", "FileMemory"], answer: [0,1,2], stars: 2, explain: "前三个都是 LangChain 的 Memory 类型，FileMemory 不是标准 Memory 类型。" },
      { type: "multi", q: "对话记忆需要权衡哪些因素？（多选）", options: ["token 消耗", "信息完整度", "成本", "完全不丢失任何细节"], answer: [0,1,2], stars: 2, explain: "需要在 token 消耗、信息完整度和成本间权衡，完全不丢失细节会导致 token 无限增长。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "ConversationEntityMemory 的特点是？", options: ["存储对话摘要", "提取并存储对话中提到的实体信息", "只存最近一轮", "存储所有原文"], answer: 1, stars: 1, explain: "ConversationEntityMemory 使用 LLM 提取对话中的实体（人名、地名等）及其关系。" },
      { type: "choice", q: "要控制长对话的 token 消耗，最合适的 Memory 是？", options: ["ConversationBufferMemory", "ConversationSummaryMemory", "不使用 Memory", "只存系统消息"], answer: 1, stars: 1, explain: "ConversationSummaryMemory 通过摘要压缩历史，有效控制 token 消耗。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "存储完整对话历史的记忆类是 Conversation______Memory。", answer: "Buffer|buffer", stars: 1, explain: "ConversationBufferMemory 存储完整对话历史。" },
      { type: "text", q: "只保留最近 K 轮对话的记忆类是 ConversationBuffer______Memory。", answer: "Window|window", stars: 1, explain: "ConversationBufferWindowMemory 保留最近 K 轮对话。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "Memory 中的 return_messages 参数控制？", options: ["是否返回消息对象列表", "是否返回摘要", "是否返回 token 数", "是否返回错误"], answer: 0, stars: 1, explain: "return_messages=True 时返回消息对象列表，False 时返回拼接的字符串。" },
      { type: "choice", q: "关于 ConversationKnowledgeGraphMemory，说法正确的是？", options: ["存储对话摘要", "以知识图谱形式存储实体和关系", "只存用户消息", "不消耗额外 token"], answer: 1, stars: 1, explain: "ConversationKnowledgeGraphMemory 用知识图谱存储实体及其关系，适合复杂实体推理。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Memory 只用于对话场景，不能用于普通 Chain。", answer: false, stars: 1, explain: "Memory 不仅用于对话，也可以为普通 Chain 提供上下文记忆能力。" },
      { type: "judge", q: "ConversationSummaryMemory 需要额外调用 LLM 来生成摘要。", answer: true, stars: 1, explain: "ConversationSummaryMemory 使用 LLM 生成和更新摘要，会增加额外的 LLM 调用和费用。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LangChain 中 Memory 的基类是？", options: ["BaseMemory", "Memory", "ConversationMemory", "ChatMemory"], answer: 0, stars: 1, explain: "BaseMemory 是所有 Memory 的基类，定义了 load_memory_variables 和 save_context 等接口。" },
      { type: "choice", q: "在 LCEL 中实现记忆，推荐的方式是？", options: ["使用 ConversationBufferMemory", "使用 RunnableWithMessageHistory 包装链", "手动管理历史", "无法实现"], answer: 1, stars: 1, explain: "LCEL 推荐使用 RunnableWithMessageHistory 来为链添加消息历史管理。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "用 LLM 生成对话摘要的记忆类是 Conversation______Memory。", answer: "Summary|summary", stars: 1, explain: "ConversationSummaryMemory 用摘要存储对话历史。" },
      { type: "text", q: "Memory 保存上下文的方法是 save______。", answer: "context|Context", stars: 1, explain: "save_context(inputs, outputs) 方法用于保存对话上下文。" }
    ]}
  ],
  "07-data": [
    { slot: "q1", variants: [
      { type: "choice", q: "Document Loader 的作用是？", options: ["加载模型", "从各种数据源加载文档并转为 Document 对象", "加载 CSS", "加载图片"], answer: 1, stars: 1, explain: "Document Loader 从文件、网页、数据库等数据源加载内容，转换为 LangChain 的 Document 对象。" },
      { type: "choice", q: "LangChain 中 Document 对象的两个核心字段是？", options: ["title 和 author", "page_content 和 metadata", "url 和 date", "id 和 type"], answer: 1, stars: 1, explain: "Document 对象包含 page_content（文本内容）和 metadata（元数据字典）两个核心字段。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "Text Splitter 的作用是？", options: ["分割代码文件", "将长文档切分为较小的文本块（chunks）", "分割数据库", "分割网络请求"], answer: 1, stars: 1, explain: "Text Splitter 将长文档切分为较小的 chunks，便于向量化和检索。" },
      { type: "choice", q: "RecursiveCharacterTextSplitter 的切分策略是？", options: ["按固定字符数切分", "递归地按分隔符列表逐层尝试切分", "按单词切分", "随机切分"], answer: 1, stars: 1, explain: "RecursiveCharacterTextSplitter 按分隔符列表（如换行、段落）递归尝试，尽量在语义边界切分。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Document 的 metadata 可以存储来源、页码等信息。", answer: true, stars: 1, explain: "metadata 是字典，可以存储来源 URL、页码、创建时间等任意元数据。" },
      { type: "judge", q: "Text Splitter 切分的 chunk 越小，检索效果一定越好。", answer: false, stars: 1, explain: "chunk 过小会丢失上下文，过大又影响检索精度和 token 消耗，需要选择合适的 chunk_size。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是常见的 Document Loader？（多选）", options: ["TextLoader", "WebBaseLoader", "PyPDFLoader", "ImageLoader"], answer: [0,1,2], stars: 2, explain: "TextLoader、WebBaseLoader、PyPDFLoader 都是常见 Loader；ImageLoader 不是标准文档加载器。" },
      { type: "multi", q: "选择 chunk_size 和 chunk_overlap 时需要考虑？（多选）", options: ["embedding 模型的上下文限制", "检索精度需求", "token 成本", "越大越好"], answer: [0,1,2], stars: 2, explain: "需要考虑 embedding 限制、检索精度和成本，并非越大越好。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "chunk_overlap 参数的作用是？", options: ["让 chunk 之间有重叠，保持上下文连续性", "减少 chunk 数量", "加快切分速度", "删除重复内容"], answer: 0, stars: 1, explain: "chunk_overlap 让相邻 chunk 有部分重叠，避免重要信息被切断，保持上下文连续。" },
      { type: "choice", q: "PyPDFLoader 用于加载什么类型的文件？", options: ["Word 文档", "PDF 文件", "Excel 表格", "图片"], answer: 1, stars: 1, explain: "PyPDFLoader 专门用于加载 PDF 文件，提取其中的文本内容。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "加载数据源并转为 Document 对象的组件叫 ______。", answer: "Loader|loader|Document Loader", stars: 1, explain: "Document Loader 负责加载数据源。" },
      { type: "text", q: "将长文档切分为小块的组件叫 Text______。", answer: "Splitter|splitter", stars: 1, explain: "Text Splitter 用于切分长文档。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 CharacterTextSplitter，说法正确的是？", options: ["按指定分隔符切分，不考虑语义", "递归切分", "只处理中文", "不支持 overlap"], answer: 0, stars: 1, explain: "CharacterTextSplitter 按指定 separator 简单切分，可能切断句子，RecursiveCharacterTextSplitter 更智能。" },
      { type: "choice", q: "WebBaseLoader 的作用是？", options: ["加载网页内容", "加载本地文件", "加载数据库", "加载 API"], answer: 0, stars: 1, explain: "WebBaseLoader 通过 HTTP 请求加载网页 HTML 并提取文本内容。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Document 对象只能存储纯文本内容。", answer: false, stars: 1, explain: "Document 的 page_content 是文本，但 metadata 可以存储各种结构化信息。" },
      { type: "judge", q: "RecursiveCharacterTextSplitter 是最常用的文本切分器。", answer: true, stars: 1, explain: "RecursiveCharacterTextSplitter 能在语义边界切分，是最常用的通用文本切分器。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LangChain 中加载 HTML 网页并解析的常用 Loader 是？", options: ["BSHTMLLoader / WebBaseLoader", "CSVLoader", "JSONLoader", "SRTLoader"], answer: 0, stars: 1, explain: "BSHTMLLoader（基于 BeautifulSoup）和 WebBaseLoader 用于加载和解析 HTML 网页。" },
      { type: "choice", q: "chunk_size 的单位通常是？", options: ["字节", "字符", "token", "行数"], answer: 1, stars: 1, explain: "TextSplitter 的 chunk_size 默认以字符数为单位（部分实现支持 token 计数）。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "Document 对象存储文本内容的字段是 ______。", answer: "page_content", stars: 1, explain: "page_content 是 Document 的文本内容字段。" },
      { type: "text", q: "让相邻文本块有重叠的参数是 chunk______。", answer: "overlap", stars: 1, explain: "chunk_overlap 设置相邻 chunk 的重叠字符数。" }
    ]}
  ],
  "08-embeddings": [
    { slot: "q1", variants: [
      { type: "choice", q: "Embedding 的作用是？", options: ["加密文本", "将文本转换为高维向量表示", "压缩文本", "翻译文本"], answer: 1, stars: 1, explain: "Embedding 将文本转换为高维向量，语义相近的文本在向量空间中距离也相近。" },
      { type: "choice", q: "向量数据库的主要用途是？", options: ["存储结构化数据", "存储向量并支持相似度搜索", "存储图片", "存储日志"], answer: 1, stars: 1, explain: "向量数据库专门存储 embedding 向量，并支持高效的相似度（最近邻）搜索。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "余弦相似度衡量的是？", options: ["两个向量的绝对距离", "两个向量方向的相似程度", "向量的长度", "向量的维度"], answer: 1, stars: 1, explain: "余弦相似度衡量两个向量方向的夹角，值越接近 1 表示方向越相似、语义越接近。" },
      { type: "choice", q: "OpenAI 的 text-embedding-3-small 输出的向量维度是？", options: ["768", "1536", "3072", "100"], answer: 1, stars: 1, explain: "text-embedding-3-small 默认输出 1536 维向量（可通过 dimensions 参数降低）。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Embedding 向量的维度越高，语义表达能力越强但存储和计算成本也越高。", answer: true, stars: 1, explain: "高维向量能表达更丰富的语义，但存储和相似度计算的成本也更高。" },
      { type: "judge", q: "向量数据库只能用余弦相似度搜索。", answer: false, stars: 1, explain: "向量数据库支持多种相似度度量，如余弦相似度、欧氏距离、内积等。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是常见的向量数据库？（多选）", options: ["Chroma", "Pinecone", "FAISS", "PostgreSQL"], answer: [0,1,2], stars: 2, explain: "Chroma、Pinecone、FAISS 都是向量数据库/库；PostgreSQL 是关系型数据库（虽有 pgvector 扩展）。" },
      { type: "multi", q: "Embedding 可以用于哪些场景？（多选）", options: ["语义搜索", "文本聚类", "推荐系统", "图片压缩"], answer: [0,1,2], stars: 2, explain: "Embedding 用于语义搜索、聚类、推荐等，不用于图片压缩。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "LangChain 中使用 OpenAI Embeddings 的类是？", options: ["OpenAIEmbeddings", "EmbeddingModel", "TextEmbedder", "Vectorizer"], answer: 0, stars: 1, explain: "langchain_openai.OpenAIEmbeddings 用于调用 OpenAI 的 embedding 模型。" },
      { type: "choice", q: "FAISS 是什么？", options: ["云向量数据库服务", "Facebook 开源的向量相似度搜索库", "LangChain 的组件", "数据库管理系统"], answer: 1, stars: 1, explain: "FAISS 是 Facebook 开源的向量相似度搜索库，可在本地高效检索向量。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "将文本转换为向量的过程叫 ______。", answer: "embedding|向量化", stars: 1, explain: "Embedding（向量化）将文本转换为高维向量。" },
      { type: "text", q: "Facebook 开源的本地向量搜索库是 ______。", answer: "FAISS|faiss", stars: 1, explain: "FAISS 是 Facebook 开源的向量相似度搜索库。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 Embedding 模型，说法正确的是？", options: ["不同模型生成的向量可以混用", "同一个 embedding 模型生成的向量才能互相比较", "向量维度可以随意改变", "embedding 不需要 API key"], answer: 1, stars: 1, explain: "只有同一个 embedding 模型生成的向量才在同一向量空间中，可以互相计算相似度。" },
      { type: "choice", q: "Chroma 的特点是？", options: ["只能云端使用", "轻量级本地向量数据库，易于集成", "只支持 OpenAI", "需要付费"], answer: 1, stars: 1, explain: "Chroma 是轻量级的本地向量数据库，易于与 LangChain 集成，适合开发和原型。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "查询文本和文档必须用同一个 embedding 模型生成向量才能正确检索。", answer: true, stars: 1, explain: "必须使用相同的 embedding 模型，查询向量和文档向量才在同一空间，相似度计算才有意义。" },
      { type: "judge", q: "向量数据库中存储的只有向量，不包含原始文本。", answer: false, stars: 1, explain: "向量数据库通常同时存储向量和对应的原始文本及 metadata，以便检索后返回原文。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LangChain 中将 documents 和 embeddings 存入向量数据库的方法是？", options: ["VectorStore.from_documents()", "VectorStore.save()", "VectorStore.insert()", "VectorStore.push()"], answer: 0, stars: 1, explain: "VectorStore.from_documents(documents, embeddings) 是创建向量库的常用方法。" },
      { type: "choice", q: "向量数据库的 similarity_search 方法返回的是？", options: ["向量本身", "最相似的 Document 列表", "相似度分数", "数据库路径"], answer: 1, stars: 1, explain: "similarity_search 返回与查询最相似的 Document 对象列表。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "OpenAI 的 embedding 模型类是 ______Embeddings。", answer: "OpenAI", stars: 1, explain: "OpenAIEmbeddings 调用 OpenAI 的 embedding 模型。" },
      { type: "text", q: "向量数据库中按相似度搜索的方法是 ______search。", answer: "similarity", stars: 1, explain: "similarity_search 方法执行相似度搜索。" }
    ]}
  ],
  "09-rag": [
    { slot: "q1", variants: [
      { type: "choice", q: "RAG 的全称是？", options: ["Retrieval-Augmented Generation", "Random Access Generation", "Recursive Algorithm Generator", "Resource Allocation Graph"], answer: 0, stars: 1, explain: "RAG 即 Retrieval-Augmented Generation（检索增强生成），结合检索和生成来回答问题。" },
      { type: "choice", q: "RAG 的主要解决的问题是？", options: ["LLM 训练慢", "LLM 知识过时和幻觉问题", "LLM 价格高", "LLM 安装难"], answer: 1, stars: 1, explain: "RAG 通过检索外部知识补充 LLM，解决知识过时和幻觉（编造信息）问题。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "RAG 的典型流程顺序是？", options: ["生成→检索→回答", "检索→增强→生成", "存储→生成→检索", "提问→训练→回答"], answer: 1, stars: 1, explain: "RAG 流程：用户提问 → 检索相关文档 → 将检索结果与问题一起传给 LLM → 生成回答。" },
      { type: "choice", q: "RAG 中 '增强（Augmented）' 指的是？", options: ["增强 LLM 模型参数", "用检索到的知识增强 prompt", "增强硬件性能", "增强数据库"], answer: 1, stars: 1, explain: "Augmented 指将检索到的相关文档内容加入 prompt，增强 LLM 的上下文信息。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "RAG 需要对 LLM 进行微调。", answer: false, stars: 1, explain: "RAG 不需要微调 LLM，通过检索外部知识并注入 prompt 即可，这是其核心优势。" },
      { type: "judge", q: "RAG 可以让 LLM 基于私有知识库回答问题。", answer: true, stars: 1, explain: "RAG 可以连接私有知识库（企业文档等），让 LLM 基于私有数据回答，且无需训练。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "RAG 的核心步骤包括？（多选）", options: ["文档加载与切分", "向量化并存入向量库", "检索相关文档", "将检索结果注入 prompt 生成回答"], answer: [0,1,2,3], stars: 2, explain: "RAG 的核心步骤：加载切分文档 → 向量化存储 → 检索相关文档 → 注入 prompt 生成回答。" },
      { type: "multi", q: "RAG 相比微调（Fine-tuning）的优势有？（多选）", options: ["不需要重新训练", "知识可以实时更新", "成本更低", "完全不需要 LLM"], answer: [0,1,2], stars: 2, explain: "RAG 无需训练、知识可实时更新、成本低，但仍需要 LLM 来生成回答。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "LangChain 中 RetrievalQA 链的作用是？", options: ["直接调用 LLM 回答", "结合 Retriever 检索文档并生成回答", "只检索不生成", "存储文档"], answer: 1, stars: 1, explain: "RetrievalQA 将检索器和 LLM 结合，先检索相关文档再生成回答。" },
      { type: "choice", q: "RAG 中检索到的文档如何传给 LLM？", options: ["作为 system message", "拼接到 prompt 中作为上下文", "作为图片", "通过 API 单独传"], answer: 1, stars: 1, explain: "检索到的文档文本会被拼接到 prompt 中，作为上下文提供给 LLM。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "RAG 的中文全称是 ______。", answer: "检索增强生成", stars: 1, explain: "RAG 即检索增强生成。" },
      { type: "text", q: "RAG 中连接检索器和 LLM 的链是 ______QA。", answer: "Retrieval", stars: 1, explain: "RetrievalQA 链结合检索器和 LLM。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 RAG 中的 chunk 大小，说法正确的是？", options: ["越小越好", "越大越好", "需要平衡检索精度和上下文完整性", "chunk 大小不影响效果"], answer: 2, stars: 1, explain: "chunk 太小丢失上下文，太大引入噪声和高成本，需要平衡。" },
      { type: "choice", q: "RAG 系统中，query 也需要做 embedding 吗？", options: ["需要，用同一个 embedding 模型", "不需要", "用不同的模型", "只对文档做"], answer: 0, stars: 1, explain: "query 也需要用同一个 embedding 模型向量化，才能与文档向量计算相似度。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "RAG 完全消除了 LLM 的幻觉问题。", answer: false, stars: 1, explain: "RAG 显著减少幻觉，但不能完全消除，LLM 仍可能基于检索内容生成不准确的回答。" },
      { type: "judge", q: "RAG 的回答可以溯源到原始文档。", answer: true, stars: 1, explain: "RAG 可以返回检索到的源文档，实现回答溯源，这是其重要优势。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "RetrievalQA 的 chain_type 为 'stuff' 时表示？", options: ["将所有检索文档塞入 prompt", "逐个文档处理后汇总", "只取第一个文档", "不使用文档"], answer: 0, stars: 1, explain: "stuff 模式将所有检索到的文档全部塞入 prompt，简单但受上下文窗口限制。" },
      { type: "choice", q: "当检索文档太多超过上下文窗口时，不适合用哪种 chain_type？", options: ["stuff", "map_reduce", "refine", "map_rerank"], answer: 0, stars: 1, explain: "stuff 把所有文档塞入 prompt，文档多时会超出上下文窗口，此时应用 map_reduce 等。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "RAG 中将所有检索文档塞入 prompt 的 chain_type 是 ______。", answer: "stuff", stars: 1, explain: "stuff 模式将所有文档塞入 prompt。" },
      { type: "text", q: "RAG 中获取相关文档的组件叫 ______。", answer: "Retriever|retriever", stars: 1, explain: "Retriever（检索器）负责获取相关文档。" }
    ]}
  ],
  "10-retriever": [
    { slot: "q1", variants: [
      { type: "choice", q: "Retriever 的接口方法 get_relevant_documents 返回的是？", options: ["字符串列表", "Document 列表", "向量列表", "分数列表"], answer: 1, stars: 1, explain: "get_relevant_documents 返回与查询最相关的 Document 对象列表。" },
      { type: "choice", q: "VectorStoreRetriever 的 search_type='similarity' 表示？", options: ["按相似度检索", "按 MMR 检索", "按关键词检索", "随机检索"], answer: 0, stars: 1, explain: "similarity 按向量相似度检索最相关的文档。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "MMR（Maximal Marginal Relevance）检索的目标是？", options: ["只找最相似的", "在相关性和多样性之间平衡", "找最不相似的", "找最长的文档"], answer: 1, stars: 1, explain: "MMR 在保证相关性的同时增加结果多样性，避免返回内容高度重复的文档。" },
      { type: "choice", q: "MultiQueryRetriever 的作用是？", options: ["用多个查询同时检索", "用 LLM 生成多个不同角度的查询来检索", "检索多个数据库", "返回多个答案"], answer: 1, stars: 1, explain: "MultiQueryRetriever 用 LLM 从不同角度生成多个查询，分别检索后合并结果，提升召回率。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "检索的 k 值越大，返回结果越多，质量一定越高。", answer: false, stars: 1, explain: "k 过大会引入不相关文档，增加噪声和 token 消耗，需要选择合适的 k。" },
      { type: "judge", q: "MMR 检索可以提高结果的多样性。", answer: true, stars: 1, explain: "MMR 通过惩罚与已选文档相似的文档来提升多样性。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是常见的检索策略？（多选）", options: ["相似度检索 (similarity)", "MMR 检索", "MultiQuery 检索", "SQL 检索"], answer: [0,1,2], stars: 2, explain: "similarity、MMR、MultiQuery 都是常见检索策略，SQL 检索是数据库查询不是向量检索策略。" },
      { type: "multi", q: "提升 RAG 检索质量的方法有？（多选）", options: ["调整 chunk 大小", "使用重排序（rerank）", "使用 MMR 增加多样性", "减少文档数量到 0"], answer: [0,1,2], stars: 2, explain: "调整 chunk、rerank、MMR 都能提升检索质量，减少文档到 0 显然不可行。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "ContextualCompressionRetriever 的作用是？", options: ["压缩检索到的文档，只保留与查询相关的片段", "压缩向量维度", "压缩数据库大小", "压缩图片"], answer: 0, stars: 1, explain: "ContextualCompressionRetriever 用 LLM/embedding 压缩检索结果，只保留与查询相关的片段。" },
      { type: "choice", q: "EnsembleRetriever 的作用是？", options: ["组合多个检索器的结果", "只使用一个检索器", "检索Ensemble 模型", "检索音乐"], answer: 0, stars: 1, explain: "EnsembleRetriever 组合多个检索器（如 BM25 + 向量检索）的结果，取长补短。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "在相关性和多样性间平衡的检索算法是 ______。", answer: "MMR|mmr|Maximal Marginal Relevance", stars: 1, explain: "MMR 平衡相关性和多样性。" },
      { type: "text", q: "用 LLM 生成多个角度查询的检索器是 ______Retriever。", answer: "MultiQuery", stars: 1, explain: "MultiQueryRetriever 生成多个查询来提升召回。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "BM25 检索属于哪种检索方式？", options: ["向量语义检索", "关键词稀疏检索", "图片检索", "音频检索"], answer: 1, stars: 1, explain: "BM25 是基于关键词匹配的稀疏检索算法，与向量语义检索互补。" },
      { type: "choice", q: "重排序（rerank）的作用是？", options: ["对初检结果重新排序，提升精度", "增加检索数量", "减少文档数量", "改变 embedding 模型"], answer: 0, stars: 1, explain: "rerank 用更强的模型对初检结果重新打分排序，提升最终检索精度。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "向量检索和关键词检索可以结合使用。", answer: true, stars: 1, explain: "混合检索（如 EnsembleRetriever 结合 BM25 和向量检索）可以兼顾关键词精确匹配和语义理解。" },
      { type: "judge", q: "检索器返回的文档数量越多，LLM 回答质量越高。", answer: false, stars: 1, explain: "过多文档会引入噪声、超出上下文窗口、增加成本，适量且相关才好。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "search_kwargs={'k': 5} 中的 k 表示？", options: ["返回前 5 个最相关文档", "检索 5 次", "使用 5 个模型", "跳过前 5 个"], answer: 0, stars: 1, explain: "k 表示返回的最相关文档数量。" },
      { type: "choice", q: "ParentDocumentRetriever 的核心思想是？", options: ["检索小 chunk 但返回其所属的大文档", "只检索父文档", "检索父目录", "检索数据库"], answer: 0, stars: 1, explain: "ParentDocumentRetriever 将文档切成小 chunk 用于精确检索，但返回该 chunk 所属的完整父文档，兼顾精度和上下文。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "对初检结果重新打分排序的技术叫 ______。", answer: "rerank|重排序|重排", stars: 1, explain: "rerank（重排序）提升检索精度。" },
      { type: "text", q: "基于关键词匹配的经典检索算法是 ______。", answer: "BM25|bm25", stars: 1, explain: "BM25 是常用的关键词检索算法。" }
    ]}
  ],
  "11-agent": [
    { slot: "q1", variants: [
      { type: "choice", q: "LangChain 中 Agent 的核心能力是？", options: ["只回答问题", "自主规划并使用工具完成任务", "存储数据", "生成图片"], answer: 1, stars: 1, explain: "Agent 能够自主规划任务、选择并调用工具、观察结果并迭代，直到完成目标。" },
      { type: "choice", q: "ReAct 模式中的 Re 和 Act 分别指？", options: ["Read 和 Action", "Reasoning 和 Acting", "Request 和 Accept", "Return 和 Act"], answer: 1, stars: 1, explain: "ReAct = Reasoning（推理）+ Acting（行动），Agent 交替进行推理和采取行动。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "AgentExecutor 的作用是？", options: ["定义工具", "执行 Agent 的思考-行动循环直到完成", "存储对话", "训练模型"], answer: 1, stars: 1, explain: "AgentExecutor 负责驱动 Agent 的思考-行动循环，调用工具并将结果反馈给 Agent。" },
      { type: "choice", q: "Agent 与 Chain 的主要区别是？", options: ["没有区别", "Chain 是固定流程，Agent 可自主决策使用哪些工具", "Agent 更快", "Chain 更智能"], answer: 1, stars: 1, explain: "Chain 按固定顺序执行，Agent 则根据 LLM 的决策自主选择工具和步骤，更灵活。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Agent 可以调用多个工具来完成复杂任务。", answer: true, stars: 1, explain: "Agent 的核心能力就是自主选择和调用多个工具，分步完成复杂任务。" },
      { type: "judge", q: "Agent 的行为是完全确定的，每次执行结果都一样。", answer: false, stars: 1, explain: "Agent 的决策依赖 LLM，具有不确定性，相同输入可能产生不同的执行路径。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是常见的 Agent 类型？（多选）", options: ["zero-shot-react-description", "react-docstore", "self-ask-with-search", "sql-agent"], answer: [0,1,2], stars: 2, explain: "前三个都是 LangChain 中的 Agent 类型，sql-agent 不是标准 Agent 类型名称。" },
      { type: "multi", q: "Agent 完成任务需要哪些要素？（多选）", options: ["LLM 作为大脑", "Tools 作为手脚", "Prompt 引导行为", "不需要任何工具"], answer: [0,1,2], stars: 2, explain: "Agent 需要 LLM 决策、Tools 执行、Prompt 引导，工具是必需的。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "zero-shot-react-description Agent 的特点是？", options: ["需要少量示例", "不需要示例，直接根据工具描述推理使用", "只能用一个工具", "不调用 LLM"], answer: 1, stars: 1, explain: "zero-shot-react-description 不需要 few-shot 示例，直接根据工具描述决定如何使用。" },
      { type: "choice", q: "Agent 的 max_iterations 参数控制？", options: ["最大 token 数", "最大思考-行动循环次数，防止无限循环", "最大工具数", "最大输入长度"], answer: 1, stars: 1, explain: "max_iterations 限制 Agent 的循环次数，防止陷入无限循环消耗资源。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "Agent 中推理与行动交替的模式叫 ______ 模式。", answer: "ReAct|react", stars: 1, explain: "ReAct 模式交替进行推理和行动。" },
      { type: "text", q: "执行 Agent 思考-行动循环的类是 Agent______。", answer: "Executor", stars: 1, explain: "AgentExecutor 驱动 Agent 的执行循环。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于 Plan-and-Execute Agent，说法正确的是？", options: ["先制定完整计划再逐步执行", "每步都重新规划", "不使用工具", "只执行一次"], answer: 0, stars: 1, explain: "Plan-and-Execute 先让 LLM 制定完整计划，然后逐步执行，适合复杂多步任务。" },
      { type: "choice", q: "Agent 中 early_stopping_method='generate' 的作用是？", options: ["在达到最大迭代时让 LLM 生成最终答案", "立即停止", "重新开始", "报错"], answer: 0, stars: 1, explain: "generate 方式在达到最大迭代时，让 LLM 根据已有信息生成最终答案，而不是直接报错。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Agent 比 Chain 更适合处理不确定、需要动态决策的任务。", answer: true, stars: 1, explain: "Agent 能根据中间结果动态调整策略，适合复杂、动态的任务；Chain 适合固定流程。" },
      { type: "judge", q: "Agent 的工具调用结果不会返回给 LLM。", answer: false, stars: 1, explain: "工具调用结果（Observation）会返回给 LLM，作为下一步推理的依据，这是 ReAct 循环的关键。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LangGraph 相比传统 AgentExecutor 的优势是？", options: ["支持更复杂的状态管理和循环控制", "完全不需要 LLM", "只能线性执行", "不需要工具"], answer: 0, stars: 1, explain: "LangGraph 提供显式的状态图和循环控制，适合构建复杂的、有状态的多 Agent 工作流。" },
      { type: "choice", q: "Agent 的 handle_parsing_errors=True 的作用是？", options: ["解析错误时让 LLM 自行修正", "直接报错", "忽略错误", "删除工具"], answer: 0, stars: 1, explain: "handle_parsing_errors 在 LLM 输出格式错误时，将错误信息反馈给 LLM 让其修正。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "先制定计划再执行的 Agent 类型是 ______-and-Execute。", answer: "Plan", stars: 1, explain: "Plan-and-Execute 先规划再执行。" },
      { type: "text", q: "构建有状态多 Agent 工作流的库是 ______。", answer: "LangGraph|langgraph", stars: 1, explain: "LangGraph 用于构建复杂有状态的 Agent 工作流。" }
    ]}
  ],
  "12-tools": [
    { slot: "q1", variants: [
      { type: "choice", q: "LangChain 中 Tool 的作用是？", options: ["装饰页面", "让 Agent 能调用的外部功能（函数、API）", "存储数据", "训练模型"], answer: 1, stars: 1, explain: "Tool 封装了 Agent 可以调用的外部功能，如搜索、计算、数据库查询等。" },
      { type: "choice", q: "定义 Tool 时必须提供的是？", options: ["name、description、func", "只需要 func", "只需要 name", "不需要任何东西"], answer: 0, stars: 1, explain: "Tool 需要 name（名称）、description（描述，供 LLM 理解何时使用）、func（执行函数）。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "StructuredTool 的优势是？", options: ["支持多个结构化参数输入", "只能接受字符串", "不需要 description", "执行更快"], answer: 0, stars: 1, explain: "StructuredTool 支持通过 Pydantic 模型定义多个结构化参数，比普通 Tool 更灵活。" },
      { type: "choice", q: "Function Calling 的作用是？", options: ["让 LLM 直接调用本地函数", "让 LLM 输出结构化的函数调用参数，由程序执行", "替代 LLM", "加密函数"], answer: 1, stars: 1, explain: "Function Calling 让 LLM 输出结构化的函数名和参数，由程序实际执行函数，再将结果返回 LLM。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "Tool 的 description 写得越清楚，LLM 越能正确选择和使用工具。", answer: true, stars: 1, explain: "description 是 LLM 决策的重要依据，清晰的描述能帮助 LLM 正确选择工具。" },
      { type: "judge", q: "Tool 可以是任意 Python 函数，不需要任何封装。", answer: false, stars: 1, explain: "Tool 需要用 @tool 装饰器或 Tool/StructuredTool 类封装，提供 name 和 description。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是 LangChain 内置的工具？（多选）", options: ["SerpAPI 搜索", "Python REPL", "SQLDatabase", "ImageEditor"], answer: [0,1,2], stars: 2, explain: "SerpAPI、Python REPL、SQLDatabase 都是 LangChain 内置工具；ImageEditor 不是标准内置工具。" },
      { type: "multi", q: "自定义 Tool 需要注意什么？（多选）", options: ["清晰的 description", "明确的输入输出", "错误处理", "函数名越长越好"], answer: [0,1,2], stars: 2, explain: "需要清晰描述、明确输入输出、错误处理，函数名简洁有意义即可，不是越长越好。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "用 @tool 装饰器装饰函数后，函数名会成为？", options: ["Tool 的 name", "Tool 的 description", "Tool 的输入", "无意义"], answer: 0, stars: 1, explain: "@tool 装饰器默认将函数名作为 Tool 的 name，函数 docstring 作为 description。" },
      { type: "choice", q: "Tool 的 args_schema 参数用于？", options: ["定义工具的输入参数 schema（Pydantic 模型）", "定义输出格式", "定义工具颜色", "定义工具版本"], answer: 0, stars: 1, explain: "args_schema 用 Pydantic 模型定义工具的输入参数结构，使 LLM 能正确生成参数。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "封装 Agent 可调用功能的组件叫 ______。", answer: "Tool|tool", stars: 1, explain: "Tool 是 Agent 可调用的功能封装。" },
      { type: "text", q: "支持多个结构化参数的工具类是 ______Tool。", answer: "Structured", stars: 1, explain: "StructuredTool 支持结构化参数输入。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "PythonREPL 工具的作用是？", options: ["执行 Python 代码并返回结果", "编译 C++", "运行 shell 命令", "发送邮件"], answer: 0, stars: 1, explain: "PythonREPL 工具允许 Agent 执行 Python 代码，常用于数学计算、数据处理等。" },
      { type: "choice", q: "关于 Tool 的输入，说法正确的是？", options: ["只能是字符串", "可以是字符串或结构化对象", "只能是数字", "不能有输入"], answer: 1, stars: 1, explain: "普通 Tool 接受字符串输入，StructuredTool 接受结构化对象输入。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "Function Calling 中，LLM 真正执行了函数。", answer: false, stars: 1, explain: "LLM 只输出函数名和参数，实际执行由程序完成，再把结果返回 LLM。" },
      { type: "judge", q: "Tool 的 description 对 LLM 正确使用工具非常重要。", answer: true, stars: 1, explain: "LLM 通过 description 理解工具的用途和使用场景，是正确决策的关键。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "将多个工具组合成一个工具集传递给 Agent 的方式是？", options: ["tools=[tool1, tool2]", "tools = tool1 + tool2", "tools = {tool1, tool2}", "无法组合"], answer: 0, stars: 1, explain: "通过 tools=[tool1, tool2, ...] 列表将多个工具传递给 Agent。" },
      { type: "choice", q: "Tool 中 return_direct=True 的作用是？", options: ["工具结果直接作为最终答案返回", "工具不返回结果", "工具返回结果给 LLM 再处理", "工具循环执行"], answer: 0, stars: 1, explain: "return_direct=True 时，工具执行结果直接返回给用户，不再经过 LLM 处理。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "用装饰器定义工具的关键字是 @______。", answer: "tool", stars: 1, explain: "@tool 装饰器将函数封装为 Tool。" },
      { type: "text", q: "让 LLM 输出结构化函数调用的技术叫 ______ Calling。", answer: "Function|function", stars: 1, explain: "Function Calling 让 LLM 输出结构化的函数调用。" }
    ]}
  ],
  "13-lcel": [
    { slot: "q1", variants: [
      { type: "choice", q: "LCEL 中组合组件的操作符是？", options: ["+", "|", "&", "->"], answer: 1, stars: 1, explain: "LCEL 使用 |（管道）操作符组合 Runnable 组件，如 prompt | llm | parser。" },
      { type: "choice", q: "LCEL 中所有可组合组件都实现了什么接口？", options: ["Runnable", "Chainable", "Pipeable", "Composable"], answer: 0, stars: 1, explain: "LCEL 的组件都实现了 Runnable 接口，支持 invoke、stream、batch 等方法。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "Runnable 的 invoke 方法用于？", options: ["流式输出", "同步执行并返回结果", "批量执行", "异步执行"], answer: 1, stars: 1, explain: "invoke 同步执行 Runnable 并返回结果；stream 用于流式输出，batch 用于批量。" },
      { type: "choice", q: "LCEL 中 RunnablePassthrough 的作用是？", options: ["将输入原样传递到输出", "加密数据", "过滤数据", "停止执行"], answer: 0, stars: 1, explain: "RunnablePassthrough 将输入原样传递，常用于在链中保留原始输入供后续使用。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "LCEL 链支持流式输出（stream）。", answer: true, stars: 1, explain: "LCEL 原生支持 stream 方法，可以逐步获取 LLM 的输出 token。" },
      { type: "judge", q: "LCEL 中的 | 操作符会立即执行链。", answer: false, stars: 1, explain: "| 只是组合链（构建执行图），不会立即执行，需要调用 invoke/stream 等方法才执行。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "LCEL 相比传统 Chain 的优势有？（多选）", options: ["流式输出支持", "异步支持", "更好的可观测性", "完全不需要 LLM"], answer: [0,1,2], stars: 2, explain: "LCEL 支持流式、异步、可观测性，但仍需要 LLM 等组件。" },
      { type: "multi", q: "以下哪些是 Runnable 的方法？（多选）", options: ["invoke", "stream", "batch", "compile"], answer: [0,1,2], stars: 2, explain: "invoke、stream、batch 都是 Runnable 的方法，compile 不是。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "RunnableLambda 的作用是？", options: ["将普通函数包装为 Runnable", "运行 Lambda 云函数", "执行 SQL", "存储数据"], answer: 0, stars: 1, explain: "RunnableLambda 将任意 Python 函数包装为 Runnable，使其可以参与 LCEL 组合。" },
      { type: "choice", q: "LCEL 中要并行执行多个 Runnable，使用？", options: ["RunnableParallel", "RunnableSequence", "RunnableBranch", "RunnableParallel 或字典语法"], answer: 3, stars: 1, explain: "可以用字典语法 {'a': runnable_a, 'b': runnable_b} 或 RunnableParallel 实现并行执行。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "LCEL 使用 ______ 操作符组合组件。", answer: "|", stars: 1, explain: "管道符 | 用于组合 Runnable。" },
      { type: "text", q: "将输入原样传递的 Runnable 是 Runnable______。", answer: "Passthrough", stars: 1, explain: "RunnablePassthrough 原样传递输入。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "LCEL 中 .bind() 方法的作用是？", options: ["绑定额外参数（如 stop、tools）到 Runnable", "绑定端口", "绑定数据库", "绑定事件"], answer: 0, stars: 1, explain: ".bind() 可以给 Runnable 绑定额外的调用参数，如 llm.bind(stop=['\\n']) 或绑定 tools。" },
      { type: "choice", q: "RunnableBranch 的作用是？", options: ["根据条件选择不同的执行分支", "合并多个分支", "循环执行", "跳过执行"], answer: 0, stars: 1, explain: "RunnableBranch 根据条件判断将输入路由到不同的 Runnable 分支。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "LCEL 链可以直接用 LangSmith 追踪。", answer: true, stars: 1, explain: "LCEL 原生集成 LangSmith，链的执行会自动被追踪和记录。" },
      { type: "judge", q: "LCEL 中 prompt | llm 的输出一定是字符串。", answer: false, stars: 1, explain: "如果 llm 是 ChatModel，输出是 AIMessage；如果接了 parser，输出是解析后的对象。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LCEL 中 Runnable.with_config() 可以配置？", options: ["运行时配置如 tags、metadata、max_concurrency", "LLM 的 temperature", "数据库连接", "API key"], answer: 0, stars: 1, explain: "with_config 配置运行时参数，如 tags（用于 LangSmith 过滤）、metadata、max_concurrency 等。" },
      { type: "choice", q: "关于 LCEL 的 fallback，说法正确的是？", options: ["主链失败时自动切换到备用链", "删除链", "加速链", "加密链"], answer: 0, stars: 1, explain: ".with_fallback() 可以设置备用链，主链执行失败时自动切换到备用链，提升可靠性。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "将普通函数包装为 Runnable 的类是 Runnable______。", answer: "Lambda", stars: 1, explain: "RunnableLambda 包装普通函数。" },
      { type: "text", q: "根据条件选择分支的 Runnable 是 Runnable______。", answer: "Branch", stars: 1, explain: "RunnableBranch 实现条件分支。" }
    ]}
  ],
  "14-multimodal": [
    { slot: "q1", variants: [
      { type: "choice", q: "多模态（Multimodal）LLM 指的是？", options: ["能处理多种输入类型（文本、图像等）的模型", "只处理文本", "只处理图像", "只处理音频"], answer: 0, stars: 1, explain: "多模态 LLM 能同时理解和处理文本、图像等多种模态的输入。" },
      { type: "choice", q: "LangChain 中表示图片消息内容的类是？", options: ["ImageURL", "PictureMessage", "ImageContent", "PhotoMessage"], answer: 0, stars: 1, explain: "LangChain 使用 ImageURL 类在 HumanMessage 中传递图片内容。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "流式输出（Streaming）的优势是？", options: ["减少 token 消耗", "用户可以逐字看到输出，体验更好", "提高回答准确率", "不需要 API key"], answer: 1, stars: 1, explain: "流式输出让用户实时看到生成过程，提升交互体验，尤其适合聊天场景。" },
      { type: "choice", q: "LangChain 中获取流式输出调用的方法是？", options: [".stream()", ".invoke()", ".batch()", ".generate()"], answer: 0, stars: 1, explain: ".stream() 方法返回一个迭代器，逐步产出 LLM 的输出 token。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "所有 LLM 都支持图像输入。", answer: false, stars: 1, explain: "只有多模态模型（如 GPT-4V、Claude 3）支持图像输入，纯文本模型不支持。" },
      { type: "judge", q: "流式输出不会影响最终答案的内容。", answer: true, stars: 1, explain: "流式输出只是改变了输出的传递方式（逐步 vs 一次性），不影响最终生成的内容。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是多模态应用场景？（多选）", options: ["图片描述生成", "图表数据分析", "文档 OCR 问答", "纯文本翻译"], answer: [0,1,2], stars: 2, explain: "图片描述、图表分析、OCR 问答都涉及图像模态，纯文本翻译不属于多模态。" },
      { type: "multi", q: "流式输出适用于哪些场景？（多选）", options: ["聊天机器人", "实时内容生成", "后台批量处理", "需要快速响应的交互"], answer: [0,1,3], stars: 2, explain: "流式输出适合聊天、实时生成、快速响应场景；后台批处理不需要流式。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "在 HumanMessage 中传入图片的方式是？", options: ["content 设为包含 text 和 image_url 的列表", "直接传图片路径字符串", "用 ImageMessage 类", "无法传入图片"], answer: 0, stars: 1, explain: "HumanMessage 的 content 可以是列表，包含 {'type':'text','text':...} 和 {'type':'image_url','image_url':{'url':...}}。" },
      { type: "choice", q: "关于 .stream() 和 .invoke()，说法正确的是？", options: ["stream 返回迭代器，invoke 返回完整结果", "两者完全一样", "invoke 更快", "stream 不消耗 token"], answer: 0, stars: 1, explain: "stream 返回逐步产出的迭代器，invoke 一次性返回完整结果。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "能处理文本和图像等多种输入的模型叫 ______ 模型。", answer: "多模态|multimodal", stars: 1, explain: "多模态模型能处理多种输入类型。" },
      { type: "text", q: "LangChain 中逐步获取输出的方法是 ______。", answer: "stream", stars: 1, explain: "stream() 方法用于流式输出。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "LangChain 中处理音频的常见方式是？", options: ["先用 Whisper 等模型转文字，再用 LLM 处理", "直接喂音频给所有 LLM", "不支持音频", "用图片工具处理"], answer: 0, stars: 1, explain: "通常先用 Whisper 等语音识别模型将音频转文字，再交给 LLM 处理。" },
      { type: "choice", q: "流式输出时，如何获取完整的最终结果？", options: ["遍历 stream 迭代器并拼接", "无法获取", "再调用一次 invoke", " stream 不返回结果"], answer: 0, stars: 1, explain: "遍历 stream 迭代器，将每个 chunk 拼接起来即可得到完整结果。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "图片可以通过 URL 或 base64 编码传递给多模态 LLM。", answer: true, stars: 1, explain: "图片可以通过 URL 或 base64 编码字符串传递给支持图像输入的 LLM。" },
      { type: "judge", q: "流式输出可以减少 API 调用费用。", answer: false, stars: 1, explain: "流式输出不减少 token 数量，费用与非流式相同，只是输出方式不同。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "LangChain 的 ChatPromptTemplate 中如何添加图片？", options: ["用 HumanMessage 包含 image_url", "用 add_image 方法", "不能添加", "用 ImagePromptTemplate"], answer: 0, stars: 1, explain: "通过在消息列表中使用 HumanMessage(content=[{'type':'image_url',...}]) 来传递图片。" },
      { type: "choice", q: "LCEL 中流式处理链的输出用什么方法？", options: [".stream()", ".invoke()", ".astream() 用于异步流式", "以上 stream/astream 都可以"], answer: 3, stars: 1, explain: "LCEL 链支持 .stream()（同步流式）和 .astream()（异步流式）。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "LangChain 中表示图片 URL 的类是 ______。", answer: "ImageURL", stars: 1, explain: "ImageURL 类用于在消息中传递图片。" },
      { type: "text", q: "异步流式输出的方法是 a______。", answer: "stream", stars: 1, explain: "astream() 是异步流式输出方法。" }
    ]}
  ],
  "15-chatbot": [
    { slot: "q1", variants: [
      { type: "choice", q: "构建对话系统的核心需求是？", options: ["记住对话历史上下文", "只回答当前问题", "不需要记忆", "只处理图片"], answer: 0, stars: 1, explain: "对话系统需要在多轮交互中保持上下文记忆，理解用户的指代和省略。" },
      { type: "choice", q: "ConversationChain 的作用是？", options: ["构建带有记忆的对话链", "执行数据库查询", "生成图片", "翻译文本"], answer: 0, stars: 1, explain: "ConversationChain 结合 Memory 和 LLM，实现带有对话历史记忆的聊天。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "处理长对话上下文溢出的常用策略不包括？", options: ["截断历史", "摘要压缩", "滑动窗口", "无限存储所有历史"], answer: 3, stars: 1, explain: "无限存储会导致 token 爆炸，应使用截断、摘要、滑动窗口等策略控制上下文长度。" },
      { type: "choice", q: "RunnableWithMessageHistory 的作用是？", options: ["为 LCEL 链添加消息历史管理", "存储图片", "加密消息", "删除消息"], answer: 0, stars: 1, explain: "RunnableWithMessageHistory 包装 LCEL 链，自动管理对话消息历史。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "对话系统中，SystemMessage 通常用于设定 AI 的角色和行为准则。", answer: true, stars: 1, explain: "SystemMessage 设定 AI 的角色、语气、行为规则，是对话系统的重要组成部分。" },
      { type: "judge", q: "对话历史越长，回答质量一定越高。", answer: false, stars: 1, explain: "过长的历史会引入噪声、消耗 token，还可能超出上下文窗口，需要合理管理。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "对话系统的关键组件有？（多选）", options: ["LLM", "Memory/消息历史管理", "Prompt 模板", "VectorStore"], answer: [0,1,2], stars: 2, explain: "对话系统核心是 LLM + 记忆管理 + Prompt，VectorStore 是 RAG 场景的可选组件。" },
      { type: "multi", q: "提升对话系统体验的方法有？（多选）", options: ["流式输出", "合理的记忆管理", "清晰的 system prompt", "完全不记忆历史"], answer: [0,1,2], stars: 2, explain: "流式输出、记忆管理、system prompt 都能提升体验，完全不记忆会导致多轮对话无法进行。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "会话历史按 session_id 区分存储的目的是？", options: ["支持多用户/多会话隔离", "节省存储", "加速响应", "加密数据"], answer: 0, stars: 1, explain: "按 session_id 区分历史，实现多用户、多会话的上下文隔离。" },
      { type: "choice", q: "在 LCEL 中给对话链添加记忆，推荐使用？", options: ["RunnableWithMessageHistory", "ConversationBufferMemory", "手动管理", "无法添加"], answer: 0, stars: 1, explain: "LCEL 推荐用 RunnableWithMessageHistory 包装链来管理消息历史。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "LCEL 中为链添加消息历史的类是 RunnableWith______。", answer: "MessageHistory", stars: 1, explain: "RunnableWithMessageHistory 管理消息历史。" },
      { type: "text", q: "区分不同会话的标识符是 ______。", answer: "session_id", stars: 1, explain: "session_id 用于区分不同会话的历史。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "对话系统中处理用户指代（如'它'）的方法是？", options: ["提供完整对话历史让 LLM 理解", "让用户重复说", "忽略指代", "用正则替换"], answer: 0, stars: 1, explain: "通过提供对话历史，LLM 可以理解用户的指代和省略，这是记忆的重要作用。" },
      { type: "choice", q: "ChatMessageHistory 的作用是？", options: ["存储单个会话的消息历史", "存储所有用户数据", "执行 SQL", "生成图片"], answer: 0, stars: 1, explain: "ChatMessageHistory 存储一个会话的消息列表，供 Memory 或 RunnableWithMessageHistory 使用。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "对话系统可以结合 RAG，让 AI 基于知识库回答。", answer: true, stars: 1, explain: "对话系统 + RAG 是常见模式，让 AI 既能记住对话上下文，又能基于外部知识回答。" },
      { type: "judge", q: "会话历史只能存储在内存中。", answer: false, stars: 1, explain: "会话历史可以存储在内存、Redis、数据库等多种后端，生产环境常用 Redis 等持久化存储。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "生产环境中，对话历史通常存储在哪里？", options: ["Redis 或数据库", "纯内存", "文本文件", "不存储"], answer: 0, stars: 1, explain: "生产环境常用 Redis、数据库等持久化存储会话历史，支持多实例共享和恢复。" },
      { type: "choice", q: "对话系统的 prompt 中通常不包含？", options: ["AI 角色设定", "对话历史", "当前用户输入", "数据库密码"], answer: 3, stars: 1, explain: "prompt 包含角色设定、历史、当前输入，但不应包含敏感信息如数据库密码。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "存储单个会话消息列表的类是 Chat______History。", answer: "Message", stars: 1, explain: "ChatMessageHistory 存储会话消息。" },
      { type: "text", q: "结合记忆和 LLM 的对话链叫 ______Chain。", answer: "Conversation", stars: 1, explain: "ConversationChain 实现带记忆的对话。" }
    ]}
  ],
  "16-eval": [
    { slot: "q1", variants: [
      { type: "choice", q: "LangSmith 的主要作用是？", options: ["替代 LLM", "监控、调试和评估 LLM 应用", "存储向量", "生成图片"], answer: 1, stars: 1, explain: "LangSmith 是 LangChain 的可观测性平台，用于追踪、调试、评估 LLM 应用。" },
      { type: "choice", q: "评估 LLM 应用的核心挑战是？", options: ["输出无固定标准答案，难以用传统断言", "运行太慢", "安装困难", "无法调用 API"], answer: 0, stars: 1, explain: "LLM 输出灵活无固定答案，传统单元测试的断言方式不适用，需要专门的评估方法。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "LangChain 的评估器（Evaluator）的作用是？", options: ["执行 LLM 调用", "对 LLM 输出进行打分或判断正确性", "存储数据", "生成图片"], answer: 1, stars: 1, explain: "Evaluator 对 LLM 的输出进行评估，如判断回答是否正确、是否有害、是否符合预期。" },
      { type: "choice", q: "QAEvalChain 的作用是？", options: ["评估问答的正确性", "执行问答", "存储问答对", "翻译问答"], answer: 0, stars: 1, explain: "QAEvalChain 用 LLM 作为评判者，评估问答系统的回答是否正确。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "LangSmith 可以记录每次 LLM 调用的输入、输出和耗时。", answer: true, stars: 1, explain: "LangSmith 会追踪链的每次执行，记录输入输出、token 消耗、耗时等，便于调试。" },
      { type: "judge", q: "评估 LLM 应用只能用人工评估。", answer: false, stars: 1, explain: "除了人工评估，还可以用 LLM-as-judge、自动化评估器、对照标准答案等多种方式。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "以下哪些是 LLM 应用的评估维度？（多选）", options: ["回答正确性", "相关性", "有害性/偏见", "数据库大小"], answer: [0,1,2], stars: 2, explain: "正确性、相关性、有害性都是评估维度，数据库大小不是 LLM 输出的评估维度。" },
      { type: "multi", q: "LangSmith 提供哪些能力？（多选）", options: ["调用追踪", "调试", "评估", "模型训练"], answer: [0,1,2], stars: 2, explain: "LangSmith 提供追踪、调试、评估能力，不负责模型训练。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "开启 LangSmith 追踪需要设置的环境变量不包括？", options: ["LANGCHAIN_TRACING_V2=true", "LANGCHAIN_API_KEY", "LANGCHAIN_PROJECT", "OPENAI_API_KEY"], answer: 3, stars: 1, explain: "需要 LANGCHAIN_TRACING_V2、LANGCHAIN_API_KEY、LANGCHAIN_PROJECT；OPENAI_API_KEY 是调用模型用的。" },
      { type: "choice", q: "LLM-as-judge 指的是？", options: ["用 LLM 作为评判者评估另一个 LLM 的输出", "让 LLM 当法官判案", "LLM 自动训练", "LLM 自我复制"], answer: 0, stars: 1, explain: "LLM-as-judge 用一个 LLM（通常更强的模型）来评估目标 LLM 输出的质量。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "LangChain 官方的可观测性平台是 ______。", answer: "LangSmith|langsmith", stars: 1, explain: "LangSmith 是 LangChain 的监控调试平台。" },
      { type: "text", q: "用 LLM 评估 LLM 输出的方法叫 ______。", answer: "LLM-as-judge|llm-as-judge", stars: 1, explain: "LLM-as-judge 用 LLM 作为评判者。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "关于评估数据集，说法正确的是？", options: ["需要有代表性的测试样本", "随便几条就行", "只能用人工标注", "不需要数据集"], answer: 0, stars: 1, explain: "评估数据集需要有代表性，覆盖典型场景，才能准确评估应用质量。" },
      { type: "choice", q: "LangSmith 中 Dataset 的作用是？", options: ["存储评估用的输入输出样本", "存储训练数据", "存储向量", "存储图片"], answer: 0, stars: 1, explain: "Dataset 存储评估样本（输入和期望输出），用于批量评估链的效果。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "评估 LLM 应用时，只看正确率就够了。", answer: false, stars: 1, explain: "除了正确率，还要考虑相关性、流畅性、安全性、延迟、成本等多维度。" },
      { type: "judge", q: "LangSmith 可以帮助定位链中哪个步骤出了问题。", answer: true, stars: 1, explain: "LangSmith 展示链中每一步的输入输出，便于定位问题环节。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "生产环境中，可观测性不包括以下哪项？", options: ["追踪调用链路", "记录错误日志", "监控延迟和 token 消耗", "修改 LLM 权重"], answer: 3, stars: 1, explain: "可观测性包括追踪、日志、指标，不包括修改模型权重。" },
      { type: "choice", q: "RAG 系统的检索质量评估可以用？", options: ["命中率（Hit Rate）和 MRR", "只看回答长度", "看 token 数", "看模型大小"], answer: 0, stars: 1, explain: "Hit Rate（命中率）和 MRR（平均倒数排名）是评估检索质量的常用指标。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "评估检索质量的平均倒数排名指标简称 ______。", answer: "MRR|mrr", stars: 1, explain: "MRR（Mean Reciprocal Rank）是常用的检索评估指标。" },
      { type: "text", q: "LangSmith 中存储评估样本的集合叫 ______。", answer: "Dataset|dataset", stars: 1, explain: "Dataset 存储评估样本。" }
    ]}
  ],
  "17-production": [
    { slot: "q1", variants: [
      { type: "choice", q: "LangChain 异步调用 LLM 的方法是？", options: [".ainvoke()", ".invoke()", ".run()", ".execute()"], answer: 0, stars: 1, explain: ".ainvoke() 是异步执行方法，配合 async/await 使用，提高并发性能。" },
      { type: "choice", q: "LangServe 的作用是？", options: ["将 LangChain 应用部署为 REST API", "存储数据", "训练模型", "生成图片"], answer: 0, stars: 1, explain: "LangServe 可以将 LangChain 链快速部署为 REST API 服务，支持流式输出。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "LLM 应用中缓存的主要作用是？", options: ["减少重复调用的费用和延迟", "提高回答准确性", "增加 token 数", "加密数据"], answer: 0, stars: 1, explain: "缓存相同输入的 LLM 输出，避免重复调用，降低费用和延迟。" },
      { type: "choice", q: "限流（Rate Limiting）的目的是？", options: ["防止超出 API 配额和保护服务", "加快速度", "增加并发", "减少代码量"], answer: 0, stars: 1, explain: "限流控制请求速率，防止超出 API 配额、触发封禁或压垮后端服务。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "异步调用可以提升 I/O 密集型 LLM 应用的吞吐量。", answer: true, stars: 1, explain: "LLM 调用是 I/O 密集型，异步可以在等待响应时处理其他请求，提升吞吐量。" },
      { type: "judge", q: "生产环境中可以完全依赖 LLM 的输出，不需要错误处理。", answer: false, stars: 1, explain: "LLM 可能超时、限流、返回格式错误，生产环境必须有完善的错误处理和重试机制。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "生产环境部署 LLM 应用需要考虑？（多选）", options: ["错误处理与重试", "限流与降级", "缓存", "成本控制"], answer: [0,1,2,3], stars: 2, explain: "生产环境需要考虑错误处理、限流降级、缓存、成本控制等多个方面。" },
      { type: "multi", q: "以下哪些是常见的 LLM 部署方式？（多选）", options: ["LangServe REST API", "FastAPI 封装", "Docker 容器化", "直接在 Jupyter 中运行"], answer: [0,1,2], stars: 2, explain: "LangServe、FastAPI、Docker 都是常见部署方式；Jupyter 不适合生产部署。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "LangChain 中实现重试的常用方式是？", options: ["Runnable.with_retry()", "手动 while 循环", "不需要重试", "用 try-except 一次"], answer: 0, stars: 1, explain: ".with_retry() 可以配置重试次数、异常类型等，是 LCEL 中优雅的重试方式。" },
      { type: "choice", q: "关于降级策略，说法正确的是？", options: ["主模型失败时切换到备用模型或返回兜底回复", "直接报错给用户", "无限重试", "关闭服务"], answer: 0, stars: 1, explain: "降级策略在主路径失败时切换到备用方案（备用模型、缓存、兜底回复），保障可用性。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "LCEL 中配置重试的方法是 with______。", answer: "retry", stars: 1, explain: "with_retry() 配置重试策略。" },
      { type: "text", q: "将 LangChain 应用部署为 API 的库是 ______。", answer: "LangServe|langserve", stars: 1, explain: "LangServe 部署 LangChain 应用为 API。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "InMemoryCache 与 RedisCache 的主要区别是？", options: ["InMemoryCache 进程内不共享，RedisCache 跨进程共享", "没有区别", "InMemoryCache 更快但更贵", "RedisCache 不能存字符串"], answer: 0, stars: 1, explain: "InMemoryCache 在单进程内有效，重启丢失；RedisCache 跨进程共享且持久化，适合多实例部署。" },
      { type: "choice", q: "监控 LLM 应用的成本需要关注？", options: ["token 消耗量", "网络带宽", "磁盘空间", "CPU 温度"], answer: 0, stars: 1, explain: "LLM 成本主要与 token 消耗相关，监控 token 使用量是成本控制的关键。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "生产环境中应使用 try-except 包裹 LLM 调用，并设置合理的超时。", answer: true, stars: 1, explain: "LLM 调用可能超时、失败，必须用 try-except 处理并设置超时，避免请求挂起。" },
      { type: "judge", q: "流式输出不能用于生产环境。", answer: false, stars: 1, explain: "流式输出在生产环境的聊天应用中广泛使用，提升用户体验。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "并发控制（max_concurrency）的作用是？", options: ["限制同时执行的请求数，防止压垮服务", "增加请求数", "减少响应时间", "加密请求"], answer: 0, stars: 1, explain: "max_concurrency 限制并发数，防止瞬时大量请求压垮 LLM API 或自身服务。" },
      { type: "choice", q: "以下哪项不是生产环境的最佳实践？", options: ["硬编码 API key 在代码中", "使用环境变量管理密钥", "添加日志和监控", "设置超时和重试"], answer: 0, stars: 1, explain: "硬编码 API key 有安全风险，应使用环境变量或密钥管理服务。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "LCEL 中配置备用链的方法是 with______。", answer: "fallback", stars: 1, explain: "with_fallback() 设置备用链。" },
      { type: "text", q: "限制同时执行请求数的参数是 ______。", answer: "max_concurrency", stars: 1, explain: "max_concurrency 控制最大并发数。" }
    ]}
  ],
  "18-project-cs": [
    { slot: "q1", variants: [
      { type: "choice", q: "构建智能客服系统的核心组件不包括？", options: ["对话管理", "知识库 RAG", "意图识别", "3D 渲染"], answer: 3, stars: 1, explain: "智能客服需要对话管理、知识库、意图识别等，3D 渲染与客服无关。" },
      { type: "choice", q: "智能客服中 RAG 的作用是？", options: ["让客服基于产品文档回答用户问题", "生成图片", "存储用户数据", "加密对话"], answer: 0, stars: 1, explain: "RAG 让客服检索产品知识库，基于文档准确回答用户问题。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "客服系统处理用户问题的合理流程是？", options: ["理解意图→检索知识→生成回答", "直接让用户等", "随机回答", "只说'不知道'"], answer: 0, stars: 1, explain: "合理流程：理解用户意图 → 检索相关知识 → 结合上下文生成回答。" },
      { type: "choice", q: "当知识库没有相关内容时，客服应该？", options: ["编造答案", "礼貌告知无法回答并建议转人工", "重复问题", "发脾气"], answer: 1, stars: 1, explain: "应诚实告知无法回答，并建议转人工或提供其他帮助，避免幻觉误导用户。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "智能客服的回答应该可以溯源到知识库文档。", answer: true, stars: 1, explain: "回答溯源可以提高可信度，也便于验证和维护知识库。" },
      { type: "judge", q: "智能客服不需要处理多轮对话。", answer: false, stars: 1, explain: "用户经常会有追问、补充，客服必须支持多轮对话和上下文理解。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "智能客服系统的关键功能有？（多选）", options: ["多轮对话", "知识库问答", "转人工", "自动播放音乐"], answer: [0,1,2], stars: 2, explain: "多轮对话、知识库问答、转人工是客服核心功能，自动播放音乐不是。" },
      { type: "multi", q: "提升客服回答准确性的方法有？（多选）", options: ["完善知识库", "优化检索策略", "添加回答引用来源", "完全不使用 RAG"], answer: [0,1,2], stars: 2, explain: "完善知识库、优化检索、添加引用都能提升准确性，不用 RAG 会降低准确性。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "客服系统中'转人工'的触发条件通常不包括？", options: ["用户明确要求人工", "多次无法回答", "用户情绪激烈", "用户打了个招呼"], answer: 3, stars: 1, explain: "打招呼不需要转人工，转人工通常在无法解决、用户要求或情绪问题时触发。" },
      { type: "choice", q: "客服回答中引用来源的好处是？", options: ["提高可信度，便于用户核实", "增加 token 消耗", "让回答变长", "没有好处"], answer: 0, stars: 1, explain: "引用来源提高回答可信度，用户可以点击查看原文，也减少误导。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "智能客服基于文档回答的核心技术是 ______。", answer: "RAG|检索增强生成", stars: 1, explain: "RAG 是客服知识库问答的核心技术。" },
      { type: "text", q: "客服无法回答时应该转接 ______。", answer: "人工", stars: 1, explain: "无法回答时建议转人工处理。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "客服系统的对话历史应该？", options: ["存储以便后续分析和改进", "立即删除", "不存储", "只存用户消息"], answer: 0, stars: 1, explain: "存储对话历史可用于分析常见问题、优化知识库、改进客服质量，但要注意隐私合规。" },
      { type: "choice", q: "关于客服系统的 prompt，说法错误的是？", options: ["应设定客服角色和语气", "应包含产品知识", "应鼓励编造答案", "应引导无法回答时转人工"], answer: 2, stars: 1, explain: "prompt 应避免编造，鼓励诚实回答和转人工，而不是编造答案。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "客服系统可以结合用户画像提供个性化服务。", answer: true, stars: 1, explain: "结合用户历史、等级等信息可以提供更个性化的服务，提升用户体验。" },
      { type: "judge", q: "客服回答越长越好。", answer: false, stars: 1, explain: "回答应简洁准确，过长会让用户失去耐心，重点不突出。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "评估客服系统的关键指标不包括？", options: ["问题解决率", "平均响应时间", "用户满意度", "服务器颜色"], answer: 3, stars: 1, explain: "解决率、响应时间、满意度是客服核心指标，服务器颜色与评估无关。" },
      { type: "choice", q: "客服系统中处理'我不知道'类回答的策略是？", options: ["提供兜底回复并引导转人工或自助", "编造一个答案", "重复用户问题", "关闭对话"], answer: 0, stars: 1, explain: "应提供友好的兜底回复，引导用户转人工或查阅帮助文档，而不是编造或回避。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "客服系统中基于产品文档回答用户问题的技术是 ______。", answer: "RAG", stars: 1, explain: "RAG 让客服基于知识库回答。" },
      { type: "text", q: "客服无法解决问题时应建议转 ______。", answer: "人工", stars: 1, explain: "无法解决时转人工。" }
    ]}
  ],
  "19-project-kb": [
    { slot: "q1", variants: [
      { type: "choice", q: "企业知识库问答系统的核心是？", options: ["RAG + 向量检索", "数据库查询", "搜索引擎优化", "图片识别"], answer: 0, stars: 1, explain: "企业知识库问答的核心是 RAG：将文档向量化存入向量库，检索后让 LLM 生成回答。" },
      { type: "choice", q: "企业知识库中，文档更新后应该？", options: ["重新向量化并更新向量库", "什么都不做", "删除所有文档", "重启服务器"], answer: 0, stars: 1, explain: "文档更新后需要重新切分、向量化并更新向量库，确保检索到最新内容。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "企业知识库中 metadata 的作用不包括？", options: ["记录文档来源、部门、更新时间", "用于过滤检索结果", "存储向量", "权限控制"], answer: 2, stars: 1, explain: "metadata 记录来源、部门、时间等，用于过滤和权限控制，向量存储在向量字段中。" },
      { type: "choice", q: "知识库问答中，chunk 的最佳大小取决于？", options: ["文档类型和检索需求", "随便定", "越小越好", "越大越好"], answer: 0, stars: 1, explain: "chunk 大小取决于文档类型（FAQ vs 长文）和检索需求，需要实验调优。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "企业知识库问答系统需要考虑文档权限控制。", answer: true, stars: 1, explain: "企业文档可能有不同的权限级别，系统需要确保用户只能检索到其有权限访问的文档。" },
      { type: "judge", q: "知识库问答不需要更新，一次建好就够了。", answer: false, stars: 1, explain: "企业知识不断更新，需要定期或实时更新向量库，保证回答基于最新信息。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "企业知识库问答系统的组成部分有？（多选）", options: ["文档加载与切分", "向量化与存储", "检索与生成", "权限控制"], answer: [0,1,2,3], stars: 2, explain: "完整系统包括文档处理、向量化、检索生成、权限控制等部分。" },
      { type: "multi", q: "提升知识库检索效果的方法有？（多选）", options: ["优化 chunk 策略", "添加 metadata 过滤", "使用重排序", "删除所有文档"], answer: [0,1,2], stars: 2, explain: "优化 chunk、metadata 过滤、重排序都能提升检索效果，删除文档不可取。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "知识库问答中，回答引用原文的好处是？", options: ["提高可信度，便于核实", "增加 token 消耗", "让回答更难懂", "没有好处"], answer: 0, stars: 1, explain: "引用原文提高可信度，用户可以核实答案来源，也便于定位文档。" },
      { type: "choice", q: "企业知识库处理多种格式文档（PDF、Word、网页）应该？", options: ["用对应的 Loader 分别加载", "全部当文本处理", "只处理 PDF", "不处理"], answer: 0, stars: 1, explain: "应使用对应的 Document Loader（PyPDFLoader、Docx2txtLoader、WebBaseLoader 等）加载不同格式。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "企业知识库问答的核心技术是 ______。", answer: "RAG", stars: 1, explain: "RAG 是知识库问答的核心。" },
      { type: "text", q: "文档更新后需要重新 ______ 化并更新向量库。", answer: "向量化|embedding", stars: 1, explain: "更新后需重新向量化。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "知识库问答中，当检索结果不相关时应该？", options: ["告知用户未找到相关信息，而不是编造", "编造一个答案", "随便选一个文档", "关闭系统"], answer: 0, stars: 1, explain: "检索不到相关内容时应诚实告知，避免幻觉误导用户。" },
      { type: "choice", q: "企业知识库的增量更新策略是指？", options: ["只更新变化的文档，不全量重建", "每次全量重建", "不更新", "只更新标题"], answer: 0, stars: 1, explain: "增量更新只处理变化的文档，提高效率，避免全量重建的开销。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "企业知识库可以使用 Hybrid Search（关键词+向量）提升召回。", answer: true, stars: 1, explain: "混合检索结合关键词精确匹配和语义理解，提升企业知识库的召回率。" },
      { type: "judge", q: "知识库问答系统不需要考虑响应速度。", answer: false, stars: 1, explain: "响应速度直接影响用户体验，需要优化检索和生成速度。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "企业知识库中，文档权限控制通常通过什么实现？", options: ["metadata 中的权限字段 + 检索过滤", "不做控制", "只靠文件名", "用颜色区分"], answer: 0, stars: 1, explain: "通过 metadata 中的权限/部门字段，在检索时过滤用户无权访问的文档。" },
      { type: "choice", q: "知识库问答的评估重点不包括？", options: ["答案是否基于检索文档", "答案是否准确", "检索到的文档是否相关", "页面是否美观"], answer: 3, stars: 1, explain: "评估重点是答案准确性、相关性、是否基于文档，页面美观不是问答质量评估重点。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "企业知识库中结合关键词和向量的检索叫 ______ Search。", answer: "Hybrid|hybrid", stars: 1, explain: "Hybrid Search 混合检索。" },
      { type: "text", q: "只更新变化文档的策略叫 ______ 更新。", answer: "增量", stars: 1, explain: "增量更新只处理变化的文档。" }
    ]}
  ],
  "20-interview": [
    { slot: "q1", variants: [
      { type: "choice", q: "面试中解释 RAG 时，重点应突出？", options: ["解决 LLM 知识过时和幻觉，无需微调", "RAG 比微调更便宜", "RAG 不需要 LLM", "RAG 只能用于搜索"], answer: 0, stars: 1, explain: "RAG 的核心价值是解决知识过时和幻觉，且无需微调，这是面试要点。" },
      { type: "choice", q: "面试中被问到'LangChain 的 Chain 和 Agent 区别'，正确回答是？", options: ["Chain 是固定流程，Agent 可自主决策调用工具", "没有区别", "Agent 是 Chain 的子类", "Chain 比 Agent 高级"], answer: 0, stars: 1, explain: "Chain 按固定顺序执行，Agent 根据 LLM 决策自主选择工具和步骤。" }
    ]},
    { slot: "q2", variants: [
      { type: "choice", q: "关于 LLM 幻觉（Hallucination），面试时应说明？", options: ["LLM 可能生成看似合理但错误的信息", "LLM 永远正确", "幻觉只出现在小模型", "无法缓解"], answer: 0, stars: 1, explain: "应说明幻觉是 LLM 生成虚假信息的现象，并提到缓解方法（RAG、引用来源、prompt 约束等）。" },
      { type: "choice", q: "简历中展示 LangChain 项目，最好包含？", options: ["项目背景、技术方案、效果数据", "只写'会用 LangChain'", "只贴代码", "只写项目名"], answer: 0, stars: 1, explain: "好的项目描述应包含背景、技术方案和效果数据，体现解决问题的能力。" }
    ]},
    { slot: "q3", variants: [
      { type: "judge", q: "面试中应该诚实说明自己的经验，不夸大。", answer: true, stars: 1, explain: "诚实是基本原则，夸大容易在追问中露馅，反而减分。" },
      { type: "judge", q: "LangChain 工程师面试只考框架 API，不考 LLM 原理。", answer: false, stars: 1, explain: "面试既考框架使用，也考 LLM 原理（token、embedding、RAG 原理等）。" }
    ]},
    { slot: "q4", variants: [
      { type: "multi", q: "LLM 应用开发工程师面试常考的内容有？（多选）", options: ["RAG 原理与优化", "LangChain 核心组件", "Prompt 工程", "操作系统内核"], answer: [0,1,2], stars: 2, explain: "RAG、LangChain、Prompt 是常考内容，操作系统内核不是 LLM 应用开发的重点。" },
      { type: "multi", q: "准备 LangChain 求职，应该做哪些准备？（多选）", options: ["动手做项目", "理解核心概念原理", "准备项目讲解", "只背 API 名称"], answer: [0,1,2], stars: 2, explain: "做项目、理解原理、准备讲解是有效准备，只背 API 名称不够。" }
    ]},
    { slot: "q5", variants: [
      { type: "choice", q: "面试中被问到'如何优化 RAG 效果'，不应该提？", options: ["调整 chunk 大小和 overlap", "使用重排序和混合检索", "删掉所有文档", "优化 query 改写"], answer: 2, stars: 1, explain: "优化方法包括调整 chunk、重排序、混合检索、query 改写等，删文档不是优化。" },
      { type: "choice", q: "面试中提到项目遇到的挑战时，应该？", options: ["说明挑战和你的解决方案、结果", "说没有挑战", "把问题推给别人", "只说困难不说解决"], answer: 0, stars: 1, explain: "应说明挑战、你的解决思路和最终结果，体现解决问题的能力。" }
    ]},
    { slot: "q6", variants: [
      { type: "text", q: "LLM 生成看似合理但错误信息的现象叫 ______。", answer: "幻觉|hallucination", stars: 1, explain: "幻觉（Hallucination）是 LLM 生成错误信息的现象。" },
      { type: "text", q: "解决 LLM 知识过时和幻觉的常用技术是 ______。", answer: "RAG", stars: 1, explain: "RAG 是解决幻觉和知识过时的常用技术。" }
    ]},
    { slot: "q7", variants: [
      { type: "choice", q: "面试中解释 embedding，应该说清？", options: ["将文本转为向量，语义相近向量相近，用于相似度搜索", "embedding 就是加密", "embedding 是压缩算法", "embedding 用于图片压缩"], answer: 0, stars: 1, explain: "应说明 embedding 是文本向量化，语义相近向量相近，用于相似度搜索和 RAG。" },
      { type: "choice", q: "求职 LLM 应用开发，最能体现能力的是？", options: ["完整的项目经验和数据", "只会调 API", "只看教程不动手", "只懂理论"], answer: 0, stars: 1, explain: "完整的项目经验（含数据效果）最能体现实战能力，是求职的核心竞争力。" }
    ]},
    { slot: "q8", variants: [
      { type: "judge", q: "面试中遇到不会的问题，可以坦诚说明并展示学习能力。", answer: true, stars: 1, explain: "坦诚不会的问题，并展示快速学习和思考的能力，比硬编好得多。" },
      { type: "judge", q: "LangChain 只是调包，没有技术含量，面试不需要准备。", answer: false, stars: 1, explain: "LangChain 背后涉及 LLM 原理、工程化、RAG 优化等，有很高技术含量，需要认真准备。" }
    ]},
    { slot: "q9", variants: [
      { type: "choice", q: "面试中被问'如何处理 LLM 输出不稳定'，不合适的回答是？", options: ["使用结构化输出和 OutputParser", "降低 temperature", "添加错误处理和重试", "不管它，反正 LLM 都这样"], answer: 3, stars: 1, explain: "应通过结构化输出、调参、错误处理等方式应对不稳定性，而不是放任不管。" },
      { type: "choice", q: "关于 LangChain 的学习路径，面试时应展示？", options: ["从基础到项目的完整学习路径", "只学了 API", "只看了文档", "没系统学过"], answer: 0, stars: 1, explain: "展示从概念、组件到项目实战的完整学习路径，体现系统性和深度。" }
    ]},
    { slot: "q10", variants: [
      { type: "text", q: "将文本转为高维向量的技术叫 ______。", answer: "embedding|向量化", stars: 1, explain: "Embedding 将文本转为向量。" },
      { type: "text", q: "LLM 应用中用 LLM 评估 LLM 输出的方法叫 ______。", answer: "LLM-as-judge", stars: 1, explain: "LLM-as-judge 用 LLM 作为评判者。" }
    ]}
  ]
};
