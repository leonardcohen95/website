from PIL import Image
import os

PREVIEW = "/workspace/kappa_stickers/preview_hd"
OUT = "/workspace/kappa_stickers/总览预览.png"

files = [
    "01_shoudao.png", "02_haode.png", "03_zaimang.png", "04_mashang.png",
    "05_zhouyi.png", "06_xiaban.png", "07_jiaban.png", "08_qiujiaxin.png",
    "09_leile.png", "10_buxiangshangban.png", "11_moyu.png", "12_xiexielaoban.png",
    "13_youkaihui.png", "14_dagongren.png", "15_biecuile.png", "16_wanan.png",
]
labels = [
    "收到", "好的", "在忙了", "马上来",
    "周一", "下班啦", "加班中", "求加薪",
    "累了", "不想上班", "摸鱼中", "谢谢老板",
    "又开会", "打工人", "别催了", "晚安",
]

cell = 240
gap = 16
cols, rows = 4, 4
W = cols * cell + (cols + 1) * gap
H = rows * cell + (rows + 1) * gap
canvas = Image.new("RGB", (W, H), (245, 245, 247))

for i, (f, lab) in enumerate(zip(files, labels)):
    p = os.path.join(PREVIEW, f)
    if not os.path.exists(p):
        continue
    im = Image.open(p).convert("RGB").resize((cell, cell), Image.LANCZOS)
    r, c = divmod(i, cols)
    x = gap + c * (cell + gap)
    y = gap + r * (cell + gap)
    canvas.paste(im, (x, y))

canvas.save(OUT)
print("saved", OUT, canvas.size)
