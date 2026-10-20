"""Procedural audio toolkit: oscillators, instruments, drums, fx, mixing, sync export.

Everything is synthesized from sine/noise with numpy/scipy: no samples, no audio files,
no virtual instruments.  A song module supplies harmony, arrangement and levels; this
module supplies the sounds and the plumbing.

    song = Song(bpm=100, bars=74)
    buses = make_buses(song, {"pad": 0.35, "kick": 0.03, ...})   # name -> reverb send
    ev = Events()
    buses["kick"].add(song.bt(0), kick()); ev.add("kick", song.bt(0))
    mix, wet_buses = mixdown(song, buses, kicks, levels, duck, echo, ir=reverb_ir())
    export(out_dir, song, mix, wet_buses, ev)   # music.wav + sync.npz for the renderer
"""
import os
import zlib

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000


class Song:
    """Tempo grid. Times are in seconds; bars are 4 beats."""

    def __init__(self, bpm, bars, fps=60, sections=()):
        self.bpm, self.bars, self.fps = bpm, bars, fps
        self.beat = 60 / bpm
        self.bar = 4 * self.beat
        self.s16 = self.beat / 4
        self.dur = bars * self.bar
        self.n = int(self.dur * SR)
        self.sections = list(sections)  # (name, first bar, end bar)

    def bt(self, bar, beat=0.0):
        return bar * self.bar + beat * self.beat

    def section(self, bar):
        for name, a, b in self.sections:
            if a <= bar < b:
                return name
        return self.sections[-1][0] if self.sections else ""


def stable_seed(*xs, mod=2**31):
    """Deterministic seed from any key. Never use hash(): str hashes change every run."""
    return zlib.crc32(repr(xs).encode()) % mod


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- buses / events
class Bus:
    def __init__(self, name, n, send=0.0):
        self.name = name
        self.x = np.zeros((2, n + SR * 4), np.float32)
        self.send = send

    def add(self, t, sig, gain=1.0, pan=0.0):
        """Mix a mono (equal-power panned) or stereo signal in at time t."""
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


def make_buses(song, sends):
    return {k: Bus(k, song.n, s) for k, s in sends.items()}


class Events(dict):
    """name -> list of times (or tuples whose first item is the time)."""

    def add(self, name, item):
        self.setdefault(name, []).append(item)


_cache = {}


def cached(key, fn):
    """Memoise expensive voices that repeat (same chord, same drum)."""
    if key not in _cache:
        _cache[key] = fn()
    return _cache[key]


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


def bandnoise(n, lo, hi, order=2, seed=None):
    x = np.random.default_rng(seed).standard_normal(n).astype(np.float32)
    if lo and hi:
        sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    elif lo:
        sos = signal.butter(order, lo, btype="high", fs=SR, output="sos")
    else:
        sos = signal.butter(order, hi, btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x).astype(np.float32)


# ---------------------------------------------------------------- instruments
def pad_chord(notes, dur, bright=1.0, voices=3, det=0.12, seed=0):
    """Warm detuned saw pad, stereo. notes: midi numbers."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    for j, m in enumerate(notes):
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


def supersaw(notes, dur, seed=0):
    """Bright 5-voice supersaw chord (adds the root an octave up)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    notes = list(notes) + [notes[0] + 12]
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


# ---------------------------------------------------------------- drums
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


def tick(hi=True):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    f = 2600 if hi else 1900
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) * 0.35).astype(np.float32)


# ---------------------------------------------------------------- fx
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


# ---------------------------------------------------------------- lo-fi kit
def lowpass(x, hz, order=2):
    return signal.sosfilt(signal.butter(order, hz, fs=SR, output="sos"), x, axis=-1).astype(np.float32)


def highpass(x, hz, order=2):
    return signal.sosfilt(signal.butter(order, hz, btype="high", fs=SR, output="sos"), x,
                          axis=-1).astype(np.float32)


def swing_time(song, bar, step16, amt=0.58):
    """Time of the step16-th sixteenth of a bar, with every odd sixteenth pushed late (0.5 = straight)."""
    pair, odd = divmod(step16, 2)
    return song.bt(bar) + (pair * 2 + (2 * amt if odd else 0)) * song.s16


def piano_note(m, dur=1.5, vel=0.8, seed=0):
    """Additive acoustic-piano tone: slightly stretched partials, two detuned strings, hammer noise."""
    f = mtof(m)
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(seed)
    tau = 2.4 * (261.6 / f) ** 0.5  # low notes ring longer
    out = np.zeros(n, np.float32)
    for k in range(1, 25):
        fk = k * f * np.sqrt(1 + 0.00035 * k * k)
        if fk > 15000:
            break
        amp = k ** -1.1 * np.exp(-k / (3 + 7 * vel))
        ph = r.uniform(0, 2 * np.pi)
        tone = np.sin(2 * np.pi * fk * t + ph) + 0.6 * np.sin(2 * np.pi * fk * 1.0013 * t + ph * 1.3)
        out += (amp * tone * np.exp(-t / (tau / (1 + 0.35 * (k - 1))))).astype(np.float32)
    hammer = bandnoise(n, 800, 5000, seed=seed + 5) * np.exp(-t / 0.01) * 0.08 * vel
    e = np.minimum(t / 0.002, 1) * np.clip(1 - (t - dur) / 0.35, 0, 1)
    return ((out * 0.18 + hammer) * e * vel).astype(np.float32)


def string_pad(notes, dur, attack=0.9, bright=0.5, seed=0):
    """Slow-bowed string ensemble: four detuned saws per note with delayed vibrato, stereo."""
    n = int((dur + 0.8) * SR)
    t = np.arange(n) / SR
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    for j, m in enumerate(notes):
        for v in range(4):
            f = mtof(m) * 2 ** ((v - 1.5) * 5 / 1200)
            vib = 1 + 0.003 * np.sin(2 * np.pi * (4.8 + 0.3 * v) * t + v) * np.clip((t - 0.4) / 0.8, 0, 1)
            ph = 2 * np.pi * np.cumsum(f * vib) / SR
            s = additive(ph, f, 900 + 1800 * bright, kmax=30, seed=seed * 100 + j * 10 + v)
            p = v / 3 * 2 - 1
            L += s * (1 - 0.5 * p)
            R += s * (1 + 0.5 * p)
    e = env_adsr(n, a=attack, d=1.5, s=0.85, r=0.8, hold=dur)
    return np.stack([L * e, R * e]) * 0.04


def kick_lofi():
    """Round, low-click kick for boom-bap / lo-fi beats."""
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 52 + 70 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.19)
    knock = bandnoise(n, 200, 1200, seed=12) * np.exp(-t / 0.008) * 0.15
    s = np.tanh(1.3 * (body + knock)) * np.minimum(t / 0.002, 1)
    return lowpass(s, 3000) * 0.9


def rim(seed=14):
    """Side-stick click."""
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    nz = bandnoise(n, 1500, 6000, seed=seed) * np.exp(-t / 0.004)
    tone = np.sin(2 * np.pi * 1750 * t) * np.exp(-t / 0.012) * 0.5 + np.sin(2 * np.pi * 480 * t) * np.exp(
        -t / 0.02) * 0.4
    return ((nz * 0.6 + tone) * 0.45).astype(np.float32)


def alarm_beep(groups=2, beeps=4, gap=0.11, on=0.065, group_gap=0.45, f=2000.0):
    """Digital alarm clock: groups of short square-wave beeps."""
    span = beeps * gap + group_gap
    n = int((groups * span + 0.2) * SR)
    t = np.arange(n) / SR
    tone = additive(2 * np.pi * f * t, f, 6000.0, kmax=7, shape="square", seed=0)
    gate = np.zeros(n, np.float32)
    for g in range(groups):
        for b in range(beeps):
            a = int((g * span + b * gap) * SR)
            m = int(on * SR)
            gate[a:a + m] = np.minimum(1, np.minimum(np.arange(m), m - np.arange(m)) / (0.003 * SR))
    return lowpass(tone * gate * 0.3, 5000)


def rustle(dur=0.3, seed=0):
    """Paper rustle / page flip: band noise with a jagged, quickly decaying envelope."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(seed)
    nz = bandnoise(n, 1200, 7000, seed=seed + 40)
    grit = np.repeat(r.uniform(0.3, 1.0, n // 240 + 1), 240)[:n]
    e = np.minimum(t / 0.01, 1) * np.exp(-t / (dur * 0.35)) * grit
    return (nz * e * 0.4).astype(np.float32)


def vinyl(n, seed=21, crackle=1.0, hiss=1.0):
    """Record surface noise, stereo: hiss + rumble + sparse crackle (clicks with heavy-tailed sizes)."""
    r = np.random.default_rng(seed)
    out = np.zeros((2, n), np.float32)
    for ch in range(2):
        h = bandnoise(n, 2000, 9000, seed=seed + ch) * 0.006 * hiss
        rumble = bandnoise(n, 30, 120, seed=seed + 10 + ch) * 0.008
        k = int(n / SR * 14 * crackle)
        imp = np.zeros(n, np.float32)
        imp[r.integers(0, n, k)] += np.minimum(r.pareto(2.2, k) * 0.02, 0.1) * r.choice([-1, 1], k)
        kern = np.exp(-np.arange(int(0.0015 * SR)) / (0.0003 * SR)).astype(np.float32)
        crack = highpass(np.convolve(imp, kern)[:n], 900)
        out[ch] = h + rumble + crack
    return out


def tape_wow(x, depth=0.001, rate=0.55, flutter=0.00012, frate=7.3):
    """Tape wow & flutter: a slowly modulated delay (depth in seconds) gives a gentle pitch drift."""
    n = x.shape[-1]
    t = np.arange(n) / SR
    d = depth * (1 + np.sin(2 * np.pi * rate * t)) + flutter * np.sin(2 * np.pi * frate * t + 1.0)
    pos = np.arange(n) - d * SR
    src = np.arange(n)
    return np.stack([np.interp(pos, src, x[c]) for c in range(x.shape[0])]).astype(np.float32)


def tape_stop(x, t0, dur, curve=1.6):
    """Playback slows from full speed to a halt over [t0, t0 + dur]; silent afterwards until the caller
    lets sound back in (e.g. with gate_silence)."""
    y = x.copy()
    i0, m = int(t0 * SR), int(dur * SR)
    u = np.arange(m) / m
    pos = i0 + np.cumsum((1 - u) ** curve)
    src = np.arange(x.shape[-1])
    for c in range(x.shape[0]):
        y[c, i0:i0 + m] = np.interp(pos, src, x[c]) * (1 - u ** 6)
    return y


# ---------------------------------------------------------------- mixing
def sidechain(kicks, length):
    """Gain curve ducking on each (time, depth) kick."""
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
    """Stereo convolution-reverb impulse: filtered, exponentially decaying noise."""
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


def gate_silence(length, spans):
    """Mute the mix over each (t_start, t_end) span, e.g. the beat before a drop."""
    g = np.ones(length, np.float32)
    f = int(0.008 * SR)
    for ta, tb in spans:
        a, b = int(ta * SR), int(tb * SR)
        g[a:b] = 0
        g[a - f:a] = np.linspace(1, 0, f)
        g[b - f:b] = np.linspace(0, 1, f)
    return g


def mixdown(song, buses, kicks, levels, duck=None, echo=None, ir=None, silence=(), wet_gain=0.9,
            drive=1.25, fade_out=4.0, out_gain=0.89):
    """Sum buses with levels, sidechain ducking, ping-pong echo and a shared reverb send,
    then high-pass, soft-clip and fade.  Returns (mix (2, n), per-bus processed signals).

    duck: bus -> sidechain depth; echo: bus -> (delay seconds, feedback)."""
    duck, echo = duck or {}, echo or {}
    length = next(iter(buses.values())).x.shape[1]
    sc = sidechain(kicks, length)
    gate = gate_silence(length, silence)
    dry = np.zeros((2, length), np.float32)
    send = np.zeros((2, length), np.float32)
    env_out = {}
    for k, b in buses.items():
        x = b.x * levels[k]
        if k in duck:
            x = x * (1 - duck[k] * (1 - sc))
        if k in echo:
            delay, fb = echo[k]
            x = x + pingpong(x, delay, fb=fb) * 0.45
        x = x * gate
        dry += x
        send += x * b.send
        env_out[k] = x
    mix = dry
    if ir is not None:
        wet = np.stack([signal.fftconvolve(send[c], ir[c])[:length] for c in range(2)])
        mix = dry + wet * wet_gain
    mix = signal.sosfilt(signal.butter(2, 28, btype="high", fs=SR, output="sos"), mix)
    peak = np.max(np.abs(mix))
    mix = mix / peak * drive
    mix = np.tanh(mix) / np.tanh(drive)
    fi = int(0.05 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    end = int(song.dur * SR)
    fo = int(fade_out * SR)
    mix[:, end - fo:end] *= np.linspace(1, 0, fo) ** 2
    mix = mix[:, :end] * out_gain
    return mix.astype(np.float32), env_out


# ---------------------------------------------------------------- export for the renderer
def frame_env(x, song, smooth=0.0):
    """Per-video-frame RMS of a (2, n) or (n,) signal, normalised to 0..1.
    smooth > 0 holds peaks and decays by that factor per frame."""
    if x.ndim == 2:
        x = x.mean(0)
    hop = SR // song.fps
    nf = int(song.dur * song.fps)
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


# envelope name -> (buses summed, peak-hold smoothing); missing buses are skipped
DEFAULT_ENVS = [
    ("drums", ("kick", "clap"), 0.0),
    ("kick", ("kick",), 0.88),
    ("lead", ("lead",), 0.0),
    ("bell", ("bell",), 0.9),
    ("pad", ("pad", "super"), 0.0),
    ("hat", ("hat",), 0.8),
]


def export(out_dir, song, mix, buses, events, envs=DEFAULT_ENVS):
    """Write music.wav and sync.npz (env_<name> per-frame envelopes + event arrays + meta)."""
    os.makedirs(out_dir, exist_ok=True)
    wavfile.write(os.path.join(out_dir, "music.wav"), SR, (mix.T * 32767).astype(np.int16))
    lo = signal.sosfilt(signal.butter(2, 150, fs=SR, output="sos"), mix.mean(0))
    env = {"master": frame_env(mix, song), "low": frame_env(lo, song)}
    for name, names, sm in envs:
        have = [buses[b] for b in names if b in buses]
        if have:
            sig = have[0]
            for h in have[1:]:
                sig = sig + h
            env[name] = frame_env(sig, song, smooth=sm)
        else:
            env[name] = np.zeros(int(song.dur * song.fps), np.float32)
    np.savez(os.path.join(out_dir, "sync.npz"),
             **{f"env_{k}": v for k, v in env.items()},
             **{k: np.array(v) for k, v in events.items()},
             meta=np.array([song.bpm, song.bar, song.dur, song.fps]))


def loudness_report(mix, song):
    for name, a, b in song.sections:
        seg = mix[:, int(song.bt(a) * SR):int(song.bt(b) * SR)]
        print(f"{name:10s} rms {20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9):6.1f} dBFS"
              f"  peak {20 * np.log10(np.abs(seg).max() + 1e-9):6.1f}")
