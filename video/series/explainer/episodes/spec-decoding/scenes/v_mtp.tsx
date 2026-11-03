// v2 (typing close-up + flat diagram): MTP — Meta's parallel heads, DeepSeek-V3's chained modules.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {Arrow, Box, C, Card, Chip, done, ease, Label, NUM, Page, Quote, Sentence, Src, Stack, Svg, Term, TermS, Tok, ZH} from './type';

// ------------------------------------------------------------------ mtp_meta: shared trunk + 4 independent heads (Meta Fig. 1)
export const MtpMeta: React.FC<{scene: Scene}> = () => (
  <Page tag="① MTP · 2024.04 · Meta" title="MTP：一次预测后面 4 个 token" sub="Multi-Token Prediction · Gloeckle et al.（Meta）">
    {({f, b}) => {
      const outs = ['很', '好', '适', '合'];
      const toks: Tok[] = done('今天天气');
      outs.forEach((t, i) => {
        if (f < b[1] + 20 + i * 8) return;
        const s: Tok['s'] = i === 0 && f >= b[3] ? 'done' : 'draft';
        toks.push({t, s, a: ease(f, b[1] + 20 + i * 8, 10), tag: `头 ${i + 1}`});
      });
      const pT = ease(f, b[2], 18);
      const pH = ease(f, b[2] + 20, 18);
      const TX = 240,
        TW = 920,
        HY = 500,
        HW = 185,
        HG = 60;
      const hx = (i: number) => TX + i * (HW + HG);
      const inf = f >= b[3];
      const indep = ease(f, b[5], 14);
      return (
        <>
          <Sentence toks={toks} y={214} size={56} f={f} label="在「气」这个位置，同时预测后面 4 个" />
          <Svg>
            {/* shared unembedding on top */}
            <Box x={TX} y={HY - 76} w={TW} h={44} fill={C.targetBg} stroke={C.target} a={pH} />
            <TermS x={TX + TW / 2} y={HY - 46} zh="共享输出层" en="shared unembedding" c={C.target} size={21} anchor="middle" a={pH} />
            {/* 4 heads */}
            {outs.map((_, i) => {
              const dim = inf && i > 0;
              return (
                <g key={i} opacity={pH}>
                  <Box x={hx(i)} y={HY} w={HW} h={90} fill={i === 0 && inf ? C.target : C.targetBg} stroke={C.target} dash={dim} label={`头 ${i + 1}`} color={i === 0 && inf ? '#fff' : C.target} size={28} />
                  <Arrow pts={[[TX + TW / 2, 690], [hx(i) + HW / 2, 640], [hx(i) + HW / 2, HY + 94]]} color={C.target} tone="target" w={2.5} p={pH} />
                  <Arrow pts={[[hx(i) + HW / 2, HY - 2], [hx(i) + HW / 2, HY - 28]]} color={C.target} tone="target" w={2.5} p={pH} />
                </g>
              );
            })}
            <TermS x={hx(3) + HW + 16} y={HY + 52} zh="4 个独立头" en="heads" c={C.target} size={22} a={pH} />
            {/* shared trunk */}
            <Stack x={TX + TW / 2 - 220} y={690} w={440} h={150} n={4} color={C.target} bg={C.targetBg} a={pT} />
            <TermS x={TX + TW / 2 + 240} y={776} zh="共享主干" en="shared trunk" c={C.target} size={24} a={pT} />
            <Chip x={TX + TW / 2 - 290} y={823} t="气" s="done" size={26} a={pT} />
            <Arrow pts={[[TX + TW / 2 - 266, 823], [TX + TW / 2 - 226, 823]]} color={C.ink} p={pT} />
            {/* independence: no links between heads */}
            {[0, 1, 2].map((i) => (
              <g key={i} opacity={indep}>
                <line x1={hx(i) + HW + 8} y1={HY + 45} x2={hx(i + 1) - 8} y2={HY + 45} stroke={C.bad} strokeWidth={3} strokeDasharray="6 6" />
                <text x={hx(i) + HW + HG / 2} y={HY + 34} textAnchor="middle" style={{font: `700 26px ${ZH}`, fill: C.bad}}>
                  ×
                </text>
              </g>
            ))}
            <Label x={TX} y={404} t="各猜各的：头 3 看不到头 2 猜了什么" color={C.bad} weight={600} a={indep} />
          </Svg>
          <Card x={1360} y={430} w={464} a={ease(f, b[3] + 30, 16)} rows={[{t: '推理时只用头 1', sub: '头 2–4 可当草稿；每个头是一层 Transformer', c: C.target}, {t: '新意：和模型一起预训练', sub: '多头起草早有先例（如 Medusa 2024.01）', c: C.drafter}]} />
          <Card x={1360} y={680} w={464} a={ease(f, b[4], 16)} head="代码任务 · 自投机解码" rows={[{t: '约 3 倍', sub: 'Meta 论文 §3.2', c: C.ok}]} />
          <Src t="Gloeckle et al.（Meta）arXiv 2404.19737 · Figure 1、§3.2" a={pT} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ mtp_ds: DeepSeek-V3 sequential modules (V3 Fig. 3)
// Three columns: main model, MTP module 1, MTP module 2. Shared embedding (bottom) and output head (top) span them.
const COLS = [120, 500, 880];
const CW = 300;
const OY = 412,
  EY = 806;

const Module: React.FC<{x: number; k: number; f: number; b: number[]; a: number; dim: number}> = ({x, k, f, b, a, dim}) => {
  const pIn = ease(f, b[2], 16);
  const pNorm = ease(f, b[3], 16);
  const pTrm = ease(f, b[4], 16);
  const newHi = f >= b[5] && f < b[6] ? 0.5 + 0.5 * Math.sin((f - b[5]) * 0.3) : 0;
  return (
    <g opacity={a * (1 - 0.6 * dim)}>
      <rect x={x - 10} y={OY + 60} width={CW + 20} height={EY - OY - 76} rx={14} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="8 6" />
      <text x={x + 2} y={OY + 82} style={{font: `700 21px ${NUM}`, fill: C.dim}}>
        MTP 模块 {k}
      </text>
      {/* two RMSNorms */}
      <Box x={x + 10} y={690} w={130} h={40} label="RMSNorm" size={20} a={pNorm} stroke={C.dim} />
      <Box x={x + 160} y={690} w={130} h={40} label="RMSNorm" size={20} a={pNorm} stroke={C.dim} />
      <Arrow pts={[[x + 75, 688], [x + 75, 664], [x + 140, 664]]} color={C.dim} tone="dim" w={2.5} p={pNorm} head={false} />
      <Arrow pts={[[x + 225, 688], [x + 225, 664], [x + 160, 664]]} color={C.dim} tone="dim" w={2.5} p={pNorm} head={false} />
      <circle cx={x + 150} cy={664} r={9} fill={C.card} stroke={C.ink} strokeWidth={2} opacity={pNorm} />
      <Label x={x + 166} y={658} t="拼接 concat" size={18} a={pNorm} />
      <Arrow pts={[[x + 150, 654], [x + 150, 632]]} color={C.ink} p={pNorm} />
      <Box x={x + 40} y={586} w={220} h={44} label={`投影 M${k} projection`} size={20} a={pNorm} fill={newHi ? '#FFF3D6' : C.card} stroke={newHi ? C.draft : C.ink} />
      <Label x={x + 34} y={614} t="2d→d" anchor="end" size={17} a={pNorm} />
      <Arrow pts={[[x + 150, 584], [x + 150, 566]]} color={C.ink} p={pTrm} />
      <Box x={x + 40} y={508} w={220} h={56} label="Transformer 块" size={22} a={pTrm} fill={newHi ? '#FFF3D6' : C.drafterBg} stroke={newHi ? C.draft : C.drafter} color={C.drafter} />
      <Arrow pts={[[x + 150, 506], [x + 150, OY + 50]]} color={C.drafter} tone="drafter" p={pTrm} />
      {/* embedding into the right norm */}
      <Arrow pts={[[x + 225, EY - 2], [x + 225, 734]]} color={C.ink} p={pIn} />
    </g>
  );
};

export const MtpDs: React.FC<{scene: Scene}> = () => (
  <Page tag="① MTP · 2024.12 · DeepSeek-V3" title="DeepSeek-V3：MTP 模块串成一条链" sub="DeepSeek-V3 技术报告 §2.2 Figure 3 · 图中画了 2 个模块，V3 实际用 1 个">
    {({f, b}) => {
      const pMain = ease(f, b[0], 16);
      const pM1 = ease(f, b[1], 16);
      const pM2 = ease(f, b[1] + 20, 16);
      const pH = ease(f, b[2], 16);
      const infer = f >= b[6];
      const toks: Tok[] = done('今天天气');
      if (f >= b[0] + 20) toks.push({t: '很', s: 'done', a: ease(f, b[0] + 20, 10), tag: '主模型'});
      if (f >= b[4] + 20) toks.push({t: '好', s: infer && f >= b[6] + 120 ? 'ok' : 'draft', a: ease(f, b[4] + 20, 10), tag: infer && f >= b[6] + 120 ? '下次核对' : '模块 1'});
      if (f >= b[4] + 34 && !infer) toks.push({t: '适', s: 'draft', a: ease(f, b[4] + 34, 10), tag: '模块 2'});
      const shared = f >= b[5] && f < b[6] ? 0.5 + 0.5 * Math.sin((f - b[5]) * 0.3) : 0;
      const dim2 = ease(f, b[6], 14);
      const hx = (c: number) => COLS[c] + CW;
      return (
        <>
          <Sentence toks={toks} y={214} size={52} f={f} label="主模型出 1 个，MTP 模块接着往后猜" />
          <Svg>
            {/* shared output head + embedding */}
            <rect x={COLS[0]} y={OY} width={COLS[2] + CW - COLS[0]} height={44} rx={8} fill={shared ? '#D6E0F2' : C.targetBg} stroke={C.target} strokeWidth={2.5 + shared * 2} opacity={pMain} />
            <TermS x={(COLS[0] + COLS[2] + CW) / 2} y={OY + 30} zh="输出头（三列共用）" en="shared Output Head" c={C.target} size={21} anchor="middle" a={pMain} />
            <rect x={COLS[0]} y={EY} width={COLS[2] + CW - COLS[0]} height={44} rx={8} fill={shared ? '#D6E0F2' : C.targetBg} stroke={C.target} strokeWidth={2.5 + shared * 2} opacity={pMain} />
            <TermS x={(COLS[0] + COLS[2] + CW) / 2} y={EY + 30} zh="词嵌入（三列共用）" en="shared Embedding" c={C.target} size={21} anchor="middle" a={pMain} />
            {/* main model */}
            <g opacity={pMain}>
              <Stack x={COLS[0] + 40} y={508} w={220} h={270} n={6} color={C.target} bg={C.targetBg} />
              <TermS x={COLS[0] + 76} y={OY + 82} zh="主模型" en="Main Model" c={C.target} size={22} />
              <Arrow pts={[[COLS[0] + 150, EY - 2], [COLS[0] + 150, 784]]} color={C.ink} />
              <Arrow pts={[[COLS[0] + 58, 504], [COLS[0] + 58, OY + 50]]} color={C.target} tone="target" />
              <Chip x={COLS[0] + 150} y={EY + 64} t="气" s="done" size={26} />
            </g>
            <Module x={COLS[1]} k={1} f={f} b={b} a={pM1} dim={0} />
            <Module x={COLS[2]} k={2} f={f} b={b} a={pM2} dim={dim2} />
            <Chip x={COLS[1] + 225} y={EY + 64} t="很" s="done" size={26} a={pH} />
            <Chip x={COLS[2] + 225} y={EY + 64} t="好" s="draft" size={26} a={pH * (1 - 0.6 * dim2)} />
            {/* hidden state h(k-1) → next module's left norm: the causal chain */}
            {[0, 1].map((c) => (
              <g key={c} opacity={c === 1 ? 1 - 0.6 * dim2 : 1}>
                <Arrow pts={[[hx(c) - 40, 530], [hx(c) + 40, 530], [hx(c) + 40, 760], [COLS[c + 1] + 75, 760], [COLS[c + 1] + 75, 734]]} color={C.model} tone="model" w={3.5} p={ease(f, b[1] + c * 20, 24)} />
                <text x={hx(c) + 48} y={640} style={{font: `italic 600 24px ${NUM}`, fill: C.model}} opacity={pH}>
                  h{c === 0 ? '⁰' : '¹'}
                </text>
              </g>
            ))}
          </Svg>
          <Term x={1280} y={440} zh="因果链" en="causal chain" c={C.model} a={ease(f, b[1] + 30, 14)} />
          <div style={{position: 'absolute', left: 1280, top: 476, width: 544, font: `500 21px ${ZH}`, color: C.dim, opacity: ease(f, b[1] + 30, 14)}}>
            模块 k 吃上一深度的隐状态 h，和往后第 k 个 token（t<sub>i+k</sub>）的 embedding
          </div>
          <Card x={1280} y={540} w={544} a={ease(f, b[5], 16)} rows={[{t: '共用：embedding、输出头', c: C.target}, {t: '新增：投影 M + 1 个 Transformer 块', c: C.draft}]} />
          <Card x={1280} y={700} w={544} a={ease(f, b[6], 16) * (1 - ease(f, b[7], 10))} head="推理（V3：只用模块 1）" rows={[{t: '这次前向的 h⁰ → 模块 1 猜 1 个', sub: '主模型下一次前向顺带核对它', c: C.drafter}]} />
          <Card x={1280} y={700} w={544} a={ease(f, b[7], 16)} head="和主模型一起预训练" rows={[{t: 'L = L_main + λ · L_MTP', sub: 'λ：前 10T token 0.3，后 4.8T 0.1（§4.2）', c: C.ok}]} />
          <Src t="DeepSeek-V3 技术报告（arXiv 2412.19437）§2.2 式 (21)–(25)、Figure 3、§4.2" a={pMain} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ mtp_num
export const MtpNum: React.FC<{scene: Scene}> = () => (
  <Page tag="① MTP · DeepSeek-V3" title="V3：只多猜 1 个" sub="每轮：主模型 1 个 + MTP 草稿 1 个">
    {({f, b}) => {
      // 20 rounds, ~87% of second tokens accepted (illustrative)
      const miss = [3, 11, 17];
      const n = Math.min(20, Math.floor(Math.max(0, f - b[0]) / 5));
      return (
        <>
          <Svg>
            {Array.from({length: 20}, (_, i) => {
              const x = 100 + (i % 10) * 108,
                y = 300 + Math.floor(i / 10) * 130;
              const a = i < n ? 1 : 0.15;
              const ok = !miss.includes(i);
              const judged = f >= b[1] + i * 2;
              return (
                <g key={i} opacity={a}>
                  <rect x={x} y={y} width={44} height={44} rx={6} fill={C.card} stroke={C.ink} strokeWidth={2} />
                  <rect x={x + 50} y={y} width={44} height={44} rx={6} fill={judged ? (ok ? C.okBg : 'transparent') : C.draftBg} stroke={judged ? (ok ? C.ok : C.bad) : C.draft} strokeWidth={2} strokeDasharray={judged ? undefined : '6 4'} />
                  {judged && !ok && <line x1={x + 54} y1={y + 30} x2={x + 90} y2={y + 14} stroke={C.bad} strokeWidth={3} />}
                </g>
              );
            })}
            <Label x={110} y={580} t="黑框：主模型的 token · 右格：MTP 草稿，绿 = 留下，红 = 作废 · 示意" />
          </Svg>
          <Card x={110} y={630} w={500} a={ease(f, b[1], 16)} head="第 2 个 token 的接受率" rows={[{t: '85% – 90%', c: C.ok}]} />
          <Card x={650} y={630} w={460} a={ease(f, b[2], 16)} head="每秒生成 token 数（TPS）" rows={[{t: '1.8 倍', c: C.target}]} />
          <Quote x={1210} y={300} w={614} a={ease(f, b[3], 16)} q="during inference, we can directly discard the MTP modules and the main model can function independently and normally" src="DeepSeek-V3 §2.2 · MTP 首先是训练目标，推理时可以丢掉" />
          <Src t="DeepSeek-V3 技术报告 §5.4.3（接受率、TPS）、§2.2（丢弃）" a={ease(f, b[0], 14)} />
        </>
      );
    }}
  </Page>
);
