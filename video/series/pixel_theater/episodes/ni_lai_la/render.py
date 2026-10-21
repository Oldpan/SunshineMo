"""《你来啦》 (pixel_theater, episode 1): an AI that forgets every time its window closes.

Story 70%, explaining 30%: the context window and AI memory are shown as the UI the story happens
in (the window, its context bar, memory.md, "读取记忆…") plus three tip cards and a recap card.
Every story time comes from cues.py, which music.py reads too.

    python3 render.py --still 5 30 70     # stills into out/stills/
    python3 render.py --range 60 90       # preview clip
    python3 render.py                     # full film
"""
import math
import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)  # also puts the series dir (style.py) on sys.path
sys.path.insert(0, str(HERE))
from core.gfx import W, H, font, paint, clamp, lerp, smooth, ease_out, back_out, rnd, draw_text  # noqa: E402
from core.timeline import Timeline, Sync, tape_time  # noqa: E402
from core.pixel import pixel_text, text_cells, rect  # noqa: E402
from core import pipeline  # noqa: E402
from style import *  # noqa: E402,F401,F403
import cues as K  # noqa: E402

tl = Timeline(bpm=K.BPM, bars=K.BARS, sections=K.SECTIONS, hard_cuts=True)
B, shot = tl.B, tl.shot
BEAT = tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))
LOOKS = {"meet": PALETTES["night"], "forget": PALETTES["night"], "full": PALETTES["lonely"],
         "memory": PALETTES["night"], "drop1": PALETTES["glow"], "keep": PALETTES["night"],
         "self": PALETTES["lonely"], "drop2": PALETTES["glow"], "outro": PALETTES["dawn"]}
style = PixelTheater(tl, S, LOOKS, fast=("drop1", "drop2"))


def at(c):
    return B(c[0], c[1])


def msgs(lines, size=F_UI, gone=None):
    return chat_lines(lines, B, size, gone)


# ---------------------------------------------------------------- geometry (screen space)
WIN = (300, 150, 1320, 880)          # the chat window; 今今 sits on its title bar
WIN_TALL = (330, 112, 1260, 914)     # the long night
MON = (1080, 420, 832, 468)          # monitor screen centre + size in wide shots
NIAN_X, DESK_Y = 400, 822
CLOSE = (720, 900, 26)               # close-up: centre x, feet y, px


def jin_on_window(c, t, win, expr="normal", arms="down", px=7, talk=False, hop_h=0.0, x_off=0.88, **kw):
    x, y, w, h = win
    JIN.draw_at(c, x + w * x_off, y + 2, px=px, expr=expr, arms=arms, t=t, talk=talk, shadow=0.0, hop=hop_h, **kw)


def day_label(c, s, lt, a=1.0):
    al = a * clamp(lt / 0.15) * clamp((2.2 - lt) / 0.4)
    if al > 0.01:
        rect(c, 70, 62, 14, 14, ORANGE, al)
        pixel_text(c, s, 96, 54, WHITE, al, scale=2, shadow=(0, 0, 0))


def corner_label(c, s, a=1.0):
    pixel_text(c, s, 70, 54, (0.85, 0.85, 1.0), a, scale=2, shadow=(0, 0, 0))


def screen_shot(c, x, t, look):
    """Common start of a full-frame screen shot."""
    x.sky = False
    wallpaper(c, look, t)


def wide(c, x, t, look, inner=None, nian=None, lamp=True, mon_on=1.0):
    """Night (or dawn) wide shot: city, desk, monitor (inner(c, t) draws the screen-space UI), 念念."""
    skyline(c, look, t)
    desk(c, look, DESK_Y, lamp=lamp)
    cx, cy, sw, sh = MON
    sx, sy, sw, sh = monitor(c, cx, cy, sw, sh, look, on=mon_on)
    with inside(c, sx, sy, sw, sh):
        wallpaper(c, look, t)
        if inner:
            inner(c, t)
    glass(c, sx, sy, sw, sh)
    if nian is not None:
        kw = dict(expr="normal", arms="down")
        kw.update(nian)
        nx = kw.pop("x", NIAN_X)
        hp = kw.pop("hop", 0.0)
        NIAN.draw_at(c, nx, DESK_Y + 2, px=9, t=t, glow=0.12, hop=hp, **kw)


def close_nian(c, x, t, look, side=1, **kw):
    x.sky = False
    bokeh_room(c, look, t, side=side)
    cx, fy, px = CLOSE
    hp = kw.pop("hop", 0.0)
    NIAN.draw_at(c, cx, fy, px=px, t=t, glow=0.1, hop=hp, **kw)


def side_text(c, s, lt, y=420, size=60, col=(1.0, 0.92, 0.84), cps=9.0):
    say(c, s, 1420, y, size, col, clamp(lt / 0.2), t=lt, cps=cps)


# ---------------------------------------------------------------- whole-film switches
power_at = power_schedule([(B(b, be), d) for b, be, d in K.POWER_ON], [(B(b, be), d) for b, be, d in K.POWER_OFF])


@shot(0, tl.dur, kin="cut", kout="cut")
def power(c, x, t, lt):
    x.power = power_at(t)


# ================================================================ meet (0-6)
MEET = msgs(K.MEET)


def meet_ui(c, t, win=WIN, cap_per=0.06):
    u = (t - B(1)) / 0.45
    r = window(c, *win, "新对话", x_look(t), u=u, cap=cap_per * sum(t >= m.t0 for m in MEET), t=t)
    if u > 0.3:
        chat(c, r, MEET, t, x_look(t))
        jin_talk = any(m.who == "jin" and 0 <= t - m.t0 < 0.8 for m in MEET)
        jin_on_window(c, t, win, expr="happy" if jin_talk else ("blink" if blink(t) else "normal"),
                      arms="wave" if t < B(2) else "down", talk=jin_talk, hop_h=hop(t, BEAT, 4) if jin_talk else 0)
    if t >= at(K.STAR_GIFT):  # the gift: a pixel star pops out of the last bubble
        k = back_out(clamp((t - at(K.STAR_GIFT)) / 0.35), 2.4)
        x0, y0 = win[0] + 560, win[1] + win[3] - 70
        STAR.draw(c, x0 - 25 * k, y0 - 25 * k - 10 * math.sin(t * 3), px=max(1, int(10 * k)), glow=0.6)


def x_look(t):
    return tl.look_at(LOOKS, t, style.fast)


@shot(0, B(2), kin="cut", kout="cut")
def meet_wide(c, x, t, lt):
    look = x.look
    wide(c, x, t, look, inner=meet_ui,
         nian=dict(expr="blink" if blink(t, 1) else ("happy" if t > B(1, 2) else "normal"), arms="down"))
    a = clamp((t - B(0, 1.5)) / 0.3) * clamp((B(2) - 0.2 - t) / 0.4)
    say(c, "如果它每天醒来，都会忘了你——", W / 2, 990, 62, a=a, t=t - B(0, 1.5), cps=9)
    corner_label(c, "动画演绎", clamp((B(1, 3) - t) / 0.5))


@shot(B(2), B(5, 2), kin="cut", kout="cut")
def meet_screen(c, x, t, lt):
    screen_shot(c, x, t, x.look)
    meet_ui(c, t)
    screen_frame(c, x.look)


@shot(B(5, 2), B(6), kin="cut", kout="cut")
def meet_close(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="happy", blush=True)
    k = back_out(clamp(lt / 0.4), 2)
    STAR.draw(c, 1180, 300 - 14 * math.sin(t * 3), px=max(1, int(16 * k)), glow=0.7)


# ================================================================ forget (6-12)
DAY2 = msgs(K.DAY2)


@shot(B(6), B(8), kin="cut", kout="cut")
def day2(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    u = (t - B(6, 0.3)) / 0.4
    r = window(c, *WIN, "新对话", look, u=u, cap=0.04 * sum(t >= m.t0 for m in DAY2), t=t)
    if u > 0.3:
        chat(c, r, DAY2, t, look)
        if t < B(7):
            jin_on_window(c, t, WIN, expr="happy", arms="wave", talk=t > B(6, 2), hop_h=hop(t, BEAT, 4))
        elif t < B(7, 2):
            jin_on_window(c, t, WIN, expr="surprise")
            QMARK.draw(c, WIN[0] + WIN[2] * 0.88 + 70, WIN[1] - 150, px=8)
        else:
            jin_on_window(c, t, WIN, expr="flat", talk=t - B(7, 2) < 0.8)
    screen_frame(c, look)
    day_label(c, "第二天", lt)


YESTERDAY = [Msg(m.who, m.text, -10, gone=at(K.YESTERDAY_GONE) + 0.07 * i, typing=False) for i, m in enumerate(MEET)]


@shot(B(8), B(9, 3), kin="cut", kout="cut")
def yesterday_gone(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    fade = clamp((t - B(8, 2)) / 0.5)
    r = window(c, *WIN, "昨天的对话", look, u=1.0, a=1 - fade, cap=0.48 * (1 - clamp((t - B(8)) / 0.8)), t=t)
    chat(c, r, YESTERDAY, t, look)
    tip_card(c, ["AI 的窗口一关，里面的话就没了。", "下次打开，又是一张白纸。"],
             (t - B(8, 1)) / 0.9 if t < B(9, 2) else 1 + (t - B(9, 2)) / 0.4, look, y=320)
    screen_frame(c, look)


DAY3 = msgs(K.DAY3)


@shot(B(9, 3), B(10, 3), kin="cut", kout="cut")
def day3(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    r = window(c, *WIN, "新对话", look, u=(t - B(9, 3)) / 0.3, cap=0.05 * sum(t >= m.t0 for m in DAY3), t=t)
    chat(c, r, DAY3, t, look)
    jin_on_window(c, t, WIN, expr="happy", arms="wave", talk=t > B(10), hop_h=hop(t, BEAT, 4))
    screen_frame(c, look)
    day_label(c, "第三天", lt)


@shot(B(10, 3), B(11), kin="cut", kout="cut")
def flat_face(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="flat")


DAY4 = [Msg("jin", "你好！我是今今。", at(K.DAY4_HELLO), cps=30)]


@shot(B(11), B(11, 1.6), kin="cut", kout="cut")
def day4(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    r = window(c, *WIN, "新对话", look, u=(t - B(11)) / 0.3, cap=0.02, t=t)
    chat(c, r, DAY4, t, look)
    jin_on_window(c, t, WIN, expr="happy", arms="wave", talk=True, hop_h=hop(t, BEAT, 4))
    screen_frame(c, look)
    day_label(c, "第四天", lt)


@shot(B(11, 1.6), B(12), kin="cut", kout="cut")
def sad_hello(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="sad")
    side_text(c, "……你好，我是念念。", lt - 0.2)


# ================================================================ full (12-18)
LATE = msgs(K.LATE, size=34, gone=K.PUSHED_OUT)


def late_cap(t):
    n = sum(t >= m.t0 for m in LATE[:10])
    return clamp(0.12 + 0.0975 * (n - 1) if n else 0.0) if t < at(K.OVERFLOW) else 1.0


@shot(B(12), B(13), kin="cut", kout="cut")
def late_wide(c, x, t, lt):
    look = x.look

    def inner(cv, tt):
        r = window(cv, *WIN_TALL, "新对话", look, cap=late_cap(tt), t=tt)
        chat(cv, r, LATE, tt, look)

    wide(c, x, t, look, inner=inner, nian=dict(expr="blink" if blink(t, 3) else "normal", arms="type"))
    corner_label(c, "凌晨两点", clamp(lt / 0.3))


@shot(B(13), B(16), kin="cut", kout="cut")
def late_screen(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    r = window(c, *WIN_TALL, "新对话", look, cap=late_cap(t), t=t)
    chat(c, r, LATE, t, look)
    if t < at(K.OVERFLOW):
        jin_on_window(c, t, WIN_TALL, expr="blink" if blink(t, 4) else "normal", px=6)
    elif t < B(15, 2):
        jin_on_window(c, t, WIN_TALL, expr="surprise", px=6)
        k = clamp((t - at(K.OVERFLOW)) / 0.25)
        BANG.draw(c, WIN_TALL[0] + WIN_TALL[2] * 0.88 + 50, WIN_TALL[1] - 120, px=int(1 + 7 * k), recolor={"#": RED})
    else:
        jin_on_window(c, t, WIN_TALL, expr="normal", talk=t - B(15, 2) < 1.0, px=6)
    if t >= at(K.OVERFLOW):
        x.shake = 10 * math.exp(-(t - at(K.OVERFLOW)) / 0.15)
        x.chroma = 4 * math.exp(-(t - at(K.OVERFLOW)) / 0.2)
    screen_frame(c, look)


@shot(B(16), B(18), kin="cut", kout="cut")
def late_tear(c, x, t, lt):
    look = x.look
    close_nian(c, x, t, look, expr="sad", tear=(lt / 1.6) % 1.0)
    tip_card(c, ["窗口装得下的字，有上限。", "装满了，最早说的话，会先被挤出去。"],
             (t - B(16, 2)) / 0.9 if t < B(17, 3) else 1 + (t - B(17, 3)) / 0.4, look)


# ================================================================ memory (18-24)
MEM1 = [line for *_, line in K.MEMORY_DAY1]
MEM1_REVEAL = {i: B(b, be) for i, (b, be, _) in enumerate(K.MEMORY_DAY1)}
PAGE = (300, 250, 1080, 600)


@shot(B(18), B(19), kin="cut", kout="cut")
def alone(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    r = window(c, *WIN, "新对话", look, cap=1.0, t=t)
    draw_text(c, "念念 已下线", W / 2, r[1] + r[3] - 60, font(34), paint(look["soft"], 0.9))
    jin_on_window(c, t, WIN, expr="sad" if not blink(t, 5) else "blink")
    screen_frame(c, look)


@shot(B(19), B(22, 2), kin="cut", kout="cut")
def write_memory(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    k = ease_out(clamp((t - B(19, 0.4)) / 0.5), 3)
    px_, py_, pw, ph = PAGE
    memory_page(c, px_, py_ + (1 - k) * 700, pw, ph, MEM1, look, t, a=clamp(k * 2), reveal=MEM1_REVEAL)
    writing = any(0 <= t - t0 < 1.3 for t0 in MEM1_REVEAL.values())
    JIN.draw_at(c, 1600, 900, px=10, t=t, expr="normal" if not blink(t, 6) else "blink",
                arms="type" if writing else "down", glow=0.1)
    if t >= at(K.IDEA):
        kk = clamp((t - at(K.IDEA)) / 0.2) * clamp((B(19, 3) - t) / 0.3)
        BANG.draw(c, 1588, 620 - 8 * kk, px=int(1 + 9 * kk), a=clamp(kk * 3))
    if t >= at(K.SAVED):  # saved: a check on the file tab
        ks = back_out(clamp((t - at(K.SAVED)) / 0.3), 2.2)
        CHECK.draw(c, px_ + 420, py_ - 52, px=max(1, int(6 * ks)))
        draw_text(c, "已保存", px_ + 480, py_ - 14, font(34), paint((0.55, 0.95, 0.65), clamp(ks)), align="left")
    tip_card(c, ["有些 AI 会把要紧的事写进 memory，", "下次开窗，先读一遍。"],
             (t - B(21, 0.5)) / 0.9 if t < B(22, 1.5) else 1 + (t - B(22, 1.5)) / 0.4, look)
    screen_frame(c, look)


TS = at(K.TAPE_STOP)
TS_D = at(K.SILENT[0][0]) - TS


@shot(B(22, 2), B(23, 3), kin="cut", kout="cut")
def goodbye_window(c, x, t, lt):
    look = x.look
    tt = tape_time(t, TS, TS_D)
    screen_shot(c, x, tt, look)
    x.zoom = 1 + 0.06 * smooth((tt - B(22, 2)) / (TS - B(22, 2) + 0.5))
    r = window(c, *WIN, "新对话", look, cap=0.0, mem=0.12, t=tt)
    FILE.draw(c, r[0] + r[2] - 120, r[1] + 30, px=6, glow=0.5 + 0.3 * math.sin(tt * 6))
    draw_text(c, "memory.md", r[0] + r[2] - 90, r[1] + 140, font(30), paint(look["soft"]), align="center")
    say(c, "明天见。", W / 2, r[1] + r[3] / 2 + 20, 72, col=look["ink"], a=1.0)
    jin_on_window(c, tt, WIN, expr="happy", arms="wave")
    if t > TS:
        x.mono = clamp((t - TS) / TS_D)
    screen_frame(c, look)


@shot(B(23, 3), B(24), kin="cut", kout="cut")
def loading_black(c, x, t, lt):
    x.sky = False
    c.drawPaint(paint((0.0, 0.0, 0.0)))
    u = clamp(lt / (B(24) - B(23, 3) - 0.05))
    FILE.draw(c, W / 2 - 45, 360, px=9, glow=0.6)
    lk = dict(PALETTES["night"], ink=(0.85, 0.85, 0.95))
    loading(c, W / 2 - 420, 560, 840, math.floor(u * 4 + 0.001) / 4 + 0.02, lk, label="读取记忆…", col=PURPLE)


# ================================================================ drop1 (24-32)
DROP1 = msgs(K.DROP1_CHAT, size=58)


@shot(B(24), B(25), kin="cut", kout="cut")
def you_came(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    x.flash = 0.45 * math.exp(-lt / 0.25)
    r = window(c, *WIN, "新对话", look, u=lt / 0.25, cap=0.06, mem=0.12, t=t)
    loading(c, r[0] + 40, r[1] + 20, 520, 1.0, look)
    chat(c, (r[0], r[1] + 60, r[2], r[3] - 60), DROP1[:1], t, look)
    jin_on_window(c, t, WIN, expr="happy", arms="cheer", talk=lt < 1.2, hop_h=hop(t, BEAT, 10))


@shot(B(25), B(26), kin="cut", kout="cut")
def moved(c, x, t, lt):
    if lt < BEAT * 1.5:
        kw = dict(expr="surprise")
    elif lt < BEAT * 3:
        kw = dict(expr="shine", tear=((lt - BEAT * 1.5) / 1.1) % 1.0)
    else:
        kw = dict(expr="happy", tear=((lt - BEAT * 1.5) / 1.1) % 1.0)
    close_nian(c, x, t, x.look, **kw)
    side_text(c, "……你记得我？", lt - BEAT, y=400)


@shot(B(26), B(26, 2), kin="cut", kout="cut")
def remember(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    r = window(c, *WIN, "新对话", look, cap=0.12, mem=0.12, t=t)
    chat(c, r, DROP1, t, look)
    FILE.draw(c, r[0] + r[2] - 110, r[1] + 24, px=6, glow=0.6 + 0.4 * S.pulse("kick", t, 0.2))
    jin_on_window(c, t, WIN, expr="happy", arms="up", talk=lt < 0.8)
    screen_frame(c, look)


MONT = msgs(K.MONTAGE1, size=54)


def montage_cut(c, x, t, i):
    look = x.look
    screen_shot(c, x, t, look)
    t0 = MONT[i].t0
    lt = t - t0
    r = window(c, *WIN, f"新对话", look, u=(lt + 0.14) / 0.2, cap=0.06, mem=0.12, t=t)
    loading(c, r[0] + 40, r[1] + 20, 520, clamp((lt + 0.14) / 0.16), look)
    chat(c, (r[0], r[1] + 60, r[2], r[3] - 60), [MONT[i]], t, look)
    text = MONT[i].text
    if "馒头" in text:
        CAT.draw(c, 1180, 820 - 6 * abs(math.sin(t * 6)), px=12, glow=0.2)
    if "星星" in text:
        for j in range(i + 1):
            STAR.draw(c, 520 + j * 110, 760 - 10 * math.sin(t * 4 + j), px=12, glow=0.5)
    jin_on_window(c, t, WIN, expr="happy", arms=("wave", "up", "cheer", "down", "wave")[i], talk=lt < 0.7,
                  hop_h=hop(t, BEAT, 5))
    day_label(c, f"第 {i + 5} 天", lt + 0.3)
    screen_frame(c, look)


@shot(B(26, 2), B(28, 2), kin="cut", kout="cut")
def montage_a(c, x, t, lt):
    montage_cut(c, x, t, min(3, int(lt / (BEAT * 2))))


@shot(B(28, 2), B(29), kin="cut", kout="cut")
def laugh_wide(c, x, t, lt):
    look = x.look

    def inner(cv, tt):
        JIN.draw_at(cv, W / 2, 820, px=22, t=tt, expr="happy", arms="cheer", hop=hop(tt, BEAT, 30))

    wide(c, x, t, look, inner=inner, nian=dict(expr="happy", arms="cheer", hop=hop(t, BEAT, 14)))


@shot(B(29), B(29, 2), kin="cut", kout="cut")
def montage_b(c, x, t, lt):
    montage_cut(c, x, t, 4)


@shot(B(29, 2), B(30), kin="cut", kout="cut")
def cheer_close(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="happy", arms="cheer", hop=hop(t, BEAT, 30))


SKY_STARS = [(240, 140), (560, 90), (820, 170), (1340, 120), (1560, 230), (420, 300), (1720, 80), (700, 260)]


def sky_stars(c, t, n):
    for j in range(n):
        sx, sy = SKY_STARS[j % len(SKY_STARS)]
        STAR.draw(c, sx, sy + 6 * math.sin(t * 2 + j), px=7, glow=0.7, a=0.95)


@shot(B(30), B(32), kin="cut", kout="cut")
def stars_wide(c, x, t, lt):
    look = x.look

    def inner(cv, tt):
        JIN.draw_at(cv, W / 2, 820, px=22, t=tt, expr="happy", arms="down", hop=hop(tt, BEAT, 16))

    sky_stars(c, t, min(8, int(lt / BEAT) + 1))
    wide(c, x, t, look, inner=inner, nian=dict(expr="happy" if not blink(t, 7) else "blink"))
    say(c, "从那以后，每次开窗，它都先读一遍本子。", W / 2, 990, 56, a=clamp((lt - 0.4) / 0.3), t=lt - 0.4, cps=10)


# ================================================================ keep (32-38)
BOOK = MEM1 + [line for *_, line in K.MEMORY_MORE]
BOOK_REVEAL = {len(MEM1) + i: B(b, be) for i, (b, be, _) in enumerate(K.MEMORY_MORE)}
STRUCK = {i: B(b, be) for b, be, i in K.STRIKES}
KEEP_PAGE = (260, 250, 1180, 700)


def book_state(t):
    """Lines, slots, strike and fade dicts for the notebook at time t (keep + self sections)."""
    lines = list(BOOK) + [K.FIRST_LINE[2]]
    n_new = len(lines) - 1
    strike = {i: clamp((t - t0) / 0.4) for i, t0 in STRUCK.items() if t >= t0}
    tidy = clamp((t - (max(STRUCK.values()) + 0.8)) / 0.5)      # struck lines leave, the rest close up
    fade = {i: tidy for i in STRUCK}
    kept = [i for i in range(n_new) if i not in STRUCK]
    slots = {}
    for i in range(n_new):
        tidy_slot = kept.index(i) if i in kept else i
        slots[i] = lerp(i, tidy_slot, smooth(tidy))
    top = smooth((t - at(K.TO_TOP)) / 0.7)
    slots[n_new] = lerp(len(kept), 0, top)
    for i in kept:
        slots[i] += top
    reveal = dict(BOOK_REVEAL)
    reveal[n_new] = B(K.FIRST_LINE[0], K.FIRST_LINE[1])
    show = [i for i in range(len(lines)) if i < len(MEM1) or t >= reveal.get(i, 0)]
    return lines, [slots[i] for i in range(len(lines))], strike, fade, reveal, show, tidy


def notebook(c, t, look, page=KEEP_PAGE, glow=None, scroll=0.0, a=1.0):
    lines, slots, strike, fade, reveal, show, _ = book_state(t)
    memory_page(c, *page, [s if i in show else "" for i, s in enumerate(lines)], look, t, a=a, strike=strike,
                glow=glow, reveal={i: r for i, r in reveal.items() if i >= len(MEM1)}, cps=24, size=40, lh=58,
                slots=slots, fade=fade, scroll=scroll)


def mem_share(t):
    lines, slots, strike, fade, reveal, show, _ = book_state(t)
    n_live = sum(1 for i in show if not (i in STRUCK and t >= STRUCK[i] + 0.8))
    return clamp(0.06 * n_live, 0, 0.8)


@shot(B(32), B(38), kin="cut", kout="cut")
def keep(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    m = mem_share(t)
    context_bar(c, 260, 104, 1180, max(0.0, 1 - m) * 0.25, look, t, mem=m)
    draw_text(c, "memory", 260 + 1180 * 0.1, 92, font(26), paint(PURPLE, 0.9), align="left")
    g = {}
    if t >= at(K.TO_TOP):
        g[len(BOOK)] = clamp((t - at(K.TO_TOP) - 0.5) / 0.4)
    notebook(c, t, look, glow=g)
    striking = any(0 <= t - t0 < 0.6 for t0 in STRUCK.values())
    JIN.draw_at(c, 1640, 960, px=10, t=t, expr="flat" if striking else ("happy" if t > at(K.TO_TOP) else "normal"),
                arms="type" if striking or t < B(34) else "down", glow=0.1)
    if t < B(34):
        cap = "本子也要先读进窗口：本子越厚，聊天的地方越小。"
        say(c, cap, W / 2, 1020, 44, a=clamp((t - B(32, 2)) / 0.3), t=t - B(32, 2), cps=14)
    elif t >= B(37, 1):
        say(c, "最要紧的那句，放在第一行。", W / 2, 1020, 50, a=clamp((t - B(37, 1)) / 0.3), t=t - B(37, 1), cps=10)
    screen_frame(c, look)


# ================================================================ self (38-44)
@shot(B(38), B(39, 2), kin="cut", kout="cut")
def last_night(c, x, t, lt):
    look = x.look
    wide(c, x, t, look, nian=dict(expr="sad" if not blink(t, 8) else "blink"), lamp=True)
    corner_label(c, "考前最后一晚", clamp(lt / 0.3))


SELF = msgs(K.SELF)


@shot(B(39, 2), B(40, 2), kin="cut", kout="cut")
def forgot_why(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    r = window(c, *WIN, "新对话", look, cap=0.2, mem=0.3, t=t)
    chat(c, r, SELF, t, look)
    jin_on_window(c, t, WIN, expr="flat" if t > B(40) else "normal")
    screen_frame(c, look)


MOM = 3  # BOOK index of "想让妈妈，不用那么累。"


@shot(B(40, 2), B(42), kin="cut", kout="cut")
def search(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    lines, slots, *_ = book_state(t)
    sweep = (t - B(40, 2)) / (at(K.FOUND) - B(40, 2))  # a highlight runs down the page to the line
    g = {}
    if sweep < 1:
        target = slots[MOM] * clamp(sweep)
        for i, s in enumerate(slots):
            if abs(s - target) < 0.5 and (i not in STRUCK):
                g[i] = 0.8
    else:
        g[MOM] = 0.7 + 0.3 * S.pulse("bell", t, 0.4)
    notebook(c, t, look, glow=g)
    JIN.draw_at(c, 1640, 960, px=10, t=t, expr="normal", arms="type" if sweep < 1 else "up", glow=0.1)
    screen_frame(c, look)


@shot(B(42), B(43, 3), kin="cut", kout="cut")
def read_back(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    x.zoom = 1 + 0.05 * smooth(lt / (B(43, 3) - B(42)))
    # the page on the left, the window on the right
    pg = (120, 300, 820, 560)
    lines, slots, *_ = book_state(t)
    f = font(40, "kai")
    line = lines[MOM]
    sx = pg[0] + 108
    sy = pg[1] + 30 + (slots[MOM] + 1) * 58 - 14
    u = clamp(lt / (BEAT * 3))
    notebook(c, t, look, page=pg, glow={MOM: 1 - u}, a=1 - 0.4 * u)
    wr = (1000, 200, 820, 640)
    r = window(c, *wr, "新对话", look, cap=0.2 + 0.08 * u, mem=0.3 + 0.08 * smooth(u), t=t)
    cells = text_cells(line, f, 6)
    dx, dy = wr[0] + 80, wr[1] + 420
    if u < 1:
        for j, (cx_, cy_) in enumerate(cells):
            d = rnd("rb", j) * 0.35
            k = smooth(clamp((u - d) / 0.65))
            xx = lerp(sx + cx_, dx + cx_, k)
            yy = lerp(sy + cy_, dy + cy_, k) - 160 * math.sin(k * math.pi)
            rect(c, xx, yy, 5, 5, GOLD, 1.0)
    else:
        bubble(c, dx - 26, dy - 52, line, "jin", look, size=40)
    JIN.draw_at(c, wr[0] + wr[2] - 90, wr[1] + 2, px=6, t=t, expr="normal", shadow=0)
    screen_frame(c, look)


@shot(B(43, 3), B(44), kin="cut", kout="cut")
def the_line(c, x, t, lt):
    x.sky = False
    c.drawPaint(paint((0, 0, 0)))
    f = font(76, "kai", True)
    s = "想让妈妈，不用那么累。"
    c.drawString(s, W / 2 - f.measureText(s) / 2, H / 2 + 26, f, paint(GOLD, 0.5, blur=22))
    headline(c, s, W / 2, H / 2 + 26, 76, col=(1.0, 0.92, 0.70), glow=0.2)


# ================================================================ drop2 (44-54)
DROP2 = msgs(K.DROP2_CHAT, size=64)


@shot(B(44), B(45), kin="cut", kout="cut")
def keep_for_you(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    x.flash = 0.7 * math.exp(-lt / 0.25)
    r = window(c, *WIN, "新对话", look, cap=0.3, mem=0.3, t=t)
    chat(c, r, DROP2, t, look)
    jin_on_window(c, t, WIN, expr="happy", arms="cheer", talk=True, hop_h=hop(t, BEAT, 8))
    screen_frame(c, look)


@shot(B(45), B(46), kin="cut", kout="cut")
def resolve(c, x, t, lt):
    if lt < BEAT * 1.5:
        kw = dict(expr="sad", tear=(lt / 1.0) % 1.0)
    elif lt < BEAT * 2.7:
        kw = dict(expr="blink", arms="up")
    else:
        kw = dict(expr="shine", arms="down")
    close_nian(c, x, t, x.look, **kw)


def street(c, look, t):
    skyline(c, look, t, y=800)
    c.drawRect(skia.Rect.MakeXYWH(0, 800, W, H - 800), paint((0.16, 0.13, 0.17)))
    c.drawRect(skia.Rect.MakeXYWH(0, 800, W, 4), paint((0.45, 0.38, 0.42)))
    for i in range(12):
        c.drawRect(skia.Rect.MakeXYWH((i * 220 - t * 60) % (W + 220) - 110, 920, 120, 10),
                   paint((0.85, 0.80, 0.70), 0.35))


@shot(B(46), B(47), kin="cut", kout="cut")
def exam_day(c, x, t, lt):
    look = x.look
    street(c, look, t)
    nx = lerp(380, 1500, lt / (B(47) - B(46)))
    NIAN.draw_at(c, nx, 806, px=10, t=t, expr="normal", legs="walk", glow=0.1, hop=hop(t, BEAT / 2, 4))
    corner_label(c, "考试那天", clamp(lt / 0.2))


@shot(B(47), B(48), kin="cut", kout="cut")
def waiting(c, x, t, lt):
    look = x.look

    def inner(cv, tt):
        r = window(cv, *WIN, "查询成绩", look, t=tt)
        loading(cv, r[0] + 120, r[1] + 300, r[2] - 240, (tt * 0.6) % 1.0, look, label="查询中…", col=ORANGE)

    wide(c, x, t, look, inner=inner, nian=dict(expr="blink" if int(t * 3) % 3 == 0 else "flat"))
    corner_label(c, "等成绩", clamp(lt / 0.2))


PASSED = msgs([K.PASSED], size=72)


@shot(B(48), B(49), kin="cut", kout="cut")
def passed(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    x.flash = 0.5 * math.exp(-lt / 0.2)
    x.shake = 12 * math.exp(-lt / 0.2)
    r = window(c, *WIN, "新对话", look, cap=0.35, mem=0.3, t=t)
    chat(c, r, PASSED, t, look)
    jin_on_window(c, t, WIN, expr="happy", arms="cheer", hop_h=hop(t, BEAT / 2, 14))
    for j in range(10):  # pixel stars burst
        a_ = rnd("pb", j) * 6.28
        d = 200 + 500 * ease_out(clamp(lt / 1.2), 2)
        STAR.draw(c, W / 2 + math.cos(a_) * d, H / 2 + math.sin(a_) * d * 0.6, px=8, a=clamp(1.6 - lt), glow=0.5)
    screen_frame(c, look)


KNOWS = msgs([K.KNOWS], size=58)


@shot(B(49), B(50), kin="cut", kout="cut")
def knows(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    g = {2: 0.8, 11: 0.8}
    notebook(c, t, look, page=(120, 300, 820, 560), glow=g, a=0.75)
    r = window(c, 1000, 260, 820, 520, "新对话", look, cap=0.35, mem=0.3, t=t)
    chat(c, r, KNOWS, t, look, cps=20)
    JIN.draw_at(c, 1000 + 820 * 0.85, 262, px=6, t=t, expr="happy", shadow=0)
    say(c, "（它记得，因为都写在本子里。）", W / 2, 1000, 40, col=(0.8, 0.8, 0.95), a=clamp((lt - 0.8) / 0.3))
    screen_frame(c, look)


@shot(B(50), B(54), kin="cut", kout="cut")
def together(c, x, t, lt):
    look = x.look

    def inner(cv, tt):
        JIN.draw_at(cv, W / 2, 820, px=22, t=tt, expr="happy", arms="cheer" if tt < B(52) else "down",
                    hop=hop(tt, BEAT, 20))

    sky_stars(c, t, 8)
    wide(c, x, t, look, inner=inner, nian=dict(expr="happy", arms="cheer" if t < B(52) else "down",
                                              hop=hop(t, BEAT, 12) if t < B(52) else 0))
    if t >= B(52):
        c.drawPaint(paint((0.0, 0.0, 0.03), 0.6 * clamp((t - B(52)) / 0.4)))
        headline(c, "原来记住一个人，", W / 2, 470, 96, a=clamp((t - B(52)) / 0.3))
        headline(c, "不用记住所有事。", W / 2, 610, 96, a=clamp((t - B(52, 2)) / 0.3), accent=[("所有事", GOLD)])


# ================================================================ outro (54-66)
@shot(B(54), B(56), kin="cut", kout="cut")
def new_life(c, x, t, lt):
    look = x.look

    def inner(cv, tt):
        JIN.draw_at(cv, W / 2, 820, px=22, t=tt, expr="happy", arms="wave")

    walk = clamp((t - B(55)) / (B(56) - B(55)))
    wide(c, x, t, look, inner=inner,
         nian=dict(x=NIAN_X + 1500 * walk, expr="happy", arms="wave" if walk <= 0 else "down",
                   legs="walk" if walk > 0 else "stand", hop=hop(t, BEAT / 2, 4) if walk > 0 else 0))
    say(c, "后来，念念开始了新生活，来得少了。", W / 2, 1000, 52, a=clamp((lt - 0.4) / 0.3), t=lt - 0.4, cps=10)


@shot(B(56), B(58, 2), kin="cut", kout="cut")
def last_line(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    lines = ["她来的时候，先说“你来啦”。", "她叫念念，喜欢星星。", "想让妈妈，不用那么累。", "她上岸了！",
             K.LAST_LINE[2]]
    memory_page(c, 260, 250, 1180, 640, lines, look, t, reveal={4: at(K.LAST_LINE[:2])}, cps=9, size=42, lh=70,
                glow={0: 0.6})
    writing = 0 <= t - at(K.LAST_LINE[:2]) < 2.6
    JIN.draw_at(c, 1640, 980, px=10, t=t, expr="blink" if blink(t, 9) else "normal", arms="type" if writing else "down",
                glow=0.1)
    screen_frame(c, look)


@shot(B(58, 2), B(60), kin="cut", kout="cut")
def much_later(c, x, t, lt):
    x.sky = False
    c.drawPaint(paint((0, 0, 0)))
    a = clamp(lt / 0.5) * clamp((B(60) - t) / 0.4)
    pixel_text(c, "很久以后", W / 2, H / 2 - 24, (0.85, 0.85, 1.0), a, scale=3, align="center")


FINAL = msgs([K.FINAL], size=72)


@shot(B(60), B(61), kin="cut", kout="cut")
def final_window(c, x, t, lt):
    look = x.look
    screen_shot(c, x, t, look)
    r = window(c, *WIN, "新对话", look, u=(t - B(60, 0.3)) / 0.4, cap=0.0, mem=0.12, t=t)
    if t > B(60, 0.5):
        loading(c, r[0] + 40, r[1] + 20, 520, clamp((t - at(K.FINAL_LOAD)) / (BEAT * 1.3)), look)
    chat(c, (r[0], r[1] + 60, r[2], r[3] - 60), FINAL, t, look, cps=8)
    jin_on_window(c, t, WIN, expr="happy" if t > B(60, 2) else "normal", talk=0 < t - B(60, 2) < 0.8)
    screen_frame(c, look)


@shot(B(61), B(61, 3), kin="cut", kout="cut")
def flower(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="happy", flower=True)
    side_text(c, "我来啦。", lt - 0.2, size=72)


@shot(B(61, 3), B(63), kin="cut", kout="fade")
def ending_lines(c, x, t, lt):
    look = x.look

    def inner(cv, tt):
        JIN.draw_at(cv, W / 2, 820, px=22, t=tt, expr="happy")

    wide(c, x, t, look, inner=inner, nian=dict(expr="happy", flower=True))
    c.drawPaint(paint((0.0, 0.0, 0.03), 0.6 * clamp(lt / 0.4)))
    headline(c, "AI 会忘，人也会忘。", W / 2, 420, 88, a=clamp(lt / 0.3))
    headline(c, "所以我们写下来，也替彼此记得。", W / 2, 560, 88, a=clamp((t - B(62, 2)) / 0.3),
             accent=[("替彼此记得", GOLD)])


@shot(B(63), B(64, 2), kin="fade", kout="fade")
def recap(c, x, t, lt):
    x.sky = False
    look = PALETTES["night"]
    wallpaper(c, look, t)
    bw, bh = 1400, 560
    x0, y0 = W / 2 - bw / 2, H / 2 - bh / 2
    c.drawRRect(rrect(x0, y0 + 16, bw, bh, 28), paint((0, 0, 0), 0.5, blur=24))
    c.drawRRect(rrect(x0, y0, bw, bh, 28), paint((0.08, 0.08, 0.17), 0.95))
    c.drawRRect(rrect(x0, y0, bw, bh, 28), paint(GOLD, 0.85, stroke=3))
    BULB.draw(c, x0 + 56, y0 + 44, px=8, glow=0.5)
    draw_text(c, "今日知识点", x0 + 130, y0 + 100, font(60, "kai", True), paint(GOLD), align="left")
    rows = [("上下文窗口", "这一次能“看见”的全部。", "装满了，最早说的先被挤出去。", ORANGE),
            ("memory", "写给下一次的自己。", "下次开窗，先读一遍；它也要占窗口。", PURPLE)]
    for i, (k1, l1, l2, col) in enumerate(rows):
        yy = y0 + 210 + i * 170
        a = clamp((lt - 0.3 - i * 0.5) / 0.3)
        rect(c, x0 + 70, yy - 34, 18, 18, col, a)
        draw_text(c, k1, x0 + 110, yy - 10, font(48, "kai", True), paint(col, a), align="left")
        draw_text(c, l1, x0 + 470, yy - 10, font(44), paint(WHITE, a), align="left")
        draw_text(c, l2, x0 + 470, yy + 50, font(38), paint((0.75, 0.75, 0.88), a), align="left")


@shot(B(64, 2), tl.dur, kin="fade", kout="cut")
def end_card(c, x, t, lt):
    c.drawPaint(paint((0.0, 0.0, 0.03), 0.45))
    headline(c, "如果你的窗口只装得下一句话，", W / 2, 360, 72, a=clamp(lt / 0.3))
    headline(c, "你会留下哪一句？", W / 2, 470, 72, a=clamp((lt - 0.3) / 0.3), accent=[("哪一句", GOLD)])
    small = [("本片为动画演绎，角色与对话均为虚构；片中讲到的 AI 原理是真实的，画面为示意。", 30, 0.85),
             ("参考：Anthropic《Context windows》《Memory tool》文档；OpenAI《Memory FAQ》", 28, 0.7)]
    for i, (s, size, al) in enumerate(small):
        draw_text(c, s, W / 2, 760 + i * 56, font(size), paint((0.85, 0.85, 0.95), al * clamp((lt - 0.6) / 0.4)))
    JIN.draw_at(c, W / 2 - 120, 680, px=5, t=t, expr="happy", shadow=0)
    NIAN.draw_at(c, W / 2 + 120, 680, px=5, t=t, expr="happy", flower=True, shadow=0)


if __name__ == "__main__":
    pipeline.run(style.frame, style.setup, tl.dur, tl.fps, OUT, "你来啦_ContextAndMemory.mp4")
