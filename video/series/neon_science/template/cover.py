"""Template covers for a neon_science episode: 16:9 (1920x1080) and 3:4 (1080x1440).

Layout from episode 1: hook question / gradient headline / answer line with the key words
highlighted / letter-spaced English title.  Add a chart or chat bubbles on the free side.
"""
import os
import sys

import skia

HERE = os.path.dirname(os.path.abspath(__file__))


def _up(marker):
    """Nearest ancestor directory containing `marker` (works from template/ or episodes/<name>/)."""
    d = HERE
    while not os.path.exists(os.path.join(d, marker)):
        d = os.path.dirname(d)
    return d


sys.path[:0] = [_up("core"), _up("style.py")]  # video/ (core) and the series (style)
from core.gfx import *  # noqa: E402,F401,F403
from style import PALETTES, still_background, cover_title, spaced, save_cover  # noqa: E402

OUT = os.path.join(HERE, "out")
HOOK, TITLE, EN = "一个让人好奇的问题？", "结论标题", "ENGLISH TITLE"
ANSWER = [("一句话", WHITE), ("说清结论", PINK)]


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    still_background(c, w, h, PALETTES["violet_drop"])
    sh = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(w * 0.62, 0)],
                                        [argb((0, 0, 0), 0.6), argb((0, 0, 0), 0.0)])
    c.drawPaint(skia.Paint(Shader=sh))  # darken the text side
    x = 130
    glow_text(c, HOOK, x, 330, font(72), (0.88, 0.92, 1.0), glow=10, glow_a=0.3, align="left")
    cover_title(c, TITLE, x - 8, 590, 250)
    rich_line(c, ANSWER, x, 720, 76, align="left", bold=True)
    spaced(c, EN, x, 805, font(34, "Inter-SemiBold"), 18, GOLD, 0.9)
    save_cover(surf, w, h, os.path.join(OUT, "cover_16x9.png"))


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    still_background(c, w, h, PALETTES["violet_drop"])
    sh = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, h * 0.6)],
                                        [argb((0, 0, 0), 0.55), argb((0, 0, 0), 0.0)])
    c.drawPaint(skia.Paint(Shader=sh))
    cx = w / 2
    glow_text(c, HOOK, cx, 200, font(68), (0.88, 0.92, 1.0), glow=10, glow_a=0.3)
    cover_title(c, TITLE, cx, 440, 230, align="center")
    rich_line(c, ANSWER, cx, 570, 68, bold=True)
    spaced(c, EN, cx, 650, font(32, "Inter-SemiBold"), 16, GOLD, 0.9, align="center")
    save_cover(surf, w, h, os.path.join(OUT, "cover_3x4.png"))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
