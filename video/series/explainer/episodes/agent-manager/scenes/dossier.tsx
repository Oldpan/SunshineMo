// Halftone-dossier scenes: handoff (bad managers = bug reports), h7 (delegate the task, not the judgment).
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Abs, COL, DossierBg, Drift, Illus, Label, Mono, prog, rise, Sans, Serif, Sheet, slideX, Stamp, useSerif} from './common';

const TW = '"JetBrains Mono", monospace';

export const Handoff: React.FC = () => {
  useSerif();
  const b = useBeats();
  const rows: [string, string][] = [
    ['「需求说不清」', '一句话任务'],
    ['「背景不给」', '缺上下文'],
    ['「说变就变」', '预期在漂'],
  ];
  return (
    <>
      <DossierBg />
      <Drift zoom={0.02}>
        <Sheet x={190} y={140} w={900} h={640} rot={-1.2} f={b[0]}>
          <Label color="#7A6A50">档案 · 你被领导过的这些年</Label>
          <div style={{marginTop: 18, marginBottom: 26, ...rise(b[1] - 6, 14)}}>
            <Serif size={50} w={900} color="#222">
              投诉：坏领导
            </Serif>
          </div>
          {rows.map(([a], i) => (
            <div key={a} style={{...slideX(b[2] - i * 12, -20), marginBottom: 18}}>
              <Serif size={46} w={700} color="#2A2A2A">
                {a}
              </Serif>
            </div>
          ))}
          <div style={{...rise(b[3], 12), marginTop: 18}}>
            <span style={{fontFamily: TW, fontSize: 28, color: '#4A3A20'}}>附注：同样的毛病，也出现在你写给 agent 的指令里</span>
          </div>
        </Sheet>
        <Sheet x={1170} y={220} w={580} h={470} rot={2} f={b[1]}>
          <span style={{fontFamily: TW, fontSize: 26, color: '#444'}}>BUG REPORT</span>
          <div style={{height: 2, background: '#999', margin: '14px 0 22px'}} />
          {rows.map(([a, bug], i) => (
            <div key={a} style={{...rise(b[2] - i * 12 - 6, 12), marginBottom: 22, display: 'flex', alignItems: 'baseline', gap: 12}}>
              <span style={{fontFamily: TW, fontSize: 24, color: COL.bad}}>#{i + 1}</span>
              <Sans size={36} w={700} color="#222">
                {bug}
              </Sans>
            </div>
          ))}
        </Sheet>
        <Stamp x={1230} y={700} f={b[1] + 0 - 20} size={46}>
          对应同一份报告
        </Stamp>
        <Abs x={190} y={820} w={1560} style={{...rise(b[4], 16), display: 'flex', alignItems: 'center', gap: 14}}>
          <Sans size={30} w={800} color="#3A2E18">
            接下来十个习惯 · 按影响从大到小
          </Sans>
          {Array.from({length: 10}).map((_, i) => (
            <span key={i} style={{...rise(b[4] - 6 - i * 3, 10), width: 46, height: 46, borderRadius: 6, background: i === 0 ? '#B3261E' : '#F7F1E3', color: i === 0 ? '#fff' : '#3A2E18', fontFamily: TW, fontSize: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '1px 3px 6px rgba(0,0,0,0.2)'}}>
              {i + 1}
            </span>
          ))}
        </Abs>
      </Drift>
    </>
  );
};

export const H7: React.FC = () => {
  useSerif();
  const b = useBeats();
  const swap = prog(b[6], 16); // right column: "you decide" sheet gives way to the split
  return (
    <>
      <DossierBg />
      <Drift zoom={0.018}>
        <Abs x={150} y={96} style={rise(b[0], 14)}>
          <Label color="#7A2A1E">HABIT 07 / 10</Label>
          <div>
            <Serif size={52} w={900} color="#2A2A2A">
              委派任务，不委派判断
            </Serif>
          </div>
        </Abs>
        {/* right: you decide → split */}
        <div style={{opacity: 1 - swap}}>
          <Sheet x={1150} y={230} w={600} h={330} rot={1.8} f={b[1]}>
            <Label color="#7A6A50">你来定</Label>
            {['产品取舍', '安全边界', '什么能上线'].map((t, i) => (
              <div key={t} style={{...rise(b[1] - 8 - i * 7, 12), marginTop: 16}}>
                <Serif size={42} w={700} color="#222">
                  {t}
                </Serif>
              </div>
            ))}
          </Sheet>
        </div>
        <div style={{opacity: swap}}>
          <Sheet x={1150} y={230} w={600} h={620} rot={1.2} f={b[6]}>
            <Label color={COL.green}>交给 agent</Label>
            <div style={{marginTop: 12, marginBottom: 34}}>
              <Sans size={34} w={700} color="#222">
                风格 · lint
                <br />
                常见 bug · 单元测试
              </Sans>
            </div>
            <div style={rise(b[7], 14)}>
              <Label color="#B3261E">留给人</Label>
              <div style={{marginTop: 12}}>
                <Sans size={34} w={700} color="#222">
                  安全边界 · 合规
                  <br />
                  产品决定
                </Sans>
              </div>
            </div>
          </Sheet>
        </div>
        {/* left: the author's near miss */}
        <Sheet x={170} y={230} w={900} h={300} rot={-1} f={b[2]}>
          <Label color="#7A6A50">作者自己的经历</Label>
          <div style={{marginTop: 14}}>
            <Sans size={32} w={600} color="#222">
              让 agent 研究和竞品的差距 → 写 PR 补上
            </Sans>
          </div>
          <div style={{...rise(b[3], 12), marginTop: 16}}>
            <Sans size={30} w={500} color="#5A4A30">
              代码扫了一眼，差点推上去；这些改动加了复杂度，好处很少
            </Sans>
          </div>
        </Sheet>
        <Sheet x={170} y={570} w={900} h={250} rot={0.6} f={b[4]} style={{padding: '30px 40px'}}>
          <span style={{fontFamily: TW, fontSize: 26, color: '#444'}}>对齐竞品的改动</span>
          <div style={{marginTop: 12, display: 'flex', gap: 28, alignItems: 'baseline'}}>
            <span style={{fontFamily: TW, fontSize: 46, color: COL.green, fontWeight: 700}}>+600 行</span>
            <span style={{fontFamily: TW, fontSize: 28, color: COL.green}}>✓ 测试全绿</span>
            <span style={{fontFamily: TW, fontSize: 28, color: '#555'}}>命名看着合理</span>
          </div>
          <div style={{marginTop: 18, display: 'inline-block', background: '#2F7D4F', color: '#fff', padding: '8px 26px', borderRadius: 8, fontFamily: '"Noto Sans SC"', fontWeight: 700, fontSize: 28, opacity: 0.4 + 0.6 * prog(b[4], 10, 30)}}>
            批准
          </div>
          <Illus x={760} y={20} f={b[4]} />
        </Sheet>
        <Stamp x={540} y={716} f={b[5]} size={44}>
          代码盖章 ≠ 代码评审
        </Stamp>
        <Abs x={170} y={856} w={1580} style={rise(b[8], 14)}>
          <Mono size={28} color="#3A2E18" w={700}>
            改动保持小：一次审多少 = 一次能看懂多少
          </Mono>
        </Abs>
      </Drift>
    </>
  );
};
