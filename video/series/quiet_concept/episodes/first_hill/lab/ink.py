"""Ink-wash (水墨) toolkit for 第一座山, drawn with skia: rice paper, five ink tones, bristle strokes, masses, mist.

Grammar from lemo-opuscar's ink-wash STYLE.md: forms are loaded brushstrokes on warm paper, most of the frame
is empty paper (mist), one vermilion accent only (the lantern / the seal).  Everything is seeded by index so a
stroke looks the same on every frame.
"""
import math

import numpy as np
import skia
from scipy.ndimage import gaussian_filter

PAPER = (0.949, 0.925, 0.871)            # #F2ECDE
INKC = (0.07, 0.07, 0.08)
RED = (0.69, 0.18, 0.13)                 # #B02E22
TONE = {"jiao": 0.96, "nong": 0.82, "zhong": 0.60, "dan": 0.34, "qing": 0.16}


def col4(c, a):
    return skia.Color4f(c[0], c[1], c[2], a)


def ink_paint(a, stroke=0.0, blur=0.0, col=INKC):
    p = skia.Paint(AntiAlias=True, Color4f=col4(col, a))
    p.setBlendMode(skia.BlendMode.kMultiply)
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(stroke)
        p.setStrokeCap(skia.Paint.kRound_Cap)
        p.setStrokeJoin(skia.Paint.kRound_Join)
    if blur:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p


_paper = {}


def paper_image(w, h, seed=7):
    """Procedural rice paper: warm base, cloud mottling, long fibres, pulp flecks, grain."""
    key = (w, h, seed)
    if key in _paper:
        return _paper[key]
    r = np.random.default_rng(seed)
    base = np.ones((h, w, 3), np.float32) * np.array(PAPER, np.float32)
    mott = gaussian_filter(r.standard_normal((h // 4, w // 4)).astype(np.float32), 18)
    mott = np.kron(mott / (np.abs(mott).max() + 1e-6), np.ones((4, 4), np.float32))[:h, :w]
    base *= (1 + 0.035 * mott)[..., None]
    grain = gaussian_filter(r.standard_normal((h, w)).astype(np.float32), 0.7)
    base *= (1 + 0.018 * grain)[..., None]
    img = np.clip(base * 255, 0, 255).astype(np.uint8)
    rgba = np.dstack([img, np.full((h, w), 255, np.uint8)])
    im = skia.Image.fromarray(rgba, colorType=skia.kRGBA_8888_ColorType)
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.drawImage(im, 0, 0)
    for i in range(900):                                     # fibres
        x, y = r.uniform(0, w), r.uniform(0, h)
        ang = r.uniform(0, math.pi)
        L = r.uniform(8, 60)
        p = skia.Path()
        p.moveTo(x, y)
        p.quadTo(x + math.cos(ang) * L * 0.5 + r.uniform(-6, 6), y + math.sin(ang) * L * 0.5 + r.uniform(-6, 6),
                 x + math.cos(ang) * L, y + math.sin(ang) * L)
        c.drawPath(p, ink_paint(r.uniform(0.02, 0.06), stroke=r.uniform(0.4, 1.0), col=(0.55, 0.5, 0.42)))
    for i in range(500):                                     # pulp flecks
        c.drawCircle(r.uniform(0, w), r.uniform(0, h), r.uniform(0.4, 1.3),
                     ink_paint(r.uniform(0.05, 0.15), col=(0.45, 0.4, 0.33)))
    _paper[key] = surf.makeImageSnapshot()
    return _paper[key]


def noise1(x, seed):
    """Smooth 1-D value noise in [0, 1]."""
    i = math.floor(x)
    f = x - i
    def h(n):
        return (math.sin(n * 127.1 + seed * 311.7) * 43758.5453) % 1.0
    u = f * f * (3 - 2 * f)
    return h(i) * (1 - u) + h(i + 1) * u


def resample(pts, n):
    pts = np.asarray(pts, np.float64)
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
    s = np.linspace(0, d[-1], n)
    return np.c_[np.interp(s, d, pts[:, 0]), np.interp(s, d, pts[:, 1])], d[-1]


def brush(c, pts, width, tone="nong", dry=0.2, bristles=24, seed=0, u=1.0, loaded=0.6, taper=(0.15, 0.3),
          wet=0.0, col=INKC):
    """A bristle stroke along pts (drawn up to fraction u).  dry 0 = solid wet stroke, 1 = flying white.
    loaded > 0 makes one side darker so the stroke carries its own contour."""
    if u <= 0:
        return
    P, L = resample(pts, 160)
    n = max(2, int(len(P) * u))
    P = P[:n]
    T = np.gradient(P, axis=0)
    T /= np.linalg.norm(T, axis=1)[:, None] + 1e-9
    N = np.c_[-T[:, 1], T[:, 0]]
    a0 = TONE[tone]
    s_norm = np.arange(n) / 159.0
    press = np.minimum(np.minimum(s_norm / max(taper[0], 1e-3), 1), np.minimum((1 - s_norm) / max(taper[1], 1e-3), 1))
    press = 0.35 + 0.65 * np.sqrt(np.clip(press, 0, 1))
    if wet > 0:
        p = skia.Path()
        for k in range(n):
            (p.moveTo if k == 0 else p.lineTo)(*P[k])
        c.drawPath(p, ink_paint(a0 * 0.25 * wet, stroke=width * 1.6, blur=width * 0.5, col=col))
    for b in range(bristles):
        off = (b + 0.5) / bristles - 0.5
        side = 1 + loaded * (off * 2)                         # darker on the + side
        load0 = 0.75 + 0.25 * noise1(b * 3.1, seed)
        path = skia.Path()
        on = False
        for k in range(n):
            load = load0 - dry * 1.1 * s_norm[k]               # ink runs out along the stroke
            brk = noise1(s_norm[k] * 9 + b * 7.7, seed + b) * 0.9 + noise1(s_norm[k] * 40 + b, seed) * 0.1
            alive = brk < load * 0.9 + 0.12 - dry * 0.3
            w = width * press[k] * (1 + 0.08 * (noise1(s_norm[k] * 30, seed + 5) - 0.5))
            x, y = P[k] + N[k] * off * w
            if alive and not on:
                path.moveTo(x, y)
                on = True
            elif alive:
                path.lineTo(x, y)
            else:
                on = False
        a = a0 * max(0.15, min(1, side)) * (0.55 + 0.45 * load0)
        c.drawPath(path, ink_paint(min(0.95, a), stroke=max(0.8, width / bristles * 1.6), col=col))


def mass(c, poly, tone="dan", seed=0, fade_down=True, h=None, blur=6.0, a=1.0):
    """A soft ink mass: jittered polygon with a top-to-bottom gradient that dissolves into mist."""
    r = np.random.default_rng(seed)
    p = skia.Path()
    for k, (x, y) in enumerate(poly):
        x += r.uniform(-2, 2)
        y += r.uniform(-2, 2)
        (p.moveTo if k == 0 else p.lineTo)(x, y)
    p.close()
    b = p.getBounds()
    a0 = TONE[tone] * a
    if fade_down:
        y1 = b.bottom() if h is None else b.top() + h
        sh = skia.GradientShader.MakeLinear([skia.Point(0, b.top()), skia.Point(0, y1)],
                                            [col4(INKC, a0), col4(INKC, a0 * 0.55), col4(INKC, 0)], [0, 0.35, 1])
    else:
        sh = None
    pt = ink_paint(a0, blur=blur)
    if sh is not None:
        pt.setShader(sh)
    c.drawPath(p, pt)


def mist(c, y, h, w, a=0.9, col=PAPER):
    """A band of blank paper (mist) laid over the ink."""
    sh = skia.GradientShader.MakeLinear([skia.Point(0, y - h / 2), skia.Point(0, y + h / 2)],
                                        [col4(col, 0), col4(col, a), col4(col, 0)], [0, 0.5, 1])
    c.drawRect(skia.Rect.MakeLTRB(0, y - h / 2, w, y + h / 2), skia.Paint(Shader=sh))


def moss(c, pts, seed=0, tone="jiao", size=4.0):
    r = np.random.default_rng(seed)
    for x, y in pts:
        for _ in range(3):
            c.drawOval(skia.Rect.MakeXYWH(x + r.uniform(-6, 6), y + r.uniform(-4, 4), size * r.uniform(0.7, 1.4),
                                          size * r.uniform(0.5, 1.0)), ink_paint(TONE[tone] * r.uniform(0.6, 1)))


def seal(c, x, y, s, text, font):
    """白文 seal: the characters knocked out of a slightly irregular vermilion square."""
    r = np.random.default_rng(3)
    p = skia.Path()
    pts = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
    for k, (px, py) in enumerate(pts):
        (p.moveTo if k == 0 else p.lineTo)(x + px * s + r.uniform(-2, 2), y + py * s + r.uniform(-2, 2))
    p.close()
    c.saveLayer()
    c.drawPath(p, skia.Paint(AntiAlias=True, Color4f=col4(RED, 0.92)))
    clear = skia.Paint(AntiAlias=True, Color4f=col4((0, 0, 0), 1))
    clear.setBlendMode(skia.BlendMode.kDstOut)
    n = len(text)
    cols = 2 if n == 4 else 1
    rows = math.ceil(n / cols)
    cell = 2 * s * 0.84 / max(rows, cols)
    for i, ch in enumerate(text):
        cx = x + s * 0.42 - (i // rows) * cell - cell / 2 + (cell / 2 if cols == 1 else 0) - (s * 0.42 - cell if cols == 1 else 0)
        cy = y - s * 0.84 + (i % rows) * cell + cell * 0.85
        f = skia.Font(font.getTypeface(), cell * 0.92)
        c.drawString(ch, cx - f.measureText(ch) / 2, cy, f, clear)
    for _ in range(40):
        c.drawCircle(x + r.uniform(-s, s), y + r.uniform(-s, s), r.uniform(0.5, 1.5), clear)
    c.restore()
