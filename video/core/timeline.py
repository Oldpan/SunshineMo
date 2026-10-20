"""Timeline: bar grid, sections, shots with transitions, and the music sync table.

    tl = Timeline(bpm=100, bars=74, sections=[("intro", 0, 8), ...])

    @tl.shot(tl.B(2), tl.B(4), kin="fade", kout="zoom")
    def line1(c, x, t, lt):        # c: canvas, x: Ctx, t: global time, lt: time since shot start
        ...

    pic = tl.record(x, t)          # all live shots, transitions applied, as a skia Picture
"""
import math

import numpy as np
import skia

from .gfx import W, H, CX, CY, smooth, lerp, ease_out, back_out


class Timeline:
    def __init__(self, bpm, bars, sections=(), fps=60, w=W, h=H):
        self.bpm, self.bars, self.fps = bpm, bars, fps
        self.beat = 60 / bpm
        self.bar = 4 * self.beat
        self.dur = bars * self.bar
        self.sections = list(sections)
        self.shots = []
        self.w, self.h = w, h

    def B(self, bar, beat=0.0):
        """Seconds at (bar, beat)."""
        return bar * self.bar + beat * self.beat

    def section_at(self, t):
        for name, a, b in self.sections:
            if self.B(a) <= t < self.B(b):
                return name
        return self.sections[-1][0] if self.sections else ""

    def look_at(self, looks, t, fast=(), width=1.6, lead=0.8, fast_width=0.12, lead_from_first=True):
        """Blend per-section palettes (dicts of floats / tuples) at time t.  Sections named in `fast`
        switch in fast_width seconds on their downbeat; the others glide over `width` seconds,
        starting `lead` seconds early.  lead_from_first=False keeps the first section unblended
        until its end (how neon_science's first film was rendered)."""
        names = [s[0] for s in self.sections]
        starts = [self.B(s[1]) for s in self.sections]
        i = max([j for j, s in enumerate(starts) if s <= t + 1e-6] or [0])
        cur = looks[names[i]]
        prev, u = cur, 1.0
        if i > 0:
            prev = looks[names[i - 1]]
            wd, ld = (fast_width, 0.0) if names[i] in fast else (width, lead)
            u = smooth((t - starts[i] + ld) / wd)
        if i == 0 and not lead_from_first:
            return dict(cur)
        nxt_u = None
        if i + 1 < len(starts) and names[i + 1] not in fast and t > starts[i + 1] - lead:
            nxt_u = smooth((t - starts[i + 1] + lead) / width)
        out = {}
        for k in cur:
            a, b = prev[k], cur[k]
            v = tuple(lerp(p, q, u) for p, q in zip(a, b)) if isinstance(a, tuple) else lerp(a, b, u)
            if nxt_u is not None:
                n_ = looks[names[i + 1]][k]
                v = tuple(lerp(p, q, nxt_u) for p, q in zip(v, n_)) if isinstance(v, tuple) else lerp(v, n_, nxt_u)
            out[k] = v
        return out

    def shot(self, t0, t1, tin=0.5, tout=0.5, kin="zoom", kout="zoom"):
        """Register a shot visible on [t0, t1); kin/kout: zoom | fade | whip | cut | slide | drop."""
        def deco(fn):
            self.shots.append(dict(t0=t0, t1=t1, tin=tin, tout=tout, kin=kin, kout=kout, fn=fn))
            return fn
        return deco

    def record(self, x, t):
        """Draw every live shot into a Picture, applying in/out transitions."""
        w, h = self.w, self.h
        cx, cy = w / 2, h / 2
        rec = skia.PictureRecorder()
        pc = rec.beginRecording(skia.Rect(0, 0, w, h))
        for s in self.shots:
            if not (s["t0"] <= t < s["t1"] + s["tout"]):
                continue
            lt = t - s["t0"]
            a, sc, bl, dx, dy, rot = 1.0, 1.0, 0.0, 0.0, 0.0, 0.0
            if lt < s["tin"]:
                a, sc, bl, dx, dy, rot = apply_transition(s["kin"], lt / s["tin"], True, w, h)
            if t >= s["t1"]:
                a2, sc2, bl2, dx2, dy2, rot2 = apply_transition(s["kout"], 1 - (t - s["t1"]) / s["tout"], False,
                                                                w, h)
                a, sc, bl, dx, dy, rot = a * a2, sc * sc2, bl + bl2, dx + dx2, dy + dy2, rot + rot2
            if a <= 0.002:
                continue
            pc.save()
            pc.translate(cx + dx, cy + dy)
            if rot:
                pc.rotate(rot)
            pc.scale(sc, sc)
            pc.translate(-cx, -cy)
            if a < 0.999 or bl > 0.3:
                p = skia.Paint(Alphaf=a)
                if bl > 0.3:
                    p.setImageFilter(skia.ImageFilters.Blur(bl if s["kin"] != "whip" else bl * 2, bl * 0.4 if
                                                            s["kin"] == "whip" else bl))
                pc.saveLayer(None, p)
                s["fn"](pc, x, t, lt)
                pc.restore()
            else:
                s["fn"](pc, x, t, lt)
            pc.restore()
        return rec.finishRecordingAsPicture()


def tape_time(t, t0, dur, curve=1.6):
    """Picture time through a tape stop that starts at t0 and lasts dur (same curve as
    core.synth.tape_stop): slows with the audio, then freezes."""
    if t < t0:
        return t
    u = min((t - t0) / dur, 1.0)
    return t0 + dur * (1 - (1 - u) ** (curve + 1)) / (curve + 1)


def apply_transition(kind, u, entering, w=W, h=H):
    """u: 0 -> fully hidden, 1 -> fully visible. Returns (alpha, scale, blur, dx, dy, rotation degrees)."""
    if kind == "cut":
        return 1.0, 1.0, 0.0, 0.0, 0.0, 0.0
    e = smooth(u)
    if kind == "fade":
        return e, 1.0, 0.0, 0.0, 0.0, 0.0
    if kind == "zoom":
        s = lerp(1.12, 1.0, ease_out(u)) if entering else lerp(0.9, 1.0, ease_out(u))
        return e, s, (1 - e) * 14, 0.0, 0.0, 0.0
    if kind == "whip":
        dx = (1 - ease_out(u, 4)) * (w * 0.6) * (1 if entering else -1)
        return e, 1.0, (1 - e) * 22, dx, 0.0, 0.0
    if kind == "slide":  # a sheet of paper slid in from below / pushed away upwards
        v = 1 - ease_out(u, 3)
        if entering:
            return smooth(u * 2.2), 1.0, 0.0, 0.0, v * h * 0.42, -4.0 * v
        return smooth(u * 1.6), 1.0, 0.0, 0.0, -v * h * 0.3, 3.0 * v
    if kind == "drop":  # falls onto the desk with a little bounce
        if entering:
            return smooth(u * 3), lerp(1.25, 1.0, back_out(u, 2.2)), 0.0, 0.0, 0.0, (1 - ease_out(u)) * 6
        return e, lerp(0.94, 1.0, u), 0.0, 0.0, 0.0, 0.0
    return e, 1.0, 0.0, 0.0, 0.0, 0.0


class Ctx:
    """Per-frame knobs shots can push to the style (camera, post effects)."""

    def __init__(self, t):
        self.t = t
        self.chroma = 0.0
        self.shake = 0.0
        self.split = 0.0
        self.dim = 0.0
        self.flash = 0.0
        self.zoom = 1.0
        self.look = None  # set by styles that blend palettes, so shots can pick their colours


class Sync:
    """Reads sync.npz from core.synth.export: env_<name> per-frame envelopes + event times."""

    def __init__(self, path, fps=60):
        d = np.load(path)
        self.fps = fps
        self.env = {k[4:]: d[k] for k in d.files if k.startswith("env_")}
        self.ev = {}
        for k in d.files:
            if k.startswith("env_") or k == "meta" or not d[k].size:
                continue
            a = d[k]
            self.ev[k] = np.sort(np.atleast_1d(a) if a.ndim == 1 else a[:, 0])

    def e(self, name, t):
        """Envelope value 0..1 at time t."""
        a = self.env[name]
        return float(a[min(max(int(t * self.fps), 0), len(a) - 1)])

    def since(self, name, t):
        """Seconds since the last event of this kind (1e9 if none yet)."""
        a = self.ev.get(name)
        if a is None:
            return 1e9
        i = np.searchsorted(a, t, "right") - 1
        return t - a[i] if i >= 0 else 1e9

    def pulse(self, name, t, decay=0.15):
        """Exponential decay 1 -> 0 after each event."""
        s = self.since(name, t)
        return math.exp(-s / decay) if s < 10 * decay else 0.0

    def count(self, name, a, b):
        """Number of events of this kind in [a, b]."""
        ev = self.ev.get(name)
        if ev is None:
            return 0
        return int(np.searchsorted(ev, b, "right") - np.searchsorted(ev, a, "left"))

    def index(self, name, t):
        """Index of the last event of this kind at or before t (-1 if none)."""
        return int(np.searchsorted(self.ev[name], t, "right") - 1)
