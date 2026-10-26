"""第一座山 soundtrack, ink-wash version: 100 BPM, 64 bars, A minor pentatonic (羽调).

Guqin-led, no piano or synth plucks: footsteps are frame drum taps and guqin notes one step higher (lower on the
way down); the groove is a big drum, a frame drum on 2 and 4 and brushes; flags and seals get a small gong;
lantern pings and contour rings are guqin harmonics (泛音); the forge in the annealing section is an anvil.

Every sound that matters sits on a cues.HITS entry; GROOVE sets how much drum each bar carries, so the dense
sections (the six climbers, the annealing jumps, the climb at dawn) drive and the personal section breathes.
"""
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.synth import *  # noqa: E402,F401,F403
from cues import BPM, BARS, SECTIONS, HITS, SILENCES  # noqa: E402

SONG = Song(bpm=BPM, bars=BARS, fps=60, sections=SECTIONS)
bt, BAR, BEAT = SONG.bt, SONG.bar, SONG.beat

AM9 = [45, 52, 55, 60, 59]
FM7 = [41, 48, 52, 57, 60]
CM = [48, 52, 55, 59, 62]
CLIMB = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84]     # A minor pentatonic, one note per step
TOP = 86

BUS = make_buses(SONG, {"pad": 0.4, "pluck": 0.25, "foot": 0.1, "count": 0.35, "kick": 0.0, "clap": 0.15,
                        "hat": 0.05, "bass": 0.0, "fx": 0.3})
EVENTS = Events()
KICKS = []


def gravel(seed=0):
    """A boot on loose stones: a soft thud and a short crunch."""
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(90 + 60 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.05)
    crunch = bandnoise(n, 1200, 7000, seed=seed + 11) * np.exp(-t / 0.03)
    crunch *= 0.6 + 0.4 * (np.random.default_rng(seed).random(n) > 0.6)
    return (np.tanh(1.4 * (0.8 * body + 0.5 * crunch)) * 0.5).astype(np.float32)


def guqin(m, dur=2.0, bright=0.7, slide=0.35, seed=0):
    """A plucked silk string: partials with fast-decaying highs, a little slide into pitch, a wooden knock."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0 = mtof(m) * 2 ** (-slide / 12 * np.exp(-t / 0.05))
    ph = 2 * np.pi * np.cumsum(f0) / SR
    s = np.zeros(n)
    for k in range(1, 9):
        s += np.sin(ph * k * (1 + 0.0007 * k * k)) / k ** 1.2 * np.exp(-t * (0.9 + (1.6 - bright) * 1.4 * k))
    knock = bandnoise(n, 300, 2500, seed=seed + 31) * np.exp(-t / 0.012) * 0.25
    vib = 1 + 0.03 * np.sin(2 * np.pi * 5 * t) * np.clip((t - 0.3) / 0.4, 0, 1)
    return ((s * vib * 0.35 + knock) * np.minimum(t / 0.002, 1) * np.clip((dur - t) / 0.3, 0, 1)).astype(np.float32)


def harmonic(m, dur=2.5):
    """泛音: a glassy pure tone an octave up, long and soft."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m + 12)
    s = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.3)
    return (s * np.minimum(t / 0.004, 1) * np.exp(-t / 0.9) * 0.3).astype(np.float32)


def taiko():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = 52 + 70 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
    skin = bandnoise(n, 150, 900, seed=41) * np.exp(-t / 0.03) * 0.4
    return (np.tanh(1.4 * (body + skin)) * 0.9).astype(np.float32)


def frame_drum(seed=0):
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(140 + 50 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.09)
    slap = bandnoise(n, 600, 3500, seed=seed + 51) * np.exp(-t / 0.02) * 0.5
    return ((body * 0.7 + slap) * 0.6).astype(np.float32)


def gong(m=57, dur=3.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    s = sum(np.sin(2 * np.pi * f * r * t * (1 + 0.004 * np.exp(-t / 0.4))) * a * np.exp(-t / d)
            for r, a, d in ((1, 1, 1.4), (1.52, 0.5, 0.9), (2.31, 0.35, 0.6), (3.1, 0.2, 0.4)))
    hit = bandnoise(n, 800, 5000, seed=61) * np.exp(-t / 0.02) * 0.3
    return ((s * 0.25 + hit) * np.minimum(t / 0.002, 1)).astype(np.float32)


def swell(m, dur):
    s = pad_chord([m, m + 7, m + 12], dur, 0.6, seed=m)
    e = (np.arange(s.shape[-1]) / s.shape[-1]) ** 2.5
    return (s * e).astype(np.float32)


def anvil(seed=0):
    """A hammer on hot iron: a bright inharmonic ring, a hard click, short."""
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) * a * np.exp(-t / d)
            for f, a, d in ((1180, 1, 0.5), (2730, 0.6, 0.3), (4110, 0.4, 0.18), (5870, 0.25, 0.1)))
    click = bandnoise(n, 2000, 9000, seed=seed + 71) * np.exp(-t / 0.006)
    return ((s * 0.22 + click * 0.5) * np.minimum(t / 0.001, 1)).astype(np.float32)


G7 = [43, 50, 55, 59, 62]
CHORDS = [AM9, AM9, FM7, CM, AM9, FM7, AM9, FM7, AM9, FM7]
CYCLE = [AM9, FM7, CM, G7]
CHORDS += [CYCLE[b % 4] for b in range(10, BARS)]
for b in range(54, 58):
    CHORDS[b] = [AM9, FM7][b % 2]
CHORDS[59], CHORDS[60], CHORDS[61], CHORDS[62], CHORDS[63] = CM, FM7, CM, AM9, AM9
PENTA = [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86]

# drum level per bar: 0 none, 1 sparse, 2 groove, 3 full with guqin arp; "roll" fills into a big hit
GROOVE = {b: 0 for b in range(BARS)}
GROOVE.update({4: 1, 5: 1, 6: 1, 7: "roll", 8: 3, 9: 3})
GROOVE.update({b: 2 for b in range(10, 16)}); GROOVE[13] = 1
GROOVE.update({b: 3 for b in range(16, 21)}); GROOVE[21] = 2
GROOVE.update({22: 1, 23: 1, 24: 2, 25: 1, 26: 3, 27: 3, 28: 2, 29: 3, 30: 3, 31: 3})
GROOVE.update({b: 1 for b in range(32, 37)}); GROOVE[37] = 2
GROOVE.update({44: 2, 45: 2, 46: 3, 47: 3, 48: 1, 49: 1, 50: 1, 51: "roll", 52: 3, 53: 3})
GROOVE.update({54: 1, 55: 1, 56: 1, 57: 1, 58: 3, 59: 3})
OWNS_DOWNBEAT = {"title", "flag", "slam", "dawn", "final", "endcard", "year", "heat", "stop", "unroll", "crown",
                 "reveal", "bottom", "draw", "valley", "stuck", "label", "lamp"}


def at(name, lo=0, hi=BARS):
    return [(b, beat) for n, b, beat in HITS if n == name and lo <= b < hi]


def g(key, fn):
    return cached(key, fn)


def q(m, dur=1.6, bright=0.75, slide=0.35):
    return cached(("q", m, round(dur, 2), bright, slide), lambda: guqin(m, dur, bright, slide, seed=m))


def h(m, dur=2.0):
    return cached(("h", m, round(dur, 2)), lambda: harmonic(m, dur))


def compose():
    rng = np.random.default_rng(3)
    for bar in range(BARS):
        if bar >= 62:
            continue
        notes = [n - 12 for n in CHORDS[bar][1:4]]
        lvl = GROOVE[bar]
        gain = 0.9 if lvl in (0, 1) else 0.7
        BUS["pad"].add(bt(bar), g(("pad", tuple(notes)), lambda: pad_chord(notes, BAR + 0.5, 0.25,
                                                                          seed=notes[0])), gain)
    BUS["pad"].add(bt(62), g("endpad", lambda: pad_chord([45 - 12, 52 - 12, 57 - 12], 2 * BAR, 0.2, seed=9)), 0.9)
    # ---- cold open, as in the test
    for b, beat in at("lamp"):
        BUS["fx"].add(bt(b, beat), g("strike", lambda: stamp_thud(5)), 0.45)
        BUS["count"].add(bt(b, beat), q(45, 4.0, 0.5, 0.8), 0.8)
    for b, beat in at("tag"):
        BUS["count"].add(bt(b, beat), h(69, 1.5), 0.5)
    steps = at("step")
    for k, (b, beat) in enumerate(steps):
        BUS["foot"].add(bt(b, beat), g(("gr", k % 4), lambda: gravel(k % 4)), 0.6, pan=(-0.15 if k % 2 else 0.15))
        BUS["clap"].add(bt(b, beat), g(("fd", k % 2), lambda: frame_drum(k % 2)), 0.5)
        m = CLIMB[k % 12]
        BUS["count"].add(bt(b, beat), q(m), 0.85)
    BUS["fx"].add(bt(2), g("rise2", lambda: riser(BAR)), 0.5)
    BUS["fx"].add(bt(58), g("rise58", lambda: riser(BAR)), 0.6)
    for b, beat in at("top"):
        BUS["foot"].add(bt(b, beat), g(("gr", 0), lambda: gravel(0)), 1.0)
        BUS["count"].add(bt(b, beat), q(TOP - 12, 3.0, 0.9, 0.6), 0.9)
        BUS["count"].add(bt(b, beat), h(TOP - 12, 2.5), 0.6)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.8)
    for k, (b, beat) in enumerate(at("probe")):
        m = [79, 76, 81, 79, 81, 79][k % 6]
        p = -0.5 if k % 2 == 0 else 0.5
        BUS["foot"].add(bt(b, beat), g(("gr", 1 + k % 3), lambda: gravel(1 + k % 3)), 0.6, pan=p)
        BUS["count"].add(bt(b, beat), q(m, 1.0, 0.5, -0.6), 0.6, pan=p)
    for k, (b, beat) in enumerate(at("flag")):
        if b == 19:                                      # six small flags: a rising guqin line, a wood tap each
            BUS["count"].add(bt(b, beat), q([64, 67, 69, 72, 74, 76][k % 6], 1.4), 0.8)
            BUS["fx"].add(bt(b, beat), g(("st", 1), lambda: stamp_thud(1)), 0.45)
            continue
        BUS["fx"].add(bt(b, beat), g("stamp", lambda: stamp_thud(0)), 0.9)
        BUS["fx"].add(bt(b, beat), g("gong", lambda: gong(57, 3.0)), 0.7)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.9)
    for b, beat in at("alt"):
        BUS["count"].add(bt(b, beat), h(81), 0.7)
    for b, beat in at("ping"):
        BUS["count"].add(bt(b, beat), h([76, 81, 79, 84][int(beat)]), 0.9)
    for b, beat in at("bolt"):
        BUS["fx"].add(bt(b, beat), g("thunder", lambda: thunder(1.1, 3)), 1.4 if b == 7 else 1.0)
        BUS["fx"].add(bt(b, beat), g("imp", impact), 0.6)
    for b, beat in at("title"):
        BUS["fx"].add(bt(b, beat), g("imp", impact), 0.9)
        BUS["fx"].add(bt(b, beat), g("gong", lambda: gong(57, 3.0)), 0.9)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 1.0)
        BUS["bass"].add(bt(b, beat), g("sub", lambda: sub_tone(21, BAR)), 1.0)
    for k, (b, beat) in enumerate(at("char")):
        BUS["count"].add(bt(b, beat), q([76, 79, 81, 84][k], 1.2, 0.8, 0.3), 0.6)
    for b, beat in at("concept"):
        BUS["fx"].add(bt(b, beat), g("seal", lambda: stamp_thud(2)), 0.8)
    # ---- the rule
    for b, beat in at("draw"):
        BUS["fx"].add(bt(b, beat), g("sweep", lambda: brush_sweep(BEAT * 1.5, seed=3)), 0.9)
        BUS["count"].add(bt(b, beat), q(45, 3.0, 0.5, 0.8), 0.8)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.8)
    for k, (b, beat) in enumerate(at("kchar")):
        BUS["count"].add(bt(b, beat), q([76, 79, 81, 84, 81, 79, 76][k % 7], 1.0, 0.8, 0.2), 0.6)
        BUS["fx"].add(bt(b, beat), g(("st", 3), lambda: stamp_thud(3)), 0.35)
    for k, (b, beat) in enumerate(at("look")):
        BUS["count"].add(bt(b, beat), h(76 if k % 2 == 0 else 79, 1.2), 0.5, pan=(-0.6 if k % 2 == 0 else 0.6))
    for k, (b, beat) in enumerate(at("hop")):
        BUS["count"].add(bt(b, beat), q(CLIMB[min(k, 11)], 1.2), 0.75)
        BUS["clap"].add(bt(b, beat), g(("fd", 0), lambda: frame_drum(0)), 0.4)
    for b, beat in at("stop"):
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.9)
        BUS["count"].add(bt(b, beat), q(TOP - 12, 0.7, 0.9, 0.0), 0.8)
    for b, beat in at("x"):
        BUS["fx"].add(bt(b, beat), g("stamp", lambda: stamp_thud(0)), 0.7)
    for b, beat in at("reveal"):
        BUS["fx"].add(bt(b, beat), g("gonglo", lambda: gong(45, 4.0)), 0.8)
        BUS["count"].add(bt(b, beat), h(81, 3.0), 0.6)
    # ---- six climbers
    for b, beat in at("unroll"):
        BUS["fx"].add(bt(b, beat), g("sweep2", lambda: brush_sweep(BEAT * 2, seed=5)), 0.9)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 1.0)
    for k, (b, beat) in enumerate(at("peak")):
        BUS["count"].add(bt(b, beat), h([72, 76, 79, 81, 84, 79][k], 1.0), 0.6, pan=-0.7 + 0.28 * k)
    for k, (b, beat) in enumerate(at("drop")):
        BUS["clap"].add(bt(b, beat), g(("fd", k % 2), lambda: frame_drum(k % 2)), 0.6, pan=-0.6 + 0.24 * k)
        BUS["count"].add(bt(b, beat), q([57, 60, 62, 64, 67, 69][k], 1.0), 0.6, pan=-0.6 + 0.24 * k)
    for k, (b, beat) in enumerate(at("climb")):
        BUS["foot"].add(bt(b, beat), g(("gr", k % 4), lambda: gravel(k % 4)), 0.7)
        BUS["count"].add(bt(b, beat), q(CLIMB[2 + k], 1.0), 0.7)
    for b, beat in at("crown"):
        BUS["fx"].add(bt(b, beat), g("gong", lambda: gong(57, 3.0)), 0.9)
        BUS["count"].add(bt(b, beat), h(84, 3.0), 0.8)
    for k, (b, beat) in enumerate(at("fogup")):
        BUS["fx"].add(bt(b, beat), g(("wh", k), lambda: whoosh(0.35, 0.6, 300, 2500, seed=k)), 0.35,
                      pan=-0.6 + 0.3 * k)
        BUS["count"].add(bt(b, beat), q([67, 64, 62, 60, 57][k], 0.8, 0.5, -0.4), 0.45)
    # ---- naming
    for b, beat in at("slam"):
        BUS["fx"].add(bt(b, beat), g("imp", impact), 0.8)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 1.0)
        BUS["bass"].add(bt(b, beat), g("sub", lambda: sub_tone(21, BAR)), 0.8)
    for b, beat in at("mark"):
        BUS["fx"].add(bt(b, beat), g("seal", lambda: stamp_thud(2)), 0.7)
    # ---- annealing
    for b, beat in at("year"):
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.9)
        BUS["fx"].add(bt(b, beat), g("imp", impact), 0.5)
    for k, (b, beat) in enumerate(at("name")):
        BUS["count"].add(bt(b, beat), q([69, 72, 76, 81][k % 4], 1.2), 0.6)
    for k, (b, beat) in enumerate(at("anvil")):
        BUS["fx"].add(bt(b, beat), g(("anv", k % 2), lambda: anvil(k % 2)), 0.7)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.6)
    for b, beat in at("heat"):
        BUS["fx"].add(bt(b, beat), g("gong", lambda: gong(57, 3.0)), 0.7)
        BUS["fx"].add(bt(b, beat), g("riseh", lambda: riser(BEAT * 2)), 0.4)
    for k, (b, beat) in enumerate(at("jump")):
        m = int(rng.choice(PENTA[6:16]))
        p = float(rng.uniform(-0.6, 0.6))
        BUS["count"].add(bt(b, beat), q(m, 0.9, 0.8, float(rng.uniform(-0.5, 0.5))), 0.65, pan=p)
        BUS["clap"].add(bt(b, beat), g(("fd", k % 2), lambda: frame_drum(k % 2)), 0.35)
    for k, (b, beat) in enumerate(at("cool")):
        BUS["count"].add(bt(b, beat), h([84, 81, 79, 76][k % 4], 1.6), 0.7)
        BUS["foot"].add(bt(b, beat), g(("gr", k % 4), lambda: gravel(k % 4)), 0.5)
    for k, (b, beat) in enumerate(at("chip")):
        BUS["hat"].add(bt(b, beat), g(("tk", k % 2), lambda: tick(k % 2 == 0)), 0.8)
        BUS["count"].add(bt(b, beat), q(PENTA[8 + k % 8], 0.6, 0.9, 0.0), 0.4)
    for k, (b, beat) in enumerate(at("route")):
        BUS["count"].add(bt(b, beat), h(PENTA[6 + k % 12], 0.8), 0.45, pan=-0.5 + k / 11)
    # ---- Wright
    for k, (b, beat) in enumerate(at("ring")):
        BUS["count"].add(bt(b, beat), h(PENTA[5 + k], 1.6), 0.6)
    for k, (b, beat) in enumerate(at("dot")):
        BUS["hat"].add(bt(b, beat), g(("rim", k % 2), lambda: rim(14 + k % 2)), 0.5, pan=-0.4 + 0.07 * k)
    for b, beat in at("valley"):
        BUS["count"].add(bt(b, beat), q(40, 3.0, 0.4, -1.0), 0.8)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.7)
    for b, beat in at("arrow"):
        BUS["fx"].add(bt(b, beat), g("wharr", lambda: whoosh(0.5, 0.7, 300, 4000, seed=9)), 0.6)
    for k, (b, beat) in enumerate(at("pull")):
        BUS["fx"].add(bt(b, beat), g("rev", lambda: reverse_swell(0.35)), 0.35)
        BUS["clap"].add(bt(b, beat), g(("fd", 1), lambda: frame_drum(1)), 0.7)
    for k, (b, beat) in enumerate(at("drift")):
        BUS["count"].add(bt(b, beat), q(int(rng.choice(PENTA[10:])), 0.7, 0.9, 0.4), 0.45,
                         pan=float(rng.uniform(-0.7, 0.7)))
    for b, beat in at("cross"):
        BUS["fx"].add(bt(b, beat), g("gong", lambda: gong(57, 3.0)), 0.7)
        BUS["count"].add(bt(b, beat), h(81, 2.5), 0.6)
    # ---- you
    for k, (b, beat) in enumerate(at("label")):
        BUS["fx"].add(bt(b, beat), g(("st", 4), lambda: stamp_thud(4)), 0.5)
        BUS["count"].add(bt(b, beat), q([64, 67, 69][k % 3], 1.8, 0.6), 0.7)
    for b, beat in at("stuck"):
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.7)
        BUS["count"].add(bt(b, beat), q(52, 1.4, 0.4, -0.3), 0.6)
    for k, (b, beat) in enumerate(at("score")):
        BUS["count"].add(bt(b, beat), q([76, 72, 69, 64][k], 1.2, 0.6, -0.5), 0.7)
    # ---- back to the night
    for k, (b, beat) in enumerate(at("down")):
        BUS["foot"].add(bt(b, beat), g(("gr", k % 4), lambda: gravel(k % 4)), 0.7, pan=0.15)
        BUS["clap"].add(bt(b, beat), g(("fd", k % 2), lambda: frame_drum(k % 2)), 0.45)
        BUS["count"].add(bt(b, beat), q([81, 79, 76, 74, 72, 69, 67, 64, 62, 60][k % 10], 1.4), 0.75)
    for b, beat in at("unflag"):
        BUS["fx"].add(bt(b, beat), g("whu", lambda: whoosh(0.4, 0.5, 400, 5000, seed=4)), 0.6)
        BUS["fx"].add(bt(b, beat), g(("st", 1), lambda: stamp_thud(1)), 0.5)
    for b, beat in at("bottom"):
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 0.8)
        BUS["count"].add(bt(b, beat), q(45, 2.0, 0.4, -0.5), 0.8)
    for b, beat in at("dawn"):
        BUS["fx"].add(bt(b, beat), g("imp", impact), 0.9)
        BUS["fx"].add(bt(b, beat), g("gong", lambda: gong(57, 3.0)), 1.0)
        BUS["kick"].add(bt(b, beat), g("taiko", taiko), 1.0)
        BUS["count"].add(bt(b, beat), q(TOP, 3.0, 0.9, 0.6), 0.9)
        BUS["count"].add(bt(b, beat), h(TOP, 3.0), 0.7)
        BUS["bass"].add(bt(b, beat), g("sub", lambda: sub_tone(21, BAR)), 0.9)
    for b, beat in at("final"):
        BUS["fx"].add(bt(b, beat), g("gong", lambda: gong(57, 3.0)), 0.8)
        BUS["count"].add(bt(b, beat), h(81, 4.0), 0.7)
        BUS["count"].add(bt(b, beat), q(45, 4.0, 0.5, 0.8), 0.7)
    for b, beat in at("endcard"):
        BUS["count"].add(bt(b, beat), q(57, 4.0, 0.5, 0.5), 0.7)
        BUS["count"].add(bt(b, beat), h(69, 4.0), 0.6)
    # ---- the groove
    owned = {(b, beat) for n, b, beat in HITS if n in OWNS_DOWNBEAT and beat == 0}
    for bar in range(4, BARS):
        lvl = GROOVE[bar]
        if lvl == "roll":
            for i, beat in enumerate([0, 0.5, 1, 1.5, 1.75]):
                BUS["kick"].add(bt(bar, beat), g("taiko", taiko), 0.45 + 0.12 * i)
            BUS["fx"].add(bt(bar), g("riser7", lambda: riser(2 * BEAT)), 1.0)
            continue
        if not lvl:
            continue
        full = lvl == 3
        kicks = (0, 1, 2, 3) if full else (0, 2, 2.75) if lvl == 2 else (0, 2)
        for beat in kicks:
            if beat == 0 and (bar, 0) in owned:
                continue
            BUS["kick"].add(bt(bar, beat), g("taiko", taiko), 1.0 if beat == 0 else 0.7)
            KICKS.append((bt(bar, beat), 0.55))
            EVENTS.add("kick", bt(bar, beat))
        if lvl >= 2:
            for beat in (1, 3):
                BUS["clap"].add(bt(bar, beat), g(("fd", 1), lambda: frame_drum(1)), 0.8)
        for s in range(16 if full else 8 if lvl == 2 else 4):
            st = s * (1 if full else 2 if lvl == 2 else 4)
            BUS["hat"].add(bt(bar) + st * SONG.s16, g(("br", s % 2), lambda: brush_tap(1.0, seed=4 + s % 2)),
                           0.6 if st % 4 == 0 else 0.35, pan=0.25)
        root = CHORDS[bar][0] - 12 if CHORDS[bar][0] >= 45 else CHORDS[bar][0]
        for beat in (0, 1.5, 2.5) if not full else (0, 0.75, 1.5, 2, 2.75, 3.5):
            BUS["bass"].add(bt(bar, beat), g(("bass", root), lambda: bass_note(root, BEAT * 0.6)), 0.8)
        if full:
            for s in range(0, 16, 2):                          # guqin arp on eighths
                m = [57, 60, 64, 67, 69, 67, 64, 60][(s // 2) % 8] + (0 if bar % 2 == 0 else -4 if s // 2 in (0, 4)
                                                                     else 0)
                BUS["pluck"].add(bt(bar) + s * SONG.s16, q(m, 0.9, 0.6, 0.2), 0.55, pan=0.3 * np.sin(s))
    for n, b, beat in HITS:
        EVENTS.add(n, bt(b, beat))


ENVS = [("drums", ("kick", "clap"), 0.0), ("kick", ("kick",), 0.88), ("count", ("count",), 0.85),
        ("pad", ("pad",), 0.0), ("hat", ("hat",), 0.8), ("foot", ("foot",), 0.8)]

if __name__ == "__main__":
    t_ = time.time()
    compose()
    levels = {"pad": 0.6, "pluck": 0.55, "foot": 0.9, "count": 0.75, "kick": 0.95, "clap": 0.6, "hat": 0.3,
              "bass": 0.6, "fx": 0.6}
    silence = [(bt(b, b0), bt(b, b1)) for b, b0, b1 in SILENCES]
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"pad": 0.45, "pluck": 0.5, "bass": 0.35},
                         {"count": (BEAT * 0.75, 0.3)}, ir=reverb_ir(2.4), silence=silence, drive=1.15,
                         fade_out=1.5, out_gain=0.88)
    mix = lowpass(mix, 15000, order=1)
    mix = mix * gate_silence(mix.shape[1], silence)    # the reverb tail too: a true silence is silent
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t_:.1f}s")
