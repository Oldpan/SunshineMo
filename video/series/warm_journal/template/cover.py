"""Template covers for a warm_journal episode: 16:9 (1920x1080) and 3:4 (1080x1440).

Layout from episode 1: hook question / big WenKai headline over a highlighter swipe /
answer line with the key words in the accent colour, underlined by hand / letter-spaced
English title.  Paper objects (calendar page, clock, sticky note with the key number) on
the free side.
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
from core.hand import hand_underline  # noqa: E402
from style import PALETTES, still_background, cover_title, save_cover, calendar_page, clock  # noqa: E402

OUT = os.path.join(HERE, "out")
LOOK = PALETTES["morning"]
HOOK, TITLE, EN = "一个让人好奇的问题？", "结论标题", "ENGLISH TITLE"
ANSWER = [("一句话", LOOK["ink"]), ("说清结论", LOOK["a1"])]


def spaced(c, s, x, y, size, col, sp, align="left"):
    f = font(size, "Inter-SemiBold")
    lay, total = char_layout(s, f, sp)
    x0 = x - total / 2 if align == "center" else x
    for ch, dx, _ in lay:
        c.drawString(ch, x0 + dx, y, f, paint(col))


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    still_background(c, w, h, LOOK)
    clock(c, 1770, 190, 110, 23.97, LOOK, sec=48, numbers=False)
    calendar_page(c, 1480, 560, 1.15, "2026 · 十二月", 31, "星期四", ("早睡", "熬夜"), LOOK)
    x = 130
    draw_text(c, HOOK, x, 330, font(66, "kai"), paint(LOOK["soft"]), align="left")
    cover_title(c, TITLE, x - 6, 560, 168, LOOK["ink"], marker=LOOK["a2"], marker_a=0.32)
    rich_line(c, ANSWER, x, 720, 96, align="left", bold=True, glow=0, kind="kai")
    f = font(96, "kai", True)
    xb = x + f.measureText(ANSWER[0][0])
    hand_underline(c, xb, xb + f.measureText(ANSWER[1][0]), 752, 1.0, LOOK["a1"], w=7, seed="cov")
    spaced(c, EN, x, 840, 34, LOOK["soft"], 18)
    save_cover(surf, w, h, os.path.join(OUT, "cover_16x9.png"), LOOK)


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    still_background(c, w, h, LOOK)
    cx = w / 2
    draw_text(c, HOOK, cx, 190, font(60, "kai"), paint(LOOK["soft"]))
    cover_title(c, TITLE, cx, 400, 160, LOOK["ink"], align="center", marker=LOOK["a2"], marker_a=0.32)
    rich_line(c, ANSWER, cx, 545, 84, bold=True, glow=0, kind="kai")
    spaced(c, EN, cx, 650, 30, LOOK["soft"], 16, align="center")
    clock(c, 870, 830, 110, 23.97, LOOK, sec=48, numbers=False)
    calendar_page(c, 470, 1030, 1.05, "2026 · 十二月", 31, "星期四", ("早睡", "熬夜"), LOOK)
    save_cover(surf, w, h, os.path.join(OUT, "cover_3x4.png"), LOOK)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
