"""Halftone-dossier toolkit (lemo `halftone-dossier` grammar, our own code): a retro printed case file.

Cream paper multiplied over everything, a navy ink, a cobalt overprint shadow, a yellow highlight, one red for
stamps.  Shading is halftone dots, never gradients.  Headlines pop per character with a misregistered shadow,
the caption bar is a dark pill, stamps slam, characters have a heavy outline and a 10 fps line boil.
Fonts come from ./fonts.sh (OFL, not in git).
"""
import math
import os

import numpy as np
import skia

PAPER = (0.953, 0.914, 0.824)
INK = (0.114, 0.169, 0.310)
OVER = (0.255, 0.388, 0.690)
HI = (0.957, 0.761, 0.188)
RED = (0.851, 0.251, 0.184)
RAT = (0.600, 0.553, 0.506)
BELLY = (0.835, 0.776, 0.710)
PINK = (0.937, 0.580, 0.620)
WHITE = (1.0, 1.0, 1.0)

_FD = os.path.expanduser("~/.local/share/fonts/dossier")
FONTS = {
    "serif": f"{_FD}/NotoSerifCJKsc-Black.otf",
    "sans": f"{_FD}/NotoSansCJKsc-Black.otf",
    "fun": f"{_FD}/ZCOOLKuaiLe-Regular.ttf",
    "num": f"{_FD}/BagelFatOne-Regular.ttf",
    "mono": "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-ExtraBold.ttf",
}
_tf = {}


def font(size, kind="serif"):
    path = FONTS[kind]
    if path not in _tf:
        if not os.path.exists(path):
            raise SystemExit(f"missing font {path}: run ./fonts.sh")
        _tf[path] = skia.Typeface.MakeFromFile(path)
    f = skia.Font(_tf[path], size)
    f.setSubpixel(True)
    f.setEdging(skia.Font.Edging.kAntiAlias)
    return f


def col4(c, a=1.0):
    return skia.Color4f(c[0], c[1], c[2], a)


def paint(col=INK, a=1.0, stroke=0.0, mult=False, boil=None, blur=0.0):
    p = skia.Paint(AntiAlias=True, Color4f=col4(col, a))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(stroke)
        p.setStrokeCap(skia.Paint.kRound_Cap)
        p.setStrokeJoin(skia.Paint.kRound_Join)
    if mult:
        p.setBlendMode(skia.BlendMode.kMultiply)
    if boil is not None:
        p.setPathEffect(skia.DiscretePathEffect.Make(14, 1.4, boil))
    if blur:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def back_out(u, s=1.9):
    u = clamp(u) - 1
    return 1 + u * u * ((s + 1) * u + s)


def ease_out(u, p=3):
    return 1 - (1 - clamp(u)) ** p


def boil_seed(t, fps=10):
    """Line boil reseeds ~10x a second: the drawing breathes while positions stay smooth."""
    return int(t * fps) % 997


# ------------------------------------------------------------------ paper and grain
_paper = {}


def paper_image(w, h, seed=5):
    """Cream sheet: low-frequency mottling, fine grain, a vignette and a faint centre fold (multiply layer)."""
    if (w, h) in _paper:
        return _paper[(w, h)]
    r = np.random.default_rng(seed)
    small = r.random((h // 60 + 2, w // 60 + 2))
    yy = np.linspace(0, small.shape[0] - 1.001, h)
    xx = np.linspace(0, small.shape[1] - 1.001, w)
    y0, x0 = yy.astype(int), xx.astype(int)
    fy, fx = (yy - y0)[:, None], (xx - x0)[None, :]
    fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
    s = small
    mott = (s[y0][:, x0] * (1 - fx) * (1 - fy) + s[y0][:, x0 + 1] * fx * (1 - fy)
            + s[y0 + 1][:, x0] * (1 - fx) * fy + s[y0 + 1][:, x0 + 1] * fx * fy)
    grain = r.random((h, w))
    vx = (np.arange(w) - w / 2) / (w / 2)
    vy = (np.arange(h) - h / 2) / (h / 2)
    vig = 1 - 0.16 * (vx[None, :] ** 2 + vy[:, None] ** 2)
    fold = 1 - 0.035 * np.exp(-((np.arange(w) - w * 0.5) / 3.0) ** 2)[None, :]
    lum = (0.94 + 0.06 * mott + 0.035 * (grain - 0.5)) * vig * fold
    img = np.empty((h, w, 4), np.uint8)
    for k, cc in enumerate(PAPER):
        img[..., k] = np.clip(255 * cc * lum, 0, 255).astype(np.uint8)
    img[..., 3] = 255
    _paper[(w, h)] = skia.Image.fromarray(img, colorType=skia.kRGBA_8888_ColorType)
    return _paper[(w, h)]


def grain(c, t, w=1920, h=1080, n=380):
    """Dust on the print: paper-coloured specks and fewer ink specks, reseeded every two frames."""
    r = np.random.default_rng(int(t * 15) + 7)
    xs, ys = r.random(n) * w, r.random(n) * h
    pp = skia.Path()
    for x, y in zip(xs[: n * 3 // 4], ys[: n * 3 // 4]):
        pp.addCircle(float(x), float(y), 1.3)
    c.drawPath(pp, paint(WHITE, 0.55))
    pi = skia.Path()
    for x, y in zip(xs[n * 3 // 4:], ys[n * 3 // 4:]):
        pi.addCircle(float(x), float(y), 1.0)
    c.drawPath(pi, paint(INK, 0.5))


# ------------------------------------------------------------------ halftone
def halftone(c, rect, density, col=INK, step=22, angle=15, k=0.68, a=1.0, mult=True, clip=None):
    """A rotated grid of dots whose radius follows density(x, y) in 0..1; drawn as one path."""
    x0, y0, x1, y1 = rect
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    R = math.hypot(x1 - x0, y1 - y0) / 2 + step
    n = int(2 * R / step) + 1
    ang = math.radians(angle)
    ca, sa = math.cos(ang), math.sin(ang)
    g = (np.arange(n) - n / 2) * step
    gx, gy = np.meshgrid(g, g)
    X = cx + gx * ca - gy * sa
    Y = cy + gx * sa + gy * ca
    m = (X > x0 - step) & (X < x1 + step) & (Y > y0 - step) & (Y < y1 + step)
    X, Y = X[m], Y[m]
    d = np.clip(density(X, Y), 0, 1)
    rr = d * step * k
    p = skia.Path()
    for x, y, r_ in zip(X, Y, rr):
        if r_ > 0.6:
            p.addCircle(float(x), float(y), float(r_))
    if clip is not None:
        c.save()
        c.clipPath(clip, doAntiAlias=True)
    c.drawPath(p, paint(col, a, mult=mult))
    if clip is not None:
        c.restore()


def radial(cx, cy, r0, r1, lo=0.0, hi=1.0):
    def f(X, Y):
        d = np.hypot(X - cx, Y - cy)
        return hi + (lo - hi) * np.clip((d - r0) / max(1, r1 - r0), 0, 1)
    return f


def edge(w, h, width=260, hi=0.9):
    def f(X, Y):
        d = np.minimum(np.minimum(X, w - X), np.minimum(Y, h - Y))
        return hi * np.clip(1 - d / width, 0, 1)
    return f


def ramp(y0, y1, lo=0.0, hi=1.0):
    def f(X, Y):
        return lo + (hi - lo) * np.clip((Y - y0) / (y1 - y0), 0, 1)
    return f


# ------------------------------------------------------------------ type
def headline(c, s, x, y, size, t, t0, col=INK, kind="serif", stagger=0.06, shadow=OVER, align="left", a=1.0,
             hi_idx=()):
    """Per-character pop: each glyph drops ~60 px and squashes in, with a misregistered overprint shadow."""
    f = font(size, kind)
    widths = [f.measureText(ch) for ch in s]
    total = sum(widths)
    xx = x - total / 2 if align == "center" else (x - total if align == "right" else x)
    for i, ch in enumerate(s):
        u = (t - t0 - i * stagger) / 0.32
        if u <= 0:
            xx += widths[i]
            continue
        b = back_out(u)
        dy = (1 - b) * -60
        sq = 1 + 0.25 * math.exp(-u * 4) * math.cos(u * 9) if u < 1.5 else 1
        c.save()
        c.translate(xx + widths[i] / 2, y + dy)
        c.scale(1 / sq, sq)
        cc = HI if i in hi_idx else col
        if shadow is not None:
            c.drawString(ch, -widths[i] / 2 + size * 0.06, size * 0.06, f, paint(shadow, 0.85 * a, mult=True))
        c.drawString(ch, -widths[i] / 2, 0, f, paint(cc, a))
        c.restore()
        xx += widths[i]
    return total


def parse_marks(text):
    """'{word}' marks the keyword in the highlight ink."""
    out, hi = [], False
    for ch in text:
        if ch == "{":
            hi = True
        elif ch == "}":
            hi = False
        else:
            out.append((ch, hi))
    return out


def caption_bar(c, text, t, t0, t1, cx=960, y=980, size=40):
    """The dark pill at the bottom: paper text, keyword in the highlight ink, overprint shadow; pops in."""
    if t < t0 or t > t1 + 0.25:
        return
    u = back_out((t - t0) / 0.35)
    out = clamp((t1 + 0.25 - t) / 0.25)
    chars = parse_marks(text)
    f = font(size, "sans")
    tw = sum(f.measureText(ch) for ch, _ in chars)
    w, h = tw + 70, size + 34
    c.save()
    c.translate(cx, y)
    c.scale(u * out + 0.0001, u * out + 0.0001)
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h), h / 2, h / 2)
    c.drawRRect(rr.makeOffset(8, 8) if hasattr(rr, "makeOffset") else rr, paint(OVER, 0.9, mult=True))
    c.drawRRect(rr, paint(INK))
    xx = -tw / 2
    for ch, hi in chars:
        c.drawString(ch, xx, size * 0.36, f, paint(HI if hi else PAPER))
        xx += f.measureText(ch)
    c.restore()


def chip(c, x, y, text, kind="mono", size=22, fill=INK, txt=PAPER, a=1.0):
    f = font(size, kind)
    w = f.measureText(text) + 28
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y - size - 6, w, size + 18), 8, 8), paint(fill, a))
    c.drawString(text, x + 14, y, f, paint(txt, a))
    return w


def hud(c, t, case, exhibit, date, dark=False):
    fill, txt = (PAPER, INK) if dark else (INK, PAPER)
    w = chip(c, 60, 78, case, fill=fill, txt=txt)
    chip(c, 60 + w + 12, 78, exhibit, fill=HI, txt=INK)
    f = font(22, "mono")
    dw = f.measureText(date)
    rw = f.measureText("REC")
    pill = skia.Rect.MakeLTRB(1860 - dw - rw - 70, 50, 1878, 92)
    c.drawRRect(skia.RRect.MakeRectXY(pill, 21, 21), paint(PAPER if dark else INK))
    c.drawString(date, 1860 - dw, 78, f, paint(INK if dark else PAPER))
    rec = RED if dark else (1.0, 0.42, 0.36)
    if int(t * 2) % 2 == 0:
        c.drawCircle(1860 - dw - 22, 70, 8, paint(rec))
    c.drawString("REC", 1860 - dw - rw - 44, 78, f, paint(rec))


# ------------------------------------------------------------------ stamp
def stamp(c, x, y, text, sub="", u=1.0, rot=-8, size=72, col=RED, seed=3):
    """Double rounded rectangle and bold text, rough mottled ink; slams from 2.6x to 1x."""
    if u <= 0:
        return
    f = font(size, "sans")
    fs = font(size * 0.4, "mono")
    tw = max(f.measureText(text), fs.measureText(sub) if sub else 0) + size * 0.8
    th = size * (2.1 if sub else 1.35)
    sc = 2.6 - 1.6 * clamp(u / 0.4) ** 2 if u < 0.4 else 1 + 0.06 * math.exp(-(u - 0.4) * 5) * math.cos((u - 0.4) * 30)
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(sc, sc)
    lp = skia.Paint()
    lp.setAlphaf(0.93)
    c.saveLayer(None, lp)
    r = skia.Rect.MakeXYWH(-tw / 2, -th / 2, tw, th)
    c.drawRRect(skia.RRect.MakeRectXY(r, 14, 14), paint(col, 1, 6))
    c.drawRRect(skia.RRect.MakeRectXY(r.makeInset(12, 12), 8, 8), paint(col, 1, 2.5))
    ty = size * 0.34 if not sub else size * 0.02
    c.drawString(text, -f.measureText(text) / 2, ty, f, paint(col))
    if sub:
        c.drawString(sub, -fs.measureText(sub) / 2, th / 2 - 24, fs, paint(col))
    rng = np.random.default_rng(seed)
    knock = skia.Paint(AntiAlias=True)
    knock.setBlendMode(skia.BlendMode.kDstOut)
    pp = skia.Path()
    for _ in range(int(tw * th / 260)):
        pp.addCircle(float(rng.uniform(-tw / 2, tw / 2)), float(rng.uniform(-th / 2, th / 2)),
                     float(rng.uniform(0.6, 2.6)))
    c.drawPath(pp, knock)
    c.restore()
    c.restore()


# ------------------------------------------------------------------ dot wipe
def dot_wipe(c, u, col=INK, w=1920, h=1080, cell=90):
    """A coarse grid of circles grows to full cover (u 0->0.5) and shrinks back (0.5->1), diagonal delay."""
    if u <= 0 or u >= 1:
        return
    p = skia.Path()
    rmax = cell * 0.75
    nx, ny = w // cell + 2, h // cell + 2
    for i in range(nx):
        for j in range(ny):
            d = (i + j) / (nx + ny)
            v = clamp((u - d * 0.35) / 0.3) if u < 0.5 else clamp((1 - u - (1 - d) * 0.35) / 0.3)
            if u >= 0.5:
                v = clamp(v)
            r = rmax * ease_out(v, 2)
            if r > 0.5:
                p.addCircle(i * cell, j * cell, r)
    c.drawPath(p, paint(col))


# ------------------------------------------------------------------ the rat
def rat(c, x, y, s, t, tail=1.0, look=0.0, blink=False, run=0.0, happy=False, a=1.0, flip=False, squash=1.0):
    """A chunky cartoon rat, side view facing right: heavy outline, flat fills, glossy eye, pink nose, a tail
    that can be gone (tail=0).  `run` is the gait phase (radians); the line boils at 10 fps."""
    seed = boil_seed(t) + int(x) % 7
    ow = 7 * s
    c.save()
    c.translate(x, y)
    if flip:
        c.scale(-1, 1)
    c.scale(s / squash, s * squash)
    bob = -6 * abs(math.sin(run)) if run else 0
    c.translate(0, bob)
    ol = paint(INK, a, ow / s, boil=seed)
    # tail: a long tapering curve behind
    if tail > 0:
        tp = skia.Path()
        sw = math.sin(t * 3.1) * 14
        tp.moveTo(-88, 10)
        tp.cubicTo(-150, 20 + sw, -190, -30 - sw, -170 - 60 * tail, -60 + sw)
        c.drawPath(tp, paint(INK, a, 13, boil=seed))
        c.drawPath(tp, paint(PINK, a, 6))
    else:
        stub = skia.Path()
        stub.addCircle(-92, 10, 9)
        c.drawPath(stub, paint(PINK, a))
        c.drawPath(stub, paint(INK, a, 4, boil=seed))
    # legs
    for k, lx in enumerate((-50, -20, 30, 58)):
        ph = run + k * math.pi / 2
        dx = 12 * math.sin(ph) if run else 0
        leg = skia.Path()
        leg.moveTo(lx, 36)
        leg.lineTo(lx + dx, 64 - (6 * max(0, math.cos(ph)) if run else 0))
        c.drawPath(leg, paint(INK, a, 10, boil=seed))
    # body
    body = skia.Path()
    body.addOval(skia.Rect.MakeXYWH(-100, -60, 190, 110))
    c.drawPath(body, paint(RAT, a))
    belly = skia.Path()
    belly.addOval(skia.Rect.MakeXYWH(-50, -6, 120, 52))
    c.save()
    c.clipPath(body, doAntiAlias=True)
    c.drawPath(belly, paint(BELLY, a))
    c.restore()
    c.drawPath(body, ol)
    # head
    hx, hy = 92, -32 + 6 * look
    head = skia.Path()
    head.moveTo(hx - 50, hy - 40)
    head.cubicTo(hx + 10, hy - 54, hx + 70, hy - 10, hx + 84, hy + 8)
    head.cubicTo(hx + 60, hy + 30, hx - 10, hy + 44, hx - 50, hy + 30)
    head.close()
    c.drawPath(head, paint(RAT, a))
    c.drawPath(head, ol)
    ear = skia.Path()
    ear.addCircle(hx - 14, hy - 44, 26)
    c.drawPath(ear, paint(RAT, a))
    inner = skia.Path()
    inner.addCircle(hx - 14, hy - 44, 14)
    c.drawPath(inner, paint(PINK, a))
    c.drawPath(ear, ol)
    c.drawCircle(hx + 84, hy + 8, 10, paint(PINK, a))
    c.drawCircle(hx + 84, hy + 8, 10, paint(INK, a, 4))
    for wy in (-6, 4, 14):                                               # whiskers
        c.drawLine(hx + 80, hy + 10, hx + 128, hy + wy, paint(INK, 0.8 * a, 2.5))
    ex, ey = hx + 26, hy - 8
    if blink or happy:
        arc = skia.Path()
        arc.addArc(skia.Rect.MakeXYWH(ex - 12, ey - 10, 24, 20), 200 if happy else 0, 140 if happy else 180)
        c.drawPath(arc, paint(INK, a, 5))
    else:
        c.drawOval(skia.Rect.MakeXYWH(ex - 11, ey - 14, 22, 28), paint(INK, a))
        c.drawCircle(ex + 4, ey - 6, 5, paint(WHITE, a))
        c.drawCircle(ex - 3, ey + 6, 2.4, paint(WHITE, a))
    c.restore()


def tail_icon(c, x, y, s=1.0, a=1.0, t=0.0, rot=0.0):
    """A severed tail: the exhibit."""
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s, s)
    p = skia.Path()
    p.moveTo(-60, 0)
    p.cubicTo(-20, -30, 20, 30, 60, -6)
    c.drawPath(p, paint(INK, a, 13, boil=boil_seed(t)))
    c.drawPath(p, paint(PINK, a, 6))
    c.drawCircle(-60, 0, 9, paint(INK, a))
    c.restore()


def coin(c, x, y, r, a=1.0, label="1¢"):
    c.drawCircle(x, y, r, paint(HI, a))
    c.drawCircle(x, y, r, paint(INK, a, 6))
    c.drawCircle(x, y, r * 0.78, paint(INK, a, 2))
    f = font(r * 0.8, "num")
    c.drawString(label, x - f.measureText(label) / 2, y + r * 0.28, f, paint(INK, a))
