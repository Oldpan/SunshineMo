// Covers for the vertical cut: 9:16 (抖音), 3:4 (小红书), 6:7 (视频号) from one layout.
// A: 「Claude Code 自己的提示词 −80% / 核心测试成绩没掉」. B: 「给 AI 的规矩 越多越好？」 with a slip pile.
// Switch VARIANT and re-run covers.mjs for the other one.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {P, Pill, Slip, T} from './common';

const VARIANT: 'A' | 'B' = 'A';

export const poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  // everything sits in a 1080-wide column centred vertically; shorter covers just crop less of it
  const top = (h - 1260) / 2; // the 6:7 band is the common area
  const cy = h / 2;
  const A = VARIANT === 'A';
  return (
    <AbsoluteFill style={{background: P.blue, overflow: 'hidden'}}>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 20}, (_, i) => {
          const a = (i / 20) * Math.PI * 2 + 0.1;
          const a2 = a + Math.PI / 20;
          return <path key={i} d={`M${w / 2} ${cy} L${w / 2 + Math.cos(a) * 2400} ${cy + Math.sin(a) * 2400} L${w / 2 + Math.cos(a2) * 2400} ${cy + Math.sin(a2) * 2400}Z`} fill={P.ray} />;
        })}
        <circle cx={w / 2} cy={cy} r={360} fill={P.yellow} opacity={0.12} />
      </svg>
      {/* confetti */}
      {[
        [120, -60, P.yellow, 20],
        [880, -20, P.coral, -30],
        [180, 1240, P.mint, 40],
        [860, 1200, P.pink, -15],
        [90, 640, P.white, 60],
        [960, 560, P.yellow, -50],
      ].map(([x, y, c, r], i) => (
        <div key={i} style={{position: 'absolute', left: x as number, top: top + (y as number) + 60, width: 44, height: 26, borderRadius: 6, background: c as string, transform: `rotate(${r}deg)`, opacity: 0.9}} />
      ))}
      <div style={{position: 'absolute', left: 0, width: w, top: top + 60, textAlign: 'center'}}>
        <Pill size={46}>{A ? 'Claude Code 团队' : '怎么别让 Claude Code 越用越蠢'}</Pill>
      </div>
      {A ? (
        <>
          <div style={{position: 'absolute', left: 0, width: w, top: top + 170, textAlign: 'center'}}>
            <T size={92}>自己的提示词</T>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: top + 330, textAlign: 'center'}}>
            <T size={300} color={P.yellow} shadow={P.coral} style={{letterSpacing: -8}}>
              −80%
            </T>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: top + 760, textAlign: 'center'}}>
            <Pill size={70} bg={P.mint} color="#0D2B1F">
              ✓ 核心测试成绩没掉
            </Pill>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: top + 888, textAlign: 'center'}}>
            <T size={36} color={P.sky}>
              官方自报 · 未公开评测细节
            </T>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: top + 985, textAlign: 'center'}}>
            <T size={60}>你的规矩，可能也太多了</T>
          </div>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', left: 0, width: w, top: top + 190, textAlign: 'center'}}>
            <T size={120}>给 AI 的规矩</T>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: top + 340, textAlign: 'center'}}>
            <T size={150} color={P.yellow} shadow={P.coral}>
              越多越好？
            </T>
          </div>
          {['必须测试！！', '只做最小修改', '认真思考', '反复确认三遍', '不要加注释', '按需写文档'].map((t, i) => (
            <div key={t} style={{position: 'absolute', left: w / 2 - 200 + ((i * 53) % 120) - 40, top: top + 610 + i * 76, transform: `rotate(${((i * 37) % 13) - 6}deg)`}}>
              <Slip text={t} size={42} bg={i % 2 ? P.white : '#FFE1D8'} />
            </div>
          ))}
          <div style={{position: 'absolute', left: 0, width: w, top: top + 1090, textAlign: 'center', transform: 'rotate(-4deg)'}}>
            <Pill size={60} bg={P.coral} color={P.white}>
              自家提示词删了 80%
            </Pill>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
