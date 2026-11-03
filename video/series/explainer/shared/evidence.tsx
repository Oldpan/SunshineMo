// Shared 「视觉调查 / 证据墙」 look (lemo-opuscar `visual-investigation`), first made for qwen4-preview.
// A dark cork wall seen through a slowly moving camera. Evidence is pinned to it as cards (screenshots, quotes,
// numbers). Every card carries a rubber stamp saying how solid it is (official / reported live / community code /
// rumour / inference) and a source line. Red string ties cards together.
//
// Coordinates: everything on the wall is placed in BOARD space (BW x BH px). The camera keyframes say which board
// point sits at the screen centre and how far we are zoomed; between keyframes it eases, and it never stops
// drifting, so long holds do not read as frozen frames (freezedetect n=0.0005 d=0.5).
import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_NUM, FONT_SCRIPT, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene, useSpring} from '@atv/lib/timing';

// Dark theme: chrome draws a light subtitle box and hides its nav (we draw our own section tag).
THEMES.wall = {bg: '#1E1D1B', bg2: '#2A2826', accent: '#E0483E', accentSoft: '#3A2522', ink: '#F3EEE6', dark: true};

export {FONT_MONO, FONT_NUM, FONT_SCRIPT, FONT_ZH, clamp01, prog};

export const W = {
  wall: '#1E1D1B',
  wall2: '#26241F',
  paper: '#F7F3EA',
  card: '#FFFFFF',
  ink: '#1C1B19',
  dim: '#6B665E',
  chalk: '#F3EEE6',
  chalkDim: 'rgba(243,238,230,0.55)',
  string: '#D8352B',
  pin: '#E0483E',
  note: '#F6D860',
  hl: 'rgba(255,214,0,0.42)',
};

export const BW = 3840;
export const BH = 2160;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ stamps
export type Kind = 'official' | 'live' | 'code' | 'rumor' | 'infer' | 'none';
export const KIND: Record<Exclude<Kind, 'none'>, {zh: string; en: string; color: string; dashed?: boolean}> = {
  official: {zh: '官方', en: 'OFFICIAL', color: '#2E8B57'},
  live: {zh: '现场转述', en: 'REPORTED', color: '#2F6FD0'},
  code: {zh: '社区代码', en: 'COMMUNITY CODE', color: '#55534E'},
  rumor: {zh: '社区传闻', en: 'RUMOUR', color: '#E07B1F'},
  infer: {zh: '推断', en: 'INFERENCE', color: '#8C8880', dashed: true},
};

/** Rubber stamp; `t` = frames since it should slam down. */
export const Stamp: React.FC<{kind: Exclude<Kind, 'none'>; t: number; size?: number; rot?: number; label?: string}> = ({
  kind,
  t,
  size = 30,
  rot = -8,
  label,
}) => {
  const k = KIND[kind];
  const s = prog(t, 9);
  if (t < 0) return null;
  const scale = lerp(2.2, 1, s);
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${size * 0.18}px ${size * 0.5}px`,
        border: `${Math.max(3, size * 0.12)}px ${k.dashed ? 'dashed' : 'solid'} ${k.color}`,
        borderRadius: size * 0.25,
        color: k.color,
        transform: `rotate(${rot}deg) scale(${scale})`,
        opacity: clamp01(s * 1.4) * 0.92,
        background: 'rgba(255,255,255,0.9)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, letterSpacing: size * 0.08, lineHeight: 1.1}}>{label ?? k.zh}</span>
      <span style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: size * 0.36, letterSpacing: size * 0.06}}>{k.en}</span>
    </div>
  );
};

/** A big slanted verdict stamp across a card ("已跳票", "不用信"). */
export const Verdict: React.FC<{text: string; t: number; color?: string; size?: number; rot?: number}> = ({
  text,
  t,
  color = '#D8352B',
  size = 64,
  rot = -12,
}) => {
  if (t < 0) return null;
  const s = prog(t, 8);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.4, 1, s)})`,
        opacity: clamp01(s * 1.5) * 0.9,
        border: `8px double ${color}`,
        borderRadius: 14,
        padding: '6px 28px',
        color,
        fontFamily: FONT_ZH,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: 8,
        whiteSpace: 'nowrap',
        background: 'rgba(255,255,255,0.55)',
        zIndex: 5,
      }}
    >
      {text}
    </div>
  );
};

// ------------------------------------------------------------------ cards
export type CardProps = {
  x: number; // board px, card top-left
  y: number;
  w: number;
  t: number; // frames since the card should be pinned
  rot?: number;
  kind?: Kind;
  stampAt?: number; // frames after `t` that the stamp lands (default 10)
  stampLabel?: string;
  src?: string; // source line under the card
  pad?: number;
  bg?: string;
  children?: React.ReactNode;
  dim?: number; // 0..1, fade the card back when something else is in focus
  z?: number;
};

/** A pinned card: drops in from slightly above, a red pin pops, then the stamp slams. */
export const Card: React.FC<CardProps> = ({x, y, w, t, rot = 0, kind = 'none', stampAt = 10, stampLabel, src, pad = 18, bg = W.card, children, dim = 0, z = 1}) => {
  const sp = useSpring();
  if (t < -2) return null;
  const s = sp(t, 0, {damping: 16, stiffness: 160});
  const drop = (1 - s) * -60;
  const sc = lerp(1.06, 1, s);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        transform: `translateY(${drop}px) rotate(${rot}deg) scale(${sc})`,
        transformOrigin: '50% 0%',
        opacity: clamp01(s * 1.6) * (1 - dim * 0.65),
        filter: dim > 0.01 ? `saturate(${1 - dim * 0.6})` : undefined,
        zIndex: z,
      }}
    >
      <div
        style={{
          background: bg,
          padding: pad,
          borderRadius: 4,
          boxShadow: `0 ${18 * s}px ${40 * s}px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.4)`,
          position: 'relative',
        }}
      >
        {children}
        {kind !== 'none' && (
          <div style={{position: 'absolute', left: -26, top: -30, zIndex: 4}}>
            <Stamp kind={kind} t={t - stampAt} label={stampLabel} />
          </div>
        )}
      </div>
      <Pin t={t - 4} />
      {src && (
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT_MONO,
            fontSize: 19,
            color: W.chalkDim,
            letterSpacing: 0.5,
            opacity: prog(t, 12, 12),
            whiteSpace: 'nowrap',
          }}
        >
          {src}
        </div>
      )}
    </div>
  );
};

const Pin: React.FC<{t: number}> = ({t}) => {
  const sp = useSpring();
  const s = t < 0 ? 0 : sp(t, 0, {damping: 9, stiffness: 220});
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: -12,
        width: 26,
        height: 26,
        marginLeft: -13,
        borderRadius: 13,
        background: `radial-gradient(circle at 35% 35%, #FF8A80, ${W.pin} 55%, #8E1E18)`,
        boxShadow: '0 6px 8px rgba(0,0,0,0.5)',
        transform: `scale(${s})`,
        zIndex: 6,
      }}
    />
  );
};

/** A screenshot on a card. `hl` draws marker highlights (fractions of the image box) that sweep in at `hlAt`. */
export const Shot: React.FC<{img: string; t?: number; hl?: {x: number; y: number; w: number; h: number; at: number}[]; radius?: number}> = ({
  img,
  t = 0,
  hl = [],
  radius = 2,
}) => (
  <div style={{position: 'relative', lineHeight: 0}}>
    <Img src={img} style={{width: '100%', borderRadius: radius, border: '1px solid rgba(0,0,0,0.08)'}} />
    {hl.map((h, i) => {
      const p = prog(t - h.at, 14);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            width: `${h.w * 100 * p}%`,
            height: `${h.h * 100}%`,
            background: W.hl,
            mixBlendMode: 'multiply',
            borderRadius: 3,
          }}
        />
      );
    })}
  </div>
);

/** Ring drawn around a region of the card (fractions), like a red marker circle. */
export const Ring: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string}> = ({x, y, w, h, t, color = W.string}) => {
  if (t < 0) return null;
  const p = prog(t, 16);
  return (
    <svg style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%`, overflow: 'visible', zIndex: 3}} viewBox="0 0 100 100" preserveAspectRatio="none">
      <ellipse cx="50" cy="50" rx="52" ry="58" fill="none" stroke={color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} style={{strokeWidth: 5}} />
    </svg>
  );
};

// ------------------------------------------------------------------ text on cards
export const Zh: React.FC<{children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties}> = ({
  children,
  size = 32,
  color = W.ink,
  w = 700,
  style,
}) => <div style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.35, ...style}}>{children}</div>;

export const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties}> = ({
  children,
  size = 26,
  color = W.ink,
  w = 500,
  style,
}) => <div style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, lineHeight: 1.4, ...style}}>{children}</div>;

/** Handwritten sticky note. */
export const Note: React.FC<{x: number; y: number; w?: number; t: number; rot?: number; children: React.ReactNode; color?: string; size?: number}> = ({
  x,
  y,
  w = 360,
  t,
  rot = 3,
  children,
  color = W.note,
  size = 40,
}) => {
  const sp = useSpring();
  if (t < -2) return null;
  const s = sp(t, 0, {damping: 14, stiffness: 180});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        padding: '22px 26px',
        background: color,
        boxShadow: '0 14px 24px rgba(0,0,0,0.45)',
        transform: `rotate(${rot}deg) scale(${lerp(0.7, 1, s)})`,
        opacity: clamp01(s * 1.6),
        fontFamily: FONT_SCRIPT,
        fontSize: size,
        color: '#2A2418',
        lineHeight: 1.3,
        zIndex: 7,
      }}
    >
      {children}
    </div>
  );
};

/** Chalk text written straight on the wall. */
export const Chalk: React.FC<{x: number; y: number; t: number; size?: number; children: React.ReactNode; color?: string; w?: number; font?: string; align?: 'left' | 'center'}> = ({
  x,
  y,
  t,
  size = 44,
  children,
  color = W.chalk,
  w = 700,
  font = FONT_ZH,
  align = 'left',
}) => {
  if (t < -2) return null;
  const p = prog(t, 14);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'center' ? '-50%' : '0'}, ${(1 - p) * 16}px)`,
        opacity: p,
        fontFamily: font,
        fontSize: size,
        fontWeight: w,
        color,
        whiteSpace: 'nowrap',
        lineHeight: 1.25,
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
};

// ------------------------------------------------------------------ red string
/** String between two board points; sags a little and is drawn from a to b over 18 frames. */
export const Thread: React.FC<{a: [number, number]; b: [number, number]; t: number; sag?: number; color?: string; width?: number}> = ({
  a,
  b,
  t,
  sag = 60,
  color = W.string,
  width = 5,
}) => {
  if (t < 0) return null;
  const p = prog(t, 18);
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 + sag;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, width: BW, height: BH, overflow: 'visible', pointerEvents: 'none', zIndex: 8}}>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={width + 2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} transform="translate(4 8)" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
    </svg>
  );
};

// ------------------------------------------------------------------ numbers
export const Count: React.FC<{to: number; t: number; dur?: number; decimals?: number; suffix?: string; style?: React.CSSProperties}> = ({
  to,
  t,
  dur = 30,
  decimals = 0,
  suffix = '',
  style,
}) => {
  const v = to * prog(t, dur);
  return <span style={{fontFamily: FONT_NUM, fontVariantNumeric: 'tabular-nums', ...style}}>{v.toFixed(decimals)}{suffix}</span>;
};

// ------------------------------------------------------------------ camera + wall
export type Cam = {f: number; x: number; y: number; z: number}; // at frame f: board point (x,y) at screen centre, zoom z

const camAt = (cams: Cam[], f: number) => {
  if (f <= cams[0].f) return cams[0];
  for (let i = 1; i < cams.length; i++) {
    const a = cams[i - 1],
      b = cams[i];
    if (f < b.f) {
      // move over at most 26 frames, starting at b.f - 26 (so the camera arrives as the beat starts)
      const dur = Math.min(26, b.f - a.f);
      const t = EASE(clamp01((f - (b.f - dur)) / dur));
      return {f, x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t)};
    }
  }
  return cams[cams.length - 1];
};

/**
 * Every scene: the cork wall + camera. `cams` use absolute scene frames (use beat starts from useBeats/scene).
 * The camera also creeps (slow push-in + lateral slide) all the time.
 */
export const Wall: React.FC<{cams: Cam[]; part?: string; children: React.ReactNode; overlay?: React.ReactNode}> = ({cams, part, children, overlay}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const c = camAt(cams, frame);
  const creep = 1 + (frame / Math.max(1, scene.duration)) * 0.035;
  const slide = Math.sin(frame / 70) * 16 + (frame / Math.max(1, scene.duration)) * 40;
  const z = c.z * creep;
  const enter = prog(frame, 18);
  const exit = interpolate(frame, [scene.duration - 10, scene.duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});
  const veil = Math.max(1 - enter, exit);
  const tx = 960 - (c.x + slide) * z;
  const ty = 540 - c.y * z;
  return (
    <AbsoluteFill style={{background: W.wall, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: '0 0'}}>
        <Cork />
        {children}
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: veil * 0.85, pointerEvents: 'none'}} />
      {part && <PartTag text={part} />}
      {overlay}
    </AbsoluteFill>
  );
};

/** Cork texture: layered gradients, a faint grid and a few pin holes. Purely CSS so it costs nothing per frame. */
const Cork: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: -BW,
      top: -BH,
      width: BW * 3,
      height: BH * 3,
      backgroundColor: W.wall,
      backgroundImage: [
        'radial-gradient(rgba(255,240,220,0.035) 1.5px, transparent 2px)',
        'radial-gradient(rgba(0,0,0,0.25) 1.2px, transparent 1.8px)',
        'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
      ].join(','),
      backgroundSize: '23px 23px, 17px 17px, 120px 120px, 120px 120px',
      backgroundPosition: '0 0, 7px 9px, 0 0, 0 0',
    }}
  />
);

const PartTag: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 14, 6);
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        opacity: p,
        transform: `translateX(${(1 - p) * -20}px)`,
        background: 'rgba(20,19,17,0.82)',
        padding: '10px 20px 10px 16px',
        borderRadius: 10,
        zIndex: 20,
      }}
    >
      <div style={{width: 14, height: 14, borderRadius: 7, background: W.pin, boxShadow: '0 0 12px rgba(224,72,62,0.8)'}} />
      <span style={{fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: W.chalk, letterSpacing: 3}}>{text}</span>
    </div>
  );
};

/** Legend of the five stamps, for the opening. */
export const Legend: React.FC<{x: number; y: number; t: number; gap?: number}> = ({x, y, t, gap = 9}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: 44}}>
    {(Object.keys(KIND) as Exclude<Kind, 'none'>[]).map((k, i) => (
      <Stamp key={k} kind={k} t={t - i * gap} size={40} rot={i % 2 ? 5 : -6} />
    ))}
  </div>
);
