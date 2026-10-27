# 回来的飞机（幸存者偏差）· 一帧一理 05

蓝图（工程制图）风格：全片是一张晒图蓝纸，白色线稿按制图顺序画出来，全片只有印章用一次红色。
100 BPM，D 小调，62 小节，148.8 秒，315 个卡点。

```bash
python3 music.py && python3 check_hits.py     # 315 hits, worst offset 0 frames
python3 render.py --still 13 31 57 72.5 93 113 131 142
python3 render.py && COVER=B python3 cover.py && python3 cover.py
```

| 文件 | 作用 |
|---|---|
| `cues.py` | 字幕、卡点表（HITS）、章节、结尾金句和参考文献 |
| `bp.py` | 蓝图工具：晒图纸、描线、虚线规范、剖面线、气泡、修订云、NOTE 框、印章、手影 |
| `render.py` | 四张图：FIG. 1 飞机 → FIG. 2 书架 → FIG. 3 产品反馈 → FIG. 4 你，再回到 FIG. 1 |
| `music.py` | 羽管键琴固定音型 + 拨弦低音 + 钢片琴，每个卡点一个笔声或音符，任何地方都不静音 |
| `cover.py` | 两版封面：A 用片中的设问，B 用 Wald 1943 的答案 |

## 史实

- Wald 在哥伦比亚大学统计研究组（SRG）1943 年的系列备忘录，1980 年由 CNA 重印，标题
  *A Method of Estimating Plane Vulnerability Based on Damage of Survivors*。
- Mangel & Samaniego, *Abraham Wald's Work on Aircraft Survivability*, JASA 79(386): 259–267, 1984。
- 常见的「红点飞机图」是后人画的示意，片中的弹孔分布和数字也都标了「示意」。

## 经验

- JetBrains Mono 没有中文字形，「示意 · ILLUSTRATIVE」这类中英混排要拆成两段，中文用手写体，否则出方块。
- 推镜头时，画面边上的表格和文字会被裁掉，推之前先把它们淡出。
- 字幕框固定在顶部，所以每张图的内容都从 y≈280 往下画；气泡、标注不要往上堆。
