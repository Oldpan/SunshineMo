// The token-factory board and its moving parts, shared by every scene of this episode.
// World: x runs down-right along the belt, y down-left, z up. The big model is a tower of floors (one floor = one
// Transformer layer); drafts are amber cubes that ride the belt through the check gate and come out green (kept),
// red (first miss, knocked off) or grey (discarded after the miss); the big model's own token is violet.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useBeats, useScene} from '@atv/lib/timing';
import {back, clamp, eio, eo, FONT, haloText, hex, IsoCanvas, lerp, mix, PAL, pin, R, seg, ss, T3, title, token, tower, tri} from '../../../shared/iso/iso';

export {back, clamp, eio, eo, FONT, haloText, hex, lerp, mix, PAL, pin, R, seg, ss, T3, title, token, tower, tri};

export const GREY = tri('#C9C1B3');
export const MASK = tri('#F7EFE0');
export const T3d = {
  draft: T3.draft,
  ok: T3.ok,
  bad: T3.bad,
  bonus: T3.bonus,
  grey: GREY,
  mask: MASK,
  target: T3.target,
  drafter: T3.drafter,
};

// ------------------------------------------------------------------ layout
export const L = {
  beltY: 2,
  beltD: 2.2,
  beltZ: 0.35,
  gateX: 1,
  gateW: 2.4,
  slot0: -8.6, // first draft slot before the gate
  after0: 4.6, // first slot after the gate
  step: 2,
  tok: 1.6,
};
export const gateMid = L.gateX + L.gateW / 2;

export const board = (iso: any, x0 = -15, y0 = -9, w = 30, d = 18) => {
  iso.box(x0, y0, -2.4, w, d, 1.0, PAL.soil, {layer: 0});
  iso.box(x0, y0, -1.4, w, d, 1.4, T3.board, {layer: 0});
};
export const belt = (iso: any, x0 = -12, x1 = 15, f = 0) => {
  iso.box(x0, L.beltY, 0, x1 - x0, L.beltD, L.beltZ, T3.belt, {layer: 0});
  // moving slats so the belt reads as running
  const off = (f * 0.06) % 1.5;
  for (let x = x0 + off; x < x1 - 0.3; x += 1.5)
    iso.flat([[x, L.beltY + 0.1, 0], [x + 0.12, L.beltY + 0.1, 0], [x + 0.12, L.beltY + L.beltD - 0.1, 0], [x, L.beltY + L.beltD - 0.1, 0]], L.beltZ + 0.002, '#A8A194', {layer: 0, depth: 500});
};
/** The check gate over the belt, part of the big model (same hue), with a scan light that pulses when `scan` > 0. */
export const gate = (iso: any, scan = 0) => {
  const {gateX: x, gateW: w, beltY: y, beltD: d} = L;
  iso.box(x, y - 0.7, 0, w, 0.7, 3.2, T3.target);
  iso.box(x, y + d, 0, w, 0.7, 3.2, T3.target);
  iso.box(x, y - 0.7, 3.2, w, d + 1.4, 0.7, T3.target);
  iso.box(x + 0.6, -2, 2.6, 1.2, y - 0.7 + 2, 0.6, T3.target); // bridge to the tower
  if (scan > 0) iso.flat([[x + 0.2, y, 0], [x + w - 0.2, y, 0], [x + w - 0.2, y + d, 0], [x + 0.2, y + d, 0]], L.beltZ + 0.01, hex(mix(R.target, '#FFFFFF', 0.55 - 0.25 * scan)), {layer: 0, depth: 600});
};
export const bigTower = (iso: any, hi: Record<number, string[]> = {}, n = 9) => tower(iso, -1, -7, 0, 5, 5, n, T3.target, {hi});

/** Teal draft machine at the head of the belt. */
export const drafterBox = (iso: any, f = 0, o: {x?: number; y?: number; h?: number} = {}) => {
  const x = o.x ?? -14,
    y = o.y ?? 0.6,
    h = o.h ?? 3;
  iso.box(x, y, 0, 4.2, 5, h, T3.drafter);
  const bob = Math.sin(f * 0.25) * 0.08;
  iso.box(x + 0.8, y + 1, h, 2.6, 3, 1.1 + bob, tri('#57B3B0'));
};

/** Dashed feature pipe from a tower floor to a point (all in world units). */
export const pipe = (iso: any, floorZ: number, k: number, to: [number, number, number], a = 1, o: {x0?: number; lw?: number; f?: number} = {}) => {
  if (a <= 0) return;
  const x0 = o.x0 ?? 0.2 + k * 1.3,
    h = Math.max(to[2], 5.2 + k * 0.45);
  const pts: [number, number, number][] = [
    [x0, -2, floorZ],
    [x0, -0.6 - k * 0.5, floorZ],
    [x0, -0.6 - k * 0.5, h],
    [to[0], -0.6 - k * 0.5, h],
    [to[0], to[1], h],
    [to[0], to[1], to[2]],
  ];
  // reveal along the path
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]));
  const total = segs.reduce((s, v) => s + v, 0);
  let rem = total * clamp(a);
  const out = [pts[0]];
  for (let i = 0; i < segs.length && rem > 0; i++) {
    const t = Math.min(1, rem / segs[i]);
    out.push([lerp(pts[i][0], pts[i + 1][0], t), lerp(pts[i][1], pts[i + 1][1], t), lerp(pts[i][2], pts[i + 1][2], t)]);
    rem -= segs[i];
  }
  iso.line3(out, R.drafter, o.lw ?? 4, {dash: [10, 6], off: -(o.f ?? 0) * 0.8, layer: 2});
};

// ------------------------------------------------------------------ one draft-and-check round
export type RoundOpts = {
  chars: string[]; // drafts, left to right
  ok: number; // how many are accepted before the first miss (== chars.length: all accepted)
  fix: string; // the big model's own token: the correction at the miss, or the bonus after a full accept
  mode?: 'seq' | 'par'; // drafts appear one by one or all at once
  x0?: number; // first slot x before the gate
  step?: number;
  emerge?: number; // frames per draft (seq)
  travel?: number; // frames the tray takes through the gate
  y?: number;
  s?: number; // cube size
  go?: number; // frame the tray starts moving (default: right after the drafts appear)
  okAt?: number; // frame the accepted drafts turn green (default: as they pass the gate)
  badAt?: number; // frame the miss and the rest turn red / grey (default: as they pass the gate)
  missAt?: number; // frame the miss leaves the belt
  fixAt?: number; // frame the big model's token lands
  keepAfter?: boolean; // keep the accepted cubes on the belt after the round (default true)
};
/** Draws one round at local frame t; returns the frame at which the round is finished. */
export const round = (iso: any, t: number, o: RoundOpts) => {
  const n = o.chars.length,
    step = o.step ?? L.step,
    x0 = o.x0 ?? L.slot0,
    y = o.y ?? L.beltY + 0.3,
    s = o.s ?? L.tok;
  const em = o.emerge ?? 9,
    emergeEnd = o.mode === 'par' ? 14 : n * em + 4,
    travel = o.travel ?? 46,
    t1 = o.go ?? emergeEnd + 6;
  const shift = gateMid + 1.2 - x0; // the first slot ends just past the gate
  const mv = eio(seg(t, t1, t1 + travel));
  const tDone = t1 + travel;
  for (let i = 0; i < n; i++) {
    const pop = o.mode === 'par' ? seg(t, i * 0.6, 12 + i * 0.6) : seg(t, i * em, i * em + 11);
    if (pop <= 0) continue;
    let x = x0 + i * step + shift * mv,
      yy = y,
      z = L.beltZ;
    const passed = x + s / 2 > gateMid;
    let t3 = T3d.draft;
    if (passed && i < o.ok && t >= (o.okAt ?? -1e9)) t3 = T3d.ok;
    if (passed && i >= o.ok && t >= (o.badAt ?? -1e9)) t3 = i === o.ok ? T3d.bad : T3d.grey;
    // the miss and everything after it leave the belt sideways
    if (i >= o.ok && passed) {
      const tc = (o.missAt ?? t1 + travel * 0.55) + (i - o.ok) * 2;
      const k = eo(seg(t, tc, tc + 16));
      yy = y + k * (3.4 + (i - o.ok) * 0.3);
      z = L.beltZ * (1 - k);
      if (seg(t, tc + 16, tc + 40) >= 1) continue;
    }
    token(iso, x, yy, z, o.chars[i], t3, {pop, s, text: t3 === T3d.grey ? '#8A8178' : R.ink});
  }
  // the big model's own token lands at the miss (or after the last draft)
  const fx = x0 + o.ok * step + shift;
  const fa = o.fixAt ?? tDone - 4;
  const fp = seg(t, fa, fa + 16);
  if (fp > 0) token(iso, fx, y, L.beltZ, o.fix, T3d.bonus, {pop: fp, s, text: '#FBF4E6'});
  return Math.max(tDone, fa) + 16;
};

/** Isotype stack of output cubes (one per token) at the end of the belt. n may be fractional while popping. */
export const stack = (iso: any, n: number, x = 13.2, y = -2.4, cols = 4, colours?: (i: number) => string[]) => {
  for (let i = 0; i < Math.ceil(n); i++) {
    const p = clamp(n - i);
    const c = i % cols,
      r = Math.floor(i / cols) % 4,
      l = Math.floor(i / (cols * 4));
    const lift = (1 - back(p, 2)) * 1.5;
    iso.box(x + c * 0.9, y + r * 0.9, l * 0.7 + lift, 0.75, 0.75, 0.6, colours ? colours(i) : T3.ok);
  }
};

/** A column of `v` cubes (fractional top cube) — numbers drawn as stacked tokens. */
export const cubeBar = (iso: any, x: number, y: number, v: number, t3: string[], p = 1, o: {s?: number; h?: number} = {}) => {
  const s = o.s ?? 1.2,
    h = o.h ?? 0.8,
    shown = v * eo(p);
  for (let i = 0; i < Math.ceil(shown); i++) {
    const frac = clamp(shown - i);
    iso.box(x, y, i * h, s, s, h * frac - 0.04, t3);
  }
};

// ------------------------------------------------------------------ screen-space furniture
export const SRC_Y = 912;
/** One-line source note above the subtitle zone. */
export const src = (g: CanvasRenderingContext2D, s: string, a = 1, x = 96) => {
  if (a <= 0) return;
  g.save();
  g.globalAlpha = a;
  haloText(g, s, x, SRC_Y, {font: `500 20px ${FONT}`, color: R.dim, track: 0.5});
  g.restore();
};
/** Chapter tag top-left: "01  MTP" + date line. */
export const chapter = (g: CanvasRenderingContext2D, num: string, name: string, date: string, a = 1) => {
  if (a <= 0) return;
  g.save();
  g.globalAlpha = a;
  haloText(g, num, 96, 128, {font: `400 64px ${FONT}`, color: R.drafter, track: 1});
  haloText(g, name, 186, 128, {font: `700 60px ${FONT}`, color: R.ink, track: 2, hw: 10});
  haloText(g, date, 98, 176, {font: `500 26px ${FONT}`, color: R.dim, track: 1.5});
  g.restore();
};
/** Plain label with halo at a world point (screen-space text, upright). */
export const label = (iso: any, s: string, x: number, y: number, z: number, o: {size?: number; color?: string; a?: number; align?: CanvasTextAlign; dy?: number; weight?: number} = {}) => {
  if ((o.a ?? 1) <= 0) return;
  const g = iso.g as CanvasRenderingContext2D;
  const [sx, sy] = iso.P(x, y, z);
  g.save();
  g.globalAlpha = o.a ?? 1;
  haloText(g, s, sx, sy + (o.dy ?? 0), {font: `${o.weight ?? 600} ${o.size ?? 26}px ${FONT}`, color: o.color ?? R.ink, align: o.align ?? 'center', track: 1});
  g.restore();
};
/** Rounded legend card in screen space (pale card, ink border), returns nothing. */
export const card = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a = 1) => {
  if (a <= 0) return;
  g.save();
  g.globalAlpha = a;
  g.fillStyle = 'rgba(46,37,34,.10)';
  rr(g, x + 6, y + 8, w, h, 14);
  g.fill();
  g.fillStyle = R.paper;
  rr(g, x, y, w, h, 14);
  g.fill();
  g.strokeStyle = R.ink;
  g.lineWidth = 2;
  g.stroke();
  g.restore();
};
export const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};
export const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, o: {size?: number; color?: string; a?: number; align?: CanvasTextAlign; weight?: number; halo?: boolean; mono?: boolean} = {}) => {
  if ((o.a ?? 1) <= 0 || !s) return 0;
  g.save();
  g.globalAlpha = o.a ?? 1;
  const w = haloText(g, s, x, y, {
    font: `${o.weight ?? 600} ${o.size ?? 28}px ${o.mono ? '"JetBrains Mono", monospace' : FONT}`,
    color: o.color ?? R.ink,
    align: o.align ?? 'left',
    halo: o.halo ?? true,
    track: 0.5,
  });
  g.restore();
  return w;
};

// ------------------------------------------------------------------ scene shell
/** f = scene frame, b[i] = frame at which narration line i starts. */
export type Ctx = {iso: any; g: CanvasRenderingContext2D; f: number; b: number[]};
export const IsoScene: React.FC<{
  cam: {x: number; y: number; z: number; k: number} | ((f: number, b: number[]) => {x: number; y: number; z: number; k: number});
  draw: (c: Ctx) => void;
  over?: (c: Ctx) => void;
}> = ({cam, draw, over}) => {
  const f = useCurrentFrame();
  // useBeats() gives frames since each beat started; scenes here want each beat's start frame
  const b = useBeats().map((v) => f - v);
  const c0 = typeof cam === 'function' ? cam(f, b) : cam;
  // a slow push-in over the whole scene keeps long holds alive (house rule: freezedetect n=0.0005 d=0.5 stays quiet)
  const p = f / Math.max(useScene().duration, 1);
  const c = {...c0, k: c0.k * (1 + 0.03 * p)};
  return (
    <AbsoluteFill>
      <IsoCanvas cam={c} draw={(iso, g, ff) => draw({iso, g, f: ff, b})} over={over ? (iso, g, ff) => over({iso, g, f: ff, b}) : undefined} />
    </AbsoluteFill>
  );
};

/** Interpolate cameras: log zoom so pushes feel even. */
export const camLerp = (a: {x: number; y: number; z: number; k: number}, c: {x: number; y: number; z: number; k: number}, t: number) => {
  const e = eio(t);
  return {x: lerp(a.x, c.x, e), y: lerp(a.y, c.y, e), z: lerp(a.z, c.z, e), k: Math.exp(lerp(Math.log(a.k), Math.log(c.k), e))};
};
export const CAM_WIDE = {x: -1, y: -1, z: 2.6, k: 30};

// ------------------------------------------------------------------ layout zones
// Diorama on the left ~60 %, legend cards on the right (x 1250–1840), title top-left, source line above subtitles.
/** Camera that puts world point (wx, wy, wz) at screen (sx, sy) with zoom k. */
export const camAt = (wx: number, wy: number, wz: number, sx: number, sy: number, k: number) => {
  // sx = 960 + ((wx - cx) - (wy - cy)) * C30 * k ; sy = 540 + (((wx - cx) + (wy - cy)) / 2 - (wz - cz)) * k
  const C30 = Math.cos(Math.PI / 6);
  const u = (sx - 960) / (C30 * k); // (wx - cx) - (wy - cy)
  const v = (sy - 540) / k; // ((wx - cx) + (wy - cy)) / 2 - (wz - cz), take cz = wz
  const a = v + u / 2,
    b2 = v - u / 2; // wx - cx, wy - cy
  return {x: wx - a, y: wy - b2, z: wz, k};
};
export const PANEL_X = 1250,
  PANEL_W = 590;
/** Legend card on the right: rows of [colour chip, text], row i shown when a[i] > 0. */
export const legend = (
  g: CanvasRenderingContext2D,
  y: number,
  rows: {c?: string; t: string; sub?: string; a: number; size?: number}[],
  o: {x?: number; w?: number; head?: string; a?: number} = {},
) => {
  const x = o.x ?? PANEL_X,
    w = o.w ?? PANEL_W;
  const vis = rows.filter((r) => r.a > 0);
  const a0 = o.a ?? (vis.length ? 1 : 0);
  if (a0 <= 0) return;
  let h = 36 + (o.head ? 52 : 0);
  rows.forEach((r) => (h += r.sub ? 84 : 52));
  card(g, x, y, w, h, a0);
  let yy = y + 30;
  if (o.head) {
    text(g, o.head, x + 28, yy + 22, {size: 30, weight: 700, a: a0, halo: false});
    yy += 52;
  }
  rows.forEach((r) => {
    const a = clamp(r.a);
    if (a > 0) {
      if (r.c) {
        g.save();
        g.globalAlpha = a;
        g.fillStyle = r.c;
        rr(g, x + 28, yy + 2, 26, 26, 5);
        g.fill();
        g.restore();
      }
      text(g, r.t, x + (r.c ? 70 : 28), yy + 25, {size: r.size ?? 27, weight: 600, a, halo: false});
      if (r.sub) text(g, r.sub, x + (r.c ? 70 : 28), yy + 60, {size: 22, weight: 500, color: R.dim, a, halo: false});
    }
    yy += r.sub ? 84 : 52;
  });
};
