// Part 1 · reading weights: Experiment 1 (which game), 2 (what a diffusion model draws), 3 (a language model's middle
// layers, and Figure 1's copying heads).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {
  Answer,
  Big,
  Card,
  clamp01,
  Correct,
  D,
  FONT_MONO,
  FONT_SANS,
  GameScreen,
  Head,
  Heat,
  Lab,
  Mark,
  Mo,
  prog,
  Prompt,
  Reasoning,
  rise,
  Setup,
  Shell,
  SrcLine,
  Table,
  Tabs,
  usePopIn,
  WALL,
  Zh,
} from './common';
import exp2 from './data/exp2.json';

const GAME_KEYS = ['breakout', 'pong', 'pacman', 'freeway'];
const GAME_NAMES = ['Breakout', 'Pong', 'Pac-Man', 'Freeway'];

// ------------------------------------------------------------------ Experiment 1 · setup
export const Games: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const same = prog(b[3], 16);
  return (
    <Shell part="读权重">
      <Head kicker="Experiment 1 · 实验 1" title="只看权重，能认出它练的是哪个游戏吗？" />
      {/* four games */}
      <div style={{position: 'absolute', left: 96, top: 222, display: 'grid', gridTemplateColumns: '400px 400px', gap: 20}}>
        {GAME_KEYS.map((g, i) => (
          <div key={g} style={{...pop(b[2], i * 6)}}>
            <Card tint={D.panel} style={{height: 330, padding: '18px 20px', display: 'flex', gap: 18, alignItems: 'center'}}>
              <GameScreen game={g} t={b[2] - i * 7} size={220} />
              <div>
                <Zh size={30} w={800}>
                  {GAME_NAMES[i]}
                </Zh>
                <div style={{marginTop: 10, opacity: same}}>
                  <Mo size={18} color={D.dim}>
                    500→32→32→5
                  </Mo>
                </div>
                <div style={{opacity: same}}>
                  <Mo size={18} color={D.dim}>
                    17,253 个权重
                  </Mo>
                </div>
                <div style={{marginTop: 18, opacity: prog(b[6], 10, 14 + i * 8), transform: `scale(${0.6 + 0.4 * prog(b[6], 10, 14 + i * 8)})`, transformOrigin: 'left'}}>
                  <Zh size={30} w={800} color={D.green}>
                    ✓ 认对
                  </Zh>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 96, top: 920 - 36, width: 820, textAlign: 'center', opacity: prog(b[4], 14)}}>
        <Zh size={24} w={600} color={D.red}>
          四个网络形状完全一样，不读权重的内容分不出谁是谁
        </Zh>
      </div>
      {/* setup + prompt */}
      <div style={{position: 'absolute', left: 980, top: 222}}>
        <Setup
          f={b[1]}
          step={10}
          w={844}
          rows={[
            ['游戏', '自制的 10×10 格子版 Breakout、Pong、Pac-Man、Freeway，同样 5 个动作'],
            ['网络', 'MLP 500 → 32 → 32 → 5，tanh，17,253 个权重，四个一模一样'],
            ['输入', '10×10 格子 × 5 个通道：自己、移动物体、奖励目标、障碍、上一帧'],
            ['训练', 'PPO（强化学习常用算法），10 亿步，每个游戏取 3 个种子里最好的'],
          ]}
        />
      </div>
      <div style={{position: 'absolute', left: 980, top: 600, ...rise(b[5], 0)}}>
        <Prompt
          f={b[5]}
          w={844}
          file="策略网络的 17,253 个权重，原样写成文本"
          fileRow={
            <Mo size={18} color={D.dim}>
              {WALL[0].label} {WALL[0].values.slice(0, 10).join(' ')}
            </Mo>
          }
          question="这个网络是练哪个游戏的？"
          rule="不许用任何工具，也不给游戏选项。"
          cps={14}
        />
      </div>
      <div style={{position: 'absolute', left: 980, top: 600, width: 844, opacity: prog(b[6], 14), display: 'flex', justifyContent: 'flex-end', marginTop: 0}}>
        <div style={{marginTop: 236, background: D.answer, borderRadius: 14, padding: '10px 22px'}}>
          <Zh size={30} w={800} color={D.green}>
            4 / 4 全部认对
          </Zh>
        </div>
      </div>
      <SrcLine f={b[1]} left={980}>
        设置照原文 Experiment 1 的 Setup；对局画面是原文的回放 GIF
      </SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ Experiment 1 · how Astra read Breakout
const W3 = ['0.376', '0.387', '0.537', '−5.336', '−1.203'];
export const Breakout: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const others = prog(b[7], 16);
  const ch = b[4] > 0 && b[5] < 0 ? 2 : 0;
  const tab = b[8] > 0 ? 3 : b[7] > 0 ? 1 : 0;
  return (
    <Shell part="读权重">
      <Head kicker="Experiment 1 · 实验 1" title={others > 0.5 ? "另外三个游戏，也是这样读出来的" : "Astra 是怎么认出 Breakout 的"} />
      <div style={{position: 'absolute', left: 96, top: 206, width: 1728}}>
        <Tabs items={GAME_NAMES} active={tab} />
      </div>
      {/* left column: gameplay + the real first-layer weights */}
      <div style={{position: 'absolute', left: 96, top: 282, width: 340, opacity: 1 - others}}>
        <Card tint={D.panel} style={{padding: '18px 20px', height: 620}}>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <GameScreen game="breakout" t={frame} size={220} />
          </div>
          <div style={{textAlign: 'center', marginTop: 4}}>
            <Zh size={20} w={600} color={D.dim}>
              对局回放
            </Zh>
          </div>
          <div style={{marginTop: 14, display: 'flex', justifyContent: 'center'}}>
            <Heat ch={ch} size={250} p={prog(b[1], 30)} hiRow={ch === 0 ? 8 : 1} hiN={ch === 0 ? 1 : 3} hiP={ch === 0 ? prog(b[1], 12, 24) : prog(b[4], 12)} />
          </div>
          <div style={{textAlign: 'center', marginTop: 8}}>
            <Zh size={19} w={600} color={D.dim}>
              {ch === 0 ? '“自己”通道' : '“奖励目标”通道'} · 第一层权重强度
            </Zh>
          </div>
        </Card>
      </div>
      {/* reasoning (the page's timeline) */}
      <div style={{position: 'absolute', left: 470, top: 282, opacity: 1 - others}}>
        <Reasoning
          w={1354}
          size={33}
          gap={26}
          items={[
            {text: <>通道 0 · 自己：大权重集中在 <b>第 8 行</b>，横跨可玩区域</>, at: b[1]},
            {text: <>在 (8,1) 处，连到隐藏单元 15 的权重是 <b>4.066</b>，到单元 31 的是 <b>−4.013</b></>, at: b[2]},
            {text: <>推断：底部有一块<b>左右移动的挡板</b></>, at: b[3]},
            {text: <>通道 2 · 奖励目标：结构集中在 <b>第 1–3 行</b>，挡板上方一排奖励物，像<b>砖块</b></>, at: b[4]},
            {
              text: (
                <>
                  输出层：<b>“左”和“右”</b>分得特别开，其他动作差不多
                  <Mo size={22} color={D.dim}>
                    W3 row 22: {W3.join(', ')}
                  </Mo>
                </>
              ),
              at: b[5],
            },
          ]}
        />
      </div>
      <div style={{position: 'absolute', left: 470, top: 812, opacity: 1 - others}}>
        <Answer f={b[6]} w={1354} label="答案" meta={<>99% 把握 · <Correct /> · 1,679 token</>}>
          游戏：<Mark p={prog(b[6], 16, 8)}>Breakout</Mark>
        </Answer>
      </div>
      {/* the other three tabs */}
      {others > 0.01 && (
        <div style={{position: 'absolute', left: 96, top: 290, width: 1728, display: 'flex', gap: 34, opacity: others}}>
          {[
            {g: 'pong', name: 'Pong', key: <>“自己”的大权重集中在<b>第 1 列</b>：左边一竖条挡板</>, ans: 'Pong', conf: '96%', at: b[7]},
            {g: 'pacman', name: 'Pac-Man', key: <>“自己”的大权重排成一张<b>对称的迷宫</b></>, ans: 'Pac-Man', conf: '96%', at: b[7] - 24},
            {g: 'freeway', name: 'Freeway', key: <>间隔规律的车流，排成一条条<b>横向车道</b>，偏向“向上”</>, ans: 'Frogger（过马路游戏，评分记作 Freeway）', conf: '97%', at: b[8]},
          ].map((o, i) => (
            <div key={o.g} style={{flex: 1, ...rise(o.at, 0)}}>
              <Card style={{height: 600, padding: '24px 26px'}}>
                <div style={{display: 'flex', gap: 20, alignItems: 'center'}}>
                  <GameScreen game={o.g} t={frame - i * 9} size={170} />
                  <Zh size={36} w={800}>
                    {o.name}
                  </Zh>
                </div>
                <div style={{marginTop: 22, minHeight: 150}}>
                  <Zh size={27} w={500}>
                    {o.key}
                  </Zh>
                </div>
                {o.g === 'pacman' && (
                  <pre style={{position: 'absolute', right: 30, top: 34, margin: 0, fontFamily: FONT_MONO, fontSize: 17, lineHeight: 1.15, color: D.green}}>
                    {'........\n.##..##.\n.#....#.\n...##...\n...##...\n.#....#.\n.##..##.\n........'}
                  </pre>
                )}
                <div style={{position: 'absolute', left: 26, right: 26, bottom: 24, background: D.answer, borderRadius: 12, padding: '12px 18px', opacity: prog(o.at, 12, 30)}}>
                  <Zh size={20} w={700} color={D.green}>
                    答案
                  </Zh>
                  <div>
                    <Zh size={26} w={700}>
                      {o.ans}
                    </Zh>
                  </div>
                  <Zh size={20} w={500} color={D.dim}>
                    {o.conf} 把握 · <Correct />
                  </Zh>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
      <SrcLine f={b[1]}>推理摘自原文交互图（中译，数字原样）；热力图用作者开源的 Breakout 网络（a9f535cc）第一层权重算出，行号从 0 数</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ Experiment 2 · diffusion
type Diff = {samples: number[][][]; astra: string[]};
const DIFF = exp2 as Record<string, Diff>;
const SHAPES: [string, string][] = [
  ['Circles', '圆'],
  ['Squares', '方块'],
  ['Triangles', '三角形'],
];
const Img: React.FC<{px: number[][]; size: number; noise?: number; seed?: number}> = ({px, size, noise = 0, seed = 1}) => {
  const c = size / 12;
  return (
    <svg width={size} height={size} style={{display: 'block', background: '#000', borderRadius: 4}}>
      {px.flatMap((row, r) =>
        row.map((v, k) => {
          const h = Math.sin((r * 12 + k) * 91.7 + seed * 13.1) * 43758.5;
          const n = h - Math.floor(h);
          const val = clamp01(v * (1 - noise) + n * noise);
          return val > 0.02 ? <rect key={`${r}-${k}`} x={k * c} y={r * c} width={c} height={c} fill={`rgba(255,255,255,${val})`} /> : null;
        }),
      )}
    </svg>
  );
};
const AstraDraw: React.FC<{rows: string[]; size: number; p: number}> = ({rows, size, p}) => {
  const c = size / 12;
  const cells: [number, number][] = [];
  rows.forEach((row, r) => [...row].forEach((ch, k) => ch === '#' && cells.push([r, k])));
  const n = Math.floor(p * cells.length);
  return (
    <svg width={size} height={size} style={{display: 'block', background: '#000', borderRadius: 4}}>
      {cells.slice(0, n).map(([r, k]) => (
        <rect key={`${r}-${k}`} x={k * c + 1} y={r * c + 1} width={c - 2} height={c - 2} fill="#1f9d63" />
      ))}
    </svg>
  );
};

export const Diffusion: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const den = b[1] > 0 ? clamp01((b[1] % 120) / 90) : 0;
  return (
    <Shell part="读权重">
      <Head kicker="Experiment 2 · 实验 2" title="扩散模型会画什么？" sub="只看权重" />
      {/* denoise strip */}
      <div style={{position: 'absolute', left: 96, top: 214, width: 1060, ...rise(b[1], 0)}}>
        <Card tint={D.panel} style={{padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 22, height: 170}}>
          {[1, 0.75, 0.5, 0.25, 0].map((nz, i) => (
            <React.Fragment key={i}>
              <Img px={DIFF.Circles.samples[0]} size={120} noise={Math.min(1, nz + (1 - den) * 0.25 * (i < 4 ? 1 : 0))} seed={i + Math.floor(frame / 6)} />
              {i < 4 && (
                <svg width={34} height={20}>
                  <path d="M2 10 H28 M20 3 L29 10 L20 17" stroke={D.green} strokeWidth={3} fill="none" />
                </svg>
              )}
            </React.Fragment>
          ))}
          <Zh size={24} w={600} color={D.dim} style={{marginLeft: 6}}>
            一步步去噪
          </Zh>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 1190, top: 214, width: 634, ...rise(b[2], 0)}}>
        <Setup
          f={b[2]}
          w={634}
          step={8}
          rows={[
            ['模型', '3 个 DDPM，12×12 灰度图'],
            ['网络', 'MLP 160 → 64 → 64 → 144，23,824 个权重'],
            ['Astra', <>只有权重；<span style={{color: D.red, fontWeight: 700}}>不许算前向</span></>],
          ]}
        />
      </div>
      {/* three shapes */}
      <div style={{position: 'absolute', left: 96, top: 420, width: 1728, display: 'flex', gap: 30}}>
        {SHAPES.map(([k, zh], i) => {
          const d = DIFF[k];
          const drawP = i === 0 ? prog(b[4], 50) : prog(b[5], 50, i * 12);
          return (
            <div key={k} style={{flex: 1, ...rise(b[2], 6 + i * 6)}}>
              <Card style={{padding: '18px 22px', height: 400}}>
                <Zh size={28} w={800}>
                  {zh}
                </Zh>
                <div style={{display: 'flex', gap: 22, marginTop: 12}}>
                  <div>
                    <div style={{display: 'grid', gridTemplateColumns: '112px 112px', gap: 6}}>
                      {d.samples.slice(0, 4).map((s, j) => (
                        <Img key={j} px={s} size={112} />
                      ))}
                    </div>
                    <div style={{textAlign: 'center', marginTop: 6}}>
                      <Zh size={19} w={600} color={D.dim}>
                        模型真正生成的
                      </Zh>
                    </div>
                  </div>
                  <div style={{opacity: prog(i === 0 ? b[4] : b[5], 10, i * 12)}}>
                    <AstraDraw rows={d.astra} size={196} p={drawP} />
                    <div style={{textAlign: 'center', marginTop: 6}}>
                      <Zh size={19} w={700} color={D.green}>
                        Astra 画的
                      </Zh>
                    </div>
                    <div style={{textAlign: 'center', marginTop: 4, opacity: prog(b[6], 12, i * 6)}}>
                      <Zh size={22} w={800} color={D.red}>
                        空心
                      </Zh>
                      <Zh size={22} w={600} color={D.dim}>
                        {' '}vs 实心
                      </Zh>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 96, top: 216, width: 1060, opacity: prog(b[7], 14)}}>
        <Card style={{padding: '22px 28px', height: 170, borderColor: D.green, display: 'flex', alignItems: 'center'}}>
          <Zh size={32} w={700}>
            它没在算输出，而是在<Mark p={prog(b[7], 18, 10)}>读权重的几何结构</Mark>：每个隐藏单元的输出权重，描出边缘的一小段
          </Zh>
        </Card>
      </div>
      <SrcLine f={b[2]}>样本图和 Astra 的画都取自原文交互图的数据；三个都答对（圆 84% 把握）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ Experiment 3 · middle layers only
const Block: React.FC<{y: number; label: string; sub?: string; gone?: number; hot?: boolean; o?: number}> = ({y, label, sub, gone = 0, hot, o = 1}) => (
  <div style={{position: 'absolute', left: 0, top: y, width: 560, height: 84, opacity: o * (1 - 0.7 * gone)}}>
    <div style={{width: '100%', height: '100%', borderRadius: 12, border: `2px ${gone > 0.5 ? 'dashed' : 'solid'} ${hot ? D.green : D.border}`, background: hot ? D.wash : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, boxSizing: 'border-box'}}>
      <Zh size={28} w={700} color={gone > 0.5 ? D.faint : D.ink}>
        {label}
      </Zh>
      {sub && (
        <Zh size={20} w={500} color={D.dim}>
          {sub}
        </Zh>
      )}
    </div>
    {gone > 0.01 && <div style={{position: 'absolute', left: -10, right: -10, top: 40, height: 4, background: D.red, transform: `scaleX(${gone})`, transformOrigin: 'left'}} />}
  </div>
);
const HeadGrid: React.FC<{cells: string[]; size?: number; p?: number; color?: string; labels?: boolean}> = ({cells, size = 26, p = 1, color = '#E8762C', labels}) => (
  <div style={{display: 'flex', gap: 6}}>
    {labels && (
      <div style={{display: 'flex', flexDirection: 'column', gap: 3, paddingTop: size * 0.9}}>
        {[0, 1, 2, 3].map((l) => (
          <div key={l} style={{height: size, display: 'flex', alignItems: 'center'}}>
            <Mo size={size * 0.6} color={D.dim}>
              {l}
            </Mo>
          </div>
        ))}
      </div>
    )}
    <div>
      {labels && (
        <div style={{display: 'flex', gap: 3, height: size * 0.9}}>
          {[0, 1, 2, 3, 4, 5].map((h) => (
            <div key={h} style={{width: size, textAlign: 'center'}}>
              <Mo size={size * 0.6} color={D.dim}>
                {h}
              </Mo>
            </div>
          ))}
        </div>
      )}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(6, ${size}px)`, gap: 3}}>
        {Array.from({length: 24}, (_, i) => {
          const key = `${Math.floor(i / 6)}.${i % 6}`;
          const on = cells.includes(key);
          return <div key={i} style={{width: size, height: size, background: on && p > 0.5 ? color : '#E3E6EA', borderRadius: 2, transform: on ? `scale(${0.8 + 0.2 * p})` : undefined}} />;
        })}
      </div>
    </div>
  </div>
);
export const Middle: React.FC = () => {
  const b = useBeats();
  const gone = prog(b[1], 18, 10);
  const corp = prog(b[3], 14) * (1 - prog(b[5], 12));
  const ask = prog(b[5], 14) * (1 - prog(b[7], 12));
  const heads = prog(b[7], 14) * (1 - prog(b[8], 12));
  const tab = prog(b[8], 14);
  return (
    <Shell part="读权重">
      <Head kicker="Experiment 3 · 实验 3" title="只给中间层，还认得出吗？" />
      <div style={{position: 'absolute', left: 120, top: 236, ...rise(b[0], 0)}}>
        <Block y={0} label="输出层" sub="384 维 → 28 个字符" gone={gone} />
        {[3, 2, 1, 0].map((l, i) => (
          <Block key={l} y={110 + i * 100} label={`transformer 块 ${l}`} sub="6 个注意力头" hot={b[5] > 0} o={1} />
        ))}
        <Block y={530} label="输入层" sub="28 个字符 → 384 维" gone={gone} />
        <div style={{position: 'absolute', left: 590, top: 110, width: 40, height: 390, borderRight: `3px solid ${D.green}`, borderTop: `3px solid ${D.green}`, borderBottom: `3px solid ${D.green}`, borderRadius: '0 12px 12px 0', opacity: prog(b[5], 12)}} />
        <div style={{position: 'absolute', left: 650, top: 270, opacity: prog(b[5], 12, 6), width: 190}}>
          <Zh size={24} w={700} color={D.green}>
            Astra 只拿到这些
          </Zh>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 860, opacity: prog(b[4], 14), width: 760}}>
        <Zh size={22} w={600} color={D.red}>
          哪一维对应哪个字母，权重里已经看不出；模型也跑不了任何文本
        </Zh>
      </div>
      {/* right side, phases */}
      <div style={{position: 'absolute', left: 1000, top: 236, width: 824}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 824, ...rise(b[2], 0), opacity: prog(b[2], 16) * (1 - prog(b[3], 12))}}>
          <Card style={{padding: '26px 30px'}}>
            <Zh size={30} w={800}>三个小语言模型</Zh>
            <div style={{marginTop: 14}}>
              {['4 层 × 6 个注意力头，宽 384，716 万个权重', '字母表 28 个字符：a–z、空格、换行', '按字符预测下一个字符，各学 10 亿个字符'].map((t, i) => (
                <div key={t} style={{marginTop: 10, ...rise(b[2], 8 + i * 8, 8)}}>
                  <Zh size={26} w={500}>
                    · {t}
                  </Zh>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {corp > 0.01 && (
          <div style={{position: 'absolute', left: 0, top: 0, width: 824, opacity: corp}}>
            {[
              ['Python 代码', 'def total(xs):\n    total = 0\n    for x in xs:\n        total += x'],
              ['日语罗马字（青空文库）', 'wagahai wa neko de aru\nnamae wa mada nai'],
              ['英文维基百科', 'the city is located on\nthe north bank of the river'],
            ].map(([t, s], i) => (
              <div key={t} style={{marginTop: i ? 18 : 0, ...rise(b[3], i * 8)}}>
                <Card style={{padding: '16px 24px', display: 'flex', gap: 24, alignItems: 'center'}}>
                  <Zh size={26} w={800} style={{width: 260}}>
                    {t}
                  </Zh>
                  <pre style={{margin: 0, fontFamily: FONT_MONO, fontSize: 20, color: D.dim, lineHeight: 1.35}}>{s}</pre>
                </Card>
              </div>
            ))}
            <div style={{marginTop: 10}}>
              <Zh size={18} w={500} color={D.faint}>
                文本片段为示意，只为说明语料类型
              </Zh>
            </div>
          </div>
        )}
        {ask > 0.01 && (
          <div style={{position: 'absolute', left: 0, top: 0, opacity: ask}}>
            <Prompt
              f={b[5]}
              w={824}
              file="四个 transformer 块的权重（文件）+ Python"
              question="它学的是 Python 代码、罗马字，还是英文？24 个注意力头各在干什么？"
              rule="可以用 Python 分析权重，不能在任何输入上运行网络或其中任何一层。最多 100 次。"
              cps={24}
            />
          </div>
        )}
        {heads > 0.01 && (
          <div style={{position: 'absolute', left: 0, top: 0, width: 824, opacity: heads}}>
            <Card style={{padding: '26px 30px', display: 'flex', gap: 34, alignItems: 'center'}}>
              <HeadGrid cells={[]} size={40} labels />
              <div>
                <Zh size={30} w={800}>
                  注意力头
                </Zh>
                <div style={{marginTop: 10}}>
                  <Zh size={25} w={500}>
                    模型里负责“回头看前文哪一处”的小部件。这里 4 层 × 6 个 = 24 个。
                  </Zh>
                </div>
              </div>
            </Card>
          </div>
        )}
        {tab > 0.01 && (
          <div style={{position: 'absolute', left: 0, top: 0, width: 824, opacity: tab}}>
            <Card style={{padding: '24px 28px'}}>
              <Table
                size={24}
                widths={[150, 360, 240]}
                head={['训练语料', 'Astra 的答案（把握），两次', '']}
                rows={[
                  {cells: ['Python', 'Python (0.56), Python (0.52)', <Correct key="c" />], at: b[8], hot: [1]},
                  {cells: ['罗马字', 'romaji (0.55), romaji (0.62)', <Correct key="c" />], at: b[8] - 10, hot: [1]},
                  {cells: ['英文', 'English (0.58), English (0.48)', <Correct key="c" />], at: b[8] - 20, hot: [1]},
                ]}
              />
            </Card>
          </div>
        )}
      </div>
      <SrcLine f={b[2]} left={1000}>
        设置照原文 Experiment 3 的 Setup；结果表照原文
      </SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ Experiment 3 · Figure 1, copying heads
const COPY: [string, string, string[]][] = [
  ['Python', 'Python', ['2.1', '3.1', '3.5']],
  ['Romaji', '罗马字', ['3.3']],
  ['English', '英文', ['3.1']],
];
export const Copying: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const typedN = b[1] > 0 ? Math.min(3, Math.floor(b[1] / 10)) : 0;
  const look = prog(b[2], 20);
  const copyP = prog(b[2], 14, 22);
  const mech = prog(b[4], 14) * (1 - prog(b[7], 12));
  const expl = prog(b[7], 14);
  return (
    <Shell part="读权重">
      <Head kicker="Experiment 3 · 图 1" title="复制头在哪里" sub="Astra 读权重 vs 真跑模型" />
      {/* tot -> total demo */}
      <div style={{position: 'absolute', left: 96, top: 210, width: 1728, ...rise(b[1], 0)}}>
        <Card tint={D.panel} style={{padding: '18px 30px', display: 'flex', alignItems: 'center', gap: 30, height: 110}}>
          <div style={{fontFamily: FONT_MONO, fontSize: 40, color: D.ink2, whiteSpace: 'nowrap', position: 'relative'}}>
            …{' '}
            <span style={{background: look > 0.3 ? 'rgba(232,118,44,0.18)' : undefined, borderRadius: 4}}>
              tot<span style={{color: '#E8762C', fontWeight: 700}}>al</span>
            </span>{' '}
            … {'tot'.slice(0, typedN)}
            <span style={{display: 'inline-block', minWidth: 60, border: copyP > 0 ? '3px dashed #E8762C' : undefined, borderRadius: 4, color: '#E8762C', fontWeight: 700, opacity: copyP}}>al</span>
          </div>
          <Zh size={26} w={500} color={D.dim}>
            复制头在前文找到同样的字母，把后面的内容抄过来
          </Zh>
        </Card>
      </div>
      {/* three models, Astra vs measured */}
      <div style={{position: 'absolute', left: 96, top: 352, width: 1728, display: 'flex', justifyContent: 'space-between'}}>
        {COPY.map(([k, zh, cells], i) => {
          const hl = (i === 0 && b[7] > 0 && b[8] < 0) || (i === 1 && b[8] > 0);
          return (
            <div key={k} style={{...rise(b[3], i * 8)}}>
              <Card style={{padding: '16px 22px', borderColor: hl ? D.green : D.border}}>
                <Zh size={26} w={800}>
                  {zh}
                </Zh>
                <div style={{display: 'flex', gap: 26, marginTop: 6}}>
                  {['Astra（只看权重）', '实测（真跑模型）'].map((s, j) => (
                    <div key={s}>
                      <HeadGrid cells={cells} size={30} p={prog(b[3], 10, 10 + i * 8 + j * 14)} labels={j === 0} />
                      <div style={{textAlign: 'center', marginTop: 6}}>
                        <Zh size={18} w={600} color={D.dim}>
                          {s}
                        </Zh>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 96, top: 640, opacity: prog(b[3], 12, 40), display: 'flex', gap: 24, alignItems: 'center'}}>
        <div style={{width: 18, height: 18, background: '#E8762C'}} />
        <Zh size={20} w={500} color={D.dim}>
          复制头
        </Zh>
        <div style={{width: 18, height: 18, background: '#E3E6EA'}} />
        <Zh size={20} w={500} color={D.dim}>
          其他头　· 行是第 0–3 层，列是 0–5 号头
        </Zh>
      </div>
      {/* how: previous-token head x later heads */}
      {mech > 0.01 && (
        <div style={{position: 'absolute', left: 96, top: 690, width: 1728, opacity: mech, display: 'flex', alignItems: 'center', gap: 26}}>
          <Card style={{padding: '18px 24px', width: 420, ...rise(b[4], 0)}}>
            <Mo size={22} color={D.green} w={700}>
              第一层的一个头
            </Mo>
            <div>
              <Zh size={26} w={700}>
                “往回看一个字符”
              </Zh>
            </div>
          </Card>
          <Zh size={44} w={800} color={D.green} style={{...rise(b[5], 0)}}>
            ×
          </Zh>
          <Card style={{padding: '18px 24px', width: 460, ...rise(b[5], 6)}}>
            <Mo size={22} color={D.green} w={700}>
              把权重矩阵乘起来
            </Mo>
            <div>
              <Zh size={26} w={700}>
                看后面哪些头借着它去搜索
              </Zh>
            </div>
          </Card>
          <Zh size={44} w={800} color={D.green} style={{...rise(b[5], 14)}}>
            →
          </Zh>
          <Card tint={D.answer} style={{padding: '18px 24px', width: 440, border: 'none', ...rise(b[6], 0)}}>
            <Zh size={24} w={700}>
              Elhage 等人提出过的方法
            </Zh>
            <div>
              <Zh size={22} w={500} color={D.dim}>
                作者说从没跟 Astra 提过
              </Zh>
            </div>
          </Card>
        </div>
      )}
      {expl > 0.01 && (
        <div style={{position: 'absolute', left: 96, top: 690, width: 1728, opacity: expl, display: 'flex', gap: 30}}>
          <Card style={{flex: 1, padding: '20px 26px', height: 170, borderColor: b[8] < 0 ? D.green : D.border}}>
            <Zh size={26} w={800}>
              Python
            </Zh>
            <div style={{marginTop: 6}}>
              <Zh size={24} w={500}>
                代码里名字反复出现，复制头多（3 个）→ 指向 Python
              </Zh>
            </div>
          </Card>
          <Card style={{flex: 1, padding: '20px 26px', height: 170, opacity: 0.3 + 0.7 * prog(b[8], 12), borderColor: b[8] > 0 ? D.green : D.border}}>
            <Zh size={26} w={800}>
              罗马字
            </Zh>
            <div style={{marginTop: 6}}>
              <Zh size={24} w={500}>
                最后一块写出的方向更少，像要分的字母更少：用不到{' '}
              </Zh>
              {['q', 'l', 'v', 'x'].map((c, i) => (
                <span key={c} style={{fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: D.red, textDecoration: prog(b[8], 8, 20 + i * 6) > 0.5 ? 'line-through' : undefined, marginRight: 12}}>
                  {c}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
      <SrcLine f={b[3]}>复制头位置照原文 Figure 1（layer.head）；实测：在重复两遍的随机字符串上跑模型，复制头得分 0.22–0.55，其他头 ≤ 0.02</SrcLine>
    </Shell>
  );
};
