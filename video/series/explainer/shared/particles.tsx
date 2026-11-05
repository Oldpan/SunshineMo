// Shared `particle` look for 讲透 vertical (9:16) cuts, first made for weight-space-programming-shorts (2026-11):
// black field, real numbers drifting as a faint rain, glowing mint-green type, and number "particles" that fly in from
// the edges and settle into a shape (kinetic-reel's particle-cloud morph). Built for 抖音 / 小红书 / 视频号 at 1080×1920.
// Layout: key content inside the 6:7 band, y 330–1290 and x 100–960 (SAFE); subtitles are placed by the engine.
// Motion: the rain scrolls and the field zooms in a little every frame, so no stretch is a frozen frame.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT_MONO, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene} from '@atv/lib/timing';
import {Burst, during, flyOut, lerp, mix, pop, rise, Ring, rng, SAFE, shakeAt, slam, Sparkles, useSub} from './popflat';

THEMES.particle = {bg: '#05090C', bg2: '#0B1A14', accent: '#00FFA3', accentSoft: '#0E2A20', ink: '#E8FFF4', dark: true};

export const Q = {
  bg: '#05090C',
  panel: 'rgba(6,20,15,0.82)',
  green: '#00FFA3',
  mint: '#7FFFD0',
  dim: '#4E8C72',
  deep: '#1E6B4A',
  ink: '#E8FFF4',
  red: '#FF3B6B',
  yellow: '#FFC23D',
  cyan: '#4FE3FF',
  grey: '#8FA39A',
};
export const FONT_ZH = '"Noto Sans SC", "Noto Sans CJK SC", sans-serif';
export const FONT_NUM = '"Source Sans 3", "Noto Sans SC", sans-serif';
export {Burst, clamp01, during, EASE, flyOut, FONT_MONO, lerp, mix, pop, prog, rise, Ring, rng, SAFE, shakeAt, slam, Sparkles, useSub};

const glow = (c: string, k = 1) => `0 0 ${18 * k}px ${c}, 0 0 ${42 * k}px ${c}66`;

// ------------------------------------------------------------------ text
export const G: React.FC<{size?: number; color?: string; w?: number; glow?: number; num?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({
  size = 64,
  color = Q.ink,
  w = 900,
  glow: k = 0,
  num,
  style,
  children,
}) => (
  <span
    style={{
      fontFamily: num ? FONT_NUM : FONT_ZH,
      fontWeight: w,
      fontSize: size,
      color,
      lineHeight: 1.16,
      letterSpacing: size > 120 ? -size * 0.02 : 0,
      textShadow: k ? glow(color, k) : undefined,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);
export const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 28, color = Q.dim, children, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'pre', ...style}}>{children}</span>
);
/** Centered block at y inside the safe column. */
export const Center: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: 'absolute', left: SAFE.x0 - 40, width: SAFE.x1 - SAFE.x0 + 80, top: y, textAlign: 'center', ...style}}>{children}</div>
);
/** Small mono tag like "SCAN // 实验 1". */
export const Tag: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = Q.green, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, letterSpacing: 4, color, whiteSpace: 'nowrap', ...style}}>{children}</span>
);
/** Grey 「示意」 stamp for drawn (not source) visuals. */
export const Illus: React.FC<{x: number; y: number}> = ({x, y}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT_ZH, fontSize: 24, fontWeight: 700, color: Q.dim, border: `2px solid ${Q.deep}`, borderRadius: 8, padding: '2px 12px'}}>示意</div>
);

// ------------------------------------------------------------------ panels
export const Panel: React.FC<{x: number; y: number; w: number; h?: number; hot?: boolean; color?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  hot,
  color = Q.green,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: Q.panel,
      border: `3px solid ${hot ? color : Q.deep}`,
      borderRadius: 26,
      boxShadow: hot ? `0 0 40px ${color}55, inset 0 0 30px ${color}18` : undefined,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);
/** HUD corner brackets around a box (lock-on target). `p` 0..1 closes them in from 40px out. */
export const Lock: React.FC<{x: number; y: number; w: number; h: number; p?: number; color?: string}> = ({x, y, w, h, p = 1, color = Q.red}) => {
  if (p <= 0) return null;
  const o = (1 - p) * 40;
  const L = 34;
  const s = {position: 'absolute' as const, width: L, height: L, borderColor: color, borderStyle: 'solid', opacity: clamp01(p * 2), filter: `drop-shadow(0 0 8px ${color})`};
  return (
    <>
      <div style={{...s, left: x - o, top: y - o, borderWidth: '6px 0 0 6px'}} />
      <div style={{...s, left: x + w - L + o, top: y - o, borderWidth: '6px 6px 0 0'}} />
      <div style={{...s, left: x - o, top: y + h - L + o, borderWidth: '0 0 6px 6px'}} />
      <div style={{...s, left: x + w - L + o, top: y + h - L + o, borderWidth: '0 6px 6px 0'}} />
    </>
  );
};
/** Horizontal scan beam sweeping from y0 to y1 over `dur` frames starting at f=0. */
export const Scan: React.FC<{f: number; x: number; w: number; y0: number; y1: number; dur?: number; color?: string}> = ({f, x, w, y0, y1, dur = 40, color = Q.green}) => {
  if (f < 0 || f > dur + 8) return null;
  const y = lerp(y0, y1, EASE(clamp01(f / dur)));
  const o = clamp01((dur + 8 - f) / 8);
  return (
    <>
      <div style={{position: 'absolute', left: x, top: y - 90, width: w, height: 90, background: `linear-gradient(180deg, ${color}00, ${color}40)`, opacity: o}} />
      <div style={{position: 'absolute', left: x, top: y - 3, width: w, height: 6, background: color, boxShadow: glow(color), opacity: o}} />
    </>
  );
};

// ------------------------------------------------------------------ number particles
export type Pt = {x: number; y: number};
/** Grid of points (cols × rows) starting at (x, y). */
export const gridPts = (x: number, y: number, cols: number, rows: number, dx: number, dy: number): Pt[] =>
  Array.from({length: cols * rows}, (_, i) => ({x: x + (i % cols) * dx, y: y + Math.floor(i / cols) * dy}));
/** Points along a circle. */
export const ringPts = (cx: number, cy: number, r: number, n: number, ry = r): Pt[] =>
  Array.from({length: n}, (_, i) => ({x: cx + Math.cos((i / n) * Math.PI * 2) * r, y: cy + Math.sin((i / n) * Math.PI * 2) * ry}));

/**
 * Number particles flying in from scattered spots off-screen and settling on `to`. `f` = frames since the swarm starts;
 * each particle takes `dur` frames, staggered over `spread`. After landing they shimmer. `out` > 0 scatters them again.
 */
export const Swarm: React.FC<{f: number; to: Pt[]; pool: string[]; seed?: number; dur?: number; spread?: number; size?: number; color?: string; out?: number; hot?: (i: number) => boolean; hotColor?: string}> = ({
  f,
  to,
  pool,
  seed = 1,
  dur = 30,
  spread = 30,
  size = 22,
  color = Q.green,
  out = -1,
  hot,
  hotColor = Q.red,
}) => {
  if (f < -1) return null;
  const r = rng(seed);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', overflow: 'visible'}}>
      {to.map((p, i) => {
        const a = r() * Math.PI * 2;
        const d = 900 + r() * 700;
        const sx = 540 + Math.cos(a) * d;
        const sy = 820 + Math.sin(a) * d;
        const delay = r() * spread;
        const k = EASE(clamp01((f - delay) / dur));
        const o2 = out >= 0 ? EASE(clamp01((out - r() * 10) / 24)) : 0;
        const ex = p.x + Math.cos(a) * 1100 * o2;
        const ey = p.y + Math.sin(a) * 1100 * o2;
        const x = lerp(sx, ex, k) + Math.sin(f / 9 + i) * 1.5 * k;
        const y = lerp(sy, ey, k);
        const isHot = hot ? hot(i) : false;
        const c = isHot ? hotColor : color;
        const op = clamp01(k * 1.5) * (0.45 + 0.55 * ((i * 37) % 10) / 10 + (isHot ? 0.5 : 0)) * (1 - o2 * 0.6);
        return (
          <text key={i} x={x} y={y} fontFamily={FONT_MONO} fontSize={size * (isHot ? 1.2 : 1)} fontWeight={700} fill={c} opacity={Math.min(1, op)} textAnchor="middle" style={isHot ? {filter: `drop-shadow(0 0 6px ${c})`} : undefined}>
            {pool[(i * 7 + seed) % pool.length]}
          </text>
        );
      })}
    </svg>
  );
};
/** Light streaks rushing toward (cx, cy): the "everything converges" moment. */
export const Streaks: React.FC<{f: number; cx: number; cy: number; n?: number; seed?: number; color?: string; dur?: number}> = ({f, cx, cy, n = 36, seed = 4, color = Q.green, dur = 26}) => {
  if (f < 0 || f > dur) return null;
  const r = rng(seed);
  const t = f / dur;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      {Array.from({length: n}, (_, i) => {
        const a = r() * Math.PI * 2;
        const d0 = 1300 - (1100 + r() * 300) * t;
        const len = 140 + r() * 260;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * Math.max(80, d0)}
            y1={cy + Math.sin(a) * Math.max(80, d0)}
            x2={cx + Math.cos(a) * Math.max(80, d0 + len)}
            y2={cy + Math.sin(a) * Math.max(80, d0 + len)}
            stroke={color}
            strokeWidth={3}
            opacity={0.7 * (1 - t)}
          />
        );
      })}
    </svg>
  );
};

// ------------------------------------------------------------------ stage
/**
 * Every scene: black field with a faint scrolling rain of real numbers, a soft green bloom and a vignette; the content
 * zooms in a touch over the scene. `pool` = the numbers in the rain, `shake` offsets the content, `bloom` brightens.
 */
export const Field: React.FC<{children: React.ReactNode; pool: string[]; shake?: {dx: number; dy: number}; bloom?: number; cy?: number; rain?: number}> = ({
  children,
  pool,
  shake,
  bloom = 0,
  cy = 800,
  rain = 1,
}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const zoom = 1 + 0.018 * (frame / Math.max(1, scene.duration));
  const cols = 8;
  const lh = 46;
  return (
    <AbsoluteFill style={{background: Q.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.32 * rain}}>
        {Array.from({length: cols}, (_, c) => {
          const v = 0.6 + ((c * 37) % 7) / 6;
          const off = (frame * v * 1.4) % lh;
          return (
            <div key={c} style={{position: 'absolute', left: 20 + c * 136, top: -lh + off, fontFamily: FONT_MONO, fontSize: 24, lineHeight: `${lh}px`, color: Q.deep, whiteSpace: 'pre'}}>
              {Array.from({length: 44}, (_, k) => {
                const n = Math.floor(frame * v * 1.4 / lh);
                return <div key={k}>{pool[(k - n + c * 13 + 4400) % pool.length]}</div>;
              })}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 540 - 520, top: cy - 520, width: 1040, height: 1040, borderRadius: '50%', background: `radial-gradient(circle, rgba(0,255,163,${0.1 + bloom * 0.22}) 0%, rgba(0,255,163,0) 65%)`}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, rgba(5,9,12,0) 35%, rgba(5,9,12,0.9) 100%)'}} />
      <AbsoluteFill style={{transform: `translate(${shake?.dx ?? 0}px, ${shake?.dy ?? 0}px) scale(${zoom})`, transformOrigin: `540px ${cy}px`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ charts
/** A glowing vertical bar with its value on top; `p` 0..1 grows it. */
export const Bar: React.FC<{x: number; base: number; w: number; v: number; scale: number; p: number; color?: string; label?: string; dec?: number}> = ({x, base, w, v, scale, p, color = Q.green, label, dec = 1}) => {
  const h = v * scale * EASE(clamp01(p));
  return (
    <>
      <div style={{position: 'absolute', left: x, top: base - h, width: w, height: h, background: `linear-gradient(180deg, ${color}, ${color}55)`, boxShadow: `0 0 30px ${color}66`, borderRadius: '8px 8px 0 0'}} />
      <div style={{position: 'absolute', left: x - 60, width: w + 120, top: base - h - 74, textAlign: 'center', opacity: clamp01(p * 4)}}>
        <G size={60} num color={color} glow={0.6}>
          {(v * clamp01(p)).toFixed(dec)}
          {label ?? '%'}
        </G>
      </div>
    </>
  );
};
