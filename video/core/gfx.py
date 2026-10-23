"""Drawing helpers on top of skia-python: fonts, paints, text styles, shapes."""
import math
import os
import zlib
import numpy as np
import skia

W, H = 1920, 1080
CX, CY = W / 2, H / 2

FONT_CJK = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
FONT_PIXEL = "/usr/share/fonts/opentype/unifont/unifont.otf"
INTER = "/usr/share/fonts/opentype/inter/{}.otf"
KAI = "/usr/share/fonts/truetype/lxgw-wenkai/LXGWWenKai-{}.ttf"  # apt: fonts-lxgw-wenkai
SERIF = "/usr/share/fonts/opentype/noto/NotoSerifCJK-{}.ttc"  # apt: fonts-noto-cjk; face 2 = Simplified Chinese

_tf = {}


FONT_TYPE = "/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf"  # labels with a typewriter feel


def typeface(path, index=0):
    if (path, index) not in _tf:
        _tf[(path, index)] = skia.Typeface.MakeFromFile(path, index)
    return _tf[(path, index)]


def font(size, kind="cjk", bold=False):
    """kind: cjk (WenQuanYi) | kai / kai-light (LXGW WenKai, handwritten feel) | serif (Noto Serif CJK SC) |
    pixel | mono (WenQuanYi Zen Hei Mono) | type (FreeMono Bold, typewriter, Latin only) | an Inter weight."""
    if kind == "mono":
        f = skia.Font(typeface(FONT_CJK, 2), size)
        f.setEmbolden(bold)
    elif kind == "type":
        f = skia.Font(typeface(FONT_TYPE), size)
    elif kind in ("kai", "kai-light"):
        path = KAI.format("Bold" if bold else ("Light" if kind == "kai-light" else "Regular"))
        if not os.path.exists(path):  # font not installed: fall back to the default CJK face
            return font(size, "cjk", bold)
        f = skia.Font(typeface(path), size)
    elif kind == "serif":
        path = SERIF.format("Bold" if bold else "Regular")
        if not os.path.exists(path):
            return font(size, "cjk", bold)
        f = skia.Font(typeface(path, 2), size)
    elif kind == "cjk":
        f = skia.Font(typeface(FONT_CJK), size)
        f.setEmbolden(bold)
    elif kind == "pixel":
        f = skia.Font(typeface(FONT_PIXEL), size)
        f.setEdging(skia.Font.Edging.kAlias)
    else:  # Inter weights: Thin, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black
        f = skia.Font(typeface(INTER.format(kind)), size)
    f.setSubpixel(True)
    return f


# ------------------------------------------------------------------ math
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def lerp(a, b, u):
    return a + (b - a) * u


def smooth(u):
    u = clamp(u)
    return u * u * (3 - 2 * u)


def ease_out(u, p=3):
    u = clamp(u)
    return 1 - (1 - u) ** p


def ease_in(u, p=3):
    return clamp(u) ** p


def ease_io(u):
    u = clamp(u)
    return 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2


def back_out(u, s=1.8):
    u = clamp(u)
    u -= 1
    return u * u * ((s + 1) * u + s) + 1


def elastic(u):
    u = clamp(u)
    if u in (0, 1):
        return u
    return 2 ** (-10 * u) * math.sin((u * 10 - 0.75) * (2 * math.pi / 3)) + 1


def seed_of(*xs):
    return zlib.crc32(repr(xs).encode())


def rnd(*xs):
    """Deterministic pseudo-random in [0,1) from any key."""
    return (seed_of(*xs) % 100000) / 100000.0


def mixc(a, b, u):
    return tuple(lerp(x, y, u) for x, y in zip(a, b))


# ------------------------------------------------------------------ paints
def col4(c, a=1.0):
    return skia.Color4f(float(c[0]), float(c[1]), float(c[2]), float(clamp(a * (c[3] if len(c) > 3 else 1))))


def argb(c, a=1.0):
    return skia.Color4f(*c[:3], clamp(a)).toColor()


def paint(c=(1, 1, 1), a=1.0, stroke=0, blur=0, blend=None, cap_round=False, aa=True):
    p = skia.Paint(AntiAlias=aa, Color4f=col4(c, a))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(stroke)
    if cap_round:
        p.setStrokeCap(skia.Paint.kRound_Cap)
        p.setStrokeJoin(skia.Paint.kRound_Join)
    if blur > 0.3:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    if blend is not None:
        p.setBlendMode(blend)
    return p


PLUS = skia.BlendMode.kPlus
SCREEN = skia.BlendMode.kScreen

# palette
WHITE = (1, 1, 1)
PINK = (1.0, 0.33, 0.58)
CYAN = (0.33, 0.9, 1.0)
GOLD = (1.0, 0.8, 0.38)
RED = (1.0, 0.28, 0.3)
MINT = (0.45, 1.0, 0.75)
VIOLET = (0.62, 0.48, 1.0)
GREY = (0.62, 0.66, 0.75)


# ------------------------------------------------------------------ text
def text_width(s, f):
    return f.measureText(s)


def char_layout(s, f, spacing=0.0):
    xs, x = [], 0.0
    for ch in s:
        w = f.measureText(ch)
        xs.append((ch, x, w))
        x += w + spacing
    return xs, x - spacing if s else 0.0


def draw_text(c, s, x, y, f, p, align="center"):
    w = f.measureText(s)
    if align == "center":
        x -= w / 2
    elif align == "right":
        x -= w
    c.drawString(s, x, y, f, p)
    return w


def glow_text(c, s, x, y, f, col, a=1.0, glow=14, glow_a=0.45, align="center"):
    if glow and a > 0.01:
        draw_text(c, s, x, y, f, paint(col, a * glow_a, blur=glow), align)
    draw_text(c, s, x, y, f, paint(WHITE if col != WHITE else col, a), align)


def text_rise(c, s, x, y, f, t, col=WHITE, a=1.0, stagger=0.045, dur=0.5, rise=36,
              exit_t=None, exit_dur=0.45, glow=10, spacing=0.0, align="center", tint=None):
    """Per-character rise + de-blur.  t = seconds since the line started."""
    lay, total = char_layout(s, f, spacing)
    x0 = x - total / 2 if align == "center" else (x - total if align == "right" else x)
    n = len(lay)
    for i, (ch, dx, w) in enumerate(lay):
        u = ease_out((t - i * stagger) / dur)
        if u <= 0:
            continue
        aa = u * a
        oy = (1 - u) * rise
        bl = (1 - u) * 9
        if exit_t is not None and t > exit_t:
            v = ease_in((t - exit_t - (n - 1 - i) * stagger * 0.4) / exit_dur, 2)
            aa *= 1 - v
            oy -= v * rise * 0.7
            bl += v * 10
        if aa <= 0.003:
            continue
        cx = x0 + dx
        if glow:
            c.drawString(ch, cx, y + oy, f, paint(tint or col, aa * 0.3, blur=glow + bl))
        c.drawString(ch, cx, y + oy, f, paint(col, aa, blur=bl))
    return total


def text_type(c, s, x, y, f, t, cps=12, col=WHITE, a=1.0, cursor=True, align="left", glow=8,
              cursor_col=CYAN):
    n = int(max(0, t) * cps)
    shown = s[:n]
    total = text_width(s, f)
    x0 = x - total / 2 if align == "center" else x
    if glow:
        c.drawString(shown, x0, y, f, paint(col, a * 0.3, blur=glow))
    c.drawString(shown, x0, y, f, paint(col, a))
    if cursor:
        done = n >= len(s)
        blink = (math.sin(t * 2 * math.pi * 1.6) > 0) if done else True
        if blink:
            cw = text_width(shown, f)
            sz = f.getSize()
            r = skia.Rect.MakeXYWH(x0 + cw + 6, y - sz * 0.82, sz * 0.09, sz * 0.98)
            c.drawRect(r, paint(cursor_col, a * 0.9))
            c.drawRect(r, paint(cursor_col, a * 0.8, blur=8))
    return total


def text_pop(c, s, x, y, f, t, col=WHITE, a=1.0, stagger=0.1, dur=0.45, glow=18, tint=PINK,
             spacing=0.0, pulse=0.0, wobble=0.0):
    lay, total = char_layout(s, f, spacing)
    x0 = x - total / 2
    sz = f.getSize()
    for i, (ch, dx, w) in enumerate(lay):
        u = (t - i * stagger) / dur
        if u <= 0:
            continue
        sc = back_out(u, 2.4) * (1 + pulse)
        aa = a * clamp(u * 3)
        c.save()
        cx, cy = x0 + dx + w / 2, y - sz * 0.38
        c.translate(cx, cy)
        c.rotate(wobble * math.sin(t * 3 + i) + (1 - clamp(u)) * 25 * (1 if i % 2 else -1))
        c.scale(sc, sc)
        if glow:
            c.drawString(ch, -w / 2, sz * 0.38, f, paint(tint, aa * 0.5, blur=glow))
        c.drawString(ch, -w / 2, sz * 0.38, f, paint(col, aa))
        c.restore()
    return total


def text_glitch(c, s, x, y, f, t, amt=1.0, col=WHITE, a=1.0, seed=0, align="center"):
    total = text_width(s, f)
    x0 = x - total / 2 if align == "center" else x
    sz = f.getSize()
    k = int(t * 24)
    split = 3 + 10 * amt * (rnd(seed, k, "s") ** 2)
    c.drawString(s, x0 - split, y, f, paint((1, 0.1, 0.25), a * 0.85, blend=PLUS))
    c.drawString(s, x0 + split, y, f, paint((0.1, 0.8, 1.0), a * 0.85, blend=PLUS))
    bands = 7
    top = y - sz * 0.95
    bh = sz * 1.2 / bands
    for b in range(bands):
        r = rnd(seed, k, b)
        off = (r - 0.5) * 60 * amt if r > 0.55 or r < 0.2 else 0
        c.save()
        c.clipRect(skia.Rect.MakeXYWH(x0 - 200, top + b * bh, total + 400, bh + 1))
        c.drawString(s, x0 + off, y, f, paint(col, a * (0.85 if off else 1)))
        c.restore()
    return total


def text_stroke_fill(c, s, x, y, f, fill_u, col=WHITE, stroke_col=WHITE, a=1.0, sw=2.0,
                     glow_col=PINK, align="center"):
    total = text_width(s, f)
    x0 = x - total / 2 if align == "center" else x
    sz = f.getSize()
    c.drawString(s, x0, y, f, paint(stroke_col, a * 0.85, stroke=sw))
    if fill_u > 0:
        c.save()
        c.clipRect(skia.Rect.MakeLTRB(x0 - 10, y - sz * 1.2, x0 + (total + 20) * fill_u, y + sz * 0.4))
        c.drawString(s, x0, y, f, paint(glow_col, a * 0.5, blur=18))
        c.drawString(s, x0, y, f, paint(col, a))
        c.restore()
        # leading light edge
        if fill_u < 1:
            ex = x0 + (total + 20) * fill_u
            c.drawRect(skia.Rect.MakeLTRB(ex - 2, y - sz, ex + 2, y + sz * 0.25),
                       paint(glow_col, a, blur=6))
    return total


def text_vertical(c, s, x, y, f, t, col=WHITE, a=1.0, stagger=0.08, dur=0.6, gap=1.08, glow=10,
                  tint=GOLD):
    sz = f.getSize()
    for i, ch in enumerate(s):
        u = ease_out((t - i * stagger) / dur)
        if u <= 0:
            continue
        w = f.measureText(ch)
        yy = y + i * sz * gap + (1 - u) * -20
        if glow:
            c.drawString(ch, x - w / 2, yy, f, paint(tint, a * u * 0.35, blur=glow + (1 - u) * 10))
        c.drawString(ch, x - w / 2, yy, f, paint(col, a * u, blur=(1 - u) * 8))


def text_pixel(c, s, x, y, size, col=CYAN, a=1.0, align="left", t=None, cps=30):
    f = font(size, "pixel")
    if t is not None:
        s = s[: int(max(0, t) * cps)]
    p = paint(col, a, aa=False)
    w = draw_text(c, s, x, y, f, p, align)
    return w


def text_ink(c, s, x, y, f, t, col=WHITE, a=1.0, stagger=0.06, dur=0.7, spread=7.0, align="center",
             exit_t=None, exit_dur=0.5, spacing=0.0):
    """Ink soaking into paper: each character sharpens out of a soft bleed, settling from 1.06x."""
    lay, total = char_layout(s, f, spacing)
    x0 = x - total / 2 if align == "center" else (x - total if align == "right" else x)
    sz = f.getSize()
    n = len(lay)
    for i, (ch, dx, w) in enumerate(lay):
        u = ease_out((t - i * stagger) / dur, 2)
        if u <= 0:
            continue
        aa = a * clamp(u * 1.6)
        if exit_t is not None and t > exit_t:
            aa *= 1 - smooth((t - exit_t - (n - 1 - i) * stagger * 0.3) / exit_dur)
        if aa <= 0.003:
            continue
        sc = 1 + 0.06 * (1 - u)
        c.save()
        c.translate(x0 + dx + w / 2, y - sz * 0.35)
        c.scale(sc, sc)
        if u < 0.999:
            c.drawString(ch, -w / 2, sz * 0.35, f, paint(col, aa * 0.5 * (1 - u), blur=spread * (1 - u) + 1.5))
        c.drawString(ch, -w / 2, sz * 0.35, f, paint(col, aa * (0.25 + 0.75 * u), blur=(1 - u) * spread * 0.6))
        c.restore()
    return total


def text_roll(c, s, x, y, f, u, col=WHITE, a=1.0, align="center", spins=1, stagger=0.12):
    """Odometer: every digit rolls up to its value as u goes 0 -> 1; other characters stay put."""
    lay, total = char_layout(s, f, 0.0)
    x0 = x - total / 2 if align == "center" else (x - total if align == "right" else x)
    sz = f.getSize()
    p = paint(col, a)
    nd = sum(ch.isdigit() for ch in s)
    k = 0
    for ch, dx, w in lay:
        if not ch.isdigit():
            c.drawString(ch, x0 + dx, y, f, p)
            continue
        uu = ease_out(clamp((u - k * stagger / max(nd, 1)) / (1 - stagger + 1e-6)), 3)
        k += 1
        pos = uu * (int(ch) + 10 * spins)
        d0 = int(math.floor(pos)) % 10
        fr = pos - math.floor(pos)
        c.save()
        c.clipRect(skia.Rect.MakeLTRB(x0 + dx - 2, y - sz * 0.95, x0 + dx + w + 2, y + sz * 0.22))
        c.drawString(str(d0), x0 + dx, y - fr * sz * 1.1, f, p)
        if fr > 0.001:
            c.drawString(str((d0 + 1) % 10), x0 + dx, y + (1 - fr) * sz * 1.1, f, p)
        c.restore()
    return total


def rich_line(c, parts, x, y, size, t=None, a=1.0, align="center", bold=False, glow=10, kind="cjk"):
    """parts: list of (text, colour).  Highlighted words keep their colour + glow."""
    f = font(size, kind, bold=bold)
    total = sum(f.measureText(p[0]) for p in parts)
    xx = x - total / 2 if align == "center" else x
    for txt, col in parts:
        w = f.measureText(txt)
        if col != WHITE and glow:
            c.drawString(txt, xx, y, f, paint(col, a * 0.4, blur=glow))
        c.drawString(txt, xx, y, f, paint(col, a))
        xx += w
    return total


# ------------------------------------------------------------------ shapes
def rrect(x, y, w, h, r):
    return skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), r, r)


def bubble(c, s, x, y, size, u, side="right", fill=(0.2, 0.75, 0.45), txt=WHITE, a=1.0,
           glow=0.0, maxw=None, tail=True):
    """Chat bubble anchored at (x, y) = outer edge / vertical centre. u: pop progress."""
    if u <= 0:
        return 0, 0
    f = font(size)
    w = f.measureText(s)
    pad_x, pad_y = size * 0.75, size * 0.55
    bw, bh = w + pad_x * 2, size + pad_y * 2
    sc = back_out(u, 2.0)
    aa = a * clamp(u * 2.5)
    c.save()
    ax = x if side == "left" else x
    c.translate(ax, y)
    c.scale(sc, sc)
    bx = 0 if side == "left" else -bw
    if glow:
        c.drawRRect(rrect(bx, -bh / 2, bw, bh, bh * 0.42), paint(fill, aa * glow, blur=26))
    c.drawRRect(rrect(bx, -bh / 2, bw, bh, bh * 0.42), paint(fill, aa * 0.92))
    if tail:
        path = skia.Path()
        if side == "left":
            path.moveTo(bx + 14, bh / 2 - 22)
            path.lineTo(bx - 10, bh / 2 + 4)
            path.lineTo(bx + 34, bh / 2 - 6)
        else:
            path.moveTo(bx + bw - 14, bh / 2 - 22)
            path.lineTo(bx + bw + 10, bh / 2 + 4)
            path.lineTo(bx + bw - 34, bh / 2 - 6)
        path.close()
        c.drawPath(path, paint(fill, aa * 0.92))
    c.drawString(s, bx + pad_x, size * 0.36, f, paint(txt, aa))
    c.restore()
    return bw, bh


def typing_dots(c, x, y, t, a=1.0, col=(0.85, 0.88, 0.95), fill=(0.16, 0.17, 0.24), scale=1.0):
    bw, bh = 150 * scale, 76 * scale
    c.drawRRect(rrect(x, y - bh / 2, bw, bh, bh / 2), paint(fill, a * 0.95))
    c.drawRRect(rrect(x, y - bh / 2, bw, bh, bh / 2), paint(CYAN, a * 0.35, stroke=1.5))
    for i in range(3):
        ph = (t * 2.2 - i * 0.18) % 1.0
        bump = math.exp(-((ph - 0.25) ** 2) / 0.01)
        c.drawCircle(x + bw * (0.28 + 0.22 * i), y - 8 * scale * bump, 8.5 * scale,
                     paint(col, a * (0.45 + 0.55 * bump)))


def person(c, x, y, s, col=CYAN, a=1.0, glow=True, face=1):
    """Minimal glowing figure: head + shoulders, facing direction `face`."""
    p = paint(col, a, stroke=4 * s, cap_round=True)
    head = skia.Point(x, y - 120 * s)
    path = skia.Path()
    path.moveTo(x - 95 * s, y + 70 * s)
    path.cubicTo(x - 95 * s, y - 40 * s, x + 95 * s, y - 40 * s, x + 95 * s, y + 70 * s)
    if glow:
        c.drawCircle(head, 52 * s, paint(col, a * 0.5, stroke=10 * s, blur=14 * s))
        c.drawPath(path, paint(col, a * 0.5, stroke=10 * s, blur=14 * s))
    c.drawCircle(head, 52 * s, p)
    c.drawPath(path, p)
    # small "eye" dot showing facing
    c.drawCircle(x + 22 * s * face, y - 128 * s, 5 * s, paint(col, a))


def ring(c, x, y, r, u, col=CYAN, a=1.0, w=6, start=-90, glow=True):
    rect = skia.Rect.MakeXYWH(x - r, y - r, 2 * r, 2 * r)
    c.drawCircle(x, y, r, paint(col, a * 0.15, stroke=w))
    if glow:
        c.drawArc(rect, start, 360 * u, False, paint(col, a * 0.6, stroke=w * 2.5, blur=12))
    c.drawArc(rect, start, 360 * u, False, paint(col, a, stroke=w, cap_round=True))


def hline(c, x0, x1, y, col, a=1, w=2):
    c.drawLine(x0, y, x1, y, paint(col, a, stroke=w))


# ------------------------------------------------------------------ particles from text
_pts_cache = {}


def text_points(s, size, n=2200, kind="cjk", bold=True, spacing=0.0):
    key = (s, size, n, kind, bold, spacing)
    if key in _pts_cache:
        return _pts_cache[key]
    f = font(size, kind, bold)
    lay, total = char_layout(s, f, spacing)
    w, h = int(total + 40), int(size * 1.6)
    surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(w, h, skia.kRGBA_8888_ColorType,
                                                       skia.kPremul_AlphaType))
    cv = surf.getCanvas()
    cv.clear(skia.ColorTRANSPARENT)
    for ch, dx, cw in lay:
        cv.drawString(ch, 20 + dx, size * 1.15, f, skia.Paint(AntiAlias=True, Color=skia.ColorWHITE))
    arr = surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)[..., 3]
    ys, xs = np.nonzero(arr > 128)
    rng = np.random.default_rng(seed_of(key))
    idx = rng.choice(len(xs), size=min(n, len(xs)), replace=len(xs) < n)
    pts = np.stack([xs[idx] - w / 2, ys[idx] - size * 0.85], 1).astype(np.float32)
    pts += rng.uniform(-0.6, 0.6, pts.shape)
    _pts_cache[key] = pts
    return pts


def particle_text(c, s, x, y, size, u, t, col=WHITE, tint=PINK, a=1.0, n=2200, spread=900,
                  seed=1, dot=2.6, scatter_out=0.0):
    """Particles fly in from a cloud and settle into glyph shapes. u in [0,1]."""
    pts = text_points(s, size, n)
    m = len(pts)
    rng = np.random.default_rng(seed)
    start = rng.normal(0, 1, (m, 2)).astype(np.float32) * [spread, spread * 0.55]
    delay = rng.uniform(0, 0.45, m).astype(np.float32)
    uu = np.clip((u - delay) / 0.55, 0, 1)
    e = 1 - (1 - uu) ** 3
    swirl = (1 - e)[:, None] * np.stack([np.sin(t * 1.3 + delay * 20), np.cos(t * 1.1 + delay * 17)], 1) * 60
    pos = start * (1 - e)[:, None] + pts * e[:, None] + swirl
    if scatter_out > 0:
        out = rng.normal(0, 1, (m, 2)).astype(np.float32) * [spread * 1.2, spread * 0.8]
        so = scatter_out ** 2
        pos = pos * (1 - so) + (pts + out) * so
    pos += [x, y]
    alpha = a * (1 - scatter_out)
    if alpha <= 0.01:
        return
    pl = [skia.Point(float(px), float(py)) for px, py in pos]
    c.drawPoints(skia.Canvas.kPoints_PointMode, pl,
                 paint(tint, alpha * 0.55, stroke=dot * 3.2, blur=4, cap_round=True))
    c.drawPoints(skia.Canvas.kPoints_PointMode, pl, paint(col, alpha, stroke=dot, cap_round=True))
