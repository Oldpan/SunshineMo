"""Template soundtrack for a quiet_concept episode: 12 bars (30 s) showing the recipe.

Recipe (from episode 1): 96 BPM lo-fi piano on a four-chord loop (Fmaj9 Em7 Dm9 Am9), pad under everything,
a swung lo-fi beat only in the middle sections, a bell motif for the question (bar 0) and its answer (last
section), a reverse swell + impact on the title, a whoosh on every scene change (cues.SCENE_CUTS).
Post: tape wow, a gentle lowpass and vinyl crackle.  Keep it quiet: about -18 dBFS without drums.
"""
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.synth import *  # noqa: E402,F401,F403
from cues import BPM, BARS, SECTIONS, SCENE_CUTS  # noqa: E402

SONG = Song(bpm=BPM, bars=BARS, fps=60, sections=SECTIONS)
bt, BAR, BEAT = SONG.bt, SONG.bar, SONG.beat

CHORDS = {"Fmaj9": [53, 57, 60, 64, 67], "Em7": [52, 55, 59, 62, 64], "Dm9": [50, 53, 57, 60, 64],
          "Am9": [45, 52, 57, 59, 60]}
ROOT = {"Fmaj9": 29, "Em7": 28, "Dm9": 26, "Am9": 33}
LOOP = ["Fmaj9", "Em7", "Dm9", "Am9"]
QUESTION = [(0, 81), (0.75, 84), (1.5, 88)]   # rising, unresolved
ANSWER = [(0, 88), (0.75, 84), (1.5, 81)]     # falling home
DRUMS = {"body"}

BUS = make_buses(SONG, {"piano": 0.35, "pad": 0.4, "bell": 0.55, "bass": 0.0, "kick": 0.03, "rim": 0.15,
                        "hat": 0.08, "fx": 0.4})
EVENTS = Events()
KICKS = []


def compose():
    for bar in range(BARS):
        sec = SONG.section(bar)
        ch = LOOP[bar % 4]
        notes = CHORDS[ch]
        t0 = bt(bar)
        if bar < BARS - 1:
            for i, m in enumerate(notes):
                BUS["piano"].add(t0 + i * 0.022, cached(("pc", m), lambda: piano_note(m, 2.2, 0.55, seed=m)), 0.8)
            EVENTS.add("piano", t0)
        BUS["pad"].add(t0, cached(("pad", ch), lambda: pad_chord([n - 12 for n in notes[1:4]], BAR + 0.6, 0.25,
                                                                 seed=stable_seed(ch))), 0.55)
        if sec in DRUMS:
            for st in (0, 10) if bar % 2 == 0 else (0, 7, 10):
                tk = swing_time(SONG, bar, st)
                BUS["kick"].add(tk, cached("kick", kick_lofi), 1.0 if st == 0 else 0.75)
                EVENTS.add("kick", tk)
                KICKS.append((tk, 0.45))
            for st in (4, 12):
                ts = swing_time(SONG, bar, st)
                BUS["rim"].add(ts, cached("rim", lambda: lowpass(snare_hit(0.8, 7), 4800)), 0.8)
                EVENTS.add("rim", ts)
            for st in range(0, 16, 2):
                BUS["hat"].add(swing_time(SONG, bar, st), cached(("hat", st % 4), lambda: hat(False, seed=4 + st % 4)),
                               0.6 if st % 4 == 0 else 0.35, pan=0.2)
            BUS["bass"].add(t0, cached(("bass", ch), lambda: sub_tone(ROOT[ch] + 12, BAR * 0.95)), 0.8)
    for beat, m in QUESTION:
        BUS["bell"].add(bt(0, beat), cached(("qb", m), lambda: fm_bell(m, 2.5, idx=1.4, ratio=3.0)), 0.55)
        EVENTS.add("bell", bt(0, beat))
    last = SECTIONS[-1][1]
    for beat, m in ANSWER:
        BUS["bell"].add(bt(last, beat), cached(("ab", m), lambda: fm_bell(m, 3.5, idx=1.4, ratio=3.0)), 0.6)
        EVENTS.add("bell", bt(last, beat))
    title_bar = dict((n, b) for n, b, _ in SECTIONS)["title"]
    BUS["fx"].add(bt(title_bar) - 1.2, reverse_swell(1.2), 0.8)
    BUS["fx"].add(bt(title_bar), impact(), 0.75)
    EVENTS.add("impact", bt(title_bar))
    for b in SCENE_CUTS:
        if b == title_bar:
            continue
        BUS["fx"].add(bt(b) - 0.4, cached(("whoosh", b % 3), lambda: whoosh(0.5, 0.8, seed=b % 3)), 0.45)
        EVENTS.add("whoosh", bt(b))


ENVS = [("drums", ("kick", "rim"), 0.0), ("piano", ("piano",), 0.0), ("bell", ("bell",), 0.9),
        ("pad", ("pad",), 0.0)]

if __name__ == "__main__":
    t_ = time.time()
    compose()
    levels = {"piano": 0.85, "pad": 0.55, "bell": 0.5, "bass": 0.55, "kick": 0.9, "rim": 0.55, "hat": 0.28,
              "fx": 0.5}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"pad": 0.3, "bass": 0.3, "piano": 0.12},
                         {"bell": (BEAT * 0.75, 0.38)}, ir=reverb_ir(2.8), drive=1.12, fade_out=3.0, out_gain=0.85)
    mix = lowpass(tape_wow(mix), 12000, order=1) + vinyl(mix.shape[1], crackle=0.6) * 0.6
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t_:.1f}s")
