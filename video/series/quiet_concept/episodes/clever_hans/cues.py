"""会算数的马 (过拟合): one timing table for music.py, render.py and check_hits.py.

This episode tries the beat-locked grammar (kinetic-reel's hits list, lemo-opuscar's cue map): every visual hit
is listed once in HITS as (name, bar, beat); music.py puts a sound on it, render.py animates on it, and
check_hits.py proves the two land on the same video frame.
Captions: {warm} [cool] <red>.  Warm is the answer the horse gives, cool is the questioner, red is the trick.
"""
BPM = 104
BAR = 240 / BPM
BEAT = 60 / BPM
BARS = 10            # cold-open test: bars 0-7 the horse, 8-9 the title

TITLE = "会算数的马"
TITLE_Q = "它答对了每一道题，却一道也[没算]。"
CONCEPT, CONCEPT_EN = "过拟合", "OVERFITTING"

SECTIONS = [("hook", 0, 2), ("count", 2, 4), ("quiz", 4, 5), ("panel", 5, 7), ("push", 7, 8), ("title", 8, 10)]

# (bar, text, pos, size, bars)
LINES = [
    (0, "1904 年，柏林。一匹马在做算术。", "bottom", 46, 2),
    (2, "2 加 3？它敲了{五下}，停住。", "bottom", 46, 2),
    (5, "一个 13 人的委员会来查它。", "bottom", 46, 1),
    (6, "结论：{没有作弊}。", "bottom", 50, 1),
    (7, "可它，真的会算数吗？", "bottom", 50, 1),
]

# fast quiz on bar 4: one card per beat, the answer on the following eighth
QUIZ = [("√16", "4"), ("12 ÷ 3", "4"), ("3 × 3", "9"), ("8 − 1", "7")]
COMMITTEE = 13

HITS = [("lamp", 0, 0), ("tag", 0, 2), ("card", 1, 0)]
HITS += [("tap", 2, b) for b in range(4)] + [("tap", 3, 0)]            # five taps, the fifth is the answer
HITS += [("cheer", 3, 3)]                                                 # after a beat and a half of silence
for k in range(4):
    HITS += [("card", 4, k), ("tick", 4, k + 0.25), ("answer", 4, k + 0.5)]
HITS += [("pop", 5, i * 0.25) for i in range(COMMITTEE)]
HITS += [("stamp", 6, 0)]
HITS += [("title", 8, 0)] + [("char", 8, i * 0.25) for i in range(len(TITLE))] + [("concept", 8, 2)]

# true silences (bar, beat from, beat to): the whole mix and the picture hold still
SILENCES = [(3, 1.0, 2.5), (7, 3.0, 4.0)]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    out = []
    for bar, text, pos, size, n in LINES:
        out.append((bar * BAR + 0.12, (bar + n) * BAR - 0.3, text, pos, size, BAR if "\n" in text else 0.0))
    return out
