// Isometric-infographic look for 讲透 episodes (first made for spec-decoding, 2026-10-28).
// The picture is the lemo-opuscar iso engine (./engine.js, Canvas 2D, true isometric, three tones per face) redrawn
// on every Remotion frame: <IsoCanvas draw={(iso, g, f) => ...}/> gets a fresh engine, a cleared canvas with the
// cream ground and dot lattice, and the scene's local frame. Everything the draw callback queues is depth-sorted and
// flushed after it returns; screen-space furniture (pins, rings, cut lines) goes in `over`, drawn after the flush.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {THEMES} from '@atv/lib/theme';
// @ts-ignore — plain JS module
import * as E from './engine.js';

export const {Iso, PAL, tri, pin, inset, ring, cutLine, hatch, haloText, shape, clamp, lerp, seg, ss, eo, eio, back, mix, hex} =
  E as any;
export const FONT: string = (E as any).FONT;

// Light theme for lib/chrome (background colour, dark subtitle box).
THEMES.iso = {bg: '#F2E6D0', bg2: '#F2E6D0', accent: '#5B7FB0', accentSoft: '#DCE4EE', ink: '#2E2522'};

/** Roles keep one hue for the whole film (STYLE.md §3: colour codes meaning). */
export const R = {
  ground: '#F2E6D0',
  paper: '#FBF4E6',
  ink: '#2E2522',
  dim: '#7A6E66',
  target: '#5B7FB0', // the big model's tower
  drafter: '#3E9C9A', // draft machines and the feature pipes that feed them
  draft: '#E3B04B', // draft tokens waiting for the check
  ok: '#6FAF6A', // accepted
  bad: '#D2604C', // rejected
  bonus: '#8E6CC0', // the token the big model adds itself
  belt: '#B8B2A6',
  board: '#E9DCC3',
};
export const T3 = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, tri(v)])) as Record<keyof typeof R, string[]>;

// ------------------------------------------------------------------ fonts
let fontPromise: Promise<void> | null = null;
const loadFonts = () => {
  if (!fontPromise) {
    const f = new FontFace('Jost', `url(${staticFile('fonts/Jost-VF.ttf')})`, {weight: '100 900'});
    fontPromise = f
      .load()
      .then((ff) => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      })
      .catch(() => console.warn('fonts/Jost-VF.ttf missing — run scripts/session_start.sh'))
      .then(() => Promise.all(['600 20px Jost', '400 20px Jost', '700 20px "Noto Sans SC"', '500 20px "Noto Sans SC"'].map((s) => document.fonts.load(s, '大模型A1'))))
      .then(() => undefined);
  }
  return fontPromise;
};

// ------------------------------------------------------------------ canvas
export type Draw = (iso: any, g: CanvasRenderingContext2D, f: number) => void;

/** Cream ground + faint isometric dot lattice that drifts very slowly, so a held shot never reads as a frozen frame. */
export const ground = (g: CanvasRenderingContext2D, f: number, W = 1920, H = 1080) => {
  g.fillStyle = R.ground;
  g.fillRect(0, 0, W, H);
  const sp = 36,
    dx = (f * 0.18) % (sp * 2),
    dy = (f * 0.104) % sp;
  g.fillStyle = 'rgba(46,37,34,0.10)';
  for (let j = -2; j < H / sp + 2; j++)
    for (let i = -2; i < W / (sp * 2) + 2; i++) {
      const x = i * sp * 2 + (j % 2 ? sp : 0) + dx - sp * 2,
        y = j * sp + dy - sp;
      g.beginPath();
      g.arc(x, y, 1.6, 0, Math.PI * 2);
      g.fill();
    }
};

export const IsoCanvas: React.FC<{draw: Draw; over?: Draw; cam?: {x: number; y: number; z: number; k: number}; bg?: boolean; W?: number; H?: number}> = ({
  draw,
  over,
  cam,
  bg = true,
  W = 1920,
  H = 1080,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('iso fonts'));
  useEffect(() => {
    loadFonts().finally(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c || !ready) return;
    const g = c.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    if (bg) ground(g, f, W, H);
    const iso = new Iso(g, W, H);
    if (cam) iso.cam = {...cam};
    draw(iso, g, f);
    iso.flush();
    if (over) over(iso, g, f);
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: W, height: H}} />;
};

// ------------------------------------------------------------------ world helpers
/** One token = one cube with its text on the top face. `pop` 0..1 drops it in from above with a squash. */
export const token = (
  iso: any,
  x: number,
  y: number,
  z: number,
  ch: string,
  t3: string[],
  o: {s?: number; pop?: number; text?: string; size?: number; keep?: boolean} = {},
) => {
  const s = o.s ?? 1.6,
    p = o.pop ?? 1;
  if (p <= 0) return;
  const lift = (1 - eo(clamp(p * 1.4))) * 6,
    sq = p < 1 ? 1 - 0.18 * Math.sin(clamp((p - 0.55) / 0.45) * Math.PI) : 1;
  const h = s * 0.9 * sq;
  iso.box(x, y, z + lift, s, s, h, t3);
  if (ch) {
    // upright screen-space glyph on the top face (isometric type is unreadable for Chinese at this size)
    const cx = x + s / 2,
      cy = y + s / 2,
      cz = z + lift + h;
    iso.add(cx + cy + cz - h / 2 + 0.02, () => {
      const [sx, sy] = iso.L(cx, cy, cz);
      const px = Math.round((o.size ?? 0.62) * s * iso.cam.k * iso.scale());
      const g = iso.g as CanvasRenderingContext2D;
      g.save();
      g.globalAlpha = iso.alpha ?? 1;
      g.font = `700 ${px}px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = o.text ?? R.ink;
      g.fillText(ch, sx, sy + px * 0.04);
      g.restore();
    });
  }
};

/** Stack of floors = a Transformer, one box per layer, small gaps between floors. */
export const tower = (
  iso: any,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  n: number,
  t3: string[],
  o: {fh?: number; gap?: number; hi?: Record<number, string[]>; grow?: number} = {},
) => {
  const fh = o.fh ?? 0.9,
    gap = o.gap ?? 0.18,
    grow = o.grow ?? 1;
  const tops: number[] = [];
  for (let i = 0; i < n; i++) {
    const zi = z + i * (fh + gap);
    tops.push(zi + fh / 2);
    if (i / n > grow) continue;
    iso.box(x, y, zi, w, d, fh, o.hi?.[i] ?? t3);
    if (i < n - 1) iso.box(x + 0.25, y + 0.25, zi + fh, w - 0.5, d - 0.5, gap, tri(hex(mix(t3[2], '#231A2C', 0.25))));
  }
  return tops; // centre heights of each floor
};

/** Screen-space title block with a halo (matches pin typography). */
export const title = (g: CanvasRenderingContext2D, s: string, x: number, y: number, o: {size?: number; color?: string; a?: number; align?: CanvasTextAlign; weight?: number; track?: number} = {}) => {
  if ((o.a ?? 1) <= 0) return;
  g.save();
  g.globalAlpha = o.a ?? 1;
  haloText(g, s, x, y, {font: `${o.weight ?? 700} ${o.size ?? 56}px ${FONT}`, color: o.color ?? R.ink, align: o.align ?? 'left', track: o.track ?? 2, hw: 10});
  g.restore();
};
