// Background (what came before), the authors' limits + five future directions, and the outro (released logs/model/demo).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Big, Card, D, Head, Lab, Mark, Mo, prog, rise, Shell, SrcLine, WeightWall, Zh} from './common';

// ------------------------------------------------------------------ related work
const Cell: React.FC<{f: number; children: React.ReactNode; hot?: boolean; h?: number}> = ({f, children, hot, h = 190}) => (
  <div style={{...rise(f, 0, 14)}}>
    <Card tint={hot ? D.answer : undefined} style={{height: h, padding: '22px 28px', boxSizing: 'border-box', borderColor: hot ? D.green : D.border, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10}}>
      {children}
    </Card>
  </div>
);

export const Related: React.FC = () => {
  const b = useBeats();
  const f = useCurrentFrame();
  const rowHead = (t: string, sub: string) => (
    <div style={{width: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <Zh size={44} w={800} color={D.green}>
        {t}
      </Zh>
      <Zh size={22} w={500} color={D.dim}>
        {sub}
      </Zh>
    </div>
  );
  const scaleP = prog(b[3], 50, 6);
  return (
    <Shell part="放到更大的背景里">
      <Head kicker="Background · 背景" title="以前怎么读、怎么写一个网络" />
      <div style={{position: 'absolute', left: 96, top: 230, width: 1728}}>
        <div style={{display: 'flex', gap: 24, marginLeft: 224, marginBottom: 14}}>
          <div style={{width: 740}}>
            <Lab size={22}>以前</Lab>
          </div>
          <div style={{width: 740, opacity: prog(b[2], 12)}}>
            <Lab size={22}>这篇博客</Lab>
          </div>
        </div>
        {[
          ['读', '看懂它在干嘛', '专门打造的可解释性工具', '追踪电路、特征，再手动改权重', b[0]],
          ['写', '让它学会本事', '训练（喂数据、算梯度）', '或者专门训练出来、会生成权重的模型', b[1]],
        ].map(([t, sub, a, a2, bf], i) => (
          <div key={t as string} style={{display: 'flex', gap: 24, marginBottom: 24, opacity: (bf as number) > -1 ? 1 : 0.18}}>
            {rowHead(t as string, sub as string)}
            <div style={{width: 740}}>
              <Cell f={bf as number}>
                <Zh size={32} w={700}>
                  {a as string}
                </Zh>
                <Zh size={24} w={500} color={D.dim}>
                  {i === 0 ? '或者：专门训练来读激活、读权重的模型' : (a2 as string)}
                </Zh>
              </Cell>
            </div>
            <div style={{width: 740}}>
              <Cell f={b[2] - i * 8} hot>
                <Zh size={32} w={700}>
                  <Mark p={prog(b[2], 18, 10 + i * 8)}>通用前沿大模型，原样拿来</Mark>
                </Zh>
                <Zh size={24} w={500} color={D.dim}>
                  {i === 0 ? '没为这件事专门训练，直接看数字' : '不训练、不算梯度，直接改数字'}
                </Zh>
              </Cell>
            </div>
          </div>
        ))}
        <div style={{marginTop: 18, ...rise(b[3], 0)}}>
          <Card style={{padding: '24px 32px'}}>
            <Zh size={24} w={700} color={D.dim}>
              这篇里被读写的网络，规模跨了几个数量级（横轴按对数）
            </Zh>
            <svg width={1660} height={120} style={{marginTop: 10}}>
              <line x1={20} y1={60} x2={20 + 1600 * scaleP} y2={60} stroke={D.green} strokeWidth={6} />
              {[
                [0.0, '17 万个权重', '直接当文本给'],
                [1.0, '8 亿参数', 'Qwen3.5-0.8B，配工具'],
              ].map(([x, l, s], i) => {
                const op = prog(b[3], 12, i * 40);
                const X = 20 + 1600 * (x as number);
                return (
                  <g key={i} opacity={op}>
                    <circle cx={X} cy={60} r={14} fill={D.green} />
                    <text x={X + (i ? -24 : 30)} y={44} textAnchor={i ? 'end' : 'start'} fontFamily='"Noto Sans SC"' fontSize={34} fontWeight={800} fill={D.ink}>
                      {l as string}
                    </text>
                    <text x={X + (i ? -24 : 30)} y={100} textAnchor={i ? 'end' : 'start'} fontFamily='"Noto Sans SC"' fontSize={24} fontWeight={500} fill={D.dim}>
                      {s as string}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Card>
        </div>
      </div>
      <SrcLine f={f}>原文 · Background and Related Works</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ future
const DIRS: [string, string, string][] = [
  ['不跑评测就审查', '直接从权重里找出后门这类问题', '以前只能靠专门的测试集，甚至上线后才发现'],
  ['省掉大量训练', '比如一次写好模型的初始化', '不用从随机数开始慢慢练'],
  ['不收集数据就增删能力', '只动很少的权重', '别的能力不会被忘掉'],
  ['模型改自己', '检查、调试、改进自己的权重', ''],
  ['跨结构移植电路', '把一个模型里的电路搬进另一种结构', '两个模型结构可以完全不同'],
];

export const Future: React.FC = () => {
  const b = useBeats();
  const f = useCurrentFrame();
  const limP = prog(b[0], 14);
  const shrink = prog(b[1], 20);
  return (
    <Shell part="接下来">
      <Head kicker="Conclusion · 结论" title="现在还有限，但作者看到了五个方向" />
      {/* limits strip */}
      <div style={{position: 'absolute', left: 96, top: 222, width: 1728, opacity: limP * (1 - prog(b[7], 14)), transform: `translateY(${(1 - limP) * 20}px)`}}>
        <Card tint={D.panel} style={{padding: shrink > 0.5 ? '14px 26px' : '26px 32px', display: 'flex', alignItems: 'center', gap: 28}}>
          <Lab size={22} color={D.orange}>
            现在卡在哪
          </Lab>
          {['上下文长度：一次能塞进去的数字有限', 'harness：给它的工具和流程还不够顺手'].map((t, i) => (
            <div key={t} style={{...rise(b[0], 10 + i * 12, 8)}}>
              <Zh size={shrink > 0.5 ? 25 : 30} w={600}>
                · {t}
              </Zh>
            </div>
          ))}
        </Card>
      </div>
      {/* five directions */}
      <div style={{position: 'absolute', left: 96, top: 340, width: 1728, display: 'flex', flexDirection: 'column', gap: 14, ...rise(b[1], 0)}}>
        {DIRS.map(([t, s, s2], i) => {
          const bf = b[2 + i];
          const on = bf > -1;
          const active = on && (i === 4 ? b[7] < 0 : b[3 + i] < 0);
          return (
            <div key={t} style={{opacity: on ? 1 : 0.28, transition: 'none'}}>
              <Card tint={active ? D.answer : undefined} style={{padding: '14px 26px', display: 'flex', alignItems: 'center', gap: 26, borderColor: active ? D.green : D.border, height: 92, boxSizing: 'border-box'}}>
                <Big size={44} color={on ? D.green : D.faint} style={{width: 50}}>
                  {i + 1}
                </Big>
                <Zh size={32} w={800} style={{width: 420}}>
                  {t}
                </Zh>
                <div style={{opacity: prog(bf, 12, 6)}}>
                  <Zh size={27} w={600}>
                    {active ? <Mark p={prog(bf, 18, 10)}>{s}</Mark> : s}
                  </Zh>
                  {s2 && (
                    <Zh size={21} w={500} color={D.dim} style={{display: 'block'}}>
                      {s2}
                    </Zh>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      {b[7] > 0 && (
        <div style={{position: 'absolute', left: 96, top: 212, width: 1728, ...rise(b[7], 0)}}>
          <Card tint={D.answer} style={{padding: '12px 28px', display: 'flex', alignItems: 'baseline', gap: 24, borderColor: D.green, boxShadow: '0 24px 60px rgba(0,0,0,0.12)'}}>
            <Lab size={20}>正在做</Lab>
            <Zh size={30} w={800}>
              权重空间编程的基准 + harness
            </Zh>
            <Zh size={22} w={500} color={D.dim}>
              让这件事能统一测量、能复现
            </Zh>
          </Card>
        </div>
      )}
      <SrcLine f={f}>原文 · Conclusion and Future Directions</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ outro
const LINKS: [string, string, string][] = [
  ['全部实验日志', 'github.com/RikiyaT/lm_understand-logs', '发给 Astra 的、它回的、跑过的代码、读写过的网络'],
  ['改好的 Qwen3.5-0.8B', 'huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming', '实验 8 的那个模型'],
  ['在线 Demo', 'huggingface.co/spaces/akhaliq/weight-space-programming-demo', 'Hugging Face 照日志重建并重跑评测'],
];

export const Outro: React.FC = () => {
  const b = useBeats();
  const f = useCurrentFrame();
  const end = prog(b[1], 18);
  return (
    <Shell part="资源">
      <Head kicker="Resources · 资源" title="日志、模型、Demo 都公开了" />
      <div style={{position: 'absolute', right: 60, top: 200, opacity: 0.35 * (1 - end * 0.5)}}>
        <WeightWall w={560} h={700} size={20} scroll={f * 0.6} markP={0} />
      </div>
      <div style={{position: 'absolute', left: 96, top: 240, width: 1180, display: 'flex', flexDirection: 'column', gap: 22}}>
        {LINKS.map(([t, u, s], i) => (
          <div key={t} style={{...rise(b[0], i * 14)}}>
            <Card style={{padding: '22px 30px'}}>
              <Zh size={34} w={800}>
                {t}
              </Zh>
              <Mo size={22} color={D.green} style={{display: 'block', marginTop: 6}}>
                {u}
              </Mo>
              <Zh size={22} w={500} color={D.dim} style={{display: 'block', marginTop: 4}}>
                {s}
              </Zh>
            </Card>
          </div>
        ))}
      </div>
      {b[1] > -1 && (
        <div style={{position: 'absolute', left: 96, top: 860, ...rise(b[1], 0)}}>
          <Zh size={44} w={800} color={D.green}>
            我是老潘，我们下期见～
          </Zh>
        </div>
      )}
      <SrcLine f={f}>Takehi, Teoh, Zhang, Khattab · MIT CSAIL · 2026-11-02</SrcLine>
    </Shell>
  );
};
