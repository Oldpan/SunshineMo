"""Shared timing for music.py and render.py: tempo, sections, captions and scene changes.

One caption per bar (2.5 s at 96 BPM), like the reference films.  Marks: {warm} [cool] <red>.
Warm is you and the first word, cool is the other side and the waiting, red is the stuck circle.
"""
BPM = 96
BARS = 64
BAR = 240 / BPM

# The on-screen title is an image from the film (two phones, nobody sends); the textbook name sits small above it.
TITLE = "谁先开口"
TITLE_Q = "都在等对方，为什么谁也[等不到]？"
CONCEPT, CONCEPT_EN = "死锁", "DEADLOCK"

# (name, first bar, end bar): music sections and background looks
SECTIONS = [("intro", 0, 7), ("title", 7, 9), ("table", 9, 16), ("cycle", 16, 24), ("order", 24, 30),
            ("db", 30, 36), ("people", 36, 44), ("life", 44, 55), ("back", 55, 59), ("end", 59, 64)]

# (bar, text, pos, size, bars)
LINES = [
    (0, "晚上十一点，两部手机都亮着。", "bottom", 46, 1),
    (1, "左边是{你}，右边是[TA]。", "bottom", 46, 1),
    (2, "吵完架，已经<三天>了。", "bottom", 46, 1),
    (3, "你打了一行字，又一个字一个字删掉。", "bottom", 46, 1),
    (4, "对面，「对方正在输入…」亮了一下，又灭了。", "bottom", 44, 1),
    (5, "你们都在等，等对方[先开口]。", "bottom", 46, 1),
    (6, "这一等，怎么就等成了永远？", "bottom", 50, 1),
    (9, "1965 年，迪杰斯特拉出了一道考题。", "bottom", 46, 1),
    (10, "后来它变成了：五个哲学家，一张圆桌。", "bottom", 46, 1),
    (11, "每两人之间，只放{一根}筷子。", "bottom", 46, 1),
    (12, "吃饭要两根。每个人，先拿起[左手边]那根。", "bottom", 44, 1),
    (13, "再等右手边那根。可它，在邻居手里。", "bottom", 46, 1),
    (14, "五个人，五根筷子，每人攥着一根。", "bottom", 46, 1),
    (15, "谁都不肯放下，所以谁也<吃不上>。", "bottom", 46, 1),
    (16, "这在计算机里，叫<死锁>。", "bottom", 50, 1),
    (17, "没有人是坏人。每一步，都合情合理。", "bottom", 46, 1),
    (18, "1971 年，科夫曼等人给出了四个条件：", "bottom", 46, 1),
    (19, "一，东西只能一个人拿着；", "bottom", 46, 1),
    (20, "二，拿着的不放，还要等别的；", "bottom", 46, 1),
    (21, "三，谁也不能从别人手里抢；", "bottom", 46, 1),
    (22, "四，你等我，我等他，绕成一个<圈>。", "bottom", 46, 1),
    (23, "四条都在，就卡死；拆掉{一条}，就解开。", "bottom", 46, 1),
    (24, "教科书里，有个简单得像废话的解法：", "bottom", 46, 1),
    (25, "给筷子编上号，每人先拿{号码小}的那根。", "bottom", 46, 1),
    (26, "最后那个人，于是先伸向了[另一边]。", "bottom", 46, 1),
    (27, "圈，断开了一个口。", "bottom", 50, 1),
    (28, "有人吃上了。吃完放下，下一个也吃上了。", "bottom", 46, 1),
    (29, "解开死锁，不需要谁赢，只要有人{换个方向}。", "bottom", 44, 1),
    (30, "今天的数据库，每天都在处理这种卡死。", "bottom", 46, 1),
    (31, "它默认每 5 秒查一次：有没有人绕成了圈。", "bottom", 46, 1),
    (32, "一旦发现，就挑一个出来，让它[先退一步]。", "bottom", 44, 1),
    (33, "挑谁？挑那个退一步{代价最小}的。", "bottom", 46, 1),
    (34, "它被叫作「牺牲者」，退回去，过一会儿重来。", "bottom", 44, 1),
    (35, "退一步的那个没有输。整个系统，又动了起来。", "bottom", 44, 1),
    (36, "可人和人之间，没有这样一个程序。", "bottom", 50, 1),
    (37, "2022 年，心理学家 Peggy Liu 的团队，", "bottom", 46, 1),
    (38, "让人给一个很久没联系的朋友，发一句问候。", "bottom", 44, 1),
    (39, "发之前，先猜：对方会有多开心？", "bottom", 46, 1),
    (40, "结果，收到的人，比发的人以为的[更开心]。", "bottom", 44, 1),
    (41, "越是没想到，越是被珍惜。", "bottom", 46, 1),
    (42, "我们总觉得，先开口，就是<认输>。", "bottom", 46, 1),
    (43, "可在对方那里，那句话比你想的{更重}。", "bottom", 46, 1),
    (44, "你的生活里，大概也有几个这样的圈。", "bottom", 46, 1),
    (45, "和老朋友，都等着对方先约。", "bottom", 46, 1),
    (46, "和爸妈吵完架，谁也不先打那个电话。", "bottom", 46, 1),
    (47, "工作群里那件事，都等着别人先接。", "bottom", 46, 1),
    (48, "每个人都攥着一根筷子，", "bottom", 46, 1),
    (49, "都在等，也都觉得，自己没错。", "bottom", 46, 1),
    (50, "{先开口}的，不是输了。", "center", 64, 1),
    (51, "是先[看见]了那个圈。", "center", 64, 1),
    (52, "死锁里没有坏人，只有一个没人打破的圈。", "bottom", 46, 1),
    (53, "而打破它，只需要其中{一个人}。", "bottom", 46, 2),
    (55, "晚上十一点，两部手机都还亮着。", "bottom", 46, 1),
    (56, "你又打了那一行字。", "bottom", 46, 1),
    (57, "这一次，你按下了{发送}。", "bottom", 46, 1),
    (58, "对面，「对方正在输入…」[亮了起来]。", "bottom", 46, 1),
    (59, "[等]，要两个人。\n{开口}，一个人就够。", "center", 66, 2),
]


def captions():
    """(t0, t1, text, pos, size) in seconds; line 2 of a two-line caption starts a bar later."""
    out = []
    for bar, text, pos, size, n in LINES:
        out.append((bar * BAR + 0.12, (bar + n) * BAR - 0.3, text, pos, size, BAR if "\n" in text else 0.0))
    return out


# bars that change scene: a whoosh peaks on each
SCENE_CUTS = [7, 9, 16, 18, 24, 30, 36, 44, 50, 52, 55, 59, 61]
# bars with a message sent (a soft "pop") and a typing indicator (a tick run)
SEND_BARS = [38, 57]
TYPING = [(4, 0.5, 2.0), (58, 1.0, 4.0)]   # (bar, first beat, last beat)
