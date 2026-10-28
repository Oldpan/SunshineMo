"""Mid-century toon toolkit (lemo `midcentury-toon` grammar, our own code): 1950s flat colour, limited animation.

Every fill is a separate "cel" printed a few px off its ink line, the offset re-rolled on twos (12 fps); the ink
line is a thin ribbon that breathes in width and never quite closes.  Warm paper, a warm near-black ink, soft
atomic-age complements; one colour plane per scene with a floor band and a broken horizon line.  Shading is one
flat darker plane, never a gradient.  Fonts come from ./fonts.sh (OFL, not in git).
"""
import math
import os

import numpy as np
import skia

PAPER = (0.965, 0.925, 0.835)
INK = (0.180, 0.141, 0.118)
CORAL = (0.910, 0.471, 0.392)
MUSTARD = (0.906, 0.706, 0.278)
TURQ = (0.318, 0.659, 0.631)
OLIVE = (0.596, 0.627, 0.333)
POWDER = (0.584, 0.733, 0.820)
PLUM = (0.533, 0.333, 0.420)
OX = (0.663, 0.431, 0.282)              # the ox keeps this colour through the whole film
OXDARK = (0.522, 0.325, 0.212)
SKIN = (0.957, 0.792, 0.663)
WHITE = (1.0, 0.99, 0.96)

_FD = os.path.expanduser("~/.local/share/fonts/toon")
FONTS = {
    "title": f"{_FD}/ZCOOLKuaiLe-Regular.ttf",            # CJK titles: round, friendly
    "sans": f"{_FD}/NotoSansCJKsc-Bold.otf",              # CJK captions and labels
    "slab": f"{_FD}/AlfaSlabOne-Regular.ttf",             # numerals and Latin headers
    "script": f"{_FD}/OleoScript-Bold.ttf",               # Latin kicker
    "geo": f"{_FD}/Jost%5Bwght%5D.ttf",                   # Latin labels
}
_tf = {}


def font(size, kind="sans"):
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


def paint(col=INK, a=1.0, stroke=0.0, cap=True):
    p = skia.Paint(AntiAlias=True, Color4f=col4(col, a))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(stroke)
        if cap:
            p.setStrokeCap(skia.Paint.kRound_Cap)
            p.setStrokeJoin(skia.Paint.kRound_Join)
    return p


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def back_out(u, s=2.2):
    u = clamp(u) - 1
    return 1 + u * u * ((s + 1) * u + s)


def ease_out(u, p=3):
    return 1 - (1 - clamp(u)) ** p


def ease_io(u):
    u = clamp(u)
    return u * u * (3 - 2 * u)


def mix(a, b, k):
    return tuple(a[i] + (b[i] - a[i]) * k for i in range(3))


def twos(t, fps=12):
    """The frame index on twos: poses, cel jitter and line breathing change at 12 fps."""
    return int(t * fps + 1e-6)


def reg(t, seed=0):
    """The off-register offset of the colour cels: down-right a few px, jittered on twos."""
    r = np.random.default_rng((twos(t) * 7919 + seed * 104729) % (2 ** 31))
    return 5 + r.uniform(-1.6, 1.6), 4 + r.uniform(-1.6, 1.6)


# ------------------------------------------------------------------ the cel + ink line
def ink(c, path, t, w=4.0, seed=0, brk=0.16, col=INK, a=1.0):
    """A breathing ink ribbon that never quite closes: the path cut into short pieces whose width swells
    +-40 % and of which ~brk are left out; re-rolled on twos."""
    r = np.random.default_rng((twos(t) * 31 + seed * 977) % (2 ** 31))
    cm = skia.PathMeasure(path, False)
    p = paint(col, a, w)
    first = True
    while True:
        if not first and not cm.nextContour():
            break
        first = False
        L = cm.getLength()
        if L < 1:
            continue
        piece = max(14.0, min(46.0, L / 6))
        n = max(1, int(L / piece))
        ph = r.uniform(0, 6.28)
        gap_at = set(r.choice(n, size=max(0, int(n * brk)), replace=False)) if n > 3 and brk > 0 else set()
        for k in range(n):
            if k in gap_at:
                continue
            seg = skia.Path()
            if cm.getSegment(k * L / n, (k + 1) * L / n - 0.5, seg, True):
                p.setStrokeWidth(w * (1 + 0.4 * math.sin(ph + k * 1.7)))
                c.drawPath(seg, p)


def shape(c, path, fill, t, w=4.0, seed=0, brk=0.16, a=1.0, shade=None, shade_clip=None, line=True):
    """One shape in the style: the colour cel offset by reg(t), an optional darker plane clipped inside, the line
    on top in place."""
    dx, dy = reg(t, seed)
    if fill is not None:
        c.save()
        c.translate(dx, dy)
        c.drawPath(path, paint(fill, a))
        if shade is not None and shade_clip is not None:
            c.save()
            c.clipPath(path, doAntiAlias=True)
            c.drawPath(shade_clip, paint(shade, a))
            c.restore()
        c.restore()
    if line and w > 0:
        ink(c, path, t, w, seed, brk, a=a)


def rect_path(x, y, w, h, r=0):
    p = skia.Path()
    if r:
        p.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), r, r))
    else:
        p.addRect(skia.Rect.MakeXYWH(x, y, w, h))
    return p


def circle_path(x, y, r):
    p = skia.Path()
    p.addCircle(x, y, r)
    return p


def oval_path(x, y, rx, ry):
    p = skia.Path()
    p.addOval(skia.Rect.MakeLTRB(x - rx, y - ry, x + rx, y + ry))
    return p


def poly(pts, closed=True):
    p = skia.Path()
    for k, (a, b) in enumerate(pts):
        (p.moveTo if k == 0 else p.lineTo)(a, b)
    if closed:
        p.close()
    return p


# ------------------------------------------------------------------ paper, plane, grain
_paper = {}


def paper_image(w=1920, h=1080, seed=9):
    """Warm paper, dry-brush tooth and a soft vignette; multiplied over everything, built once."""
    if (w, h) in _paper:
        return _paper[(w, h)]
    r = np.random.default_rng(seed)
    low = r.random((h // 24 + 2, w // 24 + 2))
    low = np.kron(low, np.ones((24, 24)))[:h, :w]
    fine = r.random((h, w))
    yy, xx = np.mgrid[0:h, 0:w]
    vig = 1 - 0.22 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) ** 1.4
    tooth = (r.random((h, w // 3 + 1)) > 0.985).repeat(3, axis=1)[:, :w] * 0.06
    v = np.clip((0.955 + 0.03 * low + 0.03 * fine - tooth) * vig, 0, 1)
    rgb = np.stack([v * 1.0, v * 0.985, v * 0.955], -1)
    a = (np.dstack([rgb, np.ones((h, w))]) * 255).astype(np.uint8)
    img = skia.Image.fromarray(a, colorType=skia.kRGBA_8888_ColorType)
    _paper[(w, h)] = img
    return img


def grain(c, t, w=1920, h=1080, n=260):
    r = np.random.default_rng(twos(t) + 3)
    p = skia.Path()
    for x, y in zip(r.uniform(0, w, n), r.uniform(0, h, n)):
        p.addCircle(float(x), float(y), 1.1)
    c.drawPath(p, paint(INK, 0.10))


def plane(c, t, wall, floor=None, horizon=760, w=1920, h=1080, seed=0):
    """One colour plane per scene: the wall tint, a darker floor band, a horizon line with gaps."""
    c.drawRect(skia.Rect.MakeWH(w, h), paint(wall))
    if floor is not None:
        c.drawRect(skia.Rect.MakeLTRB(0, horizon, w, h), paint(floor))
        ink(c, poly([(-20, horizon), (w + 20, horizon)], False), t, 4.0, seed + 50, 0.28)


def tint(col, k=0.45):
    return mix(col, PAPER, k)


def shade_of(col, k=0.18):
    return mix(col, INK, k)


# ------------------------------------------------------------------ type
def text(c, s, x, y, size, kind="sans", col=INK, align="left", a=1.0, plate=None, t=0.0, seed=0):
    """Two-plate text: an optional colour plate printed off-register under the ink."""
    f = font(size, kind)
    w = f.measureText(s)
    xx = x - w / 2 if align == "center" else (x - w if align == "right" else x)
    if plate is not None:
        dx, dy = reg(t, seed + 300)
        c.drawString(s, xx + dx, y + dy, f, paint(plate, a))
    c.drawString(s, xx, y, f, paint(col, a))
    return w


def headline(c, s, x, y, size, t, t0, kind="title", col=INK, plate=MUSTARD, align="left", stagger=0.05):
    """A header that slides in on twos: each glyph pops up with a back ease, quantised to 12 fps."""
    f = font(size, kind)
    ws = [f.measureText(ch) for ch in s]
    tot = sum(ws)
    xx = x - tot / 2 if align == "center" else (x - tot if align == "right" else x)
    tq = twos(t) / 12
    for i, ch in enumerate(s):
        u = (tq - t0 - i * stagger) / 0.25
        if u > 0:
            b = back_out(u)
            c.save()
            c.translate(xx + ws[i] / 2, y + (1 - b) * 40)
            c.scale(b, b)
            if plate is not None:
                dx, dy = reg(t, 400 + i)
                c.drawString(ch, -ws[i] / 2 + dx, dy, f, paint(plate))
            c.drawString(ch, -ws[i] / 2, 0, f, paint(col))
            c.restore()
        xx += ws[i]
    return tot


def script_on(c, s, x, y, size, t, t0, dur=0.6, col=INK, plate=CORAL):
    """The Latin kicker writes on left to right with a clip."""
    if t < t0:
        return
    f = font(size, "script")
    w = f.measureText(s)
    u = ease_out((t - t0) / dur, 2)
    c.save()
    c.clipRect(skia.Rect.MakeLTRB(x - 10, y - size * 1.2, x + w * u + 10, y + size * 0.5))
    dx, dy = reg(t, 77)
    c.drawString(s, x + dx, y + dy, f, paint(plate))
    c.drawString(s, x, y, f, paint(col))
    c.restore()


def parse_marks(s):
    out, hi = [], False
    for ch in s:
        if ch == "{":
            hi = True
        elif ch == "}":
            hi = False
        else:
            out.append((ch, hi))
    return out


def caption_card(c, s, t, t0, t1, cx=960, y=990, size=40):
    """Paper-coloured rounded slab, thin ink border, colour cel offset, small turning stars at the ends."""
    if t < t0 or t > t1 + 0.2:
        return
    u = ease_out((t - t0) / 0.22)
    out = clamp((t1 + 0.2 - t) / 0.2)
    a = u * out
    chars = parse_marks(s)
    f = font(size, "sans")
    tw = sum(f.measureText(ch) for ch, _ in chars)
    w, h = tw + 130, size + 36
    c.save()
    c.translate(cx, y + (1 - u) * 16)
    rr = rect_path(-w / 2, -h / 2, w, h, h / 2)
    dx, dy = reg(t, 900)
    c.save()
    c.translate(dx, dy)
    c.drawPath(rr, paint(MUSTARD, a))
    c.restore()
    c.drawPath(rr, paint(PAPER, a))
    ink(c, rr, t, 3.0, 901, 0.06, a=a)
    xx = -tw / 2
    for ch, hi in chars:
        c.drawString(ch, xx, size * 0.36, f, paint(CORAL if hi else INK, a))
        xx += f.measureText(ch)
    for side in (-1, 1):
        sparkle(c, side * (w / 2 - 34), 0, 13, t * 2.5 * side, INK, a)
    c.restore()


# ------------------------------------------------------------------ ornaments
def sparkle(c, x, y, r, rot=0.0, col=INK, a=1.0):
    """A 4-point atomic sparkle."""
    p = skia.Path()
    for k in range(8):
        ang = rot + k * math.pi / 4
        rr = r if k % 2 == 0 else r * 0.28
        px, py = x + rr * math.cos(ang), y + rr * math.sin(ang)
        (p.moveTo if k == 0 else p.lineTo)(px, py)
    p.close()
    c.drawPath(p, paint(col, a))


def starburst_path(x, y, r, n=14, inner=0.72, rot=0.0):
    p = skia.Path()
    for k in range(2 * n):
        ang = rot + k * math.pi / n
        rr = r if k % 2 == 0 else r * inner
        (p.moveTo if k == 0 else p.lineTo)(x + rr * math.cos(ang), y + rr * math.sin(ang))
    p.close()
    return p


def sunburst(c, x, y, r, col, a=0.35, rot=0.0, n=30):
    p = skia.Path()
    for k in range(n):
        a0 = rot + k * 2 * math.pi / n
        a1 = a0 + math.pi / n
        p.moveTo(x, y)
        p.lineTo(x + r * math.cos(a0), y + r * math.sin(a0))
        p.lineTo(x + r * math.cos(a1), y + r * math.sin(a1))
        p.close()
    c.drawPath(p, paint(col, a))


def medallion(c, x, y, r, s, t, u=1.0, fill=INK, txt=PAPER, kind="slab", size=None, seed=0):
    """The numbered medallion: an ink disc with a paper numeral and a thin inner ring; pops with a back ease."""
    if u <= 0:
        return
    b = back_out(u)
    c.save()
    c.translate(x, y)
    c.scale(b, b)
    shape(c, circle_path(0, 0, r), fill, t, 4, seed + 600, 0.08)
    c.drawPath(circle_path(0, 0, r * 0.84), paint(txt, 0.55, 2.5))
    f = font(size or r * 0.9, kind)
    c.drawString(s, -f.measureText(s) / 2, (size or r * 0.9) * 0.36, f, paint(txt))
    c.restore()


def tag(c, x, y, s, t, u=1.0, size=34, fill=PAPER, kind="sans", seed=0):
    """A detail tag: a paper card with a star bullet, popping on the action beat."""
    if u <= 0:
        return
    b = back_out(u)
    f = font(size, kind)
    w, h = f.measureText(s) + size * 1.9, size * 1.7
    c.save()
    c.translate(x, y)
    c.scale(b, b)
    shape(c, rect_path(-w / 2, -h / 2, w, h, 12), fill, t, 3, seed + 700, 0.1)
    sparkle(c, -w / 2 + size * 0.6, 0, size * 0.32, 0.4, CORAL)
    c.drawString(s, -w / 2 + size * 1.2, size * 0.36, f, paint(INK))
    c.restore()


def arrow(c, pts, t, col=INK, w=5.0, head=20, seed=0, v=1.0):
    """The manual's curved arrow, drawn on to fraction v."""
    p = skia.Path()
    p.moveTo(*pts[0])
    if len(pts) == 3:
        p.quadTo(*pts[1], *pts[2])
    else:
        for q in pts[1:]:
            p.lineTo(*q)
    cm = skia.PathMeasure(p, False)
    L = cm.getLength()
    if L < 1:
        return
    seg = skia.Path()
    cm.getSegment(0, L * clamp(v), seg, True)
    c.drawPath(seg, paint(col, 1, w))
    if v >= 0.98:
        pos, tan = cm.getPosTan(L)
        ang = math.atan2(tan.y(), tan.x())
        hp = poly([(pos.x() + head * math.cos(ang), pos.y() + head * math.sin(ang)),
                   (pos.x() + head * 0.7 * math.cos(ang + 2.3), pos.y() + head * 0.7 * math.sin(ang + 2.3)),
                   (pos.x() + head * 0.7 * math.cos(ang - 2.3), pos.y() + head * 0.7 * math.sin(ang - 2.3))])
        c.drawPath(hp, paint(col))


# ------------------------------------------------------------------ transitions
def block_wipe(c, u, col, w=1920, h=1080, up=True):
    """Colour-block wipe from the bottom (u 0->0.5 covers, 0.5->1 uncovers upward)."""
    if u <= 0 or u >= 1:
        return
    if u < 0.5:
        k = ease_io(u / 0.5)
        c.drawRect(skia.Rect.MakeLTRB(0, h * (1 - k), w, h), paint(col))
    else:
        k = ease_io((u - 0.5) / 0.5)
        c.drawRect(skia.Rect.MakeLTRB(0, 0, w, h * (1 - k)), paint(col))


def iris(c, u, cx, cy, col=INK, w=1920, h=1080):
    """Iris through a circle: closes on (cx, cy) for u 0->0.5, opens for 0.5->1."""
    if u <= 0 or u >= 1:
        return
    R = math.hypot(max(cx, w - cx), max(cy, h - cy)) + 10
    r = R * (1 - ease_io(u / 0.5)) if u < 0.5 else R * ease_io((u - 0.5) / 0.5)
    p = skia.Path()
    p.addRect(skia.Rect.MakeLTRB(-10, -10, w + 10, h + 10))
    p.addCircle(cx, cy, max(0.0, r))
    p.setFillType(skia.PathFillType.kEvenOdd)
    c.drawPath(p, paint(col))


# ------------------------------------------------------------------ characters
def person(c, x, y, s, t, body=CORAL, head=SKIN, hair=INK, hat=None, arm=0.0, arm2=None, look=0.0, mouth=0,
           blink=False, hold=None, seed=0, a=1.0, glasses=False, whiskers=False, bald=False):
    """A geometric person: a held bean body; only arms, eyes and mouth animate.  `arm`, `arm2` raise the right and
    left arm (0 down, 1 straight up); `hold` draws a paper slip in the raised right hand with that text."""
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    sd = seed * 13
    # legs
    for lx in (-18, 18):
        ink(c, poly([(lx, 40), (lx, 104)], False), t, 9, sd + lx, 0.0)
        c.drawPath(oval_path(lx + 6, 108, 15, 7), paint(INK, a))
    body_p = skia.Path()
    body_p.moveTo(-44, 46)
    body_p.cubicTo(-52, -10, -38, -70, 0, -72)
    body_p.cubicTo(38, -70, 52, -10, 44, 46)
    body_p.close()
    shape(c, body_p, body, t, 4, sd + 1, 0.12, a, shade=shade_of(body), shade_clip=rect_path(10, -80, 60, 140))
    # arms: sleeves as an ink ribbon with a colour ribbon on top, glove hands
    for side, raise_ in ((1, arm), (-1, arm if arm2 is None else arm2)):
        ang = math.radians(100 - 170 * clamp(raise_)) if side > 0 else math.radians(80 + 170 * clamp(raise_))
        sx_, sy_ = side * 36, -50
        ex, ey = sx_ + 70 * math.cos(ang), sy_ + 70 * math.sin(ang)
        c.drawPath(poly([(sx_, sy_), (ex, ey)], False), paint(INK, a, 17))
        c.drawPath(poly([(sx_, sy_), (ex, ey)], False), paint(body, a, 10))
        c.drawPath(circle_path(ex, ey, 11), paint(WHITE, a))
        ink(c, circle_path(ex, ey, 11), t, 3, sd + side + 9, 0.0)
        if hold is not None and side > 0 and raise_ > 0.3:
            slip(c, ex, ey - 34, 0.85, hold, t, rot=-6, seed=seed)
    # head: an egg with the nose in its outline
    hp = skia.Path()
    hx, hy = look * 6, -118
    hp.moveTo(hx - 34, hy)
    hp.cubicTo(hx - 34, hy - 52, hx + 30, hy - 56, hx + 34, hy - 8)
    hp.lineTo(hx + 46 + look * 6, hy + 4)
    hp.lineTo(hx + 34, hy + 14)
    hp.cubicTo(hx + 30, hy + 46, hx - 34, hy + 46, hx - 34, hy)
    hp.close()
    shape(c, hp, head, t, 4, sd + 3, 0.1, a)
    if not bald:
        hr = skia.Path()
        hr.moveTo(hx - 36, hy - 4)
        hr.cubicTo(hx - 38, hy - 56, hx + 32, hy - 60, hx + 34, hy - 18)
        hr.cubicTo(hx + 10, hy - 34, hx - 14, hy - 30, hx - 36, hy - 4)
        hr.close()
        shape(c, hr, hair, t, 0, sd + 4, 0, a, line=False)
    if whiskers:                         # profile facing right: white fringe, one mutton chop, a moustache
        fr = skia.Path()
        fr.moveTo(hx - 30, hy - 26)
        fr.cubicTo(hx - 46, hy - 14, hx - 44, hy + 14, hx - 30, hy + 24)
        fr.cubicTo(hx - 30, hy + 8, hx - 32, hy - 10, hx - 30, hy - 26)
        fr.close()
        shape(c, fr, WHITE, t, 2.5, sd + 40, 0.15, a)
        ch = skia.Path()
        ch.moveTo(hx - 12, hy - 6)
        ch.cubicTo(hx - 22, hy + 14, hx - 16, hy + 40, hx + 2, hy + 40)
        ch.cubicTo(hx + 12, hy + 40, hx + 8, hy + 30, hx + 2, hy + 24)
        ch.cubicTo(hx - 4, hy + 16, hx - 2, hy + 4, hx - 12, hy - 6)
        ch.close()
        shape(c, ch, WHITE, t, 2.5, sd + 41, 0.15, a)
        mu = skia.Path()
        mu.moveTo(hx + 12, hy + 18)
        mu.cubicTo(hx + 18, hy + 10, hx + 32, hy + 8, hx + 40, hy + 14)
        mu.cubicTo(hx + 34, hy + 20, hx + 22, hy + 22, hx + 12, hy + 18)
        mu.close()
        shape(c, mu, WHITE, t, 2.2, sd + 42, 0.1, a)
    if hat is not None:
        shape(c, rect_path(hx - 30, hy - 76, 60, 34, 4), hat, t, 3.5, sd + 5, 0.1, a)
        shape(c, rect_path(hx - 46, hy - 46, 92, 10, 4), hat, t, 3.5, sd + 6, 0.1, a)
    ex_ = hx + 10 + look * 8
    if blink:
        c.drawPath(poly([(ex_ - 7, hy - 4), (ex_ + 7, hy - 4)], False), paint(INK, a, 3.5))
    else:
        c.drawPath(oval_path(ex_, hy - 4, 4.5, 6.5), paint(INK, a))
    if glasses:
        ink(c, circle_path(ex_, hy - 4, 12), t, 2.5, sd + 50, 0.0)
    if mouth == 1:                       # open "o"
        c.drawPath(oval_path(hx + 14, hy + 22, 6, 7), paint(INK, a))
    elif mouth == 2:                     # smile
        sm = skia.Path()
        sm.addArc(skia.Rect.MakeXYWH(hx + 2, hy + 8, 24, 16), 20, 140)
        c.drawPath(sm, paint(INK, a, 3.5))
    else:
        c.drawPath(poly([(hx + 6, hy + 22), (hx + 22, hy + 21)], False), paint(INK, a, 3.5))
    c.restore()


def slip(c, x, y, s, s_text, t, rot=0.0, seed=0, fill=WHITE, a=1.0):
    """A guessing ticket: a small paper card with a number written on it."""
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s, s)
    shape(c, rect_path(-46, -28, 92, 56, 4), fill, t, 3, seed + 800, 0.08, a)
    if s_text:
        f = font(28, "slab")
        c.drawString(s_text, -f.measureText(s_text) / 2, 11, f, paint(INK, a))
    c.restore()


def ox(c, x, y, s, t, walk=0.0, look=0.0, blink=False, tail=0.0, a=1.0, flip=False, ribbon=False):
    """The ox, side view facing right: a big rounded block body, short legs that step on twos, horns, a tail."""
    c.save()
    c.translate(x, y)
    if flip:
        c.scale(-1, 1)
    c.scale(s, s)
    sd = 21
    bob = -4 * abs(math.sin(walk)) if walk else 0
    c.translate(0, bob)
    # tail
    sw = math.sin(t * 2.6) * 10 + tail * 20
    tp = skia.Path()
    tp.moveTo(-205, -70)
    tp.cubicTo(-240, -40 + sw, -236, 10 + sw, -250, 40 + sw)
    ink(c, tp, t, 6, sd + 1, 0.0)
    c.drawPath(oval_path(-250, 48 + sw, 10, 16), paint(INK, a))
    # legs (two pairs, step on twos)
    for k, lx in enumerate((-160, -110, 110, 160)):
        ph = math.sin(walk + (0 if k % 2 == 0 else math.pi)) if walk else 0
        ph = round(ph * 3) / 3
        leg = rect_path(lx - 18 + ph * 10, 40, 36, 96, 10)
        shape(c, leg, OXDARK if k in (1, 2) else OX, t, 4, sd + 10 + k, 0.08, a)
        c.drawPath(rect_path(lx - 20 + ph * 12, 124, 40, 16, 6), paint(INK, a))
    body = rect_path(-215, -120, 400, 200, 90)
    shape(c, body, OX, t, 4.5, sd + 2, 0.12, a, shade=OXDARK, shade_clip=rect_path(-230, 30, 440, 80))
    # patches
    c.drawPath(oval_path(-90, -40, 60, 40), paint(WHITE, 0.9 * a))
    # head
    c.save()
    c.translate(190, -90)
    c.rotate(look * 8)
    head = rect_path(-30, -60, 130, 120, 50)
    shape(c, head, OX, t, 4.5, sd + 3, 0.1, a)
    shape(c, rect_path(50, 0, 72, 58, 26), (0.93, 0.70, 0.62), t, 4, sd + 4, 0.1, a)
    c.drawPath(oval_path(78, 26, 5, 7), paint(INK, a))
    c.drawPath(oval_path(100, 26, 5, 7), paint(INK, a))
    for hx_, d in ((0, -1), (60, 1)):
        hn = skia.Path()
        hn.moveTo(hx_ - 8, -56)
        hn.quadTo(hx_ + d * 20 - 10, -110, hx_ + d * 40, -100)
        hn.quadTo(hx_ + d * 14, -84, hx_ + 12, -56)
        hn.close()
        shape(c, hn, WHITE, t, 3.5, sd + 5 + d, 0.06, a)
    if blink:
        c.drawPath(poly([(30, -14), (48, -14)], False), paint(INK, a, 4))
    else:
        c.drawPath(oval_path(40, -14, 7, 9), paint(INK, a))
        c.drawPath(circle_path(42, -17, 2.5), paint(WHITE, a))
    shape(c, oval_path(-30, -40, 22, 12), OXDARK, t, 3.5, sd + 7, 0.1, a)    # ear
    if ribbon:
        shape(c, starburst_path(-20, 40, 34, 10, 0.7), CORAL, t, 3, sd + 8, 0.05, a)
        c.drawPath(circle_path(-20, 40, 14), paint(MUSTARD, a))
    c.restore()
    c.restore()


def bunting(c, x0, x1, y, n, t, shown=None, cols=(CORAL, MUSTARD, TURQ), sag=40, seed=0):
    """A string of pennant flags; `shown` limits how many have popped in."""
    shown = n if shown is None else shown
    line = skia.Path()
    line.moveTo(x0, y)
    line.quadTo((x0 + x1) / 2, y + sag * 2, x1, y)
    ink(c, line, t, 3, seed + 60, 0.05)
    for k in range(min(n, shown)):
        u = (k + 0.5) / n
        px = x0 + (x1 - x0) * u
        py = y + sag * 2 * 2 * u * (1 - u)
        sw = math.sin(t * 3 + k) * 3
        fl = poly([(px - 26, py), (px + 26, py), (px + sw, py + 58)])
        shape(c, fl, cols[k % len(cols)], t, 3, seed + k, 0.05)
