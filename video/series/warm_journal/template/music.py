"""Template soundtrack for a warm_journal episode: 8 bars of lo-fi at 80 BPM (24 s).

intro (ticks, Rhodes arpeggio, music-box question) -> verse (swung boom-bap) ->
drop (4536 chords, piano hook, strings, claps, crash).  Grow it into the real song;
the full recipe is episodes/time_flies/music.py.
"""
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))


def _up(marker):
    """Nearest ancestor directory containing `marker` (works from template/ or episodes/<name>/)."""
    d = HERE
    while not os.path.exists(os.path.join(d, marker)):
        d = os.path.dirname(d)
    return d


sys.path.insert(0, _up("core"))  # video/
from core.synth import *  # noqa: E402,F401,F403

OUT = os.path.join(HERE, "out")
SECTIONS = [("intro", 0, 2), ("verse", 2, 4), ("drop", 4, 8)]  # must match render.py
SONG = Song(bpm=80, bars=8, fps=60, sections=SECTIONS)
BEAT, BAR = SONG.beat, SONG.bar
bt, section = SONG.bt, SONG.section

CHORDS = {"Am9": [57, 60, 64, 67, 71], "Fmaj9": [53, 57, 60, 64, 67], "Cmaj9": [52, 55, 59, 62, 67],
          "G9": [53, 57, 59, 62], "Em7": [52, 55, 59, 62]}
ROOT = {"Am9": 33, "Fmaj9": 29, "Cmaj9": 36, "G9": 31, "Em7": 28}
PROG = ["Fmaj9", "Cmaj9", "Am9", "G9", "Fmaj9", "G9", "Em7", "Am9"]
HOOK = [(0, 0, 72, 0.5), (0, 0.5, 69, 0.5), (0, 1, 72, 0.5), (0, 1.5, 74, 0.5), (0, 2, 76, 2),
        (1, 0, 74, 0.5), (1, 0.5, 71, 0.5), (1, 1, 74, 1), (1, 2, 79, 2),
        (2, 0, 79, 1), (2, 1, 76, 0.5), (2, 1.5, 74, 0.5), (2, 2, 71, 1), (2, 3, 74, 1),
        (3, 0, 72, 1), (3, 1, 76, 1), (3, 2, 81, 2)]
QUESTION = [(0, 0, 88, 0.5), (0, 0.5, 91, 0.5), (0, 1, 93, 1), (0, 2, 91, 1), (1, 0, 86, 1), (1, 2, 91, 2)]

BUS = make_buses(SONG, {"keys": 0.25, "piano": 0.3, "bell": 0.45, "strings": 0.35, "bass": 0.0, "sub": 0.0,
                        "kick": 0.02, "snare": 0.12, "clap": 0.15, "hat": 0.05, "tick": 0.08, "fx": 0.3})
EVENTS = Events({k: [] for k in ("kick", "snare", "clap", "hat", "tick", "chord", "bell", "piano", "crash",
                                 "drop")})
KICKS = []


def compose():
    rng = np.random.default_rng(stable_seed("template"))
    for bar, ch in enumerate(PROG):
        sec = section(bar)
        notes = CHORDS[ch]
        EVENTS.add("chord", bt(bar))
        if sec == "intro":
            for k in range(8):
                m = notes[k % len(notes)]
                BUS["keys"].add(bt(bar, k / 2), cached(("ep", m, 1.2), lambda: ep_key(m, 1.2, 0.45)), 0.8)
            for b in range(4):
                BUS["tick"].add(bt(bar, b), cached(("tick", b % 2), lambda: tick(b % 2 == 0)), 0.85)
                EVENTS.add("tick", bt(bar, b))
            continue
        for j, m in enumerate(notes):
            BUS["keys"].add(bt(bar) + 0.018 * j, cached(("ep", m, 2.0), lambda: ep_key(m, 2.0, 0.7)), 0.8)
        BUS["sub"].add(bt(bar), cached(("sub", ROOT[ch]), lambda: sub_tone(ROOT[ch], 1.4)), 1.0)
        BUS["bass"].add(bt(bar), cached(("bass", ROOT[ch]), lambda: bass_note(ROOT[ch] + 12, 1.2)), 0.9)
        for st in ([0, 7, 10] if sec == "verse" else [0, 7, 10, 14]):
            tk = swing_time(SONG, bar, st)
            BUS["kick"].add(tk, cached("kick", kick_lofi), 1.0)
            EVENTS.add("kick", tk)
            KICKS.append((tk, 0.5))
        for st in (4, 12):
            ts = swing_time(SONG, bar, st)
            BUS["snare"].add(ts, cached("snare", lambda: lowpass(snare_hit(0.9, 7), 5200)), 0.85)
            EVENTS.add("snare", ts)
            if sec == "drop":
                BUS["clap"].add(ts, cached("clap", clap), 0.7)
                EVENTS.add("clap", ts)
        for st in range(16):
            vel = 0.75 if st % 4 == 0 else (0.55 if st % 2 == 0 else 0.28)
            th = swing_time(SONG, bar, st)
            BUS["hat"].add(th, cached(("hat", st % 2), lambda: hat(False, seed=4 + st % 2)), vel)
            if st % 4 == 0:
                EVENTS.add("hat", th)
        if sec == "drop":
            BUS["strings"].add(bt(bar), cached(("str", ch), lambda: string_pad([n + 12 for n in notes[1:4]], BAR,
                                                                                attack=0.6, bright=0.6)), 0.8)
    for b, beat, m, beats in QUESTION:
        BUS["bell"].add(bt(b, beat), cached(("mbox", m), lambda: fm_bell(m, 2.5, idx=1.6, ratio=3.0)), 0.6)
        EVENTS.add("bell", bt(b, beat))
    for b, beat, m, beats in HOOK:
        tn = bt(4 + b, beat)
        BUS["piano"].add(tn, cached(("pn", m, beats), lambda: piano_note(m, beats * BEAT, 0.75, seed=m)), 1.0)
        EVENTS.add("piano", tn)
    BUS["fx"].add(bt(4), crash(), 0.9)
    EVENTS.add("crash", bt(4))
    EVENTS.add("drop", bt(4))


ENVS = [("drums", ("kick", "snare", "clap"), 0.0), ("kick", ("kick",), 0.88), ("keys", ("keys",), 0.0),
        ("piano", ("piano",), 0.0), ("bell", ("bell",), 0.9), ("pad", ("strings", "keys"), 0.0),
        ("tick", ("tick",), 0.85), ("hat", ("hat",), 0.8)]

if __name__ == "__main__":
    compose()
    levels = {"keys": 0.85, "piano": 0.8, "bell": 0.45, "strings": 0.65, "bass": 0.5, "sub": 0.6, "kick": 0.95,
              "snare": 0.6, "clap": 0.45, "hat": 0.3, "tick": 0.35, "fx": 0.55}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"keys": 0.35, "strings": 0.45, "bass": 0.3},
                         {"bell": (BEAT * 0.75, 0.38)}, ir=reverb_ir(2.6), drive=1.15, fade_out=2.0, out_gain=0.85)
    mix = lowpass(tape_wow(mix), 11500, order=1) + vinyl(mix.shape[1]) * 0.8
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
