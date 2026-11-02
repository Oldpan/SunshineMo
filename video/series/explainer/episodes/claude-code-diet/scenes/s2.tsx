// Section 2: the /goal loop (redraw of figure 2) and auto mode's classifier.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Arrow, Board, Box, Circled, Cross, during, Hd, Head, HL, Illus, Item, Mo, Note, Pill, prog, rise, Src, Stamp, Strike, Term, Tick, TypeLine, usePopIn, W, Zh} from './common';

// ------------------------------------------------------------------ /goal
const VERDICTS = [
  {mark: '✕', k: '未达成', v: '理由作为下一轮的指引，主 agent 继续干', c: W.clay},
  {mark: '✓', k: '已达成', v: '清除 goal，记一条 achieved', c: W.green},
  {mark: '⊘', k: '无法达成', v: '清除 goal，记一条 failed 和理由', c: W.dim},
];

export const Goal: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const active = b[5] > 0 ? 2 : b[4] > 0 ? 1 : b[3] > 0 ? 0 : -1;
  const round = b[3] > 0 ? 3 + Math.min(1, Math.floor(prog(b[3], 40, 30))) : 3;
  const pass = active === 1;
  return (
    <Board>
      <Head num="2.1" title="/goal 的一轮：执行和判定分开" />
      {/* main agent terminal */}
      <Box x={100} y={170} w={900} h={380} p={prog(frame, 24)} seed={40} bg={W.term} pad="24px 30px">
        <Zh size={20} color={W.faint}>
          主 agent · 第 {round} 轮
        </Zh>
        <div style={{marginTop: 10}}>
          <TypeLine f={b[0] - 4} cps={46} color={W.clay} text="> /goal tests/api 的回归测试全部通过；" caret={b[1] < 0} />
          <TypeLine f={b[0] - 4 - 30} cps={46} color={W.clay} text="  贴出命令、退出码和结果摘要。" />
          <TypeLine f={b[1]} cps={60} text="● Bash(uv run pytest -q tests/api)" />
          <TypeLine f={b[1] + 16} cps={60} color={pass ? W.green : '#F0A08E'} text={pass ? '  ⎿ 43 passed in 8.9s' : '  ⎿ 41 passed, 2 failed in 8.3s'} />
          <TypeLine f={b[1] + 26} cps={60} color={pass ? W.green : '#F0A08E'} text={pass ? '  ⎿ exit code 0' : '  ⎿ exit code 1'} />
          <TypeLine f={b[1] + 40} cps={50} color={W.faint} text="● 命令、退出码、结果摘要已写进对话" />
        </div>
      </Box>
      <Note x={110} y={575} p={prog(b[1], 22, 50)} rot={-2} size={30}>
        证据写进对话 ↗
      </Note>

      {/* evaluator */}
      <Arrow pts={[[1005, 300], [1080, 260], [1150, 280]]} p={prog(b[1], 20, 30)} />
      <Box x={1160} y={170} w={660} h={210} p={prog(b[1], 24, 40)} seed={41} pad="22px 30px">
        <Hd size={38}>evaluator</Hd>
        <Zh size={24} color={W.dim} style={{display: 'block', marginTop: 4}}>
          small fast model · 读 goal 条件 + 对话
        </Zh>
        <Zh size={24} color={W.red} style={{display: 'block', marginTop: 6}}>
          不读文件、不跑命令 · 输出一个判定 + 一句理由
        </Zh>
      </Box>

      {/* verdicts */}
      {VERDICTS.map((v, i) => {
        const on = active === i;
        const lit = prog(b[3 + i], 12);
        return (
          <div key={v.k} style={{position: 'absolute', left: 1180, top: 420 + i * 120, ...pop(b[2], i * 7)}}>
            <Box x={0} y={0} w={630} h={100} p={prog(b[2], 18, i * 7)} seed={42 + i} bg={on ? v.c : W.card} pad="14px 24px" style={{transform: `scale(${1 + 0.04 * (on ? lit : 0)})`}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                <Hd size={34} color={on ? '#fff' : v.c}>
                  {v.mark} {v.k}
                </Hd>
              </div>
              <Zh size={22} color={on ? '#fff' : W.dim}>
                {v.v}
              </Zh>
            </Box>
          </div>
        );
      })}
      {/* loop back */}
      <Arrow pts={[[1170, 470], [1060, 640], [800, 680], [560, 612]]} p={prog(b[3], 30, 10) * (1 - prog(b[4], 10))} color={W.clay} dash seed={8} />
      <Note x={760} y={690} p={prog(b[3], 20, 30) * (1 - prog(b[4], 10))} rot={-3} size={30} color={W.clay}>
        未达成 → 再来一轮
      </Note>
      <Src>据原文图 2 重绘 · 依据 Claude Code /goal 文档（2026-10）</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ auto mode
const CALLS = [
  {t: 'Read(src/api/client.py)', ok: true},
  {t: 'Edit(src/api/client.py)', ok: true},
  {t: 'Bash(uv run pytest -q)', ok: true},
  {t: 'Bash(rm -rf data/)', ok: false},
  {t: 'Bash(git push --force)', ok: false},
  {t: 'Bash(curl … 上传 .env)', ok: false},
];

export const Auto: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  // stream: each call slides from left, passes the gate at x≈760
  const start = b[2];
  const step = 26;
  const blocked = CALLS.map((c, i) => (!c.ok && start - i * step - 30 > 0 ? 1 : 0)).reduce((a: number, x: number) => a + x, 0);
  const consec = Math.min(3, blocked);
  const fall = prog(b[3], 20, 20);
  return (
    <Board>
      <Head num="2.2" title="auto mode 管的是权限" />
      {/* lanes: goal between rounds vs auto inside a round */}
      <div style={{position: 'absolute', left: 100, top: 160, width: 1720, height: 150, opacity: prog(b[0], 14)}}>
        {[0, 1, 2].map((r) => (
          <Box key={r} x={r * 560} y={20} w={400} h={110} p={prog(b[0], 18, r * 6)} seed={50 + r} bg={W.card} pad="12px 20px">
            <Zh size={22} color={W.dim}>
              第 {r + 1} 轮
            </Zh>
            <div style={{display: 'flex', gap: 14, marginTop: 8}}>
              {[0, 1, 2, 3].map((k) => (
                <div key={k} style={{width: 60, height: 30, borderRadius: 8, background: W.green, opacity: 0.25 + 0.75 * prog(b[0], 10, 20 + r * 8 + k * 4)}} />
              ))}
            </div>
          </Box>
        ))}
        {[0, 1].map((r) => (
          <Arrow key={r} pts={[[r * 560 + 410, 75], [r * 560 + 550, 75]]} p={prog(b[0], 14, 30 + r * 8)} color={W.blue} seed={60 + r} />
        ))}
        <Note x={420} y={-10} p={prog(b[0], 18, 40)} size={26} color={W.blue} rot={0}>
          /goal：轮与轮之间
        </Note>
        <Note x={10} y={146} p={prog(b[0], 18, 56)} size={26} color={W.green} rot={0}>
          auto mode：单轮里每次调工具的确认
        </Note>
      </div>
      <Note x={1130} y={330} p={prog(b[1], 20, 4)} size={28} rot={-2}>
        挂上 goal ≠ 放宽权限
      </Note>

      {/* classifier gate */}
      <div style={{position: 'absolute', left: 0, top: 0, opacity: prog(b[2], 12)}}>
        <Box x={720} y={420} w={220} h={330} p={prog(b[2], 20)} seed={70} bg={W.yellow} pad="20px 18px">
          <Hd size={30}>安全分类器</Hd>
          <Zh size={21} color={W.dim} style={{display: 'block', marginTop: 8}}>
            调工具前过一遍
          </Zh>
          <Zh size={21} color={W.green} style={{display: 'block', marginTop: 16}}>
            低风险 → 放行
          </Zh>
          <Zh size={21} color={W.red} style={{display: 'block', marginTop: 6}}>
            疑似高危 → 拦下
          </Zh>
        </Box>
        {CALLS.map((c, i) => {
          const f = start - i * step;
          const x = interpolate(f, [0, 30, 60], [100, 380, c.ok ? 1010 : 380], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const y = 400 + (i % 3) * 120 + (c.ok ? 0 : 0);
          const vis = f > 0 ? 1 : 0;
          const deny = !c.ok && f > 30;
          const lane = c.ok ? i : i - 3;
          const yy = c.ok ? 420 + lane * 110 : 420 + lane * 110;
          return (
            <div key={c.t} style={{position: 'absolute', left: c.ok ? x : x - 40, top: yy, opacity: vis * (c.ok ? 1 - during(f, 70, 400, 1) * 0 : 1)}}>
              <div style={{background: deny ? '#FBE3DC' : W.term, border: `3px solid ${deny ? W.red : W.ink}`, borderRadius: 10, padding: '8px 14px', display: 'inline-block'}}>
                <Mo size={21} color={deny ? W.red : W.termInk}>
                  {c.t}
                </Mo>
              </div>
              {c.ok && f > 40 && <Tick x={-50} y={4} p={prog(f, 10, 40)} s={36} />}
              {deny && <Cross x={-48} y={6} p={prog(f, 10, 30)} s={32} />}
            </div>
          );
        })}
        <Illus x={110} y={360} />
      </div>

      {/* counters */}
      <div style={{position: 'absolute', left: 1480, top: 400, ...pop(b[3], 0)}}>
        <Box x={0} y={0} w={340} h={220} p={prog(b[3], 18)} seed={75} pad="16px 24px">
          <Zh size={22} color={W.dim}>
            同一个会话里
          </Zh>
          <Hd size={34} style={{display: 'block', marginTop: 4}}>
            连续拦 <span style={{color: W.red}}>{b[3] > 0 ? Math.max(consec, Math.min(3, Math.floor(prog(b[3], 30) * 3))) : consec}</span> / 3 次
          </Hd>
          <Hd size={34} style={{display: 'block'}}>
            或累计 <span style={{color: W.red}}>20</span> 次
          </Hd>
          <Zh size={24} color={W.red} style={{display: 'block', marginTop: 6, opacity: fall}}>
            → 退回手动确认
          </Zh>
        </Box>
      </div>

      {/* rules */}
      <div style={{position: 'absolute', left: 1440, top: 650, width: 460, ...pop(b[4], 0)}}>
        <Zh size={23}>
          <HL p={prog(b[4], 14, 6)}>宽泛 allow 规则（如 python:*）被忽略</HL>
        </Zh>
        <Zh size={23} style={{display: 'block', marginTop: 4}}>
          <HL p={prog(b[4], 14, 30)}>敏感数据外发：硬拦截</HL>
        </Zh>
      </div>
      <div style={{position: 'absolute', left: 1080, top: 790, opacity: prog(b[5], 12), transform: `rotate(-4deg) scale(${1.3 - 0.3 * prog(b[5], 12)})`}}>
        <div style={{border: `5px solid ${W.red}`, borderRadius: 12, padding: '2px 18px', background: W.paper}}>
          <Hd size={34} color={W.red}>
            发版：单独卡一道人工审批
          </Hd>
        </div>
      </div>
      <Src>依据 Anthropic《Auto mode default in Claude Code》· 8 月 14 日起 Pro / Max / Team 新会话默认开启</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ an executable acceptance entry
export const Entry: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const FIX = ['硬件环境', '模型规格', '输入输出长度', '并发数'];
  const MEASURE = ['Throughput', 'TTFT', 'TPOT', '错误率'];
  const CHEAT = ['降低计算精度', '截断 Prompt', '偷换测试负载'];
  return (
    <Board>
      <Head num="2" title="给 agent 一个可执行的验收入口" />
      <div style={{position: 'absolute', left: 110, top: 170, ...pop(b[1], 0)}}>
        <span style={{background: W.card, border: `3px solid ${W.ink}`, borderRadius: 30, padding: '10px 30px', display: 'inline-block'}}>
          <Hd size={38}>“把服务做稳定”</Hd>
        </span>
        <Note x={420} y={14} p={prog(b[1], 18, 12)} size={30} rot={-2} w={400}>
          ✕ 没法量化
        </Note>
      </div>
      <Box x={110} y={280} w={1000} h={150} p={prog(b[2], 20)} seed={150} bg={W.yellow} pad="20px 28px">
        <Hd size={32}>修复这组并发用例里的请求幂等问题，保持现有接口行为不变，并跑通指定的回归测试</Hd>
      </Box>
      <div style={{position: 'absolute', left: 1140, top: 300, opacity: prog(b[2], 12, 30)}}>
        <Tick x={0} y={6} p={prog(b[2], 12, 30)} s={46} />
        <Hd size={32} color={W.green} style={{marginLeft: 62}}>
          机器能检查
        </Hd>
        <Zh size={22} color={W.dim} style={{display: 'block', marginTop: 10, marginLeft: 62, width: 600}}>
          UI：比对页面状态和渲染快照 · 数据：行数、Schema、数值容差
        </Zh>
      </div>
      {/* inference benchmark */}
      <Box x={110} y={480} w={820} h={330} p={prog(b[3], 20)} seed={151} pad="20px 28px">
        <Hd size={30} color={W.clay}>
          优化推理服务：先固定
        </Hd>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14}}>
          {FIX.map((t, i) => (
            <div key={t} style={pop(b[3], 10 + i * 6)}>
              <Pill>{t} 🔒</Pill>
            </div>
          ))}
        </div>
        <Hd size={30} color={W.clay} style={{display: 'block', marginTop: 22}}>
          再对比
        </Hd>
        <div style={{display: 'flex', gap: 12, marginTop: 12}}>
          {MEASURE.map((t, i) => (
            <div key={t} style={pop(b[3], 40 + i * 6)}>
              <Pill bg={W.peach}>{t}</Pill>
            </div>
          ))}
        </div>
      </Box>
      <Box x={980} y={480} w={830} h={330} p={prog(b[4], 20)} seed={152} pad="20px 28px">
        <Hd size={30}>只说“吞吐越高越好” →</Hd>
        {CHEAT.map((t, i) => (
          <div key={t} style={{position: 'relative', marginTop: 16, paddingLeft: 56, opacity: prog(b[4], 10, 14 + i * 10)}}>
            <Cross x={0} y={4} p={prog(b[4], 10, 18 + i * 10)} s={32} />
            <Hd size={32} color={W.red}>
              {t}
            </Hd>
          </div>
        ))}
        <Note x={420} y={250} p={prog(b[4], 18, 50)} size={28} rot={-3}>
          刷出一组虚高的数据
        </Note>
      </Box>
    </Board>
  );
};

// ------------------------------------------------------------------ the evaluator only reads the transcript
export const Evaluator: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  return (
    <Board>
      <Head num="2.1" title="evaluator 只看对话里的文字" />
      <Box x={110} y={170} w={540} h={330} p={prog(frame, 22)} seed={160} pad="24px 30px">
        <Hd size={40}>evaluator</Hd>
        {['调工具', '读文件', '跑测试'].map((t, i) => (
          <div key={t} style={{position: 'relative', marginTop: 16, paddingLeft: 56, opacity: prog(b[i === 0 ? 0 : 1], 10, i * 10)}}>
            <Cross x={0} y={4} p={prog(b[i === 0 ? 0 : 1], 10, 6 + i * 10)} s={32} />
            <Hd size={34} color={W.red}>
              不{t}
            </Hd>
          </div>
        ))}
      </Box>
      <Arrow pts={[[660, 330], [730, 310], [790, 330]]} p={prog(b[1], 16, 30)} />
      <Term
        x={800}
        y={170}
        w={1020}
        h={330}
        p={prog(b[1], 20, 30)}
        title="它能看到的：对话（示意）"
        lines={[
          ['> 改了 3 个文件，跑了测试', b[1] + 40, W.faint],
          ['$ npm test', b[1] + 56],
          ['  58 passing', b[1] + 70, '#9FD28E'],
          ['  exit code 0', b[1] + 80, '#9FD28E'],
        ]}
      />
      <Box x={110} y={580} w={800} h={170} p={prog(b[3], 18)} seed={161} bg={W.yellow} pad="22px 28px">
        <Tick x={700} y={30} p={prog(b[3], 12, 20)} s={50} />
        <Hd size={36}>“npm test 退出码为 0”</Hd>
        <Zh size={24} color={W.dim} style={{display: 'block', marginTop: 6}}>
          可测的终态 + 验证方式 + 负向约束（≤ 4000 字符）
        </Zh>
      </Box>
      <Box x={970} y={580} w={600} h={170} p={prog(b[3], 18, 14)} seed={162} pad="22px 28px">
        <Cross x={500} y={34} p={prog(b[3], 12, 34)} s={44} />
        <Hd size={36} color={W.dim}>
          “代码质量过关”
        </Hd>
      </Box>
      <Note x={110} y={515} p={prog(b[2], 20)} size={30} rot={-1}>
        所以条件要写成能验证的产物 ↓
      </Note>
      <div style={{position: 'absolute', left: 110, top: 785, ...pop(b[4], 0)}}>
        <Hd size={32}>
          “最多 20 轮” = <HL p={prog(b[4], 20, 20)}>给模型看的软约束</HL>，不是写死的计数器
        </Hd>
      </div>
      <Src>依据 Claude Code /goal 文档：evaluator 只读对话里已经出现的内容</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ safeguards
export const Safety: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const ROWS = [
    {k: '连续几轮没有工具调用', v: '循环停下，控制权还给你，goal 保留', c: W.blue, beat: 1},
    {k: '凭据失效 · 额度耗尽 · 上下文溢出且压缩不掉 · 模型不可用', v: '直接清掉 goal', c: W.red, beat: 2},
    {k: '后台命令或 subagent 还在跑', v: '本轮跳过评估，等后台活结束再判', c: W.green, beat: 3},
  ];
  return (
    <Board>
      <Head num="2.1" title="几道兜底" />
      {ROWS.map((r, i) => (
        <div key={r.k} style={{position: 'absolute', left: 110, top: 170 + i * 150, ...pop(b[r.beat], 0)}}>
          <Box x={0} y={0} w={1100} h={120} p={prog(b[r.beat], 18)} seed={170 + i} pad="16px 28px">
            <Zh size={24} color={W.dim}>
              {r.k}
            </Zh>
            <Hd size={36} color={r.c} style={{display: 'block', marginTop: 4}}>
              → {r.v}
            </Hd>
          </Box>
        </div>
      ))}
      <Note x={1260} y={190} p={prog(b[1], 20, 30)} size={26} rot={-2} w={560}>
        限流或网络偶发中断：指数退避重试，或暂时挂起
      </Note>
      <Note x={1260} y={490} p={prog(b[3], 20, 30)} size={26} rot={-2} w={560}>
        等满 30 分钟发一次 check-in，之后间隔成倍拉长（最多 4 倍）
      </Note>
      <Term
        x={110}
        y={640}
        w={1100}
        h={200}
        p={prog(b[4], 18)}
        lines={[
          ['> /goal', b[4] + 10, W.clay],
          ['  条件 · 已跑时长 · 评估轮次 · Token 消耗 · 上一轮理由', b[4] + 24, W.faint],
          ['> /goal clear', b[4] + 60, W.clay],
        ]}
      />
      <Note x={1260} y={680} p={prog(b[4], 20, 40)} size={26} rot={-2} w={560}>
        依赖 hooks：项目未信任、disableAllHooks、强制 managed hooks 时用不了
      </Note>
      <Src>依据 Claude Code /goal 文档（2026-10）</Src>
    </Board>
  );
};
