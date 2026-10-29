// 02 EAGLE-3 (2025-03): a one-layer plug-in drafter fed by low / mid / high features, training-time test, draft trees.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {
  back,
  bigTower,
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
  pipe,
  R,
  rr,
  src,
  T3,
  T3d,
  text,
  token,
  tri,
} from './world';

const CH = (g: CanvasRenderingContext2D, f: number) => chapter(g, '02', 'EAGLE-3', '2025.03 · 北京大学 / 微软研究院 / 滑铁卢大学 / Vector 研究所', clamp(f / 10));
const LOW = 1,
  MID = 4,
  HIGH = 7;
const FEAT = {[LOW]: T3.drafter, [MID]: T3.drafter, [HIGH]: T3.drafter};

/** The one-layer EAGLE drafter: a fusion box (3k → k) on top of a single flat floor. */
const eagleDrafter = (iso: any, x: number, y: number, p = 1, fuse = true) => {
  if (p <= 0) return;
  const s = back(p, 2);
  iso.box(x, y, 0, 4.4, 4.4, 1.1 * s, T3.drafter); // the single decoder layer
  if (fuse) iso.box(x + 0.9, y + 0.9, 1.1 * s, 2.6, 2.6, 0.7 * s, tri('#57B3B0')); // FC: 3k → k
};

// ------------------------------------------------------------------ intro: plug-in drafter, lineage
const TREE = [
  [0],
  [-1.3, 1.3],
  [-2.2, 0, 2.2],
  [-1.3, 1.3],
];
export const EagleIntro: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-2, 0, 2.5, 620, 580, 28)}
    draw={({iso, f, b}) => {
      board(iso);
      const tops = bigTower(iso, f >= b[3] && f < b[4] ? {[HIGH]: T3.drafter} : {});
      // the drafter is plugged in from outside
      const slide = eo(clamp((f - b[2]) / 24));
      eagleDrafter(iso, lerp(-22, -12, slide), 1, f >= b[2] ? 1 : 0, false);
      // EAGLE: one pipe from the second-to-top floor
      if (f >= b[3]) pipe(iso, tops[HIGH], 1, [-9.8, 3.2, 1.1], clamp((f - b[3]) / 24), {f});
      // EAGLE-2: a draft tree that grows by confidence
      const tg = clamp((f - b[4]) / 30);
      if (tg > 0)
        TREE.forEach((lvl, d) =>
          lvl.forEach((yy, j) => {
            const p = clamp(tg * 4 - d);
            if (p <= 0) return;
            const x = -7 + d * 2.6,
              y = 5.6 + yy;
            if (d > 0) {
              const prev = TREE[d - 1];
              const py = prev.reduce((best, v) => (Math.abs(v - yy) < Math.abs(best - yy) ? v : best), prev[0]);
              iso.line3([[x - 2.6 + 0.6, 5.6 + py + 0.6, 0.5], [x + 0.6, y + 0.6, 0.5]], R.ink, 2, {layer: 2, a: p});
            }
            token(iso, x, y, 0, '', T3d.draft, {pop: p, s: 1.2});
          }),
        );
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, -10, 3, 1.4, {title: '外挂草稿机', dir: -1, up: 140, len: 40, a: clamp((f - b[2] - 10) / 30), ts: 26});
      legend(
        g,
        230,
        [
          {c: R.drafter, t: 'EAGLE · 2024.01', sub: '在特征层上做自回归（倒数第二层特征）', a: clamp((f - b[3]) / 14)},
          {c: R.draft, t: 'EAGLE-2 · 2024.06', sub: '按草稿置信度，动态长出草稿树', a: clamp((f - b[4]) / 14)},
          {c: R.ok, t: 'EAGLE-3 · 2025.03', sub: 'NeurIPS 2025', a: clamp((f - b[0]) / 14)},
        ],
        {head: '一条线下来'},
      );
      src(g, 'arXiv 2401.15077 / 2406.16858 / 2503.01840', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ architecture: three floors in, step 1 / step 2
const PREFIX = ['How', 'can', 'I'];
export const EagleArch: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-3, 0, 2.5, 620, 580, 28)}
    draw={({iso, f, b}) => {
      board(iso);
      const hi = f >= b[1] ? FEAT : {};
      const tops = bigTower(iso, hi);
      eagleDrafter(iso, -12, 1, 1, f >= b[2]);
      if (f >= b[1]) [LOW, MID, HIGH].forEach((fl, k) => pipe(iso, tops[fl], k, [-10.6 + k * 0.6, 2.4 + k * 0.6, 1.8], clamp((f - b[1] - k * 6) / 24), {f}));
      // prefix on the board, then step 1 / step 2 drafts beside the drafter
      PREFIX.forEach((w, i) => token(iso, -12 + i * 2, 8.4, 0, w, T3d.ok, {s: 1.6, size: 0.34}));
      const s1 = clamp((f - b[3] - 20) / 14),
        s2 = clamp((f - b[5] - 10) / 14);
      if (s1 > 0) token(iso, -6, 8.4, 0, 'do', T3d.draft, {pop: s1, s: 1.6, size: 0.34});
      if (s2 > 0) token(iso, -4, 8.4, 0, 'it', T3d.draft, {pop: s2, s: 1.6, size: 0.34});
      // step 2+: the drafter's own output loops back to its input
      if (f >= b[4]) {
        const a = clamp((f - b[4]) / 20);
        iso.line3([[-7.6, 3.2, 0.6], [-7.0, 3.2, 0.6], [-7.0, 3.2, 2.6], [-11.4, 3.2, 2.6], [-11.4, 3.2, 1.8]], R.bad, 4, {dash: [10, 6], off: -f, layer: 2, a});
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, -12, 3, 0.6, {title: '1 层 decoder', dir: -1, up: 40, len: 40, a: clamp((f - b[0]) / 30), ts: 24});
      ['低', '中', '高'].forEach((s, k) => label(iso, s, 4.4, -2, [1, 4, 7][k] * 1.08 + 0.45, {size: 24, weight: 700, a: clamp((f - b[1] - k * 6) / 12), align: 'left', dy: 10}));
      legend(g, 230, [
        {c: R.drafter, t: '低 / 中 / 高三层特征', sub: '各 k 维', a: clamp((f - b[1]) / 14)},
        {c: '#57B3B0', t: '拼成 3k → FC 压回 k', a: clamp((f - b[2]) / 14)},
        {c: R.ok, t: '第 1 步：真特征 + 刚采样的「I」', sub: '→ 猜出「do」', a: clamp((f - b[3]) / 14)},
        {c: R.bad, t: '第 2 步：没有「do」的特征', sub: '用草稿机上一步的输出 a 顶上 → 猜「it」', a: clamp((f - b[4]) / 14)},
      ]);
      src(g, 'EAGLE-3 论文 §3.1 Figure 5（How can I → do → it）· 楼层位置为示意', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ training-time test: the attention mask
/** Figure 6, redrawn: keys = original tokens (grey), step-1 predictions (blue), step-2 predictions (yellow). */
const mask = (g: CanvasRenderingContext2D, x: number, y: number, cell: number, a: number, steps: number) => {
  const COL = ['#B8B2A6', '#5A9BCB', '#E3B04B'];
  const n = 3;
  for (let qs = 0; qs < steps; qs++)
    for (let qi = 0; qi < n; qi++)
      for (let ks = 0; ks < 3; ks++)
        for (let ki = 0; ki < n; ki++) {
          const row = qs * n + qi,
            col = ks * n + ki;
          let on = false;
          if (ks === 0) on = ki <= qi; // the original sequence: causal
          else if (ks <= qs) on = ki === qi; // own earlier predictions: diagonal only
          g.save();
          g.globalAlpha = a;
          g.fillStyle = on ? COL[qs] : 'rgba(46,37,34,.07)';
          rr(g, x + col * cell + 2, y + row * cell + 2, cell - 4, cell - 4, 5);
          g.fill();
          g.restore();
        }
  // axis labels
  const toks = [['How', 'can', 'I'], ['are', 'we', 'do'], ['·', '·', '·']];
  toks.forEach((t, s) =>
    t.forEach((w, i) => {
      text(g, w, x + (s * n + i) * cell + cell / 2, y - 12, {size: 18, weight: 600, align: 'center', a, halo: false, color: R.dim});
      if (s < steps) text(g, w, x - 12, y + (s * n + i) * cell + cell / 2 + 6, {size: 18, weight: 600, align: 'right', a, halo: false, color: R.dim});
    }),
  );
};
export const EagleTtt: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-12, 3, 1.5, 300, 640, 30)}
    draw={({iso, f, b}) => {
      board(iso, -17, -2, 12, 10);
      eagleDrafter(iso, -14, 1, 1, true);
      // output fed back in, a few times
      const a = clamp((f - b[2]) / 20);
      iso.line3([[-9.6, 3.2, 0.6], [-9.0, 3.2, 0.6], [-9.0, 3.2, 2.8], [-13.4, 3.2, 2.8], [-13.4, 3.2, 1.8]], R.bad, 4, {dash: [10, 6], off: -f, layer: 2, a});
    }}
    over={({g, f, b}) => {
      CH(g, f);
      const steps = f >= b[2] + 30 ? 3 : f >= b[2] ? 2 : 1;
      const am = clamp((f - b[1]) / 16);
      if (am > 0) {
        card(g, 640, 230, 560, 600, am);
        text(g, '训练时测试：attention mask', 668, 280, {size: 26, weight: 700, a: am, halo: false});
        mask(g, 730, 340, 50, am, steps);
        text(g, '按论文 Figure 6 重画', 668, 806, {size: 18, weight: 500, color: R.dim, a: am, halo: false});
      }
      legend(g, 230, [
        {c: '#B8B2A6', t: '原序列：吃真特征，因果 mask', a: clamp((f - b[1]) / 14)},
        {c: '#5A9BCB', t: '多走一步：吃自己上一步的输出', a: clamp((f - b[2]) / 14)},
        {c: '#E3B04B', t: '再走一步：自己的输出只看对角线', a: clamp((f - b[2] - 30) / 14)},
      ]);
      const q = clamp((f - b[3]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 430, PANEL_W, 130, q);
        text(g, '去掉特征回归损失 l_fea', PANEL_X + 28, 480, {size: 26, weight: 700, a: q, halo: false});
        text(g, '只留 token 损失：直接把词猜对', PANEL_X + 28, 522, {size: 24, weight: 500, a: q, halo: false});
      }
      const q2 = clamp((f - b[4]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 586, PANEL_W, 250, q2);
        text(g, '训练数据越多，加速越高', PANEL_X + 28, 634, {size: 26, weight: 700, a: q2, halo: false});
        // qualitative trend from Figure 1 (shape only)
        const x0 = PANEL_X + 60,
          y0 = 800,
          w = 460,
          h = 120;
        g.save();
        g.globalAlpha = q2;
        g.strokeStyle = R.ink;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, y0 - h - 10);
        g.lineTo(x0, y0);
        g.lineTo(x0 + w, y0);
        g.stroke();
        g.lineWidth = 4;
        g.strokeStyle = R.ok;
        g.beginPath();
        for (let i = 0; i <= 20; i++) {
          const t = (i / 20) * eo(q2);
          const yy = y0 - 20 - t * h * 0.85;
          i ? g.lineTo(x0 + t * w, yy) : g.moveTo(x0, yy);
        }
        g.stroke();
        g.strokeStyle = '#B8B2A6';
        g.beginPath();
        g.moveTo(x0, y0 - 20);
        g.lineTo(x0 + w * eo(q2), y0 - 28);
        g.stroke();
        g.restore();
        text(g, 'EAGLE-3', x0 + w - 4, y0 - h - 6, {size: 20, weight: 700, color: '#476F37', a: q2, halo: false, align: 'right'});
        text(g, 'EAGLE', x0 + w - 4, y0 - 40, {size: 20, weight: 700, color: R.dim, a: q2, halo: false, align: 'right'});
        text(g, '数据量 →（趋势示意，见论文 Figure 1）', x0, y0 + 26, {size: 18, weight: 500, color: R.dim, a: q2, halo: false});
      }
      src(g, 'EAGLE-3 论文 §3.2、Figure 1、Figure 6', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ the draft tree and the numbers
const LV = [[0], [-1.6, 1.6], [-2.6, 0, 2.6], [-1.6, 1.6], [0]];
const PATH = [0, 1, 1, 1, 0]; // accepted node index per level
export const EagleTree: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-3, 3, 1.5, 560, 600, 30)}
    draw={({iso, f, b}) => {
      board(iso, -15, -8, 23, 18);
      eagleDrafter(iso, -14, -4, 1, true);
      const grow = clamp((f - b[0]) / 40);
      const verified = f >= b[1] + 20;
      const kept = f >= b[2];
      // one drafter pass per level: a pulse on the drafter
      const lvl = Math.floor(grow * LV.length - 0.001);
      if (grow > 0 && grow < 1) iso.box(-13.6, -3.6, 1.1, 3.6, 3.6, 0.2 + 0.3 * Math.abs(Math.sin(f * 0.5)), tri('#9FD8D6'));
      LV.forEach((ys, d) =>
        ys.forEach((yy, j) => {
          const p = clamp(grow * LV.length - d);
          if (p <= 0) return;
          const x = -8 + d * 2.8,
            y = 3 + yy;
          const onPath = PATH[d] === j;
          if (d > 0) {
            const prev = LV[d - 1];
            prev.forEach((py, pj) => {
              if (Math.abs(py - yy) > 2.7) return;
              const pathEdge = onPath && PATH[d - 1] === pj;
              iso.line3([[x - 2.8 + 0.6, 3 + py + 0.6, 0.6], [x + 0.6, y + 0.6, 0.6]], verified && kept && !pathEdge ? '#CFC6B6' : R.ink, verified && pathEdge ? 4 : 2, {layer: 2, a: p});
            });
          }
          const t3 = !verified ? T3d.draft : onPath ? T3d.ok : kept ? GREY : T3d.draft;
          token(iso, x, y, 0, '', t3, {pop: p, s: 1.2});
        }),
      );
      void lvl;
      // numbers as stacked cubes: EAGLE-2 vs EAGLE-3 on Llama-3.1-8B
      const nb = clamp((f - b[3]) / 30);
      if (nb > 0) {
        cubeBar(iso, 4.6, -6.6, 3.23, GREY, clamp((f - b[4]) / 30), {s: 1.4, h: 0.9});
        cubeBar(iso, 4.6, -1.6, 4.44, T3d.ok, nb, {s: 1.4, h: 0.9});
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, -12, -2, 1.8, {title: '草稿机', dir: -1, up: 90, len: 40, a: clamp(f / 20), ts: 24});
      if (f >= b[1]) pin(iso, 2, 3.6, 1.2, {title: '树形注意力：一次前向核完整棵树', dir: 1, up: -170, len: 40, a: clamp((f - b[1]) / 30), ts: 24});
      if (clamp((f - b[3]) / 30) > 0) {
        label(iso, '4.44×', 5.3, -0.9, 4.44 * 0.9, {size: 34, weight: 400, dy: -20, a: clamp((f - b[3] - 20) / 12)});
        label(iso, 'EAGLE-3', 5.3, -0.9, 0, {size: 20, weight: 700, dy: 40, a: clamp((f - b[3]) / 12)});
      }
      if (f >= b[4]) {
        label(iso, '3.23×', 5.3, -5.9, 3.23 * 0.9, {size: 34, weight: 400, dy: -20, a: clamp((f - b[4] - 20) / 12), color: R.dim});
        label(iso, 'EAGLE-2', 5.3, -5.9, 0, {size: 20, weight: 700, dy: 40, a: clamp((f - b[4]) / 12), color: R.dim});
      }
      legend(
        g,
        230,
        [
          {t: 'Llama-3.1-8B · 平均（T = 0）', sub: 'EAGLE-3 4.44 倍，τ 6.23', a: clamp((f - b[3]) / 14)},
          {t: '同条件 EAGLE-2', sub: '3.23 倍，τ 4.11', a: clamp((f - b[4]) / 14)},
          {t: '单项最高：Vicuna-13B · HumanEval', sub: '6.47 倍，τ 7.54', a: clamp((f - b[5]) / 14)},
        ],
        {head: 'Table 1'},
      );
      const q = clamp((f - b[6]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 640, PANEL_W, 130, q);
        text(g, '草稿仍是一层一层猜的', PANEL_X + 28, 690, {size: 26, weight: 700, a: q, halo: false});
        text(g, '树深 8 层 → 草稿机跑 8 次（§4 设置）', PANEL_X + 28, 732, {size: 24, weight: 500, a: q, halo: false});
      }
      src(g, 'EAGLE-3 论文 Table 1、Appendix A · 树形为示意', clamp((f - b[0]) / 14));
    }}
  />
);
