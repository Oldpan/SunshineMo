# DFlash 2 调研

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
