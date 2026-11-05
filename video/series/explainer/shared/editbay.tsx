// Shared `editbay` look for 讲透 episodes about video generation (first made for kling-origin, 2026-11-05).
// A dark non-linear editor: top bar with a running timecode, a media bin on the left (the episode's chapters),
// the programme monitor in the middle (the scene's main picture), an inspector on the right (the source's numbers)
// and a timeline at the bottom whose tracks draw the mechanism being explained. One orange playhead; teal for
// captions, violet-blue for conditioning, red for rewards, amber for evaluation. Nothing imitates a real product.
//
// Freezedetect: the playhead, the timecode, the monitor scrubber and a slow content sink keep every frame moving.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT_MONO, FONT_NUM, FONT_ZH, THEMES} from '@atv/lib/theme';
import {clamp01, EASE, prog, useScene, useSpring} from '@atv/lib/timing';

// Not flagged `dark`: keeps the default dark subtitle plate, which sits well under the timeline.
THEMES.editbay = {bg: '#0D0E11', bg2: '#0D0E11', accent: '#FF7A3D', accentSoft: '#2A1B14', ink: '#E9EBEF'};

export const EB = {
  bg: '#0D0E11',
  p1: '#15171C',
  p2: '#1B1E24',
  p3: '#22262E',
  line: '#2B2F38',
  hair: 'rgba(255,255,255,0.06)',
  ink: '#E9EBEF',
  dim: '#8C929D',
  faint: '#5A606B',
  vid: '#6F7CFF',
  cap: '#2EC4B6',
  aud: '#46C281',
  red: '#FF5B5B',
  amber: '#F4B740',
  head: '#FF7A3D',
  violet: '#B48CFF',
  screen: '#06070A',
};
export {FONT_MONO, FONT_NUM, FONT_ZH, clamp01, prog, EASE};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const during = (f: number, a: number, b: number, fade = 10) => clamp01(Math.min((f - a) / fade, (b - f) / fade));
export const count = (f: number, from: number, to: number, dur = 24) => lerp(from, to, EASE(clamp01(f / dur)));
export const rise = (f: number, delay = 0, dist = 18): React.CSSProperties => {
  const t = prog(f, 16, delay);
  return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
};
export const usePopIn = () => {
  const sp = useSpring();
  return (f: number, delay = 0, from = 0.86): React.CSSProperties => {
    const s = sp(f, delay, {damping: 18, stiffness: 170});
    return {opacity: clamp01(s * 1.5), transform: `scale(${from + (1 - from) * s})`};
  };
};

// ------------------------------------------------------------------ text
type TxtProps = {children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties};
export const Zh: React.FC<TxtProps> = ({children, size = 28, color = EB.ink, w = 600, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.4, ...style}}>{children}</span>
);
export const Mo: React.FC<TxtProps> = ({children, size = 18, color = EB.dim, w = 500, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, whiteSpace: 'nowrap', ...style}}>{children}</span>
);
export const Lab: React.FC<TxtProps> = ({children, size = 14, color = EB.faint, w = 600, style}) => (
  <span style={{fontFamily: FONT_MONO, fontSize: size, fontWeight: w, color, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
export const Num: React.FC<TxtProps> = ({children, size = 64, color = EB.ink, w = 800, style}) => (
  <span style={{fontFamily: FONT_NUM, fontSize: size, fontWeight: w, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...style}}>{children}</span>
);
export const Illus: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: 15, fontWeight: 700, color: EB.dim, border: `1px solid ${EB.line}`, borderRadius: 4, padding: '0 7px', ...style}}>示意</span>
);

// ------------------------------------------------------------------ chrome
export const CHAPTERS: [string, string, string][] = [
  ['01', '底座 Kling-MLLM', EB.violet],
  ['02', 'Caption', EB.cap],
  ['03', '提示词增强', EB.vid],
  ['04', '文本编码器', EB.vid],
  ['05', '奖励模型', EB.red],
  ['06', '自动评测', EB.amber],
];
const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
export const tc = (frames: number) => `${pad2(frames / 108000)}:${pad2((frames / 1800) % 60)}:${pad2((frames / 30) % 60)}:${pad2(frames % 30)}`;

export const Panel: React.FC<{x: number; y: number; w: number; h: number; title: React.ReactNode; right?: React.ReactNode; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  title,
  right,
  children,
  style,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', background: EB.p1, border: `1px solid ${EB.line}`, borderRadius: 8, overflow: 'hidden', ...style}}>
    <div style={{height: 34, borderBottom: `1px solid ${EB.line}`, background: EB.p2, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10}}>
      <Lab size={13} color={EB.ink}>
        {title}
      </Lab>
      <div style={{flex: 1}} />
      {right}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 34, bottom: 0}}>{children}</div>
  </div>
);

/** Media bin: the episode's chapters, `cur` highlighted (−1 = none). */
export const Bin: React.FC<{cur?: number; f?: number}> = ({cur = -1, f = 99}) => (
  <Panel x={16} y={60} w={300} h={610} title="素材箱" right={<Mo size={13} color={EB.faint}>原文 2611.04916</Mo>}>
    {CHAPTERS.map(([k, name, c], i) => {
      const on = i === cur;
      const t = prog(f, 12, i * 3);
      return (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', height: 62, borderBottom: `1px solid ${EB.hair}`, background: on ? 'rgba(255,122,61,0.12)' : undefined, opacity: 0.3 + 0.7 * t}}>
          <div style={{width: 46, height: 28, borderRadius: 4, background: EB.p3, borderLeft: `4px solid ${c}`}} />
          <Zh size={21} w={on ? 700 : 500} color={on ? EB.ink : EB.dim}>
            {name}
          </Zh>
          <div style={{flex: 1}} />
          <Mo size={13} color={EB.faint}>
            {k}
          </Mo>
        </div>
      );
    })}
    <div style={{padding: '18px 14px'}}>
      <Zh size={16} w={500} color={EB.faint}>
        Kling Team · 2026-11-03 · 38 页
      </Zh>
    </div>
  </Panel>
);

/** Programme monitor. Children are positioned inside the 1074×498 screen. */
export const Monitor: React.FC<{children?: React.ReactNode; x?: number; w?: number; label?: string}> = ({children, x = 332, w = 1112, label = '节目监视器'}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const g = scene.from + frame;
  const total = 7 * 60 * 30;
  const pct = clamp01(g / total);
  return (
    <Panel x={x} y={60} w={w} h={610} title={label} right={<Mo size={13} color={EB.faint}>1920×1080 · 30FPS</Mo>}>
      <div style={{position: 'absolute', left: 18, right: 18, top: 18, height: 498, background: EB.screen, borderRadius: 4, overflow: 'hidden'}}>{children}</div>
      <div style={{position: 'absolute', left: 18, right: 18, bottom: 14, height: 30, display: 'flex', alignItems: 'center', gap: 16}}>
        <Mo size={14}>▶</Mo>
        <Mo size={14}>{tc(g)}</Mo>
        <div style={{flex: 1, height: 4, background: EB.p3, borderRadius: 2, position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: EB.head, borderRadius: 2}} />
        </div>
        <Mo size={14}>FIT</Mo>
      </div>
    </Panel>
  );
};

/** Inspector on the right. */
export const Inspector: React.FC<{title: string; children?: React.ReactNode}> = ({title, children}) => (
  <Panel x={1460} y={60} w={444} h={610} title="检查器" right={<Mo size={13} color={EB.faint}>{title}</Mo>}>
    <div style={{padding: '6px 0'}}>{children}</div>
  </Panel>
);
export const IRow: React.FC<{k: React.ReactNode; v: React.ReactNode; o?: number}> = ({k, v, o = 1}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${EB.hair}`, opacity: o}}>
    <Zh size={18} w={500} color={EB.dim}>
      {k}
    </Zh>
    <div style={{textAlign: 'right'}}>{typeof v === 'string' ? <Zh size={18} w={600}>{v}</Zh> : v}</div>
  </div>
);
export const ISec: React.FC<{children: React.ReactNode; o?: number}> = ({children, o = 1}) => (
  <div style={{padding: '14px 16px 6px', opacity: o}}>
    <Lab size={12}>{children}</Lab>
  </div>
);
/** Labelled bar (inspector numbers). `p` grows the bar; `max` maps value to full width. */
export const IBar: React.FC<{label: React.ReactNode; value: number; text?: string; max: number; min?: number; color?: string; p?: number; hot?: boolean}> = ({
  label,
  value,
  text,
  max,
  min = 0,
  color = EB.faint,
  p = 1,
  hot,
}) => (
  <div style={{padding: '6px 16px', opacity: clamp01(p * 2)}}>
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <Zh size={17} w={hot ? 700 : 500} color={hot ? EB.ink : EB.dim}>
        {label}
      </Zh>
      <Num size={19} w={700} color={hot ? EB.ink : EB.dim}>
        {text ?? value}
      </Num>
    </div>
    <div style={{height: 9, background: EB.p3, borderRadius: 5, marginTop: 5}}>
      <div style={{height: 9, width: `${clamp01((value - min) / (max - min)) * 100 * EASE(clamp01(p))}%`, background: color, borderRadius: 5}} />
    </div>
  </div>
);

// ------------------------------------------------------------------ timeline
export type Clip = {a: number; b: number; label?: React.ReactNode; color: string; f?: number; o?: number; style?: React.CSSProperties; children?: React.ReactNode};
export type Track = {name: string; desc?: string; clips: Clip[]; h?: number};
/**
 * Bottom timeline. Clip a/b are 0..100 (% of the lane). `ph` is the playhead 0..1 (it creeps on its own so the
 * frame never freezes); `marks` label the ruler.
 */
export const Timeline: React.FC<{tracks: Track[]; ph?: number; marks?: string[]; title?: React.ReactNode; x?: number; w?: number}> = ({
  tracks,
  ph,
  marks = [],
  title,
  x = 16,
  w = 1888,
}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const auto = 0.02 + 0.96 * clamp01(frame / Math.max(scene.duration, 1));
  const head = ph ?? auto;
  let y = 60;
  const rows = tracks.map((tr) => {
    const h = tr.h ?? 40;
    const top = y;
    y += h;
    return {tr, h, top};
  });
  return (
    <Panel x={x} y={684} w={w} h={y + 8} title="时间线" right={<Zh size={15} w={500} color={EB.dim}>{title}</Zh>}>
      <div style={{position: 'absolute', left: 150, right: 0, top: 0, height: 26, borderBottom: `1px solid ${EB.line}`}}>
        {marks.map((m, i) => (
          <span key={i} style={{position: 'absolute', top: 6, left: `${(i / Math.max(marks.length - 1, 1)) * 96}%`, fontFamily: FONT_MONO, fontSize: 12, color: EB.faint, whiteSpace: 'nowrap'}}>
            {m}
          </span>
        ))}
      </div>
      {rows.map(({tr, h, top}) => (
        <div key={tr.name} style={{position: 'absolute', left: 0, right: 0, top: top - 34, height: h, borderBottom: `1px solid ${EB.hair}`}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 150, background: EB.p2, borderRight: `1px solid ${EB.line}`, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14}}>
            <Mo size={13} color={EB.ink} w={700}>
              {tr.name}
            </Mo>
            <Zh size={13} w={500} color={EB.dim}>
              {tr.desc}
            </Zh>
          </div>
          <div style={{position: 'absolute', left: 150, right: 0, top: 0, bottom: 0}}>
            {tr.clips.map((c, i) => {
              const t = c.f === undefined ? 1 : prog(c.f, 14);
              if (t <= 0) return null;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 5,
                    bottom: 5,
                    left: `${c.a}%`,
                    width: `${(c.b - c.a) * EASE(t)}%`,
                    boxSizing: 'border-box',
                    borderRadius: 4,
                    background: `color-mix(in srgb, ${c.color} 26%, ${EB.p1})`,
                    border: `1px solid color-mix(in srgb, ${c.color} 70%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    opacity: c.o ?? 1,
                    ...c.style,
                  }}
                >
                  {c.children}
                  {c.label !== undefined && (
                    <Zh size={15} w={500} color={EB.ink}>
                      {c.label}
                    </Zh>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 150, right: 0, top: -34, bottom: 0, pointerEvents: 'none'}}>
        <div style={{position: 'absolute', top: 34, bottom: 0, left: `${clamp01(head) * 100}%`, width: 2, background: EB.head, boxShadow: `0 0 12px ${EB.head}`}}>
          <div style={{position: 'absolute', top: -2, left: -7, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `12px solid ${EB.head}`}} />
        </div>
      </div>
    </Panel>
  );
};

/** Waveform drawn in a clip (deterministic). */
export const Wave: React.FC<{w?: number; color?: string; amp?: number; seed?: number}> = ({w = 1700, color = EB.aud, amp = 1, seed = 0}) => (
  <svg width={w} height={22} style={{position: 'absolute', left: 8, top: 4}}>
    <path
      d={Array.from({length: Math.floor(w / 5)}, (_, i) => {
        const k = i + seed;
        const a = ((Math.sin(k * 1.7) + Math.sin(k * 0.37)) * 2.4 + 3) * Math.abs(Math.sin(k * 0.11)) * amp;
        return `M${i * 5} ${11 - a}V${11 + a}`;
      }).join('')}
      stroke={color}
      strokeWidth={2}
    />
  </svg>
);

/** Page shell for every editbay scene: top bar + running timecode; content enters/exits with a short fade. */
export const Bay: React.FC<{children: React.ReactNode; project?: string}> = ({children, project = '可灵是如何诞生的.proj'}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const g = scene.from + frame;
  const enter = prog(frame, 14);
  const exit = interpolate(frame, [scene.duration - 9, scene.duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const veil = Math.max(1 - enter, exit);
  // Slow push-in + sink over each scene: dark flat panels alone trip freezedetect (n=0.0005 d=0.5) on long holds.
  const t = frame / Math.max(scene.duration, 1);
  const sink = t * 14;
  const push = 1 + 0.016 * t;
  return (
    <AbsoluteFill style={{background: EB.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 46, background: EB.p1, borderBottom: `1px solid ${EB.line}`, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 28}}>
        <div style={{display: 'flex', gap: 8}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 12, height: 12, borderRadius: 6, background: '#3A3F49'}} />
          ))}
        </div>
        <Zh size={17} w={700}>
          {project}
        </Zh>
        {['剪辑', '调色', '审片'].map((m) => (
          <Zh key={m} size={16} w={500} color={EB.dim}>
            {m}
          </Zh>
        ))}
        <div style={{flex: 1}} />
        <div style={{width: 9, height: 9, borderRadius: 5, background: EB.red, opacity: 0.5 + 0.5 * Math.sin(g / 8)}} />
        <Mo size={18} color={EB.head} style={{letterSpacing: 1}}>
          {tc(g)}
        </Mo>
      </div>
      <AbsoluteFill style={{opacity: 1 - veil * 0.9, transform: `translateY(${(1 - enter) * 16 - exit * 16 - sink}px) scale(${push})`, transformOrigin: '50% 45%'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** One-line source note inside the monitor screen (bottom-left). */
export const ScreenSrc: React.FC<{children: React.ReactNode; f?: number; right?: boolean}> = ({children, f = 99, right}) => (
  <div style={{position: 'absolute', [right ? 'right' : 'left']: 22, bottom: 12, opacity: 0.9 * prog(f, 14), whiteSpace: 'nowrap'}}>
    <Mo size={14} color={EB.faint}>
      {children}
    </Mo>
  </div>
);
