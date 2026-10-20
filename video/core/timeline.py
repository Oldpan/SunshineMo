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

from .gfx import W, H, CX, CY, smooth, lerp, ease_out


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

    def shot(self, t0, t1, tin=0.5, tout=0.5, kin="zoom", kout="zoom"):
        """Register a shot visible on [t0, t1); kin/kout: zoom | fade | whip | cut."""
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
            a, sc, bl, dx = 1.0, 1.0, 0.0, 0.0
            if lt < s["tin"]:
                a, sc, bl, dx = apply_transition(s["kin"], lt / s["tin"], True, w)
            if t >= s["t1"]:
                a2, sc2, bl2, dx2 = apply_transition(s["kout"], 1 - (t - s["t1"]) / s["tout"], False, w)
                a, sc, bl, dx = a * a2, sc * sc2, bl + bl2, dx + dx2
            if a <= 0.002:
                continue
            pc.save()
            pc.translate(cx + dx, cy)
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


def apply_transition(kind, u, entering, w=W):
    """u: 0 -> fully hidden, 1 -> fully visible. Returns (alpha, scale, blur, dx)."""
    if kind == "cut":
        return 1.0, 1.0, 0.0, 0.0
    e = smooth(u)
    if kind == "fade":
        return e, 1.0, 0.0, 0.0
    if kind == "zoom":
        s = lerp(1.12, 1.0, ease_out(u)) if entering else lerp(0.9, 1.0, ease_out(u))
        return e, s, (1 - e) * 14, 0.0
    if kind == "whip":
        dx = (1 - ease_out(u, 4)) * (w * 0.6) * (1 if entering else -1)
        return e, 1.0, (1 - e) * 22, dx
    return e, 1.0, 0.0, 0.0


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

    def index(self, name, t):
        """Index of the last event of this kind at or before t (-1 if none)."""
        return int(np.searchsorted(self.ev[name], t, "right") - 1)
