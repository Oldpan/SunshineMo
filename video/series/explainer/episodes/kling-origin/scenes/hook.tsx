// 5 s cold open, pixel style (user 2026-11-06 picked 方案 A 机器之眼 in pixel form): a real film shot plays full-frame
// (Tears of Steel, CC BY 3.0) while a little pixel TV-bot "understanding model" watches it: tracked corner brackets
// on the two people and the robot hand, a speech bubble that types the caption, a quest log whose bars fill and tick,
// hearts for "0 defects", stars for "understood". Then the shot breaks into pixel blocks and the title drops in.
// The pixelation is pre-rendered (assets.nosync/tos_px12/30/60.mp4) and swapped in, so every frame stays a real frame.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, useCurrentFrame} from 'remotion';
import {useScene} from '@atv/lib/timing';
import {FONT_PIXEL} from '@atv/lib/theme';
import {PixelBar, PixelPanel, PixelText, PixelWindow, PX, Sprite} from '@atv/lib/styles';
import {TOS, TOS_CREDIT} from './assets';

const INK = PX.ink;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
/** steppy pixel pop: 0 → 0.6 → 1.15 → 1 over three frames */
const pxPop = (f: number, f0: number) => (f < f0 ? 0 : f < f0 + 1 ? 0.6 : f < f0 + 2 ? 1.15 : 1);

const SP: Record<string, string[]> = {
  bot: ['........kk........', '.......kyyk.......', '........kk........', '........kk........', '..kkkkkkkkkkkkkk..', '.kllllllllllllllk.', 'klkkkkkkkkkkkkkklk', 'klkmmmmmmmmmmmmklk', 'klkmmwwmmmmwwmmklk', 'klkmmwkmmmmwkmmklk', 'klkmmmmmmmmmmmmklk', 'klkmpmmmkkmmmpmklk', 'klkmmmmmmmmmmmmklk', 'klkkkkkkkkkkkkkklk', '.kllllllllllllllk.', '..kkkkkkkkkkkkkk..', '....kkk....kkk....', '...kkkk....kkkk...'],
  happy: ['........kk........', '.......kyyk.......', '........kk........', '........kk........', '..kkkkkkkkkkkkkk..', '.kllllllllllllllk.', 'klkkkkkkkkkkkkkklk', 'klkmmmmmmmmmmmmklk', 'klkmmmwmmmmwmmmklk', 'klkmmwmwmmwmwmmklk', 'klkmmmmmmmmmmmmklk', 'klkmpmmkkkkmmpmklk', 'klkmmmmmkkmmmmmklk', 'klkkkkkkkkkkkkkklk', '.kllllllllllllllk.', '..kkkkkkkkkkkkkk..', '....kkk....kkk....', '...kkkk....kkkk...'],
  arrow: ['kkkkkkk...', 'kyyyyk....', 'kyyyk.....', 'kyyyyk....', 'kykyyyk...', 'kk.kyyyk..', 'k...kyyyk.', '.....kyyyk', '......kyyk', '.......kk.'],
  spark: ['...k...', '...y...', '.......', 'ky.w.yk', '.......', '...y...', '...k...'],
  eye: ['...kkkkkk...', '.kkwwwwwwkk.', 'kwwwwkkwwwwk', 'kwwwkbbkwwwk', 'kwwwkbbkwwwk', 'kwwwwkkwwwwk', '.kkwwwwwwkk.', '...kkkkkk...'],
  film: ['kkkkkkkkkkkk', 'kwkwkwkwkwkk', 'kkkkkkkkkkkk', 'kllllllllllk', 'kllbbllllllk', 'kllbbbbllllk', 'kllbbllllllk', 'kllllllllllk', 'kkkkkkkkkkkk', 'kwkwkwkwkwkk', 'kkkkkkkkkkkk'],
};
const PAL = {m: '#1B2350', l: '#BDE3FF', b: '#2A5BC4'};

// tracked boxes: [t (s), x, y, w, h]
type Key = [number, number, number, number, number];
const track = (keys: Key[], t: number): [number, number, number, number] => {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2], keys[0][3], keys[0][4]];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= b[0]) {
      const k = (t - a[0]) / (b[0] - a[0]);
      return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k, a[4] + (b[4] - a[4]) * k];
    }
  }
  const z = keys[keys.length - 1];
  return [z[1], z[2], z[3], z[4]];
};
const FIST: [number, number, number][] = [
  [0, 1088, 320], [0.25, 1108, 350], [0.5, 1160, 240], [0.75, 1215, 150], [1, 1192, 145], [1.25, 1085, 200], [1.5, 985, 225],
  [1.75, 940, 280], [2, 885, 340], [2.25, 845, 380], [2.5, 825, 415], [2.75, 822, 432], [3, 855, 420], [3.25, 878, 420], [3.5, 895, 432], [4, 900, 425],
];
const HAND_KEYS: Key[] = FIST.map(([t, x, y]) => [t, x - 104, y - 96, 208, 192]);
const BOY_KEYS: Key[] = [[0, 400, 72, 545, 830], [4, 395, 80, 545, 822]];
const GIRL_KEYS: Key[] = [[0, 1172, 98, 448, 804], [1, 1150, 100, 460, 802], [1.5, 1062, 100, 500, 802], [2, 1000, 100, 545, 802], [4, 1000, 104, 545, 798]];

const Corners: React.FC<{x: number; y: number; w: number; h: number; c: string; s: number; L?: number; T?: number}> = ({x, y, w, h, c, s, L = 46, T = 10}) => {
  if (s <= 0) return null;
  const bar = (l: number, t: number, ww: number, hh: number, k: number) => (
    <div key={k} style={{position: 'absolute', left: l, top: t, width: ww, height: hh, background: c, boxShadow: `0 0 0 4px ${INK}`}} />
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${s})`, transformOrigin: '50% 50%'}}>
      {[
        [0, 0, L, T], [0, 0, T, L], [w - L, 0, L, T], [w - T, 0, T, L],
        [0, h - T, L, T], [0, h - L, T, L], [w - L, h - T, L, T], [w - T, h - L, T, L],
      ].map(([l, t, ww, hh], k) => bar(l, t, ww, hh, k))}
      <div style={{position: 'absolute', inset: T + 6, border: `3px dashed ${c}`, opacity: 0.35}} />
    </div>
  );
};

const Tag: React.FC<{x: number; y: number; c: string; fg?: string; icon?: React.ReactNode; s?: number; children: React.ReactNode}> = ({x, y, c, fg = INK, icon, s = 1, children}) =>
  s <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 100%', display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px 4px 10px', background: c, border: `4px solid ${INK}`, boxShadow: '6px 6px 0 rgba(20,16,40,.45)', whiteSpace: 'nowrap'}}>
      {icon}
      <PixelText size={24} color={fg}>
        {children}
      </PixelText>
    </div>
  );

const Dot: React.FC<{on?: boolean}> = ({on = true}) => <div style={{width: 12, height: 12, background: on ? PX.red : '#C9C3E3', boxShadow: `0 0 0 3px ${INK}`}} />;

const CAPTION = ['运河桥上，', '女孩抬起机械手，', '指向男孩'];
const ROLES: [string, string, string][] = [
  ['Caption', '#2EC4B6', 'film'],
  ['提示词增强', '#6F7CFF', 'spark'],
  ['文本编码器', '#B48CFF', 'eye'],
  ['奖励模型', '#FF5B5B', 'heart'],
  ['自动评测', '#F4B740', 'star'],
];

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const scene = useScene();
  const T_OUT = Math.max(112, scene.duration - 42); // the shot breaks into pixels
  const T_TITLE = T_OUT + 7;
  const t = f / 30;
  const hud = f < T_OUT ? 1 : 1 - seg(f, T_OUT, T_OUT + 5);
  const src = f < T_OUT ? TOS.clip : f < T_OUT + 3 ? TOS.px12 : f < T_OUT + 6 ? TOS.px30 : TOS.px60;
  const dim = 0.62 * seg(f, T_OUT + 4, T_OUT + 10);
  // typing
  const typed = Math.max(0, Math.floor((f - 22) / 2.4));
  let left = typed;
  const lines = CAPTION.map((l) => {
    const n = Math.max(0, Math.min(l.length, left));
    left -= n;
    return l.slice(0, n);
  });
  const doneTyping = typed >= CAPTION.join('').length;
  const boy = track(BOY_KEYS, t);
  const girl = track(GIRL_KEYS, t);
  const hand = track(HAND_KEYS, t);
  const handVerb = f < 46 ? '抬起' : '指向';
  const rows: [string, string, string, number, number][] = [
    ['动作', f < 46 ? '抬手' : '抬手 · 指向', PX.green, seg(f, 30, 70), 72],
    ['镜头', '固定机位', PX.blue, seg(f, 38, 78), 80],
    ['人物', '前后一致', PX.yellow, seg(f, 46, 96), 98],
  ];
  const hearts = [80, 84, 88, 92, 96].filter((h) => f >= h).length;
  const stars = Math.max(0, Math.min(5, Math.floor((f - 100) / 3) + 1));
  const happy = f >= 112;
  const bob = Math.floor(f / 8) % 2 ? -6 : 0;
  return (
    <AbsoluteFill style={{background: '#07080A', overflow: 'hidden'}}>
      <OffthreadVideo src={src} muted style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(0,0,0,.05) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,.05) 2px, transparent 2px)', backgroundSize: '6px 6px', opacity: hud}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(10,8,30,.45))'}} />
      <AbsoluteFill style={{background: `rgba(24,18,56,${dim})`}} />

      {/* ------------------------------------------------ HUD while the shot plays */}
      <AbsoluteFill style={{opacity: hud}}>
        <Corners x={boy[0]} y={boy[1]} w={boy[2]} h={boy[3]} c={PX.blue} s={pxPop(f, 16)} />
        <Tag x={boy[0]} y={boy[1] - 50} c={PX.blue} fg="#fff" icon={<Sprite name="heart" px={3} />} s={pxPop(f, 16)}>
          人物 A
        </Tag>
        <Corners x={girl[0]} y={girl[1]} w={girl[2]} h={girl[3]} c="#F7A8C4" s={pxPop(f, 22)} />
        <Tag x={girl[0] + girl[2] - 168} y={girl[1] - 50} c="#F7A8C4" icon={<Sprite name="heart" px={3} />} s={pxPop(f, 22)}>
          人物 B
        </Tag>
        <Corners x={hand[0]} y={hand[1]} w={hand[2]} h={hand[3]} c={PX.yellow} s={pxPop(f, 26)} L={36} T={8} />
        <Tag x={hand[0]} y={hand[1] + hand[3] + 10} c={PX.yellow} icon={<Sprite name="bolt" px={3} />} s={pxPop(f, 26)}>
          机械手 · {handVerb}
        </Tag>
        {f >= 34 && (
          <div style={{position: 'absolute', left: hand[0] + hand[2] - 34, top: hand[1] - 6, transform: f >= 46 ? 'scaleX(1)' : 'rotate(90deg)'}}>
            <Sprite rows={SP.arrow} px={4} />
          </div>
        )}

        {/* the watcher: pixel TV-bot + chip */}
        <div style={{position: 'absolute', left: 44, top: 40 + bob, transform: `scale(${pxPop(f, 6)})`, transformOrigin: '50% 100%'}}>
          <Sprite rows={happy ? SP.happy : SP.bot} px={6} pal={PAL} />
        </div>
        <Tag x={166} y={64} c="#FFFCF4" icon={<Dot on={Math.floor(f / 10) % 2 === 0} />} s={pxPop(f, 8)}>
          理解模型
        </Tag>
        {happy && (
          <div style={{position: 'absolute', left: 168, top: 112, transform: `scale(${pxPop(f, 112)}) rotate(-4deg)`, transformOrigin: '0 50%'}}>
            <div style={{padding: '2px 12px', background: PX.yellow, border: `4px solid ${INK}`, boxShadow: '6px 6px 0 rgba(20,16,40,.45)'}}>
              <PixelText size={24}>看懂了！</PixelText>
            </div>
          </div>
        )}
        {/* speech bubble: what it sees, typed */}
        <div style={{position: 'absolute', left: 44, top: 172, transform: `scale(${pxPop(f, 14)})`, transformOrigin: '20% 0'}}>
          <PixelPanel w={340} h={214} bg={PX.panel}>
            <div style={{position: 'absolute', left: 42, top: -22, width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderBottom: `22px solid ${INK}`}} />
            <div style={{position: 'absolute', left: 20, top: 16}}>
              <PixelText size={24} color={PX.dim}>
                我看到了 ▸
              </PixelText>
              <div style={{marginTop: 6, fontFamily: FONT_PIXEL, fontSize: 36, lineHeight: 1.3, color: INK, WebkitFontSmoothing: 'none'}}>
                {lines.map((l, i) => (
                  <div key={i} style={{height: 47, whiteSpace: 'nowrap'}}>
                    {l.includes('机械手') ? (
                      <>
                        {l.slice(0, l.indexOf('机械手'))}
                        <span style={{background: PX.yellow}}>机械手</span>
                        {l.slice(l.indexOf('机械手') + 3)}
                      </>
                    ) : (
                      l
                    )}
                    {!doneTyping && l.length > 0 && l.length < CAPTION[i].length + 1 && (lines[i + 1] ?? '') === '' && (
                      <span style={{display: 'inline-block', width: 18, height: 34, background: INK, verticalAlign: -6, marginLeft: 4}} />
                    )}
                    {doneTyping && i === 2 && f % 16 < 8 && <span style={{display: 'inline-block', width: 18, height: 34, background: INK, verticalAlign: -6, marginLeft: 4}} />}
                  </div>
                ))}
              </div>
            </div>
          </PixelPanel>
        </div>
        {/* quest log */}
        <div style={{position: 'absolute', left: 44, top: 408, transform: `translateX(${(1 - pxPop(f, 28)) * -420}px)`}}>
          <PixelWindow w={340} h={490} title="看懂清单">
            {rows.map(([k, d, c, p, ok]) => (
              <div key={k} style={{marginBottom: 14}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 32}}>
                  <PixelText size={24}>
                    {k} <span style={{color: PX.dim}}>{d}</span>
                  </PixelText>
                  {f >= ok ? (
                    <div style={{transform: `scale(${pxPop(f, ok)})`}}>
                      <Sprite name="check" px={3} />
                    </div>
                  ) : (
                    <PixelText size={24} color="#B9831E">
                      {Math.round(p * 100)}%
                    </PixelText>
                  )}
                </div>
                <div style={{marginTop: 6}}>
                  <PixelBar p={p} n={12} color={c} w={288} h={14} />
                </div>
              </div>
            ))}
            <PixelText size={24}>
              瑕疵 <span style={{color: PX.dim}}>{f >= 80 ? '0 处' : '检查中'}</span>
            </PixelText>
            <div style={{display: 'flex', gap: 8, marginTop: 8, height: 32}}>
              {Array.from({length: 5}, (_, i) => (
                <div key={i} style={{transform: `scale(${i < hearts ? pxPop(f, 80 + i * 4) : 0})`}}>
                  <Sprite name="heart" px={4} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 14, paddingTop: 12, borderTop: '4px dashed #C9C3E3', display: 'flex', alignItems: 'center', gap: 8}}>
              <PixelText size={24} style={{whiteSpace: 'nowrap'}}>
                理解度
              </PixelText>
              <div style={{display: 'flex', gap: 6, marginLeft: 'auto'}}>
                {Array.from({length: 5}, (_, i) => (
                  <div key={i} style={{opacity: i < stars ? 1 : 0.25}}>
                    <Sprite name="star" px={3} />
                  </div>
                ))}
              </div>
            </div>
          </PixelWindow>
        </div>
        {/* REC chip */}
        <Tag x={600} y={22} c="#FFFCF4" icon={<Dot on={Math.floor(f / 12) % 2 === 0} />} s={pxPop(f, 4)}>
          REC 00:0{Math.min(9, Math.floor(t))} · 镜头 1/3
        </Tag>
      </AbsoluteFill>

      {/* ------------------------------------------------ title over the pixel blocks */}
      {f >= T_TITLE - 2 && (
        <AbsoluteFill>
          {[
            [180, 170, 64, '#BDE3FF'], [260, 120, 32, PX.yellow], [1640, 180, 64, '#F7A8C4'], [1720, 300, 32, PX.blue], [1500, 120, 32, PX.green],
            [330, 820, 48, '#F7A8C4'], [1580, 820, 48, PX.yellow], [120, 560, 32, PX.green], [1800, 620, 32, '#BDE3FF'],
          ].map(([x, y, s, c], i) => {
            const k = seg(f, T_TITLE - 2 + (i % 4), T_TITLE + 10 + (i % 4));
            const dx = ((x as number) - 960) * (1 - k) * -0.6;
            const dy = ((y as number) - 540) * (1 - k) * -0.6 + Math.floor(f / 6) % 2 * 4;
            return (
              <div
                key={i}
                style={{position: 'absolute', left: (x as number) + dx, top: (y as number) + dy, width: s as number, height: s as number, background: c as string, boxShadow: `0 0 0 4px ${INK}, 8px 8px 0 4px rgba(10,8,30,.5)`, opacity: k > 0 ? 1 : 0}}
              />
            );
          })}
          {[[560, 200], [1380, 230], [470, 640], [1450, 660], [980, 150]].map(([x, y], i) =>
            Math.floor((f + i * 3) / 5) % 3 === 0 ? null : (
              <div key={i} style={{position: 'absolute', left: x, top: y}}>
                <Sprite rows={SP.spark} px={6} />
              </div>
            ),
          )}
          <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', transform: `scale(${pxPop(f, T_TITLE + 4)})`}}>
            <PixelText size={36} color={PX.yellow} style={{letterSpacing: 6, textShadow: `4px 4px 0 ${INK}`}}>
              KLING TEAM · 38 页技术报告
            </PixelText>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 318, textAlign: 'center', transform: `translateY(${f < T_TITLE ? -700 : f < T_TITLE + 3 ? -700 * (1 - (f - T_TITLE) / 3) : f < T_TITLE + 5 ? 18 : 0}px)`}}>
            <PixelText size={144} color="#FFFCF4" style={{letterSpacing: 6, textShadow: `6px 0 0 ${INK}, -6px 0 0 ${INK}, 0 6px 0 ${INK}, 0 -6px 0 ${INK}, 14px 14px 0 #F0566A`}}>
              可灵是如何诞生的
            </PixelText>
          </div>
          <div style={{position: 'absolute', left: 1640, top: 300 + bob, transform: `rotate(8deg) scale(${pxPop(f, T_TITLE + 6)})`}}>
            <Sprite rows={SP.happy} px={7} pal={PAL} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 530, textAlign: 'center', transform: `scale(${pxPop(f, T_TITLE + 10)})`}}>
            <PixelText size={48} color="#FFFCF4" style={{textShadow: `4px 4px 0 ${INK}`}}>
              背后是 <span style={{color: PX.yellow}}>5 个</span>负责「看懂视频」的模型
            </PixelText>
          </div>
          {ROLES.map(([n, c, ic], i) => (
            <div key={n} style={{position: 'absolute', left: 270 + i * 282, top: 650 + [0, -10, 6, -6, 4][i] + (f < T_TITLE + 14 + i * 3 ? 600 : 0)}}>
              <PixelPanel w={262} h={150} bg={c}>
                <div style={{position: 'absolute', left: 18, top: 14}}>
                  <PixelText size={24}>0{i + 1}</PixelText>
                </div>
                <div style={{position: 'absolute', right: 18, top: 14}}>
                  <Sprite {...(SP[ic] ? {rows: SP[ic]} : {name: ic})} px={4} pal={PAL} />
                </div>
                <div style={{position: 'absolute', left: 18, bottom: 18}}>
                  <PixelText size={36}>{n}</PixelText>
                </div>
              </PixelPanel>
            </div>
          ))}
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', right: 28, bottom: 18, background: 'rgba(7,8,10,.7)', padding: '2px 8px', fontFamily: 'Noto Sans SC', fontSize: 16, color: '#8C929D'}}>{TOS_CREDIT}</div>
    </AbsoluteFill>
  );
};
