#!/usr/bin/env python3
"""生成 LangChain Quest 章节 HTML 文件"""
import os

CHAPTERS_DIR = os.path.join(os.path.dirname(__file__), "chapters")

CHAPTER_TEMPLATE = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} | LangChain Quest</title>
  <link rel="stylesheet" href="../assets/css/style.css?v=2" />
</head>
<body data-page="chapter" data-chapter="{chapter_id}">

  <header class="site-header">
    <div class="container">
      <a href="../index.html" class="brand">
        <span class="brand-logo">🦜</span><span>LangChain Quest</span>
      </a>
      <div class="nav-right" id="top-nav-right"></div>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-card">
        <h3>闯关地图</h3>
        <ul class="sidebar-list" id="sidebar-list"></ul>
      </div>
    </aside>

    <main class="content">
      <div class="content-card">
        <div class="chapter-meta" id="chapter-meta"></div>
{content}
        <section class="quiz-section" id="quiz-section">
          <h2>🎯 本章测试（答对赚星星！）</h2>
        </section>

        <div class="page-nav" id="page-nav"></div>
      </div>
    </main>
  </div>

  <footer class="site-footer">
    <p>LangChain Quest · 第 {chapter_num} 章</p>
  </footer>

  <script src="../assets/js/game.js?v=2"></script>
  <script src="../assets/js/nav.js?v=3"></script>
  <script src="../assets/js/question-bank.js?v=2"></script>
  <script src="../assets/js/quiz.js?v=2"></script>
</body>
</html>
'''

# 每个章节的内容 (id, 序号, 标题, HTML内容)
CHAPTERS = []

CHAPTERS = [
(3, "03-llm-basics", "第3章 LLM 基础概念", '''        <h1>LLM 基础概念</h1>
        <p>在深入 LangChain 之前，我们需要理解大语言模型（LLM）的基本概念。Token、Temperature、上下文窗口、消息格式……这些是用好 LangChain 的基础。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解 Token 及其对费用和长度的影响</li>
          <li>掌握 Temperature、max_tokens、top_p 等生成参数</li>
          <li>理解上下文窗口的概念</li>
          <li>熟悉 SystemMessage、HumanMessage、AIMessage 消息类型</li>
        </ul>

        <h2>1. Token：LLM 的基本单位</h2>
        <p>LLM 不是按字符或单词处理文本，而是按 <strong>Token</strong>。Token 可以是一个完整的单词、词的一部分、标点符号或单个字符。</p>
        <ul>
          <li>英文：约 4 个字符 ≈ 1 个 token，100 个 token ≈ 75 个单词</li>
          <li>中文：通常 1 个汉字 ≈ 1-2 个 token</li>
        </ul>
        <p>Token 数量直接影响<strong>费用</strong>（API 按 token 计费）和<strong>速度</strong>（token 越多生成越慢）。</p>

        <div class="callout tip">
          <div class="callout-title">💡 估算 token</div>
          <p>可以用 OpenAI 的 tiktoken 库精确计算 token 数：<code>import tiktoken; enc = tiktoken.encoding_for_model("gpt-3.5-turbo"); len(enc.encode("你好世界"))</code></p>
        </div>

        <h2>2. 生成参数</h2>

        <div class="term-card">
          <div class="term-name">🌡️ Temperature（温度）</div>
          <p>控制生成的随机性。0 = 最确定（适合事实问答），1 = 最随机（适合创意写作），默认约 0.7。</p>
        </div>

        <div class="term-card">
          <div class="term-name">📏 max_tokens（最大生成 token 数）</div>
          <p>限制模型输出的最大长度，避免回复过长或超出上下文窗口。</p>
        </div>

        <div class="term-card">
          <div class="term-name">🎯 top_p（核采样）</div>
          <p>只从累积概率达到 p 的 token 中采样，控制输出多样性。p=0.1 只选概率最高的，p=1 考虑所有 token。</p>
        </div>

        <h2>3. 上下文窗口</h2>
        <p>每个 LLM 都有<strong>上下文窗口</strong>限制（如 gpt-3.5-turbo 为 16K，gpt-4 为 128K）。输入和输出的 token 总和不能超过该限制，否则会报错。</p>
        <p>这就是为什么长对话需要 Memory 管理（摘要、截断），长文档需要 RAG 检索——都要把内容控制在上下文窗口内。</p>

        <h2>4. 消息类型</h2>
        <p>LangChain 用不同的消息类表示对话中的不同角色：</p>
        <ul>
          <li><strong>SystemMessage</strong>：系统消息，设定 AI 的角色、语气、行为规则</li>
          <li><strong>HumanMessage</strong>：用户输入的消息</li>
          <li><strong>AIMessage</strong>：AI 回复的消息</li>
          <li><strong>FunctionMessage / ToolMessage</strong>：工具调用的返回结果</li>
        </ul>

        <pre><code>from langchain_core.messages import SystemMessage, HumanMessage

messages = [
    SystemMessage(content="你是一个耐心的编程导师，用中文回答问题。"),
    HumanMessage(content="什么是 Token？")
]
response = llm.invoke(messages)</code></pre>

        <h2>本章小结</h2>
        <ul>
          <li>Token 是 LLM 处理文本的基本单位，影响费用和速度</li>
          <li>Temperature 控制随机性，max_tokens 控制输出长度，top_p 控制多样性</li>
          <li>上下文窗口限制输入+输出的总 token 数</li>
          <li>消息类型：SystemMessage（角色设定）、HumanMessage（用户）、AIMessage（AI）</li>
        </ul>'''),

(4, "04-prompt", "第4章 Prompt 工程", '''        <h1>Prompt 工程</h1>
        <p>Prompt 是人与 LLM 沟通的桥梁。好的 Prompt 能让 LLM 输出高质量、结构化的结果；差的 Prompt 则会得到模糊、无用的回答。本章学习 LangChain 中 Prompt 的管理与解析。</p>

        <h2>学习目标</h2>
        <ul>
          <li>使用 PromptTemplate 创建可复用的提示模板</li>
          <li>使用 FewShotPromptTemplate 提供示例</li>
          <li>使用 OutputParser 将输出解析为结构化数据</li>
          <li>掌握 ChatPromptTemplate 构建对话模板</li>
        </ul>

        <h2>1. PromptTemplate</h2>
        <p>PromptTemplate 用 <code>{variable}</code> 语法定义带变量的模板，调用时传入具体值：</p>
        <pre><code>from langchain_core.prompts import PromptTemplate

template = PromptTemplate.from_template(
    "你是一个{role}。请用{style}的风格解释{concept}。"
)
prompt = template.format(role="编程导师", style="简洁", concept="RAG")
print(prompt)</code></pre>
        <p>输出：<code>你是一个编程导师。请用简洁的风格解释RAG。</code></p>

        <h2>2. FewShotPromptTemplate</h2>
        <p>给模型提供几个示例（few-shot），引导它按期望的格式输出：</p>
        <pre><code>from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

examples = [
    {"input": "开心", "output": "😊"},
    {"input": "难过", "output": "😢"},
]
example_prompt = PromptTemplate.from_template("输入：{input}\\n输出：{output}")

few_shot = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    suffix="输入：{emotion}\\n输出：",
    input_variables=["emotion"]
)
print(few_shot.format(emotion="愤怒"))</code></pre>

        <h2>3. OutputParser</h2>
        <p>LLM 输出是文本，OutputParser 将其解析为结构化数据：</p>

        <div class="term-card">
          <div class="term-name">📋 CommaSeparatedListOutputParser</div>
          <p>将输出解析为逗号分隔的列表。</p>
        </div>

        <div class="term-card">
          <div class="term-name">📐 PydanticOutputParser</div>
          <p>基于 Pydantic 模型解析为强类型对象，支持嵌套结构，是最强大的 Parser。</p>
        </div>

        <pre><code>from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class Movie(BaseModel):
    title: str = Field(description="电影名")
    year: int = Field(description="上映年份")
    genre: list[str] = Field(description="类型列表")

parser = PydanticOutputParser(pydantic_object=Movie)
prompt = PromptTemplate.from_template(
    "推荐一部电影。\\n{format_instructions}\\n电影：{query}"
)
chain = prompt | llm | parser
result = chain.invoke({"query": "科幻片", "format_instructions": parser.get_format_instructions()})
print(result.title, result.year, result.genre)</code></pre>

        <h2>4. ChatPromptTemplate</h2>
        <p>用于构建聊天消息列表，支持消息占位符：</p>
        <pre><code>from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}。"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}")
])</code></pre>

        <div class="callout tip">
          <div class="callout-title">💡 Prompt 编写原则</div>
          <p>1. 明确角色设定（SystemMessage）<br/>
          2. 清楚描述任务和要求<br/>
          3. 给出期望的输出格式<br/>
          4. 提供示例（few-shot）效果更好<br/>
          5. 避免模糊和歧义的表达</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>PromptTemplate 用 {variable} 创建可复用模板</li>
          <li>FewShotPromptTemplate 通过示例引导输出格式</li>
          <li>OutputParser 将文本输出解析为结构化数据（PydanticOutputParser 最强）</li>
          <li>ChatPromptTemplate 构建对话消息模板，MessagesPlaceholder 占位历史消息</li>
        </ul>'''),

(5, "05-chain", "第5章 Chain 链式调用", '''        <h1>Chain 链式调用</h1>
        <p>Chain 是 LangChain 的核心编排单元，它将 Prompt、LLM、Parser 等组件链接在一起，形成完整的处理流程。本章学习各种 Chain 类型以及新版 LCEL 的组合方式。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解 LLMChain 的组成和用法</li>
          <li>掌握 SequentialChain 串联多个链</li>
          <li>了解 RouterChain 动态路由</li>
          <li>用 LCEL 的 | 操作符组合组件</li>
        </ul>

        <h2>1. LLMChain：最基本的链</h2>
        <p>LLMChain = PromptTemplate + LLM +（可选）OutputParser：</p>
        <pre><code>from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("将以下句子翻译为{lang}：{text}")
chain = LLMChain(llm=llm, prompt=prompt)
result = chain.invoke({"lang": "英文", "text": "你好世界"})
print(result["text"])</code></pre>

        <h2>2. LCEL：新版推荐写法</h2>
        <p>LangChain 0.2+ 推荐用 LCEL（LangChain Expression Language）的 <code>|</code> 操作符组合组件：</p>
        <pre><code>from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = PromptTemplate.from_template("将以下句子翻译为{lang}：{text}")
chain = prompt | llm | StrOutputParser()
result = chain.invoke({"lang": "英文", "text": "你好世界"})
print(result)</code></pre>
        <p>LCEL 原生支持流式输出（<code>.stream()</code>）、异步（<code>.ainvoke()</code>）、并行、LangSmith 追踪等。</p>

        <h2>3. SequentialChain：串联多个链</h2>
        <p>SimpleSequentialChain 将多个链按顺序串联，前一个输出作为后一个输入：</p>
        <pre><code>from langchain.chains import SimpleSequentialChain

chain1 = LLMChain(llm=llm, prompt=prompt1)  # 翻译为英文
chain2 = LLMChain(llm=llm, prompt=prompt2)  # 对英文结果做摘要
full_chain = SimpleSequentialChain(chains=[chain1, chain2])
result = full_chain.invoke("你好世界")</code></pre>

        <p>如果需要传递多个变量，用 SequentialChain，显式声明每个链的 input_keys 和 output_keys。</p>

        <h2>4. RouterChain：动态路由</h2>
        <p>RouterChain 根据输入内容动态选择最合适的子链处理：</p>
        <pre><code>from langchain.chains.router import MultiPromptChain

physics_template = "你是物理老师。问题：{input}"
math_template = "你是数学老师。问题：{input}"

prompt_infos = [
    {"name": "physics", "description": "适合回答物理问题", "prompt_template": physics_template},
    {"name": "math", "description": "适合回答数学问题", "prompt_template": math_template},
]
chain = MultiPromptChain.from_prompts(llm, prompt_infos)</code></pre>

        <h2>5. 用 LCEL 实现并行</h2>
        <p>用字典语法实现多个 Runnable 并行执行：</p>
        <pre><code>from langchain_core.runnables import RunnablePassthrough

parallel_chain = {
    "translation": translate_chain,
    "summary": summary_chain,
    "original": RunnablePassthrough()
}
result = parallel_chain.invoke("你好世界")</code></pre>

        <h2>本章小结</h2>
        <ul>
          <li>LLMChain = Prompt + LLM + Parser，是最基本的链</li>
          <li>LCEL 用 | 操作符组合组件，推荐替代传统 Chain</li>
          <li>SequentialChain 按顺序串联多个链</li>
          <li>RouterChain 根据输入动态路由到不同子链</li>
        </ul>'''),

(6, "06-memory", "第6章 记忆系统 Memory", '''        <h1>记忆系统 Memory</h1>
        <p>LLM 本身是无状态的——每次调用都是独立的。要让 LLM 应用具备"记忆"，在多轮对话中理解上下文，就需要 Memory 系统。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解 Memory 的作用和分类</li>
          <li>掌握 ConversationBufferMemory、WindowMemory、SummaryMemory</li>
          <li>了解 EntityMemory 和 KnowledgeGraphMemory</li>
          <li>用 RunnableWithMessageHistory 为 LCEL 链添加记忆</li>
        </ul>

        <h2>1. 为什么需要 Memory</h2>
        <p>没有记忆时，每次对话都是全新的，LLM 不知道之前聊过什么。Memory 将历史对话注入下一次调用的 prompt，让 LLM 理解指代和省略。</p>

        <h2>2. ConversationBufferMemory</h2>
        <p>最简单的记忆，存储完整对话历史：</p>
        <pre><code>from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
memory.save_context({"input": "你好"}, {"output": "你好！有什么可以帮你的？"})
print(memory.load_memory_variables({}))</code></pre>
        <p>优点：简单直接，信息完整。缺点：对话越长，token 消耗越大，可能超出上下文窗口。</p>

        <h2>3. ConversationBufferWindowMemory</h2>
        <p>只保留最近 K 轮对话，控制 token 消耗：</p>
        <pre><code>from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(k=5)  # 只保留最近 5 轮</code></pre>

        <h2>4. ConversationSummaryMemory</h2>
        <p>用 LLM 对历史对话生成摘要，用摘要代替原始历史，大幅减少 token：</p>
        <pre><code>from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=llm)</code></pre>
        <p>优点：token 消耗低，适合长对话。缺点：可能丢失细节，且摘要本身需要调用 LLM 增加费用。</p>

        <h2>5. ConversationEntityMemory</h2>
        <p>提取对话中提到的实体（人名、地名、组织等）及其关系，结构化存储：</p>
        <pre><code>from langchain.memory import ConversationEntityMemory

memory = ConversationEntityMemory(llm=llm)</code></pre>

        <h2>6. LCEL 中的记忆</h2>
        <p>新版推荐用 <code>RunnableWithMessageHistory</code> 包装链：</p>
        <pre><code>from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}
def get_session_history(session_id):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="question",
    history_messages_key="history",
)
result = chain_with_history.invoke(
    {"question": "我叫小明"},
    config={"configurable": {"session_id": "user_001"}}
)</code></pre>

        <div class="callout tip">
          <div class="callout-title">💡 记忆策略选择</div>
          <p>短对话 → BufferMemory<br/>
          中等对话 → WindowMemory（k=5~10）<br/>
          长对话 → SummaryMemory 或 SummaryBufferMemory<br/>
          需要实体追踪 → EntityMemory</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>Memory 让 LLM 在多轮对话中保持上下文</li>
          <li>BufferMemory 存完整历史，WindowMemory 只存最近 K 轮，SummaryMemory 存摘要</li>
          <li>EntityMemory 提取并存储实体信息</li>
          <li>LCEL 推荐用 RunnableWithMessageHistory 管理消息历史</li>
        </ul>'''),

(7, "07-data", "第7章 数据连接", '''        <h1>数据连接</h1>
        <p>LLM 应用往往需要处理外部数据：PDF 文档、网页、数据库、CSV 文件……LangChain 提供了 Document Loader 和 Text Splitter 来加载和处理这些数据，为后续的向量化和检索做准备。</p>

        <h2>学习目标</h2>
        <ul>
          <li>使用 Document Loader 加载各种数据源</li>
          <li>理解 Document 对象的结构</li>
          <li>使用 Text Splitter 切分长文档</li>
          <li>掌握 chunk_size 和 chunk_overlap 的调优</li>
        </ul>

        <h2>1. Document 对象</h2>
        <p>LangChain 用 <code>Document</code> 对象表示一段文本，包含两个核心字段：</p>
        <ul>
          <li><code>page_content</code>：文本内容</li>
          <li><code>metadata</code>：元数据字典（来源、页码、创建时间等）</li>
        </ul>

        <h2>2. 常用 Document Loader</h2>

        <div class="term-card">
          <div class="term-name">📄 TextLoader</div>
          <p>加载纯文本文件（.txt）。</p>
        </div>

        <div class="term-card">
          <div class="term-name">📕 PyPDFLoader</div>
          <p>加载 PDF 文件，每页转为一个 Document，metadata 包含页码。</p>
        </div>

        <div class="term-card">
          <div class="term-name">🌐 WebBaseLoader / BSHTMLLoader</div>
          <p>加载网页 HTML 并提取文本。</p>
        </div>

        <div class="term-card">
          <div class="term-name">📊 CSVLoader</div>
          <p>加载 CSV 文件，每行或每列转为 Document。</p>
        </div>

        <pre><code>from langchain_community.document_loaders import PyPDFLoader, TextLoader, WebBaseLoader

# 加载 PDF
loader = PyPDFLoader("docs/产品手册.pdf")
docs = loader.load()

# 加载网页
loader = WebBaseLoader("https://example.com/docs")
docs = loader.load()</code></pre>

        <h2>3. Text Splitter</h2>
        <p>长文档需要切分为较小的 chunk，才能向量化和检索。最常用的是 <code>RecursiveCharacterTextSplitter</code>：</p>

        <pre><code>from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,        # 每个 chunk 的最大字符数
    chunk_overlap=50,      # 相邻 chunk 的重叠字符数
    separators=["\\n\\n", "\\n", "。", "！", "？", " ", ""]
)
chunks = splitter.split_documents(docs)</code></pre>

        <p>它按分隔符列表递归尝试，尽量在段落、句子边界切分，保持语义完整。</p>

        <h2>4. chunk_size 与 chunk_overlap</h2>
        <ul>
          <li><strong>chunk_size</strong>：每个文本块的大小。太小会丢失上下文，太大会引入噪声。常见取值 200-1000 字符。</li>
          <li><strong>chunk_overlap</strong>：相邻块的重叠部分，避免关键信息被切断。通常取 chunk_size 的 10%-20%。</li>
        </ul>

        <div class="callout tip">
          <div class="callout-title">💡 调优建议</div>
          <p>FAQ 类文档：chunk 小一些（200-400），精确匹配<br/>
          长文/报告：chunk 大一些（500-1000），保留上下文<br/>
          overlap 建议 50-100 字符，确保语义连续</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>Document Loader 加载各种数据源为 Document 对象</li>
          <li>Document 含 page_content（文本）和 metadata（元数据）</li>
          <li>RecursiveCharacterTextSplitter 按语义边界切分文档</li>
          <li>chunk_size 和 chunk_overlap 需要根据文档类型调优</li>
        </ul>'''),

(8, "08-embeddings", "第8章 向量数据库与 Embeddings", '''        <h1>向量数据库与 Embeddings</h1>
        <p>要实现语义搜索和 RAG，核心是将文本转换为向量（Embedding），并存入向量数据库进行相似度检索。本章学习 Embedding 原理和常见向量数据库。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解 Embedding 的原理和作用</li>
          <li>使用 OpenAIEmbeddings 生成向量</li>
          <li>掌握常见向量数据库（Chroma、FAISS、Pinecone）</li>
          <li>实现向量存储和相似度搜索</li>
        </ul>

        <h2>1. Embedding 是什么</h2>
        <p>Embedding 将文本转换为高维向量（如 1536 维）。<strong>语义相近的文本，在向量空间中的距离也相近</strong>。这使得"语义搜索"成为可能——不依赖关键词匹配，而是理解文本含义。</p>

        <div class="callout tip">
          <div class="callout-title">💡 重要原则</div>
          <p>查询文本和文档必须用<strong>同一个 embedding 模型</strong>生成向量，才能在同一向量空间中比较相似度。</p>
        </div>

        <h2>2. 使用 OpenAIEmbeddings</h2>
        <pre><code>from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 生成文本向量
vectors = embeddings.embed_documents(["你好", "世界和平", "机器学习"])
query_vec = embeddings.embed_query("人工智能")</code></pre>
        <p><code>text-embedding-3-small</code> 输出 1536 维向量，也可用 <code>dimensions</code> 参数降维。</p>

        <h2>3. 常见向量数据库</h2>

        <div class="term-card">
          <div class="term-name">🟢 Chroma</div>
          <p>轻量级本地向量数据库，易于集成，适合开发和原型。</p>
        </div>

        <div class="term-card">
          <div class="term-name">🔍 FAISS</div>
          <p>Facebook 开源的向量相似度搜索库，本地高效检索，适合大规模数据。</p>
        </div>

        <div class="term-card">
          <div class="term-name">🌲 Pinecone</div>
          <p>托管式云向量数据库服务，支持大规模、高可用，生产环境常用。</p>
        </div>

        <h2>4. 存入向量数据库并检索</h2>
        <pre><code>from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# 从文档创建向量库
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=OpenAIEmbeddings(),
    persist_directory="./chroma_db"
)

# 相似度搜索
results = vectorstore.similarity_search("如何申请退款", k=3)
for doc in results:
    print(doc.page_content)</code></pre>

        <h2>5. 相似度度量</h2>
        <ul>
          <li><strong>余弦相似度（Cosine Similarity）</strong>：衡量向量方向的夹角，最常用，值越接近 1 越相似</li>
          <li><strong>欧氏距离（L2 Distance）</strong>：向量间的直线距离</li>
          <li><strong>内积（Dot Product）</strong>：向量点积</li>
        </ul>

        <h2>本章小结</h2>
        <ul>
          <li>Embedding 将文本转为高维向量，语义相近则向量相近</li>
          <li>查询和文档必须用同一 embedding 模型</li>
          <li>常见向量库：Chroma（本地轻量）、FAISS（本地高效）、Pinecone（云服务）</li>
          <li>用 from_documents 创建向量库，similarity_search 检索</li>
        </ul>'''),

(9, "09-rag", "第9章 RAG 检索增强生成", '''        <h1>RAG 检索增强生成</h1>
        <p>RAG（Retrieval-Augmented Generation，检索增强生成）是 LLM 应用中最重要的技术之一。它通过检索外部知识来增强 LLM 的回答，解决知识过时和幻觉问题，无需微调即可让 LLM 基于私有数据回答。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解 RAG 的核心思想和流程</li>
          <li>掌握构建 RAG 系统的步骤</li>
          <li>使用 RetrievalQA 链实现问答</li>
          <li>理解不同的 chain_type（stuff、map_reduce、refine）</li>
        </ul>

        <h2>1. RAG 是什么</h2>
        <p>RAG 的核心思想：<strong>先检索，再生成</strong>。用户提问时，先从知识库中检索相关文档，然后将文档内容和问题一起传给 LLM，让 LLM 基于检索结果生成回答。</p>

        <h2>2. RAG 的完整流程</h2>
        <p><strong>离线（构建知识库）：</strong></p>
        <ol>
          <li>加载文档（Document Loader）</li>
          <li>切分文档（Text Splitter）</li>
          <li>向量化（Embeddings）</li>
          <li>存入向量数据库（VectorStore）</li>
        </ol>
        <p><strong>在线（回答问题）：</strong></p>
        <ol>
          <li>用户提问</li>
          <li>将问题向量化，从向量库检索相关文档</li>
          <li>将检索结果 + 问题拼入 prompt</li>
          <li>LLM 生成回答</li>
        </ol>

        <h2>3. 用 LangChain 实现 RAG</h2>
        <pre><code>from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# 1. 构建向量库（离线）
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())

# 2. 创建检索器
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 3. 创建 RAG 链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(),
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# 4. 提问
result = qa_chain.invoke("如何申请退款？")
print(result["result"])
print("来源：", [doc.metadata for doc in result["source_documents"]])</code></pre>

        <h2>4. chain_type 详解</h2>

        <div class="term-card">
          <div class="term-name">📦 stuff</div>
          <p>将所有检索文档塞入一个 prompt。简单快速，但文档多时会超出上下文窗口。适合文档少的场景。</p>
        </div>

        <div class="term-card">
          <div class="term-name">🗺️ map_reduce</div>
          <p>先对每个文档单独生成回答（map），再汇总所有回答（reduce）。适合文档多的场景，但调用 LLM 次数多。</p>
        </div>

        <div class="term-card">
          <div class="term-name">✨ refine</div>
          <p>逐个文档处理，每次用前一个的回答和当前文档一起 refine 答案。质量高但慢，适合需要精确综合的场景。</p>
        </div>

        <h2>5. RAG 的优势</h2>
        <ul>
          <li><strong>无需微调</strong>：更新知识库即可，不用重新训练</li>
          <li><strong>知识实时更新</strong>：文档更新后重新向量化即可</li>
          <li><strong>减少幻觉</strong>：基于检索到的事实回答</li>
          <li><strong>可溯源</strong>：回答可以附带来源文档</li>
        </ul>

        <div class="callout warn">
          <div class="callout-title">⚠️ 注意</div>
          <p>RAG 能显著减少幻觉，但不能完全消除。应在 prompt 中要求 LLM "只基于提供的文档回答，如果文档中没有相关信息就说不知道"。</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>RAG = 检索 + 生成，先检索相关文档再让 LLM 回答</li>
          <li>流程：加载→切分→向量化→存储→检索→生成</li>
          <li>RetrievalQA 是 RAG 的核心链</li>
          <li>chain_type：stuff（全塞入）、map_reduce（分批汇总）、refine（逐次优化）</li>
        </ul>'''),

(10, "10-retriever", "第10章 检索器 Retriever", '''        <h1>检索器 Retriever</h1>
        <p>检索质量直接决定 RAG 系统的上限。本章学习各种高级检索策略，提升检索的精准度和召回率。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解 Retriever 接口和基础用法</li>
          <li>掌握 MMR、MultiQuery 等高级检索策略</li>
          <li>了解重排序（Rerank）和混合检索</li>
          <li>使用 ContextualCompressionRetriever 压缩结果</li>
        </ul>

        <h2>1. Retriever 基础</h2>
        <p>Retriever 的核心方法是 <code>get_relevant_documents(query)</code>，返回相关的 Document 列表。最常用的是从 VectorStore 创建：</p>
        <pre><code>retriever = vectorstore.as_retriever(
    search_type="similarity",  # 或 "mmr"
    search_kwargs={"k": 4}
)
docs = retriever.invoke("用户问题")</code></pre>

        <h2>2. MMR 检索</h2>
        <p>MMR（Maximal Marginal Relevance）在相关性和多样性之间平衡，避免返回内容高度重复的文档：</p>
        <pre><code>retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 4, "fetch_k": 20, "lambda_mult": 0.5}
)</code></pre>
        <p><code>lambda_mult</code> 越小越注重多样性，越大越注重相关性。</p>

        <h2>3. MultiQueryRetriever</h2>
        <p>用 LLM 从不同角度生成多个查询，分别检索后合并，提升召回率：</p>
        <pre><code>from langchain.retrievers import MultiQueryRetriever

retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=llm
)</code></pre>

        <h2>4. 重排序（Rerank）</h2>
        <p>先用向量检索召回较多候选文档，再用更强的模型（如 Cohere Rerank、bge-reranker）重新打分排序，提升精度：</p>
        <pre><code>from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerank

compressor = CohereRerank(top_n=3)
retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 20})
)</code></pre>

        <h2>5. ContextualCompressionRetriever</h2>
        <p>用 LLM 或 embedding 对检索结果进行压缩，只保留与查询最相关的片段，减少噪声和 token 消耗。</p>

        <h2>6. EnsembleRetriever 混合检索</h2>
        <p>结合关键词检索（BM25）和向量检索，取长补短：</p>
        <pre><code>from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

bm25_retriever = BM25Retriever.from_documents(chunks)
vector_retriever = vectorstore.as_retriever()

ensemble = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.5, 0.5]
)</code></pre>

        <h2>7. ParentDocumentRetriever</h2>
        <p>将文档切成小 chunk 用于精确检索，但返回该 chunk 所属的完整父文档，兼顾检索精度和上下文完整性。</p>

        <div class="callout tip">
          <div class="callout-title">💡 检索优化策略</div>
          <p>1. 调整 chunk_size 和 k 值<br/>
          2. 使用 MMR 增加多样性<br/>
          3. MultiQuery 提升召回<br/>
          4. Rerank 提升精度<br/>
          5. 混合检索兼顾关键词和语义<br/>
          6. ParentDocument 兼顾精度和上下文</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>Retriever 通过 get_relevant_documents 检索相关文档</li>
          <li>MMR 平衡相关性和多样性，MultiQuery 从多角度检索</li>
          <li>Rerank 用强模型重新排序提升精度</li>
          <li>EnsembleRetriever 混合关键词和向量检索</li>
          <li>ParentDocumentRetriever 检索小块但返回完整父文档</li>
        </ul>'''),

(11, "11-agent", "第11章 Agent 智能体", '''        <h1>Agent 智能体</h1>
        <p>Chain 是固定的执行流程，而 Agent 能自主决策：它根据任务，自己决定调用哪些工具、以什么顺序执行、观察结果后再决定下一步。这让 LLM 应用能完成复杂的多步任务。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解 Agent 的核心思想和 ReAct 模式</li>
          <li>使用 AgentExecutor 运行 Agent</li>
          <li>了解常见的 Agent 类型</li>
          <li>认识 LangGraph 用于复杂 Agent 工作流</li>
        </ul>

        <h2>1. Agent 是什么</h2>
        <p>Agent = LLM（大脑）+ Tools（手脚）。LLM 负责思考和决策，Tools 负责执行具体操作。Agent 会循环执行"思考→行动→观察"直到完成任务。</p>

        <h2>2. ReAct 模式</h2>
        <p>ReAct = Reasoning（推理）+ Acting（行动）。Agent 的典型循环：</p>
        <ol>
          <li><strong>Thought</strong>：思考当前该做什么</li>
          <li><strong>Action</strong>：选择并调用一个工具</li>
          <li><strong>Observation</strong>：获取工具返回结果</li>
          <li>重复以上步骤，直到给出最终答案</li>
        </ol>

        <h2>3. 创建 Agent</h2>
        <pre><code>from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.tools import SerpAPIWrapper

# 定义工具
search = SerpAPIWrapper()
tools = [search]

# 创建 Agent
prompt = ChatPromptTemplate.from_template("""Answer the following questions as best you can.
You have access to the following tools:
{tools}
Use the following format:
Question: {input}
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question
Begin!
{agent_scratchpad}""")

agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=5)
result = executor.invoke({"input": "今天北京天气怎么样？"})</code></pre>

        <h2>4. 常见 Agent 类型</h2>

        <div class="term-card">
          <div class="term-name">⚡ zero-shot-react-description</div>
          <p>不需要示例，直接根据工具描述决定如何使用。最常用。</p>
        </div>

        <div class="term-card">
          <div class="term-name">📋 react-docstore</div>
          <p>结合文档存储的 Agent，适合需要查阅大量文档的任务。</p>
        </div>

        <div class="term-card">
          <div class="term-name">❓ self-ask-with-search</div>
          <p>Agent 自己拆解问题，逐个搜索子问题的答案。</p>
        </div>

        <h2>5. 关键参数</h2>
        <ul>
          <li><code>max_iterations</code>：最大思考-行动循环次数，防止无限循环</li>
          <li><code>early_stopping_method</code>：达到最大迭代时的处理方式（generate 让 LLM 生成最终答案）</li>
          <li><code>handle_parsing_errors</code>：解析错误时让 LLM 自行修正</li>
        </ul>

        <h2>6. LangGraph</h2>
        <p>对于更复杂的、有状态的多 Agent 协作场景，推荐使用 <strong>LangGraph</strong>。它用图（Graph）的方式定义工作流，支持循环、条件分支、多 Agent 协作，比传统 AgentExecutor 更灵活可控。</p>

        <div class="callout tip">
          <div class="callout-title">💡 何时用 Agent</div>
          <p>用 Agent：任务步骤不固定、需要动态决策、需要调用多个工具<br/>
          用 Chain：任务流程固定、可预测</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>Agent = LLM + Tools，自主规划并执行多步任务</li>
          <li>ReAct 模式：Thought → Action → Observation 循环</li>
          <li>AgentExecutor 驱动 Agent 执行循环</li>
          <li>常见类型：zero-shot-react、react-docstore、self-ask-with-search</li>
          <li>LangGraph 适合复杂有状态的多 Agent 工作流</li>
        </ul>'''),

(12, "12-tools", "第12章 工具与函数调用", '''        <h1>工具与函数调用</h1>
        <p>工具（Tool）是 Agent 与外部世界交互的接口。本章学习如何定义、使用工具，以及 Function Calling 的原理。</p>

        <h2>学习目标</h2>
        <ul>
          <li>使用 @tool 装饰器和 Tool 类定义工具</li>
          <li>使用 StructuredTool 处理多参数输入</li>
          <li>理解 Function Calling 的工作原理</li>
          <li>了解常用内置工具</li>
        </ul>

        <h2>1. 定义工具</h2>
        <p>用 <code>@tool</code> 装饰器最简单，函数名成为工具名，docstring 成为描述：</p>
        <pre><code>from langchain_core.tools import tool

@tool
def calculator(expression: str) -> str:
    """计算数学表达式并返回结果。expression 是一个合法的 Python 数学表达式字符串。"""
    try:
        return str(eval(expression))
    except:
        return "计算错误"

print(calculator.name)      # calculator
print(calculator.description)  # docstring</code></pre>

        <h2>2. StructuredTool：多参数输入</h2>
        <p>当工具需要多个结构化参数时，用 StructuredTool + Pydantic：</p>
        <pre><code>from langchain_core.tools import StructuredTool
from pydantic import BaseModel

class WeatherInput(BaseModel):
    city: str
    unit: str = "celsius"

def get_weather(city: str, unit: str = "celsius") -> str:
    return f"{city}今天天气晴，25度{unit}"

weather_tool = StructuredTool.from_function(
    func=get_weather,
    name="get_weather",
    description="获取指定城市的天气",
    args_schema=WeatherInput
)</code></pre>

        <h2>3. Function Calling 原理</h2>
        <p>Function Calling 不是让 LLM 直接执行函数，而是：</p>
        <ol>
          <li>程序将函数名、参数描述、函数说明传给 LLM</li>
          <li>LLM 判断需要调用哪个函数，并输出结构化的函数名和参数</li>
          <li>程序接收后实际执行函数</li>
          <li>将执行结果返回 LLM，LLM 继续生成最终回答</li>
        </ol>
        <p>LangChain 的 Agent 内部就封装了这个流程。</p>

        <h2>4. 常用内置工具</h2>
        <ul>
          <li><strong>SerpAPI / TavilySearch</strong>：网络搜索</li>
          <li><strong>PythonREPL</strong>：执行 Python 代码（计算、数据处理）</li>
          <li><strong>SQLDatabase</strong>：查询 SQL 数据库</li>
          <li><strong>Retriever</strong>：作为工具封装的文档检索</li>
          <li><strong>requests</strong>：发送 HTTP 请求</li>
        </ul>

        <h2>5. 工具使用最佳实践</h2>
        <ul>
          <li>description 要清晰准确，帮助 LLM 正确选择工具</li>
          <li>参数用 Pydantic 模型定义，带 description 说明每个字段</li>
          <li>做好错误处理，工具失败时返回有意义的错误信息</li>
          <li><code>return_direct=True</code> 可让工具结果直接返回用户，不经 LLM 再处理</li>
        </ul>

        <h2>本章小结</h2>
        <ul>
          <li>@tool 装饰器快速定义工具，docstring 作为描述</li>
          <li>StructuredTool 支持多参数结构化输入</li>
          <li>Function Calling：LLM 输出函数名和参数，程序执行后返回结果</li>
          <li>常用工具：搜索、PythonREPL、SQLDatabase、Retriever</li>
        </ul>'''),

(13, "13-lcel", "第13章 LCEL 表达式语言", '''        <h1>LCEL 表达式语言</h1>
        <p>LCEL（LangChain Expression Language）是 LangChain 的声明式组合语言，用管道符 <code>|</code> 将组件组合成链。它是新版 LangChain 的推荐写法，原生支持流式、异步、并行、可观测性。</p>

        <h2>学习目标</h2>
        <ul>
          <li>用 | 操作符组合 Runnable 组件</li>
          <li>理解 Runnable 接口（invoke、stream、batch）</li>
          <li>使用 RunnableLambda、RunnablePassthrough、RunnableParallel</li>
          <li>掌握 bind、with_config、with_fallback 等方法</li>
        </ul>

        <h2>1. 基础组合</h2>
        <pre><code>from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("用{style}的风格解释{topic}")
llm = ChatOpenAI()
parser = StrOutputParser()

chain = prompt | llm | parser
result = chain.invoke({"style": "简洁", "topic": "RAG"})
print(result)</code></pre>

        <h2>2. Runnable 接口方法</h2>
        <ul>
          <li><code>invoke(input)</code>：同步执行，返回结果</li>
          <li><code>stream(input)</code>：流式输出，返回迭代器</li>
          <li><code>batch(inputs)</code>：批量执行多个输入</li>
          <li><code>ainvoke / astream / abatch</code>：异步版本</li>
        </ul>

        <h2>3. RunnableLambda</h2>
        <p>将普通函数包装为 Runnable：</p>
        <pre><code>from langchain_core.runnables import RunnableLambda

def upper_case(text):
    return text.upper()

runnable = RunnableLambda(upper_case)
chain = prompt | llm | parser | runnable</code></pre>

        <h2>4. RunnablePassthrough</h2>
        <p>将输入原样传递，常用于保留原始输入：</p>
        <pre><code>from langchain_core.runnables import RunnablePassthrough

chain = {
    "question": RunnablePassthrough(),
    "context": retriever,
} | prompt | llm | parser</code></pre>

        <h2>5. 并行执行</h2>
        <p>用字典语法实现并行：</p>
        <pre><code>parallel = {
    "translation": translate_chain,
    "summary": summary_chain,
}
result = parallel.invoke("你好世界")
# result = {"translation": "...", "summary": "..."}</code></pre>

        <h2>6. 实用方法</h2>
        <ul>
          <li><code>.bind(stop=["\\n"])</code>：绑定额外参数（如停止词、tools）</li>
          <li><code>.with_config(tags=["debug"])</code>：配置 tags、metadata 等</li>
          <li><code>.with_fallback(fallback_chain)</code>：主链失败时切换到备用链</li>
          <li><code>.with_retry(stop_after_attempt=3)</code>：失败重试</li>
        </ul>

        <pre><code>from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: "数学" in x["topic"], math_chain),
    (lambda x: "物理" in x["topic"], physics_chain),
    general_chain  # 默认分支
)</code></pre>

        <div class="callout tip">
          <div class="callout-title">💡 为什么用 LCEL</div>
          <p>1. 原生支持流式输出和异步<br/>
          2. 自动集成 LangSmith 追踪<br/>
          3. 支持并行、分支、重试、降级<br/>
          4. 组合灵活，代码更简洁</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>LCEL 用 | 组合 Runnable，是新版推荐写法</li>
          <li>Runnable 支持 invoke、stream、batch 及异步版本</li>
          <li>RunnableLambda 包装函数，RunnablePassthrough 透传输入</li>
          <li>字典语法实现并行，RunnableBranch 实现条件分支</li>
          <li>bind、with_config、with_fallback、with_retry 提供高级控制</li>
        </ul>'''),

(14, "14-multimodal", "第14章 多模态与流式输出", '''        <h1>多模态与流式输出</h1>
        <p>现代 LLM 不仅能处理文本，还能理解图像（多模态）；流式输出让用户实时看到生成过程。本章学习这两个实用特性。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解多模态 LLM 的概念</li>
          <li>在 LangChain 中传入图片让 LLM 理解</li>
          <li>使用流式输出提升用户体验</li>
          <li>了解异步流式处理</li>
        </ul>

        <h2>1. 多模态 LLM</h2>
        <p>多模态模型（如 GPT-4V、Claude 3、Gemini）能同时理解文本和图像。LangChain 通过在 HumanMessage 的 content 中传入 image_url 来支持。</p>

        <h2>2. 传入图片</h2>
        <pre><code>from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")

message = HumanMessage(
    content=[
        {"type": "text", "text": "这张图片里有什么？"},
        {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}},
    ]
)
response = llm.invoke([message])
print(response.content)</code></pre>

        <p>图片可以是 URL，也可以是 base64 编码：</p>
        <pre><code>import base64
with open("image.png", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()
message = HumanMessage(content=[
    {"type": "text", "text": "描述这张图片"},
    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
])</code></pre>

        <h2>3. 流式输出</h2>
        <p>用 <code>.stream()</code> 方法逐步获取 LLM 输出：</p>
        <pre><code>for chunk in chain.stream({"topic": "RAG"}):
    print(chunk, end="", flush=True)</code></pre>
        <p>每个 chunk 是生成的一小段文本，实时打印出来，用户体验更好。</p>

        <h2>4. 异步流式</h2>
        <pre><code>async for chunk in chain.astream({"topic": "RAG"}):
    print(chunk, end="", flush=True)</code></pre>

        <h2>5. 多模态应用场景</h2>
        <ul>
          <li>图片描述生成（为图片生成文字说明）</li>
          <li>图表数据分析（让 LLM 解读图表）</li>
          <li>文档 OCR 问答（上传文档图片进行问答）</li>
          <li>界面理解与自动化（理解 UI 截图并操作）</li>
        </ul>

        <h2>6. 音频处理</h2>
        <p>LangChain 本身不直接处理音频，通常先用 Whisper 等语音识别模型将音频转为文字，再交给 LLM 处理：</p>
        <pre><code># 用 OpenAI Whisper 转写音频
from openai import OpenAI
client = OpenAI()
transcript = client.audio.transcriptions.create(
    model="whisper-1", file=open("audio.mp3", "rb")
)
print(transcript.text)</code></pre>

        <h2>本章小结</h2>
        <ul>
          <li>多模态 LLM 能理解文本和图像，通过 image_url 传入图片</li>
          <li>图片可用 URL 或 base64 编码</li>
          <li>.stream() 流式输出，实时展示生成过程</li>
          <li>音频先用 Whisper 转文字再处理</li>
        </ul>'''),

(15, "15-chatbot", "第15章 对话系统构建", '''        <h1>对话系统构建</h1>
        <p>对话系统（Chatbot）是 LLM 应用最常见的形态。本章学习如何用 LangChain 构建一个具备多轮对话能力的聊天机器人。</p>

        <h2>学习目标</h2>
        <ul>
          <li>用 ConversationChain 构建基础对话</li>
          <li>用 RunnableWithMessageHistory 管理会话历史</li>
          <li>处理长对话的上下文溢出</li>
          <li>结合 RAG 实现带知识库的对话</li>
        </ul>

        <h2>1. 基础对话链</h2>
        <pre><code>from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

conversation = ConversationChain(
    llm=llm,
    memory=ConversationBufferMemory(),
    verbose=True
)
conversation.invoke("你好，我叫小明")
conversation.invoke("我叫什么名字？")  # 会记住"小明"</code></pre>

        <h2>2. 用 LCEL 构建对话系统</h2>
        <pre><code>from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个友好的客服机器人，用中文回答用户问题。"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}")
])
chain = prompt | llm

store = {}
def get_history(session_id):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

chain_with_history = RunnableWithMessageHistory(
    chain,
    get_history,
    input_messages_key="question",
    history_messages_key="history",
)

chain_with_history.invoke(
    {"question": "你好"},
    config={"configurable": {"session_id": "user123"}}
)</code></pre>

        <h2>3. 处理长对话</h2>
        <p>对话历史过长会超出上下文窗口，常用策略：</p>
        <ul>
          <li><strong>滑动窗口</strong>：只保留最近 K 轮</li>
          <li><strong>摘要压缩</strong>：用 LLM 将旧对话压缩为摘要</li>
          <li><strong>检索历史</strong>：将历史对话向量化，检索相关历史而非全部传入</li>
        </ul>

        <h2>4. 对话 + RAG</h2>
        <p>结合知识库的对话系统，让 AI 既能记住对话，又能基于知识库回答：</p>
        <pre><code>prompt = ChatPromptTemplate.from_messages([
    ("system", "基于以下上下文回答用户问题。如果上下文没有相关信息，就说不知道。\\n上下文：{context}"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}")
])

def format_docs(docs):
    return "\\n".join(doc.page_content for doc in docs)

chain = (
    {
        "context": itemgetter("question") | retriever | format_docs,
        "question": itemgetter("question"),
        "history": itemgetter("history"),
    }
    | prompt | llm | parser
)</code></pre>

        <h2>5. 生产环境的会话存储</h2>
        <p>生产环境不要用内存存储历史，应用 Redis、数据库等持久化存储，支持多实例共享：</p>
        <ul>
          <li><strong>Redis</strong>：高性能，适合会话缓存</li>
          <li><strong>PostgreSQL / MongoDB</strong>：持久化存储</li>
          <li><strong>LangChain 的 RedisChatMessageHistory</strong>：开箱即用</li>
        </ul>

        <h2>本章小结</h2>
        <ul>
          <li>ConversationChain 快速构建带记忆的对话</li>
          <li>RunnableWithMessageHistory 为 LCEL 链添加会话管理</li>
          <li>长对话用滑动窗口、摘要、检索历史等策略控制长度</li>
          <li>对话 + RAG 实现基于知识库的智能客服</li>
          <li>生产环境用 Redis 等持久化存储会话</li>
        </ul>'''),

(16, "16-eval", "第16章 评估与监控", '''        <h1>评估与监控</h1>
        <p>LLM 应用的输出灵活多变，传统单元测试难以覆盖。本章学习如何用 LangSmith 监控、调试和评估 LLM 应用，建立质量保障体系。</p>

        <h2>学习目标</h2>
        <ul>
          <li>理解 LLM 应用评估的挑战</li>
          <li>使用 LangSmith 进行追踪和调试</li>
          <li>掌握 LLM-as-judge 评估方法</li>
          <li>了解常见评估指标（正确率、相关性、MRR 等）</li>
        </ul>

        <h2>1. LLM 应用评估的挑战</h2>
        <p>与传统软件不同，LLM 应用的输出没有唯一标准答案，同一个输入可能产生多种合理输出。这使得"断言"式测试失效，需要专门的评估方法：</p>
        <ul>
          <li><strong>LLM-as-judge</strong>：用一个更强的 LLM 作为评判者，对输出打分</li>
          <li><strong>人工评估</strong>：人工标注标准答案，对照评估</li>
          <li><strong>自动化评估器</strong>：基于规则或统计的评估器</li>
        </ul>

        <h2>2. LangSmith 可观测性平台</h2>
        <p>LangSmith 是 LangChain 官方的可观测性平台，提供追踪、调试、评估能力：</p>
        <pre><code># 设置环境变量开启追踪
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "你的 API Key"
os.environ["LANGCHAIN_PROJECT"] = "my-project"</code></pre>
        <p>开启后，每次链的执行（输入、输出、每一步的中间结果、token 消耗、耗时）都会自动记录到 LangSmith，可在 Web 界面查看和调试。</p>

        <h2>3. LLM-as-judge 评估</h2>
        <p>用 LLM 作为评判者，评估输出的正确性、相关性、有害性等：</p>
        <pre><code>from langchain.evaluation import load_evaluator
from langchain_openai import ChatOpenAI

evaluator = load_evaluator("qa", llm=ChatOpenAI())
result = evaluator.evaluate_strings(
    prediction="RAG 是检索增强生成",
    reference="RAG（Retrieval-Augmented Generation）通过检索外部知识增强 LLM 回答",
    input="什么是 RAG？"
)
print(result["score"])</code></pre>

        <h2>4. 常见评估维度</h2>

        <div class="term-card">
          <div class="term-name">✅ 正确性</div>
          <p>回答是否事实正确、与标准答案一致。</p>
        </div>

        <div class="term-card">
          <div class="term-name">🎯 相关性</div>
          <p>回答是否切题，是否回答了用户的问题。</p>
        </div>

        <div class="term-card">
          <div class="term-name">🛡️ 安全性</div>
          <p>是否包含有害、偏见、违规内容。</p>
        </div>

        <div class="term-card">
          <div class="term-name">⚡ 性能指标</div>
          <p>延迟、token 消耗、成本等工程指标。</p>
        </div>

        <h2>5. 检索质量评估</h2>
        <p>对于 RAG 系统，检索质量直接决定回答上限，常用指标：</p>
        <ul>
          <li><strong>Hit Rate（命中率）</strong>：相关文档是否出现在 Top-K 结果中</li>
          <li><strong>MRR（Mean Reciprocal Rank）</strong>：第一个相关文档的排名倒数的平均值</li>
          <li><strong>NDCG</strong>：考虑排名位置的归一化折损累计增益</li>
        </ul>

        <h2>6. LangSmith Dataset 批量评估</h2>
        <p>用 Dataset 存储评估样本，对链进行批量回归测试：</p>
        <pre><code>from langsmith import Client

client = Client()
dataset = client.create_dataset("qa-eval")
client.create_example(
    inputs={"question": "如何退款？"},
    outputs={"answer": "联系客服申请退款"},
    dataset_id=dataset.id
)</code></pre>

        <div class="callout tip">
          <div class="callout-title">💡 评估实践建议</div>
          <p>1. 建立有代表性的评估数据集，覆盖典型场景<br/>
          2. 每次代码变更后跑回归评估，防止质量退化<br/>
          3. 结合 LLM-as-judge 和人工抽样评估<br/>
          4. 关注成本和延迟，不仅是正确率</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>LLM 输出无固定答案，需专门评估方法</li>
          <li>LangSmith 提供追踪、调试、评估一站式能力</li>
          <li>LLM-as-judge 用强模型评估输出质量</li>
          <li>评估维度：正确性、相关性、安全性、性能</li>
          <li>检索质量用 Hit Rate、MRR、NDCG 等指标</li>
        </ul>'''),

(17, "17-production", "第17章 生产部署", '''        <h1>生产部署</h1>
        <p>从原型到生产，需要关注异步并发、缓存、限流、部署等工程问题。本章学习如何将 LangChain 应用稳定、高效地部署上线。</p>

        <h2>学习目标</h2>
        <ul>
          <li>使用异步调用提升并发性能</li>
          <li>理解缓存机制减少重复调用</li>
          <li>掌握限流和降级策略</li>
          <li>用 LangServe 将链部署为 API</li>
        </ul>

        <h2>1. 异步调用</h2>
        <p>LLM API 调用通常较慢（几秒），同步调用会阻塞线程。用异步方法可大幅提升并发：</p>
        <pre><code>import asyncio

async def main():
    result = await chain.ainvoke({"topic": "RAG"})
    print(result)

asyncio.run(main())</code></pre>
        <p>所有 Runnable 都支持异步版本：<code>ainvoke</code>、<code>astream</code>、<code>abatch</code>。</p>

        <h2>2. 批量处理</h2>
        <p>用 <code>batch</code> 一次处理多个输入，减少网络开销：</p>
        <pre><code>results = chain.batch([
    {"topic": "RAG"},
    {"topic": "Agent"},
    {"topic": "Memory"},
])</code></pre>

        <h2>3. 缓存</h2>
        <p>对相同输入缓存 LLM 输出，避免重复调用，降低费用和延迟：</p>
        <pre><code>from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

set_llm_cache(InMemoryCache())

# 第二次相同输入会从缓存读取
result1 = chain.invoke({"topic": "RAG"})
result2 = chain.invoke({"topic": "RAG"})  # 命中缓存，不调用 API</code></pre>
        <p>生产环境可用 Redis 缓存（<code>RedisCache</code>），支持多实例共享。</p>

        <h2>4. 限流与降级</h2>
        <ul>
          <li><strong>限流（Rate Limiting）</strong>：控制请求速率，防止超出 API 配额或触发封禁</li>
          <li><strong>重试（Retry）</strong>：网络抖动或 429 错误时自动重试，<code>with_retry</code></li>
          <li><strong>降级（Fallback）</strong>：主模型不可用时切换到备用模型，<code>with_fallback</code></li>
        </ul>
        <pre><code>chain = prompt | llm.with_retry(stop_after_attempt=3).with_fallback(fallback_llm)</code></pre>

        <h2>5. LangServe 部署为 API</h2>
        <p>LangServe 可将 LangChain 链快速部署为 REST API，支持流式输出：</p>
        <pre><code>from langserve import add_routes
from fastapi import FastAPI

app = FastAPI()
add_routes(app, chain, path="/chat")

# uvicorn server:app --host 0.0.0.0 --port 8000</code></pre>
        <p>客户端调用：<code>POST /chat/invoke</code> 或 <code>POST /chat/stream</code>。</p>

        <h2>6. 容器化部署</h2>
        <p>用 Docker 打包应用，便于部署和扩展：</p>
        <pre><code>FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]</code></pre>

        <h2>7. 生产环境检查清单</h2>
        <ul>
          <li>✅ 异步调用和批量处理，提升并发</li>
          <li>✅ 缓存重复请求，降低成本</li>
          <li>✅ 限流、重试、降级，保障稳定性</li>
          <li>✅ LangSmith 监控，追踪错误和性能</li>
          <li>✅ 容器化部署，便于扩展</li>
          <li>✅ 密钥管理（不用硬编码 API Key）</li>
        </ul>

        <h2>本章小结</h2>
        <ul>
          <li>异步调用（ainvoke/astream）提升并发性能</li>
          <li>缓存减少重复 LLM 调用，降低成本</li>
          <li>限流、重试、降级保障服务稳定</li>
          <li>LangServe 一键将链部署为 REST API</li>
          <li>容器化部署便于扩展和运维</li>
        </ul>'''),

(18, "18-project-cs", "第18章 实战：智能客服", '''        <h1>实战：智能客服机器人</h1>
        <p>本章综合运用前面所学，从零构建一个具备多轮对话和知识库问答能力的智能客服机器人。</p>

        <h2>学习目标</h2>
        <ul>
          <li>整合 RAG + Memory 构建客服系统</li>
          <li>实现意图识别和多轮对话</li>
          <li>添加工具调用（查询订单、转人工）</li>
          <li>用 LangServe 部署客服 API</li>
        </ul>

        <h2>1. 项目架构</h2>
        <p>智能客服核心能力：</p>
        <ul>
          <li><strong>FAQ 问答</strong>：基于知识库回答常见问题</li>
          <li><strong>多轮对话</strong>：记住上下文，理解指代</li>
          <li><strong>意图识别</strong>：区分咨询、投诉、查订单等意图</li>
          <li><strong>工具调用</strong>：查询订单、转人工客服等操作</li>
        </ul>

        <h2>2. 构建知识库</h2>
        <pre><code>from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

loader = TextLoader("faq.txt")
docs = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings(), persist_directory="./cs_db")
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})</code></pre>

        <h2>3. 定义工具</h2>
        <pre><code>from langchain_core.tools import tool

@tool
def query_order(order_id: str) -> str:
    """根据订单号查询订单状态。order_id 是订单编号。"""
    # 实际项目中查数据库
    return f"订单 {order_id} 状态：已发货，预计明天送达"

@tool
def transfer_to_human(reason: str) -> str:
    """转接人工客服。reason 是转接原因。"""
    return f"已为您转接人工客服，原因：{reason}，请稍候..."

tools = [query_order, transfer_to_human]</code></pre>

        <h2>4. 组装客服 Agent</h2>
        <pre><code>from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的电商客服。用中文回答，语气友好。\n"
               "如果用户问常见问题，请基于知识库回答。\n"
               "如果用户要查订单，使用 query_order 工具。\n"
               "如果用户要求人工或问题无法解决，使用 transfer_to_human。"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

store = {}
def get_history(session_id):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

agent_with_history = RunnableWithMessageHistory(
    agent_executor,
    get_history,
    input_messages_key="input",
    history_messages_key="history",
)</code></pre>

        <h2>5. 整合 RAG 知识</h2>
        <p>将检索器作为工具加入 Agent，让 Agent 自主决定是否查询知识库：</p>
        <pre><code>from langchain.tools.retriever import create_retriever_tool

retriever_tool = create_retriever_tool(
    retriever,
    name="faq_search",
    description="搜索常见问题知识库，回答用户咨询"
)
tools.append(retriever_tool)</code></pre>

        <h2>6. 部署为 API</h2>
        <pre><code>from langserve import add_routes
from fastapi import FastAPI

app = FastAPI(title="智能客服")
add_routes(app, agent_with_history, path="/customer-service")

# uvicorn app:app --port 8000</code></pre>

        <h2>7. 测试对话</h2>
        <pre><code>response = agent_with_history.invoke(
    {"input": "我买的东西什么时候到？订单号 A123"},
    config={"configurable": {"session_id": "user_001"}}
)
print(response["output"])

# 第二轮对话，Agent 能记住上下文
response = agent_with_history.invoke(
    {"input": "那如果我想退款呢？"},
    config={"configurable": {"session_id": "user_001"}}
)</code></pre>

        <div class="callout tip">
          <div class="callout-title">💡 客服系统优化方向</div>
          <p>1. 增加满意度评价反馈<br/>
          2. 用 LangSmith 监控对话质量<br/>
          3. 敏感词过滤和安全审核<br/>
          4. 多轮对话的摘要压缩<br/>
          5. A/B 测试不同 prompt 效果</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>智能客服 = RAG 知识库 + Memory 多轮对话 + Tools 工具调用</li>
          <li>用 Agent 统一协调检索、查订单、转人工等能力</li>
          <li>create_retriever_tool 将检索器封装为工具</li>
          <li>LangServe 部署为 API，供前端调用</li>
        </ul>'''),

(19, "19-project-kb", "第19章 实战：企业知识库问答系统", '''        <h1>实战：企业知识库问答系统</h1>
        <p>本章构建一个企业级知识库问答系统，支持多格式文档导入、增量更新、权限控制和高效检索。</p>

        <h2>学习目标</h2>
        <ul>
          <li>支持多格式文档（PDF、Word、网页）导入</li>
          <li>实现增量更新和文档版本管理</li>
          <li>优化检索策略（混合检索 + 重排序）</li>
          <li>添加引用来源展示</li>
        </ul>

        <h2>1. 系统架构</h2>
        <p>企业知识库系统的核心模块：</p>
        <ul>
          <li><strong>文档管理</strong>：上传、解析、切分、向量化</li>
          <li><strong>检索引擎</strong>：混合检索 + 重排序</li>
          <li><strong>问答生成</strong>：基于检索结果生成回答</li>
          <li><strong>引用展示</strong>：回答附带来源文档</li>
        </ul>

        <h2>2. 多格式文档加载</h2>
        <pre><code>from langchain_community.document_loaders import (
    PyPDFLoader, Docx2txtLoader, WebBaseLoader, CSVLoader
)

def load_document(file_path):
    if file_path.endswith(".pdf"):
        return PyPDFLoader(file_path).load()
    elif file_path.endswith(".docx"):
        return Docx2txtLoader(file_path).load()
    elif file_path.endswith(".csv"):
        return CSVLoader(file_path).load()
    elif file_path.startswith("http"):
        return WebBaseLoader(file_path).load()
    else:
        from langchain_community.document_loaders import TextLoader
        return TextLoader(file_path).load()</code></pre>

        <h2>3. 文档切分与元数据</h2>
        <pre><code>from langchain.text_splitter import RecursiveCharacterTextSplitter
import hashlib

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    separators=["\\n\\n", "\\n", "。", "！", "？", " ", ""]
)

def process_document(file_path, source_name):
    docs = load_document(file_path)
    chunks = splitter.split_documents(docs)
    doc_id = hashlib.md5(file_path.encode()).hexdigest()[:8]
    for chunk in chunks:
        chunk.metadata["doc_id"] = doc_id
        chunk.metadata["source"] = source_name
    return chunks, doc_id</code></pre>

        <h2>4. 向量库与增量更新</h2>
        <pre><code>from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma(
    persist_directory="./kb_db",
    embedding_function=OpenAIEmbeddings()
)

def add_documents(chunks):
    vectorstore.add_documents(chunks)

def delete_document(doc_id):
    # 根据 metadata 中的 doc_id 删除
    vectorstore._collection.delete(
        where={"doc_id": doc_id}
    )</code></pre>

        <h2>5. 混合检索 + 重排序</h2>
        <pre><code>from langchain.retrievers import EnsembleRetriever, ContextualCompressionRetriever
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers.document_compressors import LLMChainExtractor

bm25 = BM25Retriever.from_documents(all_chunks)
bm25.k = 10
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

ensemble = EnsembleRetriever(
    retrievers=[bm25, vector_retriever],
    weights=[0.4, 0.6]
)

# 用 LLM 压缩，只保留相关片段
compressor = LLMChainExtractor.from_llm(llm)
retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=ensemble
)</code></pre>

        <h2>6. 问答链 + 引用来源</h2>
        <pre><code>from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from operator import itemgetter

prompt = ChatPromptTemplate.from_template("""
基于以下上下文回答用户问题。
如果上下文中没有答案，请回答"根据知识库无法回答该问题"。
回答末尾请列出引用来源。

上下文：
{context}

问题：{question}
""")

def format_with_sources(docs):
    context = ""
    sources = []
    for i, doc in enumerate(docs, 1):
        context += f"[{i}] {doc.page_content}\\n"
        sources.append(f"[{i}] {doc.metadata.get('source', '未知')}")
    return context, sources

chain = (
    {
        "context": itemgetter("question") | retriever,
        "question": itemgetter("question"),
    }
    | prompt | llm | StrOutputParser()
)

def ask(question):
    docs = retriever.invoke(question)
    context, sources = format_with_sources(docs)
    answer = chain.invoke({"question": question, "context": context})
    return answer + "\\n\\n引用来源：\\n" + "\\n".join(sources)</code></pre>

        <h2>7. 权限控制（简化版）</h2>
        <p>企业知识库常需权限控制，可通过 metadata 过滤实现：</p>
        <pre><code># 添加文档时设置权限
chunk.metadata["department"] = "研发部"

# 检索时按部门过滤
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 5,
        "filter": {"department": "研发部"}
    }
)</code></pre>

        <div class="callout tip">
          <div class="callout-title">💡 企业知识库优化</div>
          <p>1. 用 ParentDocumentRetriever 兼顾精度和上下文<br/>
          2. 定期评估检索质量（Hit Rate、MRR）<br/>
          3. 文档更新时用 doc_id 做增量替换<br/>
          4. 缓存高频问题的回答<br/>
          5. 用 LangSmith 监控和调试问答效果</p>
        </div>

        <h2>本章小结</h2>
        <ul>
          <li>企业知识库支持多格式文档加载和解析</li>
          <li>用 doc_id 实现文档的增量更新和版本管理</li>
          <li>混合检索（BM25 + 向量）+ 重排序提升精度</li>
          <li>回答附带引用来源，增加可信度</li>
          <li>通过 metadata 过滤实现权限控制</li>
        </ul>'''),

(20, "20-interview", "第20章 面试与就业准备", '''        <h1>面试与就业准备</h1>
        <p>学完前面的内容，你已具备 LangChain 应用开发的核心能力。本章总结常见面试题、简历要点和求职策略，帮助你顺利拿到 LLM 应用开发岗位。</p>

        <h2>学习目标</h2>
        <ul>
          <li>掌握 LangChain 常见面试题</li>
          <li>了解 LLM 应用开发岗位的技能要求</li>
          <li>学会简历中突出 LLM 项目经验</li>
          <li>准备求职策略和学习路径</li>
        </ul>

        <h2>1. 核心概念面试题</h2>

        <div class="term-card">
          <div class="term-name">Q：LangChain 的核心组件有哪些？</div>
          <p>答：Prompt（提示）、LLM（模型）、Chain（链）、Memory（记忆）、Tool（工具）、Agent（智能体）、Retriever（检索器）、VectorStore（向量存储）。</p>
        </div>

        <div class="term-card">
          <div class="term-name">Q：RAG 的完整流程是什么？</div>
          <p>答：离线阶段：加载文档→切分→向量化→存入向量库。在线阶段：用户提问→检索相关文档→拼接 prompt→LLM 生成回答。</p>
        </div>

        <div class="term-card">
          <div class="term-name">Q：Chain 和 Agent 的区别？</div>
          <p>答：Chain 是固定的执行流程，步骤预先定义好；Agent 由 LLM 自主决策调用哪些工具、以什么顺序执行，适合动态、多步的复杂任务。</p>
        </div>

        <h2>2. 技术深度面试题</h2>

        <div class="term-card">
          <div class="term-name">Q：如何优化 RAG 的检索效果？</div>
          <p>答：1. 调整 chunk_size 和 overlap；2. 使用 MMR 增加多样性；3. MultiQuery 从多角度检索；4. 混合检索（BM25 + 向量）；5. 重排序（Rerank）；6. ParentDocumentRetriever 兼顾精度和上下文。</p>
        </div>

        <div class="term-card">
          <div class="term-name">Q：如何处理长对话的上下文溢出？</div>
          <p>答：1. 滑动窗口只保留最近 K 轮；2. 用 LLM 对旧对话生成摘要；3. 将历史对话向量化，检索相关历史而非全部传入；4. 结合以上多种策略。</p>
        </div>

        <div class="term-card">
          <div class="term-name">Q：如何减少 LLM 的幻觉？</div>
          <p>答：1. 使用 RAG 让模型基于检索到的事实回答；2. 在 prompt 中明确要求"只基于提供的文档回答，不知道就说不知道"；3. 降低 Temperature；4. 对输出进行事实校验；5. 提供引用来源让用户验证。</p>
        </div>

        <h2>3. LCEL 相关面试题</h2>

        <div class="term-card">
          <div class="term-name">Q：LCEL 相比传统 Chain 的优势？</div>
          <p>答：1. 原生支持流式输出（stream）和异步（ainvoke）；2. 支持并行、分支、重试、降级；3. 自动集成 LangSmith 追踪；4. 组合灵活，代码更简洁直观。</p>
        </div>

        <div class="term-card">
          <div class="term-name">Q：RunnablePassthrough 的作用？</div>
          <p>答：将输入原样传递，常用于保留原始输入供后续步骤使用。例如在 RAG 中同时传递原始问题和检索到的上下文。</p>
        </div>

        <h2>4. 简历要点</h2>
        <ul>
          <li><strong>项目经历</strong>：重点描述 RAG、Agent、对话系统等 LLM 应用项目，说明技术选型和解决的问题</li>
          <li><strong>量化成果</strong>：用数据说话，如"检索准确率提升 30%"、"支持日均 10 万次问答"</li>
          <li><strong>技术栈</strong>：LangChain、LangGraph、向量数据库（Chroma/FAISS/Pinecone）、Embedding 模型、Prompt 工程</li>
          <li><strong>GitHub</strong>：放上学习项目和实战项目的代码仓库</li>
        </ul>

        <h2>5. 岗位技能要求</h2>
        <ul>
          <li>✅ Python 编程基础扎实</li>
          <li>✅ 熟悉 LangChain / LlamaIndex 等 LLM 框架</li>
          <li>✅ 理解 RAG、Agent、Prompt 工程等核心概念</li>
          <li>✅ 熟悉向量数据库和 Embedding</li>
          <li>✅ 了解 LLM API 调用和成本优化</li>
          <li>✅ 加分项：LangGraph、LangSmith、LangServe 生产部署经验</li>
        </ul>

        <h2>6. 后续学习路径</h2>
        <ul>
          <li><strong>深入 LangGraph</strong>：复杂多 Agent 工作流编排</li>
          <li><strong>学习 LlamaIndex</strong>：另一个主流 LLM 数据框架</li>
          <li><strong>研究模型微调</strong>：LoRA、QLoRA 等高效微调</li>
          <li><strong>关注前沿</strong>：多模态、Agent 协作、AI 编程等方向</li>
          <li><strong>持续实战</strong>：在 GitHub 上做项目，参加黑客松</li>
        </ul>

        <div class="callout tip">
          <div class="callout-title">💡 求职策略</div>
          <p>1. 先做出 2-3 个完整项目（如本课程的客服和知识库）<br/>
          2. 写技术博客分享学习心得，建立个人品牌<br/>
          3. 投递 LLM 应用开发、AI 工程师、RAG 工程师等岗位<br/>
          4. 面试时多讲项目细节和技术决策<br/>
          5. 保持对 LLM 新技术的关注和学习</p>
        </div>

        <h2>🎉 恭喜完成 LangChain Quest！</h2>
        <p>你已经从零开始，系统学习了 LangChain 的核心概念、组件、实战项目和求职准备。继续保持学习和实践，相信你能在 LLM 应用开发领域找到理想的工作！</p>

        <h2>本章小结</h2>
        <ul>
          <li>掌握 RAG、Agent、Memory、LCEL 等核心概念面试题</li>
          <li>简历重点突出 LLM 项目经历和量化成果</li>
          <li>岗位要求：Python + LangChain + 向量数据库 + RAG/Agent</li>
          <li>持续学习 LangGraph、LlamaIndex、模型微调等进阶方向</li>
        </ul>'''),
]

# 生成章节 HTML 文件
def generate():
    os.makedirs(CHAPTERS_DIR, exist_ok=True)
    for num, chapter_id, title, content in CHAPTERS:
        html = CHAPTER_TEMPLATE.format(
            title=title,
            chapter_id=chapter_id,
            chapter_num=num,
            content=content
        )
        filepath = os.path.join(CHAPTERS_DIR, f"{chapter_id}.html")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"生成: {filepath}")
    print(f"共生成 {len(CHAPTERS)} 个章节文件")

if __name__ == "__main__":
    generate()
