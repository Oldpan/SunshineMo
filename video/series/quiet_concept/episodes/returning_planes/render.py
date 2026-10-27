"""回来的飞机（幸存者偏差 · Survivorship bias） — 一帧一理 episode 5 in blueprint (蓝图 / 工程制图), cold-open test.

  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 1 3.5 6 8.5 11 13 15.5 18 20 23
  python3 render.py                                    # 1920x1080 @ 60 fps

One sheet of cyanotype paper.  A returning bomber (a generic outline, not a real type) is drafted layer by
layer, the ground crew's holes are stamped on it, the intuitive armour is hatched in, then the empty engines
are clouded, ballooned "0", and the planes that did not come back are drawn as phantom lines.  The draftsman's
hand shadow follows the nib.  The only red is the stamp.  Nothing ever holds still and the score never drops
to silence (series rule).
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
from core.gfx import clamp, lerp, smooth, ease_out, ease_io  # noqa: E402
from core import post  # noqa: E402
from style import parse_marks  # noqa: E402
from bp import (LINE, col4, paint, sheet_image, paper_fill, poly_path, stroke, line, hatch, letter, balloon,  # noqa
                rev_cloud, note_box, stamp, hand, font, CENTER, HIDDEN, PHANTOM)
from cues import BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, ZONES, captions, hit_times, t_of  # noqa

W, H = 1920, 1080
tl = Timeline(bpm=BPM, bars=BARS, sections=SECTIONS, hard_cuts=True)
B, shot, BAR, BEAT = tl.B, tl.shot, tl.bar, tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))


def hits(name, lo=0):
    return [h for h in hit_times(name) if h >= B(lo) - 1e-6]


def window(name, lo, hi):
    return [h for h in hit_times(name) if B(lo) - 1e-6 <= h < B(hi) - 1e-6]


def since(name, t, lo=0):
    ts = [h for h in hits(name, lo) if h <= t + 1e-6]
    return t - ts[-1] if ts else 1e9


def count(name, t, lo=0):
    return sum(1 for h in hits(name, lo) if h <= t + 1e-6)


def pop(name, t, dur=0.22, lo=0):
    s = since(name, t, lo)
    return ease_out(clamp(s / dur), 4) if s < 1e8 else 0.0


def grow(h, t, dur):
    """0..1 from hit time h over dur (drafting speed)."""
    return clamp((t - h) / dur)


# ------------------------------------------------------------------ the plane (plane coords, nose up, 1 = 1 px)
PX, PY, PS = 820, 600, 1.0


def P(x, y):
    return PX + x * PS, PY + y * PS


def fuselage_pts():
    ys = np.linspace(-270, 250, 60)
    right = []
    for y in ys:
        w = 34 * math.sqrt(clamp((y + 270) / 70)) if y < -200 else 34 - 24 * clamp((y - 120) / 130)
        right.append((w, y))
    return [P(x, y) for x, y in right] + [P(-x, y) for x, y in reversed(right)]


WING_R = [(30, -30), (440, -6), (440, 28), (30, 62)]
TAIL_R = [(12, 192), (165, 214), (165, 238), (12, 240)]
ENGINES = [(-250, -34), (-130, -38), (130, -38), (250, -34)]           # nacelle centres
ENG_W, ENG_H = 30, 100


def wing_pts(side):
    return [P(side * x, y) for x, y in WING_R]


def tail_pts(side):
    return [P(side * x, y) for x, y in TAIL_R]


def nacelle_path(ex, ey):
    p = skia.Path()
    x, y = P(ex, ey)
    p.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x - ENG_W / 2 * PS, y - ENG_H / 2 * PS, ENG_W * PS,
                                                        ENG_H * PS), 12, 12))
    return p


def in_engine(x, y):
    return any(abs(x - ex) < ENG_W / 2 + 10 and abs(y - ey) < ENG_H / 2 + 10 for ex, ey in ENGINES)


def make_holes():
    """Twenty holes in hit order: wings, fuselage, tail; never on the engines or the cockpit (illustrative)."""
    r = np.random.default_rng(7)
    zones = ["机翼", "机身", "机翼", "尾翼", "机翼", "机身", "机翼", "机身"] + \
            ["机翼", "机身", "机翼", "尾翼", "机翼", "机身", "机翼", "尾翼", "机身", "机翼", "机身", "尾翼"]
    out = []
    for z in zones:
        while True:
            if z == "机翼":
                s = r.choice([-1, 1])
                x = r.uniform(60, 420)
                f = (x - 30) / 410
                y = r.uniform(lerp(-30, -6, f) + 8, lerp(62, 28, f) - 8)
                x *= s
            elif z == "机身":
                x, y = r.uniform(-18, 18), r.uniform(-170, 180)
            else:
                s = r.choice([-1, 1])
                x, y = s * r.uniform(30, 150), r.uniform(205, 232)
            if not in_engine(x, y) and all(math.hypot(x - a, y - b) > 26 for a, b, _ in out):
                out.append((x, y, z))
                break
    return out


HOLES = make_holes()
HOLE_T = window("hole", 2, 4)


def draw_hole(c, x, y, s, a=1.0, big=0.0):
    """A damage mark: a small circle and four ticks; a ring flies out on impact."""
    if s < 0:
        return
    u = ease_out(clamp(s / 0.08), 3)
    r = 6.5 * u
    c.drawCircle(x, y, r, paint(0.95 * a, 1.6))
    for k in range(4):
        ang = math.pi / 4 + k * math.pi / 2
        c.drawLine(x + math.cos(ang) * r * 1.4, y + math.sin(ang) * r * 1.4, x + math.cos(ang) * r * 2.3,
                   y + math.sin(ang) * r * 2.3, paint(0.85 * a, 1.3))
    if s < 0.3:
        c.drawCircle(x, y, 6 + 60 * ease_out(s / 0.3, 2), paint(0.6 * (1 - s / 0.3) * a, 1.2))


def plane(c, t, lo=1, a=1.0, ghost=False, scale_path=None):
    """The drafted outline: fuselage, wings, engines, tail, each layer on its own `draw` beat."""
    dr = window("draw", lo, lo + 1)
    us = [grow(h, t, BEAT * 0.85) for h in dr]
    nibs = []
    fus = poly_path(fuselage_pts(), True)
    wings = [poly_path(wing_pts(s), True) for s in (-1, 1)]
    tails = [poly_path(tail_pts(s), True) for s in (-1, 1)]
    # painter's order: solids filled with paper, then stroked
    if us[1] > 0:
        for p in wings:
            nibs.append(stroke(c, p, 2.6, us[1], a))
    if us[0] > 0:
        if us[0] >= 1:
            paper_fill(c, fus)
        nibs.append(stroke(c, fus, 3.0, us[0], a))
        x0, y0 = P(0, -300)
        x1, y1 = P(0, 290)
        line(c, [(x0, y0), (x1, y1)], 1.0, us[0], 0.6 * a, dash=CENTER, nib=False)
        cx_, cy_ = P(0, -232)
        ck = skia.Path()
        ck.addArc(skia.Rect.MakeXYWH(cx_ - 20, cy_ - 14, 40, 28), 180, 180)
        stroke(c, ck, 1.6, us[0], a, nib=False)
    if us[2] > 0:
        for k, (ex, ey) in enumerate(ENGINES):
            uu = clamp(us[2] * 1.6 - k * 0.2)
            p = nacelle_path(ex, ey)
            if uu >= 1:
                paper_fill(c, p)
            nibs.append(stroke(c, p, 2.2, uu, a))
            px_, py_ = P(ex, ey - ENG_H / 2 - 8)
            if uu >= 1:
                c.drawLine(px_ - 18, py_, px_ + 18, py_, paint(0.8 * a, 1.6))       # propeller disc, edge-on
    if us[3] > 0:
        for p in tails:
            nibs.append(stroke(c, p, 2.4, us[3], a))
        fx, fy = P(0, 168)
        line(c, [(fx, fy), (fx, fy + 86)], 6, us[3], a, nib=False)
    return [n for n in nibs if n is not None]


def region_paths():
    return {"wingL": poly_path(wing_pts(-1), True), "wingR": poly_path(wing_pts(1), True),
            "fus": poly_path(fuselage_pts(), True), "tailL": poly_path(tail_pts(-1), True),
            "tailR": poly_path(tail_pts(1), True)}


def engines_union():
    p = skia.Path()
    for ex, ey in ENGINES:
        p.addPath(nacelle_path(ex, ey))
    return p


# ------------------------------------------------------------------ sheet furniture
def header(c, t, u=1.0, strike=0.0):
    letter(c, "FIG. 1", 92, 104, 34, u, kind="monob")
    letter(c, "返航飞机 · 弹孔分布", 250, 104, 34, u)
    if strike > 0:
        line(c, [(84, 92), (lerp(84, 640, strike), 92)], 3, 1.0, nib=False)
    c.drawLine(80, 124, 1840, 124, paint(0.55, 1.2))


def title_block(c, t, a=1.0, status="审核中"):
    x, y, w, h = 1430, 905, 410, 120
    c.drawRect(skia.Rect.MakeXYWH(x, y, w, h), paint(0.9 * a, 1.8))
    for yy in (y + 40, y + 80):
        c.drawLine(x, yy, x + w, yy, paint(0.6 * a, 1))
    c.drawLine(x + 120, y, x + 120, y + h, paint(0.6 * a, 1))
    fm = font(16, "mono")
    for k, (kk, vv) in enumerate((("SHEET", "1 / 1"), ("SOURCE", "SRG · 1943"), ("STATUS", status))):
        c.drawString(kk, x + 12, y + 26 + k * 40, fm, paint(0.7 * a))
        f = font(22) if any(ord(ch) > 127 for ch in vv) else font(18, "mono")
        c.drawString(vv, x + 134, y + 28 + k * 40, f, paint(0.95 * a))


def border(c):
    c.drawRect(skia.Rect.MakeXYWH(40, 40, W - 80, H - 80), paint(0.8, 2.2))
    c.drawRect(skia.Rect.MakeXYWH(52, 52, W - 104, H - 104), paint(0.45, 1))


def tally(c, t, a=1.0):
    """The ground crew's count, one row per zone (illustrative numbers from this drawing)."""
    x, y = 1460, 300
    if a <= 0.003:
        return
    letter(c, "弹孔统计", x, y, 30, 1.0, a)
    w = letter(c, "示意", x + 140, y, 18, 1.0, 0.6 * a)
    letter(c, " · ILLUSTRATIVE", x + 140 + w, y, 16, 1.0, 0.6 * a, kind="mono")
    c.drawLine(x, y + 16, x + 360, y + 16, paint(0.8 * a, 1.4))
    n = {z: 0 for z in ZONES}
    for (hx, hy, z), h in zip(HOLES, HOLE_T):
        if t >= h:
            n[z] += 1
    cs = window("count", 3, 4)
    for k, z in enumerate(ZONES):
        yy = y + 64 + k * 52
        letter(c, z, x + 8, yy, 30, 1.0, a)
        fm = font(34, "monob")
        s = str(n[z])
        c.drawString(s, x + 330 - fm.measureText(s), yy + 2, fm, paint(0.95 * a))
        c.drawLine(x, yy + 18, x + 360, yy + 18, paint(0.35 * a, 1))
        if k < 2 and k < len(cs) and t >= cs[k]:                     # 机翼最多，机身其次: underline
            line(c, [(x + 4, yy + 12), (x + 356, yy + 12)], 3, grow(cs[k], t, 0.18), a, nib=False)


# ------------------------------------------------------------------ shots
@shot(0, B(8), tin=0.0, tout=0.0, kin="cut", kout="cut")
def drawing(c, x, t, lt):
    nibs = []
    su = pop("sheet", t, 0.2)
    border(c)
    hu = grow(window("header", 0, 1)[0], t, BEAT * 0.9)
    header(c, t, hu)
    title_block(c, t, status="审核中" if t < B(5) else "复核")
    # bar 0: the centre line crosses the empty sheet; a small plane symbol comes home along a dashed track
    cl = grow(window("cline", 0, 1)[0], t, BEAT * 0.8)
    nibs.append(line(c, [P(0, -330), P(0, 330)], 1.2, cl, 0.8, dash=CENTER))
    lh = window("land", 0, 1)[0]
    if t < B(1):
        u = clamp((t - BEAT * 0.5) / (lh - BEAT * 0.5))
        path = [(1700 - 900 * v, 220 + 380 * v * v) for v in np.linspace(0, 1, 40)]
        line(c, path, 1.2, u, 0.6, dash=HIDDEN, nib=False)
        k = min(39, int(u * 39))
        px_, py_ = path[k]
        ang = math.degrees(math.atan2(path[min(39, k + 1)][1] - path[max(0, k - 1)][1],
                                      path[min(39, k + 1)][0] - path[max(0, k - 1)][0])) + 90
        c.save()
        c.translate(px_, py_)
        c.rotate(ang)
        c.scale(0.12, 0.12)
        c.translate(-PX, -PY)
        for p in [poly_path(fuselage_pts(), True)] + [poly_path(wing_pts(s), True) for s in (-1, 1)]:
            c.drawPath(p, paint(0.95, 14))
        c.restore()
        if t >= lh:
            ls = t - lh
            c.drawCircle(PX, PY, 10 + 120 * ease_out(clamp(ls / 0.5), 2), paint(0.7 * (1 - clamp(ls / 0.5)), 2))
    nibs += plane(c, t)
    # bars 2-3: the holes, eighths then sixteenths
    for (hx, hy, z), h in zip(HOLES, HOLE_T):
        draw_hole(c, *P(hx, hy), t - h)
    if t >= B(2):
        tally(c, t, smooth((t - B(2)) / 0.3))
    # bar 4: armour where the holes are, hatched one region per beat
    regions = region_paths()
    for k, (h, keys) in enumerate(zip(window("armor", 4, 5), (("wingL",), ("wingR",), ("fus",), ("tailL", "tailR")))):
        if t >= h:
            for kk in keys:
                hatch(c, regions[kk], grow(h, t, BEAT * 0.8), 12, 45, 1.0, 0.55 if t < B(5) else 0.3)
    if B(4) <= t < B(5):
        u = grow(B(4), t, 0.4)
        lx, ly = P(-300, 140)
        c.drawLine(lx + 30, ly - 34, lx + 50, ly - 92, paint(0.8 * u, 1.4))
        letter(c, "加固？", lx, ly, 34, u)
    # bar 5: revision clouds around the engines, the statistician's name, the pen taps a question mark
    for k, h in enumerate(window("cloud", 5, 6)):
        if t >= h:
            ex = -190 if k == 0 else 190
            nibs.append(rev_cloud(c, *P(ex, -36), 120, 86, grow(h, t, BEAT * 0.8), 1.0, 13, 2.4))
    nh = window("name", 5, 6)[0]
    if t >= nh:
        letter(c, "A. Wald · 统计研究组 · 哥伦比亚大学", 92, 990, 26, grow(nh, t, BEAT * 0.9))
    ph = window("pen", 5, 6)[0]
    if t >= ph:
        letter(c, "?", P(46, -230)[0], P(46, -230)[1], 60, grow(ph, t, 0.2), kind="handb")
    # bar 6: one balloon per engine, each says 0
    for k, h in enumerate(window("zero", 6, 7)):
        if t >= h:
            ex, ey = ENGINES[k]
            tx, ty = P(ex, ey - 20)
            bx, by = P(ex + (-40 if ex < 0 else 40), -170)
            balloon(c, bx, by, tx, ty, "0", grow(h, t, 0.3), 24, 1.0, 26)
    if t >= B(6):
        letter(c, "发动机：0", P(-470, 0)[0], P(0, -200)[1], 32, grow(B(6), t, 0.5), kind="handb")
    # bar 7: the planes that did not come back, as phantom lines, with their holes on the engines
    for k, h in enumerate(window("ghost", 7, 8)):
        s = t - h
        if s < 0:
            continue
        gx, gy = [(220, 420), (1230, 360), (420, 860), (1240, 840)][k]
        fall = 260 * ease_io(clamp((s - 0.4) / 1.6)) if s > 0.4 else 0
        a = clamp(s / 0.12) * (1 - clamp((s - 1.2) / 1.0))
        c.save()
        c.translate(gx, gy + fall)
        c.rotate(-8 + 16 * (k % 2) + 20 * clamp((s - 0.4) / 1.6) * (1 if k % 2 else -1))
        c.scale(0.32, 0.32)
        c.translate(-PX, -PY)
        for p in [poly_path(fuselage_pts(), True)] + [poly_path(wing_pts(sd), True) for sd in (-1, 1)] + \
                 [poly_path(tail_pts(sd), True) for sd in (-1, 1)] + [nacelle_path(*e) for e in ENGINES]:
            c.drawPath(p, paint(0.9 * a, 5, dash=PHANTOM))
        for j, (ex, ey) in enumerate(ENGINES):
            if j % 2 == k % 2 or j == k:
                draw_hole(c, *P(ex, ey), 1.0, a, 0)
        c.restore()
    if t >= B(7):
        letter(c, "未返航", 220, 320, 30, grow(B(7) + BEAT * 0.2, t, 0.4), kind="handb", align="center")
    # the draftsman's hand follows the live nib
    live = [n for n in nibs if n is not None]
    if live:
        hand(c, *live[-1], 0.45)
    x.zoom = 1 + 0.02 * smooth(t / B(8)) + 0.012 * math.exp(-min(since("sheet", t), since("land", t),
                                                                  since("ghost", t)) / 0.12)


@shot(B(8), B(10), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt):
    border(c)
    th = window("title", 8, 9)[0]
    header(c, t, 1.0, grow(th, t, 0.2))
    title_block(c, t, status="驳回" if t >= window("stamp", 8, 9)[0] else "复核")
    plane(c, t + 10, lo=1)                                           # the finished drawing stays on the sheet
    for (hx, hy, z), h in zip(HOLES, HOLE_T):
        draw_hole(c, *P(hx, hy), 1.0, 0.8)
    regions = region_paths()
    for kk in regions:
        hatch(c, regions[kk], 1.0, 12, 45, 1.0, 0.2)
    tally(c, t + 10, 0.9)
    # the title lettered big along the header, one character per sixteenth
    f = font(110, "handb")
    xx = 92
    for i, ch in enumerate(TITLE):
        s = t - hit_times("char")[i]
        if s >= 0:
            letter(c, ch, xx, 250, 110, clamp(s / 0.12) if s < 0.12 else 1.0, kind="handb")
        xx += f.measureText(ch) + 6
    u = grow(th + BEAT, t, 0.6)
    w = font(30, "hand").measureText(CONCEPT)
    letter(c, CONCEPT, 96, 300, 30, clamp(u * 2), 0.85)
    letter(c, f" · {CONCEPT_EN}", 96 + w, 300, 24, clamp(u * 2 - 1), 0.8, kind="mono")
    # the re-armour: hatch moves to the engines, one per beat
    for k, h in enumerate(window("rearmor", 9, 10)):
        if t >= h:
            hatch(c, nacelle_path(*ENGINES[k]), grow(h, t, BEAT * 0.6), 6, -45, 1.2, 0.95)
            if k == 0:
                letter(c, "该加固的，是这里", P(-190, -95)[0], P(-190, -95)[1] - 45, 32, grow(h, t, 0.6),
                       kind="handb", align="center")
    sh = window("stamp", 8, 9)[0]
    if t >= sh:
        stamp(c, 1560, 760, CONCEPT, CONCEPT_EN, ease_out(clamp((t - sh) / 0.12), 3))
        x.zoom = max(x.zoom, 1 + 0.02 * math.exp(-(t - sh) / 0.1))
    x.zoom = max(x.zoom, 1 + 0.03 * math.exp(-since("title", t, 8) / 0.25) + 0.006 * S.pulse("kick", t, 0.12))


# ------------------------------------------------------------------ the page
CAPS = captions() + [(t_of(8, 3) + 0.1, B(10) - 0.3, TITLE_Q, "top", 38)]
NOTE_POS = {"top": (330, 150)}


def notes(c, t):
    """Captions are drawing notes: lettered on in ~0.35 s in a NOTE box in the sheet's empty sky."""
    for k, (t0, t1, text, pos, size) in enumerate(CAPS):
        if not t0 <= t < t1 + 0.3:
            continue
        a = 1 - smooth((t - t1) / 0.3)
        plain = "".join(ch for ch, _ in parse_marks(text))
        x0, y0 = NOTE_POS[pos]
        if t >= B(8):
            x0, y0 = 760, 150
        note_box(c, x0, y0, 1000, plain, k + 1, size, clamp((t - t0) / 0.35), a)


def setup():
    sheet_image(W, H)


def frame(fi):
    t = fi / tl.fps
    surf = skia.Surface(W, H)
    c = surf.getCanvas()
    c.clear(col4((0.05, 0.067, 0.086), 1))
    x = Ctx(t)
    pic = tl.record(x, t)
    c.save()
    z = x.zoom
    c.translate(W / 2, H / 2)
    c.scale(z, z)
    c.translate(-W / 2, -H / 2)
    c.drawImage(sheet_image(W, H), 0, 0)
    c.drawPicture(pic)
    c.restore()
    notes(c, t)
    fade = smooth(t / 0.05) * smooth((tl.dur - t) / 1.0)
    if fade < 0.999:
        c.drawPaint(skia.Paint(Color4f=col4((0.05, 0.067, 0.086), 1 - fade)))
    return post.finish(post.to_array(surf).astype(np.int16)).astype(np.uint8).tobytes()


if __name__ == "__main__":
    run(frame, setup, tl.dur, tl.fps, OUT, f"{TITLE}_试片.mp4")
