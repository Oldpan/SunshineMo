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
| claude-code-diet | 怎么别让 Claude Code 越用越蠢？提示词要大减负 | Drive video_from_opus/Claude Code 提示词减负 |
| claude-code-diet-shorts | （竖屏 · 小白向）Claude Code 自家提示词删了八成，官方称核心测试成绩没掉 | Drive video_from_opus/Claude Code 提示词减负（竖屏） |
| ai-jobs-safe | AI 裁员潮里，哪些工作还安全？（综艺答题卡通 + 真实新闻和照片，7 分钟） | Drive video_from_opus/AI 裁员潮里哪些工作还安全 |
| super-agent | 一个人通常只能盯 3–5 个 Session：DeepSeek Harness 团队的 Super-agent 架构全拆解 | Drive video_from_opus/Super-agent架构 |
| qwen4-preview | Qwen4 还没发，架构已经开源两个月了 | Drive video_from_opus/Qwen4前瞻 |
| weight-space-programming | 只改 0.016% 的权重，Qwen 数学从 7.9% 涨到 48.1%：大模型开始直接读写神经网络权重 | Drive video_from_opus/权重空间编程 |
| weight-space-programming-shorts | （竖屏 · 非技术向）AI 给 AI 动手术：只改 0.016% 的数字，千问数学答对率 7.9% 涨到 48.1% | Drive video_from_opus/权重空间编程（竖屏） |
| agent-manager | Claude Code 团队的 Addy Osmani：天天用 AI 写代码，你已经是个经理了 | Drive video_from_opus/AI 让你成了经理 |

（之前的 10 期在 article-to-video 的 `projects/` 里，留在原处。）

## 共用场景套件

`shared/claudeblog.tsx`：Claude 博客风（象牙底 + 陶土色）的版式和小组件，fold-subagents 和 managed-agents 都从这里取，每期的 `scenes/common.tsx` 只做 re-export 再加本期专用的零件。

- `Shell` 的 `drift` 让点阵底纹和内容整场缓慢移动，长句停留时画面也不会被 freezedetect 判成静帧；`bg` / `dots` 换底色，夜景主题 `claudenight` 用它。大块白卡片会盖住点阵，这类场景要靠内容自己动（数字滚动、进度条用线性填满整句），别指望底纹。漂移幅度很小，成片不能再转码：拼接修补过的片段再压一次，点阵的亚像素移动会被压掉，静帧检测一下冒出几十处，只能整片重渲。
- `rise()` / `pop()` 返回的 style 自带 `opacity`。同一个对象里再写淡出的 `opacity` 要放在展开**之后**，并乘上入场进度；写在前面会被覆盖，元素永远不消失（managed-agents 的报错卡片就压在了下一拍的代码上）。

`shared/iso/`：等距信息图（lemo iso 引擎，Canvas 2D），spec-decoding v1 首用（v2 已换成下面的打字特写 + 扁平结构图）。每期的 `scenes/world.tsx` 放本期的 `IsoScene` 和零件。

- `IsoScene` 给每个场景加 3% 的缓慢推镜、整幅画面上滑 12 px，底纹点阵每帧漂 0.4 px：等距画面的卡片和方块都是静止的，没有这两样，长句停留会被 freezedetect（n=0.0005 d=0.5）判成静帧，第一次成片查出一百多处。
- `camAt()` 按 1920×1080 算；3:4 封面要把目标点按两种画幅中心的差平移。整站变暗用 `iso.desat`，用 `alpha` 会露出内面。
- 大块扁平盒子（底板、传送带）要放 `{layer: 0}`，否则深度排序会把上面的方块盖住；中文写在方块顶面上看不清，字要竖直画在屏幕空间。
- 审片里最常见的必须改是“借来的数字没交代口径”：别家论文测的基线、不同批量 / 链式与树、博客自训的对照，旁白和卡片都要写明谁测的、在什么设置下。
- 「参」不在多音字表里，`readings` 标不了；读错时给那一句加 `say`，用同音字（餐数）。

`shared/whiteboard.tsx`：白板手绘（网格纸 + rough.js 马克笔逐笔画出 + 霞鹜文楷），claude-code-diet 首用。

- `b[i]` 是本拍开始后的帧数，`f = b[i] + n` 会让元素**提前** n 帧出现；延迟一律写 `b[i] - n`。
- 画面里自己编的示例（CLAUDE.md 内容、终端输出、步骤清单）都要盖 `Illus`「示意」，复核会把它当事实错误。

`shared/gameshow.tsx`：综艺答题扁平卡通（借 lemo-opuscar `game-show` 风格的画法，MIT），ai-jobs-safe 首用。糖果色布景（条纹 / 圆点 / 放射，整场都在动）、8 px 墨线、硬投影、跟节拍跳的豆子选手（`Bean`，可换帽子、道具，`kind="bot"` 是机器人）、关卡卡片 `RoundCard`、判定词 `Judge`、彩纸 `Confetti`、拍点轻推 `Punch`；真实照片放进 `Screen`（LED 框 + 慢推镜 + 出处）。

- 子画面用本期 `common.tsx` 里的 `At`（`<Sequence from={at[k]} layout="none">`）包起来，里面的 `Pop` / `Stamp` / `Judge` 的 `f0` 就按这一拍算。直接在场景里写相对帧，元素会在出场时已经弹完，看不到入场动画。
- 每个场景都有持续运动（布景图案、豆子跳、推镜），全片不靠漂移补救也过 freezedetect。
- 真实素材：国会图书馆 Highsmith 合集是公有领域，JSON API 要带说明身份的 UA；Wikimedia 在云端被限流，Pexels / Pixabay 403。新闻截图用 Playwright 拒 cookie 后按 h1 位置裁。
- 封面别写成片撑不住的话：「AI 抢不走」改成「不容易被 AI 替代」（第二关只是短期安全）。
- 豆子名牌贴在肚子上（`NameTag y=-64`）：放在脚下会压进底部字幕区。豆子不说台词：说明文字用 `Sticker`，不用带尾巴的 `Bubble`，真人的话做成标了出处的转述卡。
- 示意图（走势线、柱子、计件、价格曲线）都加「示意」角标，数值关系要和旁白一致（例如两条线最后正好差 19%）。纵轴从 0 起算，不要截断放大差距；角标不能被判定词、印章盖住。
- 旁白只说资料能证明的：媒体标题里的归因要说「据报道」，不能安到公司头上；研究的口径（描述性、非因果）要讲出来。
- 「得 děi」不在 polyphones.py 的检查里，旁白一律写成「要 / 该」。印章、贴纸放好后都要出放大帧看一遍，不能互相压字。
`shared/console.tsx`：暗色控制台 / IDE 风（`THEMES.console`，深底 + 蓝色强调），super-agent 首用。`Shell` 画标签栏、状态栏（带运行时钟）、行号栏，并让网格、扫光、行号整场缓慢移动来过 freezedetect；`Head` / `Chapter` / `Win` / `Node` / `Wire` / `Packet` 等是通用零件，每期的 `scenes/common.tsx` re-export 后再加本期零件。

- 原文配图直接放进 `scenes/figs/` 用 `import x from './figs/x.png'` 引入（webpack 处理），放在 `Win` 窗口里当“原图”展示；重画的示意图要标“示意”，别和原图混。
- 多音字读音（`readings`）只给真有风险的词：「调用→掉用」这种同音替换会让 TTS 在词中间停顿，复核时听出来像吞字，宁可改写句子避开。
`spec-decoding/scenes/type.tsx`：打字特写 + 扁平结构图（v2）。上半屏是正在生成的那句话（`Sentence`，token 状态 draft / ok / bad / void / model / mask），下半屏是按论文原图重画的结构图（`Box`、`Stack`、`Arrow`、`TermS`）。`Page` 自带点阵漂移和整场下沉 12 px，所以白底结构图也过得了 freezedetect。

- 讲机制别套比喻世界：v1 的“工厂”多了一步翻译，观众看不清。直接画真实 token 和论文自己的结构。
- 每个模块写「中文 + 论文英文名」（草稿机 draft model、目标模型 target model、核对 verify）。
- 结构图对照论文原图逐条核：输入怎么进 embedding、最后一层怎么到输出头、哪些部件和目标模型共用 / 冻结、核对那一步和「落下的词 → 下一轮」的闭环。第一轮复核查出的必须改，几乎都是这几条漏画。
- 复核加一项「结构图对原图」，并给复核者一份每种方法必须画出的连接清单。
- 箭头别穿过文字：标签放在箭头的一侧，或者把箭头起点挪开；下标用 `<tspan dy>` 或 `<sub>`，别写 `h_k`。
`shared/evidence.tsx`：视觉调查 / 证据墙（lemo `visual-investigation`），qwen4-preview 首用。深色软木墙 + 镜头关键帧，证据是钉上墙的卡片（截图、文字卡、数字），每张卡盖一个章（官方 / 现场转述 / 社区代码 / 社区传闻 / 推断），下面一行写出处，红线把卡片连起来。适合前瞻、传闻核对这类要分清信息来源的题目。

- 卡片坐标都在 3840×2160 的墙面坐标里；`Wall` 的 `cams` 写「第几拍时墙上哪个点在画面中心、缩放多少」，镜头在拍前 26 帧开始移动、拍开始时到位。镜头一直有缓慢推近和横移，长句停留也不会被判静帧。
- 先按内容的包围盒算镜头：要读的卡片宽度 × z 在 1500 px 左右；底部 120 px 留给字幕，重要内容别放进去。第一次按感觉写的镜头大半偏到左上，按包围盒重算后才正。
- 印章不能用 `mix-blend-mode: multiply`：落在深色墙上会被吃成黑色，只有在白卡片上才看得见。
- 截图按段落裁（Playwright 找到包含关键词的 `p`/`li`，用 `fullPage` 坐标截），比整页截图再手工裁可靠；X / Reddit 要登录截不到，改成文字卡并在出处里写明。


`shared/distill.tsx`：Distill 博客风（白底 + 绿色高亮笔、Source Sans 3 + 思源黑体），weight-space-programming 首用。原文的交互图（Setup 表、Prompt 卡、推理逐条亮起、Answer 条、表格）都有现成组件，图上的数字从原文的 JSON 资源和开源日志现算（见那期的 `scenes/data/build.py`），不手抄。

- 白底上点阵很淡，原先的漂移量（0.35 px/帧、整场下沉 10 px）不够，freezedetect（n=0.0005 d=0.5）查出几十处；现在是 0.6 px/帧、点更深一点、整场下沉 22 px，13 分钟成片 0 处。半透明白色蒙层（结论卡压在前面的内容上）会把点阵也盖掉，蒙层别用满不透明。
- 给小白讲的那一期，两轮审片的大头都是“没解释的术语”和“比原文更绝对的说法”（只能 → 基本、不会 → 不容易、在这个例子里）。写稿时就过一遍：每个英文词或行话第一次出现有没有一句白话，原文的 most / can / about 有没有丢。
- 原文场景里有方向的（小车先往右倒车再往左冲），箭头照原文的 JSON 关键帧核对，别凭直觉画。
- 两张并排的格子图（Astra 读的 vs 实测）一张有表头一张没有时会错开一行，读者会以为没对上；没表头的那张补同高的空白。

## 竖屏（抖音 / 小红书 / 视频号）

`shared/popflat.tsx`：扁平动态图形（电光蓝底、大色块、粗黑体、放射光、彩色碎片、冲击环），claude-code-diet-shorts 首用。

- `meta.width: 1080`、`meta.height: 1920` 即竖屏：引擎把字幕抬到底部文案区上方（约 y 1330，宽 ≤ 840），字幕按 15 字宽断句（`meta.sub_max_w` 可改），`covers.mjs` 出 9:16、3:4、6:7 三张封面。
- 关键画面放在 `SAFE`（x 100–960、y 330–1290）：视频号早期按 6:7 显示竖屏，上 230 px 是导航，下 440 px 是标题和文案，右侧中下部是点赞按钮。平台没有官方安全区规范，首片要传私密视频在手机上看一下。
- 开头 5 秒要把核心信息说完、画面上也要有；冲击音效写在 `meta.sfx`（`at: "<场景>:<帧>"`，pop / whoosh）。
- `Stage` 每帧转放射光、飘碎片、整场推镜 1.5%，保证没有静帧。推镜别再加大：满宽卡片（x 100–960）推 3% 会漂出安全线。`useSub()` 按字幕分段给帧数，比按拍更细，适合「一句话里先后出现」的元素。
- 字幕一行放不下时，引擎会在中间附近断一次：优先断在空格、逗号或引号后，其次断在词边界，不会拆开「Claude Code」或「命令」。改旁白时要留意分段数：结尾不足 5 个字宽的分段会并进上一段，`sub(b, i)` 的序号会跟着变（「达标就停」会被并掉，所以写成「达标了就停」）。
- 第一轮审片常见的必须改：画面上的标签挂错主语（片头纸条写的是用户的规矩，却挂在「Claude Code 自己的提示词」下面）；落下来的纸条、飞过的证据纸、回环箭头压住要点字；画面比旁白早 2 秒以上说出答案（标题里的文件名、合并后的结论卡）；自报数据没写「官方自报」。
- `review_sheets.py` 对竖屏输出一行四张 540×960 的小图，不再把竖帧压扁。

`shared/particles.tsx`：数字粒子（黑底、真实权重数字做的雨、薄荷绿发光字、数字粒子从四周飞进来拼成形状），weight-space-programming-shorts 首用；动效借 kinetic-reel 的粒子聚形、lemo-opuscar 的 HUD 锁定框和扫描线。

- 面向非技术观众的竖屏：每段先翻特效库（`.claude/skills/README.md`），在方案里写清楚每段借哪个效果；文案只用白话，数字配一个看得见的对比（柱子冲上去、格子一片变绿）。
- `Field` 每帧滚数字雨、整场推镜 1.8%，冻帧检测 n=0.0005 d=0.5 为 0。粒子用 `Swarm`（`to` 给目标点，`out` 让它们散开），文字要压在粒子上时给文字垫半透明黑底。
- 横屏那期的图（游戏 GIF、热力图、小车、MinAtar 回放）直接从 `../weight-space-programming/scenes/common` 引，不复制数据；浅色的原图放进深色 `Panel` 里当“屏幕”。

`shared/stylemix.tsx`：分场换风格的工具箱，agent-manager 首用。九套 `mx-*` 主题共用一套动效（`rise` / `slideX` / `Drift` 慢推镜）：瑞士排版（米白 + 红色竖条）、象形图标、案卷（牛皮纸夹 + 纸页 + 印章）、终端（`TermWin` + 逐字打出的 `TLine`）、蓝图（`BpBox` 描边画出、`Draw` 画线）、软木板（`Note` 便签）、战术板（`PitchBg` + `MarkerLabel`）、数据叙事、编辑排版（`OrgChart` 你 → agent 组织图）。

- 讲解篇可以按内容逐场换风格：先给每场 2–4 个候选画面让用户挑，再按挑中的组合写场景，每场一个文件按风格分组（见 agent-manager/scenes）。
- 配乐跟着画风换编曲：agent-manager/music.py 按 `STYLE` 表给每种风格一套写法，在每小节下垫一层很轻的弦乐 `bed`，避免鼓组空拍正好碰上句间停顿时出现近静音；script.yaml 里 `meta.bgm_db: -11`，人声比配乐高约 9 dB，听得清又不抢。
- 战术板、案卷这类有边框的画面，最后一行字离边框至少留 24 px；印章别压在下一行要出的字上。
