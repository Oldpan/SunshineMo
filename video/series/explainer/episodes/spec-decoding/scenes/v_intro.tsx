// v2 (typing close-up + flat diagram): opening and the basics.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {
  Arrow,
  Box,
  C,
  Card,
  Chip,
  done,
  ease,
  fade,
  Label,
  lerp,
  NUM,
  Page,
  Quote,
  Round,
  roundToks,
  Sentence,
  Src,
  Stack,
  Svg,
  Term,
  TermS,
  Tok,
  TokBox,
  ZH,
} from './type';

// ------------------------------------------------------------------ hook: one token per pass vs a run per pass
const SENT = '今天天气很好适合出门散步';
const ROUNDS: Round[] = [
  {chars: ['今', '天', '天', '汽'], ok: 3, fix: '气'},
  {chars: ['很', '好', '合', '适'], ok: 2, fix: '适'},
  {chars: ['合', '出', '门', '散'], ok: 4, fix: '步'},
];
const RLEN = 58;
const PER = 22;

const specToks = (t: number): {toks: Tok[]; fwd: number} => {
  let committed = '';
  let toks: Tok[] = [];
  let fwd = 0;
  for (let k = 0; k < ROUNDS.length; k++) {
    const tk = t - k * RLEN;
    if (tk < 0) break;
    const r = ROUNDS[k];
    if (tk >= 22) fwd = k + 1;
    if (tk < RLEN || k === ROUNDS.length - 1) {
      toks = [...done(committed), ...roundToks(r, tk)];
      if (tk >= RLEN) toks = done(committed + r.chars.slice(0, r.ok).join('') + r.fix);
      return {toks, fwd};
    }
    committed += r.chars.slice(0, r.ok).join('') + r.fix;
  }
  return {toks: done(committed), fwd};
};

const LEGEND: {t: string; s: Tok['s']; zh: string; en: string}[] = [
  {t: '很', s: 'draft', zh: '草稿', en: 'draft token'},
  {t: '好', s: 'ok', zh: '核对通过，留下', en: 'accepted'},
  {t: '合', s: 'bad', zh: '第一个猜错，作废', en: 'rejected'},
  {t: '适', s: 'model', zh: '目标模型自己出的词', en: 'bonus / corrected'},
];

export const Hook: React.FC<{scene: Scene}> = () => (
  <Page>
    {({f, b}) => {
      const t = f - 8;
      const nL = Math.min(SENT.length, t < 0 ? 0 : Math.floor(t / PER) + 1);
      const spec = specToks(t);
      const rowsA = 1 - ease(f, b[4], 14);
      const tl = ease(f, b[4] + 6, 18);
      const same = ease(f, b[2], 14);
      const methods = [
        ['MTP', '2024.04', 'Meta / DeepSeek'],
        ['EAGLE-3', '2025.03', '北大 · 微软 · 滑铁卢 · Vector'],
        ['DFlash', '2026.02', 'UCSD z-lab'],
        ['DSpark', '2026.07', 'DeepSeek · 北大'],
        ['DFlash 2', '2026.08', 'Inco AI'],
      ];
      const X0 = 200,
        X1 = 1720,
        TY = 470;
      const part = ease(f, b[6], 16);
      return (
        <>
          <div style={{opacity: rowsA}}>
            <Term x={96} y={84} zh="逐个生成" en="autoregressive decoding" size={32} />
            <div style={{position: 'absolute', left: 560, top: 88, font: `600 27px ${ZH}`, color: C.target}}>目标模型前向 {nL} 次</div>
            <Sentence toks={done(SENT.slice(0, nL))} y={136} size={62} f={f} label="一次前向，一个 token" />
            <Term x={96} y={420} zh="投机解码" en="speculative decoding" size={32} />
            <div style={{position: 'absolute', left: 560, top: 424, font: `600 27px ${ZH}`, color: C.target}}>目标模型前向 {spec.fwd} 次</div>
            <Sentence toks={spec.toks} y={472} size={62} f={f} label="草稿先猜，一次前向核对一排" />
            <div style={{position: 'absolute', right: 96, top: 380, font: `700 30px ${ZH}`, color: C.ok, opacity: same}}>两行结果一字不差 ✓</div>
            {/* legend: the colour code used for the whole film */}
            <div style={{position: 'absolute', left: 96, top: 730, display: 'flex', gap: 44, opacity: ease(f, b[3], 14)}}>
              {LEGEND.map((k, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: ease(f, b[3] + i * 8, 10)}}>
                  <TokBox t={k.t} s={k.s} size={42} />
                  <div>
                    <div style={{font: `700 26px ${ZH}`}}>{k.zh}</div>
                    <div style={{font: `italic 500 19px ${NUM}`, color: C.dim}}>{k.en}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {tl > 0 && (
            <>
              <div style={{position: 'absolute', left: 96, top: 120, font: `700 56px ${ZH}`, opacity: tl}}>五种投机解码</div>
              <div style={{position: 'absolute', left: 98, top: 196, font: `500 26px ${ZH}`, color: C.dim, opacity: tl}}>按出现先后</div>
              <Svg>
                <line x1={X0} y1={TY} x2={lerp(X0, X1, tl)} y2={TY} stroke={C.ink} strokeWidth={3} />
                {methods.map(([n, d, who], i) => {
                  const a = ease(f, b[5] + i * 9, 10);
                  const x = lerp(X0 + 80, X1 - 80, i / 4);
                  return (
                    <g key={n} opacity={a}>
                      <circle cx={x} cy={TY} r={10} fill={C.card} stroke={C.ink} strokeWidth={3} />
                      <text x={x} y={TY - 34} textAnchor="middle" style={{font: `700 38px ${NUM}`, fill: C.ink}}>
                        {n}
                      </text>
                      <text x={x} y={TY + 48} textAnchor="middle" style={{font: `600 24px ${NUM}`, fill: C.dim}}>
                        {d}
                      </text>
                      <text x={x} y={TY + 80} textAnchor="middle" style={{font: `500 19px ${ZH}`, fill: C.faint}}>
                        {who}
                      </text>
                      <Arrow pts={[[x, TY + 230], [x, TY + 104]]} color={C.drafter} tone="drafter" w={2.5} p={part} />
                    </g>
                  );
                })}
                <Box x={X0 + 30} y={TY + 236} w={X1 - X0 - 60} h={110} fill={C.drafterBg} stroke={C.drafter} a={part} />
                <TermS x={(X0 + X1) / 2} y={TY + 298} zh="换的都是同一个零件：草稿机" en="draft model" c={C.drafter} size={34} anchor="middle" a={part} />
              </Svg>
            </>
          )}
          <Src t="示意 · 两行输出相同，前向次数不同" a={same * rowsA} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ why: decoding is memory-bound
export const Why: React.FC<{scene: Scene}> = () => (
  <Page tag="基础" title="为什么能快" sub="一次前向卡在显存读取上，算力却大多闲着">
    {({f, b}) => {
      const batch = f >= b[4];
      const per = 34;
      const t = f - b[1];
      const k = t < 0 ? -1 : Math.floor(t / per);
      const ph = t < 0 ? -1 : (t % per) / per;
      const nTok = batch ? 4 : Math.max(0, Math.min(6, k + (ph > 0.6 ? 1 : 0)));
      const toks: Tok[] = batch
        ? [...done('今天天气'), ...['很', '好', '适', '合'].map((c, i) => ({t: c, s: (f >= b[4] + 40 ? 'ok' : 'draft') as Tok['s'], a: ease(f, b[4] + i * 4, 8)}))]
        : done('今天天气很好'.slice(0, nTok));
      const read = ph >= 0 && ph < 0.55;
      const flow = ease(ph * per, 0, per * 0.5);
      const MX = 140,
        MY = 480,
        GX = 760,
        GY = 500;
      return (
        <>
          <Sentence toks={toks} y={214} size={56} f={f} label={batch ? '投机解码：一次前向核对 4 个' : '逐个生成：一次前向出 1 个'} />
          <Svg>
            {/* memory: the weights */}
            <g opacity={ease(f, b[1] - 20, 16)}>
              {Array.from({length: 6}, (_, i) => (
                <rect key={i} x={MX} y={MY + i * 56} width={300} height={46} rx={6} fill="#EDE3CC" stroke="#B9A57A" strokeWidth={2} />
              ))}
              <TermS x={MX} y={MY - 22} zh="显存里的权重" en="weights in HBM" size={24} />
              {/* one full read per forward pass */}
              {ph >= 0 && <Arrow pts={[[MX + 310, MY + 160], [GX - 20, MY + 160]]} color="#9C8350" tone="ink" w={8} p={read ? flow : 1} a={read ? 1 : 0.25} />}
              <Label x={(MX + 310 + GX - 20) / 2} y={MY + 136} t="每次前向读一遍" anchor="middle" color="#7B6638" weight={600} />
            </g>
            {/* compute: rows = tokens processed in this pass */}
            <g opacity={ease(f, b[1] - 10, 16)}>
              <TermS x={GX} y={GY - 22} zh="算力" en="compute" size={24} />
              {Array.from({length: 4}, (_, r) =>
                Array.from({length: 8}, (_, c) => {
                  const lit = read && (batch ? true : r === 0);
                  return <rect key={`${r}-${c}`} x={GX + c * 50} y={GY + r * 50} width={42} height={42} rx={5} fill={lit ? C.drafter : '#E6E0D4'} opacity={lit ? 0.85 : 1} />;
                }),
              )}
              <Label x={GX} y={GY + 236} t={batch ? '同一次读取，4 行都在算' : '大部分格子闲着'} color={batch ? C.drafter : C.dim} weight={600} size={24} />
            </g>
          </Svg>
          <Quote x={1210} y={440} w={614} a={ease(f, b[2], 16)} q="inference is slow, memory-bound, and fails to fully utilize modern GPUs" src="DFlash 论文 §1" />
          <Quote x={1210} y={640} w={614} a={ease(f, b[3], 16)} q="reduce memory accesses and lower latency during memory-bound decoding by leveraging redundant computational power" src="EAGLE-3 论文 §1" />
          <Src t="格子与读取动画为示意" a={ease(f, b[1], 14)} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ loop: one round of draft → check
// Round 1: 今天 + drafts 天 气 很 热 → 3 kept, 热 wrong, the big model writes 好.
// Round 2 (all right): 今天天气很好 + drafts 适 合 出 门 → 4 kept + 1 bonus 散.
const R1 = ['天', '气', '很', '热'];
const R2 = ['适', '合', '出', '门'];

export const Loop: React.FC<{scene: Scene}> = () => (
  <Page tag="基础 · 一轮" title="一轮：先猜，后验" sub="草稿机先猜几个，目标模型一次前向全部核对">
    {({f, b}) => {
      const second = f >= b[5];
      let toks: Tok[];
      if (!second) {
        toks = done('今天');
        R1.forEach((t, i) => {
          const a = ease(f, b[0] + 12 + i * 10, 10);
          let s: Tok['s'] = 'draft';
          if (i < 3 && f >= b[2] + 6 + i * 9) s = 'ok';
          if (i === 3 && f >= b[3] + 4) s = 'bad';
          const tag = s === 'ok' ? '留下' : s === 'bad' ? '猜错 · 作废' : undefined;
          if (i === 3 && f >= b[4] + 10) return;
          toks.push({t, s, a, tag});
        });
        if (f >= b[4] + 10) toks.push({t: '好', s: 'model', a: ease(f, b[4] + 10, 12), tag: '目标模型补上'});
      } else {
        toks = done('今天天气很好');
        R2.forEach((t, i) => {
          const a = ease(f, b[5] + 4 + i * 6, 10);
          toks.push({t, s: f >= b[5] + 34 + i * 6 ? 'ok' : 'draft', a, tag: f >= b[5] + 34 + i * 6 ? '留下' : undefined});
        });
        if (f >= b[5] + 64) toks.push({t: '散', s: 'model', a: ease(f, b[5] + 64, 12), tag: '多送 1 个'});
      }
      const pD = ease(f, b[0] + 4, 20);
      const pA = ease(f, b[1], 24);
      const pass = f >= b[1] && f < b[2] + 40;
      const chips = second ? R2 : R1;
      const chipState = (i: number): Tok['s'] => {
        if (second) return f >= b[5] + 34 + i * 6 ? 'ok' : 'draft';
        if (i < 3 && f >= b[2] + 6 + i * 9) return 'ok';
        if (i === 3 && f >= b[3] + 4) return 'bad';
        return 'draft';
      };
      const CX = 520,
        CY = 680;
      return (
        <>
          <Sentence toks={toks} y={214} f={f} label="目标模型正在写的这句话" />
          <Svg>
            <Box x={110} y={580} w={290} h={200} fill={C.drafterBg} stroke={C.drafter} label="草稿机" sub="draft model · 小而快" a={pD} color={C.drafter} size={34} />
            <Arrow pts={[[404, CY], [CX - 40, CY]]} color={C.drafter} tone="drafter" p={pD} label={'先猜 4 个'} lx={408} ly={CY - 22} />
            {chips.map((t, i) => (
              <Chip key={t + i} x={CX + i * 66} y={CY} t={t} s={chipState(i)} a={ease(f, (second ? b[5] + 4 : b[0] + 12) + i * 10, 10)} size={38} />
            ))}
            {/* the whole run goes in at the bottom of the target model: one forward pass */}
            <Arrow pts={[[CX + 3 * 66 + 34, CY], [950, CY], [950, 849], [986, 849]]} color={C.target} tone="target" w={3} p={pA} />
            <TermS x={772} y={CY - 24} zh="核对" en="verify" c={C.target} size={22} a={pA} />
            <Stack x={990} y={490} w={270} h={380} n={8} color={C.target} bg={C.targetBg} a={ease(f, b[1] - 10, 16)} hi={pass ? [Math.floor((f - b[1]) / 4) % 8] : []} />
            <TermS x={1125} y={474} zh="目标模型" en="target model" c={C.target} anchor="middle" a={ease(f, b[1] - 10, 16)} />
            <TermS x={1125} y={910} zh="一次前向" en="one forward pass" c={C.target} size={22} anchor="middle" a={pA} />
            <Arrow pts={[[1264, 510], [1300, 510], [1300, 382]]} color={C.model} tone="model" p={ease(f, b[2], 16)} />
            {/* closed loop: what was committed is where the next round starts */}
            <Arrow pts={[[255, 384], [255, 574]]} color={C.drafter} tone="drafter" dash w={3} p={ease(f, b[5] - 30, 20)} />
            <Label x={272} y={486} t="落下的词 → 下一轮起点" color={C.drafter} weight={600} size={21} a={ease(f, b[5] - 30, 16)} />
          </Svg>
          <Card
            x={1360}
            y={500}
            w={464}
            a={ease(f, b[4] + 16, 14)}
            head={second ? '这一轮（全对）' : '这一轮'}
            rows={[
              {t: '目标模型前向：1 次', c: C.target},
              {t: second ? '落下 5 个' : '落下 4 个', sub: second ? '4 个草稿 + 1 个多送（bonus token）' : '3 个草稿 + 1 个补位', c: C.ok},
            ]}
          />
          <div
            style={{
              position: 'absolute',
              left: 1360,
              top: 736,
              width: 464,
              padding: '18px 26px',
              boxSizing: 'border-box',
              background: C.card,
              border: `2px solid ${C.target}`,
              borderRadius: 16,
              opacity: ease(f, b[6], 16),
            }}
          >
            <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
              <span style={{font: `700 34px ${NUM}`, color: C.target}}>τ</span>
              <span style={{font: `700 26px ${ZH}`}}>接受长度</span>
              <span style={{font: `italic 500 21px ${NUM}`, color: C.dim}}>acceptance length</span>
            </div>
            <div style={{font: `500 21px ${ZH}`, color: C.dim, marginTop: 6}}>每轮平均落下几个 token（含补的 1 个）</div>
            <div style={{font: `600 24px ${ZH}`, color: C.ink, marginTop: 8}}>这两轮：(4 + 5) ÷ 2 = 4.5 · 示意</div>
          </div>
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ lossless: the acceptance rule
const WORDS = ['好', '热', '晴', '冷', '闷'];
const P = [0.5, 0.2, 0.15, 0.1, 0.05]; // target (illustrative)
const Q = [0.3, 0.45, 0.1, 0.1, 0.05]; // draft (illustrative)

export const Lossless: React.FC<{scene: Scene}> = () => (
  <Page tag="基础" title="为什么一字不差" sub="接受规则：拒绝采样（rejection sampling），输出分布不变">
    {({f, b}) => {
      const rej = f >= b[2] + 30;
      const toks: Tok[] = [...done('今天天气很')];
      if (f >= b[1] - 30) toks.push(rej ? (f >= b[2] + 52 ? {t: '好', s: 'model', a: ease(f, b[2] + 52, 10), tag: '从归一化的 max(0, p−q) 重采样'} : {t: '热', s: 'bad', tag: '被拒'}) : {t: '热', s: 'draft', a: ease(f, b[1] - 30, 10), tag: '草稿'});
      const a = ease(f, b[1], 18);
      const ar = ease(f, b[2] + 30, 20);
      const BX = 170,
        BASE = 760,
        SC = 440;
      return (
        <>
          <Sentence toks={toks} y={214} f={f} label="这一位：草稿猜「热」" />
          <Svg>
            <g opacity={a}>
              <Label x={96} y={470} t="这一位的候选词 · 概率为示意" color={C.ink} weight={700} size={24} />
              <rect x={96} y={490} width={18} height={18} fill={C.target} />
              <TermS x={122} y={506} zh="p 目标模型" en="target" c={C.target} size={21} />
              <rect x={330} y={490} width={18} height={18} fill={C.draft} />
              <TermS x={356} y={506} zh="q 草稿" en="draft" c={C.draft} size={21} />
              {WORDS.map((w, i) => {
                const cx = BX + i * 170;
                const hp = P[i] * SC * a,
                  hq = Q[i] * SC * a;
                const r = Math.max(0, P[i] - Q[i]);
                return (
                  <g key={w}>
                    <rect x={cx - 44} y={BASE - hp} width={42} height={hp} fill={C.target} rx={3} />
                    <rect x={cx + 2} y={BASE - hq} width={42} height={hq} fill={C.draft} rx={3} />
                    <text x={cx} y={BASE + 40} textAnchor="middle" style={{font: `700 32px ${ZH}`, fill: i === 1 ? C.bad : C.ink}}>
                      {w}
                    </text>
                    {r > 0 && <rect x={cx - 44} y={BASE + 56} width={88 * (r / 0.2) * ar} height={16} rx={4} fill={C.model} />}
                  </g>
                );
              })}
              <line x1={110} y1={BASE} x2={960} y2={BASE} stroke={C.line} strokeWidth={2} />
              <Label x={110} y={BASE + 96} t="紫条 = max(0, p − q)，归一化后：被拒时从这里重新采样" color={C.model} weight={600} a={ar} />
            </g>
          </Svg>
          <Card x={1100} y={460} w={724} a={ease(f, b[2], 16)} rows={[{t: '留下的概率 = min(1, p ÷ q)', sub: '「热」：0.2 ÷ 0.45 ≈ 0.44 · 示意', c: C.ok}]} />
          <Card x={1100} y={610} w={724} a={ease(f, b[3], 16)} rows={[{t: '输出分布 = 目标模型自己一个个生成的分布', sub: 'Leviathan et al. 2023 · Chen et al. 2023', c: C.target}]} />
          <Card x={1100} y={760} w={724} a={ease(f, b[4], 16)} rows={[{t: '贪心解码（greedy, T = 0）', sub: '草稿和目标模型选的是同一个词，才留下', c: C.ink}]} />
          <Src t="接受规则：Leviathan et al. 2023 §2.3 · Chen et al. 2023 Algorithm 2 · 概率为示意" a={a} />
        </>
      );
    }}
  </Page>
);

// ------------------------------------------------------------------ knobs: L = (T_draft + T_verify) / τ
export const Knobs: React.FC<{scene: Scene}> = () => (
  <Page tag="基础" title="两个旋钮" sub="DFlash 论文 §3.1：每个 token 的平均耗时">
    {({f, b}) => {
      const a = ease(f, b[0], 16);
      const a1 = ease(f, b[1], 16);
      const k1 = ease(f, b[2], 30);
      const k2 = ease(f, b[3], 30);
      const tau = 2 + 3 * k1;
      const td = 1 - 0.7 * k2;
      return (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', opacity: a, font: `500 72px ${NUM}`}}>
            L = (<span style={{color: C.drafter}}>T_draft</span> + <span style={{color: C.target}}>T_verify</span>) ÷ <span style={{color: C.ok}}>τ</span>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', gap: 80, opacity: a1, font: `500 25px ${ZH}`, color: C.dim}}>
            <span>分子：一轮里猜 + 核对的时间</span>
            <span>分母 τ：平均每轮落下几个 token</span>
          </div>
          <Svg>
            {/* knob 1: guess better → longer accepted run */}
            <g opacity={ease(f, b[2], 14)}>
              <TermS x={200} y={490} zh="猜得准" en="higher τ" c={C.ok} size={34} />
              {Array.from({length: 6}, (_, i) => (
                <rect key={i} x={200 + i * 70} y={530} width={58} height={58} rx={8} fill={i < Math.round(tau) ? C.okBg : 'transparent'} stroke={i < Math.round(tau) ? C.ok : C.line} strokeWidth={2.5} />
              ))}
              <Label x={200} y={640} t={`每轮落下 ${tau.toFixed(1)} 个 · 示意`} color={C.ok} weight={600} />
            </g>
            {/* knob 2: guess cheaper → shorter draft time */}
            <g opacity={ease(f, b[3], 14)}>
              <TermS x={1060} y={490} zh="猜得便宜" en="lower T_draft" c={C.drafter} size={34} />
              <rect x={1060} y={530} width={520 * td} height={58} rx={8} fill={C.drafter} opacity={0.85} />
              <rect x={1060 + 520 * td + 6} y={530} width={180} height={58} rx={8} fill={C.target} opacity={0.85} />
              <Label x={1060} y={640} t="草稿时间" color={C.drafter} weight={600} />
              <Label x={1060 + 520 * td + 6} y={640} t="核对时间" color={C.target} weight={600} />
            </g>
          </Svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 730, display: 'flex', justifyContent: 'center', gap: 28}}>
            {['MTP', 'EAGLE-3', 'DFlash', 'DSpark', 'DFlash 2'].map((n, i) => (
              <div
                key={n}
                style={{
                  padding: '16px 30px',
                  background: C.drafterBg,
                  border: `2px solid ${C.drafter}`,
                  borderRadius: 14,
                  font: `700 32px ${NUM}`,
                  color: C.drafter,
                  opacity: fade(f, b[4] + i * 7, 10),
                }}
              >
                {n}
              </div>
            ))}
          </div>
          <Src t="DFlash 论文 §3.1 式 (1)" a={a} />
        </>
      );
    }}
  </Page>
);
