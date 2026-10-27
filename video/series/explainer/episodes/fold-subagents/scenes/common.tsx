// Shared look for "何时把 subagent 并回主循环", modelled on the article's own diagrams (claude.com, 2026-10-22):
// a warm ivory page, flat stone-grey boxes, cream cards, a peach panel for "what we recommend", clay-orange squares for
// tools, uppercase mono labels and a small clay square ("packet") that travels along the hairline connectors.
// Headings use a serif (Lora + Noto Serif SC) like claude.com; labels stay in mono / sans.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_NUM, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene, useSpring} from '@atv/lib/timing';

// Background (lib/chrome) reads THEMES by name, so register before the first render. Light theme: dark subtitle box.
THEMES.claudeblog = {bg: '#FAF9F5', bg2: '#FAF9F5', accent: '#C9603F', accentSoft: '#F4DFD5', ink: '#141413'};

export const K = {
  page: '#FAF9F5',
  card: '#FFFFFF',
  stone: '#E8E6DC', // flat diagram boxes
  stone2: '#D3D1C7', // orchestrator bar
  cream: '#F4F0E8', // subagent cards
  peach: '#F4DFD5', // "recommended" panel
  clay: '#C9603F', // tool squares / accents (the article's rust)
  orange: '#D97757', // Claude orange
  ink: '#141413',
  dim: '#5E5D59',
  faint: '#8F8D86',
  line: '#B9B6AB',
  hair: 'rgba(20,20,19,0.10)',
  red: '#B5432E',
  green: '#4E7A51',
};

export const FONT_SERIF = '"Lora", "Noto Serif SC", "Songti SC", serif';
export {FONT_MONO, FONT_NUM, FONT_ZH, clamp01, prog};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ fonts
const SERIF_FONTS: [string, string, string][] = [
  ['Lora', 'fonts/Lora-VF.ttf', '400 700'],
  ['Noto Serif SC', 'fonts/NotoSerifSC-VF.ttf', '200 900'],
];
let serifPromise: Promise<void> | null = null;
const loadSerif = () => {
  if (!serifPromise) {
    serifPromise = Promise.all(
      SERIF_FONTS.map(async ([family, file, weight]) => {
        const f = new FontFace(family, `url(${staticFile(file)})`, {weight});
        try {
          await f.load();
          (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
        } catch {
          console.warn(`font ${file} missing — run fetch_fonts.sh`);
        }
      }),
    ).then(() => undefined);
  }
  return serifPromise;
};
export const useSerifFonts = () => {
  const [handle] = useState(() => delayRender('Loading serif fonts'));
  useEffect(() => {
    loadSerif().finally(() => continueRender(handle));
  }, [handle]);
};

// ------------------------------------------------------------------ text
type TxtProps = {children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties};
export const Zh: React.FC<TxtProps> = ({children, size = 30, color = K.ink, w = 600, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.35, ...style}}>{children}</span>
);
export const Serif: React.FC<TxtProps> = ({children, size = 56, color = K.ink, w = 700, style}) => (
  <span style={{fontFamily: FONT_SERIF, fontSize: size, fontWeight: w, color, lineHeight: 1.2, letterSpacing: size > 60 ? -1.5 : -0.5, ...style}}>{children}</span>
);
/** Uppercase mono label, like "TOOL CALLS" / "COMMON PATTERN" in the article's figures. */
export const Lab: React.FC<TxtProps> = ({children, size = 18, color = K.dim, w = 600, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
export const Mo: React.FC<TxtProps> = ({children, size = 24, color = K.ink, w = 500, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, whiteSpace: 'nowrap', ...style}}>{children}</span>
);

// ------------------------------------------------------------------ motion
export const rise = (f: number, delay = 0, dist = 22): React.CSSProperties => {
  const t = prog(f, 16, delay);
  return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
};
export const usePopIn = () => {
  const sp = useSpring();
  return (f: number, delay = 0, from = 0.86): React.CSSProperties => {
    const s = sp(f, delay, {damping: 18, stiffness: 170});
    return {opacity: clamp01(s * 1.5), transform: `scale(${from + (1 - from) * s})`};
  };
};
/** 0..1 while f is in [a, b) with short fades; for "visible during" states. */
export const during = (f: number, a: number, b: number, fade = 10) => clamp01(Math.min((f - a) / fade, (b - f) / fade));

// ------------------------------------------------------------------ shell
/**
 * Every scene: ivory page, faint dot grid, and a "slide" transition (content drifts up and sharpens in, drifts up and
 * softens out) so consecutive diagrams read like scrolling down the article.
 */
export const Shell: React.FC<{children: React.ReactNode; part?: string}> = ({children, part}) => {
  useSerifFonts();
  const frame = useCurrentFrame();
  const scene = useScene();
  const enter = prog(frame, 20);
  const exit = interpolate(frame, [scene.duration - 10, scene.duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});
  const veil = Math.max(1 - enter, exit);
  const dy = (1 - enter) * 40 - exit * 40;
  return (
    <AbsoluteFill style={{background: K.page}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(20,20,19,0.075) 1.4px, transparent 1.6px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '16px 16px',
        }}
      />
      <AbsoluteFill style={{opacity: 1 - veil * 0.9, transform: `translateY(${dy}px)`, filter: veil > 0.05 ? `blur(${veil * 6}px)` : undefined}}>{children}</AbsoluteFill>
      {part && <PartTag text={part} />}
    </AbsoluteFill>
  );
};

const PartTag: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', right: 80, top: 64, display: 'flex', alignItems: 'center', gap: 12, opacity: prog(frame, 14, 4)}}>
      <div style={{width: 12, height: 12, background: K.clay}} />
      <Lab size={18} color={K.dim}>
        {text}
      </Lab>
    </div>
  );
};

/** Scene header: mono kicker + serif title (+ grey sub) and a hairline rule. */
export const Head: React.FC<{kicker: string; title: React.ReactNode; sub?: React.ReactNode; f?: number}> = ({kicker, title, sub, f}) => {
  const frame = useCurrentFrame();
  const g = f ?? frame;
  const t = prog(g, 16, 4);
  return (
    <>
      <div style={{position: 'absolute', left: 96, top: 58}}>
        <div style={{opacity: prog(g, 14)}}>
          <Lab size={19} color={K.clay} w={700}>
            {kicker}
          </Lab>
        </div>
        <div style={{opacity: t, transform: `translateY(${(1 - t) * 16}px)`, marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 26, whiteSpace: 'nowrap'}}>
          <Serif size={58}>{title}</Serif>
          {sub && (
            <Zh size={26} w={500} color={K.dim}>
              {sub}
            </Zh>
          )}
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, right: 96, top: 180, height: 1.5, background: K.hair, transform: `scaleX(${prog(g, 24, 6)})`, transformOrigin: 'left'}} />
    </>
  );
};

/** One-line source note above the subtitle band. */
export const SrcLine: React.FC<{children: React.ReactNode; f: number; left?: number}> = ({children, f, left = 96}) => (
  <div style={{position: 'absolute', left, bottom: 150, opacity: 0.95 * prog(f, 14), whiteSpace: 'nowrap'}}>
    <span style={{fontFamily: FONT_ZH, fontSize: 19, fontWeight: 500, color: K.faint}}>{children}</span>
  </div>
);

export const Illus: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: 17, fontWeight: 700, color: K.dim, background: K.stone, borderRadius: 6, padding: '1px 8px', ...style}}>示意</span>
);

// ------------------------------------------------------------------ diagram pieces
type BoxProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  children?: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties;
  radius?: number;
  center?: boolean;
};
/** Flat box at absolute coords (the article's stone / cream / peach rectangles). */
export const Box: React.FC<BoxProps> = ({x, y, w, h, children, bg = K.stone, style, radius = 6, center = true}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: bg,
      borderRadius: radius,
      boxSizing: 'border-box',
      display: center ? 'flex' : 'block',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: center ? 'center' : 'left',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Hairline connector drawn as it grows (p 0..1). Points are absolute; draws an arrowhead at the end if `arrow`. */
export const Wire: React.FC<{pts: [number, number][]; p?: number; color?: string; width?: number; arrow?: boolean; dash?: boolean}> = ({
  pts,
  p = 1,
  color = K.line,
  width = 2,
  arrow = false,
  dash = false,
}) => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const d = 'M ' + pts.map((q) => `${q[0]} ${q[1]}`).join(' L ');
  const end = pointAt(pts, clamp01(p));
  const prev = pointAt(pts, clamp01(p - 0.001 - 6 / Math.max(total, 1)));
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1} height={1}>
      <path
        d={d}
        stroke={color}
        strokeWidth={width}
        fill="none"
        strokeDasharray={dash ? '7 7' : `${total} ${total}`}
        strokeDashoffset={dash ? 0 : total * (1 - clamp01(p))}
        opacity={dash ? clamp01(p * 3) : 1}
      />
      {arrow && p > 0.02 && (
        <path
          d="M -9 -6 L 0 0 L -9 6"
          stroke={color}
          strokeWidth={width}
          fill="none"
          transform={`translate(${end[0]} ${end[1]}) rotate(${(ang * 180) / Math.PI})`}
        />
      )}
    </svg>
  );
};

export const pointAt = (pts: [number, number][], t: number): [number, number] => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (left <= segs[i] || i === segs.length - 1) {
      const k = segs[i] === 0 ? 0 : Math.min(1, left / segs[i]);
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    left -= segs[i];
  }
  return pts[pts.length - 1];
};

/** The clay square that travels along a path (t 0..1), like the request marker in the article's GIFs. */
export const Packet: React.FC<{pts: [number, number][]; t: number; size?: number; color?: string}> = ({pts, t, size = 14, color = K.clay}) => {
  if (t <= 0 || t >= 1) return null;
  const [x, y] = pointAt(pts, EASE(clamp01(t)));
  return <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, background: color}} />;
};

/** Clay tool square (filled) or a dashed "deferred" one. */
export const ToolSq: React.FC<{x: number; y: number; s?: number; dashed?: boolean; o?: number}> = ({x, y, s = 40, dashed, o = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: s,
      height: s,
      background: dashed ? 'transparent' : K.clay,
      border: dashed ? `2px dashed ${K.clay}` : undefined,
      boxSizing: 'border-box',
      opacity: o,
    }}
  />
);

/** Dashed placeholder that shows where a card will land; visible from `f` until `gone` (both beat-relative frames). */
export const Ghost: React.FC<{x: number; y: number; w: number; h: number; f: number; gone: number; delay?: number; radius?: number}> = ({x, y, w, h, f, gone, delay = 0, radius = 16}) => {
  const o = prog(f, 12, delay) * (1 - prog(gone, 10));
  if (o <= 0.01) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius, border: `2px dashed ${K.line}`, opacity: o, boxSizing: 'border-box'}} />;
};

/** Rounded pill like the "skill" / "tool" chips in the article's third figure. */
export const Pill: React.FC<{children: React.ReactNode; bg?: string; color?: string; style?: React.CSSProperties; border?: string}> = ({
  children,
  bg = '#FFFFFF',
  color = K.ink,
  style,
  border = 'rgba(20,20,19,0.12)',
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: FONT_ZH,
      fontSize: 24,
      fontWeight: 600,
      color,
      background: bg,
      border: `1.5px solid ${border}`,
      borderRadius: 999,
      padding: '6px 20px',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

/** White card with a soft border for text-heavy panels. */
export const Card: React.FC<{children?: React.ReactNode; style?: React.CSSProperties; hot?: boolean}> = ({children, style, hot}) => (
  <div
    style={{
      background: hot ? K.peach : K.card,
      border: `1.5px solid ${hot ? 'rgba(201,96,63,0.35)' : 'rgba(20,20,19,0.09)'}`,
      borderRadius: 18,
      boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 10px 28px rgba(60,40,20,0.05)',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small numbered badge in clay. */
export const NumBadge: React.FC<{n: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({n, size = 44, style}) => (
  <div
    style={{
      width: size,
      height: size,
      background: K.clay,
      color: '#fff',
      fontFamily: FONT_MONO,
      fontWeight: 700,
      fontSize: size * 0.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      ...style,
    }}
  >
    {n}
  </div>
);
