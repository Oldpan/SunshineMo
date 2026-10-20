"""Cover helpers shared by every series: letter-spaced Latin titles and PNG output.

Each series' style.py keeps its own look (headline treatment, background); the layout
pattern (hook / headline / answer / spaced English title) is documented in the series README.
"""
import numpy as np
import skia

from .gfx import char_layout, paint

SIZES = {"16x9": (1920, 1080), "3x4": (1080, 1440)}


def spaced(c, s, x, y, f, sp, col, a=1.0, align="left"):
    """Letter-spaced Latin line (e.g. the English title)."""
    lay, total = char_layout(s, f, sp)
    x0 = x - total / 2 if align == "center" else x
    for ch, dx, _ in lay:
        c.drawString(ch, x0 + dx, y, f, paint(col, a))


def save_png(surf, path, grain=0.0, seed=2):
    """Save a cover; grain > 0 adds monochrome film grain of that standard deviation (0..255)."""
    if grain <= 0:
        surf.makeImageSnapshot().save(path, skia.kPNG)
    else:
        from PIL import Image
        arr = surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)[..., :3].astype(np.int16)
        arr += np.random.default_rng(seed).normal(0, grain, arr.shape[:2]).astype(np.int16)[..., None]
        np.clip(arr, 0, 255, out=arr)
        Image.fromarray(arr.astype(np.uint8)).save(path)
    print(path)
