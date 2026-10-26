// Cover, "what a subagent is", the 5-layers-vs-1-loop figure, the org-chart trap and the five failure modes.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Gauge, Layers, MessageSquareWarning, Network, Timer} from 'lucide-react';
import {ClaudeSpark} from '@atv/lib/brand/claude';
import {useBeats} from '@atv/lib/timing';
import {Box, Card, during, FONT_SERIF, Head, Illus, K, Lab, Mo, NumBadge, Packet, Pill, prog, rise, Serif, Shell, SrcLine, ToolSq, usePopIn, Wire, Zh} from './common';

// ------------------------------------------------------------------ cover
export const Cover: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const fold = prog(b[1], 34, 26); // subagents collapse into the loop
  const subs = ['路由', '规划', '领域 A', '领域 B'];
  return (
    <Shell>
      <div style={{position: 'absolute', left: 110, top: 150}}>
        <div style={rise(frame, 0)}>
          <Pill bg="#fff" style={{fontSize: 22}}>
            <ClaudeSpark size={26} color={K.orange} />
            Claude 官方文章 · 2026.10.22
          </Pill>
        </div>
        <div style={{marginTop: 34, ...rise(frame, 6, 30)}}>
          <Serif size={118} style={{display: 'block', lineHeight: 1.08}}>
            何时把 <span style={{fontFamily: FONT_SERIF}}>subagent</span>
          </Serif>
          <Serif size={118} color={K.clay} style={{display: 'block', lineHeight: 1.08}}>
            并回主循环
          </Serif>
        </div>
        <div style={{marginTop: 30, ...rise(frame, 14)}}>
          <Zh size={34} w={500} color={K.dim}>
            Applied AI 团队的实战建议 + 迁移套件
          </Zh>
        </div>
        <div style={{marginTop: 18, ...rise(b[0], 8)}}>
          <Mo size={22} color={K.faint}>
            Building agents: When to fold subagents into your main agent loop
          </Mo>
        </div>
      </div>

      {/* right: many agents fold into one loop */}
      <div style={{position: 'absolute', left: 1130, top: 170, width: 680, height: 380, ...rise(b[1], 0)}}>
        <div style={{opacity: 1 - fold}}>
          <Box x={0} y={0} w={680} h={64} bg={K.stone2}>
            <Zh size={26} w={600}>
              编排器
            </Zh>
          </Box>
          {subs.map((s, i) => (
            <React.Fragment key={s}>
              <Wire pts={[[85 + i * 170, 64], [85 + i * 170, 120]]} p={prog(b[1], 14, 6 + i * 3)} />
              <Box x={i * 170 + 8} y={120 + fold * 60} w={154} h={110} bg={K.cream} style={{transform: `translateX(${(255 - (i * 170 + 85)) * fold}px)`}}>
                <Zh size={24} w={700}>
                  {s}
                </Zh>
                <Lab size={14} color={K.faint} style={{marginTop: 6}}>
                  subagent
                </Lab>
              </Box>
            </React.Fragment>
          ))}
        </div>
        <div style={{position: 'absolute', left: 0, top: 30, width: 680, opacity: fold, transform: `scale(${0.9 + 0.1 * fold})`}}>
          <Box x={0} y={0} w={680} h={300} bg={K.peach} radius={10} center={false} style={{padding: '26px 30px'}}>
            <Zh size={30} w={700}>
              一个主循环
            </Zh>
            <div style={{display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap'}}>
              {['skill', 'skill', 'skill'].map((s, i) => (
                <Pill key={i}>{s}</Pill>
              ))}
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 14}}>
              {['tool', 'tool', 'tool'].map((s, i) => (
                <Pill key={i} bg={i === 2 ? 'rgba(255,255,255,0.5)' : '#fff'} color={i === 2 ? K.faint : K.ink}>
                  {s}
                </Pill>
              ))}
            </div>
            <div style={{marginTop: 20}}>
              <Zh size={22} w={500} color={K.dim}>
                按需加载上下文和工具
              </Zh>
            </div>
          </Box>
        </div>
      </div>

      <div style={{position: 'absolute', left: 1130, top: 590, width: 680, ...pop(b[2], 0)}}>
        <Card hot style={{padding: '26px 36px', display: 'flex', alignItems: 'center', gap: 34}}>
          <div style={{fontFamily: FONT_SERIF, fontSize: 132, fontWeight: 700, color: K.clay, lineHeight: 1, letterSpacing: -4}}>
            ≈2<span style={{fontSize: 96}}>×</span>
          </div>
          <div>
            <Zh size={40} w={800}>
              单循环更快
            </Zh>
            <div style={{marginTop: 8}}>
              <Zh size={22} w={500} color={K.dim}>
                一位客户实测：单 agent 循环
                <br />
                对比多 agent 架构的运行时间
              </Zh>
            </div>
          </div>
        </Card>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ what a subagent is
export const Whatis: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const into = prog(b[2], 30, 18);
  return (
    <Shell part="先说概念">
      <Head kicker="SUBAGENT" title="什么是 subagent" sub="自己的上下文、工具和指令" />
      {/* left: coordinator + 3 subagents */}
      <div style={{position: 'absolute', left: 96, top: 230, width: 820, height: 620}}>
        <Box x={210} y={0} w={400} h={70} bg={K.stone2} style={rise(b[0], 0)}>
          <Zh size={26} w={700}>
            协调者
          </Zh>
        </Box>
        {[0, 1, 2].map((i) => {
          const x = 20 + i * 270;
          const cx = x + 125;
          return (
            <React.Fragment key={i}>
              <Wire pts={[[410, 70], [410, 105], [cx, 105], [cx, 140]]} p={prog(b[0], 16, 10 + i * 4)} />
              <div style={{position: 'absolute', left: x, top: 140 + into * 40, width: 250, opacity: 1 - into * 0.75, ...rise(b[0], 14 + i * 4)}}>
                <Box x={0} y={0} w={250} h={250} bg={K.cream} center={false} radius={10} style={{padding: '18px 20px'}}>
                  <Zh size={26} w={800}>
                    subagent {i + 1}
                  </Zh>
                  {['上下文窗口', '工具', '指令'].map((r) => (
                    <div key={r} style={{marginTop: 12, background: '#fff', borderRadius: 6, padding: '6px 12px'}}>
                      <Zh size={21} w={500} color={K.dim}>
                        {r}
                      </Zh>
                    </div>
                  ))}
                </Box>
              </div>
            </React.Fragment>
          );
        })}
        <div style={{position: 'absolute', left: 20, top: 440, display: 'flex', gap: 14, ...rise(b[1], 0)}}>
          {['验证', '并行', '按模块分权限'].map((s, i) => (
            <div key={s} style={pop(b[1], 4 + i * 5)}>
              <Pill bg={K.peach} border="rgba(201,96,63,0.3)">
                ✓ {s}
              </Pill>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 20, top: 510, ...rise(b[1], 22)}}>
          <Zh size={22} w={500} color={K.dim}>
            Anthropic 自己的多 agent 研究系统也在用
          </Zh>
        </div>
      </div>

      {/* right: folded loop + the comparison */}
      <div style={{position: 'absolute', left: 1000, top: 230, width: 824}}>
        <div style={{opacity: into, transform: `translateX(${(1 - into) * -60}px)`}}>
          <Card hot style={{padding: '22px 28px'}}>
            <Lab size={16} color={K.clay}>
              不少企业部署的做法
            </Lab>
            <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'}}>
              {['路由', '规划', '各领域 subagent'].map((s) => (
                <Pill key={s} bg="#fff">
                  {s}
                </Pill>
              ))}
              <Zh size={30} w={700} color={K.clay}>
                →
              </Zh>
              <Pill bg={K.clay} color="#fff" border={K.clay}>
                一个主循环
              </Pill>
            </div>
          </Card>
        </div>
        <div style={{marginTop: 28, ...rise(b[3], 0)}}>
          <Card style={{padding: '22px 28px'}}>
            <Zh size={24} w={700}>
              几家企业部署的对比
            </Zh>
            <div style={{display: 'flex', gap: 16, marginTop: 18}}>
              {[
                {t: '一个提示词包办', hot: false},
                {t: 'subagent 设计', hot: false},
                {t: '单 agent + skills', hot: true},
              ].map((c, i) => (
                <div key={c.t} style={{flex: 1, ...pop(b[3], 6 + i * 6)}}>
                  <Box x={0} y={0} w={240} h={150} bg={c.hot ? K.peach : K.stone} style={{position: 'relative'}} radius={10}>
                    <Zh size={23} w={c.hot ? 800 : 600}>
                      {c.t}
                    </Zh>
                    {c.hot && (
                      <div style={{marginTop: 10, opacity: prog(b[3], 14, 26)}}>
                        <Zh size={20} w={700} color={K.clay}>
                          质量常常更高
                          <br />
                          成本、延迟常更低
                        </Zh>
                      </div>
                    )}
                  </Box>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <SrcLine f={b[3]}>原文：“frequently outperformed … on quality, and often at a lower cost and latency per task”</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ 5 layers vs 1 loop (the article's first figure)
export const LayersScene: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const L = 96; // left diagram origin
  const W = 800;
  const T = 250;
  const g = (i: number) => prog(b[1], 14, i * 9);
  const grey = prog(b[2], 20);
  const R = 1024; // right diagram origin
  const r = prog(b[3], 18);
  // request packet walking down the left structure, looping
  const loopT = ((frame - b[1] - 40) % 120) / 120;
  const leftPath: [number, number][] = [
    [L + W / 2, T + 30],
    [L + W / 2, T + 70],
    [L + 120, T + 70],
    [L + 120, T + 140],
    [L + 360, T + 140],
    [L + 750, T + 140],
    [L + 750, T + 205],
    [L + W / 2, T + 205],
    [L + W / 2, T + 260],
    [L + W / 2, T + 360],
    [L + W / 2, T + 460],
  ];
  const rp: [number, number][] = [
    [R + 330, T + 30],
    [R + 330, T + 230],
    [R + 520, T + 230],
    [R + 330, T + 262],
    [R + 330, T + 460],
  ];
  const rt = ((frame - b[3] - 24) % 100) / 100;
  return (
    <Shell part="为什么要并">
      <Head kicker="COMMON PATTERN vs WHAT WE OFTEN RECOMMEND" title="5 层结构，还是 1 个循环" />
      {/* left */}
      <div style={{position: 'absolute', left: L, top: 196, opacity: prog(b[0], 12)}}>
        <Serif size={44} color={K.dim}>
          5 层结构
        </Serif>
        <Zh size={22} w={500} color={K.faint} style={{marginLeft: 16}}>
          围着模型搭的
        </Zh>
      </div>
      <div style={{opacity: 1 - grey * 0.45, filter: grey > 0 ? `grayscale(${grey})` : undefined}}>
        <Box x={L} y={T + 50} w={W} h={48} bg={K.stone2} style={{opacity: g(4)}}>
          <Zh size={23} w={600}>
            多 agent 编排器
          </Zh>
        </Box>
        <Box x={L} y={T + 120} w={220} h={50} style={{opacity: g(0)}}>
          <Zh size={22} w={600}>
            意图分类器
          </Zh>
        </Box>
        <Wire pts={[[L + 220, T + 145], [L + 270, T + 145]]} p={g(1)} arrow />
        {[1, 2, 3, 4, 5].map((n, i) => (
          <Box key={n} x={L + 280 + i * 104} y={T + 120} w={92} h={50} style={{opacity: g(1)}}>
            <Mo size={22}>{n}</Mo>
          </Box>
        ))}
        <div style={{position: 'absolute', left: L + 280, top: T + 178, opacity: g(1)}}>
          <Lab size={14} color={K.faint}>
            固定多步推理流水线
          </Lab>
        </div>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <Box x={L + i * 280} y={T + 216} w={240} h={58} style={{opacity: g(2)}}>
              <Zh size={22} w={600}>
                用户分桶
              </Zh>
            </Box>
            <Wire pts={[[L + i * 280 + 120, T + 274], [L + i * 280 + 120, T + 300]]} p={g(3)} />
            <Box x={L + i * 280} y={T + 300} w={240} h={58} style={{opacity: g(3)}}>
              <Zh size={22} w={600}>
                推荐分支
              </Zh>
            </Box>
          </React.Fragment>
        ))}
        <Wire pts={[[L + 120, T + 358], [L + 120, T + 390], [L + 680, T + 390], [L + 680, T + 358]]} p={g(3)} />
        <Wire pts={[[L + W / 2, T + 390], [L + W / 2, T + 440]]} p={g(4)} arrow />
        <div style={{position: 'absolute', left: L + W / 2 - 50, top: T + 450, opacity: g(4)}}>
          <Lab size={16}>ANSWER</Lab>
        </div>
        {frame > b[1] + 40 && grey < 0.5 && <Packet pts={leftPath} t={loopT} />}
      </div>
      <div style={{position: 'absolute', left: L, top: T + 500, width: W, opacity: grey}}>
        <Card style={{padding: '16px 24px'}}>
          <Zh size={26} w={700}>
            反馈：这些结构，大都在做模型
            <span style={{color: K.clay}}>已经不需要别人代劳</span>
            的事
          </Zh>
        </Card>
      </div>

      {/* divider */}
      <div style={{position: 'absolute', left: 960, top: 210, width: 1.5, height: 640, background: K.hair, opacity: r}} />

      {/* right */}
      <div style={{position: 'absolute', left: R, top: 196, opacity: r}}>
        <Serif size={44} color={K.clay}>
          1 个循环
        </Serif>
        <Zh size={22} w={500} color={K.faint} style={{marginLeft: 16}}>
          一个提示词、四五个工具、护栏
        </Zh>
      </div>
      <div style={{opacity: r, transform: `translateY(${(1 - r) * 20}px)`}}>
        <Box x={R} y={T + 50} w={800} h={350} bg={K.peach} radius={8} />
        <div style={{position: 'absolute', left: R + 24, top: T + 66}}>
          <Zh size={24} w={700}>
            单 agent 循环
          </Zh>
        </div>
        <Box x={R + 24} y={T + 108} w={230} h={74} bg="#fff">
          <Zh size={22} w={600}>
            一个清楚的
            <br />
            系统提示词
          </Zh>
        </Box>
        <Box x={R + 24} y={T + 200} w={300} h={80} bg="#fff">
          <Zh size={28} w={700}>
            模型
          </Zh>
        </Box>
        <Wire pts={[[R + 324, T + 222], [R + 500, T + 222]]} p={prog(b[3], 14, 10)} arrow />
        <Wire pts={[[R + 500, T + 258], [R + 324, T + 258]]} p={prog(b[3], 14, 16)} arrow />
        <div style={{position: 'absolute', left: R + 360, top: T + 194}}>
          <Lab size={13}>TOOL CALLS</Lab>
        </div>
        <div style={{position: 'absolute', left: R + 380, top: T + 266}}>
          <Lab size={13}>RESULTS</Lab>
        </div>
        <div style={{position: 'absolute', left: R + 520, top: T + 168}}>
          <Zh size={22} w={600}>
            四五个精简数据工具
          </Zh>
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <ToolSq key={i} x={R + 520 + i * 52} y={T + 214} s={42} dashed={i === 4} o={prog(b[3], 10, 12 + i * 4)} />
        ))}
        <Box x={R + 24} y={T + 310} w={752} h={62} bg="#fff">
          <Zh size={24} w={600}>
            严格的输出护栏
          </Zh>
        </Box>
        <Wire pts={[[R + 330, T + 20], [R + 330, T + 200]]} p={prog(b[3], 14, 6)} />
        <Wire pts={[[R + 330, T + 400], [R + 330, T + 440]]} p={prog(b[3], 14, 20)} arrow />
        <div style={{position: 'absolute', left: R + 284, top: T + 450}}>
          <Lab size={16}>ANSWER</Lab>
        </div>
        {frame > b[3] + 24 && <Packet pts={rp} t={rt} />}
      </div>
      <div style={{position: 'absolute', left: R, top: T + 500, width: 800, ...rise(b[3], 30)}}>
        <Card hot style={{padding: '16px 24px'}}>
          <Zh size={26} w={700}>
            就能覆盖大部分场景
          </Zh>
        </Card>
      </div>
      <SrcLine f={b[0]}>按原文第一张图重画</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ org chart → architecture (Conway)
export const Orgchart: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const teams = ['退货团队', '物流团队', '账户团队', '诊断团队'];
  const c = prog(b[1], 24);
  const X0 = 300;
  return (
    <Shell part="为什么要并">
      <Head kicker="CONWAY'S LAW" title="架构，变成了组织架构图" />
      <Box x={X0} y={250} w={1320} h={70} bg={K.stone2} style={rise(b[0], 30)}>
        <Zh size={26} w={700}>
          平台团队的编排器
        </Zh>
      </Box>
      {teams.map((t, i) => {
        const x = X0 + i * 340;
        return (
          <React.Fragment key={t}>
            <Wire pts={[[x + 150, 320], [x + 150, 380]]} p={prog(b[0], 14, 36 + i * 3)} />
            <div style={{position: 'absolute', left: x, top: 380, ...rise(b[0], 4 + i * 6)}}>
              <Box x={0} y={0} w={300} h={200} bg={K.cream} radius={10}>
                <Zh size={22} w={500} color={K.dim}>
                  {t}
                </Zh>
                <div style={{marginTop: 12, background: '#fff', padding: '10px 20px', borderRadius: 8}}>
                  <Zh size={26} w={800}>
                    自己的 agent
                  </Zh>
                </div>
                <Lab size={14} color={K.faint} style={{marginTop: 10}}>
                  own prompt · own evals
                </Lab>
              </Box>
            </div>
          </React.Fragment>
        );
      })}
      {/* the "=" overlay */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', ...pop(b[1], 0)}}>
        <Card hot style={{padding: '22px 40px', display: 'flex', alignItems: 'center', gap: 28}}>
          <Network size={46} color={K.clay} strokeWidth={2.2} />
          <Zh size={36} w={800}>
            agent 架构 <span style={{color: K.clay}}>=</span> 组织架构图
          </Zh>
          <Zh size={24} w={500} color={K.dim}>
            康威定律在起作用
          </Zh>
        </Card>
      </div>
      <div style={{position: 'absolute', left: X0 - 24, top: 226, width: 1368, height: 382, border: `3px dashed ${K.clay}`, borderRadius: 16, opacity: c * 0.8}} />
      <SrcLine f={b[0]}>团队名为示意（借用迁移套件示例里的客服领域）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ five failure modes
const ILLS = [
  {icon: Layers, t: '上下文丢失', d: '在 agent 之间来回传，细节一路丢'},
  {icon: Network, t: 'subagent 泛滥', d: '几百个互相重叠，没标准，也没人负责'},
  {icon: MessageSquareWarning, t: '拼凑提示词', d: '每个团队加一句，规则打架，语气不一'},
  {icon: Gauge, t: '局部评测', d: '各管各的，只对子任务优化，分数被稀释'},
  {icon: Timer, t: '延迟', d: '多 agent 架构的复杂度拖慢速度'},
];
export const Ills: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  return (
    <Shell part="为什么要并">
      <Head kicker="FAILURE MODES" title="大公司常踩的五个坑" />
      <div style={{position: 'absolute', left: 96, top: 230, width: 1000, display: 'flex', flexDirection: 'column', gap: 18}}>
        {ILLS.map((it, i) => {
          const Icon = it.icon;
          const on = b[i];
          const active = during(b[i], 0, (b[i + 1] ?? 9999) - b[i] + 1000);
          return (
            <div key={it.t} style={pop(on, 0, 0.92)}>
              <Card hot={i === 4} style={{padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 22}}>
                <NumBadge n={i + 1} />
                <Icon size={34} color={i === 4 ? K.clay : K.dim} strokeWidth={2} />
                <div style={{width: 230}}>
                  <Zh size={28} w={800}>
                    {it.t}
                  </Zh>
                </div>
                <Zh size={24} w={500} color={K.dim} style={{opacity: 0.5 + 0.5 * active}}>
                  {it.d}
                </Zh>
              </Card>
            </div>
          );
        })}
      </div>
      {/* right: the 2x bar pair, on beat 4 */}
      <div style={{position: 'absolute', left: 1160, top: 250, width: 660, ...rise(b[4], 6)}}>
        <Card style={{padding: '26px 32px'}}>
          <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
            <Zh size={26} w={800}>
              运行时间
            </Zh>
            <Illus />
          </div>
          {[
            {n: '多 agent 架构', v: 1, hot: false},
            {n: '单 agent 循环', v: 0.5, hot: true},
          ].map((r, i) => (
            <div key={r.n} style={{marginTop: 24}}>
              <Zh size={22} w={r.hot ? 800 : 500} color={r.hot ? K.ink : K.dim}>
                {r.n}
              </Zh>
              <div style={{marginTop: 8, height: 44, width: 560 * r.v * prog(b[4], 26, 10 + i * 10), background: r.hot ? K.clay : K.stone2, borderRadius: 4}} />
            </div>
          ))}
          <div style={{marginTop: 26, display: 'flex', alignItems: 'baseline', gap: 16, opacity: prog(b[4], 14, 34)}}>
            <span style={{fontFamily: FONT_SERIF, fontSize: 78, fontWeight: 700, color: K.clay, lineHeight: 1}}>≈2×</span>
            <Zh size={24} w={600} color={K.dim}>
              更快（一位客户实测）
            </Zh>
          </div>
        </Card>
      </div>
      <SrcLine f={b[4]} left={1160}>
        比例按原文“roughly 2x faster runtime”画
      </SrcLine>
    </Shell>
  );
};
