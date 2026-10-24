// Scene registry for "故意调弱的开源旗舰：Kimi K3.1 Pro". Scene files sit beside this one and import the renderer
// as '@atv/lib/...'. common.tsx registers the episode's dark theme `kimi`.
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as base from './base';
import * as cyber from './cyber';
import * as evals from './evals';
import * as intro from './intro';
import * as post from './post';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'kimi-k31-pro';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  whatis: intro.Whatis,
  scale: base.Scale,
  attn: base.Attn,
  ctx: base.Ctx,
  attnres: base.AttnRes,
  moe: base.Moe,
  vision: base.Vision,
  train: base.Train,
  post: post.Post,
  infra: post.Infra,
  k31: post.K31,
  coding: evals.Coding,
  wins: evals.Wins,
  gaps: evals.Gaps,
  cad: evals.Cad,
  finance: evals.Finance,
  cyber: cyber.Cyber,
  outro: intro.Outro,
};

export {Poster as poster} from './poster';
