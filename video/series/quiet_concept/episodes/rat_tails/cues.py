"""老鼠尾巴 (古德哈特定律): one timing table for music.py, render.py and check_hits.py.

Beat-locked: every visual hit is listed once in HITS as (name, bar, beat); music.py puts a sound on it, render.py
animates on it, check_hits.py proves both land on the same video frame.
Series rules: no true silences, no held frames (design time), a hit on almost every beat; copy feeling-first with
one light AI mapping (reward hacking), facts verifiable.
This file holds the cold-open test (10 bars at 100 BPM = 24 s); the full episode extends it.

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
BARS = 10

TITLE = "老鼠尾巴"
TITLE_Q = "你要的是那个数字，还是老鼠真的变少？"
CONCEPT, CONCEPT_EN = "古德哈特定律", "GOODHART'S LAW"

SECTIONS = [("sewer", 0, 1), ("bounty", 1, 2), ("tally", 2, 4), ("tailless", 4, 5), ("loop", 5, 6),
            ("farm", 6, 7), ("twist", 7, 8), ("title", 8, 10)]

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
]

HITS = []


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
add("count", 7, (0, 1, 2)); add("wipe", 7, (3,))
add("title", 8, (0,)); add("char", 8, S16[:4]); add("sub", 8, (2,)); add("tq", 8, (3,))
add("law", 9, (0,)); add("pulse", 9, (1, 2, 3))

SCENE_CUTS = [1, 2, 4, 5, 6, 7, 8]


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def hit_times(name):
    return [t_of(b, bt) for n, b, bt in HITS if n == name]


def captions():
    return [(bar * BAR + 0.1, (bar + n) * BAR - 0.2, text) for bar, text, n in LINES]
