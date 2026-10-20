"""Template soundtrack for a neon_science episode: 8 bars (~19 s) showing the recipe.

Recipe (from episode 1): 100 BPM, minor 9th chords, pad intro -> snare roll + riser
-> one beat of silence -> drop with supersaw, four-on-the-floor, claps, offbeat open
hats, sub + octave bass, pluck arpeggio and a lead; bells for "question/answer" motifs.
Copy this folder to episodes/<name>/ and grow SECTIONS / compose().
"""
import os
import sys
from pathlib import Path
import time

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.synth import *  # noqa: E402,F401,F403

SECTIONS = [("intro", 0, 2), ("build", 2, 4), ("drop", 4, 8)]
SONG = Song(bpm=100, bars=8, fps=60, sections=SECTIONS)
bt = SONG.bt

CHORDS = {"Dm9": [50, 53, 57, 60, 64], "Bb9": [46, 50, 53, 57, 60], "F9": [53, 57, 60, 64, 67],
          "C69": [48, 52, 55, 57, 62]}
ROOT = {"Dm9": 38, "Bb9": 34, "F9": 41, "C69": 36}
PROG = ["Dm9", "Bb9", "F9", "C69", "Dm9", "Bb9", "F9", "C69"]
ARP = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 2, 1, 3, 2, 1]
LEAD = [(0, 3, 74), (3, 3, 72), (6, 2, 69), (8, 4, 72), (12, 4, 74)]  # (start 16th, len 16th, midi)

BUS = make_buses(SONG, {"pad": 0.35, "super": 0.25, "pluck": 0.3, "bell": 0.55, "lead": 0.3, "bass": 0.0,
                        "sub": 0.0, "kick": 0.03, "clap": 0.3, "hat": 0.12, "fx": 0.45})
EVENTS = Events()


def compose():
    kicks = []
    for bar in range(SONG.bars):
        sec, ch, t0 = SONG.section(bar), PROG[bar], bt(bar)
        notes = CHORDS[ch]
        if sec == "drop":
            BUS["super"].add(t0, cached(("super", ch), lambda: supersaw(notes, SONG.bar + 0.2,
                                                                        seed=stable_seed(ch, mod=89))))
        bright = 0.3 if sec == "intro" else 0.9
        BUS["pad"].add(t0, cached(("pad", ch, bright), lambda: pad_chord(notes, SONG.bar + 0.6, bright,
                                                                         seed=stable_seed(ch, mod=97))),
                       0.6 if sec == "drop" else 1.0)
        if sec == "drop":
            for b in range(4):
                BUS["kick"].add(bt(bar, b), cached("kick", kick))
                EVENTS.add("kick", bt(bar, b))
                kicks.append((bt(bar, b), 0.75))
                BUS["hat"].add(bt(bar, b + 0.5), cached("ohat", lambda: hat(True)), 0.55, pan=0.25)
                EVENTS.add("ohat", bt(bar, b + 0.5))
            for b in (1, 3):
                BUS["clap"].add(bt(bar, b), cached("clap", clap))
                EVENTS.add("clap", bt(bar, b))
            BUS["sub"].add(t0, sub_tone(ROOT[ch], SONG.bar))
            for i, iv in enumerate([0, 12, 0, 12, 0, 12, 7, 12]):
                m = ROOT[ch] + 12 + iv
                BUS["bass"].add(bt(bar, i * 0.5), cached(("bass", m), lambda: bass_note(m, 0.28)), 0.8)
            for st, ln, m in LEAD:
                BUS["lead"].add(bt(bar, st / 4), lead_note(m, ln * SONG.s16 * 0.92, seed=m))
                EVENTS.add("lead", (bt(bar, st / 4), m, ln * SONG.s16))
        if sec in ("build", "drop"):
            for s in range(16):
                m = notes[ARP[s]] + 12
                BUS["pluck"].add(bt(bar, s / 4), cached(("pluck", m), lambda: pluck(m, 0.6, 0.8, seed=m)),
                                 0.8 if s % 4 == 0 else 0.55, pan=0.35 * np.sin(s * 1.3))
                EVENTS.add("pluck", bt(bar, s / 4))
        if sec == "build":
            for i in range(8 if bar == 3 else 4):
                hb = i * 0.5 if bar == 2 else i * 0.375
                if bar == 3 and hb >= 3:
                    continue  # last beat stays silent
                BUS["clap"].add(bt(bar, hb), snare_hit(0.3 + 0.08 * i, seed=40 + i), 0.9)
                EVENTS.add("roll", bt(bar, hb))
    # question bell in the intro, riser into the drop, impact on the drop
    for beat, m in [(0, 81), (1.5, 84), (3, 86)]:
        BUS["bell"].add(bt(0, beat), fm_bell(m, 3.5), 0.8)
        EVENTS.add("bell", (bt(0, beat), m))
    BUS["fx"].add(bt(2), riser(2 * SONG.bar - SONG.beat), 0.9)
    BUS["fx"].add(bt(4), impact())
    BUS["hat"].add(bt(4), crash(), 0.9)
    EVENTS.add("impact", bt(4))
    return kicks


LEVELS = {"pad": 1.0, "super": 0.95, "pluck": 0.55, "bell": 0.7, "lead": 0.85, "bass": 0.7, "sub": 1.0,
          "kick": 0.95, "clap": 0.5, "hat": 0.6, "fx": 0.6}
DUCK = {"pad": 0.85, "super": 1.0, "bass": 1.0, "sub": 1.0, "lead": 0.35, "pluck": 0.6, "fx": 0.2}
ECHO = {k: (SONG.beat * 0.75, 0.35) for k in ("pluck", "lead")} | {"bell": (SONG.beat * 0.75, 0.45)}

if __name__ == "__main__":
    t0 = time.time()
    kicks = compose()
    mix, buses = mixdown(SONG, BUS, kicks, LEVELS, DUCK, ECHO, ir=reverb_ir(),
                         silence=[(bt(3, 3), bt(4))], fade_out=2.0)
    export(OUT, SONG, mix, buses, EVENTS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t0:.1f}s")
