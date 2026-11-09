// 引言 / 底座 — editbay chapters (the cover moved to cover.tsx, a cartoon gameshow, 2026-11-06).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {
  Bay,
  Bin,
  EB,
  Inspector,
  IRow,
  ISec,
  Lab,
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
