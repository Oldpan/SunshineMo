# 代码生成视频

画面、配乐、封面全部由代码逐帧生成。工作流程和经验写在 `.claude/skills/code-video/SKILL.md`。

```
video/
  core/                 跨系列通用，和风格无关
    gfx.py              字体（含霞鹜文楷、等宽、打字机）、缓动、paint、字幕样式（含墨迹晕开、滚动数字）、气泡/人物/圆环、粒子成字
    hand.py             手绘线条：会"抖"的下划线、圈注、箭头、勾叉、方框、星星、马克笔
    pixel.py            像素件：ASCII 精灵、Unifont 像素字、平滑文字碎成像素、CRT 开关机
    synth.py            合成器、鼓、lo-fi 套件（钢琴、弦乐、黑胶、磁带）、芯片音色（脉冲波、三角波、LFSR 噪声、琶音）、
                        爵士套件（低音提琴、刷子、ride）、转场和剧情拟音（嗖声、百叶窗、光圈、印章、打字机、雷声、图钉、断线）、
                        效果音、混音、导出 music.wav + sync.npz
    timeline.py         小节网格、段落、镜头和转场（含 iris / lens / blinds / wipe 遮罩转场）、段落配色混合、
                        磁带骤停的画面减速、Sync（音乐事件和包络）
    post.py             bloom（可染色）、暗角、色差、颗粒、故障切片
    pipeline.py         抽帧 / 片段预览 / 整片渲染，管道送进 ffmpeg
    cover.py            封面通用件：字距拉开的英文标题、存 PNG（可加颗粒）
    paths.py            脚本定位：从 template/ 或 episodes/<片名>/ 都能找到 core 和本系列的 style.py
  tools/                开发辅助
    sheet.py            把多张抽帧拼成总览图
    glyphs.py           缺字检查：脚本里的中文字体能不能画出来
  series/<系列>/        一个系列 = 一套视觉 + 音乐配方 + 叙事套路
    README.md           系列规范、配方、套路、集数表
    style.py            系列的背景、特效、后期合成、封面件
    template/           新一集的起步骨架（能直接跑通的 8 小节示例）
    episodes/<片名>/     每一集：music.py、render.py、cover.py、README.md
```

## 系列

| 系列 | 风格 | 集数 |
|---|---|---|
| [neon_science](series/neon_science/README.md) | 霓虹星云科普 vibe：电子乐卡点、无配音、字幕驱动 | 1 |
| [warm_journal](series/warm_journal/README.md) | 暖光手帐 lo-fi：纸张质感、手写字、钟表滴答卡点，偏情绪共鸣 | 1 |
| [pixel_theater](series/pixel_theater/README.md) | 像素小剧场：平滑场景配像素小怪，用小故事讲 AI 知识（演绎七、讲解三），每集换画风：星夜小屏、雨夜侦探…… | 2 |
| [explainer](series/explainer/README.md) | 讲透：把文章、论文讲清楚的中文讲解片，Qwen 配音，Remotion 画面（引擎是 article-to-video） | 0 |

每一集目录里都有 `video.yaml`（引擎、风格、交付清单），用根目录的 `./sm` 建、渲染、校验、上传 Drive，流程见 `.claude/skills/make-video/SKILL.md`。

## 两个引擎

| 想做的 | 系列 | 引擎 |
|---|---|---|
| vibe 短片、小剧场、卡点 MV：无配音，画面、音乐和字幕全由代码生成，60fps | neon_science、warm_journal、pixel_theater 或新系列 | `video/core/`（`engine: code`） |
| 把一篇文章、博客或文档讲清楚：要中文旁白、字幕跟着配音走，30fps | explainer | 子模块 `third_party/article-to-video`（`engine: narrated`，见 `third_party/README.md`） |

两种都由 `./sm` 驱动。想换第三方画风，看 `.claude/skills/README.md`。

## 环境

```bash
apt-get install -y libegl1 libgl1 ffmpeg fonts-wqy-zenhei fonts-inter fonts-unifont fonts-lxgw-wenkai
pip install numpy scipy skia-python pillow
```
