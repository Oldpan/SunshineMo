// 7 · G 展厅画廊 · 「不只是照片」. The camera walks along the wall past the four paintings of the model card's art
// showcase, in the official order and with the official descriptions (alt text): mandarin ducks in oil, a Jiangnan
// garden in light watercolour, tarot card XVIII THE MOON, a gongbi pelican at a mirror. On 「官方样图里都有」 the wall
// pulls back into a 2×2 hang.
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Abs, Credit, EASE, Frame, GalleryStage, GKicker, IMG, lerp, prog, rise, Serif, Sparkles, useSub, V} from './common';

const ART = [
  {src: IMG.ducks, name: '油画', sub: '荷塘鸳鸯'},
  {src: IMG.shanshui2, name: '水彩', sub: '江南园林'},
  {src: IMG.moonrabbit, name: '塔罗牌插画', sub: 'XVIII THE MOON'},
  {src: IMG.pelican, name: '工笔画', sub: '照影理羽'},
];
const FW = 540;
const FH = 720;
const STEP = 640;
const GW = 300;
const GH = 400;

export const Styles: React.FC = () => {
  const b = useBeats();
  const sub = useSub();
  const all = sub(0, 2); // 官方样图里都有
  // when each painting is named (frames into the scene)
  const at = [b[0] - 24, b[0] - 46, sub(0, 1), sub(0, 1) - 28];
  const idx = at.reduce((n, a) => n + (a >= 0 ? 1 : 0), 0) - 1;
  // pan: ease towards the current painting
  let pan = 0;
  for (let i = 1; i < 4; i++) pan += EASE(prog(at[i], 14)) * STEP;
  const g = EASE(prog(all, 22)); // pull back into the 2×2 hang
  return (
    <GalleryStage spot={860} cy={860}>
      <GKicker f={b[0]}>官方样图 · 不只是照片</GKicker>
      {ART.map((a, i) => {
        // wall position (one row, panning) → grid position
        const wx = 540 - FW / 2 + i * STEP - pan;
        const wy = 450;
        const gw = GW;
        const gh = GH;
        const gx = i % 2 === 0 ? 540 - gw - 20 : 560;
        const gy = 410 + Math.floor(i / 2) * (gh + 26);
        const x = lerp(wx, gx, g);
        const y = lerp(wy, gy, g);
        const w = lerp(FW, gw, g);
        const h = lerp(FH, gh, g);
        return <Frame key={i} x={x} y={y} w={w} h={h} src={a.src} f={b[0]} delay={6} z1={1.06} />;
      })}
      {/* placard of the painting in view */}
      {idx >= 0 && all < 0 && (
        <div key={idx} style={{position: 'absolute', left: 0, width: 1080, top: 1196, textAlign: 'center', ...rise(at[idx], 0, 20)}}>
          <div style={{display: 'inline-block', background: V.card, padding: '8px 26px', boxShadow: '0 10px 24px rgba(0,0,0,0.5)'}}>
            <Serif size={44} w={800} color="#1A1A1A">
              {ART[idx].name}
            </Serif>
            <Serif size={26} w={600} color="#6B6157" style={{marginLeft: 16}}>
              {ART[idx].sub}
            </Serif>
          </div>
        </div>
      )}
      {all >= 0 && (
        <>
          {ART.map((a, i) => {
            const gx = i % 2 === 0 ? 540 - GW - 20 : 560;
            const gy = 410 + Math.floor(i / 2) * (GH + 26);
            return (
              <Abs key={i} x={gx + 10} y={gy + GH - 54} style={{...rise(all, 14 + i * 4, 14)}}>
                <span style={{fontFamily: '"Noto Serif SC", serif', fontSize: 28, fontWeight: 800, color: '#1A1A1A', background: V.goldHi, padding: '3px 14px'}}>{a.name}</span>
              </Abs>
            );
          })}
          <Sparkles x={540} y={840} f={all - 14} n={10} color={V.goldHi} r={420} />
        </>
      )}
      <Credit y={1262} color="rgba(242,237,226,0.5)" />
    </GalleryStage>
  );
};
