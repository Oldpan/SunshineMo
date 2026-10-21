"""Template soundtrack for a pixel_theater episode: 8 bars of chip lo-fi at 84 BPM (about 23 s).

Shows the series recipe in miniature: pulse pad + 1/32 arpeggio + stepped-triangle bass, chip kick /
noise snare / LFSR hats with swing, the "new window" hello jingle and chat pops on story cues.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.synth import *  # noqa: E402,F401,F403

SECTIONS = [("intro", 0, 2), ("chat", 2, 4), ("drop", 4, 8)]  # must match render.py
SONG = Song(bpm=84, bars=8, fps=60, sections=SECTIONS)
bt, BEAT, BAR, S16 = SONG.bt, SONG.beat, SONG.bar, SONG.s16
CHORDS = {"Fmaj7": [53, 57, 60, 64], "Bbmaj7": [58, 62, 65, 69], "C": [55, 60, 64, 67], "Am7": [57, 60, 64, 67],
          "Dm7": [57, 60, 62, 65]}
ROOT = {"Fmaj7": 41, "Bbmaj7": 46, "C": 48, "Am7": 45, "Dm7": 38}
PROG = ["Fmaj7", "Fmaj7", "Bbmaj7", "C", "Bbmaj7", "C", "Am7", "Dm7"]
HELLO_AT, POPS = (0, 2), [(2, 0, "nian"), (3, 0, "jin"), (4, 0, "jin")]

BUS = make_buses(SONG, {"pad": 0.35, "arp": 0.25, "bass": 0.0, "kick": 0.02, "snare": 0.1, "hat": 0.05,
                        "sfx": 0.18})
EVENTS = Events({k: [] for k in ("kick", "snare", "clap", "hat", "chord", "hello", "pop")})
KICKS = []


def compose():
    rng = np.random.default_rng(stable_seed("pixel_template"))
    for bar, ch in enumerate(PROG):
        sec = SONG.section(bar)
        EVENTS.add("chord", bt(bar))
        for j, m in enumerate(CHORDS[ch]):
            BUS["pad"].add(bt(bar), lowpass(chip_pulse(m, BAR, duty=0.5, vel=0.5, vib=0.08), 2400), 0.3,
                           pan=-0.3 + 0.2 * j)
        if sec != "intro":
            BUS["arp"].add(bt(bar), chip_arp([n + 12 for n in CHORDS[ch] + [CHORDS[ch][0] + 12]], BAR, S16), 0.5)
            BUS["bass"].add(bt(bar), chip_tri(ROOT[ch], BEAT * 1.6), 0.9)
            BUS["bass"].add(swing_time(SONG, bar, 10), chip_tri(ROOT[ch], BEAT * 0.9), 0.8)
        if sec == "drop":
            for st in (0, 7, 10):
                tk = swing_time(SONG, bar, st)
                BUS["kick"].add(tk, cached("ck", chip_kick), 1.0)
                EVENTS.add("kick", tk)
                KICKS.append((tk, 0.5))
            for st in (4, 12):
                ts = swing_time(SONG, bar, st)
                BUS["snare"].add(ts, cached("cn", lambda: chip_noise(0.22, hold=3, decay=0.07)), 0.9)
                EVENTS.add("snare", ts)
                EVENTS.add("clap", ts)
            for st in range(16):
                th = swing_time(SONG, bar, st)
                BUS["hat"].add(th, cached(("h", st % 2), lambda: chip_noise(0.05, hold=1, decay=0.012)),
                               (0.6 if st % 2 == 0 else 0.25) * (0.85 + 0.3 * rng.uniform()))
                if st % 4 == 0:
                    EVENTS.add("hat", th)
    BUS["sfx"].add(bt(*HELLO_AT), chip_jingle([72, 77, 81, 84], S16), 0.8)  # the "new window" jingle
    EVENTS.add("hello", bt(*HELLO_AT))
    for b, beat, who in POPS:
        BUS["sfx"].add(bt(b, beat), chip_pop(84 if who == "jin" else 79), 0.6)
        EVENTS.add("pop", bt(b, beat))


if __name__ == "__main__":
    compose()
    levels = {"pad": 0.6, "arp": 0.42, "bass": 0.75, "kick": 0.9, "snare": 0.5, "hat": 0.32, "sfx": 0.62}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"pad": 0.35, "arp": 0.3}, ir=reverb_ir(2.4), fade_out=2.0)
    export(OUT, SONG, mix, buses, EVENTS, envs=[("kick", ("kick",), 0.88), ("pad", ("pad",), 0.0)])
    loudness_report(mix, SONG)
