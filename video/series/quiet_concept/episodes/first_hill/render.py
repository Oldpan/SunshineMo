"""第一座山（局部最优 · Local optimum） — 一帧一理 episode 4, cold-open test (10 bars at 100 BPM = 24 s).

  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 1 4 6.5 8.5 11 13 17 19 20.5 22
  python3 render.py                                    # 1920x1080 @ 60 fps

The climber only sees what his lantern lights: the ridge is drawn with a radial mask around the lantern.
Every timed change reads cues.HITS through `since()` / `pop()`, so picture and score agree.
"""
import math
import os
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.timeline import Timeline, Sync  # noqa: E402
from core.pipeline import run  # noqa: E402
from style import *  # noqa: E402,F401,F403
from cues import (BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, SILENCES,  # noqa: E402
                  captions, hit_times, t_of)

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


def flash_on(x, name, t, lo, amt=0.2, zoom=0.03):
    s = since(name, t, lo)
    if s < 1:
        x.flash = max(x.flash, amt * math.exp(-s / 0.08))
        x.zoom = max(x.zoom, 1 + zoom * math.exp(-s / 0.12))


def frozen(t):
    for b, b0, b1 in SILENCES:
        a, z = t_of(b, b0), t_of(b, b1)
        if a <= t < z:
            return a
    return t


# ------------------------------------------------------------------ the range
def height(x):
    """The landscape: a near hill at x=1500 and the real summit at x=3300, hidden in the fog."""
    return (80 + 520 * math.exp(-((x - 1500) / 420) ** 2) + 1150 * math.exp(-((x - 3300) / 650) ** 2)
            + 14 * math.sin(x / 37) * math.exp(-((x - 1500) / 900) ** 2) * 0.0)


X0, X_TOP = 900, 1500
STEPS = hit_times("step") + hit_times("top")
STEP_X = [X0 + (k + 1) * (X_TOP - X0) / len(STEPS) for k in range(len(STEPS))]


def climber_x(t):
    """Where he stands: glides to the next step position right after each footstep."""
    x = X0
    for k, h in enumerate(STEPS):
        if t >= h:
            prev = X0 if k == 0 else STEP_X[k - 1]
            x = lerp(prev, STEP_X[k], ease_out(clamp((t - h) / 0.16), 2))
    return x


class Cam:
    def __init__(self, cx, ch, z, ox=760, oy=660):
        self.cx, self.ch, self.z, self.ox, self.oy = cx, ch, z, ox, oy

    def p(self, x, h):
        return self.ox + (x - self.cx) * self.z, self.oy - (h - self.ch) * self.z


def ridge_path(cam, x0=-200, x1=4600, n=400):
    p = skia.Path()
    for k in range(n + 1):
        x = lerp(x0, x1, k / n)
        sx, sy = cam.p(x, height(x))
        (p.moveTo if k == 0 else p.lineTo)(sx, sy)
    return p


def draw_ridge(c, cam, lx, ly, r, a, reveal=0.0, col=INK):
    """Ridge line lit only within r of the lantern (lx, ly); reveal 0..1 lights all of it (lightning, dawn)."""
    path = ridge_path(cam)
    body = skia.Path(path)
    body.lineTo(4600 * 2, 3000)
    body.lineTo(-2000, 3000)
    body.close()
    if reveal > 0:                               # in the fog the range has no silhouette at all
        c.drawPath(body, paint((0.015, 0.02, 0.03), 0.85 * reveal))
    if reveal > 0:
        c.drawPath(path, paint(col, reveal * 0.45, stroke=12, blur=10))
        c.drawPath(path, paint(col, reveal, stroke=3.5))
    if a > 0 and r > 1:
        sh = skia.GradientShader.MakeRadial(skia.Point(lx, ly), r, [argb(INK, a), argb(INK, a * 0.6), argb(INK, 0)],
                                            [0.0, 0.55, 1.0])
        c.drawPath(path, skia.Paint(Shader=sh, AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=4,
                                    StrokeCap=skia.Paint.kRound_Cap))
        # loose stones by the feet
        for i in range(40):
            xx = cam.cx - 400 + i * 21 + 9 * math.sin(i * 7.3)
            sx, sy = cam.p(xx, height(xx))
            d = math.hypot(sx - lx, sy - ly)
            if d < r:
                c.drawCircle(sx + 4 * math.sin(i), sy + 6 + 3 * math.cos(i * 3), 2.2, paint(DIM, a * (1 - d / r)))


def climber(c, sx, sy, s, a, lamp, arm_up=0.0, bob=0.0):
    """A walker with a lantern in the right hand (raised with arm_up)."""
    if a <= 0.003:
        return
    figure(c, sx, sy - bob, s, INK, a, walk=None, glow=0.4)
    hx = sx + 30 * s + 14 * s * arm_up
    hy = sy - bob - lerp(96, 210, arm_up) * s
    c.drawLine(sx + 4 * s, sy - bob - 150 * s, hx, hy, paint(INK, a, stroke=5 * s, cap_round=True))
    c.drawLine(hx, hy, hx, hy + 18 * s, paint(INK, a, stroke=2 * s))
    c.drawRRect(rrect(hx - 9 * s, hy + 18 * s, 18 * s, 24 * s, 4 * s), paint(WARM, a * lamp))
    spot(c, hx, hy + 30 * s, 90 * s, WARM, lamp * a)
    return hx, hy + 30 * s


def flag(c, sx, sy, u, t):
    if u <= 0:
        return
    top = sy - 150 * u
    c.drawLine(sx, sy, sx, top, paint(INK, 1, stroke=4, cap_round=True))
    p = skia.Path()
    w = 70 * u
    p.moveTo(sx, top)
    for k in range(9):
        v = k / 8
        p.lineTo(sx + w * v, top + 8 * math.sin(t * 7 - v * 4) * v)
    p.lineTo(sx + w, top + 44 + 8 * math.sin(t * 7 - 4))
    for k in range(8, -1, -1):
        v = k / 8
        p.lineTo(sx + w * v, top + 44 * (1 - 0.0) - 0 + 8 * math.sin(t * 7 - v * 4) * v)
    p.close()
    c.drawPath(p, paint(WARM, 0.9))


def big_number(c, s, x, y, size, col, u, a=1.0):
    if a <= 0.003 or u <= 0:
        return
    sc = 1.0 + 0.35 * (1 - u) ** 2
    f = serif(size, bold=True)
    w = f.measureText(s)
    c.save()
    c.translate(x, y)
    c.scale(sc, sc)
    c.drawString(s, -w / 2, size * 0.35, f, paint(col, a * 0.45, blur=size * 0.12))
    c.drawString(s, -w / 2, size * 0.35, f, paint(col, a * min(1, u * 2)))
    c.restore()


# ------------------------------------------------------------------ shots
@shot(0, B(8), tin=0.0, tout=0.0, kin="cut", kout="cut")
def night(c, x, t, lt):
    t = frozen(t)
    lamp = pop("lamp", t, 0.12)
    cx = climber_x(t)
    # bar 7: the camera starts to pull back into the fog, then the bolt
    pull = ease_io(clamp((t - B(7)) / (2 * BEAT)))
    cam = Cam(lerp(cx, 2300, pull), lerp(height(cx) + 60, 520, pull), lerp(1.15, 0.38, pull),
              lerp(760, 960, pull), lerp(640, 720, pull))
    sx, sy = cam.p(cx, height(cx))
    st = min(since("step", t), since("top", t), since("probe", t))
    bob = 6 * math.exp(-st / 0.08) if st < 1 else 0.0
    arm = ease_io(clamp((t - B(6)) / 0.35)) * (1 - ease_io(clamp((t - t_of(6, 3.5)) / 0.3)))
    bolt = since("bolt", t)
    rev = math.exp(-bolt / 0.18) * (1 if bolt < 0.06 or 0.12 < bolt else 0.3) if bolt < 2 else 0.0
    r = 380 * lamp * (1 + 0.04 * math.sin(t * 9)) * lerp(1, 0.6, pull)
    cs = 0.8 * lerp(1, 0.5, pull)
    lx, ly = sx + 30 * cs + 14 * cs * arm, sy - bob - lerp(96, 210, arm) * cs + 30 * cs
    draw_ridge(c, cam, lx, ly, r, lamp, rev, COOL)
    # ping rings: the lantern held high, light runs out into the fog and comes back with nothing
    for i in range(4):
        s = since_nth("ping", i, t)
        if 0 <= s < 1.6:
            u = s / 1.6
            c.drawCircle(lx, ly, 60 + 620 * ease_out(u, 2), paint(WARM, 0.5 * (1 - u), stroke=3))
    climber(c, sx, sy, 0.8 * lerp(1, 0.5, pull), 1.0 if lamp > 0 else 0.0, lamp, arm, bob)
    # probes: a ghost foot down-slope on either side, each answered "低"
    for i in range(6):
        s = since_nth("probe", i, t)
        if 0 <= s < BEAT * 0.95:
            d = -1 if i % 2 == 0 else 1
            px_ = cx + d * 70
            gx, gy = cam.p(px_, height(px_))
            u = ease_out(clamp(s / 0.12), 3)
            fade = 1 - clamp((s - BEAT * 0.6) / (BEAT * 0.35))
            c.drawLine(sx, sy - 6, lerp(sx, gx, u), lerp(sy - 6, gy, u), paint(NEG, 0.9 * fade, stroke=3,
                                                                              cap_round=True))
            c.drawCircle(gx, gy, 8 * u, paint(NEG, fade))
            tag(c, "低", "LOWER", gx, gy + 50, NEG, fade * u, 30, "center")
    # flag on the top
    fu = pop("flag", t, 0.2)
    if fu > 0:
        flag(c, sx + 50 * cam.z / 1.15, sy, fu, t)
        flash_on(x, "flag", t, 0, 0.18, 0.03)
    # HUD: place, rule, altitude
    tag(c, "夜里 · 大雾", "NIGHT · FOG", 140, 130, DIM, pop("tag", t, 0.3) * (1 - pull), 34)
    if B(1) <= t < B(3):
        tag(c, "规则：哪边高，往哪边走", "RULE: ALWAYS STEP UPHILL", 1780, 130, WARM, smooth((t - B(1)) / 0.4), 30,
            "right")
    n = count("step", t) + count("top", t)
    if n and t < B(7):
        h = int(round(height(cx)))
        u = min(pop("step", t, 0.14), 1.0) if t < B(3) else 1.0
        if t < t_of(5, 2):
            big_number(c, f"{h} m", 1480, 560, 120, WARM if t >= B(3) else INK, u)
            tag(c, "海拔", "ALTITUDE", 1480, 440, DIM, 0.9, 26, "center")
        else:
            au = pop("alt", t, 0.2)
            big_number(c, f"{h} m", 1480, 540, 180, WARM, au)
            tag(c, "最高点", "THE TOP", 1480, 390, WARM, au, 34, "center")
            flash_on(x, "alt", t, 0, 0.12, 0.02)
    if count("probe", t) >= 2 and B(3) <= t < B(5):
        tag(c, "四周都更低", "EVERY STEP GOES DOWN", 1480, 700, NEG, smooth((t - t_of(3, 2)) / 0.3), 28, "center")
    if since("bolt", t) < 0.4:
        x.flash = max(x.flash, 0.5 * math.exp(-since("bolt", t) / 0.07))
    if t >= t_of(7, 3):
        x.dim = 0.88
    x.zoom = max(x.zoom, 1 + 0.012 * S.pulse("kick", t, 0.1))


@shot(B(8), B(10), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt):
    k = S.pulse("kick", t, 0.12)
    cam = Cam(2300, 0, 0.42, 960, 1070)
    # dawn behind the range
    spot(c, cam.p(3300, 0)[0], 760, 900, WARM, 0.35 + 0.1 * k)
    draw_ridge(c, cam, 0, 0, 0, 0, 1.0, INK)
    sx, sy = cam.p(X_TOP, height(X_TOP))
    climber(c, sx, sy, 0.22, 1.0, 1.0)
    flag(c, sx + 18, sy, 0.45, t)
    hx, hy = cam.p(3300, height(3300))
    c.drawCircle(hx, hy, 7, paint(COOL, 0.9))
    tag(c, "更高的山", "THE HIGHER ONE", hx, hy - 30, COOL, smooth((t - t_of(8, 3)) / 0.4), 26, "center")
    tag(c, "他站的地方", "WHERE HE STOPPED", sx, sy - 120, WARM, smooth((t - t_of(9, 0)) / 0.4), 22, "center")
    f = serif(170, bold=True)
    chars = list(TITLE)
    widths = [f.measureText(ch) for ch in chars]
    x0 = CX - sum(widths) / 2
    for i, (ch, w) in enumerate(zip(chars, widths)):
        s = since_nth("char", i, t)
        if s < 0:
            continue
        u = ease_out(clamp(s / 0.16), 4)
        c.save()
        c.translate(x0 + w / 2, 300 + (1 - u) * -120)
        sc = 1 + 0.5 * (1 - u)
        c.scale(sc, sc)
        c.drawString(ch, -w / 2, 0, f, paint(INK, u * 0.35, blur=26))
        c.drawString(ch, -w / 2, 0, f, paint(INK, u))
        c.restore()
        x0 += w
    cu = pop("concept", t, 0.3)
    tag(c, CONCEPT, CONCEPT_EN, CX, 110, DIM, cu, 34, "center")
    c.drawLine(CX - 360 * cu, 360, CX + 360 * cu, 360, paint(FAINT, cu, stroke=1.5))
    caption_line(c, TITLE_Q, CX, 430, 44, t - t_of(8, 2.5), shadow=False)
    s0 = since("title", t)
    shake = math.exp(-s0 / 0.25) if s0 < 2 else 0.0
    x.zoom = 1 + 0.06 * shake + 0.012 * k
    x.flash = 0.45 * math.exp(-s0 / 0.07) if s0 < 1 else 0.0


LOOKS = {"dark": LOOKS_BASE["deep"], "climb": LOOKS_BASE["night"], "top": LOOKS_BASE["night"],
         "sure": LOOKS_BASE["night"], "flash": LOOKS_BASE["deep"], "title": LOOKS_BASE["warm"]}
style = QuietConcept(tl, S, LOOKS, captions=captions(), intro_fade=0.05, outro_fade=1.2)

if __name__ == "__main__":
    run(style.frame, style.setup, tl.dur, tl.fps, OUT, f"{TITLE}_试片.mp4")
