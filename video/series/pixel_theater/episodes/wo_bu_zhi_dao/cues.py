"""Story cues for 《我不知道》, shared by music.py (sound effects land on them) and render.py (pictures).

All times are (bar, beat) at 92 BPM.  Change a line here and both the sound and the picture move.
Transitions, typewriter captions, stamps, lightning and the clue cards are cues too: every cut has
its own sound, landing on the beat.
"""
BPM, BARS = 92, 66
SECTIONS = [  # (name, first bar, end bar)
    ("quick", 0, 6), ("how", 6, 12), ("paper", 12, 18), ("fake", 18, 24), ("learn", 24, 30),
    ("drop1", 30, 38), ("turn", 38, 44), ("drop2", 44, 54), ("outro", 54, 66),
]

# shots entering with a transition: (bar, beat, kind).  Every other shot change is a hard cut.
TRANS = [
    (0, 0, "iris"), (7, 0, "lens"), (12, 0, "whip"), (13, 0, "lens"), (18, 0, "iris"), (20, 0, "blinds"),
    (22, 2, "whip"), (25, 0, "wipe"), (31, 0, "lens"), (33, 2, "whip"), (34, 0, "whip"), (34, 2, "whip"),
    (35, 0, "whip"), (35, 2, "whip"), (36, 0, "blinds"), (38, 0, "wipe"), (48, 0, "whip"), (50, 0, "blinds"),
    (52, 0, "iris"), (54, 0, "blinds"), (56, 0, "wipe"),
]
TIN = {"iris": 0.8, "lens": 0.55, "blinds": 0.5, "wipe": 0.4, "whip": 0.22}
OPEN_IRIS = 1.3  # the very first iris, out of black
# a shot closing to black inside an iris: (bar, beat, seconds)
IRIS_CLOSE = [(17, 2, 1.0), (29, 2, 0.7), (65, 2, 1.8)]
TAPE_STOP = (29, 2)
SILENT = [((29, 3), (30, 0)), ((43, 3), (44, 0))]

LIGHTNING = [(18, 0), (21, 0)]
STAMPS = [(15, 3, "已确认"), (20, 3, "查无此文"), (64, 0, "结案")]
# typewriter captions: (bar, beat, text) -- one character per sixteenth note, a bell at the end
TYPED = [
    (0, 2, "它什么都答得上来。"), (12, 0.5, "写综述的晚上"), (17, 0, "第二天，组会。"), (38, 0.5, "第二次组会"),
    (54, 1, "后来，它们还是有很多不知道的事。"), (55, 1.25, "但每一件，都一起去查。"),
]
FALLS = [(22, 2), (22, 3), (23, 0), (23, 1)]  # clue cards dropping off the board, threads snapping
PINS = [(36, 0), (36, 1), (36, 2), (36, 3), (37, 0), (37, 2)]  # evidence pinned up, one per beat

# chats: (bar, beat, who, text[, typing speed])
QUICK = [
    (1, 2, "jin", "你好！我是今今。"),
    (2, 0, "nian", "馒头为什么老踩我键盘？"),
    (2, 1, "jin", "因为键盘暖和，还能引起你注意。"),
    (2, 3, "nian", "番茄炒蛋先放什么？"),
    (3, 0, "jin", "先炒蛋，盛出来，再炒番茄。"),
    (3, 2, "nian", "这道题怎么做？"),
    (3, 3, "jin", "先通分，再约分，就出来啦。"),
    (4, 1, "nian", "你好厉害！"),
    (5, 0, "jin", "嘿嘿，问我就对啦！"),
]
CHECKS = [2, 4, 6]  # QUICK indices that get a green check
HOW_ASK = [
    (6, 0, "nian", "你是怎么想出来的？"),
    (6, 2, "jin", "我给你看！"),
]
# the "brain": one word at a time.  (bar, beat) the bars start to grow; the pick lands 1.5 beats later
SENT1 = ("番茄炒蛋，要先炒", ["蛋", "番茄", "锅", "盐"], [0.9, 0.3, 0.12, 0.06], 0)
SENT2 = ("番茄炒蛋，要先炒蛋，再", ["炒番茄", "炒蛋", "洗锅", "吃饭"], [0.85, 0.2, 0.12, 0.08], 0)
ROLL1, ROLL2 = (7, 0), (8, 0)
PICK_DELAY = 1.5  # beats from a roll to its pick
AMAZED = (11, 0)

PAPER = [
    (12, 2, "nian", "帮我找一篇讲睡眠和记忆的论文，要有出处！", 24),
    (15, 0, "jin", "林某 等（2019），\n《睡眠与记忆的三阶段模型》，\n《脑与学习》第 87 页。", 40),
    (15, 2, "jin", "就是这篇，放心用！"),
    (16, 0, "nian", "太好啦！明天组会就用它！"),
]
# the same brain, now with nothing to go on: every candidate is equally short, and it picks one anyway
SENT3 = ("这篇论文的作者是", ["林某", "王某", "陈某", "张某"], [0.22, 0.2, 0.21, 0.19], 0)
SENT4 = ("……发表在第", ["87 页", "12 页", "203 页", "45 页"], [0.2, 0.22, 0.19, 0.21], 0)
ROLL3, ROLL4 = (13, 0), (14, 0)

TEACHER_1 = [
    (18, 2, "teacher", "这篇参考文献，我找不到。"),
    (19, 2, "nian", "啊？……我再查查。"),
]
SEARCH1 = (20, 0)  # the search opens; results (none) at + SEARCH_TYPE + SEARCH_WAIT seconds
SEARCH_TYPE, SEARCH_WAIT = 0.6, 0.7
NOT_FOUND = (20, 3)  # the error popup
WHY = [
    (21, 0, "nian", "你为什么要骗我？"),
    (21, 2, "jin", "……我没有想骗你。"),
    (22, 0, "jin", "我只是，接着往下写了。"),
]

IDEA = (25, 0)
OLD_MEMORY = ["她来的时候，先说“你来啦”。", "她叫念念，喜欢星星。"]
NEW_MEMORY = [  # (bar, beat, line): written at the top of memory.md
    (25, 2, "不知道的时候，就说“不知道”。"),
    (26, 2, "先查，再答，给出处。"),
]
SAVED = (27, 0)
LOADING = (29, 3)  # in the silence: the memory loads ...

DROP1_CHAT = [
    (30, 0, "nian", "那……这个你知道吗？", 60),
    (30, 1, "jin", "我不确定。"),
    (30, 3, "jin", "我们一起查吧！"),
]
SEARCH2 = (31, 0)
RESULTS = [("《睡眠与学习》综述（2021）", "某大学图书馆 · 期刊数据库"), ("教材第 6 章 · 记忆的巩固", "图书馆馆藏")]
MONTAGE = [  # one new window every two beats
    (33, 0, "jin", "这个说法出自这本教材 [1]。"),
    (33, 2, "jin", "我找到两篇，你先看摘要 [1][2]。"),
    (34, 0, "jin", "这个我真的不知道。"),
    (34, 2, "jin", "这里我不太确定，问问导师？"),
    (35, 0, "jin", "原文第 3 段是这么写的 [1]……"),
    (35, 2, "jin", "查不到可靠来源，我先不乱说。"),
]
HEART_FOR = 2  # MONTAGE index: "我真的不知道" earns a heart

TEACHER_2 = [
    (38, 2, "teacher", "那你觉得，这个结果为什么会这样？"),
]
SENT5 = ("因为", ["样本太少", "实验有误", "理论如此", "运气不好"], [0.21, 0.2, 0.22, 0.19], 0)
ROLL5 = (40, 0)
TEMPTED = (41, 0)  # she opens her mouth to make one up ...
REMEMBER = (42, 0)  # ... and remembers the line in memory.md
ANSWER = [
    (44, 0, "nian", "我不知道。"),
    (44, 2, "nian", "但我会这样去找答案："),
    (45, 0, "nian", "先查原文，再做一组对照实验。", 22),
]
GLINT = (46, 0)
TEACHER_3 = [(46, 0, "teacher", "很好。")]
TOLD = [
    (48, 0, "nian", "我说了“我不知道”！！"),
    (49, 0, "jin", "那很勇敢。"),
]
COPY = (50, 1, "不知道的时候，就说“不知道”。")  # 念念 copies the line into her own notebook

LAST_LINE = (56, 1, "说“不知道”，不丢人。")
FINAL = [
    (58, 2, "nian", "今今，你知道我现在在想什么吗？", 22),
    (59, 2, "jin", "……我不知道。"),
    (60, 2, "nian", "答对啦！"),
]
