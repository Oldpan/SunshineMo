// Episode pieces for 「可灵是如何诞生的」 (Kling Team, arXiv 2611.04916). The dark editing-suite look is the shared
// `editbay` kit (video/series/explainer/shared/editbay.tsx); paper / crayon / flat / pixel chapters use the
// renderer's own style kits (@atv/lib/styles). This file adds the light-page helpers below.
import React from 'react';
import {EB} from '../../../shared/editbay';

export * from '../../../shared/editbay';

export {EB};

// ------------------------------------------------------------------ light-page helpers (paper / crayon / flat / pixel)
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useScene} from '@atv/lib/timing';
/** Slow sink + tiny breathing scale so long holds on light pages never read as frozen frames. */
export const Drift: React.FC<{children: React.ReactNode; amt?: number}> = ({children, amt = 10}) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const t = frame / Math.max(scene.duration, 1);
  const s = 1 + 0.025 * t + 0.004 * Math.sin(frame / 40);
  return <AbsoluteFill style={{transform: `translate(${6 * Math.sin(frame / 55)}px, ${-t * (amt + 16)}px) scale(${s})`, transformOrigin: '50% 40%'}}>{children}</AbsoluteFill>;
};
