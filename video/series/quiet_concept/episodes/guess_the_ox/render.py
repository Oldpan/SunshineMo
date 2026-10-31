"""一千个人猜牛（群体智慧 · wisdom of crowds） — 一帧一理 episode 7 as a 1950s classroom cartoon, cold-open test.

  ./fonts.sh                                           # once per machine
  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 1 3.4 6 8.6 11 13.5 16.5 18.6 20.5 23
  python3 render.py                                    # 1920x1080 @ 60 fps

The fair, the ox, the crowd and their slips, the guesses that miss, Galton's box, the histogram, the middle slip,
the scale.  Colour cels jitter on twos so nothing ever holds still; the score never drops to silence.
"""
import math
import os
import sys
from pathlib import Path

import numpy as np
import skia

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)
sys.path.insert(0, HERE)
from core.timeline import Timeline, Sync, Ctx  # noqa: E402
from core.pipeline import run  # noqa: E402
from core.gfx import lerp, smooth  # noqa: E402
from core import post  # noqa: E402
import toon as T  # noqa: E402
from toon import (INK, PAPER, CORAL, MUSTARD, TURQ, OLIVE, POWDER, PLUM, SKIN, WHITE, paint, clamp, back_out,  # noqa: E402
                  ease_out, tint, shade_of, mix)
from cues import (BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, GOLD, REFS, WIPES_,  # noqa: E402
                  captions, hit_times, t_of)

W, H = 1920, 1080
tl = Timeline(bpm=BPM, bars=BARS, sections=SECTIONS, hard_cuts=True)
B, shot, BAR, BEAT = tl.B, tl.shot, tl.bar, tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))


def window(name, lo, hi=None):
    hi = lo + 1 if hi is None else hi
    return [h for h in hit_times(name) if B(lo) - 1e-6 <= h < B(hi) - 1e-6]


def count(hs, t):
    return sum(1 for h in hs if t >= h)


def pop(h, t, dur=0.25):
    return back_out((t - h) / dur) if t >= h else 0.0


def since(name, t, lo=0):
    ts = [h for h in hit_times(name) if B(lo) - 1e-6 <= h <= t + 1e-6]
    return t - ts[-1] if ts else 1e9


def push(x, lt, dur, z1=1.04):
    x.zoom = lerp(1.0, z1, smooth(lt / dur))


def bump(x, t, names, lo, amp=0.012, tau=0.12):
    s = min(since(n, t, lo) for n in names)
    if s < 0.5:
        x.zoom *= 1 + amp * math.exp(-s / tau)


def pulse(x, t):
    x.zoom *= 1 + 0.004 * S.pulse("kick", t, 0.12)


def scene(c, t, col, floor=True, horizon=780, seed=0):
    T.plane(c, t, tint(col, 0.55), shade_of(tint(col, 0.25), 0.08) if floor else None, horizon, seed=seed)


CROWD = [  # body, hat, bald, whiskers, glasses
    (CORAL, None, False, False, False), (MUSTARD, PLUM, False, False, False), (TURQ, None, False, False, True),
    (PLUM, None, True, False, False), (OLIVE, CORAL, False, False, False), (POWDER, None, False, False, False),
    (CORAL, INK, False, True, False), (MUSTARD, None, False, False, True)]
GUESSES = ["1150", "1300", "1210", "980", "1260", "1190", "1420", "1230", "1100", "1205", "1350", "1180"]


def crowd_member(c, k, x, y, s, t, arm=0.0, hold=None, mouth=0, look=0.0):
    body, hat, bald, wh, gl = CROWD[k % len(CROWD)]
    blink = (T.twos(t) + k * 5) % 37 == 0
    T.person(c, x, y, s, t, body=body, hat=hat, bald=bald, whiskers=wh, glasses=gl, arm=arm, hold=hold,
             mouth=mouth, look=look, blink=blink, seed=k)


# ------------------------------------------------------------------ bar 0: the fair
@shot(0, B(1), tin=0.0, tout=0.0, kin="cut", kout="cut")
def fair(c, x, t, lt):
    fair_scene(c, x, t, lt, 0, "乡村牲畜展")


def fair_scene(c, x, t, lt, b, head):
    t0 = B(b)
    scene(c, t, TURQ)
    T.sunburst(c, 960, 900, 1500, PAPER, 0.22, t * 0.08)
    # two striped tents
    for k, (tx, tc) in enumerate(((330, CORAL), (1600, MUSTARD))):
        u = pop(t0 + 0.05 + k * 0.1, t, 0.3)
        c.save()
        c.translate(tx, 780)
        c.scale(u, u)
        roof = T.poly([(-230, -250), (0, -430), (230, -250)])
        T.shape(c, roof, tc, t, 4, 10 + k, 0.12)
        for j in range(4):
            stripe = T.poly([(-230 + j * 115, -250), (-172 + j * 115, -250), (0, -430)])
            c.drawPath(stripe, paint(PAPER, 0.85))
        T.shape(c, T.rect_path(-200, -250, 400, 250), tint(tc, 0.35), t, 4, 12 + k, 0.12)
        T.shape(c, T.poly([(-60, 0), (0, -170), (60, 0)]), shade_of(tc, 0.3), t, 3.5, 14 + k, 0.1)
        c.restore()
    fl = window("flag", b)
    T.bunting(c, -40, 1960, 90, 14, t, shown=int(count(fl, t) * 14 / 8 + 0.5))
    T.script_on(c, "Plymouth, 1906", 640, 470, 84, t, t0 + 0.15, 0.7)
    T.headline(c, head, 960, 620, 120, t, t0 + 0.9, align="center")
    push(x, lt, BAR, 1.04)


# ------------------------------------------------------------------ bar 1: the ox walks in, the ticket
@shot(B(1), B(2), tin=0.0, tout=0.0, kin="cut", kout="cut")
def ox_in(c, x, t, lt):
    scene(c, t, CORAL)
    T.sunburst(c, 900, 560, 1300, PAPER, 0.2, -t * 0.06)
    hv = window("hoof", 1)
    stop = hv[-1] + 0.2
    u = clamp((t - B(1)) / (stop - B(1)))
    ox_x = lerp(2250, 960, ease_out(u, 2))
    walk = 0.0 if t >= stop else (t - B(1)) * 2 * math.pi * BPM / 60
    T.ox(c, ox_x, 640, 1.25, t, walk=walk, look=0.2 if t >= stop else 0.0, blink=(T.twos(t) % 29 == 0))
    th = window("ticket", 1)[0]
    if t >= th:
        u2 = pop(th, t, 0.28)
        c.save()
        c.translate(1500, 300)
        c.rotate(-8)
        c.scale(u2, u2)
        T.shape(c, T.rect_path(-170, -90, 340, 180, 10), WHITE, t, 4, 20, 0.08)
        c.drawPath(T.rect_path(-150, -70, 300, 140, 6), paint(CORAL, 1, 3))
        T.text(c, "6d", 0, 30, 92, "slab", INK, "center", plate=MUSTARD, t=t, seed=3)
        c.restore()
        T.tag(c, 1580, 492, "猜：宰好后净重？", t, (t - th - 0.08) / 0.25, 36)
    T.headline(c, "一头大肥牛", 110, 230, 110, t, B(1) + 0.05)
    push(x, lt, BAR, 1.04)


# ------------------------------------------------------------------ bar 2: the crowd
SPOTS = [(250, 780), (500, 800), (750, 770), (1000, 795), (1250, 775), (1480, 800), (1680, 780), (1125, 640)]


@shot(B(2), B(3), tin=0.0, tout=0.0, kin="cut", kout="cut")
def crowd(c, x, t, lt):
    scene(c, t, MUSTARD)
    T.ox(c, 1650, 470, 0.55, t, look=-0.3)
    pp = window("pop", 2)
    order = [7, 0, 3, 6, 1, 4, 2, 5]
    for j, k in enumerate(order):
        h = pp[j]
        if t < h:
            continue
        px, py = SPOTS[k]
        u = pop(h, t, 0.25)
        c.save()
        c.translate(px, py + 140)
        c.scale(1, u)
        c.translate(-px, -py - 140)
        crowd_member(c, k, px, py, 1.05 if k != 7 else 0.8, t, arm=0.75, hold="", mouth=2 if k % 3 == 0 else 0)
        c.restore()
    T.headline(c, "几百个人，各写一张", 110, 230, 100, t, B(2) + 0.05)
    push(x, lt, BAR, 1.04)


# ------------------------------------------------------------------ bar 3: the guesses fly; almost nobody is right
FLY = [(220, 330), (520, 260), (820, 360), (1120, 250), (1420, 340), (1700, 270), (370, 470), (680, 520),
       (980, 470), (1280, 520), (1580, 470), (1790, 430)]


@shot(B(3), B(4), tin=0.0, tout=0.0, kin="cut", kout="cut")
def guesses(c, x, t, lt):
    scene(c, t, POWDER)
    for k in range(7):
        crowd_member(c, k, 200 + k * 255, 826, 0.86, t, arm=0.9, mouth=1 if t > B(3) + 1.8 else 0)
    gh = window("guess", 3)
    for k, h in enumerate(gh):
        if t < h:
            continue
        s_ = clamp((t - h) / 0.3)
        sx, sy = 200 + (k % 7) * 255 + 30, 670
        fx, fy = FLY[k]
        px, py = lerp(sx, fx, ease_out(s_)), lerp(sy, fy, ease_out(s_)) - 60 * math.sin(math.pi * s_)
        rot = (k * 37 % 21 - 10) * (1 - 0.3 * s_)
        T.slip(c, px, py, 1.15, GUESSES[k], t, rot=rot, seed=k)
    for j, h in enumerate(window("miss", 3)):
        if t < h:
            continue
        u = pop(h, t, 0.25)
        cx_, cy_ = (1560, 128) if j == 0 else (300, 140)
        c.save()
        c.translate(cx_, cy_)
        c.scale(u, u)
        T.shape(c, T.starburst_path(0, 0, 110, 12, 0.7, t), CORAL, t, 3.5, 30 + j, 0.05)
        T.text(c, "差远了" if j == 0 else "也不对", 0, 16, 46, "sans", INK, "center")
        c.restore()
    push(x, lt, BAR, 1.04)


# ------------------------------------------------------------------ bar 4: the statistician and his box
@shot(B(4), B(5), tin=0.0, tout=0.0, kin="cut", kout="cut")
def galton(c, x, t, lt):
    scene(c, t, OLIVE)
    T.sunburst(c, 760, 700, 1100, PAPER, 0.16, t * 0.05)
    T.person(c, 560, 690, 1.6, t, body=PLUM, bald=True, whiskers=True, glasses=True,
             arm=0.35 + 0.1 * math.sin(t * 3), look=0.4, blink=(T.twos(t) % 31 == 0), seed=40)
    T.shape(c, T.rect_path(380, 800, 900, 100, 8), shade_of(tint(OLIVE, 0.2), 0.3), t, 4, 41, 0.1)     # desk
    # the box
    bx, by = 1020, 700
    T.shape(c, T.rect_path(bx - 140, by - 100, 280, 200, 6), CORAL, t, 4.5, 42, 0.1,
            shade=shade_of(CORAL, 0.2), shade_clip=T.rect_path(bx + 60, by - 120, 120, 240))
    T.text(c, "787", bx, by + 30, 84, "slab", PAPER, "center")
    pr = window("pour", 4)
    for k, h in enumerate(pr):
        for j in range(3):
            hh = h + j * 0.07
            if t < hh:
                continue
            s_ = (t - hh) / 0.35
            if s_ > 1:
                continue
            px = bx + (j - 1) * 70 + 30 * math.sin(k + j)
            py = lerp(-60, by - 110, s_ ** 2)
            T.slip(c, px, py, 0.8, "", t, rot=(k * 47 + j * 31) % 60 - 30, seed=k * 3 + j)
    T.headline(c, "一位统计学家", 1470, 230, 96, t, B(4) + 0.05, align="center")
    T.tag(c, 1450, 400, "84 岁", t, (t - B(4) - 0.6) / 0.25, 40)
    push(x, lt, BAR, 1.04)


# ------------------------------------------------------------------ bars 5-6: the histogram and the middle slip
BINS = [3, 7, 14, 22, 26, 18, 9, 4]                           # illustrative shape, not Galton's counts
BIN_LABELS = ["1000", "1050", "1100", "1150", "1200", "1250", "1300", "1350"]


@shot(B(5), B(7), tin=0.0, tout=0.0, kin="cut", kout="cut")
def histogram(c, x, t, lt):
    scene(c, t, PLUM, horizon=860)
    T.sunburst(c, 960, 860, 1300, PAPER, 0.12, t * 0.04)
    sh = window("sort", 5)
    n = count(sh, t)
    x0, y0, cw, sh_ = 380, 830, 150, 22
    for k in range(8):
        if k >= n:
            continue
        u = clamp((t - sh[k]) / 0.3)
        rows = int(BINS[k] * ease_out(u) + 0.5)
        for r in range(rows):
            T.slip(c, x0 + k * cw, y0 - 18 - r * sh_, 0.95, "", t, rot=((k * 7 + r * 13) % 9 - 4), seed=k * 40 + r)
        T.text(c, BIN_LABELS[k], x0 + k * cw, y0 + 62, 38, "slab", INK, "center", plate=PAPER, t=t, seed=k)
    T.text(c, "磅", x0 + 8 * cw - 30, y0 + 62, 38, "sans", INK, "left", plate=PAPER, t=t, seed=9)
    md = window("mid", 6)
    mx = x0 + 4 * cw
    if t >= md[0]:
        lift = ease_out((t - md[0]) / 0.35)
        T.slip(c, mx, lerp(y0 - 18 - 26 * sh_, 230, lift), 1.6, "1207", t, rot=0, seed=99, fill=(1.0, 0.97, 0.80))
    if t >= md[1]:
        T.arrow(c, [(mx + 330, 160), (mx + 220, 190), (mx + 110, 225)], t, INK, 6, 22, v=(t - md[1]) / 0.3)
        T.text(c, "正中间", mx + 340, 170, 48, "sans", INK, "left", plate=MUSTARD, t=t, seed=7)
    T.medallion(c, 200, 420, 95, "1207", t, (t - md[2]) / 0.25 if t >= md[2] else 0, fill=INK, size=58)
    if t >= md[3]:
        T.tag(c, 200, 560, "中位数", t, (t - md[3]) / 0.25, 36)
    T.headline(c, "从轻到重，排开" if t < B(6) else "正中间那张", 110, 200, 96, t, (B(6) if t >= B(6) else B(5)) + 0.05,
               col=INK, plate=CORAL)
    push(x, lt, 2 * BAR, 1.05)
    bump(x, t, ("mid",), 6)


# ------------------------------------------------------------------ bar 7: the scale
@shot(B(7), B(8), tin=0.0, tout=0.0, kin="cut", kout="cut")
def scale(c, x, t, lt):
    scale_scene(c, x, t, lt, 7, "实际重量")


def scale_scene(c, x, t, lt, b, head):
    scene(c, t, TURQ)
    T.sunburst(c, 1300, 520, 1300, PAPER, 0.2, -t * 0.07)
    sc = window("scale", b)
    # platform scale
    T.shape(c, T.rect_path(780, 760, 900, 70, 10), shade_of(tint(TURQ, 0.2), 0.35), t, 4.5, 50, 0.1)
    T.shape(c, T.rect_path(1600, 330, 40, 440, 6), INK, t, 3, 51, 0.0)
    dial_x, dial_y, R = 1620, 300, 150
    T.shape(c, T.circle_path(dial_x, dial_y, R), WHITE, t, 5, 52, 0.06)
    for k in range(12):
        a_ = math.radians(-210 + k * 20)
        c.drawLine(dial_x + (R - 22) * math.cos(a_), dial_y + (R - 22) * math.sin(a_),
                   dial_x + (R - 6) * math.cos(a_), dial_y + (R - 6) * math.sin(a_), paint(INK, 1, 4))
    if t >= sc[0]:
        drop = ease_out((t - sc[0]) / 0.25)
        T.ox(c, 1220, lerp(300, 640, drop), 1.05, t, look=-0.1, blink=(T.twos(t) % 23 == 0))
    ang = -210
    if t >= sc[0]:
        target = -210 + 200 * 0.6
        v = (t - sc[0])
        ang = target + 60 * math.exp(-v * 3.2) * math.cos(v * 13) if t < sc[2] else target + 4 * math.exp(
            -(t - sc[2]) * 4) * math.cos((t - sc[2]) * 20)
    a_ = math.radians(ang)
    c.drawLine(dial_x, dial_y, dial_x + (R - 30) * math.cos(a_), dial_y + (R - 30) * math.sin(a_), paint(CORAL, 1, 8))
    c.drawCircle(dial_x, dial_y, 14, paint(INK))
    if t >= sc[2]:
        T.tag(c, dial_x - R - 150, dial_y - 40, "1198 磅", t, (t - sc[2]) / 0.25, 44, fill=MUSTARD)
    T.medallion(c, 330, 520, 120, "1207", t, 1.0, fill=INK, size=74)
    T.text(c, "大家的中间", 330, 700, 44, "sans", INK, "center")
    bh = window("burst", b)[0]
    if t >= bh:
        u = pop(bh, t, 0.25)
        c.save()
        c.translate(700, 330)
        c.scale(u, u)
        T.shape(c, T.starburst_path(0, 0, 170, 16, 0.72, t * 0.5), MUSTARD, t, 4, 55, 0.05)
        T.text(c, "<1%", 0, 30, 86, "slab", INK, "center")
        c.restore()
    T.headline(c, head, 110, 200, 96, t, B(b) + 0.05)
    push(x, lt, BAR, 1.05)
    bump(x, t, ("burst", "scale"), b)


# ------------------------------------------------------------------ bars 8-9: title
@shot(B(8), B(10), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt, b0=8):
    scene(c, t, MUSTARD, horizon=860)
    pulses = window("pulse", b0 + 1)
    glow = 0.22 + 0.12 * sum(math.exp(-(t - h) / 0.25) for h in pulses if t >= h)
    T.sunburst(c, 1400, 600, 1500, PAPER, min(0.5, glow), t * 0.06)
    chars = window("char", b0)
    f = T.font(190, "title")
    xx = 110
    i = 0
    for ch in TITLE:
        if ch != " ":
            T.headline(c, ch, xx, 400, 190, t, chars[i] - 0.001, plate=CORAL, stagger=0)
            i += 1
        xx += f.measureText(ch) if ch != " " else 50
    sh = window("sub", b0)[0]
    if t >= sh:
        T.text(c, CONCEPT, 118, 500, 54, "sans", INK, plate=PAPER, t=t)
        T.script_on(c, "Wisdom of Crowds", 118 + T.font(54, "sans").measureText(CONCEPT) + 30, 500, 48, t, sh, 0.5)
    T.ox(c, 1540, 640, 0.95, t, look=-0.2 + 0.2 * math.sin(t * 1.3), blink=(T.twos(t) % 23 == 0), ribbon=True)
    for k in range(5):
        crowd_member(c, k, 760 + k * 150, 868, 0.58, t, arm=0.4 + 0.4 * (k % 2), mouth=2)
    lh = window("law", b0 + 1)[0]
    T.medallion(c, 560, 700, 120, "≈", t, (t - lh) / 0.25 if t >= lh else 0, fill=CORAL, size=120, kind="slab")
    if t >= lh:
        T.text(c, "1207", 380, 720, 56, "slab", INK, "right")
        T.text(c, "1198", 740, 720, 56, "slab", INK, "left")
    th = window("title", b0)[0]
    push(x, lt, 2 * BAR, 1.04)
    bump(x, t, ("title", "law"), b0, 0.02)
    pulse(x, t)
    x.flash = 0.35 * math.exp(-(t - th) / 0.08) if t >= th else 0.0


# ================================================================== the full episode, bars 10-55
RNG = np.random.default_rng(1906)
DOTS = np.clip(RNG.normal(1198, 74, 787), 960, 1440)          # an illustrative crowd of 787 guesses
DOT_N = [1, 2, 4, 8, 16, 30, 50, 80, 120, 170, 230, 300, 400, 520, 650, 787]


def fig_header(c, t, t0, n, title, x=110, y=130, col=INK):
    """Step header: an ink disc with a paper numeral, a letter-spaced FIG. n, the title on a plate."""
    if t < t0:
        return
    T.medallion(c, x + 46, y - 30, 46, str(n), t, (t - t0) / 0.25, fill=INK, size=54)
    T.text(c, f"F I G .  {n}", x + 112, y - 52, 24, "geo", col)
    T.headline(c, title, x + 112, y + 8, 60, t, t0 + 0.05, plate=CORAL, col=col)


def at(c, x_, y_, s=1.0, rot=0.0):
    c.save()
    c.translate(x_, y_)
    if rot:
        c.rotate(rot)
    c.scale(s, s)


def popped(c, h, t, x_, y_, dur=0.25):
    """Scale about (x_, y_) by the pop of hit h; returns False before the hit."""
    if t < h:
        return False
    u = pop(h, t, dur)
    at(c, x_, y_, u)
    c.translate(-x_, -y_)
    return True


def burst(c, x_, y_, r, s, t, h, col=MUSTARD, size=64, txt=INK, seed=0):
    if t < h:
        return
    u = pop(h, t, 0.25)
    at(c, x_, y_, u)
    T.shape(c, T.starburst_path(0, 0, r, 14, 0.72, t * 0.4), col, t, 3.5, 900 + seed, 0.05)
    T.text(c, s, 0, size * 0.36, size, "sans" if any(ord(ch) > 255 for ch in s) else "slab", txt, "center")
    c.restore()


def stamp(c, x_, y_, s, t, h, col=CORAL, size=58, rot=-8):
    """A rubber stamp slams in: a rounded frame and the words, in one colour."""
    if t < h:
        return
    k = clamp((t - h) / 0.12)
    sc = lerp(1.6, 1.0, ease_out(k))
    f = T.font(size, "sans")
    w = f.measureText(s) + size
    at(c, x_, y_, sc, rot)
    c.drawPath(T.rect_path(-w / 2, -size * 0.85, w, size * 1.6, 10), paint(col, k, 6))
    c.drawPath(T.rect_path(-w / 2 + 10, -size * 0.85 + 10, w - 20, size * 1.6 - 20, 6), paint(col, k, 2))
    c.drawString(s, -f.measureText(s) / 2, size * 0.36, f, paint(col, k))
    c.restore()


def numline(c, t, x0, x1, y, lo, hi, step, seed=0, labels=True, col=INK):
    T.ink(c, T.poly([(x0, y), (x1, y)], False), t, 5, seed, 0.06, col)
    for w in range(lo, hi + 1, step):
        px = lerp(x0, x1, (w - lo) / (hi - lo))
        c.drawLine(px, y - 10, px, y + 10, paint(col, 1, 4))
        if labels:
            T.text(c, str(w), px, y + 50, 30, "slab", col, "center")


def wpos(w, x0, x1, lo, hi):
    return lerp(x0, x1, (w - lo) / (hi - lo))


def truth_mark(c, t, x_, y0, y1, label="1198", u=1.0):
    if u <= 0:
        return
    p = skia.Path()
    p.moveTo(x_, y0)
    p.lineTo(x_, lerp(y0, y1, clamp(u)))
    pe = paint(CORAL, 1, 5)
    pe.setPathEffect(skia.DashPathEffect.Make([16, 10], 0))
    c.drawPath(p, pe)
    T.tag(c, x_, y0 - 40, label, t, u, 30, fill=MUSTARD, kind="slab" if label.isdigit() else "sans")


# ------------------------------------------------------------------ FIG. 1, bar 10: guess = truth + error
@shot(B(10), B(11), tin=0.0, tout=0.0, kin="cut", kout="cut")
def eq(c, x, t, lt):
    scene(c, t, POWDER)
    T.sunburst(c, 960, 560, 1300, PAPER, 0.16, t * 0.05)
    fig_header(c, t, window("fig", 10)[0], 1, "为什么会准")
    e = window("eq", 10)
    cy = 540
    if popped(c, e[0], t, 420, cy):
        T.slip(c, 420, cy, 2.6, "1150", t, rot=-4, seed=3)
        T.text(c, "一张纸条", 420, cy + 150, 40, "sans", INK, "center")
        c.restore()
        T.text(c, "=", 690, cy + 30, 110, "slab", INK, "center")
    if popped(c, e[1], t, 960, cy):
        T.medallion(c, 960, cy, 130, "1198", t, 1.0, fill=INK, size=72)
        T.text(c, "真相", 960, cy + 200, 40, "sans", INK, "center")
        c.restore()
        T.text(c, "+", 1225, cy + 30, 110, "slab", INK, "center")
    if popped(c, e[2], t, 1480, cy):
        T.shape(c, T.starburst_path(1480, cy, 140, 12, 0.7, t * 0.3), CORAL, t, 3.5, 61, 0.05)
        T.text(c, "−48", 1480, cy + 26, 72, "slab", PAPER, "center")
        T.text(c, "偏差", 1480, cy + 200, 40, "sans", INK, "center")
        c.restore()
    push(x, lt, BAR, 1.04)
    bump(x, t, ("eq",), 10)


# ------------------------------------------------------------------ bars 11-12: light and heavy, cancelling
LAND = [1150, 1250, 1100, 1290, 1170, 1230, 1060, 1330, 1180, 1215]
NX0, NX1, NLO, NHI = 260, 1660, 1000, 1400


@shot(B(11), B(13), tin=0.0, tout=0.0, kin="cut", kout="cut")
def line(c, x, t, lt):
    scene(c, t, TURQ, horizon=800)
    ly = 700
    numline(c, t, NX0, NX1, ly, NLO, NHI, 50)
    tx = wpos(1198, NX0, NX1, NLO, NHI)
    T.ox(c, tx, 290, 0.42, t, look=0.1 * math.sin(t), blink=(T.twos(t) % 29 == 0))
    truth_mark(c, t, tx, 410, ly - 6, "1198", 1.0)
    lands = window("land", 11, 13)
    cancels = window("cancel", 12)
    for k, h in enumerate(lands):
        if t < h:
            continue
        w = LAND[k]
        px = wpos(w, NX0, NX1, NLO, NHI)
        row = (k // 2) % 3
        py = ly - 60 - row * 78
        dropf = ease_out((t - h) / 0.22)
        yy = lerp(-80, py, dropf)
        pair = k // 2
        a = 1.0
        if pair < 3 and t >= cancels[pair]:      # the first three pairs slide to the truth and cancel
            v = clamp((t - cancels[pair]) / 0.35)
            px = lerp(px, tx, ease_out(v))
            a = 1 - clamp((v - 0.7) / 0.3)
            if v >= 0.7:
                T.sparkle(c, tx, py, 30 * (1 + v), t * 4, CORAL, 1 - clamp((t - cancels[pair] - 0.25) / 0.4))
        if a > 0:
            T.slip(c, px, yy, 1.05, str(w), t, rot=(k * 7 % 9 - 4), seed=k,
                   fill=tint(POWDER, 0.6) if w < 1198 else tint(CORAL, 0.6), a=a)
    T.tag(c, 420, 840, "偏轻", t, (t - lands[0]) / 0.25, 36, fill=tint(POWDER, 0.6))
    T.tag(c, 1500, 840, "偏重", t, (t - lands[1]) / 0.25, 36, fill=tint(CORAL, 0.6))
    if t < B(12):
        T.headline(c, "有轻，有重", 110, 200, 96, t, B(11) + 0.05)
    else:
        T.headline(c, "互相抵消", 110, 200, 96, t, B(12) + 0.05, plate=CORAL)
    push(x, lt, 2 * BAR, 1.05)
    bump(x, t, ("cancel",), 12)


# ------------------------------------------------------------------ bar 13: more people, a cleaner middle
@shot(B(13), B(14), tin=0.0, tout=0.0, kin="cut", kout="cut")
def dots(c, x, t, lt):
    scene(c, t, OLIVE, horizon=820)
    ly = 760
    x0, x1, lo, hi = 260, 1660, 950, 1450
    numline(c, t, x0, x1, ly, lo, hi, 50)
    tx = wpos(1198, x0, x1, lo, hi)
    dh = window("dot", 13)
    k = count(dh, t)
    n = DOT_N[k - 1] if k else 0
    bins = {}
    for w in DOTS[:n]:
        bi = int((w - lo) // 10)
        r = bins.get(bi, 0)
        bins[bi] = r + 1
        c.drawCircle(wpos(lo + bi * 10 + 5, x0, x1, lo, hi), ly - 16 - r * 9, 5.5, paint(INK))
    truth_mark(c, t, tx, 250, ly - 6, "1198", 1.0)
    if n:
        med = float(np.median(DOTS[:n]))
        mx = wpos(med, x0, x1, lo, hi)
        c.drawPath(T.poly([(mx - 16, 300), (mx + 16, 300), (mx, 330)]), paint(CORAL))
        T.text(c, f"中间 {med:.0f}", mx, 280, 34, "sans", INK, "center", plate=PAPER, t=t, seed=5)
    T.text(c, f"{n}", 1780, 520, 120, "slab", INK, "right", plate=MUSTARD, t=t, seed=6)
    T.text(c, "人", 1790, 520, 56, "sans", INK, "left")
    T.headline(c, "人越多，越干净", 110, 200, 96, t, B(13) + 0.05)
    push(x, lt, BAR, 1.04)


# ------------------------------------------------------------------ bar 14: nobody knew; the answer is between them
@shot(B(14), B(15), tin=0.0, tout=0.0, kin="cut", kout="cut")
def middle(c, x, t, lt):
    scene(c, t, MUSTARD, horizon=800)
    lh = window("law", 14)[0]
    glow = 0.12 + (0.3 * math.exp(-(t - lh) / 0.4) + 0.12 if t >= lh else 0.0)
    T.sunburst(c, 960, 330, 1200, PAPER, glow, t * 0.08)
    ph = window("pop", 14)
    guesses = ["1150", "1300", "1210", "1100", "1260", "1190", "1230"]
    for j, h in enumerate(ph):
        px = 210 + j * 250
        if popped(c, h, t, px, 820):
            crowd_member(c, j, px, 760, 0.82, t, arm=0.85, hold=guesses[j], mouth=0)
            c.restore()
    T.medallion(c, 960, 330, 110, "1207", t, (t - lh) / 0.25 if t >= lh else 0, fill=CORAL, size=66)
    T.headline(c, "答案在中间", 110, 200, 96, t, B(14) + 0.05)
    push(x, lt, BAR, 1.04)
    bump(x, t, ("law",), 14, 0.02)


# ------------------------------------------------------------------ bars 15-16: each guesses alone
@shot(B(15), B(17), tin=0.0, tout=0.0, kin="cut", kout="cut")
def booths(c, x, t, lt):
    scene(c, t, CORAL, horizon=800)
    bh = window("booth", 15)
    pk = window("peek", 16)
    st = window("stamp", 16)[0]
    sx = window("snapx", 16)[0]
    people = [300, 720, 1140, 1560]
    lean = 0.0
    if t >= pk[0]:
        lean = ease_out((t - pk[0]) / 0.2) if t < sx else 1 - ease_out((t - sx) / 0.15)
    for j, px in enumerate(people):
        dx = 70 * lean if j == 1 else 0.0
        lk = 0.8 * lean if j == 1 else (0.3 if j % 2 else -0.2)
        crowd_member(c, j + 2, px + dx, 690, 1.0, t, arm=0.55, hold=["1150", "1240", "1190", "1300"][j]
                     if t >= bh[3] else "", look=lk, mouth=1 if (j == 1 and lean > 0.5) else 0)
    for j, h in enumerate(bh[:3]):
        wx_ = (people[j] + people[j + 1]) / 2 + 40
        if t < h:
            continue
        v = ease_out((t - h) / 0.2)
        T.shape(c, T.rect_path(wx_ - 22, lerp(-500, 330, v), 44, 470, 6), tint(PAPER, 0.2), t, 4, 70 + j, 0.08,
                shade=shade_of(PAPER, 0.15), shade_clip=T.rect_path(wx_ + 6, 0, 30, 1080))
    if t >= pk[1]:
        T.arrow(c, [(820, 330), (900, 270), (980, 330)], t, INK, 5, 20, v=(t - pk[1]) / 0.25)
    stamp(c, 900, 470, "不许偷看", t, st, CORAL, 64, -10)
    if t < B(16):
        T.headline(c, "每人自己猜", 110, 200, 96, t, B(15) + 0.05)
    else:
        T.headline(c, "不商量", 110, 200, 96, t, B(16) + 0.05, plate=CORAL)
    push(x, lt, 2 * BAR, 1.04)
    bump(x, t, ("stamp",), 16, 0.02)


# ------------------------------------------------------------------ bar 17: errors in every direction
SPREAD = [(0, 1.0), (125, 0.7), (200, 0.9), (290, 0.6), (40, 0.55), (160, 0.85)]


@shot(B(17), B(18), tin=0.0, tout=0.0, kin="cut", kout="cut")
def spread(c, x, t, lt):
    scene(c, t, POWDER, floor=False)
    cx_, cy_ = 1000, 540
    for r, col in ((330, tint(PAPER, 0.3)), (230, tint(CORAL, 0.5)), (130, tint(PAPER, 0.3))):
        T.shape(c, T.circle_path(cx_, cy_, r), col, t, 4, 80 + r, 0.12)
    T.ox(c, cx_, cy_ + 20, 0.3, t, blink=(T.twos(t) % 23 == 0))
    for k, h in enumerate(window("spread", 17)):
        if t < h:
            continue
        ang, rr = SPREAD[k]
        v = ease_out((t - h) / 0.25)
        ex = cx_ + math.cos(math.radians(ang)) * 380 * rr * v
        ey = cy_ - math.sin(math.radians(ang)) * 300 * rr * v
        T.arrow(c, [(cx_, cy_), (ex, ey)], t, INK, 5, 20, seed=k, v=1.0 if v > 0.95 else v)
        T.slip(c, ex + 40 * math.cos(math.radians(ang)), ey - 30 * math.sin(math.radians(ang)), 1.0,
               GUESSES[k], t, rot=(k * 5 % 7 - 3), seed=k)
    T.headline(c, "错得各不相同", 110, 200, 96, t, B(17) + 0.05)
    push(x, lt, BAR, 1.05)


# ------------------------------------------------------------------ FIG. 2, bars 18-19: Zurich 2011
@shot(B(18), B(20), tin=0.0, tout=0.0, kin="cut", kout="cut")
def zurich(c, x, t, lt):
    scene(c, t, TURQ, horizon=820)
    fig_header(c, t, window("fig", 18)[0], 2, "什么时候会失灵")
    if t < B(19):
        T.script_on(c, "Zürich, 2011", 1180, 300, 84, t, B(18) + 0.3, 0.7)
        for j, h in enumerate(window("pop", 18)):
            px = 260 + j * 280
            if popped(c, h, t, px, 860):
                crowd_member(c, j + 1, px, 760, 0.85, t, arm=0.2, mouth=0, look=0.2)
                c.restore()
        T.tag(c, 1520, 450, "144 个大学生", t, (t - window("pop", 18)[-1]) / 0.25, 40, fill=MUSTARD)
    else:
        bx, by, bw, bh_ = 220, 250, 1100, 420
        T.shape(c, T.rect_path(bx, by, bw, bh_, 14), (0.20, 0.30, 0.26), t, 6, 90, 0.05)
        q1, q2 = "瑞士 2006 年，", "登记了几起谋杀案？"
        ch = window("chalk", 19)
        k = count(ch, t)
        n = int(len(q1 + q2) * (k / len(ch)) + 0.5) if k < len(ch) else len(q1 + q2)
        a1, a2 = q1[:n], q2[:max(0, n - len(q1))]
        T.text(c, a1, bx + 70, by + 160, 80, "sans", (0.96, 0.94, 0.86))
        T.text(c, a2, bx + 70, by + 290, 80, "sans", (0.96, 0.94, 0.86))
        for j, h in enumerate(window("coin", 19)):
            if t < h:
                continue
            u = pop(h, t, 0.25)
            at(c, 1500 + j * 110, 400 - j * 30, u)
            T.shape(c, T.circle_path(0, 0, 60), MUSTARD, t, 4, 95 + j, 0.05)
            T.text(c, "CHF", 0, 12, 34, "slab", INK, "center")
            c.restore()
        T.tag(c, 1560, 560, "猜得越准，奖金越多", t, (t - window("coin", 19)[-1] - 0.1) / 0.25, 36)
        crowd_member(c, 2, 1650, 760, 0.8, t, arm=0.6, look=-0.5, mouth=1)
    push(x, lt, 2 * BAR, 1.04)


# ------------------------------------------------------------------ bars 20-23: two rooms
ROOM_L = np.array([-160, -95, -60, -25, 5, 30, 70, 110, 150, -120, 90, -40])
ROOM_DRIFT = 70                                               # where the influenced room drifts to (illustrative)


@shot(B(20), B(24), tin=0.0, tout=0.0, kin="cut", kout="cut")
def split(c, x, t, lt):
    sp = window("split", 20)
    T.plane(c, t, tint(POWDER, 0.55), None, 1200)
    u = ease_out((t - sp[0]) / 0.3) if t >= sp[0] else 0.0
    c.drawRect(skia.Rect.MakeLTRB(lerp(1920, 960, u), 0, 1920, 1080), paint(tint(CORAL, 0.55)))
    T.ink(c, T.poly([(960, 0), (960, 1080)], False), t, 6, 120, 0.1)
    T.headline(c, "各猜各的", 480, 200, 80, t, sp[1], align="center")
    T.headline(c, "看得见别人", 1440, 200, 80, t, sp[2], align="center", plate=PAPER)
    for j in range(3):                                         # three apart on the left, three huddled on the right
        if t >= sp[1]:
            crowd_member(c, j, 230 + j * 250, 880, 0.42, t, arm=0.3, look=0.3)
        if t >= sp[2]:
            crowd_member(c, j + 3, 1350 + j * 90, 880, 0.42, t, arm=0.3, look=0.5 if j < 2 else -0.5)
    rounds = window("round", 21)
    rk = count(rounds, t)
    ly = 640
    for side, (x0, x1) in enumerate(((100, 860), (1060, 1820))):
        if t < sp[3]:
            break
        numline(c, t, x0, x1, ly, -200, 200, 100, 130 + side, labels=False)
        mid = (x0 + x1) / 2
        conv = 0.0 if side == 0 else min(1.0, rk / 5)
        if side == 1 and rk and rk < 5 and t - rounds[rk - 1] < 0.3:
            conv = lerp((rk - 1) / 5, rk / 5, ease_out((t - rounds[rk - 1]) / 0.3))
        for j, d in enumerate(ROOM_L):
            jit = 6 * math.sin(j * 3.1 + rk * 1.7) if side == 0 else 0.0
            v = lerp(d, ROOM_DRIFT + 0.12 * d, conv) + jit
            px = lerp(x0, x1, (v + 200) / 400)
            c.drawCircle(px, ly - 26 - (j % 3) * 18, 11, paint(MUSTARD if side == 0 else PLUM))
            T.ink(c, T.circle_path(px, ly - 26 - (j % 3) * 18, 11), t, 2.5, 140 + j + side * 20, 0.0)
        if t >= B(21):
            T.text(c, f"第 {max(1, rk)} 轮", mid, 300, 44, "sans", INK, "center", plate=PAPER, t=t, seed=side)
        mh = window("miss", 22)[0]
        if t >= mh:
            truth_mark(c, t, mid, 420, ly - 6, "真值", (t - mh) / 0.25)
        ah = window("arrowh", 22)
        if t >= ah[side]:
            mean = float(np.mean([lerp(d, ROOM_DRIFT + 0.12 * d, conv) for d in ROOM_L]))
            mx = lerp(x0, x1, (mean + 200) / 400)
            c.drawPath(T.poly([(mx - 18, ly + 70), (mx + 18, ly + 70), (mx, ly + 30)]), paint(INK))
            T.text(c, "平均", mx, ly + 120, 36, "sans", INK, "center")
        mt = window("meter", 23)
        if t >= mt[0]:
            k = count(mt, t)
            lvl = 0.35 if side == 0 else 0.35 + 0.6 * k / 8
            last = mt[k - 1]
            if side == 1 and t - last < 0.25:
                lvl = 0.35 + 0.6 * lerp((k - 1) / 8, k / 8, ease_out((t - last) / 0.25))
            gx, gy = x1 - 60, 290
            T.shape(c, T.rect_path(gx - 22, gy, 44, 240, 22), PAPER, t, 3.5, 160 + side, 0.05)
            c.drawRect(skia.Rect.MakeLTRB(gx - 14, gy + 232 - 224 * lvl, gx + 14, gy + 232), paint(CORAL))
            T.text(c, "信心", gx, gy - 20, 34, "sans", INK, "center")
    ah = window("arrowh", 22)
    if ah[2] <= t < B(23):
        T.tag(c, 1230, 470, "没有更准", t, (t - ah[2]) / 0.25, 40, fill=MUSTARD)
    if t >= B(23):
        T.tag(c, 1230, 470, "可信心涨了", t, (t - B(23)) / 0.25, 40, fill=PAPER)
    push(x, lt, 4 * BAR, 1.03)
    bump(x, t, ("round", "meter"), 21)


# ------------------------------------------------------------------ bar 24: one slip copied 787 times
@shot(B(24), B(25), tin=0.0, tout=0.0, kin="cut", kout="cut")
def copy(c, x, t, lt):
    scene(c, t, MUSTARD, horizon=820)
    T.sunburst(c, 960, 520, 1300, PAPER, 0.18, t * 0.05)
    ch = window("copy", 24)
    k = count(ch, t)
    for j in range(k, 0, -1):
        T.slip(c, 960 + j * 22 - k * 11, 520 - j * 12 + k * 6, 2.6, "1150", t, rot=-3 + j * 1.2, seed=j)
    T.slip(c, 960 - k * 11, 520 + k * 6, 2.6, "1150", t, rot=-3, seed=0)
    T.text(c, f"×{[1, 2, 4, 9, 18, 40, 80, 150, 260, 400, 600, 787][k - 1] if k else 1}", 1500, 760, 96, "slab",
           INK, "center", plate=CORAL, t=t, seed=3)
    stamp(c, 520, 720, "抄了 787 遍", t, window("stamp", 24)[0], shade_of(CORAL, 0.3), 56, -8)
    T.headline(c, "一张，抄了 787 遍", 110, 200, 90, t, B(24) + 0.05)
    push(x, lt, BAR, 1.05)


# ------------------------------------------------------------------ bar 25: different, not many
@shot(B(25), B(26), tin=0.0, tout=0.0, kin="cut", kout="cut")
def law2(c, x, t, lt):
    scene(c, t, PLUM, floor=False)
    lh = window("law", 25)[0]
    T.sunburst(c, 960, 540, 1400, PAPER, 0.18 + 0.2 * math.exp(-max(0, t - lh) / 0.4), t * 0.07)
    cols = [CORAL, MUSTARD, TURQ, OLIVE, POWDER, WHITE, CORAL, MUSTARD]
    for j in range(8):
        a_ = j * math.pi / 4 + t * 0.15
        T.slip(c, 960 + 560 * math.cos(a_), 530 + 300 * math.sin(a_), 1.3, GUESSES[j], t, rot=j * 9 - 30, seed=j,
               fill=tint(cols[j], 0.4))
    T.headline(c, "各不相同", 960, 600, 170, t, lh - 0.001, align="center", plate=CORAL, col=INK, stagger=0.04)
    push(x, lt, BAR, 1.04)
    bump(x, t, ("law", "pulse"), 25, 0.015)


# ------------------------------------------------------------------ FIG. 3, bars 26-28: the machine and its 40 answers
ANSWERS = ["18", "18", "26", "18", "9", "18", "18", "16", "18", "18", "26", "18", "18", "9", "18", "18"]
WRONG = [j for j, a in enumerate(ANSWERS) if a != "18"]


def machine(c, t, x_, y_, s, lights=0, slot=0.0):
    """A 1950s computing cabinet: two tape reels, a row of lamps, a card slot."""
    at(c, x_, y_, s)
    T.shape(c, T.rect_path(-200, -280, 400, 560, 18), tint(TURQ, 0.15), t, 5, 300, 0.1,
            shade=shade_of(TURQ, 0.1), shade_clip=T.rect_path(110, -300, 120, 600))
    for k, rx in enumerate((-90, 90)):
        rot = t * (3 + k) * 60
        T.shape(c, T.circle_path(rx, -160, 70), PAPER, t, 4, 301 + k, 0.05)
        at(c, rx, -160, 1.0, rot)
        for j in range(3):
            a_ = j * 2 * math.pi / 3
            c.drawCircle(38 * math.cos(a_), 38 * math.sin(a_), 14, paint(INK))
        c.restore()
        c.drawCircle(rx, -160, 10, paint(INK))
    for j in range(6):
        on = (lights >> j) & 1
        c.drawCircle(-125 + j * 50, -30, 16, paint(CORAL if on else shade_of(PAPER, 0.3)))
        T.ink(c, T.circle_path(-125 + j * 50, -30, 16), t, 2.5, 310 + j, 0.0)
    T.shape(c, T.rect_path(-150, 60, 300, 40, 8), INK, t, 0, 320, 0, line=False)
    T.shape(c, T.rect_path(-150, 150, 300, 90, 10), tint(MUSTARD, 0.3), t, 3.5, 321, 0.1)
    T.text(c, "AI", 0, 215, 64, "slab", INK, "center")
    c.restore()


def card_pos(j):
    return 1000 + (j % 4) * 200, 340 + (j // 4) * 140


@shot(B(26), B(29), tin=0.0, tout=0.0, kin="cut", kout="cut")
def machine_shot(c, x, t, lt):
    scene(c, t, POWDER, horizon=860)
    fig_header(c, t, window("fig", 26)[0], 3, "AI 也在用")
    bp = window("beep", 26)
    lights = (count(bp, t) * 0b010101 + int(T.twos(t) / 3)) % 64 if t >= bp[0] else 0
    machine(c, t, 480, 580, 1.0, lights)
    if bp[0] <= t < B(27):
        at(c, 1300, 520, back_out((t - bp[0]) / 0.25), -3)
        T.shape(c, T.rect_path(-260, -150, 520, 300, 12), PAPER, t, 4, 340, 0.08)
        T.text(c, "数学应用题", 0, -40, 60, "sans", INK, "center")
        T.text(c, "答案 = ?", 0, 70, 64, "sans", CORAL, "center")
        c.restore()
    cards = window("card", 27)
    for j, h in enumerate(cards):
        if t < h:
            continue
        v = ease_out((t - h) / 0.3)
        tx_, ty_ = card_pos(j)
        px, py = lerp(630, tx_, v), lerp(660, ty_, v) - 80 * math.sin(math.pi * v)
        T.slip(c, px, py, 1.25, ANSWERS[j], t, rot=(j * 13 % 9 - 4) * (1 - 0.5 * v), seed=j)
    if t >= cards[0]:
        T.tag(c, 1560, 870, f"第 {min(40, count(cards, t) * 40 // 16)} 遍 / 40", t, (t - cards[0]) / 0.25, 36,
              fill=MUSTARD)
    ph = window("path", 28)
    for j, h in enumerate(ph):
        if t < h:
            continue
        wj = WRONG[j]
        px, py = card_pos(wj)
        u = clamp((t - h) / 0.18)
        k = 34
        c.drawLine(px - k, py - k * 0.7, px - k + 2 * k * u, py - k * 0.7 + 1.4 * k * u, paint(CORAL, 1, 9))
        if u >= 1:
            v2 = clamp((t - h - 0.18) / 0.15)
            c.drawLine(px + k, py - k * 0.7, px + k - 2 * k * v2, py - k * 0.7 + 1.4 * k * v2, paint(CORAL, 1, 9))
    if t >= B(28):
        T.headline(c, "有几遍会算错", 1000, 250, 70, t, B(28) + 0.05, plate=CORAL)
    elif t >= B(27):
        T.headline(c, "同一道题，做 40 遍", 1000, 250, 70, t, B(27) + 0.05)
    push(x, lt, 3 * BAR, 1.04)
    bump(x, t, ("beep", "path"), 26)


# ------------------------------------------------------------------ bar 29: count the votes
VOTE_COLS = ["9", "16", "18", "26"]


@shot(B(29), B(30), tin=0.0, tout=0.0, kin="cut", kout="cut")
def vote(c, x, t, lt):
    scene(c, t, MUSTARD, horizon=860)
    T.sunburst(c, 960, 860, 1300, PAPER, 0.14, t * 0.04)
    sh = window("sort", 29)
    n = count(sh, t)
    placed = n * 2
    heights = {k: 0 for k in VOTE_COLS}
    for j, a_ in enumerate(ANSWERS):
        ci = VOTE_COLS.index(a_)
        hx = 520 + ci * 300
        if j < placed:
            hy = 830 - heights[a_] * 52
            heights[a_] += 1
            src = card_pos(j)
            hh = sh[j // 2]
            v = ease_out((t - hh) / 0.3)
            T.slip(c, lerp(src[0] - 200, hx, v), lerp(src[1], hy, v), 1.1, a_, t, rot=(j * 7 % 5 - 2) * (1 - v),
                   seed=j)
        else:
            px, py = card_pos(j)
            T.slip(c, px - 200, py, 1.1, a_, t, rot=(j * 13 % 9 - 4), seed=j, a=0.9)
    for ci, a_ in enumerate(VOTE_COLS):
        T.text(c, a_, 520 + ci * 300, 920, 44, "slab", INK, "center", plate=PAPER, t=t, seed=ci)
    if n >= 8 or t >= sh[-1]:
        T.medallion(c, 1120, 160, 80, "18", t, (t - sh[-1]) / 0.25, fill=CORAL, size=72)
    T.headline(c, "数一数，哪个最多", 110, 200, 90, t, B(29) + 0.05)
    push(x, lt, BAR, 1.04)
    bump(x, t, ("sort",), 29)


# ------------------------------------------------------------------ bars 30-31: self-consistency, 56.5 -> 74.4
@shot(B(30), B(32), tin=0.0, tout=0.0, kin="cut", kout="cut")
def sc(c, x, t, lt):
    scene(c, t, TURQ, horizon=860)
    ty = window("type", 30)
    if t < B(31):
        T.sunburst(c, 960, 480, 1300, PAPER, 0.16, t * 0.05)
        T.headline(c, "自洽性", 960, 470, 200, t, ty[0], align="center", plate=CORAL, stagger=BEAT * 0.25)
        word = "Self-Consistency"
        k = count(ty, t)
        T.text(c, word[:int(len(word) * k / len(ty) + 0.5)], 960, 600, 64, "script", INK, "center", plate=MUSTARD,
               t=t, seed=4)
        stamp(c, 1480, 760, "谷歌 · 2022", t, window("stamp", 30)[0], CORAL, 54, -8)
    else:
        gr = window("grow", 31)
        base, top = 760, 280
        for j, (lab, v, col) in enumerate((("一次作答", 56.5, POWDER), ("40 遍投票", 74.4, CORAL))):
            bx = 640 + j * 520
            if t < gr[j]:
                continue
            u = ease_out((t - gr[j]) / 0.35)
            hgt = (base - top) * v / 80 * u
            T.shape(c, T.rect_path(bx - 120, base - hgt, 240, hgt, 6), col, t, 4.5, 330 + j, 0.08)
            T.text(c, f"{v * u:.1f}%", bx, base - hgt - 30, 72, "slab", INK, "center", plate=PAPER, t=t, seed=j)
            T.text(c, lab, bx, base + 70, 42, "sans", INK, "center")
        burst(c, 1550, 330, 130, "+17.9", t, window("burst", 31)[0], MUSTARD, 58)
        T.text(c, "PaLM 540B · GSM8K 小学数学题", 112, 270, 32, "sans", INK)
        T.headline(c, "准确率", 110, 200, 90, t, B(31) + 0.05)
    push(x, lt, 2 * BAR, 1.04)
    bump(x, t, ("stamp", "grow", "burst"), 30)


# ------------------------------------------------------------------ bars 32-33: separate roads, or one copied
def road(j, n=40):
    sx_, sy_, ex_, ey_ = 300, 540, 1600, 300 + j * 160
    pts = []
    for i in range(n + 1):
        u = i / n
        wob = math.sin(u * math.pi * (2 + j)) * 90 * math.sin(u * math.pi) * (1 if j % 2 else -1)
        pts.append((lerp(sx_, ex_, u), lerp(sy_, ey_, u ** 1.3) + wob))
    return T.poly(pts, False)


@shot(B(32), B(34), tin=0.0, tout=0.0, kin="cut", kout="cut")
def paths(c, x, t, lt):
    scene(c, t, OLIVE, floor=False)
    ph = window("path", 32)
    cp = window("copy", 33)
    nc = count(cp, t)
    T.shape(c, T.circle_path(300, 540, 70), PAPER, t, 4, 400, 0.05)
    T.text(c, "题", 300, 560, 60, "sans", INK, "center")
    cols = [CORAL, MUSTARD, TURQ, POWDER]
    ends = ["18", "18", "26", "18"]
    for j, h in enumerate(ph):
        if t < h:
            continue
        p = road(0 if j < nc else j)
        cm = skia.PathMeasure(p, False)
        L = cm.getLength()
        seg = skia.Path()
        cm.getSegment(0, L * clamp((t - h) / 0.4), seg, True)
        c.save()
        if j < nc:
            c.translate(j * 5, j * 5)
        c.drawPath(seg, paint(cols[j], 1, 12))
        T.ink(c, seg, t, 3, 410 + j, 0.2)
        c.restore()
        if t - h > 0.4:
            ey = 300 + (0 if j < nc else j) * 160
            T.slip(c, 1680, ey, 1.2, ends[0] if j < nc else ends[j], t, seed=j)
    if t < B(33):
        T.headline(c, "各走各的路", 110, 200, 96, t, B(32) + 0.05)
    else:
        T.headline(c, "照抄 = 一票", 110, 200, 96, t, B(33) + 0.05, plate=CORAL)
        T.tag(c, 1300, 880, "投 40 票，也只算一票", t, (t - cp[-1]) / 0.25, 38, fill=MUSTARD)
    push(x, lt, 2 * BAR, 1.04)


# ------------------------------------------------------------------ FIG. 4, bars 34-36: the meeting
TABLE = [330, 640, 950, 1260, 1570]
SAY = ["1500!", "1500", "1480", "1500", "1520"]


def bubble(c, x_, y_, s, t, u, size=46, fill=PAPER, seed=0):
    if u <= 0:
        return
    b = back_out(u)
    f = T.font(size, "slab")
    w = f.measureText(s) + 60
    at(c, x_, y_, b)
    p = T.rect_path(-w / 2, -50, w, 90, 40)
    tail = T.poly([(-10, 36), (16, 36), (-24, 80)])
    p2 = skia.Op(p, tail, skia.PathOp.kUnion_PathOp) or p
    T.shape(c, p2, fill, t, 3.5, 500 + seed, 0.08)
    c.drawString(s, -f.measureText(s) / 2, size * 0.36 - 5, f, paint(INK))
    c.restore()


@shot(B(34), B(37), tin=0.0, tout=0.0, kin="cut", kout="cut")
def meeting(c, x, t, lt):
    scene(c, t, CORAL, horizon=780)
    fig_header(c, t, window("fig", 34)[0], 4, "回到你身上")
    ph = window("pop", 34)
    talks = window("talk", 35)
    nods = window("nod", 35, 37)
    for j, px in enumerate(TABLE):
        if t < ph[j]:
            continue
        bob = 0.0
        if j > 0:
            for h in nods:
                if 0 <= t - h < 0.3:
                    bob = 10 * math.sin(math.pi * (t - h) / 0.3)
        c.save()
        c.translate(0, bob)
        crowd_member(c, j if j else 6, px, 620, 0.95, t, arm=0.75 if (j == 0 and t >= talks[0]) else 0.1,
                     mouth=1 if (j == 0 and t >= talks[0]) else 0, look=-0.4 if j else 0.3)
        c.restore()
    T.shape(c, T.rect_path(170, 700, 1580, 70, 10), shade_of(tint(OLIVE, 0.2), 0.3), t, 4.5, 520, 0.1)
    if t >= talks[0]:
        bubble(c, TABLE[0] + 40, 330, SAY[0], t, (t - talks[0]) / 0.25, 64, MUSTARD, 0)
    if t >= talks[1]:
        T.arrow(c, [(TABLE[0] + 140, 300), (800, 230), (1300, 300)], t, INK, 5, 22, v=(t - talks[1]) / 0.3)
    nb = window("nod", 36)
    for j in range(1, 5):
        h = nb[(j - 1) * 2] if len(nb) > (j - 1) * 2 else 1e9
        bubble(c, TABLE[j] + 40, 375, SAY[j], t, (t - h) / 0.25 if t >= h else 0, 44, PAPER, j)
    if t >= B(36):
        T.headline(c, "越说越像", 1200, 200, 90, t, B(36) + 0.05, plate=CORAL)
    elif t >= B(35):
        T.headline(c, "第一个开口的人", 900, 200, 80, t, B(35) + 0.05)
    push(x, lt, 3 * BAR, 1.03)
    bump(x, t, ("talk",), 35)


# ------------------------------------------------------------------ bar 37: write it down first
@shot(B(37), B(38), tin=0.0, tout=0.0, kin="cut", kout="cut")
def write(c, x, t, lt):
    scene(c, t, MUSTARD, horizon=780)
    wr = window("write", 37)
    vals = ["1500", "1150", "1320", "1210", "1080"]
    for j, px in enumerate(TABLE):
        crowd_member(c, j if j else 6, px, 620, 0.95, t, arm=0.35 + 0.15 * math.sin(t * 9 + j), look=0.4)
    T.shape(c, T.rect_path(170, 700, 1580, 70, 10), shade_of(tint(OLIVE, 0.2), 0.3), t, 4.5, 520, 0.1)
    for j, px in enumerate(TABLE):
        h = wr[j]
        if t < h:
            continue
        T.slip(c, px + 50, 650, 1.1, "", t, rot=-6 + j * 3, seed=j)
        reveal = wr[5] if len(wr) > 5 else 1e9
        if t >= reveal:
            v = ease_out((t - reveal - j * 0.05) / 0.25)
            if v > 0:
                T.slip(c, px + 50, lerp(650, 290, v), 1.4, vals[j], t, rot=(-6 + j * 3) * (1 - v), seed=j)
    if t >= wr[6]:
        T.tag(c, 960, 200 + 0, "先写，再说", t, (t - wr[6]) / 0.25, 52, fill=PAPER)
    T.headline(c, "先写下来", 110, 200, 96, t, B(37) + 0.05)
    push(x, lt, BAR, 1.04)


# ------------------------------------------------------------------ bars 38-41: the crowd within
@shot(B(38), B(42), tin=0.0, tout=0.0, kin="cut", kout="cut")
def twin(c, x, t, lt):
    scene(c, t, POWDER, horizon=800)
    tw = window("twin", 38)
    gl = window("glow", 41)
    gap = ease_out((t - tw[0]) / 0.4) if t >= tw[0] else 0.0
    far = clamp((t - B(41)) / BAR)
    lx, rx = 960 - 300 * gap - 120 * far, 960 + 300 * gap + 120 * far
    crowd_member(c, 3, lx, 660, 1.15, t, arm=0.5, look=0.3)
    if gap > 0:
        T.person(c, rx, 660, 1.15, t, body=mix(PLUM, TURQ, far), bald=True, arm=0.5, look=-0.3,
                 a=lerp(0.5, 1.0, clamp((t - tw[1]) / 0.3)) if t >= tw[1] else 0.5, seed=3,
                 blink=(T.twos(t) % 29 == 0))
    if t >= tw[2]:
        T.tag(c, lx, 860, "你", t, (t - tw[2]) / 0.25, 40)
    if t >= tw[3]:
        T.tag(c, rx, 860, "三周后的你", t, (t - tw[3]) / 0.25, 40)
    pg = window("page", 39)
    if B(39) <= t < B(41):
        k = count(pg, t)
        day = [1, 3, 6, 9, 12, 15, 18, 21][k - 1] if k else 1
        at(c, 960, 360, 1.0, -3)
        T.shape(c, T.rect_path(-120, -130, 240, 260, 10), PAPER, t, 4, 600, 0.05)
        c.drawRect(skia.Rect.MakeLTRB(-120, -130, 120, -70), paint(CORAL))
        T.text(c, "DAY", 0, -88, 34, "slab", PAPER, "center")
        T.text(c, str(day), 0, 80, 130, "slab", INK, "center")
        c.restore()
    mg = window("merge", 40)
    if B(40) <= t < B(41):
        for j, (v, sx_) in enumerate((("1100", lx), ("1260", rx))):
            h = mg[j]
            m = ease_out((t - mg[2]) / 0.3) if t >= mg[2] else 0.0
            if t >= h:
                T.slip(c, lerp(sx_, 960, m), lerp(400, 640, m) if t < B(41) else 400, 1.5, v, t, rot=(-6 if j else 6),
                       seed=j, a=1 - m if t < B(41) else 1.0)
        if t >= mg[2] and t < B(41):
            T.slip(c, 960, 640, 2.0, "1180", t, rot=0, seed=9, fill=(1.0, 0.97, 0.80),
                   a=clamp((t - mg[2] - 0.2) / 0.15))
        if t >= mg[3] and t < B(41):
            T.tag(c, 1480, 260, "平均：更接近 1198", t, (t - mg[3]) / 0.25, 40, fill=MUSTARD)
    if t >= B(41):
        for j, h in enumerate(gl):
            if t >= h:
                T.sparkle(c, lerp(lx, rx, (j + 1) / 5), 300 + 20 * math.sin(j), 22, t * 3, CORAL)
    head = "把自己当成一群人" if t < B(39) else ("隔三周，再猜一次" if t < B(40) else
                                        ("两次的平均" if t < B(41) else "越像两个人"))
    hb = B(38) if t < B(39) else (B(39) if t < B(40) else (B(40) if t < B(41) else B(41)))
    T.headline(c, head, 110, 200, 84, t, hb + 0.05)
    push(x, lt, 4 * BAR, 1.03)
    bump(x, t, ("twin", "merge"), 38)


# ------------------------------------------------------------------ bars 42-45: back to the field
@shot(B(42), B(43), tin=0.0, tout=0.0, kin="cut", kout="cut")
def field(c, x, t, lt):
    fair_scene(c, x, t, lt, 42, "回到那片草地")


@shot(B(43), B(45), tin=0.0, tout=0.0, kin="cut", kout="cut")
def wrongs(c, x, t, lt):
    scene(c, t, MUSTARD, horizon=860)
    xm = window("xmark", 43)
    am = window("aim", 44)
    ox_x, ox_y = 960, 560
    if t >= B(44):
        T.sunburst(c, ox_x, ox_y, 1300, PAPER, 0.12 + 0.03 * count(am, t), t * 0.06)
        T.ox(c, ox_x, ox_y + 40, 0.8, t, blink=(T.twos(t) % 23 == 0), ribbon=True)
    for j in range(24):
        ang = j * 2 * math.pi / 24
        px, py = ox_x + 760 * math.cos(ang), ox_y - 20 + 340 * math.sin(ang)
        if t >= B(44):
            k = j % 8
            if t >= am[k]:
                v = clamp((t - am[k]) / 0.35)
                T.arrow(c, [(px, py), (lerp(px, ox_x, 0.55), lerp(py, ox_y, 0.55))], t, INK, 4, 16, seed=j,
                        v=v)
        T.slip(c, px, py, 1.0, str(int(DOTS[j * 7])), t, rot=(j * 11 % 13 - 6), seed=j)
        if t >= xm[j % 8] and j != 5:
            u = clamp((t - xm[j % 8]) / 0.12)
            c.drawLine(px - 30, py - 22, px - 30 + 60 * u, py - 22 + 44 * u, paint(CORAL, 1, 7))
            c.drawLine(px + 30, py - 22, px + 30 - 60 * u, py - 22 + 44 * u, paint(CORAL, 1, 7))
    if t < B(44):
        T.headline(c, "几乎都是错的", 960, 600, 120, t, B(43) + 0.05, align="center", plate=CORAL)
    push(x, lt, 2 * BAR, 1.05)
    bump(x, t, ("xmark", "aim"), 43, 0.008)


@shot(B(45), B(46), tin=0.0, tout=0.0, kin="cut", kout="cut")
def scale2(c, x, t, lt):
    scale_scene(c, x, t, lt, 45, "只差 9 磅")


# ------------------------------------------------------------------ bars 46-49: the closing lines
@shot(B(46), B(50), tin=0.0, tout=0.0, kin="cut", kout="cut")
def gold(c, x, t, lt):
    scene(c, t, PLUM, horizon=860)
    T.sunburst(c, 520, 620, 1300, PAPER, 0.14, t * 0.03)
    gh = window("gold", 46, 50)
    hand = clamp((t - B(48)) / BAR)
    crowd_member(c, 5, 520, 700, 1.3, t, arm=0.35 + 0.45 * hand, hold="" if t < B(49) else "?", look=0.3,
                 mouth=2 if t >= B(49) else 0)
    for i, (b, s) in enumerate(GOLD):
        if t < B(b):
            continue
        pair = i // 2
        if pair != (0 if t < B(48) else 1):
            continue
        y = 430 + (i % 2) * 150
        hi = (i == 3)
        chars = s.replace("你自己", "{你自己}") if hi else s
        xx = 860
        for ch, h_ in T.parse_marks(chars):
            T.headline(c, ch, xx, y, 96, t, B(b) + 0.05, plate=CORAL if h_ else MUSTARD, col=INK, stagger=0)
            xx += T.font(96, "title").measureText(ch)
    push(x, lt, 4 * BAR, 1.03)
    pulse(x, t)


# ------------------------------------------------------------------ bars 50-54: end title, references
@shot(B(50), B(52), tin=0.0, tout=0.0, kin="cut", kout="cut")
def end_title(c, x, t, lt):
    title(c, x, t, lt, 50)


@shot(B(52), B(55), tin=0.0, tout=0.0, kin="cut", kout="cut")
def refs(c, x, t, lt):
    scene(c, t, TURQ, horizon=900)
    T.headline(c, "参考", 110, 200, 90, t, B(52) + 0.05)
    rh = window("ref", 52, 55)
    for i, line_ in enumerate(REFS):
        h = rh[i * 2] if i * 2 < len(rh) else rh[-1]
        if t < h:
            continue
        v = ease_out((t - h) / 0.3)
        T.text(c, line_, 130 + (1 - v) * 40, 330 + i * 70, 30, "sans", INK, a=v)
    T.ox(c, 1560, 760, 0.6, t, look=0.2 * math.sin(t), blink=(T.twos(t) % 23 == 0), tail=0.5)
    for j in range(6):
        T.slip(c, 1100 + j * 60, 860 - (j % 2) * 20, 0.8, GUESSES[j], t, rot=j * 9 - 20, seed=j)
    T.headline(c, "一帧一理 · 07", 130, 780, 60, t, B(53), plate=CORAL)
    push(x, lt, 3 * BAR, 1.03)


# ------------------------------------------------------------------ the page
CAPS = captions() + [(t_of(8, 3) + 0.1, B(10) - 0.2, TITLE_Q), (t_of(50, 3) + 0.1, B(52) - 0.2, TITLE_Q)]
WIPE_COL = [CORAL, TURQ, MUSTARD, OLIVE, PLUM, CORAL, INK]
WIPES = [(b, bt_, kind, WIPE_COL[k]) for k, (b, bt_, kind) in enumerate(WIPES_)]


def setup():
    T.paper_image(W, H)


def frame(fi):
    t = fi / tl.fps
    surf = skia.Surface(W, H)
    c = surf.getCanvas()
    c.clear(skia.Color4f(1, 1, 1, 1))
    x = Ctx(t)
    x.fx, x.fy, x.sx, x.sy = W / 2, H / 2, 0.0, 0.0
    pic = tl.record(x, t)
    c.save()
    c.translate(W / 2 + x.sx, H / 2 + x.sy)
    c.scale(x.zoom, x.zoom)
    c.translate(-x.fx, -x.fy)
    c.drawPicture(pic)
    c.restore()
    for t0, t1, s in CAPS:
        T.caption_card(c, s, t, t0, t1)
    for b, bt_, kind, col in WIPES:
        wh = t_of(b, bt_)
        if wh - 0.05 <= t <= B(b + 1) + (B(b + 1) - wh):
            u = (t - wh) / ((B(b + 1) - wh) * 2)
            if kind == "block":
                T.block_wipe(c, u, col)
            else:
                T.iris(c, u, W / 2, H / 2, col)
    c.drawImage(T.paper_image(W, H), 0, 0, skia.SamplingOptions(), skia.Paint(BlendMode=skia.BlendMode.kMultiply))
    T.grain(c, t)
    if x.flash > 0:
        c.drawPaint(paint(WHITE, min(0.5, x.flash)))
    fade = smooth(t / 0.05) * smooth((tl.dur - t) / 0.6)
    if fade < 0.999:
        c.drawPaint(paint(INK, 1 - fade))
    return post.finish(post.to_array(surf).astype(np.int16)).astype(np.uint8).tobytes()


if __name__ == "__main__":
    run(frame, setup, tl.dur, tl.fps, OUT, f"{TITLE}.mp4")
