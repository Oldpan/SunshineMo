"""谁先开口 (死锁) soundtrack: 96 BPM lo-fi piano, 64 bars (160 s).

Same recipe as 老地方: piano on Fmaj9 Em7 Dm9 Am9, a bell question (bars 0, 55) and its answer (bar 59).
The beat carries the story: it plays while the philosophers sit down, stops dead when everyone is stuck
(bar 15) and through the four conditions, and only comes back when the circle breaks and someone eats (bar 28).
While stuck, the piano holds one chord and repeats it (Am9), nothing moves on.
Chopstick clicks at bar 12, typing ticks and a message pop for the phones, a whoosh on every scene change.
"""
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.synth import *  # noqa: E402,F401,F403
from cues import BPM, BARS, SECTIONS, SCENE_CUTS, SEND_BARS, TYPING  # noqa: E402

SONG = Song(bpm=BPM, bars=BARS, fps=60, sections=SECTIONS)
bt, BAR, BEAT = SONG.bt, SONG.bar, SONG.beat

CHORDS = {"Fmaj9": [53, 57, 60, 64, 67], "Em7": [52, 55, 59, 62, 64], "Dm9": [50, 53, 57, 60, 64],
          "Am9": [45, 52, 57, 59, 60]}
ROOT = {"Fmaj9": 29, "Em7": 28, "Dm9": 26, "Am9": 33}
LOOP = ["Fmaj9", "Em7", "Dm9", "Am9"]
# piano melody over the loop: (bar in loop, beat, midi, beats)
MELODY = [(0, 0, 76, 1.5), (0, 1.5, 74, 0.5), (0, 2, 72, 2), (1, 0, 71, 1.5), (1, 1.5, 72, 0.5), (1, 2, 74, 2),
          (2, 0, 72, 1), (2, 1, 69, 1), (2, 2, 72, 1.5), (2, 3.5, 74, 0.5), (3, 0, 72, 3), (3, 3, 71, 1)]
QUESTION = [(0, 81, 1.0), (0.75, 84, 1.0), (1.5, 88, 2.0)]   # rising, unresolved
ANSWER = [(0, 88, 1.0), (0.75, 84, 1.0), (1.5, 81, 3.0)]     # falling home

STUCK = set(range(15, 24))                                   # one chord, no beat, no melody
DRUM_BARS = set(range(10, 15)) | set(range(28, 44)) | {55, 56, 57, 58}
STRINGS = {"order", "db", "people", "life", "end"}
MELODY_ON = {"intro", "order", "people", "life", "end"}

BUS = make_buses(SONG, {"piano": 0.35, "pad": 0.4, "strings": 0.35, "bell": 0.55, "bass": 0.0, "kick": 0.03,
                        "rim": 0.15, "hat": 0.08, "coin": 0.4, "fx": 0.4})
EVENTS = Events()
KICKS = []


def compose():
    for bar in range(BARS):
        sec = SONG.section(bar)
        ch = "Am9" if bar in STUCK else LOOP[bar % 4]
        notes = CHORDS[ch]
        t0 = bt(bar)
        last = bar >= BARS - 3
        # piano: rolled chord on beat 1, a softer restrike on beat 3
        if bar < BARS - 1:
            for i, m in enumerate(notes):
                BUS["piano"].add(t0 + i * 0.022, cached(("pc", m), lambda: piano_note(m, 2.2, 0.55, seed=m)),
                                 0.8 if sec != "title" else 1.0)
                if sec not in ("title",) and i > 0:
                    BUS["piano"].add(bt(bar, 2) + i * 0.018, cached(("pr", m), lambda: piano_note(m, 1.6, 0.35,
                                                                                                   seed=m + 3)), 0.6)
            EVENTS.add("piano", t0)
        if sec in MELODY_ON and not last and bar not in STUCK:
            for lb, beat, m, beats in MELODY:
                if lb == bar % 4:
                    tn = bt(bar, beat)
                    BUS["piano"].add(tn, cached(("pm", m, beats), lambda: piano_note(m, beats * BEAT + 0.3, 0.7,
                                                                                    seed=m + 11)), 0.75)
                    EVENTS.add("note", tn)
        BUS["pad"].add(t0, cached(("pad", ch), lambda: pad_chord([n - 12 for n in notes[1:4]], BAR + 0.6, 0.25,
                                                                 seed=stable_seed(ch))), 0.55)
        if sec in STRINGS:
            BUS["strings"].add(t0, cached(("str", ch), lambda: string_pad(notes[1:4], BAR, attack=0.8, bright=0.4,
                                                                          seed=stable_seed(ch, 2))), 0.7)
        if bar in DRUM_BARS:
            for st in (0, 10) if bar % 2 == 0 else (0, 7, 10):
                tk = swing_time(SONG, bar, st)
                BUS["kick"].add(tk, cached("kick", kick_lofi), 1.0 if st == 0 else 0.75)
                EVENTS.add("kick", tk)
                KICKS.append((tk, 0.45))
            for st in (4, 12):
                ts = swing_time(SONG, bar, st)
                BUS["rim"].add(ts, cached("rim", lambda: lowpass(snare_hit(0.8, 7), 4800)), 0.8)
                BUS["rim"].add(ts, cached("side", rim), 0.35)
                EVENTS.add("rim", ts)
            for st in range(0, 16, 2):
                th = swing_time(SONG, bar, st)
                BUS["hat"].add(th, cached(("hat", st % 4), lambda: hat(False, seed=4 + st % 4)),
                               0.6 if st % 4 == 0 else 0.35, pan=0.2)
                if st % 4 == 0:
                    EVENTS.add("hat", th)
            BUS["bass"].add(t0, cached(("bass", ch), lambda: sub_tone(ROOT[ch] + 12, BAR * 0.95)), 0.8)
    # the question and its answer
    for b in (0, 55):
        for beat, m, beats in QUESTION:
            BUS["bell"].add(bt(b, beat), cached(("qb", m), lambda: fm_bell(m, 2.5, idx=1.4, ratio=3.0)), 0.55)
            EVENTS.add("bell", bt(b, beat))
    for beat, m, beats in ANSWER:
        BUS["bell"].add(bt(59, beat), cached(("ab", m), lambda: fm_bell(m, 3.5, idx=1.4, ratio=3.0)), 0.6)
        EVENTS.add("bell", bt(59, beat))
    # title hit
    BUS["fx"].add(bt(7) - 1.2, reverse_swell(1.2), 0.8)
    BUS["fx"].add(bt(7), impact(), 0.75)
    BUS["fx"].add(bt(7), crash(3.0), 0.4)
    EVENTS.add("impact", bt(7))
    # scene changes
    for b in SCENE_CUTS:
        if b == 7:
            continue
        w = cached(("whoosh", b % 3), lambda: whoosh(0.5, 0.8, seed=b % 3))
        BUS["fx"].add(bt(b) - 0.4, w, 0.45, pan=0.3 * np.sin(b))
        EVENTS.add("whoosh", bt(b))
    # chopsticks picked up one after another (bar 12), clicks again when they are numbered (bar 25)
    click = cached("click", lambda: lowpass(rim(seed=21), 6000))
    for k in range(5):
        BUS["coin"].add(bt(12, 0.5 + k * 0.5), click, 0.6, pan=np.sin(k * 1.3) * 0.5)
        EVENTS.add("coin", bt(12, 0.5 + k * 0.5))
    for k in range(5):
        BUS["coin"].add(bt(25, 1.0 + k * 0.4), click, 0.45, pan=np.sin(k * 1.3) * 0.5)
        EVENTS.add("coin", bt(25, 1.0 + k * 0.4))
    # the stuck moment: a low drone under bars 15-23
    BUS["fx"].add(bt(15), cached("drone", lambda: lowpass(pad_chord([33, 40], 9 * BAR, 0.2, seed=7), 900)), 0.5)
    # bar 27: the circle snaps open
    BUS["coin"].add(bt(27), cached("snap", lambda: fm_bell(93, 1.2, idx=1.8, ratio=2.4)), 0.5)
    EVENTS.add("coin", bt(27))
    # typing indicators: soft ticks; messages: a pop
    for bar, b0, b1 in TYPING:
        bb = b0
        while bb < b1:
            BUS["fx"].add(bt(bar, bb), cached(("tk", int(bb * 4) % 3), lambda: tick(False)), 0.18)
            EVENTS.add("tick", bt(bar, bb))
            bb += 0.25
    for bar in SEND_BARS:
        BUS["coin"].add(bt(bar, 1), cached("pop", lambda: fm_bell(86, 0.5, idx=1.0, ratio=2.0)), 0.55)
        EVENTS.add("send", bt(bar, 1))
    # the database lock monitor: a sonar-like scan (bar 31), a soft alarm when it finds the circle (bar 32)
    BUS["fx"].add(bt(31, 1), cached("scan", lambda: sonar_ping(1320.0, 3, 0.2)), 0.3)
    EVENTS.add("scan", bt(31, 1))

ENVS = [("drums", ("kick", "rim"), 0.0), ("kick", ("kick",), 0.88), ("piano", ("piano",), 0.0),
        ("bell", ("bell",), 0.9), ("pad", ("pad", "strings"), 0.0), ("hat", ("hat",), 0.8)]

if __name__ == "__main__":
    t_ = time.time()
    compose()
    levels = {"piano": 0.85, "pad": 0.55, "strings": 0.6, "bell": 0.5, "bass": 0.55, "kick": 0.9, "rim": 0.55,
              "hat": 0.28, "coin": 0.35, "fx": 0.5}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"pad": 0.3, "strings": 0.35, "bass": 0.3, "piano": 0.12},
                         {"bell": (BEAT * 0.75, 0.38), "coin": (BEAT * 0.5, 0.3)}, ir=reverb_ir(2.8), drive=1.12,
                         fade_out=4.0, out_gain=0.85)
    mix = lowpass(tape_wow(mix), 12000, order=1) + vinyl(mix.shape[1], crackle=0.6) * 0.6
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t_:.1f}s")
