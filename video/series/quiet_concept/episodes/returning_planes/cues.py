"""回来的飞机 (幸存者偏差): one timing table for music.py, render.py and check_hits.py.

Beat-locked: every visual hit is listed once in HITS as (name, bar, beat); music.py puts a sound on it, render.py
animates on it, check_hits.py proves both land on the same video frame.
Design rules (series README): no true silences and no held frames anywhere; a hit on almost every beat.
Copy rule (user, 2026-10-27): feeling first, facts verifiable, one light AI mapping (user feedback), end on the viewer.

Acts (100 BPM, one bar = 2.4 s, 62 bars = 148.8 s):
  0-8    cold open   FIG. 1, the returning bomber, its holes, the intuitive armour, "where would you put it?"
  8-10   title
  10-25  mechanism   SRG 1943, Wald looks at the empty engines, expected hits, the planes that never came back,
                     the memo's own title, the filter diagram, the name of the bias
  25-31  FIG. 2      the bookshelf of success stories and the books nobody wrote
  31-40  FIG. 3      a product's feedback: the users who left say nothing, the model learns "everyone is happy"
  40-48  FIG. 4      you: the group chat, the feed, the friend who went quiet
  48-57  back to FIG. 1, the armour moves to the engines, the stamp, the closing lines
  57-62  end title, references, the lights go off and the lines glow
"""
BPM = 100
BAR = 240 / BPM
BEAT = 60 / BPM
BARS = 62

TITLE = "回来的飞机"
TITLE_Q = "洞最多的地方，真的最危险吗？"
CONCEPT, CONCEPT_EN = "幸存者偏差", "SURVIVORSHIP BIAS"

SECTIONS = [("open", 0, 4), ("armor", 4, 8), ("title", 8, 10), ("srg", 10, 15), ("ghosts", 15, 19),
            ("memo", 19, 21), ("filter", 21, 25), ("books", 25, 31), ("feedback", 31, 40), ("you", 40, 48),
            ("back", 48, 53), ("gold", 53, 57), ("end", 57, 62)]

# (bar, text, pos, size, bars): pos is where the NOTE box sits (empty sky at the top), never the bottom
LINES = [
    (0, "1943 年。轰炸机飞出去，不是每一架都能回来。", "top", 40, 1),
    (1, "回来一架，地勤就把它身上的弹孔，一个个画下来。", "top", 40, 1),
    (2, "机翼、机身、尾翼，全是洞。", "top", 40, 1),
    (3, "每一个洞，都是一次{活了下来}。", "top", 40, 1),
    (4, "于是大家想：哪里洞多，就把哪里加厚。", "top", 40, 1),
    (5, "可装甲很重。处处加厚，飞机就飞不动了。", "top", 40, 1),
    (6, "如果只能加一处，你会加在哪？", "top", 40, 2),
    (10, "1943 年，哥伦比亚大学的统计研究组，接手了这个问题。", "top", 40, 1),
    (11, "组里的 Wald，看的不是洞，是{没有洞}的地方。", "top", 40, 1),
    (12, "发动机上，几乎没有洞。", "top", 40, 1),
    (13, "可子弹不会挑地方。每个部位，本该挨得差不多。", "top", 40, 1),
    (14, "那些本该打在发动机上的洞，去哪了？", "top", 40, 1),
    (15, "在[没飞回来]的飞机上。", "top", 40, 1),
    (16, "挨了那几枪的人，再也没机会回来报告。", "top", 40, 1),
    (17, "洞多的地方，恰恰说明：打中了，也还能飞回来。", "top", 40, 1),
    (18, "该加固的，是{空着}的地方。", "top", 40, 1),
    (19, "他把这写进了一份报告，标题就说清了一切。", "top", 40, 2),
    (21, "你看到的，只是活下来的那一部分。", "top", 40, 1),
    (22, "没通过筛子的，连一条记录都没有。", "top", 40, 1),
    (23, "这就叫{幸存者偏差}：把通过筛子的样本，当成了全部。", "top", 40, 2),
    (25, "这张图，不止画了飞机。", "top", 40, 1),
    (26, "书店里，摆满了成功者的故事。", "top", 40, 1),
    (27, "他们说：我就是这么做的。", "top", 40, 1),
    (28, "同样这么做、却失败的人，很少有人写书。", "top", 40, 1),
    (29, "他们的经验，[没被印出来]。", "top", 40, 1),
    (30, "你学到的秘诀，可能只是幸存者的共同点。", "top", 40, 1),
    (31, "AI 也一样。模型只能从{留下来}的数据里学。", "top", 40, 1),
    (32, "一个产品上线，来了很多人。", "top", 40, 1),
    (33, "失望的人不写差评。他们只是[悄悄离开]。", "top", 40, 1),
    (34, "留下的人在反馈里写：很好用。", "top", 40, 1),
    (35, "模型从这些反馈里学到：大家都很满意。", "top", 40, 1),
    (36, "它听得见留下的人，听不见离开的人。", "top", 40, 1),
    (37, "离开，也是一种回答。只是没人记下来。", "top", 40, 1),
    (38, "所以好的做法，是去找那些{没飞回来}的飞机。", "top", 40, 2),
    (40, "回到你身上。", "top", 40, 1),
    (41, "群里还在说话的，总是那几个人。", "top", 40, 1),
    (42, "朋友圈里，大家都过得很好。", "top", 40, 1),
    (43, "过得不好的人，往往什么都没发。", "top", 40, 1),
    (44, "你听到的掌声，来自留下来的人。", "top", 40, 1),
    (45, "离开的人，很少回来告诉你为什么。", "top", 40, 1),
    (46, "那个很久没动静的朋友，也许不是过得好，只是不想说。", "top", 40, 1),
    (47, "沉默，[不等于没事]。", "top", 40, 1),
    (48, "回到 1943 年那张图。", "top", 40, 1),
    (49, "洞，是{活下来}的证明。", "top", 40, 1),
    (50, "没有洞的地方，才藏着答案。", "top", 40, 1),
    (51, "该加固的，是这里。", "top", 40, 1),
]

# the closing lines are lettered big on the sheet itself (render.gold), one per bar
GOLD = [(53, "你看到的每一个洞，"), (54, "都是幸存者带回来的。"), (55, "下次觉得「大家都这样」的时候，"),
        (56, "想想那些，没飞回来的飞机。")]

REFS = ["A. Wald, A Method of Estimating Plane Vulnerability Based on Damage of Survivors,",
        "Statistical Research Group, Columbia University, 1943 (reprinted CNA, 1980).",
        "M. Mangel & F. J. Samaniego, Abraham Wald's Work on Aircraft Survivability,",
        "JASA 79(386): 259-267, 1984.   弹孔分布与数字为示意图。"]

ZONES = ["机翼", "机身", "尾翼", "发动机"]

HITS = []


def add(name, bar, beats):
    HITS.extend((name, bar, b) for b in beats)


Q4 = (0, 1, 2, 3)
E8 = tuple(b * 0.5 for b in range(8))
S16 = tuple(b * 0.25 for b in range(16))

# cold open
add("sheet", 0, (0,)); add("cline", 0, (1,)); add("header", 0, (2,)); add("land", 0, (3,))
add("draw", 1, Q4)                                                    # fuselage, wings, engines, tail
add("hole", 2, E8)
add("hole", 3, S16[:12]); add("count", 3, (3, 3.5))
add("armor", 4, Q4)                                                   # wing L, wing R, fuselage, tail
add("load", 5, Q4)                                                    # the load gauge fills; the plane sinks
add("opt", 6, Q4)                                                     # balloons A B C D
add("pick", 7, (0, 1, 2)); add("q", 7, (3,))
# title
add("title", 8, (0,)); add("char", 8, S16[:5]); add("sub", 8, (2,)); add("tq", 8, (3,))
add("tick", 9, Q4)                                                    # hidden circles on the four engines
# mechanism
add("srg", 10, Q4)
add("cloud", 11, (0, 1)); add("name", 11, (2,)); add("pen", 11, (3,))
add("zero", 12, Q4)
add("exp", 13, S16)                                                   # where the bullets should have landed
add("miss", 14, Q4)
add("ghost", 15, Q4)
add("cross", 16, Q4)
add("ok", 17, Q4)
add("rearmor", 18, Q4)
add("memo", 19, Q4)
add("memo2", 20, Q4)
add("diag", 21, Q4)                                                   # ALL box, arrow, sieve, SEEN box
add("flow", 22, E8)
add("flow", 23, E8[:4]); add("lab", 23, (2, 3))
add("concept", 24, (0, 0.5, 1, 1.5, 2)); add("en", 24, (3,))
# FIG. 2 the bookshelf
add("fig", 25, Q4)
add("book", 26, Q4)
add("say", 27, Q4)
add("pbook", 28, E8)
add("pbook", 29, S16)
add("venn", 30, Q4)
# FIG. 3 feedback
add("fig", 31, Q4)
add("user", 32, E8)
add("leave", 33, Q4)
add("star", 34, E8)
add("learn", 35, Q4)
add("deaf", 36, Q4)
add("unrec", 37, Q4)
add("chk", 38, Q4)
add("find", 39, Q4)
# FIG. 4 you
add("fig", 40, Q4)
add("msg", 41, E8)
add("post", 42, Q4)
add("ppost", 43, Q4)
add("clap", 44, E8)
add("contact", 45, Q4)
add("friend", 46, Q4)
add("seen", 47, Q4)
# back to FIG. 1
add("fig", 48, Q4)
add("rehole", 49, E8)
add("empty", 50, Q4)
add("rearmor", 51, Q4)
add("stamp", 52, (0,)); add("status", 52, (2,)); add("settle", 52, (1, 3))
add("gold", 53, (0, 2)); add("gold", 54, (0, 2)); add("gold", 55, (0, 2)); add("gold", 56, (0, 2))
# end
add("end", 57, (0,)); add("echar", 57, S16[:5]); add("esub", 57, (2,)); add("eq", 57, (3,))
add("ref", 58, Q4)
add("sign", 59, (0, 2))
add("lights", 60, (0,)); add("glow", 60, (1, 2, 3)); add("glow", 61, (0, 1, 2))

SCENE_CUTS = [8, 10, 21, 25, 31, 40, 48, 53, 57]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    out = []
    for bar, text, pos, size, n in LINES:
        out.append((bar * BAR + 0.12, (bar + n) * BAR - 0.3, text, pos, size))
    return out
