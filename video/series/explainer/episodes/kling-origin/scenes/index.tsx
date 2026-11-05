// Scene registry for 「可灵是如何诞生的」 (Kling Team, arXiv 2611.04916). Scene files sit beside this one and import the
// renderer as '@atv/lib/...'. Editbay chapters use the shared kit (video/series/explainer/shared/editbay.tsx); the
// paper / crayon / flat / pixel chapters use the renderer's style kits, picked per scene by `style:` in script.yaml.
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as intro from './intro';
import * as caption from './caption';
import * as pe from './pe';
import * as te from './te';
import * as rm from './rm';
import * as end from './end';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'kling-origin';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  chain: intro.Chain,
  base: intro.Base,
  capwhy: caption.CapWhy,
  capcmp: caption.CapCmp,
  refbind: caption.RefBind,
  pe: pe.Pe,
  cup: pe.Cup,
  perl: pe.Perl,
  te: te.Te,
  rmwhy: rm.RmWhy,
  grmdrm: rm.GrmDrm,
  freeze: rm.Freeze,
  evals: end.Evals,
  outro: end.Outro,
};
import {Poster} from './poster';
export const poster = Poster;
