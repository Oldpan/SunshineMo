// Progressive disclosure, the three reasons, when to keep a subagent, split by context, and the single-loop design.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Box, Card, clamp01, FONT_SERIF, Head, Illus, K, Lab, lerp, Mo, NumBadge, Packet, Pill, prog, rise, Serif, Shell, SrcLine, ToolSq, usePopIn, Wire, Zh} from './common';

// ------------------------------------------------------------------ progressive disclosure
const SKILLS = [
  {n: 'returns', d: '退货流程和规则'},
  {n: 'shipping', d: '查物流、改地址'},
  {n: 'billing', d: '账单与退款'},
];
export const Pd: React.FC = () => {
  const b = useBeats();
  const open = prog(b[1], 22, 14); // first skill expands
  const tool = prog(b[1], 22, 40); // a deferred tool loads
  return (
    <Shell part="替代做法">
      <Head kicker="PROGRESSIVE DISCLOSURE" title="渐进式披露" sub="用到才载入" />
      {/* context window */}
      <div style={{position: 'absolute', left: 96, top: 230, width: 1000, ...rise(b[0], 0)}}>
        <Card style={{padding: '24px 30px', minHeight: 600}}>
          <Lab size={16}>CONTEXT WINDOW · 主 agent</Lab>
          <div style={{marginTop: 18}}>
            <Zh size={22} w={700} color={K.dim}>
              Skills（只看一行描述）
            </Zh>
          </div>
          {SKILLS.map((s, i) => {
            const isOpen = i === 0 ? open : 0;
            return (
              <div key={s.n} style={{marginTop: 12, ...rise(b[0], 6 + i * 5)}}>
                <div style={{background: isOpen > 0.02 ? K.peach : K.cream, borderRadius: 8, padding: '10px 18px', overflow: 'hidden'}}>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                    <Mo size={22} w={700}>
                      {s.n}
                    </Mo>
                    <Zh size={22} w={500} color={K.dim}>
                      {s.d}
                    </Zh>
                  </div>
                  <div style={{height: isOpen * 120, opacity: isOpen}}>
                    {['1. 先查订单状态', '2. 超过 30 天不能退', '3. 走 create_return 工具'].map((l) => (
                      <div key={l} style={{marginTop: 8}}>
                        <Zh size={20} w={500} color={K.ink}>
                          {l}
                        </Zh>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{marginTop: 26}}>
            <Zh size={22} w={700} color={K.dim}>
              工具（靠工具搜索按需加载）
            </Zh>
          </div>
          <div style={{display: 'flex', gap: 14, marginTop: 14, alignItems: 'center', position: 'relative', height: 48}}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ToolSq key={i} x={i * 58} y={0} s={46} dashed={i > 1 && !(i === 2 && tool > 0.5)} o={rise(b[0], 18 + i * 3).opacity as number} />
            ))}
            <div style={{position: 'absolute', left: 370, top: 8, opacity: prog(b[0], 14, 30)}}>
              <Zh size={20} w={500} color={K.faint}>
                实心 = 已载入，虚线 = 只有名字
              </Zh>
            </div>
          </div>
        </Card>
      </div>
      {/* right: the rule */}
      <div style={{position: 'absolute', left: 1160, top: 250, width: 660}}>
        <div style={rise(b[0], 10)}>
          <Card hot style={{padding: '24px 30px'}}>
            <Zh size={30} w={800}>
              上下文 → skills
            </Zh>
            <div style={{marginTop: 10}}>
              <Zh size={30} w={800}>
                工具 → 工具搜索
              </Zh>
            </div>
          </Card>
        </div>
        <div style={{marginTop: 26, ...rise(b[1], 0)}}>
          <Card style={{padding: '24px 30px'}}>
            <Lab size={16} color={K.clay}>
              平时
            </Lab>
            <div style={{marginTop: 6}}>
              <Zh size={26} w={600}>
                只看到简短描述
              </Zh>
            </div>
            <div style={{marginTop: 18, opacity: prog(b[1], 14, 14)}}>
              <Lab size={16} color={K.clay}>
                真用到时
              </Lab>
              <div style={{marginTop: 6}}>
                <Zh size={26} w={600}>
                  才完整载入正文和工具定义
                </Zh>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <SrcLine f={b[0]}>skill 名和内容为示意（借用迁移套件的客服示例）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ three reasons
export const Why: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  // b0-1 reason 1, b2 reason 2, b3-5 reason 3
  const steps = ['第 1 步结果', '第 2 步结果', '第 3 步结果'];
  const cut = prog(b[2], 34, 14);
  const fade = prog(b[4], 30, 6);
  const W = 540;
  const col = (i: number) => 96 + i * (W + 36);
  return (
    <Shell part="替代做法">
      <Head kicker="WHY IT WORKS" title="三个理由" />
      {/* reason 1 */}
      <div style={{position: 'absolute', left: col(0), top: 230, width: W, ...pop(b[0], 0, 0.94)}}>
        <Card hot={b[2] < 0} style={{padding: '22px 26px', height: 620}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <NumBadge n={1} size={38} />
            <Zh size={30} w={800}>
              共享上下文
            </Zh>
          </div>
          <div style={{marginTop: 18, border: `2px solid ${K.clay}`, borderRadius: 10, padding: '12px 14px'}}>
            <Lab size={13} color={K.clay}>
              同一个窗口
            </Lab>
            {steps.map((s, i) => (
              <div key={s} style={{marginTop: 8, background: '#fff', borderRadius: 6, padding: '6px 12px', ...rise(b[0], 10 + i * 8)}}>
                <Zh size={21} w={600}>
                  {s}
                </Zh>
              </div>
            ))}
            <div style={{marginTop: 8, opacity: prog(b[0], 14, 40)}}>
              <Zh size={20} w={700} color={K.clay}>
                ↳ 模型能把它们串起来
              </Zh>
            </div>
          </div>
          <div style={{marginTop: 18, opacity: prog(b[1], 14)}}>
            <Lab size={13}>subagent 交回的</Lab>
            <div style={{display: 'flex', gap: 8, marginTop: 8}}>
              {['摘要', '摘要', '摘要'].map((s, i) => (
                <div key={i} style={{flex: 1, background: K.stone, borderRadius: 6, padding: '6px 0', textAlign: 'center', opacity: 0.85}}>
                  <Zh size={20} w={500} color={K.faint}>
                    {s}…
                  </Zh>
                </div>
              ))}
            </div>
            <div style={{marginTop: 10}}>
              <Zh size={20} w={500} color={K.dim}>
                每次交接都有损，次数越多丢得越多
              </Zh>
            </div>
          </div>
        </Card>
      </div>
      {/* reason 2 */}
      <div style={{position: 'absolute', left: col(1), top: 230, width: W, ...pop(b[2], 0, 0.94)}}>
        <Card hot={b[2] >= 0 && b[3] < 0} style={{padding: '22px 26px', height: 620}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <NumBadge n={2} size={38} />
            <Zh size={30} w={800}>
              不撑爆上下文
            </Zh>
          </div>
          <div style={{marginTop: 22}}>
            <Zh size={22} w={600} color={K.dim}>
              Claude Code 给更强模型的系统提示词
            </Zh>
          </div>
          <div style={{marginTop: 26, position: 'relative', height: 260}}>
            <div style={{position: 'absolute', left: 0, bottom: 0, width: 160, height: 240, background: K.stone2, borderRadius: 4}} />
            <div style={{position: 'absolute', left: 0, bottom: 252}}>
              <Lab size={14}>之前</Lab>
            </div>
            <Illus style={{position: 'absolute', right: 0, top: 0}} />
            <div style={{position: 'absolute', left: 230, bottom: 0, width: 160, height: lerp(240, 240 * 0.18, cut), background: K.clay, borderRadius: 4}} />
            <div style={{position: 'absolute', left: 230, bottom: lerp(252, 240 * 0.18 + 12, cut)}}>
              <Lab size={14} color={K.clay}>
                之后
              </Lab>
            </div>
          </div>
          <div style={{marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 12, opacity: prog(b[2], 14, 40)}}>
            <span style={{fontFamily: FONT_SERIF, fontSize: 76, fontWeight: 700, color: K.clay, lineHeight: 1}}>−80%+</span>
            <Zh size={22} w={600} color={K.dim}>
              含 skills、工具的渐进披露
            </Zh>
          </div>
        </Card>
      </div>
      {/* reason 3 */}
      <div style={{position: 'absolute', left: col(2), top: 230, width: W, ...pop(b[3], 0, 0.94)}}>
        <Card hot={b[3] >= 0} style={{padding: '22px 26px', height: 620}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <NumBadge n={3} size={38} />
            <Zh size={30} w={800}>
              模型更强了
            </Zh>
          </div>
          <div style={{marginTop: 20, display: 'flex', alignItems: 'center', gap: 12}}>
            <Pill bg={K.clay} color="#fff" border={K.clay}>
              Opus 4.5 起
            </Pill>
            <Zh size={22} w={600} color={K.dim}>
              一个循环能管更多
            </Zh>
          </div>
          <div style={{marginTop: 22}}>
            <Lab size={13}>框架里的部件</Lab>
            {['意图路由', '固定流水线', '进度汇报', '自查步骤'].map((s, i) => (
              <div
                key={s}
                style={{
                  marginTop: 8,
                  background: K.stone,
                  borderRadius: 6,
                  padding: '6px 12px',
                  opacity: i >= 2 ? 1 - fade * 0.8 : 1,
                  textDecoration: i >= 2 && fade > 0.5 ? 'line-through' : undefined,
                }}
              >
                <Zh size={21} w={600} color={K.dim}>
                  {s}
                  {i >= 2 && fade > 0.5 ? '：模型自己会做' : ''}
                </Zh>
              </div>
            ))}
          </div>
          <div style={{marginTop: 22, opacity: prog(b[5], 14)}}>
            <Zh size={24} w={800}>
              结构越简单，越好换下一代模型
            </Zh>
            <div style={{marginTop: 6}}>
              <Zh size={20} w={500} color={K.dim}>
                僵硬的多 agent 结构，常常拖住新模型
              </Zh>
            </div>
          </div>
        </Card>
      </div>
      <SrcLine f={b[4]}>“意图路由、固定流水线”沿用前面的例子；“进度汇报、自查”对应原文：新模型会边做边汇报、边检查</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ when to keep a subagent
export const Keep: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const W = 540;
  const col = (i: number) => 96 + i * (W + 36);
  // degradation curve for #1
  const curve: [number, number][] = [];
  for (let x = 0; x <= 400; x += 10) curve.push([x, 30 + (x < 220 ? 0 : Math.pow((x - 220) / 180, 2) * 130)]);
  return (
    <Shell part="何时留着">
      <Head kicker="KEEP A SUBAGENT WHEN" title="这三种情况，subagent 该留着" />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: col(i), top: 280, width: W, ...pop(b[i + 1], 0, 0.92)}}>
          <Card hot style={{padding: '24px 28px', height: 540}}>
            <NumBadge n={i + 1} />
            {i === 0 && (
              <>
                <div style={{marginTop: 18}}>
                  <Zh size={32} w={800}>
                    上下文膨胀
                  </Zh>
                </div>
                <div style={{marginTop: 8}}>
                  <Zh size={22} w={500} color={K.dim}>
                    单循环出现可测量的性能下降
                  </Zh>
                </div>
                <div style={{position: 'relative', marginTop: 26, height: 220, background: '#fff', borderRadius: 10}}>
                  <svg width={480} height={220} style={{position: 'absolute', left: 20, top: 10}}>
                    <polyline
                      points={curve
                        .filter((_, k) => k / curve.length <= prog(b[1], 30, 8))
                        .map(([x, y]) => `${x},${y}`)
                        .join(' ')}
                      fill="none"
                      stroke={K.clay}
                      strokeWidth={4}
                    />
                  </svg>
                  <div style={{position: 'absolute', left: 20, bottom: 8}}>
                    <Lab size={13}>上下文越塞越满 →</Lab>
                  </div>
                  <div style={{position: 'absolute', right: 14, top: 10}}>
                    <Lab size={13}>质量</Lab>
                  </div>
                  <Illus style={{position: 'absolute', right: 14, bottom: 8}} />
                </div>
              </>
            )}
            {i === 1 && (
              <>
                <div style={{marginTop: 18}}>
                  <Zh size={32} w={800}>
                    并行 + 干净上下文
                  </Zh>
                </div>
                <div style={{marginTop: 8}}>
                  <Zh size={22} w={500} color={K.dim}>
                    多个任务同时跑，做完就丢掉
                  </Zh>
                </div>
                <div style={{display: 'flex', gap: 14, marginTop: 30}}>
                  {[0, 1, 2].map((k) => {
                    const done = prog(b[2], 16, 40 + k * 8);
                    return (
                      <div
                        key={k}
                        style={{
                          flex: 1,
                          height: 200,
                          background: '#fff',
                          borderRadius: 10,
                          border: `2px solid ${K.clay}55`,
                          opacity: 1 - done * 0.7,
                          transform: `translateY(${done * 30}px) rotate(${done * (k - 1) * 6}deg)`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                        }}
                      >
                        <Lab size={13}>窗口 {k + 1}</Lab>
                        <div style={{width: 80, height: 10, background: K.stone, borderRadius: 5}}>
                          <div style={{width: 80 * prog(b[2], 30, 6 + k * 4), height: 10, background: K.clay, borderRadius: 5}} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {i === 2 && (
              <>
                <div style={{marginTop: 18}}>
                  <Zh size={32} w={800}>
                    选不准工具
                  </Zh>
                </div>
                <div style={{marginTop: 8}}>
                  <Zh size={22} w={500} color={K.dim}>
                    或系统提示词里指令互相冲突
                  </Zh>
                </div>
                <div style={{position: 'relative', marginTop: 26, height: 220, background: '#fff', borderRadius: 10}}>
                  {Array.from({length: 18}).map((_, k) => (
                    <ToolSq key={k} x={24 + (k % 6) * 72} y={22 + Math.floor(k / 6) * 62} s={44} o={prog(b[3], 8, k * 1.2) * (k === 7 ? 1 : 0.55)} />
                  ))}
                  <div style={{position: 'absolute', left: 24 + 72 + 6, top: 22 + 62 - 2, opacity: prog(b[3], 10, 30), transform: `rotate(${Math.sin(frame / 5) * 8}deg)`}}>
                    <span style={{fontFamily: FONT_SERIF, fontSize: 40, fontWeight: 700, color: '#fff'}}>?</span>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      ))}
      <div style={{position: 'absolute', left: 96, top: 214, ...rise(b[0], 4)}}>
        <Zh size={24} w={500} color={K.dim}>
          subagent 没有过时，在研究前沿也还在用
        </Zh>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ split by context (the article's second figure)
export const Split: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const top = 300;
  const bot = 640;
  const agents = [
    {t: 'Agent 1', d: '写功能'},
    {t: 'Agent 2', d: '写测试'},
    {t: 'Agent 3', d: '做审查'},
  ];
  const lossT = ((Math.max(0, b[1] - 20)) % 80) / 80;
  return (
    <Shell part="真要拆的话">
      <Head kicker="SPLIT BY CONTEXT, NOT BY PROBLEM TYPE" title="按上下文拆，别按问题类型拆" />
      {/* ghost outlines for beat 0: the two ways to split, before either is filled in */}
      {[
        [120, 300, 470],
        [710, 300, 470],
        [1300, 300, 470],
        [120, 640, 1060],
        [1300, 640, 500],
      ].map(([x, y, w], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: w,
            height: 140,
            borderRadius: 14,
            border: `2px dashed ${K.line}`,
            opacity: prog(b[0], 12, 10 + i * 3) * (1 - prog(i < 3 ? b[1] : i === 3 ? b[2] : b[3], 10)),
          }}
        />
      ))}
      {/* top row */}
      <div style={{position: 'absolute', left: 120, top: top - 56, opacity: prog(b[0], 12, 10)}}>
        <Lab size={18} w={700}>
          按问题类型拆
        </Lab>
      </div>
      {agents.map((a, i) => {
        const x = 120 + i * 590;
        return (
          <React.Fragment key={a.t}>
            <div style={rise(b[1], 4 + i * 8)}>
              <Box x={x} y={top} w={470} h={140} bg={K.cream} center={false} radius={14} style={{padding: '24px 32px'}}>
                <Serif size={38} style={{fontFamily: '"Lora", serif'}}>
                  {a.t}
                </Serif>
                <div style={{marginTop: 6}}>
                  <Zh size={26} w={500} color={K.dim}>
                    {a.d}
                  </Zh>
                </div>
              </Box>
            </div>
            {i < 2 && (
              <>
                <Wire pts={[[x + 485, top + 80], [x + 575, top + 80]]} p={prog(b[1], 12, 10 + i * 8)} arrow />
                <div style={{position: 'absolute', left: x + 480, top: top + 40, opacity: prog(b[1], 12, 10 + i * 8)}}>
                  <Lab size={14}>HANDOFF</Lab>
                </div>
                {/* bits falling off at each handoff */}
                {b[1] > 20 &&
                  [0, 1, 2].map((k) => {
                    const t = (lossT + k * 0.33) % 1;
                    return (
                      <div
                        key={k}
                        style={{
                          position: 'absolute',
                          left: x + 515 + k * 14,
                          top: top + 96 + t * 70,
                          width: 10,
                          height: 10,
                          background: K.clay,
                          opacity: (1 - t) * 0.8,
                        }}
                      />
                    );
                  })}
              </>
            )}
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 120, top: top + 170, ...rise(b[1], 30)}}>
        <Zh size={24} w={500} color={K.dim} style={{fontStyle: 'italic'}}>
          每次交接都丢上下文：写测试的 agent，不知道实现为什么这么做 —— 像传话游戏
        </Zh>
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, top: bot - 70, height: 1.5, background: K.hair, opacity: prog(b[0], 12, 16)}} />
      {/* bottom row */}
      <div style={{position: 'absolute', left: 120, top: bot - 44, opacity: prog(b[0], 12, 22)}}>
        <Lab size={18} w={700} color={K.clay}>
          按上下文拆
        </Lab>
      </div>
      <div style={rise(b[2], 4)}>
        <Box x={120} y={bot} w={1060} h={140} bg={K.peach} center={false} radius={14} style={{padding: '24px 32px'}}>
          <Zh size={34} w={800}>
            一个 agent
          </Zh>
          <div style={{marginTop: 6}}>
            <Zh size={26} w={500} color={K.dim}>
              写功能，也写测试，因为它本来就有上下文
            </Zh>
          </div>
        </Box>
      </div>
      <Wire pts={[[1195, bot + 70], [1290, bot + 70]]} p={prog(b[3], 12, 4)} arrow />
      <div style={rise(b[3], 8)}>
        <Box x={1300} y={bot} w={500} h={140} bg={K.cream} center={false} radius={14} style={{padding: '24px 32px'}}>
          <Zh size={34} w={800}>
            验证者
          </Zh>
          <div style={{marginTop: 6}}>
            <Zh size={26} w={500} color={K.dim}>
              只跑测试、报结果
            </Zh>
          </div>
        </Box>
      </div>
      <div style={{position: 'absolute', left: 1300, top: bot + 158, ...rise(b[3], 24)}}>
        <Zh size={22} w={500} color={K.dim} style={{fontStyle: 'italic'}}>
          不需要实现细节，单独拆出去正合适
        </Zh>
      </div>
      <SrcLine f={b[1]}>按原文第二张图重画</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ the single loop
export const Loop: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const M = {x: 560, y: 380, w: 460, h: 170}; // model box
  const batch = prog(b[1], 16, 4);
  // three tool calls fire in parallel, results come back
  const cyc = Math.max(0, b[1] - 10) % 90;
  const out = clamp01(cyc / 30);
  const back = clamp01((cyc - 45) / 30);
  const toolY = [300, 420, 540];
  const planV2 = prog(b[4], 16, 26);
  return (
    <Shell part="目标形态">
      <Head kicker="THE SINGLE LOOP" title="一个模型、一个窗口、一个工具循环" />
      {/* user */}
      <div style={rise(b[0], 0)}>
        <Box x={120} y={M.y + 40} w={240} h={90} bg={K.cream} radius={10}>
          <Zh size={26} w={700}>
            用户
          </Zh>
        </Box>
      </div>
      <Wire pts={[[360, M.y + 85], [M.x - 10, M.y + 85]]} p={prog(b[0], 14, 8)} arrow />
      {/* model */}
      <div style={pop(b[0], 4, 0.9)}>
        <Box x={M.x} y={M.y} w={M.w} h={M.h} bg={K.peach} radius={12} center={false} style={{padding: '20px 26px'}}>
          <Zh size={32} w={800}>
            模型
          </Zh>
          <div style={{marginTop: 8}}>
            <Lab size={14} color={K.clay}>
              ONE CONTEXT WINDOW
            </Lab>
          </div>
          {/* plan note */}
          <div style={{position: 'absolute', right: 18, top: 18, width: 150, background: '#fff', borderRadius: 6, padding: '8px 10px', opacity: prog(b[4], 14)}}>
            <Lab size={12} color={K.clay}>
              计划 {planV2 > 0.5 ? 'v2' : 'v1'}
            </Lab>
            {['查订单', planV2 > 0.5 ? '问物流' : '回答', planV2 > 0.5 ? '回答' : ''].map((s, i) =>
              s ? (
                <div key={i}>
                  <Zh size={16} w={600} color={i === 1 && planV2 > 0.5 ? K.clay : K.ink}>
                    {i + 1}. {s}
                  </Zh>
                </div>
              ) : null,
            )}
          </div>
        </Box>
      </div>
      {/* tools: one batch, parallel */}
      <div style={{position: 'absolute', left: 1180, top: 236, opacity: batch}}>
        <Lab size={15}>一批工具调用 · 并行执行</Lab>
      </div>
      {toolY.map((y, i) => (
        <React.Fragment key={i}>
          <Wire pts={[[M.x + M.w, M.y + 85], [1100, M.y + 85], [1100, y + 32], [1180, y + 32]]} p={batch} />
          <div style={{opacity: batch}}>
            <Box x={1180} y={y} w={300} h={64} bg="#fff" style={{border: `1.5px solid ${K.hair}`}}>
              <Mo size={22}>{['lookup_order', 'track_shipment', 'search_policy'][i]}</Mo>
            </Box>
          </div>
          {b[1] > 10 && (
            <>
              <Packet pts={[[M.x + M.w, M.y + 85], [1100, M.y + 85], [1100, y + 32], [1180, y + 32]]} t={out * 0.999} />
              <Packet pts={[[1180, y + 32], [1100, y + 32], [1100, M.y + 85], [M.x + M.w, M.y + 85]]} t={back * 0.999} color={K.ink} size={10} />
            </>
          )}
        </React.Fragment>
      ))}
      <div style={{position: 'absolute', left: 1520, top: 420, width: 300, opacity: batch}}>
        <Zh size={22} w={500} color={K.dim}>
          原始结果交回同一个模型
        </Zh>
      </div>
      {/* next step choices */}
      <div style={{position: 'absolute', left: M.x - 60, top: M.y + M.h + 40, display: 'flex', gap: 14}}>
        {['再来一批', '问用户一句', '直接回答'].map((s, i) => (
          <div key={s} style={pop(b[2], i * 6)}>
            <Pill bg={i === 2 ? K.clay : '#fff'} color={i === 2 ? '#fff' : K.ink} border={i === 2 ? K.clay : undefined}>
              {s}
            </Pill>
          </div>
        ))}
      </div>
      {/* harness limits */}
      <div style={{position: 'absolute', left: 120, top: 250, display: 'flex', gap: 14, ...rise(b[3], 0)}}>
        <Lab size={15} style={{alignSelf: 'center'}}>
          框架卡住：
        </Lab>
        {['回合预算', '成本预算', '写入审批'].map((s) => (
          <Pill key={s} bg={K.stone} border="transparent" style={{fontSize: 21}}>
            {s}
          </Pill>
        ))}
      </div>
      {/* where things move */}
      <div style={{position: 'absolute', left: 120, top: 740, display: 'flex', gap: 22, ...rise(b[5], 0)}}>
        <Card style={{padding: '14px 22px'}}>
          <Zh size={24} w={700}>
            流程步骤 → <span style={{color: K.clay}}>skills</span>
          </Zh>
        </Card>
        <Card style={{padding: '14px 22px'}}>
          <Zh size={24} w={700}>
            校验、审批等硬限制 → <span style={{color: K.clay}}>工具</span>
          </Zh>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 650, width: 640, ...rise(b[4], 0)}}>
        <Card hot style={{padding: '16px 22px'}}>
          <Zh size={24} w={800}>
            写计划的 = 执行计划的
          </Zh>
          <div>
            <Zh size={20} w={500} color={K.dim}>
              结果一来，就能半路改计划
            </Zh>
          </div>
        </Card>
      </div>
      <SrcLine f={b[1]}>工具名为示意</SrcLine>
    </Shell>
  );
};
