// Scene registry for 天天用 AI 写代码，你已经是个经理了 (Addy Osmani, "Your coding agents made you a manager").
// One look per scene, picked by the user from a candidate board (2026-11-08); the looks live in shared/stylemix.tsx.
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as blueprint from './blueprint';
import * as board from './board';
import * as dossier from './dossier';
import * as edit from './edit';
import * as picto from './picto';
import * as swiss from './swiss';
import * as term from './term';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'agent-manager';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  open: swiss.Open,
  manage: picto.Manage,
  handoff: dossier.Handoff,
  h1: term.H1,
  h2: blueprint.H2,
  h3: board.H3,
  h4: swiss.H4,
  h5: board.H5,
  h6: term.H6,
  h7: dossier.H7,
  h8: blueprint.H8,
  h9: board.H9,
  h10: swiss.H10,
  breaks: picto.Breaks,
  outro: edit.Outro,
};

export * from './common';
export {Poster as poster} from './poster';
