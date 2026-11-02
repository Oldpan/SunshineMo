// Section 1: hand the whole task over — principles, the example prompt, the contract (figure 1), when to stop, spec.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Arrow, Board, Box, Cross, Hd, Head, HL, Illus, Item, Mo, Note, Pill, prog, rise, Src, Stamp, Strike, Term, Tick, TypeLine, usePopIn, W, Zh} from './common';

// ------------------------------------------------------------------ principles
export const Principles: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const P = ['一次交出完整任务', '讲清“做完”的标准', '说明什么时候停下来等人'];
  const DONE = ['所有 endpoint 都切到新 client', '旧 client 彻底删掉', '测试全部跑通'];
  return (
    <Board>
      <Head num="1" title="把完整任务一次交出去" />
      <div style={{position: 'absolute', left: 110, top: 170, ...pop(b[1], 0)}}>
        <Box x={0} y={0} w={560} h={150} p={prog(b[1], 20)} seed={110} bg={W.yellow} pad="18px 26px">
          <Zh size={22} color={W.dim}>
            官方 playbook · 2026-09-22 · Addy Osmani
          </Zh>
          <Mo size={24} w={700} style={{display: 'block', marginTop: 8, whiteSpace: 'normal'}}>
            Getting the most out of Opus 5.5 in Claude and Claude Code
          </Mo>
        </Box>
      </div>
      {P.map((t, i) => (
        <div key={t} style={{position: 'absolute', left: 110 + i * 590, top: 370, ...pop(b[2], i * 12)}}>
          <Box x={0} y={0} w={540} h={110} p={prog(b[2], 18, i * 12)} seed={111 + i} pad="24px 28px">
            <Hd size={36}>
              <span style={{color: W.clay}}>{i + 1}</span> {t}
            </Hd>
          </Box>
        </div>
      ))}
      <div style={{position: 'absolute', left: 760, top: 200, opacity: prog(b[3], 10)}}>
        <Strike p={prog(b[3], 14, 14)} w={300}>
          <Mo size={40} w={700}>
            think carefully
          </Mo>
        </Strike>
        <Note x={0} y={64} p={prog(b[3], 20, 26)} size={28} rot={-2} w={640}>
          模型输出前本来就会思考
        </Note>
      </div>
      <Box x={110} y={540} w={1160} h={300} p={prog(b[4], 22)} seed={115} pad="22px 30px">
        <Hd size={32} color={W.clay}>
          “做完” = 机器能验证的状态（playbook 的例子）
        </Hd>
        {DONE.map((t, i) => (
          <div key={t} style={{position: 'relative', marginTop: 14, paddingLeft: 60, opacity: prog(b[4], 10, 16 + i * 14)}}>
            <Tick x={0} y={0} p={prog(b[4], 10, 20 + i * 14)} s={38} />
            <Zh size={30}>{t}</Zh>
          </div>
        ))}
      </Box>
      <Note x={1300} y={490} p={prog(b[2], 18, 40)} size={24} rot={-2} w={520} color={W.blue}>
        原文：等人工确认（Human-in-the-Loop）
      </Note>
      <Note x={1320} y={600} p={prog(b[4], 24, 60)} size={30} rot={-3} w={480}>
        只有测试里出现查不出原因的异常，才停下来找人
      </Note>
      <Src>来源：Addy Osmani《Getting the most out of Opus 5.5 in Claude and Claude Code》（2026-09-22）</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ the example prompt
const PROMPT: [string, number][] = [
  ['把 src/api 下仍使用旧 SDK 的调用迁移到新 SDK。', 0],
  ['', 1],
  ['完成条件：', 1],
  ['- 对外响应字段、错误码和超时行为保持兼容。', 1],
  ['- 运行 uv run pytest -q tests/api，现有用例通过。', 1],
  ['- 新增用例覆盖空输入、超时与并发调用。', 1],
  ['- 检查调用点，确认没有遗漏的旧 SDK 引用。', 1],
  ['', 2],
  ['范围：不改无关模块，不通过删除或跳过测试获得通过。', 2],
  ['可以自行选择实现步骤；缺少必要凭据、需求冲突，', 3],
  ['或需要修改公共接口时先停下来说明。', 3],
  ['不要部署到生产环境。', 2],
  ['', 4],
  ['完成后给出 diff 摘要、实际运行的命令和结果，', 4],
  ['以及仍未验证的部分。', 4],
];
const TAGS = [
  {t: '要做什么', top: 176, h: 40, beat: 0},
  {t: '完成条件', top: 256, h: 200, beat: 1},
  {t: '范围 · 红线', top: 496, h: 40, beat: 2},
  {t: '停止点', top: 536, h: 80, beat: 3},
  {t: '汇报方式', top: 696, h: 80, beat: 4},
];

export const Prompt: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  // stagger lines inside a beat
  const startOf = (i: number) => {
    const bt = PROMPT[i][1];
    const k = PROMPT.slice(0, i).filter((l) => l[1] === bt).length;
    return b[bt] - k * 10;
  };
  return (
    <Board>
      <Head num="1" title="一个接口迁移任务的提示词" />
      <Box x={100} y={150} w={1180} h={700} p={prog(frame, 24)} seed={120} bg={W.term} pad="26px 34px">
        {PROMPT.map(([t], i) => (
          <TypeLine key={i} text={t} f={startOf(i)} cps={70} size={25} color={i === 11 ? '#F0A08E' : W.termInk} />
        ))}
      </Box>
      {TAGS.map((tg, i) => {
        const f = b[tg.beat] - (i === 1 ? 0 : 0);
        return (
          <div key={tg.t} style={{position: 'absolute', left: 1300, top: tg.top, opacity: prog(f, 12, 10)}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 14, height: tg.h, borderTop: `4px solid ${W.clay}`, borderBottom: `4px solid ${W.clay}`, borderRight: `4px solid ${W.clay}`, borderRadius: '0 8px 8px 0'}} />
            <div style={{position: 'absolute', left: 34, top: tg.h / 2 - 26}}>
              <Hd size={36} color={W.clay} style={{whiteSpace: 'nowrap'}}>
                <HL p={prog(f, 16, 16)}>{tg.t}</HL>
              </Hd>
            </div>
          </div>
        );
      })}
      <Note x={1300} y={620} p={prog(b[2], 18, 30)} size={26} rot={-2} w={500}>
        ← 不部署生产是红线
      </Note>
      <Src>原文示例提示（目录和测试命令换成自己的就行）</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ when to stop
const STOP = [
  ['## 继续还是停下', 0],
  ['- 下一步不需要我输入时直接继续，进度说明和下一步', 1],
  ['  动作写在同一条消息里。', 1],
  ['- 只在被阻塞，或执行删除数据、force push、修改仓', 1],
  ['  库外文件之前停下来问。', 1],
  ['- 收尾汇报按「需要我处理 / 改了什么 / 发现了什么」', 2],
  ['  三段写。', 2],
] as [string, number][];

export const Stop: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const startOf = (i: number) => {
    const bt = STOP[i][1];
    const k = STOP.slice(0, i).filter((l) => l[1] === bt).length;
    return b[bt] - 20 - k * 12;
  };
  const squash = prog(b[3], 40, 30);
  return (
    <Board>
      <Head num="1.1" title="啥时候停，写进 CLAUDE.md" />
      <Box x={100} y={160} w={1060} h={460} p={prog(b[0], 22)} seed={130} pad={0}>
        <div style={{height: 54, borderBottom: `3px solid ${W.ink}`, display: 'flex', alignItems: 'center', padding: '0 24px'}}>
          <Mo size={24} w={700}>
            CLAUDE.md
          </Mo>
        </div>
        <div style={{padding: '18px 28px'}}>
          {STOP.map(([t], i) => (
            <TypeLine key={i} text={t} f={startOf(i)} cps={70} size={25} color={i === 0 ? W.clay : W.ink} />
          ))}
        </div>
      </Box>
      <Note x={1190} y={250} p={prog(b[1], 20, 30)} size={30} rot={-3} w={600}>
        高危命令的权限拦截始终开着
      </Note>
      {['需要我处理', '改了什么', '发现了什么'].map((t, i) => (
        <div key={t} style={{position: 'absolute', left: 1200 + (i % 2) * 0, top: 360 + i * 80, ...pop(b[2], 30 + i * 10)}}>
          <Pill bg={i === 0 ? W.peach : W.card} size={30}>
            {i + 1} · {t}
          </Pill>
        </div>
      ))}
      {/* TASKS.md survives compaction */}
      <div style={{position: 'absolute', left: 100, top: 660, opacity: prog(b[3], 12)}}>
        <Zh size={22} color={W.dim}>
          上下文
        </Zh>
        <div style={{width: 800 - 560 * squash, height: 70, marginTop: 6, background: `repeating-linear-gradient(90deg, ${W.peach} 0 30px, ${W.yellow} 30px 60px)`, border: `3px solid ${W.ink}`, borderRadius: 10}} />
        <Note x={0} y={110} p={prog(b[3], 16, 50)} size={28} rot={0}>
          触发上下文压缩
        </Note>
      </div>
      <div style={{position: 'absolute', left: 1000, top: 660, ...pop(b[3], 20)}}>
        <Box x={0} y={0} w={420} h={170} p={prog(b[3], 18, 20)} seed={131} bg={W.yellow} pad="20px 26px">
          <Mo size={30} w={700}>
            TASKS.md
          </Mo>
          <Zh size={24} style={{display: 'block', marginTop: 10}}>
            完整保存在磁盘上，随时看进度
          </Zh>
        </Box>
      </div>
      <Src>来源：Opus 5.5 playbook 推荐写进 CLAUDE.md 的规则（原文代码块）</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ spec first
export const Spec: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const ideas = ['方案 A：改 ORM', '方案 B：加缓存层', '方案 C：拆服务'];
  return (
    <Board>
      <Head num="1.2" title="需求没想清楚，就先写 spec" />
      <Box x={100} y={170} w={500} h={380} p={prog(b[0], 20)} seed={140} pad="20px 26px">
        <Zh size={22} color={W.dim}>
          会话 A · 让 Claude 提问
        </Zh>
        {ideas.map((t, i) => (
          <div key={t} style={{marginTop: 14, opacity: prog(b[0], 10, 14 + i * 8)}}>
            <Strike p={prog(b[1], 12, 20 + i * 8)} w={t.length * 26}>
              <Hd size={30} w={500}>
                {t}
              </Hd>
            </Strike>
          </div>
        ))}
        <div style={{marginTop: 18, opacity: prog(b[0], 10, 50)}}>
          <Zh size={22} color={W.dim}>
            接口契约 · 边界条件 · 验收准则
          </Zh>
        </div>
      </Box>
      <Illus x={490} y={184} />
      <Arrow pts={[[610, 360], [700, 340], [770, 360]]} p={prog(b[0], 16, 60)} />
      <div style={{position: 'absolute', left: 780, top: 250, ...pop(b[0], 70)}}>
        <Box x={0} y={0} w={240} h={220} p={prog(b[0], 18, 70)} seed={141} bg={W.yellow} pad="26px 30px">
          <Mo size={44} w={700}>
            spec
          </Mo>
          <Zh size={22} color={W.dim} style={{display: 'block', marginTop: 10}}>
            理清楚的需求
          </Zh>
        </Box>
      </div>
      <Arrow pts={[[1030, 360], [1110, 340], [1180, 360]]} p={prog(b[1], 16)} />
      <Box x={1190} y={170} w={630} h={380} p={prog(b[1], 20, 6)} seed={142} pad="20px 28px">
        <Zh size={22} color={W.dim}>
          会话 B · 干净的新会话去实现
        </Zh>
        {['spec', '相关代码', '必要的背景'].map((t, i) => (
          <Item key={t} f={b[1] - 16 - i * 8} size={30}>
            带上 {t}
          </Item>
        ))}
        <div style={{marginTop: 22, position: 'relative', paddingLeft: 56, opacity: prog(b[1], 10, 50)}}>
          <Cross x={0} y={2} p={prog(b[1], 10, 50)} s={34} />
          <Zh size={26} color={W.red}>
            废弃方案不带进编码阶段
          </Zh>
        </div>
      </Box>
      <div style={{position: 'absolute', left: 100, top: 600, ...rise(b[2], 0)}}>
        <Hd size={32}>spec 不一定是 Markdown：</Hd>
      </div>
      {['一套严密的自动化测试', '一段待移植的参考代码', '一个现成的 HTML mockup'].map((t, i) => (
        <div key={t} style={{position: 'absolute', left: 100 + i * 580, top: 670, ...pop(b[2], 14 + i * 12)}}>
          <Box x={0} y={0} w={540} h={110} p={prog(b[2], 18, 14 + i * 12)} seed={143 + i} pad="28px 28px">
            <Hd size={34}>{t}</Hd>
          </Box>
        </div>
      ))}
      <Note x={1060} y={600} p={prog(b[3], 22)} size={30} rot={-2}>
        确定性 ＞ 大段文字描述 / 界面截图
      </Note>
      <Src>来源：Addy 原文；Thariq Shihipar 上下文工程文章（2026-07-24）</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ contract (figure 1)
const BLOCKS = [
  {k: '完整任务', v: ['把 src/api 下的旧 SDK 调用迁移到新 SDK'], note: ''},
  {k: '完成条件', v: ['响应字段、错误码、超时行为保持兼容', 'uv run pytest -q tests/api 通过，新增 3 类用例'], note: '业务约束 + 验收入口'},
  {k: '范围和停止点', v: ['不改无关模块，不删或跳过测试，不部署生产', '缺凭据、需求冲突、要改公共接口时先停下来问'], note: '权限红线'},
  {k: '汇报方式', v: ['diff 摘要、实际运行的命令和结果、未验证的部分'], note: ''},
];
const AGENT = ['先搜哪些文件', '函数怎么拆、按什么顺序改', '中间跑哪些临时命令', '什么时候拆给 subagent'];
const DROP = ['请认真思考', '务必全面检查', '完成前反复确认'];

export const Contract: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const ys = [190, 318, 486, 654];
  const hs = [104, 144, 144, 104];
  return (
    <Board>
      <Head num="1" title="一条任务提示里值得写的四块" />
      {BLOCKS.map((bl, i) => (
        <Box key={bl.k} x={100} y={ys[i]} w={1000} h={hs[i]} p={prog(b[0], 22, i * 8)} seed={20 + i} pad="16px 26px">
          <div style={{display: 'flex', gap: 26}}>
            <div style={{width: 200, flexShrink: 0}}>
              <Hd size={32} color={W.clay}>
                <HL p={i === 1 || i === 2 ? prog(b[1], 16, i === 1 ? 0 : 40) : 0}>{bl.k}</HL>
              </Hd>
            </div>
            <div>
              {bl.v.map((t) => (
                <div key={t}>
                  <Zh size={25}>{t}</Zh>
                </div>
              ))}
            </div>
          </div>
        </Box>
      ))}
      <Note x={790} y={410} p={prog(b[1], 24, 6)} rot={-3} size={28}>
        业务约束 · 验收入口
      </Note>
      <Note x={900} y={580} p={prog(b[1], 24, 44)} rot={-3} size={28}>
        权限红线
      </Note>

      {/* right: left to the agent */}
      <Arrow pts={[[1110, 420], [1170, 400], [1215, 420]]} p={prog(b[2], 18)} />
      <Box x={1230} y={190} w={590} h={360} p={prog(b[2], 24, 6)} seed={31} dash bg={W.paper} shadow={false} pad="22px 30px">
        <Hd size={34} color={W.blue}>
          交给 agent 自己定
        </Hd>
        {AGENT.map((t, i) => (
          <div key={t} style={{marginTop: 12, opacity: prog(b[2], 12, 16 + i * 8)}}>
            <Zh size={27}>· {t}</Zh>
          </div>
        ))}
      </Box>

      {/* bottom-right: sentences you can delete */}
      <Box x={1230} y={600} w={590} h={200} p={prog(b[3], 20, 10)} seed={33} bg={W.paper} shadow={false} pad="18px 30px">
        <Hd size={30} color={W.red}>
          可以删掉的句子
        </Hd>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px 26px', marginTop: 10}}>
          {DROP.map((t, i) => (
            <Strike key={t} p={prog(b[3], 14, 40 + i * 10)} w={t.length * 30}>
              <Hd size={30} w={500}>
                {t}
              </Hd>
            </Strike>
          ))}
        </div>
      </Box>
      <div style={{position: 'absolute', left: 1500, top: 120, opacity: prog(b[3], 12), transform: `rotate(-8deg) scale(${1.4 - 0.4 * prog(b[3], 12)})`}}>
        <div style={{border: `5px solid ${W.red}`, borderRadius: 12, padding: '2px 18px'}}>
          <Hd size={40} color={W.red}>
            任务契约
          </Hd>
        </div>
      </div>
      <Src>据原文图 1 重绘 · 示例提示里的目录和测试命令是假设的仓库</Src>
    </Board>
  );
};
