"""第一座山（局部最优 · Local optimum） — 一帧一理 episode 4, in ink wash (水墨): 64 bars at 100 BPM, 153.6 s.

  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 1 4 13 20 25 30 ...        # stills to out/stills/
  python3 render.py                                    # 1920x1080 @ 60 fps

The page is warm rice paper; the range (five hills, the true summit at x=3300) is painted once in world space
(skia Pictures) and drawn through a camera.  Fog is blank paper laid back over the ink, with a hole where the
lantern reaches; clouds drift over it in a few depths.  One vermilion only: the lantern (and the seals).
The climber is a xieyi figure with a pose (stride, lean, look, arm) that steps on twos and lands on the hits.
Every timed change reads cues.HITS through `since()` / `pop()` / `count()`, so picture and score agree.
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


def window(name, lo, hi):
    return [h for h in hit_times(name) if B(lo) - 1e-6 <= h < B(hi) - 1e-6]


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
    """The landscape: hills at x=250, 1500 (the first hill), 4690 and 5700; the real summit at x=3300."""
    return (80 + 260 * math.exp(-((x - 250) / 260) ** 2) + 520 * math.exp(-((x - 1500) / 420) ** 2)
            + 1150 * math.exp(-((x - 3300) / 650) ** 2) + 480 * math.exp(-((x - 4700) / 330) ** 2)
            + 760 * math.exp(-((x - 5700) / 420) ** 2))


def rough(x):
    """What the brush draws: the same range with crags; the two summits stay true summits."""
    env = (0.25 + 0.75 * min(1, height(x) / 600)) * (1 - math.exp(-((x - 1500) / 160) ** 2)) \
        * (1 - 0.8 * math.exp(-((x - 3300) / 200) ** 2))
    for px in PEAKS_X:
        env *= 1 - 0.85 * math.exp(-((x - px) / 120) ** 2)
    return height(x) + env * (34 * math.sin(x / 61 + 1.3) + 22 * math.sin(x / 23 + 0.4) + 12 * math.sin(x / 9.7))


PEAKS_X = (250, 4690, 5700)


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
           np.linspace(-1600, 8000, 120)]
    mass(c, far + [(8000, 300), (-1600, 300)], "qing", 1, h=420, blur=14, a=1.5)


def paint_west(c):
    mass(c, ridge(-900, 700, 70) + [(700, 300), (-900, 300)], "dan", 11, h=300, blur=10, a=1.2)
    brush(c, ridge(-700, 650, 70), 12, "nong", 0.5, 24, 12, loaded=0.8, taper=(0.3, 0.3), wet=0.4)
    moss(c, [wpt(x) for x in (120, 260, 380)], 13, size=6)


def paint_east(c):
    mass(c, ridge(4400, 7000, 110) + [(7000, 300), (4400, 300)], "dan", 21, h=600, blur=10, a=1.3)
    brush(c, ridge(4420, 5200, 70), 14, "nong", 0.45, 26, 22, loaded=0.8, taper=(0.3, 0.2), wet=0.4)
    brush(c, ridge(5200, 6900, 90), 15, "nong", 0.5, 26, 23, loaded=0.75, taper=(0.2, 0.4), wet=0.4)
    for j in range(6):
        brush(c, ridge(5450 + j * 20, 5680 - j * 12, 24, dy=30 + j * 26, dx=-8 * j), 7, "zhong", 0.75, 6, 60 + j,
              loaded=0.25)
    moss(c, [wpt(x) for x in (4600, 4760, 5600, 5760)], 24, size=6)


PIC_NEAR, PIC_SUMMIT, PIC_FAR = record(paint_near), record(paint_summit), record(paint_far)
PIC_WEST, PIC_EAST = record(paint_west), record(paint_east)


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
    c.drawPicture(PIC_EAST)
    c.drawPicture(PIC_SUMMIT)
    c.drawPicture(PIC_WEST)
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
    c.saveLayer()
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
    # the underside dissolves: the cloud's own ink is erased toward the bottom (never a paper patch)
    sh = skia.GradientShader.MakeLinear([skia.Point(0, -th * 0.35), skia.Point(0, th * 0.3)],
                                        [col4((0, 0, 0), 0), col4((0, 0, 0), 1)])
    c.drawRect(skia.Rect.MakeLTRB(-th * 2, -th * 0.35, L + th * 2, th * 1.6),
               skia.Paint(Shader=sh, BlendMode=skia.BlendMode.kDstOut))
    c.restore()


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
def path_x(t, times, xs, x0, dur=0.16):
    """Position after a list of step times: eases from the last spot to the next on each hit."""
    x = x0
    for k, h in enumerate(times):
        if t >= h:
            prev = x0 if k == 0 else xs[k - 1]
            x = lerp(prev, xs[k], ease_out(clamp((t - h) / dur), 2))
    return x


def jump_y(t, times, amp=40.0, dur=0.22):
    """Height of a hop that starts on each hit (a parabola over `dur`)."""
    ts = [h for h in times if h <= t]
    if not ts:
        return 0.0
    u = (t - ts[-1]) / dur
    return amp * 4 * u * (1 - u) if 0 <= u < 1 else 0.0


def twos(s):
    """Time since a hit, stepped at 12 fps (figures move on twos) but still zero on the hit frame."""
    return math.floor(s * 12 + 1e-6) / 12


def walk(t, times, dur=0.18, lean=0.25):
    """Stride and body lift for a figure stepping on each of `times`: legs swap on the hit, settle after."""
    ts = [h for h in times if h <= t + 1e-6]
    if not ts:
        return dict(stride=0.2, lift=0.0, lean=0.0)
    k = len(ts)
    s = twos(t - ts[-1])
    u = ease_io(clamp(s / dur))
    side = 0.85 if k % 2 else -0.85
    stride = lerp(-side, side, u) * lerp(1, 0.45, clamp((s - 0.45) / 0.3))
    lift = 7 * math.sin(math.pi * clamp(s / dur))
    return dict(stride=stride, lift=lift, lean=lean * (1 - clamp((s - 0.6) / 0.5)))


def breathe(t):
    return 1.2 * math.sin(math.floor(t * 12) / 12 * 2.4)


_fig_pics = {}


def figure(c, x, y, s, lamp=1.0, arm=0.0, a=1.0, stride=0.2, lean=0.0, look=0, flag=False, face=1):
    """Cached figure_xieyi: one Picture per quantized pose, placed with a transform.  Returns the lantern."""
    key = (round(arm * 12), lamp > 0, round(a, 1), round(stride * 4), round(lean * 4), int(look), flag)
    if key not in _fig_pics:
        rec = skia.PictureRecorder()
        cc = rec.beginRecording(skia.Rect.MakeLTRB(-200, -300, 200, 100))
        figure_xieyi(cc, 0, 0, 1.0, 1.0 if lamp > 0 else 0.0, key[0] / 12, a=a, stride=key[3] / 4, lean=key[4] / 4,
                     look=look, flag=flag)
        _fig_pics[key] = rec.finishRecordingAsPicture()
    c.save()
    c.translate(x, y)
    c.scale(s * face, s)
    c.drawPicture(_fig_pics[key])
    c.restore()
    arm = key[0] / 12
    lx = (lerp(34, 30, arm) + key[4] / 4 * 10) * s
    return x + lx * face, y - lerp(96, 170, arm) * s + 20 * s


def figure_xieyi(c, x, y, s, lamp=1.0, arm=0.0, seed=1, a=1.0, stride=0.2, lean=0.0, look=0, flag=False):
    """One pale robe mass and two loaded strokes, burnt-ink legs that stride, a head that turns under a bamboo hat;
    the lantern on a short pole (or a flag pole carried on the shoulder).  Returns the lantern position."""
    if a <= 0.003:
        return x, y
    L = lean * 14 * s
    hipx, hipy = x + L * 0.3, y - 34 * s
    for sgn, tone in ((-1, "nong"), (1, "jiao")):                    # back leg first
        fx = x + sgn * stride * 15 * s
        kx, ky = (hipx + fx) / 2 + 4 * s, y - 17 * s - abs(stride) * 2 * s
        brush(c, [(hipx, hipy), (kx, ky), (fx, y - 1 * s)], 3.4 * s, tone, 0.15, 5, seed + 10 + sgn,
              taper=(0.05, 0.1))
        brush(c, [(fx - 2 * s, y), (fx + 7 * s, y)], 3 * s, "jiao", 0.1, 4, seed + 14 + sgn, taper=(0.05, 0.3))
    tx = x + 2 * s + L
    mass(c, [(x - 24 * s + L * 0.3, y - 26 * s), (x - 14 * s + L * 0.7, y - 64 * s), (tx, y - 92 * s),
             (x + 16 * s + L * 0.7, y - 64 * s), (x + 22 * s + L * 0.3, y - 26 * s)], "dan", seed, fade_down=False,
         blur=4 * s, a=a)
    brush(c, [(tx, y - 92 * s), (x - 6 * s + L * 0.6, y - 52 * s), (x - 14 * s + L * 0.3, y - 26 * s)], 9 * s,
          "nong", 0.3, 10, seed)
    brush(c, [(tx + 2 * s, y - 88 * s), (x + 12 * s + L * 0.6, y - 46 * s), (x + 12 * s + L * 0.3, y - 28 * s)],
          6 * s, "zhong", 0.5, 8, seed + 1)
    hx, hy = tx + 1 * s + look * 3 * s, y - 102 * s
    c.drawCircle(hx, hy, 8 * s, ink_paint(TONE["jiao"] * a))
    tilt = look * 4 * s
    brush(c, [(hx - 33 * s, hy + tilt), (hx, hy - 14 * s), (hx + 33 * s, hy - tilt)], 5 * s, "jiao", 0.2, 8,
          seed + 3, taper=(0.05, 0.05))
    if flag:                                                         # the flag carried on the shoulder
        brush(c, [(tx - 26 * s, y - 20 * s), (tx + 30 * s, y - 150 * s)], 3 * s, "jiao", 0.2, 5, seed + 5,
              taper=(0.05, 0.1))
        mass(c, [(tx + 30 * s, y - 150 * s), (tx + 78 * s, y - 132 * s), (tx + 22 * s, y - 118 * s)], "nong",
             seed + 6, fade_down=False, blur=2 * s)
    ex, ey = x + (lerp(34, 30, arm) + lean * 10) * s, y - lerp(96, 170, arm) * s
    brush(c, [(tx + 6 * s, y - 70 * s), (ex, ey)], 3 * s, "jiao", 0.1, 4, seed + 2)
    c.drawLine(ex, ey, ex, ey + 12 * s, ink_paint(TONE["nong"], stroke=1.2 * s))
    if lamp > 0:
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(ex - 6 * s, ey + 12 * s, 12 * s, 16 * s), 3 * s, 3 * s),
                    skia.Paint(AntiAlias=True, Color4f=col4(RED, 0.95 * lamp)))
    return ex, ey + 20 * s


def flag_on(c, x, y, s, t, u=1.0, tone="nong", a=1.0, text=None):
    """An ink pole and a pennant planted at (x, y); u grows it in."""
    if u <= 0:
        return
    top = y - 150 * s * u
    brush(c, [(x, y + 4 * s), (x, top)], max(1.5, 4 * s), "jiao" if tone == "nong" else tone, 0.2, 5, 90,
          taper=(0.05, 0.1))
    flap = [(x + 70 * s * v * u, top + 6 * s * math.sin(t * 6 - v * 4) * v + 20 * s * v) for v in np.linspace(0, 1, 12)]
    mass(c, [(x, top)] + flap + [(x, top + 40 * s)], tone, 91, fade_down=False, blur=2 * s, a=a)
    if text:
        vertical(c, text, x + 75 * s + 28, top + 30, 30, a * u, tone=0.85)


def ink_text(c, s, x, y, size, a=1.0, bold=False, align="left", tone=0.85):
    if a <= 0.003:
        return 0
    f = serif(size, bold)
    w = f.measureText(s)
    xx = x - w / 2 if align == "center" else (x - w if align == "right" else x)
    c.drawString(s, xx, y, f, ink_paint(tone * a))
    return w


def vertical(c, s, x, y, size, a=1.0, gap=1.08, bold=False, tone=0.85):
    for i, ch in enumerate(s):
        ink_text(c, ch, x, y + i * size * gap, size, a, bold, "center", tone)


def number(c, s, x, y, size, u, a=1.0, bold=True):
    """An ink number (or word) that blooms in: blurred, then sharp.  Centred on x."""
    if u <= 0 or a <= 0.003:
        return
    f = serif(size, bold)
    w = f.measureText(s)
    c.drawString(s, x - w / 2, y, f, ink_paint(0.9 * a * min(1, u * 1.5), blur=(1 - u) * 10))


def bloom_chars(c, text, name, t, x, y, size, lo, gap=1.06, vertical_=False, a=1.0):
    """Characters blooming in one per hit of `name` (from bar lo), centred on x as a line (or down a column)."""
    f = serif(size, True)
    ws = [f.measureText(ch) for ch in text]
    total = sum(ws) + (len(text) - 1) * size * (gap - 1)
    cx = x - total / 2
    for i, ch in enumerate(text):
        s = since_nth(name, i, t, lo)
        if s >= 0:
            u = ease_out(clamp(s / 0.22), 3)
            px, py = (x - ws[i] / 2, y + i * size * gap) if vertical_ else (cx, y)
            c.drawString(ch, px, py, f, ink_paint(0.92 * a * min(1, u * 1.4), blur=(1 - u) * 14))
        cx += ws[i] + size * (gap - 1)


def enso(c, x, y, r, u, seed=0, width=10, tone="nong"):
    """A brushed circle, painted in from the top."""
    if u <= 0:
        return
    pts = [(x + math.cos(a_) * r, y + math.sin(a_) * r * 0.94) for a_ in np.linspace(-1.9, -1.9 + 6.0, 80)]
    brush(c, pts, width, tone, 0.55, 18, 700 + seed, u=u, loaded=0.7, taper=(0.05, 0.5))


def ripple(c, x, y, s, seed, max_r=640):
    if 0 <= s < 1.8:
        u = s / 1.8
        R = 40 + max_r * ease_out(u, 2)
        ring = [(x + math.cos(a_) * R, y + math.sin(a_) * R * 0.92) for a_ in np.linspace(0, 6.28, 90)]
        brush(c, ring, 3 + 3 * (1 - u), "zhong" if u < 0.4 else "dan", 0.6 + 0.4 * u, 8, 500 + seed,
              taper=(0.05, 0.05))


def probe(c, sx, sy, gx, gy, s, seed, word="低", sub=None, size=40):
    """A dry stroke down-slope from the feet, answered by a word at its end."""
    if not 0 <= s < BEAT * 0.95:
        return
    d = 1 if gx >= sx else -1
    u = ease_out(clamp(s / 0.12), 3)
    fade = 1 - clamp((s - BEAT * 0.6) / (BEAT * 0.35))
    brush(c, [(sx + d * 10, sy - 4), (lerp(sx, gx, u), lerp(sy, gy, u))], 5, "zhong", 0.7, 6, 70 + seed,
          taper=(0.05, 0.5))
    if sub:
        ink_text(c, sub, gx + d * 30, gy - 30 - size, size * 0.7, fade * u, align="center", tone=0.7)
    ink_text(c, word, gx + d * 30, gy - 24, size, fade * u, align="center")


def lightning(c, x, bolt, x_=None, scale=1.0):
    """One flying-white stroke down the sky."""
    if 0 <= bolt < 0.5:
        u = ease_out(clamp(bolt / 0.06), 2)
        pts = [(x + px * scale, py * scale - 40) for px, py in
               ((0, 0), (-50, 160), (40, 250), (-40, 400), (50, 510), (0, 640))]
        brush(c, pts, 16 * scale, "jiao", 0.45, 22, 77, u=u, taper=(0.05, 0.5))
        brush(c, [pts[3], (pts[3][0] - 60 * scale, pts[3][1] + 70 * scale), (pts[3][0] - 40 * scale,
                                                                             pts[3][1] + 140 * scale)],
              7 * scale, "nong", 0.6, 10, 78, u=u, taper=(0.05, 0.6))


def thermometer(c, x, y0, y1, T, a=1.0):
    """An ink thermometer: a brushed tube, ink filling it to T (0 cold .. 1 hot)."""
    if a <= 0.003:
        return
    y0, y1 = y0 - 150, y1 - 150
    brush(c, [(x - 18, y1), (x - 18, y0)], 4, "nong", 0.35, 8, 801, taper=(0.05, 0.05))
    brush(c, [(x + 18, y1), (x + 18, y0)], 4, "nong", 0.35, 8, 802, taper=(0.05, 0.05))
    c.drawCircle(x, y1 + 26, 30, ink_paint(TONE["nong"] * a))
    top = lerp(y1, y0 + 10, clamp(T))
    c.drawRect(skia.Rect.MakeLTRB(x - 10, top, x + 10, y1 + 4), ink_paint(TONE["zhong"] * a, blur=2))
    ink_text(c, "热", x + 46, y0 + 30, 30, a, tone=0.7)
    ink_text(c, "冷", x + 46, y1 + 10, 30, a, tone=0.5)


def alt_note(c, x, t, cx, u=1.0, big=False, label="海拔 · 米", y=590):
    h = int(round(height(cx)))
    number(c, f"{h}", x, y, 170 if big else 110, u)
    ink_text(c, label, x, y + (60 if not big else 70), 26, 0.8 * min(1, u * 1.5), align="center", tone=0.55)


# ------------------------------------------------------------------ 0-8: the cold open
X0, X_TOP = 900, 1500
STEPS = window("step", 0, 8) + window("top", 0, 8)
STEP_X = [X0 + (k + 1) * (X_TOP - X0) / len(STEPS) for k in range(len(STEPS))]


def climber_x(t):
    return path_x(t, STEPS, STEP_X, X0)


def night_pose(t):
    p = walk(t, STEPS)
    pr = [h for h in window("probe", 3, 5) if h <= t]
    look = 0
    if pr and t - pr[-1] < BEAT * 0.9:
        look = -1 if len(pr) % 2 == 1 else 1
    return p, look


@shot(0, B(8), tin=0.0, tout=0.0, kin="cut", kout="cut")
def night(c, x, t, lt):
    t = frozen(t)
    lamp = pop("lamp", t, 0.25)
    cx = climber_x(t)
    pull = ease_io(clamp((t - B(7)) / (2 * BEAT)))
    cam = Cam(lerp(cx, 2300, pull), lerp(height(cx) + 60, 520, pull), lerp(1.15, 0.38, pull),
              lerp(760, 960, pull), lerp(640, 760, pull))
    sx, sy = cam.p(cx, height(cx))
    pose, look = night_pose(t)
    arm = ease_io(clamp((t - B(6)) / 0.35)) * (1 - ease_io(clamp((t - t_of(6, 3.5)) / 0.3)))
    bolt = since("bolt", t)
    rev = math.exp(-bolt / 0.22) * (1 if bolt < 0.06 or 0.12 < bolt else 0.35) if bolt < 2 else 0.0
    draw_world(c, cam)
    fu = pop("flag", t, 0.2)
    if fu > 0:
        flag_on(c, sx + 46 * cam.z / 1.15, sy, cam.z / 1.15, t, fu)
        x.zoom = max(x.zoom, 1 + 0.025 * math.exp(-since("flag", t) / 0.12))
    fs = 1.25 * lerp(1, 0.55, pull)
    fy = sy - pose["lift"] + 2 + breathe(t)
    kw = dict(stride=pose["stride"], lean=pose["lean"], look=look)
    lx, ly = figure(c, sx, fy, fs, lamp, arm, **kw)
    r = (340 + 25 * math.sin(t * 2.3)) * lamp * lerp(1, 0.5, pull)
    fog(c, lx, ly, r, 1 - rev)
    clouds(c, t, cam.cx, 1.0)
    mist_band(c, 1000, 220, 1.0, t, 2)
    if lamp > 0:
        c.save()
        c.clipRect(skia.Rect.MakeXYWH(lx - 120, ly - 220, 240, 340))
        figure(c, sx, fy, fs, lamp, arm, a=0.9, **kw)
        c.restore()
    for i, h in enumerate(window("probe", 3, 5)):
        d = -1 if i % 2 == 0 else 1
        gx, gy = cam.p(cx + d * 80, height(cx + d * 80))
        probe(c, sx, sy, gx, gy + 8, t - h, i)
    c.save()
    c.clipRect(skia.Rect.MakeLTRB(0, 0, W, 860))
    for i, h in enumerate(window("ping", 6, 7)):
        ripple(c, lx, ly, t - h, i)
    c.restore()
    lightning(c, 1380, bolt)
    if 0 <= bolt < 0.5:
        x.flash = max(x.flash, 0.35 * math.exp(-bolt / 0.06))
    ink_text(c, "夜 · 雾", 140, 130, 34, pop("tag", t, 0.3) * (1 - pull), tone=0.6)
    if B(1) <= t < B(3):
        vertical(c, "哪边高往哪边走", 1700, 170, 34, smooth((t - B(1)) / 0.4), tone=0.7)
    n = len([h for h in STEPS if h <= t])
    if n and t < B(7):
        if t < t_of(5, 2):
            alt_note(c, 1480, t, cx, pop("step", t, 0.14) if t < B(3) else 1.0)
        else:
            au = pop("alt", t, 0.25)
            alt_note(c, 1480, t, cx, au, big=True)
            ink_text(c, "最高点", 1480, 400, 36, au, align="center", tone=0.75)
        if count("probe", t) >= 2 and t < B(5):
            ink_text(c, "四周都更低", 1480, 720, 32, smooth((t - t_of(3, 2)) / 0.3), align="center", tone=0.7)
    if t >= t_of(7, 3):
        x.dim = 0.35


# ------------------------------------------------------------------ 8-10: the title
@shot(B(8), B(10), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt):
    cam = Cam(2300, 0, 0.42, 960, 1040)
    draw_world(c, cam)
    sx, sy = cam.p(X_TOP, height(X_TOP))
    flag_on(c, sx + 18, sy, 0.42, t)
    figure(c, sx, sy + 1, 0.42, 1.0, stride=0.2)
    clouds(c, t + 40, 2300, 1.0)
    mist_band(c, 760, 160, 0.95, t, 1)
    mist_band(c, 1000, 160, 1.0, t, 3)
    hx, hy = cam.p(3300, height(3300))
    ink_text(c, "更高的山", hx, hy - 40, 28, smooth((t - t_of(8, 3)) / 0.4), align="center", tone=0.6)
    ink_text(c, "他停下的地方", sx, sy - 110, 26, smooth((t - t_of(9, 0)) / 0.4), align="center", tone=0.6)
    bloom_chars(c, TITLE, "char", t, 1720, 190, 120, 8, gap=1.08, vertical_=True)
    su = pop("concept", t, 0.14)
    if su > 0:
        c.save()
        c.translate(1720, 760)
        sc = 1.5 - 0.5 * su
        c.scale(sc, sc)
        seal(c, 0, 0, 44, CONCEPT, serif(40, True))
        c.restore()
    x.zoom = 1 + 0.04 * math.exp(-since("title", t) / 0.25) + 0.008 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ 10-16: the rule (爬山法)
RULE_CAM = Cam(2150, 0, 0.55, 960, 960)
HOPS = window("hop", 10, 16)
HOP_X = [1000 + (k + 1) * 500 / len(HOPS) for k in range(len(HOPS))]


@shot(B(10), B(16), tin=0.0, tout=0.0, kin="cut", kout="cut")
def rule(c, x, t, lt):
    t = frozen(t)
    cam = RULE_CAM
    du = ease_io(clamp(since("draw", t, 10) / (BEAT * 1.5)))
    c.save()
    c.clipRect(skia.Rect.MakeLTRB(0, 0, W * du + 1, H))           # the range is painted in, left to right
    draw_world(c, cam)
    c.restore()
    cx = path_x(t, HOPS, HOP_X, 1000)
    sx, sy = cam.p(cx, height(cx))
    pose = walk(t, HOPS, 0.14, 0.3)
    looks = window("look", 10, 16)
    look = 0
    for k, h in enumerate(looks):
        if 0 <= t - h < BEAT * 0.95:
            look = -1 if k == 0 else 1
    pr = window("probe", 13, 15)
    for k, h in enumerate(pr):
        if 0 <= t - h < BEAT * 0.95:
            look = -1 if k % 2 == 0 else 1
    if du > 0.3:
        figure(c, sx, sy - pose["lift"] * 0.6 + breathe(t) * 0.5, 0.8, 1.0, stride=pose["stride"],
               lean=pose["lean"], look=look)
    # the two looks: one dry stroke each way, answered 低 / 高
    for k, h in enumerate(looks):
        d = -1 if k == 0 else 1
        gx, gy = cam.p(cx + d * 110, height(cx + d * 110))
        probe(c, sx, sy, gx, gy - 6, t - h, 30 + k, "低" if d < 0 else "高", size=36)
    for k, h in enumerate(pr):
        d = -1 if k % 2 == 0 else 1
        gx, gy = cam.p(cx + d * 110, height(cx + d * 110))
        probe(c, sx, sy, gx, gy + 6, t - h, 40 + k, size=36)
    st = since("stop", t, 13)
    if st < 1e8:
        enso(c, sx + 4, sy - 34, 70, ease_out(clamp(st / 0.18), 2), 1, 8)
    xs = since("x", t, 14)
    if xs < 1e8:
        number(c, "止", sx + 120, sy - 70, 90, ease_out(clamp(xs / 0.15), 3))
    # the mist hides the right of the range until the reveal
    rv = ease_io(clamp(since("reveal", t, 15) / (BEAT * 1.2))) if since("reveal", t, 15) < 1e8 else 0.0
    edge = lerp(900, 2600, rv)
    g = skia.GradientShader.MakeLinear([skia.Point(edge, 0), skia.Point(edge + 520, 0)],
                                       [col4((0, 0, 0), 0), col4((0, 0, 0), 1)])
    _paper_masked(c, g, None)
    clouds(c, t, 0, 0.5, 0, 300)
    mist_band(c, 1000, 200, 1.0, t, 4)
    hx, hy = cam.p(3300, height(3300))
    ink_text(c, "更高的山", hx, hy - 40, 32, pop("tag", t, 0.3, 15), align="center", tone=0.65)
    bloom_chars(c, "爬山法", "kchar", t, 960, 220, 96, 10, gap=1.12)
    ink_text(c, "HILL CLIMBING", 960, 280, 24, smooth((t - t_of(10, 3)) / 0.4), align="center", tone=0.45)
    if t >= B(13) - 1e-6:
        n = len([h for h in HOPS if h <= t])
        alt_note(c, 300, t, cx, 1.0)
    x.zoom = 1 + 0.02 * math.exp(-min(since("draw", t, 10), since("stop", t, 13), since("reveal", t, 15)) / 0.2)


# ------------------------------------------------------------------ 16-22: six climbers on the whole range
WIDE = Cam(3100, 0, 0.28, 960, 690)
START = [100, 1050, 2000, 2600, 4350, 5200]
PEAK_OF = [250, 1500, 1500, 3300, 4690, 5700]
SHOW_PEAKS = [250, 1500, 3300, 4690, 5700]
WINNER = 3


def six_x(i, t):
    cl = window("climb", 18, 19)
    xs = [lerp(START[i], PEAK_OF[i], (k + 1) / len(cl)) for k in range(len(cl))]
    return path_x(t, cl, xs, START[i], 0.14)


@shot(B(16), B(22), tin=0.0, tout=0.0, kin="cut", kout="cut")
def six(c, x, t, lt):
    t = frozen(t)
    cam = WIDE
    uu = ease_io(clamp(since("unroll", t, 16) / (BEAT * 1.6)))
    c.save()
    c.clipRect(skia.Rect.MakeLTRB(W * (1 - uu), 0, W, H))          # a handscroll unrolled right to left
    draw_world(c, cam)
    c.restore()
    for i, px in enumerate(SHOW_PEAKS):
        s = since_nth("peak", i, t, 16)
        if s >= 0 and not (px == 3300 and since("crown", t, 20) < 1e8):
            gx, gy = cam.p(px, height(px))
            number(c, f"{int(round(height(px)))}", gx, gy - 70, 30, ease_out(clamp(s / 0.2), 3), 0.7, False)
    drops = window("drop", 17, 18)
    flags = window("flag", 19, 20)
    order = sorted(range(6), key=lambda i: START[i])
    crown = since("crown", t, 20)
    fogs = window("fogup", 20, 21)
    losers = [i for i in order if i != WINNER]
    climbs = window("climb", 18, 19)
    pose = walk(t, climbs, 0.14, 0.3)
    for i in range(6):
        ds = t - drops[i]
        if ds < 0:
            continue
        cx = six_x(i, t)
        gx, gy = cam.p(cx, height(cx))
        fall = (1 - ease_out(clamp(ds / 0.2), 2)) * 160
        fk = order.index(i)
        fs = t - flags[fk]
        if fs >= 0:
            flag_on(c, gx + 14, gy, 0.3, t + i, ease_out(clamp(fs / 0.15), 2))
        figure(c, gx, gy - fall - pose["lift"] * 0.4, 0.4, 1.0, stride=pose["stride"] if t < B(19) else 0.2,
               lean=pose["lean"] if t < B(19) else 0.0)
    if crown < 1e8:
        wx, wy = cam.p(3300, height(3300))
        enso(c, wx + 4, wy - 22, 70, ease_out(clamp(crown / 0.2), 2), 2, 7)
        ink_text(c, "最高处 · 1230", wx, wy - 120, 30, ease_out(clamp(crown / 0.2), 2), align="center", tone=0.8)
        x.zoom = max(x.zoom, 1 + 0.03 * math.exp(-crown / 0.15))
    for k, i in enumerate(losers):
        if k < len(fogs) and t >= fogs[k]:
            u = ease_out(clamp((t - fogs[k]) / 0.3), 2)
            gx, gy = cam.p(PEAK_OF[i], height(PEAK_OF[i]))
            g = skia.GradientShader.MakeRadial(skia.Point(gx, gy - 20), 150,
                                               [col4((0, 0, 0), 0), col4((0, 0, 0), 0), col4((0, 0, 0), 0.9 * u),
                                                col4((0, 0, 0), 0)], [0, 0.12, 0.6, 1])
            _paper_masked(c, g, skia.Rect.MakeXYWH(gx - 150, gy - 170, 300, 300))
    for k, h in enumerate(window("ping", 21, 22)):
        for i in losers[:3]:
            gx, gy = cam.p(PEAK_OF[i], height(PEAK_OF[i]))
            ripple(c, gx + 12, gy - 40, t - h - 0.02 * i, 10 + k, 120)
    clouds(c, t + 20, 0, 0.6, 0, 400)
    mist_band(c, 860, 220, 1.0, t, 5)
    if B(17) <= t < B(19):
        ink_text(c, "同一个办法：哪边高，往哪边走", 960, 150, 32, smooth((t - B(17)) / 0.3), align="center", tone=0.6)
    if t >= B(20):
        ink_text(c, "六个人 · 五座山 · 一个最高处", 960, 150, 32, smooth((t - B(20)) / 0.3), align="center", tone=0.6)


# ------------------------------------------------------------------ 22-24: the name
@shot(B(22), B(24), tin=0.0, tout=0.0, kin="cut", kout="cut")
def name(c, x, t, lt):
    cam = WIDE
    draw_world(c, cam)
    fog(c, 0, 0, 0, 0.55)
    for i in range(6):
        gx, gy = cam.p(PEAK_OF[i], height(PEAK_OF[i]))
        flag_on(c, gx + 14, gy, 0.3, t + i)
        figure(c, gx, gy, 0.4, 1.0, a=1.0)
    mist_band(c, 860, 220, 1.0, t, 5)
    second = t >= B(23) - 1e-6
    lo = 23 if second else 22
    word, en = ("全局最优", "GLOBAL OPTIMUM") if second else ("局部最优", "LOCAL OPTIMUM")
    bloom_chars(c, word, "kchar", t, 960, 170, 110, lo, gap=1.1)
    ink_text(c, en, 960, 222, 26, smooth((t - t_of(lo, 2)) / 0.3), align="center", tone=0.45)
    ms = since("mark", t, lo)
    if ms < 1e8 and ms < BAR:
        targets = [3300] if second else [250, 1500, 4690, 5700]
        for k, px in enumerate(targets):
            gx, gy = cam.p(px, height(px))
            u = ease_out(clamp((ms - 0.04 * k) / 0.2), 2)
            enso(c, gx + 4, gy - 22, 54 if not second else 70, u, 20 + k, 6)
    x.zoom = 1 + 0.035 * math.exp(-since("slam", t, 22) / 0.2)


# ------------------------------------------------------------------ 24-32: simulated annealing
JUMPS = window("jump", 26, 28)
JUMP_X = [1440, 1580, 1500, 1650, 1580, 1720, 1680, 1800, 1900, 1850, 2050, 2150, 2100, 2300, 2450, 2600]
COOLS = window("cool", 28, 29)
COOL_X = [2800, 2950, 3100, 3220]
FLAG29 = window("flag", 29, 30)


def anneal_x(t):
    times = JUMPS + COOLS + FLAG29
    return path_x(t, times, JUMP_X + COOL_X + [3300], 1500, 0.2)


def temperature(t):
    T = 0.12
    if t >= B(26):
        T = 1.0 - 0.04 * math.sin(t * 9)
    for k, h in enumerate(COOLS):
        if t >= h:
            T = lerp(0.96 - 0.22 * k, 0.96 - 0.22 * (k + 1), ease_out(clamp((t - h) / 0.2), 2))
    return T


@shot(B(24), B(26), tin=0.0, tout=0.0, kin="cut", kout="cut")
def forge(c, x, t, lt):
    c.save()
    Cam(2300, 0, 0.3, 960, 1180).apply(c, 1.0)
    c.drawPicture(PIC_FAR)
    c.restore()
    if t < B(25):
        number(c, "1983", 960, 470, 220, ease_out(clamp(since("year", t, 24) / 0.25), 3))
        for i, nm in enumerate(("Kirkpatrick", "Gelatt", "Vecchi")):
            s = since_nth("name", i, t, 24)
            if s >= 0:
                ink_text(c, nm, 600 + i * 360, 620, 46, ease_out(clamp(s / 0.2), 2), align="center", tone=0.8)
        ink_text(c, "IBM · Science 220:671", 960, 700, 28, smooth((t - t_of(24, 1)) / 0.4), align="center", tone=0.5)
        x.zoom = 1 + 0.03 * math.exp(-since("year", t, 24) / 0.2)
        return
    # the forge: an anvil, a glowing bar (pale ink), the hammer falls on every beat and ink sparks fly
    ax, ay = 900, 720
    mass(c, [(ax - 220, ay - 110), (ax + 120, ay - 110), (ax + 300, ay - 96), (ax + 120, ay - 66), (ax + 60, ay - 40),
             (ax + 60, ay + 20), (ax + 150, ay + 70), (ax - 230, ay + 70), (ax - 140, ay + 20), (ax - 140, ay - 50),
             (ax - 220, ay - 70)], "zhong", 31, fade_down=False, blur=3)
    brush(c, [(ax - 220, ay - 112), (ax + 120, ay - 112), (ax + 300, ay - 96)], 7, "jiao", 0.3, 12, 36, loaded=0.8)
    brush(c, [(ax - 230, ay + 72), (ax + 150, ay + 72)], 8, "nong", 0.4, 12, 37, taper=(0.1, 0.1))
    brush(c, [(ax - 150, ay - 122), (ax + 110, ay - 122)], 16, "dan", 0.2, 16, 33, wet=0.9)
    hs = since("anvil", t, 25)
    k = count("anvil", t, 25)
    lift = clamp((hs - 0.1) / (BEAT - 0.25)) if hs < 1e8 else 1.0
    px_, py_ = ax + 330, ay - 230                                    # the hand; the head lands on the bar
    ang = math.degrees(math.atan2((ay - 150) - py_, (ax - 10) - px_)) + 55 * ease_io(math.sin(math.pi * lift) ** 0.5
                                                                                   if lift < 1 else 0)
    c.save()
    c.translate(px_, py_)
    c.rotate(ang)
    L_ = math.hypot((ax - 10) - px_, (ay - 150) - py_)
    brush(c, [(0, 0), (L_ - 10, 0)], 9, "jiao", 0.2, 10, 34, taper=(0.05, 0.05))
    mass(c, [(L_ - 22, -50), (L_ + 22, -50), (L_ + 22, 50), (L_ - 22, 50)], "jiao", 35, fade_down=False, blur=1)
    c.restore()
    vertical(c, "退火", 1640, 300, 90, smooth((t - B(25)) / 0.3), bold=True)
    ink_text(c, "烧热，再慢慢冷却", 1640, 560, 28, smooth((t - t_of(25, 1)) / 0.3), align="center", tone=0.6)


@shot(B(26), B(30), tin=0.0, tout=0.0, kin="cut", kout="cut")
def anneal(c, x, t, lt):
    ax_ = anneal_x(t)
    camx = lerp(1700, 2700, smooth((t - B(26)) / (B(30) - B(26))))
    cam = Cam(camx, 700, 0.5, 960, 560)
    draw_world(c, cam)
    fx, fy = cam.p(1500, height(1500))
    flag_on(c, fx + 20, fy, 0.5, t)                                   # the first flag, left behind
    sx, sy = cam.p(ax_, height(ax_))
    hop = jump_y(t, JUMPS, 46, 0.2)
    pose = walk(t, COOLS + FLAG29, 0.18, 0.3) if t >= B(28) else dict(stride=0.6 if hop > 0 else 0.2,
                                                                     lift=0, lean=0.0)
    figure(c, sx, sy - hop - pose["lift"] + breathe(t) * 0.5, 0.8, 1.0, arm=0.4 if hop > 0 else 0.0,
           stride=pose["stride"], lean=pose["lean"])
    for k, h in enumerate(JUMPS):                                    # a downhill jump says so
        s = t - h
        if 0 <= s < BEAT * 0.9:
            prev = 1500 if k == 0 else JUMP_X[k - 1]
            if height(JUMP_X[k]) < height(prev):
                gx, gy = cam.p(JUMP_X[k], height(JUMP_X[k]))
                ink_text(c, "低", gx + 70, gy - 210, 38, 1 - clamp((s - 0.3) / 0.3), align="center", tone=0.7)
    fu = pop("flag", t, 0.2, 29)
    if t >= B(29) - 1e-6 and fu > 0:
        flag_on(c, sx + 40, sy, 0.8, t, fu)
        x.zoom = max(x.zoom, 1 + 0.03 * math.exp(-since("flag", t, 29) / 0.12))
    au = pop("alt", t, 0.25, 29)
    if au > 0:
        number(c, f"{int(round(height(3300)))}", 1680, 300, 150, au)
        ink_text(c, "更高的山", 1680, 360, 30, au, align="center", tone=0.6)
    hu = pop("heat", t, 0.25, 26)
    thermometer(c, 170, 260, 700, temperature(t), smooth((t - B(26)) / 0.25))
    if hu > 0 and t < B(28):
        ink_text(c, "热：允许往下走", 110, 680, 30, hu, tone=0.75)
    if t >= B(28):
        ink_text(c, "冷：只往上走", 110, 680, 30, smooth((t - B(28)) / 0.3), tone=0.75)
    clouds(c, t + 60, camx, 0.7, 0, 500)
    mist_band(c, 960, 220, 1.0, t, 6)


CHIP_HOME = [(r_, c_) for r_ in range(2) for c_ in range(4)]
CITIES = [(1160, 380), (1290, 300), (1450, 330), (1590, 260), (1700, 380), (1640, 520), (1760, 640), (1600, 730),
          (1430, 650), (1300, 720), (1180, 600), (1250, 480)]


@shot(B(30), B(32), tin=0.0, tout=0.0, kin="cut", kout="cut")
def uses(c, x, t, lt):
    # a chip: an ink grid, eight parts snapping into place on the eighths
    gx0, gy0, cell = 260, 300, 100
    for i in range(7):
        brush(c, [(gx0, gy0 + i * cell * 0.75), (gx0 + 600, gy0 + i * cell * 0.75)], 2, "dan", 0.5, 4, 900 + i,
              taper=(0.1, 0.1))
    for i in range(7):
        brush(c, [(gx0 + i * cell, gy0), (gx0 + i * cell, gy0 + 450)], 2, "dan", 0.5, 4, 910 + i, taper=(0.1, 0.1))
    ink_text(c, "芯片布局", gx0 + 300, gy0 - 40, 32, smooth((t - B(30)) / 0.3), align="center", tone=0.7)
    r = np.random.default_rng(4)
    for k, h in enumerate(window("chip", 30, 31)):
        s = t - h
        hx, hy = gx0 + 50 + (1 + CHIP_HOME[k][1]) * cell - cell * 0.5, gy0 + 90 + CHIP_HOME[k][0] * cell * 1.5 + 70
        ox, oy = hx + r.uniform(-300, 300), hy + r.uniform(-260, 260)
        if s < 0:
            mass(c, [(ox - 30, oy - 20), (ox + 30, oy - 20), (ox + 30, oy + 20), (ox - 30, oy + 20)], "qing", 920 + k,
                 fade_down=False, blur=2)
            continue
        u = ease_out(clamp(s / 0.12), 3)
        px, py = lerp(ox, hx, u), lerp(oy, hy, u)
        mass(c, [(px - 34, py - 24), (px + 34, py - 24), (px + 34, py + 24), (px - 34, py + 24)], "nong", 920 + k,
             fade_down=False, blur=1.5)
    # a route: twelve cities joined one per sixteenth
    if t >= B(31) - 1e-6:
        ink_text(c, "最短路线", 1460, 200, 32, smooth((t - B(31)) / 0.3), align="center", tone=0.7)
    rts = window("route", 31, 32)
    for k, (cx_, cy_) in enumerate(CITIES):
        s = t - rts[k]
        if s < 0:
            c.drawCircle(cx_, cy_, 5, ink_paint(TONE["qing"]))
            continue
        c.drawCircle(cx_, cy_, 9, ink_paint(TONE["jiao"] * ease_out(clamp(s / 0.1), 2)))
        if k:
            px, py = CITIES[k - 1]
            brush(c, [(px, py), (cx_, cy_)], 4, "nong", 0.4, 6, 940 + k, u=ease_out(clamp(s / 0.12), 2),
                  taper=(0.05, 0.2))
    if t >= rts[-1]:
        px, py = CITIES[-1]
        brush(c, [(px, py), CITIES[0]], 4, "nong", 0.4, 6, 960, u=ease_out(clamp((t - rts[-1] - 0.1) / 0.15), 2))


# ------------------------------------------------------------------ 32-38: Sewall Wright's map
PA, PB = (700, 560), (1300, 500)
RINGS = [(PA, 50), (PA, 100), (PA, 150), (PB, 60), (PB, 120), (PB, 180), (PB, 240), (PB, 300)]
NDOTS = 12


def dot_home(k):
    r = np.random.default_rng(50 + k)
    return PA[0] + r.normal(0, 26), PA[1] + r.normal(0, 22)


def dot_pos(k, t):
    hx, hy = dot_home(k)
    for j, h in enumerate(window("pull", 36, 37)):            # a lunge toward the valley, pulled back
        s = t - h
        if 0 <= s < BEAT:
            out = math.sin(math.pi * clamp(s / (BEAT * 0.8)))
            hx += 120 * out * (0.6 + 0.4 * ((k + j) % 3) / 2)
    dr = window("drift", 37, 38)
    crossed = k % 2 == 0 and k < 10
    r = np.random.default_rng(80 + k)
    for j, h in enumerate(dr):
        if t >= h:
            amp = 18 + 10 * j
            hx += r.normal(0, amp) * (1 - ease_out(clamp((t - h) / 0.12)))
    cs = since("cross", t, 37)
    if crossed and cs < 1e8:
        u = ease_io(clamp(cs / 0.5))
        bx, by = PB[0] + r.normal(0, 30), PB[1] + r.normal(0, 26)
        hx, hy = lerp(hx, bx, u), lerp(hy, by, u) - 80 * math.sin(math.pi * u)
    return hx, hy


@shot(B(32), B(38), tin=0.0, tout=0.0, kin="cut", kout="cut")
def wright(c, x, t, lt):
    t = frozen(t)
    number(c, "1932", 360, 220, 120, ease_out(clamp(since("year", t, 32) / 0.25), 3))
    ns = since("name", t, 32)
    ink_text(c, "Sewall Wright", 360, 290, 40, ease_out(clamp(ns / 0.2), 2) if ns < 1e8 else 0, align="center",
             tone=0.75)
    ink_text(c, "适应度地形 · 1932", 360, 340, 26, ease_out(clamp(ns / 0.2), 2) if ns < 1e8 else 0, align="center",
             tone=0.5)
    for k, h in enumerate(window("ring", 33, 34)):
        s = t - h
        if s < 0:
            continue
        (cx_, cy_), R = RINGS[k]
        rr = np.random.default_rng(200 + k)
        pts = [(cx_ + math.cos(a_) * R * (1 + 0.06 * math.sin(3 * a_ + rr.uniform(0, 6))),
                cy_ + math.sin(a_) * R * 0.72 * (1 + 0.05 * math.sin(2 * a_ + rr.uniform(0, 6))))
               for a_ in np.linspace(0, 6.3, 90)]
        brush(c, pts, 3, "zhong" if k in (0, 3) else "dan", 0.6, 6, 210 + k, u=ease_out(clamp(s / 0.2), 2),
              taper=(0.05, 0.05))
    if t >= window("ring", 33, 34)[2]:
        ink_text(c, "+", PA[0], PA[1] - 6, 40, 0.8, align="center", tone=0.5)
    if t >= window("ring", 33, 34)[3]:
        ink_text(c, "+", PB[0], PB[1] - 6, 52, 0.8, align="center", tone=0.5)
    if t >= B(33) + BEAT:
        ink_text(c, "小山", PA[0], PA[1] - 140, 30, smooth((t - B(33) - BEAT) / 0.3), align="center", tone=0.6)
        ink_text(c, "更高的山", PB[0], PB[1] - 240, 30, smooth((t - B(33) - 3 * BEAT) / 0.3), align="center",
                 tone=0.6)
    vs = since("valley", t, 35)
    if vs < 1e8:
        u = ease_out(clamp(vs / 0.2), 2)
        ink_text(c, "−", 1010, 560, 64, u, align="center", tone=0.6)
        ink_text(c, "谷地", 1010, 640, 30, u, align="center", tone=0.6)
    ars = since("arrow", t, 35)
    if ars < 1e8:
        u = ease_out(clamp(ars / 0.25), 2)
        pts = [(PA[0] + 70, PA[1] - 30), (1000, 420), (PB[0] - 100, PB[1] - 50)]
        brush(c, pts, 5, "nong", 0.55, 10, 230, u=u, taper=(0.05, 0.3))
        if u >= 1:
            tip = pts[-1]
            brush(c, [(tip[0] - 30, tip[1] - 22), tip, (tip[0] - 36, tip[1] + 14)], 4, "nong", 0.4, 6, 231)
    for k in range(NDOTS):
        h = window("dot", 34, 35)[k]
        if t < h:
            continue
        px, py = dot_pos(k, t)
        u = ease_out(clamp((t - h) / 0.1), 2)
        c.drawCircle(px, py, 9 * u, ink_paint(TONE["jiao"]))
    if since("cross", t, 37) < 1e8:
        x.zoom = max(x.zoom, 1 + 0.025 * math.exp(-since("cross", t, 37) / 0.15))
    ps = since("pull", t, 36)
    if ps < 1e8 and t < B(37):
        ink_text(c, "自然选择：拉回去", 1010, 800, 30, 1.0, align="center", tone=0.65)
    if t >= B(37):
        ink_text(c, "偶然：随机漂变", 1010, 800, 30, smooth((t - B(37)) / 0.3), align="center", tone=0.65)


# ------------------------------------------------------------------ 38-48: your own hill
LIFE_X = 1500
LIFE_WORDS = [("换行", "低"), ("跳槽", "低"), ("重新学", "低"), ("降一级", "低"), ("从头来", "低"), ("换城市", "低")]
DOWN42 = window("score", 42, 43)
DOWN42_X = [1560, 1620, 1680, 1740]
J46 = window("jump", 46, 47)
J46_X = [1420, 1560, 1460, 1640, 1580, 1760, 1700, 1900]
C47 = window("cool", 47, 48)
C47_X = [2050, 2200, 2350, 2500]


def life_x(t):
    if t < B(44):
        return path_x(t, DOWN42, DOWN42_X, LIFE_X, 0.18)
    if t < B(46):
        return LIFE_X
    return path_x(t, J46 + C47, J46_X + C47_X, LIFE_X, 0.2)


def plaque(c, x, y, text, u, size=30):
    """A hanging wooden board, brushed, with a vertical inscription."""
    if u <= 0:
        return
    h = len(text) * size * 1.1 + 30
    c.save()
    c.translate(x, y - 20 * (1 - u))
    brush(c, [(-size * 0.75, 0), (size * 0.75, 0), (size * 0.75, h), (-size * 0.75, h), (-size * 0.75, 0)], 4, "nong",
          0.4, 8, 300 + len(text), u=u, taper=(0.02, 0.02))
    vertical(c, text, 0, size * 1.25, size, u, tone=0.85)
    c.restore()


@shot(B(38), B(48), tin=0.0, tout=0.0, kin="cut", kout="cut")
def life(c, x, t, lt):
    t = frozen(t)
    cx = life_x(t)
    wide = ease_io(clamp((t - B(44)) / (BEAT * 1.5)))
    follow = ease_io(clamp((t - B(46)) / BAR))
    cam = Cam(lerp(lerp(1500, 2300, wide), cx + 300, follow), lerp(lerp(661, 560, wide), height(cx) + 100, follow),
              lerp(0.85, 0.5, wide), 960, lerp(560, 600, wide))
    draw_world(c, cam)
    sx, sy = cam.p(cx, height(cx))
    lu = pop("lamp", t, 0.3, 38)
    hop = jump_y(t, J46, 46, 0.2)
    pose = walk(t, DOWN42 + C47, 0.18, 0.2) if (t < B(46) or t >= B(47)) else dict(stride=0.6 if hop else 0.2,
                                                                                  lift=0, lean=0)
    look = 0
    prs = window("probe", 39, 41)
    for k, h in enumerate(prs):
        if 0 <= t - h < BEAT * 0.9:
            look = -1 if k % 2 == 0 else 1
    fs = lerp(1.0, 0.55, wide)
    if t >= window("flag", 45, 46)[0]:
        fu = pop("flag", t, 0.2, 45) if t < window("flag", 45, 46)[1] else 1.0
        hx1, hy1 = cam.p(1500, height(1500))
        flag_on(c, hx1 + 30 * fs, hy1, fs, t, fu, text="第一座山")
    if t >= window("flag", 45, 46)[1]:
        su, sv = cam.p(3300, height(3300))
        flag_on(c, su + 20, sv, fs * 0.9, t, pop("flag", t, 0.25, 45), tone="qing")
        ink_text(c, "？", su + 40, max(80, sv - 160 * fs), 40, pop("flag", t, 0.25, 45), align="center", tone=0.6)
    figure(c, sx, sy - hop - pose["lift"] * 0.6 + breathe(t), fs, lu, stride=pose["stride"], lean=pose["lean"],
           look=look, a=1.0)
    # the hill gets a name; every way off it looks lower
    if B(39) <= t < B(42):
        plaque(c, sx - 240, sy - 330, "还不错的工作", pop("label", t, 0.2, 39), 34)
    for k, h in enumerate(prs):
        d = -1 if k % 2 == 0 else 1
        gx, gy = cam.p(cx + d * 170, height(cx + d * 170))
        wd, lo_ = LIFE_WORDS[k % 6]
        probe(c, sx, sy, gx, gy + 6, t - h, 60 + k, lo_, sub=wd, size=40)
    for k, h in enumerate(window("stuck", 41, 42)):
        s = t - h
        if s >= 0 and t < B(42):
            enso(c, sx + 4, sy - 60, 120 + 40 * k, ease_out(clamp(s / 0.2), 2), 40 + k, 9 - 2 * k)
    if B(42) <= t < B(43):
        sc = [98, 90, 81, 70, 62][count("score", t, 42)]
        number(c, f"{sc}", 1500, 300, 120, 1.0)
        ink_text(c, "熟练度", 1500, 360, 28, 1.0, align="center", tone=0.55)
        ink_text(c, "换个方法，先变笨", 1500, 410, 28, smooth((t - B(42)) / 0.3), align="center", tone=0.55)
    if B(43) <= t < B(44):
        labs = window("label", 43, 44)
        plaque(c, sx - 220, sy - 330, "住惯的城", pop("label", t, 0.2, 43) if t >= labs[0] else 0)
        if t >= labs[1]:
            plaque(c, sx + 220, sy - 330, "过得去的日子", ease_out(clamp((t - labs[1]) / 0.2), 2))
    bolt = since("bolt", t, 44)
    if bolt < 2 and t < B(45):
        lightning(c, 1500, bolt, scale=0.8)
        if bolt < 0.5:
            x.flash = max(x.flash, 0.3 * math.exp(-bolt / 0.06))
    # mist: thick over the summit until the bolt; the bolt and the reveal thin it
    thin = 1 - 0.7 * (math.exp(-bolt / 0.25) if bolt < 2 else 0) if t < B(45) else 0.55
    if t < B(46):
        su, sv = cam.p(3300, height(3300))
        g = skia.GradientShader.MakeRadial(skia.Point(su, sv + 80), 520, [col4((0, 0, 0), 0.95 * thin),
                                                                         col4((0, 0, 0), 0.8 * thin),
                                                                         col4((0, 0, 0), 0)], [0, 0.6, 1])
        _paper_masked(c, g, None)
    if t >= B(46):
        thermometer(c, 170, 260, 700, temperature46(t), smooth((t - B(46)) / 0.25))
    clouds(c, t + 90, cam.cx, 0.8, 0, 600)
    mist_band(c, 1000, 320, 1.0, t, 7)


def temperature46(t):
    T = 1.0 - 0.04 * math.sin(t * 9)
    for k, h in enumerate(C47):
        if t >= h:
            T = lerp(0.96 - 0.22 * k, 0.96 - 0.22 * (k + 1), ease_out(clamp((t - h) / 0.2), 2))
    return T


# ------------------------------------------------------------------ 48-54: the coda
D50 = window("down", 50, 51)
D50_X = [1580, 1660]


@shot(B(48), B(52), tin=0.0, tout=0.0, kin="cut", kout="cut")
def coda(c, x, t, lt):
    push = ease_io(clamp((t - B(50)) / (2 * BAR)))
    cam = Cam(lerp(2300, 2100, push), lerp(0, 200, push), lerp(0.42, 0.5, push), 960, lerp(1000, 1040, push))
    draw_world(c, cam)
    cx = path_x(t, D50, D50_X, 1500, 0.18)
    sx, sy = cam.p(cx, height(cx))
    fx, fy = cam.p(1500, height(1500))
    flag_on(c, fx + 18, fy, cam.z, t, 1.0)
    pose = walk(t, D50, 0.18, -0.2)
    look = 0
    for k, h in enumerate(window("look", 51, 52)):
        if t >= h:
            look = -1 if k == 0 else 1
    if t >= window("reveal", 51, 52)[0]:
        look = 1
    figure(c, sx, sy - pose["lift"] * 0.5 + breathe(t) * 0.4, cam.z * 1.0, pop("lamp", t, 0.3, 48),
           stride=pose["stride"], lean=pose["lean"], look=look)
    bolt = since("bolt", t, 49)
    rv = since("reveal", t, 51)
    rev = ease_io(clamp(rv / (BEAT * 1.4))) if rv < 1e8 else 0.0
    thin = (math.exp(-bolt / 0.25) if bolt < 2 else 0)
    su, sv = cam.p(3300, height(3300))
    k = clamp(1 - 0.8 * thin - rev)
    if k > 0.003:
        g = skia.GradientShader.MakeRadial(skia.Point(su, sv + 120), 640, [col4((0, 0, 0), 0.97 * k),
                                                                          col4((0, 0, 0), 0.85 * k),
                                                                          col4((0, 0, 0), 0)], [0, 0.6, 1])
        _paper_masked(c, g, None)
    lightning(c, su - 60, bolt, scale=0.7)
    if bolt < 0.5:
        x.flash = max(x.flash, 0.25 * math.exp(-bolt / 0.06))
    clouds(c, t + 140, cam.cx, 0.9, 0, 640)
    mist_band(c, 1000, 200, 1.0, t, 8)
    ink_text(c, "山 · 雾", 140, 130, 34, pop("tag", t, 0.3, 48), tone=0.6)


@shot(B(52), B(54), tin=0.0, tout=0.0, kin="cut", kout="cut")
def lines(c, x, t, lt):
    t = frozen(t)
    cam = Cam(2300, 0, 0.42, 960, 1000)
    c.saveLayerAlpha(None, 90)
    draw_world(c, cam)
    c.restore()
    x.zoom = 1 + 0.03 * math.exp(-since("slam", t, 52) / 0.2)


# ------------------------------------------------------------------ 54-60: back to the night
DOWNS = window("down", 55, 57)
DOWN_X = [1580, 1720, 1860, 1990, 2120]
UPS = window("bottom", 57, 58) + window("step", 57, 59)
UP_X = [2200] + [2200 + (k + 1) * (3300 - 2200) / 13 for k in range(12)]
DAWN = window("dawn", 59, 60)


def back_x(t):
    return path_x(t, DOWNS + UPS + DAWN, DOWN_X + UP_X + [3300], 1500, 0.18)


@shot(B(54), B(60), tin=0.0, tout=0.0, kin="cut", kout="cut")
def back(c, x, t, lt):
    t = frozen(t)
    cx = back_x(t)
    ds = since("dawn", t, 59)
    day = ease_io(clamp(ds / (BEAT * 1.5))) if ds < 1e8 else 0.0
    pull = ease_io(clamp((ds - BEAT) / (BEAT * 2.5))) if ds < 1e8 else 0.0
    cam = Cam(lerp(cx, 2400, pull), lerp(height(cx) + 60, 600, pull), lerp(1.0, 0.42, pull), lerp(760, 1000, pull),
              lerp(640, 780, pull))
    draw_world(c, cam)
    sx, sy = cam.p(cx, height(cx))
    hx1, hy1 = cam.p(1500, height(1500))
    us = since("unflag", t, 55)
    if us > 1e8 or us < 0.2:
        flag_on(c, hx1 + 46 * cam.z / 1.15, hy1, cam.z / 1.15, t, 1.0 - (ease_out(clamp(us / 0.2)) if us < 1e8 else 0))
    pose = walk(t, DOWNS + UPS + DAWN, 0.18, 0.0)
    if t >= B(57):
        pose["lean"] = 0.3
    carry = us < 1e8
    lamp = pop("lamp", t, 0.25, 54)
    fs = lerp(1.15, 0.55, pull)
    fy = sy - pose["lift"] + 2 + breathe(t)
    kw = dict(stride=pose["stride"], lean=pose["lean"], flag=carry and t < B(59) + BEAT * 2)
    lx, ly = figure(c, sx, fy, fs, lamp, **kw)
    fsd = since("flag", t, 59)
    if fsd < 1e8:
        flag_on(c, sx + 46 * cam.z, sy, cam.z, t, ease_out(clamp(fsd / 0.2), 2))
        x.zoom = max(x.zoom, 1 + 0.025 * math.exp(-fsd / 0.12))
    grow = smooth((t - B(58)) / BAR)
    r = (340 + 25 * math.sin(t * 2.3) + 500 * grow) * lamp
    fog(c, lx, ly, r, 1 - day)
    clouds(c, t, cam.cx, 1.0 - 0.4 * day)
    mist_band(c, 1000, 220, 1.0, t, 2)
    if lamp > 0 and day < 1:
        c.save()
        c.clipRect(skia.Rect.MakeXYWH(lx - 120, ly - 260, 240, 380))
        figure(c, sx, fy, fs, lamp, a=0.9, **kw)
        c.restore()
    ink_text(c, "夜 · 雾" if day < 0.5 else "天亮", 140, 130, 34, pop("tag", t, 0.3, 54) * (1 - pull), tone=0.6)
    if t < B(59) + BEAT * 2:
        alt_note(c, 1560, t, cx, 1.0, y=300)
    if pull > 0:
        ink_text(c, "第一座山", hx1, hy1 + 60, 28, pull, align="center", tone=0.6)
    x.flash = max(x.flash, 0.25 * math.exp(-ds / 0.15) if ds < 1e8 else 0)


# ------------------------------------------------------------------ 60-64: final and end card
@shot(B(60), B(64), tin=0.0, tout=0.0, kin="cut", kout="cut")
def final(c, x, t, lt):
    cam = Cam(2400, 600, 0.42, 1000, 780)
    end = t >= B(62)
    if not end:
        c.saveLayerAlpha(None, 110)
    draw_world(c, cam)
    sx, sy = cam.p(3300, height(3300))
    flag_on(c, sx + 46 * 0.42, sy, 0.42, t)
    figure(c, sx, sy + breathe(t) * 0.3, 0.55, 1.0, stride=0.2, look=-1)
    hx1, hy1 = cam.p(1500, height(1500))
    if not end:
        c.restore()
    ink_text(c, "第一座山", hx1, hy1 - 50, 30, 1.0 if not end else 0.0, align="center", tone=0.75)
    clouds(c, t + 200, cam.cx, 0.7, 0, 500)
    mist_band(c, 1000, 220, 1.0, t, 9)
    if end:
        e = ease_out(clamp(since("endcard", t, 62) / 0.4), 2)
        fog(c, 0, 0, 0, 0.93 * e)
        ink_text(c, "参考", 960, 330, 34, e, align="center", tone=0.7)
        ink_text(c, "Kirkpatrick, Gelatt & Vecchi (1983). Optimization by Simulated Annealing.", 960, 410, 30, e,
                 align="center", tone=0.75)
        ink_text(c, "Science 220(4598): 671–680.", 960, 456, 30, e, align="center", tone=0.75)
        ink_text(c, "Wright, S. (1932). The roles of mutation, inbreeding, crossbreeding and selection in evolution.",
                 960, 540, 28, e, align="center", tone=0.75)
        ink_text(c, "Proc. 6th International Congress of Genetics 1: 356–366.", 960, 584, 28, e, align="center",
                 tone=0.75)
        ink_text(c, "一帧一理 · 04", 960, 720, 30, e, align="center", tone=0.6)
        if e > 0:
            c.save()
            c.translate(960, 820)
            seal(c, 0, 0, 40, CONCEPT, serif(36, True))
            c.restore()
    x.zoom = 1 + 0.02 * math.exp(-since("final", t, 60) / 0.3)


# ------------------------------------------------------------------ the page
CAPS = captions() + [(t_of(8, 2.5), B(10) - 0.3, TITLE_Q, "top", 38, 0.0)]
_haze = {}


def haze(c, x0, y, w, size, a):
    """A breath of blank paper behind a caption, so it never sits on ink (cached per size)."""
    key = (int(w) // 8, size)
    if key not in _haze:
        rec = skia.PictureRecorder()
        cc = rec.beginRecording(skia.Rect.MakeLTRB(-200, -200, w + 400, 200))
        g = skia.Paint(AntiAlias=True, Color4f=col4(PAPER, 1.0))
        g.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, size * 0.6))
        cc.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-size * 1.1, -size * 1.05, w + size * 0.5, size * 0.45),
                                           size * 0.6, size * 0.6), g)
        _haze[key] = rec.finishRecordingAsPicture()
    c.saveLayerAlpha(None, int(255 * 0.82 * clamp(a)))
    c.translate(x0, y)
    c.drawPicture(_haze[key])
    c.restore()


def inscription(c, t):
    """Captions are inscriptions: ink, no box, a small vermilion square before the line; centred on the page."""
    for t0, t1, text, pos, size, *_ in CAPS:
        if not t0 <= t < t1 + 0.4:
            continue
        a = smooth((t - t0) / 0.25) * (1 - smooth((t - t1) / 0.4))
        rows = ["".join(ch for ch, _ in parse_marks(r)) for r in text.split("\n")]
        f = serif(size)
        y0 = {"top": 150, "bottom": 990, "upper": 300, "center": 540 - (len(rows) - 1) * size * 0.8}[pos]
        for j, row in enumerate(rows):
            w = f.measureText(row)
            x0 = W / 2 - w / 2
            y = y0 + j * size * 1.6
            haze(c, x0, y, w, size, a)
            if j == 0:
                c.drawRect(skia.Rect.MakeXYWH(x0 - size * 0.62, y - size * 0.6, size * 0.28, size * 0.28),
                           skia.Paint(AntiAlias=True, Color4f=col4(RED, 0.9 * a)))
            c.drawString(row, x0, y, f, ink_paint(0.85 * a, blur=(1 - a) * 3))


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
    run(frame, setup, tl.dur, tl.fps, OUT, f"{TITLE}.mp4")
