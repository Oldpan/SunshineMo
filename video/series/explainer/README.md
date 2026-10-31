# explainer · 讲透

engine: narrated

把一篇文章、博客、论文或产品更新讲清楚的中文讲解片：Qwen 龙安欢配音，字幕跟着配音走，Remotion 画面，1920×1080 / 30fps。
引擎是子模块 `third_party/article-to-video`。这里只放每期的内容，引擎改动在它自己的仓库提交。

## 每期目录

```
episodes/<slug>/        slug = Remotion 的 composition id：小写字母、数字、短横线
  video.yaml            标题、引擎、风格、交付清单；sm publish 在末尾写回 Drive 记录
  script.yaml           旁白脚本，写法见 article-to-video 的 references/script.md
  source/               article.md（原文和所有用到的资料）、video.md（标题 + 100–200 字介绍，原样作为 `介绍和文案.md` 传 Drive，别的都不写）、小配图
  scenes/               自定义场景：index.tsx 导出 id = '<slug>' 和 registry，场景文件和它同级，用 '@atv/lib/...' 引用渲染器
  out/                  不进 git
```

## 流程

```bash
source env.sh
./sm new <slug> --series explainer --title "标题" --source <URL>
# 写 source/article.md、script.yaml；通用版式不够时再写 scenes/
./sm build <slug> --dry              # 按字数估时长，先看画面
./sm build <slug> --preview          # 配音 + 半分辨率
./sm build <slug>                    # 正式 1080p + 封面
./sm verify <slug>                   # check_beats + 成片按时间轴回听、截图拼板
./sm publish <slug>                  # 上传 Drive，写回 video.yaml
```

工作方法、版式、画风、品牌素材和审片标准都以 article-to-video 的 `SKILL.md` 和 `LESSONS.md` 为准，开工前读一遍。
画风：`style:` 先用渲染器自带的 `flat` / `paper` / `pixel` / `crayon`（每个场景也能在 `script.yaml` 里单独指定）；想换别的画风先看 `.claude/skills/README.md`。

## 集数

| 集 | 标题 | 成片 |
|---|---|---|
| kimi-k31-pro | 开源旗舰逼近 Opus：Kimi K3.1 Pro 全拆解 | Drive video_from_opus/Kimi K3.1 Pro 拆解 |
| fold-subagents | 快约 2 倍：Claude 官方教你把 subagent 并回主循环 | Drive video_from_opus/subagent 并回主循环 |
| managed-agents | Anthropic 把 Agent 的脑和手拆开了：Managed Agents 架构全拆解 | Drive video_from_opus/脑手分离 |
| hf-reverse-engineering | DeepSeek 带 4 个 Qwen 小模型逆向程序：主管还给手下改了 harness | Drive video_from_opus/大模型带小模型逆向 |
| spec-decoding | 加快 LLM 速度最快 6 倍，五种投机解码全解析 | Drive video_from_opus/五种投机解码 |
| ai-jobs-safe | AI 裁员潮里，哪些工作还安全？（综艺答题卡通 + 真实新闻和照片，7 分钟） | Drive video_from_opus/AI 裁员潮里哪些工作还安全 |

（之前的 10 期在 article-to-video 的 `projects/` 里，留在原处。）

## 共用场景套件

`shared/claudeblog.tsx`：Claude 博客风（象牙底 + 陶土色）的版式和小组件，fold-subagents 和 managed-agents 都从这里取，每期的 `scenes/common.tsx` 只做 re-export 再加本期专用的零件。

- `Shell` 的 `drift` 让点阵底纹和内容整场缓慢移动，长句停留时画面也不会被 freezedetect 判成静帧；`bg` / `dots` 换底色，夜景主题 `claudenight` 用它。大块白卡片会盖住点阵，这类场景要靠内容自己动（数字滚动、进度条用线性填满整句），别指望底纹。漂移幅度很小，成片不能再转码：拼接修补过的片段再压一次，点阵的亚像素移动会被压掉，静帧检测一下冒出几十处，只能整片重渲。
- `rise()` / `pop()` 返回的 style 自带 `opacity`。同一个对象里再写淡出的 `opacity` 要放在展开**之后**，并乘上入场进度；写在前面会被覆盖，元素永远不消失（managed-agents 的报错卡片就压在了下一拍的代码上）。

`shared/iso/`：等距信息图（lemo iso 引擎，Canvas 2D），spec-decoding 首用。每期的 `scenes/world.tsx` 放本期的 `IsoScene` 和零件。

- `IsoScene` 给每个场景加 3% 的缓慢推镜、整幅画面上滑 12 px，底纹点阵每帧漂 0.4 px：等距画面的卡片和方块都是静止的，没有这两样，长句停留会被 freezedetect（n=0.0005 d=0.5）判成静帧，第一次成片查出一百多处。
- `camAt()` 按 1920×1080 算；3:4 封面要把目标点按两种画幅中心的差平移。整站变暗用 `iso.desat`，用 `alpha` 会露出内面。
- 大块扁平盒子（底板、传送带）要放 `{layer: 0}`，否则深度排序会把上面的方块盖住；中文写在方块顶面上看不清，字要竖直画在屏幕空间。
- 审片里最常见的必须改是“借来的数字没交代口径”：别家论文测的基线、不同批量 / 链式与树、博客自训的对照，旁白和卡片都要写明谁测的、在什么设置下。
- 「参」不在多音字表里，`readings` 标不了；读错时给那一句加 `say`，用同音字（餐数）。

`shared/gameshow.tsx`：综艺答题扁平卡通（借 lemo-opuscar `game-show` 风格的画法，MIT），ai-jobs-safe 首用。糖果色布景（条纹 / 圆点 / 放射，整场都在动）、8 px 墨线、硬投影、跟节拍跳的豆子选手（`Bean`，可换帽子、道具，`kind="bot"` 是机器人）、关卡卡片 `RoundCard`、判定词 `Judge`、彩纸 `Confetti`、拍点轻推 `Punch`；真实照片放进 `Screen`（LED 框 + 慢推镜 + 出处）。

- 子画面用本期 `common.tsx` 里的 `At`（`<Sequence from={at[k]} layout="none">`）包起来，里面的 `Pop` / `Stamp` / `Judge` 的 `f0` 就按这一拍算。直接在场景里写相对帧，元素会在出场时已经弹完，看不到入场动画。
- 每个场景都有持续运动（布景图案、豆子跳、推镜），全片不靠漂移补救也过 freezedetect。
- 真实素材：国会图书馆 Highsmith 合集是公有领域，JSON API 要带说明身份的 UA；Wikimedia 在云端被限流，Pexels / Pixabay 403。新闻截图用 Playwright 拒 cookie 后按 h1 位置裁。
- 封面别写成片撑不住的话：「AI 抢不走」改成「最难被 AI 替代」（第二关只是短期安全）。
