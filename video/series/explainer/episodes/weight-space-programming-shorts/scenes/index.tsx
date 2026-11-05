// Scene registry for 只改 0.016% 的数字（竖屏，非技术向）. Scene files sit beside this one and import the renderer as
// '@atv/lib/...'; common.tsx re-exports the shared particle kit (registers theme `particle`).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import {Hook} from './hook';
import {Numbers} from './numbers';
import {Read} from './read';
import {Car} from './car';
import {Scratch} from './scratch';
import {Qwen} from './qwen';
import {Outro} from './outro';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'weight-space-programming-shorts';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  hook: Hook,
  numbers: Numbers,
  read: Read,
  car: Car,
  scratch: Scratch,
  qwen: Qwen,
  outro: Outro,
};

export {poster} from './poster';
export * from './common';
