// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs. Same dark ground and cyan hero colour as the video.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from '@atv/lib/Video';
import {K, Num, Zh} from './common';

const Ground: React.FC = () => (
  <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
    <div style={{position: 'absolute', width: 1400, height: 1400, borderRadius: 700, background: 'radial-gradient(circle, rgba(63,208,255,0.18), rgba(63,208,255,0) 65%)', right: -500, top: -600}} />
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${K.line} 1px, transparent 1px), linear-gradient(90deg, ${K.line} 1px, transparent 1px)`,
        backgroundSize: '96px 96px',
        opacity: 0.6,
      }}
    />
  </AbsoluteFill>
);

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
  const tall = h > w;
  const s = tall ? 1 : 1;
  return (
    <AbsoluteFill>
      <Ground />
      <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 110 : 120, right: tall ? 80 : 760}}>
        <Zh size={tall ? 40 : 40} w={800} color={K.hero} style={{letterSpacing: 2}}>
          Kimi K3.1 Pro · 全拆解
        </Zh>
        <div style={{marginTop: 26, lineHeight: 1.12}}>
          <Zh size={(tall ? 112 : 124) * s} w={900} style={{display: 'block', letterSpacing: -3}}>
            故意调弱的
          </Zh>
          <Zh size={(tall ? 112 : 124) * s} w={900} color={K.hero} style={{display: 'block', letterSpacing: -3, textShadow: `0 0 40px ${K.hero}66`}}>
            开源旗舰
          </Zh>
        </div>
        <div style={{marginTop: 34, display: 'flex', gap: 40, flexWrap: 'wrap'}}>
          {[
            {n: '65.7', l: 'Terminal-Bench 4.0'},
            {n: '2.78万亿', l: '总参数（K3 底座）'},
          ].map((x) => (
            <div key={x.l}>
              <Num size={tall ? 72 : 76} color={K.ink}>
                {x.n}
              </Num>
              <div>
                <Zh size={26} w={700} color={K.dim}>
                  {x.l}
                </Zh>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={tall ? {position: 'absolute', left: 80, right: 80, top: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center'} : {position: 'absolute', right: 80, top: 200, width: 680, textAlign: 'center'}}>
        <Knob size={tall ? 400 : 500} />
        <div>
          <Num size={tall ? 96 : 92} color={K.warn} style={{whiteSpace: 'nowrap'}}>
            90.5 → 81.0
          </Num>
          <div style={{marginTop: 8}}>
            <Zh size={tall ? 32 : 34} w={800} color={K.dim}>
              删掉网络安全数据后的漏洞利用分
            </Zh>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
