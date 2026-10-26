"""会算数的马 soundtrack: 104 BPM, 68 bars (≈ 2:37).

Every sound that matters sits on a cues.HITS entry, and every HITS name has a sound here (check_hits.py proves
both land on the same frame).  The hoof taps are pitched and climb C D E F G, so the ear counts with the horse;
the last time we hear them (bar 58) they keep climbing past G because nobody gives the cue.
Groove map: cold open tight (4-6), snare roll and silence (7), title drop (8-9); half-time for Pfungst (10-15);
drums out for the reveal (16-20); full groove for overfitting and the 2019 classifier (22-35) with a silence
before the verdict; half-time again for "your own Hans" (40-47) building back to full (48-53); no drums on the
coda and the return to the stage (54-63); a soft groove under the end card.
Scene changes use in-key swells, not noise whooshes.  True silences gate the whole mix, reverb tail included.
"""
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.synth import *  # noqa: E402,F401,F403
from cues import BPM, BARS, SECTIONS, HITS, SILENCES, SCENE_CUTS  # noqa: E402

SONG = Song(bpm=BPM, bars=BARS, fps=60, sections=SECTIONS)
bt, BAR, BEAT = SONG.bt, SONG.bar, SONG.beat

DM9 = [50, 53, 57, 60, 64]
BB = [46, 50, 53, 57, 62]
GM = [55, 50, 58, 62, 65]
A7 = [45, 52, 55, 61, 64]
FM = [53, 48, 57, 60, 64]
CM = [48, 52, 55, 59, 62]
LOOP = [DM9, BB, GM, A7]
CHORDS = [DM9, DM9, BB, BB, DM9, BB, DM9, BB, DM9, BB]
CHORDS += [LOOP[i % 4] for i in range(30)]                    # 10-39
CHORDS += [[BB, FM, DM9, CM][i % 4] for i in range(14)]       # 40-53 your own Hans: brighter
CHORDS += [BB, A7, DM9, BB, DM9, BB, GM, A7, BB, A7, DM9, BB, DM9, DM9]   # 54-67
assert len(CHORDS) == BARS
COUNT = [60, 62, 64, 65, 67, 69, 71, 72]
PENT = [62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89, 91]

BUS = make_buses(SONG, {"pad": 0.4, "pluck": 0.25, "hoof": 0.12, "count": 0.35, "kick": 0.0, "clap": 0.15,
                        "hat": 0.05, "bass": 0.0, "fx": 0.3, "crowd": 0.4})
EVENTS = Events()
KICKS = []

# drum pattern per bar: tight, roll, full, half, none
DRUMS = {}
for b in range(BARS):
    DRUMS[b] = "none"
for b in (4, 5, 6):
    DRUMS[b] = "tight"
DRUMS[7] = "roll"
for r, kind in (((8, 10), "full"), ((10, 13), "half"), ((14, 16), "half"), ((21, 22), "half"),
                ((22, 29), "full"), ((29, 30), "roll"), ((30, 34), "full"), ((35, 36), "full"),
                ((36, 40), "half"), ((40, 48), "half"), ((48, 50), "tight"), ((50, 53), "full"),
                ((53, 54), "roll"), ((64, 67), "half")):
    for b in range(*r):
        DRUMS[b] = kind


def hoof(seed=0):
    """A hoof on a wooden stage: a short low knock and a dry click."""
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 120 + 90 * np.exp(-t / 0.015)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.06)
    click = bandnoise(n, 900, 4000, seed=seed + 3) * np.exp(-t / 0.008)
    return (np.tanh(1.6 * (body + 0.6 * click)) * 0.55).astype(np.float32)


def crowd(dur=2.2, seed=0):
    """A small room applauding: dense filtered noise bursts under a swell."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(seed)
    out = np.zeros(n, np.float32)
    for k in range(260):
        s = int(r.uniform(0, dur * 0.85) * SR)
        m = int(0.02 * SR)
        if s + m < n:
            out[s:s + m] += bandnoise(m, 900, 6000, seed=k) * np.exp(-np.arange(m) / SR / 0.004) * r.uniform(0.3, 1)
    env = np.minimum(t / 0.35, 1) * np.clip((dur - t) / 0.8, 0, 1)
    return (out * env * 0.5).astype(np.float32)


def swell(m, dur):
    """In-key swell into a new scene: a pad chord fading in fast (replaces the noise whoosh)."""
    s = pad_chord([m, m + 7, m + 12], dur, 0.6, seed=m)
    n = s.shape[-1]
    e = (np.arange(n) / n) ** 2.5
    return (s * e).astype(np.float32)


def glide(m0, m1, dur):
    """A sine that slides between two notes: the curve being drawn."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m0) * (mtof(m1) / mtof(m0)) ** (t / dur)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(t / 0.05, 1) * np.clip((dur - t) / 0.3, 0, 1)
    return (s * env * 0.3).astype(np.float32)


def in_silence(t):
    return any(bt(b, b0) - 0.02 <= t < bt(b, b1) for b, b0, b1 in SILENCES)


def at(name, lo=0, hi=BARS):
    return [(b, beat) for n, b, beat in HITS if n == name and lo <= b < hi]


def hit(bus, name, sig_key, fn, gain, lo=0, hi=BARS, pan=0.0):
    for b, beat in at(name, lo, hi):
        BUS[bus].add(bt(b, beat), cached(sig_key, fn), gain, pan=pan)


def drop(b, beat=0, big=1.0):
    """The big downbeat: impact, crash and a sub under it."""
    BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.9 * big)
    BUS["fx"].add(bt(b, beat), cached("crash", lambda: crash(3.0)), 0.5 * big)
    BUS["bass"].add(bt(b, beat), cached("sub", lambda: sub_tone(26, BAR)), 1.0 * big)


def taps(name, notes, gain=0.8):
    for k, (b, beat) in enumerate(at(name)):
        BUS["hoof"].add(bt(b, beat), cached(("hoof", k % 3), lambda: hoof(k % 3)), 0.9)
        m = notes[min(k, len(notes) - 1)]
        BUS["count"].add(bt(b, beat), cached(("cnt", m), lambda: pluck(m, 0.9, 0.9, seed=m)), gain)


def drums():
    for bar in range(BARS):
        kind = DRUMS[bar]
        if kind == "none":
            continue
        if kind == "roll":
            roll = [0, 0.5, 1, 1.5] + [2 + 0.25 * i for i in range(4)]
            for i, beat in enumerate(roll):
                BUS["clap"].add(bt(bar, beat), cached("snr", lambda: snare_hit(0.8, 5)), 0.5 + 0.5 * i / len(roll))
            BUS["fx"].add(bt(bar), cached("riser", lambda: riser(3 * BEAT)), 1.2 if bar == 7 else 0.8)
            continue
        kicks = {"full": (0, 1, 2, 3), "tight": (0, 2, 2.75), "half": (0, 2.5)}[kind]
        for beat in kicks:
            if (bar, beat) in ((6, 0),):
                continue                      # the stamp owns that downbeat
            if in_silence(bt(bar, beat)):
                continue
            BUS["kick"].add(bt(bar, beat), cached("kick", kick), 1.0 if kind != "half" else 0.85)
            KICKS.append((bt(bar, beat), 0.55))
            EVENTS.add("kick", bt(bar, beat))
        for beat in ((1, 3) if kind != "half" else (2,)):
            BUS["clap"].add(bt(bar, beat), cached("clap", clap), 0.7)
            EVENTS.add("clap", bt(bar, beat))
        full = kind == "full"
        for s in range(16 if full else 8):
            st = s * (1 if full else 2)
            BUS["hat"].add(bt(bar) + st * SONG.s16, cached(("hat", s % 2), lambda: hat(False, seed=4 + s % 2)),
                           0.5 if st % 4 == 0 else 0.3, pan=0.25)
        ch = CHORDS[bar]
        root = ch[0] - 12 if ch[0] >= 45 else ch[0]
        for beat in (0, 1.5, 2.5) if not full else (0, 0.75, 1.5, 2, 2.75, 3.5):
            BUS["bass"].add(bt(bar, beat), cached(("bass", root), lambda: bass_note(root, BEAT * 0.6)), 0.8)
        if full:
            for s in range(16):
                m = ch[[0, 2, 4, 3, 1, 4, 2, 3][s % 8]] + 12
                BUS["pluck"].add(bt(bar) + s * SONG.s16, cached(("arp", m), lambda: pluck(m, 0.3, 0.8, seed=m)),
                                 0.55, pan=0.3 * np.sin(s))


def compose():
    # pad under everything (the silences gate it)
    for bar in range(BARS):
        ch = CHORDS[bar]
        notes = [n - 12 for n in ch[1:4]]
        g = 1.0 if bar < 4 or 56 <= bar < 64 else (0.9 if bar in (7, 16, 17, 54, 55) else 0.7)
        BUS["pad"].add(bt(bar), cached(("pad", tuple(notes)), lambda: pad_chord(notes, BAR + 0.5, 0.25,
                                                                               seed=notes[0])), g)
    drums()

    # ---- cold open (as in the approved test)
    for b, beat in at("lamp"):
        BUS["fx"].add(bt(b, beat), cached("lamp", lambda: stamp_thud(5)), 0.5)
        BUS["count"].add(bt(b, beat), cached("lampbell", lambda: fm_bell(74, 2.5, idx=1.2, ratio=2.0)), 0.35)
    hit("fx", "tag", "tick", lambda: tick(True), 0.35)
    hit("fx", "card", ("flip", 3), lambda: rustle(0.12, 3), 0.6)
    taps("tap", COUNT)
    b5, beat5 = at("tap")[-1]
    BUS["count"].add(bt(b5, beat5), cached("answer", lambda: fm_bell(79, 2.0, idx=1.5, ratio=2.0)), 0.5)
    BUS["kick"].add(bt(b5, beat5), cached("kick", kick), 0.8)
    hit("crowd", "cheer", "crowd", crowd, 0.9)
    for b, beat in at("tick"):
        for s in range(3):
            BUS["hoof"].add(bt(b, beat) + s * SONG.s16 * 0.5, cached(("hoof", s), lambda: hoof(s)), 0.45)
    for k, (b, beat) in enumerate(at("answer")):
        BUS["count"].add(bt(b, beat), cached(("ans", k), lambda: pluck([67, 67, 69, 72][k], 0.6, 1.0, seed=20 + k)),
                         0.7)
    for k, (b, beat) in enumerate(at("pop", 0, 10)):
        BUS["count"].add(bt(b, beat), cached(("pop", k), lambda: pluck(PENT[k], 0.3, 1.2, seed=40 + k)), 0.4,
                         pan=np.sin(k * 0.9) * 0.6)
    for b, beat in at("stamp"):
        BUS["fx"].add(bt(b, beat), cached("stamp", lambda: stamp_thud(0)), 0.9)
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.35)
    for b, beat in at("title"):
        drop(b, beat)
    for k, (b, beat) in enumerate(at("char")):
        BUS["count"].add(bt(b, beat), cached(("ch", k), lambda: pluck([74, 77, 81, 84, 86][k], 0.4, 1.0, seed=60 + k)),
                         0.45)
    hit("fx", "concept", "tick", lambda: tick(True), 0.4)

    # ---- Pfungst
    for b, beat in at("year"):
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.6)
        BUS["count"].add(bt(b, beat), cached("yearbell", lambda: fm_bell(62, 3.0, idx=2.0, ratio=1.5)), 0.5)
        BUS["bass"].add(bt(b, beat), cached("sub", lambda: sub_tone(26, BAR)), 0.7)
    taps("tap2", COUNT, 0.7)                                       # it does not stop: past G and on
    for b, beat in at("blind"):
        BUS["fx"].add(bt(b, beat), cached("stamp", lambda: stamp_thud(0)), 0.8)
        BUS["count"].add(bt(b, beat), cached("blindlow", lambda: pluck(50, 1.5, 0.5, seed=7)), 0.6)
    for k, (b, beat) in enumerate(at("bar")):
        BUS["fx"].add(bt(b, beat), cached(("bar", k), lambda: glide(55, 79 if k == 0 else 58, BEAT * 0.9)), 0.8)
    for k, (b, beat) in enumerate(at("num", 0, 30)):
        m = 81 if k == 0 else 56
        BUS["count"].add(bt(b, beat), cached(("num", m), lambda: fm_bell(m, 2.0, idx=1.5, ratio=2.0)), 0.55)
    # ---- the cue
    for b, beat in at("reveal"):
        drop(b, beat, 0.8)
    hit("count", "face", "facebell", lambda: fm_bell(74, 2.5, idx=1.0, ratio=2.0), 0.5)
    taps("tap3", COUNT, 0.6)
    for b, beat in at("nod"):
        BUS["count"].add(bt(b, beat), cached("nod", lambda: fm_bell(86, 2.5, idx=1.8, ratio=2.0)), 0.6)
        BUS["fx"].add(bt(b, beat), cached("tick", lambda: tick(True)), 0.5)
    for b, beat in at("cueline"):
        BUS["fx"].add(bt(b, beat), cached("cueline", lambda: glide(74, 86, BEAT * 1.5)), 0.9)
        BUS["count"].add(bt(b, beat), cached("ping", lambda: sonar_ping(1175.0)), 1.2)

    # ---- overfitting
    for b, beat in at("slam"):
        drop(b, beat, 0.9 if b == 22 else 0.6)
    for k, (b, beat) in enumerate(at("kchar")):
        BUS["count"].add(bt(b, beat), cached(("kc", k), lambda: pluck([74, 77, 81][k], 0.4, 1.0, seed=70 + k)), 0.5)
    for k, (b, beat) in enumerate(at("dot")):
        m = PENT[k % len(PENT)] if b < 40 else [69, 74, 77][k % 3]
        BUS["count"].add(bt(b, beat), cached(("dot", m), lambda: pluck(m, 0.25, 1.3, seed=m + 1)), 0.4,
                         pan=np.sin(k * 1.3) * 0.5)
    for b, beat in at("draw"):
        BUS["fx"].add(bt(b, beat), cached(("draw", b), lambda: glide(62, 74, BAR * (0.9 if b < 40 else 0.45))), 0.8)
    for k, (b, beat) in enumerate(at("snap")):
        m = PENT[(k * 5) % 13]                                     # jumpy: the wiggle
        BUS["count"].add(bt(b, beat), cached(("snap", m), lambda: pluck(m, 0.18, 1.5, seed=m + 2)), 0.45,
                         pan=(-0.5 if k % 2 else 0.5))
    for k, (b, beat) in enumerate(at("score")):
        m = 86 if k == 0 else 53
        BUS["count"].add(bt(b, beat), cached(("score", m), lambda: fm_bell(m, 2.0, idx=1.6, ratio=2.0)), 0.55)
    hit("count", "dot2", "dot2", lambda: sonar_ping(1568.0, 1), 0.9)
    for b, beat in at("miss"):
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.6)
        BUS["bass"].add(bt(b, beat), cached("missbass", lambda: bass_note(37, BEAT * 1.5)), 0.9)
        BUS["count"].add(bt(b, beat), cached("misslow", lambda: pluck(49, 1.2, 0.8, seed=9)), 0.6)

    # ---- the 2019 classifier
    hit("fx", "frame", ("flip", 4), lambda: rustle(0.10, 4), 0.5)
    for k, (b, beat) in enumerate(at("check")):
        m = [81, 84, 86, 89][k % 4]
        BUS["count"].add(bt(b, beat), cached(("chk", m), lambda: pluck(m, 0.3, 1.2, seed=m + 3)), 0.45)
    for b, beat in at("heat"):
        BUS["fx"].add(bt(b, beat), cached("heatglide", lambda: glide(57, 69, BEAT * 2)), 0.8)
        BUS["count"].add(bt(b, beat), cached("heatping", lambda: sonar_ping(880.0, 2)), 1.0)
    for b, beat in at("zoom"):
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.45)
    for b, beat in at("num", 30, 40):
        BUS["count"].add(bt(b, beat), cached(("num", 77), lambda: fm_bell(77, 2.0, idx=1.5, ratio=2.0)), 0.55)
    for b, beat in at("stick"):
        BUS["fx"].add(bt(b, beat), cached("stamp", lambda: stamp_thud(0)), 0.9)
    for b, beat in at("verdict"):
        drop(b, beat, 1.0)
        BUS["count"].add(bt(b, beat), cached("verdictbell", lambda: fm_bell(57, 3.0, idx=2.5, ratio=1.41)), 0.5)
    for b, beat in at("split"):
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.4)
        BUS["count"].add(bt(b, beat), cached("splitbell", lambda: fm_bell(69, 2.5, idx=1.2, ratio=2.0)), 0.4)

    # ---- your own Hans
    hit("fx", "flip", ("flip", 5), lambda: rustle(0.2, 5), 0.7)
    for b, beat in at("smooth"):
        BUS["fx"].add(bt(b, beat), cached("smoothglide", lambda: glide(69, 74, BAR * 0.8)), 0.7)
        BUS["fx"].add(bt(b, beat), cached(("sw", 53), lambda: swell(53, BEAT * 2)), 0.5)
    for k, (b, beat) in enumerate(at("pop", 40, 60)):
        m = [72, 76, 79, 84][k]
        BUS["count"].add(bt(b, beat), cached(("pop2", m), lambda: pluck(m, 0.4, 1.0, seed=m + 4)), 0.5,
                         pan=[-0.5, 0.5, -0.25, 0.25][k])

    # ---- back on the stage: the horse counts and nobody nods
    taps("tap4", COUNT, 0.6)
    for b, beat in at("final"):
        BUS["count"].add(bt(b, beat), cached("finalbell", lambda: fm_bell(74, 4.0, idx=1.2, ratio=2.0)), 0.5)
        BUS["fx"].add(bt(b, beat), cached("crash", lambda: crash(3.0)), 0.25)
    hit("count", "endcard", "endbell", lambda: fm_bell(69, 4.0, idx=1.0, ratio=2.0), 0.4)

    # in-key swells into each new scene (skipped when the beat before is a silence)
    for bar in SCENE_CUTS:
        if in_silence(bt(bar) - BEAT * 0.5):
            continue
        m = CHORDS[bar][0]
        BUS["fx"].add(bt(bar) - BEAT, cached(("sw", m), lambda: swell(m, BEAT)), 0.45)
    for bar in (4, 5):
        BUS["fx"].add(bt(bar) - BEAT, cached(("sw", 50 if bar == 4 else 46),
                                             lambda: swell(50 if bar == 4 else 46, BEAT)), 0.5)
    # one sync event per HITS entry, on the exact beat
    for n, b, beat in HITS:
        EVENTS.add(n, bt(b, beat))


ENVS = [("drums", ("kick", "clap"), 0.0), ("kick", ("kick",), 0.88), ("count", ("count",), 0.85),
        ("pad", ("pad",), 0.0), ("hat", ("hat",), 0.8)]

if __name__ == "__main__":
    t_ = time.time()
    compose()
    levels = {"pad": 0.6, "pluck": 0.55, "hoof": 0.9, "count": 0.75, "kick": 0.95, "clap": 0.6, "hat": 0.3,
              "bass": 0.6, "fx": 0.6, "crowd": 0.55}
    silence = [(bt(b, b0), bt(b, b1)) for b, b0, b1 in SILENCES]
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"pad": 0.45, "pluck": 0.5, "bass": 0.35},
                         {"count": (BEAT * 0.75, 0.3)}, ir=reverb_ir(2.2), silence=silence, drive=1.15,
                         fade_out=3.0, out_gain=0.88)
    mix = lowpass(mix, 15000, order=1)
    mix = mix * gate_silence(mix.shape[1], silence)    # the reverb tail too: a true silence is silent
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t_:.1f}s")
