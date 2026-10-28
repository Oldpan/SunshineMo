// Scene registry for "Anthropic 把 Agent 的脑和手拆开了：Managed Agents 架构全拆解". Scene files sit beside this one and
// import the renderer as '@atv/lib/...'; the look is the shared `claudeblog` kit (video/series/explainer/shared).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as end from './end';
import * as intro from './intro';
import * as memory from './memory';
import * as safe from './safe';
import * as split from './split';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'managed-agents';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  who: intro.Who,
  whatis: intro.Whatis,
  parts: split.Parts,
  pet: split.Pet,
  split: split.Split,
  wake: split.Wake,
  speed: split.Speed,
  keys: safe.Keys,
  wall: safe.Wall,
  pm: safe.Pm,
  log: memory.Log,
  hands: memory.Hands,
  dream: memory.Dream,
  blocks: memory.Blocks,
  distill: end.Distill,
  outro: end.Outro,
};

export {Poster as poster} from './poster';
