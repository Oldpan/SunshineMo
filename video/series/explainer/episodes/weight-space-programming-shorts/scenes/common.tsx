// Episode look: the shared `particle` kit (../../../shared/particles.tsx, registers theme `particle`), plus the long
// episode's real figures (game GIFs, Breakout heatmap, Kinetix car, Astra's MinAtar boards) and its real weights,
// which feed the number rain and every particle swarm.
import React from 'react';
import {clamp01, FONT_MONO, Q} from '../../../shared/particles';
import {CarScene, GameScreen, HEAT, PlayBoard, playScore, WALL} from '../../weight-space-programming/scenes/common';

export * from '../../../shared/particles';
export {CarScene, GameScreen, HEAT, PlayBoard, playScore};

/** Real first-layer weights of the Breakout net (as the post printed them), used as particle text. */
export const POOL: string[] = WALL.flatMap((r) => r.values);
export const ZEROS: string[] = ['0.000'];

/** Breakout heatmap (max |W1| per cell) for one input channel, in glowing green on black; rows fill in with p. */
export const GlowHeat: React.FC<{ch: number; size: number; p?: number; vmax?: number}> = ({ch, size, p = 1, vmax = 8}) => {
  const m = HEAT[String(ch)];
  const cell = size / 10;
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(10, ${cell}px)`, width: size, background: '#03110B', border: `2px solid ${Q.deep}`}}>
      {m.flat().map((v, i) => {
        const show = clamp01(p * 12 - Math.floor(i / 10) - (i % 10) * 0.08);
        const k = clamp01(v / vmax) * show;
        return <div key={i} style={{width: cell, height: cell, background: `rgba(0,255,163,${0.06 + k * 0.94})`, boxShadow: k > 0.5 ? `0 0 14px rgba(0,255,163,${k * 0.7})` : 'inset 0 0 0 0.5px rgba(0,0,0,0.6)'}} />;
      })}
    </div>
  );
};

/** Grid of `n` small cells (cols wide); the first `k` are lit in `on`, the rest dim. */
export const Cells: React.FC<{n: number; cols: number; k: number; cell: number; gap?: number; on?: string; off?: string}> = ({n, cols, k, cell, gap = 2, on = Q.green, off = '#0F2219'}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap}}>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{width: cell, height: cell, borderRadius: cell > 10 ? 3 : 1, background: i < k ? on : off, boxShadow: i < k && cell > 10 ? `0 0 8px ${on}88` : undefined}} />
    ))}
  </div>
);

/** Rolling counter text (integer). */
export const count = (v: number, p: number) => Math.round(v * clamp01(p)).toLocaleString('en-US');

export {FONT_MONO};
