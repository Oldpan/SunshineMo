// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs from the `poster` export.
// A (default): the Qwen headline number, 0.016% of weights → MATH-500 7.9% → 48.1%, over a wall of real weights.
// B (offered): 「大模型直接改权重」 + the three READ / FIX / IMPROVE results.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from '@atv/lib/Video';
import {D, FONT_SANS, Lab, useDistillFonts, WeightWall} from './common';

export const POSTER: 'A' | 'B' = 'A';

const T: React.FC<{children: React.ReactNode; size: number; color?: string; w?: number; style?: React.CSSProperties}> = ({children, size, color = D.ink, w = 900, style}) => (
  <div style={{fontFamily: FONT_SANS, fontSize: size, fontWeight: w, color, lineHeight: 1.12, letterSpacing: -1, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

const Bars: React.FC<{scale: number}> = ({scale}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 40 * scale, height: 420 * scale, borderBottom: `4px solid ${D.ink2}`, padding: `0 ${30 * scale}px`}}>
    {[
      ['原模型', 7.9, D.faint],
      ['改权重后', 48.1, D.green],
    ].map(([l, v, c]) => (
      <div key={l as string} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale}}>
        <T size={64 * scale} color={c as string}>
          {v as number}%
        </T>
        <div style={{width: 170 * scale, height: (v as number) * 7 * scale, background: c as string}} />
        <div style={{position: 'absolute'}} />
      </div>
    ))}
  </div>
);

const Wall: React.FC<{w: number; h: number}> = ({w, h}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.16}}>
    <WeightWall w={w} h={h} size={24} markP={0} cols={14} />
  </div>
);

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useFonts();
  useDistillFonts();
  const tall = h > w;
  return (
    <AbsoluteFill style={{background: D.page}}>
      <Wall w={w} h={h} />
      <AbsoluteFill style={{background: tall ? 'linear-gradient(180deg, rgba(255,255,255,0.96) 55%, rgba(255,255,255,0.6))' : 'linear-gradient(90deg, rgba(255,255,255,0.97) 52%, rgba(255,255,255,0.55))'}} />
      {POSTER === 'A' ? (
        <>
          <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 110 : 150}}>
            <Lab size={tall ? 30 : 32}>MIT CSAIL · 权重空间编程</Lab>
            <T size={tall ? 116 : 128} style={{marginTop: 26}}>
              只改 <span style={{color: D.green}}>0.016%</span>
            </T>
            <T size={tall ? 116 : 128}>的权重</T>
            <T size={tall ? 62 : 66} w={800} color={D.ink2} style={{marginTop: 28}}>
              Qwen 数学 <span style={{color: D.faint}}>7.9%</span> → <span style={{color: D.green}}>48.1%</span>
            </T>
            <div style={{marginTop: 34, display: 'inline-block', background: D.mark, padding: '10px 26px', borderRadius: 10}}>
              <T size={tall ? 40 : 42} w={800} color={D.greenDark} style={{letterSpacing: 0}}>
                没训练，是大模型直接改的数字
              </T>
            </div>
          </div>
          <div style={tall ? {position: 'absolute', left: 260, top: 860} : {position: 'absolute', right: 150, top: 330}}>
            <Bars scale={tall ? 1.05 : 1.15} />
          </div>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 110 : 170}}>
            <Lab size={tall ? 30 : 32}>MIT CSAIL · Weight-Space Programming</Lab>
            <T size={tall ? 140 : 150} style={{marginTop: 26}}>
              大模型
            </T>
            <T size={tall ? 140 : 150} color={D.green}>
              直接改权重
            </T>
          </div>
          <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 600 : 640, display: 'flex', flexDirection: tall ? 'column' : 'row', gap: tall ? 26 : 30}}>
            {[
              ['读', '看数字认出游戏'],
              ['修', '小车 0% → 100%'],
              ['改', 'Qwen 7.9% → 48.1%'],
            ].map(([k, v]) => (
              <div key={k} style={{display: 'flex', alignItems: 'center', gap: 18, background: '#fff', border: `3px solid ${D.border}`, borderRadius: 18, padding: '18px 28px'}}>
                <T size={54} color={D.green}>
                  {k}
                </T>
                <T size={40} w={800} style={{letterSpacing: 0}}>
                  {v}
                </T>
              </div>
            ))}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
