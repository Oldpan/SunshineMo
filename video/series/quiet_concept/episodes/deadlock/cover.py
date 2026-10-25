"""Cover images for 谁先开口 (死锁), drawn in code: the two phones and the loop of waiting, under the title.

  python3 cover.py      # → out/cover_16x9.png (1920x1080), out/cover_3x4.png (1080x1440)
"""
import math
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
from render import phone, arc_arrow, chat_bubble, PH_L, PH_R, PH_W, PH_H, PH_Y  # noqa: E402


def dust(c, w, h, n=90):
    for i in range(n):
        d = 0.3 + 0.7 * rnd("cd", i)
        c.drawCircle(w * rnd("cx", i), h * rnd("cy", i), 0.6 + 1.6 * d, paint(INK, 0.16 * d))


# A: the stuck loop (both typing, nobody sends).  B: the ending (you sent it, TA is typing back), a warmer hook.
VARIANT = os.environ.get("COVER", "A")
COVER_Q = {"A": TITLE_Q, "B": "{先开口}的那个，不是输了"}


def scene(c, s, dx, dy):
    """The opening phones scaled by s and moved by (dx, dy): both typing, nobody sending, a red loop between."""
    c.save()
    c.translate(dx, dy)
    c.scale(s, s)
    if VARIANT == "B":
        phone(c, PH_L, 0.3, 1.0, True, 1.6, 1.0, 1.0, "", sent="那天是我不好。", sent_u=1.0)
        phone(c, PH_R, 0.3, 1.0, False, 1.4, 1.0, 0.0, "我也是", sent=None)
        chat_bubble(c, "那天是我不好。", PH_R - PH_W / 2 + 20, PH_Y - PH_H / 2 + 330, "left", WARM, 1.0, 28)
        arc_arrow(c, 960, PH_Y - 60, 150, math.pi * 1.15, math.pi * 1.85, WARM, 0.9, 3, 14, 1.0, glow=True)
    else:
        phone(c, PH_L, 0.3, 1.0, True, 1.2, 1.0, 1.0, "对不起，我", cursor=True)
        phone(c, PH_R, 0.3, 1.0, False, 1.2, 1.0, 1.0, "其实我也", cursor=True)
        arc_arrow(c, 960, PH_Y, 150, math.pi * 1.15, math.pi * 1.85, NEG, 0.9, 3, 14, 1.0, glow=True)
        arc_arrow(c, 960, PH_Y, 150, math.pi * 0.15, math.pi * 0.85, NEG, 0.9, 3, 14, 1.0, glow=True)
    c.restore()


def heading(c, cx, y, size, q_size):
    """Concept tag, glowing title, rule and the question, centred on cx; y is the title baseline."""
    tag(c, CONCEPT, CONCEPT_EN, cx, y - size * 1.02, DIM, 0.95, q_size * 0.62, "center")
    title_glow(c, TITLE, cx, y, size, INK)
    c.drawLine(cx - size * 1.3, y + size * 0.3, cx + size * 1.3, y + size * 0.3, paint(FAINT, 1, stroke=1.5))
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
    scene(c, 0.75, 960 - 960 * 0.75, 372)
    heading(c, w / 2, 300, 170, 48)
    c.drawString("一帧一理", w - 64 - serif(24).measureText("一帧一理"), 70, serif(24), paint(INK, 0.42))
    finish(surf, w, h, "cover_16x9.png" if VARIANT == "A" else "cover_16x9_B.png")


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    cover_background(c, w, h, LOOKS_BASE["night"])
    dust(c, w, h)
    s = 0.82
    scene(c, s, w / 2 - 960 * s, 745)
    heading(c, w / 2, 540, 200, 52)
    finish(surf, w, h, "cover_3x4.png" if VARIANT == "A" else "cover_3x4_B.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
