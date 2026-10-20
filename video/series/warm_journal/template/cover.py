"""Template covers for a warm_journal episode: 16:9 (1920x1080) and 3:4 (1080x1440).

Layout from episode 1: hook question / big WenKai headline over a highlighter swipe /
answer line with the key words in the accent colour, underlined by hand / letter-spaced
English title.  Paper objects (calendar page, clock, sticky note with the key number) on
the free side.
"""
import os
import sys
from pathlib import Path

import skia

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.gfx import *  # noqa: E402,F401,F403
from core.hand import hand_underline  # noqa: E402
from style import PALETTES, still_background, cover_title, save_cover, calendar_page, clock, spaced  # noqa: E402

LOOK = PALETTES["morning"]
HOOK, TITLE, EN = "一个让人好奇的问题？", "结论标题", "ENGLISH TITLE"
ANSWER = [("一句话", LOOK["ink"]), ("说清结论", LOOK["a1"])]


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
    spaced(c, EN, x, 840, font(34, "Inter-SemiBold"), 18, LOOK["soft"])
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
    spaced(c, EN, cx, 650, font(30, "Inter-SemiBold"), 16, LOOK["soft"], align="center")
    clock(c, 870, 830, 110, 23.97, LOOK, sec=48, numbers=False)
    calendar_page(c, 470, 1030, 1.05, "2026 · 十二月", 31, "星期四", ("早睡", "熬夜"), LOOK)
    save_cover(surf, w, h, os.path.join(OUT, "cover_3x4.png"), LOOK)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
