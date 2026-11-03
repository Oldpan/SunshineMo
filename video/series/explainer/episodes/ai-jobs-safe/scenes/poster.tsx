// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs, in the video's gameshow look.
// A: 「这 3 类工作 / 不容易被 AI 替代」 with the three round cards and cheering beans.
// B: 「自测 3 问 / 你的工作安全吗？」 with the quiz checklist.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bean, F_CJK, F_ROUND, GSSet, K, ShadowCard, Sticker, TelopDiv, useKit} from './common';

export const VARIANT: 'A' | 'B' = 'A';

/** The 1920×1080 set, scaled to cover any poster size. */
const Back: React.FC<{w: number; h: number}> = ({w, h}) => {
  const s = Math.max(w / 1920, h / 1080);
  return (
    <div style={{position: 'absolute', left: (w - 1920 * s) / 2, top: (h - 1080 * s) / 2, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0'}}>
      <GSSet set={VARIANT === 'A' ? 'yellow' : 'purple'} pattern="rays" floor={null} curtain={VARIANT === 'A' ? K.red : K.pink} />
    </div>
  );
};

const ROUNDS = [
  {n: 1, name: '拍板兜底', col: K.orange},
  {n: 2, name: '现场', col: K.blue},
  {n: 3, name: '非你不可', col: K.pink},
];
const QS = ['在不在金字塔尖？', '是不是全在电脑上？', '是不是按产量挣钱？'];

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useKit();
  const tall = h > w;
  const [l1, l2] = VARIANT === 'A' ? ['这 3 类工作', '不容易被 AI 替代'] : ['自测 3 问', '你的工作安全吗？'];
  const t1 = tall ? 120 : 130;
  const t2 = tall ? (VARIANT === 'A' ? 116 : 104) : VARIANT === 'A' ? 140 : 130;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Back w={w} h={h} />
      <div style={{position: 'absolute', left: 0, right: 0, top: tall ? 190 : 150, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Sticker text="AI 裁员潮里，哪些工作还安全？" size={tall ? 44 : 46} col={K.white} rot={-2} />
        <div style={{marginTop: 30, transform: 'rotate(-2deg)'}}>
          <TelopDiv size={t1} color={K.white} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>
            {l1}
          </TelopDiv>
        </div>
        <div style={{marginTop: 4, transform: 'rotate(-2deg)'}}>
          <TelopDiv size={t2} color={VARIANT === 'A' ? K.red : K.yellow} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>
            {l2}
          </TelopDiv>
        </div>
      </div>
      {VARIANT === 'A' ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: tall ? 760 : 640,
            display: 'flex',
            flexDirection: tall ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tall ? 26 : 50,
          }}
        >
          {ROUNDS.map((r, i) => (
            <div key={r.n} style={{transform: `rotate(${(i - 1) * 3}deg)`}}>
              <ShadowCard w={tall ? 560 : 420} h={tall ? 130 : 170} col={r.col} r={30} off={12}>
                <div style={{display: 'flex', flexDirection: tall ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: tall ? 24 : 0}}>
                  <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 34, color: K.ol, background: K.white, border: `5px solid ${K.ol}`, borderRadius: 24, padding: '0 18px'}}>
                    第 {r.n} 关
                  </div>
                  <TelopDiv size={64} style={{marginTop: tall ? 0 : 8}}>
                    {r.name}
                  </TelopDiv>
                </div>
              </ShadowCard>
            </div>
          ))}
        </div>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, top: tall ? 700 : 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
          {QS.map((q, i) => (
            <ShadowCard key={i} w={tall ? 860 : 820} h={110} col={K.cream} r={26} off={10}>
              <div style={{display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 30}}>
                <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 52, color: K.purple, width: 100}}>Q{i + 1}</div>
                <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 52, color: K.ol}}>{q}</div>
              </div>
            </ShadowCard>
          ))}
        </div>
      )}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0}}>
        <Bean x={tall ? 150 : 170} y={h - (tall ? 40 : 60)} scale={tall ? 0.9 : 1.0} color={K.blue} belly={K.sky} hey={1} open ant="star" />
        <Bean x={w - (tall ? 150 : 170)} y={h - (tall ? 40 : 60)} scale={tall ? 0.9 : 1.0} color={K.green} belly={K.lime} hey={1} open hat={VARIANT === 'A' ? 'crown' : 'headset'} />
      </svg>
    </AbsoluteFill>
  );
};
