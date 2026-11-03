// Shared `pop` look for 讲透 vertical (9:16) cuts, first made for claude-code-diet-shorts (2026-11):
// flat motion graphics on electric blue: big heavy type, flat colour cards with a hard drop shadow, a slowly turning
// sunburst, confetti bursts and shock rings. Built for 抖音 / 小红书 / 视频号 at 1080×1920.
// Layout rules (see docs in the episode script): key content inside the 6:7 band, i.e. y 330–1290 and x 100–960
// (the right-hand like/comment column starts around x 960); subtitles are placed by the engine (~y 1330).
// Motion rules: the sunburst turns and the bits drift in every frame, and Stage zooms in a little over each scene,
// so no stretch is a frozen frame.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import {FONT_MONO, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, typed, useScene} from '@atv/lib/timing';

THEMES.pop = {bg: '#1F2EF5', bg2: '#3442FF', accent: '#FFD23F', accentSoft: '#FFE98A', ink: '#FFFFFF'};

export const P = {
  blue: '#1F2EF5',
  ray: '#2A39FF',
  deep: '#1622C9',
  navy: '#0E1660',
  ink: '#1A1F5C',
  white: '#FFFFFF',
  yellow: '#FFD23F',
  coral: '#FF6B4A',
  mint: '#3DDC97',
  sky: '#A9B8FF',
  pink: '#FF8FC7',
  grey: '#C9CEEA',
  shadow: 'rgba(8,12,70,0.28)',
};
export const FONT_POP = '"Noto Sans SC", "Noto Sans CJK SC", sans-serif';
export {FONT_MONO, clamp01, prog, typed};

/** Safe area for key content (6:7 band minus the right-hand button column). */
export const SAFE = {x0: 100, x1: 960, cx: 530, y0: 330, y1: 1290};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix = (f: number, a: number, b: number, inR: [number, number]) =>
  interpolate(f, inR, [a, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});

/** Deterministic random numbers (same every frame). */
export const rng = (seed: number) => {
  let s = (seed * 9301 + 49297) % 233280 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

const sp = (f: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  f < 0 ? 0 : spring({frame: f, fps: 30, config: {damping: 12, stiffness: 180, mass: 0.7, ...cfg}});

/** Pop in with a springy overshoot (scale `from` → 1). */
export const pop = (f: number, delay = 0, from = 0.4): React.CSSProperties => {
  const s = sp(f - delay);
  return {opacity: clamp01(s * 2), transform: `scale(${from + (1 - from) * s})`};
};
/** Slam in from big (scale `from` → 1, quick, heavy) — for the hook. */
export const slam = (f: number, delay = 0, from = 2.2): React.CSSProperties => {
  const s = sp(f - delay, {damping: 14, stiffness: 260, mass: 0.6});
  return {opacity: clamp01(s * 3), transform: `scale(${from + (1 - from) * s})`};
};
/** Slide up into place. */
export const rise = (f: number, delay = 0, dist = 60): React.CSSProperties => {
  const s = sp(f - delay, {damping: 16});
  return {opacity: clamp01(s * 2), transform: `translateY(${(1 - s) * dist}px)`};
};
/** Fly out (0 → gone) after `at`. */
export const flyOut = (f: number, at: number, dx = 0, dy = -300, rot = 0): React.CSSProperties => {
  const t = prog(f, 16, at);
  return {opacity: 1 - t, transform: `translate(${dx * t}px, ${dy * t}px) rotate(${rot * t}deg)`};
};
/** Visible between frames a and b with fades. */
export const during = (f: number, a: number, b: number, fade = 8) => clamp01(Math.min((f - a) / fade, (b - f) / fade));

/** Frames since sub-chunk `si` of beat `bi` started (subtitle chunks give finer timing than beats). */
export const useSub = () => {
  const frame = useCurrentFrame();
  const scene = useScene();
  return (bi: number, si = 0) => {
    const b = scene.beats[bi];
    const s = b?.subs?.[Math.min(si, (b?.subs?.length ?? 1) - 1)];
    return frame - (s ? s.from : b ? b.from : 0);
  };
};

// ------------------------------------------------------------------ text
export const T: React.FC<{size?: number; color?: string; w?: number; shadow?: string | false; style?: React.CSSProperties; children: React.ReactNode}> = ({
  size = 64,
  color = P.white,
  w = 900,
  shadow = false,
  style,
  children,
}) => (
  <span
    style={{
      fontFamily: FONT_POP,
      fontWeight: w,
      fontSize: size,
      color,
      lineHeight: 1.18,
      letterSpacing: size > 120 ? -size * 0.02 : 0,
      textShadow: shadow ? `${Math.round(size * 0.045)}px ${Math.round(size * 0.05)}px 0 ${shadow}` : undefined,
      ...style,
    }}
  >
    {children}
  </span>
);
export const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 30, color = P.white, children, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'pre', ...style}}>{children}</span>
);

/** Centered line of text at y (in the safe column). */
export const Center: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: 'absolute', left: SAFE.x0 - 40, width: SAFE.x1 - SAFE.x0 + 80, top: y, textAlign: 'center', ...style}}>{children}</div>
);

// ------------------------------------------------------------------ shapes
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  bg?: string;
  r?: number;
  rot?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  pad?: number | string;
}> = ({x, y, w, h, bg = P.white, r = 28, rot = 0, style, children, pad = 0}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: bg,
      borderRadius: r,
      boxShadow: `0 12px 0 ${P.shadow}`,
      transform: rot ? `rotate(${rot}deg)` : undefined,
      padding: pad,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{bg?: string; color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  bg = P.yellow,
  color = P.ink,
  size = 38,
  children,
  style,
}) => (
  <span
    style={{
      display: 'inline-block',
      background: bg,
      color,
      fontFamily: FONT_POP,
      fontWeight: 900,
      fontSize: size,
      padding: `${size * 0.22}px ${size * 0.7}px`,
      borderRadius: size,
      whiteSpace: 'nowrap',
      boxShadow: `0 8px 0 ${P.shadow}`,
      ...style,
    }}
  >
    {children}
  </span>
);

/** A sticky rule card (white slip with ink text). */
export const Slip: React.FC<{text: string; size?: number; bg?: string; color?: string; style?: React.CSSProperties}> = ({text, size = 36, bg = P.white, color = P.ink, style}) => (
  <div
    style={{
      display: 'inline-block',
      background: bg,
      color,
      fontFamily: FONT_POP,
      fontWeight: 800,
      fontSize: size,
      padding: `${size * 0.36}px ${size * 0.66}px`,
      borderRadius: size * 0.38,
      whiteSpace: 'nowrap',
      boxShadow: `0 ${size * 0.2}px 0 ${P.shadow}`,
      ...style,
    }}
  >
    {text}
  </div>
);

/** Small "示意" tag for illustrative content. */
export const Illus: React.FC<{x: number; y: number; text?: string; color?: string}> = ({x, y, text = '示意', color = P.white}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      border: `3px solid ${color}`,
      color,
      borderRadius: 10,
      padding: '0 12px',
      fontFamily: FONT_POP,
      fontWeight: 800,
      fontSize: 26,
      opacity: 0.85,
      transform: 'rotate(-5deg)',
    }}
  >
    {text}
  </div>
);

// ------------------------------------------------------------------ effects
/** Confetti burst at (x, y); `f` = frames since the burst. Bits fly out, fall and fade over ~45 frames. */
export const Burst: React.FC<{x: number; y: number; f: number; n?: number; seed?: number; spread?: number; colors?: string[]; size?: number}> = ({
  x,
  y,
  f,
  n = 36,
  seed = 1,
  spread = 460,
  colors = [P.yellow, P.coral, P.white, P.mint, P.pink],
  size = 30,
}) => {
  if (f < 0 || f > 60) return null;
  const r = rng(seed);
  const t = f / 30;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1} height={1}>
      {Array.from({length: n}, (_, i) => {
        const a = r() * Math.PI * 2;
        const v = (0.45 + r() * 0.75) * spread;
        const s = size * (0.4 + r() * 0.8);
        const c = colors[Math.floor(r() * colors.length)];
        const spin = (r() - 0.5) * 900;
        const shape = r();
        const k = 1 - Math.exp(-4.2 * t); // fast out, slowing down
        const px = x + Math.cos(a) * v * k;
        const py = y + Math.sin(a) * v * k * 0.85 + 260 * t * t; // gravity
        const o = clamp01(1.6 - t * 1.1);
        return shape < 0.6 ? (
          <rect key={i} x={px - s / 2} y={py - s * 0.3} width={s} height={s * 0.6} rx={4} fill={c} opacity={o} transform={`rotate(${spin * t} ${px} ${py})`} />
        ) : (
          <circle key={i} cx={px} cy={py} r={s * 0.32} fill={c} opacity={o} />
        );
      })}
    </svg>
  );
};

/** Expanding shock ring at (x, y); `f` = frames since impact. */
export const Ring: React.FC<{x: number; y: number; f: number; color?: string; max?: number; width?: number}> = ({x, y, f, color = P.white, max = 520, width = 14}) => {
  if (f < 0 || f > 24) return null;
  const t = prog(f, 22);
  const r = 40 + t * max;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1} height={1}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={width * (1 - t) + 1} opacity={1 - t} />
    </svg>
  );
};

/** Little sparkle stars around a point (twinkle while `f` ≥ 0). */
export const Sparkles: React.FC<{x: number; y: number; f: number; n?: number; seed?: number; r?: number; color?: string}> = ({x, y, f, n = 6, seed = 3, r: rad = 160, color = P.yellow}) => {
  if (f < 0) return null;
  const r = rng(seed);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1} height={1}>
      {Array.from({length: n}, (_, i) => {
        const a = r() * Math.PI * 2;
        const d = rad * (0.7 + r() * 0.5);
        const ph = r() * 30;
        const s = 10 + 14 * Math.abs(Math.sin((f + ph) / 9)) * clamp01(f / 8);
        const cx = x + Math.cos(a) * d;
        const cy = y + Math.sin(a) * d * 0.7;
        return <path key={i} d={`M${cx} ${cy - s} L${cx + s * 0.28} ${cy - s * 0.28} L${cx + s} ${cy} L${cx + s * 0.28} ${cy + s * 0.28} L${cx} ${cy + s} L${cx - s * 0.28} ${cy + s * 0.28} L${cx - s} ${cy} L${cx - s * 0.28} ${cy - s * 0.28}Z`} fill={color} />;
      })}
    </svg>
  );
};

/** Screen shake offset for impacts at the given frames (decays over ~10 frames each). */
export const shakeAt = (frame: number, hits: number[], amp = 14) => {
  let dx = 0;
  let dy = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d < 0 || d > 12) continue;
    const k = amp * Math.exp(-d / 3.5);
    dx += Math.sin(d * 2.7 + h) * k;
    dy += Math.cos(d * 3.1 + h) * k;
  }
  return {dx, dy};
};

// ------------------------------------------------------------------ stage
/**
 * Every scene: electric-blue field with a slowly turning sunburst and drifting bits; the content zooms in a touch
 * over the scene. `shake` offsets the content (impacts), `burst` brightens the centre glow.
 */
export const Stage: React.FC<{children: React.ReactNode; shake?: {dx: number; dy: number}; spin?: number; glow?: number; cy?: number}> = ({
  children,
  shake,
  spin = 0.12,
  glow = 0,
  cy = 820,
}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const zoom = 1 + 0.015 * (frame / Math.max(1, scene.duration)); // small enough that full-width cards stay in the safe band
  const rot = frame * spin;
  const r = rng(77);
  const bits = Array.from({length: 26}, () => ({x: r() * 1080, y: r() * 1920, s: 8 + r() * 18, c: [P.yellow, P.coral, P.mint, P.white, P.pink][Math.floor(r() * 5)], v: 0.4 + r() * 0.8, ph: r() * 6}));
  return (
    <AbsoluteFill style={{background: P.blue, overflow: 'hidden'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`rotate(${rot} 540 ${cy})`}>
          {Array.from({length: 20}, (_, i) => {
            const a = (i / 20) * Math.PI * 2;
            const a2 = a + Math.PI / 20;
            return <path key={i} d={`M540 ${cy} L${540 + Math.cos(a) * 2400} ${cy + Math.sin(a) * 2400} L${540 + Math.cos(a2) * 2400} ${cy + Math.sin(a2) * 2400}Z`} fill={P.ray} />;
          })}
        </g>
        <circle cx={540} cy={cy} r={300 + glow * 120} fill={P.yellow} opacity={0.08 + glow * 0.18} />
        {bits.map((b, i) => {
          const y = ((b.y - frame * b.v * 2 + 1920 * 4) % 2000) - 40;
          const x = b.x + Math.sin(frame / 40 + b.ph) * 20;
          return <rect key={i} x={x} y={y} width={b.s} height={b.s * 0.6} rx={3} fill={b.c} opacity={0.35} transform={`rotate(${frame * b.v * 2 + b.ph * 50} ${x} ${y})`} />;
        })}
      </svg>
      <AbsoluteFill style={{transform: `translate(${shake?.dx ?? 0}px, ${shake?.dy ?? 0}px) scale(${zoom})`, transformOrigin: `540px ${cy}px`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ icons (flat, ink on colour)
type IconP = {s?: number; c?: string; style?: React.CSSProperties};
const svg = (s: number, style: React.CSSProperties | undefined, kids: React.ReactNode, vb = 140) => (
  <svg width={s} height={s} viewBox={`0 0 ${vb} ${vb}`} style={{display: 'block', ...style}}>
    {kids}
  </svg>
);
export const IconTarget: React.FC<IconP> = ({s = 120, c = P.ink, style}) =>
  svg(s, style, <>
    <circle cx="70" cy="70" r="56" fill="none" stroke={c} strokeWidth="12" />
    <circle cx="70" cy="70" r="28" fill="none" stroke={c} strokeWidth="12" />
    <circle cx="70" cy="70" r="8" fill={c} />
  </>);
export const IconFence: React.FC<IconP> = ({s = 120, c = P.ink, style}) =>
  svg(s, style, <>
    <rect x="10" y="44" width="120" height="22" rx="6" fill={c} />
    <rect x="10" y="84" width="120" height="22" rx="6" fill={c} />
    <rect x="24" y="24" width="16" height="104" rx="6" fill={c} />
    <rect x="100" y="24" width="16" height="104" rx="6" fill={c} />
  </>);
export const IconCheck: React.FC<IconP & {p?: number}> = ({s = 120, c = P.ink, style, p = 1}) =>
  svg(s, style, <path d="M22 74 L58 108 L124 30" fill="none" stroke={c} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(p)} />);
export const IconCross: React.FC<IconP & {p?: number}> = ({s = 120, c = P.coral, style, p = 1}) =>
  svg(s, style, <>
    <path d="M30 30 L110 110" stroke={c} strokeWidth="20" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(p * 2)} />
    <path d="M110 30 L30 110" stroke={c} strokeWidth="20" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(p * 2 - 1)} />
  </>);
export const IconLens: React.FC<IconP> = ({s = 120, c = P.ink, style}) =>
  svg(s, style, <>
    <circle cx="58" cy="58" r="38" fill="none" stroke={c} strokeWidth="14" />
    <path d="M86 86 L124 124" stroke={c} strokeWidth="18" strokeLinecap="round" />
  </>);
export const IconCamera: React.FC<IconP> = ({s = 120, c = P.ink, style}) =>
  svg(s, style, <>
    <rect x="12" y="38" width="116" height="80" rx="16" fill={c} />
    <rect x="44" y="24" width="52" height="22" rx="8" fill={c} />
    <circle cx="70" cy="78" r="24" fill={P.white} />
    <circle cx="70" cy="78" r="12" fill={c} />
  </>);

/** Code window ("Claude Code" terminal look). */
export const Window: React.FC<{x: number; y: number; w: number; h: number; title?: string; children?: React.ReactNode; bg?: string; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  title = 'Claude Code',
  children,
  bg = P.navy,
  style,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: bg, borderRadius: 26, boxShadow: `0 14px 0 ${P.shadow}`, overflow: 'hidden', ...style}}>
    <div style={{height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', background: 'rgba(255,255,255,0.08)'}}>
      {[P.coral, P.yellow, P.mint].map((c) => (
        <span key={c} style={{width: 18, height: 18, borderRadius: 9, background: c, display: 'inline-block'}} />
      ))}
      <T size={32} w={800} color={P.sky} style={{marginLeft: 12}}>
        {title}
      </T>
    </div>
    <div style={{padding: '22px 30px'}}>{children}</div>
  </div>
);

/** A document card ("CLAUDE.md"): yellow page with ruled lines; `thick` stacks page edges under it. */
export const Doc: React.FC<{x: number; y: number; w: number; h: number; thick?: number; title?: string; lines?: number; children?: React.ReactNode; scan?: number}> = ({
  x,
  y,
  w,
  h,
  thick = 0,
  title = 'CLAUDE.md',
  lines = 6,
  children,
  scan = -1,
}) => {
  const edges = Math.round(thick);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      {Array.from({length: edges}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 6 + i * 3, top: h - 20 + (i + 1) * 9, width: w - 12, height: 24, background: i % 2 ? '#FFE98A' : '#F5C930', borderRadius: 8, boxShadow: `0 4px 0 ${P.shadow}`}} />
      ))}
      <div style={{position: 'absolute', inset: 0, background: P.yellow, borderRadius: 22, boxShadow: `0 12px 0 ${P.shadow}`, overflow: 'hidden'}}>
        <div style={{height: 62, display: 'flex', alignItems: 'center', padding: '0 26px', borderBottom: `4px solid ${P.ink}22`}}>
          <Mono size={30} color={P.ink}>
            {title}
          </Mono>
        </div>
        <div style={{padding: '18px 26px', position: 'relative'}}>
          {children ??
            Array.from({length: lines}, (_, i) => <div key={i} style={{height: 16, width: `${92 - ((i * 37) % 35)}%`, background: `${P.ink}26`, borderRadius: 8, margin: '16px 0'}} />)}
        </div>
        {scan >= 0 && scan <= 1 && <div style={{position: 'absolute', left: 0, right: 0, top: 62 + scan * (h - 80), height: 34, background: 'rgba(255,255,255,0.75)', mixBlendMode: 'soft-light'}} />}
      </div>
    </div>
  );
};
