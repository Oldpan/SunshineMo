// 0–11 s hook. Real weights fly in and settle into a block (the patient model); a second, glowing swarm (the "doctor"
// AI) circles it. "0.016%" slams in as a handful of cells flip; the block scatters into two bars, 7.9% → 48.1%;
// then 「没有重新训练 · 直接改」 stamps on with a shake.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Bar, Burst, Center, clamp01, Field, G, gridPts, Illus, POOL, pop, prog, Q, Ring, rise, shakeAt, slam, Sparkles, Streaks, Swarm, Tag, useSub} from './common';

const COLS = 9;
const ROWS = 12;
const GRID = gridPts(540 - (COLS - 1) * 48, 640, COLS, ROWS, 96, 46);
const HOT = new Set([12, 40, 67, 95]);

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const cut = b[1]; // 0.016% lands
  const bars = sub(1, 1); // 7.9% → 48.1% line
  const stamp = b[2];
  const sh = shakeAt(frame, [frame - cut, frame - stamp], 18);
  const out = bars >= 0 ? bars : -1;
  const orbit = Array.from({length: 40}, (_, i) => {
    const a = frame / 40 + (i / 40) * Math.PI * 2;
    return {x: 540 + Math.cos(a) * 470, y: 900 + Math.sin(a) * 330};
  });
  return (
    <Field pool={POOL} shake={sh} bloom={clamp01(1 - Math.abs(cut) / 30) + clamp01(1 - Math.abs(stamp) / 30)} cy={820}>
      {/* the patient: a block of real weights */}
      <Swarm f={frame} to={GRID} pool={POOL} seed={3} dur={26} spread={22} size={22} color={Q.dim} out={out} hot={(i) => cut >= (i % 5) * 2 && HOT.has(i)} hotColor={Q.green} />
      {/* the doctor: a ring of glowing numbers circling it */}
      <div style={{opacity: 1 - prog(out, 14)}}>
        <Swarm f={frame - 8} to={orbit} pool={POOL} seed={8} dur={24} spread={16} size={24} color={Q.green} />
      </div>
      <Center y={340}>
        <div style={{...pop(frame, 4), opacity: 1 - prog(cut, 10)}}>
          <G size={66} glow={0.4}>
            一个 AI 给另一个 AI
          </G>
        </div>
      </Center>
      <Center y={420}>
        <div style={{...slam(frame, 18, 1.8), opacity: (frame < 18 ? 0 : 1) * (1 - prog(cut, 10))}}>
          <G size={110} color={Q.green} glow={1}>
            动了个小手术
          </G>
        </div>
      </Center>
      <div style={{opacity: prog(frame, 10, 30) * (1 - prog(cut, 10))}}>
        <Illus x={820} y={1200} />
      </div>
      {/* 0.016% */}
      {cut >= 0 && (
        <>
          <Streaks f={cut + 22} cx={540} cy={700} />
          <Ring x={540} y={700} f={cut} color={Q.green} max={620} />
          <Ring x={540} y={700} f={cut - 5} color={Q.mint} max={420} width={8} />
          <Burst x={540} y={700} f={cut} n={50} spread={560} seed={6} size={26} colors={[Q.green, Q.mint, Q.ink]} />
          <Center y={350}>
            <div style={{...rise(cut, 4), opacity: (rise(cut, 4).opacity as number) * (1 - prog(bars, 8))}}>
              <G size={58} w={800}>
                只改了
              </G>
            </div>
          </Center>
          <Center y={600} style={{opacity: 1 - prog(bars, 10)}}>
            <div style={slam(cut, 0, 3)}>
              <div style={{display: 'inline-block', background: 'rgba(5,9,12,0.7)', borderRadius: 30, padding: '0 30px'}}>
                <G size={230} num color={Q.green} glow={1.4} style={{letterSpacing: -6}}>
                  0.016%
                </G>
              </div>
            </div>
          </Center>
          <Center y={890}>
            <div style={{...rise(cut, 14), opacity: (rise(cut, 14).opacity as number) * (1 - prog(bars, 10))}}>
              <G size={56} w={800} color={Q.mint}>
                的数字（万分之一点六）
              </G>
            </div>
          </Center>
        </>
      )}
      {/* 7.9% → 48.1% */}
      {bars >= 0 && (
        <>
          <Center y={360}>
            <div style={rise(bars, 0)}>
              <G size={56} w={800}>
                只改了{' '}
              </G>
              <G size={110} num color={Q.green} glow={1}>
                0.016%
              </G>
              <G size={56} w={800}>
                {' '}的数字
              </G>
            </div>
          </Center>
          <div style={{position: 'absolute', left: 150, width: 420, top: 960, textAlign: 'center', ...rise(bars, 10)}}>
            <div style={{display: 'inline-block', borderBottom: `3px solid ${Q.grey}`, paddingBottom: 4}}>
              <G size={44} w={800} color={Q.ink}>
                千问 数学答对率
              </G>
            </div>
          </div>
          <div style={{position: 'absolute', left: 190, top: 1240, width: 700, height: 4, background: Q.deep}} />
          <Bar x={250} base={1240} w={210} v={7.9} scale={11} p={prog(bars, 18, 4)} color={Q.grey} />
          <Bar x={620} base={1240} w={210} v={48.1} scale={11} p={prog(bars, 40, 30)} color={Q.green} />
          <div style={{position: 'absolute', left: 250, width: 210, top: 1254, textAlign: 'center', opacity: prog(bars, 10)}}>
            <G size={34} w={700} color={Q.grey}>
              改之前
            </G>
          </div>
          <div style={{position: 'absolute', left: 620, width: 210, top: 1254, textAlign: 'center', opacity: prog(bars, 10, 30)}}>
            <G size={34} w={700} color={Q.green}>
              改之后
            </G>
          </div>
          <Sparkles x={725} y={700} f={bars - 70} n={8} color={Q.green} r={170} />
        </>
      )}
      {/* stamp */}
      {stamp >= 0 && (
        <div style={{position: 'absolute', left: 0, width: 1080, top: 760, textAlign: 'center', transform: 'rotate(-6deg)'}}>
          <div style={slam(stamp, 0, 2.6)}>
            <div style={{display: 'inline-block', border: `8px solid ${Q.yellow}`, borderRadius: 24, padding: '14px 40px', background: 'rgba(5,9,12,0.88)', boxShadow: `0 0 50px ${Q.yellow}66`}}>
              <G size={76} color={Q.yellow} glow={0.5}>
                没重新训练 · 直接改
              </G>
            </div>
          </div>
        </div>
      )}
      {stamp >= 0 && <Ring x={540} y={830} f={stamp} color={Q.yellow} max={560} />}
      <div style={{position: 'absolute', left: 100, top: 1210, opacity: prog(frame, 10, 20) * (1 - prog(bars, 8))}}>
        <Tag color={Q.dim}>MIT CSAIL · 2026</Tag>
      </div>
    </Field>
  );
};
