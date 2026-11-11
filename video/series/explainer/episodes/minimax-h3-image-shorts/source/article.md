# 出处：MiniMax H3-Image 官方资料（2026-11-10）

复核只认这份资料。

## 1. 官方博客《MiniMax H3-Image 开源：让 4K 图像生成进入 10 秒时代》
https://www.minimax.cn/blog/minimax-h3-image

模型
语言模型
MiniMax M3.1 Flash
MiniMax M3
视频&图片
MiniMax H3
MiniMax H3 Image
语音&音乐
MiniMax Speech 2.8
MiniMax Music 3.0
API
M Plan
MiniMax Code
研究
关于我们
公司介绍
新闻
投资者关系
加入我们
EN
登录
MiniMax Code
API 开放平台
登录
MiniMax Code
API 开放平台
模型
语言模型
MiniMax M3.1 Flash
NEW
MiniMax M3
NEW
视频&图片
MiniMax H3
NEW
MiniMax H3 Image
NEW
语音&音乐
MiniMax Speech 2.8
NEW
MiniMax Music 3.0
NEW
API
M Plan
MiniMax Code
研究
关于我们
公司介绍
新闻
投资者关系
加入我们
English
MiniMax H3-Image 开源：让 4K 图像生成进入 10 秒时代
2026-11-10
今天，我们正式发布 MiniMax H3-Image 并开放权重。这是一款衍生自 H3 的图像生成模型，其具备文本生成图像、图像参考和图像编辑能力。它能够在 10 秒内生成一张 4096 x 4096 像素、约 16 MP（4K）的高分辨率图像，同时呈现丰富、真实的细节，并具备优秀的指令遵循和多参考图理解能力。
在 H3 预训练赋予的广泛图像能力基础上，H3-Image 进一步强化了整个后训练链路，在数据、强化学习、步数压缩、PE、部署优化等方面做了许多扎实的工作，这些工作的组合使得 MiniMax H3-image 
同时
具备了
速度、画面质量、指令遵循三个方面的竞争力
：
相比于主流的一百万像素或者四百万像素，一千六百万像素（4K，4096×4096）的图片在细节上具备显著优势。MiniMax H3-Image 可以在 10s 内生成 4K 的高规格图像，速度可达市面主流水平的 5 倍。
这使得 4K 的日常创作成为可能。
画面细节和真实感可以显著拓宽模型的使用范围。有别于常见的“AI 感”，H3-Image 能够提供丰富的画面细节和极强的真实感。
我们希望进一步缩小 AI 生成图像与真实视觉世界之间的距离。
指令遵循能力可以提升创作的上限：高质量的图像生成，不只是让画面好看，更重要的是让创作者能够表达和实现自己的意图。
我们提供了开源模型中最强的指令遵循能力并最多支持 16 张参考图片。
为了促进开源社区的繁荣和技术的共享，也为了方便创作者自由定制独特的模型，我们同 H3 一样坚持
开放权重
的策略。我们希望 MiniMax H3-Image 能变成图像生成领域缩小开源模型与顶尖闭源模型差距的起点，也期待看到更多开发者、创作者和研究者加入，一起探索下一代视觉创作的可能性。
除了开放模型权重，我们还通过 
MiniMax 开放平台、MiniMax Code
 和 
MiniMax 海螺
，提供稳定、高质量的 H3-Image 图像生成服务。在生成速度上，H3-Image 标准模式的速度是市面上主流工具的 1.5-2 倍，Highspeed 模式则可达到 3–4 倍，显著提升创作效率。与此同时，H3-Image 的价格仅为同档位主流工具的 50%–70%，让高质量图像生成更具性价比。
为了让更多用户体验高质量图像生成能力，
我们将在发布首周，针对 4K 及以上规格的生成请求，提供官方价格的五折优惠。
Hugging Face: 
https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
API: 
https://platform.minimax.cn/docs/guides/image-generation
MiniMax Code: 
https://code.minimax.cn/about
希望 H3-Image 能够给更多人的日常生活、工作带来便利，我们也会持续构建更强有力的工具来帮助普惠 AGI 的实现。
Intelligence with Everyone.

### 博客配图 1：不同清晰度下的模型耗时对比（P50，单位秒，数值越低越快）

文生图 4K（4096×4096，16MP）：H3-Image 标准版 16.0；H3-Image Highspeed 10.3；Nano Banana 2.1 thinking·medium 50.0；Nano Banana 2.1 thinking·high 51.0。
文生图 1K：标准 10.6，Highspeed 7.7，Nano Banana 2.1 medium 17.0 / high 20.0，GPT-image 2.5 medium 14.0 / high 27.0，GPT-image 2.6 medium 9.0，Seedream 5 Pro 34.4。
文生图 2K：标准 10.5，Highspeed 7.6，Nano Banana 2.1 28.0 / 31.0，GPT-image 2.5 21.0 / 36.0，GPT-image 2.6 10.0，Seedream 5 Pro 54.2。
图像编辑 1 张输入图 4K：标准 18.2，Highspeed 12.5，Nano Banana 2.1 48.0 / 54.0。图像编辑 3 张输入图 4K：标准 21.4，Highspeed 14.4，Nano Banana 2.1 62.0 / 64.0。
图注：数据来源：用户提供的对比图及二次评测表。H3 采用二次评测 P50；其他模型沿用原图。

### 博客配图 2：价格表（元/张）

文本生图 标准版 / Highspeed：1K 0.1430 / 0.2319；2K 0.1531 / 0.2380；4K·16MP 0.2261（原价 0.4522，限时5折）/ 0.4275（原价 0.8550）。

## 2. Hugging Face 模型卡 MiniMaxAI/MiniMax-H3-Image（README 原文，去掉 HTML）

---
pipeline_tag: text-to-image
license: other
license_name: minimax-h3-image-community-license-agreement
license_link: LICENSE
library_name: minimax-h3
language:
- en
tags:
- text-to-image
- image-to-image
- image-editing
- image-generation
- minimax-h3
- diffusers
base_model:
- MiniMaxAI/MiniMax-H3
---
# MiniMax-H3-Image
## Online API
Use MiniMax-H3-Image directly via API.
- Global: [platform.minimax.io](https://platform.minimax.io/docs/guides/image-generation) | CN: [platform.minimax.cn](https://platform.minimax.cn/docs/guides/image-generation)
API docs:
- Text-to-image: [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-generations), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-generations)
- Image editing: [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-edits), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-edits)
- Prompt expansion: [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-context-ir)
## Online App
Use MiniMax-H3-Image directly via App.
- WebApp Global: [hailuoai.video](https://hailuoai.video/) | CN: [hailuoai.com](https://hailuoai.com/)
- Desktop Global: [agent.minimax.io](https://agent.minimax.io/) | CN: [agent.minimax.cn](https://agent.minimax.cn)
## Introduction
MiniMax-H3-Image is a state-of-the-art open-source model for image generation and editing from
the [MiniMax H3](https://huggingface.co/MiniMaxAI/MiniMax-H3) family. It combines intelligent
understanding of creative intent with the ability to build visual worlds: with precise
instruction following, it develops a creative concept into concrete characters, scenes and
atmosphere. Generation and editing are unified in one checkpoint, which generates images from
text (text-to-image) and edits one or more reference images (image editing), giving creators
and developers a flexible and controllable way to create images.
It generates images of about 16 megapixels at every aspect ratio, from 4096x4096 (1:1) to
6272x2688 (21:9), directly and without an upscaler (see [Sizes](#sizes)). The checkpoint is
distilled to 6 sampling steps (6 NFEs) with no classifier-free guidance. Its diffusion
transformer (DiT) has the H3 architecture without the audio layers, and it uses the
MiniMax-H3 text encoder unchanged.
![Fifteen MiniMax-H3-Image text-to-image results in landscape and portrait formats: a 3D fantasy battle, a blue-green landscape painting, a tree frog, an indigo-dyed rabbit, a 3D white-haired girl, a portrait among flowers, a sci-fi city, dumplings, a highland cow, a mirror portrait, a 3D otter and sheep, a pixel art cat, a jewel beetle, giant cherries and a fisheye selfie](assets/showcase_hero.jpg)
**Highlights**
MiniMax-H3-Image brings together three core strengths: speed, image quality, and instruction
following.
1. **16-megapixel images at a practical computational cost.** Compared with the 1–4 MP outputs
   common today, 16 MP (4096 × 4096) images offer far more detail but typically require
   substantially more computation. MiniMax-H3-Image keeps that computational cost manageable,
   making 16 MP generation practical for everyday creation.
2. **Rich detail. Remarkable realism.** MiniMax-H3-Image goes beyond the familiar “AI look” to
   produce images with intricate detail and lifelike realism, opening up more possibilities for
   creative and professional use. It brings generated imagery closer to the richness and nuance
   of the real visual world.
3. **Stronger instruction following.** Greater creative control. Great image generation goes
   beyond beautiful pictures—it helps creators bring their ideas to life. MiniMax-H3-Image
   delivers the strongest instruction following among open-source models and supports up to 16
   reference images, giving creators more control over the final result.
## Model Zoo
| Model | Role | Precision | Size | Hugging Face |
| --- | --- | --- | --- | --- |
| **MiniMax-H3-Image** | Text-to-image and image editing | BF16 (DiT) | 68.65 GB | [MiniMaxAI/MiniMax-H3-Image](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image) |
| **MiniMax-H3-Image-PE** (optional) | Prompt expander for text-to-image | NVFP4 | 17.9 GB | [MiniMaxAI/MiniMax-H3-Image-PE](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE) |
## Model Architecture
MiniMax-H3-Image follows the H3-Base design with the audio branch removed. The text
prompt and the reference images are encoded by the H3 text encoder; the reference images are
also encoded by the image VAE. All tokens form one packed sequence for a single-stream
transformer, which predicts the latent of the target image. The VAE decodes that latent
into the image.
- **Text encoder**: the full Qwen3-VL text encoder of MiniMax-H3, unchanged. The DiT reads
  the hidden states of its 50th layer.
- **Image VAE**: a CNN encoder and a 2D ViT decoder (24 layers), with 16x spatial
  downsampling and 24 latent channels. The DiT patchifies the latent with a 2x2 patch, so each
  transformer token covers 32x32 pixels.
- **Diffusion transformer**: 33.1B parameters, a dense single-stream transformer with 50
  layers (hidden size 5376, 56 attention heads, FFN size 14336) and 3D multimodal RoPE, the same
  as the H3-Omni-Transformer. The weights are BF16; the embedding, timestep and output layers
  are FP32.
## Quick Start
### Download
| Component | Content | Size |
| --- | --- | --- |
| `transformer/` | DiT: BF16, with the embedding, timestep and output layers in FP32. | 66.28 GB |
| `pdd_fused_heads.safetensors`, `pdd_config.json` | The per-step output heads that replace the transformer's output layer, and the sampling schedule. | 12 MB |
| `vae/` | Image VAE, FP32. | 2.34 GB |
| `tokenizer/`, `processor/` | Qwen3-VL tokenizer and processor, identical to MiniMax-H3. | 23 MB |
| Text encoder | Not in this repository. `model_index.json` loads it from [`MiniMaxAI/MiniMax-H3`](https://huggingface.co/MiniMaxAI/MiniMax-H3), folder `text_encoder/`. If you already have MiniMax-H3, it is not downloaded again. | 66.7 GB |
```text
MiniMax-H3-Image/
├── model_index.json
├── pdd_config.json
├── pdd_fused_heads.safetensors
├── processor/
├── tokenizer/
├── transformer/
└── vae/
```
Download this repository and the MiniMax-H3 text encoder into the Hugging Face cache:
```bash
hf download MiniMaxAI/MiniMax-H3-Image
hf download MiniMaxAI/MiniMax-H3 --include "text_encoder/*"
# optional prompt expander
hf download MiniMaxAI/MiniMax-H3-Image-PE
```
### Local Deployment
We recommend the following inference frameworks to serve the model:
- [SGLang](https://docs.sglang.io/) - see [cookbook](https://docs.sglang.io/cookbook/diffusion/MiniMax/MiniMax-H3-image)
- [vLLM-Omni](https://github.com/vllm-project/vllm-omni) - see [vllm-omni recipe](https://recipes.vllm.ai/MiniMaxAI/MiniMax-H3-Image)
- [diffusers](https://github.com/huggingface/diffusers) - see [diffusers docs](https://huggingface.co/docs/diffusers/main/en/api/pipelines/minimax_h3_image)
- [ComfyUI](https://github.com/Comfy-Org/ComfyUI) - see [Comfy tutorial](https://docs.comfy.org/tutorials/image/minimax/minimax-h3-image); use [T2I template]() / [Edit template]()
#### vLLM-Omni Deployment
See the [vLLM-Omni recipe](https://recipes.vllm.ai/MiniMaxAI/MiniMax-H3-Image) for
per-hardware deployment configurations and measured latency. Both NVIDIA and AMD accelerators are
supported, including NVIDIA H200, RTX PRO 6000 Blackwell, AMD Instinct MI350X and more.
Start the server on one GPU:
```bash
vllm serve MiniMaxAI/MiniMax-H3-Image --omni --host 0.0.0.0 --port 8000
```
For lower latency, split each request over several GPUs with sequence parallelism
(Ulysses), for example on 4 GPUs:
```bash
vllm serve MiniMaxAI/MiniMax-H3-Image --omni --host 0.0.0.0 --port 8000 \
  --num-gpus 4 --usp 4 --text-encoder-tp-size 4
```
#### SGLang Deployment
Here we use SGLang as a deployment example. See the [MiniMax-H3-Image deployment guide](https://docs.sglang.io/cookbook/diffusion/MiniMax/MiniMax-H3-image) for
additional deployment configurations.
Start the server on one GPU:
```bash
sglang serve --model-path MiniMaxAI/MiniMax-H3-Image --host 0.0.0.0 --port 30000 --warmup-mode off
```
To use a local copy of the MiniMax-H3 `text_encoder/` folder instead of the Hugging Face
cache, add `--text-encoder-path `.
For lower latency, split each request over several GPUs with sequence parallelism
(Ulysses), for example on 4 GPUs:
```bash
sglang serve --model-path MiniMaxAI/MiniMax-H3-Image --host 0.0.0.0 --port 30000 --warmup-mode off \
  --num-gpus 4 --ulysses-degree 4
```
#### Request parameters
Text-to-image requests are JSON sent to `/v1/images/generations`. Image editing requests send
the reference images as multipart form data to `/v1/images/edits`; their order defines
``, ``, and so on in the prompt. Both return the PNG in
`data[0].b64_json`. Runnable examples are in [Full Workflow](#full-workflow).
| Field | Text-to-image | Image editing | Notes |
| --- | --- | --- | --- |
| `prompt` | Required | Required | Used as given, truncated to 4096 tokens. See [Full Workflow](#full-workflow) |
| `size` | Required | Required | `WIDTHxHEIGHT`. The returned image has exactly this size; see [Sizes](#sizes) |
| `image` | — | One or more files | In upload order they are ``, ``, ... in the prompt |
| `seed` | Recommended | Recommended | Integer |
| `generator_device` | `cpu` recommended | `cpu` recommended | Same seed, same initial noise on every machine |
| `response_format` | `b64_json` | `b64_json` | |
| `min_generation_area` | Optional | Optional | Minimum generated area in pixels, 1024-16777216, default 4194304 (2048x2048). A smaller `size` is generated at the same aspect ratio on a larger canvas and resized back with LANCZOS; pass 1024 to turn this off. All sizes in the table below are above the default |
| `num_inference_steps` | Omit or 6 | Omit or 6 | Other values return HTTP 400 |
| `guidance_scale` | Omit or 1 | Omit or 1 | Other values return HTTP 400 |
| `negative_prompt` | Not supported | Not supported | Rejected |
#### Sizes
The effective working range of MiniMax-H3-Image is about 4 MP to 20 MP, and it generally gives
the best results at around 16 MP. Common 16 MP sizes are listed below:
| Aspect ratio | Size (width x height) |
| --- | --- |
| 1:1 | 4096x4096 |
| 4:3 / 3:4 | 4736x3552 / 3552x4736 |
| 3:2 / 2:3 | 5024x3360 / 3360x5024 |
| 16:9 / 9:16 | 5472x3072 / 3072x5472 |
| 21:9 | 6272x2688 |
### Full Workflow
MiniMax-H3-Image expects a detailed English description of the whole image. The MiniMax API
turns a short prompt in any language into such a description with **H3-Image-Context-IR** before
generation. We also provide
[MiniMax-H3-Image-PE](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE), which can be
deployed locally.
This section reproduces the quality of images generated directly by the MiniMax API with a
locally deployed SGLang server. The scripts are in
[`examples/`](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/tree/main/examples) and use only
the Python standard library; run them in that folder:
```bash
hf download MiniMaxAI/MiniMax-H3-Image --include "examples/*" --local-dir .
cd examples
```
Before running examples, set your MiniMax API endpoint and key to use the H3-Image-Context-IR API
and the reference scripts. The scripts read them from the environment:
```bash
# MiniMax API endpoint (choose one)
# CN
export MINIMAX_API_BASE="https://api.minimax.cn"
# Global
# export MINIMAX_API_BASE="https://api.minimax.io"
# API key obtained from the MiniMax platform
export MINIMAX_API_KEY=""
```
API docs:
- H3-Image-Context-IR: use /v1/h3_image_context_ir [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-context-ir)
- Text-to-image: use /v1/images/generations [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-generations), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-generations)
- Image editing: use /v1/images/edits [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-edits), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-edits)
#### case-T2I
[`instruction.t2i.txt`](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/instruction.t2i.txt).
StageRequestResult
Prompt EnhancementH3-Image-Context-IR (MiniMax API)python3 context_ir.py t2i (script)revised_prompt.txt, revised_size.txt; our run: revised_prompt.t2i.txt, revised_size.t2i.txt (4736x3552)
local alternative: MiniMax-H3-Image-PEscripts/expand_prompt.py in the PE repositorySave expanded_caption as revised_prompt.txt and the size for aspect_ratio as revised_size.txt
MiniMax-H3-Image generation: local SGLangpython3 t2i.py --prompt revised_prompt.txt --size $(cat revised_size.txt) (script)t2i.png
E2E API Reference: text-to-image by directly calling the MiniMax APIpython3 api_generate.py t2i (script)api_t2i.png
t2i.png from local SGLang (left) and api_t2i.png from the MiniMax API (right), 4736x3552 (4:3 picked by H3-Image-Context-IR)
#### case-Edit
[`instruction.edit.txt`](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/instruction.edit.txt)
with the reference image [`reference1.png`](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/reference1.png)
as ``.
| Stage | Request | Result |
| --- | --- | --- |
| Prompt Enhancement: H3-Image-Context-IR (MiniMax API) | `python3 context_ir.py edit` ([script](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/context_ir.py)) | `revised_prompt.txt`, `revised_size.txt`; our run: [`revised_prompt.edit.txt`](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/revised_prompt.edit.txt), [`revised_size.edit.txt`](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/revised_size.edit.txt) (4096x4096) |
| MiniMax-H3-Image generation: local SGLang | `python3 edit.py --prompt revised_prompt.txt --size $(cat revised_size.txt)` ([script](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/edit.py)) | `edit.png` |
| E2E API Reference: image editing by directly calling the MiniMax API | `python3 api_generate.py edit` ([script](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/examples/api_generate.py)) | `api_edit.png` |
Reference image reference1.png (left), edit.png from local SGLang (middle) and api_edit.png from the MiniMax API (right), 4096x4096 (1:1 picked by H3-Image-Context-IR)
## Showcase
Text-to-image and image editing results, shown downscaled.
Photorealistic photography
Surreal editorial photography
Environment concepts
Characters, creatures and props
Painting and illustration styles
Text rendering with reasoning: logic puzzles in Chinese and English, solved correctly on the board
Image editing, one reference: an untextured 3D render (left) turned into a film still of a lunar research base (right)
Image editing, one reference: a game map (left) turned into a first-person 3D game view from the red arrow's position, with the map as a minimap (right)
Image editing, ten references: an empty room and nine pieces of furniture (top) composed into one living room (bottom)
## License
- MiniMax-H3-Image is released under the [MiniMax-H3-Image Community License Agreement](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE).
- The T2I PE Model ([MiniMax-H3-Image-PE](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE)) is part of MiniMax-H3-Image and is accordingly subject to [MiniMax-H3-Image Community License Agreement](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE).
- The separate written authorization described in Section IV of the license is requested through [Application form](https://platform.minimax.io/console/license)
## Contact Us
Contact us at [model@minimax.io](mailto:model@minimax.io).

## 3. MiniMaxAI/MiniMax-H3-Image-PE 模型卡（节选）

---
pipeline_tag: text-generation
license: other
license_name: minimax-h3-image-community-license-agreement
license_link: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
library_name: transformers
language:
- en
tags:
- prompt-expansion
- text-to-image
- minimax-h3
- fp4
- sglang
base_model:
- Qwen/Qwen3.8-27B
---
# MiniMax-H3-Image-PE
## Online API
Use MiniMax-H3-Image directly via API.
- Global: [platform.minimax.io](https://platform.minimax.io/docs/guides/image-generation) | CN: [platform.minimax.cn](https://platform.minimax.cn/docs/guides/image-generation)
API docs:
- Text-to-image: [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-generations), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-generations)
- Image editing: [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-edits), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-edits)
- Prompt expansion: [EN-docs](https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir), [CN-docs](https://platform.minimax.cn/docs/api-reference/image-generation-h3-context-ir)
## Introduction
MiniMax-H3-Image-PE provides prompt expansion (PE) for
[MiniMax-H3-Image](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image).
It turns a short request into a detailed description of the intended image,
together with an aspect-ratio recommendation for image generation.
This repository covers two workflows:
| Workflow | Input | Released assets |
| --- | --- | --- |
| **Text-to-image (T2I) PE** | A text instruction | MiniMax-H3-Image-PE weights (fine-tuned from [Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B), FP4), task and system prompts, and a client example |
| **Image editing PE** | An editing instruction and reference images | A task prompt and message-assembly example for a vision-language model of your choice. **Image editing PE is still under development; this release provides its prompt only.** |
The examples below explain how to use MiniMax-H3-Image-PE and the image editing task prompt.
## How to use T2I PE
Run the examples from a local copy of this repository so the relative prompt and
script paths resolve correctly.
### Serve MiniMax-H3-Image-PE

## 4. transformer/config.json

```json
{
  "_class_name": "MiniMaxH3DiTModel",
  "_diffusers_version": "0.32.2",
  "hidden_size": 5376,
  "num_layers": 50,
  "token_refiner_num_layers": 2,
  "num_attention_heads": 56,
  "attention_head_dim": 128,
  "ffn_hidden_size": 14336,
  "latents_dim": 24,
  "audio_latents_dim": 32,
  "patch_size": [
    1,
    2,
    2
  ],
  "text_dim": 5120,
  "timestep_input_dim": 256,
  "time_embed_hidden_size": 5376,
  "time_embed_dim": 2688,
  "adaln_out_features": 96768,
  "final_adaln_out_features": 10752,
  "rope_inv_freq_len": 16,
  "norm_eps": 1e-05,
  "qk_norm_eps": 1e-05,
  "final_norm_eps": 1e-05,
  "audio_enabled": false
}
```

## 5. pdd_config.json（6 步采样的 sigma 序列）
```json
{
  "num_inference_steps": 6,
  "sigmas": [
    1.0,
    0.9675236940383911,
    0.8875485062599182,
    0.75,
    0.5327739119529724,
    0.23200887441635132,
    0.0
  ]
}
```

## 6. LICENSE 相关条款

5. “Excluded Territories” means the European Union, the United Kingdom, the Republic of Korea and the United States of America.  
  a. display a notice on any product or service developed using MiniMax-H3-Image indicating that the product or service is “Powered by MiniMax-H3-Image”; 
2. You shall prominently display “MiniMax-H3-Image”on the user interface of commercial product or service that uses MiniMax-H3-Image or MiniMax-H3-Image Works.
