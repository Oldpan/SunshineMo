// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs. Same misty landscape and Kimi blue as the video.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from '@atv/lib/Video';
import {FONT_SERIF, K, Mountains, Num, useSerifFonts, Zh} from './common';

/** The knob turned down from 90.5 to 81.0 — the hook of the video. */
const Knob: React.FC<{size: number}> = ({size}) => {
  const a0 = -130;
  const pt = (a: number, r: number) => [Math.sin((a * Math.PI) / 180) * r, -Math.cos((a * Math.PI) / 180) * r];
  const arcPath = (r: number, from: number, to: number) => {
    const [x0, y0] = pt(from, r);
    const [x1, y1] = pt(to, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${Math.abs(to - from) > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const at = (v: number) => a0 + (260 * v) / 100;
  const [nx, ny] = pt(at(81), 60);
  const [gx, gy] = pt(at(90.5), 82);
  return (
    <svg width={size} height={size * 0.9} viewBox="-100 -100 200 180">
      <path d={arcPath(82, a0, 130)} stroke={K.grey} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={arcPath(82, a0, at(81))} stroke={K.warn} strokeWidth={14} fill="none" strokeLinecap="round" />
      <circle cx={gx} cy={gy} r={8} fill="none" stroke={K.dim} strokeWidth={3} strokeDasharray="3 3" />
      <line x1={0} y1={0} x2={nx} y2={ny} stroke={K.ink} strokeWidth={8} strokeLinecap="round" />
      <circle r={12} fill={K.ink} />
    </svg>
  );
};

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useFonts();
  useSerifFonts();
  const tall = h > w;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: tall ? 'scale(1.42)' : undefined, transformOrigin: '50% 100%'}}>
        <Mountains t={4} />
      </div>
      <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 100 : 110, right: tall ? 80 : 760}}>
        <Zh size={tall ? 30 : 30} w={700} color={K.hero} style={{letterSpacing: 2, fontFamily: '"Noto Sans SC", sans-serif'}}>
          Kimi K3.1 Pro · 全拆解
        </Zh>
        <div style={{marginTop: 22, lineHeight: 1.12}}>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: tall ? 116 : 128, color: K.ink, letterSpacing: -2}}>故意调弱的</div>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: tall ? 116 : 128, color: K.hero, letterSpacing: -2}}>开源旗舰</div>
        </div>
        <div style={{marginTop: 34, display: 'flex', gap: 46, flexWrap: 'wrap'}}>
          {[
            {n: '65.7', l: 'Terminal-Bench 4.0'},
            {n: '2.78万亿', l: '总参数（K3 底座）'},
          ].map((x) => (
            <div key={x.l}>
              <Num size={tall ? 70 : 74} color={K.ink}>
                {x.n}
              </Num>
              <div style={{marginTop: 6}}>
                <span style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 24, fontWeight: 600, color: '#3E4A54'}}>{x.l}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={
          tall
            ? {position: 'absolute', left: 80, right: 80, top: 800, display: 'flex', justifyContent: 'center'}
            : {position: 'absolute', right: 90, top: 210, width: 660, display: 'flex', justifyContent: 'center'}
        }
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: `1.5px solid ${K.warn}55`,
            borderRadius: 24,
            boxShadow: '0 18px 50px rgba(30,50,65,0.18)',
            padding: tall ? '26px 40px 32px' : '30px 40px 36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Knob size={tall ? 300 : 380} />
          <Num size={tall ? 84 : 88} color={K.warn} style={{whiteSpace: 'nowrap'}}>
            90.5 → 81.0
          </Num>
          <div style={{marginTop: 12}}>
            <span style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 28, fontWeight: 700, color: K.dim, whiteSpace: 'nowrap'}}>内部漏洞利用 pass@3：删数据前 → 后</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
