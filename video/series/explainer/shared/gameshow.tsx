// Shared `gameshow` look for 讲透 episodes (first made for ai-jobs-safe): a flat-vector variety / quiz show.
// Grammar borrowed from the lemo-opuscar `game-show` style (MIT): candy-coloured sets with stripes, dots or a sunburst,
// one heavy ink outline, hard offset shadows (no gradients, no blur), toy "bean" contestants that hop on a fixed beat,
// round cards, corner sticker banners, outlined telop words and a judgement word when a round is won.
// Re-implemented here for Remotion: everything is a pure function of the frame, timed off the narration beats.
// Real photos and screenshots sit on the set inside an LED screen / news tile with their credit underneath.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {THEMES} from '@atv/lib/theme';
import {useScene} from '@atv/lib/timing';

// Light themes keep the dark subtitle plate; the set paints over the whole frame anyway.
THEMES.gameshow = {bg: '#FFB870', bg2: '#FFB870', accent: '#FF5A5F', accentSoft: '#FFE3C2', ink: '#1B1B1B'};

export const K = {
  ol: '#1B1B1B',
  white: '#FFFFFF',
  cream: '#FFF6E5',
  yellow: '#FFD23F',
  orange: '#FF8C42',
  red: '#FF5A5F',
  pink: '#FF8FB1',
  purple: '#6B4FBB',
  purpleD: '#46318F',
  teal: '#3FB8AF',
  tealD: '#2B8F88',
  blue: '#4D7CFE',
  navy: '#26264A',
  sky: '#8ED1FC',
  green: '#5BD68A',
  lime: '#C6F16D',
  wood: '#C98A52',
  gray: '#C3CAD9',
  skin: '#FFD1A8',
  steel: '#A7AFC2',
};

export const F_ROUND = '"Fredoka", "Noto Sans SC", sans-serif';
export const F_CJK = '"Noto Sans SC", sans-serif';
export const F_HAND = '"ZCOOL KuaiLe", "Noto Sans SC", sans-serif';
export const OW = 8;
export const SO = {stroke: K.ol, strokeWidth: OW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// ------------------------------------------------------------------ fonts
let fontPromise: Promise<void> | null = null;
const loadFonts = () => {
  if (!fontPromise) {
    const f = new FontFace('Fredoka', `url(${staticFile('fonts/Fredoka-VF.ttf')})`, {weight: '300 700'});
    fontPromise = f
      .load()
      .then((ff) => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      })
      .catch(() => console.warn('fonts/Fredoka-VF.ttf missing — run scripts/session_start.sh'))
      .then(() =>
        Promise.all(['700 20px Fredoka', '900 20px "Noto Sans SC"', '400 20px "ZCOOL KuaiLe"'].map((s) => document.fonts.load(s, '第一关A1'))),
      )
      .then(() => undefined);
  }
  return fontPromise;
};
export const useGSFonts = () => {
  const [h] = useState(() => delayRender('gameshow fonts'));
  useEffect(() => {
    loadFonts().then(() => continueRender(h));
  }, [h]);
};

// ------------------------------------------------------------------ time helpers (frames, 30 fps)
export const BEAT = 15; // 120 BPM: idle hops and set motion run on this grid
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const seg = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
export const E = {
  out: (p: number) => 1 - Math.pow(1 - p, 3),
  in: (p: number) => p * p * p,
  back: (p: number) => {
    const c = 1.9;
    return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
  },
  inOut: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
};
/** Parabolic hop on the beat grid; `phase` 0.5 = off-beat. */
export const hopY = (f: number, h = 22, phase = 0) => {
  const x = (((f / BEAT + phase) % 1) + 1) % 1;
  return -h * 4 * x * (1 - x);
};
/** Damped squash after a hit at f0 (1 = rest). */
export const hitSq = (f: number, f0: number, amt = 0.2) => {
  const t = (f - f0) / 30;
  return t >= 0 && t < 0.4 ? 1 - amt * Math.exp(-t * 12) * Math.cos(t * 30) : 1;
};
/** Drop from the sky, landing at f0 + dur. Returns a y offset (≤ 0). */
export const dropY = (f: number, f0: number, dur = 9, h = 1100) => (f < f0 ? -h * 2 : -h * (1 - E.in(seg(f, f0, f0 + dur))));
/** Back-eased pop scale (0 → 1 with overshoot) starting at f0. */
export const popS = (f: number, f0: number, dur = 8) => (f < f0 ? 0 : E.back(seg(f, f0, f0 + dur)));
/** Visible between two frames (ease-in exit over the last 6 frames). */
export const outS = (f: number, f1: number, dur = 6) => 1 - E.in(seg(f, f1 - dur, f1));
/** Deterministic random. */
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/** Frames since each beat of the current scene started (negative before), plus the scene length. */
export const useBeatFrames = () => {
  const scene = useScene();
  const f = useCurrentFrame();
  return {f, b: scene.beats.map((x) => f - x.from), at: scene.beats.map((x) => x.from), dur: scene.duration};
};

/** Camera punch: tiny zoom at each beat start (decays in ~5 frames). Wrap a whole set in it. */
export const Punch: React.FC<{hits: number[]; amt?: number; children: React.ReactNode}> = ({hits, amt = 0.012, children}) => {
  const f = useCurrentFrame();
  let s = 0;
  for (const h of hits) if (f >= h && f < h + 10) s += amt * Math.exp(-(f - h) / 2.2);
  s = Math.min(s, 0.05);
  return <AbsoluteFill style={{transform: `scale(${1 + s})`, transformOrigin: '50% 45%'}}>{children}</AbsoluteFill>;
};

// ------------------------------------------------------------------ sets
export type SetName = 'tangerine' | 'teal' | 'purple' | 'pink' | 'sky' | 'lime' | 'navy' | 'yellow' | 'red' | 'mint';
export const SETS: Record<SetName, {bg: string; pat: string; floor: string; card: string}> = {
  tangerine: {bg: '#FFB870', pat: '#FFA85A', floor: '#E8894A', card: '#FF8C42'},
  teal: {bg: '#3FB8AF', pat: '#52C7BE', floor: '#2B8F88', card: '#2B8F88'},
  purple: {bg: '#6B4FBB', pat: '#7A5FCB', floor: '#46318F', card: '#8B6FE0'},
  pink: {bg: '#FF8FB1', pat: '#FFA3C0', floor: '#E56E95', card: '#FF5A8A'},
  sky: {bg: '#8ED1FC', pat: '#A2DAFD', floor: '#5AAFE6', card: '#4D7CFE'},
  lime: {bg: '#C6F16D', pat: '#D3F58B', floor: '#9CCB45', card: '#5BD68A'},
  navy: {bg: '#26264A', pat: '#FFD23F', floor: '#17172F', card: '#4D7CFE'},
  yellow: {bg: '#FFD23F', pat: '#FFDC63', floor: '#E8B820', card: '#FF8C42'},
  red: {bg: '#FF5A5F', pat: '#FF6E73', floor: '#D9434A', card: '#FF5A5F'},
  mint: {bg: '#9BE8C9', pat: '#AEEFD5', floor: '#62C9A0', card: '#3FB8AF'},
};

/** Full-frame set: saturated ground + moving pattern (+ optional floor band and scalloped curtain). */
export const GSSet: React.FC<{
  set: SetName;
  pattern?: 'stripes' | 'dots' | 'rays';
  floor?: number | null; // y of the floor line (null = no floor)
  curtain?: string | null; // curtain colour
}> = ({set, pattern = 'stripes', floor = 830, curtain = null}) => {
  const f = useCurrentFrame();
  const S = SETS[set];
  let pat: React.ReactNode = null;
  if (pattern === 'stripes') {
    const w = 60;
    const off = ((f * 1.6) % (w * 2)) - w * 2;
    let d = '';
    for (let x = -1600; x < 3600; x += w * 2) d += `M${x + off} -1400 h${w} v3900 h${-w} Z`;
    pat = (
      <g transform="rotate(-30 960 540)">
        <path d={d} fill={S.pat} />
      </g>
    );
  } else if (pattern === 'dots') {
    const step = 70;
    const r = 10;
    const oy = (f * 0.8) % step;
    let d = '';
    for (let y = -step; y < 1180; y += step)
      for (let x = ((Math.round(y / step) % 2) * step) / 2; x < 2000; x += step)
        d += `M${x - r} ${y + oy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
    pat = <path d={d} fill={S.pat} opacity={set === 'navy' ? 0.25 : 1} />;
  } else {
    const n = 28;
    let d = '';
    for (let i = 0; i < n; i += 2) {
      const a = (i / n) * Math.PI * 2;
      const da = Math.PI / n;
      d += `M0 0 L${Math.cos(a - da) * 1700} ${Math.sin(a - da) * 1700} L${Math.cos(a + da) * 1700} ${Math.sin(a + da) * 1700} Z`;
    }
    pat = (
      <g transform={`translate(960 520) rotate(${f * 0.25})`}>
        <path d={d} fill={S.pat} opacity={set === 'navy' ? 0.22 : 1} />
      </g>
    );
  }
  let cur: React.ReactNode = null;
  if (curtain) {
    let d = 'M0 0 H1920 V70';
    const n = 8;
    for (let i = n; i > 0; i--) {
      const x0 = (i / n) * 1920;
      const x1 = ((i - 1) / n) * 1920;
      d += ` Q${(x0 + x1) / 2} 150 ${x1} 70`;
    }
    d += ' Z';
    cur = <path d={d} fill={curtain} {...SO} strokeWidth={7} />;
  }
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <rect width={1920} height={1080} fill={S.bg} />
        {pat}
        {floor != null && (
          <g>
            <rect x={-10} y={floor} width={1940} height={1080 - floor + 10} fill={S.floor} />
            <line x1={-10} y1={floor} x2={1930} y2={floor} stroke={K.ol} strokeWidth={8} />
          </g>
        )}
        {cur}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ text
/** Outlined telop text (SVG): white/yellow fill with an ink stroke painted under it. */
export const Telop: React.FC<{
  x: number;
  y: number;
  size: number;
  children: React.ReactNode;
  fill?: string;
  stroke?: string;
  sw?: number;
  anchor?: 'start' | 'middle' | 'end';
  family?: string;
  weight?: number;
  rotate?: number;
  ls?: number;
}> = ({x, y, size, children, fill = K.white, stroke = K.ol, sw, anchor = 'middle', family = F_CJK, weight = 900, rotate = 0, ls = 0}) => (
  <text
    x={x}
    y={y}
    fontSize={size}
    fontFamily={family}
    fontWeight={weight}
    fill={fill}
    stroke={stroke}
    strokeWidth={sw ?? size * 0.14}
    strokeLinejoin="round"
    paintOrder="stroke"
    textAnchor={anchor}
    letterSpacing={ls}
    transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
  >
    {children}
  </text>
);

/** HTML telop (for text inside flex layouts): same look as Telop. */
export const TelopDiv: React.FC<{size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; family?: string}> = ({
  size,
  color = K.white,
  children,
  style,
  family = F_CJK,
}) => (
  <div
    style={{
      fontFamily: family,
      fontWeight: 900,
      fontSize: size,
      color,
      WebkitTextStroke: `${size * 0.14}px ${K.ol}`,
      paintOrder: 'stroke fill',
      lineHeight: 1.15,
      ...style,
    }}
  >
    {children}
  </div>
);

// ------------------------------------------------------------------ shapes
export const starPath = (n: number, r1: number, r2: number) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? r2 : r1;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  }
  return d + 'Z';
};
export const heartPath = (s: number) =>
  `M0 ${18 * s} C${-40 * s} ${-8 * s} ${-26 * s} ${-40 * s} 0 ${-22 * s} C${26 * s} ${-40 * s} ${40 * s} ${-8 * s} 0 ${18 * s} Z`;

/** Starburst + ring hit effect at (x, y), alive for 9 frames after f0. */
export const Burst: React.FC<{x: number; y: number; f0: number; col?: string; size?: number}> = ({x, y, f0, col = K.yellow, size = 1}) => {
  const f = useCurrentFrame();
  const p = (f - f0) / 10;
  if (p < 0 || p > 1) return null;
  return (
    <g opacity={1 - p * p} transform={`translate(${x} ${y}) scale(${size * (0.55 + 0.7 * E.out(p))}) rotate(${p * 30})`}>
      <circle r={50 + 60 * p} fill="none" stroke={K.white} strokeWidth={10 * (1 - p)} />
      <path d={starPath(8, 70, 28)} fill={col} {...SO} strokeWidth={6} />
      {Array.from({length: 8}).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        return <line key={i} x1={Math.cos(a) * 90} y1={Math.sin(a) * 90} x2={Math.cos(a) * 130} y2={Math.sin(a) * 130} stroke={K.ol} strokeWidth={7} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** Judgement word: pops at an angle on f0, holds `dur` frames, rises a little. */
export const Judge: React.FC<{word: string; x: number; y: number; f0: number; col?: string; dur?: number; size?: number; family?: string}> = ({
  word,
  x,
  y,
  f0,
  col = K.pink,
  dur = 45,
  size = 130,
  family = F_CJK,
}) => {
  const f = useCurrentFrame();
  if (f < f0 || f > f0 + dur) return null;
  const s = E.back(seg(f, f0, f0 + 8));
  const o = 1 - seg(f, f0 + dur - 6, f0 + dur);
  return (
    <g opacity={o} transform={`translate(${x} ${y - 20 * E.out(seg(f, f0, f0 + dur))}) scale(${s}) rotate(-6)`}>
      <Telop x={0} y={size * 0.35} size={size} fill={col} sw={size * 0.15} family={family}>
        {word}
      </Telop>
    </g>
  );
};

/** Confetti shower (deterministic), from f0 for `dur` frames. */
export const Confetti: React.FC<{f0: number; dur?: number; n?: number; seed?: number}> = ({f0, dur = 60, n = 70, seed = 7}) => {
  const f = useCurrentFrame();
  if (f < f0 || f > f0 + dur + 40) return null;
  const r = rng(seed);
  const cols = [K.yellow, K.pink, K.sky, K.lime, K.white, K.orange];
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const x0 = r() * 1920;
        const sp = 9 + r() * 9;
        const delay = r() * 20;
        const rot0 = r() * 360;
        const c = cols[i % cols.length];
        const t = f - f0 - delay;
        if (t < 0) return null;
        const y = -40 + t * sp;
        if (y > 1120) return null;
        const x = x0 + Math.sin((t + i * 7) / 9) * 30;
        return <rect key={i} x={-9} y={-5} width={18} height={10} fill={c} transform={`translate(${x} ${y}) rotate(${rot0 + t * 9})`} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ cast
export type BeanProps = {
  x: number;
  y: number; // feet on the floor
  scale?: number;
  color: string;
  belly?: string | null;
  kind?: 'bean' | 'bot';
  ant?: 'ball' | 'q' | 'bolt' | 'heart' | 'sprout' | 'star' | 'none';
  antCol?: string;
  hat?: 'none' | 'judge' | 'nurse' | 'hardhat' | 'beret' | 'crown' | 'cap' | 'opera' | 'chef' | 'headset' | 'glasses';
  item?: 'none' | 'gavel' | 'stethoscope' | 'wrench' | 'mop' | 'brush' | 'mic' | 'ball' | 'flask' | 'fan' | 'laptop' | 'heart' | 'pen' | 'box' | 'magnifier' | 'briefcase';
  name?: string;
  tagCol?: string;
  hey?: number; // 0..1 arms up
  open?: boolean;
  sq?: number;
  lean?: number;
  face?: null | 'x' | 'up' | 'sad';
  hop?: number; // px of the idle hop
  phase?: number;
  opacity?: number;
};

const Item: React.FC<{item: NonNullable<BeanProps['item']>}> = ({item}) => {
  switch (item) {
    case 'gavel':
      return (
        <g transform="rotate(-30)">
          <rect x={-6} y={-70} width={12} height={70} fill={K.wood} {...SO} strokeWidth={5} />
          <rect x={-34} y={-100} width={68} height={34} rx={8} fill={K.wood} {...SO} strokeWidth={6} />
        </g>
      );
    case 'stethoscope':
      return (
        <g>
          <path d="M -10 0 C -40 -40 30 -60 10 -90" fill="none" stroke={K.ol} strokeWidth={8} strokeLinecap="round" />
          <circle cx={10} cy={-96} r={16} fill={K.gray} {...SO} strokeWidth={6} />
        </g>
      );
    case 'wrench':
      return (
        <g transform="rotate(-35)">
          <rect x={-8} y={-80} width={16} height={84} rx={6} fill={K.steel} {...SO} strokeWidth={5} />
          <path d="M -24 -80 a 24 24 0 1 1 48 0 l -12 0 l 0 -14 l -24 0 l 0 14 Z" fill={K.steel} {...SO} strokeWidth={5} />
        </g>
      );
    case 'mop':
      return (
        <g transform="rotate(-10)">
          <rect x={-5} y={-150} width={10} height={160} fill={K.wood} {...SO} strokeWidth={4} />
          <path d="M -30 10 L 30 10 L 36 44 L -36 44 Z" fill={K.sky} {...SO} strokeWidth={5} />
        </g>
      );
    case 'brush':
      return (
        <g transform="rotate(-25)">
          <rect x={-6} y={-90} width={12} height={90} fill={K.wood} {...SO} strokeWidth={5} />
          <path d="M -12 -90 C -12 -125 12 -125 12 -90 Z" fill={K.red} {...SO} strokeWidth={5} />
        </g>
      );
    case 'mic':
      return (
        <g>
          <rect x={-6} y={-60} width={12} height={60} fill={K.ol} />
          <circle cx={0} cy={-74} r={20} fill={K.gray} {...SO} strokeWidth={6} />
        </g>
      );
    case 'ball':
      return (
        <g transform="translate(0 -30)">
          <circle r={30} fill={K.white} {...SO} strokeWidth={6} />
          <path d={starPath(5, 12, 6)} fill={K.ol} />
        </g>
      );
    case 'flask':
      return (
        <g transform="translate(0 -10)">
          <path d="M -10 -70 L 10 -70 L 10 -40 L 34 0 L -34 0 L -10 -40 Z" fill={K.lime} {...SO} strokeWidth={6} />
        </g>
      );
    case 'fan':
      return (
        <g transform="translate(0 -20) rotate(-20)">
          <path d="M 0 0 L -50 -60 A 78 78 0 0 1 50 -60 Z" fill={K.red} {...SO} strokeWidth={6} />
        </g>
      );
    case 'laptop':
      return (
        <g transform="translate(0 -10)">
          <rect x={-50} y={-70} width={100} height={64} rx={8} fill={K.gray} {...SO} strokeWidth={6} />
          <rect x={-60} y={-8} width={120} height={14} rx={6} fill={K.steel} {...SO} strokeWidth={6} />
        </g>
      );
    case 'heart':
      return <path d={heartPath(1.4)} transform="translate(0 -30)" fill={K.red} {...SO} strokeWidth={6} />;
    case 'pen':
      return (
        <g transform="rotate(-30)">
          <rect x={-7} y={-80} width={14} height={80} rx={4} fill={K.blue} {...SO} strokeWidth={5} />
          <path d="M -7 0 L 7 0 L 0 16 Z" fill={K.ol} />
        </g>
      );
    case 'box':
      return <rect x={-40} y={-60} width={80} height={60} rx={6} fill={K.wood} {...SO} strokeWidth={6} />;
    case 'magnifier':
      return (
        <g transform="rotate(-30)">
          <rect x={-6} y={-40} width={12} height={46} fill={K.wood} {...SO} strokeWidth={5} />
          <circle cx={0} cy={-66} r={26} fill={K.sky} {...SO} strokeWidth={6} />
        </g>
      );
    case 'briefcase':
      return (
        <g transform="translate(0 6)">
          <rect x={-40} y={-52} width={80} height={56} rx={8} fill={K.wood} {...SO} strokeWidth={6} />
          <rect x={-14} y={-66} width={28} height={16} rx={6} fill="none" stroke={K.ol} strokeWidth={6} />
        </g>
      );
    default:
      return null;
  }
};

const Hat: React.FC<{hat: NonNullable<BeanProps['hat']>; color: string}> = ({hat}) => {
  switch (hat) {
    case 'judge':
      return (
        <g>
          {/* wig curls sit at the sides of the head, clear of the eyes (±28, −128…−96) */}
          {[-80, -60, 60, 80].map((x) => (
            <circle key={x} cx={x} cy={-150 + (Math.abs(x) - 60) * 0.8} r={20} fill={K.white} {...SO} strokeWidth={6} />
          ))}
          <path d="M -60 -158 Q 0 -206 60 -158" fill={K.white} {...SO} strokeWidth={6} />
        </g>
      );
    case 'nurse':
      return (
        <g>
          <path d="M -50 -156 L -40 -196 L 40 -196 L 50 -156 Z" fill={K.white} {...SO} strokeWidth={6} />
          <path d="M -8 -186 h16 v8 h8 v16 h-8 v8 h-16 v-8 h-8 v-16 h8 Z" fill={K.red} />
        </g>
      );
    case 'hardhat':
      return (
        <g>
          <path d="M -70 -150 C -70 -220 70 -220 70 -150 Z" fill={K.yellow} {...SO} strokeWidth={7} />
          <rect x={-86} y={-156} width={172} height={16} rx={8} fill={K.yellow} {...SO} strokeWidth={6} />
        </g>
      );
    case 'beret':
      return (
        <g>
          <ellipse cx={12} cy={-168} rx={74} ry={24} fill="#2B2F77" {...SO} transform="rotate(-12 12 -168)" />
          <circle cx={16} cy={-196} r={9} fill="#2B2F77" {...SO} strokeWidth={5} />
        </g>
      );
    case 'crown':
      return <path d="M -50 -160 L -50 -210 L -25 -180 L 0 -220 L 25 -180 L 50 -210 L 50 -160 Z" fill={K.yellow} {...SO} strokeWidth={6} />;
    case 'cap':
      return (
        <g>
          <path d="M -66 -150 C -66 -212 66 -212 66 -150 Z" fill={K.blue} {...SO} strokeWidth={6} />
          <path d="M 40 -156 L 110 -150 L 104 -138 L 40 -140 Z" fill={K.blue} {...SO} strokeWidth={6} />
        </g>
      );
    case 'opera':
      return (
        <g>
          <path d="M -60 -150 L -40 -200 L 40 -200 L 60 -150 Z" fill={K.red} {...SO} strokeWidth={6} />
          <circle cx={0} cy={-210} r={14} fill={K.yellow} {...SO} strokeWidth={5} />
          <path d="M -40 -200 C -90 -260 -110 -210 -120 -260" fill="none" stroke={K.ol} strokeWidth={6} strokeLinecap="round" />
          <path d="M 40 -200 C 90 -260 110 -210 120 -260" fill="none" stroke={K.ol} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case 'chef':
      return (
        <g>
          {[-30, 0, 30].map((x) => (
            <circle key={x} cx={x} cy={-204} r={28} fill={K.white} {...SO} strokeWidth={6} />
          ))}
          <rect x={-46} y={-190} width={92} height={36} fill={K.white} {...SO} strokeWidth={6} />
        </g>
      );
    case 'headset':
      return (
        <g>
          <path d="M -78 -110 C -78 -200 78 -200 78 -110" fill="none" stroke={K.ol} strokeWidth={10} />
          <rect x={-92} y={-128} width={22} height={40} rx={8} fill={K.gray} {...SO} strokeWidth={5} />
          <rect x={70} y={-128} width={22} height={40} rx={8} fill={K.gray} {...SO} strokeWidth={5} />
        </g>
      );
    case 'glasses':
      return (
        <g fill="none" stroke={K.ol} strokeWidth={6}>
          <circle cx={-28} cy={-112} r={22} />
          <circle cx={28} cy={-112} r={22} />
          <line x1={-6} y1={-112} x2={6} y2={-112} />
        </g>
      );
    default:
      return null;
  }
};

/** Toy contestant: a rounded bean (or a boxy bot) with mitten hands, catch-light eyes, a name tag. Feet at (x, y). */
export const Bean: React.FC<BeanProps> = ({
  x,
  y,
  scale = 1,
  color,
  belly = null,
  kind = 'bean',
  ant = 'ball',
  antCol = K.white,
  hat = 'none',
  item = 'none',
  name,
  tagCol = K.ol,
  hey = 0,
  open = false,
  sq = 1,
  lean = 0,
  face = null,
  hop = 0,
  phase = 0,
  opacity = 1,
}) => {
  const f = useCurrentFrame();
  const hy = hop ? hopY(f, hop, phase) : 0;
  const idleSq = hop ? 1 + 0.04 * Math.cos(((f / BEAT + phase) % 1) * Math.PI * 2) : 1;
  const s = sq * idleSq;
  const aL = 18 + (158 - 18) * hey;
  const aR = 18 + (158 - 18) * hey;
  const eyeFill = kind === 'bot' ? K.white : K.ol;
  const lc = kind === 'bot' ? K.white : K.ol;
  const blink = Math.floor((f + phase * 40) / 6) % 23 === 0;
  const arm = (side: number) => (
    <g transform={`translate(${side * 72} -98) rotate(${side < 0 ? aL : -aR})`}>
      <rect x={-14} y={-4} width={28} height={70} rx={14} fill={color} {...SO} />
      <circle cx={0} cy={70} r={17} fill={K.white} {...SO} strokeWidth={6} />
      {side > 0 && item !== 'none' && (
        <g transform={`translate(0 70) rotate(${aR})`}>
          <Item item={item} />
        </g>
      )}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + hy}) scale(${scale})`} opacity={opacity}>
      <g transform={`rotate(${lean}) scale(${(1 / Math.sqrt(s)).toFixed(3)} ${s.toFixed(3)})`}>
        {arm(-1)}
        {arm(1)}
        {[-34, 34].map((fx) => (
          <ellipse key={fx} cx={fx} cy={-8} rx={30} ry={15} fill={color} {...SO} />
        ))}
        {kind === 'bot' ? (
          <g>
            <rect x={-82} y={-176} width={164} height={170} rx={30} fill={color} {...SO} />
            <rect x={-60} y={-150} width={120} height={84} rx={18} fill={K.navy} {...SO} strokeWidth={6} />
          </g>
        ) : (
          <path d="M -80 -20 C -88 -112 -52 -172 0 -172 C 52 -172 88 -112 80 -20 C 72 -2 -72 -2 -80 -20 Z" fill={color} {...SO} />
        )}
        {belly && kind !== 'bot' && <ellipse cx={0} cy={-48} rx={44} ry={32} fill={belly} />}
        {belly && kind === 'bot' && <rect x={-30} y={-54} width={60} height={30} rx={10} fill={belly} {...SO} strokeWidth={5} />}
        {/* antenna */}
        {hat === 'none' && ant !== 'none' && (
          <g>
            <line x1={0} y1={-172} x2={0} y2={-210} stroke={K.ol} strokeWidth={7} />
            <g transform="translate(0 -224)">
              {ant === 'ball' && <circle r={15} fill={antCol} {...SO} strokeWidth={6} />}
              {ant === 'q' && (
                <Telop x={0} y={18} size={56} fill={K.yellow} sw={7} family={F_ROUND} weight={700}>
                  ?
                </Telop>
              )}
              {ant === 'bolt' && <path d="M 6 -26 L -14 4 L 0 4 L -6 28 L 16 -4 L 2 -4 Z" fill={K.yellow} {...SO} strokeWidth={5} />}
              {ant === 'heart' && <path d={heartPath(0.55)} fill={K.red} {...SO} strokeWidth={5} />}
              {ant === 'star' && <path d={starPath(5, 22, 10)} fill={K.yellow} {...SO} strokeWidth={5} />}
              {ant === 'sprout' && (
                <g>
                  <path d="M 0 10 C -30 -4 -30 -24 -6 -20 Z" fill={K.green} {...SO} strokeWidth={5} />
                  <path d="M 0 10 C 30 -4 30 -24 6 -20 Z" fill={K.green} {...SO} strokeWidth={5} />
                </g>
              )}
            </g>
          </g>
        )}
        {/* face */}
        {face === 'x' ? (
          <path d="M -40 -124 L -16 -100 M -16 -124 L -40 -100 M 16 -124 L 40 -100 M 40 -124 L 16 -100" stroke={lc} strokeWidth={7} strokeLinecap="round" />
        ) : face === 'up' || blink ? (
          <path d="M -40 -108 Q -28 -124 -16 -108 M 16 -108 Q 28 -124 40 -108" stroke={lc} strokeWidth={7} fill="none" strokeLinecap="round" />
        ) : (
          <g>
            {[-28, 28].map((ex) => (
              <g key={ex}>
                <ellipse cx={ex} cy={-112} rx={11} ry={16} fill={eyeFill} />
                <circle cx={ex + 4} cy={-118} r={4} fill={eyeFill === K.ol ? K.white : K.ol} />
              </g>
            ))}
          </g>
        )}
        {kind !== 'bot' &&
          [-54, 54].map((cx) => <ellipse key={cx} cx={cx} cy={-86} rx={14} ry={8} fill={K.pink} opacity={0.85} />)}
        {open ? (
          <g>
            <ellipse cx={0} cy={-74} rx={17} ry={19} fill={K.ol} stroke={kind === 'bot' ? K.white : 'none'} strokeWidth={3} />
            <ellipse cx={0} cy={-64} rx={10} ry={7} fill={K.red} />
          </g>
        ) : face === 'sad' ? (
          <path d="M -14 -72 Q 0 -84 14 -72" fill="none" stroke={lc} strokeWidth={6} strokeLinecap="round" />
        ) : (
          <path d="M -14 -80 Q 0 -68 14 -80" fill="none" stroke={lc} strokeWidth={6} strokeLinecap="round" />
        )}
        {hat !== 'none' && <Hat hat={hat} color={color} />}
      </g>
      {/* name badge sits on the belly so it never reaches the subtitle band under the floor */}
      {name && <NameTag name={name} col={tagCol} y={-64} size={Math.min(46, 30 / Math.max(scale, 0.65))} />}
    </g>
  );
};

export const NameTag: React.FC<{name: string; col?: string; y?: number; size?: number}> = ({name, col = K.ol, y = 16, size = 34}) => {
  const w = name.length * size * (/[一-龥]/.test(name) ? 1.02 : 0.62) + 40;
  return (
    <g>
      <rect x={-w / 2} y={y} width={w} height={size + 18} rx={(size + 18) / 2} fill={col} stroke={K.white} strokeWidth={4} />
      <text x={0} y={y + size * 0.98 + 2} fontSize={size} fontFamily={F_CJK} fontWeight={900} fill={K.white} textAnchor="middle">
        {name}
      </text>
    </g>
  );
};

// ------------------------------------------------------------------ cards and banners
/** Hard-shadow card (HTML): the shape in ink shifted down-right, the coloured shape on top. */
export const ShadowCard: React.FC<{
  w: number;
  h: number;
  col?: string;
  r?: number;
  off?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  border?: number;
}> = ({w, h, col = K.cream, r = 28, off = 14, children, style, border = 7}) => (
  <div style={{position: 'relative', width: w, height: h, ...style}}>
    <div style={{position: 'absolute', left: off, top: off, width: w, height: h, borderRadius: r, background: K.ol}} />
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: w,
        height: h,
        borderRadius: r,
        background: col,
        border: `${border}px solid ${K.ol}`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  </div>
);

/** Corner sticker banner (top-left): big line + small line; slides in at f0 with back-ease, leaves at f1. */
export const Banner: React.FC<{title: string; sub?: string; col?: string; f0?: number; f1?: number; x?: number; y?: number}> = ({
  title,
  sub,
  col = K.red,
  f0 = 0,
  f1 = 1e9,
  x = 50,
  y = 40,
}) => {
  const f = useCurrentFrame();
  const pin = E.back(seg(f, f0, f0 + 10));
  const pout = E.in(seg(f, f1 - 6, f1));
  if (f < f0 || f >= f1) return null;
  const w = Math.max(title.length * 60, (sub ?? '').length * 34) + 70;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translateX(${(1 - pin) * -900}px) translateY(${-260 * pout}px) rotate(${-6 + 4.5 * pin}deg)`,
        transformOrigin: '0 0',
      }}
    >
      <ShadowCard w={w} h={sub ? 150 : 104} col={col} r={24} off={10}>
        <div style={{padding: '14px 30px'}}>
          <TelopDiv size={58}>{title}</TelopDiv>
          {sub && <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 34, color: K.ol, marginTop: 6}}>{sub}</div>}
        </div>
      </ShadowCard>
    </div>
  );
};

/** Round card: "第 N 关" + name + a line, flying in at f0 (centre stage). */
export const RoundCard: React.FC<{num: number; name: string; tag?: string; col: string; f0?: number; f1?: number}> = ({num, name, tag, col, f0 = 0, f1 = 1e9}) => {
  const f = useCurrentFrame();
  if (f < f0 || f >= f1) return null;
  const p = E.back(seg(f, f0, f0 + 12));
  const o = E.in(seg(f, f1 - 7, f1));
  const wob = Math.sin((f - f0) / 9) * 1.2;
  return (
    <div
      style={{
        position: 'absolute',
        left: 960,
        top: 430,
        transform: `translate(-50%, -50%) translateY(${(1 - p) * -900 + o * 900}px) rotate(${-3 + wob}deg) scale(${0.9 + 0.1 * p})`,
      }}
    >
      <ShadowCard w={1100} h={520} col={col} r={44} off={18} border={9}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          <div
            style={{
              fontFamily: F_ROUND,
              fontWeight: 700,
              fontSize: 64,
              color: K.ol,
              background: K.yellow,
              border: `6px solid ${K.ol}`,
              borderRadius: 40,
              padding: '2px 34px',
              letterSpacing: 4,
            }}
          >
            ROUND {num}
          </div>
          <TelopDiv size={150} style={{marginTop: 26, letterSpacing: 6}}>
            {name}
          </TelopDiv>
          {tag && <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 44, color: K.ol, marginTop: 26}}>{tag}</div>}
        </div>
      </ShadowCard>
    </div>
  );
};

// ------------------------------------------------------------------ real material
/** Credit line under a real picture: "图：…" in a small dark plate. */
export const Credit: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div
    style={{
      display: 'inline-block',
      fontFamily: F_CJK,
      fontWeight: 700,
      fontSize: 22,
      color: K.white,
      background: 'rgba(27,27,27,0.82)',
      borderRadius: 10,
      padding: '4px 14px',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);

/** LED screen on the set holding a real photo, slowly pushing in (Ken Burns) so a held shot never freezes. */
export const Screen: React.FC<{
  src: string; // imported asset url
  x: number;
  y: number;
  w: number;
  h: number;
  f0?: number;
  credit?: string;
  focus?: [number, number]; // object-position %
  zoom?: [number, number]; // scale from → to over the scene
  frameCol?: string;
  tilt?: number;
  label?: string;
}> = ({src, x, y, w, h, f0 = 0, credit, focus = [50, 50], zoom = [1.02, 1.12], frameCol = K.ol, tilt = 0, label}) => {
  const f = useCurrentFrame();
  const scene = useScene();
  if (f < f0) return null;
  const p = E.back(seg(f, f0, f0 + 10));
  const kb = zoom[0] + (zoom[1] - zoom[0]) * seg(f, f0, scene.duration);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        transform: `scale(${p}) rotate(${tilt}deg)`,
        transformOrigin: '50% 100%',
      }}
    >
      <ShadowCard w={w} h={h} col={frameCol} r={26} off={14} border={8}>
        <div style={{position: 'absolute', inset: 10, borderRadius: 16, overflow: 'hidden', background: '#000'}}>
          <Img
            src={src}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${focus[0]}% ${focus[1]}%`,
              transform: `scale(${kb})`,
              transformOrigin: `${focus[0]}% ${focus[1]}%`,
            }}
          />
        </div>
      </ShadowCard>
      {label && (
        <div style={{position: 'absolute', left: -14, top: -30, transform: 'rotate(-4deg)'}}>
          <div
            style={{
              fontFamily: F_CJK,
              fontWeight: 900,
              fontSize: 36,
              color: K.ol,
              background: K.yellow,
              border: `6px solid ${K.ol}`,
              borderRadius: 16,
              padding: '2px 18px',
            }}
          >
            {label}
          </div>
        </div>
      )}
      {credit && (
        <div style={{position: 'absolute', right: 0, top: h + 22}}>
          <Credit text={credit} />
        </div>
      )}
    </div>
  );
};

export {staticFile, interpolate};
