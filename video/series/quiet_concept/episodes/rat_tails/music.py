"""老鼠尾巴 soundtrack (halftone dossier): 100 BPM, A minor, synth pop-print.

The style's toolkit: synth kick / snare / clap / hat, a square eighth-note bass, a marimba-like pluck
(fundamental + 4x partial) for the melody, pops on every glyph, a pitch-dropping boom on stamps, whooshes into
wipes.  Every sound that matters sits on a cues.HITS entry.  No true silence (series rule): the sewer opening and
the twist are a thinner texture (bass + marimba), never a dropout, and the stamp is not preceded by a gap.
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

Am, F, C, G, Dm, E7 = [57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62], [50, 53, 57], [52, 56, 59]
CHORDS = ([Am, F, C, G, Am, Dm, E7, F, Am, E7]
          + [Am, F, C, G, Am, F, Dm, E7, F, E7]
          + [C, G, Am, F, C, G, Am, F, E7]
          + [Dm, Am, E7, Am, Dm, Am, F, G, E7]
          + [F, C, G, Am, F, C, G, Am, Dm, E7]
          + [Am, F, Dm, E7, Am]
          + [F, G, E7, Am]
          + [Am, F, C, G, Am])
assert len(CHORDS) == BARS, len(CHORDS)
THIN = {0, 7, 46, 47, 53, 54, 55, 56, 60, 61}                   # bass + marimba only, never silent
SNARE = (set(range(2, 7)) | {8, 9} | set(range(11, 19)) | set(range(21, 28)) | set(range(31, 37))
         | set(range(39, 45)) | {49, 50, 51, 57, 58})

BUS = make_buses(SONG, {"pad": 0.4, "mar": 0.2, "pop": 0.15, "kick": 0.0, "snare": 0.12, "hat": 0.05,
                        "bass": 0.0, "fx": 0.2})
EVENTS = Events()
KICKS = []


def marimba(m, dur=0.6, vel=1.0):
    """Wooden bar: fundamental plus the ~4x partial, fast decay, a soft mallet click."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 28)
    s += bandnoise(n, 1500, 5000, seed=m) * np.exp(-t / 0.002) * 0.15
    return (s * np.minimum(t / 0.001, 1) * 0.6 * vel).astype(np.float32)


def coin_ping():
    return (fm_bell(96, 1.2, idx=2.0, ratio=5.4) + 0.6 * fm_bell(91, 1.2, idx=1.5, ratio=5.4)).astype(np.float32)


def plop(m, seed=0):
    """A tail landing in the tray: a downward pitch blip."""
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    f = mtof(m) * (1 + 0.8 * np.exp(-t / 0.02))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)
    return (s * 0.6 + bandnoise(n, 800, 3000, seed=seed) * np.exp(-t / 0.006) * 0.2).astype(np.float32)


def rattle(seed=0):
    """A wire cage being shaken: three metal clicks."""
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n, np.float32)
    for k, d in enumerate((0.0, 0.035, 0.07)):
        i = int(d * SR)
        tt = t[: n - i]
        out[i:] += (bandnoise(n - i, 2500, 7000, seed=seed * 3 + k) * np.exp(-tt / 0.012)
                    + 0.3 * np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt / 0.03)) * (1 - 0.25 * k)
    return (out * 0.5).astype(np.float32)


def g(key, fn):
    return cached(key, fn)


def tone(bar, k, octave=24):
    ch = CHORDS[bar]
    return ch[k % 3] + octave + (12 if (k // 3) % 2 else 0)


SNEAK = [69, 72, 76, 74, 72, 69, 71, 68]                        # the tailless rat's footsteps (bar 4)
LOOP = [69, 72, 76, 81]


def compose():
    for bar in range(BARS):
        notes = CHORDS[bar]
        BUS["pad"].add(bt(bar), g(("pad", tuple(notes)), lambda: string_pad(notes, BAR + 0.4, 0.4, 0.4,
                                                                            seed=notes[0])), 0.45)
        root = notes[0] - 24
        for e in range(8):                                        # square eighth bass, never stops
            m = root + (12 if e % 2 else 0)
            BUS["bass"].add(bt(bar, e * 0.5), g(("sq", m), lambda: chip_pulse(m, BEAT * 0.45, duty=0.5,
                                                                              decay=0.18)), 0.5)
        # marimba ostinato on eighths (offbeats only in thin bars so the hits stay on top)
        for e in range(8):
            if bar in THIN and e % 2 == 0:
                continue
            m = [notes[0], notes[2], notes[1] + 12, notes[2]][e % 4] + 12
            BUS["mar"].add(bt(bar, e * 0.5), g(("mo", m), lambda: marimba(m, 0.4, 0.7)), 0.35,
                           pan=0.3 * np.sin(e * 1.7))
        if bar not in THIN:
            for beat in (0, 1, 2, 3) if bar in (8, 9, 18, 19, 34, 36, 57, 58) else (0, 2):
                BUS["kick"].add(bt(bar, beat), g("kick", lambda: kick(soft=False)), 0.85)
                KICKS.append((bt(bar, beat), 0.5))
                EVENTS.add("kick", bt(bar, beat))
            if bar in SNARE:
                for beat in (1, 3):
                    BUS["snare"].add(bt(bar, beat), g("sn", lambda: snare_hit(0.9)), 0.6)
                    BUS["snare"].add(bt(bar, beat), g("cl", clap), 0.35)
            for s in range(8):
                BUS["hat"].add(bt(bar, s * 0.5), g(("h", s % 2), lambda: hat(False, seed=4 + s % 2)),
                               0.35 if s % 2 else 0.2)
        else:
            BUS["hat"].add(bt(bar, 1), g("sh", lambda: hat(False, seed=9)), 0.18)
            BUS["hat"].add(bt(bar, 3), g("sh", lambda: hat(False, seed=9)), 0.18)
    for b in SCENE_CUTS:
        if b not in (8, 57):
            BUS["fx"].add(bt(b - 1, 3), g("wsh", lambda: whoosh(BEAT, 0.5, 300, 4000, seed=3)), 0.35)
    for b in (7, 17, 56):
        BUS["fx"].add(bt(b), g("riser", lambda: riser(BAR)), 0.4)
    counter = {}
    for n, b, beat in HITS:
        k = counter.get(n, 0)
        counter[n] = k + 1
        at_ = bt(b, beat)
        pan = float(np.sin(k * 2.1) * 0.45)
        if n == "eyes":
            m = [81, 84, 88, 86, 84, 81, 83, 80][k % 8]
            BUS["pop"].add(at_, g(("mE", m), lambda: marimba(m, 0.5, 0.9)), 0.7, pan=pan)
            BUS["fx"].add(at_, g(("blip", k % 4), lambda: chip_pop(96 + k % 4)), 0.15, pan=pan)
        elif n == "notice":
            BUS["fx"].add(at_, g("thudN", lambda: stamp_thud(2)), 0.7)
            BUS["fx"].add(at_, g("rus", lambda: rustle(0.3, seed=2)), 0.6)
        elif n in ("hchar", "char"):
            m = [76, 79, 81, 84, 88][k % 5] + (0 if n == "hchar" else 5)
            BUS["pop"].add(at_, g(("cp", m), lambda: chip_pop(m)), 0.45, pan=pan)
            BUS["pop"].add(at_, g(("mC", m), lambda: marimba(m, 0.4)), 0.5, pan=pan)
        elif n == "coin":
            BUS["fx"].add(at_, g("coin", coin_ping), 0.7)
        elif n == "tail":
            m = tone(b, k, 12)
            BUS["pop"].add(at_, g(("pl", m), lambda: plop(m + 12, seed=m)), 0.6, pan=pan)
            BUS["pop"].add(at_, g(("mT", m), lambda: marimba(m + 12, 0.35, 0.8)), 0.4, pan=pan)
        elif n == "chart":
            m = [84, 88][k % 2]
            BUS["fx"].add(at_, g("tk", lambda: tick(True)), 0.5)
            BUS["pop"].add(at_, g(("mU", m), lambda: marimba(m, 0.6)), 0.7)
        elif n in ("stamp", "law"):
            BUS["fx"].add(at_, g(("st", n), lambda: stamp_thud(0 if n == "stamp" else 1)), 1.0)
            BUS["bass"].add(at_, g("sub", lambda: sub_tone(33, BEAT * 1.5)), 0.7)
            BUS["fx"].add(at_, g("shut", lambda: shutter_ratchet(5, 0.02, seed=1)), 0.35)
            if n == "stamp":
                BUS["fx"].add(at_, g("crash", lambda: crash(1.6)), 0.35)
        elif n == "step":
            m = SNEAK[k % 8]
            BUS["pop"].add(at_, g(("mS", m), lambda: marimba(m, 0.25, 0.9)), 0.7, pan=-0.5 + k / 8)
            BUS["fx"].add(at_, g(("bt", k % 2), lambda: brush_tap(1.0, seed=k % 2)), 0.45, pan=-0.5 + k / 8)
        elif n == "loop":
            m = LOOP[k % 4]
            BUS["pop"].add(at_, g(("mL", m), lambda: marimba(m, 0.8)), 0.75)
            BUS["fx"].add(at_, g(("wl", k % 4), lambda: whoosh(0.35, 0.5, 600, 5000, seed=20 + k % 4)), 0.3, pan=pan)
        elif n == "cage":
            BUS["fx"].add(at_, g(("rt", k % 4), lambda: rattle(k % 4)), 0.6, pan=pan)
            m = tone(b, k, 24)
            BUS["pop"].add(at_, g(("mG", m), lambda: marimba(m, 0.4, 0.8)), 0.45, pan=pan)
        elif n == "count":
            BUS["fx"].add(at_, g(("ty", k), lambda: type_key(k)), 0.7)
            m = [76, 79, 83][k % 3]
            BUS["pop"].add(at_, g(("bl", m), lambda: fm_bell(m, 1.4, idx=1.2, ratio=4.0)), 0.5)
        elif n == "wipe":
            BUS["fx"].add(at_, g("wipe", lambda: whoosh(0.5, 0.4, 200, 6000, seed=7)), 0.7)
        elif n == "title":
            BUS["fx"].add(at_, g("imp", impact), 0.9)
            BUS["fx"].add(at_, g("crashT", lambda: crash(2.4)), 0.45)
            BUS["bass"].add(at_, g("subT", lambda: sub_tone(33, BAR)), 0.7)
        elif n in ("sub", "tq"):
            BUS["fx"].add(at_, g("tk", lambda: tick(True)), 0.5)
            m = 81 if n == "sub" else 84
            BUS["pop"].add(at_, g(("mQ", m), lambda: marimba(m, 0.9)), 0.6)
        elif n == "pulse":
            m = [81, 84, 88][k % 3]
            BUS["pop"].add(at_, g(("bP", m), lambda: fm_bell(m, 1.8, idx=1.0, ratio=4.0)), 0.5)
        elif n in ("tag", "fig", "row", "box", "line", "match", "win", "neq", "chipw", "soft"):
            if n == "fig" and k % 4 == 0:
                BUS["fx"].add(at_, g("rus2", lambda: rustle(0.4, seed=5)), 0.7)
                BUS["fx"].add(at_, g("thudF", lambda: stamp_thud(4)), 0.4)
            m = tone(b, k, 24)
            BUS["pop"].add(at_, g(("mB", m), lambda: marimba(m, 0.6, 0.9)), 0.6, pan=pan)
            BUS["fx"].add(at_, g(("pp", k % 3), lambda: chip_pop(88 + k % 3)), 0.15, pan=pan)
        elif n in ("link", "pull", "sync"):
            m = tone(b, k, 12 if n != "sync" else 24)
            BUS["pop"].add(at_, g(("pl", m), lambda: plop(m + 12, seed=m)), 0.5, pan=pan)
            BUS["pop"].add(at_, g(("mT", m), lambda: marimba(m + 12, 0.35, 0.8)), 0.4, pan=pan)
        elif n == "split":
            hi_, lo_ = 76 + 2 * k % 8, 69 - k % 4
            BUS["pop"].add(at_, g(("mH", hi_), lambda: marimba(hi_, 0.5)), 0.5, pan=0.4)
            BUS["pop"].add(at_, g(("mH", lo_), lambda: marimba(lo_, 0.5)), 0.5, pan=-0.4)
        elif n in ("type", "ref", "ticket"):
            BUS["fx"].add(at_, g(("ty", k % 5), lambda: type_key(k % 5)), 0.6 if n != "ref" else 0.4, pan=pan)
            if n == "ticket":
                BUS["fx"].add(at_, g(("rs", k % 3), lambda: rustle(0.2, seed=k % 3)), 0.5, pan=pan)
            m = tone(b, k, 24)
            BUS["pop"].add(at_, g(("mY", m), lambda: marimba(m, 0.3, 0.6)), 0.3, pan=pan)
        elif n in ("close", "tear"):
            BUS["fx"].add(at_, g(("stC", k % 2), lambda: stamp_thud(5 + k % 2)), 0.65)
            if n == "tear":
                BUS["fx"].add(at_, g(("rsT", k % 3), lambda: rustle(0.25, seed=7 + k % 3)), 0.6)
        elif n in ("aim", "mark", "q", "chip"):
            BUS["fx"].add(at_, g("tk", lambda: tick(True)), 0.5)
            m = tone(b, k, 24)
            BUS["pop"].add(at_, g(("mQ", m), lambda: marimba(m, 0.7)), 0.55, pan=pan)
        elif n in ("qchar", "gold"):
            m = [76, 79, 81, 84, 88, 86][k % 6]
            BUS["pop"].add(at_, g(("cp", m), lambda: chip_pop(m)), 0.3 if n == "gold" else 0.45, pan=pan)
            BUS["pop"].add(at_, g(("mC", m), lambda: marimba(m, 0.5)), 0.5, pan=pan)
        elif n in ("score", "stepc", "like"):
            BUS["fx"].add(at_, g(("ty", k % 5), lambda: type_key(k % 5)), 0.35)
            m = 72 + (k * 2) % 24
            BUS["pop"].add(at_, g(("cpS", m), lambda: chip_pop(m)), 0.4, pan=pan)
        elif n == "beep":
            m = [84, 84, 88, 91][k % 4]
            BUS["pop"].add(at_, g(("bp", m), lambda: chip_pulse(m, 0.12, duty=0.25, decay=0.08)), 0.35)
        elif n in ("buoy", "flag"):
            m = tone(b, k, 24)
            BUS["pop"].add(at_, g(("bB", m), lambda: fm_bell(m, 1.2, idx=1.0, ratio=4.0)), 0.45, pan=pan)
        elif n == "lap":
            BUS["fx"].add(at_, g(("wl", k % 4), lambda: whoosh(0.35, 0.5, 600, 5000, seed=20 + k % 4)), 0.3, pan=pan)
            m = tone(b, k, 24)
            BUS["pop"].add(at_, g(("mL2", m), lambda: marimba(m, 0.4)), 0.5, pan=pan)
        elif n == "bonk":
            BUS["fx"].add(at_, g(("rt", k % 4), lambda: rattle(k % 4)), 0.5, pan=pan)
            BUS["pop"].add(at_, g(("plB", k % 3), lambda: plop(48 + k % 3 * 3, seed=k)), 0.6, pan=pan)
        elif n in ("light", "glow"):
            m = tone(b, k, 24)
            BUS["pop"].add(at_, g(("bG", m), lambda: fm_bell(m, 1.8, idx=0.8, ratio=4.0)), 0.4, pan=pan)
            BUS["fx"].add(at_, g(("air", k % 3), lambda: whoosh(0.6, 0.5, 200, 2500, seed=30 + k % 3)), 0.2)
        else:
            raise SystemExit(f"no sound for hit {n}")
    for n, b, beat in HITS:
        EVENTS.add(n, bt(b, beat))


ENVS = [("drums", ("kick", "snare"), 0.0), ("kick", ("kick",), 0.88), ("pop", ("pop",), 0.85),
        ("pad", ("pad",), 0.0), ("hat", ("hat",), 0.8), ("bass", ("bass",), 0.8)]

if __name__ == "__main__":
    t_ = time.time()
    compose()
    levels = {"pad": 0.4, "mar": 0.5, "pop": 0.8, "kick": 0.9, "snare": 0.55, "hat": 0.3, "bass": 0.55, "fx": 0.7}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"pad": 0.4, "mar": 0.3, "bass": 0.3},
                         {"pop": (BEAT * 0.75, 0.25)}, ir=reverb_ir(1.4), drive=1.2, fade_out=1.2, out_gain=0.9)
    mix = lowpass(mix, 15000, order=1)
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t_:.1f}s")
