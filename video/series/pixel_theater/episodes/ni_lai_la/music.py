"""Soundtrack for 《你来啦》 (pixel_theater, episode 1): context windows and AI memory.

Chip lo-fi at 84 BPM in F major: console pulse/triangle/noise voices over swung lo-fi drums, string
pads in the two drops.  The same little "hello" jingle plays every time a new window opens, so the
forgetting becomes a running gag; the 4536 hook ("今今的歌") first sounds when the AI remembers.
Every story beat in cues.py also gets its sound: chat pops, typing, pixels breaking, the error when
the window is full, memory loading in the silence before each drop.

Output:
  out/music.wav  48 kHz stereo 16-bit
  out/sync.npz   event times + per-frame envelopes the renderer cuts to
"""
import sys
from pathlib import Path
import time

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
sys.path.insert(0, str(HERE))
from core.synth import *  # noqa: E402,F401,F403
import cues as K  # noqa: E402

SONG = Song(bpm=K.BPM, bars=K.BARS, fps=60, sections=K.SECTIONS)
BEAT, BAR, S16, N_BARS = SONG.beat, SONG.bar, SONG.s16, SONG.bars
bt, section = SONG.bt, SONG.section


def at(c):
    return bt(c[0], c[1])


TAPE_STOP = at(K.TAPE_STOP)
SILENT = [(at(a), at(b)) for a, b in K.SILENT]

# ---------------------------------------------------------------- harmony (F major)
CHORDS = {
    "Fmaj7": [53, 57, 60, 64], "Am7": [57, 60, 64, 67], "Bbmaj7": [58, 62, 65, 69], "C": [55, 60, 64, 67],
    "Dm7": [57, 60, 62, 65], "Gm7": [55, 58, 62, 65],
}
ROOT = {"Fmaj7": 41, "Am7": 45, "Bbmaj7": 46, "C": 48, "Dm7": 38, "Gm7": 43}
HK = ["Bbmaj7", "C", "Am7", "Dm7"]  # 4536
PROG = (["Fmaj7", "Fmaj7", "Fmaj7", "Am7", "Bbmaj7", "C"]           # meet
        + ["Dm7", "Bbmaj7", "Fmaj7", "C", "Dm7", "C"]               # forget
        + ["Dm7", "Gm7", "Bbmaj7", "C", "Dm7", "C"]                 # full
        + ["Bbmaj7", "C", "Am7", "Dm7", "Bbmaj7", "C"]              # memory
        + HK + HK                                                   # drop1
        + ["Fmaj7", "Am7", "Bbmaj7", "C", "Fmaj7", "C"]             # keep
        + HK + ["Bbmaj7", "C"]                                      # self
        + HK + HK + ["Bbmaj7", "C"]                                 # drop2
        + ["Fmaj7", "Am7", "Bbmaj7", "C", "Fmaj7", "Fmaj7", "Fmaj7", "Am7", "Bbmaj7", "C", "Fmaj7", "Fmaj7"])
assert len(PROG) == N_BARS, len(PROG)

BUS = make_buses(SONG, {
    "pad": 0.35, "arp": 0.25, "bass": 0.0, "lead": 0.22, "piano": 0.3, "bell": 0.45, "strings": 0.35,
    "kick": 0.02, "snare": 0.1, "clap": 0.15, "hat": 0.05, "tick": 0.08, "sfx": 0.18, "fx": 0.3, "bed": 0.0,
})
EV_NAMES = ("kick", "snare", "clap", "hat", "tick", "chord", "bell", "lead", "crash", "riser", "tapestop", "drop",
            "hello", "pop", "type", "shatter", "err", "idea", "save", "load", "on", "off", "strike", "star")
EVENTS = Events({k: [] for k in EV_NAMES})
KICKS = []  # (time, sidechain depth)

# melodies: (bar offset, beat, midi, beats)
Q_MOTIF = [(0, 0, 84, 0.5), (0, 0.5, 81, 0.5), (0, 1, 82, 1), (0, 2, 79, 2),
           (1, 0, 77, 0.5), (1, 0.5, 79, 0.5), (1, 1, 81, 1), (1, 2, 79, 2)]   # question: hangs on G
A_MOTIF = [(0, 0, 84, 0.5), (0, 0.5, 81, 0.5), (0, 1, 82, 1), (0, 2, 79, 1), (0, 3, 77, 3)]  # answer: home on F
HOOK = [  # "今今的歌": 8 bars over Bb C Am Dm | Bb C Am Dm
    (0, 0, 74, 1), (0, 1, 77, 0.5), (0, 1.5, 76, 0.5), (0, 2, 74, 1), (0, 3, 72, 1),
    (1, 0, 76, 1.5), (1, 1.5, 74, 0.5), (1, 2, 72, 1), (1, 3, 67, 1),
    (2, 0, 72, 1), (2, 1, 76, 1), (2, 2, 81, 1.5), (2, 3.5, 79, 0.5),
    (3, 0, 77, 2), (3, 2, 76, 1), (3, 3, 74, 1),
    (4, 0, 74, 1), (4, 1, 77, 0.5), (4, 1.5, 76, 0.5), (4, 2, 74, 1), (4, 3, 77, 1),
    (5, 0, 79, 1.5), (5, 1.5, 77, 0.5), (5, 2, 76, 1), (5, 3, 72, 1),
    (6, 0, 76, 1), (6, 1, 81, 1), (6, 2, 79, 1), (6, 3, 76, 1),
    (7, 0, 77, 3),
]
HELLO = [72, 77, 81, 84]  # the "new window" jingle: C F A C, sixteenths


def q(v, step=0.05):
    return round(v / step) * step


def muted(tm):
    """Drums stop while the picture is switched off between days."""
    return any(at(a) - 0.02 <= tm < at(a) + d + 0.15 for *a, d in K.POWER_OFF if a[0] not in K.QUIET_POWER)


# ---------------------------------------------------------------- parts
def pad_part(bar, ch, sec):
    notes = CHORDS[ch]
    EVENTS.add("chord", bt(bar))
    g = {"meet": 0.7, "forget": 0.5, "full": 0.85, "memory": 0.5, "drop1": 0.45, "keep": 0.5, "self": 0.8,
         "drop2": 0.45, "outro": 0.75}[sec]
    for j, m in enumerate(notes):
        sig = cached(("pad", m), lambda: lowpass(chip_pulse(m, BAR * 0.98, duty=0.5, vel=0.5, vib=0.08,
                                                            vib_delay=0.6), 2400))
        BUS["pad"].add(bt(bar) + 0.01 * j, sig, g * 0.55, pan=-0.3 + 0.2 * j)


def arp_part(bar, ch, sec):
    if (sec == "meet" and bar < 2) or sec == "full" or bar in (58, 59) or (sec == "self" and bar < 40):
        return
    notes = CHORDS[ch] + [CHORDS[ch][0] + 12]
    rate = S16
    if sec == "memory":
        rate = {21: S16, 22: S16 / 2, 23: S16 / 4}.get(bar, S16 * 2)
    if sec == "self" and bar >= 42:
        rate = S16 / 2 if bar == 42 else S16 / 4
    end = BAR if bar not in (23, 43) else 3 * BEAT
    g = {"meet": 0.55, "forget": 0.5, "memory": 0.6, "drop1": 0.55, "keep": 0.6, "self": 0.55, "drop2": 0.6,
         "outro": 0.55}[sec]
    sig = cached(("arp", ch, q(rate, 0.001), q(end, 0.01)), lambda: chip_arp([n + 12 for n in notes], end, rate,
                                                                           duty=0.125))
    BUS["arp"].add(bt(bar), sig, g, pan=0.35)


def bass_part(bar, ch, sec):
    r = ROOT[ch]
    if sec in ("meet",) and bar < 2 or bar in (58, 59):
        return
    if sec in ("full", "outro") or (sec == "self" and bar < 40):
        BUS["bass"].add(bt(bar), cached(("tri", r, 2.6), lambda: chip_tri(r, BAR * 0.9)), 0.8)
        return
    if sec == "meet":
        for b in (0, 2):
            BUS["bass"].add(bt(bar, b), cached(("tri", r, 1.3), lambda: chip_tri(r, BEAT * 1.8)), 0.8)
        return
    for st, m, d in ((0, r, 0.9), (6, r, 0.3), (8, r + 12, 0.45), (10, r, 0.6), (14, r + 7, 0.3)):
        tm = swing_time(SONG, bar, st)
        if muted(tm) or (bar in (23, 43) and st >= 10):
            continue
        BUS["bass"].add(tm, cached(("tri", m, d), lambda: chip_tri(m, BEAT * d * 1.6)), 0.9)


def chip_snare():
    s = chip_noise(0.22, hold=3, decay=0.07) * 1.1
    crack = chip_noise(0.05, hold=1, decay=0.01, short=True)
    s[:len(crack)] += crack * 0.4
    return s


def kick_both():
    k = chip_kick() * 0.65
    lo = kick_lofi()
    n = max(len(k), len(lo))
    out = np.zeros(n, np.float32)
    out[:len(k)] += k
    out[:len(lo)] += lo * 0.7
    return out


def drums(bar, sec, rng):
    if sec in ("meet", "full") or (sec == "self" and bar < 40) or (sec == "outro" and not 61 <= bar < 64):
        return
    if sec == "memory" and bar < 20:
        kicks, snares = [0, 8], []
    elif sec == "keep":
        kicks, snares = [0, 10], [4, 12]
    elif sec == "self":
        kicks, snares = [0], [8]
    elif sec == "outro":
        kicks, snares = [0], [12]
    else:
        kicks, snares = [0, 7, 10], [4, 12]
        if sec in ("drop1", "drop2"):
            kicks = [0, 7, 10, 14] if bar % 2 == 0 else [0, 3, 7, 10]
    if bar in (23, 43):  # into the stop: only the first half
        kicks, snares = [0, 7], [4]
    depth = 0.6 if sec in ("drop1", "drop2") else 0.4
    for st in kicks:
        tk = swing_time(SONG, bar, st)
        if muted(tk):
            continue
        BUS["kick"].add(tk, cached("kick", kick_both), 1.0)
        EVENTS.add("kick", tk)
        KICKS.append((tk, depth))
    for st in snares:
        ts = swing_time(SONG, bar, st)
        if muted(ts):
            continue
        if sec in ("keep", "outro", "self"):
            BUS["snare"].add(ts, cached("rim", rim), 0.8)
        else:
            BUS["snare"].add(ts, cached("csn", chip_snare), 0.9)
            if sec in ("drop1", "drop2"):
                BUS["clap"].add(ts + 0.006, cached("clap", clap), 0.65)
                EVENTS.add("clap", ts)
        EVENTS.add("snare", ts)
    steps = range(16) if sec in ("forget", "drop1", "drop2", "memory") else range(0, 16, 2)
    if sec == "self":
        steps = [0, 4, 8, 12]
    for st in steps:
        th = swing_time(SONG, bar, st)
        if muted(th) or (bar in (23, 43) and st >= 8):
            continue
        vel = (0.7 if st % 4 == 0 else (0.5 if st % 2 == 0 else 0.25)) * (0.85 + 0.3 * rng.uniform())
        BUS["hat"].add(th, cached(("hat", st % 2), lambda: chip_noise(0.05, hold=1, decay=0.012, short=st % 2 == 1)),
                       vel, pan=-0.2)
        if st % 4 == 0:
            EVENTS.add("hat", th)
    if sec in ("drop1", "drop2") and bar % 2 == 1:
        BUS["hat"].add(swing_time(SONG, bar, 14), cached("ohat", lambda: chip_noise(0.3, hold=1, decay=0.12)), 0.45)
    # snare roll into the stops
    if bar in (22, 42):
        for i in range(8):
            ts = bt(bar, 2 + i / 4)
            BUS["snare"].add(ts, cached("csn", chip_snare), 0.25 + 0.5 * i / 8)
    if bar in (23, 43):
        for i in range(8):
            ts = bt(bar, i / 4)
            BUS["snare"].add(ts, cached("csn", chip_snare), 0.55 + 0.35 * i / 8)


def ticks():
    """A clock on the lonely nights, racing in the build before the second stop."""
    times = []
    for bar in range(12, 18):
        times += [bt(bar, b) for b in range(4) if not (bar == 15 and b >= 2)]
    for bar in (38, 39, 40, 41):
        times += [bt(bar, b) for b in range(4)]
    times += [bt(42, b / 2) for b in range(8)]
    times += [bt(43, b / 4) for b in range(12)]
    for i, tk in enumerate(times):
        g = 0.75 + (0.4 * (tk - bt(42)) / BAR if tk >= bt(42) else 0)
        BUS["tick"].add(tk, cached(("tick", i % 2), lambda: tick(i % 2 == 0)), g, pan=0.15)
        EVENTS.add("tick", tk)


def melody(notes, bar0, part, octave=0, gain=1.0, vel=0.75, duty=0.25):
    for b, beat, m, beats in notes:
        tn = bt(bar0 + b, beat)
        m += octave
        d = beats * BEAT
        if part == "bell":
            BUS["bell"].add(tn, cached(("bell", m), lambda: fm_bell(m, 2.5, idx=1.6, ratio=3.0)), gain, pan=0.2)
            EVENTS.add("bell", tn)
        elif part == "lead":
            sig = cached(("lead", m, q(d, 0.01), duty), lambda: chip_pulse(m, d * 0.92, duty=duty, vib=0.18,
                                                                         vib_delay=0.22, slide=-0.6))
            BUS["lead"].add(tn, sig, gain, pan=-0.1)
            EVENTS.add("lead", tn)
        else:
            v = q(vel)
            BUS["piano"].add(tn, cached(("pn", m, q(d, 0.25), v), lambda: piano_note(m, q(d, 0.25), v, seed=m)),
                             gain)


def strings_part(bar, ch, sec):
    if sec not in ("drop1", "drop2", "self", "outro"):
        return
    if sec == "outro" and bar in (58, 59):
        return
    notes = [n + 12 for n in CHORDS[ch][1:4]] if sec in ("drop1", "drop2") else CHORDS[ch][:3]
    g = {"drop1": 0.8, "drop2": 1.15, "self": 0.6, "outro": 0.55}[sec]
    BUS["strings"].add(bt(bar), cached(("str", ch, sec), lambda: string_pad(notes, BAR, attack=0.5, bright=0.5,
                                                                             seed=stable_seed(ch, mod=97))), g)


# ---------------------------------------------------------------- story sounds
def strike_snd(seed):
    return chip_noise(0.16, hold=2, decay=0.05, vel=0.8, offset=seed * 31)


def story():
    sfx = BUS["sfx"]

    def ev(name, tm, sig, g=1.0, pan=0.0):
        sfx.add(tm, sig, g, pan)
        EVENTS.add(name, tm)

    for b, beat, d in K.POWER_ON:
        if b not in K.QUIET_POWER:
            ev("on", bt(b, beat), cached("on", lambda: crt_power_sound(True)), 0.7)
    for b, beat, d in K.POWER_OFF:
        ev("off", bt(b, beat), cached("off", lambda: crt_power_sound(False)), 0.8)

    def chats(lines):
        for item in lines:
            b, beat, who, text = item[:4]
            cps = item[4] if len(item) > 4 else 18.0
            tm = bt(b, beat)
            if text == "你好！我是今今。":
                ev("hello", tm, cached("hello", lambda: chip_jingle(HELLO, S16)), 0.85)
            else:
                ev("pop", tm, cached(("pop", who), lambda: chip_pop(84 if who == "jin" else 79)), 0.6, pan=0.3 if who == "nian" else -0.3)
            if who == "nian":  # typing clicks while the line appears
                for k in range(min(len(text), 18)):
                    ev("type", tm + k / cps, cached(("tt", k % 5), lambda: key_click(k % 5)), 0.35, pan=0.3)

    for lines in (K.MEET, K.DAY2, K.DAY3, K.LATE, K.DROP1_CHAT, K.MONTAGE1, K.SELF, K.DROP2_CHAT):
        chats(lines)
    chats([(*K.DAY4_HELLO, "jin", "你好！我是今今。"), K.PASSED, K.KNOWS, K.REPLY])
    ev("star", at(K.STAR_GIFT), cached("star", lambda: chip_chime([84, 88, 91, 96], 0.06)), 0.6)
    ev("shatter", at(K.YESTERDAY_GONE), cached("shatter", pixel_burst), 0.8)
    ev("err", at(K.OVERFLOW), cached("err", chip_error), 0.8)
    for i, tm in K.PUSHED_OUT.items():
        ev("shatter", at(tm), cached("shatter", pixel_burst), 0.7)
    ev("idea", at(K.IDEA), cached("idea", lambda: chip_chime([79, 84], 0.1, 0.25)), 0.7)
    ev("save", at(K.SAVED), cached("save", lambda: chip_chime([77, 81, 84], 0.08)), 0.6)

    def handwriting(b, beat, text, cps=10.0):
        for k in range(len(text)):
            ev("type", bt(b, beat) + k / cps, cached(("tt", k % 5), lambda: key_click(k % 5)), 0.3)

    for b, beat, text in K.MEMORY_DAY1 + K.MEMORY_MORE + [K.FIRST_LINE, K.LAST_LINE]:
        handwriting(b, beat, text, 24.0 if (b, beat, text) in K.MEMORY_MORE else 10.0)
    for i, (b, beat, _) in enumerate(K.STRIKES):
        ev("strike", bt(b, beat), cached(("strike", i), lambda: strike_snd(i)), 0.7)
    ev("star", at(K.TO_TOP), cached("star", lambda: chip_chime([84, 88, 91, 96], 0.06)), 0.5)
    ev("idea", at(K.FOUND), cached("found", lambda: chip_chime([77, 81, 84, 89], 0.12)), 0.6)
    ev("load", at(K.FINAL_LOAD), cached("load", lambda: chip_chime([72, 76, 79, 84], 0.25, 0.5)), 0.4)
    for k in range(10):  # montage: a quick memory load on every new window
        if k < 5:
            b, beat = K.MONTAGE1[k][:2]
            ev("load", bt(b, beat) - 0.12, cached(("mload",), lambda: chip_chime([84, 91], 0.04, 0.5)), 0.35)
    for i in range(30, 32):
        for bb in range(4):
            ev("star", bt(i, bb), cached(("star2", bb), lambda: chip_chime([84 + 2 * bb, 91 + 2 * bb], 0.05)), 0.35)


def fx():
    BUS["fx"].add(bt(21, 2), riser(TAPE_STOP - bt(21, 2)), 0.5)
    EVENTS.add("riser", bt(21, 2))
    BUS["fx"].add(bt(42), riser(bt(43, 3) - bt(42)), 0.5)
    EVENTS.add("riser", bt(42))
    for tc, g in ((bt(24), 0.85), (bt(28), 0.6), (bt(44), 0.95), (bt(48), 0.9), (bt(52), 0.6)):
        BUS["fx"].add(tc, cached("crash", crash), g)
        EVENTS.add("crash", tc)
    for td in (bt(24), bt(44)):
        BUS["fx"].add(td, cached("impact", impact), 0.25)
        EVENTS.add("drop", td)
    EVENTS.add("tapestop", TAPE_STOP)
    # a low CRT hum + hiss bed under everything (cut by the silences)
    n = SONG.n
    t = np.arange(n) / SR
    hum = (np.sin(2 * np.pi * 50 * t) * 0.6 + np.sin(2 * np.pi * 100 * t) * 0.25) * 0.004
    BUS["bed"].add(0, (hum + bandnoise(n, 4000, 12000, seed=61) * 0.002).astype(np.float32), 1.0)


def compose():
    rng = np.random.default_rng(stable_seed("ni_lai_la"))
    for bar, ch in enumerate(PROG):
        sec = section(bar)
        pad_part(bar, ch, sec)
        arp_part(bar, ch, sec)
        bass_part(bar, ch, sec)
        drums(bar, sec, rng)
        strings_part(bar, ch, sec)
    ticks()
    melody(Q_MOTIF, 0, "bell", gain=0.6)
    melody(HOOK, 24, "lead", gain=0.9)
    melody(HOOK[:16], 38, "piano", gain=0.55, vel=0.5)          # the hook, remembered, on a soft piano
    melody(HOOK, 44, "lead", 12, gain=0.65, duty=0.125)
    melody(HOOK, 44, "piano", gain=0.6, vel=0.7)
    melody([(0, 0, 77, 2), (0, 2, 79, 2), (1, 0, 81, 2), (1, 2, 79, 2)], 52, "lead", 12, gain=0.55, duty=0.125)
    melody([(0, 2, 84, 1), (1, 0, 81, 1), (1, 2, 79, 2)], 54, "bell", gain=0.45)
    melody(A_MOTIF, 60, "bell", gain=0.7)                       # "你来啦" -- the answer, at last on F
    melody(HOOK[:9], 62, "bell", gain=0.4)
    story()
    fx()


LEVELS = {"pad": 0.6, "arp": 0.42, "bass": 0.75, "lead": 0.62, "piano": 0.6, "bell": 0.45, "strings": 0.6,
          "kick": 0.9, "snare": 0.5, "clap": 0.42, "hat": 0.32, "tick": 0.32, "sfx": 0.62, "fx": 0.5, "bed": 1.0}
DUCK = {"pad": 0.35, "arp": 0.3, "strings": 0.4, "bass": 0.3, "lead": 0.12}
ECHO = {"bell": (BEAT * 0.75, 0.38), "lead": (BEAT * 0.75, 0.25), "piano": (BEAT * 0.5, 0.22)}
ENVS = [("drums", ("kick", "snare", "clap"), 0.0), ("kick", ("kick",), 0.88), ("pad", ("pad", "strings"), 0.0),
        ("lead", ("lead", "piano"), 0.0), ("bell", ("bell",), 0.9), ("arp", ("arp",), 0.0),
        ("tick", ("tick",), 0.85), ("hat", ("hat",), 0.8), ("sfx", ("sfx",), 0.8)]

if __name__ == "__main__":
    t0 = time.time()
    compose()
    mix, buses = mixdown(SONG, BUS, KICKS, LEVELS, DUCK, ECHO, ir=reverb_ir(2.4), silence=SILENT,
                         drive=1.15, fade_out=3.5, out_gain=0.85)
    mix = tape_stop(mix, TAPE_STOP, at(K.SILENT[0][0]) - TAPE_STOP)
    gate = np.ones(mix.shape[1], np.float32)
    for a, b in SILENT:  # true silence: the reverb tails go too
        gate *= gate_silence(mix.shape[1], [(a, b)])
    mix = lowpass(mix * gate, 14000, order=1)
    # in the first silence the memory loads: four rising blips that bypass the gate
    for k in range(4):
        tl = at(K.LOADING) + k * BEAT / 4
        s = chip_pulse(72 + 3 * k, 0.05, duty=0.5, vel=0.35, decay=0.04)
        i = int(tl * SR)
        mix[:, i:i + len(s)] += s * 0.5
        EVENTS.add("load", tl)
    peak = np.abs(mix).max()
    if peak > 0.97:
        mix *= 0.97 / peak
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"{SONG.dur:.1f}s, {len(EVENTS['kick'])} kicks, {len(EVENTS['pop'])} pops, "
          f"rendered in {time.time() - t0:.1f}s")
