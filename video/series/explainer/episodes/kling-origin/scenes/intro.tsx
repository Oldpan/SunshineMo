// 开场 / 引言 / 底座 — editbay chapters.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {
  Bay,
  Bin,
  clamp01,
  count,
  Dummy,
  EB,
  EASE,
  IBar,
  Illus,
  Inspector,
  IRow,
  ISec,
  Lab,
  lerp,
  Mo,
  Monitor,
  Num,
  prog,
  rise,
  ScreenSrc,
  Timeline,
  usePopIn,
  Wave,
  Zh,
} from './common';

// ------------------------------------------------------------------ cover
const DEFECTS = [
  {label: '手指多一根', x: 598, y: 278, w: 72, h: 72},
  {label: '物体穿模', x: 410, y: 380, w: 150, h: 70},
  {label: '画面闪烁', x: 760, y: 60, w: 190, h: 120},
];
export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const pop = usePopIn();
  const still = prog(b[3], 30); // 0 → 1: the model stops moving
  const amp = 1 - still;
  const swing = 40 + 34 * Math.sin(frame / 7) * amp;
  const bob = 6 * Math.abs(Math.sin(frame / 7)) * amp;
  const nDef = b[1] < 0 ? 0 : Math.min(3, 1 + Math.floor(b[1] / 14));
  const defVis = (i: number) => (i < nDef ? 1 : 0) * (1 - still);
  const penalty = DEFECTS.reduce((s, _, i) => s + (b[2] >= 0 && i < nDef ? 1 : 0), 0);
  const score = b[4] >= 0 ? count(b[4], 2, 5, 40) : b[2] >= 0 ? 5 - penalty : 5;
  const titleT = prog(b[6], 18);
  const titleOn = b[6] >= 0;
  return (
    <Bay>
      <Bin f={frame} />
      <Monitor>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#141A28,#0A0C12)', opacity: 1 - 0.85 * titleT}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: '#1C1A18', opacity: 1 - 0.85 * titleT}} />
        <div style={{position: 'absolute', left: 427, top: 150, opacity: 1 - titleT}}>
          <Dummy swing={swing} bob={bob} />
        </div>
        {DEFECTS.map((d, i) => (
          <div key={i} style={{position: 'absolute', left: d.x, top: d.y, opacity: defVis(i) * (1 - titleT)}}>
            <div style={pop(b[1] - i * 14)}>
            <div style={{width: d.w, height: d.h, border: `3px solid ${EB.red}`, borderRadius: 4, boxShadow: `0 0 16px ${EB.red}88`}} />
            <div style={{position: 'absolute', left: 0, top: -34, background: EB.red, padding: '3px 10px', borderRadius: 3, whiteSpace: 'nowrap'}}>
              <Zh size={17} w={700} color="#fff">
                {d.label}
              </Zh>
              {b[2] >= 0 && (
                <Mo size={16} color="#fff" w={700} style={{marginLeft: 8}}>
                  −1
                </Mo>
              )}
            </div>
            </div>
          </div>
        ))}
        {b[3] >= 0 && !titleOn && (
          <div style={{position: 'absolute', right: 40, top: 40, ...pop(b[3], 10)}}>
            <div style={{background: 'rgba(70,194,129,0.16)', border: `1px solid ${EB.aud}`, borderRadius: 6, padding: '8px 16px'}}>
              <Zh size={20} w={700} color="#9BE3B0">
                不动 · 未发现瑕疵
              </Zh>
            </div>
          </div>
        )}
        <ScreenSrc f={b[0]}>{titleOn ? '' : '示意画面 · 一段生成的视频'}</ScreenSrc>
        {/* title card */}
        {titleOn && (
          <div style={{position: 'absolute', inset: 0}}>
            <div style={{position: 'absolute', left: 70, top: 56, ...rise(b[5] < 0 ? 0 : b[6], 0)}}>
              <Lab size={17} color={EB.head} style={{letterSpacing: 4}}>
                Kling Team · arXiv 2611.04916 · 2026-11-03
              </Lab>
            </div>
            <div style={{position: 'absolute', left: 66, top: 100, ...rise(b[6], 4)}}>
              <Zh size={92} w={900} style={{lineHeight: 1.15}}>
                可灵是<span style={{color: EB.head}}>如何诞生</span>的
              </Zh>
            </div>
            <div style={{position: 'absolute', left: 70, top: 236, ...rise(b[7], 0)}}>
              <Zh size={30} w={500} color={EB.dim}>
                视频生成背后，5 个负责「看懂」的模型
              </Zh>
            </div>
            <div style={{position: 'absolute', left: 70, right: 70, bottom: 46, display: 'flex', gap: 14}}>
              {[
                ['Caption', EB.cap],
                ['提示词增强', EB.vid],
                ['文本编码器', EB.vid],
                ['奖励模型', EB.red],
                ['自动评测', EB.amber],
              ].map(([n, c], i) => (
                <div key={n} style={{flex: 1, border: `1px solid ${c}`, background: `color-mix(in srgb, ${c} 14%, transparent)`, borderRadius: 6, padding: '14px 16px', ...pop(b[7], 6 + i * 5)}}>
                  <Mo size={12} color={c}>
                    0{i + 1}
                  </Mo>
                  <div>
                    <Zh size={24} w={700}>
                      {n}
                    </Zh>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Monitor>
      <Inspector title={titleOn ? '原文' : '奖励模型 · 只扣瑕疵'}>
        {titleOn ? (
          <>
            <IRow k="作者" v="Kling Team" />
            <IRow k="发布" v="2026-11-03 · arXiv" />
            <IRow k="篇幅" v="38 页" />
            <IRow k="代码 / 权重" v={<Zh size={18} w={600} color={EB.dim}>未开源</Zh>} />
            <ISec>标题</ISec>
            <div style={{padding: '0 16px'}}>
              <Zh size={19} w={500} color={EB.dim} style={{lineHeight: 1.5}}>
                Behind Video Generation: Observations and Insights on Multimodal Understanding from Kling
              </Zh>
            </div>
          </>
        ) : (
          <>
            <IRow k="规则" v="见一个瑕疵，扣一次分" o={prog(b[0], 12)} />
            <IRow k="发现瑕疵" v={<Num size={26} color={nDef && !still ? EB.red : EB.aud}>{still > 0.5 ? 0 : nDef}</Num>} o={prog(b[1], 12)} />
            <IRow k="运动幅度" v={<Num size={26} color={still > 0.5 ? EB.amber : EB.ink}>{(0.82 * (1 - still) + 0.02 * still).toFixed(2)}</Num>} o={prog(b[3], 12)} />
            <ISec o={prog(b[2], 12)}>得分（满分 5，示意）</ISec>
            <div style={{padding: '4px 16px', opacity: prog(b[2], 12), display: 'flex', alignItems: 'baseline', gap: 12}}>
              <Num size={96} color={b[4] >= 0 ? EB.aud : EB.red}>
                {score.toFixed(1)}
              </Num>
              {b[4] >= 0 && (
                <Zh size={22} w={700} color={EB.aud}>
                  不动，分反而更高
                </Zh>
              )}
            </div>
          </>
        )}
      </Inspector>
      <Timeline
        title={titleOn ? '全片 · 按原文章节' : '一段 rollout · 5 秒'}
        marks={titleOn ? ['引言', '底座', 'Caption', '提示词', '编码器', '奖励模型', '评测'] : ['0s', '1s', '2s', '3s', '4s', '5s']}
        tracks={
          titleOn
            ? [
                {name: 'V1', desc: '章节', clips: [[0, 9, '引言', EB.dim], [9.2, 20, '01 底座', EB.violet], [20.2, 40, '02 Caption', EB.cap], [40.2, 58, '03 提示词', EB.vid], [58.2, 66, '04 编码器', EB.vid], [66.2, 88, '05 奖励模型', EB.red], [88.2, 99.6, '06 评测', EB.amber]].map(([a, bb, l, c], i) => ({a: a as number, b: bb as number, label: l as string, color: c as string, f: b[6] - i * 3}))},
                {name: 'A1', desc: '旁白', clips: [{a: 0, b: 99.6, color: EB.aud, children: <Wave />}]},
              ]
            : [
                {name: 'V1', desc: '生成视频', clips: [{a: 0, b: 99.6, label: 'rollout #3', color: EB.vid}]},
                {name: 'E1', desc: '瑕疵', clips: DEFECTS.map((d, i) => ({a: 14 + i * 26, b: 30 + i * 26, label: d.label, color: EB.red, f: b[1] - i * 14, o: 1 - still}))},
                {name: 'M', desc: '运动幅度', clips: [{a: 0, b: 99.6, color: EB.amber, children: <MotionLine amp={amp} f={frame} />}]},
              ]
        }
      />
    </Bay>
  );
};

const MotionLine: React.FC<{amp: number; f: number}> = ({amp, f}) => (
  <svg width={1700} height={30} style={{position: 'absolute', left: 6, top: 0}}>
    <polyline
      fill="none"
      stroke={EB.amber}
      strokeWidth={2.5}
      points={Array.from({length: 110}, (_, i) => `${i * 16},${15 - 11 * amp * Math.sin(i * 0.33 + f / 6)}`).join(' ')}
    />
  </svg>
);

// ------------------------------------------------------------------ chain (intro)
const YEARS = [
  ['2023', '还只是设想', '帧'],
  ['2024', '惊艳的演示', '片段'],
  ['2025', '可用的镜头', '镜头'],
  ['2026', '完整短片', '整段'],
];
const LINKS = [
  ['DATA', '数据', EB.cap],
  ['CONDITIONING', '条件', EB.vid],
  ['ALIGNMENT', '对齐', EB.red],
  ['EVALUATION', '评测', EB.amber],
];
export const Chain: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const pop = usePopIn();
  const ph1 = b[5] < 0; // years / bottleneck part
  const out1 = prog(b[5], 14);
  const sym = (i: number) => (i === 0 ? b[7] : i === 1 ? b[8] : i === 2 ? b[9] : -1);
  return (
    <Bay>
      <Bin f={frame} />
      <Monitor>
        {/* part 1: four years + bottleneck */}
        <div style={{position: 'absolute', inset: 0, opacity: 1 - out1}}>
          <div style={{position: 'absolute', left: 40, right: 40, top: 40, display: 'flex', gap: 16}}>
            {YEARS.map(([y, t, u], i) => (
              <div key={y} style={{flex: 1, background: EB.p2, border: `1px solid ${i === 3 ? EB.head : EB.line}`, borderRadius: 8, padding: '16px 18px', ...pop(i < 3 ? b[0] - i * 8 : b[1])}}>
                <Num size={40} color={i === 3 ? EB.head : EB.ink}>
                  {y}
                </Num>
                <div style={{marginTop: 6}}>
                  <Zh size={22} w={600} color={EB.dim}>
                    {t}
                  </Zh>
                </div>
                <div style={{marginTop: 8}}>
                  <Mo size={14} color={EB.faint}>
                    评判单位 · {u}
                  </Mo>
                </div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 40, right: 40, top: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40}}>
            <div style={{...rise(b[2]), position: 'relative'}}>
              <Zh size={48} w={800} color={EB.dim}>
                画得好不好
              </Zh>
              <div style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 4, background: EB.red, transform: `scaleX(${prog(b[3], 14)})`, transformOrigin: 'left'}} />
            </div>
            <Zh size={44} w={700} color={EB.faint} style={{opacity: prog(b[3], 10)}}>
              →
            </Zh>
            <div style={rise(b[3], 4)}>
              <Zh size={56} w={900} color={EB.head}>
                听不听得懂
              </Zh>
            </div>
          </div>
          <div style={{position: 'absolute', left: 40, right: 40, top: 340, display: 'flex', justifyContent: 'center', gap: 20}}>
            {['动作对不对', '镜头对不对', '人物前后是不是同一个人'].map((t, i) => (
              <div key={t} style={{border: `1px solid ${EB.line}`, background: EB.p1, borderRadius: 6, padding: '10px 20px', ...pop(b[4], i * 6)}}>
                <Zh size={24} w={600}>
                  <span style={{color: EB.amber}}>？</span> {t}
                </Zh>
              </div>
            ))}
          </div>
        </div>
        {/* part 2: the chain */}
        {!ph1 && (
          <div style={{position: 'absolute', inset: 0}}>
            <div style={{position: 'absolute', left: 50, top: 36, ...rise(b[5])}}>
              <Zh size={30} w={700}>
                视频生成的质量 = 整条链上的理解
              </Zh>
            </div>
            <div style={{position: 'absolute', left: 50, right: 50, top: 110, display: 'flex', alignItems: 'center', gap: 12}}>
              {LINKS.map(([en, zh, c], i) => (
                <React.Fragment key={en}>
                  <div style={{flex: 1, height: 130, border: `1.5px solid ${c}`, background: `color-mix(in srgb, ${c} 14%, transparent)`, borderRadius: 8, padding: '16px 18px', boxSizing: 'border-box', ...pop(b[6], i * 6)}}>
                    <Mo size={13} color={c}>
                      {i + 1} {en}
                    </Mo>
                    <div style={{marginTop: 8}}>
                      <Zh size={38} w={800}>
                        {zh}
                      </Zh>
                    </div>
                  </div>
                  {i < 3 && (
                    <Zh size={30} w={600} color={EB.faint} style={{opacity: prog(b[6], 10, 8 + i * 6)}}>
                      →
                    </Zh>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{position: 'absolute', left: 50, top: 290, ...rise(b[7])}}>
              <Zh size={26} w={700} color={EB.amber}>
                同一个症状：视频里的人不动
              </Zh>
            </div>
            <div style={{position: 'absolute', left: 50, right: 50, top: 340, display: 'flex', gap: 16}}>
              {[
                ['数据', '训练数据漏写了动作', EB.cap],
                ['条件', '文本编码器丢了时间信息', EB.vid],
                ['对齐', '奖励模型偏爱静止的画面', EB.red],
              ].map(([k, t, c], i) => (
                <div key={k} style={{flex: 1, borderLeft: `4px solid ${c}`, background: EB.p2, borderRadius: 4, padding: '12px 16px', ...pop(sym(i))}}>
                  <Mo size={13} color={c}>
                    可能出在 · {k}
                  </Mo>
                  <div>
                    <Zh size={23} w={600}>
                      {t}
                    </Zh>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Monitor>
      <Inspector title={ph1 ? '第 1 节 · 引言' : '核心观点'}>
        {ph1 ? (
          <>
            <ISec>评判单位在变大</ISec>
            {['帧', '片段', '镜头', '整段成片'].map((u, i) => (
              <IRow key={u} k={YEARS[i][0]} v={u} o={prog(i < 3 ? b[0] : b[1], 12, i * 8)} />
            ))}
            <ISec o={prog(b[2], 12)}>瓶颈</ISec>
            <IRow k="以前" v={<Zh size={18} w={600} color={EB.dim}>渲染</Zh>} o={prog(b[2], 12)} />
            <IRow k="现在" v={<Zh size={18} w={700} color={EB.head}>语义控制</Zh>} o={prog(b[3], 12)} />
          </>
        ) : (
          <>
            <div style={{padding: '14px 16px'}}>
              <Zh size={19} w={500} color={EB.dim} style={{lineHeight: 1.6}}>
                Video generation quality is the projection of multimodal understanding through the entire data–conditioning–alignment–evaluation chain.
              </Zh>
            </div>
            <ISec o={prog(b[7], 12)}>一个失败，不等于诊断</ISec>
            <div style={{padding: '0 16px', opacity: prog(b[7], 12)}}>
              <Zh size={18} w={500} color={EB.dim}>
                同样的症状，可能来自链上不同的环节。
              </Zh>
            </div>
          </>
        )}
      </Inspector>
      <Timeline
        title={ph1 ? '2023 → 2026' : '数据 → 条件 → 对齐 → 评测'}
        marks={ph1 ? ['2023', '2024', '2025', '2026'] : ['数据', '条件', '对齐', '评测']}
        tracks={
          ph1
            ? [
                {name: 'V1', desc: '单位', clips: YEARS.map(([y, , u], i) => ({a: i * 25, b: i * 25 + 24.4, label: `${y} · ${u}`, color: i === 3 ? EB.head : EB.vid, f: i < 3 ? b[0] - i * 8 : b[1]}))},
                {name: 'T1', desc: '瓶颈', clips: [{a: 0, b: 60, label: '渲染：画得好不好', color: EB.faint, f: b[2]}, {a: 60.4, b: 99.6, label: '语义控制：听不听得懂', color: EB.head, f: b[3]}]},
              ]
            : [
                {name: 'C1', desc: '链条', clips: LINKS.map(([, zh, c], i) => ({a: i * 25, b: i * 25 + 24.4, label: zh as string, color: c as string, f: b[6] - i * 6}))},
                {name: 'E1', desc: '可能原因', clips: [0, 1, 2].map((i) => ({a: i * 25, b: i * 25 + 24.4, label: '？', color: EB.amber, f: sym(i)}))},
              ]
        }
      />
    </Bay>
  );
};

// ------------------------------------------------------------------ base (Kling-MLLM)
const ROLES = [
  ['Captioner', '写 caption', EB.cap],
  ['PE', '改提示词', EB.vid],
  ['TE', '文本编码器', EB.vid],
  ['GRM / DRM', '奖励模型', EB.red],
  ['Eval', '自动评测', EB.amber],
];
export const Base: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const pop = usePopIn();
  const roleF = (i: number) => (i < 3 ? b[8] - i * 8 : b[9] - (i - 3) * 8);
  return (
    <Bay>
      <Bin cur={0} f={99} />
      <Monitor>
        {/* the base block */}
        <div style={{position: 'absolute', left: 337, top: 170, width: 400, height: 120, borderRadius: 10, border: `2px solid ${EB.violet}`, background: 'rgba(180,140,255,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${30 * prog(b[0], 20)}px rgba(180,140,255,0.35)`, ...pop(b[0])}}>
          <Zh size={40} w={900}>
            Kling-MLLM
          </Zh>
          <Mo size={15} color="#CDB8FF">
            一个底座 · 统一图片 / 视频 / 音频
          </Mo>
        </div>
        {/* inputs (left) */}
        {[
          ['图片', EB.vid, 0],
          ['视频', EB.vid, 1],
          ['音频', EB.aud, 2],
        ].map(([n, c, i]) => (
          <div key={n as string} style={{position: 'absolute', left: 40, top: 150 + (i as number) * 60, display: 'flex', alignItems: 'center', gap: 12, ...rise(b[5], (i as number) * 5)}}>
            <div style={{width: 120, height: 40, borderRadius: 5, border: `1px solid ${c}`, background: `color-mix(in srgb, ${c as string} 18%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Zh size={19} w={700}>
                {n}
              </Zh>
            </div>
            <div style={{width: 140 * prog(b[5], 16, 6 + (i as number) * 5), height: 2, background: c as string}} />
          </div>
        ))}
        {/* sizes */}
        <div style={{position: 'absolute', left: 337, top: 60, width: 400, display: 'flex', gap: 10, justifyContent: 'center'}}>
          {[
            ['27B', '稠密', b[1]],
            ['35B-A3B', 'MoE', b[2]],
            ['397B-A17B', 'MoE', b[2] - 6],
          ].map(([s, k, f]) => (
            <div key={s as string} style={{border: `1px solid ${EB.line}`, background: EB.p2, borderRadius: 6, padding: '6px 12px', textAlign: 'center', ...pop(f as number)}}>
              <Mo size={18} color={EB.ink} w={700}>
                {s}
              </Mo>
              <div>
                <Zh size={13} w={500} color={EB.dim}>
                  {k}
                </Zh>
              </div>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 337, top: 304, width: 400, textAlign: 'center', ...rise(b[3])}}>
          <Zh size={19} w={500} color={EB.dim}>
            语言 + 视觉：从千问 3.5–3.8 起步
          </Zh>
          <span style={{opacity: prog(b[4], 12)}}>
            <Zh size={19} w={700} color={EB.aud}>
              {' '}
              + 音频塔
            </Zh>
          </span>
        </div>
        {/* roles (right) */}
        <div style={{position: 'absolute', right: 34, top: 40, width: 250}}>
          <div style={{...rise(b[7]), marginBottom: 10}}>
            <Lab size={13}>各自后训练 → 5 个岗位</Lab>
          </div>
          {ROLES.map(([en, zh, c], i) => (
            <div key={en} style={{display: 'flex', alignItems: 'center', gap: 10, height: 66, borderLeft: `4px solid ${c}`, background: EB.p2, borderRadius: 4, marginBottom: 8, padding: '0 14px', ...pop(roleF(i))}}>
              <div>
                <Zh size={22} w={700}>
                  {zh}
                </Zh>
                <div>
                  <Mo size={13} color={c}>
                    {en}
                  </Mo>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* branch wires */}
        <svg style={{position: 'absolute', left: 0, top: 0}} width={1074} height={498}>
          {ROLES.map((_, i) => {
            const p = prog(roleF(i), 16);
            const y1 = 230;
            const y2 = 40 + 24 + i * 74 + 33;
            const x1 = 737;
            const x2 = 790;
            return <path key={i} d={`M${x1} ${y1} C ${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}`} stroke={ROLES[i][2]} strokeWidth={2} fill="none" strokeDasharray="200" strokeDashoffset={200 * (1 - p)} opacity={p > 0 ? 1 : 0} />;
          })}
        </svg>
        <ScreenSrc f={b[0]}>原文 §2 · 图 2</ScreenSrc>
      </Monitor>
      <Inspector title="Kling-MLLM">
        <IRow k="稠密版" v={<Mo size={17} color={EB.ink}>27B</Mo>} o={prog(b[1], 12)} />
        <IRow k="MoE 版" v={<Mo size={17} color={EB.ink}>35B-A3B · 397B-A17B</Mo>} o={prog(b[2], 12)} />
        <IRow k="初始化" v="千问 3.5–3.8" o={prog(b[3], 12)} />
        <IRow k="新增" v="音频塔" o={prog(b[4], 12)} />
        <IRow k="输入" v="同一个序列" o={prog(b[5], 12)} />
        <IRow k="音频时间戳" v="每 5 秒一个" o={prog(b[6], 12)} />
        <ISec o={prog(b[6], 12)}>为什么插时间戳</ISec>
        <div style={{padding: '0 16px', opacity: prog(b[6], 12)}}>
          <Zh size={17} w={500} color={EB.dim} style={{lineHeight: 1.6}}>
            模型从 token 的位置推算时间并不可靠，直接告诉它更准。
          </Zh>
        </div>
      </Inspector>
      <Timeline
        title="同一个序列：时间戳把音频和画面对齐"
        marks={['0s', '5s', '10s', '15s']}
        tracks={[
          {name: 'T', desc: '文字', clips: [{a: 0, b: 12, label: '提示 / 问题', color: EB.dim, f: b[5]}]},
          {name: 'V', desc: '画面', clips: Array.from({length: 9}, (_, i) => ({a: 13 + i * 9.6, b: 13 + i * 9.6 + 8.6, label: `帧`, color: EB.vid, f: b[5] - i * 2}))},
          {
            name: 'A',
            desc: '音频',
            clips: [0, 1, 2].map((i) => ({a: 13 + i * 28.8, b: 13 + (i + 1) * 28.8 - 0.6, color: EB.aud, f: b[5] - 6 - i * 4, children: <Wave w={480} seed={i * 40} />})),
          },
          {name: 'TS', desc: '时间戳', clips: [0, 1, 2, 3].map((i) => ({a: 13 + i * 28.8 - 1, b: 13 + i * 28.8 + 4, label: `${i * 5}s`, color: EB.head, f: b[6] - i * 5}))},
        ]}
      />
    </Bay>
  );
};
