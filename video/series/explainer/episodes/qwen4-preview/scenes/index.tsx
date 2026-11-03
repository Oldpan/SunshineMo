// Scene registry for qwen4-preview (evidence-wall look from ../../../shared/evidence.tsx).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as wall from './wall';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'qwen4-preview';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  hook: wall.Hook,
  official_hf: wall.OfficialHf,
  official_code: wall.OfficialCode,
  live: wall.Live,
  ecosystem: wall.Ecosystem,
  missing: wall.Missing,
  debunk: wall.Debunk,
  arch: wall.Arch,
  arch_num: wall.ArchNum,
  deploy: wall.Deploy,
  outro: wall.Outro,
};

/** Cover still for covers.mjs (16:9 and 3:4). */
export const poster = wall.Poster;
