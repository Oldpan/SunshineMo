// What weights are, for someone who has never heard the word. Real weights swarm into a disc (the model's "brain") →
// labelled 权重 → wires out to 会做什么 / 做得好不好 → the disc breaks into the training loop (做题 → 对答案 → 改一点),
// its counter racing to 几亿次 → a wall of numbers nobody can read (？) → GPT-6 Astra's scan beam reads it and edits a few.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Burst, Center, Field, G, gridPts, Lock, Panel, POOL, pop, prog, Q, Ring, rise, Scan, shakeAt, slam, Swarm, Tag, useSub} from './common';

const DISC = [60, 130, 200, 270, 340].flatMap((r, k) =>
  Array.from({length: 6 + k * 7}, (_, i) => {
    const a = (i / (6 + k * 7)) * Math.PI * 2 + k * 0.4;
    return {x: 540 + Math.cos(a) * r, y: 800 + Math.sin(a) * r * 0.92};
  }),
);
const WALL = gridPts(540 - 4 * 100, 600, 9, 12, 100, 50);
const EDIT = [22, 49, 58, 85];

export const Numbers: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const loopOn = b[2] >= 0 && b[3] < 0 ? 1 : 0;
  const reps = sub(2, 2); // 重复几亿次
  // loop speed: one lap per 60 frames, accelerating after 重复几亿次
  const lap = b[2] < 0 ? 0 : reps < 0 ? b[2] / 60 : (b[2] - reps) / 60 + (reps * reps) / 900;
  const cnt = b[2] < 0 ? 0 : reps < 0 ? Math.floor(lap) + 1 : Math.floor(Math.pow(10, Math.min(8.5, 1 + reps / 4.5)));
  const edit = sub(4, 1);
  const sh = shakeAt(frame, [sub(0, 1) >= 0 ? frame - sub(0, 1) : -99, edit >= 0 ? frame - edit : -99], 10);
  const nodes = [
    ['做题', -Math.PI / 2],
    ['对答案', Math.PI / 6],
    ['改一点', (Math.PI * 5) / 6],
  ] as const;
  const active = Math.floor(((lap % 1) + 1) % 1 * 3);
  const dotA = -Math.PI / 2 + (lap % 1) * Math.PI * 2;
  return (
    <Field pool={POOL} shake={sh} bloom={b[0] >= 0 && b[2] < 0 ? 0.5 : loopOn * 0.3} cy={800}>
      {/* ---------- the brain disc */}
      <div style={{opacity: 1 - prog(b[2], 14)}}>
        <Swarm f={b[0]} to={DISC} pool={POOL} seed={11} dur={30} spread={30} size={24} color={Q.green} out={b[2]} hot={(i) => b[1] > 0 && sub(1, 1) >= 0 && i % 9 === 0} hotColor={Q.yellow} />
        <Center y={360}>
          <div style={pop(b[0], 0)}>
            <G size={56} w={800} color={Q.mint}>
              AI 模型的“脑子”里
            </G>
          </div>
        </Center>
        {sub(0, 1) >= 0 && (
          <>
            <Ring x={540} y={800} f={sub(0, 1)} color={Q.green} max={500} />
            <Center y={730}>
              <div style={slam(sub(0, 1), 0, 2.4)}>
                <div style={{display: 'inline-block', background: 'rgba(5,9,12,0.85)', border: `4px solid ${Q.green}`, borderRadius: 28, padding: '0 40px'}}>
                  <G size={120} color={Q.green} glow={1}>
                    权重
                  </G>
                </div>
              </div>
            </Center>
          </>
        )}
        {/* wires out to what the numbers decide */}
        {b[1] >= 0 && (
          <>
            <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
              {[300, 780].map((x, i) => (
                <path key={x} d={`M540 1000 C540 1110 ${x} 1080 ${x} 1170`} stroke={Q.green} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(b[1], 18, i * 8)} style={{filter: `drop-shadow(0 0 8px ${Q.green})`}} />
              ))}
            </svg>
            {[
              ['会做什么', 300],
              ['做得好不好', 780],
            ].map(([t, x], i) => (
              <div key={t} style={{position: 'absolute', left: (x as number) - 190, width: 380, top: 1170, textAlign: 'center', ...pop(b[1], 14 + i * 10)}}>
                <div style={{display: 'inline-block', background: Q.panel, border: `3px solid ${Q.green}`, borderRadius: 20, padding: '6px 28px'}}>
                  <G size={52} w={800}>
                    {t}
                  </G>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ---------- training loop */}
      {loopOn > 0 && (
        <div style={{opacity: prog(b[2], 14, 6) * (1 - prog(b[3], 12))}}>
          <Center y={350}>
            <G size={56} w={800} color={Q.mint}>
              平时：靠训练一点点调
            </G>
          </Center>
          <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
            <circle cx={540} cy={820} r={300} stroke={Q.deep} strokeWidth={8} fill="none" />
            <circle cx={540} cy={820} r={300} stroke={Q.green} strokeWidth={8} fill="none" pathLength={1} strokeDasharray={`${0.18} ${0.82}`} strokeDashoffset={-(lap % 1) + 0.25 + 0.09} style={{filter: `drop-shadow(0 0 10px ${Q.green})`}} />
            <circle cx={540 + Math.cos(dotA) * 300} cy={820 + Math.sin(dotA) * 300} r={18} fill={Q.ink} style={{filter: `drop-shadow(0 0 14px ${Q.green})`}} />
          </svg>
          {nodes.map(([t, a], i) => {
            const on = i === active;
            return (
              <div key={t} style={{position: 'absolute', left: 540 + Math.cos(a) * 300 - 150, top: 820 + Math.sin(a) * 300 - 50, width: 300, textAlign: 'center', ...pop(b[2], 8 + i * 8)}}>
                <div style={{display: 'inline-block', background: on ? Q.green : Q.panel, border: `4px solid ${Q.green}`, borderRadius: 22, padding: '4px 26px', boxShadow: on ? `0 0 40px ${Q.green}` : undefined}}>
                  <G size={50} w={900} color={on ? Q.bg : Q.ink}>
                    {t}
                  </G>
                </div>
              </div>
            );
          })}
          <Center y={760}>
            <G size={reps >= 0 ? 76 : 64} num color={reps >= 0 ? Q.yellow : Q.ink} glow={reps >= 0 ? 0.6 : 0}>
              第 {cnt.toLocaleString('en-US')} 次
            </G>
          </Center>
          {reps >= 0 && (
            <Center y={1200}>
              <div style={slam(reps, 6, 2)}>
                <G size={84} color={Q.yellow} glow={0.8}>
                  × 几亿次
                </G>
              </div>
            </Center>
          )}
        </div>
      )}

      {/* ---------- a wall nobody can read */}
      {b[3] >= 0 && (
        <>
          <Swarm f={b[3]} to={WALL} pool={POOL} seed={5} dur={22} spread={16} size={24} color={Q.dim} hot={(i) => edit >= (EDIT.indexOf(i) * 4) && EDIT.includes(i)} hotColor={Q.green} />
          <div style={{opacity: 1 - prog(b[4], 12)}}>
            <Center y={350}>
              <div style={rise(b[3], 4)}>
                <G size={60} w={900}>
                  光看数字，很难看懂
                </G>
              </div>
            </Center>
            {[
              [300, 760, -12],
              [760, 900, 10],
              [520, 1060, -4],
            ].map(([x, y, r], i) => (
              <div key={i} style={{position: 'absolute', left: x - 80, top: y - 120, transform: `rotate(${r + Math.sin(frame / 7 + i) * 4}deg)`, ...pop(b[3], 10 + i * 6, 0.2)}}>
                <G size={220} color={Q.red} glow={0.7}>
                  ?
                </G>
              </div>
            ))}
          </div>
        </>
      )}
      {/* ---------- GPT-6 Astra reads and edits */}
      {b[4] >= 0 && (
        <>
          <Scan f={b[4] - 30} x={100} w={880} y0={580} y1={1190} dur={60} />
          <Scan f={b[4] - 100} x={100} w={880} y0={1190} y1={580} dur={50} color={Q.cyan} />
          <Panel x={150} y={330} w={780} h={190} hot>
            <div style={{position: 'absolute', left: 0, right: 0, top: 18, textAlign: 'center', ...rise(b[4], 0)}}>
              <Tag color={Q.dim}>MIT 的研究者 · 让大模型</Tag>
              <div style={{marginTop: 6}}>
                <G size={78} color={Q.green} glow={0.7}>
                  GPT-6 Astra
                </G>
              </div>
            </div>
          </Panel>
          {['直接看', '直接改'].map((t, i) => {
            const at = i ? edit : b[4] - 40;
            return (
              <div key={t} style={{position: 'absolute', left: i ? 600 : 150, top: 1180, width: 330, textAlign: 'center', ...slam(at, 0, 2)}}>
                <div style={{display: 'inline-block', background: i ? Q.green : Q.panel, border: `4px solid ${Q.green}`, borderRadius: 20, padding: '4px 30px', boxShadow: `0 0 30px ${Q.green}66`}}>
                  <G size={58} color={i ? Q.bg : Q.green}>
                    {t}
                  </G>
                </div>
              </div>
            );
          })}
          {EDIT.map((k, i) => (
            <React.Fragment key={k}>
              <Lock x={WALL[k].x - 60} y={WALL[k].y - 34} w={120} h={46} p={prog(edit, 10, i * 4)} color={Q.green} />
              <Burst x={WALL[k].x} y={WALL[k].y - 10} f={edit - i * 4} n={14} spread={120} seed={k} size={14} colors={[Q.green, Q.mint]} />
            </React.Fragment>
          ))}
        </>
      )}
    </Field>
  );
};
