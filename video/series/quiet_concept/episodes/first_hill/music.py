"""第一座山 soundtrack (cold-open test): 100 BPM, 10 bars, A minor.

Every sound that matters sits on a cues.HITS entry.  Each footstep is gravel plus a pluck one step higher on
A minor pentatonic, so the ear climbs with him; the steps double in speed in bar 2; the top note rings, the two
probes answer lower, then a true silence.  Bar 4 brings a tight beat under the probes, bar 5 plants the flag,
bar 6 sends sonar pings into the fog that come back empty, bar 7 rolls into a lightning crack and a beat of
nothing, bar 8 drops the title with the full groove (four on the floor, 16th hats, an Am9 arp side-chained).
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
CHORDS = [AM9, AM9, FM7, CM, AM9, FM7, AM9, FM7, AM9, FM7]
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


def swell(m, dur):
    s = pad_chord([m, m + 7, m + 12], dur, 0.6, seed=m)
    e = (np.arange(s.shape[-1]) / s.shape[-1]) ** 2.5
    return (s * e).astype(np.float32)


def at(name):
    return [(b, beat) for n, b, beat in HITS if n == name]


def compose():
    for bar in range(BARS):
        notes = [n - 12 for n in CHORDS[bar][1:4]]
        g = 0.9 if bar < 4 else 0.7
        BUS["pad"].add(bt(bar), cached(("pad", tuple(notes)), lambda: pad_chord(notes, BAR + 0.5, 0.25,
                                                                               seed=notes[0])), g)
    for b, beat in at("lamp"):
        BUS["fx"].add(bt(b, beat), cached("strike", lambda: stamp_thud(5)), 0.45)
        BUS["count"].add(bt(b, beat), cached("lampbell", lambda: fm_bell(69, 3.0, idx=1.2, ratio=2.0)), 0.4)
    for b, beat in at("tag"):
        BUS["fx"].add(bt(b, beat), cached("tick", lambda: tick(True)), 0.35)
    for k, (b, beat) in enumerate(at("step")):
        BUS["foot"].add(bt(b, beat), cached(("gr", k % 4), lambda: gravel(k % 4)), 0.9, pan=(-0.15 if k % 2 else 0.15))
        m = CLIMB[k]
        BUS["count"].add(bt(b, beat), cached(("st", m), lambda: pluck(m, 0.8, 0.9, seed=m)), 0.7)
    BUS["fx"].add(bt(2), cached("rise2", lambda: riser(BAR)), 0.5)          # the climb speeds up
    for b, beat in at("top"):
        BUS["foot"].add(bt(b, beat), cached(("gr", 0), lambda: gravel(0)), 1.0)
        BUS["count"].add(bt(b, beat), cached("top", lambda: fm_bell(TOP - 12, 2.5, idx=1.5, ratio=2.0)), 0.6)
        BUS["kick"].add(bt(b, beat), cached("kick", kick), 0.8)
    for k, (b, beat) in enumerate(at("probe")):
        m = [79, 76, 81, 79, 81, 79][k]                                      # always lower than the top
        BUS["foot"].add(bt(b, beat), cached(("gr", 1 + k % 3), lambda: gravel(1 + k % 3)), 0.6,
                        pan=(-0.5 if k % 2 == 0 else 0.5))
        BUS["count"].add(bt(b, beat), cached(("pr", m), lambda: pluck(m, 0.5, 0.7, seed=m + 1)), 0.55,
                         pan=(-0.5 if k % 2 == 0 else 0.5))
    for b, beat in at("flag"):
        BUS["fx"].add(bt(b, beat), cached("stamp", lambda: stamp_thud(0)), 0.9)
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.4)
        BUS["count"].add(bt(b, beat), cached("flagbell", lambda: fm_bell(81, 2.5, idx=1.5, ratio=2.0)), 0.5)
    for b, beat in at("alt"):
        BUS["fx"].add(bt(b, beat), cached("tick", lambda: tick(True)), 0.5)
    for b, beat in at("ping"):
        BUS["count"].add(bt(b, beat), cached("ping", lambda: sonar_ping(1320.0, 3)), 1.1)
    for b, beat in at("bolt"):
        BUS["fx"].add(bt(b, beat), cached("thunder", lambda: thunder(1.1, 3)), 1.4)
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.6)
    # drums: bars 4-6 tight; bar 7 snare roll into the bolt; bars 8-9 full groove
    for bar in range(4, BARS):
        if bar == 7:
            for i, beat in enumerate([0, 0.5, 1, 1.5, 1.75]):
                BUS["clap"].add(bt(7, beat), cached("snr", lambda: snare_hit(0.8, 5)), 0.5 + 0.1 * i)
            BUS["fx"].add(bt(7), cached("riser7", lambda: riser(2 * BEAT)), 1.0)
            continue
        full = bar >= 8
        for beat in (0, 1, 2, 3) if full else (0, 2, 2.75):
            if bar == 5 and beat == 0:
                continue                      # the flag owns that downbeat
            BUS["kick"].add(bt(bar, beat), cached("kick", kick), 1.0)
            KICKS.append((bt(bar, beat), 0.55))
            EVENTS.add("kick", bt(bar, beat))
        for beat in (1, 3):
            BUS["clap"].add(bt(bar, beat), cached("clap", clap), 0.7)
        for s in range(16 if full else 8):
            st = s * (1 if full else 2)
            BUS["hat"].add(bt(bar) + st * SONG.s16, cached(("hat", s % 2), lambda: hat(False, seed=4 + s % 2)),
                           0.5 if st % 4 == 0 else 0.3, pan=0.25)
        root = CHORDS[bar][0] - 12 if CHORDS[bar][0] >= 45 else CHORDS[bar][0]
        for beat in (0, 1.5, 2.5) if not full else (0, 0.75, 1.5, 2, 2.75, 3.5):
            BUS["bass"].add(bt(bar, beat), cached(("bass", root), lambda: bass_note(root, BEAT * 0.6)), 0.8)
        if full:
            ch = CHORDS[bar]
            for s in range(16):
                m = ch[[0, 2, 4, 3, 1, 4, 2, 3][s % 8]] + 12
                BUS["pluck"].add(bt(bar) + s * SONG.s16, cached(("arp", m), lambda: pluck(m, 0.3, 0.8, seed=m)),
                                 0.55, pan=0.3 * np.sin(s))
    for b, beat in at("title"):
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.9)
        BUS["fx"].add(bt(b, beat), cached("crash", lambda: crash(3.0)), 0.5)
        BUS["bass"].add(bt(b, beat), cached("sub", lambda: sub_tone(21, BAR)), 1.0)
    for k, (b, beat) in enumerate(at("char")):
        m = [76, 79, 81, 84][k]
        BUS["count"].add(bt(b, beat), cached(("ch", m), lambda: pluck(m, 0.4, 1.0, seed=60 + k)), 0.45)
    for b, beat in at("concept"):
        BUS["fx"].add(bt(b, beat), cached("tick", lambda: tick(True)), 0.4)
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
