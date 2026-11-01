// v2 (typing close-up + flat diagram): DFlash 2 = DFlash backbone + two-tap conv + top-16 path selector.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {Arrow, Box, C, Card, Chip, done, ease, Label, layerY, NUM, Page, Sentence, Src, Stack, Svg, TermS, Tok, ZH} from './type';

const SEL = '#3F8F4E';
const COLS = 7;
const RIGHT = [0, 0, 2, 0, 1, 4, 0]; // rank of the correct word per slot (sketch)
const DRAFT = ['好', '，', '适', '合', '出', '门', '走'];

// ------------------------------------------------------------------ dflash2_obs
export const Dflash2Obs: React.FC<{scene: Scene}> = () => (
  <Page tag="⑤ DFlash 2 · 2026.08 · Inco AI" title="DFlash 2：对的词其实已经在候选里" sub="DFlash 2: Keep Drafting Parallel · Inco AI 博客（没有论文）">
    {({f, b}) => {
      const pG = ease(f, b[1], 18);
      const p1 = ease(f, b[2], 14);
      const p16 = ease(f, b[3], 14);
      const pR = ease(f, b[4], 14);
      const GX = 160,
        GY = 470,
        CW = 120,
        RH = 24;
      const toks: Tok[] = [...done('今天天气很'), ...DRAFT.map((t) => ({t, s: 'draft' as const, a: pG}))];
      return (
        <>
          <Sentence toks={toks} y={214} size={52} f={f} label="DFlash 一块：每个位置都有一列候选" />
          <Svg>
            <g opacity={pG}>
              {Array.from({length: COLS}, (_, c) => (
                <g key={c}>
                  <text x={GX + c * CW + 45} y={GY - 16} textAnchor="middle" style={{font: `700 20px ${ZH}`, fill: C.dim}}>
                    位 {c + 1}
                  </text>
                  {Array.from({length: 16}, (_, r) => {
                    const right = r === RIGHT[c];
                    const fill = right && pR > 0.5 ? C.ok : r === 0 ? C.drafter : '#E6E0D4';
                    const hi = c === 0 && ((r === 0 && p1 > 0.5) || p16 > 0.5);
                    return <rect key={r} x={GX + c * CW} y={GY + r * RH} width={90} height={RH - 5} rx={4} fill={fill} opacity={r === 0 || right ? 0.9 : 0.7} stroke={hi ? C.ink : 'none'} strokeWidth={hi ? 2 : 0} />;
                  })}
                </g>
              ))}
              <Label x={GX} y={GY + 16 * RH + 30} t="每列：这个位置的前 16 个候选，第一行是第一选择 · 绿块（对的词）位置为示意" size={19} />
            </g>
          </Svg>
          <Card x={1100} y={460} w={724} a={p1} head="第 1 个位置（5 层 Qwen3-4B DFlash · GSM8K）" rows={[{t: '第一选择是对的：85.4%', sub: 'Recall@1', c: C.drafter}]} />
          <Card x={1100} y={620} w={724} a={p16} rows={[{t: '前 16 个候选里有对的：99.5%', sub: 'Recall@16', c: C.ok}]} />
          <Card x={1100} y={750} w={724} a={pR} rows={[{t: '对的词多半已在候选里，只是没被挑出来', c: C.bad}]} />
          <Src t="Inco AI 博客 Table 1（5 层 Qwen3-4B DFlash · GSM8K）" a={pG} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ dflash2_path
const SHOW = 5; // candidates drawn per slot (of 16)
const PATH = [0, 0, 2, 0, 0, 1, 0]; // 好，适合出门走 — slot 6 picks its 2nd candidate
const CANDS = [
  ['好', '热', '不', '晴', '冷'],
  ['，', '。', '的', '啊', '呀'],
  ['出', '是', '适', '去', '要'],
  ['合', '宜', '于', '用', '在'],
  ['出', '门', '外', '去', '散'],
  ['去', '门', '玩', '吃', '逛'],
  ['走', '。', '吧', '啊', '！'],
];
const score = (i: number, a: number, c: number) => {
  const h = Math.sin(i * 12.9 + a * 78.2 + c * 37.7) * 43758.5;
  return h - Math.floor(h);
};

export const Dflash2Path: React.FC<{scene: Scene}> = () => (
  <Page tag="⑤ DFlash 2 · 结构" title="路径选择器 + 两抽头卷积" sub="path selector · two-tap convolution · 博客 Figure 1、Figure 4 重画">
    {({f, b}) => {
      // left: structure
      const pS = ease(f, b[0], 18);
      const conv = ease(f, b[5], 16);
      const convPulse = f >= b[5] && f < b[6] ? 0.5 + 0.5 * Math.sin((f - b[5]) * 0.3) : 0;
      const SX = 100,
        SY = 470,
        SW = 140,
        SH = 360,
        N = 16;
      const taps = [1, 4, 8, 11, 15];
      const LX = 410,
        LW = 470,
        LY = 480,
        LH = 46,
        LG = 12;
      const ly = (i: number) => LY + (4 - i) * (LH + LG);
      // right: candidate columns
      const GX = 1040,
        GY = 470,
        CW = 112,
        RH = 58;
      const pG = ease(f, b[1], 18);
      const pPair = ease(f, b[2], 24);
      const walk = (i: number) => ease(f, b[3] + i * 10, 10);
      const pV = ease(f, b[4], 16);
      const table = ease(f, b[6], 16);
      const gridA = pG * (1 - table);
      const toks: Tok[] = done('今天天气很');
      PATH.forEach((r, i) => {
        if (f >= b[3] + i * 10) toks.push({t: CANDS[i][r], s: f >= b[4] + 30 ? 'ok' : 'draft', a: walk(i)});
      });
      if (f >= b[4] + 40) toks.push({t: '走', s: 'model', a: ease(f, b[4] + 40, 10), tag: 'bonus'});
      return (
        <>
          <Sentence toks={toks} y={214} size={50} f={f} label="选出的那一条路，交给目标模型核对 · 候选为示意" />
          <Svg>
            {/* target model: 64 layers, taps 5/19/33/47/61 */}
            <g opacity={pS}>
              <Stack x={SX} y={SY} w={SW} h={SH} n={N} color={C.target} bg={C.targetBg} hi={taps} />
              <TermS x={SX + SW / 2} y={SY - 14} zh="目标模型" en="target model" c={C.target} size={20} anchor="middle" />
              <Label x={SX + SW / 2} y={SY + SH + 26} t="Qwen3.8-27B · 64 层" anchor="middle" size={18} color={C.target} weight={600} />
              <Label x={SX + SW / 2} y={SY + SH + 50} t="取 5、19、33、47、61" anchor="middle" size={18} color={C.target} />
              {taps.map((t, j) => (
                <Arrow key={t} pts={[[SX + SW + 4, layerY(SY, SH, N, t)], [270, layerY(SY, SH, N, t)], [270, 600 + j * 14], [286, 600 + j * 14]]} color={C.target} tone="target" w={2} head={false} />
              ))}
              <Box x={288} y={580} w={84} h={100} label="融合" size={20} fill={C.targetBg} stroke={C.target} />
              <line x1={386} y1={ly(4) + LH / 2} x2={386} y2={ly(0) + LH / 2} stroke={C.target} strokeWidth={3} />
              <Arrow pts={[[374, 630], [386, 630]]} color={C.target} tone="target" w={3} head={false} />
              {/* drafter: 5 layers, each [conv][attn][conv][MLP] */}
              {Array.from({length: 5}, (_, i) => (
                <g key={i}>
                  <Arrow pts={[[386, ly(i) + LH / 2], [LX - 4, ly(i) + LH / 2]]} color={C.target} tone="target" w={2} />
                  <rect x={LX} y={ly(i)} width={LW} height={LH} rx={7} fill={C.drafterBg} stroke={C.drafter} strokeWidth={2} />
                  {[
                    ['conv', 0],
                    ['Attn', 1],
                    ['conv', 2],
                    ['MLP', 3],
                  ].map(([t, k]) => {
                    const isConv = t === 'conv';
                    const x = LX + 10 + (k as number) * 112;
                    return (
                      <g key={k as number} opacity={isConv ? conv : 1}>
                        <rect x={x} y={ly(i) + 7} width={100} height={LH - 14} rx={5} fill={isConv ? '#F6E2B8' : C.card} stroke={isConv ? C.draft : C.drafter} strokeWidth={1.5 + (isConv ? convPulse * 2 : 0)} />
                        <text x={x + 50} y={ly(i) + LH / 2 + 6} textAnchor="middle" style={{font: `600 16px ${NUM}`, fill: isConv ? '#8A6416' : C.drafter}}>
                          {t as string}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}
              <TermS x={LX + LW / 2} y={LY - 18} zh="草稿主体还是 DFlash：5 层" en="draft model" c={C.drafter} size={20} anchor="middle" />
              {/* block in: 1 verified + 7 masks */}
              {Array.from({length: 8}, (_, i) => (
                <Chip key={i} x={LX + 30 + i * 58} y={ly(0) + LH + 44} t={i ? '?' : '很'} s={i ? 'mask' : 'done'} size={20} />
              ))}
              <Label x={LX + LW + 14} y={ly(0) + LH + 50} t="块 8：1 + 7" size={18} />
              <Arrow pts={[[LX + 30 + 3.5 * 58, ly(0) + LH + 30], [LX + 30 + 3.5 * 58, ly(0) + LH + 4]]} color={C.ink} w={2.5} />
              {/* drafter output → top-16 candidates per slot */}
              <Arrow pts={[[LX + LW + 4, ly(2) + LH / 2], [GX - 8, ly(2) + LH / 2]]} color={C.drafter} tone="drafter" w={3} p={pG} />
              <Label x={LX + LW + 12} y={ly(2) + LH / 2 - 12} t="每位 top-16" color={C.drafter} weight={600} size={18} a={pG} />
            </g>
            {/* two-tap conv: each position mixes in the one before it */}
            <g opacity={conv}>
              {Array.from({length: 7}, (_, i) => {
                const x0 = LX + 30 + i * 58,
                  x1 = x0 + 58,
                  y0 = ly(0) + LH + 60;
                return (
                  <g key={i}>
                    <path d={`M${x0 + 4},${y0} Q${(x0 + x1) / 2},${y0 + 22} ${x1 - 8},${y0 + 2}`} fill="none" stroke="#8A6416" strokeWidth={2.5} />
                    <path d={`M${x1 - 8},${y0 + 2} l-9,1 l5,-8 z`} fill="#8A6416" />
                  </g>
                );
              })}
              <Label x={LX} y={ly(0) + LH + 108} t="两抽头卷积：每个位置混进前一个位置（第 1 位读最后已核对的词）" color="#8A6416" weight={600} size={18} />
            </g>
            {/* candidate columns + pair scores + path */}
            <g opacity={gridA}>
              <Chip x={GX - 60} y={GY + 20} t="很" s="done" size={24} />
              {CANDS.map((col, c) =>
                col.map((w, r) => {
                  const onPath = PATH[c] === r && f >= b[3] + c * 10;
                  return (
                    <g key={`${c}${r}`}>
                      <rect x={GX + c * CW} y={GY + r * RH} width={60} height={40} rx={6} fill={onPath ? C.okBg : C.card} stroke={onPath ? SEL : C.line} strokeWidth={onPath ? 3 : 1.5} />
                      <text x={GX + c * CW + 30} y={GY + r * RH + 29} textAnchor="middle" style={{font: `600 22px ${ZH}`, fill: onPath ? C.ink : C.dim}}>
                        {w}
                      </text>
                    </g>
                  );
                }),
              )}
              {/* pair scores between neighbouring columns */}
              {Array.from({length: COLS - 1}, (_, c) =>
                Array.from({length: SHOW}, (_, a) =>
                  Array.from({length: SHOW}, (_, d) => {
                    const s = score(c, a, d);
                    return (
                      <line key={`${c}${a}${d}`} x1={GX + c * CW + 60} y1={GY + a * RH + 20} x2={GX + (c + 1) * CW} y2={GY + d * RH + 20} stroke={C.faint} strokeWidth={0.6 + s * 2.4} opacity={pPair * (1 - walk(6) * 0.7) * 0.8} />
                  );
                  }),
                ),
              )}
              {PATH.map((r, c) => {
                const pr = c ? PATH[c - 1] : 0;
                const x1 = c ? GX + (c - 1) * CW + 60 : GX - 44;
                return <line key={c} x1={x1} y1={GY + pr * RH + 20} x2={GX + c * CW} y2={GY + r * RH + 20} stroke={SEL} strokeWidth={4} opacity={walk(c)} />;
              })}
              <Label x={GX} y={GY + SHOW * RH + 20} t="每位 top-16（画前 5 个）· 相邻两列两两打分 · 线粗细为示意" size={17} />
              <text x={GX} y={GY + SHOW * RH + 52} style={{font: `500 19px ${NUM}`, fill: C.ink}} opacity={pPair}>
                S(a, b) = U(b) + ⟨A(a) ⊙ H(h), B(b)⟩ · 秩 256
              </text>
            </g>
            <g opacity={pV * (1 - table)}>
              <Box x={GX} y={372} w={1824 - GX} h={60} fill={C.targetBg} stroke={C.target} />
              <TermS x={(GX + 1824) / 2} y={411} zh="目标模型只核这一条路，一次前向" en="verify one path" c={C.target} size={23} anchor="middle" />
              <Arrow pts={[[GX + 6 * CW + 30, GY + PATH[6] * RH - 2], [GX + 6 * CW + 30, 436]]} color={SEL} tone="ok" w={3} p={pV} />
            </g>
          </Svg>
          {table > 0 && (
            <div style={{position: 'absolute', left: 1040, top: 460, width: 784, padding: '20px 26px', boxSizing: 'border-box', background: C.card, border: `2px solid ${C.line}`, borderRadius: 16, opacity: table}}>
              <div style={{font: `700 22px ${ZH}`, color: C.dim}}>给 DFlash 加「修正」的两种办法 · Qwen3-4B · GSM8K · T = 0</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px', rowGap: 16, marginTop: 18, font: `600 24px ${ZH}`}}>
                <div style={{font: `500 18px ${ZH}`, color: C.dim}} />
                <div style={{font: `500 18px ${ZH}`, color: C.dim}}>新增参数</div>
                <div style={{font: `500 18px ${ZH}`, color: C.dim}}>延迟</div>
                <div style={{font: `500 18px ${NUM}`, color: C.dim, opacity: ease(f, b[8], 12)}}>τ</div>
                <div style={{color: SEL}}>路径选择器</div>
                <div style={{font: `600 26px ${NUM}`}}>2.0M</div>
                <div style={{font: `600 26px ${NUM}`}}>+0.6%</div>
                <div style={{font: `700 28px ${NUM}`, color: SEL, opacity: ease(f, b[8], 12)}}>4.61</div>
                <div style={{opacity: ease(f, b[7], 12)}}>DSpark 式修正*</div>
                <div style={{font: `600 26px ${NUM}`, opacity: ease(f, b[7], 12)}}>77.8M</div>
                <div style={{font: `600 26px ${NUM}`, opacity: ease(f, b[7], 12)}}>+9.6%</div>
                <div style={{font: `700 28px ${NUM}`, opacity: ease(f, b[8], 12)}}>4.49</div>
              </div>
              <div style={{font: `500 17px ${ZH}`, color: C.dim, marginTop: 18, opacity: ease(f, b[7], 12)}}>* 博客自己在小模型上复现的 DSpark correction（Table 2），不是官方 DSpark</div>
              <div style={{font: `500 17px ${ZH}`, color: C.dim, marginTop: 6}}>原版 DFlash：τ 4.27</div>
            </div>
          )}
          <Src t="Inco AI 博客 Figure 1、Figure 4、Table 2 · HF config z-lab/Qwen3.8-27B-DFlash2（target_layer_ids、block 8、selector_top_k 16、rank 256）" a={pS} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ dflash2_num
const TAU: [string, number, string][] = [
  ['MTP', 4.54, '#5B7FB0'],
  ['DFlash', 4.92, '#7FBDBB'],
  ['DSpark', 5.49, '#C0567F'],
  ['DFlash 2', 5.97, SEL],
];
export const Dflash2Num: React.FC<{scene: Scene}> = () => (
  <Page tag="⑤ DFlash 2 · 数字" title="Qwen3.5 4B：平均 τ" sub="thinking 模式 · T = 1 · 博客 Table 3">
    {({f, b}) => (
      <>
        <Svg>
          {TAU.map(([n, v, c], i) => {
            const a = ease(f, b[1] + i * 12, 18);
            const h = (v - 3.5) * 200 * a;
            const x = 160 + i * 230;
            return (
              <g key={n} opacity={ease(f, b[0] + i * 4, 10)}>
                <rect x={x} y={820 - h} width={150} height={h} rx={8} fill={c} />
                <text x={x + 75} y={808 - h} textAnchor="middle" style={{font: `600 38px ${NUM}`, fill: C.ink}} opacity={a}>
                  {v.toFixed(2)}
                </text>
                <text x={x + 75} y={860} textAnchor="middle" style={{font: `700 24px ${NUM}`, fill: C.ink}}>
                  {n}
                </text>
              </g>
            );
          })}
          <line x1={130} y1={820} x2={1070} y2={820} stroke={C.ink} strokeWidth={2} />
          <Label x={130} y={300} t="纵轴从 3.5 起画" size={18} />
        </Svg>
        <Card x={1160} y={250} w={664} a={ease(f, b[2], 16)} rows={[{t: '这里的 DFlash 和 DSpark 是 Inco 按同样设置自己训的', sub: '不是官方发布的那两版草稿机', c: C.bad}]} />
        <div style={{position: 'absolute', left: 1160, top: 420, width: 664, padding: '20px 26px', boxSizing: 'border-box', background: C.card, border: `2px solid ${C.line}`, borderRadius: 16, opacity: ease(f, b[3], 16)}}>
          <div style={{font: `700 22px ${ZH}`, color: C.dim}}>Qwen3.8-27B · 1 张 H200 · GSM8K · 对比不投机</div>
          {[
            ['单个请求（并发 1）', 3.43, b[3]],
            ['并发 32', 1.45, b[4]],
          ].map(([t, v, at]) => (
            <div key={t as string} style={{marginTop: 18, opacity: ease(f, at as number, 14)}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <div style={{height: 40, width: (v as number) * 120 * ease(f, at as number, 20), background: SEL, borderRadius: 6}} />
                <div style={{font: `600 34px ${NUM}`}}>{(v as number).toFixed(2)}×</div>
              </div>
              <div style={{font: `500 20px ${ZH}`, color: C.dim, marginTop: 4}}>{t as string}</div>
            </div>
          ))}
        </div>
        <Src t="Inco AI 博客 Table 3 · HF 模型卡 z-lab/Qwen3.8-27B-DFlash2 吞吐表（SGLang）" a={ease(f, b[0], 14)} />
      </>
    )}
  </Page>
);
