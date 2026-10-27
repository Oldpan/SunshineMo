"""Find spots that play like a stutter: the sound drops out mid-film, or the picture and the sound both stop.

  python3 video/tools/stutter.py out/film.mp4 [--cuts 19.2,24.0,...]

A dropout is audio below -45 dBFS for more than 0.1 s anywhere but the first and last second.  Viewers hear
an 8 ms cut to silence (often with a held frame, often right before a scene cut) as the player hanging, not as
a dramatic pause.  Exits 1 when any is found, listing time, length and the nearest scene cut if given.
Lesson from 一帧一理04 第一座山 (2026-10-26): seven gated silences + frozen frames read as 7 stutters.
"""
import re
import subprocess
import sys


def spans(cmd, start_key, end_key):
    out = subprocess.run(cmd, capture_output=True, text=True).stderr
    a = [float(x) for x in re.findall(start_key + r":\s*([\d.]+)", out)]
    b = [float(x) for x in re.findall(end_key + r":\s*([\d.]+)", out)]
    return list(zip(a, b))


def duration(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                 path], capture_output=True, text=True).stdout)


def main():
    path = sys.argv[1]
    cuts = []
    if "--cuts" in sys.argv:
        cuts = [float(x) for x in sys.argv[sys.argv.index("--cuts") + 1].split(",") if x]
    dur = duration(path)
    sil = spans(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "silencedetect=n=-45dB:d=0.1",
                 "-f", "null", "-"], "silence_start", "silence_end")
    bad = [(a, b) for a, b in sil if a > 1.0 and b < dur - 1.0]
    for a, b in bad:
        near = min(cuts, key=lambda c: abs(c - b)) if cuts else None
        note = f", {abs(near - b):.2f} s from the cut at {near:.2f}" if near is not None and abs(near - b) < 1.5 else ""
        print(f"  DROPOUT {a:7.2f}–{b:7.2f} s ({b - a:.2f} s){note}")
    print(f"{len(bad)} audio dropouts in {dur:.1f} s")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
