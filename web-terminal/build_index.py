#!/usr/bin/env python3
"""把复制/粘贴工具栏内联进 ttyd 的 index.html（幂等）。

index.base.html 是 ttyd 原生页面（只保留 ${{ 的转义修复）；
每次运行都从 base 重新生成 index.html，避免重复注入。
"""
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(BASE, "index.html")
SRC = os.path.join(BASE, "index.base.html")
HOOK = os.path.join(BASE, "ttyd-hook.js")
UI = os.path.join(BASE, "ttyd-ui.js")

MARKERS = ("var Native = window.WebSocket;", "wrap.id = 'cka-tools';")


def strip_injected(html):
    """去掉之前注入的 <script> 块。"""
    for marker in MARKERS:
        pos = html.find(marker)
        if pos < 0:
            continue
        start = html.rfind("<script>", 0, pos)
        end = html.find("</script>", pos)
        if start < 0 or end < 0:
            continue
        html = html[:start] + html[end + len("</script>"):]
    return html


def main():
    src = SRC if os.path.exists(SRC) else INDEX
    html = open(src, encoding="utf-8").read()
    html = strip_injected(html)

    hook = open(HOOK, encoding="utf-8").read()
    ui = open(UI, encoding="utf-8").read()

    # hook 必须早于 ttyd bundle 执行
    head_end = html.rfind("</head>")
    html = html[:head_end] + "<script>" + hook + "</script>" + html[head_end:]

    # UI 在 bundle 之后
    body_end = html.rfind("</body>")
    html = html[:body_end] + "<script>" + ui + "</script>" + html[body_end:]

    # ttyd 会把 index 当 Go 模板渲染，JS 模板字符串里的 ${{ 会被误解析
    html = html.replace("${{block:2,underline:4,bar:6}", "${ {block:2,underline:4,bar:6}")
    if re.search(r"\{\{", html):
        raise SystemExit("still contains Go template markers")

    open(INDEX, "w", encoding="utf-8").write(html)
    print("injected, size", len(html))


if __name__ == "__main__":
    main()
