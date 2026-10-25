# 谁先开口 · 死锁（Deadlock）

160 秒的无配音概念短片，1920×1080 / 60fps。一帧一理（quiet_concept）第 2 集，从第 1 集「老地方」复制结构。
画面和音乐都由代码逐帧生成，没有用任何下载的素材。

| 文件 | 作用 |
|---|---|
| `cues.py` | 标题、段落、每小节一句的字幕（`LINES`）、换场、发送和打字的小节 |
| `music.py` | 96 BPM lo-fi 钢琴；卡死时（15–23 小节）鼓停、和弦停在 Am9，圈断开、有人吃上饭（28 小节）鼓才回来 |
| `render.py` | 分镜：两部手机、圆桌、等待图、四个条件、编号解法、数据库、实验、生活里的圈、回到手机 |
| `cover.py` | 封面：`COVER=A`（默认，两人都在打字、中间一圈红色等待）或 `COVER=B`（发出去之后） |

```bash
python3 music.py
python3 render.py --still 11.5 39 59.5 72 102 136 146.5   # 抽帧 → out/stills/
python3 cover.py                                          # → out/cover_16x9.png、out/cover_3x4.png
python3 render.py                                         # 整片 → out/谁先开口_Deadlock.mp4
../../../../../sm publish deadlock
```

## 结构（96 BPM，每小节 2.5 s）

| 小节 | 画面 |
|---|---|
| 0–7 | 两部手机，冷战第 3 天，你打字又删、TA 打字又删，中间一圈「等」 |
| 7–9 | 标题卡「谁先开口」，小字「死锁 / DEADLOCK」 |
| 9–16 | 1965 迪杰斯特拉的考题 → 五个哲学家、五根筷子，每人拿起左手边那根，围成红色的圈 |
| 16–24 | 等待图；Coffman 等 1971 年的四个条件，划掉「循环等待」，圈断开 |
| 24–30 | 给筷子编号、先拿小号，最后那人伸向另一边，大家轮流吃上 |
| 30–36 | 数据库每 5 秒查一次，挑回滚代价最小的当「牺牲者」 |
| 36–44 | Liu 等人的实验：发的人低估了收到的人有多高兴（图为示意） |
| 44–50 | 老朋友、爸妈、工作群三个小圈，合成一个人人攥着一根筷子的圈 |
| 50–55 | 「先开口的，不是输了 / 是先看见了那个圈」，一个人转身，圈断开 |
| 55–59 | 回到手机：你按下发送，对面亮起「对方正在输入…」 |
| 59–64 | 「等，要两个人。开口，一个人就够。」→ 片尾标题 + 参考文献 |

## 事实来源

- 维基百科 Dining philosophers problem：1965 年迪杰斯特拉的考题，原题是五台计算机抢磁带机，Hoare 后来定名。原题用叉子，片中换成筷子。
- Dijkstra (1971). Hierarchical ordering of sequential processes. *Acta Informatica*, 1(2).
- Coffman, Elphick & Shoshani (1971). System deadlocks. *ACM Computing Surveys*, 3(2).
- Microsoft SQL Server 文档 Detecting and Ending Deadlocks：锁监视线程默认 5 秒一次，选回滚代价最小的事务当 victim。
- Liu, Rim, Min & Min (2023). The surprise of reaching out: Appreciated more than we think. *JPSP*, 124(4)（2022 年网络首发，5900 多人）。研究对象是联系久违的朋友，不是吵架后和好，片中只用在那一段。

「给筷子编号」是教科书里的资源排序解法，片中没有归给某个人。聊天、数据库数字和实验图的高度是示意，片尾写明了。
