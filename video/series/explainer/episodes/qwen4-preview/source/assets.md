# 画面里的真实素材（文件在 assets.nosync/，不进 git；成片后传到 Drive 的 素材/ 子目录）

截图都是 2026-11-01 用 Playwright 截的公开页面，按段落裁切；黄色底色是视频里加的高亮。

| 文件 | 内容 | 来源 |
|---|---|---|
| hf_head.png, hf_para.png | Qwen3.8-Flash-Next 模型主页标题区；原句 "This experimental preview of the architecture that will underpin Qwen4…" | https://huggingface.co/Qwen/Qwen3.8-Flash-Next |
| hf_config.png | config.json 前 11 行（`Qwen4ExpForConditionalGeneration`、`"model_type": "qwen4_exp"`） | https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/config.json |
| hf_search.png | HF 搜索 Qwen/Qwen4：Models 0 | https://huggingface.co/models?search=Qwen%2FQwen4 |
| alibaba_para.png | 阿里新闻稿 2026-09-25："Qwen 4, is currently in training"；Qwen 4.5 / Qwen 5 规划到 5–10T | https://www.alibabagroup.com/en-US/document-2041268239081668608 |
| p15762_head.png, p15762_risk.png, p15762_ids.png | Qwen Code PR #15762（2026-10-28 合并）标题；Risk & Scope："reviewer-reported rather than something the code or models.dev can confirm today"；测试里的模型 ID | https://github.com/QwenLM/qwen-code/pull/15762 |
| p15987_head.png, p15987_para.png | Qwen Code PR #15987（2026-10-31 合并）：qwen4 系列接入分档 reasoning effort | https://github.com/QwenLM/qwen-code/pull/15987 |
| weekly_para.png | qwen-code-docs 周报 2026-10-29（备用，片中未用） | https://github.com/QwenLM/qwen-code-docs/blob/main/website/content/zh/blog/updates/weekly-update-2026-10-29.mdx |
| llama_head.png, llama_para.png | llama.cpp PR #27742（08-26 提交、08-27 合并）`model: add Qwen3.8-Flash-Next (qwen4exp)` | https://github.com/ggml-org/llama.cpp/pull/27742 |
| vllm_head.png, vllm_para.png | vLLM PR #53909（08-26 提交，已关闭未合并）`[Kernel][Qwen]Add qwen4 fuse op` | https://github.com/vllm-project/vllm/pull/53909 |
| qwen3.8-flash-next-architecture.png | Flash-Next 架构图（文章配图，出自 Qwen 官方 GitHub） | Notion 文章配图 / https://github.com/QwenLM/Qwen3.8-Flash-Next |

文字卡（X / Reddit 需要登录，没法截图，按原文转写）：
- @jtdavies 2026-10-29："From the @Alibaba_Qwen Cloud CTO, Dr. Feifei Li - “Qwen4 next week”. Live from Apsara, Amsterdam." https://x.com/jtdavies/status/2115729815042961750
- @ruima 2026-10-29："…and the slide still just says “coming soon.”" https://x.com/ruima/status/2115889095306367049
- 四档名单与讲者 Xudong Guo：@0x0SojalSec https://x.com/0x0SojalSec/status/2115888388352164048 ；cellcog 整理 https://cellcog.ai/blog/qwen-4-release-date/
- r/LocalLLaMA 2026-10-06 "Qwen 4 apparently coming out at the end of October"
- 百炼 API：2026-11-01 用 compatible-mode chat/completions 请求 qwen4-max / qwen4-flash / qwen4-27b，均返回 `model_not_found`（我们账号的结果）。
- GitHub 搜索 `qwen4 is:pr created:>=2026-10-25`：623（2026-11-01）。五张小卡的 PR：vllm #64898、sglang #46881、TensorRT-LLM #21372、vllm-ascend #20548、ROCm/ATOM #2847。
