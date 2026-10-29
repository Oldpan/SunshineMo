// Ending: the five drafters side by side, two caveats, the outro, and the cover (poster).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Scene} from '@atv/lib/types';
import {IsoCanvas} from '../../../shared/iso/iso';
import {
  back,
  belt,
  bigTower,
  board,
  camAt,
  card,
  clamp,
  drafterBox,
  eio,
  eo,
  FONT,
  gate,
  haloText,
  IsoScene,
  L,
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
import {TECH} from './dflash2';

// ------------------------------------------------------------------ five mini stations (local coords, about ±3.5)
const plat = (iso: any, c: string) => {
  iso.box(-3.5, -3.5, -0.6, 7, 7, 0.6, tri(c), {layer: 0});
  iso.box(-3.3, -3.3, -0.05, 6.6, 6.6, 0.05, T3.board, {layer: 0});
};
const miniPress = (iso: any, n = 8, fill: (i: number) => string[] = () => T3d.draft) => {
  for (let i = 0; i < n; i++) iso.box(-2.9 + i * 0.75, 0.6, 0, 0.6, 0.6, 0.55, i === 0 ? T3d.bonus : fill(i));
  iso.box(-3.3, 0.2, 0, 0.4, 1.4, 2.8, T3.drafter);
  iso.box(3.1 - 0.4 + 0.3, 0.2, 0, 0.4, 1.4, 2.8, T3.drafter);
  iso.box(-3.3, 0.2, 2.0, 6.6, 1.4, 0.8, T3.drafter, {layer: 2});
};
const ST: ((iso: any, f: number) => void)[] = [
  // MTP: built into the model
  (iso) => {
    tower(iso, -1.5, -1.5, 0, 3, 3, 5, T3.target, {fh: 0.6, gap: 0.12});
    for (let i = 0; i < 3; i++) iso.box(-1.4 + i * 1, -0.6, 3.6, 0.8, 1.2, 0.7, i === 0 ? T3.target : T3.drafter);
  },
  // EAGLE-3: a one-layer add-on, layer by layer into a tree
  (iso) => {
    iso.box(-3, -2.6, 0, 2.6, 2.6, 0.6, T3.drafter);
    const lv = [[0], [-0.8, 0.8], [-1.4, 0, 1.4], [-0.8, 0.8]];
    lv.forEach((ys, d) =>
      ys.forEach((y) => {
        const x = -1.6 + d * 1.3;
        iso.box(x, 1.2 + y, 0, 0.7, 0.7, 0.6, d === 1 && y > 0 ? T3d.ok : d === 0 ? T3d.ok : T3d.draft);
      }),
    );
  },
  // DFlash: one stroke, one block
  (iso) => miniPress(iso),
  // DSpark: DFlash + Markov head + confidence + scheduler
  (iso, f) => {
    miniPress(iso);
    iso.box(-2.2 + ((f * 0.03) % 1) * 5, 1.5, 0, 0.9, 0.5, 0.45, tri(TECH.dspark));
    [0.9, 0.7, 0.45].forEach((v, i) => iso.box(-2.1 + i * 0.75, -1.4, 0, 0.4, 0.4, 2.4 * v, T3.ok));
    iso.box(1.4, -2.6, 0, 1.4, 1.4, 1.2, tri('#9C8455'));
  },
  // DFlash 2: pick a path through the candidates
  (iso) => {
    miniPress(iso, 8, () => T3d.ok);
    const path = [0, 1, 0, 2, 1];
    for (let i = 0; i < 5; i++)
      for (let r = 0; r < 3; r++) iso.box(-2.6 + i * 1.2, -3 + r * 0.95, 0, 0.7, 0.7, 0.4, path[i] === r ? T3d.ok : tri('#F0D9A6'));
  },
];
const NAMES = ['MTP', 'EAGLE-3', 'DFlash', 'DSpark', 'DFlash 2'];
const DATES = ['2024', '2025.03', '2026.02', '2026.07', '2026.08'];
const LINES = [
  ['模型自带', '预训练时一起长出来'],
  ['外挂一层', '逐层猜，长成一棵树'],
  ['一次压出一整块', '特征注入每一层'],
  ['串行修正 + 置信度', '按负载决定核几个'],
  ['在候选里', '选一条连贯的路'],
];
const COLS = [TECH.mtp, TECH.eagle, TECH.dflash, TECH.dspark, TECH.dflash2];
const SP = 8.2;
export const Compare: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(0, 0, 1, 960, 560, 26)}
    draw={({iso, f, b}) => {
      const act = [1, 2, 3, 4, 5].map((k) => f >= (b[k] ?? 1e9)).lastIndexOf(true);
      for (let i = 0; i < 5; i++) {
        const p = clamp((f - i * 6) / 20);
        if (p <= 0) continue;
        const up = act === i ? 0.6 * eo(clamp((f - b[i + 1]) / 14)) : 0;
        iso.push((i - 2) * SP, -(i - 2) * SP, up - (1 - back(p, 2)) * 3, 0, 1);
        iso.desat = act >= 0 && act !== i ? 0.7 : 0;
        plat(iso, COLS[i]);
        ST[i](iso, f);
        iso.desat = 0;
        iso.pop();
      }
    }}
    over={({iso, g, f, b}) => {
      text(g, '放回同一块板上', 96, 128, {size: 56, weight: 700, a: clamp(f / 12)});
      const act = [1, 2, 3, 4, 5].map((k) => f >= (b[k] ?? 1e9)).lastIndexOf(true);
      for (let i = 0; i < 5; i++) {
        const [sx, sy] = iso.P((i - 2) * SP, -(i - 2) * SP, 0);
        const a = clamp((f - i * 6 - 10) / 16);
        const dim = act >= 0 && act !== i ? 0.5 : 1;
        text(g, NAMES[i], sx, sy - 220, {size: 32, weight: 700, a: a * dim, align: 'center', color: R.ink});
        text(g, DATES[i], sx, sy - 188, {size: 20, weight: 600, a: a * dim, align: 'center', color: R.dim});
        const la = clamp((f - (b[i + 1] ?? 1e9)) / 14);
        if (la > 0) {
          text(g, LINES[i][0], sx, sy + 170, {size: 24, weight: 700, a: la * dim, align: 'center'});
          text(g, LINES[i][1], sx, sy + 204, {size: 22, weight: 500, a: la * dim, align: 'center', color: R.dim});
        }
      }
    }}
  />
);

// ------------------------------------------------------------------ caveats
const NUMS: [string, string, string][] = [
  ['MTP', '1.8× TPS', 'DeepSeek-V3 自家'],
  ['EAGLE-3', '4.44×', 'Llama-3.1-8B'],
  ['DFlash', '4.86×', 'Qwen3-8B · H200'],
  ['DSpark', '+60%～85%', 'V4-Flash 线上'],
  ['DFlash 2', '3.43×', 'Qwen3.8-27B · H200'],
];
const SLOPES: [string, number, number, string, string, string, number][] = [
  ['DFlash', 5.1, 2.8, '并发 1', '32', 'B200 · Math500', 0],
  ['DFlash 2', 3.43, 1.45, '并发 1', '32', 'H200 · GSM8K（MT-Bench 只有 1.01×）', -40],
  ['EAGLE-3', 1.81, 1.38, '批量 2', '64', 'H100 · MT-Bench', 30],
];
export const Caveat: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(0, 0, 0, 960, 540, 30)}
    draw={() => undefined}
    over={({g, f, b}) => {
      text(g, '两点提醒', 96, 128, {size: 56, weight: 700, a: clamp(f / 12)});
      // 1. numbers from different papers, models, machines
      const q = clamp((f - b[1]) / 16);
      NUMS.forEach(([n, v, sub], i) => {
        const a = clamp(q * 5 - i);
        if (a <= 0) return;
        const x = 96 + i * 350,
          y = 190 + (1 - eo(a)) * 20;
        card(g, x, y, 320, 150, a);
        g.save();
        g.globalAlpha = a;
        g.fillStyle = COLS[i];
        rr(g, x + 20, y + 22, 18, 18, 4);
        g.fill();
        g.restore();
        text(g, n, x + 48, y + 40, {size: 22, weight: 700, a, halo: false});
        text(g, v, x + 20, y + 94, {size: 40, weight: 500, a, halo: false});
        text(g, sub, x + 20, y + 130, {size: 18, weight: 600, color: R.dim, a, halo: false});
        if (i > 0) text(g, '≠', x - 15, y + 90, {size: 30, weight: 700, color: R.bad, a: a * clamp((f - b[1] - 40) / 12), align: 'center', halo: false});
      });
      // 2. speedups shrink as load grows
      const c = clamp((f - b[2]) / 16);
      if (c > 0) {
        const x0 = 240,
          x1 = 760,
          y0 = 860,
          u = 72;
        card(g, 96, 380, 1020, 510, c);
        text(g, '并发一高，加速都会缩水（均为 SGLang 实测）', 124, 430, {size: 28, weight: 700, a: c, halo: false});
        g.save();
        g.globalAlpha = c;
        g.strokeStyle = R.ink;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0 - 40, y0 - 5.6 * u);
        g.lineTo(x0 - 40, y0);
        g.lineTo(x1 + 60, y0);
        g.stroke();
        g.strokeStyle = 'rgba(46,37,34,.25)';
        g.setLineDash([6, 6]);
        g.beginPath();
        g.moveTo(x0 - 40, y0 - u);
        g.lineTo(x1 + 60, y0 - u);
        g.stroke();
        g.restore();
        text(g, '1×（不投机）', x0 - 50, y0 - u - 8, {size: 18, weight: 600, color: R.dim, a: c, halo: false, align: 'right'});
        SLOPES.forEach(([n, v0, v1, l0, l1, cap, dy], i) => {
          const a = clamp((f - b[2] - 10 - i * 14) / 20);
          if (a <= 0) return;
          const col = n === 'DFlash' ? TECH.dflash : n === 'DFlash 2' ? TECH.dflash2 : TECH.eagle;
          const ya = y0 - v0 * u,
            yb = y0 - (v0 + (v1 - v0) * eio(a)) * u;
          g.save();
          g.globalAlpha = c;
          g.strokeStyle = col;
          g.lineWidth = 5;
          g.beginPath();
          g.moveTo(x0, ya);
          g.lineTo(x0 + (x1 - x0) * eio(a), yb);
          g.stroke();
          g.fillStyle = col;
          [[x0, ya], [x0 + (x1 - x0) * eio(a), yb]].forEach(([x, y]) => {
            g.beginPath();
            g.arc(x, y, 8, 0, Math.PI * 2);
            g.fill();
          });
          g.restore();
          text(g, `${v0}×`, x0 - 16, ya + 8, {size: 22, weight: 700, a: c * a, halo: false, align: 'right'});
          text(g, `${n}  ${v1}×`, x1 + 18, yb + 8 + dy, {size: 22, weight: 700, a: c * clamp(a * 2 - 1), halo: false, color: col});
          text(g, `${l0} → ${l1} · ${cap}`, x1 + 18, yb + 32 + dy, {size: 16, weight: 500, a: c * clamp(a * 2 - 1), halo: false, color: R.dim});
        });
      }
      // 3. DSpark's scheduler aims right at this
      const d = clamp((f - b[4]) / 16);
      if (d > 0) {
        card(g, 1150, 380, 674, 200, d);
        g.save();
        g.globalAlpha = d;
        g.fillStyle = TECH.dspark;
        rr(g, 1176, 410, 22, 22, 5);
        g.fill();
        g.restore();
        text(g, 'DSpark 的调度器', 1210, 430, {size: 28, weight: 700, a: d, halo: false});
        text(g, '按当前负载，决定每个请求核几个', 1176, 490, {size: 24, weight: 600, a: d, halo: false});
        text(g, '人少多核，人多少核', 1176, 536, {size: 22, weight: 500, color: R.dim, a: d, halo: false});
      }
      src(g, '各家论文 / 博客原表，测试条件不同 · EAGLE-3 §4.3、DFlash Table 3、DFlash 2 模型卡', clamp((f - b[1]) / 14));
    }}
  />
);

// ------------------------------------------------------------------ outro
const OUT = '先猜后验一字不差'.split('');
export const Outro: React.FC<{scene: Scene}> = () => (
  <IsoScene
    cam={camAt(1, 2, 1, 620, 620, 30)}
    draw={({iso, f}) => {
      board(iso, -15, -9, 30, 16);
      belt(iso, -12, 15, f);
      bigTower(iso);
      gate(iso, 0.5 + 0.5 * Math.sin(f * 0.2));
      drafterBox(iso, f);
      // the words keep flowing through the gate and come out green
      OUT.forEach((ch, i) => {
        const x = -10 + i * 2 + ((f * 0.05) % 2);
        const passed = x + 0.8 > L.gateX + L.gateW / 2;
        token(iso, x, L.beltY + 0.3, L.beltZ, ch, passed ? T3d.ok : T3d.draft, {s: 1.6, pop: clamp((f - i * 4) / 14)});
      });
    }}
    over={({g, f, b}) => {
      const k = clamp((f - b[1]) / 16);
      ['怎么猜', '猜几个', '核几个'].forEach((s, i) => {
        const a = clamp(k * 3 - i);
        if (a <= 0) return;
        card(g, 1250, 260 + i * 130, 520, 100, a);
        text(g, s, 1290, 326 + i * 130, {size: 44, weight: 700, a, halo: false, color: [R.drafter, R.draft, R.target][i]});
      });
      const e = clamp((f - b[2]) / 16);
      if (e > 0) text(g, '下期见', 1250, 720, {size: 56, weight: 700, a: e});
      text(g, '先猜后验，一字不差', 96, 150, {size: 64, weight: 700, a: clamp(f / 14)});
      text(g, '两年五代：MTP → EAGLE-3 → DFlash → DSpark → DFlash 2', 98, 206, {size: 26, weight: 600, color: R.dim, a: clamp((f - b[1]) / 14)});
    }}
  />
);

// ------------------------------------------------------------------ cover: 16:9 and 3:4
export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  const tall = h > w;
  // camAt assumes a 1920×1080 frame: shift the target point by the difference in frame centres
  const cam = tall ? camAt(1, -1, 0, 540 + 420, 1000 - 180, 23) : camAt(1, 0, 2, 1330, 640, 27);
  return (
    <AbsoluteFill>
      <IsoCanvas
        W={w}
        H={h}
        cam={cam}
        draw={(iso) => {
          board(iso, -15, -9, 30, 16);
          belt(iso, -12, 15, 0);
          bigTower(iso, {1: T3.drafter, 4: T3.drafter, 7: T3.drafter});
          gate(iso, 1);
          drafterBox(iso, 0);
          ['天', '气', '很', '好'].forEach((ch, i) => token(iso, -8.6 + i * 2, L.beltY + 0.3, L.beltZ, ch, T3d.draft, {s: 1.6}));
          ['今', '天', '天', '气', '很', '好'].forEach((ch, i) => token(iso, 4.6 + i * 2, L.beltY + 0.3, L.beltZ, ch, T3d.ok, {s: 1.6}));
          token(iso, 4.6 + 6 * 2, L.beltY + 0.3, L.beltZ, '！', T3d.bonus, {s: 1.6, text: '#FBF4E6'});
        }}
        over={(_iso, g) => {
          const x = tall ? 80 : 96;
          const t = (s: string, y: number, size: number, color: string, weight = 700) =>
            haloText(g, s, x, y, {font: `${weight} ${size}px ${FONT}`, color, track: 2, hw: 12});
          if (tall) {
            t('加快 LLM 速度', 190, 76, R.ink);
            t('最快 6 倍', 350, 150, R.drafter);
            t('五种投机解码全解析', 450, 64, R.ink);
            t('先猜后验 · 一字不差', 530, 40, R.dim, 600);
            t('MTP · EAGLE-3 · DFlash · DSpark · DFlash 2', 1360, 32, R.dim, 600);
          } else {
            t('加快 LLM 速度', 210, 80, R.ink);
            t('最快 6 倍', 390, 168, R.drafter);
            t('五种投机解码', 500, 72, R.ink);
            t('全解析', 590, 72, R.ink);
            t('先猜后验 · 一字不差', 680, 40, R.dim, 600);
            t('MTP · EAGLE-3 · DFlash · DSpark · DFlash 2', 1000, 30, R.dim, 600);
          }
        }}
      />
    </AbsoluteFill>
  );
};
