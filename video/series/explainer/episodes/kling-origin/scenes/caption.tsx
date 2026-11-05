// 第一个岗位：Caption（纸张拼贴）。capwhy / capcmp / refbind.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneTitle} from '@atv/lib/kit';
import {MarkerHL, MarkerStrike, PAPER, PaperNote, Script, Stamp, Sticker, Tape, TornSheet} from '@atv/lib/styles';
import {FONT_MONO, FONT_NUM, FONT_ZH} from '@atv/lib/theme';
import {prog, useBeats, useSpring} from '@atv/lib/timing';
import {clamp01, Drift, EASE, rise, usePopIn} from './common';

const Zp: React.FC<{children: React.ReactNode; size?: number; w?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 28, w = 600, color = PAPER.ink, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.45, ...style}}>{children}</span>
);
const SrcP: React.FC<{children: React.ReactNode; f?: number}> = ({children, f = 99}) => (
  <div style={{position: 'absolute', left: 96, bottom: 184, opacity: 0.85 * prog(f, 14), whiteSpace: 'nowrap', fontFamily: FONT_ZH, fontSize: 19, fontWeight: 500, color: '#7A6A58'}}>{children}</div>
);

/** Little film frame drawn on paper (abstract shot thumbnail). */
const Frame: React.FC<{w: number; h: number; kind: number; label?: string}> = ({w, h, kind, label}) => {
  const fr = useCurrentFrame();
  const car = ((fr % 120) / 120) * (w + 120);
  return (
  <div style={{position: 'relative', width: w, height: h, background: '#2A2622', borderRadius: 6, overflow: 'hidden', boxShadow: '0 6px 14px rgba(60,40,20,0.2)'}}>
    {kind === 0 && (
      <>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h * 0.36, background: '#5B4B39'}} />
        <div style={{position: 'absolute', left: w * 0.25, top: h * 0.2, width: w * 0.5, height: h * 0.42, background: '#E9E1D0'}} />
        <div style={{position: 'absolute', left: w + 20 - car, bottom: h * 0.12, width: w * 0.3, height: h * 0.16, borderRadius: 6, background: '#0E0C0A'}} />
      </>
    )}
    {kind === 1 && (
      <>
        <div style={{position: 'absolute', left: w * 0.1, top: h * 0.12, width: w * 0.8, height: h * 0.76, background: '#D9D0BD'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.4, textAlign: 'center', fontFamily: FONT_ZH, fontSize: h * 0.18, fontWeight: 800, color: '#fff', letterSpacing: 3, textShadow: '0 1px 4px rgba(0,0,0,0.5)'}}>Meridian</div>
      </>
    )}
    {kind === 2 && <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(180deg,#3B3222 0 9px,#1E1A12 9px 18px)'}} />}
    {kind === 3 && (
      <>
        <div style={{position: 'absolute', inset: 0, background: '#24211C'}} />
        <div style={{position: 'absolute', left: 10, top: 10, fontFamily: FONT_MONO, fontSize: h * 0.11, color: '#CFC6B0', transform: 'scaleX(-1)', whiteSpace: 'nowrap'}}>LAPD DETECTIVE SQUAD</div>
      </>
    )}
    {label && <div style={{position: 'absolute', left: 6, bottom: 4, fontFamily: FONT_MONO, fontSize: 13, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '1px 6px'}}>{label}</div>}
  </div>
  );
};

// ------------------------------------------------------------------ capwhy
export const CapWhy: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sp = useSpring();
  const pop = usePopIn();
  const lines = ['SHOT 1 0.00–2.95s 静止大全景，烈日', '黑色轿车从右向左驶过，2.5s 出画', '硬切 → 白色片名淡入 3.27–3.88s', '5.70s 起，画外的年轻警探开口'];
  return (
    <>
      <SceneTitle kicker="岗位 01 · Caption">写给生成器的合同</SceneTitle>
      <Drift>
        {/* left: a caption pinned next to its clip */}
        <div style={{position: 'absolute', left: 110, top: 250, ...rise(b[0])}}>
          <TornSheet w={760} h={540} seed={4} rotate={-1.2}>
            <div style={{display: 'flex', gap: 22, alignItems: 'flex-end'}}>
              <Frame w={300} h={170} kind={0} label="视频" />
              <div style={{fontFamily: FONT_MONO, fontSize: 20, color: '#9A8A74', letterSpacing: 2}}>CAPTION ↓</div>
            </div>
            <div style={{marginTop: 14}}>
              {lines.map((l, i) => (
                <div key={i} style={{opacity: prog(b[1], 12, i * 6), fontFamily: FONT_ZH, fontSize: 25, fontWeight: 500, color: PAPER.ink, lineHeight: 1.6, whiteSpace: 'nowrap'}}>
                  {l}
                </div>
              ))}
            </div>
            <div style={{marginTop: 22, opacity: prog(b[5], 14)}}>
              <Zp size={30} w={800}>
                caption 写了什么，
                <MarkerHL p={prog(b[5], 22, 8)}>生成器才学得到什么</MarkerHL>
              </Zp>
            </div>
          </TornSheet>
          <div style={{position: 'absolute', right: 40, top: 60}}>
            <Stamp p={sp(b[2], 0, {damping: 14, stiffness: 160})} rotate={-10} style={{fontSize: 46}}>
              语义合同
            </Stamp>
          </div>
        </div>
        {/* right: why it has to be dense */}
        <div style={{position: 'absolute', left: 960, top: 262, width: 860, ...rise(b[3])}}>
          <PaperNote w={820} h={430} color="#FFFDF5" rotate={1} tape="rgba(255,205,225,0.8)">
            <Zp size={30} w={800}>
              训练时能见到的量
            </Zp>
            <span style={{marginLeft: 14, fontFamily: FONT_ZH, fontSize: 16, fontWeight: 700, color: '#8A8496', border: '2px solid #C9C3D6', borderRadius: 6, padding: '0 8px'}}>示意</span>
            {[
              ['语言模型见到的文字', 1, PAPER.blue],
              ['DiT 见到的训练视频', 0.16, PAPER.pink],
            ].map(([n, v, c], i) => (
              <div key={n as string} style={{marginTop: 26}}>
                <Zp size={22} w={600}>
                  {n}
                </Zp>
                <div style={{marginTop: 8, height: 40, width: 700 * (v as number) * EASE(prog(b[3], 24, 8 + i * 10)), background: c as string, borderRadius: 4, boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.08)'}} />
              </div>
            ))}
            <div style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 18, ...pop(b[4])}}>
              <Sticker color="#EE4E8B" size={58}>
                !
              </Sticker>
              <Zp size={27} w={700}>
                每段视频，都得带上尽量多的信息
              </Zp>
            </div>
          </PaperNote>
        </div>
      </Drift>
      <SrcP f={b[3]}>原文 §1、§3：DiT 的训练样本远少于语言模型，描述密度是数据效率的核心</SrcP>
    </>
  );
};

// ------------------------------------------------------------------ capcmp (原文图 3)
export const CapCmp: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const sp = useSpring();
  const bad = [
    {t: '把硬切写成了淡出', f: b[1]},
    {t: '没写片名什么时候出现', f: b[2]},
    {t: '漏掉了人物出镜前的台词', f: b[3]},
  ];
  const good = [
    {t: '三次硬切的时间', f: b[5]},
    {t: '片名淡入 3.27–3.88s', f: b[5] - 14},
    {t: '5.70s 起画外音 / 10.9s 出镜台词', f: b[6]},
    {t: '门玻璃上反过来的字', f: b[6] - 16},
  ];
  return (
    <>
      <SceneTitle kicker="原文图 3">同一段 17.7 秒，两条 caption</SceneTitle>
      <Drift>
        {/* shots strip */}
        <div style={{position: 'absolute', left: 110, top: 232, display: 'flex', gap: 16, alignItems: 'center'}}>
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={pop(b[0], k * 5)}>
              <Frame w={196} h={110} kind={k} label={`SHOT ${k + 1}`} />
            </div>
          ))}
          <div style={{marginLeft: 20, ...pop(b[0], 24)}}>
            <Sticker color="#3F7FD9" size={96} style={{fontSize: 28}}>
              17.7s
            </Sticker>
          </div>
        </div>
        {/* fluent */}
        <div style={{position: 'absolute', left: 104, top: 384, ...rise(b[1])}}>
          <PaperNote w={800} h={340} color="#FFF4F4" rotate={-0.8} tape="rgba(255,205,225,0.85)">
            <Zp size={28} w={800} color={PAPER.red}>
              读着很顺的 caption
            </Zp>
            <div style={{marginTop: 8}}>
              <Script size={30} color="#5A4E44">
                “阳光下洛杉矶街道的复古蒙太奇，片名出现，随后画面<MarkerStrike p={prog(b[1], 18, 6)}>淡出</MarkerStrike>，转到烟雾缭绕的警探办公室……”
              </Script>
            </div>
            {bad.map((x, i) => (
              <div key={i} style={{marginTop: 6, ...pop(x.f, 6)}}>
                <Zp size={24} w={700} color={PAPER.red}>
                  ✕ {x.t}
                </Zp>
              </div>
            ))}
          </PaperNote>
        </div>
        {/* generation-oriented */}
        <div style={{position: 'absolute', left: 980, top: 384, ...rise(b[4])}}>
          <PaperNote w={820} h={340} color="#F4FFF7" rotate={0.8} tape="rgba(190,225,215,0.9)" lined>
            <Zp size={28} w={800} color="#2F8F5B">
              面向生成的 caption
            </Zp>
            {good.map((x, i) => (
              <div key={i} style={{marginTop: 10, opacity: prog(x.f, 12)}}>
                <Zp size={25} w={600}>
                  <span style={{color: '#2F8F5B'}}>✓ </span>
                  <MarkerHL p={prog(x.f, 18, 4)} color="rgba(185,226,180,0.9)">
                    {x.t}
                  </MarkerHL>
                </Zp>
              </div>
            ))}
          </PaperNote>
        </div>
        {/* score */}
        <div style={{position: 'absolute', left: 560, top: 752, opacity: prog(b[7], 10), transform: `rotate(-2deg) scale(${0.9 + 0.1 * sp(b[7], 0)})`}}>
          <div style={{background: '#FFFDF8', padding: '14px 28px', boxShadow: '0 10px 22px rgba(80,60,30,0.2)', display: 'flex', alignItems: 'center', gap: 30, position: 'relative'}}>
            <Tape w={90} rotate={-12} color="rgba(255,240,180,0.9)" style={{left: -26, top: -12}} />
            <Zp size={22} w={700} color="#7A6A58">
              VidCapBench 准确率
            </Zp>
            <div>
              <Zp size={20} w={600}>Kling-Captioner </Zp>
              <span style={{fontFamily: FONT_NUM, fontSize: 52, fontWeight: 900, color: '#2F8F5B'}}>21.84</span>
            </div>
            <div style={{opacity: prog(b[8], 12)}}>
              <Zp size={20} w={600}>Gemini-4-Argon </Zp>
              <span style={{fontFamily: FONT_NUM, fontSize: 52, fontWeight: 900, color: '#8A8496'}}>16.20</span>
            </div>
          </div>
        </div>
      </Drift>
      <SrcP f={b[7]}>原文图 3（电影《Meridian》片段，画面为示意重绘）· 表 8（35B-A3B 版）</SrcP>
    </>
  );
};

// ------------------------------------------------------------------ refbind
const Polaroid: React.FC<{label: string; tint: string; hat?: boolean; rot?: number}> = ({label, tint, hat, rot = 0}) => (
  <div style={{width: 170, background: '#fff', padding: '12px 12px 34px', boxShadow: '0 8px 18px rgba(60,40,20,0.2)', transform: `rotate(${rot}deg)`, position: 'relative'}}>
    <div style={{width: 146, height: 146, background: tint, position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 48, top: 30, width: 50, height: 50, borderRadius: 25, background: 'rgba(255,255,255,0.85)'}} />
      <div style={{position: 'absolute', left: 28, top: 86, width: 90, height: 80, borderRadius: '45px 45px 0 0', background: 'rgba(255,255,255,0.85)'}} />
      {hat && <div style={{position: 'absolute', left: 38, top: 20, width: 70, height: 18, borderRadius: 6, background: '#3A3340'}} />}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 6, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: PAPER.ink}}>{label}</div>
  </div>
);
export const RefBind: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const pop = usePopIn();
  const sp = useSpring();
  return (
    <>
      <SceneTitle kicker="参考绑定">谁的脸、谁的声音，要写清楚</SceneTitle>
      <Drift>
        <div style={{position: 'absolute', left: 120, top: 270, display: 'flex', gap: 26}}>
          <div style={pop(b[0])}>
            <Polaroid label="IMG_1" tint="#A9CBEF" hat rot={-4} />
          </div>
          <div style={pop(b[0], 6)}>
            <Polaroid label="IMG_2" tint="#F7A8C4" rot={3} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 140, top: 560, ...pop(b[0], 12)}}>
          <PaperNote w={360} h={110} color="#FFF7D6" tape="rgba(190,225,215,0.85)" style={{padding: '18px 22px'}}>
            <div style={{fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: PAPER.ink}}>AUD_1 · 配音</div>
            <svg width={300} height={36}>
              {Array.from({length: 50}, (_, i) => {
                const a = 4 + 12 * Math.abs(Math.sin(i * 0.7 + frame / 9) * Math.sin(i * 0.23 - frame / 23));
                return <rect key={i} x={i * 6} y={18 - a} width={3} height={a * 2} fill={i * 6 < (frame * 2) % 300 ? '#C98A3C' : '#9A8A74'} />;
              })}
            </svg>
          </PaperNote>
        </div>
        {/* caption sheet with bindings */}
        <div style={{position: 'absolute', left: 640, top: 250, ...rise(b[1])}}>
          <TornSheet w={1150} h={500} seed={7} rotate={0.6} pad={44}>
            <div style={{fontFamily: FONT_MONO, fontSize: 16, color: '#9A8A74', letterSpacing: 2}}>CAPTION · 带参考</div>
            <div style={{marginTop: 14, opacity: prog(b[1], 12)}}>
              <Zp size={29} w={600}>
                <span style={{fontFamily: FONT_MONO, fontWeight: 800, background: '#DCEBFA', padding: '0 6px'}}>PERSON_1</span> 的长相取自 <MarkerHL p={prog(b[1], 18, 8)} color="#BCD7F5">IMG_1</MarkerHL>
              </Zp>
            </div>
            <div style={{marginTop: 10, opacity: prog(b[2], 12)}}>
              <Zp size={29} w={600}>
                <span style={{fontFamily: FONT_MONO, fontWeight: 800, background: '#DCEBFA', padding: '0 6px'}}>PERSON_1</span> 用 <MarkerHL p={prog(b[2], 18, 4)} color="#F8DC8C">AUD_1</MarkerHL> 的声音说话
              </Zp>
            </div>
            <div style={{marginTop: 10, opacity: prog(b[2], 12, 14)}}>
              <Zp size={29} w={600}>
                图里的帽子和外套 <span style={{color: PAPER.red, fontWeight: 800}}>不参考</span>
              </Zp>
            </div>
            <div style={{marginTop: 26, opacity: prog(b[3], 12)}}>
              <Zp size={24} w={600} color="#8A7A66">
                参考已经定了的，文字别再写一遍：
              </Zp>
              <div style={{marginTop: 4}}>
                <Script size={34} color="#5A4E44">
                  PERSON_1，<MarkerStrike p={prog(b[3], 18, 10)}>一个嗓音尖细的年轻人</MarkerStrike>
                </Script>
              </div>
            </div>
          </TornSheet>
          <div style={{position: 'absolute', right: 60, bottom: 50}}>
            <Stamp p={sp(b[4], 0, {damping: 14, stiffness: 160})} rotate={-8}>
              不打架
            </Stamp>
          </div>
        </div>
      </Drift>
      <SrcP f={b[1]}>原文 §4、图 4：限定范围的绑定 · 参考给不了的全写出来 · 不跟参考抢话（人像为示意）</SrcP>
    </>
  );
};
