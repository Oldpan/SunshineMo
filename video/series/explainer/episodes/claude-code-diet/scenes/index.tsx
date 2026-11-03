// Scene registry for 怎么别让 Claude Code 越用越蠢. Scene files sit beside this one and import the renderer as
// '@atv/lib/...'; common.tsx re-exports the shared whiteboard kit (registers theme `whiteboard`).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as intro from './intro';
import * as s1 from './s1';
import * as s2 from './s2';
import * as s3 from './s3';
import * as s4 from './s4';
import * as s5 from './s5';
import * as s6 from './s6';
import * as s7 from './s7';

/** Composition id: must equal the project directory name (render.sh checks). */
export const id = 'claude-code-diet';

export const nav: Record<string, NavGroup> = {};

export const tipOf = defaultTipOf;

export const registry: Record<string, SceneComponent> = {
  cover: intro.Cover,
  thesis: intro.Thesis,
  's1-principles': s1.Principles,
  's1-prompt': s1.Prompt,
  's1-contract': s1.Contract,
  's1-stop': s1.Stop,
  's1-spec': s1.Spec,
  's2-entry': s2.Entry,
  's2-goal': s2.Goal,
  's2-evaluator': s2.Evaluator,
  's2-safety': s2.Safety,
  's2-auto': s2.Auto,
  's3-default': s3.Default,
  's3-migrate': s3.Migrate,
  's4-eighty': s4.Eighty,
  's4-audit': s4.Audit,
  's4-table': s4.Table,
  's4-loop': s4.Loop,
  's5-what': s5.What,
  's5-cost': s5.Cost,
  's6-cloud': s6.Cloud,
  's6-projects': s6.Projects,
  's7-review': s7.Review,
  's7-prompt': s7.ReviewPrompt,
  summary: s7.Summary,
  outro: s7.Outro,
};

export * from './common';
export {Poster as poster} from './poster';
