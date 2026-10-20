# warm_journal · 暖光手帐

一句话定位：把一个"大家都有感觉"的生活话题，做成 2–4 分钟的 lo-fi 情绪科普短片。
- 先让人觉得"被说中了"，再用研究给一个更温柔的解释，最后给一点情感寄托。
- 没有配音，信息靠手写感字幕、纸质物件和手绘线条来讲。

和 neon_science 的区别：
- neon_science 是电子乐卡点、霓虹星云，偏"燃"。
- warm_journal 是暖色纸张加 lo-fi，偏"被理解"。
- 选题偏情绪和生活（时间、疲惫、家人、年底），中国日常细节越具体越好。

| 集数 | 片子 | 时长 | 目录 |
|---|---|---|---|
| 1 | 长大后时间越过越快？可能不是年龄的锅 | 198.0 s | `episodes/time_flies/` |

## 视觉规范

- **纸面**：
  - 纸张纹理在 `setup` 里用 numpy 生成：低频斑驳、纤维、细颗粒。
  - 每帧用 multiply 叠在**所有内容之上**，所以墨迹也带纸感。
  - 底下铺手帐点阵和渐变纸色。
- **配色跟着"一天"走**：`style.PALETTES` 里有十套，按段落指定：
  - 白天四套：dawn（清晨）、office（白天）、sepia（回忆）、dusk（傍晚）。
  - 夜里四套：lamp（台灯）、deep_night（深夜）、indigo（凌晨）、home_lights（万家灯火）。
  - 收尾两套：morning（晨光）、new_year（新年）。
  - 夜里是深色笔记本，加一圈暖色台灯光，并有尘埃飘浮。
  - 段落之间 1.6 秒渐变。drop 段和明暗互换的段落（`fast`）在下拍瞬切，配合 crash 时的胶片灼烧。
  - 明暗两套之间不要慢慢渐变，否则过渡中途字和纸会一样亮。
- **取色**：镜头里一律从 `x.look` 取颜色：
  - `ink` 正文，`soft` 次要文字。
  - `a1` 红（印章、关键词），`a2` 第二强调色（数字、结论）。
  - `card` 物件底色。
- **字体**：
  - 中文用霞鹜文楷（`font(size, "kai", bold)`），有手写感。
  - 数字和时间用 Inter。
  - 先用 `glyphs` 检查缺字，见 skill。
- **字幕样式**：
  - 主样式 `text_ink`（墨迹晕开）。
  - 重点句 `text_stamp`（盖下去）。
  - 数字 `text_roll`（滚动计数）。
  - 关键词配 `hand_circle`、`hand_underline`、`hand_marker`。
  - 一个镜头只用一种主样式。
- **物件**（都带暖棕色投影，见 `style.py`）：
  - `card`、`sticky`、`polaroid`、`phone`：context manager，块内是物件的局部坐标。
  - `tape`、`calendar_page`（手撕老黄历，能撕页）、`clock`（指针按 tick 事件跳）、`stamp`（红色印章）、`windows`（楼宇窗户）。
- **特效**（全部挂在音乐事件上）：
  - 漏光：随 chord 加强，drop 时随 kick 加强。
  - crash：胶片灼烧。
  - bell：在画面边缘画手绘小星星，不会压到字。
  - drop 段的 clap：纸屑。
  - 常驻：灰尘、毛发、竖划痕、投影闪烁、暗角、手持漂移、kick 时轻推镜头。
  - 夜景：暖色 halation。
  - 镜头可以设 `x.mono`（褪色定格），配合磁带骤停用。
- **不用的东西**：色差、故障切片、加色混合的 glow。在浅色纸上，加色混合会把画面冲白。
- **转场**：
  - `slide`：纸片从下方滑入，带一点旋转。
  - `drop`：从上方落下，带回弹。
  - `fade`。
  - `cut`：用在鼓点和 drop 上。
  - 进 drop 的那一刀，前一个镜头也要 `kout="cut"`，否则旧镜头会在新镜头下面滑走，画面很乱。

## 音乐配方（`template/music.py` 是缩小版）

- **速度与和声**：80 BPM，C 大调 / A 小调，和弦带九音。
  - 主歌 6415：Am9–Fmaj9–Cmaj9–G9sus。
  - 回忆段 4321 下行：Fmaj9–Em7–Dm9–Cmaj9。
  - 高潮 4536 王道进行：Fmaj9–G9–Em7–Am9。
- **音色**：
  - 电钢琴：`ep_key`，下拍扫弦，第 2 拍反拍轻轻再弹一下。
  - 鼓：`kick_lofi`，军鼓过低通；hat 用 16 分音符，奇数位推后（`swing_time`，0.58）。
  - 贝斯：`bass_note`，加 `sub_tone` 托低频。
  - 高潮：钢琴主旋律 `piano_note`，配弦乐 `string_pad`。
  - 八音盒：`fm_bell(idx=1.6, ratio=3)`。开头奏一个落在 G 上的"提问"动机，结尾奏一个落在 C 上的"回答"动机。
- **钟表滴答**：`tick` 高低交替，模拟"滴—答"，同时是画面的秒针。
  - 铺垫段从四分音符逐级加密到三十二分音符，接 `tape_stop` 和一拍真静音。
  - 静音里只留黑胶底噪，下一拍进 drop。
- **母带**：
  - `mixdown` 负责 sidechain、混响和 ping-pong 延迟。
  - 之后用 `gate_silence` 把混响尾巴也切掉，再做 `tape_wow` 和一阶低通。
  - 最后叠上不受静音影响的 `vinyl` 底噪，以及 drop 前的半拍 `reverse_swell`。
- **纸张音效**：`rustle`，用在撕日历上。

## 叙事套路

1. 用年底或日常的一个物件开场，抛出"你有没有发现——"。
2. 中国日常快剪：作息、通勤、打卡、外卖、加班、刷手机、flag，让人觉得被说中。
3. 童年对比，制造怀旧的情绪落差。
4. 摆出流行说法，在磁带骤停的那一刻反转："但是——"。
5. 第一个高潮给出核心数字。数字要大，也要好懂，比如方格图、柱状图、"强 7 倍多"。
6. 讲多国复现，以及唯一的例外和它的解释。
7. 讲机制，配一个具体的画面隐喻，比如 355 天并成一颗珠子。
8. 第二个高潮讲中国现实（官方数据）和家人，落到一句"不是你……，是你……"。
9. 给三条温和的小建议，写在便利贴上。
10. 结尾回扣开场物件，留一句祝福，片尾放参考文献。

## 封面

16:9 和 3:4 各一张，见 `template/cover.py`。
- 一侧放：钩子问题、文楷大标题（下面一笔马克笔高亮）、结论句（关键词红色并手绘下划线）、字距拉开的英文标题。
- 另一侧放：老黄历、钟表、写着核心数字的便利贴。
- 不要用撕到一半的日历页，缩小后会读成乱码（"330"）。

## 新开一集

```bash
apt-get install -y fonts-lxgw-wenkai   # 霞鹜文楷
cp -r video/series/warm_journal/template video/series/warm_journal/episodes/<name>
cd video/series/warm_journal/episodes/<name>
python3 music.py && python3 render.py --still 4 9 16 && python3 cover.py
```
