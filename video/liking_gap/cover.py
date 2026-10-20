"""Cover images for "好感差距 / The Liking Gap", drawn entirely in code.

  python3 cover.py      # → out/cover_16x9.png (1920x1080), out/cover_3x4.png (1080x1440)
"""
import math
import os

import numpy as np
import skia

from gfx import *  # noqa: F401,F403
from render import BG_SKSL, LOOKS, OUT

LIN = skia.SamplingOptions(skia.FilterMode.kLinear)


def background(c, w, h, look, t=37.0):
    eff = skia.RuntimeEffect.MakeForShader(BG_SKSL)
    bw, bh = w // 3, h // 3
    lk = LOOKS[look]
    u = [bw, bh, t, 0.75, lk["warp"], *lk["c1"], *lk["c2"], *lk["c3"], *lk["bg"], 0.0, 1.0, 0.25, 0.3]
    surf = skia.Surface(bw, bh)
    surf.getCanvas().drawPaint(skia.Paint(Shader=eff.makeShader(
        skia.Data.MakeWithCopy(np.array(u, np.float32).tobytes()))))
    c.drawImageRect(surf.makeImageSnapshot(), skia.Rect(0, 0, bw, bh), skia.Rect(0, 0, w, h), LIN)
    r = np.random.default_rng(3)
    for _ in range(260):
        x, y, d = r.uniform(0, w), r.uniform(0, h), r.uniform(0.2, 1)
        c.drawCircle(x, y, 0.8 + 1.4 * d, paint(WHITE, 0.25 + 0.5 * d * r.uniform()))
    cols = [lk["c2"], lk["c3"], lk["c1"]]
    for i in range(10):
        rr = 50 + 130 * r.uniform()
        x, y = r.uniform(0, w), r.uniform(0, h)
        col = tuple(min(1.0, v * 2.2) for v in cols[i % 3])
        c.drawCircle(x, y, rr, paint(col, 0.08, blur=rr * 0.35, blend=PLUS))
        c.drawCircle(x, y, rr, paint(col, 0.07, stroke=1.5, blend=PLUS))


def title(c, x, y, size, align="left"):
    """Gradient-filled 好感差距 with a soft pink glow and a flare across it."""
    f = font(size, bold=True)
    tw = f.measureText("好感差距")
    x0 = x - tw / 2 if align == "center" else x
    c.drawString("好感差距", x0, y + 8, f, paint((0, 0, 0), 0.7, blur=18))
    c.drawString("好感差距", x0, y, f, paint(PINK, 0.55, blur=28))
    g = skia.GradientShader.MakeLinear([skia.Point(x0, y - size), skia.Point(x0 + tw, y)],
                                       [argb(WHITE), argb((1.0, 0.86, 0.92)), argb((1.0, 0.62, 0.78))])
    c.drawString("好感差距", x0, y, f, skia.Paint(AntiAlias=True, Shader=g))
    return x0, tw


def spaced(c, s, x, y, f, sp, col, a, align="left"):
    lay, total = char_layout(s, f, sp)
    x0 = x - total / 2 if align == "center" else x
    for ch, dx, _ in lay:
        c.drawString(ch, x0 + dx, y, f, paint(col, a))


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


def finish(surf, w, h, path):
    """Light bloom on the brightest spots, then save."""
    img = surf.makeImageSnapshot()
    small = skia.Surface(w // 4, h // 4)
    thr = skia.Paint(ColorFilter=skia.ColorFilters.Matrix([
        2.2, 0, 0, 0, -1.25, 0, 2.2, 0, 0, -1.25, 0, 0, 2.2, 0, -1.25, 0, 0, 0, 1, 0]))
    small.getCanvas().drawImageRect(img, skia.Rect(0, 0, w, h), skia.Rect(0, 0, w // 4, h // 4), LIN, thr)
    bp = skia.Paint(ImageFilter=skia.ImageFilters.Blur(6, 6), BlendMode=PLUS, Alphaf=0.35)
    surf.getCanvas().drawImageRect(small.makeImageSnapshot(), skia.Rect(0, 0, w // 4, h // 4),
                                   skia.Rect(0, 0, w, h), LIN, bp)
    surf.makeImageSnapshot().save(path, skia.kPNG)
    print(path)


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    background(c, w, h, "drop2")
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
    background(c, w, h, "drop2")
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
