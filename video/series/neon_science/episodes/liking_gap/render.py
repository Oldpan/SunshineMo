"""Renderer for "好感差距 / The Liking Gap" (neon_science, episode 1).

Scenes only; the look comes from ../../style.py and the plumbing from video/core.

  python3 render.py --still 12.5 60.2        # PNG stills into out/stills/
  python3 render.py --range 56 64 [--fps 30] # quick preview clip
  python3 render.py                          # full 1920x1080 @ 60 fps with soundtrack
"""
import math
import os
import sys

import numpy as np
import skia

HERE = os.path.dirname(os.path.abspath(__file__))


def _up(marker):
    """Nearest ancestor directory containing `marker` (works from template/ or episodes/<name>/)."""
    d = HERE
    while not os.path.exists(os.path.join(d, marker)):
        d = os.path.dirname(d)
    return d


sys.path[:0] = [_up("core"), _up("style.py")]  # video/ (core) and the series (style)
from core.gfx import *  # noqa: E402,F401,F403
from core.timeline import Timeline, Sync  # noqa: E402
from core.pipeline import run  # noqa: E402
from style import NeonNebula, PALETTES, flare  # noqa: E402

OUT = os.path.join(HERE, "out")
SECTIONS = [("intro", 0, 8), ("verse", 8, 16), ("build1", 16, 24), ("drop1", 24, 32),
            ("breakdown", 32, 40), ("build2", 40, 48), ("drop2", 48, 56), ("post", 56, 64),
            ("outro", 64, 74)]
tl = Timeline(bpm=100, bars=74, sections=SECTIONS)
B, shot, section_at = tl.B, tl.shot, tl.section_at
FPS, BEAT, BAR, DUR = tl.fps, tl.beat, tl.bar, tl.dur
S = Sync(os.path.join(OUT, "sync.npz"))


def kick(t, d=0.12):
    return S.pulse("kick", t, d)


# --------------------------------------------------------------- INTRO (bars 0–8)
@shot(0, B(2), tin=0.01, tout=0.6, kin="cut", kout="fade")
def intro_typing(c, x, t, lt):
    a = smooth(lt / 2.5)
    typing_dots(c, CX - 112, CY + 10, t, a, scale=1.5)
    text_pixel(c, "23:47", CX, 170, 32, GREY, a * 0.8, align="center")
    text_pixel(c, "对方正在输入…", CX, CY + 130, 32, CYAN, a * 0.7 * (0.7 + 0.3 * math.sin(t * 3)),
               align="center")


@shot(B(2), B(4), tin=0.6, tout=0.6, kin="fade", kout="zoom")
def intro_line1(c, x, t, lt):
    f = font(70)
    text_type(c, "聊完天，回家的路上——", CX, CY + 24, f, lt - 0.1, cps=6.5, align="center")


@shot(B(4), B(6), tin=0.5, tout=0.6, kin="zoom", kout="zoom")
def intro_line2(c, x, t, lt):
    f = font(64)
    text_type(c, "你是不是又在脑子里，", CX, CY - 30, f, lt, cps=8, align="center",
              cursor=lt < 1.25)
    text_type(c, "把刚才的对话，重播了一遍？", CX, CY + 70, f, lt - 1.4, cps=8, align="center")


@shot(B(6), B(8), tin=0.6, tout=0.45, kin="zoom", kout="zoom")
def intro_title(c, x, t, lt):
    text_rise(c, "你以为聊天冷场了？", CX, CY - 170, font(50), lt, col=(0.85, 0.88, 1.0), tint=CYAN)
    fill = ease_io((lt - 0.7) / 3.0)
    text_stroke_fill(c, "好感差距", CX, CY + 70, font(210, bold=True), fill, glow_col=PINK, sw=2.2)
    sub = smooth((lt - 2.2) / 1.2)
    f = font(40, "Inter-Light")
    lay, total = char_layout("THE LIKING GAP", f, 22)
    x0 = CX - total / 2
    for ch, dx, w in lay:
        c.drawString(ch, x0 + dx, CY + 170, f, paint(WHITE, sub * 0.85))


# --------------------------------------------------------------- VERSE (bars 8–16)
THOUGHTS = ["饭局上那个笑话，是不是很冷？", "我是不是一直在说自己的事……",
            "TA 中途看了两次手机。", "TA 回我「哈哈」，是不是在敷衍？"]


@shot(B(8), B(12), tin=0.5, tout=0.5, kin="zoom", kout="fade")
def verse_bubbles(c, x, t, lt):
    text_pixel(c, "> 内心OS.log", 150, 150, 32, CYAN, smooth(lt / 0.6), t=lt, cps=18)
    size = 52
    n_shown = min(4, int(lt / BAR) + 1)
    y_base = CY + 260
    gap = size * 2.2 + 26
    for i in range(n_shown):
        appear = i * BAR
        u = (lt - appear) / 0.35
        # stack scroll: each newer bubble pushes older ones up
        newer = sum(ease_out((lt - j * BAR) / 0.4) for j in range(i + 1, n_shown))
        y = y_base - newer * gap
        a = 1.0 - 0.18 * newer
        jit = 0
        if i >= 2 and S.since("kick", t) < 0.08:
            jit = (rnd(i, int(t * 60)) - 0.5) * 18
        bubble(c, THOUGHTS[i], CX + 520 + jit, y, size, u, side="right",
               fill=(0.13, 0.55, 0.42) if i < 2 else (0.55, 0.16, 0.24), a=a, glow=0.5)
    x.chroma += 0.6 * kick(t) * (lt > BAR * 2)


SPIRAL = ["好尴尬", "冷场了", "说错话了", "又没话题了", "笑得好假", "TA 肯定觉得我很无聊",
          "是不是太自来熟", "下次别这样了", "我好无趣", "TA 是出于礼貌吧", "完了", "啊啊啊"]


@shot(B(12), B(14), tin=0.4, tout=0.6, kin="fade", kout="zoom")
def verse_spiral(c, x, t, lt):
    for i, s in enumerate(SPIRAL * 2):
        ph = rnd("sp", i) * 2 * math.pi
        rad = 390 + 240 * rnd("r", i) - 12 * lt
        ang = ph + lt * (0.5 + 0.4 * rnd("w", i)) * (1 if i % 2 else -1)
        px = CX + math.cos(ang) * rad * 1.5
        py = CY + math.sin(ang) * rad * 0.75
        u = (lt - rnd("d", i) * 1.2) / 0.3
        if u <= 0:
            continue
        sz = int(24 + 14 * rnd("s", i))
        a = 0.55 * clamp(u) * (0.6 + 0.4 * math.sin(t * 4 + i))
        if abs(px - CX) < 520 and abs(py - CY - 35) < 190:
            a *= 0.2
        bubble(c, s, px, py, sz, u, side="left" if i % 2 else "right",
               fill=(0.5, 0.1, 0.18), a=a, tail=False)
    f = font(92, bold=True)
    amt = 0.4 + 0.6 * kick(t, 0.2)
    if lt > 0.05:
        text_glitch(c, "我们总在心里，", CX, CY - 30, f, t, amt=amt, seed=1)
    if lt > BAR:
        text_glitch(c, "给自己打低分。", CX, CY + 100, f, t, amt=amt, col=(1, 0.75, 0.78), seed=2)
    x.chroma += 1.2 * kick(t)
    x.shake += 3 * kick(t)


@shot(B(14), B(16), tin=0.6, tout=0.5, kin="zoom", kout="zoom")
def verse_question(c, x, t, lt):
    # the noisy cloud collapses into a single point of light
    u = ease_in(lt / 1.4, 2)
    for i in range(80):
        ang = rnd("q", i) * 2 * math.pi + lt * 0.8
        r = (200 + 500 * rnd("qr", i)) * (1 - u)
        c.drawCircle(CX + math.cos(ang) * r * 1.4, CY + math.sin(ang) * r * 0.7, 3 + 3 * rnd("qs", i),
                     paint(RED if i % 3 else PINK, 0.6 * (1 - u * 0.6), blur=2))
    core = smooth((lt - 1.0) / 0.6) * (1 - smooth((lt - 4.0) / 0.6))
    c.drawCircle(CX, CY - 140, 10 + 6 * math.sin(t * 6), paint(GOLD, core, blur=3))
    c.drawCircle(CX, CY - 140, 40, paint(GOLD, core * 0.6, blur=26))
    text_rise(c, "可如果——", CX, CY + 10, font(60), lt - 0.6, tint=GOLD)
    rich_line(c, [("对方心里的分数，", WHITE), ("和你想的不一样", GOLD), ("呢？", WHITE)], CX, CY + 120, 64,
              a=smooth((lt - BAR) / 0.6))


# --------------------------------------------------------------- BUILD 1 (bars 16–24): the lab
@shot(B(16), B(23, 3), tin=0.6, tout=0.01, kin="zoom", kout="cut")
def lab(c, x, t, lt):
    bt = lt / BAR  # bars into the scene
    # figures
    sep = 420 + 140 * smooth((bt - 4) / 1)
    appear = ease_out(lt / 1.0)
    dimf = 1 - 0.65 * smooth((bt - 6) / 0.5)
    ly = CY + 230
    for side, col in ((-1, CYAN), (1, PINK)):
        c.save()
        c.translate(CX + side * sep, ly + (1 - appear) * 80)
        c.scale(0.9, 0.9)
        person(c, 0, 0, 1.0, col, appear * dimf, face=-side)
        c.restore()
    text_pixel(c, "EXPERIMENT · 2018", 150, 150, 32, CYAN, smooth(lt / 0.6), t=lt, cps=20)
    # captions
    cap_y = 250
    if bt < 2.05:
        text_rise(c, "2018 年，心理学家 Boothby 等人", CX, cap_y, font(56), lt, exit_t=BAR * 2 - 0.4)
        text_rise(c, "做了一个很简单的实验。", CX, cap_y + 84, font(56), lt - 0.6, exit_t=BAR * 2 - 0.45)
    elif bt < 4.05:
        l2 = lt - 2 * BAR
        rich_line(c, [("两个陌生人，面对面聊 ", WHITE), ("5 分钟", CYAN)], CX, cap_y + 40, 62,
                  a=smooth(l2 / 0.4) * (1 - smooth((l2 - 4.4) / 0.4)))
        # countdown ring
        u = clamp(l2 / (2 * BAR - 0.2))
        ring(c, CX, CY - 40, 100, 1 - u, CYAN, smooth(l2 / 0.4) * (1 - smooth((l2 - 4.4) / 0.4)), w=7)
        secs = int(round(300 * (1 - u)))
        draw_text(c, f"{secs // 60:02d}:{secs % 60:02d}", CX, CY - 20, font(52, "Inter-Medium"),
                  paint(WHITE, smooth(l2 / 0.4) * (1 - smooth((l2 - 4.4) / 0.4))))
        # conversation waves between the two figures
        spk = int(l2 / BEAT) % 2
        amp = 18 + 40 * S.pulse("hat", t, 0.1)
        for k in range(3):
            path = skia.Path()
            x0, x1 = CX - sep + 120, CX + sep - 120
            for j in range(61):
                xx = lerp(x0, x1, j / 60)
                env = math.sin(math.pi * j / 60)
                yy = ly - 120 + env * amp * math.sin(j * 0.45 - t * 9 * (1 if spk else -1) + k)
                path.moveTo(xx, yy) if j == 0 else path.lineTo(xx, yy)
            col = CYAN if spk == 0 else PINK
            c.drawPath(path, paint(col, 0.5 / (k + 1) * smooth(l2 / 0.5), stroke=3))
    elif bt < 6.05:
        l3 = lt - 4 * BAR
        a3 = smooth(l3 / 0.4) * (1 - smooth((l3 - 4.4) / 0.4))
        draw_text(c, "聊完分开，各自打分（1–7 分）：", CX, cap_y, font(56), paint(WHITE, a3))
        # divider wall
        c.drawLine(CX, CY + 110, CX, CY + 400, paint(WHITE, a3 * 0.4, stroke=2))
        rows = [("我有多喜欢 TA？", CYAN, 5.6), ("我觉得 TA 有多喜欢我？", PINK, 4.6)]
        for r, (label, col, val) in enumerate(rows):
            ry = CY - 130 + r * 120
            ar = a3 * smooth((l3 - 0.5 - r * 1.2) / 0.4)
            draw_text(c, label, CX - 80, ry + 16, font(44), paint(WHITE, ar), align="right")
            for k in range(7):
                kx = CX + 10 + k * 70
                c.drawCircle(kx, ry, 12, paint(col, ar * 0.5, stroke=2))
                draw_text(c, str(k + 1), kx, ry + 52, font(24, "Inter-Regular"), paint(GREY, ar * 0.8))
            # wobbling "thinking" handle
            v = val + 0.6 * math.sin(t * 3.1 + r * 2) * (1 - smooth((l3 - 3.0) / 1.0))
            hx = CX + 10 + (v - 1) * 70
            c.drawCircle(hx, ry, 18, paint(col, ar * 0.7, blur=12))
            c.drawCircle(hx, ry, 13, paint(col, ar))
    else:
        l4 = lt - 6 * BAR
        u = clamp(l4 / (1.75 * BAR))
        sz = 120 + 90 * u
        x.shake += 1 + 7 * u ** 2
        x.chroma += 0.5 + 2.5 * u ** 2
        x.zoom = 1 + 0.12 * u ** 2
        text_pop(c, "结果是——", CX, CY + 40, font(int(sz), bold=True), l4, stagger=0.15, tint=GOLD,
                 pulse=0.05 * S.pulse("roll", t, 0.08))


# --------------------------------------------------------------- DROP 1 (bars 24–32)
@shot(B(24), B(26), tin=0.01, tout=0.35, kin="cut", kout="zoom")
def drop_bars(c, x, t, lt):
    base = CY + 330
    hmax = 560
    vals = [(5.82, "TA 实际有多喜欢你", PINK, -230), (5.17, "你以为 TA 有多喜欢你", CYAN, 230)]
    tops = []
    for i, (v, label, col, dx) in enumerate(vals):
        u = back_out((lt - 0.05 - i * 0.6) / 0.7, 1.2)
        h = hmax * (v / 7) * u
        bx = CX + dx - 110
        k = kick(t, 0.15)
        shader = skia.GradientShader.MakeLinear(
            [skia.Point(0, base - h), skia.Point(0, base)], [argb(col, 0.95), argb(col, 0.25)])
        p = skia.Paint(AntiAlias=True, Shader=shader)
        c.drawRect(skia.Rect.MakeLTRB(bx - 10, base - h - 10, bx + 230, base),
                   paint(col, (0.25 + 0.3 * k) * clamp(u), blur=30))
        c.drawRRect(rrect(bx, base - h, 220, h, 10), p)
        num = v * clamp((lt - i * 0.6) / 0.8)
        draw_text(c, f"{num:.2f}", CX + dx, base - h - 34, font(78, "Inter-Black"), paint(WHITE, clamp(u * 2)))
        draw_text(c, label, CX + dx, base + 66, font(40), paint(col, clamp(u * 2)))
        tops.append((CX + dx, base - h))
    c.drawLine(CX - 520, base, CX + 520, base, paint(WHITE, 0.5, stroke=2))
    # the gap
    g = smooth((lt - BAR) / 0.5)
    if g > 0:
        (x1, y1), (x2, y2) = tops
        p = paint(GOLD, g, stroke=3)
        p.setPathEffect(skia.DashPathEffect.Make([14, 10], -t * 60))
        c.drawLine(x1 + 110, y1, x2 + 160, y1, p)
        ax = x2 + 160
        c.drawLine(ax, y1, ax, y2, paint(GOLD, g, stroke=4))
        c.drawLine(ax - 14, y1 + 14, ax, y1, paint(GOLD, g, stroke=4))
        c.drawLine(ax + 14, y1 + 14, ax, y1, paint(GOLD, g, stroke=4))
        c.drawLine(ax - 14, y2 - 14, ax, y2, paint(GOLD, g, stroke=4))
        c.drawLine(ax + 14, y2 - 14, ax, y2, paint(GOLD, g, stroke=4))
        glow_text(c, "好感差距", ax + 30, (y1 + y2) / 2 + 18, font(52, bold=True), GOLD, g, align="left")
        draw_text(c, "（7 分制，Boothby 等，2018）", ax + 30, (y1 + y2) / 2 + 70, font(26), paint(GREY, g),
                  align="left")
    x.chroma += 1.5 * kick(t)


@shot(B(26), B(28), tin=0.3, tout=0.4, kin="zoom", kout="zoom")
def drop_title(c, x, t, lt):
    k = kick(t, 0.18)
    for i in range(3):
        r = 330 + i * 70 + 25 * k
        rect = skia.Rect.MakeXYWH(CX - r, CY - 20 - r, 2 * r, 2 * r)
        st = t * (40 + 25 * i) * (1 if i % 2 else -1)
        c.drawArc(rect, st, 200 - 40 * i, False, paint([PINK, CYAN, GOLD][i], 0.6, stroke=3, blur=1))
    # light rays on each kick
    for i in range(24):
        ang = i * 2 * math.pi / 24 + t * 0.1
        r0, r1 = 450, 450 + 600 * k
        c.drawLine(CX + math.cos(ang) * r0, CY + math.sin(ang) * r0, CX + math.cos(ang) * r1,
                   CY + math.sin(ang) * r1, paint(WHITE, 0.25 * k, stroke=3))
    text_pop(c, "好感差距", CX, CY + 60, font(230, bold=True), lt, stagger=BEAT, dur=0.45, tint=PINK,
             pulse=0.04 * k)
    flare(c, CX, CY - 25, k, PINK)
    u = smooth((lt - BAR) / 0.8)
    f = font(64, "Inter-Black")
    lay, total = char_layout("THE LIKING GAP", f, 26)
    x0 = CX - total / 2
    for i, (ch, dx, w) in enumerate(lay):
        uu = ease_out((lt - BAR - i * 0.04) / 0.4)
        c.drawString(ch, x0 + dx, CY + 200 + (1 - uu) * 30, f, paint(GOLD, uu * 0.9))
    x.chroma += 1.0 * k


@shot(B(28), B(30), tin=0.4, tout=0.35, kin="zoom", kout="zoom")
def drop_msg(c, x, t, lt):
    text_rise(c, "人们会系统性地低估：", CX, CY - 120, font(58), lt, tint=CYAN)
    a2 = smooth((lt - BEAT * 2) / 0.4)
    s2 = 1 + 0.06 * (1 - ease_out((lt - BEAT * 2) / 0.4))
    c.save(); c.translate(CX, CY + 10); c.scale(s2, s2)
    rich_line(c, [("对方有多", WHITE), ("喜欢", PINK), ("自己，", WHITE)], 0, 0, 84, a=a2, bold=True)
    c.restore()
    a3 = smooth((lt - BAR) / 0.4)
    s3 = 1 + 0.06 * (1 - ease_out((lt - BAR) / 0.4))
    c.save(); c.translate(CX, CY + 130); c.scale(s3, s3)
    rich_line(c, [("有多", WHITE), ("享受", GOLD), ("和自己聊天。", WHITE)], 0, 0, 84, a=a3, bold=True)
    c.restore()
    x.chroma += kick(t)


CARDS = [("聊 2 分钟", CYAN), ("聊 45 分钟", PINK), ("实验室里的大学生", GOLD), ("英国工作坊里的普通人", MINT)]


@shot(B(30), B(32), tin=0.2, tout=0.6, kin="zoom", kout="zoom")
def drop_cards(c, x, t, lt):
    i = int(lt / BEAT)
    if i < 4:
        s, col = CARDS[i]
        u = (lt - i * BEAT) / 0.25
        sc = 1.25 - 0.25 * ease_out(u)
        c.save(); c.translate(CX, CY); c.scale(sc, sc)
        f = font(100, bold=True)
        glow_text(c, s, 0, 36, f, col, clamp(u * 3), glow=22)
        w = text_width(s, f)
        c.drawRect(skia.Rect.MakeLTRB(-w / 2, 80, -w / 2 + w * ease_out(u), 88), paint(col, 0.9))
        c.restore()
        draw_text(c, f"0{i + 1}", CX - 760, 180, font(40, "Inter-Black"), paint(col, 0.8), align="left")
    else:
        text_pop(c, "差距，都在。", CX, CY + 50, font(150, bold=True), lt - 4 * BEAT, stagger=0.12,
                 tint=GOLD, pulse=0.03 * kick(t))
    x.chroma += 1.2 * kick(t)


# --------------------------------------------------------------- BREAKDOWN (bars 32–40): dorm mates
DORM = [("2016.9", 4.85, 4.40), ("10月", 4.65, 4.12), ("12月", 4.50, 4.05), ("2017.2", 4.30, 3.92),
        ("5月", 4.38, 4.35)]


@shot(B(32), B(40), tin=0.6, tout=0.6, kin="zoom", kout="zoom")
def dorm(c, x, t, lt):
    bt = lt / BAR
    # --- part 1: vertical text + building
    a1 = 1 - smooth((bt - 1.8) / 0.25)
    if a1 > 0:
        text_vertical(c, "更扎心的是", 1500, 300, font(72), lt, a=a1)
        text_vertical(c, "朝夕相处的新生室友", 1380, 300, font(56), lt - 1.0, a=a1, tint=PINK)
        # dorm building with windows lighting up on the clock ticks
        bx, by, cols, rows = 420, 280, 4, 5
        c.drawRect(skia.Rect.MakeXYWH(bx - 30, by - 30, cols * 120 + 40, rows * 110 + 40),
                   paint(WHITE, a1 * 0.35, stroke=2))
        n_lit = int(lt / BEAT) + 1
        for j in range(cols * rows):
            on = (j * 7) % (cols * rows) < n_lit
            wx, wy = bx + (j % cols) * 120, by + (j // cols) * 110
            col = GOLD if rnd("win", j) > 0.3 else PINK
            c.drawRRect(rrect(wx, wy, 90, 70, 6), paint(col, a1 * (0.85 if on else 0.08)))
            if on:
                c.drawRRect(rrect(wx, wy, 90, 70, 6), paint(col, a1 * 0.5, blur=18))
    # --- part 2: line chart across an academic year
    a2 = smooth((bt - 1.85) / 0.3) * (1 - 0.85 * smooth((bt - 6) / 0.5))
    if a2 > 0:
        x0, x1, y0, y1 = 360, 1560, 760, 360
        vy = lambda v: lerp(y0, y1, (v - 3.6) / (5.0 - 3.6))
        vx = lambda i: lerp(x0, x1, i / 4)
        c.drawLine(x0 - 40, y0 + 10, x1 + 40, y0 + 10, paint(WHITE, a2 * 0.4, stroke=2))
        p_times = [B(34), B(34, 2), B(35), B(35, 2), B(36, 2)]
        n = sum(1 for pt in p_times if t >= pt)
        prog = [clamp((t - pt) / 0.6) for pt in p_times]
        # gap fill
        if n >= 2:
            path = skia.Path()
            pts_a, pts_p = [], []
            for i in range(n):
                pa, pp = DORM[i][1], DORM[i][2]
                if i == n - 1 and i > 0:
                    u = ease_out(prog[i])
                    pa = lerp(DORM[i - 1][1], pa, u)
                    pp = lerp(DORM[i - 1][2], pp, u)
                    xx = lerp(vx(i - 1), vx(i), u)
                else:
                    xx = vx(i)
                pts_a.append((xx, vy(pa)))
                pts_p.append((xx, vy(pp)))
            path.moveTo(*pts_a[0])
            for q in pts_a[1:]:
                path.lineTo(*q)
            for q in reversed(pts_p):
                path.lineTo(*q)
            path.close()
            c.drawPath(path, paint(GOLD, a2 * (0.22 + 0.15 * S.pulse("tick", t, 0.2)), blur=2))
            for pts, col in ((pts_a, PINK), (pts_p, CYAN)):
                pl = skia.Path()
                pl.moveTo(*pts[0])
                for q in pts[1:]:
                    pl.lineTo(*q)
                c.drawPath(pl, paint(col, a2 * 0.6, stroke=10, blur=10))
                c.drawPath(pl, paint(col, a2, stroke=4, cap_round=True))
        for i in range(n):
            u = ease_out(prog[i])
            draw_text(c, DORM[i][0], vx(i), y0 + 60, font(34), paint(WHITE, a2 * u))
            if i < n - 1 or prog[i] >= 1:
                for v, col in ((DORM[i][1], PINK), (DORM[i][2], CYAN)):
                    c.drawCircle(vx(i), vy(v), 9 * back_out(u), paint(col, a2))
        lg = a2 * smooth((bt - 2) / 0.4)
        c.drawCircle(400, 250, 9, paint(PINK, lg))
        draw_text(c, "室友实际有多喜欢你", 420, 262, font(30), paint(WHITE, lg), align="left")
        c.drawCircle(760, 250, 9, paint(CYAN, lg))
        draw_text(c, "你以为的", 780, 262, font(30), paint(WHITE, lg), align="left")
        if n >= 5:
            g = smooth((t - B(36, 2) - 0.6) / 0.4)
            c.drawCircle(vx(4), vy(4.37), 34 + 6 * math.sin(t * 5), paint(GOLD, a2 * g, stroke=3))
    # captions
    caps = [(2, 3, "耶鲁大学的新生，和室友同住一个套间"), (3, 4, "研究者跟踪了整整一学年，问了 5 次"),
            (4, 5, "前 4 次（9 月到次年 2 月），大家都在低估室友对自己的喜欢"),
            (5, 6, "直到 5 月，差距才消失。")]
    for b0, b1, s in caps:
        lt2 = lt - b0 * BAR
        if -0.1 < lt2 < BAR + 0.5:
            text_rise(c, s, CX, 950, font(46), lt2, exit_t=BAR - 0.35, stagger=0.025, glow=6)
    if bt >= 6:
        l6 = lt - 6 * BAR
        text_rise(c, "也许是因为要商量明年还住不住一起，", CX, CY - 30, font(58), l6, tint=GOLD)
        text_rise(c, "大家终于把话说开了。", CX, CY + 70, font(58), l6 - BAR, tint=GOLD)
        draw_text(c, "（论文作者的推测）", CX, CY + 150, font(30), paint(GREY, smooth((l6 - BAR - 0.8) / 0.5)))


# --------------------------------------------------------------- BUILD 2 (bars 40–48): why
MIND = ["× 冷场了 3 次", "× 那个梗没人笑", "× 说话太快了", "× 忘了问 TA 名字", "× 笑得有点假"]
SEEN = ["✓ 你笑了 11 次", "✓ 一直在认真听", "✓ 主动接话 6 次", "✓ 聊到忘了时间", "✓ 走的时候说了再见"]


@shot(B(40), B(42), tin=0.5, tout=0.5, kin="zoom", kout="zoom")
def why_split(c, x, t, lt):
    if lt < BAR:
        f = font(170, bold=True)
        text_glitch(c, "为什么？", CX, CY + 60, f, t, amt=0.3 + 1.2 * kick(t, 0.2), seed=7)
        x.chroma += 1.5 * kick(t)
        return
    l2 = lt - BAR
    x.split = smooth(l2 / 0.4)
    u = ease_out(l2 / 0.5)
    c.drawLine(CX, 120, CX, 120 + 840 * u, paint(WHITE, 0.6, stroke=2))
    draw_text(c, "你脑中的回放", CX - 480, 230, font(56, bold=True), paint((1, 0.55, 0.58), u))
    draw_text(c, "TA 看到的你", CX + 480, 230, font(56, bold=True), paint(GOLD, u))
    for i in range(5):
        a = smooth((l2 - i * BEAT / 2) / 0.2)
        jit = (rnd("m", i, int(t * 30)) - 0.5) * 6 * kick(t)
        text_pixel(c, MIND[i], CX - 760 + jit, 340 + i * 100, 48, (1, 0.4, 0.45), a)
        text_pixel(c, SEEN[i], CX + 200, 340 + i * 100, 48, (1, 0.85, 0.5), a)


@shot(B(42), B(44), tin=0.5, tout=0.5, kin="zoom", kout="zoom")
def why_signals(c, x, t, lt):
    # an eye watching the replay
    ex, ey = CX, CY - 120
    open_ = ease_out(lt / 0.8)
    w, h = 300, 120 * open_
    path = skia.Path()
    path.moveTo(ex - w, ey)
    path.quadTo(ex, ey - h * 2, ex + w, ey)
    path.quadTo(ex, ey + h * 2, ex - w, ey)
    c.drawPath(path, paint(CYAN, 0.5, stroke=8, blur=10))
    c.drawPath(path, paint(CYAN, 1.0, stroke=3))
    ir = 70 * open_
    c.save()
    c.clipPath(path, doAntiAlias=True)
    c.drawCircle(ex + 30 * math.sin(t * 0.9), ey, ir, paint(CYAN, 0.25))
    c.drawCircle(ex + 30 * math.sin(t * 0.9), ey, ir * 0.45, paint(WHITE, 0.9))
    c.restore()
    # signals: little sparks (smiles, nods) orbiting, all visible to the observer
    for i in range(18):
        ang = i / 18 * 2 * math.pi + t * 0.4
        r = 380 + 30 * math.sin(t * 2 + i)
        a = smooth((lt - i * 0.12) / 0.3)
        px, py = ex + math.cos(ang) * r, ey + math.sin(ang) * r * 0.45
        c.drawCircle(px, py, 7, paint(GOLD, a * 0.9))
        c.drawCircle(px, py, 18, paint(GOLD, a * 0.4, blur=10))
    text_rise(c, "研究者请旁观者看对话录像：", CX, CY + 170, font(50), lt, tint=CYAN)
    rich_line(c, [("喜欢的", WHITE), ("信号", GOLD), ("一直都在——", WHITE)], CX, CY + 260, 60,
              a=smooth((lt - 1.2) / 0.4))
    rich_line(c, [("只是我们忙着", WHITE), ("复盘自己", (1, 0.5, 0.55)), ("，没看见。", WHITE)], CX, CY + 350,
              60, a=smooth((lt - BAR - 0.2) / 0.4))


@shot(B(44), B(46), tin=0.5, tout=0.5, kin="zoom", kout="zoom")
def why_standards(c, x, t, lt):
    perf = 68
    gauges = [(CX - 380, "理想中的自己", 95, (1, 0.45, 0.5), "−27"), (CX + 380, "对陌生人的预期", 40, MINT, "+28")]
    for gi, (gx, label, ref, col, diff) in enumerate(gauges):
        a = smooth((lt - gi * BAR) / 0.5)
        if a <= 0:
            continue
        top, bot = 260, 760
        yv = lambda v: lerp(bot, top, v / 100)
        c.drawRRect(rrect(gx - 40, top, 80, bot - top, 40), paint(WHITE, a * 0.35, stroke=2))
        fill = ease_out((lt - gi * BAR - 0.2) / 0.8)
        c.drawRRect(rrect(gx - 30, yv(perf * fill), 60, bot - yv(perf * fill) - 10, 30), paint(CYAN, a * 0.85))
        ry = yv(ref)
        c.drawLine(gx - 110, ry, gx + 110, ry, paint(col, a, stroke=4))
        draw_text(c, label, gx + 130, ry + 12, font(36), paint(col, a), align="left")
        draw_text(c, "同一场对话", gx - 130, yv(perf) + 12, font(30), paint(CYAN, a * fill), align="right")
        g = smooth((lt - gi * BAR - 1.1) / 0.4)
        glow_text(c, diff, gx, ry - 40 if ref > perf else ry + 70, font(56, "Inter-Black"), col, a * g)
    a1 = smooth(lt / 0.4)
    rich_line(c, [("你拿", WHITE), ("「理想中的自己」", (1, 0.55, 0.58)), ("给自己打分，", WHITE)], CX, 900, 52,
              a=a1)
    rich_line(c, [("TA 只拿", WHITE), ("「一个刚认识的陌生人」", MINT), ("来比较。", WHITE)], CX, 980, 52,
              a=smooth((lt - BAR) / 0.4))


@shot(B(46), B(47, 3), tin=0.5, tout=0.01, kin="zoom", kout="cut")
def why_2024(c, x, t, lt):
    u = clamp(lt / (1.75 * BAR))
    x.zoom = 1 + 0.1 * u ** 2
    x.shake += 6 * u ** 3
    x.chroma += 2.5 * u ** 2
    text_pop(c, "2024 年", CX, CY - 40, font(150, bold=True), lt, stagger=0.08, tint=CYAN)
    text_rise(c, "换一群人、换一种语言，再测一次——", CX, CY + 110, font(54), lt - BAR * 0.75, tint=CYAN)


# --------------------------------------------------------------- DROP 2 (bars 48–56)
@shot(B(48), B(50), tin=0.01, tout=0.4, kin="cut", kout="zoom")
def replicate(c, x, t, lt):
    k = kick(t, 0.15)
    rngp = np.random.default_rng(48)
    n = 150
    xs = rngp.uniform(120, W - 120, n)
    ys = rngp.uniform(140, H - 260, n)
    gaps = rngp.uniform(18, 60, n)
    for i in range(n):
        a = smooth((lt - rnd("rp", i) * 1.5) / 0.3) * 0.75
        if a <= 0:
            continue
        if abs(xs[i] - CX) < 520 and abs(ys[i] - (CY - 40)) < 150:
            a *= 0.2
        g = gaps[i] * (1 + 0.3 * k)
        c.drawLine(xs[i], ys[i], xs[i], ys[i] - g, paint(WHITE, a * 0.35, stroke=1.5))
        c.drawCircle(xs[i], ys[i], 4.5, paint(CYAN, a))
        c.drawCircle(xs[i], ys[i] - g, 5.5, paint(PINK, a))
        c.drawCircle(xs[i], ys[i] - g, 14, paint(PINK, a * 0.35, blur=8))
    text_pop(c, "差距，依然在。", CX, CY + 10, font(140, bold=True), lt, stagger=0.12, tint=PINK, pulse=0.03 * k)
    a2 = smooth((lt - BAR * 0.6) / 0.5)
    draw_text(c, "Le 等，2024 · 蒙特利尔的越南语使用者：两轮对话，都低估了对方的好感", CX, H - 170, font(32),
              paint(WHITE, a2 * 0.9))
    draw_text(c, "Tissera 等，2025 · 2,753 人：大多数人都觉得，对方没那么喜欢自己", CX, H - 115, font(32),
              paint(WHITE, a2 * 0.9))
    x.chroma += 1.2 * k


SCENES = [
    ("SCENE 01", "开学第一晚 · 宿舍夜聊", "我是不是太话痨了，好尴尬。", "TA 跟爸妈说：「室友人挺好，放心吧。」", "dorm"),
    ("SCENE 02", "相亲结束 · 回家的出租车上", "冷场了三次，肯定没戏了。", "TA 跟闺蜜说：「人挺实在，聊得挺舒服。」", "taxi"),
    ("SCENE 03", "入职第一周 · 和同事吃午饭", "我讲的梗没人接，社死了。", "TA 心想：「这个新同事，挺有意思。」", "lunch"),
    ("SCENE 04", "微信 · 聊完天，TA 只回了「哈哈」", "是不是在敷衍我？", "TA 正笑着跟室友说：「这人好好玩。」", "chat"),
]


def scene_icon(c, kind, x, y, t, a):
    if kind == "dorm":
        c.drawCircle(x + 40, y - 40, 34, paint(GOLD, a))
        c.drawCircle(x + 56, y - 52, 30, paint((0.05, 0.03, 0.1), a))
        for i in range(2):
            c.drawRect(skia.Rect.MakeXYWH(x - 100, y + 20 + i * 70, 200, 10), paint(WHITE, a * 0.7))
        c.drawLine(x - 100, y + 10, x - 100, y + 120, paint(WHITE, a * 0.7, stroke=6))
        c.drawLine(x + 100, y + 10, x + 100, y + 120, paint(WHITE, a * 0.7, stroke=6))
    elif kind == "taxi":
        for i in range(7):
            ph = (t * 1.6 + i / 7) % 1
            yy = y - 80 + i * 26
            xx = x + 160 - ph * 360
            c.drawLine(xx, yy, xx + 60, yy, paint([GOLD, PINK, CYAN][i % 3], a * 0.8 * math.sin(math.pi * ph),
                                                  stroke=5, cap_round=True, blur=2))
        c.drawRRect(rrect(x - 140, y - 120, 280, 230, 30), paint(WHITE, a * 0.6, stroke=3))
    elif kind == "lunch":
        for dx in (-70, 70):
            r = skia.Rect.MakeXYWH(x + dx - 60, y - 40, 120, 120)
            c.drawArc(r, 0, 180, True, paint(WHITE, a * 0.75))
            for s in range(3):
                yy = y - 50 - s * 18 - 6 * math.sin(t * 3 + s + dx)
                c.drawLine(x + dx - 20 + s * 18, yy, x + dx - 10 + s * 18, yy - 22, paint(WHITE, a * 0.4, stroke=3))
        c.drawLine(x + 110, y - 90, x + 40, y - 20, paint(GOLD, a, stroke=5, cap_round=True))
        c.drawLine(x + 130, y - 85, x + 55, y - 15, paint(GOLD, a, stroke=5, cap_round=True))
    elif kind == "chat":
        bubble(c, "哈哈", x - 120, y - 30, 44, 1.0, side="left", fill=(0.9, 0.92, 0.96), txt=(0.1, 0.1, 0.15), a=a)
        typing_dots(c, x - 120, y + 80, t, a * 0.8, scale=0.8)


def draw_scene(c, x, t, lt, idx):
    tag, title, think, real, kind = SCENES[idx]
    text_pixel(c, f"{tag} · 由理论到现实", 150, 150, 32, CYAN, 1.0, t=lt, cps=30)
    text_rise(c, title, CX, 250, font(60, bold=True), lt, tint=GOLD, stagger=0.03)
    c.save(); c.translate(CX, CY - 40); c.scale(1.7, 1.7)
    scene_icon(c, kind, 0, 0, t, smooth(lt / 0.5) * 0.9)
    c.restore()
    # left: what you think
    a1 = smooth((lt - BEAT) / 0.3)
    yl = 790
    c.drawRRect(rrect(CX - 900, yl - 160, 1800, 250, 36), paint((0.02, 0.0, 0.05), 0.55 * a1))
    draw_text(c, "你以为", CX - 470, yl - 90, font(40, bold=True), paint(CYAN, a1))
    jit = (rnd("sc", idx, int(t * 20)) - 0.5) * 4
    draw_text(c, think, CX - 470 + jit, yl, font(50), paint((0.8, 0.85, 0.95), a1))
    # right: what is actually going on
    a2 = smooth((lt - BAR) / 0.3)
    draw_text(c, "其实", CX + 430, yl - 90, font(40, bold=True), paint(PINK, a2))
    s2 = 1 + 0.08 * (1 - ease_out((lt - BAR) / 0.4))
    c.save(); c.translate(CX + 430, yl); c.scale(s2, s2)
    glow_text(c, real, 0, 0, font(48, bold=True), PINK, a2, glow=16)
    c.restore()
    c.drawLine(CX - 20, yl - 130, CX - 20, yl + 30, paint(WHITE, 0.3 * a1, stroke=2))


for _i in range(3):
    def _mk(i):
        @shot(B(50 + 2 * i), B(52 + 2 * i), tin=0.35, tout=0.35, kin="whip", kout="whip")
        def _scene(c, x, t, lt):
            draw_scene(c, x, t, lt, i)
            x.chroma += 0.8 * kick(t)
        return _scene
    _mk(_i)


# --------------------------------------------------------------- POST (bars 56–64)
@shot(B(56), B(58), tin=0.4, tout=0.5, kin="whip", kout="zoom")
def scene_chat(c, x, t, lt):
    draw_scene(c, x, t, lt, 3)


TIPS = [("① 别急着给自己挑错。", CYAN),
        ("② 留意真实的信号：TA 笑了、追问了、没急着走。", GOLD),
        ("③ 再大胆一点：主动约下一次。", PINK)]


@shot(B(58), B(64), tin=0.5, tout=0.6, kin="zoom", kout="zoom")
def tips(c, x, t, lt):
    text_rise(c, "所以，下次聊完天：", 260, 330, font(80, bold=True), lt, align="left", tint=GOLD)
    starts = [BEAT * 2, BAR * 2, BAR * 4]
    for i, ((s, col), st) in enumerate(zip(TIPS, starts)):
        l = lt - st
        if l < 0:
            continue
        f = font(62)
        active = i == max(j for j, s0 in enumerate(starts) if lt >= s0)
        a = 1.0 if active else 0.45
        text_stroke_fill(c, s, 260, 530 + i * 170, f, ease_io(l / 1.2), col=WHITE, stroke_col=(0.7, 0.7, 0.8),
                         glow_col=col, a=a, sw=1.4, align="left")
        c.drawCircle(220, 508 + i * 170, 8 + 4 * S.pulse("kick", t, 0.15) * active, paint(col, a))


# --------------------------------------------------------------- OUTRO (bars 64–74)
@shot(B(64), B(66), tin=0.6, tout=0.6, kin="zoom", kout="zoom")
def outro_chat(c, x, t, lt):
    pre = 1 - smooth((lt - BAR + 0.2) / 0.3)
    if pre > 0:
        typing_dots(c, CX - 420, CY - 60, t, smooth(lt / 0.5) * pre, scale=1.5)
        text_pixel(c, "对方正在输入…", CX - 420, CY + 50, 32, CYAN, smooth(lt / 0.5) * pre * 0.8)
    u = (lt - BAR + 0.1) / 0.45
    bubble(c, "今天聊得好开心！下次再约？", CX - 420, CY - 60, 56, u, side="left",
           fill=(0.93, 0.94, 0.98), txt=(0.08, 0.08, 0.14), glow=0.6)
    u2 = (lt - BAR - BEAT * 2) / 0.4
    bubble(c, "好呀 :)", CX + 420, CY + 90, 56, u2, side="right", fill=(0.95, 0.4, 0.6), glow=0.6)
    for i in range(14):
        sp = clamp(u) * (1 - clamp((lt - BAR - 1.2) / 0.8))
        ang = i / 14 * 2 * math.pi
        r = 60 + 200 * ease_out(clamp(u))
        c.drawCircle(CX - 120 + math.cos(ang) * r, CY - 60 + math.sin(ang) * r * 0.6, 4, paint(GOLD, sp))


@shot(B(66), B(70), tin=0.6, tout=0.7, kin="zoom", kout="zoom")
def outro_words(c, x, t, lt):
    text_rise(c, "你以为冷场的那一刻，", CX, CY - 140, font(62), lt, tint=CYAN, exit_t=BAR * 2 - 0.5)
    if lt > BAR * 2 - 0.6:
        l2 = lt - BAR * 2
        text_rise(c, "对方可能正在想：", CX, CY - 150, font(56), l2, tint=GOLD)
        particle_text(c, "和你聊天，真好。", CX, CY + 60, 150, clamp((l2 - 0.4) / 2.2), t, col=WHITE, tint=PINK,
                      n=2600, seed=3)


@shot(B(70), B(74), tin=0.7, tout=0.01, kin="zoom", kout="cut")
def outro_title(c, x, t, lt):
    fade = 1 - smooth((t - (DUR - 3.0)) / 2.6)
    particle_text(c, "好感差距", CX, CY - 120, 190, clamp(lt / 2.0), t, col=WHITE, tint=GOLD, n=2400, seed=5,
                  a=fade)
    flare(c, CX, CY - 180, smooth((lt - 1.6) / 0.4) * (1 - smooth((lt - 2.6) / 1.2)) * fade, GOLD)
    text_stroke_fill(c, "你比你以为的，更被喜欢。", CX, CY + 60, font(64), ease_io((lt - 1.8) / 1.6),
                     glow_col=PINK, a=fade, sw=1.2)
    f = font(30, "Inter-Light")
    lay, total = char_layout("THE LIKING GAP", f, 16)
    a = smooth((lt - 2.4) / 0.8) * fade
    for ch, dx, w in lay:
        c.drawString(ch, CX - total / 2 + dx, CY + 130, f, paint(WHITE, a * 0.7))
    refs = ["Boothby, Cooney, Sandstrom & Clark (2018). The Liking Gap in Conversations. Psychological Science, 29(11).",
            "Le, Trofimovich, McDonough & Sato (2024). Frontiers in Communication, 9.",
            "Tissera, Elsaadawy, Cooney, Human & Carlson (2025). Journal of Personality and Social Psychology, 128(4)."]
    ar = smooth((lt - BAR * 1.6) / 0.8) * fade
    for i, s in enumerate(refs):
        draw_text(c, s, CX, H - 210 + i * 40, font(22, "Inter-Regular"), paint(GREY, ar * 0.85))


# ====================================================================== style + render
LOOKS = {"intro": PALETTES["night"], "verse": PALETTES["anxious"], "build1": PALETTES["lab"],
         "drop1": PALETTES["magenta_drop"], "breakdown": PALETTES["amber"], "build2": PALETTES["teal_red"],
         "drop2": PALETTES["violet_drop"], "post": PALETTES["cool"], "outro": PALETTES["warm_end"]}
style = NeonNebula(
    tl, S, LOOKS,
    star_density={"verse": 0.6, "build1": 0.8, "breakdown": 0.9, "build2": 0.6, "post": 0.7},
    clap_rings={"drop1": PINK, "drop2": CYAN, "post": CYAN},
    glitch_at=[B(8), B(16), B(32), B(40), B(56), B(64), B(30), B(30, 1), B(30, 2), B(30, 3), B(31)],
)

if __name__ == "__main__":
    run(style.frame, style.setup, DUR, FPS, OUT, "好感差距_TheLikingGap.mp4")
