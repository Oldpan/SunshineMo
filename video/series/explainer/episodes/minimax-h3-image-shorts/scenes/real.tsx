// 6 · F 胶片暗房 · the aesthetic goal from the blog (「有别于常见的 AI 感」). Three official photoreal samples ride a
// film strip under the safelight; each one develops (dark sepia → full colour) as it lands. The grease pencil rings
// the flamingos' reflections on 「细节多」.
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Abs, Credit, DarkroomStage, DKicker, EASE, FilmFrame, Grease, IMG, pop, prog, rise, Sans, Serif, slam, useSub, V} from './common';

const X = 110;
const Y = 560;
const W = 860;
const H = 483;
const GAP = 920;
const SHOTS = [
  {src: IMG.laundry, label: 'H3-IMAGE · 01', fy: 0.5},
  {src: IMG.tea, label: 'H3-IMAGE · 02', fy: 0.35},
  {src: IMG.flamingo, label: 'H3-IMAGE · 03', fy: 0.6},
];

export const Real: React.FC = () => {
  const b = useBeats();
  const sub = useSub();
  const quote = sub(0, 1);
  const land = [b[0] + 0, b[1], b[1] - 42];
  const shift = (EASE(prog(land[1], 20)) + EASE(prog(land[2], 20))) * GAP;
  const detail = sub(1, 1);
  return (
    <DarkroomStage>
      <DKicker f={b[0]}>官方博客 · 美学目标</DKicker>
      <Abs x={100} y={384} w={880}>
        {quote < 0 ? (
          <div style={rise(b[0], 6, 24)}>
            <Serif size={60} w={800} color={V.warm}>
              官方最想做的
            </Serif>
          </div>
        ) : (
          <div style={slam(quote, 0, 1.6)}>
            <Serif size={66} w={900} color={V.warm}>
              「有别于常见的
              <span style={{color: V.safe}}> AI 感</span>」
            </Serif>
          </div>
        )}
      </Abs>
      {SHOTS.map((s, i) => (
        <FilmFrame key={i} x={X + i * GAP - shift} y={Y} w={W} h={H} src={s.src} f={b[0] + 4} fy={s.fy} z1={1.06} label={s.label} dev={prog(land[i], 34, 6)} />
      ))}
      <Grease cx={X + 0.3 * W} cy={Y + 0.86 * H} rx={150} ry={60} p={prog(detail, 18)} />
      {detail >= 0 && (
        <Abs x={X + 0.3 * W + 150} y={Y + 0.86 * H - 120} style={pop(detail, 12)}>
          <span style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 34, fontWeight: 800, color: V.dark, background: V.safe, padding: '6px 18px', borderRadius: 8}}>倒影 · 水纹</span>
        </Abs>
      )}
      {b[1] >= 0 && (
        <Abs x={100} y={1172} style={rise(b[1], 30, 24)}>
          <Sans size={44} w={800} color={V.peach}>
            写实照片 · 像真拍的
          </Sans>
        </Abs>
      )}
      <Credit y={1258} color="rgba(255,243,234,0.5)" />
    </DarkroomStage>
  );
};
