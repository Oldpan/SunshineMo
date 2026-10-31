// 第二关 · 现场：每一单的人和环境都不一样（家政、上门维修、装修、律师），机器最擅长固定重复的活；现在请人更划算，所以是短期安全。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {A, LOC} from './assets';
import {
  At,
  Bean,
  Burst,
  Confetti,
  E,
  F_CJK,
  F_ROUND,
  GSSet,
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
  Sticker,
  Telop,
  TelopDiv,
  useBeatFrames,
  useKit,
} from './common';

const COL = K.blue;
const FLOOR = 870;
const R2Tag = () => <RoundTag n={2} name="现场" col={COL} />;

export const R2Card: React.FC = () => {
  useKit();
  const {at, dur} = useBeatFrames();
  return (
    <AbsoluteFill>
      <Punch hits={[...at, 4]}>
        <GSSet set="sky" pattern="rays" floor={FLOOR} curtain={K.navy} />
        <Layer>
          <Bean x={190} y={FLOOR} scale={0.75} color={K.orange} belly={K.cream} hat="hardhat" item="wrench" hop={20} hey={1} open />
          <Bean x={1730} y={FLOOR} scale={0.75} color={K.pink} belly={K.cream} item="mop" hop={20} phase={0.5} hey={1} open />
        </Layer>
        <RoundCard num={2} name="现场" tag="到了现场才知道怎么干" col={COL} f0={2} f1={dur + 20} />
        <Layer>
          <Burst x={1420} y={210} f0={14} size={1.1} />
          <Confetti f0={10} dur={40} n={60} seed={12} />
        </Layer>
      </Punch>
    </AbsoluteFill>
  );
};

const CAST = [
  {name: '家政', col: K.pink, belly: K.cream, hat: 'none' as const, item: 'mop' as const},
  {name: '上门维修', col: K.orange, belly: K.cream, hat: 'cap' as const, item: 'wrench' as const},
  {name: '装修', col: K.yellow, belly: K.cream, hat: 'hardhat' as const, item: 'brush' as const},
  {name: '律师', col: K.purple, belly: '#B9A6F0', hat: 'glasses' as const, item: 'briefcase' as const},
];

/** Little house; `kind` changes the shape so no two look alike. */
const House: React.FC<{x: number; y: number; kind: number; s?: number}> = ({x, y, kind, s = 1}) => {
  const cols = [K.cream, K.pink, K.lime, K.yellow];
  const w = [220, 300, 180, 260][kind % 4];
  const h = [200, 160, 280, 220][kind % 4];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={cols[kind % 4]} {...SO} />
      {kind % 2 === 0 ? (
        <path d={`M ${-w / 2 - 20} ${-h} L 0 ${-h - 110} L ${w / 2 + 20} ${-h} Z`} fill={K.red} {...SO} />
      ) : (
        <rect x={-w / 2 - 14} y={-h - 30} width={w + 28} height={30} fill={K.navy} {...SO} />
      )}
      <rect x={-26} y={-90} width={52} height={90} fill={K.wood} {...SO} strokeWidth={6} />
      <rect x={w / 2 - 70} y={-h + 30} width={44} height={44} fill={K.sky} {...SO} strokeWidth={5} />
    </g>
  );
};

export const R2Scene: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [6, 5, 4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="sky" pattern={ph >= 5 ? 'dots' : 'stripes'} floor={FLOOR} />
        {ph === 0 && (
          <>
            <Layer>
              {CAST.map((c, i) => {
                const t = b[0] - i * 8;
                const y = t < 0 ? -1200 : -900 * (1 - E.in(seg(t, 0, 9)));
                return <Bean key={i} x={330 + i * 420} y={FLOOR + y} scale={1.15} color={c.col} belly={c.belly} hat={c.hat} item={c.item} hop={16} phase={i * 0.25} name={c.name} />;
              })}
            </Layer>
            <Pop f0={at[0] + 50} x={960} y={250}>
              <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
                <TelopDiv size={84} color={K.yellow}>
                  有个共同点
                </TelopDiv>
              </div>
            </Pop>
          </>
        )}
        {ph === 1 && (
          <>
            <Layer>
              {[0, 1, 2, 3].map((k) => {
                const p = E.back(seg(b[1], k * 6, k * 6 + 10));
                return <House key={k} x={300 + k * 440} y={FLOOR} kind={k} s={p} />;
              })}
              {(() => {
                const t = ((b[1] % 120) + 120) % 120 / 120;
                const x = 300 + t * 1320;
                return <Bean x={x} y={FLOOR + 40} scale={0.6} color={K.orange} belly={K.cream} hat="cap" item="wrench" hop={16} lean={6} />;
              })()}
            </Layer>
            <Pop f0={at[1] + 6} x={150} y={220}>
              <Sticker text="每一单的人和环境都不一样" size={50} col={K.white} rot={-3} />
            </Pop>
            <Pop f0={at[1] + 50} x={1060} y={320}>
              <Sticker text="到了现场才知道怎么干" size={50} col={K.yellow} rot={3} />
            </Pop>
          </>
        )}
        {ph === 2 && <At f0={at[2]}><Plumber f={b[2]} /></At>}
        {ph === 3 && (
          <>
            <Layer>
              {[0, 1, 2].map((k) => (
                <g key={k} transform={`translate(${560 + k * 420} 560) scale(${E.back(seg(b[3], k * 8, k * 8 + 10))})`}>
                  <FloorPlan kind={k} />
                </g>
              ))}
              <Bean x={200} y={FLOOR} scale={1.1} color={K.pink} belly={K.cream} item="mop" hop={14} />
            </Layer>
            {['户型', '习惯', '要求'].map((t, i) => (
              <Pop key={t} f0={at[3] + 30 + i * 12} x={470 + i * 420} y={760} rot={(i - 1) * 4}>
                <Sticker text={`${t}不一样`} size={38} col={[K.yellow, K.lime, K.white][i]} />
              </Pop>
            ))}
          </>
        )}
        {ph === 4 && (
          <>
            <Layer>
              <Bean x={360} y={FLOOR} scale={1.3} color={K.purple} belly="#B9A6F0" hat="glasses" item="briefcase" hop={10} name="律师" />
              {[
                {c: K.orange, h: 'cap' as const},
                {c: K.green, h: 'none' as const},
                {c: K.yellow, h: 'beret' as const},
                {c: K.red, h: 'chef' as const},
              ].map((cl, i) => (
                <g key={i} opacity={b[4] >= 10 + i * 8 ? 1 : 0}>
                  <Bean x={860 + i * 270} y={FLOOR} scale={0.85} color={cl.c} belly={K.cream} hat={cl.h} hop={14} phase={i * 0.25} ant={i % 2 ? 'q' : 'ball'} />
                </g>
              ))}
            </Layer>
            {['合同纠纷', '离婚', '劳动仲裁', '知识产权'].map((t, i) => (
              <Pop key={t} f0={at[4] + 14 + i * 8} x={760 + i * 270} y={360 + (i % 2) * 70} rot={(i % 2 ? 4 : -4)}>
                <div style={{width: 210, height: 130, background: K.cream, border: `6px solid ${K.ol}`, borderRadius: 12, boxShadow: `6px 6px 0 ${K.ol}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F_CJK, fontWeight: 900, fontSize: 36}}>
                  {t}
                </div>
              </Pop>
            ))}
            <Pop f0={at[4] + 60} x={150} y={230}>
              <Sticker text="每个案子、每个当事人都不同" size={46} col={K.white} rot={-3} />
            </Pop>
          </>
        )}
        {ph === 5 && <At f0={at[5]}><RobotArm f={b[5]} /></At>}
        {ph === 6 && (
          <>
            <Screen src={A.assembly} x={120} y={250} w={860} h={540} f0={at[6]} credit={LOC} label="流水线" focus={[50, 50]} tilt={-2} />
            <Pop f0={at[6] + 36} x={1060} y={250}>
              <Sticker text="仓库分拣" size={44} col={K.yellow} rot={3} />
            </Pop>
            <Conveyor f={b[6]} />
          </>
        )}
      </Punch>
      <R2Tag />
    </AbsoluteFill>
  );
};

/** Cutaway wall with pipes; the plumber ticks a checklist. */
const Plumber: React.FC<{f: number}> = ({f}) => {
  const items = ['墙怎么砌的', '管子怎么走的', '主人想要什么'];
  return (
    <>
      <Layer>
        <rect x={140} y={250} width={760} height={FLOOR - 250} fill="#E8D3B6" {...SO} />
        {Array.from({length: 8}).map((_, r) =>
          Array.from({length: 5}).map((__, c) => (
            <rect key={`${r}-${c}`} x={150 + c * 150 + (r % 2) * 75} y={260 + r * 76} width={140} height={66} rx={6} fill="#D8B48E" stroke="#B88C62" strokeWidth={4} />
          )),
        )}
        <path d={`M 230 ${FLOOR} V 520 H 520 V 330 H 820`} fill="none" stroke={K.ol} strokeWidth={46} strokeLinejoin="round" />
        <path d={`M 230 ${FLOOR} V 520 H 520 V 330 H 820`} fill="none" stroke={K.steel} strokeWidth={30} strokeLinejoin="round" />
        {f >= 20 && <circle cx={520} cy={520} r={40} fill="none" stroke={K.red} strokeWidth={10} strokeDasharray="20 12" transform={`rotate(${f * 4} 520 520)`} />}
        <Bean x={700} y={FLOOR} scale={1.2} color={K.orange} belly={K.cream} hat="cap" item="wrench" hop={10} hey={0.4} lean={-6} />
      </Layer>
      {items.map((t, i) => {
        const t0 = 20 + i * 40;
        return (
          <Pop key={t} f0={t0} x={1010} y={290 + i * 170} from="right">
            <ShadowCard w={780} h={130} col={K.cream} r={26} off={10}>
              <div style={{display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 30}}>
                <div style={{width: 80, height: 80, borderRadius: 16, border: `7px solid ${K.ol}`, background: f >= t0 + 20 ? K.green : K.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F_ROUND, fontWeight: 700, fontSize: 60, color: K.white, WebkitTextStroke: `3px ${K.ol}`}}>
                  {f >= t0 + 20 ? '✓' : ''}
                </div>
                <div style={{marginLeft: 26, fontFamily: F_CJK, fontWeight: 900, fontSize: 54, color: K.ol}}>先看{t}</div>
              </div>
            </ShadowCard>
          </Pop>
        );
      })}
    </>
  );
};

/** Floor plan icon (3 kinds). */
const FloorPlan: React.FC<{kind: number}> = ({kind}) => {
  const rooms = [
    [[-150, -110, 300, 220], [-150, -110, 140, 120], [-10, 10, 160, 100]],
    [[-160, -90, 320, 180], [-160, -90, 100, 180], [60, -90, 100, 90]],
    [[-120, -130, 240, 260], [-120, -130, 240, 110], [-120, 40, 120, 90]],
  ][kind];
  return (
    <g>
      <rect x={-180} y={-160} width={360} height={320} rx={20} fill={K.white} {...SO} />
      {rooms.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={i ? 'none' : [K.cream, '#FFE3EE', '#E6F8D0'][kind]} stroke={K.ol} strokeWidth={i ? 6 : 8} />
      ))}
    </g>
  );
};

/** Industrial arm repeating the same move on a 30-frame loop. */
const RobotArm: React.FC<{f: number}> = ({f}) => {
  const t = ((f % 30) + 30) % 30 / 30;
  const a1 = -40 + 30 * Math.sin(t * Math.PI * 2);
  const a2 = 60 - 40 * Math.sin(t * Math.PI * 2);
  return (
    <>
      <Layer>
        <g transform={`translate(560 ${FLOOR})`}>
          <rect x={-110} y={-60} width={220} height={60} rx={10} fill={K.navy} {...SO} />
          <g transform={`translate(0 -60) rotate(${a1})`}>
            <rect x={-30} y={-280} width={60} height={280} rx={26} fill={K.orange} {...SO} />
            <circle r={40} fill={K.yellow} {...SO} strokeWidth={6} />
            <g transform={`translate(0 -280) rotate(${a2})`}>
              <rect x={-26} y={-220} width={52} height={220} rx={22} fill={K.orange} {...SO} />
              <circle r={34} fill={K.yellow} {...SO} strokeWidth={6} />
              <path d="M -40 -220 L -40 -270 M 40 -220 L 40 -270 M -40 -220 L 40 -220" stroke={K.ol} strokeWidth={14} strokeLinecap="round" />
            </g>
          </g>
        </g>
      </Layer>
      {['固定', '重复', '能预测'].map((t, i) => (
        <Pop key={t} f0={10 + i * 14} x={1080} y={270 + i * 170} from="right">
          <ShadowCard w={560} h={130} col={[K.yellow, K.lime, K.pink][i]} r={26} off={10}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <TelopDiv size={72}>{t}</TelopDiv>
            </div>
          </ShadowCard>
        </Pop>
      ))}
      <Pop f0={4} x={140} y={210}>
        <Sticker text="机器人和 AI 最擅长" size={46} col={K.white} rot={-3} />
      </Pop>
    </>
  );
};

/** Sorting conveyor: boxes move right on a loop, a bot sorts them. */
const Conveyor: React.FC<{f: number}> = ({f}) => {
  if (f < 30) return null;
  const cols = [K.wood, K.yellow, K.pink, K.lime];
  return (
    <Layer>
      <rect x={1040} y={720} width={800} height={50} rx={25} fill={K.navy} {...SO} />
      {Array.from({length: 7}).map((_, i) => (
        <circle key={i} cx={1080 + i * 120} cy={745} r={16} fill={K.gray} stroke={K.ol} strokeWidth={4} />
      ))}
      {Array.from({length: 5}).map((_, i) => {
        const x = 1040 + ((((f * 5 + i * 170) % 850) + 850) % 850);
        return <rect key={i} x={x - 50} y={640} width={100} height={80} rx={8} fill={cols[i % 4]} {...SO} strokeWidth={6} />;
      })}
      <g transform={`translate(1440 ${FLOOR + 10}) scale(0.7)`}>
        <Bean x={0} y={-200} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hey={0.6 + 0.3 * Math.sin(f / 4)} hop={0} />
      </g>
      <Telop x={1440} y={400} size={40} fill={K.white}>
        一样的箱子，一样的动作
      </Telop>
    </Layer>
  );
};

// ------------------------------------------------------------------ cost
export const R2Cost: React.FC = () => {
  useKit();
  const {b, at} = useBeatFrames();
  const ph = [4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set={ph >= 3 ? 'lime' : 'sky'} pattern="stripes" floor={FLOOR} />
        {ph === 0 && (
          <>
            <Layer>
              <Bean x={760} y={FLOOR} scale={2.0} kind="bot" color={K.steel} belly={K.yellow} ant="bolt" hop={6} />
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${1250 + i * 170} ${FLOOR - 90 - i * 30}) scale(${E.back(seg(b[0], 20 + i * 8, 30 + i * 8))})`}>
                  <rect x={-70} y={-70} width={140} height={140} rx={16} fill={K.navy} {...SO} />
                  <rect x={-40} y={-40} width={80} height={80} rx={8} fill={K.lime} {...SO} strokeWidth={5} />
                  {[-50, 0, 50].map((d) => (
                    <g key={d}>
                      <line x1={d * 0.8} y1={-70} x2={d * 0.8} y2={-96} stroke={K.ol} strokeWidth={8} />
                      <line x1={d * 0.8} y1={70} x2={d * 0.8} y2={96} stroke={K.ol} strokeWidth={8} />
                    </g>
                  ))}
                </g>
              ))}
              <g transform={`translate(420 380) rotate(-12) scale(${E.back(seg(b[0], 50, 60))})`}>
                <path d="M -150 -60 L 120 -60 L 170 0 L 120 60 L -150 60 Z" fill={K.yellow} {...SO} />
                <circle cx={120} cy={0} r={14} fill={K.white} {...SO} strokeWidth={5} />
                <Telop x={-20} y={22} size={64} fill={K.red} sw={7} family={F_ROUND} weight={700}>
                  ¥¥¥¥
                </Telop>
              </g>
            </Layer>
            <Pop f0={at[0] + 20} x={1180} y={240}>
              <Sticker text="很强的算力" size={46} col={K.white} rot={3} />
            </Pop>
            <Pop f0={at[0] + 50} x={160} y={220}>
              <Sticker text="很贵的机器" size={46} col={K.white} rot={-3} />
            </Pop>
          </>
        )}
        {ph >= 1 && ph <= 2 && <Seesaw f={b[1]} f2={b[2]} />}
        {ph === 1 && (
          <Pop f0={at[1] + 30} x={960} y={170}>
            <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
              <Sticker text="不是做不到，是请人更划算" size={52} col={K.yellow} rot={-2} />
            </div>
          </Pop>
        )}
        {ph === 2 && (
          <Pop f0={at[2]} x={960} y={170}>
            <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
              <Sticker text="AI 成本 > 人工成本 → 继续用人" size={50} col={K.white} rot={-2} />
            </div>
          </Pop>
        )}
        {ph === 3 && (
          <>
            <Layer>
              <Hourglass x={560} y={FLOOR} f={b[3]} />
              <Bean x={1350} y={FLOOR} scale={1.3} color={K.orange} belly={K.cream} hat="cap" item="wrench" hop={16} hey={0.6} />
            </Layer>
            <Stamp f0={at[3] + 10} x={960} y={330} size={140} col={K.yellow}>
              短期安全
            </Stamp>
          </>
        )}
        {ph === 4 && <PriceLine f={b[4]} at4={at[4]} />}
      </Punch>
      <R2Tag />
    </AbsoluteFill>
  );
};

/** Seesaw: an expensive bot on one end, a person on the other; the person's side is the better deal. */
const Seesaw: React.FC<{f: number; f2: number}> = ({f, f2}) => {
  const tilt = 10 * E.inOut(seg(f, 6, 26)) + (f2 >= 0 ? Math.sin(f2 / 5) * 1.5 : 0);
  return (
    <Layer>
      <path d={`M 900 ${FLOOR} L 960 ${FLOOR - 140} L 1020 ${FLOOR} Z`} fill={K.navy} {...SO} />
      <g transform={`rotate(${tilt} 960 ${FLOOR - 140})`}>
        <rect x={360} y={FLOOR - 170} width={1200} height={34} rx={12} fill={K.wood} {...SO} />
        <Bean x={520} y={FLOOR - 170} scale={1.2} kind="bot" color={K.steel} belly={K.yellow} ant="bolt" />
        <g transform={`translate(520 ${FLOOR - 470}) rotate(-8)`}>
          <rect x={-110} y={-40} width={220} height={80} rx={14} fill={K.red} {...SO} strokeWidth={6} />
          <Telop x={0} y={18} size={50} fill={K.white} sw={6} family={F_ROUND} weight={700}>
            ¥¥¥¥
          </Telop>
        </g>
        <Bean x={1400} y={FLOOR - 170} scale={1.0} color={K.orange} belly={K.cream} hat="cap" item="wrench" hey={f >= 26 ? 1 : 0.3} open={f >= 26} />
        <g transform={`translate(1400 ${FLOOR - 430}) rotate(8)`}>
          <rect x={-70} y={-40} width={140} height={80} rx={14} fill={K.green} {...SO} strokeWidth={6} />
          <Telop x={0} y={18} size={50} fill={K.white} sw={6} family={F_ROUND} weight={700}>
            ¥
          </Telop>
        </g>
      </g>
      {f2 >= 0 && (
        <g transform={`translate(1700 ${FLOOR}) scale(0.9)`}>
          <Bean x={0} y={0} color={K.yellow} belly={K.cream} hat="crown" item="pen" hop={10} name="老板" />
        </g>
      )}
    </Layer>
  );
};

const Hourglass: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
  const p = seg(f, 0, 200);
  return (
    <g transform={`translate(${x} ${y - 230})`}>
      <rect x={-140} y={-230} width={280} height={30} rx={10} fill={K.wood} {...SO} />
      <rect x={-140} y={200} width={280} height={30} rx={10} fill={K.wood} {...SO} />
      <path d="M -110 -200 L 110 -200 L 10 0 L 110 200 L -110 200 L -10 0 Z" fill={K.white} {...SO} />
      <path d={`M ${-90 + 80 * p} ${-170 + 160 * p} L ${90 - 80 * p} ${-170 + 160 * p} L 6 -6 L -6 -6 Z`} fill={K.yellow} />
      <path d={`M -90 180 L 90 180 L ${60 - 40 * (1 - p)} ${180 - 120 * p} L ${-60 + 40 * (1 - p)} ${180 - 120 * p} Z`} fill={K.yellow} />
      <line x1={0} y1={0} x2={0} y2={180} stroke={K.yellow} strokeWidth={6} strokeDasharray="8 10" strokeDashoffset={-f * 3} />
    </g>
  );
};

/** Machine price falls; the "safe" line slides back; round cleared. */
const PriceLine: React.FC<{f: number; at4: number}> = ({f, at4}) => {
  const p = E.inOut(seg(f, 6, 60));
  const n = 8;
  const pts = Array.from({length: n}).map((_, i) => [260 + i * 150, 330 + 420 * (1 - Math.exp(-i / 2.6))] as const);
  const k = Math.max(1, Math.round(p * (n - 1)));
  const d = pts.slice(0, k + 1).map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const lineX = 1520 - 360 * E.inOut(seg(f, 30, 90));
  return (
    <>
      <Layer>
        <rect x={200} y={260} width={1200} height={560} rx={24} fill={K.white} {...SO} />
        <path d={d} fill="none" stroke={K.red} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        <Telop x={240} y={310} size={32} fill={K.ol} sw={0} anchor="start">
          机器的价格
        </Telop>
        <line x1={lineX - 200} y1={260} x2={lineX - 200} y2={820} stroke={K.green} strokeWidth={10} strokeDasharray="24 16" />
        <Telop x={lineX - 220} y={790} size={30} fill={K.green} sw={0} anchor="end">
          请人更划算的线
        </Telop>
        <Bean x={1640} y={FLOOR} scale={1.2} color={K.orange} belly={K.cream} hat="cap" item="wrench" hey={1} open hop={22} />
        <Judge word="过关！" x={1560} y={360} f0={at4 + 70} col={K.yellow} dur={80} size={150} />
        <Confetti f0={at4 + 70} dur={50} seed={22} />
      </Layer>
    </>
  );
};

