"""Soundtrack for "长大后时间越过越快？" (warm_journal, episode 1).

Lo-fi hip-hop at 80 BPM: Rhodes, swung boom-bap, a ticking clock that speeds up into a tape
stop, then 4536 ("王道进行") choruses with piano and strings.  Every sound comes from
video/core/synth.py.

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

SECTIONS = [  # (name, first bar, last bar exclusive) -- must match render.py
    ("intro", 0, 4), ("verse", 4, 12), ("memory", 12, 16), ("build", 16, 24), ("drop1", 24, 32),
    ("evidence", 32, 40), ("mechanism", 40, 48), ("drop2", 48, 56), ("advice", 56, 62), ("outro", 62, 66),
]
SONG = Song(bpm=80, bars=66, fps=60, sections=SECTIONS)
BEAT, BAR, S16, N_BARS = SONG.beat, SONG.bar, SONG.s16, SONG.bars
bt, section = SONG.bt, SONG.section
TAPE_STOP = bt(23, 2)          # the clock races, then the tape stops ...
SILENT = [(bt(23, 3), bt(24)), (bt(47, 3), bt(48))]  # ... and only the record crackle is left

# ---------------------------------------------------------------- harmony (C major / A minor)
CHORDS = {
    "Am9": [57, 60, 64, 67, 71], "Fmaj9": [53, 57, 60, 64, 67], "Cmaj9": [52, 55, 59, 62, 67],
    "G9sus": [53, 57, 60, 62], "G9": [53, 57, 59, 62], "Em7": [52, 55, 59, 62], "Dm9": [53, 57, 60, 64],
}
ROOT = {"Am9": 33, "Fmaj9": 29, "Cmaj9": 36, "G9sus": 31, "G9": 31, "Em7": 28, "Dm9": 38}
V = ["Am9", "Fmaj9", "Cmaj9", "G9sus"]          # 6415
V2 = ["Am9", "Fmaj9", "Cmaj9", "G9"]
MEM = ["Fmaj9", "Em7", "Dm9", "Cmaj9"]           # 4321 falling, nostalgic
CH = ["Fmaj9", "G9", "Em7", "Am9"]               # 4536
PROG = (["Fmaj9", "Fmaj9", "Fmaj9", "Cmaj9"]     # intro (bars 0-1 only ticks + crackle)
        + V + V2 + MEM + V + ["Am9", "Fmaj9", "Dm9", "G9"] + CH + CH + V + V2 + MEM + MEM + CH + CH
        + ["Fmaj9", "G9", "Cmaj9", "Am9", "Fmaj9", "G9"] + ["Fmaj9", "G9", "Cmaj9", "Cmaj9"])
assert len(PROG) == N_BARS, len(PROG)

BUS = make_buses(SONG, {
    "keys": 0.25, "piano": 0.3, "bell": 0.45, "strings": 0.35, "bass": 0.0, "sub": 0.0,
    "kick": 0.02, "snare": 0.12, "clap": 0.15, "hat": 0.05, "tick": 0.08, "fx": 0.3, "alarm": 0.1,
})
EVENTS = Events({k: [] for k in ("kick", "snare", "clap", "hat", "tick", "chord", "bell", "piano", "crash",
                                 "alarm", "tapestop", "riser", "rustle", "drop")})
KICKS = []  # (time, sidechain depth)

# melodies: (bar offset, beat, midi, beats)
Q_MOTIF = [(0, 0, 88, 0.5), (0, 0.5, 91, 0.5), (0, 1, 93, 1), (0, 2, 91, 1), (0, 3, 88, 1),
           (1, 0, 86, 1), (1, 1, 88, 1), (1, 2, 91, 2)]                       # question: ends on G
A_MOTIF = [(0, 0, 86, 0.5), (0, 0.5, 88, 0.5), (0, 1, 91, 2), (0, 3, 88, 1),
           (1, 0, 86, 1), (1, 1, 84, 3)]                                        # answer: lands on C
MEM_MEL = [(0, 0, 81, 1), (0, 1, 79, 1), (0, 2, 76, 2), (1, 0, 71, 1), (1, 1, 74, 1), (1, 2, 76, 2),
           (2, 0, 81, 1), (2, 1, 79, 1), (2, 2, 77, 1), (2, 3, 76, 1), (3, 0, 74, 1), (3, 1, 76, 1),
           (3, 2, 72, 2)]
HOOK = [  # 8-bar piano hook over F G Em Am | F G Em Am
    (0, 0, 72, 0.5), (0, 0.5, 69, 0.5), (0, 1, 72, 0.5), (0, 1.5, 74, 0.5), (0, 2, 76, 2),
    (1, 0, 74, 0.5), (1, 0.5, 71, 0.5), (1, 1, 74, 1), (1, 2, 79, 2),
    (2, 0, 79, 1), (2, 1, 76, 0.5), (2, 1.5, 74, 0.5), (2, 2, 71, 1), (2, 3, 74, 1),
    (3, 0, 72, 1), (3, 1, 76, 1), (3, 2, 81, 2),
    (4, 0, 81, 0.5), (4, 0.5, 79, 0.5), (4, 1, 76, 0.5), (4, 1.5, 72, 0.5), (4, 2, 74, 1), (4, 3, 76, 1),
    (5, 0, 74, 1), (5, 1, 79, 1), (5, 2, 74, 1), (5, 3, 71, 1),
    (6, 0, 76, 0.5), (6, 0.5, 79, 0.5), (6, 1, 83, 1.5), (6, 2.5, 81, 1.5),
    (7, 0, 81, 1), (7, 1, 76, 1), (7, 2, 72, 0.5), (7, 2.5, 69, 1.5),
]


def q(v, step=0.05):
    return round(v / step) * step


# ---------------------------------------------------------------- parts
def keys_part(bar, ch, sec, rng):
    notes = CHORDS[ch]
    if sec in ("intro",) and bar < 2:
        return
    EVENTS.add("chord", bt(bar))
    if sec in ("memory", "mechanism", "outro") or (sec == "intro"):
        # gentle arpeggio in eighths, low notes first
        for k in range(8):
            m = notes[k % len(notes)] + (12 if k >= len(notes) else 0)
            vel = q(0.42 + 0.1 * rng.uniform())
            sig = cached(("ep", m, 1.2, vel), lambda: ep_key(m, 1.2, vel))
            BUS["keys"].add(bt(bar, k / 2) + rng.uniform(0, 0.012), sig, 0.8, pan=0.25 * ((k % 3) - 1))
        return
    vel = q(0.62 + 0.12 * rng.uniform()) if sec not in ("drop1", "drop2") else q(0.75 + 0.1 * rng.uniform())
    for j, m in enumerate(notes):  # strummed on the downbeat, held
        sig = cached(("ep", m, 2.0, vel), lambda: ep_key(m, 2.0, vel))
        BUS["keys"].add(bt(bar) + 0.018 * j, sig, 0.8, pan=-0.3 + 0.15 * j)
    up = notes[-3:]
    v2 = q(vel * 0.6)
    for j, m in enumerate(up):  # lazy re-hit on the "and" of 2
        sig = cached(("ep", m, 1.0, v2), lambda: ep_key(m, 1.0, v2))
        BUS["keys"].add(swing_time(SONG, bar, 10) + 0.015 * j, sig, 0.7, pan=0.2)


def bass_part(bar, ch, sec):
    if sec in ("intro", "memory", "outro"):
        if sec != "intro" or bar >= 2:
            BUS["sub"].add(bt(bar), cached(("sub", ROOT[ch], 2.6), lambda: sub_tone(ROOT[ch], 2.6)), 0.5)
        return
    r = ROOT[ch]
    half = sec == "mechanism"
    BUS["sub"].add(bt(bar), cached(("sub", r, 1.4), lambda: sub_tone(r, 1.4)), 1.0)
    BUS["bass"].add(bt(bar), cached(("bass", r + 12, 1.2), lambda: bass_note(r + 12, 1.2)), 0.9)
    if not half:
        BUS["bass"].add(swing_time(SONG, bar, 7), cached(("bass", r + 12, 0.25), lambda: bass_note(r + 12, 0.25)),
                        0.6)
        BUS["sub"].add(swing_time(SONG, bar, 10), cached(("sub", r, 0.9), lambda: sub_tone(r, 0.9)), 0.9)
        BUS["bass"].add(swing_time(SONG, bar, 10), cached(("bass", r + 19, 0.6), lambda: bass_note(r + 19, 0.6)),
                        0.55)
    else:
        BUS["sub"].add(bt(bar, 2.5), cached(("sub", r, 1.2), lambda: sub_tone(r, 1.2)), 0.7)


SNARE = None


def lofi_snare():
    s = snare_hit(0.9, seed=7)
    s = lowpass(np.concatenate([s, np.zeros(int(0.1 * SR), np.float32)]), 5200)
    return s * 1.1


def drums(bar, sec, rng):
    if sec in ("intro", "memory", "outro"):
        return
    last_bar_build = bar == 23
    kicks = {"verse": [0, 7, 10], "build": [0, 7, 10], "drop1": [0, 7, 10, 14], "evidence": [0, 10],
             "mechanism": [0], "drop2": [0, 7, 10, 14], "advice": [0, 7, 10]}[sec]
    if sec == "drop2" and bar % 2:
        kicks = [0, 3, 7, 10, 14]
    snares = [8] if sec == "mechanism" else [4, 12]
    if last_bar_build:
        kicks, snares = [0, 7], [4]
    if bar == 47:
        kicks, snares = [0], []
    depth = 0.6 if sec in ("drop1", "drop2") else 0.45
    for st in kicks:
        tk = swing_time(SONG, bar, st)
        BUS["kick"].add(tk, cached("kick", kick_lofi), 1.0)
        EVENTS.add("kick", tk)
        KICKS.append((tk, depth))
    for st in snares:
        ts = swing_time(SONG, bar, st)
        if sec in ("evidence", "mechanism"):
            BUS["snare"].add(ts, cached("rim", rim), 0.9)
        else:
            BUS["snare"].add(ts, cached("lsnare", lofi_snare), 0.85)
            if sec in ("drop1", "drop2", "advice"):
                BUS["clap"].add(ts + 0.006, cached("clap", clap), 0.7 if sec != "advice" else 0.45)
                EVENTS.add("clap", ts)
        EVENTS.add("snare", ts)
    # ghost snare before the backbeat now and then
    if sec in ("verse", "drop1", "drop2", "advice") and rng.uniform() < 0.5:
        BUS["snare"].add(swing_time(SONG, bar, 15), cached("lsnare", lofi_snare), 0.22)
    # hats: eighths plus swung ghost sixteenths
    steps = range(0, 16, 2) if sec in ("evidence", "mechanism") else range(16)
    if sec == "mechanism":
        steps = [0, 4, 8, 12]
    if sec == "build" and bar < 20:
        steps = range(0, 16, 2)
    for st in steps:
        if last_bar_build and st >= 8:
            break
        if bar == 47 and st >= 12:
            break
        vel = 0.75 if st % 4 == 0 else (0.55 if st % 2 == 0 else 0.28)
        vel *= 0.85 + 0.3 * rng.uniform()
        th = swing_time(SONG, bar, st)
        BUS["hat"].add(th, cached(("hat", st % 2), lambda: hat(False, seed=4 + st % 2)), vel, pan=0.25)
        if st % 4 == 0:
            EVENTS.add("hat", th)
    if sec in ("drop1", "drop2") and bar % 2 == 1:
        BUS["hat"].add(swing_time(SONG, bar, 14), cached("ohat", lambda: hat(True)), 0.45, pan=0.3)


def ticks():
    """The clock: tick-tock on quarters, racing ahead through the build and running down at the end."""
    times = []
    for bar in range(0, 16):
        times += [bt(bar, b) for b in range(4)]
    for bar in range(16, 20):
        times += [bt(bar, b) for b in range(4)]
    for bar in (20, 21):
        times += [bt(bar, b / 2) for b in range(8)]
    times += [bt(22, b / 4) for b in range(16)]
    times += [bt(23, b / 8) for b in range(16)]       # 32nds up to the tape stop
    for bar in range(32, 46):
        times += [bt(bar, b) for b in range(4)]
    times += [bt(46, b / 2) for b in range(8)]
    times += [bt(47, b / 4) for b in range(12)]
    for bar in (62, 63):
        times += [bt(bar, b) for b in range(4)]
    times += [bt(64, 0), bt(64, 2), bt(65, 0)]       # running down, then still
    for i, tk in enumerate(times):
        g = 0.55 if section(int(tk // BAR)) in ("verse", "evidence") else 0.85
        for a, b in ((bt(20), TAPE_STOP), (bt(46), bt(47, 3))):  # louder as it races
            if a <= tk < b:
                g = 0.75 + 0.45 * (tk - a) / (b - a)
        BUS["tick"].add(tk, cached(("tick", i % 2), lambda: tick(i % 2 == 0)), g, pan=0.15)
        EVENTS.add("tick", tk)


def melody(notes, bar0, part, octave=0, gain=1.0, vel=0.75, rng=None):
    for b, beat, m, beats in notes:
        tn = bt(bar0 + b, beat)
        m += octave
        if part == "bell":
            sig = cached(("mbox", m), lambda: fm_bell(m, 2.5, idx=1.6, ratio=3.0))
            BUS["bell"].add(tn, sig, gain, pan=0.2)
            EVENTS.add("bell", tn)
        else:
            d = beats * BEAT
            v = q(vel + 0.08 * (rng.uniform() if rng is not None else 0))
            sig = cached(("pn", m, q(d, 0.25), v), lambda: piano_note(m, q(d, 0.25), v, seed=m))
            BUS["piano"].add(tn, sig, gain)
            EVENTS.add("piano", tn)


def strings_part(bar, ch, sec):
    if sec not in ("memory", "drop1", "drop2", "advice", "outro"):
        return
    notes = [n + 12 for n in CHORDS[ch][1:4]] if sec in ("drop1", "drop2") else CHORDS[ch][1:4]
    br = 0.6 if sec in ("drop1", "drop2") else 0.3
    g = {"memory": 0.6, "drop1": 0.8, "drop2": 1.1, "advice": 0.6, "outro": 0.7}[sec]
    BUS["strings"].add(bt(bar), cached(("str", ch, sec), lambda: string_pad(notes, BAR, attack=0.6, bright=br,
                                                                             seed=stable_seed(ch, mod=97))), g)


def fx():
    BUS["alarm"].add(bt(4), alarm_beep(), 1.0)
    EVENTS.add("alarm", bt(4))
    BUS["fx"].add(bt(20), riser(TAPE_STOP - bt(20)), 0.55)
    EVENTS.add("riser", bt(20))
    BUS["fx"].add(bt(46), riser(bt(47, 3) - bt(46)), 0.55)
    EVENTS.add("riser", bt(46))
    for tc, g in ((bt(24), 0.9), (bt(48), 1.0), (bt(56), 0.5)):
        BUS["fx"].add(tc, cached("crash", crash), g)
        EVENTS.add("crash", tc)
    for td in (bt(24), bt(48)):
        BUS["fx"].add(td, cached("impact", impact), 0.3)
        EVENTS.add("drop", td)
    EVENTS.add("tapestop", TAPE_STOP)
    # calendar pages: intro flicks through the last days of the year, outro tears to Jan 1
    for k in range(6):
        tr = bt(3, k / 2)
        BUS["fx"].add(tr, rustle(0.28, seed=k), 0.5)
        EVENTS.add("rustle", tr)
    BUS["fx"].add(bt(62, 2), rustle(0.4, seed=9), 0.6)
    EVENTS.add("rustle", bt(62, 2))


def compose():
    rng = np.random.default_rng(stable_seed("time_flies"))
    for bar, ch in enumerate(PROG):
        sec = section(bar)
        keys_part(bar, ch, sec, rng)
        bass_part(bar, ch, sec)
        drums(bar, sec, rng)
        strings_part(bar, ch, sec)
    ticks()
    melody(Q_MOTIF, 2, "bell", gain=0.6)
    melody(MEM_MEL, 12, "bell", gain=0.8)
    melody(MEM_MEL, 40, "bell", -12, gain=0.6)
    melody(MEM_MEL, 44, "bell", gain=0.6)
    melody(HOOK, 24, "piano", vel=0.7, rng=rng)
    melody(HOOK, 48, "piano", vel=0.78, rng=rng)
    melody(HOOK, 48, "piano", 12, gain=0.45, vel=0.6, rng=rng)
    melody(HOOK[:14], 56, "bell", gain=0.55)
    for bar in range(32, 40, 2):  # evidence: sparse bells answering the keys
        melody([(0, 2, CHORDS[PROG[bar]][-1] + 12, 1), (1, 3, CHORDS[PROG[bar + 1]][-2] + 12, 1)], bar, "bell",
               gain=0.5)
    melody(A_MOTIF, 63, "bell", gain=0.65)
    fx()


LEVELS = {"keys": 0.85, "piano": 0.8, "bell": 0.45, "strings": 0.65, "bass": 0.5, "sub": 0.6, "kick": 0.95,
          "snare": 0.6, "clap": 0.45, "hat": 0.3, "tick": 0.35, "fx": 0.55, "alarm": 0.32}
DUCK = {"keys": 0.35, "strings": 0.45, "bass": 0.3, "piano": 0.15, "bell": 0.1}
ECHO = {"bell": (BEAT * 0.75, 0.38), "piano": (BEAT * 0.5, 0.22)}
VINYL = {"intro": 1.0, "verse": 0.45, "memory": 0.9, "build": 0.45, "drop1": 0.3, "evidence": 0.6,
         "mechanism": 0.9, "drop2": 0.3, "advice": 0.45, "outro": 1.0}
ENVS = [("drums", ("kick", "snare", "clap"), 0.0), ("kick", ("kick",), 0.88), ("keys", ("keys",), 0.0),
        ("piano", ("piano",), 0.0), ("bell", ("bell",), 0.9), ("pad", ("strings", "keys"), 0.0),
        ("tick", ("tick",), 0.85), ("hat", ("hat",), 0.8)]

if __name__ == "__main__":
    t0 = time.time()
    compose()
    mix, buses = mixdown(SONG, BUS, KICKS, LEVELS, DUCK, ECHO, ir=reverb_ir(2.6), silence=SILENT,
                         drive=1.15, fade_out=4.0, out_gain=0.85)
    mix = tape_stop(mix, TAPE_STOP, bt(23, 3) - TAPE_STOP)
    gate = np.ones(mix.shape[1], np.float32)
    for a, b in SILENT:  # kill the reverb tail too: true silence, only the crackle remains
        gate *= gate_silence(mix.shape[1], [(a, b)])
    mix = lowpass(tape_wow(mix * gate), 11500, order=1)
    # record crackle (and the reverse swell into each drop) bypass the silences
    n = mix.shape[1]
    lvl = np.zeros(n, np.float32)
    for name, a, b in SECTIONS:
        lvl[int(bt(a) * SR):int(bt(b) * SR)] = VINYL[name]
    lvl = np.convolve(lvl, np.ones(SR // 2) / (SR // 2), mode="same")
    post = vinyl(n) * lvl * 1.4
    for td in (bt(24), bt(48)):
        sw = reverse_swell(BEAT / 2)
        i = int((td - BEAT / 2) * SR)
        post[:, i:i + len(sw)] += sw * 0.5
    fo = int(3.0 * SR)
    post[:, n - fo:] *= np.linspace(1, 0, fo) ** 2
    mix = mix + post
    peak = np.abs(mix).max()
    if peak > 0.97:
        mix *= 0.97 / peak
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"{SONG.dur:.1f}s, {len(EVENTS['tick'])} ticks, {len(EVENTS['kick'])} kicks, "
          f"rendered in {time.time() - t0:.1f}s")
