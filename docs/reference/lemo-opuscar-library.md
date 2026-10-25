# 参考风格库：lemo-opuscar（LemoLab · 59 种代码成片风格）

2026-10-25 通读 [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) @ `413a6bd`（AGENTS / DIRECTOR / TECHNIQUE / MY-STYLES / 风格目录），记下我们能借的东西。
仓库 251 MB（大头是样片静帧），**不进 git**：轻量入口钉在 `skills/styles.lock`，风格库本体由入口的 `scripts/setup.sh` 稀疏克隆到 `~/lemo-opuscar`（跟它的 main 走，不钉版本）。
skill 怎么调用见 `.claude/skills/README.md`；这里是**挑风格的全表**和**它的导演法、技术法里值得收编的部分**。

## 一句话

一个风格 = 一份固定的 `STYLE.md`（不变量：材质、配色、字体、运动、镜头语法、声音、本媒介独有的一招、坑）+ 一支样片。
用户只给风格和题材，其余（故事、结构、镜头、时长）全由导演自己定；**样片只学技术，绝不抄故事**。
所有画面是 `render(t)` 的纯函数，headless Chrome 逐帧截图；声音、字幕、检查脚本读同一份时间轴。

## 库的结构（找东西用）

| 路径 | 是什么 |
|---|---|
| `AGENTS.md` | 总入口：开场流程、风格全表、六步工作流 |
| `DIRECTOR.md` | 导演法：brief、对标、故事、treatment、声音、节奏、镜头、表演、交付自检 |
| `TECHNIQUE.md` | 技术法：管线、确定性渲染、时间轴、配音、配乐、混音、字幕、复查 |
| `MY-STYLES.md` | 把库里的风格改成自己的，或从空白建一个，存进 `~/lemo-my-styles/` |
| `styles/<slug>/STYLE.md` | 单个风格的不变量（11 节）；`DEMO.md` + `demo/` 是样片源码（`setup.sh demo <slug>` 才下载） |
| `core/render/` | `still.mjs` 出静帧、`video.mjs` 多进程渲染、`events.mjs` 导出事件、`readcheck.mjs` 阅读时长检查、`mux.sh` 合成 + 两遍 loudnorm、`sheet.py` 拼接触表、`srt.py` |
| `core/audio/` | `sampler.py`（免费采样库）、`pluck.py`（古琴 / 琵琶 / 三味线物理建模）、`sfx.py`（程序化拟音） |
| `core/tts/` | `tts.py`（Kokoro 英文）、`tts_zh.py`（edge-tts 中文，要联网）、`asr_check.py`（faster-whisper 逐字回听） |
| `styleboard/catalog.json` | 59 种风格的中英名、分类、样片一句话、用途、时长；下表就从它生成 |

## 59 种风格全表（按题材挑）

图鉴（每种都有样片）：<https://lemomo-ai.github.io/lemo-opuscar/>。点名时说中文名或 slug 都行。
59

### 剪辑与纪实 Edit & Documentary（8）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 字幕新闻 | `caption-news` | 美国一年死掉 130 万箱蜜蜂，总数却涨了 6%：静音也能看懂的新闻。 | Social news / Report explainers / Data shorts |
| 1920s 新闻影片 | `newsreel` | 1926 年报纸说查尔斯顿会跳坏膝盖，福特工人野餐会上的孩子照跳不误。 | History stories / Fads & eras / Anniversaries |
| 实时倒计时分屏 | `countdown` | 阿尔忒弥斯二号发射的最后一分钟，一秒不剪：格子从 1 开到 9，点火合成 1。 | Launches / Countdowns / Live events |
| 延时交响 | `city-symphony` | 纽约的一天：延时光河、踩着十六分音符的网格，1899 年和今天并排。 | City films / Music montages / Openers |
| 视觉调查 | `visual-investigation` | 新闻片、照片、证词和调查报告排上同一条时间轴，五路来源指向一处。 | Reconstructions / Fact-checks / Incident reports |
| 构成主义蒙太奇 | `kino-montage` | 帝国大厦的小册子写着建造者，工地实拍和老照片给出答案：每天 2,500 人。 | Industry histories / Milestones / Collective effort |
| 体育战术板 | `telestrator` | 半场 0–3，费内巴切 12 分钟连进三球：冻住画面、画线、分屏、射门图。 | Sports analysis / Match recaps / Coaching |
| 电视新闻包装 | `news-package` | 一周四条 AI 新闻，一整套电视台包装：串联单、标题条、翻牌价格表、规格卡。 | News round-ups / Bulletins / Market updates |

### 实证影像 Evidence Films（8）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 卫星简报 | `satellite-briefing` | 卫星照着地图去找咸海，找到的是沙漠；只有筑了坝的那一块回来了。 | Climate / News explainers / Geography |
| 工程简报板 | `briefing-board` | 一条河要架桥，四种桥型在一面简报墙上逐个受检，拍板的是桥下要过的船。 | Engineering / Option comparisons / Briefings |
| 点云测绘 | `lidar-survey` | 激光点云剥掉一片森林的树冠，露出当年农田的石墙：3.4 公里。 | Heritage / Environment / Site surveys |
| 白模投影 | `white-model` | 投影机把数据一层层刷上鹿特丹白模：从 1940 年的空洞到今天的塔楼。 | Urban planning / Exhibitions / City data |
| 数据实物化 | `data-physical` | 十二年风电和太阳能装机叠成实物，绕表盘升成两条螺旋，2021 年太阳能反超。 | Annual reports / Investor decks / Energy data |
| 产品拆解 | `teardown` | 开源键盘的一半在一次环绕中逐层拆开，看到主控再合拢，标上真实尺寸。 | Hardware launches / Product pages / Spec explainers |
| 显微叙事 | `microscope` | 一镜从肝组织玻片推到单个细胞核，两个圆逐像素数出 2.4 倍的蓝。 | Biomedicine / Materials science / Skincare science |
| 档案灯台 | `archive-lighttable` | 电报说最长飞了 57 秒；放大镜下，莱特兄弟的底片和档案说是 59 秒。 | Brand history / Archive stories / Museums |

### 手绘与绘画 Hand-drawn & Painting（7）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 蜡笔儿童绘本 | `crayon-book` | 月亮失眠了，小女孩爬上屋顶给它唱摇篮曲。 | Picture books / Bedtime stories / Kids' learning |
| 水彩笔刷 | `watercolor` | 跟着降雨从澳洲红色腹地一路画到绿色海岸，一镜到底。 | Nature documentary / Travel / Science explainers |
| 中国水墨 | `ink-wash` | 侠客踏水过江，一剑断流。 | Wuxia / Cultural brands / Poetry |
| 油画厚涂 | `impasto` | 灰色雨中广场，第一把红伞撑开，圆舞曲把整个广场刷上颜色。 | Music videos / Art & culture / Emotional ads |
| 一笔画 | `one-line` | 一根不离纸的线画完一个人的一生，再把笔交给孩子。 | Brand stories / Life milestones / Minimal ads |
| 白板讲解 | `whiteboard` | 手机怎么知道你在哪：GPS、原子钟，和相对论每天多出的 38 微秒。 | Explainers / Online courses / Science |
| 钢笔淡彩 | `urban-sketch` | 公园只是一张钢笔速写，风把草帽吹到哪里，哪里才有颜色。 | City & travel / Architecture / Lifestyle brands |

### 东方传统 East Asian Traditions（4）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 皮影戏 | `shadow-puppet` | 十日炙烤大地，后羿张弓射日。 | Myths & folklore / Heritage / Festivals |
| 浮世绘 | `ukiyoe` | 旅人走向远山，每个镜头都是一幅版画；巨浪是高潮，结尾是远山与整幅画轴拉远。 | Travel / Japanese culture / Poetry |
| 红色窗花剪纸 | `papercut-red` | 除夕年兽进村，小女孩剪出的大窗花照亮全村，把它吓跑。 | Lunar New Year / Festive greetings / Folk tales |
| 纸雕灯影 | `paper-lantern` | 一枚月饼讲中秋的团圆与思念，纸雕灯箱层层透光。 | Festivals / Gift brands / Cultural stories |

### 印刷与版画 Print & Printmaking（5）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| Risograph 孔版印刷 | `risograph` | 周日早晨骑车穿过城市：面包店、公园、河边，每到一处加一版油墨，最后三版套印。 | Indie brands / Zines / Lifestyle |
| 复古半调案卷 | `halftone-dossier` | 橘猫胖橘被立案审查：测试重力、凌晨跑酷，最后无罪释放。 | Humour / Pet content / Social shorts |
| 木刻版画 | `woodcut` | 村子用一整个冬天铸一口钟，钟声第一次响起，雪停了。 | Folk tales / Craft brands / Book trailers |
| 铜版画 | `engraving` | 一张博物志图版自己刻出来：雕刀推开铜版，蜜蜂一线线成形，最后手工水彩上色。 | Museum labels / Science explainers / Brand heritage |
| 丝印旅行海报 | `silkscreen-poster` | 三条步道各一张丝印海报，一色一刮印出来，再沿山脊一镜到底从正午爬到黄昏。 | Destination guides / Tourism / Event posters |

### 图形与排版 Graphic & Type（7）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 瑞士动态排版 | `swiss-motion` | 一张音乐会海报按瑞士设计的五条规则自己排版，第五条是只打破一条。 | Brand identity / Events / Design education |
| 60s 间谍片头 | `spy-titles` | 虚构 1964 年间谍片的片头：追一把被偷的钥匙，几何碎片最后拼成片名。 | Title sequences / Event openers / Trailers |
| 装饰艺术 | `art-deco` | 1930 年的大饭店，门童赶在午夜前把一封信送上顶楼。 | Luxury & hospitality / Galas / Invitations |
| 蓝图 / 工程制图 | `blueprint` | 发明家的蓝图自己画出一台接云机器，修订云线变成了真的雨云。 | Engineering / Hardware launches / Tech explainers |
| 彩色玻璃窗 | `stained-glass` | 阳光从清晨移到黄昏，照到哪一格花窗，哪一格的故事就动起来。 | Legends / Heritage / Holiday stories |
| 象形运动图形 | `pictogram-motion` | 2026 亚运会 43 个大项，几何象形人卡着节拍快闪。 | Sports events / Visual identity / Event openers |
| ASCII / CRT 终端 | `ascii-crt` | 月球基地的 AI 沉睡 40 年后被唤醒，用字符画出“家”来回复。 | Developer tools / Sci-fi / Tech brands |

### 信息与发布 Information & Keynote（5）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 数据叙事 | `dataviz` | 一百年的夏季气温，图表本身就是故事。 | Data journalism / Reports / Climate & science |
| 等距信息图 | `iso-infographic` | 一杯咖啡从种植园到你手里的旅程。 | Process explainers / Supply chains / Annual reports |
| 暗色科技发布 | `dark-keynote` | 虚构 app Tidy 的发布片：被埋掉的光标一键把几百个窗口归位。 | Product launches / SaaS / Keynotes |
| 活体实机录屏 | `living-screencast` | 像素小人 Clawd 搬进 Claude 应用，一镜到底演示 Plan 模式和自检。 | Product tutorials / Feature launches / Onboarding |
| 科幻全息界面 | `hologram-hud` | 电助力车被扫描成全息线框，目标框依次锁定电池、电机、刹车。 | Spec walkthroughs / Launch videos / Trade shows |

### 卡通与动画 Cartoon & Anime（4）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 1930s 橡皮管卡通 | `rubber-hose` | 一只咖啡杯满厨房追一块逃跑的方糖。 | Food & drink / Retro ads / Kids |
| 80 年代赛璐璐动画 | `cel-anime-80s` | 快递少女骑车穿过雨后霓虹都市，赶在黎明发射前送到一盘磁带。 | Music videos / Game trailers / Nostalgia |
| 科幻情景喜剧卡通 | `scifi-toon` | 厌世天才开传送门只想买杯咖啡，却穿过越来越离谱的平行宇宙。 | Comedy / Tech brands / Social shorts |
| 50s 扁平卡通 | `midcentury-toon` | 用 50 年代教育片的口吻，三步教你装好一台扫地机。 | Set-up guides / Help centres / How-to |

### 游戏 Games（4）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 16-bit 像素 RPG | `pixel-rpg` | 勇士在最终 Boss 门前存档，存档画面闪回一路冒险。 | Game trailers / Recaps / Nostalgia |
| HD-2D | `hd-2d` | 灯塔熄灭，孙女提着最后一簇火穿过夜林、爬上风暴悬崖。 | Game trailers / Fantasy / Story films |
| 微游戏快闪 | `microgame` | 见习宇航员闯五秒训练营，越来越快，Boss 关亲手降落回地球。 | Game trailers / Onboarding / Social shorts |
| 综艺节奏扁平 | `game-show` | 把 AI 发展史做成一局节奏游戏，模型踩着拍登场，最后发成绩单。 | Tech timelines / Year in review / Variety shows |

### 电影与时代 Cinema & Eras（2）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 1920s 默片 | `silent-film` | 面包店学徒追一个滚走的面包，最后掰成两半分给饿肚子的小女孩。 | Comedy / Retro brands / Silent storytelling |
| 后室 / 新怪谈 | `backrooms` | 新夜班员工拍下入职第一晚：无尽的黄色办公空间，和墙上的员工守则。 | Horror / Mystery & ARG / Game teasers |

### 材质与 3D Materials & 3D（5）

| 风格 | slug | 样片一句话 | 用途 |
|---|---|---|---|
| 积木玩具 | `brick-toy` | 积木宇航员用零件拼出火箭，飞向积木月亮。 | Toys & kids / Product builds / Space |
| 纸片立体书 | `paper-popup` | 立体书在书桌上打开，小精灵 Pip 在纸片世界冒险，最后跳出书外。 | Children's books / Game trailers / Story films |
| 移轴微缩 | `tilt-shift` | 玩具城的早高峰，一切都像模型。 | City promos / Real estate / Transport |
| 低多边形等距 | `lowpoly-island` | 空海里一格格长出小岛和村庄，每放一块响一个音符，直到星空。 | Game trailers / World building / Calm content |
| 玻璃质感产品 | `glass-product` | 虚构玻璃耳机 Aura 的开箱与特写。 | Product launches / Consumer tech / Beauty |

## 和我们系列的对应

先看我们自己的系列能不能做；下表是「想换个画风时先看哪几种 STYLE.md」。

| 我们的系列 / 场景 | 先看的 lemo 风格 | 借什么 |
|---|---|---|
| `explainer`「讲透」：技术文章、发布解读 | `dark-keynote`、`news-package`、`living-screencast`、`dataviz`、`iso-infographic`、`whiteboard` | 发布会式大数字卡、新闻包装的标题条和翻牌表、实机录屏的光标与放大镜（Kimi 那期就是发布页风） |
| `quiet_concept`「一帧一理」：无配音概念片 | `ink-wash`、`one-line`、`swiss-motion`、`pictogram-motion` | 留白、一笔成形当转场、声音里的「真静音」 |
| `pixel_theater`：像素小剧场 | `pixel-rpg`、`hd-2d`、`microgame` | 12 fps 角色 + 平滑镜头、时间轴驱动配乐和卡点检查 |
| `warm_journal`：暖光手帐 | `crayon-book`、`urban-sketch`、`watercolor`、`paper-popup` | 笔刷引擎（每笔按序号播种、按归一化弧长断墨，避免逐帧闪） |
| `neon_science` | `hologram-hud`、`ascii-crt`、`spy-titles` | CRT / 全息后期、片头排版 |
| 数据、科普、产品新闻（暂无系列） | 实证影像 8 种、剪辑与纪实 8 种 | `FACTS.md` 逐条记来源；真实素材先找再写 treatment |

## 导演法：值得收编的规则

按它的说法，评判顺序是**声音、节奏、镜头、导演**，好看的帧只是起点。

1. **先对标再动笔。** 为本片（不是为风格）挑 1–2 部参考作品，写下「学什么 / 不学什么」。这一步对质量的提升比任何规则都大。
2. **Treatment 先写三个结构候选**（一段旅程、前后对比、倒计时、会反转的清单……），选一个并写理由；开场画面、结尾、配乐走向都从题材里来，「这个风格第一个想到的点子」通常就是它的套路。
3. **故事**：一个主体、一个目标、一次转折；**前 3 秒必须有钩子**（不许慢慢亮 logo）；结尾回扣开场；全片放**一个只有这种媒介能做的动作**（折纸变转场、墨晕成下一场），放在情绪顶点。
4. **声音是半部片**：每个可见动作都有声音且贴材质；氛围 / 拟音 / 音乐三层，对白和关键拟音时压音乐；**至少两次真静音**，静音后的第一声是全片最重要的声音之一；**至少两次 J-cut / L-cut** 用声音转场；不要万能的钢琴 + 弦乐。
5. **节奏**：先写 cue map（速度、小节网格、每段配器、每个切点落在哪一拍），画面锁到网格上，脚本检查每个卡点（目标 0 ms）；必须有快慢交替、一次明显加速或减速、一口「喘气」的长镜头。
6. **阅读时长**（可直接搬进我们的检查）：
   - 字幕至少 1.8 s，且不短于这句话的语音 + 0.6 s；
   - 文字入场完后再停留：中文约 **字数 ÷ 4.5 + 1.5 s**，英文约 字母数 ÷ 15 + 1.5 s；
   - 标题卡至少 4 s；要快就每屏少放字，不是在观众读完前切走。
7. **镜头**：至少四种不同运镜和真正的景别变化（2D 也有推拉、视差、焦点转移、画中画）；一个让人记住的招牌镜头；转场用媒介自身做，全片一套语法，不用默认淡入淡出；关键时刻主体至少占画面高度三分之一。
8. **最常见的失败**：主体太小或贴边；太暗或同色叠同色；字幕盖住主体；笑点 / 失败太快看不懂；转场里出现空白帧；镜头动了以后跟随效果没跟上（所有跟随都走同一个 world→screen 函数）。
9. **交付前**：接触表两遍 + 关键动作 0.2 s 帧条 + 带声音全速看一遍；**只修一轮**，修完再查一次；拿最终片和样片比六项（结构、开场、招牌镜头、运镜路线、配乐走向、结尾），**至少四项不同**。

## 技术法：值得收编的做法

- **画面是时间的纯函数**：页面暴露 `DUR`、`render(t)`、`READY`，可选 `EV`（声音事件）和 `TEXTS(t)`（当前可见文字及包围盒，给阅读检查用）。不用 `Date.now()`、不用无种子随机、不从上一帧带状态，所以任何帧都能单独、乱序、多进程渲染。我们的 `video/core` 已经是这个思路，`TEXTS(t)` 这种「把屏上文字交给检查脚本」的接口值得补上。
- **一份时间轴驱动一切**：段落、BPM、拍数、命中点放在一个文件，导出 JSON 给配乐、混音、字幕和检查共用。
- **渲染快的三个原因**：JPEG 截图、每个 worker 一个浏览器、**颗粒在 ffmpeg 里加**（画在页面里会让每帧都无法压缩）。
- **角色 12 fps 步进，镜头和光每帧平滑**；步进的镜头看起来像卡顿。
- **混音**：TTS 峰均比高，先压缩人声再按 RMS 平衡，人声比音乐高约 10 dB；合成配乐容易低频过重，混完按频段量，20–120 Hz 相对其余约 −3 dB，MIDI 48 以下不放铺底音，低音加 2、3 次谐波让小喇叭也听得见；成片两遍 loudnorm 到 **−14 LUFS** 并限制真峰值。
- **配音**：数字在 TTS 文本里写成汉字、字幕里写成阿拉伯数字；每句回听转写，中文短句错一个字正常，听过没问题就把模型听到的写进该句的 `asr` 字段。
- **字体**：中文用 Google Fonts CSS API 的 `&text=` 只取用到的字，下载到项目里用 `@font-face`，渲染时不连网。
- **素材授权**：只用 CC0 / CC BY / OFL，逐项写进 `CREDITS`；陈述事实的片子有 `FACTS.md`（每条主张的来源链接和原文）。
- **3D**：three.js r170 + GPU；`core/three/post.js` 只适配透视相机，换正交相机要把深度换成 `orthographicDepthToViewZ`，否则景深悄悄失效。
- **代码角色**：肩部先外展再前屈（反过来举手会交叉成 X）；抬手时肩带上提前移；手臂与躯干重叠处不描边，不然关节像木偶缝。

## 「改成我们自己的风格」的做法（MY-STYLES）

把 STYLE.md 的章节分三组，和用户商量时照这个分：

| 组 | 章节 | 意味着 |
|---|---|---|
| 放心改 | 配色（在原逻辑内）、字体、运动节奏、声音配器、换一个独有动作 | 风格还是它自己 |
| 会改变性格 | 材质与渲染、配色逻辑本身、镜头语法 | 能改，但要说清失去什么 |
| 不能改 | 本质（及「它不是什么」）、引擎 | 那是另一种风格，换个更近的底 |

每次决定记一行 `CHANGES.md`（章节、原来、现在、为什么），先出一张定风格帧（原版和新版左右对比）再做试片。
**我们的落点**：用顺了的画风按 `.claude/skills/README.md` 的「画风用顺了就收编」写进我们的引擎（讲解片进 article-to-video 的 `renderer/src/lib/styles/`，代码片进系列 `style.py` 或 `video/core/`），不放 `~/lemo-my-styles/`。

## 在我们这里用它要改的地方

- **配音**：中文不用它的 edge-tts，用我们的 Qwen `qwen-longanhuan`（article-to-video `synth.py`，DashScope 走代理），ASR 用 `ATV_ASR=dashscope`；把逐句时长交给它的时间轴。
- **交付**：它的交付清单（mp4、poster、srt、TREATMENT、CREDITS、build.sh）留在本集目录作源码；视频和封面照样 `./sm publish` 上 Drive，`介绍和文案.md` 和封面规则按我们的。
- **署名**：库自带样片外的成片不带 LemoLab 署名；交付前 `grep -rniE "lemo ?lab|opus 5\.5" <集目录>` 应为空（`LICENSE` / `CREDITS` 除外），并看一眼最后几秒。若直接复用它的样片或静帧（CC BY 4.0），要署名 LemoLab。
- **云端**：Node 22、ffmpeg 6.1、Python 3.13 都在；`setup.sh deps` 约 350 MB，第一次几分钟。`deps voice` 里的 kokoro-onnx 要 Python < 3.14（脚本优先找 3.12），我们不需要它的 TTS 可以不装。3D / 着色器重的风格要 GPU，云端只能慢慢跑或挑 2D 风格。
- **默认值不同**：它是 1920×1080、24 fps、30–60 s；我们的代码片默认 60 fps、2–4 分钟。用它的风格时以本集 `video.yaml` 和用户要求为准，`STYLE.md` 里写死的帧率优先。
