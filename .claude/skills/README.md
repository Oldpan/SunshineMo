# 视频风格 skill 索引

这里索引 6 个第三方「用代码做视频」的 Claude Code skill（来自 5 个仓库，opus-video-skills 一个仓库里有两个）。
它们**不进 git**：版本钉在 `skills/styles.lock`，由 `sh scripts/fetch_skills.sh` 拉到 `.claude/skills/<名字>/`（云端会话开始时 hook 自动拉）。
拉下来以后按名字点名或用 `/<skill 名>` 调用；如果本次会话没自动加载，直接读 `.claude/skills/<名字>/SKILL.md` 照做即可。

本仓库自己的两个引擎仍是**默认做法**（入口 `./sm`，见 `make-video` skill）：讲解片走 `explainer` 系列（article-to-video），vibe 短片 / 小剧场走 `video/core`。
下面这些 skill 主要用来**借做法**：先出方案、定画风、拆参考视频；真要用它们自己的渲染管线，只在 `video.yaml` 里写 `engine: skill:<名字>` 做一次性的片子。

## 先按题材挑

| 视频题材 / 需求 | 首选 | 备选 |
|---|---|---|
| 技术文章、论文、产品更新的中文讲解（有口播） | `explainer` 系列（article-to-video） | `huashu-art-motion`（9 种解说动画语法，3b1b/Kurzgesagt/Vox/白板） |
| 艺术史、名画、文化穿越、「同一场景换 N 种画风」 | `huashu-art-motion` | `lemo-opuscar`（浮世绘、油画厚涂、木刻、敦煌等） |
| 指定一种成熟画风的短片（油画、水彩、浮世绘、剪纸、像素 RPG、黑白默片……） | `lemo-opuscar`（59 种风格库） | `animate` |
| 数据解说、科普纪实、卫星/档案素材、产品拆解 | `lemo-opuscar`（实证影像、剪辑与纪实类风格） | `huashu-art-motion`（财经图表语法） |
| 数学/算法讲解、历史时间线、小故事（竖屏短视频） | `animate`（math、cut-paper、crosshatch、pixel） | `huashu-art-motion` |
| 带角色表演的卡通短片、音乐 MV、歌词 MV（卡拉 OK 字幕） | `painted-animation` | `animate`（cut-paper） |
| 作品集 showreel、产品发布片头、动感大字排版 | `kinetic-reel` | `xilo-opus-video`（界面动效方案） |
| 还没想好风格，想先看几个方案再定 | `xilo-opus-video`（三个方案 + 预览帧，确认后再做） | `lemo-opuscar`（帮你挑风格） |
| 照着一条参考视频复刻手法 | `xilo-opus-video` / `huashu-art-motion`（拆解复刻） | `animate`（从参考图提炼新风格） |
| 已有 AI 生成的绿幕人物，要用代码搭场景 | `xilo-opus-video` | — |

## 逐个说明

### huashu-art-motion（花叔 · 艺术动画）

- **视觉风格**：36 种已实做的艺术风格（洞穴岩画、埃及壁画、梵高、莫奈、修拉点彩、水墨写意、包豪斯、波普、8-bit 像素、蒸汽波、新海诚光影、吉卜力水彩、敦煌……）+ 17 种研究配方；9 种解说动画语法（3b1b、Keynote UI、财经图表、Kurzgesagt、Vox、白板、Storytime、动态排版、真人口播讲解）。总表在 `huashu-art-motion/references/风格配方/INDEX.md`，每种标了质量星级和短板。
- **最适合**：艺术史速通、名画穿越、文化类题材；也能把「材料层」风格（梵高笔触、水彩、波普网点等）盖到任何题材上。自带口播整片参考代码和交付检查（`scripts/deliver.py`）。
- **调用**：`/huashu-art-motion`，或直接说「用花叔的艺术动画 skill，做一支梵高风格的……」。
- **注意**：样片都是同一个房间构图，做新题材要重新构图（INDEX.md 开头有说明）；研究配方未过质量线，别当成熟风格用。
- **来源**：[alchaincyf/huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion) @ `8a0d7d7` · MIT。内置字体为 Noto / 霞鹜文楷（OFL）。

### lemo-opuscar（LemoLab · 59 种风格库）

- **视觉风格**：59 种成片风格，分 2D / 2.5D / 3D：油画厚涂、水彩、浮世绘、水墨、木刻、版画丝网、彩色玻璃、剪纸、皮影、纸灯笼、积木玩具、80 年代赛璐璐、像素 RPG、HD-2D、低多边形、白模、移轴、蓝图、ASCII CRT、黑白默片、新闻纪录片、间谍片头、瑞士风格、Dark Keynote、卫星简报、激光扫描、产品拆解、可视化调查等。图鉴：<https://lemomo-ai.github.io/lemo-opuscar/>
- **最适合**：已经想好一种明确画风的短片；数据解说、科普纪实、用真实档案素材剪新闻片；想把某个风格改成我们自己的风格并存下来。
- **调用**：`/lemo-opuscar`，或说「用 lemo-opuscar 的浮世绘风格做……」「有哪些风格？」。
- **注意**：这里只装了它的轻量入口。第一次运行 `scripts/setup.sh` 会把风格库稀疏克隆到 `~/lemo-opuscar`（需要能访问 GitHub），依赖装在那边。它的风格按 Opus 5.5 调过。
- **来源**：[lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) @ `3961ddb` · 代码 MIT；样片视频和静帧 CC BY 4.0（复用样片须署名 LemoLab）；三段第三方配音不可复用。用它做出来的片子归我们自己。

### animate（cth9191）

- **视觉风格**：单个 `<canvas>` 程序化绘制 + 合成配乐，自带 7 种风格：cut-paper（撕纸拼贴、带脸的角色）、crosshatch（抖动墨线排线）、riso（三色孔版印刷错版）、sketchbook（铅笔速写本 + 一种强调色）、math（manim 式黑底数学讲解）、isometric（等距产品线稿）、pixel（低分辨率年代像素）。也能从你给的参考视频/图片测量出新风格。
- **最适合**：一两分钟内的讲解、历史、小故事，尤其是竖屏短视频和数学/算法讲解；想按参考图对齐出一种新画风。
- **调用**：`/animate 主题 [风格或参考]`，例如 `/animate 傅里叶变换 math`。流程是先问需求，再三次确认（故事、画面、分镜）才开做。
- **注意**：需要 Node 18+、Playwright Chromium、ffmpeg；有配音时用 faster-whisper 对齐词时间。
- **来源**：[cth9191/animate](https://github.com/cth9191/animate) @ `7e5eb56` · MIT。

### painted-animation（tuzhechen2005）

- **视觉风格**：p5.js + p5.brush 手绘水彩 + 抖动墨线的卡通，角色（Clawd 或任意角色）有表情库和动画原理表演。
- **最适合**：带角色的动画短片、搞笑小剧场、音乐 MV、逐字卡拉 OK 字幕的歌词 MV、循环 GIF。
- **调用**：`/painted-animation`，或说「做一个 Clawd 的水彩卡通……」。
- **注意**：节拍检测要 Python + numpy；`template/` 衍生自 John Heibel 的 ClaudeAnimationBase（MIT）。
- **来源**：[tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) @ `59744a6` · MIT。

### kinetic-reel（tuzhechen2005）

- **视觉风格**：黑 / 奶油 / 荧光绿配色的动态排版：窄体超大字、HUD 小字标注，叠 three.js 生成层（粒子地形、液态大理石、铬金属扭结、可聚形的粒子云），形状连贯转场，配乐按节拍和画面卡点合成。
- **最适合**：作品集 showreel、产品宣传片、发布会片头、年度回顾这类高能量短片。
- **调用**：`/kinetic-reel`，或说「做一支 kinetic typography 风格的产品片」。
- **注意**：渲染器会自动找 Playwright 的 Chromium，也可用 `CHROME_PATH` 指定。
- **来源**：[tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) @ `59744a6` · MIT。

### xilo-opus-video（Kianzzz）

- **视觉风格**：不固定，按需求从 Canvas、HTML/CSS/SVG、WebGL 着色器、Three.js、Remotion、HyperFrames、Manim 里组合。常见方案：界面动效（弹簧动画）、像素卡带 + CRT 着色器、一笔线描一镜到底。
- **最适合**：还没定风格时先出三个拉开差异的方案和预览帧，确认后写 `brief.md` 再做；产品宣传、功能演示、复刻参考视频、给绿幕人物搭场景。
- **调用**：`/xilo-opus-video`，或说「用代码做个视频，先给我三个方案」。
- **来源**：[Kianzzz/xilo-opus-video](https://github.com/Kianzzz/xilo-opus-video) @ `f2cd828` · MIT。

## 和本仓库的引擎怎么配合

- **优先借做法**：开工前想换画风，按 xilo-opus-video 的做法先出三个拉开差异的方案和预览帧，确认后再写 brief；分镜按 animate 的「故事 / 画面 / 分镜」三次确认；解说语法参考 huashu-art-motion 的 9 种语法和它的交付检查清单。
- **画风用顺了就收编**：讲解片的画风写进 article-to-video 的 `renderer/src/lib/styles/`，代码短片的写进系列的 `style.py` 或 `video/core/`，再在下面的表里登记。不要直接改第三方文件。
- **要用 skill 自己的管线**：先用 article-to-video 的 `synth.py` 出 Qwen 配音和逐句时长，再把时间轴交给 skill 的场景代码，或把它渲出的片段当素材；交付照样走 `./sm publish`。

## 已收编到我们引擎的画风

| 画风 | 来自 | 在哪 |
|---|---|---|
| （暂无） | | |

## 更新与维护

```sh
sh scripts/fetch_skills.sh           # 按 skills/styles.lock 拉取缺的或版本不对的
sh scripts/fetch_skills.sh --force   # 全部重拉
sh scripts/fetch_skills.sh latest    # 拉各仓库最新版并改写锁文件；之后更新本页的来源行
```

每个 skill 目录里保留了上游的 `LICENSE`。
