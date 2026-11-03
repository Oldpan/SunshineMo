// Scene registry for 「AI 裁员潮里，哪些工作还安全？」 (gameshow look, shared/gameshow.tsx). Scene files sit beside this
// one and import the renderer as '@atv/lib/...'. Nav groups come from script.yaml `meta.nav`.
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as end from './end';
import * as open from './open';
import * as r1 from './r1';
import * as r2 from './r2';
import * as r3 from './r3';
import * as who from './who';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'ai-jobs-safe';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  open: open.Open,
  title: open.Title,
  who: who.Who,
  canary: who.Canary,
  r1_card: r1.R1Card,
  r1_power: r1.R1Power,
  r1_blame: r1.R1Blame,
  r1_mercy: r1.R1Mercy,
  r1_watch: r1.R1Watch,
  r2_card: r2.R2Card,
  r2_scene: r2.R2Scene,
  r2_cost: r2.R2Cost,
  r3_card: r3.R3Card,
  r3_art: r3.R3Art,
  r3_care: r3.R3Care,
  r3_joy: r3.R3Joy,
  r3_old: r3.R3Old,
  test: end.Test,
  wef: end.Wef,
  outro: end.Outro,
};

export {Poster as poster} from './poster';
