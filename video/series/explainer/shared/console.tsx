// Shared `console` look for 讲透 episodes about agent systems / infrastructure (first made for super-agent, 2026-10-31).
// A dark IDE / ops console: near-black page with a faint drifting grid, a tab strip with the scene's "file" and a
// live status readout, a line-number gutter, monospace comment kickers, and diagrams drawn as bordered nodes with
// glowing edges and packets travelling along the wires. One accent blue for "the system", green / amber / red for
// states. Nothing here imitates a real product UI.
//
// Freezedetect: every scene keeps the whole picture moving (grid drift, a slow light sweep, the gutter scroll and
// the content sinking a few pixels), so long beats never read as frozen frames (ffmpeg n=0.0005 d=0.5).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_NUM, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene, useSpring} from '@atv/lib/timing';

// Not flagged `dark`: the engine would sprinkle night stars and switch to a white subtitle box. The default dark
// subtitle box sits well on this page.
THEMES.console = {bg: '#0B0E14', bg2: '#0B0E14', accent: '#5B7CFF', accentSoft: '#1A2340', ink: '#E6EAF2'};

export const V = {
  bg: '#0B0E14',
  panel: '#121722',
  panel2: '#182031',
  line: '#2A3447',
  hair: 'rgba(150,170,210,0.16)',
  ink: '#E6EAF2',
  dim: '#8E98AD',
  faint: '#5D6880',
  blue: '#5B7CFF',
  blueSoft: 'rgba(91,124,255,0.16)',
  cyan: '#3DD6D0',
  green: '#3FB950',
  amber: '#E3B341',
  red: '#F2555A',
  violet: '#A78BFA',
  comment: '#6A9955',
};

export {FONT_MONO, FONT_NUM, FONT_ZH, clamp01, prog, EASE};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ text
type TxtProps = {children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties};
export const Zh: React.FC<TxtProps> = ({children, size = 30, color = V.ink, w = 600, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.35, ...style}}>{children}</span>
);
export const Mo: React.FC<TxtProps> = ({children, size = 24, color = V.ink, w = 500, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, whiteSpace: 'nowrap', ...style}}>{children}</span>
);
export const Lab: React.FC<TxtProps> = ({children, size = 17, color = V.dim, w = 600, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
export const Num: React.FC<TxtProps> = ({children, size = 96, color = V.ink, w = 800, style}) => (
  <span style={{fontFamily: FONT_NUM, fontSize: size, fontWeight: w, color, lineHeight: 1, letterSpacing: -2, fontVariantNumeric: 'tabular-nums', ...style}}>{children}</span>
);

// ------------------------------------------------------------------ motion
export const rise = (f: number, delay = 0, dist = 20): React.CSSProperties => {
  const t = prog(f, 16, delay);
  return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
};
export const usePopIn = () => {
  const sp = useSpring();
  return (f: number, delay = 0, from = 0.88): React.CSSProperties => {
    const s = sp(f, delay, {damping: 18, stiffness: 170});
    return {opacity: clamp01(s * 1.5), transform: `scale(${from + (1 - from) * s})`};
  };
};
/** 0..1 while f is in [a, b) with short fades. */
export const during = (f: number, a: number, b: number, fade = 10) => clamp01(Math.min((f - a) / fade, (b - f) / fade));
/** Number counting up from `from` to `to` over `dur` frames after f >= 0. */
export const count = (f: number, from: number, to: number, dur = 24) => lerp(from, to, EASE(clamp01(f / dur)));

// ------------------------------------------------------------------ shell
const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');

/**
 * Every scene: dark page, drifting grid, a light sweep, the IDE tab strip (file name + live status) and the gutter.
 * Content slides up on enter / exit like scrolling a file.
 */
export const Shell: React.FC<{children: React.ReactNode; file?: string; status?: string; gutter?: boolean}> = ({
  children,
  file = 'super-agent.md',
  status = 'router · online',
  gutter = true,
}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const g = scene.from + frame; // global frame, for clocks that keep running across scenes
  const enter = prog(frame, 18);
  const exit = interpolate(frame, [scene.duration - 10, scene.duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});
  const veil = Math.max(1 - enter, exit);
  const sink = (frame / Math.max(scene.duration, 1)) * 10;
  const dy = (1 - enter) * 34 - exit * 34 - sink;
  const grid = g * 0.4;
  const sweep = ((g * 1.6) % 2600) - 500;
  const secs = g / 30;
  return (
    <AbsoluteFill style={{background: V.bg, overflow: 'hidden'}}>
      {/* grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(120,140,190,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,190,0.07) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          backgroundPosition: `${grid}px ${grid * 0.6}px`,
        }}
      />
      {/* slow light sweep + vignette */}
      <div style={{position: 'absolute', top: -200, bottom: -200, left: sweep, width: 520, background: 'linear-gradient(90deg, transparent, rgba(91,124,255,0.07), transparent)', transform: 'skewX(-14deg)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 1300px 820px at 50% 46%, transparent 55%, rgba(0,0,0,0.55))'}} />
      {/* tab strip */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 44, background: '#0E121A', borderBottom: `1px solid ${V.line}`, display: 'flex', alignItems: 'stretch'}}>
        <div style={{width: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${V.line}`}}>
          <div style={{width: 14, height: 14, borderRadius: 3, background: V.blue, boxShadow: `0 0 10px ${V.blue}`}} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', background: V.bg, borderRight: `1px solid ${V.line}`, borderTop: `2px solid ${V.blue}`}}>
          <Mo size={17} color={V.ink}>
            {file}
          </Mo>
          <Mo size={15} color={V.faint}>
            ×
          </Mo>
        </div>
        <div style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 22, paddingRight: 30}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
            <div style={{width: 9, height: 9, borderRadius: 5, background: V.green, opacity: 0.55 + 0.45 * Math.sin(g / 9)}} />
            <Mo size={16} color={V.dim}>
              {status}
            </Mo>
          </div>
          <Mo size={16} color={V.faint}>
            uptime {pad2(secs / 3600)}:{pad2((secs / 60) % 60)}:{pad2(secs % 60)}
          </Mo>
        </div>
      </div>
      {/* gutter */}
      {gutter && (
        <div style={{position: 'absolute', left: 0, top: 44, bottom: 0, width: 64, borderRight: `1px solid rgba(42,52,71,0.6)`, overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 18 - ((g * 0.5) % 36), left: 0, right: 12, textAlign: 'right'}}>
            {Array.from({length: 34}, (_, i) => (
              <div key={i} style={{fontFamily: FONT_MONO, fontSize: 15, lineHeight: '36px', color: 'rgba(93,104,128,0.55)'}}>
                {Math.floor((g * 0.5) / 36) + i + 1}
              </div>
            ))}
          </div>
        </div>
      )}
      <AbsoluteFill style={{opacity: 1 - veil * 0.92, transform: `translateY(${dy}px)`, filter: veil > 0.05 ? `blur(${veil * 5}px)` : undefined}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Scene header: `// kicker` comment line + big title (+ dim sub) + hairline. */
export const Head: React.FC<{kicker: string; title: React.ReactNode; sub?: React.ReactNode; f?: number}> = ({kicker, title, sub, f}) => {
  const frame = useCurrentFrame();
  const g = f ?? frame;
  const t = prog(g, 16, 4);
  return (
    <>
      <div style={{position: 'absolute', left: 120, top: 76}}>
        <div style={{opacity: prog(g, 12)}}>
          <Mo size={21} color={V.comment} w={500}>
            {'// '}
            {kicker}
          </Mo>
        </div>
        <div style={{opacity: t, transform: `translateY(${(1 - t) * 14}px)`, marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 26, whiteSpace: 'nowrap'}}>
          <Zh size={56} w={800} style={{letterSpacing: 1}}>
            {title}
          </Zh>
          {sub && (
            <Zh size={26} w={500} color={V.dim}>
              {sub}
            </Zh>
          )}
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, right: 96, top: 196, height: 1, background: V.hair, transform: `scaleX(${prog(g, 24, 6)})`, transformOrigin: 'left'}} />
    </>
  );
};

/** One-line source note above the subtitle band. Pass the beat frame `f` (defaults to visible). */
export const SrcLine: React.FC<{children: React.ReactNode; f?: number; left?: number}> = ({children, f = 999, left = 120}) => (
  <div style={{position: 'absolute', left, bottom: 152, opacity: 0.95 * prog(f, 14), whiteSpace: 'nowrap'}}>
    <span style={{fontFamily: FONT_MONO, fontSize: 17, color: V.faint}}>{'# '}</span>
    <span style={{fontFamily: FONT_ZH, fontSize: 19, fontWeight: 500, color: V.faint}}>{children}</span>
  </div>
);

export const Illus: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: 16, fontWeight: 700, color: V.dim, border: `1px solid ${V.line}`, borderRadius: 5, padding: '1px 8px', ...style}}>示意</span>
);

// ------------------------------------------------------------------ diagram pieces
type NodeProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  title?: React.ReactNode;
  sub?: React.ReactNode;
  color?: string; // border / glow colour
  glow?: number; // 0..1 highlight
  dashed?: boolean;
  o?: number;
  children?: React.ReactNode;
  titleSize?: number;
  style?: React.CSSProperties;
};
/** Bordered diagram node (the article's boxes, on a dark panel). */
export const Node: React.FC<NodeProps> = ({x, y, w, h, title, sub, color = V.line, glow = 0, dashed, o = 1, children, titleSize = 28, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      background: glow > 0 ? `linear-gradient(180deg, rgba(91,124,255,${0.1 + 0.12 * glow}), ${V.panel})` : V.panel,
      border: `${dashed ? 2 : 1.5}px ${dashed ? 'dashed' : 'solid'} ${glow > 0 ? color : V.line}`,
      borderRadius: 12,
      boxShadow: glow > 0 ? `0 0 ${28 * glow}px ${color}55, inset 0 0 0 1px ${color}${Math.round(40 * glow).toString(16).padStart(2, '0')}` : '0 8px 24px rgba(0,0,0,0.35)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 6,
      opacity: o,
      ...style,
    }}
  >
    {title && (
      <Zh size={titleSize} w={700} color={glow > 0.5 ? '#FFFFFF' : V.ink}>
        {title}
      </Zh>
    )}
    {sub && (
      <Zh size={Math.round(titleSize * 0.7)} w={500} color={glow > 0.5 ? '#B9C6FF' : V.dim}>
        {sub}
      </Zh>
    )}
    {children}
  </div>
);

export const pointAt = (pts: [number, number][], t: number): [number, number] => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (left <= segs[i] || i === segs.length - 1) {
      const k = segs[i] === 0 ? 0 : Math.min(1, left / segs[i]);
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    left -= segs[i];
  }
  return pts[pts.length - 1];
};

/** Connector drawn as it grows (p 0..1); optional arrowhead and dashes. */
export const Wire: React.FC<{pts: [number, number][]; p?: number; color?: string; width?: number; arrow?: boolean; dash?: boolean; o?: number}> = ({
  pts,
  p = 1,
  color = '#4A5672',
  width = 2,
  arrow = true,
  dash = false,
  o = 1,
}) => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const d = 'M ' + pts.map((q) => `${q[0]} ${q[1]}`).join(' L ');
  const pc = clamp01(p);
  const end = pointAt(pts, pc);
  const prev = pointAt(pts, clamp01(pc - 0.001 - 6 / Math.max(total, 1)));
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  if (pc <= 0) return null;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', opacity: o}} width={1} height={1}>
      {dash ? (
        <path d={d} stroke={color} strokeWidth={width} fill="none" strokeDasharray="8 7" opacity={clamp01(pc * 3)} />
      ) : (
        <path d={d} stroke={color} strokeWidth={width} fill="none" strokeDasharray={`${total} ${total}`} strokeDashoffset={total * (1 - pc)} />
      )}
      {arrow && pc > 0.02 && (
        <path d="M -10 -6 L 0 0 L -10 6" stroke={color} strokeWidth={width} fill="none" transform={`translate(${end[0]} ${end[1]}) rotate(${(ang * 180) / Math.PI})`} />
      )}
    </svg>
  );
};

/** Glowing square travelling along a path (t 0..1). */
export const Packet: React.FC<{pts: [number, number][]; t: number; size?: number; color?: string}> = ({pts, t, size = 14, color = V.blue}) => {
  if (t <= 0 || t >= 1) return null;
  const [x, y] = pointAt(pts, EASE(clamp01(t)));
  return <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: 3, background: color, boxShadow: `0 0 14px ${color}`}} />;
};
/** Looping packet: travels the path every `period` frames, starting at frame `f` >= 0. */
export const LoopPacket: React.FC<{pts: [number, number][]; f: number; period?: number; offset?: number; size?: number; color?: string}> = ({
  pts,
  f,
  period = 60,
  offset = 0,
  size,
  color,
}) => (f < 0 ? null : <Packet pts={pts} t={((f + offset) % period) / period} size={size} color={color} />);

/** IDE / terminal window with a title bar. Coordinates absolute when x/y given. */
export const Win: React.FC<{
  x?: number;
  y?: number;
  w: number;
  h: number;
  title?: React.ReactNode;
  tag?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
  bodyStyle?: React.CSSProperties;
}> = ({x, y, w, h, title, tag, children, style, accent = V.line, bodyStyle}) => (
  <div
    style={{
      position: x === undefined ? 'relative' : 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      background: V.panel,
      border: `1.5px solid ${accent}`,
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}
  >
    <div style={{height: 42, flex: 'none', display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', background: '#0F141E', borderBottom: `1px solid ${V.line}`}}>
      {['#F2555A', '#E3B341', '#3FB950'].map((c) => (
        <div key={c} style={{width: 11, height: 11, borderRadius: 6, background: c, opacity: 0.8}} />
      ))}
      <div style={{marginLeft: 10, flex: 1, overflow: 'hidden'}}>
        <Mo size={16} color={V.dim}>
          {title}
        </Mo>
      </div>
      {tag}
    </div>
    <div style={{flex: 1, position: 'relative', padding: '16px 20px', boxSizing: 'border-box', ...bodyStyle}}>{children}</div>
  </div>
);

/** Small rounded chip (channel tags, states). */
export const Chip: React.FC<{children: React.ReactNode; color?: string; solid?: boolean; size?: number; style?: React.CSSProperties}> = ({
  children,
  color = V.dim,
  solid,
  size = 17,
  style,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: FONT_MONO,
      fontSize: size,
      fontWeight: 600,
      color: solid ? '#0B0E14' : color,
      background: solid ? color : 'transparent',
      border: `1.5px solid ${color}`,
      borderRadius: 999,
      padding: '2px 12px',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

/** A chat / thread row: channel chip, author, bubble. `agent` rows are tinted blue like the article's figures. */
export const ChatRow: React.FC<{
  ch?: React.ReactNode;
  who: string;
  text: React.ReactNode;
  agent?: boolean;
  muted?: boolean;
  style?: React.CSSProperties;
  size?: number;
  whoW?: number;
}> = ({ch, who, text, agent, muted, style, size = 24, whoW = 150}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, ...style}}>
    {ch !== undefined && <div style={{width: 104, flex: 'none', display: 'flex'}}>{ch}</div>}
    <div style={{width: whoW, flex: 'none'}}>
      <Zh size={21} w={700} color={agent ? V.blue : V.dim}>
        {who}
      </Zh>
    </div>
    <div
      style={{
        flex: 1,
        padding: '11px 18px',
        borderRadius: 10,
        background: agent ? V.blueSoft : muted ? 'transparent' : V.panel2,
        border: `1.5px ${muted ? 'dashed' : 'solid'} ${agent ? 'rgba(91,124,255,0.55)' : V.line}`,
      }}
    >
      <Zh size={size} w={500} color={muted ? V.dim : V.ink}>
        {text}
      </Zh>
    </div>
  </div>
);

/** Monospace log line: time, tag, text. */
export const LogLine: React.FC<{t: string; tag: string; color?: string; children: React.ReactNode; style?: React.CSSProperties; size?: number}> = ({
  t,
  tag,
  color = V.blue,
  children,
  style,
  size = 21,
}) => (
  <div style={{display: 'flex', alignItems: 'baseline', gap: 14, whiteSpace: 'nowrap', ...style}}>
    <Mo size={size - 2} color={V.faint}>
      {t}
    </Mo>
    <Mo size={size - 1} color={color} w={700}>
      {tag}
    </Mo>
    <span style={{fontFamily: FONT_ZH, fontSize: size, color: V.ink, fontWeight: 500}}>{children}</span>
  </div>
);

/** Inline code span. */
export const Code: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 22, color = V.cyan}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, color, background: 'rgba(61,214,208,0.10)', borderRadius: 5, padding: '0 6px'}}>{children}</span>
);

/** Blinking block cursor. */
export const Caret: React.FC<{h?: number; color?: string}> = ({h = 26, color = V.ink}) => {
  const frame = useCurrentFrame();
  return <span style={{display: 'inline-block', width: h * 0.5, height: h, background: color, opacity: Math.floor(frame / 15) % 2 ? 0 : 0.9, verticalAlign: 'middle', marginLeft: 4}} />;
};

/** Number of characters of `text` typed `f` frames after start at `cps` chars per second. */
export const typedN = (f: number, text: string, cps = 30) => Math.max(0, Math.min(text.length, Math.floor((f / 30) * cps)));

/** Chapter card: big module number, title, a typed command line. */
export const Chapter: React.FC<{num: string; title: string; sub?: string; cmd?: string}> = ({num, title, sub, cmd}) => {
  const frame = useCurrentFrame();
  const c = cmd ?? `superagent --module ${num}`;
  const n = typedN(frame - 4, c, 40);
  const t = prog(frame, 18, 6);
  return (
    <Shell file={`${num}_${title}.md`}>
      <div style={{position: 'absolute', left: 220, top: 300}}>
        <Mo size={26} color={V.comment}>
          {'$ '}
          {c.slice(0, n)}
          <Caret h={26} color={V.comment} />
        </Mo>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 40, marginTop: 34, opacity: t, transform: `translateX(${(1 - t) * -30}px)`}}>
          <Num size={200} color={V.blue} style={{textShadow: `0 0 40px rgba(91,124,255,0.45)`}}>
            {num}
          </Num>
          <div>
            <Zh size={84} w={800}>
              {title}
            </Zh>
            {sub && (
              <div style={{marginTop: 8}}>
                <Zh size={34} w={500} color={V.dim}>
                  {sub}
                </Zh>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
};
