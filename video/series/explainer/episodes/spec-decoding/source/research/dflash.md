# DFlash 研究笔记（2026-10-28 核实）

## 1. 身份
- 全名：DFlash: Block Diffusion for Flash Speculative Decoding
- 作者：Jian Chen, Yesheng Liang, Zhijian Liu（均 UC San Diego；z-lab / Z Lab）。发表于 ICML 2026（PMLR v306 chen26b）。
- arXiv v1：2026-02-05（abs 页 "Submitted on 5 Feb 2026 (v1)"）；另有 v2（日期未核实）。
- 博客/项目页：https://z-lab.ai/projects/dflash/（页面无具体日期，未核实）
- 代码：https://github.com/z-lab/dflash（首次 commit 日期未核实）；Inco AI 的 DFlash2 博客（2026-08-18）称 "Our team released DFlash in January"，早于 arXiv v1，与 arXiv 日期有出入，建议视频只用 arXiv 日期。
- 模型：https://huggingface.co/collections/z-lab/dflash ，例如 z-lab/Qwen3-8B-DFlash-b16（MIT，arxiv:2602.06036）。
- 论文：https://arxiv.org/abs/2602.06036 ；HTML https://arxiv.org/html/2602.06036v1
- 生态（README raw.githubusercontent.com/z-lab/dflash/main/README.md）：SGLang、vLLM、MLX、llama.cpp、Transformers；checkpoint 覆盖 Qwen3/3.5/3.6、Gemma 4、Kimi、GLM、GPT-OSS 等。

## 2. 一句话
用一个轻量 block diffusion 草稿模型，在**一次前向**里并行生成整块（block size 16）draft token，并把目标模型多层 hidden features 融合后**注入草稿模型每一层的 K/V**；对比 EAGLE-3 的"逐 token 自回归起草"，draft 成本不再随 token 数线性增长，因此可以用更深的草稿网络。（论文 §1, §3.2, §4.1）

## 3. 一轮解码流程（论文 §4.1, Fig.2）
1. 目标模型 prefill 产出首个 token；同时从 5 层（第 2 层到倒数第 3 层之间均匀选取）抽 hidden states，拼接后过一个轻量 projection 融合成 "target context feature"。
2. 草稿模型：5 层 Transformer（Qwen3-Coder 用 8 层），**共享且冻结**目标模型的 token embedding 和 LM head，只训练中间层。
3. 融合特征被投影为 Key/Value，**注入每个草稿层**并存进草稿的 KV cache，跨轮复用（区别于 EAGLE-3 只把特征当输入层的输入，层数加深会被稀释）。
4. 草稿输入块 = [一个干净 anchor token（上一轮验证得到的 bonus token）, 其后 block_size-1 个 [MASK]]；块内双向注意力、同时关注注入的目标特征；**单次前向（单步去噪）**一次预测全部 15 个 mask 位置。
5. 链式（chain）而非树：块是一条线性序列；论文没有为 DFlash 构建 tree。
6. 目标模型对整块做一次并行验证；论文称 "lossless"（"speculative verification provides a principled guarantee of output quality"），但**正文没有写出具体接受规则公式**（greedy 匹配 / 拒绝采样，未核实；实验含 T=0 与 T=1）。τ 定义含 bonus token（§3.1：τ∈[1,γ+1]）。
7. 接受前缀 + bonus token 成为下一轮 anchor，目标 hidden states 用于更新 K/V 上下文。

延迟公式（§3.1）：L=(T_draft+T_verify)/τ；AR 起草 T_draft=γ·t_step，扩散起草 T_draft=t_parallel（式2、3）。

## 4. 训练（§4.2, A.1）
- 目标模型冻结；草稿被训练对齐目标模型输出。数据约 800K 条，来自 NVIDIA Nemotron Post-Training Dataset V2 + CodeAlpaca，**回复由目标模型自己重新生成**；推理模型用带 reasoning trace 的输出。
- KV injection：整条干净序列过目标模型取特征，再注入草稿。
- 随机 anchor 采样：随机选响应中的 token 作 block 首位，其后全 mask，预测后续 block_size-1 个 token，匹配推理时"以 bonus token 开头"的行为（Table 9：Math500 τ 4.94→5.64，加速 4.13x→4.69x，3层）。
- 稀疏注意力 mask（Flex Attention）：块内双向 + 关注对应目标特征，块间不可见；多个 block 拼成一条序列一次前后向。每序列固定 512 个 anchor，每 epoch 重采样（避免 EAGLE-3 式 training-time test 的高成本）。
- 位置加权交叉熵 w_k=exp(-(k-1)/γ)，γ=7（block16）/5（block10）/4（block8）。
- 超参：6 epoch，AdamW，lr 6e-4，clip 1.0，cosine，warmup 0.04，最长序列 3072（Coder 4096）。可在线或离线（缓存 hidden states）。

## 5. 关键数字
来源均为 https://arxiv.org/html/2602.06036v1
| 项 | 数值 | 位置 |
|---|---|---|
| 摘要 | >6x 无损加速；最高比 EAGLE-3 快 2.5x | Abstract |
| Qwen3-8B 非思考 T=0 平均 | DFlash(16) 4.86x τ=6.49；EAGLE-3(16) 1.76x τ=2.96；EAGLE-3(60) 2.02x τ=3.40 | Table 1，H200，Transformers |
| Qwen3-4B T=0 平均 | DFlash 4.91x τ=6.54；EAGLE-3(16) 1.81x τ=3.05 | Table 1 |
| Qwen3-8B T=1 平均 | DFlash 4.03x τ=5.48；EAGLE-3(16) 1.68x τ=2.83 | Table 1 |
| 单项峰值 | Q3-4B MATH-500 T=0：6.09x, τ=7.84 | Table 1 |
| MT-Bench（最弱） | Q3-8B T=0：2.75x, τ=4.24 | Table 1 |
| 思考模式 Q3-8B T=0 | GPQA 4.17x/5.17；MATH-500 4.64x/5.82；AIME25 4.51x/5.74 | Table 2 |
| SGLang B200 FA4 Qwen3-8B Math500 | 吞吐 1175 vs 基线 230 tok/s（并发1）=5.1x，并发32 为 2.8x，τ=8.01 | Table 3 |
| SGLang Qwen3-Coder-30B-A3B HumanEval | 并发1 3.5x，τ=8.09 | Table 3 |
| LLaMA-3.1-8B SGLang GSM8K | DFlash(10) 2.4x→1.6x（并发1→32）τ=4.32；EAGLE-3(60) 1.9x→0.6x τ=4.55 | Table 4 |
| 层数 | 3/5/8 层：Math500 τ 5.64/5.99/6.33；加速 4.69/4.71/4.64x，5层综合最佳 | Table 5 |
| 目标特征数 | 3-H→5-H：τ 5.38→5.64 | Table 6 |
| 无目标条件的扩散草稿 | 约 2-3x（如 Math500 T=0 3.73x τ=4.61） | Table 8 |
| train/test block size | b16→b16 τ=6.33；b16→b8 5.09；b8→b16 5.02 | Table 7 |
注意：Table 1 的 EAGLE-3 用 AngelSlim 的 Qwen3 checkpoint；Table 1 "2.4x over EAGLE-3(16)" 指 4.9/… 的平均比值（§5.1 原文）。高并发下优势缩小（compute-bound）。

## 6. 原文图（arXiv HTML 为 LaTeXML，图片文件名未能取到，未核实 URL）
- Fig.1：Qwen3-8B 上 DFlash vs EAGLE-3 vs AR 加速对比（Transformers）
- Fig.2：DFlash Inference Design——目标特征融合后注入每个草稿层 KV cache（**最能说明机制**）；项目页同图 https://z-lab.ai/assets/projects/dflash/method.png（HEAD 200，已核实存在）
- Fig.3：1/3/5 层 DFlash 与 1 层 EAGLE-3 的 draft 成本
- Fig.4：训练注意力 mask（target context 蓝、anchor 黄、mask 绿、不可见白）——**最适合动画**
- Fig.5：loss decay 收敛曲线
- README 架构图：https://raw.githubusercontent.com/jianc99/jianc99.github.io/master/images/dflash_system.png

## 7. 与其他技术的关系（仅来源所述）
- EAGLE/EAGLE-3：论文称其用 frozen target 特征但仍自回归起草，加速上限约 2-3x；单层 draft；特征只作输入而被稀释。DFlash 并行起草+KV 注入。（§1,§2.1,§3.2,§4.1）
- Medusa：论文仅在相关工作提及（多预测头+tree attention），无直接对比。
- MTP：论文未提及（项目页也未提及）。Samragh et al. 2025（LoRA 并行起草）被引为"隐藏特征含多个未来 token 信息"的依据。
- 其他扩散起草：DiffuSpec/SpecDiff-2 用 7B 草稿，加速仅 3-4x；PARD 约 3x；TiDAR 不无损。
- DFlash2（Inco AI 博客 https://inco.ai/blog/dflash2/ , 2026-08-18）：称 DFlash 各位置独立预测，"nothing makes them fit together"，首位 top-1 85.4% 正确而前16候选含正确 99.5%；DFlash2 声称同样一次前向、每次验证多产出 16-25% token、周期延迟约 +1%。并称 Domino 和 DSpark 用"顺序头重写分布"来换取一致性。（DFlash2 细节归其他研究员。）

## 8. 易错点
1. DFlash 不是独立的扩散语言模型生成文本；扩散只做 drafter，最终输出由 AR 目标模型验证，无损。
2. 不是多步去噪：默认单次前向（单步）预测整块。
3. 草稿并非"从零预测"：靠注入目标多层特征；无条件版本只有约 2-3x（Table 8）。
4. 特征不是拼到输入 embedding，而是投影成每层的 K/V（与 EAGLE-3 的关键区别）。
5. 块内 16 个位置是并行独立预测，不是逐个依赖；位置越靠后越易错，所以训练用指数衰减加权。
6. 块大小 16 不等于接受 16：τ 约 6-8，含 bonus token；推理 block 可小于训练 block，反之不行。
7. "6x" 是 Qwen3 小模型、H200/B200、低并发、数学/代码；MT-Bench 约 2.5-2.8x，并发 32 下降至 2-3x，LLaMA 上仅 1.6-2.8x。
8. 对比的 EAGLE-3 数据是论文自测，且用 Transformers 后端；SGLang 表（Table 4）才是服务场景。
9. 发布时间：arXiv 2026-02-05；Inco 博客说 January，未核实。
10. 链式一条线，没有 tree；验证规则细节论文未明写。

## 9. 可视化建议
1. 一轮 timeline：AR 起草（γ 个小方块依次 t_step）对比 DFlash（一个宽方块 t_parallel）+ 一次 verify，用式(1)的 T_draft/T_verify/τ 标注真实占比。
2. 数据流图（复刻 Fig.2）：目标 5 层 hidden 汇合→projection→分别进入草稿每一层的 K/V 槽；对比 EAGLE-3 只在输入端融合。
3. 注意力 mask 动画（复刻 Fig.4）：[anchor, M×15] 块内全连接，所有位置连向 target context，块间遮挡；再演示"接受前缀 + bonus token → 下一轮 anchor"，用 Table 1 的 τ 值标注接受长度。
