"""Hand-drawn strokes: jittered paths that "boil" (re-jitter a few times a second, like
hand-animated line work) and draw on progressively with u in 0..1.

    hand_underline(c, x0, x1, y, u, col, t=t, seed="title")
    hand_circle(c, cx, cy, rx, ry, u, col, t=t)     # circle a word
"""
import math

import skia

from .gfx import rnd, paint, clamp, ease_out

BOIL = 8  # re-jitters per second


def jitter(pts, amp, seed, t=None, boil=BOIL):
    """Offset every point by up to `amp` px; the offsets change `boil` times a second."""
    k = int(t * boil) if t is not None else 0
    return [(x + (rnd(seed, k, i, "x") - 0.5) * 2 * amp, y + (rnd(seed, k, i, "y") - 0.5) * 2 * amp)
            for i, (x, y) in enumerate(pts)]


def spline(pts, closed=False):
    """Smooth path through the points (Catmull-Rom converted to cubics)."""
    p = skia.Path()
    n = len(pts)
    if n < 2:
        return p

    def P(i):
        return pts[i % n] if closed else pts[min(max(i, 0), n - 1)]

    p.moveTo(*pts[0])
    for i in range(n if closed else n - 1):
        p0, p1, p2, p3 = P(i - 1), P(i), P(i + 1), P(i + 2)
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        p.cubicTo(*c1, *c2, *p2)
    if closed:
        p.close()
    return p


def draw_on(c, path, u, p):
    """Draw the first u (0..1) of the path's length."""
    if u <= 0:
        return
    if u >= 1:
        c.drawPath(path, p)
        return
    pm = skia.PathMeasure(path, False)
    seg = skia.Path()
    pm.getSegment(0, pm.getLength() * u, seg, True)
    c.drawPath(seg, p)


def pen(col, a=1.0, w=4.0):
    return paint(col, a, stroke=w, cap_round=True)


def stroke(c, pts, u, col, a=1.0, w=4.0, t=None, seed=0, amp=1.4, closed=False):
    """Jitter + smooth + draw on.  A faint second pass gives the line some ink texture."""
    if u <= 0 or a <= 0.003:
        return
    path = spline(jitter(pts, amp, seed, t), closed)
    draw_on(c, path, u, pen(col, a, w))
    path2 = spline(jitter(pts, amp * 0.8, (seed, "b"), t), closed)
    draw_on(c, path2, u * 0.97, pen(col, a * 0.35, w * 0.55))


def hand_line(c, x0, y0, x1, y1, u, col, a=1.0, w=4.0, t=None, seed=0, sag=0.0, segs=8):
    pts = []
    for i in range(segs + 1):
        f = i / segs
        pts.append((x0 + (x1 - x0) * f, y0 + (y1 - y0) * f + sag * math.sin(f * math.pi)))
    stroke(c, pts, u, col, a, w, t, seed)


def hand_underline(c, x0, x1, y, u, col, a=1.0, w=5.0, t=None, seed=0):
    """Slightly rising line with a small flick at the end."""
    L = x1 - x0
    pts = [(x0 + L * f, y - 6 * f * f + 3 * math.sin(f * 7 + rnd(seed, "ph") * 6)) for f in
           (0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.0)]
    pts.append((x1 + 12, y - 14))
    stroke(c, pts, ease_out(u, 2), col, a, w, t, seed)


def hand_circle(c, cx, cy, rx, ry, u, col, a=1.0, w=5.0, t=None, seed=0, turns=1.15, start=200):
    """Loose loop around something, overshooting its start like a pen circling a word."""
    n = 26
    pts = []
    for i in range(n + 1):
        f = i / n
        ang = math.radians(start) + f * turns * 2 * math.pi
        wob = 1 + 0.05 * math.sin(f * 9 + rnd(seed, "w") * 6) + 0.04 * f
        pts.append((cx + rx * wob * math.cos(ang), cy + ry * wob * math.sin(ang) - 6 * f))
    stroke(c, pts, ease_out(u, 2), col, a, w, t, seed)


def hand_arrow(c, x0, y0, x1, y1, u, col, a=1.0, w=4.5, t=None, seed=0, bend=0.2, head=26):
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    nx, ny = -(y1 - y0) * bend, (x1 - x0) * bend
    pts = []
    for i in range(9):
        f = i / 8
        bx = (1 - f) ** 2 * x0 + 2 * (1 - f) * f * (mx + nx) + f * f * x1
        by = (1 - f) ** 2 * y0 + 2 * (1 - f) * f * (my + ny) + f * f * y1
        pts.append((bx, by))
    stroke(c, pts, clamp(u / 0.8), col, a, w, t, seed)
    hu = clamp((u - 0.8) / 0.2)
    if hu > 0:
        ang = math.atan2(y1 - pts[-2][1], x1 - pts[-2][0])
        for s in (-1, 1):
            hx = x1 - head * math.cos(ang + s * 0.5)
            hy = y1 - head * math.sin(ang + s * 0.5)
            hand_line(c, x1, y1, x1 + (hx - x1) * hu, y1 + (hy - y1) * hu, 1, col, a, w, t, (seed, s), segs=2)


def hand_check(c, x, y, s, u, col, a=1.0, w=6.0, t=None, seed=0):
    pts = [(x - s * 0.5, y), (x - s * 0.15, y + s * 0.38), (x + s * 0.55, y - s * 0.5)]
    stroke(c, pts, ease_out(u, 2), col, a, w, t, seed, amp=1.0)


def hand_cross(c, x, y, s, u, col, a=1.0, w=6.0, t=None, seed=0):
    hand_line(c, x - s / 2, y - s / 2, x + s / 2, y + s / 2, clamp(u * 2), col, a, w, t, (seed, 1), segs=3)
    hand_line(c, x + s / 2, y - s / 2, x - s / 2, y + s / 2, clamp(u * 2 - 1), col, a, w, t, (seed, 2), segs=3)


def hand_box(c, x, y, bw, bh, u, col, a=1.0, w=4.0, t=None, seed=0):
    pts = [(x, y), (x + bw * 0.5, y - 2), (x + bw, y), (x + bw + 2, y + bh * 0.5), (x + bw, y + bh),
           (x + bw * 0.5, y + bh + 2), (x, y + bh), (x - 2, y + bh * 0.5), (x + 3, y - 4)]
    stroke(c, pts, u, col, a, w, t, seed)


def hand_marker(c, x0, x1, y, hgt, u, col, a=0.4, t=None, seed=0, blend=None):
    """Highlighter swipe behind text (y = centre line).  On light paper pass blend=kMultiply."""
    if u <= 0:
        return
    xe = x0 + (x1 - x0) * ease_out(u, 2)
    k = int(t * BOIL) if t is not None else 0
    p = skia.Path()
    p.moveTo(x0 - 6, y - hgt / 2 + 3 * rnd(seed, k, 1))
    p.lineTo(xe + 4, y - hgt / 2 - 2 + 4 * rnd(seed, k, 2))
    p.lineTo(xe + 10, y + hgt / 2 - 4 * rnd(seed, k, 3))
    p.lineTo(x0 - 2, y + hgt / 2 + 2 * rnd(seed, k, 4))
    p.close()
    c.drawPath(p, paint(col, a, blend=blend))


def hand_star(c, x, y, r, u, col, a=1.0, w=3.5, t=None, seed=0):
    pts = []
    for i in range(11):
        ang = -math.pi / 2 + i * 4 * math.pi / 5
        pts.append((x + r * math.cos(ang), y + r * math.sin(ang)))
    stroke(c, pts, u, col, a, w, t, seed, amp=0.8)
