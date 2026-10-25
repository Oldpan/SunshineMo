"""会算数的马 (过拟合): one timing table for music.py, render.py and check_hits.py.

This episode uses the beat-locked grammar (kinetic-reel's hits list, lemo-opuscar's cue map): every visual hit
is listed once in HITS as (name, bar, beat); music.py puts a sound on it, render.py animates on it, and
check_hits.py proves the two land on the same video frame.
Captions: {warm} [cool] <red>.  Warm is the answer and the real rule, cool is the questioner and new questions,
red is the shortcut and its failures.
"""
BPM = 104
BAR = 240 / BPM
BEAT = 60 / BPM
BARS = 68

TITLE = "会算数的马"
TITLE_Q = "它答对了每一道题，却一道也[没算]。"
CONCEPT, CONCEPT_EN = "过拟合", "OVERFITTING"

SECTIONS = [("hook", 0, 2), ("count", 2, 4), ("quiz", 4, 5), ("panel", 5, 7), ("push", 7, 8), ("title", 8, 10),
            ("pfungst", 10, 16), ("cue", 16, 22), ("overfit", 22, 30), ("ai", 30, 40), ("life", 40, 54),
            ("coda", 54, 56), ("back", 56, 62), ("final", 62, 64), ("end", 64, 68)]

# (bar, text, pos, size, bars)
LINES = [
    (0, "1904 年，柏林。一匹马在做算术。", "bottom", 46, 2),
    (2, "2 加 3？它敲了{五下}，停住。", "bottom", 46, 2),
    (5, "一个 13 人的委员会来查它。", "bottom", 46, 1),
    (6, "结论：{没有作弊}。", "bottom", 50, 1),
    (7, "可它，真的会算数吗？", "bottom", 50, 1),
    (10, "1907 年，Pfungst 换了个问法。", "bottom", 46, 1),
    (11, "提问的人，[自己也不知道]答案。", "bottom", 46, 1),
    (12, "马就一直敲，<停不下来>。", "bottom", 46, 1),
    (13, "或者，给它戴上眼罩。", "bottom", 46, 1),
    (14, "看得见提问的人：答对{89%}。", "bottom", 46, 1),
    (15, "看不见：只剩<6%>。", "bottom", 46, 1),
    (16, "它没在算数。", "bottom", 54, 1),
    (17, "它在看[人的脸]。", "bottom", 54, 1),
    (18, "数到答案时，提问的人会不自觉地，[微微抬一下头]。", "bottom", 44, 2),
    (20, "汉斯学会的，是这个抬头。", "bottom", 46, 1),
    (21, "线索对了，题却一道也没学会。", "bottom", 46, 1),
    (22, "在机器学习里，这叫{过拟合}。", "bottom", 46, 1),
    (23, "给模型一堆练习题。", "bottom", 46, 1),
    (24, "好的模型，学背后的{规律}。", "bottom", 46, 1),
    (25, "过拟合的模型，把每道题都<背下来>。", "bottom", 46, 1),
    (26, "练习题：100 分。", "bottom", 50, 1),
    (27, "换一批[新题]——", "bottom", 50, 1),
    (28, "就<错了一大片>。", "bottom", 50, 1),
    (29, "它背下的是题，不是规律。", "bottom", 46, 1),
    (30, "2019 年，研究者检查了一个认图的 AI。", "bottom", 44, 1),
    (31, "它认马，认得很准。", "bottom", 46, 1),
    (32, "可它盯着的，是图片的<角落>。", "bottom", 46, 1),
    (33, "那里有一行<版权水印>。", "bottom", 46, 1),
    (34, "把同样的水印，贴到一辆汽车上——", "bottom", 46, 1),
    (35, "它说：这是<马>。", "bottom", 54, 1),
    (36, "一百多年过去，同一个错误，换了一匹马。", "bottom", 46, 2),
    (38, "答案是对的，理由是错的。", "bottom", 46, 1),
    (39, "近路，只在[见过的题]上管用。", "bottom", 46, 1),
    (40, "你身上，大概也住着一匹汉斯。", "bottom", 46, 1),
    (41, "背熟了答案，换个问法就不会。", "bottom", 46, 1),
    (42, "划的重点，刚好全考了——", "bottom", 46, 1),
    (43, "你以为，自己会了。", "bottom", 50, 1),
    (44, "一次失恋，就认定「所有人都一样」。", "bottom", 46, 1),
    (45, "只见过三个点，就画出了一整条线。", "bottom", 46, 1),
    (46, "我们看到的，常常只是几道练习题。", "bottom", 46, 1),
    (47, "大脑也爱找，最省力的那条<近路>。", "bottom", 46, 1),
    (48, "AI 的防法，有两个：", "bottom", 50, 1),
    (49, "留一批它[没见过]的题，专门用来考；", "bottom", 46, 1),
    (50, "再故意让它，{别记太细}。", "bottom", 46, 1),
    (51, "放到人身上——", "bottom", 50, 1),
    (52, "换个问法，再问自己一遍；", "bottom", 46, 1),
    (53, "多见几个，和你想的[不一样]的人。", "bottom", 46, 1),
    (54, "答对，不等于{会了}。", "center", 64, 1),
    (55, "能答对[没见过的题]，才算。", "center", 64, 1),
    (56, "回到那个舞台。汉斯又抬起了蹄子。", "bottom", 46, 1),
    (57, "这一次，提问的人[也不知道]答案。", "bottom", 46, 1),
    (58, "一下，两下，三下……", "bottom", 50, 1),
    (59, "它一直敲，等一个<不会来的>抬头。", "bottom", 46, 1),
    (60, "它不笨。它只是，聪明错了地方。", "bottom", 50, 2),
    (62, "它读懂了每一张{脸}，\n却没学会一道[题]。", "center", 64, 2),
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
# Pfungst
HITS += [("year", 10, 0), ("tag", 10, 2), ("card", 11, 0), ("tag", 11, 2)]
HITS += [("tap2", 12, b * 0.5) for b in range(8)]                         # it does not stop
HITS += [("blind", 13, 0), ("bar", 14, 0), ("num", 14, 1), ("bar", 15, 0), ("num", 15, 1)]
HITS += [("reveal", 16, 0), ("face", 17, 0)]
HITS += [("tap3", 18, b) for b in range(4)] + [("tap3", 19, 0), ("nod", 19, 0), ("cueline", 20, 0)]
# overfitting
HITS += [("slam", 22, 0)] + [("kchar", 22, i * 0.25) for i in range(3)]
N_TRAIN, N_TEST = 12, 8
HITS += [("dot", 23, i * 0.25) for i in range(N_TRAIN)]
HITS += [("draw", 24, 0)] + [("snap", 25, i * 0.25) for i in range(N_TRAIN)]
HITS += [("score", 26, 0)] + [("dot2", 27, i * 0.5) for i in range(N_TEST)] + [("miss", 28, 0), ("score", 28, 1)]
# the 2019 horse classifier
HITS += [("year", 30, 0), ("tag", 30, 2)] + [("frame", 31, i) for i in range(4)] + [("check", 31, i + 0.5)
                                                                                      for i in range(4)]
HITS += [("heat", 32, 0), ("zoom", 33, 0), ("num", 33, 2), ("frame", 34, 0), ("stick", 34, 2), ("verdict", 35, 0)]
HITS += [("split", 36, 0)]
# your own Hans
HITS += [("card", 41, 0), ("flip", 41, 2)] + [("check", 42, b) for b in (1, 2, 3)]
HITS += [("dot", 45, b * 0.5) for b in range(3)] + [("draw", 45, 2)]
HITS += [("split", 49, 0), ("smooth", 50, 0), ("card", 52, 0), ("pop", 53, 0), ("pop", 53, 0.5), ("pop", 53, 1),
         ("pop", 53, 1.5)]
HITS += [("slam", 54, 0), ("slam", 55, 0)]
# back on the stage
HITS += [("lamp", 56, 0), ("card", 57, 0)] + [("tap4", 58, b) for b in range(4)] + [("tap4", 59, b) for b in range(3)]
HITS += [("final", 62, 0), ("endcard", 64, 0)]

# true silences (bar, beat from, beat to): the whole mix and the picture hold still
SILENCES = [(3, 1.0, 2.5), (7, 3.0, 4.0), (15, 3.0, 4.0), (34, 3.0, 4.0), (59, 3.0, 5.0)]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    out = []
    for bar, text, pos, size, n in LINES:
        out.append((bar * BAR + 0.12, (bar + n) * BAR - 0.3, text, pos, size, BAR if "\n" in text else 0.0))
    return out


SCENE_CUTS = [10, 16, 22, 30, 36, 40, 44, 48, 54, 56, 62, 64]
