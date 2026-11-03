// Episode look: the shared whiteboard kit (../../../shared/whiteboard.tsx) plus this episode's small parts.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Box, Hd, Mo, prog, TypeLine, W, Zh} from '../../../shared/whiteboard';

export * from '../../../shared/whiteboard';

/** Dark terminal card; `lines[i] = [text, startFrame, color?]` typed in one after another. */
export const Term: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  title?: string;
  lines: [string, number, string?][];
  size?: number;
  cps?: number;
  seed?: number;
}> = ({x, y, w, h, p, title, lines, size = 24, cps = 60, seed = 90}) => (
  <Box x={x} y={y} w={w} h={h} p={p} seed={seed} bg={W.term} pad="20px 28px">
    {title && (
      <div style={{marginBottom: 8}}>
        <Zh size={20} color={W.faint}>
          {title}
        </Zh>
      </div>
    )}
    {lines.map(([t, f, c], i) => (
      <TypeLine key={i} text={t} f={f} cps={cps} size={size} color={c ?? W.termInk} />
    ))}
  </Box>
);

/** Rounded marker pill. */
export const Pill: React.FC<{children: React.ReactNode; bg?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = W.card, size = 24, style}) => (
  <span style={{background: bg, border: `3px solid ${W.ink}`, borderRadius: 12, padding: '4px 14px', display: 'inline-block', ...style}}>
    <Zh size={size} w={600}>
      {children}
    </Zh>
  </span>
);

/** Red rubber stamp that thumps in at f. */
export const Stamp: React.FC<{x: number; y: number; f: number; children: React.ReactNode; size?: number; rot?: number; color?: string}> = ({x, y, f, children, size = 38, rot = -6, color = W.red}) => {
  const t = prog(f, 12);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: t, transform: `rotate(${rot}deg) scale(${1.35 - 0.35 * t})`}}>
      <div style={{border: `5px solid ${color}`, borderRadius: 12, padding: '2px 18px', background: 'rgba(251,248,241,0.92)'}}>
        <Hd size={size} color={color} style={{whiteSpace: 'nowrap'}}>
          {children}
        </Hd>
      </div>
    </div>
  );
};

/** A list item that slides in with a marker dot. */
export const Item: React.FC<{f: number; children: React.ReactNode; size?: number; color?: string; dot?: string}> = ({f, children, size = 28, color = W.ink, dot = W.clay}) => {
  const t = prog(f, 14);
  return (
    <div style={{display: 'flex', gap: 14, alignItems: 'baseline', marginTop: 12, opacity: t, transform: `translateX(${(1 - t) * 24}px)`}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: dot, flexShrink: 0, transform: 'translateY(-4px)'}} />
      <Zh size={size} color={color}>
        {children}
      </Zh>
    </div>
  );
};

/** Keeps a frame counter handy for scenes that only need beats. */
export const useF = () => useCurrentFrame();
