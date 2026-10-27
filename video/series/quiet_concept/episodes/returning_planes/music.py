"""回来的飞机 soundtrack (cold-open test, blueprint): 100 BPM, 10 bars, D minor.

Contrapuntal and mechanical, as the blueprint style asks: a harpsichord ostinato on sixteenths is the "gear",
pizzicato bass under it, a celesta answers each hole with a note, pen scratches follow the strokes.
Every sound that matters sits on a cues.HITS entry.  No true silence anywhere (series rule): the quiet moments
are a thinner texture, never a dropout.
"""
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)
from core.synth import *  # noqa: E402,F401,F403
from cues import BPM, BARS, SECTIONS, HITS  # noqa: E402

SONG = Song(bpm=BPM, bars=BARS, fps=60, sections=SECTIONS)
bt, BAR, BEAT = SONG.bt, SONG.bar, SONG.beat

Dm, Bb, F, Gm, A7 = [50, 53, 57], [46, 50, 53], [41, 45, 48], [43, 46, 50], [45, 49, 52]
CHORDS = [Dm, Dm, Bb, F, Dm, Bb, Gm, A7, Dm, Bb]
SCALE = [62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81]          # D natural minor, for the holes

BUS = make_buses(SONG, {"pad": 0.4, "pluck": 0.2, "foot": 0.1, "count": 0.35, "kick": 0.0, "clap": 0.15,
                        "hat": 0.05, "bass": 0.0, "fx": 0.25})
EVENTS = Events()
KICKS = []


def harpsichord(m, dur=0.35, seed=0):
    """Bright plucked string with a quill click."""
    s = pluck(m, dur, 1.4, seed)
    n = s.shape[-1]
    t = np.arange(n) / SR
    click = bandnoise(n, 2500, 9000, seed=seed + 3) * np.exp(-t / 0.004) * 0.25
    return (s + click).astype(np.float32)


def pizz(m, dur=0.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.5 * np.exp(-t * (6 + 3 * k)) for k in range(1, 6))
    return (s * np.minimum(t / 0.002, 1) * 0.6).astype(np.float32)


def celesta(m, dur=1.4):
    return fm_bell(m, dur, idx=1.2, ratio=4.0)


def scratch(dur=0.4, seed=0):
    """A technical pen on paper: band-passed grain, length = the stroke."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    g = bandnoise(n, 2000, 6000, seed=seed) * (0.6 + 0.4 * (np.random.default_rng(seed).random(n) > 0.5))
    env = np.minimum(t / 0.01, 1) * np.clip((dur - t) / 0.05, 0, 1)
    return (g * env * 0.25).astype(np.float32)


def punch(seed=0):
    """A hole: a rivet click, a small low thud."""
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    click = bandnoise(n, 3000, 8000, seed=seed + 11) * np.exp(-t / 0.003)
    thud = np.sin(2 * np.pi * np.cumsum(110 + 80 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.05)
    return ((0.5 * click + 0.6 * thud) * 0.6).astype(np.float32)


def slap():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    s = bandnoise(n, 300, 4000, seed=21) * np.exp(-t / 0.03) + 0.4 * np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.1)
    return (s * 0.7).astype(np.float32)


def at(name, lo=0, hi=BARS):
    return [(b, beat) for n, b, beat in HITS if n == name and lo <= b < hi]


def g(key, fn):
    return cached(key, fn)


def compose():
    for bar in range(BARS):
        notes = CHORDS[bar]
        BUS["pad"].add(bt(bar), g(("pad", tuple(notes)), lambda: string_pad(notes, BAR + 0.4, 0.5, 0.35,
                                                                            seed=notes[0])), 0.55)
    # the gear: harpsichord ostinato from bar 1, thinner in bars 5-7, full in the title
    for bar in range(1, BARS):
        ch = CHORDS[bar]
        pat = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]
        for s in range(16):
            if bar in (5, 6) and s % 2:
                continue
            m = pat[s % 4] + (12 if s in (6, 14) else 0)
            BUS["pluck"].add(bt(bar) + s * SONG.s16, g(("hc", m), lambda: harpsichord(m, 0.32, seed=m)),
                             0.5 if s % 4 == 0 else 0.32, pan=0.25 * np.sin(s * 1.3))
        for beat in (0, 1.5, 2, 3) if bar >= 4 else (0, 2):
            BUS["bass"].add(bt(bar, beat), g(("pz", ch[0] - 12), lambda: pizz(ch[0] - 12)), 0.8)
    # drums from bar 4: soft kick, rim on 2 and 4, hats on eighths
    for bar in range(4, BARS):
        for beat in (0, 2) if bar < 8 else (0, 1, 2, 3):
            if (bar, beat) in ((8, 0),):
                continue
            BUS["kick"].add(bt(bar, beat), g("kick", lambda: kick(soft=True)), 0.8)
            KICKS.append((bt(bar, beat), 0.5))
            EVENTS.add("kick", bt(bar, beat))
        for beat in (1, 3):
            BUS["clap"].add(bt(bar, beat), g("rim", rim), 0.6)
        for s in range(0, 16, 2):
            BUS["hat"].add(bt(bar) + s * SONG.s16, g(("bt", s % 4), lambda: brush_tap(1.0, seed=s % 4)), 0.35)
    for b, beat in at("sheet"):
        BUS["fx"].add(bt(b, beat), g("slap", slap), 0.9)
        BUS["count"].add(bt(b, beat), g(("cel", 62), lambda: celesta(62, 2.5)), 0.5)
    for b, beat in at("cline"):
        BUS["fx"].add(bt(b, beat), g(("sc", 0), lambda: scratch(BEAT * 0.8, 0)), 0.8)
    for b, beat in at("header"):
        BUS["fx"].add(bt(b, beat), g(("sc", 1), lambda: scratch(BEAT * 0.9, 1)), 0.7)
    for b, beat in at("land"):
        BUS["fx"].add(bt(b, beat), g("land", lambda: whoosh(0.4, 0.8, 200, 2500, seed=2)), 0.5)
        BUS["kick"].add(bt(b, beat), g("kick", lambda: kick(soft=True)), 0.7)
    for k, (b, beat) in enumerate(at("draw")):
        BUS["fx"].add(bt(b, beat), g(("sc", 2 + k), lambda: scratch(BEAT * 0.85, 2 + k)), 0.8)
        BUS["count"].add(bt(b, beat), g(("hc", 74 + k), lambda: harpsichord([62, 65, 69, 74][k], 0.6, seed=k)), 0.7)
    for k, (b, beat) in enumerate(at("hole")):
        BUS["foot"].add(bt(b, beat), g(("pu", k % 3), lambda: punch(k % 3)), 0.7, pan=float(np.sin(k * 2.1) * 0.5))
        m = SCALE[k % len(SCALE)]
        BUS["count"].add(bt(b, beat), g(("cel", m), lambda: celesta(m, 1.0)), 0.5, pan=float(np.sin(k * 2.1) * 0.5))
    for k, (b, beat) in enumerate(at("count")):
        BUS["fx"].add(bt(b, beat), g("tk", lambda: tick(True)), 0.7)
        BUS["count"].add(bt(b, beat), g(("cel", 81 - k * 3), lambda: celesta(81 - k * 3, 1.2)), 0.6)
    for k, (b, beat) in enumerate(at("armor")):
        BUS["fx"].add(bt(b, beat), g(("sc", 6 + k), lambda: scratch(BEAT * 0.8, 6 + k)), 0.8)
        BUS["count"].add(bt(b, beat), g(("hca", k), lambda: harpsichord([50, 53, 57, 62][k], 0.6, seed=9)), 0.7)
    for k, (b, beat) in enumerate(at("cloud")):
        BUS["fx"].add(bt(b, beat), g(("sc", 10 + k), lambda: scratch(BEAT * 0.8, 10 + k)), 0.7)
        BUS["count"].add(bt(b, beat), g(("cel", 69 + 5 * k), lambda: celesta(69 + 5 * k, 2.0)), 0.6)
    for b, beat in at("name"):
        BUS["fx"].add(bt(b, beat), g(("sc", 12), lambda: scratch(BEAT * 0.9, 12)), 0.6)
    for b, beat in at("pen"):
        BUS["fx"].add(bt(b, beat), g("tk2", lambda: tick(False)), 0.8)
        BUS["count"].add(bt(b, beat), g(("cel", 76), lambda: celesta(76)), 0.6)
    for k, (b, beat) in enumerate(at("zero")):
        BUS["fx"].add(bt(b, beat), g("tk", lambda: tick(True)), 0.6)
        BUS["count"].add(bt(b, beat), g(("pzz", 38), lambda: pizz(38, 0.6)), 0.9)
    for k, (b, beat) in enumerate(at("ghost")):
        BUS["fx"].add(bt(b, beat), g(("gw", k), lambda: whoosh(0.9, 0.5, 120, 1500, seed=10 + k)), 0.5,
                      pan=[-0.5, 0.5, -0.4, 0.4][k])
        m = [57, 55, 53, 50][k]
        BUS["count"].add(bt(b, beat), g(("celg", m), lambda: celesta(m, 2.4)), 0.6, pan=[-0.5, 0.5, -0.4, 0.4][k])
    BUS["fx"].add(bt(7), g("riser", lambda: riser(BAR)), 0.5)
    for b, beat in at("title"):
        BUS["fx"].add(bt(b, beat), g("imp", impact), 0.9)
        BUS["kick"].add(bt(b, beat), g("kick", lambda: kick(soft=False)), 1.0)
        BUS["bass"].add(bt(b, beat), g("sub", lambda: sub_tone(26, BAR)), 0.8)
        BUS["fx"].add(bt(b, beat), g("crash", lambda: crash(2.0)), 0.4)
    for k, (b, beat) in enumerate(at("char")):
        BUS["count"].add(bt(b, beat), g(("hct", k), lambda: harpsichord([74, 77, 81, 86, 89][k], 0.8, seed=20 + k)),
                         0.7)
    for b, beat in at("stamp"):
        BUS["fx"].add(bt(b, beat), g("stamp", lambda: stamp_thud(0)), 1.0)
    for k, (b, beat) in enumerate(at("rearmor")):
        BUS["fx"].add(bt(b, beat), g(("sc", 20 + k), lambda: scratch(BEAT * 0.6, 20 + k)), 0.7)
        BUS["count"].add(bt(b, beat), g(("cel", 62 + 3 * k), lambda: celesta(62 + [0, 3, 7, 12][k], 1.6)), 0.6)
    for n, b, beat in HITS:
        EVENTS.add(n, bt(b, beat))


ENVS = [("drums", ("kick", "clap"), 0.0), ("kick", ("kick",), 0.88), ("count", ("count",), 0.85),
        ("pad", ("pad",), 0.0), ("hat", ("hat",), 0.8), ("foot", ("foot",), 0.8)]

if __name__ == "__main__":
    t_ = time.time()
    compose()
    levels = {"pad": 0.45, "pluck": 0.5, "foot": 0.8, "count": 0.7, "kick": 0.9, "clap": 0.5, "hat": 0.3,
              "bass": 0.6, "fx": 0.6}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"pad": 0.4, "pluck": 0.35, "bass": 0.3},
                         {"count": (BEAT * 0.75, 0.3)}, ir=reverb_ir(1.8), drive=1.15, fade_out=1.2, out_gain=0.88)
    mix = lowpass(mix, 15000, order=1)
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t_:.1f}s")
