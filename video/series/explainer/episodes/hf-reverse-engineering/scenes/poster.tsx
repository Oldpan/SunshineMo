// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs. Cover A (user's pick 2026-10-28):
// 「大模型带小模型 / 逆向二进制」 + pill 「56 个函数全部还原」 (Problem 2 table: 56 / 56 accepted), with the DeepSeek
// whale leading four Qwen3.5 marks in front of a wall of green function bricks (names from the article's recording).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from '@atv/lib/Video';
import {Brick, DeepSeekWhale, FONT_ZH, GREEN, HFLogo, QwenMark, SHOOTER_FNS} from './common';

const INK = '#1E1E24';

const Pill: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 34}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: 900, color: '#fff', background: GREEN, borderRadius: 999, padding: '12px 30px', whiteSpace: 'nowrap'}}>{children}</span>
);

const Wall: React.FC<{cols: number; rows: number; w: number}> = ({cols, rows, w}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${w}px)`, gap: 8, background: '#11131C', padding: 18, borderRadius: 20}}>
    {SHOOTER_FNS.slice(0, cols * rows).map((n) => (
      <Brick key={n} name={n} state={2} w={w} size={15} />
    ))}
  </div>
);

const Team: React.FC<{scale: number}> = ({scale}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 26 * scale}}>
    <div style={{width: 210 * scale, height: 210 * scale, borderRadius: 40 * scale, background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 40px rgba(30,40,120,0.18)'}}>
      <DeepSeekWhale size={160 * scale} bob={false} />
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 * scale}}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{width: 98 * scale, height: 98 * scale, borderRadius: 22 * scale, background: '#F2F1FE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(60,40,140,0.14)'}}>
          <QwenMark size={74 * scale} />
        </div>
      ))}
    </div>
  </div>
);

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useFonts();
  const tall = h > w;
  const bg = 'linear-gradient(135deg, #FFF3CC 0%, #FFE8D9 100%)';
  if (tall)
    return (
      <AbsoluteFill style={{background: bg, padding: 70, boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <HFLogo size={56} />
          <span style={{fontFamily: FONT_ZH, fontWeight: 800, fontSize: 30, color: '#6B6B78'}}>Hugging Face 实验</span>
        </div>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 118, color: INK, lineHeight: 1.08, marginTop: 40}}>大模型带</div>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 118, color: INK, lineHeight: 1.08}}>小模型</div>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 118, color: '#EE6420', lineHeight: 1.08}}>逆向二进制</div>
        <div style={{marginTop: 40}}>
          <Pill size={40}>56 个函数全部还原</Pill>
        </div>
        <div style={{marginTop: 60}}>
          <Team scale={1.1} />
        </div>
        <div style={{position: 'absolute', left: 70, bottom: 70, opacity: 0.95}}>
          <Wall cols={3} rows={4} w={250} />
        </div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: bg}}>
      <div style={{position: 'absolute', left: 90, top: 110}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <HFLogo size={56} />
          <span style={{fontFamily: FONT_ZH, fontWeight: 800, fontSize: 30, color: '#6B6B78'}}>Hugging Face 实验 · DeepSeek × Qwen</span>
        </div>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 150, color: INK, lineHeight: 1.06, marginTop: 40}}>大模型带小模型</div>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 150, color: '#EE6420', lineHeight: 1.06}}>逆向二进制</div>
        <div style={{marginTop: 50}}>
          <Pill size={44}>56 个函数全部还原</Pill>
        </div>
      </div>
      <div style={{position: 'absolute', right: 90, top: 120}}>
        <Team scale={1} />
      </div>
      <div style={{position: 'absolute', right: 90, bottom: 90}}>
        <Wall cols={3} rows={8} w={230} />
      </div>
    </AbsoluteFill>
  );
};
