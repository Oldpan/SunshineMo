# 怎么别让 Claude Code 越用越蠢？提示词还是很重要，需要大减负

来源：老潘 Notion 文章 https://app.notion.com/p/40a1081a28be81b0b714cb70620b300c （抓取于 2026-11-02）。下面是正文原样（Notion markdown），之后附原文 7 张图里的文字。

<table-of-contents />

还是好好看下 prompt 技巧吧，我们写 Prompt，很容易越写越长。模型漏过一次测试，就补一条“必须测试”；改动范围大了，再补一条“只做最小修改”。换了几代模型，这些规则还堆在 <code>CLAUDE.md</code>（或[Agents.md](http://Agents.md)）里，最后自己也说不清哪些还有用。

> Addy Osmani 前两天发了一篇「You're probably overprompting Claude」，讲的就是这个问题。他现在在 Anthropic 主导 Claude Code，这篇文章把官方几篇 Playbook 和架构文档里的关键建议理了一遍。[1](https://x.com/addyosmani/status/2115688494865465370)

到了 Opus 5.5，模型自己就会规划和拆解步骤，没必要在 Prompt 里一步步硬编码执行过程；工程精力应该往前移，放在划定任务范围和明确验收标准上。

不过给 Prompt 减负有个前提：其他工程约束得先就位，比如跑得通的自动化验收、清楚的权限边界，以及按需挂载的 skills。如果只留下一句轻飘飘的“帮我优化下”，Agent 根本不知道改到什么程度才算完。

## 1 把完整任务一次交出去

官方 9 月 22 日发布的 Opus 5.5 playbook（作者也是 Addy）开头列了三条原则：一次性把完整任务交出去，讲清楚“做完”的标准，明确什么时候该停下来等人工确认（Human-in-the-Loop）；Prompt 里删掉“think carefully”这类废话，模型在输出前本来就会自己思考；长任务跑完后，先看它列出的人工介入清单。[2](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/)

“做完”必须写成机器能验证的状态。playbook 里举的例子大意是：所有 endpoint 都切到新 client，旧 client 彻底删掉，测试全部跑通；只有在测试遇到查不出原因的非预期异常时，才停下来找人确认。

以一个接口迁移任务为例，提示词可以这样写（目录和测试命令换成自己的就行）：

```txt
把 src/api 下仍使用旧 SDK 的调用迁移到新 SDK。

完成条件：
- 对外响应字段、错误码和超时行为保持兼容。
- 运行 uv run pytest -q tests/api，现有用例通过。
- 新增用例覆盖空输入、超时与并发调用。
- 检查调用点，确认没有遗漏的旧 SDK 引用。

范围：不改无关模块，不通过删除或跳过测试获得通过。
可以自行选择实现步骤；缺少必要凭据、需求冲突，
或需要修改公共接口时先停下来说明。
不要部署到生产环境。

完成后给出 diff 摘要、实际运行的命令和结果，
以及仍未验证的部分。
```

这段 Prompt 并不短，但每一条的信息密度都很高。响应兼容是业务约束，测试命令是验收入口，不部署到生产是权限红线。至于先看哪个文件、函数怎么拆分重构，完全可以放手让 Agent 对着代码库自己拿主意。

<image source="notion-file-block://61d79e07-ab29-43d4-a023-b0a39934be15/75e824c8-d63d-4c43-96b3-1d64d38cf1a7?space_id=2c61081a-28be-8189-9c78-0003c810d110&name=fig1-task-contract.svg">
图 1：一条任务提示里值得写的四块，过程步骤交给 agent
</image>

这其实就是一份明确的任务契约：要做什么、不能碰什么、拿什么证明做完了。把这些客观约束定清楚，“认真思考、全面检查、反复确认”这类空泛的要求就可以彻底删掉了。

### 1.1 啥时候停写进 <code>CLAUDE.md</code>

每次开新任务都重复说一遍什么时候该停，既繁琐又占上下文。playbook 建议把这类规则直接固化到 <code>CLAUDE.md</code>：不需要人工介入的步骤直接往下跑，进度说明和下一步计划写在同一条消息里；只有在遇到无法推进的阻塞、或者要执行删数据、force push、改动仓库外文件时，才停下来确认。高危命令的权限拦截始终开着就行。[2](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/)

```markdown
## 继续还是停下
- 下一步不需要我输入时直接继续，进度说明和下一步动作写在同一条消息里。
- 只在被阻塞，或执行删除数据、force push、修改仓库外文件之前停下来问。
- 收尾汇报按「需要我处理 / 改了什么 / 发现了什么」三段写。
```

最后一条也是 playbook 推荐的做法：把汇报格式收拢，让人一眼先看到“需要我处理”的部分。遇到耗时较长的大任务，可以配合一个 <code>TASKS.md</code> 文件；即便触发了上下文压缩（Context Compaction），这个文件依然完整保存在磁盘上，随时能看当前进度，用不着去翻漫长的前文日志。

### 1.2 需求没想清楚就先写 spec

Addy 原文里还有一个很实用的建议：如果在构思阶段需求边界还不明确，可以先让 Claude 提问，把接口契约、边界条件和验收准则梳理成一份清晰的 spec，然后再开一个干净的新会话去实现。新会话只要带上 spec、相关代码和必要的背景就行，免得把前期头脑风暴时被毙掉的废弃方案带进编码阶段。

spec 不一定非要是 Markdown 文档。Thariq Shihipar 在聊 Context Engineering 时提到，一套严密的自动化测试、一段待移植的成熟参考代码，甚至一个现成的 HTML mockup，都能直接拿来当 spec 用。它们的确定性往往比大段的自然语言描述或界面截图高得多。[8](https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/)

这个时候就很推荐 <link-preview url="https://app.notion.com/p/40a1081a28be81b0b714cb70620b300c#40c1081a28be80e3a49beb3f0fe6b841" source="https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md" /> grill-me 相关的 skill，很适合脑子转不动的各位，帮助我们先理清楚需求。

## 2 给 agent 一个可执行的验收入口

只让模型知道最终目标还不够，它在跑的过程中需要拿到确定性的反馈。

“把服务做稳定”在工程上没法量化；但要是写成“修复这组并发用例里的请求幂等问题，保持现有接口行为不变，并跑通指定的回归测试”，机器就能明确检查了。同理，UI 任务可以比对页面状态和渲染快照，数据流处理可以检查样本行数、Schema 格式和数值容差。

优化推理服务也是一样。硬件环境、模型规格、输入输出长度和并发数都要先固定死，再去对比 Throughput、TTFT、TPOT 和错误率。要是只给一句含糊的“吞吐越高越好”，Agent 很可能会投机取巧，靠降低计算精度、截断 Prompt 或者偷换测试负载来刷出一组虚高的数据。

### 2.1 /goal 决定要不要继续下一轮

Claude Code 的 <code>/goal</code> 能给当前会话设定显式的终止条件。命令敲下后立即进入执行循环。每一轮结束时，Claude Code 会把预设条件和当前的对话历史交给配置好的 small fast model（Evaluator）做检查。判定结果有三种：未达成（附带具体原因，作为下一轮的调整建议）、已达成（自动清理 goal）、无法达成（同样清理 goal，并记录失败原因）。[3](https://code.claude.com/docs/en/goal)

这项机制底层其实是一个会话级的 Prompt-based Stop hook。相比在 settings 里全局生效、能挂脚本做确定性检查的 Stop hook，<code>/goal</code> 只在当前会话生效，而且同一时间只能跑一个活动的 goal。

```txt
/goal tests/api 的回归测试全部通过，现有用例没有被删除或跳过；
在对话里给出实际运行的测试命令、退出码和结果摘要。
最多 20 轮，到了还没通过就停下来，说明卡在哪里。
```

evaluator 自己不会调工具，它既不读文件也不跑测试，单纯看对话里贴出来的文本做判断。所以终止条件必须写成机器能验证的客观产物，比如“<code>npm test</code> 退出码为 0”就比一句“代码质量过关”管用得多。官方文档建议，条件里最好包含一个可测量的终态、一套明确的验证方式，以及执行过程中的负向约束，字符上限是 4000。

<image source="notion-file-block://cfef116b-1f1d-45f1-9634-e009844340ad/eb3aaeba-66c4-4f67-a3ec-5055ce3857bf?space_id=2c61081a-28be-8189-9c78-0003c810d110&name=fig2-goal-loop.svg">
图 2：/goal 的一轮，主 agent 把证据写进对话，evaluator 只读对话下判定
</image>

上面的“最多 20 轮”只是给模型看的软约束，evaluator 会根据对话里汇报的进度来权衡，并不是底层写死的循环计数器。Claude Code 本身设计了几道防死循环和报错的兜底机制：如果连续几轮都没有调工具、只是在跟 evaluator 来回空转，循环会自动停下来把控制权还给人，此时 goal 会保持挂起；如果是托管凭据失效、额度耗尽、上下文被撑爆且压缩不出空间，或者模型服务挂了，这四种致命错误会直接清理掉 goal；遇到接口限流排队或网络偶发中断，系统则会自动做指数退避重试或暂时挂起。

如果某轮结束时后台命令或 subagent 还在跑，这轮会先跳过评估，等后台任务全部跑完后再行判定。要是后台任务让 goal 阻塞等待满 30 分钟，系统会发起一次 check-in 轮询，之后的等待间隔会成倍递增（最高到初始间隔的 4 倍）。这个等待阈值可以通过环境变量 <code>CLAUDE_CODE_GOAL_CHECKIN_MINUTES</code> 来调整。

直接输入不带参数的 <code>/goal</code> 可以查看当前状态，包括目标条件、已跑时长、评估轮次、Token 消耗和上一轮的判定理由；想提前停掉就用 <code>/goal clear</code>。因为 <code>/goal</code> 依赖 hooks 机制，如果项目目录没有通过信任检查、配置了 <code>disableAllHooks: true</code>，或者企业策略强制要求 managed hooks，它都无法启用。如果你是在自建 Harness 里跑，像超时时间、Token 消耗和预算上限，最好直接在应用层加上硬性拦截。

### 2.2 auto mode 管的是权限

<code>/goal</code> 和 auto mode 分管不同的环节：auto mode 省掉的是单轮内每次调工具的人工确认，<code>/goal</code> 解决的则是多轮循环之间的停顿。挂上 goal 并不会自动放宽权限，在 Manual 模式下原本受控的操作照样会弹窗询问；要想真正做到无人值守，就得在 auto mode 下跑 goal。[3](https://code.claude.com/docs/en/goal)

从 8 月 14 日开始，Pro、Max 和 Team 订阅新建的 Claude Code 会话已经默认开启 auto mode；Enterprise 以及走 Claude API、Bedrock 的云端环境，目前仍需要手动指定开启。每次调用工具前都会经过一个轻量安全分类器：低风险操作直接放行，疑似高危动作则会被拦截，这时 Claude 通常会换个替代方案，或者停下来找你确认。同一个会话里如果连续触发 3 次拦截，或者累计拦截满 20 次，系统就会自动降级回手动确认模式。[4](https://claude.com/resources/articles/auto-mode-default-in-claude-code)

权限规则的处理上还有个细节：自定义规则依然最优先匹配，但像 <code>python:*</code> 这种允许执行任意代码的宽泛 allow 规则，在 auto mode 下会被强制忽略。敏感数据外发则是硬拦截，遇到这种情况要么退回手动模式，要么自己去终端执行。官方评测虽然给了一堆安全基准数据，但也直说了分类器不可能 100% 挡住所有风险，真要动关键的基础设施，最后一步依然得由人工仔细把关。[4](https://claude.com/resources/articles/auto-mode-default-in-claude-code)

把耗时长的任务交给 Agent，不代表要把清空数据库、改动线上配置或直接发版的权限也一股脑全放开。代码写完、验收指标都跑通之后，关键的发布操作依然需要单独卡一道人工审批。

## 3 Opus 5.5 从 medium 起步

Opus 5.5 把默认 effort 调低了：Opus 5 默认是 <code>high</code>，到了 Opus 5.5，API 和 Claude Code 默认都降到了 <code>medium</code>。按 Anthropic 内部 Coding 和 Knowledge-work 的基准测试，Opus 5.5 在 <code>medium</code> 档就已经追平甚至超过了 Opus 5 的 <code>high</code> 档；在部分纯代码测试里，<code>low</code> 档的表现也很接近，推理成本还低得多。不过这是官方公布的基准数据，实际业务里最好还是拿具体用例跑跑看。[5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5)[7](https://code.claude.com/docs/en/model-config)

官方建议先显式设成 <code>medium</code>，再拿自己的评测试几档。在 Claude Code 里执行：

```txt
/effort medium
```

在 API 调用里直接传 <code>output_config.effort</code>，不需要加额外的 beta header：[6](https://platform.claude.com/docs/en/build-with-claude/effort)

```json
{
  "model": "claude-opus-5-5",
  "max_tokens": 128000,
  "output_config": { "effort": "medium" },
  "messages": [{ "role": "user", "content": "..." }]
}
```

<code>max_tokens</code> 直接给到 128000，是为了给 thinking tokens 和最终生成留足空间。官方在长轮次 Agent 测试里发现，直接拉满到上限 128000 表现最稳。

<image source="notion-file-block://643568fb-9b2b-4a67-8056-794c87431c50/dc5d0f5a-6e13-4fb8-b9a9-7ed599f6434d?space_id=2c61081a-28be-8189-9c78-0003c810d110&name=fig3-effort.svg">
图 3：Opus 5.5 默认 effort 降到 medium，以及 Claude Code 里的取值顺序
</image>

不同模型之间的同名 effort 档位，实际思考量并不是一回事。官方提到，Opus 5.5 单轮生成的思考 token 整体明显多于 Opus 5，到了 <code>xhigh</code> 和 <code>max</code> 档差距更大。如果直接照搬旧版的 <code>high</code> 或 <code>max</code>，很容易白白浪费 token 和时间。<code>xhigh</code> 与 <code>max</code> 最好只留给那些用测试集验证过确实有质量提升的复杂任务。想降成本、缩短延迟，直接调低 effort 档位就行，不用在 prompt 里加什么“简单想想”；同理，写“请深入思考”对 5.5 来说也是纯粹的废话。

从旧版本迁移时有几个关键细节：

- <b>修改 effort 会导致 Prompt Cache 失效</b>：前后两次请求如果改动了顶层 <code>effort</code>，Prompt Cache 会直接失效（cache bust）。如果长会话中途确实需要动态切档，应该用 per-message effort 机制（beta 特性，需要在请求头带上 <code>mid-conversation-output-config-2026-07-01</code>），这样才能保住缓存。[6](https://platform.claude.com/docs/en/build-with-claude/effort)
- <b>Opus 5.5 不能完全关闭思考</b>：Opus 5 在 <code>high</code> 及以下档位还允许传 <code>thinking: {"type": "disabled"}</code>，但 Opus 5.5 只要收到这个参数就会直接报 400 校验错误。以前靠禁用 thinking 省成本的做法走不通了，得改成从 <code>low</code> 档起步测试。
- <b>user settings 顶层的 </b><b><code>effortLevel</code></b><b> 对 Opus 5.5 不生效</b>：如果在全局配置里写了 <code>"effortLevel": "high"</code>，切到 Opus 5.5 后依然会默认走 <code>medium</code>。另外，在 CLI 里执行 <code>/effort <level></code> 会把这个值记成后续的默认配置；如果只想给当前会话临时改一次，可以在滑块交互界面里按 <code>s</code> 保存单次选择。<code>max</code> 档除了通过特定环境变量指定之外，默认也只在当前会话生效。[7](https://code.claude.com/docs/en/model-config)

对比各档位收益时，拿同一组固定任务跑一遍最直观：记录通过率、耗时、token 消耗和人工介入返工的次数。平时以 <code>medium</code> 为基线，碰上真正棘手的问题再往上加档；换成其他模型时，这套测试也要重新跑一遍。

## 4 给旧规则做一次删减实验

### 4.1 那个 80% 到底删了什么

7 月 24 日，Anthropic 的 Thariq Shihipar 写了篇关于 Claude 5 代上下文工程（Context Engineering）的文章，里面提到：针对 Claude Opus 5、Claude Fable 5 等新模型，团队把 Claude Code 原有 System Prompt 删掉了 80% 以上，而在核心代码基准测试上，模型能力并没有打折。[8](https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/)

不过这里要说明，删减 80% 指的是 Claude Code 自己的 System Prompt，并不等于整个会话的上下文长度缩了 80%，更不能直接按这个比例去硬砍你自己项目里的 <code>CLAUDE.md</code>。另外，官方博文里并没有公开具体的测试样本量和评测细节。

这次清理主要动了三块：

第一块是互相冲突的指令（Conflicting Directives）。文章举了个典型例子：一次请求里，System Prompt 写着“leave documentation as appropriate”，某个专有 skill 又命令“DO NOT add comments”，用户接着再补一句“照旧版习惯来”，模型当场不知道该听谁的。新版 System Prompt 删掉了大堆关于注释和 docstring 的死规矩，直接收拢成一条原则：看周围的代码怎么写就怎么写，注释密度、命名风格直接向现有代码看齐。

第二块是冗长的示例和重复描述。比如 TodoWrite 工具原来塞了快 9100 个字符的用法说明，现在精简成了一句话概括、三个状态枚举（pending / in\_progress / completed），外加一条硬规则：“同一时刻只允许一个任务处于 in\_progress”，靠清楚的接口定义直接约束行为。原先散落在 System Prompt 各处重复解释工具的段落也被全部清掉，只保留在工具自己的定义里。

第三块是把常驻规则改成按需加载，而不是单纯死删。像跑验证、Code Review 这类重流程，全被移出常驻 System Prompt，做成独立 skill 按需触发；一些不常用的工具也改成了延迟加载，真正要调之前先通过 ToolSearch 把定义拉进来。这样既没丢能力，又不用每轮 Prefill 都把大段内容往上下文里塞。

<image source="notion-file-block://b3326838-9c0b-409b-9829-734794e2cb04/e90ef9f6-9769-4f04-900d-66f4e52c264c?space_id=2c61081a-28be-8189-9c78-0003c810d110&name=claude-context-stack.png">
图 4：上下文由哪些部分组成（图源：Thariq Shihipar 的[上下文工程文章](https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/)）
</image>

落到日常项目的 <code>CLAUDE.md</code> 上，瘦身思路也很清楚：只用一两句话讲明项目定位，主要篇幅留给模型光看代码推不出来的反直觉约定和隐性坑（Gotchas，比如“核心类型必须全写在某一个大文件里”）。只要能从目录结构或代码本身看出来的东西，就别往里写；个性化的验收流程直接拆到独立的 verification skill 里，<code>CLAUDE.md</code> 只要留个调用入口就行。

### 4.2 先审查，再决定删什么

Claude Code 从 v2.1.283 开始内置了提示词审计命令，可以在当前会话直接跑：

```txt
/doctor prompt-audit
```

它会扫一遍留给旧模型的过时指令、失效的文件路径以及互相冲突的规则，给出一份带修改建议和 diff 预览的报告；在你确认之前，它不会改动磁盘上的任何文件。这个命令默认会扫描 <code>CLAUDE.md</code>、<code>CLAUDE.local.md</code>、<code>AGENTS.md</code>，以及 <code>.claude/</code> 和 <code>~/.claude/</code> 下面的 rules、skills、commands、subagents 和 output styles；如果只想检查某个局部目录，后面带上路径就行，比如 <code>/doctor prompt-audit .claude/skills/deploy</code>。[9](https://code.claude.com/docs/en/memory)

这里几个命令容易搞混：<code>/checkup</code> 是 <code>/doctor</code> 的别名。如果不带参数单独跑 <code>/doctor</code>，查的是运行环境、配置和依赖，不是查提示词。另外，prompt-audit 底层走的是内置的 <code>/claude-api</code> skill，所以写 <code>/claude-api prompt-audit</code> 效果一样；要是把这个 skill 全局禁用了，审计命令就会起不来。[10](https://code.claude.com/docs/en/commands)

官方文档给维护 <code>CLAUDE.md</code> 列了几条很明确的原则：单文件尽量压在 200 行以内；只管局部模块的规则挪到 <code>.claude/rules/</code> 里，配上 glob 路径过滤，改到对应文件时才加载；<code>@path</code> 语法只是为了拆分文件方便维护，并不能省上下文，引用的文件在初始化时依然会完整拼进上下文里。[9](https://code.claude.com/docs/en/memory)

我自己整理项目规则时，通常按下面六类来切（这是平时摸出来的经验，不是官方规范）：

| 规则内容 | 处理方式 |
| --- | --- |
| 构建命令、目录关系、必须兼容的业务要求 | 必须保留，模型单看代码推不出来 |
| 明确的验收条件、数据安全与权限边界 | 必须保留，能写进测试脚本、权限策略或 Hook 的优先下沉 |
| “认真思考”“全面检查”“反复确认”这类空话 | 测一下到底有没有用，没带来提升直接删掉 |
| 每个任务都要走的冗长流程 | 拆成按需调用的独立 Skill |
| 只针对特定文件或子模块的规则 | 做成带路径限定的 Rules 或独立 Skill |
| 以前为了修旧模型特定 bug 加的临时补丁 | 拿当年的 bad case 重新测，新模型不报错就直接删掉 |

<image source="notion-file-block://76cde798-88c2-494e-a492-09de25c5a695/7324f25e-8d8c-4d44-9f60-bd144ecff327?space_id=2c61081a-28be-8189-9c78-0003c810d110&name=fig5-prompt-audit.svg">
图 5：保留约束，逐组删减冗余规则，再用固定任务复测
</image>

真要动手删规则，动手前记得先给旧配置打个 Git 标签或存个快照。每次只改一组规则，改完马上跑回归测试。跑测试的时候，除了测平时的核心流程，还要把当初因为踩坑才写下这条规则的 bad case 一起拉出来跑。

跑一次成功，不能说明规则就可以放心删。大模型输出本来就有随机性，测试用例也不一定能盖住所有边界。工程上更看重多轮跑下来的稳定程度，还有模型会不会动不动就把该自己干的活推给人来确认（unintended human escalation）。一旦发现改动引起了回退，别慌着把删掉的东西全抄回来，只加回刚好能解决问题的那几行最小规则就行。

如果是必须死守的硬红线（比如绝对不准碰生产配置），千万别只写在文本里，要直接放到权限和工具层去拦。官方文档讲得很清楚：<code>CLAUDE.md</code> 和 Auto Memory 都只是软性的上下文提示，模型还是有概率不遵守；要想 100% 拦死高危操作，必须用 PreToolUse hook 做硬拦截。[9](https://code.claude.com/docs/en/memory)

## 5 skills 和 subagents 分别解决什么

skills 用来在特定阶段给 Agent 注入领域知识和流程规范。subagents 则是彻底隔离的独立执行单元，有私有的 Context Window、System Prompt、工具权限和沙盒边界。subagent 读不到主会话的历史上下文，只接收主 Agent 下发的一条明确指令；执行完毕后也只回传一份结构化摘要，中间翻找日志、反复排查的过程都留在自己的上下文里，不会污染主会话。[12](https://code.claude.com/docs/en/sub-agents)

Claude Code 自己会判断什么时候该分发任务，日常写代码用不着专门在 prompt 里硬塞“必须使用 subagents”。Opus 5 的 Prompt Engineering 指南甚至专门提到：把“请派生 subagent 进行核查”这类提示词删掉。模型本身就有自省能力，硬加这类指令反而会让它过度自查，白白浪费 Token 还拖慢响应。[11](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)

但在面对跨模块全局审计、多工程迁移或大批代码 Review 这类相互解耦的大活时，官方 playbook 推荐的做法是明确拆给多个 subagents 并行跑，主 Agent 负责核对各子单元交回来的证据，再做统一汇总。[2](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/)

按官方文档给出的划分：频繁交互、上下文强依赖、局部改动以及对延迟敏感的事，放在主会话里做最顺手；如果中间输出很长、需要严格限制工具权限、或者能独立推进且只需交回结论，就适合派给 subagent。[12](https://code.claude.com/docs/en/sub-agents)

| 工作场景 | 推荐编排方式 |
| --- | --- |
| 修改单个函数并补齐单元测试 | 主 Agent 单会话直接完成 |
| 按仓库规范自动生成 API 文档 | 主 Agent 挂载对应 Skill |
| 排查多个独立微服务是否存在同类漏洞 | 按服务并行派生 subagents |
| 检索海量日志并提炼根因 | subagent 独立排查并回传核心证据 |
| 对生成的 Diff 做独立安全审计 | 另起隔离会话或独立 Reviewer Agent |

多 Agent 并发的成本和耗时也得算清楚：subagent 和主会话共用总用量，每次调用都单独计费；如果每个 subagent 都甩回一大堆未经提炼的排查日志，主会话的 Context Window 照样会被撑爆。系统默认最多支持 3 层嵌套调用、单次并行上限为 20 个实例。另外，内置的 Explore 与 Plan 类 subagent 为只读模式，初始化时不会加载 <code>CLAUDE.md</code>。[12](https://code.claude.com/docs/en/sub-agents)

拆不拆任务，核心判断标准在“能不能独立验收”。只有当下游子任务能明确交回“影响范围、代码位置、复现证据”时，主 Agent 才能做实质审查。如果每个 subagent 都只回一句含糊的“看起来没问题”，单纯堆 Agent 数量并不能提高系统的可靠性。

单 Agent 挂载 Skill 还是做多 Agent 协同网格，性能和成本目前没有唯一解。官方建议在基线场景下，单个熟练掌握 Skill 调用的 Agent 通常比复杂的多 Agent 编排更快、更省钱；实际怎么选，还是要看具体的工程约束和基准实测数据。

## 6 长任务的运行环境

### 6.1 cloud session 有自己的机器

长任务能不能跑通，环境往往比 Prompt 更关键：哪怕任务拆解得再清楚、验收标准定得再细，只要运行环境里缺了源码、构建依赖或测试数据集，Agent 照样无法推进。

Addy 在 10 月 6 日发布的 Cloud Sessions 指南中把底层环境讲得很清楚：系统为每个任务动态分配一台全新的独立 VM（硬件配置约为 4 vCPU、16 GB 内存、30 GB 存储空间），代码库检出到独立的 <code>claude/</code> 特征分支，会话进程只有权限推送到自身的工作分支。<code>claude --cloud</code> 默认按本地当前分支去 Clone 对应的 GitHub 远程仓库，因此本地 Commit 必须先 Push 上去，未同步到远端的内容云端沙盒根本读不到。若当前仓库缺少 GitHub Remote 或未安装 Claude GitHub App，Claude Code 会退回到打包并上传全量仓库 Bundle 的模式。[13](https://claude.dev/blog/claude-code-in-the-cloud/)

<image source="notion-file-block://f9f0ebd7-2303-4df5-85f7-86fb2602a1e4/54bf3cd4-e8ac-4f14-809e-2b832c9e1071?space_id=2c61081a-28be-8189-9c78-0003c810d110&name=fig6-cloud-boundary.svg">
图 6：GitHub clone 模式下，本机、GitHub 和云端 VM 之间的边界
</image>

随代码库一同挂载的是 <code>CLAUDE.md</code>、rules、skills、agents 和 commands，而开发者本地的 <code>~/.claude</code> 则留在宿主机上。因此仅在用户全局层配置的私有规则，云端沙盒完全看不到。

构建脚本、测试入口、网络策略与凭据体系需要提前配好。默认环境提供受信任网络（Trusted Network）、无预设环境变量与初始 setup script，可覆盖大多数常规 JavaScript、Python、Go、Rust 项目。自定义 setup script 以 root 权限运行，必须保证 <code>exit 0</code> 干净退出，执行耗时尽量收敛在 5 分钟以内，这样环境层才能命中缓存。

集成测试的触发指令应显式写入 <code>CLAUDE.md</code>，别让环境去猜。生产凭据严禁明文硬编码在仓库或 Prompt 中，Pro 与 Max 用户可在环境变量管理后台配置 API Credentials，秘钥会在 VM 外围代理层向指定 Host 请求静默注入，避免明文落盘。另外，云端 VM 空闲超时会被自动回收，重新唤醒时拿到的是干净的新机器镜像与恢复后的对话上下文，未 commit 的本地改动会随 VM 销毁而丢失。[13](https://claude.dev/blog/claude-code-in-the-cloud/)

凡是重度依赖本地物理 GPU、内网专线 RPC、本地私有数据库实例或移动端模拟器的任务，依然建议直接跑在开发者本机。如果组织策略开启了 Zero Data Retention（零数据留存），Cloud Session 功能会被直接禁用。Team 与 Enterprise 租户可以评估处于 Beta 阶段的 Self-hosted Environments，把计算节点收敛到自建基础设施中；至于 Remote Control 模式，本质是把执行环境保留在宿主机、只通过移动端或浏览器进行会话遥控，这跟把执行环境完全托管到云端隔离 VM 完全是两码事。

### 6.2 Projects 管多个 thread

Claude Code 新版 Projects 是一套持久化的多任务协同机制：主模型负责顶层任务拆解与调度，每个细分任务单独拉起一个 thread。在底层实现上，单个 thread 通常对应一个独立的 Cloud Session，有各自的代码分支与仓库副本。主模型只接收各 thread 汇总的阶段性结论与证据，不会逐条监控底层操作；如果不同 thread 改到了同一处业务逻辑并产生冲突，依然走标准 Git PR 合并流程处理。[14](https://claude.com/resources/articles/projects-redesigned)[15](https://code.claude.com/docs/en/claude-projects)

这里要分清楚的是，此处说的是 Claude Code 的新版 Projects 编排系统，不要跟面向日常聊天的老版 Projects 搞混。功能可用范围在官方几处文档中存在一定口径差异：Claude Code 技术文档注明该功能面向 Pro、Max 用户进行公开 Beta 测试并灰度放量，Team 与 Enterprise 租户暂未全量铺开；而帮助中心（截至 2026 年 10 月 31 日）则标注覆盖部分 Pro、Max、Ultra 用户，也就是说具备订阅资格并不等同于已经解锁访问入口。[15](https://code.claude.com/docs/en/claude-projects)[16](https://support.claude.com/en/articles/9517075-what-are-projects)

这里还有一个直接影响第 4 节规则落地的细节：云端 thread 启动时仅加载代码库根目录下的 <code>CLAUDE.md</code>、<code>.claude/CLAUDE.md</code> 以及全局的 <code>.claude/rules/</code>；子模块目录下的 <code>CLAUDE.md</code> 和按路径声明 glob 的 rules 都不会动态挂载，同时仓库内附带的 skills、<code>.mcp.json</code> 以及 <code>.claude/settings.json</code> 中声明的权限规则和 hooks 在该环境下也全部失效。MCP 依赖 <code>claude.ai</code> 账号统一绑定的 connectors 桥接，权限体系则交由 auto mode 配合 thread 内的人工交互确认。[15](https://code.claude.com/docs/en/claude-projects)

<image source="notion-file-block://86ce6de8-bd11-4beb-b7a7-a6c67dec62df/fc9deb84-9001-4d2b-acef-a99a147ffe6e?space_id=2c61081a-28be-8189-9c78-0003c810d110&name=fig7-projects-thread.svg">
图 7：Projects 的云端 thread 启动时会加载和不会加载的配置
</image>

按照第 4 节的思路把专属流程拆进 skill、把局部约束写成路径规则后，一旦切换到 Projects 的云端 thread 体系，这些配置默认都不会生效。所有 thread 必须遵守的底线规则，必须显式写进 Project 指令（上限 16000 字符）或 Project Memory 之中。

当特定子任务强依赖本地私有资源时，可以通过 Remote Control 将指定 thread 路由至宿主机执行，借此调用本机的本地文件、私有 MCP 服务、hooks 与权限策略。这类 thread 只有在本地机器保持唤醒、未休眠时才会运行；若在同一个代码仓库内并行拉起多个本地 thread，必须开启 Git worktree 隔离工作区，否则各进程会互相读写竞争覆写。此外，Project 模式与通用会话共享同一租户配额，并发消耗速度显著加快，所有项目单日累计新增 thread 上限为 200 个。[15](https://code.claude.com/docs/en/claude-projects)

先把单个任务的输入定义和自动验收跑通，再去考虑批量并行。如果单个 session 还在频繁因为缺少信息而卡住，强行开更多 thread 只会让混乱成倍放大。

## 7 完成后仍然要审查

把活交给模型，不等于省掉人工验收。官方 playbook 给出的建议很实在：先找出哪些环节需要人来把关，让模型明确标出没把握的逻辑疑点和排查思路；在人工通读代码之前，先跑一轮自动化 review。[2](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/)

Claude Code 官方团队在内部也是这套思路：他们披露 Claude Code 自身约 90% 的代码都是 Claude 写的。每个 PR 提交后都会过一遍多 Agent 审查流程：多个 Agent 并行扫描缺陷，再由独立的评审 Agent 投票达成共识才给反馈，无关痛痒的代码风格问题直接过滤。这套预览机制上线后，能提出实质性审查意见的内部 PR 比例从 16% 涨到了 54%。不过，Agent 判定绝不能代替人工签字，像计费逻辑、自动更新组件、CI/CD Workflow 这类核心高危代码，依然得由资深工程师逐行把关。[17](https://claude.dev/blog/solving-code-review-at-anthropic/)

本地排查可以先跑 <code>/code-review</code> 和 <code>/security-review</code>。模块负责人也可以整理一份 <code>REVIEW.md</code>，写清楚常见故障特征、允许跳过检查的路径，并要求评审意见必须附带精确的文件路径与代码行号。

实际交付时，先让负责实现的会话整理出跑过的命令、输出日志和遗留风险项，再把初始 spec 和最终 diff 丢给一个全新的审查会话。这和第 5 节反对的“同会话反复自查”并不冲突，属于跨上下文的独立验收。下面是一份通用的审查 Prompt 模板（可根据项目需要微调）：

```txt
根据这份 spec 审查最终 diff。
重点检查行为兼容、异常路径、并发、数据安全和测试覆盖。

把发现的问题全部列出来，按严重度排序，由我来决定改哪些。
每个问题给出代码位置、触发条件、影响和可验证的证据。
区分已证实的问题与需要进一步验证的疑点。
没有证据的风格偏好，不作为 bug。

本轮只报告，不修改文件、不提交、不发布。
```

要求“全部列出再由人工筛选”，是有意这么设计的。Opus 5 的官方文档里提过：如果在 Prompt 里直接限制“只报高严重度问题”或“标准放保守一点”，模型往往会按字面死抠，为了稳妥而少报漏报；更靠谱的做法是让它先把问题全部列出来，再由人工或下游规则做二次筛选。[11](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)

开一个独立的审查会话，确实能避免模型顺着写代码时的思路“自我辩解”，但只要还是同一个模型，依然难免有共性的认知盲区。所以核心业务逻辑对不对，终究要靠自动化回归测试、静态代码分析和人工经验一起来兜底。

Reviewer 报出问题后，同样要先确认触发环境和复现步骤，不能因为 Agent 语气笃定就全盘照收。特别是涉及线上发布、生产数据迁移和核心公共 API 变更这类操作，团队原有的审批流程一步都不能省。

## 8 总结一下

这套做法用起来其实很实在，关键就在于立好验收标准、给旧规则瘦身。把任务目标、边界限制和自动化验证方式交代清楚，逐步删掉教它怎么一步步操作的过程性提示词；每次优化到底有没有变好，看测试反馈就清清楚楚。

用 Opus 5.5 时，建议先从 <code>medium</code> 档位起步。版本迁移过程中，要重点防一下 Prompt Cache 失效、<code>max_tokens</code> 截断以及思考模式关不掉这些边界情况。遇到高复杂度任务，再按需增加思考预算、挂载 subagents 或拉长会话，别一上来就把配置堆得太重。另外，把定制逻辑拆到 skills 和路径规则之后，也要留意 Projects 云端 thread 的上下文隔离特性。

用好 Agent，最根本的转变其实是把“怎么判定任务完成”，从交付后的被动修补，提前变成一开始就定好的验收标准。放在其他 Agent 框架里也一样：输入给够上下文，靠确定性的自动化测试让模型自己跑迭代，碰到系统边界就及时停手。

这里建议各位都好好用下，不要因为懒～

我是老潘，我们下期见\~

关注「oldpan博客」，持续酝酿深度质量文。

## 参考链接

1. [Addy Osmani：You're probably overprompting Claude（X 长文，2026-10-29）](https://x.com/addyosmani/status/2115688494865465370)
2. [Addy Osmani：Getting the most out of Opus 5.5 in Claude and Claude Code（2026-09-22）](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/)
3. [Claude Code：Keep Claude working toward a goal](https://code.claude.com/docs/en/goal)
4. [Anthropic：Auto mode default in Claude Code](https://claude.com/resources/articles/auto-mode-default-in-claude-code)
5. [Claude Platform：Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5)
6. [Claude Platform：Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
7. [Claude Code：Model configuration](https://code.claude.com/docs/en/model-config)
8. [Thariq Shihipar：The new rules of context engineering for Claude 5 generation models（2026-07-24）](https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/)
9. [Claude Code：How Claude remembers your project](https://code.claude.com/docs/en/memory)
10. [Claude Code：Commands](https://code.claude.com/docs/en/commands)
11. [Claude Platform：Prompting Claude Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)
12. [Claude Code：Create custom subagents](https://code.claude.com/docs/en/sub-agents)
13. [Addy Osmani：Claude Code in the cloud（2026-10-06）](https://claude.dev/blog/claude-code-in-the-cloud/)
14. [Anthropic：Projects redesigned（2026-09-17）](https://claude.com/resources/articles/projects-redesigned)
15. [Claude Code：Let Claude coordinate ongoing work with Projects](https://code.claude.com/docs/en/claude-projects)
16. [Claude Help Center：What are projects?](https://support.claude.com/en/articles/9517075-what-are-projects)
17. [Qing Wang、Addy Osmani 等：How the Claude Code team does code review（2026-10-15）](https://claude.dev/blog/solving-code-review-at-anthropic/)

<p />

<p />

## 附：原文配图里的文字（source/figures/）

### fig1-task-contract.svg
- 一条任务提示里值得写的四块
- 以第 1 节的接口迁移任务为例，左边写进提示，右边交给 agent 自己定
- 完整任务
- 把 src/api 下的旧 SDK 调用迁移到新 SDK
- 完成条件
- 响应字段、错误码、超时行为保持兼容
- uv run pytest -q tests/api 通过，新增 3 类用例
- 范围和停止点
- 不改无关模块，不删或跳过测试，不部署生产
- 缺凭据、需求冲突、要改公共接口时先停下来问
- 汇报方式
- diff 摘要、实际运行的命令和结果、未验证的部分
- 交给 agent 自己定
- 先搜哪些文件
- 函数怎么拆、按什么顺序改
- 中间跑哪些临时命令
- 什么时候拆给 subagent
- 可以删掉的句子
- 请认真思考
- 务必全面检查
- 完成前反复确认
- 示意图，内容对应正文里的示例提示；目录和测试命令是假设仓库中的

### fig2-goal-loop.svg
- /goal 的一轮：执行和判定分开
- evaluator 不调用工具，只读对话里已经出现的内容
- 主 agent 的一轮
- 改代码、跑测试命令
- 把命令、退出码、结果摘要
- 写进对话
- evaluator
- 输入：goal 条件 + 到目前为止的对话
- 不读文件、不跑命令
- 输出：一个判定 + 一句理由
- 轮结束
- 未达成
- 理由作为下一轮的指引
- 主 agent 继续干
- 已达成
- 清除 goal
- 记一条 achieved
- 不可能达成
- 清除 goal
- 记一条 failed 和理由
- 几道兜底
- 后台命令或 subagent 还在跑：本轮跳过评估，等后台活结束的那一轮再判
- 连续几轮没有工具调用：循环停下，控制权还给你，goal 保留
- 认证失败、额度耗尽、上下文溢出且压缩不掉、模型不可用：直接清掉 goal
- 依据 Claude Code /goal 文档（2026-10）。evaluator 默认跑在配置的 small fast model 上，
- 可用 ANTHROPIC_DEFAULT_HAIKU_MODEL 换模型，但这个变量也会影响其他后台功能

### fig3-effort.svg
- Opus 5.5 的 effort：默认降了一档
- 上：API 文档里两代 Opus 的默认档位；下：Claude Code 决定本次用哪一档的顺序
- Opus 5
- low
- medium
- high · 默认
- xhigh
- max
- Opus 5.5
- low
- medium · 默认
- high
- xhigh
- max
- xhigh、max：只给已经测出质量收益的任务；Opus 5.5 每轮思考往往比 Opus 5 多，这两档更明显
- ① 显式指定
- CLAUDE_CODE_EFFORT_LEVEL
- --effort  /  /effort
- ② 设置文件
- modelSettings 按模型存的档位
- 其次是 effortLevel *
- ③ 模型默认
- Opus 5.5：medium
- Opus 5：high
- 按顺序取第一个有值的。/effort 后面直接打档位会存成默认值；只想本次生效，在滑块里按 s
- max 除非用环境变量指定，否则只在当前会话生效
- * user settings 顶层的 effortLevel 对 Opus 5.5 不生效
- 依据 Claude Platform Effort 与 Claude Code model-config 文档（2026-10）；
- “5.5 的 medium 匹配或超过 5 的 high”是 Anthropic 自家评测结论，我没有复测

### fig5-prompt-audit.svg
- 给旧规则做删减实验
- 先审查，再一组一组删，每次都用同一批任务复测
- 备份
- 留一份能恢复的
- 旧配置
- 审查
- /doctor prompt-audit
- 看报告和拟议修改
- 删一组
- 只动一类规则
- 其他保持不变
- 复测
- 日常任务
- + 当初的失败样例
- 多个任务都稳定通过
- 这组规则可以删，进入下一组
- 出现回归
- 只恢复能解释这次失败的最小规则
- 下一组
- 不参与删减，换个地方放
- 必须始终成立的：权限规则、PreToolUse hook
- 模型猜不出的项目事实：留在 CLAUDE.md
- 只和部分代码相关的：.claude/rules/ 按路径加载
- 专项流程：挪进 skill，用到再加载
- 示意流程，是工程上的整理方法，不是官方模板

### fig6-cloud-boundary.svg
- cloud session 能看到什么
- 以 claude --cloud 的 GitHub clone 方式为例，本机东西要经过 GitHub 才能到 VM
- 你的电脑
- 已 commit 并 push 的代码
- 未 push 的 commit
- 工作区未提交的改动
- ~/.claude 用户级配置
- 本地 GPU、数据库、内网服务
- GitHub
- 当前分支
- claude/ 工作分支
- PR
- 云端 VM（每个任务一台）
- 约 4 vCPU / 16 GB / 30 GB
- clone 到新的 claude/ 分支
- 只能 push 自己的工作分支
- 仓库里的 CLAUDE.md、rules、
- skills、agents、commands
- 环境：setup script、网络白名单、
- 变量和凭据
- 空闲会被回收，重开是新 VM
- push
- clone
- 分支/PR
- 没 push 的、只在本机的，云端看不到
- 依据 Addy Osmani《Claude Code in the cloud》（2026-10-06）。仓库没有 GitHub remote 或没装 App 时，
- Claude Code 改为上传仓库 bundle，此时能否 push 回去取决于 GitHub 连接的权限

### fig7-projects-thread.svg
- Projects 的云端 thread 启动时拿到哪些配置
- 按仓库的 skills、路径规则写的约束，到了云端 thread 默认不在
- 会加载
- 项目指令（最多 16000 字符）
- 项目 memory（启动读 MEMORY.md 索引）
- 仓库根目录 CLAUDE.md 和 .claude/rules/
- claude.ai 账号上的 connectors（MCP）
- 项目 cloud 环境里的网络、变量、凭据
- 不会加载
- 子目录里的 CLAUDE.md
- 按路径限定的 rules
- 仓库里的 skills
- .mcp.json 里的 MCP server
- .claude/settings.json 的权限规则
- .claude/settings.json 的 hooks
- 依据 Claude Code Projects 文档（2026-10，beta）。想用本机的 MCP、hooks 和权限规则，
- 可以让这个 thread 通过 Remote Control 跑在自己电脑上

### claude-context-stack.png
- 图 4：上下文由哪些部分组成（图源：Thariq Shihipar 的上下文工程文章），原图直接引用
