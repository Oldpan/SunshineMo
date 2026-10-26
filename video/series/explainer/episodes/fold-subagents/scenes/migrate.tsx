// Migration: evals first, the three ways to reduce subagents, "look at which tasks flipped", how teams contribute,
// the migration kit, and the outro.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BookOpen, Check, Search, Users, Wrench, X} from 'lucide-react';
import {GitHubMark} from '@atv/lib/brand/github';
import {useBeats} from '@atv/lib/timing';
import {Box, Card, clamp01, FONT_MONO, FONT_SERIF, Head, Illus, K, Lab, Mo, NumBadge, Pill, prog, rise, Serif, Shell, SrcLine, usePopIn, Wire, Zh} from './common';

// ------------------------------------------------------------------ evals first
export const Eval: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const n = Math.round(10 * prog(b[1], 30, 20));
  const sw = prog(b[2], 20, 40); // routing accuracy -> skill / tool choice
  return (
    <Shell part="怎么迁移 · 第一步">
      <Head kicker="STEP 1 · TASK-COMPLETION EVALS" title="先建端到端评测" />
      {/* shared eval + team evals */}
      <div style={{position: 'absolute', left: 96, top: 240, width: 860, height: 560}}>
        <div style={pop(b[1], 0, 0.9)}>
          <Box x={230} y={60} w={400} h={220} bg={K.peach} radius={14}>
            <Lab size={15} color={K.clay}>
              共享端到端评测
            </Lab>
            <div style={{marginTop: 8}}>
              <span style={{fontFamily: FONT_SERIF, fontSize: 92, fontWeight: 700, color: K.clay, lineHeight: 1}}>{n}</span>
              <Zh size={26} w={700} style={{marginLeft: 8}}>
                个黄金样例
              </Zh>
            </div>
            <Zh size={22} w={500} color={K.dim}>
              就能起步 · 中心团队负责
            </Zh>
          </Box>
        </div>
        {[
          {x: 0, y: 0},
          {x: 680, y: 0},
          {x: 0, y: 300},
          {x: 680, y: 300},
        ].map((p, i) => (
          <React.Fragment key={i}>
            <Wire pts={[[p.x + 90, p.y + 60], [430, 170]]} p={prog(b[1], 14, 20 + i * 4)} dash />
            <div style={pop(b[1], 18 + i * 4)}>
              <Box x={p.x} y={p.y} w={180} h={120} bg={K.cream} radius={10}>
                <Zh size={22} w={700}>
                  团队 skill
                </Zh>
                <Lab size={13} color={K.faint} style={{marginTop: 6}}>
                  + 小评测
                </Lab>
              </Box>
            </div>
          </React.Fragment>
        ))}
        <div style={{position: 'absolute', left: 0, top: 470, ...rise(b[1], 36)}}>
          <Zh size={22} w={500} color={K.dim}>
            记录关键事件的时间戳，之后可以回放成定向评测
          </Zh>
        </div>
      </div>
      {/* what to check */}
      <div style={{position: 'absolute', left: 1040, top: 240, width: 780}}>
        <div style={rise(b[2], 0)}>
          <Card style={{padding: '22px 28px'}}>
            <Lab size={15}>看什么</Lab>
            <div style={{display: 'flex', gap: 16, marginTop: 14, alignItems: 'stretch'}}>
              <div style={{flex: 1, background: K.stone, borderRadius: 10, padding: '14px 18px', opacity: 1 - sw * 0.5}}>
                <Lab size={13}>还有编排器时</Lab>
                <div style={{marginTop: 6}}>
                  <Zh size={24} w={700}>
                    路由选对了没有
                  </Zh>
                </div>
              </div>
              <div style={{alignSelf: 'center', opacity: sw}}>
                <Zh size={30} w={700} color={K.clay}>
                  →
                </Zh>
              </div>
              <div style={{flex: 1.2, background: K.peach, borderRadius: 10, padding: '14px 18px', opacity: sw}}>
                <Lab size={13} color={K.clay}>
                  并进来以后
                </Lab>
                <div style={{marginTop: 6}}>
                  <Zh size={24} w={700}>
                    加载对 skill、调对工具没有
                  </Zh>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div style={{marginTop: 24, ...rise(b[0], 10)}}>
          <Card style={{padding: '20px 28px'}}>
            <Lab size={15}>起点</Lab>
            <div style={{marginTop: 8}}>
              <Zh size={24} w={700}>
                按评分表给最终回答打分
              </Zh>
            </div>
          </Card>
        </div>
        <div style={{marginTop: 24, ...pop(b[3], 0, 0.9)}}>
          <Card hot style={{padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 20}}>
            <Check size={44} color={K.clay} strokeWidth={3} />
            <div>
              <Zh size={30} w={800}>
                任务完成率评测
              </Zh>
              <div>
                <Zh size={22} w={500} color={K.dim}>
                  比较两种架构时，最关键的一把尺子
                </Zh>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ three ways (the article's third figure)
export const Steps: React.FC = () => {
  const b = useBeats();
  const W = 540;
  const col = (i: number) => 96 + i * (W + 36);
  const merge = prog(b[1], 24, 24);
  const fold = prog(b[3], 24, 20);
  const panel = (i: number, title: string, note: string, body: React.ReactNode) => (
    <div style={{position: 'absolute', left: col(i), top: 236, width: W, ...rise(b[i + 1], 0)}}>
      <Card hot={false} style={{padding: '24px 28px', height: 600, border: `1.5px solid ${b[i + 1] >= 0 && (b[i + 2] === undefined || b[i + 2] < 0) ? K.clay : 'rgba(20,20,19,0.09)'}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <NumBadge n={i + 1} size={38} />
          <Zh size={32} w={800}>
            {title}
          </Zh>
        </div>
        <div style={{position: 'relative', height: 330, marginTop: 24}}>{body}</div>
        <Zh size={23} w={500} color={K.dim}>
          {note}
        </Zh>
      </Card>
    </div>
  );
  return (
    <Shell part="怎么迁移 · 减少 subagent">
      <Head kicker="REDUCE SUBAGENTS OVER TIME" title="三种做法" sub="一次只动一个" />
      {panel(
        0,
        '合并',
        '经常连着跑、碰同一份数据的，先合成一个',
        <>
          <Box x={0} y={0} w={484} h={70} bg={K.stone}>
            <Zh size={24} w={800}>
              主 agent
            </Zh>
          </Box>
          {merge < 0.5
            ? ['A', 'B', 'C', 'D'].map((s, i) => (
                <React.Fragment key={s}>
                  <Wire pts={[[60 + i * 121, 70], [60 + i * 121, 120]]} />
                  <Box x={i * 121 + 8} y={120} w={104} h={160} bg={K.cream} style={{transform: `translateX(${(i % 2 === 0 ? 1 : -1) * merge * 100}px)`}}>
                    <Zh size={30} w={800}>
                      {s}
                    </Zh>
                  </Box>
                </React.Fragment>
              ))
            : ['A + B', 'C + D'].map((s, i) => (
                <React.Fragment key={s}>
                  <Wire pts={[[121 + i * 242, 70], [121 + i * 242, 120]]} />
                  <Box x={i * 242 + 10} y={120} w={222} h={160} bg={K.cream} style={{opacity: (merge - 0.5) * 2}}>
                    <Zh size={30} w={800}>
                      {s}
                    </Zh>
                    <Zh size={20} w={500} color={K.dim}>
                      一个 subagent
                    </Zh>
                  </Box>
                </React.Fragment>
              ))}
        </>,
      )}
      {panel(
        1,
        '当工具调',
        '主 agent 调它、拿回结构化结果，对话仍握在自己手里',
        <>
          <Box x={0} y={0} w={484} h={70} bg={K.stone}>
            <Zh size={24} w={800}>
              主 agent
            </Zh>
          </Box>
          <div style={{position: 'absolute', left: 190, top: 82}}>
            <Lab size={13}>TOOL CALLS</Lab>
          </div>
          {[0, 1].map((i) => (
            <React.Fragment key={i}>
              <Wire pts={[[121 + i * 242, 70], [121 + i * 242, 120]]} />
              <Box x={i * 242 + 10} y={120} w={222} h={160} bg={i === 1 && prog(b[2], 10, 20) > 0.5 ? K.peach : K.cream}>
                <Zh size={26} w={800}>
                  subagent
                </Zh>
                <Zh size={20} w={500} color={K.dim}>
                  返回一个结果
                </Zh>
              </Box>
            </React.Fragment>
          ))}
        </>,
      )}
      {panel(
        2,
        '并进来',
        '提示词变成 skill，API 调用变成 MCP 工具',
        <>
          {fold < 0.5 ? (
            <>
              <Box x={0} y={0} w={484} h={70} bg={K.stone}>
                <Zh size={24} w={800}>
                  主 agent
                </Zh>
              </Box>
              {[0, 1].map((i) => (
                <React.Fragment key={i}>
                  <Wire pts={[[121 + i * 242, 70], [121 + i * 242, 120]]} />
                  <Box x={i * 242 + 10} y={120 - fold * 120} w={222} h={160} bg={K.cream} style={{opacity: 1 - fold * 2}}>
                    <Zh size={26} w={800}>
                      subagent
                    </Zh>
                  </Box>
                </React.Fragment>
              ))}
            </>
          ) : (
            <Box x={0} y={0} w={484} h={280} bg={K.peach} radius={12} center={false} style={{padding: '22px 24px', opacity: (fold - 0.5) * 2}}>
              <Zh size={26} w={800}>
                主 agent
              </Zh>
              <div style={{display: 'flex', gap: 10, marginTop: 20}}>
                {['skill', 'skill', 'skill'].map((s, i) => (
                  <Pill key={i}>{s}</Pill>
                ))}
              </div>
              <div style={{display: 'flex', gap: 10, marginTop: 12}}>
                {['tool', 'tool', 'tool'].map((s, i) => (
                  <Pill key={i} bg={i === 2 ? 'rgba(255,255,255,0.5)' : '#fff'} color={i === 2 ? K.faint : K.ink}>
                    {s}
                  </Pill>
                ))}
              </div>
            </Box>
          )}
        </>,
      )}
      <SrcLine f={b[1]}>按原文第三张图重画</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ which tasks flipped
const TASKS = [
  {id: '退货', a: true, z: true},
  {id: '账单', a: true, z: true},
  {id: '诊断', a: false, z: true},
  {id: '订单 + 送达日期', a: true, z: false, flip: true},
  {id: '账户', a: true, z: true},
];
export const Flip: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const showFold = prog(b[1], 14, 6);
  const hl = prog(b[2], 14);
  return (
    <Shell part="怎么迁移 · 对比">
      <Head kicker="DON'T JUST READ THE SCORE" title="看哪些任务翻车了" />
      {/* scoreboard */}
      <div style={{position: 'absolute', left: 96, top: 236, width: 760, ...rise(b[0], 0)}}>
        <Card style={{padding: '22px 28px'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{flex: 1}}>
              <Lab size={14}>任务</Lab>
            </div>
            <div style={{width: 150, textAlign: 'center'}}>
              <Lab size={14}>并之前</Lab>
            </div>
            <div style={{width: 150, textAlign: 'center', opacity: showFold}}>
              <Lab size={14} color={K.clay}>
                并之后
              </Lab>
            </div>
          </div>
          {TASKS.map((t, i) => {
            const isFlip = !!t.flip;
            return (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: isFlip ? `rgba(181,67,46,${0.12 * hl})` : 'transparent',
                  border: isFlip ? `2px solid rgba(181,67,46,${hl})` : '2px solid transparent',
                  ...rise(b[0], 6 + i * 4),
                }}
              >
                <div style={{flex: 1}}>
                  <Zh size={24} w={isFlip ? 800 : 600}>
                    {t.id}
                  </Zh>
                </div>
                <div style={{width: 150, display: 'flex', justifyContent: 'center'}}>{t.a ? <Check size={30} color={K.green} strokeWidth={3} /> : <X size={30} color={K.red} strokeWidth={3} />}</div>
                <div style={{width: 150, display: 'flex', justifyContent: 'center', opacity: isFlip ? hl : showFold}}>
                  {t.z ? <Check size={30} color={K.green} strokeWidth={3} /> : <X size={30} color={K.red} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
          <div style={{marginTop: 18, display: 'flex', gap: 28, alignItems: 'center'}}>
            <Zh size={22} w={600} color={K.dim} style={{opacity: showFold}}>
              通过数：4 → 4
            </Zh>
            <Zh size={22} w={700} color={K.green} style={{opacity: showFold}}>
              延迟 ↓
            </Zh>
            <Illus />
          </div>
        </Card>
      </div>
      {/* trace */}
      <div style={{position: 'absolute', left: 940, top: 236, width: 880, ...rise(b[2], 0)}}>
        <Card style={{padding: '22px 28px', height: 360, position: 'relative'}}>
          <Lab size={14}>出错的那条轨迹</Lab>
          <div style={{position: 'absolute', left: 28, top: 70}}>
            <Box x={0} y={0} w={220} h={80} bg={K.peach}>
              <Zh size={24} w={800}>
                主 agent
              </Zh>
            </Box>
            <Wire pts={[[220, 40], [330, 40]]} p={prog(b[2], 12, 8)} arrow />
            <Box x={340} y={0} w={240} h={80} bg="#fff" style={{border: `1.5px solid ${K.hair}`}}>
              <Mo size={21}>订单查询工具</Mo>
            </Box>
            <Wire pts={[[580, 40], [690, 40]]} p={prog(b[2], 12, 18)} arrow />
            <Box x={700} y={0} w={120} h={80} bg={K.stone}>
              <Zh size={22} w={700}>
                回答
              </Zh>
            </Box>
            {/* the skipped specialist */}
            <Wire pts={[[110, 80], [110, 190], [330, 190]]} p={prog(b[3], 16)} dash color={K.red} />
            <Box x={340} y={150} w={300} h={80} bg={K.cream} style={{opacity: 0.4 + 0.6 * prog(b[3], 12), border: `2px dashed ${K.red}`}}>
              <Zh size={22} w={700}>
                物流专家：送达日期
              </Zh>
            </Box>
            <div style={{position: 'absolute', left: 660, top: 172, whiteSpace: 'nowrap', ...pop(b[3], 10)}}>
              <Zh size={24} w={800} color={K.red}>
                没去问
              </Zh>
            </div>
          </div>
        </Card>
      </div>
      {/* the lesson */}
      <div style={{position: 'absolute', left: 940, top: 620, width: 880, ...rise(b[4], 0)}}>
        <Card hot style={{padding: '18px 28px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <Mo size={22}>run 1</Mo>
            <Check size={28} color={K.green} strokeWidth={3} />
            <Mo size={22} style={{marginLeft: 14}}>
              run 2
            </Mo>
            <X size={28} color={K.red} strokeWidth={3} />
            <Zh size={22} w={600} color={K.dim} style={{marginLeft: 10}}>
              两次里只暴露一次
            </Zh>
          </div>
          <div style={{marginTop: 10, opacity: prog(b[4], 14, 30)}}>
            <Zh size={24} w={800}>
              每条生产链路、每条不能破的规则都要有任务，每个任务多跑几遍
            </Zh>
          </div>
        </Card>
      </div>
      <SrcLine f={b[0]}>左表为示意；案例出自原文：示例客服 agent，并掉一个 subagent 后延迟降低，但一个流程坏了</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ how teams contribute
export const Teams: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  // beats: 0 shift, 1 tools grouped, 2 30-50 limit, 3 skills DRI, 4 creator/doctor, 5 knowledge base, 6 central team
  const toolCount = Math.round(60 * prog(b[2], 40, 6));
  const over = toolCount > 40;
  const W = 540;
  const col = (i: number) => 96 + i * (W + 36);
  const cols = [
    {icon: Wrench, t: 'MCP 工具', f: b[1]},
    {icon: BookOpen, t: 'Skills', f: b[3]},
    {icon: Search, t: '知识库', f: b[5]},
  ];
  return (
    <Shell part="多团队协作">
      <Head kicker="HOW SEVERAL TEAMS CONTRIBUTE" title="从拥有 agent，到拥有 skill 和工具" />
      {cols.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={c.t} style={{position: 'absolute', left: col(i), top: 236, width: W, opacity: Math.max(0.35 * prog(b[0], 14, 10 + i * 6), prog(c.f, 16)), transform: `translateY(${(1 - prog(c.f, 16)) * 16}px)`}}>
            <Card style={{padding: '22px 26px', height: 470}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <Icon size={34} color={K.clay} strokeWidth={2.2} />
                <Zh size={32} w={800}>
                  {c.t}
                </Zh>
              </div>
              {i === 0 && c.f >= 0 && (
                <>
                  <div style={{marginTop: 10}}>
                    <Zh size={21} w={500} color={K.dim}>
                      执行动作、读实时数据、返回固定格式
                    </Zh>
                  </div>
                  <div style={{marginTop: 16, display: 'flex', gap: 10}}>
                    <Pill bg={K.peach} border="rgba(201,96,63,0.3)" style={{fontSize: 20}}>
                      按用户意图分组
                    </Pill>
                    <Pill bg={K.stone} border="transparent" style={{fontSize: 20, textDecoration: 'line-through', color: K.faint}}>
                      一个 API 一个工具
                    </Pill>
                  </div>
                  <div style={{marginTop: 18, opacity: prog(b[2], 12)}}>
                    <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
                      <span style={{fontFamily: FONT_MONO, fontSize: 40, fontWeight: 700, color: over ? K.red : K.ink}}>{toolCount}</span>
                      <Zh size={20} w={600} color={K.dim}>
                        个工具定义在提示词里
                      </Zh>
                      <Illus />
                    </div>
                    <div style={{position: 'relative', height: 26, marginTop: 8, background: K.stone, borderRadius: 4}}>
                      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(toolCount / 60) * 100}%`, background: over ? K.red : K.clay, borderRadius: 4}} />
                      <div style={{position: 'absolute', left: '50%', width: '33.3%', top: -6, bottom: -6, border: `2px dashed ${K.ink}`, borderRadius: 4}} />
                    </div>
                    <div style={{marginTop: 8, display: 'flex', justifyContent: 'space-between'}}>
                      <Zh size={19} w={500} color={K.faint}>
                        30–50 个以上，选工具变差
                      </Zh>
                    </div>
                    <div style={{marginTop: 12, opacity: prog(b[2], 14, 50)}}>
                      <Pill bg={K.clay} color="#fff" border={K.clay} style={{fontSize: 20}}>
                        工具搜索 · 延迟加载
                      </Pill>
                    </div>
                  </div>
                </>
              )}
              {i === 1 && c.f >= 0 && (
                <>
                  <div style={{marginTop: 10}}>
                    <Zh size={21} w={500} color={K.dim}>
                      团队怎么做事：步骤、规则、判断
                    </Zh>
                  </div>
                  <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
                    {['每个团队一位负责人', '和 skill 一起交付评测'].map((s, k) => (
                      <div key={s} style={pop(b[3], 8 + k * 6, 0.92)}>
                        <Pill style={{fontSize: 21}}>
                          <Check size={20} color={K.green} strokeWidth={3} />
                          {s}
                        </Pill>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12, opacity: prog(b[4], 14)}}>
                    <div>
                      <Mo size={22} w={700} color={K.clay}>
                        /skill-creator
                      </Mo>
                      <Zh size={20} w={500} color={K.dim} style={{marginLeft: 12}}>
                        写新的、审旧的
                      </Zh>
                    </div>
                    <div>
                      <Mo size={22} w={700} color={K.clay}>
                        /skill-doctor
                      </Mo>
                      <Zh size={20} w={500} color={K.dim} style={{marginLeft: 12}}>
                        看成本和用量，删掉没人用的
                      </Zh>
                    </div>
                  </div>
                </>
              )}
              {i === 2 && c.f >= 0 && (
                <>
                  <div style={{marginTop: 10}}>
                    <Zh size={21} w={500} color={K.dim}>
                      政策、指标定义、产品规格
                    </Zh>
                  </div>
                  <div style={{position: 'relative', marginTop: 24, height: 200}}>
                    {[0, 1, 2, 3].map((k) => (
                      <div key={k} style={{position: 'absolute', left: 20 + k * 22, top: k * 14, width: 200, height: 130, background: K.cream, borderRadius: 8, border: `1.5px solid ${K.hair}`}} />
                    ))}
                    <div style={{position: 'absolute', left: 300, top: 40}}>
                      <Pill bg={K.peach} border="rgba(201,96,63,0.3)" style={{fontSize: 20}}>
                        <Search size={20} color={K.clay} />
                        检索工具
                      </Pill>
                    </div>
                  </div>
                  <div style={{marginTop: 4}}>
                    <Zh size={21} w={700} color={K.red}>
                      别让代码硬塞进提示词
                    </Zh>
                  </div>
                </>
              )}
            </Card>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 96, right: 96, top: 730, display: 'flex', justifyContent: 'center', ...pop(b[6], 0, 0.9)}}>
        <Card hot style={{padding: '16px 34px', display: 'flex', alignItems: 'center', gap: 20}}>
          <Users size={34} color={K.clay} strokeWidth={2.2} />
          <Zh size={28} w={800}>
            一个小的中心团队：系统提示词 + 端到端质量
          </Zh>
          <Zh size={22} w={500} color={K.dim}>
            新 skill、工具、评测都先过它
          </Zh>
        </Card>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ the migration kit
const CMDS = [
  {c: '/claude-api build-eval', d: '建端到端评测'},
  {c: '/claude-api prompt-audit', d: '揪出给老模型写的规则'},
  {c: '/claude-api hillclimb', d: '对着评测反复改进'},
  {c: '/claude-api cost-optimize', d: '一次一项压成本和延迟'},
];
export const Kit: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const smoke = 'KIT_MODEL=fake python3 evals/run_eval.py --variant smoke';
  const typedN = Math.floor(clamp01((b[4] - 20) / 50) * smoke.length);
  return (
    <Shell part="迁移套件">
      <Head kicker="MIGRATION KIT" title="single-agent-loop-kit" />
      {/* repo card */}
      <div style={{position: 'absolute', left: 96, top: 230, width: 820, ...rise(b[0], 0)}}>
        <Card style={{padding: '22px 28px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <GitHubMark size={40} />
            <Mo size={28} w={700}>
              anthropics/single-agent-loop-kit
            </Mo>
          </div>
          <div style={{marginTop: 12, display: 'flex', gap: 12}}>
            <Pill bg={K.stone} border="transparent" style={{fontSize: 19}}>
              Apache-2.0
            </Pill>
            <Pill bg={K.stone} border="transparent" style={{fontSize: 19}}>
              参考实现，不再维护
            </Pill>
          </div>
        </Card>
      </div>
      {/* measure -> combine -> fold */}
      <div style={{position: 'absolute', left: 96, top: 420, width: 820, ...rise(b[1], 0)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          {['测量', '合并', '折叠'].map((s, i) => (
            <React.Fragment key={s}>
              <div style={pop(b[1], i * 8, 0.9)}>
                <Box x={0} y={0} w={200} h={90} bg={i === 0 ? K.peach : K.cream} radius={10} style={{position: 'relative'}}>
                  <Lab size={13} color={K.clay}>
                    {['MEASURE', 'COMBINE', 'FOLD'][i]}
                  </Lab>
                  <Zh size={30} w={800}>
                    {s}
                  </Zh>
                </Box>
              </div>
              {i < 2 && (
                <Zh size={30} w={700} color={K.clay}>
                  →
                </Zh>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{marginTop: 16}}>
          <Zh size={22} w={500} color={K.dim}>
            每次改动，前后都用同一套评测打分；数字说替代品站得住，subagent 才拿掉
          </Zh>
        </div>
      </div>
      {/* example */}
      <div style={{position: 'absolute', left: 96, top: 610, width: 820, ...rise(b[4], 0)}}>
        <Card style={{padding: '18px 24px', background: '#1F1E1C', border: 'none'}}>
          <Lab size={13} color="#B9B6AB">
            examples/support-desk · 一个路由 + 六个 subagent
          </Lab>
          <div style={{marginTop: 10, minHeight: 34}}>
            <Mo size={20} color="#F0EEE6">
              $ {smoke.slice(0, typedN)}
            </Mo>
          </div>
          <div style={{marginTop: 6, opacity: prog(b[4], 12, 80)}}>
            <Mo size={18} color="#9FC59A" style={{whiteSpace: 'normal'}}>
              19 tasks ran on the offline stand-in model, 0 harness errors.
            </Mo>
          </div>
          <div style={{marginTop: 6, opacity: prog(b[4], 12, 80)}}>
            <Zh size={18} w={500} color="#B9B6AB">
              免费检查：不需要 API key，不花钱（只验证管线，不打分）
            </Zh>
          </div>
        </Card>
      </div>
      {/* commands */}
      <div style={{position: 'absolute', left: 1000, top: 230, width: 820}}>
        <div style={rise(b[2], 0)}>
          <Lab size={15}>串起 Claude API 的四个 skill</Lab>
        </div>
        {CMDS.map((c, i) => {
          const f = i < 2 ? b[2] : b[3];
          const d = (i % 2) * 22 + 6;
          return (
            <div key={c.c} style={{marginTop: 16, ...pop(f, d, 0.92)}}>
              <Card hot={i < 2 ? b[3] < 0 : b[3] >= 0} style={{padding: '18px 24px'}}>
                <Mo size={26} w={700} color={K.clay}>
                  {c.c}
                </Mo>
                <div style={{marginTop: 4}}>
                  <Zh size={23} w={600}>
                    {c.d}
                  </Zh>
                </div>
              </Card>
            </div>
          );
        })}
        <div style={{marginTop: 18, ...rise(b[3], 40)}}>
          <Zh size={20} w={500} color={K.dim}>
            另有 /skill-creator、/skill-doctor 管 skill
          </Zh>
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ outro
export const Outro: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const morph = prog(b[2], 40, 10);
  const words = ['先测量', '一次只改一处', '留下站得住的'];
  return (
    <Shell>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', ...rise(b[0], 0)}}>
        <Lab size={20} color={K.clay}>
          MEASURE · CHANGE ONE THING · KEEP WHAT HOLDS UP
        </Lab>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
        {words.map((w, i) => (
          <React.Fragment key={w}>
            <div style={pop(b[0], 8 + i * 10, 0.85)}>
              <Serif size={64} color={i === 2 ? K.clay : K.ink}>
                {w}
              </Serif>
            </div>
            {i < 2 && (
              <div style={{opacity: prog(b[0], 10, 14 + i * 10)}}>
                <Serif size={56} color={K.line}>
                  →
                </Serif>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* fold one, keep only if worse */}
      <div style={{position: 'absolute', left: 260, top: 380, width: 1400, display: 'flex', gap: 30, justifyContent: 'center', ...rise(b[1], 0)}}>
        <Card style={{padding: '20px 30px', width: 560}}>
          <Lab size={14}>并进一个 subagent，跑评测</Lab>
          <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 14}}>
            <Check size={30} color={K.green} strokeWidth={3} />
            <Zh size={26} w={700}>
              不差 → 并进来
            </Zh>
          </div>
          <div style={{marginTop: 8, display: 'flex', alignItems: 'center', gap: 14}}>
            <X size={30} color={K.red} strokeWidth={3} />
            <Zh size={26} w={700}>
              更差 → 留成 subagent
            </Zh>
          </div>
        </Card>
        <Card hot style={{padding: '20px 30px', width: 560, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <Zh size={28} w={800}>
            然后，再来一遍
          </Zh>
          <Zh size={22} w={500} color={K.dim}>
            rinse and repeat
          </Zh>
        </Card>
      </div>
      {/* subagents become skills and tools */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', gap: 22, opacity: prog(b[2], 14)}}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const m = clamp01(morph * 1.6 - i * 0.12);
          return (
            <div key={i} style={{position: 'relative', width: 200, height: 110}}>
              <Box x={0} y={0} w={200} h={110} bg={K.cream} radius={10} style={{opacity: 1 - m}}>
                <Zh size={24} w={700}>
                  subagent
                </Zh>
              </Box>
              <div style={{position: 'absolute', left: 0, top: 30, width: 200, display: 'flex', justifyContent: 'center', opacity: m, transform: `scale(${0.8 + 0.2 * m})`}}>
                {i === 5 ? (
                  <Box x={0} y={-30} w={200} h={110} bg={K.cream} radius={10} style={{position: 'relative', opacity: 1}}>
                    <Zh size={22} w={700}>
                      subagent
                    </Zh>
                    <Zh size={18} w={500} color={K.dim}>
                      （仍值得留）
                    </Zh>
                  </Box>
                ) : (
                  <Pill bg={i % 2 ? '#fff' : K.peach} border="rgba(201,96,63,0.3)" style={{fontSize: 26}}>
                    {i % 2 ? 'tool' : 'skill'}
                  </Pill>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', opacity: prog(b[2], 14, 40)}}>
        <Zh size={24} w={500} color={K.dim}>
          原文：claude.com · Building agents: When to fold subagents into your main agent loop
        </Zh>
      </div>
    </Shell>
  );
};
