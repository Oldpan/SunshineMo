// Section 2: the /goal loop (redraw of figure 2) and auto mode's classifier.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Arrow, Board, Box, Cross, during, Hd, Head, HL, Illus, Mo, Note, prog, Src, Tick, TypeLine, usePopIn, W, Zh} from './common';

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
