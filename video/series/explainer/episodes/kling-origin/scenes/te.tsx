// 第三个岗位：文本编码器（扁平）。te.
import React from 'react';
import {Box, Mono, SceneTitle, Src} from '@atv/lib/kit';
import {C, FONT_NUM, FONT_ZH} from '@atv/lib/theme';
import {EASE, prog, useBeats} from '@atv/lib/timing';
import {clamp01, Drift, rise, usePopIn} from './common';

const Z: React.FC<{children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties}> = ({children, size = 26, color = C.ink, w = 700, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.4, ...style}}>{children}</span>
);

/** A row of coloured cells standing for a hidden-state vector. */
const Vec: React.FC<{seed: number; n?: number; f: number; hue?: number; cell?: number}> = ({seed, n = 10, f, hue = 215, cell = 30}) => (
  <div style={{display: 'flex', gap: 5}}>
    {Array.from({length: n}, (_, i) => {
      const v = 0.5 + 0.5 * Math.sin(seed * 1.7 + i * 2.3);
      return <div key={i} style={{width: cell, height: cell, borderRadius: 6, background: `hsl(${hue}, 80%, ${82 - v * 42}%)`, opacity: prog(f, 8, i * 2)}} />;
    })}
  </div>
);

export const Te: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  // pair test: dots for the two sentences, apart for a good encoder, overlapping for a weak one
  const sep = EASE(prog(b[4], 30, 14));
  const cands = [
    {n: '候选 A', ok: true},
    {n: '候选 B', ok: false},
    {n: '候选 C', ok: true},
    {n: '候选 D', ok: false},
    {n: '候选 E', ok: false},
  ];
  return (
    <>
      <SceneTitle kicker="岗位 03 · 文本编码器">把文字变成生成器读得懂的向量</SceneTitle>
      <Drift amt={8}>
        {/* left top: text → TE → vector */}
        <div style={{position: 'absolute', left: 100, top: 230, ...rise(b[1])}}>
          <Box w={820} h={210}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 8}}>
              <div style={{width: 250, padding: '12px 16px', background: C.panel, borderRadius: 14}}>
                <Z size={22} color={C.sub}>
                  改好的文字
                </Z>
                <div>
                  <Z size={24}>日落时的窗台，一只橘猫……</Z>
                </div>
              </div>
              <div style={{fontSize: 40, color: C.faint}}>→</div>
              <div style={{width: 150, height: 100, borderRadius: 16, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', ...pop(b[1], 8)}}>
                <Z size={28} color="#fff" w={900}>
                  编码器
                </Z>
              </div>
              <div style={{fontSize: 40, color: C.faint}}>→</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                {[0, 1, 2].map((r) => (
                  <Vec key={r} seed={r + 1} n={6} f={b[1] + 18 + r * 4} cell={22} />
                ))}
              </div>
            </div>
            <div style={{marginTop: 14, opacity: prog(b[1], 12, 30)}}>
              <Z size={21} color={C.sub} w={600}>
                生成器读的是整串隐藏状态，不是一句回答
              </Z>
            </div>
          </Box>
        </div>
        {/* left bottom: the counter-intuitive finding */}
        <div style={{position: 'absolute', left: 100, top: 480, display: 'flex', gap: 24}}>
          <div style={rise(b[2])}>
            <Box w={398} h={330} color={C.line} style={{position: 'relative'}}>
              <Z size={24} color={C.sub}>
                靠的不是
              </Z>
              <div style={{marginTop: 8}}>
                <Z size={34} w={900}>
                  更强的语言能力
                </Z>
              </div>
              <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
                {['多任务指令微调', '推理型后训练'].map((t, i) => (
                  <div key={t} style={{opacity: prog(b[2], 10, 14 + i * 8)}}>
                    <Mono size={22} color={C.sub}>
                      {t}
                    </Mono>
                    <Z size={20} color={C.red} style={{marginLeft: 10}}>
                      {i ? '可能变差' : '没有稳定收益'}
                    </Z>
                  </div>
                ))}
              </div>
              <div style={{position: 'absolute', right: 30, top: 24, fontSize: 70, color: C.red, fontWeight: 900, opacity: prog(b[2], 10, 10)}}>✕</div>
            </Box>
          </div>
          <div style={rise(b[3])}>
            <Box w={398} h={330} color={C.green} style={{position: 'relative'}}>
              <Z size={24} color={C.sub}>
                而是
              </Z>
              <div style={{marginTop: 8}}>
                <Z size={34} w={900} color={C.green}>
                  看视频的感知训练
                </Z>
              </div>
              <div style={{marginTop: 18}}>
                <Z size={22} color={C.sub} w={600}>
                  用稠密的视频描述
                  <br />
                  和感知理解任务继续训练
                </Z>
              </div>
              <div style={{position: 'absolute', right: 30, top: 24, fontSize: 64, color: C.green, fontWeight: 900, opacity: prog(b[3], 10, 6)}}>✓</div>
            </Box>
          </div>
        </div>

        {/* right top: minimal pair test */}
        <div style={{position: 'absolute', left: 980, top: 230, ...rise(b[4])}}>
          <Box w={840} h={330}>
            <Z size={26} w={800}>
              只差一个细节的句子对
            </Z>
            <span style={{marginLeft: 12, fontFamily: FONT_ZH, fontSize: 18, fontWeight: 700, color: C.sub, border: `2px solid ${C.line}`, borderRadius: 6, padding: '0 8px'}}>示意</span>
            <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8}}>
              <Z size={25} w={600}>
                ① 女孩<span style={{background: '#FFE3A3', padding: '0 4px'}}>向左</span>跑出画面
              </Z>
              <Z size={25} w={600}>
                ② 女孩<span style={{background: '#CFE3FF', padding: '0 4px'}}>向右</span>跑出画面
              </Z>
            </div>
            <div style={{display: 'flex', gap: 30, marginTop: 18}}>
              {[
                {n: '分得开', d: 170 * sep, c: C.green},
                {n: '分不开', d: 18 * sep, c: C.red},
              ].map((k, i) => (
                <div key={k.n} style={{position: 'relative', width: 370, height: 110, background: C.panel, borderRadius: 14, opacity: prog(b[4], 12, 8 + i * 6)}}>
                  <div style={{position: 'absolute', left: 185 - k.d / 2 - 16, top: 38, width: 32, height: 32, borderRadius: 16, background: '#F5B53D'}} />
                  <div style={{position: 'absolute', left: 185 + k.d / 2 - 16, top: 38, width: 32, height: 32, borderRadius: 16, background: C.blue, opacity: 0.85}} />
                  <div style={{position: 'absolute', left: 14, top: 8}}>
                    <Z size={20} color={k.c}>
                      {k.n}
                    </Z>
                  </div>
                </div>
              ))}
            </div>
          </Box>
        </div>
        {/* right middle: text-only screening */}
        <div style={{position: 'absolute', left: 980, top: 590, ...rise(b[5])}}>
          <Box w={500} h={220}>
            <Z size={24} w={800}>
              纯文本先筛，不用先训生成器
            </Z>
            <div style={{display: 'flex', gap: 10, marginTop: 20}}>
              {cands.map((c, i) => {
                const out = !c.ok && prog(b[5], 12, 20 + i * 4) > 0.5;
                return (
                  <div key={c.n} style={{width: 82, height: 92, borderRadius: 12, background: out ? '#F3F3F6' : '#E4F6EC', border: `3px solid ${out ? C.line : C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: out ? 0.55 : 1}}>
                    <Z size={20} color={out ? C.faint : C.ink} style={{textDecoration: out ? 'line-through' : 'none', textAlign: 'center'}}>
                      {c.n}
                    </Z>
                  </div>
                );
              })}
            </div>
          </Box>
        </div>
        {/* right bottom: preference ratio */}
        <div style={{position: 'absolute', left: 1510, top: 590, ...pop(b[6])}}>
          <Box w={310} h={220} color={C.blue}>
            <Z size={21} color={C.sub}>
              人工对比评测（GSB）偏好比
            </Z>
            <div style={{fontFamily: FONT_NUM, fontWeight: 900, fontSize: 92, color: C.blue, lineHeight: 1.05}}>{(1 + 0.27 * clamp01(prog(b[6], 20, 4))).toFixed(2)}</div>
            <Z size={20} color={C.sub} w={600}>
              对比千问文本编码器
              <br />
              大于 1 就是更好
            </Z>
          </Box>
        </div>
      </Drift>
      <div style={{position: 'absolute', left: 96, bottom: 150, opacity: 0.85 * prog(b[4], 14)}}>
        <Src>原文 §6.1、§6.2、表 14：用最小对比描述筛候选（例句为示意） · 偏好比 (G+S)/(S+B)，相对 Qwen 文本编码器</Src>
      </div>
    </>
  );
};
