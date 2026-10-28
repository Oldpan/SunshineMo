// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs. Cover A (user's pick 2026-10-28):
// 「脑手分离」 + 「首 token 延迟中位数降约 60%」 (the blog's p50 TTFT figure), with the clay brain cut loose from a column of interchangeable sandboxes.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ClaudeSpark} from '@atv/lib/brand/claude';
import {useFonts} from '@atv/lib/Video';
import {FONT_MONO, FONT_SERIF, FONT_ZH, K, useSerifFonts} from './common';

const Pill: React.FC<{children: React.ReactNode; hot?: boolean; size?: number}> = ({children, hot, size = 30}) => (
  <span
    style={{
      fontFamily: FONT_ZH,
      fontSize: size,
      fontWeight: 800,
      color: hot ? '#fff' : K.ink,
      background: hot ? K.clay : '#fff',
      border: `2px solid ${hot ? K.clay : 'rgba(20,20,19,0.12)'}`,
      borderRadius: 999,
      padding: '10px 28px',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

/** Brain card + cut wire + three sandboxes, drawn statically. */
const Figure: React.FC<{scale: number}> = ({scale}) => {
  const W = 760;
  const H = 620;
  return (
    <div style={{width: W * scale, height: H * scale, position: 'relative'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 170,
            width: 300,
            height: 280,
            background: K.peach,
            border: '3px solid rgba(201,96,63,0.5)',
            borderRadius: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: '0 22px 60px rgba(60,40,20,0.12)',
          }}
        >
          <ClaudeSpark size={92} color={K.orange} />
          <span style={{fontFamily: FONT_ZH, fontSize: 52, fontWeight: 900, color: K.ink}}>脑</span>
          <span style={{fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600, color: K.dim}}>Claude + harness</span>
        </div>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
          <path d="M 300 310 L 440 310" stroke={K.line} strokeWidth={4} strokeDasharray="12 10" />
          <path d="M 372 266 L 372 354" stroke={K.clay} strokeWidth={6} strokeLinecap="round" />
        </svg>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 460 + (i === 1 ? 30 : 0),
              top: 40 + i * 195,
              width: 290,
              height: 160,
              background: K.stone,
              borderRadius: 14,
              padding: '16px 18px',
              boxSizing: 'border-box',
              opacity: i === 2 ? 0.75 : 1,
            }}
          >
            <div style={{display: 'flex', gap: 6}}>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{width: 11, height: 11, borderRadius: 11, background: K.line}} />
              ))}
            </div>
            <div style={{marginTop: 12, fontFamily: FONT_MONO, fontSize: 22, color: K.dim}}>$ _</div>
            <div style={{position: 'absolute', left: 18, bottom: 14, fontFamily: FONT_ZH, fontSize: 30, fontWeight: 800, color: K.ink}}>手 · 沙箱 {i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useFonts();
  useSerifFonts();
  const tall = h > w;
  const titleSize = tall ? 190 : 200;
  return (
    <AbsoluteFill style={{background: K.page}}>
      <AbsoluteFill
        style={{backgroundImage: 'radial-gradient(rgba(20,20,19,0.08) 1.6px, transparent 1.8px)', backgroundSize: '34px 34px', backgroundPosition: '17px 17px'}}
      />
      <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 100 : 190, width: tall ? 920 : 900}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <ClaudeSpark size={46} color={K.orange} />
          <span style={{fontFamily: FONT_ZH, fontSize: 32, fontWeight: 800, color: K.dim, letterSpacing: 1}}>Claude Managed Agents · 架构拆解</span>
        </div>
        <div style={{marginTop: 24, lineHeight: 1.04}}>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: titleSize, color: K.ink, letterSpacing: -4, whiteSpace: 'nowrap'}}>脑手</div>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: titleSize, color: K.clay, letterSpacing: -4, whiteSpace: 'nowrap'}}>分离</div>
        </div>
        <div style={{marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap'}}>
          <Pill hot size={tall ? 34 : 36}>
            首 token 延迟中位数降约 60%
          </Pill>
          <Pill size={tall ? 30 : 30}>钥匙不进沙箱</Pill>
          <Pill size={tall ? 30 : 30}>Agent 会做梦</Pill>
        </div>
      </div>
      <div style={tall ? {position: 'absolute', left: 120, top: 760} : {position: 'absolute', right: 80, top: 230}}>
        <Figure scale={tall ? 1.1 : 1.0} />
      </div>
    </AbsoluteFill>
  );
};
