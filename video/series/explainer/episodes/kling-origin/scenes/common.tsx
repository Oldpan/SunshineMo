// Episode pieces for 「可灵是如何诞生的」 (Kling Team, arXiv 2611.04916). The dark editing-suite look is the shared
// `editbay` kit (video/series/explainer/shared/editbay.tsx); paper / crayon / flat / pixel chapters use the
// renderer's own style kits (@atv/lib/styles). This file only adds the little mannequin used in monitor demos.
import React from 'react';
import {EB} from '../../../shared/editbay';

export * from '../../../shared/editbay';

/**
 * Abstract mannequin for "a generated clip" in the monitor (no face, no likeness). `swing` is the arm angle in
 * degrees; `bob` lifts the body a few px. Drawn in a 220×300 box.
 */
export const Dummy: React.FC<{swing?: number; bob?: number; color?: string; scale?: number; style?: React.CSSProperties}> = ({
  swing = 0,
  bob = 0,
  color = '#7C86A8',
  scale = 1,
  style,
}) => (
  <svg width={220 * scale} height={300 * scale} viewBox="0 0 220 300" style={{overflow: 'visible', ...style}}>
    <g transform={`translate(0 ${-bob})`}>
      <ellipse cx={110} cy={292} rx={64} ry={8} fill="rgba(0,0,0,0.35)" />
      <rect x={78} y={176} width={22} height={112} rx={11} fill={color} />
      <rect x={120} y={176} width={22} height={112} rx={11} fill={color} />
      <rect x={66} y={86} width={88} height={110} rx={34} fill={color} />
      <g transform={`rotate(${-swing} 146 100)`}>
        <rect x={140} y={92} width={20} height={92} rx={10} fill={color} />
        <circle cx={150} cy={190} r={13} fill="#C9CEDF" />
      </g>
      <rect x={60} y={96} width={20} height={88} rx={10} fill={color} />
      <circle cx={110} cy={56} r={34} fill="#C9CEDF" />
    </g>
  </svg>
);
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
