"""第一座山 soundtrack (cold-open test, ink-wash version): 100 BPM, 10 bars, A minor pentatonic (羽调).

Guqin-led, no piano or synth plucks: each footstep is a frame drum tap and a guqin note one step higher; the
groove is a big drum, a frame drum on 2 and 4 and brushes; the flag and the seal get a small gong; the lantern
pings become guqin harmonics (泛音) echoing into the fog.

Every sound that matters sits on a cues.HITS entry.  The guqin climbs A minor pentatonic one note per step,
doubling speed in bar 2; the top note rings with a harmonic, the two probes answer lower, then a true silence.
Bar 4 brings the drums under the probes, bar 5 plants the flag on a gong, bar 6 sends harmonics into the fog,
bar 7 rolls on the big drum into a thunder crack and a beat of nothing, bar 8 drops the title on drum and gong.
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
        BUS["count"].add(bt(b, beat), cached("lampq", lambda: guqin(45, 4.0, 0.5, 0.8, seed=2)), 0.8)
    for b, beat in at("tag"):
        BUS["count"].add(bt(b, beat), cached("tagh", lambda: harmonic(69, 1.5)), 0.5)
    for k, (b, beat) in enumerate(at("step")):
        BUS["foot"].add(bt(b, beat), cached(("gr", k % 4), lambda: gravel(k % 4)), 0.6, pan=(-0.15 if k % 2 else 0.15))
        BUS["clap"].add(bt(b, beat), cached(("fd", k % 2), lambda: frame_drum(k % 2)), 0.5)
        m = CLIMB[k]
        BUS["count"].add(bt(b, beat), cached(("st", m), lambda: guqin(m, 1.6, 0.75, seed=m)), 0.85)
    BUS["fx"].add(bt(2), cached("rise2", lambda: riser(BAR)), 0.5)          # the climb speeds up
    for b, beat in at("top"):
        BUS["foot"].add(bt(b, beat), cached(("gr", 0), lambda: gravel(0)), 1.0)
        BUS["count"].add(bt(b, beat), cached("top", lambda: guqin(TOP - 12, 3.0, 0.9, 0.6, seed=9)), 0.9)
        BUS["count"].add(bt(b, beat), cached("tophar", lambda: harmonic(TOP - 12)), 0.6)
        BUS["kick"].add(bt(b, beat), cached("taiko", taiko), 0.8)
    for k, (b, beat) in enumerate(at("probe")):
        m = [79, 76, 81, 79, 81, 79][k]                                      # always lower than the top
        BUS["foot"].add(bt(b, beat), cached(("gr", 1 + k % 3), lambda: gravel(1 + k % 3)), 0.6,
                        pan=(-0.5 if k % 2 == 0 else 0.5))
        BUS["count"].add(bt(b, beat), cached(("pr", m), lambda: guqin(m, 1.0, 0.5, -0.6, seed=m + 1)), 0.6,
                         pan=(-0.5 if k % 2 == 0 else 0.5))
    for b, beat in at("flag"):
        BUS["fx"].add(bt(b, beat), cached("stamp", lambda: stamp_thud(0)), 0.9)
        BUS["fx"].add(bt(b, beat), cached("gong", lambda: gong(57, 3.0)), 0.7)
        BUS["kick"].add(bt(b, beat), cached("taiko", taiko), 0.9)
    for b, beat in at("alt"):
        BUS["count"].add(bt(b, beat), cached("alth", lambda: harmonic(81, 2.0)), 0.7)
    for b, beat in at("ping"):
        BUS["count"].add(bt(b, beat), cached(("har", b, beat), lambda: harmonic([76, 81, 79, 84][int(beat)], 2.0)), 0.9)
    for b, beat in at("bolt"):
        BUS["fx"].add(bt(b, beat), cached("thunder", lambda: thunder(1.1, 3)), 1.4)
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.6)
    # drums: bars 4-6 tight; bar 7 snare roll into the bolt; bars 8-9 full groove
    for bar in range(4, BARS):
        if bar == 7:
            for i, beat in enumerate([0, 0.5, 1, 1.5, 1.75]):
                BUS["kick"].add(bt(7, beat), cached("taiko", taiko), 0.45 + 0.12 * i)
            BUS["fx"].add(bt(7), cached("riser7", lambda: riser(2 * BEAT)), 1.0)
            continue
        full = bar >= 8
        for beat in (0, 1, 2, 3) if full else (0, 2, 2.75):
            if bar == 5 and beat == 0:
                continue                      # the flag owns that downbeat
            BUS["kick"].add(bt(bar, beat), cached("taiko", taiko), 1.0 if beat == 0 else 0.7)
            KICKS.append((bt(bar, beat), 0.55))
            EVENTS.add("kick", bt(bar, beat))
        for beat in (1, 3):
            BUS["clap"].add(bt(bar, beat), cached(("fd", 1), lambda: frame_drum(1)), 0.8)
        for s in range(16 if full else 8):
            st = s * (1 if full else 2)
            BUS["hat"].add(bt(bar) + st * SONG.s16, cached(("br", s % 2), lambda: brush_tap(1.0, seed=4 + s % 2)),
                           0.6 if st % 4 == 0 else 0.35, pan=0.25)
        root = CHORDS[bar][0] - 12 if CHORDS[bar][0] >= 45 else CHORDS[bar][0]
        for beat in (0, 1.5, 2.5) if not full else (0, 0.75, 1.5, 2, 2.75, 3.5):
            BUS["bass"].add(bt(bar, beat), cached(("bass", root), lambda: bass_note(root, BEAT * 0.6)), 0.8)
        if full:
            ch = CHORDS[bar]
            for s in range(16):
                if s % 2:
                    continue                                   # guqin arp on eighths
                m = [57, 60, 64, 67, 69, 67, 64, 60][(s // 2) % 8] + (0 if bar % 2 == 0 else -4 if s // 2 in (0, 4) else 0)
                BUS["pluck"].add(bt(bar) + s * SONG.s16, cached(("garp", m), lambda: guqin(m, 0.9, 0.6, 0.2, seed=m)),
                                 0.55, pan=0.3 * np.sin(s))
    for b, beat in at("title"):
        BUS["fx"].add(bt(b, beat), cached("imp", impact), 0.9)
        BUS["fx"].add(bt(b, beat), cached("gong", lambda: gong(57, 3.0)), 0.9)
        BUS["kick"].add(bt(b, beat), cached("taiko", taiko), 1.0)
        BUS["bass"].add(bt(b, beat), cached("sub", lambda: sub_tone(21, BAR)), 1.0)
    for k, (b, beat) in enumerate(at("char")):
        m = [76, 79, 81, 84][k]
        BUS["count"].add(bt(b, beat), cached(("chq", m), lambda: guqin(m, 1.2, 0.8, 0.3, seed=60 + k)), 0.6)
    for b, beat in at("concept"):
        BUS["fx"].add(bt(b, beat), cached("seal", lambda: stamp_thud(2)), 0.8)
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
