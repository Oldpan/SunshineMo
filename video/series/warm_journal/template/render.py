"""Template renderer for a warm_journal episode: three shots cut to the 8-bar template song.

  python3 music.py && python3 render.py --still 4 9 16   # check frames
  python3 render.py --range 0 24 --fps 30                 # preview
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
from core.hand import *  # noqa: E402,F401,F403
from core.timeline import Timeline, Sync  # noqa: E402
from core.pipeline import run  # noqa: E402
from style import *  # noqa: E402,F401,F403

OUT = os.path.join(HERE, "out")
SECTIONS = [("intro", 0, 2), ("verse", 2, 4), ("drop", 4, 8)]  # must match music.py
tl = Timeline(bpm=80, bars=8, sections=SECTIONS)
B, shot = tl.B, tl.shot
S = Sync(os.path.join(OUT, "sync.npz"))


def u_(t, t0, d):
    return clamp((t - t0) / d)


@shot(0, B(2), tin=0.01, tout=0.4, kin="cut", kout="slide")
def hook(c, x, t, lt):
    L = x.look
    calendar_page(c, 1330, 575, 1.1, "2026 · 十二月", 31, "星期四", ("早睡", "熬夜"), L)
    clock(c, 1745, 175, 95, 23.9, L, sec=max(S.index("tick", t), 0), numbers=False)
    text_ink(c, "一个让人好奇的问题？", 170, 520, font(80, "kai", True), lt - 0.5, col=L["ink"], align="left")


@shot(B(2), B(4), tin=0.4, tout=0.01, kin="slide", kout="cut")
def setup_(c, x, t, lt):
    L = x.look
    with sticky(c, CX, 520, 420, rot=-3, col=NOTE_COLS[0], scale=lerp(1.3, 1, ease_in(u_(lt, 0, 0.16), 2))):
        draw_text(c, "研究者做了", 0, -20, font(56, "kai", True), paint((0.2, 0.16, 0.16)))
        draw_text(c, "一个调查", 0, 60, font(56, "kai", True), paint((0.2, 0.16, 0.16)))
    hand_underline(c, CX - 160, CX + 160, 800, u_(lt, 1.0, 0.6), L["a1"], t=t, seed="u")


@shot(B(4), B(8), tin=0.01, tout=0.01, kin="cut", kout="cut")
def payoff(c, x, t, lt):
    L = x.look
    text_stamp(c, "结论标题", CX, 470, font(170, "kai", True), u_(lt, 0, 0.16), L["a2"])
    x.shake += 9 * math.exp(-lt / 0.12)
    stamp(c, "关键数字", CX, 700, 70, u_(lt, tl.bar, 0.16), col=L["a1"], rot=-6, paper=L["paper"])


LOOKS = {"intro": PALETTES["dawn"], "verse": PALETTES["office"], "drop": PALETTES["lamp"]}
style = WarmJournal(tl, S, LOOKS, fast=("drop",))

if __name__ == "__main__":
    run(style.frame, style.setup, tl.dur, tl.fps, OUT, "episode.mp4")
