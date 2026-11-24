"""把静态表情图做成微动效 GIF（呼吸 / 浮动 / 摇摆），输出到 anim/。"""
from PIL import Image, ImageDraw, ImageFont
import os, shutil, subprocess, math

FONT_BOLD = "/usr/share/fonts/opentype/noto-cjk-otf/NotoSansCJKsc-Bold.otf"
ORIG = "/workspace/kappa_stickers/orig"
ANIM = "/workspace/kappa_stickers/anim"
TMP = "/tmp/motionwork"
SIZE = 240
FRAMES = 24          # 24 帧
FPS = 12             # 12fps -> 2 秒无缝循环
MAX_BYTES = 450 * 1024

STICKERS = [
    ("01_shoudao", "收到", "breathe"),
    ("02_haode", "好的", "breathe"),
    ("03_zaimang", "在忙了", "shake"),
    ("04_mashang", "马上来", "bounce"),
    ("05_zhouyi", "周一", "sink"),
    ("06_xiaban", "下班啦", "bounce"),
    ("07_jiaban", "加班中", "sink"),
    ("08_qiujiaxin", "求加薪", "breathe"),
    ("09_leile", "累了", "sink"),
    ("10_buxiangshangban", "不想上班", "shake"),
    ("11_moyu", "摸鱼中", "breathe"),
    ("12_xiexielaoban", "谢谢老板", "bounce"),
    ("13_youkaihui", "又开会", "shake"),
    ("14_dagongren", "打工人", "breathe"),
    ("15_biecuile", "别催了", "shake"),
    ("16_wanan", "晚安", "sleep"),
]

PROFILE = {
    "breathe": dict(s=0.020, dy=2.2, dx=0.0, ang=0.7, freq=1.0),
    "shake":   dict(s=0.012, dy=1.6, dx=2.6, ang=1.3, freq=2.0),
    "bounce":  dict(s=0.024, dy=4.0, dx=0.0, ang=0.0, freq=1.0),
    "sink":    dict(s=0.016, dy=3.0, dx=0.0, ang=0.5, freq=0.5),
    "sleep":   dict(s=0.012, dy=2.0, dx=0.0, ang=0.4, freq=0.5),
}

os.makedirs(ANIM, exist_ok=True)


def crop_center_square(img):
    w, h = img.size
    s = min(w, h)
    left, top = (w - s) // 2, (h - s) // 2
    return img.crop((left, top, left + s, top + s))


def font_size_for(n):
    return 40 if n <= 2 else 34 if n == 3 else 28 if n == 4 else 24


def flatten_white(img):
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y][:3]
            if r >= 238 and g >= 238 and b >= 238:
                px[x, y] = (255, 255, 255, 255)
    return img


def draw_text(img, text):
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT_BOLD, font_size_for(len(text)))
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=3)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (SIZE - tw) // 2 - bbox[0]
    y = SIZE - th - 14 - bbox[1]

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle([x - 10, y - 6, x + tw + 10, y + th + 6],
                         radius=12, fill=(255, 255, 255, 220))
    img.alpha_composite(overlay)
    draw.text((x, y), text, font=font, fill=(20, 20, 20, 255),
              stroke_width=3, stroke_fill=(255, 255, 255, 255))


def render_frames(art, text, prof):
    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)
    for i in range(FRAMES):
        t = i / FRAMES
        ph = 2 * math.pi * prof["freq"] * t
        s = 1 + prof["s"] * math.sin(ph)
        dy = prof["dy"] * math.sin(ph)
        dx = prof["dx"] * math.sin(ph * 2)
        ang = prof["ang"] * math.sin(ph)

        w = max(1, int(round(SIZE * s)))
        layer = art.resize((w, w), Image.LANCZOS)
        if abs(ang) > 0.01:
            layer = layer.rotate(ang, resample=Image.BICUBIC, expand=False)

        canvas = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))
        x = (SIZE - layer.width) // 2 + int(round(dx))
        y = (SIZE - layer.height) // 2 + int(round(dy))   # 与静态版同位置，不再压掉腿脚
        canvas.paste(layer, (x, y), layer)
        draw_text(canvas, text)
        canvas.convert("RGB").save(os.path.join(TMP, f"f_{i:03d}.png"))


def build_gif(out, colors=128):
    raw = out + ".raw.gif"
    filt = (f"split[a][b];[a]palettegen=max_colors={colors}:stats_mode=diff[p];"
            f"[b][p]paletteuse=dither=none:diff_mode=rectangle")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS),
                    "-i", os.path.join(TMP, "f_%03d.png"),
                    "-filter_complex", filt, "-loop", "0", raw], check=True)
    subprocess.run(["gifsicle", "-O3", "--lossy=40", raw, "-o", out], check=True)
    os.remove(raw)
    return os.path.getsize(out)


def process(fname, text, profile_name):
    art = Image.open(os.path.join(ORIG, fname + ".jpg")).convert("RGBA")
    art = crop_center_square(art).resize((SIZE, SIZE), Image.LANCZOS)
    art = flatten_white(art)

    out = os.path.join(ANIM, fname + ".gif")
    for colors in (128, 96, 64):
        render_frames(art, text, PROFILE[profile_name])
        size = build_gif(out, colors)
        if size <= MAX_BYTES:
            im = Image.open(out)
            return True, im.n_frames, size
    return False, im.n_frames, size


if __name__ == "__main__":
    import sys
    targets = STICKERS
    if len(sys.argv) > 1:
        targets = [s for s in STICKERS if s[0] == sys.argv[1]]

    total = 0
    failed = []
    for fn, txt, prof in targets:
        ok, n, size = process(fn, txt, prof)
        total += size
        print(f"{'OK ' if ok else 'OVER'} {fn}.gif  frames={n}  {size/1024:.1f}KB  [{prof}]")
        if not ok:
            failed.append(fn)
    print(f"\nTotal {total/1024:.1f}KB / {len(targets)} 张")
    if failed:
        print("超限:", failed)
