"""Tofu check: list characters in a script's string literals that a font cannot draw.

    python3 video/tools/glyphs.py render.py cover.py ../../style.py            # default: WenKai faces
    python3 video/tools/glyphs.py render.py --font /usr/share/fonts/truetype/wqy/wqy-zenhei.ttc
    python3 video/tools/glyphs.py render.py cues.py --font /usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc#2
                                                                # path#N: face N of a .ttc (2 = Noto CJK SC)
"""
import argparse
import ast

import skia

KAI = "/usr/share/fonts/truetype/lxgw-wenkai/LXGWWenKai-{}.ttf"

ap = argparse.ArgumentParser()
ap.add_argument("files", nargs="+")
ap.add_argument("--font", action="append", help="font file(s) to check (default: WenKai Regular/Bold/Light)")
args = ap.parse_args()
chars = set()
for f in args.files:
    for node in ast.walk(ast.parse(open(f).read())):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            chars |= set(node.value)
chars = sorted(ch for ch in chars if ord(ch) > 127)
bad = 0
for path in args.font or [KAI.format(w) for w in ("Regular", "Bold", "Light")]:
    file, _, face = path.partition("#")
    tf = skia.Typeface.MakeFromFile(file, int(face or 0))
    missing = [ch for ch in chars if tf.unicharsToGlyphs([ord(ch)])[0] == 0]
    bad += len(missing)
    print(f"{path}: missing {''.join(missing) or 'none'}")
print(f"{len(chars)} non-ASCII characters checked")
raise SystemExit(1 if bad else 0)
