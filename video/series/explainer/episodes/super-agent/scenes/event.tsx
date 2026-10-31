// Section 3 of the article: event-driven (Trigger, two-level filter, Thread routing, Inline & Spill, chain of recall,
// speculative execution).
import React from 'react';
import {Ch, ChatRow, Chip, Code, during, Head, Lab, LogLine, LoopPacket, Mo, Node, Packet, prog, rise, Shell, SRC, SrcLine, useBeats, useCurrentFrame, usePopIn, V, Wire, Zh} from './common';
import type {Scene} from '@atv/lib/types';

type P = {scene: Scene};

// ------------------------------------------------------------------ Trigger
export const Trigger: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const ev: [string, string, string, string][] = [
    ['IM', 'group', '群聊消息', V.cyan],
    ['MAIL', 'inbox', '邮件与日程提醒', V.violet],
    ['REVIEW', 'pr#128', '代码审查评论', V.amber],
    ['CI', 'checks', 'CI 运行结果', V.green],
  ];
  const steps = ['3.1 过滤', '3.2 路由', '3.3 上下文组织', '3.4 提前行动'];
  return (
    <Shell file="03_event_driven.md" status="listening · triggers">
      <Head kicker="3 · 事件驱动" title="驱动 Agent 的，变成了环境事件" />
      <div style={{position: 'absolute', left: 120, top: 250, width: 700, ...rise(b[0])}}>
        <Lab>以前</Lab>
        <div style={{marginTop: 14, padding: '22px 26px', borderRadius: 12, border: `1.5px solid ${V.line}`, background: V.panel, opacity: 1 - 0.6 * prog(b[1], 16)}}>
          <Mo size={26} color={V.dim}>
            {'> 人类在 Session 中逐条键入提示词'}
          </Mo>
        </div>
      </div>
      <div style={{position: 'absolute', left: 900, top: 250, width: 900, height: 360, overflow: 'hidden', ...rise(b[1])}}>
        <Lab color={V.blue}>现在：Trigger（环境中的半结构化事件）</Lab>
        <div style={{position: 'absolute', top: 50, left: 0, right: 0}}>
          {Array.from({length: 8}, (_, i) => {
            const e = ev[i % 4];
            const y = i * 62 - ((Math.max(0, b[1]) * 0.8) % 248) - 62;
            return (
              <div key={i} style={{position: 'absolute', top: y + 62, left: 0, opacity: 0.9}}>
                <LogLine size={24} t={`#${40 + i}`} tag={`TRIGGER ${e[0]}`} color={e[3]}>
                  {e[2]}
                </LogLine>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 680, display: 'flex', alignItems: 'center', gap: 20}}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={rise(b[2], i * 10)}>
              <div style={{padding: '18px 30px', borderRadius: 12, border: `1.5px solid ${V.blue}`, background: during(b[2], i * 10 + 20, 9999) * 0 + (Math.floor(Math.max(0, b[2]) / 25) % 4 === i ? 1 : 0) ? V.blueSoft : V.panel}}>
                <Zh size={32} w={700}>
                  {s}
                </Zh>
              </div>
            </div>
            {i < 3 && (
              <Mo size={30} color={V.faint} style={{opacity: prog(b[2], 10, i * 10 + 6)}}>
                →
              </Mo>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{display: 'none'}}>{frame}</div>
    </Shell>
  );
};

// ------------------------------------------------------------------ two-level filter (figure 5)
export const Filter: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  const T: [string, string, string][] = [
    ['Trigger 1（非监听群消息）', '闲聊群', '“中午去食堂还是点外卖？”'],
    ['Trigger 2（用户群日常消息）', '用户群', '“新版本界面看着挺清爽”'],
    ['Trigger 3（用户群缺陷反馈）', '用户群', '“切换会话时偶发白屏”'],
  ];
  const FX = 700;
  const SX = 1150;
  const ys = [290, 440, 590];
  // packet runs
  const run = (f: number, pts: [number, number][]) => <Packet pts={pts} t={(f % 70) / 60} size={16} />;
  return (
    <Shell file="03_1_filter.md" status="filter · fast/slow">
      <Head kicker="3.1 · 原文图：两级过滤" title="先程序，后模型" sub="高噪音、低触发率" />
      {T.map(([t, g, m], i) => (
        <div key={t} style={{position: 'absolute', left: 120, top: ys[i] - 55, width: 500, padding: '14px 20px', boxSizing: 'border-box', borderRadius: 12, border: `1.5px solid ${i === 2 ? V.blue : V.line}`, background: V.panel, ...rise(b[0], i * 8)}}>
          <Zh size={22} w={700} color={i === 0 ? V.dim : V.blue}>
            {t}
          </Zh>
          <div>
            <Zh size={24} w={600}>
              {g}：{m}
            </Zh>
          </div>
        </div>
      ))}
      <div style={pop(b[1])}>
        <Node x={FX} y={235} w={360} h={420} color={V.blue} glow={during(b[2], 0, 9999)} title="程序层策略" titleSize={34}>
          <Mo size={22} color={V.blue}>
            Fast Path
          </Mo>
          <div style={{marginTop: 18, padding: '12px 18px', borderRadius: 8, border: `1px solid ${V.line}`}}>
            <Zh size={22} w={700}>
              确定性规则准入
            </Zh>
            <div>
              <Zh size={19} w={500} color={V.dim}>
                群组范围 / 来源白名单
              </Zh>
            </div>
          </div>
          <div style={{marginTop: 16, ...rise(b[2], 20)}}>
            <Zh size={22} w={600} color={V.dim}>
              拦截 Trigger 1
            </Zh>
          </div>
          <div style={rise(b[3])}>
            <Zh size={22} w={700} color={V.blue}>
              放行 Trigger 2、3
            </Zh>
          </div>
        </Node>
        <Node x={SX} y={290} w={380} h={320} color={V.violet} glow={during(b[3], 0, 9999)} title="语义层策略" titleSize={34}>
          <Mo size={22} color={V.violet}>
            Slow Path
          </Mo>
          <div style={{marginTop: 14, padding: '10px 18px', borderRadius: 8, border: `1px solid ${V.line}`}}>
            <Zh size={20} w={600}>
              LLM 按提示词判断语义
            </Zh>
          </div>
          <div style={{marginTop: 14, ...rise(b[4])}}>
            <Zh size={22} w={700}>
              静默 Trigger 2，触发 Trigger 3
            </Zh>
          </div>
        </Node>
        <Node x={1600} y={395} w={200} h={110} title="开始路由" sub="Trigger 3" color={V.blue} glow={during(b[4], 20, 9999)} titleSize={28} />
        {ys.map((y, i) => (
          <Wire key={i} pts={[[620, y], [FX, y]]} p={prog(b[1], 16, 6)} color="#4A5672" />
        ))}
        <Wire pts={[[FX + 360, 450], [SX, 450]]} p={prog(b[1], 16, 12)} color="#4A5672" />
        <Wire pts={[[SX + 380, 450], [1600, 450]]} p={prog(b[1], 16, 18)} color="#4A5672" />
      </div>
      {/* trigger 1 dies at the fast path */}
      {b[2] >= 0 && b[3] < 0 && run(b[2], [[620, ys[0]], [FX + 20, ys[0]]])}
      {b[2] >= 30 && (
        <div style={{position: 'absolute', left: FX - 40, top: ys[0] - 26, ...rise(b[2] - 30)}}>
          <Mo size={40} color={V.red} w={800}>
            ×
          </Mo>
        </div>
      )}
      {b[3] >= 0 && b[4] < 0 && run(b[3], [[620, ys[1]], [FX + 180, ys[1]], [FX + 360, 450], [SX + 60, 450]])}
      {b[4] >= 0 && run(b[4], [[620, ys[2]], [FX + 180, ys[2]], [FX + 360, 450], [SX + 380, 450], [1610, 450]])}
      <div style={{position: 'absolute', left: FX, top: 690, ...rise(b[2], 16)}}>
        <Zh size={22} w={500} color={V.dim}>
          × 滤除无关来源（无需调用 LLM）
        </Zh>
      </div>
      <div style={{position: 'absolute', left: SX, top: 690, ...rise(b[3], 16)}}>
        <Zh size={22} w={500} color={V.dim}>
          × 无需介入的讨论保持静默
        </Zh>
      </div>
      <SrcLine f={b[0]}>{SRC}</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ routing (figures 6 & 7)
const ThreadCard: React.FC<{x: number; title: string; rows: [string, string][]; f: number}> = ({x, title, rows, f}) => (
  <div style={{position: 'absolute', left: x, top: 225, width: 820, padding: '12px 18px', boxSizing: 'border-box', borderRadius: 12, border: `1.5px solid ${V.line}`, background: V.panel, ...rise(f)}}>
    <Zh size={22} w={800} color={V.blue}>
      {title}
    </Zh>
    {rows.map(([a, c], i) => (
      <div key={i} style={{display: 'flex', gap: 12, marginTop: 6, ...rise(f, 8 + i * 8)}}>
        <Mo size={17} color={V.faint}>
          {a}
        </Mo>
        <Zh size={19} w={500}>
          {c}
        </Zh>
      </div>
    ))}
  </div>
);

export const Route: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  const TX = 160;
  const RX = 820;
  const WX = 1420;
  const Y = 560;
  const fastPts: [number, number][] = [
    [TX + 340, Y + 190],
    [WX, Y + 190],
  ];
  return (
    <Shell file="03_2_route.md" status="router · subscriptions">
      <Head kicker="3.2 · 原文图：Thread 与订阅直通" title="已订阅的事件，不再经过 Router" />
      <ThreadCard
        x={120}
        f={b[0]}
        title="Thread #08（IM 群话题）"
        rows={[
          ['Trigger #39', '张三：“切换会话时页面偶发白屏”'],
          ['Trigger #40', '李四：“复现了，控制台报空指针异常”'],
          ['Trigger #42', '张三：“@Agent 帮忙定位修复一下”'],
        ]}
      />
      <ThreadCard
        x={980}
        f={b[0] - 10}
        title="Thread #15（GitHub Pull Request #128）"
        rows={[
          ['Trigger #51', 'Opened：“fix: 修复会话切换空指针”'],
          ['Trigger #54', 'CI Check：“unit-test 运行失败”'],
          ['Trigger #58', 'Review：“这里需要补充空值判断测试”'],
        ]}
      />
      <div style={pop(b[1])}>
        <Node x={TX} y={Y + 140} w={340} h={110} title="同一 Thread 事件" sub="如同一 PR 或 IM 话题" titleSize={26} />
        <Node x={RX} y={Y - 10} w={360} h={110} title="Router 层" sub="创建 Worker 并建立订阅" color={V.blue} glow={b[3] >= 0 ? 1 : 0.6} titleSize={28} />
        <Node x={WX} y={Y + 140} w={360} h={110} title="Worker Session" sub="已订阅该 Thread" color={V.green} glow={0.8} titleSize={28} />
        <Wire pts={[[TX + 170, Y + 140], [TX + 170, Y + 45], [RX, Y + 45]]} p={prog(b[1], 16, 6)} color="#6B7899" dash />
        <Wire pts={[[RX + 360, Y + 45], [WX + 180, Y + 45], [WX + 180, Y + 140]]} p={prog(b[1], 16, 16)} color="#6B7899" dash />
        <div style={{position: 'absolute', left: TX + 190, top: Y + 4}}>
          <Zh size={20} w={600} color={V.dim}>
            初始事件 (Slow Path)
          </Zh>
        </div>
      </div>
      <LoopPacket pts={[[TX + 170, Y + 140], [TX + 170, Y + 45], [RX, Y + 45]]} f={b[1] >= 0 && b[2] < 0 ? b[1] : -1} period={60} color={V.violet} />
      {b[2] >= 0 && (
        <>
          <Wire pts={fastPts} p={prog(b[2], 16)} color={V.blue} width={4} />
          <div style={{position: 'absolute', left: TX + 560, top: Y + 205, ...rise(b[2])}}>
            <Zh size={24} w={800} color={V.blue}>
              后续事件直通 (Fast Path)
            </Zh>
          </div>
          <LoopPacket pts={fastPts} f={b[2]} period={34} />
          <LoopPacket pts={fastPts} f={b[2]} period={34} offset={17} />
        </>
      )}
      {b[3] >= 0 && (
        <div style={{position: 'absolute', left: RX + 380, top: Y - 10, width: 420, ...rise(b[3])}}>
          <Zh size={22} w={600} color={V.violet}>
            未订阅的新事件 → Router 判断与分派；Router 仍观测所有事件
          </Zh>
        </div>
      )}
      {b[4] >= 0 && (
        <div style={{position: 'absolute', left: WX - 10, top: Y + 270, ...rise(b[4])}}>
          <Chip color={V.cyan} size={20}>
            Thread ⇄ Worker：多对多
          </Chip>
        </div>
      )}
      <SrcLine f={-1}>{SRC}</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ Inline & Spill
export const Inline: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const fill = prog(b[2], 30);
  const items: [string, string][] = [
    ['ID', 'trigger #42 · thread #08'],
    ['摘要', '当前对象的内容摘要'],
    ['前 50 字', '“@Agent 帮忙定位修复一下”…'],
    ['相邻', '前后相邻消息 / 所回复的消息'],
  ];
  return (
    <Shell file="03_3_context.md" status="context · inline/spill">
      <Head kicker="3.3 · 上下文组织" title="把上下文窗口当 Cache 管" />
      <div style={{position: 'absolute', left: 120, top: 236, ...rise(b[1])}}>
        <Zh size={34} w={800} color={V.amber}>
          “浪费上下文窗口，就是浪费模型的智能。”
        </Zh>
      </div>
      {/* window */}
      <div style={{position: 'absolute', left: 120, top: 330, width: 820, height: 470, borderRadius: 16, border: `2px solid ${V.blue}`, background: V.panel, ...rise(b[0])}}>
        <div style={{position: 'absolute', left: 22, top: 14}}>
          <Lab color={V.blue}>上下文窗口</Lab>
        </div>
        <div style={{position: 'absolute', left: 22, right: 22, top: 56, display: 'flex', flexDirection: 'column', gap: 12}}>
          {items.map(([k, v], i) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 8, background: V.blueSoft, border: `1px solid rgba(91,124,255,0.45)`, ...rise(b[i < 2 ? 2 : 4], i < 2 ? i * 10 : (i - 2) * 14)}}>
              <Mo size={20} color={V.blue} w={700} style={{width: 110}}>
                {k}
              </Mo>
              <Zh size={24} w={500}>
                {v}
              </Zh>
            </div>
          ))}
          <div style={{...rise(b[3], 10), display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', borderRadius: 8, border: `1.5px dashed ${V.amber}`}}>
            <Mo size={20} color={V.amber} w={700} style={{width: 110}}>
              引用
            </Mo>
            <Code>read_trigger(#42)</Code>
            <Zh size={22} w={500} color={V.dim}>
              按需续读
            </Zh>
          </div>
        </div>
        <div style={{position: 'absolute', left: 22, right: 22, bottom: 18, height: 10, borderRadius: 5, background: V.line}}>
          <div style={{height: 10, borderRadius: 5, width: `${30 + 40 * fill + 3 * Math.sin(frame / 20)}%`, background: V.blue}} />
        </div>
      </div>
      {/* spill area */}
      <div style={{position: 'absolute', left: 1040, top: 330, width: 760, ...rise(b[3])}}>
        <Lab color={V.amber}>窗口之外（Spill）</Lab>
        <div style={{marginTop: 14, padding: '18px 22px', borderRadius: 12, border: `1.5px dashed ${V.line}`, height: 200, overflow: 'hidden', position: 'relative'}}>
          {Array.from({length: 7}, (_, i) => (
            <div key={i} style={{height: 12, width: `${[90, 70, 85, 60, 95, 75, 80][i]}%`, background: 'rgba(227,179,65,0.25)', borderRadius: 4, marginBottom: 14}} />
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 80, background: `linear-gradient(transparent, ${V.bg})`}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 1040, top: 610, width: 760, display: 'flex', flexDirection: 'column', gap: 10}}>
        {['① 从最少信息开始：ID + 内容摘要', '② 利用局部性逐步 Inline 关联信息', '③ 超出上限则 Spill：截断，保留续读入口'].map((t, i) => (
          <div key={t} style={rise(b[4], i * 14)}>
            <Zh size={26} w={600}>
              {t}
            </Zh>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ chain of recall (figure 8)
export const Recall: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  const n = [
    {x: 120, y: 300, w: 380, h: 330, t: 'Trigger #42 (Inline 注入)', f: b[0]},
    {x: 680, y: 300, w: 380, h: 330, t: 'Thread #08 (Inline & Spill)', f: b[2]},
    {x: 1180, y: 300, w: 300, h: 130, t: 'Trigger #40 详情', f: b[2] + 10},
    {x: 1180, y: 500, w: 300, h: 150, t: 'Worker #03 状态', f: b[2] + 30},
    {x: 1540, y: 500, w: 260, h: 150, t: 'Thread #15 详情', f: b[3]},
  ];
  const rowStyle = (hot: boolean): React.CSSProperties => ({marginTop: 12, padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${hot ? V.blue : V.line}`, background: hot ? V.blueSoft : 'transparent'});
  const edge = (pts: [number, number][], label: string, f: number, lx: number, ly: number) => (
    <>
      <Wire pts={pts} p={prog(f, 18)} color={V.blue} dash />
      <div style={{position: 'absolute', left: lx, top: ly, opacity: prog(f, 12, 6)}}>
        <Code size={18}>{label}</Code>
      </div>
      <LoopPacket pts={pts} f={f} period={50} size={11} />
    </>
  );
  return (
    <Shell file="03_3_recall.md" status="router · recall">
      <Head kicker="3.3 · 原文图：链式召回" title="顺着 ID，一跳一跳展开" sub="Chain of Recall" />
      <div style={{position: 'absolute', left: 120, top: 228, ...rise(b[1])}}>
        <Zh size={24} w={500} color={V.dim}>
          Trigger、Thread、Worker Session 都有唯一 ID；注入时内联关联对象的 ID → 一张引用图
        </Zh>
      </div>
      {n.map((k, i) => (
        <div key={i} style={pop(k.f)}>
          <div style={{position: 'absolute', left: k.x, top: k.y, width: k.w, height: k.h, boxSizing: 'border-box', padding: 16, borderRadius: 12, border: `1.5px solid ${V.blue}`, background: V.panel}}>
            <div>
              <Zh size={22} w={800}>
                {k.t}
              </Zh>
            </div>
            {i === 0 && (
              <>
                <div style={rowStyle(false)}>
                  <Zh size={19} w={600}>
                    前 50 字与相邻消息
                  </Zh>
                  <div>
                    <Zh size={16} w={500} color={V.dim}>
                      超出部分 Spill 截断
                    </Zh>
                  </div>
                </div>
                <div style={rowStyle(b[2] >= 0)}>
                  <Mo size={19}>thread_id: #08</Mo>
                </div>
                <div style={rowStyle(false)}>
                  <Mo size={19} color={V.dim}>
                    worker_id: #03
                  </Mo>
                </div>
              </>
            )}
            {i === 1 && (
              <>
                <div style={rowStyle(false)}>
                  <Zh size={19} w={600}>
                    近期事件摘要
                  </Zh>
                  <div>
                    <Zh size={16} w={500} color={V.dim}>
                      更早历史 Spill 截断
                    </Zh>
                  </div>
                </div>
                <div style={rowStyle(false)}>
                  <Mo size={19}>trigger_ids: [#39, #40]</Mo>
                </div>
                <div style={rowStyle(b[2] >= 30)}>
                  <Mo size={19}>worker_ids: [#02, #03]</Mo>
                </div>
              </>
            )}
            {i === 2 && (
              <div style={{marginTop: 6}}>
                <div style={{marginTop: 6}}>
                  <Zh size={18} w={500} color={V.dim}>
                    同样遵循 Inline & Spill
                  </Zh>
                </div>
              </div>
            )}
            {i === 3 && (
              <>
                <div style={{marginTop: 6}}>
                  <Zh size={18} w={500} color={V.dim}>
                    任务进度与状态摘要
                  </Zh>
                </div>
                <div style={rowStyle(b[3] >= 0)}>
                  <Mo size={18}>thread_id: #15</Mo>
                </div>
              </>
            )}
            {i === 4 && (
              <div style={{marginTop: 6}}>
                <div style={{marginTop: 6}}>
                  <Zh size={18} w={500} color={V.dim}>
                    关联 Pull Request
                  </Zh>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      {b[2] >= 0 && edge([[500, 480], [680, 480]], 'read_thread(#08)', b[2], 506, 436)}
      {b[2] >= 10 && edge([[1060, 520], [1120, 520], [1120, 365], [1180, 365]], 'read_trigger(#40)', b[2] - 10, 1130, 440)}
      {b[2] >= 30 && edge([[1060, 590], [1180, 590]], 'read_worker(#03)', b[2] - 30, 1010, 655)}
      {b[3] >= 0 && edge([[1480, 610], [1540, 610]], 'read_thread(#15)', b[3], 1500, 665)}
      <div style={{position: 'absolute', left: 120, top: 700, width: 1500, ...rise(b[4])}}>
        <Zh size={28} w={700} color={V.green}>
          Router 不必装下所有任务的全量历史，用户跨信道提起旧任务时也能找回
        </Zh>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ speculative execution (figure 9)
export const Spec: React.FC<P> = () => {
  const b = useBeats();
  const phase2 = prog(b[3], 18);
  return (
    <Shell file="03_4_speculate.md" status="background · speculating">
      <Head kicker="3.4 · 提前行动" title="投机执行：讨论还在进行，方案已经交付" />
      <div style={{opacity: 1 - phase2}}>
        <div style={{position: 'absolute', left: 120, top: 260, display: 'flex', alignItems: 'center', gap: 24, ...rise(b[0])}}>
          <Node x={0} y={0} w={0} h={0} style={{display: 'none'}} />
          {[
            ['环境信号', V.cyan],
            ['后台提前尝试', V.blue],
          ].map(([t, c], i) => (
            <React.Fragment key={t}>
              <div style={{padding: '22px 34px', borderRadius: 14, border: `1.5px solid ${c}`, background: V.panel}}>
                <Zh size={36} w={800} color={c}>
                  {t}
                </Zh>
              </div>
              <Mo size={34} color={V.faint}>
                →
              </Mo>
              {i === 1 && (
                <div style={{display: 'flex', flexDirection: 'column', gap: 14, ...rise(b[1])}}>
                  <Chip color={V.green} size={26}>
                    有价值 → 交付
                  </Chip>
                  <Chip color={V.faint} size={26}>
                    没价值 → 丢弃
                  </Chip>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{position: 'absolute', left: 120, top: 460, ...rise(b[1], 16)}}>
          <Zh size={28} w={500} color={V.dim}>
            消耗额外的后台算力，减少人类的等待与介入成本
          </Zh>
        </div>
        <div style={{position: 'absolute', left: 120, top: 560, ...rise(b[2])}}>
          <Lab>DeepSeek Harness 内部用户群里的一条策略</Lab>
          <div style={{marginTop: 14}}>
            <Mo size={40} color={V.green}>
              policy: “静默复现并修复”
            </Mo>
          </div>
        </div>
      </div>
      {b[3] >= 0 && (
        <div style={{position: 'absolute', left: 120, top: 226, width: 1680, display: 'flex', flexDirection: 'column', gap: 22, opacity: phase2}}>
          <Zh size={22} w={500} color={V.dim}>
            原文图 · 用户群中关于波浪号被渲染成删除线的讨论
          </Zh>
          <div style={rise(b[3])}>
            <ChatRow who="用户 A" text="模型输出中的波浪号被渲染成了删除线，影响阅读。" size={27} />
          </div>
          <div style={rise(b[3], 20)}>
            <ChatRow who="群内讨论" text="应该在训练中解决，让模型转义，还是修改渲染规则？" muted size={27} />
          </div>
          <div style={rise(b[4])}>
            <ChatRow
              who="Super-agent"
              agent
              size={27}
              text={
                <>
                  已提交 Pull Request：只有 <Code>~~文字~~</Code> 渲染为删除线，单个 <Code>~</Code>（如 <Code>10~20</Code>）保持原样。
                </>
              }
            />
          </div>
          <div style={rise(b[5])}>
            <ChatRow who="用户 B" text="单个波浪号也是常见写法，这样修改的依据是什么？" size={27} />
          </div>
          <div style={rise(b[5], 30)}>
            <ChatRow
              who="Super-agent"
              agent
              size={27}
              text={
                <>
                  Pandoc 和 markdown-it 只支持 <Code>~~</Code>，GFM 额外接受单个 <Code>~</Code>。模型输出中的单个 <Code>~</Code> 多用于表示范围，正是误渲染的来源。
                </>
              }
            />
          </div>
        </div>
      )}
    </Shell>
  );
};

export const _u = {Ch, Packet};
