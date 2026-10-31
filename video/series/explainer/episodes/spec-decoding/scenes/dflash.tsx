// 03 DFlash (2026-02): a block-diffusion drafter that fills 15 masked slots in one forward pass, fed by target
// features injected into the K/V of every draft layer.
import React from 'react';
import type {Scene} from '@atv/lib/types';
import {
  back,
  bigTower,
  board,
  camAt,
  camLerp,
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
  MASK,
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

const CH = (g: CanvasRenderingContext2D, f: number) => chapter(g, '03', 'DFlash', '2026.02 · 加州大学圣地亚哥分校 z-lab · ICML 2026', clamp(f / 10));

// ------------------------------------------------------------------ the press: one stroke fills the whole block
export const BLOCK = '我们周末一起去山上看日出吧好不好'.split(''); // anchor + 15
export const ROW = {x0: -9.6, y: 2, step: 1.3, s: 1.1};
/** x of slot i in the block row. */
export const slotX = (i: number, x0 = ROW.x0, step = ROW.step) => x0 + i * step;

/**
 * The DFlash press: a gantry over the block row whose head is a stack of `floors` draft layers.
 * `drop` 0..1 lowers the head onto the row (one forward pass). `lit` highlights floors 0..lit-1.
 */
export const press = (iso: any, o: {x0?: number; x1?: number; y?: number; d?: number; floors?: number; drop?: number; lit?: number; z?: number; zLow?: number; a?: number} = {}) => {
  const x0 = o.x0 ?? ROW.x0 - 0.5,
    x1 = o.x1 ?? slotX(15) + ROW.s + 0.5,
    y = (o.y ?? ROW.y) - 0.7,
    d = o.d ?? ROW.s + 1.4,
    n = o.floors ?? 5,
    fh = 0.45,
    gap = 0.16;
  const zTop = lerp(o.z ?? 4.4, o.zLow ?? ROW.s * 0.9 + 0.05, eio(o.drop ?? 0));
  const a0 = iso.alpha;
  iso.alpha = o.a ?? 1;
  const hh = n * (fh + gap);
  // posts reach the top of the raised head
  const postH = (o.z ?? 4.4) + hh + 0.4;
  iso.box(x0 - 1, y + 0.3, 0, 0.8, d - 0.6, postH, T3.drafter);
  iso.box(x1 + 0.2, y + 0.3, 0, 0.8, d - 0.6, postH, T3.drafter);
  iso.box(x0 - 1, y + 0.3, postH, x1 - x0 + 2, d - 0.6, 0.5, tri('#2F7F7D'), {layer: 2});
  for (let i = 0; i < n; i++) {
    const lit = o.lit !== undefined && i < o.lit;
    iso.box(x0, y, zTop + i * (fh + gap), x1 - x0, d, fh, lit ? tri('#7CC9C6') : T3.drafter, {layer: 2, bias: i * 0.01});
  }
  iso.alpha = a0;
  return {zTop, hh, fh, gap};
};

/** The block row: slot 0 = anchor (violet), slots 1..15 masked until `fill` > 0, then amber drafts. */
export const blockRow = (iso: any, o: {pop?: number; fill?: number; chars?: string[]; n?: number; x0?: number; step?: number; colour?: (i: number) => string[] | null} = {}) => {
  const n = o.n ?? 16,
    chars = o.chars ?? BLOCK;
  for (let i = 0; i < n; i++) {
    const p = clamp((o.pop ?? 1) * n - i);
    if (p <= 0) continue;
    const x = slotX(i, o.x0, o.step);
    if (i === 0) {
      token(iso, x, ROW.y, 0, chars[0], T3d.bonus, {pop: p, s: ROW.s, text: '#FBF4E6'});
      continue;
    }
    const filled = (o.fill ?? 0) > 0;
    const c = o.colour?.(i);
    if (filled) token(iso, x, ROW.y, 0, chars[i], c ?? T3d.draft, {pop: 1, s: ROW.s});
    else token(iso, x, ROW.y, 0, '?', MASK, {pop: p, s: ROW.s, text: '#B9AE9C'});
  }
};

const CAM_P = camAt(-0.5, 2.6, 2.2, 600, 560, 31);
export const DflashPress: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={CAM_P}
    draw={({iso, f, b}) => {
      board(iso, -14, -4, 30, 12);
      // one stroke at b[3]: down, a short hold, back up
      const t = f - (b[3] ?? 1e9);
      const drop = t < 0 ? 0 : t < 14 ? eo(t / 14) : t < 26 ? 1 : 1 - eio((t - 26) / 18);
      const lit = f >= b[5] ? Math.min(5, Math.floor((f - b[5]) / 8) + 1) : undefined;
      press(iso, {drop, lit, a: clamp(f / 16)});
      blockRow(iso, {pop: clamp((f - b[2]) / 30), fill: t >= 12 ? 1 : 0});
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, slotX(0) + 0.5, ROW.y + 1.1, 1, {title: '锚点', dir: -1, up: -120, len: 40, a: clamp((f - b[2]) / 24), ts: 26});
      pin(iso, slotX(15) + 0.5, ROW.y + 1.1, 1, {title: '15 个遮罩位', dir: 1, up: -100, len: 40, a: clamp((f - b[2] - 20) / 24), ts: 26});
      if (f >= b[5]) label(iso, `${Math.min(5, Math.floor((f - b[5]) / 8) + 1)} 层`, slotX(15) + ROW.s + 2.2, ROW.y - 0.7, 6.2, {size: 34, weight: 700, a: clamp((f - b[5]) / 10), align: 'left'});
      legend(g, 230, [
        {c: R.bonus, t: '锚点：上一轮已确认的词', a: clamp((f - b[2]) / 14)},
        {c: '#E9DCC3', t: '15 个遮罩位', sub: '块内互相可见（双向注意力）', a: clamp((f - b[2] - 20) / 14)},
        {c: R.draft, t: '一次前向，15 位同时填满', a: clamp((f - b[3]) / 14)},
      ]);
      // drafting cost: one step per token vs one pass for the block (shape only)
      const q = clamp((f - b[4]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 560, PANEL_W, 230, q);
        text(g, '起草时间（示意）', PANEL_X + 28, 606, {size: 26, weight: 700, a: q, halo: false});
        text(g, '逐个猜：γ × t_step', PANEL_X + 28, 656, {size: 22, weight: 600, a: q, halo: false});
        for (let i = 0; i < 15; i++) {
          const p = clamp(q * 15 - i);
          g.save();
          g.globalAlpha = p;
          g.fillStyle = R.dim;
          rr(g, PANEL_X + 28 + i * 34, 672, 30, 22, 4);
          g.fill();
          g.restore();
        }
        text(g, 'DFlash：一次 t_parallel', PANEL_X + 28, 736, {size: 22, weight: 600, a: q, halo: false});
        g.save();
        g.globalAlpha = q;
        g.fillStyle = R.drafter;
        rr(g, PANEL_X + 28, 752, 30 * 3 + 8 * eo(q), 22, 4);
        g.fill();
        g.restore();
        text(g, '§3.1 式 (2)(3)', PANEL_X + PANEL_W - 28, 606, {size: 18, weight: 500, color: R.dim, a: q, halo: false, align: 'right'});
      }
      const q2 = clamp((f - b[5]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 812, PANEL_W, 84, q2);
        text(g, 'Table 5：3 / 5 / 8 层里，5 层综合最快', PANEL_X + 28, 864, {size: 22, weight: 600, a: q2, halo: false});
      }
      src(g, 'DFlash 论文 arXiv 2602.06036 §3、§4.1 · 块大小 16', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ feature injection into every draft layer's K/V
const TFL = [1, 2, 4, 5, 6]; // 5 target layers, spread from layer 2 to L−3 (drawn positions are a sketch)
const DX = 2.4,
  DY = -3,
  TX = -4.5,
  TY = 4,
  FX = 1.2,
  FY = 2.2,
  DFH = 0.9,
  DGAP = 0.55;
export const DflashInject: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(1, 1, 3, 620, 600, 31)}
    draw={({iso, f, b}) => {
      board(iso, -8, -7, 18, 18);
      const hi = f >= b[1] ? Object.fromEntries(TFL.map((i) => [i, T3.drafter])) : {};
      const tops = tower(iso, TX, TY, 0, 5, 5, 9, T3.target, {hi});
      // fusion box between the two stacks
      const fa = clamp((f - b[1] - 20) / 16);
      if (fa > 0) iso.box(FX, FY, 3.2, 2, 2, 1.6 * back(fa, 2), tri('#57B3B0'));
      // the drafter: five floors with K/V slots on the side facing the fusion box
      for (let i = 0; i < 5; i++) {
        const z = i * (DFH + DGAP);
        iso.box(DX, DY, z, 4.4, 4.4, DFH, T3.drafter);
        const kv = clamp((f - b[1] - 44 - i * 4) / 12);
        if (kv > 0) iso.box(DX + 1, DY + 4.4, z + 0.15, 2.4, 0.45, DFH - 0.3, T3.target);
      }
      // target floors → fusion
      TFL.forEach((fl, k) => {
        const a = clamp((f - b[1] - k * 3) / 20);
        if (a <= 0) return;
        const z0 = tops[fl];
        iso.line3([[TX + 5, TY + 1.5 + k * 0.5, z0], [lerp(TX + 5, FX + 1, a), lerp(TY + 1.5 + k * 0.5, FY + 2, a), lerp(z0, 4, a)]], R.drafter, 4, {dash: [10, 6], off: -f, layer: 2});
      });
      // fusion → every draft layer
      for (let i = 0; i < 5; i++) {
        const a = clamp((f - b[1] - 36 - i * 4) / 14);
        if (a <= 0) continue;
        const z = i * (DFH + DGAP) + DFH / 2;
        iso.line3([[FX + 2, FY + 1, 4], [lerp(FX + 2, DX + 2.2, a), lerp(FY + 1, DY + 4.65, a), lerp(4, z, a)]], R.target, 4, {dash: [10, 6], off: -f, layer: 2});
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      pin(iso, TX + 2.5, TY + 2.5, 9.6, {title: '大模型', dir: -1, up: 40, len: 40, a: clamp(f / 20), ts: 24});
      pin(iso, DX + 4.4, DY + 2.2, 2, {title: '草稿机 5 层', dir: 1, up: -10, len: 40, a: clamp(f / 20 - 0.3), ts: 24});
      pin(iso, FX + 1, FY + 1, 4.8, {title: '5 层特征 → 融合', dir: 1, up: 150, len: 40, a: clamp((f - b[1] - 24) / 30), ts: 24});
      pin(iso, DX + 1.6, DY + 4.65, 0.4, {title: '注入每层的 K / V', dir: -1, up: -90, len: 40, a: clamp((f - b[1] - 60) / 30), ts: 24});
      // why every layer: features fed only at the input fade as the drafter gets deeper
      const q = clamp((f - b[2]) / 16);
      if (q > 0) {
        card(g, PANEL_X, 230, PANEL_W, 300, q);
        text(g, '论文 §3.2 的看法', PANEL_X + 28, 276, {size: 26, weight: 700, a: q, halo: false});
        const stack = (x: number, perLayer: boolean, cap: string) => {
          for (let i = 0; i < 5; i++) {
            const y = 470 - i * 34;
            const fade = perLayer ? 1 : 1 - i * 0.2;
            g.save();
            g.globalAlpha = q;
            g.fillStyle = `rgba(62,156,154,${0.15 + 0.85 * fade})`;
            rr(g, x, y, 150, 26, 5);
            g.fill();
            g.strokeStyle = R.target;
            g.lineWidth = 3;
            if (perLayer || i === 0) {
              g.beginPath();
              g.moveTo(x - 44, y + 13);
              g.lineTo(x - 8, y + 13);
              g.stroke();
              g.beginPath();
              g.moveTo(x - 8, y + 13);
              g.lineTo(x - 18, y + 6);
              g.lineTo(x - 18, y + 20);
              g.closePath();
              g.fillStyle = R.target;
              g.fill();
            }
            g.restore();
          }
          text(g, cap, x + 75, 516, {size: 20, weight: 600, a: q, halo: false, align: 'center'});
        };
        stack(PANEL_X + 80, false, '只在入口拼：越往上越淡');
        stack(PANEL_X + 380, true, '每层注入');
      }
      // training: random anchors, everything after masked, later positions weigh less
      const q2 = clamp((f - b[3]) / 16);
      if (q2 > 0) {
        card(g, PANEL_X, 556, PANEL_W, 330, q2);
        text(g, '训练', PANEL_X + 28, 602, {size: 26, weight: 700, a: q2, halo: false});
        // the anchor hops a few times, then settles
        const hop = Math.min(3, Math.floor(Math.max(0, f - b[3]) / 14));
        const anchor = [2, 6, 1, 4][hop];
        const n = 24,
          cw = 21.5,
          x0 = PANEL_X + 28;
        for (let i = 0; i < n; i++) {
          const inBlock = i > anchor && i <= anchor + 15;
          g.save();
          g.globalAlpha = q2;
          g.fillStyle = i === anchor ? R.bonus : inBlock ? '#E9DCC3' : R.ok;
          rr(g, x0 + i * cw, 630, cw - 4, 30, 4);
          g.fill();
          g.restore();
        }
        text(g, '随机挑锚点，后面 15 位全部遮住', x0, 690, {size: 20, weight: 600, a: q2, halo: false});
        const q3 = clamp((f - b[4]) / 20);
        if (q3 > 0) {
          for (let k = 1; k <= 15; k++) {
            const w = Math.exp(-(k - 1) / 7);
            const h = 120 * w * eo(clamp(q3 * 2 - k / 15));
            g.save();
            g.globalAlpha = q3;
            g.fillStyle = R.draft;
            rr(g, x0 + (anchor + k) * cw, 830 - h, cw - 4, h, 3);
            g.fill();
            g.restore();
          }
          text(g, '损失权重 w_k = exp(−(k−1)/7)', x0, 866, {size: 20, weight: 600, a: q3, halo: false, mono: false});
        }
      }
      src(g, 'DFlash 论文 §4.1–4.2、Figure 2 · 取第 2 层到倒数第 3 层间均匀 5 层，楼层位置为示意', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ numbers, and the weak spot
const CAM_N = camAt(-5, -1, 2.5, 560, 600, 34);
const CAM_W = camAt(5.6, 6.6, 1.5, 600, 600, 40);
const ACC = [0.87, 0.855, 0.84, 0.825, 0.81, 0.795, 0.78]; // endpoints from DSpark Fig. 2 (code); middle is a sketch
export const DflashNum: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={(f, b) => camLerp(CAM_N, CAM_W, seg(f, b[3] ?? 1e9, (b[3] ?? 1e9) + 36))}
    draw={({iso, f, b}) => {
      board(iso, -14, -8, 28, 20);
      const a0 = iso.alpha;
      iso.alpha = 1 - clamp((f - (b[3] ?? 1e9)) / 16);
      cubeBar(iso, -6, -4, 4.86, T3.drafter, clamp(f / 40), {s: 1.4, h: 0.9});
      if (f >= b[1]) cubeBar(iso, -6, -0.6, 1.76, GREY, clamp((f - b[1]) / 24), {s: 1.4, h: 0.9});
      iso.alpha = a0;
      // the weak spot: a 7-slot block whose slots cannot see each other
      const w = clamp((f - b[3]) / 20);
      for (let i = 0; i < 8; i++) {
        const x = 0 + i * 1.6;
        token(iso, x, 6, 0, '', i === 0 ? T3d.bonus : T3d.draft, {pop: clamp(w * 8 - i), s: 1.1});
        // blinders between slots
        if (i > 1 && w > 0.5) iso.box(x - 0.3, 5.7, 0, 0.12, 1.7, 1.6, tri('#D2604C'), {bias: 0.5});
        // conditional acceptance as a column above each draft slot
        const q = clamp((f - b[4] - i * 3) / 16);
        if (i > 0 && q > 0) iso.box(x + 0.25, 6.25, 1.05, 0.6, 0.6, ACC[i - 1] * 3.2 * eo(q), i === 1 || i === 7 ? T3.ok : tri('#B9D7B3'));
      }
    }}
    over={({iso, g, f, b}) => {
      CH(g, f);
      const pre = 1 - clamp((f - b[3]) / 14);
      label(iso, '4.86×', -5.3, -3.3, 4.86 * 0.9, {size: 36, weight: 400, dy: -22, a: clamp((f - 24) / 12) * pre});
      label(iso, 'DFlash', -5.3, -3.3, 0, {size: 22, weight: 700, dy: 44, a: clamp(f / 12) * pre});
      if (f >= b[1]) {
        label(iso, '1.76×', -5.3, 0.1, 1.76 * 0.9, {size: 36, weight: 400, dy: -22, a: clamp((f - b[1] - 16) / 12) * pre, color: R.dim});
        label(iso, 'EAGLE-3', -5.3, 0.1, 0, {size: 22, weight: 700, dy: 44, a: clamp((f - b[1]) / 12) * pre, color: R.dim});
      }
      legend(
        g,
        230,
        [
          {t: 'Qwen3-8B · 非思考 · 贪心（T = 0）· 平均', sub: 'DFlash 4.86 倍，τ 6.49', a: clamp(f / 14) * pre},
          {t: 'DFlash 论文自测的 EAGLE-3（第三方权重）', sub: '每轮核 16 个：1.76 倍，τ 2.96 · 核 60 个：2.02 倍', a: clamp((f - b[1]) / 14) * pre},
          {t: 'SGLang · B200 · Math500', sub: '单个请求 5.1 倍 · 并发 32 仍有 2.8 倍', a: clamp((f - b[2]) / 14) * pre},
        ],
        {head: 'Table 1 / Table 3', a: clamp(f / 14) * pre},
      );
      if (f >= b[4]) {
        label(iso, '0.87', 1.6 + 0.55, 6.55, 1.05 + 0.87 * 3.2, {size: 28, weight: 700, dy: -18, a: clamp((f - b[4] - 10) / 12), color: '#476F37'});
        label(iso, '0.78', 11.2 + 0.55, 6.55, 1.05 + 0.78 * 3.2, {size: 28, weight: 700, dy: -18, a: clamp((f - b[4] - 30) / 12), color: '#476F37'});
      }
      legend(
        g,
        230,
        [
          {c: R.bad, t: '同时猜，看不到彼此猜出的词', a: clamp((f - b[3] - 10) / 14)},
          {c: R.ok, t: '代码任务：条件接受率', sub: '第 1 位 0.87 → 往后降到 0.78 · DSpark 论文测', a: clamp((f - b[4]) / 14)},
        ],
        {a: clamp((f - b[3] - 10) / 14)},
      );
      src(
        g,
        f >= b[3] ? 'DSpark 论文 Figure 2（Qwen3-4B，测 DFlash）· 中间柱高为示意' : 'DFlash 论文 Table 1（H200 · Transformers 后端）、Table 3',
        clamp(f / 14),
      );
    }}
  />
);
