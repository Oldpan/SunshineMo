// Episode pieces for 「可灵是如何诞生的」 (Kling Team, arXiv 2611.04916). The dark editing-suite look is the shared
// `editbay` kit (video/series/explainer/shared/editbay.tsx); paper / crayon / flat / pixel chapters use the
// renderer's own style kits (@atv/lib/styles). This file only adds the cartoon kid used in monitor demos.
import React from 'react';
import {EB} from '../../../shared/editbay';

export * from '../../../shared/editbay';

/**
 * Cartoon kid for "a generated clip" in the monitor (an original chibi design, no likeness; replaced the faceless
 * mannequin on 2026-11-06 because the user wanted it cuter). `swing` is the front arm's angle from hanging down,
 * in degrees (≈130 = waving overhead); `bob` lifts the body a few px. Drawn in a 220×300 box, feet at y≈288.
 */
export const Dummy: React.FC<{swing?: number; bob?: number; color?: string; scale?: number; style?: React.CSSProperties}> = ({
  swing = 0,
  bob = 0,
  color = '#FF8A3D',
  scale = 1,
  style,
}) => {
  const skin = '#FFD8B5';
  const hair = '#3B2A4D';
  const dark = '#2A2238';
  const shade = `color-mix(in srgb, ${color} 78%, #000)`;
  return (
    <svg width={220 * scale} height={300 * scale} viewBox="0 0 220 300" style={{overflow: 'visible', ...style}}>
      <ellipse cx={110} cy={292} rx={58} ry={8} fill="rgba(0,0,0,0.35)" />
      <g transform={`translate(0 ${-bob})`}>
        {/* legs + shoes */}
        <rect x={88} y={220} width={18} height={60} rx={9} fill="#3C4B7C" />
        <rect x={114} y={220} width={18} height={60} rx={9} fill="#3C4B7C" />
        <ellipse cx={94} cy={284} rx={17} ry={9} fill="#F4F6FB" />
        <ellipse cx={127} cy={284} rx={17} ry={9} fill="#F4F6FB" />
        {/* back arm */}
        <g transform="rotate(14 80 158)">
          <rect x={71} y={150} width={18} height={62} rx={9} fill={shade} />
          <circle cx={80} cy={214} r={11} fill={skin} />
        </g>
        {/* hoodie */}
        <ellipse cx={110} cy={144} rx={40} ry={14} fill={shade} />
        <rect x={68} y={138} width={84} height={94} rx={32} fill={color} />
        <rect x={88} y={194} width={44} height={22} rx={9} fill={shade} opacity={0.7} />
        <path d="M102 150 L100 172 M118 150 L120 172" stroke="#FFF4EA" strokeWidth={3.5} strokeLinecap="round" />
        <circle cx={100} cy={174} r={3} fill="#FFF4EA" />
        <circle cx={120} cy={174} r={3} fill="#FFF4EA" />
        {/* head */}
        <circle cx={57} cy={94} r={9} fill={skin} />
        <circle cx={163} cy={94} r={9} fill={skin} />
        <circle cx={110} cy={88} r={54} fill={skin} />
        <path d="M56 92 C50 42 90 24 116 26 C150 28 170 52 164 92 C152 72 132 62 112 66 C98 58 74 66 56 92 Z" fill={hair} />
        <path d="M112 30 C106 14 120 6 128 14" stroke={hair} strokeWidth={6} strokeLinecap="round" fill="none" />
        <ellipse cx={90} cy={98} rx={7} ry={9} fill={dark} />
        <ellipse cx={130} cy={98} rx={7} ry={9} fill={dark} />
        <circle cx={92.6} cy={94.4} r={2.7} fill="#fff" />
        <circle cx={132.6} cy={94.4} r={2.7} fill="#fff" />
        <ellipse cx={77} cy={114} rx={9} ry={5.5} fill="#FF8F8F" opacity={0.55} />
        <ellipse cx={143} cy={114} rx={9} ry={5.5} fill="#FF8F8F" opacity={0.55} />
        <path d="M102 116 Q110 124 118 116" stroke={dark} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        {/* front arm, pivots at the shoulder */}
        <g transform={`rotate(${-swing} 146 158)`}>
          <rect x={137} y={150} width={18} height={66} rx={9} fill={color} />
          <circle cx={146} cy={220} r={12} fill={skin} />
        </g>
      </g>
    </svg>
  );
};
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
