// Shared pieces for "DeepSeek 带 4 个 Qwen 小模型逆向程序" (Hugging Face blog, 2026-10-26).
// Brand marks are official: DeepSeek whale (renderer lib/brand/deepseek.tsx), the Qwen3.5 mark cropped from
// qianwen-res.oss-accelerate.aliyuncs.com/logo_qwen3.5.png (linked from the Qwen/Qwen3.5-9B model card), and the
// Hugging Face logo paths copied verbatim from huggingface.co/front/assets/huggingface_logo-noborder.svg.
// Every number on screen comes from source/article.md.
import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {C, FONT_MONO, FONT_NUM, FONT_ZH} from '@atv/lib/theme';
import {DeepSeekWhale as DSWhaleLocal} from '@atv/lib/brand/deepseek';
// @ts-ignore -- png asset, bundled by Remotion's webpack config
import qwenMark from './brand/qwen35-mark.png';

export * from '@atv/lib/stage';
export * from '@atv/lib/styles';
export * from '@atv/lib/kit';
export * from '@atv/lib/ui';
export {DeepSeekWhale, DS_BLUE} from '@atv/lib/brand/deepseek';
export {C, FONT_MONO, FONT_NUM, FONT_ZH, FONT_PIXEL} from '@atv/lib/theme';
export {prog, clamp01, useBeats, useSpring, useScene, useSceneLeft} from '@atv/lib/timing';

export const QWEN = '#615CED';
export const HF_YELLOW = '#FFD21E';
export const GREEN = '#1FB463';
export const AMBER = '#F6B21A';

/** Qwen3.5 mark (official PNG, 480 px). */
export const QwenMark: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 80, style}) => (
  <Img src={qwenMark} style={{width: size, height: size * (475 / 480), display: 'block', flex: 'none', ...style}} />
);

export {HFLogo} from './hflogo';

export const Zh: React.FC<{size?: number; w?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 28, w = 800, color = C.ink, children, style}) => (
  <div style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.35, ...style}}>{children}</div>
);

export const Big: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 64, color = C.ink, children, style}) => (
  <div style={{fontFamily: FONT_NUM, fontWeight: 900, fontSize: size, color, lineHeight: 1, letterSpacing: -1, ...style}}>{children}</div>
);

export const MonoT: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 22, color = C.ink, children, style}) => (
  <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: size, color, lineHeight: 1.4, ...style}}>{children}</div>
);

/** White panel with a thin border. */
export const Panel: React.FC<{w?: number | string; h?: number | string; style?: React.CSSProperties; children?: React.ReactNode; accent?: string; pad?: number}> = ({w, h, style, children, accent, pad = 22}) => (
  <div
    style={{
      width: w,
      height: h,
      background: '#FFFFFF',
      borderRadius: 18,
      border: accent ? `3px solid ${accent}` : '2px solid rgba(40,40,80,0.10)',
      boxShadow: '0 14px 30px rgba(30,40,90,0.10)',
      padding: pad,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Model badge: logo + name + role. */
export const ModelBadge: React.FC<{who: 'lead' | 'worker'; size?: number; label?: string; style?: React.CSSProperties}> = ({who, size = 56, label, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, ...style}}>
    {who === 'lead' ? <DSWhaleLocal size={size} /> : <QwenMark size={size} />}
    {label && <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: size * 0.42, color: C.ink, whiteSpace: 'nowrap'}}>{label}</div>}
  </div>
);


/** Function brick (as in the article's recordings): grey → amber (being worked on) → green (accepted). */
export const Brick: React.FC<{name: string; state: 0 | 1 | 2; w?: number; size?: number; lead?: boolean}> = ({name, state, w = 200, size = 15, lead}) => {
  const bg = state === 2 ? (lead ? '#4D6BFE' : GREEN) : state === 1 ? AMBER : '#4A5068';
  const fg = state === 1 ? '#1E1E24' : '#FFFFFF';
  return (
    <div style={{width: w, height: 26, borderRadius: 5, background: bg, color: fg, fontFamily: FONT_MONO, fontWeight: 600, fontSize: size, display: 'flex', alignItems: 'center', padding: '0 8px', boxSizing: 'border-box', overflow: 'hidden', whiteSpace: 'nowrap'}}>
      {name}
    </div>
  );
};

/** Gentle constant motion so long holds never read as a frozen frame. */
export const useBob = (amp = 4, period = 90) => {
  const f = useCurrentFrame();
  return Math.sin((f / period) * Math.PI * 2) * amp;
};

/** Function names from the article's two recordings (final frames). */
export const LOGO_FNS = [
  'clear_screen', 'draw_sprite0', 'draw_sprite1', 'draw_sprite2', 'draw_sprite3', 'draw_player', 'draw_player2', 'draw_ship3',
  'draw_logo', 'draw_wing_a1', 'draw_wing_a2', 'draw_wing_b1', 'draw_wing_b2', 'draw_shots', 'draw_objects', 'put_pixel',
  'put_pixel_if', 'draw_hline', 'draw_disc', 'draw_sprite', 'draw_sprite_scaled', 'draw_glyph', 'render_frame', 'rng_next',
  'rng_range', 'timers_tick', 'bob_update', 'counter_update', 'wing_x_update', 'spawn_explosion', 'apply_input', 'update_objects',
  'spawn_shot', 'update_shots', 'hf_state_size', 'hf_palette', 'hf_new', 'hf_step',
];

export const SHOOTER_FNS = [
  'draw_background', 'draw_starfield', 'draw_stars_layer0', 'draw_stars_layer1', 'draw_stars_layer2', 'draw_planet', 'draw_player',
  'draw_player_thruster', 'draw_aliens', 'draw_player_bullets', 'draw_bombs', 'draw_ship_tiles', 'draw_particles', 'draw_ufo',
  'draw_score', 'draw_hiscore', 'draw_lives', 'draw_power_bar', 'draw_wave_panel', 'put_pixel', 'draw_hline', 'draw_vline',
  'draw_rect', 'draw_glyph', 'draw_glyph_mirror', 'draw_circle', 'draw_digit', 'draw_number', 'draw_alien', 'draw_frame',
  'rand_next', 'rand_max', 'update_stars', 'move_player', 'spawn_bullet', 'player_fire', 'update_shots', 'spawn_wave',
  'update_formation', 'update_dives', 'spawn_bombs', 'boxes_overlap', 'spawn_particles', 'add_score', 'update_bullet_hits',
  'particle_hit', 'update_particles_hit', 'player_hit', 'update_collisions', 'update_particles', 'update_ufo', 'respawn_wave',
  'vr_state_size', 'vr_palette', 'vr_new', 'vr_step',
];

export const SRC_BLOG = '来源：Hugging Face 社区博文《Reverse Engineering Anything using small open models》，2026-10-26';
