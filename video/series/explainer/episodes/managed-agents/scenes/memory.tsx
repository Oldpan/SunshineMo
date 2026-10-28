// Part 4: the session is not the context window, many brains / many hands, Dreaming (night scene), and the
// building blocks on top of the same primitives.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FlaskConical, Gamepad2, Moon, Plug, Search, Server, Smartphone, Sparkles, Trash2} from 'lucide-react';
import {ClaudeSpark} from '@atv/lib/brand/claude';
import {useBeats} from '@atv/lib/timing';
import {Box, Brain, Card, clamp01, Code, during, FONT_SERIF, Hand, Head, K, Lab, LogTape, Mo, N, Packet, Pill, prog, rise, Serif, Shell, SrcLine, usePopIn, Wire, Zh} from './common';

// ------------------------------------------------------------------ the session is not the context window
export const Log: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const cap = 24;
  const cell = 1728 / cap;
  // context window frame position (in cells)
  const win = 8;
  const squeeze = prog(b[1], 24, 6) * (1 - prog(b[3], 16));
  const pos = (() => {
    if (b[4] < 0) return cap - win;
    const t = b[4];
    // continue -> rewind -> reread
    if (t < 50) return cap - win;
    if (t < 110) return cap - win - 9 * prog(t, 30, 50);
    return 7 + 3 * prog(t, 24, 110);
  })();
  return (
    <Shell part="日志 ≠ 上下文">
      <Head kicker="THE SESSION IS NOT CLAUDE'S CONTEXT WINDOW" title="session 不是上下文窗口" />
      {/* the tape */}
      <div style={{position: 'absolute', left: 96, top: 300, width: 1728, height: 120, ...rise(b[0], 0)}}>
        {Array.from({length: cap}).map((_, i) => {
          const inWin = i >= cap - win;
          const thrown = b[3] < 0 && !inWin ? squeeze : 0;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * cell + 4,
                top: 20 - thrown * 40,
                width: cell - 8,
                height: 80,
                borderRadius: 6,
                background: K.stone,
                opacity: 1 - thrown,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${thrown * (i % 2 ? 14 : -10)}deg)`,
              }}
            >
              <Mo size={16} color={K.faint}>
                {i + 1}
              </Mo>
            </div>
          );
        })}
        {/* window frame */}
        <div
          style={{
            position: 'absolute',
            left: pos * cell - 6,
            top: 4,
            width: win * cell + 12,
            height: 112,
            border: `4px solid ${K.clay}`,
            borderRadius: 12,
            boxSizing: 'border-box',
            opacity: prog(b[0], 12, 16),
          }}
        />
        <div style={{position: 'absolute', left: pos * cell, top: -40, opacity: prog(b[0], 12, 16)}}>
          <Lab size={16} color={K.clay} w={700}>
            Claude 的上下文窗口
          </Lab>
        </div>
      </div>
      {/* compaction throws things away */}
      <div style={{position: 'absolute', left: 96, top: 470, width: 840, opacity: during(b[1], 0, b[1] - b[3] + 6, 10)}}>
        <div style={rise(b[1], 0)}>
          <Card style={{padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 18}}>
            <Trash2 size={34} color={K.red} />
            <div>
              <Zh size={26} w={800}>
                压缩、裁剪：决定扔掉什么
              </Zh>
              <div>
                <Zh size={22} w={600} color={K.red}>
                  扔了就回不来
                </Zh>
              </div>
            </div>
          </Card>
        </div>
        <div style={{marginTop: 16, ...rise(b[2], 0)}}>
          <Card style={{padding: '16px 24px'}}>
            <Zh size={26} w={800}>
              后面要用哪一段？很难提前知道
            </Zh>
          </Card>
        </div>
      </div>
      {/* getEvents */}
      <div style={{position: 'absolute', left: 96, top: 470, ...pop(b[3], 10)}}>
        <Code size={30} hot>
          getEvents()
        </Code>
        <Zh size={24} w={600} color={K.dim} style={{marginLeft: 18}}>
          日志完整留在窗口外，按位置取一段
        </Zh>
      </div>
      <div style={{position: 'absolute', left: 96, top: 560, display: 'flex', gap: 18}}>
        {[
          ['→', '接着上次读', 0],
          ['←', '倒回去看前因', 50],
          ['↺', '重读某一步之前', 110],
        ].map(([ic, t, at], i) => {
          const active = b[4] >= (at as number) && (i === 2 || b[4] < ([50, 110, 9999][i] as number));
          return (
            <div key={t as string} style={rise(b[4], (at as number) * 0.4)}>
              <Card hot={active} style={{padding: '14px 24px', display: 'flex', gap: 12, alignItems: 'center'}}>
                <Zh size={30} w={800} color={K.clay}>
                  {ic}
                </Zh>
                <Zh size={24} w={700}>
                  {t}
                </Zh>
              </Card>
            </div>
          );
        })}
      </div>
      {/* harness vs log responsibilities */}
      <div style={{position: 'absolute', left: 96, top: 680, width: 1728, display: 'flex', gap: 24, ...rise(b[5], 0)}}>
        <Card style={{flex: 1, padding: '18px 26px'}}>
          <Lab size={16} color={K.clay} w={700}>
            harness 负责
          </Lab>
          <div style={{marginTop: 6}}>
            <Zh size={26} w={800}>
              取出来怎么整理、怎么提高缓存命中
            </Zh>
          </div>
        </Card>
        <Card hot style={{flex: 1, padding: '18px 26px'}}>
          <Lab size={16} color={K.clay} w={700}>
            session 只保证
          </Lab>
          <div style={{marginTop: 6}}>
            <Zh size={26} w={800}>
              不丢，随时可查
            </Zh>
          </div>
        </Card>
      </div>
      <SrcLine f={b[0]}>来源：《Scaling Managed Agents》· The session is not Claude's context window</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ many brains, many hands
export const Hands: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const kinds = [
    {ic: <Server size={30} color={K.dim} />, t: '容器'},
    {ic: <Smartphone size={30} color={K.dim} />, t: '手机'},
    {ic: <Gamepad2 size={30} color={K.dim} />, t: '宝可梦模拟器'},
    {ic: <Plug size={30} color={K.dim} />, t: 'MCP 服务器'},
  ];
  const b1 = {x: 140, y: 300};
  const b2 = {x: 140, y: 600};
  const hx = 1180;
  const hy = (i: number) => 240 + i * 150;
  const pass = prog(b[3], 30, 16);
  const from = (i: number, br: {x: number; y: number}): [number, number][] => [
    [br.x + 280, br.y + 100],
    [760, br.y + 100],
    [760, hy(i) + 60],
    [hx, hy(i) + 60],
  ];
  const callT = b[1] < 0 ? -1 : (b[1] % 60) / 60;
  return (
    <Shell part="多个脑，多只手">
      <Head kicker="MANY BRAINS, MANY HANDS" title="一个脑，连很多只手" />
      <Brain x={b1.x} y={b1.y} w={280} h={200} />
      {kinds.map((k, i) => {
        const toB2 = i === 3 ? pass : 0;
        return (
          <React.Fragment key={k.t}>
            <Wire pts={from(i, b1)} p={prog(b[0], 18, 6 + i * 5) * (1 - toB2)} />
            {i === 3 && toB2 > 0 && <Wire pts={from(i, b2)} p={toB2} color={K.clay} />}
            <div style={{position: 'absolute', left: hx, top: hy(i), width: 420, ...pop(b[0], 10 + i * 6)}}>
              <Box x={0} y={0} w={420} h={120} bg={K.stone} radius={12} center={false} style={{padding: '0 24px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 18}}>
                {k.ic}
                <Zh size={28} w={800} style={{opacity: prog(b[2], 12, i * 6)}}>
                  {k.t}
                </Zh>
                <div style={{marginLeft: 'auto', opacity: prog(b[2], 12) * (1 - prog(b[2], 12, 0)) + (b[2] < 0 ? 1 : 0)}}>
                  <Lab size={14} color={K.faint}>
                    hand
                  </Lab>
                </div>
              </Box>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 560, top: 236, ...pop(b[1], 0)}}>
        <Code size={24} hot>
          execute(name, input) → string
        </Code>
      </div>
      {callT >= 0 && b[3] < 0 && [0, 1, 2, 3].map((i) => <Packet key={i} pts={from(i, b1)} t={clamp01(callT * 1.3 - i * 0.1)} />)}
      <div style={{opacity: prog(b[3], 14)}}>
        <Brain x={b2.x} y={b2.y} w={280} h={200} label="另一个脑" sub="" />
      </div>
      <div style={{position: 'absolute', left: 470, top: 830, ...rise(b[3], 30)}}>
        <Zh size={22} w={600} color={K.dim}>
          手不绑在哪个脑上，可以递来递去
        </Zh>
      </div>
      {/* model capability note */}
      <div style={{position: 'absolute', left: 1180, top: 840, width: 640, display: 'flex', gap: 12, alignItems: 'center'}}>
        <div style={rise(b[4], 0)}>
          <Pill style={{fontSize: 21}}>早期模型 → 一个容器</Pill>
        </div>
        <div style={rise(b[5], 0)}>
          <Pill bg={K.peach} border="rgba(201,96,63,0.35)" style={{fontSize: 21}}>
            模型变强 → 单容器成了限制
          </Pill>
        </div>
      </div>
      <SrcLine f={b[0]}>来源：《Scaling Managed Agents》· Many hands</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ dreaming (night)
const Star: React.FC<{x: number; y: number; s: number; f: number}> = ({x, y, s, f}) => (
  <div style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: N.moon, opacity: 0.35 + 0.35 * Math.sin(f / 18 + x)}} />
);

const MemRow: React.FC<{t: string; mark?: string; color?: string; o?: number; strike?: number}> = ({t, mark, color = N.dim, o = 1, strike = 0}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 44, padding: '0 16px', background: N.panel2, borderRadius: 8, marginBottom: 10, opacity: o}}>
    <Mo size={18} color={N.ink} style={{textDecoration: strike > 0.5 ? 'line-through' : 'none'}}>
      {t}
    </Mo>
    {mark && (
      <span style={{marginLeft: 'auto', fontFamily: 'inherit'}}>
        <Zh size={18} w={700} color={color}>
          {mark}
        </Zh>
      </span>
    )}
  </div>
);

export const Dream: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const phaseA = during(b[0], 0, b[0] - b[3] + 6, 12);
  const phaseB = during(b[3], 0, b[3] - b[6] + 6, 12);
  const phaseC = b[6] < 0 ? 0 : prog(b[6], 14);
  const moonY = 200 - prog(b[0], 40) * 40;
  const stars = [
    [1500, 250, 6],
    [1620, 330, 4],
    [1750, 230, 5],
    [1380, 380, 3],
    [1700, 450, 4],
    [1260, 270, 4],
    [180, 260, 4],
    [90, 520, 3],
  ];
  const flow = (b[4] < 0 ? 0 : b[4]) / 50;
  return (
    <Shell night>
      {/* night header */}
      <div style={{position: 'absolute', left: 96, top: 58}}>
        <div style={{opacity: prog(b[0], 14)}}>
          <Lab size={19} color={N.glow} w={700}>
            DREAMING · RESEARCH PREVIEW
          </Lab>
        </div>
        <div style={{marginTop: 10, ...rise(b[0], 4)}}>
          <Serif size={58} color={N.ink}>
            Dreaming：给 agent 睡一觉
          </Serif>
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, right: 96, top: 180, height: 1.5, background: N.line}} />
      {stars.map(([x, y, s], i) => (
        <Star key={i} x={x} y={y} s={s} f={frame} />
      ))}
      <div style={{position: 'absolute', right: 140, top: moonY, opacity: prog(b[0], 30)}}>
        <Moon size={90} color={N.moon} fill={N.moon} />
      </div>

      {/* phase A: the human analogy + a messy store */}
      <div style={{opacity: phaseA}}>
        <div style={{position: 'absolute', left: 140, top: 280, width: 700, ...rise(b[0], 12)}}>
          <svg width={300} height={340} viewBox="0 0 300 340">
            <path d="M 150 20 C 240 20 280 90 270 160 C 262 210 240 230 240 260 L 240 320 L 120 320 L 120 280 C 70 280 50 250 56 220 L 30 200 L 56 170 C 40 80 80 20 150 20 Z" fill={N.panel} stroke={N.line} strokeWidth={3} />
          </svg>
          {/* replayed memories drift through the head */}
          {['会议', '一句夸奖', '路上的噪音', '写到一半的方案', '广告'].map((m, i) => {
            const keep = i === 1 || i === 3;
            const t = ((b[1] < 0 ? 0 : b[1]) / 30 + i * 0.7) % 4;
            const x = 360 + (t / 4) * 300;
            const fade = keep ? 1 : clamp01(1 - (t - 2) / 1.5);
            return (
              <div key={m} style={{position: 'absolute', left: x, top: 20 + i * 62, opacity: prog(b[1], 12, i * 8) * fade}}>
                <span style={{background: keep ? N.glow : N.panel2, color: keep ? N.bg : N.dim, fontFamily: 'inherit', borderRadius: 999, padding: '6px 16px', whiteSpace: 'nowrap'}}>
                  <Zh size={22} w={700} color={keep ? N.bg : N.dim}>
                    {m}
                  </Zh>
                </span>
              </div>
            );
          })}
          <div style={{marginTop: 10, ...rise(b[1], 30)}}>
            <Zh size={24} w={600} color={N.dim}>
              留下重要的，放掉杂音
            </Zh>
          </div>
        </div>
        <div style={{position: 'absolute', left: 1080, top: 300, width: 640, ...rise(b[2], 0)}}>
          <Lab size={16} color={N.glow} w={700}>
            用久了的记忆库
          </Lab>
          <div style={{marginTop: 12}}>
            {[
              ['偏好：用 4 空格缩进', '重复', N.clay],
              ['偏好：用 4 空格缩进', '重复', N.clay],
              ['部署走 staging 分支', '矛盾', N.glow],
              ['部署直接推 main', '矛盾', N.glow],
              ['API 版本 v1（旧）', '过期', N.dim],
            ].map(([t, m, c], i) => (
              <div key={i} style={rise(b[2], 8 + i * 8)}>
                <MemRow t={t} mark={m} color={c} />
              </div>
            ))}
          </div>
          <div style={{marginTop: 4}}>
            <Zh size={19} w={600} color={N.dim}>
              条目为示意
            </Zh>
          </div>
        </div>
      </div>

      {/* phase B: inputs -> dream -> new store */}
      <div style={{opacity: phaseB, position: 'absolute', inset: 0, transform: 'translateY(50px)'}}>
        <div style={{position: 'absolute', left: 120, top: 260, width: 460}}>
          <div style={rise(b[3], 0)}>
            <Box x={0} y={0} w={460} h={130} bg={N.panel} radius={14} style={{border: `1.5px solid ${N.line}`}}>
              <Zh size={28} w={800} color={N.ink}>
                现有记忆库
              </Zh>
              <Lab size={14} color={N.dim} style={{marginTop: 6}}>
                memory store
              </Lab>
            </Box>
          </div>
          <div style={{position: 'absolute', top: 160, ...rise(b[3], 12)}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{position: 'absolute', left: i * 14, top: i * 12, width: 400, height: 90, background: N.panel2, borderRadius: 10, border: `1.5px solid ${N.line}`}} />
            ))}
            <div style={{position: 'absolute', left: 80, top: 70, width: 400}}>
              <Zh size={26} w={800} color={N.ink}>
                1–100 个过去的 session
              </Zh>
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 700, top: 360, ...pop(b[3], 20)}}>
          <Box x={0} y={0} w={260} h={200} bg={N.glow} radius={100}>
            <Moon size={44} color={N.bg} fill={N.bg} />
            <Zh size={32} w={800} color={N.bg} style={{marginTop: 6}}>
              一次 dream
            </Zh>
          </Box>
        </div>
        {[0, 1].map((i) => (
          <div key={i} style={{position: 'absolute', left: 600, top: 400 + i * 120, width: 100, height: 3, background: N.glow, opacity: prog(b[3], 12, 24), transform: `scaleX(${prog(b[3], 16, 24)})`, transformOrigin: 'left'}} />
        ))}
        <div style={{position: 'absolute', left: 980, top: 458, width: 100, height: 3, background: N.glow, opacity: prog(b[4], 12), transform: `scaleX(${prog(b[4], 16)})`, transformOrigin: 'left'}} />
        <div style={{position: 'absolute', left: 1100, top: 260, width: 640, ...rise(b[4], 6)}}>
          <Lab size={16} color={N.glow} w={700}>
            新的记忆库
          </Lab>
          <div style={{marginTop: 12}}>
            <MemRow t="偏好：用 4 空格缩进" mark="合并重复" color={N.glow} />
            <MemRow t="部署走 staging 分支（最新）" mark="换成最新值" color={N.glow} />
            <MemRow t="API 版本 v2" mark="替换过期" color={N.glow} />
            <div style={pop(b[4], 30 + Math.min(10, flow))}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 44, padding: '0 16px', background: N.glow, borderRadius: 8}}>
                <Sparkles size={20} color={N.bg} />
                <Zh size={20} w={800} color={N.bg}>
                  新洞见：周五别发版
                </Zh>
              </div>
            </div>
          </div>
          <div style={{marginTop: 8}}>
            <Zh size={19} w={600} color={N.dim}>
              条目为示意
            </Zh>
          </div>
        </div>
        <div style={{position: 'absolute', left: 120, top: 760, display: 'flex', gap: 16, alignItems: 'center', ...rise(b[5], 0)}}>
          <Pill bg={N.panel2} color={N.ink} border={N.line}>
            原库一个字都不改
          </Pill>
          <Zh size={24} w={600} color={N.dim}>
            看完结果：
          </Zh>
          <Pill bg={N.glow} color={N.bg} border={N.glow}>
            用
          </Pill>
          <Pill bg={N.panel2} color={N.ink} border={N.line}>
            扔
          </Pill>
        </div>
      </div>

      {/* phase C: one managed agent inspects another, then it is managed agents all the way down */}
      <div style={{opacity: phaseC}}>
        <div style={{opacity: 1 - prog(b[7], 14)}}>
          <div style={{position: 'absolute', left: 120, top: 250, width: 800, height: 480, border: `2px solid ${N.glow}`, borderRadius: 24}}>
            <div style={{position: 'absolute', left: 18, top: 10}}>
              <Lab size={15} color={N.glow}>
                managed agent · dream
              </Lab>
            </div>
            <div style={{position: 'absolute', left: 40, top: 60, width: 720, height: 170, border: `1.5px solid ${N.line}`, borderRadius: 16, background: N.panel}}>
              <div style={{position: 'absolute', left: 16, top: 10}}>
                <Lab size={14} color={N.dim}>
                  上一个 managed agent 的 session
                </Lab>
              </div>
              <LogTape x={20} y={60} w={680} n={16} cap={16} label={false} dark hot={b[6] < 0 ? -1 : Math.floor(b[6] / 9) % 16} />
              <div style={{position: 'absolute', left: 20 + ((b[6] < 0 ? 0 : b[6] / 9) % 16) * 42.5, top: 112, opacity: prog(b[6], 10, 6)}}>
                <Search size={34} color={N.glow} />
              </div>
            </div>
            <Wire pts={[[400, 240], [400, 300]]} p={prog(b[6], 14, 40)} color={N.glow} width={3} arrow />
            <div style={{position: 'absolute', left: 200, top: 320, width: 400, ...rise(b[6], 46)}}>
              <Box x={0} y={0} w={400} h={110} bg={N.panel2} radius={14} style={{border: `1.5px solid ${N.line}`}}>
                <Zh size={26} w={800} color={N.ink}>
                  写出新的记忆库
                </Zh>
              </Box>
            </div>
          </div>
        </div>
        {[0, 1, 2, 3].map((i) => {
          const sc = 1 - i * 0.2;
          const w = 800 * sc;
          const h = 480 * sc;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 120 + (800 - w) / 2,
                top: 250 + (480 - h) / 2,
                width: w,
                height: h,
                border: `2px solid ${i === 0 ? N.glow : N.line}`,
                borderRadius: 24,
                opacity: prog(b[7], 12, i * 8),
              }}
            >
              <div style={{position: 'absolute', left: 18, top: 10}}>
                <Lab size={15} color={i === 0 ? N.glow : N.dim}>
                  managed agent
                </Lab>
              </div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 1000, top: 270, width: 780, ...rise(b[6], 0)}}>
          <Card style={{background: N.panel, border: `1.5px solid ${N.line}`, padding: '22px 28px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <ClaudeSpark size={34} color={K.orange} />
              <Zh size={28} w={800} color={N.ink}>
                再起一个 managed agent
              </Zh>
            </div>
            <div style={{marginTop: 10}}>
              <Zh size={24} w={600} color={N.dim}>
                检查上一个的工作 → 写出新的记忆库
              </Zh>
            </div>
          </Card>
        </div>
        <div style={{position: 'absolute', left: 1000, top: 470, width: 780, ...rise(b[7], 0)}}>
          <Serif size={44} color={N.glow} style={{lineHeight: 1.25}}>
            “It’s managed agents
            <br />
            all the way down.”
          </Serif>
          <div style={{marginTop: 8}}>
            <Zh size={24} w={600} color={N.dim}>
              一路往下，全是 managed agent
            </Zh>
          </div>
        </div>
        <div style={{position: 'absolute', left: 1000, top: 700, display: 'flex', gap: 14, ...rise(b[8], 0)}}>
          <Pill bg={N.panel2} color={N.ink} border={N.line}>
            <FlaskConical size={20} color={N.glow} /> 研究预览
          </Pill>
          <Pill bg={N.panel2} color={N.ink} border={N.line}>
            通常几分钟到几小时
          </Pill>
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, bottom: 150, opacity: 0.95 * prog(b[0], 14)}}>
        <span style={{fontFamily: 'inherit', fontSize: 19, fontWeight: 500, color: N.dim}}>
          <Zh size={19} w={500} color={N.dim}>
            来源：Managed Agents 文档 · Dreams；节目 46:30「managed agents all the way down」；睡眠整理记忆为比喻
          </Zh>
        </span>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ building blocks
export const Blocks: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const tops = [
    {t: 'Dreaming', s: '已推出，研究预览'},
    {t: 'best-of-N', s: '多跑几次挑最好的'},
    {t: '验证 agent', s: '另起一个来检查'},
  ];
  const slow = prog(b[4], 30, 10);
  return (
    <Shell part="同一套积木">
      <Head kicker="MULTI-AGENT STRATEGIES" title="同一套积木，拼出更多" />
      {/* base */}
      <div style={{position: 'absolute', left: 96, top: 640, width: 1000, ...rise(b[0], 0)}}>
        <Box x={0} y={0} w={1000} h={110} bg={K.stone2} radius={12}>
          <Zh size={28} w={800}>
            Managed Agents 原语：session · harness · sandbox
          </Zh>
        </Box>
      </div>
      {tops.map((x, i) => (
        <div key={x.t} style={{position: 'absolute', left: 96 + i * 340, top: 430, width: 320, ...pop(b[0], 14 + i * 10)}}>
          <Box x={0} y={0} w={320} h={180} bg={i === 0 ? K.peach : K.cream} radius={12} style={{border: i === 0 ? '2px solid rgba(201,96,63,0.4)' : undefined}}>
            <Mo size={30} w={700}>
              {x.t}
            </Mo>
            <Zh size={22} w={600} color={K.dim} style={{marginTop: 8}}>
              {x.s}
            </Zh>
          </Box>
        </div>
      ))}
      <div style={{position: 'absolute', left: 96, top: 250, width: 1000, ...rise(b[1], 0)}}>
        <Card style={{padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 18}}>
          <Zh size={26} w={800}>
            harness 故意做得很简单
          </Zh>
          <Zh size={24} w={600} color={K.clay}>
            ↑ 复杂策略放在上一层，爬坡优化
          </Zh>
        </Card>
      </div>
      {/* coming */}
      <div style={{position: 'absolute', left: 1160, top: 250, width: 664, ...rise(b[2], 0)}}>
        <div style={{border: `2.5px dashed ${K.clay}`, borderRadius: 18, padding: '22px 26px'}}>
          <Lab size={16} color={K.clay} w={700}>
            他们说很快会开放
          </Lab>
          <div style={{marginTop: 10}}>
            <Zh size={28} w={800}>
              底层原语 → 自己搭多 agent 策略
            </Zh>
          </div>
          <div style={{marginTop: 6}}>
            <Zh size={24} w={600} color={K.dim}>
              附带 Dreaming 的模板
            </Zh>
          </div>
          <div style={{marginTop: 16, ...pop(b[3], 0)}}>
            <span style={{display: 'inline-block', border: `3px solid ${K.red}`, color: K.red, borderRadius: 8, padding: '4px 16px', transform: 'rotate(-4deg)'}}>
              <Zh size={26} w={800} color={K.red}>
                计划，不是已上线的功能
              </Zh>
            </span>
          </div>
        </div>
      </div>
      {/* focus shift */}
      <div style={{position: 'absolute', left: 1160, top: 610, width: 664, ...rise(b[4], 0)}}>
        <Card style={{padding: '20px 26px'}}>
          <Lab size={16} color={K.dim}>
            比起年初，团队精力
          </Lab>
          {[
            {t: 'skills、记忆、Dreaming', v: 0.7 - 0.3 * slow, c: K.stone2},
            {t: '安全', v: 0.4 + 0.5 * slow, c: K.clay},
          ].map((r) => (
            <div key={r.t} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 12}}>
              <div style={{width: 280, whiteSpace: 'nowrap'}}>
                <Zh size={22} w={700}>
                  {r.t}
                </Zh>
              </div>
              <div style={{width: 300, height: 26, background: 'rgba(20,20,19,0.05)', borderRadius: 6}}>
                <div style={{width: 300 * r.v, height: 26, background: r.c, borderRadius: 6}} />
              </div>
            </div>
          ))}
          <div style={{marginTop: 8}}>
            <Zh size={18} w={600} color={K.faint}>
              长短为示意，只表示方向
            </Zh>
          </div>
        </Card>
      </div>
      <SrcLine f={b[0]}>来源：节目 44:20–48:05（自动转写）；“很快开放”的内容按计划讲，不当承诺</SrcLine>
    </Shell>
  );
};
