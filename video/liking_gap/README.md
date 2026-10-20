# 好感差距 · The Liking Gap

《你以为聊天冷场了？其实对方比你想的更喜欢你》:约 3 分钟的 vibe 科普短片,1920×1080 / 60fps,无配音。

画面和音乐都由代码逐帧生成。没有下载任何图片、素材、采样或音频文件,也没有用虚拟乐器。

| 文件 | 作用 |
|---|---|
| `music.py` | 用振荡器和噪声合成配乐:加法合成锯齿波 pad / supersaw、FM 钟声与电钢琴、合成鼓组、扫频 riser、卷积混响。输出 `out/music.wav`,以及给画面卡点用的事件表 `out/sync.npz` |
| `gfx.py` | skia 绘图工具:多种字幕形态(打字机、逐字浮现、弹跳、故障、描边扫光、竖排、像素字、粒子成字)和图形 |
| `cover.py` | 封面图:16:9(1920×1080)和 3:4(1080×1440),复用片中的星云背景、标题和 5.82 vs 5.17 柱状图 |
| `render.py` | 分镜与渲染:SkSL 星云背景、镜头转场、光斑、冲击波、火花、频谱条、故障切片、bloom、颗粒,通过管道送进 ffmpeg 编码 |

```bash
pip install numpy scipy skia-python   # skia 需要系统库 libegl1 libgl1
python3 music.py                      # ≈100 s
python3 render.py --still 60 125      # 抽帧检查 → out/stills/
python3 render.py --range 56 64       # 片段预览
python3 cover.py                      # 封面 → out/cover_16x9.png、out/cover_3x4.png
python3 render.py                     # 整片 → out/好感差距_TheLikingGap.mp4(4 核约 37 分钟,14 Mbps)
python3 ../../scripts/gdrive_upload.py out/好感差距_TheLikingGap.mp4 --folder video_from_opus
```

## 结构(100 BPM,每小节 2.4 s,画面按小节和鼓点切换)

| 小节 | 音乐 | 画面 |
|---|---|---|
| 0–8 | 引子:pad 渐开,钟声"提问"动机 | "对方正在输入…" → 回家路上的脑内重播 → 标题 |
| 8–16 | 主歌:轻鼓、琶音 | 内心 OS 气泡(饭局笑话、看手机、"哈哈"是不是敷衍)→ 负面念头漩涡 |
| 16–24 | 铺垫 1:军鼓滚奏 + riser,最后一拍静音 | 2018 实验:陌生人聊 5 分钟,分开各自 1–7 分打分 |
| 24–32 | 高潮 1 | 5.82 vs 5.17 → "好感差距" → 2–45 分钟、工作坊里的普通人,差距都在 |
| 32–40 | 间奏:电钢琴 + 秒针 | 耶鲁新生室友一学年 5 次追踪,前 4 次都在低估,5 月才消失 |
| 40–48 | 铺垫 2 | 为什么:脑中回放 vs TA 看到的你;旁观者看得到信号;拿理想的自己打分;2024 |
| 48–56 | 高潮 2 | 复现(Le 等 2024、Tissera 等 2025)→ 现实场景:宿舍夜聊、相亲、同事午饭 |
| 56–64 | 律动段 | 微信"哈哈" → 三条建议 |
| 64–74 | 尾声:钟声"回答"动机落在主和弦 | 对方发来"下次再约?" → "和你聊天,真好。" → 片尾与参考文献 |

## 事实来源

- Boothby, Cooney, Sandstrom & Clark (2018). *The Liking Gap in Conversations: Do People Like Us More Than We Think?* Psychological Science, 29(11), 1742–1756.
  - 研究 1a:聊 5 分钟,7 分制。实际喜欢 5.82,自以为被喜欢 5.17。
  - 研究 1b:旁观者能从录像里看出喜欢的信号。研究 2:对自己表现的负面想法是差距的部分原因。
  - 研究 3:对话 2–45 分钟,差距都在。研究 4:英国"How to Talk to Strangers"工作坊里的普通人。
  - 研究 5:耶鲁新生室友,2016.9 至 2017.5 测 5 次。前 4 次有差距,5 月消失。作者推测与商量来年是否同住有关。
- Le, Trofimovich, McDonough & Sato (2024). Frontiers in Communication, 9. 蒙特利尔的越南语传承语使用者,两轮对话都存在好感差距。
- Tissera, Elsaadawy, Cooney, Human & Carlson (2025). JPSP, 128(4). 2,753 人,好感差距普遍存在。

片中的生活场景(宿舍、相亲、午饭、微信)是帮助理解的举例,不是研究数据。
