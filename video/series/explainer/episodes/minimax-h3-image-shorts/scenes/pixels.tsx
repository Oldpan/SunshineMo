// 2 · X 数字粒子 · how big 16 MP is. Squares drawn to scale (area ∝ pixels): 1 MP (180 px side), 4 MP (360),
// then 16 MP (720) assembling from number particles with the official beetle inside; a 4×4 grid shows it is 16 of the
// 1K squares; the last beat pushes into the beetle (shown downscaled, as on the model card) under HUD brackets.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, Center, clamp01, EASE, Field, G, IMG, Lock, Pic, POOL, pop, prog, Q, rise, Ring, slam, Streaks, Swarm, useSub} from './common';

const CX = 540;
const CY = 870;
const sq = (side: number, n: number) => {
  const pts = [];
  const h = side / 2;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 4;
    const k = t % 1;
    const e = Math.floor(t);
    const p = -h + k * side;
    pts.push(e === 0 ? {x: CX + p, y: CY - h} : e === 1 ? {x: CX + h, y: CY + p} : e === 2 ? {x: CX - p, y: CY + h} : {x: CX - h, y: CY - p});
  }
  return pts;
};
const Box: React.FC<{side: number; p: number; color: string; dash?: boolean}> = ({side, p, color, dash}) => (
  <div style={{position: 'absolute', left: CX - side / 2, top: CY - side / 2, width: side, height: side, border: `4px ${dash ? 'dashed' : 'solid'} ${color}`, opacity: clamp01(p), boxShadow: dash ? undefined : `0 0 24px ${color}66`, boxSizing: 'border-box'}} />
);

export const Pixels: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const four = sub(0, 1);
  const big = b[1];
  const grid = sub(1, 1);
  const zoom = b[2];
  const dimSmall = 1 - prog(big, 20, 30) * 0.6;
  return (
    <Field pool={POOL} bloom={clamp01(1 - Math.abs(big) / 30)} cy={CY}>
      {/* headline */}
      <Center y={330} style={{opacity: 1 - prog(big, 10)}}>
        <div style={rise(b[0], 0)}>
          <G size={52} w={800}>
            常见的 AI 图
          </G>
        </div>
        {four >= 0 && (
          <div style={rise(four, 0)}>
            <G size={68} color={Q.green} glow={0.5}>
              100 万 / 400 万像素
            </G>
          </div>
        )}
      </Center>
      {big >= 0 && (
        <Center y={330}>
          <div style={slam(big, 0, 2)}>
            <G size={96} num color={Q.green} glow={1}>
              1600 万像素
            </G>
          </div>
          {grid >= 0 && (
            <div style={rise(grid, 0)}>
              <G size={52} w={800}>
                = 16 个 1K 图
              </G>
            </div>
          )}
        </Center>
      )}
      {/* to scale: 1 MP and 4 MP */}
      <Swarm f={b[0]} to={sq(170, 24)} pool={POOL} seed={2} dur={22} spread={12} size={20} color={Q.mint} out={big >= 0 ? big : -1} />
      <div style={{opacity: dimSmall}}>
        <Box side={170} p={prog(b[0], 10, 24)} color={Q.mint} />
        <Abs x={CX - 85} y={CY + 95} w={170} style={{textAlign: 'center', opacity: prog(b[0], 10, 24) * (1 - prog(big, 10))}}>
          <G size={30} w={700} color={Q.mint}>
            1024²
          </G>
        </Abs>
      </div>
      {four >= 0 && (
        <div style={{opacity: dimSmall}}>
          <Swarm f={four} to={sq(340, 40)} pool={POOL} seed={5} dur={22} spread={12} size={20} color={Q.cyan} out={big >= 0 ? big : -1} />
          <Box side={340} p={prog(four, 10, 24)} color={Q.cyan} />
          <Abs x={CX + 180} y={CY - 170} style={{opacity: prog(four, 10, 24) * (1 - prog(big, 10))}}>
            <G size={30} w={700} color={Q.cyan}>
              2048²
            </G>
          </Abs>
        </div>
      )}
      {/* 16 MP: particles assemble the 720 square, the beetle fades in inside it */}
      {big >= 0 && (
        <>
          <Streaks f={big} cx={CX} cy={CY} />
          <Swarm f={big} to={sq(680, 72)} pool={POOL} seed={9} dur={24} spread={14} size={22} color={Q.green} out={zoom >= 0 ? zoom : -1} />
          <div style={{position: 'absolute', left: CX - 340, top: CY - 340, width: 680, height: 680, opacity: prog(big, 20, 22), boxShadow: `0 0 60px ${Q.green}55`}}>
            <Pic src={IMG.beetle} w={680} h={680} f={zoom >= 0 ? zoom : 0} dur={90} z0={1} z1={zoom >= 0 ? 1.9 : 1} fx={0.56} fy={0.42} />
          </div>
          <Box side={680} p={prog(big, 20, 10)} color={Q.green} />
          <Ring x={CX} y={CY} f={big} color={Q.green} max={560} />
          <Abs x={CX - 340} y={CY + 352} style={{opacity: prog(big, 20, 30)}}>
            <G size={28} w={700} color={Q.dim}>
              4096²
            </G>
          </Abs>
        </>
      )}
      {/* 4×4 grid: sixteen 1K squares */}
      {grid >= 0 && (
        <div style={{opacity: 1 - prog(zoom, 12)}}>
          {Array.from({length: 16}, (_, i) => {
            const x = CX - 340 + (i % 4) * 170;
            const y = CY - 340 + Math.floor(i / 4) * 170;
            const d = i * 2.4;
            return (
              <div key={i} style={{position: 'absolute', left: x, top: y, width: 170, height: 170, border: `2px solid ${Q.green}`, background: `rgba(5,9,12,${0.35 * prog(grid, 8, d)})`, opacity: prog(grid, 8, d), boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <G size={30} num color={Q.ink} style={{opacity: 0.85}}>
                  1K
                </G>
              </div>
            );
          })}
        </div>
      )}
      {/* close-up of the beetle */}
      {zoom >= 0 && (
        <>
          <Lock x={CX - 230} y={CY - 210} w={460} h={400} p={prog(zoom, 18, 30)} color={Q.yellow} />
          <Abs x={CX - 330} y={CY - 320} style={pop(zoom, 34)}>
            <span style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 34, fontWeight: 800, color: Q.bg, background: Q.yellow, padding: '6px 18px', borderRadius: 10}}>水珠 · 花纹</span>
          </Abs>
          <Abs x={CX + 110} y={CY + 352} style={{opacity: prog(zoom, 12, 20)}}>
            <G size={24} w={600} color={Q.dim}>
              官方样图（缩小展示）
            </G>
          </Abs>
        </>
      )}
      <Abs x={100} y={1268} style={{opacity: 0.6}}>
        <G size={22} w={600} color={Q.dim}>
          方块面积按像素数比例画
        </G>
      </Abs>
    </Field>
  );
};
