// Episode pieces for "Super-agent 设计探索" (DeepSeek Harness 团队). The look is the shared `console` kit
// (video/series/explainer/shared/console.tsx); brand marks come from the engine's lib/brand (DeepSeek whale from the
// official docs logo, GitHub mark from Primer Octicons).
export * from '../../../shared/console';
export {DeepSeekWhale, DS_BLUE} from '@atv/lib/brand/deepseek';
export {GitHubMark} from '@atv/lib/brand/github';
export {useBeats} from '@atv/lib/timing';
export {useCurrentFrame} from 'remotion';
import React from 'react';
import {GitHubMark} from '@atv/lib/brand/github';
import {Chip, V} from '../../../shared/console';

/** Channel chip: IM or GitHub (with the official mark). */
export const Ch: React.FC<{c: 'IM' | 'GitHub' | string; size?: number}> = ({c, size = 16}) =>
  c === 'GitHub' ? (
    <Chip color={V.dim} size={size}>
      <GitHubMark size={size + 2} color={V.dim} /> GitHub
    </Chip>
  ) : (
    <Chip color={V.cyan} size={size}>
      {c}
    </Chip>
  );

/** Source line text for the article. */
export const SRC = '原文：DeepSeek Harness 团队《Super-agent 设计探索：迈向更自主的 Agent 系统》';
