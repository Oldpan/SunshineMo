# 第一座山 · 局部最优（Local optimum）

154 秒的无配音概念短片，1920×1080 / 60fps，水墨（中国水墨，lemo-opuscar ink-wash 语法）。一帧一理（quiet_concept）第 4 集。
画面和音乐共用一张卡点表 `cues.HITS`（261 个），`check_hits.py` 证明每个卡点的声音和画面落在同一帧。

| 文件 | 作用 |
|---|---|
| `cues.py` | 100 BPM、64 小节；段落、字幕（`LINES`）、卡点表（`HITS`）、真静默（`SILENCES`） |
| `music.py` | 古琴 + 太鼓 + 框鼓 + 刷子；上山的脚步一步高一个音，下山一步低一个音；`GROOVE` 定每小节鼓的密度 |
| `ink.py` | 水墨工具：宣纸、五色墨、毛笔（飞白、侧锋）、墨块、苔点、白文印 |
| `render.py` | 分镜；山是世界坐标里画一次的 Picture，经相机绘制；雾 = 宣纸盖回去、灯笼处留洞；小人有姿态（步幅、前倾、张望、举灯），一拍二帧 |
| `cover.py` | 封面：`COVER=A`（片中那句）或 `COVER=B`（「1983 年 IBM 的解法：先往下走，才爬得更高」，发布用这一版） |
| `styleframe.py` | 定风格用的两张水墨样帧 |

```bash
python3 music.py && python3 check_hits.py     # 261 hits, worst offset 0 frames
python3 render.py --still 5 37.4 67 86 141    # 抽帧 → out/stills/
python3 cover.py && COVER=B python3 cover.py
python3 render.py                             # 整片 → out/第一座山.mp4
../../../../../sm publish first_hill
```

## 结构（100 BPM，每小节 2.4 s）

| 小节 | 画面 |
|---|---|
| 0–8 | 夜雾里爬山：灯笼照亮脚下，一步一个音，到顶、试探四周、插旗，闪电照出更高的山 |
| 8–10 | 片名竖写，盖「局部最优」印 |
| 10–16 | 爬山法：山被一笔笔画出，小人左右张望后往高处跳，到顶「止」；雾退开露出更高的山 |
| 16–22 | 整片山像手卷展开：六个人用同一个办法爬，停在五座山上，只有一个在最高处 |
| 22–24 | 局部最优 / 全局最优 |
| 24–32 | 1983 Kirkpatrick, Gelatt & Vecchi：铁砧打铁；温度计热时乱跳翻过山谷，冷却后只往上；芯片布局、最短路线 |
| 32–38 | 1932 Sewall Wright 的适应度地形：等高线、小山上的一群点、谷地、自然选择拉回、随机漂变推过去 |
| 38–48 | 你的小山：「还不错的工作」，每个改变都「低」；熟练度往下掉；退火的办法 |
| 48–54 | 尾声：闪电后雾散，两句居中 |
| 54–60 | 回到夜里：拔旗下山，谷底静默，再爬上真正的山顶，天亮 |
| 60–64 | 「他没爬错，只是停得太早。」；参考文献 |

参考：Kirkpatrick, Gelatt & Vecchi (1983), *Science* 220:671–680；Wright (1932), Proc. 6th Int. Congress of Genetics 1:356–366。
