// 产品页舞台 (product-page stage): the base look of the "AI news explainer" references (docs/reference/ai-news-explainer-style.md).
// One light page per scene: mono eyebrow, one bold headline with accent words, white cards that grow in step with the
// narration (idle -> lit -> done), a dark subtitle pill drawn by the engine. Plus two openers/structures from the same
// references: Poster (big numbers around a wordmark) and RankBadge (20 -> 1 countdown).
// Motion rules: eased fades / slides only; the dot grid creeps so long sentences never read as a frozen frame.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog} from '@atv/lib/timing';
import {Abs, Drift, fade, lerp, rise} from './stylemix';

export {Abs, Drift, fade, lerp, rise, prog, clamp01, EASE, FONT_MONO, FONT_ZH};

/** Surfaces and ink. `accent` is picked once per video (see PP_ACCENTS); chapters may change only the background. */
export const PP = {
  cream: '#F1EEE7',
  paleBlue: '#F2F9FF',
  lavender: '#ECE2FA',
  mint: '#DDF5E6',
  beige: '#DED4C6',
  card: '#FCFBFA',
  ink: '#1B1B1B',
  sub: '#6F6C66',
  line: '#E4E0D8',
  idle: '#ECE9E2',
  dark: '#1B1823',
  good: '#2F9E6A',
  bad: '#D9483B',
};
export const PP_ACCENTS = {terracotta: '#E2603F', blue: '#2F6FEB', green: '#1E9E5B', violet: '#7254F3', orange: '#F29A00'};
/** Pastel per chapter, for videos that change the page colour each chapter (references 10, 13). */
export const PP_CHAPTERS = ['#FBE3EC', '#E8E1FA', '#FFF1C9', '#DCEBFF', '#DDF5E6'];

THEMES['pp-cream'] = {bg: PP.cream, bg2: PP.cream, accent: PP_ACCENTS.terracotta, accentSoft: '#F6D9CE', ink: PP.ink, dark: true};
THEMES['pp-dark'] = {bg: PP.dark, bg2: PP.dark, accent: PP_ACCENTS.terracotta, accentSoft: '#3A2F3A', ink: '#FFFFFF', dark: true};

/** Page background with a faint dot grid that creeps diagonally. */
export const ProdBg: React.FC<{bg?: string; dots?: boolean}> = ({bg = PP.cream, dots = true}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: bg}}>
      {dots && (
        <AbsoluteFill
          style={{
            backgroundImage: 'radial-gradient(rgba(0,0,0,0.07) 1.6px, transparent 1.7px)',
            backgroundSize: '36px 36px',
            backgroundPosition: `${frame * 0.4}px ${frame * 0.25}px`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/** Colour a few words of a headline: <Hl>审查该问<A>什么</A>？</Hl>. */
export const A: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = PP_ACCENTS.terracotta}) => (
  <span style={{color}}>{children}</span>
);
export const Head: React.FC<{eyebrow: string; children: React.ReactNode; f: number; x?: number; y?: number; size?: number; right?: React.ReactNode}> = ({
  eyebrow,
  children,
  f,
  x = 100,
  y = 70,
  size = 64,
  right,
}) => (
  <>
    <Abs x={x} y={y} style={rise(f, 10)}>
      <span style={{fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: PP_ACCENTS.terracotta}}>{eyebrow}</span>
    </Abs>
    <Abs x={x - 2} y={y + 34} style={rise(f, 18)}>
      <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: 900, color: PP.ink, lineHeight: 1.2}}>{children}</span>
    </Abs>
    {right && (
      <Abs x={1920 - x - 600} y={y + 8} w={600} style={{...fade(f), textAlign: 'right'}}>
        {right}
      </Abs>
    )}
  </>
);

/** Which state card k is in, given the frames-since-beat array b (beat k lights it, beat k+1 dims it). */
export const cardState = (b: number[], k: number, last = false): 'wait' | 'lit' | 'done' =>
  b[k] < 0 ? 'wait' : !last && b[k + 1] !== undefined && b[k + 1] >= 0 ? 'done' : 'lit';

/** White card. wait = grey placeholder, lit = accent outline and content, done = faded but readable. */
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  f: number; // frames since this card's beat started (negative = not yet)
  state?: 'wait' | 'lit' | 'done';
  chrome?: boolean; // three window dots on top
  accent?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, w, h, f, state = 'lit', chrome = false, accent = PP_ACCENTS.terracotta, children, style}) => {
  const p = prog(f, 14);
  const lit = state === 'lit' ? p : 0;
  const body = state === 'wait' ? 0 : state === 'done' ? 0.55 : p;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 18,
        background: state === 'wait' ? PP.idle : PP.card,
        border: `${state === 'lit' ? 3 : 2}px solid ${state === 'lit' ? accent : PP.line}`,
        boxShadow: state === 'wait' ? 'none' : `0 ${6 + lit * 8}px ${22 + lit * 12}px rgba(40,30,20,${0.06 + lit * 0.05})`,
        opacity: state === 'wait' ? 0.75 : 1,
        transform: `translateY(${(1 - Math.max(p, state === 'wait' ? 1 : 0)) * 14}px)`,
        overflow: 'hidden',
        ...style,
      }}
    >
      {chrome && (
        <div style={{display: 'flex', gap: 8, padding: '14px 18px 0', opacity: body}}>
          {['#FF6058', '#FFC130', '#27CA40'].map((c) => (
            <span key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
          ))}
        </div>
      )}
      <div style={{position: 'relative', padding: chrome ? '10px 28px 24px' : '22px 28px', opacity: body, height: '100%'}}>{children}</div>
    </div>
  );
};

/** Grey placeholder bars that stand in for content not yet filled in. */
export const Ghost: React.FC<{n?: number; w?: number}> = ({n = 3, w = 100}) => (
  <div style={{display: 'grid', gap: 12}}>
    {Array.from({length: n}).map((_, i) => (
      <div key={i} style={{height: 12, borderRadius: 6, background: PP.idle, width: `${w - i * 14}%`}} />
    ))}
  </div>
);

export const Chip: React.FC<{children: React.ReactNode; tone?: 'plain' | 'good' | 'bad' | 'accent' | 'ink'; size?: number; style?: React.CSSProperties}> = ({
  children,
  tone = 'plain',
  size = 22,
  style,
}) => {
  const t = {
    plain: {bg: '#EFECE5', fg: PP.sub},
    good: {bg: '#DDF3E7', fg: PP.good},
    bad: {bg: '#FBE3DF', fg: PP.bad},
    accent: {bg: '#F8DDD3', fg: PP_ACCENTS.terracotta},
    ink: {bg: PP.ink, fg: '#fff'},
  }[tone];
  return (
    <span style={{display: 'inline-block', padding: '3px 14px', borderRadius: 999, background: t.bg, color: t.fg, fontFamily: FONT_ZH, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', ...style}}>
      {children}
    </span>
  );
};

/** A claim that gets overturned: the text is struck through and a small black tag names why. */
export const Struck: React.FC<{f: number; tag: string; children: React.ReactNode; size?: number}> = ({f, tag, children, size = 34}) => {
  const p = prog(f, 12);
  return (
    <div>
      <span style={{position: 'relative', fontFamily: FONT_ZH, fontSize: size, fontWeight: 800, color: lerp(1, 0, p) > 0.5 ? PP.ink : PP.sub}}>
        {children}
        <span style={{position: 'absolute', left: -4, top: '54%', height: 4, width: `${p * 104}%`, background: PP.ink, borderRadius: 2}} />
      </span>
      <div style={{marginTop: 10, opacity: p}}>
        <Chip tone="ink" size={20}>
          {tag}
        </Chip>
      </div>
    </div>
  );
};

/** Drawn arrow between two points (p = 0..1). */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color?: string; w?: number}> = ({x1, y1, x2, y2, p, color = PP.ink, w = 4}) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (a: number) => x2 - Math.cos(ang + a) * 16;
  const hy = (a: number) => y2 - Math.sin(ang + a) * 16;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={1920} height={1080}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
      {p > 0.92 && <path d={`M${hx(-0.5)} ${hy(-0.5)} L${x2} ${y2} L${hx(0.5)} ${hy(0.5)}`} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};

/** A big number that counts up, with an optional unit. */
export const Num: React.FC<{f: number; to: number; unit?: string; size?: number; color?: string; decimals?: number; from?: number}> = ({
  f,
  to,
  unit = '',
  size = 120,
  color = PP_ACCENTS.terracotta,
  decimals = 0,
  from = 0,
}) => {
  const v = lerp(from, to, prog(f, 30));
  return (
    <span style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, color, lineHeight: 1}}>
      {v.toFixed(decimals)}
      <span style={{fontSize: size * 0.4, marginLeft: 6}}>{unit}</span>
    </span>
  );
};

/** Half-circle gauge (0..1). */
export const Gauge: React.FC<{p: number; size?: number; color?: string; label?: string}> = ({p, size = 180, color = PP_ACCENTS.terracotta, label}) => {
  const r = size / 2 - 14;
  const c = Math.PI * r;
  return (
    <div style={{width: size, textAlign: 'center'}}>
      <svg width={size} height={size / 2 + 10}>
        <path d={`M14 ${size / 2} A${r} ${r} 0 0 1 ${size - 14} ${size / 2}`} stroke={PP.idle} strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={`M14 ${size / 2} A${r} ${r} 0 0 1 ${size - 14} ${size / 2}`} stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - clamp01(p))} />
      </svg>
      {label && <div style={{fontFamily: FONT_ZH, fontWeight: 700, fontSize: 22, color: PP.sub}}>{label}</div>}
    </div>
  );
};

/** Horizontal bar: one highlighted row, the rest grey. */
export const Bar: React.FC<{label: string; v: number; max: number; f: number; hi?: boolean; w?: number; accent?: string}> = ({label, v, max, f, hi = false, w = 520, accent = PP_ACCENTS.blue}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT_ZH, fontSize: 26, fontWeight: hi ? 800 : 500, color: hi ? PP.ink : PP.sub}}>
    <span style={{width: 190, textAlign: 'right'}}>{label}</span>
    <div style={{width: w, height: 24, borderRadius: 4, background: '#EEEBE4'}}>
      <div style={{width: `${(v / max) * prog(f, 24) * 100}%`, height: '100%', borderRadius: 4, background: hi ? accent : '#C9C5BC'}} />
    </div>
    <span style={{fontFamily: FONT_MONO, fontSize: 24}}>{v}</span>
  </div>
);

/** Opening / chapter poster: dark photo-like field with huge numbers on both sides around a wordmark. */
export const Poster: React.FC<{
  f: number;
  title: string;
  sub?: string;
  left?: {value: string; label: string};
  right?: {value: string; label: string};
  bg?: string; // CSS background (gradient, or url(...) of a moody still)
  accent?: string;
}> = ({f, title, sub, left, right, bg = 'radial-gradient(ellipse at 50% 30%, #3b4252 0%, #151821 70%)', accent = PP_ACCENTS.terracotta}) => {
  const frame = useCurrentFrame();
  const zoom = 1 + 0.05 * clamp01(frame / 200);
  const big = (s: {value: string; label: string}, side: 'l' | 'r', d: number) => (
    <Abs x={side === 'l' ? 90 : 1920 - 90 - 460} y={330} w={460} style={{...rise(f - d, 30, 20), textAlign: side === 'l' ? 'left' : 'right'}}>
      <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 190, color: '#fff', lineHeight: 1, letterSpacing: -4}}>{s.value}</div>
      <div style={{fontFamily: FONT_ZH, fontWeight: 700, fontSize: 34, color: 'rgba(255,255,255,0.8)', marginTop: 10}}>{s.label}</div>
    </Abs>
  );
  return (
    <AbsoluteFill style={{background: '#10131C', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: bg, transform: `scale(${zoom})`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)'}} />
      <Abs x={360} y={400} w={1200} style={{...rise(f, 20, 20), textAlign: 'center'}}>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 150, color: '#F4F1EA', letterSpacing: 6}}>{title}</div>
        {sub && <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: accent, marginTop: 16}}>{sub}</div>}
      </Abs>
      {left && big(left, 'l', 6)}
      {right && big(right, 'r', 12)}
    </AbsoluteFill>
  );
};

/** Countdown badge for "N ways / cases / pitfalls" videos: bigger and brighter as the rank approaches 1. */
export const RankBadge: React.FC<{n: number; total?: number; f: number; x?: number; y?: number; label?: string}> = ({n, total = 20, f, x = 90, y = 56, label = '第'}) => {
  const t = 1 - (n - 1) / Math.max(1, total - 1); // 0 at the bottom of the list, 1 at rank 1
  const hue = interpolate(t, [0, 1], [190, 340]);
  const p = prog(f, 12);
  return (
    <Abs x={x} y={y} style={{transform: `scale(${(0.7 + 0.3 * p) * (0.9 + 0.2 * t)})`, opacity: p, transformOrigin: '0 0'}}>
      <div style={{display: 'inline-flex', alignItems: 'baseline', gap: 6, padding: '8px 26px 8px 22px', borderRadius: 18, background: `hsl(${hue} 75% ${58 - t * 8}%)`, color: '#fff', boxShadow: '0 6px 0 rgba(0,0,0,0.15)', fontFamily: FONT_ZH, fontWeight: 900}}>
        <span style={{fontSize: 34}}>{label}</span>
        <span style={{fontSize: 110, lineHeight: 1}}>{n}</span>
        <span style={{fontSize: 34}}>名</span>
      </div>
      <div style={{marginTop: 8, color: '#F2B705', fontSize: 30, letterSpacing: 4}}>{'★'.repeat(Math.max(1, Math.round(1 + t * 4)))}</div>
    </Abs>
  );
};

export {Drift as ProdDrift};
