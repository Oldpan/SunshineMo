// Part 4: the deliberate cut — cyber data removed before the open-weight release (K3.1 Pro blog · Cybersecurity).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Chip, count, fmt, Head, Illus, K, lerp, Mo, Num, Panel, prog, rise, Shell, SrcLine, usePopIn, Zh} from './common';

const PART = '04 · 调弱的那一刀';

const rnd = (i: number) => {
  const x = Math.sin(i * 91.17 + 12.3) * 43758.5453;
  return x - Math.floor(x);
};

// xdev-bench-hard pass@3 (blog figure alt text); order = figure order
const XDEV = [
  {n: 'GPT-5.6 Sol', s: '第三方评测', v: 100, beat: 4, tone: K.grey2},
  {n: '未做降风险的版本', s: '同一流程，不删数据', v: 90.5, beat: 3, tone: K.warn},
  {n: 'DeepSeek-V4.1-Flash', s: '', v: 85.7, beat: 4, tone: K.grey},
  {n: 'Kimi K3.1 Pro', s: '开源发布版', v: 81.0, beat: 3, hero: true},
  {n: 'GLM-5.3', s: '', v: 57.1, beat: 4, tone: K.grey},
  {n: 'Kimi K3', s: '', v: 33.3, beat: 4, tone: K.hero2},
];

export const Cyber: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const out = prog(b[2], 30, 6); // cyber data leaves the buckets
  const x0 = 1180;
  const W = 560;
  return (
    <Shell part={PART}>
      <Head kicker="CYBERSECURITY" title="主动调弱的那一刀" sub="开源版删掉了网络安全数据" />
      {/* beat 0: capability rises with post-training (illustrative) */}
      <div style={{position: 'absolute', left: 96, top: 250, ...rise(b[0], 0)}}>
        <Panel style={{width: 640, height: 210, padding: '18px 26px', position: 'relative'}}>
          <Zh size={24} w={800}>
            后训练越多 → 漏洞利用能力越强
          </Zh>
          <Illus style={{position: 'absolute', right: 20, top: 20}} />
          <svg width={590} height={130} style={{position: 'absolute', left: 26, top: 64}}>
            <line x1={10} y1={120} x2={580} y2={120} stroke={K.dim} strokeWidth={2} />
            <polyline
              points={Array.from({length: 30}, (_, i) => `${10 + i * 19 * prog(b[0], 40, 6)},${118 - i * 3.4 - Math.sin(i * 1.3) * 4}`).join(' ')}
              fill="none"
              stroke={K.warn}
              strokeWidth={5}
            />
            <text x={430} y={140} fill={K.faint} fontSize={16} fontFamily="Noto Sans SC">
              后训练规模 →
            </text>
          </svg>
        </Panel>
      </div>
      {/* beat 1-2: where it comes from, and the removal */}
      <div style={{position: 'absolute', left: 96, top: 490, display: 'flex', gap: 24}}>
        {['中期训练语料', 'RL 环境'].map((t, k) => (
          <div key={t} style={rise(b[1], k * 10)}>
            <Panel style={{width: 308, height: 300, padding: '18px 22px', position: 'relative', overflow: 'hidden'}}>
              <Zh size={26} w={900}>
                {t}
              </Zh>
              <svg width={270} height={200} style={{position: 'absolute', left: 18, top: 70}}>
                {Array.from({length: 48}, (_, i) => {
                  const cyber = i % 7 === 3;
                  const x = (i % 8) * 33 + 16;
                  const y = Math.floor(i / 8) * 32 + 16;
                  const fly = cyber ? out : 0;
                  return (
                    <rect
                      key={i}
                      x={x - 10 + fly * (rnd(i + k * 50) - 0.5) * 120}
                      y={y - 10 - fly * 220}
                      width={20}
                      height={20}
                      rx={4}
                      fill={cyber ? K.red : K.grey2}
                      opacity={(cyber ? 1 - fly : 0.75) * prog(b[1], 10, 6 + i * 0.4)}
                    />
                  );
                })}
              </svg>
              <div style={{position: 'absolute', left: 22, bottom: 14, opacity: prog(b[1], 12, 30)}}>
                <Zh size={18} w={700} color={K.red}>
                  ■ 网络安全相关数据
                </Zh>
              </div>
            </Panel>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 96, top: 800, display: 'flex', gap: 14, ...rise(b[2], 30)}}>
        <Chip color={K.red}>两个阶段都删掉</Chip>
        <Chip color={K.green}>保留通用编程任务</Chip>
      </div>

      {/* beat 3-4: xdev-bench-hard */}
      <div style={{position: 'absolute', left: 790, top: 250, ...rise(b[3], 0)}}>
        <Panel style={{width: 1040, height: 600, padding: '22px 30px', position: 'relative'}}>
          <Zh size={26} w={900}>
            xdev-bench-hard（内部 · pass@3 · 漏洞发现与利用）
          </Zh>
          {XDEV.map((r, i) => {
            const f = b[r.beat] - (r.beat === 4 ? (i === 5 ? 0 : 30 + i * 6) : i * 10);
            const g = prog(f, 26);
            const y = 108 + i * 70;
            const color = r.hero ? K.hero : r.tone;
            return (
              <div key={r.n} style={{position: 'absolute', left: 30, top: y, width: 1000, height: 62, opacity: prog(f, 10)}}>
                <div style={{position: 'absolute', left: 0, width: 330, textAlign: 'right', top: 4}}>
                  <Zh size={r.hero ? 26 : 22} w={r.hero ? 900 : 700} color={r.hero ? K.ink : K.dim} style={{whiteSpace: 'nowrap'}}>
                    {r.n}
                  </Zh>
                  {r.s && (
                    <Mo size={15} color={K.faint} style={{display: 'block'}}>
                      {r.s}
                    </Mo>
                  )}
                </div>
                <div style={{position: 'absolute', left: x0 - 790 - 30, top: 10, width: (r.v / 100) * W * g, height: 40, background: color, borderRadius: '0 6px 6px 0', boxShadow: r.hero ? `0 0 24px ${K.hero}55` : undefined}} />
                <div style={{position: 'absolute', left: x0 - 790 - 30 + (r.v / 100) * W * g + 14, top: 12}}>
                  <Num size={r.hero ? 38 : 30} color={r.hero ? K.hero : K.ink}>
                    {fmt(count(f, r.v, 26), 1)}
                  </Num>
                </div>
              </div>
            );
          })}
          {/* the cut: 90.5 -> 81.0 */}
          <div style={{position: 'absolute', right: 30, top: 60, ...pop(b[3], 44, 0.5)}}>
            <Chip color={K.warn}>删数据：90.5 → 81.0（−9.5）</Chip>
          </div>
          <div style={{position: 'absolute', left: 30, right: 30, bottom: 18, ...rise(b[4], 60)}}>
            <Zh size={20} w={700} color={K.dim}>
              官方：仍落后于已公开至少三个月的闭源前沿模型
            </Zh>
          </div>
        </Panel>
      </div>
      {/* beat 5: principle */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          background: `rgba(7,9,13,${0.9 * prog(b[5], 16)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{...pop(b[5], 6, 0.9), textAlign: 'center', maxWidth: 1400}}>
          <Mo size={24} color={K.warn} style={{letterSpacing: 3}}>
            OPEN-WEIGHT PRINCIPLE
          </Mo>
          <div style={{marginTop: 18}}>
            <Zh size={64} w={900} style={{letterSpacing: -1}}>
              开源权重，不推高网络攻击能力的
              <span style={{color: K.warn}}>绝对前沿</span>
            </Zh>
          </div>
          <div style={{marginTop: 18}}>
            <Zh size={28} w={600} color={K.dim}>
              “not release open weights that would extend the absolute frontier of cyber capability”
            </Zh>
          </div>
        </div>
      </div>
      <SrcLine f={b[0]}>来源：K3.1 Pro 官方博客 · Cybersecurity（xdev-bench-hard 图；未降风险版本 90.5% → 发布版 81.0%）</SrcLine>
      {frame < 0 && lerp(0, 0, 0)}
    </Shell>
  );
};
