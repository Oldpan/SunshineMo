// v2 (typing close-up + flat diagram): the five side by side, two caveats, the outro, and the cover.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Scene} from '@atv/lib/types';
import {Arrow, Box, C, Card, Chip, done, ease, Label, NUM, Page, Sentence, Src, Svg, Tok, TokBox, ZH} from './type';

const MK = '#C0567F';
const SEL = '#3F8F4E';

// ------------------------------------------------------------------ compare: five rows, one mini structure each
const ROWS: {n: string; d: string; how: string; link: string}[] = [
  {n: 'MTP', d: '2024', how: '模型自带，预训练时一起长出来', link: '吃主模型的隐状态；共用 embedding 和输出头'},
  {n: 'EAGLE-3', d: '2025.03', how: '外挂 1 层，一层一层猜，长成一棵树', link: '吃目标模型低 / 中 / 高三层特征'},
  {n: 'DFlash', d: '2026.02', how: '一次前向，压出一整块', link: '5 层特征注入草稿每一层的 K、V'},
  {n: 'DSpark', d: '2026.07', how: '整块 + 串行修正 + 置信度 + 调度', link: 'DFlash 主体；按负载决定核几个'},
  {n: 'DFlash 2', d: '2026.08', how: '在 top-16 候选里选一条连贯的路', link: 'DFlash 主体 + 两抽头卷积'},
];
const RY = (i: number) => 200 + i * 136;

const Mini: React.FC<{i: number}> = ({i}) => {
  const y = RY(i) + 20;
  const T = (x: number, w = 90, label = '目标') => <Box x={x} y={y + 10} w={w} h={70} fill={C.targetBg} stroke={C.target} label={label} size={20} color={C.target} />;
  const chips = (x: number, n: number, s: Tok['s'] = 'draft', step = 34) => Array.from({length: n}, (_, k) => <Chip key={k} x={x + k * step} y={y + 45} t="" s={s} size={20} />);
  switch (i) {
    case 0:
      return (
        <g>
          {T(370, 110, '主模型')}
          <Arrow pts={[[484, y + 45], [530, y + 45]]} color={C.model} tone="model" />
          <Box x={534} y={y + 10} w={150} h={70} fill={C.drafterBg} stroke={C.drafter} label="MTP 模块" size={20} color={C.drafter} />
          <Arrow pts={[[688, y + 45], [730, y + 45]]} color={C.draft} tone="draft" />
          {chips(752, 1)}
          <Label x={800} y={y + 52} t="+1 个" size={18} />
        </g>
      );
    case 1:
      return (
        <g>
          {T(370, 110, '低中高')}
          <Arrow pts={[[484, y + 45], [530, y + 45]]} color={C.target} tone="target" />
          <Box x={534} y={y + 10} w={110} h={70} fill={C.drafterBg} stroke={C.drafter} label="1 层" size={20} color={C.drafter} />
          <Arrow pts={[[589, y + 8], [589, y - 6], [620, y - 6], [620, y + 8]]} color={C.drafter} tone="drafter" dash w={2} head={false} />
          <Arrow pts={[[648, y + 45], [690, y + 45]]} color={C.draft} tone="draft" />
          {[
            [710, 45],
            [760, 20],
            [760, 70],
            [810, 8],
            [810, 34],
            [810, 70],
          ].map(([x, dy], k) => (
            <Chip key={k} x={x} y={y + dy} t="" size={14} />
          ))}
          <path d={`M718,${y + 45} L752,${y + 20} M718,${y + 45} L752,${y + 70} M768,${y + 20} L802,${y + 8} M768,${y + 20} L802,${y + 34} M768,${y + 70} L802,${y + 70}`} stroke={C.faint} strokeWidth={2} />
        </g>
      );
    case 2:
      return (
        <g>
          {T(370, 110, '5 层特征')}
          <Arrow pts={[[484, y + 45], [530, y + 45]]} color={C.target} tone="target" label="K V" lx={490} ly={y + 32} />
          <Box x={534} y={y + 10} w={110} h={70} fill={C.drafterBg} stroke={C.drafter} label="5 层" size={20} color={C.drafter} />
          <Arrow pts={[[648, y + 45], [680, y + 45]]} color={C.draft} tone="draft" />
          {chips(698, 15, 'draft', 30)}
        </g>
      );
    case 3:
      return (
        <g>
          <Box x={370} y={y + 10} w={160} h={70} fill={C.drafterBg} stroke={C.drafter} label="DFlash 主体" size={19} color={C.drafter} />
          <Arrow pts={[[534, y + 45], [560, y + 45]]} color={C.ink} />
          {[
            ['Markov', MK],
            ['置信度', '#B7791F'],
            ['调度', C.model],
          ].map(([t, c], k) => (
            <Box key={k} x={564 + k * 100} y={y + 18} w={92} h={54} label={t} size={17} stroke={c} color={c} />
          ))}
          <Arrow pts={[[862, y + 45], [890, y + 45]]} color={C.draft} tone="draft" />
          {chips(910, 4)}
          <Label x={1040} y={y + 52} t="2–6 个" size={18} />
        </g>
      );
    default:
      return (
        <g>
          <Box x={370} y={y + 10} w={160} h={70} fill={C.drafterBg} stroke={C.drafter} label="DFlash + 卷积" size={19} color={C.drafter} />
          <Arrow pts={[[534, y + 45], [570, y + 45]]} color={C.ink} />
          {Array.from({length: 6}, (_, c) =>
            Array.from({length: 4}, (_, r) => <rect key={`${c}${r}`} x={590 + c * 44} y={y + r * 22} width={30} height={16} rx={3} fill={C.card} stroke={C.line} strokeWidth={1.5} />),
          )}
          <path d={`M605,${y + 8} L649,${y + 30} L693,${y + 8} L737,${y + 52} L781,${y + 30} L825,${y + 8}`} stroke={SEL} strokeWidth={4} fill="none" />
        </g>
      );
  }
};

export const Compare: React.FC<{scene: Scene}> = () => (
  <Page tag="收尾" title="五台草稿机，放在一起比一比">
    {({f, b}) => (
      <>
        <Svg>
          {ROWS.map((r, i) => {
            const a = ease(f, b[i + 1], 14);
            return (
              <g key={r.n} opacity={a}>
                <rect x={96} y={RY(i)} width={1728} height={122} rx={14} fill={C.card} stroke={C.line} strokeWidth={2} />
                <text x={122} y={RY(i) + 58} style={{font: `700 34px ${NUM}`, fill: C.ink}}>
                  {r.n}
                </text>
                <text x={122} y={RY(i) + 94} style={{font: `600 20px ${NUM}`, fill: C.dim}}>
                  {r.d}
                </text>
                <Mini i={i} />
                <text x={1290} y={RY(i) + 52} style={{font: `700 24px ${ZH}`, fill: C.ink}}>
                  {r.how}
                </text>
                <text x={1290} y={RY(i) + 88} style={{font: `500 20px ${ZH}`, fill: C.dim}}>
                  {r.link}
                </text>
              </g>
            );
          })}
        </Svg>
      </>
    )}
  </Page>
);

// ------------------------------------------------------------------ caveats
const NUMS: [string, string, string][] = [
  ['MTP', '1.8× TPS', 'DeepSeek-V3 自家'],
  ['EAGLE-3', '4.44×', 'Llama-3.1-8B · T=0 平均'],
  ['DFlash', '4.86×', 'Qwen3-8B · T=0 · H200'],
  ['DSpark', '+60%～85%', '对 MTP-1 · 同吞吐 · V4-Flash'],
  ['DFlash 2', '3.43×', 'Qwen3.8-27B · H200'],
];
const SLOPES: [string, number, number, string, string, string, string][] = [
  ['DFlash', 5.1, 2.8, '并发 1', '32', 'B200 · Math500', C.drafter],
  ['DFlash 2', 3.43, 1.45, '并发 1', '32', 'H200 · GSM8K', SEL],
  ['EAGLE-3', 1.81, 1.38, '批量 2', '64', 'H100 · MT-Bench · 无树、链长 3', '#B07A4F'],
];
export const Caveat: React.FC<{scene: Scene}> = () => (
  <Page tag="收尾" title="两点提醒">
    {({f, b}) => {
      const q = ease(f, b[1], 20);
      const c = ease(f, b[2], 16);
      const x0 = 260,
        x1 = 760,
        y0 = 850,
        u = 72;
      return (
        <>
          {NUMS.map(([n, v, sub], i) => (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: 96 + i * 350,
                top: 190,
                width: 330,
                padding: '16px 20px',
                boxSizing: 'border-box',
                background: C.card,
                border: `2px solid ${C.line}`,
                borderRadius: 14,
                opacity: ease(f, b[1] + i * 6, 12),
              }}
            >
              <div style={{font: `700 22px ${NUM}`}}>{n}</div>
              <div style={{font: `600 38px ${NUM}`, marginTop: 4}}>{v}</div>
              <div style={{font: `500 17px ${ZH}`, color: C.dim, marginTop: 4}}>{sub}</div>
              {i > 0 && <div style={{position: 'absolute', left: -18, top: 50, font: `700 28px ${NUM}`, color: C.bad, opacity: ease(f, b[1] + 40, 12)}}>≠</div>}
            </div>
          ))}
          <div style={{position: 'absolute', left: 96, top: 360, font: `600 22px ${ZH}`, color: C.bad, opacity: q}}>不同论文、不同模型、不同机器，不能直接横着比</div>
          <div style={{position: 'absolute', left: 96, top: 420, font: `700 26px ${ZH}`, opacity: c}}>并发一高，GPU 算力不再闲着，加速都会缩水（各线终点不同）</div>
          <Svg>
            <g opacity={c}>
              <line x1={x0} y1={y0 - 5.6 * u} x2={x0} y2={y0} stroke={C.ink} strokeWidth={2} />
              <line x1={x0} y1={y0} x2={x1 + 20} y2={y0} stroke={C.ink} strokeWidth={2} />
              <line x1={x0} y1={y0 - u} x2={x1 + 20} y2={y0 - u} stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
              <Label x={x0 + 10} y={y0 - u - 10} t="1×（不投机）" size={17} />
              <Label x={x0} y={y0 + 30} t="少" anchor="middle" size={18} />
              <Label x={x1} y={y0 + 30} t="多（并发 / 批量）" anchor="middle" size={18} />
              {SLOPES.map(([n, v0, v1, l0, l1, cap, col], i) => {
                const a = ease(f, b[2] + 10 + i * 14, 20);
                const hi = (n === 'EAGLE-3' || n === 'DFlash 2') && f >= b[3];
                const ya = y0 - v0 * u,
                  yb = y0 - v1 * u;
                const ly = [yb - 30, yb + 4, yb + 44][i];
                return (
                  <g key={n} opacity={a}>
                    <line x1={x0} y1={ya} x2={x0 + (x1 - x0) * a} y2={ya + (yb - ya) * a} stroke={col} strokeWidth={hi ? 6 : 4} />
                    <circle cx={x0} cy={ya} r={6} fill={col} />
                    <circle cx={x1} cy={yb} r={6} fill={col} opacity={a > 0.95 ? 1 : 0} />
                    <text x={x0 - 14} y={ya + 7} textAnchor="end" style={{font: `700 21px ${NUM}`, fill: C.ink}}>
                      {v0}×
                    </text>
                    <text x={x1 + 24} y={ly} style={{font: `700 22px ${NUM}`, fill: col}}>
                      {n} {v1}×
                    </text>
                    <text x={x1 + 24} y={ly + 22} style={{font: `500 16px ${ZH}`, fill: C.dim}}>
                      {l0} → {l1} · {cap}
                    </text>
                  </g>
                );
              })}
            </g>
          </Svg>
          <Card x={1240} y={480} w={584} a={ease(f, b[3], 16)} rows={[{t: 'EAGLE-3：批量 64 时 1.38 倍', sub: 'SGLang · H100（论文 §4.3）', c: '#B07A4F'}, {t: 'DFlash 2：并发 32 时 1.01–1.45 倍', sub: 'MT-Bench 只有 1.01 倍（模型卡）', c: SEL}]} />
          <Card x={1240} y={700} w={584} a={ease(f, b[4], 16)} rows={[{t: 'DSpark 的调度器正是冲着这一点', sub: '按当前负载，决定每个请求核几个：人少多核，人多少核', c: C.model}]} />
          <Src t="各家论文 / 博客原表，测试条件不同 · EAGLE-3 §4.3、DFlash Table 3、DFlash 2 模型卡" a={q} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ outro
export const Outro: React.FC<{scene: Scene}> = () => (
  <Page>
    {({f, b}) => {
      const toks: Tok[] = [...done('今天天气很好适合出门散'), {t: '步', s: 'model'}];
      const k = ease(f, b[1], 16);
      return (
        <>
          <div style={{position: 'absolute', left: 96, top: 110, font: `700 64px ${ZH}`, opacity: ease(f, 0, 14)}}>先猜后验，一字不差</div>
          <Sentence toks={toks} y={250} size={64} f={f} label="五种投机解码" />
          <div style={{position: 'absolute', left: 98, top: 500, font: `600 28px ${ZH}`, color: C.dim, opacity: k}}>两年多，五种做法，变的是</div>
          {['草稿怎么猜', '猜几个', '核几个'].map((s, i) => (
            <div key={s} style={{position: 'absolute', left: 96 + i * 420, top: 560, font: `700 52px ${ZH}`, color: [C.drafter, C.draft, C.target][i], opacity: ease(f, b[1] + 10 + i * 10, 12)}}>
              {s}
            </div>
          ))}
          <div style={{position: 'absolute', left: 96, top: 720, font: `700 56px ${ZH}`, opacity: ease(f, b[2], 14)}}>下期见</div>
          <div style={{position: 'absolute', left: 1100, top: 740, display: 'flex', gap: 14, opacity: ease(f, b[1] + 40, 14)}}>
            {['MTP', 'EAGLE-3', 'DFlash', 'DSpark', 'DFlash 2'].map((n) => (
              <div key={n} style={{padding: '8px 14px', border: `2px solid ${C.drafter}`, borderRadius: 10, font: `700 22px ${NUM}`, color: C.drafter, background: C.drafterBg}}>
                {n}
              </div>
            ))}
          </div>
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ cover
export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  const tall = h > w;
  const x = tall ? 80 : 110;
  const row: Tok[] = [
    ...done('今天天气'),
    {t: '很', s: 'ok'},
    {t: '好', s: 'ok'},
    {t: '适', s: 'ok'},
    {t: '合', s: 'ok'},
    {t: '出', s: 'model'},
  ];
  const size = tall ? 64 : 72;
  return (
    <AbsoluteFill style={{background: C.page, fontFamily: ZH, color: C.ink}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(35,32,28,0.09) 1.5px, transparent 1.7px)', backgroundSize: '36px 36px'}} />
      <div style={{position: 'absolute', left: x, top: tall ? 150 : 110, font: `700 ${tall ? 76 : 84}px ${ZH}`}}>加快 LLM 速度</div>
      <div style={{position: 'absolute', left: x, top: tall ? 250 : 210, font: `800 ${tall ? 170 : 190}px ${ZH}`, color: C.drafter, letterSpacing: 4}}>最快 6 倍</div>
      <div style={{position: 'absolute', left: x, top: tall ? 470 : 440, font: `700 ${tall ? 66 : 76}px ${ZH}`}}>五种投机解码全解析</div>
      <div style={{position: 'absolute', left: x, top: tall ? 560 : 540, font: `600 ${tall ? 38 : 40}px ${ZH}`, color: C.dim}}>先猜后验 · 一字不差</div>
      <div style={{position: 'absolute', left: x, top: tall ? 700 : 650, display: 'flex', gap: 8, padding: '28px 30px', background: C.card, border: `2px solid ${C.line}`, borderRadius: 20}}>
        {row.map((k, i) => (
          <div key={i} style={{position: 'relative'}}>
            <TokBox t={k.t} s={k.s} size={size} />
            {k.s === 'ok' && <div style={{position: 'absolute', left: 0, right: 0, top: -34, textAlign: 'center', font: `700 28px ${ZH}`, color: C.ok}}>✓</div>}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: x, top: tall ? 1300 : 960, font: `600 ${tall ? 32 : 30}px ${NUM}`, color: C.dim}}>MTP · EAGLE-3 · DFlash · DSpark · DFlash 2</div>
    </AbsoluteFill>
  );
};
