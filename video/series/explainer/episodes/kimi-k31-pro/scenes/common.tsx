// Shared look for "故意调弱的开源旗舰：Kimi K3.1 Pro".
// Grammar borrowed from huashu-art-motion t3_finance_chart (dark theme): axes first, data grows when it is said,
// one hero colour (K3.1 Pro) and everything else grey, bars from zero, source line on every chart.
// Moonshot's logo is not drawn (no official artwork at hand); model names appear as text only.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_NUM, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene, useSpring} from '@atv/lib/timing';

// The episode's dark theme. Background (lib/chrome) reads THEMES by name, so register it before the first render.
THEMES.kimi = {bg: '#07090D', bg2: '#0C1D2C', accent: '#3FD0FF', accentSoft: '#10202C', ink: '#EEF2F7', dark: true};

export const K = {
  bg: '#07090D',
  panel: '#0E131B',
  panel2: '#141B26',
  line: 'rgba(255,255,255,0.08)',
  grid: 'rgba(255,255,255,0.10)',
  ink: '#EEF2F7',
  dim: '#8C96A8',
  faint: '#4C5566',
  grey: '#3A4352', // non-hero bars
  grey2: '#566174',
  hero: '#3FD0FF', // Kimi K3.1 Pro
  hero2: '#8FA2FF', // K3 / earlier Kimi
  warn: '#FFB347',
  red: '#FF6170',
  green: '#5BE49B',
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
/** 0..1 eased progress (alias of lib prog). */
export const p = prog;

// ------------------------------------------------------------------ text
type TxtProps = {children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties};
export const Zh: React.FC<TxtProps> = ({children, size = 32, color = K.ink, w = 700, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.3, ...style}}>{children}</span>
);
export const Mo: React.FC<TxtProps> = ({children, size = 24, color = K.dim, w = 600, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, ...style}}>{children}</span>
);
export const Num: React.FC<TxtProps> = ({children, size = 96, color = K.hero, w = 800, style}) => (
  <span style={{fontFamily: FONT_NUM, fontSize: size, fontWeight: w, color, lineHeight: 1, letterSpacing: -1, fontVariantNumeric: 'tabular-nums', ...style}}>
    {children}
  </span>
);

/** Count-up number that lands exactly when f reaches dur (easeOutExpo, CountUp.js style). */
export const count = (f: number, to: number, dur = 26, from = 0) => lerp(from, to, expoOut(clamp01(f / dur)));
export const fmt = (v: number, dec = 1) => v.toFixed(dec);

// ------------------------------------------------------------------ scene shell
/**
 * Every scene sits in Shell: its own ground (fine grid + vignette, same colour as the theme so the engine's cut
 * between scenes dips to an identical colour), a push-in on entry and a push-out on exit (blur + slide left),
 * so consecutive scenes read as one continuous camera move to the right.
 */
export const Shell: React.FC<{children: React.ReactNode; part?: string}> = ({children, part}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const enter = prog(frame, 18);
  const exit = interpolate(frame, [scene.duration - 12, scene.duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});
  const dx = (1 - enter) * 70 - exit * 70;
  const blur = (1 - enter) * 10 + exit * 10;
  const sc = 1 + (1 - enter) * 0.02 - exit * 0.015;
  return (
    <AbsoluteFill>
      <Ground />
      <AbsoluteFill style={{transform: `translateX(${dx}px) scale(${sc})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>
      {part && <PartTag text={part} />}
    </AbsoluteFill>
  );
};

const Ground: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const t = (scene.from + frame) / 30; // global time: the drift does not jump at a cut
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 1300,
          height: 1300,
          borderRadius: 650,
          background: 'radial-gradient(circle, rgba(63,208,255,0.13), rgba(63,208,255,0) 65%)',
          left: 900 + Math.sin(t * 0.11) * 120,
          top: -520 + Math.cos(t * 0.09) * 80,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${K.line} 1px, transparent 1px), linear-gradient(90deg, ${K.line} 1px, transparent 1px)`,
          backgroundSize: '96px 96px',
          backgroundPosition: `${-((t * 6) % 96)}px 0px`,
          opacity: 0.55,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(7,9,13,0) 40%, rgba(7,9,13,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Top-right part tag (the engine hides its nav bar on dark themes). */
const PartTag: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', right: 72, top: 54, display: 'flex', alignItems: 'center', gap: 12, opacity: prog(frame, 14, 4)}}>
      <div style={{width: 10, height: 10, borderRadius: 5, background: K.hero, boxShadow: `0 0 14px ${K.hero}`}} />
      <Mo size={22} color={K.dim} w={600} style={{letterSpacing: 2}}>
        {text}
      </Mo>
    </div>
  );
};

/** Scene header: mono kicker + big title (+ optional grey sub). */
export const Head: React.FC<{kicker: string; title: React.ReactNode; sub?: React.ReactNode; f?: number}> = ({kicker, title, sub, f}) => {
  const frame = useCurrentFrame();
  const g = f ?? frame;
  const a = prog(g, 14);
  const t = prog(g, 16, 4);
  return (
    <div style={{position: 'absolute', left: 96, top: 54}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: a}}>
        <div style={{width: 34, height: 4, background: K.hero, borderRadius: 2}} />
        <Mo size={22} color={K.hero} w={700} style={{letterSpacing: 3}}>
          {kicker}
        </Mo>
      </div>
      <div style={{opacity: t, transform: `translateY(${(1 - t) * 18}px)`, marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 26}}>
        <Zh size={60} w={900} style={{letterSpacing: -1}}>
          {title}
        </Zh>
        {sub && (
          <Zh size={28} w={600} color={K.dim}>
            {sub}
          </Zh>
        )}
      </div>
    </div>
  );
};

/** One-line source note above the subtitle band (bottom: 184 per LESSONS). */
export const SrcLine: React.FC<{children: React.ReactNode; f: number; left?: number}> = ({children, f, left = 96}) => (
  <div style={{position: 'absolute', left, bottom: 150, opacity: 0.85 * prog(f, 14), whiteSpace: 'nowrap'}}>
    <Mo size={19} color={K.faint} w={500}>
      {children}
    </Mo>
  </div>
);

/** “示意” badge for illustrative drawings that carry no data. */
export const Illus: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: 18, fontWeight: 700, color: K.dim, border: `1.5px solid ${K.faint}`, borderRadius: 6, padding: '1px 8px', ...style}}>示意</span>
);

// ------------------------------------------------------------------ pieces
export const Panel: React.FC<{children?: React.ReactNode; style?: React.CSSProperties; glow?: string}> = ({children, style, glow}) => (
  <div
    style={{
      background: K.panel,
      border: `1.5px solid ${glow ?? K.line}`,
      borderRadius: 18,
      boxShadow: glow ? `0 0 40px ${glow}33` : '0 20px 50px rgba(0,0,0,0.35)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties; solid?: boolean}> = ({children, color = K.hero, style, solid}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: FONT_ZH,
      fontWeight: 800,
      fontSize: 22,
      color: solid ? K.bg : color,
      background: solid ? color : `${color}1A`,
      border: `1.5px solid ${color}66`,
      borderRadius: 999,
      padding: '4px 16px',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

/** Spring pop (scale + fade). */
export const usePopIn = () => {
  const sp = useSpring();
  return (f: number, delay = 0, from = 0.85): React.CSSProperties => {
    const s = sp(f, delay, {damping: 18, stiffness: 160});
    return {opacity: clamp01(s * 1.5), transform: `scale(${from + (1 - from) * s})`};
  };
};

export const rise = (f: number, delay = 0, dist = 24): React.CSSProperties => {
  const t = prog(f, 16, delay);
  return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
};

// ------------------------------------------------------------------ bar chart
export type BarRow = {name: string; v: number | null; hero?: boolean; tone?: string; note?: string; sub?: string};

/**
 * Horizontal bar chart in the Economist grammar: grid first, then each bar grows from zero when its beat starts
 * (`at[i]` = frames since that bar's cue), value counts up with the bar. Hero rows are cyan, the rest grey.
 * `best` puts a thin outline marker on the top score of the table row. Null values show “—” (not reported).
 */
export const HBars: React.FC<{
  rows: BarRow[];
  max: number;
  at: number[];
  x: number;
  y: number;
  w: number;
  rowH?: number;
  nameW?: number;
  dec?: number;
  unit?: string;
  ticks?: number[];
  gridF: number;
  best?: number; // index of the best value
  dimOthers?: number; // 0..1, fade non-hero rows (focus)
}> = ({rows, max, at, x, y, w, rowH = 62, nameW = 360, dec = 1, unit = '', ticks, gridF, best, dimOthers = 0}) => {
  const plotW = w - nameW - 120;
  const h = rows.length * rowH;
  const tk = ticks ?? [0, max / 2, max];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h + 40}}>
      {/* grid: drawn left to right before the data */}
      {tk.map((t, i) => {
        const gp = prog(gridF, 14, i * 3);
        return (
          <div key={i} style={{position: 'absolute', left: nameW + (t / max) * plotW, top: -10, width: i === 0 ? 2.5 : 1.2, height: (h + 10) * gp, background: i === 0 ? K.dim : K.grid}}>
            <div style={{position: 'absolute', top: h + 16, left: -30, width: 60, textAlign: 'center', opacity: gp}}>
              <Mo size={18} color={K.faint}>
                {t}
                {unit}
              </Mo>
            </div>
          </div>
        );
      })}
      {rows.map((r, i) => {
        const f = at[Math.min(i, at.length - 1)];
        const g = prog(f, 26);
        const show = prog(f, 10);
        const color = r.tone ?? (r.hero ? K.hero : K.grey);
        const fade = r.hero ? 1 : 1 - dimOthers * 0.6;
        const bw = r.v == null ? 0 : (r.v / max) * plotW * g;
        return (
          <div key={r.name} style={{position: 'absolute', left: 0, top: i * rowH, height: rowH, width: w, opacity: show * fade}}>
            <div style={{position: 'absolute', left: 0, width: nameW - 24, top: 0, height: rowH, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end'}}>
              <Zh size={r.hero ? 28 : 25} w={r.hero ? 900 : 700} color={r.hero ? K.ink : K.dim} style={{whiteSpace: 'nowrap', lineHeight: 1.1}}>
                {r.name}
              </Zh>
              {r.sub && (
                <Mo size={15} color={K.faint} style={{marginTop: 2, whiteSpace: 'nowrap'}}>
                  {r.sub}
                </Mo>
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                left: nameW,
                top: rowH * 0.2,
                height: rowH * 0.6,
                width: bw,
                background: r.hero ? `linear-gradient(90deg, ${color}AA, ${color})` : color,
                borderRadius: '0 6px 6px 0',
                boxShadow: r.hero ? `0 0 26px ${color}55` : undefined,
                outline: best === i ? `2px solid ${K.ink}` : undefined,
                outlineOffset: 3,
              }}
            />
            <div style={{position: 'absolute', left: nameW + bw + 16, top: 0, height: rowH, display: 'flex', alignItems: 'center', gap: 12}}>
              <Num size={r.hero ? 40 : 32} color={r.hero ? K.hero : K.ink} w={r.hero ? 900 : 700}>
                {r.v == null ? '—' : fmt(count(f, r.v, 26), dec)}
                {r.v != null && unit}
              </Num>
              {r.note && (
                <Zh size={20} w={700} color={K.dim} style={{opacity: prog(f, 12, 22), whiteSpace: 'nowrap'}}>
                  {r.note}
                </Zh>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Little crown-ish marker for "表内第一". */
export const Top1: React.FC<{f: number; style?: React.CSSProperties}> = ({f, style}) => {
  const pop = usePopIn();
  return (
    <span style={{...pop(f, 0, 0.5), display: 'inline-block', ...style}}>
      <Chip color={K.hero} solid style={{fontSize: 18, padding: '2px 12px'}}>
        表内第一
      </Chip>
    </span>
  );
};

export {clamp01, prog, FONT_MONO, FONT_NUM, FONT_ZH};
