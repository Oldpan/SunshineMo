"""Where things live, so episode scripts work from template/ or episodes/<name>/ unchanged.

Every episode script starts with:

    import sys
    from pathlib import Path
    sys.path.insert(0, str(next(p for p in Path(__file__).resolve().parents if (p / "core").is_dir())))
    from core.paths import episode  # noqa: E402
    HERE, OUT = episode(__file__)   # also puts the series dir (style.py) on sys.path
"""
import os
import sys


def find_up(start, marker):
    """Nearest ancestor directory of `start` containing `marker`."""
    d = os.path.dirname(os.path.abspath(start))
    while not os.path.exists(os.path.join(d, marker)):
        parent = os.path.dirname(d)
        if parent == d:
            raise FileNotFoundError(f"no {marker} above {start}")
        d = parent
    return d


def episode(script):
    """(episode dir, its out/ dir); adds the series dir to sys.path when there is one."""
    here = os.path.dirname(os.path.abspath(script))
    try:
        series = find_up(script, "style.py")
        if series not in sys.path:
            sys.path.insert(1, series)
    except FileNotFoundError:
        pass
    return here, os.path.join(here, "out")
