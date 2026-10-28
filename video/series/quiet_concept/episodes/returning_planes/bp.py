"""Blueprint (蓝图 / 工程制图) toolkit for 回来的飞机, drawn with skia: cyanotype sheet, white line work drawn on
with a glowing nib, dash conventions, hatching, balloons, revision clouds, NOTE boxes, a hand shadow, one red stamp.

Grammar from lemo-opuscar's blueprint STYLE.md: blue and white only, the one non-blue colour is the stamp;
drafting order (centre lines -> outlines -> detail -> hatching -> dimensions -> balloons -> labels); notes are
lettered on, placed in empty sky, never at the bottom; no 3D.
"""
import math

import numpy as np
import skia
from scipy.ndimage import gaussian_filter

BLUE0, BLUE1 = (0.094, 0.20, 0.42), (0.165, 0.345, 0.65)      # #18336B -> #2A58A6
LINE = (0.906, 0.941, 0.976)                                   # #E7F0F9
RED = (0.80, 0.18, 0.15)
TABLE = (0.05, 0.067, 0.086)

FONT_HAND = "/usr/share/fonts/truetype/lxgw-wenkai/LXGWWenKai-Regular.ttf"
FONT_HAND_B = "/usr/share/fonts/truetype/lxgw-wenkai/LXGWWenKai-Bold.ttf"
FONT_MONO = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf"
FONT_MONO_B = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"
_tf = {}


def font(size, kind="hand"):
    path = {"hand": FONT_HAND, "handb": FONT_HAND_B, "mono": FONT_MONO, "monob": FONT_MONO_B}[kind]
    if path not in _tf:
        _tf[path] = skia.Typeface.MakeFromFile(path)
    f = skia.Font(_tf[path], size)
    f.setSubpixel(True)
    f.setEdging(skia.Font.Edging.kAntiAlias)
    return f


def col4(c, a):
    return skia.Color4f(c[0], c[1], c[2], a)


def paint(a=1.0, stroke=0.0, blur=0.0, col=LINE, dash=None, cap=True):
    p = skia.Paint(AntiAlias=True, Color4f=col4(col, a))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(stroke)
        p.setStrokeCap(skia.Paint.kRound_Cap if cap else skia.Paint.kButt_Cap)
        p.setStrokeJoin(skia.Paint.kRound_Join)
    if blur:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    if dash:
        p.setPathEffect(skia.DashPathEffect.Make(dash, 0))
    return p


# ------------------------------------------------------------------ the sheet
_sheet = {}


def sheet_image(w, h, seed=11):
    """Procedural cyanotype: two Prussian blues mixed by fbm, coating streaks, fibres, specks, two fold creases,
    bleached edges."""
    key = (w, h, seed)
    if key in _sheet:
        return _sheet[key]
    r = np.random.default_rng(seed)
    n = np.zeros((h, w), np.float32)
    for k, s in enumerate((120, 48, 16, 5)):
        g = gaussian_filter(r.standard_normal((h // 4 + 1, w // 4 + 1)).astype(np.float32), s / 4)
        g = np.kron(g, np.ones((4, 4), np.float32))[:h, :w]
        n += g / (np.abs(g).max() + 1e-6) * (0.55 ** k)
    n = (n - n.min()) / (n.max() - n.min())
    streak = gaussian_filter(r.standard_normal((1, w)).astype(np.float32), (0, 3))
    streak = np.repeat(streak / (np.abs(streak).max() + 1e-6), h, 0)
    m = np.clip(0.35 + 0.5 * n + 0.08 * streak, 0, 1)[..., None]
    img = np.array(BLUE0, np.float32) * (1 - m) + np.array(BLUE1, np.float32) * m
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    edge = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy))
    img += (np.exp(-edge / 26) * 0.10)[..., None]                       # sun-bleached edges
    for fx in (w / 3, 2 * w / 3):                                        # vertical fold creases
        d = xx - fx
        img += (0.05 * np.exp(-(d - 1.5) ** 2 / 2) - 0.04 * np.exp(-(d + 1.5) ** 2 / 3))[..., None]
    d = yy - h / 2
    img += (0.04 * np.exp(-(d - 1.5) ** 2 / 2) - 0.03 * np.exp(-(d + 1.5) ** 2 / 3))[..., None]
    grain = gaussian_filter(r.standard_normal((h, w)).astype(np.float32), 0.6)
    img *= (1 + 0.03 * grain)[..., None]
    out = np.clip(img * 255, 0, 255).astype(np.uint8)
    rgba = np.dstack([out, np.full((h, w), 255, np.uint8)])
    im = skia.Image.fromarray(rgba, colorType=skia.kRGBA_8888_ColorType)
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.drawImage(im, 0, 0)
    for i in range(500):                                                 # fibres
        x, y = r.uniform(0, w), r.uniform(0, h)
        a = r.uniform(0, math.pi)
        L = r.uniform(6, 40)
        c.drawLine(x, y, x + math.cos(a) * L, y + math.sin(a) * L, paint(r.uniform(0.02, 0.06), 0.7))
    for i in range(220):                                                 # specks
        c.drawCircle(r.uniform(0, w), r.uniform(0, h), r.uniform(0.4, 1.4), paint(r.uniform(0.05, 0.18)))
    _sheet[key] = surf.makeImageSnapshot()
    return _sheet[key]


_shader = {}


def sheet_shader(w, h):
    if (w, h) not in _shader:
        _shader[(w, h)] = sheet_image(w, h).makeShader(skia.TileMode.kClamp, skia.TileMode.kClamp,
                                                      skia.SamplingOptions())
    return _shader[(w, h)]


def paper_fill(c, path, w=1920, h=1080):
    """Painter's occlusion: fill a solid with the sheet itself before stroking its outline."""
    c.drawPath(path, skia.Paint(AntiAlias=True, Shader=sheet_shader(w, h)))


# ------------------------------------------------------------------ line work
def poly_path(pts, closed=False):
    p = skia.Path()
    for k, (x, y) in enumerate(pts):
        (p.moveTo if k == 0 else p.lineTo)(x, y)
    if closed:
        p.close()
    return p


def partial(path, u):
    """The first u (0..1) of a path by arc length, and the head point."""
    pm = skia.PathMeasure(path, False)
    total, segs = 0.0, []
    while True:
        L = pm.getLength()
        segs.append(L)
        total += L
        if not pm.nextContour():
            break
    if u >= 1:
        pm = skia.PathMeasure(path, False)
        head = None
        while True:
            L = pm.getLength()
            head = pm.getPosTan(L)[0] if L > 0 else head
            if not pm.nextContour():
                break
        return path, (head.x(), head.y()) if head is not None else None
    want = total * max(0.0, u)
    out = skia.Path()
    pm = skia.PathMeasure(path, False)
    head = None
    for L in segs:
        if want <= 0:
            break
        take = min(L, want)
        pm.getSegment(0, take, out, True)
        pos = pm.getPosTan(take)[0]
        head = (pos.x(), pos.y())
        want -= take
        if not pm.nextContour():
            break
    return out, head


def stroke(c, path, w=2.0, u=1.0, a=1.0, dash=None, nib=True):
    """White line work on the blue: a soft bleed under a crisp line; a glowing nib at the head while drawing."""
    if u <= 0 or a <= 0.003:
        return None
    p, head = partial(path, u)
    c.drawPath(p, paint(0.25 * a, w * 2.2, blur=w * 0.9, dash=dash))
    c.drawPath(p, paint(0.92 * a, w, dash=dash))
    if nib and u < 1 and head is not None:
        c.drawCircle(head[0], head[1], 9, paint(0.45 * a, blur=8))
        c.drawCircle(head[0], head[1], 2.4, paint(a))
    return head


def line(c, pts, w=2.0, u=1.0, a=1.0, dash=None, closed=False, nib=True):
    return stroke(c, poly_path(pts, closed), w, u, a, dash, nib)


CENTER = [34, 8, 6, 8]          # long-short
HIDDEN = [10, 7]                # short dashes
PHANTOM = [30, 6, 5, 6, 5, 6]   # long-short-short


def hatch(c, path, u=1.0, spacing=11, angle=45, w=1.1, a=0.85):
    """45-degree fine-line hatching clipped to `path`, drawn on across the region with u."""
    if u <= 0:
        return
    b = path.getBounds()
    c.save()
    c.clipPath(path, doAntiAlias=True)
    cx, cy = b.centerX(), b.centerY()
    R = math.hypot(b.width(), b.height()) / 2 + 10
    ang = math.radians(angle)
    dx, dy = math.cos(ang), math.sin(ang)
    nx, ny = -dy, dx
    n = int(2 * R / spacing)
    for k in range(int(n * min(1, u)) + 1):
        o = -R + k * spacing
        x0, y0 = cx + nx * o - dx * R, cy + ny * o - dy * R
        x1, y1 = cx + nx * o + dx * R, cy + ny * o + dy * R
        c.drawLine(x0, y0, x1, y1, paint(a, w))
    c.restore()


def letter(c, s, x, y, size, u=1.0, a=1.0, kind="hand", align="left", nib=True):
    """Text lettered on left to right with a glowing nib; returns the full width."""
    if u <= 0 or a <= 0.003:
        return 0
    f = font(size, kind)
    w = f.measureText(s)
    xx = x - w / 2 if align == "center" else (x - w if align == "right" else x)
    n = len(s)
    k = n if u >= 1 else int(math.floor(n * u + 1e-6))
    part = s[:k]
    frac = n * u - k if u < 1 else 0
    if part:
        c.drawString(part, xx, y, f, paint(0.25 * a, blur=1.6))
        c.drawString(part, xx, y, f, paint(0.95 * a))
    if u < 1 and k < n:
        ch = s[k]
        pw = f.measureText(part)
        c.drawString(ch, xx + pw, y, f, paint(0.95 * a * frac))
        if nib:
            hx = xx + pw + f.measureText(ch) * frac
            c.drawCircle(hx, y - size * 0.3, 8, paint(0.45 * a, blur=7))
            c.drawCircle(hx, y - size * 0.3, 2.2, paint(a))
    return w


def balloon(c, x, y, tx, ty, label, u=1.0, r=22, a=1.0, size=24):
    """A numbered part balloon with a leader line from (tx, ty) to the circle at (x, y)."""
    if u <= 0:
        return
    d = math.hypot(x - tx, y - ty) or 1
    ex, ey = x - (x - tx) / d * r, y - (y - ty) / d * r
    line(c, [(tx, ty), (ex, ey)], 1.25, min(1, u * 2), a, nib=False)
    c.drawCircle(tx, ty, 3.2, paint(a * min(1, u * 3)))
    if u > 0.4:
        uu = min(1, (u - 0.4) / 0.6)
        circ = skia.Path()
        circ.addCircle(x, y, r)
        stroke(c, circ, 1.6, uu, a, nib=False)
        f = font(size, "monob")
        c.drawString(label, x - f.measureText(label) / 2, y + size * 0.36, f, paint(a * uu))


def rev_cloud(c, cx, cy, rx, ry, u=1.0, a=1.0, bumps=14, w=2.0):
    """A revision cloud: a scalloped ellipse, drawn on clockwise."""
    pts = []
    for k in range(bumps):
        a0, a1 = 2 * math.pi * k / bumps, 2 * math.pi * (k + 1) / bumps
        x0, y0 = cx + rx * math.cos(a0), cy + ry * math.sin(a0)
        x1, y1 = cx + rx * math.cos(a1), cy + ry * math.sin(a1)
        bump = 0.28 * math.hypot(x1 - x0, y1 - y0)
        for v in np.linspace(0, 1, 10, endpoint=False):             # each scallop pushed out along the normal
            px, py = x0 + (x1 - x0) * v, y0 + (y1 - y0) * v
            s = math.sin(math.pi * v) * bump
            ex, ey = (px - cx) / rx ** 2, (py - cy) / ry ** 2
            el = math.hypot(ex, ey) or 1
            pts.append((px + ex / el * s, py + ey / el * s))
    pts.append(pts[0])
    return line(c, pts, w, u, a)


def note_box(c, x, y, wmax, text, n, size, u=1.0, a=1.0):
    """A drawing note: a light translucent box with double white rules, a NOTE / n cell, text lettered on.
    (x, y) is the top-left corner; wraps at wmax.  Returns the box height."""
    if a <= 0.003:
        return 0
    f = font(size)
    lines, cur = [], ""
    for ch in text:
        if f.measureText(cur + ch) > wmax and cur:
            lines.append(cur)
            cur = ch
        else:
            cur += ch
    lines.append(cur)
    tw = max(f.measureText(s) for s in lines)
    cell = 96
    pad = 18
    bw = cell + pad * 2 + tw
    bh = pad * 2 + len(lines) * size * 1.35 - size * 0.35
    rect = skia.Rect.MakeXYWH(x, y, bw, bh)
    c.drawRect(rect, paint(0.10 * a))
    c.drawRect(rect, paint(0.9 * a, 1.6))
    c.drawRect(skia.Rect.MakeXYWH(x + 5, y + 5, bw - 10, bh - 10), paint(0.55 * a, 0.9))
    c.drawLine(x + cell, y + 5, x + cell, y + bh - 5, paint(0.7 * a, 1.0))
    fm = font(18, "monob")
    c.drawString("NOTE", x + cell / 2 - fm.measureText("NOTE") / 2, y + bh / 2 - 4, fm, paint(0.85 * a))
    c.drawString(f"/ {n}", x + cell / 2 - fm.measureText(f"/ {n}") / 2, y + bh / 2 + 18, fm, paint(0.6 * a))
    total = sum(len(s) for s in lines)
    done = 0
    for j, s in enumerate(lines):
        uj = clamp01((u * total - done) / max(1, len(s)))
        letter(c, s, x + cell + pad, y + pad + size * 0.92 + j * size * 1.35, size, uj, a)
        done += len(s)
    return bh


def clamp01(v):
    return 0.0 if v < 0 else 1.0 if v > 1 else v


def stamp(c, x, y, text, sub, u=1.0, rot=-8, size=64):
    """The one red: a rubber stamp, double border, ink speckled and knocked out where the rubber missed."""
    if u <= 0:
        return
    f = font(size, "handb")
    fs = font(size * 0.34, "monob")
    tw = max(f.measureText(text), fs.measureText(sub)) + size * 0.9
    th = size * 2.0
    sc = 1.35 - 0.35 * u
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(sc, sc)
    c.saveLayer()
    r = skia.Rect.MakeXYWH(-tw / 2, -th / 2, tw, th)
    c.drawRect(r, paint(0.92, 5, col=RED))
    c.drawRect(r.makeInset(10, 10), paint(0.92, 2, col=RED))
    c.drawString(text, -f.measureText(text) / 2, size * 0.08, f, paint(0.92, col=RED))
    c.drawString(sub, -fs.measureText(sub) / 2, th / 2 - 18, fs, paint(0.92, col=RED))
    rng = np.random.default_rng(5)
    clear = skia.Paint(AntiAlias=True, Color4f=col4((0, 0, 0), 1))
    clear.setBlendMode(skia.BlendMode.kDstOut)
    for _ in range(160):
        c.drawCircle(rng.uniform(-tw / 2, tw / 2), rng.uniform(-th / 2, th / 2), rng.uniform(0.6, 2.4), clear)
    c.restore()
    c.restore()


def hand(c, x, y, a=0.55, ang=-28):
    """The draftsman's hand as a shadow on the sheet, pen tip at (x, y)."""
    if a <= 0.003:
        return
    c.save()
    c.translate(x, y)
    c.rotate(ang)
    shade = paint(a * 0.5, blur=22, col=(0.02, 0.05, 0.14))
    pen = skia.Path()
    pen.moveTo(0, 0)
    pen.lineTo(6, -14)
    pen.lineTo(14, -190)
    pen.lineTo(4, -192)
    pen.lineTo(-6, -14)
    pen.close()
    c.drawPath(pen, paint(a * 0.7, blur=5, col=(0.02, 0.05, 0.14)))
    # one union path, so overlapping fingers do not stack into a dark blob
    body = skia.Path()
    body.addOval(skia.Rect.MakeXYWH(-30, -150, 150, 120))
    for fx, fy, fw, fh in ((-24, -70, 36, 70), (6, -60, 30, 72), (30, -66, 30, 70), (56, -80, 28, 66)):
        r = skia.Path()
        r.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(fx, fy, fw, fh), 14, 14))
        body = skia.Op(body, r, skia.PathOp.kUnion_PathOp)
    r = skia.Path()
    r.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(90, -230, 110, 260), 40, 40))
    body = skia.Op(body, r, skia.PathOp.kUnion_PathOp)
    c.drawPath(body, shade)
    c.restore()
