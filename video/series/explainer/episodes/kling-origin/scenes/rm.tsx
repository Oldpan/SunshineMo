// 第四个岗位：奖励模型（像素）。rmwhy / grmdrm / freeze.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SceneTitle} from '@atv/lib/kit';
import {PixelBar, PixelPanel, PixelText, PixelWindow, PX, Sprite} from '@atv/lib/styles';
import {EASE, prog, useBeats} from '@atv/lib/timing';
import {clamp01, Drift, rise, usePopIn} from './common';

const P: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 24, color = PX.ink, style}) => (
  <PixelText size={size} color={color} style={style}>
    {children}
  </PixelText>
);
const SrcX: React.FC<{children: React.ReactNode; f?: number}> = ({children, f = 99}) => (
  <div style={{position: 'absolute', left: 96, bottom: 152, opacity: 0.85 * prog(f, 14), whiteSpace: 'nowrap'}}>
    <P size={18} color={PX.dim}>
      {children}
    </P>
  </div>
);

const PERSON = ['...kkkk...', '..kccccK..', '..kccccK..', '...kkkk...', '..kbbbbk..', '.kbbbbbbk.', 'kbkbbbbkbk', 'kbkbbbbkbk', 'kckbbbbkck', '..kbbbbk..', '..kBkkBk..', '..kBk.kBk.', '..kBk.kBk.', '.kkk...kkk'];
const PAL = {c: '#FBD9B5', K: '#2E2650', b: PX.blue, B: '#2A5BC4'};

/** Pixel "video frame": sky / ground blocks and an optional pixel person. */
const Shot: React.FC<{w: number; h: number; tint?: string; person?: number; glitch?: boolean; box?: boolean}> = ({w, h, tint = '#BFD8FF', person, glitch, box}) => (
  <div style={{position: 'relative', width: w, height: h, background: tint, boxShadow: `0 0 0 4px ${PX.ink}`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h * 0.3, background: PX.grass}} />
    {person !== undefined && (
      <div style={{position: 'absolute', left: w / 2 - 30 + person, bottom: h * 0.18}}>
        <Sprite rows={PERSON} px={6} pal={PAL} />
      </div>
    )}
    {glitch && <div style={{position: 'absolute', left: w * 0.15, top: h * 0.35, width: w * 0.7, height: 12, background: PX.red, opacity: 0.85}} />}
    {box && <div style={{position: 'absolute', left: w / 2 - 44, top: h * 0.22, width: 88, height: 70, border: `4px solid ${PX.red}`}} />}
  </div>
);

// ------------------------------------------------------------------ rmwhy
export const RmWhy: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const seg = [1, 1, 0, 1, 1, 0, 1];
  const n = 14;
  const defect = [6, 7]; // a glitch that lasts < 2 s
  const sampled = [0, 4, 8, 12];
  const dim = 1 - 0.6 * clamp01(prog(b[5], 12));
  return (
    <>
      <SceneTitle kicker="岗位 04 · 奖励模型">先得看得见，才判得准</SceneTitle>
      <Drift amt={6}>
        <div style={{opacity: dim}}>
          {/* top left: scoring a generated video */}
          <div style={{position: 'absolute', left: 100, top: 220, ...rise(b[0])}}>
            <PixelWindow w={860} h={300} title="生成出来的视频">
              <div style={{display: 'flex', gap: 30}}>
                <Shot w={240} h={150} person={Math.round(Math.sin(frame / 8) * 3) * 6} />
                <div style={{flex: 1}}>
                  <P size={24}>逐段打分</P>
                  <div style={{display: 'flex', gap: 6, marginTop: 18}}>
                    {seg.map((g, i) => (
                      <div key={i} style={{width: 60, height: 50, background: g ? PX.green : PX.red, boxShadow: `0 0 0 3px ${PX.ink}`, opacity: prog(b[1], 6, i * 4)}} />
                    ))}
                  </div>
                  <div style={{marginTop: 18, opacity: prog(b[1], 10, 30)}}>
                    <P size={24} color={PX.dim}>
                      哪段好 · 哪里坏了
                    </P>
                  </div>
                </div>
              </div>
            </PixelWindow>
          </div>
          {/* top right: two models from the 27B base */}
          <div style={{position: 'absolute', left: 1000, top: 220, ...rise(b[2])}}>
            <PixelWindow w={820} h={300} title="都从同一个底座开始">
              <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                <PixelPanel w={260} h={120} bg={PX.title}>
                  <P size={24}>Kling-MLLM</P>
                  <div>
                    <P size={36} color={PX.blue}>
                      27B
                    </P>
                  </div>
                </PixelPanel>
                <P size={36}>→</P>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                  {[
                    {n: 'GRM', c: PX.yellow},
                    {n: 'DRM', c: PX.green},
                  ].map((m, i) => (
                    <div key={m.n} style={pop(b[2], 10 + i * 6)}>
                      <PixelPanel w={220} h={74} bg={m.c} shadow={false}>
                        <div style={{marginTop: -8}}>
                          <P size={36}>{m.n}</P>
                        </div>
                      </PixelPanel>
                    </div>
                  ))}
                </div>
              </div>
            </PixelWindow>
          </div>
          {/* bottom left: sparse sampling misses a short glitch */}
          <div style={{position: 'absolute', left: 100, top: 560, ...rise(b[3])}}>
            <PixelWindow w={860} h={320} title="难点：看不见">
              <div style={{display: 'flex', gap: 6}}>
                {Array.from({length: n}, (_, i) => {
                  const isS = sampled.includes(i);
                  const isD = defect.includes(i);
                  return (
                    <div key={i} style={{position: 'relative', opacity: prog(b[3], 6, i * 2)}}>
                      <div style={{width: 48, height: 64, background: isD ? '#FFD3DA' : '#DCE8FF', boxShadow: `0 0 0 3px ${isS && prog(b[3], 8, 40) > 0.5 ? PX.blue : PX.ink}`}}>
                        {isD && <div style={{position: 'absolute', left: 6, top: 26, width: 36, height: 10, background: PX.red}} />}
                      </div>
                      {isS && prog(b[3], 8, 40) > 0.5 && (
                        <div style={{position: 'absolute', left: 14, top: 74}}>
                          <P size={24} color={PX.blue}>
                            ▲
                          </P>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{display: 'flex', gap: 40, marginTop: 50}}>
                <P size={24} color={PX.red}>
                  ■ 瑕疵不到 2 秒
                </P>
                <P size={24} color={PX.blue} style={{opacity: prog(b[3], 10, 40)}}>
                  ▲ 抽到的帧
                </P>
                <P size={24} color={PX.red} style={{opacity: prog(b[3], 10, 60)}}>
                  → 漏了
                </P>
              </div>
            </PixelWindow>
          </div>
          {/* bottom right: train vision first */}
          <div style={{position: 'absolute', left: 1000, top: 560, ...rise(b[4])}}>
            <PixelWindow w={820} h={320} title="先单独练视觉部分">
              <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
                <PixelPanel w={280} h={70} bg="#FFE1C2" shadow={false}>
                  <div style={{marginTop: -8}}>
                    <P size={24}>视觉部分 · 练</P>
                  </div>
                </PixelPanel>
                <PixelPanel w={300} h={70} bg="#E4E0F4" shadow={false}>
                  <div style={{marginTop: -8}}>
                    <P size={24} color={PX.dim}>
                      语言部分 · 冻住
                    </P>
                  </div>
                </PixelPanel>
              </div>
              <div style={{display: 'flex', gap: 24, marginTop: 24, alignItems: 'center', opacity: prog(b[4], 10, 16)}}>
                <div style={{textAlign: 'center'}}>
                  <Shot w={150} h={90} />
                  <P size={18}>原视频</P>
                </div>
                <P size={36}>VS</P>
                <div style={{textAlign: 'center'}}>
                  <div style={{filter: 'blur(1.6px)'}}>
                    <Shot w={150} h={90} tint="#C9D9F2" />
                  </div>
                  <P size={18}>压缩重建后</P>
                </div>
                <P size={24} color={PX.blue}>
                  哪个是原片？
                </P>
              </div>
            </PixelWindow>
          </div>
        </div>
        {/* b5 banner */}
        <div style={{position: 'absolute', left: 460, top: 450, ...pop(b[5])}}>
          <PixelPanel w={1000} h={150} bg={PX.yellow}>
            <div style={{textAlign: 'center', marginTop: 12}}>
              <P size={48}>看不见的瑕疵，推理再久也判不出来</P>
            </div>
          </PixelPanel>
        </div>
      </Drift>
      <SrcX f={b[3]}>原文 §7.2 Stage 1：许多瑕疵不到两秒，稀疏抽帧会漏 · 冻结 LLM，单练视觉编码器（含 VAE 重建判别）</SrcX>
    </>
  );
};

// ------------------------------------------------------------------ grmdrm
export const GrmDrm: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const critique = ['瑕疵：手指多一根', '时间：3.2s – 4.1s', '位置：画面框出'];
  const fields = ['人体结构', '物体穿模', '画面闪烁', '动作完成', '运动幅度', '镜头运动'];
  const ans = ['A', 'A', 'B', 'A', 'B', 'A'];
  const filled = prog(b[6], 6) > 0.5;
  return (
    <>
      <SceneTitle kicker="两个奖励模型">GRM 写点评，DRM 出分数</SceneTitle>
      <Drift amt={6}>
        {/* GRM */}
        <div style={{position: 'absolute', left: 100, top: 220, ...rise(b[0])}}>
          <PixelWindow w={860} h={660} title="GRM · 会写点评" tag="可解释">
            <div style={{display: 'flex', gap: 24}}>
              <Shot w={260} h={170} person={0} box={prog(b[1], 8, 20) > 0.5} />
              <div>
                {critique.map((c, i) => (
                  <div key={i} style={{opacity: prog(b[1], 8, i * 10), marginBottom: 10}}>
                    <P size={24}>{c}</P>
                  </div>
                ))}
              </div>
            </div>
            <div style={{marginTop: 30, opacity: prog(b[2], 10)}}>
              <P size={36} color={PX.red}>
                规则：漏报也扣分
              </P>
            </div>
            <div style={{display: 'flex', gap: 30, marginTop: 18, opacity: prog(b[2], 10, 10)}}>
              {[
                {n: '真实瑕疵', v: 3, c: PX.ink},
                {n: '它报出来', v: 2, c: PX.blue},
              ].map((r) => (
                <div key={r.n}>
                  <P size={24}>{r.n}</P>
                  <div style={{display: 'flex', gap: 8, marginTop: 8}}>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{width: 44, height: 44, background: k < r.v ? r.c : '#fff', boxShadow: `0 0 0 3px ${PX.ink}`}} />
                    ))}
                  </div>
                </div>
              ))}
              <div style={{alignSelf: 'flex-end', ...pop(b[2], 20)}}>
                <P size={36} color={PX.red}>
                  漏 1 个 → 扣分
                </P>
              </div>
            </div>
            <div style={{marginTop: 30, ...rise(b[3])}}>
              <PixelPanel w={760} h={100} bg="#FFE6EA" shadow={false}>
                <div style={{marginTop: -6}}>
                  <P size={24}>没有这条：少报几个，分数反而更高</P>
                </div>
              </PixelPanel>
            </div>
          </PixelWindow>
        </div>
        {/* DRM */}
        <div style={{position: 'absolute', left: 1000, top: 220, ...rise(b[4])}}>
          <PixelWindow w={820} h={660} title="DRM · 主要给训练打分" tag="快">
            <P size={24} color={PX.dim}>
              答案位置直接写在输入里
            </P>
            <div style={{marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px'}}>
              {fields.map((f, i) => (
                <div key={f} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: prog(b[5], 6, i * 3)}}>
                  <P size={24}>{f}</P>
                  <div style={{width: 48, height: 44, background: filled ? (ans[i] === 'A' ? PX.green : PX.yellow) : '#fff', boxShadow: `0 0 0 3px ${PX.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <P size={24}>{filled ? ans[i] : '_'}</P>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop: 36, opacity: prog(b[6], 10)}}>
              <P size={24}>读一遍，全部分数一起出</P>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14}}>
                <div style={{width: 130}}>
                  <P size={24}>DRM</P>
                </div>
                <PixelBar p={prog(b[6], 6)} n={16} w={420} color={PX.green} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 12}}>
                <div style={{width: 130}}>
                  <P size={24} color={PX.dim}>
                    逐字生成
                  </P>
                </div>
                <PixelBar p={clamp01(b[6] / 260)} n={16} w={420} color={PX.yellow} />
              </div>
            </div>
          </PixelWindow>
        </div>
      </Drift>
      <SrcX f={b[0]}>原文 §7.2 Stage 2/3：GRM 用 RL 训练，未匹配的真实瑕疵会被罚 · DRM 一次 prefill 回答 K 个问题（示意）</SrcX>
    </>
  );
};

// ------------------------------------------------------------------ freeze
export const Freeze: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const mag = clamp01(prog(b[2], 14));
  const rows = [
    {n: '动来动去', move: true, defect: -2, motion: 0, glitch: true},
    {n: '一动不动', move: false, defect: 0, motion: -3, glitch: false},
  ];
  const bars = [
    {n: 'DRM', v: 77.86, c: PX.green, f: b[3]},
    {n: 'GRM', v: 74.72, c: PX.yellow, f: b[4]},
    {n: 'Gemini-4-Argon', v: 73.54, c: '#B7AEDB', f: b[5]},
  ];
  return (
    <>
      <SceneTitle kicker="回到开头">只罚瑕疵，等于奖励静止</SceneTitle>
      <Drift amt={6}>
        <div style={{position: 'absolute', left: 100, top: 220, ...rise(b[0])}}>
          <PixelWindow w={900} h={660} title="两段视频，怎么打分">
            {rows.map((r, i) => {
              const total = 10 + r.defect + r.motion * mag;
              return (
                <div key={r.n} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 30, opacity: prog(b[0], 10, i * 10)}}>
                  <Shot w={200} h={140} person={r.move ? Math.round(Math.sin(frame / 5) * 4) * 6 : 0} glitch={r.glitch && Math.floor(frame / 12) % 3 === 0} />
                  <div style={{width: 600}}>
                    <P size={36}>{r.n}</P>
                    <div style={{display: 'flex', gap: 18, marginTop: 8, flexWrap: 'wrap'}}>
                      <P size={24} color={r.defect ? PX.red : PX.green}>
                        瑕疵 {r.defect || '±0'}
                      </P>
                      <P size={24} color={PX.red} style={{opacity: r.motion ? mag : 0}}>
                        运动幅度 {r.motion}
                      </P>
                      <P size={24} color={PX.blue} style={{opacity: prog(b[1], 10)}}>
                        总分 {total.toFixed(0)}
                      </P>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{marginTop: 10, ...pop(b[2])}}>
              <PixelPanel w={820} h={110} bg="#DFF5E6" shadow={false}>
                <div style={{marginTop: -6}}>
                  <P size={24}>所以“运动幅度”单独打一项分，动得太少也扣</P>
                </div>
              </PixelPanel>
            </div>
            <div style={{position: 'absolute', right: 0, bottom: 0, opacity: prog(b[1], 10)}}>
              <P size={18} color={PX.dim}>
                分数为示意
              </P>
            </div>
          </PixelWindow>
        </div>
        <div style={{position: 'absolute', left: 1040, top: 220, ...rise(b[3])}}>
          <PixelWindow w={780} h={660} title="可灵内部成对测试 · 准确率">
            {bars.map((r) => (
              <div key={r.n} style={{marginBottom: 40, opacity: prog(r.f, 10)}}>
                <P size={24}>{r.n}</P>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8}}>
                  <div style={{width: 540 * (r.v / 100) * EASE(prog(r.f, 20)), height: 56, background: r.c, boxShadow: `0 0 0 4px ${PX.ink}`}} />
                  <P size={36}>{(r.v * clamp01(prog(r.f, 20))).toFixed(2)}%</P>
                </div>
              </div>
            ))}
          </PixelWindow>
        </div>
      </Drift>
      <SrcX f={b[3]}>原文 §7 Insight「Penalizing artifacts alone rewards stillness」· 表 17 宏平均准确率</SrcX>
    </>
  );
};
