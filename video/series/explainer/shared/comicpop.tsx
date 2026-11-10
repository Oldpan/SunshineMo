// 美漫波普 (comic pop) interlude: halftone dot field, thick ink outlines, hard offset shadows, starbursts, speech bubbles.
// For pain points, community reactions and "it just arrived" moments (docs/reference/ai-news-explainer-style.md, `comic`).
// Keep a run under ~15 s: it carries emotion, not data. Dots drift and the burst turns slowly, so held lines still move.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT_ZH} from '@atv/lib/theme';
import {prog, useSpring} from '@atv/lib/timing';
import {Abs} from './stylemix';

export const CP = {
  cyan: '#35C5F1',
  yellow: '#FFD23F',
  panel: '#FEF5E1',
  ink: '#2C3243',
  red: '#E8412F',
  white: '#FFFFFF',
  pink: '#FF7AA8',
};
export const INK = 5; // outline width, px

/** Halftone field: two dot layers drifting in opposite directions. `color` is the dot colour over `bg`. */
export const HalftoneBg: React.FC<{bg?: string; color?: string; size?: number}> = ({bg = CP.cyan, color = 'rgba(255,255,255,0.45)', size = 22}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: bg}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${color} 4px, transparent 4.5px)`,
          backgroundSize: `${size}px ${size}px`,
          backgroundPosition: `${frame * 0.5}px ${frame * 0.3}px`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(0,0,0,0.10) 3px, transparent 3.5px)`,
          backgroundSize: `${size * 1.6}px ${size * 1.6}px`,
          backgroundPosition: `${-frame * 0.35}px ${frame * 0.2}px`,
          maskImage: 'radial-gradient(ellipse at 50% 50%, transparent 35%, black 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, transparent 35%, black 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Inked panel with a hard offset shadow. */
export const InkPanel: React.FC<{x: number; y: number; w: number; h?: number; f: number; bg?: string; rot?: number; children?: React.ReactNode; pad?: number}> = ({
  x,
  y,
  w,
  h,
  f,
  bg = CP.panel,
  rot = 0,
  children,
  pad = 26,
}) => {
  const sp = useSpring();
  const s = sp(f, 0, {damping: 11, stiffness: 190});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: bg,
        border: `${INK}px solid ${CP.ink}`,
        borderRadius: 14,
        boxShadow: `10px 10px 0 ${CP.ink}`,
        padding: pad,
        transform: `rotate(${rot}deg) scale(${0.6 + 0.4 * s})`,
        opacity: Math.min(1, s * 2),
        fontFamily: FONT_ZH,
        color: CP.ink,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

/** Starburst with a big word; pops in, then keeps turning slowly. */
export const Burst: React.FC<{x: number; y: number; r?: number; f: number; color?: string; children: React.ReactNode; size?: number; points?: number}> = ({
  x,
  y,
  r = 330,
  f,
  color = CP.yellow,
  children,
  size = 120,
  points = 18,
}) => {
  const sp = useSpring();
  const frame = useCurrentFrame();
  const s = sp(f, 0, {damping: 9, stiffness: 160});
  const pts = Array.from({length: points * 2}).map((_, i) => {
    const a = (i / (points * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.74;
    return `${(Math.cos(a) * rr + r).toFixed(1)},${(Math.sin(a) * rr + r).toFixed(1)}`;
  });
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${s}) rotate(${-6 + Math.sin(frame / 40) * 3}deg)`}}>
      <svg width={r * 2} height={r * 2} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <polygon points={pts.join(' ')} fill={CP.ink} transform="translate(10 10)" />
        <polygon points={pts.join(' ')} fill={color} stroke={CP.ink} strokeWidth={INK} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, color: CP.red, lineHeight: 1.05, WebkitTextStroke: `4px ${CP.ink}`, paintOrder: 'stroke fill'}}>
        {children}
      </div>
    </div>
  );
};

/** Speech bubble; the tail points at (tx, ty) in page coordinates. */
export const Bubble: React.FC<{x: number; y: number; w: number; h?: number; f: number; tx: number; ty: number; children: React.ReactNode; size?: number}> = ({x, y, w, h = 150, f, tx, ty, children, size = 56}) => {
  const sp = useSpring();
  const s = sp(f, 0, {damping: 12, stiffness: 200});
  const cx = x + w / 2;
  const cy = y + h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  const L = Math.hypot(dx, dy) || 1;
  const bx = cx + (dx / L) * 40;
  const by = cy + (dy / L) * 40;
  const nx = -dy / L;
  const ny = dx / L;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none', transformOrigin: `${cx}px ${cy}px`, transform: `scale(${0.5 + 0.5 * s})`, opacity: Math.min(1, s * 2)}}>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <polygon points={`${bx + nx * 38},${by + ny * 38} ${tx},${ty} ${bx - nx * 38},${by - ny * 38}`} fill="#fff" stroke={CP.ink} strokeWidth={INK} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#fff', border: `${INK}px solid ${CP.ink}`, borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px', boxSizing: 'border-box', fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, color: CP.ink, lineHeight: 1.2}}>
        {children}
      </div>
    </div>
  );
};

/** Slanted headline label with a hard shadow, e.g. 「没有项目的时候……」. */
export const Banner: React.FC<{x: number; y: number; f: number; children: React.ReactNode; bg?: string; size?: number; rot?: number}> = ({x, y, f, children, bg = CP.yellow, size = 52, rot = -2}) => {
  const p = prog(f, 10);
  return (
    <Abs x={x} y={y} style={{opacity: p, transform: `rotate(${rot}deg) translateX(${(1 - p) * -60}px)`}}>
      <div style={{display: 'inline-block', background: bg, border: `${INK}px solid ${CP.ink}`, boxShadow: `8px 8px 0 ${CP.ink}`, padding: '8px 30px', fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, color: CP.ink}}>{children}</div>
    </Abs>
  );
};

/** Red hand-stamped word slammed diagonally across something. */
export const InkStamp: React.FC<{x: number; y: number; f: number; children: React.ReactNode; size?: number; rot?: number}> = ({x, y, f, children, size = 64, rot = -9}) => {
  const p = prog(f, 8);
  return (
    <Abs x={x} y={y} style={{opacity: p * 0.92, transform: `rotate(${rot}deg) scale(${1.5 - 0.5 * p})`, mixBlendMode: 'multiply'}}>
      <div style={{border: `7px solid ${CP.red}`, color: CP.red, padding: '2px 22px', fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, whiteSpace: 'nowrap', borderRadius: 6}}>{children}</div>
    </Abs>
  );
};

/** A few sweat drops that fall from a point, for the "oh no" face. */
export const Sweat: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => (
  <>
    {[0, 1, 2].map((i) => {
      const t = ((f - i * 9) % 36) / 36;
      const on = f > 0 && t >= 0;
      return (
        <div key={i} style={{position: 'absolute', left: x + i * 34 - 20, top: y + t * 70, width: 18, height: 28, borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%', background: '#9ADCF5', border: `3px solid ${CP.ink}`, opacity: on ? 1 - t * 0.9 : 0}} />
      );
    })}
  </>
);
