// LEVEL 4 评委 (≈23 s). The judge bot scans a frame and catches three defects (six fingers, a cup sunk into the table,
// flicker), one heart each. Score only defects and you get the opening trap: 鲸鱼娘 stands still, full marks. So a
// motion row is added; standing still now loses stars, dancing wins them back. The judge is charged too when it
// misses a defect (a bug sneaks past; its own HP drops). Accuracy on Kling's internal pairwise test (Table 17):
// DRM 77.86%, Gemini-4-Argon 73.54%.
import React from 'react';
import {PixelBar, PixelText, PixelWindow, Sprite} from '@atv/lib/styles';
import {blink, Bot, Credit, Cup, dance, FloatUp, hand6, Hearts, LevelBanner, Mascot, outline, PP, PP_SP, pxPop, Screen, seg, snap, Stars, Tag, useT, WHALE} from './common';

const SCR = {x: 126, y: 526, w: 808, h: 210}; // inner frame of the screen window
const ZONE = [SCR.x + 130, SCR.x + 404, SCR.x + 678]; // centres of the three defect zones

export const Judge: React.FC = () => {
  const {f, b, at} = useT();
  const D = [at(1, '手指'), at(1, '东西穿模'), at(1, '画面闪烁')];
  const found = D.filter((d) => f >= d).length;
  const phase1 = f < b[2];
  const acc = f >= b[6];
  const motionRow = f >= b[3];
  const moving = f >= b[4];
  const motion = moving ? 0.02 + 0.68 * seg(f, b[4] + 6, b[4] + 24) : 0.02;
  // stars: full while only defects count; motion row knocks them to 2; dancing brings them back
  const stars = phase1 ? 5 - found : !motionRow ? 5 : !moving ? (f >= b[3] + 30 ? 2 : 5) : f >= b[4] + 26 ? 5 : 2;
  const hearts = phase1 ? 5 - found : 5;
  const flicker = f >= D[2] && f < D[2] + 24 && Math.floor(f / 3) % 2 === 0;
  // magnifier: hops to each defect in turn; in b5 it looks left while a bug walks past on the right
  const magX = phase1 ? (found === 0 ? SCR.x + 20 : ZONE[found - 1] + 60) : SCR.x + 60;
  const miss = f >= b[5];
  const bugX = snap(SCR.x + 420 + 340 * seg(f, b[5] + 4, b[5] + 40), 6);
  const hp = miss && f >= b[5] + 44 ? 0.6 : 1;
  return (
    <Screen>
      <LevelBanner f={f - b[0]} n={4} name="评委" />
      {!acc && (
        <>
          {/* the screen the judge looks at */}
          <div style={{position: 'absolute', left: 100, top: 450, transform: `scale(${pxPop(f, b[0] + 6)})`}}>
            <PixelWindow w={860} h={310} title={phase1 ? '评委在看的画面' : '拍出来的视频'} />
          </div>
          <div style={{position: 'absolute', left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, background: '#BDE3FF', overflow: 'hidden', boxShadow: `0 0 0 4px ${PP.ink}`, opacity: f >= b[0] + 9 ? 1 : 0}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 50, background: '#56C26A', borderTop: `4px solid ${PP.ink}`}} />
            {phase1 ? (
              <>
                <div style={{position: 'absolute', left: 130 - 57, top: 14}}>
                  <Sprite rows={hand6()} px={6} pal={{c: PP.skin}} />
                </div>
                {/* cup sunk halfway into a table */}
                <div style={{position: 'absolute', left: 404 - 90, top: 120, width: 180, height: 22, background: '#B98A5E', boxShadow: `0 0 0 4px ${PP.ink}`}} />
                <div style={{position: 'absolute', left: 404 - 28, top: 100, width: 60, height: 22, overflow: 'hidden'}}>
                  <Cup x={0} y={0} px={7} />
                </div>
                <div style={{position: 'absolute', left: 678 - 30, top: 60}}>
                  <Sprite rows={['..kkkk..', '.kcccck.', '..kkkk..', '.kbbbbk.', 'kbbbbbbk', 'kcbbbbck', '.kbbbbk.', '.kBkkBk.', '.kBk.kB.', 'kk...kk.']} px={8} pal={{c: PP.skin, B: '#2A5BC4'}} />
                </div>
                {flicker && <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,.85)'}} />}
              </>
            ) : (
              <>
                <Mascot src={moving ? dance(f, 7) : WHALE.still} x={404} y={196} s={0.24} />
                {miss && (
                  <div style={{position: 'absolute', left: bugX - SCR.x, top: 120}}>
                    <Sprite name="bug" px={5} />
                  </div>
                )}
              </>
            )}
          </div>
          {/* defect markers */}
          {phase1 &&
            D.map((d, i) =>
              f >= d ? (
                <div key={i} style={{position: 'absolute', left: ZONE[i] - 120, top: SCR.y + SCR.h - 58, width: 240, textAlign: 'center', transform: `scale(${pxPop(f, d)})`}}>
                  <Tag bg={PP.pink} fg="#fff" size={36}>
                    {['手指多一根', '穿模', '闪烁'][i]}
                  </Tag>
                </div>
              ) : null,
            )}
          {/* the judge's magnifier */}
          <div style={{position: 'absolute', left: snap(magX, 6), top: SCR.y + (phase1 ? 20 : 80), opacity: f >= b[0] + 9 ? 1 : 0}}>
            <Sprite name="magnifier" px={7} />
          </div>
          {/* score window */}
          <div style={{position: 'absolute', left: 100, top: 780, transform: `scale(${pxPop(f, b[0] + 12)})`}}>
            <PixelWindow w={860} h={260} title={motionRow ? '评分 · 新加了一项' : '评分 · 只扣毛病'}>
              <div style={{display: 'flex', alignItems: 'center', gap: 22, height: 52}}>
                <div style={{width: 200}}>
                  <PixelText size={36}>毛病</PixelText>
                </div>
                <Hearts n={hearts} px={5} />
                <div style={{marginLeft: 'auto'}}>
                  <PixelText size={36} color={hearts === 5 ? '#1F8A50' : PP.pink}>
                    {phase1 ? `${found} 处` : '0 处'}
                  </PixelText>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 22, height: 52, opacity: motionRow ? 1 : 0, transform: `scale(${pxPop(f, b[3])})`, transformOrigin: '0 50%'}}>
                <div style={{width: 200}}>
                  <PixelText size={36}>动得够不够</PixelText>
                </div>
                <PixelBar p={motion} n={12} w={360} h={20} color={moving ? '#3CC47C' : PP.pink} />
                <div style={{marginLeft: 'auto'}}>
                  <Tag bg="#F6C445">新加</Tag>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 22, height: 52}}>
                <div style={{width: 200}}>
                  <PixelText size={36}>得分</PixelText>
                </div>
                <Stars n={stars} px={4} />
              </div>
            </PixelWindow>
            {phase1 &&
              D.map((d) => (
                <div key={d} style={{position: 'absolute', left: 560, top: 70}}>
                  <FloatUp f={f - d}>-1</FloatUp>
                </div>
              ))}
          </div>
          {/* the trap again */}
          {f >= b[2] && f < b[3] && (
            <div style={{position: 'absolute', left: 610, top: 590, transform: `scale(${pxPop(f, b[2] + 20)}) rotate(-6deg)`}}>
              <Tag bg={PP.pink} fg="#fff" size={48}>
                不动＝满分？
              </Tag>
            </div>
          )}
          {moving && f < b[5] && (
            <div style={{position: 'absolute', left: 610, top: 600, transform: `scale(${pxPop(f, b[4] + 28)}) rotate(-4deg)`}}>
              <Tag bg="#3CC47C" fg="#fff" size={36}>
                动起来，也不出错
              </Tag>
            </div>
          )}
          {/* the judge itself */}
          <Bot mood={miss && f >= b[5] + 40 ? 'sad' : 'ok'} px={7} x={200} y={1180} />
          <div style={{position: 'absolute', left: 300, top: 1080}}>
            <PixelText size={24} color="#F6C445" style={{textShadow: `3px 3px 0 ${PP.ink}`}}>
              评委自己的分
            </PixelText>
            <div style={{marginTop: 6}}>
              <PixelBar p={hp} n={10} w={300} h={18} color={hp < 1 ? PP.pink : '#3CC47C'} />
            </div>
          </div>
          {miss && f >= b[5] + 40 && (
            <>
              <div style={{position: 'absolute', left: 640, top: 1076, transform: `scale(${pxPop(f, b[5] + 40)})`}}>
                <Tag bg={PP.pink} fg="#fff" size={36}>
                  漏看也扣分
                </Tag>
              </div>
              <div style={{position: 'absolute', left: 480, top: 1060}}>
                <FloatUp f={f - b[5] - 44}>-1</FloatUp>
              </div>
            </>
          )}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center'}}>
            <Tag bg="#BDE3FF">评委岗位</Tag>
          </div>
        </>
      )}
      {acc && (
        <>
          <div style={{position: 'absolute', left: 100, top: 470, transform: `scale(${pxPop(f, b[6])})`}}>
            <PixelWindow w={860} h={600} title="评委准确率（可灵自己的测试）" />
          </div>
          {[
            {n: '可灵的评委', v: 77.86, c: '#3CC47C', f0: b[6] + 24, who: 'happy' as const},
            {n: 'Gemini', v: 73.54, c: '#B7AEDB', f0: b[7] + 4, who: null},
          ].map((r, i) => {
            const p = seg(f, r.f0, r.f0 + 26);
            return (
              <div key={r.n} style={{position: 'absolute', left: 150, top: 590 + i * 220, opacity: f >= r.f0 - 4 ? 1 : 0}}>
                <PixelText size={48}>{r.n}</PixelText>
                <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 14}}>
                  <div style={{width: snap(560 * (r.v / 100) * p, 6), height: 64, background: r.c, boxShadow: `0 0 0 5px ${PP.ink}`}} />
                  <PixelText size={48}>{(r.v * p).toFixed(2)}%</PixelText>
                </div>
              </div>
            );
          })}
          <Bot mood="happy" px={7} x={830} y={1040} />
          <Credit f={f - b[6]}>出处：可灵技术报告 表 17（内部成对测试准确率）</Credit>
        </>
      )}
    </Screen>
  );
};
