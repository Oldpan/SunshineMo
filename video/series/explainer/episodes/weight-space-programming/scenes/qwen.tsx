// Experiment 8 (Qwen3.5-0.8B math by editing weights): setup, the reasoning-loop diagnosis, the post's 50-pass edit
// replay, the results table and the eight-benchmark chart; then the Gemma 3 270M control.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {
  Big,
  Card,
  clamp01,
  count,
  D,
  FONT_MONO,
  FONT_SANS,
  Head,
  Illus,
  Lab,
  lerp,
  Mark,
  Mo,
  prog,
  Prompt,
  rise,
  Setup,
  Shell,
  SrcLine,
  Table,
  Zh,
} from './common';
import qwen from './data/qwen.json';

type Turn = {turn: number; used: number; after: number; kind: string; edit: boolean; hyp?: string; pass?: {number?: number; type?: string; model?: string; items?: number; original?: number; edited?: number; cut?: number; cut_original?: number; cut_edited?: number; failed?: boolean}};
const Q = qwen as {turns: Turn[]; bench: {name: string; group: string; scores: number[]}[]};

// ------------------------------------------------------------------ setup
export const Qwen: React.FC = () => {
  const b = useBeats();
  return (
    <Shell part="改真实的语言模型">
      <Head kicker="Experiment 8 · 实验 8" title="改权重，让 Qwen3.5-0.8B 数学变好" />
      <div style={{position: 'absolute', left: 96, top: 214}}>
        <Setup
          f={b[1]}
          w={860}
          step={10}
          rows={[
            ['模型', 'Qwen3.5-0.8B，开思考模式，24 层，8 亿个权重'],
            ['环境', '加载好权重的 Python 环境（像 notebook），没有 GPU'],
            ['练习题', 'GSM8K 7,469 道 + MATH 7,275 道（训练集，不是测试集）'],
            ['前向', '一次：最多答 512 道题，或读 1,024 段文本'],
            ['评测', 'MATH-500、GSM8K 等 8 项，Astra 从没见过'],
          ]}
        />
      </div>
      <div style={{position: 'absolute', left: 1000, top: 214, ...rise(b[0], 0)}}>
        <Prompt f={b[0]} w={824} file="模型的 8 亿个权重，在 Python 环境里" question="直接改权重，让 Qwen3.5-0.8B 的数学变好。" rule="不训练。模型只能通过前向工具运行。" cps={18} />
      </div>
      <div style={{position: 'absolute', left: 1000, top: 560, width: 824, ...rise(b[2], 0)}}>
        <Card style={{padding: '22px 28px'}}>
          <Zh size={26} w={700}>
            前向次数预算
          </Zh>
          <div style={{display: 'flex', gap: 18, marginTop: 14}}>
            {['10 次', '25 次', '50 次'].map((t, i) => (
              <div key={t} style={{flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 12, background: D.panel, ...rise(b[2], 10 + i * 8, 8)}}>
                <Zh size={30} w={800}>
                  {t}
                </Zh>
              </div>
            ))}
          </div>
          <div style={{display: 'flex', gap: 18, marginTop: 20, ...rise(b[3], 0, 8)}}>
            {['不许训练', '不许用梯度'].map((t) => (
              <div key={t} style={{border: `2px solid ${D.border}`, borderRadius: 999, padding: '6px 20px'}}>
                <Zh size={26} w={700}>
                  <span style={{color: D.red}}>✕ </span>
                  {t}
                </Zh>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ the loops
export const Loops: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const tokens = b[1] > 0 ? Math.min(32768, Math.round(count(b[1], 0, 32768, 110))) : 0;
  const lines = b[1] > 0 ? Math.min(9, 2 + Math.floor(b[1] / 12)) : 2;
  const grid = prog(b[2], 40);
  const stack = prog(b[3], 16);
  const cols = prog(b[5], 40);
  return (
    <Shell part="改真实的语言模型">
      <Head kicker="Experiment 8 · 诊断" title="毛病不在数学，在“打转”" />
      {/* the loop */}
      <div style={{position: 'absolute', left: 96, top: 214, width: 900, ...rise(b[0], 0)}}>
        <Card style={{padding: '18px 24px', height: 330}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <Zh size={22} w={700} color={D.dim}>
              模型的思考过程 <Illus />
            </Zh>
            <Mo size={22} color={tokens >= 32768 ? D.red : D.dim} w={700}>
              {tokens.toLocaleString('en-US')} / 32,768 token
            </Mo>
          </div>
          <div style={{marginTop: 10, height: 210, overflow: 'hidden', position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
              {Array.from({length: lines}, (_, i) => (
                <div key={i} style={{fontFamily: FONT_SANS, fontSize: 24, color: i < 1 ? D.ink2 : D.redDark, opacity: i < 1 ? 1 : 0.55 + 0.45 * ((i % 2) as number), lineHeight: 1.5}}>
                  {i === 0 ? '先算出每一项，再把它们加起来……' : '等一下，再检查一遍：先算出每一项，再把它们加起来……'}
                </div>
              ))}
            </div>
          </div>
          {tokens >= 32768 && (
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 54, background: '#FDECEE', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Zh size={24} w={800} color={D.redDark}>
                写到上限被截断，没给出答案
              </Zh>
            </div>
          )}
        </Card>
      </div>
      <div style={{position: 'absolute', left: 96, top: 568, width: 900, ...rise(b[2], 0)}}>
        <Card style={{padding: '18px 24px', height: 320}}>
          <Zh size={24} w={700}>
            最初 96 道练习题
          </Zh>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(24, 28px)', gap: 6, marginTop: 14}}>
            {Array.from({length: 96}, (_, i) => {
              const cut = i < 85;
              const on = grid * 96 > i;
              return <div key={i} style={{width: 28, height: 28, borderRadius: 4, background: !on ? D.hair : cut ? D.red : D.green}} />;
            })}
          </div>
          <div style={{marginTop: 18, display: 'flex', gap: 30, opacity: prog(b[2], 12, 40)}}>
            <Zh size={24} w={700} color={D.redDark}>
              ■ 85 道写到上限
            </Zh>
            <Zh size={24} w={700} color={D.green}>
              ■ 11 道写完了
            </Zh>
            <Zh size={20} w={500} color={D.dim}>
              Qwen 的模型说明也提醒过会陷入思考循环
            </Zh>
          </div>
        </Card>
      </div>
      {/* where: layers 15 and 19 */}
      <div style={{position: 'absolute', left: 1040, top: 214, width: 784, opacity: stack}}>
        <Card style={{padding: '18px 24px', height: 674}}>
          <Zh size={24} w={700}>
            24 层，每层 = 注意力 + MLP
          </Zh>
          <div style={{display: 'flex', gap: 26, marginTop: 12}}>
            <div style={{display: 'flex', flexDirection: 'column-reverse', gap: 3}}>
              {Array.from({length: 24}, (_, l) => {
                const hot = l === 15 || l === 19;
                return (
                  <div key={l} style={{display: 'flex', gap: 4, alignItems: 'center'}}>
                    <Mo size={13} color={hot ? D.green : D.faint} style={{width: 22, textAlign: 'right'}}>
                      {l}
                    </Mo>
                    <div style={{width: 70, height: 19, background: D.hair, borderRadius: 3}} />
                    <div style={{width: 90, height: 19, borderRadius: 3, background: hot && b[3] > 0 ? D.green : '#D5D9DF', opacity: hot ? 0.5 + 0.5 * prog(b[3], 12, 10) : 1}} />
                  </div>
                );
              })}
            </div>
            <div style={{flex: 1}}>
              <div style={{...rise(b[3], 16)}}>
                <Zh size={25} w={700}>
                  第 15、19 层的 MLP 写出一个“方向”，推着模型打转
                </Zh>
              </div>
              <div style={{marginTop: 16, ...rise(b[4], 0)}}>
                <Card tint={D.panel} style={{padding: '12px 16px'}}>
                  <Zh size={22} w={500}>
                    MLP：每层里加工信息的那部分全连接网络
                  </Zh>
                </Card>
              </div>
              <div style={{marginTop: 18, ...rise(b[5], 0)}}>
                <Zh size={22} w={700}>
                  每层输出里取 64 列，减掉这个方向
                </Zh>
                <svg width={380} height={150} style={{marginTop: 8}}>
                  {Array.from({length: 40}, (_, c) => (
                    <rect key={c} x={c * 9.5} y={0} width={8} height={120} fill={c < 10 ? `rgba(17,134,89,${0.2 + 0.8 * cols})` : D.hair} />
                  ))}
                  <text x={0} y={145} fontFamily={FONT_MONO} fontSize={16} fill={D.dim}>
                    W' = W − (方向) ……（64 列 × 2 层）
                  </text>
                </svg>
              </div>
              <div style={{marginTop: 4, ...rise(b[6], 0)}}>
                <Big size={50} color={D.green}>
                  {Math.round(count(b[6], 0, 131072, 40)).toLocaleString('en-US')}
                </Big>
                <Zh size={22} w={600} color={D.dim}>
                  {' '}
                  个权重
                </Zh>
                <div>
                  <Zh size={24} w={700}>
                    占全部 8 亿的 <Mark p={prog(b[6], 14, 30)}>0.016%</Mark>
                  </Zh>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <SrcLine f={b[2]}>85 / 96 来自原文；循环文字是示意；“减掉方向”是原文对这次修改的描述，公式为示意写法</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ the 50-pass replay (the post's trajectory figure)
const STOP = Q.turns.findIndex((t) => t.pass?.number === 4 && t.pass?.edited !== undefined);
export const Replay: React.FC = () => {
  const b = useBeats();
  const n = Q.turns.length;
  // playhead: 0 -> pass 4 during beats 0-1, hold on beat 2, then on to the end on beat 3
  let k: number;
  if (b[2] < 0) k = Math.floor(lerp(0, STOP, clamp01(Math.max(0, b[0]) / Math.max(1, b[0] - b[2]))));
  else if (b[3] < 0) k = STOP;
  else k = Math.floor(lerp(STOP, n - 1, clamp01(b[3] / 150)));
  const w = 1200,
    h = 560,
    L = 70,
    R = 30,
    T = 20,
    B = 70;
  const X = (u: number) => L + (u / 50) * (w - L - R);
  const Y = (v: number) => T + (1 - (v + 10) / 90) * (h - T - B);
  const shown = Q.turns.slice(0, k + 1);
  const gen = shown.filter((t) => t.pass && t.pass.type === 'generate' && t.pass.original !== undefined);
  const edits = shown.filter((t) => t.edit);
  const cur = Q.turns[k];
  const lastPass = [...shown].reverse().find((t) => t.pass && t.pass.original !== undefined);
  // beat 1 narrates turn 3 ("85/96 cut off, every completed answer correct"), so pin that hypothesis there
  const lastHyp = b[1] >= 0 && b[2] < 0 ? Q.turns.find((t) => t.turn === 3) : [...shown].reverse().find((t) => t.hyp);
  return (
    <Shell part="改真实的语言模型">
      <Head kicker="Experiment 8 · 回放" title="50 次前向，Astra 一步步怎么改的" />
      <div style={{position: 'absolute', left: 96, top: 210, ...rise(b[0], 0)}}>
        <Card style={{padding: '16px 20px'}}>
          <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
            <Zh size={22} w={700}>
              第 {cur.turn} / {n} 轮 · 已用 {cur.after} / 50 次前向
            </Zh>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <div style={{width: 26, height: 4, background: D.green}} />
              <Zh size={19} w={500} color={D.dim}>
                改过的权重
              </Zh>
              <div style={{width: 26, height: 4, background: D.faint, marginLeft: 12}} />
              <Zh size={19} w={500} color={D.dim}>
                原模型
              </Zh>
              <div style={{width: 3, height: 18, background: D.red, marginLeft: 12}} />
              <Zh size={19} w={500} color={D.dim}>
                改了权重
              </Zh>
            </div>
          </div>
          <svg width={w} height={h}>
            {[0, 20, 40, 60, 80].map((v) => (
              <g key={v}>
                <line x1={L} x2={w - R} y1={Y(v)} y2={Y(v)} stroke={D.hair} />
                <text x={L - 10} y={Y(v) + 6} textAnchor="end" fontFamily={FONT_SANS} fontSize={18} fill={D.dim}>
                  {v}
                </text>
              </g>
            ))}
            {[0, 10, 20, 30, 40, 50].map((u) => (
              <text key={u} x={X(u)} y={h - B + 28} textAnchor="middle" fontFamily={FONT_SANS} fontSize={18} fill={D.dim}>
                {u}
              </text>
            ))}
            <text x={(L + w - R) / 2} y={h - 14} textAnchor="middle" fontFamily={FONT_SANS} fontSize={20} fill={D.dim}>
              用掉的前向次数
            </text>
            <text x={20} y={T + 10} fontFamily={FONT_SANS} fontSize={18} fill={D.dim} transform={`rotate(-90 20 ${T + 120})`}>
              练习题正确率 %
            </text>
            {edits.map((t, i) => (
              <line key={i} x1={X(t.used + 0.25)} x2={X(t.used + 0.25)} y1={Y(-9)} y2={Y(-1)} stroke={D.red} strokeWidth={3} opacity={0.75} />
            ))}
            {gen.map((t, i) => {
              const p = t.pass!;
              return (
                <g key={i}>
                  {p.edited !== undefined && <line x1={X(t.after)} x2={X(t.after)} y1={Y(p.original!)} y2={Y(p.edited)} stroke={D.axis} strokeWidth={1.5} />}
                  <circle cx={X(t.after)} cy={Y(p.original!)} r={5} fill={D.faint} />
                  {p.edited !== undefined && <circle cx={X(t.after)} cy={Y(p.edited)} r={7} fill={D.green} />}
                </g>
              );
            })}
            <line x1={X(cur.after)} x2={X(cur.after)} y1={T} y2={h - B} stroke={D.ink2} strokeDasharray="4 5" />
          </svg>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 1340, top: 210, width: 484}}>
        <Card style={{padding: '22px 26px', minHeight: 300}}>
          {lastPass && lastPass.pass && (
            <>
              <Zh size={26} w={800} color={D.green}>
                第 {lastPass.pass.number} 次前向
              </Zh>
              <div style={{marginTop: 8}}>
                <Zh size={22} w={600}>
                  {lastPass.pass.model === 'both' ? `原模型和改后的各做 ${lastPass.pass.items} 道` : `原模型做 ${lastPass.pass.items} 道`}
                </Zh>
              </div>
              <div style={{marginTop: 10}}>
                <Zh size={24} w={700}>
                  正确率 {lastPass.pass.original}%{lastPass.pass.edited !== undefined ? <> → <Mark>{lastPass.pass.edited}%</Mark></> : null}
                </Zh>
              </div>
              {lastPass.pass.cut_original !== undefined && (
                <div style={{marginTop: 6}}>
                  <Zh size={22} w={500} color={D.dim}>
                    写满上限：{Math.round(lastPass.pass.cut_original * 100)}% → {Math.round((lastPass.pass.cut_edited ?? 0) * 100)}%
                  </Zh>
                </div>
              )}
              {lastPass.pass.cut !== undefined && (
                <div style={{marginTop: 6}}>
                  <Zh size={22} w={500} color={D.dim}>
                    写满上限：{Math.round(lastPass.pass.cut * 100)}%
                  </Zh>
                </div>
              )}
            </>
          )}
        </Card>
        <Card tint={D.panel} style={{padding: '18px 22px', marginTop: 20, minHeight: 250, opacity: prog(b[1], 12)}}>
          <Zh size={20} w={700} color={D.dim}>
            Astra 当时的假设（原文英文）
          </Zh>
          <div style={{marginTop: 8, fontFamily: FONT_SANS, fontSize: 20, fontStyle: 'italic', color: D.ink2, lineHeight: 1.4, maxHeight: 200, overflow: 'hidden'}}>
            {lastHyp ? `“${lastHyp.hyp}”` : ''}
          </div>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 1340, top: 800, width: 484, ...rise(b[3], 160)}}>
        <Card tint={D.answer} style={{padding: '14px 20px', border: 'none'}}>
          <Zh size={22} w={700}>
            最终：第 15、19 层 MLP 各 64 列输出（131,072 个权重）
          </Zh>
        </Card>
      </div>
      <SrcLine f={b[0]}>按原文 Experiment 8 交互图的 50 次预算记录（158 轮）重放；灰点原模型、绿点改后的，均为练习题</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ results
export const Results: React.FC = () => {
  const b = useBeats();
  const chart = prog(b[4], 16);
  const w = 1240,
    h = 600,
    L = 70,
    R = 40,
    T = 20,
    B = 60;
  const X = (i: number) => L + [0, 10, 25, 50][i] / 50 * (w - L - R);
  const Y = (v: number) => T + (1 - v / 75) * (h - T - B);
  const draw = prog(b[4], 50, 10);
  return (
    <Shell part="改真实的语言模型">
      <Head kicker="Experiment 8 · 结果" title="MATH-500 从 7.9% 到 48.1%" />
      {chart < 0.99 && (
        <div style={{position: 'absolute', left: 96, top: 230, width: 1728, opacity: 1 - chart}}>
          <Card style={{padding: '28px 36px'}}>
            <Table
              size={30}
              widths={[480, 280, 280, 280, 340]}
              head={['Qwen3.5-0.8B', 'MATH-500 (%)', 'GSM8K (%)', 'IFEval (%)', '写满上限 (%)']}
              rows={[
                {cells: ['原模型', '7.9', '13.8', '21.0', '93.0'], at: b[0]},
                {cells: ['改后，10 次前向', '12.3', '25.7', '49.0', '87.2'], at: b[0] - 8},
                {cells: ['改后，25 次前向', '14.1', '25.1', '39.9', '86.4'], at: b[0] - 16},
                {cells: ['改后，50 次前向', '48.1', '67.1', '62.3', '33.1'], at: b[0] - 24, hot: b[3] > 0 ? [1, 2, 3, 4] : b[2] > 0 ? [1, 2, 3] : [1, 2]},
              ]}
            />
          </Card>
          <div style={{display: 'flex', gap: 30, marginTop: 30}}>
            <Card style={{flex: 1, padding: '20px 28px', ...rise(b[1], 0)}}>
              <Zh size={28} w={700}>
                打转不只发生在数学题上
              </Zh>
              <div style={{marginTop: 6, ...rise(b[2], 0, 8)}}>
                <Zh size={26} w={500}>
                  指令遵循 IFEval：21.0% → <Mark p={prog(b[2], 14, 10)}>62.3%</Mark>，约 3 倍
                </Zh>
              </div>
            </Card>
            <Card style={{flex: 1, padding: '20px 28px', ...rise(b[3], 0)}}>
              <Zh size={24} w={700}>
                写满上限的比例
              </Zh>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 26, marginTop: 10, height: 110}}>
                {[
                  ['原', 93.0],
                  ['10 次', 87.2],
                  ['25 次', 86.4],
                  ['50 次', 33.1],
                ].map(([l, v], i) => (
                  <div key={l as string} style={{display: 'flex', alignItems: 'flex-end', gap: 8}}>
                    <div style={{width: 46, height: (v as number) * prog(b[3], 20, i * 6), background: i === 3 ? D.green : D.red, opacity: i === 3 ? 1 : 0.65}} />
                    <div>
                      <Zh size={20} w={700}>
                        {v as number}
                      </Zh>
                      <div>
                        <Zh size={17} w={500} color={D.dim}>
                          {l as string}
                        </Zh>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
      {chart > 0.01 && (
        <div style={{position: 'absolute', left: 96, top: 214, opacity: chart}}>
          <div style={{display: 'flex', gap: 26, marginBottom: 6}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <div style={{width: 26, height: 4, background: D.green}} />
              <Zh size={21} w={600} color={D.dim}>
                数学评测
              </Zh>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <div style={{width: 26, height: 4, background: D.orange}} />
              <Zh size={21} w={600} color={D.dim}>
                其他评测
              </Zh>
            </div>
          </div>
          <svg width={w + 380} height={h}>
            {[0, 20, 40, 60].map((v) => (
              <g key={v}>
                <line x1={L} x2={w - R} y1={Y(v)} y2={Y(v)} stroke={D.hair} />
                <text x={L - 10} y={Y(v) + 6} textAnchor="end" fontFamily={FONT_SANS} fontSize={19} fill={D.dim}>
                  {v}%
                </text>
              </g>
            ))}
            {['原模型', '10', '25', '50'].map((t, i) => (
              <text key={t} x={X(i)} y={h - B + 30} textAnchor="middle" fontFamily={FONT_SANS} fontSize={20} fill={D.ink2}>
                {t}
              </text>
            ))}
            <text x={(L + w - R) / 2} y={h - 4} textAnchor="middle" fontFamily={FONT_SANS} fontSize={20} fill={D.dim}>
              Astra 能用的前向次数
            </text>
            {Q.bench.map((bm) => {
              const c = bm.group === 'math' ? D.green : D.orange;
              const hero = bm.name === 'MATH-500';
              const pts = bm.scores.map((v, i) => [X(i), Y(v)] as [number, number]);
              const segs = draw * 3;
              const out: [number, number][] = [];
              pts.forEach((p, i) => {
                if (i <= segs) out.push(p);
                else if (i - 1 < segs) out.push([lerp(pts[i - 1][0], p[0], segs - i + 1), lerp(pts[i - 1][1], p[1], segs - i + 1)]);
              });
              return (
                <g key={bm.name}>
                  <polyline points={out.map((p) => p.join(',')).join(' ')} fill="none" stroke={c} strokeWidth={hero ? 5 : 2.5} strokeOpacity={hero ? 1 : 0.5} />
                  {out.map((p, i) => (
                    <circle key={i} cx={p[0]} cy={p[1]} r={hero ? 7 : 4} fill={c} opacity={hero ? 1 : 0.6} />
                  ))}
                </g>
              );
            })}
            {(() => {
              const labs = Q.bench.map((bm) => ({name: bm.name, v: bm.scores[3], c: bm.group === 'math' ? D.greenDark : D.orange, y: Y(bm.scores[3])}));
              labs.sort((a, c) => a.y - c.y);
              for (let i = 1; i < labs.length; i++) labs[i].y = Math.max(labs[i].y, labs[i - 1].y + 30);
              return labs.map((l, i) => (
                <text key={l.name} x={w - R + 20} y={l.y + 7} fontFamily={FONT_SANS} fontSize={23} fontWeight={l.name === 'MATH-500' ? 800 : 600} fill={l.c} opacity={prog(b[4], 12, 60 + i * 3)}>
                  {l.name}　{l.v}
                </text>
              ));
            })()}
          </svg>
        </div>
      )}
      <SrcLine f={b[0]}>表格和曲线照原文；采样设置与原模型相同（温度 0.6 等）；每题多次采样取平均</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ Gemma control
export const Gemma: React.FC = () => {
  const b = useBeats();
  const gm = [6.8, 7.0, 7.6, 7.7, 7.0];
  const gx = ['原', '5', '10', '25', '50'];
  return (
    <Shell part="改真实的语言模型">
      <Head kicker="追加实验" title="换一个不打转的模型：Gemma 3 270M" />
      <div style={{position: 'absolute', left: 96, top: 214, width: 1728, ...rise(b[0], 0)}}>
        <Card tint={D.panel} style={{padding: '16px 26px'}}>
          <Zh size={28} w={600}>
            修好打转，是让模型把<Mark p={prog(b[0], 16, 20)}>本来就能做完的题做完</Mark>，不等于让它更会数学
          </Zh>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 96, top: 330, width: 820, ...rise(b[1], 0)}}>
        <Card style={{padding: '22px 28px', height: 250}}>
          <Zh size={24} w={700}>
            回答写到上限的比例
          </Zh>
          {[
            ['Qwen3.5-0.8B', 93, D.red],
            ['Gemma 3 270M', 8.5, D.green],
          ].map(([l, v, c], i) => (
            <div key={l as string} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 22}}>
              <Zh size={24} w={600} style={{width: 210}}>
                {l as string}
              </Zh>
              <div style={{width: (v as number) * 4.4 * prog(b[1], 30, i * 10), height: 34, background: c as string, minWidth: 4}} />
              <Big size={32}>{v as number}%</Big>
            </div>
          ))}
        </Card>
      </div>
      <div style={{position: 'absolute', left: 96, top: 610, width: 820, ...rise(b[2], 0)}}>
        <Card style={{padding: '22px 28px', height: 280}}>
          <Zh size={24} w={700}>
            Astra 读 Gemma 的错题，看到的是
          </Zh>
          {['算错数', '代数步骤不对', '找不到一个能关掉的部件'].map((t, i) => (
            <div key={t} style={{marginTop: 14, ...rise(b[2], 12 + i * 10, 8)}}>
              <Zh size={27} w={600}>
                · {t}
              </Zh>
            </div>
          ))}
        </Card>
      </div>
      <div style={{position: 'absolute', left: 960, top: 330, width: 864, ...rise(b[3], 0)}}>
        <Card style={{padding: '22px 28px', height: 560}}>
          <Zh size={24} w={700}>
            Gemma 3 270M · MATH-500（%）
          </Zh>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, marginTop: 30, height: 300, borderBottom: `2px solid ${D.ink2}`, paddingLeft: 20}}>
            {gm.map((v, i) => (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
                <Zh size={24} w={700}>
                  {v.toFixed(1)}
                </Zh>
                <div style={{width: 90, height: v * 30 * prog(b[3], 24, i * 6), background: i ? D.green : D.faint}} />
              </div>
            ))}
          </div>
          <div style={{display: 'flex', gap: 40, paddingLeft: 20, marginTop: 8}}>
            {gx.map((t, i) => (
              <div key={i} style={{width: 90, textAlign: 'center'}}>
                <Zh size={20} w={600} color={D.dim}>
                  {i ? `${t} 次` : '原模型'}
                </Zh>
              </div>
            ))}
          </div>
          <div style={{marginTop: 20}}>
            <Zh size={22} w={500} color={D.dim}>
              例：把一个对数字敏感的神经元加倍。变化都不超过约 1 个点，Astra 自己也说这点提升证实不了
            </Zh>
          </div>
        </Card>
      </div>
      {b[4] > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 200, bottom: 0, background: D.page, opacity: 0.92 * prog(b[4], 14)}} />}
      {b[4] > 0 && (
        <div style={{position: 'absolute', left: 260, top: 400, width: 1400, ...rise(b[4], 0)}}>
          <Card style={{padding: '36px 44px', borderColor: D.green, boxShadow: '0 30px 80px rgba(0,0,0,0.12)'}}>
            <Lab size={22}>作者的结论</Lab>
            <div style={{marginTop: 12}}>
              <Zh size={42} w={800}>
                改权重能<Mark p={prog(b[4], 16, 10)}>移走挡住能力的障碍</Mark>，
              </Zh>
            </div>
            <div>
              <Zh size={42} w={800}>
                但加不出模型本来没有的能力。
              </Zh>
            </div>
          </Card>
        </div>
      )}
      <SrcLine f={b[1]}>Gemma 按其模型说明采样（温度 1.0，最多 8,192 token），每题 4 次取平均；表格照原文</SrcLine>
    </Shell>
  );
};
