"""787 人猜牛 (群体智慧): one timing table for music.py, render.py and check_hits.py.

Beat-locked: every visual hit is listed once in HITS as (name, bar, beat); music.py puts a sound on it, render.py
animates on it, check_hits.py proves both land on the same video frame.
Series rules: no true silences, no held frames (design time), a hit on almost every beat; copy feeling-first with
one light AI mapping (ensemble learning), facts verifiable.
Acts (100 BPM, one bar = 2.4 s, 55 bars = 132 s):
  0-8    cold open   the fair, the ox, the slips, the misses, Galton's box, the histogram, the middle slip, the scale
  8-10   title
  10-18  FIG. 1      why it works: guess = truth + error; errors cancel; only if everyone guesses alone
  18-26  FIG. 2      when it breaks: Lorenz et al. (ETH Zurich, 2011), seeing the others narrows the guesses,
                     the average gets no better, confidence goes up
  26-34  FIG. 3      AI: self-consistency (Wang et al., Google, 2022): 40 samples, majority vote, GSM8K 56.5 -> 74.4
  34-42  FIG. 4      you: the first voice in a meeting; write it down first; the crowd within (Vul & Pashler 2008)
  42-46  back to Plymouth: every slip wrong, together they point at the ox
  46-50  closing lines
  50-55  end title, references

Facts (checked 2026-10-28): F. Galton, "Vox Populi", Nature 75, 450-451 (1907): the weight-judging competition at
the West of England Fat Stock and Poultry Exhibition, Plymouth, 1906; sixpenny tickets; 787 usable guesses of the
ox's dressed weight; the middlemost estimate 1207 lb, the dressed weight 1198 lb (0.8 % off).  Galton was 84.
(A later reading of his worksheets puts the median at 1208 lb; we quote the published figures.)
Lorenz, Rauhut, Schweitzer & Helbing, "How social influence can undermine the wisdom of crowd effect", PNAS 108
(2011): 144 ETH Zurich students, six Swiss questions (e.g. murders registered in 2006), paid for accuracy, five
rounds; seeing others' estimates narrowed the spread without improving the average; "the confidence effect boosts
individuals' confidence after convergence of their estimates despite lack of improved accuracy."
Wang et al., "Self-Consistency Improves Chain of Thought Reasoning in Language Models" (arXiv 2203.11171, ICLR 2023,
Google Research): sample many reasoning paths, take the most common answer; PaLM-540B on GSM8K 56.5 % -> 74.4 %
(40 samples).  Vul & Pashler, "Measuring the Crowd Within", Psychological Science 19 (2008): the average of two
guesses by the same person beats the first; the gain is larger when the second guess comes three weeks later.
"""
BPM = 100
BAR = 240 / BPM
BEAT = 60 / BPM
BARS = 55

TITLE = "787 人猜牛"
TITLE_Q = "一个人猜不准，787 个人为什么就准了？"
CONCEPT, CONCEPT_EN = "群体智慧", "WISDOM OF CROWDS"

SECTIONS = [("fair", 0, 1), ("ox", 1, 2), ("crowd", 2, 3), ("guess", 3, 4), ("galton", 4, 5), ("sort", 5, 6),
            ("median", 6, 7), ("scale", 7, 8), ("title", 8, 10), ("eq", 10, 11), ("line", 11, 13),
            ("dots", 13, 14), ("middle", 14, 15), ("booths", 15, 17), ("spread", 17, 18), ("zurich", 18, 20),
            ("split", 20, 24), ("copy", 24, 25), ("law2", 25, 26), ("machine", 26, 29), ("vote", 29, 30),
            ("sc", 30, 32), ("paths", 32, 34), ("meeting", 34, 37), ("write", 37, 38), ("twin", 38, 42),
            ("field", 42, 46), ("gold", 46, 50), ("end", 50, 55)]

# (bar, caption, bars); {word} = highlight colour.
LINES = [
    (0, "1906 年，英国普利茅斯，一年一度的牲畜展。", 1),
    (1, "场上牵来一头大肥牛。六便士一张票：{猜它宰好后有多重}。", 1),
    (2, "屠夫、农夫、店员、太太们……几百个人，各写一张纸条。", 1),
    (3, "有人猜得太重，有人猜得太轻，{几乎没人猜中}。", 1),
    (4, "一位 84 岁的统计学家，把 787 张纸条要了过来。", 1),
    (5, "他把纸条从轻到重，一张张排开。", 1),
    (6, "正中间那张，写着 1207 磅。", 1),
    (7, "牛的实际重量：1198 磅。只差{不到 1%}。", 1),
    (10, "每一张纸条，都是真相，加上一点{偏差}。", 1),
    (11, "有人看骨架，猜轻了；有人看膘，猜重了。", 1),
    (12, "偏重的和偏轻的，{互相抵消}。", 1),
    (13, "人越多，抵消得越干净。", 1),
    (14, "没有一个人知道答案。答案在{他们中间}。", 1),
    (15, "但有一个条件：每个人{自己猜}。", 1),
    (16, "不商量，不偷看别人的纸条。", 1),
    (17, "错得各不相同，才能互相抵消。", 1),
    (18, "2011 年，苏黎世。144 个大学生，参加一场估算实验。", 1),
    (19, "题目比如：瑞士 2006 年，登记了几起谋杀案？", 1),
    (20, "一组各猜各的；另一组，每轮都能看见{别人的答案}。", 1),
    (21, "一共猜五轮。看过别人的那组，答案越靠越近。", 1),
    (22, "可他们的平均值，{并没有更准}。", 1),
    (23, "只有一样东西涨了：{信心}。", 1),
    (24, "787 张纸条，变成了一张，抄了 787 遍。", 1),
    (25, "人多不等于聪明。聪明的，是{各不相同}。", 1),
    (26, "AI 也在用这一招。", 1),
    (27, "一道小学数学应用题，让同一个模型{做 40 遍}。", 1),
    (28, "每一遍的推理都不太一样，有几遍会算错。", 1),
    (29, "最后不挑最自信的那一遍，只数{哪个答案最多}。", 1),
    (30, "2022 年，谷歌的研究者管它叫{自洽性}。", 1),
    (31, "在小学数学题上，准确率从 56.5% 涨到 74.4%。", 1),
    (32, "前提还是那一条：每一遍，得{各走各的路}。", 1),
    (33, "要是每一遍都照抄第一遍，投 40 票，也只算一票。", 1),
    (34, "回到你身上。", 1),
    (35, "开会时，第一个开口的人，常常定下了调子。", 1),
    (36, "后面的人，越说越像他。", 1),
    (37, "试试先让每个人{写下来}，再开口。", 1),
    (38, "就算只有你一个人，也能把自己当成一群人。", 1),
    (39, "2008 年的一个实验：同一道题，让人{隔三周}再猜一次。", 1),
    (40, "两次的平均，常常比第一次更准。", 1),
    (41, "隔得越久，越像两个不同的人在猜。", 1),
    (42, "回到 1906 年的那片草地。", 1),
    (43, "787 张纸条，几乎每一张都是{错的}。", 1),
    (44, "可正是这些各不相同的错，一起指向了那头牛。", 1),
    (45, "1207 磅。离 1198，只差 9 磅。", 1),
]

GOLD = [(46, "你不必是最准的那个人，"), (47, "也不必和别人一样。"), (48, "只要你写下的，"),
        (49, "是你自己的那个数。")]

REFS = ["F. Galton, Vox Populi, Nature 75, 450-451, 1907.",
        "J. Lorenz, H. Rauhut, F. Schweitzer & D. Helbing, How social influence can undermine the wisdom of",
        "    crowd effect, PNAS 108, 9020-9025, 2011.",
        "X. Wang et al., Self-Consistency Improves Chain of Thought Reasoning in Language Models, ICLR 2023.",
        "E. Vul & H. Pashler, Measuring the Crowd Within, Psychological Science 19, 645-647, 2008.   图表为示意。"]

HITS = []
WIPES_ = [(7, 3, "block"), (17, 3, "block"), (25, 3, "iris"), (33, 3, "block"), (41, 3, "iris"), (45, 3, "iris"),
          (49, 3, "block")]


def add(name, bar, beats):
    HITS.extend((name, bar, b) for b in beats)


Q4 = (0, 1, 2, 3)
E8 = tuple(b * 0.5 for b in range(8))
S16 = tuple(b * 0.25 for b in range(16))

add("flag", 0, E8)                                   # bunting pennants pop, one per eighth
add("hoof", 1, (0, 0.5, 1, 1.5, 2)); add("ticket", 1, (3,))
add("pop", 2, E8)                                    # eight people pop in, each with a slip
add("guess", 3, S16[:12]); add("miss", 3, (3, 3.5))
add("pour", 4, E8)                                   # slips pour into Galton's box
add("sort", 5, E8)                                   # the histogram builds, column by column
add("mid", 6, Q4)                                    # middle slip lifts, arrow, medallion, tag
add("scale", 7, (0, 1, 2)); add("burst", 7, (2.5,))
add("title", 8, (0,)); add("char", 8, S16[:6]); add("sub", 8, (2,)); add("tq", 8, (3,))
add("law", 9, (0,)); add("pulse", 9, (1, 2, 3))
# FIG. 1: why it works
add("fig", 10, (0,)); add("eq", 10, (1, 2, 3))      # guess = truth + error
add("land", 11, E8)                                  # slips land light / heavy on the number line
add("land", 12, (0, 0.5)); add("cancel", 12, (1, 2, 3))
add("dot", 13, S16)                                  # the dot plot fills, the running middle settles
add("pop", 14, E8[:7]); add("law", 14, (3.5,))       # the crowd; the answer glows between them
add("booth", 15, Q4)                                 # partitions drop between the guessers
add("peek", 16, (0, 1)); add("stamp", 16, (2,)); add("snapx", 16, (3,))
add("spread", 17, E8[:6])                            # error arrows fly out in different directions
# FIG. 2: when it breaks
add("fig", 18, (0,)); add("pop", 18, (1, 1.5, 2, 2.5, 3, 3.5))
add("chalk", 19, S16[:8]); add("coin", 19, (2, 2.5, 3))
add("split", 20, Q4)
add("round", 21, (0, 0.5, 1, 1.5, 2)); add("tick", 21, (2.5, 3, 3.5))
add("miss", 22, (0,)); add("arrowh", 22, (1, 2, 3))
add("meter", 23, E8)
add("copy", 24, S16[:12]); add("stamp", 24, (3,))
add("law", 25, (0,)); add("pulse", 25, (1, 2))
# FIG. 3: AI
add("fig", 26, (0,)); add("beep", 26, (1, 2, 3))
add("card", 27, S16)                                 # 40 answer cards spit out of the machine (16 shown)
add("path", 28, Q4)
add("sort", 29, S16[:8])                             # votes sort fast, the winner stamps by beat 2
add("type", 30, S16[:12]); add("stamp", 30, (3,))
add("grow", 31, (0, 1)); add("burst", 31, (2.5,))
add("path", 32, Q4)
add("copy", 33, E8[:6])
# FIG. 4: you
add("fig", 34, (0,)); add("pop", 34, (1, 1.5, 2, 2.5, 3))
add("talk", 35, (0, 2)); add("nod", 35, (1, 3))
add("nod", 36, E8)
add("write", 37, E8)
add("twin", 38, Q4)
add("page", 39, E8)                                  # calendar pages flip: three weeks
add("merge", 40, Q4)
add("glow", 41, Q4)
# back to Plymouth
add("flag", 42, E8)
add("xmark", 43, E8)
add("aim", 44, E8)
add("scale", 45, (0, 1, 2)); add("burst", 45, (2.5,))
# closing lines and end
for b in range(46, 50):
    add("gold", b, Q4)
add("title", 50, (0,)); add("char", 50, S16[:6]); add("sub", 50, (2,)); add("tq", 50, (3,))
add("law", 51, (0,)); add("pulse", 51, (1, 2, 3))
for b in range(52, 55):
    add("ref", b, Q4)

for b, bt_, _ in WIPES_:
    add("wipe", b, (bt_,))

SCENE_CUTS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14, 15, 17, 18, 20, 24, 25, 26, 29, 30, 32, 34, 37, 38, 42, 43,
              45, 46, 50]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    return [(bar * BAR + 0.1, (bar + n) * BAR - 0.2, text) for bar, text, n in LINES]
