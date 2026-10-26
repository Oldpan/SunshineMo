"""第一座山（局部最优 · Local optimum） — 一帧一理 episode 4 in ink wash (水墨), cold-open test (10 bars, 24 s).

  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 1 4 8.5 11 13 15 17 18.2 20.5 22.5
  python3 render.py                                    # 1920x1080 @ 60 fps

The page is warm rice paper; the mountains are painted once in world space (skia Pictures) and drawn through a
camera.  Fog is blank paper laid back over the ink, with a hole where the lantern reaches; clouds drift over it
in a few depths.  One vermilion only: the lantern (and the seal on the title).
Every timed change reads cues.HITS through `since()` / `pop()`, so picture and score agree.
"""
import math
import os
import sys
from pathlib import Path

import numpy as np
import skia

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
sys.path.insert(0, HERE)
from core.timeline import Timeline, Sync, Ctx  # noqa: E402
from core.pipeline import run  # noqa: E402
from core.gfx import clamp, lerp, smooth, ease_out, ease_io  # noqa: E402
from core import post  # noqa: E402
from style import serif, parse_marks  # noqa: E402
from ink import (PAPER, INKC, RED, TONE, col4, ink_paint, paper_image, brush, mass, moss, seal,  # noqa: E402
                 noise1)
from cues import (BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, SILENCES, captions, hit_times,  # noqa: E402
                  t_of)

W, H = 1920, 1080
tl = Timeline(bpm=BPM, bars=BARS, sections=SECTIONS, hard_cuts=True)
B, shot, BAR, BEAT = tl.B, tl.shot, tl.bar, tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))


def hits(name, lo=0):
    return [h for h in hit_times(name) if h >= B(lo) - 1e-6]


def since(name, t, lo=0):
    ts = [h for h in hits(name, lo) if h <= t + 1e-6]
    return t - ts[-1] if ts else 1e9


def count(name, t, lo=0):
    return sum(1 for h in hits(name, lo) if h <= t + 1e-6)


def pop(name, t, dur=0.22, lo=0):
    s = since(name, t, lo)
    return ease_out(clamp(s / dur), 4) if s < 1e8 else 0.0


def since_nth(name, i, t, lo=0):
    ts = hits(name, lo)
    return t - ts[i] if i < len(ts) else -1


def frozen(t):
    for b, b0, b1 in SILENCES:
        a, z = t_of(b, b0), t_of(b, b1)
        if a <= t < z:
            return a
    return t


# ------------------------------------------------------------------ the range, painted once
def height(x):
    """The landscape the climber walks: a near hill at x=1500, the real summit at x=3300."""
    return 80 + 520 * math.exp(-((x - 1500) / 420) ** 2) + 1150 * math.exp(-((x - 3300) / 650) ** 2)


def rough(x):
    """What the brush draws: the same range with crags; the two summits stay true summits."""
    env = (0.25 + 0.75 * min(1, height(x) / 600)) * (1 - math.exp(-((x - 1500) / 160) ** 2)) \
        * (1 - 0.8 * math.exp(-((x - 3300) / 200) ** 2))
    return height(x) + env * (34 * math.sin(x / 61 + 1.3) + 22 * math.sin(x / 23 + 0.4) + 12 * math.sin(x / 9.7))


def wpt(x, h=None):
    """World point: x right, height up (canvas y = -h)."""
    return x, -(rough(x) if h is None else h)


def ridge(x0, x1, n=120, dy=0.0, dx=0.0):
    return [(x + dx, -rough(x) + dy) for x in np.linspace(x0, x1, n)]


def record(fn):
    rec = skia.PictureRecorder()
    c = rec.beginRecording(skia.Rect.MakeLTRB(-3000, -3000, 8000, 3000))
    fn(c)
    return rec.finishRecordingAsPicture()


def paint_near(c):
    """The near hill, thick ink: wash, loaded ridge stroke, 披麻皴, moss dots."""
    mass(c, ridge(500, 2400, 90) + [(2400, 300), (500, 300)], "zhong", 6, h=300, blur=10)
    brush(c, ridge(560, 1500, 90), 15, "jiao", 0.35, 30, 7, loaded=0.85, taper=(0.3, 0.02), wet=0.6)
    brush(c, ridge(1500, 2350, 90), 14, "nong", 0.5, 28, 8, loaded=0.8, taper=(0.02, 0.4), wet=0.5)
    for j in range(8):
        brush(c, ridge(1080 + j * 30, 1450 - j * 18, 30, dy=26 + j * 20, dx=-6 * j), 6, "zhong", 0.7, 6, 20 + j,
              loaded=0.2, taper=(0.4, 0.4))
        brush(c, ridge(1560 + j * 16, 1900 - j * 28, 30, dy=26 + j * 20, dx=6 * j), 6, "dan", 0.75, 6, 40 + j,
              loaded=0.2, taper=(0.4, 0.4))
    moss(c, [wpt(x) for x in (1180, 1290, 1380, 1620, 1730, 960)], 9, size=6)


def paint_summit(c):
    """The real summit: a pale body, a long dark ridge, axe-cut texture on the lit face."""
    big = ridge(2350, 4500, 110)
    mass(c, big + [(4500, 300), (2350, 300)], "dan", 2, h=700, blur=10, a=1.5)
    brush(c, ridge(2450, 3300, 80), 18, "nong", 0.45, 30, 3, loaded=0.85, taper=(0.3, 0.02), wet=0.5)
    brush(c, ridge(3300, 4400, 80), 15, "zhong", 0.6, 26, 4, loaded=0.7, taper=(0.02, 0.4))
    for j in range(10):
        brush(c, ridge(2850 + j * 26, 3260 - j * 14, 28, dy=40 + j * 34, dx=-10 * j), 8, "zhong", 0.75, 7, 50 + j,
              loaded=0.25)
    moss(c, [wpt(x) for x in (2900, 3050, 3180, 3420)], 12, size=7)


def paint_far(c):
    far = [(x, -(300 + 420 * math.exp(-((x - 2700) / 950) ** 2) + 70 * math.sin(x / 260))) for x in
           np.linspace(-800, 5200, 90)]
    mass(c, far + [(5200, 300), (-800, 300)], "qing", 1, h=420, blur=14, a=1.5)


PIC_NEAR, PIC_SUMMIT, PIC_FAR = record(paint_near), record(paint_summit), record(paint_far)


class Cam:
    """World -> screen: (x, -h) scaled by z about (cx, ch), placed at (ox, oy)."""

    def __init__(self, cx, ch, z, ox=760, oy=640):
        self.cx, self.ch, self.z, self.ox, self.oy = cx, ch, z, ox, oy

    def p(self, x, h):
        return self.ox + (x - self.cx) * self.z, self.oy - (h - self.ch) * self.z

    def apply(self, c, par=1.0):
        c.translate(self.ox, self.oy)
        c.scale(self.z * par, self.z * par)
        c.translate(-self.cx, self.ch)


def draw_world(c, cam, far=True):
    if far:
        c.save()
        Cam(cam.cx, cam.ch * 0.6, cam.z * 0.75, cam.ox, cam.oy).apply(c)
        c.drawPicture(PIC_FAR)
        c.restore()
    c.save()
    cam.apply(c)
    c.drawPicture(PIC_SUMMIT)
    c.drawPicture(PIC_NEAR)
    c.restore()


_pap = []


def paper_shader():
    if not _pap:
        _pap.append(paper_image(W, H).makeShader(skia.TileMode.kClamp, skia.TileMode.kClamp, skia.SamplingOptions()))
    return _pap[0]


def _paper_masked(c, mask, rect):
    """Paper drawn through an alpha mask (layer + DstIn), much faster than a Blend shader."""
    c.saveLayer(rect)
    if rect is not None:
        c.clipRect(rect)
    c.drawPaint(skia.Paint(Shader=paper_shader()))
    c.drawPaint(skia.Paint(Shader=mask, BlendMode=skia.BlendMode.kDstIn))
    c.restore()


def fog(c, lx, ly, r, a=1.0):
    """Blank paper laid back over the ink, with a soft hole where the lantern reaches."""
    if a <= 0.003:
        return
    if r > 1:
        hole = skia.GradientShader.MakeRadial(skia.Point(lx, ly), r, [col4((0, 0, 0), 0), col4((0, 0, 0), 0.5 * a),
                                                                       col4((0, 0, 0), a)], [0.0, 0.5, 1.0])
    else:
        hole = skia.Shaders.Color(col4((0, 0, 0), a))
    _paper_masked(c, hole, None)


# ------------------------------------------------------------------ clouds and mist
CLOUDS = [  # (depth 0 far .. 1 near, y on screen, length, speed px/s, seed)
    (0.15, 260, 520, 6, 1), (0.3, 430, 640, 9, 2), (0.55, 620, 760, 14, 3), (0.75, 860, 900, 20, 4),
    (0.2, 140, 420, 7, 5)]


def paint_cloud(c, L, depth, seed):
    """A cloud at the origin: overlapping soft lobes of pale wash, curled dry strokes on the lobe tops (云头),
    the underside dissolving into paper."""
    r = np.random.default_rng(seed)
    n = 4 + int(3 * depth)
    th = 50 + 80 * depth
    lobes = []
    for k in range(n):
        v = (k + 0.5) / n
        rad = th * (0.55 + 0.45 * math.sin(v * math.pi)) * r.uniform(0.8, 1.15)
        lobes.append((L * v + r.uniform(-15, 15), -rad * 0.55, rad))
    tone = 0.10 + 0.14 * depth
    for lx_, ly_, rad in lobes:
        c.drawCircle(lx_, ly_, rad, ink_paint(tone, blur=rad * 0.35))
    for k, (lx_, ly_, rad) in enumerate(lobes):            # the curled top of each lobe
        arc = [(lx_ + math.cos(a_) * rad * 0.9, ly_ + math.sin(a_) * rad * 0.9)
               for a_ in np.linspace(math.pi * 1.05, math.pi * (1.75 + 0.15 * (k % 2)), 18)]
        brush(c, arc, 2.5 + 3.5 * depth, "dan" if depth > 0.4 else "qing", 0.55, 8, 300 + seed * 10 + k,
              loaded=0.5, taper=(0.2, 0.5))
        if k % 2 == 0:
            cx_, cy_ = arc[-1]
            curl = [(cx_ + math.cos(a_) * rad * 0.22 * (1 - a_ / 8), cy_ + rad * 0.2 + math.sin(a_) * rad * 0.22
                     * (1 - a_ / 8)) for a_ in np.linspace(-1.6, 4.4, 16)]
            brush(c, curl, 2 + 2.5 * depth, "dan", 0.5, 6, 400 + seed * 10 + k, loaded=0.3, taper=(0.1, 0.6))
    # the underside fades: paper laid over the bottom half
    sh = skia.GradientShader.MakeLinear([skia.Point(0, -th * 0.35), skia.Point(0, th * 0.3)],
                                        [col4(PAPER, 0), col4(PAPER, 1)])
    c.drawRect(skia.Rect.MakeLTRB(-th * 2, -th * 0.35, L + th * 2, th * 1.6), skia.Paint(Shader=sh))


_cloud_pics = {}


def cloud_pic(L, depth, seed):
    key = (L, depth, seed)
    if key not in _cloud_pics:
        rec = skia.PictureRecorder()
        cc = rec.beginRecording(skia.Rect.MakeLTRB(-600, -600, L + 600, 600))
        paint_cloud(cc, L, depth, seed)
        _cloud_pics[key] = rec.finishRecordingAsPicture()
    return _cloud_pics[key]


def clouds(c, t, cam_dx=0.0, a=1.0, ymin=0, ymax=H):
    for depth, y, L, speed, seed in CLOUDS:
        if not ymin <= y <= ymax:
            continue
        span = W + L + 600
        x = ((seed * 377 + t * speed - cam_dx * (0.2 + 0.8 * depth)) % span) - L - 300
        c.save()
        c.translate(x, y)
        if a < 0.999 or a > 1.001:
            c.saveLayerAlpha(None, int(255 * clamp(a)))
            c.drawPicture(cloud_pic(L, depth, seed))
            c.restore()
        else:
            c.drawPicture(cloud_pic(L, depth, seed))
        c.restore()


def mist_band(c, y, h, a, t, seed):
    yy = y + 10 * math.sin(t * 0.3 + seed)
    g = skia.GradientShader.MakeLinear([skia.Point(0, yy - h / 2), skia.Point(0, yy + h / 2)],
                                       [col4((0, 0, 0), 0), col4((0, 0, 0), a), col4((0, 0, 0), 0)], [0, 0.5, 1])
    _paper_masked(c, g, skia.Rect.MakeLTRB(0, yy - h / 2, W, yy + h / 2))


# ------------------------------------------------------------------ the climber
X0, X_TOP = 900, 1500
STEPS = hit_times("step") + hit_times("top")
STEP_X = [X0 + (k + 1) * (X_TOP - X0) / len(STEPS) for k in range(len(STEPS))]


def climber_x(t):
    x = X0
    for k, h in enumerate(STEPS):
        if t >= h:
            prev = X0 if k == 0 else STEP_X[k - 1]
            x = lerp(prev, STEP_X[k], ease_out(clamp((t - h) / 0.16), 2))
    return x


_fig_pics = {}


def figure(c, x, y, s, lamp=1.0, arm=0.0, a=1.0):
    """Cached figure_xieyi: drawn at scale 1 once per pose, placed with a transform.  Returns the lantern."""
    key = (round(arm * 12), lamp > 0, round(a, 1))
    if key not in _fig_pics:
        rec = skia.PictureRecorder()
        cc = rec.beginRecording(skia.Rect.MakeLTRB(-200, -300, 200, 100))
        figure_xieyi(cc, 0, 0, 1.0, 1.0 if lamp > 0 else 0.0, key[0] / 12, a=a)
        _fig_pics[key] = rec.finishRecordingAsPicture()
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    c.drawPicture(_fig_pics[key])
    c.restore()
    arm = key[0] / 12
    return x + lerp(34, 30, arm) * s, y - lerp(96, 170, arm) * s + 20 * s


def figure_xieyi(c, x, y, s, lamp=1.0, arm=0.0, seed=1, a=1.0):
    """One pale robe mass and two loaded strokes, burnt-ink head, a bamboo hat; the lantern on a short pole.
    Returns the lantern position."""
    if a <= 0.003:
        return x, y
    mass(c, [(x - 26 * s, y), (x - 14 * s, y - 64 * s), (x + 2 * s, y - 92 * s), (x + 16 * s, y - 64 * s),
             (x + 24 * s, y)], "dan", seed, fade_down=False, blur=4 * s, a=a)
    brush(c, [(x + 2 * s, y - 92 * s), (x - 6 * s, y - 50 * s), (x - 14 * s, y)], 9 * s, "nong", 0.3, 10, seed)
    brush(c, [(x + 4 * s, y - 88 * s), (x + 12 * s, y - 46 * s), (x + 10 * s, y - 2 * s)], 6 * s, "zhong", 0.5,
          8, seed + 1)
    c.drawCircle(x + 3 * s, y - 102 * s, 8 * s, ink_paint(TONE["jiao"] * a))
    brush(c, [(x - 30 * s, y - 102 * s), (x + 3 * s, y - 116 * s), (x + 36 * s, y - 102 * s)], 5 * s, "jiao",
          0.2, 8, seed + 3, taper=(0.05, 0.05))
    ex, ey = x + lerp(34, 30, arm) * s, y - lerp(96, 170, arm) * s
    brush(c, [(x + 8 * s, y - 70 * s), (ex, ey)], 3 * s, "jiao", 0.1, 4, seed + 2)
    c.drawLine(ex, ey, ex, ey + 12 * s, ink_paint(TONE["nong"], stroke=1.2 * s))
    if lamp > 0:
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(ex - 6 * s, ey + 12 * s, 12 * s, 16 * s), 3 * s, 3 * s),
                    skia.Paint(AntiAlias=True, Color4f=col4(RED, 0.95 * lamp)))
    return ex, ey + 20 * s


def ink_text(c, s, x, y, size, a=1.0, bold=False, align="left", tone=0.85):
    f = serif(size, bold)
    w = f.measureText(s)
    xx = x - w / 2 if align == "center" else (x - w if align == "right" else x)
    c.drawString(s, xx, y, f, ink_paint(tone * a))
    return w


def vertical(c, s, x, y, size, a=1.0, gap=1.08, bold=False, tone=0.85):
    for i, ch in enumerate(s):
        ink_text(c, ch, x, y + i * size * gap, size, a, bold, "center", tone)


def number(c, s, x, y, size, u, a=1.0):
    """An ink number that blooms in: blurred and wide, then sharp."""
    if u <= 0:
        return
    f = serif(size, True)
    w = f.measureText(s)
    p = ink_paint(0.9 * a * min(1, u * 1.5), blur=(1 - u) * 10)
    c.drawString(s, x - w / 2, y, f, p)


# ------------------------------------------------------------------ shots
@shot(0, B(8), tin=0.0, tout=0.0, kin="cut", kout="cut")
def night(c, x, t, lt):
    t = frozen(t)
    lamp = pop("lamp", t, 0.25)
    cx = climber_x(t)
    pull = ease_io(clamp((t - B(7)) / (2 * BEAT)))
    cam = Cam(lerp(cx, 2300, pull), lerp(height(cx) + 60, 520, pull), lerp(1.15, 0.38, pull),
              lerp(760, 960, pull), lerp(640, 760, pull))
    sx, sy = cam.p(cx, height(cx))
    st = min(since("step", t), since("top", t), since("probe", t))
    bob = 6 * math.exp(-st / 0.08) if st < 1 else 0.0
    arm = ease_io(clamp((t - B(6)) / 0.35)) * (1 - ease_io(clamp((t - t_of(6, 3.5)) / 0.3)))
    bolt = since("bolt", t)
    rev = math.exp(-bolt / 0.22) * (1 if bolt < 0.06 or 0.12 < bolt else 0.35) if bolt < 2 else 0.0
    draw_world(c, cam)
    # the flag on the top (ink pole, ink pennant)
    fu = pop("flag", t, 0.2)
    if fu > 0:
        fx = sx + 46 * cam.z / 1.15
        brush(c, [(fx, sy + 4), (fx, sy - 150 * fu * cam.z / 1.15)], 4, "jiao", 0.2, 5, 90, taper=(0.05, 0.1))
        top = sy - 150 * fu * cam.z / 1.15
        flap = [(fx + 70 * v * fu, top + 6 * math.sin(t * 6 - v * 4) * v + 20 * v) for v in np.linspace(0, 1, 12)]
        mass(c, [(fx, top)] + flap + [(fx, top + 40)], "nong", 91, fade_down=False, blur=2)
        x.zoom = max(x.zoom, 1 + 0.025 * math.exp(-since("flag", t) / 0.12))
    lx, ly = figure(c, sx, sy - bob + 2, 1.25 * lerp(1, 0.55, pull), lamp, arm)
    r = (340 + 25 * math.sin(t * 2.3)) * lamp * lerp(1, 0.5, pull)
    fog(c, lx, ly, r, 1 - rev)
    # clouds drift over the fog in layers; the lightning shows them dark for an instant
    clouds(c, t, cam.cx, 1.0)
    mist_band(c, 1000, 220, 1.0, t, 2)
    # the figure and the lantern stay on top of the fog
    if lamp > 0:
        c.save()
        c.clipRect(skia.Rect.MakeXYWH(lx - 120, ly - 220, 240, 340))
        figure(c, sx, sy - bob + 2, 1.25 * lerp(1, 0.55, pull), lamp, arm, a=0.9)
        c.restore()
    # probes: one dry stroke down-slope, answered 「低」
    for i in range(6):
        s = since_nth("probe", i, t)
        if 0 <= s < BEAT * 0.95:
            d = -1 if i % 2 == 0 else 1
            gx, gy = cam.p(cx + d * 80, height(cx + d * 80))
            u = ease_out(clamp(s / 0.12), 3)
            fade = 1 - clamp((s - BEAT * 0.6) / (BEAT * 0.35))
            brush(c, [(sx + d * 10, sy - 4), (lerp(sx, gx, u), lerp(sy, gy + 8, u))], 5, "zhong", 0.7, 6, 70 + i,
                  taper=(0.05, 0.5))
            ink_text(c, "低", gx + d * 30, gy - 24, 40, fade * u, align="center")
    # ripples: the lantern raised, open ink rings run out into the fog
    for i in range(4):
        s = since_nth("ping", i, t)
        if 0 <= s < 1.8:
            u = s / 1.8
            R = 60 + 640 * ease_out(u, 2)
            ring = [(lx + math.cos(a_) * R, ly + math.sin(a_) * R * 0.92) for a_ in np.linspace(0, 6.28, 90)]
            brush(c, ring, 3 + 3 * (1 - u), "zhong" if u < 0.4 else "dan", 0.6 + 0.4 * u, 8, 500 + i,
                  taper=(0.05, 0.05))
    # the lightning: one flying-white stroke down the sky
    if 0 <= bolt < 0.5:
        u = ease_out(clamp(bolt / 0.06), 2)
        pts = [(1380, -40), (1330, 120), (1420, 210), (1340, 360), (1430, 470), (1380, 600)]
        brush(c, pts, 16, "jiao", 0.45, 22, 77, u=u, taper=(0.05, 0.5))
        brush(c, [(1340, 360), (1280, 430), (1300, 500)], 7, "nong", 0.6, 10, 78, u=u, taper=(0.05, 0.6))
        x.flash = max(x.flash, 0.35 * math.exp(-bolt / 0.06))
    # notes in the empty paper
    ink_text(c, "夜 · 雾", 140, 130, 34, pop("tag", t, 0.3) * (1 - pull), tone=0.6)
    if B(1) <= t < B(3):
        vertical(c, "哪边高往哪边走", 1790, 140, 34, smooth((t - B(1)) / 0.4), tone=0.7)
    n = count("step", t) + count("top", t)
    if n and t < B(7):
        h = int(round(height(cx)))
        if t < t_of(5, 2):
            u = pop("step", t, 0.14) if t < B(3) else 1.0
            number(c, f"{h}", 1480, 590, 110, u)
            ink_text(c, "海拔 · 米", 1480, 650, 26, 0.8, align="center", tone=0.55)
        else:
            au = pop("alt", t, 0.25)
            number(c, f"{h}", 1480, 590, 170, au)
            ink_text(c, "最高点", 1480, 400, 36, au, align="center", tone=0.75)
        if count("probe", t) >= 2 and t < B(5):
            ink_text(c, "四周都更低", 1480, 720, 32, smooth((t - t_of(3, 2)) / 0.3), align="center", tone=0.7)
    if t >= t_of(7, 3):
        x.dim = 0.35


@shot(B(8), B(10), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt):
    cam = Cam(2300, 0, 0.42, 960, 1040)
    draw_world(c, cam)
    sx, sy = cam.p(X_TOP, height(X_TOP))
    figure(c, sx, sy + 1, 0.42, 1.0)
    clouds(c, t + 40, 2300, 1.0)
    mist_band(c, 760, 160, 0.95, t, 1)
    mist_band(c, 1000, 160, 1.0, t, 3)
    hx, hy = cam.p(3300, height(3300))
    ink_text(c, "更高的山", hx - 160, hy + 20, 26, smooth((t - t_of(8, 3)) / 0.4), tone=0.6)
    ink_text(c, "他停下的地方", sx, sy - 90, 24, smooth((t - t_of(9, 0)) / 0.4), align="center", tone=0.6)
    # the title, one character per sixteenth, blooming in down a column; the seal on the concept beat
    size = 120
    for i, ch in enumerate(TITLE):
        s = since_nth("char", i, t)
        if s < 0:
            continue
        u = ease_out(clamp(s / 0.22), 3)
        f = serif(size, True)
        c.drawString(ch, 1720 - f.measureText(ch) / 2, 190 + i * size * 1.08, f,
                     ink_paint(0.92 * min(1, u * 1.4), blur=(1 - u) * 14))
    su = pop("concept", t, 0.14)
    if su > 0:
        c.save()
        c.translate(1720, 760)
        sc = 1.5 - 0.5 * su
        c.scale(sc, sc)
        seal(c, 0, 0, 44, CONCEPT, serif(40, True))
        c.restore()
    s0 = since("title", t)
    x.zoom = 1 + 0.04 * math.exp(-s0 / 0.25) + 0.008 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ the page
CAPS = captions() + [(t_of(8, 2.5), B(10) - 0.3, TITLE_Q, "top", 38, 0.0)]


def inscription(c, t):
    """Captions are inscriptions: ink, no box, a small vermilion square at the start, in the empty paper."""
    for t0, t1, text, pos, size, *_ in CAPS:
        if not t0 <= t < t1 + 0.4:
            continue
        a = smooth((t - t0) / 0.25) * (1 - smooth((t - t1) / 0.4))
        plain = "".join(ch for ch, _ in parse_marks(text))
        x0, y0 = (160, 140) if pos == "top" else (220, 990)
        f = serif(size)
        c.drawRect(skia.Rect.MakeXYWH(x0 - size * 0.75, y0 - size * 0.62, size * 0.3, size * 0.3),
                   skia.Paint(AntiAlias=True, Color4f=col4(RED, 0.9 * a)))
        c.drawString(plain, x0, y0, f, ink_paint(0.85 * a, blur=(1 - a) * 3))


def setup():
    paper_image(W, H)


def frame(fi):
    t = fi / tl.fps
    surf = skia.Surface(W, H)
    c = surf.getCanvas()
    c.drawImage(paper_image(W, H), 0, 0)
    x = Ctx(t)
    pic = tl.record(x, t)
    c.save()
    z = x.zoom * (1 + 0.003 * math.sin(t * 0.21))
    c.translate(W / 2, H / 2)
    c.scale(z, z)
    c.translate(-W / 2, -H / 2)
    c.drawPicture(pic)
    c.restore()
    if x.dim > 0.003:                      # a thin ink wash over the page
        c.drawPaint(ink_paint(x.dim))
    inscription(c, t)
    if x.flash > 0.01:
        c.drawPaint(skia.Paint(Color4f=col4((1, 1, 1), min(1, x.flash))))
    fade = smooth(t / 0.05) * smooth((tl.dur - t) / 1.2)
    if fade < 0.999:
        c.drawPaint(skia.Paint(Color4f=col4(PAPER, 1 - fade)))
    return post.finish(post.to_array(surf).astype(np.int16)).astype(np.uint8).tobytes()


if __name__ == "__main__":
    run(frame, setup, tl.dur, tl.fps, OUT, f"{TITLE}_水墨试片.mp4")
