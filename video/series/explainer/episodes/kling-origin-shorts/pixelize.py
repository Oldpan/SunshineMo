"""Pixel-art versions of the 鲸鱼娘 poses (assets.nosync/whale_<pose>.png → whale_<pose>_px.png).

Downscale by K with a box filter (keeps the face colours honest), hard alpha, a small shared palette so every pose
uses the same colours, a 1-pixel ink outline around the silhouette, then a nearest-neighbour upscale back to size.
Run: /usr/local/bin/python3 pixelize.py
"""
from pathlib import Path

from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent
A = HERE / "assets.nosync"
K = 7          # source pixels per art pixel
ALPHA = 120    # alpha threshold
COLORS = 40    # shared palette size
INK = (46, 38, 80, 255)
POSES = ["still", "wave", "dance1", "dance2", "report"]


def small(p: Path) -> Image.Image:
    im = Image.open(p).convert("RGBA")
    w, h = im.size
    # premultiply so transparent edge pixels don't bleed white into the small image
    bg = Image.new("RGBA", im.size, (0, 0, 0, 0))
    s = im.resize((w // K, h // K), Image.BOX)
    a = s.getchannel("A").point(lambda v: 255 if v >= ALPHA else 0)
    s.putalpha(a)
    return s


def main() -> None:
    smalls = {p: small(A / f"whale_{p}.png") for p in POSES}
    # one palette from all poses together
    strip = Image.new("RGB", (sum(s.width for s in smalls.values()), max(s.height for s in smalls.values())), (255, 255, 255))
    x = 0
    for s in smalls.values():
        strip.paste(s.convert("RGB"), (x, 0), s.getchannel("A"))
        x += s.width
    pal = strip.quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT)
    for p, s in smalls.items():
        rgb = s.convert("RGB").quantize(palette=pal, dither=Image.Dither.NONE).convert("RGBA")
        a = s.getchannel("A")
        rgb.putalpha(a)
        # 1-px outline: alpha dilated by one pixel minus the original
        grown = a.filter(ImageFilter.MaxFilter(3))
        out = Image.new("RGBA", s.size, (0, 0, 0, 0))
        ink = Image.new("RGBA", s.size, INK)
        out.paste(ink, (0, 0), grown)
        out.alpha_composite(rgb)
        big = out.resize((s.width * K, s.height * K), Image.NEAREST)
        big.save(A / f"whale_{p}_px.png")
        print(p, big.size)


if __name__ == "__main__":
    main()
