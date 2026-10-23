"""quiet_concept look (一帧一理): a dark navy stage, one light source, serif captions that fade in per character.

    style = QuietConcept(tl, S, LOOKS, captions=CAPTIONS)
    run(style.frame, style.setup, tl.dur, ...)

LOOKS: section name -> dict(center, edge (RGB 0..1 background gradient), dust (alpha of the drifting dust)).
CAPTIONS: list of (t0, t1, text, pos, size[, line_delay]).  text marks words with {warm} [cool] <red>; pos is "bottom",
"top" or "center".  The style draws captions itself, above the shots and below the vignette, so shots only
draw the picture.  Shots push per-frame knobs through Ctx (x.zoom, x.flash, x.dim, x.cap_dim).
"""
import math
import os
import re
import sys

import numpy as np
import skia

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from core.gfx import *  # noqa: E402,F401,F403
from core.timeline import Ctx  # noqa: E402
from core import post  # noqa: E402
from core.cover import spaced, save_png  # noqa: E402,F401

# ------------------------------------------------------------------ palette
INK = (0.93, 0.93, 0.95)       # caption white
DIM = (0.56, 0.59, 0.67)       # annotations
FAINT = (0.30, 0.33, 0.40)     # rules, axes
WARM = (1.0, 0.74, 0.38)       # one warm accent: the familiar, exploit
COOL = (0.46, 0.74, 1.0)       # one cool accent: the unknown, explore
NEG = (0.96, 0.38, 0.38)       # bad outcomes only

LOOKS_BASE = {
    "night": dict(center=(0.055, 0.065, 0.10), edge=(0.008, 0.010, 0.018), dust=0.55),
    "warm": dict(center=(0.085, 0.065, 0.055), edge=(0.010, 0.009, 0.012), dust=0.45),
    "cool": dict(center=(0.040, 0.070, 0.105), edge=(0.006, 0.010, 0.020), dust=0.55),
    "deep": dict(center=(0.030, 0.034, 0.055), edge=(0.004, 0.005, 0.010), dust=0.35),
}

LIN = skia.SamplingOptions(skia.FilterMode.kLinear)
MARK = {"{": WARM, "[": COOL, "<": NEG}


def serif(size, bold=False):
    return font(size, "serif", bold=bold)


def label_font(size):
    return font(size, "Medium")


def parse_marks(s):
    """'你吃过{23}次' -> [(ch, colour), ...] with the mark characters removed."""
    out, col = [], INK
    for ch in s:
        if ch in MARK:
            col = MARK[ch]
        elif ch in "}]>":
            col = INK
        else:
            out.append((ch, col))
    return out


def caption_line(c, s, x, y, size, t, a=1.0, align="center", bold=False, stagger=0.03, dur=0.5, rise=10,
                 shadow=True):
    """Serif line, each character fades and rises in (t = seconds since the line started)."""
    f = serif(size, bold)
    chars = parse_marks(s)
    widths = [f.measureText(ch) for ch, _ in chars]
    total = sum(widths)
    xx = x - total / 2 if align == "center" else (x - total if align == "right" else x)
    for i, ((ch, col), w) in enumerate(zip(chars, widths)):
        u = ease_out((t - i * stagger) / dur, 2) if t is not None else 1.0
        aa = a * u
        if aa > 0.003:
            oy = (1 - u) * rise
            if shadow:
                c.drawString(ch, xx, y + oy + 2, f, paint((0, 0, 0), aa * 0.8, blur=6))
            if col != INK:
                c.drawString(ch, xx, y + oy, f, paint(col, aa * 0.35, blur=10))
            c.drawString(ch, xx, y + oy, f, paint(col, aa, blur=(1 - u) * 4))
        xx += w
    return total


def tag(c, cn, en, x, y, col=DIM, a=1.0, size=26, align="left"):
    """Report-style annotation: a small serif Chinese name with a tiny spaced English line under it."""
    if a <= 0.003:
        return
    f = serif(size)
    w = f.measureText(cn)
    xx = x - w / 2 if align == "center" else (x - w if align == "right" else x)
    c.drawString(cn, xx, y, f, paint(col, a))
    if en:
        fe = label_font(size * 0.48)
        lay, tot = char_layout(en, fe, size * 0.12)
        ex = x - tot / 2 if align == "center" else (x - tot if align == "right" else x)
        for ch, dx, _ in lay:
            c.drawString(ch, ex + dx, y + size * 0.78, fe, paint(col, a * 0.65))


def spaced_en(c, s, x, y, size, col=DIM, a=1.0, sp=None, align="center", kind="Medium"):
    f = font(size, kind)
    spaced(c, s, x, y, f, size * 0.32 if sp is None else sp, col, a, align)


def spot(c, x, y, r, col=WARM, a=1.0):
    """A soft pool of light (radial gradient)."""
    if a <= 0.003:
        return
    sh = skia.GradientShader.MakeRadial(skia.Point(x, y), r, [argb(col, 0.55 * a), argb(col, 0.16 * a),
                                                             argb(col, 0)], [0.0, 0.35, 1.0])
    c.drawCircle(x, y, r, skia.Paint(Shader=sh, BlendMode=PLUS, AntiAlias=True))


def beam(c, x, y_top, y_bot, w_top, w_bot, col=WARM, a=1.0):
    """A light cone from (x, y_top) widening to the floor."""
    if a <= 0.003:
        return
    path = skia.Path()
    path.moveTo(x - w_top / 2, y_top)
    path.lineTo(x + w_top / 2, y_top)
    path.lineTo(x + w_bot / 2, y_bot)
    path.lineTo(x - w_bot / 2, y_bot)
    path.close()
    sh = skia.GradientShader.MakeLinear([skia.Point(x, y_top), skia.Point(x, y_bot)],
                                        [argb(col, 0.20 * a), argb(col, 0.04 * a)])
    c.drawPath(path, skia.Paint(Shader=sh, BlendMode=PLUS, AntiAlias=True,
                                MaskFilter=skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 18)))


def figure(c, x, y, s=1.0, col=INK, a=1.0, walk=None, glow=0.5):
    """Line-drawn person standing on (x, y) = feet.  walk: phase in radians to swing the limbs."""
    if a <= 0.003:
        return
    sw = 5 * s
    sp = walk if walk is not None else 0.0
    amp = 0.35 if walk is not None else 0.0
    hip = (x, y - 92 * s)
    neck = (x, y - 160 * s)
    head = (x, y - 186 * s)
    leg = 92 * s
    arm = 66 * s
    lines = []
    for sgn in (1, -1):
        ang = amp * math.sin(sp) * sgn
        lines.append((hip, (hip[0] + math.sin(ang) * leg, hip[1] + math.cos(ang) * leg)))
        ang2 = -amp * 0.8 * math.sin(sp) * sgn + 0.12 * sgn
        lines.append(((neck[0], neck[1] + 8 * s), (neck[0] + math.sin(ang2) * arm, neck[1] + 8 * s +
                                                   math.cos(ang2) * arm)))
    lines.append((neck, hip))
    for layer, (aa, bl, wd) in enumerate([(glow * 0.6, 10 * s, sw * 2.6), (1.0, 0, sw)]):
        if aa <= 0:
            continue
        p = paint(col, a * aa, stroke=wd, blur=bl, cap_round=True)
        for p0, p1 in lines:
            c.drawLine(*p0, *p1, p)
        c.drawCircle(head[0], head[1], 22 * s, p)


def counter(v, lo, hi):
    return int(round(lerp(lo, hi, clamp(v))))


class QuietConcept:
    def __init__(self, tl, sync, looks, captions=(), intro_fade=1.2, outro_fade=2.5, watermark="一帧一理",
                 w=W, h=H):
        self.tl, self.S, self.looks = tl, sync, looks
        self.captions = list(captions)
        self.intro_fade, self.outro_fade = intro_fade, outro_fade
        self.watermark = watermark
        self.w, self.h = w, h

    def setup(self):
        self.bloom = post.Bloom(self.w, self.h)
        r = np.random.default_rng(11)
        n = 170
        self.dust = np.stack([r.uniform(0, self.w, n), r.uniform(0, self.h, n), r.uniform(0.3, 1.0, n),
                              r.uniform(0, 6.28, n), r.uniform(0.6, 2.2, n)], 1)
        self.grain = post.make_grain(r, self.w, self.h, 2.4)

    # ------------------------------------------------------------ layers
    def background(self, c, t, look):
        W_, H_ = self.w, self.h
        sh = skia.GradientShader.MakeRadial(skia.Point(W_ * 0.5, H_ * 0.42), W_ * 0.72,
                                            [argb(look["center"]), argb(look["edge"])], [0.0, 1.0])
        c.drawPaint(skia.Paint(Shader=sh))
        for sx, sy, depth, ph, sz in self.dust:
            xx = (sx + t * 6 * depth + math.sin(t * 0.21 + ph) * 18) % W_
            yy = (sy - t * 9 * depth) % H_
            a = look["dust"] * 0.22 * depth * (0.5 + 0.5 * math.sin(t * 0.9 + ph * 3))
            if a > 0.01:
                c.drawCircle(xx, yy, sz * depth, paint(INK, a))

    def caption_layer(self, c, t, x):
        a_all = 1.0 - x.cap_dim
        for cap in self.captions:
            t0, t1, text, pos, size = cap[:5]
            line_delay = cap[5] if len(cap) > 5 else 0.0
            if not (t0 <= t < t1 + 0.4):
                continue
            lt = t - t0
            a = a_all * (1 - smooth((t - t1) / 0.4)) if t > t1 else a_all
            lines = text.split("\n")
            if pos == "center":
                y0 = self.h / 2 + size * 0.35 - (len(lines) - 1) * size * 0.75
                gap = size * 1.5
            elif pos == "top":
                y0, gap = 128 + size, size * 1.45
            else:
                y0 = self.h - 96 - (len(lines) - 1) * size * 1.45
                gap = size * 1.45
                # soft dark band so captions read over anything
                band = skia.GradientShader.MakeLinear([skia.Point(0, self.h - 300), skia.Point(0, self.h)],
                                                      [argb((0, 0, 0), 0), argb((0, 0, 0), 0.55 * a)])
                c.drawRect(skia.Rect(0, self.h - 300, self.w, self.h), skia.Paint(Shader=band))
            n_before = 0
            for i, ln in enumerate(lines):
                caption_line(c, ln, self.w / 2, y0 + i * gap, size, lt - n_before * 0.03 - i * line_delay, a=a,
                             bold=pos == "center")
                n_before += len(parse_marks(ln))

    def frame(self, fi):
        t = fi / self.tl.fps
        W_, H_ = self.w, self.h
        cx, cy = W_ / 2, H_ / 2
        surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(W_, H_, skia.kRGBA_8888_ColorType,
                                                           skia.kPremul_AlphaType))
        c = surf.getCanvas()
        look = self.tl.look_at(self.looks, t, width=2.0, lead=1.0)
        x = Ctx(t)
        x.look = look
        x.cap_dim = 0.0
        pic = self.tl.record(x, t)

        self.background(c, t, look)
        c.save()
        zoom = x.zoom * (1 + 0.004 * math.sin(t * 0.21))
        dx = 4 * math.sin(t * 0.23) + 2 * math.sin(t * 0.61 + 1)
        dy = 3 * math.sin(t * 0.31 + 2)
        c.translate(cx + dx, cy + dy)
        c.scale(zoom, zoom)
        c.translate(-cx, -cy)
        c.drawPicture(pic)
        c.restore()
        if x.dim > 0.003:
            c.drawPaint(paint((0, 0, 0), x.dim))
        self.caption_layer(c, t, x)
        if self.watermark:
            f = serif(24)
            c.drawString(self.watermark, W_ - 64 - f.measureText(self.watermark), 70, f, paint(INK, 0.42))
        post.vignette(c, W_, H_, 0.55, inner=0.5)
        if x.flash > 0.01:
            c.drawPaint(paint((1.0, 0.95, 0.88), min(1, x.flash), blend=SCREEN))
        self.bloom.apply(surf, alpha=0.22, gain=1.8, threshold=1.3, blur=8)
        fade = 1.0
        if t < self.intro_fade:
            fade = smooth(t / self.intro_fade)
        if t > self.tl.dur - self.outro_fade:
            fade = min(fade, smooth((self.tl.dur - t) / self.outro_fade))
        if fade < 0.999:
            c.drawPaint(paint((0, 0, 0), 1 - fade))
        out = post.to_array(surf).astype(np.int16)
        post.add_grain(out, self.grain, fi)
        return post.finish(out).astype(np.uint8).tobytes()


# ------------------------------------------------------------------ covers
def cover_background(c, w, h, look=None):
    look = look or LOOKS_BASE["night"]
    sh = skia.GradientShader.MakeRadial(skia.Point(w * 0.5, h * 0.42), max(w, h) * 0.72,
                                        [argb(look["center"]), argb(look["edge"])], [0.0, 1.0])
    c.drawPaint(skia.Paint(Shader=sh))


def title_glow(c, s, x, y, size, col=INK, a=1.0, align="center"):
    """The headline: bold serif with a wide soft halo."""
    f = serif(size, bold=True)
    w = f.measureText(s)
    xx = x - w / 2 if align == "center" else x
    c.drawString(s, xx, y, f, paint(col, a * 0.35, blur=size * 0.18))
    c.drawString(s, xx, y, f, paint(col, a * 0.25, blur=size * 0.05))
    c.drawString(s, xx, y, f, paint(col, a))
    return w
