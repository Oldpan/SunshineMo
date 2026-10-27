"""第一座山 (局部最优): one timing table for music.py, render.py and check_hits.py.

Beat-locked like 会算数的马: every visual hit is listed once in HITS as (name, bar, beat); music.py puts a sound
on it, render.py animates on it, check_hits.py proves both land on the same video frame.  This episode packs a
hit onto almost every beat: steps, probes, flags, jumps, rings and dots all land on the grid.
Captions: {warm} [cool] <red>.  Warm is the lantern and what the climber knows, cool is the unseen range and
the way out, red is being stuck.  (In ink all three are ink; the marks only set weight.)
"""
BPM = 100
BAR = 240 / BPM
BEAT = 60 / BPM
BARS = 64

TITLE = "第一座山"
TITLE_Q = "他爬上了山顶，只是[雾]挡住了更高的那座。"
CONCEPT, CONCEPT_EN = "局部最优", "LOCAL OPTIMUM"

SECTIONS = [("dark", 0, 1), ("climb", 1, 3), ("top", 3, 5), ("sure", 5, 7), ("flash", 7, 8), ("title", 8, 10),
            ("rule", 10, 16), ("six", 16, 22), ("name", 22, 24), ("anneal", 24, 32), ("wright", 32, 38),
            ("life", 38, 48), ("coda", 48, 54), ("back", 54, 60), ("final", 60, 62), ("end", 62, 64)]

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
    # the rule
    (10, "他用的办法，有个名字：爬山法。", "bottom", 46, 1),
    (11, "每一步只看身边：哪边高，就往哪边。", "bottom", 46, 1),
    (12, "简单，很快，从不走回头路。", "bottom", 46, 1),
    (13, "可它有个毛病：", "bottom", 50, 1),
    (14, "只要四周都比脚下低，它就<停>。", "bottom", 46, 1),
    (15, "哪怕更高的山，就在[雾的后面]。", "bottom", 46, 1),
    # six climbers
    (16, "换个看法：把整片山摊开看。", "bottom", 46, 1),
    (17, "放六个人下去，用同一个办法爬。", "bottom", 46, 1),
    (18, "每个人都很努力。", "bottom", 46, 1),
    (19, "每个人，都爬到了一个顶。", "bottom", 46, 1),
    (20, "六个人，停在了五座山上。只有一个，站在[最高处]。", "bottom", 44, 1),
    (21, "别人停下，不是因为懒。是因为<看不见>。", "bottom", 46, 1),
    (22, "这叫<局部最优>：附近最高，就以为是最高。", "bottom", 46, 1),
    (23, "真正最高的那座，叫[全局最优]。", "bottom", 46, 1),
    # simulated annealing
    (24, "1983 年，IBM 的三个研究者想到一个办法。", "bottom", 44, 1),
    (25, "他们借了铁匠的手艺：{退火}。", "bottom", 46, 1),
    (26, "先烧热。热的时候，允许[往下走]。", "bottom", 46, 1),
    (27, "乱走几步，反而翻过了山谷。", "bottom", 46, 1),
    (28, "再慢慢冷下来，一步比一步谨慎。", "bottom", 46, 1),
    (29, "最后，停在了{更高的山上}。", "bottom", 46, 1),
    (30, "他们用它摆芯片上的元件，排最短的路线。", "bottom", 44, 1),
    (31, "往下走一步，是为了爬[更高的山]。", "bottom", 46, 1),
    # Sewall Wright
    (32, "更早，1932 年，生物学家 Sewall Wright 画过一张地图。", "bottom", 42, 1),
    (33, "一圈圈等高线：越往里，活得越好。", "bottom", 46, 1),
    (34, "一个物种，就住在[一座小山]上。", "bottom", 46, 1),
    (35, "去更高的山，得先穿过<谷地>：先变差一阵。", "bottom", 46, 1),
    (36, "可自然选择，<不许变差>。", "bottom", 46, 1),
    (37, "Wright 说：要靠偶然，把一小群推过去。", "bottom", 46, 1),
    # you
    (38, "你可能，也站在一座小山上。", "bottom", 46, 1),
    (39, "一份{还不错}的工作。", "bottom", 50, 1),
    (40, "每一个改变，看起来都更差。", "bottom", 46, 1),
    (41, "所以你不动。四周，都更低。", "bottom", 46, 1),
    (42, "练了十年的手艺，换个方法，就得[先变笨]。", "bottom", 44, 1),
    (43, "住惯了的城，过得去的日子。", "bottom", 46, 1),
    (44, "局部最优，难的不是爬。", "bottom", 46, 1),
    (45, "难的是承认：这只是[第一座山]。", "bottom", 46, 1),
    (46, "退火的办法：刚开始时，多试，多走点弯路。", "bottom", 44, 1),
    (47, "慢慢冷下来，再认真爬。", "bottom", 46, 1),
    (48, "不是每座山顶，都要离开。", "bottom", 46, 1),
    (49, "但要知道：雾的后面，[可能还有山]。", "bottom", 46, 1),
    (50, "偶尔，往下走一步，看看。", "bottom", 46, 2),
    (52, "站在山顶，不等于{最高}。", "upper", 64, 1),
    (53, "敢往下走，才看得见[下一座]。", "upper", 64, 1),
    # back to the night
    (54, "回到那个夜里。", "bottom", 46, 1),
    (55, "他拔起旗子，往[下]走了一步。", "bottom", 46, 1),
    (56, "一步，一步，越走越低。", "bottom", 46, 1),
    (57, "谷底。然后，开始往上。", "bottom", 46, 1),
    (58, "越爬越高，雾散开了。", "bottom", 46, 1),
    (59, "天亮了。", "bottom", 50, 1),
    (60, "他没爬错，\n只是停得[太早]。", "center", 64, 2),
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

# the rule: a cross-section painted in, the greedy dot climbs it
HITS += [("draw", 10, 0)] + [("kchar", 10, 2 + i * 0.25) for i in range(3)]            # 爬山法
HITS += [("look", 11, 0), ("look", 11, 1), ("hop", 11, 2), ("hop", 11, 3)]
HITS += [("hop", 12, b * 0.5) for b in range(8)]
HITS += [("stop", 13, 0), ("probe", 13, 2), ("probe", 13, 3)]
HITS += [("probe", 14, b) for b in range(4)] + [("x", 14, 3.5)]
HITS += [("reveal", 15, 0), ("tag", 15, 2)]
# six climbers on the whole range
N_CLIMB = 6
HITS += [("unroll", 16, 0)] + [("peak", 16, 2 + i * 0.25) for i in range(5)]
HITS += [("drop", 17, i * 0.5) for i in range(N_CLIMB)]
HITS += [("climb", 18, b * 0.5) for b in range(8)]
HITS += [("flag", 19, i * 0.5) for i in range(N_CLIMB)]
HITS += [("crown", 20, 0)] + [("fogup", 20, 2 + i * 0.25) for i in range(5)]
HITS += [("ping", 21, b) for b in range(3)]
# naming
HITS += [("slam", 22, 0)] + [("kchar", 22, 1 + i * 0.25) for i in range(4)] + [("mark", 22, 3)]
HITS += [("slam", 23, 0)] + [("kchar", 23, 1 + i * 0.25) for i in range(4)] + [("mark", 23, 3)]
# annealing
HITS += [("year", 24, 0)] + [("name", 24, 1 + i) for i in range(3)]
HITS += [("anvil", 25, b) for b in range(4)]
HITS += [("heat", 26, 0)] + [("jump", 26, b * 0.5) for b in range(8)]
HITS += [("jump", 27, b * 0.5) for b in range(8)]
HITS += [("cool", 28, b) for b in range(4)]
HITS += [("flag", 29, 0), ("alt", 29, 2)]
HITS += [("chip", 30, b * 0.5) for b in range(8)]
HITS += [("route", 31, b * 0.25) for b in range(12)]
# Sewall Wright's map
HITS += [("year", 32, 0), ("name", 32, 2)]
HITS += [("ring", 33, b * 0.5) for b in range(8)]
HITS += [("dot", 34, b * 0.25) for b in range(12)]
HITS += [("valley", 35, 0), ("arrow", 35, 2)]
HITS += [("pull", 36, b) for b in range(4)]
HITS += [("drift", 37, b * 0.25) for b in range(8)] + [("cross", 37, 2.5)]
# you
HITS += [("lamp", 38, 0)]
HITS += [("label", 39, 0)] + [("probe", 39, 2), ("probe", 39, 3)]
HITS += [("probe", 40, b) for b in range(4)]
HITS += [("stuck", 41, 0), ("stuck", 41, 2)]
HITS += [("score", 42, b) for b in range(4)]
HITS += [("label", 43, 0), ("label", 43, 2)]
HITS += [("bolt", 44, 2)]
HITS += [("flag", 45, 0), ("flag", 45, 2)]
HITS += [("jump", 46, b * 0.5) for b in range(8)]
HITS += [("cool", 47, b) for b in range(4)]
HITS += [("lamp", 48, 0), ("tag", 48, 2)]
HITS += [("bolt", 49, 2)]
HITS += [("down", 50, 0), ("down", 50, 2), ("look", 51, 0), ("look", 51, 1), ("reveal", 51, 2)]
HITS += [("slam", 52, 0), ("slam", 53, 0)]
# back to the night
HITS += [("lamp", 54, 0), ("tag", 54, 2)]
HITS += [("unflag", 55, 0), ("down", 55, 2)]
HITS += [("down", 56, b) for b in range(4)]
HITS += [("bottom", 57, 0)] + [("step", 57, 2 + b * 0.5) for b in range(4)]
HITS += [("step", 58, b * 0.5) for b in range(8)]
HITS += [("dawn", 59, 0), ("flag", 59, 2)]
HITS += [("final", 60, 0), ("endcard", 62, 0)]

# breaths (bar, beat from, beat to): the mix dips to a third for a moment while the picture keeps moving.
# Not true silences: gated silence + a held frame played back as seven stutters in the first cut.
BREATHS = [(3, 2.5, 4.0), (7, 3.0, 4.0), (13, 0.5, 2.0), (21, 3.0, 4.0), (41, 2.5, 4.0), (53, 3.0, 4.0),
            (57, 0.5, 2.0)]
SCENE_CUTS = [8, 10, 16, 22, 24, 32, 38, 48, 52, 54, 60, 62]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    out = []
    for bar, text, pos, size, n in LINES:
        out.append((bar * BAR + 0.12, (bar + n) * BAR - 0.3, text, pos, size, BAR if "\n" in text else 0.0))
    return out
