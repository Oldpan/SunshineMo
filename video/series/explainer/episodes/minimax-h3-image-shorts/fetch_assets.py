"""Download the official MiniMax H3-Image figures and cut them into the panels the scenes use.

    python3 fetch_assets.py          # writes assets.nosync/*.jpg (gitignored; sources are public on Hugging Face / minimax.cn)

Everything shown in the film is MiniMax's own published material: the Hugging Face model card assets of
MiniMaxAI/MiniMax-H3-Image and the two figures of the 2026-11-10 blog post (speed chart, price table).
Panel borders are found from the white gutters between panels, so a re-upload with the same layout still cuts right.
"""
import io
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE / "assets.nosync"
HF = "https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/resolve/main/assets/"
BLOG = "https://filecdn.minimax.chat/public/"
SRC = {
    "hero": HF + "showcase_hero.jpg", "banner": HF + "minimax-h3-image.jpg", "art": HF + "showcase/art.jpg",
    "photo": HF + "showcase/photo.jpg", "text": HF + "showcase/text.jpg", "edit_map": HF + "showcase/edit_map.jpg",
    "edit_render": HF + "showcase/edit_render.jpg", "edit_multi": HF + "showcase/edit_multi.jpg",
    "speed": BLOG + "h3-image-body-1-1794323228475.png", "price": BLOG + "h3-image-body-2-1794323228475.png",
}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "video-build"}), timeout=120) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGB")


def gutters(im, axis):
    """(start, end) runs of near-white, flat rows (axis=1) or columns (axis=0)."""
    a = np.asarray(im.convert("L")).astype(float)
    m = (a.mean(axis) > 235) & (a.std(axis) < 14)
    runs, s = [], None
    for i, v in enumerate(m):
        if v and s is None:
            s = i
        if not v and s is not None:
            runs.append((s, i))
            s = None
    if s is not None:
        runs.append((s, len(m)))
    return runs


def panels(im):
    """Left-to-right panels of a horizontal strip, split at its white gutters."""
    w = im.size[0]
    cuts = [0] + [v for g in gutters(im, 0) for v in g] + [w]
    return [im.crop((cuts[i], 0, cuts[i + 1], im.size[1])) for i in range(0, len(cuts) - 1, 2) if cuts[i + 1] - cuts[i] > 60]


def save(im, name, q=92):
    im.save(OUT / f"{name}.jpg", quality=q)


def main():
    OUT.mkdir(exist_ok=True)
    img = {k: get(u) for k, u in SRC.items()}
    for k in ("banner", "edit_multi"):
        save(img[k], k)
    # 15-image hero mosaic: three rows split by white gutters, each row by its columns
    hero = img["hero"]
    rows = [(0 if i == 0 else g[1], nxt) for i, (g, nxt) in enumerate(zip([(0, 0)] + gutters(hero, 1), [g[0] for g in gutters(hero, 1)] + [hero.size[1]]))]
    names = [["battle", "shanshui", "frog", "rabbit", "whitehair"], ["rose", "city", "dumplings", "cow", "mirror"],
             ["otter", "pixelcat", "beetle", "cherries", "selfie"]]
    for (y0, y1), row in zip(rows, names):
        for p, n in zip(panels(hero.crop((0, y0, hero.size[0], y1))), row):
            save(p, n)
    for k, ns in {"art": ["ducks", "shanshui2", "moonrabbit", "pelican"], "photo": ["laundry", "tea", "flamingo"],
                  "edit_map": ["map_in", "map_out"], "edit_render": ["render_in", "render_out"]}.items():
        for p, n in zip(panels(img[k]), ns):
            save(p, n)
    t = img["text"]
    ps = panels(t)
    save(ps[0], "puzzle_cn")
    save(ps[1], "puzzle_en")
    m = img["edit_multi"]
    g = gutters(m, 1)
    save(m.crop((0, g[0][1], m.size[0], g[1][0])), "furniture")
    save(m.crop((0, g[1][1], m.size[0], m.size[1])), "livingroom")
    f = m.crop((0, g[0][1], m.size[0], g[1][0]))  # the 10 references: the empty room, then 9 pieces of furniture
    for i, tile in enumerate(panels(f)):
        save(tile, f"furn_{i}")
    s = img["speed"]  # 1080 wide; the text-to-image row (1K / 2K / 4K groups)
    save(s.crop((40, 85, 1040, 440)), "speed_t2i")
    save(img["price"], "price")
    for f in sorted(OUT.glob("*.jpg")):
        print(f.name, Image.open(f).size)


if __name__ == "__main__":
    main()
