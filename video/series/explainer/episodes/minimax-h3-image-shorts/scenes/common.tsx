// Episode kit: the shared vertical style mix (../../../shared/vstyles.tsx: gallery / darkroom / editorial / data /
// blueprint) plus the particle look (../../../shared/particles.tsx) and MiniMax's own published pictures.
// The pictures live in ../assets.nosync/ (gitignored); `python3 fetch_assets.py` downloads and cuts them.
import beetle from '../assets.nosync/beetle.jpg';
import frog from '../assets.nosync/frog.jpg';
import cow from '../assets.nosync/cow.jpg';
import rabbit from '../assets.nosync/rabbit.jpg';
import cherries from '../assets.nosync/cherries.jpg';
import battle from '../assets.nosync/battle.jpg';
import whitehair from '../assets.nosync/whitehair.jpg';
import rose from '../assets.nosync/rose.jpg';
import city from '../assets.nosync/city.jpg';
import dumplings from '../assets.nosync/dumplings.jpg';
import mirror from '../assets.nosync/mirror.jpg';
import otter from '../assets.nosync/otter.jpg';
import pixelcat from '../assets.nosync/pixelcat.jpg';
import selfie from '../assets.nosync/selfie.jpg';
import shanshui from '../assets.nosync/shanshui.jpg';
import ducks from '../assets.nosync/ducks.jpg';
import shanshui2 from '../assets.nosync/shanshui2.jpg';
import moonrabbit from '../assets.nosync/moonrabbit.jpg';
import pelican from '../assets.nosync/pelican.jpg';
import laundry from '../assets.nosync/laundry.jpg';
import tea from '../assets.nosync/tea.jpg';
import flamingo from '../assets.nosync/flamingo.jpg';
import puzzleCn from '../assets.nosync/puzzle_cn.jpg';
import livingroom from '../assets.nosync/livingroom.jpg';
import mapIn from '../assets.nosync/map_in.jpg';
import mapOut from '../assets.nosync/map_out.jpg';
import renderIn from '../assets.nosync/render_in.jpg';
import renderOut from '../assets.nosync/render_out.jpg';
import f0 from '../assets.nosync/furn_0.jpg';
import f1 from '../assets.nosync/furn_1.jpg';
import f2 from '../assets.nosync/furn_2.jpg';
import f3 from '../assets.nosync/furn_3.jpg';
import f4 from '../assets.nosync/furn_4.jpg';
import f5 from '../assets.nosync/furn_5.jpg';
import f6 from '../assets.nosync/furn_6.jpg';
import f7 from '../assets.nosync/furn_7.jpg';
import f8 from '../assets.nosync/furn_8.jpg';
import f9 from '../assets.nosync/furn_9.jpg';

export * from '../../../shared/vstyles';
export {Field, G, Lock, Panel, Q, Scan, Streaks, Swarm, gridPts, ringPts} from '../../../shared/particles';

export const IMG = {
  beetle, frog, cow, rabbit, cherries, battle, whitehair, rose, city, dumplings, mirror, otter, pixelcat, selfie, shanshui,
  ducks, shanshui2, moonrabbit, pelican, laundry, tea, flamingo, puzzleCn, livingroom, mapIn, mapOut, renderIn, renderOut,
};
/** The 10 editing references in the official order: the empty room, then nine pieces of furniture. */
export const FURN = [f0, f1, f2, f3, f4, f5, f6, f7, f8, f9];
/** The 15 text-to-image results of the model card's hero mosaic (row by row). */
export const HERO15 = [battle, shanshui, frog, rabbit, whitehair, rose, city, dumplings, cow, mirror, otter, pixelcat, beetle, cherries, selfie];

/** Number strings for the particle scenes: the model's own sizes and the 6-step sigma schedule (pdd_config.json). */
export const POOL = ['4096', '16MP', '1.0', '0.968', '0.888', '0.75', '0.533', '0.232', '0', '5376', '50', '56', '33.1B', '24', '32×32', '6 NFE', '2048', '1024'];
