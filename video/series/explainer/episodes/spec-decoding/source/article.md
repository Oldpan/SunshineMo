# 五种投机解码：资料汇编（复核只认这一份）

视频「加快 LLM 速度最快 6 倍，五种投机解码全解析」里的每个事实都出自下面的原文。各节为调研笔记，含原文位置；画面里标「示意」的数值（概率条长度、存活柱高、吞吐曲线形状、树和楼层位置）是为讲解画的，不是原文数据。

## 0. 基础：先猜后验与无损

- 投机解码 / 投机采样：Leviathan, Kalman, Matias, "Fast Inference from Transformers via Speculative Decoding", ICML 2023, arXiv 2211.17192；Chen et al., "Accelerating Large Language Model Decoding with Speculative Sampling", arXiv 2302.01318。
- 接受规则（Leviathan §2.3 / Chen Algorithm 2）：草稿 token x 以概率 min(1, p(x)/q(x)) 接受（p 为大模型分布，q 为草稿分布）；被拒时从归一化的 max(0, p − q) 重新采样；输出分布与大模型逐个采样完全相同。全部接受时大模型再多给一个 token（bonus）。贪心（T = 0）时等价于草稿 token 与大模型 argmax 相同才接受。
- 接受长度 τ：每轮验证平均落下的 token 数，含 bonus token（DFlash §3.1：τ ∈ [1, γ+1]）。
- 延迟模型：DFlash §3.1 式 (1) L = (T_draft + T_verify) / τ；自回归起草 T_draft = γ·t_step（式 2），扩散起草 T_draft = t_parallel（式 3）。
- 「为什么能快」两句原话：
  - DFlash 论文 §1："inference is slow, memory-bound, and fails to fully utilize modern GPUs"（arXiv 2602.06036）。
  - EAGLE-3 论文 §1："reduce memory accesses and lower latency during memory-bound decoding by leveraging redundant computational power"（arXiv 2503.01840）。
- 开场演示句（今天天气很好…）和每轮猜对几个，是自拟示意，不是实验数据。

## 时间线（视频按此排序）

| 方法 | 首次公开 | 出处 |
|---|---|---|
| MTP（Meta） | 2024-04-30 | arXiv 2404.19737 |
| MTP（DeepSeek-V3） | 2024-12-27 | arXiv 2412.19437 |
| EAGLE-3 | 2025-03-03 | arXiv 2503.01840（NeurIPS 2025） |
| DFlash | 2026-02-05 | arXiv 2602.06036（ICML 2026） |
| DSpark | 2026-07-06 论文（权重 2026-06-27 上 HF） | arXiv 2607.05147 |
| DFlash 2 | 2026-08-18 博客（模型 2026-08-15 上 HF） | https://inco.ai/blog/dflash2/ |

## DeepSeek-V4.1 技术报告原文（DSpark 一节引用）

来源：https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/resolve/main/DeepSeek_V41_Tech_Report.pdf

- §2.1："We omit the MTP module during backbone pre-training and use DSpark (Cheng et al., 2026a) for speculative decoding. We train DSpark separately after the backbone pre-training stage."
- §2.4.3："The drafter comprises three Transformer blocks with a sliding attention window of 128 tokens. A single forward pass through these blocks computes base logits for five draft positions in parallel, while a lightweight Markov head models dependencies among the draft tokens. A confidence head predicts per-position conditional acceptance probabilities, which are used to estimate prefix survival probabilities. The scheduler combines these estimates with profiled engine throughput curves to dynamically select the verification length for each request…"
- §2.4.3："Unlike the MTP module in DeepSeek-V3, which is trained jointly with the backbone throughout pre-training, DSpark is introduced in a dedicated stage after pre-training."


---

## MTP (Multi-Token Prediction) 调研

## 1. 身份 & 时间线
| 日期 | 里程碑 | 机构 | 链接 |
|---|---|---|---|
| 2018-11-07 (arXiv v1) | Blockwise Parallel Decoding for Deep Autoregressive Models (Stern et al.)：多头并行提议 k 个 token，再回退到打分模型验证的最长前缀 | Google | arxiv.org/abs/1811.03115 |
| 2024-04-30 | Better & Faster LLMs via Multi-token Prediction (Gloeckle et al.)：共享 trunk + n 个独立并行 head，作为辅助训练任务；4-token 模型自推测解码 | Meta | arxiv.org/abs/2404.19737 |
| 2024-12-27 (v1；v2 2025-02-18) | DeepSeek-V3 Technical Report §2.2：顺序 MTP 模块，保持因果链；D=1；推理可丢弃或用于推测解码 | DeepSeek-AI | arxiv.org/abs/2412.19437 |
| 2025-05-12 | MiMo-7B（arXiv 2505.07608）：1 个 MTP 层，model card 称接受率约 90% | Xiaomi | HF XiaomiMiMo/MiMo-7B-RL README |
| 2025 (具体日期未核实) | GLM-4.5 / 4.6：config.json `num_nextn_predict_layers: 1`，README 说明所有模型用 MTP 层做 speculative | 智谱 Z.ai | HF zai-org/GLM-4.5 |
| 2025 (日期未核实) | Qwen3-Next-80B-A3B：README 列 MTP 为特性，vLLM `qwen3_next_mtp`，num_speculative_tokens=2 | 阿里 Qwen | HF Qwen/Qwen3-Next-80B-A3B-Instruct |
| 日期未核实 | MiniMax-M2：config `use_mtp:true, num_mtp_modules:3`；Qwen3.5-397B-A17B：config `mtp_num_hidden_layers:1` | — | HF config.json |
| 反例 | Kimi-K2-Instruct config `num_nextn_predict_layers: 0`（不带 MTP） | Moonshot | HF config.json |
| 2026-07-06 | DSpark（arXiv 2607.05147）：DeepSeek+北大的置信度调度推测解码 | DeepSeek/PKU | arxiv.org/abs/2607.05147 |

推理引擎：vLLM 文档 docs/features/speculative_decoding/mtp.md 定义 MTP 为"目标模型自带原生多 token 预测能力，无需另给 draft model"，`"method":"mtp"`；SGLang 的 GLM-4.5 示例用 `--speculative-algorithm EAGLE --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4`（MTP 层复用 EAGLE 流水线）。

## MTP"出现"以哪个日期？
建议：**以 Meta 2024-04-30 作为 MTP 这一名称/训练范式的出现；DeepSeek-V3 2024-12-27 作为"顺序 MTP + 随模型发布的原生 drafter"的普及节点**。理由：DeepSeek-V3 §2.2 开头明说 "Inspired by Gloeckle et al. (2024)"；Meta 论文自己也把 blockwise parallel decoding (Stern 2018) 列为可用的自推测方式，因此"多头并行预测"的最早祖先是 2018。但**EAGLE (2024-01-26) 和 Medusa (2024-01-19) 早于 Meta MTP**，视频按时间排序时 MTP 在 EAGLE 之后、EAGLE-3 (2025-03-03) 之前；若严格比较"推测解码 drafter"，应讲清 MTP 的新意是"训练时联合训练"而不是"发明了多头 drafter"。

## 2. 一句话
MTP = 训练时让模型在每个位置除了下一个 token 外，再多预测后面若干 token；这些多出来的预测头/模块在预训练中就已训练好并共享主模型的 embedding 与输出头，推理时可直接当 drafter，因此无需另训、另存一个草稿模型，"几乎免费"。

## 3. 一轮解码（DeepSeek-V3 式，D=1）
论文 §2.2 公式 (21)–(23)：
1. 主模型对已确认前缀做一次 forward，得到位置 i 的隐状态 h_i^0，输出头给出 t_{i+1} 的分布。
2. MTP 模块 k：输入 = 上一深度的隐状态 h_i^{k-1} 与 token t_{i+k} 的 embedding，各自 RMSNorm → 拼接 → 投影矩阵 M_k (d×2d) → 一个 Transformer block TRM_k → 共享 OutHead，得到 P_{i+1+k}（即再往后一个 token）。k=1 时 h^{0} 来自主模型。
3. 链式：深度 k 的输出 h^k 作为深度 k+1 的输入，因此每个草稿 token 都看得到前一草稿 token（因果链完整）。V3 只有 D=1，即只多草一个 token。
4. 验证：下一轮主模型一次 forward 并行验证草稿 token；通过则同时得到额外 token，否则回退。具体接受规则论文未写，沿用通用 speculative decoding（Leviathan 2023 / Xia 2023，§5.4.3 引用）；采样接受判据 论文未详述，未核实。
5. 复用：embedding、output head 共享主模型；主干隐状态来自主模型当次 forward。新增参数只有 M_k 与一个 Transformer block。

**对比 Meta**：Meta 是 shared trunk → n 个**独立** head（各为 transformer 层 f_{h_i}，共享 unembedding f_u）一次并行出 n 个 token，各 head 互不依赖（P(x_{t+i}|x_{t:1}) = softmax(f_u(f_{h_i}(f_s(x))))）；DeepSeek 明确写 "Different from Gloeckle et al. ... parallelly predicts ... using independent output heads, we sequentially predict ... and keep the complete causal chain"，并指出该原则 "similar to that of EAGLE"，但 EAGLE 目标是推测解码，而 V3 用于改进训练。

## 4. 训练
- 每深度交叉熵 L^k_MTP = −(1/T) Σ_{i=2+k}^{T+1} log P_i^k[t_i]（式 24）；总损失 L_MTP = (λ/D) Σ_k L^k_MTP（式 25），作为主损失之外的附加目标。
- λ：前 10T tokens 为 0.3，后 4.8T tokens 为 0.1（§4.2 超参）。D=1（§4.2）。
- 与主模型预训练联合训练，非事后蒸馏的 drafter。
- Meta：n 个 head 的损失之和；为省显存，按 head 顺序做 forward/backward，峰值显存从 O(nV+d) 降到 O(V+d)（§2, Fig.2）。

## 5. 关键数字
| 数字 | 出处 |
|---|---|
| 第二个 token 接受率 85%–90% | DeepSeek-V3 §5.4.3 |
| 解码速度 1.8× TPS | 同上 |
| D = 1；λ=0.3(前10T)/0.1(后4.8T) | §4.2 |
| 消融：Small MoE (15.7B, 1.33T tok) HumanEval 20.7→26.8，MBPP 35.8→36.8，GSM8K 25.4→31.4；Large MoE (228.7B, 540B tok) HumanEval 44.5→53.7，MMLU 67.5→66.6（回退） | Table 4 |
| 推理开销相同（丢弃 MTP） | §4.5.1 |
| Meta：4-token 模型自推测 3.0×（代码，平均 3 个建议中接受 2.5）、文本 2.7×；8-byte 模型 6.4× | Meta §3.2 / 附录 Table S2, S3 |
| Meta 表 S2：代码 4 heads 3.05×，3.50 tokens/forward；2 heads 1.85×；3 heads 2.54× | Table S2 |
| Meta：13B 比 NTP 多解 12% HumanEval、17% MBPP；n=4 对 7B 最佳 | Abstract / §3.3 |
| MiMo-7B：1 MTP 层，接受率约 90% | HF README |

## 6. 原文图
- DeepSeek-V3 Figure 3："Illustration of our Multi-Token Prediction (MTP) implementation. We keep the complete causal chain for the prediction of each token at each depth." 图 URL（SVG）：https://arxiv.org/html/2412.19437v2/2412.19437v2/nextn.svg （相对路径 `2412.19437v2/nextn.svg`，基准 https://arxiv.org/html/2412.19437v2/，实际可访问路径未逐一核实）
- Meta Figure 1："Overview of multi-token prediction. (Top) During training, the model predicts 4 future tokens at once, by means of a shared trunk and 4 dedicated output heads. During inference, we employ only the next-token output head. Optionally, the other three heads may be used to speed-up inference time. (Bottom) ... improves pass@1 on the MBPP code task..." 图：arxiv.org/html/2404.19737v1/2404.19737v1/img/main_fig_col.png；Figure 2 显存顺序 backward_order.png。
- 以上图 URL 由 HTML 的 img src 拼出，下载可达性未实测。

## 7. 与其他技术的关系
- **Medusa (2024-01-19)**：多个并行 head、事后在冻结/微调的主模型上训练；MTP 是预训练期联合训练，Meta 称这使 head 比简单微调更准（§3.2）。
- **EAGLE (2024-01-26)/EAGLE-3 (2025-03-03)**：单层自回归 drafter，吃主模型特征+上一 token embedding，保因果链；V3 的 MTP 模块结构与之同源（V3 原文自述 similar）。EAGLE-3 用 training-time test、多层特征融合，与 MTP 的区别是通常事后训练。
- **DSpark (2026-07-06, arXiv 2607.05147)**：DeepSeek+北大，独立训练的 drafter；据二手报道（the-decoder、Spheron，未核实）相对 DeepSeek 自家 MTP-1 基线提速 60–85%（V4-Flash）；论文原文数字未核实。

## 8. 易错点
- Meta 的 head 是并行独立的；DeepSeek 是顺序的、含因果链，不要混为一谈。
- V3 的 MTP 首要目的是**训练目标**（densify 信号、pre-plan 表征），推理时可直接丢弃；用于推测解码是"另外可以"。
- 1.8× 是 D=1、仅多一个草稿 token 的结果，来自 85–90% 接受率（理论上 1+0.85~0.9 ≈ 1.85~1.9，论文未给此推算，此为说明性算术，非原文）。
- V3 config 中 num_hidden_layers=61，另有 num_nextn_predict_layers=1，MTP 权重与主模型一起发布。
- Table 4 中 MTP 并非全部指标提升（如大模型 MMLU 下降）。
- MTP 不是 Meta 首创的"多头 drafter"，2018 Stern、2024-01 Medusa/EAGLE 在先。

## 9. 可视化建议
1. 单轮因果链：主模型 forward 得 h_i，→ 两个并排输入（RMSNorm(h)、RMSNorm(Emb(t_{i+1}))）拼接 → M_k → TRM_k → 共享 OutHead 吐出草稿；高亮 Emb 与 OutHead 与主模型共用。
2. 并行 vs 顺序对照：左 Meta（trunk 分叉成 4 个独立 head），右 DeepSeek（模块 1 输出喂给模块 2）；箭头表明依赖。
3. 训练与推理两态：同一 MTP 模块，训练态 L^k 加权求和（λ 0.3→0.1）；推理态两种分支——丢弃 / 作 drafter；再用 85–90% 和 1.8× 数字收尾。

---

## EAGLE-3 调研（讲透系列：DFlash / DFlash2 / DSpark / MTP / EAGLE-3）

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

---

## DFlash 研究笔记（2026-10-28 核实）

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

---

## DSpark 调研（主源：arXiv 2607.05147 与 HF 权重/代码）

- 论文：DSpark: Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation，https://arxiv.org/abs/2607.05147 （v1 Submitted on 6 Jul 2026，已核实），PDF https://arxiv.org/pdf/2607.05147
- 机构：DeepSeek-AI 与北京大学（通讯邮箱 deepseek.com）。一作 Xin Cheng、Xingkai Yu、Chenze Shao、Jiashi Li、Yunfan Xiong（等贡献）。论文没有给出 "DSpark" 的缩写展开。
- 首次公开：2026-06-27 HF 仓库 deepseek-ai/DeepSeek-V4-Flash-DSpark 与 DeepSeek-V4-Pro-DSpark 创建（HF API createdAt，已核实），README："same checkpoint with an additional speculative decoding module attached"，vLLM `method: dspark`。2026-06-28 deepseek-ai/dspark_qwen3_{4b,8b,14b}_block7、dspark_gemma4_12b_block7 与训练库 DeepSpec（github.com/deepseek-ai/DeepSpec）。2026-07-06 arXiv v1。
- 4 月 V4 preview 报告（arXiv 2606.19348）里没有 "dspark"。论文 §5.4：MTP-1 "superseded by DSpark two weeks following the DeepSeek-V4-preview release"。
- DeepSeek-V4.1-Flash 技术报告 §2.4.3 "DSpark" 引用 Cheng et al., 2026a；V4.1 把 MTP 从预训练中去掉，改用 DSpark（§2.1 / §2.4.3）。报告：https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/resolve/main/DeepSeek_V41_Tech_Report.pdf
- V4.1-Flash config.json：dspark_block_size 5、dspark_noise_token_id 128799、dspark_target_layer_ids [37,38,39]（主干 40 层的最后三层）、dspark_markov_rank 256、dspark_n_routed_experts 128、dspark_num_experts_per_tok 3、num_nextn_predict_layers 3。V4-Flash-DSpark：target_layer_ids [40,41,42]，num_nextn_predict_layers 1。
- 第三方：RedHatAI/Kimi-K3-speculator.dspark 默认 8 个 draft token（block_size 8）；RadixArk/Kimi-K3-DSpark 为 block 7。

## 一句话
普通 draft-and-verify：固定长度草稿，全部送去验证。DSpark：草稿阶段先并行出整块 base logits，再用轻量 Markov head 串行修正（后一个 token 能看到前一个）；验证阶段用 confidence head 估计每个位置的存活概率，由调度器按当前引擎吞吐曲线为每个请求选验证长度。

## 一轮流程（论文 §3、Alg.1、§5；代码 inference/model.py）
1. 主模型前向，多出一个 token 作 anchor（论文脚注：anchor 与 bonus token 同义）。代码在 target_layer_ids 层收集隐藏态并拼接为 main_hidden。
2. 投影：main_x = main_norm(main_proj(main_hidden))，线性层 dim×层数 → dim（对应 DFlash 式 (2)）。
3. 并行输入：[anchor, noise_token × (block_size−1)]。embedding 与 LM head 共享目标模型且冻结。
4. 并行 backbone：线上 3 个 MoE 层，mHC，sliding window 128，γ=5（§5.1）。DSparkAttention 的 K/V 由草稿块自身与 main_x 的 KV 拼接；块内双向，无 causal mask。一次前向得到 h₁..h_γ 与 base logits U₁..U_γ。
5. Markov head（串行、轻量）：式 (4)(5) p_k(v) = softmax(U_k(v) + B(x_{k−1}, v))，B = W1·W2 低秩，W1 为 V×r embedding 查表，W2 为 r×V，r = 256；一阶，只依赖上一个 token。代码 forward_head 逐位：logits[i] += markov(output_ids[i])，采样得到 output_ids[i+1]。草稿分布仍是精确逐位 softmax，可做 rejection sampling。
6. Confidence head：式 (7) c_k = σ(wᵀ[h_k ; W1[x_{k−1}]])；c_k = 前面都被接受时第 k 个通过验证的条件概率。§3.2.1 Sequential Temperature Scaling (STS) 校准。
7. 前缀存活概率与调度（Alg.1、§3.2.2）：a_{r,j} = ∏_{i≤j} c_{r,i}；验证 batch B = Σ_r(1+ℓ_r)；期望接受 τ = Σ_r(1 + Σ_{j≤ℓ_r} a_{r,j})；吞吐 Θ = τ · SPS(B)，SPS(B) 为启动时 profile 的每秒步数表。所有（请求, 位置）按 a 降序逐个纳入，Θ 不再上升就停（non-anticipating，保证无损；附录 A 反例）。
8. 线上（§5.2）：真实 SPS 曲线呈锯齿阶梯，去掉 early stop 做全局搜索；为兼容 CUDA graph，用"两步之前"的 confidence 定截断容量 K。
9. 验证：标准 speculative sampling min(1, p_t/p_d) 左到右接受，首个拒绝处丢弃后续并采样修正 token（Figure 1 例：E、F 接受，G 被拒，换成 G*）。

## 训练（§3.3、§4.1、§5.1；V4.1 报告 §2.4.3）
- 目标模型冻结；共享冻结的 embedding 与 LM head；只训 backbone、sequential block、confidence head。
- L = 0.1·L_ce + 0.9·L_tv + 1.0·L_conf；位置权重 w_k = exp(−(k−1)/γ)（沿用 DFlash）。L_tv = ‖p_d − p_t‖₁；L_conf 软标签 c*_k = 1 − ½‖p_d − p_t‖₁。
- 离线数据：Open-PerfectBlend 130 万条 prompt，回复由目标模型重新生成，10 epoch。
- V4.1（报告 §2.4.3）：V3 的 MTP 随主干预训练联合训练；V4.1 预训练不再带 MTP，DSpark 在预训练后单独阶段训练、backbone 冻结；后训练时一起继续训，但梯度不回传 backbone。

## 关键数字
Table 1（accepted length τ，含 bonus token，temperature 1.0，关闭 scheduler，chain，γ=7）：

| 目标 | Drafter | GSM8K | MATH | AIME25 | MBPP | HumanEval | LCB | MT-Bench | Alpaca | Arena-Hard |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-4B | Eagle3 | 5.14 | 4.62 | 3.92 | 3.69 | 4.16 | 3.77 | 2.39 | 2.26 | 2.55 |
| Qwen3-4B | DFlash | 5.40 | 4.85 | 4.15 | 4.40 | 4.74 | 4.18 | 3.07 | 2.96 | 2.83 |
| Qwen3-4B | DSpark | 6.11 | 5.70 | 4.89 | 5.13 | 5.38 | 4.86 | 3.64 | 3.54 | 3.29 |
| Qwen3-8B | DSpark | 6.17 | 5.78 | 5.01 | 5.16 | 5.52 | 5.17 | 3.72 | 3.58 | 3.21 |
| Qwen3-14B | DSpark | 6.21 | 5.74 | 4.94 | 5.26 | 5.43 | 5.02 | 3.70 | 3.58 | 3.13 |
| Gemma4-12B | DSpark | 6.05 | 5.78 | 5.12 | 5.11 | 5.64 | 4.51 | 3.49 | 3.35 | 2.92 |

- 宏平均相对 Eagle3：+30.9% / +26.7% / +30.0%（Qwen3-4B/8B/14B）；相对 DFlash：+16.3% / +18.4% / +18.3%。
- Figure 4：γ=7 时 DSpark 比 DFlash 的 τ 高 16%（math）/15%（code）/18%（chat）；γ=15 时 30% / 26% / 22%。2 层 DSpark 超过 5 层 DFlash（Figure 3）。序列头：batch 128 下草稿长度 4→16 只增加全轮延迟 0.2%–1.3%。
- Figure 2（Qwen3-4B，位置条件接受率）：第 1 位 DFlash 0.88 vs Eagle3 0.81（math），0.72 vs 0.53（chat）；DSpark math 第 1 位 0.93；DFlash code 0.87 → 0.78，chat 0.72 → 0.63；Eagle3 chat 0.53 → 0.74。
- §3.1 例子：纯并行时第 1 位 "of"/"no"、第 2 位 "course"/"problem" 独立，可能拼出 "of problem"；Markov 偏置在第 1 位采到 "of" 后提高 "course"。
- Figure 6：原始 ROC-AUC 0.81–0.90、ECE 3%–8%；STS 后平均 ECE 约 1%。
- 线上（V4 preview，对比 MTP-1，Figure 7/8，§5.4）：同吞吐下单用户速度 V4-Flash +60%～85%，V4-Pro +57%～78%；中等 SLA 吞吐 V4-Flash +51%（80 tok/s/user）、V4-Pro +52%（35 tok/s/user）；+661% / +406% 是基线接近运行边界的名义值，作者说明不应当作乘数。MTP-1 静态验证 2 token；DSpark 在 V4-Flash 并发低于 200、V4-Pro 低于 150 时扩到约 4–6 token，并发升高平滑缩短（Figure 8）。静态 MTP-3/5 在高并发下因验证开销拉低总吞吐（§5.4）。

## 关系
- MTP（V3）：论文归为 autoregressive drafters；线上基线是 MTP-1。
- EAGLE-3：论文的 autoregressive 基线（1 层草稿），Table 1 全面被超过。
- DFlash：DSpark 的 backbone 就是 DFlash（KV 注入目标层隐藏态、块内双向注意力、冻结共享 embedding/LM head），加 Markov 序列头、confidence head 与调度器。
- 论文未提 DFlash2。

---

## DFlash 2 调研

## 1. 身份
- 全名: **DFlash 2: Keep Drafting Parallel**(只有博客 + 模型卡,**没有 arXiv 论文**,未检索到 v2 论文)。
- 作者/机构: 署名 "Inco AI"(博客 https://inco.ai/blog/dflash2/ ,日期 2026-08-18)。代码/模型挂在 z-lab(DFlash 原作者组:Jian Chen, Yesheng Liang, Zhijian Liu)的 GitHub 与 HF 下;z-lab HF 卡写明是 `incoai/Qwen3.8-27B-DFlash2` 的 mirror。z-lab 与 Inco AI 的具体关系博客未说明(未核实)。
- 时间线(HF API createdAt): z-lab/Qwen3.8-27B-DFlash2 创建 2026-08-15;z-lab/Muse-Glimmer-30B-DFlash2 2026-08-14;博客发布 2026-08-18。原 DFlash 论文 arXiv:2602.06036(2026-02),ICML 2026。
- 链接: 博客 https://inco.ai/blog/dflash2/ ;模型卡 https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2 ;repo https://github.com/z-lab/dflash (README 已含 DFlash 2);config https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2/raw/main/config.json
- 目前官方检查点仅两个: Qwen3.8-27B、Muse-Glimmer-30B(repo README "Supported Models")。社区大量 "-DFlash2" 检查点(incoai/、nvidia/、RedHatAI/ 等)存在(HF 搜索结果)。

## 2. 一句话
在 DFlash(单次前向并行预测整块 token)基础上加两个小模块:(a) **路径选择器**:每个位置保留 top-16 候选,对相邻候选对做低秩双线性打分,走出一条连贯路径;(b) **两抽头动态卷积**插在每层 attention/MLP 前后,缓解块尾准确率衰减(suffix decay)。输出无损不变。博客称: 每次验证多产出 >20% token,周期延迟仅 +1%(+1.3% 见 Table 3 下文),跨基准增益 16–25%。

## 3. 一轮 decoding(均出自博客,除注明)
1. 目标模型已验证到最后一个 token;drafter(5 层 Qwen3 风格, 1.92B 参数 for 27B, HF API safetensors)读取目标模型若干层隐状态(config `target_layer_ids=[5,19,33,47,61]`,target 共 64 层;"取这些层 hidden states 做条件"的解读来自 DFlash 原设计,DFlash2 博客未单独展开,部分未核实)。
2. 块 = block_size 8(1 个已验证 token + 7 个 `<mask>` 位置;Muse 用 16)。**一次前向并行**填所有 mask 位置(非多步扩散、非树)。块内为非因果(`is_causal:false`)。
3. 卷积:每个位置混合"自己 + 前一位置"(两抽头,kernel 随内容动态,16 通道共享一个修正),第一个位置读最后已验证 token 的表示。(Figure 4)
4. 每位置输出 logits,保留 **top-16** 候选(`selector_top_k:16`)。
5. 选择器: S_t(a,b)=U_t(b)+⟨A(a)⊙H(h_t),B(b)⟩;U 为 DFlash 自身 logit,A/B 为 256 维 token 嵌入(`selector_rank:256`),H 为上下文门。所有相邻对一次并行打分,无额外 backbone/LM-head 前向;唯一串行的是对预计算分数的最后一遍"走路径":从最后已验证 token 起,greedy 取最佳后继,采样则从同一分数抽样。
6. 目标模型一次前向验证整块。T=0 贪心输出与目标完全一致;T>0 用 **rejection sampling** 恢复目标分布(博客原文 "rejection sampling restores the exact target distribution")。具体接受判据公式博客未写,按标准 speculative sampling 理解(未核实细节)。
7. 接受前缀 + 目标模型给的下一个 token("Acceptance length includes the verifier's next token"),作为新的已验证起点,进入下一轮。

## 4. 训练
博客**未披露**训练数据、损失、超参(未核实/无)。仅知: "DFlash 与 DSpark drafter 在匹配设置下自训"(Table 3 对照);Figure 2 各模型"同一训练设置"。卷积新增 16.5M 参数(+3%,5 层 Qwen3-4B 版);选择器 +2.0M(Table 2)。训练细节请参考原 DFlash 论文 https://arxiv.org/abs/2602.06036(本次未逐节核对)。

## 5. 关键数字
**Table 1** (博客, 5 层 Qwen3-4B DFlash, GSM8K): 位置0 Recall@1 85.4% / Recall@16 99.5%;位置6 72.9% / 87.8%;Acceptance 4.27 vs oracle(top-16) 6.79。
**Table 2** (Qwen3-4B, GSM8K, 仅选择器): DFlash T=0 4.27 / T=1 3.78;+DSpark correction (+77.8M, +9.6%延迟) 4.49 / 4.08;+path selection (+2.0M, +0.6%) 4.61 / 4.25。
**Table 3** Qwen3.5-4B 平均 τ(thinking, T=1.0, 自训 DFlash/DSpark):
| | MTP | DFlash | DSpark | DFlash 2 |
|---|---|---|---|---|
| GSM8K | 4.78 | 4.99 | 5.69 | 6.20 |
| MATH-500 | 5.04 | 5.42 | 6.20 | 6.76 |
| HumanEval | 4.84 | 5.43 | 5.80 | 6.28 |
| MBPP | 4.16 | 4.49 | 4.96 | 5.41 |
| MT-Bench | 3.90 | 4.26 | 4.77 | 5.20 |
| Mean | 4.54 | 4.92 | 5.49 | 5.97 |
(较 DFlash +1.05/21%,较 DSpark +0.48)
**Table 4** Qwen3.8-27B τ(block 8): Mean MTP 4.28 / DSpark(社区 RadixArk) 3.62 / DFlash2 4.80。GSM8K 5.02/4.36/5.46,MATH-500 4.72/3.92/5.28,HumanEval 3.91/3.30/4.39,MBPP 3.99/3.51/4.79,MT-Bench 3.74/3.01/4.10。
**Table 5** Muse Glimmer τ(block 16): Mean DFlash 4.44 / DSpark 4.48 / DFlash2 5.70。
**吞吐**(HF 模型卡,SGLang,1×H200,FA3,block 8,T=1.0 top-p0.95 top-k20,xhigh reasoning,max 4096 新 token),output tok/s(加速比 vs 自回归):
| 并发 | 任务 | AR | MTP | DSpark | DFlash 2 |
|---|---|---|---|---|---|
| 1 | GSM8K | 68.9 | 178.5 (2.59×) | 185.3 (2.69×) | 236.1 (3.43×) |
| 1 | MT-Bench | 68.9 | 134.9 (1.96×) | 137.6 (2.00×) | 184.0 (2.67×) |
| 8 | GSM8K | 467.2 | 1,022.1 (2.19×) | 1,040.8 (2.23×) | 1,328.7 (2.84×) |
| 8 | MT-Bench | 480.5 | 835.2 (1.74×) | 802.3 (1.67×) | 1,090.2 (2.27×) |
| 32 | GSM8K | 1,329.8 | 1,381.1 (1.04×) | 1,506.5 (1.13×) | 1,922.5 (1.45×) |
| 32 | MT-Bench | 1,507.4 | 1,159.7 (0.77×) | 1,115.5 (0.74×) | 1,525.3 (1.01×) |
bs=1 范围 2.67–3.43×(博客写 2.7–3.4×);Muse Glimmer 3.1–4.6×(博客,分任务表未取)。
**没有 DFlash2 对 EAGLE-3 的对比数据**(博客/卡中均无,不要编)。DFlash2 vs DFlash 的直接数字仅在 Qwen3.5-4B(Table 3)与 Muse(Table 5)。
Figure 5(MATH-500, Qwen3.5-4B 条件接受率): DFlash 2 位置0 88.3% → 位置14 86.48%;DFlash 88.35% → 77.48%;DSpark 87.24% → 79.86%;MTP 84.57% → 77.85%。

## 6. 原文图
- 卡首图(整体机制,"parallel block drafting with a candidate path selector"): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2/resolve/main/assets/dflash2-figure.png
- GitHub 架构图: https://raw.githubusercontent.com/jianc99/jianc99.github.io/master/images/dflash2_system.png
- 博客 Figure 1(selector 一个周期:两邻位置都选同一词→重复,在验证时死掉;selector 走出连贯路径)、Figure 2(Recall@1 逐位置 3L/5L/15L/5L+conv)、Figure 3(各层各头块内 attention 占比热图:Layer1 30%→Layer5 8%)、Figure 4(两抽头卷积)、Figure 5(条件接受率)。博客图为内联 SVG/交互,无独立图片 URL;页面 https://inco.ai/blog/dflash2/ 。

## 7. 与其他技术
- vs DFlash: 同一"一次前向并行块草稿"设计,增选择器+卷积;不改 attention、LM head、验证。
- vs DSpark/Domino: 博客称它们"用顺序 head 重写各位置全词表分布"代价高;选择器只在 top-16 候选上做 pair 打分,参数少约 40×(2.0M vs 77.8M)、延迟开销少约 16×(0.6% vs 9.6%),τ 更高(Table 2)。注意 Qwen3.8/Muse 上用的 DSpark 是"社区 drafter",非官方,比较公平性存疑。
- vs MTP: Qwen3.8 自带 7-token MTP;DFlash2 τ 更高、bs=1 更快;高并发(32)MTP/DSpark 反慢于 AR(0.77–1.04×)。
- vs EAGLE-3: 无数据;仅知原 DFlash 论文称对 EAGLE-3 最高 2.5× 提速(搜索摘要引用,未回到原文核实)。

## 8. 易错点
- DFlash2 不是 arXiv 论文,是 Inco AI 博客 + z-lab 检查点;引用格式是 @misc。
- 不是 "多步扩散去噪": 一次前向。不是树验证: 单条路径(candidates 仅用于选路)。
- 选择器是低秩双线性 pair 打分,不是"小自回归头"。卷积不替代 attention。
- 训练细节未公开;"τ"包含验证器的 bonus token。
- 加速比对比的基线随表不同(AR / MTP / DSpark);τ 表是 T=1.0 采样,不是贪心。
- 第三方站(MindStudio 等)数字不一致(如 A100 2×),不要采用。
- 并发 32 时优势缩小至 1.01–1.45×。

## 9. 可视化建议
1. 候选格子: 7 列(位置)×16 行 top 候选,先画 DFlash 每列独立选 top-1(两邻位置都是同一词→验证处断掉,对应 Figure 1),再画 pair 分数连线,高亮最终路径;配 Recall@1 85.4% vs Recall@16 99.5%、τ 4.27→6.79 oracle 数字条。
2. 两抽头卷积: 块内每个位置接收"自己 + 前一位置"的箭头,第一个位置连到最后已验证 token(Figure 4);并排画 Recall@1 逐位置曲线 3L/5L/15L/5L+conv。
3. 一轮完整流程: 目标层 5/19/33/47/61 隐状态 → drafter(含卷积)→ top-16 → selector 走路径 → 目标一次验证 → 接受前缀 + bonus token → 下一轮;下方放 Qwen3.8-27B bs=1/8/32 加速比柱状(3.43×/2.84×/1.45×)。
