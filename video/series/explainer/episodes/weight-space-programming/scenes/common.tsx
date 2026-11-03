// Episode pieces for 「权重空间编程」. The page look is the shared `distill` kit (video/series/explainer/shared); this
// file adds the post's own figures, driven by the post's data (scenes/data/*.json, built by data/build.py):
// the scrolling wall of weights, the 10x10 game screens, a weight heatmap, the Kinetix car scene and the MinAtar boards.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, D, FONT_MONO, FONT_SANS, lerp, Zh} from '../../../shared/distill';
import exp1 from './data/exp1.json';
import gamesData from './data/games.json';
import carData from './data/car.json';
import playData from './data/play.json';

export * from '../../../shared/distill';

// ------------------------------------------------------------------ weight wall (teaser + experiment 1 prompt)
type Row = {label: string; values: string[]; marks: number[]};
export const WALL: Row[] = (exp1 as {wall: Row[]}).wall;

/** Rows of Breakout's weights as Astra got them; quoted numbers highlighted. `scroll` px moves the rows up (loops). */
export const WeightWall: React.FC<{w: number; h: number; size?: number; scroll?: number; n?: number; markP?: number; cols?: number}> = ({
  w,
  h,
  size = 22,
  scroll = 0,
  n = 12,
  markP = 1,
  cols = 9,
}) => {
  const lh = size * 2;
  const rows = [...WALL, ...WALL, ...WALL];
  const off = scroll % (WALL.length * lh);
  return (
    <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', maskImage: 'linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)'}}>
      <div style={{position: 'absolute', left: 0, top: -off}}>
        {rows.slice(0, Math.ceil(h / lh) + WALL.length + 2).map((r, i) => (
          <div key={i} style={{height: lh, display: 'flex', alignItems: 'center', gap: size * 0.55, whiteSpace: 'nowrap', fontFamily: FONT_MONO, fontSize: size}}>
            <span style={{color: D.faint2, width: size * 6.6}}>{r.label}</span>
            {r.values.slice(0, Math.min(n, cols)).map((v, c) => {
              const hot = r.marks.includes(c);
              return (
                <span
                  key={c}
                  style={{
                    color: hot ? D.greenDark : D.dim,
                    fontWeight: hot ? 700 : 400,
                    background: hot ? `rgba(207,233,220,${markP})` : undefined,
                    borderRadius: 4,
                    padding: '1px 4px',
                  }}
                >
                  {v}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ 10x10 game screens (the post's GIFs)
type GameClip = {pal: string[]; frames: string[]; ms: number[]};
export const GAMES = gamesData as Record<string, GameClip>;
/** Plays one of the post's gameplay GIFs, decoded to 10x10 cells; `t` = frames since start (30 fps). Loops. */
export const GameScreen: React.FC<{game: string; t: number; size: number}> = ({game, t, size}) => {
  const g = GAMES[game];
  const total = g.ms.reduce((a, b) => a + b, 0);
  let ms = (((Math.max(0, t) / 30) * 1000) % total) + 0.0001;
  let k = 0;
  while (k < g.frames.length - 1 && ms > g.ms[k]) {
    ms -= g.ms[k];
    k++;
  }
  const fr = g.frames[k];
  const cell = size / 10;
  return (
    <div style={{width: size, height: size, display: 'grid', gridTemplateColumns: `repeat(10, ${cell}px)`, background: '#000', borderRadius: 6, overflow: 'hidden'}}>
      {[...fr].map((c, i) => (
        <div key={i} style={{width: cell, height: cell, background: g.pal[c.charCodeAt(0) - 65], boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.35)'}} />
      ))}
    </div>
  );
};

// ------------------------------------------------------------------ heatmap of the Breakout net's first layer
export const HEAT = (exp1 as {heat_maxabs: Record<string, number[][]>}).heat_maxabs;
/** 10x10 grid of max |W1| per input cell for one channel; cells fill in row by row with p (0..1); `hiRow` outlines a row. */
export const Heat: React.FC<{ch: number; size: number; p?: number; hiRow?: number; hiN?: number; hiP?: number; vmax?: number}> = ({ch, size, p = 1, hiRow, hiN = 1, hiP = 0, vmax = 8}) => {
  const m = HEAT[String(ch)];
  const cell = size / 10;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(10, ${cell}px)`, background: '#fff', border: `1.5px solid ${D.border}`}}>
        {m.flat().map((v, i) => {
          const show = clamp01(p * 12 - Math.floor(i / 10) - (i % 10) * 0.08);
          return <div key={i} style={{width: cell, height: cell, background: `rgba(17,134,89,${clamp01(v / vmax) * show})`, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.06)'}} />;
        })}
      </div>
      {hiRow !== undefined && hiP > 0 && (
        <div style={{position: 'absolute', left: -4, top: hiRow * cell - 4, width: size + 8, height: cell * hiN + 8, border: `3px solid ${D.red}`, borderRadius: 6, opacity: hiP, boxSizing: 'border-box'}} />
      )}
    </div>
  );
};

// ------------------------------------------------------------------ Kinetix car (the post's carjump_scene.svg, SMIL -> frames)
type Body = {kt: number[]; t: number[][]; r: number[]; svg: string; faded: boolean};
const CAR = carData as {dur: number; static: string; bodies: Body[]};
const sample = (kt: number[], vals: number[], u: number) => {
  let i = 0;
  while (i < kt.length - 2 && u > kt[i + 1]) i++;
  const k = clamp01((u - kt[i]) / Math.max(kt[i + 1] - kt[i], 1e-6));
  return lerp(vals[i], vals[i + 1], k);
};
/** The car-on-ramp scene; `t` frames since start, loops every 5.2 s. `ppo` / `astra` set each car's opacity. */
export const CarScene: React.FC<{t: number; w: number; ppo?: number; astra?: number}> = ({t, w, ppo = 0.38, astra = 1}) => {
  const u = ((Math.max(0, t) / 30) % CAR.dur) / CAR.dur;
  const h = (w * 259) / 934;
  const body = (b: Body, i: number) => {
    const x = sample(b.kt, b.t.map((v) => v[0]), u);
    const y = sample(b.kt, b.t.map((v) => v[1]), u);
    const r = sample(b.kt, b.r, u);
    return <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} dangerouslySetInnerHTML={{__html: b.svg}} />;
  };
  return (
    <svg width={w} height={h} viewBox="0 0 934 259">
      <rect x={8} y={8} width={918} height={243} fill="#f4f5f7" />
      <g transform="translate(17 305) scale(180 -180)">
        <g dangerouslySetInnerHTML={{__html: CAR.static}} />
        {body(CAR.bodies[0], 0)}
        <g opacity={ppo}>{CAR.bodies.slice(1, 4).map((b, i) => body(b, i + 1))}</g>
        <g opacity={astra}>{CAR.bodies.slice(4).map((b, i) => body(b, i + 4))}</g>
      </g>
      <rect x={8} y={8} width={918} height={243} fill="none" stroke="#c9cdd2" strokeWidth={1} />
    </svg>
  );
};

// ------------------------------------------------------------------ MinAtar boards played by Astra's written networks
type Play = {channels: string[]; grids: string[]; score: number[]; final: number};
export const PLAYS = playData as Record<string, Play>;
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const ORDER = ['player', 'projectile', 'danger', 'reward', 'gauge', 'trail'];
const COL: Record<string, string> = {player: '#4c8dff', projectile: '#f4f6ff', danger: '#ff5468', reward: '#ffc23d', gauge: '#36d399', trail: '#8d9cbf'};
/** One episode of the network Astra wrote, at 15 steps a second (as on the page). Returns the board; score via playScore. */
export const PlayBoard: React.FC<{game: string; t: number; size: number}> = ({game, t, size}) => {
  const p = PLAYS[game];
  const k = Math.floor((Math.max(0, t) / 30) * 15) % p.grids.length;
  const g = p.grids[k];
  const cell = size / 10;
  return (
    <svg width={size} height={size} style={{borderRadius: 8, display: 'block'}}>
      <rect width={size} height={size} fill="#0b1020" />
      {[...g].map((ch, q) => {
        const m = B64.indexOf(ch);
        if (!m) return null;
        const name = ORDER.find((o) => m & (1 << p.channels.indexOf(o)));
        if (!name) return null;
        const pad = name === 'trail' ? cell * 0.3 : cell * 0.08;
        return <rect key={q} x={(q % 10) * cell + pad} y={Math.floor(q / 10) * cell + pad} width={cell - 2 * pad} height={cell - 2 * pad} fill={COL[name]} opacity={name === 'trail' ? 0.55 : 1} />;
      })}
    </svg>
  );
};
export const playScore = (game: string, t: number) => {
  const p = PLAYS[game];
  const k = Math.floor((Math.max(0, t) / 30) * 15) % p.grids.length;
  return p.score[k];
};

// ------------------------------------------------------------------ small helpers
/** Grey caption under a figure. */
export const Cap: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 22, color = D.dim, style}) => (
  <div style={{textAlign: 'center', marginTop: 10, ...style}}>
    <Zh size={size} w={500} color={color}>
      {children}
    </Zh>
  </div>
);

/** Live frame counter for scenes that need a continuous clock. */
export const useT = () => useCurrentFrame();

export {FONT_SANS};
