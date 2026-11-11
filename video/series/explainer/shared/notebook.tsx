// 螺旋笔记本 + 黑板 (notebook and chalkboard) interludes (docs/reference/ai-news-explainer-style.md, `notebook` / `chalk`).
// Notebook: grey desk, grid paper with a spiral binding, index tabs, sticky notes, red-pen circles, a FIG tag.
// Chalk: the dark twin of shared/whiteboard.tsx; chalk text writes itself letter by letter.
// Both keep moving: the desk vignette breathes, pen strokes draw, chalk dust drifts.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_ZH} from '@atv/lib/theme';
import {clamp01, prog} from '@atv/lib/timing';
import {Abs} from './stylemix';

export const NB = {
  desk: '#3A3F46',
  paper: '#F4F5F0',
  grid: 'rgba(60,90,120,0.14)',
  pen: '#D93A2B',
  ink: '#1D2530',
  sticky: '#BDEBD3',
  stickyY: '#FBE58A',
  stickyP: '#F8C6D2',
  tab: ['#E9B949', '#6CB6A0', '#E48A8A'],
};
export const CH = {board: '#2B2E2C', wood: '#5B4126', chalk: '#EDEBE3', pink: '#F2A1A1', yellow: '#F5D97A', blue: '#9CC8F2'};

/** Desk + notebook page. The paper occupies x 80..1840, y 70..1010; put content inside that. */
export const NotebookBg: React.FC<{f?: number}> = ({f = 99}) => {
  const frame = useCurrentFrame();
  const rings = Array.from({length: 46});
  const open = prog(f, 16);
  return (
    <AbsoluteFill style={{background: NB.desk}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% ${48 + Math.sin(frame / 50) * 2}%, rgba(255,255,255,0.08), rgba(0,0,0,0.42))`}} />
      <div style={{position: 'absolute', left: 80, top: 70 + (1 - open) * 30, width: 1760, height: 940, background: NB.paper, borderRadius: 10, boxShadow: '0 18px 44px rgba(0,0,0,0.45)', backgroundImage: `linear-gradient(${NB.grid} 1px, transparent 1px), linear-gradient(90deg, ${NB.grid} 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: open}} />
      <div style={{position: 'absolute', left: 80, top: 52 + (1 - open) * 30, width: 1760, display: 'flex', justifyContent: 'space-between', padding: '0 28px', boxSizing: 'border-box', opacity: open}}>
        {rings.map((_, i) => (
          <span key={i} style={{width: 11, height: 38, borderRadius: 6, background: 'linear-gradient(#EDEDED,#8C8C8C)', boxShadow: '0 3px 4px rgba(0,0,0,0.5)'}} />
        ))}
      </div>
      {NB.tab.map((c, i) => (
        <div key={c} style={{position: 'absolute', left: 1832, top: 300 + i * 120, width: 54, height: 92, borderRadius: '0 10px 10px 0', background: c, boxShadow: '3px 4px 8px rgba(0,0,0,0.35)', opacity: open}} />
      ))}
      <div style={{position: 'absolute', left: 1500, top: 1000, width: 360, height: 22, background: 'linear-gradient(#F2C14E,#D99A2B)', transform: 'rotate(-14deg)', borderRadius: 4, boxShadow: '0 4px 8px rgba(0,0,0,0.4)', opacity: open}} />
    </AbsoluteFill>
  );
};

/** Handwritten-looking title on the paper. */
export const PageTitle: React.FC<{f: number; children: React.ReactNode; x?: number; y?: number; size?: number}> = ({f, children, x = 150, y = 100, size = 60}) => (
  <Abs x={x} y={y} style={{opacity: prog(f, 12), transform: `translateX(${(1 - prog(f, 14)) * -24}px)`}}>
    <span style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, color: NB.ink}}>{children}</span>
  </Abs>
);

/** Sticky note, slightly rotated, drops onto the page. */
export const Sticky: React.FC<{x: number; y: number; w: number; h?: number; f: number; bg?: string; rot?: number; children: React.ReactNode}> = ({x, y, w, h, f, bg = NB.sticky, rot = -1.5, children}) => {
  const p = prog(f, 12);
  return (
    <div style={{position: 'absolute', left: x, top: y - (1 - p) * 50, width: w, height: h, background: bg, padding: '22px 26px', boxSizing: 'border-box', borderRadius: 4, boxShadow: '4px 8px 16px rgba(0,0,0,0.25)', transform: `rotate(${rot * (0.3 + 0.7 * p)}deg)`, opacity: p, fontFamily: FONT_ZH, fontWeight: 700, fontSize: 32, color: NB.ink, lineHeight: 1.4}}>
      <div style={{position: 'absolute', left: '50%', top: -12, width: 90, height: 26, marginLeft: -45, background: 'rgba(255,255,255,0.55)', transform: 'rotate(-3deg)'}} />
      {children}
    </div>
  );
};

/** Red-pen circle drawn in one stroke around a box (cx, cy, rx, ry). */
export const RedCircle: React.FC<{cx: number; cy: number; rx: number; ry: number; f: number; color?: string; w?: number}> = ({cx, cy, rx, ry, f, color = NB.pen, w = 5}) => {
  const p = prog(f, 16);
  const d = `M${cx - rx * 0.2} ${cy - ry} C${cx + rx * 1.2} ${cy - ry * 1.1}, ${cx + rx * 1.15} ${cy + ry * 1.1}, ${cx - rx * 0.1} ${cy + ry} C${cx - rx * 1.2} ${cy + ry * 0.95}, ${cx - rx * 1.2} ${cy - ry * 0.95}, ${cx + rx * 0.35} ${cy - ry * 0.98}`;
  const len = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * 1.12;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={1920} height={1080}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

/** `FIG 4` tab in the top right corner of the page. */
export const FigTab: React.FC<{f: number; n: number | string; label?: string}> = ({f, n, label}) => (
  <Abs x={1700} y={96} style={{opacity: prog(f, 10), transform: `scale(${0.8 + 0.2 * prog(f, 10)})`}}>
    <div style={{background: NB.ink, color: '#fff', borderRadius: 26, padding: '8px 20px', textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 800, fontSize: 22, lineHeight: 1.15, boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
      FIG {n}
      {label && <div style={{fontFamily: FONT_ZH, fontWeight: 700, fontSize: 18, opacity: 0.85}}>{label}</div>}
    </div>
  </Abs>
);

// ------------------------------------------------------------------ chalkboard
export const ChalkBg: React.FC<{title?: string}> = ({title}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: CH.wood}}>
      <div style={{position: 'absolute', left: 36, top: 30, right: 36, bottom: 70, background: CH.board, borderRadius: 6, boxShadow: 'inset 0 0 90px rgba(0,0,0,0.55)'}}>
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1.4px, transparent 1.6px)', backgroundSize: '31px 29px', backgroundPosition: `${frame * 0.2}px ${frame * 0.12}px`, opacity: 0.8}} />
        <AbsoluteFill style={{background: `radial-gradient(ellipse at ${30 + Math.sin(frame / 90) * 8}% 40%, rgba(255,255,255,0.06), transparent 60%)`}} />
      </div>
      <div style={{position: 'absolute', left: 120, bottom: 22, width: 480, height: 14, background: '#7a5a38', borderRadius: 4}}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{position: 'absolute', left: 40 + i * 120, top: -10, width: 64, height: 12, borderRadius: 6, background: [CH.chalk, CH.pink, CH.yellow][i]}} />
        ))}
      </div>
      {title && <ChalkText f={0} x={96} y={70} size={60}>{title}</ChalkText>}
    </AbsoluteFill>
  );
};

/** Chalk lettering that writes itself (cps = characters per second at 30 fps), with a slightly uneven edge. */
export const ChalkText: React.FC<{f: number; x: number; y: number; children: string; size?: number; color?: string; cps?: number; w?: number}> = ({f, x, y, children, size = 48, color = CH.chalk, cps = 14, w}) => {
  const n = Math.floor(clamp01(f / 30 / (children.length / cps)) * children.length);
  return (
    <Abs x={x} y={y} w={w} style={{fontFamily: FONT_ZH, fontWeight: 700, fontSize: size, color, lineHeight: 1.4, textShadow: `0 0 1px ${color}, 1px 1px 0 rgba(255,255,255,0.18), -1px 0 0 rgba(255,255,255,0.12)`, opacity: 0.94, whiteSpace: 'pre-wrap'}}>
      {children.slice(0, n)}
      {n < children.length && f > 0 && <span style={{opacity: 0.6}}>▍</span>}
    </Abs>
  );
};

/** Chalk underline / box that draws on. */
export const ChalkLine: React.FC<{x1: number; y1: number; x2: number; y2: number; f: number; color?: string; w?: number}> = ({x1, y1, x2, y2, f, color = CH.pink, w = 6}) => {
  const p = prog(f, 14);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={1920} height={1080}>
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={0.9} />
    </svg>
  );
};
