"""Cover images for 老鼠尾巴 (古德哈特定律), halftone dossier: the tailless rat, the tail as evidence, one red stamp.

  python3 cover.py             # → out/cover_16x9_A.png (1920x1080), out/cover_3x4_A.png (1080x1440)
  COVER=B python3 cover.py     # → out/cover_16x9_B.png, out/cover_3x4_B.png
"""
import math
import os

import numpy as np
import skia

import dossier as D
from dossier import INK, OVER, HI, RED, PAPER, paint
from render import OUT, pill
from cues import TITLE, CONCEPT, CONCEPT_EN

# A: the story's most striking verifiable fact.  B: Strathern's wording of the law, with the film's span.
VARIANT = os.environ.get("COVER", "A")
HI_N = {"A": 3, "B": 4}
HOOK = {"A": ["悬赏收老鼠尾巴，", "城外冒出了养鼠场"], "B": ["当指标变成目标，", "它就不再是好指标"]}
SUB = {"A": "1902 · 河内", "B": "从河内鼠患到 AI 刷分"}
T = 99.0                                                     # every pop-in finished


def page(c, w, h):
    c.clear(skia.Color4f(1, 1, 1, 1))
    D.halftone(c, (0, 0, w, h), D.edge(w, h, 300, 0.8), OVER, step=24, angle=15)


def finish(surf, c, w, h, name):
    c.save()
    c.scale(w / 1920, h / 1080)
    c.drawImage(D.paper_image(1920, 1080), 0, 0, skia.SamplingOptions(),
                skia.Paint(BlendMode=skia.BlendMode.kMultiply))
    c.restore()
    surf.makeImageSnapshot().save(os.path.join(OUT, name), skia.kPNG)


def exhibit(c, x, y, s):
    """The tailless rat, its tail in an evidence bag, the coin it was worth."""
    D.halftone(c, (x - 520 * s, y - 420 * s, x + 520 * s, y + 420 * s), D.radial(x, y, 40, 460 * s, 0.0, 0.85), HI,
               step=24, angle=30)
    D.rat(c, x + 40 * s, y + 90 * s, 2.0 * s, 0.0, tail=0.0, look=-0.6)
    c.save()
    c.translate(x - 260 * s, y - 170 * s)
    c.rotate(-8)
    c.scale(s, s)
    bag = skia.Rect.MakeXYWH(-150, -110, 300, 220)
    c.drawRect(bag.makeOffset(10, 10), paint(OVER, 0.9, mult=True))
    c.drawRect(bag, paint((1, 1, 1), 0.9))
    c.drawRect(bag, paint(INK, 1, 6))
    c.drawRect(skia.Rect.MakeXYWH(-150, -110, 300, 34), paint(RED))
    D.tail_icon(c, 0, 20, 1.5, 1.0, 0.0, -15)
    c.restore()
    D.coin(c, x + 300 * s, y - 230 * s, 70 * s)


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    page(c, w, h)
    exhibit(c, 1380, 560, 1.0)
    D.headline(c, TITLE, 100, 330, 230, T, 0)
    f = D.font(44, "serif")
    c.drawString(CONCEPT, 112, 420, f, paint(INK))
    c.drawString(CONCEPT_EN, 112 + f.measureText(CONCEPT) + 24, 418, D.font(30, "mono"), paint(OVER))
    for k, line in enumerate(HOOK[VARIANT]):
        D.headline(c, line, 104, 590 + k * 110, 92, T, 0, hi_idx=tuple(range(len(line) - HI_N[VARIANT], len(line))) if k else ())
    pill(c, SUB[VARIANT], 300 if VARIANT == "A" else 400, 880, 44, fill=INK, txt=PAPER)
    D.stamp(c, 1560, 900, "指标成了目标", "GOODHART'S LAW", 1.0, rot=-7, size=64)
    D.hud(c, 0.0, "CASE 1902-HN", "EP. 06", "1902 · HANOI")
    finish(surf, c, w, h, f"cover_16x9_{VARIANT}.png")


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    page(c, w, h)
    D.headline(c, TITLE, 540, 300, 220, T, 0, align="center")
    f = D.font(42, "serif")
    tw = f.measureText(CONCEPT)
    c.drawString(CONCEPT, 540 - tw / 2, 385, f, paint(INK))
    exhibit(c, 560, 760, 0.82)
    for k, line in enumerate(HOOK[VARIANT]):
        D.headline(c, line, 540, 1140 + k * 104, 84, T, 0, align="center",
                   hi_idx=tuple(range(len(line) - HI_N[VARIANT], len(line))) if k else ())
    pill(c, SUB[VARIANT], 540, 1350, 40, fill=INK, txt=PAPER)
    finish(surf, c, w, h, f"cover_3x4_{VARIANT}.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
