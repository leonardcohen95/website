from PIL import Image, ImageDraw, ImageFont
import os, shutil, subprocess, sys

FONT_BOLD = "/usr/share/fonts/opentype/noto-cjk-otf/NotoSansCJKsc-Bold.otf"
VIDEO = "/workspace/kappa_stickers/video"
ANIM = "/workspace/kappa_stickers/anim"
TMP = "/tmp/animwork"
SIZE = 240
MAX_BYTES = 450 * 1024  # 微信表情商店主图上限 500KB，留 10% 余量

os.makedirs(ANIM, exist_ok=True)


def font_size_for(n):
    if n <= 2: return 40
    if n == 3: return 34
    if n == 4: return 28
    return 24


def flatten_white(img):
    """把接近纯白的背景噪点压成纯白，GIF 帧间差分才会变小。"""
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y][:3]
            if r >= 238 and g >= 238 and b >= 238:
                px[x, y] = (255, 255, 255)
    return img


def add_text(path, text):
    img = Image.open(path).convert("RGBA")
    img = flatten_white(img)
    draw = ImageDraw.Draw(img)
    n = len(text)
    fsize = font_size_for(n)
    font = ImageFont.truetype(FONT_BOLD, fsize)
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=3)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (SIZE - tw) // 2 - bbox[0]
    y = SIZE - th - 14 - bbox[1]

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle([x - 10, y - 6, x + tw + 10, y + th + 6],
                         radius=12, fill=(255, 255, 255, 220))
    img.alpha_composite(overlay)
    ImageDraw.Draw(img).text((x, y), text, font=font, fill=(20, 20, 20, 255),
                             stroke_width=3, stroke_fill=(255, 255, 255, 255))
    img.convert("RGB").save(path)


def extract_frames(mp4, fps, trim):
    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)
    vf = (f"fps={fps},trim=0:{trim},setpts=PTS-STARTPTS,hqdn3d=2:2:8:8,"
          f"scale={SIZE}:{SIZE}:flags=lanczos:force_original_aspect_ratio=increase,"
          f"crop={SIZE}:{SIZE}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", vf,
                    os.path.join(TMP, "f_%03d.png")], check=True)
    return sorted(os.listdir(TMP))


def build_gif(out, colors, fps, dither):
    if dither == "none":
        use = "paletteuse=dither=none:diff_mode=rectangle"
    else:
        use = f"paletteuse=dither=bayer:bayer_scale={dither}:diff_mode=rectangle"
    filt = (f"split[a][b];[a]palettegen=max_colors={colors}:stats_mode=diff[p];"
            f"[b][p]{use}")
    tmp_gif = out + ".raw.gif"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps),
                    "-i", os.path.join(TMP, "f_%03d.png"),
                    "-filter_complex", filt, "-loop", "0", tmp_gif], check=True)
    subprocess.run(["gifsicle", "-O3", "--lossy=100", tmp_gif, "-o", out], check=True)
    os.remove(tmp_gif)
    return os.path.getsize(out)


def convert(name, text):
    mp4 = os.path.join(VIDEO, name + ".mp4")
    out = os.path.join(ANIM, name + ".gif")
    attempts = [(12, 4.0, 128, "none"), (12, 4.0, 96, "none"), (10, 4.0, 96, "none"),
                (10, 4.0, 64, "none"), (10, 3.5, 64, "none"), (8, 3.0, 64, "none"),
                (8, 2.5, 48, "none")]
    size = 0
    for fps, trim, colors, dither in attempts:
        extract_frames(mp4, fps, trim)
        for f in sorted(os.listdir(TMP)):
            if f.startswith("f_"):
                add_text(os.path.join(TMP, f), text)
        size = build_gif(out, colors, fps, dither)
        ok = size <= MAX_BYTES
        print(f"{name}: fps={fps} trim={trim}s colors={colors} -> {size/1024:.1f}KB "
              f"{'OK' if ok else 'over'}")
        if ok:
            im = Image.open(out)
            print(f"  frames={im.n_frames} size={im.size}")
            return True
    print(f"{name}: FAILED to get under 60KB (last {size/1024:.1f}KB)")
    return False


if __name__ == "__main__":
    name, text = sys.argv[1], sys.argv[2]
    convert(name, text)
