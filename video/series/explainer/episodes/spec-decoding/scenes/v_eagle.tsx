// v2 (typing close-up + flat diagram): EAGLE-3.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {Arrow, Box, C, Card, Chip, done, ease, Label, layerY, NUM, Page, Sentence, Src, Stack, Svg, Term, TermS, Tok, ZH} from './type';

const clamp1 = (x: number) => Math.max(0, Math.min(1, x));

// ------------------------------------------------------------------ eagle_intro: bolt-on drafter on a frozen target
export const EagleIntro: React.FC<{scene: Scene}> = () => (
  <Page tag="② EAGLE-3 · 2025.03" title="EAGLE-3：外挂一台小草稿机" sub="Li et al. · arXiv 2503.01840 · NeurIPS 2025">
    {({f, b}) => {
      const pT = ease(f, b[0], 16);
      const pD = ease(f, b[2], 18);
      const steps = [
        ['EAGLE', '2024.01', '特征层上做自回归', 'feature-level autoregression'],
        ['EAGLE-2', '2024.06', '按置信度动态长草稿树', 'dynamic draft tree'],
        ['EAGLE-3', '2025.03', '多层特征融合 + 训练时测试', 'multi-layer fusion · training-time test'],
      ];
      return (
        <>
          <Card
            x={96}
            y={230}
            w={760}
            a={ease(f, b[1], 16)}
            head="作者单位"
            rows={[{t: '北京大学 · 微软研究院 · 滑铁卢大学 · Vector 研究所', c: C.ink}]}
          />
          <Svg>
            <g opacity={pT}>
              <Stack x={150} y={470} w={300} h={380} n={10} color={C.target} bg={C.targetBg} />
              <TermS x={300} y={452} zh="目标模型" en="target model" c={C.target} anchor="middle" />
              <Label x={300} y={882} t="冻住 frozen：一个参数不动" anchor="middle" color={C.target} weight={600} a={pD} />
            </g>
            <g opacity={pD}>
              <Arrow pts={[[454, 600], [640, 600]]} color={C.target} tone="target" w={3} p={pD} label="特征 features" lx={466} ly={588} />
              <Box x={650} y={550} w={220} h={100} fill={C.drafterBg} stroke={C.drafter} label="草稿机" sub="draft model · 1 层" color={C.drafter} size={30} />
              <Label x={760} y={690} t="模型训好以后再单独训练" anchor="middle" color={C.drafter} weight={600} />
            </g>
          </Svg>
          {steps.map(([n, d, zh, en], i) => {
            const a = ease(f, i === 0 ? b[3] : i === 1 ? b[4] : b[4] + 50, 14);
            return (
              <div key={n} style={{position: 'absolute', left: 1010, top: 290 + i * 190, width: 814, opacity: a}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                  <span style={{font: `700 40px ${NUM}`, color: i === 2 ? C.drafter : C.ink}}>{n}</span>
                  <span style={{font: `600 24px ${NUM}`, color: C.dim}}>{d}</span>
                </div>
                <div style={{font: `600 26px ${ZH}`, marginTop: 6}}>{zh}</div>
                <div style={{font: `italic 500 20px ${NUM}`, color: C.dim}}>{en}</div>
                {i < 2 && <div style={{position: 'absolute', left: 14, top: 142, width: 3, height: 40, background: C.line}} />}
              </div>
            );
          })}
          <Src t="EAGLE arXiv 2401.15077 · EAGLE-2 arXiv 2406.16858 · EAGLE-3 arXiv 2503.01840" a={pT} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ eagle_arch: the drafter, redrawn from EAGLE-3 Fig. 5
// target taps l/m/h → concat 3k → FC → g ; [g | e] → FC → 1-layer decoder → LM head → draft token
export const EagleArch: React.FC<{scene: Scene}> = () => (
  <Page tag="② EAGLE-3 · 结构" title="草稿机：只有 1 层 decoder" sub="EAGLE-3 论文 §3.1 Figure 5（How can I → do → it）重画">
    {({f, b}) => {
      const SX = 110,
        SY = 470,
        SW = 190,
        SH = 380,
        N = 9;
      const taps = [
        {i: 1, t: '低 l', c: '#7FA0D6'},
        {i: 4, t: '中 m', c: C.target},
        {i: 7, t: '高 h', c: '#24427A'},
      ];
      const pDec = ease(f, b[0], 16);
      const pTap = ease(f, b[1], 22);
      const pCat = ease(f, b[2], 18);
      const pFc = ease(f, b[2] + 24, 16);
      const pIn = ease(f, b[3], 18);
      const pHead = ease(f, b[3] + 40, 18);
      const step1 = ease(f, b[4], 18);
      const s2 = f >= b[5]; // step 2 has begun: the new token has no target feature yet
      const step2 = f >= b[6]; // …so the drafter's own output a stands in for g
      const pLoop = ease(f, b[6], 22);
      const dimTarget = s2 ? 0.35 : 1;
      const MID = layerY(SY, SH, N, 4);
      const CATX = 410,
        SEG = 50,
        CATY = MID - 26;
      const FC1 = 600; // fc 1
      const GX = 740; // g | e pair
      const FC2 = 900;
      const DX = 1030,
        DW = 200,
        DH = 130,
        DY = MID - DH / 2;
      const HX = 1290,
        HW = 150;
      const route = (j: number): [number, number][] => {
        const y = layerY(SY, SH, N, taps[j].i);
        const x = CATX + j * SEG + SEG / 2 - 2;
        if (j === 1) return [[SX + SW + 4, y], [CATX - 22, y], [CATX - 22, CATY - 30], [x, CATY - 30], [x, CATY - 4]];
        return [[SX + SW + 4, y], [x, y], [x, j === 2 ? CATY - 4 : CATY + 56]];
      };
      const segOf = (j: number) => j;
      const toks: Tok[] = done('今天天气');
      if (f >= b[4] + 40) toks.push({t: '很', s: 'draft', a: ease(f, b[4] + 40, 12), tag: '第 1 步'});
      if (f >= b[6] + 30) toks.push({t: '好', s: 'draft', a: ease(f, b[6] + 30, 12), tag: '第 2 步'});
      return (
        <>
          <Sentence toks={toks} y={214} size={56} f={f} label="草稿机正在猜" />
          <Svg>
            <g opacity={dimTarget}>
              <Stack x={SX} y={SY} w={SW} h={SH} n={N} color={C.target} bg={C.targetBg} hi={pTap > 0.5 ? taps.map((k) => k.i) : []} />
              <TermS x={SX + SW / 2} y={SY - 16} zh="目标模型" en="target model" c={C.target} size={22} anchor="middle" />
              <Label x={SX + SW / 2} y={SY + SH + 30} t="冻住 frozen" anchor="middle" color={C.target} size={20} />
              {taps.map((k, j) => (
                <g key={k.t}>
                  <Label x={SX - 10} y={layerY(SY, SH, N, k.i) + 8} t={k.t} anchor="end" color={k.c} weight={700} size={22} a={pTap} />
                  <Arrow pts={route(j)} color={k.c} tone="target" w={3} p={clamp1(pTap * 1.4 - j * 0.2)} />
                </g>
              ))}
              {taps.map((k, j) => (
                <rect key={j} x={CATX + segOf(j) * SEG} y={CATY} width={SEG - 4} height={52} rx={5} fill={k.c} opacity={pCat * 0.85} />
              ))}
              <Label x={CATX + SEG + 4} y={CATY + 88} t="拼成 3 倍宽" color={C.ink} weight={700} size={20} a={pCat} />
              <Label x={CATX + SEG + 4} y={CATY + 113} t="concat 3k" size={20} a={pCat} />
              <Arrow pts={[[CATX + SEG * 3 + 2, MID], [FC1 - 4, MID]]} color={C.ink} p={pFc} />
              <Box x={FC1} y={MID - 40} w={84} h={80} label="FC" sub="全连接" a={pFc} size={26} />
              <Label x={FC1 + 42} y={MID + 66} t="3k → k" anchor="middle" size={19} a={pFc} />
              <Arrow pts={[[FC1 + 88, MID], [GX - 4, MID]]} color={C.target} tone="target" p={pIn} />
            </g>
            {/* g | e pair: fused feature + token embedding */}
            <g opacity={pIn}>
              <rect x={GX} y={MID - 26} width={SEG - 4} height={52} rx={5} fill={step2 ? C.drafter : C.target} opacity={0.85} />
              <rect x={GX + SEG} y={MID - 26} width={SEG - 4} height={52} rx={5} fill={C.draft} opacity={0.85} />
              <text x={GX + SEG / 2 - 2} y={MID - 36} textAnchor="middle" style={{font: `italic 700 24px ${NUM}`, fill: step2 ? C.drafter : C.target}}>
                {step2 ? 'a' : 'g'}
              </text>
              <text x={GX + SEG * 1.5 - 2} y={MID - 36} textAnchor="middle" style={{font: `italic 700 24px ${NUM}`, fill: C.draft}}>
                e
              </text>
              <Arrow pts={[[GX + SEG * 1.5 - 2, MID + 120], [GX + SEG * 1.5 - 2, MID + 30]]} color={C.draft} tone="draft" p={pIn} />
              <Box x={GX + SEG * 1.5 - 76} y={MID + 120} w={150} h={68} label="词嵌入" sub="embedding" size={22} stroke={C.draft} />
              <Chip x={GX - 40} y={MID + 154} t={s2 ? '很' : '气'} s={s2 ? 'draft' : 'done'} size={24} />
              <Arrow pts={[[GX - 20, MID + 154], [GX + SEG * 1.5 - 76, MID + 154]]} color={C.ink} p={pIn} />
              <Arrow pts={[[GX + SEG * 2 + 2, MID], [FC2 - 4, MID]]} color={C.ink} p={pIn} />
              <Box x={FC2} y={MID - 40} w={84} h={80} label="FC" sub="全连接" size={26} />
              <Label x={FC2 + 42} y={MID + 66} t="2k → k" anchor="middle" size={19} />
              <Arrow pts={[[FC2 + 88, MID], [DX - 4, MID]]} color={C.ink} p={pIn} />
            </g>
            {s2 && (
              <g opacity={ease(f, b[5], 12)}>
                <line x1={FC1 + 96} y1={MID - 16} x2={FC1 + 130} y2={MID + 16} stroke={C.bad} strokeWidth={5} />
                <line x1={FC1 + 130} y1={MID - 16} x2={FC1 + 96} y2={MID + 16} stroke={C.bad} strokeWidth={5} />
                <Label x={FC1 + 42} y={MID - 86} t="新词还没过目标模型" anchor="middle" color={C.bad} weight={600} size={20} />
              </g>
            )}
            {/* the one-layer decoder + LM head */}
            <Box x={DX} y={DY} w={DW} h={DH} fill={C.drafterBg} stroke={C.drafter} label="1 层 decoder" sub="解码层" color={C.drafter} size={28} a={pDec} />
            <TermS x={DX + DW / 2} y={DY + DH + 34} zh="草稿机" en="draft model" c={C.drafter} size={24} anchor="middle" a={pDec} />
            <Arrow pts={[[DX + DW + 4, MID], [HX - 4, MID]]} color={C.drafter} tone="drafter" p={pHead} />
            <Box x={HX} y={MID - 40} w={HW} h={80} label="输出头" sub="LM head" size={26} a={pHead} />
            <Label x={HX + HW / 2} y={MID + 74} t="仓库代码：" anchor="middle" size={19} a={pHead} />
            <Label x={HX + HW / 2} y={MID + 98} t="草稿自带、词表裁小" anchor="middle" size={19} a={pHead} />
            <Arrow pts={[[HX + HW / 2, MID - 44], [HX + HW / 2, 412]]} color={C.draft} tone="draft" p={ease(f, b[3] + 50, 20)} label="草稿词" lx={HX + HW / 2 + 12} ly={460} />
            {/* step 2+: the decoder's own output a stands in for g */}
            <Arrow
              pts={[[DX + DW / 2, DY - 4], [DX + DW / 2, DY - 60], [GX + SEG / 2 - 2, DY - 60], [GX + SEG / 2 - 2, MID - 60]]}
              color={C.drafter}
              tone="drafter"
              w={3.5}
              dash
              p={pLoop}
              label="a：草稿机自己上一步的输出顶上"
              lx={GX + 60}
              ly={DY - 72}
            />
          </Svg>
          <Card x={1500} y={560} w={324} a={ease(f, b[0] + 20, 14)} head="对比" rows={[{t: '目标模型', sub: '几十层，冻住', c: C.target}, {t: '草稿机', sub: '1 层 + 2 个 FC + 输出头', c: C.drafter}]} />
          <Src t="EAGLE-3 论文 §3.1、Figure 5 · 取层位置见仓库代码（第 2、L/2、L−3 层），楼层为示意" a={pTap} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ eagle_ttt: training-time test (Fig. 6 mask)
const MASKCOL = ['#B8B2A6', '#5A9BCB', '#E3B04B'];
const MTOK = [
  ['How', 'can', 'I'],
  ['are', 'we', 'do'],
  ['·', '·', '·'],
];
const Mask: React.FC<{x: number; y: number; cell: number; steps: number; a: number}> = ({x, y, cell, steps, a}) => {
  const n = 3;
  const cells: React.ReactNode[] = [];
  for (let qs = 0; qs < steps; qs++)
    for (let qi = 0; qi < n; qi++)
      for (let ks = 0; ks < 3; ks++)
        for (let ki = 0; ki < n; ki++) {
          let on = false;
          if (ks === 0) on = ki <= qi;
          else if (ks <= qs) on = ki === qi;
          cells.push(<rect key={`${qs}${qi}${ks}${ki}`} x={x + (ks * n + ki) * cell + 2} y={y + (qs * n + qi) * cell + 2} width={cell - 4} height={cell - 4} rx={5} fill={on ? MASKCOL[qs] : 'rgba(46,37,34,.07)'} />);
        }
  return (
    <g opacity={a}>
      {cells}
      {MTOK.map((t, s) =>
        t.map((w, i) => (
          <g key={`${s}${i}`}>
            <text x={x + (s * n + i) * cell + cell / 2} y={y - 12} textAnchor="middle" style={{font: `600 18px ${NUM}`, fill: C.dim}}>
              {w}
            </text>
            {s < steps && (
              <text x={x - 12} y={y + (s * n + i) * cell + cell / 2 + 6} textAnchor="end" style={{font: `600 18px ${NUM}`, fill: C.dim}}>
                {w}
              </text>
            )}
          </g>
        )),
      )}
    </g>
  );
};

export const EagleTtt: React.FC<{scene: Scene}> = () => (
  <Page tag="② EAGLE-3 · 训练" title="训练时测试" sub="training-time test：训练时就让草稿机吃自己的输出">
    {({f, b}) => {
      const steps = f >= b[2] + 40 ? 3 : f >= b[2] ? 2 : 1;
      const am = ease(f, b[1], 16);
      const q2 = ease(f, b[4], 20);
      // the problem: chain of steps, step 2+ input = own output
      const chain = ease(f, b[0], 20);
      return (
        <>
          <Svg>
            <g opacity={chain}>
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <Box x={110 + i * 170} y={300} w={120} h={70} fill={C.drafterBg} stroke={C.drafter} label={`第 ${i + 1} 步`} size={22} color={C.drafter} />
                  <text x={170 + i * 170} y={406} textAnchor="middle" style={{font: `600 21px ${ZH}`, fill: i === 0 ? C.target : C.bad}}>
                    {i === 0 ? 'g 真特征' : 'a 自己的'}
                  </text>
                  {i < 2 && <Arrow pts={[[232 + i * 170, 335], [278 + i * 170, 335]]} color={C.bad} tone="bad" dash p={chain} />}
                </g>
              ))}
              <Label x={110} y={460} t="推理时第 2 步起，输入是自己上一步的输出" color={C.bad} weight={600} />
            </g>
            <g opacity={am}>
              <rect x={640} y={240} width={560} height={620} rx={16} fill={C.card} stroke={C.line} strokeWidth={2} />
              <TermS x={668} y={290} zh="训练时的注意力 mask" en="attention mask" size={24} />
              <Mask x={740} y={350} cell={50} steps={steps} a={1} />
              <Label x={668} y={840} t="按论文 Figure 6 重画" size={18} />
            </g>
          </Svg>
          <div style={{position: 'absolute', left: 110, top: 520, opacity: am}}>
            {[
              ['原序列：吃真特征，因果 mask', MASKCOL[0], b[1]],
              ['多走一步：吃自己上一步的输出', MASKCOL[1], b[2]],
              ['再走一步：自己的输出只看对角线', MASKCOL[2], b[2] + 40],
            ].map(([t, c, at], i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: i ? 14 : 0, opacity: ease(f, at as number, 12)}}>
                <div style={{width: 18, height: 18, borderRadius: 4, background: c as string}} />
                <div style={{font: `600 23px ${ZH}`}}>{t}</div>
              </div>
            ))}
          </div>
          <Term x={1270} y={260} zh="训练时测试" en="training-time test" c={C.drafter} size={30} a={ease(f, b[1], 14)} />
          <Card x={1270} y={330} w={554} a={ease(f, b[3], 16)} rows={[{t: '去掉特征回归损失 l_fea', sub: '只留 token 损失：直接把词猜对', c: C.bad}]} />
          <div style={{position: 'absolute', left: 1270, top: 480, width: 554, height: 330, background: C.card, border: `2px solid ${C.line}`, borderRadius: 16, opacity: q2}}>
            <div style={{position: 'absolute', left: 26, top: 20, font: `700 24px ${ZH}`}}>训练数据越多，加速越高</div>
          </div>
          <Svg>
            <g opacity={q2}>
              <line x1={1330} y1={590} x2={1330} y2={760} stroke={C.ink} strokeWidth={2} />
              <line x1={1330} y1={760} x2={1780} y2={760} stroke={C.ink} strokeWidth={2} />
              <path d={`M1330,740 L${1330 + 450 * q2},${740 - 140 * q2}`} stroke={C.ok} strokeWidth={4} fill="none" />
              <path d={`M1330,740 L${1330 + 450 * q2},${732}`} stroke={C.faint} strokeWidth={4} fill="none" />
              <text x={1776} y={592} textAnchor="end" style={{font: `700 21px ${NUM}`, fill: C.ok}}>
                EAGLE-3
              </text>
              <text x={1776} y={718} textAnchor="end" style={{font: `700 21px ${NUM}`, fill: C.dim}}>
                EAGLE
              </text>
              <Label x={1330} y={790} t="数据量 →（趋势示意，见论文 Figure 1）" size={18} />
            </g>
          </Svg>
          <Src t="EAGLE-3 论文 §3.2、Figure 1、Figure 6" a={am} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ eagle_tree: dynamic draft tree, one tree-attention pass, closed loop
type Node = {t: string; d: number; y: number; p: number; acc?: boolean};
const TREE: Node[] = [
  {t: '很', d: 1, y: 570, p: -1, acc: true},
  {t: '真', d: 1, y: 790, p: -1},
  {t: '好', d: 2, y: 510, p: 0, acc: true},
  {t: '热', d: 2, y: 630, p: 0},
  {t: '不', d: 2, y: 790, p: 1},
  {t: '适', d: 3, y: 470, p: 2, acc: true},
  {t: '，', d: 3, y: 560, p: 2},
  {t: '啊', d: 3, y: 650, p: 3},
  {t: '错', d: 3, y: 790, p: 4},
];
const TX0 = 170,
  TDX = 170,
  ROOTY = 670;

export const EagleTree: React.FC<{scene: Scene}> = () => (
  <Page tag="② EAGLE-3 · 推理" title="草稿树 + 一次核对" sub="dynamic draft tree（沿用 EAGLE-2）· tree attention">
    {({f, b}) => {
      const verify = f >= b[1];
      const kept = f >= b[2];
      const toks: Tok[] = done('今天天气');
      if (kept) {
        TREE.filter((n) => n.acc).forEach((n, i) => toks.push({t: n.t, s: 'ok', a: ease(f, b[2] + i * 6, 8)}));
        if (f >= b[2] + 30) toks.push({t: '合', s: 'model', a: ease(f, b[2] + 30, 10), tag: 'bonus'});
      }
      const xy = (n: Node): [number, number] => [TX0 + n.d * TDX, n.y];
      const pLoop = ease(f, b[3], 22);
      const deep = ease(f, b[7], 16);
      return (
        <>
          <Sentence toks={toks} y={214} size={56} f={f} label={kept ? '留下被接受的那一条枝' : '每个分叉是一种可能'} />
          <Svg>
            <Chip x={TX0} y={ROOTY} t="气" s="done" size={30} />
            {TREE.map((n, i) => {
              const a = ease(f, b[0] + 10 + n.d * 26 + i * 3, 10);
              const par = n.p < 0 ? ([TX0, ROOTY] as [number, number]) : xy(TREE[n.p]);
              const [x, y] = xy(n);
              const s: Tok['s'] = !kept ? 'draft' : n.acc ? 'ok' : 'void';
              return (
                <g key={i} opacity={a}>
                  <path d={`M${par[0] + 24},${par[1]} C${par[0] + 90},${par[1]} ${x - 90},${y} ${x - 24},${y}`} fill="none" stroke={kept && n.acc ? C.ok : C.faint} strokeWidth={kept && n.acc ? 4 : 2.5} />
                  <Chip x={x} y={y} t={n.t} s={s} size={30} />
                </g>
              );
            })}
            {[1, 2, 3].map((d) => (
              <text key={d} x={TX0 + d * TDX} y={878} textAnchor="middle" opacity={deep} style={{font: `700 20px ${ZH}`, fill: C.drafter}}>
                草稿机第 {d} 次
              </text>
            ))}
            {/* target model: one forward over the whole tree */}
            <g opacity={ease(f, b[1] - 10, 16)}>
              <Arrow pts={[[TX0 + 3 * TDX + 50, 630], [820, 630]]} color={C.target} tone="target" w={3} p={ease(f, b[1], 20)} label="整棵树" lx={TX0 + 3 * TDX + 62} ly={614} />
              <Stack x={830} y={490} w={240} h={300} n={8} color={C.target} bg={C.targetBg} hi={verify && !kept ? [Math.floor((f - b[1]) / 4) % 8] : []} />
              <TermS x={940} y={474} zh="目标模型" en="target model" c={C.target} size={22} anchor="middle" />
              <TermS x={950} y={830} zh="树形注意力" en="tree attention" c={C.target} size={21} anchor="middle" a={ease(f, b[1], 14)} />
              <Label x={950} y={856} t="一次前向核完整棵树" anchor="middle" size={19} a={ease(f, b[1], 14)} />
            </g>
            {/* closed loop: this pass's low/mid/high features feed the next round's drafter */}
            <g opacity={pLoop}>
              <Arrow pts={[[1064, 486], [1064, 410], [376, 410]]} color={C.drafter} tone="drafter" w={3.5} dash p={pLoop} />
              <Box x={110} y={386} w={262} h={48} fill={C.drafterBg} stroke={C.drafter} label="下一轮草稿机 draft model" size={19} color={C.drafter} />
              <Label x={420} y={442} t="这次前向的低 / 中 / 高层特征 → 下一轮" color={C.drafter} weight={600} size={21} />
            </g>
          </Svg>
          <div style={{position: 'absolute', left: 1130, top: 440, width: 694, opacity: ease(f, b[4], 16)}}>
            <div style={{font: `700 22px ${ZH}`, color: C.dim, marginBottom: 12}}>Llama 3.1 8B · 平均加速（T = 0）</div>
            {[
              ['EAGLE-3', 4.44, C.drafter, b[4], 'τ 6.23'],
              ['EAGLE-2', 3.23, C.faint, b[5], ''],
            ].map(([n, v, c, at, sub]) => (
              <div key={n as string} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, opacity: ease(f, at as number, 12)}}>
                <div style={{width: 120, font: `700 24px ${NUM}`}}>{n}</div>
                <div style={{height: 40, width: (v as number) * 80 * ease(f, at as number, 20), background: c as string, borderRadius: 6}} />
                <div style={{font: `600 30px ${NUM}`}}>{(v as number).toFixed(2)}×</div>
                <div style={{font: `700 28px ${NUM}`, color: C.drafter}}>{sub}</div>
              </div>
            ))}
          </div>
          <Card x={1130} y={640} w={694} a={ease(f, b[6], 16)} rows={[{t: '最高一项：6.47×', sub: 'Vicuna 13B · HumanEval（写代码）· T = 0', c: C.ok}]} />
          <Card x={1130} y={760} w={694} a={deep} rows={[{t: '草稿仍是一层一层猜的', sub: '树深 8 层 → 草稿机跑 8 次（Appendix A）', c: C.bad}]} />
          <Src t="EAGLE-3 论文 Table 1、Appendix A · 树形为示意" a={ease(f, b[0], 14)} />
        </>
      );
    }}
  </Page>
);
