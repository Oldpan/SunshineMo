// Intro: the post's teaser (Read / Fix / Improve), what weights and training are, and what the post calls
// Weight-Space Programming.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {
  Big,
  CarScene,
  Card,
  clamp01,
  count,
  D,
  during,
  FONT_MONO,
  FONT_SANS,
  GameScreen,
  Head,
  Lab,
  Mark,
  Mo,
  prog,
  rise,
  Shell,
  SrcLine,
  usePopIn,
  WeightWall,
  Zh,
} from './common';

// ------------------------------------------------------------------ cover / teaser
const Panel: React.FC<{
  x: number;
  step: string;
  task: string;
  on: number; // 0..1 how active
  shown: number;
  vis: React.ReactNode;
  astra: string;
  out: React.ReactNode;
  outOn: number;
}> = ({x, step, task, on, shown, vis, astra, out, outOn}) => (
  <div style={{position: 'absolute', left: x, top: 214, width: 552, opacity: shown * (0.42 + 0.58 * on), transform: `translateY(${(1 - shown) * 30}px)`}}>
    <Card style={{height: 650, padding: '22px 26px', borderColor: on > 0.5 ? D.green : D.border, borderWidth: 2.5}}>
      <Lab size={22} color={D.ink2}>
        {step}
      </Lab>
      <div style={{marginTop: 14, border: `2px solid ${D.border}`, borderRadius: 22, padding: '16px 20px', minHeight: 92, position: 'relative'}}>
        <Zh size={27} w={600}>
          {task}
        </Zh>
        <div style={{position: 'absolute', right: 14, bottom: 12, width: 36, height: 36, borderRadius: 18, background: D.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={18} height={18} viewBox="0 0 20 20">
            <path d="M10 16 V4 M4 10 L10 4 L16 10" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{marginTop: 18, height: 236, border: `1.5px solid ${D.hair}`, background: D.panel, borderRadius: 6, overflow: 'hidden', position: 'relative'}}>{vis}</div>
      <div style={{marginTop: 18, minHeight: 72}}>
        <Zh size={25} w={700} color={D.green}>
          {astra}
        </Zh>
      </div>
      <div style={{marginTop: 8, opacity: outOn, transform: `translateY(${(1 - outOn) * 12}px)`}}>{out}</div>
    </Card>
  </div>
);

export const Cover: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const hero = 1 - prog(b[3], 14);
  const teaser = prog(b[3], 18);
  const bar = count(b[6], 7.9, 48.1, 48, 8);
  const max = 62;
  return (
    <Shell>
      {/* hero: the hook numbers, who did it, the post */}
      {hero > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: hero}}>
          <div style={{position: 'absolute', left: 120, top: 170, display: 'flex', gap: 60, alignItems: 'stretch'}}>
            <div style={{...pop(b[0], 0)}}>
              <Card style={{width: 760, height: 300, padding: '34px 40px'}}>
                <Zh size={30} w={600} color={D.dim}>
                  只改了这么多权重
                </Zh>
                <div style={{marginTop: 18}}>
                  <Big size={150} color={D.green}>
                    0.016%
                  </Big>
                </div>
              </Card>
            </div>
            <div style={{...pop(b[0], 14)}}>
              <Card style={{width: 860, height: 300, padding: '34px 40px'}}>
                <Zh size={30} w={600} color={D.dim}>
                  Qwen3.5-0.8B · MATH-500 正确率
                </Zh>
                <div style={{marginTop: 26, display: 'flex', alignItems: 'baseline', gap: 26}}>
                  <Big size={96} color={D.faint}>
                    7.9%
                  </Big>
                  <svg width={90} height={40}>
                    <path d="M4 20 H80 M64 6 L82 20 L64 34" stroke={D.green} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <Big size={130} color={D.green}>
                    {count(b[0], 7.9, 48.1, 40, 22).toFixed(1)}%
                  </Big>
                </div>
              </Card>
            </div>
          </div>
          <div style={{position: 'absolute', left: 120, top: 520, display: 'flex', alignItems: 'center', gap: 22, ...rise(b[1], 0)}}>
            <div style={{background: D.ink, borderRadius: 999, padding: '12px 30px'}}>
              <Zh size={32} w={700} color="#fff">
                GPT-6 Astra
              </Zh>
            </div>
            <svg width={120} height={40}>
              <path d="M4 20 H108 M92 6 L110 20 L92 34" stroke={D.ink} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{border: `2px solid ${D.border}`, borderRadius: 14, padding: '10px 22px', background: '#fff'}}>
              <Mo size={26} color={D.dim}>
                W1 row 405 -0.289 -0.347 <span style={{background: D.mark, color: D.greenDark, fontWeight: 700}}>0.481</span> …
              </Mo>
            </div>
            <Zh size={30} w={600} color={D.dim} style={{marginLeft: 10}}>
              直接改数字，<span style={{textDecoration: 'line-through', textDecorationColor: D.red, textDecorationThickness: 3}}>不训练</span>
            </Zh>
          </div>
          {/* the post's masthead */}
          <div style={{position: 'absolute', left: 120, top: 640, width: 1680, ...rise(b[2], 0, 30)}}>
            <div style={{background: '#EEF6F1', border: `2px solid #DDE9E2`, borderRadius: 22, padding: '26px 40px'}}>
              <Zh size={30} w={300} color={D.dim}>
                Sparks of Weight-Space Programming:
              </Zh>
              <div style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: 60, color: D.ink, lineHeight: 1.1, marginTop: 4}}>LLMs can natively read &amp; write neural network weights</div>
              <div style={{marginTop: 14, display: 'flex', gap: 30, alignItems: 'baseline'}}>
                <Zh size={24} w={500} color={D.green}>
                  Rikiya Takehi*, Jayden Teoh*, Alex Zhang, Omar Khattab
                </Zh>
                <Zh size={24} w={600} color={D.ink2}>
                  MIT CSAIL · 2026-11-02
                </Zh>
                <Mark p={prog(b[2], 18, 24)} size={26}>
                  权重空间编程
                </Mark>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* the teaser: three panels */}
      {teaser > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: teaser}}>
          <Panel
            x={96}
            step="Read · 读"
            task="这个网络是练哪个游戏的？"
            shown={prog(b[3], 16, 0)}
            on={prog(b[4], 12)}
            vis={
              <div style={{padding: '6px 14px'}}>
                <WeightWall w={500} h={224} size={17} scroll={Math.max(0, b[3]) * 0.9} n={7} cols={7} />
              </div>
            }
            astra="Astra 读了 17,253 个权重，不用任何工具"
            outOn={prog(b[4], 14, 20)}
            out={
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <GameScreen game="breakout" t={b[4]} size={76} />
                <div>
                  <Big size={54}>Breakout</Big>
                  <div>
                    <Zh size={22} w={600} color={D.dim}>
                      99% 把握
                    </Zh>
                  </div>
                </div>
              </div>
            }
          />
          <Panel
            x={684}
            step="Fix · 修"
            task="训练好的策略，从没让小车越过红条。"
            shown={prog(b[3], 16, 6)}
            on={prog(b[5], 12)}
            vis={
              <div style={{position: 'absolute', left: 6, top: 52}}>
                <CarScene t={b[5] > 0 ? b[5] : 0} w={496} ppo={b[5] > 0 ? 0 : 1} astra={b[5] > 0 ? 1 : 0} />
              </div>
            }
            astra="Astra 一次改了 3.5% 的权重"
            outOn={prog(b[5], 14, 30)}
            out={
              <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                <Big size={64}>100%</Big>
                <Zh size={24} w={600} color={D.dim}>
                  成功，原来是 0%
                </Zh>
              </div>
            }
          />
          <Panel
            x={1272}
            step="Improve · 改"
            task="让 Qwen3.5-0.8B 的数学更好。"
            shown={prog(b[3], 16, 12)}
            on={prog(b[6], 12)}
            vis={
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, height: 190, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 80}}>
                {[
                  ['原模型', 7.9, D.faint],
                  ['Astra 改后', b[6] > 0 ? bar : 7.9, D.green],
                ].map(([l, v, c]) => (
                  <div key={l as string} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 110}}>
                    <Zh size={22} w={700}>
                      {(v as number).toFixed(1)}%
                    </Zh>
                    <div style={{width: 96, height: ((v as number) / max) * 150, background: c as string}} />
                    <div style={{position: 'absolute', bottom: -30}}>
                      <Zh size={19} w={600} color={D.dim}>
                        {l}
                      </Zh>
                    </div>
                  </div>
                ))}
              </div>
            }
            astra="Astra 在 Python 环境里改权重，不训练"
            outOn={prog(b[6], 14, 30)}
            out={
              <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                <Big size={64}>48.1%</Big>
                <Zh size={24} w={600} color={D.dim}>
                  MATH-500，原来 7.9%
                </Zh>
              </div>
            }
          />
          <SrcLine f={b[3]}>原文开头的三联图（Read / Fix / Improve），按原文数据重绘，文字为中译</SrcLine>
        </div>
      )}
    </Shell>
  );
};

// ------------------------------------------------------------------ what weights are
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const LAYERS = [4, 6, 6, 3];
const NX = [220, 600, 980, 1360];
const ny = (l: number, j: number) => 560 + (j - (LAYERS[l] - 1) / 2) * 100;

export const Weights: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const draw = prog(b[1], 30);
  const nums = prog(b[2], 18);
  const train = b[3] > 0;
  const tick = b[4] > 0 ? Math.floor(b[4] / 3) + (b[5] > 0 ? Math.floor(b[5] * 2) : 0) : 0;
  const unread = prog(b[6], 18);
  const edges: {l: number; i: number; j: number; k: number}[] = [];
  let k = 0;
  for (let l = 0; l < LAYERS.length - 1; l++) for (let i = 0; i < LAYERS[l]; i++) for (let j = 0; j < LAYERS[l + 1]; j++) edges.push({l, i, j, k: k++});
  const wv = (e: number) => {
    const base = (hash(e) - 0.5) * 2;
    const drift = tick ? (hash(e * 7 + tick) - 0.5) * 0.02 * Math.min(tick, 60) * 0.05 : 0;
    return base + drift;
  };
  const labeled = [3, 17, 28, 40, 52, 63, 70, 76];
  return (
    <Shell part="先补一点基础">
      <Head kicker="基础 · 权重是什么" title="神经网络里，其实就是一堆数字" />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - unread * 0.75}}>
        {edges.map((e) => {
          const x1 = NX[e.l] + 30, y1 = ny(e.l, e.i), x2 = NX[e.l + 1] - 30, y2 = ny(e.l + 1, e.j);
          const v = wv(e.k);
          const len = Math.hypot(x2 - x1, y2 - y1);
          const show = clamp01(draw * 3 - e.l);
          const pulse = train ? 0.5 + 0.5 * Math.sin(frame * 0.25 - e.l * 1.4 + e.i) : 0;
          return (
            <line
              key={e.k}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={v > 0 ? D.green : D.red}
              strokeOpacity={0.18 + Math.abs(v) * 0.35 + pulse * 0.15}
              strokeWidth={1 + Math.abs(v) * 2.4}
              strokeDasharray={`${len} ${len}`}
              strokeDashoffset={len * (1 - show)}
            />
          );
        })}
        {LAYERS.map((n, l) =>
          Array.from({length: n}, (_, j) => (
            <circle key={`${l}-${j}`} cx={NX[l]} cy={ny(l, j)} r={30} fill="#fff" stroke={D.ink2} strokeWidth={3} opacity={clamp01(draw * 3 - l + 0.6)} />
          )),
        )}
      </svg>
      {labeled.map((ei, i) => {
        const e = edges[ei];
        const x = (NX[e.l] + NX[e.l + 1]) / 2 + (e.j - e.i) * 6;
        const y = (ny(e.l, e.i) + ny(e.l + 1, e.j)) / 2 - 16;
        const v = wv(ei);
        return (
          <div key={ei} style={{position: 'absolute', left: x - 44, top: y, width: 88, textAlign: 'center', opacity: prog(b[2], 10, i * 3) * (1 - unread * 0.75)}}>
            <span style={{fontFamily: FONT_MONO, fontSize: 21, fontWeight: 700, color: v > 0 ? D.greenDark : D.redDark, background: '#fff', padding: '0 4px', border: `1.5px solid ${D.hair}`, borderRadius: 6}}>
              {v.toFixed(3)}
            </span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 160, top: 236, opacity: nums * (1 - unread)}}>
        <Zh size={30} w={700} color={D.green}>
          每根线上的数字 = 一个权重
        </Zh>
      </div>
      {/* training loop */}
      <div style={{position: 'absolute', left: 1480, top: 300, width: 380, ...rise(b[3], 0)}}>
        <Card style={{padding: '20px 22px', opacity: 1 - unread}}>
          <Zh size={30} w={800}>
            训练
          </Zh>
          {[
            ['① 喂数据', b[3], 0],
            ['② 看错了多少', b[3], 30],
            ['③ 顺着梯度挪一点', b[4], 0],
          ].map(([t, f, d]) => (
            <div key={t as string} style={{marginTop: 10, ...rise(f as number, d as number, 8)}}>
              <Zh size={27} w={600} color={D.ink2}>
                {t}
              </Zh>
            </div>
          ))}
          <div style={{marginTop: 16, ...rise(b[5], 0, 8)}}>
            <Zh size={22} w={600} color={D.dim}>
              重复
            </Zh>
            <Big size={42} color={D.green} style={{marginLeft: 8}}>
              {b[5] > 0 ? Math.floor(count(b[5], 1, 1_000_000_000, 60)).toLocaleString('en-US') : '1'}
            </Big>
            <Zh size={22} w={600} color={D.dim}>
              {' '}
              次
            </Zh>
          </div>
        </Card>
      </div>
      {/* nobody can read them */}
      {unread > 0.01 && (
        <div style={{position: 'absolute', left: 240, top: 300, width: 1440, opacity: unread}}>
          <Card style={{padding: '24px 30px', height: 420}}>
            <div style={{fontFamily: FONT_MONO, fontSize: 17, color: D.faint2, lineHeight: 1.6, wordBreak: 'break-all', height: 300, overflow: 'hidden'}}>
              {Array.from({length: 260}, (_, i) => ((hash(i + 900) - 0.5) * 4).toFixed(3)).join('  ')}
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center'}}>
              <Zh size={40} w={800}>
                没人亲手写过，训练完也基本没人读得懂
              </Zh>
            </div>
          </Card>
        </div>
      )}
    </Shell>
  );
};

// ------------------------------------------------------------------ what Weight-Space Programming is
const Stage: React.FC<{x: number; f: number; title: string; sub: string; locked?: boolean; open?: number}> = ({x, f, title, sub, locked, open = 0}) => (
  <div style={{position: 'absolute', left: x, top: 290, width: 380, ...rise(f, 0)}}>
    <Card style={{height: 280, padding: '30px 28px', borderColor: locked ? (open > 0.5 ? D.green : D.border) : D.border, background: locked && open < 0.5 ? D.panel : '#fff'}}>
      <Zh size={36} w={800} color={locked && open < 0.5 ? D.faint : D.ink}>
        {title}
      </Zh>
      <div style={{marginTop: 12}}>
        <Zh size={23} w={500} color={D.dim}>
          {sub}
        </Zh>
      </div>
      {locked && (
        <div style={{position: 'absolute', right: 22, top: 22}}>
          <svg width={46} height={52} viewBox="0 0 46 52">
            <path d={`M12 24 V14 a11 11 0 0 1 22 0 ${open > 0.5 ? 'V8' : 'V24'}`} stroke={open > 0.5 ? D.green : D.faint} strokeWidth={5} fill="none" transform={open > 0.5 ? 'translate(8 -6)' : undefined} />
            <rect x={5} y={24} width={36} height={26} rx={5} fill={open > 0.5 ? D.green : D.faint} />
          </svg>
        </div>
      )}
    </Card>
  </div>
);

export const Whatis: React.FC = () => {
  const b = useBeats();
  const p1 = 1 - prog(b[4], 14);
  const p2 = prog(b[4], 14) * (1 - prog(b[6], 14));
  const p3 = prog(b[6], 16);
  const xs = [96, 536, 976, 1430];
  return (
    <Shell part="权重空间编程">
      <Head kicker="Weight-Space Programming" title="让大模型直接读写权重" />
      {p1 > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: p1}}>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${xs[i] + 384} 430 H ${xs[i + 1] - 8}`} stroke={D.axis} strokeWidth={3} strokeDasharray="8 8" opacity={prog(i < 2 ? b[1] : b[2], 12, 8)} />
            ))}
          </svg>
          <Stage x={xs[0]} f={b[0]} title="提示词" sub="大模型帮你改写、优化" />
          <Stage x={xs[1]} f={b[1]} title="程序 / harness" sub="围绕提示词写的程序" />
          <Stage x={xs[2]} f={b[1] - 20} title="训练代码、超参数" sub="让大模型去调" />
          <Stage x={xs[3]} f={b[2]} title="权重" sub={b[3] > 0 ? '界线开始松动' : '人改不了，交给 Adam 这类优化器'} locked open={prog(b[3], 12)} />
          <div style={{position: 'absolute', left: 96, top: 650, width: 1728, ...rise(b[2], 20)}}>
            <Card tint={D.panel} style={{padding: '24px 32px'}}>
              <Zh size={28} w={600} color={D.ink2}>
                前三样都是文字和代码，人自己也能手改，所以交给大模型很自然；权重人改不了，一直交给优化算法。
              </Zh>
            </Card>
          </div>
        </div>
      )}
      {p2 > 0.01 && (
        <div style={{position: 'absolute', left: 96, top: 250, width: 1728, opacity: p2}}>
          <Card style={{padding: '36px 44px', borderColor: D.green}}>
            <Lab size={22}>定义</Lab>
            <div style={{marginTop: 10}}>
              <Zh size={46} w={800}>
                一个<Mark p={prog(b[4], 16, 10)}>通用大模型</Mark>，直接读、直接写网络的权重
              </Zh>
            </div>
            <div style={{marginTop: 30, display: 'flex', gap: 22, flexWrap: 'wrap'}}>
              {['不经过优化器', '不用梯度下降', '有时连环境反馈都没有'].map((t, i) => (
                <div key={t} style={{...rise(b[5], i * 8), border: `2px solid ${D.border}`, borderRadius: 999, padding: '10px 26px', display: 'flex', gap: 10, alignItems: 'center'}}>
                  <span style={{color: D.red, fontWeight: 800, fontSize: 30, fontFamily: FONT_SANS}}>✕</span>
                  <Zh size={30} w={600}>
                    {t}
                  </Zh>
                </div>
              ))}
              <div style={{...rise(b[5], 34), background: D.mark, borderRadius: 999, padding: '10px 26px'}}>
                <Zh size={30} w={700} color={D.greenDark}>
                  只给一段自然语言的要求
                </Zh>
              </div>
            </div>
          </Card>
        </div>
      )}
      {p3 > 0.01 && (
        <div style={{position: 'absolute', left: 96, top: 250, width: 1728, display: 'flex', gap: 40, opacity: p3}}>
          {[
            ['读权重', '认出网络学了什么', ['实验 1 · 哪个游戏', '实验 2 · 扩散模型画什么', '实验 3 · 只看中间层', '实验 7 · 谁在讨好用户']],
            ['修权重', '找到毛病，改掉', ['实验 4 · 卡在坡上的小车', '实验 8 · Qwen3.5-0.8B 的数学']],
            ['从零写权重', '权重全是 0，自己写', ['实验 5 · 三个 MinAtar 游戏', '实验 6 · 9 路围棋']],
          ].map(([t, s, items], i) => (
            <div key={t as string} style={{flex: 1, ...rise(b[7], i * 10)}}>
              <Card style={{height: 560, padding: '30px 32px'}}>
                <Zh size={44} w={800} color={D.green}>
                  {t}
                </Zh>
                <div style={{marginTop: 6}}>
                  <Zh size={24} w={500} color={D.dim}>
                    {s}
                  </Zh>
                </div>
                <div style={{marginTop: 26}}>
                  {(items as string[]).map((it, j) => (
                    <div key={it} style={{marginTop: 16, padding: '12px 18px', background: D.panel, borderRadius: 12, ...rise(b[7], i * 10 + 14 + j * 6, 8)}}>
                      <Zh size={26} w={600}>
                        {it}
                      </Zh>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
      {p3 > 0.01 && <SrcLine f={b[6]}>实验模型均为 GPT-6 Astra；分组照原文“LLMs can read / fix / write neural network weights”</SrcLine>}
    </Shell>
  );
};
