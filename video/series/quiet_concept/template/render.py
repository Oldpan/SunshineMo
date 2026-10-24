"""Template renderer for a quiet_concept (一帧一理) episode: five shots on the 14-bar template song.

  python3 music.py && python3 render.py --still 4 12 22 27 32   # check frames
  python3 render.py --range 0 15 --fps 30                    # preview
  python3 render.py                                          # full 1920x1080 @ 60 fps

Shots draw only the picture; captions come from cues.LINES and are drawn by the style.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.timeline import Timeline, Sync  # noqa: E402
from core.pipeline import run  # noqa: E402
from style import *  # noqa: E402,F401,F403
from cues import BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, captions  # noqa: E402

tl = Timeline(bpm=BPM, bars=BARS, sections=SECTIONS, hard_cuts=True)
B, shot, BAR, BEAT = tl.B, tl.shot, tl.bar, tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))
GROUND = 812


def at(lt, bar, dur=0.8, beat=0.0):
    """0 -> 1 ease starting at (bar, beat) of the shot's own clock."""
    return smooth((lt - bar * BAR - beat * BEAT) / dur)


@shot(0, B(4), tin=0.0, tout=0.0, kin="cut", kout="cut")
def hook(c, x, t, lt):
    # the anchor: one warm thing (the familiar) and one cool thing (the unknown) under a pool of light
    c.drawLine(80, GROUND, W - 80, GROUND, paint(FAINT, 1, stroke=2))
    for xx, col, bar, cn, en in ((560, WARM, 0, "熟悉的", "THE KNOWN"), (1360, COOL, 1, "未知的", "THE UNKNOWN")):
        u = at(lt, bar)
        spot(c, xx, GROUND - 40, 300, col, 0.6 * u)
        c.drawRect(skia.Rect.MakeXYWH(xx - 60, GROUND - 220, 120, 220), paint(col, 0.5 * u, stroke=2))
        tag(c, cn, en, xx, GROUND - 270, col, u, 30, "center")
    figure(c, 960, GROUND, 1.0, INK, 0.95)
    x.zoom = 1 + 0.04 * smooth((lt - B(3)) / BAR)


@shot(B(4), B(6), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt):
    u = smooth(lt / 1.0)
    tag(c, CONCEPT, CONCEPT_EN, CX, 372, DIM, u * 0.9, 30, "center")
    title_glow(c, TITLE, CX, 580, 160, INK, u)
    c.drawLine(CX - 220 * u, 636, CX + 220 * u, 636, paint(FAINT, u, stroke=1.5))
    caption_line(c, TITLE_Q, CX, 708, 44, lt - 0.8, shadow=False)
    x.flash = 0.25 * S.pulse("impact", t, 0.25)


@shot(B(6), B(10), tin=0.4, tout=0.0, kin="fade", kout="cut")
def mechanism(c, x, t, lt):
    # the classic study: a year and a name, then a thin chart whose numbers roll
    tag(c, "1979", "AUTHOR · JOURNAL", 140, 130, INK, at(lt, 0, 0.5), 34)
    x0, x1, y = 360, 1560, 820
    c.drawLine(x0, y, x1, y, paint(FAINT, at(lt, 0), stroke=2))
    for i, (v, col) in enumerate(((0.7, WARM), (0.45, COOL))):
        u = at(lt, 1 + i, 1.2)
        h = 380 * v * u
        c.drawRect(skia.Rect.MakeXYWH(760 + i * 280, y - h, 120, h), paint(col, 0.55))
        draw_text(c, f"{counter(u, 0, v * 10):d}", 820 + i * 280, y - h - 24, font(40, "SemiBold"), paint(col, u))


@shot(B(10), B(12), tin=0.0, tout=0.0, kin="cut", kout="cut")
def final_words(c, x, t, lt):
    # the anchor again, low and small, under the centred two-line ending
    for xx, col in ((560, WARM), (1360, COOL)):
        c.drawRect(skia.Rect.MakeXYWH(xx - 52, 760, 104, 200), paint(col, 0.7, stroke=2))
        beam(c, xx, 760, 1080, 104, 300, col, 0.8)


@shot(B(12), B(14), tin=0.8, tout=0.0, kin="fade", kout="cut")
def end_card(c, x, t, lt):
    u = smooth(lt / 1.0)
    tag(c, CONCEPT, CONCEPT_EN, CX, 300, DIM, u * 0.9, 26, "center")
    title_glow(c, TITLE, CX, 450, 104, INK, u)
    draw_text(c, "Author, A. (1979). Title of the classic paper. Journal.", CX, 590, font(18, "Light"),
              paint(DIM, 0.8 * u))


LOOKS = {"intro": LOOKS_BASE["night"], "title": LOOKS_BASE["deep"], "body": LOOKS_BASE["cool"],
         "end": LOOKS_BASE["deep"]}
style = QuietConcept(tl, S, LOOKS, captions=captions())

if __name__ == "__main__":
    run(style.frame, style.setup, tl.dur, tl.fps, OUT, "episode.mp4")
