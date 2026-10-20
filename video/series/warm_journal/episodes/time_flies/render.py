"""长大后时间越过越快？可能不是年龄的锅 -- warm_journal, episode 1.

  python3 music.py && python3 render.py --still 5 20 60     # check frames
  python3 render.py --range 66 76 --fps 30                  # preview
  python3 render.py                                         # full 1920x1080 @ 60 fps
"""
import math
import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
from core.gfx import *  # noqa: E402,F401,F403
from core.hand import *  # noqa: E402,F401,F403
from core.timeline import Timeline, Sync, tape_time  # noqa: E402
from core.pipeline import run  # noqa: E402
from style import *  # noqa: E402,F401,F403

SECTIONS = [  # must match music.py
    ("intro", 0, 4), ("verse", 4, 12), ("memory", 12, 16), ("build", 16, 24), ("drop1", 24, 32),
    ("evidence", 32, 40), ("mechanism", 40, 48), ("drop2", 48, 56), ("advice", 56, 62), ("outro", 62, 66),
]
tl = Timeline(bpm=80, bars=66, sections=SECTIONS)
B, shot = tl.B, tl.shot
FPS, BEAT, BAR, DUR = tl.fps, tl.beat, tl.bar, tl.dur
S = Sync(os.path.join(OUT, "sync.npz"))
TS = B(23, 2)                  # tape stop
TD = B(23, 3) - TS


def kick(t, d=0.12):
    return S.pulse("kick", t, d)


def u_(t, t0, d):
    return clamp((t - t0) / d)


def cap(c, s, x, y, size, lt, col, bold=False, align="center", kind="kai", stagger=0.05, dur=0.6, exit_t=None):
    """Main caption style: ink soaking into the paper."""
    return text_ink(c, s, x, y, font(size, kind, bold), lt, col=col, align=align, stagger=stagger, dur=dur,
                    exit_t=exit_t)


def src(c, s, x, y, col, a=0.85, size=28, align="center"):
    draw_text(c, s, x, y, font(size, "kai-light"), paint(col, a), align)


def width(s, size, bold=False, kind="kai"):
    return font(size, kind, bold).measureText(s)


def slow(t):
    """Picture time through the tape stop: decelerates with the audio, then freezes."""
    return tape_time(t, TS, TD)


# ================================================================ intro (dawn)
DAYS = {25: ("五", "早睡", "熬夜"), 26: ("六", "休息", "加班"), 27: ("日", "见朋友", "宅着"), 28: ("一", "打卡", "迟到"),
        29: ("二", "冲业绩", "摸鱼"), 30: ("三", "写总结", "拖延"), 31: ("四", "回家", "内耗")}
FLIPS = [B(3, k / 2) for k in range(6)]  # 25 -> 31, on the page rustles
TEAR = 0.34


def calendar_stack(c, t, flips, first, cx, cy, s, top, days, L):
    n = sum(1 for f in flips if t >= f)
    rest = first + n
    wk, yi, ji = days[rest]
    calendar_page(c, cx, cy, s, top(rest), rest % 100, "星期" + wk, (yi, ji), L, red=wk in ("日", "节"))
    if n > 0 and t < flips[n - 1] + TEAR:
        d = rest - 1
        wk, yi, ji = days[d]
        calendar_page(c, cx, cy, s, top(d), d % 100, "星期" + wk, (yi, ji), L, tear=(t - flips[n - 1]) / TEAR,
                      red=wk == "日")


@shot(0, B(4), tin=0.01, tout=0.01, kin="cut", kout="cut")
def intro_calendar(c, x, t, lt):
    L = x.look
    calendar_stack(c, t, FLIPS, 25, 1330, 575, 1.18, lambda d: "2026 · 十二月", DAYS, L)
    sec = 44 + max(S.index("tick", t), 0)  # 06:59:44 ... 06:59:59, then the alarm at 07:00
    clock(c, 1745, 175, 95, 6 + (59 + sec / 60) / 60, L, sec=sec, numbers=False)
    cap(c, "你有没有发现——", 170, 370, 60, lt - B(0, 2), L["soft"], align="left")
    cap(c, "今年好像什么都没干，", 170, 505, 84, lt - B(1, 1), L["ink"], bold=True, align="left")
    w = cap(c, "就过完了？", 170, 635, 84, lt - B(2, 0), L["a1"], bold=True, align="left")
    hand_underline(c, 175, 175 + w, 668, u_(lt, B(2, 1.5), 0.6), L["a1"], t=t, seed="u1")


# ================================================================ verse (office day)
DAY = [(7.0, "07:00", "闹钟响了第三遍", "alarm"), (8.5, "08:30", "挤上同一班地铁", "metro"),
       (9.0, "09:00", "打卡", "punch"), (12.5, "12:30", "外卖又凉了", "food"),
       (15.0, "15:00", "今天第三个会", "meeting"), (18.0, "18:00", "说好的下班呢", "laptop"),
       (21.78, "21:47", "终于下班", "night"), (25.0, "01:00", "刷着刷着，就一点了", "feed")]


def icon(c, kind, t, li, L):
    ink, a1, a2 = (0.18, 0.16, 0.17), L["a1"], L["a2"]
    if kind == "alarm":
        sh = S.pulse("alarm", t, 0.6) * 7 * math.sin(t * 90)
        c.save()
        c.translate(sh, 0)
        with phone(c, 0, 0, 120, 210, rot=sh * 0.6):
            f = font(34, "Inter-SemiBold")
            draw_text(c, "07:00", 51, 92, f, paint(ink))
            c.drawRRect(rrect(16, 120, 72, 22, 11), paint(a1, 0.9))
        c.restore()
        for s_ in (-1, 1):
            for k in range(2):
                r = 100 + 26 * k
                c.drawArc(skia.Rect.MakeXYWH(-r, -r, 2 * r, 2 * r), (0 if s_ > 0 else 180) - 25, 50, False,
                          paint(ink, 0.7 * (0.5 + 0.5 * math.sin(t * 20 + k)), stroke=5, cap_round=True))
    elif kind == "metro":
        c.drawRRect(rrect(-100, -90, 200, 160, 34), paint(a2))
        c.drawRRect(rrect(-78, -70, 72, 60, 10), paint((0.97, 0.96, 0.92)))
        c.drawRRect(rrect(6, -70, 72, 60, 10), paint((0.97, 0.96, 0.92)))
        for sx in (-55, 55):
            c.drawCircle(sx, 32, 12, paint((1.0, 0.9, 0.6)))
        for s_ in (-1, 1):
            c.drawLine(s_ * 60, 75, s_ * 130, 120, paint(ink, 0.8, stroke=5, cap_round=True))
        for k in range(4):
            yy = 80 + ((t * 120 + k * 12) % 48)
            c.drawLine(-70 - (yy - 75) * 0.9, yy, 70 + (yy - 75) * 0.9, yy, paint(ink, 0.35, stroke=3))
    elif kind == "punch":
        stamp(c, "已打卡", 0, -10, 64, u_(li, 0.05, 0.18), col=a1, rot=-10, seed=3)
    elif kind == "food":
        c.drawRect(skia.Rect.MakeLTRB(-80, -60, 80, 90), paint((0.78, 0.60, 0.42)))
        c.drawRect(skia.Rect.MakeLTRB(-80, -60, 80, -38), paint((0.66, 0.49, 0.33)))
        c.drawArc(skia.Rect.MakeXYWH(-40, -110, 80, 100), 180, 180, False, paint(ink, 0.8, stroke=6))
        for sx in (-25, 25):
            c.drawCircle(sx, 10, 6, paint(ink))
        c.drawArc(skia.Rect.MakeXYWH(-24, 34, 48, 34), 200, 140, False, paint(ink, stroke=5, cap_round=True))
    elif kind == "meeting":
        for k in range(3):
            uu = u_(li, 0.1 + k * 0.18, 0.2)
            if uu <= 0:
                continue
            bx, by = -110 + k * 70, -80 + k * 46
            c.drawRRect(rrect(bx, by, 150, 84, 36), paint((a2, a1, (0.55, 0.55, 0.6))[k], uu))
            for j in range(3):
                c.drawCircle(bx + 45 + j * 30, by + 42, 7, paint(WHITE, uu))
    elif kind == "laptop":
        c.drawRRect(rrect(-120, -110, 240, 150, 10), paint((0.2, 0.22, 0.28)))
        for j in range(5):
            c.drawRect(skia.Rect.MakeXYWH(-100, -90 + j * 24, 60 + 110 * rnd("code", j), 9), paint(a2, 0.85))
        p = skia.Path()
        p.moveTo(-150, 60)
        p.lineTo(150, 60)
        p.lineTo(120, 40)
        p.lineTo(-120, 40)
        p.close()
        c.drawPath(p, paint((0.45, 0.46, 0.5)))
        c.drawRRect(rrect(150, -10, 50, 60, 8), paint((0.95, 0.94, 0.9)))
        c.drawRRect(rrect(150, -10, 50, 60, 8), paint(ink, 0.8, stroke=3))
        for k in range(2):
            hand_line(c, 165 + k * 18, -20, 170 + k * 18, -60, 1, ink, 0.5, 3, t=t, seed=("steam", k), sag=6)
    elif kind == "night":
        c.drawCircle(0, -20, 90, paint((0.98, 0.82, 0.42)))
        c.drawCircle(38, -48, 82, paint(L["card"]))
        for k, (sx, sy) in enumerate(((-130, -90), (110, 40), (-90, 70))):
            hand_star(c, sx, sy, 16, 1, (0.85, 0.65, 0.2), t=t, seed=("ns", k))
    elif kind == "feed":
        with phone(c, 0, 0, 150, 250):
            for k in range(8):
                yy = (k * 70 - (t * 260) % 70) - 20
                c.drawRRect(rrect(12, yy, 112, 58, 8), paint(((0.85, 0.85, 0.88), (0.8, 0.86, 0.95),
                                                              (0.95, 0.85, 0.85))[k % 3]))


@shot(B(4), B(8), tin=0.01, tout=0.35, kin="cut", kout="slide")
def day_montage(c, x, t, lt):
    L = x.look
    seg = 2 * BEAT
    i = min(int(lt / seg), len(DAY) - 1)
    li = lt - i * seg
    h0 = DAY[i - 1][0] if i > 0 else 6 + 59 / 60
    h = lerp(h0, DAY[i][0], back_out(u_(li, 0, 0.42), 1.4))
    clock(c, 560, 545, 270, h, L, sec=(t * 6) % 60)
    hh, label_, line, kind = DAY[i]
    sc = lerp(1.07, 1.0, ease_out(u_(li, 0, 0.18)))
    with card(c, 1330, 545, 640, 600, rot=(-2 if i % 2 else 2), fill=L["card"], scale=sc):
        c.save()
        c.translate(0, -120)
        icon(c, kind, t, li, L)
        c.restore()
        text_roll(c, label_, 0, 125, font(116, "Inter-SemiBold"), u_(li, 0, 0.3), col=(0.18, 0.16, 0.17), spins=0)
        draw_text(c, line, 0, 225, font(52, "kai", True), paint(L["a1"] if i in (3, 6) else (0.25, 0.22, 0.24)))


@shot(B(8), B(10), tin=0.35, tout=0.3, kin="slide", kout="fade")
def week_year(c, x, t, lt):
    L = x.look
    ink, a1 = L["ink"], L["a1"]
    days = "一二三四五六日"
    cw, gap = 150, 22
    x0 = CX - (7 * cw + 6 * gap) / 2
    for k, d in enumerate(days):
        uu = u_(lt, k * 0.05, 0.25)
        with card(c, x0 + k * (cw + gap) + cw / 2, 300, cw, cw, rot=rnd("wk", k) * 4 - 2, fill=L["card"],
                  a=uu, lift=0.6):
            draw_text(c, "周" + d, 0, 18, font(48, "kai", True), paint((0.2, 0.18, 0.2)))
            hand_cross(c, 0, 0, 110, u_(lt, BEAT * (0.5 + k * 0.5), 0.2), a1, w=7, t=t, seed=("x", k))
    cap(c, "一周，一眨眼", CX, 500, 70, lt - BEAT * 0.5, ink, bold=True)
    mw, mg = 104, 14
    m0 = CX - (12 * mw + 11 * mg) / 2
    for k in range(12):
        uu = u_(lt, BAR + k * 0.03, 0.2)
        cxk = m0 + k * (mw + mg) + mw / 2
        with card(c, cxk, 700, mw, 96, fill=L["card"], a=uu, lift=0.5):
            draw_text(c, f"{k + 1}月", 0, 12, font(34, "kai"), paint((0.25, 0.22, 0.24)))
        hand_check(c, cxk + 8, 712, 64, u_(lt, BAR + BEAT * 0.5 + k * BEAT / 8, 0.12), a1, w=6, t=t, seed=("m", k))
    cap(c, "一年，也一眨眼", CX, 880, 70, lt - BAR - BEAT * 2, a1, bold=True)


def fu(c, cx, cy, size, a, rot=0.0):
    c.save()
    c.translate(cx, cy)
    c.rotate(45 + rot)
    c.drawRect(skia.Rect.MakeXYWH(-size / 2 + 6, -size / 2 + 12, size, size), paint(SHADOW, 0.3 * a, blur=12))
    c.drawRect(skia.Rect.MakeXYWH(-size / 2, -size / 2, size, size), paint(CAL_RED, a))
    c.drawRect(skia.Rect.MakeXYWH(-size / 2 + 12, -size / 2 + 12, size - 24, size - 24),
               paint((0.95, 0.75, 0.3), a * 0.8, stroke=3))
    c.rotate(-45)
    draw_text(c, "福", 0, size * 0.25, font(size * 0.62, "kai", True), paint((1.0, 0.84, 0.4), a))
    c.restore()


@shot(B(10), B(11), tin=0.3, tout=0.3, kin="fade", kout="slide")
def spring(c, x, t, lt):
    L = x.look
    u1, u2 = u_(lt, 0, 0.25), u_(lt, BEAT * 1.5, 0.25)
    fu(c, 600, 440, 230 * lerp(1.2, 1, back_out(u1)), u1, -4)
    if u2 > 0:
        fu(c, 1320, 440, 230 * lerp(1.3, 1, back_out(u2)), u2, 5)
    hand_arrow(c, 800, 430, 1110, 430, u_(lt, BEAT * 0.6, 0.7), L["ink"], t=t, seed="fa", bend=-0.25)
    cap(c, "刚过完春节，", 600, 720, 64, lt - 0.1, L["ink"], bold=True)
    cap(c, "又要春节了", 1320, 720, 64, lt - BEAT * 1.6, L["a1"], bold=True)


@shot(B(11), B(12), tin=0.3, tout=0.45, kin="slide", kout="fade")
def flags(c, x, t, lt):
    L = x.look
    ink = (0.2, 0.18, 0.2)
    with card(c, CX, 470, 780, 560, rot=-1.5, fill=L["card"]):
        tape(c, 0, -280, 200, rot=3, col=(0.62, 0.78, 0.95))
        draw_text(c, "2026 · 年初的 flag", -320, -170, font(50, "kai", True), paint(ink), align="left")
        items = ["读完 12 本书", "每周健身三次", "把英语学好", "早睡早起"]
        for k, s in enumerate(items):
            uu = u_(lt, 0.1 + k * BEAT / 2, 0.2)
            yy = -70 + k * 82
            hand_box(c, -320, yy - 38, 44, 44, uu, ink, w=4, t=t, seed=("fb", k))
            draw_text(c, s, -250, yy, font(46, "kai"), paint(ink, uu), align="left")
    cap(c, "一个都没打勾", CX, 880, 68, lt - BEAT * 2.2, L["a1"], bold=True)


# ================================================================ memory (sepia)
def summer_photo(c, ps, t):
    sky = skia.GradientShader.MakeLinear([skia.Point(0, -ps / 2), skia.Point(0, ps * 0.1)],
                                         [argb((0.55, 0.78, 0.92)), argb((0.98, 0.86, 0.66))])
    c.drawRect(skia.Rect.MakeXYWH(-ps / 2, -ps / 2, ps, ps), skia.Paint(Shader=sky))
    c.drawCircle(ps * 0.3, -ps * 0.3, 40, paint((1.0, 0.92, 0.6), 0.9, blur=10))
    c.drawCircle(ps * 0.3, -ps * 0.3, 32, paint((1.0, 0.96, 0.8)))
    c.drawRect(skia.Rect.MakeLTRB(-ps / 2, ps * 0.12, ps / 2, ps / 2), paint((0.62, 0.42, 0.28)))
    c.drawRect(skia.Rect.MakeLTRB(-ps / 2, ps * 0.12, ps / 2, ps * 0.16), paint((0.72, 0.52, 0.36)))
    # watermelon slice
    cx, cy, r = -ps * 0.2, ps * 0.13, ps * 0.2
    rect = skia.Rect.MakeXYWH(cx - r, cy - r, 2 * r, 2 * r)
    c.drawArc(rect, 180, 180, True, paint((0.25, 0.55, 0.25)))
    rect2 = skia.Rect.MakeXYWH(cx - r * 0.86, cy - r * 0.86, r * 1.72, r * 1.72)
    c.drawArc(rect2, 180, 180, True, paint((0.92, 0.3, 0.3)))
    for k in range(7):
        ang = math.pi + (k + 0.5) / 7 * math.pi
        c.drawOval(skia.Rect.MakeXYWH(cx + r * 0.55 * math.cos(ang) - 4, cy + r * 0.55 * math.sin(ang) - 6, 8, 12),
                   paint((0.15, 0.1, 0.1)))
    # electric fan, blades turning
    fx, fy, fr = ps * 0.22, -ps * 0.02, ps * 0.15
    c.drawLine(fx, fy, fx, ps * 0.12, paint((0.35, 0.35, 0.4), stroke=8))
    for k in range(3):
        ang = t * 9 + k * 2 * math.pi / 3
        c.save()
        c.translate(fx, fy)
        c.rotate(math.degrees(ang))
        c.drawOval(skia.Rect.MakeXYWH(4, -fr * 0.22, fr * 0.9, fr * 0.44), paint((0.55, 0.75, 0.85), 0.8))
        c.restore()
    c.drawCircle(fx, fy, fr, paint((0.35, 0.35, 0.4), stroke=4))
    c.drawCircle(fx, fy, 10, paint((0.35, 0.35, 0.4)))
    # holiday homework
    c.save()
    c.translate(ps * 0.02, ps * 0.32)
    c.rotate(-8)
    c.drawRect(skia.Rect.MakeXYWH(-70, -40, 140, 80), paint((0.95, 0.93, 0.88)))
    draw_text(c, "暑假作业", 0, 8, font(26, "kai", True), paint((0.25, 0.2, 0.2)))
    c.restore()


@shot(B(12), B(14), tin=0.5, tout=0.5, kin="fade", kout="fade")
def summer(c, x, t, lt):
    L = x.look
    sway = 1.5 * math.sin(t * 0.8)
    with polaroid(c, 1300, 520, 560, rot=-4 + sway, a=u_(lt, 0, 0.5)) as _:
        summer_photo(c, 560 * 0.88, t)
    tape(c, 1300, 200, 220, rot=-8, col=(0.95, 0.66, 0.55))
    draw_text(c, "那年夏天", 1300 + 10, 520 + 560 * 1.18 / 2 - 34, font(36, "kai"), paint((0.35, 0.28, 0.25),
                                                                                       u_(lt, 0.6, 0.4)))
    cap(c, "小时候，", 200, 380, 64, lt - 0.3, L["soft"], align="left")
    cap(c, "一个暑假", 200, 525, 100, lt - BEAT * 1.2, L["ink"], bold=True, align="left")
    cap(c, "长得像一辈子", 200, 660, 100, lt - BEAT * 2.6, L["a1"], bold=True, align="left")


@shot(B(14), B(16), tin=0.5, tout=0.45, kin="fade", kout="slide")
def now_year(c, x, t, lt):
    L = x.look
    cap(c, "现在，", CX, 360, 64, lt - 0.1, L["soft"])
    cap(c, "一年，像一眨眼", CX, 530, 110, lt - BEAT, L["ink"], bold=True)
    u = ease_io(u_(lt, BEAT * 2.2, 0.7))
    bw = 1000
    c.drawRRect(rrect(CX - bw / 2, 610, bw, 42, 21), paint(L["ink"], 0.12))
    if u > 0:
        c.drawRRect(rrect(CX - bw / 2, 610, max(42, bw * u), 42, 21), paint(L["a1"], 0.85))
    hand_box(c, CX - bw / 2 - 6, 604, bw + 12, 54, u_(lt, BEAT * 1.8, 0.4), L["ink"], w=3, t=t, seed="yb")
    text_roll(c, f"2026 年已过去 {int(round(100 * u))}%", CX, 730, font(40, "kai"), 1.0, col=L["soft"],
              a=u_(lt, BEAT * 2.2, 0.3))
    # a literal blink
    bu = u_(lt, BAR + BEAT * 1.5, 0.32)
    if 0 < bu < 1:
        lid = math.sin(bu * math.pi) * 560
        c.drawRect(skia.Rect.MakeLTRB(-50, -50, W + 50, lid - 10), paint((0.12, 0.08, 0.05), 0.92))
        c.drawRect(skia.Rect.MakeLTRB(-50, H - lid + 10, W + 50, H + 50), paint((0.12, 0.08, 0.05), 0.92))


# ================================================================ build (dusk): the popular explanation
@shot(B(16), B(18), tin=0.45, tout=0.4, kin="slide", kout="slide")
def myth(c, x, t, lt):
    L = x.look
    cap(c, "很多人觉得：", CX, 360, 60, lt - 0.1, L["soft"])
    cap(c, "因为我们老了", CX, 520, 104, lt - BEAT, L["ink"], bold=True)
    cap(c, "年纪越大，一年在人生里占的比例就越小", CX, 680, 48, lt - BAR, L["ink"])
    w = width("因为我们老了", 104, True)
    hand_underline(c, CX - w / 2, CX + w / 2, 552, u_(lt, BEAT * 2.2, 0.5), L["a1"], t=t, seed="old")


def pie(c, cx, cy, r, frac, u, L, seed):
    c.drawCircle(cx + 4, cy + 9, r, paint(SHADOW, 0.25, blur=12))
    c.drawCircle(cx, cy, r, paint(L["card"]))
    sweep = 360 * frac * ease_out(u)
    if sweep > 0:
        c.drawArc(skia.Rect.MakeXYWH(cx - r, cy - r, 2 * r, 2 * r), -90, sweep, True, paint(L["a1"]))
    hand_circle(c, cx, cy, r + 4, r + 4, u_(u, 0, 0.6), L["ink"], w=4, turns=1.02, start=-90, seed=seed)


@shot(B(18), B(20), tin=0.4, tout=0.4, kin="slide", kout="fade")
def ratio(c, x, t, lt):
    L = x.look
    cap(c, "1877 年，法国哲学家 Paul Janet 提出：", CX, 210, 48, lt - 0.1, L["soft"])
    for k, (age, frac, lab) in enumerate(((20, 1 / 20, "1/20"), (60, 1 / 60, "1/60"))):
        t0 = 0.2 + k * BAR * 0.5
        cx = 620 + k * 680
        uu = u_(lt, t0, 0.8)
        if uu <= 0:
            continue
        pie(c, cx, 540, 190, frac, uu, L, ("pie", k))
        draw_text(c, f"{age} 岁", cx, 300, font(56, "kai", True), paint(L["ink"], u_(lt, t0, 0.3)))
        rich_line(c, [("一年 = 人生的 ", L["ink"]), (lab, L["a1"])], cx, 820, 50, a=u_(lt, t0 + 0.4, 0.3),
                  glow=0, kind="kai")


@shot(B(20), B(24), tin=0.3, tout=0.01, kin="fade", kout="cut")
def race(c, x, t, lt):
    L = x.look
    st = slow(t)
    q = st - B(20)
    hours = 18 + 0.03 * (math.exp(0.5 * q) - 1)
    # pages flung off the calendar on every tick
    tk = S.ev["tick"]
    for i in range(len(tk)):
        te = tk[i]
        if te < B(20) or te >= TS or te > st:
            continue
        age = st - te
        if age > 1.6:
            continue
        ang = rnd("pg", i) * 2 * math.pi
        sp = 520 + 420 * rnd("ps", i)
        px = CX + math.cos(ang) * sp * age * 1.3
        py = 700 + math.sin(ang) * sp * age * 0.8 + 240 * age * age
        c.save()
        c.translate(px, py)
        c.rotate((rnd("pr", i) - 0.5) * 540 * age)
        a = 1 - smooth((age - 1.0) / 0.6)
        c.drawRect(skia.Rect.MakeXYWH(-46 + 3, -58 + 7, 92, 116), paint(SHADOW, 0.2 * a, blur=6))
        c.drawRect(skia.Rect.MakeXYWH(-46, -58, 92, 116), paint((0.99, 0.97, 0.92), a))
        c.drawRect(skia.Rect.MakeXYWH(-46, -58, 92, 18), paint((0.55, 0.12, 0.10), a))
        draw_text(c, str(i % 31 + 1), 0, 30, font(50, "Inter-Bold"), paint(CAL_RED if i % 7 == 0 else
                                                                        (0.16, 0.13, 0.12), a))
        c.restore()
    clock(c, CX, 700, 230 + 25 * smooth(q / 10), hours, L, sec=(hours * 3600) % 60)
    for k, (ox, oy, r) in enumerate(((-640, -160, 120), (640, -120, 140), (-520, 260, 90), (560, 270, 100))):
        if q > 4 + k * 1.2:
            clock(c, CX + ox, 600 + oy, r, hours * (1.3 + 0.4 * k) + k, L, numbers=False,
                  a=u_(st, B(20) + 4 + k * 1.2, 0.3))
    cap(c, "听起来，很有道理。", CX, 280, 84, lt - 0.2, L["ink"], bold=True, exit_t=B(2) - 0.5)
    if lt >= B(2):
        text_stamp(c, "但是——", CX, 330, font(190, "kai", True), u_(lt, B(2), 0.16), L["a1"])
        x.shake += 10 * math.exp(-(lt - B(2)) / 0.15)
    x.zoom = 1 + 0.035 * smooth(q / 10.5)
    if t >= TS:
        x.mono = smooth((t - TS) / TD)


# ================================================================ drop 1 (lamp night): the finding
@shot(B(24), B(26), tin=0.01, tout=0.35, kin="cut", kout="slide")
def age_small(c, x, t, lt):
    L = x.look
    u1, u2 = u_(lt, 0, 0.16), u_(lt, BEAT * 2, 0.16)
    text_stamp(c, "年龄的影响，", CX, 420, font(120, "kai", True), u1, L["ink"])
    w = text_stamp(c, "其实很小。", CX, 610, font(150, "kai", True), u2, L["a2"])
    x.shake += 9 * (math.exp(-lt / 0.12) + (math.exp(-(lt - BEAT * 2) / 0.12) if lt > BEAT * 2 else 0))
    if w:
        f = font(150, "kai", True)
        x0 = CX - w / 2 + f.measureText("其实")
        hand_circle(c, x0 + f.measureText("很小") / 2, 560, 180, 100, u_(lt, BAR, 0.6), L["a1"], w=6, t=t,
                    seed="small")
    src(c, "Friedman & Janssen，2010 · 1766 位荷兰成年人（16–80 岁）", CX, 860, L["soft"], a=u_(lt, BAR + 0.3, 0.4))


@shot(B(26), B(28), tin=0.35, tout=0.35, kin="slide", kout="slide")
def waffle(c, x, t, lt):
    L = x.look
    cell, gap = 44, 10
    x0, y0 = 230, 270
    n = int(79 * ease_out(u_(lt, 0.15, 1.3), 2))
    for k in range(100):
        i, j = k % 10, k // 10
        uu = u_(lt, k * 0.006, 0.2)
        if uu <= 0:
            continue
        r = rrect(x0 + i * (cell + gap), y0 + (9 - j) * (cell + gap), cell, cell, 8)
        if k < n:
            c.drawRRect(r, paint(L["a2"], uu * 0.95))
        else:
            c.drawRRect(r, paint(L["soft"], uu * 0.55, stroke=2.5))
    text_roll(c, "78.7%", 1270, 500, font(180, "Inter-Bold"), u_(lt, 0.15, 1.3), col=L["a2"])
    cap(c, "的回答是：时间过得「快」或「很快」", 1270, 610, 46, lt - 0.9, L["ink"])
    stamp(c, "不分年龄", 1290, 790, 66, u_(lt, BEAT * 3, 0.16), col=L["a1"], rot=-7, seed=1, paper=L["paper"])
    if lt > BEAT * 3.16:
        x.shake += 7 * math.exp(-(lt - BEAT * 3.16) / 0.12)


@shot(B(28), B(30), tin=0.35, tout=0.35, kin="slide", kout="fade")
def bars(c, x, t, lt):
    L = x.look
    cap(c, "谁更能解释「时间过得快」？", CX, 220, 62, lt - 0.1, L["ink"], bold=True)
    full = 1050
    rows = (("年龄", 1.4, L["soft"], BEAT * 1.0), ("忙（时间压力）", 10.0, L["a2"], BEAT * 2.5))
    for k, (lab, v, col, t0) in enumerate(rows):
        y = 430 + k * 210
        uu = ease_out(u_(lt, t0, 0.9 if k else 0.4), 3)
        draw_text(c, lab, 600, y + 18, font(52, "kai", True), paint(L["ink"], u_(lt, t0 - 0.4, 0.3)), align="right")
        bw = full * v / 10 * uu
        if bw > 0:
            c.drawRRect(rrect(640, y - 45, bw, 90, 10), paint(col, 0.9))
            hand_box(c, 640, y - 45, bw, 90, 1, L["ink"], 0.5, w=3, t=t, seed=("bar", k))
            draw_text(c, f"{v * uu:.1f}%", 640 + bw + 30, y + 22, font(64, "Inter-Bold"), paint(col), align="left")
    src(c, "能解释的「时间流速感」差异 · Friedman & Janssen，2010", CX, 900, L["soft"], a=u_(lt, BAR, 0.4))


@shot(B(30), B(32), tin=0.35, tout=0.01, kin="fade", kout="cut")
def seven(c, x, t, lt):
    L = x.look
    cap(c, "比年龄的影响，强", CX, 300, 64, lt - 0.05, L["ink"])
    u = u_(lt, BEAT * 1.0, 0.16)
    text_stamp(c, "7 倍多", CX, 520, font(180, "kai", True), u, L["a2"])
    if u >= 1:
        x.shake += 8 * math.exp(-(lt - BEAT - 0.16) / 0.12)
    parts = [("真正让时间变快的，是「", L["ink"]), ("太忙", L["a1"]), ("」", L["ink"])]
    a = u_(lt, BAR, 0.4)
    rich_line(c, parts, CX, 760, 74, a=a, glow=0, kind="kai", bold=True)
    f = font(74, "kai", True)
    total = sum(f.measureText(p[0]) for p in parts)
    xb = CX - total / 2 + f.measureText(parts[0][0]) + f.measureText("太忙") / 2
    hand_circle(c, xb, 735, 105, 62, u_(lt, BAR + BEAT * 1.3, 0.5), L["a1"], w=6, t=t, seed="busy")


# ================================================================ evidence (deep night)
def postage(c, cx, cy, u, rot, country, year, n, ages, who, L, seed):
    if u <= 0:
        return
    w, h = 380, 470
    sc = lerp(1.25, 1.0, back_out(u, 2.0))
    pmx, pmy = w * 0.33, -h * 0.41
    c.save()
    c.translate(cx, cy)
    c.rotate(rot)
    c.scale(sc, sc)
    c.saveLayer(None, skia.Paint(Alphaf=clamp(u * 3)))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2 + 5, -h / 2 + 10, w, h), paint(SHADOW, 0.35, blur=12))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h), paint((0.97, 0.94, 0.86)))
    for k in range(int(w / 26) + 1):  # perforations
        for yy in (-h / 2, h / 2):
            c.drawCircle(-w / 2 + k * 26, yy, 8, paint(WHITE, 1, blend=skia.BlendMode.kDstOut))
    for k in range(int(h / 26) + 1):
        for xx in (-w / 2, w / 2):
            c.drawCircle(xx, -h / 2 + k * 26, 8, paint(WHITE, 1, blend=skia.BlendMode.kDstOut))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2 + 24, -h / 2 + 24, w - 48, h - 48), paint(L["a1"], 0.7, stroke=3))
    ink = (0.18, 0.15, 0.16)
    draw_text(c, country, 0, -112, font(46 if len(country) > 3 else 52, "kai", True), paint(ink))
    draw_text(c, year, 0, -60, font(38, "Inter-SemiBold"), paint(L["a1"]))
    f1, f2 = font(110, "Inter-Bold"), font(46, "kai", True)
    tw = f1.measureText(n) + 12 + f2.measureText("人")
    draw_text(c, n, -tw / 2, 70, f1, paint(ink), align="left")
    draw_text(c, "人", -tw / 2 + f1.measureText(n) + 12, 70, f2, paint(ink), align="left")
    draw_text(c, ages, 0, 140, font(40, "kai"), paint(ink, 0.8))
    draw_text(c, who, 0, 195, font(22, "Inter-Medium"), paint(ink, 0.6))
    c.drawCircle(pmx, pmy, 34, paint(ink, 0.25, stroke=3))
    for k in range(3):
        hand_line(c, pmx - 90, pmy - 14 + k * 14, pmx + 40, pmy - 14 + k * 14, 1, ink, 0.18, 2.5, seed=(seed, k), sag=4)
    c.restore()
    c.restore()


STAMPS = [("德国 · 奥地利", "2005", "499", "14–94 岁", "Wittmann & Lehnhoff"),
          ("荷兰", "2010", "1766", "16–80 岁", "Friedman & Janssen"),
          ("日本", "2013", "868", "16–80 岁", "Janssen, Naka & Friedman")]


@shot(B(32), B(35), tin=0.35, tout=0.35, kin="slide", kout="slide")
def countries(c, x, t, lt):
    L = x.look
    cap(c, "换个国家，再问一遍", CX, 190, 64, lt - 0.1, L["ink"], bold=True)
    for k, st in enumerate(STAMPS):
        postage(c, 480 + k * 480, 570, u_(lt, BEAT * (1.5 + k * 1.5), 0.3), (-3, 2, -2)[k], *st, L, ("pm", k))
    stamp(c, "结论一样", CX, 905, 60, u_(lt, BAR * 2 + BEAT * 0.5, 0.16), col=L["a1"], rot=-5, seed=4,
          paper=L["paper"])


@shot(B(35), B(37), tin=0.35, tout=0.35, kin="slide", kout="fade")
def short_spans(c, x, t, lt):
    L = x.look
    cap(c, "「过去一周、一个月、一年，过得多快？」", CX, 230, 56, lt - 0.1, L["ink"], bold=True)
    for k, lab in enumerate(("一周", "一个月", "一年")):
        y = 400 + k * 140
        uu = u_(lt, BEAT * (0.8 + k * 0.5), 0.4)
        draw_text(c, lab, 560, y + 16, font(50, "kai", True), paint(L["ink"], uu), align="right")
        c.drawRRect(rrect(600, y - 32, 1000, 64, 12), paint(L["ink"], 0.12 * uu))
        hand_box(c, 600, y - 32, 1000, 64, uu, L["soft"], 0.6, w=2.5, t=t, seed=("sb", k))
        if uu > 0:
            c.drawRRect(rrect(600, y - 32, 14 * ease_out(uu), 64, 6), paint(L["a2"]))
    cap(c, "年龄能解释的差异：1% 左右，甚至更少", CX, 860, 60, lt - BAR, L["a2"], bold=True)
    src(c, "整条 = 全部差异 · Wittmann & Lehnhoff，2005", CX, 930, L["soft"], a=u_(lt, BAR + 0.4, 0.4))


@shot(B(37), B(40), tin=0.35, tout=0.45, kin="fade", kout="slide")
def decade(c, x, t, lt):
    L = x.look
    cap(c, "只有一题例外：", CX, 190, 52, lt - 0.1, L["soft"])
    cap(c, "「过去十年，过得多快？」", CX, 300, 82, lt - BEAT * 0.8, L["ink"], bold=True)
    cap(c, "年纪越大，越觉得十年一晃而过", CX, 395, 48, lt - BEAT * 2, L["soft"])
    u1, u2 = u_(lt, BAR + BEAT, 0.25), u_(lt, BAR + BEAT * 2, 0.25)
    for k, (uu, col, line1, line2, cx_) in enumerate(((u1, NOTE_COLS[0], "现在：", "好忙", 720),
                                                       (u2, NOTE_COLS[3], "十年前：", "好像还好？", 1200))):
        if uu <= 0:
            continue
        with sticky(c, cx_, 640, 290, rot=(-4, 3)[k], col=col, a=clamp(uu * 3), scale=lerp(1.25, 1, back_out(uu))):
            draw_text(c, line1, 0, -30, font(40, "kai"), paint((0.25, 0.2, 0.2)))
            draw_text(c, line2, 0, 50, font(52, "kai", True), paint((0.2, 0.16, 0.16)))
    w = width("好像还好？", 52, True)
    hand_line(c, 1200 - w / 2 - 10, 676, 1200 + w / 2 + 10, 668, u_(lt, BAR * 2 + 0.1, 0.35), L["a1"], w=7, t=t,
              seed="strike")
    cap(c, "我们总会低估：十年前的自己，其实也很忙", CX, 880, 50, lt - BAR * 2 - 0.3, L["a2"], bold=True)
    src(c, "Janssen, Naka & Friedman，2013", CX, 945, L["soft"], a=u_(lt, BAR * 2 + 0.6, 0.4))


# ================================================================ mechanism (indigo)
@shot(B(40), B(42), tin=0.4, tout=0.35, kin="slide", kout="slide")
def why(c, x, t, lt):
    L = x.look
    cap(c, "为什么「忙」，会让时间变快？", CX, 280, 76, lt - 0.1, L["ink"], bold=True)
    cap(c, "① 忙的时候，顾不上看时间", CX, 450, 58, lt - BAR, L["a2"])
    a = u_(lt, BAR * 0.5, 0.5) * (1 - 0.65 * u_(lt, BAR + 0.5, 1.5))
    clock(c, CX, 760, 150, 10 + lt * 0.9, L, sec=(lt * 30) % 60, a=a)


def bead_pos(k):
    i, j = k % 25, k // 25
    return 585 + i * 31, 330 + j * 31


SPECIAL = {12: "生日", 47: "", 88: "旅行", 131: "", 160: "", 199: "搬家", 230: "", 266: "", 301: "", 340: ""}


@shot(B(42), B(45), tin=0.35, tout=0.35, kin="slide", kout="slide")
def beads(c, x, t, lt):
    L = x.look
    cap(c, "② 回头看，日子都一个样", CX, 190, 62, lt - 0.1, L["a2"])
    m = ease_io(u_(lt, BAR + BEAT, 1.4))     # routine days merge into one
    hx, hy = 420, 560
    grey = mixc(L["soft"], L["paper"], 0.3)
    for k in range(365):
        uu = u_(lt, 0.3 + k * 0.0025, 0.2)
        if uu <= 0:
            continue
        px, py = bead_pos(k)
        if k in SPECIAL:
            glow = 0.5 + 0.5 * math.sin(t * 3 + k)
            c.drawCircle(px, py, 13 + 6 * m, paint(L["a1"] if k % 2 else L["a2"], 0.3 * m * glow, blur=10))
            c.drawCircle(px, py, 11 + 3 * m, paint(L["a1"] if k % 2 else L["a2"], uu))
            if SPECIAL[k] and m > 0.5:
                draw_text(c, SPECIAL[k], px, py - 26, font(30, "kai"), paint(L["ink"], u_(m, 0.5, 0.4)))
        else:
            qx, qy = lerp(px, hx, m), lerp(py, hy, m)
            c.drawCircle(qx, qy, 10, paint(grey, uu * (1 - 0.9 * u_(m, 0.85, 0.15))))
    if m > 0.85:
        r = 10 + 18 * ease_out(u_(m, 0.85, 0.15))
        c.drawCircle(hx, hy, r, paint(grey))
        draw_text(c, "其余 355 天", hx, hy + r + 44, font(32, "kai"), paint(L["soft"], u_(m, 0.95, 0.05)))
    cap(c, "一样的日子，在记忆里只占一格", CX, 900, 64, lt - BAR * 2, L["ink"], bold=True)
    src(c, "重复的日常，回想起来会显得更短 · Avni-Babad & Ritov，2003", CX, 965, L["soft"],
        a=u_(lt, BAR * 2 + 0.5, 0.4))


THUMBS = ["doc", "qr", "chat", "sheet", "receipt", "doc", "chat", "qr", "doc", "sheet", "receipt", "chat",
          "doc", "qr", "sheet", "doc", "chat", "receipt", "doc", "sheet", "qr"]


def thumb(c, kind, x0, y0, s):
    c.drawRect(skia.Rect.MakeXYWH(x0, y0, s, s), paint((0.86, 0.87, 0.9)))
    ink = (0.45, 0.47, 0.55)
    if kind == "doc":
        for k in range(5):
            c.drawRect(skia.Rect.MakeXYWH(x0 + 12, y0 + 14 + k * 17, s * (0.4 + 0.4 * rnd(x0, y0, k)), 6), paint(ink))
    elif kind == "qr":
        for i in range(5):
            for j in range(5):
                if rnd("qr", x0, y0, i, j) < 0.5 or (i in (0, 4) and j in (0, 4)):
                    c.drawRect(skia.Rect.MakeXYWH(x0 + 14 + i * 16, y0 + 14 + j * 16, 14, 14), paint(ink))
    elif kind == "chat":
        for k in range(3):
            w = s * (0.35 + 0.3 * rnd("ct", x0, y0, k))
            xx = x0 + 10 if k % 2 == 0 else x0 + s - 10 - w
            c.drawRRect(rrect(xx, y0 + 12 + k * 30, w, 22, 10), paint((0.6, 0.8, 0.65) if k % 2 else ink))
    elif kind == "sheet":
        for i in range(4):
            c.drawLine(x0 + 10 + i * 25, y0 + 10, x0 + 10 + i * 25, y0 + s - 10, paint(ink, stroke=2))
        for j in range(5):
            c.drawLine(x0 + 10, y0 + 10 + j * 22, x0 + s - 10, y0 + 10 + j * 22, paint(ink, stroke=2))
    else:
        c.drawRect(skia.Rect.MakeXYWH(x0 + 25, y0 + 8, s - 50, s - 16), paint((0.97, 0.97, 0.95)))
        for k in range(4):
            c.drawRect(skia.Rect.MakeXYWH(x0 + 34, y0 + 22 + k * 18, s - 70, 5), paint(ink))


@shot(B(45), B(48), tin=0.35, tout=0.01, kin="slide", kout="cut")
def album(c, x, t, lt):
    L = x.look
    with phone(c, 560, 560, 400, 820, rot=-3, a=u_(lt, 0, 0.3)) as (sw, sh_):
        draw_text(c, "相册", 26, 70, font(38, "kai", True), paint((0.15, 0.15, 0.18)), align="left")
        draw_text(c, "2026", sw - 26, 70, font(26, "Inter-Medium"), paint((0.4, 0.4, 0.45)), align="right")
        s = (sw - 40) / 3
        off = (lt * 18) % (s + 6)
        for k, kind in enumerate(THUMBS):
            i, j = k % 3, k // 3
            thumb(c, kind, 14 + i * (s + 6), 100 + j * (s + 6) - off, s)
    cap(c, "相册里，只剩截图和工作文件", 1300, 300, 56, lt - BEAT * 0.8, L["ink"], bold=True)
    uu = u_(lt, BAR - 0.2, 0.35)
    with card(c, 1300, 600, 640, 380, rot=1.5, fill=(0.97, 0.95, 0.9), a=uu, scale=lerp(1.06, 1, ease_out(uu))):
        ink = (0.2, 0.18, 0.2)
        draw_text(c, "2026 年终总结", -270, -110, font(48, "kai", True), paint(ink), align="left")
        for k in range(3):
            yy = -10 + k * 80
            draw_text(c, f"{k + 1}.", -270, yy, font(40, "Inter-Medium"), paint(ink, 0.8), align="left")
            c.drawLine(-220, yy + 10, 270, yy + 10, paint(ink, 0.25, stroke=2))
        if math.sin(t * 2 * math.pi * 1.2) > 0:
            c.drawRect(skia.Rect.MakeXYWH(-215, -48, 5, 52), paint(L["a1"]))
    cap(c, "年终总结，写不出三行", 1300, 860, 52, lt - BAR - BEAT * 1.5, L["a2"], bold=True)
    cap(c, "明明忙了一整天，回头却想不起做了什么", 1300, 945, 40, lt - BAR * 2, L["soft"])
    x.zoom = 1 + 0.03 * smooth(u_(lt, BAR + BEAT * 3, BAR + BEAT * 2))


# ================================================================ drop 2 (home lights)
BUILDINGS = [(80, 520, 7, 10), (640, 600, 6, 9), (1130, 470, 8, 11), (1650, 640, 4, 8)]


@shot(B(48), B(50), tin=0.01, tout=0.35, kin="cut", kout="slide")
def city(c, x, t, lt):
    L = x.look
    nk = S.count("kick", B(48), t)
    frac = clamp(nk / 9) * 0.92 + 0.05
    for b, (bx, by, cols, rows) in enumerate(BUILDINGS):
        windows(c, bx, by, cols, rows, 44, 34, 16, lambda i, j, b=b: smooth((frac - rnd("win", b, i, j)) * 6) *
                (0.6 + 0.4 * rnd("wb", b, i, j)), L, seed=b)
    cap(c, "2025 年，全国企业就业人员", CX, 170, 52, lt - 0.1, L["ink"])
    f1, f2 = font(64, "kai", True), font(150, "Inter-Bold")
    pre, num, post_ = "平均每周工作 ", "48.6", " 小时"
    tw = f1.measureText(pre) + f2.measureText(num) + f1.measureText(post_)
    x0 = CX - tw / 2
    a = u_(lt, BEAT * 0.5, 0.3)
    draw_text(c, pre, x0, 345, f1, paint(L["ink"], a), align="left")
    text_roll(c, num, x0 + f1.measureText(pre), 350, f2, u_(lt, BEAT * 0.5, 1.2), col=L["a2"], a=a, align="left")
    draw_text(c, post_, x0 + f1.measureText(pre) + f2.measureText(num), 345, f1, paint(L["ink"], a), align="left")
    src(c, "国家统计局 · 2025 年数据", CX, 425, L["soft"], a=u_(lt, BAR, 0.4))


@shot(B(50), B(52), tin=0.35, tout=0.35, kin="slide", kout="slide")
def year_end(c, x, t, lt):
    L = x.look
    cap(c, "年底，什么都在赶", CX, 220, 76, lt - 0.05, L["ink"], bold=True)
    notes = [("冲 KPI", None), ("写年终总结", None), ("抢回家的票", None), ("体检报告", "还没看")]
    for k, (l1, l2) in enumerate(notes):
        t0 = BEAT * (1 + 2 * k)
        uu = u_(lt, t0, 0.14)
        if uu <= 0:
            continue
        if uu < 1:
            x.shake += 4
        with sticky(c, 360 + k * 400, 600, 330, rot=(-5, 3, -2, 4)[k], col=NOTE_COLS[k % 4], a=clamp(uu * 3),
                    scale=lerp(1.35, 1, ease_in(uu, 2))):
            ink = (0.2, 0.16, 0.16)
            if l2:
                draw_text(c, l1, 0, -10, font(50, "kai", True), paint(ink))
                draw_text(c, l2, 0, 60, font(50, "kai", True), paint(ink))
            else:
                draw_text(c, l1, 0, 22, font(52, "kai", True), paint(ink))


CHAT = [(B(0, 0.5), "l", "吃饭了吗？"), (B(0, 2), "l", "天冷了，多穿点"), (B(1, 0), "r", "在忙，晚点说"),
        (B(1, 2), "l", "没事，你忙你的")]


@shot(B(52), B(54), tin=0.35, tout=0.35, kin="slide", kout="fade")
def parents(c, x, t, lt):
    L = x.look
    with phone(c, 640, 560, 440, 860, rot=-3, screen=(0.96, 0.94, 0.9)) as (sw, sh_):
        draw_text(c, "妈妈", sw / 2, 80, font(40, "kai", True), paint((0.15, 0.13, 0.13)))
        c.drawLine(0, 110, sw, 110, paint((0.7, 0.66, 0.62), stroke=1.5))
        y = 190
        for t0, side, s in CHAT:
            uu = u_(lt, t0, 0.25)
            if uu <= 0:
                continue
            f = font(32, "kai")
            bw = f.measureText(s) + 48
            bx = 22 if side == "l" else sw - 22 - bw
            sc = back_out(uu, 2.0)
            c.save()
            c.translate(bx + (0 if side == "l" else bw), y)
            c.scale(sc, sc)
            c.translate(-(0 if side == "l" else bw), 0)
            fill = (1.0, 1.0, 1.0) if side == "l" else (0.98, 0.8, 0.55)
            c.drawRRect(rrect(0, -34, bw, 68, 22), paint(SHADOW, 0.15, blur=6))
            c.drawRRect(rrect(0, -36, bw, 68, 22), paint(fill))
            draw_text(c, s, 24, 10, f, paint((0.15, 0.13, 0.13)), align="left")
            c.restore()
            y += 110
    cap(c, "电话里，", 1390, 430, 58, lt - BEAT * 0.5, L["soft"])
    cap(c, "爸妈总说「你忙你的」", 1390, 560, 66, lt - BEAT * 1.5, L["ink"], bold=True)
    cap(c, "我们总说「下次吧」", 1390, 680, 66, lt - BAR - BEAT * 1.2, L["a2"], bold=True)


@shot(B(54), B(55), tin=0.3, tout=0.25, kin="fade", kout="fade")
def not_old(c, x, t, lt):
    L = x.look
    cap(c, "不是你老了，", CX, 440, 96, lt - 0.05, L["ink"], bold=True)
    cap(c, "是你太累了。", CX, 610, 112, lt - BEAT * 1.5, L["a2"], bold=True)


@shot(B(55), B(56), tin=0.25, tout=0.01, kin="fade", kout="cut")
def too_full(c, x, t, lt):
    L = x.look
    cap(c, "时间没有变快，", CX, 440, 84, lt - 0.05, L["ink"], bold=True)
    cap(c, "是日子被塞得太满了。", CX, 610, 100, lt - BEAT * 1.4, L["a2"], bold=True)


# ================================================================ advice (morning)
@shot(B(56), B(57), tin=0.01, tout=0.35, kin="cut", kout="slide")
def advice_title(c, x, t, lt):
    L = x.look
    cap(c, "让时间慢下来的", CX, 410, 64, lt - 0.05, L["soft"])
    w = width("三件小事", 128, True)
    hand_marker(c, CX - w / 2, CX + w / 2, 545, 70, u_(lt, BEAT * 1.2, 0.5), L["a2"], 0.35, t=t, seed="mk",
                blend=MULTIPLY)
    cap(c, "三件小事", CX, 590, 128, lt - BEAT * 0.6, L["ink"], bold=True)


TIPS = [("1", ["给日子做点", "「不一样」"], ["换条路下班", "去个没去过的地方"]),
        ("2", ["给自己留白"], ["每周留半天", "什么都不安排"]),
        ("3", ["把它记下来"], ["每天写一句话", "或者拍一张照片"])]


@shot(B(57), B(62), tin=0.35, tout=0.45, kin="slide", kout="fade")
def advice(c, x, t, lt):
    L = x.look
    for k, (num, title, sub) in enumerate(TIPS):
        t0 = (0.05, BAR + BEAT * 2, BAR * 3)[k]
        uu = u_(lt, t0, 0.16)
        if uu <= 0:
            continue
        if uu < 1:
            x.shake += 3
        with sticky(c, 410 + k * 550, 520, 440, rot=(-3, 2, -2)[k], col=NOTE_COLS[(k + 1) % 4], a=clamp(uu * 3),
                    scale=lerp(1.3, 1, ease_in(uu, 2))):
            ink = (0.2, 0.16, 0.16)
            draw_text(c, num, -170, -130, font(64, "Inter-Bold"), paint(L["a1"]), align="left")
            for j, s in enumerate(title):
                draw_text(c, s, 0, -40 + j * 66 - (len(title) - 1) * 10, font(54, "kai", True), paint(ink))
            for j, s in enumerate(sub):
                draw_text(c, s, 0, 105 + j * 46, font(34, "kai"), paint(ink, 0.75))
            hand_check(c, 150, -150, 70, u_(lt, t0 + BEAT, 0.25), L["a1"], w=7, t=t, seed=("tip", k))
    cap(c, "新鲜的事，会变成记忆里的路标", CX, 900, 56, lt - BAR * 4, L["ink"], bold=True)


# ================================================================ outro (new year)
@shot(B(62), B(64), tin=0.45, tout=0.5, kin="fade", kout="fade")
def outro_calendar(c, x, t, lt):
    L = x.look
    flips = [B(62, 2)]
    n = 1 if t >= flips[0] else 0
    if n:
        calendar_page(c, 1330, 575, 1.18, "2027 · 一月", 1, "星期五", ("慢慢来", "匆匆"), L, red=True)
    if not n or t < flips[0] + TEAR * 1.4:
        calendar_page(c, 1330, 575, 1.18, "2026 · 十二月", 31, "星期四", ("回家", "内耗"), L,
                      tear=(t - flips[0]) / (TEAR * 1.4) if n else 0.0)
    if n and t < flips[0] + 0.6:
        x.flash += 0.25 * (1 - (t - flips[0]) / 0.6)
    sec = max(0, S.index("tick", t) - S.index("tick", B(62) - 0.01))  # 00:00:00 and running down
    cap(c, "愿你明年的日子，", 170, 380, 62, lt - BEAT * 2.8, L["soft"], align="left")
    cap(c, "不只是被过完，", 170, 520, 84, lt - BAR, L["ink"], bold=True, align="left")
    w = cap(c, "而是被记住。", 170, 650, 84, lt - BAR - BEAT * 1.5, L["a1"], bold=True, align="left")
    hand_underline(c, 175, 175 + w, 684, u_(lt, BAR + BEAT * 2.6, 0.7), L["a1"], t=t, seed="u2")
    clock(c, 1745, 175, 95, sec / 3600, L, sec=sec, numbers=False)


REFS = [
    "Friedman, W. J., & Janssen, S. M. J. (2010). Aging and the speed of time. Acta Psychologica, 134(2), 130–141.",
    "Wittmann, M., & Lehnhoff, S. (2005). Age effects in perception of time. Psychological Reports, 97(3), 921–935.",
    "Janssen, S. M. J., Naka, M., & Friedman, W. J. (2013). Why does life appear to speed up as people get older?",
    "      Time & Society, 22(2), 274–290.",
    "Avni-Babad, D., & Ritov, I. (2003). Routine and the perception of time. J. Exp. Psychol.: General, 132(4), 543–550.",
]


@shot(B(64), DUR, tin=0.6, tout=0.01, kin="fade", kout="cut")
def refs(c, x, t, lt):
    L = x.look
    a = u_(lt, 0, 0.6)
    draw_text(c, "长大后，时间越过越快？", CX, 250, font(64, "kai", True), paint(L["ink"], a))
    draw_text(c, "可能不是年龄的锅", CX, 335, font(44, "kai"), paint(L["a1"], a))
    f = font(25, "Inter-Regular")
    for k, s in enumerate(REFS):
        draw_text(c, s, 250, 470 + k * 50, f, paint(L["soft"], a), align="left")
    draw_text(c, "国家统计局（2026）. 2025 年经济发展向新向优 预期目标圆满实现（企业就业人员周平均工作时间）.", 250,
              470 + len(REFS) * 50, font(25, "kai"), paint(L["soft"], a), align="left")
    draw_text(c, "片中的生活场景均为示例。", CX, 860, font(30, "kai"), paint(L["soft"], a * 0.9))


LOOKS = {"intro": PALETTES["dawn"], "verse": PALETTES["office"], "memory": PALETTES["sepia"],
         "build": PALETTES["dusk"], "drop1": PALETTES["lamp"], "evidence": PALETTES["deep_night"],
         "mechanism": PALETTES["indigo"], "drop2": PALETTES["home_lights"], "advice": PALETTES["morning"],
         "outro": PALETTES["new_year"]}
style = WarmJournal(tl, S, LOOKS, fast=("drop1", "drop2", "advice"))

if __name__ == "__main__":
    run(style.frame, style.setup, DUR, FPS, OUT, "长大后时间越过越快_TimeFlies.mp4")
