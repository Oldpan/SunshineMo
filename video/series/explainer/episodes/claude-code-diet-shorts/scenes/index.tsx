// Scene registry for 怎么别让 Claude Code 越用越蠢（竖屏）. Scene files sit beside this one and import the renderer as
// '@atv/lib/...'; common.tsx re-exports the shared pop kit (registers theme `pop`).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import {Hook} from './hook';
import {Notebook} from './notebook';
import {Fight} from './fight';
import {Contract} from './contract';
import {Judge} from './judge';
import {Diet} from './diet';
import {Outro} from './outro';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'claude-code-diet-shorts';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  hook: Hook,
  notebook: Notebook,
  fight: Fight,
  contract: Contract,
  judge: Judge,
  diet: Diet,
  outro: Outro,
};

export {poster} from './poster';
export * from './common';
