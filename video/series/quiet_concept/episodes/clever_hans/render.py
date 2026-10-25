"""会算数的马（过拟合 · Overfitting） — 一帧一理 episode 3, cold-open test (10 bars at 104 BPM ≈ 23 s).

  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 1 5.5 8 11 15 19.5 22      # check frames
  python3 render.py                                    # 1920x1080 @ 60 fps

Every timed change reads cues.HITS through `hit()` / `pop()`, never its own numbers, so picture and score agree.
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
from cues import (BPM, BARS, SECTIONS, TITLE, TITLE_Q, CONCEPT, CONCEPT_EN, QUIZ, COMMITTEE, SILENCES,  # noqa: E402
                  captions, hit_times, t_of)

tl = Timeline(bpm=BPM, bars=BARS, sections=SECTIONS, hard_cuts=True)
B, shot, BAR, BEAT = tl.B, tl.shot, tl.bar, tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))
GROUND = 820
HX, HS = 700, 1.3            # horse position and scale


def since(name, t):
    """Seconds since the last cue of this kind (1e9 before the first)."""
    ts = [h for h in hit_times(name) if h <= t + 1e-6]
    return t - ts[-1] if ts else 1e9


def count(name, t):
    return sum(1 for h in hit_times(name) if h <= t + 1e-6)


def pop(name, t, dur=0.22):
    """Expo-out 0 -> 1 right after each cue (kinetic entrance)."""
    s = since(name, t)
    return ease_out(clamp(s / dur), 4) if s < 1e8 else 0.0


def kick(t, decay=0.12):
    s = since("tap", t)
    for n in ("stamp", "title", "card", "answer"):
        s = min(s, since(n, t))
    return math.exp(-s / decay) if s < 1 else 0.0


def frozen(t):
    """Inside a true silence the picture holds the frame it had when the sound stopped."""
    for b, b0, b1 in SILENCES:
        a, z = t_of(b, b0), t_of(b, b1)
        if a <= t < z:
            return a
    return t


# ------------------------------------------------------------------ the horse
def horse(c, x, y, s, col=INK, a=1.0, lift=0.0, glow=0.5, eye=0.0):
    """Line-drawn horse facing right, hooves on (x, y).  lift 0..1 raises the near front hoof."""
    if a <= 0.003:
        return

    def P(px, py):
        return x + px * s, y + py * s

    body = skia.Path()
    body.moveTo(*P(58, -244))                                       # withers
    body.cubicTo(*P(20, -228), *P(-60, -226), *P(-126, -238))       # back with a slight dip
    body.cubicTo(*P(-170, -244), *P(-196, -214), *P(-188, -176))    # croup and rump
    body.cubicTo(*P(-182, -146), *P(-166, -128), *P(-148, -122))    # buttock into the thigh
    body.moveTo(*P(-112, -122))
    body.cubicTo(*P(-60, -112), *P(10, -116), *P(52, -126))         # belly
    body.cubicTo(*P(96, -134), *P(118, -168), *P(116, -204))        # girth and chest
    neck = skia.Path()
    neck.moveTo(*P(58, -244))
    neck.cubicTo(*P(80, -282), *P(104, -320), *P(136, -342))        # crest up to the poll
    neck.moveTo(*P(116, -204))
    neck.cubicTo(*P(132, -230), *P(150, -262), *P(164, -284))       # throat
    head = skia.Path()
    head.moveTo(*P(136, -342))
    head.cubicTo(*P(150, -350), *P(162, -344), *P(172, -330))       # forehead
    head.cubicTo(*P(192, -304), *P(214, -282), *P(226, -266))       # face
    head.cubicTo(*P(232, -254), *P(222, -242), *P(208, -246))       # muzzle
    head.cubicTo(*P(194, -248), *P(184, -256), *P(176, -266))       # chin
    head.cubicTo(*P(170, -274), *P(166, -280), *P(164, -284))       # jaw
    ear = skia.Path()
    ear.moveTo(*P(140, -342))
    ear.lineTo(*P(146, -372))
    ear.lineTo(*P(156, -344))
    tail = skia.Path()
    tail.moveTo(*P(-184, -210))
    tail.cubicTo(*P(-224, -196), *P(-226, -140), *P(-206, -86))
    tail.moveTo(*P(-186, -204))
    tail.cubicTo(*P(-214, -170), *P(-210, -120), *P(-196, -96))
    # legs: (top, joint, fetlock, hoof, alpha); far legs dimmer, near legs last
    legs = [((-128, -126), (-150, -64), (-138, -18), (-132, 0), 0.5),
            ((40, -124), (42, -68), (38, -20), (44, 0), 0.5),
            ((-150, -124), (-170, -60), (-156, -18), (-150, 0), 1.0)]
    knee = (lerp(82, 112, lift), lerp(-70, -88, lift))
    fet = (lerp(80, 104, lift), lerp(-22, -50, lift))
    hoofp = (lerp(86, 116, lift), lerp(0, -40, lift))
    legs.append(((80, -136), knee, fet, hoofp, 1.0))
    for layer, (aa, bl, wd) in enumerate([(glow * 0.55, 12 * s, 11 * s), (1.0, 0, 4.2 * s)]):
        if aa <= 0:
            continue
        p = paint(col, a * aa, stroke=wd, blur=bl, cap_round=True)
        for path in (body, neck, head, ear, tail):
            c.drawPath(path, p)
        for (h0, k0, f0, h1, la) in legs:
            pl = paint(col, a * aa * la, stroke=wd, blur=bl, cap_round=True)
            c.drawLine(*P(*h0), *P(*k0), pl)
            c.drawLine(*P(*k0), *P(*f0), pl)
            c.drawLine(*P(*f0), *P(*h1), pl)
    # mane: a few short strokes along the crest
    for k in range(7):
        u = k / 6
        mx, my = lerp(62, 132, u), lerp(-250, -340, u)
        c.drawLine(*P(mx, my), *P(mx - 22, my + 8), paint(col, a * 0.7, stroke=2.5 * s, cap_round=True))
    ex, ey = P(180, -312)
    c.drawCircle(ex, ey, 4.5 * s, paint(col, a))
    if eye > 0.01:
        spot(c, ex, ey, 60 * s, WARM, eye * a)
        c.drawCircle(ex + 1.5 * s, ey - 1.5 * s, 1.8 * s, paint((1, 1, 1), a * eye))


def hoof_xy():
    return HX + 86 * HS, GROUND


def tap_lift(t):
    """The near front hoof comes up between taps and strikes on each one."""
    taps = hit_times("tap")
    if t < taps[0] - BEAT * 0.5 or t > taps[-1] + 0.25:
        return 0.0
    nxt = next((h for h in taps if h >= t), None)
    if nxt is None:
        return 0.0
    d = nxt - t                    # seconds until the next strike
    u = clamp(1 - d / (BEAT * 0.9))
    return math.sin(u * math.pi) ** 0.8 if d > 0 else 0.0


def dust(c, t, name, x, y, a=1.0):
    s = since(name, t)
    if s < 0.6:
        u = s / 0.6
        c.drawCircle(x, y, 20 + 90 * ease_out(u, 3), paint(INK, a * 0.5 * (1 - u), stroke=2))
        for k in range(6):
            ang = math.pi + k * math.pi / 5
            r = 30 + 70 * ease_out(u, 3)
            c.drawCircle(x + math.cos(ang) * r, y + math.sin(ang) * r * 0.35, 3, paint(INK, a * 0.6 * (1 - u)))


def big_number(c, s, x, y, size, col, u, a=1.0):
    """A number slammed in: overshoots, settles, with a short glow."""
    if a <= 0.003 or u <= 0:
        return
    sc = 1.0 + 0.35 * (1 - u) ** 2
    f = serif(size, bold=True)
    w = f.measureText(s)
    c.save()
    c.translate(x, y)
    c.scale(sc, sc)
    c.drawString(s, -w / 2, size * 0.35, f, paint(col, a * 0.45, blur=size * 0.12))
    c.drawString(s, -w / 2, size * 0.35, f, paint(col, a * min(1, u * 2)))
    c.restore()


def card(c, txt, x, y, u, col=COOL, w=380, h=150, size=64):
    if u <= 0:
        return
    dy = (1 - u) * 40
    a = min(1, u * 1.6)
    c.drawRRect(rrect(x - w / 2, y - h / 2 + dy, w, h, 14), paint((0.03, 0.04, 0.05), a * 0.92))
    c.drawRRect(rrect(x - w / 2, y - h / 2 + dy, w, h, 14), paint(col, a * 0.85, stroke=2.5))
    f = serif(size, bold=True)
    draw_text(c, txt, x, y + size * 0.35 + dy, f, paint(INK, a))


# ------------------------------------------------------------------ shots
@shot(0, B(8), tin=0.0, tout=0.0, kin="cut", kout="cut")
def stage(c, x, t, lt):
    t = frozen(t)
    lamp = pop("lamp", t, 0.12)
    # bar 7: the push into the eye
    push = ease_io(clamp((t - B(7)) / (3 * BEAT)))
    ex, ey = HX + 180 * HS, GROUND - 312 * HS
    c.save()
    z = 1 + 1.6 * push
    c.translate(ex, ey)
    c.scale(z, z)
    c.translate(-ex, -ey)
    # the light: snaps on with the lamp, breathes a little, kicks on every hit
    k = kick(t)
    spot(c, HX, GROUND - 160, 520, WARM, lamp * (0.42 + 0.12 * k))
    beam(c, HX, -60, GROUND + 40, 120, 760, WARM, lamp * (0.9 + 0.3 * k))
    c.drawLine(140, GROUND, 1780, GROUND, paint(FAINT, lamp, stroke=2))
    c.drawOval(skia.Rect.MakeLTRB(HX - 330, GROUND - 20, HX + 330, GROUND + 20), paint(WARM, lamp * 0.10))
    horse(c, HX, GROUND, HS, INK, lamp, tap_lift(t), 0.5 + 0.4 * k, eye=push)
    dust(c, t, "tap", *hoof_xy(), a=lamp)
    c.restore()
    # bar 0 beat 2: place and year
    tag(c, "柏林 · 1904", "BERLIN", 140, 130, DIM, pop("tag", t, 0.3) * (1 - push), 34)
    # bar 1: the question card
    if t < B(4):
        u = pop("card", t, 0.3)
        card(c, "2 + 3 = ?", 1340, 300, u)
        tag(c, "提问的人", "QUESTIONER", 1340, 420, COOL, u * 0.8, 24, "center")
    # bars 2-3: the count
    n = count("tap", t)
    if 0 < n and t < B(4):
        col = WARM if n == 5 else INK
        big_number(c, str(n), 1340, 640, 230, col, pop("tap", t, 0.18))
        for i in range(5):
            on = i < n
            c.drawCircle(1340 - 120 + i * 60, 820, 9, paint(WARM if n == 5 else INK, 0.9 if on else 0.18))
    if n == 5 and t < B(4):
        sp = since("tap", t)
        if sp < 0.8:
            x.flash = 0.18 * math.exp(-sp / 0.1)
        ch = pop("cheer", t, 0.6)
        if ch > 0:
            tag(c, "全场鼓掌", "APPLAUSE", 1340, 220, WARM, ch, 28, "center")
    # bar 4: the quiz, one card a beat, the answer on the eighth after
    if B(4) <= t < B(5):
        i = min(3, count("card", t) - 2)
        q, ans = QUIZ[i]
        cu = pop("card", t, 0.12)
        card(c, f"{q} = ?", 1340, 330, cu, COOL, 440, 160, 70)
        if count("answer", t) > i:
            big_number(c, ans, 1340, 620, 220, WARM, pop("answer", t, 0.14))
        for j in range(4):
            c.drawCircle(1250 + j * 60, 860, 8, paint(COOL if j <= i else FAINT, 0.9))
        x.zoom = 1 + 0.015 * kick(t, 0.08)
    # bars 5-6: the committee, then the stamp
    if B(5) <= t < B(7):
        np_ = count("pop", t)
        for i in range(COMMITTEE):
            if i >= np_:
                break
            u = clamp(since_nth("pop", i, t) / 0.18)
            fx = 1110 + (i % 7) * 105 + (52 if i >= 7 else 0)
            fy = 520 + (i // 7) * 290
            juror(c, fx, fy + (1 - ease_out(u, 3)) * 40, COOL, 0.9 * u)
        draw_text(c, f"{np_} 人", 1780, 170, serif(56, bold=True), paint(COOL, 0.9 if np_ else 0), "right")
        tag(c, "汉斯委员会", "THE HANS COMMISSION", 1780, 210, DIM, 0.9 if np_ else 0, 24, "right")
        su = pop("stamp", t, 0.16)
        if su > 0:
            c.save()
            c.translate(1380, 470)
            c.rotate(-8)
            sc = 1.6 - 0.6 * su
            c.scale(sc, sc)
            c.drawRRect(rrect(-250, -70, 500, 140, 10), paint(WARM, su * 0.15))
            c.drawRRect(rrect(-250, -70, 500, 140, 10), paint(WARM, su, stroke=6))
            draw_text(c, "没有作弊", 0, 22, serif(72, bold=True), paint(WARM, su))
            spaced_en(c, "NO TRICKS FOUND · SEPT 1904", 0, 100, 18, WARM, su)
            c.restore()
            x.flash = max(x.flash, 0.22 * math.exp(-since("stamp", t) / 0.08))
            x.zoom = 1 + 0.03 * math.exp(-since("stamp", t) / 0.1)
    # bar 7, beat 3: everything goes dark for the silence
    if t >= t_of(7, 3):
        x.dim = 0.92


def juror(c, x_, y_, col, a):
    """A committee member from the chest up: a head and a shoulder arc, standing on y_."""
    if a <= 0.003:
        return
    p = skia.Path()
    p.addArc(skia.Rect.MakeLTRB(x_ - 44, y_ - 70, x_ + 44, y_ + 60), 180, 180)
    for aa, bl, wd in ((0.35, 8, 9), (1.0, 0, 3.5)):
        pp = paint(col, a * aa, stroke=wd, blur=bl, cap_round=True)
        c.drawPath(p, pp)
        c.drawCircle(x_, y_ - 100, 22, pp)


def since_nth(name, i, t):
    ts = hit_times(name)
    return t - ts[i] if i < len(ts) else -1


@shot(B(8), B(10), tin=0.0, tout=0.0, kin="cut", kout="cut")
def title(c, x, t, lt):
    k = S.pulse("kick", t, 0.12)
    spot(c, CX, 520, 600, WARM, 0.35 + 0.15 * k)
    # title: one character per sixteenth, each slams down
    f = serif(190, bold=True)
    chars = list(TITLE)
    widths = [f.measureText(ch) for ch in chars]
    x0 = CX - sum(widths) / 2
    for i, (ch, w) in enumerate(zip(chars, widths)):
        s = since_nth("char", i, t)
        if s < 0:
            continue
        u = ease_out(clamp(s / 0.16), 4)
        dy = (1 - u) * -120
        sc = 1 + 0.5 * (1 - u)
        c.save()
        c.translate(x0 + w / 2, 560 + dy)
        c.scale(sc, sc)
        c.drawString(ch, -w / 2, 0, f, paint(INK, u * 0.35, blur=26))
        c.drawString(ch, -w / 2, 0, f, paint(INK, u))
        c.restore()
        x0 += w
    cu = pop("concept", t, 0.3)
    tag(c, CONCEPT, CONCEPT_EN, CX, 330, DIM, cu, 34, "center")
    c.drawLine(CX - 380 * cu, 630, CX + 380 * cu, 630, paint(FAINT, cu, stroke=1.5))
    caption_line(c, TITLE_Q, CX, 712, 46, t - t_of(8, 2.5), shadow=False)
    # camera: shake on the drop, then a punch on every kick
    s0 = since("title", t)
    shake = math.exp(-s0 / 0.25) if s0 < 2 else 0.0
    x.zoom = 1 + 0.06 * shake + 0.012 * k
    x.flash = 0.45 * math.exp(-s0 / 0.07) if s0 < 1 else 0.0


LOOKS = {"hook": LOOKS_BASE["deep"], "count": LOOKS_BASE["warm"], "quiz": LOOKS_BASE["night"],
         "panel": LOOKS_BASE["cool"], "push": LOOKS_BASE["deep"], "title": LOOKS_BASE["deep"]}
style = QuietConcept(tl, S, LOOKS, captions=captions(), intro_fade=0.05, outro_fade=1.2)

if __name__ == "__main__":
    run(style.frame, style.setup, tl.dur, tl.fps, OUT, f"{TITLE}_试片.mp4")
