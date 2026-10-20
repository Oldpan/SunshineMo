"""warm_journal look: a lo-fi paper journal.  Cream paper with a dot grid, warm light leaks,
film grain / dust / halation; night sections turn the page into a dark notebook under a desk lamp.

    style = WarmJournal(tl, S, LOOKS, fast=("drop1", "drop2", "advice"))
    run(style.frame, style.setup, tl.dur, ...)

LOOKS: section name -> palette (see PALETTES).  The blended palette is written into x.look
before the shots are drawn, so shots take their colours from it:
    ink / soft (text), a1 / a2 (accents), paper, card (object fill), dark (0 day .. 1 night).
Shots may also set x.mono (0..1 desaturate), x.flash, x.shake, x.zoom.

Paper objects below: card / sticky / polaroid / phone (context managers that leave the canvas
in the object's local coordinates), tape, calendar_page, clock, stamp, text_stamp, windows.
"""
import contextlib
import math
import os
import sys

import numpy as np
import skia
from scipy import ndimage

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from core.gfx import *  # noqa: E402,F401,F403
from core.hand import *  # noqa: E402,F401,F403
from core.timeline import Ctx  # noqa: E402
from core import post  # noqa: E402

LIN = skia.SamplingOptions(skia.FilterMode.kLinear)
MULTIPLY = skia.BlendMode.kMultiply
SHADOW = (0.24, 0.13, 0.06)  # warm brown, never pure black


def _pal(paper, paper2, ink, soft, a1, a2, leak, leak_a, vig, lamp, tex, dark, card=None):
    return dict(paper=paper, paper2=paper2, ink=ink, soft=soft, a1=a1, a2=a2, leak=leak, leak_a=leak_a,
                vig=vig, lamp=lamp, tex=tex, dark=dark,
                card=card or ((0.99, 0.97, 0.92) if dark < 0.5 else (0.17, 0.18, 0.25)))


# one film day: dawn -> office -> sepia memory -> dusk -> lamp night ... -> morning -> new year
PALETTES = {
    "dawn": _pal((0.95, 0.91, 0.84), (0.97, 0.87, 0.80), (0.17, 0.15, 0.19), (0.45, 0.40, 0.42),
                 (0.80, 0.22, 0.18), (0.93, 0.55, 0.35), (1.0, 0.62, 0.45), 0.32, 0.28, 0.0, 0.55, 0.0),
    "office": _pal((0.92, 0.92, 0.90), (0.86, 0.89, 0.92), (0.12, 0.13, 0.16), (0.42, 0.44, 0.48),
                   (0.80, 0.24, 0.20), (0.22, 0.42, 0.68), (0.85, 0.92, 1.0), 0.12, 0.22, 0.0, 0.5, 0.0),
    "sepia": _pal((0.93, 0.83, 0.67), (0.96, 0.74, 0.55), (0.30, 0.19, 0.13), (0.52, 0.38, 0.28),
                  (0.82, 0.28, 0.16), (0.90, 0.55, 0.20), (1.0, 0.55, 0.25), 0.45, 0.42, 0.0, 0.65, 0.0,
                  card=(0.99, 0.95, 0.86)),
    "dusk": _pal((0.87, 0.81, 0.81), (0.80, 0.73, 0.82), (0.18, 0.14, 0.22), (0.44, 0.38, 0.48),
                 (0.80, 0.24, 0.30), (0.42, 0.35, 0.68), (1.0, 0.55, 0.55), 0.28, 0.35, 0.0, 0.55, 0.0),
    "lamp": _pal((0.11, 0.12, 0.19), (0.17, 0.15, 0.22), (0.97, 0.93, 0.85), (0.72, 0.70, 0.72),
                 (1.0, 0.45, 0.38), (1.0, 0.76, 0.38), (1.0, 0.65, 0.35), 0.22, 0.4, 0.85, 0.35, 1.0),
    "deep_night": _pal((0.08, 0.12, 0.15), (0.11, 0.16, 0.20), (0.95, 0.93, 0.87), (0.66, 0.71, 0.72),
                       (1.0, 0.47, 0.40), (0.50, 0.86, 0.76), (0.5, 0.85, 0.8), 0.14, 0.5, 0.6, 0.35, 1.0,
                       card=(0.14, 0.20, 0.24)),
    "indigo": _pal((0.08, 0.08, 0.15), (0.12, 0.10, 0.20), (0.94, 0.92, 0.88), (0.66, 0.64, 0.74),
                   (1.0, 0.52, 0.46), (0.76, 0.67, 1.0), (0.6, 0.5, 1.0), 0.14, 0.55, 0.45, 0.35, 1.0,
                   card=(0.16, 0.15, 0.27)),
    "home_lights": _pal((0.13, 0.09, 0.13), (0.21, 0.11, 0.12), (0.98, 0.94, 0.86), (0.77, 0.69, 0.66),
                        (1.0, 0.42, 0.33), (1.0, 0.78, 0.36), (1.0, 0.6, 0.3), 0.36, 0.5, 0.9, 0.35, 1.0,
                        card=(0.24, 0.15, 0.18)),
    "morning": _pal((0.97, 0.93, 0.86), (1.0, 0.86, 0.72), (0.20, 0.16, 0.14), (0.46, 0.41, 0.37),
                    (0.88, 0.36, 0.20), (0.18, 0.50, 0.50), (1.0, 0.7, 0.4), 0.38, 0.25, 0.0, 0.55, 0.0),
    "new_year": _pal((0.98, 0.94, 0.85), (0.99, 0.88, 0.70), (0.22, 0.14, 0.12), (0.50, 0.40, 0.33),
                     (0.80, 0.15, 0.13), (0.82, 0.58, 0.18), (1.0, 0.75, 0.45), 0.42, 0.3, 0.0, 0.55, 0.0),
}
LAMP_COL = (1.0, 0.72, 0.42)
NOTE_COLS = [(1.0, 0.89, 0.55), (1.0, 0.79, 0.76), (0.77, 0.92, 0.84), (0.76, 0.86, 0.98)]


# ---------------------------------------------------------------- textures
def make_paper(w, h, seed=5):
    """Grey paper texture in ~0.8..1: soft mottling, pulp, fibres, fine tooth."""
    r = np.random.default_rng(seed)

    def blob(div, sigma):
        a = ndimage.gaussian_filter(r.standard_normal((h // div + 2, w // div + 2)), sigma)
        a = ndimage.zoom(a, div, order=1)[:h, :w]
        return a / (a.std() + 1e-9)

    tex = 1 - 0.03 * np.abs(blob(16, 3)) - 0.018 * blob(4, 1.5) - 0.012 * r.standard_normal((h, w))
    surf = skia.Surface(w, h)
    cv = surf.getCanvas()
    cv.clear(skia.ColorBLACK)
    for _ in range(int(w * h / 1100)):
        x, y = r.uniform(0, w), r.uniform(0, h)
        L, ang = r.uniform(8, 42), r.uniform(0, math.pi)
        p = skia.Path()
        p.moveTo(x, y)
        p.quadTo(x + L / 2 * math.cos(ang) + r.normal(0, 4), y + L / 2 * math.sin(ang) + r.normal(0, 4),
                 x + L * math.cos(ang), y + L * math.sin(ang))
        cv.drawPath(p, paint(WHITE, r.uniform(0.15, 0.55), stroke=r.uniform(0.6, 1.4)))
    tex -= 0.06 * surf.makeImageSnapshot().toarray()[..., 0] / 255.0
    g = (np.clip(tex, 0, 1) * 255).astype(np.uint8)
    rgba = np.dstack([g, g, g, np.full_like(g, 255)])
    return skia.Image.fromarray(rgba, colorType=skia.kRGBA_8888_ColorType)


def dot_grid(c, w, h, col, a, step=54, ox=0.0, oy=0.0):
    pts = [skia.Point(x + ox % step, y + oy % step) for x in range(-step, w + step, step)
           for y in range(-step, h + step, step)]
    c.drawPoints(skia.Canvas.kPoints_PointMode, pts, paint(col, a, stroke=3.2, cap_round=True))


def paper_bg(c, w, h, look, t=0.0, grid=True):
    """Paper gradient, dot grid, desk-lamp glow and drifting light leaks (no texture)."""
    sh = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(w, h)],
                                        [argb(look["paper"]), argb(look["paper2"])])
    c.drawPaint(skia.Paint(Shader=sh))
    if grid:
        dot_grid(c, w, h, look["ink"], 0.07 + 0.03 * look["dark"], ox=t * 4, oy=t * 1.5)
    if look["lamp"] > 0.01:
        r = w * 0.75
        sh = skia.GradientShader.MakeRadial(skia.Point(w * 0.72, -h * 0.08), r,
                                            [argb(LAMP_COL, 0.5 * look["lamp"]), argb(LAMP_COL, 0.16 * look["lamp"]),
                                             argb(LAMP_COL, 0)], [0, 0.4, 1])
        c.drawPaint(skia.Paint(Shader=sh, BlendMode=SCREEN))


def leaks(c, w, h, look, t, boost=0.0):
    a = look["leak_a"] * (0.75 + 0.25 * math.sin(t * 0.7)) + boost
    if a <= 0.01:
        return
    for fx, fy, ph in ((-0.02, 0.18, 0.0), (1.02, 0.86, 2.1)):
        x = w * (fx + 0.07 * math.sin(t * 0.13 + ph))
        y = h * (fy + 0.10 * math.sin(t * 0.09 + ph * 1.7))
        r = w * (0.5 + 0.08 * math.sin(t * 0.21 + ph))
        sh = skia.GradientShader.MakeRadial(skia.Point(x, y), r, [argb(look["leak"], min(1, a * 0.6)),
                                                                   argb(look["leak"], min(1, a * 0.18)),
                                                                   argb(look["leak"], 0)], [0, 0.42, 1])
        c.drawPaint(skia.Paint(Shader=sh, BlendMode=SCREEN))


def film_burn(c, w, h, k, side=-1):
    """Warm over-exposure sweeping in from one edge (crash hits, cuts)."""
    if k <= 0.01:
        return
    x = -0.05 * w if side < 0 else 1.05 * w
    sh = skia.GradientShader.MakeRadial(skia.Point(x, h * 0.45), w * 0.95,
                                        [argb((1.0, 0.96, 0.85), min(1, 0.95 * k)), argb((1.0, 0.6, 0.28), 0.55 * k),
                                         argb((1.0, 0.45, 0.2), 0)], [0, 0.35, 1])
    c.drawPaint(skia.Paint(Shader=sh, BlendMode=SCREEN))


# ---------------------------------------------------------------- paper objects
def _shadow(c, x, y, w, h, r, lift=1.0, a=0.3):
    c.drawRRect(rrect(x + 3 * lift, y + 7 * lift, w, h, r), paint(SHADOW, a, blur=8 + 7 * lift))


@contextlib.contextmanager
def _local(c, cx, cy, rot, scale, a):
    c.save()
    c.translate(cx, cy)
    if rot:
        c.rotate(rot)
    if scale != 1:
        c.scale(scale, scale)
    if a < 0.999:
        c.saveLayer(None, skia.Paint(Alphaf=max(a, 0.0)))
    try:
        yield
    finally:
        if a < 0.999:
            c.restore()
        c.restore()


@contextlib.contextmanager
def card(c, cx, cy, w, h, rot=0.0, fill=(0.99, 0.97, 0.92), a=1.0, r=10, lift=1.0, scale=1.0):
    """Paper card centred at (cx, cy); inside the block (0, 0) is its centre."""
    with _local(c, cx, cy, rot, scale, a):
        _shadow(c, -w / 2, -h / 2, w, h, r, lift)
        c.drawRRect(rrect(-w / 2, -h / 2, w, h, r), paint(fill))
        yield


@contextlib.contextmanager
def sticky(c, cx, cy, s, rot=0.0, col=NOTE_COLS[0], a=1.0, scale=1.0):
    """Square sticky note with a lifted corner."""
    with _local(c, cx, cy, rot, scale, a):
        _shadow(c, -s / 2, -s / 2, s, s, 3, 0.8, 0.26)
        p = skia.Path()
        p.moveTo(-s / 2, -s / 2)
        p.lineTo(s / 2, -s / 2)
        p.lineTo(s / 2, s / 2 - s * 0.12)
        p.quadTo(s / 2 - s * 0.02, s / 2 - s * 0.02, s / 2 - s * 0.14, s / 2)
        p.lineTo(-s / 2, s / 2)
        p.close()
        sh = skia.GradientShader.MakeLinear([skia.Point(0, -s / 2), skia.Point(0, s / 2)],
                                            [argb(mixc(col, WHITE, 0.15)), argb(mixc(col, (0.5, 0.4, 0.3), 0.12))])
        c.drawPath(p, skia.Paint(AntiAlias=True, Shader=sh))
        c.drawRect(skia.Rect.MakeXYWH(-s / 2, -s / 2, s, s * 0.08), paint(mixc(col, (0.4, 0.3, 0.2), 0.12)))
        yield


def tape(c, cx, cy, w, rot=0.0, col=(0.95, 0.72, 0.62), a=0.85, h=44, seed=0):
    """Washi tape strip with torn zig-zag ends and stripes."""
    with _local(c, cx, cy, rot, 1.0, 1.0):
        p = skia.Path()
        n = 6
        p.moveTo(-w / 2, -h / 2)
        p.lineTo(w / 2, -h / 2)
        for i in range(1, n + 1):
            p.lineTo(w / 2 + (4 if i % 2 else -3) * (0.5 + rnd(seed, i)), -h / 2 + h * i / n)
        p.lineTo(-w / 2, h / 2)
        for i in range(n - 1, -1, -1):
            p.lineTo(-w / 2 + (4 if i % 2 else -3) * (0.5 + rnd(seed, -i)), -h / 2 + h * i / n)
        p.close()
        c.drawPath(p, paint(col, a))
        c.save()
        c.clipPath(p, doAntiAlias=True)
        for k in range(-int(w / 26) - 2, int(w / 26) + 3):
            x0 = k * 26
            q = skia.Path()
            q.moveTo(x0, -h / 2)
            q.lineTo(x0 + 10, -h / 2)
            q.lineTo(x0 + 10 + h * 0.6, h / 2)
            q.lineTo(x0 + h * 0.6, h / 2)
            q.close()
            c.drawPath(q, paint(WHITE, a * 0.22))
        c.restore()


@contextlib.contextmanager
def polaroid(c, cx, cy, w, rot=0.0, a=1.0, photo=(0.25, 0.22, 0.2), scale=1.0):
    """Instant photo; inside the block the canvas is clipped to the photo, (0, 0) = photo centre,
    photo size = 0.88 w square."""
    h = w * 1.18
    ps = w * 0.88
    with _local(c, cx, cy, rot, scale, a):
        _shadow(c, -w / 2, -h / 2, w, h, 4, 1.2)
        c.drawRRect(rrect(-w / 2, -h / 2, w, h, 4), paint((0.99, 0.98, 0.95)))
        top = -h / 2 + w * 0.06
        c.save()
        c.translate(0, top + ps / 2)
        c.clipRect(skia.Rect.MakeXYWH(-ps / 2, -ps / 2, ps, ps))
        c.drawRect(skia.Rect.MakeXYWH(-ps / 2, -ps / 2, ps, ps), paint(photo))
        yield
        g = skia.GradientShader.MakeLinear([skia.Point(-ps / 2, -ps / 2), skia.Point(ps / 2, ps / 2)],
                                           [argb(WHITE, 0.18), argb(WHITE, 0.0), argb(WHITE, 0.06)])
        c.drawPaint(skia.Paint(Shader=g))
        c.restore()


@contextlib.contextmanager
def phone(c, cx, cy, w, h, rot=0.0, a=1.0, screen=(0.97, 0.97, 0.98), scale=1.0):
    """Phone; inside the block the canvas is clipped to the screen, (0, 0) = screen top-left."""
    with _local(c, cx, cy, rot, scale, a):
        _shadow(c, -w / 2, -h / 2, w, h, w * 0.13, 1.3)
        c.drawRRect(rrect(-w / 2, -h / 2, w, h, w * 0.13), paint((0.13, 0.13, 0.16)))
        m = w * 0.045
        sw, sh_ = w - 2 * m, h - 2 * m
        c.save()
        c.translate(-sw / 2, -sh_ / 2)
        c.clipRRect(rrect(0, 0, sw, sh_, w * 0.09), doAntiAlias=True)
        c.drawRect(skia.Rect.MakeWH(sw, sh_), paint(screen))
        yield sw, sh_
        c.restore()
        c.drawRRect(rrect(-w * 0.14, -h / 2 + m + 10, w * 0.28, w * 0.07, w * 0.035), paint((0.13, 0.13, 0.16)))


def clock(c, cx, cy, r, hours, look, a=1.0, sec=None, face=None, numbers=True):
    """Analogue clock.  hours: float hours (14.5 = 2:30); sec: seconds (float or stepped)."""
    face = face or look["card"]
    ink = look["ink"] if look["dark"] < 0.5 else (0.16, 0.14, 0.16)
    if look["dark"] >= 0.5:
        face = (0.97, 0.94, 0.88)
    c.drawCircle(cx + 4, cy + 9, r, paint(SHADOW, 0.3 * a, blur=14))
    c.drawCircle(cx, cy, r, paint(face, a))
    c.drawCircle(cx, cy, r, paint(ink, a * 0.9, stroke=r * 0.05))
    for i in range(60):
        ang = i / 60 * 2 * math.pi
        big = i % 5 == 0
        r0 = r * (0.80 if big else 0.86)
        c.drawLine(cx + r0 * math.sin(ang), cy - r0 * math.cos(ang), cx + r * 0.91 * math.sin(ang),
                   cy - r * 0.91 * math.cos(ang), paint(ink, a * (0.85 if big else 0.4), stroke=r * (0.025 if big else
                                                                                                      0.01)))
    if numbers and r > 90:
        f = font(r * 0.17, "Inter-SemiBold")
        for i in (12, 3, 6, 9):
            ang = i / 12 * 2 * math.pi
            draw_text(c, str(i), cx + r * 0.64 * math.sin(ang), cy - r * 0.64 * math.cos(ang) + r * 0.06, f,
                      paint(ink, a * 0.85))
    hh = (hours % 12) / 12 * 2 * math.pi
    mm = (hours * 60 % 60) / 60 * 2 * math.pi
    for ang, ln, wd in ((hh, 0.5, 0.065), (mm, 0.74, 0.04)):
        c.drawLine(cx - r * 0.1 * math.sin(ang), cy + r * 0.1 * math.cos(ang), cx + r * ln * math.sin(ang),
                   cy - r * ln * math.cos(ang), paint(ink, a, stroke=r * wd, cap_round=True))
    if sec is not None:
        sa = (sec % 60) / 60 * 2 * math.pi
        c.drawLine(cx - r * 0.18 * math.sin(sa), cy + r * 0.18 * math.cos(sa), cx + r * 0.84 * math.sin(sa),
                   cy - r * 0.84 * math.cos(sa), paint(look["a1"], a, stroke=r * 0.018, cap_round=True))
    c.drawCircle(cx, cy, r * 0.05, paint(look["a1"] if sec is not None else ink, a))


CAL_RED = (0.78, 0.14, 0.12)


def calendar_page(c, cx, cy, s, top, day, weekday, foot=None, look=None, a=1.0, tear=0.0, red=False):
    """Tear-off almanac page (老黄历): binding, month line, huge day number, weekday, 宜/忌 foot.
    tear 0..1 peels the page off and throws it away (draw the next page first)."""
    w, h = 380 * s, 500 * s
    a0 = a
    ink = (0.16, 0.13, 0.12)
    numcol = CAL_RED if red else ink
    c.save()
    c.translate(cx, cy)
    if tear <= 0:
        c.drawRRect(rrect(-w / 2 + 4, -h / 2 + 10, w, h, 6 * s), paint(SHADOW, 0.28 * a, blur=14))
    bind = 56 * s
    if tear > 0:
        u = ease_in(tear, 2)
        c.save()
        c.translate(-w / 2, -h / 2 + bind)
        c.rotate(-28 * u - 8 * tear)
        c.translate(w / 2 + 380 * s * u, h / 2 - bind + 700 * s * u * u)
        a = a * (1 - smooth((tear - 0.55) / 0.45))
    c.drawRect(skia.Rect.MakeLTRB(-w / 2, -h / 2 + bind, w / 2, h / 2), paint((0.99, 0.97, 0.92), a))
    for i in range(5):  # page edge stack lines
        c.drawLine(-w / 2 + 6, h / 2 - 3 - i * 3, w / 2 - 6, h / 2 - 3 - i * 3, paint((0.8, 0.75, 0.68), a * 0.5,
                                                                                    stroke=1))
    ft = font(30 * s, "kai")
    draw_text(c, top, 0, -h / 2 + bind + 52 * s, ft, paint((0.4, 0.33, 0.3), a))
    c.drawLine(-w * 0.38, -h / 2 + bind + 72 * s, w * 0.38, -h / 2 + bind + 72 * s, paint(CAL_RED, a * 0.6,
                                                                                        stroke=2 * s))
    fd = font(250 * s, "Inter-Bold")
    draw_text(c, str(day), 0, 95 * s, fd, paint(numcol, a))
    draw_text(c, weekday, 0, 160 * s, font(40 * s, "kai", bold=True), paint(ink, a))
    if foot:
        yi, ji = foot
        fy = font(28 * s, "kai")
        y = h / 2 - 34 * s
        for k, (tag, txt) in enumerate((("宜", yi), ("忌", ji))):
            x0 = -w * 0.42 + k * w * 0.46
            c.drawRect(skia.Rect.MakeXYWH(x0, y - 26 * s, 34 * s, 34 * s), paint(CAL_RED if k == 0 else ink, a))
            draw_text(c, tag, x0 + 17 * s, y, fy, paint((0.99, 0.97, 0.92), a))
            draw_text(c, txt, x0 + 44 * s, y, fy, paint(ink, a), align="left")
    if tear > 0:
        c.restore()
    # binding block with rings (stays put)
    c.drawRRect(rrect(-w / 2 - 6 * s, -h / 2, w + 12 * s, bind + 4 * s, 6 * s), paint((0.55, 0.12, 0.10), a0))
    c.drawRect(skia.Rect.MakeLTRB(-w / 2 - 6 * s, -h / 2 + bind - 6 * s, w / 2 + 6 * s, -h / 2 + bind + 4 * s),
               paint((0.42, 0.08, 0.07), a0))
    for sx in (-1, 1):
        c.drawCircle(sx * w * 0.28, -h / 2 + bind * 0.45, 9 * s, paint((0.25, 0.05, 0.04), a0))
    if tear > 0:  # torn strip left under the binding
        p = skia.Path()
        p.moveTo(-w / 2, -h / 2 + bind + 3 * s)
        for i in range(25):
            p.lineTo(-w / 2 + w * i / 24, -h / 2 + bind + (5 + 6 * rnd("tear", day, i)) * s)
        p.lineTo(w / 2, -h / 2 + bind + 3 * s)
        p.close()
        c.drawPath(p, paint((0.97, 0.95, 0.9), a0))
    c.restore()


def stamp(c, s, cx, cy, size, u, col=CAL_RED, a=1.0, rot=-8.0, seed=0, paper=(0.99, 0.97, 0.92)):
    """Red seal (印章) slammed down: u 0 -> 1 is the press (scale 1.9 -> 1)."""
    if u <= 0:
        return
    sc = lerp(1.9, 1.0, ease_in(clamp(u), 2))
    aa = a * clamp(u * 2.5)
    f = font(size, "kai", bold=True)
    tw = f.measureText(s)
    pw, ph = tw + size * 0.55, size * 1.35
    c.save()
    c.translate(cx, cy)
    c.rotate(rot)
    c.scale(sc, sc)
    c.saveLayer(None, skia.Paint(Alphaf=aa))
    c.drawRRect(rrect(-pw / 2, -ph / 2, pw, ph, size * 0.12), paint(col, 0.95, stroke=size * 0.09))
    c.drawRRect(rrect(-pw / 2 + size * 0.13, -ph / 2 + size * 0.13, pw - size * 0.26, ph - size * 0.26, size * 0.06),
                paint(col, 0.8, stroke=size * 0.03))
    draw_text(c, s, 0, size * 0.36, f, paint(col, 0.95))
    for i in range(70):  # worn ink
        x = (rnd(seed, s, i, "x") - 0.5) * pw
        y = (rnd(seed, s, i, "y") - 0.5) * ph
        c.drawCircle(x, y, 1 + 3.5 * rnd(seed, s, i, "r") ** 3, paint(paper, 0.55, blend=skia.BlendMode.kDstOut))
    c.restore()
    c.restore()


def text_stamp(c, s, x, y, f, u, col, a=1.0, align="center"):
    """Headline pressed onto the page: drops from 1.5x with an ink settle."""
    if u <= 0:
        return 0
    sc = lerp(1.5, 1.0, ease_in(clamp(u), 2))
    tw = f.measureText(s)
    sz = f.getSize()
    x0 = {"center": -tw / 2, "left": 0, "right": -tw}[align]
    c.save()
    c.translate(x + (tw / 2 + x0), y - sz * 0.35)
    c.scale(sc, sc)
    aa = a * clamp(u * 3)
    if u < 1:
        c.drawString(s, -tw / 2, sz * 0.35, f, paint(col, aa * 0.4, blur=6 * (1 - u)))
    c.drawString(s, -tw / 2, sz * 0.35, f, paint(col, aa))
    c.restore()
    return tw


def windows(c, x0, y0, cols, rows, cw, ch, gap, lit, look, a=1.0, seed=0):
    """Building facade; lit(i, j) -> 0..1 brightness of each window."""
    bw, bh = cols * (cw + gap) + gap, rows * (ch + gap) + gap
    c.drawRect(skia.Rect.MakeXYWH(x0, y0, bw, bh + 400), paint(mixc(look["paper"], (0, 0, 0), 0.35), a))
    warm = (1.0, 0.82, 0.50)
    off = mixc(look["paper"], (0.25, 0.3, 0.45), 0.35)
    for i in range(cols):
        for j in range(rows):
            v = lit(i, j)
            x, y = x0 + gap + i * (cw + gap), y0 + gap + j * (ch + gap)
            r = skia.Rect.MakeXYWH(x, y, cw, ch)
            c.drawRect(r, paint(mixc(off, mixc(warm, (1.0, 0.92, 0.75), rnd(seed, i, j) * 0.5), v), a))
            if v > 0.3:
                c.drawRect(r, paint(warm, a * 0.35 * v, blur=10))


def label(c, s, x, y, size, col, a=1.0, align="center", kind="kai", bold=False):
    return draw_text(c, s, x, y, font(size, kind, bold), paint(col, a), align)


# ---------------------------------------------------------------- the style
class WarmJournal:
    def __init__(self, tl, sync, looks, fast=("drop1", "drop2"), drops=None, intro_fade=1.5, outro_fade=2.0,
                 w=W, h=H):
        self.tl, self.S, self.looks = tl, sync, looks
        self.fast = tuple(fast)
        self.drops = tuple(drops if drops is not None else [f for f in fast if f.startswith("drop")])
        self.intro_fade, self.outro_fade = intro_fade, outro_fade
        self.w, self.h = w, h

    def setup(self):
        self.tex = make_paper(self.w, self.h)
        self.bloom = post.Bloom(self.w, self.h)
        r = np.random.default_rng(11)
        self.grain = post.make_grain(r, self.w, self.h, 4.5)
        self.motes = np.stack([r.uniform(0, self.w, 70), r.uniform(0, self.h, 70), r.uniform(0.3, 1.0, 70),
                               r.uniform(0, 6.28, 70)], 1)

    # ------------------------------------------------------------ helpers
    def kick(self, t, d=0.12):
        return self.S.pulse("kick", t, d)

    def in_drop(self, t):
        return self.tl.section_at(t) in self.drops

    def recent(self, name, t, window):
        """(index, seconds since) for events of `name` within the last `window` seconds."""
        a = self.S.ev.get(name)
        if a is None:
            return []
        i1 = np.searchsorted(a, t, "right")
        i0 = np.searchsorted(a, t - window, "left")
        return [(i, t - a[i]) for i in range(i0, i1)]

    # ------------------------------------------------------------ layers
    def fx_back(self, c, t, look):
        if look["lamp"] > 0.05:  # dust motes floating in the lamp light
            m = self.motes
            for k in range(len(m)):
                x = (m[k, 0] + t * 9 * m[k, 2]) % self.w
                y = (m[k, 1] - t * 6 * m[k, 2] + 20 * math.sin(t * 0.5 + m[k, 3])) % self.h
                d = math.hypot(x - self.w * 0.72, y + self.h * 0.08) / (self.w * 0.75)
                al = look["lamp"] * 0.5 * max(0, 1 - d) * (0.5 + 0.5 * math.sin(t * 1.3 + m[k, 3]))
                if al > 0.02:
                    c.drawCircle(x, y, 1.2 + 2.2 * m[k, 2], paint(LAMP_COL, al, blur=1.2))

    def fx_front(self, c, t, fi, look, x):
        W_, H_ = self.w, self.h
        boost = 0.12 * self.S.pulse("chord", t, 1.2) + 0.18 * self.kick(t, 0.2) * self.in_drop(t)
        leaks(c, W_, H_, look, t, boost)
        film_burn(c, W_, H_, self.S.pulse("crash", t, 0.45) * 0.9, side=-1 if self.S.index("crash", t) % 2 else 1)
        # bells: little doodle stars in the margins (top / bottom bands, far edges), never over text
        for i, dt in self.recent("bell", t, 0.9):
            zone = int(rnd("bz", i) * 4)
            v = rnd("bv", i)
            sx, sy = ((90 + v * (W_ - 180), 38 + 20 * rnd("bw", i)), (90 + v * (W_ - 180), H_ - 38 - 20 * rnd("bw", i)),
                      (42 + 20 * rnd("bw", i), 150 + v * (H_ - 300)), (W_ - 42 - 20 * rnd("bw", i), 150 + v * (H_ - 300)))[zone]
            hand_star(c, sx, sy, 12 + 9 * rnd("bs", i), clamp(dt / 0.22), look["a2"], a=1 - dt / 0.9, t=t,
                      seed=("bell", i))
        # claps in drops: paper confetti
        if self.in_drop(t):
            for i, dt in self.recent("clap", t, 2.4):
                for j in range(9):
                    ox = W_ * rnd("cx", i, j)
                    vx = (rnd("vx", i, j) - 0.5) * 160
                    yy = -30 + (120 + 120 * rnd("vy", i, j)) * dt + 260 * dt * dt
                    xx = ox + vx * dt + 30 * math.sin(dt * 4 + j)
                    rot = (rnd("rt", i, j) - 0.5) * 720 * dt
                    col = (look["a1"], look["a2"], look["ink"], (0.98, 0.9, 0.6))[j % 4]
                    c.save()
                    c.translate(xx, yy)
                    c.rotate(rot)
                    c.drawRect(skia.Rect.MakeXYWH(-13, -6, 26, 12), paint(col, 0.85 * (1 - dt / 2.4)))
                    c.restore()
        # dust, hair, scratches
        dcol = mixc((0.12, 0.08, 0.05), (1.0, 0.96, 0.88), look["dark"])
        k = fi // 2
        for i in range(int(rnd("dn", k) * 6)):
            c.drawCircle(rnd("dx", k, i) * W_, rnd("dy", k, i) * H_, 0.8 + 2.4 * rnd("dr", k, i) ** 3,
                         paint(dcol, 0.18 + 0.3 * rnd("da", k, i)))
        k6 = fi // 5
        if rnd("hair", k6) < 0.08:
            hx, hy = rnd("hx", k6) * W_, rnd("hy", k6) * H_
            p = skia.Path()
            p.moveTo(hx, hy)
            p.cubicTo(hx + 30, hy - 40 * rnd("h1", k6), hx + 50, hy + 30, hx + 70 + 40 * rnd("h2", k6), hy + 10)
            c.drawPath(p, paint(dcol, 0.3, stroke=1.2))
        k4 = fi // 4
        if rnd("scr", k4) < 0.06:
            sx = rnd("sx", k4) * W_
            c.drawLine(sx, 0, sx + 6, H_, paint(dcol, 0.12, stroke=1.0))

    # ------------------------------------------------------------ full frame
    def frame(self, fi):
        t = fi / self.tl.fps
        W_, H_ = self.w, self.h
        cx, cy = W_ / 2, H_ / 2
        surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(W_, H_, skia.kRGBA_8888_ColorType,
                                                           skia.kPremul_AlphaType))
        c = surf.getCanvas()
        look = self.tl.look_at(self.looks, t, self.fast)
        x = Ctx(t)
        x.look = look
        x.mono = 0.0
        pic = self.tl.record(x, t)  # shots first: they may set x.mono / x.flash / x.shake for this frame

        paper_bg(c, W_, H_, look, t)
        self.fx_back(c, t, look)
        c.save()
        zoom = x.zoom * (1 + 0.007 * self.kick(t, 0.15))
        dx = 3 * math.sin(t * 0.37) + 2 * math.sin(t * 0.83 + 1) + (rnd("wx", fi) - 0.5) * 0.9
        dy = 2.5 * math.sin(t * 0.51 + 2) + (rnd("wy", fi) - 0.5) * 0.9
        dx += (rnd("shx", fi) - 0.5) * x.shake * 2
        dy += (rnd("shy", fi) - 0.5) * x.shake * 2
        c.translate(cx + dx, cy + dy)
        c.rotate(0.12 * math.sin(t * 0.29))
        c.scale(zoom, zoom)
        c.translate(-cx, -cy)
        c.drawPicture(pic)
        c.restore()
        c.drawImage(self.tex, 0, 0, LIN, skia.Paint(BlendMode=MULTIPLY, Alphaf=look["tex"]))
        self.fx_front(c, t, fi, look, x)
        post.vignette(c, W_, H_, look["vig"], col=(0.12, 0.06, 0.02))
        if x.flash > 0.01:
            c.drawPaint(paint((1.0, 0.97, 0.9), min(1, x.flash), blend=SCREEN))
        if look["dark"] > 0.05:
            self.bloom.apply(surf, alpha=0.32 * look["dark"], gain=1.9, threshold=1.25, blur=9,
                             tint=(1.0, 0.62, 0.38))
        fade = 1.0
        if t < self.intro_fade:
            fade = smooth(t / self.intro_fade)
        if t > self.tl.dur - self.outro_fade:
            fade = min(fade, smooth((self.tl.dur - t) / self.outro_fade))
        if fade < 0.999:
            c.drawPaint(paint((0.02, 0.015, 0.01), 1 - fade))

        out = post.to_array(surf).astype(np.int16)
        if x.mono > 0.001:
            g = out.mean(axis=2, keepdims=True)
            sep = np.array([1.04, 0.98, 0.88])  # faded-photo tint
            out = (out * (1 - x.mono) + g * sep * x.mono).astype(np.int16)
        out += int((rnd("flk", fi) - 0.5) * 4)  # projector flicker
        post.add_grain(out, self.grain, fi)
        post.finish(out)
        return out.astype(np.uint8).tobytes()


# ---------------------------------------------------------------- covers
def still_background(c, w, h, look, t=12.0):
    paper_bg(c, w, h, look, t)
    c.drawImage(make_paper(w, h), 0, 0, LIN, skia.Paint(BlendMode=MULTIPLY, Alphaf=look["tex"]))
    leaks(c, w, h, look, t)


def cover_title(c, s, x, y, size, col, align="left", marker=None, marker_a=0.45):
    """Big WenKai headline, optionally over a highlighter swipe (colour `marker`)."""
    f = font(size, "kai", bold=True)
    tw = f.measureText(s)
    x0 = {"left": x, "center": x - tw / 2, "right": x - tw}[align]
    if marker is not None:
        hand_marker(c, x0 - 10, x0 + tw + 10, y - size * 0.22, size * 0.42, 1.0, marker, marker_a, seed=s,
                    blend=MULTIPLY)
    c.drawString(s, x0 + 3, y + 5, f, paint(SHADOW, 0.25, blur=6))
    c.drawString(s, x0, y, f, paint(col))
    return x0, tw


def save_cover(surf, w, h, path, look, vig=None):
    c = surf.getCanvas()
    post.vignette(c, w, h, look["vig"] if vig is None else vig, col=(0.12, 0.06, 0.02))
    arr = post.to_array(surf).astype(np.int16)
    g = np.random.default_rng(2).normal(0, 3.5, arr.shape[:2]).astype(np.int16)
    arr += g[..., None]
    post.finish(arr)
    from PIL import Image
    Image.fromarray(arr.astype(np.uint8)).save(path)
    print(path)
