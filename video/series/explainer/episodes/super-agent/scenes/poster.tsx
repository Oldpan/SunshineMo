// Covers (16:9 and 3:4). Two variants: A = the article's core observation (3–5 active sessions per person),
// B = the ablation result (P95 15.7 vs 29.5 minutes). Switch VARIANT and re-run covers.mjs to render the other one.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DeepSeekWhale, FONT_MONO, FONT_ZH, V} from './common';

export const VARIANT: 'A' | 'B' = 'A';

const Bg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: V.bg, overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(rgba(120,140,190,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,190,0.08) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(91,124,255,0.22), transparent 70%)'}} />
    {children}
  </AbsoluteFill>
);

const Tiles: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    {Array.from({length: 8}, (_, i) => {
      const c = i >= 5 ? V.red : i >= 3 ? V.amber : V.green;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: (i % 3) * 200 * s,
            top: Math.floor(i / 3) * 140 * s,
            width: 180 * s,
            height: 120 * s,
            borderRadius: 12 * s,
            border: `${3 * s}px solid ${c}`,
            background: V.panel,
            opacity: i >= 5 ? 0.55 : 1,
            boxSizing: 'border-box',
            padding: 14 * s,
          }}
        >
          <div style={{display: 'flex', gap: 6 * s}}>
            {['#F2555A', '#E3B341', '#3FB950'].map((k) => (
              <div key={k} style={{width: 10 * s, height: 10 * s, borderRadius: 6 * s, background: k, opacity: 0.8}} />
            ))}
          </div>
          <div style={{fontFamily: FONT_MONO, fontSize: 18 * s, color: c, marginTop: 14 * s}}>session-{i + 1}</div>
        </div>
      );
    })}
  </div>
);

const Kicker: React.FC<{s: number}> = ({s}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16 * s}}>
    <DeepSeekWhale size={70 * s} bob={false} />
    <span style={{fontFamily: FONT_MONO, fontSize: 30 * s, color: V.comment}}>{'// DeepSeek Harness 团队 · 架构探讨'}</span>
  </div>
);

const Title: React.FC<{s: number}> = ({s}) => (
  <div>
    <div style={{fontFamily: '"Montserrat", sans-serif', fontSize: 110 * s, fontWeight: 800, color: '#fff', letterSpacing: -3 * s, textShadow: `0 0 40px rgba(91,124,255,0.6)`, lineHeight: 1}}>Super-agent</div>
    <div style={{fontFamily: FONT_ZH, fontSize: 62 * s, fontWeight: 800, color: V.blue, marginTop: 14 * s}}>架构全拆解</div>
  </div>
);

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  const tall = h > w;
  const s = tall ? 1 : 1;
  if (VARIANT === 'A') {
    return (
      <Bg>
        <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 90 : 90}}>
          <Kicker s={s} />
          <div style={{marginTop: 50, fontFamily: FONT_ZH, fontSize: tall ? 96 : 92, fontWeight: 900, color: V.ink, lineHeight: 1.1}}>一个人最多盯</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 6}}>
            <span style={{fontFamily: '"Montserrat", sans-serif', fontSize: tall ? 300 : 260, fontWeight: 800, color: V.amber, lineHeight: 0.95, textShadow: '0 0 50px rgba(227,179,65,0.45)'}}>5</span>
            <span style={{fontFamily: FONT_ZH, fontSize: tall ? 96 : 92, fontWeight: 900, color: V.ink}}>个 Session</span>
          </div>
        </div>
        <Tiles x={tall ? 160 : 1060} y={tall ? 600 : 230} s={tall ? 1.15 : 1.35} />
        <div style={{position: 'absolute', left: tall ? 80 : 110, bottom: tall ? 80 : 90}}>
          <Title s={tall ? 1.1 : 1} />
        </div>
      </Bg>
    );
  }
  // B: ablation result
  const bars: [string, number, string][] = [
    ['Super-agent', 15.7, V.blue],
    ['单 Session + Subagent（中性提示）', 29.5, V.red],
  ];
  const bw = tall ? 28 : 30;
  return (
    <Bg>
      <div style={{position: 'absolute', left: tall ? 80 : 110, top: 90}}>
        <Kicker s={s} />
        <div style={{marginTop: 46, fontFamily: FONT_ZH, fontSize: tall ? 100 : 96, fontWeight: 900, color: V.ink, lineHeight: 1.15}}>把 Session</div>
        <div style={{fontFamily: FONT_ZH, fontSize: tall ? 100 : 96, fontWeight: 900, color: V.amber, lineHeight: 1.15}}>藏进系统里</div>
      </div>
      <div style={{position: 'absolute', left: tall ? 80 : 1050, top: tall ? 640 : 250, width: tall ? 920 : 780}}>
        <div style={{fontFamily: FONT_MONO, fontSize: 28, color: V.dim}}>P95 任务完成时间（分钟）</div>
        {bars.map(([n, v, c]) => (
          <div key={n} style={{marginTop: 28}}>
            <div style={{fontFamily: FONT_ZH, fontSize: 34, fontWeight: 700, color: V.ink}}>{n}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 10}}>
              <div style={{height: 56, width: v * bw * (tall ? 0.85 : 0.65), background: c, borderRadius: 8}} />
              <span style={{fontFamily: '"Montserrat", sans-serif', fontSize: 60, fontWeight: 800, color: c}}>{v}</span>
            </div>
          </div>
        ))}
        <div style={{fontFamily: FONT_ZH, fontSize: 24, color: V.faint, marginTop: 20}}>原文初步实验 · 合成负载</div>
      </div>
      <div style={{position: 'absolute', left: tall ? 80 : 110, bottom: tall ? 80 : 90}}>
        <Title s={tall ? 1.1 : 1} />
      </div>
    </Bg>
  );
};
