// ai-jobs-safe: the shared gameshow kit plus this episode's own pieces.
import React from 'react';
import {Img, Sequence, useCurrentFrame} from 'remotion';
import {E, F_CJK, F_ROUND, K, seg, ShadowCard, TelopDiv, useGSFonts} from '../../../shared/gameshow';

export * from '../../../shared/gameshow';

/** Every scene calls this once (fonts for the SVG telops). */
export const useKit = () => useGSFonts();

/** Tag sticker: small rounded plate, ink border, tilted. */
export const Sticker: React.FC<{text: string; col?: string; fg?: string; size?: number; rot?: number; style?: React.CSSProperties; family?: string}> = ({
  text,
  col = K.yellow,
  fg = K.ol,
  size = 36,
  rot = -4,
  style,
  family = F_CJK,
}) => (
  <div
    style={{
      display: 'inline-block',
      fontFamily: family,
      fontWeight: 900,
      fontSize: size,
      color: fg,
      background: col,
      border: `6px solid ${K.ol}`,
      borderRadius: size * 0.45,
      padding: `${size * 0.06}px ${size * 0.5}px`,
      boxShadow: `6px 6px 0 ${K.ol}`,
      transform: `rotate(${rot}deg)`,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);

/** A number stamp that slams in at f0 (scale 1.6 → 1 with back-ease), tilted. */
export const Stamp: React.FC<{f0: number; children: React.ReactNode; x: number; y: number; size?: number; col?: string; rot?: number; anchor?: 'left' | 'center' | 'right'}> = ({
  f0,
  children,
  x,
  y,
  size = 96,
  col = K.yellow,
  rot = -8,
  anchor = 'center',
}) => {
  const f = useCurrentFrame();
  if (f < f0) return null;
  const p = seg(f, f0, f0 + 7);
  const s = 1.7 - 0.7 * E.back(p);
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%) rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, p * 3), whiteSpace: 'nowrap'}}>
      <TelopDiv size={size} color={col} family={F_ROUND}>
        {children}
      </TelopDiv>
    </div>
  );
};

/** A news screenshot on a hard-shadow card with the outlet name on a sticker. */
export const NewsTile: React.FC<{src: string; w: number; h: number; outlet: string; focus?: string; date?: string}> = ({src, w, h, outlet, focus = '50% 30%', date}) => (
  <div style={{position: 'relative', width: w + 14, height: h + 14}}>
    <ShadowCard w={w} h={h} col={K.white} r={22} off={14} border={7}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus}} />
    </ShadowCard>
    <div style={{position: 'absolute', right: -6, bottom: -26}}>
      <Sticker text={date ? `${outlet} · ${date}` : outlet} col={K.white} size={26} rot={2} family={F_ROUND} />
    </div>
  </div>
);

/** Rounded quote / speech bubble (cream card + tail). */
export const Bubble: React.FC<{children: React.ReactNode; w: number; col?: string; tail?: 'left' | 'right' | 'down' | 'none'; style?: React.CSSProperties; size?: number}> = ({
  children,
  w,
  col = K.cream,
  tail = 'down',
  style,
  size = 40,
}) => (
  <div style={{position: 'relative', width: w, ...style}}>
    <div
      style={{
        background: col,
        border: `7px solid ${K.ol}`,
        borderRadius: 30,
        boxShadow: `12px 12px 0 ${K.ol}`,
        padding: '20px 30px',
        fontFamily: F_CJK,
        fontWeight: 900,
        fontSize: size,
        color: K.ol,
        lineHeight: 1.35,
      }}
    >
      {children}
    </div>
    {tail !== 'none' && (
      <svg width={70} height={60} style={{position: 'absolute', ...(tail === 'down' ? {left: 70, bottom: -50} : tail === 'left' ? {left: -50, top: 40} : {right: -50, top: 40})}}>
        <path
          d={tail === 'down' ? 'M 6 0 L 40 52 L 52 0' : tail === 'left' ? 'M 64 8 L 6 30 L 64 46' : 'M 6 8 L 64 30 L 6 46'}
          fill={col}
          stroke={K.ol}
          strokeWidth={7}
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
);

/** Pop-in wrapper (absolute position, back-ease scale from f0, ease-in exit before f1). */
export const Pop: React.FC<{f0: number; f1?: number; x: number; y: number; children: React.ReactNode; origin?: string; rot?: number; from?: 'scale' | 'drop' | 'left' | 'right'}> = ({
  f0,
  f1 = 1e9,
  x,
  y,
  children,
  origin = '50% 50%',
  rot = 0,
  from = 'scale',
}) => {
  const f = useCurrentFrame();
  if (f < f0 || f >= f1) return null;
  const p = E.back(seg(f, f0, f0 + 9));
  const o = E.in(seg(f, f1 - 6, f1));
  let tr = '';
  if (from === 'scale') tr = `scale(${p * (1 - o)})`;
  if (from === 'drop') tr = `translateY(${(1 - E.out(seg(f, f0, f0 + 9))) * -900 + o * 900}px)`;
  if (from === 'left') tr = `translateX(${(1 - p) * -1400 - o * 1400}px)`;
  if (from === 'right') tr = `translateX(${(1 - p) * 1400 + o * 1400}px)`;
  return <div style={{position: 'absolute', left: x, top: y, transform: `${tr} rotate(${rot}deg)`, transformOrigin: origin}}>{children}</div>;
};

/** SVG layer helper: a full-frame svg for cast and drawings. */
export const Layer: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    {children}
  </svg>
);

export const Title: React.FC<{text: string; sub?: string; f0?: number; y?: number; size?: number; col?: string}> = ({text, sub, f0 = 0, y = 70, size = 76, col = K.white}) => {
  const f = useCurrentFrame();
  const p = E.back(seg(f, f0, f0 + 9));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${p})`}}>
      <TelopDiv size={size} color={col}>
        {text}
      </TelopDiv>
      {sub && <div style={{marginTop: 8, fontFamily: F_CJK, fontWeight: 900, fontSize: 36, color: K.ol}}>{sub}</div>}
    </div>
  );
};

/** Round tag kept in the top-left corner during a round. */
export const RoundTag: React.FC<{n: number; name: string; col: string}> = ({n, name, col}) => {
  const f = useCurrentFrame();
  const p = E.back(seg(f, 0, 10));
  return (
    <div style={{position: 'absolute', left: 46, top: 40, transform: `translateX(${(1 - p) * -600}px) rotate(-3deg)`, display: 'flex', alignItems: 'center'}}>
      <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 34, color: K.ol, background: K.yellow, border: `6px solid ${K.ol}`, borderRadius: 26, padding: '2px 20px', boxShadow: `6px 6px 0 ${K.ol}`, zIndex: 2}}>
        ROUND {n}
      </div>
      <div style={{marginLeft: -14, fontFamily: F_CJK, fontWeight: 900, fontSize: 40, color: K.white, background: col, border: `6px solid ${K.ol}`, borderRadius: 26, padding: '2px 26px 2px 30px', boxShadow: `6px 6px 0 ${K.ol}`, WebkitTextStroke: `5px ${K.ol}`, paintOrder: 'stroke fill'}}>
        {name}
      </div>
    </div>
  );
};

/** Little resource chip: icon glyph in a circle + label. */
export const Chip: React.FC<{icon: string; label: string; col: string; size?: number}> = ({icon, label, col, size = 1}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${size})`}}>
    <div style={{width: 120, height: 120, borderRadius: 60, background: col, border: `7px solid ${K.ol}`, boxShadow: `8px 8px 0 ${K.ol}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F_ROUND, fontWeight: 700, fontSize: 64, color: K.ol}}>
      {icon}
    </div>
    <div style={{marginTop: 12}}>
      <TelopDiv size={44}>{label}</TelopDiv>
    </div>
  </div>
);

/** Shift time for a beat's sub-scene: inside, useCurrentFrame() counts from the beat start, so f0 values are beat-relative. */
export const At: React.FC<{f0: number; children: React.ReactNode}> = ({f0, children}) => (
  <Sequence from={f0} layout="none">
    {children}
  </Sequence>
);
