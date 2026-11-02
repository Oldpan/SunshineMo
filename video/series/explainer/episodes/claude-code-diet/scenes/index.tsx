// Scene registry for 怎么别让 Claude Code 越用越蠢. Scene files sit beside this one and import the renderer as
// '@atv/lib/...'; common.tsx re-exports the shared whiteboard kit (registers theme `whiteboard`).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as intro from './intro';
import * as s1 from './s1';
import * as s2 from './s2';
import * as s4 from './s4';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'claude-code-diet';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  's1-contract': s1.Contract,
  's2-goal': s2.Goal,
  's2-auto': s2.Auto,
  's4-eighty': s4.Eighty,
};

export * from './common';
