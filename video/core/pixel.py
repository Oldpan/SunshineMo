"""Pixel-art pieces that sit inside an ordinary (smooth, anti-aliased) scene.

    hero = Sprite.from_ascii(ROWS, {"#": ORANGE, "o": BLACK})
    hero.draw(c, x, y, px=12)                         # every cell = 12 x 12 screen pixels, hard edges
    pixel_text(c, "LOADING", x, y, WHITE, scale=2)     # GNU Unifont (apt: fonts-unifont), crisp at 16 px multiples
    cells = text_cells("你好", font(48), cell=6)        # smooth text sampled into pixel blocks...
    shatter(c, cells, x, y, u, col, size=6)            # ...that break apart and fall

Rectangles are snapped to whole pixels and drawn without anti-aliasing, so sprites stay crisp
whatever the scale.
"""
import math

import numpy as np
import skia

from .gfx import font, paint, clamp

UNIFONT_ASCENT = 14  # baseline sits 14 px below the top of a 16 px Unifont cell


def snap(v):
    return int(math.floor(v + 0.5))


# ------------------------------------------------------------------ shapes
def rect(c, x, y, w, h, col, a=1.0):
    if a <= 0.002 or w <= 0 or h <= 0:
        return
    c.drawRect(skia.Rect.MakeXYWH(snap(x), snap(y), snap(w), snap(h)), paint(col, a, aa=False))


def frame_rect(c, x, y, w, h, col, a=1.0, t=1):
    """Hollow rectangle with a border t pixels thick."""
    rect(c, x, y, w, t, col, a)
    rect(c, x, y + h - t, w, t, col, a)
    rect(c, x, y + t, t, h - 2 * t, col, a)
    rect(c, x + w - t, y + t, t, h - 2 * t, col, a)


# ------------------------------------------------------------------ sprites
class Sprite:
    """A grid of characters; each character maps to a colour ('.' / ' ' / None = transparent)."""

    def __init__(self, rows, palette):
        self.rows = list(rows)
        self.h = len(self.rows)
        self.w = max(len(r) for r in self.rows) if self.rows else 0
        self.palette = dict(palette)
        self.cells = {}
        for y, row in enumerate(self.rows):
            for x, ch in enumerate(row):
                if ch in ". " or self.palette.get(ch) is None:
                    continue
                self.cells.setdefault(ch, []).append((x, y))

    @classmethod
    def from_ascii(cls, text_or_rows, palette):
        rows = text_or_rows.strip("\n").split("\n") if isinstance(text_or_rows, str) else text_or_rows
        return cls(rows, palette)

    def draw(self, c, x, y, px=1, a=1.0, flip=False, recolor=None, glow=0.0):
        """Top-left at (x, y); px screen pixels per cell.  glow > 0 adds a soft halo in each colour
        (helps a sprite sit in a lit, smooth scene)."""
        x, y = snap(x), snap(y)
        for ch, pts in self.cells.items():
            col = (recolor or {}).get(ch, self.palette[ch])
            if col is None:
                continue
            path = skia.Path()
            for cx, cy in pts:
                if flip:
                    cx = self.w - 1 - cx
                path.addRect(skia.Rect.MakeXYWH(x + cx * px, y + cy * px, px, px))
            if glow > 0:
                c.drawPath(path, paint(col, a * glow, blur=px * 1.6))
            c.drawPath(path, paint(col, a, aa=False))


def draw_cells(c, cells, x, y, px, a=1.0, glow=0.0, flip_w=None):
    """{colour: [(cx, cy), ...]} -> hard-edged blocks of px screen pixels (optionally mirrored)."""
    x, y = snap(x), snap(y)
    for col, pts in cells.items():
        path = skia.Path()
        for cx, cy in pts:
            if flip_w is not None:
                cx = flip_w - 1 - cx
            path.addRect(skia.Rect.MakeXYWH(x + cx * px, y + cy * px, px, px))
        if glow > 0:
            c.drawPath(path, paint(col, a * glow, blur=px * 1.6))
        c.drawPath(path, paint(col, a, aa=False))


# ------------------------------------------------------------------ pixel font (UI accents)
def pixel_font(scale=1):
    """Unifont at an integer multiple of its 16 px design size."""
    f = font(16 * scale, "pixel")
    f.setSubpixel(False)
    return f


def pixel_text_width(s, scale=1):
    f = pixel_font(scale)
    return sum(f.measureText(ch) for ch in s)


def pixel_text(c, s, x, y, col, a=1.0, scale=1, align="left", shadow=None, t=None, cps=14.0):
    """Pixel-font text with its top-left (not baseline) at y.  t, cps: typewriter reveal."""
    f = pixel_font(scale)
    total = pixel_text_width(s, scale)
    x0 = snap(x - (total / 2 if align == "center" else total if align == "right" else 0))
    base = snap(y) + UNIFONT_ASCENT * scale
    shown = s if t is None else s[:int(max(0.0, t) * cps)]
    if shadow is not None:
        c.drawString(shown, x0 + scale, base + scale, f, paint(shadow, a, aa=False))
    c.drawString(shown, x0, base, f, paint(col, a, aa=False))
    return total


# ------------------------------------------------------------------ smooth text -> pixels
_CELLS = {}


def text_cells(s, f, cell=6):
    """Sample a (smooth) text string on a grid of `cell` px blocks.  Returns an (n, 2) array of block
    top-left offsets relative to the text's left edge / baseline.  Cached."""
    key = (s, f.getTypeface().getFamilyName(), f.getSize(), cell)
    if key not in _CELLS:
        size = f.getSize()
        w = int(f.measureText(s)) + 2 * cell
        h = int(size * 1.5)
        surf = skia.Surface(w, h)
        cv = surf.getCanvas()
        cv.clear(skia.ColorTRANSPARENT)
        base = int(size * 1.1)
        cv.drawString(s, cell, base, f, skia.Paint(AntiAlias=True, Color=skia.ColorWHITE))
        alpha = surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)[..., 3].astype(np.float32)
        gh, gw = h // cell, w // cell
        cov = alpha[:gh * cell, :gw * cell].reshape(gh, cell, gw, cell).mean(axis=(1, 3)) / 255.0
        ys, xs = np.nonzero(cov > 0.28)
        _CELLS[key] = np.stack([xs * cell - cell, ys * cell - base], 1).astype(np.float32)
    return _CELLS[key]


def shatter(c, pts, x, y, u, col, a=1.0, seed=0, spread=60.0, fall=200.0, size=6, rise=False):
    """Pixel blocks breaking apart: u = 0 assembled (as blocks), 1 scattered and gone.
    pts: from text_cells() or a sprite's cells (times px).  rise=True floats them up instead of falling."""
    if u >= 1 or len(pts) == 0:
        return
    r = np.random.default_rng(seed)
    n = len(pts)
    vx = r.normal(0, 1, n) * spread
    vy = -np.abs(r.normal(0.4, 0.5, n)) * spread
    delay = r.uniform(0, 0.4, n)
    k = np.clip((max(u, 0) - delay) / (1 - delay), 0, 1)
    g = -fall if rise else fall
    xs = x + pts[:, 0] + vx * k
    ys = y + pts[:, 1] + vy * k + g * k * k
    path = skia.Path()
    for xi, yi in zip(xs, ys):
        path.addRect(skia.Rect.MakeXYWH(snap(xi), snap(yi), size - 1, size - 1))
    c.drawPath(path, paint(col, a * (1 - clamp((u - 0.5) / 0.5)), aa=False))


# ------------------------------------------------------------------ old-TV power on/off
def crt_power(u):
    """CRT power-on (u: 0 -> 1) as (scale_x, scale_y, line_glow).  Run it backwards for power-off.

    0.00-0.35: a dot grows into a bright horizontal line; 0.35-1: the picture opens vertically."""
    if u >= 1:
        return 1.0, 1.0, 0.0
    if u <= 0:
        return 0.0, 0.0, 0.0
    if u < 0.35:
        k = u / 0.35
        return max(0.004, k ** 1.6), 0.004, 1.0
    k = (u - 0.35) / 0.65
    return 1.0, max(0.004, 1 - (1 - k) ** 3), 1 - k
