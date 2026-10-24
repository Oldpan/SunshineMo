// Shared look for "故意调弱的开源旗舰：Kimi K3.1 Pro", modelled on Kimi's own K3.1 release page
// (kimi.com/blog/kimi-k3-1-pro): a grey #E6E6E6 page with near-white #F8F8F8 cards, serif headings (Lora + a Song-style
// Chinese serif), charts with one brand-blue bar for Kimi and flat light-grey bars for everyone else, mono numbers at the
// bar end, and a misty blue-grey mountain landscape as the hero. The mountains are drawn here in code; Kimi's photo and
// calligraphic K3.1 mark are not reused. Model names appear as text only (no logos).
// Chart grammar as before: axes first, data grows when it is said, bars from zero, a source line on every chart.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_NUM, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene, useSpring} from '@atv/lib/timing';

// The episode's theme. Background (lib/chrome) reads THEMES by name, so register it before the first render.
// Light theme: the engine draws a plain page-grey ground in the short fade between scenes and uses its dark subtitle box.
// script.yaml has no meta.nav so the engine's nav bar stays hidden (PartTag replaces it).
THEMES.kimi = {bg: '#E6E6E6', bg2: '#E6E6E6', accent: '#007DFF', accentSoft: '#E5F0FF', ink: '#171717'};

export const K = {
  page: '#E6E6E6', // Kimi blog page
  bg: '#F8F8F8', // the card every scene is drawn on
  panel: '#FFFFFF',
  panel2: '#F1F2F3',
  line: 'rgba(0,0,0,0.08)',
  grid: 'rgba(0,0,0,0.09)',
  ink: '#171717',
  dim: '#5C5C5C',
  faint: '#8E8E8E',
  grey: '#E7E7E7', // non-hero bars, exactly as in Kimi's charts
  grey2: '#CFCFCF',
  hero: '#007DFF', // Kimi K3.1 Pro (Kimi chart blue)
  hero2: '#4E6A80', // K3 / earlier Kimi: the slate of the mountains
  warn: '#C25E1F', // Kimi page accents
  red: '#B92622',
  green: '#1F7F3A',
  onHero: '#FFFFFF',
  mist: '#E9ECED',
};

export const FONT_SERIF = '"Lora", "Noto Serif SC", "Songti SC", serif';

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
/** 0..1 eased progress (alias of lib prog). */
export const p = prog;

// ------------------------------------------------------------------ fonts
// Lora and Noto Serif SC are not in the engine's font set; fetch_fonts.sh puts them in renderer/public/fonts and
// build_timeline.py copies that folder into build/public. Missing files fall back to the system serif.
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
/** Chinese text. Display sizes (≥ 32 px) are set in the serif, like Kimi's headings; labels stay in the sans. */
export const Zh: React.FC<TxtProps> = ({children, size = 32, color = K.ink, w = 700, style}) => {
  const serif = size >= 32;
  return (
    <span style={{fontFamily: serif ? FONT_SERIF : FONT_ZH, fontSize: size, fontWeight: serif ? Math.min(w, 700) : w, color, lineHeight: 1.3, ...style}}>
      {children}
    </span>
  );
};
export const Mo: React.FC<TxtProps> = ({children, size = 24, color = K.dim, w = 600, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, ...style}}>{children}</span>
);
/** Numbers: big stats in Lora, chart values (< 42 px) in mono like the figures on Kimi's page. */
export const Num: React.FC<TxtProps> = ({children, size = 96, color = K.hero, w = 800, style}) => {
  const big = size >= 42;
  return (
    <span
      style={{
        fontFamily: big ? FONT_SERIF : FONT_MONO,
        fontSize: size,
        fontWeight: big ? Math.min(w, 700) : Math.min(w, 700),
        color,
        lineHeight: 1,
        letterSpacing: big ? -1 : 0,
        fontVariantNumeric: 'lining-nums tabular-nums',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Count-up number that lands exactly when f reaches dur (easeOutExpo, CountUp.js style). */
export const count = (f: number, to: number, dur = 26, from = 0) => lerp(from, to, expoOut(clamp01(f / dur)));
export const fmt = (v: number, dec = 1) => v.toFixed(dec);

// ------------------------------------------------------------------ mountains
/** Ridged noise: sharp peaks, soft valleys. Deterministic, so every frame draws the same range. */
const ridgeY = (x: number, seed: number) => {
  let y = 0;
  let a = 1;
  let f = 1 / 420;
  for (let o = 0; o < 5; o++) {
    const n = 1 - Math.abs(Math.sin(x * f + seed * (o + 1) * 1.7 + Math.sin(x * f * 0.37 + seed * 2.3) * 1.4));
    y += Math.pow(n, 1.7) * a;
    a *= 0.47;
    f *= 2.13;
  }
  return y / 1.9;
};

type Layer = {seed: number; base: number; amp: number; top: string; speed: number; fog: number; sides?: number; rim?: number};
// far -> near; colours sampled from the landscape on Kimi's K3.1 page. The near range frames the picture with dark
// peaks on both sides and leaves a misty valley in the middle (seed chosen for that shape).
const LAYERS: Layer[] = [
  {seed: 1.3, base: 560, amp: 320, top: '#B5C0C8', speed: 3, fog: 470},
  {seed: 2.9, base: 690, amp: 400, top: '#8D9EAB', speed: 6, fog: 610, sides: 0.35},
  {seed: 4.4, base: 860, amp: 560, top: '#5C7486', speed: 11, fog: 770, sides: 0.6, rim: 0.22},
  {seed: 7.9, base: 1100, amp: 900, top: '#2B475A', speed: 18, fog: 940, sides: 0.9, rim: 0.35},
];

// ridge outlines are static (drift is a transform), so build them once
const RIDGES = LAYERS.map((L) => {
  const pts: string[] = [];
  let minY = L.base;
  for (let x = -400; x <= 2900; x += 8) {
    // sides > 0 pushes the peaks out to the left and right edges and leaves a valley in the middle
    const edge = L.sides ? 1 - L.sides + L.sides * Math.pow(Math.min(1, Math.abs(x - 960) / 900), 0.9) : 1;
    const y = L.base - ridgeY(x, L.seed) * L.amp * edge;
    if (x >= 0 && x <= 1920) minY = Math.min(minY, y);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  const line = pts.join(' L ');
  return {line, minY};
});

/**
 * Misty mountain range in Kimi's blue-grey: four ridge layers whose peaks are dark and whose feet dissolve into fog,
 * fog banks between them, a slow parallax drift and a gentle push-in. `t` is seconds, `push` 0..1 camera zoom.
 */
export const Mountains: React.FC<{t: number; push?: number; dim?: number}> = ({t, push = 0, dim = 0}) => {
  const s = 1 + 0.05 * push;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'linear-gradient(180deg, #EFECE5 0%, #E3E4E2 30%, #CFD7DB 62%, #C5CED3 100%)'}}>
      <div style={{position: 'absolute', width: 1600, height: 900, right: -420, top: -460, borderRadius: 800, background: 'radial-gradient(circle, rgba(255,251,242,0.85), rgba(255,251,242,0) 62%)'}} />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="kfog" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F1F3F3" stopOpacity={0.92} />
            <stop offset="55%" stopColor="#EBEEEF" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#E6E9EA" stopOpacity={0} />
          </radialGradient>
          {LAYERS.map((L, i) => (
            <linearGradient key={i} id={`kml${i}`} gradientUnits="userSpaceOnUse" x1={0} y1={RIDGES[i].minY} x2={0} y2={L.base + 40}>
              <stop offset="0%" stopColor={L.top} />
              <stop offset="40%" stopColor={L.top} stopOpacity={0.9} />
              <stop offset="100%" stopColor="#DCE1E3" stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <g transform={`translate(960 640) scale(${s}) translate(-960 -640)`}>
          {LAYERS.map((L, i) => {
            const dx = -t * L.speed * 0.35;
            return (
              <g key={i}>
                <g transform={`translate(${dx} 0)`}>
                  <path d={`M ${RIDGES[i].line} L 2900 1300 L -400 1300 Z`} fill={`url(#kml${i})`} />
                  {L.rim && <path d={`M ${RIDGES[i].line}`} fill="none" stroke="#FFFFFF" strokeOpacity={L.rim} strokeWidth={1.4} />}
                </g>
                {/* fog bank in front of this layer, drifting faster than the ridge */}
                {[0, 1, 2].map((k) => {
                  const cx = ((k * 1050 + t * (L.speed * 1.6 + 10) + i * 330) % 3150) - 600;
                  return <ellipse key={k} cx={cx} cy={L.fog + k * 18} rx={780} ry={100 + i * 22} fill="url(#kfog)" />;
                })}
              </g>
            );
          })}
        </g>
      </svg>
      {dim > 0 && <AbsoluteFill style={{background: `rgba(248,248,248,${dim})`}} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ scene shell
/**
 * Every scene sits in Shell: Kimi's grey page with one big near-white card (faint mountains along its foot), and a
 * mist transition: on exit a fog bank rolls over the card while the content softens and lifts; the next scene
 * starts inside the same fog and clears. Fog drifts on global time so it does not jump at the cut.
 */
export const Shell: React.FC<{children: React.ReactNode; part?: string; backdrop?: React.ReactNode}> = ({children, part, backdrop}) => {
  useSerifFonts();
  const frame = useCurrentFrame();
  const scene = useScene();
  const t = (scene.from + frame) / 30;
  const enter = prog(frame, 22);
  const exit = interpolate(frame, [scene.duration - 16, scene.duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});
  const veil = Math.max(1 - enter, exit);
  const dy = (1 - enter) * 26 - exit * 26;
  const blur = veil * 9;
  return (
    <AbsoluteFill>
      {backdrop ?? <Ground t={t} />}
      <AbsoluteFill style={{transform: `translateY(${dy}px) scale(${1 + (1 - enter) * 0.012})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>
      {part && <PartTag text={part} />}
      {veil > 0.01 && <Mist amount={veil} t={t} />}
    </AbsoluteFill>
  );
};

const Ground: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: K.page}}>
    <div style={{position: 'absolute', left: 22, top: 22, right: 22, bottom: 22, borderRadius: 28, background: K.bg, overflow: 'hidden'}}>
      {/* faint ridges along the card's foot: the landscape of the cover, almost washed out */}
      <svg width={1876} height={300} viewBox="0 0 1876 300" style={{position: 'absolute', left: 0, bottom: 0}}>
        {[
          {seed: 3.3, base: 300, amp: 210, c: '#F0F2F3', speed: 4},
          {seed: 7.7, base: 320, amp: 170, c: '#ECEFF1', speed: 8},
        ].map((L, i) => {
          const dx = -((t * L.speed) % 1200);
          const pts: string[] = [];
          for (let x = -100; x <= 3200; x += 12) pts.push(`${x},${L.base - ridgeY(x, L.seed) * L.amp}`);
          return <path key={i} transform={`translate(${dx} 0)`} d={`M ${pts.join(' L ')} L 3200 400 L -100 400 Z`} fill={L.c} />;
        })}
      </svg>
    </div>
  </AbsoluteFill>
);

/** Fog bank that covers the frame at the cut between two scenes (amount 0..1). */
const Mist: React.FC<{amount: number; t: number}> = ({amount, t}) => {
  const a = Math.pow(amount, 0.8);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #EEEFEE 0%, #E8EAEB 55%, #E4E6E7 100%)', opacity: a * 0.92}} />
      {[0, 1, 2, 3, 4].map((k) => {
        const x = ((k * 760 + t * 320) % 3800) - 1300;
        const y = 80 + ((k * 211) % 760);
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x,
              top: y - 260,
              width: 1500,
              height: 520,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9), rgba(255,255,255,0) 68%)',
              opacity: clamp01(a * 1.3),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Top-right part tag (the engine's nav bar is hidden). */
const PartTag: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', right: 78, top: 60, display: 'flex', alignItems: 'center', gap: 12, opacity: prog(frame, 14, 4)}}>
      <div style={{width: 10, height: 10, borderRadius: 5, background: K.hero}} />
      <Mo size={20} color={K.dim} w={600} style={{letterSpacing: 2}}>
        {text}
      </Mo>
    </div>
  );
};

/** Scene header: mono kicker + serif title (+ optional grey sub), and a hairline rule like Kimi's chart titles. */
export const Head: React.FC<{kicker: string; title: React.ReactNode; sub?: React.ReactNode; f?: number; rule?: boolean}> = ({kicker, title, sub, f, rule = true}) => {
  const frame = useCurrentFrame();
  const g = f ?? frame;
  const a = prog(g, 14);
  const t = prog(g, 16, 4);
  return (
    <>
      <div style={{position: 'absolute', left: 96, top: 56}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: a}}>
          <div style={{width: 8, height: 8, borderRadius: 4, background: K.hero}} />
          <Mo size={19} color={K.hero} w={700} style={{letterSpacing: 2.5}}>
            {kicker}
          </Mo>
        </div>
        <div style={{opacity: t, transform: `translateY(${(1 - t) * 16}px)`, marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 26}}>
          <span style={{fontFamily: FONT_SERIF, fontSize: 58, fontWeight: 700, color: K.ink, letterSpacing: -1.2, lineHeight: 1.2}}>{title}</span>
          {sub && (
            <Zh size={26} w={500} color={K.dim}>
              {sub}
            </Zh>
          )}
        </div>
      </div>
      {rule && <div style={{position: 'absolute', left: 96, right: 96, top: 176, height: 1.5, background: 'rgba(0,0,0,0.13)', transform: `scaleX(${prog(g, 24, 6)})`, transformOrigin: 'left'}} />}
    </>
  );
};

/** One-line source note above the subtitle band. */
export const SrcLine: React.FC<{children: React.ReactNode; f: number; left?: number; color?: string; halo?: boolean}> = ({children, f, left = 96, color = K.faint, halo}) => (
  <div style={{position: 'absolute', left, bottom: 150, opacity: 0.9 * prog(f, 14), whiteSpace: 'nowrap'}}>
    <span style={{fontFamily: FONT_ZH, fontSize: 18, fontWeight: 500, color, textShadow: halo ? '0 0 6px rgba(255,255,255,0.95), 0 0 14px rgba(255,255,255,0.8)' : undefined}}>{children}</span>
  </div>
);

/** “示意” badge for illustrative drawings that carry no data. */
export const Illus: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: 17, fontWeight: 700, color: K.dim, background: K.panel2, border: `1px solid ${K.line}`, borderRadius: 6, padding: '1px 8px', ...style}}>示意</span>
);

// ------------------------------------------------------------------ pieces
/** White card on the near-white scene card; `glow` gives it a thin accent border instead of a shadow. */
export const Panel: React.FC<{children?: React.ReactNode; style?: React.CSSProperties; glow?: string}> = ({children, style, glow}) => (
  <div
    style={{
      background: K.panel,
      border: glow ? `1.5px solid ${glow}55` : `1px solid ${K.line}`,
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.045)',
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
      fontWeight: 700,
      fontSize: 22,
      color: solid ? K.onHero : color,
      background: solid ? color : `${color}14`,
      border: `1px solid ${color}55`,
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
 * Horizontal bar chart in Kimi's chart style: grid first, then each bar grows from zero when its beat starts
 * (`at[i]` = frames since that bar's cue), value counts up with the bar. Hero rows are Kimi blue, the rest flat grey.
 * Null values show “—” (not reported).
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
      {tk.map((t, i) => {
        const gp = prog(gridF, 14, i * 3);
        return (
          <div key={i} style={{position: 'absolute', left: nameW + (t / max) * plotW, top: -10, width: i === 0 ? 2 : 1, height: (h + 10) * gp, background: i === 0 ? K.grey2 : K.grid}}>
            <div style={{position: 'absolute', top: h + 16, left: -30, width: 60, textAlign: 'center', opacity: gp}}>
              <Mo size={17} color={K.faint}>
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
              <Zh size={r.hero ? 27 : 25} w={r.hero ? 800 : 500} color={K.ink} style={{whiteSpace: 'nowrap', lineHeight: 1.1}}>
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
                top: rowH * 0.22,
                height: rowH * 0.56,
                width: bw,
                background: color,
                borderRadius: 6,
                outline: best === i ? `2px solid ${K.ink}` : undefined,
                outlineOffset: 3,
              }}
            />
            <div style={{position: 'absolute', left: nameW + bw + 16, top: 0, height: rowH, display: 'flex', alignItems: 'center', gap: 12}}>
              <Num size={r.hero ? 34 : 30} color={r.hero ? K.hero : K.ink} w={r.hero ? 700 : 500}>
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

/** Little marker for "表内第一". */
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
