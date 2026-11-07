// LEVEL 2 改写 (≈26 s). One short line is rewritten into a long description, and it has to make sense. The report's
// example plays out in a pixel room: the man puts the cup on the table, walks to the door, opens it and "takes a sip"
// with an empty hand. A video model has to make something up: a second cup appears, or the cup teleports back.
// Then the reasonableness bars: share of rewrites scoring ≥4 went from 69% to 91% (Table 13: 69.17 → 91.92).
import React from 'react';
import {PixelText, PixelWindow, Sprite} from '@atv/lib/styles';
import {blink, Bot, Bubble, Credit, Cup, Door, LevelBanner, Man, manHand, Mascot, outline, PP, PP_SP, pxPop, Screen, seg, snap, Stars, Table, Tag, typed, useT, WHALE} from './common';

const PX9 = 9;
const ROOM = {x: 130, y: 550, w: 800, h: 420, floor: 900};
const TABLE = {x: 330, y: 790};
const CUP_ON_TABLE: [number, number] = [392, 790 - 6 * PX9];
const DOOR = {x: 770, y: 640};
const MAN_Y = ROOM.floor - 22 * PX9;

export const CupScene: React.FC = () => {
  const {f, b, at} = useT();
  const room = f >= b[2] && f < b[8];
  const bars = f >= b[8];
  // ---- the man's little play (frames after b3)
  const t = f - b[3];
  const walk0 = 34;
  const walk1 = 70;
  const manX = t < walk0 ? 230 : t < walk1 ? snap(230 + (640 - 230) * seg(t, walk0, walk1), 6) : 640;
  const walking = t >= walk0 && t < walk1;
  const arm: 'down' | 'fwd' | 'mouth' = t < walk0 ? 'fwd' : t < walk1 ? 'down' : t < 92 ? 'fwd' : 'mouth'; // holds the cup out, sets it down
  const doorOpen = seg(t, 76, 90);
  const [hx, hy] = manHand(arm, PX9);
  // cup: in hand until t=20, slides onto the table by t=30, stays there
  const place = seg(t, 20, 30);
  const handCup: [number, number] = [manX + hx - 2 * PX9, MAN_Y + hy - 3 * PX9];
  const tableCup: [number, number] = t < 20 ? handCup : [snap(handCup[0] + (CUP_ON_TABLE[0] - handCup[0]) * place, 6), snap(handCup[1] + (CUP_ON_TABLE[1] - handCup[1]) * place, 6)];
  // outcomes
  const A = f >= b[6] && f < b[7];
  const Bt = f - b[7] - 8;
  const Bo = f >= b[7];
  const mouthCup: [number, number] = [640 + 9 * PX9 - 1 * PX9, MAN_Y + 3 * PX9 - 4 * PX9];
  const steps = [
    {t: '① 放下杯子', f0: at(3, '把杯子')},
    {t: '② 走向门口', f0: at(3, '走向门口')},
    {t: '③ 开门喝一口', f0: at(3, '一边开门')},
  ];
  const short = '男人喝咖啡';
  const long = ['一个男人站在桌边，', '手里端着一杯热咖啡，', '他把杯子放到桌上，', '转身走向门口……'];
  const v1 = 69.17 * seg(f, b[8] + 20, b[8] + 44);
  const v2 = 91.92 * seg(f, b[9] + 4, b[9] + 30);
  return (
    <Screen>
      <LevelBanner f={f - b[0]} n={2} name="改写" />
      {/* one line in, a long description out */}
      {f >= b[1] && f < b[2] && (
        <>
          <div style={{position: 'absolute', left: 100, top: 480, transform: `scale(${pxPop(f, b[1])})`}}>
            <PixelWindow w={860} h={150} title="你写的">
              <PixelText size={48}>
                {typed(f, short, 14, b[1] + 4)}
                <span style={{opacity: blink(f, 16) ? 1 : 0}}>_</span>
              </PixelText>
            </PixelWindow>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', transform: `scale(${pxPop(f, b[1] + 26)})`}}>
            <PixelText size={48} color="#F6C445">
              ▼ 改写
            </PixelText>
          </div>
          <div style={{position: 'absolute', left: 100, top: 710, transform: `scale(${pxPop(f, b[1] + 30)})`}}>
            <PixelWindow w={860} h={330} title="改写成长描述">
              {long.map((ln, i) => (
                <div key={i} style={{height: 50}}>
                  <PixelText size={36}>{typed(f, ln, 26, b[1] + 34 + i * 16)}</PixelText>
                </div>
              ))}
            </PixelWindow>
            <div style={{position: 'absolute', right: 26, bottom: 26, transform: `scale(${pxPop(f, at(1, '还得合理'))}) rotate(-6deg)`}}>
              <Tag bg="#3CC47C" fg="#fff" size={48}>
                还得合理
              </Tag>
            </div>
          </div>
          <Bot px={6} x={190} y={1180} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', transform: `scale(${pxPop(f, b[1] + 10)})`}}>
            <Tag bg="#BDE3FF">改写岗位</Tag>
          </div>
        </>
      )}
      {/* the cup example */}
      {room && (
        <>
          <div style={{position: 'absolute', left: 100, top: 470, transform: `scale(${pxPop(f, b[2])})`}}>
            <PixelWindow w={860} h={530} title={f >= b[5] ? '拍出来会怎样' : '报告里的例子'} />
          </div>
          <div style={{position: 'absolute', left: ROOM.x, top: ROOM.y, width: ROOM.w, height: ROOM.h, overflow: 'hidden', background: '#ECE6FF', boxShadow: `0 0 0 4px ${PP.ink}`, opacity: f >= b[2] + 3 ? 1 : 0}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: ROOM.floor - ROOM.y, bottom: 0, background: '#B98A5E', borderTop: `5px solid ${PP.ink}`}} />
            <div style={{position: 'absolute', left: 60, top: 40, width: 120, height: 90, background: '#BDE3FF', boxShadow: `0 0 0 5px ${PP.ink}`}} />
          </div>
          {f >= b[2] + 3 && (
            <>
              <Door x={DOOR.x} y={DOOR.y} open={doorOpen} />
              <Table x={TABLE.x} y={TABLE.y} />
              {/* cup on the table (or still in his hand before t=20); in outcome B it vanishes from the table */}
              {!(Bo && Bt >= 0) && t >= 30 && <Cup x={tableCup[0]} y={tableCup[1]} px={PX9} />}
              {Bo && Bt >= 0 && Bt < 12 && (
                <div style={{position: 'absolute', left: CUP_ON_TABLE[0], top: CUP_ON_TABLE[1]}}>
                  <Sprite rows={PP_SP.dust} px={PX9} pal={{k: '#8C84B0'}} />
                </div>
              )}
              <Man x={manX} y={MAN_Y} px={PX9} walk={walking && Math.floor(t / 5) % 2 === 0} arm={arm} />
              {/* while it is still in his hand (and sliding onto the table) the cup is drawn in front of him */}
              {t < 30 && <Cup x={tableCup[0]} y={tableCup[1]} px={PX9} />}
              {/* outcome A: a second cup appears in his hand; outcome B: the cup lands in his hand */}
              {(A || (Bo && Bt >= 6)) && <Cup x={mouthCup[0]} y={mouthCup[1]} px={PX9} style={{transform: `scale(${pxPop(f, A ? b[6] + 6 : b[7] + 14)})`}} />}
              {Bo && Bt >= 0 && Bt < 16 && (
                <div style={{position: 'absolute', left: mouthCup[0], top: mouthCup[1]}}>
                  <Sprite rows={PP_SP.dust} px={PX9} pal={{k: '#8C84B0'}} />
                </div>
              )}
              {/* B: dotted trail table → hand */}
              {Bo && Bt >= 2 && Bt < 30 &&
                Array.from({length: 6}, (_, i) => {
                  const k = (i + 1) / 7;
                  return <div key={i} style={{position: 'absolute', left: snap(CUP_ON_TABLE[0] + 30 + (mouthCup[0] - CUP_ON_TABLE[0]) * k, 6), top: snap(CUP_ON_TABLE[1] + 20 + (mouthCup[1] - CUP_ON_TABLE[1]) * k - 60 * Math.sin(k * Math.PI), 6), width: 12, height: 12, background: PP.pink}} />;
                })}
              {/* 可杯子已经放下了: the magnifier finds the cup on the table */}
              {f >= b[4] && f < b[5] && (
                <>
                  <div style={{position: 'absolute', left: CUP_ON_TABLE[0] - 12, top: CUP_ON_TABLE[1] - 12, width: 7 * PX9 + 24, height: 6 * PX9 + 24, boxShadow: `0 0 0 6px ${PP.pink}`, opacity: blink(f, 10) ? 1 : 0.4}} />
                  <div style={{position: 'absolute', left: CUP_ON_TABLE[0] + 50, top: CUP_ON_TABLE[1] - 110, transform: `scale(${pxPop(f, b[4] + 2)})`}}>
                    <Sprite name="magnifier" px={7} />
                  </div>
                  <div style={{position: 'absolute', left: 700, top: 640, transform: `scale(${pxPop(f, b[4] + 6)})`}}>
                    <Tag bg={PP.pink} fg="#fff" size={48}>
                      ？
                    </Tag>
                  </div>
                </>
              )}
              {/* both cups flagged in A, the jump flagged in B */}
              {(A || (Bo && Bt >= 6)) &&
                (A ? [CUP_ON_TABLE, mouthCup] : [mouthCup]).map(([x, y], i) => (
                  <div key={i} style={{position: 'absolute', left: x - 12, top: y - 12, width: 7 * PX9 + 24, height: 6 * PX9 + 24, boxShadow: `0 0 0 6px ${PP.pink}`, opacity: blink(f, 10) ? 1 : 0.4}} />
                ))}
            </>
          )}
          {/* captions under the room */}
          <div style={{position: 'absolute', left: 100, top: 1030, width: 860, display: 'flex', gap: 18, justifyContent: 'center'}}>
            {f < b[4] &&
              steps.map((s) =>
                f >= s.f0 ? (
                  <div key={s.t} style={{transform: `scale(${pxPop(f, s.f0)})`}}>
                    <Tag size={36}>{s.t}</Tag>
                  </div>
                ) : null,
              )}
            {f >= b[4] && f < b[5] && (
              <div style={{transform: `scale(${pxPop(f, b[4] + 4)})`}}>
                <Tag bg={PP.pink} fg="#fff" size={48}>
                  杯子还在桌上
                </Tag>
              </div>
            )}
            {A && (
              <div style={{transform: `scale(${pxPop(f, b[6] + 4)})`}}>
                <Tag bg={PP.pink} fg="#fff" size={48}>
                  要么：多出一个杯子
                </Tag>
              </div>
            )}
            {Bo && (
              <div style={{transform: `scale(${pxPop(f, b[7] + 4)})`}}>
                <Tag bg={PP.pink} fg="#fff" size={48}>
                  要么：杯子瞬移
                </Tag>
              </div>
            )}
          </div>
          {/* the video AI has to make something up */}
          {f >= b[5] && f < b[6] && (
            <>
              <Mascot src={WHALE.still} x={250} y={1186} s={0.26} />
              <div style={{position: 'absolute', left: 340, top: 1050, transform: `scale(${pxPop(f, b[5] + 8)})`, transformOrigin: '0 100%'}}>
                <Bubble tail="left">只能硬编……</Bubble>
              </div>
            </>
          )}
          {(A || Bo) && (
            <div style={{position: 'absolute', left: 860, top: 500, transform: `scale(${pxPop(f, A ? b[6] + 8 : b[7] + 16)})`}}>
              <Sprite name="bug" px={6} />
            </div>
          )}
        </>
      )}
      {/* reasonableness bars */}
      {bars && (
        <>
          <div style={{position: 'absolute', left: 100, top: 470, transform: `scale(${pxPop(f, b[8])})`}}>
            <PixelWindow w={860} h={700} title="合理性拿到 4 分以上的比例" />
          </div>
          {[
            {n: '最早的版本', v: v1, c: '#B7AEDB', x: 230, f0: b[8] + 20},
            {n: '一路改进后', v: v2, c: '#3CC47C', x: 590, f0: b[9] + 4},
          ].map((r) => {
            const hgt = snap((r.v / 100) * 440, 6);
            return (
              <div key={r.n} style={{position: 'absolute', left: r.x, top: 600, width: 240, height: 520, opacity: f >= r.f0 - 6 ? 1 : 0}}>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, height: hgt, background: r.c, boxShadow: `0 0 0 5px ${PP.ink}`}} />
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 60 + hgt + 14, textAlign: 'center'}}>
                  <PixelText size={60} color={PP.ink}>
                    {Math.floor(r.v)}%
                  </PixelText>
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center'}}>
                  <PixelText size={36}>{r.n}</PixelText>
                </div>
              </div>
            );
          })}
          {f >= b[9] + 32 && (
            <div style={{position: 'absolute', left: 150, top: 622, transform: `scale(${pxPop(f, b[9] + 32)}) rotate(-4deg)`}}>
              <Tag bg="#F6C445" size={36}>
                LEVEL UP
              </Tag>
            </div>
          )}
          {f >= b[9] + 40 && (
            <div style={{position: 'absolute', left: 150, top: 560, transform: `scale(${pxPop(f, b[9] + 40)})`, zIndex: 1}}>
              <Stars n={Math.min(3, Math.floor((f - b[9] - 40) / 5) + 1)} total={3} px={5} />
            </div>
          )}
          <Credit f={f - b[8]}>出处：可灵技术报告 表 13（69.17% → 91.92%）</Credit>
        </>
      )}
      {room && <Credit f={f - b[2]}>出处：可灵技术报告 5.2 节的例子（画面为示意）</Credit>}
    </Screen>
  );
};
