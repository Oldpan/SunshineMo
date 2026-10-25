"""会算数的马（过拟合 · Overfitting） — 一帧一理 episode 3 (68 bars at 104 BPM ≈ 2:37).

  python3 music.py && python3 check_hits.py            # every hit has its sound on the same frame
  python3 render.py --still 5.5 25 45 60 75 85 120     # check frames
  python3 render.py                                    # 1920x1080 @ 60 fps

Every timed change reads cues.HITS through `since()` / `pop()`, never its own numbers, so picture and score agree.
HITS names repeat across sections (card, tag, pop ...), so section shots pass `lo` (a bar) to ignore earlier cues.
"""
import math
import numpy as np
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
                  N_TRAIN, N_TEST, captions, hit_times, t_of)

tl = Timeline(bpm=BPM, bars=BARS, sections=SECTIONS, hard_cuts=True)
B, shot, BAR, BEAT = tl.B, tl.shot, tl.bar, tl.beat
S = Sync(os.path.join(OUT, "sync.npz"))
GROUND = 820
HX, HS = 700, 1.3            # horse position and scale


def hits(name, lo=0):
    return [h for h in hit_times(name) if h >= B(lo) - 1e-6]


def since(name, t, lo=0):
    """Seconds since the last cue of this kind at or after bar lo (1e9 before the first)."""
    ts = [h for h in hits(name, lo) if h <= t + 1e-6]
    return t - ts[-1] if ts else 1e9


def count(name, t, lo=0):
    return sum(1 for h in hits(name, lo) if h <= t + 1e-6)


def pop(name, t, dur=0.22, lo=0):
    """Expo-out 0 -> 1 right after each cue (kinetic entrance)."""
    s = since(name, t, lo)
    return ease_out(clamp(s / dur), 4) if s < 1e8 else 0.0


def since_nth(name, i, t, lo=0):
    ts = hits(name, lo)
    return t - ts[i] if i < len(ts) else -1


def flash_on(x, name, t, lo, amt=0.2, zoom=0.03):
    s = since(name, t, lo)
    if s < 1:
        x.flash = max(x.flash, amt * math.exp(-s / 0.08))
        x.zoom = max(x.zoom, 1 + zoom * math.exp(-s / 0.12))


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


def tap_lift(t, name="tap", extra=()):
    """The near front hoof comes up between taps and strikes on each one (extra: taps that never come)."""
    taps = hit_times(name) + list(extra)
    if t < taps[0] - BEAT * 0.5 or t > taps[-1] + 0.25:
        return 0.0
    nxt = next((h for h in taps if h >= t), None)
    if nxt is None:
        return 0.0
    d = nxt - t                    # seconds until the next strike
    u = clamp(1 - d / (BEAT * 0.9))
    return math.sin(u * math.pi) ** 0.8 if d > 0 else 0.0


def dust(c, t, name, x, y, a=1.0):
    s = since(name, t) if isinstance(name, str) else name
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


# ------------------------------------------------------------------ props for the rest of the film
def asker(c, x_, y_, s=1.0, col=COOL, a=1.0, lift=0.0, glow=0.5):
    """The questioner in profile, facing left, chest up: bowler hat, nose, collar.  lift raises the head (px)."""
    if a <= 0.003:
        return
    hx, hy = x_, y_ - 150 * s - lift
    ang = -10 * clamp(lift / 14)
    sh = skia.Path()
    sh.moveTo(x_ - 120 * s, y_ + 40 * s)
    sh.cubicTo(x_ - 110 * s, y_ - 40 * s, x_ - 70 * s, y_ - 70 * s, x_ - 20 * s, y_ - 78 * s)
    sh.moveTo(x_ + 30 * s, y_ - 78 * s)
    sh.cubicTo(x_ + 90 * s, y_ - 70 * s, x_ + 130 * s, y_ - 30 * s, x_ + 140 * s, y_ + 40 * s)
    sh.moveTo(x_ - 20 * s, y_ - 78 * s)
    sh.lineTo(x_ + 2 * s, y_ - 40 * s)
    sh.lineTo(x_ + 30 * s, y_ - 78 * s)
    for aa, bl, wd in ((glow * 0.5, 10 * s, 10 * s), (1.0, 0, 4 * s)):
        if aa <= 0:
            continue
        p = paint(col, a * aa, stroke=wd, blur=bl, cap_round=True)
        c.drawPath(sh, p)
        c.drawLine(x_, y_ - 78 * s, hx, hy + 40 * s, p)                  # neck
        c.save()
        c.translate(hx, hy)
        c.rotate(ang)
        head = skia.Path()
        head.moveTo(30 * s, 40 * s)
        head.cubicTo(50 * s, 10 * s, 46 * s, -40 * s, 10 * s, -46 * s)  # back of the head
        head.moveTo(-34 * s, -30 * s)
        head.cubicTo(-44 * s, -14 * s, -46 * s, -6 * s, -56 * s, 4 * s)  # brow to nose
        head.lineTo(-40 * s, 10 * s)
        head.cubicTo(-44 * s, 22 * s, -40 * s, 36 * s, -20 * s, 44 * s)  # mouth and chin
        c.drawPath(head, p)
        hat = skia.Path()
        hat.moveTo(-36 * s, -42 * s)
        hat.cubicTo(-36 * s, -100 * s, 40 * s, -100 * s, 40 * s, -42 * s)   # crown
        c.drawPath(hat, p)
        c.drawLine(-66 * s, -40 * s, 66 * s, -40 * s, p)                  # brim
        c.restore()
    c.save()
    c.translate(hx, hy)
    c.rotate(ang)
    c.drawCircle(-26 * s, -14 * s, 3.5 * s, paint(col, a))              # eye
    c.restore()


def asker_face():
    return 1420 - 30, 470


def car(c, cx, cy, s=1.0, col=INK, a=1.0):
    """A line-drawn car facing right, centred on (cx, cy) = its middle."""
    if a <= 0.003:
        return
    p = skia.Path()
    p.moveTo(cx - 150 * s, cy + 20 * s)
    p.lineTo(cx - 150 * s, cy - 10 * s)
    p.cubicTo(cx - 140 * s, cy - 22 * s, cx - 110 * s, cy - 26 * s, cx - 80 * s, cy - 28 * s)
    p.lineTo(cx - 40 * s, cy - 66 * s)
    p.lineTo(cx + 50 * s, cy - 66 * s)
    p.lineTo(cx + 90 * s, cy - 28 * s)
    p.cubicTo(cx + 130 * s, cy - 24 * s, cx + 152 * s, cy - 14 * s, cx + 154 * s, cy + 20 * s)
    p.lineTo(cx + 120 * s, cy + 20 * s)
    p.moveTo(cx + 60 * s, cy + 20 * s)
    p.lineTo(cx - 60 * s, cy + 20 * s)
    p.moveTo(cx - 120 * s, cy + 20 * s)
    p.lineTo(cx - 150 * s, cy + 20 * s)
    p.moveTo(cx + 5 * s, cy - 66 * s)
    p.lineTo(cx + 5 * s, cy - 28 * s)
    for aa, bl, wd in ((0.4, 8 * s, 9 * s), (1.0, 0, 3.5 * s)):
        pp = paint(col, a * aa, stroke=wd, blur=bl, cap_round=True)
        c.drawPath(p, pp)
        for wx in (-90, 90):
            c.drawCircle(cx + wx * s, cy + 22 * s, 28 * s, pp)


def copyright_tag(c, x_, y_, s=1.0, col=DIM, a=1.0):
    """The little source line in the corner of the photo (generic, no real brand)."""
    if a <= 0.003:
        return
    f = font(15 * s, "Medium")
    txt = "© PHOTO ARCHIVE"
    w = f.measureText(txt) + 14 * s
    c.drawRRect(rrect(x_, y_ - 18 * s, w, 24 * s, 3 * s), paint((0, 0, 0), a * 0.45))
    c.drawString(txt, x_ + 7 * s, y_, f, paint(col, a))


def photo(c, cx, cy, w, h, a=1.0, what="horse", tag_a=1.0, heat=0.0, s=0.34):
    """A photo frame from the training set: a horse (or a car) on grass, the source tag bottom-left."""
    if a <= 0.003:
        return
    c.drawRRect(rrect(cx - w / 2, cy - h / 2, w, h, 8), paint((0.05, 0.07, 0.10), a * 0.95))
    c.save()
    c.clipRRect(rrect(cx - w / 2, cy - h / 2, w, h, 8))
    gy = cy + h * 0.30
    c.drawLine(cx - w / 2, gy, cx + w / 2, gy, paint(FAINT, a, stroke=2))
    if what == "horse":
        horse(c, cx - 10, gy, s, INK, a * 0.85, 0.0, 0.2)
    else:
        car(c, cx, gy - 22 * s / 0.34 * 0.8, s / 0.34 * 0.8, INK, a * 0.85)
    tx, ty = cx - w / 2 + 10, cy + h / 2 - 12
    if heat > 0:
        spot(c, tx + 60, ty - 6, 110, NEG, heat * a)
        spot(c, tx + 60, ty - 6, 50, WARM, heat * a * 0.8)
    copyright_tag(c, tx, ty, 1.0, INK if heat > 0.3 else DIM, a * tag_a)
    c.restore()
    c.drawRRect(rrect(cx - w / 2, cy - h / 2, w, h, 8), paint(DIM, a * 0.8, stroke=2))


def check_mark(c, x_, y_, sz, col, a, u=1.0, cross=False):
    if a <= 0.003 or u <= 0:
        return
    p = paint(col, a, stroke=sz * 0.14, cap_round=True)
    g = paint(col, a * 0.4, stroke=sz * 0.3, blur=sz * 0.15, cap_round=True)
    if cross:
        for pp in (g, p):
            c.drawLine(x_ - sz / 2, y_ - sz / 2, x_ - sz / 2 + sz * u, y_ - sz / 2 + sz * u, pp)
            c.drawLine(x_ + sz / 2, y_ - sz / 2, x_ + sz / 2 - sz * u, y_ - sz / 2 + sz * u, pp)
        return
    path = skia.Path()
    path.moveTo(x_ - sz * 0.45, y_)
    path.lineTo(x_ - sz * 0.1, y_ + sz * 0.35)
    path.lineTo(x_ + sz * 0.5, y_ - sz * 0.4)
    m = skia.PathMeasure(path, False)
    seg = skia.Path()
    m.getSegment(0, m.getLength() * u, seg, True)
    for pp in (g, p):
        c.drawPath(seg, pp)


def header(c, cn, en, a, col=DIM):
    tag(c, cn, en, 140, 130, col, a, 34)


def schematic(c, a):
    spaced_en(c, "SCHEMATIC · 示意", 1780, 130, 16, DIM, a * 0.8, align="right")


def blinker(c, a):
    """A blinder cup over the horse's eye."""
    ex, ey = PF_X + 180 * PF_S, GROUND - 312 * PF_S
    if a <= 0.003:
        return
    c.drawOval(skia.Rect.MakeLTRB(ex - 30, ey - 26, ex + 22, ey + 26), paint((0.02, 0.02, 0.03), a))
    c.drawOval(skia.Rect.MakeLTRB(ex - 30, ey - 26, ex + 22, ey + 26), paint(DIM, a, stroke=3))
    c.drawLine(ex - 30, ey, ex - 110, ey - 30, paint(DIM, a * 0.8, stroke=3))


# ------------------------------------------------------------------ 1907: Pfungst (bars 10-16)
PF_X, PF_S = 520, 1.15


@shot(B(10), B(16), tin=0.0, tout=0.0, kin="cut", kout="cut")
def pfungst(c, x, t, lt):
    t = frozen(t)
    k = math.exp(-since("tap2", t, 10) / 0.12) if since("tap2", t, 10) < 1 else 0.0
    spot(c, PF_X, GROUND - 160, 470, WARM, 0.36 + 0.1 * k)
    beam(c, PF_X, -60, GROUND + 40, 110, 660, WARM, 0.85)
    c.drawLine(140, GROUND, 1780, GROUND, paint(FAINT, 1, stroke=2))
    lift = tap_lift(t, "tap2") if t < B(13) else 0.0
    horse(c, PF_X, GROUND, PF_S, INK, 1.0, lift, 0.5 + 0.4 * k)
    dust(c, t, since("tap2", t, 10), PF_X + 86 * PF_S, GROUND)
    bu = pop("blind", t, 0.2, 10)
    blinker(c, bu)
    if bu > 0:
        tag(c, "眼罩", "BLINDERS", PF_X + 180 * PF_S - 140, GROUND - 312 * PF_S - 60, DIM, bu, 26, "right")
        flash_on(x, "blind", t, 10, 0.12, 0.02)
    # bar 10: the year slams in, then who
    yu = pop("year", t, 0.18, 10)
    if t < B(11):
        big_number(c, "1907", 1320, 420, 230, WARM, yu)
        tag(c, "奥斯卡·芬斯特，心理学家", "OSKAR PFUNGST · PSYCHOLOGIST", 1320, 600, DIM, pop("tag", t, 0.3, 10),
            34, "center")
        flash_on(x, "year", t, 10, 0.25, 0.04)
    header(c, "1907 · 芬斯特的实验", "PFUNGST'S TEST", min(1, max(0, (t - B(11)) / 0.3)))
    # bar 11: a question the asker does not know; bar 12: it never stops
    if B(11) <= t < B(14):
        cu = pop("card", t, 0.3, 11)
        card(c, "? + ? = ?", 1320, 330, cu, COOL, 440, 160, 70)
        tg = pop("tag", t, 0.3, 11)
        tag(c, "提问的人也不知道答案", "THE ASKER DOESN'T KNOW", 1320, 460, COOL, tg, 28, "center")
        n = count("tap2", t, 10)
        if n:
            col = NEG if n > 5 else INK
            big_number(c, str(n + 5), 1320, 640, 200, col, pop("tap2", t, 0.12, 10))
            for i in range(n):
                c.drawCircle(1320 - 210 + i * 60, 790, 9, paint(col, 0.9))
        if t >= B(13):
            tag(c, "停不下来", "IT DOESN'T STOP", 1320, 870, NEG, 0.9, 30, "center")
    # bars 14-15: the result
    if t >= B(14):
        rows = [("看得见提问的人", "QUESTIONER IN SIGHT", 0.89, "89%", WARM, 14),
                ("看不见", "QUESTIONER HIDDEN", 0.06, "6%", NEG, 15)]
        for j, (cn, en, v, lab, col, bar) in enumerate(rows):
            s = t - B(bar)
            if s < 0:
                continue
            y0 = 380 + j * 230
            u = ease_out(clamp(s / (BEAT * 0.9)), 3)
            tag(c, cn, en, 1000, y0 - 26, col, min(1, s / 0.2), 30)
            c.drawRRect(rrect(1000, y0, 700, 64, 8), paint(FAINT, 0.35))
            c.drawRRect(rrect(1000, y0, max(8, 700 * v * u), 64, 8), paint(col, 0.85))
            nu = pop("num", t, 0.2, bar)
            if t >= t_of(bar, 1):
                big_number(c, lab, 1000 + 700 * v + (110 if v < 0.5 else -130), y0 + 32, 84, INK if v > 0.5 else col, nu)
        tag(c, "数据：Pfungst 1907，汉斯答题记录", "PFUNGST 1907", 1000, 880, DIM, 0.7, 20)
    if t >= t_of(15, 3):
        x.dim = 0.9


# ------------------------------------------------------------------ the cue (bars 16-22)
CH_X, CH_Y, CH_S = 250, 1170, 2.1          # horse placed so its head sits on the left of frame


def horse_eye_cue():
    return CH_X + 180 * CH_S, CH_Y - 312 * CH_S


@shot(B(16), B(22), tin=0.0, tout=0.0, kin="cut", kout="cut")
def cue(c, x, t, lt):
    ru = pop("reveal", t, 0.25, 16)
    flash_on(x, "reveal", t, 16, 0.35, 0.05)
    fu = pop("face", t, 0.4, 16)
    nod_s = since("nod", t, 16)
    lift = 14 * math.exp(-max(0, nod_s - 0.08) / 0.35) * clamp(nod_s / 0.08) if nod_s < 3 else 0.0
    lu = pop("cueline", t, 0.5, 20)
    spot(c, *horse_eye_cue(), 380, WARM, 0.25 + 0.25 * lu)
    spot(c, 1420, 420, 420, COOL, 0.15 + 0.3 * fu)
    horse(c, CH_X, CH_Y, CH_S, INK, ru, 0.0, 0.45, eye=0.3 * fu + 0.7 * lu)
    asker(c, 1420, 640, 1.3, COOL, ru, lift)
    # bar 16: the arithmetic was never the point
    if t < B(18):
        cu = 1 - smooth((t - B(17)) / 0.5)
        draw_text(c, "2 + 3", CX, 260, serif(90, bold=True), paint(INK, ru * cu * 0.8))
        sl = ease_out(clamp((t - t_of(16, 1)) / 0.3), 3)
        c.drawLine(CX - 140, 232, CX - 140 + 280 * sl, 232, paint(NEG, cu * 0.95, stroke=7, cap_round=True))
    # bar 17: the gaze: dotted line from the horse eye to the face
    ex, ey = horse_eye_cue()
    fx, fy = asker_face()
    if fu > 0:
        for i in range(28):
            v = i / 27
            if v > fu:
                break
            c.drawCircle(lerp(ex + 20, fx - 80, v), lerp(ey, fy, v), 3, paint(INK, 0.35 * (1 - lu)))
        tag(c, "它在看这里", "IT WATCHES THE FACE", 1420, 230, COOL, fu * (1 - lu), 28, "center")
    # bars 18-19: the count and the little head jerk
    n = count("tap3", t, 16)
    if n and t < B(21):
        col = WARM if n == 5 else INK
        big_number(c, str(n), CX + 20, 620, 150, col, pop("tap3", t, 0.14, 16))
        for i in range(5):
            c.drawCircle(CX + 20 - 120 + i * 60, 760, 9, paint(col, 0.9 if i < n else 0.18))
    if nod_s < 3:
        nu = ease_out(clamp(nod_s / 0.25), 3) * (1 - smooth((t - B(21)) / 0.4))
        c.drawCircle(fx - 10, fy - 70, 90 + 60 * clamp(nod_s / 0.5), paint(COOL, nu * (1 - clamp(nod_s / 0.8)), stroke=3))
        ax = 1590
        c.drawLine(ax, 470, ax, 470 - 70 * nu, paint(COOL, nu, stroke=5, cap_round=True))
        c.drawLine(ax - 18, 470 - 70 * nu + 20, ax, 470 - 70 * nu, paint(COOL, nu, stroke=5, cap_round=True))
        c.drawLine(ax + 18, 470 - 70 * nu + 20, ax, 470 - 70 * nu, paint(COOL, nu, stroke=5, cap_round=True))
        tag(c, "微微抬头", "A SLIGHT UPWARD JERK", ax + 30, 450, COOL, nu, 28)
    # bar 20: the cue line itself, face to eye, in warm
    if lu > 0:
        p0, p1 = (fx - 70, fy - 50), (ex + 16, ey)
        xx, yy = lerp(p0[0], p1[0], lu), lerp(p0[1], p1[1], lu)
        c.drawLine(*p0, xx, yy, paint(WARM, 0.45, stroke=14, blur=10, cap_round=True))
        c.drawLine(*p0, xx, yy, paint(WARM, 1.0, stroke=4, cap_round=True))
        mx, my = lerp(p0[0], p1[0], 0.5), lerp(p0[1], p1[1], 0.5)
        tag(c, "线索", "CUE", mx, my - 40, WARM, lu, 40, "center")
        flash_on(x, "cueline", t, 20, 0.15, 0.02)
    if t >= B(21):
        tag(c, "学会的：抬头", "LEARNED: THE NOD", 140, 130, WARM, 0.9, 30)
        tag(c, "没学会：加法", "NOT LEARNED: ADDITION", 140, 210, NEG, smooth((t - t_of(21, 1)) / 0.3), 30)


# ------------------------------------------------------------------ overfitting (bars 22-30)
_rng = np.random.default_rng(3)
TR_U = np.linspace(0.04, 0.96, N_TRAIN)
TR_N = _rng.normal(0, 0.07, N_TRAIN)
TE_I = [0, 2, 3, 5, 6, 7, 9, 10]                 # test points sit between training points
TE_U = np.array([(TR_U[i] + TR_U[i + 1]) / 2 for i in TE_I])
TE_N = _rng.normal(0, 0.025, N_TEST)


def truth(u):
    return 0.5 + 0.26 * np.sin(2 * np.pi * 0.85 * u - 0.7)


TR_V = truth(TR_U) + TR_N
TE_V = truth(TE_U) + TE_N
PL_X0, PL_X1, PL_Y0, PL_Y1 = 380, 1540, 820, 330


def px(u, v):
    return PL_X0 + (PL_X1 - PL_X0) * u, PL_Y0 + (PL_Y1 - PL_Y0) * v


def wiggle(u):
    """The memoriser: through every training point, swinging hard between them."""
    u = np.clip(u, TR_U[0], TR_U[-1])
    i = min(N_TRAIN - 2, int(np.searchsorted(TR_U, u, "right") - 1))
    s = (u - TR_U[i]) / (TR_U[i + 1] - TR_U[i])
    base = lerp(TR_V[i], TR_V[i + 1], smooth(s))
    return base + (0.24 if i % 2 else -0.24) * math.sin(math.pi * s)


def curve(c, fn, u0, u1, col, a, wd=4, n=240):
    if a <= 0.003 or u1 <= u0:
        return
    p = skia.Path()
    for k in range(n + 1):
        u = lerp(u0, u1, k / n)
        xx, yy = px(u, float(fn(u)))
        (p.moveTo if k == 0 else p.lineTo)(xx, yy)
    c.drawPath(p, paint(col, a * 0.4, stroke=wd * 3, blur=8, cap_round=True))
    c.drawPath(p, paint(col, a, stroke=wd, cap_round=True))


def plot_axes(c, a):
    c.drawLine(PL_X0 - 30, PL_Y0 + 30, PL_X1 + 30, PL_Y0 + 30, paint(FAINT, a, stroke=2))
    c.drawLine(PL_X0 - 30, PL_Y0 + 30, PL_X0 - 30, PL_Y1 - 40, paint(FAINT, a, stroke=2))


def scoreboard(c, x_, y_, cn, en, val, col, u, a=1.0):
    if u <= 0:
        return
    tag(c, cn, en, x_, y_ - 70, DIM, a * min(1, u * 2), 26, "center")
    big_number(c, val, x_, y_, 110, col, u, a)


@shot(B(22), B(30), tin=0.0, tout=0.0, kin="cut", kout="cut")
def overfit(c, x, t, lt):
    k = S.pulse("kick", t, 0.12)
    # bar 22: the word slams in, one character per sixteenth, then rises to a header
    flash_on(x, "slam", t, 22, 0.35, 0.05)
    up = ease_io(clamp((t - B(23)) / 0.45))
    f = serif(lerp(170, 60, up), bold=True)
    word = CONCEPT
    widths = [f.measureText(ch) for ch in word]
    x0 = lerp(CX - sum(widths) / 2, 140, up)
    yb = lerp(560, 150, up)
    for i, (ch, w) in enumerate(zip(word, widths)):
        s = since_nth("kchar", i, t, 22)
        if s < 0:
            continue
        u = ease_out(clamp(s / 0.14), 4)
        c.save()
        c.translate(x0 + w / 2, yb + (1 - u) * -80)
        sc = 1 + 0.5 * (1 - u)
        c.scale(sc, sc)
        c.drawString(ch, -w / 2, 0, f, paint(WARM, u * 0.4, blur=20))
        c.drawString(ch, -w / 2, 0, f, paint(INK, u))
        c.restore()
        x0 += w
    spaced_en(c, CONCEPT_EN, lerp(CX, 140 + 90, up), lerp(640, 200, up), lerp(26, 16, up), DIM,
              pop("kchar", t, 0.3, 22), align="center")
    if t < B(23):
        return
    schematic(c, smooth((t - B(23)) / 0.4))
    plot_axes(c, smooth((t - B(23)) / 0.3))
    tag(c, "练习题", "TRAINING SET", PL_X0 - 30, PL_Y0 + 80, DIM, smooth((t - B(23)) / 0.3), 24)
    # bar 24: the rule, a smooth warm curve; bar 25 on: the memoriser
    du = clamp((t - B(24)) / (BAR * 0.9))
    wn = count("snap", t, 22)
    rule_a = 1.0 if t < B(25) else (0.35 if t < B(28) else 1.0)
    curve(c, truth, 0.02, lerp(0.02, 0.98, ease_io(du)), WARM, rule_a, 4)
    if du > 0.6:
        rx, ry = px(0.98, float(truth(0.98)))
        tag(c, "规律", "THE RULE", rx + 10, ry + 70, WARM, rule_a * smooth((du - 0.6) / 0.3), 30, "center")
    if wn:
        ts = hits("snap", 22)
        u_end = TR_U[min(wn, N_TRAIN - 1)] if wn < N_TRAIN else TR_U[-1]
        s = t - ts[wn - 1]
        if wn < N_TRAIN:
            u_end = lerp(TR_U[wn - 1], TR_U[wn], ease_out(clamp(s / (BEAT * 0.25)), 2))
        curve(c, wiggle, TR_U[0], u_end, NEG, 1.0, 4)
        tag(c, "背下来", "MEMORISED", px(*(TR_U[3], 0.95))[0], PL_Y1 - 20, NEG, smooth(s / 0.3) if wn == 1 else 1, 30,
            "center")
    # training dots (filled)
    for i in range(N_TRAIN):
        s = since_nth("dot", i, t, 22)
        if s < 0:
            break
        u = back_out(clamp(s / 0.2))
        xx, yy = px(TR_U[i], TR_V[i])
        hit_ = wn > i
        c.drawCircle(xx, yy, 11 * u + (5 * math.exp(-since_nth("snap", i, t, 22) / 0.1) if hit_ else 0),
                     paint(INK, 0.95))
    # bar 26: score on the training set; bar 27: new questions
    su = pop("score", t, 0.2, 26)
    if t >= B(26):
        scoreboard(c, 1700, 360, "练习题", "TRAINING", "100", INK, 1.0 if t >= B(27) else su)
        flash_on(x, "score", t, 26, 0.12, 0.02)
    for i in range(N_TEST):
        s = since_nth("dot2", i, t, 22)
        if s < 0:
            break
        u = back_out(clamp(s / 0.2))
        xx, yy = px(TE_U[i], TE_V[i])
        c.drawCircle(xx, yy, 12 * u, paint(COOL, 0.95, stroke=3.5))
        if t >= B(28):
            mu = ease_out(clamp((t - B(28) - i * 0.04) / 0.25), 3)
            wx, wy = px(TE_U[i], wiggle(TE_U[i]))
            c.drawLine(xx, yy, xx, lerp(yy, wy, mu), paint(NEG, 0.9, stroke=3))
    if t >= B(27):
        tag(c, "新题", "NEW QUESTIONS", PL_X0 + 220, PL_Y0 + 80, COOL, smooth((t - B(27)) / 0.3), 24)
    if t >= t_of(28, 1):
        scoreboard(c, 1700, 600, "新题", "NEW", "38", NEG, pop("score", t, 0.2, 28))
        flash_on(x, "miss", t, 22, 0.2, 0.03)
    x.zoom = max(x.zoom, 1 + 0.008 * k)


# ------------------------------------------------------------------ 2019: the horse classifier (bars 30-40)
PH_W, PH_H = 330, 230
PH_XS = [330, 750, 1170, 1590]
PH_Y = 470


@shot(B(30), B(36), tin=0.0, tout=0.0, kin="cut", kout="cut")
def ai(c, x, t, lt):
    t = frozen(t)
    k = S.pulse("kick", t, 0.12)
    if t < B(31):
        big_number(c, "2019", CX, 440, 230, COOL, pop("year", t, 0.18, 30))
        tag(c, "Lapuschkin 等，Nature Communications", "LAPUSCHKIN ET AL. 2019", CX, 620, DIM,
            pop("tag", t, 0.3, 30), 32, "center")
        tag(c, "一个认图的 AI：这张图里有马吗？", "AN IMAGE CLASSIFIER", CX, 700, DIM, pop("tag", t, 0.3, 30) * 0.8,
            26, "center")
        flash_on(x, "year", t, 30, 0.25, 0.04)
        return
    header(c, "2019 · 认马的 AI", "A HORSE CLASSIFIER", 1.0, COOL)
    schematic(c, 1.0)
    if t < B(34):
        heat = pop("heat", t, 0.5, 30)
        zoom = ease_io(clamp((t - B(33)) / 0.45))
        c.save()
        # bar 33: push into the first photo's corner
        zx, zy = PH_XS[0] - PH_W / 2 + 70, PH_Y + PH_H / 2 - 18
        z = 1 + 1.6 * zoom
        c.translate(lerp(zx, 560, zoom), lerp(zy, 700, zoom))
        c.scale(z, z)
        c.translate(-zx, -zy)
        for i, cx in enumerate(PH_XS):
            s = since_nth("frame", i, t, 30)
            if s < 0:
                continue
            u = ease_out(clamp(s / 0.2), 4)
            photo(c, cx, PH_Y + (1 - u) * 40, PH_W, PH_H, u * (1 - zoom if i else 1), "horse", 1.0, heat)
            cs = since_nth("check", i, t, 30)
            if cs >= 0:
                cu = ease_out(clamp(cs / 0.18), 3)
                check_mark(c, cx + PH_W / 2 - 34, PH_Y - PH_H / 2 - 40, 46, WARM, cu * (1 - zoom), cu)
                tag(c, "马", "HORSE", cx - PH_W / 2, PH_Y - PH_H / 2 - 24, WARM, cu * (1 - zoom), 28)
        c.restore()
        if heat > 0 and zoom < 0.5:
            tag(c, "它看的地方：每张图的角落", "WHERE IT LOOKED", CX, 810, NEG, heat * (1 - zoom * 2), 32, "center")
        if t >= B(33):
            nu = pop("num", t, 0.18, 33)
            big_number(c, "≈ 1/5", 1520, 430, 150, NEG, nu)
            tag(c, "的马图，带着这行来源字", "OF HORSE PHOTOS CARRY THIS TAG", 1520, 560, INK, nu, 30, "center")
            flash_on(x, "zoom", t, 30, 0.15, 0.03)
    else:
        # bar 34: a car; the tag is stuck on; silence; bar 35: "horse"
        fu = pop("frame", t, 0.2, 34)
        stick = pop("stick", t, 0.12, 34)
        vd = pop("verdict", t, 0.16, 34)
        cx, cy, w, h = CX, 500, 620, 420
        photo(c, cx, cy + (1 - fu) * 40, w, h, fu, "car", stick, 0.9 * vd, s=0.62)
        if stick > 0:
            sc = 2.2 - 1.2 * stick
            c.save()
            tx, ty = cx - w / 2 + 10, cy + h / 2 - 12
            c.translate(tx + 70, ty - 6)
            c.scale(sc, sc)
            c.translate(-(tx + 70), -(ty - 6))
            copyright_tag(c, tx, ty, 1.0, INK, stick * (1 - vd))
            c.restore()
            flash_on(x, "stick", t, 34, 0.12, 0.02)
        lab_y = cy - h / 2 - 50
        if vd <= 0:
            tag(c, "汽车", "CAR", cx, lab_y, COOL, fu, 44, "center")
        else:
            big_number(c, "马", cx, lab_y - 20, 120, NEG, vd)
            tag(c, "AI 的回答", "THE AI SAYS", cx, lab_y - 110, DIM, vd, 24, "center")
            flash_on(x, "verdict", t, 34, 0.4, 0.06)
        if t_of(34, 3) <= t < B(35):
            x.dim = 0.85
    x.zoom = max(x.zoom, 1 + 0.008 * k)


@shot(B(36), B(40), tin=0.0, tout=0.0, kin="cut", kout="cut")
def split(c, x, t, lt):
    u = pop("split", t, 0.35, 36)
    flash_on(x, "split", t, 36, 0.15, 0.02)
    c.drawLine(CX, 160, CX, 860 * u + 160 * (1 - u), paint(FAINT, 1, stroke=2))
    # left: 1907, the horse watching a face
    lx, rx = 480, 1440
    spot(c, lx, 480, 380, WARM, 0.3 * u)
    horse(c, lx - 230, 740, 0.85, INK, u, 0.0, 0.35, eye=0.6)
    asker(c, lx + 250, 560, 0.75, COOL, u)
    ex, ey = lx - 230 + 180 * 0.85, 740 - 312 * 0.85
    c.drawLine(ex + 10, ey, lx + 210, 430, paint(WARM, u * 0.9, stroke=3))
    tag(c, "1907 · 看人的脸", "THE FACE", lx, 220, WARM, u, 36, "center")
    # right: 2019, the classifier watching a corner
    photo(c, rx, 520, 460, 320, u, "horse", 1.0, 0.8, s=0.46)
    tag(c, "2019 · 看图片角落", "THE CORNER", rx, 220, COOL, u, 36, "center")
    if t >= B(38):
        v = smooth((t - B(38)) / 0.4)
        for xx in (lx, rx):
            tag(c, "答案对", "RIGHT ANSWER", xx - 110, 830, WARM, v, 30, "center")
            tag(c, "理由错", "WRONG REASON", xx + 110, 830, NEG, smooth((t - t_of(38, 1)) / 0.3), 30, "center")
    if t >= B(39):
        v = smooth((t - B(39)) / 0.4)
        tag(c, "一条近路", "A SHORTCUT", CX, 130, NEG, v, 34, "center")


# ------------------------------------------------------------------ your own Hans (bars 40-54)
def person_row(c, n, y_, a, cols, t0, t):
    for i in range(n):
        u = ease_out(clamp((t - t0 - i * 0.06) / 0.25), 3)
        figure(c, CX - (n - 1) * 70 + i * 140, y_, 0.8, cols[i % len(cols)], a * u)


@shot(B(40), B(48), tin=0.0, tout=0.0, kin="cut", kout="cut")
def life(c, x, t, lt):
    # bars 40-41: you, and an exam question asked another way
    if t < B(42):
        u = smooth((t - B(40)) / 0.5)
        spot(c, 560, 560, 380, WARM, 0.3 * u)
        figure(c, 560, 820, 1.4, INK, u)
        horse(c, 560 - 150, 830, 0.35, WARM, u * 0.55, 0.0, 0.2)
        tag(c, "你", "YOU", 560, 470, DIM, u, 34, "center")
        cu = pop("card", t, 0.25, 41)
        fl = clamp(since("flip", t, 41) / 0.25) if since("flip", t, 41) < 1e8 else 0.0
        sx = abs(math.cos(math.pi * fl)) if fl < 1 else 1.0
        txt = "x + 5 = 12" if fl < 0.5 else "12 − x = 5"
        if cu > 0:
            c.save()
            c.translate(1300, 420)
            c.scale(max(0.02, sx), 1)
            c.translate(-1300, -420)
            card(c, txt, 1300, 420, cu, COOL if fl < 0.5 else NEG, 520, 170, 72)
            c.restore()
        if fl >= 1:
            v = smooth((since("flip", t, 41) - 0.1) / 0.3)
            tag(c, "背过的答案：7", "MEMORISED: 7", 1300, 600, WARM, v, 30, "center")
            tag(c, "换个问法：不会了", "ASKED ANOTHER WAY: STUCK", 1300, 680, NEG, smooth((t - t_of(41, 3)) / 0.3), 30,
                "center")
        return
    # bars 42-43: the three marked topics all come up
    if t < B(44):
        a = 1 - smooth((t - t_of(43, 3)) / 0.4)
        c.drawRRect(rrect(660, 200, 600, 620, 10), paint((0.06, 0.07, 0.09), 0.95 * a))
        c.drawRRect(rrect(660, 200, 600, 620, 10), paint(DIM, 0.8 * a, stroke=2))
        tag(c, "期末考试", "FINAL EXAM", 700, 260, DIM, a, 30)
        for i in range(3):
            y_ = 340 + i * 150
            for j in range(3):
                c.drawLine(700, y_ + j * 30, 700 + [420, 380, 300][j], y_ + j * 30, paint(FAINT, a, stroke=4))
            hs = [h for h in hits("check", 42)]
            cs = t - hs[i] if t >= hs[i] else -1
            if cs >= 0:
                check_mark(c, 1170, y_ + 30, 60, WARM, a, ease_out(clamp(cs / 0.15), 3))
        if t >= B(43):
            v = smooth((t - B(43)) / 0.5) * a
            spot(c, CX, 500, 520, WARM, 0.35 * v)
            tag(c, "全对。", "ALL CORRECT", CX, 900, WARM, v, 34, "center")
        return
    # bar 44: one heartbreak, then everyone wears the same face
    if t < B(45):
        u = smooth((t - B(44)) / 0.3)
        figure(c, 520, 760, 1.2, NEG, u)
        tag(c, "一次", "ONCE", 520, 420, NEG, u, 34, "center")
        v = clamp((t - t_of(44, 1.5)) / (BEAT * 1.5))
        c.drawLine(680, 600, 680 + 220 * ease_out(v, 3), 600, paint(DIM, v, stroke=3))
        for i in range(6):
            uu = ease_out(clamp((t - t_of(44, 2) - i * BEAT * 0.25) / 0.2), 3)
            figure(c, 1000 + (i % 3) * 230, 560 + (i // 3) * 300, 0.75, NEG, uu)
        tag(c, "所有人", "EVERYONE", 1230, 230, NEG, clamp((t - t_of(44, 2)) / 0.3), 34, "center")
        return
    # bars 45-47: three points and a whole line; the shortcut
    if t < B(47):
        pts = [(0.30, 0.42), (0.40, 0.50), (0.50, 0.58)]
        for i, (u_, v_) in enumerate(pts):
            s = since_nth("dot", i, t, 45)
            if s >= 0:
                c.drawCircle(*px(u_, v_), 14 * back_out(clamp(s / 0.2)), paint(INK, 0.95))
        ds = since("draw", t, 45)
        if ds < 1e8:
            u = ease_out(clamp(ds / (BEAT * 1.5)), 3)
            a0, a1 = px(lerp(0.4, -0.05, u), lerp(0.5, 0.5 - 0.8 * 0.45, u)), px(lerp(0.4, 1.05, u),
                                                                                 lerp(0.5, 0.5 + 0.8 * 0.65, u))
            c.drawLine(*a0, *a1, paint(NEG, 0.4, stroke=12, blur=8, cap_round=True))
            c.drawLine(*a0, *a1, paint(NEG, 1.0, stroke=4, cap_round=True))
            tag(c, "一整条线", "A WHOLE LINE", 1500, 240, NEG, u, 32, "center")
        if t >= B(46):
            v = smooth((t - B(46)) / 0.4)
            c.drawRRect(rrect(px(0.3, 0)[0] - 50, px(0, 0.62)[1] - 50, px(0.5, 0)[0] - px(0.3, 0)[0] + 100,
                              px(0, 0.42)[1] - px(0, 0.62)[1] + 100, 16), paint(COOL, v * 0.9, stroke=3))
            tag(c, "我们见过的", "WHAT WE'VE SEEN", px(0.4, 0)[0], px(0, 0.42)[1] + 110, COOL, v, 28, "center")
        return
    # bar 47: the shortest path the brain can find
    u = smooth((t - B(47)) / 0.3)
    a_, b_ = (420, 720), (1500, 380)
    p = skia.Path()
    p.moveTo(*a_)
    p.cubicTo(500, 200, 800, 950, 960, 520)
    p.cubicTo(1100, 160, 1350, 860, 1500, 380)
    m = skia.PathMeasure(p, False)
    seg = skia.Path()
    m.getSegment(0, m.getLength() * clamp((t - B(47)) / (BAR * 0.7)), seg, True)
    c.drawPath(seg, paint(DIM, u * 0.8, stroke=4, cap_round=True))
    v = ease_out(clamp((t - t_of(47, 2)) / 0.3), 3)
    c.drawLine(*a_, lerp(a_[0], b_[0], v), lerp(a_[1], b_[1], v), paint(NEG, 0.4, stroke=12, blur=8))
    c.drawLine(*a_, lerp(a_[0], b_[0], v), lerp(a_[1], b_[1], v), paint(NEG, 1, stroke=4, cap_round=True))
    for pt, cn, en in ((a_, "问题", "QUESTION"), (b_, "答案", "ANSWER")):
        c.drawCircle(*pt, 12, paint(INK, u))
        tag(c, cn, en, pt[0], pt[1] + 60, DIM, u, 28, "center")
    tag(c, "理解", "UNDERSTANDING", 960, 300, DIM, u * 0.9, 28, "center")
    tag(c, "近路", "SHORTCUT", 1180, 590, NEG, v, 36, "center")


@shot(B(48), B(54), tin=0.0, tout=0.0, kin="cut", kout="cut")
def fixes(c, x, t, lt):
    k = S.pulse("kick", t, 0.12)
    if t < B(51):
        header(c, "AI 的两个防法", "TWO FIXES", smooth((t - B(48)) / 0.3))
        schematic(c, 1.0)
        # ① hold some questions back
        su = pop("split", t, 0.3, 49)
        tag(c, "① 留一批没见过的题", "HOLD-OUT SET", 140, 260, COOL, smooth((t - B(49)) / 0.3), 30)
        ih = it = 0
        for i in range(24):
            hold = i % 4 == 3
            x0_, y0_ = 200 + (i % 6) * 100, 360 + (i // 6) * 100
            if hold:
                x1_, y1_ = 860 + (ih % 2) * 100, 360 + (ih // 2) * 100
                ih += 1
            else:
                x1_, y1_ = 200 + (it % 6) * 100, 360 + (it // 6) * 100
                it += 1
            u_ = ease_io(su)
            c.drawCircle(lerp(x0_, x1_, u_), lerp(y0_, y1_, u_), 16,
                         paint(COOL if hold else INK, 0.9 * smooth((t - B(48) - i * 0.02) / 0.3),
                               stroke=4 if hold else 0))
        if su > 0:
            c.drawLine(790, 330 - 30 * su, 790, 680 + 30 * su, paint(DIM, su, stroke=2))
            tag(c, "练习", "TRAIN", 450, 790, INK, su, 28, "center")
            tag(c, "专门考", "TEST ONLY", 910, 790, COOL, su, 28, "center")
        # ② don't memorise every detail: the wiggle relaxes into the rule
        if t >= B(50):
            tag(c, "② 别记太细", "REGULARISATION", 1120, 260, WARM, smooth((t - B(50)) / 0.3), 30)
            m = ease_io(clamp(since("smooth", t, 50) / (BAR * 0.8)))
            c.save()
            c.translate(1120 - PL_X0 * 0.5, 330 - PL_Y1 * 0.5)
            c.scale(0.5, 0.5)
            for i in range(N_TRAIN):
                c.drawCircle(*px(TR_U[i], TR_V[i]), 14, paint(INK, 0.95))
            curve(c, lambda u: lerp(wiggle(u), truth(u), m), TR_U[0], TR_U[-1], mixc(NEG, WARM, m), 1.0, 7)
            c.restore()
        x.zoom = max(x.zoom, 1 + 0.008 * k)
        return
    # bars 51-53: and for people
    if t < B(52):
        u = smooth((t - B(51)) / 0.4)
        figure(c, CX, 800, 1.4, INK, u)
        tag(c, "放到人身上", "AND FOR US", CX, 380, DIM, u, 34, "center")
        return
    cu = pop("card", t, 0.25, 52)
    card(c, "2 + 3 = ?", 640, 400, cu, COOL, 400, 140, 60)
    v = smooth((t - t_of(52, 1)) / 0.3)
    card(c, "5 − ? = 2", 1280, 400, v, WARM, 400, 140, 60)
    tag(c, "同一道题，换个问法", "SAME QUESTION, ANOTHER WAY", CX, 230, DIM, cu, 30, "center")
    cols = [COOL, WARM, INK, (0.7, 0.85, 0.6)]
    sizes = [0.7, 0.9, 0.8, 0.65]
    for i in range(4):
        s = since_nth("pop", i, t, 53)
        if s < 0:
            continue
        u = back_out(clamp(s / 0.25))
        figure(c, 520 + i * 290, 880, sizes[i] * 1.35 * u, cols[i], min(1, u))
    x.zoom = max(x.zoom, 1 + 0.008 * k)


# ------------------------------------------------------------------ coda, back on the stage, the end
@shot(B(54), B(56), tin=0.0, tout=0.0, kin="cut", kout="cut")
def coda(c, x, t, lt):
    flash_on(x, "slam", t, 54, 0.25, 0.04)
    spot(c, CX, 540, 620, WARM if t < B(55) else COOL, 0.3)
    horse(c, 760, 900, 1.0, INK, 0.12, 0.0, 0.0)


QS_X = 1450


@shot(B(56), B(62), tin=0.0, tout=0.0, kin="cut", kout="cut")
def back(c, x, t, lt):
    t = frozen(t)
    th = min(t, t_of(59, 3))                       # the horse holds its pose after the silence
    lamp = pop("lamp", t, 0.15, 56)
    flash_on(x, "lamp", t, 56, 0.1, 0.02)
    spot(c, HX, GROUND - 160, 520, WARM, lamp * 0.42)
    beam(c, HX, -60, GROUND + 40, 120, 760, WARM, lamp * 0.9)
    c.drawLine(140, GROUND, 1780, GROUND, paint(FAINT, lamp, stroke=2))
    lift = tap_lift(th, "tap4", extra=[t_of(59, 3.5)])
    k = math.exp(-since("tap4", th) / 0.12) if since("tap4", th) < 1 else 0.0
    horse(c, HX, GROUND, HS, INK, lamp, lift, 0.5 + 0.4 * k, eye=0.25 + 0.5 * smooth((t - B(60)) / 1.5))
    dust(c, th, since("tap4", th), *hoof_xy(), a=lamp)
    # the asker, who doesn't know either: no nod is coming
    asker(c, QS_X, 760, 1.0, COOL, lamp * 0.9)
    cu = pop("card", t, 0.3, 57)
    card(c, "? + ? = ?", QS_X, 300, cu, COOL, 380, 140, 60)
    if cu > 0:
        tag(c, "他也不知道", "HE DOESN'T KNOW EITHER", QS_X, 420, COOL, cu, 26, "center")
    n = count("tap4", th, 56)
    if n:
        big_number(c, str(n), 1160, 420, 170, INK if n <= 5 else NEG, pop("tap4", th, 0.14, 56))
        for i in range(n):
            c.drawCircle(1160 - 135 + i * 45, 560, 8, paint(INK if i < 5 else NEG, 0.9))
    if t >= t_of(59, 3):
        x.dim = 0.9 if t < B(60) else lerp(0.25, 0.45, smooth((t - B(60)) / (2 * BAR)))


@shot(B(62), B(64), tin=0.0, tout=0.0, kin="cut", kout="cut")
def final(c, x, t, lt):
    spot(c, CX, 540, 600, WARM, 0.25)
    ex, ey = CX, 300
    spot(c, ex, ey, 80, WARM, 0.6 * smooth((t - B(62)) / 0.8))
    c.drawCircle(ex, ey, 6, paint(INK, smooth((t - B(62)) / 0.8)))


REFS = ["Pfungst, O. (1907/1911). Clever Hans (The Horse of Mr. von Osten). Henry Holt.",
        "Lapuschkin, S. et al. (2019). Unmasking Clever Hans predictors and assessing what machines really learn.",
        "    Nature Communications, 10, 1096.",
        "Hans Commission (Stumpf et al.), report of 12 September 1904, as described by Pfungst (1907)."]


@shot(B(64), B(68), tin=0.8, tout=0.0, kin="fade", kout="cut")
def end_card(c, x, t, lt):
    u = smooth(lt / 1.0)
    tag(c, CONCEPT, CONCEPT_EN, CX, 300, DIM, u * 0.9, 26, "center")
    title_glow(c, TITLE, CX, 450, 104, INK, u)
    c.drawLine(CX - 220, 500, CX + 220, 500, paint(FAINT, u, stroke=1.5))
    f = font(18, "Light")
    for i, r in enumerate(REFS):
        draw_text(c, r, CX, 590 + i * 32, f, paint(DIM, 0.8 * smooth((lt - 0.6 - i * 0.12) / 0.6)))
    tag(c, "片中的曲线、分数、照片和水印为示意，不是原始数据；89% 与 6% 来自 Pfungst 的记录", None, CX, 790, DIM,
        0.7 * smooth((lt - 1.4) / 0.6), 22, "center")


LOOKS = {"hook": LOOKS_BASE["deep"], "count": LOOKS_BASE["warm"], "quiz": LOOKS_BASE["night"],
         "panel": LOOKS_BASE["cool"], "push": LOOKS_BASE["deep"], "title": LOOKS_BASE["deep"],
         "pfungst": LOOKS_BASE["night"], "cue": LOOKS_BASE["deep"], "overfit": LOOKS_BASE["night"],
         "ai": LOOKS_BASE["cool"], "life": LOOKS_BASE["warm"], "coda": LOOKS_BASE["deep"],
         "back": LOOKS_BASE["night"], "final": LOOKS_BASE["deep"], "end": LOOKS_BASE["deep"]}
style = QuietConcept(tl, S, LOOKS, captions=captions(), intro_fade=0.05, outro_fade=2.5)

if __name__ == "__main__":
    run(style.frame, style.setup, tl.dur, tl.fps, OUT, f"{TITLE}_CleverHans.mp4")
