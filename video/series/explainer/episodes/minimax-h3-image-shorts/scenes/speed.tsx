// 3 · V 数据叙事 · the blog's speed chart (4K text-to-image, P50 seconds) redrawn to scale as three bars, then the price
// claims: 50–70 % of comparable tools, and half price for 4K in launch week (price table: ¥0.4522 → ¥0.2261 per image).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, Burst, DataStage, HBar, Mono, Num, prog, rise, Sans, slam, useSub, V} from './common';

const MAX = 50;
const W = 560;

export const Speed: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const std = sub(1, 0);
  const hs = sub(1, 1);
  const nb = sub(1, 2);
  const price = b[2];
  const half = sub(2, 1);
  const up = prog(price, 16) * 60;
  return (
    <DataStage>
      <Abs x={100} y={330} style={rise(b[0], 0, 20)}>
        <Mono size={26} color={V.purple} w={700}>
          官方博客 · 出图耗时对比 · P50
        </Mono>
      </Abs>
      <Abs x={100} y={380} style={rise(b[0], 6, 24)}>
        <Sans size={68} w={900} color={V.slate}>
          出一张 4K 图要多久
        </Sans>
      </Abs>
      <div style={{position: 'absolute', left: 0, top: -up, width: 1080, height: 1920}}>
        {[530, 660, 790].map((y, i) =>
          [std, hs, nb][i] >= 30 ? null : (
            <Abs key={y} x={110} y={y + 54} w={W} h={62} style={{background: '#EEEBF4', borderRadius: '0 10px 10px 0', opacity: prog(b[0], 16, 14 + i * 6) * (1 - prog([std, hs, nb][i], 30))}} />
          ))}
        {['H3-Image 标准版', 'H3-Image 极速版', 'Nano Banana 2.1'].map((t, i) =>
          [std, hs, nb][i] >= 0 ? null : (
            <Abs key={t} x={110} y={530 + i * 130} style={rise(b[0], 14 + i * 6, 16)}>
              <Sans size={34} w={800} color={V.mute}>
                {t}
              </Sans>
            </Abs>
          ))}
        <HBar x={110} y={530} w={W} v={16.0} max={MAX} p={prog(std, 30)} label="H3-Image 标准版" />
        <HBar x={110} y={660} w={W} v={10.3} max={MAX} p={prog(hs, 26)} label="H3-Image 极速版" sub="Highspeed" color="#4B23B8" />
        <HBar x={110} y={790} w={W} v={50.0} max={MAX} p={prog(nb, 40)} label="Nano Banana 2.1" sub="thinking · medium" color="#B9B5C4" />
        <Abs x={110} y={915} style={{opacity: prog(nb, 20, 30) * (1 - prog(price, 10))}}>
          <Sans size={24} w={500} color={V.mute}>
            文生图 4096×4096 · 单位秒 · 越短越快
          </Sans>
        </Abs>
      </div>
      {nb >= 0 && price < 0 && <Burst x={110 + W * (16 / MAX) + 150} y={590} f={std - 30} n={14} spread={160} colors={[V.purple, '#B79CFF']} size={14} />}
      {/* price */}
      {price >= 0 && (
        <>
          <Abs x={110} y={930} w={860} style={rise(price, 0, 30)}>
            <div style={{background: V.lilac, borderRadius: 18, padding: '26px 32px'}}>
              <Sans size={34} w={700} color={V.slate}>
                价格是同档工具的
              </Sans>
              <div>
                <Num size={110} color={V.purple}>
                  50%–70%
                </Num>
              </div>
            </div>
          </Abs>
        </>
      )}
      {half >= 0 && (
        <>
          <Abs x={110} y={1140} w={860} style={rise(half, 0, 30)}>
            <Sans size={34} w={700} color={V.slate}>
              4K 标准版 每张
            </Sans>
            <Num size={52} color={V.mute} style={{textDecoration: 'line-through', marginLeft: 14}}>
              ¥0.4522
            </Num>
            <Num size={60} color={V.purple} style={{marginLeft: 14}}>
              ¥0.2261
            </Num>
          </Abs>
          <Abs x={700} y={930} style={{transform: 'rotate(8deg)'}}>
            <div style={slam(half, 4, 2.2)}>
              <div style={{border: `7px solid ${V.purple}`, borderRadius: 18, padding: '10px 22px', background: '#fff', textAlign: 'center'}}>
                <Sans size={34} w={900} color={V.purple}>
                  发布首周
                </Sans>
                <div>
                  <Sans size={58} w={900} color={V.purple}>
                    4K 五折
                  </Sans>
                </div>
              </div>
            </div>
          </Abs>
          <Burst x={820} y={1010} f={half - 6} n={18} spread={220} colors={[V.purple, '#B79CFF', '#FFD166']} size={16} />
        </>
      )}
      <Abs x={100} y={1268} style={{opacity: prog(frame, 20, 30)}}>
        <Sans size={22} w={500} color={V.mute}>
          数据来自 MiniMax 官方博客图表与价格表
        </Sans>
      </Abs>
    </DataStage>
  );
};
