"""neon_science look: SkSL nebula background + stars + bokeh, audio-reactive fx, bloom/chroma/grain/glitch.

    style = NeonNebula(tl, S, LOOKS, drops=("drop1", "drop2"), glitch_at=[...])
    run(style.frame, style.setup, tl.dur, ...)

LOOKS: section name -> dict(bg, c1, c2, c3 (RGB 0..1), warp).  PALETTES below are the
first film's looks, reusable by mood.  Shots push per-frame knobs through Ctx
(x.chroma on hits, x.shake, x.split for the two-perspective tint, x.zoom).
"""
import math
import os
import sys

import numpy as np
import skia

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from core.gfx import *  # noqa: E402,F401,F403
from core.timeline import Ctx  # noqa: E402
from core import post  # noqa: E402

BG_SKSL = """
uniform float2 res; uniform float time; uniform float energy; uniform float warp;
uniform float3 c1; uniform float3 c2; uniform float3 c3; uniform float3 bg;
uniform float split; uniform float3 c4;
float hash(float2 p){ return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453); }
float noise(float2 p){
  float2 i = floor(p); float2 f = fract(p); float2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+float2(1,0)), u.x), mix(hash(i+float2(0,1)), hash(i+float2(1,1)), u.x), u.y);
}
float fbm(float2 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++){ v += a*noise(p); p = p*2.03 + float2(1.7, 9.2); a *= 0.5; }
  return v;
}
half4 main(float2 fc){
  float2 uv = (fc - 0.5*res) / res.y;
  float t = time * 0.045;
  float2 q = float2(fbm(uv*1.5 + float2(t, -t*0.7)), fbm(uv*1.5 + float2(5.2 - t*0.8, 1.3 + t)));
  float2 r = float2(fbm(uv*1.3 + warp*q + float2(1.7, 9.2) + t*1.4), fbm(uv*1.3 + warp*q + float2(8.3, 2.8) - t));
  float f = fbm(uv*1.1 + warp*r);
  float3 col = mix(bg, c1, smoothstep(0.25, 0.85, f));
  col = mix(col, c2, clamp(length(q) - 0.45, 0.0, 1.0) * 0.9);
  col = mix(col, c3, smoothstep(0.55, 0.95, r.x) * 0.75);
  // optional split tint (left warm/red, right cool) for the "two perspectives" scenes
  float side = smoothstep(-0.05, 0.05, uv.x);
  col = mix(col, mix(col * c4 * 2.2, col, side), split);
  col *= (0.45 + 0.8*f) * (0.72 + 0.35*energy);
  col = pow(max(col, float3(0.0)), float3(1.18)) * 1.2;
  float vig = 1.0 - 0.7*dot(uv*0.95, uv*0.95);
  return half4(half3(col * vig), 1);
}
"""

# mood palettes from the first film (bg, c1, c2, c3, warp) — pick per section
PALETTES = {
    "night": dict(bg=(0.01, 0.01, 0.04), c1=(0.10, 0.09, 0.32), c2=(0.04, 0.22, 0.42), c3=(0.36, 0.12, 0.40), warp=2.2),
    "anxious": dict(bg=(0.012, 0.008, 0.035), c1=(0.09, 0.09, 0.30), c2=(0.32, 0.04, 0.14), c3=(0.08, 0.16, 0.42), warp=2.6),
    "lab": dict(bg=(0.0, 0.015, 0.04), c1=(0.0, 0.20, 0.30), c2=(0.06, 0.08, 0.36), c3=(0.0, 0.38, 0.45), warp=2.4),
    "magenta_drop": dict(bg=(0.035, 0.0, 0.05), c1=(0.50, 0.08, 0.42), c2=(0.95, 0.42, 0.18), c3=(0.16, 0.25, 0.90), warp=3.2),
    "amber": dict(bg=(0.03, 0.012, 0.03), c1=(0.42, 0.20, 0.08), c2=(0.22, 0.08, 0.38), c3=(0.75, 0.42, 0.16), warp=2.2),
    "teal_red": dict(bg=(0.015, 0.015, 0.04), c1=(0.04, 0.26, 0.32), c2=(0.40, 0.06, 0.10), c3=(0.18, 0.13, 0.46), warp=2.6),
    "violet_drop": dict(bg=(0.02, 0.0, 0.05), c1=(0.22, 0.14, 0.70), c2=(1.0, 0.38, 0.32), c3=(0.08, 0.62, 0.66), warp=3.2),
    "cool": dict(bg=(0.02, 0.02, 0.05), c1=(0.12, 0.34, 0.46), c2=(0.70, 0.30, 0.34), c3=(0.30, 0.20, 0.60), warp=2.6),
    "warm_end": dict(bg=(0.02, 0.02, 0.06), c1=(0.42, 0.24, 0.52), c2=(0.95, 0.55, 0.36), c3=(0.22, 0.38, 0.80), warp=2.0),
}

LIN = skia.SamplingOptions(skia.FilterMode.kLinear)
BGW, BGH = 384, 216  # the shader is the slow part: render small, upscale


def flare(c, x, y, k, col):
    """Anamorphic light streak."""
    if k <= 0.02:
        return
    c.drawRect(skia.Rect.MakeLTRB(x - 900, y - 2, x + 900, y + 2), paint(col, 0.5 * k, blur=6, blend=PLUS))
    c.drawRect(skia.Rect.MakeLTRB(x - 500, y - 1, x + 500, y + 1), paint(WHITE, 0.7 * k, blend=PLUS))
    c.drawCircle(x, y, 60, paint(col, 0.35 * k, blur=40, blend=PLUS))


class NeonNebula:
    def __init__(self, tl, sync, looks, drops=("drop1", "drop2"), star_density=None, clap_rings=None,
                 glitch_at=(), intro_fade=2.0, w=W, h=H):
        self.tl, self.S, self.looks = tl, sync, looks
        self.drops = tuple(drops)
        self.star_density = star_density or {}
        # section -> ring colour for small rings on claps
        self.clap_rings = clap_rings if clap_rings is not None else {d: PINK for d in self.drops}
        self.glitch_at = list(glitch_at)
        self.intro_fade = intro_fade
        self.w, self.h = w, h

    # ------------------------------------------------------------ setup (once per worker)
    def setup(self):
        self.eff = skia.RuntimeEffect.MakeForShader(BG_SKSL)
        self.bg_surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(BGW, BGH, skia.kRGBA_8888_ColorType,
                                                                   skia.kPremul_AlphaType))
        self.bloom = post.Bloom(self.w, self.h)
        r = np.random.default_rng(7)
        self.stars = np.stack([r.uniform(0, self.w, 420), r.uniform(0, self.h, 420), r.uniform(0.3, 1.0, 420),
                               r.uniform(0, 6.28, 420), r.uniform(0.2, 1.0, 420)], 1)
        self.grain = post.make_grain(r, self.w, self.h, 3)

    # ------------------------------------------------------------ helpers
    def kick(self, t, d=0.12):
        return self.S.pulse("kick", t, d)

    def in_drop(self, t):
        return self.tl.section_at(t) in self.drops

    def look_at(self, t):
        """Blend section looks: drops switch fast, everything else glides over ~1.5 s."""
        tl = self.tl
        names = [s[0] for s in tl.sections]
        starts = [tl.B(s[1]) for s in tl.sections]
        i = max(j for j, s in enumerate(starts) if s <= t + 1e-6)
        cur = self.looks[names[i]]
        if i == 0:
            return dict(cur)
        prev = self.looks[names[i - 1]]
        width = 0.12 if names[i] in self.drops else 1.6
        lead = 0.0 if names[i] in self.drops else 0.8
        u = smooth((t - starts[i] + lead) / width)
        nxt_u = None
        if i + 1 < len(starts) and names[i + 1] not in self.drops and t > starts[i + 1] - 0.8:
            nxt_u = smooth((t - starts[i + 1] + 0.8) / 1.6)
        out = {}
        for k in cur:
            a, b = prev[k], cur[k]
            v = tuple(lerp(x, y, u) for x, y in zip(a, b)) if isinstance(a, tuple) else lerp(a, b, u)
            if nxt_u is not None:
                n_ = self.looks[names[i + 1]][k]
                v = tuple(lerp(x, y, nxt_u) for x, y in zip(v, n_)) if isinstance(v, tuple) else lerp(v, n_, nxt_u)
            out[k] = v
        return out

    # ------------------------------------------------------------ layers
    def background(self, c, t, x):
        lk = self.look_at(t)
        energy = 0.35 + 0.65 * self.S.e("pad", t) * 0.6 + 0.5 * self.kick(t, 0.2) * self.in_drop(t)
        u = [BGW, BGH, t, energy, lk["warp"], *lk["c1"], *lk["c2"], *lk["c3"], *lk["bg"], x.split,
             1.0, 0.25, 0.3]
        sh = self.eff.makeShader(skia.Data.MakeWithCopy(np.array(u, np.float32).tobytes()))
        self.bg_surf.getCanvas().drawPaint(skia.Paint(Shader=sh))
        img = self.bg_surf.makeImageSnapshot()
        W_, H_ = self.w, self.h
        c.drawImageRect(img, skia.Rect(0, 0, BGW, BGH), skia.Rect(-20, -12, W_ + 20, H_ + 12), LIN)
        # parallax stars
        sec = self.tl.section_at(t)
        dens = self.star_density.get(sec, 1.0)
        speed = 40 if sec in self.drops else 8
        pts_by_alpha = {}
        for sx, sy, depth, ph, br in self.stars:
            xx = (sx - t * speed * depth) % W_
            yy = (sy + math.sin(t * 0.2 + ph) * 10 * depth) % H_
            a = br * dens * (0.55 + 0.45 * math.sin(t * 1.7 + ph * 3))
            key = round(a * 6) / 6
            pts_by_alpha.setdefault((key, depth > 0.75), []).append(skia.Point(xx, yy))
        for (a, big), pts in pts_by_alpha.items():
            if a <= 0:
                continue
            c.drawPoints(skia.Canvas.kPoints_PointMode, pts,
                         paint(WHITE, a * 0.8, stroke=3.2 if big else 1.8, cap_round=True))
        # speed streaks on drop kicks
        if sec in self.drops:
            k = self.kick(t, 0.1)
            if k > 0.05:
                for i in range(26):
                    yy = rnd("st", i) * H_
                    xx = (rnd("sx", i) * W_ - t * 2000 * (0.5 + rnd("sv", i))) % (W_ + 400) - 200
                    c.drawLine(xx, yy, xx + 260 * k, yy, paint(WHITE, 0.25 * k, stroke=2))

    def fx_back(self, c, t):
        """Slow bokeh orbs behind the content, tinted by the section palette."""
        lk = self.look_at(t)
        cols = [lk["c2"], lk["c3"], lk["c1"]]
        W_, H_ = self.w, self.h
        for i in range(16):
            r = 60 + 140 * rnd("bk", i)
            x = (rnd("bx", i) * (W_ + 2 * r) + t * (12 + 25 * rnd("bv", i))) % (W_ + 2 * r) - r
            y = rnd("by", i) * H_ + math.sin(t * 0.3 + i) * 40
            col = tuple(min(1.0, v * 2.2) for v in cols[i % 3])
            a = 0.06 + 0.06 * math.sin(t * 0.7 + i * 1.7) ** 2
            c.drawCircle(x, y, r, paint(col, a, blur=r * 0.35, blend=PLUS))
            c.drawCircle(x, y, r, paint(col, a * 0.8, stroke=1.5, blur=1, blend=PLUS))

    def fx_front(self, c, t):
        S = self.S
        sec = self.tl.section_at(t)
        drop = sec in self.drops
        cx, cy, W_, H_ = self.w / 2, self.h / 2, self.w, self.h
        # shockwave rings on impacts
        si = S.since("impact", t)
        if si < 1.4:
            u = si / 1.4
            for j in range(2):
                uu = clamp(u - j * 0.08)
                r = 80 + 1300 * ease_out(uu, 2)
                c.drawCircle(cx, cy, r, paint(WHITE, (1 - uu) ** 2 * (0.6 if drop else 0.3), stroke=10 * (1 - uu) + 1,
                                              blur=3, blend=PLUS))
        # smaller rings on claps
        if sec in self.clap_rings:
            sc = S.since("clap", t)
            if sc < 0.6:
                u = sc / 0.6
                c.drawCircle(cx, cy, 260 + 700 * ease_out(u), paint(self.clap_rings[sec], (1 - u) ** 2 * 0.35,
                                                                    stroke=4, blur=2, blend=PLUS))
        # spark bursts on drop kicks (start outside the text area)
        if drop:
            ki = S.index("kick", t)
            st = S.since("kick", t)
            if 0 <= st < 0.5:
                u = st / 0.5
                for j in range(28):
                    ang = rnd("sp", ki, j) * 2 * math.pi
                    v = 500 + 900 * rnd("spv", ki, j)
                    d0 = 420 + v * ease_out(u) * 0.9
                    d1 = d0 + 40 + 120 * (1 - u)
                    col = [PINK, CYAN, GOLD][j % 3]
                    c.drawLine(cx + math.cos(ang) * d0, cy + math.sin(ang) * d0 * 0.6,
                               cx + math.cos(ang) * d1, cy + math.sin(ang) * d1 * 0.6,
                               paint(col, (1 - u) * 0.7, stroke=3, cap_round=True, blend=PLUS))
        # audio-reactive bars along the bottom edge
        m = S.e("master", t)
        lo, hi, pd = S.e("low", t), S.e("hat", t), S.e("pad", t)
        n = 72
        bw = W_ / n
        fade = 1 - smooth((t - (self.tl.dur - 6)) / 3)
        for i in range(n):
            f = i / (n - 1)
            band = lo * (1 - f) ** 2 + pd * 4 * f * (1 - f) + hi * f ** 2
            h = 6 + 70 * band * (0.6 + 0.4 * math.sin(t * 7 + i * 0.9) ** 2) * (0.5 + 0.5 * m)
            col = mixc(CYAN, PINK, f)
            c.drawRect(skia.Rect.MakeXYWH(i * bw + 3, H_ - h, bw - 6, h), paint(col, 0.22 * fade, blend=PLUS))

    # ------------------------------------------------------------ full frame
    def frame(self, fi):
        t = fi / self.tl.fps
        W_, H_ = self.w, self.h
        cx, cy = W_ / 2, H_ / 2
        surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(W_, H_, skia.kRGBA_8888_ColorType,
                                                           skia.kPremul_AlphaType))
        c = surf.getCanvas()
        c.clear(skia.ColorBLACK)
        x = Ctx(t)
        pic = self.tl.record(x, t)  # shots first: they may set x.split / x.chroma for this frame

        self.background(c, t, x)
        self.fx_back(c, t)
        # camera: kick bump + shake
        c.save()
        zoom = x.zoom * (1 + 0.012 * self.kick(t, 0.15))
        sh = x.shake
        c.translate(cx + (rnd("shx", fi) - 0.5) * sh * 2, cy + (rnd("shy", fi) - 0.5) * sh * 2)
        c.scale(zoom, zoom)
        c.translate(-cx, -cy)
        # soft dark halo under all content keeps text readable on bright backgrounds
        shadow = skia.Paint(ImageFilter=skia.ImageFilters.DropShadow(0, 3, 9, 9,
                                                                     skia.Color4f(0, 0, 0, 0.8).toColor()))
        c.drawPicture(pic, None, shadow)
        c.restore()
        self.fx_front(c, t)

        fl = self.S.pulse("impact", t, 0.22) * (0.4 if self.in_drop(t) else 0.12)
        if fl > 0.01:
            c.drawPaint(paint(WHITE, fl, blend=PLUS))
        if t < self.intro_fade:
            c.drawPaint(paint((0, 0, 0), 1 - smooth(t / self.intro_fade)))
        self.bloom.apply(surf, alpha=0.35 + 0.3 * self.kick(t, 0.2))

        arr = post.to_array(surf)
        out = post.chroma_shift(arr, min(8, int(round(x.chroma * 3))))  # only on hits, never constant
        post.add_grain(out, self.grain, fi)
        post.finish(out)
        if self.glitch_at:
            d = min(abs(t - g) for g in self.glitch_at)
            if d <= 0.12:
                post.glitch_slices(out, 1 - d / 0.12, fi)
        return out.astype(np.uint8).tobytes()


# ---------------------------------------------------------------- covers
def still_background(c, w, h, look, t=37.0):
    """Nebula + stars + bokeh for a static image (covers, thumbnails)."""
    eff = skia.RuntimeEffect.MakeForShader(BG_SKSL)
    bw, bh = w // 3, h // 3
    u = [bw, bh, t, 0.75, look["warp"], *look["c1"], *look["c2"], *look["c3"], *look["bg"], 0.0, 1.0, 0.25, 0.3]
    surf = skia.Surface(bw, bh)
    surf.getCanvas().drawPaint(skia.Paint(Shader=eff.makeShader(
        skia.Data.MakeWithCopy(np.array(u, np.float32).tobytes()))))
    c.drawImageRect(surf.makeImageSnapshot(), skia.Rect(0, 0, bw, bh), skia.Rect(0, 0, w, h), LIN)
    r = np.random.default_rng(3)
    for _ in range(260):
        x, y, d = r.uniform(0, w), r.uniform(0, h), r.uniform(0.2, 1)
        c.drawCircle(x, y, 0.8 + 1.4 * d, paint(WHITE, 0.25 + 0.5 * d * r.uniform()))
    cols = [look["c2"], look["c3"], look["c1"]]
    for i in range(10):
        rr = 50 + 130 * r.uniform()
        x, y = r.uniform(0, w), r.uniform(0, h)
        col = tuple(min(1.0, v * 2.2) for v in cols[i % 3])
        c.drawCircle(x, y, rr, paint(col, 0.08, blur=rr * 0.35, blend=PLUS))
        c.drawCircle(x, y, rr, paint(col, 0.07, stroke=1.5, blend=PLUS))


def cover_title(c, s, x, y, size, align="left"):
    """Gradient-filled headline with a soft pink glow and a drop shadow."""
    f = font(size, bold=True)
    tw = f.measureText(s)
    x0 = x - tw / 2 if align == "center" else x
    c.drawString(s, x0, y + 8, f, paint((0, 0, 0), 0.7, blur=18))
    c.drawString(s, x0, y, f, paint(PINK, 0.55, blur=28))
    g = skia.GradientShader.MakeLinear([skia.Point(x0, y - size), skia.Point(x0 + tw, y)],
                                       [argb(WHITE), argb((1.0, 0.86, 0.92)), argb((1.0, 0.62, 0.78))])
    c.drawString(s, x0, y, f, skia.Paint(AntiAlias=True, Shader=g))
    return x0, tw


def spaced(c, s, x, y, f, sp, col, a, align="left"):
    """Letter-spaced Latin line (e.g. the English title)."""
    lay, total = char_layout(s, f, sp)
    x0 = x - total / 2 if align == "center" else x
    for ch, dx, _ in lay:
        c.drawString(ch, x0 + dx, y, f, paint(col, a))


def save_cover(surf, w, h, path):
    """Light bloom on the brightest spots, then save PNG."""
    img = surf.makeImageSnapshot()
    small = skia.Surface(w // 4, h // 4)
    thr = skia.Paint(ColorFilter=skia.ColorFilters.Matrix([
        2.2, 0, 0, 0, -1.25, 0, 2.2, 0, 0, -1.25, 0, 0, 2.2, 0, -1.25, 0, 0, 0, 1, 0]))
    small.getCanvas().drawImageRect(img, skia.Rect(0, 0, w, h), skia.Rect(0, 0, w // 4, h // 4), LIN, thr)
    bp = skia.Paint(ImageFilter=skia.ImageFilters.Blur(6, 6), BlendMode=PLUS, Alphaf=0.35)
    surf.getCanvas().drawImageRect(small.makeImageSnapshot(), skia.Rect(0, 0, w // 4, h // 4),
                                   skia.Rect(0, 0, w, h), LIN, bp)
    surf.makeImageSnapshot().save(path, skia.kPNG)
    print(path)
