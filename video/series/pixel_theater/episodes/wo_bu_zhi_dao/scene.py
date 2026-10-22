"""Scene kit for 《我不知道》: a rainy-night detective office (noir).

The series keeps its cast and UI (style.py); this episode brings its own world:
  palettes   NOIR: case (ink blue + amber lamp), rain (cold, the low point), solved (warm drops), dawn
  backdrop   the city through rain, lightning; drawn by PixelTheater in place of the starry sky
  office     wall with a rain-streaked window, half-drawn blinds, desk, lamp, case folder, monitor
  light      venetian-blind light bands that sweep across walls and characters
  board      cork board, typed cards, push-pins, red thread; the "suspects" version of the
             next-word bars (polaroids with a red suspicion bar)
  props      fedora for 今今, typewriter labels, rubber stamps, spotlight, an iris closing to black
  post       film scratches, dust, flicker, letterbox bars
"""
import math

import numpy as np
import skia

from core.gfx import W, H, font, paint, clamp, lerp, smooth, ease_out, back_out, rnd, mixc, rrect, draw_text
from core.hand import hand_line, hand_circle
from core.pixel import Sprite, rect, snap
from style import (_pal, JIN, NIAN, monitor, inside, glass, desk, skyline, wallpaper, screen_frame, rain,
                   GOLD, WHITE, LAMP, SCREEN_GLOW, MAG)

NOIR = {
    # the case: ink-blue night, amber lamp
    "case": _pal((0.02, 0.03, 0.06), (0.05, 0.07, 0.12), (0.12, 0.14, 0.22), 0.0, (0.035, 0.04, 0.07), 0.5,
                 1.0, (0.95, 0.93, 0.88), (0.12, 0.12, 0.16), (0.45, 0.46, 0.52), (0.30, 0.34, 0.48),
                 (0.05, 0.06, 0.09), (0.11, 0.12, 0.17), (1.0, 0.75, 0.45), 0.30, 0.70),
    # the low point: colder, greyer, the lamp turned down
    "rain": _pal((0.015, 0.02, 0.035), (0.04, 0.05, 0.08), (0.09, 0.10, 0.15), 0.0, (0.025, 0.03, 0.05), 0.2,
                 0.45, (0.90, 0.90, 0.90), (0.14, 0.14, 0.17), (0.46, 0.47, 0.52), (0.30, 0.31, 0.38),
                 (0.035, 0.04, 0.06), (0.08, 0.08, 0.11), (0.60, 0.70, 0.92), 0.24, 0.78),
    # the drops: the case cracks, everything goes warm
    "solved": _pal((0.06, 0.04, 0.06), (0.20, 0.11, 0.10), (0.55, 0.30, 0.18), 0.0, (0.08, 0.05, 0.06), 1.0,
                   1.0, (1.0, 0.96, 0.89), (0.14, 0.12, 0.14), (0.48, 0.42, 0.42), (0.74, 0.42, 0.26),
                   (0.13, 0.08, 0.07), (0.28, 0.16, 0.12), (1.0, 0.70, 0.42), 0.36, 0.52),
    # the morning after: the rain has stopped
    "dawn": _pal((0.30, 0.38, 0.58), (0.80, 0.60, 0.56), (1.0, 0.82, 0.62), 0.0, (0.25, 0.22, 0.30), 0.1,
                 0.2, (1.0, 0.98, 0.93), (0.16, 0.14, 0.20), (0.44, 0.40, 0.50), (0.52, 0.52, 0.72),
                 (0.26, 0.26, 0.38), (0.58, 0.47, 0.50), (1.0, 0.85, 0.70), 0.22, 0.32),
}
RAIN_AMT = {"case": 0.55, "rain": 1.0, "solved": 0.35, "dawn": 0.0}
WALL = (0.07, 0.07, 0.10)
CORK = (0.50, 0.36, 0.24)
MANILA = (0.93, 0.85, 0.66)
PAPER = (0.96, 0.94, 0.88)
INK = (0.10, 0.09, 0.12)
THREAD = (0.82, 0.12, 0.14)
STAMP_RED = (0.86, 0.16, 0.16)

# ================================================================ characters' props
HAT = Sprite.from_ascii("""
....############....
...##############...
...##############...
...bbbbbbbbbbbbbb...
####################
.##################.
""", {"#": (0.17, 0.16, 0.20), "b": (0.62, 0.20, 0.22)})


ARROW = Sprite.from_ascii("""
...#...
..###..
.#####.
#######
..###..
..###..
""", {"#": GOLD})


def jin_at(c, cx, by, px=8, hat=True, hop=0.0, a=1.0, tip=0.0, **kw):
    """今今 with its fedora (tip > 0 lifts the hat for a greeting)."""
    JIN.draw_at(c, cx, by, px=px, hop=hop, a=a, **kw)
    if hat:
        w2, h2 = JIN.size
        top = by - h2 * px - hop
        lift = px * 3 * math.sin(clamp(tip) * math.pi)
        HAT.draw(c, cx - HAT.w * px / 2, top - 4 * px - lift, px=px, a=a)


def nian_at(c, cx, by, px=8, mag=False, hop=0.0, t=0.0, **kw):
    """念念, optionally holding her magnifier up."""
    NIAN.draw_at(c, cx, by, px=px, hop=hop, t=t, **kw)
    if mag:
        w2, h2 = NIAN.size
        MAG.draw(c, cx + w2 * px * 0.42, by - h2 * px * 0.75 - hop + 4 * px * math.sin(t * 2.2), px=px * 0.8,
                 glow=0.15)


# ================================================================ backdrop + light
class Outside:
    """The city through the window: night gradient, far buildings, rain, lightning."""

    def __init__(self):
        r = np.random.default_rng(11)
        self.drops = np.stack([r.uniform(0, W, 90), r.uniform(0, H, 90), r.uniform(0.5, 1.5, 90),
                               r.uniform(3, 7, 90)], 1)

    def __call__(self, c, look, t, x):
        sh = skia.GradientShader.MakeLinear([(0, 0), (0, H)], [skia.Color4f(*look["sky0"], 1).toColor(),
                                                              skia.Color4f(*look["sky1"], 1).toColor(),
                                                              skia.Color4f(*look["sky2"], 1).toColor()],
                                            [0.0, 0.6, 1.0])
        c.drawPaint(skia.Paint(Shader=sh))
        lit = getattr(x, "lightning", 0.0)
        if lit > 0.01:
            c.drawPaint(paint((0.75, 0.82, 1.0), 0.55 * lit))
        skyline(c, look, t, y=720)
        # a neon sign far away, buzzing
        buzz = 0.75 + 0.25 * (rnd("neon", int(t * 9)) > 0.15)
        c.drawRRect(rrect(640, 470, 150, 46, 10), paint((1.0, 0.35, 0.45), 0.16 * buzz, blur=26))
        draw_text(c, "HOTEL", 715, 505, font(34, "type"), paint((1.0, 0.45, 0.55), 0.75 * buzz))
        ra = RAIN_AMT.get(getattr(x, "rain_key", "case"), 0.5) * getattr(x, "rain", 1.0)
        if ra > 0.01:
            rain(c, t, a=ra, n=int(120 + 120 * ra))


def blind_light(c, t, a=1.0, angle=-24, period=46, duty=0.55, drift=18, col=None, x0=0, y0=0, w=W, h=H):
    """Bands of light through venetian blinds, slanted, drifting slowly (a car passing outside)."""
    if a <= 0.01:
        return
    col = col or LAMP
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(x0, y0, w, h))
    c.translate(x0 + w * 0.5, y0 + h * 0.5)
    c.rotate(angle)
    off = (t * drift) % period
    p = paint(col, 0.10 * a, blur=4)
    span = int((w + h) / period) + 4
    for i in range(-span, span):
        yy = i * period + off - period * 0.5
        c.drawRect(skia.Rect.MakeXYWH(-w * 1.2, yy, w * 2.4, period * duty), p)
    c.restore()


def droplets(c, t, rx, ry, rw, rh, a=1.0, seed=0, n=40):
    """Raindrops sliding down a pane, with a faint wet trail."""
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(rx, ry, rw, rh))
    for i in range(n):
        x_ = rx + rnd("dx", seed, i) * rw
        sp = 30 + 70 * rnd("dv", seed, i)
        y_ = ry + (rnd("dy", seed, i) * rh + t * sp) % (rh + 40) - 20
        r_ = 2 + 3 * rnd("dr", seed, i)
        c.drawRect(skia.Rect.MakeXYWH(x_ - 1, y_ - 40, 2, 40), paint((0.8, 0.85, 1.0), 0.06 * a))
        c.drawOval(skia.Rect.MakeXYWH(x_ - r_, y_ - r_ * 1.3, 2 * r_, 2.6 * r_), paint((0.85, 0.9, 1.0), 0.28 * a))
        c.drawCircle(x_ - r_ * 0.3, y_ - r_ * 0.5, r_ * 0.35, paint(WHITE, 0.5 * a))
    c.restore()


WINDOW = (130, 70, 860, 600)  # the office window (x, y, w, h)


MON = (1430, 470, 760, 428)  # monitor screen centre + size in the office shot
NIAN_X, DESK_Y = 640, 822


def office(c, x, t, look, inner=None, mon=MON, lamp=True, blinds=0.35, mon_on=1.0, folder=True):
    """Wide office shot: wall with the window (backdrop shows through), blinds, desk, lamp, monitor.
    inner(c, t) draws the screen-space UI inside the monitor.  Returns the monitor screen rect."""
    wx, wy, ww, wh = WINDOW
    wall = skia.Path()
    wall.setFillType(skia.PathFillType.kEvenOdd)
    wall.addRect(skia.Rect.MakeWH(W, H))
    wall.addRect(skia.Rect.MakeXYWH(wx, wy, ww, wh))
    c.drawPath(wall, paint(mixc(WALL, look["wall1"], 0.35)))
    droplets(c, t, wx, wy, ww, wh, seed=1)
    # frame, mullions, sill
    fp = paint((0.03, 0.03, 0.05), 1.0, stroke=18)
    c.drawRect(skia.Rect.MakeXYWH(wx, wy, ww, wh), fp)
    c.drawLine(wx + ww / 2, wy, wx + ww / 2, wy + wh, paint((0.03, 0.03, 0.05), 1.0, stroke=12))
    c.drawLine(wx, wy + wh * 0.45, wx + ww, wy + wh * 0.45, paint((0.03, 0.03, 0.05), 1.0, stroke=10))
    c.drawRect(skia.Rect.MakeXYWH(wx - 30, wy + wh, ww + 60, 18), paint((0.10, 0.09, 0.11)))
    # blinds pulled part-way down
    nb = int(wh * blinds / 22)
    for i in range(nb):
        yy = wy + i * 22
        c.drawRect(skia.Rect.MakeXYWH(wx + 6, yy, ww - 12, 15), paint((0.68, 0.66, 0.60), 0.9))
        c.drawRect(skia.Rect.MakeXYWH(wx + 6, yy + 13, ww - 12, 3), paint((0, 0, 0), 0.35))
    if nb:
        c.drawLine(wx + ww * 0.3, wy, wx + ww * 0.3, wy + nb * 22 + 40, paint((0.8, 0.8, 0.75), 0.6, stroke=2))
    # the light of the window falls on the wall as blind bands
    blind_light(c, t, look["lamp"] * 0.8 + 0.2, col=mixc(SCREEN_GLOW, LAMP, 0.4), x0=wx + ww, y0=0, w=W - wx - ww,
                h=822)
    desk(c, look, DESK_Y, lamp=lamp, lamp_x=230, mug_x=0)
    if folder:  # case folder + magnifier on the desk
        c.save()
        c.translate(860, 806)
        c.rotate(-4)
        c.drawRRect(rrect(-150, -26, 300, 30, 4), paint((0, 0, 0), 0.4, blur=8))
        c.drawRRect(rrect(-150, -30, 300, 30, 4), paint(MANILA))
        c.drawRect(skia.Rect.MakeXYWH(-150, -30, 300, 5), paint((0.80, 0.70, 0.50)))
        draw_text(c, "CASE No.2", -40, -9, font(18, "type"), paint(INK, 0.8))
        c.restore()
        MAG.draw(c, 1010, 770, px=5)
    cx, cy, sw, sh = mon
    sx, sy, sw, sh = monitor(c, cx, cy, sw, sh, look, on=mon_on)
    with inside(c, sx, sy, sw, sh):
        desktop(c, look, t)
        if inner:
            inner(c, t)
    glass(c, sx, sy, sw, sh)
    return sx, sy, sw, sh


def desktop(c, look, t, a=1.0):
    """Screen-space desktop: the series wallpaper plus the shadow of rain running down the window."""
    wallpaper(c, look, t, a=a)
    blind_light(c, t, 0.6 * a, angle=-18, period=70, col=(0.75, 0.82, 1.0), drift=10)


def screen(c, x, t, look):
    """Start of a full-frame screen shot."""
    x.sky = False
    desktop(c, look, t)


def noir_light(c, t, a=1.0, col=None):
    """Light through the blinds falling across the whole screen: the room darkens between the bands."""
    c.drawPaint(paint((0.0, 0.0, 0.03), 0.30 * a))
    blind_light(c, t, 1.8 * a, angle=-20, period=96, duty=0.5, drift=8, col=col or (1.0, 0.86, 0.66))


def end_screen(c, x, t, look):
    """Finish a full-frame screen shot: blind light across the UI, rain shadows on the glass, bezel."""
    noir_light(c, t, 0.35 + 0.65 * look["lamp"])
    droplets(c, t, 0, 0, W, H, a=0.35 * RAIN_AMT.get(x.rain_key, 0.5), seed=7, n=26)
    screen_frame(c, look)


def bokeh(c, look, t, a=1.0):
    """Close-up background: dark room, lamp and rain-light bokeh."""
    c.drawPaint(paint(mixc(look["sky0"], look["sky1"], 0.6), a))
    r = np.random.default_rng(4)
    for i in range(18):
        bx, by = r.uniform(0, W), r.uniform(0, H * 0.8)
        rad = r.uniform(40, 140)
        col = LAMP if i % 3 == 0 else (0.55, 0.65, 1.0)
        k = 0.5 + 0.5 * math.sin(t * 0.5 + i)
        c.drawCircle(bx + 12 * math.sin(t * 0.25 + i), by, rad, paint(col, a * (0.04 + 0.05 * k), blur=rad * 0.3))
    c.drawCircle(W * 0.22, H * 0.35, 650, paint(LAMP, a * 0.10 * (0.3 + look["lamp"]), blur=240))
    c.drawRect(skia.Rect.MakeXYWH(0, H * 0.82, W, H * 0.18), paint((0.09, 0.06, 0.05), a * 0.9))
    c.drawRect(skia.Rect.MakeXYWH(0, H * 0.82, W, 3), paint((0.42, 0.30, 0.20), a * 0.6))


def spotlight(c, cx, cy, r, a=1.0):
    """Everything dark except a soft pool of light."""
    if a <= 0.01:
        return
    sh = skia.GradientShader.MakeRadial(skia.Point(cx, cy), r * 1.6,
                                        [skia.Color4f(0, 0, 0.02, 0).toColor(), skia.Color4f(0, 0, 0.02, 0).toColor(),
                                         skia.Color4f(0, 0, 0.02, 0.94 * a).toColor()], [0.0, 0.55, 1.0])
    c.drawPaint(skia.Paint(Shader=sh))


def iris_close(c, u, ox, oy, a=1.0):
    """Close the picture to black inside a shrinking circle (u 0 open -> 1 closed)."""
    if u <= 0:
        return
    far = max(math.hypot(ox - px, oy - py) for px in (0, W) for py in (0, H))
    r = far * (1 - smooth(clamp(u))) ** 1.3
    p = skia.Path()
    p.setFillType(skia.PathFillType.kEvenOdd)
    p.addRect(skia.Rect.MakeWH(W, H).makeOutset(40, 40))
    if r > 0.5:
        p.addCircle(ox, oy, r)
    c.drawPath(p, paint((0, 0, 0), a))


# ================================================================ paper things
def typed(c, s, x, y, size, n=None, col=INK, a=1.0, align="left", seed=0, cursor=False):
    """Typewriter text: per-character baseline wobble and uneven ink.  n: characters shown."""
    f = font(size, "mono", True)
    shown = s if n is None else s[:max(0, int(n))]
    total = f.measureText(s)
    x0 = x - (total / 2 if align == "center" else total if align == "right" else 0)
    xx = x0
    for i, ch in enumerate(shown):
        dy = (rnd("ty", seed, i) - 0.5) * size * 0.06
        ink = 0.78 + 0.22 * rnd("ti", seed, i)
        c.drawString(ch, xx, y + dy, f, paint(col, a * ink))
        xx += f.measureText(ch)
    if cursor and (n is None or n < len(s)):
        c.drawRect(skia.Rect.MakeXYWH(xx + 2, y - size * 0.82, size * 0.5, size * 0.95), paint(col, 0.6 * a))
    return total


def label(c, s, x, y, size, n=None, a=1.0, align="center", seed=0, tape=True):
    """A typed caption on a cream paper strip (the film's narration cards)."""
    f = font(size, "mono", True)
    tw = f.measureText(s)
    pad = size * 0.6
    x0 = x - (tw / 2 if align == "center" else tw if align == "right" else 0) - pad
    c.save()
    c.translate(x0 + tw / 2 + pad, y)
    c.rotate((rnd("lr", seed) - 0.5) * 2.0)
    c.translate(-(x0 + tw / 2 + pad), -y)
    c.drawRect(skia.Rect.MakeXYWH(x0 + 6, y - size * 1.05 + 8, tw + 2 * pad, size * 1.55), paint((0, 0, 0), 0.4 * a,
                                                                                                 blur=10))
    c.drawRect(skia.Rect.MakeXYWH(x0, y - size * 1.05, tw + 2 * pad, size * 1.55), paint(PAPER, a))
    if tape:
        c.drawRect(skia.Rect.MakeXYWH(x0 - 16, y - size * 1.2, 60, 26), paint((0.95, 0.92, 0.75), 0.6 * a))
    typed(c, s, x0 + pad, y, size, n, INK, a, seed=seed, cursor=n is not None)
    c.restore()


def typed_n(t, t0, beat, text):
    """Characters shown by a typewriter caption started at t0: one per sixteenth note."""
    return clamp((t - t0) / (beat / 4) + 1, 0, len(text))


def stamp(c, s, cx, cy, u, size=110, rot=-12, col=STAMP_RED, a=1.0, seed=0):
    """Rubber stamp slammed down: u = seconds since impact (< 0: not yet).  Double border, worn ink."""
    if u < -0.12:
        return
    k = 1.0 if u >= 0 else 1 + (-u / 0.12) * 1.4  # falls from big to its size in the last 0.12 s
    al = a * (1.0 if u >= 0 else 0.4 * (1 + u / 0.12))
    f = font(size, "cjk", True)
    tw = f.measureText(s)
    bw, bh = tw + size * 0.8, size * 1.45
    c.save()
    c.translate(cx, cy)
    c.rotate(rot)
    c.scale(k, k)
    c.saveLayer(None, paint(WHITE, al))
    c.drawRRect(rrect(-bw / 2, -bh / 2, bw, bh, size * 0.18), paint(col, 1.0, stroke=size * 0.08))
    c.drawRRect(rrect(-bw / 2 + size * 0.14, -bh / 2 + size * 0.14, bw - size * 0.28, bh - size * 0.28, size * 0.1),
                paint(col, 1.0, stroke=size * 0.03))
    c.drawString(s, -tw / 2, size * 0.36, f, paint(col, 1.0))
    for i in range(70):  # worn rubber: little gaps in the ink
        px_ = (rnd("sg", seed, i) - 0.5) * bw
        py_ = (rnd("sh", seed, i) - 0.5) * bh
        c.drawCircle(px_, py_, 1.5 + 4 * rnd("sr", seed, i) ** 2, paint((0, 0, 0), 1.0,
                                                                        blend=skia.BlendMode.kDstOut))
    c.restore()
    c.restore()


# ================================================================ the board
def corkboard(c, look, t, a=1.0):
    """Full-frame cork board with a frame, lit by the lamp from the top-left, blind light across."""
    c.drawPaint(paint(CORK, a))
    r = np.random.default_rng(31)
    pts = r.uniform(0, 1, (900, 3))
    for i, (u, v, k) in enumerate(pts):
        c.drawCircle(u * W, v * H, 1.5 + 2.5 * k, paint((0.32, 0.22, 0.14) if i % 2 else (0.62, 0.48, 0.33),
                                                       0.45 * a))
    c.drawCircle(W * 0.3, H * 0.25, 900, paint(LAMP, 0.16 * a * (0.3 + look["lamp"]), blur=200))
    c.drawPaint(paint((0.02, 0.02, 0.05), 0.25 * a))
    fr = paint((0.20, 0.13, 0.09), a, stroke=50)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), fr)
    blind_light(c, t, 0.9 * a, angle=-28, period=60, drift=12)


def pin(c, x, y, a=1.0, col=(0.85, 0.15, 0.18), pop=1.0):
    k = back_out(clamp(pop), 2.5)
    if k <= 0:
        return
    c.drawCircle(x + 4, y + 6, 12 * k, paint((0, 0, 0), 0.45 * a, blur=5))
    c.drawCircle(x, y, 12 * k, paint(col, a))
    c.drawCircle(x - 4 * k, y - 4 * k, 4 * k, paint(WHITE, 0.6 * a))


def card(c, x, y, w, h, lines, a=1.0, rot=0.0, size=40, fill=PAPER, seed=0, pin_pop=1.0, n=None):
    """A typed index card pinned at its top centre.  Returns the pin point."""
    c.save()
    c.translate(x + w / 2, y)
    c.rotate(rot)
    c.drawRect(skia.Rect.MakeXYWH(-w / 2 + 8, 10, w, h), paint((0, 0, 0), 0.45 * a, blur=12))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2, 0, w, h), paint(fill, a))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2, 30 + size * 1.25, w, 2), paint((0.85, 0.45, 0.45), 0.6 * a))
    used = 0
    for i, s in enumerate(lines):
        m = None if n is None else max(0, n - used)
        used += len(s)
        typed(c, s, -w / 2 + 22, 30 + size * (1.0 + 1.35 * i) + (12 if i else 0), size if i == 0 else size * 0.8, m,
              INK, a, seed=(seed, i))
    pin(c, 0, 14, a, pop=pin_pop)
    c.restore()
    return x + w / 2, y + 14


def thread(c, p0, p1, u=1.0, a=1.0, seed=0, sag=0.06, t=None):
    """Red thread between two pins, drawn on with u."""
    if u <= 0:
        return
    hand_line(c, p0[0], p0[1], p1[0], p1[1], clamp(u), THREAD, a, w=4, seed=("th", seed), sag=sag)


def suspects(c, x, y, words, probs, u, look, pick=None, t=0.0, a=1.0, hover=None, title_="嫌疑人名单",
             note="示意", w=1500, gap=40):
    """The next-word candidates as suspects: one polaroid per word with a red 'suspicion' bar.
    u: 0 -> 1 cards drop in and bars grow; pick lights one card (u 1 -> 1.3) and circles it in red.
    hover: a float index, a pointer wavering between cards (for someone who cannot decide).
    Returns the picked card's centre."""
    n = len(words)
    cw = (w - gap * (n - 1)) / n
    ch = cw * 1.18
    typed(c, title_, x, y - 30, 44, None, (0.98, 0.94, 0.86), a, seed=9)
    draw_text(c, note, x + w, y - 34, font(30), paint((0.95, 0.88, 0.80), 0.8 * a), align="right")
    pk = clamp((u - 1.0) / 0.3) if pick is not None else 0.0
    out = None
    for i, (s, p_) in enumerate(zip(words, probs)):
        k = ease_out(clamp((u - i * 0.1) / 0.35), 3)
        if k <= 0:
            continue
        cx = x + i * (cw + gap)
        cy = y + 30 + (1 - k) * -80
        rot = (rnd("sr", i, s) - 0.5) * 6
        on = i == pick
        dim = 1 - 0.5 * pk * (not on)
        c.save()
        c.translate(cx + cw / 2, cy)
        c.rotate(rot)
        c.saveLayer(None, paint(WHITE, a * k * dim))
        c.drawRect(skia.Rect.MakeXYWH(-cw / 2 + 10, 12, cw, ch), paint((0, 0, 0), 0.5, blur=14))
        c.drawRect(skia.Rect.MakeXYWH(-cw / 2, 0, cw, ch), paint(PAPER))
        ph = cw - 36
        c.drawRect(skia.Rect.MakeXYWH(-cw / 2 + 18, 18, cw - 36, ph * 0.72), paint((0.16, 0.16, 0.20)))
        # height chart lines behind the "mugshot"
        for j in range(5):
            c.drawRect(skia.Rect.MakeXYWH(-cw / 2 + 18, 18 + ph * 0.72 * j / 5, cw - 36, 2),
                       paint((0.5, 0.5, 0.55), 0.5))
        f = font(min(84, cw * 0.36 / max(1, len(s)) * 2.2), "kai", True)
        draw_text(c, s, 0, 18 + ph * 0.36 + f.getSize() * 0.35, f, paint((0.96, 0.94, 0.88)))
        # suspicion bar
        by = 18 + ph * 0.72 + 30
        typed(c, "可疑度", -cw / 2 + 18, by + 24, 26, None, INK, 1.0, seed=(i, 3))
        seg, sgap = 14, 4
        bx0 = -cw / 2 + 18
        nmax = int((cw - 36) // (seg + sgap))
        grow = smooth(clamp((u - 0.25 - i * 0.12) / 0.45))
        nb = int(round(p_ * nmax * grow))
        if p_ > 0 and grow > 0:
            nb = max(1, nb)
        for j in range(nb):
            rect(c, bx0 + j * (seg + sgap), by + 44, seg, 26, THREAD if not on or pk < 0.5 else GOLD, 1.0)
        c.restore()
        c.restore()
        pin(c, cx + cw / 2, cy + 14, a * k)
        if on and pk > 0:
            hand_circle(c, cx + cw / 2, cy + ch / 2, cw * 0.62, ch * 0.6, pk, THREAD, a, w=7, seed=("sc", i))
            out = (cx + cw / 2, cy + ch / 2)
    if hover is not None:  # a wavering pointer: cannot decide
        hx = x + hover * (cw + gap) + cw / 2
        ARROW.draw(c, hx - ARROW.w * 5, y + ch + 70 + 8 * math.sin(t * 9), px=10, a=a, glow=0.4)
    return out


def sentence(c, prefix, word, x, y, size=60, u=1.0, a=1.0):
    """The sentence being written, on a typed strip: '番茄炒蛋，要先炒 ___' (word appears at u > 0)."""
    f = font(size, "mono", True)
    pw = f.measureText(prefix)
    blank = max(f.measureText(word) if word else 0, size * 2.2)
    tw = pw + blank + size * 0.4
    c.drawRect(skia.Rect.MakeXYWH(x - tw / 2 - 30 + 8, y - size * 1.1 + 10, tw + 60, size * 1.6),
               paint((0, 0, 0), 0.45 * a, blur=10))
    c.drawRect(skia.Rect.MakeXYWH(x - tw / 2 - 30, y - size * 1.1, tw + 60, size * 1.6), paint(PAPER, a))
    typed(c, prefix, x - tw / 2, y, size, None, INK, a, seed=prefix)
    bx = x - tw / 2 + pw + size * 0.2
    c.drawRect(skia.Rect.MakeXYWH(bx, y + 10, blank, 4), paint(INK, 0.7 * a))
    if word and u > 0:
        k = back_out(clamp(u / 0.25), 2.2)
        c.save()
        c.translate(bx + blank / 2, y - size * 0.35)
        c.scale(k, k)
        draw_text(c, word, 0, size * 0.35, font(size, "kai", True), paint(THREAD, a))
        c.restore()
    return bx + blank / 2, y - size * 0.35


# ================================================================ post
def post_fx(c, t, fi, x, look):
    """Old film: letterbox, a little flicker, dust and the odd vertical scratch."""
    lb = getattr(x, "letterbox", 0.0)
    if lb > 0.01:
        hh = 74 * lb
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, hh), paint((0, 0, 0)))
        c.drawRect(skia.Rect.MakeXYWH(0, H - hh, W, hh), paint((0, 0, 0)))
    k = int(t * 24)  # film runs at 24: the dirt changes at that rate
    c.drawPaint(paint((0, 0, 0), 0.035 * rnd("fl", k)))
    for i in range(3):
        if rnd("dust", k, i) < 0.35:
            dx, dy = rnd("dx", k, i) * W, rnd("dy", k, i) * H
            c.drawCircle(dx, dy, 1.5 + 3 * rnd("ds", k, i), paint((0.9, 0.9, 0.85), 0.35))
    if rnd("scr", k // 3) < 0.3:
        sx = rnd("sx", k // 3) * W
        c.drawRect(skia.Rect.MakeXYWH(sx, 0, 1.6, H), paint((0.92, 0.92, 0.88), 0.18))
