"""Cover images for 回来的飞机 (幸存者偏差), in blueprint: the holed bomber, engines circled, the one red stamp.

  python3 cover.py             # → out/cover_16x9.png (1920x1080), out/cover_3x4.png (1080x1440)
  COVER=B python3 cover.py     # → out/cover_16x9_B.png, out/cover_3x4_B.png
"""
import os

import skia

from render import (P, PX, PY, HOLES, ENGINES, OUT, draw_hole, plane, region_paths, nacelle_path, hatch, letter,
                    stamp, border, rev_cloud, sheet_image, font, paint, col4, TABLE, ghost_plane)
from cues import TITLE, TITLE_Q, CONCEPT, CONCEPT_EN

# A: the film's question.  B: the strongest verifiable fact (Wald, SRG 1943) as a positive hook.
VARIANT = os.environ.get("COVER", "A")
COVER_Q = {"A": TITLE_Q, "B": "1943 年 Wald 的答案：加固没有洞的地方"}


def drawing(c, ox, oy, s):
    c.save()
    c.translate(ox, oy)
    c.scale(s, s)
    c.translate(-PX, -PY)
    plane(c, 0, us=[1, 1, 1, 1])
    for hx, hy, z in HOLES:
        draw_hole(c, *P(hx, hy), 1.0, 1.0, False)
    for p in region_paths().values():
        hatch(c, p, 1.0, 12, 45, 1.0, 0.22)
    for ex, ey in ENGINES:
        hatch(c, nacelle_path(ex, ey), 1.0, 6, -45, 1.2, 0.95)
    for ex in (-190, 190):
        rev_cloud(c, *P(ex, -36), 120, 86, 1.0, 1.0, 13, 2.6)
    c.restore()


def save(surf, name):
    surf.makeImageSnapshot().save(os.path.join(OUT, name), skia.kPNG)


def sheet(c, w, h):
    c.clear(col4(TABLE, 1))
    c.save()
    c.scale(w / 1920, h / 1080)
    c.drawImage(sheet_image(1920, 1080), 0, 0)
    c.restore()


def cover_16x9():
    w, h = 1920, 1080
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    sheet(c, w, h)
    border(c)
    ghost_plane(c, 1700, 250, 0.22, 12, 0.5, (0, 3), 1.0)
    drawing(c, 1260, 600, 0.95)
    letter(c, TITLE, 110, 300, 150, kind="handb")
    for k, part in enumerate(COVER_Q[VARIANT].split("：") if VARIANT == "B" else [COVER_Q[VARIANT]]):
        letter(c, part + ("：" if VARIANT == "B" and k == 0 else ""), 116, 450 + k * 70, 54, kind="handb")
    wcon = font(34).measureText(CONCEPT)
    letter(c, CONCEPT, 118, 360, 34, 1.0, 0.85)
    letter(c, f" · {CONCEPT_EN}", 118 + wcon, 360, 26, 1.0, 0.8, kind="mono")
    stamp(c, 420, 760, CONCEPT, CONCEPT_EN, 1.0, size=60)
    letter(c, "一帧一理 · 05", 110, 1000, 26, 1.0, 0.6)
    save(surf, "cover_16x9.png" if VARIANT == "A" else "cover_16x9_B.png")


def cover_3x4():
    w, h = 1080, 1440
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    sheet(c, w, h)
    c.drawRect(skia.Rect.MakeXYWH(30, 30, w - 60, h - 60), paint(0.8, 2.2))
    c.drawRect(skia.Rect.MakeXYWH(42, 42, w - 84, h - 84), paint(0.45, 1))
    drawing(c, 540, 930, 1.0)
    letter(c, TITLE, 540, 250, 140, kind="handb", align="center")
    wcon = font(32).measureText(CONCEPT)
    wen = font(24, "mono").measureText(f" · {CONCEPT_EN}")
    letter(c, CONCEPT, 540 - (wcon + wen) / 2, 310, 32, 1.0, 0.85)
    letter(c, f" · {CONCEPT_EN}", 540 - (wcon + wen) / 2 + wcon, 310, 24, 1.0, 0.8, kind="mono")
    q = COVER_Q[VARIANT]
    parts = [q[:q.index("：") + 1], q[q.index("：") + 1:]] if "：" in q else [q[:q.index("，") + 1], q[q.index("，") + 1:]]
    for k, part in enumerate(parts):
        letter(c, part, 540, 420 + k * 72, 54, kind="handb", align="center")
    stamp(c, 820, 1300, CONCEPT, CONCEPT_EN, 1.0, size=52)
    letter(c, "一帧一理 · 05", 90, 1380, 26, 1.0, 0.6)
    save(surf, "cover_3x4.png" if VARIANT == "A" else "cover_3x4_B.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    cover_16x9()
    cover_3x4()
