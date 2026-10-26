"""Cover images for 第一座山 (局部最优), in ink: the climber on the first hill, the true summit in the mist behind.

  python3 cover.py             # → out/cover_16x9.png (1920x1080), out/cover_3x4.png (1080x1440)
  COVER=B python3 cover.py     # → out/cover_16x9_B.png, out/cover_3x4_B.png
"""
import os

import skia

import render as R
from render import (Cam, draw_world, figure, flag_on, height, mass, seal, serif, ink_paint, paper_image, col4,
                    RED, _paper_masked, parse_marks, OUT)
from cues import TITLE, TITLE_Q, CONCEPT, CONCEPT_EN

# A: the film's line.  B: the strongest verifiable fact (Kirkpatrick et al. 1983) as a positive hook.
VARIANT = os.environ.get("COVER", "A")
COVER_Q = {"A": TITLE_Q, "B": "1983 年 IBM 的解法：先往{下}走，才爬得更高"}


def scene(c, w, h, z, ox, oy):
    cam = Cam(2400, 0, z, ox, oy)
    draw_world(c, cam)
    sx, sy = cam.p(1500, height(1500))
    flag_on(c, sx + 26 * z / 0.42, sy, z / 0.42 * 0.6, 0.0)
    figure(c, sx, sy, z / 0.42 * 0.62, 1.0, arm=1.0, stride=0.2, look=1)
    hx, hy = cam.p(3300, height(3300))
    g = skia.GradientShader.MakeRadial(skia.Point(hx, hy + 160 * z / 0.42), 520 * z / 0.42,
                                       [col4((0, 0, 0), 0.72), col4((0, 0, 0), 0.5), col4((0, 0, 0), 0)], [0, 0.6, 1])
    _paper_masked(c, g, None)
    R.mist_band(c, oy + 60 * z / 0.42, 260, 1.0, 0, 3)


def line(c, text, cx, y, size):
    plain = "".join(ch for ch, _ in parse_marks(text))
    f = serif(size)
    wd = f.measureText(plain)
    c.drawRect(skia.Rect.MakeXYWH(cx - wd / 2 - size * 0.62, y - size * 0.6, size * 0.28, size * 0.28),
               skia.Paint(AntiAlias=True, Color4f=col4(RED, 0.9)))
    c.drawString(plain, cx - wd / 2, y, f, ink_paint(0.88))


def column(c, x, y, size):
    f = serif(size, True)
    for i, ch in enumerate(TITLE):
        c.drawString(ch, x - f.measureText(ch) / 2, y + i * size * 1.08, f, ink_paint(0.93))
    seal(c, x, y + len(TITLE) * size * 1.08 + size * 0.1, size * 0.36, CONCEPT, serif(size * 0.33, True))


def save(surf, name):
    surf.makeImageSnapshot().save(os.path.join(OUT, name), skia.kPNG)


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.drawImage(paper_image(R.W, R.H), 0, 0)
    scene(c, w, h, 0.5, 860, 1080)
    column(c, 1700, 200, 150)
    line(c, COVER_Q[VARIANT], 800, 170, 52)
    f = serif(28)
    c.drawString(f"{CONCEPT} · {CONCEPT_EN}", 800 - f.measureText(f"{CONCEPT} · {CONCEPT_EN}") / 2, 240, f,
                 ink_paint(0.5))
    c.drawString("一帧一理", 64, 70, serif(26), ink_paint(0.45))
    save(surf, "cover_16x9.png" if VARIANT == "A" else "cover_16x9_B.png")


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.save()
    c.scale(1080 / 1920 * 1.34, 1440 / 1080)
    c.drawImage(paper_image(R.W, R.H), 0, 0)
    c.restore()
    scene(c, w, h, 0.34, 520, 1400)
    column(c, 930, 200, 130)
    q = COVER_Q[VARIANT]
    plain = "".join(ch for ch, _ in parse_marks(q))
    if len(plain) > 14:                       # two lines on the portrait cover
        cut = plain.find("：") + 1 if "：" in plain else len(plain) // 2
        line(c, plain[:cut], 450, 300, 50)
        f = serif(50)
        c.drawString(plain[cut:], 450 - f.measureText(plain[cut:]) / 2, 380, f, ink_paint(0.88))
    else:
        line(c, q, 450, 300, 50)
    f = serif(26)
    c.drawString(f"{CONCEPT} · {CONCEPT_EN}", 450 - f.measureText(f"{CONCEPT} · {CONCEPT_EN}") / 2, 450, f,
                 ink_paint(0.5))
    save(surf, "cover_3x4.png" if VARIANT == "A" else "cover_3x4_B.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
