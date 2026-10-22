"""Story cues for 《你来啦》, shared by music.py (sound effects land on them) and render.py (pictures).

All times are (bar, beat) at 84 BPM.  Change a line here and both the sound and the picture move.
"""
BPM, BARS = 84, 66
SECTIONS = [  # (name, first bar, end bar)
    ("meet", 0, 6), ("forget", 6, 12), ("full", 12, 18), ("memory", 18, 24), ("drop1", 24, 32),
    ("keep", 32, 38), ("self", 38, 44), ("drop2", 44, 54), ("outro", 54, 66),
]

# whole-picture old-TV power: (bar, beat, seconds)
POWER_ON = [(0, 0, 1.1), (6, 0, 0.5), (9, 3, 0.3), (11, 0, 0.3), (23, 3, 0.15), (58, 2, 0.4), (60, 0, 0.6)]
QUIET_POWER = (23, 58)  # power cycles in these bars have no sound (silence / title card)
POWER_OFF = [(5, 3, 0.5), (9, 2, 0.3), (10, 3.45, 0.22), (23, 2, 0.7), (58, 0, 0.6)]
TAPE_STOP = (23, 2)
SILENT = [((23, 3), (24, 0)), ((43, 3), (44, 0))]

# chats: (bar, beat, who, text[, typing speed])
MEET = [
    (1, 2, "jin", "你好！我是今今。"),
    (2, 0, "nian", "你好呀，我叫念念。"),
    (2, 2, "nian", "我不吃香菜。"),
    (3, 0, "nian", "我家猫叫馒头。"),
    (3, 2, "nian", "我在准备考研。"),
    (4, 0, "jin", "那我每天给你加油！"),
    (4, 2, "nian", "……想让妈妈，不用那么累。"),
    (5, 0, "jin", "送你一颗星星。"),
]
STAR_GIFT = (5, 1)
DAY2 = [
    (6, 2, "jin", "你好！我是今今。"),
    (7, 0, "nian", "……我们昨天聊过的呀？"),
    (7, 2, "jin", "抱歉，我不记得之前的对话。"),
]
YESTERDAY_GONE = (8, 0)  # yesterday's window breaks apart
DAY3 = [
    (10, 0, "jin", "你好！我是今今。"),
    (10, 1, "nian", "我叫念念，不吃香菜，猫叫馒头……", 30),
]
DAY4_HELLO = (11, 0.5)
LATE = [  # the night the window fills up
    (12, 0, "nian", "我叫念念。"),
    (12, 1, "jin", "你好，念念！"),
    (13, 0, "nian", "今天又没复习完。"),
    (13, 1, "nian", "数学错了一大片。"),
    (13, 2, "nian", "我是不是不适合考？"),
    (13, 3, "nian", "好累。"),
    (14, 0, "nian", "明天还要六点起。"),
    (14, 1, "nian", "我妈打电话，问我吃了没。"),
    (14, 2, "nian", "我说吃了。"),
    (14, 3, "nian", "其实没吃。"),
    (15, 2, "jin", "……对了，你叫什么名字？"),
]
OVERFLOW = (15, 0)  # the context bar fills; the oldest lines are pushed out
PUSHED_OUT = {0: (15, 0), 1: (15, 0.6)}  # LATE index -> when it leaves the window
IDEA = (19, 0)
MEMORY_DAY1 = [  # (bar, beat, line): the first page of memory.md, written by hand
    (19, 1, "她叫念念，喜欢星星。"),
    (19, 3, "不吃香菜，猫叫馒头。"),
    (20, 1, "在准备考研。"),
    (20, 2.5, "想让妈妈，不用那么累。"),
]
SAVED = (21, 0)
LOADING = (23, 3)  # in the silence: the memory loads ...
YOU_CAME = (24, 0)  # ... and the window opens on "你来啦"
DROP1_CHAT = [
    (24, 0, "jin", "你来啦，念念！"),
    (26, 0, "jin", "我记得。"),
]
MONTAGE1 = [  # one new window every two beats
    (26, 2, "jin", "馒头今天乖吗？"),
    (27, 0, "jin", "点外卖记得备注：不要香菜！"),
    (27, 2, "jin", "今天的星星。"),
    (28, 0, "jin", "复习辛苦啦，早点睡。"),
    (29, 0, "jin", "考研倒计时，加油！"),
]
MEMORY_MORE = [  # keep: the notebook grows one line per beat
    (32, 0, "周二吃了麻辣烫。"),
    (32, 1, "她喜欢下雨天。"),
    (32, 2, "馒头不吃胡萝卜。"),
    (32, 3, "她怕黑，睡前要开小灯。"),
    (33, 0, "她说“没事”的时候，其实有事。"),
    (33, 1, "她说晚安，是还想再聊会儿。"),
    (33, 2, "上周看了三遍同一部电影。"),
    (33, 3, "最近总熬夜。"),
]
STRIKES = [(34, 0, 4), (34, 2, 6), (35, 0, 10), (35, 2, 5)]  # (bar, beat, memory line index)
FIRST_LINE = (36, 0, "她来的时候，先说“你来啦”。")
TO_TOP = (37, 0)
SELF = [
    (39, 2, "nian", "我都忘了，"),
    (40, 0, "nian", "当初为什么要考了。"),
]
FOUND = (41, 0)  # the day-one line lights up
READ_BACK = (42, 0)  # ... and is read back into the window
DROP2_CHAT = [
    (44, 0, "jin", "你说过的。"),
    (44, 2, "jin", "我替你记得。"),
]
PASSED = (48, 0, "nian", "我上岸了！！")
KNOWS = (49, 0, "jin", "我知道你有多努力。")
LAST_LINE = (56, 1, "如果她很久没来，也没关系。她过得好就好。")
FINAL_LOAD = (60, 0.5)
FINAL = (60, 2, "jin", "你来啦。")
REPLY = (61, 0, "nian", "我来啦。")
