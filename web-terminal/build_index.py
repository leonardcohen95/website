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

# 让 ttyd 在切到其他标签页/出现网络错误后也能自动重连，
# 避免回到页面时只能按 Enter 手动重连。
RECONNECT_PATCHES = [
    # A. 暴露控制器实例，并初始化重连状态
    (
        "this.opened=!1,this.resizeOverlay=!0,this.reconnect=!0,this.doReconnect=!0,this.writeFunc=(e=>this.writeData(new Uint8Array(e)))",
        "this.opened=!1,this.resizeOverlay=!0,this.reconnect=!0,this.doReconnect=!0,this._reconnectTimer=null,this._pendingReconnect=!1,window.__ttydXterm=this,this.writeFunc=(e=>this.writeData(new Uint8Array(e)))",
    ),
    # B. 网络错误时不再永久禁用自动重连
    (
        't(u(e,"error",()=>this.doReconnect=!1))',
        't(u(e,"error",()=>{}))',
    ),
    # C. 关闭时总是自动重连；隐藏标签页时延迟到切回再连
    (
        'onSocketClose(e){console.log(`[ttyd] websocket connection closed with code: ${e.code}`);const{refreshToken:t,connect:i,doReconnect:s,overlayAddon:r}=this;if(r.showOverlay("Connection Closed"),this.dispose(),1e3!==e.code&&s)r.showOverlay("Reconnecting..."),t().then(i);else{const{terminal:e}=this,s=e.onKey(e=>{"Enter"===e.domEvent.key&&(s.dispose(),r.showOverlay("Reconnecting..."),t().then(i))});r.showOverlay("Press ⏎ to Reconnect")}}',
        'onSocketClose(e){console.log(`[ttyd] websocket connection closed with code: ${e.code}`);const{refreshToken:t,connect:i,overlayAddon:r}=this;this._reconnectTimer&&(clearTimeout(this._reconnectTimer),this._reconnectTimer=null),this.dispose();var c=()=>{r.showOverlay("Reconnecting..."),t().then(i)};document.visibilityState==="hidden"?(r.showOverlay("页面已隐藏，切回后自动重连"),this._pendingReconnect=!0):(this._reconnectTimer=setTimeout(c,800))}',
    ),
    # D. 连接成功后清除重连状态
    (
        'onSocketOpen(){var e;console.log("[ttyd] websocket connection opened");const{textEncoder:t,terminal:i,overlayAddon:s}=this,',
        'onSocketOpen(){var e;this._pendingReconnect=!1,this._reconnectTimer&&(clearTimeout(this._reconnectTimer),this._reconnectTimer=null),console.log("[ttyd] websocket connection opened");const{textEncoder:t,terminal:i,overlayAddon:s}=this,',
    ),
]


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


def patch_reconnect(html):
    """修补 ttyd bundle，让它总是自动重连。"""
    for old, new in RECONNECT_PATCHES:
        if old not in html:
            raise SystemExit(f"reconnect patch missing: {old[:60]}")
        html = html.replace(old, new, 1)
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

    # 自动重连补丁
    html = patch_reconnect(html)

    # ttyd 会把 index 当 Go 模板渲染，JS 模板字符串里的 ${{ 会被误解析
    html = html.replace("${{block:2,underline:4,bar:6}", "${ {block:2,underline:4,bar:6}")
    if re.search(r"\{\{", html):
        raise SystemExit("still contains Go template markers")

    open(INDEX, "w", encoding="utf-8").write(html)
    print("injected, size", len(html))


if __name__ == "__main__":
    main()
