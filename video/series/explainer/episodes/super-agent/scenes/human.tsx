// Sections 4–6 of the article: full-duplex and multi-channel interaction, separating compute / state / environment,
// and the Watchdog.
import React from 'react';
import {Ch, Chip, Code, during, Head, Lab, LoopPacket, Mo, Node, Packet, prog, rise, Shell, SRC, SrcLine, useBeats, useCurrentFrame, usePopIn, V, Wire, Zh} from './common';
import type {Scene} from '@atv/lib/types';

type P = {scene: Scene};

// ------------------------------------------------------------------ full duplex (figure 10)
const X = (x: number) => 120 + (x - 190) * 2.06;
const Y = (y: number) => 250 + y * 1.35;
type Bx = [number, number, string, string?, boolean?, boolean?]; // x0, x1, title, sub, dashed, hot
const Lane: React.FC<{y: number; boxes: Bx[]; f: number; hot?: boolean}> = ({y, boxes, f, hot}) => (
  <>
    <div style={{position: 'absolute', left: X(190), width: X(1000) - X(190), top: Y(y) + 30, height: 2, background: V.line, opacity: prog(f, 12)}} />
    {boxes.map(([a, c, t, s, dashed, h], i) => (
      <div key={i} style={{position: 'absolute', left: X(a), top: Y(y), ...rise(f, i * 8)}}>
        <div
          style={{
            width: X(c) - X(a),
            height: 62,
            boxSizing: 'border-box',
            borderRadius: 10,
            border: `${dashed ? 2 : 1.5}px ${dashed ? 'dashed' : 'solid'} ${h || hot ? V.blue : V.line}`,
            background: dashed ? 'transparent' : h ? V.blueSoft : V.panel,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zh size={20} w={700} color={dashed ? V.dim : V.ink}>
            {t}
          </Zh>
          {s && (
            <Zh size={16} w={500} color={V.dim}>
              {s}
            </Zh>
          )}
        </div>
      </div>
    ))}
  </>
);

export const Duplex: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const classic: Bx[] = [
    [193, 290, '用户消息 1'],
    [303, 410, 'LLM Call', '调用 run()'],
    [425, 750, '同步阻塞等待工具返回', undefined, true],
    [766, 865, '工具调用结果', '返回结果'],
    [880, 995, 'LLM Call', '回复用户'],
  ];
  const asyncB: Bx[] = [
    [193, 290, '用户消息 1', undefined, false, true],
    [303, 410, 'LLM Call', '调用 start()', false, true],
    [425, 525, '立即返回', 'Started 通知'],
    [538, 640, '用户消息 2', undefined, false, true],
    [650, 755, 'LLM Call', '即时回复', false, true],
    [766, 865, '新消息投递', '完成结果'],
    [880, 995, 'LLM Call', '交付任务结果', false, true],
  ];
  const bar = (y: number, label: string, f: number, hot: boolean) => (
    <div style={{position: 'absolute', left: X(357), top: Y(y), width: X(815) - X(357), height: 52, borderRadius: 10, border: `1.5px solid ${hot ? V.blue : V.line}`, background: hot ? V.blueSoft : V.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...rise(f)}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((Math.max(0, f) * 0.7) % 100)}%`, background: hot ? 'rgba(91,124,255,0.18)' : 'rgba(142,152,173,0.12)'}} />
      <Zh size={21} w={700}>
        {label}
      </Zh>
    </div>
  );
  return (
    <Shell file="04_1_duplex.md" status="loop · async">
      <Head kicker="4.1 · 原文图：全双工交互" title="同步 run() → 异步 start() / stop()" />
      <div style={{position: 'absolute', left: 120, top: Y(52) - 46, ...rise(b[0])}}>
        <Zh size={26} w={800}>
          经典 ReAct Loop
        </Zh>
        <Zh size={22} w={500} color={V.dim} style={{marginLeft: 20}}>
          前台阻塞等待，期间无法响应新输入（半双工）
        </Zh>
      </div>
      <Lane y={52} boxes={classic} f={b[0]} />
      {bar(132, '同步执行耗时工具', b[0] - 20, false)}
      {b[1] >= 0 && b[2] < 0 && (
        <div style={{position: 'absolute', left: X(560), top: Y(52) + 14, opacity: 0.5 + 0.5 * Math.sin(frame / 6)}}>
          <Mo size={24} color={V.red}>
            ⏳ blocked
          </Mo>
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: Y(215), height: 1, background: V.hair}} />
      <div style={{position: 'absolute', left: 120, top: Y(262) - 46, ...rise(b[2])}}>
        <Zh size={26} w={800} color={V.blue}>
          异步 ReAct Loop
        </Zh>
        <Zh size={22} w={500} color={V.dim} style={{marginLeft: 20}}>
          后台异步执行，新输入在当前推理步结束后即被处理（全双工）
        </Zh>
      </div>
      <Lane y={262} boxes={asyncB} f={b[2]} />
      {bar(345, '后台异步执行耗时工具', b[2] - 24, true)}
      {b[3] >= 0 && (
        <>
          <Wire pts={[[X(470), Y(345)], [X(470), Y(262) + 62]]} p={prog(b[3], 14)} color={V.dim} dash />
          <Wire pts={[[X(815), Y(345) + 26], [X(815), Y(262) + 62]]} p={prog(b[3], 14, 14)} color={V.blue} dash />
          <div style={{position: 'absolute', left: X(870), top: Y(345) + 8, ...rise(b[3], 20)}}>
            <Code size={22}>stop()</Code>
            <Zh size={20} w={500} color={V.dim} style={{marginLeft: 10}}>
              可主动终止过长的命令
            </Zh>
          </div>
        </>
      )}
      <div style={{position: 'absolute', left: 120, top: 830, ...rise(b[4])}}>
        <Chip color={V.amber} size={22}>
          已在 DeepSeek Harness 中实现，但尚未默认开启
        </Chip>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ multi-channel
export const Channel: React.FC<P> = () => {
  const b = useBeats();
  const pop = usePopIn();
  return (
    <Shell file="04_2_channels.md" status="router · replies">
      <Head kicker="4.2 · 多信道交互" title="输出匹配信道的带宽与习惯" />
      <div style={{position: 'absolute', left: 120, top: 232, ...rise(b[0])}}>
        <Zh size={24} w={500} color={V.dim}>
          冗长推理与密集工具调用隔离在 Worker 内部，由 Router 层统一对外；再用提示词按信道定制交互规范
        </Zh>
      </div>
      <div style={{position: 'absolute', left: 120, top: 310, width: 800, height: 520, boxSizing: 'border-box', borderRadius: 16, border: `1.5px solid ${V.cyan}`, background: V.panel, padding: 30, ...pop(b[1])}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Ch c="IM" size={20} />
          <Zh size={34} w={800}>
            即时通讯
          </Zh>
        </div>
        <div style={{marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12}}>
          {['低打扰的轻量沟通', '像人类同事一样，只在需要决策或验收时发送通知', '只问直接问题、给简短结论'].map((t) => (
            <Zh key={t} size={26} w={500}>
              · {t}
            </Zh>
          ))}
        </div>
        <div style={{marginTop: 34, padding: '18px 22px', borderRadius: 12, border: `2px solid ${V.amber}`, background: 'rgba(227,179,65,0.08)', ...rise(b[2])}}>
          <Lab color={V.amber}>验证过的硬性规定</Lab>
          <div style={{marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 14}}>
            <Zh size={30} w={700}>
              单次回复不超过
            </Zh>
            <span style={{fontFamily: '"Montserrat", sans-serif', fontSize: 72, fontWeight: 800, color: V.amber}}>100</span>
            <Zh size={30} w={700}>
              词
            </Zh>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1000, top: 310, width: 800, height: 520, boxSizing: 'border-box', borderRadius: 16, border: `1.5px solid ${V.line}`, background: V.panel, padding: 30, ...pop(b[3])}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Ch c="GitHub" size={20} />
          <Zh size={34} w={800}>
            邮件 · 文档
          </Zh>
        </div>
        <div style={{marginTop: 18}}>
          <Zh size={26} w={500}>
            结构化、高信息密度的异步交付
          </Zh>
        </div>
        <div style={{marginTop: 22, padding: '16px 20px', borderRadius: 10, background: '#0E131C', border: `1px solid ${V.line}`}}>
          <Mo size={18} color={V.faint}>
            Pull Request · 按项目规范
          </Mo>
          {['## 问题背景', '## 改动说明', '## 验证结果'].map((t, i) => (
            <div key={t} style={{marginTop: 12, ...rise(b[3], 12 + i * 10)}}>
              <Mo size={22} color={V.blue}>
                {t}
              </Mo>
              <div style={{height: 8, width: `${[80, 65, 72][i]}%`, background: V.line, borderRadius: 4, marginTop: 8}} />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ compute / state
export const Compute: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const off = prog(b[0], 20, 50);
  const sp = prog(b[2], 30);
  const layers: [string, string, string][] = [
    ['Agent Loop 计算', V.blue, 'compute'],
    ['会话状态', V.green, 'state'],
    ['执行环境（仓库 / 工具链）', V.amber, 'env'],
  ];
  return (
    <Shell file="05_1_compute_state.md" status="cloud · stateless">
      <Head kicker="5 · 计算、状态与环境的分离" title="借鉴存算分离，分两步解耦" />
      {/* the single device */}
      <div style={{position: 'absolute', left: 140, top: 260, width: 620, ...rise(b[0])}}>
        <Lab>现有的本地 Agent：三者绑在同一台设备上</Lab>
        <div style={{marginTop: 16, padding: 24, borderRadius: 16, border: `2px solid ${off > 0.5 ? V.red : V.line}`, background: V.panel, opacity: 1 - 0.4 * off}}>
          {layers.map(([t, c], i) => (
            <div key={t} style={{marginTop: i ? 12 : 0, padding: '18px 22px', borderRadius: 10, border: `1.5px solid ${c}`, opacity: i < 2 ? 1 - sp * 0.85 : 1}}>
              <Zh size={28} w={700} color={c}>
                {t}
              </Zh>
            </div>
          ))}
          <div style={{marginTop: 16, display: 'flex', justifyContent: 'center'}}>
            <Mo size={24} color={off > 0.5 ? V.red : V.dim}>
              {off > 0.5 ? '● 休眠 / 离线 → Agent 停止运行' : '● 本地设备'}
            </Mo>
          </div>
        </div>
      </div>
      {/* step 1 */}
      <div style={{position: 'absolute', left: 900, top: 260, width: 900, ...rise(b[1])}}>
        <Lab color={V.blue}>第一步 · 计算与状态分离</Lab>
      </div>
      {b[1] >= 0 && (
        <div style={{opacity: prog(b[2], 18)}}>
          <div style={{position: 'absolute', left: 900, top: 320, width: 900, height: 230, borderRadius: 16, border: `1.5px dashed ${V.blue}`}}>
            <div style={{position: 'absolute', left: 20, top: 12}}>
              <Zh size={22} w={700} color={V.blue}>
                云端 · 无状态弹性计算容器
              </Zh>
            </div>
            {[0, 1, 2].map((i) => {
              const alive = !(i === 1 && Math.floor(frame / 50) % 3 === 1);
              return (
                <div key={i} style={{position: 'absolute', left: 30 + i * 290, top: 60, width: 260, height: 140, borderRadius: 12, border: `1.5px solid ${alive ? V.blue : V.faint}`, background: alive ? V.blueSoft : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6}}>
                  <Zh size={26} w={700} color={alive ? '#fff' : V.faint}>
                    Agent Loop
                  </Zh>
                  <Mo size={16} color={alive ? V.dim : V.faint}>
                    {alive ? 'running' : 'restarting…'}
                  </Mo>
                </div>
              );
            })}
          </div>
          <Wire pts={[[1350, 550], [1350, 620]]} color={V.green} />
          <Node x={1050} y={620} w={600} h={130} title="Session 数据库" sub="持久化状态" color={V.green} glow={0.8} titleSize={30} />
          <div style={{position: 'absolute', left: 900, top: 780}}>
            <Zh size={24} w={500} color={V.dim}>
              容器可水平扩展、重启或替换；会话与任务的连续性由持久化存储保障
            </Zh>
          </div>
        </div>
      )}
    </Shell>
  );
};

// ------------------------------------------------------------------ environment (figure 11)
export const Env: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const cmp = prog(b[3], 18);
  const devs = ['个人开发机', '云端托管 / 按需环境', '间歇在线的个人设备'];
  const back = b[5] >= 0 ? prog(b[5], 16, 20) : 0;
  return (
    <Shell file="05_2_environment.md" status="daemons · 3 attached">
      <Head kicker="5.2 · 原文图：计算与执行环境分离" title="环境留在原地，端侧装轻量 daemon" />
      <div style={{position: 'absolute', left: 120, top: 236, display: 'flex', gap: 12, ...rise(b[1])}}>
        {['未提交的本地修改', '私有凭据', '内网服务依赖', '特定的硬件或工具链'].map((t) => (
          <Chip key={t} color={V.amber} size={20}>
            {t}
          </Chip>
        ))}
        <Zh size={22} w={500} color={V.dim} style={{marginLeft: 10}}>
          → 云端重建同步：成本高、易遗漏
        </Zh>
      </div>
      <div style={{opacity: 1 - cmp * 0.0}}>
        <div style={pop(b[0])}>
          <Node x={420} y={320} w={460} h={130} title="Agent Loop" sub="云端无状态弹性容器" color={V.blue} glow={0.9} titleSize={32} />
          <Node x={1040} y={320} w={460} h={130} title="Session 数据库" sub="持久化状态存储" color={V.green} glow={0.6} titleSize={32} />
          <Wire pts={[[880, 385], [1040, 385]]} color={V.dim} />
        </div>
        <div style={{position: 'absolute', left: 120, right: 120, top: 495, height: 0, borderTop: `2px dashed ${V.line}`, opacity: prog(b[2], 14)}} />
        {devs.map((d, i) => {
          const x = 180 + i * 560;
          const off = i === 2 && b[5] < 0 ? Math.floor(frame / 40) % 2 === 0 : false;
          return (
            <div key={d} style={pop(b[2], i * 8)}>
              <Node x={x} y={540} w={440} h={130} title={d} sub="端侧 daemon" color={i === 2 && back > 0.5 ? V.green : V.cyan} glow={off ? 0 : 0.6} titleSize={28} dashed={off} />
              <Wire pts={[[650, 450], [x + 220, 540]]} p={prog(b[2], 18, 10 + i * 6)} color={off ? V.faint : V.cyan} dash />
              {!off && <LoopPacket pts={[[650, 450], [x + 220, 540]]} f={b[2] - 20} period={60} offset={i * 20} color={V.cyan} size={11} />}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 180, top: 690, ...rise(b[2], 30)}}>
          <Zh size={22} w={500} color={V.dim}>
            daemon 不保存会话状态，只负责执行命令与返回结果
          </Zh>
        </div>
      </div>
      {b[3] >= 0 && (
        <div style={{position: 'absolute', left: 120, top: 740, width: 1680, display: 'flex', gap: 20, opacity: cmp}}>
          <div style={{flex: 1, padding: '14px 20px', borderRadius: 12, border: `1.5px solid ${V.line}`, background: V.panel}}>
            <Zh size={22} w={700} color={V.dim}>
              Anthropic「脑手分离」：托管服务 · 按需沙箱与客户 VPC 内的资源
            </Zh>
          </div>
          <div style={{flex: 1, padding: '14px 20px', borderRadius: 12, border: `1.5px solid ${V.blue}`, background: V.blueSoft, ...rise(b[4])}}>
            <Zh size={22} w={700}>
              本文：先接入可能间歇在线的个人机器 · BYOM（Bring Your Own Machine）
            </Zh>
          </div>
        </div>
      )}
      <SrcLine f={-1}>{SRC}</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ Watchdog
export const Watchdog: React.FC<P> = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const tick = Math.floor(frame / 40);
  const fixed = b[3] >= 40;
  return (
    <Shell file="06_watchdog.md" status="watchdog · tick">
      <Head kicker="6 · Watchdog" title="主系统之外的控制回路" />
      {/* main system */}
      <div style={{position: 'absolute', left: 120, top: 260, width: 1020, height: 520, borderRadius: 18, border: `1.5px solid ${V.line}`, background: 'rgba(18,23,34,0.6)', ...rise(b[0])}}>
        <div style={{position: 'absolute', left: 20, top: 14}}>
          <Lab>主系统</Lab>
        </div>
        <Node x={340} y={50} w={340} h={100} title="Router 层" color={V.blue} glow={0.6} titleSize={28} />
        {[0, 1, 2].map((i) => {
          const stuck = i === 1 && b[1] >= 0 && !fixed;
          const p = stuck ? 0.42 : ((Math.max(0, frame) * (0.4 + i * 0.15)) % 100) / 100;
          return (
            <div key={i}>
              <Node x={40 + i * 330} y={230} w={290} h={220} title={`Worker ${i + 1}`} color={stuck ? V.amber : V.green} glow={stuck ? 1 : 0.5} titleSize={26}>
                <div style={{width: 220, height: 12, borderRadius: 6, background: V.line, marginTop: 10}}>
                  <div style={{height: 12, borderRadius: 6, width: `${p * 100}%`, background: stuck ? V.amber : V.green}} />
                </div>
                <Mo size={17} color={stuck ? V.amber : V.dim} style={{marginTop: 10}}>
                  {stuck ? `↻ 无效循环 ×${tick % 9 + 3}` : 'progress ok'}
                </Mo>
              </Node>
            </div>
          );
        })}
      </div>
      {/* watchdog */}
      <div style={pop(b[2])}>
        <Node x={1290} y={330} w={500} h={170} title="Watchdog Session" sub="独立 · 定时消息驱动" color={V.violet} glow={0.5 + 0.5 * Math.abs(Math.sin(frame / 20))} titleSize={32} />
        <div style={{position: 'absolute', left: 1290, top: 270, display: 'flex', gap: 10}}>
          {Array.from({length: 8}, (_, i) => (
            <div key={i} style={{width: 18, height: 18, borderRadius: 4, background: i === tick % 8 ? V.violet : V.line}} />
          ))}
          <Mo size={18} color={V.violet} style={{marginLeft: 8}}>
            cron
          </Mo>
        </div>
        <Wire pts={[[1290, 415], [1140, 415]]} color={V.violet} />
        <LoopPacket pts={[[1290, 415], [1140, 415], [880, 480]]} f={b[2]} period={40} color={V.violet} size={12} />
      </div>
      <div style={{position: 'absolute', left: 1290, top: 540, width: 510, display: 'flex', flexDirection: 'column', gap: 12}}>
        <div style={rise(b[3])}>
          <Chip color={V.dim} size={19}>
            基础设施：接口报错、状态恢复失败
          </Chip>
        </div>
        <div style={rise(b[3], 14)}>
          <Chip color={V.amber} size={19}>
            任务：Worker 有无实质进展、方向是否偏离
          </Chip>
        </div>
        <div style={rise(b[4])}>
          <Chip color={V.violet} size={19}>
            维护者用自然语言询问故障原因
          </Chip>
        </div>
        <div style={rise(b[4], 14)}>
          <Chip color={V.violet} size={19}>
            在线修正：增删提示词、调整触发规则
          </Chip>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 800, ...rise(b[1])}}>
        <Zh size={24} w={500} color={V.dim}>
          许多异常并非进程崩溃，而是模型陷入无效循环或偏离目标 → 进程存活探测不够
        </Zh>
      </div>
    </Shell>
  );
};

export const _u = {Packet, during};
