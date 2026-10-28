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
from cues import BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, captions, hit_times, t_of  # noqa: E402

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
def sewer(c, x, t, lt):
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
    for k, h in enumerate(window("eyes", 0, 1)):
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
    D.headline(c, "1902 · 河内", 110, 250, 120, t, 0.05, col=PAPER, shadow=RED)
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
def loop(c, x, t, lt):
    D.halftone(c, (0, 0, W, H), D.radial(980, 570, 60, 520, 0.0, 0.6), OVER, step=22, angle=15)
    D.headline(c, "一条尾巴，两次钱", 110, 250, 100, t, B(5) + 0.05, hi_idx=(5, 6, 7))
    lh = window("loop", 5, 6)
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
    hud(c, t, "EXHIBIT 04")
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
def title(c, x, t, lt):
    th = window("title", 8, 9)[0]
    pulses = window("pulse", 9, 10)
    halo = 0.55 + 0.25 * sum(math.exp(-(t - h) / 0.25) for h in pulses if t >= h)
    D.halftone(c, (0, 0, W, H), D.radial(1450, 600, 60, 640, 0.0, min(0.95, halo)), OVER, step=24, angle=15)
    D.halftone(c, (0, 0, W, H), D.radial(1450, 600, 0, 420, 0.0, 0.5), HI, step=24, angle=45)
    chars = window("char", 8, 9)
    for i, ch in enumerate(TITLE):
        D.headline(c, ch, 110 + i * 210, 400, 210, t, chars[i])
    sh = window("sub", 8, 9)[0]
    if t >= sh:
        u = clamp((t - sh) / 0.4)
        f = D.font(46, "serif")
        c.drawString(CONCEPT[: max(0, int(len(CONCEPT) * u * 1.6))], 118, 490, f, paint(INK))
        fm = D.font(30, "mono")
        c.drawString(CONCEPT_EN, 118 + f.measureText(CONCEPT) + 24, 488, fm, paint(OVER))
    D.rat(c, 1450, 640, 1.5, t, tail=0.0, look=-0.4 + 0.3 * math.sin(t * 1.4), blink=int(t * 3) % 8 == 0)
    lh = window("law", 9, 10)[0]
    if t >= lh:
        D.stamp(c, 560, 700, "指标成了目标", "STRATHERN, 1997", (t - lh) / 0.5 if t - lh < 1 else 1.0, rot=-6, size=72)
    hud(c, t, "CASE OPEN")
    push(x, lt, 2 * BAR, 1.04)
    shake(x, t, ("title", "law"), 8, 18)
    x.flash = 0.45 * math.exp(-(t - th) / 0.08) if t >= th else 0.0
    beat_pulse(x, t)


# ------------------------------------------------------------------ the page
CAPS = captions() + [(t_of(8, 3) + 0.1, B(10) - 0.2, TITLE_Q)]


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
    wh = hit_times("wipe")[0]
    if wh - 0.05 <= t <= wh + 0.9:
        D.dot_wipe(c, (t - wh) / ((B(8) - wh) * 2))
    c.drawImage(D.paper_image(W, H), 0, 0, skia.SamplingOptions(), skia.Paint(BlendMode=skia.BlendMode.kMultiply))
    D.grain(c, t)
    if x.flash > 0:
        c.drawPaint(paint(WHITE, min(0.5, x.flash)))
    fade = smooth(t / 0.05) * smooth((tl.dur - t) / 0.6)
    if fade < 0.999:
        c.drawPaint(paint(INK, 1 - fade))
    return post.finish(post.to_array(surf).astype(np.int16)).astype(np.uint8).tobytes()


if __name__ == "__main__":
    run(frame, setup, tl.dur, tl.fps, OUT, f"{TITLE}_试片.mp4")
