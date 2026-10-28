# MTP (Multi-Token Prediction) 调研

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
