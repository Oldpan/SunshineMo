"""Cover images for 787 人猜牛 (群体智慧), 1950s flat cartoon: the ox with its ribbon, the crowd, 1207 ≈ 1198.

  python3 cover.py             # → out/cover_16x9_A.png (1920x1080), out/cover_3x4_A.png (1080x1440)
  COVER=B python3 cover.py     # → out/cover_16x9_B.png, out/cover_3x4_B.png
"""
import math
import os

import skia

import toon as T
from toon import INK, PAPER, CORAL, MUSTARD, tint, shade_of
from render import OUT, crowd_member
from cues import TITLE, CONCEPT

# A: the story's verifiable number.  B: the question the film answers, with the 1 %.
VARIANT = os.environ.get("COVER", "A")
HOOK = {"A": ["787 张纸条的中间值，", "离真实重量只差 9 磅"], "B": ["一个人猜不准，", "787 个人只差不到 1%"]}
HI = {"A": "只差 9 磅", "B": "不到 1%"}
SUB = {"A": "1906 · 普利茅斯牲畜展", "B": "从一头牛到 AI 的投票"}
TT = 99.0                                                     # every pop-in finished


def page(c, w, h, horizon):
    T.plane(c, 0.5, tint(MUSTARD, 0.55), shade_of(tint(MUSTARD, 0.25), 0.08), horizon, w, h)


def finish(surf, c, w, h, name):
    c.save()
    c.scale(w / 1920, h / 1080)
    c.drawImage(T.paper_image(1920, 1080), 0, 0, skia.SamplingOptions(),
                skia.Paint(BlendMode=skia.BlendMode.kMultiply))
    c.restore()
    surf.makeImageSnapshot().save(os.path.join(OUT, name), skia.kPNG)


def hook(c, x, y, size, align="left"):
    for k, line in enumerate(HOOK[VARIANT]):
        marked = line.replace(HI[VARIANT], "{" + HI[VARIANT] + "}") if k else line
        f = T.font(size, "title")
        chars = T.parse_marks(marked)
        tot = sum(f.measureText(ch) for ch, _ in chars)
        xx = x - tot / 2 if align == "center" else x
        for ch, hi in chars:
            T.headline(c, ch, xx, y + k * size * 1.25, size, TT, 0, plate=CORAL if hi else MUSTARD, stagger=0)
            xx += f.measureText(ch)


def badge(c, x, y, s):
    T.medallion(c, x, y, 110 * s, "≈", TT, 1.0, fill=CORAL, size=110 * s)
    T.text(c, "1207", x - 130 * s, y + 20 * s, 54 * s, "slab", INK, "right")
    T.text(c, "1198", x + 130 * s, y + 20 * s, 54 * s, "slab", INK, "left")


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    page(c, w, h, 860)
    T.sunburst(c, 1420, 520, 1500, PAPER, 0.3, 0.2)
    T.ox(c, 1430, 560, 1.15, TT, look=-0.2, ribbon=True)
    for k in range(5):
        crowd_member(c, k, 1000 + k * 175, 880, 0.62, TT, arm=0.9, hold=["1150", "1300", "1210", "1100", "1260"][k],
                     mouth=2)
    T.headline(c, TITLE, 100, 250, 200, TT, 0, plate=CORAL, stagger=0)
    T.text(c, CONCEPT, 112, 345, 50, "sans", INK, plate=PAPER, t=TT)
    T.script_on(c, "Wisdom of Crowds", 112 + T.font(50, "sans").measureText(CONCEPT) + 28, 345, 46, TT, 0, 0.1)
    hook(c, 104, 560, 86)
    badge(c, 460, 840, 0.9)
    T.tag(c, 1460, 140, SUB[VARIANT], TT, 1.0, 38, fill=PAPER)
    finish(surf, c, w, h, f"cover_16x9_{VARIANT}.png")


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    page(c, w, h, 1010)
    T.sunburst(c, 540, 820, 1300, PAPER, 0.3, 0.2)
    f = T.font(170, "title")
    tw = sum(f.measureText(ch) for ch in TITLE)
    T.headline(c, TITLE, 540 - tw / 2, 250, 170, TT, 0, plate=CORAL, stagger=0)
    tw2 = T.font(46, "sans").measureText(CONCEPT)
    T.text(c, CONCEPT, 540 - tw2 / 2, 335, 46, "sans", INK, plate=PAPER, t=TT)
    hook(c, 540, 480, 64, "center")
    T.ox(c, 560, 830, 1.0, TT, look=-0.2, ribbon=True)
    for k in range(5):
        crowd_member(c, k, 140 + k * 200, 1060, 0.6, TT, arm=0.9, hold=["1150", "1300", "1210", "1100", "1260"][k],
                     mouth=2)
    badge(c, 540, 1300, 0.8)
    finish(surf, c, w, h, f"cover_3x4_{VARIANT}.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
