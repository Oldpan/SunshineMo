// Terminal scenes: h1 (give it a way to check its work), h6 (steer early, reset fast).
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Abs, COL, Drift, Illus, Label, Mono, Pill, prog, rise, Sans, TermBg, TermWin, TLine} from './common';

const P = <span style={{color: COL.clay}}>{'> '}</span>;
const D = <span style={{color: COL.clay}}>{'● '}</span>;

const Side: React.FC<{n: string; title: React.ReactNode; f: number; children: React.ReactNode}> = ({n, title, f, children}) => (
  <Abs x={80} y={100} w={580}>
    <div style={rise(f, 12)}>
      <Label>{`HABIT ${n} / 10`}</Label>
    </div>
    <div style={{...rise(f, 20), margin: '14px 0 30px'}}>
      <Sans size={58} w={900} color="#fff" style={{lineHeight: 1.25}}>
        {title}
      </Sans>
    </div>
    {children}
  </Abs>
);

export const H1: React.FC = () => {
  const b = useBeats();
  const stop = b[2] >= 0 && b[5] < 0;
  const methods: [string, string][] = [
    ['直接要求', '跑完测试，不过就接着改'],
    ['/goal', '另一个模型每轮检查目标'],
    ['Stop hook', '类型检查不过，这轮结束不了'],
    ['/code-review', '新的子 agent 审 diff'],
  ];
  return (
    <>
      <TermBg />
      <Drift zoom={0.015} dy={-6}>
        <Side n="01" title={<>给它一个<br />检查自己的办法</>} f={b[0]}>
          <Pill f={b[2]} tone="bad">看着做完就收工？你成了人肉测试</Pill>
          <Pill f={b[3]}>好经理靠护栏：CI · 评审 · 监控</Pill>
          <Pill f={b[4]} tone="good">能判过 / 不过的检查：测试 · 构建 · 截图</Pill>
          <Pill f={b[5]} tone="good">有了检查：自己跑 → 看到失败 → 自己改</Pill>
        </Side>
        <TermWin x={720} y={90} w={1130} h={540} f={b[0] - 6}>
          <TLine f={b[1]} pre={P} text="修好登录超时" color="#fff" />
          <TLine f={b[1] - 20} pre={D} text="Edit src/auth/session.ts" />
          <TLine f={b[1] - 40} pre={D} text="已完成。" />
          {stop && (
            <div style={{...rise(b[2], 10), position: 'absolute', left: 520, top: 168}}>
              <Sans size={28} w={800} color={COL.termErr}>
                ← 看着做完了，就停下
              </Sans>
            </div>
          )}
          <div style={{opacity: prog(b[5], 12)}}>
            <TLine f={b[5]} pre={P} text="跑完 auth 测试，不过就接着改" color="#fff" hi />
            <TLine f={b[5] - 30} pre={D} text="Bash npm test -- auth" />
            <TLine f={b[5] - 50} text="  ✗ 2 failed · 38 passed" color={COL.termErr} />
            <TLine f={b[5] - 70} pre={D} text="Edit src/auth/refresh.ts" />
            <TLine f={b[5] - 78} text="  ✓ 40 passed" color={COL.termOk} />
          </div>
          <Illus x={1010} y={490} color={COL.termDim} f={b[1]} />
        </TermWin>
        <Abs x={720} y={660} w={1130} style={{display: 'flex', gap: 16}}>
          {methods.map(([k, v], i) => {
            const f = b[6 + i];
            const on = f >= 0 && (i === 3 || b[7 + i] < 0);
            return (
              <div
                key={k}
                style={{
                  ...rise(f, 16),
                  flex: 1,
                  height: 200,
                  borderRadius: 14,
                  background: on ? '#3A2A22' : '#262624',
                  border: `2px solid ${on ? COL.clay : '#3C3B38'}`,
                  padding: '20px 20px',
                }}
              >
                <Mono size={28} color={COL.clay} w={700}>
                  {k}
                </Mono>
                <div style={{marginTop: 12}}>
                  <Sans size={25} w={500} color="#DDD">
                    {v}
                  </Sans>
                </div>
              </div>
            );
          })}
        </Abs>
      </Drift>
    </>
  );
};

export const H6: React.FC = () => {
  const b = useBeats();
  return (
    <>
      <TermBg />
      <Drift zoom={0.015} dy={-6}>
        <Side n="06" title={<>早纠偏<br />快重来</>} f={b[0]}>
          <Pill f={b[1]}>盯住第一分钟，跑偏就按 Esc</Pill>
          <Pill f={b[2]}>问题多在上游：指令 · 上下文 · 范围</Pill>
          <Pill f={b[3]} tone="bad">纠正两次还不对 → 清会话，重写提示词</Pill>
          <Pill f={b[5]} tone="good">/rewind：代码和对话一起退回去</Pill>
          <Pill f={b[6]} tone="good">复盘后，能通用的写进 CLAUDE.md</Pill>
        </Side>
        <TermWin x={720} y={90} w={1130} h={790} f={b[0] - 6}>
          <TLine f={b[1]} pre={D} text="Edit src/session/token.ts" />
          <TLine f={b[1] - 18} pre={D} text="Edit src/api/retry.ts      ← 跑偏了" color={COL.termErr} />
          <TLine f={b[1] - 45} text="  [Esc] 已中断" color={COL.termHi} />
          <TLine f={b[2] + 10 - 10} pre={P} text="只改 session，不要动 api" color="#fff" />
          <TLine f={b[2] - 30} pre={D} text="Edit src/api/client.ts     ← 又偏了" color={COL.termErr} />
          <TLine f={b[3]} pre={P} text="/clear" color="#fff" hi />
          <TLine f={b[3] - 25} text="  带着教训，重写提示词" color={COL.termDim} />
          <TLine f={b[4]} text="  第三次纠正 ≈ 再读一遍失败记录" color={COL.termDim} />
          <TLine f={b[5]} pre={P} text="/rewind" color="#fff" hi />
          <TLine f={b[5] - 25} text="  ↺ 代码和对话回到之前的检查点" color={COL.termOk} />
          <TLine f={b[5] - 45} pre={D} text="换个更大胆的方案试试" />
          <Illus x={1010} y={740} color={COL.termDim} f={b[1]} />
        </TermWin>
      </Drift>
    </>
  );
};
