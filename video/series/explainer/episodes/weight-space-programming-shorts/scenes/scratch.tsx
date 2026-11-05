// Writing from scratch: a block of zeros + only the game rules (no practice) → the zeros flip into numbers in a wave →
// the network Astra wrote plays Breakout (the post's own replay) → 517 vs 25: its bar shoots up past the PPO one.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Bar, Center, Field, FONT_MONO, G, gridPts, Panel, PlayBoard, POOL, pop, prog, Q, Ring, rise, shakeAt, slam, Sparkles, Swarm, Tag, useSub} from './common';

const GRID = gridPts(540 - 4 * 100, 560, 9, 10, 100, 52);

export const Scratch: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const rules = sub(0, 1);
  const flip = rules - 50; // zeros turn into numbers
  const vs = sub(1, 1);
  const sh = shakeAt(frame, [frame - vs - 30], 14);
  return (
    <Field pool={POOL} shake={sh} bloom={vs >= 0 ? 0.35 : 0.15} cy={820}>
      {/* ---------- zeros + rules */}
      <div style={{opacity: 1 - prog(b[1], 12)}}>
        <Center y={340}>
          <div style={slam(b[0], 0, 2)}>
            <G size={84} color={Q.green} glow={0.8}>
              从零开始写
            </G>
          </div>
        </Center>
        {GRID.map((p, i) => {
          const d = flip - (Math.floor(i / 9) + (i % 9)) * 2;
          const on = d >= 0;
          return (
            <div key={i} style={{position: 'absolute', left: p.x - 50, top: p.y - 30, width: 100, textAlign: 'center', opacity: prog(b[0], 12, i % 12), transform: `scale(${on && d < 8 ? 1.3 - d * 0.04 : 1})`}}>
              <span style={{fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: on ? Q.green : Q.dim, textShadow: on ? `0 0 8px ${Q.green}` : undefined}}>{on ? POOL[(i * 7) % POOL.length] : '0.000'}</span>
            </div>
          );
        })}
        <Center y={1100}>
          <div style={rise(b[0], 14)}>
            <G size={50} w={800} color={Q.mint}>
              数字全是 0
            </G>
          </div>
        </Center>
        {rules >= 0 && (
          <Panel x={210} y={760} w={660} h={300} hot color={Q.yellow} style={{...pop(rules, 0, 0.6), opacity: (pop(rules, 0, 0.6).opacity as number) * (1 - prog(flip, 12, 10))}}>
            <div style={{padding: '30px 40px'}}>
              <G size={52} color={Q.yellow}>
                📄 只给：游戏规则
              </G>
              <div style={{marginTop: 30}}>
                <G size={52} color={Q.red}>
                  ✗ 不给练习
                </G>
              </div>
            </div>
          </Panel>
        )}
      </div>

      {/* ---------- Astra's net plays + 517 vs 25 */}
      {b[1] >= 0 && (
        <>
          <Center y={330}>
            <div style={rise(b[1], 0)}>
              <G size={52} w={800}>
                它一次写出的<span style={{color: Q.green}}>打砖块 AI</span>
              </G>
            </div>
          </Center>
          <div style={{position: 'absolute', left: 100, top: 470, ...pop(b[1], 6, 0.5)}}>
            <div style={{border: `3px solid ${Q.green}`, boxShadow: `0 0 30px ${Q.green}55`}}>
              <PlayBoard game="Breakout" t={b[1]} size={380} />
            </div>
            <div style={{marginTop: 12, width: 380, textAlign: 'center'}}>
              <Tag color={Q.dim}>原文录像</Tag>
            </div>
          </div>
          <div style={{position: 'absolute', left: 540, top: 1180, width: 420, height: 4, background: Q.deep}} />
          <Bar x={570} base={1180} w={150} v={517} scale={1.25} p={prog(b[1], 40, 20)} label=" 分" dec={0} />
          {vs >= 0 && <Bar x={780} base={1180} w={150} v={25} scale={1.25} p={prog(vs, 20, 4)} color={Q.grey} label=" 分" dec={0} />}
          <div style={{position: 'absolute', left: 535, width: 220, top: 1194, textAlign: 'center', opacity: prog(b[1], 12, 20)}}>
            <G size={32} w={800} color={Q.green}>
              Astra 写的
            </G>
          </div>
          {vs >= 0 && (
            <div style={{position: 'absolute', left: 745, width: 220, top: 1194, textAlign: 'center', ...rise(vs, 0, 20)}}>
              <G size={32} w={800} color={Q.grey}>
                训练 5 亿步
              </G>
            </div>
          )}
          <Ring x={645} y={540} f={b[1] - 60} color={Q.green} max={300} width={8} />
          <Sparkles x={645} y={560} f={vs - 30} n={8} color={Q.yellow} r={180} />
          {vs >= 30 && (
            <div style={{position: 'absolute', left: 120, top: 1000, transform: 'rotate(-5deg)', ...slam(vs, 30, 2)}}>
              <div style={{display: 'inline-block', border: `6px solid ${Q.yellow}`, borderRadius: 18, padding: '4px 22px', background: 'rgba(5,9,12,0.9)'}}>
                <G size={60} color={Q.yellow} glow={0.4}>
                  20 倍
                </G>
              </div>
            </div>
          )}
        </>
      )}
    </Field>
  );
};
