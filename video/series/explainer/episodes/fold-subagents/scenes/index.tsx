// Scene registry for "Agent 别急着拆 subagent：Claude 官方教你并回一个主循环". Scene files sit beside this one and import the
// renderer as '@atv/lib/...'. common.tsx registers the episode theme `claudeblog`.
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as design from './design';
import * as intro from './intro';
import * as migrate from './migrate';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'fold-subagents';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  whatis: intro.Whatis,
  layers: intro.LayersScene,
  orgchart: intro.Orgchart,
  ills: intro.Ills,
  pd: design.Pd,
  why: design.Why,
  keep: design.Keep,
  split: design.Split,
  loop: design.Loop,
  eval: migrate.Eval,
  steps: migrate.Steps,
  flip: migrate.Flip,
  teams: migrate.Teams,
  kit: migrate.Kit,
  outro: migrate.Outro,
};

export {Poster as poster} from './poster';
