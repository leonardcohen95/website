from PIL import Image, ImageDraw, ImageFont
import os

FONT_BOLD = "/usr/share/fonts/opentype/noto-cjk-otf/NotoSansCJKsc-Bold.otf"

STICKERS = [
    ("01_shoudao", "收到"),
    ("02_haode", "好的"),
    ("03_zaimang", "在忙了"),
    ("04_mashang", "马上来"),
    ("05_zhouyi", "周一"),
    ("06_xiaban", "下班啦"),
    ("07_jiaban", "加班中"),
    ("08_qiujiaxin", "求加薪"),
    ("09_leile", "累了"),
    ("10_buxiangshangban", "不想上班"),
    ("11_moyu", "摸鱼中"),
    ("12_xiexielaoban", "谢谢老板"),
    ("13_youkaihui", "又开会"),
    ("14_dagongren", "打工人"),
    ("15_biecuile", "别催了"),
    ("16_wanan", "晚安"),
]

ORIG = "/workspace/kappa_stickers/orig"
OUT = "/workspace/kappa_stickers/final"
PREVIEW = "/workspace/kappa_stickers/preview"
SIZE = 240

os.makedirs(OUT, exist_ok=True)
os.makedirs(PREVIEW, exist_ok=True)


def crop_center_square(img):
    w, h = img.size
    s = min(w, h)
    left = (w - s) // 2
    top = (h - s) // 2
    return img.crop((left, top, left + s, top + s))


def font_size_for(n_chars):
    # 240px canvas, bottom text
    if n_chars <= 2:
        return 40
    if n_chars == 3:
        return 34
    if n_chars == 4:
        return 28
    return 24


def draw_sticker_text(img, text):
    """img is 240x240 RGBA; draw bottom text with white outline."""
    draw = ImageDraw.Draw(img)
    n = len(text)
    fsize = font_size_for(n)
    font = ImageFont.truetype(FONT_BOLD, fsize)

    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=3)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (SIZE - tw) // 2 - bbox[0]
    y = SIZE - th - 14 - bbox[1]  # near bottom

    # 半透明白色圆角底，增强可读性
    pad_x, pad_y = 10, 6
    rect = [x - pad_x, y - pad_y, x + tw + pad_x, y + th + pad_y]
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle(rect, radius=12, fill=(255, 255, 255, 220))
    img.alpha_composite(overlay)

    # 文字：黑色填充 + 白色描边
    draw.text((x, y), text, font=font, fill=(20, 20, 20, 255),
              stroke_width=3, stroke_fill=(255, 255, 255, 255))
    return img


def compress_gif(img_rgb, out_path, max_bytes=60 * 1024):
    """Save as GIF under max_bytes; reduce colors if needed."""
    for colors in (256, 192, 128, 96, 64):
        q = img_rgb.quantize(colors=colors, method=Image.MEDIANCUT)
        q.save(out_path, format="GIF", optimize=True)
        if os.path.getsize(out_path) <= max_bytes:
            return True, colors, os.path.getsize(out_path)
    # 最后尝试：进一步缩小尺寸不可行（必须240），用最少颜色
    q = img_rgb.quantize(colors=32, method=Image.MEDIANCUT)
    q.save(out_path, format="GIF", optimize=True)
    return False, 32, os.path.getsize(out_path)


def process(fname, text, only_preview=False):
    src = os.path.join(ORIG, fname + ".jpg")
    img = Image.open(src).convert("RGBA")
    img = crop_center_square(img).resize((SIZE, SIZE), Image.LANCZOS)
    img = draw_sticker_text(img, text)

    # 预览：放大4倍便于查看
    big = img.resize((SIZE * 4, SIZE * 4), Image.NEAREST)
    big.convert("RGB").save(os.path.join(PREVIEW, fname + ".png"))

    if not only_preview:
        ok, colors, size = compress_gif(img.convert("RGB"),
                                        os.path.join(OUT, fname + ".gif"))
        return ok, colors, size
    return None


if __name__ == "__main__":
    import sys
    only = sys.argv[1] if len(sys.argv) > 1 else None
    if only:
        for fn, txt in STICKERS:
            if fn == only:
                process(fn, txt, only_preview=False)
                print("done", only)
                break
    else:
        total = 0
        over = []
        for fn, txt in STICKERS:
            ok, colors, size = process(fn, txt)
            tag = "OK" if ok else "OVER"
            print(f"{tag} {fn}.gif  colors={colors}  {size/1024:.1f}KB")
            total += size
            if not ok:
                over.append(fn)
        print(f"\nTotal: {total/1024:.1f}KB for {len(STICKERS)} stickers")
        if over:
            print("OVER 60KB:", over)
