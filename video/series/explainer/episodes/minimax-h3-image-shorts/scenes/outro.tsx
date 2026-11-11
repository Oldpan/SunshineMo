// 11 · E 杂志编辑排版 · where to get it and the licence catch, then the sign-off and the end animation.
// Beat 0: open weights (Hugging Face) + 海螺 / MiniMax 开放平台. Beat 1: the licence excludes the EU, UK, Korea and
// the US (chips struck one by one) + the 「Powered by」 notice. Beat 2: 「我是老潘 · 下期再见」; then, in the hold,
// the fifteen official samples swirl into a contact sheet, a flash fires, and a camera iris closes on the page.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, Center, clamp01, EASE, EditorialStage, EKicker, HERO15, lerp, Mono, Pic, pop, prog, rise, Sans, Serif, slam, useSub, V} from './common';

const Card: React.FC<{x: number; y: number; w: number; f: number; title: string; sub: string; hi?: boolean}> = ({x, y, w, f, title, sub, hi}) => (
  <Abs x={x} y={y} w={w} style={{...rise(f, 0, 30)}}>
    <div style={{border: `3px solid ${V.ink}`, background: hi ? V.ink : '#fff', padding: '18px 24px', boxShadow: '8px 8px 0 rgba(22,22,22,0.12)'}}>
      <Sans size={44} w={900} color={hi ? V.paper : V.ink}>
        {title}
      </Sans>
      <div>
        <Mono size={22} color={hi ? '#CFC8BC' : V.grey}>
          {sub}
        </Mono>
      </div>
    </div>
  </Abs>
);

const Chip: React.FC<{x: number; y: number; f: number; label: string}> = ({x, y, f, label}) => (
  <Abs x={x} y={y} style={pop(f, 0, 0.5)}>
    <div style={{position: 'relative', border: `3px solid ${V.red}`, padding: '6px 22px', background: '#fff'}}>
      <Sans size={44} w={900} color={V.red}>
        {label}
      </Sans>
      <svg width={200} height={80} style={{position: 'absolute', left: -6, top: -6, overflow: 'visible'}}>
        <line x1={0} y1={64} x2={lerp(0, 150, EASE(prog(f, 10, 8)))} y2={lerp(64, 4, EASE(prog(f, 10, 8)))} stroke={V.red} strokeWidth={6} strokeLinecap="round" />
      </svg>
    </div>
  </Abs>
);

/** Six-bladed camera iris: dark page with a hexagonal aperture of radius r, blades rotating by `rot`. */
const Iris: React.FC<{r: number; rot: number}> = ({r, rot}) => {
  const cx = 540;
  const cy = 720;
  const pts = Array.from({length: 6}, (_, i) => {
    const a = rot + (i * Math.PI) / 3;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  // six radial trapezoids cover everything outside the hexagon; each is one blade
  const far = 2600;
  const out = (i: number) => {
    const a = rot + (i * Math.PI) / 3;
    return [pts[i % 6][0] + far * Math.cos(a), pts[i % 6][1] + far * Math.sin(a)];
  };
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {pts.map((p, i) => {
        const q = pts[(i + 1) % 6];
        const o1 = out(i);
        const o2 = out(i + 1);
        const d = `M${p[0]} ${p[1]} L${q[0]} ${q[1]} L${o2[0]} ${o2[1]} L${o1[0]} ${o1[1]} Z`;
        return <path key={i} d={d} fill={i % 2 ? '#181512' : '#1F1B17'} stroke="#3A332C" strokeWidth={3} />;
      })}
    </svg>
  );
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const apps = sub(0, 1);
  const more = sub(1, 1);
  const bye = b[2];
  const clear = 1 - prog(bye, 12);
  // end animation timeline (frames after the sign-off beat)
  const sheet = bye - 40; // thumbnails swirl in
  const flash = bye - 110;
  const iris = bye - 118;
  const r = 1300 * Math.pow(1 - clamp01(iris / 44), 1.8); // shutter: slow start, snaps shut
  return (
    <EditorialStage>
      {clear > 0 && (
        <div style={{opacity: clear}}>
          <EKicker f={b[0]}>开源 · 怎么用 · 注意</EKicker>
          <Abs x={100} y={330}>
            <div style={slam(b[0], 0, 1.6)}>
              <Serif size={76} w={900} color={V.ink}>
                权重已经开源
              </Serif>
            </div>
          </Abs>
          <Card x={100} y={448} w={880} f={b[0] - 10} title="Hugging Face" sub="MiniMaxAI / MiniMax-H3-Image" hi />
          {apps >= 0 && (
            <>
              <Card x={100} y={600} w={420} f={apps} title="海螺" sub="直接在线用" />
              <Card x={560} y={600} w={420} f={apps - 8} title="开放平台" sub="MiniMax API" />
            </>
          )}
          {b[1] >= 0 && (
            <>
              <Abs x={100} y={790} w={880} h={4} style={{background: V.red, transform: `scaleX(${EASE(prog(b[1], 16))})`, transformOrigin: 'left'}} />
              <Abs x={100} y={812} style={rise(b[1], 4, 20)}>
                <Serif size={56} w={900} color={V.red}>
                  许可证不覆盖
                </Serif>
              </Abs>
              <Chip x={100} y={910} f={sub(1, 0) - 44} label="欧盟" />
              <Chip x={320} y={910} f={more} label="英国" />
              <Chip x={540} y={910} f={more - 14} label="韩国" />
              <Chip x={760} y={910} f={more - 28} label="美国" />
              <Abs x={100} y={1060} style={rise(b[1], 40, 20)}>
                <Sans size={30} w={600} color={V.grey}>
                  用在产品里，还要标注
                </Sans>
                <div>
                  <Mono size={28} color={V.ink} w={700}>
                    Powered by MiniMax-H3-Image
                  </Mono>
                </div>
              </Abs>
            </>
          )}
        </div>
      )}
      {/* sign-off */}
      {bye >= 0 && (
        <Center y={400}>
          <div style={slam(bye, 2, 1.8)}>
            <Serif size={110} w={900} color={V.ink}>
              我是老潘
            </Serif>
          </div>
          <div style={rise(bye, 14, 30)}>
            <Serif size={84} w={900} color={V.red}>
              下期再见
            </Serif>
          </div>
        </Center>
      )}
      {/* end animation: contact sheet of the official samples */}
      {sheet >= 0 &&
        HERO15.map((src, i) => {
          const t = EASE(prog(sheet, 30, i * 3));
          const gx = 120 + (i % 5) * 170;
          const gy = 700 + Math.floor(i / 5) * 104;
          const a = i * 0.42 + (1 - t) * 3.2;
          const rad = (1 - t) * 900;
          const x = gx + Math.cos(a) * rad;
          const y = gy + Math.sin(a) * rad;
          const rot = (1 - t) * (i % 2 ? 90 : -90) + Math.sin((frame + i * 9) / 30) * 1.5;
          return (
            <Abs key={i} x={x} y={y} style={{transform: `rotate(${rot}deg)`, opacity: clamp01(t * 3), border: '5px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,0.25)'}}>
              <Pic src={src} w={150} h={84} f={sheet - i * 3} dur={200} />
            </Abs>
          );
        })}
      {sheet >= 0 && (
        <Abs x={120} y={1030} style={rise(sheet, 40, 20)}>
          <Mono size={22} color={V.grey}>
            MINIMAX H3-IMAGE · 官方样图 15 张
          </Mono>
        </Abs>
      )}
      {flash >= 0 && flash < 14 && <Abs x={0} y={0} w={1080} h={1920} style={{background: '#fff', opacity: 1 - flash / 14}} />}
      {iris >= 0 && <Iris r={r} rot={frame * 0.03} />}
      {iris >= 30 && (
        <Center y={692}>
          <div style={{...pop(iris - 30, 0, 0.6), opacity: clamp01((iris - 30) / 8)}}>
            <Mono size={46} color={V.paper} w={700} style={{letterSpacing: 10 + Math.sin(frame / 10) * 2}}>
              下期再见
            </Mono>
          </div>
        </Center>
      )}
    </EditorialStage>
  );
};
