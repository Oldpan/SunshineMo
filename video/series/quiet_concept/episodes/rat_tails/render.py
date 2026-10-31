"""老鼠尾巴（古德哈特定律 · Goodhart's law） — 一帧一理 episode 6 as a halftone case file, cold-open test.

  ./fonts.sh                                           # once per machine
  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 1 3.4 6 8 10.5 13 15.5 18.5 20 23
  python3 render.py                                    # 1920x1080 @ 60 fps

The file is read out one exhibit at a time: the sewer, the bounty notice, the tray of tails and a report that
says it worked, the tailless rat, the loop (catch, cut, release, breed), the rat farm, the twist, the title.
Nothing ever holds still and the score never drops to silence (series rule).
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
from core.gfx import lerp, smooth, ease_io  # noqa: E402
from core import post  # noqa: E402
import dossier as D  # noqa: E402
from dossier import INK, OVER, HI, RED, PAPER, WHITE, paint, clamp, back_out, ease_out  # noqa: E402
from cues import (BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, QUOTE, GOLD, REFS, WIPES_, captions,  # noqa: E402
                  hit_times, t_of)  # noqa: E402

W, H = 1920, 1080
tl = Timeline(bpm=BPM, bars=BARS, sections=SECTIONS, hard_cuts=True)
B, shot, BAR, BEAT = tl.B, tl.shot, tl.bar, tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))


def window(name, lo, hi):
    return [h for h in hit_times(name) if B(lo) - 1e-6 <= h < B(hi) - 1e-6]


def since(name, t, lo=0):
    ts = [h for h in hit_times(name) if B(lo) - 1e-6 <= h <= t + 1e-6]
    return t - ts[-1] if ts else 1e9


def pop(h, t, dur=0.38):
    return back_out((t - h) / dur) if t >= h else 0.0


def shake(x, t, names, lo, amp=14, tau=0.18):
    s = min(since(n, t, lo) for n in names)
    if s < 0.6:
        k = amp * math.exp(-s / tau) * (1 - s / 0.6) ** 2
        x.sx += k * math.sin(s * 71)
        x.sy += k * math.cos(s * 53)


def push(x, lt, dur, z1=1.05):
    x.zoom = lerp(1.0, z1, smooth(lt / dur))


def beat_pulse(x, t):
    x.zoom *= 1 + 0.006 * S.pulse("kick", t, 0.12)


HUD = {}


def hud(c, t, ex, dark=False):
    """Recorded per shot, drawn by frame() in screen space so the camera never pushes it off the edge."""
    HUD["ex"], HUD["dark"] = ex, dark


# ------------------------------------------------------------------ bar 0: the sewer, night
@shot(0, B(1), tin=0.0, tout=0.0, kin="cut", kout="cut")
def sewer(c, x, t, lt, b0=0):
    c.drawRect(skia.Rect.MakeWH(W, H), paint(INK))
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 420, 0.55), OVER, step=24, angle=30, mult=False)
    # the sewer mouth: a black tunnel inside a ring of bricks, water at the bottom
    c.save()
    c.translate(60, 70)
    mouth = skia.Path()
    mouth.addArc(skia.Rect.MakeXYWH(560, 300, 840, 760), 180, 180)
    mouth.close()
    c.drawPath(mouth, paint((0.04, 0.05, 0.10)))
    D.halftone(c, (560, 300, 1400, 680), D.radial(980, 760, 60, 520, 0.0, 0.32), OVER, step=18, angle=60,
               mult=False, clip=mouth)
    for rr, wd in ((420, 10), (500, 10)):
        ring = skia.Path()
        ring.addArc(skia.Rect.MakeXYWH(980 - rr, 680 - rr * 0.905, 2 * rr, 2 * rr * 0.905), 180, 180)
        c.drawPath(ring, paint(PAPER, 0.9, wd, boil=D.boil_seed(t)))
    for k in range(1, 10):
        ang = math.radians(180 + k * 18)
        x0, y0 = 980 + 420 * math.cos(ang), 680 + 380 * math.sin(ang)
        x1, y1 = 980 + 500 * math.cos(ang), 680 + 452 * math.sin(ang)
        c.drawLine(x0, y0, x1, y1, paint(PAPER, 0.7, 6))
    c.drawLine(380, 680, 1580, 680, paint(PAPER, 0.8, 8))
    for k in range(5):                                            # ripples on the water
        wx = 640 + k * 150 + 30 * math.sin(t * 2 + k)
        c.drawLine(wx, 650 + (k % 2) * 12, wx + 70, 650 + (k % 2) * 12, paint(OVER, 0.9, 5))
    c.restore()
    # eyes: one pair per eighth, then they blink
    r = np.random.default_rng(4)
    spots = [(lerp(720, 1360, (k + r.uniform(0.1, 0.9)) / 8), r.uniform(500, 680)) for k in range(8)]
    for k, h in enumerate(window("eyes", b0, b0 + 1)):
        if t < h:
            continue
        ex, ey = spots[k]
        u = pop(h, t, 0.25)
        blink = (int((t + k * 0.37) * 3) % 7 == 0)
        for dx in (-14, 14):
            if blink:
                c.drawLine(ex + dx - 7, ey, ex + dx + 7, ey, paint(HI, 1, 4))
            else:
                c.drawCircle(ex + dx, ey, 11 * u, paint(HI))
                c.drawCircle(ex + dx + 3, ey - 4, 3.5 * u, paint(WHITE))
    D.headline(c, "1902 · 河内", 110, 250, 120, t, B(b0) + 0.05, col=PAPER, shadow=RED)
    hud(c, t, "INTRO", dark=True)
    push(x, lt, BAR, 1.06)
    x.fy = 560


# ------------------------------------------------------------------ bar 1: the bounty notice
@shot(B(1), B(2), tin=0.0, tout=0.0, kin="cut", kout="cut")
def bounty(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 300, 0.8), OVER, step=22, angle=15)
    nh = window("notice", 1, 2)[0]
    u = pop(nh, t, 0.4)
    c.save()
    c.translate(0, (1 - u) * 700)
    c.rotate(-2.5)
    card = skia.Rect.MakeXYWH(300, 180, 1320, 700)
    c.drawRect(card.makeOffset(14, 14), paint(OVER, 0.9, mult=True))
    c.drawRect(card, paint(PAPER))
    c.drawRect(card, paint(INK, 1, 8))
    c.drawRect(card.makeInset(22, 22), paint(INK, 1, 3))
    D.headline(c, "悬赏", 380, 330, 110, t, nh + 0.05, col=RED, kind="serif")
    f = D.font(28, "mono")
    c.drawString("AVIS · PRIME À LA DESTRUCTION DES RATS", 640, 300, f, paint(INK, 0.8))
    hc = window("hchar", 1, 2)[0]
    D.headline(c, "交一条尾巴", 380, 560, 120, t, hc, stagger=0.075, hi_idx=(3, 4))
    D.headline(c, "＝ 一分钱", 380, 720, 120, t, hc + 0.4, stagger=0.075)
    D.tail_icon(c, 1250, 500, 1.6 * pop(hc + 0.2, t), 1.0, t, -10)
    ch = window("coin", 1, 2)[0]
    if t >= ch:
        s = t - ch
        y = lerp(-200, 690, min(1, (s / 0.25) ** 2)) - (40 * math.exp(-s * 6) * abs(math.sin(s * 14)) if s > 0.25 else 0)
        D.coin(c, 1300, y, 90)
    c.restore()
    hud(c, t, "EXHIBIT 01")
    push(x, lt, BAR, 1.04)
    shake(x, t, ("coin",), 1, 10)


# ------------------------------------------------------------------ bars 2-3: the tray of tails, the report
TAILS = [(np.random.default_rng(k).uniform(-180, 180), np.random.default_rng(k + 50).uniform(-40, 30),
          np.random.default_rng(k + 99).uniform(-50, 50)) for k in range(16)]


@shot(B(2), B(4), tin=0.0, tout=0.0, kin="cut", kout="cut")
def tally(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.ramp(200, 1080, 0.0, 0.5), OVER, step=22, angle=15)
    D.headline(c, "上交的尾巴", 110, 250, 110, t, B(2) + 0.05)
    # the tray
    tx, ty = 520, 760
    tray = skia.Path()
    tray.moveTo(tx - 300, ty - 60)
    tray.lineTo(tx - 260, ty + 60)
    tray.lineTo(tx + 260, ty + 60)
    tray.lineTo(tx + 300, ty - 60)
    c.drawPath(tray, paint(PAPER))
    D.halftone(c, (tx - 300, ty - 60, tx + 300, ty + 60), lambda X, Y: np.full_like(X, 0.35), INK, step=14, angle=45,
               clip=tray)
    th = window("tail", 2, 4)
    for k, h in enumerate(th):
        if t < h:
            continue
        s = t - h
        dx, dy, rot = TAILS[k]
        y = lerp(380, ty - 40 + dy * 0.6 - (k // 6) * 18, min(1, (s / 0.22) ** 2))
        D.tail_icon(c, tx + dx, y, 1.35, 1.0, t, rot + (1 - min(1, s / 0.22)) * 90)
    c.drawPath(tray, paint(INK, 1, 8, boil=D.boil_seed(t)))
    n = sum(1 for h in th if t >= h)
    f = D.font(130, "num")
    s = f"{n:02d}"
    cx0, cy0 = 930 - f.measureText(s) / 2, ty + 50
    c.drawString(s, cx0 + 8, cy0 + 8, f, paint(OVER, 0.9, mult=True))
    c.drawString(s, cx0, cy0, f, paint(HI))
    c.drawString(s, cx0, cy0, f, paint(INK, 1, 4))
    # the report chart: a line that climbs with every tail
    gx0, gy0, gx1, gy1 = 1040, 360, 1780, 860
    c.drawLine(gx0, gy1, gx1, gy1, paint(INK, 1, 6))
    c.drawLine(gx0, gy1, gx0, gy0, paint(INK, 1, 6))
    f2 = D.font(30, "sans")
    c.drawString("每日上交 · 示意", gx0 + 20, gy0 - 20, f2, paint(INK))
    pts = [(gx0, gy1 - 20)]
    for k in range(n):
        v = (k + 1) / 16
        pts.append((gx0 + v * (gx1 - gx0 - 60), gy1 - 20 - (gy1 - gy0 - 80) * v ** 1.6))
    if len(pts) > 1:
        area = skia.Path()
        area.moveTo(*pts[0])
        for p in pts[1:]:
            area.lineTo(*p)
        area.lineTo(pts[-1][0], gy1)
        area.lineTo(gx0, gy1)
        area.close()
        D.halftone(c, (gx0, gy0, gx1, gy1), D.ramp(gy1, gy0, 0.25, 0.9), OVER, step=16, angle=45, clip=area)
        c.drawPath(_poly(pts), paint(INK, 1, 9))
    for h in window("chart", 3, 4):
        if t >= h:
            u = pop(h, t, 0.3)
            ax, ay = pts[-1]
            c.save()
            c.translate(ax + 10, ay - 30)
            c.scale(u, u)
            arr = _poly([(-22, 20), (0, -26), (22, 20)])
            c.drawPath(arr, paint(RED, 1, 10))
            c.restore()
    sh = window("stamp", 3, 4)[0]
    if t >= sh:
        D.stamp(c, 1270, 450, "成效显著", "RÉSULTATS EXCELLENTS", (t - sh) / 0.5 if t - sh < 1 else 1.0, rot=-9, size=96)
    hud(c, t, "EXHIBIT 02")
    push(x, lt, 2 * BAR, 1.05)
    shake(x, t, ("stamp",), 3, 22)
    x.flash = 0.45 * math.exp(-since("stamp", t, 3) / 0.08) if t >= sh else 0.0
    beat_pulse(x, t)


def _poly(pts, closed=False):
    p = skia.Path()
    for k, (a, b) in enumerate(pts):
        (p.moveTo if k == 0 else p.lineTo)(a, b)
    if closed:
        p.close()
    return p


# ------------------------------------------------------------------ bar 4: the tailless rat
@shot(B(4), B(5), tin=0.0, tout=0.0, kin="cut", kout="cut")
def tailless(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.radial(1100, 640, 80, 760, 0.0, 0.8), HI, step=24, angle=20)
    c.drawLine(0, 790, W, 790, paint(INK, 1, 8))
    D.halftone(c, (0, 790, W, H), lambda X, Y: np.full_like(X, 0.45), INK, step=18, angle=45)
    st = window("step", 4, 5)
    k = sum(1 for h in st if t >= h)
    u = clamp((t - B(4)) / (st[-1] - B(4) + 0.2))
    rx = lerp(-260, 1180, ease_io(min(1, u * 1.15)))
    stopped = t >= st[-1] + 0.15
    run = 0.0 if stopped else (t - B(4)) * 18
    D.rat(c, rx, 700, 1.7, t, tail=0.0, run=run, look=-1 if stopped else 0, blink=stopped and int(t * 4) % 5 == 0)
    if stopped:
        u2 = pop(st[-1] + 0.15, t, 0.3)
        c.save()
        c.translate(rx - 190, 640)
        c.scale(u2, u2)
        f = D.font(70, "fun")
        c.drawString("?", -20, 20, f, paint(RED))
        c.restore()
    D.headline(c, "没有尾巴", 110, 250, 120, t, B(4) + 0.05, hi_idx=(2, 3))
    hud(c, t, "EXHIBIT 03")
    push(x, lt, BAR, 1.05)
    x.flash = 0.4 * math.exp(-(t - B(4)) / 0.08)
    shake(x, t, ("step",), 4, 4, 0.08)


# ------------------------------------------------------------------ bar 5: the loop
NODES = [("抓", 760, 380), ("剪尾巴", 1240, 420), ("放回去", 1200, 760), ("生更多", 720, 740)]


@shot(B(5), B(6), tin=0.0, tout=0.0, kin="cut", kout="cut")
def loop(c, x, t, lt, b0=5, head="一条尾巴，两次钱", hi=(5, 6, 7), ex="EXHIBIT 04"):
    D.halftone(c, (0, 0, W, H), D.radial(980, 570, 60, 520, 0.0, 0.6), OVER, step=22, angle=15)
    D.headline(c, head, 110, 250, 100, t, B(b0) + 0.05, hi_idx=hi)
    lh = window("loop", b0, b0 + 1)
    cx, cy = 980, 575
    for k, ((name, nx, ny), h) in enumerate(zip(NODES, lh)):
        if t < h:
            continue
        u = pop(h, t, 0.32)
        nx2, ny2 = NODES[(k + 1) % 4][1:]
        if k < 3 or t >= h + 0.2:
            a0 = math.atan2(ny - cy, nx - cx)
            a1 = math.atan2(ny2 - cy, nx2 - cx)
            if a1 < a0:
                a1 += 2 * math.pi
            v = clamp((t - h) / 0.4)
            arc = skia.Path()
            arc.addArc(skia.Rect.MakeXYWH(cx - 300, cy - 230, 600, 460), math.degrees(a0) + 18,
                       (math.degrees(a1) - math.degrees(a0) - 36) * v)
            c.drawPath(arc, paint(INK, 1, 9, boil=D.boil_seed(t)))
        c.save()
        c.translate(nx, ny)
        c.scale(u, u)
        f = D.font(54, "sans")
        w = f.measureText(name) + 60
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-w / 2, -50, w, 96), 48, 48)
        c.drawRRect(rr.makeOffset(8, 8), paint(OVER, 0.9, mult=True))
        c.drawRRect(rr, paint(HI if k == 3 else PAPER))
        c.drawRRect(rr, paint(INK, 1, 6))
        c.drawString(name, -f.measureText(name) / 2, 20, f, paint(INK))
        c.restore()
    if t >= lh[3]:
        for j in range(4):
            hb = lh[3] + j * BEAT / 4
            if t >= hb:
                D.rat(c, 470 + j * 75, 850, 0.42, t, tail=1, run=(t - hb) * 6, squash=1 + 0.15 * math.exp(-(t - hb) * 8))
    D.rat(c, cx, cy + 30, 0.6, t, tail=0.0, look=0.3 * math.sin(t * 2))
    hud(c, t, ex)
    push(x, lt, BAR, 1.05)
    beat_pulse(x, t)


# ------------------------------------------------------------------ bar 6: the rat farm
@shot(B(6), B(7), tin=0.0, tout=0.0, kin="cut", kout="cut")
def farm(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 360, 0.9), INK, step=20, angle=15)
    lab = skia.Rect.MakeLTRB(80, 130, 110 + 6 * 110 + 40, 290)
    c.drawRect(lab.makeOffset(10, 10), paint(OVER, 0.9, mult=True))
    c.drawRect(lab, paint(INK))
    D.headline(c, "城外的养鼠场", 110, 250, 110, t, B(6) + 0.05, col=PAPER, shadow=RED)
    for k, h in enumerate(window("cage", 6, 7)):
        if t < h:
            continue
        col, row = k % 4, k // 4
        bx, by = 300 + col * 360, 390 + row * 270
        u = pop(h, t, 0.32)
        c.save()
        c.translate(bx + 140, by + 110)
        c.scale(u, u)
        c.translate(-140, -110)
        D.rat(c, 140, 140, 0.55, t + k, tail=1, look=math.sin(t * 2 + k) * 0.5, blink=int((t + k) * 2) % 9 == 0)
        box = skia.Rect.MakeXYWH(0, 0, 280, 220)
        for j in range(8):
            c.drawLine(18 + j * 35, 6, 18 + j * 35, 214, paint(INK, 1, 5))
        c.drawRect(box, paint(INK, 1, 9, boil=D.boil_seed(t) + k))
        c.restore()
    hud(c, t, "EXHIBIT 05", dark=True)
    push(x, lt, BAR, 1.06)
    shake(x, t, ("cage",), 6, 5, 0.1)


# ------------------------------------------------------------------ bar 7: the twist
@shot(B(7), B(8), tin=0.0, tout=0.0, kin="cut", kout="cut")
def twist(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.radial(960, 560, 100, 900, 0.0, 0.55), HI, step=22, angle=20)
    ch = window("count", 7, 8)
    n = sum(1 for h in ch if t >= h)
    for side, (label, cx_, col) in enumerate((("尾巴", 560, INK), ("老鼠", 1360, RED))):
        f = D.font(80, "serif")
        c.drawString(label, cx_ - f.measureText(label) / 2, 330, f, paint(col))
        for k in range(n):
            u = pop(ch[k], t, 0.3)
            y = 760 - k * 140
            c.save()
            c.translate(cx_, y)
            c.scale(u, u)
            arr = _poly([(-70, 50), (0, -50), (70, 50)])
            c.drawPath(arr, paint(col, 1, 26))
            c.restore()
    if n >= 3:
        u = pop(ch[2] + 0.25, t, 0.3)
        c.save()
        c.translate(960, 560)
        c.scale(u, u)
        f = D.font(84, "sans")
        w = f.measureText("都在涨") + 80
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-w / 2, -70, w, 124), 62, 62)
        c.drawRRect(rr.makeOffset(10, 10), paint(OVER, 0.9, mult=True))
        c.drawRRect(rr, paint(INK))
        c.drawString("都在涨", -f.measureText("都在涨") / 2, 22, f, paint(PAPER))
        c.restore()
    hud(c, t, "EXHIBIT 06")
    push(x, lt, BAR, 1.04)
    beat_pulse(x, t)


# ------------------------------------------------------------------ bars 8-9: title
@shot(B(8), B(10), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt, b0=8):
    th = window("title", b0, b0 + 1)[0]
    pulses = window("pulse", b0 + 1, b0 + 2)
    halo = 0.55 + 0.25 * sum(math.exp(-(t - h) / 0.25) for h in pulses if t >= h)
    D.halftone(c, (0, 0, W, H), D.radial(1450, 600, 60, 640, 0.0, min(0.95, halo)), OVER, step=24, angle=15)
    D.halftone(c, (0, 0, W, H), D.radial(1450, 600, 0, 420, 0.0, 0.5), HI, step=24, angle=45)
    chars = window("char", b0, b0 + 1)
    for i, ch in enumerate(TITLE):
        D.headline(c, ch, 110 + i * 210, 400, 210, t, chars[i])
    sh = window("sub", b0, b0 + 1)[0]
    if t >= sh:
        u = clamp((t - sh) / 0.4)
        f = D.font(46, "serif")
        c.drawString(CONCEPT[: max(0, int(len(CONCEPT) * u * 1.6))], 118, 490, f, paint(INK))
        fm = D.font(30, "mono")
        c.drawString(CONCEPT_EN, 118 + f.measureText(CONCEPT) + 24, 488, fm, paint(OVER))
    D.rat(c, 1450, 640, 1.5, t, tail=0.0, look=-0.4 + 0.3 * math.sin(t * 1.4), blink=int(t * 3) % 8 == 0)
    lh = window("law", b0 + 1, b0 + 2)[0]
    if t >= lh:
        D.stamp(c, 560, 700, "指标成了目标", "STRATHERN, 1997", (t - lh) / 0.5 if t - lh < 1 else 1.0, rot=-6, size=72)
    hud(c, t, "CASE OPEN")
    push(x, lt, 2 * BAR, 1.04)
    shake(x, t, ("title", "law"), b0, 18)
    x.flash = 0.45 * math.exp(-(t - th) / 0.08) if t >= th else 0.0
    beat_pulse(x, t)


# ================================================================== the full episode, bars 10-62
def hits_in(name, b0, b1=None):
    return window(name, b0, b0 + 1 if b1 is None else b1)


def count(hs, t):
    return sum(1 for h in hs if t >= h)


def at(c, x, y, s=1.0, rot=0.0):
    c.save()
    c.translate(x, y)
    if rot:
        c.rotate(rot)
    c.scale(s, s)


def text(c, s, x, y, size, col=INK, kind="sans", align="left", a=1.0):
    f = D.font(size, kind)
    w = f.measureText(s)
    xx = x - w / 2 if align == "center" else (x - w if align == "right" else x)
    c.drawString(s, xx, y, f, paint(col, a))
    return w


def pill(c, s, x, y, size=44, fill=PAPER, txt=INK, kind="sans", u=1.0, a=1.0):
    """A label card centred on (x, y): flat fill, ink outline, overprint shadow."""
    if u <= 0:
        return
    f = D.font(size, kind)
    w = f.measureText(s) + size * 1.2
    h = size * 1.75
    at(c, x, y, u)
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h), h / 2, h / 2)
    c.drawRRect(rr.makeOffset(8, 8), paint(OVER, 0.9 * a, mult=True))
    c.drawRRect(rr, paint(fill, a))
    c.drawRRect(rr, paint(INK, a, 5))
    c.drawString(s, -f.measureText(s) / 2, size * 0.36, f, paint(txt, a))
    c.restore()


def card(c, r, fill=PAPER, sh=12, lw=6, boil=None):
    c.drawRect(r.makeOffset(sh, sh), paint(OVER, 0.9, mult=True))
    c.drawRect(r, paint(fill))
    c.drawRect(r, paint(INK, 1, lw, boil=boil))


def arrow_up(c, x, y, s, col, u=1.0):
    if u <= 0:
        return
    at(c, x, y, s * u)
    c.drawPath(_poly([(-34, 24), (0, -24), (34, 24)]), paint(col, 1, 14))
    c.restore()


def qmark(c, x, y, s, u, col=RED):
    if u <= 0:
        return
    at(c, x, y, s * u)
    f = D.font(80, "fun")
    c.drawString("?", -f.measureText("?") / 2, 28, f, paint(col))
    c.restore()


def person(c, x, y, s, t, walk=0.0, a=1.0, col=OVER, heart=None):
    """The viewer: a chunky round-headed figure with a heavy outline; `walk` is the gait phase."""
    seed = D.boil_seed(t) + int(x) % 5
    ol = paint(INK, a, 7 / s, boil=seed)
    at(c, x, y, s)
    bob = -5 * abs(math.sin(walk)) if walk else 0
    c.translate(0, bob)
    for side in (-1, 1):                                    # legs
        ph = math.sin(walk + (0 if side < 0 else math.pi)) if walk else 0
        leg = _poly([(side * 22, 70), (side * 22 + ph * 18, 130), (side * 30 + ph * 24, 136)])
        c.drawPath(leg, paint(INK, a, 14, boil=seed))
    body = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-55, -40, 110, 120), 46, 46)
    c.drawRRect(body, paint(col, a))
    c.drawRRect(body, ol)
    if heart is not None:                                   # a heart on the chest, filled by dots
        hp = heart_path(0, 18, 26)
        c.drawPath(hp, paint(PAPER, a))
        D.halftone(c, (-30, -10, 30, 50), lambda X, Y: np.full_like(X, heart), RED, step=9, angle=30, clip=hp,
                   mult=False)
        c.drawPath(hp, paint(INK, a, 4))
    for side in (-1, 1):                                    # arms swing
        ph = math.sin(walk + (math.pi if side < 0 else 0)) if walk else 0
        c.drawPath(_poly([(side * 52, -10), (side * 70 + ph * 14, 40)]), paint(INK, a, 13, boil=seed))
    c.drawCircle(0, -95, 52, paint(PAPER, a))
    c.drawCircle(0, -95, 52, ol)
    blink = int(t * 3 + x) % 9 == 0
    for ex in (-18, 18):
        if blink:
            c.drawLine(ex - 7, -98, ex + 7, -98, paint(INK, a, 5))
        else:
            c.drawCircle(ex, -98, 7, paint(INK, a))
            c.drawCircle(ex + 2, -101, 2.2, paint(WHITE, a))
    c.restore()


def heart_path(x, y, r):
    p = skia.Path()
    p.moveTo(x, y + r * 0.9)
    p.cubicTo(x - r * 1.6, y - r * 0.2, x - r * 0.8, y - r * 1.3, x, y - r * 0.45)
    p.cubicTo(x + r * 0.8, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9)
    p.close()
    return p


def robot(c, x, y, s, t, blink=False, face=PAPER, glow=0.0):
    seed = D.boil_seed(t) + 3
    at(c, x, y, s)
    c.drawLine(0, -150, 0, -205, paint(INK, 1, 10, boil=seed))
    c.drawCircle(0, -212, 16 + 6 * glow, paint(RED))
    c.drawCircle(0, -212, 16 + 6 * glow, paint(INK, 1, 6))
    head = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-150, -150, 300, 230), 40, 40)
    c.drawRRect(head.makeOffset(12, 12), paint(OVER, 0.9, mult=True))
    c.drawRRect(head, paint((0.80, 0.82, 0.86)))
    c.drawRRect(head, paint(INK, 1, 8, boil=seed))
    scr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-110, -115, 220, 150), 24, 24)
    c.drawRRect(scr, paint(INK))
    for ex in (-48, 48):
        if blink:
            c.drawLine(ex - 20, -40, ex + 20, -40, paint(HI, 1, 8))
        else:
            c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(ex - 16, -72, 32, 52), 14, 14), paint(HI))
    body = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-110, 92, 220, 120), 30, 30)
    c.drawRRect(body, paint(OVER))
    c.drawRRect(body, paint(INK, 1, 8, boil=seed))
    c.restore()


def boat(c, x, y, ang, s=1.0, fire=0.0, t=0.0):
    at(c, x, y, s, math.degrees(ang))
    hull = _poly([(-46, -20), (30, -20), (58, 0), (30, 20), (-46, 20)], True)
    c.drawPath(hull.makeOffset(5, 5) if hasattr(hull, "makeOffset") else hull, paint(OVER, 0.9, mult=True))
    c.drawPath(hull, paint(WHITE))
    c.drawPath(hull, paint(INK, 1, 6))
    c.drawRect(skia.Rect.MakeXYWH(-26, -10, 30, 20), paint(RED))
    c.restore()
    if fire > 0:
        flame(c, x, y - 40, 0.8 * fire, t)


def flame(c, x, y, s, t):
    seed = D.boil_seed(t, 14)
    at(c, x, y, s)
    for k, (col, sc) in enumerate(((RED, 1.0), (HI, 0.6))):
        w = 1 + 0.12 * math.sin(t * 23 + k)
        p = skia.Path()
        p.moveTo(0, 40 * sc)
        p.cubicTo(-46 * sc * w, 20 * sc, -30 * sc, -40 * sc, 0, -70 * sc * w)
        p.cubicTo(30 * sc, -40 * sc, 46 * sc * w, 20 * sc, 0, 40 * sc)
        c.drawPath(p, paint(col))
        if k == 0:
            c.drawPath(p, paint(INK, 1, 5, boil=seed))
    c.restore()


def phone(c, x, y, s, rot=0.0):
    at(c, x, y, s, rot)
    body = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-110, -200, 220, 400), 34, 34)
    c.drawRRect(body.makeOffset(12, 12), paint(OVER, 0.9, mult=True))
    c.drawRRect(body, paint(INK))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-92, -168, 184, 330), 14, 14), paint(PAPER))
    c.restore()


def split_chart(c, t, hs, la, lb, x0=980, y0=330, x1=1780, y1=860, a_pts=None, b_pts=None):
    """Two lines from one origin; each hit extends both.  la rises (the number), lb drifts (the real thing)."""
    a_pts = a_pts or [0.25, 0.42, 0.6, 0.8, 1.0]
    b_pts = b_pts or [0.25, 0.36, 0.33, 0.3, 0.26]
    c.drawLine(x0, y1, x1, y1, paint(INK, 1, 6))
    c.drawLine(x0, y1, x0, y0, paint(INK, 1, 6))
    D.chip(c, x1 - 90, y1 - 24, "示意", kind="sans", size=24, fill=INK, txt=PAPER)
    n = count(hs, t)
    if n == 0:
        return
    last = hs[n - 1]
    v = clamp((t - last) / 0.35)
    ends = []
    for vals, col, lab in ((b_pts, RED, lb), (a_pts, INK, la)):
        pts = []
        for k in range(n + 1):
            fr = 1.0 if k < n else v
            if k == 0:
                pts.append((x0, y1 - (y1 - y0) * vals[0]))
                continue
            px0, py0 = pts[-1] if fr < 1 else (0, 0)
            X = x0 + (x1 - x0 - 120) * k / 4
            Y = y1 - (y1 - y0) * vals[k]
            if fr < 1:
                X, Y = lerp(px0, X, ease_out(fr)), lerp(py0, Y, ease_out(fr))
            pts.append((X, Y))
        c.drawPath(_poly(pts), paint(col, 1, 12))
        c.drawCircle(*pts[-1], 13, paint(col))
        ends.append([pts[-1][0], pts[-1][1], col, lab])
    (bx, by, _, _), (ax, ay, _, _) = ends
    if abs(ay - by) < 56:                                  # keep the two end labels apart
        mid = (ay + by) / 2
        up, dn = (0, 1) if by < ay or (by == ay) else (1, 0)
        ends[up][1], ends[dn][1] = mid - 28, mid + 28
    f = D.font(40, "sans")
    for ex, ey, col, lab in ends:
        c.drawString(lab, ex + 24, ey + 14, f, paint(col))


def fig_card(c, x, t, lt, b, num, label, ex):
    """FIG. n: a manila folder slides in, its tab, a paper clip, the label; a giant halftone numeral behind."""
    hs = hits_in("fig", b)
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 320, 0.8), OVER, step=22, angle=15)
    f = D.font(620, "num")
    c.drawString(num, 1180 + 16, 900 + 16, f, paint(OVER, 0.6, mult=True))
    c.drawString(num, 1180, 900, f, paint(HI))
    D.halftone(c, (1180, 380, 1700, 920), D.ramp(380, 920, 0.1, 0.65), RED, step=20, angle=45, a=0.6)
    u = ease_out(clamp((t - hs[0]) / 0.35)) if t >= hs[0] else 0
    fx = lerp(-900, 180, u)
    fold = skia.Rect.MakeXYWH(fx, 360, 860, 520)
    tab = skia.Rect.MakeXYWH(fx + 40, 300, 300, 80)
    if t >= hs[1]:
        card(c, tab, fill=(0.89, 0.78, 0.55))
        text(c, f"FIG. {num}", fx + 70, 358, 40, INK, "mono")
    card(c, fold, fill=(0.91, 0.81, 0.58), lw=7)
    if t >= hs[2]:
        uc = pop(hs[2], t, 0.3)
        at(c, fx + 760, 380, uc)
        clip = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-22, -70, 44, 150), 22, 22)
        c.drawRRect(clip, paint(INK, 1, 9))
        c.restore()
    D.headline(c, label, fx + 70, 680, 130, t, hs[3], stagger=0.06)
    hud(c, t, ex)
    push(x, lt, BAR, 1.04)
    shake(x, t, ("fig",), b, 6, 0.1)


# ------------------------------------------------------------------ bar 10: the tail was evidence
@shot(B(10), B(11), tin=0.0, tout=0.0, kin="cut", kout="cut")
def evidence(c, x, t, lt):
    hs = hits_in("tag", 10)
    D.halftone(c, (0, 0, W, H), D.radial(760, 600, 80, 700, 0.0, 0.6), OVER, step=22, angle=15)
    D.headline(c, "一条尾巴 = 一个证据", 110, 250, 100, t, B(10) + 0.05, hi_idx=(7, 8))
    u = pop(hs[0], t, 0.35)
    at(c, 640, 620, u, -4)
    bag = skia.Rect.MakeXYWH(-230, -230, 460, 460)
    c.drawRect(bag.makeOffset(12, 12), paint(OVER, 0.9, mult=True))
    c.drawRect(bag, paint(WHITE, 0.85))
    D.halftone(c, (-230, -230, 230, 230), D.ramp(-230, 230, 0.05, 0.25), OVER, step=16, angle=45)
    c.drawRect(bag, paint(INK, 1, 7))
    c.drawRect(skia.Rect.MakeXYWH(-230, -230, 460, 46), paint(RED))
    c.drawRect(skia.Rect.MakeXYWH(-230, -230, 460, 46), paint(INK, 1, 5))
    if t >= hs[1]:
        D.tail_icon(c, 0, 30, 2.2 * pop(hs[1], t, 0.3), 1.0, t, -20)
    c.restore()
    if t >= hs[2]:
        sw = 6 * math.exp(-(t - hs[2]) * 3) * math.sin((t - hs[2]) * 12)
        at(c, 900, 420, pop(hs[2], t, 0.3), 12 + sw)
        c.drawLine(-60, -10, -150, 20, paint(INK, 1, 4))
        tg = skia.Rect.MakeXYWH(0, -40, 260, 110)
        card(c, tg, fill=HI, sh=8, lw=5)
        text(c, "EXHIBIT A", 24, 30, 36, INK, "mono")
        c.restore()
    if t >= hs[3]:
        u3 = pop(hs[3], t, 0.35)
        D.rat(c, 1380, 700, 1.1 * u3 + 0.001, t, tail=1.0, look=-0.3)
        if u3 > 0.5:
            c.drawLine(1180, 560, 1580, 820, paint(RED, 1, 22))
            c.drawLine(1580, 560, 1180, 820, paint(RED, 1, 22))
        text(c, "少了一只", 1380, 900, 56, RED, "sans", "center", a=clamp(u3))
    hud(c, t, "EXHIBIT 07")
    push(x, lt, BAR, 1.05)
    beat_pulse(x, t)


# ------------------------------------------------------------------ bars 11-13: what you want vs what you can count
@shot(B(11), B(14), tin=0.0, tout=0.0, kin="cut", kout="cut")
def gap(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.ramp(200, 1080, 0.0, 0.45), OVER, step=22, angle=15)
    D.headline(c, "想要的 · 能数的", 110, 250, 104, t, B(11) + 0.05, hi_idx=(4, 5, 6))
    bx, gx = window("box", 11, 12), window("link", 11, 12)
    pulls = window("pull", 13, 14)
    coin_h = window("coin", 13, 14)[0]
    drift = sum(ease_out(clamp((t - h) / 0.3)) for h in pulls) * 80
    gxc, gyc = 560, 540
    mx, my = 1340 + drift, 540
    # GOAL: a fuzzy cloud of rats you can't count
    if t >= bx[0]:
        u = pop(bx[0], t, 0.4)
        at(c, gxc, gyc, u)
        cl = skia.Path()
        for k in range(10):
            a_ = k / 10 * 2 * math.pi
            cl.addCircle(math.cos(a_) * 170, math.sin(a_) * 105, 80)
        c.drawPath(cl, paint(PAPER))
        D.halftone(c, (-260, -190, 260, 190), lambda X, Y: np.full_like(X, 0.22), OVER, step=14, angle=30, clip=cl)
        c.drawPath(cl, paint(INK, 1, 6, boil=D.boil_seed(t)))
        for k in range(6):
            D.rat(c, -150 + (k % 3) * 140, -40 + (k // 3) * 90, 0.32, t + k, tail=1, run=t * 7 + k)
        c.restore()
        text(c, "老鼠变少", gxc, gyc + 230, 50, INK, "sans", "center")
        D.chip(c, gxc - 70, gyc - 210, "GOAL", size=26, fill=INK, txt=PAPER)
    # METRIC: a hard box with a counter
    if t >= bx[1]:
        u = pop(bx[1], t, 0.4)
        at(c, mx, my, u)
        r = skia.Rect.MakeXYWH(-180, -130, 360, 260)
        card(c, r, fill=PAPER, lw=8)
        D.tail_icon(c, -70, 0, 1.4, 1.0, t, -10)
        n = count(window("sync", 12, 13), t) * 3 + count(pulls, t) * 9
        f = D.font(110, "num")
        s = f"{n:02d}"
        c.drawString(s, 30, 40, f, paint(HI))
        c.drawString(s, 30, 40, f, paint(INK, 1, 4))
        c.restore()
        text(c, "尾巴数", mx, my + 210, 50, INK, "sans", "center")
        D.chip(c, mx - 80, my - 180, "METRIC", size=26, fill=INK, txt=PAPER)
    # the link: drawn in two halves, then stretched and turned red by the money
    if t >= gx[0]:
        v = clamp((t - gx[0]) / 0.3) * 0.5 + (clamp((t - gx[1]) / 0.3) * 0.5 if t >= gx[1] else 0)
        x0_, x1_ = gxc + 270, mx - 190
        strained = count(pulls, t)
        col = RED if strained else INK
        pe = None
        if strained:
            pe = skia.DashPathEffect.Make([30, 18 + 10 * strained], 0)
        lp = paint(col, 1, 10 - 2 * strained)
        if pe:
            lp.setPathEffect(pe)
        sag = 40 * strained
        p = skia.Path()
        p.moveTo(x0_, gyc)
        p.quadTo((x0_ + x1_) / 2, gyc + sag, lerp(x0_, x1_, v), gyc + sag * (1 - abs(1 - 2 * v)))
        c.drawPath(p, lp)
    # bar 12: two gauges tick together
    sy = window("sync", 12, 13)
    ns = count(sy, t)
    if t >= B(12):
        for (cx_, lab, col, up) in ((gxc, "老鼠", RED, -1), (mx, "尾巴", INK, 1)):
            moving = up > 0 or not pulls or t < pulls[0]
            k = ns if up > 0 else (ns if moving else count([h for h in sy if h < pulls[0]], t))
            lv = 0.5 + up * 0.05 * k
            if up > 0:
                lv += 0.06 * count(pulls, t)
            r = skia.Rect.MakeXYWH(cx_ - 150, 800, 300, 34)
            c.drawRect(r, paint(PAPER))
            c.drawRect(skia.Rect.MakeXYWH(cx_ - 150, 800, 300 * clamp(lv), 34), paint(col))
            c.drawRect(r, paint(INK, 1, 5))
            text(c, lab, cx_ - 170, 830, 34, INK, "sans", "right")
    if t >= coin_h:
        s_ = t - coin_h
        y = lerp(-120, my - 170, min(1, (s_ / 0.25) ** 2))
        D.coin(c, mx + 150, y, 70)
    hud(c, t, "EXHIBIT 08")
    push(x, lt, 3 * BAR, 1.05)
    shake(x, t, ("coin", "pull"), 13, 10)
    beat_pulse(x, t)


# ------------------------------------------------------------------ bar 14: the lines split
@shot(B(14), B(15), tin=0.0, tout=0.0, kin="cut", kout="cut")
def split1(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.radial(1300, 560, 80, 760, 0.0, 0.5), HI, step=22, angle=20)
    D.headline(c, "从这里分开", 110, 250, 110, t, B(14) + 0.05)
    split_chart(c, t, hits_in("split", 14), "尾巴", "老鼠", x0=380, x1=1640, y0=360, y1=860,
                a_pts=[0.2, 0.3, 0.55, 0.8, 1.0], b_pts=[0.6, 0.45, 0.48, 0.6, 0.75])
    text(c, "每日上交 · 街上的老鼠", 400, 340, 30, INK, "sans")
    hud(c, t, "EXHIBIT 08")
    push(x, lt, BAR, 1.04)
    beat_pulse(x, t)


# ------------------------------------------------------------------ bars 15-17: Goodhart, Strathern
def typed(c, s, x, y, size, hs, t, kind="mono", col=INK, per=None):
    n = len(s)
    per = per or max(1, math.ceil(n / len(hs)))
    k = count(hs, t)
    if k == 0:
        return
    shown = min(n, (k - 1) * per + int(per * clamp((t - hs[k - 1]) / (BEAT * 0.5))) + 1)
    c.drawString(s[:shown], x, y, D.font(size, kind), paint(col))


@shot(B(15), B(18), tin=0.0, tout=0.0, kin="cut", kout="cut")
def goodhart(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 300, 0.7), OVER, step=22, angle=15)
    second = t >= B(17)
    D.headline(c, "1975 · 古德哈特" if not second else "1997 · 一句话", 110, 250, 104, t,
               (B(17) if second else B(15)) + 0.05, hi_idx=() if second else (7, 8, 9, 10))
    # the file card
    r = skia.Rect.MakeXYWH(140, 360, 900, 470)
    card(c, r, fill=(0.97, 0.94, 0.86), lw=6)
    for k in range(6):
        c.drawLine(180, 470 + k * 60, 1000, 470 + k * 60, paint(OVER, 0.35, 2))
    c.drawRect(skia.Rect.MakeXYWH(140, 360, 900, 70), paint(INK))
    text(c, "FILE  GOODHART, C.  ·  1975", 180, 410, 34, PAPER, "mono")
    typed(c, "Monetary targets, U.K.", 190, 512, 40, hits_in("type", 15), t)
    typed(c, "A number managed as a target", 190, 572, 40, hits_in("type", 15)[4:], t, per=8)
    if t >= B(16):
        text(c, "stops telling the truth.", 190, 632, 40, RED, "mono")
    if second:
        r2 = skia.Rect.MakeXYWH(220, 560, 900, 300)
        card(c, r2, fill=PAPER, lw=6)
        c.drawRect(skia.Rect.MakeXYWH(220, 560, 900, 66), paint(OVER))
        text(c, "FILE  STRATHERN, M.  ·  1997", 260, 606, 34, PAPER, "mono")
        typed(c, "When a measure becomes a target,", 250, 700, 38, hits_in("type", 17)[:4], t, per=9)
        typed(c, "it ceases to be a good measure.", 250, 760, 38, hits_in("type", 17)[4:], t, per=8)
    # bar 16: the target and the needle that stops telling the truth
    ah = hits_in("aim", 16)
    if t >= ah[0]:
        u = pop(ah[0], t, 0.35)
        at(c, 1460, 580, u)
        for k, col in enumerate((RED, PAPER, RED, PAPER, RED)):
            c.drawCircle(0, 0, 230 - k * 46, paint(col))
            c.drawCircle(0, 0, 230 - k * 46, paint(INK, 1, 5))
        c.restore()
        if t >= ah[1]:
            wob = 0
            if t >= ah[2]:
                wob = 28 * math.sin((t - ah[2]) * 17) * math.exp(-(t - ah[2]) * 0.6)
            ang = math.radians(-60 + wob)
            nx_, ny_ = 1460 + 260 * math.cos(ang), 580 + 260 * math.sin(ang)
            c.drawLine(1460, 580, nx_, ny_, paint(INK, 1, 14))
            c.drawCircle(1460, 580, 22, paint(INK))
        if t >= ah[3]:
            cr = _poly([(1340, 420), (1400, 500), (1380, 560), (1450, 640), (1430, 720)])
            c.drawPath(cr, paint(INK, 1, 7))
            cr2 = _poly([(1400, 500), (1470, 480), (1540, 520)])
            c.drawPath(cr2, paint(INK, 1, 6))
    hud(c, t, "EXHIBIT 09")
    push(x, lt, 3 * BAR, 1.05)
    shake(x, t, ("aim",), 16, 8, 0.1)


# ------------------------------------------------------------------ bars 18-19: the law, on a dark page
@shot(B(18), B(20), tin=0.0, tout=0.0, kin="cut", kout="cut")
def quote(c, x, t, lt):
    c.drawRect(skia.Rect.MakeWH(W, H), paint(INK))
    qh = window("qchar", 18, 20)
    pulses = window("pulse", 19, 20)
    halo = 0.35 + 0.25 * sum(math.exp(-(t - h) / 0.25) for h in pulses if t >= h)
    D.halftone(c, (0, 0, W, H), D.radial(960, 520, 100, 900, min(0.8, halo), 0.0), OVER, step=24, angle=30,
               mult=False)
    l1, l2 = QUOTE
    f = D.font(116, "serif")
    for row, (line, hs, y) in enumerate(((l1, qh[:len(l1)], 440), (l2, qh[len(l1):], 620))):
        wsum = sum(f.measureText(ch) for ch in line)
        xx = 960 - wsum / 2
        for i, ch in enumerate(line):
            hi_ = row == 1 and ch in "不再是好指标"
            D.headline(c, ch, xx, y, 116, t, hs[i] - 0.02, col=HI if hi_ else PAPER, shadow=RED)
            xx += f.measureText(ch)
    lh = window("law", 19, 20)[0]
    if t >= lh:
        D.stamp(c, 1420, 800, CONCEPT, CONCEPT_EN, (t - lh) / 0.5 if t - lh < 1 else 1.0, rot=-7, size=70,
                col=HI)
    hud(c, t, "THE LAW", dark=True)
    push(x, lt, 2 * BAR, 1.05)
    shake(x, t, ("law",), 19, 20)
    x.flash = 0.4 * math.exp(-(t - lh) / 0.08) if t >= lh else 0.0
    beat_pulse(x, t)


# ------------------------------------------------------------------ FIG. 2: exams, tickets, steps
@shot(B(20), B(21), tin=0.0, tout=0.0, kin="cut", kout="cut")
def fig2(c, x, t, lt):
    fig_card(c, x, t, lt, 20, "2", "生活里的尾巴", "FIG. 2")


@shot(B(21), B(23), tin=0.0, tout=0.0, kin="cut", kout="cut")
def exam(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.ramp(200, 1080, 0.0, 0.4), OVER, step=22, angle=15)
    later = t >= B(22)
    D.headline(c, "分数 ≈ 会不会" if not later else "分数涨了", 110, 250, 104, t, (B(22) if later else B(21)) + 0.05,
               hi_idx=(4, 5, 6) if not later else (2, 3))
    # the exam paper
    r = skia.Rect.MakeXYWH(220, 330, 760, 560)
    at(c, 0, 0, 1, -2)
    card(c, r, fill=WHITE, lw=6)
    text(c, "期中测验", 270, 400, 46, INK, "serif")
    mk = hits_in("mark", 21)
    for k in range(4):
        y = 480 + k * 100
        c.drawLine(300, y + 20, 860, y + 20, paint(OVER, 0.4, 3))
        text(c, f"{k + 1}.", 270, y + 10, 36, INK, "mono")
        if t >= mk[k]:
            u = clamp((t - mk[k]) / 0.18)
            c.drawPath(_poly([(880, y - 10), (880 + 22 * min(1, u * 2), y + 16 * min(1, u * 2)),
                              (902 + 46 * max(0, u * 2 - 1), y + 16 - 50 * max(0, u * 2 - 1))]), paint(RED, 1, 10))
    sc = hits_in("score", 22)
    n = count(sc, t)
    val = 62 + n * 4 + (2 if n == 8 else 0)
    if t >= mk[0]:
        c.drawCircle(790, 395, 70, paint(RED, 1, 7))
        f = D.font(76, "num")
        s = str(val)
        c.drawString(s, 790 - f.measureText(s) / 2, 423, f, paint(RED))
    c.restore()
    # the light bulb: 会不会
    lit = 1.0 if not later else clamp(1 - n / 8 * 0.85)
    D.halftone(c, (1150, 260, 1750, 860), D.radial(1450, 520, 20, 330, 0.0, 0.9 * lit), HI, step=20, angle=30)
    at(c, 1450, 560, 1.0)
    bulb = skia.Path()
    bulb.addCircle(0, -40, 130)
    c.drawPath(bulb, paint(HI if lit > 0.5 else PAPER))
    c.drawPath(bulb, paint(INK, 1, 8, boil=D.boil_seed(t)))
    c.drawRect(skia.Rect.MakeXYWH(-60, 80, 120, 80), paint(OVER))
    c.drawRect(skia.Rect.MakeXYWH(-60, 80, 120, 80), paint(INK, 1, 6))
    text(c, "会", 0, -5, 120, INK, "serif", "center")
    c.restore()
    if later:
        for k in range(n):
            u = pop(sc[k], t, 0.25)
            at(c, 1080 + (k % 2) * 40, 820 - k * 64, u, -6)
            D.chip(c, -60, 0, "背题型", kind="sans", size=28, fill=INK, txt=PAPER)
            c.restore()
    hud(c, t, "FIG. 2 · A")
    push(x, lt, 2 * BAR, 1.05)
    beat_pulse(x, t)


@shot(B(23), B(25), tin=0.0, tout=0.0, kin="cut", kout="cut")
def tickets(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 300, 0.7), OVER, step=22, angle=15)
    D.headline(c, "关单数", 110, 250, 110, t, B(23) + 0.05, hi_idx=(0, 1))
    th = hits_in("ticket", 23)
    cl = hits_in("close", 24)
    n = count(th, t)
    for k in range(n):
        s_ = t - th[k]
        y = lerp(-200, 820 - k * 46, min(1, (s_ / 0.22) ** 2))
        r = skia.Rect.MakeXYWH(-230, -50, 460, 100)
        at(c, 620 + (k % 3 - 1) * 14, y, 1, (k % 3 - 1) * 3)
        card(c, r, fill=PAPER, sh=6, lw=5)
        text(c, f"#{1024 + k}", -200, 14, 34, INK, "mono")
        text(c, "网络连不上", -40, 14, 34, INK, "sans")
        c.restore()
    nc = count(cl, t)
    for k in range(nc):
        sx_, sy_ = [(470, 760), (780, 560), (500, 540), (790, 780)][k]
        D.stamp(c, sx_, sy_, "已关闭", "CLOSED", (t - cl[k]) / 0.5 if t - cl[k] < 1 else 1,
                rot=-12 + k * 7, size=52, seed=k)
    # counter and the phone that keeps ringing
    f = D.font(150, "num")
    s = str(n * 10 + nc * 40)
    text(c, "已关闭", 1060, 400, 44, INK, "sans")
    c.drawString(s, 1060 + 8, 560 + 8, f, paint(OVER, 0.9, mult=True))
    c.drawString(s, 1060, 560, f, paint(HI))
    c.drawString(s, 1060, 560, f, paint(INK, 1, 4))
    if t >= B(24):
        rg = 6 * math.sin(t * 60) if int(t * 4) % 2 == 0 else 0
        phone(c, 1500 + rg, 760, 0.62, 8)
        pill(c, "问题还在", 1500, 560, 40, fill=RED, txt=PAPER, u=pop(B(24) + 0.1, t, 0.35))
    hud(c, t, "FIG. 2 · B")
    push(x, lt, 2 * BAR, 1.05)
    shake(x, t, ("close",), 24, 14)
    beat_pulse(x, t)


@shot(B(25), B(27), tin=0.0, tout=0.0, kin="cut", kout="cut")
def steps(c, x, t, lt):
    night = t >= B(26)
    if night:
        c.drawRect(skia.Rect.MakeWH(W, H), paint((0.18, 0.22, 0.36)))
        D.halftone(c, (0, 0, W, H), D.radial(700, 560, 80, 700, 0.0, 0.6), HI, step=24, angle=20, mult=False, a=0.5)
    else:
        D.halftone(c, (0, 0, W, H), D.radial(1300, 560, 80, 760, 0.0, 0.55), HI, step=22, angle=20)
    D.headline(c, "一万步" if not night else "22:00 · 客厅", 110, 250, 110, t, (B(26) if night else B(25)) + 0.05,
               col=PAPER if night else INK, shadow=RED if night else OVER)
    sc, st = hits_in("stepc", 25), hits_in("step", 26)
    n1, n2 = count(sc, t), count(st, t)
    val = 6000 + n1 * 250 + n2 * 250
    # wristband
    at(c, 1320, 560, 1.0)
    band = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-120, -330, 240, 660), 60, 60)
    c.drawRRect(band, paint(OVER))
    c.drawRRect(band, paint(INK, 1, 7))
    face = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-260, -160, 520, 320), 50, 50)
    c.drawRRect(face.makeOffset(12, 12), paint(OVER, 0.9, mult=True))
    c.drawRRect(face, paint(INK))
    f = D.font(150, "num")
    s = f"{val:,}"
    c.drawString(s, -f.measureText(s) / 2, 50, f, paint(HI if val < 10000 else (0.55, 0.85, 0.45)))
    text(c, "STEPS", 0, 110, 34, PAPER, "mono", "center")
    goal = clamp((val - 6000) / 4000)
    c.drawRect(skia.Rect.MakeXYWH(-200, 128, 400 * goal, 12), paint(HI))
    c.restore()
    if night:
        walk = (t - B(26)) * 2 * math.pi * BPM / 60 if n2 else 0
        # the sofa they are not sitting on
        so = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(120, 780, 300, 100), 30, 30)
        c.drawRRect(so, paint(RED, 0.8))
        c.drawRRect(so, paint(INK, 1, 5))
        person(c, 680, 720, 1.25, t, walk=walk)
    hud(c, t, "FIG. 2 · C", dark=night)
    push(x, lt, 2 * BAR, 1.05)
    beat_pulse(x, t)


ROWS = [("分数", "会不会"), ("关单", "解决了吗"), ("步数", "健康")]


@shot(B(27), B(28), tin=0.0, tout=0.0, kin="cut", kout="cut")
def rows(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.ramp(200, 1080, 0.0, 0.4), OVER, step=22, angle=15)
    rh = hits_in("row", 27)
    qh = hits_in("q", 27)[0]
    text(c, "看得见的", 500, 360, 40, INK, "sans", "center")
    text(c, "真正想要的", 1300, 360, 40, RED, "sans", "center")
    for k, (a_, b_) in enumerate(ROWS):
        if t < rh[k]:
            continue
        u = pop(rh[k], t, 0.35)
        y = 470 + k * 150
        pill(c, a_, 420, y, 54, fill=HI, u=u)
        arrow_up(c, 600, y, 1.0, INK, u)
        pill(c, b_, 1260, y, 54, fill=PAPER, u=u)
        qmark(c, 1460, y - 6, 0.9, u)
    if t >= qh:
        D.headline(c, "更容易看见", 110, 250, 110, t, qh, hi_idx=(0, 1, 2))
    hud(c, t, "FIG. 2")
    push(x, lt, BAR, 1.04)
    beat_pulse(x, t)


@shot(B(28), B(29), tin=0.0, tout=0.0, kin="cut", kout="cut")
def split2(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.radial(1300, 560, 80, 760, 0.0, 0.5), HI, step=22, angle=20)
    D.headline(c, "悄悄分家", 110, 250, 110, t, B(28) + 0.05)
    split_chart(c, t, hits_in("split", 28), "数字", "真正的事", x0=380, x1=1640, y0=360, y1=860)
    hud(c, t, "FIG. 2")
    push(x, lt, BAR, 1.04)
    beat_pulse(x, t)


# ------------------------------------------------------------------ FIG. 3: reward hacking
@shot(B(29), B(30), tin=0.0, tout=0.0, kin="cut", kout="cut")
def fig3(c, x, t, lt):
    fig_card(c, x, t, lt, 29, "3", "AI 的尾巴", "FIG. 3")


@shot(B(30), B(31), tin=0.0, tout=0.0, kin="cut", kout="cut")
def reward(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.radial(960, 560, 80, 760, 0.0, 0.55), OVER, step=22, angle=15)
    D.headline(c, "奖励 = 一个分数", 110, 250, 104, t, B(30) + 0.05, hi_idx=(0, 1))
    bh = hits_in("beep", 30)
    n = count(bh, t)
    glow = sum(math.exp(-(t - h) / 0.15) for h in bh if t >= h)
    robot(c, 760, 640, 1.25, t, blink=glow > 0.6, glow=glow)
    f = D.font(130, "num")
    s = f"{n:02d}"
    text(c, "REWARD", 1300, 420, 40, INK, "mono")
    c.drawString(s, 1300 + 8, 580 + 8, f, paint(OVER, 0.9, mult=True))
    c.drawString(s, 1300, 580, f, paint(HI))
    c.drawString(s, 1300, 580, f, paint(INK, 1, 4))
    for k, h in enumerate(bh):
        if t >= h and t - h < 0.8:
            u = clamp((t - h) / 0.8)
            text(c, "+1", 1000 + k * 30, 420 - 120 * ease_out(u), 64, RED, "num", a=1 - u)
    hud(c, t, "FIG. 3 · A")
    push(x, lt, BAR, 1.04)
    beat_pulse(x, t)


LAGOON = (620, 660, 160)


def boat_pos(t):
    """Where the boat is: on the course at bar 31, then circling the lagoon from bar 32 on."""
    if t < B(32):
        u = clamp((t - B(31)) / BAR)
        return lerp(1500, 1200, u), 380, math.pi
    cx, cy, r = LAGOON
    if t < B(32) + BEAT:
        u = (t - B(32)) / BEAT
        x0, y0 = 1200, 380
        ang = math.pi / 2
        return lerp(x0, cx + r * math.cos(ang), smooth(u)), lerp(y0, cy - r, smooth(u)), math.pi * 0.75
    ph = (t - B(32) - BEAT) * 2 * math.pi / (BEAT * 2) * (-1)
    return cx + r * math.cos(ph - math.pi / 2), cy + r * math.sin(ph - math.pi / 2), ph + math.pi


@shot(B(31), B(36), tin=0.0, tout=0.0, kin="cut", kout="cut")
def boats(c, x, t, lt):
    c.drawRect(skia.Rect.MakeWH(W, H), paint((0.70, 0.84, 0.90)))
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 360, 0.6), OVER, step=22, angle=15, mult=False)
    later = t >= B(34)
    hd = ("CoastRunners · 2016", B(31)) if t < B(34) else (("比人类高两成", B(34)) if t < B(35) else ("它在刷分", B(35)))
    D.headline(c, hd[0], 110, 250, 96 if t < B(34) else 110, t, hd[1] + 0.05,
               hi_idx=(4, 5) if B(34) <= t < B(35) else ())
    # the course: a long track with a finish flag
    tr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(900, 300, 900, 160), 80, 80)
    c.drawRRect(tr, paint(PAPER, 0.5))
    c.drawRRect(tr, paint(INK, 1, 6))
    fl = hits_in("flag", 35)
    dim = 1 - 0.2 * count(fl, t)
    fx = 1720
    c.drawLine(fx, 240, fx, 470, paint(INK, dim, 8))
    for i in range(3):
        for j in range(2):
            col = INK if (i + j) % 2 == 0 else WHITE
            wav = 6 * math.sin(t * 6 + i)
            c.drawRect(skia.Rect.MakeXYWH(fx + i * 30, 240 + j * 30 + wav, 30, 30), paint(col, dim))
    text(c, "FINISH", fx - 10, 520, 30, INK, "mono", a=dim)
    # buoys along the course
    bh = hits_in("buoy", 31)
    for k, h in enumerate(bh):
        if t >= h:
            u = pop(h, t, 0.3)
            c.drawCircle(1000 + k * 200, 380, 22 * u, paint(HI))
            c.drawCircle(1000 + k * 200, 380, 22 * u, paint(INK, 1, 5))
    # the lagoon and its respawning targets
    cx, cy, r = LAGOON
    if t >= B(31) + BEAT:
        u = pop(B(31) + BEAT, t, 0.4)
        lag = skia.Path()
        lag.addCircle(cx, cy, (r + 90) * u)
        c.drawPath(lag, paint((0.47, 0.70, 0.82)))
        D.halftone(c, (cx - 300, cy - 300, cx + 300, cy + 300), D.radial(cx, cy, 0, 280, 0.5, 0.1), OVER, step=16,
                   angle=45, clip=lag)
        c.drawPath(lag, paint(INK, 1, 7, boil=D.boil_seed(t)))
        c.drawLine(cx + 240, cy - 120, 900, 440, paint(INK, 0.6, 4))
    hits_ = hits_in("lap", 32) + hits_in("bonk", 33) + hits_in("score", 34) + hits_in("flag", 35)
    for k in range(3):
        a_ = -math.pi / 2 + k * 2 * math.pi / 3
        tx_, ty_ = cx + r * math.cos(a_), cy + r * math.sin(a_)
        last = max([h for h in hits_ if h <= t] or [-9])
        hot = (t - last) < 0.15 and (count(hits_, t) % 3 == k)
        if t >= B(31) + BEAT:
            rr = 26 * (0.6 if hot else 1.0)
            c.drawCircle(tx_, ty_, rr + 10, paint(RED if not hot else HI))
            c.drawCircle(tx_, ty_, rr + 10, paint(INK, 1, 5))
            c.drawCircle(tx_, ty_, rr - 6, paint(WHITE))
    bx_, by_, ang = boat_pos(t)
    fire = 1.0 if t >= B(33) else 0.0
    boat(c, bx_, by_, ang, 1.25, fire, t)
    # the score
    nscore = count(hits_, t)
    f = D.font(96, "num")
    s = f"{nscore * 50:,}"
    text(c, "SCORE", 1380, 640, 34, INK, "mono")
    c.drawString(s, 1380 + 8, 750 + 8, f, paint(OVER, 0.9, mult=True))
    c.drawString(s, 1380, 750, f, paint(HI))
    c.drawString(s, 1380, 750, f, paint(INK, 1, 4))
    # bar 34: the comparison card
    sh = hits_in("score", 34)
    if t >= sh[0]:
        u = pop(sh[0], t, 0.35)
        at(c, 1500, 640, u)
        r_ = skia.Rect.MakeXYWH(-300, -110, 600, 300)
        card(c, r_, fill=PAPER, lw=6)
        for k, (lab, v, col) in enumerate((("人类玩家", 1.0, OVER), ("AI", 1.2, RED))):
            if t >= sh[min(3, k + 1)]:
                ww = 340 * v * clamp((t - sh[k + 1]) / 0.3)
                c.drawRect(skia.Rect.MakeXYWH(-120, -60 + k * 110, ww, 70), paint(col))
                c.drawRect(skia.Rect.MakeXYWH(-120, -60 + k * 110, ww, 70), paint(INK, 1, 4))
            text(c, lab, -140, -12 + k * 110, 36, INK, "sans", "right")
        if t >= sh[3]:
            text(c, "+20%", -120, 168, 40, RED, "num")
        c.restore()
    hud(c, t, "FIG. 3 · B")
    shake(x, t, ("bonk",), 33, 12, 0.1)
    if later:
        x.zoom = 1.0
    else:
        push(x, t - B(31), 3 * BAR, 1.06)
    x.fx, x.fy = 960, 560


@shot(B(36), B(37), tin=0.0, tout=0.0, kin="cut", kout="cut")
def hack(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 320, 0.75), OVER, step=22, angle=15)
    robot(c, 380, 660, 0.9, t, blink=int(t * 3) % 6 == 0)
    sh = hits_in("stamp", 36)[0]
    D.stamp(c, 860, 470, "奖励作弊", "REWARD HACKING", (t - sh) / 0.5 if t - sh < 1 else 1.0, rot=-9, size=104)
    for k, (lab, mark, col) in enumerate((("得分", "↑", INK), ("规则", "✓", INK), ("比赛", "✗", RED))):
        h = hits_in("chip", 36)[k]
        u = pop(h, t, 0.3)
        pill(c, lab, 1400, 420 + k * 150, 54, fill=HI if k < 2 else PAPER, u=u)
        if u > 0:
            if mark == "↑":
                arrow_up(c, 1580, 420 + k * 150, 0.9, col, u)
            elif mark == "✓":
                at(c, 1580, 420 + k * 150, u)
                c.drawPath(_poly([(-26, 0), (-6, 22), (30, -26)]), paint(col, 1, 12))
                c.restore()
            else:
                at(c, 1580, 420 + k * 150, u)
                c.drawLine(-24, -24, 24, 24, paint(col, 1, 12))
                c.drawLine(24, -24, -24, 24, paint(col, 1, 12))
                c.restore()
    hud(c, t, "FIG. 3 · C")
    push(x, lt, BAR, 1.04)
    shake(x, t, ("stamp",), 36, 22)
    x.flash = 0.45 * math.exp(-(t - sh) / 0.08) if t >= sh else 0.0


@shot(B(37), B(38), tin=0.0, tout=0.0, kin="cut", kout="cut")
def match(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.ramp(200, 1080, 0.0, 0.4), OVER, step=22, angle=15)
    mh = hits_in("match", 37)
    D.headline(c, "同一张图", 110, 250, 110, t, B(37) + 0.05)
    for k, (yr, l1, l2) in enumerate((("1902", "交一条尾巴", "= 一分钱"), ("2016", "撞一个道具", "= 加分"))):
        if t < mh[k * 2]:
            continue
        u = pop(mh[k * 2], t, 0.35)
        cx_ = 520 + k * 880
        at(c, cx_, 600, u, -3 + k * 6)
        r = skia.Rect.MakeXYWH(-330, -200, 660, 400)
        card(c, r, fill=PAPER if k == 0 else (0.86, 0.90, 0.95), lw=7)
        text(c, yr, -290, -120, 44, RED, "mono")
        text(c, l1, 0, 10, 72, INK, "serif", "center")
        text(c, l2, 0, 120, 72, INK, "serif", "center")
        c.restore()
    if t >= mh[1]:
        D.tail_icon(c, 600, 380, 1.2 * pop(mh[1], t), 1.0, t, -10)
    if t >= mh[3]:
        u = pop(mh[3], t, 0.3)
        at(c, 960, 600, u)
        f = D.font(150, "num")
        c.drawString("=", -f.measureText("=") / 2, 50, f, paint(RED))
        c.restore()
    hud(c, t, "FIG. 3")
    push(x, lt, BAR, 1.04)
    beat_pulse(x, t)


# ------------------------------------------------------------------ FIG. 4: you
@shot(B(38), B(39), tin=0.0, tout=0.0, kin="cut", kout="cut")
def fig4(c, x, t, lt):
    fig_card(c, x, t, lt, 38, "4", "你的尾巴", "FIG. 4")


CHIPS = ["步数", "体重", "存款", "点赞", "绩效"]
SOFT = ["健康", "安心", "被喜欢", "把事做好"]
LINKS = [(0, 0), (1, 0), (2, 1), (3, 2), (4, 3)]


@shot(B(39), B(44), tin=0.0, tout=0.0, kin="cut", kout="cut")
def yours(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.radial(960, 600, 100, 800, 0.0, 0.45), HI, step=22, angle=20)
    first = t < B(40)
    if first:
        D.headline(c, "你也有吗？", 110, 250, 110, t, B(39) + 0.05)
        person(c, 960, 700, 1.6, t)
        for k, h in enumerate(hits_in("q", 39)):
            qmark(c, 700 + k * 170, 420 + (k % 2) * 60, 1.1, pop(h, t, 0.3), RED if k % 2 else INK)
        hud(c, t, "FIG. 4 · A")
        push(x, lt, BAR, 1.04)
        return
    D.headline(c, "数字 → 真正的事", 110, 250, 100, t, B(40) + 0.05, hi_idx=(5, 6, 7, 8))
    ch = hits_in("chipw", 40)
    ln = hits_in("line", 41)
    so = hits_in("soft", 42)
    sp = hits_in("split", 43)
    nsp = count(sp, t)
    wig = hits_in("q", 40)[0]
    for k, lab in enumerate(CHIPS):
        if t < ch[k]:
            continue
        u = pop(ch[k], t, 0.3)
        y = 380 + k * 112
        if t >= wig and t - wig < 0.4:
            y += 8 * math.sin((t - wig) * 40) * (1 - (t - wig) / 0.4)
        pill(c, lab, 420, y, 46, fill=HI, u=u)
        if nsp:
            arrow_up(c, 580, y, 0.7 + 0.15 * nsp, INK, 1.0)
    for k, (a_, b_) in enumerate(LINKS):
        h = ln[min(3, k)] + (0.2 if k == 4 else 0)
        if t < h:
            continue
        v = clamp((t - h) / 0.3)
        ya, yb = 380 + a_ * 112, 400 + b_ * 135
        p = skia.Path()
        p.moveTo(640, ya)
        p.cubicTo(860, ya, 1000, yb, lerp(640, 1180, v), lerp(ya, yb, v))
        lp = paint(INK, 1 - 0.18 * nsp, 6)
        lp.setPathEffect(skia.DashPathEffect.Make([22, 14 + 6 * nsp], 0))
        c.drawPath(p, lp)
    for k, lab in enumerate(SOFT):
        if t < so[k]:
            continue
        u = pop(so[k], t, 0.35)
        y = 400 + k * 135
        fade = 1 - 0.18 * nsp
        pill(c, lab, 1400, y, 50, fill=PAPER, u=u, a=max(0.35, fade))
        if nsp > k:
            qmark(c, 1640, y, 0.8, pop(sp[k], t, 0.3))
    hud(c, t, "FIG. 4 · B")
    push(x, lt - BAR, 4 * BAR, 1.05)
    beat_pulse(x, t)


@shot(B(44), B(45), tin=0.0, tout=0.0, kin="cut", kout="cut")
def likes(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.radial(1300, 560, 80, 760, 0.0, 0.5), RED, step=22, angle=20)
    D.headline(c, "点赞 +1", 110, 250, 110, t, B(44) + 0.05)
    lh = hits_in("like", 44)
    n = count(lh, t)
    phone(c, 1300, 600, 1.0, 6)
    at(c, 1300, 600, 1.0, 6)
    hp = heart_path(0, -30, 60)
    c.drawPath(hp, paint(RED))
    c.drawPath(hp, paint(INK, 1, 5))
    f = D.font(96, "num")
    s = str(12 + n * 7)
    c.drawString(s, -f.measureText(s) / 2, 120, f, paint(INK))
    c.restore()
    for k, h in enumerate(lh):
        if t >= h and t - h < 0.9:
            u = clamp((t - h) / 0.9)
            at(c, 1420 + (k % 3) * 50, 420 - 260 * ease_out(u), 0.6 + 0.4 * (1 - u))
            c.drawPath(heart_path(0, 0, 30), paint(RED, 1 - u))
            c.restore()
    # the viewer's heart empties dot by dot
    person(c, 560, 700, 1.6, t, heart=max(0.08, 0.8 - n * 0.09))
    hud(c, t, "FIG. 4 · C")
    push(x, lt, BAR, 1.04)
    beat_pulse(x, t)


@shot(B(45), B(46), tin=0.0, tout=0.0, kin="cut", kout="cut")
def me(c, x, t, lt):
    loop(c, x, t, lt, b0=45, head="我们也会这样", hi=(0, 1), ex="FIG. 4 · D")


@shot(B(46), B(48), tin=0.0, tout=0.0, kin="cut", kout="cut")
def light(c, x, t, lt):
    c.drawRect(skia.Rect.MakeWH(W, H), paint(INK))
    lh, gh = hits_in("light", 46), hits_in("glow", 47)
    sw = 0.5 + 0.12 * sum(math.exp(-(t - h) / 0.3) for h in lh if t >= h)
    D.halftone(c, (0, 0, W, H), D.radial(720, 560, 40, 620, 0.0, min(0.9, sw)), HI, step=24, angle=20, mult=False)
    f = D.font(220, "num")
    s = "10,000"
    c.drawString(s, 720 - f.measureText(s) / 2 + 10, 640 + 10, f, paint(RED, 0.8))
    c.drawString(s, 720 - f.measureText(s) / 2, 640, f, paint(HI))
    c.drawString(s, 720 - f.measureText(s) / 2, 640, f, paint(INK, 1, 5))
    # the real thing, in the dark, glowing a little more with each beat of bar 47
    gw = 0.08 + 0.1 * count(gh, t) + 0.05 * math.sin(t * 3)
    D.halftone(c, (1300, 300, 1800, 800), D.radial(1550, 560, 10, 240, 0.0, min(0.9, gw * 2.4)), (0.98, 0.82, 0.55), step=18,
               angle=40, mult=False)
    pill(c, "健康", 1550, 560, 48, fill=(0.36, 0.40, 0.56), txt=PAPER, u=1.0, a=min(1.0, 0.85 + 0.05 * count(gh, t)))
    D.headline(c, "会发光的" if t < B(47) else "不会发光的", 110, 250, 104, t, (B(47) if t >= B(47) else B(46)) + 0.05,
               col=PAPER, shadow=RED)
    hud(c, t, "FIG. 4 · E", dark=True)
    push(x, lt, 2 * BAR, 1.05)


# ------------------------------------------------------------------ back to Hanoi
@shot(B(48), B(49), tin=0.0, tout=0.0, kin="cut", kout="cut")
def hanoi(c, x, t, lt):
    sewer(c, x, t, lt, b0=48)


@shot(B(49), B(50), tin=0.0, tout=0.0, kin="cut", kout="cut")
def annul(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 300, 0.8), OVER, step=22, angle=15)
    th = hits_in("tear", 49)
    nt = count(th, t)
    sh = hits_in("stamp", 49)[0]
    for half in (0, 1):
        off = (nt * 26) * (1 if half else -1)
        rot = (nt * 2.2) * (1 if half else -1)
        c.save()
        clipr = skia.Rect.MakeLTRB(0 if half == 0 else 960, 0, 960 if half == 0 else W, H)
        c.translate(off, nt * 10)
        c.rotate(rot, 960, 540)
        c.clipRect(clipr)
        c.rotate(-2.5)
        card(c, skia.Rect.MakeXYWH(300, 220, 1320, 640), fill=PAPER, lw=8)
        D.headline(c, "悬赏", 380, 370, 110, 99, 0, col=RED)
        D.headline(c, "交一条尾巴", 380, 600, 120, 99, 0, hi_idx=(3, 4))
        D.headline(c, "＝ 一分钱", 380, 760, 120, 99, 0)
        c.restore()
    D.stamp(c, 1240, 520, "取消", "ANNULÉ", (t - sh) / 0.5 if t - sh < 1 else 1.0, rot=-12, size=130)
    hud(c, t, "EXHIBIT 10")
    shake(x, t, ("stamp", "tear"), 49, 16)
    x.flash = 0.4 * math.exp(-(t - sh) / 0.08) if t >= sh else 0.0


@shot(B(50), B(52), tin=0.0, tout=0.0, kin="cut", kout="cut")
def neq(c, x, t, lt):
    second = t >= B(51)
    D.halftone(c, (0, 0, W, H), D.radial(960, 600, 100, 800, 0.0, 0.5), HI if second else OVER, step=22, angle=20)
    nh = hits_in("neq", 51 if second else 50)
    lab_l, lab_r = ("尾巴", "老鼠") if not second else ("数字", "你想要的")
    for k, (cx_, lab, h) in enumerate(((520, lab_l, nh[0]), (1400, lab_r, nh[2]))):
        if t < h:
            continue
        u = pop(h, t, 0.35)
        if not second:
            if k == 0:
                D.tail_icon(c, cx_, 600, 3.2 * u, 1.0, t, -12)
            else:
                D.rat(c, cx_, 640, 1.6 * u + 0.001, t, tail=1.0, look=-0.5)
        else:
            if k == 0:
                at(c, cx_, 600, u)
                f = D.font(200, "num")
                c.drawString("98", -f.measureText("98") / 2, 70, f, paint(HI))
                c.drawString("98", -f.measureText("98") / 2, 70, f, paint(INK, 1, 5))
                c.restore()
            else:
                person(c, cx_, 640, 1.15 * u + 0.001, t, heart=0.75)
        text(c, lab, cx_, 900, 54, INK, "sans", "center", a=clamp(u))
    if t >= nh[1]:
        u = pop(nh[1], t, 0.3)
        at(c, 960, 600, u)
        c.drawLine(-80, -30, 80, -30, paint(RED, 1, 22))
        c.drawLine(-80, 30, 80, 30, paint(RED, 1, 22))
        c.drawLine(50, -100, -50, 100, paint(RED, 1, 22))
        c.restore()
    if t >= nh[3]:
        D.headline(c, "从来不是", 110, 250, 110, t, nh[3], hi_idx=(2, 3))
    hud(c, t, "EXHIBIT 11")
    push(x, (t - B(51)) if second else lt, BAR, 1.05)
    shake(x, t, ("neq",), 50, 6, 0.1)


@shot(B(52), B(53), tin=0.0, tout=0.0, kin="cut", kout="cut")
def window_(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 300, 0.6), OVER, step=22, angle=15)
    D.headline(c, "一扇窗", 110, 250, 120, t, B(52) + 0.05)
    wh = hits_in("win", 52)
    fr = skia.Rect.MakeXYWH(560, 300, 800, 600)
    c.drawRect(fr, paint((0.88, 0.80, 0.62)))
    D.halftone(c, (560, 300, 1360, 900), D.ramp(300, 900, 0.1, 0.5), OVER, step=16, angle=45)
    # the city beyond: rooftops and rats
    c.drawPath(_poly([(560, 760), (640, 690), (720, 760), (820, 660), (920, 760), (1040, 700), (1160, 760),
                      (1260, 680), (1360, 760), (1360, 900), (560, 900)], True), paint(INK, 0.85))
    for k in range(count(wh, t)):
        D.rat(c, 680 + k * 180, 840, 0.45, t + k, tail=1, run=t * 6 + k)
    for k in range(count(wh, t)):
        i, j = k % 2, k // 2
        r = skia.Rect.MakeXYWH(560 + i * 400, 300 + j * 300, 400, 300)
        c.drawRect(r, paint(INK, 1, 16))
    c.drawRect(fr, paint(INK, 1, 22))
    hud(c, t, "EXHIBIT 12")
    push(x, lt, BAR, 1.06)
    beat_pulse(x, t)


# ------------------------------------------------------------------ closing lines on a dark page
@shot(B(53), B(57), tin=0.0, tout=0.0, kin="cut", kout="cut")
def gold(c, x, t, lt):
    c.drawRect(skia.Rect.MakeWH(W, H), paint(INK))
    D.halftone(c, (0, 0, W, H), D.radial(960, 1080, 100, 1100, 0.55, 0.05), OVER, step=24, angle=30, mult=False)
    gh = window("gold", 53, 57)
    for bar, line in GOLD:
        if not (B(bar) <= t < B(bar + 1)) and not (bar == 56 and t >= B(56)):
            continue
        hs = hits_in("gold", bar)
        n = len(line)
        grp = [hs[min(3, i * 4 // n)] + (i % max(1, n // 4)) * 0.06 for i in range(n)]
        f = D.font(110, "serif")
        wsum = sum(f.measureText(ch) for ch in line)
        xx = 960 - wsum / 2
        for i, ch in enumerate(line):
            hi_ = bar == 56 and ch in "老鼠真的变少"
            D.headline(c, ch, xx, 540, 110, t, grp[i], col=HI if hi_ else PAPER, shadow=RED)
            xx += f.measureText(ch)
    # the rat, its tail grown back, watches from the bottom
    D.rat(c, 960, 860, 0.9, t, tail=1.0, look=-0.2 + 0.2 * math.sin(t), blink=int(t * 2) % 7 == 0)
    hud(c, t, "CLOSING", dark=True)
    x.zoom = 1.0 + 0.004 * math.sin(t * 1.3) + 0.006 * S.pulse("kick", t, 0.12)
    x.fx, x.fy = 960 + 6 * math.sin(t * 0.7), 540 + 4 * math.cos(t * 0.9)


# ------------------------------------------------------------------ end title and references
@shot(B(57), B(59), tin=0.0, tout=0.0, kin="cut", kout="cut")
def endtitle(c, x, t, lt):
    title(c, x, t, lt, b0=57)


@shot(B(59), B(62), tin=0.0, tout=0.0, kin="cut", kout="cut")
def refs(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.edge(W, H, 140, 0.6), OVER, step=22, angle=15)
    D.headline(c, "参考", 110, 230, 90, t, B(59) + 0.05)
    rh = window("ref", 59, 62)
    for k, line in enumerate(REFS):
        h = rh[k * 2] if k * 2 < len(rh) else rh[-1]
        if t < h:
            continue
        u = clamp((t - h) / 0.4)
        n = max(1, int(len(line) * u))
        head = line.split("   ")[0]
        c.drawString(head[:n], 160, 340 + k * 74, D.font(28, "mono"), paint(INK))
    if t >= rh[-3]:
        c.drawString("片中图表与数字为示意。", 160, 340 + len(REFS) * 74 + 20, D.font(28, "sans"), paint(OVER))
    # the rat strolls off with its tail
    u = clamp((t - B(60)) / (2 * BAR))
    D.rat(c, lerp(900, 2150, u), 880, 0.9, t, tail=1.0, run=t * 9 if u > 0 else 0)
    if t >= rh[-2]:
        D.stamp(c, 1560, 820, "结案", "CASE CLOSED", (t - rh[-2]) / 0.5 if t - rh[-2] < 1 else 1.0, rot=-8, size=70)
    hud(c, t, "CASE CLOSED")
    push(x, lt, 3 * BAR, 1.03)


# ------------------------------------------------------------------ the page
CAPS = captions() + [(t_of(8, 3) + 0.1, B(10) - 0.2, TITLE_Q), (t_of(57, 3) + 0.1, B(59) - 0.2, TITLE_Q)]


def setup():
    D.paper_image(W, H)


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
    D.hud(c, t, "CASE 1902-HN", HUD.get("ex", "INTRO"), "1902 · HANOI", HUD.get("dark", False))
    for t0, t1, text in CAPS:
        D.caption_bar(c, text, t, t0, t1)
    for b, bt_ in WIPES_:
        wh = t_of(b, bt_)
        if wh - 0.05 <= t <= wh + 0.9:
            D.dot_wipe(c, (t - wh) / ((B(b + 1) - wh) * 2), RED if b in (19, 47, 56) else INK)
    c.drawImage(D.paper_image(W, H), 0, 0, skia.SamplingOptions(), skia.Paint(BlendMode=skia.BlendMode.kMultiply))
    D.grain(c, t)
    if x.flash > 0:
        c.drawPaint(paint(WHITE, min(0.5, x.flash)))
    fade = smooth(t / 0.05) * smooth((tl.dur - t) / 0.6)
    if fade < 0.999:
        c.drawPaint(paint(INK, 1 - fade))
    return post.finish(post.to_array(surf).astype(np.int16)).astype(np.uint8).tobytes()


if __name__ == "__main__":
    run(frame, setup, tl.dur, tl.fps, OUT, f"{TITLE}.mp4")
