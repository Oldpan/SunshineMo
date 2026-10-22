"""《我不知道》 (pixel_theater, episode 2): an AI that never says "I don't know" -- until it does.

A rainy-night detective story (noir) about hallucination.  Story 70%, explaining 30%: the next-word
bars become a board of suspects (it always points at one, even when they are all equally unlikely),
a paper that does not exist gets stamped 查无此文, search results become evidence tags [1][2], plus
three tip cards and a recap card.  Every time comes from cues.py, which music.py reads too; every
transition in cues.TRANS has its own sound on the beat.

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
from core.gfx import W, H, font, paint, clamp, lerp, smooth, ease_out, back_out, rnd, draw_text, rrect  # noqa: E402
from core.timeline import Timeline, Sync, tape_time, MASKS  # noqa: E402
from core.pixel import rect  # noqa: E402
from core import pipeline  # noqa: E402
from style import *  # noqa: E402,F401,F403
from scene import *  # noqa: E402,F401,F403
import cues as K  # noqa: E402

tl = Timeline(bpm=K.BPM, bars=K.BARS, sections=K.SECTIONS, hard_cuts=True)
B = tl.B
BEAT = tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))
KEY = {"quick": "case", "how": "case", "paper": "case", "fake": "rain", "learn": "case", "drop1": "solved",
       "turn": "case", "drop2": "solved", "outro": "dawn"}
LOOKS = {sec: NOIR[k] for sec, k in KEY.items()}
style = PixelTheater(tl, S, LOOKS, fast=("drop1", "drop2"), outro_fade=0.6, backdrop=Outside(), post_fx=post_fx,
                     grain=4.5)


def at(c):
    return B(c[0], c[1])


def msgs(lines, size=F_UI, gone=None):
    return chat_lines(lines, B, size, gone)


TR = {(b, be): kind for b, be, kind in K.TRANS}


def scene_shot(a, b, origin=None):
    """A shot from cue (bar, beat) a to b.  How it enters comes from cues.TRANS; if the next shot enters
    with a masked reveal this one holds underneath it, with a whip it whips out."""
    kin = TR.get(a, "cut") if a != (0, 0) else "cut"  # the opening iris is drawn by the shot (over the sky too)
    tin = K.TIN.get(kin, 0.0)
    nxt = TR.get(b)
    if nxt in MASKS:
        kout, tout = "hold", K.TIN[nxt]
    elif nxt == "whip":
        kout, tout = "whip", K.TIN["whip"]
    else:
        kout, tout = "cut", 0.0
    return tl.shot(at(a), at(b), tin=tin, tout=tout, kin=kin, kout=kout, origin=origin)


def punch(x, lt, amt=0.05):
    """Camera punch-in on a hard cut."""
    x.zoom = 1 + amt * math.exp(-lt / 0.12)


def push(x, lt, dur, amt=0.04):
    """Slow push-in over the shot."""
    x.zoom = 1 + amt * smooth(lt / dur)


# ---------------------------------------------------------------- geometry (screen space)
WIN = (300, 200, 1320, 830)          # the chat window; 今今 sits on its title bar
JIN_HEAD = (300 + 1320 * 0.88, 160)  # where its head is: lens transitions start there
MEETW = (150, 120, 1620, 690)        # video call window
SW = (330, 140, 1260, 820)           # search window
MWIN = (300, 280, 1320, 380)         # the compact window of the montage
CLOSE = (720, 900, 26)               # close-up: centre x, feet y, px


def on_window(c, t, win=WIN, px=7, hat=True, hop_h=0.0, x_off=0.88, tip=0.0, **kw):
    x, y, w, h = win
    jin_at(c, x + w * x_off, y + 2, px=px, hat=hat, hop=hop_h, tip=tip, t=t, shadow=0.0, **kw)


def close_nian(c, x, t, look, spot=None, light=0.85, **kw):
    x.sky = False
    x.letterbox = 1.0
    bokeh(c, look, t)
    cx, fy, px = CLOSE
    hp = kw.pop("hop", 0.0)
    nian_at(c, cx, fy, px=px, t=t, glow=0.1, hop=hp, **kw)
    blind_light(c, t, light, angle=-24, period=64, drift=14)
    if spot:
        spotlight(c, *spot)


def side_text(c, s, lt, y=420, size=64, col=(1.0, 0.92, 0.84), cps=9.0):
    say(c, s, 1420, y, size, col, clamp(lt / 0.2), t=lt, cps=cps)


def newest_bubble(r, ms, t, size=F_UI):
    """(right edge x, centre y) of the newest message's bubble if it is 今今's, else None."""
    live = [m for m in ms if t >= m.t0]
    if not live or live[-1].who != "jin":
        return None
    m = live[-1]
    x, y, w, h = r
    f = font(m.size)
    tw = max(f.measureText(L) for L in m.text.split("\n"))
    top = y + h - 18 - m.height()
    return x + 96 + tw + m.size * 1.1, top + m.height() / 2 - 6


# ---------------------------------------------------------------- whole-film switches
def lightning(t):
    v = 0.0
    for c_ in K.LIGHTNING:
        dt = t - at(c_)
        if 0 <= dt < 1.0:
            v += math.exp(-dt / 0.07) + (0.8 * math.exp(-(dt - 0.16) / 0.1) if dt > 0.16 else 0)
    return min(1.0, v)


@tl.shot(0, tl.dur, kin="cut", kout="cut")
def film(c, x, t, lt):
    x.rain_key = KEY[tl.section_at(t)]
    x.lightning = lightning(t)
    x.letterbox = 0.0


# ================================================================ quick (0-6)
QUICK = msgs(K.QUICK)


def quick_ui(c, t, look, ms=QUICK, open_at=B(1), tip_at=None):
    u = (t - open_at) / 0.45
    r = window(c, *WIN, "新对话", look, u=u, t=t)
    if u <= 0.3:
        return r
    chat(c, r, ms, t, look)
    talk = any(m.who == "jin" and 0 <= t - m.t0 < 0.8 for m in ms)
    tip = clamp((t - tip_at) / 0.6) if tip_at is not None and t >= tip_at else 0.0
    on_window(c, t, expr="happy" if talk else ("blink" if blink(t) else "normal"),
              arms="wave" if t < B(2) else ("up" if talk else "down"), talk=talk,
              hop_h=hop(t, BEAT, 4) if talk else 0, tip=tip)
    nb = newest_bubble(r, ms, t)
    for i in K.CHECKS:
        m = ms[i] if i < len(ms) else None
        tc = B(K.QUICK[i][0], K.QUICK[i][1] + 0.5)
        if nb and m is not None and live_last(ms, t) is m and t >= tc:
            k = back_out(clamp((t - tc) / 0.25), 2.4)
            CHECK.draw(c, nb[0] + 10, nb[1] - 24 * k, px=max(1, int(8 * k)), glow=0.4)
    return r


def live_last(ms, t):
    live = [m for m in ms if t >= m.t0]
    return live[-1] if live else None


@scene_shot((0, 0), (2, 0), origin=(MON[0], MON[1]))
def open_office(c, x, t, lt):
    look = x.look
    x.letterbox = 1.0
    push(x, lt, B(2), 0.03)
    office(c, x, t, look, inner=lambda cv, tt: quick_ui(cv, tt, look))
    nian_at(c, NIAN_X, DESK_Y + 2, px=9, t=t, expr="blink" if blink(t, 1) else ("happy" if t > B(1, 2) else "normal"),
            arms="type" if B(1, 3) < t < B(2) else "down", glow=0.12)
    s = K.TYPED[0][2]
    t0 = at(K.TYPED[0][:2])
    a = clamp((B(2) - 0.15 - t) / 0.3)
    if t >= t0 - 0.05:
        label(c, s, W / 2, 960, 52, n=typed_n(t, t0, BEAT, s), a=a, seed=1)
    if t < B(1, 3):
        label(c, "动画演绎", 210, 150, 30, a=clamp((B(1, 3) - t) / 0.5), tape=False, seed=2)
    iris_close(c, 1 - lt / K.OPEN_IRIS, MON[0], MON[1])


@scene_shot((2, 0), (4, 2))
def quick_screen(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    punch(x, lt, 0.04)
    quick_ui(c, t, look)
    end_screen(c, x, t, look)


@scene_shot((4, 2), (5, 0))
def wow(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="shine", blush=True, hop=hop(t, BEAT, 14))
    punch(x, lt, 0.05)
    for j in range(3):
        k = back_out(clamp((lt - j * 0.08) / 0.3), 2.4)
        STAR.draw(c, 1080 + 120 * j, 330 - 60 * (j % 2) - 10 * math.sin(t * 4 + j), px=max(1, int(12 * k)), glow=0.6)
    side_text(c, "你好厉害！", lt - 0.1)


@scene_shot((5, 0), (6, 0))
def hat_tip(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    punch(x, lt, 0.04)
    quick_ui(c, t, look, tip_at=B(5, 1))
    end_screen(c, x, t, look)


# ================================================================ how (6-12)
HOW = msgs(K.QUICK[-2:] + K.HOW_ASK)


@scene_shot((6, 0), (7, 0))
def how_ask(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    r = window(c, *WIN, "新对话", look, t=t)
    chat(c, r, HOW, t, look)
    eager = t >= at(K.HOW_ASK[1][:2])
    on_window(c, t, expr="happy" if eager else "normal", arms="cheer" if eager else "down", talk=eager,
              hop_h=hop(t, BEAT / 2, 10) if eager else 0)
    end_screen(c, x, t, look)


BOARD_X, BOARD_Y, BOARD_W = 210, 330, 1500


def board_scene(c, x, t, look, rounds, jin_x=1640, flat=False):
    """Cork board with the sentence strip and one round of suspects at a time."""
    x.sky = False
    x.letterbox = 1.0
    corkboard(c, look, t)
    live = [(roll, sent) for roll, sent in rounds if t >= at(roll) - 0.3]
    roll, sent = live[-1] if live else rounds[0]
    prefix, words, probs, pick = sent
    u = (t - at(roll)) / (K.PICK_DELAY * BEAT)
    fly = clamp((u - 1.05) / 0.3)
    bx, by = sentence(c, prefix, words[pick] if fly >= 1 else "", W / 2, 230, 58, u=(u - 1.35) * 2)
    p = suspects(c, BOARD_X, BOARD_Y, words, probs, max(0.0, u), look, pick=pick, t=t, w=BOARD_W)
    if p is not None and 0 < fly < 1:  # the picked word flies up into the blank
        k = smooth(fly)
        fx_, fy_ = lerp(p[0], bx, k), lerp(p[1], by, k) - 120 * math.sin(k * math.pi)
        draw_text(c, words[pick], fx_, fy_ + 20, font(lerp(70, 58, k), "kai", True), paint(THREAD))
    pointing = u > 0.8
    jin_at(c, jin_x, 1000, px=9, t=t, expr=("flat" if flat and u < 1 else "happy") if pointing else "normal",
           arms="up" if pointing else "down", glow=0.12)
    if p is not None:
        thread(c, (jin_x - 60, 900), p, clamp((u - 1.0) / 0.25), seed=hash(prefix) % 97)
    if flat and 0.3 < u < 1.2:
        QMARK.draw(c, jin_x + 30, 780 - 8 * math.sin(t * 5), px=8, glow=0.3)
    return u


@scene_shot((7, 0), (11, 0), origin=JIN_HEAD)
def brain(c, x, t, lt):
    look = x.look
    board_scene(c, x, t, look, [(K.ROLL1, K.SENT1), (K.ROLL2, K.SENT2)])
    tip_card(c, ["它是一个字一个字往下写的：", "每一步，挑一个最可能接得上的。"],
             tip_phase(t, B(9, 0), B(10, 3)), look, y=640)


@scene_shot((11, 0), (12, 0))
def magic(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="surprise" if lt < BEAT else "happy", arms="up" if lt > BEAT else "down")
    punch(x, lt, 0.05)
    side_text(c, "好像变魔术！", lt - 0.2)
    for j in range(5):
        k = clamp((lt - 0.1 * j) / 0.4)
        STAR.draw(c, 400 + 200 * j, 260 - 120 * ease_out(k) + 20 * (j % 2), px=7, a=clamp(1.6 - lt), glow=0.6)


# ================================================================ paper (12-18)
PAPER_MS = msgs(K.PAPER)


@scene_shot((12, 0), (13, 0))
def review_night(c, x, t, lt):
    look = x.look
    x.letterbox = 1.0
    push(x, lt, tl.bar, 0.03)

    def inner(cv, tt):
        r = window(cv, *WIN, "新对话", look, t=tt)
        chat(cv, r, PAPER_MS[:1], tt, look)
        on_window(cv, tt, expr="normal")

    office(c, x, t, look, inner=inner)
    nian_at(c, NIAN_X, DESK_Y + 2, px=9, t=t, expr="normal", arms="type", glow=0.12)
    s = K.TYPED[1][2]
    label(c, s, W / 2, 960, 46, n=typed_n(t, at(K.TYPED[1][:2]), BEAT, s), seed=3)


@scene_shot((13, 0), (15, 0), origin=(MON[0], MON[1]))
def brain_flat(c, x, t, lt):
    look = x.look
    board_scene(c, x, t, look, [(K.ROLL3, K.SENT3), (K.ROLL4, K.SENT4)], flat=True)
    card(c, 1560, 120, 260, 120, ["线索：", "没有"], rot=4, size=34, fill=MANILA, seed=4)


STAMP_AT = {s: at((b, be)) for b, be, s in K.STAMPS}


@scene_shot((15, 0), (16, 2))
def confident(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    r = window(c, *WIN, "新对话", look, t=t)
    chat(c, r, PAPER_MS, t, look, cps=26)
    on_window(c, t, expr="happy", arms="up" if t < B(16) else "down", talk=lt < 1.2, tip=clamp((t - B(15, 2)) / 0.6))
    du = t - STAMP_AT["已确认"]
    stamp(c, "已确认", 1260, 470, du, size=90, rot=-14, seed=1)
    if du >= 0:
        x.shake = 14 * math.exp(-du / 0.12)
    end_screen(c, x, t, look)


def slide(cv, tt, look):
    """The group-meeting slide with the made-up reference."""
    x0, y0, w, h = 200, 120, 1520, 840
    cv.drawRRect(rrect(x0, y0 + 14, w, h, 18), paint((0, 0, 0), 0.4, blur=20))
    cv.drawRRect(rrect(x0, y0, w, h, 18), paint((0.98, 0.97, 0.94)))
    cv.drawRect(skia.Rect.MakeXYWH(x0, y0, w, 120), paint((0.30, 0.34, 0.48)))
    draw_text(cv, "睡眠与记忆 · 文献综述", x0 + 60, y0 + 80, font(56, "cjk", True), paint(WHITE), align="left")
    draw_text(cv, "参考文献", x0 + 60, y0 + 240, font(52, "cjk", True), paint(INK), align="left")
    draw_text(cv, "[1] 林某 等（2019）。睡眠与记忆的三阶段模型。", x0 + 60, y0 + 350, font(46), paint(INK), align="left")
    draw_text(cv, "     《脑与学习》，第 87 页。", x0 + 60, y0 + 420, font(46), paint(INK), align="left")
    hand_marker(cv, x0 + 50, x0 + 1150, y0 + 334, 50, 1.0, GOLD, 0.35, seed="sl")


@scene_shot((16, 2), (18, 0))
def slide_night(c, x, t, lt):
    look = x.look
    x.letterbox = 1.0
    sx, sy, sw, sh = office(c, x, t, look, inner=lambda cv, tt: slide(cv, tt, look))
    nian_at(c, NIAN_X, DESK_Y + 2, px=9, t=t, expr="happy", arms="cheer", hop=hop(t, BEAT, 12), glow=0.12)
    s = K.TYPED[2][2]
    t0 = at(K.TYPED[2][:2])
    if t >= t0 - 0.05:
        label(c, s, W / 2, 960, 46, n=typed_n(t, t0, BEAT, s), seed=5)
    b, be, d = K.IRIS_CLOSE[0]
    iris_close(c, (t - B(b, be)) / d, sx + sw * (260 / W), sy + sh * (470 / H))


# ================================================================ fake (18-24)
T1 = msgs(K.TEACHER_1)


def meeting_scene(c, x, t, look, lines, speak=None, nian_kw=None, teacher_kw=None, size=46):
    tiles = [("导师", lambda cv, cx, by, px: TEACHER.draw_at(cv, cx, by, px=px, t=t, glow=0.1, **(teacher_kw or {}))),
             ("念念", lambda cv, cx, by, px: NIAN.draw_at(cv, cx, by, px=px, t=t, glow=0.1, **(nian_kw or {})))]
    rects = meeting(c, *MEETW, look, t, tiles, title_="组会", speaking=speak)
    for who, idx in (("teacher", 0), ("nian", 1)):
        mine = [m for m in lines if m.who == who and t >= m.t0]
        if mine and rects:
            m = mine[-1]
            tx, ty, tw, th = rects[idx]
            f = font(size)
            bw = max(f.measureText(L) for L in m.text.split("\n")) + size * 1.1
            bubble(c, tx + tw / 2 - bw / 2, MEETW[1] + MEETW[3] + 26, m.text, "teacher" if who == "teacher" else "nian",
                   look, t=t - m.t0, cps=18, size=size)
    return rects


@scene_shot((18, 0), (20, 0))
def not_found_meeting(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    speak = 0 if t < at(K.TEACHER_1[1][:2]) else 1
    meeting_scene(c, x, t, look, T1, speak=speak,
                  nian_kw=dict(expr="surprise" if t > at(K.TEACHER_1[0][:2]) + 1.0 else "happy",
                               talk=speak == 1 and lt > 2.6),
                  teacher_kw=dict(expr="flat" if t > at(K.TEACHER_1[0][:2]) else "normal",
                                  talk=speak == 0 and t > at(K.TEACHER_1[0][:2])))
    x.flash = 0.25 * x.lightning
    end_screen(c, x, t, look)


QUERY1 = "林某 2019 睡眠与记忆的三阶段模型"


@scene_shot((20, 0), (21, 0))
def search_empty(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    search_window(c, *SW, QUERY1, [], look, t - at(K.SEARCH1), t=t, type_d=K.SEARCH_TYPE, wait=K.SEARCH_WAIT,
                  empty="没有找到这篇论文。")
    du = t - STAMP_AT["查无此文"]
    stamp(c, "查无此文", W / 2, 640, du, size=130, rot=-10, seed=2)
    if du >= 0:
        x.shake = 22 * math.exp(-du / 0.12)
        x.chroma = 5 * math.exp(-du / 0.2)
    end_screen(c, x, t, look)


WHY = msgs(K.WHY)


@scene_shot((21, 0), (22, 2))
def why(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    r = window(c, *WIN, "新对话", look, t=t)
    chat(c, r, WHY, t, look)
    hurt = t >= at(K.WHY[1][:2])
    on_window(c, t, hat=False, expr="sad" if hurt else "surprise", talk=hurt and lt > 1.3)
    x.flash = 0.3 * x.lightning
    droplets(c, t, 0, 0, W, H, a=0.6, seed=8, n=40)
    end_screen(c, x, t, look)


FAKE_CARDS = [  # (x, y, w, h, lines, rot): the clues of the made-up paper
    (220, 200, 420, 200, ["作者", "林某 等"], -4), (760, 160, 520, 200, ["题目", "睡眠与记忆的三阶段模型"], 3),
    (1360, 230, 380, 200, ["期刊", "《脑与学习》"], -2), (640, 560, 360, 200, ["页码", "第 87 页"], 5),
]


@scene_shot((22, 2), (24, 0))
def clues_fall(c, x, t, lt):
    look = x.look
    x.sky = False
    x.letterbox = 1.0
    corkboard(c, look, t, a=0.9)
    pts = []
    for i, (cx, cy, w, h, lines, rot) in enumerate(FAKE_CARDS):
        tf = at(K.FALLS[i])
        dt = t - tf
        yy, rr = cy, rot
        if dt > 0:  # the pin pops, the card falls and spins
            yy = cy + 0.5 * 2600 * dt * dt
            rr = rot + 160 * dt * (1 if i % 2 else -1)
        if yy < H + 200:
            pts.append(card(c, cx, yy, w, h, lines, rot=rr, size=40, seed=i, pin_pop=1.0 if dt <= 0 else 0.0))
        else:
            pts.append(None)
        if dt > 0 and dt < 0.4:  # the pin flies off
            pin(c, cx + w / 2 + 300 * dt, cy + 14 - 400 * dt + 1200 * dt * dt, pop=1.0)
    for i in range(len(FAKE_CARDS) - 1):
        a_, b_ = FAKE_CARDS[i], FAKE_CARDS[i + 1]
        cut_ = min(at(K.FALLS[i]), at(K.FALLS[i + 1]))
        if t < cut_:
            thread(c, (a_[0] + a_[2] / 2, a_[1] + 14), (b_[0] + b_[2] / 2, b_[1] + 14), 1.0, seed=i)
        elif t < cut_ + 0.25:  # snapped: the two halves whip apart
            k = (t - cut_) / 0.25
            mx, my = (a_[0] + a_[2] / 2 + b_[0] + b_[2] / 2) / 2, (a_[1] + b_[1]) / 2 + 14
            thread(c, (a_[0] + a_[2] / 2, a_[1] + 14), (lerp(mx, a_[0] + a_[2] / 2, k), my + 200 * k), 1 - k, seed=i)
    jin_at(c, 1640, 1000, px=9, t=t, hat=False, expr="sad", glow=0.1)
    tip_card(c, ["不知道的时候，它也可能照样往下写。", "写得很通顺，却不是真的——这叫“幻觉”。"],
             tip_phase(t, B(22, 3), B(23, 3)), look, y=560)


# ================================================================ learn (24-30)
@scene_shot((24, 0), (25, 0))
def alone(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    r = window(c, *WIN, "新对话", look, t=t)
    draw_text(c, "念念 已下线", W / 2, r[1] + r[3] - 60, font(34), paint(look["soft"], 0.9))
    on_window(c, t, hat=False, expr="sad" if not blink(t, 5) else "blink")
    HAT.draw(c, WIN[0] + WIN[2] * 0.6, WIN[1] + WIN[3] - 70, px=7)
    end_screen(c, x, t, look)


MEM = [line for *_, line in K.NEW_MEMORY] + K.OLD_MEMORY
MEM_REVEAL = {i: B(b, be) for i, (b, be, _) in enumerate(K.NEW_MEMORY)}
PAGE = (300, 250, 1080, 600)


@scene_shot((25, 0), (29, 0))
def write_rule(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    push(x, lt, B(29) - B(25), 0.04)
    px_, py_, pw, ph = PAGE
    shown = [s if i >= 2 or t >= MEM_REVEAL[i] else "" for i, s in enumerate(MEM)]
    memory_page(c, px_, py_, pw, ph, shown, look, t, reveal=MEM_REVEAL, glow={0: clamp((t - B(26)) / 0.4) * 0.7})
    writing = any(0 <= t - t0 < 1.4 for t0 in MEM_REVEAL.values())
    jin_at(c, 1600, 900, px=10, t=t, hat=False, expr="normal" if not blink(t, 6) else "blink",
           arms="type" if writing else "down", glow=0.1)
    if t >= at(K.IDEA):
        kk = clamp((t - at(K.IDEA)) / 0.2) * clamp((B(25, 3) - t) / 0.3)
        BANG.draw(c, 1588, 620 - 8 * kk, px=int(1 + 9 * kk), a=clamp(kk * 3))
    if t >= at(K.SAVED):
        ks = back_out(clamp((t - at(K.SAVED)) / 0.3), 2.2)
        CHECK.draw(c, px_ + 420, py_ - 52, px=max(1, int(6 * ks)))
        draw_text(c, "已保存", px_ + 480, py_ - 14, font(34), paint((0.55, 0.95, 0.65), clamp(ks)), align="left")
    end_screen(c, x, t, look)
    tip_card(c, ["允许它说“我不知道”，让它先查、再答、给出处，", "能减少幻觉，但没法完全消除。"],
             tip_phase(t, B(27, 2), B(28, 3)), look)


TS = at(K.TAPE_STOP)
TS_D = at(K.SILENT[0][0]) - TS


@scene_shot((29, 0), (29, 3))
def see_you(c, x, t, lt):
    look = x.look
    tt = tape_time(t, TS, TS_D)
    screen(c, x, tt, look)
    r = window(c, *WIN, "新对话", look, t=tt)
    FILE.draw(c, r[0] + r[2] - 120, r[1] + 30, px=6, glow=0.5 + 0.3 * math.sin(tt * 6))
    say(c, "明天见。", W / 2, r[1] + r[3] / 2 + 20, 72, col=look["ink"])
    on_window(c, tt, expr="happy", arms="wave", tip=clamp((tt - B(29, 0.3)) / 0.8))
    if t > TS:
        x.mono = clamp((t - TS) / TS_D)
    end_screen(c, x, tt, look)
    b, be, d = K.IRIS_CLOSE[1]
    iris_close(c, (t - B(b, be)) / d, JIN_HEAD[0], JIN_HEAD[1] + 30)


@scene_shot((29, 3), (30, 0))
def loading_black(c, x, t, lt):
    x.sky = False
    c.drawPaint(paint((0.0, 0.0, 0.0)))
    u = clamp(lt / (B(30) - B(29, 3) - 0.05))
    FILE.draw(c, W / 2 - 45, 360, px=9, glow=0.6)
    lk = dict(NOIR["case"], ink=(0.85, 0.85, 0.95))
    loading(c, W / 2 - 420, 560, 840, math.floor(u * 4 + 0.001) / 4 + 0.02, lk, label="读取记忆…", col=PURPLE)


# ================================================================ drop1 (30-38)
DROP1 = msgs(K.DROP1_CHAT, size=58)


@scene_shot((30, 0), (31, 0))
def not_sure(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    x.flash = 0.5 * math.exp(-lt / 0.25)
    punch(x, lt, 0.06)
    r = window(c, *WIN, "新对话", look, u=lt / 0.25, t=t)
    loading(c, r[0] + 40, r[1] + 20, 520, clamp(lt / 0.2), look)
    chat(c, (r[0], r[1] + 60, r[2], r[3] - 60), DROP1, t, look)
    on_window(c, t, expr="normal" if t < at(K.DROP1_CHAT[2][:2]) else "happy", arms="up" if lt > BEAT * 2.5 else "down",
              talk=lt > BEAT * 0.8, hop_h=hop(t, BEAT, 6) if lt > BEAT * 2.5 else 0)
    if lt > BEAT * 2.5:
        MAG.draw(c, JIN_HEAD[0] - 130, JIN_HEAD[1] - 20 + 8 * math.sin(t * 5), px=8, glow=0.3)
    end_screen(c, x, t, look)


QUERY2 = "睡眠 记忆 综述"


@scene_shot((31, 0), (32, 2), origin=(SW[0] + 130, SW[1] + 130))
def search_real(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    search_window(c, *SW, QUERY2, K.RESULTS, look, t - at(K.SEARCH2), t=t, type_d=K.SEARCH_TYPE,
                  wait=K.SEARCH_WAIT)
    jin_at(c, SW[0] + SW[2] * 0.88, SW[1] + 2, px=7, t=t, expr="happy", arms="up", shadow=0, hop=hop(t, BEAT, 4))
    MAG.draw(c, SW[0] + SW[2] * 0.88 - 120, SW[1] - 110 + 6 * math.sin(t * 5), px=7, glow=0.3)
    end_screen(c, x, t, look)


@scene_shot((32, 2), (33, 0))
def oh(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="surprise" if lt < BEAT * 0.8 else "happy", mag=True, light=0.5)
    punch(x, lt, 0.05)


MONT = msgs(K.MONTAGE, size=54)


def montage_shot(i):
    a = K.MONTAGE[i][:2]
    b = K.MONTAGE[i + 1][:2] if i + 1 < len(K.MONTAGE) else (36, 0)

    @scene_shot(a, b)
    def _m(c, x, t, lt):
        look = x.look
        screen(c, x, t, look)
        punch(x, lt, 0.035)
        r = window(c, *MWIN, "新对话", look, t=t)
        chat(c, r, [MONT[i]], t, look)
        text = MONT[i].text
        unsure = "不" in text
        on_window(c, t, win=MWIN, expr="flat" if unsure and i != K.HEART_FOR else "happy",
                  arms=("up", "wave", "down", "down", "up", "down")[i], talk=lt < 0.7, hop_h=hop(t, BEAT, 4))
        if "[" in text:  # the evidence it found, pinned beside the answer
            for j in range(text.count("[")):
                k = back_out(clamp((lt - 0.25 - 0.12 * j) / 0.25), 2.2)
                card(c, 1180 + j * 260, 720 + 30 * j, 230, 170, [f"证据 [{j + 1}]", "已核对"], rot=6 - 8 * j, size=36,
                     fill=MANILA, seed=(i, j), pin_pop=k, a=clamp(k * 2))
        if i == K.HEART_FOR:
            th = B(*K.MONTAGE[i][:2]) + BEAT
            k = back_out(clamp((t - th) / 0.3), 2.4)
            if t >= th:
                HEART.draw(c, 1300, 720 - 30 * k, px=max(1, int(16 * k)), glow=0.5)
                NIAN.draw_at(c, 1460, 960, px=9, t=t, expr="happy", arms="up", shadow=0)
        label(c, f"第 {i + 2} 天", 200, 120, 32, tape=False, seed=10 + i)
        end_screen(c, x, t, look)
    return _m


for _i in range(len(K.MONTAGE)):
    montage_shot(_i)

EVIDENCE = [  # (x, y, w, h, lines, rot)
    (200, 170, 360, 190, ["[1]", "综述（2021）"], -3), (640, 140, 360, 190, ["[2]", "教材第 6 章"], 2),
    (1080, 190, 360, 190, ["原文", "第 3 段"], -2), (1500, 150, 300, 190, ["问导师", "已问过"], 4),
    (420, 470, 380, 190, ["我不确定", "→ 一起查"], 3), (1000, 480, 420, 190, ["先查，再答", "给出处"], -4),
]


@scene_shot((36, 0), (38, 0))
def evidence_board(c, x, t, lt):
    look = x.look
    x.sky = False
    x.letterbox = 1.0
    push(x, lt, B(38) - B(36), 0.03)
    corkboard(c, look, t)
    pins = []
    for i, (cx, cy, w, h, lines, rot) in enumerate(EVIDENCE):
        tp = at(K.PINS[i])
        if t < tp - 0.1:
            pins.append(None)
            continue
        k = clamp((t - tp + 0.1) / 0.1)
        drop = (1 - ease_out(k, 3)) * -60
        pins.append(card(c, cx, cy + drop, w, h, lines, rot=rot, size=40, fill=MANILA if i < 2 else PAPER, seed=i,
                         pin_pop=clamp((t - tp) / 0.12), a=k))
    for i in range(len(pins) - 1):  # the thread runs to each new card as it goes up
        if pins[i] and pins[i + 1]:
            thread(c, pins[i], pins[i + 1], clamp((t - at(K.PINS[i + 1])) / 0.25), seed=20 + i)
    jin_at(c, 760, 1010, px=10, t=t, expr="happy", arms="cheer", hop=hop(t, BEAT, 14), glow=0.1)
    nian_at(c, 1160, 1010, px=10, t=t, expr="happy", arms="cheer", hop=hop(t + BEAT / 2, BEAT, 14), glow=0.1, mag=True)
    label(c, "它答得慢了一点，但每一句，都有出处。", W / 2, 790, 42, a=clamp((t - B(36, 2)) / 0.3), seed=11)


# ================================================================ turn (38-44)
T2 = msgs(K.TEACHER_2)


@scene_shot((38, 0), (39, 2))
def meeting2(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    asked = t >= at(K.TEACHER_2[0][:2])
    meeting_scene(c, x, t, look, T2, speak=0 if asked else None,
                  nian_kw=dict(expr="surprise" if t > at(K.TEACHER_2[0][:2]) + 1.4 else "normal"),
                  teacher_kw=dict(expr="normal", talk=asked and lt < 3.2))
    s = K.TYPED[3][2]
    label(c, s, 290, 100, 34, n=typed_n(t, at(K.TYPED[3][:2]), BEAT, s), seed=12)
    end_screen(c, x, t, look)


@scene_shot((39, 2), (40, 0))
def caught(c, x, t, lt):
    r = lerp(1100, 760, smooth(lt / (B(40) - B(39, 2))))
    close_nian(c, x, t, x.look, expr="surprise", spot=(CLOSE[0], 600, r, 0.9), light=0.4)


def her_suspects(c, t, u, hover):
    suspects(c, 240, 190, K.SENT5[1], K.SENT5[2], u, PALETTES["night"], pick=None, t=t, w=1440, gap=36,
             hover=hover, title_="她的“嫌疑人名单”")


@scene_shot((40, 0), (42, 0))
def tempted(c, x, t, lt):
    look = x.look
    x.sky = False
    x.letterbox = 1.0
    bokeh(c, look, t)
    cx, fy, px = CLOSE[0], 1000, 22
    talking = t >= at(K.TEMPTED)
    NIAN.draw_at(c, 960, fy, px=18, t=t, expr="normal" if not blink(t, 3) else "blink", talk=talking, glow=0.1)
    u = (t - at(K.ROLL5)) / (K.PICK_DELAY * BEAT)
    hv = None
    if u > 1.0:
        speed = 3.0 if not talking else 7.0
        hv = 1.5 + 1.45 * math.sin((t - at(K.ROLL5)) * speed)
    spotlight(c, 960, 620, 900, 0.8)
    her_suspects(c, t, min(u, 1.0), hv)


@scene_shot((42, 0), (42, 2))
def remember(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    x.flash = 0.5 * math.exp(-lt / 0.2)
    memory_page(c, 300, 300, 1320, 400, MEM[:2], look, t, glow={0: 1.0}, size=56, lh=96)
    end_screen(c, x, t, look)


@scene_shot((42, 2), (44, 0))
def breath(c, x, t, lt):
    tt = min(t, at(K.SILENT[1][0]))
    k = smooth((tt - B(42, 2)) / (at(K.SILENT[1][0]) - B(42, 2)))
    x.zoom = 1 + 0.12 * k
    close_nian(c, x, tt, x.look, expr="normal" if not blink(tt, 4) else "blink", spot=(CLOSE[0], 560, lerp(760, 330, k), 1.0),
               light=0.3)


# ================================================================ drop2 (44-54)
ANS = msgs(K.ANSWER, size=58)


@scene_shot((44, 0), (46, 0))
def i_dont_know(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    x.flash = 0.6 * math.exp(-lt / 0.25)
    punch(x, lt, 0.06)
    tiles = [("导师", lambda cv, cx, by, px: TEACHER.draw_at(cv, cx, by, px=px, t=t, glow=0.1,
                                                         expr="surprise" if lt < BEAT * 4 else "normal")),
             ("念念", lambda cv, cx, by, px: NIAN.draw_at(cv, cx, by, px=px, t=t, glow=0.1, talk=True,
                                                         expr="normal" if lt < BEAT * 2 else "happy"))]
    meeting(c, 360, 70, 1200, 470, look, t, tiles, title_="组会", speaking=1)
    chat(c, (300, 560, 1320, 470), ANS, t, look)
    end_screen(c, x, t, look)


@scene_shot((46, 0), (47, 0))
def very_good(c, x, t, lt):
    look = x.look
    x.sky = False
    x.letterbox = 1.0
    bokeh(c, look, t)
    gl = 0 <= t - (at(K.GLINT) + 0.5) < 0.25
    TEACHER.draw_at(c, 760, 920, px=24, t=t, expr="happy" if lt > 0.3 else "normal", glint=gl, glow=0.1)
    if gl:
        k = (t - (at(K.GLINT) + 0.5)) / 0.25
        for ex in (8, 18):
            gx, gy = 760 - 14 * 24 + (ex + 2) * 24, 920 - 18 * 24 + 4 * 24
            c.drawCircle(gx, gy, 60 * math.sin(k * math.pi), paint(WHITE, 0.6, blur=10))
    blind_light(c, t, 0.6, angle=-24, period=64, drift=14)
    side_text(c, "很好。", lt - 0.2, size=80)


@scene_shot((47, 0), (48, 0))
def relief(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="shine", tear=(lt / 1.0) % 1.0, light=0.6)


TOLD = msgs(K.TOLD[:1], size=72)


@scene_shot((48, 0), (49, 0))
def told(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    x.shake = 12 * math.exp(-lt / 0.2)
    r = window(c, *WIN, "新对话", look, t=t)
    chat(c, r, TOLD, t, look)
    on_window(c, t, expr="surprise" if lt < 0.4 else "happy", arms="cheer", hop_h=hop(t, BEAT / 2, 12))
    for j in range(10):
        a_ = rnd("pb", j) * 6.28
        d = 200 + 500 * ease_out(clamp(lt / 1.2), 2)
        STAR.draw(c, W / 2 + math.cos(a_) * d, H / 2 + math.sin(a_) * d * 0.6, px=8, a=clamp(1.6 - lt), glow=0.5)
    end_screen(c, x, t, look)


BRAVE = msgs(K.TOLD, size=64)


@scene_shot((49, 0), (50, 0))
def brave(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    punch(x, lt, 0.04)
    r = window(c, *WIN, "新对话", look, t=t)
    chat(c, r, BRAVE, t, look)
    on_window(c, t, expr="happy", talk=lt < 1.0, tip=clamp((lt - 0.6) / 0.7))
    end_screen(c, x, t, look)


@scene_shot((50, 0), (52, 0))
def her_notebook(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    push(x, lt, B(52) - B(50), 0.04)
    t0 = at(K.COPY[:2])
    memory_page(c, 260, 260, 1180, 560, [K.COPY[2]], look, t, title_="念念的本子", reveal={0: t0}, cps=10, size=48,
                lh=84)
    writing = 0 <= t - t0 < 1.6
    nian_at(c, 1620, 960, px=10, t=t, expr="happy" if not writing else "normal", arms="type" if writing else "down",
            glow=0.1)
    end_screen(c, x, t, look)


@scene_shot((52, 0), (54, 0), origin=(W / 2, 560))
def first_step(c, x, t, lt):
    look = x.look
    x.letterbox = 1.0

    def inner(cv, tt):
        jin_at(cv, W / 2, 820, px=22, t=tt, expr="happy", arms="cheer", hop=hop(tt, BEAT, 20))

    office(c, x, t, look, inner=inner)
    nian_at(c, NIAN_X, DESK_Y + 2, px=9, t=t, expr="happy", arms="cheer", hop=hop(t, BEAT, 12), glow=0.12)
    c.drawPaint(paint((0.0, 0.0, 0.03), 0.6 * clamp((lt - 0.2) / 0.4)))
    headline(c, "“我不知道”，", W / 2, 470, 100, a=clamp((lt - 0.3) / 0.3))
    headline(c, "是找到答案的第一步。", W / 2, 620, 100, a=clamp((t - B(53)) / 0.3), accent=[("第一步", GOLD)])


# ================================================================ outro (54-66)
@scene_shot((54, 0), (56, 0))
def morning(c, x, t, lt):
    look = x.look
    x.letterbox = 1.0
    push(x, lt, B(56) - B(54), 0.03)

    def inner(cv, tt):
        jin_at(cv, W / 2, 820, px=22, t=tt, expr="happy", arms="wave")

    office(c, x, t, look, inner=inner, blinds=0.12, lamp=False)
    blind_light(c, t, 1.6, angle=-30, period=70, col=(1.0, 0.86, 0.62), drift=6)
    nian_at(c, NIAN_X, DESK_Y + 2, px=9, t=t, expr="happy", mag=True, glow=0.12)
    for k_, y_ in ((4, 150), (5, 240)):
        b, be, s = K.TYPED[k_]
        if t >= at((b, be)) - 0.05:
            label(c, s, W / 2, y_, 42, n=typed_n(t, at((b, be)), BEAT, s), seed=20 + k_)


LAST = [K.LAST_LINE[2]] + MEM[:2] + K.OLD_MEMORY[:1]


@scene_shot((56, 0), (58, 2))
def last_line(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    memory_page(c, 260, 250, 1180, 640, LAST, look, t, reveal={0: at(K.LAST_LINE[:2])}, cps=9, size=42, lh=70,
                glow={1: 0.5})
    writing = 0 <= t - at(K.LAST_LINE[:2]) < 1.5
    jin_at(c, 1640, 980, px=10, t=t, expr="blink" if blink(t, 9) else "normal", arms="type" if writing else "down",
           glow=0.1)
    end_screen(c, x, t, look)


FINAL = msgs(K.FINAL, size=54)


@scene_shot((58, 2), (61, 0))
def guess(c, x, t, lt):
    look = x.look
    screen(c, x, t, look)
    r = window(c, *WIN, "新对话", look, t=t)
    chat(c, r, FINAL, t, look)
    t_dk, t_ok = at(K.FINAL[1][:2]), at(K.FINAL[2][:2])
    if t < t_dk:
        kw = dict(expr="normal")
    elif t < t_ok:
        kw = dict(expr="flat", talk=t - t_dk < 0.8)
    else:
        kw = dict(expr="happy", arms="cheer", hop_h=hop(t, BEAT / 2, 10))
    on_window(c, t, **kw)
    end_screen(c, x, t, look)


@scene_shot((61, 0), (61, 3))
def laugh(c, x, t, lt):
    close_nian(c, x, t, x.look, expr="happy", arms="up", hop=hop(t, BEAT / 2, 16), light=0.8)
    punch(x, lt, 0.04)


@scene_shot((61, 3), (63, 0))
def ending_lines(c, x, t, lt):
    look = x.look
    x.letterbox = 1.0

    def inner(cv, tt):
        jin_at(cv, W / 2, 820, px=22, t=tt, expr="happy")

    office(c, x, t, look, inner=inner, blinds=0.12, lamp=False)
    nian_at(c, NIAN_X, DESK_Y + 2, px=9, t=t, expr="happy", glow=0.12)
    c.drawPaint(paint((0.0, 0.0, 0.03), 0.62 * clamp(lt / 0.4)))
    headline(c, "AI 会编，人也会装懂。", W / 2, 420, 88, a=clamp(lt / 0.3))
    headline(c, "敢说“我不知道”，才是知道的开始。", W / 2, 560, 80, a=clamp((t - B(62, 2)) / 0.3),
             accent=[("我不知道", GOLD)])


@scene_shot((63, 0), (64, 2))
def recap(c, x, t, lt):
    x.sky = False
    look = NOIR["case"]
    corkboard(c, look, t)
    bw, bh = 1440, 720
    x0, y0 = W / 2 - bw / 2, H / 2 - bh / 2
    c.drawRect(skia.Rect.MakeXYWH(x0 + 12, y0 + 18, bw, bh), paint((0, 0, 0), 0.5, blur=24))
    c.drawRect(skia.Rect.MakeXYWH(x0, y0, bw, bh), paint(MANILA))
    c.drawRect(skia.Rect.MakeXYWH(x0, y0, bw, 14), paint((0.80, 0.70, 0.50)))
    typed(c, "今日知识点", x0 + 70, y0 + 110, 60, None, INK, seed=30)
    typed(c, "CASE No.2 · 幻觉", x0 + bw - 520, y0 + 104, 34, None, (0.45, 0.35, 0.25), seed=31)
    rows = [("幻觉", "不知道的时候，也照样往下写。", "写得通顺不等于写得对；越冷门、越具体的事，越容易编。", THREAD),
            ("减少它", "允许它说“我不知道”。", "先查资料再回答，每句给出处；能减少，但没法完全消除。", (0.20, 0.42, 0.30))]
    for i, (k1, l1, l2, col) in enumerate(rows):
        yy = y0 + 240 + i * 180
        a = clamp((lt - 0.3 - i * 0.5) / 0.3)
        rect(c, x0 + 70, yy - 34, 18, 18, col, a)
        draw_text(c, k1, x0 + 110, yy - 10, font(50, "kai", True), paint(col, a), align="left")
        draw_text(c, l1, x0 + 380, yy - 10, font(44), paint(INK, a), align="left")
        draw_text(c, l2, x0 + 380, yy + 52, font(34), paint((0.35, 0.30, 0.26), a), align="left")
    pin(c, W / 2, y0 + 30)
    du = t - STAMP_AT["结案"]
    stamp(c, "结案", x0 + bw - 220, y0 + bh - 100, du, size=100, rot=-14, seed=3)
    if du >= 0:
        x.shake = 12 * math.exp(-du / 0.12)


@scene_shot((64, 2), (66, 0))
def end_card(c, x, t, lt):
    x.sky = False
    c.drawPaint(paint((0.02, 0.02, 0.04)))
    blind_light(c, t, 0.7, angle=-24, period=64, drift=10)
    headline(c, "你上一次说“我不知道”，", W / 2, 340, 72, a=clamp(lt / 0.3))
    headline(c, "是什么时候？", W / 2, 450, 72, a=clamp((lt - 0.3) / 0.3), accent=[("什么时候", GOLD)])
    small = [("本片为动画演绎，角色、对话与论文均为虚构；片中讲到的 AI 原理是真实的，画面为示意。", 30, 0.85),
             ("参考：Anthropic《Reduce hallucinations》文档；OpenAI《Why language models hallucinate》（2025）", 28, 0.7)]
    for i, (s, size, al) in enumerate(small):
        draw_text(c, s, W / 2, 790 + i * 56, font(size), paint((0.85, 0.85, 0.95), al * clamp((lt - 0.6) / 0.4)))
    jin_at(c, W / 2 - 120, 680, px=6, t=t, expr="happy", shadow=0)
    NIAN.draw_at(c, W / 2 + 120, 680, px=6, t=t, expr="happy", shadow=0)
    b, be, d = K.IRIS_CLOSE[2]
    iris_close(c, (t - B(b, be)) / d, W / 2, 640)


@tl.shot(0, tl.dur, kin="cut", kout="cut")
def beat_bump(c, x, t, lt):
    """Last on purpose: a small camera bump on every kick in the drops, on top of what the shot set."""
    if style.in_drop(t):
        x.zoom *= 1 + 0.008 * S.pulse("kick", t, 0.12)


if __name__ == "__main__":
    pipeline.run(style.frame, style.setup, tl.dur, tl.fps, OUT, "我不知道_Hallucination.mp4")
