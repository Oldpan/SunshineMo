// Part 1: the K3 base model (all numbers from the Kimi K3 technical report, §2–§3, Table 1, Fig. 3–5).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Chip, clamp01, count, fmt, Head, Illus, K, lerp, Mo, Num, Panel, prog, rise, Shell, SrcLine, usePopIn, Zh} from './common';

const PART = '01 · 底座 K3';

// ------------------------------------------------------------------ scale: K2 vs K3
type Pair = {label: string; k2: number; k3: number; u: string; dec: number; ratio: string; beat: number; k2s?: string; k3s?: string};
const PAIRS: Pair[] = [
  {label: '总参数', k2: 1.04, k3: 2.78, u: '万亿', dec: 2, ratio: '×2.7', beat: 0},
  {label: '每 token 激活', k2: 326, k3: 1042, u: '亿', dec: 0, ratio: '×3.2', beat: 1},
  {label: '路由专家', k2: 384, k3: 896, u: '个', dec: 0, ratio: '每次选 8 → 16', beat: 2},
  {label: '训练上下文', k2: 128, k3: 1000, u: 'K', dec: 0, ratio: '×8', beat: 3, k2s: '128K', k3s: '1M'},
];

export const Scale: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const x0 = 380;
  const W = 1000;
  return (
    <Shell part={PART}>
      <Head kicker="SCALE · K2 → K3" title="底座 K3 有多大" sub="柱长按各行 K3 = 满格" />
      {PAIRS.map((r, i) => {
        const f = b[r.beat];
        const g2 = prog(f, 24, 4);
        const g3 = prog(f, 30, 12);
        return (
          <div key={r.label} style={{position: 'absolute', left: 96, top: 250 + i * 142, width: 1700, ...rise(f, 0)}}>
            <div style={{position: 'absolute', left: 0, top: 22, width: 260, textAlign: 'right'}}>
              <Zh size={32} w={900}>
                {r.label}
              </Zh>
            </div>
            {/* K2 */}
            <div style={{position: 'absolute', left: x0 - 96, top: 8, display: 'flex', alignItems: 'center', gap: 14}}>
              <Mo size={18} color={K.faint} style={{width: 34}}>
                K2
              </Mo>
              <div style={{width: (r.k2 / r.k3) * W * g2, height: 26, background: K.grey2, borderRadius: '0 5px 5px 0'}} />
              <Num size={28} color={K.dim} w={700}>
                {r.k2s ?? fmt(count(f - 4, r.k2, 24), r.dec)}
                {!r.k2s && <span style={{fontSize: 18, marginLeft: 4}}>{r.u}</span>}
              </Num>
            </div>
            {/* K3 */}
            <div style={{position: 'absolute', left: x0 - 96, top: 48, display: 'flex', alignItems: 'center', gap: 14}}>
              <Mo size={18} color={K.hero2} style={{width: 34}}>
                K3
              </Mo>
              <div style={{width: W * g3, height: 42, background: `linear-gradient(90deg, ${K.hero2}88, ${K.hero2})`, borderRadius: '0 6px 6px 0', boxShadow: `0 0 24px ${K.hero2}44`}} />
              <Num size={40} color={K.ink}>
                {r.k3s ?? fmt(count(f - 12, r.k3, 30), r.dec)}
                {!r.k3s && <span style={{fontSize: 22, marginLeft: 4, color: K.dim}}>{r.u}</span>}
              </Num>
            </div>
            <div style={{position: 'absolute', left: 1530, top: 40, ...pop(f, 34, 0.6)}}>
              <Chip color={K.hero2}>{r.ratio}</Chip>
            </div>
          </div>
        );
      })}
      {/* beat 1: share of active params */}
      <div style={{position: 'absolute', left: 1530, top: 380, ...pop(b[1], 44, 0.6)}}>
        <Zh size={22} w={700} color={K.dim}>
          激活占比 <span style={{color: K.hero}}>3.75%</span>
        </Zh>
      </div>
      {/* beat 4: scaling efficiency */}
      <div style={{position: 'absolute', right: 96, top: 120, ...pop(b[4], 0, 0.5)}}>
        <Panel glow={K.hero} style={{padding: '14px 28px', display: 'flex', alignItems: 'baseline', gap: 14}}>
          <Zh size={26} w={800} color={K.dim}>
            扩展效率
          </Zh>
          <Num size={64} color={K.hero}>
            {fmt(count(b[4] - 6, 2.5, 26, 1), 1)}×
          </Num>
          <Zh size={22} w={700} color={K.dim}>
            vs K2
          </Zh>
        </Panel>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 Table 1（K2 vs K3 架构对比）、§3.2 扩展定律（≈2.5× scaling efficiency）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ hybrid attention
// 23 blocks of (KDA, KDA, KDA, Gated MLA) + one final Gated MLA = 69 KDA + 24 MLA = 93 layers (report §2.1, Table 1).
const LAYERS: ('k' | 'm')[] = [...Array.from({length: 23}, () => ['k', 'k', 'k', 'm'] as ('k' | 'm')[]).flat(), 'm'];

export const Attn: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  // camera: beat 0 shows the first block big, beat 1 pulls back to all 93 layers
  const z = prog(b[1], 30);
  const cellW = lerp(150, 16, z);
  const gap = lerp(16, 2, z);
  const cellH = lerp(150, 92, z);
  const stripX = 96;
  const nK = LAYERS.filter((l, i) => l === 'k' && prog(b[1], 30, 6 + i * 0.35) > 0.5).length;
  const nM = LAYERS.filter((l, i) => l === 'm' && prog(b[1], 30, 6 + i * 0.35) > 0.5).length;
  return (
    <Shell part={PART}>
      <Head kicker="DESIGN 1 · HYBRID ATTENTION" title="混合注意力" sub="3 层 KDA + 1 层 Gated MLA" />
      <div style={{position: 'absolute', left: stripX, top: 250, height: 170, width: 1730, overflow: 'hidden'}}>
        {LAYERS.map((l, i) => {
          const shown = i < 4 ? prog(b[0], 14, i * 5) : prog(b[1], 30, 6 + i * 0.35);
          const lit = l === 'm';
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * (cellW + gap),
                top: 0,
                width: cellW,
                height: cellH,
                borderRadius: lerp(14, 3, z),
                background: lit ? K.ink : `${K.hero}`,
                opacity: shown * (lit ? 0.95 : 0.85),
                boxShadow: lit ? `0 0 18px rgba(255,255,255,0.35)` : `0 0 14px ${K.hero}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i < 4 && (
                <span style={{opacity: 1 - z, fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: 30, color: K.bg, textAlign: 'center', lineHeight: 1.1}}>
                  {lit ? (
                    <>
                      Gated
                      <br />
                      MLA
                    </>
                  ) : (
                    'KDA'
                  )}
                </span>
              )}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 4 * (150 + 16) + 10, top: 40, opacity: (1 - z) * prog(b[0], 12, 26)}}>
          <Num size={70} color={K.dim}>
            × 23 …
          </Num>
        </div>
      </div>
      <div style={{position: 'absolute', left: stripX, top: 360, display: 'flex', gap: 36, opacity: prog(b[1], 14, 10)}}>
        <Zh size={30} w={900} color={K.hero}>
          KDA <Num size={40} color={K.hero}>{nK}</Num> 层
        </Zh>
        <Zh size={30} w={900} color={K.ink}>
          Gated MLA <Num size={40} color={K.ink}>{nM}</Num> 层
        </Zh>
        <Zh size={24} w={600} color={K.dim}>
          共 93 层，最后一层也是 MLA
        </Zh>
      </div>

      {/* beat 2: memory vs length (illustrative) */}
      <div style={{position: 'absolute', left: 96, top: 450, ...pop(b[2], 0, 0.9)}}>
        <Panel style={{width: 640, height: 300, padding: '18px 26px', position: 'relative'}}>
          <Zh size={24} w={800}>
            缓存 vs 序列长度
          </Zh>
          <Illus style={{position: 'absolute', right: 20, top: 20}} />
          <svg width={590} height={220} style={{position: 'absolute', left: 26, top: 64}}>
            <line x1={30} y1={190} x2={570} y2={190} stroke={K.dim} strokeWidth={2} />
            <line x1={30} y1={10} x2={30} y2={190} stroke={K.dim} strokeWidth={2} />
            {(() => {
              const g = prog(b[2], 40, 6);
              const xe = 30 + 540 * g;
              return (
                <>
                  <line x1={30} y1={190} x2={xe} y2={190 - 170 * g} stroke={K.grey2} strokeWidth={5} strokeLinecap="round" />
                  <line x1={30} y1={150} x2={xe} y2={150} stroke={K.hero} strokeWidth={6} strokeLinecap="round" />
                </>
              );
            })()}
            <text x={40} y={22} fill={K.dim} fontSize={18} fontFamily="Noto Sans SC" fontWeight={700} opacity={prog(b[2], 12, 40)}>
              softmax 注意力的 KV 缓存：越长越大
            </text>
            <text x={300} y={140} fill={K.hero} fontSize={20} fontFamily="Noto Sans SC" fontWeight={800} opacity={prog(b[2], 12, 44)}>
              KDA 固定大小的状态
            </text>
          </svg>
        </Panel>
      </div>
      {/* beat 3: NoPE */}
      <div style={{position: 'absolute', left: 770, top: 450, ...pop(b[3], 0, 0.9)}}>
        <Panel style={{width: 420, height: 300, padding: '22px 28px'}}>
          <Zh size={24} w={800} color={K.dim}>
            Gated MLA
          </Zh>
          <div style={{marginTop: 8}}>
            <Zh size={36} w={900}>
              全局对照
            </Zh>
          </div>
          <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{position: 'relative'}}>
              <Mo size={30} color={K.dim} w={800}>
                RoPE
              </Mo>
              <div style={{position: 'absolute', left: -4, right: -4, top: 18, height: 4, background: K.red, transform: `scaleX(${prog(b[3], 14, 16)})`, transformOrigin: 'left'}} />
            </span>
            <Chip color={K.hero} style={{opacity: prog(b[3], 12, 26)}}>
              NoPE · 不用位置编码
            </Chip>
          </div>
          <div style={{marginTop: 16}}>
            <Zh size={20} w={600} color={K.faint}>
              位置感由 KDA 的门控衰减提供
            </Zh>
          </div>
        </Panel>
      </div>
      {/* beat 4: lower-bounded decay */}
      <div style={{position: 'absolute', left: 1222, top: 450, ...pop(b[4], 0, 0.9)}}>
        <Panel style={{width: 604, height: 300, padding: '18px 26px', position: 'relative'}}>
          <Zh size={24} w={800}>
            衰减设下界
          </Zh>
          <Mo size={18} color={K.dim} style={{marginLeft: 14}}>
            g = g_min·σ(e^A z), g_min = −5
          </Mo>
          <svg width={560} height={170} style={{position: 'absolute', left: 22, top: 60}}>
            {(() => {
              const g = prog(b[4], 36, 6);
              const pts = (fn: (z: number) => number) =>
                Array.from({length: 61}, (_, i) => {
                  const zz = -6 + (12 * i) / 60;
                  return `${30 + ((zz + 6) / 12) * 520 * g},${20 + Math.min(150, -fn(zz) * 18)}`;
                }).join(' ');
              const soft = (zz: number) => -Math.log(1 + Math.exp(zz)); // Kimi Linear: -Softplus (A = 0)
              const bound = (zz: number) => -5 / (1 + Math.exp(-zz)); // Kimi K3: g_min · sigmoid (A = 0)
              return (
                <>
                  <line x1={30} y1={20} x2={550} y2={20} stroke={K.dim} strokeWidth={1.5} />
                  <line x1={30} y1={110} x2={550} y2={110} stroke={K.warn} strokeWidth={1.5} strokeDasharray="6 6" />
                  <polyline points={pts(soft)} fill="none" stroke={K.grey2} strokeWidth={4} />
                  <polyline points={pts(bound)} fill="none" stroke={K.hero} strokeWidth={5} />
                  <text x={36} y={14} fill={K.dim} fontSize={15} fontFamily="JetBrains Mono">
                    0
                  </text>
                  <text x={36} y={104} fill={K.warn} fontSize={15} fontFamily="JetBrains Mono">
                    −5（下界）
                  </text>
                  <text x={360} y={164} fill={K.grey2} fontSize={16} fontFamily="Noto Sans SC" fontWeight={700}>
                    Kimi Linear：无下界 → −∞
                  </text>
                </>
              );
            })()}
          </svg>
          <div style={{position: 'absolute', left: 26, bottom: 16, opacity: prog(b[4], 12, 40)}}>
            <Chip color={K.hero} style={{fontSize: 19}}>
              对角块也能用 Tensor Core 矩阵乘
            </Chip>
          </div>
        </Panel>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 §2.1 Hybrid Attention（Eq. 5、Fig. 3）、Table 1（69 KDA + 24 MLA）</SrcLine>
      {frame < 0 && null}
    </Shell>
  );
};

// ------------------------------------------------------------------ context curriculum
const STAGES = [
  {k: '8K', v: 8, phase: '预训练'},
  {k: '64K', v: 64, phase: '预训练'},
  {k: '256K', v: 256, phase: '退火'},
  {k: '1M', v: 1024, phase: '退火'},
];

export const Ctx: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const lx = (v: number) => ((Math.log2(v) - 2) / (Math.log2(1024) - 2)) * 1500; // log axis from 4K
  return (
    <Shell part={PART}>
      <Head kicker="LONG CONTEXT" title="一路拉到 1M" sub="不改位置编码，直接外推" />
      <div style={{position: 'absolute', left: 96, top: 270, display: 'flex', gap: 18, alignItems: 'center', ...rise(b[0], 0)}}>
        <Chip color={K.hero}>NoPE</Chip>
        <Zh size={36} w={800}>
          位置信息 ← KDA 的门控衰减
        </Zh>
        <Zh size={26} w={600} color={K.dim}>
          不用调 RoPE 底数，也不用 YaRN
        </Zh>
      </div>
      <div style={{position: 'absolute', left: 200, top: 420, width: 1560, height: 400}}>
        {/* axis */}
        <div style={{position: 'absolute', left: 0, top: 120, width: 1500 * prog(b[1], 20), height: 2, background: K.dim}} />
        {STAGES.map((s, i) => {
          const f = b[1] - 12 - i * 16;
          const g = prog(f, 18);
          const prev = i === 0 ? 0 : lx(STAGES[i - 1].v);
          const x = lx(s.v);
          const c = s.phase === '预训练' ? K.hero2 : K.hero;
          return (
            <React.Fragment key={s.k}>
              <div style={{position: 'absolute', left: prev, top: 30, width: (x - prev) * g, height: 90, background: c, opacity: 0.25 + 0.2 * i, borderRadius: 4}} />
              <div style={{position: 'absolute', left: x - 60, top: 140, width: 120, textAlign: 'center', ...pop(f, 10, 0.6)}}>
                <Num size={64} color={c}>
                  {s.k}
                </Num>
                <div>
                  <Zh size={28} w={700} color={K.dim}>
                    {s.phase}
                  </Zh>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div style={{position: 'absolute', left: 0, top: 290, opacity: prog(b[1], 12, 40)}}>
          <Mo size={20} color={K.faint}>
            对数刻度 · 四段课程：预训练 8K → 64K，退火 256K → 1M
          </Mo>
        </div>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 §2.1.2（NoPE）、§3.4 Long-Context Extension（four-stage curriculum）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ attention residuals
export const AttnRes: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const L = 8; // drawn layers (illustrative)
  // illustrative weights for the AttnRes panel
  const W = [0.5, 0.15, 0.9, 0.2, 0.35, 0.1, 0.7];
  const blocks = Array.from({length: 8}, (_, i) => (i < 7 ? 12 : 9)); // 93 layers, 12-layer blocks, partial final block
  const g3 = prog(b[2], 26);
  return (
    <Shell part={PART}>
      <Head kicker="DESIGN 2 · ATTENTION RESIDUALS" title="注意力残差" sub="在“深度”方向上做注意力" />
      {/* left: plain residual */}
      <div style={{position: 'absolute', left: 120, top: 250, ...rise(b[0], 0)}}>
        <Panel style={{width: 600, height: 520, position: 'relative', padding: 26}}>
          <Zh size={28} w={900} color={K.dim}>
            普通残差：全部相加
          </Zh>
          <svg width={560} height={440} style={{position: 'absolute', left: 20, top: 70}}>
            <line x1={150} y1={360} x2={150} y2={20} stroke={K.grey2} strokeWidth={10} />
            {Array.from({length: L}, (_, i) => {
              const y = 360 - i * 46;
              const s = prog(b[0], 10, 8 + i * 3);
              return (
                <g key={i} opacity={s}>
                  <rect x={260} y={y - 18} width={180} height={36} rx={8} fill={K.panel2} stroke={K.grey2} />
                  <text x={350} y={y + 7} textAnchor="middle" fill={K.dim} fontSize={18} fontFamily="JetBrains Mono">
                    {i === 0 ? 'embedding' : `layer ${i}`}
                  </text>
                  <line x1={260} y1={y} x2={160} y2={y} stroke={K.grey2} strokeWidth={4} />
                  <circle cx={150} cy={y} r={12} fill={K.panel} stroke={K.grey2} strokeWidth={3} />
                  <text x={150} y={y + 6} textAnchor="middle" fill={K.dim} fontSize={18} fontWeight={800}>
                    +
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{position: 'absolute', left: 26, bottom: 22}}>
            <Zh size={22} w={600} color={K.faint}>
              越往深处，早期层的信息越被稀释
            </Zh>
          </div>
        </Panel>
      </div>
      {/* right: attention over depth */}
      <div style={{position: 'absolute', left: 780, top: 250, ...pop(b[1], 0, 0.92)}}>
        <Panel glow={K.hero} style={{width: 1020, height: 520, position: 'relative', padding: 26}}>
          <Zh size={28} w={900}>
            {g3 < 0.5 ? 'AttnRes：每层挑着读前面各层' : 'Block AttnRes：12 层一块，块间做注意力'}
          </Zh>
          <Illus style={{position: 'absolute', right: 24, top: 28}} />
          <svg width={980} height={440} style={{position: 'absolute', left: 20, top: 70}}>
            {/* per-layer version */}
            <g opacity={1 - g3}>
              {Array.from({length: L}, (_, i) => {
                const y = 380 - i * 48;
                return (
                  <g key={i}>
                    <rect x={120} y={y - 18} width={180} height={36} rx={8} fill={i === L - 1 ? K.hero : K.panel2} stroke={i === L - 1 ? K.hero : K.grey2} />
                    <text x={210} y={y + 7} textAnchor="middle" fill={i === L - 1 ? K.bg : K.dim} fontSize={18} fontFamily="JetBrains Mono" fontWeight={i === L - 1 ? 800 : 500}>
                      {i === 0 ? 'embedding' : `layer ${i}`}
                    </text>
                  </g>
                );
              })}
              {W.map((w, i) => {
                const y0 = 380 - i * 48;
                const y1 = 380 - (L - 1) * 48;
                const d = prog(b[1], 20, 10 + i * 4);
                return (
                  <path
                    key={i}
                    d={`M 300 ${y0} C ${420 + i * 10} ${y0}, ${420 + i * 10} ${y1}, 300 ${y1}`}
                    fill="none"
                    stroke={K.hero}
                    strokeWidth={2 + w * 10}
                    opacity={(0.25 + w * 0.75) * d}
                    strokeDasharray="600"
                    strokeDashoffset={600 * (1 - d)}
                  />
                );
              })}
              <text x={480} y={60} fill={K.hero} fontSize={22} fontFamily="Noto Sans SC" fontWeight={800} opacity={prog(b[1], 12, 30)}>
                α：学到的权重，按需取用
              </text>
            </g>
            {/* block version */}
            <g opacity={g3}>
              {blocks.map((n, i) => {
                const x = 40 + i * 116;
                const h = (n / 12) * 260;
                const s = prog(b[2], 14, 6 + i * 3);
                return (
                  <g key={i} opacity={s}>
                    <rect x={x} y={380 - h} width={92} height={h} rx={10} fill={K.panel2} stroke={K.hero2} strokeWidth={2} />
                    {Array.from({length: n}, (_, j) => (
                      <rect key={j} x={x + 10} y={380 - h + 8 + j * ((h - 16) / n)} width={72} height={(h - 16) / n - 4} rx={2} fill={`${K.hero2}55`} />
                    ))}
                    <circle cx={x + 46} cy={60} r={16} fill={K.hero} opacity={0.9} />
                    <line x1={x + 46} y1={76} x2={x + 46} y2={380 - h} stroke={K.hero} strokeWidth={2} strokeDasharray="4 5" />
                    <text x={x + 46} y={410} textAnchor="middle" fill={K.dim} fontSize={18} fontFamily="JetBrains Mono">
                      {n}
                    </text>
                  </g>
                );
              })}
              <path d={`M 86 60 L ${40 + 7 * 116 + 46} 60`} stroke={K.hero} strokeWidth={4} opacity={prog(b[2], 16, 34)} />
              <text x={40} y={30} fill={K.hero} fontSize={21} fontFamily="Noto Sans SC" fontWeight={800} opacity={prog(b[2], 12, 36)}>
                注意力只在 8 个块的汇总之间做 → 内存从 O(Ld) 降到 O(Nd)
              </text>
            </g>
          </svg>
        </Panel>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 §2.2 Attention Residuals（Eq. 8–10；8 blocks with 12-layer size，最后一块不满）</SrcLine>
      {frame < 0 && null}
    </Shell>
  );
};

// ------------------------------------------------------------------ Stable LatentMoE
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const Moe: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const cols = 32;
  const rows = 28; // 896
  const cell = 17;
  const tok = Math.floor(Math.max(0, b[0]) / 14); // a new token every 14 frames
  const lit = new Set<number>();
  for (let j = 0; lit.size < 16; j++) lit.add(Math.floor(rnd(tok * 97 + j) * 896));
  const gridIn = prog(b[0], 20);
  // right column: which panel is showing
  const show1 = clamp01(prog(b[1], 14) - prog(b[2], 12));
  const show2 = clamp01(prog(b[2], 14) - prog(b[4], 12));
  const show3 = prog(b[4], 14);
  return (
    <Shell part={PART}>
      <Head kicker="DESIGN 3 · STABLE LATENTMOE" title="896 个专家，每次 16 个" sub="稀疏度 56" />
      <div style={{position: 'absolute', left: 110, top: 260, opacity: gridIn}}>
        <svg width={cols * cell} height={rows * cell}>
          {Array.from({length: 896}, (_, i) => {
            const on = lit.has(i) && b[0] >= 10;
            return (
              <circle
                key={i}
                cx={(i % cols) * cell + cell / 2}
                cy={Math.floor(i / cols) * cell + cell / 2}
                r={on ? 6.5 : 4}
                fill={on ? K.hero : K.grey}
                opacity={on ? 1 : 0.8}
              />
            );
          })}
        </svg>
        <div style={{marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 14}}>
          <Num size={48} color={K.hero}>
            16
          </Num>
          <Zh size={26} w={700} color={K.dim}>
            / 896 个路由专家 · 每个 token 换一批
          </Zh>
        </div>
      </div>

      {/* panel 1: latent width */}
      <div style={{position: 'absolute', left: 780, top: 250, opacity: show1, transform: `translateY(${(1 - prog(b[1], 16)) * 20}px)`}}>
        <Panel style={{width: 1040, padding: '28px 34px'}}>
          <Zh size={30} w={900}>
            路由专家在潜空间里算
          </Zh>
          {[
            {l: '模型宽度', v: 7168, c: K.grey2, note: '2 个共享专家走全宽'},
            {l: '路由专家宽度', v: 3584, c: K.hero, note: '0.5×，通信和权重流量更小'},
          ].map((r, i) => (
            <div key={r.l} style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 18}}>
              <div style={{width: 190, textAlign: 'right'}}>
                <Zh size={24} w={800} color={K.dim}>
                  {r.l}
                </Zh>
              </div>
              <div style={{width: (r.v / 7168) * 520 * prog(b[1], 24, 8 + i * 8), height: 40, background: r.c, borderRadius: 6}} />
              <Num size={34} color={K.ink}>
                {r.v}
              </Num>
              <Zh size={20} w={600} color={K.faint} style={{opacity: prog(b[1], 12, 30)}}>
                {r.note}
              </Zh>
            </div>
          ))}
        </Panel>
      </div>

      {/* panel 2: activation explosion -> SiTU-GLU bound (Fig. 4: scalar responses, β1 = 4, β2 = 25) */}
      <div style={{position: 'absolute', left: 780, top: 250, opacity: show2}}>
        <Panel style={{width: 1040, height: 560, padding: '24px 34px', position: 'relative'}}>
          <Zh size={30} w={900}>
            {prog(b[3], 10) < 0.5 ? '问题：激活爆炸、负载不均' : 'SiTU-GLU：给激活值封顶'}
          </Zh>
          <svg width={980} height={440} style={{position: 'absolute', left: 30, top: 90}}>
            {(() => {
              const X0 = 70;
              const Y0 = 400;
              const sx = (x: number) => X0 + ((x + 10) / 110) * 860;
              const sy = (y: number) => Y0 - (y / 160) * 360;
              const sig = (x: number) => 1 / (1 + Math.exp(-x));
              const swi = (x: number) => x * sig(x) * x;
              const situ = (x: number) => 4 * Math.tanh(x / 4) * sig(x) * 25 * Math.tanh(x / 25);
              const g1 = prog(b[2], 36, 4);
              const g2 = prog(b[3], 36, 8);
              const line = (fn: (x: number) => number, g: number) =>
                Array.from({length: 221}, (_, i) => -10 + (110 * i) / 220)
                  .filter((x) => x <= -10 + 110 * g)
                  .map((x) => `${sx(x)},${Math.max(-20, sy(fn(x)))}`)
                  .join(' ');
              return (
                <>
                  <line x1={X0} y1={Y0} x2={940} y2={Y0} stroke={K.dim} strokeWidth={2} />
                  <line x1={sx(0)} y1={20} x2={sx(0)} y2={Y0} stroke={K.dim} strokeWidth={1.5} />
                  <line x1={X0} y1={sy(100)} x2={940} y2={sy(100)} stroke={K.warn} strokeWidth={2} strokeDasharray="8 7" opacity={g2} />
                  <text x={X0 + 6} y={sy(100) - 10} fill={K.warn} fontSize={18} fontFamily="JetBrains Mono" opacity={g2}>
                    |f(x)| ≤ β1·β2 = 100
                  </text>
                  <polyline points={line(swi, g1)} fill="none" stroke={K.red} strokeWidth={5} />
                  <text x={sx(10)} y={40} fill={K.red} fontSize={22} fontFamily="Noto Sans SC" fontWeight={800} opacity={prog(b[2], 12, 26)}>
                    SwiGLU：两个因子都没上限 → 冲出画面
                  </text>
                  <polyline points={line(situ, g2)} fill="none" stroke={K.hero} strokeWidth={6} />
                  <text x={sx(55)} y={sy(100) + 40} fill={K.hero} fontSize={22} fontFamily="Noto Sans SC" fontWeight={800} opacity={prog(b[3], 12, 30)}>
                    SiTU-GLU：原点附近像 SwiGLU，大值被压住
                  </text>
                  <text x={930} y={Y0 + 28} textAnchor="end" fill={K.faint} fontSize={16} fontFamily="JetBrains Mono">
                    x ∈ [−10, 100]
                  </text>
                </>
              );
            })()}
          </svg>
          <div style={{position: 'absolute', right: 30, top: 28, display: 'flex', gap: 10, opacity: prog(b[3], 12, 6)}}>
            <Chip color={K.hero}>+ RMSNorm</Chip>
            <Chip color={K.hero}>+ SiTU-GLU</Chip>
          </div>
        </Panel>
      </div>

      {/* panel 3: Quantile Balancing (Fig. 5: loads 4,3,1,0 -> 2,2,2,2) */}
      <div style={{position: 'absolute', left: 780, top: 250, opacity: show3}}>
        <Panel style={{width: 1040, height: 560, padding: '24px 34px', position: 'relative'}}>
          <Zh size={30} w={900}>
            分位数平衡（Quantile Balancing）
          </Zh>
          <div style={{marginTop: 4}}>
            <Zh size={22} w={600} color={K.dim}>
              报告示例：8 个 token、4 个专家、每个 token 选 1 个
            </Zh>
          </div>
          {(() => {
            const before = [4, 3, 1, 0];
            const g = prog(b[4], 30, 30);
            return (
              <div style={{position: 'absolute', left: 80, bottom: 70, display: 'flex', gap: 90, alignItems: 'flex-end'}}>
                {before.map((v, i) => {
                  const h = lerp(v, 2, g);
                  const hot = v > 2 && g < 0.5;
                  return (
                    <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
                      <Num size={40} color={g > 0.5 ? K.hero : hot ? K.red : K.dim}>
                        {Math.round(h)}
                      </Num>
                      <div style={{width: 120, height: Math.max(6, h * 60) * prog(b[4], 16), borderRadius: 8, background: g > 0.5 ? K.hero : hot ? K.red : K.grey2}} />
                      <Mo size={22} color={K.dim}>
                        E{i + 1}
                      </Mo>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          <div style={{position: 'absolute', right: 40, top: 130, width: 330, opacity: prog(b[4], 12, 44)}}>
            <Zh size={24} w={800}>
              按分数的分位数设偏置
            </Zh>
            <div>
              <Zh size={22} w={700} color={K.dim} style={{whiteSpace: 'nowrap'}}>
                负载 4·3·1·0 → 2·2·2·2
              </Zh>
            </div>
          </div>
        </Panel>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 §2.3 Stable LatentMoE（Table 1、Fig. 4 SiTU-GLU β1=4 β2=25、Fig. 5 Quantile Balancing）</SrcLine>
      {frame < 0 && null}
    </Shell>
  );
};

// ------------------------------------------------------------------ native vision
export const Vision: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const flow = (frame % 60) / 60;
  return (
    <Shell part={PART}>
      <Head kicker="NATIVE VISION" title="原生多模态" sub="图、文、视频共用一个主干" />
      <div style={{position: 'absolute', left: 96, top: 280, display: 'flex', alignItems: 'center', gap: 30}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 90px)', gap: 8, ...rise(b[0], 0)}}>
          {Array.from({length: 9}, (_, i) => (
            <div key={i} style={{width: 90, height: 90, borderRadius: 10, background: `hsl(${195 + i * 12}, 60%, ${22 + (i % 3) * 8}%)`, border: `1px solid ${K.line}`}} />
          ))}
        </div>
        <Arrow f={b[0]} d={8} />
        <div style={pop(b[0], 14)}>
          <Panel glow={K.hero} style={{padding: '22px 30px', width: 470}}>
            <Mo size={30} color={K.hero} w={800}>
              MoonViT-V2
            </Mo>
            <div>
              <Zh size={24} w={700} color={K.dim}>
                27 层 · 约 4 亿参数 · 从零训练
              </Zh>
            </div>
          </Panel>
        </div>
        <Arrow f={b[0]} d={22} />
        <div style={pop(b[0], 28)}>
          <Panel style={{padding: '22px 30px', width: 520, position: 'relative', overflow: 'hidden'}}>
            <Zh size={30} w={900}>
              同一个主干 · 同一个上下文
            </Zh>
            <div style={{display: 'flex', gap: 6, marginTop: 14}}>
              {Array.from({length: 18}, (_, i) => {
                const vis = i % 3 === 1;
                return <div key={i} style={{width: 20, height: 20, borderRadius: 4, background: vis ? K.hero : K.grey2, opacity: 0.4 + 0.6 * Math.abs(Math.sin((i / 18 + flow) * Math.PI))}} />;
              })}
            </div>
            <Zh size={18} w={600} color={K.faint}>
              文字 token 与视觉 token 交错排进同一序列
            </Zh>
          </Panel>
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, top: 600, display: 'flex', gap: 30}}>
        <div style={rise(b[1], 0)}>
          <Panel style={{width: 520, padding: '24px 30px', position: 'relative'}}>
            <Zh size={24} w={700} color={K.dim}>
              以前（含 K2.5）
            </Zh>
            <div>
              <Zh size={34} w={900} color={K.dim}>
                SigLIP 对比学习初始化
              </Zh>
            </div>
            <div style={{position: 'absolute', left: 24, right: 24, top: 86, height: 5, background: K.red, transform: `scaleX(${prog(b[1], 16, 16)})`, transformOrigin: 'left'}} />
          </Panel>
        </div>
        <div style={pop(b[1], 26)}>
          <Panel glow={K.hero} style={{width: 620, padding: '24px 30px'}}>
            <Zh size={24} w={700} color={K.hero}>
              K3
            </Zh>
            <div>
              <Zh size={32} w={900}>
                从零训练，只用下一个 token 预测
              </Zh>
            </div>
          </Panel>
        </div>
        <div style={{...rise(b[1], 50), display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center'}}>
          <Chip color={K.green}>梯度范数更稳</Chip>
          <Chip color={K.green}>视觉评测不输</Chip>
        </div>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 §2.4 Native Vision（MoonViT-V2 27 层、约 0.4B 参数；Fig. 6 梯度范数对比）</SrcLine>
    </Shell>
  );
};

export const Arrow: React.FC<{f: number; d?: number; w?: number}> = ({f, d = 0, w = 70}) => {
  const g = prog(f, 14, d);
  return (
    <svg width={w} height={30} style={{opacity: g}}>
      <line x1={0} y1={15} x2={(w - 12) * g} y2={15} stroke={K.dim} strokeWidth={3} />
      <path d={`M ${w - 14} 6 L ${w - 2} 15 L ${w - 14} 24`} stroke={K.dim} strokeWidth={3} fill="none" opacity={g > 0.9 ? 1 : 0} />
    </svg>
  );
};

export {count as _count, fmt as _fmt};
