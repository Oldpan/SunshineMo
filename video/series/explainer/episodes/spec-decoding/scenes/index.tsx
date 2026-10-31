// Scene registry for a project that lives outside this repo (copied by `scripts/new_project.py <slug> --dir <path>`
// into <path>/scenes/). Scene files sit beside this one and import the renderer as '@atv/lib/...'.
// Scenes without an entry here render with their `layout:` from script.yaml (src/lib/layouts.tsx).
import type {NavGroup} from '@atv/lib/chrome';
import {defaultTipOf, SceneComponent} from '@atv/lib/Video';
import * as intro from './intro';
import * as mtp from './mtp';
import * as eagle from './eagle';
import * as dflash from './dflash';
import * as dspark from './dspark';
import * as dflash2 from './dflash2';
import * as end from './end';

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
  eagle_intro: eagle.EagleIntro,
  eagle_arch: eagle.EagleArch,
  eagle_ttt: eagle.EagleTtt,
  eagle_tree: eagle.EagleTree,
  dflash_press: dflash.DflashPress,
  dflash_inject: dflash.DflashInject,
  dflash_num: dflash.DflashNum,
  dspark_markov: dspark.DsparkMarkov,
  dspark_conf: dspark.DsparkConf,
  dspark_sched: dspark.DsparkSched,
  dspark_num: dspark.DsparkNum,
  dflash2_obs: dflash2.Dflash2Obs,
  dflash2_path: dflash2.Dflash2Path,
  dflash2_num: dflash2.Dflash2Num,
  compare: end.Compare,
  caveat: end.Caveat,
  outro: end.Outro,
};

/** Cover still for covers.mjs (16:9 and 3:4). */
export const poster = end.Poster;
