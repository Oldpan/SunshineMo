"""Procedural soundtrack for "好感差距 / The Liking Gap".

Everything is synthesized from oscillators and noise with numpy/scipy:
no samples, no audio files, no virtual instruments.

Output:
  out/music.wav  48 kHz stereo 16-bit
  out/sync.npz   event times + per-frame envelopes the renderer cuts to
"""
import os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 100
BEAT = 60 / BPM            # 0.6 s
BAR = 4 * BEAT             # 2.4 s
S16 = BEAT / 4
N_BARS = 74
DUR = N_BARS * BAR         # 177.6 s
N = int(DUR * SR)
FPS = 60
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")

rng = np.random.default_rng(20180905)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def bt(bar, beat=0.0):
    """Time in seconds of (bar, beat)."""
    return bar * BAR + beat * BEAT


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

SECTIONS = [  # (name, first bar, last bar exclusive)
    ("intro", 0, 8), ("verse", 8, 16), ("build1", 16, 24), ("drop1", 24, 32),
    ("breakdown", 32, 40), ("build2", 40, 48), ("drop2", 48, 56), ("post", 56, 64),
    ("outro", 64, 74),
]


def section(bar):
    for name, a, b in SECTIONS:
        if a <= bar < b:
            return name
    return "outro"


# ---------------------------------------------------------------- buses
class Bus:
    def __init__(self, name, send=0.0):
        self.name = name
        self.x = np.zeros((2, N + SR * 4), np.float32)
        self.send = send

    def add(self, t, sig, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0:
            sig = sig[..., -i:]
            i = 0
        if sig.ndim == 1:
            l = np.cos((pan + 1) * np.pi / 4)
            r = np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l * 1.414, sig * r * 1.414])
        n = min(sig.shape[1], self.x.shape[1] - i)
        if n > 0:
            self.x[:, i:i + n] += gain * sig[:, :n]


BUS = {k: Bus(k, s) for k, s in [
    ("pad", 0.35), ("super", 0.25), ("keys", 0.4), ("pluck", 0.3), ("bell", 0.55),
    ("lead", 0.3), ("bass", 0.0), ("sub", 0.0), ("kick", 0.03), ("clap", 0.3),
    ("hat", 0.12), ("fx", 0.45), ("tick", 0.4),
]}

EVENTS = {k: [] for k in ["kick", "clap", "hat", "ohat", "roll", "bell", "lead",
                          "pluck", "impact", "tick", "keys"]}


# ---------------------------------------------------------------- oscillators
def env_adsr(n, a=0.01, d=0.1, s=0.8, r=0.2, hold=None):
    """Linear-attack, exponential-decay ADSR over n samples (release at the end)."""
    t = np.arange(n) / SR
    hold = (n / SR - r) if hold is None else hold
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip((t - hold) / max(r, 1e-4), 0, 1)
    return (e * (1 - rel) ** 2).astype(np.float32)


def additive(phase, f0, cutoff, kmax=80, shape="saw", reso=0.0, seed=None):
    """Band-limited saw/square via additive synthesis with a 2-pole low-pass
    applied per harmonic.  `phase` is the instantaneous phase of the
    fundamental (radians), `cutoff` a scalar or per-sample array in Hz."""
    r = np.random.default_rng(seed)
    out = np.zeros_like(phase, dtype=np.float32)
    cmax = float(np.max(cutoff))
    K = int(min(kmax, 19000 / f0, 6 * cmax / f0 + 1))
    for k in range(1, max(K, 1) + 1):
        if shape == "square" and k % 2 == 0:
            continue
        x = (k * f0) / cutoff
        a = 1.0 / np.sqrt(1 + x ** 4)
        if reso:
            a = a + reso * np.exp(-((x - 1) ** 2) / 0.05) * 0.6
        out += (a / k) * np.sin(k * phase + r.uniform(0, 2 * np.pi)).astype(np.float32)
    return out


_cache = {}


def cached(key, fn):
    if key not in _cache:
        _cache[key] = fn()
    return _cache[key]


def pad_chord(chord, dur, bright=1.0, voices=3, det=0.12, seed=0):
    """Warm detuned saw pad, stereo."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    for j, m in enumerate(CHORDS[chord]):
        for v in range(voices):
            cents = (v - (voices - 1) / 2) * det * 100 / max(voices - 1, 1) * 2
            f = mtof(m) * 2 ** (cents / 1200)
            ph = 2 * np.pi * f * t + 0.002 * np.sin(2 * np.pi * (0.3 + 0.1 * v) * t)
            cut = (700 + 1400 * bright) * (1 + 0.15 * np.sin(2 * np.pi * 0.11 * t + j))
            s = additive(ph, f, cut, kmax=40, seed=seed * 100 + j * 10 + v)
            p = (v / max(voices - 1, 1)) * 2 - 1
            L += s * (1 - 0.6 * p)
            R += s * (1 + 0.6 * p)
    e = env_adsr(n, a=0.35, d=1.0, s=0.9, r=0.5)
    return np.stack([L * e, R * e]) * 0.06


def supersaw(chord, dur, seed=0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    notes = CHORDS[chord] + [CHORDS[chord][0] + 12]
    for j, m in enumerate(notes):
        for v in range(5):
            cents = (v - 2) * 9
            f = mtof(m) * 2 ** (cents / 1200)
            s = additive(2 * np.pi * f * t, f, 3800.0, kmax=60, seed=seed * 1000 + j * 10 + v)
            p = (v - 2) / 2
            L += s * (1 - 0.7 * p)
            R += s * (1 + 0.7 * p)
    e = env_adsr(n, a=0.02, d=0.6, s=0.85, r=0.15)
    return np.stack([L * e, R * e]) * 0.035


def pluck(m, dur=0.5, bright=1.0, seed=0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    cut = 250 + 3500 * bright * np.exp(-t / 0.07)
    s = additive(2 * np.pi * f * t, f, cut, kmax=50, seed=seed)
    s += 0.5 * additive(2 * np.pi * f * 1.004 * t, f, cut, kmax=50, seed=seed + 7)
    return s * env_adsr(n, a=0.002, d=0.18, s=0.0, r=0.05) * 0.5


def fm_bell(m, dur=3.0, idx=3.0, ratio=3.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    I = idx * np.exp(-t / 0.45)
    s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t))
    s += 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.6)
    e = np.minimum(t / 0.003, 1) * np.exp(-t / 1.1)
    return (s * e * 0.3).astype(np.float32)


def ep_key(m, dur=1.2, vel=1.0):
    """FM electric-piano tone (1:1 ratio with decaying index + tremolo)."""
    n = int((dur + 0.8) * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    I = (1.2 + 1.5 * vel) * np.exp(-t / 0.25)
    s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * t))
    s += 0.15 * np.sin(2 * np.pi * f * 14.0 * t) * np.exp(-t / 0.03)  # tine
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    e = np.minimum(t / 0.004, 1) * np.exp(-t / 1.4) * np.clip(1 - (t - dur) / 0.8, 0, 1)
    return (s * e * trem * 0.22 * vel).astype(np.float32)


def lead_note(m, dur, seed=0):
    n = int((dur + 0.25) * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.18) / 0.3, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    cut = 1800 + 1600 * np.exp(-t / 0.25)
    s = 0.6 * additive(ph, f, cut, kmax=40, seed=seed)
    s += 0.5 * additive(ph * 1.0, f, cut, kmax=40, shape="square", seed=seed + 3)
    s += 0.25 * np.sin(ph * 0.5)  # sub-octave body
    e = env_adsr(n, a=0.012, d=0.3, s=0.75, r=0.18, hold=dur)
    return (s * e * 0.33).astype(np.float32)


def bandnoise(n, lo, hi, order=2, seed=None):
    x = np.random.default_rng(seed).standard_normal(n).astype(np.float32)
    if lo and hi:
        sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    elif lo:
        sos = signal.butter(order, lo, btype="high", fs=SR, output="sos")
    else:
        sos = signal.butter(order, hi, btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x).astype(np.float32)


def kick(soft=False):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / (0.22 if not soft else 0.16))
    click = bandnoise(n, 1500, 6000, seed=1) * np.exp(-t / 0.004) * (0.25 if not soft else 0.08)
    s = np.tanh(1.6 * (body + click)) * (1.0 if not soft else 0.55)
    return (s * np.minimum(t / 0.001, 1)).astype(np.float32)


def clap():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 900, 4200, seed=2)
    e = np.zeros(n, np.float32)
    for d in (0.0, 0.011, 0.022):
        e += (t >= d) * np.exp(-np.maximum(t - d, 0) / 0.006)
    e += (t >= 0.03) * np.exp(-np.maximum(t - 0.03, 0) / 0.12) * 0.8
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.3
    return (nz * e * 0.9 + body).astype(np.float32)


def snare_hit(vel=1.0, seed=3):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 1500, 8000, seed=seed) * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.04)
    return ((nz * 0.8 + body * 0.4) * vel).astype(np.float32)


def hat(open_=False, seed=4):
    n = int((0.35 if open_ else 0.08) * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 7500, None, order=4, seed=seed)
    # a little metallic ring from detuned square partials
    ring = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (3140, 4330, 5220, 6470)) * 0.04
    e = np.exp(-t / (0.11 if open_ else 0.018))
    return ((nz + ring) * e * 0.5).astype(np.float32)


def crash(dur=2.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 4000, None, order=2, seed=9)
    return (nz * np.exp(-t / 0.9) * 0.35).astype(np.float32)


def impact():
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    f = 30 + 45 * np.exp(-t / 0.3)
    ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.tanh(2 * np.sin(ph)) * np.exp(-t / 0.9)
    return (boom * 0.6).astype(np.float32)


def riser(dur):
    """Noise whoosh with rising band + rising detuned tone."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    out = np.zeros(n, np.float32)
    bands = [(200, 600), (500, 1400), (1200, 3000), (2500, 6000), (5000, 12000)]
    for i, (lo, hi) in enumerate(bands):
        w = np.exp(-((u * (len(bands) - 1) - i) ** 2) / 0.8)
        out += bandnoise(n, lo, hi, seed=20 + i) * w
    f = 180 * 2 ** (u * 2.5)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = sum(np.sin(ph * (1 + d)) for d in (-0.01, 0, 0.012)) * 0.08
    return ((out * 0.25 + tone) * u ** 2.2).astype(np.float32)


def reverse_swell(dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 2500, None, seed=31)
    return (nz * (t / dur) ** 3 * 0.35).astype(np.float32)


def tick(hi=True):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    f = 2600 if hi else 1900
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) * 0.35).astype(np.float32)


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
            sig = cached(("pad", ch, bright), lambda: pad_chord(ch, BAR + 0.6, bright, seed=hash(ch) % 97))
            g = 1.0
            if sec == "intro":
                g = min(1.0, (t0 + 0.0) / 6 + 0.25)
            if bar >= 72:
                g = 1.15
            BUS["pad"].add(t0, sig, g)
        else:
            sig = cached(("super", ch), lambda: supersaw(ch, BAR + 0.2, seed=hash(ch) % 89))
            BUS["super"].add(t0, sig, 1.0)
            sig = cached(("pad", ch, 0.9), lambda: pad_chord(ch, BAR + 0.6, 0.9, seed=hash(ch) % 97))
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


def sub_tone(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.12 * np.sin(4 * np.pi * f * t)
    return (s * env_adsr(n, a=0.01, d=0.5, s=0.9, r=0.08) * 0.42).astype(np.float32)


def bass_note(m, dur):
    n = int((dur + 0.05) * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    cut = 300 + 900 * np.exp(-t / 0.06)
    s = additive(2 * np.pi * f * t, f, cut, kmax=30, reso=0.6, seed=m)
    return (s * env_adsr(n, a=0.003, d=0.12, s=0.5, r=0.04, hold=dur) * 0.55).astype(np.float32)


# ---------------------------------------------------------------- mixing
def sidechain(kicks, length):
    g = np.ones(length, np.float32)
    L = int(0.45 * SR)
    x = np.arange(L) / SR
    for tk, depth in kicks:
        i = int(tk * SR)
        shape = 1 - depth * np.exp(-x / 0.13) * (1 - np.exp(-x / 0.004))
        seg = g[i:i + L]
        np.minimum(seg, shape[:len(seg)], out=seg)
    return g


def reverb_ir(seconds=3.2, seed=5):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(seed)
    ir = []
    for ch in range(2):
        x = r.standard_normal(n) * np.exp(-6.9 * t / seconds)
        x = signal.sosfilt(signal.butter(1, 5500, fs=SR, output="sos"), x)
        x[: int(0.02 * SR)] = 0  # predelay
        ir.append(x / np.sqrt(np.sum(x ** 2)))
    return np.array(ir, np.float32)


def pingpong(x, delay, fb=0.38, taps=6):
    out = np.zeros_like(x)
    d = int(delay * SR)
    for k in range(1, taps + 1):
        g = fb ** k
        ch = (k % 2)
        out[ch, d * k:] += g * (x[0, :-d * k] + x[1, :-d * k]) * 0.5
    return out


def gate_silence(length):
    """Everything drops out for the last beat before each drop."""
    g = np.ones(length, np.float32)
    for bar in (23, 47):
        a = int(bt(bar, 3) * SR)
        b = int(bt(bar + 1) * SR)
        f = int(0.008 * SR)
        g[a:b] = 0
        g[a - f:a] = np.linspace(1, 0, f)
        g[b - f:b] = np.linspace(0, 1, f)
    return g


def master(kicks):
    length = BUS["pad"].x.shape[1]
    sc = sidechain(kicks, length)
    duck = {"pad": 0.85, "super": 1.0, "bass": 1.0, "sub": 1.0, "lead": 0.35,
            "pluck": 0.6, "keys": 0.3, "fx": 0.2}
    levels = {"pad": 1.0, "super": 0.95, "keys": 0.9, "pluck": 0.55, "bell": 0.7, "lead": 0.85,
              "bass": 0.7, "sub": 1.0, "kick": 0.95, "clap": 0.5, "hat": 0.6, "fx": 0.6,
              "tick": 0.3}
    gate = gate_silence(length)
    dry = np.zeros((2, length), np.float32)
    send = np.zeros((2, length), np.float32)
    env_out = {}
    for k, b in BUS.items():
        x = b.x * levels[k]
        if k in duck:
            x = x * (1 - duck[k] * (1 - sc))
        if k in ("pluck", "bell", "lead"):
            x = x + pingpong(x, BEAT * 0.75, fb=0.35 if k != "bell" else 0.45) * 0.45
        x = x * gate
        dry += x
        send += x * b.send
        env_out[k] = x
    wet = np.stack([signal.fftconvolve(send[c], IR[c])[:length] for c in range(2)])
    mix = dry + wet * 0.9
    mix = signal.sosfilt(signal.butter(2, 28, btype="high", fs=SR, output="sos"), mix)
    # gentle glue + soft clip
    peak = np.max(np.abs(mix))
    mix = mix / peak * 1.25
    mix = np.tanh(mix) / np.tanh(1.25)
    # fade in / out
    fi = int(0.05 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    end = int(DUR * SR)
    fo = int(4.0 * SR)
    mix[:, end - fo:end] *= np.linspace(1, 0, fo) ** 2
    mix = mix[:, :end] * 0.89
    return mix.astype(np.float32), env_out, wet


def frame_env(x, fps=FPS, smooth=0.0):
    """Per-video-frame RMS of a (2, n) or (n,) signal."""
    if x.ndim == 2:
        x = x.mean(0)
    hop = SR // fps
    nf = int(DUR * fps)
    x = x[: nf * hop]
    if len(x) < nf * hop:
        x = np.pad(x, (0, nf * hop - len(x)))
    e = np.sqrt(np.mean(x.reshape(nf, hop) ** 2, axis=1))
    if smooth:
        out = np.zeros_like(e)
        acc = 0
        for i, v in enumerate(e):
            acc = max(v, acc * smooth)
            out[i] = acc
        e = out
    return (e / (e.max() + 1e-9)).astype(np.float32)


IR = None

if __name__ == "__main__":
    import time
    t0 = time.time()
    os.makedirs(OUT, exist_ok=True)
    IR = reverb_ir()
    kicks = compose()
    print(f"composed in {time.time() - t0:.1f}s")
    mix, buses, wet = master(kicks)
    print(f"mixed in {time.time() - t0:.1f}s  peak={np.abs(mix).max():.3f}")
    wavfile.write(os.path.join(OUT, "music.wav"), SR, (mix.T * 32767).astype(np.int16))
    lo = signal.sosfilt(signal.butter(2, 150, fs=SR, output="sos"), mix.mean(0))
    env = {
        "master": frame_env(mix),
        "low": frame_env(lo),
        "drums": frame_env(buses["kick"] + buses["clap"]),
        "kick": frame_env(buses["kick"], smooth=0.88),
        "lead": frame_env(buses["lead"]),
        "bell": frame_env(buses["bell"], smooth=0.9),
        "pad": frame_env(buses["pad"] + buses["super"]),
        "hat": frame_env(buses["hat"], smooth=0.8),
    }
    np.savez(
        os.path.join(OUT, "sync.npz"),
        **{f"env_{k}": v for k, v in env.items()},
        kick=np.array(EVENTS["kick"]), clap=np.array(EVENTS["clap"]),
        hat=np.array(EVENTS["hat"]), ohat=np.array(EVENTS["ohat"]),
        roll=np.array(EVENTS["roll"]), impact=np.array(EVENTS["impact"]),
        tick=np.array(EVENTS["tick"]), pluck=np.array(EVENTS["pluck"]),
        keys=np.array(EVENTS["keys"]),
        bell=np.array(EVENTS["bell"]), lead=np.array(EVENTS["lead"]),
        meta=np.array([BPM, BAR, DUR, FPS]),
    )
    # quick per-section loudness report
    for name, a, b in SECTIONS:
        seg = mix[:, int(bt(a) * SR):int(bt(b) * SR)]
        print(f"{name:10s} rms {20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9):6.1f} dBFS"
              f"  peak {20 * np.log10(np.abs(seg).max() + 1e-9):6.1f}")
    print(f"done in {time.time() - t0:.1f}s")
