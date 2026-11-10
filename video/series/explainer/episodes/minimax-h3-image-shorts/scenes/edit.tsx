// 10 · F 胶片暗房 · image editing that travels far. Two official before/after pairs develop on the darkroom strip:
// a game map (grease pencil rings the red arrow) → the first-person view from that arrow; an untextured white
// model → a moon-base film still. When the result develops, the original drops into an inset 「原图」.
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Abs, Credit, DarkroomStage, DKicker, EASE, FilmFrame, Grease, IMG, Pic, pop, prog, rise, Sans, Serif, slam, useSub, V} from './common';

const BX = 110;
const BY = 600;
const BW = 860;
const BH = 483;

const Pair: React.FC<{src: string; out: string; start: number; swap: number; end: number; fy?: number; label: string; caption: string}> = ({src, out, start, swap, end, fy = 0.5, label, caption}) => {
  if (start < 0) return null;
  const gone = prog(end, 12);
  if (gone >= 1) return null;
  const sw = prog(swap, 12);
  return (
    <div style={{opacity: 1 - gone}}>
      <div style={{opacity: 1 - sw}}>
        <FilmFrame x={BX} y={BY} w={BW} h={BH} src={src} f={start} fy={fy} z1={1.02} label={`${label} · 原图`} dev={prog(start, 30, 4)} />
      </div>
      {swap >= 0 && (
        <>
          <div style={{opacity: sw}}>
            <FilmFrame x={BX} y={BY} w={BW} h={BH} src={out} f={swap + 60} z1={1.08} label={`${label} · 改后`} dev={prog(swap, 36, 6)} />
          </div>
          {/* the original drops into an inset */}
          <Abs x={BX + 20} y={BY + 20} style={{...pop(swap, 14, 0.6), border: `4px solid ${V.warm}`, boxShadow: '0 10px 30px rgba(0,0,0,0.7)'}}>
            <Pic src={src} w={280} h={176} f={0} dur={1} fy={fy} />
            <div style={{position: 'absolute', left: 0, bottom: 0, background: V.safe, padding: '2px 10px'}}>
              <Sans size={22} w={900} color={V.dark}>
                原图
              </Sans>
            </div>
          </Abs>
          <Abs x={100} y={1170} style={rise(swap, 20, 20)}>
            <Sans size={40} w={800} color={V.peach}>
              {caption}
            </Sans>
          </Abs>
        </>
      )}
    </div>
  );
};

export const Edit: React.FC = () => {
  const b = useBeats();
  const sub = useSub();
  const arrow = sub(1, 1);
  const swap1 = arrow - 30;
  const swap2 = sub(2, 1);
  const reach = EASE(prog(b[0], 26, 6));
  // map_in (1.5:1) inside the 16:9 frame with fy 0.85: image height 573, top crop 76 px
  const ax = BX + 0.38 * BW;
  const ay = BY + 0.855 * 573 - 76;
  return (
    <DarkroomStage>
      <DKicker f={b[0]}>官方样图 · 改图</DKicker>
      <Abs x={100} y={384}>
        <div style={slam(b[0], 0, 1.6)}>
          <Serif size={72} w={900} color={V.warm}>
            改图也能
            <span style={{color: V.safe}}>跨很远</span>
          </Serif>
        </div>
      </Abs>
      {/* beat 0: a long reach from 改前 to 改后 */}
      {b[1] < 12 && (
        <div style={{opacity: 1 - prog(b[1], 12)}}>
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <path d="M170 900 Q540 600 910 900" fill="none" stroke={V.safe} strokeWidth={8} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - reach)} style={{filter: `drop-shadow(0 0 10px ${V.safe})`}} />
            {reach > 0.95 && <path d="M910 900 L880 862 L866 900 Z" fill={V.safe} />}
          </svg>
          <Abs x={110} y={930} style={pop(b[0], 4)}>
            <Sans size={44} w={900} color={V.warm}>
              改前
            </Sans>
          </Abs>
          <Abs x={860} y={930} style={pop(b[0], 26)}>
            <Sans size={44} w={900} color={V.warm}>
              改后
            </Sans>
          </Abs>
        </div>
      )}
      <Pair src={IMG.mapIn} out={IMG.mapOut} start={b[1]} swap={swap1} end={b[2]} fy={0.85} label="游戏地图" caption="游戏地图 → 红箭头处的第一人称画面" />
      {b[1] >= 0 && swap1 < 0 && <Grease cx={ax} cy={ay - 20} rx={80} ry={100} p={prog(arrow, 18)} />}
      {arrow >= 0 && swap1 < 0 && (
        <Abs x={ax + 100} y={ay - 150} style={pop(arrow, 10)}>
          <span style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 34, fontWeight: 800, color: V.dark, background: V.safe, padding: '6px 18px', borderRadius: 8}}>从这里看出去</span>
        </Abs>
      )}
      <Pair src={IMG.renderIn} out={IMG.renderOut} start={b[2]} swap={swap2} end={-1} label="白模" caption="没贴材质的白模 → 月球基地电影剧照" />
      <Credit y={1258} color="rgba(255,243,234,0.5)" />
    </DarkroomStage>
  );
};
