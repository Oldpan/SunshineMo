// Episode helpers for the vertical 「为什么 AI 视频里的人，经常一动不动」 (kling-origin-shorts). The pixel game-level kit
// is shared (video/series/explainer/shared/pixelplay.tsx); this file adds the 鲸鱼娘 poses and the scene frame.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useScene} from '@atv/lib/timing';
import {Sprite} from '@atv/lib/styles';
import {PixelStage, PixelWipe, PP, snap} from '../../../shared/pixelplay';
import stillPx from '../assets.nosync/whale_still_px.png';
import wavePx from '../assets.nosync/whale_wave_px.png';
import dance1Px from '../assets.nosync/whale_dance1_px.png';
import dance2Px from '../assets.nosync/whale_dance2_px.png';
import reportPx from '../assets.nosync/whale_report_px.png';

export * from '../../../shared/pixelplay';
export const WHALE = {still: stillPx, wave: wavePx, dance1: dance1Px, dance2: dance2Px, report: reportPx};
/** dancing: alternate the two dance poses every `p` frames */
export const dance = (f: number, p = 8) => (Math.floor(f / p) % 2 ? WHALE.dance2 : WHALE.dance1);

/** Scene timing: frame, beat starts / lengths, and `at(i, word)` = scene frame where `word` starts in beat i
 *  (linear by character position inside the beat's audio). */
export const useT = () => {
  const f = useCurrentFrame();
  const sc = useScene();
  const b = sc.beats.map((x) => x.from);
  const bd = sc.beats.map((x) => x.duration);
  const at = (i: number, word: string) => {
    const t = sc.beats[i].text;
    const k = Math.max(0, t.indexOf(word));
    return Math.round(b[i] + (bd[i] * k) / Math.max(1, t.length));
  };
  return {f, dur: sc.duration, b, bd, at};
};

/** Pixel room + block wipes at both ends (scenes set data.join so the engine fade stays off). */
export const Screen: React.FC<{children: React.ReactNode; wipeIn?: boolean; wipeOut?: boolean; floorY?: number}> = ({children, wipeIn = true, wipeOut = true, floorY}) => {
  const f = useCurrentFrame();
  const sc = useScene();
  return (
    <PixelStage floorY={floorY}>
      {children}
      {wipeIn && <PixelWipe f={f} mode="in" />}
      {wipeOut && <PixelWipe f={f - (sc.duration - 12)} mode="out" />}
    </PixelStage>
  );
};

// ------------------------------------------------------------------ small pixel clip (used by jobs + cap)
const DOG = ['k.......kk', 'kk.....knk', '.knnnnnnk.', '.knnnnnnk.', '.kk.kk.kk.', '.k..k..k..'];
const WALKER = ['..kkkk..', '.kcccck.', '..kkkk..', '.kbbbbk.', 'kbbbbbbk', 'kcbbbbck', '.kbbbbk.', '.kBkkBk.', '.kBk.kB.', 'kk...kk.'];
const WALK_PAL = {c: PP.skin, B: '#2A5BC4', n: '#7A4A2A'};
/** A little pixel "video": sun, grass, a walker (and a dog) strolling back and forth; `mark` boxes the dog in red,
 *  `scan` sweeps a reading line down the frame. */
export const Clip: React.FC<{f: number; w: number; h: number; dog?: boolean; mark?: boolean; scan?: boolean}> = ({f, w, h, dog, mark, scan}) => {
  const span = w - (dog ? 150 : 70);
  const x = snap(20 + span * (0.5 - 0.5 * Math.cos(f / 45)), 6);
  return (
    <div style={{position: 'relative', width: w, height: h, background: '#8FD3FF', overflow: 'hidden', boxShadow: `0 0 0 4px ${PP.ink}`}}>
      <div style={{position: 'absolute', left: w - 70, top: 18, width: 36, height: 36, background: '#F6C445'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h * 0.32, background: '#56C26A', borderTop: `4px solid ${PP.ink}`}} />
      <div style={{position: 'absolute', left: x, bottom: h * 0.2}}>
        <Sprite rows={WALKER} px={6} pal={WALK_PAL} />
      </div>
      {dog && (
        <div style={{position: 'absolute', left: x + 66, bottom: h * 0.2, outline: mark && Math.floor(f / 6) % 2 ? `5px solid ${PP.pink}` : undefined, outlineOffset: 5}}>
          <Sprite rows={DOG} px={6} pal={{n: '#B98A5E'}} />
        </div>
      )}
      {scan && <div style={{position: 'absolute', left: 0, right: 0, top: snap((f * 4) % h, 4), height: 8, background: 'rgba(255,255,255,.7)'}} />}
    </div>
  );
};
