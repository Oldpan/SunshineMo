// Media for 「可灵是如何诞生的」 (assets.nosync/, not in git; credits and how each file was made in source/assets.md).
// Imported so webpack bundles them.
import wave from '../assets.nosync/whale_wave.png';
import dance1 from '../assets.nosync/whale_dance1.png';
import dance2 from '../assets.nosync/whale_dance2.png';
import still from '../assets.nosync/whale_still.png';
import report from '../assets.nosync/whale_report.png';
import tos from '../assets.nosync/tos_bridge.mp4';
import tos12 from '../assets.nosync/tos_px12.mp4';
import tos30 from '../assets.nosync/tos_px30.mp4';
import tos60 from '../assets.nosync/tos_px60.mp4';

/** 鲸鱼娘 poses, 736×784 each, same canvas: feet bottom at y≈757, body centre at x≈330. */
export const WHALE = {wave, dance1, dance2, still, report};
/** Tears of Steel, canal-bridge shot (film 31.5–37.5 s), cropped to 16:9; px* = the same clip in 12/30/60 px blocks. */
export const TOS = {clip: tos, px12: tos12, px30: tos30, px60: tos60};
export const TOS_CREDIT = '素材：Tears of Steel（CC BY 3.0 · Blender Foundation）';
