# 资料：Qwen4 前瞻（复核只认这份）

主文：老潘《Qwen4 发布前夜：架构预览、代码线索到模型档位》（Notion，2026-10-31）
https://app.notion.com/p/40a1081a28be81c6aa8bd3d05023a1d6 —— 片中架构、参数、部署数字全部出自这篇。
补充证据 2026-11-01 从原始出处核对，截图和链接见 assets.md。

## 片中用到的事实，按场景

**hook**
- 2026-10-29 阿姆斯特丹 Apsara 大会，幻灯片「Qwen4 Series Coming Soon」（参会者 @jtdavies 拍照转述）。
- 官方尚未发布权重、文档、API 定价（文章）。
- Qwen3.8-Flash-Next 2026-08 开源，config.json `model_type: qwen4_exp`、`Qwen4ExpForConditionalGeneration`（HF config.json）。

**official_hf**
- HF 模型主页："This experimental preview of the architecture that will underpin Qwen4…"
- 阿里新闻稿 2026-09-25："Qwen 4, is currently in training"；Qwen 4.5 / Qwen 5 "projected to scale up to 5 to 10 trillion parameters"。

**official_code**
- Qwen Code PR #15762（wenshao，2026-10-28 合并）：`[/^qwen4/, LIMITS['1m']]`，qwen4 系列 262,144 → 1,000,000。
- 同一 PR Risk & Scope："the row takes the whole qwen4 generation to be 1M, which is reviewer-reported rather than something the code or models.dev can confirm today"。
  （文章写「实打实的代码」：代码确实合并，但 1M 这个值 PR 自己说未经确认。片中这么讲。）
- Qwen Code PR #15987（2026-10-31 合并）："the qwen4 family join the existing tiered DashScope effort contract"；分档 low / medium / xhigh，默认 xhigh（PR 描述）。

**live**
- @jtdavies："From the @Alibaba_Qwen Cloud CTO, Dr. Feifei Li - “Qwen4 next week”. Live from Apsara, Amsterdam."
- @ruima："…the slide still just says “coming soon.”"
- 四档 Qwen4-Max / Plus / Flash / 27B，讲者 Qwen 研究员 Xudong Guo（文章；@0x0SojalSec）。

**ecosystem**
- llama.cpp #27742（danielhanchen，08-26 提交，08-27 合并）：`model: add Qwen3.8-Flash-Next (qwen4exp)`。
- vLLM #53909（08-26 提交，后关闭）：`[Kernel][Qwen]Add qwen4 fuse op`。
- vLLM / SGLang / TensorRT-LLM / vllm-ascend / ROCm 的近期 qwen4_exp PR（编号见 assets.md）。
- GitHub 搜索 `qwen4 is:pr created:>=2026-10-25` = 623（2026-11-01）。
- 「transformers、llama.cpp、mlx-vlm、Unsloth、SGLang、vLLM、TokenSpeed 已适配，权重出来主流框架基本首日能跑」（文章）。

**missing / debunk**
- HF 搜索 Qwen/Qwen4：0 个结果；HF API `author=Qwen&search=Qwen4` 为空（2026-11-01）。
- 百炼 API 请求 qwen4-max / qwen4-flash / qwen4-27b：`model_not_found`（2026-11-01，我们账号）。
- r/LocalLLaMA 2026-10-06 爆料「10 月底发布」→ 已跳票（文章）。
- HF `stealth-model/Qwen4` 是第三方页面；`IteraCompute/Qwen4-27B-NVFP4` 只有准备文档、无权重（第三方汇总，搜索结果）。
- `qwen4-coder-plus`、`qwen4-omni-120b-think` 出现在 PR #15762 的测试 / 说明里（文章称 mock 字符串；PR 原文是测试里用到的模型 ID）。

**arch**（文章 + config）
- 主模型 125B，每 token 激活 6B；N-gram Embedding 51B（20M × 2560）；MTP 约 4B；checkpoint 约 180B。
- 每 4 层 3 层 GDN + 1 层 QSA；Gated Residual 4 路（hc_count 4）；N-gram 在第 2 层，可 CPU offload；Muon 优化器 + 1 层 MTP。

**arch_num**（arXiv 2608.30320）
- 对比 397B-A17B 的 Qwen3.7-Plus：14 项预训练 benchmark 赢 8 项，其余差距 ≤ 2.6 分；激活参数 1/3，训练 FLOPs 约 1/9。
- 「Qwen4 大概率以此为基准按档位缩放」是文章的推断。

**deploy**（文章，引 SGLang Cookbook）
- 1M、BF16：12 层 QSA × 2 × 2 头 × 256 × 2 B = 24 KB/token → 24.6 GB。QSA 不省显存。
- N-gram 表 FP8 47.7 GiB；RTX PRO 6000（96 GB）NVFP4：表放主机内存后显存常驻约 75 GB，主机内存留 64 GB。

**outro**（文章）
- 最在意 27B 和 Flash；27B 若 Dense 且开源，单卡双卡部署更实用；Flash 大概率基于 Flash-Next 调优。
- 打算实测：51B 表的 CPU offload；vLLM / SGLang 真实吞吐和 decode 速度。
