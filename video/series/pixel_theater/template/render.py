"""Template renderer for a pixel_theater episode: three shots cut to the 8-bar template song.

  python3 music.py && python3 render.py --still 2 8 16   # check frames
  python3 render.py --range 0 23 --fps 30                # preview
  python3 render.py                                      # full 1920x1080 @ 60 fps

The three shot types of the series: a wide night desk (the monitor shows screen-space UI), a
full-frame screen with the chat window and a tip card, a close-up of a critter.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.gfx import W, clamp  # noqa: E402
from core.timeline import Timeline, Sync  # noqa: E402
from core.pipeline import run  # noqa: E402
from style import *  # noqa: E402,F401,F403

SECTIONS = [("intro", 0, 2), ("chat", 2, 4), ("drop", 4, 8)]  # must match music.py
tl = Timeline(bpm=84, bars=8, sections=SECTIONS, hard_cuts=True)
B, shot = tl.B, tl.shot
S = Sync(os.path.join(OUT, "sync.npz"))
WIN = (300, 150, 1320, 880)
CHAT = [Msg("jin", "你好！我是今今。", B(0, 2), cps=30), Msg("nian", "你好呀，我叫念念。", B(2)),
        Msg("jin", "一句讲清概念的话。", B(3), cps=30)]


def ui(c, t, look):
    r = window(c, *WIN, "新对话", look, u=(t - B(0, 1)) / 0.4, cap=0.1 * sum(t >= m.t0 for m in CHAT), t=t)
    chat(c, r, CHAT, t, look)
    JIN.draw_at(c, WIN[0] + WIN[2] * 0.88, WIN[1] + 2, px=7, t=t, expr="happy", arms="wave", shadow=0)


@shot(0, B(2))
def wide_(c, x, t, lt):
    look = x.look
    skyline(c, look, t)
    desk(c, look)
    sx, sy, sw, sh = monitor(c, 1080, 420, 832, 468, look)
    with inside(c, sx, sy, sw, sh):
        wallpaper(c, look, t)
        ui(c, t, look)
    glass(c, sx, sy, sw, sh)
    NIAN.draw_at(c, 400, 824, px=9, t=t, expr="happy", glow=0.12)
    say(c, "一个让人好奇的钩子——", W / 2, 990, 60, t=lt - 0.5)


@shot(B(2), B(4))
def screen_(c, x, t, lt):
    x.sky = False
    wallpaper(c, x.look, t)
    ui(c, t, x.look)
    tip_card(c, ["一句话的小知识。"], tip_phase(t, B(3, 0), B(4) - 0.4), x.look)  # in, hold, out before the cut
    screen_frame(c, x.look)


@shot(B(4), B(8))
def close_(c, x, t, lt):
    x.sky = False
    bokeh_room(c, x.look, t)
    NIAN.draw_at(c, 720, 900, px=26, t=t, expr="shine", tear=(lt / 1.2) % 1, glow=0.1)
    headline(c, "情绪落点", 1380, 440, 110, a=clamp(lt / 0.3))


LOOKS = {"intro": PALETTES["night"], "chat": PALETTES["night"], "drop": PALETTES["glow"]}
style = PixelTheater(tl, S, LOOKS, fast=("drop",), drops=("drop",))

if __name__ == "__main__":
    run(style.frame, style.setup, tl.dur, tl.fps, OUT, "episode.mp4")
