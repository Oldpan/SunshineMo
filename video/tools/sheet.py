"""Contact sheet of stills, to look at many frames at once.

    python3 video/tools/sheet.py out/sheet.jpg 2 out/stills/t0005.00.png out/stills/t0011.00.png ...
"""
import sys

from PIL import Image, ImageDraw


def main(out, cols, files, tw=960, th=540):
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, rows * th), (40, 40, 40))
    d = ImageDraw.Draw(sheet)
    for k, f in enumerate(files):
        im = Image.open(f).convert("RGB")
        im.thumbnail((tw, th), Image.LANCZOS)
        x, y = (k % cols) * tw, (k // cols) * th
        sheet.paste(im, (x + (tw - im.width) // 2, y + (th - im.height) // 2))
        d.text((x + 10, y + 10), f.split("/")[-1], fill=(255, 0, 0))
    sheet.save(out, quality=88)
    print(out)


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]), sys.argv[3:])
