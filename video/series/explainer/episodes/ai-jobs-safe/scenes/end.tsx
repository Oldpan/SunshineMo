// 自测三问（金字塔尖？全在电脑上？按产量挣钱？）、世界经济论坛 2030 预测、结尾（马斯克「工作会变成可选的」→ 你真心想做的那一份）。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {A} from './assets';
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
  NewsTile,
  Pop,
  Punch,
  seg,
  ShadowCard,
  SO,
  Stamp,
  Sticker,
  Telop,
  TelopDiv,
  Title,
  useBeatFrames,
  useKit,
} from './common';

const FLOOR = 870;

const SectionTag: React.FC<{text: string; col?: string}> = ({text, col = K.white}) => (
  <div style={{position: 'absolute', left: 46, top: 40, transform: 'rotate(-3deg)'}}>
    <Sticker text={text} size={40} col={col} rot={0} />
  </div>
);

const ROUNDS = [
  {n: 1, name: '拍板兜底', col: K.orange},
  {n: 2, name: '现场', col: K.blue},
  {n: 3, name: '非你不可', col: K.pink},
];
const QS = ['在不在金字塔尖？', '是不是全在电脑上？', '是不是按产量挣钱？'];

/** Q1 Q2 Q3 progress dots at the top; `cur` lights up. */
const QBar: React.FC<{cur: number; answers?: (null | string)[]}> = ({cur, answers = [null, null, null]}) => (
  <div style={{position: 'absolute', left: 960, top: 60, transform: 'translateX(-50%)', display: 'flex', gap: 22}}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          fontFamily: F_ROUND,
          fontWeight: 700,
          fontSize: 40,
          color: K.ol,
          background: i === cur ? K.yellow : answers[i] ? K.green : K.white,
          border: `6px solid ${K.ol}`,
          borderRadius: 30,
          padding: '2px 26px',
          boxShadow: `6px 6px 0 ${K.ol}`,
          transform: `scale(${i === cur ? 1.12 : 1})`,
        }}
      >
        Q{i + 1}
        {answers[i] ? ` ${answers[i]}` : ''}
      </div>
    ))}
  </div>
);

/** Question card (top-centre). */
const QCard: React.FC<{i: number; f0?: number}> = ({i, f0 = 0}) => (
  <Pop f0={f0} x={960} y={170}>
    <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
      <ShadowCard w={QS[i].length * 70 + 260} h={120} col={K.purple} r={30} off={12}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 52, color: K.yellow, marginRight: 18}}>Q{i + 1}</div>
          <TelopDiv size={62}>{QS[i]}</TelopDiv>
        </div>
      </ShadowCard>
    </div>
  </Pop>
);

// ------------------------------------------------------------------ 自测
export const Test: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  const q = ph >= 7 ? 2 : ph >= 5 ? 1 : ph >= 3 ? 0 : -1;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="purple" pattern={ph <= 2 ? 'rays' : 'dots'} floor={FLOOR} />
        {ph <= 1 && (
          <>
            {ROUNDS.map((r, i) => {
              const p = E.back(seg(b[0], 6 + i * 20, 16 + i * 20));
              const far = ph === 1 ? E.inOut(seg(b[1], 0, 20)) : 0;
              return (
                <div
                  key={r.n}
                  style={{
                    position: 'absolute',
                    left: 250 + i * 520,
                    top: 330 - far * 140,
                    transform: `scale(${p * (1 - 0.45 * far)}) rotate(${(i - 1) * 3}deg)`,
                  }}
                >
                  <ShadowCard w={400} h={200} col={r.col} r={30} off={12}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                      <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 34, color: K.ol, background: K.white, border: `5px solid ${K.ol}`, borderRadius: 24, padding: '0 18px'}}>
                        第 {r.n} 关
                      </div>
                      <TelopDiv size={64} style={{marginTop: 12}}>
                        {r.name}
                      </TelopDiv>
                    </div>
                  </ShadowCard>
                </div>
              );
            })}
            <Layer>
              <Bean x={960} y={FLOOR} scale={1.1} color={K.yellow} belly={K.cream} ant={ph === 1 ? 'q' : 'ball'} hop={ph === 1 ? 0 : 14} hey={ph === 1 ? 0.3 : 0.6} lean={ph === 1 ? 10 : 0} />
            </Layer>
            {ph === 1 && (
              <Pop f0={at[1] + 14} x={1160} y={640}>
                <Sticker text="离多数人有点远？" size={50} col={K.white} rot={3} />
              </Pop>
            )}
          </>
        )}
        {ph === 2 && (
          <>
            <Title text="三个共同点 · 自测三问" f0={at[2]} y={200} size={84} col={K.yellow} />
            {QS.map((t, i) => (
              <Pop key={i} f0={at[2] + 20 + i * 12} x={330} y={360 + i * 150} from="left">
                <ShadowCard w={760} h={120} col={K.cream} r={26} off={10}>
                  <div style={{display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 28}}>
                    <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 52, color: K.purple, width: 90}}>Q{i + 1}</div>
                    <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 50, color: K.ol}}>{t}</div>
                  </div>
                </ShadowCard>
              </Pop>
            ))}
            <Layer>
              <Bean x={1500} y={FLOOR} scale={1.3} color={K.yellow} belly={K.cream} hat="headset" item="mic" hop={14} open={Math.floor(f / 8) % 2 === 0} hey={0.5} name="测一测" />
            </Layer>
          </>
        )}
        {q >= 0 && ph !== 11 && <QBar cur={q} answers={[null, null, null]} />}
        {ph === 3 && <At f0={at[3]}><QCard i={0} /><Pyramid f={b[3]} /></At>}
        {ph === 4 && <At f0={at[4]}><TopPros f={b[4]} /></At>}
        {ph === 5 && <At f0={at[5]}><QCard i={1} /><DeskOnly f={b[5]} /></At>}
        {ph === 6 && <At f0={at[6]}><HandsOn f={b[6]} /></At>}
        {ph === 7 && <At f0={at[7]}><QCard i={2} /><PieceRate f={b[7]} /></At>}
        {ph === 8 && <At f0={at[8]}><Race f={b[8]} /></At>}
        {ph === 9 && <At f0={at[9]}><Road f={b[9]} /></At>}
        {ph === 10 && <At f0={at[10]}><Surgeon f={b[10]} /></At>}
        {ph === 11 && <At f0={at[11]}><Verdict f={b[11]} /></At>}
      </Punch>
      <SectionTag text="自测三问" col={K.yellow} />
    </AbsoluteFill>
  );
};

const Pyramid: React.FC<{f: number}> = ({f}) => {
  const tiers = [
    {w: 1000, c: K.cream},
    {w: 760, c: K.sky},
    {w: 520, c: K.lime},
    {w: 280, c: K.yellow},
  ];
  return (
    <>
      <Layer>
        {tiers.map((t, i) => {
          const p = E.back(seg(f, 6 + i * 6, 16 + i * 6));
          const y = FLOOR - (i + 1) * 100;
          return <rect key={i} x={760 - t.w / 2} y={y} width={t.w} height={100} rx={10} fill={t.c} {...SO} transform={`translate(0 ${(1 - p) * -600})`} />;
        })}
        {[0, 1, 2].map((i) => (
          <Bean key={i} x={460 + i * 300} y={FLOOR - 100} scale={0.45} color={[K.blue, K.pink, K.green][i]} belly={K.cream} hop={10} phase={i * 0.3} />
        ))}
        <g opacity={f >= 34 ? 1 : 0}>
          <Bean x={760} y={FLOOR - 400 + (f < 44 ? -600 * (1 - E.in(seg(f, 34, 44))) : 0)} scale={0.6} color={K.orange} belly={K.cream} hat="crown" hey={1} hop={16} open />
        </g>
        <Burst x={760} y={FLOOR - 470} f0={44} />
      </Layer>
      <Pop f0={60} x={1340} y={420} origin="0 50%">
        <Sticker text="哪一行做到顶尖" size={48} col={K.white} rot={3} />
      </Pop>
      {f >= 90 && (
        <Stamp f0={90} x={1560} y={600} size={84} col={K.yellow}>
          都不容易被替代
        </Stamp>
      )}
    </>
  );
};

const TopPros: React.FC<{f: number}> = ({f}) => (
  <>
    <Layer>
      {[
        {n: '顶尖医生', c: K.teal, item: 'stethoscope' as const, hat: 'glasses' as const},
        {n: '顶尖律师', c: K.purple, item: 'briefcase' as const, hat: 'none' as const},
        {n: '顶尖工匠', c: K.orange, item: 'wrench' as const, hat: 'hardhat' as const},
      ].map((p, i) => (
        <g key={i}>
          <Bean x={360 + i * 560} y={FLOOR} scale={1.15} color={p.c} belly={K.cream} item={p.item} hat={p.hat} hop={14} phase={i * 0.3} name={p.n} ant="star" />
          <g transform={`translate(${520 + i * 560} ${FLOOR}) scale(0.55)`} opacity={f >= 30 + i * 8 ? 1 : 0}>
            <Bean x={0} y={0} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hop={18} phase={0.5} hey={0.6} />
          </g>
        </g>
      ))}
    </Layer>
    <Pop f0={50} x={300} y={260}>
      <Sticker text="AI 是帮手 ✓" size={58} col={K.lime} rot={-3} />
    </Pop>
    <Pop f0={80} x={1120} y={260}>
      <Sticker text="不是对手 ✕" size={58} col={K.white} rot={3} />
    </Pop>
  </>
);

const DeskOnly: React.FC<{f: number}> = ({f}) => (
  <>
    <Layer>
      <rect x={300} y={680} width={640} height={40} rx={10} fill={K.wood} {...SO} />
      <rect x={340} y={720} width={30} height={FLOOR - 720} fill={K.wood} {...SO} strokeWidth={6} />
      <rect x={870} y={720} width={30} height={FLOOR - 720} fill={K.wood} {...SO} strokeWidth={6} />
      <Bean x={560} y={700} scale={1.0} color={K.blue} belly={K.sky} hat="glasses" ant="none" hop={4} face={f >= 70 ? 'sad' : null} />
      <g transform="translate(720 680)">
        <rect x={-90} y={-110} width={180} height={104} rx={10} fill={K.gray} {...SO} strokeWidth={6} />
      </g>
      <g transform={`translate(${1500 - 500 * E.inOut(seg(f, 40, 70))} 0)`}>
        <Bean x={0} y={FLOOR} scale={1.2} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hey={0.8} hop={16} lean={-8} />
      </g>
    </Layer>
    {f >= 74 && (
      <Stamp f0={74} x={1320} y={420} size={90} col={K.red}>
        最容易被接手
      </Stamp>
    )}
  </>
);

const HandsOn: React.FC<{f: number}> = ({f}) => (
  <>
    <Title text="反过来" f0={0} y={180} size={80} col={K.yellow} />
    {[
      {t: '要动手', c: K.orange, item: 'wrench' as const, hat: 'hardhat' as const},
      {t: '要见人', c: K.pink, item: 'heart' as const, hat: 'none' as const},
      {t: '要到现场', c: K.blue, item: 'box' as const, hat: 'cap' as const},
    ].map((p, i) => (
      <React.Fragment key={i}>
        <Pop f0={10 + i * 18} x={400 + i * 560} y={340}>
          <div style={{transform: 'translateX(-50%)'}}>
            <Sticker text={p.t} size={56} col={K.lime} rot={(i - 1) * 4} />
          </div>
        </Pop>
        <Layer>
          <g opacity={f >= 10 + i * 18 ? 1 : 0}>
            <Bean x={400 + i * 560} y={FLOOR} scale={1.15} color={p.c} belly={K.cream} item={p.item} hat={p.hat} hop={16} phase={i * 0.3} />
          </g>
        </Layer>
      </React.Fragment>
    ))}
    {f >= 70 && (
      <Stamp f0={70} x={960} y={520} size={96} col={K.green}>
        就安全一些
      </Stamp>
    )}
  </>
);

/** Piece-rate: a human counter ticking slowly vs a bot counter racing. */
const PieceRate: React.FC<{f: number}> = ({f}) => {
  const hn = Math.floor(Math.max(0, f - 20) / 18);
  const bn = Math.floor(Math.max(0, f - 60) * 7.3);
  const box = (x: number, label: string, n: number, col: string) => (
    <div style={{position: 'absolute', left: x, top: 330}}>
      <ShadowCard w={520} h={260} col={K.cream} r={30}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 40, color: K.ol}}>{label}</div>
          <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 110, color: col}}>{n}</div>
          <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 30, color: K.ol}}>件</div>
        </div>
      </ShadowCard>
    </div>
  );
  return (
    <>
      {box(200, '你：干得越多挣得越多', hn, K.blue)}
      <div style={{position: 'absolute', left: 1748, top: 330}}>
        <Sticker text="示意" size={30} col={K.gray} rot={0} />
      </div>
      {f >= 60 && box(1200, 'AI', bn, K.red)}
      <Layer>
        <Bean x={460} y={FLOOR} scale={0.8} color={K.blue} belly={K.sky} item="box" hop={14} />
        {f >= 60 && <Bean x={1460} y={FLOOR} scale={0.8} kind="bot" color={K.steel} belly={K.sky} item="box" hop={30} ant="bolt" />}
      </Layer>
      {f >= 90 && (
        <Stamp f0={90} x={960} y={640} size={86} col={K.yellow}>
          在跟 AI 比效率
        </Stamp>
      )}
    </>
  );
};

/** Running race: the bot laps the human. */
const Race: React.FC<{f: number}> = ({f}) => {
  const hx = 200 + f * 3;
  const bx = 200 + f * 14;
  return (
    <>
      <Layer>
        {[0, 1].map((i) => (
          <rect key={i} x={-10} y={600 + i * 150} width={1940} height={10} fill={K.white} opacity={0.6} />
        ))}
        <rect x={1700} y={520} width={20} height={FLOOR - 520} fill={K.white} {...SO} strokeWidth={5} />
        <Bean x={Math.min(hx, 1600)} y={740} scale={0.8} color={K.blue} belly={K.sky} hop={20} lean={10} face={f >= 60 ? 'sad' : null} />
        <Bean x={Math.min(bx, 1800)} y={FLOOR} scale={0.8} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hop={30} lean={18} />
        {f < 120 &&
          [0, 1, 2].map((i) => (
            <line key={i} x1={Math.min(bx, 1800) - 120 - i * 40} y1={FLOOR - 80 - i * 30} x2={Math.min(bx, 1800) - 240 - i * 40} y2={FLOOR - 80 - i * 30} stroke={K.white} strokeWidth={10} strokeLinecap="round" />
          ))}
      </Layer>
      <Pop f0={4} x={140} y={200}>
        <Sticker text="造 AI 的主要目的：提高效率" size={46} col={K.white} rot={-3} />
      </Pop>
      {f >= 80 && (
        <Stamp f0={80} x={960} y={420} size={120} col={K.red}>
          拼产量，拼不过
        </Stamp>
      )}
    </>
  );
};

/** Code road narrowing: more people used to mean more code; now AI writes too. */
const Road: React.FC<{f: number}> = ({f}) => {
  const narrow = E.inOut(seg(f, 60, 100));
  const topW = 700 - 520 * narrow;
  return (
    <>
      <Layer>
        <path d={`M ${960 - 700} ${FLOOR} L ${960 - topW / 2} 320 L ${960 + topW / 2} 320 L ${960 + 700} ${FLOOR} Z`} fill={K.navy} {...SO} />
        {[0, 1, 2, 3, 4].map((i) => {
          const t = (((f * 0.02 + i / 5) % 1) + 1) % 1;
          const y = 320 + t * (FLOOR - 320);
          const w = (topW + (1400 - topW) * t) * 0.5;
          return <rect key={i} x={960 - w / 2} y={y - 8} width={w * (0.4 + 0.5 * ((i * 37) % 10) / 10)} height={16} rx={8} fill={K.lime} opacity={0.85} />;
        })}
        {f < 60 &&
          [0, 1, 2].map((i) => (
            <Bean key={i} x={720 + i * 240} y={FLOOR} scale={0.6} color={K.blue} belly={K.sky} hat="glasses" item="laptop" hop={14} phase={i * 0.3} ant="none" />
          ))}
        {f >= 40 && <Bean x={1560} y={FLOOR} scale={0.9} kind="bot" color={K.steel} belly={K.sky} ant="bolt" item="laptop" hop={16} />}
      </Layer>
      <Pop f0={4} x={140} y={200}>
        <Sticker text="写代码：以前多招人就能多写" size={46} col={K.white} rot={-3} />
      </Pop>
      {f >= 70 && (
        <Stamp f0={70} x={1400} y={360} size={96} col={K.yellow}>
          这条路窄了
        </Stamp>
      )}
    </>
  );
};

const Surgeon: React.FC<{f: number}> = ({f}) => (
  <>
    <Layer>
      <Bean x={520} y={FLOOR} scale={1.35} color={K.teal} belly={K.cream} hat="glasses" item="stethoscope" hop={10} name="外科医生" />
    </Layer>
    <Pop f0={10} x={900} y={280} from="right">
      <ShadowCard w={760} h={420} col={K.white} r={30}>
        <div style={{padding: '24px 40px'}}>
          <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 48, color: K.ol}}>今日手术</div>
          {['08:00', '11:30', '15:00'].map((t, i) => (
            <div key={t} style={{display: 'flex', alignItems: 'center', marginTop: 18, opacity: f >= 20 + i * 12 ? 1 : 0}}>
              <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 44, color: K.teal, width: 170}}>{t}</div>
              <div style={{height: 50, width: 380, borderRadius: 14, background: K.lime, border: `5px solid ${K.ol}`}} />
            </div>
          ))}
        </div>
      </ShadowCard>
    </Pop>
    {f >= 80 && (
      <Stamp f0={80} x={1280} y={800} size={78} col={K.yellow}>
        多招人也翻不了倍
      </Stamp>
    )}
  </>
);

const Verdict: React.FC<{f: number}> = ({f}) => {
  const row = (i: number, ans: string, y: number, f0: number) => (
    <Pop key={i} f0={f0} x={250} y={y} from="left">
      <ShadowCard w={940} h={120} col={K.cream} r={26} off={10}>
        <div style={{display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 30}}>
          <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 52, color: K.purple, width: 100}}>Q{i + 1}</div>
          <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 46, color: K.ol, flex: 1}}>{QS[i]}</div>
          <div style={{marginRight: 26, fontFamily: F_CJK, fontWeight: 900, fontSize: 46, color: K.white, background: K.green, border: `6px solid ${K.ol}`, borderRadius: 20, padding: '0 18px'}}>{ans}</div>
        </div>
      </ShadowCard>
    </Pop>
  );
  return (
    <>
      {row(0, '是', 240, 6)}
      <Pop f0={30} x={640} y={392}>
        <Sticker text="或者" size={44} col={K.yellow} rot={-3} />
      </Pop>
      {row(1, '不是', 490, 60)}
      {row(2, '不是', 640, 74)}
      <Layer>
        <Bean x={1550} y={FLOOR} scale={1.3} color={K.yellow} belly={K.cream} hey={f >= 100 ? 1 : 0.3} open={f >= 100} hop={22} ant="star" />
        <Judge word="相对安全！" x={1520} y={360} f0={100} col={K.lime} dur={200} size={110} />
        <Confetti f0={100} dur={50} seed={41} />
      </Layer>
    </>
  );
};

// ------------------------------------------------------------------ 世界经济论坛
export const Wef: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="sky" pattern={ph === 4 ? 'rays' : 'stripes'} floor={FLOOR} />
        {ph === 0 && (
          <>
            <Pop f0={4} x={960} y={250}>
              <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
                <Sticker text="世界经济论坛《2025 未来就业报告》" size={50} col={K.white} rot={-2} />
              </div>
            </Pop>
            <Stamp f0={at[0] + 40} x={960} y={500} size={150} col={K.yellow} rot={-4}>
              2030 年
            </Stamp>
            <Layer>
              <Bean x={360} y={FLOOR} scale={1.1} color={K.yellow} belly={K.cream} ant="sprout" hop={16} hey={0.6} face="up" />
              <g transform={`translate(1600 330) rotate(${f})`}>
                <circle r={70} fill={K.yellow} {...SO} />
                {Array.from({length: 8}).map((_, i) => (
                  <rect key={i} x={-8} y={-130} width={16} height={40} rx={6} fill={K.yellow} {...SO} strokeWidth={5} transform={`rotate(${i * 45})`} />
                ))}
              </g>
            </Layer>
          </>
        )}
        {ph >= 1 && ph <= 3 && <JobBars f={b[1]} b2={b[2]} b3={b[3]} />}
        {ph === 4 && (
          <>
            <Layer>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const t = (((f * 1.2 + i * 60) % 360) + 360) % 360 / 360;
                const x = 300 + t * 1320;
                return <Bean key={i} x={x} y={FLOOR - Math.sin(t * Math.PI) * 160} scale={0.55} color={[K.blue, K.pink, K.green, K.orange, K.purple, K.yellow][i]} belly={K.cream} hop={0} hey={0.6} lean={8} />;
              })}
              <rect x={170} y={FLOOR - 300} width={160} height={300} rx={14} fill={K.red} {...SO} />
              <rect x={1590} y={FLOOR - 300} width={160} height={300} rx={14} fill={K.green} {...SO} />
              <Telop x={250} y={FLOOR - 320} size={40} fill={K.white}>
                旧岗位
              </Telop>
              <Telop x={1670} y={FLOOR - 320} size={40} fill={K.white}>
                新岗位
              </Telop>
            </Layer>
            <Pop f0={at[4] + 4} x={960} y={230}>
              <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
                <Sticker text="工作不会一下子没了" size={52} col={K.white} rot={-2} />
              </div>
            </Pop>
            {b[4] >= 40 && (
              <Stamp f0={at[4] + 40} x={960} y={430} size={140} col={K.yellow}>
                大换血
              </Stamp>
            )}
          </>
        )}
      </Punch>
      <SectionTag text="别太悲观" col={K.lime} />
    </AbsoluteFill>
  );
};

/** +1.7 亿 new vs −0.92 亿 gone; tags of shrinking and growing jobs. */
const JobBars: React.FC<{f: number; b2: number; b3: number}> = ({f, b2, b3}) => {
  const up = 380 * E.out(seg(f, 6, 30));
  const down = 206 * E.out(seg(f, 40, 60));
  const base = 660;
  const shrink = ['文员', '行政', '重复性岗位'];
  const grow = ['AI', '数据', '网络安全', '护理', '教育'];
  return (
    <>
      <Layer>
        <line x1={160} y1={base} x2={1000} y2={base} stroke={K.ol} strokeWidth={8} />
        <rect x={260} y={base - up} width={240} height={up} rx={12} fill={K.green} {...SO} />
        <rect x={640} y={base} width={240} height={down} rx={12} fill={K.red} {...SO} />
        {f >= 24 && (
          <Telop x={380} y={base - up - 30} size={60} fill={K.white} family={F_CJK} weight={900}>
            约 +1.7 亿
          </Telop>
        )}
        {f >= 56 && (
          <Telop x={900} y={base + down / 2 + 20} size={52} fill={K.white} family={F_CJK} weight={900} anchor="start">
            约 −0.92 亿
          </Telop>
        )}
        {f >= 24 && (
          <Telop x={380} y={base + 60} size={36} fill={K.ol} sw={0}>
            新增
          </Telop>
        )}
        {f >= 56 && (
          <Telop x={760} y={base - 30} size={36} fill={K.ol} sw={0}>
            被替代
          </Telop>
        )}
        {f >= 70 && (
          <g transform={`translate(560 ${base - up - 10}) scale(${E.back(seg(f, 70, 80))})`}>
            <rect x={-10} y={-50} width={330} height={70} rx={18} fill={K.yellow} {...SO} strokeWidth={6} />
            <Telop x={155} y={-2} size={40} fill={K.ol} sw={0}>
              净增 ≈0.78 亿
            </Telop>
          </g>
        )}
      </Layer>
      {b2 >= 0 &&
        b3 < 0 &&
        shrink.map((t, i) => (
          <div key={t} style={{position: 'absolute', left: 1130 + (i % 2) * 300, top: 250 + i * 120}}>
            <DropTag f={b2 - i * 10} text={t} col={K.red} dir={1} />
          </div>
        ))}
      {b3 >= 0 &&
        grow.map((t, i) => (
          <div key={t} style={{position: 'absolute', left: 1100 + (i % 3) * 260, top: 220 + Math.floor(i / 3) * 140}}>
            <DropTag f={b3 - i * 8} text={t} col={K.green} dir={-1} />
          </div>
        ))}
      {b3 >= 0 && (
        <div style={{position: 'absolute', left: 1180, top: 560, transform: `scale(${E.back(seg(b3, 50, 60))})`}}>
          <Sticker text="增长的岗位" size={44} col={K.lime} rot={3} />
        </div>
      )}
      {b2 >= 0 && b3 < 0 && (
        <div style={{position: 'absolute', left: 1180, top: 650, transform: `scale(${E.back(seg(b2, 30, 40))})`}}>
          <Sticker text="减少的岗位" size={44} col={K.white} rot={-3} />
        </div>
      )}
    </>
  );
};

/** Tag that drops in (dir 1, then sinks) or rises in (dir −1). */
const DropTag: React.FC<{f: number; text: string; col: string; dir: 1 | -1}> = ({f, text, col, dir}) => {
  if (f < 0) return null;
  const p = E.back(seg(f, 0, 10));
  const sink = dir === 1 ? 6 * Math.max(0, f - 20) * 0.15 : -4 * Math.sin(f / 8);
  return (
    <div style={{transform: `translateY(${(1 - p) * -200 * dir + sink}px) scale(${p})`}}>
      <Sticker text={text} size={48} col={col} fg={K.white} rot={dir === 1 ? -4 : 3} />
    </div>
  );
};

// ------------------------------------------------------------------ 结尾
export const Outro: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [5, 4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set={ph >= 4 ? 'yellow' : ph === 1 ? 'lime' : 'tangerine'} pattern={ph >= 4 ? 'rays' : 'dots'} floor={FLOOR} curtain={ph >= 4 ? K.red : null} />
        {ph === 0 && (
          <>
            <div style={{position: 'absolute', left: 110, top: 250, transform: `scale(${E.back(seg(b[0], 0, 10))}) rotate(-2deg)`, transformOrigin: '0 0'}}>
              <NewsTile src={A.newsMusk} w={1000} h={330} outlet="Fortune" date="2026.1.19" focus="0% 30%" />
            </div>
            <Pop f0={at[0] + 40} x={1180} y={300} origin="0 50%">
              <Bubble w={620} tail="left" size={48}>
                “我的预测是，
                <br />
                工作会变成可选的。”
                <div style={{fontFamily: F_CJK, fontWeight: 700, fontSize: 28, marginTop: 10, color: '#555', whiteSpace: 'nowrap'}}>马斯克 · 2025.11 · 预测 10–20 年后</div>
              </Bubble>
            </Pop>
          </>
        )}
        {ph === 1 && <At f0={at[1]}><Garden f={b[1]} /></At>}
        {ph === 2 && <At f0={at[2]}><VideoFactory f={b[2]} /></At>}
        {ph === 3 && (
          <>
            <Layer>
              <Bean x={760} y={FLOOR} scale={1.5} color={K.orange} belly={K.cream} item="mic" hey={0.5 + 0.4 * Math.sin(f / 5)} hop={20} face="up" open />
              <g transform={`translate(1150 ${FLOOR - 120})`}>
                <rect x={-120} y={-80} width={200} height={140} rx={20} fill={K.navy} {...SO} />
                <circle cx={-20} cy={-10} r={44} fill={K.sky} {...SO} strokeWidth={6} />
                <rect x={80} y={-50} width={50} height={80} fill={K.navy} {...SO} strokeWidth={6} />
                <rect x={-30} y={60} width={20} height={60} fill={K.ol} />
              </g>
              {[0, 1, 2, 3].map((i) => {
                const t = (((f + i * 15) % 60) + 60) % 60 / 60;
                return <path key={i} d={heartPath(0.9)} transform={`translate(${600 + i * 100} ${560 - t * 220})`} fill={K.red} {...SO} strokeWidth={4} opacity={1 - t} />;
              })}
              <g transform={`translate(1650 ${FLOOR}) scale(0.7)`}>
                <Bean x={0} y={0} kind="bot" color={K.steel} belly={K.sky} ant="q" hop={0} hey={0.2} />
              </g>
            </Layer>
            <Pop f0={at[3] + 6} x={140} y={240}>
              <Sticker text="享受做它的过程" size={50} col={K.white} rot={-3} />
            </Pop>
            {b[3] >= 70 && (
              <Stamp f0={at[3] + 70} x={1300} y={400} size={90} col={K.yellow}>
                抢不走这份乐趣
              </Stamp>
            )}
          </>
        )}
        {ph === 4 && (
          <>
            <Title text="哪份工作最安全？" f0={at[4]} y={330} size={130} col={K.white} />
            <Layer>
              <Bean x={960} y={FLOOR} scale={1.2} color={K.purple} belly="#B9A6F0" ant="q" hop={14} />
            </Layer>
          </>
        )}
        {ph === 5 && (
          <>
            <Layer>
              {[
                {c: K.orange, item: 'mic' as const, hat: 'none' as const},
                {c: K.blue, item: 'wrench' as const, hat: 'cap' as const},
                {c: K.pink, item: 'heart' as const, hat: 'nurse' as const},
                {c: K.purple, item: 'fan' as const, hat: 'opera' as const},
                {c: K.green, item: 'brush' as const, hat: 'beret' as const},
              ].map((p, i) => (
                <Bean key={i} x={300 + i * 330} y={FLOOR} scale={0.95} color={p.c} belly={K.cream} item={p.item} hat={p.hat} hop={20} phase={i * 0.2} hey={b[5] >= 30 ? 1 : 0.4} open={b[5] >= 30} />
              ))}
              <g transform={`translate(960 330) scale(${E.back(seg(b[5], 4, 14)) * (1 + 0.05 * Math.sin(f / 4))})`}>
                <path d={heartPath(4.2)} fill={K.red} {...SO} strokeWidth={9} />
              </g>
              <Confetti f0={at[5] + 30} dur={80} seed={51} />
            </Layer>
            <Pop f0={at[5] + 20} x={960} y={500}>
              <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
                <TelopDiv size={76} color={K.white}>
                  你真心想做、不给钱也愿意做的那一份
                </TelopDiv>
              </div>
            </Pop>
          </>
        )}
      </Punch>
    </AbsoluteFill>
  );
};

const Garden: React.FC<{f: number}> = ({f}) => (
  <>
    <Layer>
      <rect x={300} y={FLOOR - 40} width={1000} height={40} fill={K.wood} {...SO} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const g = E.back(seg(f, 10 + i * 8, 24 + i * 8));
        return (
          <g key={i} transform={`translate(${380 + i * 170} ${FLOOR - 40}) scale(${g})`}>
            <rect x={-5} y={-120} width={10} height={120} fill={K.green} />
            <path d="M 0 -60 C -60 -80 -60 -130 -10 -110 Z" fill={K.green} {...SO} strokeWidth={5} />
            <path d="M 0 -90 C 60 -110 60 -160 10 -140 Z" fill={K.green} {...SO} strokeWidth={5} />
            {i % 2 === 0 && <circle cx={0} cy={-130} r={22} fill={K.red} {...SO} strokeWidth={5} />}
          </g>
        );
      })}
      <Bean x={1520} y={FLOOR} scale={1.25} color={K.orange} belly={K.cream} hat="cap" item="mop" hop={12} face="up" />
      <g transform={`translate(1660 280) rotate(${f})`}>
        <circle r={60} fill={K.yellow} {...SO} />
      </g>
    </Layer>
    <Pop f0={6} x={140} y={220}>
      <Sticker text="在自家院子里种菜" size={50} col={K.white} rot={-3} />
    </Pop>
    {f >= 60 && (
      <Stamp f0={60} x={1100} y={420} size={92} col={K.yellow}>
        累一点，但有人乐在其中
      </Stamp>
    )}
  </>
);

const VideoFactory: React.FC<{f: number}> = ({f}) => (
  <>
    <Layer>
      <rect x={160} y={700} width={1600} height={50} rx={25} fill={K.navy} {...SO} />
      {Array.from({length: 8}).map((_, i) => {
        const x = 160 + ((((f * 9 + i * 210) % 1680) + 1680) % 1680);
        return (
          <g key={i} transform={`translate(${x} 610)`}>
            <rect x={-80} y={-60} width={160} height={110} rx={12} fill={[K.pink, K.sky, K.yellow, K.lime][i % 4]} {...SO} strokeWidth={6} />
            <path d="M -16 -24 L 24 -4 L -16 16 Z" fill={K.ol} />
          </g>
        );
      })}
      <Bean x={960} y={FLOOR + 10} scale={0.8} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hop={30} hey={0.7} />
    </Layer>
    <Pop f0={4} x={140} y={220}>
      <Sticker text="做视频也一样" size={50} col={K.white} rot={-3} />
    </Pop>
    {f >= 40 && (
      <Pop f0={40} x={1000} y={260}>
        <Sticker text="批量生产 · 比谁更新得快" size={46} col={K.yellow} rot={3} />
      </Pop>
    )}
    {f >= 90 && (
      <Stamp f0={90} x={960} y={460} size={100} col={K.red}>
        最容易被替代
      </Stamp>
    )}
  </>
);
