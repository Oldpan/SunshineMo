// Corkboard (h3), telestrator pitch (h5) and data-story (h9) scenes.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, COL, CorkBg, DataBg, Draw, Drift, Illus, Label, lerp, MarkerLabel, Mono, Note, PitchBg, prog, rise, Sans, Serif, slideX, useSerif} from './common';

export const H3: React.FC = () => {
  useSerif();
  const b = useBeats();
  const items: [string, number][] = [
    ['怎么验证（写具体命令）', 3],
    ['代码里容易误导的地方', 3],
    ['仓库里没有的决定', 4],
    ['纠正过两次的事', 4],
  ];
  return (
    <>
      <CorkBg />
      <Drift zoom={0.018}>
        <Abs x={120} y={84} style={{...rise(b[0], 16), background: '#FFFDF5', padding: '16px 32px', boxShadow: '4px 6px 12px rgba(0,0,0,0.3)', transform: `rotate(-1deg) translateY(${(1 - prog(b[0], 16)) * 20}px)`}}>
          <Label color={COL.bad} size={22}>
            HABIT 03 / 10
          </Label>
          <div>
            <Serif size={52} w={900} color="#222">
              让每次纠正都能攒下来
            </Serif>
          </div>
        </Abs>
        <Note x={140} y={300} w={400} f={b[1]} bg="#FFD9CF" rot={-3}>
          纠正第 1 次
        </Note>
        <Note x={170} y={420} w={400} f={b[1] - 10} bg="#FFD9CF" rot={2}>
          同一件事，纠正第 2 次
        </Note>
        <Note x={150} y={600} w={400} f={b[1] - 30} bg="#CFE3FF" rot={-1}>
          <b>或者做成 skill</b>
          <br />
          <span style={{fontSize: 24}}>重复的流程，大家共用</span>
        </Note>
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
          <Draw d="M580 470 C620 470 620 420 650 420" p={prog(b[1], 14, 20)} color="#B52A1C" w={5} />
        </svg>
        <Note x={660} y={270} w={600} f={b[1] - 40} bg="#FFFDF5" rot={0.8} pad="30px 40px" size={30}>
          <span style={{fontFamily: '"JetBrains Mono", monospace', fontSize: 34, fontWeight: 700}}>CLAUDE.md</span>
          <span style={{marginLeft: 14, fontSize: 24, color: COL.bad, fontWeight: 700}}>要短</span>
          <div style={{height: 2, background: '#CCC', margin: '14px 0 10px'}} />
          {items.map(([t, bi], i) => (
            <div key={t} style={{...slideX(b[bi] - (i % 2) * 22, 20), marginTop: 12}}>
              <span style={{color: COL.clay, fontWeight: 900}}>{i + 1}. </span>
              {t}
            </div>
          ))}
          <div style={{...rise(b[4] - 30, 12), marginTop: 20, fontSize: 24, color: '#666'}}>写下来的，人换组、模型换代都还在</div>
        </Note>
        <Note x={1340} y={290} w={440} f={b[5]} bg="#FFF3A8" rot={2}>
          代码评审里直接
          <br />
          <b style={{fontFamily: '"JetBrains Mono", monospace'}}>@claude</b>
          <br />
          反馈 → 长期规则
        </Note>
        <Note x={1320} y={600} w={460} f={b[6]} bg="#D8F0C8" rot={-2}>
          隔一阵回头看：
          <br />
          新模型还需要这些纠正吗？
        </Note>
      </Drift>
    </>
  );
};

export const H5: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const lanes = [0, 1, 2, 3, 4];
  return (
    <PitchBg tag="TACTICS">
      <Drift zoom={0.012}>
        <div style={{position: 'absolute', left: 30, top: 30, background: COL.marker, color: '#111', fontFamily: '"Noto Sans SC"', fontWeight: 900, fontSize: 30, padding: '8px 20px', borderRadius: 6, ...rise(b[0], 10)}}>
          HABIT 05 · 先定计划，再拆不重叠的活
        </div>
        <svg width={1760} height={860} style={{position: 'absolute', left: 0, top: 0}}>
          {/* phase 1: plan route, reviewer */}
          <circle cx={150} cy={210} r={26} fill="none" stroke={COL.marker} strokeWidth={6} opacity={prog(b[1], 10)} />
          <Draw d="M180 210 C400 120 600 300 820 200" p={prog(b[1], 30, 10)} color={COL.marker} w={6} dash={b[1] > 60 ? undefined : undefined} />
          <circle cx={840} cy={200} r={14} fill={COL.marker} opacity={prog(b[1], 8, 40)} />
          <circle cx={500} cy={330} r={26} fill="none" stroke="#7FD1FF" strokeWidth={6} opacity={prog(b[2], 10)} />
          <Draw d="M528 326 C700 330 880 318 1060 312" p={prog(b[2], 24, 8)} color="#7FD1FF" w={5} />
          {/* phase 2: lanes */}
          {lanes.map((i) => (
            <g key={i}>
              <circle cx={150} cy={460 + i * 80} r={20} fill="none" stroke={COL.marker} strokeWidth={5} opacity={prog(b[4], 10, i * 4)} />
              <Draw d={`M180 ${460 + i * 80} H760`} p={prog(b[5], 24, i * 5)} color={COL.marker} w={5} />
              <path d={`M750 ${450 + i * 80} L768 ${460 + i * 80} L750 ${470 + i * 80}`} fill="none" stroke={COL.marker} strokeWidth={5} opacity={prog(b[5], 8, 24 + i * 5)} />
            </g>
          ))}
          {/* phase 3: overlap clump */}
          {lanes.map((i) => {
            const p = prog(b[7], 20, i * 4);
            const jx = Math.sin((frame + i * 30) / 9) * 3 * p;
            return <circle key={i} cx={lerp(1000, 1180 + i * 22, p) + jx} cy={lerp(460 + i * 80, 605 + (i % 2) * 18, p)} r={22} fill="none" stroke={COL.coral} strokeWidth={6} opacity={prog(b[7], 8, i * 4)} />;
          })}
          <ellipse cx={1225} cy={617} rx={150} ry={80} fill="none" stroke={COL.coral} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(b[8], 20)} />
        </svg>
        <MarkerLabel x={880} y={150} f={b[1] - 20}>
          plan mode：先把计划聊对
        </MarkerLabel>
        <MarkerLabel x={1080} y={290} f={b[2] - 10} color="#7FD1FF" size={32}>
          第二个会话：像 staff 工程师审计划
        </MarkerLabel>
        <MarkerLabel x={1080} y={345} f={b[3]} color="#fff" size={32}>
          「你哪里没把握？」
        </MarkerLabel>
        <MarkerLabel x={110} y={400} f={b[4]} size={30}>
          /batch：一个大改动 → 5–30 个任务
        </MarkerLabel>
        <MarkerLabel x={1080} y={450} f={b[5] - 10} size={32}>
          每条线 = 一个 worktree → 一个 PR
        </MarkerLabel>
        <MarkerLabel x={1080} y={505} f={b[6]} size={32} color="#fff">
          你只看有没有重叠，共享接口先合
        </MarkerLabel>
        <MarkerLabel x={1080} y={705} f={b[7] - 10} color={COL.coral} size={34}>
          重叠的活：产出不会 ×5
        </MarkerLabel>
        <MarkerLabel x={1080} y={755} f={b[8] - 10} color={COL.coral} size={34}>
          = 一个合并冲突，五个作者
        </MarkerLabel>
      </Drift>
    </PitchBg>
  );
};

export const H9: React.FC = () => {
  const b = useBeats();
  const bars = [40, 60, 90, 140, 210, 320];
  const H = 1.25;
  const baseY = 760;
  return (
    <>
      <DataBg />
      <Drift zoom={0.015}>
        <Abs x={120} y={70} style={rise(b[0], 14)}>
          <Label color={COL.red}>HABIT 09 / 10</Label>
          <div>
            <Sans size={56} w={900} color="#1B1B1B">
              扩的是验证，不是注意力
            </Sans>
          </div>
        </Abs>
        <Abs x={120} y={200} w={980} style={rise(b[1], 14)}>
          <Sans size={28} w={500} color="#555">
            下属越多 → 每人分到的经理越少 → 质量往下走
          </Sans>
        </Abs>
        <Abs x={120} y={260} style={rise(b[2], 16)}>
          <Sans size={64} w={900} color={COL.red}>
            编排税
          </Sans>
        </Abs>
        <svg width={1100} height={600} style={{position: 'absolute', left: 120, top: 300}}>
          <line x1={40} y1={baseY - 300} x2={1000} y2={baseY - 300} stroke="#999" strokeWidth={2} opacity={prog(b[3], 10)} />
          {bars.map((h, i) => {
            const p = prog(b[3], 18, i * 7);
            const hh = h * H * p;
            return (
              <g key={i}>
                <rect x={80 + i * 150} y={baseY - 300 - hh} width={92} height={hh} fill={i > 3 ? COL.red : '#C9C9C4'} />
                <text x={126 + i * 150} y={baseY - 268} textAnchor="middle" fontSize={24} fontFamily="JetBrains Mono" fill="#555" opacity={prog(b[3], 10)}>
                  {i + 1}
                </text>
              </g>
            );
          })}
          <text x={40} y={baseY - 232} fontSize={22} fontFamily="Noto Sans SC" fill="#555" opacity={prog(b[3], 10)}>
            agent 数 → 每多一个，要的注意力比上一个更多
          </text>
        </svg>
        <Illus x={1040} y={322} f={b[3]} />
        <Abs x={420} y={272} w={700} style={rise(b[4], 14)}>
          <Sans size={26} w={700} color="#1B1B1B">
            作者平时：4–5 个后台 agent + 几个本地会话，有时就嫌多
          </Sans>
        </Abs>
        <Abs x={1240} y={200} w={580}>
          <div style={rise(b[5], 16)}>
            <Label color="#1B1B1B">想多开，就得少盯</Label>
            <div style={{marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap'}}>
              {['自检', '目标', '新的评审者'].map((t) => (
                <span key={t} style={{border: '3px solid #1B1B1B', padding: '6px 16px'}}>
                  <Sans size={30} w={700}>
                    {t}
                  </Sans>
                </span>
              ))}
            </div>
          </div>
          <div style={{...rise(b[6], 16), marginTop: 40}}>
            <Label color={COL.green}>量系统</Label>
            <div style={{marginTop: 10}}>
              <Sans size={32} w={700}>PR 周期 · 返工 · 回滚</Sans>
            </div>
          </div>
          <div style={{...rise(b[7], 16), marginTop: 30}}>
            <div>
              <Label color={COL.red}>别把它当目标</Label>
            </div>
            <div style={{marginTop: 10, position: 'relative', display: 'inline-block'}}>
              <Sans size={32} w={700} color="#777">
                AI 写了百分之几的代码
              </Sans>
              <div style={{position: 'absolute', left: 0, top: '52%', height: 4, background: COL.red, width: `${100 * prog(b[7], 16, 18)}%`}} />
            </div>
          </div>
          <div style={{...rise(b[8], 16), marginTop: 36, display: 'flex', alignItems: 'center', gap: 14}}>
            <span style={{background: '#1B1B1B', color: '#fff', padding: '8px 16px'}}>
              <Sans size={28} w={700}>合并多少 PR</Sans>
            </span>
            <Mono size={30} color={COL.red} w={700}>
              ⇄
            </Mono>
            <span style={{background: COL.red, color: '#fff', padding: '8px 16px'}}>
              <Sans size={28} w={700}>回滚和返工</Sans>
            </span>
          </div>
        </Abs>
      </Drift>
    </>
  );
};
