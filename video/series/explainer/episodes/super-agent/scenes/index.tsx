// Scene registry for "Super-agent 设计探索" (DeepSeek Harness 团队). Scene files sit beside this one and import the
// renderer as '@atv/lib/...'; the look is the shared `console` kit (video/series/explainer/shared/console.tsx).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as event from './event';
import * as exp from './exp';
import * as human from './human';
import * as intro from './intro';
import * as layer from './layer';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'super-agent';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  who: intro.Who,
  why: intro.Why,
  limit: intro.Limit,
  demo1: intro.Demo1,
  demo2: intro.Demo2,
  traits: intro.Traits,
  arch: intro.Arch,
  ch2: layer.Chap,
  tradeoff: layer.Tradeoff,
  twolayer: layer.Twolayer,
  router: layer.Router,
  batching: layer.Batching,
  worker: layer.Worker,
  ch3: layer.Chap,
  trigger: event.Trigger,
  filter: event.Filter,
  route: event.Route,
  inline: event.Inline,
  recall: event.Recall,
  spec: event.Spec,
  ch4: layer.Chap,
  duplex: human.Duplex,
  channel: human.Channel,
  ch5: layer.Chap,
  compute: human.Compute,
  env: human.Env,
  watchdog: human.Watchdog,
  ch7: layer.Chap,
  ablation: exp.Ablation,
  result: exp.Result,
  tokens: exp.Tokens,
  batch: exp.Batch,
  open: exp.Open,
  outro: exp.Outro,
};

export {Poster as poster} from './poster';
