// Pixel game-level kit for explainer scenes (first used by the vertical 「为什么 AI 视频里的人，经常一动不动」,
// kling-origin-shorts, 2026-11-07). Builds on the engine's pixel style (@atv/lib/styles: PixelText / PixelPanel /
// PixelWindow / PixelBar / Sprite / PX) and adds what a "game level" needs:
//   PixelStage   dark grid room with a tiled floor; the grid and floor scroll every frame (passes freezedetect)
//   PixelWipe    block dissolve used at both ends of a scene, so scenes hand over like game screens
//   LevelBanner  「LEVEL n」 + big title; Tag / Bubble / Hearts / Stars / FloatUp / Credit small parts
//   Bot          the little TV-bot "understanding model" (same sprite as the horizontal cold open), moods ok/happy/sad
//   Man / Cup / Table / Door  a side-view pixel man with poseable arm and walk cycle, for tiny story beats
//   Hand6 / Warn more sprites; pxPop / blink / typed helpers. Size-agnostic: pass w/h (default 1080×1920).
import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {PixelPanel, PixelText, PX, Sprite} from '@atv/lib/styles';

export {PX};
export const PP = {bg: '#1E1838', floor: '#3B2F6B', ink: PX.ink, cream: '#FFFCF4', pink: '#F0566A', skin: '#FBD9B5'};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
/** steppy pixel pop: 0 → 0.6 → 1.15 → 1 over three frames (scale); 0 before f0 */
export const pxPop = (f: number, f0: number) => (f < f0 ? 0 : f < f0 + 1 ? 0.6 : f < f0 + 2 ? 1.15 : 1);
/** on/off blink with period p frames (true for the first half) */
export const blink = (f: number, p = 12) => Math.floor(f / (p / 2)) % 2 === 0;
/** typewriter: first n characters of text after f0 at cps chars/second */
export const typed = (f: number, text: string, cps = 24, f0 = 0) => Array.from(text).slice(0, Math.max(0, Math.floor(((f - f0) / 30) * cps))).join('');
/** steppy move: value snaps to a grid of `step` px so motion reads as pixel animation */
export const snap = (v: number, step = 6) => Math.round(v / step) * step;

/** light outline for ink-outlined sprites drawn straight on the dark stage (ink on #1E1838 is nearly invisible) */
export const outline = (c = '#FFFCF4', w = 4): React.CSSProperties => ({filter: `drop-shadow(${w}px 0 0 ${c}) drop-shadow(-${w}px 0 0 ${c}) drop-shadow(0 ${w}px 0 ${c}) drop-shadow(0 -${w}px 0 ${c})`});

// ------------------------------------------------------------------ sprites
/** Extra sprites (rows use the engine Sprite palette; pass `pal={PP_PAL}` for the bot's screen colours). */
export const PP_SP: Record<string, string[]> = {
  bot: ['........kk........', '.......kyyk.......', '........kk........', '........kk........', '..kkkkkkkkkkkkkk..', '.kllllllllllllllk.', 'klkkkkkkkkkkkkkklk', 'klkmmmmmmmmmmmmklk', 'klkmmwwmmmmwwmmklk', 'klkmmwkmmmmwkmmklk', 'klkmmmmmmmmmmmmklk', 'klkmpmmmkkmmmpmklk', 'klkmmmmmmmmmmmmklk', 'klkkkkkkkkkkkkkklk', '.kllllllllllllllk.', '..kkkkkkkkkkkkkk..', '....kkk....kkk....', '...kkkk....kkkk...'],
  happy: ['........kk........', '.......kyyk.......', '........kk........', '........kk........', '..kkkkkkkkkkkkkk..', '.kllllllllllllllk.', 'klkkkkkkkkkkkkkklk', 'klkmmmmmmmmmmmmklk', 'klkmmmwmmmmwmmmklk', 'klkmmwmwmmwmwmmklk', 'klkmmmmmmmmmmmmklk', 'klkmpmmkkkkmmpmklk', 'klkmmmmmkkmmmmmklk', 'klkkkkkkkkkkkkkklk', '.kllllllllllllllk.', '..kkkkkkkkkkkkkk..', '....kkk....kkk....', '...kkkk....kkkk...'],
  arrow: ['kkkkkkk...', 'kyyyyk....', 'kyyyk.....', 'kyyyyk....', 'kykyyyk...', 'kk.kyyyk..', 'k...kyyyk.', '.....kyyyk', '......kyyk', '.......kk.'],
  spark: ['...k...', '...y...', '.......', 'ky.w.yk', '.......', '...y...', '...k...'],
  eye: ['...kkkkkk...', '.kkwwwwwwkk.', 'kwwwwkkwwwwk', 'kwwwkbbkwwwk', 'kwwwkbbkwwwk', 'kwwwwkkwwwwk', '.kkwwwwwwkk.', '...kkkkkk...'],
  film: ['kkkkkkkkkkkk', 'kwkwkwkwkwkk', 'kkkkkkkkkkkk', 'kllllllllllk', 'kllbbllllllk', 'kllbbbbllllk', 'kllbbllllllk', 'kllllllllllk', 'kkkkkkkkkkkk', 'kwkwkwkwkwkk', 'kkkkkkkkkkkk'],
  sad: ['........kk........', '.......kyyk.......', '........kk........', '........kk........', '..kkkkkkkkkkkkkk..', '.kllllllllllllllk.', 'klkkkkkkkkkkkkkklk', 'klkmmmmmmmmmmmmklk', 'klkmmwwmmmmwwmmklk', 'klkmmwkmmmmwkmmklk', 'klkmmmmmmmmmmmmklk', 'klkmpmmmkkmmmpmklk', 'klkmmmmkkkkmmmmklk', 'klkkkkkkkkkkkkkklk', '.kllllllllllllllk.', '..kkkkkkkkkkkkkk..', '....kkk....kkk....', '...kkkk....kkkk...'],
  cup: ['kkkkk..', 'knnnkkk', 'kwwwk.k', 'kwwwkkk', 'kwwwk..', '.kkk...'],
  warn: ['.....k.....', '....kyk....', '....kyk....', '...kykyk...', '...kykyk...', '..kyykyyk..', '..kyykyyk..', '.kyyyyyyyk.', '.kyyykyyyk.', 'kyyyyyyyyyk', 'kkkkkkkkkkk'],
  dust: ['k.....k', '..k.k..', '.k...k.', '...k...', 'k.....k'],
  // side-view man facing right: head + torso; legs and arm are separate rows so they can animate
  manTop: ['...kkkkk....', '..knnnnnk...', '.knnnnnnnk..', '.knnnncccck.', '.knnncckcck.', '.knnccccccck', '..kcccccckk.', '...kkcccck..', '.....kcck...', '...kkbbbkk..', '..kbbbbbbbk.', '..kbbbbbbbk.', '..kbbbbbbbk.', '..kbbbbbbbk.', '..kbbbbbbbk.', '..kkkkkkkkk.'],
  legsStand: ['...kBBkBBk..', '...kBBkBBk..', '...kBBkBBk..', '...kBBkBBk..', '...kkkkkkkk.', '...kkkkkkkk.'],
  legsWalk: ['...kBBBBBk..', '..kBBk.kBBk.', '..kBk...kBk.', '.kBBk...kBBk', '.kkkk...kkkk', '............'],
  armDown: ['kbk', 'kbk', 'kbk', 'kbk', 'kck', 'kkk'],
  armFwd: ['kkkkkkkk', 'kbbbbbcc', 'kkkkkkkk'],
  armMouth: ['...kkk', '...kck', '...kbk', '...kbk', 'kkkkbk', 'kbbbbk', 'kkkkkk'],
};
export const PP_PAL = {m: '#1B2350', l: '#BDE3FF', b: '#2A5BC4'};
const MAN_PAL = {c: PP.skin, b: PX.blue, B: '#2A5BC4', n: '#7A4A2A'};

/** A hand (palm view) with `lens.length` fingers of the given lengths, 2 art-pixels wide each — six by default,
 *  for "手指多一根". Skin is palette letter c, the sleeve b. */
export const hand6 = (lens: number[] = [4, 6, 7, 7, 6, 5]): string[] => {
  const n = lens.length;
  const w = n * 3 + 1;
  const top = Math.max(...lens);
  const rows: string[] = [];
  for (let r = 0; r < top; r++) {
    let row = '';
    for (let x = 0; x < w; x++) {
      const i = Math.floor(x / 3);
      const sep = x % 3 === 0;
      const start = top - (lens[Math.min(i, n - 1)] ?? 0);
      const startL = top - (lens[i - 1] ?? 0);
      if (sep) row += r >= Math.min(start, i > 0 ? startL : top) || r >= start ? 'k' : '.';
      else row += r === start ? 'k' : r > start ? 'c' : '.';
    }
    rows.push(row);
  }
  const palm = 'k' + 'c'.repeat(w - 2) + 'k';
  const base = '.' + 'k'.repeat(w - 2) + '.';
  const pad = Math.floor((w - 9) / 2);
  const wrist = '.'.repeat(pad) + 'kbbbbbbbk' + '.'.repeat(w - pad - 9);
  return [...rows, palm, palm, palm, palm, '.' + 'k' + 'c'.repeat(w - 4) + 'k' + '.', base, wrist, wrist];
};

// ------------------------------------------------------------------ stage
/** Dark pixel room: grid that scrolls diagonally, a tiled floor whose seams slide, twinkling plus-stars. */
export const PixelStage: React.FC<{w?: number; h?: number; floorY?: number; children?: React.ReactNode; seed?: number}> = ({w = 1080, h = 1920, floorY = 1180, children, seed = 3}) => {
  const f = useCurrentFrame();
  const g = (f * 0.75) % 48;
  let s = seed * 9301 + 49297;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const stars = Array.from({length: 16}, () => ({x: Math.round((r() * (w - 60)) / 6) * 6, y: Math.round((200 + r() * (floorY - 260)) / 6) * 6, ph: Math.floor(r() * 40), u: 6 + 3 * Math.floor(r() * 2)}));
  return (
    <AbsoluteFill style={{background: PP.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -48, top: -48, width: w + 96, height: h + 96, transform: `translate(${g}px, ${g}px)`, backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 4px, transparent 4px), linear-gradient(90deg, rgba(255,255,255,.05) 4px, transparent 4px)', backgroundSize: '48px 48px'}} />
      {stars.map((st, i) => {
        const on = Math.floor((f + st.ph) / 10) % 4 !== 0;
        return (
          <div key={i} style={{position: 'absolute', left: st.x, top: st.y, opacity: on ? 0.55 : 0.15}}>
            <div style={{position: 'absolute', left: st.u, top: 0, width: st.u, height: st.u * 3, background: '#FFF3B0'}} />
            <div style={{position: 'absolute', left: 0, top: st.u, width: st.u * 3, height: st.u, background: '#FFF3B0'}} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: floorY, bottom: 0, background: PP.floor, borderTop: `8px solid ${PP.ink}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -96, top: 0, right: -96, bottom: 0, transform: `translateX(${-((f * 1.5) % 96)}px)`, backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,.25) 6px, transparent 6px), linear-gradient(rgba(0,0,0,.18) 6px, transparent 6px)', backgroundSize: '96px 96px'}} />
      </div>
      {children}
    </AbsoluteFill>
  );
};

/** Block dissolve. mode "in": the screen starts covered and blocks drop out over `dur` frames; "out": blocks fill in. */
export const PixelWipe: React.FC<{f: number; mode: 'in' | 'out'; dur?: number; w?: number; h?: number; cell?: number; color?: string}> = ({f, mode, dur = 12, w = 1080, h = 1920, cell = 120, color = PP.ink}) => {
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const p = clamp01(f / dur);
  if ((mode === 'in' && p >= 1) || (mode === 'out' && p <= 0)) return null;
  const blocks: React.ReactNode[] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      // diagonal sweep with a little hash jitter
      const k = ((x + y) / (cols + rows - 2)) * 0.7 + (((x * 7 + y * 13) % 10) / 10) * 0.3;
      const covered = mode === 'in' ? p < k : p > k;
      if (covered) blocks.push(<div key={`${x}-${y}`} style={{position: 'absolute', left: x * cell, top: y * cell, width: cell, height: cell, background: color}} />);
    }
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{blocks}</AbsoluteFill>;
};

// ------------------------------------------------------------------ text parts
export const P: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 36, color = PP.cream, style}) => (
  <PixelText size={size} color={color} style={style}>
    {children}
  </PixelText>
);
/** Big outlined pixel headline (white with ink outline and a coloured drop). */
export const Headline: React.FC<{children: React.ReactNode; size?: number; color?: string; drop?: string; style?: React.CSSProperties}> = ({children, size = 96, color = '#FFFCF4', drop = PP.pink, style}) => {
  const o = Math.max(4, Math.round(size / 16));
  return (
    <PixelText size={size} color={color} style={{letterSpacing: 2, whiteSpace: 'nowrap', textShadow: `${o}px 0 0 ${PP.ink}, -${o}px 0 0 ${PP.ink}, 0 ${o}px 0 ${PP.ink}, 0 -${o}px 0 ${PP.ink}, ${o * 2}px ${o * 2}px 0 ${drop}`, ...style}}>
      {children}
    </PixelText>
  );
};
/** 「LEVEL n」 kicker + big title, centred, popping in at f=0 (pass scene-relative frame minus start). */
export const LevelBanner: React.FC<{f: number; n: number | string; name: string; top?: number; w?: number}> = ({f, n, name, top = 250, w = 1080}) => {
  const s = pxPop(f, 0);
  const s2 = pxPop(f, 3);
  return (
    <div style={{position: 'absolute', left: 0, width: w, top, textAlign: 'center'}}>
      <div style={{transform: `scale(${s})`, opacity: s ? 1 : 0}}>
        <PixelText size={36} color={PX.yellow} style={{letterSpacing: 6, textShadow: `4px 4px 0 ${PP.ink}`}}>
          LEVEL {n}
        </PixelText>
      </div>
      <div style={{marginTop: 4, transform: `scale(${s2})`, opacity: s2 ? 1 : 0}}>
        <Headline size={96}>{name}</Headline>
      </div>
    </div>
  );
};
/** Small solid label. */
export const Tag: React.FC<{children: React.ReactNode; bg?: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = PX.yellow, fg = PP.ink, size = 24, style}) => (
  <div style={{display: 'inline-block', padding: '4px 14px 2px', background: bg, boxShadow: `0 0 0 4px ${PP.ink}, 6px 6px 0 4px rgba(0,0,0,.35)`, whiteSpace: 'nowrap', ...style}}>
    <PixelText size={size} color={fg}>
      {children}
    </PixelText>
  </div>
);
/** Speech bubble with a pixel tail pointing down-left or down-right. */
export const Bubble: React.FC<{children: React.ReactNode; tail?: 'left' | 'right' | 'none'; bg?: string; style?: React.CSSProperties; size?: number}> = ({children, tail = 'left', bg = PP.cream, style, size = 36}) => (
  <div style={{position: 'relative', display: 'inline-block', ...style}}>
    <PixelPanel bg={bg} shadow>
      <div style={{marginTop: -10, marginBottom: -12, whiteSpace: 'nowrap'}}>
        <PixelText size={size}>{children}</PixelText>
      </div>
    </PixelPanel>
    {tail !== 'none' && (
      <div style={{position: 'absolute', [tail]: 36, bottom: -22} as React.CSSProperties}>
        <Sprite rows={tail === 'left' ? ['kkkkkk', 'kwwwwk', 'kwwwk.', 'kwwk..', 'kwk...', 'kk....'] : ['kkkkkk', 'kwwwwk', '.kwwwk', '..kwwk', '...kwk', '....kk']} px={4} pal={{w: bg}} />
      </div>
    )}
  </div>
);
export const Hearts: React.FC<{n: number; total?: number; px?: number}> = ({n, total = 5, px = 5}) => (
  <div style={{display: 'flex', gap: px * 2}}>
    {Array.from({length: total}, (_, i) => (
      <Sprite key={i} name="heart" px={px} pal={i < n ? undefined : {r: '#4A4270', R: '#3A3360', w: '#5A5288'}} />
    ))}
  </div>
);
export const Stars: React.FC<{n: number; total?: number; px?: number}> = ({n, total = 5, px = 5}) => (
  <div style={{display: 'flex', gap: px * 2}}>
    {Array.from({length: total}, (_, i) => (
      <Sprite key={i} name="star" px={px} pal={i < n ? undefined : {y: '#4A4270', o: '#3A3360', w: '#5A5288'}} />
    ))}
  </div>
);
/** "-1" style text that pops and floats up, fading after ~24 frames. */
export const FloatUp: React.FC<{f: number; children: React.ReactNode; color?: string; size?: number}> = ({f, children, color = PP.pink, size = 48}) => {
  if (f < 0 || f > 30) return null;
  return (
    <div style={{transform: `translateY(${-snap(f * 3, 6)}px) scale(${pxPop(f, 0)})`, opacity: f > 22 ? 1 - (f - 22) / 8 : 1}}>
      <PixelText size={size} color={color} style={{textShadow: `4px 4px 0 ${PP.ink}`}}>
        {children}
      </PixelText>
    </div>
  );
};
/** Dim source line on the floor. */
export const Credit: React.FC<{children: React.ReactNode; top?: number; f?: number}> = ({children, top = 1212, f = 99}) => (
  <div style={{position: 'absolute', left: 100, right: 100, top, textAlign: 'center', opacity: clamp01(f / 10) * 0.9}}>
    <PixelText size={24} color="#B7AEDB">
      {children}
    </PixelText>
  </div>
);

// ------------------------------------------------------------------ characters
/** TV-bot "understanding model" (bottom-centre anchor at x, y). */
export const Bot: React.FC<{mood?: 'ok' | 'happy' | 'sad'; px?: number; x: number; y: number; bob?: boolean}> = ({mood = 'ok', px = 8, x, y, bob = true}) => {
  const f = useCurrentFrame();
  const rows = mood === 'happy' ? PP_SP.happy : mood === 'sad' ? PP_SP.sad : PP_SP.bot;
  const dy = bob && Math.floor(f / 10) % 2 ? -px : 0;
  return (
    <div style={{position: 'absolute', left: x - (18 * px) / 2, top: y - 18 * px + dy}}>
      <Sprite rows={rows} px={px} pal={PP_PAL} />
    </div>
  );
};
/** A mascot image (pixelated) placed by its feet: (ax, ay) is the feet point inside the source image. */
export const Mascot: React.FC<{src: string; x: number; y: number; s?: number; ax?: number; ay?: number; flip?: boolean; style?: React.CSSProperties}> = ({src, x, y, s = 0.6, ax = 360, ay = 762, flip, style}) => (
  <Img src={src} style={{position: 'absolute', left: x - ax * s, top: y - ay * s, width: 735 * s, imageRendering: 'pixelated', transform: flip ? 'scaleX(-1)' : undefined, ...style}} />
);
/** Side-view pixel man (left/top at x, y; 12×22 art pixels). */
export const Man: React.FC<{x: number; y: number; px?: number; walk?: boolean; arm?: 'down' | 'fwd' | 'mouth'}> = ({x, y, px = 10, walk, arm = 'down'}) => {
  const A = arm === 'fwd' ? {r: PP_SP.armFwd, c: 5, row: 10} : arm === 'mouth' ? {r: PP_SP.armMouth, c: 6, row: 5} : {r: PP_SP.armDown, c: 5, row: 10};
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 12 * px, height: 22 * px}}>
      <Sprite rows={PP_SP.manTop} px={px} pal={MAN_PAL} style={{position: 'absolute', left: 0, top: 0}} />
      <Sprite rows={walk ? PP_SP.legsWalk : PP_SP.legsStand} px={px} pal={MAN_PAL} style={{position: 'absolute', left: 0, top: 16 * px}} />
      <Sprite rows={A.r} px={px} pal={MAN_PAL} style={{position: 'absolute', left: A.c * px, top: A.row * px}} />
    </div>
  );
};
/** Where the man's hand is for a given arm pose (relative to his x, y), for placing a cup. */
export const manHand = (arm: 'down' | 'fwd' | 'mouth', px = 10): [number, number] => (arm === 'fwd' ? [12 * px, 10 * px] : arm === 'mouth' ? [9 * px, 3 * px] : [5 * px, 13 * px]);
export const Cup: React.FC<{x: number; y: number; px?: number; style?: React.CSSProperties}> = ({x, y, px = 10, style}) => (
  <Sprite rows={PP_SP.cup} px={px} pal={{n: '#7A4A2A'}} style={{position: 'absolute', left: x, top: y, ...style}} />
);
/** Table: top plank at y (top-left x), legs down to floor. */
export const Table: React.FC<{x: number; y: number; w?: number; h?: number}> = ({x, y, w = 200, h = 110}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: 24, background: PX.dirt, boxShadow: `0 0 0 5px ${PP.ink}`}} />
    {[18, w - 38].map((lx) => (
      <div key={lx} style={{position: 'absolute', left: lx, top: 28, width: 20, height: h - 28, background: '#8C6440', boxShadow: `0 0 0 5px ${PP.ink}`}} />
    ))}
  </div>
);
/** Door hinged on its right edge; open 0..1 narrows the panel to show the bright doorway. */
export const Door: React.FC<{x: number; y: number; w?: number; h?: number; open?: number}> = ({x, y, w = 130, h = 260, open = 0}) => {
  const pw = Math.max(18, snap(w * (1 - 0.8 * clamp01(open)), 6));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#FFF3B0', boxShadow: `0 0 0 6px ${PP.ink}`}}>
      <div style={{position: 'absolute', right: 0, top: 0, width: pw, height: h, background: '#9B6B45', boxShadow: `inset 0 0 0 5px ${PP.ink}`}}>
        <div style={{position: 'absolute', left: 14, top: h / 2, width: 14, height: 14, background: PX.yellow, boxShadow: `0 0 0 4px ${PP.ink}`, opacity: open > 0.3 ? 0 : 1}} />
      </div>
    </div>
  );
};
