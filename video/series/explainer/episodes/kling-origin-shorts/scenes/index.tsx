// Scene registry for the vertical 「为什么 AI 视频里的人，经常一动不动」 (kling-origin-shorts): pixel game levels on the
// shared kit video/series/explainer/shared/pixelplay.tsx. Facts: ../kling-origin/source/article.md.
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import {Hook} from './hook';
import {Jobs} from './jobs';
import {Cap} from './cap';
import {CupScene} from './cup';
import {Judge} from './judge';
import {Outro} from './outro';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'kling-origin-shorts';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  hook: Hook,
  jobs: Jobs,
  cap: Cap,
  cup: CupScene,
  judge: Judge,
  outro: Outro,
};

export {poster} from './poster';
