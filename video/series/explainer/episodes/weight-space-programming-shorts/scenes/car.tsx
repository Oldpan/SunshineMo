// Experiment: the Kinetix car. The post's own car scene plays on top the whole time; below it, 256 tries fill up red
// (0 succeeded) → a small net whose new glowing bypass is drawn in (倒车助跑 → 全速冲) and the car switches to Astra's
// run → "3.5%" slams in and 1024 cells turn green.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Burst, CarScene, Cells, Center, Field, G, Illus, Panel, POOL, pop, prog, Q, Ring, rise, shakeAt, slam, Sparkles, useSub} from './common';

const NET = [
  [4, 260],
  [6, 540],
  [3, 820],
].map(([n, x]) => Array.from({length: n}, (_, i) => ({x, y: 900 + (i - (n - 1) / 2) * 76})));

export const Car: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const fail = sub(0, 2);
  const path = sub(1, 1);
  const go = sub(1, 2);
  const win = sub(2, 1);
  const sh = shakeAt(frame, [frame - b[2]], 16);
  const astra = go >= 0;
  return (
    <Field pool={POOL} shake={sh} bloom={b[2] >= 0 ? 0.4 : 0.15} cy={800}>
      <Center y={330}>
        <div style={{...pop(b[0], 0), opacity: (pop(b[0], 0).opacity as number) * (1 - prog(b[2], 10))}}>
          <G size={56} w={800} color={astra ? Q.green : Q.mint}>
            {astra ? 'Astra 改过之后' : b[1] >= 0 ? '它几乎从来不倒车' : '一辆总冲不上坡的小车'}
          </G>
        </div>
      </Center>
      <Panel x={130} y={430} w={820} h={252} hot={astra} style={{...rise(b[0], 4), overflow: 'hidden', padding: 14}}>
        <CarScene t={astra ? go : frame} w={788} ppo={astra ? 0.25 : 1} astra={astra ? 1 : 0} />
      </Panel>

      {/* 256 tries, 0 succeeded */}
      {fail >= 0 && b[1] < 12 && (
        <div style={{opacity: 1 - prog(b[1], 12)}}>
          <div style={{position: 'absolute', left: 120, top: 760, ...rise(fail, 0)}}>
            <Cells n={256} cols={16} k={Math.floor(256 * prog(fail, 36))} cell={24} gap={3} on={Q.red} />
          </div>
          <div style={{position: 'absolute', left: 580, top: 800, ...pop(fail, 10)}}>
            <G size={50} w={800} color={Q.grey}>
              试了 256 次
            </G>
            <div style={{marginTop: 10}}>
              <G size={120} num color={Q.red} glow={0.7}>
                0 次
              </G>
            </div>
            <G size={50} w={800} color={Q.red}>
              成功
            </G>
          </div>
        </div>
      )}

      {/* the bypass Astra added */}
      {b[1] >= 0 && b[2] < 12 && (
        <div style={{opacity: prog(b[1], 12, 6) * (1 - prog(b[2], 12))}}>
          <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
            {NET[0].flatMap((a) => NET[1].map((c, j) => <line key={`${a.y}-${j}`} x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke={Q.deep} strokeWidth={2} />))}
            {NET[1].flatMap((a) => NET[2].map((c, j) => <line key={`${a.y}-${j}b`} x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke={Q.deep} strokeWidth={2} />))}
            {NET.flat().map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={18} fill={Q.bg} stroke={Q.dim} strokeWidth={4} />
            ))}
            {path >= 0 && (
              <path
                d="M260 786 C 330 700, 750 700, 820 824"
                stroke={Q.green}
                strokeWidth={12}
                fill="none"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - prog(path, 24)}
                style={{filter: `drop-shadow(0 0 14px ${Q.green})`}}
              />
            )}
          </svg>
          <Illus x={850} y={1010} />
          {path >= 0 && (
            <div style={{position: 'absolute', left: 0, width: 1080, textAlign: 'center', top: 1215, ...pop(path, 16)}}>
              <G size={42} w={800} color={Q.green} glow={0.4}>
                新加的小路
              </G>
            </div>
          )}
          {go >= 0 &&
            ['① 先倒车助跑', '② 再全速冲'].map((t, i) => (
              <div key={t} style={{position: 'absolute', left: i ? 560 : 110, top: 1130, ...slam(go, i * 14, 1.8)}}>
                <div style={{display: 'inline-block', background: i ? Q.green : Q.panel, border: `4px solid ${Q.green}`, borderRadius: 20, padding: '4px 24px', boxShadow: `0 0 30px ${Q.green}55`}}>
                  <G size={50} color={i ? Q.bg : Q.green}>
                    {t}
                  </G>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 3.5% → 1024 / 1024 */}
      {b[2] >= 0 && (
        <>
          <Ring x={540} y={340 + 60} f={b[2]} color={Q.green} max={420} />
          <div style={{position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center'}}>
            <div style={slam(b[2], 0, 2.6)}>
              <G size={64} w={800}>
                只改了{' '}
              </G>
              <G size={100} num color={Q.green} glow={1}>
                3.5%
              </G>
              <G size={64} w={800}>
                {' '}的数字
              </G>
            </div>
          </div>
          <div style={{position: 'absolute', left: 110, top: 760, ...rise(b[2], 6)}}>
            <Cells n={1024} cols={32} k={Math.floor(1024 * prog(win, 40))} cell={11} gap={2} />
          </div>
          {win >= 0 && (
            <div style={{position: 'absolute', left: 560, top: 790, ...pop(win, 4)}}>
              <G size={50} w={800} color={Q.grey}>
                试了 1024 次
              </G>
              <div style={{marginTop: 10}}>
                <G size={120} num color={Q.green} glow={0.9}>
                  全成功
                </G>
              </div>
            </div>
          )}
          <Burst x={330} y={970} f={win - 40} n={40} spread={420} seed={12} size={22} colors={[Q.green, Q.mint, Q.yellow]} />
          <Sparkles x={760} y={900} f={win - 20} n={8} color={Q.green} r={200} />
        </>
      )}
    </Field>
  );
};
