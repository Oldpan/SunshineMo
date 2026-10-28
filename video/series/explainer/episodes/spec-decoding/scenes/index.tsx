// Scene registry for a project that lives outside this repo (copied by `scripts/new_project.py <slug> --dir <path>`
// into <path>/scenes/). Scene files sit beside this one and import the renderer as '@atv/lib/...'.
// Scenes without an entry here render with their `layout:` from script.yaml (src/lib/layouts.tsx).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as intro from './intro';
import * as mtp from './mtp';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'spec-decoding';

/** Nav groups (top-right progress) — usually set in script.yaml `meta.nav` instead. */
export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  // scene id in script.yaml -> component
  hook: intro.Hook,
  why: intro.Why,
  loop: intro.Loop,
  lossless: intro.Lossless,
  knobs: intro.Knobs,
  mtp_meta: mtp.MtpMeta,
  mtp_ds: mtp.MtpDs,
  mtp_num: mtp.MtpNum,
};
