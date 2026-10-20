"""Covers for 长大后时间越过越快？: 16:9 (1920x1080) and 3:4 (1080x1440)."""
import os
import sys
from pathlib import Path

import skia

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.gfx import *  # noqa: E402,F401,F403
from core.hand import hand_underline, hand_circle  # noqa: E402
from style import (PALETTES, MULTIPLY, still_background, cover_title, save_cover, calendar_page, clock,  # noqa: E402
                   stamp, sticky, NOTE_COLS, spaced)

LOOK = PALETTES["morning"]
HOOK, TITLE, EN = "长大后，时间越过越快？", "不是年龄的锅", "WHY TIME FLIES"
ANSWER = [("是你", LOOK["ink"]), ("太忙了", LOOK["a1"])]


def bars_note(c, cx, cy, s, rot):
    """Sticky note with the key result: age 1.4 % vs time pressure 10.0 %."""
    with sticky(c, cx, cy, 300 * s, rot=rot, col=NOTE_COLS[0]):
        ink = (0.2, 0.16, 0.16)
        draw_text(c, "能解释多少差异", 0, -88 * s, font(30 * s, "kai", True), paint(ink))
        for k, (lab, v, col) in enumerate((("年龄", 1.4, (0.5, 0.45, 0.42)), ("太忙", 10.0, LOOK["a1"]))):
            y = -20 * s + k * 90 * s
            draw_text(c, lab, -118 * s, y + 12 * s, font(30 * s, "kai", True), paint(ink), align="left")
            bw = 92 * s * v / 10
            c.drawRRect(rrect(-50 * s, y - 16 * s, bw, 32 * s, 6 * s), paint(col))
            draw_text(c, f"{v:.1f}%", -50 * s + bw + 8 * s, y + 12 * s, font(26 * s, "Inter-Bold"), paint(col),
                      align="left")


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    still_background(c, w, h, LOOK)
    clock(c, 1770, 190, 110, 23 + 58 / 60, LOOK, sec=48, numbers=False)
    calendar_page(c, 1480, 560, 1.15, "2026 · 十二月", 31, "星期四", ("早点睡", "瞎忙"), LOOK, red=False)
    bars_note(c, 1110, 930, 1.0, -5)
    x = 130
    draw_text(c, HOOK, x, 330, font(66, "kai"), paint(LOOK["soft"]), align="left")
    x0, tw = cover_title(c, TITLE, x - 6, 560, 168, LOOK["ink"], marker=LOOK["a2"], marker_a=0.32)
    rich_line(c, ANSWER, x, 720, 96, align="left", bold=True, glow=0, kind="kai")
    f = font(96, "kai", True)
    xb = x + f.measureText("是你")
    hand_underline(c, xb, xb + f.measureText("太忙了"), 752, 1.0, LOOK["a1"], w=7, seed="cov")
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
    f = font(84, "kai", True)
    total = f.measureText("是你太忙了")
    xb = cx - total / 2 + f.measureText("是你")
    hand_underline(c, xb, xb + f.measureText("太忙了"), 573, 1.0, LOOK["a1"], w=7, seed="cov3")
    spaced(c, EN, cx, 650, font(30, "Inter-SemiBold"), 16, LOOK["soft"], align="center")
    clock(c, 870, 830, 110, 23 + 58 / 60, LOOK, sec=48, numbers=False)
    calendar_page(c, 470, 1030, 1.05, "2026 · 十二月", 31, "星期四", ("早点睡", "瞎忙"), LOOK)
    bars_note(c, 850, 1190, 0.95, 6)
    save_cover(surf, w, h, os.path.join(OUT, "cover_3x4.png"), LOOK)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
