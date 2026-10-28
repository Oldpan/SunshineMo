"""回来的飞机 soundtrack (blueprint): 100 BPM, 62 bars, D minor.

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
from cues import BPM, BARS, SECTIONS, HITS, SCENE_CUTS  # noqa: E402

SONG = Song(bpm=BPM, bars=BARS, fps=60, sections=SECTIONS)
bt, BAR, BEAT = SONG.bt, SONG.bar, SONG.beat

Dm, Bb, F, Gm, A7, C = [50, 53, 57], [46, 50, 53], [41, 45, 48], [43, 46, 50], [45, 49, 52], [48, 52, 55]
CHORDS = ([Dm, Dm, Bb, F, Dm, Bb, Gm, A7] + [Dm, Bb] + [Dm, C, Bb, A7] * 2 + [Dm] + [Gm, A7]
          + [Dm, Bb, F, C] + [F, C, Dm, Bb, F, C] + [Dm, Bb, F, C, Gm, Dm, A7, Bb, A7]
          + [Bb, F, Gm, Dm, Bb, F, Gm, A7] + [Dm, Bb, Gm, A7, Dm] + [Bb, F, Gm, A7] + [Dm, Bb, F, A7, Dm])
assert len(CHORDS) == BARS, len(CHORDS)
SCALE = [62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81]          # D natural minor, for the holes
DRUMS = set(range(4, 8)) | set(range(10, 19)) | set(range(21, 25)) | set(range(26, 31)) | set(range(32, 40)) \
    | set(range(49, 53))
THIN = set(range(40, 48)) | set(range(53, 62)) | {19, 20}          # eighths only: the quiet acts, never silent

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


def tone(bar, k, octave=24):
    ch = CHORDS[bar]
    return ch[k % 3] + octave + (12 if (k // 3) % 2 else 0)


# hit name -> how it sounds (pen and paper foley plus a pitched voice on the chord)
DRAWN = {"cline", "header", "draw", "armor", "srg", "cloud", "name", "memo", "memo2", "diag", "fig", "book", "venn",
         "unrec", "chk", "contact", "rearmor", "ref", "sign", "empty", "ok", "find", "load", "friend", "pick", "say"}
POPS = {"hole", "exp", "star", "msg", "post", "opt", "user", "pbook", "rehole", "clap", "tick"}
TICKS = {"count", "pen", "zero", "miss", "lab", "cross", "status", "q", "tq", "en", "esub", "eq", "sub"}
AIRY = {"ghost", "leave", "land", "flow", "ppost", "deaf", "seen", "learn", "glow"}


def compose():
    for bar in range(BARS):
        notes = CHORDS[bar]
        BUS["pad"].add(bt(bar), g(("pad", tuple(notes)), lambda: string_pad(notes, BAR + 0.4, 0.5, 0.35,
                                                                            seed=notes[0])), 0.55)
    # the gear: harpsichord ostinato on sixteenths, eighths in the quiet acts; never stops
    for bar in range(BARS):
        ch = CHORDS[bar]
        pat = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]
        for s in range(16):
            if (bar in THIN or bar == 0) and s % 2:
                continue
            m = pat[s % 4] + (12 if s in (6, 14) else 0)
            gain = (0.5 if s % 4 == 0 else 0.32) * (0.7 if bar in THIN else 1.0)
            BUS["pluck"].add(bt(bar) + s * SONG.s16, g(("hc", m), lambda: harpsichord(m, 0.32, seed=m)), gain,
                             pan=0.25 * np.sin(s * 1.3))
        for beat in (0, 1.5, 2, 3) if bar in DRUMS else (0, 2):
            BUS["bass"].add(bt(bar, beat), g(("pz", ch[0] - 12), lambda: pizz(ch[0] - 12)), 0.8)
    for bar in range(BARS):
        if bar in DRUMS:
            for beat in (0, 2):
                BUS["kick"].add(bt(bar, beat), g("kick", lambda: kick(soft=True)), 0.8)
                KICKS.append((bt(bar, beat), 0.5))
                EVENTS.add("kick", bt(bar, beat))
            for beat in (1, 3):
                BUS["clap"].add(bt(bar, beat), g("rim", rim), 0.6)
        if bar >= 1:
            for s in range(0, 16, 2):
                BUS["hat"].add(bt(bar) + s * SONG.s16, g(("bt", s % 4), lambda: brush_tap(1.0, seed=s % 4)),
                               0.35 if bar in DRUMS else 0.22)
    # risers into the section cuts
    for b in SCENE_CUTS:
        BUS["fx"].add(bt(b - 1), g("riser", lambda: riser(BAR)), 0.35)
    counter = {}
    for n, b, beat in HITS:
        k = counter.get(n, 0)
        counter[n] = k + 1
        at_ = bt(b, beat)
        pan = float(np.sin(k * 2.1) * 0.4)
        if n == "sheet":
            BUS["fx"].add(at_, g("slap", slap), 0.9)
            BUS["count"].add(at_, g(("cel", 62), lambda: celesta(62, 2.5)), 0.5)
        elif n in ("title", "end"):
            BUS["fx"].add(at_, g("imp", impact), 0.9)
            BUS["kick"].add(at_, g("kick", lambda: kick(soft=False)), 1.0)
            BUS["bass"].add(at_, g("sub", lambda: sub_tone(26, BAR)), 0.8)
            BUS["fx"].add(at_, g("crash", lambda: crash(2.0)), 0.4)
        elif n in ("char", "echar", "concept"):
            m = [74, 77, 81, 86, 89][k % 5]
            BUS["count"].add(at_, g(("hct", m), lambda: harpsichord(m, 0.8, seed=20 + m)), 0.7)
        elif n == "stamp":
            BUS["fx"].add(at_, g("stamp", lambda: stamp_thud(0)), 1.0)
            BUS["bass"].add(at_, g("sub2", lambda: sub_tone(26, BEAT * 2)), 0.6)
        elif n == "settle":
            BUS["fx"].add(at_, g("tk", lambda: tick(True)), 0.5)
        elif n == "lights":
            BUS["fx"].add(at_, g("off", lambda: whoosh(1.2, 0.6, 80, 900, seed=40)), 0.6)
            BUS["count"].add(at_, g(("celL", 50), lambda: celesta(50, 3.0)), 0.6)
        elif n == "gold":
            m = tone(b, k, 24)
            BUS["count"].add(at_, g(("celG", m), lambda: celesta(m, 2.4)), 0.65)
            BUS["fx"].add(at_, g(("sc", 30 + k % 4), lambda: scratch(BEAT * 1.4, 30 + k % 4)), 0.5)
        elif n in DRAWN:
            BUS["fx"].add(at_, g(("sc", k % 12), lambda: scratch(BEAT * 0.8, k % 12)), 0.7, pan=pan)
            m = tone(b, k, 12)
            BUS["count"].add(at_, g(("hcd", m), lambda: harpsichord(m, 0.6, seed=m)), 0.6, pan=pan)
        elif n in POPS:
            if n in ("hole", "rehole"):
                BUS["foot"].add(at_, g(("pu", k % 3), lambda: punch(k % 3)), 0.7, pan=pan)
                m = SCALE[k % len(SCALE)]
            else:
                m = tone(b, k, 24)
            BUS["count"].add(at_, g(("cel", m, 1.0), lambda: celesta(m, 1.0)), 0.5, pan=pan)
        elif n in TICKS:
            BUS["fx"].add(at_, g("tk", lambda: tick(True)), 0.6)
            m = tone(b, k, 24)
            BUS["count"].add(at_, g(("cel", m, 1.2), lambda: celesta(m, 1.2)), 0.45)
        elif n in AIRY:
            BUS["fx"].add(at_, g(("gw", k % 6), lambda: whoosh(0.9, 0.5, 120, 1500, seed=10 + k % 6)), 0.45, pan=pan)
            m = tone(b, k, 12)
            BUS["count"].add(at_, g(("celg", m), lambda: celesta(m, 2.4)), 0.5, pan=pan)
        else:
            raise SystemExit(f"no sound for hit {n}")
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
