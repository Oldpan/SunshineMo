"""Style frames: 第一座山 in ink wash (水墨), two moments: in the fog near the top, and the dawn reveal."""
import math
import os
import sys
from pathlib import Path

import numpy as np
import skia

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from style import serif  # noqa: E402
from ink import *  # noqa: E402,F401,F403

W, H = 1920, 1080


def height(x):
    return 80 + 520 * math.exp(-((x - 1500) / 420) ** 2) + 1150 * math.exp(-((x - 3300) / 650) ** 2)


def rough(x):
    """What the brush draws: the same range with crags (the story still climbs the smooth one)."""
    env = (0.25 + 0.75 * min(1, height(x) / 600)) * (1 - math.exp(-((x - 1500) / 160) ** 2)) \
        * (1 - 0.8 * math.exp(-((x - 3300) / 200) ** 2))       # summits stay true summits
    return height(x) + env * (34 * math.sin(x / 61 + 1.3) + 22 * math.sin(x / 23 + 0.4) + 12 * math.sin(x / 9.7))


def ridge(cam, x0, x1, n=120):
    return [cam(x, rough(x)) for x in np.linspace(x0, x1, n)]


def figure_xieyi(c, x, y, s, lantern=True, seed=1):
    """One pale body mass and two loaded strokes; burnt-ink head; a vermilion lantern on a short pole."""
    mass(c, [(x - 26 * s, y), (x - 14 * s, y - 64 * s), (x + 2 * s, y - 92 * s), (x + 16 * s, y - 64 * s),
             (x + 24 * s, y)], "dan", seed, fade_down=False, blur=4 * s)
    brush(c, [(x + 2 * s, y - 92 * s), (x - 6 * s, y - 50 * s), (x - 14 * s, y)], 9 * s, "nong", 0.3, 10, seed)
    brush(c, [(x + 4 * s, y - 88 * s), (x + 12 * s, y - 46 * s), (x + 10 * s, y - 2 * s)], 6 * s, "zhong", 0.5,
          8, seed + 1)
    c.drawCircle(x + 3 * s, y - 102 * s, 8 * s, ink_paint(TONE["jiao"]))
    brush(c, [(x - 30 * s, y - 102 * s), (x + 3 * s, y - 116 * s), (x + 36 * s, y - 102 * s)], 5 * s, "jiao",
          0.2, 8, seed + 3, taper=(0.05, 0.05))           # bamboo hat
    if lantern:
        brush(c, [(x + 8 * s, y - 70 * s), (x + 34 * s, y - 96 * s)], 3 * s, "jiao", 0.1, 4, seed + 2)
        c.drawLine(x + 34 * s, y - 96 * s, x + 34 * s, y - 84 * s, ink_paint(TONE["nong"], stroke=1.2 * s))
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x + 28 * s, y - 84 * s, 12 * s, 16 * s), 3 * s, 3 * s),
                    skia.Paint(AntiAlias=True, Color4f=col4(RED, 0.95)))


def inscription(c, text, x, y, size=40):
    f = serif(size)
    c.drawRect(skia.Rect.MakeXYWH(x - size * 0.75, y - size * 0.62, size * 0.32, size * 0.32),
               skia.Paint(AntiAlias=True, Color4f=col4(RED, 0.9)))
    c.drawString(text, x, y, f, ink_paint(0.85))


def fog_frame():
    surf = skia.Surface(W, H)
    c = surf.getCanvas()
    c.drawImage(paper_image(W, H), 0, 0)
    z, cx, ch = 1.15, 1450, 560
    cam = lambda x, h: (760 + (x - cx) * z, 640 - (h - ch) * z)  # noqa: E731
    fx = 1450
    sx, sy = cam(fx, height(fx))
    # only what the lantern reaches is painted: a loaded ridge stroke that dries out at both ends
    brush(c, ridge(cam, fx - 330, fx + 300), 16, "nong", 0.55, 30, 11, loaded=0.8, taper=(0.35, 0.35), wet=0.6)
    for k, (a, b) in enumerate([(fx - 260, fx - 60), (fx + 40, fx + 220)]):     # 披麻皴 under the ridge
        for j in range(5):
            pts = [(px, py + 18 + j * 16) for px, py in ridge(cam, a + j * 12, b - j * 10, 30)]
            brush(c, pts, 5, "dan", 0.7, 6, 40 + k * 10 + j, loaded=0.2, taper=(0.4, 0.4))
    mass(c, [p for p in ridge(cam, fx - 300, fx + 280, 60)] + [(sx + 280, sy + 260), (sx - 300, sy + 260)],
         "dan", 5, h=240, blur=14)
    moss(c, [cam(fx - 120, height(fx - 120)), cam(fx + 90, height(fx + 90)), cam(fx - 200, height(fx - 200))], 2)
    mist(c, sy + 230, 220, W, 1.0)
    figure_xieyi(c, sx, sy + 2, 1.25)
    # the probe: one dry stroke down-slope, and a word
    px_, py_ = cam(fx + 80, height(fx + 80))
    brush(c, [(sx + 20, sy - 4), (px_, py_ + 6)], 5, "zhong", 0.8, 6, 77, taper=(0.1, 0.5))
    c.drawString("低", px_ + 30, py_ - 30, serif(38), ink_paint(0.75))
    # title column in the empty paper, inscription bottom-left
    inscription(c, "往左一步，低；往右一步，也低。", 220, 960)
    return surf


def dawn_frame():
    surf = skia.Surface(W, H)
    c = surf.getCanvas()
    c.drawImage(paper_image(W, H), 0, 0)
    z, cx = 0.42, 2300
    cam = lambda x, h: (960 + (x - cx) * z, 1040 - h * z)  # noqa: E731
    # far range first (清), then the real summit (淡 → 重 on its ridge), then the near hill (浓)
    far = [cam(x, 260 + 380 * math.exp(-((x - 2600) / 900) ** 2) + 60 * math.sin(x / 260)) for x in np.linspace(-200, 4800, 80)]
    mass(c, far + [(W, 1080), (0, 1080)], "qing", 1, h=300, blur=10, a=1.4)
    big = ridge(cam, 2300, 4400, 90)
    mass(c, big + [(1920, 1080), (big[0][0], 1080)], "dan", 2, h=420, blur=8, a=1.5)
    brush(c, ridge(cam, 2500, 3300, 60), 14, "nong", 0.45, 26, 3, loaded=0.8, taper=(0.3, 0.05), wet=0.5)
    brush(c, ridge(cam, 3300, 4300, 60), 12, "zhong", 0.6, 22, 4, loaded=0.7, taper=(0.05, 0.4))
    for j in range(7):
        pts = [(px - 8 * j, py + 30 + j * 22) for px, py in ridge(cam, 2900 + j * 30, 3250 - j * 20, 25)]
        brush(c, pts, 6, "zhong", 0.75, 6, 50 + j, loaded=0.2)
    mist(c, 760, 160, W, 0.95)
    near = ridge(cam, 600, 2350, 90)
    mass(c, near + [(near[-1][0], 1080), (near[0][0], 1080)], "zhong", 6, h=220, blur=8)
    brush(c, ridge(cam, 900, 2000, 70), 15, "jiao", 0.4, 28, 7, loaded=0.85, taper=(0.3, 0.3), wet=0.6)
    moss(c, [cam(x, height(x)) for x in (1250, 1380, 1620, 1760)], 9)
    mist(c, 990, 140, W, 1.0)
    sx, sy = cam(1500, height(1500))
    figure_xieyi(c, sx, sy + 1, 0.42)
    # title: a vertical column in the sky over the summit, the seal under it
    f = serif(120, bold=True)
    for i, ch in enumerate("第一座山"):
        c.drawString(ch, 1660, 180 + i * 130, f, ink_paint(0.9))
    seal(c, 1720, 760, 42, "局部最优", serif(40, bold=True))
    inscription(c, "它爬上了山顶，只是雾挡住了更高的那座。", 160, 140, 36)
    return surf


if __name__ == "__main__":
    out = Path(__file__).resolve().parents[1] / "out"
    out.mkdir(exist_ok=True)
    for name, fn in (("ink_fog", fog_frame), ("ink_dawn", dawn_frame)):
        surf = fn()
        surf.makeImageSnapshot().save(str(out / f"{name}.png"))
        print(out / f"{name}.png")
