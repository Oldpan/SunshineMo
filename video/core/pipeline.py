"""Render driver: stills, preview ranges and full renders piped into ffmpeg.

    run(frame_fn, setup_fn, dur, fps=60, out_dir=OUT, name="film.mp4", audio=OUT/music.wav)

frame_fn(fi) -> raw RGB bytes for frame index fi at the master fps.
setup_fn() is called once per worker process (load shaders, surfaces, random tables).

CLI (parsed from sys.argv):
  --still 12.5 60.2        PNG stills into out/stills/
  --range 56 64 [--fps 30] quick preview clip (veryfast preset)
  (none)                   full render, libx264 at --bitrate (default 14M) + AAC 256k
"""
import argparse
import multiprocessing as mp
import os
import subprocess
import time

from .gfx import W, H

_FRAME = None


def _call(fi):
    return _FRAME(fi)


def run(frame_fn, setup_fn, dur, fps=60, out_dir="out", name="film.mp4", audio=None, w=W, h=H, argv=None):
    global _FRAME
    _FRAME = frame_fn
    ap = argparse.ArgumentParser()
    ap.add_argument("--still", nargs="*", type=float)
    ap.add_argument("--range", nargs=2, type=float)
    ap.add_argument("--fps", type=int, default=fps)
    ap.add_argument("--workers", type=int, default=os.cpu_count())
    ap.add_argument("--out", default=os.path.join(out_dir, name))
    ap.add_argument("--bitrate", default="14M")
    args = ap.parse_args(argv)
    audio = audio or os.path.join(out_dir, "music.wav")

    if args.still:
        setup_fn()
        d = os.path.join(out_dir, "stills")
        os.makedirs(d, exist_ok=True)
        from PIL import Image
        for ts in args.still:
            t0 = time.time()
            buf = frame_fn(int(round(ts * fps)))
            Image.frombytes("RGB", (w, h), buf).save(os.path.join(d, f"t{ts:07.2f}.png"))
            print(f"{ts:.2f}s rendered in {time.time() - t0:.2f}s")
        return

    t_start, t_end = (args.range if args.range else (0, dur))
    step = fps // args.fps
    frames = list(range(int(t_start * fps), int(t_end * fps), step))
    out = args.out if not args.range else os.path.join(out_dir, f"preview_{t_start:g}_{t_end:g}.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
           "-r", str(args.fps), "-i", "-", "-ss", str(t_start), "-t", str(t_end - t_start), "-i", audio,
           "-c:v", "libx264", "-preset", "medium" if not args.range else "veryfast",
           "-b:v", args.bitrate, "-maxrate", "20M", "-bufsize", "28M",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", out]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    t0 = time.time()
    with mp.get_context("fork").Pool(args.workers, initializer=setup_fn) as pool:
        for i, buf in enumerate(pool.imap(_call, frames, chunksize=4)):
            ff.stdin.write(buf)
            if i % 300 == 0:
                el = time.time() - t0
                print(f"frame {i}/{len(frames)}  {el:.0f}s elapsed, eta {el / max(i, 1) * (len(frames) - i):.0f}s",
                      flush=True)
    ff.stdin.close()
    ff.wait()
    print(f"wrote {out} in {time.time() - t0:.0f}s")
