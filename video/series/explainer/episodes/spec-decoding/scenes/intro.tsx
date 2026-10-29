// Opening and the basics: why drafting helps, one round, why it is lossless, the two knobs.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {
  back,
  belt,
  bigTower,
  board,
  CAM_WIDE,
  camAt,
  legend,
  PANEL_W,
  PANEL_X,
  card,
  chapter,
  clamp,
  cubeBar,
  drafterBox,
  eio,
  eo,
  FONT,
  gate,
  GREY,
  haloText,
  IsoScene,
  L,
  label,
  lerp,
  pin,
  R,
  round,
  seg,
  src,
  stack,
  T3,
  T3d,
  text,
  title,
  token,
  tower,
  tri,
} from './world';

// ------------------------------------------------------------------ hook: one token at a time vs a row at a time
const SENT = '今天天气很好适合出门散步'.split('');
const ROUNDS = [
  {chars: ['今', '天', '天', '汽'], ok: 3, fix: '气'},
  {chars: ['很', '好', '合', '适'], ok: 2, fix: '适'},
  {chars: ['合', '出', '门', '散'], ok: 4, fix: '步'},
];
const RLEN = 54; // frames per round on the right board

/** Left board: the big model alone stamps one token per forward pass. */
const arBoard = (iso: any, t: number, per: number) => {
  board(iso, -12, -8, 24, 15);
  belt(iso, -6, 11, t);
  tower(iso, -9, -6, 0, 5, 5, 9, T3.target);
  const n = Math.min(SENT.length, Math.floor(Math.max(0, t) / per) + (t >= 0 ? 1 : 0));
  // the newest token drops from the tower onto the belt, older ones ride right
  for (let i = 0; i < n; i++) {
    const age = t - i * per;
    const pos = Math.min(SENT.length - 1, n - 1 - i);
    const x = 9.2 - pos * 1.25;
    token(iso, x - 13 * (1 - eo(clamp(age / 10))) * 0, L.beltY + 0.3, L.beltZ, '', T3.ok, {pop: clamp(age / 10), s: 1.05});
  }
};
/** Right board: the full factory, three rounds. */
const specBoard = (iso: any, t: number) => {
  board(iso);
  belt(iso, -12, 15, t);
  bigTower(iso);
  gate(iso, 0);
  drafterBox(iso, t);
  let done = 0;
  ROUNDS.forEach((r, k) => {
    const tk = t - k * RLEN;
    if (tk < 0) return;
    if (tk < RLEN + 8) round(iso, tk, {...r, mode: 'par', travel: 26, go: 12, missAt: 30, fixAt: 34});
    done += 0;
  });
};
const produced = (t: number, per: number) => Math.min(SENT.length, t < 0 ? 0 : Math.floor(t / per) + 1);
const producedSpec = (t: number) => {
  let n = 0;
  ROUNDS.forEach((r, k) => {
    const tk = t - k * RLEN;
    if (tk >= 40) n += r.ok + 1;
  });
  return Math.min(SENT.length, n);
};

export const Hook: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={{x: 0, y: 0, z: 4.6, k: 24}}
    draw={({iso, f, b}) => {
      const t = f - 6;
      iso.push(-15, 15, 0, 0, 0.62);
      arBoard(iso, t, 22);
      iso.pop();
      iso.push(15, -15, 0, 0, 0.62);
      specBoard(iso, t);
      iso.pop();
    }}
    over={({iso, g, f, b}) => {
      const t = f - 6;
      // the sentence being produced, above each board
      const nL = produced(t, 22),
        nR = producedSpec(t);
      const tl0 = clamp((f - b[4]) / 14);
      const row = (n: number, x: number, y: number, fwd: number, tag: string, sub: string) => {
        const ra = 1 - tl0;
        if (ra <= 0) return;
        g.save();
        g.globalAlpha = ra;
        text(g, tag, x, y - 64, {size: 30, weight: 700, a: ra});
        text(g, sub, x, y - 28, {size: 22, weight: 500, color: R.dim, a: ra});
        for (let i = 0; i < SENT.length; i++) {
          const on = i < n;
          g.save();
          g.font = `700 40px ${FONT}`;
          g.fillStyle = on ? R.ink : 'rgba(46,37,34,.13)';
          g.fillText(SENT[i], x + i * 44, y + 30);
          g.restore();
        }
        text(g, `大模型前向 ${fwd} 次`, x, y + 84, {size: 26, weight: 600, color: R.target, a: ra});
        g.restore();
      };
      const fwdR = Math.min(3, ROUNDS.filter((_, k) => t - k * RLEN >= 22).length);
      row(nL, 150, 230, nL, '逐个生成', '一次前向，一个 token');
      row(nR, 1250, 230, fwdR, '投机解码', '草稿先猜，一次核对一排');
      src(g, '示意 · 两边输出相同，前向次数不同', clamp((f - b[2]) / 12));
      // the name, then the five methods on a timeline
      const tl = clamp((f - b[4]) / 14);
      if (tl > 0) {
        const items = [
          ['MTP', '2024.04'],
          ['EAGLE-3', '2025.03'],
          ['DFlash', '2026.02'],
          ['DSpark', '2026.07'],
          ['DFlash 2', '2026.08'],
        ];
        const y = 220,
          x0 = 160,
          x1 = 1760;
        g.save();
        g.globalAlpha = tl;
        g.strokeStyle = R.ink;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x0, y);
        g.lineTo(lerp(x0, x1, eo(tl)), y);
        g.stroke();
        g.restore();
        items.forEach(([n, d], i) => {
          const a = clamp((f - b[5] - i * 9) / 10);
          if (a <= 0) return;
          const x = lerp(x0 + 120, x1 - 120, i / 4);
          g.save();
          g.globalAlpha = a;
          g.fillStyle = R.paper;
          g.strokeStyle = R.ink;
          g.lineWidth = 2.5;
          g.beginPath();
          g.arc(x, y, 9 * back(a, 2), 0, Math.PI * 2);
          g.fill();
          g.stroke();
          g.restore();
          text(g, n, x, y - 26, {size: 34, weight: 700, align: 'center', a});
          text(g, d, x, y + 44, {size: 22, weight: 500, align: 'center', color: R.dim, a});
        });
      }
      // the part they all swap: the draft machine
      if (f >= b[6]) {
        iso.push(15, -15, 0, 0, 0.62);
        const [sx, sy] = iso.L(-11.9, 3.1, 2);
        iso.pop();
        const a = clamp((f - b[6]) / 14);
        g.save();
        g.strokeStyle = R.ink;
        g.lineWidth = 3;
        g.setLineDash([16, 10]);
        g.lineDashOffset = -f * 0.8;
        g.beginPath();
        g.arc(sx, sy, 92 * eo(a), 0, Math.PI * 2);
        g.stroke();
        g.restore();
        text(g, '草稿机', sx + 70, sy - 96, {size: 32, weight: 700, a});
      }
    }}
  />
);

// ------------------------------------------------------------------ why: decoding is memory-bound
const CAM_L = camAt(0, -1, 2, 620, 560, 25);
export const Why: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={CAM_L}
    draw={({iso, f, b}) => {
      board(iso);
      belt(iso, -12, 15, f);
      bigTower(iso);
      // memory stack (weights) and the compute grid
      for (let i = 0; i < 5; i++) iso.box(-12.5, -7.5, i * 0.7, 4.5, 4.5, 0.6, tri(i % 2 ? '#C9B98F' : '#D8C9A0'));
      const batch = f >= b[4] ? 4 : 1;
      const per = 26;
      const t = f - b[1];
      const pulse = t >= 0 ? (t % per) / per : -1;
      if (pulse >= 0) {
        const x = lerp(-8, -1, eio(clamp(pulse * 1.6)));
        iso.box(x, -6, 3.2, 0.8, 0.8, 0.8, tri('#C9B98F'));
      }
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 6; c++) {
          const lit = pulse >= 0 && pulse < 0.55 && r < batch;
          iso.box(6 + c * 0.9, -7 + r * 0.9, 0, 0.7, 0.7, lit ? 0.9 : 0.35, lit ? T3.drafter : GREY);
        }
      if (f < b[4]) {
        const n = t < 0 ? 0 : Math.min(6, Math.floor(t / per) + 1);
        for (let i = 0; i < n; i++) token(iso, 12 - (n - 1 - i) * 1.9, L.beltY + 0.3, L.beltZ, '', T3.ok, {pop: clamp((t - i * per) / 9), s: 1.5});
      } else {
        gate(iso, 0);
        round(iso, f - b[4], {chars: ['', '', '', ''], ok: 4, fix: '', mode: 'par', travel: 34});
      }
    }}
    over={({iso, g, f, b}) => {
      title(g, '为什么能快', 96, 140, {size: 58, a: clamp(f / 10)});
      pin(iso, -10.2, -5.2, 3.6, {title: '显存 · 权重', dir: -1, up: 90, len: 40, a: clamp((f - b[1]) / 30), ts: 24});
      pin(iso, 8.2, -5.5, 0.9, {title: '算力', dir: 1, up: 150, len: 40, a: clamp((f - b[1] - 10) / 30), ts: 24});
      const q = clamp((f - b[2]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 230, PANEL_W, 160, q);
        text(g, '“inference is slow, memory-bound,', PANEL_X + 28, 284, {size: 24, weight: 500, a: q, halo: false});
        text(g, 'and fails to fully utilize modern GPUs.”', PANEL_X + 28, 320, {size: 24, weight: 500, a: q, halo: false});
        text(g, 'DFlash 论文 §1', PANEL_X + 28, 362, {size: 20, weight: 500, color: R.dim, a: q, halo: false});
      }
      const q2 = clamp((f - b[3]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 420, PANEL_W, 196, q2);
        text(g, '“reduce memory accesses and lower', PANEL_X + 28, 474, {size: 24, weight: 500, a: q2, halo: false});
        text(g, 'latency during memory-bound decoding by', PANEL_X + 28, 510, {size: 24, weight: 500, a: q2, halo: false});
        text(g, 'leveraging redundant computational power”', PANEL_X + 28, 546, {size: 24, weight: 500, a: q2, halo: false});
        text(g, 'EAGLE-3 论文 §1', PANEL_X + 28, 588, {size: 20, weight: 500, color: R.dim, a: q2, halo: false});
      }
      const q3 = clamp((f - b[4]) / 16);
      if (q3 > 0)
        legend(g, 646, [
          {c: R.drafter, t: '一次前向：读一遍权重', a: q3},
          {c: R.ok, t: '逐个生成：1 次前向 → 1 个 token', a: q3},
          {c: R.ok, t: '投机解码：1 次前向 → 核对一整排', a: clamp((f - b[4] - 20) / 14)},
        ]);
      if (f >= b[4]) src(g, '示意', clamp((f - b[4]) / 12));
    }}
  />
);

// ------------------------------------------------------------------ loop: one round
export const Loop: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={CAM_L}
    draw={({iso, f, b}) => {
      board(iso);
      belt(iso, -12, 15, f);
      bigTower(iso);
      const scan = f >= b[1] && f < b[2] + 20 ? 0.5 + 0.5 * Math.sin(f * 0.4) : 0;
      gate(iso, scan);
      drafterBox(iso, f);
      const r1 = {chars: ['天', '气', '很', '热'], ok: 3, fix: '好', emerge: 8, go: b[1] - b[0], missAt: b[3] - b[0], fixAt: b[4] - b[0]};
      if (f < b[5]) round(iso, f - b[0], r1);
      else round(iso, f - b[5], {chars: ['出', '门', '走', '走'], ok: 4, fix: '吧', mode: 'par', travel: 40});
      const n1 = f >= b[4] + 10 ? 4 : 0;
      const n2 = clamp((f - b[5] - 70) / 20) * 5;
      stack(iso, n1 + (n1 ? n2 : 0), 13.2, -2.4, 3, (i) => (i === 3 || i === 8 ? T3.bonus : T3.ok));
    }}
    over={({iso, g, f, b}) => {
      title(g, '一轮：先猜，后验', 96, 140, {size: 58, a: clamp(f / 10)});
      pin(iso, -12, 3, 4.2, {title: '草稿机：先猜几个', dir: 1, up: 120, len: 40, a: clamp((f - b[0] - 10) / 30), ts: 24});
      pin(iso, 1.6, 4.4, 0.4, {title: '核对门：大模型一次前向', dir: -1, up: -150, len: 40, a: clamp((f - b[1]) / 30), ts: 24});
      legend(g, 230, [
        {c: R.draft, t: '草稿：等待核对', a: clamp((f - b[0] - 20) / 14)},
        {c: R.ok, t: '猜对的：留下', a: clamp((f - b[2]) / 14)},
        {c: R.bad, t: '第一个猜错的：和后面的一起作废', a: clamp((f - b[3]) / 14)},
        {c: R.bonus, t: '大模型补上自己的 token', a: clamp((f - b[4]) / 14)},
        {c: R.bonus, t: '全对：再多送一个', a: clamp((f - b[5]) / 14)},
      ]);
      const q = clamp((f - b[6]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 560, PANEL_W, 200, q);
        text(g, 'τ  接受长度', PANEL_X + 28, 618, {size: 34, weight: 700, a: q, halo: false});
        text(g, '每轮平均落下几个 token（含大模型补的 1 个）', PANEL_X + 28, 664, {size: 23, weight: 500, a: q, halo: false});
        text(g, '这两轮：(4 + 5) ÷ 2 = 4.5 · 示意', PANEL_X + 28, 718, {size: 26, weight: 600, color: R.target, a: q, halo: false});
      }
    }}
  />
);

// ------------------------------------------------------------------ lossless: the acceptance rule
const WORDS = ['好', '热', '晴', '冷', '闷'];
const P = [0.5, 0.2, 0.15, 0.1, 0.05]; // big model (illustrative)
const Q = [0.3, 0.45, 0.1, 0.1, 0.05]; // draft (illustrative)
/** p / q bars for five candidate words inside a legend card, plus the residual max(0, p − q). */
const probChart = (g: CanvasRenderingContext2D, x: number, y: number, a: number, ar: number, hi: number) => {
  card(g, x, y, PANEL_W, 420, a);
  if (a <= 0) return;
  text(g, '这一位的候选词（示意）', x + 28, y + 50, {size: 26, weight: 700, a, halo: false});
  const base = y + 300,
    sc = 380;
  WORDS.forEach((w, i) => {
    const cx = x + 70 + i * 104;
    const hp = P[i] * sc * eo(a),
      hq = Q[i] * sc * eo(a);
    g.save();
    g.globalAlpha = a;
    g.fillStyle = R.target;
    g.fillRect(cx - 34, base - hp, 30, hp);
    g.fillStyle = R.draft;
    g.fillRect(cx + 2, base - hq, 30, hq);
    const r = Math.max(0, P[i] - Q[i]) * sc * eo(ar);
    if (r > 0) {
      g.fillStyle = R.bonus;
      g.fillRect(cx - 34, base + 74 - r * 0.0, 66, 0);
    }
    g.restore();
    text(g, w, cx, base + 38, {size: 30, weight: 700, align: 'center', a, halo: false, color: i === hi ? R.bad : R.ink});
  });
  text(g, '■ p 大模型', x + 28, y + 88, {size: 22, weight: 600, color: R.target, a, halo: false});
  text(g, '■ q 草稿', x + 190, y + 88, {size: 22, weight: 600, color: '#B0832A', a, halo: false});
  if (ar > 0) {
    // residual strip under the axis
    WORDS.forEach((w, i) => {
      const cx = x + 70 + i * 104;
      const r = Math.max(0, P[i] - Q[i]);
      g.save();
      g.globalAlpha = ar;
      g.fillStyle = r > 0 ? R.bonus : 'rgba(46,37,34,.12)';
      g.fillRect(cx - 34, base + 58, 66 * (r > 0 ? r / 0.2 : 1) * eo(ar), r > 0 ? 18 : 4);
      g.restore();
    });
    text(g, 'max(0, p − q)：被拒后从这里重新采样', x + 28, base + 106, {size: 22, weight: 600, color: R.bonus, a: ar, halo: false});
  }
};
export const Lossless: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(2.2, 3, 1, 600, 680, 34)}
    draw={({iso, f, b}) => {
      board(iso);
      belt(iso, -12, 15, f);
      bigTower(iso);
      gate(iso, f >= b[1] && f < b[3] ? 0.5 + 0.5 * Math.sin(f * 0.4) : 0);
      // the draft "热" sits under the scanner; at b[2] it is rejected and the corrected token lands
      const rej = clamp((f - b[2] - 30) / 16);
      token(iso, L.gateX + 0.4, L.beltY + 0.3 + eo(rej) * 3.4, L.beltZ * (1 - rej), '热', rej > 0 ? T3d.bad : T3d.draft);
      token(iso, L.gateX - 2.4, L.beltY + 0.3, L.beltZ, '很', T3d.ok);
      const fp = clamp((f - b[2] - 46) / 16);
      if (fp > 0) token(iso, L.gateX + 0.4, L.beltY + 0.3, L.beltZ, '好', T3d.bonus, {pop: fp, text: '#FBF4E6'});
    }}
    over={({g, f, b}) => {
      title(g, '为什么一字不差', 96, 140, {size: 58, a: clamp(f / 10)});
      probChart(g, PANEL_X, 200, clamp((f - b[1]) / 18), clamp((f - b[2] - 30) / 20), 1);
      const a2 = clamp((f - b[2]) / 16);
      if (a2 > 0) {
        card(g, PANEL_X, 650, PANEL_W, 120, a2);
        text(g, '留下的概率 = min(1, p ÷ q)', PANEL_X + 28, 700, {size: 28, weight: 700, a: a2, halo: false});
        text(g, '「热」：0.2 ÷ 0.45 ≈ 0.44 · 示意', PANEL_X + 28, 742, {size: 23, weight: 500, color: R.dim, a: a2, halo: false});
      }
      const a3 = clamp((f - b[3]) / 16);
      if (a3 > 0) {
        card(g, PANEL_X, 790, PANEL_W, 136, a3);
        text(g, '输出分布 = 大模型自己生成的分布', PANEL_X + 28, 840, {size: 28, weight: 700, a: a3, halo: false});
      }
      const a4 = clamp((f - b[4]) / 16);
      if (a4 > 0) {
        text(g, '贪心（T = 0）：两边选同一个词才留下', PANEL_X + 28, 892, {size: 24, weight: 600, a: a4, halo: false});
      }
      src(g, '接受规则：EAGLE-3 论文 §2.1（speculative sampling）· 概率为示意', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ knobs: L = (T_draft + T_verify) / τ
/** Five drafter boxes in a screen-horizontal row (x − y = KD(i), x + y = 4.5). */
const KD = (i: number) => -12 + i * 5.4;
export const Knobs: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(0, 0, 0, 720, 690, 36)}
    draw={({iso, f, b}) => {
      board(iso, -12, -6, 24, 12);
      const dial = (x: number, y: number, v: number, c: string) => {
        iso.cyl(x, y, 0, 2.2, 0.8, tri('#E9DCC3'), {n: 36});
        iso.cyl(x, y, 0.8, 1.6, 0.5, tri(c), {n: 36});
        const a = -Math.PI * 0.75 + v * Math.PI * 1.5;
        iso.line3([[x, y, 1.32], [x + Math.cos(a) * 1.4, y + Math.sin(a) * 1.4, 1.32]], R.ink, 6, {layer: 2});
      };
      const v1 = 0.2 + 0.6 * eo(clamp((f - b[2]) / 30));
      const v2 = 0.8 - 0.6 * eo(clamp((f - b[3]) / 30));
      dial(-6, -1, v1, R.ok);
      dial(1, -6, v2, R.drafter);
      const a = clamp((f - b[4]) / 20);
      if (a > 0)
        for (let i = 0; i < 5; i++) {
          const p = clamp(a * 5 - i);
          if (p > 0) iso.box((4.5 + KD(i)) / 2 - 1.1, (4.5 - KD(i)) / 2 - 1.1, 0, 2.2, 2.2, 1.6 * back(p, 2), T3.drafter);
        }
    }}
    over={({iso, g, f, b}) => {
      title(g, '两个旋钮', 96, 140, {size: 58, a: clamp(f / 10)});
      const a = clamp((f - b[0]) / 16);
      card(g, PANEL_X - 40, 210, PANEL_W + 40, 330, a);
      if (a > 0) {
        g.save();
        g.globalAlpha = a;
        g.font = `500 44px ${FONT}`;
        g.fillStyle = R.ink;
        g.fillText('L = (T_draft + T_verify) ÷ τ', PANEL_X - 12, 290);
        g.restore();
        text(g, 'DFlash 论文 §3.1 · 每个 token 的平均耗时', PANEL_X - 12, 330, {size: 20, weight: 500, color: R.dim, a, halo: false});
      }
      const a1 = clamp((f - b[1]) / 16);
      text(g, '分子：一轮里猜 + 核对的时间', PANEL_X - 12, 400, {size: 26, weight: 600, a: a1, halo: false});
      text(g, '分母 τ：这一轮落下几个 token', PANEL_X - 12, 446, {size: 26, weight: 600, a: a1, halo: false});
      label(iso, '猜得准 · τ ↑', -6, -1, 1.4, {size: 30, weight: 700, dy: -70, a: clamp((f - b[2]) / 14), color: '#476F37'});
      label(iso, '猜得便宜 · T_draft ↓', 1, -6, 1.4, {size: 30, weight: 700, dy: -70, a: clamp((f - b[3]) / 14), color: '#2D6F6D'});
      if (f >= b[4]) ['MTP', 'EAGLE-3', 'DFlash', 'DSpark', 'DFlash 2'].forEach((n, i) => label(iso, n, (4.5 + KD(i)) / 2, (4.5 - KD(i)) / 2, 0, {size: 24, weight: 700, dy: 54, a: clamp((f - b[4]) / 10 - i * 0.25)}));
    }}
  />
);
