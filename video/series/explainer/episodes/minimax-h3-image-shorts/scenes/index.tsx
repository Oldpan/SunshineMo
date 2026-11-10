// Scene registry for 「MiniMax 开源生图模型：一张 4K 图十来秒」 (竖屏). Scene files sit beside this one and import the
// renderer as '@atv/lib/...'; common.tsx re-exports the shared vertical style mix (gallery / darkroom / editorial /
// data / blueprint themes) and the particle kit.
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import {Hook} from './hook';
import {Pixels} from './pixels';
import {Speed} from './speed';
import {Arch} from './arch';
import {Steps} from './steps';
import {Real} from './real';
import {Styles} from './styles';
import {Text} from './text';
import {Refs} from './refs';
import {Edit} from './edit';
import {Outro} from './outro';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'minimax-h3-image-shorts';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  hook: Hook,
  pixels: Pixels,
  speed: Speed,
  arch: Arch,
  steps: Steps,
  real: Real,
  styles: Styles,
  text: Text,
  refs: Refs,
  edit: Edit,
  outro: Outro,
};

export {poster} from './poster';
export * from './common';
