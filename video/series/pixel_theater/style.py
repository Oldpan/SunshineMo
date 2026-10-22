"""pixel_theater (像素小剧场): smooth night scenes, pixel-art characters.

The world is drawn normally (anti-aliased gradients, soft glows, rounded UI, real fonts); only the
characters and a few small props (stars, hearts, the memory file, the tip bulb) are pixel art with
hard square edges.  The contrast is the look: two tiny pixel critters in a soft, glowing night.

Cast (fixed for the series):
  今今 JIN   the AI: the user's orange critter, unchanged (12 x 8 cells, #DA7758)
  念念 NIAN  the human: same skeleton, mint, rounded top, a sprout, blush, two legs

Characters are built from a 1x silhouette and drawn at 2x sub-cells, so faces get detail
(eyes 2x2, ^ ^, tears, a mouth that talks).

Shot types and their backgrounds:
  wide    night sky + far city + desk; a retro monitor whose screen shows the "screen space" UI
  screen  the monitor fills the frame: wallpaper + bezel; UI drawn at full size
  close   blurred room bokeh behind a big critter, lit by the screen
Screen-space UI is always laid out in 1920 x 1080 and scaled into the monitor in wide shots
(`inside(c, rect)`), so one layout serves both.

Teaching devices (the 30% "explain" part of every episode): UI that *is* the concept (windows, the
context bar, memory.md, loading bars), at most three tip cards, one recap card.
"""
import math
from contextlib import contextmanager

import numpy as np
import skia

from core.gfx import W, H, font, paint, clamp, lerp, smooth, ease_out, back_out, rnd, mixc, rrect, draw_text
from core.hand import hand_marker, hand_line
from core.pixel import Sprite, rect, draw_cells, pixel_text, pixel_text_width, text_cells, shatter, crt_power, snap
from core.timeline import Ctx
from core import post
from core.cover import save_png, spaced  # noqa: F401  (re-exported for cover scripts)

ORANGE = (0.855, 0.467, 0.345)  # #DA7758
MINT = (0.50, 0.80, 0.64)  # #7FCBA4
BLACK = (0.0, 0.0, 0.0)
WHITE = (1.0, 1.0, 1.0)
PINK = (0.98, 0.55, 0.62)
TEAR = (0.55, 0.82, 1.0)
LEAF = (0.40, 0.76, 0.44)
STEM = (0.22, 0.50, 0.30)
GOLD = (1.0, 0.82, 0.36)
RED = (0.92, 0.30, 0.30)
PURPLE = (0.60, 0.50, 0.95)
LAMP = (1.0, 0.72, 0.42)
SCREEN_GLOW = (0.55, 0.72, 1.0)

LIN = skia.SamplingOptions(skia.FilterMode.kLinear)


def _pal(sky0, sky1, sky2, stars, city, lights, lamp, win, ink, soft, bar, wall0, wall1, glow, bloom, vig):
    return dict(sky0=sky0, sky1=sky1, sky2=sky2, stars=stars, city=city, lights=lights, lamp=lamp, win=win,
                ink=ink, soft=soft, bar=bar, wall0=wall0, wall1=wall1, glow=glow, bloom=bloom, vig=vig)


PALETTES = {
    # deep blue night: the default look
    "night": _pal((0.02, 0.03, 0.09), (0.06, 0.08, 0.20), (0.17, 0.16, 0.34), 1.0, (0.035, 0.04, 0.09), 0.8,
                  0.8, (0.98, 0.96, 0.91), (0.14, 0.12, 0.20), (0.46, 0.44, 0.56), (0.36, 0.42, 0.80),
                  (0.05, 0.07, 0.17), (0.12, 0.12, 0.28), (0.60, 0.70, 1.0), 0.26, 0.50),
    # lonely / late: purple-grey, fewer stars, lamp low
    "lonely": _pal((0.02, 0.02, 0.05), (0.05, 0.05, 0.11), (0.14, 0.11, 0.20), 0.45, (0.03, 0.03, 0.06), 0.25,
                   0.35, (0.93, 0.92, 0.90), (0.16, 0.14, 0.20), (0.48, 0.45, 0.54), (0.42, 0.38, 0.56),
                   (0.04, 0.04, 0.09), (0.09, 0.08, 0.16), (0.62, 0.56, 0.85), 0.22, 0.62),
    # drops: richer night with a warm horizon, every window lit
    "glow": _pal((0.03, 0.03, 0.12), (0.12, 0.08, 0.28), (0.46, 0.22, 0.40), 1.0, (0.06, 0.04, 0.10), 1.0,
                 1.0, (1.0, 0.97, 0.91), (0.14, 0.12, 0.20), (0.46, 0.40, 0.54), (0.88, 0.45, 0.42),
                 (0.07, 0.06, 0.18), (0.22, 0.12, 0.30), (1.0, 0.66, 0.58), 0.32, 0.45),
    # ending: dawn
    "dawn": _pal((0.20, 0.26, 0.50), (0.56, 0.46, 0.64), (1.0, 0.72, 0.56), 0.22, (0.22, 0.18, 0.28), 0.15,
                 0.15, (1.0, 0.98, 0.93), (0.16, 0.14, 0.22), (0.44, 0.40, 0.50), (0.55, 0.50, 0.86),
                 (0.20, 0.22, 0.42), (0.55, 0.42, 0.58), (1.0, 0.82, 0.64), 0.20, 0.30),
}


# ================================================================ characters
JIN_ROWS = [
    "..########..",
    "..########..",
    "AAAA####BBBB",
    "AAAA####BBBB",
    "..########..",
    "..########..",
    "..a.b..c.d..",
    "..a.b..c.d..",
]
NIAN_ROWS = [
    "...######...",
    "..########..",
    "..########..",
    ".A########B.",
    ".A########B.",
    "..########..",
    "...######...",
    "....a..b....",
    "....a..b....",
]


class Critter:
    """A character from a 1x silhouette ('#' body, A/B arms, a-d legs), drawn at 2x sub-cells."""

    def __init__(self, rows, col, eyes, mouth, blush=None, sprout=False, glasses=None):
        self.rows, self.col = rows, col
        self.h1, self.w1 = len(rows), len(rows[0])
        self.eyes, self.mouth, self.blush, self.sprout = eyes, mouth, blush, sprout
        self.glasses = glasses  # frame colour: square lenses around both eyes
        self.parts = {}
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch != ".":
                    self.parts.setdefault(ch, []).append((x, y))

    @property
    def size(self):
        """(w, h) in sub-cells."""
        return self.w1 * 2, self.h1 * 2

    def cells(self, expr="normal", arms="down", legs="stand", t=0.0, talk=False, tear=0.0, blush=False,
              flower=False, glint=False):
        """{colour: [(sx, sy), ...]} in sub-cells (y may be negative: sprout, raised arms).

        expr: normal blink happy sad surprise flat shine; arms: down up wave type cheer;
        legs: stand walk; tear: 0..1 a tear rolling down; glint: a flash on the glasses."""
        out = {}

        def put(col, sx, sy):
            out.setdefault(col, []).append((sx, sy))

        def block(col, x1, y1, dy=0):
            for oy in range(2):
                for ox in range(2):
                    put(col, x1 * 2 + ox, y1 * 2 + oy + dy)

        for x1, y1 in self.parts.get("#", []):
            block(self.col, x1, y1)
        k = int(t / 0.11)
        for side in "AB":
            dy = {"down": 0, "up": -3, "wave": (-2 - 2 * (k % 2)) if side == "B" else 0,
                  "type": -((k + (side == "B")) % 2), "cheer": -3 - (k % 2)}.get(arms, 0)
            for x1, y1 in self.parts.get(side, []):
                block(self.col, x1, y1, dy)
        step = int(t / 0.16) % 2
        for i, leg in enumerate("abcd"):
            lift = legs == "walk" and (i % 2) == step
            for x1, y1 in self.parts.get(leg, []):
                block(self.col, x1, y1, -1 if lift else 0)
        for ex, ey in self.eyes:
            if expr in ("normal", "shine"):
                for ox, oy in ((0, 0), (1, 0), (0, 1), (1, 1)):
                    put(BLACK, ex + ox, ey + oy)
            elif expr in ("blink", "sleep", "flat"):
                put(BLACK, ex, ey + 1)
                put(BLACK, ex + 1, ey + 1)
            elif expr == "happy":
                for ox, oy in ((-1, 1), (0, 0), (1, 0), (2, 1)):
                    put(BLACK, ex + ox, ey + oy)
            elif expr == "sad":
                put(BLACK, ex, ey + 1)
                put(BLACK, ex + 1, ey + 1)
                put(BLACK, ex + (1 if ex < self.w1 else 0), ey)
            elif expr == "surprise":
                for oy in (-1, 0, 1):
                    put(BLACK, ex, ey + oy)
                    put(BLACK, ex + 1, ey + oy)
        if expr == "shine":  # moved: a highlight in each eye (drawn after the black)
            for ex, ey in self.eyes:
                put(WHITE, ex, ey)
        mx, my = self.mouth
        if expr == "flat":
            for ox in range(-1, 3):
                put(BLACK, mx + ox, my + 1)
        elif expr == "surprise":
            for ox, oy in ((0, 1), (1, 1), (0, 2), (1, 2)):
                put(BLACK, mx + ox, my + oy)
        elif (talk and int(t / 0.12) % 2 == 0) or expr == "happy":
            put(BLACK, mx, my + 1)
            put(BLACK, mx + 1, my + 1)
        if self.glasses is not None:
            (lx, ly), (rx, _) = self.eyes
            for ex in (lx, rx):
                for ox in range(-1, 3):
                    put(self.glasses, ex + ox, ly - 1)
                    put(self.glasses, ex + ox, ly + 2)
                put(self.glasses, ex - 1, ly)
                put(self.glasses, ex - 1, ly + 1)
                put(self.glasses, ex + 2, ly)
                put(self.glasses, ex + 2, ly + 1)
            for bx in range(lx + 3, rx - 1):
                put(self.glasses, bx, ly)
            if glint:
                for ex in (lx, rx):
                    put(WHITE, ex + 2, ly - 1)
                    put(WHITE, ex + 1, ly - 1)
        if self.blush is not None:
            for bx, by in self.blush:
                put(PINK, bx, by)
                put(PINK, bx + 1, by)
        elif blush:
            for bx, by in ((4, self.eyes[0][1] + 3), (self.w1 * 2 - 6, self.eyes[0][1] + 3)):
                put(PINK, bx, by)
                put(PINK, bx + 1, by)
        if tear > 0:
            ty = self.eyes[0][1] + 2 + int(tear * 6)
            for ex, ey in self.eyes:
                put(TEAR, ex if ex < self.w1 else ex + 1, ty)
                put(TEAR, ex if ex < self.w1 else ex + 1, ty + 1)
        if self.sprout:
            cx = self.w1
            put(STEM, cx, -1)
            put(STEM, cx, -2)
            if flower:
                for ox, oy in ((-1, -4), (1, -4), (0, -5), (0, -3)):
                    put(PINK, cx + ox, oy)
                put(GOLD, cx, -4)
            else:
                for ox, oy in ((1, -3), (2, -3), (1, -2), (-1, -3)):
                    put(LEAF, cx + ox, oy)
        return out

    def draw(self, c, x, y, px=8, a=1.0, flip=False, glow=0.0, **kw):
        """(x, y) = top-left of the body; px screen pixels per sub-cell."""
        draw_cells(c, self.cells(**kw), x, y, px, a, glow, flip_w=self.w1 * 2 if flip else None)

    def draw_at(self, c, cx, by, px=8, a=1.0, shadow=0.35, glow=0.0, hop=0.0, **kw):
        """Centred on cx with the feet on baseline by; a soft contact shadow; hop lifts it."""
        w2, h2 = self.size
        if shadow > 0:
            sw = w2 * px * (0.9 - 0.3 * clamp(hop / (px * 6)))
            c.drawOval(skia.Rect.MakeXYWH(cx - sw / 2, by - px * 0.8, sw, px * 1.8),
                       paint((0, 0, 0), a * shadow, blur=px * 1.2))
        self.draw(c, cx - w2 * px / 2, by - h2 * px - hop, px, a, glow=glow, **kw)


JIN = Critter(JIN_ROWS, ORANGE, eyes=[(6, 2), (16, 2)], mouth=(11, 4))
NIAN = Critter(NIAN_ROWS, MINT, eyes=[(6, 4), (16, 4)], mouth=(11, 6), blush=[(4, 7), (18, 7)], sprout=True)
TEACHER_ROWS = [
    "...########...",
    "..##########..",
    "..##########..",
    "AA##########BB",
    "AA##########BB",
    "..##########..",
    "..##########..",
    "...a.b..c.d...",
    "...a.b..c.d...",
]
SLATE = (0.52, 0.60, 0.76)
TEACHER = Critter(TEACHER_ROWS, SLATE, eyes=[(8, 5), (18, 5)], mouth=(13, 9), glasses=(0.16, 0.16, 0.24))


def hop(t, beat, h=1.0):
    """Little hop on every beat (screen px multiplier h): a positive lift."""
    u = (t / beat) % 1.0
    return h * max(0.0, math.sin(min(u / 0.3, 1.0) * math.pi))


# ================================================================ pixel props
STAR = Sprite.from_ascii("""
..#..
..#..
#####
.###.
.#.#.
""", {"#": GOLD})
HEART = Sprite.from_ascii("""
.##.##.
#######
#######
.#####.
..###..
...#...
""", {"#": PINK})
BULB = Sprite.from_ascii("""
.###.
#ooo#
#ooo#
.#o#.
.###.
.#-#.
""", {"#": (0.55, 0.45, 0.15), "o": GOLD, "-": (0.62, 0.62, 0.68)})
FILE = Sprite.from_ascii("""
#######...
#ooooo##..
#ooooo#o#.
#o---oooo#
#oooooooo#
#o-----oo#
#oooooooo#
#o----ooo#
#oooooooo#
#o-----oo#
#oooooooo#
##########
""", {"#": (0.36, 0.32, 0.55), "o": (0.98, 0.96, 0.90), "-": (0.60, 0.50, 0.95)})
CAT = Sprite.from_ascii("""
.#.....#....
.##...##....
.#######....
.#o###o#..#.
.#######...#
..#####....#
..#########.
..##.#.#.##.
""", {"#": (0.93, 0.60, 0.30), "o": BLACK})
QMARK = Sprite.from_ascii("""
.###.
#...#
...#.
..#..
.....
..#..
""", {"#": WHITE})
CHECK = Sprite.from_ascii("""
.......#
......##
#....##.
##..##..
.####...
..##....
""", {"#": (0.40, 0.85, 0.50)})
BOOK = Sprite.from_ascii("""
#########.
#ooooooo##
#o#####o##
#ooooooo##
#o####oo##
#ooooooo##
#ooooooo##
#ooooooo##
#########.
.########.
""", {"#": (0.20, 0.26, 0.50), "o": (0.42, 0.56, 0.92)})
MAG = Sprite.from_ascii("""
..####....
.#llll#...
#lwllll#..
#lwllll#..
#llllll#..
.#llll#...
..####....
......##..
.......##.
........##
""", {"#": (0.86, 0.86, 0.94), "l": (0.55, 0.75, 1.0), "w": WHITE})
BANG = Sprite.from_ascii("""
#
#
#
#
.
#
""", {"#": GOLD})


# ================================================================ backgrounds (smooth)
class Sky:
    def __init__(self, seed=3, n=170):
        r = np.random.default_rng(seed)
        self.stars = np.stack([r.uniform(0, W, n), r.uniform(0, H * 0.72, n) ** 1.0, r.uniform(0.25, 1, n),
                               r.uniform(0, 6.28, n), r.uniform(0.6, 2.4, n)], 1)

    def draw(self, c, look, t, twinkle=0.0, moon=True):
        sh = skia.GradientShader.MakeLinear([(0, 0), (0, H)], [skia.Color4f(*look["sky0"], 1).toColor(),
                                                              skia.Color4f(*look["sky1"], 1).toColor(),
                                                              skia.Color4f(*look["sky2"], 1).toColor()],
                                            [0.0, 0.55, 1.0])
        c.drawPaint(skia.Paint(Shader=sh))
        sa = look["stars"]
        if sa > 0.02:
            for i, (sx, sy, b, ph, r) in enumerate(self.stars):
                v = b * (0.6 + 0.4 * math.sin(t * (0.7 + b) + ph))
                if rnd("tw", i, int(t * 7)) < 0.05 * twinkle:
                    v = 1.4
                al = clamp(v * sa)
                col = (1.0, 0.95, 0.82) if i % 3 else (0.80, 0.88, 1.0)
                c.drawCircle(sx, sy, r, paint(col, al))
                if v > 1.0 or (b > 0.93 and r > 1.8):
                    c.drawCircle(sx, sy, r * 4, paint(col, al * 0.18, blur=r * 3))
                    c.drawRect(skia.Rect.MakeXYWH(sx - r * 5, sy - 0.6, r * 10, 1.2), paint(col, al * 0.45))
                    c.drawRect(skia.Rect.MakeXYWH(sx - 0.6, sy - r * 5, 1.2, r * 10), paint(col, al * 0.45))
        if moon:
            mx, my, mr = W * 0.84, H * 0.17, 58
            ma = clamp(0.35 + sa)
            c.drawCircle(mx, my, mr * 3.2, paint((1.0, 0.92, 0.75), 0.10 * ma, blur=70))
            c.saveLayer()
            c.drawCircle(mx, my, mr, paint((1.0, 0.95, 0.80), ma))
            c.drawCircle(mx + 26, my - 14, mr * 0.92, paint((0, 0, 0), 1.0, blend=skia.BlendMode.kDstOut))
            c.restore()
        # thin drifting clouds
        for i in range(3):
            cx = (W * (0.2 + 0.33 * i) + t * (6 + 3 * i)) % (W + 800) - 400
            cy = H * (0.30 + 0.12 * i)
            c.drawOval(skia.Rect.MakeXYWH(cx - 380, cy - 26, 760, 52), paint(look["sky2"], 0.16, blur=30))

    def shooting_star(self, c, u, seed, a=1.0):
        if not 0 < u < 1:
            return
        x0 = 200 + rnd("ssx", seed) * (W - 900)
        y0 = 40 + rnd("ssy", seed) * 200
        k = ease_out(u, 2)
        x, y = x0 + 640 * k, y0 + 190 * k
        L = 260 * (1 - u * 0.6)
        sh = skia.GradientShader.MakeLinear([(x, y), (x - L, y - L * 0.3)],
                                            [skia.Color4f(1, 0.97, 0.88, a * (1 - u)).toColor(),
                                             skia.Color4f(1, 0.97, 0.88, 0).toColor()])
        p = skia.Paint(Shader=sh, AntiAlias=True, StrokeWidth=3, Style=skia.Paint.kStroke_Style)
        c.drawLine(x, y, x - L, y - L * 0.3, p)
        c.drawCircle(x, y, 4, paint((1, 1, 1), a * (1 - u), blur=3))


def skyline(c, look, t, y=760, a=1.0):
    """Far city: soft dark blocks with a few warm windows."""
    r = np.random.default_rng(8)
    x = -40
    path = skia.Path()
    wins = []
    while x < W + 40:
        bw = r.uniform(70, 170)
        bh = r.uniform(60, 240)
        path.addRect(skia.Rect.MakeXYWH(x, y - bh, bw, bh + 400))
        for _ in range(int(bh / 26)):
            wins.append((x + r.uniform(8, bw - 16), y - bh + r.uniform(14, bh - 10), r.uniform()))
        x += bw + r.uniform(-10, 18)
    c.drawPath(path, paint(look["city"], a))
    for i, (wx, wy, k) in enumerate(wins):
        if k < 0.32 * look["lights"] + 0.05:
            c.drawRect(skia.Rect.MakeXYWH(wx, wy, 7, 9), paint(LAMP, a * 0.75 * (0.6 + 0.4 * k)))


def desk(c, look, y=820, a=1.0, lamp_x=210, lamp=True, mug_x=1700):
    """Wooden desk across the frame, a warm lamp pool on the left, a mug on the right."""
    sh = skia.GradientShader.MakeLinear([(0, y), (0, H)], [skia.Color4f(0.24, 0.15, 0.11, a).toColor(),
                                                           skia.Color4f(0.10, 0.06, 0.05, a).toColor()])
    c.drawRect(skia.Rect.MakeXYWH(0, y, W, H - y), skia.Paint(Shader=sh))
    c.drawRect(skia.Rect.MakeXYWH(0, y, W, 4), paint((0.45, 0.30, 0.20), a))
    L = look["lamp"]
    if lamp and L > 0.02:
        c.drawOval(skia.Rect.MakeXYWH(lamp_x - 360, y - 30, 720, 170), paint(LAMP, 0.22 * L * a, blur=50))
        c.drawCircle(lamp_x + 70, y - 330, 160, paint(LAMP, 0.16 * L * a, blur=80))
        # lamp: base, arm, shade
        c.drawRRect(rrect(lamp_x - 60, y - 16, 120, 16, 6), paint((0.20, 0.16, 0.16), a))
        p = paint((0.22, 0.18, 0.18), a, stroke=10, cap_round=True)
        c.drawLine(lamp_x, y - 12, lamp_x - 30, y - 200, p)
        c.drawLine(lamp_x - 30, y - 200, lamp_x + 60, y - 300, p)
        shade = skia.Path()
        shade.moveTo(lamp_x + 20, y - 330)
        shade.lineTo(lamp_x + 130, y - 300)
        shade.lineTo(lamp_x + 100, y - 250)
        shade.close()
        c.drawPath(shade, paint((0.30, 0.24, 0.22), a))
        c.drawCircle(lamp_x + 108, y - 268, 14, paint((1.0, 0.86, 0.62), a * L))
        c.drawCircle(lamp_x + 108, y - 268, 40, paint(LAMP, a * 0.4 * L, blur=22))
    if mug_x:
        c.drawRRect(rrect(mug_x - 44, y - 92, 88, 92, 12), paint((0.86, 0.80, 0.74), a))
        c.drawCircle(mug_x + 52, y - 50, 22, paint((0.86, 0.80, 0.74), a, stroke=10))
        c.drawRect(skia.Rect.MakeXYWH(mug_x - 44, y - 70, 88, 10), paint(ORANGE, a * 0.8))


def monitor(c, cx, cy, sw, sh, look, a=1.0, on=1.0):
    """Cream retro monitor with its screen centred on (cx, cy) and sw x sh big.  Returns the screen rect."""
    bez = 46
    x0, y0 = cx - sw / 2 - bez, cy - sh / 2 - bez
    bw, bh = sw + 2 * bez, sh + 2 * bez + 30
    # glow cast on the scene
    c.drawRRect(rrect(cx - sw * 0.7, cy - sh * 0.7, sw * 1.4, sh * 1.4, 200), paint(SCREEN_GLOW, 0.10 * on * a,
                                                                                    blur=120))
    # stand
    c.drawRRect(rrect(cx - sw * 0.14, y0 + bh - 10, sw * 0.28, 70, 10), paint((0.66, 0.62, 0.56), a))
    c.drawRRect(rrect(cx - sw * 0.26, y0 + bh + 50, sw * 0.52, 26, 12), paint((0.58, 0.54, 0.49), a))
    # body
    c.drawRRect(rrect(x0 + 8, y0 + 14, bw, bh, 34), paint((0, 0, 0), 0.4 * a, blur=18))
    sh_ = skia.GradientShader.MakeLinear([(0, y0), (0, y0 + bh)], [skia.Color4f(0.90, 0.86, 0.78, a).toColor(),
                                                                   skia.Color4f(0.72, 0.68, 0.62, a).toColor()])
    c.drawRRect(rrect(x0, y0, bw, bh, 34), skia.Paint(Shader=sh_, AntiAlias=True))
    c.drawRRect(rrect(x0 + 3, y0 + 3, bw - 6, bh - 6, 31), paint((1, 1, 1), 0.25 * a, stroke=2))
    # LED + vents
    c.drawCircle(x0 + bw - 54, y0 + bh - 24, 6, paint((0.3, 1.0, 0.45) if on > 0.5 else (0.4, 0.2, 0.2), a))
    for i in range(5):
        c.drawRRect(rrect(x0 + 50 + i * 26, y0 + bh - 28, 16, 6, 3), paint((0.55, 0.51, 0.46), a))
    sx, sy = cx - sw / 2, cy - sh / 2
    c.drawRRect(rrect(sx - 6, sy - 6, sw + 12, sh + 12, 22), paint((0.30, 0.28, 0.26), a))
    return sx, sy, sw, sh


def wallpaper(c, look, t, rx=0, ry=0, rw=W, rh=H, a=1.0):
    """The desktop inside the screen: dark gradient, a faint dot grid, a few stars."""
    sh = skia.GradientShader.MakeLinear([(0, ry), (0, ry + rh)], [skia.Color4f(*look["wall0"], a).toColor(),
                                                                  skia.Color4f(*look["wall1"], a).toColor()])
    c.drawRect(skia.Rect.MakeXYWH(rx, ry, rw, rh), skia.Paint(Shader=sh))
    p = paint((1, 1, 1), 0.05 * a)
    for gx in range(int(rx) + 30, int(rx + rw), 60):
        for gy in range(int(ry) + 30, int(ry + rh), 60):
            c.drawCircle(gx, gy, 2, p)


def glass(c, sx, sy, sw, sh, a=1.0):
    """Screen glass: inner vignette + a soft diagonal glare."""
    c.save()
    c.clipRRect(rrect(sx, sy, sw, sh, 18), skia.ClipOp.kIntersect, True)
    c.drawRRect(rrect(sx, sy, sw, sh, 18), paint((0, 0, 0), 0.35 * a, stroke=sw * 0.05, blur=sw * 0.04))
    glare = skia.Path()
    glare.moveTo(sx + sw * 0.55, sy)
    glare.lineTo(sx + sw * 0.75, sy)
    glare.lineTo(sx + sw * 0.45, sy + sh)
    glare.lineTo(sx + sw * 0.25, sy + sh)
    glare.close()
    c.drawPath(glare, paint((1, 1, 1), 0.035 * a, blur=sw * 0.02))
    c.restore()


@contextmanager
def inside(c, sx, sy, sw, sh, clip=True):
    """Draw screen-space (1920 x 1080) content scaled into a screen rect."""
    c.save()
    if clip:
        c.clipRRect(rrect(sx, sy, sw, sh, 18), skia.ClipOp.kIntersect, True)
    c.translate(sx, sy)
    c.scale(sw / W, sh / H)
    yield
    c.restore()


def screen_frame(c, look, a=1.0):
    """For full-frame screen shots: a thin bezel around the edge and the glass on top."""
    bz = 26
    path = skia.Path()
    path.setFillType(skia.PathFillType.kEvenOdd)
    path.addRect(skia.Rect.MakeWH(W, H))
    path.addRRect(rrect(bz, bz, W - 2 * bz, H - 2 * bz, 28))
    c.drawPath(path, paint((0.84, 0.80, 0.73), a))
    c.drawRRect(rrect(bz, bz, W - 2 * bz, H - 2 * bz, 28), paint((0.30, 0.28, 0.26), a, stroke=6))
    glass(c, bz, bz, W - 2 * bz, H - 2 * bz, a)


def bokeh_room(c, look, t, a=1.0, side=1):
    """Close-up background: out-of-focus lamp and screen glows over the night."""
    c.drawPaint(paint(mixc(look["sky0"], look["sky1"], 0.5), a))
    r = np.random.default_rng(4)
    for i in range(16):
        bx, by = r.uniform(0, W), r.uniform(0, H)
        rad = r.uniform(40, 130)
        col = LAMP if i % 3 else SCREEN_GLOW
        k = 0.5 + 0.5 * math.sin(t * 0.4 + i)
        c.drawCircle(bx + 10 * math.sin(t * 0.2 + i), by, rad, paint(col, a * (0.05 + 0.05 * k) * (0.4 + look["lamp"]),
                                                                       blur=rad * 0.25))
    gx = W * (0.85 if side > 0 else 0.15)
    c.drawCircle(gx, H * 0.45, 700, paint(SCREEN_GLOW, a * 0.16, blur=240))
    c.drawRect(skia.Rect.MakeXYWH(0, H * 0.80, W, H * 0.2), paint((0.10, 0.06, 0.05), a * 0.85))
    c.drawRect(skia.Rect.MakeXYWH(0, H * 0.80, W, 3), paint((0.45, 0.30, 0.20), a * 0.6))


# ================================================================ UI (screen space, smooth)
TITLE_H = 64
BAR_H = 58
F_UI = 44


def context_bar(c, x, y, w, chat, look, t=0.0, mem=0.0, a=1.0, label="上下文"):
    """'上下文 [■■■■■□□□]': memory share (purple) then chat (orange); blinks red when full."""
    f = font(30)
    lw = draw_text(c, label, x, y + 36, f, paint(look["soft"], a), align="left")
    bx, bw = x + lw + 18, w - lw - 18
    c.drawRRect(rrect(bx, y + 8, bw, 36, 10), paint((0, 0, 0), 0.06 * a))
    c.drawRRect(rrect(bx, y + 8, bw, 36, 10), paint(look["soft"], 0.6 * a, stroke=2))
    seg, gap = 16, 5
    n = int((bw - 12) // (seg + gap))
    full = mem + chat >= 0.995
    for i in range(n):
        u = (i + 0.5) / n
        if u < mem:
            col = PURPLE
        elif u < mem + chat:
            col = ORANGE
        else:
            continue
        if full and int(t * 6) % 2 == 0:
            col = RED
        rect(c, bx + 7 + i * (seg + gap), y + 15, seg, 22, col, a)
    return bx + bw


def window(c, x, y, w, h, title_, look, u=1.0, a=1.0, cap=None, mem=0.0, t=0.0, bar=None):
    """Rounded OS window.  u: open animation 0 -> 1.  cap: context fill 0..1 (None hides the bar).
    Returns the content rect (x, y, w, h)."""
    if u <= 0:
        return x, y + TITLE_H, w, h - TITLE_H
    k = back_out(clamp(u), 1.6)
    al = a * clamp(u * 3)
    c.save()
    c.translate(x + w / 2, y + h / 2)
    c.scale(lerp(0.82, 1.0, k), lerp(0.82, 1.0, k))
    c.translate(-(x + w / 2), -(y + h / 2))
    c.drawRRect(rrect(x, y + 18, w, h, 22), paint((0, 0, 0), 0.45 * al, blur=26))
    c.drawRRect(rrect(x, y, w, h, 22), paint(look["win"], al))
    c.save()
    c.clipRRect(rrect(x, y, w, h, 22), skia.ClipOp.kIntersect, True)
    bc = bar or look["bar"]
    sh = skia.GradientShader.MakeLinear([(0, y), (0, y + TITLE_H)], [skia.Color4f(*mixc(bc, WHITE, 0.15), al).toColor(),
                                                                     skia.Color4f(*bc, al).toColor()])
    c.drawRect(skia.Rect.MakeXYWH(x, y, w, TITLE_H), skia.Paint(Shader=sh))
    c.restore()
    for i, col in enumerate(((1.0, 0.42, 0.40), (1.0, 0.78, 0.30), (0.40, 0.82, 0.45))):
        c.drawCircle(x + 34 + i * 34, y + TITLE_H / 2, 10, paint(col, al))
    pixel_text(c, title_, x + w / 2, y + TITLE_H / 2 - 16, WHITE, al, scale=2, align="center")
    top = y + TITLE_H
    if cap is not None:
        context_bar(c, x + 28, top + 4, w - 56, cap, look, t, mem, al)
        c.drawRect(skia.Rect.MakeXYWH(x + 20, top + BAR_H, w - 40, 2), paint(look["soft"], 0.25 * al))
        top += BAR_H + 4
    c.restore()
    return x, top, w, y + h - top


BUBBLE = {"jin": ((1.0, 0.88, 0.80), ORANGE), "nian": ((0.86, 0.96, 0.90), (0.30, 0.62, 0.45)),
          "sys": ((0.92, 0.92, 0.98), (0.45, 0.45, 0.70)), "teacher": ((0.90, 0.92, 0.97), SLATE)}


def bubble(c, x, y, s, who, look, a=1.0, t=None, cps=16.0, align="left", size=F_UI):
    """Rounded speech bubble, top-left (align left) or top-right (align right) at (x, y).
    Multi-line with '\\n'.  t: typewriter time.  Returns (w, h)."""
    lines = s.split("\n")
    fill, edge = BUBBLE[who]
    f = font(size)
    tw = max(f.measureText(L) for L in lines)
    px_, py_ = size * 0.55, size * 0.38
    lh = size * 1.3
    bw, bh = tw + 2 * px_, lh * len(lines) + 2 * py_ - (lh - size)
    x0 = x if align == "left" else x - bw
    r = min(bh / 2, size * 0.7)
    c.drawRRect(rrect(x0, y + 4, bw, bh, r), paint((0, 0, 0), 0.12 * a, blur=6))
    c.drawRRect(rrect(x0, y, bw, bh, r), paint(fill, a))
    c.drawRRect(rrect(x0, y, bw, bh, r), paint(edge, 0.8 * a, stroke=3))
    shown = None if t is None else max(0.0, t) * cps
    used = 0
    for i, L in enumerate(lines):
        n = len(L) if shown is None else int(max(0, min(len(L), shown - used)))
        used += len(L)
        if n > 0:
            c.drawString(L[:n], x0 + px_, y + py_ + size * 0.86 + i * lh, f, paint(look["ink"], a))
    return bw, bh


def mini(c, who, x, y, sub=2, a=1.0, expr="normal"):
    """Small pixel critter for chat rows (sub screen pixels per sub-cell: 2 -> 48 x 32)."""
    (JIN if who == "jin" else NIAN).draw(c, x, y, sub, a, expr=expr)


class Msg:
    """One chat line.  t0: when it pops in; gone: when it is pushed out of the window (breaks into pixels)."""

    def __init__(self, who, text, t0, gone=None, typing=True, size=F_UI, cps=None):
        self.who, self.text, self.t0, self.gone, self.typing, self.size = who, text, t0, gone, typing, size
        self.cps = cps

    def height(self):
        lines = self.text.count("\n") + 1
        return self.size * 1.3 * lines + self.size * 0.76 - self.size * 0.3 + 12


def chat(c, rect_, msgs, t, look, a=1.0, cps=18.0, pad=18):
    """Chat log in a content rect: newest at the bottom, older ones pushed up and clipped.
    A message whose `gone` time has passed breaks into pixel blocks and leaves the window."""
    x, y, w, h = rect_
    live = [m for m in msgs if t >= m.t0]
    flying = []  # pushed-out lines fly up out of the window, so they are drawn after the clip
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(x, y, w, h))
    ycur = y + h - pad
    for m in reversed(live):
        k = smooth((t - m.t0) / 0.16)
        ycur -= m.height() * k
        pop = 1 - 0.12 * (1 - back_out(clamp((t - m.t0) / 0.2), 2.2))
        if m.gone is not None and t >= m.gone:
            u = (t - m.gone) / 1.1
            f = font(m.size)
            line = m.text.split("\n")[0]
            cells = text_cells(line, f, 6)
            tw = max(f.measureText(L) for L in m.text.split("\n"))
            tx = x + 96 + m.size * 0.55 if m.who == "jin" else x + w - 96 - tw - m.size * 0.55
            col = ORANGE if m.who == "jin" else (0.30, 0.62, 0.45)
            flying.append((cells, tx, ycur + m.size * 1.24, u, col, (len(m.text) * 7 + int(m.t0 * 10)) % 100003))
            continue
        tt = (t - m.t0) if m.typing else None
        mc = m.cps or cps
        c.save()
        if m.who == "jin":
            c.translate(x + 96, ycur)
            c.scale(pop, pop)
            mini(c, "jin", -66, 10, 2, a)
            bubble(c, 0, 0, m.text, "jin", look, a, tt, mc, "left", m.size)
        else:
            c.translate(x + w - 96, ycur)
            c.scale(pop, pop)
            mini(c, "nian", 18, 12, 2, a)
            bubble(c, 0, 0, m.text, "nian", look, a, tt, mc, "right", m.size)
        c.restore()
    c.restore()
    for cells, tx, ty, u, col, seed in flying:
        shatter(c, cells, tx, ty, u, col, a, seed=seed, spread=90, fall=420, size=6, rise=True)


def memory_page(c, x, y, w, h, lines, look, t, a=1.0, title_="memory.md", strike=None, glow=None, reveal=None,
                cps=10.0, scroll=0.0, size=44, lh=74, slots=None, fade=None):
    """The AI's notebook: ruled paper, handwritten lines, a pixel file tab.
    strike: {i: u} progressive red strike-through; glow: {i: k} highlighter; reveal: {i: t0} handwriting;
    slots: per-line (float) row positions, for lines that move; fade: {i: k} 0..1 fades a line out."""
    paper = (0.99, 0.97, 0.90)
    c.drawRRect(rrect(x, y + 14, w, h, 14), paint((0, 0, 0), 0.4 * a, blur=22))
    tw = pixel_text_width(title_, 2) + 92
    c.drawRRect(rrect(x + 24, y - 58, tw, 72, 12), paint((0.36, 0.32, 0.55), a))
    FILE.draw(c, x + 40, y - 50, px=3, a=a)
    pixel_text(c, title_, x + 88, y - 44, WHITE, a, scale=2)
    c.drawRRect(rrect(x, y, w, h, 14), paint(paper, a))
    c.save()
    c.clipRRect(rrect(x, y, w, h, 14), skia.ClipOp.kIntersect, True)
    for j in range(int(h // lh) + 2):
        ly = y + 30 + (j + 1) * lh - (scroll % lh)
        c.drawRect(skia.Rect.MakeXYWH(x + 16, ly, w - 32, 2), paint((0.68, 0.80, 0.95), 0.75 * a))
    c.drawRect(skia.Rect.MakeXYWH(x + 86, y, 3, h), paint((0.95, 0.55, 0.55), 0.8 * a))
    f = font(size, "kai")
    for i, s in enumerate(lines):
        base = y + 30 + ((slots[i] if slots else i) + 1) * lh - 14 - scroll
        if base < y - lh or base > y + h + lh:
            continue
        fa = 1.0 - (fade or {}).get(i, 0.0)
        if fa <= 0.01:
            continue
        g = (glow or {}).get(i, 0.0)
        if g > 0:
            hand_marker(c, x + 100, x + 112 + f.measureText(s), base - size * 0.32, size * 0.9, clamp(g), GOLD,
                        0.5 * a * fa, seed=("mg", i))
        n = len(s)
        if reveal and i in reveal:
            n = int(max(0.0, t - reveal[i]) * cps)
            if n <= 0:
                continue
        su = (strike or {}).get(i, 0.0)
        da = a * fa * (1 - 0.6 * clamp(su * 1.4))
        c.drawCircle(x + 56, base - size * 0.32, 6, paint((0.36, 0.32, 0.55), da))
        c.drawString(s[:n], x + 108, base, f, paint(look["ink"], da))
        if su > 0:
            hand_line(c, x + 100, base - size * 0.3, x + 118 + f.measureText(s), base - size * 0.36, clamp(su), RED,
                      a * fa, w=6, seed=("ms", i))
    c.restore()


def loading(c, x, y, w, u, look, label="读取记忆…", a=1.0, col=PURPLE, size=34):
    """'读取记忆… [■■■■□□]' (pixel-block fill)."""
    f = font(size)
    lw = draw_text(c, label, x, y + size, f, paint(look["ink"], a), align="left")
    bx, bw = x + lw + 20, w - lw - 20
    c.drawRRect(rrect(bx, y + 2, bw, size + 6, 8), paint(look["soft"], 0.7 * a, stroke=2))
    n = int((bw - 10) // 18)
    for i in range(int(n * clamp(u))):
        rect(c, bx + 6 + i * 18, y + 8, 14, size - 6, col, a)


def tip_card(c, lines, u, look, y=None, a=1.0, tag="小知识", note="示意"):
    """Hint card near the bottom: pixel bulb + tag, one or two lines, a small '示意' mark.
    u: 0 -> 1 rises in, 1 -> 2 sinks out."""
    if u <= 0 or u >= 2:
        return
    k = ease_out(clamp(u / 0.6), 3) if u <= 1 else 1 - smooth((u - 1) / 0.6)
    f = font(46)
    tw = max(f.measureText(L) for L in lines)
    bw, bh = tw + 120, 70 * len(lines) + 92
    x0 = W / 2 - bw / 2
    y0 = (H - bh - 60) if y is None else y
    y0 += (1 - k) * 60
    al = a * k
    c.drawRRect(rrect(x0, y0 + 16, bw, bh, 26), paint((0, 0, 0), 0.5 * al, blur=26))
    c.drawRRect(rrect(x0, y0, bw, bh, 26), paint((0.08, 0.08, 0.17), 0.93 * al))
    c.drawRRect(rrect(x0, y0, bw, bh, 26), paint(GOLD, 0.85 * al, stroke=3))
    BULB.draw(c, x0 + 40, y0 + 20, px=7, a=al, glow=0.5)
    draw_text(c, tag, x0 + 96, y0 + 62, font(38, "kai", True), paint(GOLD, al), align="left")
    draw_text(c, note, x0 + bw - 36, y0 + 58, font(28), paint((0.62, 0.62, 0.75), al), align="right")
    for i, L in enumerate(lines):
        draw_text(c, L, x0 + 60, y0 + 136 + i * 70, f, paint(WHITE, al), align="left")


def tip_phase(t, t0, t1, rise=0.5, fall=0.4):
    """u for tip_card: rises in from t0 over `rise` s, stays up, sinks out from t1 over `fall` s.
    (tip_card is fully in at u = 0.6 and fully out at u = 1.6.)"""
    if t < t0:
        return 0.0
    if t < t1:
        return min(1.0, 0.6 * (t - t0) / rise)
    return 1.0 + 0.6 * (t - t1) / fall


def popup(c, cx, cy, title_, body, look, u=1.0, a=1.0, col=RED):
    """System warning dialog: red title bar, a line or two, an OK button."""
    if u <= 0:
        return
    k = back_out(clamp(u / 0.3), 2.0)
    f = font(42)
    lines = body.split("\n")
    bw = max(f.measureText(L) for L in lines) + 140
    bh = 62 * len(lines) + 200
    c.save()
    c.translate(cx, cy)
    c.scale(k, k)
    c.drawRRect(rrect(-bw / 2, -bh / 2 + 16, bw, bh, 20), paint((0, 0, 0), 0.5 * a, blur=24))
    c.drawRRect(rrect(-bw / 2, -bh / 2, bw, bh, 20), paint((0.97, 0.96, 0.98), a))
    c.save()
    c.clipRRect(rrect(-bw / 2, -bh / 2, bw, bh, 20), skia.ClipOp.kIntersect, True)
    c.drawRect(skia.Rect.MakeXYWH(-bw / 2, -bh / 2, bw, 64), paint(col, a))
    c.restore()
    pixel_text(c, title_, 0, -bh / 2 + 16, WHITE, a, scale=2, align="center")
    for i, L in enumerate(lines):
        draw_text(c, L, 0, -bh / 2 + 130 + i * 62, f, paint(look["ink"], a))
    c.drawRRect(rrect(-70, bh / 2 - 82, 140, 56, 12), paint((0.85, 0.85, 0.92), a))
    draw_text(c, "确定", 0, bh / 2 - 41, font(34), paint(look["ink"], a))
    c.restore()


def say(c, s, x, y, size=52, col=WHITE, a=1.0, align="center", kind="kai", bold=False, t=None, cps=10.0):
    """Narration caption over the night: soft dark halo for readability.  t: typewriter."""
    f = font(size, kind, bold)
    shown = s if t is None else s[:int(max(0.0, t) * cps)]
    total = f.measureText(s)
    x0 = x - (total / 2 if align == "center" else total if align == "right" else 0)
    c.drawString(shown, x0, y + 3, f, paint((0.0, 0.0, 0.05), 0.75 * a, blur=10))
    c.drawString(shown, x0, y, f, paint(col, a))
    return total


def headline(c, s, x, y, size=110, col=WHITE, a=1.0, align="center", glow=0.35, accent=None):
    """Big WenKai headline with a soft glow (accent: list of (substring, colour) to recolour)."""
    f = font(size, "kai", True)
    total = f.measureText(s)
    x0 = x - (total / 2 if align == "center" else total if align == "right" else 0)
    c.drawString(s, x0, y + 5, f, paint((0.0, 0.0, 0.05), 0.8 * a, blur=14))
    if glow:
        c.drawString(s, x0, y, f, paint(col, glow * a, blur=18))
    c.drawString(s, x0, y, f, paint(col, a))
    for sub, acol in accent or ():
        i = s.find(sub)
        if i >= 0:
            c.drawString(sub, x0 + f.measureText(s[:i]), y, f, paint(acol, a))
    return total


def hearts(c, t, events, a=1.0):
    """Pixel hearts rising from the bottom corners after each event (list of (i, dt))."""
    for i, dt in events:
        for j in range(6):
            side = j % 2
            x0 = (40 + rnd("hx", i, j) * 300) if side == 0 else (W - 340 + rnd("hx", i, j) * 300)
            yy = H - 40 - dt * (260 + 160 * rnd("hv", i, j)) - 30 * j
            xx = x0 + 24 * math.sin(dt * 5 + j)
            al = a * clamp(1 - dt / 1.6) * clamp(dt / 0.08)
            if al > 0.02:
                HEART.draw(c, xx, yy, px=6 + 3 * (j % 3 == 0), a=al, glow=0.4)


PANEL = (0.08, 0.08, 0.17)


def candidates(c, x, y, words, probs, look, u=1.0, pick=None, a=1.0, w=620, size=42, title_="下一个字？",
               note="示意"):
    """The model's next-word candidates as pixel bars (illustrative, no numbers).
    u: 0 -> 1 the bars grow one by one; 1 -> 1.3 the `pick` row lights up.  Returns the panel rect and the
    picked word's (x, baseline)."""
    if u <= 0:
        return (x, y, w, 0), None
    f = font(size)
    row_h = size * 1.5
    h = 74 + row_h * len(words) + 20
    al = a * clamp(u / 0.15)
    c.drawRRect(rrect(x, y + 12, w, h, 20), paint((0, 0, 0), 0.45 * al, blur=20))
    c.drawRRect(rrect(x, y, w, h, 20), paint(PANEL, 0.94 * al))
    c.drawRRect(rrect(x, y, w, h, 20), paint(PURPLE, 0.8 * al, stroke=3))
    pixel_text(c, title_, x + 26, y + 20, PURPLE, al, scale=2)
    if note:
        draw_text(c, note, x + w - 26, y + 46, font(26), paint((0.62, 0.62, 0.75), al), align="right")
    word_w = max(f.measureText(s_) for s_ in words) + 30
    seg, gap = 14, 4
    bx0 = x + 30 + word_w
    nmax = int((x + w - 30 - bx0) // (seg + gap))
    pk = clamp((u - 1.0) / 0.3) if pick is not None else 0.0
    picked = None
    for i, (s_, p_) in enumerate(zip(words, probs)):
        ry = y + 74 + i * row_h
        k = smooth(clamp((u - i * 0.12) / 0.5))
        on = i == pick
        dim = 1 - 0.55 * pk * (not on)
        if on and pk > 0:
            c.drawRRect(rrect(x + 12, ry - 4, w - 24, row_h - 4, 12), paint(GOLD, 0.18 * pk * al))
        base = ry + row_h * 0.5 + size * 0.34
        draw_text(c, s_, x + 30, base, f, paint(GOLD if on and pk > 0.5 else WHITE, al * dim), align="left")
        n = int(round(p_ * nmax * k))
        if p_ > 0 and k > 0:
            n = max(1, n)
        col = mixc((0.55, 0.60, 0.88), GOLD, pk) if on else (0.55, 0.60, 0.88)
        for j in range(n):
            rect(c, bx0 + j * (seg + gap), ry + row_h * 0.5 - 12, seg, 22, col, al * dim)
        if on:
            picked = (x + 30, base)
    return (x, y, w, h), picked


def thinking(c, x, y, words, t, a=1.0, size=30, spread=150, period=1.3):
    """Faint candidate words drifting up from (x, y) while the AI types."""
    f = font(size)
    for i, s_ in enumerate(words):
        u = ((t / period) + i / len(words)) % 1.0
        xx = x + (rnd("tk", i) - 0.5) * spread
        al = a * 0.55 * math.sin(u * math.pi)
        draw_text(c, s_, xx, y - 90 * u, f, paint((0.85, 0.85, 1.0), al))


def cite(c, x, y, n, a=1.0, size=30, col=PURPLE):
    """Source tag [n]: a small rounded chip with its top-left at (x, y).  Returns its width."""
    f = font(size)
    s_ = str(n)
    w_ = f.measureText(s_) + size * 0.8
    c.drawRRect(rrect(x, y, w_, size * 1.25, size * 0.3), paint(col, a))
    draw_text(c, s_, x + w_ / 2, y + size * 0.98, f, paint(WHITE, a))
    return w_


def search_window(c, x, y, w, h, query, results, look, lt, t=0.0, a=1.0, u=1.0, type_d=0.6, wait=0.7,
                  title_="搜索", empty="没有找到相关结果。"):
    """Search window: the query types in, '搜索中…' fills, then results (title, source) with [n] tags.
    lt: seconds since the window opened; results appear at type_d + wait."""
    r = window(c, x, y, w, h, title_, look, u=u, a=a, t=t)
    if u < 0.3:
        return r
    rx, ry, rw, rh = r
    bx, by, bw, bh = rx + 40, ry + 30, rw - 80, 84
    c.drawRRect(rrect(bx, by, bw, bh, 42), paint(WHITE, a))
    c.drawRRect(rrect(bx, by, bw, bh, 42), paint(look["soft"], 0.7 * a, stroke=3))
    MAG.draw(c, bx + 26, by + 18, px=5, a=a)
    f = font(38)
    n = int(len(query) * clamp(lt / type_d))
    c.drawString(query[:n], bx + 100, by + 56, f, paint(look["ink"], a))
    if lt < type_d and int(lt * 4) % 2 == 0:
        cx_ = bx + 104 + f.measureText(query[:n])
        c.drawRect(skia.Rect.MakeXYWH(cx_, by + 22, 3, 44), paint(look["ink"], a))
    ts = lt - type_d
    if 0 <= ts < wait:
        loading(c, bx + 20, by + 140, bw - 40, ts / wait, look, label="搜索中…", col=ORANGE, a=a)
    elif ts >= wait:
        tr = ts - wait
        if not results:
            draw_text(c, empty, rx + rw / 2, by + 200, font(42), paint(look["soft"], a * clamp(tr / 0.2)))
        for i, (title, src) in enumerate(results):
            k = ease_out(clamp((tr - i * 0.18) / 0.3), 3)
            if k <= 0:
                continue
            cy = by + 130 + i * 150 + (1 - k) * 30
            c.drawRRect(rrect(bx, cy, bw, 130, 18), paint((0.93, 0.93, 0.98), a * k))
            cite(c, bx + 24, cy + 26, i + 1, a * k)
            c.drawString(title, bx + 90, cy + 58, font(38), paint(look["ink"], a * k))
            c.drawString(src, bx + 90, cy + 104, font(28), paint(look["soft"], a * k))
    return r


def meeting(c, x, y, w, h, look, t, tiles, a=1.0, u=1.0, title_="组会", speaking=None):
    """Video-call window with side-by-side tiles: tiles = [(name, draw(c, cx, feet_y, px))].
    speaking: index of the tile with a green 'talking' border.  Returns the tile rects."""
    rx, ry, rw, rh = window(c, x, y, w, h, title_, look, u=u, a=a, t=t)
    if u < 0.3:
        return []
    pad, n = 24, len(tiles)
    tw = (rw - pad * (n + 1)) / n
    out = []
    for i, (name, fn) in enumerate(tiles):
        tx, ty, th = rx + pad + i * (tw + pad), ry + pad, rh - 2 * pad
        c.drawRRect(rrect(tx, ty, tw, th, 18), paint((0.12, 0.13, 0.22), a))
        c.save()
        c.clipRRect(rrect(tx, ty, tw, th, 18), skia.ClipOp.kIntersect, True)
        c.drawCircle(tx + tw / 2, ty + th * 0.55, th * 0.55, paint(SCREEN_GLOW, 0.10 * a, blur=60))
        fn(c, tx + tw / 2, ty + th - 40, max(4, int(th / 40)))
        c.restore()
        if speaking == i:
            c.drawRRect(rrect(tx, ty, tw, th, 18), paint((0.40, 0.85, 0.50), a, stroke=5))
        f = font(30)
        lw = f.measureText(name) + 36
        c.drawRRect(rrect(tx + 16, ty + th - 62, lw, 46, 12), paint((0, 0, 0), 0.5 * a))
        draw_text(c, name, tx + 34, ty + th - 28, f, paint(WHITE, a), align="left")
        out.append((tx, ty, tw, th))
    return out


def rain(c, t, a=1.0, n=160, seed=2, speed=1400, col=(0.70, 0.80, 1.0)):
    """Thin slanted rain over the scene."""
    r = np.random.default_rng(seed)
    xs, ys, ls, vs = r.uniform(0, W + 300, n), r.uniform(0, H, n), r.uniform(30, 70, n), r.uniform(0.7, 1.3, n)
    p = paint(col, 0.22 * a, stroke=2, cap_round=True)
    for xx, yy, L, v in zip(xs, ys, ls, vs):
        y_ = (yy + t * speed * v) % (H + 100) - 50
        x_ = xx - y_ * 0.18
        c.drawLine(x_, y_, x_ - L * 0.18, y_ + L, p)


# ================================================================ story helpers
def chat_lines(lines, at, size=F_UI, gone=None, jin_cps=30.0, cps=18.0):
    """Cue tuples (bar, beat, who, text[, cps]) -> [Msg].  at(bar, beat) gives seconds;
    gone: {index: (bar, beat)} for lines pushed out of the window."""
    out = []
    for i, item in enumerate(lines):
        b, beat, who, text = item[:4]
        c_ = item[4] if len(item) > 4 else (jin_cps if who == "jin" else cps)
        g = at(*gone[i]) if gone and i in gone else None
        out.append(Msg(who, text, at(b, beat), gone=g, size=size, cps=c_))
    return out


def blink(t, seed=0, every=3.1):
    """True for 0.12 s every few seconds (offset per character / shot by seed)."""
    k = int(t / every + rnd("bk", seed))
    return (t - k * every) % every < 0.12


def power_schedule(on, off):
    """on / off: [(t0, seconds)] -> f(t) giving the CRT power (0..1) for x.power."""
    ev = sorted([(t0, d, True) for t0, d in on] + [(t0, d, False) for t0, d in off])

    def power(t):
        p = 1.0
        for t0, d, is_on in ev:
            if t < t0:
                break
            u = clamp((t - t0) / d)
            p = u if is_on else 1 - u
        return p
    return power


# ================================================================ the style
class PixelTheater:
    """The frame compositor.  Each episode has its own look: by default the starry night of episode 1;
    backdrop(c, look, t, x) replaces the sky, post_fx(c, t, fi, x, look) draws after the vignette
    (film scratches, light leaks...), grain sets the film grain."""

    def __init__(self, tl, sync, looks, fast=(), drops=("drop1", "drop2"), outro_fade=2.0, w=W, h=H,
                 backdrop=None, post_fx=None, grain=3.0):
        self.tl, self.S, self.looks = tl, sync, looks
        self.fast, self.drops = tuple(fast), tuple(drops)
        self.outro_fade = outro_fade
        self.w, self.h = w, h
        self.backdrop, self.post_fx, self.grain_amt = backdrop, post_fx, grain

    def setup(self):
        info = skia.ImageInfo.Make(self.w, self.h, skia.kRGBA_8888_ColorType, skia.kPremul_AlphaType)
        self.surf = skia.Surface.MakeRaster(info)
        self.surf2 = skia.Surface.MakeRaster(info)
        self.sky = Sky()
        self.bloom = post.Bloom(self.w, self.h)
        self.grain = post.make_grain(np.random.default_rng(7), self.w, self.h, self.grain_amt)

    def kick(self, t, d=0.12):
        return self.S.pulse("kick", t, d)

    def in_drop(self, t):
        return self.tl.section_at(t) in self.drops

    def recent(self, name, t, window):
        a = self.S.ev.get(name)
        if a is None:
            return []
        i1 = np.searchsorted(a, t, "right")
        i0 = np.searchsorted(a, t - window, "left")
        return [(i, t - a[i]) for i in range(i0, i1)]

    def frame(self, fi):
        t = fi / self.tl.fps
        look = self.tl.look_at(self.looks, t, self.fast)
        x = Ctx(t)
        x.look = look
        x.power = 1.0  # old-TV power of the whole picture: 0 off .. 1 on
        x.sky = True
        x.twinkle = 0.0
        x.hearts = self.in_drop(t)
        x.mono = 0.0
        pic = self.tl.record(x, t)

        c = self.surf.getCanvas()
        c.clear(skia.ColorBLACK)
        if x.sky and self.backdrop is not None:
            self.backdrop(c, look, t, x)
        elif x.sky:
            tw = x.twinkle + 4 * self.S.pulse("hat", t, 0.08) + 8 * self.S.pulse("bell", t, 0.25)
            self.sky.draw(c, look, t, twinkle=tw)
            for i, dt in self.recent("crash", t, 1.3):
                self.sky.shooting_star(c, dt / 1.2, i)
        c.save()
        if x.shake > 0.01:
            c.translate((rnd("sx", fi) - 0.5) * x.shake, (rnd("sy", fi) - 0.5) * x.shake)
        if abs(x.zoom - 1) > 1e-4:
            c.translate(W / 2, H / 2)
            c.scale(x.zoom, x.zoom)
            c.translate(-W / 2, -H / 2)
        c.drawPicture(pic)
        c.restore()
        if x.hearts:
            hearts(c, t, self.recent("clap", t, 1.6))
        if x.dim > 0.01:
            c.drawPaint(paint((0.0, 0.0, 0.02), clamp(x.dim)))

        surf = self.surf
        if x.power < 0.999:  # old-TV power on/off: dot -> line -> picture
            sx, sy, glow = crt_power(x.power)
            img = self.surf.makeImageSnapshot()
            c2 = self.surf2.getCanvas()
            c2.clear(skia.ColorBLACK)
            if sx > 0:
                ww, hh = max(2, W * sx), max(2, H * sy)
                c2.drawImageRect(img, skia.Rect.MakeXYWH(W / 2 - ww / 2, H / 2 - hh / 2, ww, hh), LIN)
                if glow > 0:
                    lw = max(6, W * sx)
                    c2.drawRect(skia.Rect.MakeXYWH(W / 2 - lw / 2, H / 2 - 3, lw, 6), paint((0.92, 0.96, 1.0), glow))
                    c2.drawRect(skia.Rect.MakeXYWH(W / 2 - lw / 2, H / 2 - 14, lw, 28),
                                paint((0.55, 0.72, 1.0), glow * 0.6, blur=16))
            surf = self.surf2
        bc = surf.getCanvas()
        boost = 0.10 * self.kick(t, 0.15) * x.hearts
        self.bloom.apply(surf, alpha=look["bloom"] + boost, gain=1.8, threshold=1.2, blur=10, tint=look["glow"])
        post.vignette(bc, self.w, self.h, look["vig"], col=(0.0, 0.0, 0.04))
        if self.post_fx is not None:
            self.post_fx(bc, t, fi, x, look)
        if x.flash > 0.01:
            bc.drawPaint(paint((1.0, 1.0, 1.0), min(1, x.flash)))
        if t > self.tl.dur - self.outro_fade:
            bc.drawPaint(paint((0, 0, 0), 1 - smooth((self.tl.dur - t) / self.outro_fade)))
        out = post.to_array(surf).astype(np.int16)
        if x.chroma > 0.3:
            out = post.chroma_shift(out, int(x.chroma))
        if x.mono > 0.001:
            g = out.mean(axis=2, keepdims=True)
            out = (out * (1 - x.mono) + g * np.array([0.92, 0.95, 1.08]) * x.mono).astype(np.int16)
        post.add_grain(out, self.grain, fi)
        post.finish(out)
        return out.astype(np.uint8).tobytes()


# ================================================================ covers
def save_cover(surf, w, h, path, look):
    c = surf.getCanvas()
    post.Bloom(w, h).apply(surf, alpha=look["bloom"], gain=1.8, threshold=1.2, blur=10, tint=look["glow"])
    post.vignette(c, w, h, look["vig"] * 0.8, col=(0.0, 0.0, 0.04))
    save_png(surf, path, grain=2.5)
