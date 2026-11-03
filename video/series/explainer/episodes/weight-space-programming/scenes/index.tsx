// Scene registry for 「权重空间编程」 (MIT CSAIL, "Sparks of Weight-Space Programming", 2026-11-02). Scene files sit
// beside this one and import the renderer as '@atv/lib/...'; the look is the shared `distill` kit
// (video/series/explainer/shared/distill.tsx), the figures run on the post's own data (scenes/data, see build.py).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as intro from './intro';
import * as read from './read';
import * as write from './write';
import * as scale from './scale';
import * as qwen from './qwen';
import * as end from './end';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'weight-space-programming';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  weights: intro.Weights,
  whatis: intro.Whatis,
  games: read.Games,
  breakout: read.Breakout,
  diffusion: read.Diffusion,
  middle: read.Middle,
  copying: read.Copying,
  car: write.Car,
  scratch: write.Scratch,
  scaleup: scale.Scaleup,
  go: scale.Go,
  goprog: scale.GoProg,
  syco: scale.Syco,
  qwen: qwen.Qwen,
  loops: qwen.Loops,
  replay: qwen.Replay,
  results: qwen.Results,
  gemma: qwen.Gemma,
  related: end.Related,
  future: end.Future,
  outro: end.Outro,
};

export {Poster as poster} from './poster';
