# 代码生成视频

画面、配乐、封面全部由代码逐帧生成。工作流程和经验写在 `.claude/skills/code-video/SKILL.md`。

```
video/
  core/                 跨系列通用，和风格无关
    gfx.py              字体、缓动、paint、九种字幕样式、气泡/人物/圆环、粒子成字
    synth.py            合成器、鼓、效果音、混音、导出 music.wav + sync.npz
    timeline.py         小节网格、段落、镜头和转场、Sync（音乐事件和包络）
    post.py             bloom、色差、颗粒、故障切片
    pipeline.py         抽帧 / 片段预览 / 整片渲染，管道送进 ffmpeg
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

## 环境

```bash
apt-get install -y libegl1 libgl1 ffmpeg fonts-wqy-zenhei fonts-inter fonts-unifont
pip install numpy scipy skia-python pillow
```
