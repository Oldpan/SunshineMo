# EAGLE-3 调研（讲透系列：DFlash / DFlash2 / DSpark / MTP / EAGLE-3）

核实日期 2026-10-28。来源缩写：[P]=https://arxiv.org/html/2503.01840v3（正文，章节注明）；[R]=https://raw.githubusercontent.com/SafeAILab/EAGLE/main/README.md；[C]=同仓库 eagle/model/{cnets.py, ea_model.py, utils.py, modeling_llama_kv.py}（代码，非论文）。

## 1. 身份 & 时间线
| 名称 | 标题 | arXiv v1 | 备注 |
|---|---|---|---|
| EAGLE | EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty (2401.15077) | 2024-01-26 | 倒数第二层(second-to-top)特征上自回归 + 前移一步的 token 序列；静态树。venue 记忆为 ICML 2024（未核实） |
| EAGLE-2 | EAGLE-2: Faster Inference of Language Models with Dynamic Draft Trees (2406.16858) | 2024-06-24 | 用 draft 置信度近似接受率，动态建树+剪枝；摘要称 3.05x-4.26x、比 EAGLE-1 快 20%-40%。venue 记忆为 EMNLP 2024（未核实） |
| EAGLE-3 | EAGLE-3: Scaling up Inference Acceleration of LLMs via Training-Time Test (2503.01840) | v1 2025-03-03；v3 2025-04-23 | 作者 Yuhui Li, Fangyun Wei, Chao Zhang, Hongyang Zhang；单位 Peking Univ / Microsoft Research / Univ. of Waterloo / Vector Institute。NeurIPS'25（[R] Update: 2025.9.18 accepted） |

链接：abs https://arxiv.org/abs/2503.01840 ；代码 https://github.com/SafeAILab/EAGLE ；[R] 记 EAGLE-3 发布于 2025-03-19。

EAGLE 原文要点（[P] §2.2）：特征级自回归 + 输入上一时刻采样出的 token 以消除特征不确定性；tree attention；"EAGLE 启发了 DeepSeek-V3 预训练的 multi-token prediction，后者又启发了 EAGLE-3 的新架构设计"。

## 2. 一句话
EAGLE-3 去掉 EAGLE 的"特征回归损失"，改为直接预测 token，并在训练时模拟多步起草（training-time test），因此 drafter 的输入可以自由换成目标模型低/中/高层特征的融合；这使得训练数据越多加速越高（scaling law）。

## 3. 一轮解码（[P] §3.1，Figure 5；以 "How can" → 采样出 "I" 为例）
1. 目标模型 prefill/上一轮验证时 forward，记录 low、mid、high 三层特征序列 l、m、h（各 k 维，k=目标模型 hidden size）。
2. 拼接成 3k 维，过一个 FC 降回 k 维，得融合特征 g。
3. Step 1：drafter 输入 = g(how), g(can) 以及已采样 token "I" 的 embedding e_I（drafter 看不到随机采样过程，所以像 EAGLE 一样补 token embedding）；concat 后过 FC 降到 k，进入**单层 Transformer decoder**，输出 a；a 过 LM head 采样得草稿 token "do"。
4. Step 2：目标模型还没验证过 "I"，拿不到 g(I)，所以用 drafter 上一步输出 a_I 顶替，与 e_do 拼接再输入；Step 3 同理用 a_do 与 e_it。
5. 树：沿用 EAGLE-2 的 context-aware dynamic draft tree（[P] §1、§2.2）。[P] Appendix A：EAGLE-2 总 draft token 数 60/50/48（7B(8B)/13B/70B），深度 6，扩展阶段选 10 个节点；EAGLE-3 "深度由 6 提到 8，节点数保持与 EAGLE-2 相同"。
6. 验证：目标模型一次 forward 用 tree attention 并行验证整棵树；按 speculative sampling 的 min(1, p/p̂) 接受，拒绝处从 norm(max(0,p−p̂)) 重采样，分布与自回归一致，即无损（[P] §2.1、§4 Metrics "strict acceptance conditions, no loss"）。接受若干 token 后，该轮目标模型 forward 的 l/m/h 特征又成为下一轮 drafter 的输入（循环）。

代码侧细节（[C]，论文未写，注明出处）：
- 取层：modeling_llama_kv.py 中在 `idx==len(layers)-3 or idx==len(layers)//2 or idx==2` 时记录该层输入的 hidden_states。对 Llama-3.1-8B（32 层）即 idx=2、16、29（论文未给索引，此为仓库实现）。
- `self.fc = nn.Linear(hidden*3, hidden)`；`self.midlayer = LlamaDecoderLayeremb`（单层）；drafter 有自己的 `lm_head`，输出维度为 `draft_vocab_size`，通过 `d2t/t2d` 映射到目标词表（即 drafter 用裁剪词表，不是直接共享目标 LM head；论文正文未提，"shared LM head"说法不准确）。注意 utils.py 里 topK_genrate 同时传入了目标 lm_head，具体用法未逐行核实。
- 默认参数 `total_tokens=63, depth=5, top_k=8`（cnets.py 构造函数默认值；评测用设置以论文 Appendix 为准）。

## 4. 训练（[P] §1、§3.2、§4）
- 动机：EAGLE 的 loss = l_fea（特征回归）+ l_tok；Step 1 输出 â 与真值 f 偏差大，Step 2 输入偏离训练分布，第 2 个草稿 token 接受率很低（Figure 4）；且 l_fea 把输入锁死为顶层特征，增大数据无益（Figure 1/4）。
- Training-time test：训练时先做一次"原生步"（输入来自目标模型特征 g，标准下三角因果 mask），再做 ≥2 个"模拟测试步"，把 drafter 上一步输出 a 回灌作输入。Figure 6：原始序列 "How can I" 为灰色 token，第一轮预测（are/we/do）蓝色，第二轮预测黄色；第 2 步起的 attention mask 除"以原始训练数据为 key"的部分外均为**对角**，故可用逐位置向量点积而非整块矩阵乘，避免算力浪费。
- 因为不再回归顶层特征，输入"完全自由"，可换成低/中/高层融合；顶层特征只含下一 token 信息，预测 next-next token 吃亏（[P] §1）。
- 数据：ShareGPT（约 68K 条）+ UltraChat-200K（约 464K 条），且用**目标模型生成回复**而非固定数据集；DeepSeek-R1-Distill-LLaMA 8B 另加 OpenThoughts-114k-math。AdamW(β=(0.9,0.95))，梯度裁剪 0.5，lr 5e-5（[P] §4 Implementation）。论文称"比 EAGLE 多约 8x 数据"（§1）。
- 与 HASS 区别（[P] §3.2）：HASS 仍保留 l_fea、输入须为顶层特征，动机是缓解误差累积；EAGLE-3 动机是去约束、增强表达力。

## 5. 关键数字（[P] §4 Table 1，temperature=0；Speedup / τ）
| 模型 | 方法 | MT-bench | HumanEval | GSM8K | Alpaca | CNN/DM | Mean |
|---|---|---|---|---|---|---|---|
| Vicuna-13B | EAGLE-2 | 4.26x/4.83 | 4.96x/5.41 | 4.22x/4.79 | 4.25x/4.89 | 3.40x/4.21 | 4.22x/4.83 |
| Vicuna-13B | **EAGLE-3** | 5.58x/6.65 | 6.47x/7.54 | 5.32x/6.29 | 5.16x/6.17 | 5.01x/6.47 | 5.51x/6.62 |
| Llama-3.1-8B | EAGLE-2 | 3.16x/4.05 | 3.66x/4.71 | 3.39x/4.24 | 3.28x/4.12 | 2.65x/3.45 | 3.23x/4.11 |
| Llama-3.1-8B | **EAGLE-3** | 4.40x/6.13 | 4.85x/6.74 | 4.48x/6.23 | 4.82x/6.70 | 3.65x/5.34 | 4.44x/6.23 |
| Llama-3.3-70B | EAGLE-2 | 2.83x/3.67 | 3.12x/4.09 | 2.83x/3.69 | 3.03x/3.92 | 2.44x/3.55 | 2.85x/3.78 |
| Llama-3.3-70B | **EAGLE-3** | 4.11x/5.63 | 4.79x/6.52 | 4.34x/6.15 | 4.30x/6.09 | 3.27x/5.02 | 4.12x/5.88 |
| DeepSeek-R1-Distill-Llama-8B | EAGLE-2 | 2.92x/3.80 | 3.42x/4.29 | 3.40x/4.40 | 3.01x/3.80 | 3.53x/3.33 | 3.26x/3.92 |
| DeepSeek-R1-Distill-Llama-8B | **EAGLE-3** | 4.05x/5.58 | 4.59x/6.38 | 5.01x/6.93 | 3.65x/5.37 | 3.52x/4.92 | 4.16x/5.84 |

Vicuna-13B 其他基线 Mean（T=0）：SpS 1.92x/2.24，PLD 1.74x/1.80，Medusa 2.12x/2.51，Lookahead 1.62x/1.67，Hydra 2.80x/3.50，EAGLE 3.05x/3.96。T=1 Vicuna-13B Mean：EAGLE-2 3.76x/4.41，EAGLE-3 4.65x/5.67；Llama-3.1-8B Mean：EAGLE-2 2.80x/3.62，EAGLE-3 3.45x/4.92。
- 文字结论（§4.1）："约 3.0x-6.5x，比 EAGLE-2 提升 20%-40%"；最高 6.5x（Vicuna-13B HumanEval 6.47x）、τ 最高 7.5（7.54）。引言称 "1.4x over EAGLE-2"（batch size 1）。注意 Llama-3.1-8B Mean 4.44/3.23 = 1.37x。
- τ 定义：每个 draft-verify 周期平均产出 token 数（含奖励 token，§4 Metrics 的措辞为 "accepted from the draft"，表述略松）。
- 消融（Table 2，Llama-3.1-8B）：MT-bench EAGLE-2 3.16x/4.05 → +去特征约束 3.82x/5.37 → +融合特征 4.40x/6.13；GSM8K 3.39x/4.24 → 3.77x/5.22 → 4.48x/6.23。
- Figure 7：EAGLE 的 n-α 随 n 明显下降，EAGLE-3 几乎不变。
- SGLang（§4.3，H100，Llama-3.1-8B，MT-Bench，SGLang v0.4.4，SGLang 团队测，无树、链长 3），相对无投机=1.00x：

| batch | 2 | 4 | 8 | 16 | 24 | 32 | 48 | 56 | 64 |
|---|---|---|---|---|---|---|---|---|---|
| EAGLE | 1.40 | 1.38 | 1.23 | 1.02 | 0.93 | 0.94 | 0.88 | 0.99 | 0.99 |
| EAGLE-3 | 1.81 | 1.82 | 1.62 | 1.48 | 1.39 | 1.32 | 1.38 | 1.34 | 1.38 |

  bs=64 提升：正文 §4.3 写 38%，引言写 "40%"（同一数据 1.38x，前后写法不一致）。bs=1（Table 4）：无投机 158.34 tok/s，+EAGLE-2 244.10，+EAGLE-3 373.25。
- vLLM（Table 5，Llama-3.1-8B，无树、最大链长 2）：EAGLE-3 bs=2 1.75x … bs=56 1.01x；EAGLE bs=56 0.71x。**论文自相矛盾**：正文写 RTX3090，表题写 A100。EAGLE 峰值在 bs=24 附近，EAGLE-3 在 56（正文）。引用时需注明。
- 论文无 EAGLE-3 在 405B/671B 的结果（"GPU constraint"）。

## 6. 原文图（均出自 [P]）
| 图 | 说明 | 获取 |
|---|---|---|
| Fig 5 推理流程图 | "Diagram of the EAGLE-3 inference pipeline, illustrating the three steps of the draft model. l, m, h = low/mid/high-level features; e = embedding" | PNG（已核实 200）：https://arxiv.org/html/2503.01840v3/method.png |
| Fig 3 训练时测试对比 | 上：EAGLE 特征级；中：（对比方法）；下：training-time test；f 特征，t token，a 无约束向量 | HTML 中为内联图（无独立 URL，id S1.F3.g1），需从 PDF https://arxiv.org/pdf/2503.01840 取 |
| Fig 6 attention mask | "attention causal masks during training-time test"：原生步 + 两个模拟步，灰/蓝/黄 token | 同上（S3.F6.g1），取 PDF |
| Fig 1 scaling law | MT-bench，Llama-3.1-8B，x 轴为相对 ShareGPT 的数据倍数；EAGLE-3 曲线随数据上升，EAGLE 平坦 | 同上 |
| Fig 4 / Fig 7 | 不同数据规模的接受率 / n-α 接受率 | 同上 |
| README 横幅 | https://raw.githubusercontent.com/SafeAILab/EAGLE/main/figs/eagle3r.jpg ，演示 gif .../figs/e3.gif（Vicuna-13B, 2x RTX 3090 fp16） | 可直接下载 |

## 7. 与其他技术的关系
- EAGLE → EAGLE-2：只改"怎么建树"（静态→按置信度动态，推理期改动，无需重训）。EAGLE-2 → EAGLE-3：改"drafter 输入与训练目标"，需重训。
- Medusa：多个并行头、复用顶层特征，Medusa 在非贪心下放宽接受条件，不保证无损（[P] Table 1 题注）；Hydra 为序贯依赖头。EAGLE 系为单层自回归 drafter。
- MTP（DeepSeek-V3 预训练目标）：论文称 EAGLE 启发了 MTP、MTP 又启发了 EAGLE-3（§2.2）；具体架构异同未在本次逐点核实。
- DFlash / DSpark：本次未查阅其论文，对 EAGLE-3 的对比数字 未核实。
- 生态（[R] Support 列表）：已合并入 SGLang、vLLM（PR #16937）、NVIDIA TensorRT-LLM、TensorRT Model Optimizer、NeMo、AMD ROCm、AWS NeuronX、MLC-LLM、PaddleNLP、AngelSlim、CPM.cu；训练框架 SpecForge（SGLang，README 2025.7.23 "强烈推荐"）、vllm-project/speculators。[R] 的 EAGLE-3 权重表含官方 Vicuna-13B、Llama-3.1-8B、Llama-3.3-70B、DeepSeek-R1-Distill-8B（yuhuili/*），第三方 Llama-4 Scout/Maverick（lmsys）、Qwen3 多个尺寸（AngelSlim/Tengyunw/nvidia/lmsys）、GPT-OSS-120B（lmsys、nvidia）、GLM-4.7-Flash、MiniCPM4-8B、OLMoE 等；表中**未列 Kimi**（Kimi 头 未核实）。仓库声明只认官方 checkpoint；Qwen3 官方版仍是未勾选 Todo。

## 8. 易错点
1. 不是"预测特征"：EAGLE-3 去掉了 l_fea，直接 token 级 loss；"feature-level autoregression"是 EAGLE-1/2 的。
2. 融合的是目标模型 low/mid/high 三层，不是顶层；论文未给层号，仓库为 idx 2、L/2、L-3。
3. Step 2+ 的输入是 drafter 自己的输出 a（不是 g），推理时如此，训练时就模拟它；Step 1 用真特征。
4. 草稿"1 层 decoder"≠"共享目标 LM head"：代码里有独立、裁剪词表的 lm_head（d2t/t2d）。
5. "6.5x"是 Vicuna-13B/HumanEval/T=0 的最高值，不是平均；平均 5.51x(Vicuna)、Llama-3.1-8B 仅 4.44x。1.4x 是对 EAGLE-2 的相对提升，非绝对。
6. SGLang bs=64 的 38% vs 引言 40%；vLLM 表 RTX3090 vs A100 论文自身不一致；SGLang/vLLM 实验无树、短链，与 Table 1 设置不同，且由 SGLang 团队测。
7. Scaling law 图的 x 轴是"相对 ShareGPT 的数据倍数"，并非 token 数；"8x 数据"为论文口径。
8. Mask 图的灰/蓝/黄是三类 token（训练数据/第一轮预测/第二轮预测），不是三层特征。
9. 无损 = 采用严格 speculative sampling 接受条件；加速比与 τ 受温度、任务影响（T=1 更低）。

## 9. 可视化建议
1. 一轮解码流水：目标模型画 32 层条（高亮 2/16/29，注明"取自仓库代码"），三条特征 → concat(3k) → FC(k) → 与 token embedding 拼接 → FC → 单层 decoder → LM head；Step1 用真特征 g，Step2/3 把上一步输出 a 回灌（对应 Fig 5 的 "How can I → do → it"）。
2. 训练时测试的 mask 动画：左边一格 3×3 下三角（原生步），逐步翻到第 2、3 步，mask 变成"对角线 + 指向原序列的列"，灰/蓝/黄三色 token 与 Fig 6 一致；旁边并排一条接受率曲线（Fig 7：EAGLE 的 n-α 下降 vs EAGLE-3 持平）。
3. 动态树 + 一次验证：深度 8、节点数固定的树，按置信度生长/剪枝，高亮被目标模型一次 tree attention 验证后接受的路径，计数 τ；末尾放 Table 1 的柱状对比（EAGLE-2 vs EAGLE-3，同模型同任务）。
