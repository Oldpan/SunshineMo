"""谁先开口（死锁 · Deadlock） — 一帧一理 episode 2.  64 bars at 96 BPM = 160 s, one caption per bar.

  python3 music.py && python3 render.py --still 4 13 21 26 33 40 52 58   # check frames
  python3 render.py --range 0 25 --fps 30                               # preview
  python3 render.py                                                     # full 1920x1080 @ 60 fps

Shots draw only the picture; captions come from cues.LINES and are drawn by the style.
The chats, the database numbers and the heights of the study meters are illustrations, not data.
"""
import math
import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.timeline import Timeline, Sync  # noqa: E402
from core.pipeline import run  # noqa: E402
from style import *  # noqa: E402,F401,F403
from cues import BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, captions  # noqa: E402

tl = Timeline(bpm=BPM, bars=BARS, sections=SECTIONS, hard_cuts=True)
B, shot, BAR, BEAT = tl.B, tl.shot, tl.bar, tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))

PANEL = (0.035, 0.04, 0.055)


def at(lt, bar, dur=0.8, beat=0.0):
    """0 -> 1 ease starting at (bar, beat) of the shot's own clock."""
    return smooth((lt - bar * BAR - beat * BEAT) / dur)


def roll(lt, bar, dur, beat=0.0):
    return clamp((lt - bar * BAR - beat * BEAT) / dur)


def arrow(c, x0, y0, x1, y1, col, a=1.0, w=3.0, head=16, u=1.0, glow=False):
    """A straight arrow drawn to fraction u of its length."""
    if a <= 0.003 or u <= 0:
        return
    ex, ey = lerp(x0, x1, u), lerp(y0, y1, u)
    ang = math.atan2(ey - y0, ex - x0)
    if glow:
        c.drawLine(x0, y0, ex, ey, paint(col, a * 0.4, stroke=w * 3, blur=8))
    c.drawLine(x0, y0, ex, ey, paint(col, a, stroke=w, cap_round=True))
    for s in (1, -1):
        c.drawLine(ex, ey, ex - math.cos(ang + s * 0.45) * head, ey - math.sin(ang + s * 0.45) * head,
                   paint(col, a, stroke=w, cap_round=True))


def arc_arrow(c, cx, cy, r, a0, a1, col, a=1.0, w=3.0, head=16, u=1.0, glow=False):
    """An arrow along a circle from angle a0 to a1 (radians), drawn to fraction u."""
    if a <= 0.003 or u <= 0:
        return
    end = lerp(a0, a1, u)
    p = skia.Path()
    n = 24
    for k in range(n + 1):
        th = lerp(a0, end, k / n)
        (p.moveTo if k == 0 else p.lineTo)(cx + math.cos(th) * r, cy + math.sin(th) * r)
    if glow:
        c.drawPath(p, paint(col, a * 0.4, stroke=w * 3, blur=8))
    c.drawPath(p, paint(col, a, stroke=w, cap_round=True))
    ex, ey = cx + math.cos(end) * r, cy + math.sin(end) * r
    tang = end + (math.pi / 2 if a1 > a0 else -math.pi / 2)
    for s in (1, -1):
        c.drawLine(ex, ey, ex - math.cos(tang + s * 0.45) * head, ey - math.sin(tang + s * 0.45) * head,
                   paint(col, a, stroke=w, cap_round=True))


# ------------------------------------------------------------------ the phones
PH_W, PH_H, PH_Y = 360, 640, 455          # phone size, centre y
PH_L, PH_R = 600, 1320


def chat_bubble(c, s, x, y, side, col, a=1.0, size=28, u=1.0):
    """A message bubble whose near edge sits at x; side 'left' grows right, 'right' grows left."""
    if a <= 0.003 or u <= 0:
        return 0
    f = serif(size)
    tw = f.measureText(s)
    w, h = tw + 44, size * 1.9
    x0 = x if side == "left" else x - w
    sc = back_out(clamp(u), 1.4) if u < 1 else 1.0
    c.save()
    ox = x0 if side == "left" else x0 + w
    c.translate(ox, y + h / 2)
    c.scale(sc, sc)
    c.translate(-ox, -(y + h / 2))
    c.drawRRect(rrect(x0, y, w, h, 18), paint(col, a * 0.16))
    c.drawRRect(rrect(x0, y, w, h, 18), paint(col, a * 0.75, stroke=2))
    c.drawString(s, x0 + 22, y + h * 0.66, f, paint(INK, a))
    c.restore()
    return w


def phone(c, cx, t, a=1.0, mine=True, light=1.0, history=1.0, header=0.0, typed="", cursor=True, sent=None,
          sent_u=0.0, avatar_col=None):
    """A phone seen from the front.  mine: the left phone (you) or the right (TA).
    history: alpha of the old fight; header: 0..1 strength of '对方正在输入…'; typed: text in the input box;
    sent: a new message (sent_u 0..1 pops it in, on the sender's side)."""
    if a <= 0.003:
        return
    col = WARM if mine else COOL
    other = COOL if mine else WARM
    x0, y0 = cx - PH_W / 2, PH_Y - PH_H / 2
    spot(c, cx, PH_Y + 40, 420, col, a * 0.28 * light)
    c.drawRRect(rrect(x0 - 14, y0 - 14, PH_W + 28, PH_H + 28, 46), paint((0.015, 0.016, 0.022), a))
    c.drawRRect(rrect(x0 - 14, y0 - 14, PH_W + 28, PH_H + 28, 46), paint(FAINT, a, stroke=2.5))
    sh = skia.GradientShader.MakeLinear([skia.Point(cx, y0), skia.Point(cx, y0 + PH_H)],
                                        [argb(mixc(PANEL, col, 0.10 * light), a), argb(PANEL, a)])
    c.drawRRect(rrect(x0, y0, PH_W, PH_H, 34), skia.Paint(Shader=sh, AntiAlias=True))
    # header: the other person's avatar, and the typing line under it
    c.drawLine(x0 + 20, y0 + 104, x0 + PH_W - 20, y0 + 104, paint(FAINT, a * 0.8, stroke=1.5))
    c.drawCircle(cx, y0 + 38, 18, paint(avatar_col or other, a * 0.85))
    if header > 0.01:
        f = serif(24)
        s = "对方正在输入…"
        c.drawString(s, cx - f.measureText(s) / 2, y0 + 88, f, paint(other, a * header * 0.5, blur=6))
        c.drawString(s, cx - f.measureText(s) / 2, y0 + 88, f, paint(other, a * header))
    # the old fight: TA said 随便你, you said 行
    if history > 0.01:
        ha = a * history
        draw_text(c, "3 天前", cx, y0 + 148, serif(18), paint(DIM, ha * 0.8))
        ta_side = "left" if mine else "right"
        me_side = "right" if mine else "left"
        edge = {"left": x0 + 20, "right": x0 + PH_W - 20}
        chat_bubble(c, "随便你。", edge[ta_side], y0 + 172, ta_side, COOL, ha * 0.8)
        chat_bubble(c, "行。", edge[me_side], y0 + 240, me_side, WARM, ha * 0.8)
    if sent is not None and sent_u > 0:
        side = "right" if mine else "left"
        edge = x0 + PH_W - 20 if side == "right" else x0 + 20
        chat_bubble(c, sent, edge, y0 + 330, side, WARM, a, 28, sent_u)
    # input box
    by = y0 + PH_H - 86
    c.drawRRect(rrect(x0 + 18, by, PH_W - 36, 58, 29), paint(FAINT, a * 0.9, stroke=2))
    f = serif(26)
    tw = f.measureText(typed) if typed else 0
    if typed:
        c.drawString(typed, x0 + 40, by + 39, f, paint(INK, a))
    if cursor and int(t * 2.4) % 2 == 0:
        c.drawLine(x0 + 42 + tw, by + 14, x0 + 42 + tw, by + 44, paint(col, a * 0.9, stroke=2.5))


def typed_text(s, lt, bar, beat_in, beat_hold, beat_out, start_beat=0.0):
    """Type s over beat_in beats, hold, then delete it over beat_out beats (beats from the shot clock's bar)."""
    b = (lt - bar * BAR) / BEAT - start_beat
    if b < 0:
        return ""
    n = len(s)
    if b < beat_in:
        return s[:int(n * b / beat_in)]
    b -= beat_in
    if b < beat_hold:
        return s
    b -= beat_hold
    if beat_out <= 0:
        return s
    return s[:max(0, int(n * (1 - b / beat_out)))]


@shot(0, B(7), tin=0.0, tout=0.0, kin="cut", kout="cut")
def phones_open(c, x, t, lt):
    ua = at(lt, 0, 1.0)
    ub = at(lt, 0, 1.0, 1.5)
    # bar 3: you type and delete; TA sees you typing.  bar 4: the other way round.
    me_typed = typed_text("对不起，我刚才", lt, 3, 1.6, 0.6, 1.5)
    ta_typed = typed_text("其实我也", lt, 4, 1.0, 0.5, 1.0, 0.5)
    me_typing = 1.0 if me_typed else 0.0
    ta_typing = 1.0 if ta_typed else 0.0
    phone(c, PH_L, t, ua, True, 1.0, ua, ta_typing, me_typed)
    phone(c, PH_R, t, ub, False, 1.0, ub, me_typing, ta_typed)
    tag(c, "你", "YOU", PH_L, 870, WARM, at(lt, 1, 0.5), 30, "center")
    tag(c, "TA", None, PH_R, 870, COOL, at(lt, 1, 0.5, 1), 30, "center")
    # bar 2: three days
    u = at(lt, 2, 0.4)
    if u > 0:
        d = counter(roll(lt, 2, 1.0), 1, 3)
        tag(c, f"冷战 · 第 {d} 天", "DAY " + str(d), CX, 140, NEG, u, 32, "center")
    # bar 5: the two waits make a loop between the phones
    lu = at(lt, 5, 1.2)
    if lu > 0:
        stuck = at(lt, 6, 0.8)
        cw = mixc(WARM, NEG, stuck)
        cc = mixc(COOL, NEG, stuck)
        arc_arrow(c, CX, PH_Y, 150, math.pi * 1.15, math.pi * 1.85, cw, lu, 3, 14, lu, glow=stuck > 0.3)
        arc_arrow(c, CX, PH_Y, 150, math.pi * 0.15, math.pi * 0.85, cc, lu, 3, 14, lu, glow=stuck > 0.3)
        tag(c, "等", None, CX, PH_Y - 170, cw, lu, 30, "center")
        tag(c, "等", None, CX, PH_Y + 196, cc, lu, 30, "center")
    x.zoom = 1 + 0.05 * smooth((lt - B(6)) / BAR)


@shot(B(7), B(9), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt):
    # two dark phones behind the title, one warm one cool, both silent
    for xx, col in ((420, WARM), (1500, COOL)):
        c.drawRRect(rrect(xx - 80, 300, 160, 300, 24), paint(col, 0.08 * at(lt, 0, 1.5)))
        c.drawRRect(rrect(xx - 80, 300, 160, 300, 24), paint(col, 0.28 * at(lt, 0, 1.5), stroke=2))
    u = smooth(lt / 1.0)
    tag(c, CONCEPT, CONCEPT_EN, CX, 372, DIM, u * 0.9, 30, "center")
    title_glow(c, TITLE, CX, 580, 160, INK, u)
    c.drawLine(CX - 300 * u, 636, CX + 300 * u, 636, paint(FAINT, u, stroke=1.5))
    caption_line(c, TITLE_Q, CX, 708, 44, lt - 0.8, a=1.0, shadow=False)
    x.flash = 0.25 * S.pulse("impact", t, 0.25)
    x.zoom = 1.04 - 0.04 * smooth(lt / (2 * BAR))


# ------------------------------------------------------------------ the round table
TX, TY = 960, 455          # table centre
R_TABLE, R_SEAT, R_PLATE = 205, 300, 128


def seat_ang(i):
    return -math.pi / 2 + i * 2 * math.pi / 5


def stick_ang(k):
    """Chopstick k lies between philosopher k and k+1."""
    return seat_ang(k) + math.pi / 5


def philosopher(c, i, col=INK, a=1.0, glow=0.0):
    """Seen from above: a head and a shoulder arc facing the table."""
    th = seat_ang(i)
    hx, hy = TX + math.cos(th) * R_SEAT, TY + math.sin(th) * R_SEAT
    if glow > 0.01:
        spot(c, hx, hy, 120, col, glow * a)
    p = skia.Path()
    p.addArc(skia.Rect.MakeXYWH(hx - 52, hy - 52, 104, 104), math.degrees(th) + 180 - 70 + 180, 140)
    c.drawPath(p, paint(col, a * 0.8, stroke=4, cap_round=True))
    c.drawCircle(hx, hy, 26, paint(PANEL, a))
    c.drawCircle(hx, hy, 26, paint(col, a, stroke=3))


def plate(c, i, a=1.0, full=0.0, col=DIM):
    th = seat_ang(i)
    px, py = TX + math.cos(th) * R_PLATE, TY + math.sin(th) * R_PLATE
    c.drawCircle(px, py, 46, paint(col, a * 0.7, stroke=2))
    c.drawCircle(px, py, 30, paint(col, a * 0.35, stroke=1.5))
    if full > 0.01:
        spot(c, px, py, 90, WARM, full * a * 0.8)
        c.drawCircle(px, py, 24, paint(WARM, a * full * 0.8))


def stick_rest(k):
    th = stick_ang(k)
    return (TX + math.cos(th) * 150, TY + math.sin(th) * 150, th)


def stick_hand(k, owner):
    """Where chopstick k sits when philosopher `owner` holds it: upright by the head, on the chopstick's side."""
    th = seat_ang(owner)
    d = (stick_ang(k) - th + math.pi) % (2 * math.pi) - math.pi
    side = 1 if d > 0 else -1
    r = R_SEAT - 64
    return (TX + math.cos(th) * r - math.sin(th) * 40 * side, TY + math.sin(th) * r + math.cos(th) * 40 * side, th)


def chopstick(c, x_, y_, th, col, a=1.0, glow=0.0, label=None):
    dx, dy = math.cos(th) * 58, math.sin(th) * 58
    if glow > 0.01:
        c.drawLine(x_ - dx, y_ - dy, x_ + dx, y_ + dy, paint(col, a * glow * 0.6, stroke=14, blur=10))
    c.drawLine(x_ - dx, y_ - dy, x_ + dx, y_ + dy, paint(col, a, stroke=5, cap_round=True))
    if label:
        f = font(30, "SemiBold")
        lx, ly = TX + math.cos(th) * (R_TABLE + 4) * 0.42 + math.cos(th) * 0, TY + math.sin(th) * 80
        draw_text(c, label, x_ + math.cos(th + math.pi / 2) * 30, y_ + math.sin(th + math.pi / 2) * 30 + 10, f,
                  paint(col, a))


def table_base(c, a=1.0):
    c.drawCircle(TX, TY, R_TABLE, paint(PANEL, a * 0.9))
    c.drawCircle(TX, TY, R_TABLE, paint(FAINT, a, stroke=2.5))


def lerp_pt(p, q, u):
    return (lerp(p[0], q[0], u), lerp(p[1], q[1], u), lerp(p[2], q[2], u))


@shot(B(9), B(16), tin=0.6, tout=0.0, kin="fade", kout="cut")
def table(c, x, t, lt):
    # bar 9: the exam question
    yu = smooth(lt / 0.6) * (1 - at(lt, 1, 0.5))
    if yu > 0:
        title_glow(c, "1965", CX, 470, 170, INK, yu)
        tag(c, "艾兹格·迪杰斯特拉", "EDSGER W. DIJKSTRA", CX, 560, DIM, yu * at(lt, 0, 0.5, 1), 32, "center")
        tag(c, "原题：五台计算机，抢五台磁带机", None, CX, 660, DIM, yu * 0.8 * at(lt, 0, 0.5, 2), 26, "center")
        for k in range(5):
            xx = CX - 360 + k * 180
            c.drawRect(skia.Rect.MakeXYWH(xx - 40, 760, 80, 56), paint(FAINT, yu * at(lt, 0, 0.5, 2.5), stroke=2))
            c.drawCircle(xx - 14, 788, 11, paint(FAINT, yu * at(lt, 0, 0.5, 2.5), stroke=2))
            c.drawCircle(xx + 14, 788, 11, paint(FAINT, yu * at(lt, 0, 0.5, 2.5), stroke=2))
        return
    a0 = at(lt, 1, 0.6)
    stuck = at(lt, 6, 0.8)
    tag(c, "哲学家就餐问题", "DINING PHILOSOPHERS", 140, 120, INK, a0, 32)
    table_base(c, a0)
    for i in range(5):
        pa = a0 * smooth((lt - B(1) - i * 0.15) / 0.5)
        col = mixc(INK, NEG, stuck)
        philosopher(c, i, col, pa, 0.25 * stuck)
        plate(c, i, pa, 0.0, mixc(DIM, NEG, stuck * 0.6))
    # chopsticks: rest (bar 11 glow) -> picked up by the left-hand owner (bar 12, one per click)
    for k in range(5):
        rest = stick_rest(k)
        owner = (k + 1) % 5      # chopstick k is the left one of philosopher k+1
        pu = ease_io(clamp((lt - B(3) - (0.5 + ((k + 4) % 5) * 0.5) * BEAT) / 0.35))
        pos = lerp_pt(rest, stick_hand(k, owner), pu)
        g = at(lt, 2, 0.5, k * 0.4) * (1 - at(lt, 3, 0.5))
        col = mixc(mixc(DIM, WARM, max(g, pu)), NEG, stuck)
        chopstick(c, pos[0], pos[1], pos[2], col, a0, g)
    # bar 13: each reaches for the right-hand one, held by the neighbour
    ru = at(lt, 4, 0.6)
    if ru > 0:
        for i in range(5):
            th = seat_ang(i)
            hx, hy = TX + math.cos(th) * (R_SEAT - 40), TY + math.sin(th) * (R_SEAT - 40)
            tgt = stick_hand(i, (i + 1) % 5)
            col = mixc(COOL, NEG, stuck)
            arrow(c, hx, hy, lerp(hx, tgt[0], 0.8), lerp(hy, tgt[1], 0.8), col, ru * 0.9, 2.5, 12, ru)
    # bar 14: the count
    cu = at(lt, 5, 0.5)
    if cu > 0:
        tag(c, "5 人 · 5 根 · 每人 1 根", "FIVE PEOPLE, FIVE CHOPSTICKS", 1780, 120, DIM, cu, 30, "right")
    # bar 15: the circle of waiting
    if stuck > 0:
        arc_arrow(c, TX, TY, R_SEAT + 76, -math.pi / 2, -math.pi / 2 + 2 * math.pi * 0.97, NEG, stuck * 0.8, 3, 18,
                  ease_io(roll(lt, 6, 1.2)), glow=True)
        x.zoom = 1 + 0.04 * stuck


# ------------------------------------------------------------------ the wait-for graph and the four conditions
CONDS = [("互斥", "MUTUAL EXCLUSION"), ("占有并等待", "HOLD AND WAIT"), ("不可抢占", "NO PREEMPTION"),
         ("循环等待", "CIRCULAR WAIT")]


def ring_nodes(cx, cy, r, n=5):
    return [(cx + math.cos(seat_ang(i)) * r, cy + math.sin(seat_ang(i)) * r) for i in range(n)]


def wait_graph(c, cx, cy, r, a=1.0, col=NEG, open_=0.0, hold=0.0, lock=0.0, glow=0.0, node_cols=None):
    """Five nodes, each waiting on the next.  open_ fades the arrow from node 0 out: the circle breaks."""
    pts = ring_nodes(cx, cy, r)
    if glow > 0.01:
        c.drawCircle(cx, cy, r, paint(col, a * glow * 0.35, stroke=16, blur=18))
    for i in range(5):
        j = (i + 1) % 5
        (x0, y0), (x1, y1) = pts[i], pts[j]
        d = math.hypot(x1 - x0, y1 - y0)
        ux, uy = (x1 - x0) / d, (y1 - y0) / d
        aa = a * (1 - open_ if i == 0 else 1.0)
        acol = col if i != 0 else mixc(col, WARM, open_)
        arrow(c, x0 + ux * 44, y0 + uy * 44, x1 - ux * 44, y1 - uy * 44, acol, aa, 3, 14)
    for i, (px, py) in enumerate(pts):
        nc = node_cols[i] if node_cols else INK
        c.drawCircle(px, py, 30, paint(PANEL, a))
        c.drawCircle(px, py, 30, paint(nc, a, stroke=3))
        if hold > 0.01:     # each holds one chopstick
            c.drawLine(px - 14, py + 14, px + 14, py - 14, paint(WARM, a * hold, stroke=4, cap_round=True))
        if lock > 0.01:     # nobody can take it away
            c.drawRRect(rrect(px + 22, py - 52, 26, 20, 4), paint(DIM, a * lock))
            p = skia.Path()
            p.addArc(skia.Rect.MakeXYWH(px + 27, py - 66, 16, 26), 180, 180)
            c.drawPath(p, paint(DIM, a * lock, stroke=3))


@shot(B(16), B(18), tin=0.4, tout=0.0, kin="fade", kout="cut")
def deadlock(c, x, t, lt):
    u = at(lt, 0, 0.6)
    tag(c, "死锁", "DEADLOCK", 140, 120, NEG, u, 34)
    wait_graph(c, CX, 440, 240, u, NEG, glow=0.6 + 0.2 * math.sin(lt * 3))
    # bar 17: every single step is reasonable
    for i, (px, py) in enumerate(ring_nodes(CX, 440, 240)):
        su = at(lt, 1, 0.4, i * 0.35)
        if su > 0:
            tag(c, "合理", None, px + (60 if px >= CX else -60), py + 10, DIM, su, 24, "left" if px >= CX else "right")
    x.zoom = 1.02 - 0.02 * smooth(lt / (2 * BAR))


@shot(B(18), B(24), tin=0.5, tout=0.0, kin="fade", kout="cut")
def conditions(c, x, t, lt):
    a0 = at(lt, 0, 0.6)
    tag(c, "Coffman, Elphick & Shoshani · 1971", "SYSTEM DEADLOCKS, ACM COMPUTING SURVEYS", 140, 120, DIM, a0, 26)
    gx, gy = 1340, 450
    brk = at(lt, 5, 0.9, 1.5)
    wait_graph(c, gx, gy, 200, a0, mixc(NEG, DIM, brk), open_=brk, hold=at(lt, 1, 0.5), lock=at(lt, 3, 0.5),
               glow=(0.5 * at(lt, 4, 0.6)) * (1 - brk))
    # bar 20: hold and wait: each node also reaches for the next one's chopstick
    hw = at(lt, 2, 0.5) * (1 - at(lt, 3, 0.4))
    if hw > 0:
        for i, (px, py) in enumerate(ring_nodes(gx, gy, 200)):
            spot(c, px, py, 70, COOL, hw * 0.6)
    for k, (cn, en) in enumerate(CONDS):
        ua = at(lt, 1 + k, 0.5)
        if ua <= 0:
            continue
        y = 300 + k * 120
        on = 1.0 if 1 + k <= lt / BAR < 2 + k else 0.55
        col = NEG if k == 3 and lt < B(5) else INK
        draw_text(c, str(k + 1), 190, y + 6, font(44, "SemiBold"), paint(col, ua * on), "center")
        tag(c, cn, en, 240, y, col, ua * on, 38)
    # bar 23: strike one out, the circle opens
    if brk > 0:
        y = 300 + 3 * 120 - 12
        c.drawLine(230, y, 230 + 260 * brk, y, paint(WARM, 0.95, stroke=4, cap_round=True))
        tag(c, "拆掉一条", "BREAK ONE", 540, y + 12, WARM, brk, 28)


# ------------------------------------------------------------------ the ordering fix
LABEL = {k: str(5 - k) for k in range(5)}      # chopstick k carries number 5-k: philosopher 0 is the odd one out


def lower(i):
    """The lower-numbered of philosopher i's two chopsticks: left is k=i... here left = (i-1)%5 as in `table`."""
    left, right = (i - 1) % 5, i
    return left if int(LABEL[left]) < int(LABEL[right]) else right


@shot(B(24), B(30), tin=0.6, tout=0.0, kin="fade", kout="cut")
def ordering(c, x, t, lt):
    a0 = at(lt, 0, 0.6)
    tag(c, "资源排序", "RESOURCE ORDERING", 140, 120, INK, a0, 32)
    table_base(c, a0)
    # bars 28-29: eating passes round.  Philosopher 1 eats first (philosopher 0 waits on chopstick "1", so the
    # chopstick between them stays free); overlapping meals never share a chopstick.
    order = [1, 3, 0, 2, 4]
    eat = [0.0] * 5
    for n, i in enumerate(order):
        s0 = B(3) + n * BAR * 0.42
        eat[i] = clamp((lt - s0) / 0.3) * (1 - clamp((lt - s0 - BAR * 0.55) / 0.3)) if n < 4 else clamp((lt - s0) / 0.3)
    for i in range(5):
        pa = a0
        odd = i == 0 and lt > B(2)
        col = COOL if odd else INK
        philosopher(c, i, col, pa, 0.5 * at(lt, 2, 0.5) if i == 0 else 0.0)
        plate(c, i, pa, eat[i], WARM if eat[i] > 0.3 else DIM)
    # chopsticks with numbers (bar 25)
    nu = at(lt, 1, 0.4, 1)
    for k in range(5):
        rest = stick_rest(k)
        cnum = at(lt, 1, 0.3, 1 + ((5 - k) - 1) * 0.4)
        pos, own = rest, 0.0
        for i in (k, (k + 1) % 5):      # the two philosophers who can use chopstick k
            if eat[i] > own:
                own = eat[i]
                pos = lerp_pt(rest, stick_hand(k, i), ease_io(eat[i]))
        chopstick(c, pos[0], pos[1], pos[2], mixc(DIM, WARM, cnum), a0, 0.5 * cnum + 0.5 * own,
                  label=LABEL[k] if cnum > 0.05 and own < 0.3 else None)
    # bar 26: everyone reaches for the lower number; philosopher 0 goes the other way
    ru = at(lt, 2, 0.6)
    if ru > 0:
        for i in range(5):
            th = seat_ang(i)
            hx, hy = TX + math.cos(th) * (R_SEAT - 40), TY + math.sin(th) * (R_SEAT - 40)
            k = lower(i)
            tx_, ty_, _ = stick_rest(k)
            col = COOL if i == 0 else WARM
            arrow(c, hx, hy, lerp(hx, tx_, 0.72), lerp(hy, ty_, 0.72), col, ru * (1 - at(lt, 4, 0.5)) *
                  (1.0 if i == 0 else 0.55), 3 if i == 0 else 2, 12, ru, glow=i == 0)
        th = seat_ang(0)
        tag(c, "另一边", "THE OTHER WAY", TX + math.cos(th) * (R_SEAT + 80) + 70, TY + math.sin(th) * (R_SEAT + 60),
            COOL, ru * (1 - at(lt, 4, 0.5)), 28)
    # bar 27: the circle around the table has a gap
    gu = at(lt, 3, 0.6)
    if gu > 0:
        base = seat_ang(0) + 0.35
        arc_arrow(c, TX, TY, R_SEAT + 62, base, base + 2 * math.pi - 0.7, mixc(NEG, DIM, gu), 0.6 * (1 - at(lt, 4, 0.6)),
                  3, 16, 1.0)
        spot(c, TX + math.cos(seat_ang(0)) * (R_SEAT + 62), TY + math.sin(seat_ang(0)) * (R_SEAT + 62), 90, WARM,
             gu * (1 - at(lt, 4, 0.6)))
    x.zoom = 1 + 0.03 * at(lt, 3, 1.0)


# ------------------------------------------------------------------ the database
TX_NODES = {"A": (700, 330), "B": (1000, 600), "C": (1300, 330)}
COST = {"A": 12, "B": 3, "C": 8}


def txn(c, name, px, py, col, a=1.0, sub=None):
    c.drawRRect(rrect(px - 90, py - 46, 180, 92, 14), paint(PANEL, a))
    c.drawRRect(rrect(px - 90, py - 46, 180, 92, 14), paint(col, a, stroke=2.5))
    draw_text(c, f"事务 {name}", px, py + 12, serif(32), paint(col, a))
    if sub:
        tag(c, sub, None, px, py + 86, DIM, a, 24, "center")


@shot(B(30), B(36), tin=0.6, tout=0.0, kin="fade", kout="cut")
def database(c, x, t, lt):
    a0 = at(lt, 0, 0.6)
    tag(c, "数据库", "DATABASE", 140, 120, INK, a0, 32)
    found = at(lt, 2, 0.4)
    gone = at(lt, 4, 1.0)
    flow = at(lt, 5, 0.6)
    # a stream of other, healthy transactions along the bottom
    for k in range(9):
        px = (200 + k * 190 + lt * 60 * (0.3 + 0.7 * flow)) % 1800 + 60
        c.drawRRect(rrect(px - 40, 790, 80, 30, 8), paint(DIM, a0 * 0.35, stroke=1.5))
    names = ["A", "B", "C"]
    for n, nm in enumerate(names):
        nx = names[(n + 1) % 3]
        (x0, y0), (x1, y1) = TX_NODES[nm], TX_NODES[nx]
        d = math.hypot(x1 - x0, y1 - y0)
        ux, uy = (x1 - x0) / d, (y1 - y0) / d
        aa = a0 * at(lt, 0, 0.5, 1 + n * 0.5)
        if nm == "B" or nx == "B":
            aa *= 1 - gone
        col = mixc(DIM, NEG, found) if flow < 0.5 else WARM
        arrow(c, x0 + ux * 110, y0 + uy * 70, x1 - ux * 110, y1 - uy * 70, col, aa, 3, 14, 1.0, glow=found > 0.5)
    # bar 31: the lock monitor sweeps every 5 s
    su = at(lt, 1, 0.4) * (1 - at(lt, 2, 0.3))
    if su > 0:
        ang = (lt - B(1)) / (BAR * 0.9) * 2 * math.pi - math.pi / 2
        c.drawCircle(1000, 430, 340, paint(COOL, su * 0.25, stroke=1.5))
        c.drawLine(1000, 430, 1000 + math.cos(ang) * 340, 430 + math.sin(ang) * 340, paint(COOL, su * 0.7, stroke=2))
        sec = 5 - counter(roll(lt, 1, BAR * 0.9), 0, 5)
        tag(c, f"每 5 秒 · {sec}", "LOCK MONITOR", 1780, 120, COOL, su, 30, "right")
    if found > 0:
        tag(c, "发现死锁", "DEADLOCK DETECTED", 1780, 120, NEG, found * (1 - flow), 30, "right")
    # bar 33: the rollback cost of each; B is the cheapest
    cu = at(lt, 3, 0.5)
    for nm in names:
        px, py = TX_NODES[nm]
        if nm == "B":
            py = lerp(py, 760, ease_io(gone))
        col = DIM if found < 0.5 else NEG
        if flow > 0.5 and nm != "B":
            col = WARM
        if nm == "B" and lt > B(3):
            col = mixc(NEG, COOL, at(lt, 3, 0.4, 2))
        sub = f"回滚代价 {COST[nm]}" if cu > 0.05 else None
        txn(c, nm, px, py, col, a0 * (1 - 0.5 * gone if nm == "B" else 1.0), sub if nm != "B" or gone < 0.3 else None)
        if nm == "B" and lt > B(3):
            spot(c, px, py, 160, COOL, at(lt, 3, 0.4, 2) * (1 - gone))
        if nm == "B" and lt > B(4):
            tag(c, "牺牲者", "VICTIM", px + 120, py + 10, COOL, at(lt, 4, 0.4) * a0, 30)


# ------------------------------------------------------------------ the study
SX, RX, FY = 560, 1360, 720


def meter(c, x_, y_, v, col, a=1.0, label=None, en=None):
    """A vertical gauge 0..1 (illustrative)."""
    h = 300
    c.drawRRect(rrect(x_ - 22, y_ - h, 44, h, 10), paint(FAINT, a, stroke=2))
    c.drawRRect(rrect(x_ - 22, y_ - h * v, 44, h * v, 10), paint(col, a * 0.7))
    if label:
        tag(c, label, en, x_, y_ + 44, col, a, 24, "center")


@shot(B(36), B(44), tin=0.6, tout=0.0, kin="fade", kout="cut")
def study(c, x, t, lt):
    a0 = at(lt, 0, 0.6)
    if lt < B(1):
        figure(c, SX, FY, 1.0, WARM, a0)
        figure(c, RX, FY, 1.0, COOL, a0 * 0.6)
        c.drawLine(SX + 80, FY - 120, RX - 80, FY - 120, paint(FAINT, a0 * 0.5, stroke=1.5))
        return
    a = at(lt, 1, 0.6)
    tag(c, "Liu, Rim, Min & Min · 2022", "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY", 140, 120, DIM, a, 26)
    tag(c, "5900+ 人参与", "PARTICIPANTS", 1780, 120, DIM, a * at(lt, 1, 0.5, 1.5), 28, "right")
    figure(c, SX, FY, 1.0, WARM, a)
    figure(c, RX, FY, 1.0, COOL, a)
    tag(c, "发的人", "SENDER", SX, FY + 60, WARM, a, 28, "center")
    tag(c, "收到的人", "RECIPIENT", RX, FY + 60, COOL, a, 28, "center")
    # bar 38: a message flies across
    mu = ease_io(roll(lt, 2, 1.2, 1))
    if lt > B(2) + BEAT:
        mx = lerp(SX - 60, RX - 120, mu)
        chat_bubble(c, "最近好吗？", mx, 250, "left", WARM, a, 30, min(1.0, mu * 4))
    # bars 39-40: guess vs. what they felt (heights are an illustration)
    gu = at(lt, 3, 0.6)
    if gu > 0:
        meter(c, SX + 200, FY - 40, 0.45 * ease_io(roll(lt, 3, 1.2)), WARM, gu, "猜：对方有多开心", "PREDICTED")
    ru = at(lt, 4, 0.6)
    if ru > 0:
        v = 0.8 * ease_io(roll(lt, 4, 1.4))
        meter(c, RX - 200, FY - 40, v, COOL, ru, "实际有多开心", "ACTUAL")
        bu = at(lt, 4, 0.5, 3)
        if bu > 0:
            y0, y1 = FY - 40 - 300 * 0.45, FY - 40 - 300 * 0.8
            c.drawLine(SX + 240, y0, RX - 240, y0, paint(WARM, bu * 0.5, stroke=1.5))
            c.drawLine(RX - 240, y1, RX - 240, y0, paint(COOL, bu, stroke=2.5))
            tag(c, "低估了", "UNDERESTIMATED", RX - 260, (y0 + y1) / 2 + 10, COOL, bu, 28, "right")
        tag(c, "示意", None, CX, 860, DIM, ru * 0.7, 22, "center")
    # bar 41: surprise
    if lt > B(5):
        su = at(lt, 5, 0.5)
        spot(c, RX, FY - 150, 220, COOL, su * (0.7 + 0.2 * math.sin(lt * 4)))
        tag(c, "没想到", "SURPRISE", RX, FY - 250, COOL, su, 30, "center")
    # bar 42-43: 'giving in?' over the sender, struck out
    if lt > B(6):
        u = at(lt, 6, 0.4)
        tag(c, "认输？", None, SX, FY - 250, NEG, u, 34, "center")
        sk = at(lt, 7, 0.5)
        c.drawLine(SX - 56, FY - 262, SX - 56 + 112 * sk, FY - 262, paint(WARM, u, stroke=3.5))
        spot(c, SX, FY - 150, 220, WARM, sk * 0.7)


# ------------------------------------------------------------------ the circles in your life
PAIRS = [(380, "老朋友", "OLD FRIENDS"), (960, "爸妈", "PARENTS"), (1540, "工作群", "THE TEAM CHAT")]


def mini_card(c, x_, y_, lines, col, a=1.0, w=210, h=150):
    c.drawRRect(rrect(x_ - w / 2, y_ - h / 2, w, h, 16), paint(PANEL, a))
    c.drawRRect(rrect(x_ - w / 2, y_ - h / 2, w, h, 16), paint(col, a * 0.8, stroke=2))
    for k, (s, cc, sz) in enumerate(lines):
        draw_text(c, s, x_, y_ - h / 2 + 46 + k * 40, serif(sz), paint(cc, a))


@shot(B(44), B(50), tin=0.6, tout=0.0, kin="fade", kout="cut")
def life(c, x, t, lt):
    merge = ease_io(roll(lt, 4, 1.4))
    for k, (px, cn, en) in enumerate(PAIRS):
        u = at(lt, 1 + k, 0.6) if lt < B(4) + 0.1 else 1.0
        u0 = at(lt, 0, 0.6)
        a = max(u0 * 0.35, u) * (1 - merge)
        if a <= 0.003:
            continue
        tag(c, cn, en, px, 230, INK if u > 0.5 else DIM, a, 34, "center")
        lx, rx_, yy = px - 120, px + 120, 440
        if k == 0:
            mini_card(c, lx, yy, [("下次约！", WARM, 28), ("8 个月前", DIM, 20)], WARM, a)
            mini_card(c, rx_, yy, [("下次约！", COOL, 28), ("8 个月前", DIM, 20)], COOL, a)
        elif k == 1:
            mini_card(c, lx, yy, [("妈", WARM, 30), ("未拨出", DIM, 20)], WARM, a)
            mini_card(c, rx_, yy, [("孩子", COOL, 30), ("未拨出", DIM, 20)], COOL, a)
        else:
            mini_card(c, px, yy, [("这个谁来跟一下？", INK, 24), ("已读 12", DIM, 20)], DIM, a, 330, 150)
        arc_arrow(c, px, yy, 190, math.pi * 1.2, math.pi * 1.8, mixc(DIM, NEG, u), a * 0.8, 2.5, 12, 1.0)
        arc_arrow(c, px, yy, 190, math.pi * 0.2, math.pi * 0.8, mixc(DIM, NEG, u), a * 0.8, 2.5, 12, 1.0)
    # bars 48-49: everyone holding one chopstick, in one circle
    if merge > 0:
        nc = [INK] * 5
        wait_graph(c, CX, 450, 230, merge, NEG, hold=at(lt, 4, 0.6, 2), glow=0.4 * at(lt, 5, 0.6), node_cols=nc)
        nu = at(lt, 5, 0.5)
        for i, (px, py) in enumerate(ring_nodes(CX, 450, 230)):
            su = nu * smooth((lt - B(5) - i * 0.2) / 0.4)
            if su > 0:
                tag(c, "我没错", None, px + (54 if px >= CX else -54), py + 50, DIM, su, 22,
                    "left" if px >= CX else "right")


@shot(B(50), B(55), tin=0.6, tout=0.0, kin="fade", kout="cut")
def break_circle(c, x, t, lt):
    if lt < B(2):
        # the two words sit centre stage; the circle is only a faint ring behind them
        c.drawCircle(CX, CY - 20, 300, paint(NEG, 0.18 * at(lt, 0, 1.2), stroke=2))
        return
    a = at(lt, 2, 0.6)
    brk = at(lt, 3, 1.2, 1)
    cols = [mixc(INK, WARM, brk)] + [INK] * 4
    wait_graph(c, CX, 480, 240, a, mixc(NEG, DIM, brk), open_=brk, glow=0.5 * (1 - brk), node_cols=cols)
    if brk > 0:
        px, py = ring_nodes(CX, 480, 240)[0]
        spot(c, px, py, 200, WARM, brk)
        # one person turns round: an arrow back to the one they were waiting for
        arc_arrow(c, px, py, 70, -math.pi * 0.1, math.pi * 0.9, WARM, brk, 3, 14, brk)
        tag(c, "先开口", "ONE PERSON", px, py - 100, WARM, brk, 32, "center")
    # bar 54: things start to move: dots run round the open chain
    fu = at(lt, 4, 0.8)
    if fu > 0:
        pts = ring_nodes(CX, 480, 240)
        for k in range(10):
            s = ((lt * 0.6 + k / 10) % 1.0) * 4
            i = int(s)
            uu = s - i
            p0, p1 = pts[(i + 1) % 5], pts[(i + 2) % 5]
            c.drawCircle(lerp(p0[0], p1[0], uu), lerp(p0[1], p1[1], uu), 6, paint(WARM, fu * 0.8))


# ------------------------------------------------------------------ back to the phones
@shot(B(55), B(59), tin=0.8, tout=0.0, kin="fade", kout="cut")
def phones_back(c, x, t, lt):
    me_typed = typed_text("那天是我不好。", lt, 1, 2.0, 2.0, 0)
    sending = lt >= B(2) + BEAT
    if sending:
        me_typed = ""
    su = clamp((lt - B(2) - BEAT) / 0.35)
    ta_head = 1.0 if (lt > B(3) + BEAT) else 0.0
    ta_typed = typed_text("我也是，对不起", lt, 3, 2.5, 4, 0, 1.0)
    glow = at(lt, 3, 0.6, 1)
    phone(c, PH_L, t, 1.0, True, 1.0 + 0.6 * glow, 1.0, ta_head * (0.7 + 0.3 * math.sin(lt * 6)), me_typed,
          sent="那天是我不好。", sent_u=su)
    phone(c, PH_R, t, 1.0, False, 1.0 + 0.4 * su, 1.0, 1.0 if me_typed else 0.0, ta_typed,
          sent=None)
    # the message arrives on TA's phone too
    if su > 0:
        chat_bubble(c, "那天是我不好。", PH_R - PH_W / 2 + 20, PH_Y - PH_H / 2 + 330, "left", WARM, su, 28, su)
    if su > 0:
        fly = ease_io(clamp((lt - B(2) - BEAT) / 0.6))
        if fly < 1:
            c.drawCircle(lerp(PH_L + 120, PH_R - 120, fly), PH_Y - 60 - math.sin(fly * math.pi) * 120, 9,
                         paint(WARM, 1 - fly * 0.4))
    tag(c, "你", "YOU", PH_L, 870, WARM, 0.8, 30, "center")
    tag(c, "TA", None, PH_R, 870, COOL, 0.8, 30, "center")
    x.zoom = 1.05 - 0.05 * smooth(lt / (2 * BAR))


@shot(B(59), B(61), tin=0.0, tout=0.0, kin="cut", kout="cut")
def final_words(c, x, t, lt):
    # only the two phones, low in the frame, both lit, under the centred words
    for xx, col in ((760, WARM), (1160, COOL)):
        c.drawRRect(rrect(xx - 60, 780, 120, 220, 18), paint(col, 0.25))
        c.drawRRect(rrect(xx - 60, 780, 120, 220, 18), paint(col, 0.7, stroke=2))
        beam(c, xx, 780, 1080, 120, 280, col, 0.6)


REFS = ["Dijkstra, E. W. (1971). Hierarchical ordering of sequential processes. Acta Informatica, 1(2).",
        "Coffman, E. G., Elphick, M. J., & Shoshani, A. (1971). System deadlocks. ACM Computing Surveys, 3(2).",
        "Liu, P. J., Rim, S., Min, L., & Min, K. E. (2023). The surprise of reaching out. JPSP, 124(4).",
        "Microsoft. SQL Server deadlocks guide: deadlock detection and victim selection."]


@shot(B(61), B(64), tin=0.8, tout=0.0, kin="fade", kout="cut")
def end_card(c, x, t, lt):
    u = smooth(lt / 1.0)
    tag(c, CONCEPT, CONCEPT_EN, CX, 300, DIM, u * 0.9, 26, "center")
    title_glow(c, TITLE, CX, 450, 104, INK, u)
    c.drawLine(CX - 220, 500, CX + 220, 500, paint(FAINT, u, stroke=1.5))
    f = font(18, "Light")
    for i, r in enumerate(REFS):
        draw_text(c, r, CX, 590 + i * 32, f, paint(DIM, 0.8 * smooth((lt - 0.6 - i * 0.12) / 0.6)))
    tag(c, "片中聊天、数据库数字和实验图示为示意，不是数据；原题用叉子，片中换成了筷子", None, CX, 790, DIM,
        0.7 * smooth((lt - 1.4) / 0.6), 22, "center")


LOOKS = {"intro": LOOKS_BASE["night"], "title": LOOKS_BASE["deep"], "table": LOOKS_BASE["night"],
         "cycle": LOOKS_BASE["deep"], "order": LOOKS_BASE["warm"], "db": LOOKS_BASE["cool"],
         "people": LOOKS_BASE["warm"], "life": LOOKS_BASE["night"], "back": LOOKS_BASE["night"],
         "end": LOOKS_BASE["deep"]}
style = QuietConcept(tl, S, LOOKS, captions=captions())

if __name__ == "__main__":
    run(style.frame, style.setup, tl.dur, tl.fps, OUT, f"{TITLE}_Deadlock.mp4")
