// 渐变玻璃卡 (gradient glass) look: pastel mesh background with floating translucent orbs and rounded glass cards.
// For product features, model comparisons, tiers, "two new models" (docs/reference/ai-news-explainer-style.md, `glass`).
// The orbs bob and the mesh drifts, so a held layout keeps moving.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_ZH} from '@atv/lib/theme';
import {prog} from '@atv/lib/timing';
import {Abs} from './stylemix';

export const GL = {
  pink: '#F9C9DD',
  lilac: '#CDB8F7',
  sky: '#9CC6FB',
  mint: '#BFEBDC',
  ink: '#1E1B2E',
  sub: '#6A6585',
  accent: '#6C4DF0',
};

/** Pastel mesh. `stops` are three colours; the blobs wander slowly. */
export const GlassBg: React.FC<{stops?: [string, string, string]; orbs?: boolean}> = ({stops = [GL.pink, GL.lilac, GL.sky], orbs = true}) => {
  const frame = useCurrentFrame();
  const s = (k: number, a: number) => Math.sin(frame / k) * a;
  return (
    <AbsoluteFill style={{background: `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 52%, ${stops[2]} 100%)`}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at ${25 + s(120, 8)}% ${30 + s(90, 6)}%, rgba(255,255,255,0.55), transparent 55%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at ${78 + s(100, 6)}% ${70 + s(130, 8)}%, rgba(255,255,255,0.35), transparent 50%)`}} />
      {orbs && (
        <>
          <Orb x={1740} y={110 + s(40, 10)} r={70} c1="#E6F0FF" c2="#7FA6F5" />
          <Orb x={1380} y={20 + s(55, 8)} r={34} c1="#FFE3EC" c2="#F28DB0" />
          <Orb x={120} y={960 + s(48, 9)} r={46} c1="#EFE6FF" c2="#A58BF0" />
        </>
      )}
    </AbsoluteFill>
  );
};

export const Orb: React.FC<{x: number; y: number; r: number; c1: string; c2: string}> = ({x, y, r, c1, c2}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle at 32% 28%, #fff 0%, ${c1} 28%, ${c2} 100%)`, boxShadow: `0 ${r * 0.3}px ${r * 0.6}px rgba(80,60,160,0.25)`}} />
);

/** Frosted card with a white hairline; slides up on entry. */
export const GlassCard: React.FC<{x: number; y: number; w: number; h: number; f: number; tint?: string; children?: React.ReactNode; pad?: number}> = ({x, y, w, h, f, tint = 'rgba(255,255,255,0.62)', children, pad = 30}) => {
  const p = prog(f, 16);
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - p) * 40, width: w, height: h, borderRadius: 28, background: tint, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 18px 44px rgba(90,70,170,0.18)', padding: pad, boxSizing: 'border-box', opacity: p}}>
      {children}
    </div>
  );
};

/** Product tile: a gradient swatch standing for a model / product image, with its name along the bottom. */
export const Tile: React.FC<{x: number; y: number; w: number; h: number; f: number; from: string; to: string; name: string; tag?: string}> = ({x, y, w, h, f, from, to, name, tag}) => {
  const frame = useCurrentFrame();
  const p = prog(f, 16);
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - p) * 40, width: w, height: h, borderRadius: 28, background: `conic-gradient(from ${frame * 1.2}deg at 50% 45%, ${from}, ${to}, ${from})`, boxShadow: '0 18px 44px rgba(60,60,180,0.28)', opacity: p, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.7)'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.75), transparent 45%)'}} />
      {tag && <div style={{position: 'absolute', left: 24, top: 18, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 20, color: 'rgba(255,255,255,0.9)'}}>{tag}</div>}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center', fontFamily: FONT_ZH, fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 3px 14px rgba(40,30,120,0.45)'}}>{name}</div>
    </div>
  );
};

/** Title with an inline accent chip, e.g. 主打快 ⚡. */
export const GlassTitle: React.FC<{f: number; children: React.ReactNode; chip?: string; x?: number; y?: number; size?: number}> = ({f, children, chip, x = 100, y = 70, size = 60}) => (
  <Abs x={x} y={y} style={{opacity: prog(f, 12), transform: `translateY(${(1 - prog(f, 16)) * 20}px)`, display: 'flex', alignItems: 'center', gap: 16}}>
    <span style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, color: GL.ink}}>{children}</span>
    {chip && <span style={{padding: '4px 18px', borderRadius: 999, background: GL.accent, color: '#fff', fontFamily: FONT_ZH, fontWeight: 800, fontSize: 24}}>{chip}</span>}
  </Abs>
);
