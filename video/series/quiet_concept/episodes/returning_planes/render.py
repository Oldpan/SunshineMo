"""回来的飞机（幸存者偏差 · Survivorship bias） — 一帧一理 episode 5 in blueprint (蓝图 / 工程制图).

  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 6 15 22 30 36 45 52 58 70 80 90 100 110 125 132 140 147
  python3 render.py                                    # 1920x1080 @ 60 fps

One sheet of cyanotype paper, four figures.  FIG. 1: a returning bomber (a generic outline, not a real type) is
drafted, the ground crew's holes are stamped on it, the intuitive armour is hatched in; Wald's group clouds the
empty engines, the expected hits are dotted in, the planes that never came back are drawn as phantom lines, the
armour moves to the engines; the memo's own title; a filter diagram names the bias.  FIG. 2: a bookshelf of
success stories and the books nobody wrote.  FIG. 3: a product's users, the ones who left, the feedback a model
learns from.  FIG. 4: you, the group chat, the feed, the friend who went quiet.  Back to FIG. 1, the stamp,
the closing lines, the lights go off.  The only red is the stamp.  Nothing ever holds still and the score never
drops to silence (series rule); every shot keeps a slow camera move and the draftsman's hand.
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
from bp import (LINE, TABLE, col4, paint, sheet_image, paper_fill, poly_path, stroke, line, hatch, letter,  # noqa
                balloon, rev_cloud, note_box, stamp, hand, font, CENTER, HIDDEN, PHANTOM)
from cues import (BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, ZONES, GOLD, REFS, captions,  # noqa
                  hit_times, t_of)

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


def grow(h, t, dur):
    """0..1 from hit time h over dur (drafting speed)."""
    return clamp((t - h) / dur)


def bump(names, t, lo=0, amp=0.012, tau=0.12):
    """A tiny camera bump on physical impacts."""
    s = min(since(n, t, lo) for n in names)
    return amp * math.exp(-s / tau) if s < 1e8 else 0.0


def cam(x, lt, dur, z0=1.0, z1=1.03, fx=None, fy=None):
    """A slow continuous push for every shot, so nothing ever holds still."""
    x.zoom = lerp(z0, z1, smooth(lt / dur))
    x.fx, x.fy = (W / 2 if fx is None else fx), (H / 2 if fy is None else fy)


# ------------------------------------------------------------------ the plane (plane coords, nose up, 1 = 1 px)
PX, PY = 820, 600


def P(x, y, ox=PX, oy=PY, s=1.0):
    return ox + x * s, oy + y * s


def fuselage_pts(ox=PX, oy=PY, s=1.0):
    ys = np.linspace(-270, 250, 60)
    right = []
    for y in ys:
        w = 34 * math.sqrt(clamp((y + 270) / 70)) if y < -200 else 34 - 24 * clamp((y - 120) / 130)
        right.append((w, y))
    return [P(x, y, ox, oy, s) for x, y in right] + [P(-x, y, ox, oy, s) for x, y in reversed(right)]


WING_R = [(30, -30), (440, -6), (440, 28), (30, 62)]
TAIL_R = [(12, 192), (165, 214), (165, 238), (12, 240)]
ENGINES = [(-250, -34), (-130, -38), (130, -38), (250, -34)]           # nacelle centres
ENG_W, ENG_H = 30, 100


def wing_pts(side, ox=PX, oy=PY, s=1.0):
    return [P(side * x, y, ox, oy, s) for x, y in WING_R]


def tail_pts(side, ox=PX, oy=PY, s=1.0):
    return [P(side * x, y, ox, oy, s) for x, y in TAIL_R]


def nacelle_path(ex, ey, ox=PX, oy=PY, s=1.0):
    p = skia.Path()
    x, y = P(ex, ey, ox, oy, s)
    p.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x - ENG_W / 2 * s, y - ENG_H / 2 * s, ENG_W * s,
                                                        ENG_H * s), 12 * s, 12 * s))
    return p


def outline_paths(ox=PX, oy=PY, s=1.0):
    return [poly_path(fuselage_pts(ox, oy, s), True)] + [poly_path(wing_pts(sd, ox, oy, s), True) for sd in (-1, 1)] \
        + [poly_path(tail_pts(sd, ox, oy, s), True) for sd in (-1, 1)] + [nacelle_path(*e, ox, oy, s) for e in ENGINES]


def in_engine(x, y, pad=10):
    return any(abs(x - ex) < ENG_W / 2 + pad and abs(y - ey) < ENG_H / 2 + pad for ex, ey in ENGINES)


def in_plane(x, y):
    """Inside the silhouette (plane coords)."""
    if in_engine(x, y, 0):
        return True
    if abs(x) <= 30:
        w = 34 * math.sqrt(clamp((y + 270) / 70)) if y < -200 else 34 - 24 * clamp((y - 120) / 130)
        return -265 < y < 245 and abs(x) < w - 4
    if 30 < abs(x) < 440:
        f = (abs(x) - 30) / 410
        return lerp(-30, -6, f) + 6 < y < lerp(62, 28, f) - 6
    return False


def make_holes():
    """Twenty holes in hit order: wings, fuselage, tail; never on the engines (illustrative)."""
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


def make_expected():
    """Sixteen 'where the bullets should have landed' dots, uniform over the silhouette; four on the engines."""
    r = np.random.default_rng(3)
    out = []
    eng = [(ex + r.uniform(-6, 6), ey + r.uniform(-30, 30)) for ex, ey in ENGINES]
    while len(out) < 12:
        x, y = r.uniform(-440, 440), r.uniform(-260, 240)
        if in_plane(x, y) and not in_engine(x, y) and all(math.hypot(x - a, y - b) > 40 for a, b in out):
            out.append((x, y))
    order = out[:3] + [eng[0]] + out[3:6] + [eng[2]] + out[6:9] + [eng[1]] + out[9:] + [eng[3]]
    return order


HOLES = make_holes()
HOLE_T = window("hole", 2, 4)
EXPECTED = make_expected()


def draw_hole(c, x, y, s, a=1.0, ring=True, r0=6.5):
    """A damage mark: a small circle and four ticks; a ring flies out on impact."""
    if s < 0:
        return
    u = ease_out(clamp(s / 0.08), 3)
    r = r0 * u
    c.drawCircle(x, y, r, paint(0.95 * a, 1.6))
    for k in range(4):
        ang = math.pi / 4 + k * math.pi / 2
        c.drawLine(x + math.cos(ang) * r * 1.4, y + math.sin(ang) * r * 1.4, x + math.cos(ang) * r * 2.3,
                   y + math.sin(ang) * r * 2.3, paint(0.85 * a, 1.3))
    if ring and s < 0.3:
        c.drawCircle(x, y, 6 + 60 * ease_out(s / 0.3, 2), paint(0.6 * (1 - s / 0.3) * a, 1.2))


def plane(c, t, lo=1, a=1.0, us=None, ox=PX, oy=PY):
    """The drafted outline: fuselage, wings, engines, tail, each layer on its own `draw` beat (or `us`)."""
    if us is None:
        us = [grow(h, t, BEAT * 0.85) for h in window("draw", lo, lo + 1)]
    nibs = []
    fus = poly_path(fuselage_pts(ox, oy), True)
    if us[1] > 0:
        for sd in (-1, 1):
            nibs.append(stroke(c, poly_path(wing_pts(sd, ox, oy), True), 2.6, us[1], a))
    if us[0] > 0:
        if us[0] >= 1:
            paper_fill(c, fus)
        nibs.append(stroke(c, fus, 3.0, us[0], a))
        line(c, [P(0, -300, ox, oy), P(0, 290, ox, oy)], 1.0, us[0], 0.6 * a, dash=CENTER, nib=False)
        cx_, cy_ = P(0, -232, ox, oy)
        ck = skia.Path()
        ck.addArc(skia.Rect.MakeXYWH(cx_ - 20, cy_ - 14, 40, 28), 180, 180)
        stroke(c, ck, 1.6, us[0], a, nib=False)
    if us[2] > 0:
        for k, (ex, ey) in enumerate(ENGINES):
            uu = clamp(us[2] * 1.6 - k * 0.2)
            p = nacelle_path(ex, ey, ox, oy)
            if uu >= 1:
                paper_fill(c, p)
            nibs.append(stroke(c, p, 2.2, uu, a))
            px_, py_ = P(ex, ey - ENG_H / 2 - 8, ox, oy)
            if uu >= 1:
                c.drawLine(px_ - 18, py_, px_ + 18, py_, paint(0.8 * a, 1.6))       # propeller disc, edge-on
    if us[3] > 0:
        for sd in (-1, 1):
            nibs.append(stroke(c, poly_path(tail_pts(sd, ox, oy), True), 2.4, us[3], a))
        fx, fy = P(0, 168, ox, oy)
        line(c, [(fx, fy), (fx, fy + 86)], 6, us[3], a, nib=False)
    return [n for n in nibs if n is not None]


def region_paths(ox=PX, oy=PY):
    return {"wingL": poly_path(wing_pts(-1, ox, oy), True), "wingR": poly_path(wing_pts(1, ox, oy), True),
            "fus": poly_path(fuselage_pts(ox, oy), True), "tailL": poly_path(tail_pts(-1, ox, oy), True),
            "tailR": poly_path(tail_pts(1, ox, oy), True)}


ARMOR_KEYS = (("wingL",), ("wingR",), ("fus",), ("tailL", "tailR"))


def ghost_plane(c, gx, gy, s, rot, a, eng_holes=(0, 2), cross=0.0):
    """A plane that did not come back: phantom lines, holes on its engines, a struck-through cross."""
    if a <= 0.003:
        return
    c.save()
    c.translate(gx, gy)
    c.rotate(rot)
    c.scale(s, s)
    c.translate(-PX, -PY)
    for p in outline_paths():
        c.drawPath(p, paint(0.9 * a, 2.0 / s * 0.9, dash=[v / s * 0.6 for v in PHANTOM]))
    for j in eng_holes:
        draw_hole(c, *P(*ENGINES[j]), 1.0, a, False, 6.5 / s * 0.5)
    if cross > 0:
        for k, (dx0, dy0, dx1, dy1) in enumerate(((-180, -180, 180, 180), (180, -180, -180, 180))):
            u = clamp(cross * 2 - k)
            if u > 0:
                x0, y0 = P(dx0, dy0)
                x1, y1 = P(dx1, dy1)
                c.drawLine(x0, y0, lerp(x0, x1, u), lerp(y0, y1, u), paint(0.95 * a, 3.2 / s * 0.8))
    c.restore()


def icon_plane(c, x, y, s, a=1.0, dash=None, rot=0.0):
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s, s)
    c.translate(-PX, -PY)
    for p in outline_paths()[:3]:
        c.drawPath(p, paint(0.95 * a, 1.8 / s, dash=[v / s * 0.5 for v in dash] if dash else None))
    c.restore()


# ------------------------------------------------------------------ sheet furniture
def header(c, t, fig="FIG. 1", name="返航飞机 · 弹孔分布", u=1.0, strike=0.0, a=1.0):
    w1 = font(34, "monob").measureText(fig)
    letter(c, fig, 92, 104, 34, u, a, kind="monob")
    w2 = letter(c, name, 112 + w1 + 24, 104, 34, clamp(u * 1.4 - 0.2), a)
    if strike > 0:
        line(c, [(84, 92), (lerp(84, 140 + w1 + w2, strike), 92)], 3, 1.0, a, nib=False)
    c.drawLine(80, 124, 1840, 124, paint(0.55, 1.2))


def fig_change(c, t, lo, old, new, a=1.0):
    """FIG. n struck through and rewritten on the `fig` beats of bar lo; returns True once the new one is up."""
    fh = window("fig", lo, lo + 1)
    if t < fh[1]:
        header(c, t, *old, strike=grow(fh[0], t, BEAT * 0.6), a=a)
        return False
    u = grow(fh[1], t, BEAT * 1.6)
    header(c, t, *new, u=u, a=a)
    return True


def title_block(c, t, a=1.0, status="审核中", sheet="1 / 4", source="SRG · 1943"):
    x, y, w, h = 1430, 905, 410, 120
    c.drawRect(skia.Rect.MakeXYWH(x, y, w, h), paint(0.9 * a, 1.8))
    for yy in (y + 40, y + 80):
        c.drawLine(x, yy, x + w, yy, paint(0.6 * a, 1))
    c.drawLine(x + 120, y, x + 120, y + h, paint(0.6 * a, 1))
    fm = font(16, "mono")
    for k, (kk, vv) in enumerate((("SHEET", sheet), ("SOURCE", source), ("STATUS", status))):
        c.drawString(kk, x + 12, y + 26 + k * 40, fm, paint(0.7 * a))
        f = font(22) if any(ord(ch) > 127 for ch in vv) else font(18, "mono")
        c.drawString(vv, x + 134, y + 28 + k * 40, f, paint(0.95 * a))


def border(c, a=1.0):
    c.drawRect(skia.Rect.MakeXYWH(40, 40, W - 80, H - 80), paint(0.8 * a, 2.2))
    c.drawRect(skia.Rect.MakeXYWH(52, 52, W - 104, H - 104), paint(0.45 * a, 1))


def tally(c, t, a=1.0, full=False):
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
        if full or t >= h:
            n[z] += 1
    cs = window("count", 3, 4)
    for k, z in enumerate(ZONES):
        yy = y + 64 + k * 52
        letter(c, z, x + 8, yy, 30, 1.0, a)
        fm = font(34, "monob")
        s = str(n[z])
        c.drawString(s, x + 330 - fm.measureText(s), yy + 2, fm, paint(0.95 * a))
        c.drawLine(x, yy + 18, x + 360, yy + 18, paint(0.35 * a, 1))
        if k < 2 and (full or t >= cs[k]):                           # 机翼最多，机身其次: underline
            line(c, [(x + 4, yy + 12), (x + 356, yy + 12)], 3, 1.0 if full else grow(cs[k], t, 0.18), a,
                 nib=False)


def finished_plane(c, t, holes=1.0, hatch_a=0.3, a=1.0, ox=PX, oy=PY):
    """FIG. 1 as it stands after the cold open (for later shots)."""
    plane(c, t, us=[1, 1, 1, 1], a=a, ox=ox, oy=oy)
    for hx, hy, z in HOLES:
        draw_hole(c, *P(hx, hy, ox, oy), 1.0, holes * a, False)
    if hatch_a > 0:
        for p in region_paths(ox, oy).values():
            hatch(c, p, 1.0, 12, 45, 1.0, hatch_a * a)


def last_nib(nibs):
    live = [n for n in nibs if n is not None]
    return live[-1] if live else None


def follow_hand(c, nibs, t, rest=(1500, 760)):
    """The draftsman's hand follows the live nib; between strokes it drifts at rest, never frozen."""
    n = last_nib(nibs)
    if n is None:
        n = (rest[0] + 30 * math.sin(t * 0.9), rest[1] + 18 * math.sin(t * 1.3))
        hand(c, *n, 0.22)
    else:
        hand(c, *n, 0.4)


# ------------------------------------------------------------------ FIG. 1 · cold open (bars 0-8)
@shot(0, B(8), tin=0.0, tout=0.0, kin="cut", kout="cut")
def cold_open(c, x, t, lt):
    nibs = []
    border(c)
    header(c, t, u=grow(window("header", 0, 1)[0], t, BEAT * 0.9))
    title_block(c, t, status="审核中")
    # bar 5: the load gauge fills, the plane sinks a little with each step
    sink = 0.0
    lh = window("load", 5, 6)
    nl = sum(1 for h in lh if t >= h)
    if nl:
        sink = 6 * nl + (6 * math.sin((t - lh[0]) * 9) * math.exp(-(t - lh[nl - 1]) / 0.3) if t < B(8) else 0)
    oy = PY + sink
    # bar 0: the centre line crosses the empty sheet; a small plane symbol comes home along a dashed track
    cl = grow(window("cline", 0, 1)[0], t, BEAT * 0.8)
    nibs.append(line(c, [P(0, -330), P(0, 330)], 1.2, cl, 0.8, dash=CENTER))
    land = window("land", 0, 1)[0]
    if t < B(1):
        u = clamp((t - BEAT * 0.5) / (land - BEAT * 0.5))
        path = [(1700 - 900 * v, 220 + 380 * v * v) for v in np.linspace(0, 1, 40)]
        line(c, path, 1.2, u, 0.6, dash=HIDDEN, nib=False)
        k = min(39, int(u * 39))
        px_, py_ = path[k]
        ang = math.degrees(math.atan2(path[min(39, k + 1)][1] - path[max(0, k - 1)][1],
                                      path[min(39, k + 1)][0] - path[max(0, k - 1)][0])) + 90
        icon_plane(c, px_, py_, 0.12, 1.0, rot=ang)
        if t >= land:
            ls = t - land
            c.drawCircle(PX, PY, 10 + 120 * ease_out(clamp(ls / 0.5), 2), paint(0.7 * (1 - clamp(ls / 0.5)), 2))
    nibs += plane(c, t, oy=oy)
    for (hx, hy, z), h in zip(HOLES, HOLE_T):
        draw_hole(c, *P(hx, hy, PX, oy), t - h)
    if t >= B(2):
        tally(c, t, smooth((t - B(2)) / 0.3))
    # bar 4: armour where the holes are, one region per beat
    regions = region_paths(PX, oy)
    for h, keys in zip(window("armor", 4, 5), ARMOR_KEYS):
        if t >= h:
            for kk in keys:
                hatch(c, regions[kk], grow(h, t, BEAT * 0.8), 12, 45, 1.0, 0.6)
    if B(4) <= t < B(5):
        u = grow(B(4), t, 0.4)
        lx, ly = P(-300, 140)
        c.drawLine(lx + 30, ly - 34, lx + 50, ly - 92, paint(0.8 * u, 1.4))
        letter(c, "加固？", lx, ly, 34, u)
    if t >= B(5):
        gx, gy0, gy1 = 200, 820, 340
        c.drawRect(skia.Rect.MakeLTRB(gx - 26, gy1, gx + 26, gy0), paint(0.85, 1.8))
        letter(c, "载重", gx, gy0 + 46, 28, 1.0, 0.9, align="center")
        letter(c, "LOAD", gx, gy0 + 76, 18, 1.0, 0.7, kind="mono", align="center")
        lim = lerp(gy0, gy1, 0.72)
        c.drawLine(gx - 44, lim, gx + 44, lim, paint(0.9, 2.2))
        letter(c, "极限", gx + 52, lim + 9, 24, 1.0, 0.85)
        fill = 0.0
        for k, h in enumerate(lh):
            fill = max(fill, (k + grow(h, t, 0.25)) / 4 * 0.86) if t >= h else fill
        r = skia.Path()
        r.addRect(skia.Rect.MakeLTRB(gx - 22, lerp(gy0, gy1, fill), gx + 22, gy0 - 4))
        hatch(c, r, 1.0, 7, 45, 1.2, 0.9)
        if nl >= 4:
            letter(c, "超重", gx + 52, lerp(gy0, gy1, fill) + 8, 28, grow(lh[3], t, 0.3), kind="handb")
    # bar 6: four candidate balloons; bar 7: the pen hesitates between them
    opts = [("A", (-300, 10), (-360, 170)), ("B", (0, 60), (90, 120)), ("C", (-100, 222), (-150, 330)),
            ("D", (-130, -38), (-60, -190))]
    oh = window("opt", 6, 7)
    for (lab, (tx, ty), (bx, by)), h in zip(opts, oh):
        if t >= h:
            balloon(c, *P(bx, by, PX, oy), *P(tx, ty, PX, oy), lab, grow(h, t, 0.3), 24, 1.0, 26)
    ph = window("pick", 7, 8)
    for k, h in enumerate(ph):
        nxt = ph[k + 1] if k + 1 < len(ph) else B(8)
        if h <= t < nxt:
            lab, _, (bx, by) = opts[[0, 1, 2][k]]
            cx_, cy_ = P(bx, by, PX, oy)
            circ = skia.Path()
            circ.addCircle(cx_, cy_, 34)
            nibs.append(stroke(c, circ, 2.2, grow(h, t, 0.25), 1.0))
    qh = window("q", 7, 8)[0]
    if t >= qh:
        letter(c, "?", 1180, 520, 120, grow(qh, t, 0.2), kind="handb")
    follow_hand(c, nibs, t)
    cam(x, lt, B(8), 1.0, 1.04)
    x.zoom += bump(("sheet", "land"), t) + 0.004 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ title (bars 8-10)
@shot(B(8), B(10), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt):
    border(c)
    th = window("title", 8, 9)[0]
    header(c, t, strike=grow(th, t, 0.2))
    title_block(c, t, status="审核中")
    finished_plane(c, t, 0.8, 0.35, 0.85)
    tally(c, t, 0.75, full=True)
    f = font(110, "handb")
    xx = 92
    for i, ch in enumerate(TITLE):
        s = t - hit_times("char")[i]
        if s >= 0:
            letter(c, ch, xx, 250, 110, clamp(s / 0.12), kind="handb")
        xx += f.measureText(ch) + 6
    u = grow(window("sub", 8, 9)[0], t, 0.6)
    w = font(30, "hand").measureText(CONCEPT)
    letter(c, CONCEPT, 96, 300, 30, clamp(u * 2), 0.85)
    letter(c, f" · {CONCEPT_EN}", 96 + w, 300, 24, clamp(u * 2 - 1), 0.8, kind="mono")
    # bar 9: hidden circles land on the four engines (a hint, no answer yet)
    for k, h in enumerate(window("tick", 9, 10)):
        if t >= h:
            ex, ey = ENGINES[k]
            circ = skia.Path()
            circ.addCircle(*P(ex, ey), 34)
            stroke(c, circ, 1.4, grow(h, t, 0.3), 0.7, dash=HIDDEN)
    follow_hand(c, [], t)
    cam(x, lt, B(2), 1.0, 1.03)
    x.zoom += 0.03 * math.exp(-since("title", t, 8) / 0.25) + 0.005 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ FIG. 1 · Wald (bars 10-19)
GHOSTS = [(230, 380, -8), (1310, 380, 8), (240, 800, 6), (1200, 790, -6)]
OK_LABELS = [(-300, 120), (300, 120), (80, 110), (0, 300)]


@shot(B(10), B(19), tin=0.0, tout=0.0, kin="cut", kout="cut")
def wald(c, x, t, lt):
    nibs = []
    border(c)
    header(c, t)
    title_block(c, t, status="复核")
    ghost_on = t >= B(15)
    finished_plane(c, t, 1.0, 0.32 if t < B(17) else 0.32 * (1 - 0.6 * grow(B(17), t, BAR)))
    tally(c, t, 1 - grow(B(12), t, 0.3), full=True)
    # bar 10: the group's name block, one line per beat
    srg = ["STATISTICAL RESEARCH GROUP", "统计研究组 · SRG", "COLUMBIA UNIVERSITY · 哥伦比亚大学",
           "NEW YORK · 1943"]
    sa = 1 - grow(B(12), t, 0.3)
    if sa > 0:
        for k, h in enumerate(window("srg", 10, 11)):
            if t >= h:
                kind = "mono" if k in (0, 3) else "hand"
                letter(c, srg[k], 92, 860 + k * 40, 24, grow(h, t, BEAT * 0.8), 0.9 * sa, kind=kind)
        c.drawLine(88, 832, 560, 832, paint(0.6 * sa * clamp((t - B(10)) / 0.3), 1.2))
    # bar 11: revision clouds around the engines, Wald's name, the pen taps a question mark
    for k, h in enumerate(window("cloud", 11, 12)):
        if t >= h:
            ex = -190 if k == 0 else 190
            nibs.append(rev_cloud(c, *P(ex, -36), 120, 86, grow(h, t, BEAT * 0.8), 1.0, 13, 2.4))
    nh = window("name", 11, 12)[0]
    if t >= nh:
        letter(c, "Abraham Wald", 600, 990, 30, grow(nh, t, BEAT * 0.9), 1 - grow(B(12), t, 0.3), kind="handb")
    ph = window("pen", 11, 12)[0]
    if ph <= t < B(14):
        letter(c, "?", P(46, -230)[0], P(46, -230)[1], 60, grow(ph, t, 0.2), kind="handb")
    # bar 12: one balloon per engine, each says 0
    for k, h in enumerate(window("zero", 12, 13)):
        if t >= h:
            ex, ey = ENGINES[k]
            balloon(c, *P(ex + (-40 if ex < 0 else 40), -175), *P(ex, ey - 20), "0", grow(h, t, 0.3), 24, 1.0, 26)
    if B(12) <= t < B(15):
        letter(c, "发动机：0", P(-470, 0)[0], P(0, -205)[1], 32, grow(B(12), t, 0.5), kind="handb")
    # bar 13: where bullets should have landed: hidden dots all over, the engines too
    for k, h in enumerate(window("exp", 13, 14)):
        if t >= h:
            ex, ey = EXPECTED[k]
            on_eng = in_engine(ex, ey, 0)
            s = t - h
            r = 7 * ease_out(clamp(s / 0.1), 3)
            c.drawCircle(*P(ex, ey), r, paint(0.9, 1.6, dash=[4, 3]))
            if s < 0.25:
                c.drawCircle(*P(ex, ey), r + 30 * s / 0.25, paint(0.5 * (1 - s / 0.25), 1))
            if on_eng and t >= B(14):
                mh = window("miss", 14, 15)[ENGINES.index(min(ENGINES, key=lambda e: abs(e[0] - ex)))]
                if t >= mh:
                    u = grow(mh, t, 0.3)
                    circ = skia.Path()
                    circ.addCircle(*P(ex, ey), 22)
                    stroke(c, circ, 2.4, u, 1.0)
                    letter(c, "?", P(ex, ey)[0] + 18, P(ex, ey)[1] - 18, 40, u, kind="handb")
    if B(13) <= t < B(15):
        letter(c, "应有弹孔（均匀）", 1250, 800, 26, grow(B(13), t, 0.6), 0.85)
        c.drawCircle(1230, 792, 7, paint(0.9 * grow(B(13), t, 0.3), 1.6, dash=[4, 3]))
    # bar 15: the planes that did not come back, phantom lines; bar 16: struck through
    for k, h in enumerate(window("ghost", 15, 16)):
        if t >= h:
            s = t - h
            gx, gy, rot = GHOSTS[k]
            drift = 30 * ease_io(clamp(s / 2.0)) + 6 * math.sin(t * 1.1 + k)
            a = clamp(s / 0.15) * (1 - 0.35 * grow(B(17), t, BAR))
            ch = window("cross", 16, 17)[k]
            ghost_plane(c, gx, gy + drift, 0.3, rot + 3 * math.sin(t * 0.8 + k), a, ((0, 2), (1,), (3,), (1, 2))[k],
                        grow(ch, t, 0.25))
    if ghost_on:
        letter(c, "未返航", 230, 250, 34, grow(B(15) + BEAT * 0.2, t, 0.4), kind="handb", align="center")
    # bar 17: where the holes are, a hit was survivable
    for k, h in enumerate(window("ok", 17, 18)):
        if t >= h:
            lx, ly = P(*OK_LABELS[k])
            letter(c, "中弹 · 能回", lx, ly, 26, grow(h, t, 0.4), 0.95, align="center")
    # bar 18: the armour moves to the engines
    for k, h in enumerate(window("rearmor", 18, 19)):
        if t >= h:
            hatch(c, nacelle_path(*ENGINES[k]), grow(h, t, BEAT * 0.6), 6, -45, 1.2, 0.95)
    follow_hand(c, nibs, t)
    # camera: push in on the engines for bars 12-14, back out for the ghosts
    if B(12) <= t < B(15):
        z = lerp(1.0, 1.2, smooth((t - B(12)) / BAR)) * lerp(1, 1 / 1.2, smooth((t - B(14) - BAR * 0.6) / 0.6))
        drift = (t - B(12)) / (3 * BAR)                                  # keeps moving through the hold
        x.zoom = z * (1 + 0.05 * drift)
        x.fx = lerp(W / 2, 820, smooth((t - B(12)) / BAR)) - 30 * drift
        x.fy = lerp(H / 2, 560, smooth((t - B(12)) / BAR)) + 12 * drift
    else:
        cam(x, lt, B(9), 1.0, 1.03)
    x.zoom += bump(("zero", "ghost", "cross"), t, 10, 0.008) + 0.004 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ the memo (bars 19-21)
@shot(B(19), B(21), tin=0.0, tout=0.0, kin="cut", kout="cut")
def memo(c, x, t, lt):
    nibs = []
    border(c)
    header(c, t, "FIG. 1A", "报告 · MEMORANDUM")
    title_block(c, t, status="复核")
    mh = window("memo", 19, 20)
    # the memo as a drawn document: outline, rule lines, title
    mx, my, mw, mhh = 330, 300, 1100, 560
    doc = skia.Path()
    doc.addRect(skia.Rect.MakeXYWH(mx, my, mw, mhh))
    paper_fill(c, doc)
    nibs.append(stroke(c, doc, 2.4, grow(mh[0], t, BEAT * 0.9), 1.0))
    if t >= mh[0]:
        c.drawRect(skia.Rect.MakeXYWH(mx + 10, my + 10, mw - 20, mhh - 20), paint(0.4 * grow(mh[0], t, 0.4), 1))
    letter(c, "STATISTICAL RESEARCH GROUP · COLUMBIA UNIVERSITY · 1943", mx + 60, my + 70, 22,
           grow(mh[1], t, BEAT * 0.9), 0.8, kind="mono")
    letter(c, "A Method of Estimating Plane Vulnerability", mx + 60, my + 160, 44, grow(mh[2], t, BEAT * 0.9),
           kind="handb")
    letter(c, "Based on Damage of Survivors", mx + 60, my + 225, 44, grow(mh[3], t, BEAT * 0.9), kind="handb")
    m2 = window("memo2", 20, 21)
    letter(c, "根据幸存飞机的损伤，估计飞机的易损性", mx + 60, my + 320, 40, grow(m2[0], t, BEAT * 0.9), 0.95)
    # circle "Survivors"
    f = font(44, "handb")
    sx = mx + 60 + f.measureText("Based on Damage of ")
    sw = f.measureText("Survivors")
    if t >= m2[1]:
        ell = skia.Path()
        ell.addOval(skia.Rect.MakeXYWH(sx - 16, my + 180, sw + 32, 64))
        nibs.append(stroke(c, ell, 2.6, grow(m2[1], t, 0.4), 1.0))
    if t >= m2[2]:
        nibs.append(line(c, [(sx + sw + 18, my + 212), (sx + sw + 90, my + 212)], 1.6, grow(m2[2], t, 0.3), 0.9))
        letter(c, "幸存者", sx + sw + 100, my + 224, 34, grow(m2[2] + 0.2, t, 0.3), kind="handb")
    letter(c, "A. Wald · 1980 年由 CNA 重印", mx + 60, my + 500, 26, grow(m2[3], t, BEAT * 0.9), 0.75)
    icon_plane(c, 1560, 640, 0.22, 0.5 + 0.1 * math.sin(t * 2), rot=4 * math.sin(t * 0.7))
    follow_hand(c, nibs, t)
    cam(x, lt, B(2), 1.0, 1.05)
    x.zoom += bump(("memo2",), t, 19, 0.006)


# ------------------------------------------------------------------ the filter diagram (bars 21-25)
ALL_BOX = (150, 330, 400, 360)          # x, y, w, h
SIEVE_X = 820
SEEN_BOX = (1090, 330, 330, 360)
UNSEEN_BOX = (640, 770, 360, 160)
PASS = [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0]


def grid_slot(box, k, cols=4, rows=4):
    x, y, w, h = box
    return x + (k % cols + 0.5) * w / cols, y + (k // cols % rows + 0.5) * h / rows


@shot(B(21), B(25), tin=0.0, tout=0.0, kin="cut", kout="cut")
def filter_(c, x, t, lt):
    nibs = []
    border(c)
    header(c, t, "FIG. 1B", "筛子 · THE FILTER")
    title_block(c, t, status="复核")
    dh = window("diag", 21, 22)
    bx, by, bw, bh = ALL_BOX
    nibs.append(line(c, [(bx, by), (bx + bw, by), (bx + bw, by + bh), (bx, by + bh)], 2.2, grow(dh[0], t, BEAT * 0.8),
                     closed=True))
    letter(c, "飞出去的", bx, by - 24, 30, grow(dh[0], t, 0.5), kind="handb")
    letter(c, "ALL", bx + 140, by - 24, 22, grow(dh[0], t, 0.5), 0.7, kind="mono")
    nibs.append(line(c, [(bx + bw + 20, by + bh / 2), (SIEVE_X - 40, by + bh / 2)], 2.0, grow(dh[1], t, 0.4)))
    if t >= dh[1] + 0.4:
        ax = SIEVE_X - 40
        line(c, [(ax - 18, by + bh / 2 - 10), (ax, by + bh / 2), (ax - 18, by + bh / 2 + 10)], 2.0, nib=False)
    # sieve: a wall with gaps, the cutting-plane convention
    nibs.append(line(c, [(SIEVE_X, by - 30), (SIEVE_X, by + bh + 30)], 4, grow(dh[2], t, 0.5), dash=[38, 22]))
    letter(c, "筛子", SIEVE_X, by - 44, 30, grow(dh[2], t, 0.4), kind="handb", align="center")
    sx, sy, sw, sh = SEEN_BOX
    nibs.append(line(c, [(sx, sy), (sx + sw, sy), (sx + sw, sy + sh), (sx, sy + sh)], 2.2, grow(dh[3], t, BEAT * 0.8),
                     closed=True))
    letter(c, "飞回来的", sx, sy - 24, 30, grow(dh[3], t, 0.5), kind="handb")
    if t >= dh[3]:
        line(c, [(SIEVE_X + 30, by + bh / 2), (sx - 20, by + bh / 2)], 2.0, grow(dh[3], t, 0.4), nib=False)
        ux, uy, uw, uh = UNSEEN_BOX
        line(c, [(ux, uy), (ux + uw, uy), (ux + uw, uy + uh), (ux, uy + uh)], 1.8, grow(dh[3], t, 0.6), 0.85,
             dash=HIDDEN, closed=True, nib=False)
    # the planes in ALL; each flow hit sends one to the sieve
    fh = window("flow", 21, 25)
    npass = nfail = 0
    for k in range(16):
        ox_, oy_ = grid_slot(ALL_BOX, k)
        if k >= len(fh) or t < fh[k]:
            if t >= dh[0]:
                icon_plane(c, ox_, oy_ + 3 * math.sin(t * 2 + k), 0.09, clamp((t - dh[0]) / 0.4))
            continue
        s = t - fh[k]
        ok = PASS[k] if k < len(PASS) else 1
        u = ease_io(clamp(s / 0.35))
        midx, midy = SIEVE_X, by + bh / 2 + (k % 4 - 1.5) * 60
        if ok:
            tx, ty = grid_slot(SEEN_BOX, npass, 3, 3)
            npass += 1
            if u < 0.5:
                px_, py_ = lerp(ox_, midx, u * 2), lerp(oy_, midy, u * 2)
            else:
                px_, py_ = lerp(midx, tx, u * 2 - 1), lerp(midy, ty, u * 2 - 1)
            icon_plane(c, px_, py_, 0.09, 1.0)
        else:
            ux, uy, uw, uh = UNSEEN_BOX
            tx, ty = ux + 60 + nfail * 60, uy + uh / 2
            nfail += 1
            if u < 0.5:
                px_, py_ = lerp(ox_, midx - 30, u * 2), lerp(oy_, midy, u * 2)
            else:
                v = u * 2 - 1
                px_, py_ = lerp(midx - 30, tx, v), lerp(midy, ty, v * v)
            if s > 0.18 and s < 0.5:
                c.drawCircle(midx, midy, 10 + 40 * (s - 0.18) / 0.32, paint(0.6 * (1 - (s - 0.18) / 0.32), 1.4))
            icon_plane(c, px_, py_, 0.09, 0.85, dash=PHANTOM)
    lh = window("lab", 23, 24)
    letter(c, "看得见 · SEEN", sx, sy + sh + 50, 30, grow(lh[0], t, 0.5), kind="handb")
    ux, uy, uw, uh = UNSEEN_BOX
    letter(c, "看不见 · UNSEEN", ux + uw + 30, uy + uh / 2 + 10, 30, grow(lh[1], t, 0.5), kind="handb")
    # bar 24: the name, big, under the diagram
    f = font(84, "handb")
    xx = 150
    for i, ch in enumerate(CONCEPT):
        h = window("concept", 24, 25)[i]
        if t >= h:
            letter(c, ch, xx, 880, 84, grow(h, t, 0.12), kind="handb")
        xx += f.measureText(ch) + 4
    letter(c, CONCEPT_EN, 154, 940, 28, grow(window("en", 24, 25)[0], t, 0.5), 0.85, kind="mono")
    follow_hand(c, nibs, t)
    cam(x, lt, B(4), 1.0, 1.04)
    x.zoom += bump(("diag", "lab"), t, 21, 0.006)


# ------------------------------------------------------------------ FIG. 2 · the bookshelf (bars 25-31)
SHELF_Y = 860
BOOKS = [("我的早起人生", 260, 92, 330), ("坚持就是胜利", 362, 80, 300), ("退学那一年", 452, 96, 340),
         ("押上全部", 558, 84, 310)]
SAY = ["早起！", "坚持！", "退学！", "押上！"]


def vertical(c, s, x, y, size, u=1.0, a=1.0, kind="hand"):
    """Spine lettering, one character under another."""
    n = len(s)
    k = int(n * clamp(u) + 1e-6)
    for i, ch in enumerate(s[:k]):
        letter(c, ch, x, y + i * size * 1.1, size, 1.0, a, kind=kind, align="center")


def pbook_rects():
    out, x = [], 690
    r = np.random.default_rng(12)
    for k in range(24):
        w = r.uniform(32, 42)
        h = r.uniform(220, 330)
        out.append((x, w, h))
        x += w + 4
    return out


PBOOKS = pbook_rects()


@shot(B(25), B(31), tin=0.0, tout=0.0, kin="cut", kout="cut")
def books(c, x, t, lt):
    nibs = []
    border(c)
    title_block(c, t, status="复核", sheet="2 / 4", source="书店 · 示意")
    if not fig_change(c, t, 25, ("FIG. 1B", "筛子 · THE FILTER"), ("FIG. 2", "书架 · 成功者的故事")):
        icon_plane(c, 820, 560, 0.5, 0.25 * (1 - grow(B(25), t, BEAT)))
    fh = window("fig", 25, 26)
    nibs.append(line(c, [(200, SHELF_Y), (1720, SHELF_Y)], 3.0, grow(fh[3], t, BEAT * 0.8)))
    if t >= fh[3]:
        hatch_r = skia.Path()
        hatch_r.addRect(skia.Rect.MakeLTRB(200, SHELF_Y, 1720 * min(1, 0.12 + grow(fh[3], t, 0.6)), SHELF_Y + 22))
        hatch(c, hatch_r, 1.0, 9, 45, 1.0, 0.6)
    for (name, bx, bw, bh), h in zip(BOOKS, window("book", 26, 27)):
        if t >= h:
            u = grow(h, t, BEAT * 0.8)
            r = skia.Path()
            r.addRect(skia.Rect.MakeXYWH(bx, SHELF_Y - bh, bw, bh))
            if u >= 1:
                paper_fill(c, r)
            nibs.append(stroke(c, r, 2.4, u, 1.0))
            c.drawLine(bx + 6, SHELF_Y - bh + 18, bx + bw - 6, SHELF_Y - bh + 18, paint(0.7 * u, 1.2))
            vertical(c, name, bx + bw / 2, SHELF_Y - bh + 60, 30, grow(h + 0.2, t, 0.5), 0.95, "handb")
    for k, h in enumerate(window("say", 27, 28)):
        if t >= h:
            name, bx, bw, bh = BOOKS[k]
            cx_, cy_ = 200 + k * 150, SHELF_Y - 410
            u = grow(h, t, 0.3)
            rr = skia.Path()
            rr.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(cx_ - 62, cy_ - 30, 124, 52), 24, 24))
            stroke(c, rr, 1.8, u, 1.0, nib=False)
            line(c, [(cx_ - 10, cy_ + 22), (bx + bw / 2, SHELF_Y - bh - 6)], 1.4, u, 0.9, nib=False)
            letter(c, SAY[k], cx_, cy_ + 8, 28, grow(h + 0.1, t, 0.3), kind="handb", align="center")
    pb = window("pbook", 28, 30)
    for k, ((bx, bw, bh), h) in enumerate(zip(PBOOKS, pb)):
        if t >= h:
            u = grow(h, t, 0.18)
            r = skia.Path()
            r.addRect(skia.Rect.MakeXYWH(bx, SHELF_Y - bh, bw, bh))
            stroke(c, r, 1.6, u, 0.75, dash=HIDDEN, nib=False)
    # bar 30: dimensions over both groups
    vh = window("venn", 30, 31)
    if t >= vh[0]:
        y0 = SHELF_Y - 500
        x0, x1 = BOOKS[0][1], BOOKS[-1][1] + BOOKS[-1][2]
        line(c, [(x0, y0), (x1, y0)], 1.6, grow(vh[0], t, 0.4), nib=False)
        for xx in (x0, x1):
            c.drawLine(xx, y0 - 14, xx, y0 + 14, paint(0.9, 1.4))
        letter(c, "写了书的", (x0 + x1) / 2, y0 - 22, 30, grow(vh[1], t, 0.4), kind="handb", align="center")
    if t >= vh[2]:
        y0 = SHELF_Y - 500
        x0, x1 = PBOOKS[0][0], PBOOKS[-1][0] + PBOOKS[-1][1]
        line(c, [(x0, y0), (x1, y0)], 1.6, grow(vh[2], t, 0.5), dash=HIDDEN, nib=False)
        for xx in (x0, x1):
            c.drawLine(xx, y0 - 14, xx, y0 + 14, paint(0.9, 1.4))
        letter(c, "同样这么做，却没写书的人", (x0 + x1) / 2, y0 - 22, 30, grow(vh[3], t, 0.6), kind="handb",
               align="center")
    follow_hand(c, nibs, t)
    cam(x, lt, B(6), 1.0, 1.04)
    x.zoom += bump(("book",), t, 25, 0.006) + 0.004 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ FIG. 3 · feedback (bars 31-40)
USERS = [(230 + (k % 4) * 165, 470 + (k // 4) * 230) for k in range(8)]
LEAVERS = [1, 4, 0, 5]
STAYERS = [2, 3, 6, 7]
MODEL = (1250, 380, 330, 230)


def person(c, x, y, s=1.0, u=1.0, a=1.0, dash=None):
    """A user as a drafting symbol: a circle head, a shoulder arc."""
    head = skia.Path()
    head.addCircle(x, y - 46 * s, 20 * s)
    sh = skia.Path()
    sh.moveTo(x - 40 * s, y + 20 * s)
    sh.cubicTo(x - 40 * s, y - 24 * s, x + 40 * s, y - 24 * s, x + 40 * s, y + 20 * s)
    n1 = stroke(c, head, 2.0, clamp(u * 2), a, dash=dash, nib=False)
    n2 = stroke(c, sh, 2.0, clamp(u * 2 - 1), a, dash=dash)
    return n2 or n1


def star(c, x, y, r, a=1.0):
    pts = []
    for k in range(10):
        ang = -math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.45
        pts.append((x + rr * math.cos(ang), y + rr * math.sin(ang)))
    c.drawPath(poly_path(pts, True), paint(0.95 * a, 1.4))


def model_box(c, t, u=1.0, a=1.0):
    mx, my, mw, mh = MODEL
    r = skia.Path()
    r.addRect(skia.Rect.MakeXYWH(mx, my, mw, mh))
    n = stroke(c, r, 2.6, u, a)
    if u >= 1:
        letter(c, "MODEL", mx + 20, my + 44, 26, 1.0, 0.9 * a, kind="monob")
        letter(c, "模型", mx + 130, my + 44, 30, 1.0, 0.95 * a, kind="handb")
        # a gear turning inside: the model is learning
        gx, gy, R = mx + mw / 2, my + mh / 2 + 30, 50
        pts = []
        for k in range(48):
            ang = k * 2 * math.pi / 48 + t * 0.8
            rr = R if (k // 3) % 2 == 0 else R * 0.8
            pts.append((gx + rr * math.cos(ang), gy + rr * math.sin(ang)))
        c.drawPath(poly_path(pts, True), paint(0.9 * a, 1.6))
        c.drawCircle(gx, gy, 14, paint(0.9 * a, 1.4))
    return n


@shot(B(31), B(40), tin=0.0, tout=0.0, kin="cut", kout="cut")
def feedback(c, x, t, lt):
    nibs = []
    border(c)
    title_block(c, t, status="复核", sheet="3 / 4", source="产品 · 示意")
    fig_change(c, t, 31, ("FIG. 2", "书架 · 成功者的故事"), ("FIG. 3", "产品 · 用户反馈"))
    fh = window("fig", 31, 32)
    if t >= fh[3]:
        nibs.append(model_box(c, t, grow(fh[3], t, BEAT * 0.9)))
    uh = window("user", 32, 33)
    lh = window("leave", 33, 34)
    for k, (ux, uy) in enumerate(USERS):
        if t < uh[k]:
            continue
        u = grow(uh[k], t, 0.3)
        dash, a, dx = None, 1.0, 0.0
        if k in LEAVERS:
            h = lh[LEAVERS.index(k)]
            if t >= h:
                v = ease_io(grow(h, t, 0.8))
                dash, a, dx = PHANTOM, lerp(1.0, 0.55, v), -50 * v
        bob = 2 * math.sin(t * 1.7 + k)
        nibs.append(person(c, ux + dx, uy + bob, 1.0, u, a, dash))
    if t >= lh[0]:
        u = grow(lh[0], t, 0.4)
        letter(c, "离开", 196, 330, 28, u, 0.8, kind="handb")
        line(c, [(186, 320), (130, 320)], 1.4, u, 0.8, nib=False)
        line(c, [(144, 312), (130, 320), (144, 328)], 1.4, u, 0.8, nib=False)
    # bar 34: the ones who stayed write five stars
    sh = window("star", 34, 35)
    for j, k in enumerate(STAYERS):
        ux, uy = USERS[k]
        hb, hs = sh[2 * j], sh[2 * j + 1]
        bx, by = ux + 50, uy - 120
        if t >= hb:
            rr = skia.Path()
            rr.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(bx, by - 26, 150, 48), 20, 20))
            stroke(c, rr, 1.6, grow(hb, t, 0.2), 1.0, nib=False)
            line(c, [(bx + 14, by + 22), (ux + 18, uy - 74)], 1.2, grow(hb, t, 0.2), 0.9, nib=False)
        if t >= hs:
            for i in range(5):
                if t >= hs + i * 0.04:
                    star(c, bx + 22 + i * 26, by - 2, 10)
    # bar 35: the feedback flows into the model; a gauge says "satisfied"
    mx, my, mw, mh = MODEL
    eh = window("learn", 35, 36)
    bxr = 960                                               # a bracket gathers the feedback, one arrow to the model
    if t >= eh[0]:
        u = grow(eh[0], t, 0.4)
        nibs.append(line(c, [(bxr - 14, 320), (bxr, 320), (bxr, 610), (bxr - 14, 610)], 2.0, u))
    if t >= eh[1]:
        nibs.append(line(c, [(bxr, 465), (mx - 12, my + mh / 2)], 2.0, grow(eh[1], t, 0.35)))
        if t >= eh[1] + 0.35:
            ax, ay = mx - 12, my + mh / 2
            line(c, [(ax - 16, ay - 9), (ax, ay), (ax - 16, ay + 9)], 2.0, nib=False)
    if t >= eh[2]:
        s2 = t - eh[2]
        if s2 < 0.4:
            c.drawRect(skia.Rect.MakeXYWH(mx - 8 - 20 * s2, my - 8 - 20 * s2, mw + 16 + 40 * s2, mh + 16 + 40 * s2),
                       paint(0.7 * (1 - s2 / 0.4), 1.6))
    if t >= eh[3]:
        gx, gy, R = mx + mw / 2, my + mh + 150, 90
        arc = skia.Path()
        arc.addArc(skia.Rect.MakeXYWH(gx - R, gy - R, 2 * R, 2 * R), 180, 180)
        stroke(c, arc, 2.0, grow(eh[3], t, 0.3), nib=False)
        need = lerp(180, 345, ease_out(grow(eh[3], t, 0.6), 3)) + 3 * math.sin(t * 5)
        c.drawLine(gx, gy, gx + R * 0.85 * math.cos(math.radians(need)), gy + R * 0.85 * math.sin(math.radians(need)),
                   paint(0.95, 2.6))
        letter(c, "不满意", gx - R - 10, gy + 34, 22, 1.0, 0.7, align="center")
        letter(c, "满意", gx + R + 10, gy + 34, 22, 1.0, 0.9, align="center")
        letter(c, "模型学到的：大家都很满意（示意）", gx, gy + 80, 24, grow(eh[3] + 0.3, t, 0.6), 0.85, align="center")
    # bar 36: the leavers' voices never reach it
    dh = window("deaf", 36, 37)
    for j, k in enumerate(LEAVERS):
        if t >= dh[j]:
            ux, uy = USERS[k]
            x0, y0 = ux - 50 + 44, uy + 40
            x1, y1 = 496, uy + 40
            line(c, [(x0, y0), (x1, y1)], 1.6, grow(dh[j], t, 0.3), 0.8, dash=HIDDEN, nib=False)
            if t >= dh[j] + 0.3:
                u = grow(dh[j] + 0.3, t, 0.15)
                c.drawLine(x1 - 12 * u, y1 - 12 * u, x1 + 12 * u, y1 + 12 * u, paint(0.95, 2.4))
                c.drawLine(x1 - 12 * u, y1 + 12 * u, x1 + 12 * u, y1 - 12 * u, paint(0.95, 2.4))
    # bar 37: "not logged" box around the leavers
    rh = window("unrec", 37, 38)
    bx0, by0, bx1, by1 = 110, 360, 470, 760
    sides = [[(bx0, by0), (bx1, by0)], [(bx1, by0), (bx1, by1)], [(bx1, by1), (bx0, by1)], [(bx0, by1), (bx0, by0)]]
    for side, h in zip(sides, rh):
        if t >= h:
            line(c, side, 1.6, grow(h, t, 0.3), 0.7, dash=PHANTOM, nib=False)
    if t >= rh[3]:
        letter(c, "未记录 · NOT LOGGED", bx0, by1 + 44, 26, grow(rh[3], t, 0.5), 0.85, kind="hand")
    # bars 38-39: the checklist, then the leavers are found and drawn back in
    ch = window("chk", 38, 39)
    items = ["去找没飞回来的飞机：", "流失的用户", "被拒的申请", "没说出口的不满"]
    for k, h in enumerate(ch):
        if t >= h:
            yy = 810 + k * 52 - (0 if k == 0 else 0)
            if k == 0:
                letter(c, items[0], 760, yy, 30, grow(h, t, 0.5), kind="handb")
            else:
                c.drawRect(skia.Rect.MakeXYWH(770, yy - 24, 26, 26), paint(0.9 * grow(h, t, 0.2), 1.6))
                letter(c, items[k], 812, yy, 28, grow(h, t, 0.5))
    fd = window("find", 39, 40)
    for k, h in enumerate(fd[:3]):
        if t >= h:
            yy = 810 + (k + 1) * 52
            line(c, [(772, yy - 12), (782, yy - 2), (800, yy - 30)], 2.6, grow(h, t, 0.2), nib=False)
    if t >= fd[3]:
        for j, k in enumerate(LEAVERS):
            ux, uy = USERS[k]
            circ = skia.Path()
            circ.addCircle(ux - 50, uy - 20, 58)
            nibs.append(stroke(c, circ, 2.0, grow(fd[3] + j * 0.08, t, 0.35), 1.0))
    follow_hand(c, nibs, t)
    cam(x, lt, B(9), 1.0, 1.035)
    x.zoom += bump(("leave", "learn"), t, 31, 0.006) + 0.004 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ FIG. 4 · you (bars 40-48)
PHONE = (250, 250, 420, 740)
CARDS = [(820, 300), (820, 465), (820, 630), (820, 795)]
PCARDS = [(1320, 300), (1320, 465), (1320, 630)]
CARD_W, CARD_H = 400, 140


def card(c, x, y, u=1.0, a=1.0, dash=None, face=True, t=0.0):
    r = skia.Path()
    r.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, CARD_W, CARD_H), 14, 14))
    n = stroke(c, r, 2.0, u, a, dash=dash)
    if face and u >= 1:
        fx, fy = x + 60, y + CARD_H / 2
        c.drawCircle(fx, fy, 30, paint(0.9 * a, 1.6))
        c.drawCircle(fx - 10, fy - 8, 3, paint(a))
        c.drawCircle(fx + 10, fy - 8, 3, paint(a))
        sm = skia.Path()
        sm.addArc(skia.Rect.MakeXYWH(fx - 16, fy - 10, 32, 28), 20, 140)
        c.drawPath(sm, paint(0.95 * a, 1.8))
        for k in range(3):
            ww = [240, 200, 150][k]
            c.drawLine(x + 120, y + 46 + k * 30, x + 120 + ww, y + 46 + k * 30, paint(0.6 * a, 3))
    return n


@shot(B(40), B(48), tin=0.0, tout=0.0, kin="cut", kout="cut")
def you(c, x, t, lt):
    nibs = []
    border(c)
    title_block(c, t, status="复核", sheet="4 / 4", source="你 · 示意")
    fig_change(c, t, 40, ("FIG. 3", "产品 · 用户反馈"), ("FIG. 4", "你 · 身边"))
    fh = window("fig", 40, 41)
    px, py, pw, ph = PHONE
    r = skia.Path()
    r.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(px, py, pw, ph), 42, 42))
    nibs.append(stroke(c, r, 2.6, grow(fh[3], t, BEAT * 0.9)))
    if t >= fh[3] + BEAT * 0.9:
        c.drawLine(px + pw / 2 - 40, py + 28, px + pw / 2 + 40, py + 28, paint(0.8, 3))
        letter(c, "群聊（12）", px + pw / 2, py + 72, 26, 1.0, 0.85, align="center")
        c.drawLine(px + 16, py + 92, px + pw - 16, py + 92, paint(0.5, 1))
    # bar 41: the same three people keep talking
    for k, h in enumerate(window("msg", 41, 42)):
        if t >= h:
            who = [0, 1, 0, 2, 1, 0, 2, 0][k]
            yy = py + 140 + k * 54
            ax = px + 40
            c.drawCircle(ax, yy, 16, paint(0.9, 1.6))
            letter(c, "ABC"[who], ax, yy + 7, 18, 1.0, 0.9, kind="monob", align="center")
            bw = [210, 150, 260, 120, 190, 230, 140, 180][k]
            u = grow(h, t, 0.18)
            rr = skia.Path()
            rr.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(ax + 30, yy - 20, bw * u, 40), 16, 16))
            c.drawPath(rr, paint(0.9, 1.6))
            if u >= 1:
                c.drawLine(ax + 48, yy, ax + 30 + bw - 24, yy, paint(0.5, 3))
    # bar 45: the ones who left the group, as system lines
    for k, h in enumerate(window("contact", 45, 46)):
        if t >= h:
            yy = py + 140 + 8 * 54 + k * 36
            letter(c, f"— {'DEFG'[k]} 退出了群聊 —", px + pw / 2, yy + 8, 20, grow(h, t, 0.4), 0.6, align="center")
    # bar 42: the feed, everyone fine; bar 43: the ones who posted nothing
    for (cx_, cy_), h in zip(CARDS, window("post", 42, 43)):
        if t >= h:
            nibs.append(card(c, cx_, cy_, grow(h, t, 0.35)))
    if t >= B(42):
        letter(c, "朋友圈", 820, 284, 28, grow(B(42), t, 0.4), 0.85, kind="handb")
    ph_ = window("ppost", 43, 44)
    for k, ((cx_, cy_), h) in enumerate(zip(PCARDS, ph_[:3])):
        if t >= h:
            seen_h = window("seen", 47, 48)[k]
            solid = t >= seen_h
            a = 0.7 + 0.25 * grow(seen_h, t, 0.5) if solid else 0.7
            card(c, cx_ + 4 * math.sin(t * 0.9 + k), cy_, grow(h, t, 0.35), a, None if solid else HIDDEN, face=False)
            if solid:
                letter(c, "还好吗？", cx_ + CARD_W / 2, cy_ + CARD_H / 2 + 12, 34, grow(seen_h, t, 0.4), kind="handb",
                       align="center")
    if t >= ph_[3]:
        letter(c, "没发的", 1320, 284, 28, grow(ph_[3], t, 0.4), 0.85, kind="handb")
    # bar 44: applause marks around the visible cards
    for k, h in enumerate(window("clap", 44, 45)):
        if t >= h:
            cx_, cy_ = CARDS[k // 2]
            sx_ = cx_ - 26 if k % 2 == 0 else cx_ + CARD_W + 26
            s = t - h
            for j in range(3):
                ang = (-30 + 30 * j) * (1 if k % 2 else -1) + (180 if k % 2 == 0 else 0)
                L = 14 + 10 * ease_out(clamp(s / 0.2), 2)
                ax_, ay_ = sx_ + math.cos(math.radians(ang)) * 6, cy_ + CARD_H / 2 + math.sin(math.radians(ang)) * 6
                c.drawLine(ax_, ay_, ax_ + math.cos(math.radians(ang)) * L, ay_ + math.sin(math.radians(ang)) * L,
                           paint(0.9, 2.0))
    # bar 46: the friend who went quiet
    fr = window("friend", 46, 47)
    cx_, cy_ = PCARDS[1]
    if t >= fr[0]:
        nibs.append(rev_cloud(c, cx_ + CARD_W / 2, cy_ + CARD_H / 2, CARD_W / 2 + 18, CARD_H / 2 + 6,
                              grow(fr[0], t, BEAT * 0.9), 1.0, 20, 2.2))
    quiet = t < window("seen", 47, 48)[1]
    if t >= fr[1] and quiet:
        letter(c, "?", cx_ + 50, cy_ + CARD_H / 2 + 22, 64, grow(fr[1], t, 0.2), kind="handb")
    if t >= fr[2] and quiet:
        letter(c, "很久没动静", cx_ + 120, cy_ + CARD_H / 2 + 12, 32, grow(fr[2], t, 0.5), kind="handb")
    if t >= fr[3] and quiet:
        for j in range(3):                                  # typing… never sent
            on = 0.35 + 0.6 * (0.5 + 0.5 * math.sin(t * 6 - j * 0.9))
            c.drawCircle(cx_ + 300 + j * 22, cy_ + CARD_H - 26, 5, paint(on * grow(fr[3], t, 0.3)))
    follow_hand(c, nibs, t)
    cam(x, lt, B(8), 1.0, 1.035)
    x.zoom += bump(("post", "seen"), t, 40, 0.005) + 0.004 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ back to FIG. 1 (bars 48-53)
@shot(B(48), B(53), tin=0.0, tout=0.0, kin="cut", kout="cut")
def back(c, x, t, lt):
    nibs = []
    border(c)
    sh = window("stamp", 52, 53)[0]
    title_block(c, t, status="已加固" if t >= window("status", 52, 53)[0] else "复核", sheet="1 / 4")
    fig_change(c, t, 48, ("FIG. 4", "你 · 身边"), ("FIG. 1", "返航飞机 · 弹孔分布"))
    fh = window("fig", 48, 49)
    if t >= fh[2]:
        u = grow(fh[2], t, BEAT * 1.6)
        nibs += plane(c, t, us=[clamp(u * 2), clamp(u * 2 - 0.3), clamp(u * 2 - 0.6), clamp(u * 2 - 1)])
    rh = window("rehole", 49, 50)
    for k, (hx, hy, z) in enumerate(HOLES):
        h = rh[min(7, k * 8 // len(HOLES))] + (k % 3) * 0.05
        if t >= h:
            draw_hole(c, *P(hx, hy), t - h)
    if t >= B(49):
        tally(c, t, smooth((t - B(49)) / 0.4), full=True)
    eh = window("empty", 50, 51)
    for k in range(2):
        if t >= eh[k]:
            nibs.append(rev_cloud(c, *P(-190 if k == 0 else 190, -36), 120, 86, grow(eh[k], t, BEAT * 0.8), 1.0, 13, 2.4))
    for k in range(2):
        if t >= eh[2 + k]:
            for j in ((0, 1), (2, 3))[k]:
                ex, ey = ENGINES[j]
                balloon(c, *P(ex + (-40 if ex < 0 else 40), -175), *P(ex, ey - 20), "0", grow(eh[2 + k], t, 0.3), 24,
                        1.0, 26)
    for k, h in enumerate(window("rearmor", 51, 52)):
        if t >= h:
            hatch(c, nacelle_path(*ENGINES[k]), grow(h, t, BEAT * 0.6), 6, -45, 1.2, 0.95)
            if k == 0:
                letter(c, "该加固的，是这里", P(-190, -250)[0], P(-190, -250)[1], 32, grow(h, t, 0.6),
                       kind="handb", align="center")
    if t >= sh:
        stamp(c, 1560, 760, CONCEPT, CONCEPT_EN, ease_out(clamp((t - sh) / 0.12), 3))
    follow_hand(c, nibs, t)
    cam(x, lt, B(5), 1.0, 1.04)
    x.zoom += bump(("stamp", "settle"), t, 48, 0.02, 0.1) + 0.004 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ the closing lines (bars 53-57)
@shot(B(53), B(57), tin=0.0, tout=0.0, kin="cut", kout="cut")
def gold(c, x, t, lt):
    nibs = []
    border(c)
    header(c, t, "FIG. 1", "返航飞机 · 弹孔分布")
    title_block(c, t, status="已加固", sheet="1 / 4")
    # the finished FIG. 1, small, to the right; ghosts drift past behind it
    ox, oy = 1380, 590
    c.save()
    c.translate(ox, oy)
    c.scale(0.62, 0.62)
    c.translate(-PX, -PY)
    finished_plane(c, t, 1.0, 0.0)
    for k in range(4):
        hatch(c, nacelle_path(*ENGINES[k]), 1.0, 6, -45, 1.2, 0.95)
    c.restore()
    for k in range(3):
        gx = (t - B(53)) * 40 + k * 520 - 200
        ghost_plane(c, gx % 1900, 290 + k * 30, 0.16, 90, 0.35, (k % 4,))
    stamp(c, 1665, 800, CONCEPT, CONCEPT_EN, 1.0, size=52)
    gh = window("gold", 53, 57)
    pairs = [(GOLD[0][1], GOLD[1][1]), (GOLD[2][1], GOLD[3][1])]
    for p, (l1, l2) in enumerate(pairs):
        h1, h2 = gh[p * 4], gh[p * 4 + 2]
        h3, h4 = gh[p * 4 + 1], gh[p * 4 + 3]
        if not (B(53 + 2 * p) <= t < B(55 + 2 * p)):
            continue
        letter(c, l1, 140, 470, 64, grow(h1, t, BEAT * 1.4), kind="handb")
        letter(c, l2, 140, 580, 64, grow(h2, t, BEAT * 1.4), kind="handb")
        f = font(64, "handb")
        if t >= h3:
            nibs.append(line(c, [(140, 494), (140 + f.measureText(l1), 494)], 2.0, grow(h3, t, 0.5), 0.6))
        if t >= h4:
            nibs.append(line(c, [(140, 604), (140 + f.measureText(l2), 604)], 2.0, grow(h4, t, 0.5), 0.6))
    follow_hand(c, nibs, t)
    cam(x, lt, B(4), 1.0, 1.05)
    x.zoom += 0.004 * S.pulse("kick", t, 0.12)


# ------------------------------------------------------------------ end card, the lights go off (bars 57-62)
def end_card(c, t, glow=0.0):
    a = 1.0
    f = font(120, "handb")
    xx = 140
    for i, ch in enumerate(TITLE):
        h = window("echar", 57, 58)[i]
        if t >= h:
            letter(c, ch, xx, 400, 120, grow(h, t, 0.12), a, kind="handb")
        xx += f.measureText(ch) + 8
    u = grow(window("esub", 57, 58)[0], t, 0.6)
    w = font(34).measureText(CONCEPT)
    letter(c, CONCEPT, 146, 462, 34, clamp(u * 2), 0.9)
    letter(c, f" · {CONCEPT_EN}", 146 + w, 462, 26, clamp(u * 2 - 1), 0.85, kind="mono")
    letter(c, "一帧一理 · 05", 146, 520, 26, grow(window("eq", 57, 58)[0], t, 0.4), 0.7)
    for k, h in enumerate(window("ref", 58, 59)):
        if t >= h:
            letter(c, REFS[k], 146, 760 + k * 34, 20, grow(h, t, BEAT * 0.9), 0.75, kind="mono" if k < 3 else "hand")
    if t >= B(58):
        u = grow(B(58), t, 0.4)
        w = letter(c, "参考", 146, 720, 24, clamp(u * 2), 0.85)
        letter(c, " · REFERENCES", 146 + w, 720, 22, clamp(u * 2 - 1), 0.85, kind="mono")


@shot(B(57), B(62), tin=0.0, tout=0.0, kin="cut", kout="cut")
def end(c, x, t, lt):
    nibs = []
    border(c)
    header(c, t, "FIG. 1", "返航飞机 · 弹孔分布")
    sg = window("sign", 59, 60)
    title_block(c, t, status="已加固", sheet="4 / 4" if t >= sg[0] else "1 / 4",
                source="SRG · 1943" if t < sg[1] else "一帧一理 · 05")
    ox, oy = 1380, 560
    c.save()
    c.translate(ox, oy)
    c.scale(0.62, 0.62)
    c.translate(-PX, -PY)
    finished_plane(c, t, 1.0, 0.0)
    for k in range(4):
        hatch(c, nacelle_path(*ENGINES[k]), 1.0, 6, -45, 1.2, 0.95)
    c.restore()
    end_card(c, t)
    for k, h in enumerate(sg):
        if t >= h:
            nibs.append(line(c, [(1440, 880 - k * 0), (1440 + 380 * grow(h, t, 0.4), 880)], 1.4, grow(h, t, 0.4), 0.6))
    if t < B(60):
        follow_hand(c, nibs, t)
    cam(x, lt, B(5), 1.0, 1.06)


# ------------------------------------------------------------------ the page
CAPS = sorted(captions() + [(t_of(8, 3) + 0.1, B(10) - 0.3, TITLE_Q, "title", 38)])
NOTE_POS = {"top": (330, 150), "title": (760, 150)}


def notes(c, t):
    """Captions are drawing notes: lettered on in ~0.35 s in a NOTE box in the sheet's empty sky."""
    for k, (t0, t1, text, pos, size) in enumerate(CAPS):
        if not t0 <= t < t1 + 0.3:
            continue
        a = 1 - smooth((t - t1) / 0.3)
        plain = "".join(ch for ch, _ in parse_marks(text))
        x0, y0 = NOTE_POS[pos]
        note_box(c, x0, y0, 1300, plain, k + 1, size, clamp((t - t0) / 0.35), a)


def lights(t):
    """0 → 1: the lights go off on bar 60 and the white lines glow on the dark sheet."""
    lh = window("lights", 60, 61)[0]
    return ease_io(clamp((t - lh) / 0.5)) if t >= lh else 0.0


def setup():
    sheet_image(W, H)


def frame(fi):
    t = fi / tl.fps
    surf = skia.Surface(W, H)
    c = surf.getCanvas()
    c.clear(col4(TABLE, 1))
    x = Ctx(t)
    x.fx, x.fy = W / 2, H / 2
    pic = tl.record(x, t)
    lo = lights(t)
    c.save()
    z = x.zoom
    c.translate(W / 2, H / 2)
    c.scale(z, z)
    c.translate(-x.fx, -x.fy)
    c.drawImage(sheet_image(W, H), 0, 0)
    if lo > 0:
        c.drawPaint(skia.Paint(Color4f=col4((0.01, 0.02, 0.06), 0.82 * lo)))
        pulse = sum(math.exp(-max(0, t - h) / 0.5) for h in hit_times("glow") if t >= h)
        gl = skia.Paint(ImageFilter=skia.ImageFilters.Blur(9, 9))
        gl.setAlphaf(min(1.0, 0.5 + 0.35 * pulse) * lo)
        gl.setBlendMode(skia.BlendMode.kPlus)
        c.saveLayer(None, gl)
        c.drawPicture(pic)
        c.restore()
    c.drawPicture(pic)
    c.restore()
    notes(c, t)
    fade = smooth(t / 0.05) * smooth((tl.dur - t) / 1.0)
    if fade < 0.999:
        c.drawPaint(skia.Paint(Color4f=col4(TABLE, 1 - fade)))
    return post.finish(post.to_array(surf).astype(np.int16)).astype(np.uint8).tobytes()


if __name__ == "__main__":
    run(frame, setup, tl.dur, tl.fps, OUT, f"{TITLE}.mp4")
