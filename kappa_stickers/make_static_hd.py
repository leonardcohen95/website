"""静态高清版：抠出角色 -> 微渐变背景 + 接触投影 + 锐化，输出 240x240 GIF 与 4x PNG。"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, cv2, os

FONT_BOLD = "/usr/share/fonts/opentype/noto-cjk-otf/NotoSansCJKsc-Bold.otf"
ORIG = "/workspace/kappa_stickers/orig"
OUT = "/workspace/kappa_stickers/final"
PREVIEW = "/workspace/kappa_stickers/preview_hd"
SIZE = 240
SS = 3                     # 超采样倍数
MAX_BYTES = 500 * 1024

STICKERS = [
    ("01_shoudao", "收到"), ("02_haode", "好的"), ("03_zaimang", "在忙了"),
    ("04_mashang", "马上来"), ("05_zhouyi", "周一"), ("06_xiaban", "下班啦"),
    ("07_jiaban", "加班中"), ("08_qiujiaxin", "求加薪"), ("09_leile", "累了"),
    ("10_buxiangshangban", "不想上班"), ("11_moyu", "摸鱼中"),
    ("12_xiexielaoban", "谢谢老板"), ("13_youkaihui", "又开会"),
    ("14_dagongren", "打工人"), ("15_biecuile", "别催了"), ("16_wanan", "晚安"),
]

os.makedirs(OUT, exist_ok=True)
os.makedirs(PREVIEW, exist_ok=True)


def crop_center_square(img):
    w, h = img.size
    s = min(w, h)
    return img.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))


def matte(rgb):
    """白底 -> 透明。仅把与画布边界连通的白色区域设为透明，角色内部白色保留。"""
    arr = np.array(rgb)
    near_white = (arr.min(axis=2) >= 232).astype(np.uint8)
    h, w = near_white.shape
    exterior = np.zeros((h, w), bool)
    for sy, sx in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]:
        if near_white[sy, sx] == 1:
            ff = near_white.copy()
            m = np.zeros((h + 2, w + 2), np.uint8)
            cv2.floodFill(ff, m, (sx, sy), 2)
            exterior |= (ff == 2)

    alpha = np.where(exterior, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.8))
    out = rgb.convert("RGBA")
    out.putalpha(alpha_img)
    return out


def gradient_bg(size):
    """中心亮、四角微暗的柔和径向渐变。"""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    cx = cy = (size - 1) / 2
    r = np.sqrt(((x - cx) / cx) ** 2 + ((y - cy) / cy) ** 2) / np.sqrt(2)
    r = np.clip(r, 0, 1)
    top = np.array([255, 255, 255], np.float32)
    bottom = np.array([236, 240, 244], np.float32)
    k = (r ** 1.3)[..., None]
    arr = top * (1 - k) + bottom * k
    return Image.fromarray(arr.astype(np.uint8), "RGB")


def add_shadow(bg, char, off=(0, 0)):
    """基于角色轮廓生成柔和接触投影。"""
    a = char.getchannel("A")
    blur = a.filter(ImageFilter.GaussianBlur(char.width * 0.035))
    layer = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    tint = Image.new("RGBA", char.size, (54, 74, 92, 255))
    layer.paste(tint, off, blur.point(lambda v: int(v * 0.42)))
    layer = layer.filter(ImageFilter.GaussianBlur(SIZE_BIG * 0.012))
    dy = int(SIZE_BIG * 0.018)
    bg.alpha_composite(layer, (0, dy))
    return bg


def font_size_for(n):
    return 34 if n <= 2 else 28 if n == 3 else 24 if n == 4 else 20


def draw_text(img, text):
    """粗白描边 + 柔和投影，不压白色面板，保持腿部细节可辨。"""
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT_BOLD, font_size_for(len(text)))
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=5)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (SIZE - tw) // 2 - bbox[0]
    y = SIZE - th - 12 - bbox[1]

    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((x, y + 3), text, font=font, fill=(25, 35, 45, 130),
                            stroke_width=5, stroke_fill=(25, 35, 45, 130))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(2.0)))

    draw.text((x, y), text, font=font, fill=(22, 26, 30, 255),
              stroke_width=5, stroke_fill=(255, 255, 255, 255))


def process(fname, text):
    global SIZE_BIG
    SIZE_BIG = SIZE * SS

    src = crop_center_square(Image.open(os.path.join(ORIG, fname + ".jpg")).convert("RGB"))
    big = src.resize((SIZE_BIG, SIZE_BIG), Image.LANCZOS)
    char = matte(big)

    # 角色缩到 93%，四周留白，避免文字压住身体、投影有落脚空间
    cw = int(SIZE_BIG * 0.93)
    char = char.resize((cw, cw), Image.LANCZOS)
    off = ((SIZE_BIG - cw) // 2, (SIZE_BIG - cw) // 2)

    bg = gradient_bg(SIZE_BIG).convert("RGBA")
    bg = add_shadow(bg, char, off)
    bg.alpha_composite(char, off)

    img = bg.resize((SIZE, SIZE), Image.LANCZOS)
    rgb = img.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.1, percent=120, threshold=2))
    img = rgb.convert("RGBA")
    draw_text(img, text)

    img.resize((SIZE * 4, SIZE * 4), Image.LANCZOS).convert("RGB").save(
        os.path.join(PREVIEW, fname + ".png"))

    out = os.path.join(OUT, fname + ".gif")
    for colors, dither in ((256, Image.Dither.FLOYDSTEINBERG), (128, Image.Dither.NONE)):
        img.convert("RGB").quantize(colors=colors, method=Image.FASTOCTREE,
                                    dither=dither).save(out, "GIF", optimize=True)
        if os.path.getsize(out) <= MAX_BYTES:
            break
    return colors, os.path.getsize(out)


if __name__ == "__main__":
    import sys
    targets = STICKERS
    if len(sys.argv) > 1:
        targets = [s for s in STICKERS if s[0] == sys.argv[1]]
    total = 0
    for fn, txt in targets:
        colors, size = process(fn, txt)
        total += size
        print(f"OK {fn}.gif  colors={colors}  {size/1024:.1f}KB")
    print(f"\nTotal {total/1024:.1f}KB / {len(targets)} 张")
