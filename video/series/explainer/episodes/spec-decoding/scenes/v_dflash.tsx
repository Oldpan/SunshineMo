// v2 (typing close-up + flat diagram): DFlash — block diffusion drafter, target features injected into every layer's K/V.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {Arrow, Box, C, Card, Chip, done, ease, Label, layerY, lerp, NUM, Page, Sentence, Src, Stack, Svg, Term, TermS, Tok, ZH} from './type';

// One anchor + 15 masked slots, all filled by one forward pass of the block-diffusion drafter.
const FILL = '好，适合出门散步，晒晒太阳吧。'.split('');

export const DflashPress: React.FC<{scene: Scene}> = () => (
  <Page tag="③ DFlash · 2026.02 · UCSD z-lab" title="DFlash：一次前向，整块填满" sub="Block Diffusion for Flash Speculative Decoding · Chen, Liang, Liu · ICML 2026">
    {({f, b}) => {
      const fillAt = b[3] + 16;
      const maskAt = (i: number) => b[2] + 59 + i * 3; // masks appear with the second half of the line
      const toks: Tok[] = done('今天天气');
      if (f >= b[2]) toks.push({t: '很', s: 'done', a: 1, tag: '锚点'});
      FILL.forEach((t, i) => {
        if (f < maskAt(i)) return;
        if (f < fillAt) toks.push({t: '?', s: 'mask', a: ease(f, maskAt(i), 8)});
        else toks.push({t, s: 'draft', a: 1, dy: (1 - ease(f, fillAt, 10)) * -10});
      });

      // the block-diffusion drafter: 16-slot block in, one pass, 15 drafts out. Centred, then slides right at b[4].
      const slide = ease(f, b[4], 22);
      const U = 44;
      const FW = 16 * U;
      const X0 = lerp((1920 - FW) / 2, 1824 - FW, slide);
      const inY = 846,
        outY = 470;
      const pass = f >= b[3] && f < b[3] + 36;
      const pStack = ease(f, b[1], 16);

      // timing comparison: autoregressive drafter = 15 passes, DFlash = 1 pass
      const pCmp = ease(f, b[4] + 10, 18);
      const TX = 270,
        TY = 610,
        UNIT = 40;
      const arN = Math.min(15, Math.floor(Math.max(0, f - b[4] - 16) / 3));
      const pDeep = ease(f, b[5], 16);
      return (
        <>
          <Sentence toks={toks} y={214} size={56} f={f} label="锚点之后：15 个空位一次填满" />
          <Svg>
            {/* input block */}
            <Chip x={X0 + U / 2} y={inY} t="很" s="done" size={27} a={ease(f, b[2], 12)} />
            {FILL.map((_, i) => (
              <Chip key={i} x={X0 + (i + 1.5) * U} y={inY} t="?" s="mask" size={27} a={ease(f, maskAt(i), 8)} />
            ))}
            <TermS x={X0 - 14} y={inY + 8} zh="锚点 + 15 个遮罩" en="anchor + [MASK]" size={20} anchor="end" a={ease(f, b[2], 12) * (1 - slide)} />
            <Label x={X0 - 14} y={inY + 8} t="输入" anchor="end" a={slide} />
            <Arrow pts={[[X0 + FW / 2, inY - 26], [X0 + FW / 2, inY - 60]]} color={C.ink} p={ease(f, b[2] + 20, 12)} />
            <Stack x={X0 + FW / 2 - 150} y={560} w={300} h={210} n={5} color={C.drafter} bg={C.drafterBg} a={pStack} hi={pass ? [0, 1, 2, 3, 4] : []} />
            <TermS x={X0 + FW / 2 - 166} y={672} anchor="end" zh="块扩散草稿机" en="block diffusion" c={C.drafter} size={24} a={pStack} />
            <Label x={X0 + FW / 2 - 166} y={702} anchor="end" t={'5 层 · 一次前向'} color={C.drafter} size={20} a={pDeep || pStack} />
            <Arrow pts={[[X0 + FW / 2, 552], [X0 + FW / 2, outY + 28]]} color={C.draft} tone="draft" p={ease(f, b[3], 12)} />
            {/* output block */}
            {FILL.map((t, i) => (
              <Chip key={i} x={X0 + (i + 1.5) * U} y={outY} t={t} s="draft" size={27} a={ease(f, fillAt, 8)} />
            ))}
            <Label x={X0 - 14} y={outY + 8} t="输出" anchor="end" a={ease(f, fillAt, 8)} />

            <g opacity={pCmp}>
              <Label x={96} y={TY + 4} t="逐个猜" color={C.ink} weight={700} size={26} />
              <Label x={96} y={TY + 34} t="EAGLE 式" size={20} />
              {Array.from({length: 15}, (_, i) => (
                <rect key={i} x={TX + i * UNIT} y={TY - 26} width={UNIT - 6} height={44} rx={6} fill={i < arN ? C.drafterBg : 'transparent'} stroke={C.drafter} strokeWidth={2} opacity={i < arN ? 1 : 0.25} />
              ))}
              <Label x={TX + 15 * UNIT - 6} y={TY + 62} t="15 次前向：γ × t_step" anchor="end" color={C.drafter} weight={700} size={24} />
              <Label x={96} y={TY + 134} t="DFlash" color={C.ink} weight={700} size={26} />
              <Label x={96} y={TY + 164} t="块扩散" size={20} />
              <rect x={TX} y={TY + 104} width={UNIT - 6} height={44} rx={6} fill={C.drafter} opacity={0.85} />
              <Label x={TX + UNIT + 8} y={TY + 136} t="1 次前向：t_parallel" color={C.drafter} weight={700} size={24} />
              <Arrow pts={[[TX, TY + 210], [TX + 15 * UNIT, TY + 210]]} color={C.dim} tone="dim" w={2} p={pCmp} label="草稿用时 →" lx={TX + 15 * UNIT - 120} ly={TY + 240} />
            </g>
          </Svg>
          <Card
            x={96}
            y={420}
            w={700}
            a={pDeep}
            rows={[{t: '草稿便宜了，就能做深', sub: 'EAGLE-3 1 层 → DFlash 5 层（Table 5：3/5/8 层里 5 层综合最快）', c: C.drafter}]}
          />
          <Src t="DFlash 论文 arXiv 2602.06036 §3.1 式 (2)(3)、§4.1 · 块大小 16" a={pCmp} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ dflash_inject: redrawn from DFlash Fig. 2
const DL = {x: 700, w: 600, y: 480, lh: 50, gap: 12, n: 5};
const dly = (i: number) => DL.y + (DL.n - 1 - i) * (DL.lh + DL.gap); // i = 0 bottom layer

export const DflashInject: React.FC<{scene: Scene}> = () => (
  <Page tag="③ DFlash · 结构" title="目标模型的特征，注入草稿机每一层的 K、V" sub="DFlash 论文 §4.1、Figure 2 重画">
    {({f, b}) => {
      const SX = 110,
        SY = 440,
        SW = 190,
        SH = 400,
        N = 12;
      const taps = [1, 3, 5, 7, 9];
      const pT = ease(f, b[0], 16);
      const pTap = ease(f, b[1], 24);
      const pFuse = ease(f, b[1] + 40, 18);
      const pInj = ease(f, b[1] + 70, 30);
      const pCache = f >= b[3] ? Math.min(4, 1 + Math.floor((f - b[3]) / 34)) : 1;
      const pFrozen = ease(f, b[4], 16);
      const FX = 380,
        FY = 590,
        FW = 170,
        FH = 120;
      const BUS = 630;
      const toks: Tok[] = [...done('今天天气'), {t: '很', s: 'done', tag: '锚点'}, ...'好，适合出门散步，晒晒太阳吧。'.split('').map((t) => ({t, s: 'draft' as const}))];
      return (
        <>
          <Sentence toks={toks} y={214} size={46} f={f} label="草稿机这一次前向的输出" />
          <Svg>
            {/* target model + 5 taps */}
            <g opacity={pT}>
              <Stack x={SX} y={SY} w={SW} h={SH} n={N} color={C.target} bg={C.targetBg} hi={pTap > 0.4 ? taps : []} />
              <TermS x={SX + SW / 2} y={SY - 14} zh="目标模型" en="target" c={C.target} size={22} anchor="middle" />
              <Label x={SX + SW / 2} y={SY + SH + 30} t="第 2 层到倒数第 3 层间均匀取 5 层" anchor="middle" size={17} a={pTap} />
            </g>
            {taps.map((t, j) => {
              const y = layerY(SY, SH, N, t);
              return <Arrow key={t} pts={[[SX + SW + 4, y], [FX - 30, y], [FX - 30, FY + 20 + j * 20], [FX - 4, FY + 20 + j * 20]]} color={C.target} tone="target" w={2.5} p={Math.max(0, Math.min(1, pTap * 1.5 - j * 0.12))} head={false} />;
            })}
            <Box x={FX} y={FY} w={FW} h={FH} fill={C.targetBg} stroke={C.target} label="拼接 + 投影" sub="→ 融合特征" size={22} a={pFuse} />
            {/* bus up the side of the drafter, one branch per layer → that layer's K/V */}
            <Arrow pts={[[FX + FW + 4, FY + FH / 2], [BUS, FY + FH / 2]]} color={C.target} tone="target" w={3.5} p={pInj} head={false} />
            <line x1={BUS} y1={dly(4) + DL.lh / 2} x2={BUS} y2={dly(0) + DL.lh / 2} stroke={C.target} strokeWidth={3.5} opacity={pInj} />
            {Array.from({length: DL.n}, (_, i) => (
              <Arrow key={i} pts={[[BUS, dly(i) + DL.lh / 2], [DL.x - 4, dly(i) + DL.lh / 2]]} color={C.target} tone="target" w={3} p={pInj} />
            ))}
            {/* drafter layers: K/V cache cells (blue, from the target) + the layer body */}
            {Array.from({length: DL.n}, (_, i) => (
              <g key={i} opacity={pT}>
                <rect x={DL.x} y={dly(i)} width={DL.w} height={DL.lh} rx={8} fill={C.drafterBg} stroke={C.drafter} strokeWidth={2} />
                {Array.from({length: pCache}, (_, k) => (
                  <g key={k} opacity={k === pCache - 1 && f >= b[3] ? ease(f, b[3] + (pCache - 1) * 34, 10) : pInj}>
                    <rect x={DL.x + 8 + k * 74} y={dly(i) + 8} width={32} height={DL.lh - 16} rx={4} fill={C.target} opacity={0.75} />
                    <rect x={DL.x + 42 + k * 74} y={dly(i) + 8} width={32} height={DL.lh - 16} rx={4} fill={C.target} opacity={0.5} />
                    {i === 4 && (
                      <text x={DL.x + 41 + k * 74} y={dly(i) - 8} textAnchor="middle" style={{font: `600 15px ${NUM}`, fill: C.target}}>
                        K V
                      </text>
                    )}
                  </g>
                ))}
                <text x={DL.x + DL.w - 16} y={dly(i) + DL.lh / 2 + 7} textAnchor="end" style={{font: `600 19px ${ZH}`, fill: C.drafter}}>
                  草稿第 {i + 1} 层
                </text>
              </g>
            ))}
            <TermS x={DL.x + DL.w / 2} y={DL.y - 36} zh={pFrozen > 0.5 ? '草稿机 5 层 · 只训这 5 层' : '草稿机 5 层'} en="draft model" c={C.drafter} size={22} anchor="middle" a={pT} />
            {/* shared, frozen embedding + LM head */}
            <g opacity={pT}>
              <rect x={DL.x} y={dly(0) + DL.lh + 22} width={DL.w} height={40} rx={8} fill={pFrozen > 0.5 ? '#E9EEF6' : C.card} stroke={C.target} strokeWidth={2} strokeDasharray={pFrozen > 0.5 ? '7 5' : undefined} />
              <TermS x={DL.x + DL.w / 2} y={dly(0) + DL.lh + 49} zh={pFrozen > 0.5 ? '词嵌入：借目标模型的，冻住' : '词嵌入'} en="embedding" c={C.target} size={19} anchor="middle" />
              <Arrow pts={[[DL.x + DL.w / 2 + 150, dly(0) + DL.lh + 20], [DL.x + DL.w / 2 + 150, dly(0) + DL.lh + 4]]} color={C.ink} />
            </g>
            <g opacity={pFrozen}>
              <rect x={DL.x} y={372} width={DL.w} height={38} rx={8} fill="#E9EEF6" stroke={C.target} strokeWidth={2} strokeDasharray="7 5" />
              <TermS x={DL.x + DL.w / 2} y={398} zh="输出头：借目标模型的，冻住" en="LM head" c={C.target} size={19} anchor="middle" />
            </g>
            {/* KV cache note */}
            <g opacity={ease(f, b[3], 14)}>
              <TermS x={DL.x} y={dly(0) + DL.lh + 100} zh="KV 缓存" en="KV cache" c={C.target} size={21} a={1 - pFrozen * 0} />
              <Label x={DL.x + 200} y={dly(0) + DL.lh + 100} t="每核对一轮，补上新的一段" size={19} />
            </g>
          </Svg>
          {/* right: entry-only vs every layer (§3.2), then training */}
          <div style={{position: 'absolute', left: 1400, top: 404, width: 424, height: 300, background: C.card, border: `2px solid ${C.line}`, borderRadius: 16, opacity: ease(f, b[2], 16) * (1 - ease(f, b[5], 12))}}>
            <div style={{position: 'absolute', left: 22, top: 16, font: `700 22px ${ZH}`}}>论文 §3.2 的看法</div>
          </div>
          <Svg>
            <g opacity={ease(f, b[2], 16) * (1 - ease(f, b[5], 12))}>
              {[0, 1].map((m) => (
                <g key={m}>
                  {Array.from({length: 5}, (_, i) => {
                    const x = 1480 + m * 190,
                      y = 630 - i * 36;
                    const fadeA = m === 1 ? 1 : 1 - i * 0.2;
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width={110} height={26} rx={5} fill={C.drafter} opacity={0.15 + 0.75 * fadeA} />
                        {(m === 1 || i === 0) && <Arrow pts={[[x - 40, y + 13], [x - 6, y + 13]]} color={C.target} tone="target" w={2.5} />}
                      </g>
                    );
                  })}
                  <text x={1535 + m * 190} y={680} textAnchor="middle" style={{font: `600 18px ${ZH}`, fill: C.ink}}>
                    {m === 0 ? '只在入口拼：越往上越淡' : 'DFlash：每层注入'}
                  </text>
                </g>
              ))}
            </g>
          </Svg>
          <div style={{position: 'absolute', left: 1400, top: 404, width: 424, height: 470, background: C.card, border: `2px solid ${C.line}`, borderRadius: 16, opacity: ease(f, b[5], 16)}}>
            <div style={{position: 'absolute', left: 22, top: 16, font: `700 22px ${ZH}`}}>训练</div>
            <div style={{position: 'absolute', left: 22, top: 56, font: `500 19px ${ZH}`, color: C.dim}}>随机挑锚点，后面 15 位全部遮住</div>
            <div style={{position: 'absolute', left: 22, top: 250, font: `500 19px ${ZH}`, color: C.dim, opacity: ease(f, b[6], 14)}}>越靠后，损失权重越低</div>
            <div style={{position: 'absolute', left: 22, top: 420, font: `500 18px ${NUM}`, color: C.dim, opacity: ease(f, b[6], 14)}}>w_k = exp(−(k−1)/7) · 块 16</div>
          </div>
          <Svg>
            <g opacity={ease(f, b[5], 16)}>
              {Array.from({length: 16}, (_, i) => (
                <rect key={i} x={1424 + i * 23.5} y={500} width={19} height={34} rx={3} fill={i === 0 ? C.draft : '#9CCB9C'} opacity={i === 0 ? 1 : 0.8} />
              ))}
              <Label x={1424} y={566} t="锚点" color={C.draft} size={17} weight={700} />
              <Label x={1470} y={566} t="遮罩 ×15" color={C.ok} size={17} weight={700} />
            </g>
            <g opacity={ease(f, b[6], 14)}>
              {Array.from({length: 15}, (_, k) => {
                const w = Math.exp(-k / 7);
                return <rect key={k} x={1447 + k * 23.5} y={790 - 130 * w * ease(f, b[6], 20)} width={19} height={130 * w * ease(f, b[6], 20)} rx={3} fill={C.ok} opacity={0.4 + 0.6 * w} />;
              })}
            </g>
          </Svg>
          <Src t="DFlash 论文 §3.2、§4.1–4.2、Figure 2 · 融合特征 = target context feature · 楼层位置为示意" a={pT} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ dflash_num
const ACC = [0.87, 0.855, 0.84, 0.825, 0.81, 0.795, 0.78]; // endpoints from DSpark Fig. 2 (code); middle is a sketch

export const DflashNum: React.FC<{scene: Scene}> = () => (
  <Page tag="③ DFlash · 数字" title="Qwen3 8B：平均快 4.86 倍" sub="非思考 · 贪心（T = 0）· H200 · Transformers 后端">
    {({f, b}) => {
      const pre = 1 - ease(f, b[3], 14);
      const bars: [string, number, string, number, string][] = [
        ['DFlash', 4.86, C.drafter, b[0], 'τ 6.49 · 每轮核 16 个'],
        ['EAGLE-3', 1.76, C.faint, b[1], 'τ 2.96 · 每轮核 16 个'],
        ['EAGLE-3', 2.02, C.faint, b[1] + 30, 'τ 3.40 · 每轮核 60 个'],
      ];
      const post = ease(f, b[3], 16);
      const toks: Tok[] = [...done('今天天气很'), ...'好，适合出门散步'.split('').map((t, i) => ({t, s: 'draft' as const, tag: i < 7 ? `位 ${i + 1}` : undefined}))];
      return (
        <>
          <div style={{position: 'absolute', left: 96, top: 250, width: 1060, opacity: pre}}>
            {bars.map(([n, v, c, at, sub], i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: i ? 22 : 0, opacity: ease(f, at, 12)}}>
                <div style={{width: 140, font: `700 28px ${NUM}`}}>{n}</div>
                <div style={{height: 64, width: v * 150 * ease(f, at, 22), background: c, borderRadius: 8}} />
                <div style={{font: `600 40px ${NUM}`}}>{v.toFixed(2)}×</div>
                <div style={{font: `500 21px ${ZH}`, color: C.dim}}>{sub}</div>
              </div>
            ))}
            <div style={{font: `500 20px ${ZH}`, color: C.dim, marginTop: 20, opacity: ease(f, b[1], 12)}}>EAGLE-3 为 DFlash 论文自测（第三方 AngelSlim 权重）</div>
          </div>
          <Card x={1220} y={250} w={604} a={ease(f, b[2], 16) * pre} head="SGLang · B200 · Math500" rows={[{t: '单个请求 5.1 倍', c: C.ok}, {t: '并发 32：2.8 倍', sub: 'τ 8.01（Table 3）', c: C.target}]} />
          {post > 0 && (
            <>
              <Sentence toks={toks} y={214} size={56} f={f} label="一块里的位置同时猜出" />
              <Svg>
                <g opacity={post}>
                  {Array.from({length: 7}, (_, i) => {
                    const x = 96 + 26 + 5 * (56 * 1.18 + 6) + i * (56 * 1.18 + 6) + 33;
                    return <line key={i} x1={x} y1={420} x2={x} y2={470} stroke={C.bad} strokeWidth={2} strokeDasharray="5 5" />;
                  })}
                  <Label x={96} y={500} t="各位置同时出：看不到彼此猜出的词" color={C.bad} weight={600} size={24} />
                </g>
                <g opacity={ease(f, b[4], 14)}>
                  <TermS x={96} y={580} zh="条件接受率" en="conditional acceptance" size={24} />
                  <Label x={96} y={612} t="代码任务 · Qwen3-4B · 前面都对时，这一位能过的概率" size={19} />
                  {ACC.map((v, i) => {
                    const h = (v - 0.7) * 1000 * ease(f, b[4] + i * 4, 18);
                    return (
                      <g key={i}>
                        <rect x={140 + i * 120} y={860 - h} width={80} height={h} rx={6} fill={i === 0 || i === 6 ? C.ok : '#B9D7B3'} />
                        <text x={180 + i * 120} y={890} textAnchor="middle" style={{font: `600 18px ${ZH}`, fill: C.dim}}>
                          位 {i + 1}
                        </text>
                        {(i === 0 || i === 6) && (
                          <text x={180 + i * 120} y={850 - h} textAnchor="middle" style={{font: `700 28px ${NUM}`, fill: C.ok}}>
                            {v.toFixed(2)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </Svg>
            </>
          )}
          <Src t={f >= b[3] ? 'DSpark 论文 Figure 2（Qwen3-4B，测 DFlash）· 中间柱高为示意' : 'DFlash 论文 Table 1（H200 · Transformers 后端）、Table 3'} a={1} />
        </>
      );
    }}
  </Page>
);
