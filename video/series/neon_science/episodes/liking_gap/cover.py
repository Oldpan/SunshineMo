"""Cover images for "好感差距 / The Liking Gap", drawn entirely in code.

  python3 cover.py      # → out/cover_16x9.png (1920x1080), out/cover_3x4.png (1080x1440)
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
from style import PALETTES, still_background as background, cover_title, spaced, save_cover as finish  # noqa: E402

OUT = os.path.join(HERE, "out")


def title(c, x, y, size, align="left"):
    return cover_title(c, "好感差距", x, y, size, align)


def gap_chart(c, x, y, s=1.0):
    """Mini 5.82 vs 5.17 bars; (x, y) = baseline centre."""
    hmax = 330 * s
    tops = []
    for v, lab, col, dx in [(5.82, "TA 实际的喜欢", PINK, -95), (5.17, "你以为的", CYAN, 95)]:
        bx, hh, bw = x + dx * s - 70 * s, hmax * v / 7, 140 * s
        sh = skia.GradientShader.MakeLinear([skia.Point(0, y - hh), skia.Point(0, y)],
                                            [argb(col, 0.95), argb(col, 0.2)])
        c.drawRRect(rrect(bx, y - hh, bw, hh, 8 * s), paint(col, 0.35, blur=22))
        c.drawRRect(rrect(bx, y - hh, bw, hh, 8 * s), skia.Paint(AntiAlias=True, Shader=sh))
        draw_text(c, f"{v:.2f}", x + dx * s, y - hh + 62 * s, font(46 * s, "Inter-Black"), paint(WHITE))
        draw_text(c, lab, x + dx * s, y + 44 * s, font(28 * s), paint(col, 0.95))
        tops.append(y - hh)
    c.drawLine(x - 200 * s, y, x + 200 * s, y, paint(WHITE, 0.5, stroke=2))
    ax = x + 200 * s
    p = paint(GOLD, 1, stroke=2.5)
    p.setPathEffect(skia.DashPathEffect.Make([10 * s, 8 * s], 0))
    c.drawLine(x - 25 * s, tops[0], ax, tops[0], p)
    w = paint(GOLD, 1, stroke=3.5, cap_round=True)
    c.drawLine(ax, tops[0], ax, tops[1], w)
    for yy, d in ((tops[0], 1), (tops[1], -1)):
        c.drawLine(ax - 10 * s, yy + 10 * s * d, ax, yy, w)
        c.drawLine(ax + 10 * s, yy + 10 * s * d, ax, yy, w)
    glow_text(c, "差距", ax + 18 * s, (tops[0] + tops[1]) / 2 + 13 * s, font(36 * s, bold=True), GOLD,
              align="left")


def chat(c, x_left, x_right, y, s=1.0):
    bubble(c, "今天聊得好开心！", x_left, y, 38 * s, 1.0, side="left", fill=(0.17, 0.18, 0.26), glow=0.4)
    bubble(c, "下次再约？", x_left, y + 96 * s, 38 * s, 1.0, side="left", fill=(0.17, 0.18, 0.26), glow=0.4)
    bubble(c, "（是不是冷场了……）", x_right, y - 104 * s, 30 * s, 1.0, side="right", fill=(0.10, 0.11, 0.17),
           txt=GREY, tail=False)


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    background(c, w, h, PALETTES["violet_drop"])
    # darken the left side so the title reads cleanly
    sh = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(w * 0.62, 0)],
                                        [argb((0, 0, 0), 0.6), argb((0, 0, 0), 0.0)])
    c.drawPaint(skia.Paint(Shader=sh))
    x = 130
    glow_text(c, "你以为聊天冷场了？", x, 330, font(72), (0.88, 0.92, 1.0), glow=10, glow_a=0.3, align="left")
    title(c, x - 8, 590, 250)
    rich_line(c, [("其实对方比你想的", WHITE), ("更喜欢你", PINK)], x, 720, 76, align="left", bold=True)
    spaced(c, "THE LIKING GAP", x, 805, font(34, "Inter-SemiBold"), 18, GOLD, 0.9)
    c.drawRRect(rrect(x, 860, 330, 52, 26), paint(WHITE, 0.12))
    draw_text(c, "心理学研究 · 2018 / 2024", x + 165, 896, font(26), paint(GREY), align="center")
    gap_chart(c, 1500, 800, 1.05)
    chat(c, 1170, 1830, 250, 1.0)
    finish(surf, w, h, os.path.join(OUT, "cover_16x9.png"))


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    background(c, w, h, PALETTES["violet_drop"])
    sh = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, h * 0.6)],
                                        [argb((0, 0, 0), 0.55), argb((0, 0, 0), 0.0)])
    c.drawPaint(skia.Paint(Shader=sh))
    cx = w / 2
    glow_text(c, "你以为聊天冷场了？", cx, 200, font(68), (0.88, 0.92, 1.0), glow=10, glow_a=0.3)
    title(c, cx, 440, 230, align="center")
    rich_line(c, [("其实对方比你想的", WHITE), ("更喜欢你", PINK)], cx, 570, 68, bold=True)
    spaced(c, "THE LIKING GAP", cx, 650, font(32, "Inter-SemiBold"), 16, GOLD, 0.9, align="center")
    chat(c, 90, w - 90, 860, 0.95)
    gap_chart(c, cx - 40, 1330, 0.95)
    finish(surf, w, h, os.path.join(OUT, "cover_3x4.png"))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
