// Part 2: post-training. K3's recipe (K3 report §4.1) and what K3.1 Pro scaled up (K3.1 Pro blog).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Chip, clamp01, count, Head, HBars, Illus, K, lerp, Mo, Num, Panel, prog, rise, Shell, SrcLine, usePopIn, Zh} from './common';

const PART = '02 · 后训练';

const DOMAINS = ['通用', '智能体', '编程'];
const EFFORTS = ['low', 'high', 'max'];

export const Post: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const gx = 500; // grid left
  const gy = 330;
  const cw = 190;
  const ch = 120;
  const merge = prog(b[4], 34, 4);
  const n9 = DOMAINS.length * EFFORTS.filter((_, j) => prog(b[2], 10, 6 + j * 8) > 0.5).length * (prog(b[1], 10) > 0.5 ? 1 : 0);
  return (
    <Shell part={PART}>
      <Head kicker="POST-TRAINING · K3" title="三步后训练" sub="SFT → 9 个专家 RL → 多老师蒸馏" />
      {/* SFT */}
      <div style={{position: 'absolute', left: 96, top: 400, ...pop(b[0], 6)}}>
        <Panel style={{width: 330, padding: '26px 28px'}}>
          <Mo size={22} color={K.hero2}>
            STEP 1
          </Mo>
          <div>
            <Zh size={40} w={900}>
              SFT 冷启动
            </Zh>
          </div>
          <Zh size={20} w={600} color={K.dim}>
            大规模智能体轨迹数据
          </Zh>
        </Panel>
      </div>
      {/* 3 x 3 experts */}
      <div style={{position: 'absolute', left: gx - 20, top: gy - 60, opacity: prog(b[1], 12)}}>
        <Mo size={22} color={K.hero2}>
          STEP 2 · RL
        </Mo>
      </div>
      {EFFORTS.map((e, j) => (
        <div key={e} style={{position: 'absolute', left: gx + 130 + j * (cw + 14), top: gy - 26, width: cw, textAlign: 'center', opacity: prog(b[2], 12, j * 8)}}>
          <Mo size={22} color={K.dim} w={700}>
            {e}
          </Mo>
        </div>
      ))}
      {DOMAINS.map((d, i) => (
        <React.Fragment key={d}>
          <div style={{position: 'absolute', left: gx, top: gy + 14 + i * (ch + 14), width: 110, textAlign: 'right', ...rise(b[1], i * 6)}}>
            <Zh size={30} w={900}>
              {d}
            </Zh>
          </div>
          {EFFORTS.map((e, j) => {
            const s = prog(b[2], 14, 6 + j * 8 + i * 2);
            return (
              <div
                key={e}
                style={{
                  position: 'absolute',
                  left: gx + 130 + j * (cw + 14),
                  top: gy + i * (ch + 14),
                  width: cw,
                  height: ch,
                  borderRadius: 12,
                  background: prog(b[1], 10, i * 6) > 0.5 ? `rgba(78,106,128,${0.06 + j * 0.07})` : 'transparent',
                  border: `1.5px solid ${K.hero2}${s > 0.5 ? '99' : '33'}`,
                  opacity: (0.35 + 0.65 * s) * (1 - merge * 0.45) * prog(b[1], 10, i * 6),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zh size={22} w={800} color={K.ink} style={{opacity: s}}>
                  专家
                </Zh>
                {/* beat 3: token budget per effort level (illustrative lengths) */}
                <div style={{position: 'absolute', left: 14, bottom: 12, width: (cw - 28) * [0.35, 0.65, 1][j] * prog(b[3], 20, 10 + j * 8), height: 8, borderRadius: 4, background: K.hero, opacity: 0.8}} />
              </div>
            );
          })}
        </React.Fragment>
      ))}
      {/* beat 3: every expert teaches the one student */}
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        {DOMAINS.map((_, i) =>
          EFFORTS.map((__, j) => {
            const x1 = gx + 130 + 2 * (cw + 14) + cw;
            const y1 = gy + i * (ch + 14) + 24 + j * 36;
            const d = prog(b[4], 24, (i * 3 + j) * 2);
            return (
              <path
                key={`${i}${j}`}
                d={`M ${x1} ${y1} C ${x1 + 120} ${y1}, 1330 ${400}, 1430 ${400}`}
                fill="none"
                stroke={K.hero}
                strokeWidth={2}
                opacity={0.6 * d}
                strokeDasharray="1200"
                strokeDashoffset={1200 * (1 - d)}
              />
            );
          }),
        )}
      </svg>
      <div style={{position: 'absolute', left: gx + 130, top: gy + 3 * (ch + 14) + 6, opacity: prog(b[2], 12, 20)}}>
        <Zh size={26} w={800} color={K.hero2}>
          3 个领域 × 3 档思考强度 = <Num size={36} color={K.hero2}>{n9}</Num> 个专家
        </Zh>
      </div>
      {/* MOPD -> one model */}
      <div style={{position: 'absolute', left: 1430, top: 320, ...pop(b[4], 0, 0.7)}}>
        <Panel glow={K.hero} style={{width: 380, padding: '26px 28px', textAlign: 'center'}}>
          <Mo size={22} color={K.hero}>
            STEP 3 · MOPD
          </Mo>
          <div>
            <Zh size={34} w={900}>
              多老师在线蒸馏
            </Zh>
          </div>
          <Zh size={22} w={600} color={K.dim}>
            9 个老师 → 1 个学生模型
          </Zh>
        </Panel>
      </div>
      <div style={{position: 'absolute', left: 1430, top: 540, ...pop(b[4], 30, 0.6)}}>
        <Panel glow={K.hero2} style={{width: 380, height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Num size={58} color={K.hero2}>
            1
          </Num>
          <Zh size={26} w={800}>
            个统一模型 · 三档思考强度
          </Zh>
        </Panel>
      </div>
      <div style={{position: 'absolute', left: 96, top: 640, ...pop(b[5], 0, 0.7)}}>
        <Panel style={{width: 330, padding: '20px 26px'}}>
          <Zh size={22} w={700} color={K.dim}>
            量化感知训练 · 全程
          </Zh>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10}}>
            <Chip color={K.hero}>专家权重 MXFP4</Chip>
            <Chip color={K.hero2}>激活 MXFP8</Chip>
          </div>
        </Panel>
      </div>
      {/* beat 3: budget control */}
      <div style={{position: 'absolute', left: gx + 130, top: gy + 3 * (ch + 14) + 50, display: 'flex', gap: 12, ...rise(b[3], 24)}}>
        <Chip color={K.hero}>token 预算 τ·b₀：超预算奖励记 −1</Chip>
        <Chip color={K.hero2}>先训 max，再收紧 τ 得到 high / low</Chip>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 §4.1（SFT、RL 三领域 × low/high/max = nine expert models、Reasoning Effort RL、MOPD、§4.1.4 MXFP4 QAT）</SrcLine>
      {frame < 0 && null}
    </Shell>
  );
};

// ------------------------------------------------------------------ what K3.1 Pro changed
const STACK = ['RL 框架', '长上下文推理', '训练效率', '沙箱基础设施', 'rollout 调度', '环境质检平台'];

export const K31: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const dots = 240;
  return (
    <Shell part={PART}>
      <Head kicker="WHAT K3.1 PRO CHANGED" title="后训练加码" sub="同一个底座，更多的 RL" />
      {/* compute: no figure published -> qualitative */}
      <div style={{position: 'absolute', left: 96, top: 250, ...rise(b[0], 0)}}>
        <Panel style={{width: 560, padding: '24px 30px', position: 'relative'}}>
          <Zh size={26} w={800}>
            后训练算力
          </Zh>
          <Illus style={{position: 'absolute', right: 22, top: 26}} />
          {[
            {l: 'K3', w: 0.36, c: K.hero2},
            {l: 'K3.1 Pro', w: 1, c: K.hero},
          ].map((r, i) => (
            <div key={r.l} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18}}>
              <div style={{width: 110, textAlign: 'right'}}>
                <Zh size={24} w={800} color={i ? K.ink : K.dim}>
                  {r.l}
                </Zh>
              </div>
              <div style={{width: 340 * r.w * prog(b[0], 26, 8 + i * 10), height: 34, borderRadius: 6, background: r.c}} />
            </div>
          ))}
          <div style={{marginTop: 14}}>
            <Zh size={20} w={600} color={K.faint}>
              博客只说 “substantially larger”，没给具体数字
            </Zh>
          </div>
        </Panel>
      </div>
      {/* hundreds of domains */}
      <div style={{position: 'absolute', left: 96, top: 560, ...rise(b[1], 0)}}>
        <Panel style={{width: 560, height: 220, padding: '20px 26px', position: 'relative', overflow: 'hidden'}}>
          <Zh size={26} w={800}>
            联合 RL · <span style={{color: K.hero}}>几百个</span>下游领域
          </Zh>
          <Illus style={{position: 'absolute', right: 22, top: 22}} />
          <svg width={510} height={130} style={{position: 'absolute', left: 26, top: 74}}>
            {Array.from({length: dots}, (_, i) => {
              const on = prog(b[1], 8, 4 + (i % 60) * 0.6 + Math.floor(i / 60) * 2);
              return <circle key={i} cx={(i % 30) * 17 + 8} cy={Math.floor(i / 30) * 16 + 8} r={5} fill={K.hero} opacity={0.15 + 0.75 * on * (0.6 + 0.4 * Math.sin(frame / 9 + i))} />;
            })}
          </svg>
        </Panel>
      </div>
      {/* the stack */}
      <div style={{position: 'absolute', left: 710, top: 250, ...rise(b[0], 40)}}>
        <Panel style={{width: 500, padding: '24px 30px'}}>
          <Zh size={26} w={800}>
            配套系统也升级了
          </Zh>
          {STACK.map((s, i) => {
            const t = prog(b[1], 12, 40 + i * 7);
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, opacity: 0.35 + 0.65 * t}}>
                <div style={{width: 26, height: 26, borderRadius: 13, border: `2px solid ${K.hero}`, background: t > 0.6 ? K.hero : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {t > 0.6 && <span style={{color: K.onHero, fontWeight: 900, fontSize: 18}}>✓</span>}
                </div>
                <Zh size={28} w={800}>
                  {s}
                </Zh>
              </div>
            );
          })}
          <div style={{marginTop: 18}}>
            <Zh size={20} w={600} color={K.dim}>
              目标：每一份 RL 算力都带来稳定、可预期的回报
            </Zh>
          </div>
        </Panel>
      </div>
      {/* Kimi Code Bench 3.0 */}
      <div style={{position: 'absolute', left: 1250, top: 250, ...rise(b[0], 56)}}>
        <Panel glow={K.hero} style={{width: 580, height: 530, padding: '24px 30px', position: 'relative'}}>
          <Zh size={26} w={800}>
            Kimi Code Bench 3.0
          </Zh>
          <div>
            <Zh size={20} w={600} color={K.dim}>
              长程编程 · 内部测试
            </Zh>
          </div>
          {[
            {l: 'K3', v: 55.95, c: K.hero2, d: 2},
            {l: 'K3.1 Pro', v: 61.2, c: K.hero, d: 1},
          ].map((r, i) => {
            const f = b[2] - 8 - i * 12;
            const g = prog(f, 26);
            const H = 300;
            return (
              <div key={r.l} style={{position: 'absolute', left: 90 + i * 220, bottom: 60, width: 150, textAlign: 'center'}}>
                <Num size={44} color={i ? K.hero : K.ink}>
                  {(r.v * clamp01(g)).toFixed(r.d)}
                </Num>
                <div style={{width: 150, height: (r.v / 70) * H * g, background: r.c, borderRadius: '8px 8px 0 0', marginTop: 10}} />
                <div style={{marginTop: 8}}>
                  <Zh size={24} w={800} color={i ? K.ink : K.dim}>
                    {r.l}
                  </Zh>
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 58, height: 2.5, background: K.dim}} />
        </Panel>
      </div>
      <SrcLine f={b[0]}>来源：K3.1 Pro 官方博客 · Advancing the Frontier of Open Intelligence（Kimi Code Bench 3.0 Long-horizon：61.2 vs K3 55.95）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ infrastructure (K3 report §5)
// token load per EP rank, conventional vs MoonEP (illustrative: the report proves the bound, gives no such chart)
const LOADS = [1.45, 0.7, 1.1, 0.5, 1.3, 0.8, 0.55, 1.6];

export const Infra: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const bal = prog(b[0], 34, 70);
  const vms = 12 * 7;
  return (
    <Shell part="02 · 训练系统">
      <Head kicker="INFRASTRUCTURE · K3" title="训练系统也是自研的" sub="Kimi K3 技术报告 §5" />
      {/* MoonEP */}
      <div style={{position: 'absolute', left: 96, top: 222, ...rise(b[0], 0)}}>
        <Panel style={{width: 860, height: 560, padding: '24px 30px', position: 'relative'}}>
          <Zh size={30} w={700}>
            MoonEP：完美负载均衡
          </Zh>
          <Illus style={{position: 'absolute', right: 26, top: 30}} />
          <div style={{marginTop: 4}}>
            <Zh size={21} w={500} color={K.dim}>
              {bal < 0.5 ? '传统专家并行：各卡分到的 token 忽多忽少' : '每张卡正好收到 S×K 个 token，计算量完全一样'}
            </Zh>
          </div>
          <div style={{position: 'absolute', left: 50, bottom: 140, display: 'flex', gap: 30, alignItems: 'flex-end'}}>
            {LOADS.map((v, i) => {
              const h = lerp(v, 1, bal) * 150 * prog(b[0], 20, 10 + i * 2);
              const extra = Math.max(0, 1 - v) * 150 * bal; // slots filled by redundant experts
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
                  <div style={{width: 64, height: h, position: 'relative', borderRadius: 6, overflow: 'hidden', background: v > 1 && bal < 0.5 ? K.red : K.hero2}}>
                    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: extra, background: K.hero}} />
                  </div>
                  <Mo size={16} color={K.faint}>
                    GPU{i}
                  </Mo>
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', left: 40, right: 40, bottom: 140 + 27 + 150, height: 0, borderTop: `2px dashed ${K.grey2}`, opacity: bal}} />
          <div style={{position: 'absolute', left: 30, right: 30, bottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap', opacity: prog(b[0], 12, 100)}}>
            <Chip color={K.hero}>■ 动态冗余专家补齐</Chip>
            <Chip color={K.hero2} style={{fontSize: 18}}>每卡至多 E/R 个冗余专家即可保证平衡</Chip>
          </div>
        </Panel>
      </div>
      {/* AgentENV sandboxes */}
      <div style={{position: 'absolute', left: 990, top: 222, ...pop(b[1], 0, 0.92)}}>
        <Panel glow={K.hero} style={{width: 834, height: 560, padding: '24px 30px', position: 'relative', overflow: 'hidden'}}>
          <Zh size={30} w={700}>
            AgentENV：microVM 沙箱
          </Zh>
          <div style={{marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 14}}>
            <Num size={64} color={K.hero}>
              {Math.round(count(b[1] - 10, 51219741, 50)).toLocaleString('en-US')}
            </Num>
            <Zh size={22} w={600} color={K.dim}>
              个沙箱 · 训练和评测累计
            </Zh>
          </div>
          <div style={{marginTop: 4}}>
            <Zh size={20} w={500} color={K.faint}>
              来自 1,505,678 个镜像
            </Zh>
          </div>
          <svg width={420} height={190} style={{position: 'absolute', left: 30, top: 214}}>
            {Array.from({length: vms}, (_, i) => {
              const on = prog(b[1], 6, 6 + i * 0.5);
              const paused = (i * 7 + Math.floor(frame / 12)) % 9 === 0;
              return <rect key={i} x={(i % 12) * 34} y={Math.floor(i / 12) * 27} width={26} height={19} rx={4} fill={paused ? K.grey2 : K.hero} opacity={on * (paused ? 0.9 : 0.75)} />;
            })}
          </svg>
          <div style={{position: 'absolute', left: 470, top: 214, display: 'flex', flexDirection: 'column', gap: 12, ...rise(b[1], 50)}}>
            <Chip color={K.hero2} style={{fontSize: 18}}>Firecracker 隔离</Chip>
            <Chip color={K.hero2} style={{fontSize: 18}}>等推理时暂停（最多占 98%）</Chip>
            <Chip color={K.hero2} style={{fontSize: 18}}>fork：无副作用地评审</Chip>
            <Chip color={K.hero2} style={{fontSize: 18}}>亚秒级启动 · 内存超分 6.5×</Chip>
          </div>
          <div style={{position: 'absolute', left: 30, right: 30, bottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap', ...rise(b[1], 90)}}>
            <Chip color={K.ink} style={{fontSize: 18}}>推理：MTP 层微调成 EAGLE-3 草稿模型</Chip>
            <Chip color={K.ink} style={{fontSize: 18}}>KDA 感知的前缀缓存</Chip>
          </div>
        </Panel>
      </div>
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 §5.2.1 MoonEP、§5.3.2 AgentENV（51,219,741 sandboxes / 1,505,678 images）、§4.1.4 EAGLE-3、§5.4.1</SrcLine>
    </Shell>
  );
};

export {HBars as _HBars};
