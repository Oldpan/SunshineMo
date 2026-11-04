// Covers for the vertical cut: 9:16 (抖音), 3:4 (小红书), 6:7 (视频号) from one layout centred on the 6:7 band.
// A (default): 「只改 0.016% 的数字」 + 千问 数学 7.9% → 48.1% bars + 「没重新训练 · 直接改」.
// B (offered): 「AI 直接改 AI 的“脑子”」 + the three results. Switch VARIANT and re-run covers.mjs for the other one.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT_MONO, G, POOL, Q} from './common';

const VARIANT: 'A' | 'B' = 'A';

const Rain: React.FC<{h: number}> = ({h}) => (
  <div style={{position: 'absolute', inset: 0, opacity: 0.32}}>
    {Array.from({length: 8}, (_, c) => (
      <div key={c} style={{position: 'absolute', left: 20 + c * 136, top: -((c * 17) % 46), fontFamily: FONT_MONO, fontSize: 24, lineHeight: '46px', color: Q.deep, whiteSpace: 'pre'}}>
        {Array.from({length: Math.ceil(h / 46) + 2}, (_, k) => (
          <div key={k}>{POOL[(k + c * 13) % POOL.length]}</div>
        ))}
      </div>
    ))}
  </div>
);

const Pill: React.FC<{children: React.ReactNode; color?: string; fill?: boolean; size?: number}> = ({children, color = Q.green, fill, size = 54}) => (
  <div style={{display: 'inline-block', background: fill ? color : 'rgba(5,9,12,0.88)', border: `5px solid ${color}`, borderRadius: 22, padding: '6px 30px', boxShadow: `0 0 40px ${color}55`}}>
    <G size={size} color={fill ? Q.bg : color}>
      {children}
    </G>
  </div>
);

export const poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  const top = (h - 1260) / 2;
  const row = (y: number, children: React.ReactNode, extra: React.CSSProperties = {}) => (
    <div style={{position: 'absolute', left: 0, width: w, top: top + y, textAlign: 'center', ...extra}}>{children}</div>
  );
  return (
    <AbsoluteFill style={{background: Q.bg, overflow: 'hidden'}}>
      <Rain h={h} />
      <div style={{position: 'absolute', left: w / 2 - 560, top: h / 2 - 560, width: 1120, height: 1120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,163,0.2) 0%, rgba(0,255,163,0) 65%)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(5,9,12,0) 35%, rgba(5,9,12,0.9) 100%)'}} />
      {VARIANT === 'A' ? (
        <>
          {row(50, <Pill size={48}>AI 给 AI 动手术</Pill>)}
          {row(170, <G size={96}>只改</G>)}
          {row(270, <G size={230} num color={Q.green} glow={1.4} style={{letterSpacing: -6}}>0.016%</G>)}
          {row(530, <G size={96}>的数字</G>)}
          {row(690, <G size={44} w={800} color={Q.grey}>千问 数学答对率</G>)}
          {row(
            760,
            <>
              <G size={110} num color={Q.grey}>
                7.9%
              </G>
              <G size={90} color={Q.green}>
                {' '}→{' '}
              </G>
              <G size={150} num color={Q.green} glow={1}>
                48.1%
              </G>
            </>,
          )}
          {row(990, <Pill color={Q.yellow} size={62}>没重新训练 · 直接改</Pill>, {transform: 'rotate(-4deg)'})}
        </>
      ) : (
        <>
          {row(60, <Pill size={46}>MIT CSAIL · GPT-6 Astra</Pill>)}
          {row(180, <G size={124}>AI 直接改</G>)}
          {row(330, <G size={124} color={Q.green} glow={1}>AI 的“脑子”</G>)}
          {[
            ['看', '只看数字，认出在玩哪个游戏'],
            ['修', '小车 0 次 → 1024 次全成功'],
            ['改', '千问数学 7.9% → 48.1%'],
          ].map(([k, v], i) =>
            row(
              580 + i * 190,
              <div style={{display: 'inline-flex', alignItems: 'center', gap: 24, width: 860, background: 'rgba(6,20,15,0.9)', border: `4px solid ${Q.deep}`, borderRadius: 24, padding: '20px 30px', boxSizing: 'border-box'}}>
                <G size={74} color={Q.green} glow={0.6}>
                  {k}
                </G>
                <G size={46} w={800}>
                  {v}
                </G>
              </div>,
            ),
          )}
        </>
      )}
    </AbsoluteFill>
  );
};
