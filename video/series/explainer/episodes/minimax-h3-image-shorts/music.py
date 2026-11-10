"""Background music for 「MiniMax 开源生图模型：一张 4K 图十来秒」 (vertical): one through-composed track.

    /usr/local/bin/python3 music.py        # reads build/timeline.json, writes build/music/music.wav

Run after build_timeline.py has written build/timeline.json, then build the timeline again so the mix picks it up
(script.yaml meta.bgm). Copied from agent-manager/music.py (same synth, F major, 90 BPM); the arrangement follows
this episode's per-scene picture styles:
  hook   (gallery, opening)  driving 4/4 kick, 8th bass, plucks: the short needs energy from frame one
  pixels steps (particle)    pulsing 8th plucks, Rhodes, soft four-on-the-floor
  speed  (data)              Rhodes, plucks, soft kick and rim
  arch   (blueprint)         string pad, slow plucked arpeggio
  real edit (darkroom)       lo-fi Rhodes, sub bass, swung boom-bap
  styles refs (gallery)      broken piano chords, upright bass, brushes
  text   (editorial)         piano, upright, brushes, a bell answer
  outro  (editorial)         piano + strings; drums leave, the last chord rings through the end-card animation
"""
import json
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(next(p for p in HERE.parents if (p / "core").is_dir())))  # video/
from core.synth import *  # noqa: E402,F401,F403

TL = json.load(open(HERE / "build" / "timeline.json"))
FPS = TL["fps"]
SCENES = [s["id"] for s in TL["scenes"]]
START = {s["id"]: s["from"] / FPS for s in TL["scenes"]}
LENGTH = TL["durationInFrames"] / FPS + 1.0  # build_timeline mixes one second past the last frame

BPM = 90
SONG = Song(bpm=BPM, bars=int(np.ceil(LENGTH / (240 / BPM))) + 1, fps=FPS)
SONG.dur, SONG.n = LENGTH, int(LENGTH * SR)
BEAT, BAR = SONG.beat, SONG.bar

SEC = {sid: (START[sid], START[SCENES[i + 1]] if i + 1 < len(SCENES) else LENGTH) for i, sid in enumerate(SCENES)}
STYLE = {"hook": "pitch", "pixels": "swiss", "speed": "data", "arch": "blue", "steps": "swiss", "real": "term",
         "styles": "dossier", "text": "cork", "refs": "dossier", "edit": "term", "outro": "edit"}

CH = {  # voicings stay at or above MIDI 50
    "F": [53, 57, 60, 64, 67], "Am": [52, 55, 57, 60, 64], "Bb": [50, 53, 57, 58, 62], "C": [52, 55, 58, 60, 62],
    "Dm": [50, 53, 57, 60, 64], "Gm": [50, 53, 55, 58, 62],
}
ROOT = {"F": 41, "Am": 45, "Bb": 46, "C": 36, "Dm": 38, "Gm": 43}
PROG = [["F", "Am", "Bb", "C"], ["Dm", "Gm", "C", "F"], ["F", "Dm", "Bb", "C"], ["Dm", "Bb", "F", "C"]]

BUS = make_buses(SONG, {"keys": 0.25, "piano": 0.3, "pluck": 0.22, "bell": 0.45, "pad": 0.4, "bass": 0.0,
                        "sub": 0.0, "kick": 0.02, "snare": 0.12, "clap": 0.15, "rim": 0.1, "hat": 0.05,
                        "brush": 0.15, "fx": 0.3})
EV = Events()
KICKS = []


def bars(sec):
    a, b = SEC[sec]
    i = 0
    while a + i * BAR < b - 0.05:
        yield i, a + i * BAR
        i += 1


def at(t0, beat, swing=0.0):
    whole, frac = divmod(beat, 1.0)
    return t0 + (whole + frac + (swing if abs(frac - 0.5) < 1e-6 else 0.0)) * BEAT


def inside(sec, t):
    a, b = SEC[sec]
    return a <= t < b - 0.02


def add(bus, t, sig, gain=1.0, pan=0.0, sec=None):
    if sec is None or inside(sec, t):
        BUS[bus].add(t, sig, gain, pan)


def kick_at(t, g=1.0, sec=None):
    if sec is None or inside(sec, t):
        add("kick", t, cached("kick", kick_lofi), g)
        KICKS.append((t, 0.45 * g))


def keys_chord(sec, t0, ch, vel=0.6, dur=None, roll=0.02):
    d = dur or BAR * 0.95
    for j, m in enumerate(CH[ch]):
        add("keys", t0 + roll * j, cached(("ep", m, round(d, 2), vel), lambda: ep_key(m, d, vel)), 0.8, sec=sec)


def bass_bar(sec, t0, ch, pattern=((0, 1.4), (2.5, 0.8)), g=0.8):
    r = ROOT[ch]
    add("sub", t0, cached(("sub", r), lambda: sub_tone(r, BAR * 0.9)), 1.0, sec=sec)
    for b, d in pattern:
        add("bass", at(t0, b), cached(("bass", r, d), lambda: bass_note(r + 12, d * BEAT)), g, sec=sec)


def upright_bar(sec, t0, ch, i):
    r = ROOT[ch]
    for b_, d in ((0, 1.6), (2, 0.9), (3, 0.9)):
        rr = r + (12 if b_ == 3 and i % 2 else 0)
        add("bass", at(t0, b_), cached(("up", rr, d), lambda: upright(rr, d * BEAT, 0.8)), 0.85, sec=sec)


def brushes(sec, t0):
    add("brush", t0, cached("sweep", lambda: brush_sweep(BAR)), 0.9, sec=sec)
    for b_ in (1, 3):
        add("brush", at(t0, b_), cached(("bt", b_), lambda: brush_tap(0.9, seed=b_)), 0.8, sec=sec)


def hats(sec, t0, g=0.45, swing=0.05, every=1):
    for k in range(0, 8, every):
        add("hat", at(t0, k / 2, swing), cached(("hat", k % 2), lambda: hat(False, seed=4 + k % 2)),
            g if k % 2 == 0 else g * 0.55, pan=0.25, sec=sec)


def snare(sec, t0, g=0.6):
    for b_ in (1, 3):
        add("snare", at(t0, b_), cached("sn", lambda: lowpass(snare_hit(0.8, 7), 4800)), g, sec=sec)


def bed(sec, t0, ch):
    """A quiet sustained chord under every bar, so rests in the groove never leave a hole under a speech gap."""
    notes = CH[ch][1:4]
    add("pad", t0, cached(("bed", ch), lambda: string_pad(notes, BAR * 1.2, attack=0.25, bright=0.3)), 0.32, sec=sec)


def entry(sec):
    """A soft bell + shimmer at each scene change, so the style switch is heard as well as seen."""
    a, _ = SEC[sec]
    if a < 0.5:
        return
    add("fx", a - 0.35, cached("rs", lambda: reverse_swell(0.5)), 0.35)
    m = {"swiss": 77, "picto": 84, "dossier": 72, "term": 76, "blue": 79, "cork": 74, "pitch": 81,
         "data": 76, "edit": 72}[STYLE[sec]]
    add("bell", a + 0.02, cached(("ent", m), lambda: fm_bell(m, 2.2, idx=1.1, ratio=3.0)), 0.35, pan=0.2)


# ------------------------------------------------------------------------------ arrangements, one per style
def swiss(sec, n):
    prog = PROG[n % 2 * 2]
    for i, t0 in bars(sec):
        ch = prog[i % 4]
        bed(sec, t0, ch)
        keys_chord(sec, t0, ch, 0.55)
        for k in range(8):
            m = CH[ch][1 + k % 3] + 12
            add("pluck", at(t0, k / 2), cached(("sp", m), lambda: pluck(m, 0.16, 0.5, seed=m + 3)), 0.45, pan=0.2, sec=sec)
        bass_bar(sec, t0, ch)
        if sec == "hook" and i < 1:
            continue
        for b_ in range(4):
            kick_at(at(t0, b_), 0.55, sec)
        for b_ in (1, 3):
            add("clap", at(t0, b_), cached("clap", clap), 0.35, sec=sec)
        hats(sec, t0, 0.35, 0.0)


def picto(sec, n):
    prog = PROG[2 + n % 2]
    for i, t0 in bars(sec):
        ch = prog[i % 4]
        bed(sec, t0, ch)
        notes = CH[ch]
        for k in range(8):
            m = notes[[0, 2, 4, 2, 1, 3, 4, 3][k]] + 12
            add("pluck", at(t0, k / 2, 0.05), cached(("pl", m), lambda: pluck(m, 0.3, 0.8, seed=m)), 0.6, pan=-0.25 + 0.06 * k, sec=sec)
        if i % 2 == 0:
            for k, j in ((0, 4), (1.5, 2), (3, 3)):
                m = notes[j] + 12
                add("bell", at(t0, k), cached(("mb", m), lambda: fm_bell(m, 1.2, idx=0.9, ratio=4.0)), 0.35, pan=0.3, sec=sec)
        bass_bar(sec, t0, ch, ((0, 0.8), (1.5, 0.4), (2, 0.8), (3.5, 0.4)))
        if i >= 1:
            for b_ in (0, 2):
                kick_at(at(t0, b_), 0.75, sec)
            for b_ in (1, 3):
                add("clap", at(t0, b_), cached("clap", clap), 0.4, sec=sec)
            hats(sec, t0, 0.38)


def dossier(sec, n):
    prog = PROG[1 + 2 * (n % 2)]
    for i, t0 in bars(sec):
        ch = prog[i % 4]
        bed(sec, t0, ch)
        notes = CH[ch]
        arp = [notes[0], notes[2], notes[4], notes[2], notes[1] + 12, notes[2], notes[4], notes[3]]
        for k, m in enumerate(arp):
            add("piano", at(t0, k / 2, 0.05), cached(("pn", m), lambda: piano_note(m, BEAT * 1.2, 0.42, seed=m)), 0.85, pan=-0.1, sec=sec)
        upright_bar(sec, t0, ch, i)
        brushes(sec, t0)
        if i % 2 == 0:
            kick_at(at(t0, 0), 0.55, sec)
        if i % 4 == 0:
            add("pad", t0, string_pad([x + 12 for x in notes[1:4]], BAR * 2, attack=1.0, bright=0.35), 0.45, sec=sec)


def term(sec, n):
    prog = PROG[n % 2]
    for i, t0 in bars(sec):
        ch = prog[i % 4]
        bed(sec, t0, ch)
        keys_chord(sec, t0, ch, 0.6)
        if i % 2 == 1:
            keys_chord(sec, at(t0, 2.5), ch, 0.35, dur=BEAT * 1.2)
        bass_bar(sec, t0, ch)
        if i < 1:
            continue
        for b_ in (0, 2.5) if i % 4 != 3 else (0, 1.75, 2.5):
            kick_at(at(t0, b_), 0.9, sec)
        snare(sec, t0, 0.75)
        hats(sec, t0, 0.5, 0.08)


def blue(sec, n):
    prog = PROG[3 - n % 2]
    for i, t0 in bars(sec):
        ch = prog[i % 4]
        bed(sec, t0, ch)
        notes = CH[ch]
        if i % 2 == 0:
            add("pad", t0, string_pad([x for x in notes[1:4]], BAR * 2.05, attack=0.9, bright=0.4), 0.75, sec=sec)
        for k in range(8):
            m = notes[[0, 2, 3, 4, 3, 2, 1, 2][k]] + 12
            add("pluck", at(t0, k / 2), cached(("bp", m), lambda: pluck(m, 0.4, 0.55, seed=m + 7)), 0.55, pan=0.3 - 0.08 * k, sec=sec)
        bass_bar(sec, t0, ch, ((0, 1.8), (2, 1.6)), g=0.6)
        kick_at(at(t0, 0), 0.6, sec)
        if i >= 2:
            add("rim", at(t0, 2), cached("rim", rim), 0.45, sec=sec)
            hats(sec, t0, 0.3, 0.0, every=2)


def cork(sec, n):
    prog = PROG[2]
    for i, t0 in bars(sec):
        ch = prog[i % 4]
        bed(sec, t0, ch)
        notes = CH[ch]
        for k, (b_, j) in enumerate(((0, 0), (0.5, 2), (1, 4), (2, 1), (2.5, 3), (3, 4), (3.5, 2))):
            m = notes[j] + (12 if j >= 3 else 0)
            add("piano", at(t0, b_, 0.05), cached(("cp", m), lambda: piano_note(m, BEAT * 1.4, 0.42, seed=m + 1)), 0.85, pan=-0.1, sec=sec)
        upright_bar(sec, t0, ch, i)
        brushes(sec, t0)
        kick_at(at(t0, 0), 0.55, sec)
        if i % 2 == 1:
            m = notes[-1] + 12
            add("bell", at(t0, 3), cached(("cb", m), lambda: fm_bell(m, 2.0, idx=1.0, ratio=3.0)), 0.3, pan=0.35, sec=sec)


def pitch(sec, n):
    prog = PROG[0]
    for i, t0 in bars(sec):
        ch = prog[i % 4]
        bed(sec, t0, ch)
        keys_chord(sec, t0, ch, 0.45, dur=BEAT * 1.8)
        keys_chord(sec, at(t0, 2), ch, 0.4, dur=BEAT * 1.8)
        r = ROOT[ch] + 12
        for k in range(8):
            mm = r + (12 if k % 4 == 3 else 0)
            add("bass", at(t0, k / 2), cached(("b8", mm), lambda: bass_note(mm, BEAT * 0.42)), 0.6, sec=sec)
        add("sub", t0, cached(("sub", ROOT[ch]), lambda: sub_tone(ROOT[ch], BAR * 0.9)), 0.9, sec=sec)
        for k in range(4):
            m = CH[ch][2 + k % 3] + 12
            add("pluck", at(t0, k + 0.5), cached(("pp", m), lambda: pluck(m, 0.2, 0.6, seed=m)), 0.45, pan=-0.2, sec=sec)
        for b_ in range(4):
            kick_at(at(t0, b_), 0.8, sec)
        snare(sec, t0, 0.55)
        hats(sec, t0, 0.5, 0.0)


def data(sec, n):
    prog = PROG[1]
    for i, t0 in bars(sec):
        ch = prog[i % 4]
        bed(sec, t0, ch)
        keys_chord(sec, t0, ch, 0.55)
        for k in (0, 1, 3, 4, 6):
            m = CH[ch][1 + k % 4] + 12
            add("pluck", at(t0, k / 2), cached(("dp", m), lambda: pluck(m, 0.2, 0.55, seed=m + 5)), 0.5, pan=0.25, sec=sec)
        bass_bar(sec, t0, ch, ((0, 1.2), (1.5, 0.5), (2.5, 1.0)))
        for b_ in (0, 2):
            kick_at(at(t0, b_), 0.7, sec)
        for b_ in (1, 3):
            add("rim", at(t0, b_), cached("rim", rim), 0.6, sec=sec)
        hats(sec, t0, 0.35, 0.03)


def edit(sec, n):
    a, b = SEC[sec]
    n_bars = len(list(bars(sec)))
    prog = PROG[0]
    for i, t0 in bars(sec):
        if i == n_bars - 3:  # final chord, let it ring to the end
            for j, m in enumerate(CH["F"] + [72]):
                add("keys", t0 + 0.03 * j, ep_key(m, b - t0, 0.55), 0.8)
            add("sub", t0, sub_tone(ROOT["F"], b - t0), 0.9)
            add("pad", t0, string_pad([57, 60, 64, 67], b - t0, attack=1.2, bright=0.35), 0.7)
            add("bell", t0 + BEAT, fm_bell(77, 3.5, idx=1.0, ratio=3.0), 0.35)
            continue
        if i > n_bars - 3:
            continue
        ch = prog[i % 4]
        bed(sec, t0, ch)
        notes = CH[ch]
        arp = [notes[0], notes[2], notes[4], notes[2], notes[1] + 12, notes[2], notes[4], notes[3]]
        for k, m in enumerate(arp):
            add("piano", at(t0, k / 2, 0.04), cached(("pn", m), lambda: piano_note(m, BEAT * 1.2, 0.42, seed=m)), 0.85, pan=-0.1, sec=sec)
        if i % 2 == 0:
            add("pad", t0, string_pad([x + 12 for x in notes[1:4]], BAR * 2.05, attack=1.0, bright=0.35), 0.6, sec=sec)
        bass_bar(sec, t0, ch, ((0, 1.6), (2, 1.6)), g=0.6)
        if i < n_bars - 7:
            kick_at(at(t0, 0), 0.6, sec)
            add("rim", at(t0, 2), cached("rim", rim), 0.4, sec=sec)
            hats(sec, t0, 0.3, 0.04, every=2)


ARR = {"swiss": swiss, "picto": picto, "dossier": dossier, "term": term, "blue": blue, "cork": cork,
       "pitch": pitch, "data": data, "edit": edit}


def compose():
    seen = {}
    for sid in SCENES:
        st = STYLE[sid]
        n = seen.get(st, 0)
        seen[st] = n + 1
        ARR[st](sid, n)
        entry(sid)
    # the opening: a quiet pad under the first two drumless bars
    a, _ = SEC["hook"]
    add("pad", a + 0.1, string_pad([57, 60, 64], BAR * 2, attack=1.0, bright=0.4), 0.6)


if __name__ == "__main__":
    compose()
    levels = {"keys": 0.8, "piano": 1.5, "pluck": 0.7, "bell": 0.5, "pad": 0.6, "bass": 0.4, "sub": 0.28,
              "kick": 0.6, "snare": 0.5, "clap": 0.4, "rim": 0.5, "hat": 0.3, "brush": 1.0, "fx": 0.45}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"keys": 0.3, "pluck": 0.25, "bass": 0.3, "pad": 0.3},
                         {"bell": (BEAT * 0.75, 0.35)}, ir=reverb_ir(2.4), drive=1.1, fade_out=3.0, out_gain=0.85)
    mix = highpass(lowpass(tape_wow(mix), 11000, order=1), 55) + vinyl(mix.shape[1], crackle=0.5) * 0.5
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    out = HERE / "build" / "music"
    export(out, SONG, mix, buses, EV)
    rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)  # noqa: E731
    for name, (a, b) in SEC.items():
        seg = mix[:, int(a * SR):int(b * SR)]
        print(f"{name:8s} {STYLE[name]:8s} {a:6.1f}-{b:6.1f}s  rms {rms(seg):6.1f} dBFS")
    print(f"wrote {out / 'music.wav'} ({LENGTH:.1f} s)")
