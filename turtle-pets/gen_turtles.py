#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""K8s Quest 电子宠物「养乌龟」—— 像素精灵设计生成器。
在 32x32 像素网格上用图元绘制 5 种 Q 版乌龟，输出：
  - 单个 PNG 精灵（放大 8 倍，最近邻）
  - 横向拼版 PNG（自检用）
  - 内嵌 SVG 的预览 HTML（用于对话内展示）
"""
import zlib, struct, os

W = H = 32
OUT = "/tmp/turtle_out"
os.makedirs(OUT, exist_ok=True)


# ---------- 基础工具 ----------
def hx(s):
    s = s.lstrip("#")
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)


def new_grid():
    return [[None] * W for _ in range(H)]


def put(g, x, y, c):
    if 0 <= x < W and 0 <= y < H and c is not None:
        g[y][x] = c


def put_in(g, region, x, y, c):
    if (x, y) in region:
        put(g, x, y, c)


def in_ellipse(x, y, cx, cy, rx, ry):
    dx = (x - cx) / rx
    dy = (y - cy) / ry
    return dx * dx + dy * dy <= 1.0


def ellipse(g, cx, cy, rx, ry, fill, outline):
    for y in range(H):
        for x in range(W):
            if in_ellipse(x, y, cx, cy, rx, ry) and not in_ellipse(x, y, cx, cy, rx - 1, ry - 1):
                put(g, x, y, outline)
    for y in range(H):
        for x in range(W):
            if in_ellipse(x, y, cx, cy, rx - 1, ry - 1):
                put(g, x, y, fill)


def inner_set(cx, cy, rx, ry):
    return set((x, y) for y in range(H) for x in range(W)
               if in_ellipse(x, y, cx, cy, rx - 1, ry - 1))


def shade_dome(g, cx, cy, rx, ry, base, inner):
    lite = shade(base, 1.20)
    dark = shade(base, 0.76)
    for (x, y) in inner:
        edge = any((nx, ny) not in inner for nx, ny in
                   ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
        if not edge:
            continue
        d = (x - cx) + (y - cy)
        if d <= -2:
            put(g, x, y, lite)
        elif d >= 3:
            put(g, x, y, dark)


# ---------- 精灵构建 ----------
SCX, SCY, SRX, SRY = 16, 14, 13, 10   # 龟壳椭圆
HCX, HCY = 16, 24                      # 头中心


def build(s):
    g = new_grid()
    O = s["outline"]
    shell = s["shell"]
    skin = s["skin"]
    skin_o = s.get("skin_out", O)

    # 1) 尾巴（鳄龟，画在龟壳之前，被壳遮挡）
    if s.get("tail"):
        for (x, y) in [(28, 19), (29, 20), (30, 21), (31, 22), (31, 23)]:
            put(g, x, y, s["tail_col"])
            put(g, x, y + 1, skin_o)

    # 2) 龟壳
    ellipse(g, SCX, SCY, SRX, SRY, shell, O)
    inner = inner_set(SCX, SCY, SRX, SRY)
    shade_dome(g, SCX, SCY, SRX, SRY, shell, inner)

    # 3) 壳缘（黄缘龟）
    if s.get("rim"):
        for (x, y) in inner:
            if any((nx, ny) not in inner for nx, ny in
                   ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))):
                put(g, x, y, s["rim"])

    # 4) 壳纹：草龟三条纵棱 / 其余为龟甲分块
    seam = s["seam"]
    if s.get("keels"):
        for xk in (10, 16, 22):
            for (x, y) in inner:
                if x == xk:
                    put(g, x, y, shade(shell, 1.30))
                elif x == xk + 1:
                    put(g, x, y, shade(shell, 0.80))
    else:
        for (x, y) in inner:
            if x in (11, 21) or y in (9, 14):
                put(g, x, y, seam)

    # 5) 鳄龟壳顶尖刺
    if s.get("spikes"):
        top = {}
        for (x, y) in inner:
            if (x, y - 1) not in inner:
                top[x] = min(top.get(x, 99), y)
        for x, y in top.items():
            if x % 4 == 2:
                put(g, x, y - 1, s["spike"])
                put(g, x, y - 2, s["spike"])
                put(g, x - 1, y - 1, shade(s["spike"], 0.72))
                put(g, x + 1, y - 1, shade(s["spike"], 0.72))
                put(g, x, y - 3, s["spike_out"])

    # 6) 前后脚（贴合龟壳下缘）
    for cx in (5, 27):
        ellipse(g, cx, 23, 3, 4, skin, skin_o)
        for dx in (-1, 0, 1):
            put(g, cx + dx, 26, s["claw"])

    # 7) 头
    hrx, hry = (8, 7) if s.get("head_big") else (7, 6)
    ellipse(g, HCX, HCY, hrx, hry, skin, skin_o)
    head = inner_set(HCX, HCY, hrx, hry)

    # 8) 脸部
    # 侧纹 / 耳斑（先画，避免盖住眼睛）
    stripe = s.get("stripe") or s.get("ear")
    if stripe:
        for sign in (-1, 1):
            for dy in range(-4, 1):
                put_in(g, head, HCX + sign * 6, HCY + dy, stripe)

    if s.get("brow"):
        # 眉骨
        for (x, y) in [(HCX - 6, HCY - 4), (HCX - 5, HCY - 4), (HCX - 4, HCY - 3),
                       (HCX + 6, HCY - 4), (HCX + 5, HCY - 4), (HCX + 4, HCY - 3)]:
            put_in(g, head, x, y, s["brow_col"])
        # 小圆眼
        for ex in (13, 19):
            for dx in (0, 1):
                for dy in (0, 1):
                    put_in(g, head, ex + dx, HCY - 2 + dy, s["eye"])
            put_in(g, head, ex, HCY - 2, s["eye_hl"])
    else:
        # 3x3 圆眼 + 左上高光
        for ex in (12, 20):
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    put_in(g, head, ex + dx, HCY - 2 + dy, s["eye"])
            put_in(g, head, ex - 1, HCY - 3, s["eye_hl"])

    # 嘴
    for dx in (-1, 0, 1):
        put_in(g, head, HCX + dx, HCY + 3, shade(skin, 0.5))

    return g


def sprite_img_b64(g, size=104):
    """内嵌 base64 PNG（32x32 原图 + pixelated 放大），体积远小于逐像素 SVG。"""
    import base64
    tmp = os.path.join(OUT, "_tmp32.png")
    write_png(tmp, g, scale=1)
    with open(tmp, "rb") as fh:
        b = base64.b64encode(fh.read()).decode()
    os.remove(tmp)
    return ('<img class="tw-sprite" width="%d" height="%d" alt="" '
            'src="data:image/png;base64,%s"/>' % (size, size, b))


def sprite_svg(g, px=96):
    """按行合并同色像素 -> SVG rect，viewBox 固定 0 0 32 32。"""
    parts = []
    for y in range(H):
        x = 0
        while x < W:
            c = g[y][x]
            if c is None:
                x += 1
                continue
            x0 = x
            while x < W and g[y][x] == c:
                x += 1
            parts.append('<rect x="%d" y="%d" width="%d" height="1" fill="#%02x%02x%02x"/>'
                         % (x0, y, x - x0, c[0], c[1], c[2]))
    return ('<svg class="tw-sprite" viewBox="0 0 32 32" width="%d" height="%d" '
            'shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">%s</svg>'
            % (px, px, "".join(parts)))


# ---------- PNG 编码（无第三方依赖）----------
def png_chunk(tag, data):
    return (struct.pack(">I", len(data)) + tag + data +
            struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))


def write_png(path, grid, scale=8, bg=None):
    rows = []
    for y in range(H):
        row = bytearray()
        for x in range(W):
            c = grid[y][x]
            if c is None:
                px = bg if bg is not None else (0, 0, 0)
                a = 255 if bg is not None else 0
                row += bytes((px[0], px[1], px[2], a))
            else:
                row += bytes((c[0], c[1], c[2], 255))
        big = bytearray()
        for _ in range(scale):
            big += row
        for _ in range(scale):
            rows.append(bytes(big))
    raw = b"".join(b"\x00" + r for r in rows)
    w = W * scale
    h = H * scale
    data = (b"\x89PNG\r\n\x1a\n" +
            png_chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) +
            png_chunk(b"IDAT", zlib.compress(raw, 9)) +
            png_chunk(b"IEND", b""))
    with open(path, "wb") as fh:
        fh.write(data)


def write_sheet(path, grids, scale=8, gap=10, bg=(246, 247, 249)):
    n = len(grids)
    Wt = n * W * scale + (n + 1) * gap
    Ht = H * scale + 2 * gap
    big = [[bg] * Wt for _ in range(Ht)]
    for i, g in enumerate(grids):
        ox = gap + i * (W * scale + gap)
        oy = gap
        for y in range(H):
            for x in range(W):
                if g[y][x] is None:
                    continue
                for dy in range(scale):
                    for dx in range(scale):
                        big[oy + y * scale + dy][ox + x * scale + dx] = g[y][x]
    raw_rows = []
    for row in big:
        b = bytearray()
        for c in row:
            b += bytes((c[0], c[1], c[2], 255))
        raw_rows.append(bytes(b))
    raw = b"".join(b"\x00" + r for r in raw_rows)
    data = (b"\x89PNG\r\n\x1a\n" +
            png_chunk(b"IHDR", struct.pack(">IIBBBBB", Wt, Ht, 8, 6, 0, 0, 0)) +
            png_chunk(b"IDAT", zlib.compress(raw, 9)) +
            png_chunk(b"IEND", b""))
    with open(path, "wb") as fh:
        fh.write(data)


# ---------- 5 种龟的调色板 ----------
BLACK = "#14140f"
WHITE = "#ffffff"

PALETTES = {
    "cao": dict(
        file="1-cao", name="草龟", en="Chinese pond turtle",
        outline=hx("#241c10"), shell=hx("#6b5a33"), seam=hx("#4a3d22"),
        skin=hx("#8fa05e"), skin_out=hx("#241c10"),
        stripe=hx("#e6d24f"), eye=hx(BLACK), eye_hl=hx(WHITE), claw=hx("#d9cf9b"),
        keels=True, desc="橄榄绿壳 + 三条纵棱，头部黄绿色条纹",
    ),
    "huangyuan": dict(
        file="2-huangyuan", name="黄缘龟", en="Yellow-margined box turtle",
        outline=hx("#14100b"), shell=hx("#3b3128"), seam=hx("#2a2219"),
        rim=hx("#ddb43b"), skin=hx("#615f46"), skin_out=hx("#14100b"),
        stripe=hx("#e8d24a"), eye=hx(BLACK), eye_hl=hx(WHITE), claw=hx("#cbbf83"),
        desc="深色高背壳 + 亮黄边缘，头部黄色侧纹",
    ),
    "eyu": dict(
        file="3-eyu", name="拟鳄龟", en="Common snapping turtle",
        outline=hx("#1f1c15"), shell=hx("#5c5548"), seam=hx("#423c30"),
        spike=hx("#6f6656"), spike_out=hx("#2f2a21"),
        skin=hx("#6f6a5a"), skin_out=hx("#1f1c15"), brow_col=hx("#3a352b"),
        eye=hx("#0f0f0b"), eye_hl=hx(WHITE), claw=hx("#c9c3ad"),
        tail_col=hx("#6f6a5a"),
        spikes=True, head_big=True, tail=True, brow=True,
        desc="灰褐色棱刺壳 + 大头、眉骨突起、粗尾",
    ),
    "xiaoqing": dict(
        file="4-xiaoqing", name="小青龟", en="Green turtle (juvenile)",
        outline=hx("#123a1c"), shell=hx("#4fb15c"), seam=hx("#3a8c48"),
        skin=hx("#7bd286"), skin_out=hx("#123a1c"),
        eye=hx(BLACK), eye_hl=hx(WHITE), claw=hx("#e8e4c0"),
        desc="鲜绿色壳 + 亮绿头，大眼睛，体型圆润",
    ),
    "brazil": dict(
        file="5-brazil", name="变异巴西龟", en="Albino red-eared slider",
        outline=hx("#8a7c50"), shell=hx("#f0dfa6"), seam=hx("#dcc78a"),
        skin=hx("#f6efd6"), skin_out=hx("#8a7c50"),
        ear=hx("#e59a86"), eye=hx("#c0392b"), eye_hl=hx(WHITE), claw=hx("#cbbf83"),
        desc="奶黄色壳 + 粉红眼，保留淡红耳斑",
    ),
}

ORDER = ["cao", "huangyuan", "eyu", "xiaoqing", "brazil"]


def main():
    grids = []
    for k in ORDER:
        s = PALETTES[k]
        g = build(s)
        grids.append(g)
        write_png(os.path.join(OUT, s["file"] + ".png"), g, scale=8)
        write_png(os.path.join(OUT, s["file"] + "-32.png"), g, scale=1)
        with open(os.path.join(OUT, s["file"] + ".svg"), "w", encoding="utf-8") as fh:
            fh.write(sprite_svg(g, 32))
    write_sheet(os.path.join(OUT, "sheet.png"), grids, scale=8, gap=10)

    # ---- 预览用 HTML（内嵌 base64 PNG）----
    cells = []
    for k in ORDER:
        s = PALETTES[k]
        g = build(s)
        cells.append(
            '<figure class="tw-item">'
            '<div class="tw-stage">%s</div>'
            '<figcaption><span class="tw-name">%s</span>'
            '<span class="tw-en">%s</span></figcaption></figure>'
            % (sprite_img_b64(g, 104), s["name"], s["en"])
        )
    html = WIDGET_TPL.replace("<!--CELLS-->", "".join(cells))
    with open(os.path.join(OUT, "widget.html"), "w", encoding="utf-8") as fh:
        fh.write(html)
    print("生成完成 ->", OUT)
    for k in ORDER:
        print("  ", PALETTES[k]["name"], PALETTES[k]["en"])
        print("     ", PALETTES[k]["desc"])


WIDGET_TPL = """<style>
:root{
  --surface:#ffffff; --surface-muted:#f6f7f9; --text:#1c1f24; --text-muted:#6b7280;
  --border:#e5e7eb; --brand:#16a34a;
  --radius-card:12px; --radius:8px;
  --spacer-8:8px; --spacer-12:12px; --spacer-16:16px;
  --text-caption:12px; --text-body:14px; --text-title:16px;
  --font-sans:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
}
:root[data-widget-theme="dark"]{
  --surface:#16181d; --surface-muted:#1e2127; --text:#e8eaed; --text-muted:#9aa3af;
  --border:#2b3038;
}
.tw{padding:var(--spacer-16);background:var(--surface);color:var(--text);
    font:var(--text-body)/1.5 var(--font-sans);border:1px solid var(--border);
    border-radius:var(--radius-card);box-sizing:border-box;width:100%;}
.tw-title{font-weight:600;font-size:var(--text-title);margin:0 0 var(--spacer-12);}
.tw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:var(--spacer-12);}
.tw-item{margin:0;display:flex;flex-direction:column;gap:var(--spacer-8);align-items:center;
         background:var(--surface-muted);border:1px solid var(--border);
         border-radius:var(--radius);padding:var(--spacer-12) var(--spacer-8);}
.tw-stage{display:flex;align-items:center;justify-content:center;height:112px;}
.tw-sprite{image-rendering:pixelated;}
.tw-item figcaption{display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center;}
.tw-name{font-weight:600;font-size:var(--text-body);}
.tw-en{font-size:var(--text-caption);color:var(--text-muted);line-height:1.3;}
</style>
<div data-dynamic-ui-widget data-template="turtle-sprite-preview" class="tw">
  <p class="tw-title">5 种乌龟 · Q 版像素形象（32×32）</p>
  <div class="tw-grid"><!--CELLS--></div>
</div>"""


if __name__ == "__main__":
    main()
