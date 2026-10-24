// Cover, "what it is" and the outro. Cover and outro sit on the mountain landscape (Kimi's K3.1 hero), the rest on cards.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats, useScene} from '@atv/lib/timing';
import {Chip, clamp01, count, fmt, FONT_SERIF, Head, K, lerp, Mo, Mountains, Num, Panel, prog, rise, Shell, SrcLine, usePopIn, Zh} from './common';

/** Frosted white card that floats over the mountains. */
const Float: React.FC<{children: React.ReactNode; style?: React.CSSProperties; glow?: string}> = ({children, style, glow}) => (
  <Panel glow={glow} style={{background: 'rgba(255,255,255,0.9)', boxShadow: '0 18px 50px rgba(30,50,65,0.18)', ...style}}>
    {children}
  </Panel>
);

const useLandscape = (dim = 0) => {
  const frame = useCurrentFrame();
  const scene = useScene();
  return <Mountains t={frame / 30} push={frame / scene.duration} dim={dim} />;
};

// ------------------------------------------------------------------ cover
export const Cover: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const t = prog(frame, 26, 4);
  // beat 2: the knob turns down 90.5 -> 81.0
  const k = prog(b[2], 40, 14);
  const knobV = lerp(90.5, 81.0, k);
  const ang = lerp(-130, 130, knobV / 100);
  return (
    <Shell backdrop={useLandscape()}>
      <div style={{position: 'absolute', left: 110, top: 130}}>
        <div style={{...rise(frame, 0)}}>
          <Chip color={K.ink} style={{background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(0,0,0,0.12)'}}>
            月之暗面 · 2026.10.23 发布
          </Chip>
        </div>
        <div style={{marginTop: 22, opacity: t, transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${(1 - t) * 8}px)`}}>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: 138, color: K.ink, letterSpacing: -4, lineHeight: 1.0}}>
            Kimi
            <br />
            <span style={{color: K.hero}}>K3.1 Pro</span>
          </div>
        </div>
        <div style={{marginTop: 24, ...rise(frame, 12)}}>
          <Zh size={38} w={600} color="#3E4A54">
            三万亿参数级 · 开源权重 · 1M 上下文
          </Zh>
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 650, ...rise(b[0], 4)}}>
        <Float style={{padding: '26px 38px', display: 'flex', gap: 56}}>
          {[
            {n: count(b[0], 2.78, 34), d: 2, u: '万亿', l: '总参数'},
            {n: count(b[0] - 6, 1042, 34), d: 0, u: '亿', l: '每 token 激活'},
            {n: count(b[0] - 12, 1, 20), d: 0, u: 'M', l: '上下文 token'},
          ].map((s, i) => (
            <div key={s.l} style={rise(b[0], 6 + i * 6)}>
              <Num size={62} color={K.ink}>
                {fmt(s.n, s.d)}
                <span style={{fontSize: 28, color: K.dim, marginLeft: 6}}>{s.u}</span>
              </Num>
              <div style={{marginTop: 6}}>
                <Zh size={21} w={500} color={K.dim}>
                  {s.l}
                </Zh>
              </div>
            </div>
          ))}
        </Float>
      </div>

      {/* right: two teaser cards */}
      <div style={{position: 'absolute', left: 1080, top: 200, width: 740}}>
        <div style={pop(b[1], 0)}>
          <Float style={{padding: '24px 34px 28px'}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
              <Zh size={24} w={800}>
                Terminal-Bench 4.0
              </Zh>
              <Zh size={17} w={500} color={K.faint}>
                Opus 为 with fallback
              </Zh>
            </div>
            <div style={{height: 1, background: K.line, margin: '14px 0 4px'}} />
            {[
              {n: 'Claude Opus 5.5', v: 66.4, hero: false},
              {n: 'Kimi K3.1 Pro', v: 65.7, hero: true},
            ].map((r, i) => {
              const g = prog(b[1], 28, 6 + i * 5);
              return (
                <div key={r.n} style={{display: 'flex', alignItems: 'center', marginTop: 16, gap: 18}}>
                  <div style={{width: 200, textAlign: 'right'}}>
                    <Zh size={23} w={r.hero ? 800 : 500}>
                      {r.n}
                    </Zh>
                  </div>
                  <div style={{width: (r.v / 70) * 380 * g, height: 30, borderRadius: 6, background: r.hero ? K.hero : K.grey}} />
                  <Num size={30} color={r.hero ? K.hero : K.ink}>
                    {fmt(count(b[1] - 6 - i * 5, r.v, 28), 1)}
                  </Num>
                </div>
              );
            })}
            <div style={{marginTop: 16, marginLeft: 218, opacity: prog(b[1], 12, 40)}}>
              <Chip color={K.ink}>只差 0.7</Chip>
            </div>
          </Float>
        </div>

        <div style={{marginTop: 26, ...pop(b[2], 0)}}>
          <Float glow={K.warn} style={{padding: '22px 34px', display: 'flex', alignItems: 'center', gap: 30}}>
            <svg width={160} height={140} viewBox="-85 -85 170 150">
              <path d={arc(70, -130, 130)} stroke={K.grey} strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d={arc(70, -130, ang)} stroke={K.warn} strokeWidth={12} fill="none" strokeLinecap="round" />
              <line x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 180) * 54} y2={-Math.cos((ang * Math.PI) / 180) * 54} stroke={K.ink} strokeWidth={6} strokeLinecap="round" />
              <circle r={10} fill={K.ink} />
            </svg>
            <div>
              <Zh size={32} w={700}>
                有一项能力，被故意调低了
              </Zh>
              <div style={{marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 14}}>
                <Num size={54} color={K.warn}>
                  {fmt(knobV, 1)}%
                </Num>
                <Zh size={21} w={500} color={K.dim} style={{opacity: prog(b[2], 12, 50)}}>
                  ← 不删数据版 90.5%
                </Zh>
              </div>
              <Zh size={19} w={500} color={K.faint}>
                内部漏洞利用测试 · pass@3 · 第四部分细讲
              </Zh>
            </div>
          </Float>
        </div>
      </div>
      <SrcLine f={b[0]} color="#3A4752" halo>
        来源：Kimi K3.1 Pro 官方技术博客（2026-10-23）· Kimi K3 技术报告 · 跑分为官方自报
      </SrcLine>
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
  const box = (label: React.ReactNode, sub: React.ReactNode, color: string | undefined, f: number, w = 430) => (
    <div style={pop(f, 0, 0.8)}>
      <Panel glow={color} style={{width: w, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10}}>
        {label}
        <Zh size={23} w={500} color={K.dim}>
          {sub}
        </Zh>
      </Panel>
    </div>
  );
  const op = (f: number, c: string) => (
    <div style={{opacity: prog(f, 10), width: 70, textAlign: 'center'}}>
      <Num size={70} color={K.faint}>
        {c}
      </Num>
    </div>
  );
  // the two sources slide in after the equation has landed (no narration of their own)
  const docs = b[0] + 66;
  return (
    <Shell part="它是什么">
      <Head kicker="WHAT IT IS" title="没有换底座" sub="K3.1 Pro = K3 + 更重的后训练" />
      <div style={{position: 'absolute', left: 96, top: 260, display: 'flex', alignItems: 'center', gap: 22}}>
        {box(
          <Num size={74} color={K.hero2}>
            K3
          </Num>,
          '底座：2.78 万亿参数',
          undefined,
          b[0],
        )}
        {op(b[0], '+')}
        {box(
          <Zh size={44} w={700}>
            大得多的后训练
          </Zh>,
          '后训练算力大幅增加',
          undefined,
          b[0] - 12,
        )}
        {op(b[0] - 22, '=')}
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
      <div style={{position: 'absolute', left: 96, top: 540, display: 'flex', gap: 30}}>
        {[
          {doc: 'Kimi K3 技术报告', what: '架构 · 预训练 · 后训练方法', c: K.hero2},
          {doc: 'K3.1 Pro 官方博客', what: '新能力 · 跑分 · 安全取舍', c: K.hero},
        ].map((d, i) => (
          <div key={d.doc} style={rise(docs, i * 8)}>
            <Panel style={{width: 600, padding: '30px 30px', display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{width: 52, height: 66, borderRadius: 6, border: `2px solid ${d.c}`, position: 'relative', background: K.panel}}>
                {[0, 1, 2].map((l) => (
                  <div key={l} style={{position: 'absolute', left: 9, right: 9, top: 14 + l * 14, height: 3.5, borderRadius: 2, background: `${d.c}66`}} />
                ))}
              </div>
              <div>
                <Zh size={32} w={700}>
                  {d.doc}
                </Zh>
                <div>
                  <Zh size={23} w={600} color={d.c}>
                    → {d.what}
                  </Zh>
                </div>
              </div>
            </Panel>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 1360, top: 520, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={pop(b[1], 0)}>
          <Panel style={{width: 460, padding: '16px 26px'}}>
            <Zh size={22} w={600} color={K.dim}>
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
        <div style={pop(b[1], 40)}>
          <Panel style={{width: 460, padding: '16px 26px'}}>
            <Zh size={22} w={600} color={K.dim}>
              完整权重
            </Zh>
            <div>
              <Zh size={40} w={700}>
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
    <Shell part="收尾" backdrop={useLandscape()}>
      <Head kicker="SUMMARY" title="一句话总结" rule={false} />
      <div style={{position: 'absolute', left: 96, top: 230}}>
        <Zh size={26} w={700} color={K.hero2} style={{...rise(b[0], 0)}}>
          底座 K3
        </Zh>
        <div style={{display: 'flex', gap: 22, marginTop: 12}}>
          {pillars.map((x, i) => (
            <div key={x.t} style={pop(b[0], 8 + i * 7)}>
              <Float style={{width: 330, padding: '30px 28px'}}>
                <Zh size={40} w={700}>
                  {x.t}
                </Zh>
                <div>
                  <Mo size={21} color={K.hero2}>
                    {x.s}
                  </Mo>
                </div>
              </Float>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, top: 500, display: 'flex', gap: 22}}>
        <div style={rise(b[1], 0)}>
          <Float glow={K.hero} style={{width: 620, padding: '26px 32px'}}>
            <Zh size={23} w={700} color={K.hero}>
              多项追近闭源
            </Zh>
            <div>
              <Zh size={36} w={700}>
                编程 · 智能体 · 3D · 金融
              </Zh>
            </div>
          </Float>
        </div>
        <div style={rise(b[1], 30)}>
          <Float style={{width: 432, padding: '26px 32px'}}>
            <Zh size={23} w={700} color={K.dim}>
              仍有差距
            </Zh>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
              <Zh size={36} w={700}>
                知识推理
              </Zh>
              <Mo size={19} color={K.dim}>
                HLE · ProgramBench
              </Mo>
            </div>
          </Float>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1270, top: 230, width: 556}}>
        <div style={pop(b[2], 0)}>
          <Float glow={K.warn} style={{padding: '34px 34px'}}>
            <Zh size={23} w={700} color={K.warn}>
              注意
            </Zh>
            <div>
              <Zh size={32} w={700}>
                多数分数为官方自测
              </Zh>
            </div>
            <div style={{marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 12}}>
              <Zh size={40} w={700}>
                11 月 4 日前
              </Zh>
              <Zh size={24} w={600} color={K.dim}>
                放出完整权重
              </Zh>
            </div>
          </Float>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 730, textAlign: 'center', ...rise(b[2], 50)}}>
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 50,
            fontWeight: 700,
            color: K.ink,
            letterSpacing: 1,
            textShadow: '0 0 18px rgba(255,255,255,0.95), 0 0 40px rgba(255,255,255,0.8)',
            opacity: clamp01(1),
          }}
        >
          开源追近闭源，攻击能力主动收着放
        </span>
      </div>
      <SrcLine f={b[0]} color="#3A4752" halo>
        来源：Kimi K3 技术报告 · K3.1 Pro 官方博客（多数跑分为官方自报，部分为内部测试）
      </SrcLine>
      {frame < 0 && null}
    </Shell>
  );
};
