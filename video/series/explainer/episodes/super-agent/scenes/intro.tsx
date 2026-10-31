// Opening (3–5 sessions), the source, section 1 of the article (why, the limit, two internal examples, four traits)
// and the overall architecture figure.
import React from 'react';
import {
  Caret,
  Ch,
  ChatRow,
  Chip,
  clamp01,
  Code,
  count,
  DeepSeekWhale,
  during,
  Head,
  Lab,
  LogLine,
  LoopPacket,
  Mo,
  Node,
  Num,
  Packet,
  prog,
  rise,
  Shell,
  SRC,
  SrcLine,
  typedN,
  useBeats,
  useCurrentFrame,
  usePopIn,
  V,
  Win,
  Wire,
  Zh,
} from './common';
import type {Scene} from '@atv/lib/types';

type P = {scene: Scene};

// ------------------------------------------------------------------ cover
const SessionTile: React.FC<{i: number; f: number}> = ({i, f}) => {
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const over = i >= 5;
  const warn = i >= 3 && !over;
  const c = over ? V.red : warn ? V.amber : V.green;
  const col = i % 3;
  const row = Math.floor(i / 3);
  const blink = over ? 0.45 + 0.25 * Math.sin(frame / 6 + i) : 1;
  return (
    <div style={{position: 'absolute', left: 1000 + col * 270, top: 250 + row * 190, ...pop(f, i * 7)}}>
      <div style={{opacity: blink}}>
        <Win w={250} h={168} title={`session-${i + 1}`} accent={c} bodyStyle={{padding: '12px 14px'}}>
          {[0.8, 0.55, 0.7].map((w, k) => (
            <div key={k} style={{height: 9, width: `${w * 100}%`, background: V.line, borderRadius: 4, marginBottom: 12}} />
          ))}
          <div style={{position: 'absolute', right: 12, bottom: 10}}>
            <Mo size={15} color={c}>
              {over ? '无人跟进' : warn ? '勉强' : '跟进中'}
            </Mo>
          </div>
        </Win>
      </div>
    </div>
  );
};

export const Cover: React.FC<P> = () => {
  const b = useBeats();
  const dimTiles = 1 - prog(b[3], 14);
  const n = Math.round(count(b[1], 0, 8, 50));
  return (
    <Shell file="00_super-agent.md" status="watching · 0 tasks">
      <div style={{position: 'absolute', left: 120, top: 120, display: 'flex', alignItems: 'center', gap: 18, ...rise(b[0])}}>
        <DeepSeekWhale size={64} />
        <Mo size={24} color={V.comment}>
          {'// DeepSeek Harness 团队的观察'}
        </Mo>
      </div>
      <div style={{opacity: dimTiles}}>
        {Array.from({length: 8}, (_, i) => (i < Math.max(n, b[1] >= 0 ? 1 : 0) ? <SessionTile key={i} i={i} f={b[1] - Math.floor((i * 50) / 8)} /> : null))}
      </div>
      <div style={{position: 'absolute', left: 120, top: 250, opacity: dimTiles}}>
        <div style={{...rise(b[1])}}>
          <Zh size={30} w={600} color={V.dim}>
            一个人通常只能同时跟进
          </Zh>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 6}}>
            <Num size={190} color={V.amber}>
              3–5
            </Num>
            <Zh size={44} w={800}>
              个活跃 Session
            </Zh>
          </div>
        </div>
        <div style={{marginTop: 50, display: 'flex', flexDirection: 'column', gap: 18}}>
          {[
            ['单任务的上限', '模型能力', V.blue],
            ['多任务的上限', '人的注意力', V.amber],
          ].map(([a, c, col], i) => (
            <div key={a} style={{display: 'flex', alignItems: 'center', gap: 18, ...rise(b[2], i * 10)}}>
              <Zh size={34} w={600} color={V.dim}>
                {a}
              </Zh>
              <Mo size={30} color={V.faint}>
                →
              </Mo>
              <Zh size={40} w={800} color={col}>
                {c}
              </Zh>
            </div>
          ))}
        </div>
      </div>
      {b[3] >= 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', ...rise(b[3], 4, 30)}}>
          <Mo size={26} color={V.comment}>
            {'$ superagent --explain'}
            <Caret h={24} color={V.comment} />
          </Mo>
          <div style={{fontFamily: '"Montserrat", "Outfit", sans-serif', fontSize: 150, fontWeight: 800, color: '#fff', letterSpacing: -4, marginTop: 20, textShadow: `0 0 50px rgba(91,124,255,0.55)`}}>
            Super-agent
          </div>
          <Zh size={40} w={600} color={V.dim} style={{marginTop: 10}}>
            设计探索：迈向更自主的 Agent 系统
          </Zh>
        </div>
      )}
    </Shell>
  );
};

// ------------------------------------------------------------------ who
export const Who: React.FC<P> = () => {
  const b = useBeats();
  return (
    <Shell file="README.md">
      <Head kicker="素材" title="这期讲的是哪篇文章" />
      <div style={{position: 'absolute', left: 120, top: 240, ...rise(b[0])}}>
        <Win w={1680} h={560} title="source/article.md" accent={V.line} bodyStyle={{padding: '30px 40px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <DeepSeekWhale size={78} />
            <div>
              <Mo size={22} color={V.dim}>
                微信公众号 · DeepSeek Harness 团队 · 原创
              </Mo>
              <div style={{marginTop: 6}}>
                <Zh size={44} w={800}>
                  Super-agent 设计探索：迈向更自主的 Agent 系统
                </Zh>
              </div>
            </div>
          </div>
          <div style={{marginTop: 40, padding: '20px 26px', borderLeft: `4px solid ${V.amber}`, background: 'rgba(227,179,65,0.08)', borderRadius: 6, ...rise(b[1])}}>
            <Lab color={V.amber}>原文开头</Lab>
            <div style={{marginTop: 10}}>
              <Zh size={32} w={600}>
                “本文是一篇面向工程实践的架构思路探讨，并非对 DeepSeek Harness 现有产品功能的介绍。”
              </Zh>
            </div>
          </div>
          <div style={{marginTop: 26, padding: '18px 26px', borderLeft: `4px solid ${V.blue}`, background: V.blueSoft, borderRadius: 6, ...rise(b[2])}}>
            <Lab color={V.blue}>第 7 节 · 初步实验</Lab>
            <div style={{marginTop: 10}}>
              <Zh size={28} w={500}>
                “由于实验基于合成负载与简化环境，部分设置还可以更加严谨，以下结果仅作为初步参考。”
              </Zh>
            </div>
          </div>
        </Win>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ why (section 1, para 1–2)
export const Why: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const up = prog(b[2], 30);
  const levels = ['底层执行', '决策', '验收'];
  return (
    <Shell file="01_super-agent.md">
      <Head kicker="1 · Super-agent" title="为什么需要它" />
      <div style={{position: 'absolute', left: 120, top: 250, width: 1060}}>
        <Win w={1060} h={420} title="过去一年" bodyStyle={{padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22}}>
          <div style={rise(b[0])}>
            <LogLine size={26} t="单任务" tag="Coding Agent" color={V.green}>
              模型能够使用工具解决复杂问题
            </LogLine>
          </div>
          <div style={rise(b[1])}>
            <LogLine size={26} t="单任务" tag="干预" color={V.green}>
              越来越少需要人类持续监控和逐步干预
            </LogLine>
          </div>
          <div style={rise(b[1], 12)}>
            <LogLine size={26} t="多任务" tag="协同" color={V.blue}>
              多 Agent 协同能力提升，跨会话的组织与调度变得可行
            </LogLine>
          </div>
          <div style={rise(b[3])}>
            <LogLine size={26} t="新形态" tag="Personal Agent" color={V.violet}>
              接入日常的消息、日程、邮件与工作平台
            </LogLine>
          </div>
          <div style={{display: 'flex', gap: 14, marginLeft: 6, ...rise(b[3], 14)}}>
            {['持续在线', '事件驱动', '软件开发场景同样有价值'].map((t) => (
              <Chip key={t} color={V.violet}>
                {t}
              </Chip>
            ))}
          </div>
        </Win>
      </div>
      {/* the human moves up */}
      <div style={{position: 'absolute', left: 1280, top: 250, width: 520, height: 520, ...rise(b[2])}}>
        <Lab color={V.dim}>人的角色</Lab>
        {levels.map((l, i) => {
          const y = 400 - i * 150;
          const active = i === 0 ? 1 - up : up;
          return (
            <div key={l} style={{position: 'absolute', left: 0, top: y, width: 520, height: 110, borderRadius: 12, border: `1.5px solid ${active > 0.5 ? V.blue : V.line}`, background: active > 0.5 ? V.blueSoft : V.panel, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Zh size={34} w={700} color={active > 0.5 ? '#fff' : V.dim}>
                {l}
              </Zh>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: -46, top: 442 - up * 300 + Math.sin(frame / 10) * 3, width: 26, height: 26, borderRadius: 13, background: V.amber, boxShadow: `0 0 16px ${V.amber}`}} />
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ limit
export const Limit: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const merge = prog(b[4], 34);
  const cur = Math.floor(Math.max(0, b[1]) / 22) % 5;
  return (
    <Shell file="01_super-agent.md">
      <Head kicker="1 · Super-agent" title="单 Session 的天花板" />
      {/* five separate sessions, the person hopping between them */}
      {Array.from({length: 5}, (_, i) => {
        const x0 = 120 + i * 340;
        const x = x0 + (790 - x0) * merge * 0.0;
        const active = b[1] >= 0 && b[4] < 0 && i === cur;
        const s = merge;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + (120 + i * 340 - x) * 0,
              top: 250 + s * 0,
              opacity: (1 - s) * prog(b[0], 12, i * 4),
              transform: `translateX(${s * (840 - (120 + i * 340))}px) scale(${1 - s * 0.4})`,
            }}
          >
            <Win w={300} h={210} title={`Session ${i + 1}`} accent={active ? V.amber : V.line}>
              <Mo size={17} color={V.faint}>
                context #{i + 1}
              </Mo>
              {[0.9, 0.6, 0.75].map((w, k) => (
                <div key={k} style={{height: 8, width: `${w * 100}%`, background: V.line, borderRadius: 4, marginTop: 14}} />
              ))}
            </Win>
          </div>
        );
      })}
      {b[1] >= 0 && b[4] < 0 && (
        <div style={{position: 'absolute', left: 120 + cur * 340 + 128, top: 476, ...rise(b[1])}}>
          <div style={{width: 44, height: 44, borderRadius: 22, background: V.amber, boxShadow: `0 0 18px ${V.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Zh size={22} w={800} color="#0B0E14">
              人
            </Zh>
          </div>
        </div>
      )}
      {/* the problems */}
      <div style={{position: 'absolute', left: 120, top: 560, display: 'flex', gap: 30, opacity: 1 - merge}}>
        {[
          ['单会话同步阻塞', b[2], 0],
          ['多任务上下文混乱', b[2], 10],
          ['本地设备离线即停止运行', b[3], 0],
        ].map(([t, f, d]) => (
          <div key={t as string} style={{width: 520, padding: '22px 26px', borderRadius: 12, border: `1.5px solid rgba(242,85,90,0.55)`, background: 'rgba(242,85,90,0.08)', display: 'flex', alignItems: 'center', gap: 16, ...rise(f as number, d as number)}}>
            <Mo size={34} color={V.red} w={800}>
              ×
            </Mo>
            <Zh size={32} w={700}>
              {t}
            </Zh>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 120, top: 700, opacity: (1 - merge) * prog(b[2], 14, 20)}}>
        <Zh size={26} w={500} color={V.dim}>
          即使借助 CLI、MCP 或外部连接器接入外部消息，仍需要大量人工维护
        </Zh>
      </div>
      {/* the continuous entity */}
      {b[4] >= 0 && (
        <div style={{position: 'absolute', left: 260, top: 330, width: 1400, ...rise(b[5])}}>
          <div style={{height: 150, borderRadius: 18, border: `2px solid ${V.blue}`, background: 'linear-gradient(90deg, rgba(91,124,255,0.22), rgba(91,124,255,0.06))', boxShadow: `0 0 40px rgba(91,124,255,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30}}>
            <Zh size={42} w={800}>
              跨会话保持上下文 · 同时推进多项复杂任务 · 互不干扰
            </Zh>
          </div>
          <div style={{marginTop: 18, display: 'flex', gap: 14}}>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={{flex: 1, height: 10, borderRadius: 5, background: V.line, overflow: 'hidden'}}>
                <div style={{height: 10, width: `${((Math.max(0, b[5]) * (0.6 + k * 0.17)) % 100)}%`, background: V.blue}} />
              </div>
            ))}
          </div>
          <div style={{marginTop: 50, textAlign: 'center', ...rise(b[6])}}>
            <Mo size={30} color={V.comment}>
              {'// 这种 Agent 形态及其系统架构 → '}
            </Mo>
            <span style={{fontFamily: '"Montserrat", sans-serif', fontSize: 64, fontWeight: 800, color: '#fff', textShadow: `0 0 30px rgba(91,124,255,0.6)`}}>Super-agent</span>
          </div>
        </div>
      )}
      <div style={{position: 'absolute', left: 120, top: 250, opacity: 0}}>{frame}</div>
    </Shell>
  );
};

// ------------------------------------------------------------------ demo 1 (figure 1, verbatim)
const DEMO1: [string, string, string, boolean][] = [
  ['IM', '用户 B', '希望正文、代码和终端的字体可以分别配置。', false],
  ['IM', '维护者', '@Super-agent 支持一下这个功能。', false],
  ['IM', 'Super-agent', 'Pull Request 已就绪：设置中拆出正文、代码、终端三行字体，各自独立配置。', true],
  ['IM', '用户 B', '字号也可以分别配置吗？', false],
  ['IM', 'Super-agent', '可以，已加进同一个 Pull Request：三类内容各有独立的字体和字号。', true],
  ['GitHub', '维护者', '设置项太多了，能否用折叠控件收起更多的外观设置？', false],
  ['GitHub', 'Super-agent', '收到，把各类字体和字号收进折叠的“更多外观设置”。', true],
  ['GitHub', '设计师', '这些本身就是字体和字号设置，可以直接作为字号设置项的展开，不必单开一个分区。', false],
  ['GitHub', 'Super-agent', '收到，去掉单独的分区，改为从“字号大小”一行直接展开。', true],
  ['IM', 'Super-agent', 'Pull Request 已合并。', true],
];
const DEMO1_BEAT = [0, 1, 1, 2, 2, 3, 3, 3, 3, 4];

export const Demo1: React.FC<P> = () => {
  const b = useBeats();
  return (
    <Shell file="01_example_1.md" status="thread · font-settings">
      <Head kicker="1 · 内部实例（原文图）" title="同一个任务，在 IM 和 GitHub 之间连续推进" />
      <div style={{position: 'absolute', left: 120, top: 222, width: 1680, display: 'flex', flexDirection: 'column', gap: 9}}>
        {DEMO1.map(([ch, who, text, agent], i) => {
          const f = b[DEMO1_BEAT[i]] - (i === 2 ? 40 : i === 4 ? 36 : 0) - (DEMO1_BEAT[i] === 3 ? (i - 5) * 22 : 0);
          return (
            <div key={i} style={rise(f, 0, 14)}>
              <ChatRow ch={<Ch c={ch} />} who={who} text={text} agent={agent} size={22} />
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ demo 2 (figure 2, verbatim)
export const Demo2: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  return (
    <Shell file="01_example_2.md" status="watching · user-group">
      <Head kicker="1 · 内部实例（原文图）" title="在公共群聊中静默监听，主动识别问题并提交修复" />
      <div style={{position: 'absolute', left: 120, top: 236, width: 1680, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={rise(b[0])}>
          <ChatRow who="群内日常消息" whoW={190} text="其他成员在群内讨论日常使用与功能建议，Super-agent 静默监听、不介入" muted size={23} />
        </div>
        <div style={rise(b[1])}>
          <ChatRow who="用户 A" whoW={190} text="在 macOS 桌面端，窗口未聚焦时点击会话会被识别为双击并进入重命名，我每天会误触发几十次。" size={23} />
        </div>
        <div style={rise(b[2])}>
          <ChatRow who="后台静默执行" whoW={190} text="无人 @ Super-agent，它识别出这是一条具体缺陷，在后台自动复现并排查代码" muted size={23} />
        </div>
        <div style={rise(b[2], 40)}>
          <ChatRow
            who="Super-agent"
            whoW={190}
            agent
            size={23}
            text={
              <>
                已修复并提交 Pull Request，附前后对比截图。根因是 Electron 默认吞掉激活窗口的那次点击，下一次点击带 <Code size={22}>detail=2</Code>，因此被识别为双击。
              </>
            }
          />
        </div>
      </div>
      {/* the two clicks */}
      <div style={{position: 'absolute', left: 330, top: 690, display: 'flex', alignItems: 'center', gap: 28}}>
        <div style={{...rise(b[3]), display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 12, border: `1.5px solid ${V.line}`, background: V.panel}}>
          <Mo size={22} color={V.dim}>
            click #1
          </Mo>
          <Zh size={24} w={600} color={V.dim} style={{textDecoration: prog(b[3], 12, 20) > 0.5 ? 'line-through' : 'none'}}>
            激活窗口（被吞掉）
          </Zh>
        </div>
        <Mo size={30} color={V.faint} style={{opacity: prog(b[4], 10)}}>
          →
        </Mo>
        <div style={{...rise(b[4]), display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 12, border: `1.5px solid ${V.red}`, background: 'rgba(242,85,90,0.08)'}}>
          <Mo size={22} color={V.ink}>
            click #2
          </Mo>
          <Code size={24}>detail=2</Code>
          <Zh size={24} w={700} color={V.red}>
            → 被识别为双击 → 重命名
          </Zh>
        </div>
        <div style={{width: 18, height: 18, borderRadius: 9, background: V.red, opacity: b[4] >= 0 ? 0.5 + 0.5 * Math.sin(frame / 5) : 0}} />
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ four traits
const TraitAnim: React.FC<{k: number; f: number}> = ({k, f}) => {
  const frame = useCurrentFrame();
  if (f < 0) return null;
  if (k === 0) {
    // one thread across IM and GitHub
    const pts: [number, number][] = [
      [30, 40],
      [330, 40],
    ];
    return (
      <div style={{position: 'relative', height: 80}}>
        <div style={{position: 'absolute', left: 0, top: 26}}>
          <Ch c="IM" size={14} />
        </div>
        <div style={{position: 'absolute', right: 0, top: 26}}>
          <Ch c="GitHub" size={14} />
        </div>
        <Wire pts={[[60, 40], [270, 40]]} color={V.blue} arrow={false} />
        <LoopPacket pts={[[60, 40], [270, 40]]} f={f} period={50} size={12} />
        <div style={{display: 'none'}}>{pts.length}</div>
      </div>
    );
  }
  if (k === 1)
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 6}}>
        {[0.9, 0.7, 1.1].map((s, i) => (
          <div key={i} style={{height: 12, borderRadius: 6, background: V.line, overflow: 'hidden'}}>
            <div style={{height: 12, width: `${((f * s * 1.3 + i * 30) % 100)}%`, background: V.green}} />
          </div>
        ))}
      </div>
    );
  if (k === 2) {
    const r = (frame % 45) / 45;
    return (
      <div style={{position: 'relative', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'absolute', width: 20 + r * 90, height: 20 + r * 90, borderRadius: 999, border: `2px solid ${V.amber}`, opacity: 1 - r}} />
        <div style={{width: 18, height: 18, borderRadius: 9, background: V.amber}} />
      </div>
    );
  }
  const pts = Array.from({length: 60}, (_, i) => {
    const x = i * 5.6;
    const ph = (i + frame) % 30;
    const y = ph === 10 ? 10 : ph === 11 ? 70 : ph === 12 ? 30 : 42;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={340} height={80}>
      <polyline points={pts} fill="none" stroke={V.red} strokeWidth={2.5} />
    </svg>
  );
};

export const Traits: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  const T = [
    ['连续', '在 IM、GitHub 评论等熟悉的界面交互，感觉始终只存在一个 Agent', V.blue],
    ['高效', '响应迅速，并行、高质量地完成多个复杂任务，无需等上一个完成', V.green],
    ['主动', '持续观察环境事件并主动推进；不需要介入时保持安静', V.amber],
    ['持久', '始终在线，接入真实工作环境，长期运行中遇到异常自动恢复', V.red],
  ] as const;
  return (
    <Shell file="01_traits.md">
      <Head kicker="1 · Super-agent" title="四个基础特征" />
      <div style={{position: 'absolute', left: 120, top: 270, display: 'flex', gap: 28}}>
        {T.map(([t, d, c], i) => (
          <div key={t} style={{width: 400, height: 520, ...pop(b[i + 1])}}>
            <div style={{height: '100%', boxSizing: 'border-box', borderRadius: 16, border: `1.5px solid ${c}`, background: V.panel, padding: '30px 30px', boxShadow: `0 0 ${b[i + 1] >= 0 && (i === 3 || b[i + 2] < 0) ? 30 : 0}px ${c}44`}}>
              <Mo size={20} color={c}>
                0{i + 1}
              </Mo>
              <div style={{marginTop: 8}}>
                <Zh size={64} w={800} color={c}>
                  {t}
                </Zh>
              </div>
              <div style={{marginTop: 20, height: 200}}>
                <Zh size={27} w={500}>
                  {d}
                </Zh>
              </div>
              <TraitAnim k={i} f={b[i + 1]} />
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ architecture (figure 3)
// Figure 3 coordinates (1040×400 original) scaled ×1.6, offset (130, 222).
const S = (x: number, y: number, w: number, h: number) => ({x: 130 + x * 1.6, y: 222 + y * 1.6, w: w * 1.6, h: h * 1.6});
const A = {
  trig: S(45, 57, 165, 72),
  filt: S(255, 57, 150, 72),
  router: S(455, 52, 280, 80),
  chan: S(808, 57, 195, 72),
  w1: S(380, 195, 195, 65),
  wn: S(590, 195, 195, 65),
  env: S(808, 195, 195, 65),
  dog: S(45, 300, 190, 65),
  db: S(330, 300, 440, 65),
};
const mid = (r: {x: number; y: number; w: number; h: number}, side: 'l' | 'r' | 't' | 'b'): [number, number] =>
  side === 'l' ? [r.x, r.y + r.h / 2] : side === 'r' ? [r.x + r.w, r.y + r.h / 2] : side === 't' ? [r.x + r.w / 2, r.y] : [r.x + r.w / 2, r.y + r.h];

export const Arch: React.FC<P> = () => {
  const b = useBeats();
  const show = prog(b[0], 20);
  const g2 = during(b[2], 0, 9999, 14);
  const g3 = during(b[3], 0, 9999, 14);
  const g4 = during(b[4], 0, 9999, 14);
  const hi = (mod: number) => (mod === 2 ? g2 * (1 - g3 * 0.7) : mod === 3 ? g3 * (1 - g4 * 0.7) : mod === 4 ? g3 * (1 - g4 * 0.7) : g4);
  const nodes: [keyof typeof A, string, string, number, boolean?][] = [
    ['trig', '[3] 环境事件 (Trigger)', '群消息 / PR / CI', 3],
    ['filt', '[3] 两级过滤', 'Fast / Slow Path', 3],
    ['router', '[2] Router 层', '共享上下文，全局路由与交互', 2],
    ['chan', '[4] 多信道交互', 'IM / GitHub / 邮件', 4],
    ['w1', '[2] Worker Session 1', '隔离上下文', 2],
    ['wn', '[2] Worker Session N', '隔离上下文', 2],
    ['env', '[5] 执行环境', '轻量 daemon 原地接入', 5, true],
    ['dog', '[6] Watchdog', '外部监控与自愈', 6],
    ['db', '[5] Session 数据库', '持久化存储所有 Session 状态', 5],
  ];
  const wires: [[number, number][], number][] = [
    [[mid(A.trig, 'r'), mid(A.filt, 'l')], 3],
    [[mid(A.filt, 'r'), mid(A.router, 'l')], 3],
    [[mid(A.router, 'r'), mid(A.chan, 'l')], 4],
    [[[A.router.x + 140, A.router.y + A.router.h], [A.router.x + 140, A.w1.y - 30], [mid(A.w1, 't')[0], A.w1.y - 30], mid(A.w1, 't')], 2],
    [[[A.router.x + 300, A.router.y + A.router.h], [A.router.x + 300, A.wn.y - 30], [mid(A.wn, 't')[0], A.wn.y - 30], mid(A.wn, 't')], 2],
    [[mid(A.wn, 'r'), mid(A.env, 'l')], 5],
    [[mid(A.w1, 'b'), [mid(A.w1, 'b')[0], A.db.y]], 5],
    [[mid(A.wn, 'b'), [mid(A.wn, 'b')[0], A.db.y]], 5],
    [[[A.router.x + 40, A.router.y + A.router.h], [A.router.x - 120, A.router.y + A.router.h + 40], [A.router.x - 120, A.db.y]], 5],
    [[mid(A.dog, 'r'), mid(A.db, 'l')], 6],
  ];
  const sub: [number, number][] = [
    [A.filt.x + 120, A.filt.y + A.filt.h],
    [A.filt.x + 120, mid(A.w1, 'l')[1]],
    mid(A.w1, 'l'),
  ];
  return (
    <Shell file="01_architecture.md">
      <Head kicker="1 · 原文图：整体系统架构" title="五个模块" sub="标号 [2]–[6] 对应原文第 2–6 节" />
      <div style={{opacity: show}}>
        {wires.map(([pts, m], i) => (
          <Wire key={i} pts={pts} p={prog(b[0], 24, 6 + i * 3)} color={hi(m) > 0.3 ? V.blue : '#4A5672'} dash={m === 6} />
        ))}
        <Wire pts={sub} p={prog(b[0], 24, 30)} color={hi(3) > 0.3 ? V.cyan : '#3B6F8F'} dash />
        <div style={{position: 'absolute', left: sub[0][0] + 14, top: sub[0][1] + 40}}>
          <Zh size={22} w={700} color={V.cyan}>
            订阅直通
          </Zh>
        </div>
        {nodes.map(([k, t, s, m, dashed]) => (
          <Node key={k} {...A[k]} title={t} sub={s} glow={hi(m)} color={m === 6 || m === 5 ? V.green : m === 3 || m === 4 ? V.cyan : V.blue} dashed={dashed} titleSize={26} />
        ))}
        <LoopPacket pts={[mid(A.trig, 'r'), mid(A.filt, 'l'), mid(A.router, 'l')]} f={b[1]} period={70} />
        <LoopPacket pts={[[A.router.x + 140, A.router.y + A.router.h], [A.router.x + 140, A.w1.y - 30], [mid(A.w1, 't')[0], A.w1.y - 30], mid(A.w1, 't')]} f={b[1]} period={70} offset={35} />
      </div>
      <SrcLine f={b[0]}>{SRC}</SrcLine>
    </Shell>
  );
};

export const _unused = {Packet, typedN, clamp01};
