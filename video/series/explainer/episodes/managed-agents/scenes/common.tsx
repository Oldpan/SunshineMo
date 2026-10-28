// Episode pieces for "Anthropic 把 Agent 的脑和手拆开了". The page look (ivory + clay, serif heads, mono labels) is the
// shared `claudeblog` kit; this file adds the cast of the Managed Agents blog post: the brain (Claude + harness), the
// hands (sandboxes as interchangeable boxes), the session log tape, keys and the vault.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ClaudeSpark} from '@atv/lib/brand/claude';
import {THEMES} from '@atv/lib/theme';
import {Shell as BaseShell, K, Lab, Zh, Mo, prog, clamp01, FONT_MONO} from '../../../shared/claudeblog';

export * from '../../../shared/claudeblog';

// Night variant for the Dreaming scene. Not flagged dark: the engine would sprinkle stars into the scene fades.
THEMES.claudenight = {bg: '#1B2033', bg2: '#1B2033', accent: '#E9B872', accentSoft: '#2A3150', ink: '#F4F0E8'};

export const N = {
  bg: '#1B2033',
  panel: '#252C45',
  panel2: '#2F3757',
  line: 'rgba(244,240,232,0.22)',
  ink: '#F4F0E8',
  dim: '#A9AFC6',
  moon: '#F2D9A2',
  glow: '#E9B872',
  clay: '#E07F5F',
};

/** A wide moonlit haze that wanders across the night page: dim dots alone barely change pixels on the dark ground,
 * so without it freezedetect flags the long dream beats. */
const NightGlow: React.FC = () => {
  const f = useCurrentFrame();
  const x = 62 + 22 * Math.sin(f / 110);
  const y = 38 + 16 * Math.cos(f / 140);
  const x2 = 24 + 14 * Math.cos(f / 95);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 900px 620px at ${x}% ${y}%, rgba(233,184,114,0.11), transparent 70%), radial-gradient(ellipse 700px 520px at ${x2}% 78%, rgba(120,140,220,0.10), transparent 70%)`,
      }}
    />
  );
};

/** Every scene of this episode drifts a little so no beat holds a frozen frame. */
export const Shell: React.FC<{children: React.ReactNode; part?: string; night?: boolean}> = ({children, part, night}) =>
  night ? (
    <BaseShell drift bg={N.bg} dots="rgba(244,240,232,0.09)">
      <NightGlow />
      {children}
    </BaseShell>
  ) : (
    <BaseShell drift part={part}>
      {children}
    </BaseShell>
  );

/** The brain: Claude + harness, a clay card with the spark and a slowly turning loop arrow. */
export const Brain: React.FC<{x: number; y: number; w?: number; h?: number; label?: string; sub?: string; o?: number; tint?: string}> = ({
  x,
  y,
  w = 300,
  h = 220,
  label = '脑',
  sub = 'Claude + harness',
  o = 1,
  tint = K.peach,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: tint,
        border: `2px solid rgba(201,96,63,0.45)`,
        borderRadius: 22,
        opacity: o,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <div style={{position: 'relative', width: h * 0.38, height: h * 0.38}}>
        <svg width={h * 0.38} height={h * 0.38} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, transform: `rotate(${frame * 1.2}deg)`}}>
          <path d="M 50 8 A 42 42 0 1 1 14 30" fill="none" stroke={K.clay} strokeWidth={5} strokeLinecap="round" />
          <path d="M 6 24 L 14 32 L 22 22" fill="none" stroke={K.clay} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ClaudeSpark size={h * 0.2} color={K.orange} />
        </div>
      </div>
      <Zh size={Math.round(h * 0.15)} w={800}>
        {label}
      </Zh>
      {sub && (
        <Lab size={15} color={K.dim} style={{textTransform: 'none', letterSpacing: 1}}>
          {sub}
        </Lab>
      )}
    </div>
  );
};

/** A hand: a sandbox drawn as a stone box with a tiny terminal. `dead` greys it out with a cross. */
export const Hand: React.FC<{x: number; y: number; w?: number; h?: number; label?: string; tag?: string; dead?: number; o?: number; style?: React.CSSProperties}> = ({
  x,
  y,
  w = 170,
  h = 120,
  label = '沙箱',
  tag,
  dead = 0,
  o = 1,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: K.stone,
      borderRadius: 10,
      opacity: o * (1 - dead * 0.55),
      boxSizing: 'border-box',
      padding: '12px 14px',
      ...style,
    }}
  >
    <div style={{display: 'flex', gap: 5}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 9, height: 9, borderRadius: 9, background: K.line}} />
      ))}
    </div>
    <div style={{marginTop: 10}}>
      <Mo size={Math.min(20, h * 0.16)} color={K.dim}>
        $ _
      </Mo>
    </div>
    <div style={{position: 'absolute', left: 14, bottom: 10}}>
      <Zh size={Math.min(24, h * 0.2)} w={700}>
        {label}
      </Zh>
    </div>
    {tag && (
      <div style={{position: 'absolute', right: 10, top: 8}}>
        <Lab size={13} color={K.faint}>
          {tag}
        </Lab>
      </div>
    )}
    {dead > 0 && (
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M ${w * 0.3} ${h * 0.25} L ${w * 0.3 + w * 0.4 * dead} ${h * 0.25 + h * 0.5 * dead}`} stroke={K.red} strokeWidth={6} strokeLinecap="round" />
        <path d={`M ${w * 0.7} ${h * 0.25} L ${w * 0.7 - w * 0.4 * dead} ${h * 0.25 + h * 0.5 * dead}`} stroke={K.red} strokeWidth={6} strokeLinecap="round" />
      </svg>
    )}
  </div>
);

/** The session log: an append-only tape of event ticks. `n` ticks visible (fractional = the newest growing in). */
export const LogTape: React.FC<{x: number; y: number; w: number; n: number; cap?: number; hot?: number; label?: boolean; dark?: boolean}> = ({
  x,
  y,
  w,
  n,
  cap = 18,
  hot = -1,
  label = true,
  dark,
}) => {
  const cell = w / cap;
  const full = Math.floor(n);
  const part = n - full;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w}}>
      {label && (
        <div style={{marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 12}}>
          <Lab size={16} color={dark ? N.dim : K.clay} w={700}>
            session log
          </Lab>
          <Zh size={18} w={500} color={dark ? N.dim : K.faint}>
            只追加
          </Zh>
        </div>
      )}
      <div style={{position: 'relative', height: 46, borderRadius: 8, background: dark ? N.panel : '#fff', border: `1.5px solid ${dark ? N.line : 'rgba(20,20,19,0.12)'}`, overflow: 'hidden'}}>
        {Array.from({length: Math.min(cap, full + 1)}).map((_, i) => {
          const s = i < full ? 1 : part;
          if (s <= 0) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * cell + 5,
                top: 9,
                width: cell - 10,
                height: 28,
                borderRadius: 4,
                background: i === hot ? K.clay : dark ? N.panel2 : K.stone,
                opacity: s,
                transform: `scaleY(${0.4 + 0.6 * s})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/** Little key glyph. */
export const KeyGlyph: React.FC<{size?: number; color?: string}> = ({size = 40, color = K.clay}) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 64 40">
    <circle cx={14} cy={20} r={10} fill="none" stroke={color} strokeWidth={5} />
    <path d="M 24 20 L 58 20 M 48 20 L 48 30 M 56 20 L 56 28" stroke={color} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

/** Code chip in mono on stone, e.g. execute(name, input) → string. */
export const Code: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties; hot?: boolean; dark?: boolean}> = ({children, size = 26, style, hot, dark}) => (
  <span
    style={{
      fontFamily: FONT_MONO,
      fontSize: size,
      fontWeight: 600,
      color: hot ? '#fff' : dark ? N.ink : K.ink,
      background: hot ? K.clay : dark ? N.panel2 : '#fff',
      border: `1.5px solid ${hot ? K.clay : dark ? N.line : 'rgba(20,20,19,0.14)'}`,
      borderRadius: 8,
      padding: '6px 14px',
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}
  >
    {children}
  </span>
);

/** A row label + bar for the TTFT chart. */
export const Bar: React.FC<{w: number; v: number; p: number; color: string; h?: number}> = ({w, v, p, color, h = 46}) => (
  <div style={{width: w, height: h, background: 'rgba(20,20,19,0.05)', borderRadius: 6, position: 'relative'}}>
    <div style={{position: 'absolute', left: 0, top: 0, height: h, width: w * v * clamp01(p), background: color, borderRadius: 6}} />
  </div>
);

export {prog};
