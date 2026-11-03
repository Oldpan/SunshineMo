// v2 (typing close-up + flat diagram): DSpark = DFlash backbone + Markov head + confidence head + scheduler.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {Arrow, Box, C, Card, Chip, done, ease, Label, layerY, NUM, Page, Sentence, Src, Stack, Svg, TermS, Tok, ZH} from './type';

export const MK = '#C0567F'; // Markov head

/** base + subscript inside an SVG <text>. */
const Sb: React.FC<{b: string; s: string; tail?: string}> = ({b, s, tail}) => (
  <>
    <tspan>{b}</tspan>
    <tspan dy={7} style={{fontSize: '0.68em'}}>
      {s}
    </tspan>
    <tspan dy={-7}>{tail ?? ''}</tspan>
  </>
);
const CF = '#B7791F'; // confidence head
const SC = C.model; // scheduler

// shared overall structure (left half): target → proj → K/V into the 3-layer backbone; anchor + noise in; add-on slots above
const Structure: React.FC<{f: number; a: number; hi: number; on: number[]}> = ({f, a, hi, on}) => {
  const SX = 100,
    SY = 500,
    SW = 160,
    SH = 330,
    N = 10;
  const BX = 520,
    BW = 520,
    BY = 614,
    LH = 34,
    G = 10;
  const ly = (i: number) => BY + (2 - i) * (LH + G);
  const slots = [
    {zh: '① Markov 头', en: 'Markov head', c: MK},
    {zh: '② 置信度头', en: 'confidence head', c: CF},
    {zh: '③ 调度器', en: 'scheduler', c: SC},
  ];
  return (
    <g opacity={a}>
      <Stack x={SX} y={SY} w={SW} h={SH} n={N} color={C.target} bg={C.targetBg} hi={[7, 8, 9]} />
      <TermS x={SX + SW / 2} y={SY - 14} zh="目标模型" en="target model" c={C.target} size={21} anchor="middle" />
      <Label x={SX + SW / 2} y={SY + SH + 28} t="V4.1：取最后三层 37 / 38 / 39" anchor="middle" size={18} color={C.target} weight={600} />
      {[7, 8, 9].map((t) => (
        <Arrow key={t} pts={[[SX + SW + 4, layerY(SY, SH, N, t)], [300, layerY(SY, SH, N, t)], [300, 650], [316, 650]]} color={C.target} tone="target" w={2.5} head={false} />
      ))}
      <Box x={318} y={615} w={120} h={70} label="投影" sub="main_proj" size={22} fill={C.targetBg} stroke={C.target} />
      <Arrow pts={[[442, 650], [470, 650]]} color={C.target} tone="target" w={3} head={false} />
      <line x1={470} y1={ly(2) + LH / 2} x2={470} y2={ly(0) + LH / 2} stroke={C.target} strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Arrow pts={[[470, ly(i) + LH / 2], [BX - 4, ly(i) + LH / 2]]} color={C.target} tone="target" w={2.5} />
          <rect x={BX} y={ly(i)} width={BW} height={LH} rx={7} fill={C.drafterBg} stroke={C.drafter} strokeWidth={2} />
          <rect x={BX + 8} y={ly(i) + 7} width={26} height={LH - 14} rx={3} fill={C.target} opacity={0.7} />
          <rect x={BX + 38} y={ly(i) + 7} width={26} height={LH - 14} rx={3} fill={C.target} opacity={0.45} />
        </g>
      ))}
      <text x={BX + BW - 14} y={ly(1) + LH / 2 + 7} textAnchor="end" style={{font: `600 19px ${ZH}`, fill: C.drafter}}>
        DFlash 主体 backbone · 线上 3 个 MoE 层
      </text>
      <text x={BX + 74} y={ly(2) + LH / 2 + 6} style={{font: `600 17px ${ZH}`, fill: C.target}}>
        ← K V 来自目标特征
      </text>
      {/* shared, frozen embedding (in) and LM head (out) */}
      <rect x={BX} y={ly(0) + LH + 8} width={BW} height={28} rx={6} fill="#E9EEF6" stroke={C.target} strokeWidth={2} strokeDasharray="7 5" />
      <text x={BX + BW / 2} y={ly(0) + LH + 28} textAnchor="middle" style={{font: `600 18px ${ZH}`, fill: C.target}}>
        词嵌入 embedding · 与目标模型共享、冻结
      </text>
      <rect x={BX} y={BY - 38} width={BW} height={28} rx={6} fill="#E9EEF6" stroke={C.target} strokeWidth={2} strokeDasharray="7 5" />
      <text x={BX + BW / 2} y={BY - 18} textAnchor="middle" style={{font: `600 18px ${ZH}`, fill: C.target}}>
        输出头 LM head · 与目标模型共享、冻结
      </text>
      {/* inputs: anchor + noise × (γ − 1), γ = 5 */}
      {['很', '·', '·', '·', '·'].map((t, i) => (
        <g key={i}>
          <Chip x={BX + 60 + i * 100} y={ly(0) + LH + 72} t={t} s={i ? 'mask' : 'done'} size={22} />
          <Arrow pts={[[BX + 60 + i * 100, ly(0) + LH + 56], [BX + 60 + i * 100, ly(0) + LH + 40]]} color={C.ink} w={2} />
        </g>
      ))}
      <Label x={BX + 60} y={ly(0) + LH + 116} t="锚点 anchor + 4 个噪声位 noise（γ = 5），一次前向" size={18} />
      {/* outputs: base scores U_k per position */}
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <Arrow pts={[[BX + 60 + k * 100, BY - 40], [BX + 60 + k * 100, BY - 54]]} color={C.drafter} tone="drafter" w={2} />
          {[0.8, 0.45, 0.25].map((v, j) => (
            <rect key={j} x={BX + 36 + k * 100 + j * 17} y={BY - 60 - 36 * v} width={13} height={36 * v} fill={C.drafter} opacity={0.5 + 0.2 * (2 - j)} />
          ))}
          <text x={BX + 60 + k * 100} y={BY - 102} textAnchor="middle" style={{font: `italic 600 18px ${NUM}`, fill: C.drafter}}>
            <Sb b="U" s={`${k + 1}`} />
          </text>
        </g>
      ))}
      <text x={BX - 12} y={BY - 70} textAnchor="end" style={{font: `italic 600 19px ${NUM}`, fill: C.drafter}}>
        每位输出 <Sb b="h" s="k" tail="、" />
        <Sb b="U" s="k" />
      </text>
      {/* the three add-ons */}
      {slots.map((s, i) => {
        const lit = on.includes(i);
        const pulse = hi === i ? 0.5 + 0.5 * Math.sin(f * 0.25) : 0;
        return (
          <g key={i} opacity={lit ? 1 : 0.25}>
            <rect x={BX + i * 178} y={404} width={166} height={60} rx={10} fill={C.card} stroke={s.c} strokeWidth={2.5 + pulse * 2} />
            <text x={BX + i * 178 + 83} y={430} textAnchor="middle" style={{font: `700 19px ${ZH}`, fill: s.c}}>
              {s.zh}
            </text>
            <text x={BX + i * 178 + 83} y={454} textAnchor="middle" style={{font: `italic 500 17px ${NUM}`, fill: C.dim}}>
              {s.en}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ dspark_markov
export const DsparkMarkov: React.FC<{scene: Scene}> = () => (
  <Page tag="④ DSpark · 2026.07 · DeepSeek / 北京大学" title="DSpark：DFlash 主体，加三样东西" sub="Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation · arXiv 2607.05147">
    {({f, b}) => {
      const pS = ease(f, b[1], 18);
      const on = f >= b[2] ? [0, 1, 2] : [];
      const chain = f >= b[3] && f < b[6];
      const ex = f >= b[6] && f < b[8];
      const walk = (k: number) => ease(f, b[4] + k * 22, 12);
      const toks: Tok[] = done('今天天气很');
      ['好', '，', '适', '合'].forEach((t, k) => {
        if (f >= b[4] + k * 22) toks.push({t, s: 'draft', a: walk(k), tag: `位 ${k + 1}`});
      });
      const boost = ease(f, b[7], 24);
      return (
        <>
          <Sentence toks={toks} y={214} size={52} f={f} label="并行出分数，再从左往右走一遍" />
          <Svg>
            <Structure f={f} a={pS} hi={f >= b[3] ? 0 : -1} on={on} />
          </Svg>
          {/* right panel */}
          <div style={{position: 'absolute', left: 1110, top: 410, width: 714, height: 470, background: C.card, border: `2px solid ${C.line}`, borderRadius: 16, opacity: ease(f, b[3], 16) * (1 - ease(f, b[8], 12))}}>
            <div style={{position: 'absolute', left: 24, top: 16, font: `700 23px ${ZH}`, color: MK}}>
              ① Markov 头 <span style={{font: `italic 500 18px ${NUM}`, color: C.dim}}>Markov head · 让后一个词看到前一个</span>
            </div>
            <div style={{position: 'absolute', left: 24, top: 56, font: `500 24px ${NUM}`, color: C.ink}}>
              p<sub>k</sub> = softmax( U<sub>k</sub> + B(x<sub>k−1</sub>, ·) ) · B = W1·W2，秩 r = 256
            </div>
          </div>
          <Svg>
            {chain && (
              <g opacity={ease(f, b[3], 16)}>
                {/* anchor: position 1 is biased by B(很) */}
                <Chip x={1170} y={566} t="很" s="done" size={26} />
                <Arrow pts={[[1194, 566], [1214, 566], [1214, 663], [1236, 663]]} color={MK} tone="ink" w={2.5} p={walk(0)} />
                <Label x={1206} y={640} t="查 W1[很]" anchor="end" color={MK} weight={600} size={17} a={walk(0)} />
                {[0, 1, 2].map((k) => {
                  const x = 1290 + k * 200;
                  const w = walk(k);
                  return (
                    <g key={k}>
                      {[0.8, 0.5, 0.3].map((v, j) => (
                        <rect key={j} x={x - 34 + j * 24} y={820 - 70 * v} width={20} height={70 * v} fill={C.drafter} opacity={0.45 + 0.2 * (2 - j)} />
                      ))}
                      <text x={x} y={850} textAnchor="middle" style={{font: `italic 600 18px ${NUM}`, fill: C.drafter}}>
                        <Sb b="U" s={`${k + 1}`} tail="（并行）" />
                      </text>
                      {/* one upward flow: U_k → (+B) → sample → x_k */}
                      <Arrow pts={[[x, 760], [x, 690]]} color={C.drafter} tone="drafter" w={2.5} />
                      <g opacity={w}>
                        <rect x={x - 46} y={640} width={92} height={46} rx={8} fill="#F8E4EC" stroke={MK} strokeWidth={2} />
                        <text x={x} y={670} textAnchor="middle" style={{font: `700 20px ${NUM}`, fill: MK}}>
                          + B
                        </text>
                      </g>
                      <Arrow pts={[[x, 638], [x, 588]]} color={C.draft} tone="draft" w={2.5} p={w} label="采样" lx={x + 10} ly={620} />
                      <Chip x={x} y={566} t={['好', '，', '适'][k]} s="draft" size={26} a={w} />
                      {k < 2 && <Arrow pts={[[x + 24, 566], [x + 100, 566], [x + 100, 663], [x + 200 - 50, 663]]} color={MK} tone="ink" w={2.5} p={walk(k + 1)} label="查 W1[x]" lx={x + 108} ly={612} />}
                    </g>
                  );
                })}
              </g>
            )}
            {ex && (
              <g opacity={ease(f, b[6], 14)}>
                <Label x={1134} y={530} t="论文 §3.1 的例子 · 条长为示意" size={19} />
                {[
                  ['第 1 位', [['of', 0.5], ['no', 0.48]]],
                  ['第 2 位', [['course', 0.47 + 0.4 * boost], ['problem', 0.5 - 0.3 * boost]]],
                ].map(([pos, words], c) => (
                  <g key={c}>
                    <text x={1150 + c * 330} y={580} style={{font: `700 21px ${ZH}`, fill: C.dim}}>
                      {pos as string}
                    </text>
                    {(words as [string, number][]).map(([w, v], j) => {
                      const pick = c === 0 ? j === 0 : boost > 0.5 ? j === 0 : j === 1;
                      return (
                        <g key={w}>
                          <text x={1150 + c * 330} y={630 + j * 56} style={{font: `700 24px ${NUM}`, fill: pick ? C.ink : C.dim}}>
                            {w}
                          </text>
                          <rect x={1260 + c * 330} y={610 + j * 56} width={200 * v} height={26} rx={4} fill={pick ? (c === 1 && boost > 0.5 ? C.ok : C.drafter) : C.line} />
                        </g>
                      );
                    })}
                  </g>
                ))}
                <text x={1150} y={800} style={{font: `700 30px ${NUM}`, fill: boost > 0.5 ? C.ok : C.bad}}>
                  {boost > 0.5 ? 'of course ✓' : 'of problem ✗'}
                </text>
                <text x={1150} y={840} style={{font: `500 20px ${ZH}`, fill: C.dim}}>
                  {boost > 0.5 ? '采到 of 以后，Markov 偏置抬高 course' : '纯并行：两位各自采样，可能拼错'}
                </text>
              </g>
            )}
          </Svg>
          <Card x={1110} y={520} w={714} a={ease(f, b[8], 16)} rows={[{t: '串行一遍，但很轻', sub: '批量 128 · 草稿从 4 个加到 16 个，整轮延迟只多 0.2%–1.3%', c: MK}, {t: '草稿分布仍是逐位精确的 softmax', sub: '所以照样能做拒绝采样，无损', c: C.ok}]} />
          <Src t="DSpark 论文 §3、§3.1 式 (4)(5)、Figure 1 · V4.1 config：dspark_target_layer_ids [37, 38, 39]、block 5" a={pS} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ dspark_conf
const CONF = [0.95, 0.85, 0.75, 0.6]; // illustrative, γ = 5 → 4 draft slots
export const DsparkConf: React.FC<{scene: Scene}> = () => (
  <Page tag="④ DSpark · 置信度头" title="② 置信度头：这一位能过的概率" sub="confidence head · 式 (7)">
    {({f, b}) => {
      const surv = CONF.map((_, j) => CONF.slice(0, j + 1).reduce((p, c) => p * c, 1));
      const pM = ease(f, b[1], 16);
      const pS = ease(f, b[2], 16);
      const toks: Tok[] = [...done('今天天气很'), ...['好', '，', '适', '合'].map((t, j) => ({t, s: 'draft' as const, tag: `c=${CONF[j].toFixed(2)}`, a: ease(f, 10 + j * 6, 10)}))];
      return (
        <>
          <Sentence toks={toks} y={214} size={52} f={f} label="每个草稿位估一个通过概率 · 数值为示意" />
          <Svg>
            {/* the head's inputs */}
            <g opacity={ease(f, b[0], 16)}>
              <Box x={110} y={450} w={330} h={76} sub="DFlash 主体最后一层，这一位的隐状态" size={24} fill={C.drafterBg} stroke={C.drafter} />
              <text x={275} y={480} textAnchor="middle" style={{font: `italic 700 26px ${NUM}`, fill: C.drafter}}>
                <Sb b="h" s="k" />
              </text>
              <Box x={110} y={560} w={330} h={76} sub="前一个词的低秩向量（共用 W1）" size={24} fill="#F8E4EC" stroke={MK} />
              <text x={275} y={590} textAnchor="middle" style={{font: `italic 700 26px ${NUM}`, fill: MK}}>
                <Sb b="W1[x" s="k−1" tail="]" />
              </text>
              <Arrow pts={[[444, 488], [500, 488], [500, 540], [530, 540]]} color={C.drafter} tone="drafter" w={2.5} />
              <Arrow pts={[[444, 598], [500, 598], [500, 540], [530, 540]]} color={MK} tone="ink" w={2.5} />
              <Box x={534} y={500} w={200} h={80} label="σ(wᵀ[ · ; · ])" size={22} stroke={CF} />
              <Arrow pts={[[738, 540], [790, 540]]} color={CF} tone="draft" w={3} />
              <text x={800} y={550} style={{font: `italic 700 30px ${NUM}`, fill: CF}}>
                <Sb b="c" s="k" />
              </text>
              <text x={110} y={690} opacity={pM} style={{font: `600 22px ${ZH}`, fill: C.ink}}>
                <Sb b="c" s="k" tail="：前面都被接受的前提下，第 k 个能过的概率" />
              </text>
            </g>
            {/* survival: running product */}
            <g opacity={ease(f, b[0] + 30, 16)}>
              {CONF.map((c, j) => {
                const x = 1000 + j * 130;
                return (
                  <g key={j}>
                    <rect x={x} y={820 - 300 * c} width={44} height={300 * c} rx={5} fill={CF} opacity={0.35} />
                    <rect x={x + 50} y={820 - 300 * surv[j] * pS} width={44} height={300 * surv[j] * pS} rx={5} fill={C.ok} />
                    <text x={x + 47} y={850} textAnchor="middle" style={{font: `600 18px ${ZH}`, fill: C.dim}}>
                      位 {j + 1}
                    </text>
                    {pS > 0.5 && (
                      <text x={x + 72} y={810 - 300 * surv[j]} textAnchor="middle" style={{font: `700 18px ${NUM}`, fill: C.ok}}>
                        {surv[j].toFixed(2)}
                      </text>
                    )}
                  </g>
                );
              })}
              <rect x={1000} y={440} width={18} height={18} fill={CF} opacity={0.35} />
              <text x={1026} y={456} style={{font: `500 20px ${ZH}`, fill: C.dim}}>
                <Sb b="c" s="k" tail=" 单位通过概率" />
              </text>
              <rect x={1260} y={440} width={18} height={18} fill={C.ok} opacity={pS} />
              <Label x={1286} y={456} t="连乘：存活概率 survival probability" size={20} a={pS} />
            </g>
          </Svg>
          <Src t="DSpark 论文 式 (7)、§3.2 · 数值为示意（STS 校准后平均 ECE 约 1%）" a={ease(f, b[0], 14)} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ dspark_sched
const REQ = [
  [0.95, 0.9, 0.82, 0.7, 0.55],
  [0.8, 0.6, 0.42, 0.28, 0.15],
  [0.9, 0.75, 0.5, 0.3, 0.12],
]; // illustrative survival per draft slot
const RC = ['#5B7FB0', '#8E6CC0', '#3E9C9A'];
const ALL = REQ.flatMap((r, ri) => r.map((v, j) => ({ri, j, v}))).sort((p, q) => q.v - p.v);
const SPS = (B: number) => 1 / (1 + 0.07 * B); // illustrative throughput curve
const THETA = ALL.map((_, n) => (3 + ALL.slice(0, n).reduce((s, c) => s + c.v, 0)) * SPS(3 + n)).concat([(3 + ALL.reduce((s, c) => s + c.v, 0)) * SPS(3 + ALL.length)]);
const STOP = THETA.findIndex((v, i) => i < ALL.length && THETA[i + 1] <= v);

export const DsparkSched: React.FC<{scene: Scene}> = () => (
  <Page tag="④ DSpark · 调度器" title="③ 调度器：每个请求这一轮核几个" sub="scheduler · Algorithm 1 · 按实测吞吐曲线逐个加入，吞吐不再上升就停">
    {({f, b}) => {
      const sort = ease(f, b[1], 30);
      const admitted = f >= b[2] ? Math.min(STOP + 1, Math.floor((f - b[2]) / 8)) : 0;
      const stopped = f >= b[3];
      const late = ease(f, b[4], 16);
      const QX0 = 110,
        QW = 62;
      const mn = THETA[0],
        mx = Math.max(...THETA);
      const px = (i: number) => 1240 + i * 36;
      const py = (v: number) => 800 - ((v - mn) / (mx - mn)) * 220;
      return (
        <>
          <Svg>
            <g opacity={1 - late}>
              {/* requests with their survival bars, then sorted into one queue */}
              {ALL.map((c, k) => {
                const rx = QX0 + 120 + c.j * QW,
                  ry = 240 + c.ri * 110;
                const qx = QX0 + k * QW,
                  qy = 620;
                const x = rx + (qx - rx) * sort,
                  y = ry + (qy - ry) * sort;
                const h = 80 * c.v;
                const inQ = k < admitted;
                const cut = stopped && k >= STOP;
                return (
                  <g key={k}>
                    <rect x={x} y={y + 80 - h} width={QW - 10} height={h} rx={5} fill={RC[c.ri]} opacity={cut ? 0.2 : inQ ? 1 : 0.55} />
                    {inQ && !cut && <rect x={x - 3} y={y - 3 + 80 - h} width={QW - 4} height={h + 6} rx={6} fill="none" stroke={C.ink} strokeWidth={2} />}
                  </g>
                );
              })}
              {['请求 A', '请求 B', '请求 C'].map((s, ri) => (
                <text key={s} x={QX0} y={240 + ri * 110 + 60} style={{font: `700 22px ${ZH}`, fill: RC[ri]}} opacity={1 - sort}>
                  {s}
                </text>
              ))}
              <Label x={QX0} y={740} t="所有请求的草稿位，按存活概率从高到低排队 · 黑框 = 已加入这一轮核对" size={20} a={sort} />
              <g opacity={sort}>
                {['请求 A', '请求 B', '请求 C'].map((s2, ri) => (
                  <g key={s2}>
                    <rect x={QX0 + ri * 150} y={560} width={18} height={18} rx={3} fill={RC[ri]} />
                    <text x={QX0 + 26 + ri * 150} y={577} style={{font: `700 20px ${ZH}`, fill: RC[ri]}}>
                      {s2}
                    </text>
                  </g>
                ))}
              </g>
              <g opacity={ease(f, b[3] + 20, 14)}>
                <text x={QX0} y={800} style={{font: `700 26px ${ZH}`, fill: C.ink}}>
                  这一轮核对：
                  {[0, 1, 2].map((ri) => (
                    <tspan key={ri} style={{fill: RC[ri]}}>
                      {`${'ABC'[ri]} ${ALL.slice(0, STOP).filter((c) => c.ri === ri).length} 个${ri < 2 ? ' · ' : ''}`}
                    </tspan>
                  ))}
                  <tspan style={{font: `500 20px ${ZH}`, fill: C.dim}}> （示意）</tspan>
                </text>
              </g>
              {stopped && <line x1={QX0 + STOP * QW - 6} y1={600} x2={QX0 + STOP * QW - 6} y2={720} stroke={C.bad} strokeWidth={4} />}
            </g>
            {/* throughput curve */}
            <g opacity={ease(f, b[2], 16) * (1 - late)}>
              <rect x={1180} y={460} width={644} height={420} rx={16} fill={C.card} stroke={C.line} strokeWidth={2} />
              <TermS x={1204} y={500} zh="总吞吐 Θ = τ · SPS(B)" en="throughput" size={22} />
              <Label x={1204} y={530} t="SPS：启动时实测的每秒步数曲线 · 形状示意" size={18} />
              <line x1={1230} y1={580} x2={1230} y2={810} stroke={C.ink} strokeWidth={2} />
              <line x1={1230} y1={810} x2={1800} y2={810} stroke={C.ink} strokeWidth={2} />
              {THETA.slice(0, admitted + 1).map((v, i) => (
                <circle key={i} cx={px(i)} cy={py(v)} r={7} fill={i === STOP + 1 ? C.bad : C.target} />
              ))}
              {stopped && (
                <text x={px(STOP)} y={py(THETA[STOP]) - 18} textAnchor="middle" style={{font: `700 26px ${ZH}`, fill: C.bad}}>
                  停
                </text>
              )}
              <Label x={1800} y={846} t="加入的草稿位 →" anchor="end" size={18} />
            </g>
          </Svg>
          {late > 0 && (
            <>
              <Card x={96} y={240} w={1728} a={late} rows={[{t: '人少：每个请求多核几个 · 人多：每个请求自动变短', sub: '不需要人去调「每次猜几个」', c: SC}]} />
              <Svg>
                <g opacity={ease(f, b[4] + 24, 16)}>
                  {[2, 4, 6].map((v) => (
                    <text key={v} x={186} y={836 - v * 38} textAnchor="end" style={{font: `600 18px ${NUM}`, fill: C.dim}}>
                      {v}
                    </text>
                  ))}
                  <TermS x={200} y={440} zh="DeepSeek V4-Flash 线上 · 每个请求核几个" en="Figure 8" size={24} />
                  <line x1={200} y1={560} x2={200} y2={830} stroke={C.ink} strokeWidth={2} />
                  <line x1={200} y1={830} x2={1400} y2={830} stroke={C.ink} strokeWidth={2} />
                  <path
                    d={`M200,${830 - 6 * 38} L560,${830 - 6 * 38} C860,${830 - 5.6 * 38} 1100,${830 - 3.2 * 38} 1400,${830 - 2.8 * 38} L1400,${830 - 2.2 * 38} C1100,${830 - 2.4 * 38} 860,${830 - 3.8 * 38} 560,${830 - 4 * 38} L200,${830 - 4 * 38} Z`}
                    fill={C.ok}
                    opacity={0.35}
                  />
                  <line x1={200} y1={830 - 2 * 38} x2={1400} y2={830 - 2 * 38} stroke={C.dim} strokeWidth={3} strokeDasharray="10 8" />
                  <Label x={220} y={830 - 6 * 38 - 16} t="DSpark：约 4–6 个" color={C.ok} weight={700} size={22} />
                  <Label x={220} y={830 - 2 * 38 - 12} t="MTP-1：每次核 2 个（1 草稿 + 1 补位）" color={C.dim} weight={600} size={20} />
                  <Label x={560} y={862} t="200" anchor="middle" size={18} />
                  <Label x={1400} y={862} t="并发 →（Figure 8，形状示意）" anchor="end" size={18} />
                </g>
              </Svg>
            </>
          )}
          <Src t="DSpark 论文 Algorithm 1、§3.2.2、§5.4 · 排队与吞吐曲线为示意" a={ease(f, b[1], 14)} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ dspark_num
export const DsparkNum: React.FC<{scene: Scene}> = () => (
  <Page tag="④ DSpark · 数字" title="DSpark 在 DeepSeek 线上替换了 MTP" sub="V4-preview 发布两周后（论文 §5.4）">
    {({f, b}) => {
      const p1 = ease(f, b[1], 20);
      const p2 = ease(f, b[2], 20);
      const p3 = ease(f, b[3], 16);
      return (
        <>
          <Card x={96} y={240} w={540} a={ease(f, b[0], 16)} head="V4 线上" rows={[{t: 'MTP-1 → DSpark', sub: 'MTP-1 固定只多猜 1 个', c: C.drafter}]} />
          <div style={{position: 'absolute', left: 96, top: 440, width: 540, opacity: p1}}>
            <div style={{font: `700 22px ${ZH}`, color: C.dim}}>同样总吞吐下，单个用户的速度</div>
            <div style={{font: `600 72px ${NUM}`, color: C.ok, marginTop: 6}}>+60%～85%</div>
            <div style={{font: `500 21px ${ZH}`, color: C.dim}}>V4-Flash（V4-Pro +57%～78%）· Figure 7</div>
          </div>
          <div style={{position: 'absolute', left: 720, top: 240, width: 1104, opacity: p2}}>
            <div style={{font: `700 22px ${ZH}`, color: C.dim, marginBottom: 14}}>离线 · Qwen3-4B · 只猜一条链（γ = 7）· τ 宏平均（Table 1，T = 1，关闭调度器）</div>
            {[
              ['EAGLE-3', 1.0, C.faint, ''],
              ['DFlash', 1.309 / 1.163, '#7FBDBB', ''],
              ['DSpark', 1.309, C.drafter, '比 EAGLE-3 高 30.9% · 比 DFlash 高 16.3%'],
            ].map(([n, v, c, t], i) => (
              <div key={n as string} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 12}}>
                <div style={{width: 120, font: `700 24px ${NUM}`}}>{n}</div>
                <div style={{height: 44, width: (v as number) * 360 * p2, background: c as string, borderRadius: 6}} />
                <div style={{font: `600 22px ${ZH}`, color: C.ok}}>{t}</div>
              </div>
            ))}
            <div style={{font: `500 18px ${ZH}`, color: C.dim, marginTop: 10}}>柱长按相对比例画</div>
          </div>
          <Svg>
            <g opacity={p3}>
              <line x1={760} y1={760} x2={1800} y2={760} stroke={C.ink} strokeWidth={3} />
              {[
                [820, 'V3', 'MTP 随预训练一起训', C.target],
                [1160, 'V4', 'MTP-1 → 两周后换成 DSpark', C.drafter],
                [1500, 'V4.1', '预训练不带 MTP；\n主干冻住后单独训 DSpark', C.ok],
              ].map(([x, n, t, c]) => (
                <g key={n as string}>
                  <circle cx={x as number} cy={760} r={10} fill={c as string} />
                  <text x={x as number} y={730} textAnchor="middle" style={{font: `700 28px ${NUM}`, fill: c as string}}>
                    {n}
                  </text>
                  <foreignObject x={(x as number) - 160} y={780} width={320} height={90}>
                    <div style={{font: `500 20px ${ZH}`, color: C.ink, textAlign: 'center', whiteSpace: 'pre-line'}}>{t}</div>
                  </foreignObject>
                </g>
              ))}
            </g>
          </Svg>
          <Src t={f >= b[3] ? 'DeepSeek-V4.1 技术报告 §2.1、§2.4.3 · DSpark 论文 §5.4' : f >= b[2] ? 'DSpark 论文 Table 1（T = 1，关闭调度器）' : 'DSpark 论文 §5.4、Figure 7'} a={ease(f, b[0], 14)} />
        </>
      );
    }}
  </Page>
);
