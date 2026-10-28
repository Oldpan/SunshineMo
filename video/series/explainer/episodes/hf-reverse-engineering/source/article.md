# Reverse Engineering Anything using small open models（原文 + 配图 + 核对底稿）

- 原文：https://huggingface.co/blog/ybelkada/reverse-engineering-anything-with-small-local-mode
- Hugging Face 社区博文（Community Article），发布 2026-10-26；作者 Younes B（ybelkada）、Nathan Habib（SaylorTwift）、Lysandre（lysandre）
- 抓取：2026-10-28。正文用 pandoc 从页面 HTML 转出（只去掉锚点和样式），两张交互配图（HF Space iframe）和两段录屏的内容在后面「配图」节逐条摘录。
- 复核只认这份资料。

---

## 正文

## Introduction 

Reverse Engineering modern software has become very popular in recent weeks and months, especially with the exponential rise of the [Reverse Engineer Anything (REA) repository](https://github.com/morluto/rea), which crossed 370k GitHub stars as we write this blog post.

[](https://cdn-uploads.huggingface.co/production/uploads/62441d1d9fdefb55a0b7d12c/Z7N_lIDQvgt_ieZYZbGPF.png)

Today, if you plug powerful models into this application, you can easily reverse engineer almost any modern software, and the results are impressive. We have seen community re-implementations of Adobe products, Linux extensions, and customizations of popular games. We also recommend [this very nice YouTube video from Low Level](https://www.youtube.com/watch?v=qFEuYUfauNY), which goes through this technique, and made us want to dig a bit deeper into the topic.

What is exactly Reverse Engineering in this context, and are organized agents and their subordinates sufficiently performant to see interesting results? In this blog post, we are going to share preliminary experiments and results as we explore this concept by leveraging local and open AI models.

## Reverse Engineering in the context of software engineering 

In the context of software engineering, reverse engineering makes sense when the software is closed-source and distributed to common folks as compiled binary files. It is not possible to retrieve the software's source code directly from the binary file, but you can extract essential information and the compiled software's structure from it. Below is a demo that showcases the components that can be inspected from the binary file that we used for the Hugging Face logo assignment:

[交互配图 1：Inside a compiled binary（见下方「配图」节）]

stripped (as shipped)

unstripped (same build)

For more details from ([this article](https://medium.com/@bugprove/basics-of-binary-analysis-e29a3d75bd56)):

- Machine Code & Control Flow: Instructions that the CPU executes, including loops, function calls, and conditional branches, which can be visualized using disassemblers.
- Embedded Strings & Data: Hardcoded text, file paths, API endpoints, error messages, and configuration constants visible via string-extraction utilities.
- Symbols & Function Names: Unstripped binaries reveal function names, global variables, and debugging metadata that outline how the program is organized.
- Linked Libraries & Dependencies: Imports and shared libraries (such as .dll files on Windows or .so files on Linux, as shown by tools like ldd) indicate which external code the binary relies on.
- Architectural & Format Details: The file container structure (such as ELF on Linux or PE on Windows) reveals target hardware architecture, compilation flags, and section layouts.
- Security Flaws & Vulnerabilities: Static and dynamic analysis can uncover hardcoded secrets, weak cryptographic implementations, or memory-safety bugs

Therefore, it is possible to use existing tools from the community, to disassemble binary files and inspect core components such as:

> Symbols & Function Names: Unstripped binaries reveal function names, global variables, and debugging metadata that outline how the program is organized.

This is the main piece we will exploit to build our REA proof of concept using small local models.

## Experimental design and results 

We designed two very simple toy problems to reverse engineer. For both problems, we use Claude Code to generate the associated C codebase and provide the compiled software as input to the reverse engineering pipeline.

For each problem, we assign a lead agent who needs to be capable; thus, we use `deepseek-ai/DeepSeek-V4.1-Flash-1017`. The lead disassembles the binary, finds and names the functions, guesses their signatures, and recovers the memory layout and data tables. Then it posts tasks with hints on a shared board, and idle workers pick up tasks themselves. For the workers, we use the `Qwen/Qwen3.5-9B` model.

The worker agents also have access to a testing oracle, diff_test, which runs ~600 cases through the original binary function and the Python version and compares the return value and every byte of game state exactly. It returns a pass rate on held-out cases plus the first mismatches (which bytes or pixels differ). The worker will submit their final implementation only if all tests passed. After a certain number of attempts (if not completed), the submission will be escalated to the lead agent, who will take the task on their own.

All AI agents here leverage an extended version of a harness purely based on [IPython](https://github.com/huggingface/ipython-harness). Every agent starts with the same small toolkit: read the binary (disasm, rodata, …), watch it run (trace, call_address), and test a rewrite against the original (diff_test, submit). The lead also gets tools to record the shared map and post tasks. It is also allowed for the lead to modify the workers' harnesses by adding new tools or modifying core components of the harness if the lead estimates it is relevant. This will allow us also to observe the ‘evolution’ of the harnesses for the worker agents. The diagram below summarizes very well the designed pipeline - on the example of the second assignment:

[交互配图 2：One function through the pipeline（见下方「配图」节）]

### Problem 1: Hugging Face animated logo 

The first problem we designed was to reconstruct an animated video that had been compiled in binary format. The video is a simple pixel art version of the HF logo. In this problem, there are 38 functions to re-write in Python. Below is a video that shows how the video renders, function after function rewritten by the worker agents:

This table summarizes the performance of this pipeline, compared to a full solo run:

| Run        | Setup              | Functions accepted | Escalated to the lead | Lead harness changes | Big model tokens (in / out) | Small model tokens (in / out) | Cost         | Active time         |
|------------|--------------------|--------------------|-----------------------|----------------------|-----------------------------|-------------------------------|--------------|---------------------|
| **Team 1** | Lead + 4 workers   | **38 / 38**        | 15                    | 0                    | 7.79M / 0.21M               | 3.56M / 0.21M                 | **\$2.97**   | 86 min (2 launches) |
| Solo       | One DeepSeek agent | **38 / 38**        | n/a                   | n/a                  | 2.53M / 0.10M               | none                          | **\$0.87** ⁴ | **14 min**          |

Note that the workers escalated 15 functions to the lead, judging them too difficult to re-write. Overall, the pipeline is slower and more expensive, and the lead did not propose any harness changes for the workers. Perhaps the problem was way too easy for the lead agent to solve in one shot, and the functions were difficult for the small agents to complete (perhaps not granular enough).

What if we scale up slightly the number of functions to write? We made a second experiment with a different style, a space shooter game.

### Problem 2: Space Shooter game 

In this setup, we designed a simple Space Shooter game and tasked the models with reverse-engineering it. The original source code contains 56 functions that need to be rewritten.

| Run                  | Setup              | Functions accepted | Escalated to the lead | Lead harness changes                  | Big model tokens (in / out) | Small model tokens (in / out) | Cost       | Active time             |
|----------------------|--------------------|--------------------|-----------------------|---------------------------------------|-----------------------------|-------------------------------|------------|-------------------------|
| **Team (completed)** | Lead + 4 workers   | **56 / 56**        | 20                    | 3 (2 worker prompts, 1 `lookup` tool) | 8.96M / 0.30M               | 4.94M / 0.37M                 | \$3.60     | 100 min (2 launches)    |
| Solo                 | One DeepSeek agent | **56 / 56**        | n/a                   | n/a                                   | 9.69M / 0.31M               | none                          | **\$3.28** | **54 min** (4 launches) |

In absolute cost, the pipeline now starts to tie with the solo run. A solo run struggles handling this big task in a single long run. Interestingly, putting this side by side with the first run shows that scaling the number of functions to rewrite, highlights the advantage of using such pipeline.

A good example of why the lead's oversight matters is `draw_particles`. The workers kept failing to reverse-engineer it. Their Python looked structurally right, but `diff_test` kept reporting mismatches. The problem was not the logic but how they read the ARM instructions. The disassembly compares a value with `cmp` and then branches with `b.ls`, which on AArch64 means "lower or same" as an **unsigned** comparison. The workers kept translating it as a plain signed ` s[469+i]; a u16 signed field -> (s[o] | s[o+1]=32768 else v.
2. Only call fn('name') for functions that exist in port/map.json (check the names listed in the board/map). Never invent helper names like star_x/star_y.
3. Your submission is exactly one function def (s, ...) with the arguments of the mapped signature, mutating the bytearray in place. Import helpers with from experiments.rebuild.runtime import fn and tables with from port.constants import *.
4. Follow the hint literally: the hints are transcribed from the disassembly. Do not "improve" constants. AArch64 traps: b.hi/b.ls compare UNSIGNED (negative args are > 23!), ldrsh/ldrsb are signed, strb stores value & 0xFF.
5. If the diff_test mismatch is in one or two pixels/cells only, suspect a signedness or off-by-one in a loop bound, not the overall structure. Report what you could not explain rather than guessing wildly.
```

We also record the motivation of the lead on why it made this change:

> *Workers repeatedly fail on the same chores: they invent helper function names (draw_stars_layer1 used fn('star_x')), ignore signed/unsigned distinctions, and do not use layout.py offsets.*

#### System prompt v2 

v1 +

``` md
1. … if it is listed as s16 use v = v-65536 if v>=32768 else v. Confirm an offset with lookup("") instead of recomputing base-pointer arithmetic by hand: ldrsh w1,[x23,x19,lsl #1] with a negative-offset base resolves to a plain field offset.
2. … Never invent helper names like star_x/star_y. Before calling a callee run lookup('callee') and pass exactly the recorded number and order of arguments - a wrong argument count throws and burns the attempt.
3. (unchanged)
4. … b.hi/b.ls compare UNSIGNED (negative args are > 23!) so cmp w,#0xc + b.ls means x  *Workers repeat three mistakes: they translate cmp/b.ls as \< instead of unsigned \<= (draw_particles, update_shots), they call callees with the wrong argument count (update_ufo/boxes_overlap TypeErrors), and they hand-derive field offsets from base-pointer arithmetic instead of reading the layout (593 vs 625, 581 vs 565).*

The v2 harness also includes a new tool `lookup`, a small tool the lead wrote for its workers so they can look up facts the team had already recorded instead of re-deriving them: the signature of any function, or which state field sits at a given byte offset.

## Conclusion and open questions 

Small models are capable of producing decisive content if they are properly conditioned, i.e., well prompted (given a scope they can work on) and in the right scaffold (or harness) where they can work.

Overall, for both tasks, about 40% of the functions needed the lead (15 of 38 on the HF logo, 20 of 56 on the space shooter). A possible direction would be to explore using a pool of workers of different sizes and families, which would open the possibility of exploring swarms of small models guided by a lead (or a set of leads) or much larger models.

There also seems to be a correlation (though difficult to say, with only two data points), with respect to the number of functions to re-write. This protocol might make sense for very long-horizon tasks, which require tons of planning, and for problems that can be scoped into granular task distributions. It would also be very interesting to observe the evolution of harnesses for worker agents in such a setup.

---

## 配图

### 题图（REA 仓库截图，Z7N_lIDQvgt_ieZYZbGPF.png）

GitHub 仓库 `rea`（Public），Watch 1315 · Fork 92.5k · Star 370k；About：「Reverse engineer anything with agents, from app behavior down to native binaries.」最近一次提交：Sriram-PR and morluto，`fix(python): reject code keys and s…`，cc99d89 · 2 minutes ago。

### 交互配图 1：Inside a compiled binary（https://ybelkada-rebuild-inspect.static.hf.space）

- 文件 `hugface.so`（HF logo 那道题的二进制），67,432 字节；unstripped 版本 71,312 字节。顶部开关：`stripped (as shipped)` / `unstripped (same build)`。
- 六个标签页：Machine code & control flow · Strings & data · Symbols & names · Linked libraries · Format & architecture · Security。
- 机器码页：「The instructions the CPU runs, recovered by a disassembler: 40 functions, found by scanning the code section (38 belong to the game, 2 are compiler start-up stubs).」命令 `objdump -d hugface.so`。stripped 模式下函数显示为 `sub_<地址>`，只有导出的 4 个有名字。
- 符号页：stripped 版只剩 4 个导出符号：`hf_state_size`、`hf_palette`、`hf_new`、`hf_step`；unstripped 版有 63 个符号（含 `put_pixel`、`paint_over`、`hline`、`fill_circle`、`draw_face_fill`、`draw_eye_left` 等内部函数名）。
- 头信息：ELF64，little endian，Type DYN (Shared object file)，Machine AArch64，25 个 section。
- 链接库：`libc.so.6`；导入 `memset` 等。编译器注释：`GCC: (Debian 12.2.0-14+deb12u1) 12.2.0`。
- 安全页：NX 开、RELRO 开、canary 关、PIC 开。

### 交互配图 2：One function through the pipeline（https://ybelkada-rebuild-pipeline.static.hf.space）

正文说「The diagram below summarizes very well the designed pipeline - on the example of the second assignment」。图上 7 个节点：Stripped binary（no names）→ Lead agent（DeepSeek V4.1）→ Task board（shared）→ Worker agent（Qwen3.5-9B）→ Oracle（diff_test）→ Python port（accepted code）→ Full replay（vs the binary）；虚线：worker → lead（升级）、lead → oracle、lead → worker（改 harness）。8 步说明（注释「one real function from the space-shooter run (rebuild-vr-team-1)」）：

### Step 1: A function with no name

The game is a stripped binary: 56 functions, and only the 4 exported ones still have names. Here is the one at 0x1184, as a disassembler shows it. Nobody has told the agents what it does.

```
11d0:  ldrb   w4, [x19]          ; load a byte
    11d4:  cbz    w4, 11c4           ; zero? skip it
    11d8:  ldrsh  w1, [x23, x19, lsl #1]; load a signed 16-bit value
    11dc:  asr    w1, w1, #4
    11e0:  ldrsh  w2, [x22, x19, lsl #1]
    11e4:  asr    w2, w2, #4
    11ec:  cmp    w4, #0xc
    11f0:  b.ls   11bc
    11bc:  bl     664                ; call another unnamed function
```

### Step 2: The lead names it and posts a task

The lead (DeepSeek) reads the code, works out that it draws the 32 explosion particles, names it, and puts it on the shared board with a hint for the workers.

```
draw_particles(state)  @ 0x1184
purpose: draws the 32 explosion particles at x>>4, y>>4,
         colour 8 while life ≤ 12, else the particle's colour

hint posted on the board:
for each particle i: life = s[593+i]; skip if 0;
x = i16(s[326+2i]) >> 4;  y = i16(s[390+2i]) >> 4; …
```

### Step 3: A small worker picks it up

An idle worker (worker-2, a 9B Qwen model) claims the task and writes a first Python version. It looks right, but one line is wrong: it builds each 16-bit position from the wrong bytes, and as unsigned.

```
def draw_particles(s):
    part_x = [(s[326 + 2*i] | s[325 + 2*i]<<8) for i in range(32)]   ← wrong bytes, unsigned
    part_y = [(s[390 + 2*i] | s[389 + 2*i]<<8) for i in range(32)]
    for i in range(32):
        if s[593 + i] == 0: continue
        x, y = part_x[i] >> 4, part_y[i] >> 4
        colour = 8 if s[593 + i] <= 12 else s[625 + i]
        fn('put_pixel')(s, x, y, colour)
```

### Step 4: The oracle says: not yet

Every attempt goes to diff_test: ~600 game states run through the original function and the Python one, compared byte for byte. It answers with a pass rate and the first differences. Worker-2 tries three times and stays at 56%.

```
try 156%
try 256%
try 356%  (same logic resubmitted)
first differences:
fb[x=71, y=2]:  expected 0  got 9
fb[x=11, y=10]: expected 0  got 9      ← particles drawn in the wrong place
fb[x=48, y=31]: expected 1  got 9
```

### Step 5: Stuck: escalated to the lead

When the worker resubmits the same logic again, the system takes the task away from it and escalates it. The lead receives the worker's notes, its latest code and the mismatches, and takes over.

```
↑ draw_particles escalated to the lead  (best 56%)
In this run, 20 of the 56 functions were escalated like this: about one in three.
```

### Step 6: The lead fixes it: 100%

The lead reads the 16-bit values the way the code does (ldrsh: little-endian, signed). The oracle now matches on every case, and the function is accepted into the Python port.

```
def draw_particles(s):
    for i in range(32):
        life = s[593 + i]
        if life == 0: continue
        x = s[326 + 2*i] | (s[327 + 2*i] << 8)     ← low byte first
        if x >= 0x8000: x -= 0x10000               ← signed
        … same for y …
        colour = s[625 + i] if life > 12 else 8
        put_pixel(s, x >> 4, y >> 4, colour)
lead100% · accepted
```

### Step 7: The lead upgrades the workers' harness

Seeing workers compute byte offsets by hand, the lead writes them a new tool, lookup, and a rule to use it. Every worker gets both from its next task on.

```
the lead's reason: "Workers lose whole attempts guessing: they … hand-compute
state offsets (593 vs 625, …) instead of reading port/layout.py. One tool that
answers both questions from the recorded map/layout removes that chore."

new tool  lookup("593")       → part_life at 593..625 (593, 'u8', 32)
          lookup("put_pixel") → its recorded signature, argument ranges, purpose

new rule  "Confirm an offset with lookup("<offset>") instead of
          recomputing base-pointer arithmetic by hand."
```

### Step 8: All 56 functions, then the final test

When every function is accepted, the whole game runs in Python against the original binary, frame by frame. It matches on every frame: the binary has been rebuilt.

```
accepted56 / 56
escalated20 needed the lead
✓ pure-Python replay: identical to the original binary on every frame
```

### 录屏 1（HF logo，mP2OwuXgjFP7tAz3hao9h.mp4，32 秒）

标题「REbuild: the Hugging Face logo, rebuilt from a stripped binary by a team of models」。左边像素画面逐步画出 logo，右上 lead + worker-1..4 状态，中间 38 个函数砖块（灰 → 黄 = 在做 → 绿 = 通过），底部 `n/38 functions rebuilt  t = … min  tokens = …`。结尾：「38/38 functions rebuilt · 24 functions rebuilt by the small workers, 14 by the lead when a worker got stuck.」t = 86 min，tokens = 11.7M。

### 录屏 2（太空射击，IipIIiH6lDo7H9yVRulq7.mp4，41 秒）

标题「REbuild: a space shooter, rebuilt from a stripped binary by a team of models」。56 个函数砖块（开始时不少是 `sub_17bc` 这类无名函数，后来都有了名字）。结尾：「identical on every frame so far (540/540)」「56/56 functions rebuilt · 33 functions rebuilt by the small workers, 23 by the lead when a worker got stuck.」t = 100 min，tokens = 14.5M。

---

## 补充核对（不是原文，视频里用到时标明出处）

- 模型：Hugging Face API `deepseek-ai/DeepSeek-V4.1-Flash-1017`（创建 2026-10-17，license MIT，image-text-to-text）；`Qwen/Qwen3.5-9B`（创建 2026-02-27，license apache-2.0，约 9.65B 参数）。
- r/LocalLLaMA 帖 1xgoxvu（2026-10-27）转发了这篇；Reddit 接口在本环境取不到，视频不引用。
- `huggingface/ipython-harness` 仓库网页本环境 403，公开情况未知；视频只说「基于 IPython 的极简 harness」。

## 原文内部对不上的地方（视频照正文 + 表格讲，屏幕上注明）

1. **stripped 还是 unstripped**：正文说「Symbols & Function Names: Unstripped binaries reveal function names … This is the main piece we will exploit」；但配图 1 的默认模式是「stripped (as shipped)」，配图 2 第 1 步写「The game is a stripped binary: 56 functions, and only the 4 exported ones still have names」，两段录屏标题都写「rebuilt from a stripped binary」，实验设计里也写「The lead … finds and names the functions」。→ 视频讲法：拿到的是去掉符号的二进制，只有导出函数有名字，其余由主管命名；正文把「符号和函数名」列为这次主要利用的信息。
2. **退回主管的数量**：表格 15（logo）/ 20（射击）；录屏结尾「14 by the lead」/「23 by the lead」。→ 用表格；配图 2 第 8 步也写「20 needed the lead」。
3. **draw_particles 怎么解决的**：正文说主管看到几个工人犯同一个 `b.ls` 错误，没有自己接手，而是改了工人的系统提示词，工人随后自己完成。配图 2 用同一个函数做演示：工人（worker-2）卡在 56%（错在按无符号、错字节拼 16 位数），被升级给主管，主管按 `ldrsh`（小端、有符号）改对、100% 通过，之后主管写了 lookup 工具。→ 视频按正文讲，同时在画面上注明「原文配图的分步演示里，这个函数是升级给主管修好的」。
4. 表格第一题单干成本 `$0.87` 后有脚注标记 ⁴，原文没有对应脚注内容。
