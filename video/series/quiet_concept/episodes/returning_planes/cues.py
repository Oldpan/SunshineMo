"""回来的飞机 (幸存者偏差): one timing table for music.py, render.py and check_hits.py.

Beat-locked: every visual hit is listed once in HITS as (name, bar, beat); music.py puts a sound on it, render.py
animates on it, check_hits.py proves both land on the same video frame.
Design rules (series README): no true silences and no held frames anywhere; a hit on almost every beat.
Notes: {warm} [cool] <red> only set weight on the blueprint (blue and white); the one red is the stamp.
This file holds the cold-open test (10 bars at 100 BPM = 24 s); the full episode extends it.
"""
BPM = 100
BAR = 240 / BPM
BEAT = 60 / BPM
BARS = 10

TITLE = "回来的飞机"
TITLE_Q = "你看到的每一个洞，都是幸存者带回来的。"
CONCEPT, CONCEPT_EN = "幸存者偏差", "SURVIVORSHIP BIAS"

SECTIONS = [("sheet", 0, 1), ("draw", 1, 2), ("holes", 2, 4), ("armor", 4, 5), ("wald", 5, 7), ("ghosts", 7, 8),
            ("title", 8, 10)]

# (bar, text, pos, size, bars): pos is where the NOTE box sits on the sheet (empty sky), never the bottom
LINES = [
    (0, "1943 年。轰炸机飞出去，不是每一架都能回来。", "top", 40, 1),
    (1, "回来一架，地勤就把它身上的弹孔，一个个画下来。", "top", 40, 1),
    (2, "机翼、机身、尾翼，全是洞。", "top", 40, 1),
    (3, "每一个洞，都是一次{活了下来}。", "top", 40, 1),
    (4, "于是大家想：哪里洞多，就把哪里加厚。", "top", 40, 1),
    (5, "一个叫 Wald 的统计学家，盯着图上{空着}的地方。", "top", 40, 1),
    (6, "发动机上，几乎没有洞。", "top", 40, 1),
    (7, "不是那里没挨打。是挨了那里的人，[再也没回来]。", "top", 40, 1),
]

ZONES = ["机翼", "机身", "尾翼", "发动机"]
HITS = [("sheet", 0, 0), ("cline", 0, 1), ("header", 0, 2), ("land", 0, 3)]
HITS += [("draw", 1, b) for b in range(4)]                               # fuselage, wings, engines, tail
HITS += [("hole", 2, b * 0.5) for b in range(8)]
HITS += [("hole", 3, b * 0.25) for b in range(12)] + [("count", 3, 3), ("count", 3, 3.5)]
HITS += [("armor", 4, b) for b in range(4)]                              # wing L, wing R, fuselage, tail
HITS += [("cloud", 5, 0), ("cloud", 5, 1), ("name", 5, 2), ("pen", 5, 3)]
HITS += [("zero", 6, b) for b in range(4)]                               # one balloon per engine: 0
HITS += [("ghost", 7, b) for b in range(4)]                              # the planes that did not come back
HITS += [("title", 8, 0)] + [("char", 8, i * 0.25) for i in range(len(TITLE))] + [("stamp", 8, 2)]
HITS += [("rearmor", 9, 0), ("rearmor", 9, 1), ("rearmor", 9, 2), ("rearmor", 9, 3)]

SCENE_CUTS = [8]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    out = []
    for bar, text, pos, size, n in LINES:
        out.append((bar * BAR + 0.12, (bar + n) * BAR - 0.3, text, pos, size))
    return out
