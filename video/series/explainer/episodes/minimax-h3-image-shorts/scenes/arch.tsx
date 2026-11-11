// 4 · B 蓝图 · where the model comes from and its three blocks. Beat 0: the H3 video model drawn as three lanes
// (文字 / 画面 / 声音); the sound lane is struck out. Beats 1–3: the three blocks of H3-Image draw themselves top to
// bottom — 读题 (Qwen3-VL text encoder kept from H3, layer 50), 主干 (33.1B, 50 layers, text + reference tokens in one
// queue), 压缩 (f16 VAE: 4096 → 256 per side, then decoded back).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, BlueprintStage, BpArrow, BpBox, clamp01, EASE, HERO15, IMG, lerp, Mono, Pic, pop, prog, rise, Sans, Sparkles, useSub, V} from './common';

const Lane: React.FC<{y: number; label: string; f: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, label, f, children, style}) => (
  <Abs x={110} y={y} w={860} h={150} style={{...rise(f, 0, 30), ...style}}>
    <div style={{position: 'absolute', inset: 0, border: `3px solid ${V.line}`, background: 'rgba(11,46,88,0.7)'}} />
    <div style={{position: 'absolute', left: 28, top: 42}}>
      <Sans size={52} w={900} color={V.line}>
        {label}
      </Sans>
    </div>
    <div style={{position: 'absolute', left: 200, top: 14, width: 640, height: 122, overflow: 'hidden'}}>{children}</div>
  </Abs>
);

const PROMPT = '一只甲虫停在叶子上，背上挂着水珠……';

export const Arch: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const cut = sub(0, 1); // 拿掉了生成声音的那一支
  const enc = sub(1, 1);
  const queue = sub(2, 1);
  const squeeze = sub(3, 1);
  const back = sub(3, 2);
  const lanesOut = 1 - prog(b[1], 14);
  const nameSwap = prog(cut, 14, 24);
  // token queue: 6 text + 6 picture tokens slide into one row
  const tokens = Array.from({length: 12}, (_, i) => ({kind: i % 2 === 0 ? '文' : '图', i}));
  return (
    <BlueprintStage>
      {/* header: H3 视频模型 → H3-Image */}
      <Abs x={100} y={330} style={rise(b[0], 0, 20)}>
        <Mono size={26} color={V.note}>
          结构图 · 官方模型主页
        </Mono>
      </Abs>
      <Abs x={100} y={372} w={880} style={{height: 80}}>
        <div style={{position: 'absolute', opacity: 1 - nameSwap}}>
          <div style={rise(b[0], 4, 24)}>
            <Sans size={64} w={900} color={V.line}>
              H3 视频模型
            </Sans>
          </div>
        </div>
        {cut >= 0 && (
          <div style={{position: 'absolute', opacity: nameSwap}}>
            <Sans size={64} w={900} color={V.line}>
              H3
            </Sans>
            <Sans size={64} w={900} color={V.yellow}>
              {'  →  H3-Image'}
            </Sans>
          </div>
        )}
      </Abs>
      {/* beat 0: the three lanes of the video model */}
      {lanesOut > 0 && (
        <div style={{opacity: lanesOut}}>
          <Lane y={500} label="文字" f={b[0] - 8}>
            <div style={{position: 'absolute', left: 10, top: 34}}>
              <Sans size={36} w={600} color={V.note}>
                {PROMPT.slice(0, Math.floor(clamp01((b[0] - 14) / 70) * PROMPT.length))}
                <span style={{opacity: Math.floor(frame / 8) % 2 ? 1 : 0, color: V.yellow}}>▍</span>
              </Sans>
            </div>
          </Lane>
          <Lane y={680} label="画面" f={b[0] - 16}>
            <div style={{position: 'absolute', left: 10 - ((frame * 2.2) % 150), top: 18, display: 'flex', gap: 14}}>
              {Array.from({length: 7}, (_, i) => (
                <div key={i} style={{border: `2px solid ${V.note}`, padding: 3}}>
                  <Pic src={HERO15[(i + 2) % HERO15.length]} w={130} h={74} f={0} dur={1} />
                </div>
              ))}
            </div>
          </Lane>
          <Lane y={860} label="声音" f={b[0] - 24} style={{transform: `translateX(${EASE(prog(cut, 20, 24)) * 900}px)`, opacity: 1 - prog(cut, 20, 24)}}>
            <svg width={640} height={122}>
              <path
                d={Array.from({length: 81}, (_, i) => {
                  const x = i * 8;
                  const y = 61 + Math.sin(i * 0.55 - frame * 0.35) * (24 + 18 * Math.sin(i * 0.13 + frame * 0.05));
                  return `${i ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
                }).join(' ')}
                stroke={V.note}
                strokeWidth={5}
                fill="none"
              />
            </svg>
          </Lane>
          {/* strike-out of the sound lane */}
          {cut >= 0 && (
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <line x1={90} y1={1030} x2={lerp(90, 990, EASE(prog(cut, 10)))} y2={lerp(1030, 840, EASE(prog(cut, 10)))} stroke="#FF6B6B" strokeWidth={10} strokeLinecap="round" opacity={1 - prog(cut, 16, 24)} />
            </svg>
          )}
          {cut >= 0 && (
            <Abs x={110} y={1060} style={{...pop(cut, 6), opacity: clamp01(pop(cut, 6).opacity as number) * (1 - prog(cut, 16, 60))}}>
              <Sans size={40} w={800} color="#FF8A8A">
                拿掉声音这一支
              </Sans>
            </Abs>
          )}
        </div>
      )}
      {/* beat 1: 读题 */}
      <BpBox x={110} y={490} w={860} h={180} p={prog(b[1], 24, 6)}>
        <Sans size={46} w={900} color={V.yellow}>
          ① 读题
        </Sans>
        <Sans size={40} w={800} color={V.line} style={{marginLeft: 22}}>
          千问文本编码器
        </Sans>
        <div style={{marginTop: 14, opacity: prog(enc, 14)}}>
          <Mono size={26} color={V.note}>
            Qwen3-VL · 沿用 H3 · 读第 50 层
          </Mono>
        </div>
      </BpBox>
      {/* placeholders for the next two blocks, so the sheet reads as a three-part drawing from the start */}
      {b[1] >= 0 && b[3] < 0 && (
        <div style={{opacity: prog(b[1], 20, 30) * 0.55}}>
          {b[2] < 0 && (
            <Abs x={110} y={730} w={860} h={250} style={{border: `3px dashed ${V.note}`, boxSizing: 'border-box', padding: '18px 28px'}}>
              <Sans size={46} w={900} color={V.note}>
                ②
              </Sans>
            </Abs>
          )}
          <Abs x={110} y={1036} w={860} h={214} style={{border: `3px dashed ${V.note}`, boxSizing: 'border-box', padding: '18px 28px'}}>
            <Sans size={46} w={900} color={V.note}>
              ③
            </Sans>
          </Abs>
        </div>
      )}
      <BpArrow x1={540} y1={672} x2={540} y2={726} p={prog(b[2], 12)} />
      {/* beat 2: 主干 */}
      <BpBox x={110} y={730} w={860} h={250} p={prog(b[2], 24, 6)}>
        <Sans size={46} w={900} color={V.yellow}>
          ② 主干
        </Sans>
        <Sans size={40} w={800} color={V.line} style={{marginLeft: 22}}>
          331 亿参数
        </Sans>
        <div style={{marginTop: 8}}>
          <Mono size={24} color={V.note}>
            DiT · 50 层 · 单流
          </Mono>
        </div>
      </BpBox>
      {b[2] >= 0 &&
        tokens.map(({kind, i}) => {
          const isText = kind === '文';
          const t = EASE(prog(queue, 22, i * 2));
          // before the queue beat they wait in two piles (text left, pictures right); then line up in one row
          const k = Math.floor(i / 2);
          const x0 = isText ? 150 + k * 58 : 600 + k * 58;
          const y0 = 890;
          const x1 = 150 + i * 64;
          const x = lerp(x0, x1, t);
          const y = lerp(y0, 900, t);
          const wob = queue >= 0 ? Math.sin((frame + i * 6) / 6) * 3 * t : 0;
          return (
            <Abs key={i} x={x} y={y + wob} style={{opacity: prog(b[2], 14, 20 + i)}}>
              <div style={{width: 52, height: 52, border: `3px solid ${isText ? V.yellow : V.note}`, background: isText ? 'rgba(255,224,138,0.18)' : 'rgba(159,208,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Sans size={28} w={900} color={isText ? V.yellow : V.note}>
                  {kind}
                </Sans>
              </div>
            </Abs>
          );
        })}
      {queue >= 0 && (
        <Abs x={930} y={900} style={{opacity: prog(queue, 12, 20)}}>
          <svg width={40} height={52}>
            <path d="M4 26 L30 26 M20 14 L32 26 L20 38" stroke={V.yellow} strokeWidth={4} fill="none" />
          </svg>
        </Abs>
      )}
      <BpArrow x1={540} y1={982} x2={540} y2={1036} p={prog(b[3], 12)} />
      {/* beat 3: 压缩 → 还原 */}
      <BpBox x={110} y={1036} w={860} h={214} p={prog(b[3], 24, 6)}>
        <Sans size={46} w={900} color={V.yellow}>
          ③ 压缩
        </Sans>
        <div style={{marginTop: 100}}>
          <Mono size={22} color={V.note}>
            边长 ÷16 · 一个格子管 32×32 像素
          </Mono>
        </div>
      </BpBox>
      {b[3] >= 0 && (
        <>
          {/* picture → tiny latent → picture */}
          {(() => {
            const s = EASE(prog(squeeze, 22));
            const r = EASE(prog(back, 22));
            const big = {w: 200, h: 112};
            const small = {w: 36, h: 20};
            const w = lerp(big.w, small.w, s);
            const h = lerp(big.h, small.h, s);
            const x = lerp(420, 560, s);
            return (
              <>
                <Abs x={x} y={1100 + (big.h - h) / 2} style={{opacity: prog(b[3], 14, 20)}}>
                  <div style={{border: `2px solid ${V.note}`, boxShadow: s > 0.9 ? `0 0 20px ${V.yellow}` : undefined, filter: `blur(${s * 1.2}px)`}}>
                    <Pic src={IMG.beetle} w={w} h={h} f={0} dur={1} />
                  </div>
                </Abs>
                {squeeze >= 0 && (
                  <Abs x={500} y={1066} style={pop(squeeze, 18)}>
                    <Mono size={26} color={V.yellow}>
                      ÷16
                    </Mono>
                  </Abs>
                )}
                {back >= 0 && (
                  <Abs x={lerp(600, 740, r)} y={1100 + (big.h - lerp(small.h, big.h, r)) / 2} style={{opacity: prog(back, 8)}}>
                    <div style={{border: `2px solid ${V.yellow}`, boxShadow: `0 0 ${24 * r}px ${V.yellow}88`}}>
                      <Pic src={IMG.beetle} w={lerp(small.w, big.w, r)} h={lerp(small.h, big.h, r)} f={0} dur={1} />
                    </div>
                  </Abs>
                )}
                {back >= 0 && (
                  <Abs x={760} y={1066} style={pop(back, 18)}>
                    <Mono size={26} color={V.yellow}>
                      还原
                    </Mono>
                  </Abs>
                )}
                <Sparkles x={840} y={1156} f={back - 18} n={7} color={V.yellow} r={110} />
              </>
            );
          })()}
        </>
      )}
      {enc >= 0 && b[2] < 0 && <Sparkles x={760} y={560} f={enc} n={6} color={V.yellow} r={120} />}
    </BlueprintStage>
  );
};
