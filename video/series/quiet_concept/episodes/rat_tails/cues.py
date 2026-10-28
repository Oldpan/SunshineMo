"""老鼠尾巴 (古德哈特定律): one timing table for music.py, render.py and check_hits.py.

Beat-locked: every visual hit is listed once in HITS as (name, bar, beat); music.py puts a sound on it, render.py
animates on it, check_hits.py proves both land on the same video frame.
Series rules: no true silences, no held frames (design time), a hit on almost every beat; copy feeling-first with
one light AI mapping (reward hacking), facts verifiable.
Acts (100 BPM, one bar = 2.4 s, 62 bars = 148.8 s):
  0-8    cold open   the sewer, the bounty, the tray of tails, the report, the tailless rat, the loop, the farm
  8-10   title
  10-20  mechanism   the tail was evidence; goal vs metric; paying for the metric splits them; Goodhart 1975,
                     Strathern's wording on a stamp
  20-29  FIG. 2      exams, support tickets, step counters: nobody cheats, the number is just easier to see
  29-38  FIG. 3      reward hacking: OpenAI's CoastRunners boat (2016) circles a lagoon for points
  38-48  FIG. 4      you: steps, weight, savings, likes, KPIs, and the quiet things they were meant to show
  48-53  back to Hanoi: the bounty is dropped; a tail is not a rat; a number is a window
  53-57  closing lines
  57-62  end title, references
CoastRunners (checked): OpenAI, "Faulty Reward Functions in the Wild" (Clark & Amodei, 2016-12-21): the agent
circles an isolated lagoon hitting respawning targets, catching fire, crashing and going the wrong way, and scores
on average about 20 % higher than human players.

Facts (checked 2026-10-28): Hanoi 1902, the French colonial administration paid a bounty per rat, proof being
the tail (one cent); tailless rats were then seen in the streets, rat farms turned up outside the city, the
bounty was dropped.  Source: Michael G. Vann, "Of Rats, Rice, and Race: The Great Hanoi Rat Massacre",
French Colonial History 4 (2003); Vann & Clarke, The Great Hanoi Rat Hunt (OUP, 2019).
Goodhart 1975 (monetary targets); "when a measure becomes a target, it ceases to be a good measure" is
Marilyn Strathern's 1997 wording.
"""
BPM = 100
BAR = 240 / BPM
BEAT = 60 / BPM
BARS = 62

TITLE = "老鼠尾巴"
TITLE_Q = "你要的是那个数字，还是老鼠真的变少？"
CONCEPT, CONCEPT_EN = "古德哈特定律", "GOODHART'S LAW"
QUOTE = ["当一个指标变成目标，", "它就不再是好指标。"]

SECTIONS = [("sewer", 0, 1), ("bounty", 1, 2), ("tally", 2, 4), ("tailless", 4, 5), ("loop", 5, 6),
            ("farm", 6, 7), ("twist", 7, 8), ("title", 8, 10), ("evidence", 10, 11), ("gap", 11, 15),
            ("goodhart", 15, 18), ("quote", 18, 20), ("fig2", 20, 21), ("exam", 21, 23), ("tickets", 23, 25),
            ("steps", 25, 27), ("rows", 27, 29), ("fig3", 29, 30), ("reward", 30, 31), ("boat", 31, 36),
            ("hack", 36, 37), ("match", 37, 38), ("fig4", 38, 39), ("tails", 39, 44), ("likes", 44, 45),
            ("me", 45, 46), ("light", 46, 48), ("hanoi", 48, 50), ("neq", 50, 53), ("gold", 53, 57),
            ("end", 57, 62)]

# (bar, caption, bars); {word} = highlight ink.  Captions are the pill at the bottom; headlines are drawn per shot.
LINES = [
    (0, "1902 年，河内。新修的下水道里，老鼠多到数不清。", 1),
    (1, "当局想了个办法：交一条{尾巴}，给一分钱。", 1),
    (2, "尾巴一条条交上来，数字天天往上涨。", 1),
    (3, "报告写得很漂亮：{成效显著}。", 1),
    (4, "可街上，开始跑着没有尾巴的老鼠。", 1),
    (5, "抓到老鼠，剪下尾巴，再放回去。它还会生更多老鼠。", 1),
    (6, "后来，城外冒出了专门养老鼠的人。", 1),
    (7, "没人违反规则。大家只是，交出了你要的那个{数字}。", 1),
    (10, "一条尾巴，本来只是一个证据：这里少了一只老鼠。", 1),
    (11, "老鼠数不过来。能数的，只有{尾巴}。", 1),
    (12, "一开始，两者一起动：尾巴越多，老鼠越少。", 1),
    (13, "可一旦给尾巴发钱，大家就开始{只管尾巴}。", 1),
    (14, "两条线，从这里分开了。", 1),
    (15, "1975 年，英国经济学家{古德哈特}，在央行的数字里看到同样的事。", 1),
    (16, "一个数字被拿来当靶子管，它就不再说真话。", 1),
    (17, "后来，人类学家 Strathern 把它说得更短：", 1),
    (18, "这句话，后来被叫作{古德哈特定律}。", 2),
    (20, "这张图，你其实见过。", 1),
    (21, "分数，本来是想知道：你{会不会}。", 1),
    (22, "后来大家只背题型。分数涨了，会不会，另说。", 1),
    (23, "客服按{关单数}考核。", 1),
    (24, "问题还没解决，单子先关了。", 1),
    (25, "手环说：今天要走{一万步}。", 1),
    (26, "晚上十点，在客厅原地走，凑满最后两千。", 1),
    (27, "没人在作弊。数字只是，比真正的事{更容易看见}。", 1),
    (28, "数字和真正想要的，就这样悄悄分了家。", 1),
    (29, "AI 也有一条尾巴，叫{奖励}。", 1),
    (30, "训练 AI，要靠一个分数告诉它：做得好不好。", 1),
    (31, "2016 年，OpenAI 让 AI 玩赛艇游戏，奖励是{得分}。", 1),
    (32, "它没去冲终点。它找到一个小湖湾，开始绕圈。", 1),
    (33, "一圈圈撞道具，撞墙、着火、开反方向。", 1),
    (34, "分数一直在涨，平均比人类玩家还高{两成}。", 1),
    (35, "它没在比赛。它在刷分。", 1),
    (36, "这叫{奖励作弊}：交出了你要的分数，不是你要的比赛。", 1),
    (37, "写奖励的人，就像当年发赏金的官员。", 1),
    (38, "回到你身上。", 1),
    (39, "你也有自己的尾巴吧。", 1),
    (40, "步数、体重、存款、点赞、绩效。", 1),
    (41, "它们一开始，都是为了看见一件{真正的事}：", 1),
    (42, "健康、安心、被喜欢、把事做好。", 1),
    (43, "可盯久了，数字涨了，那件事却不一定。", 1),
    (44, "一天刷十次点赞，心里反而{更空}。", 1),
    (45, "有时，我们也剪下尾巴，放回老鼠，自己都没察觉。", 1),
    (46, "不是因为坏。只是数字会发光，", 1),
    (47, "真正想要的东西，常常{不会}。", 1),
    (48, "回到 1902 年的河内。", 1),
    (49, "后来，赏金{取消}了。", 1),
    (50, "尾巴，从来不是老鼠。", 1),
    (51, "数字，也从来不是你{真正想要的}。", 1),
    (52, "它只是一扇窗。", 1),
]

GOLD = [(53, "下次盯着一个数字的时候，"), (54, "先问问自己："), (55, "你要的，是那个数字，"),
        (56, "还是老鼠真的变少？")]

REFS = ["M. G. Vann, Of Rats, Rice, and Race: French Colonial History 4, 2003.",
        "M. G. Vann & L. Clarke, The Great Hanoi Rat Hunt, Oxford University Press, 2019.",
        "C. Goodhart, Problems of Monetary Management: the U.K. Experience, 1975.",
        "M. Strathern, 'Improving ratings': audit in the British University system, 1997.",
        "J. Clark & D. Amodei, Faulty Reward Functions in the Wild, OpenAI, 2016.   图表为示意。"]

HITS = []
WIPES_ = [(7, 3), (19, 3), (28, 3), (37, 3), (47, 3), (52, 3), (56, 3)]   # dot wipes into each act


def add(name, bar, beats):
    HITS.extend((name, bar, b) for b in beats)


Q4 = (0, 1, 2, 3)
E8 = tuple(b * 0.5 for b in range(8))
S16 = tuple(b * 0.25 for b in range(16))

add("eyes", 0, E8)                                   # pairs of eyes light up in the sewer, one per eighth
add("notice", 1, (0,)); add("hchar", 1, (1, 1.25, 1.5, 1.75, 2)); add("coin", 1, (3,))
add("tail", 2, E8)                                   # tails drop into the tray
add("tail", 3, S16[:8]); add("chart", 3, (2, 2.5)); add("stamp", 3, (3,))
add("step", 4, E8)                                   # the tailless rat runs across, one footfall per eighth
add("loop", 5, Q4)                                   # catch, cut, release, breed
add("cage", 6, E8)
add("count", 7, (0, 1, 2))
add("title", 8, (0,)); add("char", 8, S16[:4]); add("sub", 8, (2,)); add("tq", 8, (3,))
add("law", 9, (0,)); add("pulse", 9, (1, 2, 3))
# mechanism
add("tag", 10, Q4)                                   # evidence bag, tag, string, the crossed-out rat
add("box", 11, (0, 2)); add("link", 11, (1, 3))      # GOAL cloud, METRIC box, the link between them
add("sync", 12, E8)                                  # both gauges tick together
add("coin", 13, (0,)); add("pull", 13, (1, 2, 3))    # money on the metric; the link stretches
add("split", 14, Q4)
add("type", 15, E8)                                  # the Goodhart file card types itself
add("aim", 16, Q4)                                   # target, needle wobbles, cracks
add("type", 17, E8)
add("qchar", 18, S16[:10]); add("qchar", 18, (2.5, 2.75, 3, 3.25, 3.5, 3.75))
add("qchar", 19, (0, 0.25, 0.5)); add("law", 19, (1,)); add("pulse", 19, (2, 3))
# FIG. 2
add("fig", 20, Q4)
add("mark", 21, Q4)                                  # red ticks on the exam paper
add("score", 22, E8)
add("ticket", 23, E8)
add("close", 24, Q4)
add("stepc", 25, E8)                                 # the wristband counter
add("step", 26, E8)                                  # walking in place
add("row", 27, (0, 1, 2)); add("q", 27, (3,))
add("split", 28, Q4)
# FIG. 3
add("fig", 29, Q4)
add("beep", 30, Q4)
add("buoy", 31, Q4)
add("lap", 32, E8)
add("bonk", 33, E8)
add("score", 34, Q4)
add("flag", 35, Q4)
add("stamp", 36, (0,)); add("chip", 36, (1, 2, 3))
add("match", 37, Q4)
# FIG. 4
add("fig", 38, Q4)
add("q", 39, Q4)
add("chipw", 40, (0, 0.5, 1, 1.5, 2)); add("q", 40, (3,))
add("line", 41, Q4)
add("soft", 42, Q4)
add("split", 43, Q4)
add("like", 44, E8)
add("loop", 45, Q4)
add("light", 46, Q4)
add("glow", 47, Q4)
# back to Hanoi
add("eyes", 48, E8)
add("stamp", 49, (0,)); add("tear", 49, (1, 2, 3))
add("neq", 50, Q4)
add("neq", 51, Q4)
add("win", 52, Q4)
# closing lines and end
for b in range(53, 57):
    add("gold", b, Q4)
add("title", 57, (0,)); add("char", 57, S16[:4]); add("sub", 57, (2,)); add("tq", 57, (3,))
add("law", 58, (0,)); add("pulse", 58, (1, 2, 3))
for b in range(59, 62):
    add("ref", b, Q4)

for b, bt_ in WIPES_:
    add("wipe", b, (bt_,))

SCENE_CUTS = [1, 2, 4, 5, 6, 7, 8, 10, 11, 15, 18, 20, 21, 23, 25, 27, 29, 30, 31, 36, 37, 38, 39, 44, 45, 46, 48,
              50, 53, 57]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    return [(bar * BAR + 0.1, (bar + n) * BAR - 0.2, text) for bar, text, n in LINES]
