// 01 MTP: Meta's parallel heads (2024-04) and DeepSeek-V3's chained MTP modules (2024-12).
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {
  back,
  board,
  camAt,
  card,
  chapter,
  clamp,
  eo,
  GREY,
  IsoScene,
  label,
  legend,
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
  tower,
  tri,
} from './world';

const CH = (g: CanvasRenderingContext2D, f: number) => chapter(g, '01', 'MTP', '多 token 预测 · Meta 2024.04 / DeepSeek-V3 2024.12', clamp(f / 10));

// ------------------------------------------------------------------ Meta: shared trunk + 4 independent heads
export const MtpMeta: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(0.5, 0, 6, 620, 520, 34)}
    draw={({iso, f, b}) => {
      board(iso, -11, -8, 22, 16);
      // shared trunk with a wide roof plate that carries the heads
      const tops = tower(iso, -3, -2.5, 0, 5, 5, 7, T3.target);
      const roof = tops[tops.length - 1] + 0.45;
      iso.box(-4.5, -1.6, roof, 10, 3.2, 0.4, tri('#3C5A86'));
      const ah = clamp((f - b[1]) / 18);
      for (let i = 0; i < 4; i++) {
        const p = clamp(ah * 4 - i);
        if (p <= 0) continue;
        const draft = f >= b[3] && i > 0;
        const x = -4.1 + i * 2.5;
        iso.box(x, -1.0, roof + 0.4, 1.7, 2, 1.3 * back(p, 2), i === 0 ? T3.target : T3.drafter);
        // each head predicts one future token, all at once
        const tp = clamp((f - b[1] - 14 - i * 2) / 12);
        if (tp > 0) token(iso, x + 0.15, -0.8, roof + 0.4 + 1.3 * back(p, 2), '', i === 0 ? T3d.ok : draft ? T3d.draft : tri('#E9DCC3'), {pop: tp, s: 1.4});
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      const top = 7 * 1.08 + 0.45 + 0.4 + 1.3 + 1.3;
      if (f >= b[1] + 30)
        ['t+1', 't+2', 't+3', 't+4'].forEach((s, i) => label(iso, s, -4.1 + i * 2.5 + 0.85, 0, top, {size: 26, weight: 700, a: clamp((f - b[1] - 30) / 12), dy: -16}));
      pin(iso, -0.5, 2.5, 3, {title: '共享主干', dir: -1, up: 60, len: 50, a: clamp((f - b[2]) / 30), ts: 26});
      pin(iso, 4.4, 1, 9.6, {title: '4 个独立输出头', dir: 1, up: 40, len: 50, a: clamp((f - b[2] - 10) / 30), ts: 26});
      legend(g, 230, [
        {c: R.target, t: '第 1 个头：推理时照常用', a: clamp((f - b[3]) / 14)},
        {c: R.draft, t: '第 2–4 个头：拿来当草稿', a: clamp((f - b[3] - 12) / 14)},
      ]);
      const q = clamp((f - b[4]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 400, PANEL_W, 200, q);
        text(g, '代码任务 · 自投机解码', PANEL_X + 28, 450, {size: 26, weight: 600, a: q, halo: false});
        text(g, '约 3 倍', PANEL_X + 28, 530, {size: 64, weight: 400, a: q, halo: false});
        text(g, 'Meta 论文 §3.2', PANEL_X + 28, 574, {size: 20, weight: 500, color: R.dim, a: q, halo: false});
        for (let i = 0; i < 3; i++) {
          const p = clamp(q * 3 - i);
          g.save();
          g.globalAlpha = p;
          g.fillStyle = R.ok;
          rr(g, PANEL_X + 300 + i * 60, 480, 46 * back(p, 2), 46 * back(p, 2), 6);
          g.fill();
          g.restore();
        }
      }
      const q2 = clamp((f - b[5]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 630, PANEL_W, 110, q2);
        text(g, '4 个头各猜各的：', PANEL_X + 28, 680, {size: 26, weight: 700, a: q2, halo: false});
        text(g, '第 3 个头看不到第 2 个头猜了什么', PANEL_X + 28, 716, {size: 24, weight: 500, a: q2, halo: false});
        // dashed walls between heads
        for (let i = 1; i < 4; i++) {
          const [sx, sy] = iso.P(-4.1 + i * 2.5 - 0.4, 0, 10.4);
          g.save();
          g.globalAlpha = q2;
          g.strokeStyle = R.bad;
          g.lineWidth = 3;
          g.setLineDash([8, 6]);
          g.beginPath();
          g.moveTo(sx, sy - 40);
          g.lineTo(sx, sy + 60);
          g.stroke();
          g.restore();
        }
      }
      src(g, 'Gloeckle et al.（Meta）arXiv 2404.19737 · Figure 1、§3.2', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ DeepSeek-V3: chained modules, shared embedding + head
export const MtpDs: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(3, 0, 4, 620, 600, 28)}
    draw={({iso, f, b}) => {
      board(iso, -11, -8, 28, 16);
      const shared = f >= b[5] && f < b[6] + 40;
      const glow = shared ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0;
      // main model: embedding floor at the bottom, output head on top
      iso.box(-6, -3, 0, 6, 6, 0.9, shared ? tri('#E3B04B') : tri('#9DB4D3'));
      const tops = tower(iso, -6, -3, 1.08, 6, 6, 7, T3.target);
      const headZ = tops[tops.length - 1] + 0.5;
      iso.box(-5.4, -2.4, headZ, 4.8, 4.8, 0.8, shared ? tri('#E3B04B') : tri('#3C5A86'));
      // modules chained along +x at mid height
      const z = 4.5;
      for (let k = 0; k < 2; k++) {
        const p = clamp((f - b[1] - k * 14) / 16);
        if (p <= 0) continue;
        const x = 3.4 + k * 6;
        const pulse = f >= b[4] && f < b[5] ? 0.12 * Math.max(0, Math.sin((f - b[4]) * 0.25 - k)) : 0;
        iso.box(x, -2, z - 0.6, 3.6, 3.6, 0.6, tri('#57B3B0')); // norm + concat + projection
        iso.box(x, -2, z, 3.6, 3.6, 1.6 * back(p, 2) + pulse, T3.drafter); // the Transformer block
        // hidden state from the previous depth (main model or previous module)
        const hx = k === 0 ? 0 : 3.4 + (k - 1) * 6 + 3.6;
        iso.line3([[hx, 0, z + 0.4], [x, 0, z + 0.4]], R.target, 5, {layer: 2, a: p});
        // embedding of token t+k comes up from the shared embedding floor
        if (f >= b[2]) {
          const a = clamp((f - b[2] - k * 8) / 14);
          iso.line3([[0, 1.6 - k * 0.3, 0.45], [x + 1.2, 1.6 - k * 0.3, 0.45], [x + 1.2, 1.6 - k * 0.3, z - 0.6]], '#B0832A', 4, {dash: [8, 6], layer: 2, a});
        }
        // the output goes back to the main model's own head
        if (f >= b[4]) {
          const a = clamp((f - b[4] - k * 8) / 14);
          iso.line3([[x + 1.8, -2, z + 1.6], [x + 1.8, -3.6, z + 1.6], [x + 1.8, -3.6, headZ + 0.4], [-0.6, -3.6, headZ + 0.4]], R.drafter, 4, {dash: [8, 6], layer: 2, a});
        }
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, -3, 3, 0.5, {title: 'embedding（共用）', dir: -1, up: -90, len: 40, a: clamp((f - b[2]) / 30), ts: 24});
      pin(iso, -3, -0.2, 9.9, {title: '输出头（共用）', dir: -1, up: 70, len: 40, a: clamp((f - b[4]) / 30), ts: 24});
      ['MTP 模块 1', 'MTP 模块 2'].forEach((s, k) => label(iso, s, 5.2 + k * 6, 1.6, 6.1, {size: 24, weight: 700, a: clamp((f - b[1] - k * 14) / 14), dy: -18}));
      legend(g, 230, [
        {c: R.target, t: '上一深度的隐状态', a: clamp((f - b[2]) / 14)},
        {c: '#B0832A', t: '第 k 个 token 的 embedding', a: clamp((f - b[2] + -10) / 14)},
        {c: '#57B3B0', t: '各自 RMSNorm → 拼接 → 投影', a: clamp((f - b[3]) / 14)},
        {c: R.drafter, t: '1 个 Transformer 块 → 共用输出头', a: clamp((f - b[4]) / 14)},
      ]);
      const q = clamp((f - b[5]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 520, PANEL_W, 110, q);
        text(g, '共用：embedding、输出头', PANEL_X + 28, 568, {size: 26, weight: 700, a: q, halo: false});
        text(g, '新增：投影矩阵 + 1 个 Transformer 块', PANEL_X + 28, 606, {size: 24, weight: 500, a: q, halo: false});
      }
      const q2 = clamp((f - b[6]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 656, PANEL_W, 130, q2);
        text(g, '随预训练一起训：L = L_main + λ·L_MTP', PANEL_X + 28, 704, {size: 24, weight: 700, a: q2, halo: false});
        text(g, 'λ：前 10T token 取 0.3，后 4.8T 取 0.1', PANEL_X + 28, 746, {size: 24, weight: 500, a: q2, halo: false});
      }
      src(g, 'DeepSeek-V3 技术报告（arXiv 2412.19437）§2.2 Figure 3、§4.2 · 图中画了 2 个模块，V3 实际用 1 个', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ V3 numbers
export const MtpNum: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(0, 0, 3, 560, 600, 34)}
    draw={({iso, f, b}) => {
      board(iso, -10, -7, 20, 14);
      const drop = clamp((f - b[3] - 20) / 30);
      iso.box(-5, -3, 0, 6, 6, 0.9, tri('#9DB4D3'));
      const tops = tower(iso, -5, -3, 1.08, 6, 6, 7, T3.target);
      const top = tops[tops.length - 1] + 0.5;
      iso.box(-4.4, -2.4, top, 4.8, 4.8, 0.8, tri('#3C5A86'));
      // the single MTP module; at the end it lifts off (discarded at inference)
      iso.box(2.4, -2, 4.5 + eo(drop) * 3, 3.6, 3.6, 1.6, drop > 0 ? GREY : T3.drafter);
      // one main token + one draft per step
      token(iso, 2, 4, 0, '', T3d.ok, {pop: clamp((f - b[0] - 6) / 12), s: 1.6});
      token(iso, 4.2, 4, 0, '', f >= b[1] ? T3d.ok : T3d.draft, {pop: clamp((f - b[0] - 14) / 12), s: 1.6});
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      label(iso, '主模型', 2.8, 4.8, 1.6, {size: 22, weight: 600, a: clamp((f - b[0]) / 14), dy: -36});
      label(iso, '+1 草稿', 5, 4.8, 1.6, {size: 22, weight: 600, a: clamp((f - b[0] - 8) / 14), dy: -36});
      const q = clamp((f - b[1]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 230, PANEL_W, 230, q);
        text(g, '第 2 个 token 的接受率', PANEL_X + 28, 282, {size: 26, weight: 600, a: q, halo: false});
        text(g, '85% – 90%', PANEL_X + 28, 356, {size: 60, weight: 400, a: q, halo: false});
        // 10 cubes, 8.5–9 lit
        for (let i = 0; i < 10; i++) {
          const lit = i < 8.5 ? 1 : i < 9 ? 0.5 : 0;
          g.save();
          g.globalAlpha = q;
          g.fillStyle = lit === 1 ? R.ok : lit ? '#B6D3A8' : 'rgba(46,37,34,.12)';
          rr(g, PANEL_X + 28 + i * 52, 392, 40, 40, 6);
          g.fill();
          g.restore();
        }
      }
      const q2 = clamp((f - b[2]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 490, PANEL_W, 160, q2);
        text(g, '每秒 token 数（TPS）', PANEL_X + 28, 540, {size: 26, weight: 600, a: q2, halo: false});
        text(g, '1.8 倍', PANEL_X + 28, 612, {size: 60, weight: 400, a: q2, halo: false});
      }
      const q3 = clamp((f - b[3]) / 16);
      if (q3 > 0) {
        card(g, PANEL_X, 680, PANEL_W, 130, q3);
        text(g, '“we can directly discard the MTP modules”', PANEL_X + 28, 730, {size: 23, weight: 500, a: q3, halo: false});
        text(g, '主要用来提升主模型；推理时可丢弃', PANEL_X + 28, 772, {size: 23, weight: 600, a: q3, halo: false});
      }
      src(g, 'DeepSeek-V3 技术报告 §5.4.3（接受率、TPS）、§2.2（丢弃）', clamp((f - b[1]) / 14));
    }}
  />
);
