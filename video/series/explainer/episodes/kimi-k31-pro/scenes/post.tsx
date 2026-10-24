// Part 2: post-training. K3's recipe (K3 report §4.1) and what K3.1 Pro scaled up (K3.1 Pro blog).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Chip, clamp01, Head, HBars, Illus, K, Mo, Num, Panel, prog, rise, Shell, SrcLine, usePopIn, Zh} from './common';

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
  const merge = prog(b[3], 34, 4);
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
                  background: prog(b[1], 10, i * 6) > 0.5 ? `rgba(143,162,255,${0.12 + j * 0.12})` : 'transparent',
                  border: `1.5px solid ${K.hero2}${s > 0.5 ? 'CC' : '33'}`,
                  opacity: (0.35 + 0.65 * s) * (1 - merge * 0.45) * prog(b[1], 10, i * 6),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zh size={22} w={800} color={K.ink} style={{opacity: s}}>
                  专家
                </Zh>
              </div>
            );
          })}
        </React.Fragment>
      ))}
      {/* beat 3: every expert teaches the one student */}
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        {DOMAINS.map((_, i) =>
          EFFORTS.map((__, j) => {
            const x1 = gx + 130 + j * (cw + 14) + cw;
            const y1 = gy + i * (ch + 14) + ch / 2;
            const d = prog(b[3], 24, (i * 3 + j) * 2);
            return (
              <path
                key={`${i}${j}`}
                d={`M ${x1} ${y1} C ${x1 + 200} ${y1}, 1300 ${400}, 1430 ${400}`}
                fill="none"
                stroke={K.hero}
                strokeWidth={2.5}
                opacity={0.7 * d}
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
      <div style={{position: 'absolute', left: 1430, top: 320, ...pop(b[3], 0, 0.7)}}>
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
      <div style={{position: 'absolute', left: 1430, top: 540, ...pop(b[3], 30, 0.6)}}>
        <Panel glow={K.hero2} style={{width: 380, height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Num size={58} color={K.hero2}>
            1
          </Num>
          <Zh size={26} w={800}>
            个统一模型 · 三档思考强度
          </Zh>
        </Panel>
      </div>
      <div style={{position: 'absolute', left: 96, top: 640, ...pop(b[4], 0, 0.7)}}>
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
      <SrcLine f={b[0]}>来源：Kimi K3 技术报告 §4.1（SFT、RL 三领域 × low/high/max = nine expert models、MOPD、§4.1.4 MXFP4 QAT）</SrcLine>
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
      <div style={{position: 'absolute', left: 710, top: 250, ...rise(b[2], 0)}}>
        <Panel style={{width: 500, padding: '24px 30px'}}>
          <Zh size={26} w={800}>
            整套都做了优化
          </Zh>
          {STACK.map((s, i) => {
            const t = prog(b[2], 12, 6 + i * 7);
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, opacity: 0.35 + 0.65 * t}}>
                <div style={{width: 26, height: 26, borderRadius: 13, border: `2px solid ${K.hero}`, background: t > 0.6 ? K.hero : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {t > 0.6 && <span style={{color: K.bg, fontWeight: 900, fontSize: 18}}>✓</span>}
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
      <div style={{position: 'absolute', left: 1250, top: 250, ...pop(b[3], 0, 0.9)}}>
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
            const f = b[3] - 8 - i * 12;
            const g = prog(f, 26);
            const H = 300;
            return (
              <div key={r.l} style={{position: 'absolute', left: 90 + i * 220, bottom: 60, width: 150, textAlign: 'center'}}>
                <Num size={44} color={i ? K.hero : K.ink}>
                  {(r.v * clamp01(g)).toFixed(r.d)}
                </Num>
                <div style={{width: 150, height: (r.v / 70) * H * g, background: r.c, borderRadius: '8px 8px 0 0', marginTop: 10, boxShadow: i ? `0 0 26px ${K.hero}55` : undefined}} />
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

export {HBars as _HBars};
