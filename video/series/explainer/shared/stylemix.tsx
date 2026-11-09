// Shared multi-style kit for 讲透 episodes whose scenes switch looks (first made for agent-manager, 2026-11):
// the user picks a style per scene from a candidate board, so every look here is a full-bleed background plus a
// few parts, all driven by frame numbers.
//   SW swiss grid type   · PI pictogram motion   · HD halftone dossier  · TM terminal
//   BP blueprint drawing · CK corkboard          · PT telestrator pitch · DV data story · ED editorial (cream + terracotta)
// Motion rules ("elegant"): eased fades / slides / drawn strokes only, no bounces; every background keeps moving a
// little (grid creep, slow push-in) so long sentences never read as frozen frames.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, typed, useScene} from '@atv/lib/timing';

export {clamp01, prog, typed, FONT_MONO, FONT_ZH, EASE};
export const FONT_SERIF = '"Noto Serif SC", "Songti SC", serif';

// Background colours per style, registered as themes so the engine's own backdrop matches during fades.
export const MX = {
  swiss: '#F2F1EC',
  picto: '#13294B',
  dossier: '#E6DCC4',
  term: '#1C1B1A',
  blue: '#0F4C8A',
  cork: '#38443F',
  pitch: '#0D0F12',
  data: '#FBFBF8',
  edit: '#F8F6F1',
};
const dark = (bg: string) => ({bg, bg2: bg, accent: '#D97757', accentSoft: '#3a3a3a', ink: '#FFFFFF', dark: true});
const light = (bg: string) => ({bg, bg2: bg, accent: '#D97757', accentSoft: '#F3D9CC', ink: '#1B1B1B', dark: true}); // dark=true also hides the engine's nav dots
THEMES['mx-swiss'] = light(MX.swiss);
THEMES['mx-picto'] = dark(MX.picto);
THEMES['mx-dossier'] = light(MX.dossier);
THEMES['mx-term'] = dark(MX.term);
THEMES['mx-blue'] = dark(MX.blue);
THEMES['mx-cork'] = dark(MX.cork);
THEMES['mx-pitch'] = dark(MX.pitch);
THEMES['mx-data'] = light(MX.data);
THEMES['mx-edit'] = light(MX.edit);

export const COL = {
  ink: '#1B1B1B',
  red: '#E3321B',
  clay: '#D97757',
  clayDeep: '#C2603F',
  yellow: '#FFC531',
  coral: '#FF6B5B',
  mint: '#4FC3A1',
  sky: '#6AA8FF',
  violet: '#C78BFF',
  green: '#2F7D4F',
  bad: '#C0392B',
  bpLine: 'rgba(232,242,255,0.92)',
  bpFaint: 'rgba(232,242,255,0.55)',
  bpRed: '#FF9B8A',
  termInk: '#D6D4CC',
  termDim: '#8A877F',
  termOk: '#6FCF97',
  termErr: '#EF7D6D',
  termHi: '#F2C46D',
  marker: '#FFE14A',
};

// ------------------------------------------------------------------ fonts (serif is not in the engine's list)
let serifPromise: Promise<void> | null = null;
const loadSerif = () => {
  if (!serifPromise) {
    const f = new FontFace('Noto Serif SC', `url(${staticFile('fonts/NotoSerifSC-VF.ttf')})`, {weight: '200 900'});
    serifPromise = f
      .load()
      .then((ff) => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      })
      .catch(() => console.warn('NotoSerifSC-VF.ttf missing'));
  }
  return serifPromise;
};
export const useSerif = () => {
  const [handle] = useState(() => delayRender('Loading serif'));
  useEffect(() => {
    loadSerif().finally(() => continueRender(handle));
  }, [handle]);
};

// ------------------------------------------------------------------ motion helpers
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Fade + slide (px) in at f; optional fade-out window [o0, o0+12]. */
export const rise = (f: number, dist = 24, dur = 16, out?: number): React.CSSProperties => {
  const p = prog(f, dur);
  const o = out === undefined ? 1 : 1 - prog(out, 12);
  return {opacity: p * o, transform: `translateY(${(1 - p) * dist}px)`};
};
export const slideX = (f: number, dist = 40, dur = 18): React.CSSProperties => {
  const p = prog(f, dur);
  return {opacity: p, transform: `translateX(${(1 - p) * dist}px)`};
};
export const fade = (f: number, dur = 14): React.CSSProperties => ({opacity: prog(f, dur)});
/** Soft emphasis: dims everything that is not `on` once `f` has passed. */
export const dimIf = (f: number, on: boolean, to = 0.35) => (on ? 1 : lerp(1, to, prog(f, 14)));

/** Whole-scene slow push-in + drift so a held layout still moves. */
export const Drift: React.FC<{children: React.ReactNode; zoom?: number; dx?: number; dy?: number}> = ({children, zoom = 0.03, dx = 0, dy = -10}) => {
  const frame = useCurrentFrame();
  const {duration} = useScene();
  const t = clamp01(frame / Math.max(1, duration));
  return (
    <AbsoluteFill style={{transform: `translate(${dx * t}px, ${dy * t}px) scale(${1 + zoom * t})`, transformOrigin: '50% 45%'}}>
      {children}
    </AbsoluteFill>
  );
};

/** Absolute box helper. */
export const Abs: React.FC<{x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);

type TP = {children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties};
export const Sans: React.FC<TP> = ({children, size = 32, color = 'inherit', w = 500, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.45, ...style}}>{children}</span>
);
export const Serif: React.FC<TP> = ({children, size = 32, color = 'inherit', w = 700, style}) => (
  <span style={{fontFamily: FONT_SERIF, fontSize: size, fontWeight: w, color, lineHeight: 1.3, ...style}}>{children}</span>
);
export const Mono: React.FC<TP> = ({children, size = 24, color = 'inherit', w = 500, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, lineHeight: 1.6, letterSpacing: 0.5, ...style}}>{children}</span>
);
export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = COL.clay, size = 24, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: 700, letterSpacing: 4, color, ...style}}>{children}</span>
);

/** "示意" corner tag for invented examples. */
export const Illus: React.FC<{x: number; y: number; color?: string; f?: number}> = ({x, y, color = 'rgba(0,0,0,0.45)', f = 99}) => (
  <Abs x={x} y={y} style={{...fade(f), border: `2px solid ${color}`, color, borderRadius: 6, padding: '2px 10px', fontFamily: FONT_ZH, fontSize: 20, fontWeight: 600}}>
    示意
  </Abs>
);

// ------------------------------------------------------------------ backgrounds
const useT = () => {
  const frame = useCurrentFrame();
  const {duration} = useScene();
  return {frame, t: clamp01(frame / Math.max(1, duration))};
};

/** Swiss: off-white with vertical column rules that creep sideways. */
export const SwissBg: React.FC<{band?: {x: number; w: number; f: number}}> = ({band}) => {
  const {frame} = useT();
  const off = (frame * 0.25) % 160;
  return (
    <AbsoluteFill style={{background: MX.swiss}}>
      <AbsoluteFill
        style={{backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)', backgroundSize: '160px 100%', backgroundPosition: `${off}px 0`}}
      />
      {band && (
        <div style={{position: 'absolute', left: band.x, top: 0, width: band.w, height: 1080, background: COL.red, transformOrigin: 'top', transform: `scaleY(${prog(band.f, 22)})`}} />
      )}
    </AbsoluteFill>
  );
};

/** Pictogram: deep navy with a slow drift of faint dots. */
export const PictoBg: React.FC = () => {
  const {frame} = useT();
  return (
    <AbsoluteFill style={{background: MX.picto}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2.5px)',
          backgroundSize: '48px 48px',
          backgroundPosition: `${frame * 0.3}px ${frame * 0.15}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Dossier: warm paper, halftone dots, an open manila folder. */
export const DossierBg: React.FC<{folder?: boolean}> = ({folder = true}) => {
  const {frame} = useT();
  return (
    <AbsoluteFill style={{background: MX.dossier}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(60,40,10,0.16) 1.3px, transparent 1.5px)',
          backgroundSize: '9px 9px',
          backgroundPosition: `${frame * 0.12}px 0`,
          opacity: 0.6,
        }}
      />
      {folder && (
        <div style={{position: 'absolute', left: 100, top: 70, width: 1720, height: 830, background: '#D6B676', borderRadius: '10px 10px 6px 6px', boxShadow: '0 16px 34px rgba(0,0,0,0.28)'}}>
          <div style={{position: 'absolute', left: 40, top: -36, width: 300, height: 44, background: '#D6B676', borderRadius: '10px 10px 0 0'}} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Paper sheet on the dossier (slight rotation, slides in). */
export const Sheet: React.FC<{x: number; y: number; w: number; h: number; rot?: number; f: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  rot = 0,
  f,
  children,
  style,
}) => {
  const p = prog(f, 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: '#F7F1E3',
        boxShadow: '3px 8px 16px rgba(0,0,0,0.22)',
        padding: '38px 44px',
        transform: `translateY(${(1 - p) * 40}px) rotate(${rot}deg)`,
        opacity: p,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Rubber stamp that presses in (scale 1.25 → 1, no bounce). */
export const Stamp: React.FC<{x: number; y: number; f: number; children: React.ReactNode; size?: number; rot?: number; color?: string}> = ({
  x,
  y,
  f,
  children,
  size = 48,
  rot = -8,
  color = '#B3261E',
}) => {
  const p = prog(f, 10);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: p * 0.9, transform: `rotate(${rot}deg) scale(${1.25 - 0.25 * p})`, mixBlendMode: 'multiply'}}>
      <div style={{border: `6px solid ${color}`, borderRadius: 8, padding: '4px 22px', color, fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, whiteSpace: 'nowrap'}}>{children}</div>
    </div>
  );
};

/** Terminal: dark warm grey room with a soft vignette. */
export const TermBg: React.FC = () => {
  const {frame} = useT();
  const g = 40 + 6 * Math.sin(frame / 60);
  return <AbsoluteFill style={{background: `radial-gradient(ellipse at 60% ${g}%, #2A2926 0%, ${MX.term} 70%)`}} />;
};

/** Terminal window. Children are lines. */
export const TermWin: React.FC<{x: number; y: number; w: number; h: number; title?: string; f?: number; children?: React.ReactNode}> = ({x, y, w, h, title = 'claude', f = 0, children}) => {
  const p = prog(f, 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: '#262624',
        border: '1px solid #3C3B38',
        borderRadius: 16,
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <div style={{height: 46, background: '#30302E', display: 'flex', alignItems: 'center', paddingLeft: 18, gap: 10}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
        ))}
        <Mono size={20} color={COL.termDim} style={{marginLeft: 14}}>
          {title}
        </Mono>
      </div>
      <div style={{padding: '24px 34px'}}>{children}</div>
    </div>
  );
};

/** One terminal line, typed in from f (cps chars/sec); `pre` is shown at once (prompt marks). */
export const TLine: React.FC<{f: number; text: string; color?: string; pre?: React.ReactNode; cps?: number; size?: number; hi?: boolean}> = ({
  f,
  text,
  color = COL.termInk,
  pre,
  cps = 45,
  size = 25,
  hi,
}) => {
  if (f < 0) return <div style={{height: size * 1.7}} />;
  const n = typed(f, text, cps);
  return (
    <div style={{fontFamily: FONT_MONO, fontSize: size, lineHeight: 1.7, color, whiteSpace: 'pre-wrap', minHeight: size * 1.7}}>
      {pre}
      <span style={hi ? {background: `rgba(217,119,87,${0.22 * prog(f, 20, text.length * 30 / cps)})`, borderRadius: 6} : undefined}>{text.slice(0, n)}</span>
    </div>
  );
};

/** Side pill (terminal scenes). */
export const Pill: React.FC<{f: number; tone?: 'good' | 'bad' | 'plain'; children: React.ReactNode; size?: number}> = ({f, tone = 'plain', children, size = 27}) => {
  const bg = tone === 'good' ? '#1D3A2A' : tone === 'bad' ? '#3A1F1D' : '#2C2B29';
  const bl = tone === 'good' ? '#4CAF7D' : tone === 'bad' ? '#E06C5A' : COL.clay;
  return (
    <div style={{...slideX(f, -30), background: bg, borderLeft: `6px solid ${bl}`, borderRadius: 12, padding: '14px 22px', marginBottom: 16}}>
      <Sans size={size} color="#EEE" w={500}>
        {children}
      </Sans>
    </div>
  );
};

/** Blueprint: blue sheet, creeping grid, border frame and a title block. */
export const BlueprintBg: React.FC<{dwg?: string; note?: string}> = ({dwg, note}) => {
  const {frame} = useT();
  const off = frame * 0.2;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #155AA0 0%, ${MX.blue} 75%)`}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: `${off}px ${off}px`,
        }}
      />
      <div style={{position: 'absolute', left: 40, top: 30, right: 40, bottom: 30, border: `3px solid ${COL.bpLine}`}} />
      {dwg && (
        <div style={{position: 'absolute', right: 40, top: 30, width: 500, borderLeft: `3px solid ${COL.bpLine}`, borderBottom: `3px solid ${COL.bpLine}`, padding: '12px 18px'}}>
          <Mono size={20} color={COL.bpLine}>
            {dwg}
          </Mono>
          {note && (
            <div>
              <Mono size={18} color={COL.bpFaint}>
                {note}
              </Mono>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Blueprint box whose outline is drawn in with p (0..1). */
export const BpBox: React.FC<{x: number; y: number; w: number; h: number; p: number; dashed?: boolean; red?: boolean; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  p,
  dashed,
  red,
  children,
  style,
}) => {
  const c = red ? COL.bpRed : COL.bpLine;
  const per = 2 * (w + h);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <rect
          x={1.5}
          y={1.5}
          width={w - 3}
          height={h - 3}
          fill={red ? `rgba(255,155,138,${0.08 * clamp01(p * 1.5 - 0.5)})` : `rgba(232,242,255,${0.04 * clamp01(p * 1.5 - 0.5)})`}
          stroke={c}
          strokeWidth={3}
          strokeDasharray={dashed ? '12 9' : `${per} ${per}`}
          strokeDashoffset={dashed ? 0 : per * (1 - clamp01(p))}
          opacity={dashed ? clamp01(p) : 1}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: red ? '#FFD2C9' : '#E8F2FF',
          opacity: prog(p * 30 - 18, 10),
          padding: 12,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** SVG path drawn in by p. */
export const Draw: React.FC<{d: string; p: number; color?: string; w?: number; dash?: string; marker?: boolean}> = ({d, p, color = COL.bpLine, w = 3, dash, marker}) => (
  <g>
    <path d={d} fill="none" stroke={color} strokeWidth={w} pathLength={1} strokeDasharray={dash ? undefined : '1 1'} strokeDashoffset={dash ? undefined : 1 - clamp01(p)} opacity={p <= 0 ? 0 : 1} strokeLinecap="round" style={dash ? {strokeDasharray: dash, opacity: clamp01(p)} : undefined} />
    {marker && p > 0.95 && <circle cx={0} cy={0} r={0} />}
  </g>
);

/** Corkboard with wooden frame. */
export const CorkBg: React.FC = () => {
  const {frame} = useT();
  return (
    <AbsoluteFill style={{background: MX.cork}}>
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 36,
          width: 1820,
          height: 906,
          borderRadius: 10,
          background: '#C9A77C',
          boxShadow: 'inset 0 0 0 18px #6B4A2E, 0 20px 50px rgba(0,0,0,0.4)',
          backgroundImage: 'radial-gradient(#B8956A 1.5px, transparent 1.6px)',
          backgroundSize: '14px 14px',
          backgroundPosition: `${frame * 0.1}px 0`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Pinned note: drops in from above with a slight swing settling to `rot`. */
export const Note: React.FC<{x: number; y: number; w: number; f: number; bg?: string; rot?: number; children: React.ReactNode; size?: number; pad?: string}> = ({
  x,
  y,
  w,
  f,
  bg = '#FFF3A8',
  rot = -1.5,
  children,
  size = 30,
  pad = '28px 32px',
}) => {
  const p = prog(f, 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        background: bg,
        padding: pad,
        boxShadow: `4px ${4 + 6 * p}px ${8 + 8 * p}px rgba(0,0,0,0.3)`,
        transform: `translateY(${(1 - p) * -40}px) rotate(${rot + (1 - p) * 4}deg)`,
        opacity: p,
        fontFamily: FONT_ZH,
        fontSize: size,
        fontWeight: 500,
        lineHeight: 1.5,
        color: '#222',
      }}
    >
      <div style={{position: 'absolute', top: -14, left: '50%', marginLeft: -14, width: 28, height: 28, borderRadius: 14, background: 'radial-gradient(circle at 35% 35%, #FF8A7A, #B52A1C)', boxShadow: '2px 4px 4px rgba(0,0,0,0.4)'}} />
      {children}
    </div>
  );
};

/** Telestrator: frozen "broadcast" frame (child) with a FREEZE bug in the corner. */
export const PitchBg: React.FC<{children?: React.ReactNode; tag?: string}> = ({children, tag}) => {
  const {frame} = useT();
  return (
    <AbsoluteFill style={{background: MX.pitch}}>
      <div style={{position: 'absolute', left: 80, top: 60, width: 1760, height: 860, borderRadius: 14, overflow: 'hidden', background: '#1D4A2E'}}>
        <svg width={1760} height={860} style={{position: 'absolute'}}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={i * 300 - ((frame * 0.4) % 300)} y={0} width={150} height={860} fill="rgba(255,255,255,0.025)" />
          ))}
          <rect x={20} y={20} width={1720} height={820} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
          <line x1={880} y1={20} x2={880} y2={840} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
          <circle cx={880} cy={430} r={110} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
        </svg>
        {children}
      </div>
      {tag && (
        <div style={{position: 'absolute', right: 110, top: 86, background: '#C22', color: '#fff', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, padding: '4px 14px', borderRadius: 4, opacity: 0.6 + 0.4 * Math.abs(Math.sin(frame / 20))}}>
          {tag}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const MarkerLabel: React.FC<{x: number; y: number; f: number; children: React.ReactNode; color?: string; size?: number}> = ({x, y, f, children, color = COL.marker, size = 34}) => (
  <Abs x={x} y={y} style={{...rise(f, 14), fontFamily: FONT_ZH, fontWeight: 900, fontSize: size, color, textShadow: '0 2px 6px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>
    {children}
  </Abs>
);

/** Data story: clean off-white with a faint baseline grid. */
export const DataBg: React.FC = () => {
  const {frame} = useT();
  return (
    <AbsoluteFill style={{background: MX.data}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)', backgroundSize: '100% 60px', backgroundPosition: `0 ${frame * 0.15}px`}} />
    </AbsoluteFill>
  );
};

/** Editorial: cream with a soft warm vignette. */
export const EditBg: React.FC = () => {
  const {frame} = useT();
  return <AbsoluteFill style={{background: `radial-gradient(ellipse at ${30 + 10 * Math.sin(frame / 90)}% 30%, #FFFDF8 0%, ${MX.edit} 60%)`}} />;
};

/** Org chart (editorial / pictogram): `you` box and n children, lines drawn in. */
export const OrgChart: React.FC<{x: number; y: number; n?: number; f: number; w?: number; label?: string; dark?: boolean; childLabel?: string}> = ({
  x,
  y,
  n = 4,
  f,
  w = 170,
  label = 'you',
  dark = false,
  childLabel = 'agent',
}) => {
  const gap = w + 40;
  const tw = gap * (n - 1) + w;
  const cx = tw / 2;
  const ink = dark ? '#FFFFFF' : COL.ink;
  const pTop = prog(f, 16);
  const pLine = prog(f, 20, 10);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: tw, height: 300}}>
      <div
        style={{
          position: 'absolute',
          left: cx - 110,
          top: 0,
          width: 220,
          height: 90,
          borderRadius: 16,
          background: COL.clay,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pTop,
          transform: `translateY(${(1 - pTop) * 16}px)`,
        }}
      >
        <Serif size={42} w={500} color={COL.ink}>
          {label}
        </Serif>
      </div>
      <svg width={tw} height={300} style={{position: 'absolute', left: 0, top: 0}}>
        <Draw d={`M${cx} 90 V150`} p={pLine} color={ink} />
        <Draw d={`M${w / 2} 150 H${tw - w / 2}`} p={prog(f, 20, 18)} color={ink} />
        {Array.from({length: n}).map((_, i) => (
          <Draw key={i} d={`M${i * gap + w / 2} 150 V200`} p={prog(f, 12, 30 + i * 4)} color={ink} />
        ))}
      </svg>
      {Array.from({length: n}).map((_, i) => {
        const p = prog(f, 14, 36 + i * 5);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * gap,
              top: 200,
              width: w,
              height: 76,
              borderRadius: 14,
              border: `2.5px solid ${ink}`,
              background: dark ? 'transparent' : '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: p,
              transform: `translateY(${(1 - p) * 14}px)`,
            }}
          >
            <Mono size={26} color={ink}>
              {childLabel}
            </Mono>
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ pictograms
export const Person: React.FC<{c?: string; s?: number}> = ({c = '#fff', s = 1}) => (
  <g transform={`scale(${s})`}>
    <circle cx={80} cy={40} r={30} fill={c} />
    <rect x={45} y={80} width={70} height={90} rx={20} fill={c} />
  </g>
);
export const Bot: React.FC<{c?: string; s?: number; eye?: string}> = ({c = COL.yellow, s = 1, eye = MX.picto}) => (
  <g transform={`scale(${s})`}>
    <rect x={48} y={12} width={64} height={56} rx={12} fill={c} />
    <rect x={45} y={80} width={70} height={90} rx={14} fill={c} />
    <circle cx={68} cy={40} r={7} fill={eye} />
    <circle cx={92} cy={40} r={7} fill={eye} />
  </g>
);
