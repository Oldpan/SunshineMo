"""Soundtrack for "好感差距 / The Liking Gap" (neon_science, episode 1).

Harmony, melodies and arrangement only; every sound comes from video/core/synth.py.

Output:
  out/music.wav  48 kHz stereo 16-bit
  out/sync.npz   event times + per-frame envelopes the renderer cuts to
"""
import os
import sys
import time

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

SECTIONS = [  # (name, first bar, last bar exclusive)
    ("intro", 0, 8), ("verse", 8, 16), ("build1", 16, 24), ("drop1", 24, 32),
    ("breakdown", 32, 40), ("build2", 40, 48), ("drop2", 48, 56), ("post", 56, 64),
    ("outro", 64, 74),
]
SONG = Song(bpm=100, bars=74, fps=60, sections=SECTIONS)
BEAT, BAR, S16, N_BARS = SONG.beat, SONG.bar, SONG.s16, SONG.bars
bt, section = SONG.bt, SONG.section

# ---------------------------------------------------------------- harmony
CHORDS = {
    "Dm9": [50, 53, 57, 60, 64],
    "Bb9": [46, 50, 53, 57, 60],
    "F9": [53, 57, 60, 64, 67],
    "C69": [48, 52, 55, 57, 62],
    "Am7": [45, 52, 55, 60, 64],
}
ROOT = {"Dm9": 38, "Bb9": 34, "F9": 41, "C69": 36, "Am7": 33}
VERSE = ["Dm9", "Bb9", "F9", "C69"]
CHORUS = ["Bb9", "C69", "Am7", "Dm9"]
PROG = (VERSE * 6 + CHORUS * 2 + VERSE * 2 + CHORUS * 4 + VERSE * 2
        + ["Bb9", "C69", "F9", "F9", "Bb9", "C69", "F9", "F9", "F9", "F9"])
assert len(PROG) == N_BARS

# ---------------------------------------------------------------- buses (name -> reverb send)
BUS = make_buses(SONG, {
    "pad": 0.35, "super": 0.25, "keys": 0.4, "pluck": 0.3, "bell": 0.55,
    "lead": 0.3, "bass": 0.0, "sub": 0.0, "kick": 0.03, "clap": 0.3,
    "hat": 0.12, "fx": 0.45, "tick": 0.4,
})
EVENTS = Events({k: [] for k in ["kick", "clap", "hat", "ohat", "roll", "bell", "lead",
                                 "pluck", "impact", "tick", "keys"]})

# ---------------------------------------------------------------- melodies
# (start in 16ths, length in 16ths, midi)
LEAD_A = [
    [(0, 3, 74), (3, 3, 72), (6, 2, 69), (8, 4, 72), (12, 4, 74)],
    [(0, 3, 76), (3, 3, 74), (6, 2, 72), (8, 6, 67), (14, 2, 69)],
    [(0, 3, 72), (3, 3, 76), (6, 2, 79), (8, 4, 76), (12, 4, 74)],
    [(0, 6, 74), (6, 2, 72), (8, 8, 69)],
]
LEAD_B = LEAD_A[:3] + [[(0, 4, 77), (4, 4, 76), (8, 8, 74)]]
ARP = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 2, 1, 3, 2, 1]


# ---------------------------------------------------------------- arrangement
def compose():
    kicks = []
    for bar in range(N_BARS):
        sec = section(bar)
        ch = PROG[bar]
        t0 = bt(bar)
        notes = CHORDS[ch]

        # --- pads (whole bar, slightly overlapping)
        if sec != "drop1" and sec != "drop2":
            bright = {"intro": 0.15 + 0.6 * bar / 8, "verse": 0.75, "build1": 0.9 + 0.1 * (bar - 16),
                      "breakdown": 0.55, "build2": 0.9, "post": 0.7, "outro": 0.6}.get(sec, 0.6)
            bright = round(bright, 2)
            sig = cached(("pad", ch, bright), lambda: pad_chord(CHORDS[ch], BAR + 0.6, bright, seed=stable_seed(ch, mod=97)))
            g = 1.0
            if sec == "intro":
                g = min(1.0, (t0 + 0.0) / 6 + 0.25)
            if bar >= 72:
                g = 1.15
            BUS["pad"].add(t0, sig, g)
        else:
            sig = cached(("super", ch), lambda: supersaw(CHORDS[ch], BAR + 0.2, seed=stable_seed(ch, mod=89)))
            BUS["super"].add(t0, sig, 1.0)
            sig = cached(("pad", ch, 0.9), lambda: pad_chord(CHORDS[ch], BAR + 0.6, 0.9, seed=stable_seed(ch, mod=97)))
            BUS["pad"].add(t0, sig, 0.6)

        # --- drums
        def K(beat, soft=False):
            tt = bt(bar, beat)
            BUS["kick"].add(tt, cached(("kick", soft), lambda: kick(soft)), 1.0)
            EVENTS["kick"].append(tt)
            kicks.append((tt, 0.35 if soft else 0.75))

        def C(beat, g=1.0):
            tt = bt(bar, beat)
            BUS["clap"].add(tt, cached("clap", clap), g)
            EVENTS["clap"].append(tt)

        def H(beat, g=1.0, open_=False):
            tt = bt(bar, beat)
            BUS["hat"].add(tt, cached(("hat", open_), lambda: hat(open_)), g,
                           pan=0.25 if open_ else -0.2)
            EVENTS["ohat" if open_ else "hat"].append(tt)

        if sec == "verse":
            K(0, True)
            K(2.5, True)
            if bar >= 12:
                for b in range(4):
                    H(b + 0.5, 0.35)
        elif sec == "build1":
            K(0)
            K(2.5 if bar < 20 else 2)
            if bar >= 20:
                K(1)
                K(3)
            for b in range(8):
                H(b * 0.5, 0.45 if b % 2 else 0.25)
            if bar >= 18:
                C(1, 0.8)
                C(3, 0.8)
        elif sec in ("drop1", "drop2"):
            for b in range(4):
                K(b)
                H(b + 0.5, 0.55, open_=True)
            C(1)
            C(3)
            for s in range(16):
                if s % 2:
                    H(s / 4, 0.18 + 0.1 * (s % 4 == 3))
        elif sec == "breakdown":
            for b in range(4):
                tt = bt(bar, b)
                BUS["tick"].add(tt, cached(("tick", b % 2), lambda: tick(b % 2 == 0)), 1.0,
                                pan=-0.4 if b % 2 else 0.4)
                EVENTS["tick"].append(tt)
            if bar >= 38:
                for b in range(8):
                    H(b * 0.5, 0.2 if b % 2 else 0.1)
        elif sec == "build2":
            K(0, bar < 42)
            K(2.5, bar < 42)
            if bar >= 42:
                for b in range(8):
                    H(b * 0.5, 0.4 if b % 2 else 0.22)
            if bar >= 44:
                C(1, 0.8)
                C(3, 0.8)
                K(1)
                K(3)
        elif sec == "post":
            K(0)
            K(2.5, True)
            C(2, 0.85)
            for b in range(8):
                H(b * 0.5, 0.3 if b % 2 else 0.15)
            if bar % 2 == 1:
                H(3.5, 0.4, open_=True)
        elif sec == "outro" and bar < 66:
            if bar == 64:
                for b in range(4):
                    K(b, True)
            H(0.5, 0.15)
            H(2.5, 0.15)

        # snare rolls before drops
        if bar in (23, 47):
            hits = [b * 0.5 for b in range(4)] + [2 + b * 0.25 for b in range(4)]
            hits += [3 + b * 0.125 for b in range(0)]  # last beat stays silent
            for i, hb in enumerate(hits):
                v = 0.35 + 0.65 * i / len(hits)
                tt = bt(bar, hb)
                BUS["clap"].add(tt, snare_hit(v, seed=40 + i), 0.9)
                EVENTS["roll"].append(tt)
        if bar in (22, 46):
            for i in range(8):
                tt = bt(bar, 2 + i * 0.25)
                BUS["clap"].add(tt, snare_hit(0.2 + 0.05 * i, seed=60 + i), 0.6)
                EVENTS["roll"].append(tt)

        # --- bass
        r = ROOT[ch]
        if sec in ("drop1", "drop2"):
            BUS["sub"].add(t0, sub_tone(r, BAR), 1.0)
            pat = [0, 12, 0, 12, 0, 12, 7, 12]
            for i, iv in enumerate(pat):
                BUS["bass"].add(bt(bar, i * 0.5),
                                cached(("bass", r + 12 + iv), lambda: bass_note(r + 12 + iv, 0.28)), 0.8)
        elif sec in ("build1", "build2") or (sec == "verse" and bar >= 12):
            BUS["sub"].add(t0, sub_tone(r, BAR), 0.7 if sec == "verse" else 0.85)
            if sec in ("build1", "build2") and bar % 2 == 1:
                BUS["bass"].add(bt(bar, 3.5), cached(("bass", r + 24), lambda: bass_note(r + 24, 0.25)), 0.5)
        elif sec == "post":
            BUS["sub"].add(t0, sub_tone(r, BAR), 0.85)
            for hb in (0, 2.5, 3.5):
                BUS["bass"].add(bt(bar, hb), cached(("bass", r + 12), lambda: bass_note(r + 12, 0.3)), 0.6)
        elif sec == "outro" and bar < 72:
            BUS["sub"].add(t0, sub_tone(r, BAR), 0.5)

        # --- plucked arpeggio
        if sec in ("verse", "build1", "build2", "drop2", "post") or (sec == "breakdown" and bar >= 38):
            step = 2 if sec in ("verse", "post") else 1
            for s in range(0, 16, step):
                m = notes[ARP[s]] + 12
                vel = 0.8 if s % 4 == 0 else 0.55
                if sec == "drop2":
                    m += 12
                    vel *= 0.6
                bright = 0.6 + 0.4 * ((bar % 4) / 3)
                tt = bt(bar, s / 4)
                BUS["pluck"].add(tt, cached(("pluck", m, round(bright, 2)),
                                            lambda: pluck(m, 0.6, bright, seed=m)), vel,
                                 pan=0.35 * np.sin(s * 1.3))
                EVENTS["pluck"].append(tt)

        # --- breakdown keys
        if sec in ("breakdown", "post"):
            for hb, dur, vel in [(0, 1.4, 1.0), (1.5, 1.2, 0.7), (3, 0.9, 0.8)]:
                tt = bt(bar, hb)
                for j, m in enumerate(notes):
                    BUS["keys"].add(tt + j * 0.012, cached(("ep", m, dur, vel),
                                                           lambda: ep_key(m, dur, vel)), 1.0,
                                    pan=(j - 2) * 0.18)
                EVENTS["keys"].append(tt)

        # --- lead melody
        if sec in ("drop1", "drop2"):
            phrase = LEAD_A if (bar - 24) % 8 < 4 else LEAD_B
            for st, ln, m in phrase[bar % 4]:
                tt = bt(bar, st / 4)
                d = ln * S16 * 0.92
                BUS["lead"].add(tt, lead_note(m, d, seed=m), 1.0)
                if sec == "drop2":
                    BUS["lead"].add(tt, lead_note(m + 12, d, seed=m + 5), 0.32, pan=0.3)
                EVENTS["lead"].append((tt, m, d))

    # --- bells: question in the intro, answer in the outro
    q = [(2, 0, 81), (2, 1.5, 84), (2, 3, 86), (3, 0, 84),
         (4, 0, 81), (4, 1.5, 84), (4, 3, 88), (5, 0, 86), (5, 2, 84),
         (6, 0, 81), (6, 1.5, 84), (6, 3, 86)]
    a = [(66, 0, 86), (66, 1.5, 84), (66, 3, 81), (67, 0, 77),
         (70, 0, 86), (70, 1.5, 84), (70, 3, 81), (71, 0, 77), (72, 0, 77), (72, 0.02, 81),
         (72, 0.04, 84)]
    for bar, beat, m in q + a:
        tt = bt(bar, beat)
        BUS["bell"].add(tt, fm_bell(m, 3.5), 0.8, pan=0.3 * np.sin(m))
        EVENTS["bell"].append((tt, m))
    # breakdown bell sprinkles (months ticking by)
    for bar in (33, 35, 37, 39):
        for beat, m in [(0, 81), (2.5, 84)]:
            tt = bt(bar, beat)
            BUS["bell"].add(tt, fm_bell(m, 3.0, idx=2.0), 0.45, pan=-0.3)
            EVENTS["bell"].append((tt, m))

    # --- fx: risers, impacts, crashes, swells
    for b0, b1 in [(20, 24), (44, 48)]:
        BUS["fx"].add(bt(b0), riser((b1 - b0) * BAR - BEAT), 0.9)
    for bar in (24, 48):
        BUS["fx"].add(bt(bar), impact(), 1.0)
        BUS["hat"].add(bt(bar), crash(), 0.9, pan=0.1)
        EVENTS["impact"].append(bt(bar))
    for bar in (8, 32, 40, 56, 64):
        BUS["fx"].add(bt(bar) - 1.2, reverse_swell(1.2), 0.6)
        BUS["hat"].add(bt(bar), crash(), 0.35)
        EVENTS["impact"].append(bt(bar))
    # air in the intro
    n = int(bt(8) * SR)
    air = bandnoise(n, 3000, 9000, seed=77) * np.linspace(0, 1, n) ** 1.5 * 0.02
    BUS["fx"].add(0, air, 1.0)

    return kicks

# ---------------------------------------------------------------- mix
LEVELS = {"pad": 1.0, "super": 0.95, "keys": 0.9, "pluck": 0.55, "bell": 0.7, "lead": 0.85,
          "bass": 0.7, "sub": 1.0, "kick": 0.95, "clap": 0.5, "hat": 0.6, "fx": 0.6, "tick": 0.3}
DUCK = {"pad": 0.85, "super": 1.0, "bass": 1.0, "sub": 1.0, "lead": 0.35, "pluck": 0.6, "keys": 0.3,
        "fx": 0.2}
ECHO = {"pluck": (BEAT * 0.75, 0.35), "bell": (BEAT * 0.75, 0.45), "lead": (BEAT * 0.75, 0.35)}
# everything drops out for the last beat before each drop
SILENCE = [(bt(bar, 3), bt(bar + 1)) for bar in (23, 47)]

if __name__ == "__main__":
    t0 = time.time()
    kicks = compose()
    print(f"composed in {time.time() - t0:.1f}s")
    mix, buses = mixdown(SONG, BUS, kicks, LEVELS, DUCK, ECHO, ir=reverb_ir(), silence=SILENCE)
    print(f"mixed in {time.time() - t0:.1f}s  peak={np.abs(mix).max():.3f}")
    export(OUT, SONG, mix, buses, EVENTS)
    loudness_report(mix, SONG)
    print(f"done in {time.time() - t0:.1f}s")
