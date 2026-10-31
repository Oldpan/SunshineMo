"""787 人猜牛 soundtrack (mid-century toon): 100 BPM, F major, a West-Coast cool-jazz combo.

Vibraphone (FM bell with tremolo) for chords and the melody on the hits, a pizzicato walking bass on every beat,
brushes stirring under swung ride taps, finger snaps on 2 and 4, a celesta for the counting.  Foley by material:
paper pops and swishes for slips, a wood block for hooves, bongos for people popping in, a slide whistle for the
misses, a damped rubber stamp for medallions, a metal clank for the scale.  Every sound that matters sits on a
cues.HITS entry; no true silence anywhere (series rule), the quiet bars are a thinner texture.
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

# chords as (root, 7th-chord tones); voiced for the vibes around middle C
F7M, Dm7, Gm7, C7, Bb7M, D7, Am7 = ([41, 57, 60, 64, 69], [38, 57, 60, 62, 65], [43, 58, 62, 65, 67],
                                    [36, 58, 60, 64, 67], [46, 57, 58, 62, 65], [38, 57, 60, 62, 66],
                                    [45, 55, 57, 60, 64])
CHORDS = ([F7M, Dm7, Gm7, C7, F7M, Bb7M, Gm7, C7, F7M, Bb7M] +          # cold open, title
          [F7M, Dm7, Gm7, C7, Am7, D7, Gm7, C7] +                       # FIG. 1 why it works
          [Dm7, Gm7, Dm7, Am7, Bb7M, Bb7M, Gm7, C7] +                   # FIG. 2 when it breaks (darker)
          [F7M, D7, Gm7, C7, F7M, D7, Gm7, C7] +                        # FIG. 3 AI
          [Bb7M, Am7, Gm7, C7, F7M, Dm7, Gm7, C7] +                     # FIG. 4 you
          [F7M, Dm7, Gm7, C7] + [Bb7M, Am7, Gm7, C7] +                  # back to Plymouth, closing lines
          [F7M, Bb7M, F7M, Bb7M, F7M])                                  # end title, references
assert len(CHORDS) == BARS
THIN = {0, 4, 18, 34, 42, 46, 47, 52, 53, 54}    # openings, the closing lines, references: a thinner texture

BUS = make_buses(SONG, {"vib": 0.35, "mel": 0.3, "bass": 0.05, "kit": 0.1, "fol": 0.12, "fx": 0.2})
EVENTS = Events()
KICKS = []


def vibes(m, dur=1.6, vel=1.0, trem=5.5):
    s = fm_bell(m, dur, idx=0.9, ratio=4.0)
    t = np.arange(len(s)) / SR
    return (s * (1 - 0.35 * (0.5 + 0.5 * np.sin(2 * np.pi * trem * t))) * vel).astype(np.float32)


def pizz(m, dur=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.5 * np.exp(-t * (5 + 3 * k)) for k in range(1, 6))
    return (s * np.minimum(t / 0.003, 1) * 0.7).astype(np.float32)


def snap(seed=0):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    return (bandnoise(n, 1800, 7000, seed=seed + 40) * np.exp(-t / 0.012) * 0.7).astype(np.float32)


def woodblock(m=79, seed=0):
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.025) + 0.4 * np.sin(2 * np.pi * f * 2.7 * t) * np.exp(-t / 0.01)
    return (s * 0.6).astype(np.float32)


def bongo(m=64, seed=0):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    f = mtof(m) * (1 + 0.25 * np.exp(-t / 0.015))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.08)
    s += bandnoise(n, 1000, 4000, seed=seed + 61) * np.exp(-t / 0.004) * 0.3
    return (s * 0.6).astype(np.float32)


def paper_pop(seed=0):
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    s = bandnoise(n, 2000, 9000, seed=seed + 70) * np.exp(-t / 0.02)
    s += np.sin(2 * np.pi * (900 + 600 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.02) * 0.4
    return (s * 0.5).astype(np.float32)


def slide_whistle(f0, f1, dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.08 * bandnoise(n, 1500, 5000, seed=3)
    e = np.minimum(t / 0.03, 1) * np.clip((dur - t) / 0.08, 0, 1)
    return (s * e * 0.3).astype(np.float32)


def clank(seed=0):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in ((523, 0.4), (1187, 0.25), (1843, 0.15),
                                                                      (2711, 0.08)))
    s += bandnoise(n, 2000, 8000, seed=seed + 80) * np.exp(-t / 0.01) * 0.6
    return (s * 0.25).astype(np.float32)


def g(key, fn):
    return cached(key, fn)


def tone(bar, k, octave=12):
    ch = CHORDS[bar][1:]
    return ch[k % 4] + octave + (12 if (k // 4) % 2 else 0)


WALK = [0, 4, 7, 9]                                # root, third, fifth, sixth: a simple walking line


def compose():
    for bar in range(BARS):
        ch = CHORDS[bar]
        notes = ch[1:]
        # vibes comp: a chord on 1 and on the "and" of 2, tremolo
        for beat, vel in ((0, 0.55), (1.5, 0.35)):
            for m in notes:
                BUS["vib"].add(bt(bar, beat), g(("vc", m, vel), lambda: vibes(m, 1.4, vel)), 0.32)
        # walking pizzicato bass on every beat (two-feel in the thin bars)
        for beat in ((0, 2) if bar in THIN else Q):
            m = ch[0] + (WALK[int(beat)] if bar not in THIN else (0 if beat == 0 else 7))
            BUS["bass"].add(bt(bar, beat), g(("pz", m), lambda: pizz(m, BEAT * 0.95)), 0.9)
        # brushes stir all bar, swung ride taps, finger snaps on 2 and 4
        BUS["kit"].add(bt(bar), g(("sw", bar % 2), lambda: brush_sweep(BAR, seed=bar % 2)), 0.9)
        for s16 in range(0, 16, 2):
            if bar in THIN and s16 % 4:
                continue
            tt = swing_time(SONG, bar, s16 + (1 if s16 % 4 == 2 else 0), 0.62) if s16 % 4 == 2 else bt(bar) + \
                s16 * SONG.s16
            BUS["kit"].add(tt, g(("rd", s16 % 4), lambda: ride(0.5 if s16 % 4 else 0.7, seed=s16 % 4)), 0.35)
        for beat in (1, 3):
            BUS["kit"].add(bt(bar, beat), g(("sn", beat), lambda: snap(beat)), 0.55 if bar not in THIN else 0.35)
            if bar not in THIN:
                BUS["kit"].add(bt(bar, beat), g(("bt", beat), lambda: brush_tap(0.8, seed=beat)), 0.5)
        if bar not in THIN:
            KICKS.append((bt(bar), 0.3))
            EVENTS.add("kick", bt(bar))
            EVENTS.add("kick", bt(bar, 2))
    for b in SCENE_CUTS:
        if b not in (8, 50):
            BUS["fx"].add(bt(b - 1, 3.5), g("swish", lambda: whoosh(BEAT * 0.5, 0.5, 800, 6000, seed=4)), 0.3)
    for b in (7, 44, 49):
        BUS["fx"].add(bt(b), g("riser", lambda: riser(BAR)), 0.3)
    counter = {}
    for n, b, beat in HITS:
        k = counter.get(n, 0)
        counter[n] = k + 1
        at_ = bt(b, beat)
        pan = float(np.sin(k * 2.1) * 0.45)
        if n == "flag":
            m = tone(b, k, 12)
            BUS["mel"].add(at_, g(("vm", m), lambda: vibes(m, 1.0)), 0.6, pan=pan)
            BUS["fol"].add(at_, g(("pp", k % 4), lambda: paper_pop(k % 4)), 0.35, pan=pan)
        elif n == "hoof":
            BUS["fol"].add(at_, g(("wb", k % 2), lambda: woodblock(72 + 5 * (k % 2), k)), 0.7, pan=-0.3 + k * 0.12)
        elif n in ("ticket", "law"):
            BUS["fol"].add(at_, g(("st", n), lambda: stamp_thud(2)), 0.6)
            BUS["mel"].add(at_, g(("vm", 77), lambda: vibes(77, 1.6)), 0.6)
        elif n == "pop":
            m = [62, 65, 67, 69, 64, 67, 70, 72][k % 8]
            BUS["fol"].add(at_, g(("bg", m), lambda: bongo(m, k)), 0.6, pan=pan)
        elif n == "guess":
            m = [72, 74, 77, 79, 81, 84, 79, 76, 74, 72, 77, 81][k % 12]
            BUS["mel"].add(at_, g(("vg", m), lambda: vibes(m, 0.6)), 0.45, pan=pan)
            BUS["fol"].add(at_, g(("pp", k % 4), lambda: paper_pop(k % 4)), 0.3, pan=pan)
        elif n == "miss":
            k %= 2
            BUS["fx"].add(at_, g(("sl", k), lambda: slide_whistle(1400 - 300 * k, 500 - 100 * k, BEAT * 0.45)), 0.6)
        elif n in ("fig", "stamp"):
            BUS["fol"].add(at_, g(("st", n), lambda: stamp_thud(1 if n == "fig" else 2)), 0.7)
            m = 77 if n == "fig" else 72
            BUS["mel"].add(at_, g(("vm", m), lambda: vibes(m, 1.4)), 0.55)
        elif n in ("eq", "spread", "write", "page", "copy", "card"):
            BUS["fol"].add(at_, g(("pp", k % 4), lambda: paper_pop(k % 4)), 0.35 if n != "copy" else 0.25, pan=pan)
            m = tone(b, k, 12)
            BUS["mel"].add(at_, g(("vp", m), lambda: vibes(m, 0.7, 0.8)), 0.35 if n != "card" else 0.25, pan=pan)
        elif n in ("land", "nod", "booth", "xmark"):
            m = {"land": 72 + 7 * (k % 2), "nod": 76, "booth": 60, "xmark": 67}[n]
            BUS["fol"].add(at_, g(("wb", m), lambda: woodblock(m, k)), 0.6, pan=pan)
            if n == "land":
                mm = tone(b, k, 12)
                BUS["mel"].add(at_, g(("vg", mm), lambda: vibes(mm, 0.6)), 0.4, pan=pan)
        elif n in ("cancel", "merge", "twin", "aim", "arrowh"):
            m = tone(b, k, 12 if n != "aim" else 24 - 12 * ((k // 4) % 2 == 0))
            BUS["mel"].add(at_, g(("vm", m), lambda: vibes(m, 1.2)), 0.55, pan=pan)
            BUS["fol"].add(at_, g(("sn", k % 2), lambda: snap(k % 2)), 0.45)
        elif n in ("dot", "meter", "glow", "ref", "type", "chalk"):
            m = tone(b, k, 24) if n != "chalk" else tone(b, k, 12)
            vel = {"dot": 0.35, "meter": 0.45, "glow": 0.5, "ref": 0.3, "type": 0.3, "chalk": 0.25}[n]
            BUS["mel"].add(at_, g(("cel", m, 1.0), lambda: fm_bell(m, 1.0, idx=1.2, ratio=4.0)), vel, pan=pan)
            if n in ("type", "chalk"):
                BUS["fol"].add(at_, g("tk", lambda: tick(True)), 0.3, pan=pan)
        elif n in ("peek", "grow"):
            f0, f1 = (600, 1100) if n == "peek" else (400, 1400 + 300 * k)
            BUS["fx"].add(at_, g(("sl", n, k), lambda: slide_whistle(f0, f1, BEAT * 0.6)), 0.45)
        elif n == "snapx":
            BUS["fol"].add(at_, g(("sn", 3), lambda: snap(3)), 0.6)
        elif n in ("coin", "beep"):
            m = 96 if n == "coin" else 84 + 3 * (k % 3)
            BUS["mel"].add(at_, g(("cel", m, 0.6), lambda: fm_bell(m, 0.6, idx=0.6 if n == "beep" else 2.0,
                                                                  ratio=4.0 if n == "coin" else 1.0)), 0.4, pan=pan)
        elif n in ("split", "round", "talk"):
            m = {"split": 55, "round": [62, 65, 67, 69, 72][k % 5], "talk": 57}[n]
            BUS["fol"].add(at_, g(("bg", m), lambda: bongo(m, k)), 0.6, pan=pan)
            if n == "split":
                BUS["fx"].add(at_, g("swish", lambda: whoosh(BEAT * 0.5, 0.5, 800, 6000, seed=4)), 0.25)
        elif n == "tick":
            BUS["fol"].add(at_, g("tk", lambda: tick(True)), 0.45, pan=pan)
        elif n == "path":
            BUS["fol"].add(at_, g(("rs", k % 3), lambda: rustle(0.3, seed=k % 3)), 0.45, pan=pan)
            m = tone(b, k, 12)
            BUS["mel"].add(at_, g(("vm", m), lambda: vibes(m, 0.9)), 0.45, pan=pan)
        elif n == "gold":
            m = tone(b, k, 12)
            BUS["mel"].add(at_, g(("vgd", m), lambda: vibes(m, 1.6, 0.7, 4.0)), 0.4, pan=pan * 0.5)
        elif n == "pour":
            BUS["fol"].add(at_, g(("rs", k % 3), lambda: rustle(0.25, seed=k % 3)), 0.6, pan=pan)
            m = tone(b, k, 12)
            BUS["mel"].add(at_, g(("vp", m), lambda: vibes(m, 0.7, 0.8)), 0.35, pan=pan)
        elif n == "sort":
            m = [65, 67, 69, 70, 72, 74, 76, 77][k % 8] + 12
            BUS["mel"].add(at_, g(("cel", m), lambda: fm_bell(m, 1.0, idx=1.2, ratio=4.0)), 0.5, pan=-0.5 + k / 7)
        elif n == "mid":
            if k == 0:
                BUS["fx"].add(at_, g("slu", lambda: slide_whistle(500, 1300, BEAT * 0.6)), 0.5)
            elif k == 1:
                BUS["fol"].add(at_, g("scr", lambda: rustle(0.35, seed=8)), 0.6)
            elif k == 2:
                BUS["fol"].add(at_, g(("st", "m"), lambda: stamp_thud(1)), 0.7)
                BUS["mel"].add(at_, g(("vm", 81), lambda: vibes(81, 1.8)), 0.7)
            else:
                BUS["fol"].add(at_, g(("pp", 1), lambda: paper_pop(1)), 0.5)
                BUS["mel"].add(at_, g(("vm", 84), lambda: vibes(84, 1.2)), 0.5)
        elif n == "scale":
            k %= 3
            if k == 0:
                BUS["fol"].add(at_, g("clank", clank), 0.7)
            else:
                BUS["fol"].add(at_, g("tk", lambda: tick(True)), 0.5)
                BUS["mel"].add(at_, g(("vm", 72 + 5 * k), lambda: vibes(72 + 5 * k, 1.0)), 0.5)
        elif n == "burst":
            for j, m in enumerate((77, 81, 84, 89)):
                BUS["mel"].add(at_ + j * 0.04, g(("vm", m), lambda: vibes(m, 1.4)), 0.4)
            BUS["fx"].add(at_, g("crash", lambda: crash(1.4)), 0.25)
        elif n == "wipe":
            BUS["fx"].add(at_, g("wipe", lambda: whoosh(0.45, 0.4, 400, 7000, seed=6)), 0.6)
        elif n == "title":
            BUS["fol"].add(at_, g(("st", "t"), lambda: stamp_thud(0)), 0.8)
            BUS["bass"].add(at_, g("sub", lambda: sub_tone(29, BAR)), 0.5)
            BUS["fx"].add(at_, g("crashT", lambda: crash(2.2)), 0.35)
        elif n == "char":
            m = [77, 81, 84, 86, 89, 93][k % 6]
            BUS["mel"].add(at_, g(("vm", m), lambda: vibes(m, 0.9)), 0.5, pan=pan)
        elif n in ("sub", "tq"):
            BUS["fx"].add(at_, g("tk", lambda: tick(True)), 0.45)
            m = 84 if n == "sub" else 88
            BUS["mel"].add(at_, g(("vm", m), lambda: vibes(m, 1.2)), 0.5)
        elif n == "pulse":
            m = [77, 81, 84][k % 3]
            BUS["mel"].add(at_, g(("cel", m), lambda: fm_bell(m, 1.6, idx=1.0, ratio=4.0)), 0.5)
        else:
            raise SystemExit(f"no sound for hit {n}")
    for n, b, beat in HITS:
        EVENTS.add(n, bt(b, beat))


Q = (0, 1, 2, 3)
ENVS = [("drums", ("kit",), 0.0), ("kick", ("bass",), 0.85), ("mel", ("mel",), 0.85), ("pad", ("vib",), 0.0),
        ("fol", ("fol",), 0.8)]

if __name__ == "__main__":
    t_ = time.time()
    compose()
    levels = {"vib": 0.45, "mel": 0.75, "bass": 0.75, "kit": 0.5, "fol": 0.8, "fx": 0.6}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"vib": 0.25}, {"mel": (BEAT * 0.75, 0.22)}, ir=reverb_ir(1.6),
                         drive=1.1, fade_out=1.2, out_gain=0.9)
    mix = lowpass(mix, 14000, order=1)
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t_:.1f}s")
