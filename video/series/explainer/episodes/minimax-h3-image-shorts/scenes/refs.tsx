// 9 · G 展厅画廊 · multi-reference (up to 16 images). Beat 0: sixteen slots fill on the wall under 「16 张参考图」.
// Beat 1: the official editing example — the empty room and nine furniture cut-outs hang as small tiles; on
// 「拼成了一个客厅」 each piece flies to where it stands in the official result while the room grows into the frame.
import React from 'react';
import {Img} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, Center, clamp01, Credit, EASE, FURN, GalleryStage, GKicker, HERO15, IMG, lerp, Num, Pic, Placard, pop, prog, rise, Serif, slam, Sparkles, useSub, V} from './common';

const LX = 110;
const LY = 600;
const LW = 860;
const LH = 484;
/** Where each cut-out stands in the official living-room result (fractions of the picture). */
const SPOT: [number, number][] = [
  [0.5, 0.5],
  [0.38, 0.74],
  [0.19, 0.78],
  [0.59, 0.83],
  [0.45, 0.8],
  [0.75, 0.85],
  [0.5, 0.66],
  [0.9, 0.7],
  [0.84, 0.7],
  [0.71, 0.62],
];
const TS = 160;
const tile = (i: number) => ({x: 110 + (i % 5) * 175, y: 640 + Math.floor(i / 5) * 185});

export const Refs: React.FC = () => {
  const b = useBeats();
  const sub = useSub();
  const set = b[1];
  const merge = sub(1, 1);
  const m = EASE(prog(merge, 26));
  return (
    <GalleryStage spot={860} cy={860}>
      <GKicker f={b[0]}>官方样图 · 多图参考</GKicker>
      {/* headline: 16 张参考图 → 一间空房 + 9 件家具 → 一个客厅 */}
      <Center y={380} style={{opacity: 1 - prog(set, 10)}}>
        <div style={slam(b[0], 0, 2)}>
          <Num size={150} color={V.goldHi} style={{textShadow: '0 0 40px rgba(233,201,135,0.45)'}}>
            16
          </Num>
          <Serif size={60} w={800} color={V.cream} style={{marginLeft: 16}}>
            张参考图
          </Serif>
        </div>
      </Center>
      {set >= 0 && (
        <Center y={400}>
          <div style={{opacity: 1 - prog(merge, 10)}}>
            <div style={rise(set, 0, 24)}>
            <Serif size={58} w={800} color={V.cream}>
              一间空房 + 9 件家具
            </Serif>
            </div>
          </div>
        </Center>
      )}
      {merge >= 0 && (
        <Center y={400}>
          <div style={slam(merge, 4, 1.6)}>
            <Serif size={64} w={900} color={V.goldHi}>
              拼成一个客厅
            </Serif>
          </div>
        </Center>
      )}
      {/* beat 0: sixteen slots */}
      {set < 14 && (
        <div style={{opacity: 1 - prog(set, 12)}}>
          {Array.from({length: 16}, (_, i) => {
            const x = 216 + (i % 4) * 166;
            const y = 600 + Math.floor(i / 4) * 116;
            const f = b[0] - 8 - i * 3;
            return (
              <Abs key={i} x={x} y={y} w={150} h={100} style={{border: `2px solid ${V.gold}`, boxSizing: 'border-box', background: '#0C0B0A'}}>
                <div style={{...pop(f, 0, 0.3)}}>
                  <Pic src={HERO15[i % HERO15.length]} w={146} h={96} f={f} dur={200} />
                </div>
                <div style={{position: 'absolute', right: 4, bottom: 2, opacity: clamp01(f / 6)}}>
                  <Num size={22} color={V.goldHi}>
                    {i + 1}
                  </Num>
                </div>
              </Abs>
            );
          })}
        </div>
      )}
      {/* beat 1: the official living room grows in */}
      {merge >= 0 && (
        <Abs x={LX} y={LY - 20} w={LW} h={LH} style={{opacity: prog(merge, 14, 10), outline: `3px solid ${V.gold}`, border: '12px solid #0C0B0A', boxShadow: '0 36px 70px rgba(0,0,0,0.75)'}}>
          <Pic src={IMG.livingroom} w={LW - 24} h={LH - 24} f={merge} dur={160} z0={1.02} z1={1.08} />
        </Abs>
      )}
      {set >= 0 &&
        FURN.map((src, i) => {
          const t = tile(i);
          const [fx, fy] = SPOT[i];
          // room tile grows into the frame; furniture flies to its spot and shrinks into the picture
          const room = i === 0;
          const tx = room ? LX : LX + fx * LW - 30;
          const ty = room ? LY - 20 : LY - 20 + fy * LH - 30;
          const tw = room ? LW : 60;
          const th = room ? LH : 60;
          const mi = EASE(prog(merge, 22, room ? 0 : 4 + i * 2));
          const x = lerp(t.x, tx, mi);
          const y = lerp(t.y, ty, mi);
          const w = lerp(TS, tw, mi);
          const h = lerp(TS, th, mi);
          const fade = room ? 1 - prog(merge, 10, 18) : 1 - prog(merge, 8, 20 + i * 2);
          return (
            <Abs key={i} x={x} y={y} w={w} h={h} style={{...pop(set, 4 + i * 3, 0.4), opacity: clamp01((pop(set, 4 + i * 3, 0.4).opacity as number) * fade), background: '#fff', outline: `2px solid ${V.gold}`, boxShadow: '0 12px 26px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
              <Img src={src} style={{width: '100%', height: '100%', objectFit: room ? 'cover' : 'contain', padding: room ? 0 : 6, boxSizing: 'border-box'}} />
            </Abs>
          );
        })}
      {set >= 0 && merge < 0 && (
        <>
          <Placard x={110} y={1040} f={set} delay={10} title="参考 1 · 空房" />
          <Placard x={430} y={1040} f={set} delay={30} title="参考 2–10 · 家具" />
        </>
      )}
      {merge >= 0 && <Placard x={110} y={1110} f={merge} delay={30} title="生成结果 · 一张图里全用上" hi />}
      <Sparkles x={540} y={840} f={merge - 24} n={10} color={V.goldHi} r={380} />
      <Credit y={1262} color="rgba(242,237,226,0.5)" />
    </GalleryStage>
  );
};
