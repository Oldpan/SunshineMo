"""Soundtrack for 《我不知道》 (pixel_theater, episode 2): hallucination, as a rainy-night detective story.

Noir chip jazz at 92 BPM: walking upright bass, brushes and ride, Rhodes comping on minor ninths
and an altered A7 in D minor; the two drops turn to F major (4536) with chip drums, strings and the
chip lead ("我不确定").  The series "hello" jingle opens the first window.

Sound design is part of the cut: every transition in cues.TRANS has its own sound landing on the
beat (whip -> whoosh into the cut, blinds -> slat ratchet, lens -> glassy swish + shutter, iris ->
aperture), typewriter captions type one key per sixteenth with a bell at the end, stamps thud on
the beat, lightning cracks into thunder, clue cards drop and their threads snap, evidence pins go in
one per beat.  The AI's next-word bars roll like a slot machine and ding on the pick.

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

# ---------------------------------------------------------------- harmony (D minor -> F major)
CHORDS = {  # rootless jazz voicings
    "Dm9": [53, 57, 60, 64], "Gm9": [53, 57, 58, 62], "Em7b5": [52, 55, 58, 62], "A7": [55, 58, 61, 64],
    "Bbmaj7": [57, 58, 62, 65], "C": [52, 55, 58, 62], "Am7": [52, 55, 57, 60], "Fmaj7": [53, 57, 60, 64],
}
ROOT = {"Dm9": 38, "Gm9": 43, "Em7b5": 40, "A7": 45, "Bbmaj7": 46, "C": 48, "Am7": 45, "Fmaj7": 41}
MINOR = {"Dm9", "Gm9", "Em7b5", "Am7"}
HK = ["Bbmaj7", "C", "Am7", "Dm9"]  # 4536 in F
PROG = (["Dm9", "Gm9", "Em7b5", "A7", "Dm9", "A7"]                 # quick
        + ["Dm9", "Gm9", "C", "Fmaj7", "Bbmaj7", "A7"]              # how
        + ["Dm9", "Gm9", "Em7b5", "A7", "Dm9", "A7"]                # paper
        + ["Dm9", "Bbmaj7", "Gm9", "A7", "Dm9", "A7"]               # fake
        + ["Bbmaj7", "C", "Am7", "Dm9", "Bbmaj7", "C"]              # learn
        + HK + HK                                                   # drop1
        + ["Dm9", "Bbmaj7", "Gm9", "A7", "Bbmaj7", "C"]             # turn
        + HK + HK + ["Bbmaj7", "C"]                                 # drop2
        + ["Fmaj7", "Am7", "Bbmaj7", "C", "Fmaj7", "Fmaj7", "Fmaj7", "Am7", "Bbmaj7", "C", "Fmaj7", "Fmaj7"])
assert len(PROG) == N_BARS, len(PROG)

BUS = make_buses(SONG, {
    "keys": 0.35, "arp": 0.25, "bass": 0.02, "lead": 0.22, "piano": 0.3, "vibes": 0.45, "strings": 0.35,
    "kick": 0.02, "snare": 0.12, "clap": 0.15, "ride": 0.12, "brush": 0.1, "tick": 0.08, "sfx": 0.16,
    "cut": 0.12, "fx": 0.3, "bed": 0.0,
})
EV_NAMES = ("kick", "snare", "clap", "hat", "ride", "tick", "chord", "bell", "lead", "crash", "riser", "tapestop",
            "drop", "hello", "pop", "type", "bell_end", "check", "roll", "pick", "ping", "err", "idea", "save", "load",
            "heart", "glint", "star", "whoosh", "blinds", "lens", "iris", "stamp", "thunder", "fall", "snap", "pin")
EVENTS = Events({k: [] for k in EV_NAMES})
KICKS = []  # (time, sidechain depth)

# melodies: (bar offset, beat, midi, beats)
Q_MOTIF = [(0, 0, 69, 0.5), (0, 0.5, 72, 0.5), (0, 1, 74, 1), (0, 2, 77, 1.5), (0, 3.5, 76, 0.5),
           (1, 0, 73, 2), (1, 2, 76, 2)]                               # over Em7b5 A7: "are you sure?"
A_MOTIF = [(0, 0, 72, 0.5), (0, 0.5, 76, 0.5), (0, 1, 79, 1), (0, 2, 76, 1), (0, 3, 77, 3)]  # home on F
HOOK = [  # "我不确定": 8 bars over Bb C Am Dm | Bb C Am Dm, syncopated
    (0, 0.5, 74, 0.5), (0, 1, 77, 0.5), (0, 1.5, 81, 1), (0, 2.5, 79, 0.5), (0, 3, 77, 1),
    (1, 0, 76, 1.5), (1, 1.5, 79, 0.5), (1, 2, 76, 1), (1, 3, 72, 1),
    (2, 0.5, 72, 0.5), (2, 1, 76, 0.5), (2, 1.5, 79, 1), (2, 2.5, 81, 0.5), (2, 3, 84, 1),
    (3, 0, 81, 2.5), (3, 2.5, 77, 0.5), (3, 3, 74, 1),
    (4, 0.5, 74, 0.5), (4, 1, 77, 0.5), (4, 1.5, 81, 1), (4, 2.5, 82, 0.5), (4, 3, 81, 1),
    (5, 0, 79, 1), (5, 1, 76, 1), (5, 2, 79, 1), (5, 3, 84, 1),
    (6, 0, 84, 1.5), (6, 1.5, 81, 0.5), (6, 2, 79, 1), (6, 3, 76, 1),
    (7, 0, 77, 3),
]
HELLO = [72, 77, 81, 84]  # the series "new window" jingle: C F A C, sixteenths
SWING8 = 0.64  # swung off-beat eighth (fraction of a beat)

VERSE = ("quick", "how", "paper")
DROPS = ("drop1", "drop2")


def q(v, step=0.05):
    return round(v / step) * step


def closing(tm):
    """Drums stop while an iris closes the picture to black."""
    return any(at(a) - 0.02 <= tm < at(a) + d + 0.1 for *a, d in K.IRIS_CLOSE[:2])


# ---------------------------------------------------------------- parts
def keys_part(bar, ch, sec):
    """Rhodes comping: Charleston (1, 2&) in the verses, long chords in the slow parts."""
    EVENTS.add("chord", bt(bar))
    notes = [n + 12 for n in CHORDS[ch]]
    if sec in VERSE + ("learn",) or (sec == "turn" and bar >= 40):
        hits = [(0, 1.3, 0.75), (1 + SWING8, 2.0, 0.6)]
        if bar % 2:
            hits.append((3 + SWING8, 0.6, 0.5))
    elif sec in DROPS:
        hits = [(0, 1.0, 0.6), (1 + SWING8, 0.5, 0.5), (2 + SWING8, 1.2, 0.55)]
    else:
        hits = [(0, 3.6, 0.6)]
    for beat, beats, vel in hits:
        if closing(bt(bar, beat)):
            continue
        for j, m in enumerate(notes):
            sig = cached(("ep", m, q(beats, 0.1), q(vel)), lambda: ep_key(m, beats * BEAT, vel))
            BUS["keys"].add(bt(bar, beat) + 0.008 * j, sig, 0.5, pan=-0.25 + 0.15 * j)


def walking(bar, ch):
    """Four quarter notes: root, third, fifth, a chromatic step into the next root."""
    r = ROOT[ch]
    nxt = ROOT[PROG[(bar + 1) % N_BARS]]
    third = 3 if ch in MINOR else 4
    while nxt - r > 6:
        nxt -= 12
    while r - nxt > 6:
        nxt += 12
    app = nxt - 1 if nxt >= r else nxt + 1
    line = [r, r + third, r + 7, app]
    return [m - 12 if m > 50 else m for m in line]


def bass_part(bar, ch, sec):
    r = ROOT[ch]
    if bar in (58, 59):
        return
    if sec == "fake" or (sec == "turn" and bar < 40) or sec == "outro":
        BUS["bass"].add(bt(bar), cached(("up", r, 2.4), lambda: upright(r, BAR * 0.9, 0.8)), 0.9)
        if sec != "outro":
            BUS["bass"].add(bt(bar, 2.5), cached(("up", r + 7, 0.6), lambda: upright(r + 7, BEAT, 0.6)), 0.6)
        return
    if sec in DROPS:  # pumping eighths an octave apart
        for k in range(8):
            beat = k / 2 + (SWING8 - 0.5 if k % 2 else 0)
            m = r + (12 if k in (3, 7) else 0)
            if bar in (29, 43) and beat >= 2.5:
                continue
            BUS["bass"].add(bt(bar, beat), cached(("up8", m), lambda: upright(m, BEAT * 0.45, 0.9)), 0.85)
        return
    for k, m in enumerate(walking(bar, ch)):
        tm = bt(bar, k)
        if closing(tm) or (bar in (29, 43) and k >= 3):
            continue
        BUS["bass"].add(tm, cached(("up", m, 0.6), lambda: upright(m, BEAT * 0.9)), 0.95 if k == 0 else 0.8)


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
    if sec == "fake" or (sec == "turn" and bar < 40) or (sec == "outro" and not 61 <= bar < 64) or bar < 1:
        return
    drop = sec in DROPS
    if drop:
        kicks = [0, 1.5 + SWING8 - 0.5, 2, 3 + SWING8] if bar % 2 == 0 else [0, 2, 2 + SWING8]
    elif sec == "learn" and bar < 27:
        kicks = [0]
    else:
        kicks = [0, 2]
    if bar in (29, 43):  # into the stop
        kicks = [0, 1.5]
    depth = 0.6 if drop else 0.3
    for beat in kicks:
        tk = bt(bar, beat)
        if closing(tk):
            continue
        BUS["kick"].add(tk, cached("kick", kick_both) if drop else cached("klo", kick_lofi), 1.0 if drop else 0.7)
        EVENTS.add("kick", tk)
        KICKS.append((tk, depth))
    for beat in (1, 3):
        ts = bt(bar, beat)
        if closing(ts) or (bar in (29, 43) and beat == 3):
            continue
        if drop:
            BUS["snare"].add(ts, cached("csn", chip_snare), 0.85)
            BUS["snare"].add(ts, cached(("btap", 0), lambda: brush_tap(1.0, 0)), 0.8)
            BUS["clap"].add(ts + 0.006, cached("clap", clap), 0.6)
            EVENTS.add("clap", ts)
        else:
            BUS["snare"].add(ts, cached(("btap", beat), lambda: brush_tap(0.9, beat)), 0.9)
        EVENTS.add("snare", ts)
    # brushes stirring under every bar (not in the drops' second half of 29/43)
    if not drop and not closing(bt(bar)) and bar not in (29, 43):
        BUS["brush"].add(bt(bar), cached(("sweep", bar % 2), lambda: brush_sweep(BAR, bar % 2)), 0.9, pan=0.2)
    # ride: ding, ding-da, ding, ding-da (swung)
    pattern = [0, 1, 1 + SWING8, 2, 3, 3 + SWING8]
    if drop:
        pattern = [b / 2 + (SWING8 - 0.5 if b % 2 else 0) for b in range(8)]
    for beat in pattern:
        tr = bt(bar, beat)
        if closing(tr) or (bar in (29, 43) and beat >= 2):
            continue
        accent = beat in (1, 3) or (drop and beat % 1 == 0)
        vel = (0.75 if accent else 0.45) * (0.85 + 0.3 * rng.uniform())
        BUS["ride"].add(tr, cached(("ride", accent), lambda: ride(1.0, int(accent))), vel, pan=0.3)
        if beat % 1 == 0:
            EVENTS.add("hat", tr)
            EVENTS.add("ride", tr)
    if bar in (28, 42):  # snare roll into the stops
        for i in range(8):
            BUS["snare"].add(bt(bar, 2 + i / 4), cached("csn", chip_snare), 0.25 + 0.5 * i / 8)
    if bar in (29, 43):
        for i in range(8):
            BUS["snare"].add(bt(bar, i / 4), cached("csn", chip_snare), 0.55 + 0.35 * i / 8)


def arp_part(bar, ch, sec):
    """The series' chip arpeggio: only in the build and the drops here."""
    if sec not in ("learn",) + DROPS or (sec == "learn" and bar < 27):
        return
    notes = CHORDS[ch] + [CHORDS[ch][0] + 12]
    rate = S16 if sec in DROPS else {27: S16, 28: S16 / 2, 29: S16 / 4}[bar]
    end = BAR if bar not in (29, 43) else 3 * BEAT
    sig = cached(("arp", ch, q(rate, 0.001), q(end, 0.01)), lambda: chip_arp([n + 12 for n in notes], end, rate,
                                                                           duty=0.125))
    BUS["arp"].add(bt(bar), sig, 0.45 if sec in DROPS else 0.55, pan=0.35)


def ticks():
    """The clock while 念念 is tempted to bluff, racing into the second silence."""
    times = []
    for bar in (39, 40, 41):
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
        if part == "vibes":
            BUS["vibes"].add(tn, cached(("vib", m), lambda: fm_bell(m, 2.2, idx=0.9, ratio=4.0)), gain, pan=0.2)
            EVENTS.add("bell", tn)
        elif part == "lead":
            sig = cached(("lead", m, q(d, 0.01), duty), lambda: chip_pulse(m, d * 0.92, duty=duty, vib=0.22,
                                                                         vib_delay=0.18, slide=-0.8))
            BUS["lead"].add(tn, sig, gain, pan=-0.1)
            EVENTS.add("lead", tn)
        else:
            v = q(vel)
            BUS["piano"].add(tn, cached(("pn", m, q(d, 0.25), v), lambda: piano_note(m, q(d, 0.25), v, seed=m)),
                             gain)


def strings_part(bar, ch, sec):
    if sec not in DROPS + ("turn", "outro", "fake"):
        return
    if (sec == "outro" and bar in (58, 59)) or (sec == "fake" and bar < 21):
        return
    notes = [n + 12 for n in CHORDS[ch][1:4]] if sec in DROPS else CHORDS[ch][:3]
    g = {"drop1": 0.8, "drop2": 1.15, "turn": 0.6, "outro": 0.55, "fake": 0.55}[sec]
    BUS["strings"].add(bt(bar), cached(("str", ch, sec), lambda: string_pad(notes, BAR, attack=0.5, bright=0.5,
                                                                             seed=stable_seed(ch, mod=97))), g)


# ---------------------------------------------------------------- the cut: one sound per transition
def cut_sounds():
    bus = BUS["cut"]

    def ev(name, tm, sig, g=1.0, pan=0.0):
        bus.add(max(0.0, tm), sig, g, pan)
        EVENTS.add(name, tm)

    for i, (b, beat, kind) in enumerate(K.TRANS):
        tc = bt(b, beat)
        if kind == "whip":
            d = 0.42
            ev("whoosh", tc - 0.8 * d, cached(("wh", i % 3), lambda: whoosh(d, 0.8, 400, 6000, seed=i % 3)), 0.7,
               pan=0.4 if i % 2 else -0.4)
        elif kind == "wipe":
            d = 0.5
            ev("whoosh", tc - 0.3 * d, cached(("wp", i % 2), lambda: whoosh(d, 0.6, 200, 2500, seed=10 + i % 2)), 0.55)
        elif kind == "blinds":
            ev("blinds", tc, cached(("bl", i % 2), lambda: shutter_ratchet(9, K.TIN["blinds"] / 10, seed=i % 2)),
               0.8)
        elif kind == "lens":
            ev("lens", tc - 0.25, cached("lensw", lambda: whoosh(0.5, 0.5, 1500, 9000, seed=20)), 0.45)
            ev("lens", tc, cached("lensc", lambda: chip_chime([91, 96, 103], 0.04)), 0.35)
            ev("lens", tc + K.TIN["lens"] - 0.1, cached("lensa", lambda: aperture(0.18, 3)), 0.5)
        elif kind == "iris":
            ev("iris", tc, cached("irisa", lambda: aperture(0.5 if b == 0 else 0.35, 1)), 0.6)
    for b, beat, d in K.IRIS_CLOSE:
        ev("iris", bt(b, beat), cached(("irc", q(d, 0.1)), lambda: aperture(d * 0.9, 2)), 0.55)


# ---------------------------------------------------------------- story sounds
POP = {"jin": 84, "nian": 79, "teacher": 72}
PAN = {"jin": -0.3, "nian": 0.3, "teacher": -0.15}


def story():
    sfx = BUS["sfx"]

    def ev(name, tm, sig, g=1.0, pan=0.0):
        sfx.add(tm, sig, g, pan)
        EVENTS.add(name, tm)

    def chats(lines):
        for item in lines:
            b, beat, who, text = item[:4]
            cps = item[4] if len(item) > 4 else 18.0
            tm = bt(b, beat)
            if text == "你好！我是今今。":
                ev("hello", tm, cached("hello", lambda: chip_jingle(HELLO, S16)), 0.85)
            else:
                ev("pop", tm, cached(("pop", who), lambda: chip_pop(POP[who])), 0.6, pan=PAN[who])
            if who == "nian":  # typing clicks while the line appears
                for k in range(min(len(text), 18)):
                    ev("type", tm + k / cps, cached(("tt", k % 5), lambda: key_click(k % 5)), 0.3, pan=0.3)

    for lines in (K.QUICK, K.HOW_ASK, K.PAPER, K.TEACHER_1, K.WHY, K.DROP1_CHAT, K.MONTAGE, K.TEACHER_2, K.ANSWER,
                  K.TEACHER_3, K.TOLD, K.FINAL):
        chats(lines)
    for i in K.CHECKS:
        b, beat = K.QUICK[i][:2]
        ev("check", bt(b, beat + 0.5), cached("check", lambda: chip_chime([84, 91], 0.05)), 0.45)
    for k, roll in enumerate((K.ROLL1, K.ROLL2, K.ROLL3, K.ROLL4, K.ROLL5)):
        t0 = at(roll)
        ev("roll", t0, cached(("roll", k), lambda: chip_roll(14, 0.04, seed=k)), 0.5)
        if k == 4:  # 念念 never picks
            continue
        flat = k >= 2  # nothing to go on: a hesitant, lower ding
        ev("pick", t0 + K.PICK_DELAY * BEAT, cached(("pick", flat), lambda: chip_chime([74, 76] if flat else
                                                                                      [86, 91], 0.06)), 0.6)
    ev("idea", at(K.AMAZED), cached("star", lambda: chip_chime([86, 90, 93, 98], 0.06)), 0.5)
    for s0 in (K.SEARCH1, K.SEARCH2):
        ev("ping", at(s0) + K.SEARCH_TYPE + K.SEARCH_WAIT, cached("ping", sonar_ping), 0.7)
    ev("err", at(K.NOT_FOUND) + 0.25, cached("err", chip_error), 0.6)
    ev("idea", at(K.IDEA), cached("idea", lambda: chip_chime([81, 86], 0.1, 0.25)), 0.7)
    ev("save", at(K.SAVED), cached("save", lambda: chip_chime([77, 81, 84], 0.08)), 0.6)

    def handwriting(b, beat, text, cps=10.0):
        for k in range(len(text)):
            ev("type", bt(b, beat) + k / cps, cached(("tt", k % 5), lambda: key_click(k % 5)), 0.3)

    for b, beat, text in K.NEW_MEMORY + [K.COPY, K.LAST_LINE]:
        handwriting(b, beat, text)
    for k in range(len(K.MONTAGE)):  # each new window: a quick search ping
        b, beat = K.MONTAGE[k][:2]
        ev("ping", bt(b, beat) + 0.1, cached("mping", lambda: sonar_ping(2200, 1, 0.1)), 0.35)
    b, beat = K.MONTAGE[K.HEART_FOR][:2]
    ev("heart", bt(b, beat + 1), cached("heart", lambda: chip_chime([88, 91, 96], 0.05)), 0.6)
    ev("idea", at(K.REMEMBER), cached("found", lambda: chip_chime([77, 81, 84, 89], 0.12)), 0.6)
    ev("glint", at(K.GLINT) + 0.5, cached("glint", lambda: chip_chime([96, 103], 0.04)), 0.5)
    # typewriter captions: one key per sixteenth, the carriage bell after the last
    for b, beat, text in K.TYPED:
        for k, ch in enumerate(text):
            if ch in " ，。":
                continue
            ev("type", bt(b, beat + k / 4), cached(("tk", k % 6), lambda: type_key(k % 6)), 0.55, pan=0.15)
        ev("bell_end", bt(b, beat + len(text) / 4 + 0.25), cached("tbell", type_bell), 0.5, pan=0.3)
    for b, beat, _ in K.STAMPS:
        ev("stamp", at((b, beat)), cached("stamp", stamp_thud), 1.0)
    for i, (b, beat) in enumerate(K.LIGHTNING):
        ev("thunder", at((b, beat)), cached(("thunder", i), lambda: thunder(4.0, i)), 0.9)
    for i, (b, beat) in enumerate(K.FALLS):
        ev("snap", at((b, beat)), cached(("snap", i), lambda: string_snap(i)), 0.6, pan=-0.3 + 0.2 * i)
        ev("fall", at((b, beat)) + 0.05, cached(("fall", i), lambda: rustle(0.35, i)), 0.6, pan=-0.3 + 0.2 * i)
    for i, (b, beat) in enumerate(K.PINS):
        ev("pin", at((b, beat)), cached(("pin", i % 3), lambda: pin_tick(i % 3)), 0.7, pan=-0.4 + 0.16 * i)
    for i in range(36, 38):  # stars on the evidence board
        for bb in range(4):
            ev("star", bt(i, bb + 0.5), cached(("star2", bb), lambda: chip_chime([84 + 2 * bb, 91 + 2 * bb], 0.05)),
               0.25)


def fx():
    BUS["fx"].add(bt(27, 2), riser(TAPE_STOP - bt(27, 2)), 0.5)
    EVENTS.add("riser", bt(27, 2))
    BUS["fx"].add(bt(42), riser(bt(43, 3) - bt(42)), 0.5)
    EVENTS.add("riser", bt(42))
    for tc, g in ((bt(30), 0.85), (bt(34), 0.5), (bt(44), 0.95), (bt(48), 0.8), (bt(52), 0.6)):
        BUS["fx"].add(tc, cached("crash", crash), g)
        EVENTS.add("crash", tc)
    for td in (bt(30), bt(44)):
        BUS["fx"].add(td, cached("impact", impact), 0.3)
        BUS["fx"].add(td - 1.2, cached("rev", lambda: reverse_swell(1.2)), 0.45)
        EVENTS.add("drop", td)
    EVENTS.add("tapestop", TAPE_STOP)
    n = SONG.n
    t = np.arange(n) / SR
    # rain on the window for most of the night, heavier on the night of the missing paper; stops at dawn
    heavy = np.clip((t - bt(18)) / 1.0, 0, 1) * np.clip((bt(25) - t) / 2.0, 0, 1)
    light = np.clip(t / 2.0, 0, 1) * np.clip((bt(54) - t) / 3.0, 0, 1)
    env = 0.35 * light + 0.65 * heavy
    rain_ = bandnoise(n, 1200, 9000, seed=62) * 0.035 * env * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * t))
    drips = np.zeros(n, np.float32)
    r = np.random.default_rng(63)
    for tm in r.uniform(0, bt(54), 260):
        i = int(tm * SR)
        d = (np.sin(2 * np.pi * r.uniform(1800, 3200) * np.arange(600) / SR) * np.exp(-np.arange(600) / 90)) * 0.05
        drips[i:i + 600] += d[:n - i] * env[min(i, n - 1)]
    vinyl_ = vinyl(n, seed=64, crackle=0.5, hiss=0.6)[0] * 0.6
    BUS["bed"].add(0, (rain_ + drips + vinyl_).astype(np.float32), 1.0)


def compose():
    rng = np.random.default_rng(stable_seed("wo_bu_zhi_dao"))
    for bar, ch in enumerate(PROG):
        sec = section(bar)
        keys_part(bar, ch, sec)
        bass_part(bar, ch, sec)
        drums(bar, sec, rng)
        arp_part(bar, ch, sec)
        strings_part(bar, ch, sec)
    ticks()
    melody(Q_MOTIF, 2, "vibes", gain=0.6)
    melody(Q_MOTIF, 14, "vibes", gain=0.45)                      # the same question, asked about the paper
    melody(Q_MOTIF, 20, "vibes", -12, gain=0.5)                  # ... and low, when it is not there
    melody(HOOK, 30, "lead", gain=0.9)
    melody(HOOK[:16], 38, "piano", gain=0.5, vel=0.45)           # the hook, remembered, on a soft piano
    melody(HOOK, 44, "lead", 12, gain=0.6, duty=0.125)
    melody(HOOK, 44, "piano", gain=0.6, vel=0.7)
    melody([(0, 0, 77, 2), (0, 2, 79, 2), (1, 0, 81, 2), (1, 2, 79, 2)], 52, "lead", 12, gain=0.5, duty=0.125)
    melody([(0, 2, 84, 1), (1, 0, 81, 1), (1, 2, 79, 2)], 54, "vibes", gain=0.45)
    melody(A_MOTIF, 60, "vibes", gain=0.7)                       # "答对啦" -- the answer, home on F
    melody(HOOK[:10], 62, "vibes", gain=0.4)
    cut_sounds()
    story()
    fx()


LEVELS = {"keys": 0.7, "arp": 0.38, "bass": 0.85, "lead": 0.62, "piano": 0.6, "vibes": 0.5, "strings": 0.6,
          "kick": 0.85, "snare": 0.55, "clap": 0.4, "ride": 0.3, "brush": 0.55, "tick": 0.32, "sfx": 0.62,
          "cut": 0.62, "fx": 0.5, "bed": 1.0}
DUCK = {"keys": 0.3, "arp": 0.3, "strings": 0.4, "bass": 0.25, "lead": 0.12}
ECHO = {"vibes": (BEAT * 0.75, 0.38), "lead": (BEAT * 0.75, 0.25), "piano": (BEAT * 0.5, 0.22)}
ENVS = [("drums", ("kick", "snare", "clap"), 0.0), ("kick", ("kick",), 0.88), ("pad", ("keys", "strings"), 0.0),
        ("lead", ("lead", "piano"), 0.0), ("bell", ("vibes",), 0.9), ("arp", ("arp",), 0.0),
        ("tick", ("tick",), 0.85), ("hat", ("ride",), 0.8), ("sfx", ("sfx", "cut"), 0.8)]

if __name__ == "__main__":
    t0 = time.time()
    compose()
    mix, buses = mixdown(SONG, BUS, KICKS, LEVELS, DUCK, ECHO, ir=reverb_ir(2.2), silence=SILENT,
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
    # in the second silence: only the clock, twice
    for k in range(2):
        tl = at(K.SILENT[1][0]) + k * BEAT / 2
        s = tick(k == 0) * 0.6
        i = int(tl * SR)
        mix[:, i:i + len(s)] += s
    peak = np.abs(mix).max()
    if peak > 0.97:
        mix *= 0.97 / peak
    export(OUT, SONG, mix, buses, EVENTS, envs=ENVS)
    loudness_report(mix, SONG)
    print(f"{SONG.dur:.1f}s, {len(EVENTS['kick'])} kicks, {len(EVENTS['pop'])} pops, "
          f"{len(EVENTS['whoosh']) + len(EVENTS['blinds']) + len(EVENTS['lens']) + len(EVENTS['iris'])} cut sounds, "
          f"rendered in {time.time() - t0:.1f}s")
