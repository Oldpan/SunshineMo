// Part 1 + 2: the three parts (session / harness / sandbox), the pet container, the split, the harness waking
// back up from the log, and the time-to-first-token payoff.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HardDrive, Heart, Network, Search, Skull} from 'lucide-react';
import {ClaudeSpark} from '@atv/lib/brand/claude';
import {useBeats} from '@atv/lib/timing';
import {
  Bar,
  Box,
  Brain,
  Card,
  clamp01,
  Code,
  during,
  FONT_SERIF,
  Hand,
  Head,
  Illus,
  K,
  Lab,
  LogTape,
  Mo,
  Packet,
  Pill,
  prog,
  rise,
  Serif,
  Shell,
  SrcLine,
  usePopIn,
  Wire,
  Zh,
} from './common';

// ------------------------------------------------------------------ three parts
export const Parts: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const col = (i: number) => 96 + i * 590;
  const swap = prog(b[5], 24, 6);
  const ticks = b[1] < 0 ? 0 : Math.min(14, 3 + b[1] / 18);
  return (
    <Shell part="三个零件">
      <Head kicker="SESSION · HARNESS · SANDBOX" title="一个 agent，三个零件" />
      {/* session */}
      <div style={{position: 'absolute', left: col(0), top: 236, width: 548, ...pop(b[1], 0)}}>
        <Card style={{padding: '24px 26px', height: 330}}>
          <Lab size={18} color={K.clay} w={700}>
            session
          </Lab>
          <div style={{marginTop: 6}}>
            <Zh size={34} w={800}>
              只追加的日志
            </Zh>
          </div>
          <LogTape x={26} y={150} w={496} n={ticks} cap={14} label={false} />
          <div style={{position: 'absolute', left: 26, top: 220}}>
            <Zh size={22} w={500} color={K.dim}>
              发生过的每件事都记在里面
            </Zh>
          </div>
        </Card>
      </div>
      {/* harness */}
      <div style={{position: 'absolute', left: col(1), top: 236, width: 548, ...pop(b[2], 0)}}>
        <Card hot style={{padding: '24px 26px', height: 330}}>
          <Lab size={18} color={K.clay} w={700}>
            harness
          </Lab>
          <div style={{marginTop: 6}}>
            <Zh size={34} w={800}>
              调用 Claude 的循环
            </Zh>
          </div>
          <div style={{position: 'absolute', left: 26, top: 140, display: 'flex', alignItems: 'center', gap: 18}}>
            <svg width={110} height={110} viewBox="0 0 100 100" style={{transform: `rotate(${frame * 2}deg)`}}>
              <path d="M 50 10 A 40 40 0 1 1 16 30" fill="none" stroke={K.clay} strokeWidth={6} strokeLinecap="round" />
              <path d="M 8 24 L 16 33 L 25 23" fill="none" stroke={K.clay} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <Zh size={24} w={600}>
                Claude 想调工具
              </Zh>
              <div>
                <Zh size={24} w={600} color={K.clay}>
                  → 送到该去的地方
                </Zh>
              </div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 64, top: 175}}>
            <ClaudeSpark size={34} color={K.orange} />
          </div>
        </Card>
      </div>
      {/* sandbox */}
      <div style={{position: 'absolute', left: col(2), top: 236, width: 548, ...pop(b[3], 0)}}>
        <Card style={{padding: '24px 26px', height: 330}}>
          <Lab size={18} color={K.clay} w={700}>
            sandbox
          </Lab>
          <div style={{marginTop: 6}}>
            <Zh size={34} w={800}>
              跑代码、改文件的地方
            </Zh>
          </div>
          <div style={{position: 'absolute', left: 26, right: 26, top: 140, height: 150, background: '#1F1E1B', borderRadius: 10, padding: '16px 18px', boxSizing: 'border-box'}}>
            {['$ python test.py', '  12 passed', '$ git diff --stat'].map((l, i) => (
              <div key={l} style={{opacity: prog(b[3], 8, 12 + i * 10)}}>
                <Mo size={22} color={i === 1 ? '#9CCB8F' : '#EDEBE4'}>
                  {l}
                </Mo>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {/* OS analogy */}
      <div style={{position: 'absolute', left: 96, top: 610, width: 1728, ...rise(b[4], 0)}}>
        <Card style={{padding: '26px 34px', display: 'flex', alignItems: 'center', gap: 40, height: 230}}>
          <div style={{width: 360}}>
            <Lab size={17} color={K.dim}>
              操作系统的老办法
            </Lab>
            <div style={{marginTop: 10}}>
              <Code size={44} hot>
                read()
              </Code>
            </div>
            <div style={{marginTop: 14}}>
              <Zh size={24} w={600}>
                接口稳住
              </Zh>
              <Zh size={24} w={600} color={K.clay}>
                ，实现随便换
              </Zh>
            </div>
          </div>
          <svg width={120} height={60}>
            <path d="M 0 30 L 110 30 M 96 18 L 110 30 L 96 42" stroke={K.line} strokeWidth={3} fill="none" />
          </svg>
          <div style={{position: 'relative', width: 1000, height: 170}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 440, opacity: 1 - swap * 0.6, transform: `translateY(${swap * 10}px)`}}>
              <Box x={0} y={0} w={440} h={170} bg={K.stone} radius={12}>
                <HardDrive size={56} color={K.dim} />
                <Zh size={28} w={700} style={{marginTop: 8}}>
                  七十年代的磁盘
                </Zh>
              </Box>
            </div>
            <div style={{position: 'absolute', left: 520, top: 0, width: 440, ...pop(b[4], 70)}}>
              <Box x={0} y={0} w={440} h={170} bg={K.peach} radius={12} style={{border: '2px solid rgba(201,96,63,0.4)'}}>
                <HardDrive size={56} color={K.clay} />
                <Zh size={28} w={700} style={{marginTop: 8}}>
                  今天的 SSD
                </Zh>
              </Box>
            </div>
            <div style={{position: 'absolute', left: 448, top: 64, opacity: prog(b[5], 10, 10)}}>
              <Zh size={36} w={800} color={K.clay}>
                ⇄
              </Zh>
            </div>
          </div>
        </Card>
      </div>
      <SrcLine f={b[1]}>来源：Anthropic 工程博客《Scaling Managed Agents》</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ the pet container
export const Pet: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const beat = (Math.sin(frame / 7) + 1) / 2;
  const probs = [
    {ic: <Skull size={34} color={K.red} />, t: '容器一挂，session 就没了', s: '卡住了，只能想办法救回来', at: 4},
    {ic: <Search size={34} color={K.red} />, t: '排查问题，得进到容器里', s: '可里面还有用户数据 = 等于没法查', at: 5},
    {ic: <Network size={34} color={K.red} />, t: '连客户的私有网络', s: '要么打通网络，要么客户自己跑 harness', at: 6},
  ];
  return (
    <Shell part="第一版">
      <Head kicker="DON'T ADOPT A PET" title="第一版：全塞进一个容器" />
      {/* the container */}
      <div style={{position: 'absolute', left: 96, top: 236, width: 780, height: 600, ...rise(b[0], 0)}}>
        <div style={{position: 'absolute', inset: 0, border: `3px solid ${K.stone2}`, borderRadius: 26, background: 'rgba(232,230,220,0.35)'}} />
        <div style={{position: 'absolute', left: 26, top: 18}}>
          <Lab size={18} color={K.dim}>
            一个容器
          </Lab>
        </div>
        <LogTape x={50} y={70} w={680} n={b[0] < 0 ? 0 : Math.min(18, 4 + b[0] / 30)} label={false} />
        <Zh size={20} w={600} color={K.dim} style={{position: 'absolute', left: 52, top: 126}}>
          session
        </Zh>
        <Brain x={50} y={180} w={300} h={230} />
        <Hand x={400} y={210} w={330} h={170} label="沙箱" />
        <div style={{position: 'absolute', left: 50, top: 440, width: 680, ...rise(b[1], 0)}}>
          <Card style={{padding: '18px 24px'}}>
            <Zh size={24} w={700} color={K.green}>
              ✓ 简单：改文件就是一次系统调用
            </Zh>
            <div>
              <Zh size={24} w={700} color={K.green}>
                ✓ 不用设计服务之间的边界
              </Zh>
            </div>
          </Card>
        </div>
        {/* pet tag */}
        <div style={{position: 'absolute', right: -20, top: -24, ...pop(b[2], 0)}}>
          <div style={{background: K.clay, color: '#fff', borderRadius: 999, padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${1 + beat * 0.04})`}}>
            <Heart size={26} color="#fff" fill="#fff" />
            <span style={{fontFamily: 'inherit', fontSize: 28, fontWeight: 800}}>
              <Zh size={28} w={800} color="#fff">
                宠物
              </Zh>
            </span>
          </div>
        </div>
      </div>
      {/* pets vs cattle */}
      <div style={{position: 'absolute', left: 940, top: 236, width: 884, ...rise(b[3], 0)}}>
        <Card style={{padding: '20px 26px', display: 'flex', gap: 30, alignItems: 'center'}}>
          <div style={{width: 300}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <Heart size={26} color={K.clay} fill={K.clay} />
              <Zh size={30} w={800}>
                宠物
              </Zh>
            </div>
            <Zh size={21} w={500} color={K.dim}>
              有名字、要人照顾、丢不起
            </Zh>
          </div>
          <div style={{width: 1.5, height: 90, background: K.hair}} />
          <div>
            <div style={{display: 'flex', gap: 8}}>
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} style={{width: 44, height: 44, background: K.stone, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', ...pop(b[3], 8 + i * 2)}}>
                  <Mo size={16} color={K.faint}>
                    {String(i + 1).padStart(2, '0')}
                  </Mo>
                </div>
              ))}
            </div>
            <div style={{marginTop: 6}}>
              <Zh size={30} w={800}>
                牛群
              </Zh>
              <Zh size={21} w={500} color={K.dim}>
                ：可以互相替换
              </Zh>
            </div>
          </div>
        </Card>
      </div>
      {probs.map((p, i) => (
        <div key={p.t} style={{position: 'absolute', left: 940, top: 438 + i * 136, width: 884, ...rise(b[p.at], 0)}}>
          <Card style={{padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 22, height: 118}}>
            {p.ic}
            <div>
              <Zh size={29} w={800}>
                {p.t}
              </Zh>
              <div>
                <Zh size={22} w={500} color={K.dim}>
                  {p.s}
                </Zh>
              </div>
            </div>
          </Card>
        </div>
      ))}
      <SrcLine f={b[0]}>来源：《Scaling Managed Agents》· Don't adopt a pet</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ the split
export const Split: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const apart = prog(b[0], 26, 4);
  const bx = 120;
  const by = 330;
  const hands = [0, 1, 2];
  const hy = (i: number) => 250 + i * 190;
  const hx = 1180;
  // call packet brain -> hand 0 -> back
  const callT = b[3] < 0 ? -1 : (b[3] % 70) / 70;
  const dead = prog(b[4], 12, 4);
  const back = b[4] < 0 ? -1 : clamp01((b[4] - 14) / 40);
  const fresh = prog(b[5], 16, 10);
  const wireTo = (i: number): [number, number][] => [
    [bx + 330, by + 120],
    [820, by + 120],
    [820, hy(i) + 70],
    [hx, hy(i) + 70],
  ];
  return (
    <Shell part="拆开">
      <Head kicker="DECOUPLE THE BRAIN FROM THE HANDS" title="把脑和手分开" />
      <div style={{transform: `translateX(${(1 - apart) * 200}px)`, opacity: prog(b[0], 12)}}>
        <Brain x={bx} y={by} w={330} h={250} />
      </div>
      <div style={{position: 'absolute', left: bx, top: by + 270, width: 330, textAlign: 'center', ...rise(b[1], 0)}}>
        <Zh size={24} w={700}>
          脑 = Claude + harness
        </Zh>
      </div>
      {hands.map((i) => (
        <React.Fragment key={i}>
          <Wire pts={wireTo(i)} p={prog(b[2], 20, 4 + i * 4)} />
          <div style={{opacity: prog(b[0], 14, 10 + i * 4), transform: `translateX(${(1 - apart) * -160}px)`}}>
            {i === 0 && b[5] >= 10 ? (
              <div style={{opacity: fresh, transform: `scale(${0.85 + 0.15 * fresh})`}}>
                <Hand x={hx} y={hy(i)} w={300} h={140} label="新沙箱" tag="provision" />
              </div>
            ) : (
              <Hand x={hx} y={hy(i)} w={300} h={140} label={`沙箱 ${i + 1}`} dead={i === 0 ? dead * (1 - prog(b[5], 10)) : 0} />
            )}
          </div>
        </React.Fragment>
      ))}
      <div style={{position: 'absolute', left: hx + 330, top: 330, width: 220, ...rise(b[1], 8)}}>
        <Zh size={24} w={700}>
          手 = 沙箱 + 工具
        </Zh>
      </div>
      <div style={{position: 'absolute', left: hx + 330, top: 400, width: 260, ...rise(b[5], 18)}}>
        <Pill bg={K.peach} border="rgba(201,96,63,0.35)">
          宠物 → 牛
        </Pill>
      </div>
      {/* session log, stored on its own */}
      <LogTape x={bx} y={790} w={600} n={b[1] < 0 ? 0 : Math.min(16, 4 + b[1] / 20)} cap={16} />
      <div style={{position: 'absolute', left: bx + 620, top: 820, ...rise(b[1], 14)}}>
        <Zh size={22} w={600} color={K.dim}>
          ← 日志单独存放
        </Zh>
      </div>
      {/* execute() chip */}
      <div style={{position: 'absolute', left: 120, top: 220, ...pop(b[3], 0)}}>
        <Code size={30} hot>
          execute(name, input) → string
        </Code>
      </div>
      <div style={{position: 'absolute', left: 120, top: 280, ...rise(b[2], 20)}}>
        <Zh size={24} w={600} color={K.dim}>
          调用容器，就像调用任何一个工具
        </Zh>
      </div>
      {b[4] < 0 && <Packet pts={wireTo(0)} t={callT < 0.5 ? callT * 2 : 0} />}
      {b[4] < 0 && callT >= 0.5 && <Packet pts={[...wireTo(0)].reverse()} t={(callT - 0.5) * 2} color={K.ink} size={12} />}
      {/* failure travels back as a tool error */}
      {back > 0 && back < 1 && <Packet pts={[...wireTo(0)].reverse()} t={back} color={K.red} />}
      <div style={{position: 'absolute', left: 520, top: 520, ...rise(b[4], 30), opacity: Math.min(prog(b[4], 16, 30), during(b[4], 30, b[4] - b[5], 8))}}>
        <Card style={{padding: '14px 20px', border: `2px solid ${K.red}`}}>
          <Mo size={22} color={K.red}>
            tool_error: container died
          </Mo>
          <div style={{marginTop: 6}}>
            <Zh size={22} w={700}>
              Claude：要不要重试？
            </Zh>
          </div>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 520, top: 540, ...pop(b[5], 10)}}>
        <Code size={24}>provision({'{'}resources{'}'})</Code>
      </div>
      <SrcLine f={b[0]}>来源：《Scaling Managed Agents》· Decouple the brain from the hands</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ the brain wakes back up
export const Wake: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const crash = prog(b[2], 14);
  const reborn = prog(b[2], 16, 26);
  const fetch = prog(b[2], 30, 44);
  const n0 = 11;
  const grow = b[4] < 0 ? 0 : Math.min(6, b[4] / 22);
  return (
    <Shell part="拆开">
      <Head kicker="RECOVERING FROM HARNESS FAILURE" title="脑也可以倒下，再起来" />
      {/* old brain */}
      <div style={{opacity: (1 - crash) * prog(b[0], 12), transform: `rotate(${crash * -8}deg) translateY(${crash * 40}px)`, filter: `grayscale(${crash})`}}>
        <Brain x={200} y={250} w={340} h={250} label="harness A" sub="" />
      </div>
      {crash > 0.4 && (
        <div style={{position: 'absolute', left: 230, top: 520, opacity: 1 - reborn}}>
          <Zh size={30} w={800} color={K.red}>
            崩了
          </Zh>
        </div>
      )}
      {/* new brain */}
      <div style={{opacity: reborn, transform: `scale(${0.85 + 0.15 * reborn})`}}>
        <Brain x={760} y={250} w={340} h={250} label="harness B" sub="新的一个" />
      </div>
      <div style={{position: 'absolute', left: 1160, top: 270, display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={pop(b[2], 26)}>
          <Code size={28}>wake(sessionId)</Code>
        </div>
        <div style={pop(b[2], 44)}>
          <Code size={28}>getSession(id)</Code>
        </div>
        <div style={pop(b[4], 0)}>
          <Code size={28} hot>
            emitEvent(id, event)
          </Code>
        </div>
      </div>
      {/* the log lives outside */}
      <div style={rise(b[1], 0)}>
        <LogTape x={200} y={640} w={1400} n={n0 + grow} cap={20} hot={b[3] >= 0 && b[4] < 0 ? n0 - 1 : -1} />
        <div style={{position: 'absolute', left: 200, top: 600}}>
          <Zh size={22} w={600} color={K.dim}>
            日志在 harness 外面 → harness 里没有什么必须活下来
          </Zh>
        </div>
      </div>
      <Wire pts={[[930, 630], [930, 510]]} p={fetch} color={K.clay} width={3} arrow />
      <div style={{position: 'absolute', left: 200 + (n0 - 1) * 70 - 40, top: 740, ...rise(b[3], 0)}}>
        <Pill bg={K.peach} border="rgba(201,96,63,0.35)">
          ↑ 从最后一条事件接着跑
        </Pill>
      </div>
      <div style={{position: 'absolute', left: 1200, top: 740, ...rise(b[4], 10)}}>
        <Zh size={22} w={600} color={K.dim}>
          每一步都写进日志
        </Zh>
      </div>
      <SrcLine f={b[0]}>来源：《Scaling Managed Agents》· Recovering from harness failure</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ TTFT
export const Speed: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const steps = ['起容器', '克隆仓库', '启动进程'];
  const L = 400;
  const unit = 210;
  return (
    <Shell part="收获一 · 快">
      <Head kicker="TIME TO FIRST TOKEN" title="收获一：快" sub="首 token 延迟" />
      {/* before */}
      <div style={{position: 'absolute', left: 96, top: 250, ...rise(b[1], 0)}}>
        <Lab size={18} color={K.dim}>
          以前
        </Lab>
      </div>
      {steps.map((s, i) => (
        <div key={s} style={{position: 'absolute', left: L + i * unit, top: 240, width: unit - 10, ...pop(b[1], 10 + i * 10)}}>
          <Box x={0} y={0} w={unit - 10} h={70} bg={K.stone}>
            <Zh size={24} w={700}>
              {s}
            </Zh>
          </Box>
        </div>
      ))}
      <div style={{position: 'absolute', left: L + 3 * unit, top: 240, ...pop(b[1], 44)}}>
        <Box x={0} y={0} w={240} h={70} bg={K.peach} style={{border: '2px solid rgba(201,96,63,0.4)'}}>
          <Zh size={24} w={800} color={K.clay}>
            ▶ 开始推理
          </Zh>
        </Box>
      </div>
      <div style={{position: 'absolute', left: L, top: 324, ...rise(b[2], 0)}}>
        <Zh size={24} w={700} color={K.red}>
          哪怕这个 session 根本用不到沙箱，也得先等
        </Zh>
      </div>
      {/* after */}
      <div style={{position: 'absolute', left: 96, top: 410, ...rise(b[3], 0)}}>
        <Lab size={18} color={K.clay} w={700}>
          现在
        </Lab>
      </div>
      <div style={{position: 'absolute', left: L, top: 400, ...pop(b[3], 4)}}>
        <Box x={0} y={0} w={240} h={70} bg={K.peach} style={{border: '2px solid rgba(201,96,63,0.4)'}}>
          <Zh size={24} w={800} color={K.clay}>
            ▶ 开始推理
          </Zh>
        </Box>
      </div>
      <div style={{position: 'absolute', left: L + 260, top: 400, ...pop(b[3], 16)}}>
        <Box x={0} y={0} w={330} h={70} bg="transparent" style={{border: `2px dashed ${K.line}`}}>
          <Zh size={22} w={600} color={K.dim}>
            用到沙箱时才起容器
          </Zh>
        </Box>
      </div>
      {/* what TTFT means (beat 0), replaced by the chart at beat 4 */}
      <div style={{position: 'absolute', left: 96, top: 250, width: 1728, ...rise(b[0], 0), opacity: prog(b[0], 16) * (b[1] < 0 ? 1 : 1 - prog(b[1], 10))}}>
        <Card hot style={{padding: '30px 40px', display: 'flex', alignItems: 'center', gap: 40}}>
          <Code size={40} hot>
            TTFT
          </Code>
          <div>
            <Zh size={34} w={800}>
              首 token 延迟：session 接到任务，到吐出第一个 token 要等多久
            </Zh>
            <div style={{marginTop: 8}}>
              <Zh size={24} w={600} color={K.dim}>
                官方说，这是用户最能直接感觉到的延迟
              </Zh>
            </div>
          </div>
        </Card>
      </div>
      {/* chart */}
      <div style={{position: 'absolute', left: 96, top: 520, width: 1728, ...rise(b[4], 0)}}>
        <Card style={{padding: '24px 34px', height: 330}}>
          <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
            <Serif size={34}>首 token 延迟，拆分前后</Serif>
            <span style={{display: 'flex', gap: 10, alignItems: 'center'}}>
              <Zh size={19} w={600} color={K.faint}>
                以拆分前 = 100，只画官方给的降幅
              </Zh>
              <Illus />
            </span>
          </div>
          {[
            {k: 'p50 中位数', cut: 0.6, pre: '约 −', post: '%', n: 60, at: 4},
            {k: 'p95 慢的一头', cut: 0.9, pre: '−', post: '% 以上', n: 90, at: 5},
          ].map((r, i) => (
            <div key={r.k} style={{marginTop: i ? 18 : 22, opacity: prog(b[r.at], 12)}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                <div style={{width: 200}}>
                  <Zh size={26} w={800}>
                    {r.k}
                  </Zh>
                </div>
                <div>
                  <Bar w={1000} v={1} p={prog(b[r.at], 18, 2)} color={K.stone2} h={34} />
                  <div style={{height: 8}} />
                  <Bar w={1000} v={1 - r.cut} p={clamp01((b[r.at] - 14) / 72)} color={K.clay} h={34} />
                </div>
                <div style={{...pop(b[r.at], 24)}}>
                  <span style={{fontFamily: FONT_SERIF, fontSize: 62, fontWeight: 700, color: K.clay, letterSpacing: -2}}>
                    {r.pre}
                    {Math.round(r.n * clamp01((b[r.at] - 14) / 72))}
                    {r.post}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <SrcLine f={b[4]}>来源：《Scaling Managed Agents》· Many brains：p50 TTFT 降约 60%，p95 降 90% 以上</SrcLine>
    </Shell>
  );
};
