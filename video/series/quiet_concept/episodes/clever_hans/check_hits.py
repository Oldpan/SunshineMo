"""Prove every visual hit in cues.HITS has its sound on the same video frame (target: 0 frames off).

  python3 music.py && python3 check_hits.py
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))  # video/
from core.paths import episode  # noqa: E402
HERE, OUT = episode(__file__)
from cues import HITS, t_of  # noqa: E402

FPS = 60
d = np.load(Path(OUT) / "sync.npz")
worst, missing = 0, []
for name, bar, beat in HITS:
    if name not in d.files:
        missing.append((name, bar, beat))
        continue
    ev = np.atleast_1d(d[name])
    ev = ev if ev.ndim == 1 else ev[:, 0]
    t = t_of(bar, beat)
    off = int(round(t * FPS)) - int(round(ev[np.argmin(np.abs(ev - t))] * FPS))
    if abs(off) > 0:
        missing.append((name, bar, beat, f"{off:+d} frames"))
    worst = max(worst, abs(off))
print(f"{len(HITS)} hits, worst offset {worst} frames")
for m in missing:
    print("  OFF", m)
sys.exit(1 if missing else 0)
