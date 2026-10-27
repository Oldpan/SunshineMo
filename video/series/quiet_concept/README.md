# quiet_concept · 一帧一理

一句话定位：把一个有中英文名字的硬概念，讲成 160 秒左右的无配音短片。lo-fi 音乐加衬线字幕，深色底上一束光，一个锚物件贯穿全片，最后落到观众自己的生活。
风格参考小红书「比特新语」「AI进修生」的六条爆款，拆解见 [docs/reference/vibe-knowledge-style.md](../../../docs/reference/vibe-knowledge-style.md)。

和其他系列的区别：
- neon_science 是电子乐卡点、霓虹星云，偏「燃」。
- warm_journal 是暖色纸张，偏情绪。
- quiet_concept 克制、安静，画面像研究报告：细线图表、中英对照小字、数字滚动。

| 集数 | 片子 | 时长 | 目录 |
|---|---|---|---|
| 1 | 老地方（探索与利用） | 160.0 s | `episodes/explore_exploit/` |
| 2 | 谁先开口（死锁） | 160.0 s | `episodes/deadlock/` |
| 3 | 会算数的马（过拟合） | 156.9 s | `episodes/clever_hans/` |
| 4 | 第一座山（局部最优），水墨 | 153.6 s | `episodes/first_hill/` |

## 结构（每集都一样）

| 段落 | 约在 | 内容 |
|---|---|---|
| 冷开场 | 0–17 s | 一个具体场景里的锚物件，4–6 句字幕，以问题收尾 |
| 标题卡 | 17–22 s | 小字概念名 + 英文，大号发光衬线标题，一句设问 |
| 机制 | 22–60 s | 「年份 + 人名」开句的经典研究或历史，名言卡 |
| 递进 | 60–110 s | 第二、三个案例，把规律推广 |
| 落到你身上 | 110–140 s | 观众日常：人生时间轴、聊天、通勤 |
| 回扣 + 金句 | 140–165 s | 回到开场画面，对仗两句居中，片尾标题 + 参考文献 |

## 起名

标题取片子里的一个画面、物件或数字，2–5 个字，不用课本术语。术语缩成标题卡上方的小字。
在 `cues.py` 里改 `TITLE`、`TITLE_Q`、`CONCEPT`、`CONCEPT_EN`，标题卡、片尾、封面和文件名都会跟着变。

## 视觉规范（`style.py`）

- **底**：近黑深蓝径向渐变 + 漂浮灰尘，段落用 `LOOKS_BASE` 的 night / warm / cool / deep，切段 2 秒渐变。
- **配色**：只用一个暖色 `WARM`（熟悉、利用）和一个冷色 `COOL`（未知、探索），`NEG` 只给坏结果，其余 `INK` / `DIM` / `FAINT`。
- **字幕**：Noto Serif CJK（`fonts-noto-cjk`）逐字淡入上浮。标记 `{暖}` `[冷]` `<红>`，每句 1–2 个。叙事在底部，图表占底部时放 `top`，金句 `center` 加粗放大。
- **元素**：`figure` 线条小人、`spot` 光池、`beam` 门里漏出的光、`tag` 中文名 + 字距拉开的英文、`counter` 数字滚动。
- **后期**：暗角 0.55，bloom 很轻（0.22），颗粒，右上角水印「一帧一理」。不用频谱条、故障切片、常驻色差。
- **镜头**：`hard_cuts=True`，大多数换场是切，一集约 12–14 次大的画面变化；同一物件推近、加标注来换「镜头」。

## 音乐配方（`template/music.py` 是缩小版）

- 96 BPM，钢琴四和弦循环 Fmaj9 → Em7 → Dm9 → Am9，pad 垫底。
- 鼓（swing lo-fi）只在中段出现，开场、标题、人生段和结尾不打鼓。
- 钟声动机：开场和回扣时「提问」（上行），金句时「回答」（下行）。
- 标题卡：反向渐强 + 冲击 + 镲。每次换场一个嗖声（`cues.SCENE_CUTS`），关键画面配小音效（硬币、滴答）。
- 后期：tape wow、低通、黑胶噪声。不打鼓的段落约 −18 到 −20 dBFS，有鼓约 −14。

## 设计时就定死的规则：不放真静默，不定格

写 `cues.py` 时就不要设计「真静默」（整条混音切到 0）和画面定格。第 4 集《第一座山》放了 7 处，声音 8 毫秒切到零、画面同时停住，
用户看片时 7 处全被当成播放卡顿。这不能靠后期补救，要在分镜和卡点表阶段就避开：

- 想要「屏住呼吸」的一拍，用 `core.synth.breath()`：音乐压到三成，尾音继续响；画面照常在动（云在飘、人在呼吸）。
- 换场前后一拍内不压音乐、不停画面。
- 成片交付前 `./sm verify` 会跑 `video/tools/stutter.py`，片中有掉音就失败。

## 新开一集

```bash
cp -r video/series/quiet_concept/template video/series/quiet_concept/episodes/<name>
cd video/series/quiet_concept/episodes/<name>
python3 music.py && python3 render.py --still 4 12 22 && python3 cover.py
```

字幕一小节一句，写在 `cues.LINES`；画面镜头写在 `render.py`，只画画面不画字幕。
写完照 `docs/reference/vibe-knowledge-style.md` 的检查清单过一遍，再查缺字：

```bash
python3 ../../../../tools/glyphs.py render.py cues.py cover.py ../../style.py \
  --font /usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc#2 --font /usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc#2
```
