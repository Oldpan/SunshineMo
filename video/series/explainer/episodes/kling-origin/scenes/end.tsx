// 评测 / 结尾 — editbay chapters.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useBeats, useScene} from '@atv/lib/timing';
import {Bay, Bin, EB, Inspector, IRow, ISec, Mo, Monitor, Num, prog, rise, ScreenSrc, Timeline, usePopIn, Zh} from './common';

/** Mini editing frame: a person whose coat is the edited region. */
const EditFrame: React.FC<{coat: string; bg?: string; label: string; f: number}> = ({coat, bg = '#2A3140', label, f}) => (
  <div style={{opacity: prog(f, 12)}}>
    <div style={{position: 'relative', width: 200, height: 140, background: bg, borderRadius: 6, overflow: 'hidden', border: `1px solid ${EB.line}`}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 36, background: '#3A4256'}} />
      <div style={{position: 'absolute', left: 82, top: 22, width: 36, height: 36, borderRadius: 18, background: '#E8C9A8'}} />
      <div style={{position: 'absolute', left: 66, top: 60, width: 68, height: 70, borderRadius: '20px 20px 4px 4px', background: coat}} />
    </div>
    <div style={{marginTop: 6, textAlign: 'center'}}>
      <Mo size={15}>{label}</Mo>
    </div>
  </div>
);

// ------------------------------------------------------------------ evals
export const Evals: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const pop = usePopIn();
  const ph1 = b[3] < 0;
  const out1 = prog(b[3], 14);
  const cases = [
    {n: '原样交回', i: '0', p: '1', s: '0', c: EB.red, src: '#4A5468'},
    {n: '整段重画', i: '1', p: '0', s: '0', c: EB.red, src: '#C9493F'},
    {n: '该改的改了，该保的保住', i: '0.9', p: '0.9', s: '0.81', c: EB.aud, src: '#C9493F'},
  ];
  const ups = [
    {k: 'caption 写错了', t: '→ 回查标注和 captioner', c: EB.cap},
    {k: '参考绑错了', t: '→ 回查条件', c: EB.vid},
    {k: '奖励模型带偏了', t: '→ 回查生成和奖励模型', c: EB.red},
  ];
  return (
    <Bay>
      <Bin cur={5} f={frame} />
      <Monitor>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - out1}}>
          <div style={{position: 'absolute', left: 40, right: 40, top: 30, display: 'flex', gap: 12, ...rise(b[0])}}>
            {['文生视频', '参考生成', '视频编辑', '多镜头'].map((t, i) => (
              <div key={t} style={{flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 6, border: `1px solid ${i === 2 && b[1] >= 0 ? EB.amber : EB.line}`, background: i === 2 && b[1] >= 0 ? 'rgba(244,183,64,0.12)' : EB.p2, ...pop(b[0], i * 5)}}>
                <Zh size={24} w={700} color={i === 2 && b[1] >= 0 ? EB.amber : EB.ink}>
                  {t}
                </Zh>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 40, top: 110, ...rise(b[0], 10)}}>
            <Zh size={22} w={600} color={EB.dim}>
              按任务出题，每种任务有自己的“刷分捷径”要堵
            </Zh>
          </div>
          {/* editing: change vs keep */}
          <div style={{position: 'absolute', left: 40, top: 170, display: 'flex', gap: 18, alignItems: 'center'}}>
            <EditFrame coat="#4A5468" label="原视频" f={b[1]} />
            <Zh size={30} color={EB.faint} style={{opacity: prog(b[1], 10, 8)}}>
              →
            </Zh>
            <EditFrame coat="#C9493F" label="指令：外套改成红色" f={b[1] + -10} />
          </div>
          <div style={{position: 'absolute', left: 40, top: 370, display: 'flex', flexDirection: 'column', gap: 8, opacity: prog(b[1], 12, 16)}}>
            <Zh size={22} w={700} color={EB.amber}>
              IF 该改的要改：外套
            </Zh>
            <Zh size={22} w={700} color={EB.cap}>
              FP 不该动的要保住：脸、背景
            </Zh>
          </div>
          {/* formula + cases */}
          <div style={{position: 'absolute', left: 520, top: 170, width: 520, ...rise(b[2])}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
              <Mo size={30} color={EB.ink} w={700}>
                EI = IF × FP
              </Mo>
              <Zh size={18} w={500} color={EB.dim}>
                两项相乘
              </Zh>
            </div>
            <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10}}>
              {cases.map((c, i) => (
                <div key={c.n} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: EB.p2, borderLeft: `4px solid ${c.c}`, borderRadius: 4, ...pop(b[2], 10 + i * 10)}}>
                  <div style={{width: 196}}>
                    <Zh size={20} w={700}>
                      {c.n}
                    </Zh>
                  </div>
                  <Mo size={20} color={EB.dim}>
                    {c.i} × {c.p} =
                  </Mo>
                  <Num size={34} color={c.c}>
                    {c.s}
                  </Num>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* part 2: trace back */}
        {!ph1 && (
          <div style={{position: 'absolute', inset: 0}}>
            <div style={{position: 'absolute', left: 40, top: 34, ...rise(b[3])}}>
              <Zh size={30} w={800}>
                每个失败，都要能往回追
              </Zh>
            </div>
            <div style={{position: 'absolute', right: 40, top: 150, width: 300, padding: '22px 20px', borderRadius: 8, border: `1.5px solid ${EB.red}`, background: 'rgba(255,91,91,0.1)', ...pop(b[3], 6)}}>
              <Mo size={14} color={EB.red}>
                FAIL · 评测记录
              </Mo>
              <div style={{marginTop: 8}}>
                <Zh size={26} w={800}>
                  这一条没过
                </Zh>
              </div>
              <div style={{marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4}}>
                {['评测标准', '抽到的证据', '工具输出', '裁判理由', '可能的上游'].map((t, i) => (
                  <Zh key={t} size={18} w={500} color={EB.dim} style={{opacity: prog(b[3], 8, 14 + i * 5)}}>
                    · {t}
                  </Zh>
                ))}
              </div>
            </div>
            <div style={{position: 'absolute', left: 40, top: 130, width: 620, display: 'flex', flexDirection: 'column', gap: 16}}>
              {ups.map((u, i) => (
                <div key={u.k} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: EB.p2, borderLeft: `4px solid ${u.c}`, borderRadius: 4, ...pop(b[4], i * 10)}}>
                  <Zh size={26} w={800} color={u.c}>
                    {u.k}
                  </Zh>
                  <Zh size={20} w={500} color={EB.dim}>
                    {u.t}
                  </Zh>
                </div>
              ))}
            </div>
            <svg width={1074} height={498} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M 726 ${240} C 690 ${240}, 700 ${170 + i * 86}, 668 ${170 + i * 86}`} fill="none" stroke={EB.faint} strokeWidth={2} strokeDasharray="6 6" opacity={prog(b[4], 12, i * 10)} />
              ))}
            </svg>
          </div>
        )}
        <ScreenSrc f={b[0]}>原文 §8 · 公式 (3)：AVE-Compass 编辑意图分 = 指令遵循 × 保真</ScreenSrc>
      </Monitor>
      <Inspector title={ph1 ? '第 8 节 · 自动评测' : '失败要留证据'}>
        {ph1 ? (
          <>
            <ISec>编辑任务</ISec>
            <IRow k="IF" v="指令遵循" o={prog(b[1], 12, 16)} />
            <IRow k="FP" v="保真" o={prog(b[1], 12, 24)} />
            <ISec o={prog(b[2], 12)}>为什么相乘</ISec>
            <div style={{padding: '0 16px', opacity: prog(b[2], 12)}}>
              <Zh size={18} w={500} color={EB.dim}>
                原样交回或者整段重画，都有一项是 0，乘出来也是 0。
              </Zh>
            </div>
          </>
        ) : (
          <>
            <IRow k="caption 失败" v="标注 / captioner" o={prog(b[4], 12)} />
            <IRow k="绑定失败" v="条件" o={prog(b[4], 12, 10)} />
            <IRow k="真实感失败" v="生成 / 奖励模型" o={prog(b[4], 12, 20)} />
            <IRow k="评测分歧" v="协议校准" o={prog(b[4], 12, 30)} />
          </>
        )}
      </Inspector>
      <Timeline
        title={ph1 ? '一次编辑 · 改与保' : '数据 → 条件 → 对齐 → 评测'}
        marks={ph1 ? ['0s', '2s', '4s', '6s', '8s'] : ['数据', '条件', '对齐', '评测']}
        tracks={
          ph1
            ? [
                {name: 'V1', desc: '外套', clips: [{a: 0, b: 99.6, label: '该改：外套变红', color: EB.amber, f: b[1]}]},
                {name: 'V2', desc: '脸 / 背景', clips: [{a: 0, b: 99.6, label: '该保：不动', color: EB.cap, f: b[1] + -8}]},
                {name: 'S', desc: '分数', clips: [{a: 0, b: 99.6, label: 'IF × FP', color: EB.head, f: b[2]}]},
              ]
            : [
                {name: 'D', desc: '数据', clips: [{a: 0, b: 24.6, label: 'caption', color: EB.cap, f: b[4]}]},
                {name: 'C', desc: '条件', clips: [{a: 25, b: 49.6, label: '参考绑定', color: EB.vid, f: b[4] - 10}]},
                {name: 'A', desc: '对齐', clips: [{a: 50, b: 74.6, label: '奖励模型', color: EB.red, f: b[4] - 20}]},
                {name: 'E', desc: '评测', clips: [{a: 75, b: 99.6, label: '失败记录', color: EB.amber, f: b[3]}]},
              ]
        }
      />
    </Bay>
  );
};

// ------------------------------------------------------------------ outro
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const scene = useScene();
  const pop = usePopIn();
  const tips = [
    {k: '倒着造数据', t: '从好片的 caption 反写用户的话', c: EB.vid, from: '提示词增强'},
    {k: '漏报也扣分', t: '裁判少报瑕疵，不能得高分', c: EB.red, from: '奖励模型 GRM'},
    {k: '运动幅度单独打分', t: '只罚瑕疵，模型就学会不动', c: EB.amber, from: '奖励模型 DRM'},
  ];
  const fadeEnd = interpolate(frame, [scene.duration - 24, scene.duration], [1, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Bay>
      <Bin f={frame} />
      <Monitor>
        <div style={{position: 'absolute', inset: 0, opacity: fadeEnd}}>
          <div style={{position: 'absolute', left: 40, top: 34, display: 'flex', alignItems: 'center', gap: 14, ...rise(b[0])}}>
            <div style={{padding: '6px 14px', border: `1px solid ${EB.line}`, borderRadius: 6, background: EB.p2}}>
              <Zh size={22} w={700} color={EB.dim}>
                没有开源代码和权重
              </Zh>
            </div>
            <Zh size={22} w={600} color={EB.faint}>
              但这几招能直接拿去用
            </Zh>
          </div>
          <div style={{position: 'absolute', left: 40, right: 40, top: 110, display: 'flex', gap: 16}}>
            {tips.map((t, i) => (
              <div key={t.k} style={{flex: 1, height: 220, border: `1.5px solid ${t.c}`, background: `color-mix(in srgb, ${t.c} 12%, transparent)`, borderRadius: 8, padding: '18px 20px', boxSizing: 'border-box', ...pop(b[1], i * 10)}}>
                <Mo size={14} color={t.c}>
                  {String(i + 1).padStart(2, '0')} · {t.from}
                </Mo>
                <div style={{marginTop: 12}}>
                  <Zh size={32} w={900}>
                    {t.k}
                  </Zh>
                </div>
                <div style={{marginTop: 12}}>
                  <Zh size={20} w={500} color={EB.dim}>
                    {t.t}
                  </Zh>
                </div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 372, textAlign: 'center', ...rise(b[3])}}>
            <Zh size={44} w={900} color={EB.head}>
              我是老潘，下期再见
            </Zh>
          </div>
        </div>
        <ScreenSrc f={b[0]}>Behind Video Generation · Kling Team · arXiv 2611.04916</ScreenSrc>
      </Monitor>
      <Inspector title="原文">
        <IRow k="标题" v={<Zh size={16} w={600} color={EB.ink}>Behind Video Generation</Zh>} />
        <IRow k="作者" v="Kling Team" />
        <IRow k="发布" v="2026-11-03 · arXiv" />
        <IRow k="编号" v="2611.04916" />
        <IRow k="篇幅" v="38 页" />
        <IRow k="代码 / 权重" v={<Zh size={18} w={600} color={EB.dim}>未开源</Zh>} o={prog(b[0], 12)} />
        <ISec o={prog(b[2], 12)}>适合</ISec>
        <div style={{padding: '0 16px', opacity: prog(b[2], 12)}}>
          <Zh size={18} w={500} color={EB.dim}>
            做视频生成、多模态理解的团队
          </Zh>
        </div>
      </Inspector>
      <Timeline
        title="全片 · 回顾"
        marks={['引言', '底座', 'Caption', '提示词', '编码器', '奖励模型', '评测']}
        tracks={[
          {
            name: 'V1',
            desc: '章节',
            clips: (
              [
                [0, 9, '引言', EB.dim],
                [9.2, 20, '01 底座', EB.violet],
                [20.2, 40, '02 Caption', EB.cap],
                [40.2, 58, '03 提示词', EB.vid],
                [58.2, 66, '04 编码器', EB.vid],
                [66.2, 88, '05 奖励模型', EB.red],
                [88.2, 99.6, '06 评测', EB.amber],
              ] as [number, number, string, string][]
            ).map(([a, bb, l, c], i) => ({a, b: bb, label: l, color: c, f: b[0] - i * 3})),
          },
          {name: 'T1', desc: '拿走', clips: tips.map((t, i) => ({a: [40.2, 66.2, 77.2][i], b: [58, 77, 88][i], label: t.k, color: t.c, f: b[1] - i * 10}))},
        ]}
      />
    </Bay>
  );
};
