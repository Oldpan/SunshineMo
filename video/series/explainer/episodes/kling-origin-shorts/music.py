"""8-bit score + game sounds for the vertical 「为什么 AI 视频里的人，经常一动不动」 (pixel game levels).

    /usr/local/bin/python3 music.py        # reads build/timeline.json, writes build/music/music.wav + hits.wav

Order: build_timeline.py → music.py → build_timeline.py (script.yaml meta.bgm = music.wav, and one meta.sfx entry
puts hits.wav at hook:0, so every game sound lands on its frame and is not ducked under the voice).
Everything is synthesised with video/core/synth.py console voices (pulse arps, stepped triangle bass, LFSR noise
drums; no samples). C major, 120 BPM, a bar grid that restarts at each scene:
  hook   bouncy level groove; when 鲸鱼娘 freezes it drops to one held note, comes back when the report opens
  jobs   level-select: arps + bass, drums from the job list on
  cap    LEVEL 1 theme with a little lead line          cup  same theme up a step, lead answers
  judge  A minor, thin while she stands still, full groove when she dances, calm under the accuracy bars
  outro  the theme once more, then the STAGE CLEAR jingle and a last chord
Game sounds (hits.wav) are placed from the same cue words the scenes animate on (see scenes/*.tsx).
"""
import json
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(next(p for p in HERE.parents if (p / "core").is_dir())))  # video/
from core.synth import *  # noqa: E402,F401,F403

TL = json.load(open(HERE / "build" / "timeline.json"))
FPS = TL["fps"]
SC = {s["id"]: s for s in TL["scenes"]}
IDS = [s["id"] for s in TL["scenes"]]
LENGTH = TL["durationInFrames"] / FPS + 1.0

BPM = 120
SONG = Song(bpm=BPM, bars=int(np.ceil(LENGTH / (240 / BPM))) + 1, fps=FPS)
SONG.dur, SONG.n = LENGTH, int(LENGTH * SR)
BEAT, BAR = SONG.beat, SONG.bar


def F(sid, frame):
    """seconds of a scene-relative frame"""
    return (SC[sid]["from"] + frame) / FPS


def B(sid, i, off=0):
    return F(sid, SC[sid]["beats"][i]["from"] + off)


def AT(sid, i, word, off=0):
    """same cue as useT().at(i, word) in scenes/common.tsx"""
    bt = SC[sid]["beats"][i]
    k = max(0, bt["text"].find(word))
    return F(sid, round(bt["from"] + bt["duration"] * k / max(1, len(bt["text"]))) + off)


SEC = {sid: (F(sid, 0), F(IDS[i + 1], 0) if i + 1 < len(IDS) else LENGTH) for i, sid in enumerate(IDS)}

CH = {"C": [60, 64, 67], "Am": [57, 60, 64], "F": [57, 60, 65], "G": [59, 62, 67], "Em": [59, 64, 67], "Dm": [57, 62, 65], "D": [57, 62, 66]}
ROOT = {"C": 48, "Am": 45, "F": 41, "G": 43, "Em": 40, "Dm": 38, "D": 38}
MAJ = ["C", "Am", "F", "G"]
MAJ2 = ["F", "G", "Em", "Am"]
MIN = ["Am", "F", "C", "G"]

BUS = make_buses(SONG, {"chip": 0.18, "lead": 0.25, "bass": 0.0, "kick": 0.0, "snare": 0.08, "hat": 0.0, "pad": 0.3})
KICKS = []
HITS = np.zeros(int((LENGTH + 2) * SR), np.float32)


def add(bus, t, sig, gain=1.0, pan=0.0, lim=None):
    """add unless t is outside [a, b) of lim"""
    if lim is not None and not (lim[0] <= t < lim[1] - 0.02):
        return
    BUS[bus].add(t, sig, gain, pan)


def hit(t, sig, gain=1.0):
    i = int(round(t * SR))
    if 0 <= i < len(HITS):
        n = min(len(sig), len(HITS) - i)
        HITS[i:i + n] += gain * sig[:n]


def bars(a, b):
    i = 0
    while a + i * BAR < b - 0.05:
        yield i, a + i * BAR
        i += 1


def at(t0, beat):
    return t0 + beat * BEAT


# ---------------------------------------------------------------- instruments on the grid
def arp_bar(t0, ch, lim, vel=0.32, up=12, dur=None):
    notes = [m + up for m in CH[ch]]
    d = min(dur or BAR * 0.97, lim[1] - t0)
    if d > 0.05:
        add("chip", t0, cached(("arp", ch, up, round(d, 2), vel), lambda: chip_arp(notes, d, rate=0.0625, duty=0.125, vel=vel)), 1.0, pan=-0.15, lim=lim)


def bass_bar(t0, ch, lim, pattern=(0, 0, 7, 0, 12, 0, 7, 0)):
    r = ROOT[ch] + (12 if ROOT[ch] < 43 else 0)
    for k, iv in enumerate(pattern):
        if iv is None:
            continue
        m = r + iv
        add("bass", at(t0, k / 2), cached(("tri", m), lambda: chip_tri(m, BEAT * 0.42, 0.9)), 1.0, lim=lim)


def drums_bar(t0, lim, kick=True, snare=True, hats=8, vel=1.0):
    if kick:
        for bt in (0, 2):
            tk = at(t0, bt)
            if lim[0] <= tk < lim[1] - 0.02:
                add("kick", tk, cached("ck", lambda: chip_kick(0.8)), vel)
                KICKS.append((tk, 0.35 * vel))
    if snare:
        for bt in (1, 3):
            add("snare", at(t0, bt), cached("cs", lambda: chip_noise(0.16, hold=10, decay=0.07, vel=0.9)), vel, lim=lim)
    for k in range(hats):
        add("hat", at(t0, k * 4 / hats), cached(("ch", k % 2), lambda: chip_noise(0.05, hold=2, decay=0.018, short=k % 2 == 1, vel=0.8)), (0.6 if k % 2 == 0 else 0.4) * vel, pan=0.2, lim=lim)


MOTIF = [(0, 72, 0.5), (0.5, 76, 0.5), (1, 79, 1.0), (2.5, 76, 0.5), (3, 74, 1.0)]  # beat, note, length (beats)
ANSWER = [(0, 77, 0.5), (0.5, 76, 0.5), (1, 74, 0.5), (1.5, 72, 0.5), (2, 71, 1.5)]


def lead(t0, phrase, lim, shift=0, vel=0.32):
    for bt, m, ln in phrase:
        mm = m + shift
        add("lead", at(t0, bt), cached(("ld", mm, ln, vel), lambda: chip_pulse(mm, ln * BEAT * 0.9, duty=0.25, vel=vel, vib=0.15, vib_delay=0.18, decay=0.35)), 1.0, pan=0.15, lim=lim)


def held(t0, m, dur, vel=0.22):
    add("pad", t0, chip_pulse(m, dur, duty=0.5, vel=vel, vib=0.25, vib_delay=0.3), 1.0)


def compose():
    # ---------------------------------------------------------------- hook
    a, b = SEC["hook"]
    freeze, resume = B("hook", 2), B("hook", 3)
    for i, t0 in bars(a, freeze):
        ch = MAJ[i % 4]
        arp_bar(t0, ch, (a, freeze))
        bass_bar(t0, ch, (a, freeze))
        drums_bar(t0, (a, freeze), snare=i > 0)
    held(freeze, 67, resume - freeze + 0.05, 0.2)  # everything stops but one wobbly note
    add("bass", freeze, chip_tri(48, resume - freeze - 0.1, 0.6))
    for i, t0 in bars(resume, b):
        ch = ["Am", "F"][i % 2]
        arp_bar(t0, ch, (resume, b), up=0)
        bass_bar(t0, ch, (resume, b), pattern=(0, None, 0, None, 7, None, 0, None))
        drums_bar(t0, (resume, b), snare=False, hats=4, vel=0.8)

    # ---------------------------------------------------------------- jobs: level select
    a, b = SEC["jobs"]
    dr = B("jobs", 4)
    for i, t0 in bars(a, b):
        ch = MAJ2[i % 4]
        arp_bar(t0, ch, (a, b), vel=0.3)
        bass_bar(t0, ch, (a, b), pattern=(0, None, 12, None, 7, None, 12, None) if t0 < dr else (0, 0, 7, 0, 12, 0, 7, 0))
        drums_bar(t0, (a, b), kick=t0 >= dr - 0.01, snare=t0 >= dr - 0.01, hats=4 if t0 < dr else 8, vel=0.8)

    # ---------------------------------------------------------------- cap / cup: the level theme
    for sid, shift in (("cap", 0), ("cup", 5)):  # cup: the lead answers a fourth higher
        a, b = SEC[sid]
        prog = MAJ
        for i, t0 in bars(a, b):
            ch = prog[i % 4]
            arp_bar(t0, ch, (a, b))
            bass_bar(t0, ch, (a, b))
            drums_bar(t0, (a, b))
            if i % 4 == 0:
                lead(t0, MOTIF, (a, b), shift=shift)
            elif i % 4 == 2:
                lead(t0, ANSWER, (a, b), shift=shift)

    # ---------------------------------------------------------------- judge
    # each change (trap, dance, accuracy bars) starts its own bar grid, so the music turns on the event and never gaps
    a, b = SEC["judge"]
    trap, dance_on, calm = B("judge", 2), B("judge", 4), B("judge", 6)
    for s0, s1, kind in ((a, trap, "play"), (trap, dance_on, "still"), (dance_on, calm, "dance"), (calm, b, "calm")):
        lim = (s0, s1)
        for i, t0 in bars(s0, s1):
            ch = MIN[i % 4]
            if kind in ("play", "dance"):
                arp_bar(t0, ch, lim)
                bass_bar(t0, ch, lim)
                drums_bar(t0, lim, hats=16 if kind == "dance" else 8, vel=0.9)
                if kind == "dance" and i % 2 == 0:
                    lead(t0, MOTIF, lim, shift=-3)
            elif kind == "still":  # she stands still: a thin arp and a bass pulse
                bass_bar(t0, ch, lim, pattern=(0, None, None, None, 0, None, None, None))
                arp_bar(t0, ch, lim, vel=0.16, up=0)
            else:  # accuracy bars: soft
                arp_bar(t0, ch, lim, vel=0.24, up=0)
                bass_bar(t0, ch, lim, pattern=(0, None, 7, None, 12, None, 7, None))
                drums_bar(t0, lim, kick=False, snare=False, hats=4, vel=0.6)

    # ---------------------------------------------------------------- outro
    a, b = SEC["outro"]
    clear = B("outro", 2)
    for i, t0 in bars(a, clear):
        ch = MAJ[i % 4]
        arp_bar(t0, ch, (a, clear))
        bass_bar(t0, ch, (a, clear))
        drums_bar(t0, (a, clear), vel=0.8)
    end = b
    for j, m in enumerate([60, 64, 67, 72]):  # last chord rings under the sign-off and the STAGE CLEAR jingle
        add("pad", clear + 0.02 * j, chip_pulse(m, end - clear, duty=0.25, vel=0.14, vib=0.12, decay=2.6), 1.0)
    add("bass", clear, chip_tri(48, 2.4, 0.8))
    arp_bar(clear, "C", (clear, end), vel=0.12, up=12, dur=end - clear)


# ---------------------------------------------------------------- game sounds
def sounds():
    err = cached("err", chip_error)
    pop = lambda m=84: cached(("pop", m), lambda: chip_pop(m))  # noqa: E731
    chime = lambda ns=(84, 88, 91): cached(("chime", ns), lambda: chip_chime(list(ns)))  # noqa: E731
    jingle = lambda ns, step=0.07, last=0.6: cached(("jg", ns, step, last), lambda: chip_jingle(list(ns), step, last=last))  # noqa: E731
    roll = lambda lo, hi, n=10: cached(("roll", lo, hi, n), lambda: chip_roll(n, 0.03, lo, hi))  # noqa: E731
    burst = cached("burst", pixel_burst)
    click = [key_click(s) for s in range(6)]
    snare = cached("hitnoise", lambda: chip_noise(0.2, hold=6, decay=0.08, vel=1.0))

    def wipe(sid):  # block wipe into a scene
        hit(F(sid, 0), burst, 0.35)

    # hook
    hit(F("hook", 0), chime((72, 76, 79, 84)), 0.6)
    for e in (20, 42, 64):
        hit(B("hook", 0, e), err, 0.55)
    for k in range(3):
        hit(B("hook", 2, 4 + 6 * k), pop(84 + 2 * k), 0.5)
    hit(B("hook", 2, 30), chime((79, 84, 88)), 0.6)
    hit(B("hook", 3), jingle((67, 72, 76), 0.06), 0.45)
    hit(B("hook", 3, 40), roll(72, 48, 8), 0.5)
    hit(B("hook", 3, 50), pop(76), 0.5)
    # jobs
    wipe("jobs")
    hit(B("jobs", 0, 6), pop(), 0.45)
    for k in range(5):
        hit(B("jobs", 0, 16 + 4 * k), pop(88 + k), 0.3)
    hit(B("jobs", 0, 44), chime(), 0.5)
    hit(B("jobs", 1), pop(), 0.45)
    for w in ("动作", "镜头", "人物"):
        hit(AT("jobs", 2, w), pop(81), 0.45)
    hit(B("jobs", 3), jingle((60, 67, 72, 79), 0.06), 0.5)
    hit(B("jobs", 4), roll(76, 96, 12), 0.45)
    for w in ("写说明书", "改写", "当翻译", "当评委", "当考官"):
        hit(AT("jobs", 5, w), pop(84), 0.45)
    for k in range(3):
        hit(B("jobs", 5, 138 + 3 * k), chime((88, 91)), 0.4)
    # cap
    wipe("cap")
    hit(B("cap", 0), jingle((60, 64, 67, 72), 0.07), 0.5)
    hit(B("cap", 1), pop(), 0.4)
    hit(B("cap", 1, 12), pop(81), 0.4)
    hit(B("cap", 2), err, 0.5)
    hit(B("cap", 2, 20), pop(79), 0.4)
    hit(B("cap", 3), jingle((64, 67, 72), 0.06), 0.45)
    hit(AT("cap", 4, "一份"), pop(), 0.4)
    hit(AT("cap", 4, "慢慢淡出"), snare, 0.55)
    hit(AT("cap", 4, "慢慢淡出", 10), err, 0.5)
    hit(B("cap", 5), err, 0.5)
    hit(B("cap", 6), pop(), 0.4)
    for k in range(3):
        hit(B("cap", 6, 56 + 5 * k), pop(88 + 3 * k), 0.45)
    # cup
    wipe("cup")
    hit(B("cup", 0), jingle((62, 66, 69, 74), 0.07), 0.5)
    for k in range(5):
        hit(B("cup", 1, 4) + k / 14, click[k], 0.6)
    hit(B("cup", 1, 30), pop(), 0.4)
    hit(AT("cup", 1, "还得合理"), chime((79, 84)), 0.5)
    hit(B("cup", 2), pop(), 0.4)
    for w in ("把杯子", "走向门口", "一边开门"):
        hit(AT("cup", 3, w), pop(81), 0.4)
    hit(B("cup", 3, 26), pop(72), 0.4)  # cup down on the table
    hit(B("cup", 3, 76), snare, 0.35)  # door
    hit(B("cup", 4, 2), pop(88), 0.45)
    hit(B("cup", 4, 6), err, 0.45)
    hit(B("cup", 6, 6), chime((84, 91)), 0.5)
    hit(B("cup", 6, 8), err, 0.45)
    hit(B("cup", 7, 8), roll(96, 72, 8), 0.45)
    hit(B("cup", 7, 14), pop(88), 0.45)
    hit(B("cup", 7, 16), err, 0.45)
    hit(B("cup", 8), pop(), 0.4)
    hit(B("cup", 8, 20), roll(60, 80, 10), 0.4)
    hit(B("cup", 9, 4), roll(64, 91, 14), 0.45)
    hit(B("cup", 9, 32), jingle((72, 76, 79, 84), 0.07, 0.8), 0.55)
    # judge
    wipe("judge")
    hit(B("judge", 0), jingle((57, 60, 64, 69), 0.07), 0.5)
    for w in ("手指", "东西穿模", "画面闪烁"):
        hit(AT("judge", 1, w), err, 0.5)
    hit(B("judge", 2, 20), chime((79, 84, 88)), 0.45)
    hit(B("judge", 3), pop(), 0.45)
    hit(B("judge", 3, 30), err, 0.45)
    hit(B("judge", 4, 26), chime(), 0.5)
    hit(B("judge", 5, 40), err, 0.5)
    hit(B("judge", 6, 24), roll(60, 84, 12), 0.4)
    hit(B("judge", 7, 4), roll(60, 82, 12), 0.4)
    # outro
    wipe("outro")
    for k in range(5):
        hit(B("outro", 1, 8 + 14 * k), pop(76 + 2 * k), 0.45)
    hit(B("outro", 2), jingle((72, 76, 79, 84, 88), 0.08, 1.2), 0.6)
    for k in range(5):
        hit(B("outro", 2, 4 + 3 * k), pop(91), 0.25)


if __name__ == "__main__":
    compose()
    sounds()
    levels = {"chip": 0.5, "lead": 0.55, "bass": 0.9, "kick": 0.45, "snare": 0.35, "hat": 0.3, "pad": 0.6}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"chip": 0.25, "bass": 0.2}, {"lead": (BEAT * 0.75, 0.3)},
                         ir=reverb_ir(1.6), drive=1.05, fade_out=2.0, out_gain=0.85)
    mix = highpass(lowpass(mix, 8500, order=1), 60)
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    out = HERE / "build" / "music"
    export(out, SONG, mix, buses, Events())
    h = HITS[: int(LENGTH * SR)]
    h = highpass(lowpass(h, 9000, order=1), 120)
    h *= 0.9 / max(1e-6, np.abs(h).max())
    wavfile.write(out / "hits.wav", SR, (np.stack([h, h]).T * 32767).astype(np.int16))
    rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)  # noqa: E731
    for name, (a, b) in SEC.items():
        sg = mix[:, int(a * SR):int(b * SR)]
        lo = lowpass(sg.mean(0), 120, order=4)
        print(f"{name:6s} {a:6.1f}-{b:6.1f}s  rms {rms(sg):6.1f} dBFS  <120Hz vs rest {rms(lo) - rms(sg.mean(0) - lo):5.1f} dB")
    print(f"wrote {out / 'music.wav'} and hits.wav ({LENGTH:.1f} s)")
