"""Covers for 《你来啦》: 16:9 (1920x1080) and 3:4 (1080x1440).

Hook question / big WenKai title / one-line subject / letter-spaced English on the free side;
the night desk with the monitor (今今 saying "你来啦，念念！", context bar, memory.md) and 念念 on the other.
"""
import os
import sys
from pathlib import Path

import skia

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.gfx import W, H, font, paint, draw_text  # noqa: E402
from style import *  # noqa: E402,F401,F403

LOOK = PALETTES["glow"]
HOOK, TITLE, SUB, EN = "如果它每天醒来，都会忘了你", "你来啦", "AI 的上下文窗口和 memory", "CONTEXT & MEMORY"


def scene_ui(c):
    """Screen-space UI shown inside the monitor."""
    wallpaper(c, LOOK, 3.0)
    r = window(c, 300, 150, 1320, 880, "新对话", LOOK, cap=0.18, mem=0.14, t=0.5)
    loading(c, r[0] + 40, r[1] + 24, 560, 1.0, LOOK)
    chat(c, (r[0], r[1] + 70, r[2], r[3] - 70), [Msg("jin", "你来啦，念念！", -5, typing=False, size=96)], 1.0,
         LOOK)
    FILE.draw(c, r[0] + r[2] - 130, r[1] + 30, px=8, glow=0.6)
    JIN.draw_at(c, 300 + 1320 * 0.86, 152, px=13, expr="happy", arms="cheer", shadow=0)


def backdrop(c, scale=1.0, dx=0.0, stars=()):
    c.save()
    c.translate(dx, 0)
    c.scale(scale, scale)
    Sky().draw(c, LOOK, 2.0, twinkle=0)
    skyline(c, LOOK, 2.0)
    desk(c, LOOK, 822, lamp=False, mug_x=0)
    c.restore()
    for sx, sy in stars:
        STAR.draw(c, sx, sy, px=7, glow=0.7)


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    backdrop(c, stars=[(1040, 70), (1300, 40), (1780, 60), (820, 120)])
    sx, sy, sw, sh = monitor(c, 1390, 400, 832, 468, LOOK)
    with inside(c, sx, sy, sw, sh):
        scene_ui(c)
    glass(c, sx, sy, sw, sh)
    NIAN.draw_at(c, 960, 824, px=11, expr="shine", tear=0.3, glow=0.15)
    say(c, HOOK, 90, 250, 54, col=(0.88, 0.88, 1.0), align="left")
    headline(c, TITLE, 80, 520, 230, align="left", glow=0.5, accent=[("啦", GOLD)])
    say(c, SUB, 92, 640, 50, col=WHITE, align="left", kind="cjk")
    spaced(c, EN, 96, 730, font(32, "Inter-SemiBold"), 14, (0.75, 0.75, 0.9))
    save_cover(surf, w, h, os.path.join(OUT, "cover_16x9.png"), LOOK)


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    s = h / H
    backdrop(c, s, (w - W * s) / 2, stars=[(80, 640), (980, 660), (900, 40)])
    sx, sy, sw, sh = monitor(c, w / 2 + 40, 930, 864, 486, LOOK)
    with inside(c, sx, sy, sw, sh):
        scene_ui(c)
    glass(c, sx, sy, sw, sh)
    NIAN.draw_at(c, 170, 1300, px=11, expr="shine", tear=0.3, glow=0.15)
    say(c, HOOK, w / 2, 170, 50, col=(0.88, 0.88, 1.0))
    headline(c, TITLE, w / 2, 400, 210, glow=0.5, accent=[("啦", GOLD)])
    say(c, SUB, w / 2, 500, 46, col=WHITE, kind="cjk")
    spaced(c, EN, w / 2, 575, font(30, "Inter-SemiBold"), 12, (0.75, 0.75, 0.9), align="center")
    save_cover(surf, w, h, os.path.join(OUT, "cover_3x4.png"), LOOK)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
