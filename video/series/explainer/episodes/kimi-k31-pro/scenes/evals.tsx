// Part 3: benchmarks. Every number is from the K3.1 Pro blog's comparison table / figures (source/article.md §B–C).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Chip, clamp01, count, fmt, Head, Illus, K, lerp, Mo, Num, Panel, prog, rise, Shell, SrcLine, Top1, usePopIn, Zh} from './common';

const PART = '03 · 跑分';

// ------------------------------------------------------------------ coding: one chart, three benchmarks
const MODELS = ['Kimi K3.1 Pro', 'Claude Opus 5.5', 'GPT-6 Astra', 'Claude Fable 5.1', 'DeepSeek-V4.1-Flash-1017', 'GLM-5.3'];
const OPEN = [true, false, false, false, true, true];
const SETS = [
  {name: 'Terminal-Bench 4.0', v: [65.7, 66.4, 58.2, 57.9, 42.3, 41.8]},
  {name: 'SWE Marathon v1.1', v: [51.7, 46.3, 42.5, 45.6, 40.0, 42.5]},
  {name: 'DeepSWE v1.1', v: [75.5, 74.2, 74.1, 67.4, 77.0, 66.9]},
];

export const Coding: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  // which dataset: 0 until beat 2, morph to 1 at beat 2, to 2 at beat 3
  const m1 = prog(b[2], 22);
  const m2 = prog(b[3], 22);
  const vals = SETS[0].v.map((v0, i) => lerp(lerp(v0, SETS[1].v[i], m1), SETS[2].v[i], m2));
  const cur = m2 > 0.5 ? 2 : m1 > 0.5 ? 1 : 0;
  const best = vals.indexOf(Math.max(...vals));
  const x = 96;
  const y = 300;
  const nameW = 430;
  const plotW = 1050;
  const rowH = 76;
  const rowIn = (i: number) => (i === 0 ? b[0] - 20 : b[1] - (i - 1) * 6);
  const titleSwap = Math.min(prog(b[2], 8) * (1 - prog(b[2], 8, 10)) + prog(b[3], 8) * (1 - prog(b[3], 8, 10)), 1);
  return (
    <Shell part={PART}>
      <Head kicker="CODING" title="编程" sub="越高越好 · 思考强度 max · 闭源模型 with fallback" />
      <div style={{position: 'absolute', left: x + nameW, top: 236, opacity: 1 - titleSwap * 0.9}}>
        <Zh size={40} w={900} color={K.hero}>
          {SETS[cur].name}
        </Zh>
      </div>
      {/* grid */}
      {[0, 25, 50, 75, 100].map((t, i) => {
        const gp = prog(b[0], 14, i * 3);
        return (
          <div key={t} style={{position: 'absolute', left: x + nameW + (t / 100) * plotW, top: y - 6, width: i === 0 ? 2.5 : 1.2, height: (6 * rowH + 6) * gp, background: i === 0 ? K.dim : K.grid}}>
            <div style={{position: 'absolute', top: 6 * rowH + 14, left: -20, width: 40, textAlign: 'center', opacity: gp}}>
              <Mo size={18} color={K.faint}>
                {t}
              </Mo>
            </div>
          </div>
        );
      })}
      {MODELS.map((mname, i) => {
        const f = rowIn(i);
        const g = prog(f, 26);
        const hero = i === 0;
        const v = vals[i];
        const w = (v / 100) * plotW * g;
        return (
          <div key={mname} style={{position: 'absolute', left: x, top: y + i * rowH, height: rowH, width: 1750, opacity: prog(f, 10)}}>
            <div style={{position: 'absolute', left: 0, width: nameW - 24, height: rowH, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10}}>
              <Zh size={hero ? 30 : 25} w={hero ? 900 : 700} color={hero ? K.ink : K.dim} style={{whiteSpace: 'nowrap'}}>
                {mname}
              </Zh>
              <Mo size={14} color={OPEN[i] ? K.green : K.faint} style={{border: `1px solid ${OPEN[i] ? K.green : K.faint}`, borderRadius: 4, padding: '0 5px'}}>
                {OPEN[i] ? '开源' : '闭源'}
              </Mo>
            </div>
            <div
              style={{
                position: 'absolute',
                left: nameW,
                top: rowH * 0.18,
                height: rowH * 0.64,
                width: w,
                borderRadius: '0 6px 6px 0',
                background: hero ? `linear-gradient(90deg, ${K.hero}99, ${K.hero})` : K.grey,
                boxShadow: hero ? `0 0 26px ${K.hero}55` : undefined,
              }}
            />
            <div style={{position: 'absolute', left: nameW + w + 16, height: rowH, display: 'flex', alignItems: 'center', gap: 14}}>
              <Num size={hero ? 44 : 34} color={hero ? K.hero : K.ink} w={hero ? 900 : 700}>
                {fmt(m1 > 0 || m2 > 0 ? v : count(f, v, 26), 1)}
              </Num>
              {best === i && g > 0.9 && (
                <Mo size={18} color={K.ink} w={800} style={{border: `1.5px solid ${K.ink}`, borderRadius: 4, padding: '1px 8px'}}>
                  最高
                </Mo>
              )}
            </div>
          </div>
        );
      })}
      {/* callouts */}
      <div style={{position: 'absolute', left: 1500, top: 300, opacity: prog(b[1], 12, 30) * (1 - m1)}}>
        <Chip color={K.ink}>与 Opus 5.5 差 0.7</Chip>
      </div>
      <div style={{position: 'absolute', left: 1500, top: 300, opacity: m1 * (1 - m2)}}>
        <Top1 f={b[2] - 20} />
      </div>
      <div style={{position: 'absolute', left: 1500, top: 300, opacity: m2}}>
        <Chip color={K.ink}>比 DeepSeek 低 1.5</Chip>
      </div>
      <SrcLine f={b[0]}>来源：K3.1 Pro 官方博客评测表（Coding；Kimi 用 Claude Code harness 评测；各家分数取官方报告或排行榜）</SrcLine>
      {frame < 0 && null}
    </Shell>
  );
};

// ------------------------------------------------------------------ wins
// 47 rows in the blog's table; K3.1 Pro holds the bold top score in 16 (some rows have only a few models).
const BOLD = [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const WINS = [
  {name: 'HLE-Full w/ tools', v: 70.0, second: 'Opus 5.5 67.7', beat: 1},
  {name: 'BrowseComp', v: 92.1, second: 'GPT-6 Astra 91.5', beat: 1},
  {name: 'AutomationBench-AA', v: 73.3, second: 'Opus 5.5 69.5', beat: 2},
  {name: 'OfficeQA Pro v2', v: 64.4, second: 'Opus 5.5 62.2', beat: 2},
];

export const Wins: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  return (
    <Shell part={PART}>
      <Head kicker="AGENTIC · WHERE IT LEADS" title="拿下表内第一的几项" />
      {/* 47-row strip */}
      <div style={{position: 'absolute', left: 96, top: 236, ...rise(b[0], 0)}}>
        <div style={{display: 'flex', gap: 5}}>
          {BOLD.map((x, i) => {
            const on = x && prog(b[0], 8, 10 + i * 0.8) > 0.5;
            return <div key={i} style={{width: 31, height: 40, borderRadius: 5, background: on ? K.hero : K.grey, boxShadow: on ? `0 0 12px ${K.hero}88` : undefined, opacity: prog(b[0], 6, i * 0.5)}} />;
          })}
        </div>
        <div style={{marginTop: 10, opacity: prog(b[0], 12, 40)}}>
          <Zh size={22} w={700} color={K.dim}>
            博客评测表共 47 行，K3.1 Pro 有 <span style={{color: K.hero}}>16</span> 行是表中最高分（有些行只有部分模型参评）
          </Zh>
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, top: 380, display: 'grid', gridTemplateColumns: 'repeat(2, 846px)', gap: 26}}>
        {WINS.map((w, i) => {
          const f = b[w.beat] - (i % 2) * 14;
          return (
            <div key={w.name} style={pop(f, 0, 0.88)}>
              <Panel glow={K.hero} style={{height: 190, padding: '22px 30px', position: 'relative'}}>
                <Zh size={28} w={800} color={K.dim}>
                  {w.name}
                </Zh>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 6}}>
                  <Num size={88} color={K.hero}>
                    {fmt(count(f - 4, w.v, 28), 1)}
                  </Num>
                  <Zh size={22} w={600} color={K.faint}>
                    第二：{w.second}
                  </Zh>
                </div>
                <div style={{position: 'absolute', right: 26, top: 24}}>
                  <Top1 f={f - 28} />
                </div>
              </Panel>
            </div>
          );
        })}
      </div>
      <SrcLine f={b[0]}>来源：K3.1 Pro 官方博客评测表（Agentic；“第二”为表中次高分；思考强度 max）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ gaps (dumbbell)
const GAPS = [
  {name: 'HLE-Full（无工具）', k: 51.1, top: 59.8, who: 'Claude Opus 5.5'},
  {name: 'HLE-Diamond', k: 39.4, top: 65.8, who: 'GPT-6 Astra'},
  {name: 'ProgramBench', k: 31.5, top: 65.0, who: 'Claude Opus 5.5'},
];

export const Gaps: React.FC = () => {
  const b = useBeats();
  const x0 = 520;
  const W = 1150;
  const sx = (v: number) => x0 + (v / 80) * W * 0.92;
  return (
    <Shell part={PART}>
      <Head kicker="WHERE IT TRAILS" title="差距在哪" sub="K3.1 Pro vs 表中最高分" />
      {[0, 20, 40, 60, 80].map((t, i) => (
        <div key={t} style={{position: 'absolute', left: sx(t), top: 270, width: i === 0 ? 2.5 : 1.2, height: 560 * prog(b[0], 14, i * 3), background: i === 0 ? K.dim : K.grid}}>
          <div style={{position: 'absolute', top: 570, left: -20, width: 40, textAlign: 'center'}}>
            <Mo size={18} color={K.faint}>
              {t}
            </Mo>
          </div>
        </div>
      ))}
      {GAPS.map((g, i) => {
        const f = b[i] - (i === 0 ? 30 : 0);
        const a = prog(f, 16);
        const d = prog(f, 26, 10);
        const y = 330 + i * 170;
        const xk = sx(g.k);
        const xt = sx(g.top);
        return (
          <div key={g.name} style={{opacity: a}}>
            <div style={{position: 'absolute', left: 96, top: y - 22, width: x0 - 140, textAlign: 'right'}}>
              <Zh size={32} w={900}>
                {g.name}
              </Zh>
            </div>
            <div style={{position: 'absolute', left: xk, top: y - 3, width: (xt - xk) * d, height: 6, background: `linear-gradient(90deg, ${K.hero}, ${K.grey2})`, borderRadius: 3}} />
            <div style={{position: 'absolute', left: xk - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: K.hero, boxShadow: `0 0 20px ${K.hero}`}} />
            <div style={{position: 'absolute', left: xk - 120, top: y + 22, width: 240, textAlign: 'center'}}>
              <Num size={36} color={K.hero}>
                {fmt(count(f, g.k, 22), 1)}
              </Num>
              <Zh size={18} w={700} color={K.dim} style={{display: 'block'}}>
                K3.1 Pro
              </Zh>
            </div>
            <div style={{position: 'absolute', left: xt - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: K.ink, opacity: d}} />
            <div style={{position: 'absolute', left: xt - 140, top: y + 22, width: 280, textAlign: 'center', opacity: d}}>
              <Num size={36} color={K.ink}>
                {fmt(g.top, 1)}
              </Num>
              <Zh size={18} w={700} color={K.dim} style={{display: 'block'}}>
                {g.who}
              </Zh>
            </div>
            <div style={{position: 'absolute', left: xt + 120, top: y - 22, width: 140, opacity: prog(f, 12, 30)}}>
              <Num size={40} color={K.red}>
                −{fmt(g.top - g.k, 1)}
              </Num>
            </div>
          </div>
        );
      })}
      <SrcLine f={b[0]}>来源：K3.1 Pro 官方博客评测表（Reasoning & Knowledge：HLE-Full、HLE-Diamond；Coding：ProgramBench binary score）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ 3D: BenchCAD + walking simulator
const CAD = [
  {n: 'Claude Opus 5.5', w: 96.2, o: 73.0},
  {n: 'GPT-6 Astra', w: 95.9, o: null as number | null},
  {n: 'Kimi K3.1 Pro', w: 92.7, o: 72.8, hero: true},
  {n: 'Claude Fable 5.1', w: 92.6, o: 60.6},
  {n: 'DeepSeek-V4.1-Flash-1017', w: 81.6, o: 41.2},
];

export const Cad: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const W = 560;
  // walking: 0 -> 11.2 s
  const walk = prog(b[3], 70, 6);
  const tSec = 11.2 * walk;
  const ph = frame / 6;
  return (
    <Shell part={PART}>
      <Head kicker="3D · BENCHCAD" title="从渲染图写出 CAD" sub="多视角图 → CAD 代码 → 3D 模型" />
      <div style={{position: 'absolute', left: 96, top: 250, ...rise(b[0], 0)}}>
        <Panel style={{width: 960, height: 560, padding: '22px 30px 26px'}}>
          <div style={{display: 'flex', gap: 30, alignItems: 'center'}}>
            <Zh size={24} w={800} color={K.dim}>
              BenchCAD（1000 题子集，Voxel IoU）
            </Zh>
            <span style={{display: 'flex', gap: 16, opacity: prog(b[1], 12)}}>
              <Chip color={K.hero}>■ 带工具</Chip>
              <Chip color={K.hero2}>■ 不带工具</Chip>
            </span>
          </div>
          {CAD.map((r, i) => {
            const f1 = b[1] - i * 5;
            const f2 = b[1] - 30 - i * 5;
            return (
              <div key={r.n} style={{display: 'flex', alignItems: 'center', marginTop: 30, opacity: prog(b[1], 10, i * 5)}}>
                <div style={{width: 330, textAlign: 'right', paddingRight: 20}}>
                  <Zh size={r.hero ? 26 : 22} w={r.hero ? 900 : 700} color={r.hero ? K.ink : K.dim} style={{whiteSpace: 'nowrap'}}>
                    {r.n}
                  </Zh>
                </div>
                <div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={{width: (r.w / 100) * W * prog(f1, 24), height: 26, borderRadius: '0 4px 4px 0', background: r.hero ? K.hero : K.grey2}} />
                    <Num size={26} color={r.hero ? K.hero : K.ink}>
                      {fmt(count(f1, r.w, 24), 1)}
                    </Num>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 4}}>
                    <div style={{width: ((r.o ?? 0) / 100) * W * prog(f2, 24), height: 18, borderRadius: '0 4px 4px 0', background: r.hero ? K.hero2 : K.grey}} />
                    <Num size={18} color={r.hero ? K.hero2 : K.dim} style={{opacity: prog(f2, 10)}}>
                      {r.o == null ? '未报告' : fmt(count(f2, r.o, 24), 1)}
                    </Num>
                  </div>
                </div>
              </div>
            );
          })}
        </Panel>
      </div>
      {/* walking simulator */}
      <div style={{position: 'absolute', left: 1100, top: 250, ...pop(b[2], 0, 0.9)}}>
        <Panel glow={K.hero} style={{width: 724, height: 560, padding: '22px 30px', position: 'relative', overflow: 'hidden'}}>
          <Zh size={26} w={900}>
            内部案例 · 人体行走仿真
          </Zh>
          <div>
            <Zh size={20} w={600} color={K.dim}>
              基于 human-atlas：296 个骨骼部件、402 个肌肉部件
            </Zh>
          </div>
          <div style={{display: 'flex', gap: 40, marginTop: 18}}>
            {[
              {n: 167, l: '个任务'},
              {n: 420, l: '次独立评审'},
            ].map((s, i) => (
              <div key={s.l}>
                <Num size={56} color={K.hero}>
                  {Math.round(count(b[2] - 8 - i * 8, s.n, 26))}
                </Num>
                <Zh size={22} w={700} color={K.dim} style={{marginLeft: 8}}>
                  {s.l}
                </Zh>
              </div>
            ))}
          </div>
          {/* walker (illustrative) */}
          <svg width={660} height={210} viewBox="0 0 660 210" style={{position: 'absolute', left: 30, top: 230, overflow: 'visible'}}>
            <line x1={0} y1={180} x2={660} y2={180} stroke={K.dim} strokeWidth={2} />
            {(() => {
              const fallen = b[3] < 0 || walk < 0.02;
              const cx = 60 + walk * 480;
              if (fallen) {
                return (
                  <g opacity={0.8}>
                    <line x1={50} y1={172} x2={130} y2={168} stroke={K.grey2} strokeWidth={8} strokeLinecap="round" />
                    <circle cx={140} cy={164} r={12} fill={K.grey2} />
                    <text x={180} y={150} fill={K.dim} fontSize={20} fontFamily="Noto Sans SC" fontWeight={700}>
                      最初：几秒内摔倒
                    </text>
                  </g>
                );
              }
              const s = Math.sin(ph);
              return (
                <g>
                  <line x1={cx} y1={60} x2={cx} y2={118} stroke={K.hero} strokeWidth={10} strokeLinecap="round" />
                  <circle cx={cx} cy={38} r={18} fill={K.hero} />
                  <line x1={cx} y1={118} x2={cx + 30 * s} y2={178} stroke={K.hero} strokeWidth={9} strokeLinecap="round" />
                  <line x1={cx} y1={118} x2={cx - 30 * s} y2={178} stroke={K.hero} strokeWidth={9} strokeLinecap="round" />
                  <line x1={cx} y1={72} x2={cx - 26 * s} y2={112} stroke={K.hero} strokeWidth={8} strokeLinecap="round" />
                  <line x1={cx} y1={72} x2={cx + 26 * s} y2={112} stroke={K.hero} strokeWidth={8} strokeLinecap="round" />
                  <rect x={60} y={190} width={480 * walk} height={6} rx={3} fill={K.hero} opacity={0.5} />
                </g>
              );
            })()}
          </svg>
          <Illus style={{position: 'absolute', right: 26, top: 250}} />
          <div style={{position: 'absolute', left: 30, bottom: 26, display: 'flex', alignItems: 'baseline', gap: 16, opacity: prog(b[3], 12)}}>
            <Zh size={24} w={700} color={K.dim}>
              连续行走
            </Zh>
            <Num size={56} color={K.hero}>
              {fmt(tSec, 1)}
            </Num>
            <Zh size={24} w={700} color={K.dim}>
              秒
            </Zh>
            <div style={{marginLeft: 20, ...pop(b[3], 60, 0.6)}}>
              <Chip color={K.warn}>改正 36 处肩部肌肉力臂计算错误</Chip>
            </div>
          </div>
        </Panel>
      </div>
      <SrcLine f={b[0]}>来源：K3.1 Pro 官方博客 · 3D Modeling and Design（BenchCAD 图）· Coding（human walking dynamics simulator）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ finance + hallucination
export const Finance: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const H = 300;
  const col = (label: string, v: number, c: string, f: number, max: number, dec = 1) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 130}}>
      <Num size={38} color={c === K.hero ? K.hero : K.ink}>
        {fmt(count(f, v, 26), dec)}
      </Num>
      <div style={{width: 96, height: (v / max) * H * prog(f, 26), background: c, borderRadius: '8px 8px 0 0', marginTop: 8, boxShadow: c === K.hero ? `0 0 22px ${K.hero}55` : undefined}} />
      <div style={{marginTop: 8}}>
        <Zh size={22} w={800} color={K.dim}>
          {label}
        </Zh>
      </div>
    </div>
  );
  return (
    <Shell part={PART}>
      <Head kicker="FINANCE · FACTUALITY" title="金融与幻觉" sub="内部测试，K3.1 Pro vs K3" />
      {/* business operation */}
      <div style={{position: 'absolute', left: 96, top: 250, ...rise(b[0], 0)}}>
        <Panel style={{width: 470, height: 540, padding: '22px 28px', position: 'relative'}}>
          <Zh size={26} w={900}>
            经营模拟
          </Zh>
          <div>
            <Zh size={18} w={600} color={K.dim}>
              Business Operation · 长程经营决策
            </Zh>
          </div>
          <div style={{position: 'absolute', left: 60, bottom: 40, display: 'flex', gap: 60, alignItems: 'flex-end'}}>
            {col('K3', 8.9, K.hero2, b[0] - 6, 40)}
            {col('K3.1 Pro', 37, K.hero, b[0] - 20, 40, 0)}
          </div>
          <div style={{position: 'absolute', left: 40, top: 120, ...pop(b[0], 50, 0.5)}}>
            <Num size={60} color={K.warn}>
              ≈4.2×
            </Num>
          </div>
        </Panel>
      </div>
      {/* modeling + research */}
      <div style={{position: 'absolute', left: 600, top: 250, ...rise(b[1], 0)}}>
        <Panel style={{width: 560, height: 540, padding: '22px 28px', position: 'relative'}}>
          <Zh size={26} w={900}>
            财务建模 · 金融研究
          </Zh>
          {[
            {l: '财务建模', a: 50.4, k: 57.6, d: '+7.2'},
            {l: '金融研究', a: 58.8, k: 70.4, d: '+11.6'},
          ].map((r, i) => {
            const f = b[1] - 6 - i * 16;
            return (
              <div key={r.l} style={{marginTop: i ? 40 : 34}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <Zh size={26} w={800}>
                    {r.l}
                  </Zh>
                  <Chip color={K.green} style={{opacity: prog(f, 10, 26)}}>
                    {r.d}
                  </Chip>
                </div>
                {[
                  {n: 'K3', v: r.a, c: K.hero2},
                  {n: 'K3.1 Pro', v: r.k, c: K.hero},
                ].map((x, j) => (
                  <div key={x.n} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10}}>
                    <div style={{width: 100, textAlign: 'right'}}>
                      <Zh size={20} w={700} color={K.dim}>
                        {x.n}
                      </Zh>
                    </div>
                    <div style={{width: (x.v / 80) * 300 * prog(f, 24, j * 8), height: 30, borderRadius: '0 5px 5px 0', background: x.c}} />
                    <Num size={28} color={j ? K.hero : K.ink}>
                      {fmt(count(f - j * 8, x.v, 24), 1)}
                    </Num>
                  </div>
                ))}
              </div>
            );
          })}
        </Panel>
      </div>
      {/* hallucination */}
      <div style={{position: 'absolute', left: 1194, top: 250, ...pop(b[2], 0, 0.9)}}>
        <Panel glow={K.hero} style={{width: 630, height: 540, padding: '22px 28px', position: 'relative'}}>
          <Zh size={26} w={900}>
            断言级幻觉率
          </Zh>
          <div>
            <Zh size={18} w={600} color={K.dim}>
              Kimi Hallu Bench Hard · 带工具 · 越低越好
            </Zh>
          </div>
          <div style={{position: 'absolute', left: 90, bottom: 110, display: 'flex', gap: 90, alignItems: 'flex-end'}}>
            {col('K3', 23.4, K.hero2, b[2] - 6, 34)}
            {col('K3.1 Pro', 8.3, K.hero, b[2] - 22, 34)}
          </div>
          <div style={{position: 'absolute', right: 34, top: 120, ...pop(b[2], 50, 0.5)}}>
            <Num size={46} color={K.green}>
              ↓ 15.1
            </Num>
          </div>
          <div style={{position: 'absolute', left: 28, right: 28, bottom: 22, ...rise(b[3], 0)}}>
            <Chip color={K.warn} style={{fontSize: 19}}>
              专门找茬的压力测试，不代表日常使用的错误率
            </Chip>
          </div>
        </Panel>
      </div>
      <SrcLine f={b[0]}>来源：K3.1 Pro 官方博客 · Finance（内部金融测试图：建模 57.6/50.4、研究 70.4/58.8、经营 37/8.9）、Hallu Bench（23.4% → 8.3%）</SrcLine>
    </Shell>
  );
};

export {clamp01 as _c};
