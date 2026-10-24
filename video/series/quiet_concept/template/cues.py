"""Shared timing for music.py and render.py: 14 bars (35 s) showing the shape of an episode.

One caption per bar (2.5 s at 96 BPM), like the reference films.  Marks: {warm} [cool] <red>.
Copy this folder to episodes/<name>/, then grow BARS, SECTIONS and LINES (episode 1 has 64 bars, ~58 lines).
"""
BPM = 96
BARS = 14
BAR = 240 / BPM

# The title is an image from the film (an object, a scene, a number), not the textbook name of the concept;
# the concept sits small above it.  See docs/reference/vibe-knowledge-style.md, 起名.
TITLE = "锚物件"
TITLE_Q = "一句{设问}，留一个[悬念]？"
CONCEPT, CONCEPT_EN = "概念名", "CONCEPT  NAME"

# (name, first bar, end bar): music sections and background looks
SECTIONS = [("intro", 0, 4), ("title", 4, 6), ("body", 6, 10), ("end", 10, 14)]

# (bar, text, pos, size, bars)
LINES = [
    (0, "一个具体的场景，不是定义。", "bottom", 46, 1),
    (1, "左边是{熟悉的}，右边是[未知的]。", "bottom", 46, 1),
    (2, "第三句把反常摆出来。", "bottom", 46, 1),
    (3, "第四句是一个问题？", "bottom", 50, 1),
    (6, "年份 + 人名开句：1979 年，某某发现……", "bottom", 46, 1),
    (7, "每句十几个字，一两个词上色。", "bottom", 46, 1),
    (8, "图表占底部时，字幕放 top。", "top", 46, 1),
    (10, "对仗两句收尾，{前一句}。\n[后一句]。", "center", 64, 2),
]


def captions():
    """(t0, t1, text, pos, size, line_delay) in seconds; line 2 of a two-line caption starts a bar later."""
    return [(bar * BAR + 0.12, (bar + n) * BAR - 0.3, text, pos, size, BAR if "\n" in text else 0.0)
            for bar, text, pos, size, n in LINES]


# bars that change scene: a whoosh peaks on each
SCENE_CUTS = [4, 6, 10, 12]
