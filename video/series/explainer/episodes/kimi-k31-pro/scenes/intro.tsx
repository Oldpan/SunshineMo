// Cover, "what it is" and the outro.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Chip, clamp01, count, fmt, Head, K, lerp, Mo, Num, Panel, prog, rise, Shell, SrcLine, usePopIn, Zh} from './common';

// ------------------------------------------------------------------ cover
export const Cover: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const t = prog(frame, 22, 4);
  // beat 2: the knob turns down 90.5 -> 81.0
  const k = prog(b[2], 40, 14);
  const knobV = lerp(90.5, 81.0, k);
  const ang = lerp(-130, 130, knobV / 100);
  return (
    <Shell part="KIMI K3.1 PRO">
      <div style={{position: 'absolute', left: 110, top: 220}}>
        <div style={{...rise(frame, 0)}}>
          <Chip color={K.hero}>月之暗面 · 2026.10.23 发布</Chip>
        </div>
        <div style={{marginTop: 26, opacity: t, transform: `translateY(${(1 - t) * 30}px)`}}>
          <div style={{fontFamily: '"Montserrat", sans-serif', fontWeight: 900, fontSize: 132, color: K.ink, letterSpacing: -4, lineHeight: 0.95}}>
            Kimi
            <br />
            <span style={{color: K.hero, textShadow: `0 0 40px ${K.hero}66`}}>K3.1 Pro</span>
          </div>
        </div>
        <div style={{marginTop: 28, ...rise(frame, 12)}}>
          <Zh size={40} w={800} color={K.dim}>
            三万亿参数级 · 开源权重 · 1M 上下文
          </Zh>
        </div>
        <div style={{marginTop: 46, display: 'flex', gap: 54}}>
          {[
            {n: count(b[0], 2.78, 34), d: 2, u: '万亿', l: '总参数'},
            {n: count(b[0] - 6, 1042, 34), d: 0, u: '亿', l: '每 token 激活'},
            {n: count(b[0] - 12, 1, 20), d: 0, u: 'M', l: '上下文 token'},
          ].map((s, i) => (
            <div key={s.l} style={rise(b[0], 6 + i * 6)}>
              <Num size={64} color={K.ink}>
                {fmt(s.n, s.d)}
                <span style={{fontSize: 30, color: K.dim, marginLeft: 6}}>{s.u}</span>
              </Num>
              <div>
                <Zh size={22} w={600} color={K.faint}>
                  {s.l}
                </Zh>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* right: two teaser panels */}
      <div style={{position: 'absolute', left: 1060, top: 220, width: 770}}>
        <div style={pop(b[1], 0)}>
          <Panel style={{padding: '26px 34px 30px'}}>
            <Zh size={26} w={800} color={K.dim}>
              Terminal-Bench 4.0
            </Zh>
            {[
              {n: 'Claude Opus 5.5', v: 66.4, hero: false},
              {n: 'Kimi K3.1 Pro', v: 65.7, hero: true},
            ].map((r, i) => {
              const g = prog(b[1], 28, 6 + i * 5);
              return (
                <div key={r.n} style={{display: 'flex', alignItems: 'center', marginTop: 18, gap: 18}}>
                  <div style={{width: 210, textAlign: 'right'}}>
                    <Zh size={24} w={r.hero ? 900 : 700} color={r.hero ? K.ink : K.dim}>
                      {r.n}
                    </Zh>
                  </div>
                  <div style={{width: (r.v / 70) * 400 * g, height: 34, borderRadius: '0 6px 6px 0', background: r.hero ? K.hero : K.grey2, boxShadow: r.hero ? `0 0 22px ${K.hero}55` : undefined}} />
                  <Num size={34} color={r.hero ? K.hero : K.ink}>
                    {fmt(count(b[1] - 6 - i * 5, r.v, 28), 1)}
                  </Num>
                </div>
              );
            })}
            <div style={{marginTop: 16, marginLeft: 228, opacity: prog(b[1], 12, 40)}}>
              <Chip color={K.ink}>只差 0.7</Chip>
            </div>
          </Panel>
        </div>

        <div style={{marginTop: 30, ...pop(b[2], 0)}}>
          <Panel glow={K.warn} style={{padding: '24px 34px', display: 'flex', alignItems: 'center', gap: 34}}>
            <svg width={170} height={150} viewBox="-85 -85 170 150">
              <path d={arc(70, -130, 130)} stroke={K.grey} strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d={arc(70, -130, ang)} stroke={K.warn} strokeWidth={12} fill="none" strokeLinecap="round" />
              <line x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 180) * 54} y2={-Math.cos((ang * Math.PI) / 180) * 54} stroke={K.ink} strokeWidth={6} strokeLinecap="round" />
              <circle r={10} fill={K.ink} />
            </svg>
            <div>
              <Zh size={30} w={900}>
                有一项能力，被故意调低了
              </Zh>
              <div style={{marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 14}}>
                <Num size={56} color={K.warn}>
                  {fmt(knobV, 1)}%
                </Num>
                <Zh size={22} w={600} color={K.dim} style={{opacity: prog(b[2], 12, 50)}}>
                  ← 原本 90.5%
                </Zh>
              </div>
              <Zh size={20} w={600} color={K.faint}>
                内部漏洞利用测试 · 第四部分细讲
              </Zh>
            </div>
          </Panel>
        </div>

        <div style={{marginTop: 30, display: 'flex', gap: 14}}>
          {['底座 K3', '后训练', '跑分', '调弱的一刀'].map((c, i) => (
            <div key={c} style={pop(b[3], i * 5, 0.6)}>
              <Chip color={i === 3 ? K.warn : K.hero}>{c}</Chip>
            </div>
          ))}
        </div>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3.1 Pro 官方技术博客（2026-10-23）· Kimi K3 技术报告 · 跑分为官方自报</SrcLine>
    </Shell>
  );
};

/** SVG arc path, angles in degrees clockwise from 12 o'clock. */
export const arc = (r: number, a0: number, a1: number) => {
  const pt = (a: number) => [Math.sin((a * Math.PI) / 180) * r, -Math.cos((a * Math.PI) / 180) * r];
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

// ------------------------------------------------------------------ what it is
export const Whatis: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const box = (label: React.ReactNode, sub: React.ReactNode, color: string, f: number, w = 430) => (
    <div style={pop(f, 0, 0.8)}>
      <Panel glow={color} style={{width: w, height: 210, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10}}>
        {label}
        <Zh size={24} w={600} color={K.dim}>
          {sub}
        </Zh>
      </Panel>
    </div>
  );
  const op = (f: number) => (
    <div style={{opacity: prog(f, 10), width: 70, textAlign: 'center'}}>
      <Num size={70} color={K.dim}>
        {'+'}
      </Num>
    </div>
  );
  return (
    <Shell part="它是什么">
      <Head kicker="WHAT IT IS" title="没有换底座" sub="K3.1 Pro = K3 + 更重的后训练" />
      <div style={{position: 'absolute', left: 96, top: 290, display: 'flex', alignItems: 'center', gap: 22}}>
        {box(
          <Num size={74} color={K.hero2}>
            K3
          </Num>,
          '底座：2.78 万亿参数',
          K.hero2,
          b[0],
        )}
        {op(b[0] + 0)}
        {box(
          <Zh size={44} w={900}>
            大得多的后训练
          </Zh>,
          '后训练算力大幅增加',
          K.ink,
          b[0] - 12,
        )}
        <div style={{opacity: prog(b[0], 10, 22), width: 70, textAlign: 'center'}}>
          <Num size={70} color={K.dim}>
            =
          </Num>
        </div>
        {box(
          <Num size={64} color={K.hero}>
            K3.1 Pro
          </Num>,
          'K3.1 系列第一款',
          K.hero,
          b[0] - 26,
          470,
        )}
      </div>
      {/* where to read what */}
      <div style={{position: 'absolute', left: 96, top: 580, display: 'flex', gap: 30}}>
        {[
          {doc: 'Kimi K3 技术报告', what: '架构 · 预训练 · 后训练方法', c: K.hero2},
          {doc: 'K3.1 Pro 官方博客', what: '新能力 · 跑分 · 安全取舍', c: K.hero},
        ].map((d, i) => (
          <div key={d.doc} style={rise(b[1], i * 8)}>
            <Panel style={{width: 600, padding: '34px 30px', display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{width: 54, height: 68, borderRadius: 6, border: `2.5px solid ${d.c}`, position: 'relative'}}>
                {[0, 1, 2].map((l) => (
                  <div key={l} style={{position: 'absolute', left: 9, right: 9, top: 14 + l * 14, height: 4, borderRadius: 2, background: `${d.c}88`}} />
                ))}
              </div>
              <div>
                <Zh size={32} w={900}>
                  {d.doc}
                </Zh>
                <div>
                  <Zh size={24} w={600} color={d.c}>
                    → {d.what}
                  </Zh>
                </div>
              </div>
            </Panel>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 1360, top: 560, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={pop(b[2], 0)}>
          <Panel style={{width: 460, padding: '16px 26px'}}>
            <Zh size={22} w={700} color={K.dim}>
              K3.1 Pro Highspeed
            </Zh>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
              <Num size={52} color={K.hero}>
                2–3×
              </Num>
              <Zh size={24} w={700}>
                速度
              </Zh>
            </div>
          </Panel>
        </div>
        <div style={pop(b[2], 26)}>
          <Panel style={{width: 460, padding: '16px 26px'}}>
            <Zh size={22} w={700} color={K.dim}>
              完整权重
            </Zh>
            <div>
              <Zh size={40} w={900}>
                11 月 4 日前开放
              </Zh>
            </div>
          </Panel>
        </div>
      </div>
      <SrcLine f={b[0]}>来源：K3.1 Pro 官方博客（“a post-trained version of Kimi K3”）· Kimi K3 技术报告</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ outro
export const Outro: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const pillars = [
    {t: '混合注意力', s: '3 KDA : 1 MLA'},
    {t: '注意力残差', s: '按块挑着读'},
    {t: '超稀疏专家', s: '896 选 16'},
  ];
  return (
    <Shell part="收尾">
      <Head kicker="SUMMARY" title="一句话总结" />
      <div style={{position: 'absolute', left: 96, top: 270}}>
        <Zh size={30} w={800} color={K.hero2} style={{...rise(b[0], 0)}}>
          底座 K3
        </Zh>
        <div style={{display: 'flex', gap: 22, marginTop: 14}}>
          {pillars.map((x, i) => (
            <div key={x.t} style={pop(b[0], 8 + i * 7)}>
              <Panel style={{width: 340, padding: '34px 28px'}}>
                <Zh size={40} w={900}>
                  {x.t}
                </Zh>
                <div>
                  <Mo size={22} color={K.hero2}>
                    {x.s}
                  </Mo>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, top: 580, display: 'flex', gap: 22}}>
        <div style={rise(b[1], 0)}>
          <Panel glow={K.hero} style={{width: 640, padding: '30px 34px'}}>
            <Zh size={24} w={700} color={K.hero}>
              追近闭源
            </Zh>
            <div>
              <Zh size={36} w={900}>
                编程 · 智能体 · 3D · 金融
              </Zh>
            </div>
          </Panel>
        </div>
        <div style={rise(b[1], 18)}>
          <Panel style={{width: 400, padding: '30px 34px'}}>
            <Zh size={24} w={700} color={K.dim}>
              还差一截
            </Zh>
            <div>
              <Zh size={36} w={900}>
                知识推理
              </Zh>
            </div>
          </Panel>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1228, top: 310, width: 600}}>
        <div style={pop(b[2], 0)}>
          <Panel glow={K.warn} style={{padding: '40px 36px'}}>
            <Zh size={24} w={700} color={K.warn}>
              注意
            </Zh>
            <div>
              <Zh size={30} w={800}>
                多数分数为官方自测
              </Zh>
            </div>
            <div style={{marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 14}}>
              <Num size={60} color={K.ink}>
                11.4
              </Num>
              <Zh size={26} w={700} color={K.dim}>
                前放出完整权重
              </Zh>
            </div>
          </Panel>
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, top: 790, ...rise(b[2], 50)}}>
        <Zh size={44} w={900}>
          开源追近闭源，<span style={{color: K.warn}}>攻击能力主动收着放</span>
        </Zh>
      </div>
      {/* closing sweep of light */}
      <div
        style={{
          position: 'absolute',
          left: -400 + clamp01((frame - (b[2] + 60)) / 50) * 2700,
          top: 0,
          width: 260,
          height: 1080,
          background: `linear-gradient(90deg, transparent, ${K.hero}22, transparent)`,
          transform: 'skewX(-18deg)',
        }}
      />
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 · K3.1 Pro 官方博客（多数跑分为官方自报，部分为内部测试）</SrcLine>
    </Shell>
  );
};
