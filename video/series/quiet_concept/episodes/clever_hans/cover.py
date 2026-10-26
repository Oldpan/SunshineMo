"""Cover images for 会算数的马 (过拟合), drawn in code: the horse, the questioner and the warm cue line between them.

  python3 cover.py             # → out/cover_16x9.png (1920x1080), out/cover_3x4.png (1080x1440)
  COVER=B python3 cover.py     # → out/cover_16x9_B.png, out/cover_3x4_B.png
"""
import os
import sys
from pathlib import Path

import skia

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core import post  # noqa: E402
from style import *  # noqa: E402,F401,F403
from cues import TITLE, TITLE_Q, CONCEPT, CONCEPT_EN  # noqa: E402
from render import horse, asker  # noqa: E402

# A: the film's question.  B: the strongest verifiable number (Pfungst 1907), as a positive hook.
VARIANT = os.environ.get("COVER", "A")
COVER_Q = {"A": TITLE_Q, "B": "它答对了 {89%} 的题，靠的是[看脸]"}


def dust(c, w, h, n=90):
    for i in range(n):
        d = 0.3 + 0.7 * rnd("cd", i)
        c.drawCircle(w * rnd("cx", i), h * rnd("cy", i), 0.6 + 1.6 * d, paint(INK, 0.16 * d))


def scene(c, s, dx, dy):
    """Horse on the left looking at the questioner on the right; the cue line between eye and face."""
    c.save()
    c.translate(dx, dy)
    c.scale(s, s)
    hx, gy, hs = 560, 760, 1.25
    spot(c, hx, gy - 180, 520, WARM, 0.4)
    beam(c, hx, -200, gy + 40, 110, 700, WARM, 0.8)
    c.drawLine(140, gy, 1780, gy, paint(FAINT, 1, stroke=2))
    horse(c, hx, gy, hs, INK, 1.0, 0.55, 0.7, eye=0.9)
    ax, ay = 1380, 640
    spot(c, ax, ay - 200, 360, COOL, 0.3)
    asker(c, ax, ay, 1.1, COOL, 1.0, 10)
    ex, ey = hx + 180 * hs, gy - 312 * hs
    p0 = (ax - 60, ay - 205)
    c.drawLine(*p0, ex + 16, ey, paint(WARM, 0.45, stroke=16, blur=12, cap_round=True))
    c.drawLine(*p0, ex + 16, ey, paint(WARM, 1.0, stroke=4, cap_round=True))
    c.restore()


def heading(c, cx, y, size, q_size):
    tag(c, CONCEPT, CONCEPT_EN, cx, y - size * 1.02, DIM, 0.95, q_size * 0.62, "center")
    title_glow(c, TITLE, cx, y, size, INK)
    c.drawLine(cx - size * 1.6, y + size * 0.3, cx + size * 1.6, y + size * 0.3, paint(FAINT, 1, stroke=1.5))
    caption_line(c, COVER_Q[VARIANT], cx, y + size * 0.3 + q_size * 1.5, q_size, 9.0, shadow=False)


def finish(surf, w, h, name):
    post.vignette(surf.getCanvas(), w, h, 0.5, inner=0.5)
    save_png(surf, os.path.join(OUT, name), grain=2.0)


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    cover_background(c, w, h, LOOKS_BASE["night"])
    dust(c, w, h)
    scene(c, 0.8, 960 - 960 * 0.8, 410)
    heading(c, w / 2, 280, 160, 48)
    c.drawString("一帧一理", w - 64 - serif(24).measureText("一帧一理"), 70, serif(24), paint(INK, 0.42))
    finish(surf, w, h, "cover_16x9.png" if VARIANT == "A" else "cover_16x9_B.png")


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    cover_background(c, w, h, LOOKS_BASE["night"])
    dust(c, w, h)
    s = 0.62
    scene(c, s, w / 2 - 960 * s, 720)
    heading(c, w / 2, 520, 180, 46)
    finish(surf, w, h, "cover_3x4.png" if VARIANT == "A" else "cover_3x4_B.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
