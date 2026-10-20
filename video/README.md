# 代码生成视频

画面、配乐、封面全部由代码逐帧生成。工作流程和经验写在 `.claude/skills/code-video/SKILL.md`。

```
video/
  core/                 跨系列通用，和风格无关
    gfx.py              字体（含霞鹜文楷）、缓动、paint、字幕样式（含墨迹晕开、滚动数字）、气泡/人物/圆环、粒子成字
    hand.py             手绘线条：会"抖"的下划线、圈注、箭头、勾叉、方框、星星、马克笔
    synth.py            合成器、鼓、lo-fi 套件（钢琴、弦乐、黑胶、磁带）、效果音、混音、导出 music.wav + sync.npz
    timeline.py         小节网格、段落、镜头和转场、段落配色混合、Sync（音乐事件和包络）
    post.py             bloom（可染色）、暗角、色差、颗粒、故障切片
    pipeline.py         抽帧 / 片段预览 / 整片渲染，管道送进 ffmpeg
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

## 环境

```bash
apt-get install -y libegl1 libgl1 ffmpeg fonts-wqy-zenhei fonts-inter fonts-unifont fonts-lxgw-wenkai
pip install numpy scipy skia-python pillow
```
