// 04 DSpark (2026-07): a DFlash backbone plus three add-ons — a Markov head (serial, light), a confidence head
// (per-slot pass probability) and a scheduler that picks each request's verify length from the engine's throughput.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {
  back,
  board,
  camAt,
  card,
  chapter,
  clamp,
  cubeBar,
  eio,
  eo,
  GREY,
  IsoScene,
  label,
  legend,
  lerp,
  PANEL_W,
  PANEL_X,
  pin,
  R,
  rr,
  seg,
  src,
  T3,
  T3d,
  text,
  token,
  tower,
  tri,
} from './world';
import {press} from './dflash';

const CH = (g: CanvasRenderingContext2D, f: number) => chapter(g, '04', 'DSpark', '2026.07 · DeepSeek / 北京大学 · arXiv 2607.05147', clamp(f / 10));
export const MK = '#C47A9A', // Markov head
  CF = '#D98C4A', // confidence head
  SC = '#9C8455'; // scheduler

// ------------------------------------------------------------------ the shared row: anchor + 6 drafts
const WORDS = ['Yes,', 'of', 'course', 'I', 'can', 'help', '.'];
const DR = {x0: -8, y: 2, step: 2, s: 1.5};
const dx = (i: number) => DR.x0 + i * DR.step;
const PRESS = {x0: DR.x0 - 0.5, x1: dx(6) + DR.s + 0.5, d: DR.s + 1.4, zLow: DR.s * 0.9 + 0.05, floors: 3};
/** state(i): 'mask' | 'scored' | 'draft' | 'ok' | 'grey' */
const dsRow = (iso: any, state: (i: number) => string, pop = 1) => {
  WORDS.forEach((w, i) => {
    const p = clamp(pop * WORDS.length - i);
    if (p <= 0) return;
    if (i === 0) return token(iso, dx(0), DR.y, 0, w, T3d.bonus, {pop: p, s: DR.s, text: '#FBF4E6', size: 0.3});
    const st = state(i);
    if (st === 'mask') token(iso, dx(i), DR.y, 0, '?', T3d.mask, {pop: p, s: DR.s, text: '#B9AE9C', size: 0.4});
    else if (st === 'scored') token(iso, dx(i), DR.y, 0, '', tri('#F0D9A6'), {pop: p, s: DR.s});
    else token(iso, dx(i), DR.y, 0, w, st === 'ok' ? T3d.ok : st === 'grey' ? GREY : T3d.draft, {pop: p, s: DR.s, size: 0.3});
  });
};

// ------------------------------------------------------------------ 1. the Markov head
export const DsparkMarkov: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-1.5, 2.8, 2.2, 600, 600, 34)}
    draw={({iso, f, b}) => {
      board(iso, -12, -3, 22, 12);
      const t = f - (b[3] ?? 1e9);
      const drop = t < 0 ? 0 : t < 12 ? eo(t / 12) : t < 22 ? 1 : 1 - eio((t - 22) / 16);
      press(iso, {...PRESS, drop, a: clamp(f / 16)});
      // the Markov head rides a rail in front of the row, left to right, once the block's scores exist
      const ra = clamp((f - b[2]) / 16);
      if (ra > 0) {
        iso.box(PRESS.x0, DR.y + DR.s + 0.5, 0, PRESS.x1 - PRESS.x0, 0.5, 0.2, tri('#B8B2A6'));
        const walk = clamp((t - 40) / (6 * 16));
        const cx = lerp(dx(1) - 0.2, dx(6) - 0.2, t < 40 ? 0 : walk);
        iso.box(cx, DR.y + DR.s + 0.35, 0.2, 1.9, 0.8, 0.9 * back(ra, 2), tri(MK));
      }
      const sampled = (i: number) => t >= 40 + (i - 1) * 16 + 8;
      dsRow(iso, (i) => (t < 12 ? 'mask' : sampled(i) ? 'draft' : 'scored'), f >= b[1] ? 1 : clamp(f / 20));
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, (PRESS.x0 + PRESS.x1) / 2, DR.y - 0.7, 4.4 + 3 * 0.61 + 0.6, {title: 'DFlash 主体', dir: -1, up: 50, len: 40, a: clamp((f - b[1]) / 30), ts: 24});
      pin(iso, dx(1) + 0.8, DR.y + DR.s + 0.75, 1.1, {title: 'Markov 头', dir: -1, up: -90, len: 40, a: clamp((f - b[2]) / 30), ts: 24});
      legend(
        g,
        230,
        [
          {c: MK, t: '① Markov 头：后一个看得到前一个', a: clamp((f - b[1] - 10) / 14)},
          {c: CF, t: '② 置信度头', a: clamp((f - b[1] - 20) / 14)},
          {c: SC, t: '③ 调度器', a: clamp((f - b[1] - 30) / 14)},
        ],
        {head: 'DFlash + 三样东西'},
      );
      const q = clamp((f - b[4]) / 16) * (1 - clamp((f - b[7]) / 12));
      if (q > 0) {
        card(g, PANEL_X, 470, PANEL_W, 130, q);
        text(g, 'p_k = softmax( U_k + B(x_k−1, ·) )', PANEL_X + 28, 520, {size: 24, weight: 600, a: q, halo: false, mono: true});
        text(g, 'U 并行分数 · B 低秩偏置（r = 256），只看前一个词', PANEL_X + 28, 566, {size: 20, weight: 500, color: R.dim, a: q, halo: false});
      }
      // the paper's example: of / no, course / problem
      const e = clamp((f - b[5]) / 16);
      if (e > 0) {
        const y0 = 626;
        card(g, PANEL_X, y0, PANEL_W, 200, e);
        const boost = eo(clamp((f - b[6]) / 24));
        const col = (x: number, pos: string, rows: [string, number, boolean][]) => {
          text(g, pos, x, y0 + 40, {size: 20, weight: 600, color: R.dim, a: e, halo: false});
          rows.forEach(([w, v, pick], j) => {
            const y = y0 + 62 + j * 44;
            text(g, w, x, y + 22, {size: 22, weight: 700, a: e, halo: false, color: pick ? R.ink : R.dim});
            g.save();
            g.globalAlpha = e;
            g.fillStyle = pick ? R.draft : '#D9CDB6';
            rr(g, x + 96, y + 4, 120 * v, 24, 4);
            g.fill();
            if (w === 'course' && boost > 0) {
              g.fillStyle = MK;
              rr(g, x + 96 + 120 * v, y + 4, 60 * boost, 24, 4);
              g.fill();
            }
            g.restore();
          });
        };
        col(PANEL_X + 28, '第 1 位', [
          ['of', 0.55, true],
          ['no', 0.5, false],
        ]);
        col(PANEL_X + 300, '第 2 位', [
          ['course', 0.5, boost > 0.5],
          ['problem', 0.55, boost <= 0.5],
        ]);
        const res = boost > 0.5 ? 'of course ✓' : 'of problem ✗';
        text(g, res, PANEL_X + 28, y0 + 180, {size: 24, weight: 700, a: e, halo: false, color: boost > 0.5 ? '#476F37' : R.bad});
        text(g, '§3.1 · 条长为示意', PANEL_X + PANEL_W - 28, y0 + 180, {size: 18, weight: 500, color: R.dim, a: e, halo: false, align: 'right'});
      }
      const q2 = clamp((f - b[7]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 470, PANEL_W, 130, q2);
        text(g, '串行一遍：只多 0.2%–1.3%', PANEL_X + 28, 520, {size: 28, weight: 700, a: q2, halo: false});
        text(g, '批量 128，草稿长度 4 → 16 时的整轮延迟', PANEL_X + 28, 566, {size: 20, weight: 500, color: R.dim, a: q2, halo: false});
      }
      src(g, 'DSpark 论文 §3.1、式 (4)(5)', clamp((f - b[2]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ 2. the confidence head
const C = [0.95, 0.9, 0.85, 0.75, 0.6, 0.5]; // illustrative
const A = C.map((_, j) => C.slice(0, j + 1).reduce((p, v) => p * v, 1));
const TUBE = 3.6;
export const DsparkConf: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-1.5, 2.8, 3, 600, 640, 34)}
    draw={({iso, f, b}) => {
      board(iso, -12, -3, 22, 12);
      dsRow(iso, () => 'draft');
      const m = eio(clamp((f - b[2]) / 40)); // morph c_k → prefix survival
      for (let j = 0; j < 6; j++) {
        const x = dx(j + 1) + 0.35,
          y = DR.y + 0.35,
          z = DR.s * 0.9;
        const p = clamp((f - 8 - j * 5) / 18);
        if (p <= 0) continue;
        const v = lerp(C[j], A[j], m) * eo(p);
        // glass tube, then the fill
        const a0 = iso.alpha;
        iso.alpha = 0.35;
        iso.box(x, y, z, 0.8, 0.8, TUBE, tri('#FBF4E6'), {bias: 0.3});
        iso.alpha = a0;
        iso.box(x + 0.1, y + 0.1, z, 0.6, 0.6, TUBE * v, m > 0.5 ? T3.ok : tri(CF));
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      const m = eio(clamp((f - b[2]) / 40));
      for (let j = 0; j < 6; j++) {
        const v = lerp(C[j], A[j], m);
        label(iso, v.toFixed(2), dx(j + 1) + 0.75, DR.y + 0.75, DR.s * 0.9 + TUBE * v, {size: 24, weight: 700, dy: -16, a: clamp((f - 20 - j * 5) / 12), color: m > 0.5 ? '#476F37' : '#9A5A26'});
      }
      legend(g, 230, [
        {c: CF, t: '② 置信度头：每一位估一个通过概率', sub: 'c_k = σ(wᵀ[h_k ; W1[x_k−1]])', a: clamp(f / 14)},
        {c: CF, t: '前面都对的前提下，这一位能过的概率', a: clamp((f - b[1]) / 14)},
        {c: R.ok, t: '一路乘下去 = 前缀存活概率', sub: 'a_j = c_1 × c_2 × … × c_j', a: clamp((f - b[2]) / 14)},
      ]);
      src(g, 'DSpark 论文 式 (7)、§3.2 · 柱高数值为示意', clamp(f / 14));
    }}
  />
);

// ------------------------------------------------------------------ 3. the scheduler
const REQ = [
  [0.95, 0.9, 0.82, 0.7, 0.55],
  [0.8, 0.6, 0.42, 0.28, 0.15],
  [0.9, 0.75, 0.5, 0.3, 0.12],
]; // illustrative survival per draft slot
const RC = ['#5B7FB0', '#8E6CC0', '#3E9C9A'];
const ALL = REQ.flatMap((r, ri) => r.map((v, j) => ({ri, j, v}))).sort((p, q) => q.v - p.v);
const SPS = (B: number) => 1 / (1 + 0.07 * B); // illustrative throughput curve
const THETA = ALL.map((_, n) => (3 + ALL.slice(0, n).reduce((s, c) => s + c.v, 0)) * SPS(3 + n)).concat([(3 + ALL.reduce((s, c) => s + c.v, 0)) * SPS(3 + ALL.length)]);
const STOP = THETA.findIndex((v, i) => i < ALL.length && THETA[i + 1] <= v); // admitted count at the stop
const QX = (k: number) => -11 + k * 1.35;
export const DsparkSched: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-2, 1, 1.5, 600, 600, 30)}
    draw={({iso, f, b}) => {
      board(iso, -14, -8, 26, 17);
      // scheduler box
      const sa = clamp(f / 18);
      if (sa > 0) iso.box(7, -6.5, 0, 3, 3, 2.2 * back(sa, 2), tri(SC));
      const fade = 1 - clamp((f - b[4]) / 20);
      if (fade <= 0) return;
      const a0 = iso.alpha;
      iso.alpha = fade;
      const sort = eio(clamp((f - b[1]) / 40));
      const admitted = f >= b[2] ? Math.min(STOP + 1, Math.floor((f - b[2]) / 8)) : 0;
      ALL.forEach((c, k) => {
        const x0 = -11 + c.j * 1.6,
          y0 = -6 + c.ri * 2.4;
        const x = lerp(x0, QX(k), sort),
          y = lerp(y0, 4, sort),
          z = Math.sin(sort * Math.PI) * 1.5;
        const stopped = f >= b[3] && k >= STOP;
        const t3 = stopped ? GREY : k < admitted ? tri(RC[c.ri]) : T3d.draft;
        token(iso, x, y, z, '', t3, {s: 1.1});
        // survival as a short column on the cube
        iso.box(x + 0.35, y + 0.35, z + 1.0, 0.4, 0.4, 1.8 * c.v, stopped ? GREY : T3.ok);
      });
      // request tags
      if (sort < 0.5) REQ.forEach((_, ri) => iso.box(-12.8, -6 + ri * 2.4, 0, 1.1, 1.1, 0.3, tri(RC[ri])));
      // the cut: a blue slab after the last admitted slot
      if (f >= b[3]) {
        const k = clamp((f - b[3]) / 14);
        iso.box(QX(STOP) - 0.25, 3.4, 0, 0.18, 2.4, 3 * back(k, 2), T3.target);
      }
      iso.alpha = a0;
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, 8.5, -5, 2.2, {title: '③ 调度器', dir: 1, up: 50, len: 40, a: clamp(f / 30), ts: 24, fade: 1 - clamp((f - b[4]) / 16)});
      const fade = 1 - clamp((f - b[4]) / 20);
      const sort = eio(clamp((f - b[1]) / 40));
      if (sort < 0.5) ['请求 A', '请求 B', '请求 C'].forEach((s, ri) => label(iso, s, -12.4, -6 + ri * 2.4 + 0.6, 0.3, {size: 22, weight: 700, a: clamp(f / 14) * fade * (1 - sort * 2), align: 'right', dy: 6}));
      legend(
        g,
        230,
        [
          {c: R.draft, t: '所有请求的草稿位，按存活概率排队', a: clamp((f - b[1]) / 14)},
          {c: R.target, t: '一个个放进核对门', sub: '总吞吐 Θ = τ × 每秒步数 SPS(B)', a: clamp((f - b[2]) / 14)},
          {c: GREY[1], t: 'Θ 不再上升 → 停', a: clamp((f - b[3]) / 14)},
        ],
        {a: clamp((f - b[1]) / 14) * fade},
      );
      // throughput chart
      const q = clamp((f - b[2]) / 16) * fade;
      if (q > 0) {
        const x0 = PANEL_X + 60,
          y0 = 820,
          w = 480,
          h = 180;
        card(g, PANEL_X, 560, PANEL_W, 320, q);
        text(g, '总吞吐 Θ（示意）', PANEL_X + 28, 604, {size: 24, weight: 700, a: q, halo: false});
        const n = f >= b[2] ? Math.min(STOP + 1, Math.floor((f - b[2]) / 8)) : 0;
        const mn = THETA[0],
          mx = Math.max(...THETA);
        const px = (i: number) => x0 + (i / ALL.length) * w,
          py = (v: number) => y0 - ((v - mn) / (mx - mn)) * h;
        g.save();
        g.globalAlpha = q;
        g.strokeStyle = R.ink;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, y0 - h - 12);
        g.lineTo(x0, y0);
        g.lineTo(x0 + w, y0);
        g.stroke();
        for (let i = 0; i <= n && i < THETA.length; i++) {
          g.fillStyle = i === STOP + 1 ? R.bad : R.target;
          g.beginPath();
          g.arc(px(i), py(THETA[i]), 7, 0, Math.PI * 2);
          g.fill();
        }
        g.restore();
        text(g, '放进去的草稿位 →', x0 + w, y0 + 30, {size: 18, weight: 500, color: R.dim, a: q, halo: false, align: 'right'});
        if (f >= b[3]) text(g, '停', px(STOP) - 6, py(THETA[STOP]) - 22, {size: 26, weight: 700, a: q * clamp((f - b[3]) / 12), halo: false, align: 'center'});
      }
      // light vs heavy load
      const q2 = clamp((f - b[4] - 10) / 16);
      if (q2 > 0) {
        card(g, 96, 230, 1100, 230, q2);
        text(g, '人少：每个请求多核几个', 124, 282, {size: 26, weight: 700, a: q2, halo: false});
        text(g, '人多：每个请求自动变短', 650, 282, {size: 26, weight: 700, a: q2, halo: false});
        const grid = (x: number, reqs: number, len: number) => {
          for (let r = 0; r < reqs; r++)
            for (let k = 0; k < len; k++) {
              g.save();
              g.globalAlpha = q2 * clamp(q2 * 3 - (r * len + k) / (reqs * len));
              g.fillStyle = RC[r % 3];
              rr(g, x + k * 34, 314 + r * 15, 28, 11, 3);
              g.fill();
              g.restore();
            }
        };
        grid(124, 2, 6);
        grid(650, 8, 2);
      }
      // V4 online: verify length vs load (shape only)
      const q3 = clamp((f - b[5]) / 16);
      if (q3 > 0) {
        card(g, 96, 490, 1100, 380, q3);
        text(g, 'DeepSeek V4-Flash 线上 · 每个请求核几个', 124, 540, {size: 26, weight: 700, a: q3, halo: false});
        const x0 = 200,
          y0 = 800,
          w = 900,
          u = 34; // px per token
        g.save();
        g.globalAlpha = q3;
        g.strokeStyle = R.ink;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, y0 - 7 * u);
        g.lineTo(x0, y0);
        g.lineTo(x0 + w, y0);
        g.stroke();
        // DSpark band 4–6 at low load, sliding down past ~200
        g.fillStyle = 'rgba(111,175,106,.35)';
        g.beginPath();
        g.moveTo(x0, y0 - 6 * u);
        g.lineTo(x0 + 0.3 * w, y0 - 6 * u);
        g.bezierCurveTo(x0 + 0.55 * w, y0 - 5.6 * u, x0 + 0.75 * w, y0 - 3.2 * u, x0 + w, y0 - 2.8 * u);
        g.lineTo(x0 + w, y0 - 2.2 * u);
        g.bezierCurveTo(x0 + 0.75 * w, y0 - 2.4 * u, x0 + 0.55 * w, y0 - 3.8 * u, x0 + 0.3 * w, y0 - 4 * u);
        g.lineTo(x0, y0 - 4 * u);
        g.closePath();
        g.fill();
        // MTP-1: a fixed 2
        g.strokeStyle = R.dim;
        g.setLineDash([10, 8]);
        g.beginPath();
        g.moveTo(x0, y0 - 2 * u);
        g.lineTo(x0 + w, y0 - 2 * u);
        g.stroke();
        g.setLineDash([]);
        g.restore();
        text(g, 'DSpark：约 4–6 个', x0 + 20, y0 - 6 * u - 16, {size: 22, weight: 700, color: '#476F37', a: q3, halo: false});
        text(g, 'MTP-1：固定 2 个', x0 + 20, y0 - 2 * u - 12, {size: 20, weight: 600, color: R.dim, a: q3, halo: false});
        text(g, '200', x0 + 0.3 * w, y0 + 28, {size: 18, weight: 600, color: R.dim, a: q3, halo: false, align: 'center'});
        text(g, '并发 →（Figure 8，形状示意）', x0 + w, y0 + 28, {size: 18, weight: 500, color: R.dim, a: q3, halo: false, align: 'right'});
      }
      src(g, 'DSpark 论文 Algorithm 1、§3.2.2、§5.4 · 排队与吞吐曲线为示意', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ 4. numbers
export const DsparkNum: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-3, 0, 2.5, 600, 620, 30)}
    draw={({iso, f, b}) => {
      board(iso, -14, -8, 24, 16);
      tower(iso, -12, -6, 0, 5, 5, 7, T3.target);
      const top = 7 * 1.08;
      // MTP-1 lifts off, the DSpark module slides in
      const out = eio(clamp((f - 20) / 30));
      if (out < 1) {
        const a0 = iso.alpha;
        iso.alpha = 1 - out;
        iso.box(-11, -5, top + out * 3, 3, 3, 0.9, f > 20 ? GREY : T3.drafter);
        iso.alpha = a0;
      }
      const inn = eo(clamp((f - 44) / 24));
      if (inn > 0) {
        iso.box(lerp(-4, -6.4, inn), -5.6, 0, 4, 4, 0.6, T3.drafter);
        iso.box(lerp(-4, -6.4, inn), -5.6, 0.7, 4, 4, 0.6, T3.drafter);
        iso.box(lerp(-4, -6.4, inn), -5.6, 1.4, 4, 4, 0.6, T3.drafter);
        iso.box(lerp(-4, -6.4, inn) + 0.6, -1.4, 0, 2.8, 0.6, 0.8, tri(MK));
      }
      // single-user speed at equal throughput: MTP-1 = 1, DSpark 1.60–1.85
      const sb = clamp((f - b[1]) / 30);
      if (sb > 0) {
        cubeBar(iso, 4.5, -6.6, 2, GREY, sb, {s: 1.4, h: 1});
        cubeBar(iso, 4.5, -1.8, 3.2, T3.drafter, sb, {s: 1.4, h: 1});
        const r = clamp((f - b[1] - 30) / 20);
        if (r > 0) {
          const a0 = iso.alpha;
          iso.alpha = 0.45;
          iso.box(4.5, -1.8, 3.2, 1.4, 1.4, 0.5 * r, T3.drafter);
          iso.alpha = a0;
        }
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, -9.5, -3.5, top41(f, b), {title: f >= b[3] ? 'DeepSeek V4.1' : 'DeepSeek V4', dir: -1, up: 50, len: 40, a: clamp(f / 20), ts: 24});
      if (f > 20 && f < 60) label(iso, 'MTP-1', -9.5, -3.5, 7 * 1.08 + 1.4 + eio(clamp((f - 20) / 30)) * 3, {size: 24, weight: 700, a: 1 - clamp((f - 30) / 24), color: R.dim, dy: -10});
      pin(iso, -4.4, -1.6, 2, {title: 'DSpark', dir: -1, up: -70, len: 40, a: clamp((f - 60) / 24), ts: 24});
      if (f >= b[1]) {
        label(iso, '1', 5.2, -5.9, 2, {size: 32, weight: 400, dy: -18, a: clamp((f - b[1] - 20) / 12), color: R.dim});
        label(iso, 'MTP-1', 5.2, -5.9, 0, {size: 20, weight: 700, dy: 40, a: clamp((f - b[1]) / 12), color: R.dim});
        label(iso, '+60%～85%', 5.2, -1.1, 3.7, {size: 30, weight: 600, dy: -18, a: clamp((f - b[1] - 40) / 12)});
        label(iso, 'DSpark', 5.2, -1.1, 0, {size: 20, weight: 700, dy: 40, a: clamp((f - b[1]) / 12)});
      }
      legend(
        g,
        230,
        [
          {t: '线上替换 MTP-1', sub: 'MTP-1 固定只多猜 1 个', a: clamp(f / 14)},
          {t: '同样总吞吐下，单用户速度', sub: 'V4-Flash +60%～85%（V4-Pro +57%～78%）', a: clamp((f - b[1]) / 14)},
          {t: '离线 Qwen3-4B · τ 宏平均', sub: '比 EAGLE-3 高 30.9%，比 DFlash 高 16.3%', a: clamp((f - b[2]) / 14)},
          {t: 'V4.1：预训练不再带 MTP', sub: '改用 DSpark，块大小 5（config.json）', a: clamp((f - b[3]) / 14)},
        ],
        {head: '数字'},
      );
      src(g, f >= b[3] ? 'DeepSeek-V4.1 技术报告 §2.1、§2.4.3' : f >= b[2] ? 'DSpark 论文 Table 1（T = 1，关闭调度器）' : 'DSpark 论文 §5.4、Figure 7', clamp(f / 14));
    }}
  />
);
const top41 = (_f: number, _b: number[]) => 7 * 1.08 + 0.4;
