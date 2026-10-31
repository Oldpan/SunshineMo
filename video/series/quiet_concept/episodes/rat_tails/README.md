# 老鼠尾巴（古德哈特定律）· 一帧一理 06

复古半调案卷风格：奶油色档案纸、网点代替渐变、粗衬线大标题带错版阴影、印章盖下来带震动。全片是一份案卷，一件证物一件证物地读。
100 BPM，A 小调，62 小节，148.8 秒，346 个卡点。

```bash
./fonts.sh                                    # 一次：下载 4 个 OFL 字体到 ~/.local/share/fonts/dossier
python3 music.py && python3 check_hits.py     # 346 hits, worst offset 0 frames
python3 render.py --still 1.5 33.2 47.6 83.6 113.6 141.2
python3 render.py && python3 cover.py && COVER=B python3 cover.py
```

| 文件 | 作用 |
|---|---|
| `cues.py` | 字幕、卡点表（HITS）、章节、点阵转场位置、结尾金句和参考文献 |
| `dossier.py` | 半调案卷工具：纸张、颗粒、网点、逐字弹出标题、字幕胶囊、HUD、印章、点阵转场、老鼠、尾巴、硬币 |
| `render.py` | 冷开场（下水道 → 悬赏 → 尾巴 → 没尾巴的老鼠 → 养鼠场）→ 机制 → FIG. 2 生活 → FIG. 3 AI → FIG. 4 你 → 回到河内 |
| `music.py` | 合成器流行印刷风：方波低音、马林巴、每个字一个 pop、印章是下坠的低音，任何地方都不静音 |
| `cover.py` | 两版封面：A 用河内养鼠场的史实，B 用 Strathern 那句话 |

## 史实

- 1902 年河内按尾巴悬赏灭鼠（一条一分钱），随后出现没尾巴的老鼠和城外养鼠场，悬赏被取消：
  M. G. Vann, *Of Rats, Rice, and Race*, French Colonial History 4 (2003)；Vann & Clarke, *The Great Hanoi Rat Hunt*, OUP 2019。
  「最后老鼠比以前更多」查不到可靠出处，片中不说。
- 古德哈特 1975 年讲的是英国的货币指标；「当一个指标变成目标……」是 Strathern 1997 年的说法。
- 赛艇游戏 CoastRunners：OpenAI, *Faulty Reward Functions in the Wild*（Clark & Amodei, 2016），AI 在小湖湾绕圈撞道具，平均分比人类玩家高约 20%。

## 经验

- HUD 角标要在镜头变换之外、按屏幕坐标画，否则推镜头和震动会把它推出画面。
- 角标和标题放在深色网点上要有底色胶囊，否则看不清。
- `D.radial(cx, cy, r0, r1, lo, hi)` 中心是 hi、外圈是 lo；写反了就会整屏铺满网点，或者出现方形光斑。
- 计数器不要放在掉落物的路径上。
