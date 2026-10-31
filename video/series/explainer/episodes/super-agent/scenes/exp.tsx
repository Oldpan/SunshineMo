// Sections 7–9 of the article: preliminary experiments (ablation, tokens, Router batching), open questions, closing.
import React from 'react';
import {Img} from 'remotion';
import {Chip, count, DeepSeekWhale, Head, Lab, Mo, prog, rise, Shell, SRC, SrcLine, useBeats, useCurrentFrame, usePopIn, V, Win, Zh} from './common';
import type {Scene} from '@atv/lib/types';
// @ts-ignore -- png asset, bundled by Remotion's webpack config
import fig12 from './figs/fig12.png';
// @ts-ignore -- png asset, bundled by Remotion's webpack config
import fig14 from './figs/fig14.png';

type P = {scene: Scene};

/** The article's own figure, shown as-is in a window. */
const Fig: React.FC<{src: string; x: number; y: number; w: number; ratio: number; title: string; f: number}> = ({src, x, y, w, ratio, title, f}) => (
  <div style={{position: 'absolute', left: x, top: y, ...rise(f)}}>
    <Win w={w} h={Math.round((w - 4) / ratio) + 46} title={title} bodyStyle={{padding: 0, background: '#fff'}}>
      <Img src={src} style={{width: w - 3, display: 'block'}} />
    </Win>
  </div>
);

// ------------------------------------------------------------------ ablation setup
export const Ablation: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const shown = Math.round(count(b[0], 0, 300, 60));
  // ~20 of 300 are work requests: spread them deterministically
  const isReq = (i: number) => (i * 37) % 300 < 20;
  const schemes = ['Super-agent', 'Super-agent，去掉直通', '单 Session + Subagent 工具，中性提示', '单 Session + Subagent 工具，提示优先委派'];
  return (
    <Shell file="07_1_ablation.md" status="bench · 5 runs">
      <Head kicker="7.1 · 消融实验" title="群聊 + GitHub CI 消息流同时驱动" />
      <div style={{position: 'absolute', left: 120, top: 240, width: 860, ...rise(b[0])}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <Mo size={22} color={V.dim}>
            单次实验 约
          </Mo>
          <span style={{fontFamily: '"Montserrat", sans-serif', fontSize: 64, fontWeight: 800, color: '#fff'}}>{shown}</span>
          <Zh size={26} w={700}>
            条消息
          </Zh>
          <Chip color={V.blue} size={20} style={{marginLeft: 16}}>
            约 20 条工作请求
          </Chip>
        </div>
        <div style={{marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 6, width: 860}}>
          {Array.from({length: 300}, (_, i) => (
            <div key={i} style={{width: 22, height: 14, borderRadius: 3, background: isReq(i) ? V.blue : V.line, opacity: i < shown ? 1 : 0.08, boxShadow: isReq(i) && i < shown ? `0 0 8px ${V.blue}` : 'none'}} />
          ))}
        </div>
        <div style={{marginTop: 14}}>
          <Zh size={22} w={500} color={V.dim}>
            其余是闲聊、跟进、叫停和 CI 消息
          </Zh>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 700, ...rise(b[1])}}>
        <Mo size={24} color={V.comment}>
          {'def code_task(): sleep(...)  # 编码工作用只消耗时间的工具代替'}
        </Mo>
        <div style={{marginTop: 8}}>
          <Zh size={24} w={600}>
            → 衡量的是调度与协作能力，而非单个任务的执行能力
          </Zh>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1060, top: 240, width: 740, display: 'flex', flexDirection: 'column', gap: 16}}>
        {schemes.map((s, i) => (
          <div key={s} style={{padding: '16px 20px', borderRadius: 12, border: `1.5px solid ${i < 2 ? V.blue : V.violet}`, background: V.panel, ...pop(b[2], i * 8)}}>
            <Zh size={24} w={700}>
              {s}
            </Zh>
            <div style={{display: 'flex', gap: 8, marginTop: 10}}>
              {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} style={{width: 40, height: 10, borderRadius: 5, background: (Math.max(0, b[2]) - i * 8) / 10 > k ? (i < 2 ? V.blue : V.violet) : V.line}} />
              ))}
              <Mo size={16} color={V.dim} style={{marginLeft: 6}}>
                × 5 次
              </Mo>
            </div>
          </div>
        ))}
        <div style={rise(b[2], 40)}>
          <Zh size={21} w={500} color={V.amber}>
            合成负载与简化环境，结果仅作为初步参考
          </Zh>
        </div>
      </div>
      <div style={{display: 'none'}}>{frame}</div>
    </Shell>
  );
};

// ------------------------------------------------------------------ results (figures 12, 13)
const ROWS: [string, number, number, string][] = [
  ['Super-agent', 12.4, 15.7, V.blue],
  ['Super-agent，去掉直通', 12.6, 15.5, V.green],
  ['单 Session + Subagent，中性提示', 20.4, 29.5, V.red],
  ['单 Session + Subagent，提示优先委派', 13.8, 29.0, V.violet],
];
export const Result: React.FC<P> = () => {
  const b = useBeats();
  const vis = [b[0], b[0] + 20, b[1], b[2]];
  const hot = b[3] >= 0 ? 0 : b[2] >= 0 ? 3 : b[1] >= 0 ? 2 : 0;
  const S = 23; // px per minute
  return (
    <Shell file="07_1_results.md" status="bench · results">
      <Head kicker="7.1 · 原文表格与曲线" title="任务完成时间 P50 / P95（分钟）" />
      <div style={{position: 'absolute', left: 120, top: 240, width: 900}}>
        {ROWS.map(([n, p50, p95, c], i) => (
          <div key={n} style={{marginBottom: 30, opacity: hot === i ? 1 : 0.55 + 0.45 * (vis[i] < 0 ? 1 : 0.6), ...rise(vis[i])}}>
            <Zh size={24} w={700} color={hot === i ? '#fff' : V.dim}>
              {n}
            </Zh>
            <div style={{position: 'relative', height: 64, marginTop: 8}}>
              <div style={{position: 'absolute', left: 0, top: 4, height: 24, width: S * p50 * prog(vis[i], 24), background: c, borderRadius: 4}} />
              <div style={{position: 'absolute', left: 0, top: 34, height: 24, width: S * p95 * prog(vis[i], 30, 6), background: c, opacity: 0.45, borderRadius: 4}} />
              <div style={{position: 'absolute', left: S * p50 + 12, top: 0}}>
                <Mo size={22} color={V.ink}>
                  P50 {p50}
                </Mo>
              </div>
              <div style={{position: 'absolute', left: S * p95 + 12, top: 32}}>
                <Mo size={22} color={V.dim}>
                  P95 {p95}
                </Mo>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Fig src={fig12} x={1110} y={232} w={690} ratio={1009 / 822} title="原文图 · 工作请求的累计到达与完成（5 次均值）" f={b[0]} />
      <div style={{position: 'absolute', left: 120, top: 856, ...rise(b[2], 20)}}>
        <Zh size={21} w={500} color={V.dim}>
          中性提示：5 次运行 0 次调用 Subagent；提示优先委派：5 次中 4 次委派，1 次判断工作“很小”自己执行（紫色长尾）
        </Zh>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ tokens
const TOK: [string, number, string][] = [
  ['Super-agent', 2323, V.blue],
  ['Super-agent，去掉直通', 3177, V.green],
  ['单 Session + Subagent，中性提示', 605, V.red],
  ['单 Session + Subagent，提示优先委派', 1082, V.violet],
];
export const Tokens: React.FC<P> = () => {
  const b = useBeats();
  const vis = [b[0], b[1] + 10, b[0] + 20, b[0] + 30];
  const S = 0.32;
  return (
    <Shell file="07_1_tokens.md" status="bench · tokens">
      <Head kicker="7.1 · 原文表格" title="单次实验读缓存 Token（全部 Session）" />
      <div style={{position: 'absolute', left: 120, top: 250, width: 1680}}>
        {TOK.map(([n, v, c], i) => (
          <div key={n} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26, ...rise(vis[i])}}>
            <div style={{width: 520}}>
              <Zh size={26} w={700}>
                {n}
              </Zh>
            </div>
            <div style={{height: 46, width: S * v * prog(vis[i], 26), background: c, borderRadius: 6, opacity: i === 1 && b[1] < 0 ? 0.25 : 1}} />
            <Mo size={30} w={700} color={V.ink}>
              {Math.round(count(vis[i], 0, v, 26))} 万
            </Mo>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 120, top: 620, display: 'flex', gap: 24}}>
        <div style={{padding: '18px 24px', borderRadius: 12, border: `1.5px solid ${V.line}`, background: V.panel, ...rise(b[1])}}>
          <Lab>去掉直通 · 完成时间</Lab>
          <div style={{marginTop: 6}}>
            <Zh size={30} w={800}>
              12.6 / 15.5 分钟，与完整版基本一致
            </Zh>
          </div>
        </div>
        <div style={{padding: '18px 24px', borderRadius: 12, border: `1.5px solid ${V.amber}`, background: 'rgba(227,179,65,0.08)', ...rise(b[2])}}>
          <Lab color={V.amber}>去掉直通 · Router 开销</Lab>
          <div style={{marginTop: 6}}>
            <Zh size={30} w={800}>
              决定 +约 30%　·　读缓存 token +约 37%
            </Zh>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 780, ...rise(b[2], 30)}}>
        <Zh size={24} w={500} color={V.dim}>
          以更多的 token 消耗，换取更短且更稳定的完成时间；直通不提高完成质量与速度，但为 Router 节省 token 与推理开销
        </Zh>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ Router batching (figure 14)
export const Batch: React.FC<P> = () => {
  const b = useBeats();
  const tiles: [string, number, number, string, number, string][] = [
    ['平均 batch 大小', 1.0, 2.8, '条/次', b[1], V.blue],
    ['单次请求耗时', 2.5, 3.9, '秒', b[1] + 40, V.amber],
    ['单个决定的分摊推理时间', 6.4, 1.6, '秒', b[2], V.green],
  ];
  return (
    <Shell file="07_2_batching.md" status="router · load test">
      <Head kicker="7.2 · 原文图：Router 层的批处理" title="Trigger 到达速率：约 1 → 约 40 条/分钟" />
      <div style={{position: 'absolute', left: 120, top: 230, ...rise(b[0])}}>
        <Zh size={24} w={500} color={V.dim}>
          Router 调用真实模型，Worker 使用 Mock 模型
        </Zh>
      </div>
      <div style={{position: 'absolute', left: 120, top: 300, display: 'flex', gap: 24}}>
        {tiles.map(([t, a, c, u, f, col]) => (
          <div key={t} style={{width: 540, padding: '22px 28px', boxSizing: 'border-box', borderRadius: 14, border: `1.5px solid ${col}`, background: V.panel, ...rise(f)}}>
            <Zh size={26} w={700} color={V.dim}>
              {t}
            </Zh>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 8}}>
              <Mo size={34} color={V.dim}>
                {a.toFixed(1)}
              </Mo>
              <Mo size={30} color={V.faint}>
                →
              </Mo>
              <span style={{fontFamily: '"Montserrat", sans-serif', fontSize: 76, fontWeight: 800, color: col}}>{count(f - 10, a, c, 30).toFixed(1)}</span>
              <Zh size={26} w={600}>
                {u}
              </Zh>
            </div>
          </div>
        ))}
      </div>
      <Fig src={fig14} x={510} y={500} w={900} ratio={1080 / 370} title="原文图 · batch 大小与单次请求耗时 / 单个决定的分摊推理时间" f={b[1]} />
      <div style={{position: 'absolute', left: 120, top: 868, ...rise(b[3])}}>
        <Chip color={V.green} size={21}>
          目前的团队规模下，无需过早对 Router 层水平切分而牺牲全局上下文的连续性
        </Chip>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ open questions
export const Open: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  const Q: [string, string, string[]][] = [
    ['8.1', '如何扩展双层架构', ['Router 何时水平切分、粒度如何划分', 'Worker 之间何时直接通信', '跨月运行：长程记忆成为主要瓶颈']],
    ['8.2', '脱离 Session 之后如何协作', ['以聊天窗口为中心，一定程度上是路径依赖', '可在领域界面中工作，如 GitHub Issue / PR']],
    ['8.3', '上下文边界与 A2A', ['配备 Super-agent = 划分上下文共享与隔离的边界', '隔离实例之间的安全、可靠协作']],
    ['8.4', '安全与隐私', ['云端被入侵或提示注入 → 端侧设备面临被控制风险', '让 Agent 不接触凭据本身也能使用凭据']],
  ];
  return (
    <Shell file="08_open_questions.md" status="todo · 4 open">
      <Head kicker="8 · 开放问题" title="还没解决的四件事" />
      <div style={{position: 'absolute', left: 120, top: 240, width: 1680, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
        {Q.map(([n, t, items], i) => (
          <div key={n} style={{height: 290, boxSizing: 'border-box', padding: '22px 28px', borderRadius: 14, border: `1.5px solid ${V.line}`, background: V.panel, ...pop(b[i + 1])}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Mo size={22} color={V.amber}>
                [ ] {n}
              </Mo>
              <Zh size={34} w={800}>
                {t}
              </Zh>
            </div>
            <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
              {items.map((it) => (
                <Zh key={it} size={24} w={500} color={V.dim}>
                  · {it}
                </Zh>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ outro
export const Outro: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const mods = ['双层架构', '事件驱动', '异步多信道交互', '存算分离', '外部 Watchdog'];
  return (
    <Shell file="09_conclusion.md" status="router · online">
      <Head kicker="9 · 结语" title="没有新理论，只有经典的系统思想" />
      <div style={{position: 'absolute', left: 120, top: 250, display: 'flex', gap: 18}}>
        {mods.map((m, i) => (
          <div key={m} style={{padding: '18px 26px', borderRadius: 12, border: `1.5px solid ${V.blue}`, background: V.blueSoft, boxShadow: `0 0 ${12 + 8 * Math.sin(frame / 15 + i)}px rgba(91,124,255,0.35)`, ...rise(b[1], i * 8)}}>
            <Zh size={30} w={800}>
              {m}
            </Zh>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 120, top: 400, ...rise(b[2])}}>
        <Zh size={40} w={800}>
          系统在底层接管会话管理与上下文同步
        </Zh>
        <div style={{marginTop: 10}}>
          <Zh size={40} w={800} color={V.amber}>
            人上移到更高层的决策与验收
          </Zh>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 620, display: 'flex', alignItems: 'center', gap: 22, ...rise(b[3])}}>
        <DeepSeekWhale size={70} />
        <div>
          <Mo size={26} color={V.cyan}>
            dsh-superagent-prototype
          </Mo>
          <div>
            <Zh size={24} w={500} color={V.dim}>
              验证技术路线的原型，并非 DeepSeek 的正式产品
            </Zh>
          </div>
        </div>
      </div>
      <SrcLine f={b[0]}>{SRC}</SrcLine>
    </Shell>
  );
};
