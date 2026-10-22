"""Covers for 《我不知道》: 16:9 (1920x1080) and 3:4 (1080x1440), noir like the film.

Hook / big WenKai title (道 in gold) / one-line subject / letter-spaced English on the dark side; the
cork board on the other: four equally unlikely suspects, 今今 in its fedora pointing at one anyway
along a red thread, and the 查无此文 stamp across it all; 念念 with her magnifier.
"""
import os
import sys
from pathlib import Path

import skia

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
sys.path.insert(0, str(HERE))
from core.gfx import W, H, font, paint  # noqa: E402
from style import *  # noqa: E402,F401,F403
from scene import *  # noqa: E402,F401,F403
import cues as K  # noqa: E402

LOOK = NOIR["case"]
HOOK, TITLE, SUB, EN = "它说得很肯定。", "我不知道", "AI 为什么会“一本正经地编”", "HALLUCINATION"


def board(c, x0, y0, s):
    """The board, suspects, thread, stamp and both critters, scaled by s with its top-left at (x0, y0)."""
    c.save()
    c.translate(x0, y0)
    c.scale(s, s)
    corkboard(c, LOOK, 2.0)
    sentence(c, K.SENT3[0], "", W / 2, 200, 58)
    p = suspects(c, 210, 300, K.SENT3[1], K.SENT3[2], 1.3, LOOK, pick=0, w=1500)
    jin_at(c, 1640, 1000, px=9, expr="happy", arms="up", glow=0.12)
    thread(c, (1580, 900), p, 1.0, seed=3)
    QMARK.draw(c, 1670, 760, px=8, glow=0.3)
    stamp(c, "查无此文", 1080, 640, 1.0, size=150, rot=-12, seed=2)
    c.restore()


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.drawPaint(paint((0.02, 0.02, 0.04)))
    board(c, 930, 210, 0.55)
    blind_light(c, 0, 1.4, angle=-24, period=70, drift=0)
    sh = skia.GradientShader.MakeLinear([(0, 0), (900, 0)], [skia.Color4f(0.02, 0.02, 0.04, 1).toColor(),
                                                              skia.Color4f(0.02, 0.02, 0.04, 0).toColor()])
    c.drawRect(skia.Rect.MakeXYWH(0, 0, 900, h), skia.Paint(Shader=sh))
    nian_at(c, 1480, 1040, px=10, expr="surprise", mag=True, glow=0.15)
    label(c, HOOK, 300, 250, 50, seed=1)
    headline(c, TITLE, 80, 520, 190, align="left", glow=0.5, accent=[("道", GOLD)])
    say(c, SUB, 92, 640, 50, col=WHITE, align="left", kind="cjk")
    spaced(c, EN, 96, 730, font(32, "Inter-SemiBold"), 14, (0.75, 0.75, 0.9))
    save_cover(surf, w, h, os.path.join(OUT, "cover_16x9.png"), LOOK)


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.drawPaint(paint((0.02, 0.02, 0.04)))
    board(c, 2, 690, 0.56)
    blind_light(c, 0, 1.4, angle=-24, period=70, drift=0, w=w, h=h)
    sh = skia.GradientShader.MakeLinear([(0, 560), (0, 760)], [skia.Color4f(0.02, 0.02, 0.04, 1).toColor(),
                                                                skia.Color4f(0.02, 0.02, 0.04, 0).toColor()])
    c.drawRect(skia.Rect.MakeXYWH(0, 0, w, 760), skia.Paint(Shader=sh))
    nian_at(c, 150, 1410, px=9, expr="surprise", mag=True, glow=0.15)
    label(c, HOOK, w / 2, 170, 48, seed=1)
    headline(c, TITLE, w / 2, 410, 200, glow=0.5, accent=[("道", GOLD)])
    say(c, SUB, w / 2, 510, 46, col=WHITE, kind="cjk")
    spaced(c, EN, w / 2, 585, font(30, "Inter-SemiBold"), 12, (0.75, 0.75, 0.9), align="center")
    save_cover(surf, w, h, os.path.join(OUT, "cover_3x4.png"), LOOK)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
