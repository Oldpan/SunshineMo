// 第三关 · 非你不可：别人花钱买的就是你这个人。四种：人就是作品、情绪价值、做的人自己开心、传了上千年的手艺。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {A, LOC, LOCX} from './assets';
import {
  At,
  Bean,
  Bubble,
  Burst,
  Confetti,
  E,
  F_CJK,
  F_ROUND,
  GSSet,
  heartPath,
  Judge,
  K,
  Layer,
  Pop,
  Punch,
  RoundCard,
  RoundTag,
  Screen,
  seg,
  ShadowCard,
  SO,
  Stamp,
  starPath,
  Sticker,
  Telop,
  TelopDiv,
  useBeatFrames,
  useKit,
} from './common';

const COL = K.pink;
const FLOOR = 870;
const R3Tag = () => <RoundTag n={3} name="非你不可" col={COL} />;
const KINDS = [
  {n: '①', t: '人就是作品', c: K.yellow},
  {n: '②', t: '情绪价值', c: K.pink},
  {n: '③', t: '自己开心', c: K.lime},
  {n: '④', t: '千年手艺', c: K.sky},
];

/** Kind label used at the top of each sub-scene. */
const KindTag: React.FC<{i: number; f0?: number}> = ({i, f0 = 0}) => (
  <Pop f0={f0} x={960} y={200}>
    <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
      <Sticker text={`第 ${i + 1} 种：${['人就是作品', '给人情绪价值', '做的人自己开心', '传了上千年的手艺'][i]}`} size={56} col={KINDS[i].c} rot={-2} />
    </div>
  </Pop>
);

const Notes: React.FC<{x: number; y: number; f: number; n?: number}> = ({x, y, f, n = 4}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const t = (((f + i * 18) % 72) + 72) % 72 / 72;
      return (
        <g key={i} transform={`translate(${x + Math.sin(t * 6 + i) * 40 + i * 30} ${y - t * 220})`} opacity={1 - t}>
          <Telop x={0} y={0} size={60} fill={[K.yellow, K.white, K.pink, K.lime][i % 4]} sw={7} family={F_ROUND} weight={700}>
            ♪
          </Telop>
        </g>
      );
    })}
  </g>
);

// ------------------------------------------------------------------ round card
export const R3Card: React.FC = () => {
  useKit();
  const {b, at} = useBeatFrames();
  return (
    <AbsoluteFill>
      <Punch hits={[...at, 4]}>
        <GSSet set="pink" pattern="rays" floor={FLOOR} curtain={K.purple} />
        <Layer>
          <Bean x={190} y={FLOOR} scale={0.75} color={K.yellow} belly={K.cream} item="mic" ant="star" hop={20} hey={1} open />
          <Bean x={1730} y={FLOOR} scale={0.75} color={K.purple} belly="#B9A6F0" item="brush" hat="beret" hop={20} phase={0.5} hey={1} open />
        </Layer>
        <RoundCard num={3} name="非你不可" tag="别人花钱，买的就是你这个人" col={COL} f0={2} f1={at[1] + 4} />
        {b[1] >= 0 &&
          KINDS.map((k, i) => (
            <Pop key={i} f0={at[1] + 6 + i * 8} x={260 + i * 360} y={330} from="drop" rot={(i % 2 ? 3 : -3)}>
              <ShadowCard w={320} h={300} col={k.c} r={30} off={12}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 80, color: K.ol}}>{k.n}</div>
                  <TelopDiv size={50} style={{marginTop: 10}}>
                    {k.t}
                  </TelopDiv>
                </div>
              </ShadowCard>
            </Pop>
          ))}
        {b[1] >= 0 && (
          <Pop f0={at[1] + 2} x={960} y={200}>
            <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
              <Sticker text="买的就是你这个人" size={52} col={K.white} rot={-2} />
            </div>
          </Pop>
        )}
        <Layer>
          <Burst x={1420} y={210} f0={14} size={1.1} />
          <Confetti f0={10} dur={40} n={60} seed={13} />
        </Layer>
      </Punch>
      {b[1] >= 0 && <R3Tag />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ ① 人就是作品
export const R3Art: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="pink" pattern="stripes" floor={FLOOR} />
        {ph === 0 && (
          <>
            <KindTag i={0} />
            <Layer>
              {/* gallery frame with a bean as the artwork */}
              <g transform={`translate(960 560) scale(${E.back(seg(b[0], 6, 16))})`}>
                <rect x={-260} y={-230} width={520} height={460} rx={10} fill={K.yellow} {...SO} strokeWidth={10} />
                <rect x={-210} y={-180} width={420} height={360} fill={K.cream} {...SO} strokeWidth={6} />
                <Bean x={0} y={150} scale={1.3} color={K.pink} belly={K.cream} ant="star" hey={0.4} hop={0} face="up" />
              </g>
              <g transform="translate(960 830)">
                <rect x={-120} y={-24} width={240} height={48} rx={8} fill={K.white} {...SO} strokeWidth={5} />
                <Telop x={0} y={12} size={30} fill={K.ol} sw={0}>
                  作品：本人
                </Telop>
              </g>
            </Layer>
          </>
        )}
        {ph === 1 && (
          <>
            <Layer>
              <g transform={`translate(640 540) rotate(-3) scale(${E.back(seg(b[1], 0, 10))})`}>
                <rect x={-300} y={-250} width={600} height={500} rx={10} fill={K.wood} {...SO} strokeWidth={10} />
                <rect x={-250} y={-200} width={500} height={400} fill={K.white} {...SO} strokeWidth={6} />
                {/* abstract shapes, no real painting reproduced */}
                <path d="M -220 160 L -80 -150 L 40 120 Z" fill={K.blue} {...SO} strokeWidth={6} />
                <circle cx={110} cy={-60} r={90} fill={K.yellow} {...SO} strokeWidth={6} />
                <rect x={20} y={40} width={200} height={130} fill={K.red} {...SO} strokeWidth={6} transform="rotate(12 120 105)" />
              </g>
              <Bean x={1200} y={FLOOR} scale={1.35} color={K.purple} belly="#B9A6F0" hat="beret" item="brush" hop={12} name="毕加索" />
            </Layer>
            <Pop f0={at[1] + 20} x={300} y={250} rot={-8}>
              <Sticker text="$$$$$" size={64} col={K.yellow} family={F_ROUND} />
            </Pop>
            <Pop f0={at[1] + 50} x={1380} y={300}>
              <ShadowCard w={440} h={220} col={K.cream} r={26}>
                <div style={{padding: '20px 30px', fontFamily: F_CJK, fontWeight: 900, fontSize: 44, color: K.ol, lineHeight: 1.4}}>
                  买的是：
                  <br />
                  一张画 <span style={{color: K.red}}>＋ 这个人</span>
                </div>
              </ShadowCard>
            </Pop>
          </>
        )}
        {ph === 2 && (
          <>
            <Screen src={A.theater} x={150} y={240} w={720} h={560} f0={at[2]} credit={LOC} label="电影院" focus={[50, 35]} tilt={-2} />
            <Layer>
              {[0, 1, 2].map((i) => (
                <Bean key={i} x={1100 + i * 250} y={FLOOR} scale={0.85} color={[K.blue, K.yellow, K.green][i]} belly={K.cream} ant="q" hop={14} phase={i * 0.3} />
              ))}
            </Layer>
            <Pop f0={at[2] + 30} x={1110} y={300}>
              <Bubble w={520} tail="down" size={54}>
                谁演的？
              </Bubble>
            </Pop>
          </>
        )}
        {ph === 3 && <At f0={at[3]}><Stages f={f} b3={b[3]} /></At>}
      </Punch>
      <R3Tag />
    </AbsoluteFill>
  );
};

/** Big stage with a human star and fans; a small side stage with an AI star. */
const Stages: React.FC<{f: number; b3: number}> = ({f, b3}) => (
  <>
    <Layer>
      {/* spotlight */}
      <path d={`M 640 120 L 420 ${FLOOR - 120} L 860 ${FLOOR - 120} Z`} fill={K.yellow} opacity={0.35 + 0.1 * Math.sin(f / 5)} />
      <rect x={300} y={FLOOR - 120} width={680} height={120} rx={10} fill={K.purple} {...SO} />
      <Bean x={640} y={FLOOR - 120} scale={1.25} color={K.pink} belly={K.cream} ant="star" item="mic" hop={16} hey={0.5} open={Math.floor(f / 8) % 2 === 0} name="真人" />
      {[0, 1, 2, 3, 4].map((i) => {
        const t = (((f + i * 13) % 50) + 50) % 50 / 50;
        return <path key={i} d={heartPath(1)} transform={`translate(${420 + i * 110} ${FLOOR - 400 - t * 200}) scale(${1 - t * 0.4})`} fill={K.red} {...SO} strokeWidth={4} opacity={1 - t} />;
      })}
      {/* AI star side stage */}
      <g opacity={b3 >= 60 ? 1 : 0}>
        <rect x={1240} y={FLOOR - 70} width={420} height={70} rx={10} fill={K.navy} {...SO} />
        <Bean x={1450} y={FLOOR - 70} scale={0.9} kind="bot" color={K.steel} belly={K.sky} ant="star" item="mic" hop={14} name="AI 明星" />
      </g>
    </Layer>
    {['演员', '歌手', '偶像'].map((t, i) => (
      <Pop key={t} f0={6 + i * 10} x={1060 + i * 220} y={250} rot={(i - 1) * 4}>
        <Sticker text={t} size={48} col={[K.yellow, K.white, K.lime][i]} />
      </Pop>
    ))}
    {b3 >= 30 && (
      <Stamp f0={30} x={1340} y={450} size={76} col={K.yellow} rot={-4}>
        卖的都是本人
      </Stamp>
    )}
    {b3 >= 120 && (
      <Pop f0={120} x={1100} y={500}>
        <Sticker text="抢不走真人的" size={44} col={K.white} rot={3} />
      </Pop>
    )}
  </>
);

// ------------------------------------------------------------------ ② 情绪价值
export const R3Care: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [5, 4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="pink" pattern="dots" floor={FLOOR} />
        {ph === 0 && (
          <>
            <KindTag i={1} />
            <Layer>
              <g transform={`translate(960 560) scale(${E.back(seg(b[0], 4, 14)) * (1 + 0.06 * Math.sin(f / 4))})`}>
                <path d={heartPath(6)} fill={K.red} {...SO} strokeWidth={10} />
              </g>
              <Bean x={720} y={FLOOR} scale={1.1} color={K.yellow} belly={K.cream} hey={0.8} hop={10} lean={8} face="up" />
              <Bean x={1200} y={FLOOR} scale={1.1} color={K.blue} belly={K.sky} hey={0.8} hop={10} phase={0.5} lean={-8} face="up" />
            </Layer>
          </>
        )}
        {ph === 1 && (
          <>
            <Screen src={A.nurse} x={160} y={230} w={560} h={600} f0={at[1]} credit={LOCX} label="护理（1906）" focus={[50, 40]} tilt={-2} />
            {['护理', '心理咨询', '陪伴老人', '照顾孩子', '助产'].map((t, i) => (
              <Pop key={t} f0={at[1] + 8 + i * 14} x={880 + (i % 2) * 460} y={260 + Math.floor(i / 2) * 190} from="right" rot={(i % 2 ? 3 : -3)}>
                <ShadowCard w={400} h={130} col={[K.yellow, K.white, K.lime, K.sky, K.cream][i]} r={26} off={10}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: F_CJK, fontWeight: 900, fontSize: 56, color: K.ol}}>{t}</div>
                </ShadowCard>
              </Pop>
            ))}
          </>
        )}
        {ph === 2 && (
          <>
            <Layer>
              <g transform={`translate(1220 ${FLOOR})`}>
                <Bean x={0} y={0} scale={1.4} kind="bot" color={K.steel} belly={K.sky} ant="none" hey={0.6} hop={0} lean={Math.sin(f / 7) * 2} />
                {/* stiff smiling mask */}
                <g transform="translate(0 -160)">
                  <ellipse rx={88} ry={70} fill={K.skin} {...SO} strokeWidth={6} />
                  <circle cx={-30} cy={-14} r={9} fill={K.ol} />
                  <circle cx={30} cy={-14} r={9} fill={K.ol} />
                  <path d="M -46 20 Q 0 64 46 20" fill="none" stroke={K.ol} strokeWidth={7} strokeLinecap="round" />
                  <ellipse cx={-50} cy={14} rx={14} ry={8} fill={K.pink} />
                  <ellipse cx={50} cy={14} rx={14} ry={8} fill={K.pink} />
                </g>
              </g>
              <Bean x={560} y={FLOOR} scale={1.3} color={K.orange} belly={K.cream} hey={b[2] >= 70 ? 1 : 0.2} lean={b[2] >= 70 ? -14 : 0} face={b[2] >= 70 ? 'x' : null} open={b[2] >= 70} hop={b[2] >= 70 ? 0 : 10} />
            </Layer>
            <Pop f0={at[2] + 10} x={1320} y={280}>
              <Sticker text="能模仿情绪" size={44} col={K.white} rot={3} />
            </Pop>
            {b[2] >= 60 && (
              <Pop f0={at[2] + 60} x={300} y={300}>
                <Sticker text="有点不自然……" size={46} col={K.yellow} rot={-3} />
              </Pop>
            )}
            {b[2] >= 100 && (
              <Stamp f0={at[2] + 100} x={820} y={480} size={110} col={K.red}>
                别扭！害怕！
              </Stamp>
            )}
          </>
        )}
        {ph === 3 && <At f0={at[3]}><Valley f={b[3]} /></At>}
        {ph === 4 && <At f0={at[4]}><Restaurants f={b[4]} /></At>}
        {ph === 5 && (
          <>
            <Layer>
              <rect x={540} y={FLOOR - 120} width={760} height={30} rx={10} fill={K.wood} {...SO} />
              <rect x={600} y={FLOOR - 90} width={24} height={90} fill={K.wood} {...SO} strokeWidth={6} />
              <rect x={1216} y={FLOOR - 90} width={24} height={90} fill={K.wood} {...SO} strokeWidth={6} />
              <Bean x={780} y={FLOOR - 120} scale={1.0} color={K.yellow} belly={K.cream} hey={0.2} lean={8} hop={0} face="up" hat="none" ant="ball" />
              <Bean x={1060} y={FLOOR - 120} scale={1.0} color={K.purple} belly="#B9A6F0" hey={0.2} lean={-8} hop={0} face="up" />
              <g transform={`translate(920 ${FLOOR - 400 - Math.sin(f / 8) * 12}) scale(${1 + 0.06 * Math.sin(f / 4)})`}>
                <path d={heartPath(2.2)} fill={K.red} {...SO} strokeWidth={6} />
              </g>
              <g opacity={0.9}>
                <Bean x={1640} y={FLOOR} scale={0.8} kind="bot" color={K.steel} belly={K.sky} ant="heart" hop={10} />
              </g>
            </Layer>
            <Pop f0={at[5] + 6} x={140} y={230}>
              <Sticker text="就算模仿得一模一样" size={46} col={K.white} rot={-3} />
            </Pop>
            {b[5] >= 60 && (
              <Stamp f0={at[5] + 60} x={960} y={330} size={96} col={K.yellow}>
                还是想要真人在身边
              </Stamp>
            )}
          </>
        )}
      </Punch>
      <R3Tag />
    </AbsoluteFill>
  );
};

/** Uncanny valley curve (Mori 1970): affinity rises with human-likeness, drops sharply near "almost human". */
const Valley: React.FC<{f: number}> = ({f}) => {
  const X0 = 300;
  const Y0 = 800;
  const W = 1200;
  const H = 460;
  const curve = (t: number) => {
    // 0..1 → affinity 0..1 with a dip around 0.8
    const base = t * 0.75;
    const dip = -1.05 * Math.exp(-Math.pow((t - 0.82) / 0.06, 2));
    const end = t > 0.9 ? (t - 0.9) * 2.5 : 0;
    return base + dip + end;
  };
  const N = 80;
  const p = E.inOut(seg(f, 4, 40));
  let d = '';
  for (let i = 0; i <= N * p; i++) {
    const t = i / N;
    d += `${i ? 'L' : 'M'}${X0 + t * W} ${Y0 - 160 - curve(t) * H * 0.6}`;
  }
  const dotT = 0.6 + 0.22 * E.inOut(seg(f, 40, 60));
  return (
    <>
      <Layer>
        <rect x={X0 - 60} y={230} width={W + 120} height={620} rx={24} fill={K.white} {...SO} />
        <line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke={K.ol} strokeWidth={5} />
        <line x1={X0} y1={Y0} x2={X0} y2={260} stroke={K.ol} strokeWidth={5} />
        <Telop x={X0 + W} y={Y0 + 40} size={30} fill={K.ol} sw={0} anchor="end">
          像人的程度 →
        </Telop>
        <Telop x={X0 + 16} y={290} size={30} fill={K.ol} sw={0} anchor="start">
          好感
        </Telop>
        <path d={d} fill="none" stroke={K.purple} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        {f >= 40 && (
          <g transform={`translate(${X0 + dotT * W} ${Y0 - 160 - curve(dotT) * H * 0.6})`}>
            <circle r={24} fill={K.red} {...SO} strokeWidth={6} />
          </g>
        )}
        <g transform={`translate(${X0 + 0.15 * W} ${Y0 - 20}) scale(0.45)`}>
          <Bean x={0} y={0} kind="bot" color={K.steel} belly={K.sky} ant="bolt" />
        </g>
        <g transform={`translate(${X0 + 0.97 * W} ${Y0 - 20}) scale(0.45)`}>
          <Bean x={0} y={0} color={K.orange} belly={K.cream} />
        </g>
      </Layer>
      <Stamp f0={2} x={960} y={330} size={100} col={K.yellow} rot={-3}>
        恐怖谷效应
      </Stamp>
      {f >= 50 && (
        <Pop f0={50} x={X0 + 0.82 * W - 150} y={Y0 + 0 - 10}>
          <Sticker text="差一点像人" size={34} col={K.red} fg={K.white} rot={0} />
        </Pop>
      )}
    </>
  );
};

/** Fast food kiosk ✓ vs fine dining robot waiter ✕. */
const Restaurants: React.FC<{f: number}> = ({f}) => (
  <>
    <Layer>
      <rect x={958} y={260} width={6} height={FLOOR - 260} fill={K.ol} />
      {/* kiosk */}
      <g transform={`translate(450 ${FLOOR})`}>
        <rect x={-90} y={-360} width={180} height={360} rx={18} fill={K.red} {...SO} />
        <rect x={-66} y={-330} width={132} height={150} rx={10} fill={K.navy} {...SO} strokeWidth={6} />
        <g transform="translate(0 -200) scale(0.42)">
          <Bean x={0} y={0} kind="bot" color={K.steel} belly={null} ant="none" />
        </g>
      </g>
      <Bean x={700} y={FLOOR} scale={0.9} color={K.blue} belly={K.sky} hop={12} hey={0.4} />
      {/* fine dining */}
      <rect x={1200} y={FLOOR - 160} width={440} height={30} rx={10} fill={K.white} {...SO} />
      <rect x={1400} y={FLOOR - 130} width={40} height={130} fill={K.wood} {...SO} strokeWidth={6} />
      <Bean x={1270} y={FLOOR} scale={0.85} color={K.yellow} belly={K.cream} face={f >= 70 ? 'sad' : null} />
      <Bean x={1720} y={FLOOR} scale={1.1} kind="bot" color={K.steel} belly={K.sky} hat="chef" hey={0.5} ant="none" hop={8} />
    </Layer>
    <Pop f0={6} x={300} y={250}>
      <Sticker text="快餐店：机器点单" size={44} col={K.white} rot={-3} />
    </Pop>
    <Pop f0={40} x={1110} y={250}>
      <Sticker text="高级餐厅：机器人服务员" size={44} col={K.white} rot={3} />
    </Pop>
    {f >= 20 && (
      <Stamp f0={20} x={560} y={420} size={110} col={K.lime}>
        ✓
      </Stamp>
    )}
    {f >= 70 && (
      <Stamp f0={70} x={1420} y={430} size={86} col={K.red}>
        味道不对
      </Stamp>
    )}
  </>
);

// ------------------------------------------------------------------ ③ 做的人自己开心
export const R3Joy: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [6, 5, 4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="lime" pattern={ph === 3 ? 'stripes' : 'dots'} floor={FLOOR} />
        {ph === 0 && (
          <>
            <KindTag i={2} />
            <Layer>
              <Bean x={960} y={FLOOR} scale={1.5} color={K.orange} belly={K.cream} hey={0.5 + 0.5 * Math.sin(f / 4)} hop={26} face="up" open lean={Math.sin(f / 6) * 10} />
              <Notes x={1100} y={500} f={f} />
              <Notes x={700} y={520} f={f + 30} n={3} />
            </Layer>
          </>
        )}
        {ph === 1 && (
          <>
            <Screen src={A.football} x={90} y={250} w={560} h={380} f0={at[1]} credit={LOC} label="球员" focus={[50, 60]} tilt={-2} />
            <Screen src={A.dancer} x={690} y={250} w={540} h={380} f0={at[1] + 16} credit={LOC} label="舞者" focus={[50, 72]} zoom={[1.3, 1.45]} />
            <Screen src={A.lab} x={1270} y={250} w={560} h={380} f0={at[1] + 40} credit={LOC} label="科研" focus={[30, 50]} tilt={2} />
            <Pop f0={at[1] + 60} x={960} y={760}>
              <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
                <Sticker text="很多人不为钱也愿意干" size={52} col={K.yellow} rot={-2} />
              </div>
            </Pop>
          </>
        )}
        {ph === 2 && <At f0={at[2]}><SongWriting f={b[2]} /></At>}
        {ph === 3 && (
          <>
            <Layer>
              <rect x={760} y={FLOOR - 10} width={1100} height={20} fill={K.white} opacity={0.8} />
              <Bean x={1300} y={FLOOR} scale={1.2} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hop={20} lean={-10} />
              <g transform={`translate(${1460 + Math.abs(Math.sin(f / 8)) * 160} ${FLOOR - 40 - Math.abs(Math.sin(f / 8)) * 200}) rotate(${f * 12})`}>
                <circle r={36} fill={K.white} {...SO} strokeWidth={6} />
                <path d={starPath(5, 14, 7)} fill={K.ol} />
              </g>
              {/* bench */}
              <rect x={170} y={FLOOR - 110} width={420} height={28} rx={10} fill={K.wood} {...SO} />
              <rect x={210} y={FLOOR - 82} width={22} height={82} fill={K.wood} {...SO} strokeWidth={6} />
              <rect x={528} y={FLOOR - 82} width={22} height={82} fill={K.wood} {...SO} strokeWidth={6} />
              <Bean x={380} y={FLOOR - 110} scale={1.0} color={K.orange} belly={K.cream} face="sad" hop={0} hat="cap" />
            </Layer>
            <Pop f0={at[3] + 6} x={140} y={240}>
              <Sticker text="你：坐在场边看" size={48} col={K.white} rot={-3} />
            </Pop>
            <Pop f0={at[3] + 20} x={1150} y={240}>
              <Sticker text="机器人：替你上场" size={48} col={K.white} rot={3} />
            </Pop>
          </>
        )}
        {ph === 4 && (
          <>
            <Layer>
              <Bean x={760} y={FLOOR} scale={1.5} kind="bot" color={K.steel} belly={K.sky} ant="bolt" item="ball" hop={16} hey={0.6} />
              <Notes x={900} y={460} f={f} n={3} />
            </Layer>
            {['会写歌 ✓', '会踢球 ✓'].map((t, i) => (
              <Pop key={t} f0={at[4] + 10 + i * 18} x={1150} y={360 + i * 170} from="right">
                <Sticker text={t} size={60} col={K.white} rot={(i ? 3 : -3)} />
              </Pop>
            ))}
            <Pop f0={at[4]} x={140} y={240}>
              <Sticker text="不是说 AI 不会" size={46} col={K.yellow} rot={-3} />
            </Pop>
          </>
        )}
        {ph === 5 && (
          <>
            <Layer>
              <rect x={958} y={300} width={6} height={FLOOR - 300} fill={K.ol} />
              <Bean x={500} y={FLOOR} scale={1.2} kind="bot" color={K.steel} belly={K.sky} ant="bolt" item="pen" hop={10} />
              <Bean x={1400} y={FLOOR} scale={1.3} color={K.orange} belly={K.cream} hey={0.5 + 0.5 * Math.sin(f / 5)} hop={22} face="up" open item="mic" />
              <Notes x={1500} y={520} f={f} />
            </Layer>
            <Pop f0={at[5] + 4} x={300} y={300}>
              <Sticker text="AI 做它的" size={50} col={K.white} rot={-3} />
            </Pop>
            <Pop f0={at[5] + 24} x={1180} y={300}>
              <Sticker text="你享受你的" size={50} col={K.yellow} rot={3} />
            </Pop>
            {b[5] >= 50 && (
              <Stamp f0={at[5] + 50} x={960} y={520} size={96} col={K.white}>
                没关系
              </Stamp>
            )}
          </>
        )}
        {ph === 6 && (
          <>
            <Layer>
              <Bean x={760} y={FLOOR} scale={1.5} color={K.orange} belly={K.cream} item="ball" hey={0.3} hop={14} face="up" lean={8} />
              <Bean x={1350} y={FLOOR} scale={1.0} kind="bot" color={K.steel} belly={K.sky} ant="q" hey={0.9} lean={-12} hop={0} />
              <Notes x={600} y={520} f={f} />
            </Layer>
            {b[6] >= 40 && (
              <Stamp f0={at[6] + 40} x={1100} y={330} size={130} col={K.yellow}>
                不让！
              </Stamp>
            )}
          </>
        )}
      </Punch>
      <R3Tag />
    </AbsoluteFill>
  );
};

/** Writing a song note by note vs an AI filling the sheet in one second. */
const SongWriting: React.FC<{f: number}> = ({f}) => {
  const human = Math.min(8, Math.floor(Math.max(0, f) / 10));
  const aiDone = f >= 90;
  const sheet = (x: number, n: number, col: string) => (
    <g transform={`translate(${x} 300)`}>
      <rect x={0} y={0} width={600} height={380} rx={16} fill={K.white} {...SO} />
      {[0, 1, 2, 3, 4].map((r) => (
        <line key={r} x1={30} y1={80 + r * 50} x2={570} y2={80 + r * 50} stroke={K.gray} strokeWidth={4} />
      ))}
      {Array.from({length: n}).map((_, i) => (
        <g key={i} transform={`translate(${60 + (i % 8) * 64} ${100 + ((i * 37) % 5) * 40 + Math.floor(i / 8) * 0})`}>
          <ellipse rx={18} ry={13} fill={col} transform="rotate(-20)" />
          <line x1={16} y1={-4} x2={16} y2={-70} stroke={col} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
  return (
    <>
      <Layer>
        {sheet(160, human, K.ol)}
        {sheet(1160, aiDone ? 8 : 0, K.purple)}
        <Bean x={460} y={FLOOR} scale={0.9} color={K.orange} belly={K.cream} item="pen" hop={aiDone ? 0 : 10} face={aiDone ? 'sad' : 'up'} />
        <Bean x={1460} y={FLOOR} scale={0.9} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hop={12} />
      </Layer>
      <Pop f0={4} x={160} y={220}>
        <Sticker text="乐趣在写的过程" size={44} col={K.yellow} rot={-3} />
      </Pop>
      {aiDone && (
        <Stamp f0={90} x={1460} y={260} size={90} col={K.red}>
          1 秒写完
        </Stamp>
      )}
      {f >= 110 && (
        <Pop f0={110} x={560} y={560}>
          <Bubble w={420} tail="down" size={44} col={K.white}>
            还开心什么？
          </Bubble>
        </Pop>
      )}
    </>
  );
};

// ------------------------------------------------------------------ ④ 传了上千年的手艺
export const R3Old: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set={ph === 4 ? 'red' : 'yellow'} pattern={ph === 4 ? 'rays' : 'stripes'} floor={FLOOR} />
        {ph === 0 && (
          <>
            <KindTag i={3} />
            <Layer>
              {/* scroll unrolling */}
              {(() => {
                const p = E.inOut(seg(b[0], 4, 30));
                const w = 1000 * p;
                return (
                  <g transform="translate(960 560)">
                    <rect x={-w / 2} y={-140} width={w} height={280} fill={K.cream} {...SO} />
                    {p > 0.6 && (
                      <Telop x={0} y={50} size={150} fill={K.red} sw={12}>
                        千年
                      </Telop>
                    )}
                    <rect x={-w / 2 - 40} y={-170} width={40} height={340} rx={16} fill={K.wood} {...SO} />
                    <rect x={w / 2} y={-170} width={40} height={340} rx={16} fill={K.wood} {...SO} />
                  </g>
                );
              })()}
            </Layer>
          </>
        )}
        {ph === 1 && (
          <>
            <Screen src={A.opera} x={110} y={250} w={800} h={540} f0={at[1]} credit={LOCX} label="戏曲演员（北京，1874）" focus={[50, 55]} tilt={-2} />
            <Screen src={A.craft} x={1010} y={250} w={800} h={540} f0={at[1] + 60} credit={LOC} label="手艺人" focus={[40, 50]} tilt={2} />
            {['京剧', '相声', '说书'].map((t, i) => (
              <Pop key={t} f0={at[1] + 10 + i * 14} f1={at[1] + 60} x={1080 + i * 240} y={420} rot={(i - 1) * 5}>
                <Sticker text={t} size={64} col={[K.red, K.yellow, K.white][i]} fg={i === 0 ? K.white : K.ol} />
              </Pop>
            ))}
          </>
        )}
        {ph === 2 && (
          <>
            <Layer>
              <g transform={`translate(960 ${FLOOR})`}>
                <rect x={-30} y={-440} width={60} height={440} fill={K.wood} {...SO} />
                <g transform={`translate(0 -470) scale(${1 + 0.05 * Math.sin(f / 5)})`}>
                  <ellipse rx={130} ry={110} fill={K.red} {...SO} />
                  <rect x={-60} y={-130} width={120} height={30} rx={8} fill={K.yellow} {...SO} strokeWidth={6} />
                  <rect x={-60} y={100} width={120} height={30} rx={8} fill={K.yellow} {...SO} strokeWidth={6} />
                  <Telop x={0} y={30} size={80} fill={K.yellow} sw={8}>
                    文化
                  </Telop>
                </g>
              </g>
              <Bean x={520} y={FLOOR} scale={1.15} color={K.purple} belly="#B9A6F0" hat="opera" hop={12} name="守着" />
              <Bean x={1400} y={FLOOR} scale={1.15} color={K.orange} belly={K.cream} item="fan" hop={12} phase={0.5} name="传着" />
            </Layer>
            <Pop f0={at[2] + 6} x={140} y={240}>
              <Sticker text="早就是文化的一部分" size={48} col={K.white} rot={-3} />
            </Pop>
          </>
        )}
        {ph === 3 && <At f0={at[3]}><Lineage f={b[3]} /></At>}
        {ph === 4 && (
          <>
            <Layer>
              <Bean x={960} y={FLOOR} scale={1.5} color={K.purple} belly="#B9A6F0" hat="opera" item="fan" hey={1} hop={24} open />
              <Bean x={520} y={FLOOR} scale={0.9} color={K.orange} belly={K.cream} item="brush" hey={1} hop={20} phase={0.5} />
              <Bean x={1400} y={FLOOR} scale={0.9} color={K.green} belly={K.cream} item="fan" hey={1} hop={20} phase={0.25} />
              <Judge word="过关！" x={960} y={300} f0={at[4] + 60} col={K.yellow} dur={90} size={170} />
              <Confetti f0={at[4] + 60} dur={60} seed={33} />
            </Layer>
            <Pop f0={at[4] + 4} f1={at[4] + 60} x={960} y={250}>
              <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
                <Sticker text="越古老的行当，越难被替代" size={56} col={K.white} rot={-2} />
              </div>
            </Pop>
          </>
        )}
      </Punch>
      <R3Tag />
    </AbsoluteFill>
  );
};

/** Tech revolutions pass overhead; a fan is handed from master to apprentice down the line. */
const Lineage: React.FC<{f: number}> = ({f}) => {
  const waves = ['蒸汽机', '电', '电脑', 'AI'];
  const handoff = Math.floor(Math.max(0, f - 40) / 40);
  return (
    <>
      <Layer>
        {waves.map((w, i) => {
          const t0 = i * 30;
          const p = seg(f, t0, t0 + 70);
          if (p <= 0 || p >= 1) return null;
          const x = 2100 - p * 2400;
          return (
            <g key={w} transform={`translate(${x} 330)`}>
              <path d="M -160 40 Q -80 -60 0 40 Q 80 -60 160 40 Z" fill={K.sky} {...SO} />
              <Telop x={0} y={30} size={50} fill={K.white} sw={7}>
                {w}
              </Telop>
            </g>
          );
        })}
        {[0, 1, 2, 3].map((i) => {
          const holder = Math.min(handoff, 3) === i;
          return (
            <Bean
              key={i}
              x={340 + i * 420}
              y={FLOOR}
              scale={1.05 - i * 0.12}
              color={[K.purple, K.orange, K.green, K.blue][i]}
              belly={K.cream}
              hat={i === 0 ? 'opera' : 'none'}
              ant="sprout"
              item={holder ? 'fan' : 'none'}
              hey={holder ? 0.7 : 0.2}
              hop={12}
              phase={i * 0.25}
              name={['师傅', '徒弟', '徒孙', '下一代'][i]}
            />
          );
        })}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${430 + i * 420} ${FLOOR - 260} Q ${550 + i * 420} ${FLOOR - 340} ${660 + i * 420} ${FLOOR - 260}`} fill="none" stroke={K.ol} strokeWidth={8} strokeDasharray="16 14" markerEnd="" opacity={handoff > i ? 1 : 0.25} />
        ))}
      </Layer>
      <Pop f0={4} x={140} y={210}>
        <Sticker text="熬过一次又一次技术革命" size={44} col={K.white} rot={-3} />
      </Pop>
      {f >= 80 && (
        <Pop f0={80} x={1100} y={210}>
          <Sticker text="师傅带徒弟，一代一代" size={44} col={K.yellow} rot={3} />
        </Pop>
      )}
    </>
  );
};
