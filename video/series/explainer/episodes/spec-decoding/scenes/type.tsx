// "Typing close-up + flat diagrams" look (v2, 2026-11-01; replaces the iso token factory).
// Top: one real sentence being written, token by token, in an editor line. Drafts appear as ghost text in dashed
// amber boxes; the big model's check turns them ink with a green tick (kept), red and struck (the first miss),
// grey and struck (everything after it); the big model's own token is violet. Below: a flat SVG diagram of how the
// method drafts (boxes, layer stacks, arrows), redrawn from the paper's own figure. Right: number cards.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {useBeats, useScene} from '@atv/lib/timing';

export const W = 1920,
  H = 1080;

/** One hue per role for the whole film. */
export const C = {
  page: '#F6F3EC',
  card: '#FFFDF8',
  line: '#DDD5C7',
  ink: '#23201C',
  dim: '#8A837A',
  faint: '#B9B1A4',
  draft: '#C9962B', // draft tokens waiting for the check
  draftBg: '#FBF1DA',
  ok: '#3F8F4E',
  okBg: '#E4F1E2',
  bad: '#C8483A',
  model: '#6B4FBB', // the token the big model writes itself
  modelBg: '#ECE6F8',
  target: '#3D63A8', // the big model
  targetBg: '#E3EAF5',
  drafter: '#2E8C89', // draft machines
  drafterBg: '#DDEFEE',
};
export const ZH = '"Noto Sans SC", "PingFang SC", sans-serif';
export const NUM = '"Jost", "Outfit", "Noto Sans SC", sans-serif';

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const EASE = Easing.bezier(0.22, 1, 0.36, 1);
/** 0→1 over `dur` frames starting at frame `at`, eased. */
export const ease = (f: number, at: number, dur = 14) => EASE(clamp((f - at) / dur));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ page
export type Ctx = {f: number; b: number[]};

/**
 * Every scene: warm paper, a faint dot grid that creeps, and the content sinking 12 px over the scene, so a long
 * held sentence never reads as a frozen frame (house rule: freezedetect n=0.0005 d=0.5 stays quiet).
 */
export const Page: React.FC<{tag?: string; title?: string; sub?: string; children: (c: Ctx) => React.ReactNode}> = ({tag, title, sub, children}) => {
  const f = useCurrentFrame();
  const scene = useScene();
  const b = useBeats().map((v) => f - v);
  const p = f / Math.max(scene.duration, 1);
  const enter = ease(f, 0, 16);
  const grid = f * 0.4;
  return (
    <AbsoluteFill style={{background: C.page, fontFamily: ZH, color: C.ink}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(35,32,28,0.09) 1.5px, transparent 1.7px)',
          backgroundSize: '36px 36px',
          backgroundPosition: `${grid}px ${grid * 0.5}px`,
        }}
      />
      <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 24 - 12 * p}px)`, opacity: enter}}>
        {tag && <div style={{position: 'absolute', left: 96, top: 54, font: `600 26px ${NUM}`, color: C.drafter, letterSpacing: 1}}>{tag}</div>}
        {title && <div style={{position: 'absolute', left: 96, top: 86, font: `700 52px ${ZH}`, letterSpacing: 1}}>{title}</div>}
        {sub && <div style={{position: 'absolute', left: 98, top: 156, font: `500 24px ${ZH}`, color: C.dim}}>{sub}</div>}
        {children({f, b})}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the sentence
export type TokState = 'done' | 'draft' | 'ok' | 'bad' | 'void' | 'model' | 'mask';
export type Tok = {t: string; s: TokState; a?: number; tag?: string; dy?: number};

const tokStyle = (s: TokState): {color: string; bg: string; border: string} => {
  switch (s) {
    case 'draft':
      return {color: C.draft, bg: C.draftBg, border: `2px dashed ${C.draft}`};
    case 'ok':
      return {color: C.ink, bg: C.okBg, border: `2px solid ${C.ok}`};
    case 'bad':
      return {color: C.bad, bg: 'transparent', border: `2px solid ${C.bad}`};
    case 'void':
      return {color: C.faint, bg: 'transparent', border: `2px dashed ${C.line}`};
    case 'model':
      return {color: C.model, bg: C.modelBg, border: `2px solid ${C.model}`};
    case 'mask':
      return {color: C.faint, bg: '#EFEAE0', border: `2px dashed ${C.faint}`};
    default:
      return {color: C.ink, bg: 'transparent', border: '2px solid transparent'};
  }
};

/** The editor line: committed text plus this round's drafts. `size` is the glyph size in px. */
export const Sentence: React.FC<{toks: Tok[]; x?: number; y?: number; w?: number; size?: number; label?: string; caret?: boolean; f: number}> = ({
  toks,
  x = 96,
  y = 220,
  w = 1728,
  size = 64,
  label = '输出',
  caret = true,
  f,
}) => {
  const cell = size * 1.18;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: cell + 92, background: C.card, border: `2px solid ${C.line}`, borderRadius: 18}}>
      <div style={{position: 'absolute', right: 26, top: 16, font: `600 20px ${ZH}`, color: C.dim, letterSpacing: 2}}>{label}</div>
      <div style={{position: 'absolute', left: 26, top: 56, display: 'flex', alignItems: 'flex-end', gap: 6}}>
        {toks.map((k, i) => {
          const a = k.a ?? 1;
          const st = tokStyle(k.s);
          const boxed = k.s !== 'done';
          const struck = k.s === 'bad' || k.s === 'void';
          return (
            <div key={i} style={{position: 'relative', width: cell, height: cell, opacity: a, transform: `translateY(${(1 - a) * -16 + (k.dy ?? 0)}px)`}}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 10,
                  background: boxed ? st.bg : 'transparent',
                  border: boxed ? st.border : 'none',
                }}
              />
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `${k.s === 'done' ? 500 : 600} ${size}px ${ZH}`, color: st.color}}>{k.t}</div>
              {struck && <div style={{position: 'absolute', left: 8, right: 8, top: cell / 2, height: 4, background: k.s === 'bad' ? C.bad : C.faint, transform: 'rotate(-8deg)'}} />}
              {k.s === 'ok' && <div style={{position: 'absolute', left: 0, right: 0, top: -30, textAlign: 'center', font: `700 24px ${ZH}`, color: C.ok}}>✓</div>}
              {k.tag && (
                <div style={{position: 'absolute', left: '50%', top: cell + 8, transform: 'translateX(-50%)', whiteSpace: 'nowrap', font: `600 18px ${ZH}`, color: st.color === C.ink ? C.dim : st.color}}>{k.tag}</div>
              )}
            </div>
          );
        })}
        {caret && <div style={{width: 4, height: cell * 0.8, marginBottom: cell * 0.1, background: C.ink, opacity: Math.floor(f / 15) % 2 ? 0.15 : 0.9}} />}
      </div>
    </div>
  );
};

/** Committed text as `done` tokens. */
export const done = (s: string): Tok[] => s.split('').map((t) => ({t, s: 'done'}));

// ------------------------------------------------------------------ flat diagram parts (SVG, page coordinates)
export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <defs>
      {Object.entries({ink: C.ink, dim: C.dim, target: C.target, drafter: C.drafter, ok: C.ok, bad: C.bad, model: C.model, draft: C.draft}).map(([k, c]) => (
        <marker key={k} id={`ah-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={c} />
        </marker>
      ))}
    </defs>
    {children}
  </svg>
);

export const Box: React.FC<{x: number; y: number; w: number; h: number; fill?: string; stroke?: string; r?: number; a?: number; label?: string; sub?: string; size?: number; dash?: boolean; color?: string}> = ({
  x,
  y,
  w,
  h,
  fill = C.card,
  stroke = C.ink,
  r = 12,
  a = 1,
  label,
  sub,
  size = 26,
  dash,
  color,
}) => (
  <g opacity={a}>
    <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={2.5} strokeDasharray={dash ? '9 7' : undefined} />
    {label && (
      <text x={x + w / 2} y={y + h / 2 + (sub ? -4 : size * 0.36)} textAnchor="middle" style={{font: `700 ${size}px ${ZH}`, fill: color ?? C.ink}}>
        {label}
      </text>
    )}
    {sub && (
      <text x={x + w / 2} y={y + h / 2 + size * 0.36 + 18} textAnchor="middle" style={{font: `500 ${Math.max(18, Math.round(size * 0.72))}px ${ZH}`, fill: C.dim}}>
        {sub}
      </text>
    )}
  </g>
);

/** A Transformer as a stack of layers (bottom = layer 1). `hi` lights the listed layer indices. */
export const Stack: React.FC<{x: number; y: number; w: number; h: number; n: number; color: string; bg: string; a?: number; label?: string; hi?: number[]; pulse?: number}> = ({
  x,
  y,
  w,
  h,
  n,
  color,
  bg,
  a = 1,
  label,
  hi = [],
  pulse = 0,
}) => {
  const gap = 6,
    lh = (h - gap * (n - 1)) / n;
  return (
    <g opacity={a}>
      {Array.from({length: n}, (_, i) => {
        const yy = y + h - (i + 1) * lh - i * gap;
        const lit = hi.includes(i);
        return <rect key={i} x={x} y={yy} width={w} height={lh} rx={6} fill={lit ? color : bg} stroke={color} strokeWidth={2} opacity={lit ? 0.9 + pulse * 0.1 : 1} />;
      })}
      {label && (
        <text x={x + w / 2} y={y - 16} textAnchor="middle" style={{font: `700 26px ${ZH}`, fill: color}}>
          {label}
        </text>
      )}
    </g>
  );
};
/** Centre y of layer i in a Stack. */
export const layerY = (y: number, h: number, n: number, i: number) => {
  const gap = 6,
    lh = (h - gap * (n - 1)) / n;
  return y + h - (i + 1) * lh - i * gap + lh / 2;
};

/** Polyline arrow; `p` 0..1 draws it on. */
export const Arrow: React.FC<{pts: [number, number][]; color?: string; tone?: string; w?: number; dash?: boolean; p?: number; a?: number; label?: string; lx?: number; ly?: number; head?: boolean}> = ({
  pts,
  color = C.ink,
  tone = 'ink',
  w = 3,
  dash,
  p = 1,
  a = 1,
  label,
  lx,
  ly,
  head = true,
}) => {
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return (
    <g opacity={a}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinejoin="round"
        strokeDasharray={dash ? `10 8` : `${len} ${len}`}
        strokeDashoffset={dash ? 0 : len * (1 - p)}
        opacity={dash ? p : 1}
        markerEnd={head && p > 0.98 ? `url(#ah-${tone})` : undefined}
      />
      {label && (
        <text x={lx} y={ly} style={{font: `600 21px ${ZH}`, fill: color}} opacity={clamp(p * 2 - 1)}>
          {label}
        </text>
      )}
    </g>
  );
};

/** A small token chip inside a diagram. */
export const Chip: React.FC<{x: number; y: number; t: string; s?: TokState; a?: number; size?: number}> = ({x, y, t, s = 'draft', a = 1, size = 30}) => {
  const st = tokStyle(s);
  const c = size * 1.3;
  return (
    <g opacity={a}>
      <rect x={x - c / 2} y={y - c / 2} width={c} height={c} rx={7} fill={s === 'done' ? C.card : st.bg} stroke={s === 'done' ? C.line : st.color} strokeWidth={2} strokeDasharray={s === 'draft' || s === 'mask' ? '6 4' : undefined} />
      <text x={x} y={y + size * 0.36} textAnchor="middle" style={{font: `600 ${size}px ${ZH}`, fill: st.color}}>
        {t}
      </text>
    </g>
  );
};

export const Label: React.FC<{x: number; y: number; t: string; size?: number; color?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; a?: number}> = ({
  x,
  y,
  t,
  size = 22,
  color = C.dim,
  weight = 500,
  anchor = 'start',
  a = 1,
}) => (
  <text x={x} y={y} textAnchor={anchor} opacity={a} style={{font: `${weight} ${size}px ${ZH}`, fill: color}}>
    {t}
  </text>
);

// ------------------------------------------------------------------ cards
export const Card: React.FC<{x: number; y: number; w: number; a?: number; head?: string; rows: {t: string; sub?: string; c?: string; a?: number}[]}> = ({x, y, w, a = 1, head, rows}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '20px 26px 18px', background: C.card, border: `2px solid ${C.line}`, borderRadius: 16, opacity: a, boxSizing: 'border-box'}}>
    {head && <div style={{font: `700 22px ${ZH}`, color: C.dim, marginBottom: 10, letterSpacing: 1}}>{head}</div>}
    {rows.map((r, i) => (
      <div key={i} style={{display: 'flex', gap: 12, alignItems: 'baseline', marginTop: i ? 12 : 0, opacity: r.a ?? 1}}>
        {r.c && <div style={{width: 14, height: 14, borderRadius: 4, background: r.c, flex: 'none', transform: 'translateY(1px)'}} />}
        <div>
          <div style={{font: `600 26px ${ZH}`}}>{r.t}</div>
          {r.sub && <div style={{font: `500 20px ${ZH}`, color: C.dim, marginTop: 4}}>{r.sub}</div>}
        </div>
      </div>
    ))}
  </div>
);

/** Source line above the subtitle zone. */
export const Src: React.FC<{t: string; a?: number}> = ({t, a = 1}) => (
  <div style={{position: 'absolute', left: 96, top: 900, font: `500 18px ${ZH}`, color: C.dim, opacity: a}}>{t}</div>
);

export const fade = (f: number, at: number, dur = 14) => interpolate(f, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** A bilingual term tag: 中文 + the paper's English name. */
export const Term: React.FC<{x: number; y: number; zh: string; en: string; c?: string; a?: number; size?: number}> = ({x, y, zh, en, c = C.ink, a = 1, size = 24}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: a, display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap'}}>
    <span style={{font: `700 ${size}px ${ZH}`, color: c}}>{zh}</span>
    <span style={{font: `500 ${Math.round(size * 0.82)}px ${NUM}`, color: C.dim, fontStyle: 'italic'}}>{en}</span>
  </div>
);

/** SVG version of Term, for labels inside a diagram. */
export const TermS: React.FC<{x: number; y: number; zh: string; en: string; c?: string; a?: number; size?: number; anchor?: 'start' | 'middle' | 'end'}> = ({
  x,
  y,
  zh,
  en,
  c = C.ink,
  a = 1,
  size = 24,
  anchor = 'start',
}) => (
  <text x={x} y={y} textAnchor={anchor} opacity={a}>
    <tspan style={{font: `700 ${size}px ${ZH}`, fill: c}}>{zh}</tspan>
    <tspan dx={8} style={{font: `italic 500 ${Math.max(18, Math.round(size * 0.82))}px ${NUM}`, fill: C.dim}}>
      {en}
    </tspan>
  </text>
);

/** A DOM quote card. */
export const Quote: React.FC<{x: number; y: number; w: number; a?: number; q: string; src: string}> = ({x, y, w, a = 1, q, src}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '20px 26px', boxSizing: 'border-box', background: C.card, border: `2px solid ${C.line}`, borderLeft: `6px solid ${C.target}`, borderRadius: 12, opacity: a}}>
    <div style={{font: `italic 500 25px ${NUM}`, color: C.ink, lineHeight: 1.4}}>“{q}”</div>
    <div style={{font: `500 19px ${ZH}`, color: C.dim, marginTop: 10}}>{src}</div>
  </div>
);

/** Round-by-round sentence state: committed text, then this round's drafts being checked. */
export type Round = {chars: string[]; ok: number; fix: string};
export const roundToks = (r: Round, tk: number, T = {show: 4, check: 22, step: 5, fix: 36}): Tok[] => {
  const out: Tok[] = [];
  const bad = r.ok < r.chars.length ? r.ok : -1;
  r.chars.forEach((t, i) => {
    const a = ease(tk, T.show + i * 3, 8);
    const at = T.check + i * T.step;
    if (bad >= 0 && i > bad && tk >= T.fix + 6) return;
    if (i === bad && tk >= T.fix + 6) return;
    let s: TokState = 'draft';
    if (tk >= at) s = i < r.ok ? 'ok' : i === bad ? 'bad' : 'void';
    out.push({t, s, a});
  });
  if (tk >= T.fix + 6) out.push({t: r.fix, s: 'model', a: ease(tk, T.fix + 6, 8)});
  return out;
};

/** One token cell, inline (for legends). */
export const TokBox: React.FC<{t: string; s: TokState; size?: number}> = ({t, s, size = 34}) => {
  const st = tokStyle(s);
  const cell = size * 1.18;
  const struck = s === 'bad' || s === 'void';
  return (
    <div style={{position: 'relative', width: cell, height: cell, flex: 'none'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 8, background: s === 'done' ? 'transparent' : st.bg, border: s === 'done' ? 'none' : st.border}} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${size}px ${ZH}`, color: st.color}}>{t}</div>
      {struck && <div style={{position: 'absolute', left: 5, right: 5, top: cell / 2, height: 3, background: s === 'bad' ? C.bad : C.faint, transform: 'rotate(-8deg)'}} />}
    </div>
  );
};
