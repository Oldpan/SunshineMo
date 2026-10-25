"""会算数的马 soundtrack (cold-open test): 104 BPM, 10 bars.

Every sound that matters sits on a cues.HITS entry.  The hoof taps are pitched and climb C D E F G, so the ear
counts with the horse and the fifth tap lands on the dominant; then a true silence, then the crowd.
Bar 4 brings a tight beat (no lo-fi swing) under the quiz; bar 7 rolls into a beat of nothing; bar 8 drops the
title with a sub, a crash and the full groove (four on the floor, claps on 2 and 4, 16th hats, a Dm9 pluck arp
side-chained to the kick).  Scene changes use in-key swells, not noise whooshes.
"""
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.synth import *  # noqa: E402,F401,F403
from cues import BPM, BARS, SECTIONS, HITS, SILENCES, QUIZ  # noqa: E402

SONG = Song(bpm=BPM, bars=BARS, fps=60, sections=SECTIONS)
bt, BAR, BEAT = SONG.bt, SONG.bar, SONG.beat

DM9 = [50, 53, 57, 60, 64]
BB = [46, 50, 53, 57, 62]
CHORDS = [DM9, DM9, BB, BB, DM9, BB, DM9, BB, DM9, BB]
COUNT = [60, 62, 64, 65, 67]

BUS = make_buses(SONG, {"pad": 0.4, "pluck": 0.25, "hoof": 0.12, "count": 0.35, "kick": 0.0, "clap": 0.15,
                        "hat": 0.05, "bass": 0.0, "fx": 0.3, "crowd": 0.4})
EVENTS = Events()
KICKS = []


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


def at(name):
    return [(b, beat) for n, b, beat in HITS if n == name]


def compose():
    # pad under everything but the silences
    for bar in range(BARS):
        ch = CHORDS[bar]
        BUS["pad"].add(bt(bar), cached(("pad", bar % 2), lambda: pad_chord([n - 12 for n in ch[1:4]], BAR + 0.5,
                                                                        0.25, seed=bar % 2)), 1.0 if bar < 4 else (0.9 if bar == 7 else 0.7))
    # bar 0: the lamp snaps on; the city tag
    for b, beat in at("lamp"):
        BUS["fx"].add(bt(b, beat), cached("lamp", lambda: stamp_thud(5)), 0.5)
        BUS["count"].add(bt(b, beat), cached("lampbell", lambda: fm_bell(74, 2.5, idx=1.2, ratio=2.0)), 0.35)
        EVENTS.add("lamp", bt(b, beat))
    for b, beat in at("tag"):
        BUS["fx"].add(bt(b, beat), cached("tick", lambda: tick(True)), 0.35)
        EVENTS.add("tag", bt(b, beat))
    # cards: a paper flip
    for b, beat in at("card"):
        BUS["fx"].add(bt(b, beat), cached("flip", lambda: rustle(0.12, 3)), 0.6)
        EVENTS.add("card", bt(b, beat))
    # the count: hoof + a climbing pluck
    for k, (b, beat) in enumerate(at("tap")):
        BUS["hoof"].add(bt(b, beat), cached(("hoof", k % 3), lambda: hoof(k % 3)), 0.9)
        BUS["count"].add(bt(b, beat), cached(("cnt", k), lambda: pluck(COUNT[k], 0.9, 0.9, seed=k)), 0.8)
        if k == 4:
            BUS["count"].add(bt(b, beat), cached("answer", lambda: fm_bell(79, 2.0, idx=1.5, ratio=2.0)), 0.5)
            BUS["kick"].add(bt(b, beat), cached("kick", kick), 0.8)
        EVENTS.add("tap", bt(b, beat))
    for b, beat in at("cheer"):
        BUS["crowd"].add(bt(b, beat), cached("crowd", crowd), 0.9)
        EVENTS.add("cheer", bt(b, beat))
    # bar 4: the quiz over a tight beat
    for b, beat in at("tick"):
        for s in range(3):
            BUS["hoof"].add(bt(b, beat) + s * SONG.s16 * 0.5, cached(("hoof", s), lambda: hoof(s)), 0.45)
        EVENTS.add("tick", bt(b, beat))
    for k, (b, beat) in enumerate(at("answer")):
        BUS["count"].add(bt(b, beat), cached(("ans", k), lambda: pluck([67, 67, 69, 72][k], 0.6, 1.0, seed=20 + k)),
                         0.7)
        EVENTS.add("answer", bt(b, beat))
    # committee: thirteen blips climbing a D minor pentatonic
    pent = [62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89, 91]
    for k, (b, beat) in enumerate(at("pop")):
        BUS["count"].add(bt(b, beat), cached(("pop", k), lambda: pluck(pent[k], 0.3, 1.2, seed=40 + k)), 0.4,
                         pan=np.sin(k * 0.9) * 0.6)
        EVENTS.add("pop", bt(b, beat))
    for b, beat in at("stamp"):
        BUS["fx"].add(bt(b, beat), cached("stamp", lambda: stamp_thud(0)), 0.9)
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.35)
        EVENTS.add("stamp", bt(b, beat))
    # drums: bars 4-6 tight; bar 7 snare roll into the silence; bars 8-9 full groove
    for bar in range(4, BARS):
        if bar == 7:
            roll = [0, 0.5, 1, 1.5] + [2 + 0.25 * i for i in range(4)]
            for i, beat in enumerate(roll):
                BUS["clap"].add(bt(7, beat), cached("snr", lambda: snare_hit(0.8, 5)), 0.5 + 0.5 * i / len(roll))
            BUS["fx"].add(bt(7), riser(3 * BEAT), 1.2)
            continue
        full = bar >= 8
        kicks = (0, 1, 2, 3) if full else (0, 2, 2.75)
        for beat in kicks:
            if bar == 6 and beat == 0:
                continue                      # the stamp owns that downbeat
            BUS["kick"].add(bt(bar, beat), cached("kick", kick), 1.0)
            KICKS.append((bt(bar, beat), 0.55))
            EVENTS.add("kick", bt(bar, beat))
        for beat in (1, 3):
            BUS["clap"].add(bt(bar, beat), cached("clap", clap), 0.7)
            EVENTS.add("clap", bt(bar, beat))
        for s in range(16 if full else 8):
            st = s * (1 if full else 2)
            BUS["hat"].add(bt(bar) + st * SONG.s16, cached(("hat", s % 2), lambda: hat(False, seed=4 + s % 2)),
                           0.5 if st % 4 == 0 else 0.3, pan=0.25)
        root = CHORDS[bar][0] - 12
        for beat in (0, 1.5, 2.5) if not full else (0, 0.75, 1.5, 2, 2.75, 3.5):
            BUS["bass"].add(bt(bar, beat), cached(("bass", root), lambda: bass_note(root, BEAT * 0.6)), 0.8)
        if full:
            ch = CHORDS[bar]
            for s in range(16):
                m = ch[[0, 2, 4, 3, 1, 4, 2, 3][s % 8]] + 12
                BUS["pluck"].add(bt(bar) + s * SONG.s16, cached(("arp", m), lambda: pluck(m, 0.3, 0.8, seed=m)),
                                 0.55, pan=0.3 * np.sin(s))
    # title drop
    for b, beat in at("title"):
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.9)
        BUS["fx"].add(bt(b, beat), crash(3.0), 0.5)
        BUS["bass"].add(bt(b, beat), sub_tone(26, BAR), 1.0)
        EVENTS.add("title", bt(b, beat))
    for k, (b, beat) in enumerate(at("char")):
        BUS["count"].add(bt(b, beat), cached(("ch", k), lambda: pluck([74, 77, 81, 84, 86][k], 0.4, 1.0, seed=60 + k)),
                         0.45)
        EVENTS.add("char", bt(b, beat))
    for b, beat in at("concept"):
        BUS["fx"].add(bt(b, beat), cached("tick", lambda: tick(True)), 0.4)
        EVENTS.add("concept", bt(b, beat))
    # in-key swells into the quiz and the committee (no noise whooshes)
    for bar in (4, 5):
        BUS["fx"].add(bt(bar) - BEAT, cached(("sw", bar), lambda: swell(50 if bar == 4 else 46, BEAT)), 0.5)


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
                         fade_out=1.5, out_gain=0.88)
    mix = lowpass(mix, 15000, order=1)
    mix = mix * gate_silence(mix.shape[1], silence)    # the reverb tail too: a true silence is silent
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t_:.1f}s")
