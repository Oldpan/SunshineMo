"""第一座山 (局部最优): one timing table for music.py, render.py and check_hits.py.

Beat-locked like 会算数的马: every visual hit is listed once in HITS as (name, bar, beat); music.py puts a sound
on it, render.py animates on it, check_hits.py proves both land on the same video frame.
Captions: {warm} [cool] <red>.  Warm is the lantern and what the climber knows, cool is the unseen range and
the way out, red is being stuck.
This file holds the cold-open test (10 bars at 100 BPM = 24 s); the full episode extends it.
"""
BPM = 100
BAR = 240 / BPM
BEAT = 60 / BPM
BARS = 10

TITLE = "第一座山"
TITLE_Q = "它爬上了山顶，只是[雾]挡住了更高的那座。"
CONCEPT, CONCEPT_EN = "局部最优", "LOCAL OPTIMUM"

SECTIONS = [("dark", 0, 1), ("climb", 1, 3), ("top", 3, 5), ("sure", 5, 7), ("flash", 7, 8), ("title", 8, 10)]

# (bar, text, pos, size, bars)
LINES = [
    (0, "夜里，大雾。一个人在找最高的地方。", "bottom", 46, 1),
    (1, "他只看得见脚下。规则是：哪边高，往哪边走。", "bottom", 44, 1),
    (2, "一步，一步，越走越快。", "bottom", 46, 1),
    (3, "然后，脚下[不再往上]了。", "bottom", 46, 1),
    (4, "往左一步，低；往右一步，也低。", "bottom", 46, 1),
    (5, "他{到顶了}。", "bottom", 50, 1),
    (6, "他很确定：这就是最高的地方。", "bottom", 46, 1),
    (7, "可雾的后面——", "bottom", 50, 1),
]

N_SLOW, N_FAST = 4, 8          # quarter-note steps in bar 1, eighth-note steps in bar 2
HITS = [("lamp", 0, 0), ("tag", 0, 2)]
HITS += [("step", 1, b) for b in range(N_SLOW)] + [("step", 2, b * 0.5) for b in range(N_FAST)]
HITS += [("top", 3, 0), ("probe", 3, 1), ("probe", 3, 2)]            # left, right: both lower; then silence
HITS += [("probe", 4, b) for b in range(4)]                           # checks again, on the beat
HITS += [("flag", 5, 0), ("alt", 5, 2)]
HITS += [("ping", 6, b) for b in range(4)]                            # lantern raised: only fog comes back
HITS += [("bolt", 7, 2)]                                              # lightning: the range, for an instant
HITS += [("title", 8, 0)] + [("char", 8, i * 0.25) for i in range(len(TITLE))] + [("concept", 8, 2)]

SILENCES = [(3, 2.5, 4.0), (7, 3.0, 4.0)]
SCENE_CUTS = [8]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    out = []
    for bar, text, pos, size, n in LINES:
        out.append((bar * BAR + 0.12, (bar + n) * BAR - 0.3, text, pos, size, BAR if "\n" in text else 0.0))
    return out
