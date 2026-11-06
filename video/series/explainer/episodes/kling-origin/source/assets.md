# 画面里的素材（文件在 assets.nosync/，不进 git；成片后传到 Drive 的 素材/ 子目录）

| 文件 | 内容 | 来源 | 授权 / 说明 |
|---|---|---|---|
| tos_bridge.mp4 | 《Tears of Steel》运河桥镜头，片中 31.5–37.5 秒，1920×800 裁成 16:9 全屏 | https://archive.org/download/Tears-of-Steel/tears_of_steel_1080p.webm （Blender Foundation） | CC BY 3.0，片中署名「素材：Tears of Steel（CC BY 3.0 · Blender Foundation）」；只用画面，原声不用 |
| tos_px12/30/60.mp4 | 同一段画面按 12 / 30 / 60 px 方块像素化（ffmpeg 先缩小再最近邻放大） | 由 tos_bridge.mp4 生成 | 同上 |
| whale_wave / dance1 / dance2 / still / report.png | 鲸鱼娘 5 个动作（挥手、举双手跳舞、剪刀手跳舞、立正冒汗、抱报告），白底抠成透明 | 千问图像模型生成：qwen-image-3.0-pro 出挥手原图，qwen-image-2.0-pro 以原图为参考改动作 | 用户要求的 DeepSeek 社区吉祥物「鲸鱼娘」形象（蓝色渐变长发、鲸鳍发饰、女仆装、鲸鱼尾巴），为本片新画的 Q 版 |

抠图：白色连到画面边缘的区域设为透明，边缘 2 px 按亮度羽化并去掉白边（scratchpad 里的 cutout.py，逻辑很短，需要时照这个思路重写即可）。
