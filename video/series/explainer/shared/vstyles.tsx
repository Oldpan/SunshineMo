// Vertical (9:16) per-scene style mix for 讲透 shorts, first made for minimax-h3-image-shorts (2026-11).
// Five looks that share one set of motion helpers (popflat's pop / rise / slam, stylemix's serif loader):
//   gallery    展厅画廊   dark warm wall, spotlight, framed pictures with museum placards, drifting dust
//   darkroom   胶片暗房   red safelight, film grain, 35 mm strips with sprockets, grease-pencil circles
//   editorial  杂志编辑排版 paper white, serif headline, red kicker rule, captions in italic
//   data       数据叙事   white, faint moving grid, purple accent, big numbers and bars drawn to scale
//   blueprint  蓝图       blue sheet with a drifting grid, white strokes that draw themselves, mono notes
// Every stage pushes in slowly and moves its background each frame, so long holds never read as frozen frames.
// Layout: key content inside SAFE (x 100–960, y 330–1290); the engine puts subtitles near y 1330.
import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {FONT_MONO, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene} from '@atv/lib/timing';
import {Burst, during, lerp, pop, rise, Ring, rng, SAFE, shakeAt, slam, Sparkles, useSub} from './popflat';
import {FONT_SERIF, useSerif} from './stylemix';

export {Burst, clamp01, during, EASE, FONT_MONO, FONT_SERIF, lerp, pop, prog, rise, Ring, rng, SAFE, shakeAt, slam, Sparkles, useSerif, useSub};

THEMES.gallery = {bg: '#161412', bg2: '#2A2622', accent: '#E9C987', accentSoft: '#3A332A', ink: '#F2EDE2', dark: true};
THEMES.darkroom = {bg: '#0D0807', bg2: '#241210', accent: '#FF5A3C', accentSoft: '#3A1A14', ink: '#FFF3EA', dark: true};
THEMES.editorial = {bg: '#F6F3EC', bg2: '#ECE7DC', accent: '#B22A1D', accentSoft: '#F1DCD6', ink: '#161616', dark: false};
THEMES.data = {bg: '#FFFFFF', bg2: '#F3EFFC', accent: '#6D3FE0', accentSoft: '#EDE6FC', ink: '#16181D', dark: false};
THEMES.blueprint = {bg: '#0F3A6E', bg2: '#0B2E58', accent: '#FFE08A', accentSoft: '#1D4F8A', ink: '#E8F2FF', dark: true};

export const V = {
  // gallery
  wall: '#161412', wall2: '#3A3632', gold: '#C9A96A', goldHi: '#E9C987', card: '#F2EDE2', cream: '#F4ECD8',
  // darkroom
  dark: '#0D0807', safe: '#FF5A3C', safeDim: '#7A3A2E', film: '#1A1110', peach: '#FFB199', warm: '#FFF3EA',
  // editorial
  paper: '#F6F3EC', ink: '#161616', red: '#B22A1D', grey: '#6B6660', rule: '#C9C3B8',
  // data
  white: '#FFFFFF', purple: '#6D3FE0', lilac: '#EDE6FC', slate: '#16181D', mute: '#8C8A95', bar: '#D9D6E0',
  // blueprint
  blue: '#0F3A6E', line: '#E8F2FF', note: '#9FD0FF', yellow: '#FFE08A',
};
export const FONT_ZH = '"Noto Sans SC", "PingFang SC", sans-serif';
export const FONT_NUM = '"Outfit", "Noto Sans SC", sans-serif';

// ------------------------------------------------------------------ text
type TP = {children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties};
export const Sans: React.FC<TP> = ({children, size = 48, color = 'inherit', w = 800, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.22, ...style}}>{children}</span>
);
export const Serif: React.FC<TP> = ({children, size = 48, color = 'inherit', w = 800, style}) => (
  <span style={{fontFamily: FONT_SERIF, fontSize: size, fontWeight: w, color, lineHeight: 1.2, ...style}}>{children}</span>
);
export const Num: React.FC<TP> = ({children, size = 96, color = 'inherit', w = 800, style}) => (
  <span style={{fontFamily: FONT_NUM, fontSize: size, fontWeight: w, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...style}}>{children}</span>
);
export const Mono: React.FC<TP> = ({children, size = 28, color = 'inherit', w = 600, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, letterSpacing: 2, whiteSpace: 'pre', ...style}}>{children}</span>
);
export const Abs: React.FC<{x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);
/** Centered block at y across the safe column. */
export const Center: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: 'absolute', left: SAFE.x0 - 40, width: SAFE.x1 - SAFE.x0 + 80, top: y, textAlign: 'center', ...style}}>{children}</div>
);
/** Rolling number with `dec` decimals. */
export const roll = (v: number, p: number, dec = 0) => (v * EASE(clamp01(p))).toFixed(dec);

// ------------------------------------------------------------------ pictures
/**
 * A picture that fills its box (object-fit cover) with a slow Ken Burns push from `z0` to `z1` over `dur` frames
 * after `f` = 0, centred on `fx, fy` (0..1 of the picture). `p` reveals it (opacity).
 */
export const Pic: React.FC<{src: string; w: number; h: number; f?: number; dur?: number; z0?: number; z1?: number; fx?: number; fy?: number; fit?: 'cover' | 'contain'; bg?: string; style?: React.CSSProperties}> = ({
  src,
  w,
  h,
  f = 0,
  dur = 240,
  z0 = 1.02,
  z1 = 1.1,
  fx = 0.5,
  fy = 0.5,
  fit = 'cover',
  bg = 'transparent',
  style,
}) => {
  const z = lerp(z0, z1, clamp01(f / dur));
  return (
    <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', background: bg, ...style}}>
      <Img src={src} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: `${fx * 100}% ${fy * 100}%`, transform: `scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}} />
    </div>
  );
};
/** 「图源 MiniMax 官方」-style corner credit. */
export const Credit: React.FC<{x?: number; y?: number; color?: string; text?: string}> = ({x = 100, y = 1258, color = 'rgba(255,255,255,0.55)', text = '图源 MiniMax 官方'}) => (
  <Abs x={x} y={y}>
    <span style={{fontFamily: FONT_ZH, fontSize: 24, fontWeight: 600, color, letterSpacing: 1}}>{text}</span>
  </Abs>
);

// ------------------------------------------------------------------ stage wrapper
const usePush = (amount: number) => {
  const frame = useCurrentFrame();
  const {duration} = useScene();
  return 1 + amount * clamp01(frame / Math.max(1, duration));
};
const Content: React.FC<{children: React.ReactNode; zoom: number; cy?: number; shake?: {dx: number; dy: number}}> = ({children, zoom, cy = 800, shake}) => (
  <AbsoluteFill style={{transform: `translate(${shake?.dx ?? 0}px, ${shake?.dy ?? 0}px) scale(${zoom})`, transformOrigin: `540px ${cy}px`}}>{children}</AbsoluteFill>
);

// ------------------------------------------------------------------ gallery 展厅画廊
/** Dark wall with a breathing spotlight and dust drifting through the beam. */
export const GalleryStage: React.FC<{children: React.ReactNode; spot?: number; cy?: number; shake?: {dx: number; dy: number}}> = ({children, spot = 760, cy = 800, shake}) => {
  useSerif();
  const frame = useCurrentFrame();
  const zoom = usePush(0.02);
  const r = rng(11);
  const dust = Array.from({length: 40}, () => ({x: 200 + r() * 680, y: r() * 1500, s: 1.5 + r() * 3, v: 0.2 + r() * 0.5, ph: r() * 6}));
  const breathe = 0.9 + 0.1 * Math.sin(frame / 40);
  return (
    <AbsoluteFill style={{background: V.wall, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 62% 36% at 50% ${(spot / 1920) * 100}%, rgba(74,66,58,${breathe}) 0%, rgba(22,20,18,0) 72%)`}} />
      {/* light cone from the ceiling */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE9C2" stopOpacity={0.16 * breathe} />
            <stop offset="1" stopColor="#FFE9C2" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`M470 0 L610 0 L${980} ${spot + 420} L${100} ${spot + 420} Z`} fill="url(#cone)" />
        {dust.map((d, i) => {
          const y = ((d.y + frame * d.v * 1.6) % 1500) + 60;
          const x = d.x + Math.sin(frame / 50 + d.ph) * 24;
          return <circle key={i} cx={x} cy={y} r={d.s} fill="#FFE9C2" opacity={0.25 + 0.2 * Math.sin(frame / 20 + d.ph)} />;
        })}
      </svg>
      {/* floor line */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1560, height: 360, background: 'linear-gradient(#1F1C19, #0E0D0C)'}} />
      <Content zoom={zoom} cy={cy} shake={shake}>
        {children}
      </Content>
    </AbsoluteFill>
  );
};
/** A framed picture on the gallery wall: black mount, gold fillet, deep shadow. `p` hangs it (drops in). */
export const Frame: React.FC<{x: number; y: number; w: number; h: number; src: string; f: number; delay?: number; fx?: number; fy?: number; z1?: number; mat?: number}> = ({x, y, w, h, src, f, delay = 0, fx, fy, z1 = 1.08, mat = 14}) => {
  const s = pop(f, delay, 0.86);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...s, boxShadow: '0 36px 70px rgba(0,0,0,0.75), 0 0 140px rgba(255,230,180,0.10)', outline: `3px solid ${V.gold}`, border: `${mat}px solid #0C0B0A`, boxSizing: 'border-box'}}>
      <Pic src={src} w={w - mat * 2} h={h - mat * 2} f={f - delay} dur={300} z1={z1} fx={fx} fy={fy} />
    </div>
  );
};
/** Museum placard (title + small line) under a frame. */
export const Placard: React.FC<{x: number; y: number; title: string; sub?: string; f: number; delay?: number; hi?: boolean; w?: number}> = ({x, y, title, sub, f, delay = 0, hi, w}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...rise(f, delay, 24)}}>
    <div style={{display: 'inline-block', background: hi ? V.goldHi : V.card, padding: '10px 22px', boxShadow: '0 10px 24px rgba(0,0,0,0.5)'}}>
      <Serif size={36} w={700} color="#1A1A1A">
        {title}
      </Serif>
      {sub && (
        <div>
          <Sans size={24} w={500} color="#6B6157">
            {sub}
          </Sans>
        </div>
      )}
    </div>
  </div>
);
export const GKicker: React.FC<{children: React.ReactNode; f: number; y?: number}> = ({children, f, y = 330}) => (
  <Center y={y}>
    <div style={rise(f, 0, 20)}>
      <Mono size={28} color={V.gold} style={{letterSpacing: 8}}>
        {children}
      </Mono>
    </div>
  </Center>
);

// ------------------------------------------------------------------ darkroom 胶片暗房
/** Safelight-red darkroom: flickering lamp glow, moving grain, slow push. */
export const DarkroomStage: React.FC<{children: React.ReactNode; cy?: number; shake?: {dx: number; dy: number}}> = ({children, cy = 800, shake}) => {
  const frame = useCurrentFrame();
  const zoom = usePush(0.022);
  const flick = 0.85 + 0.08 * Math.sin(frame / 7) + 0.05 * Math.sin(frame / 2.3);
  const seed = frame % 12;
  return (
    <AbsoluteFill style={{background: V.dark, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 78% 8%, rgba(210,40,24,${0.38 * flick}) 0%, rgba(13,8,7,0) 58%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 50% at 50% 55%, rgba(70,20,14,${0.35 * flick}) 0%, rgba(13,8,7,0) 75%)`}} />
      {/* drying line with clips */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M-20 ${250 + Math.sin(frame / 60) * 4} Q540 ${292 + Math.sin(frame / 60) * 6} 1100 ${250 + Math.sin(frame / 60) * 4}`} stroke="#3A2420" strokeWidth={3} fill="none" />
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.8  0 0 0 0 0.7  0 0 0 0.09 0" />
        </filter>
        <rect width={1080} height={1920} filter={`url(#grain${seed})`} />
      </svg>
      <Content zoom={zoom} cy={cy} shake={shake}>
        {children}
      </Content>
    </AbsoluteFill>
  );
};
/** A 35 mm strip frame: dark rebate with sprocket holes top and bottom; the picture drifts inside. */
export const FilmFrame: React.FC<{x: number; y: number; w: number; h: number; src: string; f: number; delay?: number; fx?: number; fy?: number; z1?: number; label?: string; dev?: number}> = ({
  x,
  y,
  w,
  h,
  src,
  f,
  delay = 0,
  fx,
  fy,
  z1 = 1.1,
  label,
  dev = 1,
}) => {
  const reb = 44;
  const holes = Math.floor(w / 46);
  const s = rise(f, delay, 40);
  const d = clamp01(dev);
  return (
    <div style={{position: 'absolute', left: x, top: y - reb, width: w, height: h + reb * 2, background: V.film, ...s, boxShadow: '0 24px 50px rgba(0,0,0,0.7)'}}>
      {[6, h + reb + 14].map((ty) => (
        <div key={ty} style={{position: 'absolute', left: 12, top: ty, display: 'flex', gap: 22}}>
          {Array.from({length: holes}, (_, i) => (
            <div key={i} style={{width: 24, height: 20, borderRadius: 4, background: '#D9C2A8', opacity: 0.55}} />
          ))}
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, top: reb, filter: `brightness(${0.25 + 0.75 * d}) sepia(${(1 - d) * 0.9}) saturate(${0.3 + 0.7 * d})`}}>
        <Pic src={src} w={w} h={h} f={f - delay} dur={260} z1={z1} fx={fx} fy={fy} />
      </div>
      {label && (
        <div style={{position: 'absolute', left: 16, top: h + reb + 40}}>
          <Mono size={22} color="#E9A48E">
            {label}
          </Mono>
        </div>
      )}
    </div>
  );
};
/** Grease-pencil ellipse drawn around (cx, cy); `p` 0..1 draws it. */
export const Grease: React.FC<{cx: number; cy: number; rx: number; ry: number; p: number; color?: string; width?: number}> = ({cx, cy, rx, ry, p, color = V.safe, width = 7}) => {
  if (p <= 0) return null;
  const len = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * 1.08;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible'}}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - EASE(clamp01(p)))} transform={`rotate(-6 ${cx} ${cy})`} style={{filter: `drop-shadow(0 0 6px ${color}88)`}} />
    </svg>
  );
};
export const DKicker: React.FC<{children: React.ReactNode; f: number; x?: number; y?: number}> = ({children, f, x = 100, y = 330}) => (
  <Abs x={x} y={y} style={rise(f, 0, 20)}>
    <Mono size={28} color={V.safe} style={{letterSpacing: 6}}>
      {children}
    </Mono>
  </Abs>
);

// ------------------------------------------------------------------ editorial 杂志编辑排版
/** Paper page with a slowly sliding hairline column grid and a masthead line. */
export const EditorialStage: React.FC<{children: React.ReactNode; masthead?: string; cy?: number}> = ({children, masthead = 'MINIMAX H3-IMAGE · 2026.11.10', cy = 800}) => {
  useSerif();
  const frame = useCurrentFrame();
  const zoom = usePush(0.02);
  const off = (frame * 0.5) % 180;
  return (
    <AbsoluteFill style={{background: V.paper, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)', backgroundSize: '180px 100%', backgroundPosition: `${off}px 0`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.6), rgba(236,231,220,0) 70%)'}} />
      <Abs x={100} y={262} w={880} h={4} style={{background: V.ink}} />
      <Abs x={100} y={1272} w={880}>
        <Mono size={22} color="#9A948A" style={{letterSpacing: 5}}>
          {masthead}
        </Mono>
      </Abs>
      <Content zoom={zoom} cy={cy}>
        {children}
      </Content>
    </AbsoluteFill>
  );
};
export const EKicker: React.FC<{children: React.ReactNode; f: number; y?: number}> = ({children, f, y = 290}) => (
  <Abs x={100} y={y} style={rise(f, 0, 16)}>
    <Mono size={28} color={V.red} w={700} style={{letterSpacing: 6}}>
      {children}
    </Mono>
  </Abs>
);

// ------------------------------------------------------------------ data 数据叙事
export const DataStage: React.FC<{children: React.ReactNode; cy?: number}> = ({children, cy = 800}) => {
  const frame = useCurrentFrame();
  const zoom = usePush(0.018);
  const off = (frame * 0.6) % 60;
  return (
    <AbsoluteFill style={{background: V.white, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(109,63,224,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(109,63,224,0.07) 1px, transparent 1px)', backgroundSize: '60px 60px', backgroundPosition: `0 ${off}px`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.92) 30%, rgba(255,255,255,0.4) 100%)'}} />
      <Content zoom={zoom} cy={cy}>
        {children}
      </Content>
    </AbsoluteFill>
  );
};
/** Horizontal bar drawn to scale: `v` / `max` of `w`, label left, value right. */
export const HBar: React.FC<{x: number; y: number; w: number; v: number; max: number; p: number; label: string; sub?: string; color?: string; dec?: number; unit?: string}> = ({
  x,
  y,
  w,
  v,
  max,
  p,
  label,
  sub,
  color = V.purple,
  dec = 1,
  unit = ' 秒',
}) => {
  const k = EASE(clamp01(p));
  const bw = (v / max) * w * k;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: clamp01(p * 4)}}>
      <div>
        <Sans size={34} w={800} color={V.slate}>
          {label}
        </Sans>
        {sub && (
          <Sans size={26} w={500} color={V.mute} style={{marginLeft: 12}}>
            {sub}
          </Sans>
        )}
      </div>
      <div style={{position: 'relative', marginTop: 10, height: 62}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: bw, height: 62, background: color, borderRadius: '0 10px 10px 0'}} />
        <div style={{position: 'absolute', left: bw + 16, top: 4, whiteSpace: 'nowrap'}}>
          <Num size={52} color={color}>
            {(v * k).toFixed(dec)}
            <span style={{fontFamily: FONT_ZH, fontSize: 30, fontWeight: 700}}>{unit}</span>
          </Num>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ blueprint 蓝图
export const BlueprintStage: React.FC<{children: React.ReactNode; cy?: number; sheet?: string}> = ({children, cy = 800, sheet = 'DWG H3-IMAGE · SHEET 1/1'}) => {
  const frame = useCurrentFrame();
  const zoom = usePush(0.02);
  const off = frame * 0.4;
  return (
    <AbsoluteFill style={{background: V.blue, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.13) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.13) 1.5px, transparent 1.5px)',
          backgroundSize: '36px 36px, 36px 36px, 180px 180px, 180px 180px',
          backgroundPosition: `${off}px ${off * 0.6}px, ${off}px ${off * 0.6}px, ${off}px ${off * 0.6}px, ${off}px ${off * 0.6}px`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(15,58,110,0) 40%, rgba(7,30,60,0.75) 100%)'}} />
      <Abs x={720} y={1262} style={{border: `2px solid ${V.note}`, padding: '4px 12px'}}>
        <Mono size={18} color={V.note}>
          {sheet}
        </Mono>
      </Abs>
      <Content zoom={zoom} cy={cy}>
        {children}
      </Content>
    </AbsoluteFill>
  );
};
/** A box whose outline draws itself (p 0..1), then the content fades in. */
export const BpBox: React.FC<{x: number; y: number; w: number; h: number; p: number; color?: string; dash?: boolean; children?: React.ReactNode; fill?: string}> = ({x, y, w, h, p, color = V.line, dash, children, fill = 'rgba(15,58,110,0.6)'}) => {
  if (p <= 0) return null;
  const per = 2 * (w + h);
  const k = EASE(clamp01(p * 1.4));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      <svg width={w + 8} height={h + 8} style={{position: 'absolute', left: -4, top: -4, overflow: 'visible'}}>
        <rect x={4} y={4} width={w} height={h} fill={fill} fillOpacity={k} stroke={color} strokeWidth={3} strokeDasharray={dash ? '12 10' : per} strokeDashoffset={dash ? 0 : per * (1 - k)} opacity={dash ? k : 1} />
      </svg>
      <div style={{position: 'absolute', inset: 0, padding: '18px 28px', opacity: clamp01(p * 2 - 0.6)}}>{children}</div>
    </div>
  );
};
/** A straight line that draws from (x1,y1) to (x2,y2) with an arrow head. */
export const BpArrow: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color?: string}> = ({x1, y1, x2, y2, p, color = V.yellow}) => {
  if (p <= 0) return null;
  const k = EASE(clamp01(p));
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={4} />
      {k > 0.95 && <path d={`M${x2} ${y2} L${x2 - 18 * Math.cos(a - 0.45)} ${y2 - 18 * Math.sin(a - 0.45)} L${x2 - 18 * Math.cos(a + 0.45)} ${y2 - 18 * Math.sin(a + 0.45)} Z`} fill={color} />}
    </svg>
  );
};
