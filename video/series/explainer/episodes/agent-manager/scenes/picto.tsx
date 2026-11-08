// Pictogram-motion scenes: manage (what managing is), breaks (where the analogy breaks).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, Bot, COL, Drift, Label, lerp, MX, Person, PictoBg, prog, rise, Sans} from './common';

const TILE = [COL.yellow, COL.coral, COL.mint, COL.sky, COL.violet, '#FFFFFF'];

const Head: React.FC<{k: string; t: string; f: number}> = ({k, t, f}) => (
  <>
    <Abs x={104} y={66} style={rise(f, 10)}>
      <Label color={COL.yellow}>{k}</Label>
    </Abs>
    <Abs x={100} y={104} style={rise(f, 18)}>
      <Sans size={64} w={900} color="#fff">
        {t}
      </Sans>
    </Abs>
  </>
);

/** Small action glyphs drawn in the person's hands. */
const Glyph: React.FC<{i: number; c: string}> = ({i, c}) => {
  const s = {fill: 'none', stroke: c, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (i) {
    case 0: // pick: target
      return (
        <g transform="translate(120 120)">
          <circle r={26} {...s} />
          <circle r={9} fill={c} />
        </g>
      );
    case 1: // write: lines
      return <path d="M98 108 h48 M98 126 h40 M98 144 h30" {...s} />;
    case 2: // hand off: arrow
      return <path d="M96 128 h52 m-16 -16 l16 16 l-16 16" {...s} />;
    case 3: // follow up: clock
      return (
        <g transform="translate(122 126)">
          <circle r={24} {...s} />
          <path d="M0 -12 V0 H12" {...s} />
        </g>
      );
    case 4: // review: check
      return <path d="M98 128 l14 14 l30 -30" {...s} />;
    default: // ship: flag
      return <path d="M104 150 V100 l34 10 l-34 12" {...s} />;
  }
};

export const Manage: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const acts = ['挑任务', '写指令', '委派', '跟进', '验收', '决定上线'];
  const loop = prog(b[3], 30);
  const lift = prog(b[4], 18);
  return (
    <>
      <PictoBg />
      <Drift zoom={0.02}>
        <Head k="WHAT MANAGING LOOKS LIKE" t="你和 agent 的一天" f={b[0]} />
        <Abs x={100} y={0} style={{transform: `translateY(${-lift * 40}px) scale(${lerp(1, 0.86, lift)})`, transformOrigin: '50% 260px', width: 1720, height: 1080}}>
          {acts.map((a, i) => {
            const f = i < 3 ? b[1] - i * 8 : b[2] - (i - 3) * 8;
            const p = prog(f, 16);
            const bob = Math.sin((frame + i * 9) / 18) * 4 * p;
            return (
              <div
                key={a}
                style={{
                  position: 'absolute',
                  left: 0 + i * 290,
                  top: 250,
                  width: 260,
                  height: 290,
                  borderRadius: 24,
                  background: TILE[i],
                  opacity: p,
                  transform: `translateY(${(1 - p) * 40 + bob}px)`,
                }}
              >
                <svg width={260} height={210} style={{position: 'absolute', top: 14, left: 0}}>
                  <g transform="translate(20 6)">
                    <Person c={MX.picto} s={0.95} />
                  </g>
                  <g transform="translate(40 0)">
                    <Glyph i={i} c={MX.picto} />
                  </g>
                </svg>
                <div style={{position: 'absolute', bottom: 24, width: '100%', textAlign: 'center'}}>
                  <Sans size={36} w={900} color={MX.picto}>
                    {a}
                  </Sans>
                </div>
              </div>
            );
          })}
          {/* loop line under the six tiles */}
          <svg width={1760} height={120} style={{position: 'absolute', left: 0, top: 560}}>
            <path d="M130 10 C130 80 1600 80 1600 10" fill="none" stroke={COL.yellow} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - loop} strokeLinecap="round" />
          </svg>
          <Abs x={760} y={610} style={rise(b[3] - 18, 16)}>
            <Sans size={54} w={900} color={COL.yellow}>
              = 管理
            </Sans>
          </Abs>
        </Abs>
        {/* what it is not / what it is */}
        <Abs x={100} y={690} w={1720} style={{display: 'flex', gap: 28}}>
          {['不是让你转岗当经理', '也不是说 agent 能替代同事'].map((t, i) => (
            <div key={t} style={{...rise(b[4] - i * 10, 16), background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 26px'}}>
              <Sans size={32} w={700} color="rgba(255,255,255,0.75)">
                <span style={{color: COL.coral}}>✕ </span>
                {t}
              </Sans>
            </div>
          ))}
        </Abs>
        <Abs x={100} y={790} w={1720} style={rise(b[5], 18)}>
          <Sans size={44} w={900} color="#fff">
            管理 = 帮别人把活干好，<span style={{color: COL.yellow}}>拿出好结果</span>
          </Sans>
        </Abs>
        <Abs x={1180} y={690} w={640} style={rise(b[6], 18)}>
          <div style={{background: COL.yellow, borderRadius: 18, padding: '18px 26px'}}>
            <Sans size={30} w={900} color={MX.picto}>
              用得最顺的人：不一定最会写提示词，而是学会了管理
            </Sans>
          </div>
        </Abs>
      </Drift>
    </>
  );
};

export const Breaks: React.FC = () => {
  const b = useBeats();
  const items: [string, string][] = [
    ['管人更难', '跑过五个 agent ≠ 能管五个人'],
    ['返工几乎免费', '两三个方案都做出来比'],
    ['没有经验，只有笔记本', '教训要写下来给团队'],
    ['太听话，太自信', '让它反过来驳自己的答案'],
    ['只有一种类型', '强弱项一样，每次模型更新都变'],
    ['新人还得培养', '基本功的机会要刻意留'],
    ['人的团队仍然重要', '别让管 agent 挤掉带团队'],
  ];
  return (
    <>
      <PictoBg />
      <Drift zoom={0.02}>
        <Head k="WHERE THE ANALOGY BREAKS" t="人和 agent，七个不一样" f={b[0]} />
        {items.map(([t, s], i) => {
          const f = b[i + 1];
          const p = prog(f, 16);
          const on = f >= 0 && (i === 6 || b[i + 2] < 0);
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 100 + col * 435 + (row ? 217 : 0);
          return (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: x,
                top: 230 + row * 330,
                width: 410,
                height: 300,
                borderRadius: 24,
                background: on ? 'rgba(255,197,49,0.16)' : 'rgba(255,255,255,0.07)',
                border: `3px solid ${on ? COL.yellow : 'transparent'}`,
                opacity: lerp(0.35, 1, p),
              }}
            >
              <svg width={400} height={160} style={{position: 'absolute', left: 20, top: 10}}>
                <g transform="translate(20 0)" opacity={0.5 + 0.5 * p}>
                  <Person c="#fff" s={0.85} />
                </g>
                <text x={176} y={95} fontSize={56} fill={COL.coral} fontFamily="Montserrat" fontWeight={900} opacity={p}>
                  ≠
                </text>
                <g transform="translate(215 0)" opacity={0.5 + 0.5 * p}>
                  <Bot s={0.85} />
                </g>
              </svg>
              <div style={{position: 'absolute', top: 172, width: '100%', textAlign: 'center', padding: '0 16px'}}>
                <Sans size={32} w={900} color="#fff">
                  {t}
                </Sans>
                <div style={{opacity: p}}>
                  <Sans size={24} w={500} color="rgba(255,255,255,0.78)">
                    {s}
                  </Sans>
                </div>
              </div>
            </div>
          );
        })}
      </Drift>
    </>
  );
};
