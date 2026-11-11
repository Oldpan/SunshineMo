// 5 · X 数字粒子 · how sampling works and why it is fast. An official sample (dumplings) sits under boiling noise;
// six step cells wait below. On 「只擦 6 步」 the cells tick one by one and the noise strength follows the real
// sigma schedule from pdd_config.json (1.0 → 0.968 → 0.888 → 0.75 → 0.533 → 0.232 → 0); then the no-CFG chip.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, Center, clamp01, EASE, Field, G, gridPts, IMG, lerp, Lock, Pic, POOL, pop, prog, Q, rise, slam, Streaks, Swarm, useSub} from './common';

const SIG = [1.0, 0.968, 0.888, 0.75, 0.533, 0.232, 0];
const STEP = 12; // frames per step
const IX = 110;
const IY = 480;
const IW = 860;
const IH = 484;

export const Steps: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const erase = sub(0, 1);
  const six = b[1];
  const nocfg = sub(1, 1);
  // continuous sigma: hold 1.0 until the 6-step beat, then ease between schedule values one step per STEP frames
  const t = six < 0 ? 0 : six / STEP;
  const k = Math.min(6, Math.floor(t));
  const sigma = k >= 6 ? 0 : lerp(SIG[k], SIG[k + 1], EASE(clamp01((t - k) * 1.6)));
  // before the 6 steps, a gentle teaser wobble on 「一步步擦干净」
  const teaser = erase >= 0 && six < 0 ? 0.04 * Math.sin(erase / 6) : 0;
  const nz = clamp01(Math.pow(sigma, 0.7) + teaser);
  const seed = frame % 9;
  return (
    <Field pool={POOL} bloom={clamp01(1 - Math.abs(six - 72) / 24) * 0.8}>
      {/* headline */}
      <Center y={340} style={{opacity: 1 - prog(six, 10)}}>
        <div style={rise(b[0], 0)}>
          <G size={60}>从一团噪点开始</G>
        </div>
        {erase >= 0 && (
          <div style={rise(erase, 0)}>
            <G size={48} w={800} color={Q.mint}>
              一步步擦干净
            </G>
          </div>
        )}
      </Center>
      {six >= 0 && (
        <Center y={350}>
          <div style={slam(six, 0, 2)}>
            <G size={100} color={Q.green} glow={1}>
              只擦 6 步
            </G>
          </div>
        </Center>
      )}
      {/* the picture under noise */}
      <Abs x={IX} y={IY} w={IW} h={IH} style={{...pop(b[0], 4, 0.9), boxShadow: `0 0 50px ${Q.green}33`, border: `3px solid ${Q.deep}`}}>
        <div style={{filter: `blur(${nz * 14}px) saturate(${1 - nz * 0.7})`}}>
          <Pic src={IMG.dumplings} w={IW - 6} h={IH - 6} f={frame} dur={240} z0={1.04} z1={1.1} />
        </div>
        <svg width={IW - 6} height={IH - 6} style={{position: 'absolute', left: 0, top: 0, opacity: nz}}>
          <filter id={`nz${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
            <feColorMatrix values="0.6 0.3 0.1 0 0  0.6 0.3 0.1 0 0  0.6 0.3 0.1 0 0  0 0 0 0 1" />
          </filter>
          <rect width={IW} height={IH} filter={`url(#nz${seed})`} />
        </svg>
        <div style={{position: 'absolute', right: 14, top: 10, background: 'rgba(5,9,12,0.8)', padding: '4px 14px', borderRadius: 8}}>
          <G size={28} num color={Q.green}>
            噪声 {sigma.toFixed(3)}
          </G>
        </div>
      </Abs>
      {six >= 0 && <Streaks f={six} cx={540} cy={IY + IH / 2} n={24} />}
      {six >= 6 * STEP && <Lock x={IX - 10} y={IY - 10} w={IW + 20} h={IH + 20} p={prog(six - 6 * STEP, 12)} color={Q.green} />}
      {/* six step cells */}
      <Swarm f={erase} to={gridPts(175, 1060, 6, 1, 146, 0)} pool={POOL} seed={4} dur={20} spread={14} size={20} color={Q.mint} out={six >= 0 ? six : -1} />
      {erase >= 0 &&
        Array.from({length: 6}, (_, i) => {
          const done = six >= (i + 1) * STEP;
          const on = six >= i * STEP;
          const x = IX + i * 146;
          return (
            <Abs key={i} x={x} y={1000} w={128} h={120} style={{opacity: prog(erase, 12, 14 + i * 2)}}>
              <div style={{position: 'absolute', inset: 0, border: `3px ${on ? 'solid' : 'dashed'} ${done ? Q.green : Q.dim}`, borderRadius: 14, background: done ? 'rgba(0,255,163,0.14)' : 'rgba(5,9,12,0.6)', boxShadow: done ? `0 0 24px ${Q.green}66` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <G size={52} num color={done ? Q.green : Q.grey} glow={done ? 0.6 : 0}>
                  {i + 1}
                </G>
                <G size={22} num w={700} color={done ? Q.mint : Q.dim}>
                  {SIG[i + 1].toFixed(3)}
                </G>
              </div>
            </Abs>
          );
        })}
      {/* no CFG */}
      {nocfg >= 0 && (
        <Center y={1150}>
          <div style={{...pop(nocfg, 0, 0.5), display: 'inline-block', background: Q.yellow, borderRadius: 16, padding: '8px 28px'}}>
            <G size={40} color={Q.bg}>
              不用额外再算一遍做对照
            </G>
          </div>
        </Center>
      )}
      <Abs x={100} y={1268} style={{opacity: 0.6}}>
        <G size={22} w={600} color={Q.dim}>
          步数和噪声值来自官方采样配置 · 图源 MiniMax 官方
        </G>
      </Abs>
    </Field>
  );
};
