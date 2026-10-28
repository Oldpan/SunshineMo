# DSpark 调研（主源：arXiv 2607.05147 与 HF 权重/代码）

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
- V4.1：MTP 随主干预训练联合训练；DSpark 在预训练后单独阶段训练、backbone 冻结；后训练时一起继续训，但梯度不回传 backbone。

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
