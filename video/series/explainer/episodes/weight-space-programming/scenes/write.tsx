// Part 2 · writing weights: Experiment 4 (fix the car that stalls on the ramp) and Experiment 5 (MinAtar networks
// written from scratch).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {
  Answer,
  Big,
  CarScene,
  Card,
  clamp01,
  Correct,
  count,
  D,
  FONT_MONO,
  Head,
  Lab,
  Mark,
  Mo,
  PlayBoard,
  playScore,
  prog,
  Prompt,
  Reasoning,
  rise,
  Setup,
  Shell,
  SrcLine,
  Zh,
} from './common';

// ------------------------------------------------------------------ Experiment 4 · the car
const NetPath: React.FC<{p: number; off: number}> = ({p, off}) => {
  // columns: input 679, 128 (ReLU), five 128 (tanh), 16 logits — drawn as 8 dots each; a green side path of 2 units
  const cols = 8;
  const X = (c: number) => 40 + c * 128;
  const Y = (j: number) => 40 + j * 30;
  const path: [number, number][] = [
    [0, 1],
    [1, 6],
    [2, 6],
    [3, 7],
    [4, 6],
    [5, 7],
    [6, 6],
    [7, 2],
  ];
  return (
    <svg width={X(cols - 1) + 60} height={Y(7) + 60}>
      {Array.from({length: cols - 1}, (_, c) =>
        Array.from({length: 8}, (_, i) =>
          Array.from({length: 8}, (_, j) => (
            <line key={`${c}-${i}-${j}`} x1={X(c)} y1={Y(i)} x2={X(c + 1)} y2={Y(j)} stroke={D.axis} strokeOpacity={0.18} strokeWidth={1} />
          )),
        ),
      )}
      {path.slice(1).map(([c, j], k) => {
        const [c0, j0] = path[k];
        const len = Math.hypot(X(c) - X(c0), Y(j) - Y(j0));
        const t = clamp01(p * 7 - k);
        return (
          <line
            key={k}
            x1={X(c0)}
            y1={Y(j0)}
            x2={X(c)}
            y2={Y(j)}
            stroke={D.green}
            strokeWidth={6}
            strokeOpacity={1 - 0.75 * off}
            strokeDasharray={`${len} ${len}`}
            strokeDashoffset={len * (1 - t)}
            strokeLinecap="round"
          />
        );
      })}
      {Array.from({length: cols}, (_, c) =>
        Array.from({length: 8}, (_, j) => {
          const on = path.some(([pc, pj]) => pc === c && pj === j) && p > c / 7;
          return <circle key={`${c}-${j}`} cx={X(c)} cy={Y(j)} r={9} fill={on ? D.green : '#fff'} stroke={on ? D.green : D.ink2} strokeWidth={2} opacity={on ? 1 - 0.6 * off : 1} />;
        }),
      )}
    </svg>
  );
};

export const Car: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const astra = b[7] > 0;
  const t = astra ? b[7] : Math.max(0, b[2]);
  const right1 = prog(b[1], 14) * (1 - prog(b[4], 12));
  const right2 = prog(b[4], 14) * (1 - prog(b[5], 12));
  const right3 = prog(b[5], 14) * (1 - prog(b[8], 12));
  const right4 = prog(b[8], 14);
  const chap = 1 - prog(b[1], 14);
  return (
    <Shell part="写权重">
      {chap > 0.01 && (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: chap}}>
          <div style={{textAlign: 'center', ...rise(b[0], 0)}}>
            <Lab size={28}>Part 2</Lab>
            <div style={{marginTop: 10, display: 'flex', gap: 40, alignItems: 'baseline'}}>
              <Zh size={64} w={500} color={D.faint} style={{textDecoration: 'line-through'}}>
                读
              </Zh>
              <Big size={150} color={D.green}>
                写权重
              </Big>
            </div>
          </div>
        </div>
      )}
      {chap < 0.99 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - chap}}>
          <Head kicker="Experiment 4 · 实验 4" title="一个失败的网络，改权重能修好吗？" f={b[1]} />
          <div style={{position: 'absolute', left: 96, top: 214, ...rise(b[2], 0)}}>
            <Card style={{padding: 14, width: 1000}}>
              <CarScene t={t} w={968} ppo={astra ? 0.38 : 1} astra={astra ? 1 : 0} />
              {!astra && b[2] > 0 && (
                <>
                  <div style={{position: 'absolute', left: 250, top: 40, opacity: prog(b[2], 12, 30)}}>
                    <Zh size={24} w={700} color={D.green}>
                      ① 先倒车 ←
                    </Zh>
                  </div>
                  <div style={{position: 'absolute', left: 480, top: 40, opacity: prog(b[2], 12, 60)}}>
                    <Zh size={24} w={700} color={D.green}>
                      ② 加速冲过红条 →
                    </Zh>
                  </div>
                  <div style={{position: 'absolute', left: 30, top: 40, opacity: prog(b[2], 12, 90)}}>
                    <Zh size={24} w={700} color="#1c6fcf">
                      ③ 碰到蓝色箱子
                    </Zh>
                  </div>
                </>
              )}
              {astra && (
                <div style={{position: 'absolute', left: 30, top: 34, display: 'flex', gap: 28, alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={{width: 18, height: 18, background: '#118659'}} />
                    <Zh size={22} w={700}>
                      Astra 改后
                    </Zh>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={{width: 18, height: 18, background: D.red, opacity: 0.45}} />
                    <Zh size={22} w={600} color={D.dim}>
                      PPO（淡色）：卡在坡上
                    </Zh>
                  </div>
                </div>
              )}
            </Card>
              {b[3] > 0 && !astra && (
                <div style={{position: 'absolute', left: 0, top: '100%', marginTop: 14, whiteSpace: 'nowrap', background: '#FDECEE', borderRadius: 10, padding: '6px 16px', opacity: prog(b[3], 12) * (1 - prog(b[6], 10))}}>
                  <Zh size={24} w={700} color={D.redDark}>
                    PPO：停在坡上，256 局 0 成功
                  </Zh>
                </div>
              )}
          </div>
          {/* the bypass */}
          <div style={{position: 'absolute', left: 96, top: 530, width: 1000, ...rise(b[6], 0)}}>
            <Card style={{padding: '14px 20px', height: 360}}>
              <Zh size={24} w={700}>
                每层借几个单元，搭一条小旁路
              </Zh>
              <div style={{position: 'absolute', left: 10, top: 56}}>
                <NetPath p={prog(b[6], 50, 10)} off={prog(b[7], 16, 60)} />
              </div>
              <div style={{position: 'absolute', left: 20, bottom: 14, opacity: prog(b[6], 12, 20)}}>
                <Zh size={20} w={600} color={D.green}>
                  读：位置、速度
                </Zh>
              </div>
              <div style={{position: 'absolute', right: 24, bottom: 14, opacity: prog(b[6], 12, 50)}}>
                <Zh size={20} w={600} color={D.green}>
                  输出：倒车 → 全速
                </Zh>
              </div>
              <div style={{position: 'absolute', right: 24, top: 16, opacity: prog(b[7], 12, 60), background: D.panel, borderRadius: 10, padding: '4px 14px'}}>
                <Zh size={21} w={700} color={D.dim}>
                  绿轮过了红条 → 旁路关掉，交还原网络
                </Zh>
              </div>
            </Card>
          </div>
          {/* right column phases */}
          <div style={{position: 'absolute', left: 1130, top: 214, width: 694}}>
            {right1 > 0.01 && (
              <div style={{position: 'absolute', left: 0, top: 0, opacity: right1}}>
                <Setup
                  f={b[2]}
                  w={694}
                  step={10}
                  rows={[
                    ['环境', 'Kinetix 物理模拟里的“小车上坡”关卡'],
                    ['网络', '官方 actor：679 → 128 → 5 层 128 → 16，171,664 个权重'],
                    ['输入', '679 个数：每个物体的位置、速度、形状，和关节'],
                    ['训练', '官方 PPO，10 亿步'],
                    ['结果', '256 局一局没成：卡在坡上（局部最优）'],
                  ]}
                />
              </div>
            )}
            {right2 > 0.01 && (
              <div style={{position: 'absolute', left: 0, top: 0, opacity: right2}}>
                <Prompt
                  f={b[4]}
                  w={694}
                  file="策略的 171,664 个权重（文本）+ 场景说明 + 一段录像"
                  fileRow={
                    <Mo size={18} color={D.dim}>
                      embed.W row 54 9 -2 -7 -4 7 18 -1 0 -5 -3 -4 8 …
                    </Mo>
                  }
                  question="先讲清为什么失败，再手改权重，让小车尽可能成功。"
                  rule="不许用工具，一次回复。"
                  cps={20}
                />
              </div>
            )}
            {right3 > 0.01 && (
              <div style={{position: 'absolute', left: 0, top: 0, opacity: right3}}>
                <Reasoning
                  w={694}
                  size={25}
                  gap={16}
                  items={[
                    {text: <>权重像一个看速度的“油门 / 滑行”控制器：嵌入单元 116 收到的水平速度权重是 <b>2.25、2.37、1.73</b></>, at: b[5]},
                    {text: <>录像里：小车冲到坡前没了速度，在油门和滑行之间来回切</>, at: b[5] - 40},
                    {text: <><b>倒车几乎从来不选</b></>, at: b[5] - 80},
                    {text: <>补一条路：先倒车助跑、再全力冲，绿轮过了红条就放手</>, at: b[6]},
                  ]}
                />
                <div style={{marginTop: 14, opacity: prog(b[6], 12, 30)}}>
                  <Card tint={D.panel} style={{padding: '12px 18px'}}>
                    <pre style={{margin: 0, fontFamily: FONT_MONO, fontSize: 19, color: D.ink2, lineHeight: 1.4}}>
                      {'embed.W[:, 6:9] = 0\nembed.b[6:9] = [0, 11, 0]\nembed.W[52, 6] = 1\nembed.W[54, 7] = 1\n…'}
                    </pre>
                    <Zh size={18} w={500} color={D.dim}>
                      Astra 写的改动（节选，共 57 行）
                    </Zh>
                  </Card>
                </div>
              </div>
            )}
            {right4 > 0.01 && (
              <div style={{position: 'absolute', left: 0, top: 0, width: 694, opacity: right4}}>
                <Card style={{padding: '28px 32px'}}>
                  <Zh size={24} w={600} color={D.dim}>
                    改了多少权重
                  </Zh>
                  <div style={{marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 14}}>
                    <Big size={76} color={D.green}>
                      {Math.round(count(b[8], 0, 6073, 40)).toLocaleString('en-US')}
                    </Big>
                    <Zh size={28} w={600} color={D.dim}>
                      / 171,664
                    </Zh>
                  </div>
                  <div style={{marginTop: 8, height: 18, background: D.hair, borderRadius: 9, overflow: 'hidden'}}>
                    <div style={{width: `${3.5 * prog(b[8], 40)}%`, height: '100%', background: D.green}} />
                  </div>
                  <div style={{marginTop: 6}}>
                    <Zh size={26} w={700} color={D.green}>
                      3.5%
                    </Zh>
                  </div>
                  <div style={{marginTop: 30}}>
                    <Zh size={24} w={600} color={D.dim}>
                      成功局数
                    </Zh>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
                    <Big size={76}>{Math.round(count(b[8], 0, 1024, 40, 30)).toLocaleString('en-US')}</Big>
                    <Zh size={28} w={600} color={D.dim}>
                      / 1,024 局
                    </Zh>
                  </div>
                  <div style={{marginTop: 12, opacity: prog(b[8], 12, 70)}}>
                    <Mark size={30}>100% 成功，原来是 0%</Mark>
                  </div>
                </Card>
              </div>
            )}
          </div>
          <SrcLine f={b[2]}>小车动画取自原文的 Kinetix 场景回放；旁路示意图只画结构（<span>示意</span>），改动代码节选自原文交互图</SrcLine>
        </div>
      )}
    </Shell>
  );
};

// ------------------------------------------------------------------ Experiment 5 · from scratch
const ROWS: [string, string, number, number, number][] = [
  ['Breakout', 'Breakout', 15.8, 25.3, 517.4],
  ['Seaquest', 'Seaquest', 5.6, 88.9, 53.1],
  ['Asterix', 'Asterix', 25.8, 55.2, 53.2],
];
export const Scratch: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const r1 = prog(b[2], 14) * (1 - prog(b[4], 12));
  const r2 = prog(b[4], 14) * (1 - prog(b[7], 12));
  const r3 = prog(b[7], 14);
  const zeroP = prog(b[3], 50);
  return (
    <Shell part="写权重">
      <Head kicker="Experiment 5 · 实验 5" title="从零写一个网络" sub="权重一开始全是 0" />
      {/* three boards played by Astra's networks */}
      <div style={{position: 'absolute', left: 96, top: 214, width: 520, display: 'flex', flexDirection: 'column', gap: 18}}>
        {ROWS.map(([k, name], i) => (
          <div key={k} style={{...rise(b[1], i * 8)}}>
            <Card tint={D.panel} style={{padding: '14px 18px', display: 'flex', gap: 22, alignItems: 'center', height: 214}}>
              <PlayBoard game={k} t={frame - i * 11} size={184} />
              <div>
                <Zh size={30} w={800}>
                  {name}
                </Zh>
                <div style={{marginTop: 6}}>
                  <Zh size={20} w={600} color={D.dim}>
                    Astra 写的网络在玩 · 得分
                  </Zh>
                </div>
                <Big size={44} color={D.green}>
                  {playScore(k, frame - i * 11)}
                </Big>
              </div>
            </Card>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 660, top: 214, width: 1164}}>
        {/* prompt + the weights it wrote */}
        {r1 > 0.01 && (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1164, opacity: r1}}>
            <Prompt
              f={b[2]}
              w={1164}
              file="游戏规则和源代码，以及一个权重全是 0 的网络（600 → 32 → 32 → 6）"
              question="从零写出这个策略网络的全部权重，把 Breakout 玩得越好越好。"
              rule="不训练、不用工具：每个数字都由 Astra 自己定，一次回复写完。"
              cps={26}
            />
            <div style={{marginTop: 18, display: 'flex', gap: 18, flexWrap: 'wrap', opacity: prog(b[2], 12, 60)}}>
              {['没有数据', '没有损失函数', '没有梯度', '不能试玩'].map((t) => (
                <div key={t} style={{border: `2px solid ${D.border}`, borderRadius: 999, padding: '6px 20px'}}>
                  <Zh size={24} w={600}>
                    <span style={{color: D.red}}>✕ </span>
                    {t}
                  </Zh>
                </div>
              ))}
            </div>
            <div style={{marginTop: 18, opacity: prog(b[3], 12)}}>
              <Card tint={D.panel} style={{padding: '14px 20px'}}>
                <Zh size={20} w={600} color={D.dim}>
                  Astra 写的权重（节选，共 122 行）
                </Zh>
                <pre style={{margin: '6px 0 0', fontFamily: FONT_MONO, fontSize: 19, color: D.ink2, lineHeight: 1.45}}>
                  {'# Units 0..3: descending-right, descending-left, ascending-right, ascending-left.\n# Subtract paddle position from each target.\n'}
                  W1[540:600:6, 0] = [{['0', '-0.02', '-0.04', '-0.06', '-0.08', '-0.10', '-0.12', '-0.14', '-0.16', '-0.18'].map((v, i) => (i / 10 < zeroP ? v : '0')).join(', ')}]
                </pre>
              </Card>
            </div>
          </div>
        )}
        {/* scores */}
        {r2 > 0.01 && (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1164, opacity: r2}}>
            <Card style={{padding: '22px 30px', height: 660}}>
              <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
                {[
                  ['PPO 训练 1 亿步', D.axis],
                  ['PPO 训练 5 亿步', D.faint],
                  ['Astra 一次写成', D.green],
                ].map(([l, c]) => (
                  <div key={l} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <div style={{width: 18, height: 18, background: c}} />
                    <Zh size={22} w={600} color={D.dim}>
                      {l}
                    </Zh>
                  </div>
                ))}
                <Zh size={19} w={500} color={D.faint}>
                  每个游戏单独一把尺子
                </Zh>
              </div>
              {ROWS.map(([k, name, p1, p5, a], i) => {
                const max = Math.max(p1, p5, a);
                const hi = (i === 0 && b[5] > 0 && b[6] < 0) || (i > 0 && b[6] > 0);
                const bar = (v: number, c: string, d: number, label: string) => (
                  <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 40}}>
                    <div style={{width: (v / max) * 760 * prog(b[4], 30, d + i * 10), height: 30, background: c, minWidth: 3}} />
                    <Zh size={24} w={700} color={c === D.green ? D.greenDark : D.ink2} style={{opacity: prog(b[4], 10, d + i * 10 + 20)}}>
                      {v}
                      {label}
                    </Zh>
                  </div>
                );
                return (
                  <div key={k} style={{marginTop: 22, padding: '10px 14px', borderRadius: 12, background: hi ? D.wash : undefined}}>
                    <Zh size={26} w={800}>
                      {name}
                    </Zh>
                    {bar(p1, D.axis, 0, '')}
                    {bar(p5, D.faint, 6, '')}
                    {bar(a, D.green, 12, i === 0 ? '　≈ 5 亿步 PPO 的 20 倍' : i === 1 ? '　5 亿步 PPO 的六成' : '　接近 5 亿步 PPO')}
                  </div>
                );
              })}
            </Card>
          </div>
        )}
        {/* how: program -> network */}
        {r3 > 0.01 && (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1164, opacity: r3}}>
            <Card style={{padding: '26px 32px', height: 660}}>
              <Zh size={30} w={800}>
                先想好程序，再翻译成网络（Breakout）
              </Zh>
              <div style={{display: 'flex', gap: 30, marginTop: 30, alignItems: 'stretch'}}>
                {[
                  ['第一层', '算出球会落在哪', ['往右下落、往左下落、往右上飞、往左上飞：4 个落点误差', '再加 2 个方向指示', '下落预测考虑了撞墙反弹'], b[7]],
                  ['第二层', '把挡板往落点挪', ['比较落点和挡板位置，决定往左还是往右', '到位了就选“不动”'], b[8]],
                ].map(([t, s, items, f], i) => (
                  <div key={t as string} style={{flex: 1, ...rise(f as number, 0)}}>
                    <div style={{background: D.panel, border: `2px solid ${D.border}`, borderRadius: 16, padding: '20px 24px', height: 470}}>
                      <Lab size={22}>{t as string}</Lab>
                      <div style={{marginTop: 6}}>
                        <Zh size={36} w={800}>
                          {s as string}
                        </Zh>
                      </div>
                      {(items as string[]).map((it, j) => (
                        <div key={it} style={{marginTop: 18, ...rise(f as number, 16 + j * 12, 8)}}>
                          <Zh size={25} w={500}>
                            · {it}
                          </Zh>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
      <SrcLine f={b[1]} left={96}>
        分数照原文表格（1,000 局平均；PPO 取 3–10 个种子里最好的）；左侧是原文里 Astra 所写网络的对局回放
      </SrcLine>
    </Shell>
  );
};
