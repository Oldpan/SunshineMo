// Editorial outro (cream + terracotta, the article cover's look): staff engineers, six things to try, sign-off.
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Abs, COL, Drift, EditBg, Label, OrgChart, prog, rise, Sans, Serif, slideX, useSerif} from './common';

export const Outro: React.FC = () => {
  useSerif();
  const b = useBeats();
  const six = [
    '每个任务配一个能跑的检查，要证据',
    '告诉它看不到的，省掉它看得到的',
    '先聊计划，再写代码',
    '纠正两次写进 CLAUDE.md，重复的流程做成 skill',
    '纠正两次还不行：重开会话，重写提示词',
    '审 diff 时，当它出了事会把你叫醒',
  ];
  const ph1 = 1 - prog(b[1], 14);
  const ph3 = prog(b[8], 20);
  return (
    <>
      <EditBg />
      <Drift zoom={0.02}>
        {/* phase 1: staff engineers */}
        <div style={{opacity: ph1}}>
          <Abs x={130} y={150} w={1100} style={rise(b[0], 18)}>
            <Label>YOU DON'T NEED THE TITLE</Label>
            <div style={{marginTop: 16}}>
              <Serif size={78} w={900} color={COL.ink}>
                好的 staff 工程师
                <br />
                一直是这么做的
              </Serif>
            </div>
          </Abs>
          {['写设计文档', '讲清背景', '认真评审'].map((t, i) => (
            <Abs key={t} x={130 + i * 360} y={560} style={rise(b[0] - 40 - i * 14, 18)}>
              <div style={{borderTop: `5px solid ${COL.clay}`, paddingTop: 14, width: 320}}>
                <Sans size={40} w={800}>
                  {t}
                </Sans>
              </div>
            </Abs>
          ))}
        </div>
        {/* phase 2: six things */}
        <div style={{opacity: prog(b[1], 14, 6) * (1 - ph3)}}>
          <Abs x={130} y={96}>
            <Label>明天就能试</Label>
            <div>
              <Serif size={64} w={900}>
                六件事
              </Serif>
            </div>
          </Abs>
          <Abs x={130} y={270} w={1150}>
            {six.map((t, i) => {
              const f = b[2 + i];
              const done = prog(f, 10, 16);
              return (
                <div key={t} style={{...slideX(f, 24), display: 'flex', alignItems: 'center', gap: 22, marginBottom: 26}}>
                  <div style={{width: 46, height: 46, borderRadius: 10, border: `3px solid ${COL.ink}`, background: done > 0.5 ? COL.clay : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                    <span style={{color: '#fff', fontSize: 30, fontWeight: 900, opacity: done}}>✓</span>
                  </div>
                  <Sans size={36} w={600}>
                    {t}
                  </Sans>
                </div>
              );
            })}
          </Abs>
        </div>
        <OrgChart x={1330} y={330} n={2} f={b[0] - 50} w={180} />
        {/* phase 3: closing line + sign-off */}
        <Abs x={130} y={300} w={1150} style={{opacity: ph3, transform: `translateY(${(1 - ph3) * 20}px)`}}>
          <Serif size={66} w={900} color={COL.ink}>
            你不一定想当经理，
          </Serif>
          <br />
          <Serif size={66} w={900} color={COL.clay}>
            但用好 agent 的人，
            <br />
            都顺手学会了管理。
          </Serif>
          <div style={{width: 140, height: 6, background: COL.clay, marginTop: 30}} />
        </Abs>
        <Abs x={130} y={760} style={rise(b[9], 18)}>
          <Sans size={44} w={800} color={COL.ink}>
            我是老潘，下期再见
          </Sans>
        </Abs>
      </Drift>
    </>
  );
};
