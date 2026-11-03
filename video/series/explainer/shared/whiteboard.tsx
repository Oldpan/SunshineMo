// Shared `whiteboard` look for 讲透 episodes (first made for claude-code-diet, 2026-11):
// grid paper, black marker strokes drawn in with rough.js (seeded, so every frame matches), LXGW WenKai handwriting,
// a peach highlighter, red-pen notes and dark "terminal" cards with a hard offset shadow.
// Motion rules: the grid creeps and the content sinks a few pixels over every scene (no frozen frames), and every
// box / arrow is *drawn* in with `p` (0..1) instead of fading.
import React, {useMemo} from 'react';
import rough from 'roughjs';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, typed, useScene, useSpring} from '@atv/lib/timing';

THEMES.whiteboard = {bg: '#FBF8F1', bg2: '#FBF8F1', accent: '#D9774F', accentSoft: '#F7D5C2', ink: '#2B2A27'};

export const W = {
  paper: '#FBF8F1',
  grid: '#ECE5D6',
  ink: '#2B2A27',
  dim: '#6B665C',
  faint: '#9C968A',
  clay: '#D9774F',
  peach: '#F7C9A6',
  yellow: '#FBE38E',
  red: '#C4553A',
  green: '#3E7D4F',
  blue: '#3C6FB0',
  term: '#2B2A27',
  termInk: '#EDE8DE',
  card: '#FFFFFF',
};

export const FONT_HANDW = '"LXGW WenKai", "Xiaolai", "Noto Sans CJK SC", sans-serif';
export {FONT_MONO, FONT_ZH, clamp01, prog, typed};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ rough.js
const gen = rough.generator();
type RO = {stroke?: string; sw?: number; fill?: string; fillStyle?: string; seed?: number; rough?: number; bowing?: number; gap?: number};
const ro = ({stroke = W.ink, sw = 3.6, fill, fillStyle = 'hachure', seed = 1, rough: r = 1.1, bowing = 1, gap = 10}: RO) => ({
  stroke,
  strokeWidth: sw,
  fill,
  fillStyle,
  fillWeight: 2.2,
  hachureGap: gap,
  hachureAngle: -40,
  seed,
  roughness: r,
  bowing,
  disableMultiStroke: true,
  preserveVertices: true,
});

const Paths: React.FC<{ds: any[]; p?: number}> = ({ds, p = 1}) => (
  <g>
    {ds.flatMap((d, i) =>
      gen.toPaths(d).map((path, j) => (
        <path
          key={`${i}-${j}`}
          d={path.d}
          stroke={path.stroke === 'none' ? undefined : path.stroke}
          strokeWidth={path.strokeWidth}
          fill={path.fill ?? 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={p < 1 ? 1 : undefined}
          strokeDashoffset={p < 1 ? 1 - clamp01(p) : undefined}
          opacity={p <= 0 ? 0 : 1}
        />
      )),
    )}
  </g>
);

/** Free canvas (absolute at x,y): `draw` returns rough.js drawables; `p` draws the strokes in. */
export const Sk: React.FC<{x?: number; y?: number; w: number; h: number; draw: (g: typeof gen) => any[]; p?: number; deps?: any[]; style?: React.CSSProperties}> = ({
  x = 0,
  y = 0,
  w,
  h,
  draw,
  p = 1,
  deps = [],
  style,
}) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ds = useMemo(() => draw(gen), [w, h, ...deps]);
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, overflow: 'visible', pointerEvents: 'none', ...style}}>
      <Paths ds={ds} p={p} />
    </svg>
  );
};
export const roughOpts = ro;

/**
 * A hand-drawn box at (x, y): marker outline drawn in by `p`, contents fade in once the outline is mostly there.
 * `shadow` adds the hard offset shadow of the style frame. `dark` makes it a terminal card.
 */
export const Box: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p?: number;
  seed?: number;
  bg?: string;
  stroke?: string;
  sw?: number;
  dash?: boolean;
  shadow?: boolean;
  pad?: number | string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, w, h, p = 1, seed = 1, bg = W.card, stroke = W.ink, sw = 3.6, dash = false, shadow = true, pad = '22px 28px', children, style}) => {
  const fillIn = clamp01((p - 0.35) / 0.4);
  const content = clamp01((p - 0.55) / 0.4);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>
      {shadow && <div style={{position: 'absolute', left: 9, top: 9, width: w, height: h, background: W.ink, borderRadius: 14, opacity: fillIn * (bg === 'transparent' ? 0 : 1)}} />}
      <div style={{position: 'absolute', inset: 0, background: bg, borderRadius: 14, opacity: fillIn}} />
      <Sk
        w={w}
        h={h}
        p={p}
        deps={[seed, stroke, dash, sw]}
        draw={(g) => [g.rectangle(2, 2, w - 4, h - 4, {...ro({stroke, seed, sw}), strokeLineDash: dash ? [14, 12] : undefined})]}
      />
      <div style={{position: 'absolute', inset: 0, padding: pad, opacity: content, boxSizing: 'border-box'}}>{children}</div>
    </div>
  );
};

/** Marker arrow through `pts` (absolute coords inside an Sk-sized parent at 0,0), with a head at the end. */
export const Arrow: React.FC<{pts: [number, number][]; p?: number; color?: string; sw?: number; seed?: number; dash?: boolean; head?: boolean}> = ({
  pts,
  p = 1,
  color = W.ink,
  sw = 4,
  seed = 3,
  dash = false,
  head = true,
}) => {
  const [ax, ay] = pts[pts.length - 2];
  const [bx, by] = pts[pts.length - 1];
  const ang = Math.atan2(by - ay, bx - ax);
  const hl = 22;
  const h1: [number, number] = [bx - hl * Math.cos(ang - 0.45), by - hl * Math.sin(ang - 0.45)];
  const h2: [number, number] = [bx - hl * Math.cos(ang + 0.45), by - hl * Math.sin(ang + 0.45)];
  const body = clamp01(p / 0.85);
  const hp = clamp01((p - 0.85) / 0.15);
  return (
    <>
      <Sk
        w={1}
        h={1}
        p={body}
        deps={[JSON.stringify(pts), color, dash]}
        draw={(g) => [
          pts.length > 2 ? g.curve(pts, {...ro({stroke: color, sw, seed}), strokeLineDash: dash ? [16, 14] : undefined}) : g.line(pts[0][0], pts[0][1], bx, by, {...ro({stroke: color, sw, seed}), strokeLineDash: dash ? [16, 14] : undefined}),
        ]}
      />
      {head && <Sk w={1} h={1} p={hp} deps={[JSON.stringify(pts), color]} draw={(g) => [g.linearPath([h1, [bx, by], h2], ro({stroke: color, sw, seed: seed + 1}))]} />}
    </>
  );
};

// ------------------------------------------------------------------ text
type TP = {children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties};
/** Handwriting (LXGW WenKai). */
export const Hd: React.FC<TP> = ({children, size = 34, color = W.ink, w = 700, style}) => (
  <span style={{fontFamily: FONT_HANDW, fontSize: size, fontWeight: w, color, lineHeight: 1.35, ...style}}>{children}</span>
);
/** Plain Chinese sans for dense labels. */
export const Zh: React.FC<TP> = ({children, size = 28, color = W.ink, w = 500, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.4, ...style}}>{children}</span>
);
export const Mo: React.FC<TP> = ({children, size = 24, color = W.ink, w = 500, style}) => (
  <span style={{fontFamily: `${FONT_MONO}, "Noto Sans Mono CJK SC"`, fontSize: size, fontWeight: w, color, whiteSpace: 'pre', ...style}}>{children}</span>
);

/** Highlighter stroke behind text, swept left→right by p. */
export const HL: React.FC<{p: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({p, color = W.peach, children, style}) => (
  <span
    style={{
      backgroundImage: `linear-gradient(transparent 52%, ${color} 52%, ${color} 92%, transparent 92%)`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${clamp01(p) * 100}% 100%`,
      padding: '0 4px',
      ...style,
    }}
  >
    {children}
  </span>
);

/** Red marker strike-through over an inline-block of width w. */
export const Strike: React.FC<{p: number; w: number; color?: string; seed?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, w, color = W.red, seed = 9, children, style}) => (
  <span style={{position: 'relative', display: 'inline-block', ...style}}>
    <span style={{opacity: 1 - 0.45 * clamp01(p)}}>{children}</span>
    <Sk x={-6} y={0} w={w + 12} h={1} p={p} deps={[w, seed]} draw={(g) => [g.line(0, 26, w + 12, 18, ro({stroke: color, sw: 5, seed}))]} />
  </span>
);

/** Red-pen margin note, slightly rotated, written in by p. */
export const Note: React.FC<{x: number; y: number; p: number; rot?: number; size?: number; color?: string; children: React.ReactNode; w?: number}> = ({
  x,
  y,
  p,
  rot = -3,
  size = 30,
  color = W.red,
  children,
  w,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      transform: `rotate(${rot}deg)`,
      clipPath: `inset(-20px ${(1 - clamp01(p)) * 100}% -20px -20px)`,
    }}
  >
    <Hd size={size} color={color} w={700}>
      {children}
    </Hd>
  </div>
);

/** Rough check / cross marks drawn in by p (size s, absolute at x,y). */
export const Tick: React.FC<{x: number; y: number; p: number; s?: number; color?: string}> = ({x, y, p, s = 40, color = W.green}) => (
  <Sk x={x} y={y} w={s} h={s} p={p} deps={[s, color]} draw={(g) => [g.linearPath([[0, s * 0.55], [s * 0.38, s * 0.92], [s, s * 0.05]], ro({stroke: color, sw: 6, seed: 4}))]} />
);
export const Cross: React.FC<{x: number; y: number; p: number; s?: number; color?: string}> = ({x, y, p, s = 40, color = W.red}) => (
  <Sk
    x={x}
    y={y}
    w={s}
    h={s}
    p={p}
    deps={[s, color]}
    draw={(g) => [g.line(0, 0, s, s, ro({stroke: color, sw: 6, seed: 5})), g.line(s, 0, 0, s, ro({stroke: color, sw: 6, seed: 6}))]}
  />
);
/** Rough ellipse "circled it" around a w×h region. */
export const Circled: React.FC<{x: number; y: number; w: number; h: number; p: number; color?: string; seed?: number}> = ({x, y, w, h, p, color = W.red, seed = 7}) => (
  <Sk x={x} y={y} w={w} h={h} p={p} deps={[w, h, color, seed]} draw={(g) => [g.ellipse(w / 2, h / 2, w, h, ro({stroke: color, sw: 4.5, seed, rough: 1.4}))]} />
);

// ------------------------------------------------------------------ motion
export const usePopIn = () => {
  const sp = useSpring();
  return (f: number, delay = 0, from = 0.85): React.CSSProperties => {
    const s = sp(f, delay, {damping: 16, stiffness: 170});
    return {opacity: clamp01(s * 1.6), transform: `scale(${from + (1 - from) * s})`};
  };
};
export const rise = (f: number, delay = 0, dist = 22): React.CSSProperties => {
  const t = prog(f, 16, delay);
  return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
};
export const during = (f: number, a: number, b: number, fade = 10) => clamp01(Math.min((f - a) / fade, (b - f) / fade));

/** Terminal lines typed one after another. `lines[i] = [text, startFrame, color?]`. */
export const TypeLine: React.FC<{text: string; f: number; cps?: number; color?: string; size?: number; caret?: boolean}> = ({text, f, cps = 40, color = W.termInk, size = 24, caret = false}) => {
  const frame = useCurrentFrame();
  const n = f < 0 ? 0 : typed(f, text, cps);
  const shown = text.slice(0, n);
  const on = caret && n < text.length + 1 && Math.floor(frame / 15) % 2 === 0;
  return (
    <div style={{minHeight: size * 1.6, opacity: f < 0 ? 0 : 1}}>
      <Mo size={size} color={color}>
        {shown}
      </Mo>
      {on && <span style={{display: 'inline-block', width: size * 0.55, height: size * 1.1, background: W.clay, verticalAlign: 'middle', marginLeft: 2}} />}
    </div>
  );
};

// ------------------------------------------------------------------ shell
/** Section tag at top-left: "2.1" chip + handwritten title with a highlighter swept in. */
export const Head: React.FC<{num?: string; title: string; f?: number}> = ({num, title, f}) => {
  const frame = useCurrentFrame();
  const t = f ?? frame;
  return (
    <div style={{position: 'absolute', left: 86, top: 54, display: 'flex', alignItems: 'center', gap: 18, ...rise(t, 0)}}>
      {num && (
        <span style={{background: W.ink, color: W.paper, fontFamily: FONT_HANDW, fontWeight: 700, fontSize: 32, borderRadius: 10, padding: '2px 16px'}}>{num}</span>
      )}
      <Hd size={48}>
        <HL p={prog(t, 24, 8)}>{title}</HL>
      </Hd>
    </div>
  );
};

/** "示意" stamp for illustrative content. */
export const Illus: React.FC<{x: number; y: number; text?: string}> = ({x, y, text = '示意'}) => (
  <div style={{position: 'absolute', left: x, top: y, border: `3px solid ${W.red}`, color: W.red, borderRadius: 8, padding: '0 10px', fontFamily: FONT_HANDW, fontSize: 24, fontWeight: 700, transform: 'rotate(-6deg)', opacity: 0.85}}>
    {text}
  </div>
);

/** Small source line above the subtitle area. */
export const Src: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 90, bottom: 184, opacity: 0.85 * prog(frame, 20, 10)}}>
      <Zh size={20} color={W.faint} w={500}>
        {children}
      </Zh>
    </div>
  );
};

/**
 * Every scene: grid paper that creeps, content that slides up in and out (like flipping to the next board) and sinks
 * ~10 px over the scene so no stretch is a frozen frame.
 */
export const Board: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const enter = prog(frame, 18);
  const exit = interpolate(frame, [scene.duration - 10, scene.duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});
  const sink = (frame / Math.max(scene.duration, 1)) * 10;
  const dx = (1 - enter) * 60 - exit * 60;
  const g = frame * 0.3;
  return (
    <AbsoluteFill style={{background: W.paper}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${W.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${W.grid} 1.5px, transparent 1.5px)`,
          backgroundSize: '48px 48px',
          backgroundPosition: `${g}px ${g * 0.4}px`,
        }}
      />
      <AbsoluteFill style={{opacity: 1 - Math.max(1 - enter, exit) * 0.95, transform: `translate(${dx}px, ${-sink}px)`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
