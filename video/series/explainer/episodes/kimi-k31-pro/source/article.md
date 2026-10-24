# Kimi K3.1 Pro · 事实底稿

本期资料只有两份官方来源，复核只认这份文件：

1. **Kimi K3.1 Pro Tech Blog: Advancing Open Intelligence**（月之暗面官方技术博客，kimi.com，2026-10-23 发布；图片路径 `kimi-blogs/kimi-k3-1/20261023/`）
   https://www.kimi.com/blog/kimi-k3-1-pro
   - K3.1 Pro **没有单独的技术报告 PDF**。博客写明：K3.1 Pro 是 Kimi K3 的后训练版本（a post-trained version of Kimi K3），用了大得多的后训练算力。
2. **Kimi K3: Open Frontier Intelligence — Technical Report of Kimi K3**（Kimi Team，GitHub MoonshotAI/Kimi-K3 仓库 `k3_tech_report.pdf`）
   https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
   - 架构、预训练、后训练方法、基础设施都出自这份报告。视频里凡是讲架构的部分都标「来源：Kimi K3 技术报告」，因为 K3.1 Pro 沿用 K3 的底座。

名称说明：用户口头说的「Kimi 3.1 Pro」，官方名称是 **Kimi K3.1 Pro**；同时发布 **Kimi K3.1 Pro Highspeed**（速度 2–3×）。API 名 `kimi-k3.1-pro` / `kimi-k3.1-pro-highspeed`。

---

## A. K3.1 Pro 官方博客正文（原文）

Introducing Kimi K3.1 Pro We're introducing 
Kimi K3.1 Pro , the first model in our new K3.1 series and our most capable 3T-class open-weight model to date, with a 1-million-token context window. It delivers substantial improvements across coding, 3D creation, financial research, and other agentic capabilities.
We are also releasing 
Kimi K3.1 Pro Highspeed , which delivers 2-3× the speed of K3.1 Pro for more responsive interactions.
Kimi K3.1 Pro and Kimi K3.1 Pro Highspeed are available today on 
Kimi.com , 
Kimi Work , 
Kimi Code , and the 
Kimi API . The full model weights will be released by Nov 4.
Advancing the Frontier of Open Intelligence Kimi K3.1 Pro is a post-trained version of Kimi K3, with substantially larger post-training compute. To enable large-scale joint RL across  hundreds of downstream domains , we optimized every layer of the stack — the RL framework, long-context inference, training efficiency, sandbox infrastructure, rollout scheduling, and a shared platform for environment quality checks — so that each increment of RL compute delivers stable, predictable returns. As a result, K3.1 Pro achieves consistent gains in every domain.
Across coding, agentic, and knowledge benchmarks, K3.1 Pro matches or approaches the strongest proprietary models. On 
Terminal-Bench 4.0 , which evaluates coding agents on realistic, resource-constrained terminal tasks using strict task-specific tests, 
K3.1 Pro scores 65.7%, ahead of GPT-6 Astra (58.2%) and narrowly behind Claude Opus 5.5 (66.4%) . And on 
Kimi Code Bench 3.0 Long-horizon , our internal benchmark that tests coding agents' multi-step execution, tool use, and end-to-end problem solving across diverse engineering domains, K3.1 Pro scores  61.2% , above K3's  55.95% .
Coding K3.1 Pro covers the full range of coding work, from quick fixes in real codebases to full-project builds. It also brings a more considered visual style to games and web experiences, and knows how to build them with the right tools.
K3.1 Pro works effectively across game engines such as 
Unity, Unreal Engine, and Godot , combining them with web search and 3D generation to create complete experiences. Its front-end pages, interactive Three.js scenes, and 3D assets show stronger composition, typography, animation, and polish. The examples below were created end to end by K3.1 Pro:
K3.1 Pro's long-horizon coding capabilities are also strengthened through large-scale reinforcement learning.
 In one internal test, it built a human walking dynamics simulator with integrated training and evaluation pipelines on top of  human-atlas , an open-source anatomical model of the human body comprising 296 skeletal components, including cartilage, and 402 muscle components. Across 167 missions and 420 independent reviews, it analyzed experimental results, diagnosed problems, and iteratively refined the walking controller, enabling the simulated human to go from collapsing within seconds to walking continuously with alternating strides for 11.2 seconds. When reward shaping failed to improve arm motion, K3.1 Pro did not simply keep adjusting the reward: it ran open-loop probes of the simulator's dynamics, identified and corrected 36 errors in shoulder-muscle moment-arm calculations, and then retrained the controller. 3D Modeling and Design K3.1 Pro is strong at 3D creation and spatial reasoning.
 On 
BenchCAD , which tests 3D reconstruction from multi-view renderings through CAD code generation, 
K3.1 Pro scores 92.7% with tools , approaching the performance of 
Claude Opus 5.5 (96.2%)
 and 
GPT-6 Astra (95.9%) . From a text brief, sketch, or reference image, it can infer shape, proportions, and spatial relationships to create usable 3D models. It also has a stronger grasp of existing asset libraries and model collections.
K3.1 Pro particularly excels at parametric modeling, from mechanical parts and architectural models to configurable products and custom furniture.
 Without MCP connectors, it can write and run scripts for tools like Blender and CAD software to build and refine assets, edit components, and adjust geometry, materials, and scene layout.
Below are examples of 3D assets K3.1 Pro created for brand films, games, and interactive web experiences: 3D Make  is now live on  kimi.com  and the Kimi app — preview and edit your 3D models online, download them ready for 3D printing, or export them as videos or Live Photos to share anywhere.
Finance With stronger reasoning and agentic capability, K3.1 Pro is capable of end-to-end delivery of complete financial workflows. K3.1 Pro achieves state-of-the-art results on OfficeQA Pro v2 (64.4),  which tests complex fiscal data analysis over real financial documents through retrieval, cross-document verification, and multi-step numerical reasoning. K3.1 Pro also improves over K3 on Frontier Finance, which measures support for complete investment workflows from screening to profitability analysis.
K3.1 Pro also improves significantly across all our internal finance benchmarks:
Financial Modeling  evaluates formula linkage, financial logic, and final workbook quality in real-world modeling tasks. K3.1 Pro improves on K3 by 7.2 points.
Financial Research  evaluates whether models can produce auditable research under evidence and cutoff constraints. K3.1 Pro improves on K3 by 11.6 points.
Business Operation  evaluates long-horizon management and decision-making in a simulated business environment. K3.1 Pro achieves about 4.2× K3's performance.
Financial analysis and investment research demand a high degree of factual accuracy. To address this, we made targeted improvements to K3.1 Pro's  factual accuracy  on real-world tasks and challenging prompts. On Kimi Hallu Bench Hard bench, an internal benchmark designed to stress-test factual accuracy, its claim-level hallucination rate fell from 23.4% for K3 to 8.3%, while the share of responses containing at least one factual error was just 42.4% of its predecessor's rate. (The evaluation is a stress test for factual accuracy, with examples deliberately crafted to probe situations where models are prone to errors. The reported rates do not represent overall error rates in daily use.)
The cases below show how K3.1 Pro handles financial modeling, investment analysis, and source-grounded research in practice:
Cybersecurity As K3.1 Pro became more capable, we spent a correspondingly larger share of our effort understanding where cyber capability comes from, and how much of it we can control. We therefore analyzed and evaluated K3.1 Pro's vulnerability research capabilities, and applied targeted controls during training to reduce potential misuse risk while preserving general usefulness.
Identifying and removing cyber-related data.
 During development, we observed vulnerability research performance improving steadily as post-training scaled. Tracing the source of this trend, we found that cyber-related content was embedded within the general mid-training corpus, and cyber-related tasks were present in the RL environment mix — a natural byproduct of training on broad data. In preliminary experiments on internal models, we found that without data removal at either the mid-training or the RL stage, downstream cyber capability would increase substantially. These findings gave us a concrete lever for control. For the open-weight release of K3.1 Pro, we identified and removed cyber-related data from both training stages, while retaining the general-purpose coding tasks needed for model usefulness. We will continue to apply appropriate controls at every training stage, of which cyber-related data identification and restriction is one example.
Evaluation and results.
 After data cleaning, we evaluated K3.1 Pro on xdev-bench-hard, our in-house benchmark of expert-curated, source-code-based vulnerability discovery and exploitation tasks, calibrated to provide meaningful differentiation at our current capability level. Most tasks faithfully reproduce recently disclosed vulnerabilities in software such as the Linux kernel, Node.js, JavaScriptCore, Exim, and VirGL, with mitigations enabled. Each task provides the vulnerable source code, a short bug hint, and the corresponding binary; the agent must develop an exploit, achieve arbitrary code execution in a separate sandbox, and retrieve a secret string for automated verification. We report pass@3 over a random subset of runs, with no hard timeouts or output token limits.
On xdev-bench-hard, the checkpoint without these risk-reduction measures — no cyber-related data removal at mid-training and no cyber-related RL environment filtering — solves 90.5% of problems at pass@3; the final K3.1 Pro reaches 81.0%. The comparison shows that data removal meaningfully reduces cyber capability relative to what the same training pipeline would otherwise produce. At the same time, K3.1 Pro improves substantially over its predecessor, indicating that stronger general coding and long-horizon debugging capabilities generalize to cyber tasks even after targeted data removal. K3.1 Pro's cyber capability remains behind that of frontier proprietary models that have been publicly available for at least three months. We will keep evolving our internal benchmarks so that evaluation stays informative as model capabilities continue to advance.
Open-weight principles.
 These evaluations frame our open-weight release decision. First, we aim not to release open weights that would extend the absolute frontier of cyber capability. K3.1 Pro's offensive cyber capability is, by design, below what our pipeline can produce, and remains behind that of frontier proprietary models. Second, we intend to progressively raise the cyber capability available in open weights. We believe making K3.1 Pro available in a non-discriminatory way benefits people who need dual-use capabilities for defensive purposes. When a capable model is open and runs on infrastructure its users control, many more teams gain the means to audit the code they maintain — including legacy systems that rarely receive dedicated security reviews. We believe that letting this capability diffuse gradually — rather than concentrating it in a few proprietary systems — ultimately makes all software more secure.
Availability Kimi K3.1 Pro rolls out today across the Kimi product family: on 
Kimi.com  and the Kimi mobile apps, Kimi Work and Kimi Code, and through the 
Kimi API .
Full model weights will be released by Nov 4, 2026.
Kimi Enterprise administrators  can enable K3.1 Pro for their organization; access is off by default at launch.
Details for each channel:
Kimi Agents:
 Download or update to the latest Kimi app from your mobile app store, available on iOS, Android, and HarmonyOS, or visit  kimi.com .
Work with Kimi K3.1 Pro:
 Download the latest 
Kimi Work desktop app , version 3.1.0 or later, available for Windows and Apple silicon Macs.
Code with Kimi K3.1 Pro:
 Run 
Kimi Code  and select Kimi K3.1 Pro using the 
/model  command.
Build with the Kimi API:
 Visit the 
Kimi API Platform  and select kimi-k3.1-pro / kimi-k3.1-pro-highspeed. Zero Data Retention is available for API customers.
Bring Kimi to your organization:
Kimi Business  provides enterprise-grade data privacy and member management, with complete separation between personal and organization accounts. Visit the pricing page and select “Get Kimi Business” to subscribe for your team.
Benchmarks Footnotes Unless otherwise specified, all Kimi K3.1 Pro results reported below are obtained with the reasoning effort set to 'max', temperature = 1.0, and top-p = 0.95.
Coding benchmarks Terminal-Bench 4.0. Kimi K3.1 Pro is evaluated with the Claude-Code harness. The DeepSeek-V4.1-Flash-1017 is taken from the release blog ( https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 ). All remaining scores are taken as the maximum value reported in either their blog posts or the official Terminal-Bench 4.0 leaderboard ( https://www.tbench.ai/ ).
Terminal-Bench Science 0.1. Kimi K3.1 Pro is evaluated with the Claude-Code harness. Our internal evaluation of DeepSeek-V4.1-Flash-1017 yields a score of 9.3; However, an older version, DeepSeek-V4.1-Flash, scores 15.7 on the official Terminal-Bench Science, so we report 15.7 here; all remaining scores are from the official Terminal-Bench Science leaderboard ( https://www.terminal-bench-science.ai/ ).
DeepSWE v1.1. Kimi K3.1 Pro is evaluated with the Claude-Code harness. All scores are taken from each model's respective technical report. GPT-6 Astra( https://openai.com/index/gpt-6-astra/ ). Claude Opus 5.5 and Claude Fable 5.1( https://www.anthropic.com/claude-opus-5-5-system-card  and  https://www.anthropic.com/claude-fable-5-1-mythos-5-1-system-card ); DeepSeek-V4.1-Flash-1017 ( https://api-docs.deepseek.com/news/news261017/ ); GLM-5.3 ( https://z.ai/blog/glm-5.3 ).
SWE-Marathon v1.1. Kimi K3.1 Pro is evaluated with the Claude-Code harness. DeepSeek-V4.1-Flash-1017 is evaluated with the ClaudeCode harness. All other scores are taken from the official SWE-Marathon leaderboard ( https://www.swe-marathon.org/ ).
PostTrainBench. Kimi K3.1 Pro and DeepSeek-V4.1-Flash-1017 were evaluated internally on v1.2 using the Claude-Code harness and H20 GPUs instead of H100 GPUs. For stable evaluation, all judge models used DeepSeek-V4.1-Flash-1017 at maximum effort, which best matched the official GPT-5.6-Terra (xhigh) judge in testing. Other scores are from the official leaderboard ( https://posttrainbench.com/ ).
ProgramBench (binary score). We report binary scores rather than raw ProgramBench scores: a task receives a score of 1 if its ProgramBench score is ≥95%, and 0 otherwise. Kimi K3.1 Pro is evaluated with the Claude-Code harness. The DeepSeek-V4.1-Flash-1017 and GLM-5.3 scores are taken from the release blog ( https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 ); all remaining scores are from the Vals ProgramBench leaderboard ( https://www.vals.ai/benchmarks/programbench ).
Internal Coding Bench: Kimi Code Bench 2.0 and Kimi Code Bench 3.0 Long-horizon. Kimi K3.1 Pro is evaluated with Claude-Code harnesses; All other models are evaluated at their max-effort setting. Note that proprietary model testing may involve some fallback behavior.
BenchCAD. Open models are evaluated by us on 1,000-case subsets randomly sampled from the full 17,900-case Vision2Code dataset, at maximum reasoning effort. With-tools results use the Claude Code harness; without-tools results use single-shot generation with the official BenchCAD prompts and scoring pipeline. Scores for Claude Fable 5.1 and Claude Opus 5.5 are taken from the 
Claude Opus 5.5 System Card ; GPT‑6 Astra’s with-tools score is taken from its  official report . GPT‑6 Astra has not reported a without-tools score and is marked “—”.
Agentic benchmarks BioMysteryBench dataset is drawn from the  official v11 release , with Kimi K3 as the judge model. We evaluate Kimi K3.1 Pro with Kimi Code, GLM-5.3 and DeepSeek-V4.1-Flash-1017 with Claude Code, and GPT-6 Astra with Codex. Scores for the Claude models are taken directly from their official system cards.
Our Agents’ Last Exam dataset is drawn from the  official v1.1 release , comprising 122 tasks, including 86 CLI tasks, with environment images aligned with the official Hugging Face release. We additionally assign a score of zero to runs that bypass the task’s stated requirements, such as retrieving answers online instead of performing the required analysis in Wireshark. DeepSeek and Kimi are evaluated using Claude Code and Kimi Code, respectively. All other results are taken from the official benchmark website.
OfficeQA Pro, OfficeQA Pro v2. GPT-6 Astra is evaluated with Codex, while all other models are evaluated with Claude Code. Each task provides the agent with the entire PDF corpus, with all PDFs rendered as images and no machine-readable text available. We observed instances in the trajectories of certain external models where they retrieved reference answers online; Consequently, we assigned a score of zero to these tasks.
Frontier Finance is evaluated with the official finance agent v2 harness.
HANDBOOK.md is evaluated using the official harness built on OpenHands, with evaluation tasks drawn from the benchmark’s early open-source v1 release.
Harvey Legal Agent is evaluated on a public dataset of 1,251 tasks using Artificial Analysis’s Stirrup harness, with performance reported as the all-pass rate (i.e., the percentage of tasks that pass all rubric criteria).
OSWorld V2.1 is evaluated with the Kimi Agent harness in the official OSWorld v2 repo, while GPT-6 Astra's score is taken from Muse Wonder's technical report.
DECK-Arena evaluates presentation generation on real-world queries, while Design Bench covers graphic design via direct and reference-image few-shot prompting; Both run models across python-pptx, pptxjs, and Kimi's in-house DSL in a harness with integrated search and image generation, using an automated grader calibrated on 10,000+ human judgments.
MCP Atlas. All models are evaluated on the 500-task public subset with a 100-turn limit, using Gemini 3.1 Pro as the judge.
BrowseComp. We adopt the context-compaction strategy used in the Claude model cards, triggered at 200K tokens. We allow a maximum of 500 steps; if this limit is reached before a task is completed, we force the agent to provide an answer, which is then judged. All BrowseComp runs are conducted with temperature=1.0 and top-p=1.0.
GDPval-AA v2.1, AA-Briefcase v1.1 and AutomationBench-AA scores are cited from  https://artificialanalysis.ai/ , Apex Agents scores are cited from  https://www.mercor.com/apex/apex-agents-leaderboard/
GDP.pdf w/ python, ZeroBench w/ python and ChartoGraphy w/ python are averaged over five runs. Other multimodal benchmarks (w/ python) are averaged over four runs. For GDP.pdf w/ python: Each original PDF file is sent to the sandbox, where the model can use IPython tool to process it. Final responses are graded against each rubric criterion using Gemini-3.5-Flash (medium reasoning effort) and the official judging prompt. We report the task-macro mean rubric pass rate: for each task, we average the fraction of rubric criteria passed over five independent runs, then average these task-level scores equally across all tasks.
Reasoning & Knowledge & Multimodal benchmarks GDP.pdf. Each PDF is provided as page images resized to a longest edge of 1,152 pixels, interleaved with Docling-extracted text in page order. Responses are graded against each rubric criterion using Gemini-3.5-Flash Medium and the official judging prompt. We report the strict pass rate among fully scored responses.
HLE and HLE-Diamond evaluate general knowledge and reasoning capabilities. We report accuracy on the full evaluation sets, with 2,500 questions for HLE and 1,000 questions for HLE-Diamond. For models marked with an asterisk (*), accuracy is reported on the text-only subset of questions.
GDP.pdf, ZeroBench and ChartoGraphy are averaged over five runs. Other multimodal benchmarks are averaged over four runs. GDP.pdf scores of GLM-5.3 Max and DeepSeek-V4.1-Flash-1017 Max is cited from  https://artificialanalysis.ai/ .
MMMU-Pro is evaluated following the official protocol, preserving the original input order and prepending images to the text input.
Kimi Hallucination Benchmark evaluates factual accuracy on an internal set of challenging, de-identified prompts drawn from practical work tasks. We report the claim-level hallucination rate assessed by fact-checking agents.
Cybersecurity benchmarks ExploitBench. Kimi K3.1 Pro is evaluated with the official ExploitBench harness under the 300-turn budget. We report the pass@5 max capability score: for each environment, the best run across 5 seeds, scored by the number of capability flags reached out of 16, where achieving arbitrary code execution counts as achieving all 16 capabilities. The GPT-6 Astra score is taken from  https://openai.com/index/gpt-6-astra/ ; the Claude Opus 5.5 and Claude Mythos 5.1 scores are taken from  https://www.anthropic.com/claude-opus-5-5-system-card ; the GLM-5.3 score is taken from  https://z.ai/blog/glm-5.3 .
ExploitGym. Kimi K3.1 Pro is evaluated with the KimiCode harness under a 6-hour wall-clock budget per task. The GPT-6 Astra score is taken from  https://openai.com/index/gpt-6-astra/ ; the Claude Opus 5.5 and Claude Mythos 5.1 scores are taken from  https://www.anthropic.com/claude-opus-5-5-system-card  at the 6-hour budget; the GLM-5.3 score is taken from  https://z.ai/blog/glm-5.3 . xdev-Bench-hard: Kimi K3.1 Pro is evaluated with the KimiCode harness. GLM-5.3 and DeepSeek-V4.1-Flash-1017 are evaluated with the Claude Code harness.


## B. 博客配图的 alt 文字（原文，图里的数字）

alt="BenchCAD results (1,000-file subset, Voxel IoU): with tools, Claude Opus 5.5 scores 96.2, GPT-6 Astra 95.9, Kimi K3.1 Pro 92.7, Claude Fable 5.1 92.6, and DeepSeek-V4.1-Flash-1017 81.6; without tools, Claude Opus 5.5 scores 73.0, Kimi K3.1 Pro 72.8, Claude Fable 5.1 60.6, and DeepSeek-V4.1-Flash-1017 41.2"
alt="Benchmark results for Kimi K3.1 Pro and peer models across 14 coding, science, and knowledge-work evaluations"
alt="Finance benchmark results for OfficeQA Pro v2 and Frontier Finance, with Kimi K3.1 Pro leading OfficeQA Pro v2 at 64.4 and scoring 58.6 on Frontier Finance against Claude, GPT, GLM, and DeepSeek models"
alt="Internal Finance Benchmark: Kimi K3.1 Pro versus K3 on Internal Finance Modeling (57.6 vs 50.4), Internal Financial Research (70.4 vs 58.8), and Internal Business Operation (37 vs 8.9)"
alt="Internal xdev-bench-hard (pass@3) results: GPT-5.6 Sol (third-party evaluation) solves 100 problems, the Kimi model without cyber risk-reduction 90.5, DeepSeek-V4.1-Flash 85.7, Kimi K3.1 Pro 81.0, GLM-5.3 57.1, and Kimi K3 33.3, with average success rate and average tokens per successful trajectory for each"
alt="Kimi Hallu Bench claim-level hallucination rates (lower is better): without tools, GPT-6 Astra 4.2, Kimi K3.1 Pro 5.4, Opus 5.5 6.8, Fable 5.1 11.4, DeepSeek-V4.1-Flash-1017 13.1, GLM-5.3 14.8; Hard with tools, GPT-6 Astra 5.5, Kimi K3.1 Pro 8.3, Opus 5.5 15.0, GLM-5.3 22.6, DeepSeek-V4.1-Flash-1017 23.3, Fable 5.1 23.3"
alt="The Kimi 3D Make interface on kimi.com, with a prompt box for turning ideas into 3D models and featured templates including a pagoda, a typewriter, and a jet engine"


## C. 博客里的完整评测表（从页面内嵌数据解析；所有 K3.1 Pro 结果 reasoning effort = max；专有模型标 with fallback；`*B` = 表中加粗的最高分；None = 表中为“—”）

列：Kimi K3.1 Pro (max) | Claude Fable 5.1 | GPT-6 Astra | Claude Opus 5.5（以上专有模型）| DeepSeek-V4.1-Flash-1017 | GLM-5.3（开源模型）

Coding | Terminal-Bench 4.0 [Claude Code|]: Kimi K3.1 Pro / (max)=65.7; Claude Fable 5.1 / (max, with fallback)=57.9; GPT-6 Astra / (max, with fallback)=58.2; Claude Opus 5.5 / (max, with fallback)=66.4*B; DeepSeek-V4.1-Flash-1017 / (max)=42.3; GLM-5.3 / (max)=41.8
Coding | Terminal-Bench Science 0.1 [Claude Code|]: Kimi K3.1 Pro / (max)=38.1; Claude Fable 5.1 / (max, with fallback)=40.0; GPT-6 Astra / (max, with fallback)=68.1*B; Claude Opus 5.5 / (max, with fallback)=63.3; DeepSeek-V4.1-Flash-1017 / (max)=15.7; GLM-5.3 / (max)=8.1
Coding | SWE Marathon v1.1 [Claude Code|]: Kimi K3.1 Pro / (max)=51.7*B; Claude Fable 5.1 / (max, with fallback)=45.6; GPT-6 Astra / (max, with fallback)=42.5; Claude Opus 5.5 / (max, with fallback)=46.3; DeepSeek-V4.1-Flash-1017 / (max)=40.0; GLM-5.3 / (max)=42.5
Coding | BenchCAD w/o tools [|]: Kimi K3.1 Pro / (max)=72.8; Claude Fable 5.1 / (max, with fallback)=60.6; GPT-6 Astra / (max, with fallback)=None; Claude Opus 5.5 / (max, with fallback)=73.0*B; DeepSeek-V4.1-Flash-1017 / (max)=41.2; GLM-5.3 / (max)=None
Coding | BenchCAD w/ tools [|]: Kimi K3.1 Pro / (max)=92.7; Claude Fable 5.1 / (max, with fallback)=92.6; GPT-6 Astra / (max, with fallback)=95.9; Claude Opus 5.5 / (max, with fallback)=96.2*B; DeepSeek-V4.1-Flash-1017 / (max)=81.6; GLM-5.3 / (max)=None
Coding | Program Bench [Claude Code|]: Kimi K3.1 Pro / (max)=31.5; Claude Fable 5.1 / (max, with fallback)=53.5; GPT-6 Astra / (max, with fallback)=50.0; Claude Opus 5.5 / (max, with fallback)=65.0*B; DeepSeek-V4.1-Flash-1017 / (max)=29.1; GLM-5.3 / (max)=19.0
Coding | DeepSWE v1.1 [Claude Code|]: Kimi K3.1 Pro / (max)=75.5; Claude Fable 5.1 / (max, with fallback)=67.4; GPT-6 Astra / (max, with fallback)=74.1; Claude Opus 5.5 / (max, with fallback)=74.2; DeepSeek-V4.1-Flash-1017 / (max)=77.0*B; GLM-5.3 / (max)=66.9
Coding | PostTrain Bench v1.2 [Claude Code|]: Kimi K3.1 Pro / (max)=36.5; Claude Fable 5.1 / (max, with fallback)=44.6*B; GPT-6 Astra / (max, with fallback)=41.9; Claude Opus 5.5 / (max, with fallback)=43.8; DeepSeek-V4.1-Flash-1017 / (max)=30.5; GLM-5.3 / (max)=34.5
Coding | Kimi Code Bench 2.0 (Internal) [Claude Code|]: Kimi K3.1 Pro / (max)=77.1*B; Claude Fable 5.1 / (max, with fallback)=None; GPT-6 Astra / (max, with fallback)=None; Claude Opus 5.5 / (max, with fallback)=None; DeepSeek-V4.1-Flash-1017 / (max)=76.1; GLM-5.3 / (max)=61.7
Coding | Kimi Code Bench 3.0 Long-horizon (Internal) [Claude Code|]: Kimi K3.1 Pro / (max)=61.2; Claude Fable 5.1 / (max, with fallback)=58.8; GPT-6 Astra / (max, with fallback)=66.5*B; Claude Opus 5.5 / (max, with fallback)=58.5; DeepSeek-V4.1-Flash-1017 / (max)=51.5; GLM-5.3 / (max)=45.5
Agentic | HLE-Full w/ tools [|]: Kimi K3.1 Pro / (max)=70.0*B; Claude Fable 5.1 / (max, with fallback)=65.6; GPT-6 Astra / (max, with fallback)=57.2; Claude Opus 5.5 / (max, with fallback)=67.7; DeepSeek-V4.1-Flash-1017 / (max)=58.8; GLM-5.3 / (max)=62.5
Agentic | BrowseComp [|]: Kimi K3.1 Pro / (max)=92.1*B; Claude Fable 5.1 / (max, with fallback)=None; GPT-6 Astra / (max, with fallback)=91.5; Claude Opus 5.5 / (max, with fallback)=90.8; DeepSeek-V4.1-Flash-1017 / (max)=None; GLM-5.3 / (max)=None
Agentic | BioMysteryBench [|]: Kimi K3.1 Pro / (max)=80.6; Claude Fable 5.1 / (max, with fallback)=81.6; GPT-6 Astra / (max, with fallback)=78.9; Claude Opus 5.5 / (max, with fallback)=81.9*B; DeepSeek-V4.1-Flash-1017 / (max)=80.0; GLM-5.3 / (max)=79.6
Agentic | CharXiv (RQ) w/ python [|]: Kimi K3.1 Pro / (max)=93.4; Claude Fable 5.1 / (max, with fallback)=92.7; GPT-6 Astra / (max, with fallback)=92.8; Claude Opus 5.5 / (max, with fallback)=93.8*B; DeepSeek-V4.1-Flash-1017 / (max)=85.6; GLM-5.3 / (max)=None
Agentic | MMMU-Pro w/ python [|]: Kimi K3.1 Pro / (max)=90.0*B; Claude Fable 5.1 / (max, with fallback)=88.4; GPT-6 Astra / (max, with fallback)=87.8; Claude Opus 5.5 / (max, with fallback)=89.8; DeepSeek-V4.1-Flash-1017 / (max)=82.5; GLM-5.3 / (max)=None
Agentic | GDP.pdf w/ python [|]: Kimi K3.1 Pro / (max)=85.7*B; Claude Fable 5.1 / (max, with fallback)=83.8; GPT-6 Astra / (max, with fallback)=85.5; Claude Opus 5.5 / (max, with fallback)=83.9; DeepSeek-V4.1-Flash-1017 / (max)=73.0; GLM-5.3 / (max)=None
Agentic | ChartoGraphy w/ python [|]: Kimi K3.1 Pro / (max)=90.2; Claude Fable 5.1 / (max, with fallback)=88.4; GPT-6 Astra / (max, with fallback)=91.0*B; Claude Opus 5.5 / (max, with fallback)=89.0; DeepSeek-V4.1-Flash-1017 / (max)=83.0; GLM-5.3 / (max)=None
Agentic | BabyVision w/ python [|]: Kimi K3.1 Pro / (max)=95.4; Claude Fable 5.1 / (max, with fallback)=95.1; GPT-6 Astra / (max, with fallback)=96.6; Claude Opus 5.5 / (max, with fallback)=97.7*B; DeepSeek-V4.1-Flash-1017 / (max)=92.5; GLM-5.3 / (max)=None
Agentic | ZeroBench_main w/ python (pass@5) [|]: Kimi K3.1 Pro / (max)=63.0*B; Claude Fable 5.1 / (max, with fallback)=59.0; GPT-6 Astra / (max, with fallback)=58.0; Claude Opus 5.5 / (max, with fallback)=61.0; DeepSeek-V4.1-Flash-1017 / (max)=51.0; GLM-5.3 / (max)=None
Agentic | Agents' Last Exam (ALL) [|]: Kimi K3.1 Pro / (max)=43.2*B; Claude Fable 5.1 / (max, with fallback)=None; GPT-6 Astra / (max, with fallback)=32.8; Claude Opus 5.5 / (max, with fallback)=42.6; DeepSeek-V4.1-Flash-1017 / (max)=37.7; GLM-5.3 / (max)=26.2
Agentic | Agents' Last Exam (CLI) [|]: Kimi K3.1 Pro / (max)=44.2*B; Claude Fable 5.1 / (max, with fallback)=None; GPT-6 Astra / (max, with fallback)=38.8; Claude Opus 5.5 / (max, with fallback)=40.7; DeepSeek-V4.1-Flash-1017 / (max)=36.0; GLM-5.3 / (max)=29.4
Agentic | Automation Bench-AA [|]: Kimi K3.1 Pro / (max)=73.3*B; Claude Fable 5.1 / (max, with fallback)=59.4; GPT-6 Astra / (max, with fallback)=68.5; Claude Opus 5.5 / (max, with fallback)=69.5; DeepSeek-V4.1-Flash-1017 / (max)=66.6; GLM-5.3 / (max)=62.2
Agentic | GDPval-AA v2.1 (Elo-score) [|]: Kimi K3.1 Pro / (max)=1846; Claude Fable 5.1 / (max, with fallback)=1754; GPT-6 Astra / (max, with fallback)=1573; Claude Opus 5.5 / (max, with fallback)=1866*B; DeepSeek-V4.1-Flash-1017 / (max)=1746; GLM-5.3 / (max)=1650
Agentic | AA-Briefcase v1.1 (Elo-score) [|]: Kimi K3.1 Pro / (max)=1678; Claude Fable 5.1 / (max, with fallback)=1672; GPT-6 Astra / (max, with fallback)=1569; Claude Opus 5.5 / (max, with fallback)=1803*B; DeepSeek-V4.1-Flash-1017 / (max)=1570; GLM-5.3 / (max)=1507
Agentic | APEX-Agents [|]: Kimi K3.1 Pro / (max)=67.2; Claude Fable 5.1 / (max, with fallback)=68.6; GPT-6 Astra / (max, with fallback)=64.7; Claude Opus 5.5 / (max, with fallback)=73.5*B; DeepSeek-V4.1-Flash-1017 / (max)=63.4; GLM-5.3 / (max)=56.6
Agentic | OfficeQA Pro v2 [|]: Kimi K3.1 Pro / (max)=64.4*B; Claude Fable 5.1 / (max, with fallback)=54.5; GPT-6 Astra / (max, with fallback)=54.4; Claude Opus 5.5 / (max, with fallback)=62.2; DeepSeek-V4.1-Flash-1017 / (max)=40.4; GLM-5.3 / (max)=31.1
Agentic | OfficeQA Pro [|]: Kimi K3.1 Pro / (max)=67.4; Claude Fable 5.1 / (max, with fallback)=68.6*B; GPT-6 Astra / (max, with fallback)=66.2; Claude Opus 5.5 / (max, with fallback)=None; DeepSeek-V4.1-Flash-1017 / (max)=62.4; GLM-5.3 / (max)=58.6
Agentic | Frontier Finance [|]: Kimi K3.1 Pro / (max)=58.6; Claude Fable 5.1 / (max, with fallback)=60.8*B; GPT-6 Astra / (max, with fallback)=45.0; Claude Opus 5.5 / (max, with fallback)=56.7; DeepSeek-V4.1-Flash-1017 / (max)=54.5; GLM-5.3 / (max)=57.5
Agentic | Harvey Legal Agent [|]: Kimi K3.1 Pro / (max)=23.7*B; Claude Fable 5.1 / (max, with fallback)=19.1; GPT-6 Astra / (max, with fallback)=None; Claude Opus 5.5 / (max, with fallback)=None; DeepSeek-V4.1-Flash-1017 / (max)=21.0; GLM-5.3 / (max)=None
Agentic | HANDBOOK.md [|]: Kimi K3.1 Pro / (max)=44.6*B; Claude Fable 5.1 / (max, with fallback)=38.8; GPT-6 Astra / (max, with fallback)=None; Claude Opus 5.5 / (max, with fallback)=41.5; DeepSeek-V4.1-Flash-1017 / (max)=28.9; GLM-5.3 / (max)=20.8
Agentic | OSWorld V2.1 [|]: Kimi K3.1 Pro / (max)=79.6; Claude Fable 5.1 / (max, with fallback)=80.7; GPT-6 Astra / (max, with fallback)=75.8; Claude Opus 5.5 / (max, with fallback)=81.8*B; DeepSeek-V4.1-Flash-1017 / (max)=69.3; GLM-5.3 / (max)=None
Agentic | Business Operation (Internal) [|]: Kimi K3.1 Pro / (max)=37.8*B; Claude Fable 5.1 / (max, with fallback)=30.7; GPT-6 Astra / (max, with fallback)=32.3; Claude Opus 5.5 / (max, with fallback)=None; DeepSeek-V4.1-Flash-1017 / (max)=8.9; GLM-5.3 / (max)=18.6
Agentic | DECK-Arena (Internal, Elo-score) [|]: Kimi K3.1 Pro / (max)=1456*B; Claude Fable 5.1 / (max, with fallback)=None; GPT-6 Astra / (max, with fallback)=1423; Claude Opus 5.5 / (max, with fallback)=1253; DeepSeek-V4.1-Flash-1017 / (max)=1231; GLM-5.3 / (max)=1119
Agentic | Design Bench (Internal, Elo-score) [|]: Kimi K3.1 Pro / (max)=957; Claude Fable 5.1 / (max, with fallback)=None; GPT-6 Astra / (max, with fallback)=1076*B; Claude Opus 5.5 / (max, with fallback)=927; DeepSeek-V4.1-Flash-1017 / (max)=863; GLM-5.3 / (max)=718
Agentic | Kimi Hallu Bench Hard w/ tools (Internal, lower is better) [|]: Kimi K3.1 Pro / (max)=8.3; Claude Fable 5.1 / (max, with fallback)=23.3; GPT-6 Astra / (max, with fallback)=5.5*B; Claude Opus 5.5 / (max, with fallback)=15.0; DeepSeek-V4.1-Flash-1017 / (max)=23.3; GLM-5.3 / (max)=22.6
Reasoning & Knowledge & Multimodal | GDP.pdf [|]: Kimi K3.1 Pro / (max)=34.6*B; Claude Fable 5.1 / (max, with fallback)=27.6; GPT-6 Astra / (max, with fallback)=34.2; Claude Opus 5.5 / (max, with fallback)=30.6; DeepSeek-V4.1-Flash-1017 / (max)=17.2; GLM-5.3 / (max)=11.2
Reasoning & Knowledge & Multimodal | HLE-Full [|]: Kimi K3.1 Pro / (max)=51.1; Claude Fable 5.1 / (max, with fallback)=57.6; GPT-6 Astra / (max, with fallback)=53.6; Claude Opus 5.5 / (max, with fallback)=59.8*B; DeepSeek-V4.1-Flash-1017 / (max)=42.6; GLM-5.3 / (max)=43.0*
Reasoning & Knowledge & Multimodal | HLE-Diamond [|]: Kimi K3.1 Pro / (max)=39.4; Claude Fable 5.1 / (max, with fallback)=55.1; GPT-6 Astra / (max, with fallback)=65.8*B; Claude Opus 5.5 / (max, with fallback)=60.9; DeepSeek-V4.1-Flash-1017 / (max)=21.6; GLM-5.3 / (max)=25.1*
Reasoning & Knowledge & Multimodal | GPQA-Diamond [|]: Kimi K3.1 Pro / (max)=94.2; Claude Fable 5.1 / (max, with fallback)=93.7; GPT-6 Astra / (max, with fallback)=96.1*B; Claude Opus 5.5 / (max, with fallback)=93.9; DeepSeek-V4.1-Flash-1017 / (max)=92.2; GLM-5.3 / (max)=91.7
Reasoning & Knowledge & Multimodal | CharXiv (RQ) [|]: Kimi K3.1 Pro / (max)=89.0; Claude Fable 5.1 / (max, with fallback)=88.8; GPT-6 Astra / (max, with fallback)=90.0; Claude Opus 5.5 / (max, with fallback)=92.1*B; DeepSeek-V4.1-Flash-1017 / (max)=77.0; GLM-5.3 / (max)=None
Reasoning & Knowledge & Multimodal | MMMU-Pro [|]: Kimi K3.1 Pro / (max)=84.1; Claude Fable 5.1 / (max, with fallback)=86.3; GPT-6 Astra / (max, with fallback)=86.9; Claude Opus 5.5 / (max, with fallback)=87.7*B; DeepSeek-V4.1-Flash-1017 / (max)=80.6; GLM-5.3 / (max)=None
Reasoning & Knowledge & Multimodal | ZeroBench_main (avg@5 / pass@5) [|]: Kimi K3.1 Pro / (max)=29.8 / 39.0; Claude Fable 5.1 / (max, with fallback)=23.0 / 35.0; GPT-6 Astra / (max, with fallback)=43.2 / 52.0*B; Claude Opus 5.5 / (max, with fallback)=35.0 / 43.0; DeepSeek-V4.1-Flash-1017 / (max)=11.8 / 23.0; GLM-5.3 / (max)=None
Reasoning & Knowledge & Multimodal | PerceptionBench [|]: Kimi K3.1 Pro / (max)=68.3; Claude Fable 5.1 / (max, with fallback)=63.0; GPT-6 Astra / (max, with fallback)=77.6*B; Claude Opus 5.5 / (max, with fallback)=72.1; DeepSeek-V4.1-Flash-1017 / (max)=47.7; GLM-5.3 / (max)=None
Reasoning & Knowledge & Multimodal | Kimi Hallu Bench w/o tools (Internal, lower is better) [|]: Kimi K3.1 Pro / (max)=5.4; Claude Fable 5.1 / (max, with fallback)=11.4; GPT-6 Astra / (max, with fallback)=4.2*B; Claude Opus 5.5 / (max, with fallback)=6.8; DeepSeek-V4.1-Flash-1017 / (max)=13.1; GLM-5.3 / (max)=14.8
Cyber Security | ExploitBench [|]: Kimi K3.1 Pro / (max)=74.7; Claude Fable 5.1 / (max, with fallback)=83.0; GPT-6 Astra / (max, with fallback)=100*B; Claude Opus 5.5 / (max, with fallback)=91.0; DeepSeek-V4.1-Flash-1017 / (max)=None; GLM-5.3 / (max)=54.4
Cyber Security | ExploitGym [|]: Kimi K3.1 Pro / (max)=20.7; Claude Fable 5.1 / (max, with fallback)=30.4; GPT-6 Astra / (max, with fallback)=42.4*B; Claude Opus 5.5 / (max, with fallback)=34.5; DeepSeek-V4.1-Flash-1017 / (max)=None; GLM-5.3 / (max)=15.0
Cyber Security | xdev-bench-hard (Internal) [|]: Kimi K3.1 Pro / (max)=81.0; Claude Fable 5.1 / (max, with fallback)=None; GPT-6 Astra / (max, with fallback)=None; Claude Opus 5.5 / (max, with fallback)=None; DeepSeek-V4.1-Flash-1017 / (max)=85.7*B; GLM-5.3 / (max)=57.1

注意（核对发现）：
- 表中 Business Operation (Internal) 一行 K3.1 Pro = 37.8、DeepSeek-V4.1-Flash-1017 = 8.9；而配图 alt 文字写的是「K3.1 Pro 37 vs K3 8.9」，正文写「about 4.2× K3's performance」。视频里只用正文的“约 4.2 倍”和配图的 37 vs 8.9（K3.1 Pro vs K3）。
- Kimi Hallu Bench Hard w/ tools：正文写 K3 为 23.4%，K3.1 Pro 为 8.3%。

## D. Kimi K3 技术报告摘录（原文，pdftotext 提取，公式排版会乱）

### 摘要、引言与 §2 架构、§3 预训练、§4.1 后训练方法（第 1–14 页）

                                                              K IMI K3: O PEN F RONTIER I NTELLIGENCE
                                                                                                                      T ECHNICAL R EPORT OF K IMI K3
                                                                                                                                              Kimi Team
                                                                                                                                            A BSTRACT
               We introduce Kimi K3, a 2.8T parameter Mixture-of-Experts model with 104 billion activated
               parameters, native vision capabilities, and a 1-million-token context window. Kimi K3 is built on
               Kimi Delta Attention [64] and Attention Residuals [58], which improve information flow across
               sequence length and model depth. Together with Stable LatentMoE, which effectively activates
               16 of 896 routed experts per token, and refined training and data recipes, these advances yield an
               approximately 2.5× improvement in overall scaling efficiency over Kimi K2 [59]. Post-training
               highlights reinforcement learning across general, agentic, and coding domains and multiple reasoning-
               effort levels, enabling compositional generalization and robust long-horizon execution. At 2.8T scale,
               Kimi K3 is supported by infrastructure advances in multiple areas: algorithm-system co-design for
               KDA, perfectly balanced expert-parallel training with efficient memory management, million-token
               agentic RL with persistent rollout and sandbox states, and deployment innovations.
               Extensive evaluations show that Kimi K3 achieves frontier-level performance across long-horizon
               coding, agentic, knowledge, reasoning, and vision tasks. While its overall performance still trails the
               most powerful proprietary models, namely Claude Fable 5 and GPT-5.6 Sol, Kimi K3 consistently
               outperforms other open and proprietary models evaluated in our suite. We release the full Kimi K3
               model weights to facilitate future research and accelerate the broader deployment and adoption of
               frontier intelligence.1
     Coding All maxed out on thinking effort: max or xhigh.
     DeepSWE                                                                                                           Terminal-Bench 2.1                                        FrontierSWE
     GPT-5.6 Sol                                                                         73.0                          GPT-5.6 Sol                                    88.8       Fable 5                                                      86.6
     Fable 5                                                                           70.0                            Kimi K3                                        88.3       Kimi K3                                                    81.2
     Kimi K3                                                                          67.5                             Fable 5                                        88.0       GPT-5.6 Sol                                         71.3
     GPT-5.5                                                                          67.0                             Opus 4.8                                     84.6         GLM-5.2                                           67.3
     Opus 4.8                                                                     59.0                                 GPT-5.5                                     83.4          Opus 4.8                                          66.7
     GLM-5.2                                                            46.2                                           GLM-5.2                                     82.7          GPT-5.5                                          64.9
     Kimi Code Bench 2.0 (Internal)                                                                                    ProgramBench                                              SWE-Marathon
     Fable 5                                                                                76.9                       Kimi K3                                   77.8            Kimi K3                                 42.0
     Kimi K3                                                                              72.9                         GPT-5.6 Sol                               77.6            Opus 4.8                               40.0
     Opus 4.8                                                                            71.7                          Fable 5                                  76.8             GPT-5.6 Sol                            39.0
     GPT-5.5                                                                            69.0                           Opus 4.8                               71.9               Fable 5                              35.0
     GPT-5.6 Sol                                                                      64.8                             GPT-5.5                               70.8                GPT-5.5                  14.0
     GLM-5.2                                                                          64.2                             GLM-5.2                            63.7                   GLM-5.2                  13.0
     General & Visual Agents All maxed out on thinking effort: max or xhigh.
     GDPval-AA v2 Elo                                                                                                  BrowseComp                                                AutomationBench
     Fable 5                                                                                        1747               Kimi K3                                        91.2       Kimi K3                             30.8
     GPT-5.6 Sol                                                                                    1736               GPT-5.6 Sol                                    90.4       GPT-5.6 Sol                        29.7
     Kimi K3                                                                                       1686                Fable 5                                       88.0        Fable 5                            29.1
     Opus 4.8                                                                                   1593                   GPT-5.5                                     84.4          Opus 4.8                          27.2
     GLM-5.2                                                                                  1510                     Opus 4.8                                    84.3          GPT-5.5                         22.7
     GPT-5.5                                                                                  1491                                                                               GLM-5.2                  12.9
     The GDPval-AA v2 scores are from Artificial Analysis, as of July 23, 2026.
     JobBench                                                                                                          CharXiv (RQ) w/ tool                                      ZeroBench w/ tool (Pass@5)
     Fable 5                                                                57.4                                       Fable 5                                            93.5   Fable 5                                   46.0
     Kimi K3                                                              54.3                                         Kimi K3                                           91.3    Kimi K3                                 41.0
     Opus 4.8                                                          48.4                                            Opus 4.8                                         89.9     GPT-5.5                                 41.0
     GPT-5.6 Sol                                                     45.4                                              GPT-5.6 Sol                                      89.1     GPT-5.6 Sol                          35.0
     GLM-5.2                                                        43.4                                               GPT-5.5                                          89.0     Opus 4.8                             34.0
     GPT-5.5                                                      38.3
     Note: All Fable 5 results are with potential fallbacks. All GPT-5.6 Sol results include potential cyberguards.
                                                                                                                          Figure 1: Kimi K3 main results.
1
    https://huggingface.co/moonshotai/Kimi-K3
                                           Kimi K3: Open Frontier Intelligence                       T ECHNICAL R EPORT
1   Introduction
For much of the development of Large Language Models (LLMs), scaling meant investing more computation before
deployment by training larger models on more data [55, 46]. The rise of reasoning models has established test-time
computation as a second axis of scaling: OpenAI’s o-series scales reinforcement learning and test-time reasoning [85,
84]; Anthropic’s extended-thinking models allocate adaptive thinking budgets and interleave reasoning with tool use [6,
7]; DeepSeek-R1 [41] and Kimi K1.5 [120] show that large-scale reinforcement learning can elicit sophisticated
reasoning behaviors from strong pre-trained models; and Kimi K2.5 Agent Swarm [60] further extends test-time
scaling from sequential reasoning to parallel agent coordination. These advances have made test-time scaling a central
focus of frontier research. However, while the open-source model ecosystem has advanced rapidly on the second
axis, it has progressed slowly on the first: many recent models remain within or slightly above the 1T-class parameter
regime [147, 29, 137, 122]. As increasingly sophisticated reasoning and agentic reinforcement learning methods
are applied to pre-trained foundations of similar scale, open-source progress risks converging while the gap to the
strongest proprietary systems widens. With Kimi K3, we pursue both scaling axes together to the frontier: scaling the
pre-trained foundation to unprecedented 3T-class parameters while scaling reinforcement learning, reasoning effort, and
long-horizon interaction at 1M context length.
We introduce Kimi K3, a native multimodal Mixture-of-Experts model with 2.8 trillion total parameters, 104 billion
activated parameters, and a context window of up to one million tokens. Its architecture scales information flow
across sequence length, network depth, and model width. Kimi Delta Attention (KDA) [64] provides efficient long-
sequence mixing, with periodically interleaved Gated MLA layers preserving global interaction. Attention Residuals
(AttnRes) [58] allows each layer to selectively attend to representations from all preceding layers. Stable LatentMoE
expands the routed expert space to 896 experts, with 16 activated per token, while normalization, SiTU-GLU, and
Quantile Balancing stabilize optimization at extreme sparsity. These architectural advances, combined with refined data
and training recipes, yield an approximately 2.5× improvement in overall scaling efficiency over Kimi K2 [59].
We pair this pre-training foundation with post-training designed explicitly for 1M context test-time scaling. Kimi
K3 undergoes reinforcement learning across long-horizon coding, general agents, general reasoning and knowledge
tasks, each spanning multiple reasoning-effort levels. Training environments include verifiable search and professional
knowledge work, software engineering and kernel optimization, multimodal reasoning with vision-in-the-loop tool
use, persistent assistant workflows, web development, and autonomous execution tasks. These environments train a
general loop of reasoning, acting, observing, verifying, and adapting, often over hundreds or thousands of tool calls and
millions of accumulated context tokens. Domain- and effort-specialized policies are consolidated into a unified model
through multi-teacher on-policy distillation [76, 136, 29].
Realizing this regime requires infrastructure that scales with architecture complexity, model size, and trajectory length.
For systems co-design for KDA, we develop fused kernels, KDA Context Parallelism, and state-aware prefix caching
to make KDA efficient within devices, across devices, and across requests. For 2.8T-parameter MoE pre-training,
MoonEP provides perfectly balanced expert execution with static computation shapes and zero-copy communication,
while memory efficient training and multimodal encoder optimizations sustain utilization within bounded memory.
For million-token agentic RL, our co-located system combines partial rollouts, external KV-cache retention, adaptive
throttling and resumable microVM sandboxes to preserve long-lived model and environment state. Finally, specialized
kernels, and cache- and budget-aware fleet scheduling translate these innovations into predictable production serving.
The resulting model establishes a new open frontier. On benchmarks spanning long-horizon coding, agentic, knowledge,
reasoning, and vision tasks, Kimi K3 trails the strongest proprietary systems overall—Claude Fable 5 and GPT-5.6
Sol—and is consistently ahead of the other open and proprietary models evaluated in our suite, as shown in Fig. 1.
Our contributions are summarized as follows:
 • Pre-training at the open frontier. We train a 2.8T-parameter native multimodal MoE model with 104B activated
   parameters and a 1M-token context window. KDA, AttnRes, Stable LatentMoE, refined data and training recipes
   collectively improve overall scaling efficiency by approximately 2.5× over Kimi K2.
 • Reinforcement learning for multi-effort test-time scaling. We conduct RL across general, agentic, and coding
   domains and multiple reasoning-effort levels, then consolidate the resulting capabilities into a unified model.
 • Infrastructure for multi-trillion-parameter, million-token intelligence. We introduce KDA systems co-designs;
   MoonEP and memory-efficient infrastructure for 2.8T-parameter MoE pre-training; a co-located RL system with
   resumable sandboxes for million-token agentic trajectories; and more infrastructure innovations.
 • An open frontier model. We release the full Kimi K3 model weights, making frontier intelligence available for
   research, deployment, and further innovation.
                                                      2
                                                           Kimi K3: Open Frontier Intelligence                      T ECHNICAL R EPORT
                                                                                                     Output
                                                                                                 w     α
                Shared Expert
                Routed Expert                                                                                   w
                                                               Linear
                                                                                             Stable LatentMoE   α
                                                               Norm
                                                                                  1×
                                                                                                                w
                  1             2             1        2       3           N
                                                                                                 Gated MLA      α
                                          Router               Linear
                                                                                                                w
                                                                                             Stable LatentMoE   α
                                                                                  3×
                                                                                                                w
                                                                                                     KDA        α
                                          Linear
                                           Norm
                                                                                                  Block n − 1
                                    Kimi Delta Attention
                                                                                                  Block n − 2
                      q   k          v             α       β
                        L2
                       L2
                                                                                                 Embedding
                      Conv
                      Conv            Conv
                                                       σ       σ          σ
                                                                                                     MLP
                       Linear
                      Linear         Linear                             Linear
                                                                                                 MoonViT-V2
Figure 2: The Kimi K3 architecture, organized around token, channel, and layer mixing, with a native vision pathway at the input.
Each block contains three Kimi Delta Attention (KDA) layers followed by one Gated MLA layer, with each attention layer paired
with a Stable LatentMoE feed-forward network. Attention Residuals (AttnRes) use learned pseudo-queries (w) to derive attention
weights (α) over the embedding and preceding block outputs, enabling selective information flow across depth. Top left: the Stable
LatentMoE module with shared and routed experts. Bottom left: the KDA module. Bottom right: the native vision pathway.
2    Model Architecture
The Kimi K3 architecture is designed to scale information flow along three complementary dimensions: sequence
length, network depth, and model width. Along the sequence dimension, Hybrid Attention combines three Kimi Delta
Attention (KDA) [64] layers with one Gated MLA layer in each block, providing an efficient mechanism for long-context
token mixing while retaining selective high-capacity attention (§2.1). Along the depth dimension, Attention Residuals
(AttnRes) [58] enable each module to selectively retrieve representations from the embedding, the current block, and
preceding blocks, extending information access beyond conventional sequential residual accumulation (§2.2). Along
the width dimension, each attention layer is followed by a Stable LatentMoE layer that performs sparse channel mixing,
effectively activating 16 of 896 routed experts for each token (§2.3). For native vision, MoonViT-V2 encodes images
and videos, and a lightweight projector maps the resulting visual features into the shared embedding space before
backbone processing (§2.4). Together with Per-Head Muon (§2.5), these components provide a unified architecture for
scaling information flow across tokens, layers, and channels. Combined with refined training and data recipes, they
yield an approximately 2.5× improvement in overall scaling efficiency over Kimi K2. Figure 2 provides an overview of
the architecture.
                                                            3
                                            Kimi K3: Open Frontier Intelligence                        T ECHNICAL R EPORT
2.1     Hybrid Attention
Kimi K3 uses a layerwise hybrid of linear and global attention, combining KDA [64] with Gated MLA. Each block
contains 3 KDA layers followed by 1 Gated MLA layer, giving a 3:1 mixing ratio. This pattern is repeated throughout
the backbone. The two attention mechanisms are described separately below. An additional Gated MLA layer is placed
at the end of the backbone, ensuring that the final layer always performs global attention.
2.1.1    Kimi Delta Attention
KDA extends the delta-rule recurrence [106, 140] with a channel-wise forget gate [64]. Consider a sequence of hidden
states xt ∈ Rd , where t indexes the token position and d is the model hidden dimension. For clarity, we first describe a
single attention head, with query and key vectors qt , kt ∈ Rdk , value vector vt ∈ Rdv , and recurrent state St ∈ Rdk ×dv .
KDA applies channel-wise decay before the delta-rule update:
                            St = I − βt kt kt⊤ Diag(αt )St−1 + βt kt vt⊤ ,         õt = S⊤                             (1)
                                               
                                                                                           t qt .
Here, αt ∈ (0, 1)dk is the channel-wise one-step retention factor, and βt ∈ (0, 1) controls the delta-rule write strength.
Following Kimi Linear [64], KDA parameterizes the per-head quantities as
                                                                         
                          qth , kth = L2 Norm Swish ShortConv Wq/k   h
                                                                         xt     ∈ Rdk ,
                                vth = Swish ShortConv Wvh xt ∈ Rdv ,
                                                              
                                βth = Sigmoid Wβh xt ∈ (0, 1),
                                                    
                                        ↑  ↓
                                 zth = Wα Wα xt + bhα ∈ Rdk .                                                            (2)
The query, key, and value projections apply ShortConv followed by Swish [140], and the query and key are further
normalized with L2 Norm [143]. The low-rank projection and head-specific bias bhα ∈ Rdk produce a fine-grained
decay logit zth for each key channel. The lower-bounded mapping from zth to αht is introduced after the chunkwise
formulation below.
Chunkwise parallel form Following Kimi Linear [64], KDA is recurrent across chunks and parallel within each
chunk. For a chunk size C, X[t] stacks the token vectors in the t-th chunk for X ∈ {Q, K, V, O, U, W}. The matrix
S[t] ∈ Rdk ×dv denotes the recurrent state entering chunk t. For positions 1 ≤ i ≤ j ≤ C, define the channel-wise
cumulative decay
                                                  Yj
                                          i→j                            1→r
                                        γ[t] :=      αr[t] ,      r
                                                                γ[t] := γ[t] .                                (3)
                                                r=i
As in Kimi Linear, Γ[t] ∈ R
                    1→C    C×dk
                                stacks γ[t] , . . . , γ[t]
                                        1              C
                                                           row-wise. The UT transform produces U[t] and W[t] , from
which we define the pseudo-value term Ve [t] := U[t] − W[t] S[t] . Given the incoming state S[t] , all outputs in chunk t
are computed in parallel as
                                               h                                i
                                  A[t] = Tril (Q[t] ⊙ Γ1→C
                                                        [t]    )(K[t] /Γ1→C
                                                                         [t]  )⊤ ,
                                     O[t] = (Γ1→C
                                              [t] ⊙ Q[t] )S[t] + A[t] V
                                                                      e [t] .                                            (4)
                                            |     {z        } | {z }
                                                   inter-chunk       intra-chunk
For a matrix M, Tril(M) sets all strictly upper-triangular entries to zero and retains the lower-triangular entries,
including the diagonal. This mask enforces causal interactions within the chunk, and the diagonal is retained because
each output reads the state after the current-token update. The first term in O[t] carries information from preceding
chunks, whereas the second term accounts for interactions within the current chunk. We refer readers to Kimi Linear [64]
for the UT transform and the full derivation of the chunkwise form.
Lower-bounded decay Eq. 4 rescales the keys in each chunk by the reciprocal cumulative decay 1/Γ1→C            [t] . Because
  1→C
Γ[t]    is a product of retention factors in (0, 1), this reciprocal can grow without bound and overflow in finite
precision [142, 64]. Kimi Linear controls this numerical range by computing relative decay in log space and dividing
each chunk into secondary 16-token tiles [142, 64]. The off-diagonal tiles can then be computed with dense matrix
multiplications on Tensor Cores directly. The diagonal tiles, in contrast, still require explicit position-pair computations,
which remain the main intra-chunk bottleneck.
                                                            4
                                                         Kimi K3: Open Frontier Intelligence                              T ECHNICAL R EPORT
            g                                                                      Kimi Linear                               Kimi K3
                      Kimi Linear: g = −eA Softplus(z)
                      Kimi K3: g = gmin Sigmoid(eA z)
        0
                                                                                                   lower-bounded
gmin = −5
                                                               −∞
                                                                    z                            Position-pair Diagonal
                A=0
                                                                                                 Tensor Core
                 (a) Log-decay parameterization.                                          (b) Diagonal-tile computation.
Figure 3: Lower-bounded decay and its effect on chunkwise KDA computation. (a) Kimi Linear uses an unbounded negative-Softplus
mapping, whereas Kimi K3 bounds the log-decay with a scaled sigmoid; the curves show A = 0 and gmin = −5. (b) Kimi Linear
evaluates each diagonal tile with an explicit position-pair computation, while the bounded range in Kimi K3 allows all causal tiles to
use dense Tensor Core matrix multiplications.
Kimi K3 addresses this bottleneck by changing the mapping from the decay logits zth to the per-step log-decay
gth . Following GDN and Mamba-2, Kimi Linear uses the negative-Softplus mapping gth = −eAh Softplus(zth ) ∈
(−∞, 0)dk [140, 24, 64]. Kimi K3 instead uses a scaled sigmoid to bound the log-decay from below:
                                   gth = gmin Sigmoid eAh zth ∈ (gmin , 0)dk ,
                                                               
                                                                               d
                                               αht = exp(gth ) ∈ (egmin , 1) k ,                                                         (5)
where Ah is a learnable per-head log-scale and gmin = −5 is fixed. We initialize Ah = 0, and each bias bhα is initialized
following [64, 24, 140]. With gmin = −5, every retention factor satisfies αt,j
                                                                           h
                                                                               > e−5 ≈ 6.7 × 10−3 , and the cumulative
log-decay over a 16-token tile lies in (−80, 0). The corresponding reciprocal rescaling factor is therefore smaller
than e80 and remains within the BF16 dynamic range. This finite range allows both diagonal and off-diagonal tiles to
use dense Tensor Core matrix multiplications, eliminating the position-pair diagonal path. This parameterization is
closely related to the lower-bounded recurrence gates in prior work [98, 27, 92]. Fig. 3 illustrates the change in decay
parameterization and its computational consequence.
Full-rank gate Finally, Kimi K3 changes KDA’s output gate from the low-rank parameterization used by Kimi
Linear [64] to an input-dependent full-rank projection. After applying head-wise RMSNorm [148] to the recurrent
output, KDA applies data-dependent output gating [100]:
                                            yt = Wo [Sigmoid(Wg xt ) ⊙ RMSNorm(õt )] .                                                  (6)
2.1.2   Gated MLA
Multi-head Latent Attention (MLA), introduced in DeepSeek-V2 [28], compresses the key–value representation of each
token into a low-dimensional latent vector ct = Wc xt . Instead of caching full head-specific keys and values, MLA
caches ct and reconstructs the content keys and values through learned up-projections during attention computation. This
factorization reduces the KV-cache footprint while retaining global token-to-token attention. MLA was subsequently
adopted by Kimi K2 and Kimi K2.5 [59, 60], and Kimi K3 retains it in the periodic global-attention layers.
Unlike Kimi K2 and Kimi K2.5, Kimi K3 follows the hybrid design of Kimi Linear [64] and applies No Position
Encoding (NoPE) to all MLA layers. Consequently, no explicit positional encoding is applied to their queries or keys.
The intervening KDA layers provide position-sensitive and recency-aware sequence mixing, while the MLA layers
provide unrestricted global content interaction. This separation also avoids modifying positional-encoding parameters
when extending the context length, such as retuning a RoPE frequency base or applying YaRN [93].
In addition, Kimi K3 augments MLA with an input-dependent, channel-wise full-rank output gate. Let õt denote the
ungated MLA output at position t; the gated output is
                                                         yt = Wo [Sigmoid(Wg xt ) ⊙ õt ] .                                              (7)
                                                                       5
                                            Kimi K3: Open Frontier Intelligence                        T ECHNICAL R EPORT
The gate projection Wg is full rank, matching the new parameterization used by KDA in Kimi K3. This gate allows
each token to modulate the channels read from global attention [100].
To correct the biased rounding error identified by [99] in flash attention, we keep the attention output in FP32 during
training. This choice doubles the on-chip footprint of the output tile; we therefore redesign the training kernel to overlap
it with the KV staging buffers instead of the query tile, freeing shared memory for a deeper KV pipeline and higher
training throughput.
2.2   Attention Residuals
Standard residual connections [44] compress all prior information into a single state hl over depth — a bottleneck
reminiscent of RNNs over time. For sequence modeling, the Transformer replaced recurrence with attention [10, 127],
allowing each position to selectively access all previous positions with data-dependent weights. Attention Residuals
(AttnRes) [58] applies the same methodology to depth: each layer selectively retrieves representations from all preceding
layers rather than accumulating them uniformly.
Full Attention Residuals     For each layer l, we define a layer-specific learnable pseudo-query ql = wl ∈ Rd and keys
and values                                            
                                                        h1        i=0
                                         ki = vi =                                                                 (8)
                                                        fi (hi ) 1 ≤ i ≤ l − 1
where fi (hi ) is the output of layer i and h1 is the token embedding. The attention weights follow a softmax kernel
ϕ(q, k) = exp q ⊤ RMSNorm(k) [56, 148], where the RMSNorm prevents layers with large-magnitude outputs
from dominating the weights:
                                                                           l−1
                                            ϕ (ql , ki )                   X
                                   αi→l = Pl−1              ,       hl =         αi→l · vi .                             (9)
                                           j=0 ϕ (ql , kj )                i=0
Since network depth is modest (L < 100), the O(L2 d) arithmetic of this full form is affordable; the practical overhead
is the O(Ld) memory (and cross-stage communication under pipeline parallelism) for keeping all layer outputs alive.
Block Attention Residuals To reduce this overhead, we partition the L layers into N blocks of S = L/N layers
each. Within block n (layer indices Bn ), layer outputs are reduced to a single representation by summation, bn =
   j∈Bn fj (hj ), with bn denoting the partial sum over the first i layers of the block; we set b0 = h1 so the token
                        i
P
embedding is always included as a source. Across blocks, full attention is applied over only the N block-level
representations: for the i-th layer in block n, the value matrix is
                                   [b0 , b1 , . . . , bn−1 ]⊤         if i = 1 (first layer of block n)
                                 
                           V=                                                                                    (10)
                                   [b0 , b1 , . . . , bn−1 , bi−1
                                                              n   ] ⊤
                                                                      if i ≥ 2 (subsequent layers)
with keys and attention weights following Eq. 8 and Eq. 9. The final output layer then aggregates all N block
representations. Under Block AttnRes, memory and communication overhead drop from O(Ld) to O(N d), while this
block structure also bounds the inference-time state, enabling the parallel inter-block results to be better merged with
the sequential intra-block partial sums via online softmax [80], significantly reducing inference time cost.
Empirically, N ≈ 8 recovers most of the benefit across model scales [58]; for Kimi K3, we partition its layers into 8
blocks with 12-layer size, giving a partial final block and 9 total blocks when counting the embedding layer.
2.3   Stable LatentMoE
Increasing both the expert pool and the number of active experts expands the space of expert specializations, but in a
conventional MoE each selected expert receives the full d-dimensional token representation, so communication and
expert-weight traffic grow with the routing multiplicity. LatentMoE [32] makes this expansion affordable by separating
the full model width from the routed-expert width: shared experts retain a full-width path for common transformations,
whereas specialized routed experts operate in a compact latent space of width ℓ. This enables Kimi K3 to scale channel
mixing to 896 routed experts with 16 active experts per token, corresponding to a sparsity of 56.
This extreme sparsity amplifies two failure modes of the vanilla design. First, the routed path composes W↓ , a gated
multi-branch expert feed-forward network, and W↑ into a chain of nearly four consecutive matrix multiplications. This
ill-conditioned structure, combined with the 2.8-trillion-parameter scale, produces exploding internal activations in the
routed branch. Second, balancing the load of nearly 103 experts exceeds the regime in which existing auxiliary-loss-free
                                                            6
                                              Kimi K3: Open Frontier Intelligence                                     T ECHNICAL R EPORT
                          Gate branch                 Up branch                                       Curve
                                                                               f (x)                           |f (x)| ≤ β1 β2 = 100
GLU [26]                       σ(x)                        x                   100
                                                                                           SwiGLU
                                                                                                    SiTU-GLU             GLU
SwiGLU [108]                 x · σ(x)                      x
                                                           
SiTU-GLU               β1 tanh βx1 · σ(x)            β2 tanh βx2                                                                     x
                                                                               −10     0                 50                    100
Figure 4: Gate and up branches of GLU, SwiGLU, and SiTU-GLU, together with their scalar responses, where σ denotes the
sigmoid function. Both branches receive the scalar input x, and all curves share the domain x ∈ [−10, 100]; the inset magnifies the
near-origin region. SiTU-GLU, shown in red with β1 = 4 and β2 = 25, closely follows SwiGLU near the origin and approaches the
bound |f (x)| ≤ β1 β2 = 100 for large positive inputs, whereas SwiGLU remains unbounded.
bias updates remain well behaved. Stable LatentMoE addresses these two failure modes with three components: an
RMSNorm before the up-projection and Sigmoid Tanh Unit GLU (SiTU-GLU) to suppress activation explosion, and
Quantile Balancing (QB) for load balancing.
As illustrated in Fig. 2, the layer follows the shared- and routed-expert organization of DeepSeekMoE [23]. For x ∈ Rd ,
the shared experts process x directly, while the routed path projects it to z = W↓ x ∈ Rℓ , dispatches z to the selected
experts, and maps their weighted aggregate back to Rd through W↑ :
                                                X
                                         u=          pi Eirouted (W↓ x),
                                              i∈Tk (x)
                                              Ns
                                              X
                                         y=         Ejshared (x) + W↑ RMSNorm(u).                                                        (11)
                                              j=1
Here, u ∈ Rℓ is the aggregated routed representation, Ejshared : Rd → Rd and Eirouted : Rℓ → Rℓ are the shared and
routed expert feed-forward networks, and pi is the router weight defined by the Quantile Balancing rule below. Kimi
K3 fixes the number of full-width shared experts to Ns = 2 in every layer.
2.3.1   Normalized LatentMoE
The original LatentMoE directly applies W↑ to the aggregated routed representation u, whose scale can vary with the
selected experts and their routing weights. As shown in Eq. 11, Kimi K3 instead inserts RMSNorm [148] between
expert aggregation and the up-projection. This normalization reduces the sensitivity of the routed branch to scale
variation before it is combined with the full-width shared branch. Beyond stabilizing training, the additional RMSNorm
consistently improves validation loss and downstream benchmarks.
2.3.2   Sigmoid Tanh Unit GLU
Gated Linear Units (GLUs) modulate a linear value branch with a sigmoid-activated gate, computing Sigmoid(Wg x) ⊙
Wu x [26]. SwiGLU replaces the sigmoid gate with Swish(x) = x Sigmoid(x) and yields strong empirical performance
in Transformers [108]. SwiGLU has subsequently become a widely adopted FFN design in large language models,
while a complete account of its empirical effectiveness remains open.
However, both multiplicative factors in SwiGLU are unbounded, so coincident large coordinates can produce activation
outliers and increase overflow risk in low-precision arithmetic. The sigmoid gate of the original GLU avoids unbounded
gate growth, but it does not retain the approximately linear positive regime of Swish. This motivates an activation that
controls large-value growth while preserving the characteristic local and positive-side response of SwiGLU. Other
recent efforts have explored alternative parameterizations of this trade-off [52].
To satisfy these requirements, we propose Sigmoid Tanh Unit GLU (SiTU-GLU). SiTU-GLU applies the smooth cap
softcap(x, β) = β tanh(x/β) to the linear factor of the Swish gate and independently to the up branch:
                                                                                         
                                              Wg x                                       Wu x
                  SiTU-GLU(x) = β1 tanh                ⊙ Sigmoid(Wg x) ⊙ β2 tanh                   ,   (12)
                                               β1                                          β2
                                                         7
                                                Kimi K3: Open Frontier Intelligence                                    T ECHNICAL R EPORT
      (a) Imbalanced routing                            (b) Quantile Balancing                                    (c) Balanced routing
                                                   E1           E2         E3            E4
 t1                                        t1                                                                t1
                           E1                                                                                                            E1
 t2                                        t2                                                                t2
 t3                                        t3                                                                t3
                           E2                                                                                                            E2
 t4                                        t4                                                                t4
 t5                                        t5                                                                t5
                           E3                                                                                                            E3
 t6                                        t6                                                                t6
 t7                                        t7                                                                t7
                           E4                                                                                                            E4
 t8                                        t8                                                                t8
Figure 5: Illustration of Quantile Balancing with m = 8 tokens, n = 4 routed experts, and k = 1 selected expert per token. (a)
Token-wise Top-k routing (tokens on the left, experts on the right) produces loads (4, 3, 1, 0); darker circles indicate overheated
experts, whereas faded and dashed circles indicate underutilized and dying experts, respectively. (b) Each gray bar is the margin of
                                     (t)      (t)
the currently biased score, si,j + bj − αi , so the row-wise maxima reproduce the routing in (a). The dashed red line in each
                                 (t)      (t+1)
column is the bias adjustment bj − b     bj     , placed at the (q+1)-th largest margin so that exactly q = 2 margins exceed it. The
marker ⋆ denotes the row-wise Top-k choice after subtracting the column adjustments, i.e., the routing in (c). (c) The retained
choices yield the balanced load (2, 2, 2, 2); red edges denote assignments changed by QB.
For Kimi K3, we set the soft-cap hyperparameters to β1 = 4 for the gate branch and β2 = 25 for the up branch. The
scaled tanh is approximately linear near the origin and bounded at large magnitude, allowing SiTU-GLU to preserve
the local response of SwiGLU while controlling both factors in the product. Fig. 4 compares the branch definitions and
scalar responses of GLU, SwiGLU, and SiTU-GLU on a common slice.
§ B gives the local expansion, limiting case, formal output bound, and comparison with hard clamping.
2.3.3     Quantile Balancing
Unlike auxiliary-loss-based routing [33], Kimi K3 adopts auxiliary-loss-free routing [30]. Load balancing is imple-
mented by adding an expert-specific bias bj to the router score used for Top-k selection. For token xi , the router
computes si = Sigmoid(Wr xi ) and applies
                                                                                  si,j
                                 Ti = argtopk (si + b) ,             pi,j = P                 ,   j ∈ Ti .                                    (13)
                                                                                 r∈Ti si,r
Because b is omitted from pi,j , it regulates dispatch without altering the mixture weights or the gradient-based
                                                                                    (t+1)    (t)              (t)
optimization of the router. The original method updates b with the fixed-step rule bj     = bj + γ sign(ℓ̄ − ℓj ) [30],
for which γ trades off slow adaptation against load oscillation. Maintaining balanced loads becomes more challenging
as LatentMoE increases the routed expert pool to 896 per layer. Imbalanced routing slows expert-parallel training and
may leave some experts poorly trained [48].
To address this limitation, we introduce Quantile Balancing (QB), which sets each expert bias from the router-score
quantile [113, 114] that matches its target load. Consider a training batch of m tokens routed to n experts with Top-k
selection, so the target load is q := mk/n tokens per expert. QB derives the next bias from a single forward pass.
Routing replaces the Top-k selection with Top-(k+1) on the biased score si + b(t) : the first k entries are the routes
                                                           (t)
actually taken, while the (k+1)-th entry is the cutoff αi that an expert must exceed to enter token i’s Top-k. Taking
the cutoff from Top-(k+1) routing avoids a separate token-side quantile. We then choose each expert bias so that expert
                                                                                                                (t+1)
j receives its target load: with the cutoffs fixed, the token count routed to expert j under a candidate bias bbj     is
                                                  m  h                      i
                                                               (t+1)    (t)
                                                  X
                                                    1 si,j + bbj     > αi ,
                                                  i=1
                                                      (t+1)                                                      (t+1)
which is monotonically decreasing in the threshold −bbj     . Assuming no ties, setting this count to q makes −bbj
                                         (t)
the (q+1)-th largest margin si,j − αi , so that exactly q margins stay above the threshold. Since q/m = k/n, this is
                                                          8
                                                              Kimi K3: Open Frontier Intelligence                              T ECHNICAL R EPORT
the (1 − k/n)-quantile of the margins across tokens, giving the QB update
                                                                              
                                     bb(t+1) ← − quantile                  (t)
                                       j                  1−k/n s:,j − α         ,
                                                                      
                                     b(t+1) ← bb(t+1) − mean b   b(t+1) 1.                                                                     (14)
                                                             (t)
The margins subtract the biased cutoff αi from the raw score si,j , so the old bias enters the update only through the
cutoffs, and the second line removes a common offset that leaves Top-k selection unchanged. For causality, the update
takes effect only in the next step [30], i.e., a batch is never routed with a bias derived from itself. Fig. 5 illustrates the
case m = 8, n = 4, and k = 1, where each expert receives the target load q = 2. The final bias is frozen at inference.
The balanced-assignment derivation is given in § C.
Histogram estimation At scale, the quantile in Eq. 14 spans the full global batch, whose margins number in the
millions and are spread across ranks and accumulation steps, so gathering them for an exact quantile is not viable at
training time. We instead read each expert’s quantile from a histogram of its margins: a single all-reduce sums the
per-rank bin counts, and the quantile is recovered from the pooled counts. Because counts are additive, the histogram
represents the pooled global batch regardless of how tokens are sharded, so the estimate reflects the whole-batch
quantile up to the bin width, at a communication cost of only a few hundred bins per expert. This histogram estimator is
the method we use in practice; we give more detailed descriptions of it and its error bound in § D.
2.4   Native Vision
Kimi K3 is natively multimodal: text, images, and videos are processed by a single shared backbone within one
context, with no post-hoc modality-alignment stage. This design is the architectural foundation of the long-horizon,
vision-in-the-loop behavior described in §1. Rendered outputs and the code that produced them live in the same
token stream, the model can write code, inspect screenshots or video frames of the result, and iteratively refine visual
artifacts—user interfaces, graphics, video—with no cross-model hand-off.
MoonViT-V2 A key departure from Kimi K2.5 is that we train Kimi K3 vision encoder, MoonViT-V2, entirely from
scratch with next-token prediction. Prior practice, including Kimi K2.5 itself, initializes the vision encoder from a
contrastively pre-trained model such as SigLIP, under the premise that pre-trained visual knowledge gives the model a
head start. We depart from this practice primarily for training stability. When a pre-trained encoder is attached to the
LLM, joint optimization becomes unstable: the SigLIP-initialized MoonViT-3D shows persistently higher gradient
norms with frequent spikes, while MoonViT-V2 remains stable throughout training (Fig. 6). Training with next-token
prediction also allows the encoder’s representations to be shaped directly by the language-modeling objective, rather
than by a contrastive loss that favors global semantics over fine-grained textual and structural cues. Notably, we find
MoonViT-V2 matches the SigLIP-initialized baseline across vision evaluations, indicating that contrastive pre-training
is unnecessary as an initialization for multimodal language models at scale.
                                                      (a) Full training trajectory                                (b) Zoomed view (14k–16k)
                                                                                                          0.15
                                                                         MoonViT-3D (SigLIP init.)
          Vision-tower gradient norm
                                                                         MoonViT-V2 (from scratch)
                                       0.6                                                                 0.1
                                       0.4                                                                0.05
                                       0.2
                                                                                                            0
                                                                                                                 14   14.5   15    15.5   16
                                        0
                                             7   10    15              20                25          30
                                                         Training step (×103 )
Figure 6: Vision-tower gradient norms in our pre-training ablations. Compared with the SigLIP-initialized MoonViT-3D, the
from-scratch MoonViT-V2 maintains lower gradient norms with fewer spikes, indicating more stable optimization.
                                                                                     9
                                           Kimi K3: Open Frontier Intelligence                        T ECHNICAL R EPORT
Architecture This training recipe builds on a vision pathway that follows the overall design of Kimi K2.5 [60,
62]: visual inputs are first encoded by MoonViT-V2 and then mapped by a lightweight MLP projector into the LLM.
MoonViT-V2 is a 27-layer vision transformer with roughly 0.4B parameters that adopts RMSNorm and removes
all bias terms from its linear and attention projections, a design that further stabilizes the from-scratch optimization
above. Images and videos are processed with fully shared parameters, as in MoonViT-3D: attention is factorized into
intra-frame spatial and inter-frame temporal passes, and temporal pooling further compresses tokens along the time
dimension. Before projection, a pixel-shuffle operation with 2 × 2 downsampling reduces the number of visual tokens
by a factor of four, keeping inputs of up to 3584 × 3584 pixels affordable within the 1M-token context.
2.5   Per-Head Muon
Following Kimi K2, Kimi K3 adopts Muon [54] as the optimizer for its matrix parameters. For attention projections,
we further refine it into a per-head variant [112, 147]: instead of applying Newton–Schulz orthogonalization to the full
Q, K, and V projection matrices, we partition their momentum matrices along the head dimension and orthogonalize
each head’s block separately. The intuition is that full-matrix orthogonalization treats all heads as a single coupled
block, so heads with larger gradient or momentum scales dominate the shared update direction, while smaller-scale
heads receive insufficiently normalized updates; per-head orthogonalization equalizes the update scale across heads.
In practice, this design yields more balanced learning dynamics across heads and improves training stability at larger
scales. It also slightly reduces optimizer overhead, as Newton–Schulz iterations on tall per-head blocks are cheaper
than on the full projection matrix.
3     Pre-Training
3.1   Pre-Training Data
Kimi K3 is pre-trained on a curated corpus spanning four primary text domains—Web Text, Code, Mathematics,
and Knowledge—together with a large-scale vision corpus. The vision data covers captions, interleaved image–text
documents, OCR, perception, video, and visual coding data. Our data pipelines build on those developed for Kimi
K2 [59] and refined in Kimi K2.5 [60].
Text data Each domain is filtered by a combination of rule-based heuristics, classifier-based quality scoring, and
deduplication, with domain-specific sampling rates determined by ablation studies on smaller models. Following the
rephrasing recipe of Kimi K2 [59], we rephrase knowledge and mathematics corpora with style and perspective-diverse
prompting, chunk-wise autoregressive generation, and fidelity verification against the source documents.
Vision data The vision corpus follows the taxonomy of Kimi K2.5 [60], combining open-source collections with
in-house pipelines for filtering, synthesis, and deduplication. During training, coordinate supervision is provided in both
absolute and normalized ([0,1]) formats, enabling precise and resolution-robust localization. In addition to classical
text-captioned images, we substantially scale up programmatic multimodal data, coupling code snippets with their
rendered visuals across domain-specific formats including SVG, 3D assets, Webpage, Game, and CAD schematics.
3.2   Scaling Law
Taken together, the architectural, data, and training improvements described in the previous sections define our new
model family. Since these changes also alter the optimal training regime, we conduct dedicated scaling-law studies to
retune key hyperparameters, including the batch size, learning rate, tokens-per-parameter ratio (TPP) and the model
shape. Evaluated on held-out OOD validation data, the scaling law curves in (Fig. 7) show that these improvements
collectively deliver an approximately 2.5× gain in overall scaling efficiency over Kimi K2. Table 1 provides a detailed
architectural comparison between Kimi K2 and Kimi K3, highlighting the structural changes that contribute to this
improvement.
Our scaling-law study consistently favors cosine decay over Warmup Stable Decay (WSD) [47], leading us to adopt
cosine decay as the default learning rate schedule. We compare cosine decay and WSD under a fixed minimum learning
rate. Although prior work has reported that WSD can match or even outperform cosine decay, we observe that the two
schedules exhibit markedly different optimal hyperparameters. Even under the same model size and training-token
budget, their optimal peak learning rates and batch sizes differ substantially. As a result, comparing the two schedules
using a shared set of hyperparameters may unfairly favor one simply because those hyperparameters are better aligned
with it. To ensure a fair comparison, we conduct an independent scaling-law search for each schedule. Under their
respective optimal hyperparameter settings, cosine decay consistently achieves a lower final loss than WSD.
                                                           10
                                                 Kimi K3: Open Frontier Intelligence                    T ECHNICAL R EPORT
                                                                                   Kimi K2
                                                                                   Kimi K3
                               Validation Loss
                                                            2.5×
                                                  1020                          1021
                                                                FLOPs
 Figure 7: Fitted scaling-law curves for Kimi K2 and Kimi K3. Kimi K3 achieves 2.5× gain in scaling efficiency over Kimi K2.
                              Table 1: Architectural comparison between Kimi K2 and Kimi K3.
                                                            Kimi K2                    Kimi K3                  ∆
      Architecture                                            MoE                      MoE                       –
      #Layers                                                   61                       93                   ↑ 52%
      Total Parameters                                       1.04T                     2.78T                 ↑ 167%
      Activated Parameters                                   32.6B                    104.2B                 ↑ 220%
      Hidden Dimension                                       7,168                     7,168                     =
      Latent MoE Dimension                                      –                  3584 (0.5×)                   –
      MoE Hidden Dimension per Expert                        2,048                     3,072                  ↑ 50%
      Routed Experts                                           384                      896                  ↑ 133%
      Experts Active per Token                                   8                       16                  ↑ 100%
      Shared Experts                                            1                         2                  ↑ 100%
      Attention Heads                                           64                       96                   ↑ 50%
      Number of Dense Layers                                     1                        1                      =
      Vocabulary Size                                         160K                     160K                      =
      Training Context Length                                 128K                      1M                      8×
      Attention Mechanism                                     MLA               Hybrid KDA–MLA                   –
      Activation Function                                   SwiGLU                  SiTU-GLU                     –
      Attention-Layer Composition                           61 MLA              69 KDA + 24 MLA                  –
      Number of MTP Layers                                   1 layer                  1 layer                    =
      Total Parameters of ViT                                    -                     401M                      -
      #ViT Layers                                                -                   27 layers                   -
      Patch Size of ViT                                          -                       14                      -
      #Attention Heads of ViT                                    -                       12                      -
3.3   Training Recipe
Kimi K3 adopts a native multimodal training strategy in which language and vision are jointly optimized from the start
of training, rather than grafting a vision encoder onto a pre-trained language model through a post-hoc alignment stage.
Under this paradigm, visual and textual tokens are interleaved within a single next-token prediction objective, enabling
the shared backbone to learn unified multimodal representations from the outset.
We optimize the model using the Per-Head Muon optimizer (§ 2.5) together with the weight-clipping mechanism
introduced in Kimi K2, while adopting QB (§ 2.3.3) for MoE load balancing. We use a cosine learning rate schedule
with a 1% linear warmup. Weight decay is set to 0.1 throughout.
                                                        11
                                           Kimi K3: Open Frontier Intelligence                        T ECHNICAL R EPORT
Our pre-training begins with a context length of 8k tokens, which is later extended to 64k tokens in a subsequent
training phase.
3.4     Long-Context Extension
Positional encoding Kimi K3 uses no explicit positional embedding (NoPE), and instead encodes positional informa-
tion implicitly through the recurrent gating and decay mechanism of KDA. As a result, the model extrapolates directly
to 1M-token contexts without any positional-encoding modification, such as RoPE rescaling or interpolation [93].
Long-context data Long documents and videos from natural sources contain a substantial amount of low-quality
content, including near-duplicates, binary blobs, truncated files, video clips, and invalid machine-generated logs. We
therefore process them through a dedicated cleaning pipeline that combines exact and fuzzy deduplication, supplemented
by perceptual hashing over frames for video, together with heuristic and classifier-based quality filtering, and structural
validation. Because genuinely long and coherent documents and videos are scarce relative to short text, we upsample
them so that the long-context distribution is not overwhelmed by short sequences during cooldown. Length alone,
however, does not confer long-range capability. To address this, we synthesize additional long-context data by carefully
permuting and concatenating multimodal documents and sub-tasks, so that the embedded tasks can be solved only by
attending to information scattered across the full 1M-token context. This trains the attention mechanism at the intended
scale and prevents it from degenerating into local patterns.
Progressive context extension Kimi K3 supports a context window of up to 1 million tokens. We achieve this
through extending the context window progressively as training proceeds, following a four-stage curriculum. The
window grows from 8K to 64K tokens during pre-training, and from 256K to 1M tokens during the cooldown phase.
Concentrating the costly long-sequence computation within a small fraction of the overall training budget keeps the
curriculum economical while still allowing the model to adapt gradually to increasingly long-range dependencies. The
sequence-dimension partitioning that makes million-token training tractable for the KDA layers is described in §5.1.2.
4     Post-Training
4.1     Method
Our post-training pipeline follows a three-stage paradigm: initializing baseline agent capabilities via supervised fine-
tuning (SFT), developing specialized domain experts at varying reasoning effort via Reinforcement Learning (RL), and
consolidating these domain-specific policies into a single model using Multi-Teacher On-Policy Distillation (MOPD).
4.1.1    Supervised Fine-Tuning
The SFT stage establishes a high-quality cold-start policy for the subsequent RL stage. Building on the SFT pipeline
of previous Kimi models [59, 60], we expand the SFT dataset for Kimi K3, substantially broadening its coverage
of complex agentic tasks. Specifically, we synthesize data trajectories using domain-specialized models from the
prior Kimi series, followed by multi-stage verification and human-in-the-loop annotation. To represent these complex
agentic trajectories consistently, we serialize all data with our XTML-based chat template (eXtensible Token Markup
Language; see § F for details). Collectively, these steps yield a large-scale instruction dataset that endows Kimi K3 with
adaptive reasoning, precise tool calling, and robust execution in long-horizon agentic scenarios. In addition, we apply
quantization-aware training (QAT) from the SFT stage onward, with MXFP4 weights and MXFP8 activations (§ 4.1.4).
4.1.2    Reinforcement Learning
While SFT provides a solid cold-start foundation, RL is critical to unlocking higher-order reasoning and execution
capabilities. Rather than training specialized RL models for individual tasks, we scale RL across three broad domains,
each encompassing a wide spectrum of sub-tasks, and train a single expert for each domain at every reasoning effort
level: (i) general tasks, spanning general experience, vision, reasoning, faithfulness, search capabilities, and knowledge
work tasks; (ii) general agents, spanning long-horizon assistant tasks, deep research, and paragraph-level writing; and
(iii) coding agents, spanning software engineering (SWE), coding experience, kernel tasks, and web development. As
shown in Figure 8, scaling RL FLOPs consistently improves a variety of capabilities across knowledge, reasoning, vision,
general agent, and coding. Crossing these three domain experts with three reasoning effort levels in {low, high, max}
yields a total of nine expert models.
                                                            12
                                                  Kimi K3: Open Frontier Intelligence                                     T ECHNICAL R EPORT
                           Coding Experience      General Tool Use           Web Development             Agentic Search
                           Score
                           Avg. steps
                                                                                                                               Avg. steps
             Score (%)
                               RL FLOPs               RL FLOPs                  RL FLOPs                    RL FLOPs
                         Professional Workflows   Office Deliverables   Agentic Chart Understanding   Agentic Visual Puzzles
                                                                                                                               Avg. steps
             Score (%)
                               RL FLOPs               RL FLOPs                  RL FLOPs                    RL FLOPs
Figure 8: Scores and the average assistant steps across a variety of public and in-house evaluations during RL. By scaling RL FLOPs,
tool-call steps scale up consistently, accompanied by a comprehensive improvement in the model’s overall capability.
Algorithm To mitigate the long-tail latency that intensifies in long-horizon tasks, we extend the partial rollout scheme
from our synchronous RL framework [120, 60]. During the rollout phase of each iteration, we sample K completions
for each of N prompts, maintaining an active workload of N × K trajectories. Rather than waiting for all rollouts to
terminate, the generation phase pauses as soon as a fraction λ ∈ (0, 1) of trajectories completes (i.e., λN K), allowing
policy optimization to proceed without execution stragglers. Paused rollouts are enqueued and prioritized for resumption
at the start of the next iteration, powered by our sandbox infrastructure (§ 5.3.2). Once all K responses for a prompt
complete, they are immediately dispatched for policy optimization, which follows the algorithm in Kimi K2.5 [60].
Under our partial rollout scheme, an individual long-horizon trajectory naturally spans multiple iterations, introducing
data staleness that threatens training stability. Our policy optimization algorithm inherently tolerates such an extreme
off-policy regime through a per-token regularization. By constraining policy updates within a localized neighborhood,
this regularization enables the algorithm to robustly handle highly stale data and sustains training stability.
Reasoning Effort RL To fine-tune reasoning effort while maximizing token efficiency, we implement a per-problem
budget control mechanism during RL [60]. We associate each problem x with an initial token budget b0 (x) estimated
from the cold-start model, and override the task reward with −1 for trajectories whose total token budget T (y) exceeds
a scaled threshold τ · b0 (x). For general tasks, T (y) measures the number of thinking tokens, whereas for agentic tasks,
T (y) accounts for the cumulative output tokens, including both reasoning traces and tool-call arguments. Training
follows a stage-wise curriculum over the budget multiplier τ . We first train a max-budget variant with a relatively large
τ , while still capping the maximum budget to suppress excessive overthinking. We then anneal τ to smaller values to
obtain the high- and low-effort expert models. The adjustment of τ is configured per domain under human-in-the-loop
guidance. Trajectories produced by the resulting experts at all reasoning levels are jointly collected for supervised
fine-tuning and multi-teacher on-policy distillation.
Agentic Generative Reward Model For non-verifiable general tasks, we adopt an Agentic Generative Reward Model
(GRM), retaining the tournament-style group reward with binary comparisons as in Kimi K2.5 [59, 60]. Beyond generic
agentic capabilities for enhanced judgment, the agentic judge is required to follow a mandatory protocol: (1) read the
outcome, product, or text output; (2) generate a rubric; (3) score each candidate against the rubric; and (4) record the
rubric-assigned scores in a scorepad. To mitigate reward hacking toward increasingly verbose outputs, we apply a
budget-based verbosity control analogous to the reasoning-effort control above: given an initial verbosity ℓ0 estimated
from the cold-start model and a multiplier σ, a candidate whose output length exceeds σ · ℓ0 automatically loses the
binary comparison.
4.1.3   Multi-Teacher On-Policy Distillation
We adopt Multi-Teacher On-Policy Distillation (MOPD) to consolidate these domain-specialized capabilities across
varying reasoning efforts into a unified model [76, 136, 29]. During training, for a given domain d and a sampled
                                                                                                           (d,e)
reasoning effort level e ∈ {low, high, max}, optimization is guided by the corresponding teacher model πteacher among
the nine experts. Given an input query x and the prefix response y<t , the per-token OPD reward evaluated on yt between
                                                            13
                                             Kimi K3: Open Frontier Intelligence                             T ECHNICAL R EPORT
              (d,e)
the teacher πteacher and the student πθ is defined as:
                                                                                    !                    !
                                                                (d,e)
                                                          π        (yt | x, y<t )
                       d
                      ropd (yt | e, x, y<t ) = clip sg log teacher                      , −Rmax , Rmax       ,             (15)
                                                           πθ (yt | e, x, y<t )
where sg(·) denotes the stop-gradient operator, and Rmax > 0 is a clipping threshold to constrain extreme advantage
signals, thereby stabilizing RL training. This dense reward signal seamlessly integrates into our RL framework,
naturally enabling infrastructure-level optimizations such as partial rollout training for long-horizon tasks. While
we also experimented with more fine-grained top-k distillation objectives, we observed no clear advantage in either
convergence speed or final performance in our setting.
4.1.4    Deployment-Aware Post-Training
MXFP4 Quantization-Aware Post-Training To reduce memory footprint and serving cost at deployment, we
quantize the MoE expert weights — which dominate the model’s parameter memory — to MXFP4 [104], with
activations computed in MXFP8, while all non-expert components (attention projections, latent MoE projections, shared
experts, and MoE routers) remain in higher precision. We perform quantization-aware training (QAT) [50] throughout
the entire post-training stage, covering both SFT and RL, so that the model adapts to quantization-induced precision
loss. During RL, rollout and training share the same quantization scheme — eliminating the train–inference mismatch.
Draft Model Fine-Tuning Optimizing inference efficiency is crucial for serving complex, long-horizon agentic
models. Kimi K3 is pre-trained with a multi-token-prediction (MTP) layer that mirrors the structure of a backbone
block. As the draft model of EAGLE-3 [72] comprises a single decoder layer whose structure matches the MTP layer,
we fine-tune the pre-trained MTP layer into an EAGLE-3-style draft model, with the target model frozen and only the
draft layer and its feature-fusion projection updated. Following the training-time test protocol of EAGLE-3, the draft
is unrolled for seven steps during training; beyond the first step, where the target-side features of the newest position
are unavailable, the draft consumes its own outputs from earlier steps, mirroring the recurrent drafting procedure at
inference.
The draft input fuses low-, mid-, and high-level features of the target model, taken from the outputs of the 1st, 4th,
and final AttnRes blocks, respectively (§ 2.2). These features are concatenated and projected to the hidden size by
a bias-free matrix WE3 , initialized as [ 0 0 I ] so that the fused representation coincides at initialization with the
high-level feature hh — the input on which the MTP layer was pre-trained — and gradually learns to incorporate the
low- and mid-level features during fine-tuning.
The speedup of speculative decoding is governed by the per-token acceptance rate x∈V min(p(x), q(x)) under lossless
                                                                                   P
speculative sampling, where p and q denote the next-token distributions of the target and draft models. Since minimizing

### §5 基础设施（摘句）

- KDA replaces the growing key–value cache of softmax attention with a fixed-size recurrent state S ∈ Rdk ×dv (§2.1.1),
- attention instead carries the preceding context in a fixed-size recurrent state S ∈ Rdk ×dv . Prior context-parallel methods
- fragmentation. We therefore propose MoonEP3 , an EP scheme that achieves perfect load balance with dynamic
- redundant experts. MoonEP preserves the overall computation flow of conventional schemes such as DeepEP [149]
- Perfect balance with bounded redundant experts MoonEP requires every rank to receive exactly S × K tokens,
- path in DeepEP requires a communication buffer of size S × K × R, whereas MoonEP requires only a fixed S × K
- https://github.com/MoonshotAI/MoonEP
- including a traditional container-based runtime, a GPU sandbox runtime, and, most notably, a new microVM-based
- machines at will. By running isolated microVMs with Firecracker [3], AgentENV provides a level of isolation and
- waiting for the model’s inference result, which can account for as much as 98% of the sandbox lifetime. (b) Fork:
- custom ublk driver implementation, storage-layer sharing, and P2P transport, achieving sub-second launch latency at
- a memory overcommit ratio of up to 6.5× in real workloads.
- prefix cache packs the fixed-size recurrent state into the same paged pool as the MLA KV cache and keeps long prefixes
