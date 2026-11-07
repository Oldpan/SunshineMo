// Hook (≈11 s): the title on top; 鲸鱼娘 (= the video AI) dances and every mistake costs a heart; she works out that
// standing still costs nothing, freezes, and the hearts fill back up: 「不动＝满分？」. Then the report window
// drops in with the line it warns about, and a pit opens in the floor beside her.
import React from 'react';
import {useScene} from '@atv/lib/timing';
import {PixelBar, PixelPanel, PixelText, PixelWindow, Sprite} from '@atv/lib/styles';
import {Bubble, FloatUp, Headline, Hearts, Mascot, P, PP, pxPop, Screen, seg, snap, Tag, useT, WHALE, dance, blink, PP_SP, outline} from './common';

const ERR = [20, 42, 64]; // mistakes, frames after beat 0
const BUGS: [number, number][] = [[300, 860], [760, 930], [330, 1060]];

export const Hook: React.FC = () => {
  const {f, b} = useT();
  const title = (useScene().data?.title as string[]) ?? ['为什么 AI 视频里的人', '经常一动不动'];
  const stopped = f >= b[1];
  const frozen = f >= b[2];
  // hearts: 5 → 2 with the mistakes, back to 5 one by one once she stands still
  const lost = ERR.filter((e) => f >= b[0] + e).length;
  const refill = frozen ? Math.min(3, Math.max(0, Math.floor((f - b[2] - 4) / 6) + 1)) : 0;
  const hearts = 5 - lost + refill;
  // motion bar: lively while dancing, drains to 0.02 when she freezes
  const motion = frozen ? 0.62 - 0.6 * seg(f, b[2], b[2] + 16) : stopped ? 0.62 : 0.55 + 0.12 * Math.abs(Math.sin(f / 5));
  const report = f >= b[3];
  const rp = pxPop(f, b[3]);
  const sway = stopped ? 0 : snap(36 * Math.sin(f / 9), 12);
  return (
    <Screen wipeIn={false}>
      {/* title */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center'}}>
        <div style={{transform: `scale(${pxPop(f, 0)})`}}>
          <Headline size={72} drop="#4C8DF6">
            {title[0]}
          </Headline>
        </div>
        <div style={{marginTop: 14, transform: `scale(${pxPop(f, 3)})`}}>
          <Headline size={108}>{title[1]}</Headline>
        </div>
      </div>
      {/* score HUD → report window */}
      {!report ? (
        <div style={{position: 'absolute', left: 120, top: 530, transform: `scale(${pxPop(f, b[0])})`, transformOrigin: '50% 50%'}}>
          <PixelWindow w={840} h={210} title="评分规则 · 出一处错扣一分">
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <div style={{width: 130}}>
                <PixelText size={36}>得分</PixelText>
              </div>
              <Hearts n={hearts} px={6} />
              <div style={{marginLeft: 'auto'}}>
                <PixelText size={36} color={hearts === 5 ? '#1F8A50' : PP.pink}>
                  {hearts}/5
                </PixelText>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 14}}>
              <div style={{width: 130}}>
                <PixelText size={36}>动作</PixelText>
              </div>
              <PixelBar p={motion} n={14} w={430} h={22} color={frozen ? PP.pink : '#3CC47C'} />
              <div style={{marginLeft: 'auto'}}>
                <PixelText size={36} color={frozen ? PP.pink : PP.ink}>
                  {frozen ? (f >= b[2] + 16 ? '0.02' : (motion).toFixed(2)) : motion.toFixed(2)}
                </PixelText>
              </div>
            </div>
          </PixelWindow>
          {/* -1 floats from the hearts */}
          {ERR.map((e) => (
            <div key={e} style={{position: 'absolute', left: 330 + (5 - ERR.indexOf(e) - 1) * 72, top: 70}}>
              <FloatUp f={f - b[0] - e}>-1</FloatUp>
            </div>
          ))}
        </div>
      ) : (
        <div style={{position: 'absolute', left: 120, top: 530, transform: `scale(${rp})`}}>
          <PixelWindow w={840} h={230} title="可灵团队 · 技术报告 · 2026.11.03">
            <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
              <Sprite name="doc" px={7} />
              <div>
                <div style={{position: 'relative', display: 'inline-block'}}>
                  <div style={{position: 'absolute', left: -6, top: 6, height: 44, width: `${100 * seg(f, b[3] + 14, b[3] + 40)}%`, background: '#FFE27A'}} />
                  <span style={{position: 'relative'}}>
                    <PixelText size={36}>只扣错误分，</PixelText>
                  </span>
                </div>
                <div style={{position: 'relative', display: 'inline-block', marginTop: 6}}>
                  <div style={{position: 'absolute', left: -6, top: 6, height: 44, width: `${100 * seg(f, b[3] + 34, b[3] + 60)}%`, background: '#FFE27A'}} />
                  <span style={{position: 'relative'}}>
                    <PixelText size={36}>模型会学会不动</PixelText>
                  </span>
                </div>
                <div style={{marginTop: 6, opacity: f >= b[3] + 62 ? 1 : 0}}>
                  <PixelText size={24} color="#8C84B0">
                    Penalizing artifacts alone rewards stillness.
                  </PixelText>
                </div>
              </div>
            </div>
          </PixelWindow>
        </div>
      )}
      {/* the pit opens beside her, with a warning sign */}
      {report && (
        <>
          {(() => {
            const pw = snap(220 * seg(f, b[3] + 40, b[3] + 52), 12);
            return [0.5, 0.85, 1, 0.85, 0.5].map((k, i) => (
              <div key={i} style={{position: 'absolute', left: 800 - (pw * k) / 2, top: 1188 + i * 12, width: pw * k, height: 12, background: i === 0 ? '#5A5288' : '#0B0918'}} />
            ));
          })()}
          <div style={{position: 'absolute', left: 860, top: 1010, transform: `scale(${pxPop(f, b[3] + 50)})`, transformOrigin: '50% 100%'}}>
            <Sprite rows={PP_SP.warn} px={8} style={outline()} />
            <div style={{width: 12, height: 80, margin: '0 auto', background: '#8C6440', boxShadow: `0 0 0 4px ${PP.ink}`}} />
          </div>
          <div style={{position: 'absolute', left: 690, top: 1256, transform: `scale(${pxPop(f, b[3] + 56)})`}}>
            <Tag bg={PP.pink} fg="#fff">
              小心这个坑
            </Tag>
          </div>
        </>
      )}
      {/* 鲸鱼娘 */}
      <Mascot src={stopped ? WHALE.still : dance(f)} x={540 + sway} y={1186} s={0.55} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', transform: `scale(${pxPop(f, 6)})`}}>
        <Tag bg="#BDE3FF">拍视频的 AI</Tag>
      </div>
      {/* mistakes while she dances */}
      {ERR.map((e, i) => {
        const t = f - b[0] - e;
        if (t < 0 || stopped) return null;
        return (
          <div key={e} style={{position: 'absolute', left: BUGS[i][0], top: BUGS[i][1], transform: `scale(${pxPop(t, 0)})`}}>
            <Sprite name="bug" px={7} style={outline()} />
            <div style={{marginTop: 4}}>
              <Tag bg={PP.pink} fg="#fff" size={24}>
                出错
              </Tag>
            </div>
          </div>
        );
      })}
      {/* her thought */}
      {stopped && (
        <div style={{position: 'absolute', left: 680, top: 770, transform: `scale(${pxPop(f, b[1] + 3)})`, transformOrigin: '0% 100%'}}>
          <Bubble tail="left">{frozen ? '不动就不会错' : '……'}</Bubble>
        </div>
      )}
      {/* 不动＝满分？ */}
      {frozen && !report && (
        <div style={{position: 'absolute', left: 84, top: 890, transform: `scale(${pxPop(f, b[2] + 30)}) rotate(-6deg)`}}>
          <PixelPanel w={260} h={92} bg={PP.pink}>
            <div style={{marginTop: -8, textAlign: 'center'}}>
              <PixelText size={36} color="#fff" style={{opacity: blink(f - b[2] - 30, 20) || f - b[2] - 30 > 40 ? 1 : 0.6}}>
                不动＝满分？
              </PixelText>
            </div>
          </PixelPanel>
        </div>
      )}
    </Screen>
  );
};
