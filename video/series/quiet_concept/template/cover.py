"""Template covers for a quiet_concept episode: the opening composition under the title, like the first frame.

  python3 cover.py      # → out/cover_16x9.png (1920x1080), out/cover_3x4.png (1080x1440)
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


def heading(c, cx, y, size, q_size):
    """Concept tag, glowing title, rule and the question, centred on cx; y is the title baseline."""
    tag(c, CONCEPT, CONCEPT_EN, cx, y - size * 1.02, DIM, 0.95, q_size * 0.62, "center")
    title_glow(c, TITLE, cx, y, size, INK)
    c.drawLine(cx - size * 1.3, y + size * 0.3, cx + size * 1.3, y + size * 0.3, paint(FAINT, 1, stroke=1.5))
    caption_line(c, TITLE_Q, cx, y + size * 0.3 + q_size * 1.5, q_size, 9.0, shadow=False)


def anchor(c, cx, ground, s=1.0):
    """Stand-in for the episode's anchor object: replace with the drawing from render.py."""
    for dx, col in ((-400, WARM), (400, COOL)):
        spot(c, cx + dx * s, ground - 40 * s, 300 * s, col, 0.6)
        c.drawRect(skia.Rect.MakeXYWH(cx + (dx - 60) * s, ground - 220 * s, 120 * s, 220 * s), paint(col, 0.5, stroke=2))
    figure(c, cx, ground, s, INK, 0.95)


def make(w, h, title_y, size, q_size, ground, s, name):
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    cover_background(c, w, h, LOOKS_BASE["night"])
    anchor(c, w / 2, ground, s)
    heading(c, w / 2, title_y, size, q_size)
    post.vignette(c, w, h, 0.5, inner=0.5)
    save_png(surf, os.path.join(OUT, name), grain=2.0)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    make(1920, 1080, 330, 190, 50, 1000, 1.0, "cover_16x9.png")
    make(1080, 1440, 530, 230, 52, 1250, 0.82, "cover_3x4.png")
