"""Template renderer for a neon_science episode: three shots cut to the 8-bar template song.

  python3 music.py && python3 render.py --still 3 8 13   # check frames
  python3 render.py --range 0 8 --fps 30                  # preview
  python3 render.py                                       # full 1920x1080 @ 60 fps
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def _up(marker):
    """Nearest ancestor directory containing `marker` (works from template/ or episodes/<name>/)."""
    d = HERE
    while not os.path.exists(os.path.join(d, marker)):
        d = os.path.dirname(d)
    return d


sys.path[:0] = [_up("core"), _up("style.py")]  # video/ (core) and the series (style)
from core.gfx import *  # noqa: E402,F401,F403
from core.timeline import Timeline, Sync  # noqa: E402
from core.pipeline import run  # noqa: E402
from style import NeonNebula, PALETTES, flare  # noqa: E402

OUT = os.path.join(HERE, "out")
SECTIONS = [("intro", 0, 2), ("build", 2, 4), ("drop", 4, 8)]  # must match music.py
tl = Timeline(bpm=100, bars=8, sections=SECTIONS)
B, shot = tl.B, tl.shot
S = Sync(os.path.join(OUT, "sync.npz"))


def kick(t, d=0.12):
    return S.pulse("kick", t, d)


@shot(0, B(2), tin=0.01, tout=0.6, kin="cut", kout="fade")
def hook(c, x, t, lt):
    typing_dots(c, CX - 112, CY - 60, t, smooth(lt / 1.5), scale=1.5)
    text_type(c, "一个让人好奇的问题？", CX, CY + 110, font(64), lt - 0.8, cps=8, align="center")


@shot(B(2), B(4), tin=0.5, tout=0.3, kin="zoom", kout="zoom")
def setup_(c, x, t, lt):
    text_rise(c, "研究者做了一个实验", CX, CY - 40, font(72), lt, tint=CYAN)
    ring(c, CX, CY + 140, 60, clamp(lt / (2 * tl.bar)), CYAN)
    x.chroma += 0.5 * S.pulse("roll", t, 0.08)


@shot(B(4), B(8), tin=0.3, tout=1.0, kin="zoom", kout="fade")
def payoff(c, x, t, lt):
    k = kick(t, 0.18)
    text_pop(c, "结论标题", CX, CY + 40, font(200, bold=True), lt, stagger=tl.beat, tint=PINK, pulse=0.04 * k)
    flare(c, CX, CY - 40, k, PINK)
    rich_line(c, [("一句话说清", WHITE), ("关键数字", GOLD)], CX, CY + 200, 56, a=smooth((lt - tl.bar) / 0.5))
    x.chroma += k


LOOKS = {"intro": PALETTES["night"], "build": PALETTES["lab"], "drop": PALETTES["violet_drop"]}
style = NeonNebula(tl, S, LOOKS, drops=("drop",), glitch_at=[B(2), B(4)])

if __name__ == "__main__":
    run(style.frame, style.setup, tl.dur, tl.fps, OUT, "episode.mp4")
