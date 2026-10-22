#!/usr/bin/env python3
"""把复制/粘贴工具栏内联进 ttyd 的 index.html（幂等）。"""
import os

BASE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(BASE, "index.html")
HOOK = os.path.join(BASE, "ttyd-hook.js")
UI = os.path.join(BASE, "ttyd-ui.js")


def main():
    html = open(INDEX, encoding="utf-8").read()
    if "cka-tools" in html:
        print("already injected")
        return

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
    if "{{" in html:
        raise SystemExit("still contains Go template markers")

    open(INDEX, "w", encoding="utf-8").write(html)
    print("injected, size", len(html))


if __name__ == "__main__":
    main()
