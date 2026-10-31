// Scene registry for "DeepSeek 带 4 个 Qwen 小模型逆向程序：主管还给手下改了 harness". Scene files sit beside this one
// and import the renderer as '@atv/lib/...'. Chapter cards use the generic `chapter` layout from script.yaml.
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as binary from './binary';
import * as end from './end';
import * as intro from './intro';
import * as prompts from './prompts';
import * as results from './results';
import * as setup from './setup';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'hf-reverse-engineering';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  rea: intro.Rea,
  binary: binary.Binary,
  names: binary.Names,
  setup: setup.Setup,
  roles: setup.Roles,
  oracle: setup.Oracle,
  harness: setup.Harness,
  pipeline: setup.Pipeline,
  logorun: results.LogoRun,
  logotable: results.LogoTable,
  logowhy: results.LogoWhy,
  shootertable: results.ShooterTable,
  shooterwhy: results.ShooterWhy,
  particles: prompts.Particles,
  promptv1: prompts.PromptV1,
  promptv2: prompts.PromptV2,
  lookup: prompts.Lookup,
  conclusion: end.Conclusion,
  open: end.Open,
  outro: end.Outro,
};

export {Poster as poster} from './poster';
