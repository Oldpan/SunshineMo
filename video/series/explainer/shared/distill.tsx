// Shared `distill` look for 讲透 episodes that walk through a Distill-style research blog post (first made for
// weight-space-programming, the MIT CSAIL post "Sparks of Weight-Space Programming", 2026-11-02). Colours, type and
// widgets are taken from that page's own css/style.css and figure scripts (js/traces.js, gohand.js, mathedit.js):
// white page, green #118659 accent, #cfe9dc highlighter, Source Sans 3 + JetBrains Mono, rounded grey-bordered cards,
// the chat-style prompt bubble, the green "Answer" strip and the dotted reasoning timeline.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene, useSpring} from '@atv/lib/timing';

// Background (lib/chrome) reads THEMES by name. Light theme: the engine draws a dark subtitle box.
THEMES.distill = {bg: '#FFFFFF', bg2: '#FFFFFF', accent: '#118659', accentSoft: '#CFE9DC', ink: '#222222'};

export const D = {
  page: '#FFFFFF',
  panel: '#F6F7F9', // setup / gameplay side panels
  card: '#FFFFFF',
  border: '#D5D9DF',
  hair: '#E6E8EB', // chart grid
  axis: '#B9BEC6',
  green: '#118659',
  greenDark: '#03623F',
  greenLight: '#6CB690',
  mark: '#CFE9DC', // highlighter
  answer: '#EDF5F0', // answer strip
  wash: '#F3F9F5',
  ink: '#222222',
  ink2: '#333333',
  dim: '#59636E',
  faint: '#8B929B',
  faint2: '#9AA3AD',
  red: '#D93A4B',
  redDark: '#B3243A',
  orange: '#C25A00',
  gold: '#FFC23D',
};

export const FONT_SANS = '"Source Sans 3", "Noto Sans SC", sans-serif';
export {FONT_MONO, FONT_ZH, clamp01, prog, EASE};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ fonts
let fontPromise: Promise<void> | null = null;
const loadFonts = () => {
  if (!fontPromise) {
    const f = new FontFace('Source Sans 3', `url(${staticFile('fonts/SourceSans3-VF.ttf')})`, {weight: '200 900'});
    fontPromise = f
      .load()
      .then((ff) => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      })
      .catch(() => console.warn('SourceSans3-VF.ttf missing — run scripts/session_start.sh'));
  }
  return fontPromise;
};
export const useDistillFonts = () => {
  const [handle] = useState(() => delayRender('Loading Source Sans 3'));
  useEffect(() => {
    loadFonts().finally(() => continueRender(handle));
  }, [handle]);
};

// ------------------------------------------------------------------ text
type TxtProps = {children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties};
/** Chinese / mixed body text (Noto Sans SC for CJK, Source Sans 3 for Latin and digits). */
export const Zh: React.FC<TxtProps> = ({children, size = 30, color = D.ink, w = 600, style}) => (
  <span style={{fontFamily: FONT_SANS, fontSize: size, fontWeight: w, color, lineHeight: 1.4, ...style}}>{children}</span>
);
export const Mo: React.FC<TxtProps> = ({children, size = 24, color = D.ink, w = 500, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, whiteSpace: 'nowrap', ...style}}>{children}</span>
);
/** Small uppercase green label, like the page's "READ / FIX / IMPROVE" and "Experiment 1" heads. */
export const Lab: React.FC<TxtProps> = ({children, size = 20, color = D.green, w = 700, style}) => (
  <span style={{fontFamily: FONT_SANS, fontSize: size, fontWeight: w, color, letterSpacing: 2.5, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>
    {children}
  </span>
);
/** The page's highlighter: pale green behind dark-green bold text; `p` sweeps it in left to right. */
export const Mark: React.FC<{children: React.ReactNode; p?: number; mono?: boolean; size?: number; style?: React.CSSProperties}> = ({children, p = 1, mono, size, style}) => (
  <span
    style={{
      backgroundImage: `linear-gradient(${D.mark}, ${D.mark})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${clamp01(p) * 100}% 100%`,
      color: p > 0.3 ? D.greenDark : 'inherit',
      fontWeight: p > 0.3 ? 700 : 'inherit',
      fontFamily: mono ? FONT_MONO : undefined,
      fontSize: size,
      padding: '1px 5px',
      borderRadius: 4,
      ...style,
    }}
  >
    {children}
  </span>
);

// ------------------------------------------------------------------ motion
export const rise = (f: number, delay = 0, dist = 22): React.CSSProperties => {
  const t = prog(f, 16, delay);
  return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
};
export const usePopIn = () => {
  const sp = useSpring();
  return (f: number, delay = 0, from = 0.9): React.CSSProperties => {
    const s = sp(f, delay, {damping: 18, stiffness: 170});
    return {opacity: clamp01(s * 1.5), transform: `scale(${from + (1 - from) * s})`};
  };
};
/** 0..1 while f is in [a, b) with short fades. */
export const during = (f: number, a: number, b: number, fade = 10) => clamp01(Math.min((f - a) / fade, (b - f) / fade));
/** Counts from `a` to `b` over `dur` frames after f >= 0. */
export const count = (f: number, a: number, b: number, dur = 40, delay = 0) => lerp(a, b, EASE(clamp01((f - delay) / dur)));

// ------------------------------------------------------------------ shell
/**
 * Every scene: white page with a faint dot grid that creeps, and content that slides up like scrolling the article.
 * The creep plus a slow 10 px sink keep long beats from reading as frozen frames (freezedetect n=0.0005 d=0.5).
 */
export const Shell: React.FC<{children: React.ReactNode; part?: string}> = ({children, part}) => {
  useDistillFonts();
  const frame = useCurrentFrame();
  const scene = useScene();
  const enter = prog(frame, 20);
  const exit = interpolate(frame, [scene.duration - 10, scene.duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});
  const veil = Math.max(1 - enter, exit);
  const sink = (frame / Math.max(scene.duration, 1)) * 22;
  const dy = (1 - enter) * 40 - exit * 40 - sink;
  const grid = frame * 0.6;
  return (
    <AbsoluteFill style={{background: D.page}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(17,134,89,0.13) 1.6px, transparent 1.8px)',
          backgroundSize: '32px 32px',
          backgroundPosition: `${16 + grid}px ${16 + grid * 0.5}px`,
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
    <div style={{position: 'absolute', right: 84, top: 62, display: 'flex', alignItems: 'center', gap: 10, opacity: prog(frame, 14, 4)}}>
      <div style={{width: 12, height: 12, borderRadius: 6, background: D.green}} />
      <Zh size={22} w={600} color={D.dim} style={{whiteSpace: 'nowrap'}}>
        {text}
      </Zh>
    </div>
  );
};

/** Scene header: green kicker + bold title (+ grey sub) and a hairline. */
export const Head: React.FC<{kicker: string; title: React.ReactNode; sub?: React.ReactNode; f?: number}> = ({kicker, title, sub, f}) => {
  const frame = useCurrentFrame();
  const g = f ?? frame;
  const t = prog(g, 16, 4);
  return (
    <>
      <div style={{position: 'absolute', left: 96, top: 54}}>
        <div style={{opacity: prog(g, 14)}}>
          <Lab size={21}>{kicker}</Lab>
        </div>
        <div style={{opacity: t, transform: `translateY(${(1 - t) * 16}px)`, marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 24, whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: FONT_SANS, fontSize: 56, fontWeight: 800, color: D.ink, letterSpacing: -0.5}}>{title}</span>
          {sub && (
            <Zh size={26} w={500} color={D.dim}>
              {sub}
            </Zh>
          )}
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, right: 96, top: 178, height: 1.5, background: D.hair, transform: `scaleX(${prog(g, 24, 6)})`, transformOrigin: 'left'}} />
    </>
  );
};

/** One-line source note above the subtitle band. */
export const SrcLine: React.FC<{children: React.ReactNode; f: number; left?: number}> = ({children, f, left = 96}) => (
  <div style={{position: 'absolute', left, bottom: 150, opacity: 0.95 * prog(f, 14), whiteSpace: 'nowrap'}}>
    <span style={{fontFamily: FONT_SANS, fontSize: 19, fontWeight: 500, color: D.faint}}>{children}</span>
  </div>
);

export const Illus: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: 17, fontWeight: 700, color: D.dim, background: D.hair, borderRadius: 6, padding: '1px 8px', ...style}}>示意</span>
);

// ------------------------------------------------------------------ page widgets
/** White card with the page's grey border. */
export const Card: React.FC<{children?: React.ReactNode; style?: React.CSSProperties; tint?: string}> = ({children, style, tint}) => (
  <div
    style={{
      background: tint ?? D.card,
      border: `2px solid ${D.border}`,
      borderRadius: 18,
      boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(20,40,30,0.05)',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Tabs row like the page's "Breakout | Pong | Pac-Man | Freeway" (active one green, underlined). */
export const Tabs: React.FC<{items: string[]; active: number; size?: number; style?: React.CSSProperties}> = ({items, active, size = 26, style}) => (
  <div style={{display: 'flex', gap: 34, borderBottom: `2px solid ${D.hair}`, ...style}}>
    {items.map((t, i) => (
      <div key={t} style={{paddingBottom: 10, borderBottom: `4px solid ${i === active ? D.green : 'transparent'}`, marginBottom: -2}}>
        <Zh size={size} w={i === active ? 700 : 500} color={i === active ? D.ink : D.dim} style={{whiteSpace: 'nowrap'}}>
          {t}
        </Zh>
      </div>
    ))}
  </div>
);

/** "ⓘ Setup" box: a list of the experiment's setup lines, revealed one by one from f. */
export const Setup: React.FC<{rows: [string, React.ReactNode][]; f: number; step?: number; w?: number; style?: React.CSSProperties}> = ({rows, f, step = 8, w = 760, style}) => (
  <Card tint={D.panel} style={{width: w, padding: '22px 28px', ...style}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
      <div style={{width: 26, height: 26, borderRadius: 13, background: D.green, color: '#fff', fontFamily: FONT_SANS, fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        i
      </div>
      <Zh size={24} w={700} color={D.green}>
        实验设置
      </Zh>
    </div>
    {rows.map(([k, v], i) => (
      <div key={k} style={{display: 'flex', gap: 14, marginTop: 8, ...rise(f, i * step, 10)}}>
        <Zh size={22} w={700} color={D.ink} style={{whiteSpace: 'nowrap', minWidth: 110}}>
          {k}
        </Zh>
        <Zh size={22} w={500} color={D.ink2}>
          {v}
        </Zh>
      </div>
    ))}
  </Card>
);

/** The chat-style prompt bubble: a file chip, the question typed in, and the round send button. */
export const Prompt: React.FC<{file: React.ReactNode; fileRow?: React.ReactNode; question: string; rule?: string; f: number; w?: number; cps?: number; style?: React.CSSProperties}> = ({
  file,
  fileRow,
  question,
  rule,
  f,
  w = 900,
  cps = 30,
  style,
}) => {
  const n = Math.floor(clamp01((f - 6) / ((question.length / cps) * 30)) * question.length);
  const sent = clamp01((f - 6 - (question.length / cps) * 30 - 6) / 8);
  return (
    <div style={{width: w, background: '#fff', border: `2px solid ${D.border}`, borderRadius: 26, padding: '20px 24px 18px', boxSizing: 'border-box', position: 'relative', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', ...style}}>
      <div style={{background: D.panel, border: `1.5px solid ${D.hair}`, borderRadius: 14, padding: '10px 16px', marginBottom: 14}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <svg width={20} height={24} viewBox="0 0 20 24">
            <path d="M2 1 H13 L18 6 V23 H2 Z" fill="none" stroke={D.dim} strokeWidth={2} />
            <path d="M6 11 H14 M6 15 H14 M6 19 H11" stroke={D.dim} strokeWidth={2} />
          </svg>
          <Zh size={22} w={700} color={D.ink2}>
            {file}
          </Zh>
        </div>
        {fileRow && <div style={{marginTop: 6, overflow: 'hidden', whiteSpace: 'nowrap', maskImage: 'linear-gradient(90deg, #000 85%, transparent)'}}>{fileRow}</div>}
      </div>
      <div style={{minHeight: 44}}>
        <Zh size={28} w={700} color={D.ink}>
          {question.slice(0, n)}
        </Zh>
      </div>
      {rule && (
        <div style={{opacity: sent}}>
          <Zh size={24} w={600} color={D.ink2}>
            {rule}
          </Zh>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          right: 18,
          bottom: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          background: D.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${1 + 0.25 * Math.sin(Math.PI * clamp01(sent))})`,
        }}
      >
        <svg width={20} height={20} viewBox="0 0 20 20">
          <path d="M10 16 V4 M4 10 L10 4 L16 10" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

/** The green "Answer" strip under the prompt. */
export const Answer: React.FC<{label?: string; children: React.ReactNode; meta?: React.ReactNode; f: number; w?: number; style?: React.CSSProperties}> = ({label = '答案', children, meta, f, w = 900, style}) => {
  const t = prog(f, 14);
  return (
    <div style={{width: w, background: D.answer, borderRadius: 14, padding: '16px 24px', boxSizing: 'border-box', display: 'flex', alignItems: 'baseline', gap: 22, opacity: t, transform: `translateY(${(1 - t) * 14}px)`, ...style}}>
      <Zh size={24} w={700} color={D.green} style={{whiteSpace: 'nowrap'}}>
        {label}
      </Zh>
      <div style={{flex: 1}}>
        <Zh size={30} w={700}>
          {children}
        </Zh>
        {meta && (
          <span style={{marginLeft: 16}}>
            <Zh size={21} w={500} color={D.dim}>
              {meta}
            </Zh>
          </span>
        )}
      </div>
    </div>
  );
};

/** ✓ 正确 tag in green. */
export const Correct: React.FC<{text?: string}> = ({text = '正确'}) => (
  <span style={{color: D.green, fontWeight: 700, fontFamily: FONT_SANS}}>✓ {text}</span>
);

/**
 * The reasoning timeline: hollow green rings on a thin rail, an item lights up (filled dot + highlighter) when its
 * beat-relative frame `at` passes; later items are faded as on the page.
 */
export const Reasoning: React.FC<{items: {text: React.ReactNode; at: number}[]; w?: number; size?: number; gap?: number; title?: string; style?: React.CSSProperties}> = ({items, w = 900, size = 25, gap = 12, title = '推理', style}) => (
  <Card style={{width: w, padding: '20px 26px', ...style}}>
    <Zh size={24} w={700} color={D.green}>
      {title}
    </Zh>
    <div style={{position: 'relative', marginTop: 10}}>
      <div style={{position: 'absolute', left: 8, top: 14, bottom: 14, width: 2, background: D.mark}} />
      {items.map((it, i) => {
        const on = prog(it.at, 12);
        const seen = it.at > 0;
        return (
          <div key={i} style={{display: 'flex', gap: 18, alignItems: 'flex-start', marginTop: i ? gap : 0, opacity: 0.35 + 0.65 * (seen ? 1 : 0.4) * (0.4 + 0.6 * on)}}>
            <div style={{width: 18, height: 18, borderRadius: 9, border: `3px solid ${D.green}`, background: on > 0.5 ? D.green : '#fff', boxSizing: 'border-box', marginTop: size * 0.3, flexShrink: 0, position: 'relative', zIndex: 1}} />
            <div style={{flex: 1}}>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: size,
                  fontWeight: 500,
                  color: D.ink,
                  lineHeight: 1.45,
                  backgroundImage: `linear-gradient(${D.mark}, ${D.mark})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${on * 100}% 100%`,
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone',
                }}
              >
                {it.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </Card>
);

/** Bold number in the page's style (Source Sans, heavy). */
export const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 72, color = D.ink, style}) => (
  <span style={{fontFamily: FONT_SANS, fontSize: size, fontWeight: 800, color, letterSpacing: -1, lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...style}}>{children}</span>
);

/** Results table in the page's style: header row, thin rules, optional highlighted cells; rows reveal at their frames. */
export const Table: React.FC<{
  head: string[];
  rows: {cells: React.ReactNode[]; at: number; hot?: number[]}[];
  widths: number[];
  size?: number;
  style?: React.CSSProperties;
}> = ({head, rows, widths, size = 26, style}) => (
  <div style={{...style}}>
    <div style={{display: 'flex', borderBottom: `2px solid ${D.ink2}`, paddingBottom: 10}}>
      {head.map((h, i) => (
        <div key={i} style={{width: widths[i], textAlign: i ? 'right' : 'left', paddingRight: i ? 10 : 0}}>
          <Zh size={size * 0.85} w={700} color={D.ink2}>
            {h}
          </Zh>
        </div>
      ))}
    </div>
    {rows.map((r, j) => (
      <div key={j} style={{display: 'flex', borderBottom: `1.5px solid ${D.hair}`, padding: '12px 0', ...rise(r.at, 0, 12)}}>
        {r.cells.map((c, i) => (
          <div key={i} style={{width: widths[i], textAlign: i ? 'right' : 'left', paddingRight: i ? 10 : 0}}>
            {r.hot?.includes(i) ? (
              <Mark p={prog(r.at, 16, 8)} size={size}>
                {c}
              </Mark>
            ) : (
              <Zh size={size} w={i ? 500 : 600} color={D.ink} style={{fontVariantNumeric: 'tabular-nums'}}>
                {c}
              </Zh>
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
);
