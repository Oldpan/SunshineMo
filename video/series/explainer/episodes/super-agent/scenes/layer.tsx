// Section 2 of the article: the two-layer architecture (trade-off, Router layer, batching, Worker layer).
import React from 'react';
import {Ch, Chapter, Chip, during, Head, Lab, LoopPacket, Mo, Node, Packet, prog, rise, Shell, SRC, SrcLine, useBeats, useCurrentFrame, usePopIn, V, Wire, Zh} from './common';
import type {Scene} from '@atv/lib/types';

type P = {scene: Scene};

/** Chapter card driven by the scene's `data` (num, title, sub). */
export const Chap: React.FC<P> = ({scene}) => {
  const d = (scene as unknown as {data?: {num: string; title: string; sub?: string}}).data ?? {num: '00', title: ''};
  return <Chapter num={d.num} title={d.title} sub={d.sub} />;
};

const Red: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 10, border: '1.5px solid rgba(242,85,90,0.55)', background: 'rgba(242,85,90,0.08)', ...style}}>
    <Mo size={24} color={V.red} w={800}>
      ×
    </Mo>
    <Zh size={26} w={600}>
      {children}
    </Zh>
  </div>
);
const Green: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 10, border: '1.5px solid rgba(63,185,80,0.55)', background: 'rgba(63,185,80,0.08)', ...style}}>
    <Mo size={24} color={V.green} w={800}>
      ✓
    </Mo>
    <Zh size={26} w={600}>
      {children}
    </Zh>
  </div>
);

// ------------------------------------------------------------------ trade-off
export const Tradeoff: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const knob = 0.5 + 0.38 * (b[3] >= 0 ? prog(b[3], 30) : -prog(b[1], 30));
  return (
    <Shell file="02_two_layer.md">
      <Head kicker="2 · 双层架构" title="连续性 vs 吞吐量" sub="会话组织的根本权衡" />
      {/* slider */}
      <div style={{position: 'absolute', left: 560, top: 236, width: 800, ...rise(b[0])}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Zh size={26} w={700} color={V.blue}>
            连续性
          </Zh>
          <Zh size={26} w={700} color={V.green}>
            吞吐量
          </Zh>
        </div>
        <div style={{position: 'relative', height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${V.blue}, ${V.green})`, marginTop: 12, opacity: 0.6}}>
          <div style={{position: 'absolute', left: `${knob * 100}%`, top: -11, width: 30, height: 30, marginLeft: -15, borderRadius: 15, background: '#fff', boxShadow: '0 0 14px rgba(255,255,255,0.6)'}} />
        </div>
      </div>
      {/* left: one session */}
      <div style={{position: 'absolute', left: 120, top: 360, width: 800, ...rise(b[1])}}>
        <Lab color={V.blue}>所有事件 → 同一个 Session</Lab>
        <Node x={300} y={70} w={300} h={160} title="Session" sub="上下文最连续" glow={during(b[1], 0, b[3] >= 0 ? b[1] - b[3] + 1e9 : 1e9) * 0.8} color={V.blue} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{position: 'absolute', left: 30 + i * 46, top: 135, width: 30, height: 30, borderRadius: 6, background: [V.cyan, V.amber, V.violet, V.cyan, V.amber][i], opacity: 0.85}} />
        ))}
        <LoopPacket pts={[[260, 150], [300, 150]]} f={b[1]} period={40} color={V.cyan} />
        <div style={{position: 'absolute', left: 0, top: 270, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={rise(b[2])}>
            <Red>单个 ReAct Loop 串行：耗时长、吞吐低</Red>
          </div>
          <div style={rise(b[2], 14)}>
            <Red>多任务中间细节混杂，影响完成效果</Red>
          </div>
        </div>
      </div>
      {/* right: a session per event */}
      <div style={{position: 'absolute', left: 1020, top: 360, width: 800, ...rise(b[3])}}>
        <Lab color={V.green}>每条事件 → 新开独立 Session</Lab>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{position: 'absolute', left: 20 + i * 150, top: 70 + Math.sin(frame / 14 + i) * 4}}>
            <Node x={0} y={0} w={130} h={160} title={`S${i + 1}`} sub="并发" color={V.green} glow={0.5} titleSize={26} />
          </div>
        ))}
        <div style={{position: 'absolute', left: 0, top: 270, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={rise(b[4])}>
            <Red>缺少全局上下文，结果彼此割裂</Red>
          </div>
          <div style={rise(b[4], 14)}>
            <Red>各自向用户响应，交互混乱</Red>
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ two layers (figure 4)
export const Twolayer: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  const chans = ['IM', 'GitHub', '邮件 / 日程'];
  const R = {x: 720, y: 400, w: 440, h: 170};
  const one = prog(b[2], 20);
  return (
    <Shell file="02_two_layer.md">
      <Head kicker="2 · 原文图：双层架构" title="Router 层 + Worker 层" />
      {chans.map((c, i) => (
        <div key={c} style={pop(b[0], i * 5)}>
          <Node x={150} y={300 + i * 130} w={260} h={96} title={c} titleSize={28} />
          <Wire pts={[[410, 348 + i * 130], [R.x, R.y + 50 + i * 35]]} p={prog(b[0], 20, 10)} color="#4A5672" />
          <LoopPacket pts={[[410, 348 + i * 130], [R.x, R.y + 50 + i * 35]]} f={b[0] - 20} period={55} offset={i * 18} color={V.cyan} size={12} />
        </div>
      ))}
      <div style={pop(b[0], 8)}>
        <Node {...R} title="Router 层" sub="共享上下文，路由与交互" glow={1} color={V.blue} titleSize={38} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={pop(b[1], i * 6)}>
          <Wire pts={[[R.x + R.w, R.y + 50 + i * 35], [1440, 330 + i * 130]]} p={prog(b[1], 20, 4)} color={V.blue} />
          <Node x={1440} y={282 + i * 130} w={340} h={96} title={`Worker Session ${i + 1}`} sub="隔离上下文" color={V.green} glow={0.6} titleSize={26} />
          <LoopPacket pts={[[R.x + R.w, R.y + 50 + i * 35], [1440, 330 + i * 130]]} f={b[1] - 20} period={60} offset={i * 20} size={12} />
        </div>
      ))}
      {/* the user sees one agent */}
      <div style={{position: 'absolute', left: 690, top: 262, width: 1120, height: 420, borderRadius: 22, border: `2px dashed rgba(91,124,255,${0.7 * one})`, opacity: one}}>
        <div style={{position: 'absolute', left: 24, top: -20, background: V.bg, padding: '0 12px'}}>
          <Zh size={26} w={800} color={V.blue}>
            用户面对的：始终是同一个 Super-agent
          </Zh>
        </div>
      </div>
      <div style={{position: 'absolute', left: 150, top: 720, width: 1640, padding: '18px 26px', borderLeft: `4px solid ${V.amber}`, background: 'rgba(227,179,65,0.08)', borderRadius: 6, ...rise(b[3])}}>
        <Zh size={30} w={600}>
          “Session 应当是系统的实现细节，而不应是用户的认知负担。”
        </Zh>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ Router layer
export const Router: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  const cmp = prog(b[2], 18);
  return (
    <Shell file="02_1_router.md" status="router · online">
      <Head kicker="2.1 · Router 层" title="只管交互和分派" />
      <div style={{position: 'absolute', left: 120, top: 250, width: 640}}>
        <div style={pop(b[0])}>
          <Node x={0} y={0} w={640} h={150} title="Router 层" sub="常驻 · 承接所有入口的人类交互" glow={1} color={V.blue} titleSize={40} />
        </div>
        <div style={{position: 'absolute', top: 175, display: 'flex', gap: 14}}>
          {['全局序点', '协调点', '记忆'].map((t, i) => (
            <div key={t} style={rise(b[0], 14 + i * 8)}>
              <Chip color={V.blue} size={22}>
                {t}
              </Chip>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', top: 250, width: 640, ...rise(b[1])}}>
          <Lab>不直接执行具体任务</Lab>
          <div style={{display: 'flex', gap: 14, marginTop: 14}}>
            <Chip color={V.cyan} size={22}>
              人类交互
            </Chip>
            <Chip color={V.cyan} size={22}>
              任务分派
            </Chip>
            <Chip color={V.red} size={22} style={{textDecoration: prog(b[1], 10, 20) > 0.5 ? 'line-through' : 'none'}}>
              Bash
            </Chip>
            <Zh size={22} w={500} color={V.dim}>
              甚至可以不配
            </Zh>
          </div>
        </div>
        <div style={{position: 'absolute', top: 400, ...rise(b[4])}}>
          <Green>较轻量的模型，往往就能兼顾速度与效果</Green>
        </div>
      </div>
      {/* Agent Team vs Router */}
      <div style={{position: 'absolute', left: 860, top: 250, width: 940, opacity: cmp}}>
        <div style={{display: 'flex', gap: 24}}>
          <div style={{flex: 1, padding: 26, borderRadius: 14, border: `1.5px solid ${V.line}`, background: V.panel, ...rise(b[2])}}>
            <Lab color={V.amber}>常见 Agent Team</Lab>
            <div style={{marginTop: 12}}>
              <Zh size={30} w={800}>
                Team Lead
              </Zh>
            </div>
            <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
              {['单个复杂任务内部的步骤拆解', '深入理解任务细节、规划子任务', '高频协调各个成员', '自身推理负载很重'].map((t) => (
                <Zh key={t} size={24} w={500} color={V.dim}>
                  · {t}
                </Zh>
              ))}
            </div>
          </div>
          <div style={{flex: 1, padding: 26, borderRadius: 14, border: `1.5px solid ${V.blue}`, background: V.blueSoft, ...rise(b[3])}}>
            <Lab color={V.blue}>Super-agent</Lab>
            <div style={{marginTop: 12}}>
              <Zh size={30} w={800}>
                Router 层
              </Zh>
            </div>
            <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
              {['只处理任务之间的高层关联与分派', '无需介入单任务内部的拆解'].map((t) => (
                <Zh key={t} size={24} w={500}>
                  · {t}
                </Zh>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ batching
/** Lane of arriving triggers and the Router's LLM calls; `dense` merges the backlog into one call. */
const Lane: React.FC<{y: number; f: number; dense: boolean; label: string}> = ({y, f, dense, label}) => {
  if (f < 0) return null;
  const x0 = 120;
  const W = 1680;
  const step = 240;
  const period = dense ? 60 : 240;
  const t = (f * 5) % (W + 200);
  const arrivals = Array.from({length: Math.floor(W / period)}, (_, i) => i * period + 30);
  return (
    <div style={{position: 'absolute', left: 0, top: y, ...rise(f)}}>
      <div style={{position: 'absolute', left: x0, top: -52, whiteSpace: 'nowrap'}}>
        <Zh size={26} w={700} color={dense ? V.amber : V.cyan}>
          {label}
        </Zh>
      </div>
      <div style={{position: 'absolute', left: x0, top: 0, width: W, height: 2, background: V.line}} />
      {arrivals.map((a, i) => (
        <div key={i} style={{position: 'absolute', left: x0 + a, top: -14, width: 5, height: 28, borderRadius: 2, background: dense ? V.amber : V.cyan, opacity: a < t ? 1 : 0.25}} />
      ))}
      {Array.from({length: Math.floor(W / step)}, (_, i) => {
        const cx = i * step + 60;
        const n = dense ? arrivals.filter((a) => a >= cx - step && a < cx).length : 1;
        return (
          <div key={i} style={{position: 'absolute', left: x0 + cx, top: 24, width: 200, height: 54, borderRadius: 8, border: `1.5px solid ${V.blue}`, background: cx < t ? V.blueSoft : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: cx < t ? 1 : 0.3}}>
            <Mo size={20} color={V.ink}>
              LLM call · {Math.max(1, n)} 条
            </Mo>
          </div>
        );
      })}
    </div>
  );
};

export const Batching: React.FC<P> = () => {
  const b = useBeats();
  const shard = prog(b[5], 24);
  return (
    <Shell file="02_1_router.md" status="router · batching">
      <Head kicker="2.1 · Router 层" title="积压的 Trigger 自动合批" sub="单个常驻 LLM Session" />
      <div style={{opacity: 1 - shard}}>
        <Lane y={340} f={b[1]} dense={false} label="事件平稳：Trigger 逐条进入" />
        <Lane y={510} f={b[2]} dense label="事件密集：上一轮积压的 Trigger 合并进下一次调用" />
        <div style={{position: 'absolute', left: 120, top: 640, width: 1680, ...rise(b[3])}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <Lab>每一步</Lab>
            <div style={{flex: 1, display: 'flex', height: 54, borderRadius: 8, overflow: 'hidden'}}>
              <div style={{flex: 6, background: V.blueSoft, border: `1.5px solid ${V.blue}`, display: 'flex', alignItems: 'center', paddingLeft: 18}}>
                <Zh size={24} w={700}>
                  长输入（多条 Trigger 一起 Prefill，并行计算）
                </Zh>
              </div>
              <div style={{flex: 1, background: 'rgba(63,185,80,0.15)', border: `1.5px solid ${V.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Zh size={24} w={700}>
                  短输出
                </Zh>
              </div>
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 120, top: 730, display: 'flex', gap: 18, ...rise(b[4])}}>
          <Green>单次请求耗时的增长，远慢于批处理大小</Green>
          <Green>一定范围内：积压越多，单个决定分摊的推理时间越低</Green>
        </div>
        <div style={{position: 'absolute', left: 120, top: 806, ...rise(b[4], 20)}}>
          <Zh size={24} w={500} color={V.dim}>
            上限取决于上下文长度，以及模型在一轮中能准确处理多少条 Trigger
          </Zh>
        </div>
      </div>
      {b[5] >= 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 280, opacity: shard}}>
          <div style={{position: 'absolute', left: 260, top: 0}}>
            <Lab>规模进一步扩大：多层过滤，或水平切分（Sharding）</Lab>
          </div>
          {[0, 1, 2].map((i) => (
            <Node key={i} x={260 + i * 300 + shard * i * 40} y={70} w={260} h={130} title={`Router 分片 ${i + 1}`} color={V.blue} glow={0.7} titleSize={28} />
          ))}
          <div style={{position: 'absolute', left: 1260, top: 70, display: 'flex', flexDirection: 'column', gap: 18}}>
            <Green>切分越细 → 并发吞吐越高</Green>
            <Red>分片之间的记忆与上下文连续性越低</Red>
          </div>
        </div>
      )}
      <div style={{position: 'absolute', left: 120, top: 236, ...rise(b[0])}}>
        <Mo size={20} color={V.faint}>
          {'# 上一轮推理期间到达的 Trigger 会积压，下一轮一并处理'}
        </Mo>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ Worker layer
export const Worker: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  const ws = [0, 1, 2];
  const RY = 250;
  return (
    <Shell file="02_2_worker.md" status="workers · 3 running">
      <Head kicker="2.2 · Worker 层" title="隔离上下文，专注单一任务" />
      <div style={pop(b[1])}>
        <Node x={700} y={RY} w={520} h={110} title="Router 层" sub="统一向用户回复" color={V.blue} glow={0.8} titleSize={32} />
        <Wire pts={[[1220, RY + 55], [1480, RY + 55]]} p={prog(b[1], 16, 10)} color={V.blue} />
        <Node x={1480} y={RY + 10} w={300} h={90} title="用户" titleSize={28} />
      </div>
      {ws.map((i) => {
        const x = 230 + i * 520;
        return (
          <div key={i} style={pop(b[0], i * 6)}>
            <Node x={x} y={560} w={440} h={200} color={V.green} glow={0.6} title={`Worker ${i + 1}`} titleSize={30}>
              <div style={{display: 'flex', gap: 10, marginTop: 6}}>
                <Chip color={V.green} size={16}>
                  完整执行工具
                </Chip>
                <Chip color={V.amber} size={16}>
                  能力最强的模型
                </Chip>
              </div>
              {b[4] >= 0 && (
                <div style={{display: 'flex', gap: 10, marginTop: 10, ...rise(b[4], i * 6)}}>
                  {['Subagent', 'Subagent'].map((s, k) => (
                    <div key={k} style={{padding: '3px 10px', borderRadius: 6, border: `1px dashed ${V.violet}`}}>
                      <Mo size={15} color={V.violet}>
                        {s}
                      </Mo>
                    </div>
                  ))}
                </div>
              )}
            </Node>
            <Wire pts={[[x + 220, 560], [x + 220 + (960 - x - 220) * 0.6, RY + 110]]} p={prog(b[1], 18, 4 + i * 4)} color={V.green} />
            <LoopPacket pts={[[x + 220, 560], [x + 220 + (960 - x - 220) * 0.6, RY + 110]]} f={b[1] - 20} period={50} offset={i * 15} color={V.green} size={12} />
          </div>
        );
      })}
      {/* no peer chatter */}
      {b[2] >= 0 && b[3] < 0 && (
        <div style={{position: 'absolute', left: 670, top: 640, ...rise(b[2])}}>
          <Mo size={40} color={V.red} w={800}>
            ×
          </Mo>
        </div>
      )}
      {b[2] >= 0 && b[3] < 0 && (
        <div style={{position: 'absolute', left: 1190, top: 640, ...rise(b[2])}}>
          <Mo size={40} color={V.red} w={800}>
            ×
          </Mo>
        </div>
      )}
      {/* shared PR thread */}
      {b[3] >= 0 && (
        <div style={{...rise(b[3])}}>
          <Node x={720} y={410} w={480} h={90} title="同一个 Pull Request 的 Thread" titleSize={24} color={V.cyan} glow={0.7} />
          <Packet pts={[[860, 500], [450, 560]]} t={((b[3] % 50) / 50)} color={V.cyan} size={12} />
          <Packet pts={[[1060, 500], [970, 560]]} t={((b[3] % 50) / 50)} color={V.cyan} size={12} />
          <div style={{position: 'absolute', left: 230, top: 790}}>
            <Zh size={24} w={600} color={V.cyan}>
              Worker 1 和 Worker 2 都订阅了它 → 收到相同的事件通知，有机会自行发现和解决冲突
            </Zh>
          </div>
        </div>
      )}
      {b[4] >= 0 && (
        <div style={{position: 'absolute', left: 230, top: 790, background: V.bg, ...rise(b[4])}}>
          <Zh size={24} w={600} color={V.violet}>
            Worker 内部可以再创建 Subagent，也可以本身就是一个 Agent Team —— 对 Router 层保持透明
          </Zh>
        </div>
      )}
      <SrcLine f={-1}>{SRC}</SrcLine>
    </Shell>
  );
};

export const _u = {Ch, during};
