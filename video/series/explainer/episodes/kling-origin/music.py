"""Background music for 「可灵是如何诞生的」: one through-composed light track as long as the film (no loop).

    /usr/local/bin/python3 music.py        # reads build/timeline.json, writes build/music/music.wav

Run it after build_timeline.py has written build/timeline.json (scene starts drive the sections), then build
the timeline again so the mix picks it up (script.yaml meta.bgm points here). Re-run both if the timing changes.

Everything is synthesised with video/core/synth.py (no samples, no copyright). Key of F major, 88 BPM, every
chapter gets its own arrangement that matches its picture style, on a bar grid that restarts at the chapter:
  hook     pixel cold open   soft console arpeggio + bells, no drums
  cover    cartoon stage     bouncy upright bass, off-beat plucks, rim and shaker; stops when 鲸鱼娘 freezes
                             (only a held pad), comes back with a crash on 满分
  intro    editbay           lo-fi Rhodes, sub bass, swung boom-bap (first bars without drums)
  caption  paper             broken piano chords, upright bass, brushes
  pe       crayon            plucked arpeggios, marimba-ish bells, claps
  te       flat              Rhodes + pulsing plucks, soft four-on-the-floor
  rm       pixel             console triangle bass + arpeggios over the lo-fi kit; thinner in the freeze scene
  end      editbay           the intro theme again, drums leave, last chord rings out
Levels are kept within a few dB between sections; build_timeline.py sets the level under the voice and ducks it.
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
START = {s["id"]: s["from"] / FPS for s in TL["scenes"]}
SC = {s["id"]: s for s in TL["scenes"]}
LENGTH = TL["durationInFrames"] / FPS + 1.0  # build_timeline mixes one second past the last frame

BPM = 88
SONG = Song(bpm=BPM, bars=int(np.ceil(LENGTH / (240 / BPM))) + 1, fps=FPS)
SONG.dur, SONG.n = LENGTH, int(LENGTH * SR)
BEAT, BAR = SONG.beat, SONG.bar

# chapter -> (start, end)
ORDER = [("hook", "hook"), ("cover", "cover"), ("intro", "chain"), ("caption", "capwhy"), ("pe", "pe"),
         ("te", "te"), ("rm", "rmwhy"), ("end", "evals")]
SEC = {}
for i, (name, sid) in enumerate(ORDER):
    SEC[name] = (START[sid], START[ORDER[i + 1][1]] if i + 1 < len(ORDER) else LENGTH)

CH = {  # voicings stay at or above MIDI 50 (no pad below 48)
    "F": [53, 57, 60, 64, 67], "Am": [52, 55, 57, 60, 64], "Bb": [50, 53, 57, 58, 62], "C": [52, 55, 58, 60, 62],
    "Dm": [50, 53, 57, 60, 64], "Gm": [50, 53, 55, 58, 62],
}
ROOT = {"F": 41, "Am": 45, "Bb": 46, "C": 36, "Dm": 38, "Gm": 43}
P_A = ["F", "Am", "Bb", "C"]
P_B = ["Dm", "Gm", "C", "F"]
P_C = ["F", "Dm", "Bb", "C"]
P_D = ["Dm", "Bb", "F", "C"]

BUS = make_buses(SONG, {"keys": 0.25, "piano": 0.3, "pluck": 0.22, "bell": 0.45, "chip": 0.15, "pad": 0.4,
                        "bass": 0.0, "sub": 0.0, "kick": 0.02, "snare": 0.12, "clap": 0.15, "rim": 0.1,
                        "hat": 0.05, "brush": 0.15, "fx": 0.3})
EV = Events()
KICKS = []


def bars(name):
    """(bar index, bar start time) for every whole or partial bar of a section."""
    a, b = SEC[name]
    i = 0
    while a + i * BAR < b - 0.05:
        yield i, a + i * BAR
        i += 1


def at(t0, beat, swing=0.0):
    """Time of `beat` (float, in beats) inside a bar starting at t0; odd 8ths pushed late by `swing` beats."""
    whole, frac = divmod(beat, 1.0)
    return t0 + (whole + frac + (swing if abs(frac - 0.5) < 1e-6 else 0.0)) * BEAT


def inside(name, t):
    a, b = SEC[name]
    return a <= t < b - 0.02


def add(bus, t, sig, gain=1.0, pan=0.0, sec=None):
    if sec is None or inside(sec, t):
        BUS[bus].add(t, sig, gain, pan)


def kick_at(t, g=1.0, sec=None):
    if sec is None or inside(sec, t):
        add("kick", t, cached("kick", kick_lofi), g)
        KICKS.append((t, 0.45 * g))


def lofi_drums(sec, t0, bar, density=1.0):
    for b in (0, 2.5) if bar % 4 != 3 else (0, 1.75, 2.5):
        kick_at(at(t0, b), 0.95, sec)
    for b in (1, 3):
        add("snare", at(t0, b), cached("sn", lambda: lowpass(snare_hit(0.8, 7), 4800)), 0.8, sec=sec)
    for k in range(8):
        if density < 1 and k % 2:
            continue
        add("hat", at(t0, k / 2, 0.08), cached(("hat", k % 2), lambda: hat(False, seed=4 + k % 2)),
            0.55 if k % 2 == 0 else 0.3, pan=0.25, sec=sec)


def keys_chord(sec, t0, ch, vel=0.6, dur=None, roll=0.02):
    for j, m in enumerate(CH[ch]):
        d = dur or BAR * 0.95
        add("keys", t0 + roll * j, cached(("ep", m, round(d, 2), vel), lambda: ep_key(m, d, vel)), 0.8, sec=sec)


def bass_bar(sec, t0, ch, pattern=((0, 1.4), (2.5, 0.8))):
    r = ROOT[ch]
    add("sub", t0, cached(("sub", r), lambda: sub_tone(r, BAR * 0.9)), 1.0, sec=sec)
    for b, d in pattern:
        add("bass", at(t0, b), cached(("bass", r, d), lambda: bass_note(r + 12, d * BEAT)), 0.8, sec=sec)


def compose():
    # ---------------------------------------------------------------- hook: pixel cold open
    a, b = SEC["hook"]
    for i, t0 in bars("hook"):
        ch = ["F", "C", "Bb"][i % 3]
        notes = [m + 12 for m in CH[ch][1:]]
        add("chip", t0, chip_arp(notes, min(BAR, b - t0), rate=0.085, duty=0.25, vel=0.55), 1.7)
        for k in range(4):
            add("bell", at(t0, k), cached(("cb", notes[k % len(notes)]), lambda: fm_bell(notes[k % len(notes)] + 12, 1.6, idx=1.2, ratio=3.0)), 0.7, pan=0.3 - 0.2 * k, sec="hook")
    title = START["hook"] + (SC["hook"]["beats"][1]["from"] + 27) / FPS  # the title lands
    for j, m in enumerate([65, 69, 72, 76]):
        add("bell", title + 0.03 * j, fm_bell(m + 12, 2.4, idx=1.4, ratio=3.0), 0.5)
    add("pad", a + 0.2, string_pad([57, 60, 64], b - a - 0.2, attack=1.2, bright=0.4), 1.4)

    # ---------------------------------------------------------------- cover: cartoon stage
    cs = START["cover"]
    beats = [x["from"] for x in SC["cover"]["beats"]]
    freeze = cs + (beats[3] + 58) / FPS  # 鲸鱼娘 stands still
    full = cs + (beats[4] + 50) / FPS  # full marks, confetti
    add("fx", cs + 0.05, crash(2.2), 0.5)
    for i, t0 in bars("cover"):
        ch = P_C[i % 4]
        for b_, d in ((0, 0.9), (1, 0.4), (2, 0.9), (3.5, 0.4)):
            t = at(t0, b_)
            r = ROOT[ch] + (7 if b_ == 2 else 0)
            if not (freeze <= t < full):
                add("bass", t, cached(("up", r, d), lambda: upright(r, d * BEAT, 0.9)), 0.9, sec="cover")
        for k in range(4):
            t = at(t0, k + 0.5)
            if freeze <= t < full:
                continue
            for j, m in enumerate(CH[ch][1:4]):
                add("pluck", t + 0.006 * j, cached(("pl", m + 12), lambda: pluck(m + 12, 0.22, 0.7, seed=m)), 0.55, pan=-0.2, sec="cover")
        for k in range(8):
            t = at(t0, k / 2, 0.06)
            if not (freeze <= t < full):
                add("hat", t, cached(("sh", k % 2), lambda: hat(False, seed=8 + k % 2)), 0.35 if k % 2 else 0.5, pan=0.3, sec="cover")
        for k in (0, 2):
            t = at(t0, k)
            if not (freeze <= t < full):
                kick_at(t, 0.7, "cover")
        for k in (1, 3):
            t = at(t0, k)
            if not (freeze <= t < full):
                add("rim", t, cached("rim", rim), 0.7, sec="cover")
    # the freeze: everything stops but a held, slightly tense chord (never silence)
    add("pad", freeze, string_pad([57, 60, 65], full - freeze + 0.3, attack=0.25, bright=0.5), 0.9)
    add("fx", full, crash(2.5), 0.7)
    for j, m in enumerate([72, 77, 81, 84]):
        add("bell", full + 0.05 * j, fm_bell(m, 2.0, idx=1.6, ratio=3.0), 0.45)

    # ---------------------------------------------------------------- intro: editbay lo-fi
    for i, t0 in bars("intro"):
        ch = P_A[i % 4]
        keys_chord("intro", t0, ch, 0.6)
        if i % 2 == 1:
            keys_chord("intro", at(t0, 2.5), ch, 0.35, dur=BEAT * 1.2)
        bass_bar("intro", t0, ch)
        if i >= 4:
            lofi_drums("intro", t0, i)
        if i >= 12 and i % 2 == 0:  # sparse bell answer in the second half
            m = CH[ch][-1] + 12
            add("bell", at(t0, 3), cached(("ib", m), lambda: fm_bell(m, 2.0, idx=1.0, ratio=3.0)), 0.3, pan=0.35, sec="intro")

    # ---------------------------------------------------------------- caption: paper, piano + brushes
    for i, t0 in bars("caption"):
        ch = P_B[i % 4]
        notes = CH[ch]
        arp = [notes[0], notes[2], notes[4], notes[2], notes[1] + 12, notes[2], notes[4], notes[3]]
        for k, m in enumerate(arp):
            add("piano", at(t0, k / 2, 0.05), cached(("pn", m), lambda: piano_note(m, BEAT * 1.2, 0.42, seed=m)), 0.85, pan=-0.1, sec="caption")
        r = ROOT[ch]
        for b_, d in ((0, 1.6), (2, 0.9), (3, 0.9)):
            rr = r + (12 if b_ == 3 and i % 2 else 0)
            add("bass", at(t0, b_), cached(("up", rr, d), lambda: upright(rr, d * BEAT, 0.8)), 0.85, sec="caption")
        add("brush", t0, cached("sweep", lambda: brush_sweep(BAR)), 0.9, sec="caption")
        for b_ in (1, 3):
            add("brush", at(t0, b_), cached(("bt", b_), lambda: brush_tap(0.9, seed=b_)), 0.8, sec="caption")
        if i % 2 == 0:
            kick_at(at(t0, 0), 0.55, "caption")
        if i % 4 == 0:
            add("pad", t0, string_pad([n + 12 for n in notes[1:4]], BAR * 2, attack=1.0, bright=0.35), 0.45, sec="caption")

    # ---------------------------------------------------------------- pe: crayon, plucks + marimba
    for i, t0 in bars("pe"):
        ch = P_C[(i + 1) % 4]
        notes = CH[ch]
        for k in range(8):
            m = notes[[0, 2, 4, 2, 1, 3, 4, 3][k]] + 12
            add("pluck", at(t0, k / 2, 0.05), cached(("pl", m), lambda: pluck(m, 0.3, 0.8, seed=m)), 0.6, pan=-0.25 + 0.06 * k, sec="pe")
        if i % 2 == 0:
            for k, j in ((0, 4), (1.5, 2), (3, 3)):
                m = notes[j] + 12
                add("bell", at(t0, k), cached(("mb", m), lambda: fm_bell(m, 1.2, idx=0.9, ratio=4.0)), 0.4, pan=0.3, sec="pe")
        bass_bar("pe", t0, ch, ((0, 0.8), (1.5, 0.4), (2, 0.8), (3.5, 0.4)))
        if i >= 2:
            for b_ in (0, 2):
                kick_at(at(t0, b_), 0.85, "pe")
            for b_ in (1, 3):
                add("clap", at(t0, b_), cached("clap", clap), 0.45, sec="pe")
            for k in range(8):
                add("hat", at(t0, k / 2, 0.05), cached(("hat", k % 2), lambda: hat(False, seed=4 + k % 2)), 0.4 if k % 2 == 0 else 0.22, pan=0.25, sec="pe")

    # ---------------------------------------------------------------- te: flat, steady pulse
    for i, t0 in bars("te"):
        ch = P_A[(i + 2) % 4]
        keys_chord("te", t0, ch, 0.5)
        for k in range(8):
            m = CH[ch][1 + k % 3] + 12
            add("pluck", at(t0, k / 2), cached(("tp", m), lambda: pluck(m, 0.16, 0.5, seed=m + 3)), 0.45, pan=0.2, sec="te")
        bass_bar("te", t0, ch)
        for b_ in range(4):
            kick_at(at(t0, b_), 0.6, "te")
        for b_ in (1, 3):
            add("snare", at(t0, b_), cached("sn", lambda: lowpass(snare_hit(0.8, 7), 4800)), 0.55, sec="te")
        for k in range(4):
            add("hat", at(t0, k + 0.5), cached(("hat", 1), lambda: hat(False, seed=5)), 0.4, pan=0.25, sec="te")

    # ---------------------------------------------------------------- rm: pixel, console voices over the kit
    thin = START["freeze"]
    for i, t0 in bars("rm"):
        ch = P_D[i % 4]
        notes = [m + 12 for m in CH[ch][1:]]
        add("chip", t0, chip_arp(notes, min(BAR * 0.98, SEC["rm"][1] - t0), rate=0.06, duty=0.125, vel=0.42), 0.75, sec="rm")
        r = ROOT[ch] + 12
        for k in range(8):
            mm = r + (12 if k in (3, 7) else 0)
            add("bass", at(t0, k / 2), cached(("tri", mm), lambda: chip_tri(mm, BEAT * 0.42, 0.9)), 0.8, sec="rm")
        add("sub", t0, cached(("sub", ROOT[ch]), lambda: sub_tone(ROOT[ch], BAR * 0.9)), 0.8, sec="rm")
        if t0 < thin:
            lofi_drums("rm", t0, i)
        else:  # the freeze scene: kick and a sparse hat only
            kick_at(at(t0, 0), 0.75, "rm")
            for k in (1, 3):
                add("hat", at(t0, k), cached(("hat", 0), lambda: hat(False, seed=4)), 0.4, pan=0.25, sec="rm")
            if i % 2 == 0:
                add("pad", t0, string_pad([m for m in CH[ch][1:4]], BAR * 2, attack=0.8, bright=0.3), 0.5, sec="rm")

    # ---------------------------------------------------------------- end: the intro theme comes home
    a, b = SEC["end"]
    n_bars = len(list(bars("end")))
    for i, t0 in bars("end"):
        last = i >= n_bars - 2
        ch = "F" if last else P_A[i % 4]
        if i == n_bars - 2:  # final chord, let it ring to the end
            for j, m in enumerate(CH["F"] + [72]):
                add("keys", t0 + 0.03 * j, ep_key(m, b - t0, 0.55), 0.8)
            add("sub", t0, sub_tone(ROOT["F"], b - t0), 0.9)
            add("pad", t0, string_pad([57, 60, 64, 67], b - t0, attack=1.2, bright=0.35), 0.7)
            add("bell", t0 + BEAT, fm_bell(77, 3.0, idx=1.0, ratio=3.0), 0.35)
            continue
        if last:
            continue
        keys_chord("end", t0, ch, 0.6)
        bass_bar("end", t0, ch)
        if i < n_bars - 4:
            lofi_drums("end", t0, i, density=0.5 if i >= n_bars - 6 else 1.0)


if __name__ == "__main__":
    compose()
    levels = {"keys": 0.8, "piano": 1.5, "pluck": 0.7, "bell": 0.5, "chip": 0.45, "pad": 0.6, "bass": 0.4,
              "sub": 0.28, "kick": 0.6, "snare": 0.5, "clap": 0.4, "rim": 0.5, "hat": 0.3, "brush": 1.0, "fx": 0.45}
    mix, buses = mixdown(SONG, BUS, KICKS, levels, {"keys": 0.3, "pluck": 0.25, "bass": 0.3, "pad": 0.3},
                         {"bell": (BEAT * 0.75, 0.35)}, ir=reverb_ir(2.4), drive=1.1, fade_out=2.5, out_gain=0.85)
    mix = highpass(lowpass(tape_wow(mix), 11000, order=1), 55) + vinyl(mix.shape[1], crackle=0.6) * 0.6
    mix *= 0.97 / max(0.97, np.abs(mix).max())
    out = HERE / "build" / "music"
    export(out, SONG, mix, buses, EV)
    rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)  # noqa: E731
    for name, (a, b) in SEC.items():
        seg = mix[:, int(a * SR):int(b * SR)]
        lo = lowpass(seg.mean(0), 120, order=4)
        print(f"{name:8s} {a:6.1f}-{b:6.1f}s  rms {rms(seg):6.1f} dBFS  <120Hz vs rest {rms(lo) - rms(seg.mean(0) - lo):5.1f} dB")
    print(f"wrote {out / 'music.wav'} ({LENGTH:.1f} s)")
