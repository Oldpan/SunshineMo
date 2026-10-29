// 05 DFlash 2 (2026-08, Inco AI blog): keep the top-16 candidates per slot, score adjacent pairs, walk one coherent
// path; plus a two-tap convolution around every draft layer.
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
  src,
  T3,
  T3d,
  text,
  token,
  tri,
} from './world';
import {MK} from './dspark';

const CH = (g: CanvasRenderingContext2D, f: number) => chapter(g, '05', 'DFlash 2', '2026.08 · Inco AI 博客（没有论文）', clamp(f / 10));
export const TECH = {mtp: '#5B7FB0', eagle: '#B07A4F', dflash: '#3E9C9A', dspark: MK, dflash2: '#6FAF6A'};

/** Ring gauge in screen space. */
const gauge = (g: CanvasRenderingContext2D, x: number, y: number, r: number, v: number, a: number, col: string, big: string, cap: string) => {
  if (a <= 0) return;
  g.save();
  g.globalAlpha = a;
  g.lineWidth = 18;
  g.lineCap = 'round';
  g.strokeStyle = '#E3D6BE';
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = col;
  g.beginPath();
  g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * v);
  g.stroke();
  g.restore();
  text(g, big, x, y + 14, {size: 38, weight: 500, a, align: 'center', halo: false});
  text(g, cap, x, y + r + 48, {size: 20, weight: 600, a, align: 'center', halo: false, color: R.dim});
};

// ------------------------------------------------------------------ the observation: the right word is usually on the shelf
const COLS = 7,
  CAND = 16;
const RIGHT = [0, 0, 2, 0, 1, 4, 0]; // rank of the correct word per slot (sketch)
const SX = (i: number) => -5 + i * 1.9;
export const Dflash2Obs: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(0, 2.5, 3.5, 600, 600, 32)}
    draw={({iso, f, b}) => {
      board(iso, -11, -3, 20, 12);
      token(iso, -7.4, 2, 0, '', T3d.bonus, {s: 1.3});
      const rise = clamp((f - b[1]) / 30);
      for (let i = 0; i < COLS; i++)
        for (let r = 0; r < CAND; r++) {
          const p = clamp(rise * 2.2 - i * 0.12 - (CAND - 1 - r) * 0.03);
          if (p <= 0) continue;
          const z = (CAND - 1 - r) * 0.36 * eo(p); // rank 1 on top
          let t3 = r === 0 ? T3d.draft : tri('#E9DCC3');
          if (i === 0 && f >= b[3]) t3 = r === RIGHT[0] ? T3d.ok : tri('#B9D7B3');
          else if (i === 0 && f >= b[2] && r === 0) t3 = T3d.ok;
          if (i > 0 && f >= b[4] && r === RIGHT[i]) t3 = T3d.ok;
          iso.box(SX(i), 2, z, 1.3, 1.3, 0.28, t3);
        }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, SX(0) + 0.6, 2.6, 16 * 0.36, {title: '第 1 位', dir: -1, up: 50, len: 40, a: clamp((f - b[2]) / 24), ts: 24});
      pin(iso, SX(6) + 1.3, 2.6, 15 * 0.36 + 0.28, {title: '第一选择', dir: 1, up: 40, len: 40, a: clamp((f - b[1] - 20) / 24), ts: 24});
      pin(iso, SX(6) + 1.3, 2.6, 0.2, {title: '第 16 名', dir: 1, up: -40, len: 40, a: clamp((f - b[1] - 30) / 24), ts: 24});
      const q = clamp((f - b[2]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 230, PANEL_W, 380, q);
        text(g, '第 1 个位置', PANEL_X + 28, 278, {size: 26, weight: 700, a: q, halo: false});
        gauge(g, PANEL_X + 150, 420, 92, 0.854 * eo(q), q, R.draft, '85.4%', '第一选择就对');
        const q2 = clamp((f - b[3]) / 20);
        gauge(g, PANEL_X + 440, 420, 92, 0.995 * eo(q2), q2, R.ok, '99.5%', '前 16 个里有对的');
      }
      const q3 = clamp((f - b[4]) / 16);
      if (q3 > 0) {
        card(g, PANEL_X, 640, PANEL_W, 130, q3);
        text(g, '对的词多半已在候选里', PANEL_X + 28, 690, {size: 26, weight: 700, a: q3, halo: false});
        text(g, '只是没被挑出来（绿块位置为示意）', PANEL_X + 28, 732, {size: 22, weight: 500, color: R.dim, a: q3, halo: false});
      }
      src(g, 'Inco AI 博客 Table 1（5 层 Qwen3-4B DFlash · GSM8K）', clamp((f - b[2]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ pair scores and the path
const SHOW = 4; // candidates drawn per slot (of 16)
const GX = (i: number) => -7.5 + i * 2.5,
  GY = (r: number) => -2.5 + r * 2;
const PATH = [0, 0, 2, 0, 1, 3, 0];
const score = (i: number, a: number, c: number) => {
  const h = Math.sin(i * 12.9 + a * 78.2 + c * 37.7) * 43758.5;
  return h - Math.floor(h);
};
export const Dflash2Path: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(0, 1.5, 1, 600, 600, 31)}
    draw={({iso, f, b}) => {
      board(iso, -11, -5, 21, 12);
      token(iso, -10, GY(0), 0, '', T3d.bonus, {s: 1.1});
      const walk = clamp((f - b[2]) / 50);
      const nWalk = Math.floor(walk * COLS + 0.001);
      for (let i = 0; i < COLS; i++)
        for (let r = 0; r < SHOW; r++) {
          const p = clamp((f - i * 3 - r * 2) / 16);
          if (p <= 0) continue;
          const onPath = PATH[i] === r && i < nWalk;
          const off = f >= b[2] + 50 && PATH[i] !== r;
          token(iso, GX(i), GY(r), 0, '', onPath ? T3d.ok : off ? GREY : r === 0 ? T3d.draft : tri('#F0D9A6'), {pop: p, s: 1.1});
        }
      // pair scores between adjacent slots
      const sa = clamp((f - b[1]) / 40);
      for (let i = 0; i < COLS - 1; i++) {
        const a = clamp(sa * (COLS - 1) - i);
        if (a <= 0) continue;
        for (let r = 0; r < SHOW; r++)
          for (let c = 0; c < SHOW; c++) {
            const s = score(i, r, c);
            const fade = f >= b[2] + 50 ? 0.25 : 1;
            iso.line3([[GX(i) + 1.1, GY(r) + 0.55, 0.5], [GX(i + 1), GY(c) + 0.55, 0.5]], '#7A6E66', 1 + s * 3, {layer: 2, a: a * (0.15 + 0.6 * s) * fade});
          }
      }
      // the walk
      if (walk > 0) {
        const pts: [number, number, number][] = [[-10 + 1.1, GY(0) + 0.55, 1.2]];
        for (let i = 0; i < nWalk; i++) pts.push([GX(i) + 0.55, GY(PATH[i]) + 0.55, 1.2]);
        if (pts.length > 1) iso.line3(pts, '#3F7D3A', 6, {layer: 2});
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      for (let i = 0; i < COLS; i++) label(iso, `${i + 1}`, GX(i) + 0.55, GY(0) - 0.6, 0, {size: 22, weight: 700, color: R.dim, a: clamp((f - i * 3) / 16), dy: -4});
      label(iso, '…… 共 16 个候选（画出前 4 个）', GX(3) + 0.55, GY(SHOW - 1) + 3.6, 0, {size: 22, weight: 600, color: R.dim, a: clamp((f - 20) / 16), dy: 20});
      legend(g, 230, [
        {c: R.draft, t: '每个位置留 16 个候选', a: clamp(f / 14)},
        {c: R.dim, t: '相邻两列两两打分：接得顺不顺', sub: '低秩双线性打分，一次并行算完', a: clamp((f - b[1]) / 14)},
        {c: R.ok, t: '沿着分数走一遍，选一条连贯的路', a: clamp((f - b[2]) / 14)},
      ]);
      // two-tap convolution
      const q = clamp((f - b[3]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 520, PANEL_W, 150, q);
        text(g, '两抽头卷积：每层前后各一个', PANEL_X + 28, 566, {size: 24, weight: 700, a: q, halo: false});
        for (let i = 0; i < 8; i++) {
          const x = PANEL_X + 40 + i * 66;
          g.save();
          g.globalAlpha = q;
          g.fillStyle = i === 0 ? R.bonus : R.draft;
          rr(g, x, 600, 44, 44, 6);
          g.fill();
          if (i > 0) {
            g.strokeStyle = R.ink;
            g.lineWidth = 2.5;
            g.beginPath();
            g.moveTo(x - 20, 610);
            g.quadraticCurveTo(x - 8, 588, x + 8, 600);
            g.stroke();
          }
          g.restore();
        }
      }
      // Table 2
      const t = clamp((f - b[4]) / 16);
      if (t > 0) {
        card(g, PANEL_X, 690, PANEL_W, 200, t);
        const row = (y: number, name: string, p: string, l: string, tau: string, a: number, hi: boolean) => {
          text(g, name, PANEL_X + 28, y, {size: 22, weight: 700, a, halo: false, color: hi ? '#3F7D3A' : R.ink});
          text(g, p, PANEL_X + 290, y, {size: 22, weight: 600, a, halo: false, align: 'right'});
          text(g, l, PANEL_X + 420, y, {size: 22, weight: 600, a, halo: false, align: 'right'});
          text(g, tau, PANEL_X + 550, y, {size: 22, weight: 700, a: a * (f >= b[6] ? 1 : 0.0), halo: false, align: 'right', color: hi ? '#3F7D3A' : R.ink});
        };
        text(g, '参数', PANEL_X + 290, 728, {size: 18, weight: 500, color: R.dim, a: t, halo: false, align: 'right'});
        text(g, '延迟', PANEL_X + 420, 728, {size: 18, weight: 500, color: R.dim, a: t, halo: false, align: 'right'});
        text(g, 'τ', PANEL_X + 550, 728, {size: 18, weight: 500, color: R.dim, a: t * clamp((f - b[6]) / 12), halo: false, align: 'right'});
        row(772, '路径选择器', '+2.0M', '+0.6%', '4.61', t, true);
        row(818, 'DSpark 式修正*', '+77.8M', '+9.6%', '4.49', clamp((f - b[5]) / 14), false);
        text(g, '* Inco 按同样设置复现 · Qwen3-4B · GSM8K · T = 0', PANEL_X + 28, 862, {size: 17, weight: 500, color: R.dim, a: clamp((f - b[5]) / 14), halo: false});
      }
      src(g, 'Inco AI 博客 Figure 1、Figure 4、Table 2 · 打分线粗细为示意', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ numbers
const BARS: [string, number, string][] = [
  ['MTP', 4.54, TECH.mtp],
  ['DFlash', 4.92, TECH.dflash],
  ['DSpark', 5.49, TECH.dspark],
  ['DFlash 2', 5.97, TECH.dflash2],
];
export const Dflash2Num: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(-1, 0, 2.5, 600, 640, 32)}
    draw={({iso, f, b}) => {
      board(iso, -10, -7, 18, 14);
      BARS.forEach(([, v, c], i) => cubeBar(iso, -6 + i * 2.2, 1 - i * 2.2, v, tri(c), clamp((f - b[1] - i * 10) / 30), {s: 1.5, h: 0.75}));
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      BARS.forEach(([n, v], i) => {
        label(iso, v.toFixed(2), -5.25 + i * 2.2, 1.75 - i * 2.2, v * 0.75, {size: 32, weight: 500, dy: -20, a: clamp((f - b[1] - i * 10 - 24) / 12)});
        label(iso, n, -5.25 + i * 2.2, 1.75 - i * 2.2, 0, {size: 22, weight: 700, dy: 40, a: clamp((f - i * 4) / 12)});
      });
      legend(g, 230, [{t: 'Qwen3.5-4B · 平均 τ', sub: 'thinking 模式，T = 1（博客 Table 3）', a: clamp(f / 14)}]);
      const q = clamp((f - b[2]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 400, PANEL_W, 120, q);
        g.save();
        g.globalAlpha = q;
        g.strokeStyle = R.bad;
        g.lineWidth = 3;
        rr(g, PANEL_X + 10, 410, PANEL_W - 20, 100, 10);
        g.stroke();
        g.restore();
        text(g, '对照模型是 Inco 按同样设置自己训的', PANEL_X + 28, 456, {size: 24, weight: 700, a: q, halo: false, color: R.bad});
        text(g, '不是各家官方发布的草稿机', PANEL_X + 28, 492, {size: 20, weight: 500, a: q, halo: false, color: R.dim});
      }
      const q2 = clamp((f - b[3]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 550, PANEL_W, 300, q2);
        text(g, 'Qwen3.8-27B · 1 张 H200 · GSM8K', PANEL_X + 28, 598, {size: 24, weight: 700, a: q2, halo: false});
        const bar = (y: number, v: number, s: string, cap: string, a: number) => {
          if (a <= 0) return;
          g.save();
          g.globalAlpha = a;
          g.fillStyle = TECH.dflash2;
          rr(g, PANEL_X + 28, y, 130 * v * eo(a), 40, 6);
          g.fill();
          g.restore();
          text(g, s, PANEL_X + 40 + 130 * v, y + 31, {size: 30, weight: 500, a, halo: false});
          text(g, cap, PANEL_X + 28, y + 70, {size: 20, weight: 600, color: R.dim, a, halo: false});
        };
        bar(630, 3.43, '3.43×', '单个请求（并发 1）', q2);
        bar(740, 1.45, '1.45×', '并发 32', clamp((f - b[4]) / 16));
      }
      src(g, 'Inco AI 博客 Table 3 · HF 模型卡 z-lab/Qwen3.8-27B-DFlash2 吞吐表（SGLang，对比不投机）', clamp(f / 14));
    }}
  />
);
