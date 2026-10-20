"""Frame post-processing shared by styles: bloom, chromatic aberration, grain, glitch slices.

Styles decide which of these to use and how hard; keep them subtle (see the skill's
readability notes: v1 of the first film was washed out by too much glow/bloom/chroma).
"""
import numpy as np
import skia

from .gfx import rnd

LIN = skia.SamplingOptions(skia.FilterMode.kLinear)


class Bloom:
    """Threshold -> downsample -> blur -> add.  Only genuinely bright pixels glow."""

    def __init__(self, w, h, scale=4):
        self.w, self.h = w, h
        self.sw, self.sh = w // scale, h // scale
        self.surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(self.sw, self.sh, skia.kRGBA_8888_ColorType,
                                                                skia.kPremul_AlphaType))

    def apply(self, surf, alpha=0.35, gain=2.2, threshold=1.25, blur=7):
        """out += blur(max(0, gain*x - threshold)) * alpha on the canvas of `surf`."""
        img = surf.makeImageSnapshot()
        bcv = self.surf.getCanvas()
        bcv.clear(skia.ColorBLACK)
        g, o = gain, -threshold
        thr = skia.Paint(ColorFilter=skia.ColorFilters.Matrix([
            g, 0, 0, 0, o, 0, g, 0, 0, o, 0, 0, g, 0, o, 0, 0, 0, 1, 0]))
        bcv.drawImageRect(img, skia.Rect(0, 0, self.w, self.h), skia.Rect(0, 0, self.sw, self.sh), LIN, thr)
        bimg = self.surf.makeImageSnapshot()
        bp = skia.Paint(ImageFilter=skia.ImageFilters.Blur(blur, blur), BlendMode=skia.BlendMode.kPlus,
                        Alphaf=alpha)
        surf.getCanvas().drawImageRect(bimg, skia.Rect(0, 0, self.sw, self.sh), skia.Rect(0, 0, self.w, self.h),
                                       LIN, bp)


def to_array(surf):
    """RGB uint8 array (h, w, 3) of a surface."""
    return surf.makeImageSnapshot().toarray(colorType=skia.kRGBA_8888_ColorType)[..., :3]


def chroma_shift(arr, px):
    """Shift red right and blue left by px; returns int16 for further compositing."""
    out = arr.astype(np.int16)
    if px > 0:
        out[:, px:, 0] = arr[:, :-px, 0]
        out[:, :-px, 2] = arr[:, px:, 2]
    return out


def make_grain(rng, w, h, amount=3, frames=6):
    """Half-resolution gaussian grain tiles (int16), cycled per frame."""
    return [(rng.normal(0, 1, (h // 2, w // 2)) * amount).astype(np.int16) for _ in range(frames)]


def add_grain(out, tiles, fi):
    g = tiles[fi % len(tiles)]
    g = np.repeat(np.repeat(g, 2, 0), 2, 1)
    out += g[..., None]
    return out


def glitch_slices(out, amt, fi, bands=9, max_shift=160, max_h=90):
    """Horizontal slice displacement + red split; amt 0..1."""
    h = out.shape[0]
    for b in range(bands):
        if rnd("gl", fi, b) < 0.45:
            continue
        y0 = int(rnd("gy", fi, b) * h)
        y1 = min(h, y0 + int(10 + max_h * rnd("gh", fi, b)))
        off = int((rnd("go", fi, b) - 0.5) * max_shift * amt)
        out[y0:y1] = np.roll(out[y0:y1], off, axis=1)
        out[y0:y1, :, 0] = np.roll(out[y0:y1, :, 0], int(12 * amt), axis=1)
    return out


def finish(out):
    np.clip(out, 0, 255, out=out)
    return out
