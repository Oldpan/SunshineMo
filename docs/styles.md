# 风格总目录

这一页只做一件事：想做一条视频时，告诉你**有哪些风格、各在哪、怎么选**。每种风格的细节在它自己的文档或代码里，这里不重复。
2026-11-10 整理。新吸收一种风格，按文末「怎么登记新风格」在这里加一行。

## 开工前的顺序

1. **先问格式**：横版长篇，还是竖版短篇（竖版 9:16 做母版，关键内容放进 6:7 中带，发抖音 / 小红书 / 视频号）。
2. **选系列和引擎**（见下表）。有配音的讲解走 `explainer`，无配音的 vibe 短片走 `video/core`。
3. **问风格，不自己定**：
   - 一帧一理：每集开工前给 3–4 个画风让用户选，先出 20 秒测试再出整集。
   - 讲解篇：先出整片风格预选；再把脚本拆成场景，每个场景给 2–3 个候选（母版 + 最合适的插曲 + 备选，加上用户已批准的风格），做成选择页，用户逐场景定。候选清单读 `video/series/explainer/shared/scene-styles.yaml`。
4. 需要借第三方 skill 的做法时，查文末「第三方 skill 怎么选」。
5. 做完交付：Drive `video_from_opus/<名>/`，Notion 发布话题总表加一行。

## 一、系列（五个）

| 系列 | 引擎 | 是什么 | 画风怎么定 | 已做 |
|---|---|---|---|---|
| `explainer` 讲透 | narrated（article-to-video） | 把文章、论文、产品更新讲清楚，Qwen 配音，1080p30 | **按内容、按场景切**：下面的套件和插曲 | 15 期（含 3 个竖屏） |
| `quiet_concept` 一帧一理（**2026-11-10 起暂停，不再新做**） | code（video/core） | 无配音概念短片，lo-fi + 衬线字幕，深色底一束光，一个锚物件，约 150 s，60fps | **每集用户选**：水墨 / 蓝图 / 半调案卷 / 扁平卡通…… | 7 集 |
| `pixel_theater` 像素小剧场 | code | 用小故事讲 AI 知识，演绎七讲解三 | **每集换画风**：星夜小屏、雨夜侦探…… | 2 集 |
| `warm_journal` 暖光手帐 | code | 生活话题的情绪科普，纸张 lo-fi | 固定：暖色纸张、手写字 | 1 集 |
| `neon_science` 霓虹星云科普 | code | 心理学研究，电子乐卡点 | 固定：星云 shader + 九套段落配色 | 1 集 |

各系列的规范在 `video/series/<系列>/README.md`。

## 二、讲透的画面套件（`video/series/explainer/shared/`）

引擎自带四种画风：`flat`、`paper`、`pixel`、`crayon`（每个场景可在 `script.yaml` 单独指定）。下面是我们在它之上做的套件，每个都有一个「首次使用」的期数可以照着看。

| 套件 | 画面 | 适合讲什么 | 首次使用 |
|---|---|---|---|
| **`prodpage`**（新） | 产品页舞台：浅底点阵、白卡片随旁白长出、一个强调色；含开场海报、倒数榜单徽章 | 产品 / 功能介绍、流程、对比，几乎所有讲解的**母版** | 未用（参考集 20 条的共同母版） |
| `claudeblog` | 象牙底 + 陶土色，Claude 博客风 | Anthropic 官方文章 | fold-subagents、managed-agents |
| `stylemix` | 九套：瑞士排版、象形图、案卷、终端、蓝图、软木板、战术板、数据叙事、编辑排版 | 一期里分场换风格 | agent-manager |
| `console` | 暗色控制台 / IDE | 架构、代码、日志 | super-agent |
| `iso/` | 等距信息图 | 系统结构、数据流 | spec-decoding v1 |
| `whiteboard` | 白板马克笔手绘 | 概念推导、步骤 | claude-code-diet |
| `gameshow` | 综艺答题扁平卡通 | 问答、分关卡、真实新闻 + 照片 | ai-jobs-safe |
| `evidence` | 证据墙（软木 + 钉卡片 + 章） | 前瞻、传闻核对 | qwen4-preview |
| `distill` | Distill 博客风，绿色高亮笔 | 论文、交互图 | weight-space-programming |
| `editbay` | 剪辑台 | 视频生成技术 | kling-origin |
| `pixelplay` | 像素游戏关卡（竖屏） | 竖版、小白向 | kling-origin-shorts |
| `popflat` | 电光蓝扁平动态图形（竖屏） | 竖版、冲击感 | claude-code-diet-shorts |
| `particles` | 数字粒子（竖屏） | 竖版、非技术向 | weight-space-programming-shorts |
| `comicpop`（新） | 美漫波普：半调圆点、星爆、气泡 | 痛点、吐槽、产品突然出现 | 未用 |
| `notebook`（新） | 螺旋笔记本；黑板粉笔 | 引用原文数据；从零推导概念 | 未用 |
| `glass`（新） | 渐变玻璃卡 | 产品功能、模型对比、档位 | 未用 |

「新」的四个只渲染了样张核对版式，第一次用时按那期的场景再打磨。

## 三、分场风格插曲（讲解篇每场景的候选池）

母版 `prodpage` 占 60–70%，其余按内容换插曲。完整清单（每种的用途、不适合什么、一次最长多久、底纹怎么动）在 `shared/scene-styles.yaml`，拆解和配方在 [`reference/ai-news-explainer-style.md`](reference/ai-news-explainer-style.md)。

| 场景里在讲 | 首选 | 备选 | 套件 |
|---|---|---|---|
| 产品 / 功能介绍、开场 | 母版、`glass` | `poster` | prodpage、glass |
| 流程、架构、数据怎么流 | 母版、`iso` | `blueprint` | prodpage、iso、stylemix |
| 循环、迭代次数 | `pixel` | `console` | pixelplay |
| 规则、限制、额度、解锁 | `pixel` | `kraft` | pixelplay、stylemix |
| 参数、规格、API | `blueprint` | `console` | stylemix、console |
| 原文里的图表和数据 | `notebook` | `datajournal` | notebook、stylemix |
| 代码 / 日志 / 监控 | `console` | `pixel` | console |
| 痛点、吐槽、情绪 | `comic` | `crayon` | comicpop、引擎 crayon |
| 一堆案例、证据 | `kraft` | 母版、`evidence` | stylemix、evidence |
| 概念从零讲起、层层追问 | `chalk`、`whiteboard` | `notebook` | notebook、whiteboard |
| 一个数字撑起一页 | `poster` | `datajournal` | prodpage、stylemix |
| N 个用法 / 清单 | `ranking` | 母版 | prodpage |
| 温情、人的一面 | `crayon` | `mascot` + 母版 | 引擎 crayon |

规矩：同一种插曲不连着用两次；每个插曲 12–40 秒；底纹要持续微动（过 freezedetect）。

## 四、一帧一理的画风（系列已暂停，留作资料）

| 集 | 画风 |
|---|---|
| 1 老地方、2 谁先开口、3 会算数的马 | 默认：近黑深蓝底，一束光，一个暖色一个冷色 |
| 4 第一座山 | 中国水墨（lemo `ink-wash` 语法） |
| 5 回来的飞机 | 蓝图 |
| 6 老鼠尾巴 | 复古半调案卷 |
| 7 787 人猜牛 | 50 年代扁平卡通（lemo `midcentury-toon`） |
| 8 穿大猩猩服的人（**未完成**） | Risograph，只做到 24 秒试片（2026-10-31），没出成片，series README 也没列成集 |
| 候选，未做 | 靛蓝木刻星夜（点刻月亮、青海波纹，参考 Drive 的「郊游」），还可从 lemo 库挑 `one-line`、`swiss-motion`、`pictogram-motion` |

规范和起名规则在 `video/series/quiet_concept/README.md` 和 [`reference/vibe-knowledge-style.md`](reference/vibe-knowledge-style.md)。

## 五、第三方 skill 怎么选

六个第三方「用代码做视频」的 skill 不进 git，版本钉在 `skills/styles.lock`，会话开始自动拉到 `.claude/skills/`（`sh scripts/fetch_skills.sh` 手动拉）。

**原则：我们自己的引擎和套件是默认做法；第三方 skill 用来借做法，不当渲染管线。**

按这个顺序找：

1. **先看上面的套件和系列能不能做。** 能做就不碰第三方。
2. **想换画风，先看参考文档**：lemo-opuscar 的 59 种风格已整理成 [`reference/lemo-opuscar-library.md`](reference/lemo-opuscar-library.md)（含和我们系列的对应表、导演法和技术法）。绝大多数「借 lemo 的某个画法」到这里为止；已借过的有 gameshow、evidence、iso、一帧一理的水墨和扁平卡通。
3. **还不够再点名第三方 skill 看它的 SKILL.md**，选择表在 `.claude/skills/README.md`：

| skill | 擅长 | 什么时候想到它 |
|---|---|---|
| `lemo-opuscar` | 59 种成熟画风、导演法 | 已想好某种画风；数据 / 科普 / 产品新闻 |
| `huashu-art-motion`（花叔） | 36 种艺术风格 + 9 种解说动画语法 | 艺术史、名画穿越、文化题材；找动态排版和白板语法。目前没有哪一期直接用它渲染 |
| `animate` | math、cut-paper、crosshatch、pixel | 数学 / 算法 / 历史时间线，竖屏小故事 |
| `painted-animation` | 带角色表演的卡通、MV | 角色表演片、歌词 MV |
| `kinetic-reel` | 动感大字、粒子聚形 | 片头、showreel；粒子动效已借进 `particles` |
| `xilo-opus-video` | 先给三个方案 + 预览帧，再做 | 还没想好风格；复刻一条参考视频的手法 |

4. **要用它自己的渲染管线**：只在 `video.yaml` 写 `engine: skill:<名>`，做一次性的片子。
5. **借来的好画法要收编**：用顺了就写进我们的引擎（讲解片进 article-to-video 的 `renderer/src/lib/styles/` 或 `explainer/shared/`，代码片进系列 `style.py` 或 `video/core/`），不留在第三方目录。

## 六、参考资料索引

| 文档 | 内容 |
|---|---|
| [`reference/ai-news-explainer-style.md`](reference/ai-news-explainer-style.md) | 产品页母版 + 14 种风格插曲，拆自 Drive 参考集的 20 条 AI 新闻讲解（2026-11-10） |
| [`reference/vibe-knowledge-style.md`](reference/vibe-knowledge-style.md) | 无配音「Vibe 知识」概念短片，拆自比特新语 / AI进修生 6 条（2026-10-23） |
| [`reference/lemo-opuscar-library.md`](reference/lemo-opuscar-library.md) | lemo-opuscar 59 种风格、和我们系列的对应、导演法 / 技术法 |
| `.claude/skills/README.md` | 第三方 skill 逐个说明和按题材挑 |
| `video/series/explainer/README.md` | 讲透系列流程和每个套件的注意事项 |
| `video/series/explainer/shared/scene-styles.yaml` | 分场候选清单，出候选板时读 |

**参考截图**（看风格最直接）：项目文件夹 `风格参考截图/`，`按视频/` 每条参考视频一张 16 帧总览，`按风格/` 每种风格一张带出处的关键帧图。出候选板、做新场景前先对着看。

视频、封面、样张不进 git：成片在 Drive `video_from_opus/`，样张在项目文件夹。Drive `reference/` 是我们拆过的参考视频。

## 怎么登记新风格

吸收或做出一种新风格时，按这个顺序落地，别只留在聊天里：

1. 拆解和配方写成 `docs/reference/<名>.md`（样子、用在什么时候、配方、不要照搬的地方）。
2. 套件代码放 `video/series/<系列>/shared/`（讲解）或系列的 `style.py`（代码引擎）。
3. 讲解用的风格在 `shared/scene-styles.yaml` 登记一条（用途、不适合、最长多久、底纹怎么动、套件、状态）。
4. 在**本页**加一行（套件表或系列画风表），并把参考文档加进「参考资料索引」。
5. 第一次用到的那期，把「首次使用」填上，状态从 `new` 改成 `ready`。
