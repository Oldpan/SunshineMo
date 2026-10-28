// Part 2: the experiment — two toy problems, lead + workers, the diff_test oracle, the IPython harness, and the
// article's pipeline figure ("One function through the pipeline", nodes and arrows only).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  AMBER, appear, Arrow, Big, C, clamp01, DeepSeekWhale, FONT_MONO, FONT_ZH, GREEN, MonoT, Panel, PixelPanel, PixelText, PixelWindow, prog, PX, QwenMark,
  SceneTitle, Src, SRC_BLOG, Sprite, useBeats, useBob, usePopIn, useTh, Zh,
} from './common';

// ------------------------------------------------------------------ two toy problems
export const Setup: React.FC = () => {
  const th = useTh();
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const bob = useBob(3, 70);
  const stage = (x: number, label: string, sub: string, f: number, children: React.ReactNode) => (
    <div style={{position: 'absolute', left: x, top: 360, ...pop(f, 0, 0.85)}}>
      <Panel w={430} h={420} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
        {children}
        <Zh size={32} w={900}>{label}</Zh>
        <Zh size={22} w={700} color={C.sub}>{sub}</Zh>
      </Panel>
    </div>
  );
  return (
    <AbsoluteFill>
      <SceneTitle kicker="第二部分">两道很简单的练习题</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 236, display: 'flex', gap: 16, ...appear(b[0], 0)}}>
        {['题一 · HF logo 动画', '题二 · 太空射击游戏'].map((t, i) => (
          <div key={t} style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 28, color: '#fff', background: th.accent, borderRadius: 12, padding: '8px 18px', ...appear(b[0], i * 8)}}>{t}</div>
        ))}
      </div>
      {stage(84, 'C 源代码', 'Claude Code 写的', b[1], (
        <div style={{background: C.termBg, borderRadius: 12, padding: '14px 18px', width: 330, transform: `translateY(${bob}px)`}}>
          {['void draw_logo(...)', '{', '  for (int i = 0; ...', '}'].map((l) => (
            <MonoT key={l} size={20} color={C.termInk}>{l}</MonoT>
          ))}
        </div>
      ))}
      {stage(745, '编译好的二进制', '流水线的输入', b[2], (
        <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, color: C.sub, lineHeight: 1.35, textAlign: 'center'}}>
          7f 45 4c 46 02 01
          <br />
          01 00 00 00 00 00
          <br />
          03 00 b7 00 01 00
        </div>
      ))}
      {stage(1406, 'Python 版本', '每个函数行为一模一样', b[3], (
        <div style={{background: '#F4F8FF', borderRadius: 12, padding: '14px 18px', width: 330, border: `2px solid ${th.accentSoft}`}}>
          {['def draw_logo(s, ...):', '    for i in range(...):', '        ...'].map((l) => (
            <MonoT key={l} size={20} color={C.ink}>{l}</MonoT>
          ))}
        </div>
      ))}
      <Arrow from={[530, 570]} to={[730, 570]} p={prog(b[2], 16)} color={th.accent} />
      <Arrow from={[1191, 570]} to={[1391, 570]} p={prog(b[3], 16)} color={th.accent} />
      <Zh size={22} w={800} color={th.accent} style={{position: 'absolute', left: 1250, top: 515, opacity: prog(b[3], 12, 8)}}>逆向</Zh>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Experimental design</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ lead + workers + board
export const Roles: React.FC = () => {
  const th = useTh();
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const duties = [
    {t: '反汇编', beat: 1},
    {t: '找出函数、起名', beat: 1},
    {t: '猜参数签名', beat: 1},
    {t: '还原内存布局', beat: 2},
    {t: '还原数据表', beat: 2},
  ];
  const tasks = ['draw_particles', 'update_shots', 'draw_glyph', 'move_player'];
  return (
    <AbsoluteFill>
      <SceneTitle kicker="分工">主管和工人</SceneTitle>
      {/* lead */}
      <div style={{position: 'absolute', left: 84, top: 240, ...pop(b[0], 0, 0.9)}}>
        <Panel w={560} h={600} accent="#4D6BFE">
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <DeepSeekWhale size={88} />
            <div>
              <Zh size={22} w={800} color={C.faint}>主管 lead · 要足够强</Zh>
              <MonoT size={22}>DeepSeek-V4.1-Flash-1017</MonoT>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26}}>
            {duties.map((d, i) => (
              <div key={d.t} style={{display: 'flex', alignItems: 'center', gap: 14, background: '#F2F4FF', borderRadius: 12, padding: '12px 16px', ...appear(b[d.beat], (i % 3) * 8)}}>
                <div style={{width: 30, height: 30, borderRadius: 15, background: '#4D6BFE', color: '#fff', fontFamily: FONT_ZH, fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
                <Zh size={30} w={800}>{d.t}</Zh>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      {/* board */}
      <div style={{position: 'absolute', left: 700, top: 240, ...pop(b[3], 0, 0.9)}}>
        <Panel w={520} h={600} style={{background: '#FFFBEF'}} accent={AMBER}>
          <Zh size={30} w={900}>共享看板</Zh>
          <Zh size={20} w={700} color={C.sub}>任务 + 提示（hint）</Zh>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20}}>
            {tasks.map((t, i) => {
              const taken = b[4] > 20 + i * 14;
              return (
                <div key={t} style={{background: '#fff', borderRadius: 10, border: `2px solid ${taken ? GREEN : '#EADFC0'}`, padding: '10px 14px', ...appear(b[3], 8 + i * 6), opacity: appear(b[3], 8 + i * 6).opacity * (taken ? 0.6 : 1)}}>
                  <MonoT size={22}>{t}</MonoT>
                  <Zh size={18} w={700} color={C.faint}>{taken ? `已被 worker-${i + 1} 领走` : 'hint：照反汇编写…'}</Zh>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      {/* workers */}
      <div style={{position: 'absolute', left: 1276, top: 240, width: 560}}>
        <Zh size={22} w={800} color={C.faint} style={appear(b[4], 0)}>工人 workers · 谁空着谁领</Zh>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 14}}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{...pop(b[4], i * 6, 0.6)}}>
              <Panel w={270} h={250} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
                <div style={{transform: `translateY(${Math.sin((frame + i * 25) / 16) * 4}px)`}}>
                  <QwenMark size={100} />
                </div>
                <MonoT size={20}>Qwen3.5-9B</MonoT>
                <Zh size={18} w={700} color={C.sub}>worker-{i + 1}</Zh>
              </Panel>
            </div>
          ))}
        </div>
      </div>
      <Arrow from={[650, 520]} to={[690, 520]} p={prog(b[3], 14)} color="#4D6BFE" />
      <Arrow from={[1226, 520]} to={[1268, 520]} p={prog(b[4], 14)} color={th.accent} />
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Experimental design（任务名取自原文太空射击题）</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ diff_test
export const Oracle: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const N = 24; // bytes drawn per row
  const mismatchAt = 9;
  const scan = Math.floor(clamp01((b[2] - 6) / 50) * N);
  const cases = Math.round(600 * prog(b[1], 40));
  const pass = b[4] > 0;
  return (
    <AbsoluteFill>
      <SceneTitle kicker="判卷">diff_test</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.92)}}>
        <PixelWindow w={1100} h={560} title="diff_test(draw_particles)" progress={cases / 600}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16, ...appear(b[1], 0)}}>
            <PixelText size={48} color={PX.blue}>{cases}</PixelText>
            <PixelText size={24} color={PX.dim}>/ 约 600 个用例 · 原程序 vs Python</PixelText>
          </div>
          {[
            ['原程序', 'bin'],
            ['Python', 'py'],
          ].map(([label, k], row) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, ...appear(b[2], row * 6)}}>
              <div style={{width: 120}}>
                <PixelText size={24}>{label}</PixelText>
              </div>
              {Array.from({length: N}, (_, i) => {
                const bad = !pass && i === mismatchAt && row === 1;
                const checked = i < scan;
                const bg = !checked ? '#EDE9FA' : bad ? PX.red : row === 1 && pass ? PX.green : '#CFC6F2';
                return <div key={i} style={{width: 30, height: 30, background: bg, boxShadow: `0 0 0 3px ${PX.ink}`}} />;
              })}
            </div>
          ))}
          <div style={{display: 'flex', gap: 24, marginTop: 34}}>
            <div style={{...appear(b[3], 0)}}>
              <PixelPanel w={480} h={150} bg={pass ? '#E9F8EF' : '#FFF1F3'} border={pass ? PX.green : PX.red}>
                <PixelText size={24} color={PX.dim}>留出用例通过率</PixelText>
                <div>
                  <PixelText size={48} color={pass ? PX.green : PX.red}>{pass ? '100%' : '96%'}</PixelText>
                </div>
              </PixelPanel>
            </div>
            <div style={{...appear(b[3], 8)}}>
              <PixelPanel w={500} h={150}>
                <PixelText size={24} color={PX.dim}>第一处不一致</PixelText>
                <div>
                  <PixelText size={24}>{pass ? '无' : 'byte 9: 期望 0，得到 9'}</PixelText>
                </div>
                <div>
                  <PixelText size={24} color={PX.dim}>（示意）</PixelText>
                </div>
              </PixelPanel>
            </div>
          </div>
        </PixelWindow>
      </div>
      {/* right: rules */}
      <div style={{position: 'absolute', left: 1240, top: 250, width: 600, display: 'flex', flexDirection: 'column', gap: 22}}>
        <div style={appear(b[2], 10)}>
          <PixelPanel w={600} h={130}>
            <PixelText size={24} color={PX.dim}>比什么</PixelText>
            <div>
              <PixelText size={36}>返回值 + 每个字节</PixelText>
            </div>
          </PixelPanel>
        </div>
        <div style={pop(b[4], 0, 0.8)}>
          <PixelPanel w={600} h={130} bg="#E9F8EF" border={PX.green}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <Sprite name="check" px={6} />
              <PixelText size={36}>全部通过才能提交</PixelText>
            </div>
          </PixelPanel>
        </div>
        <div style={pop(b[5], 0, 0.8)}>
          <PixelPanel w={600} h={190} bg="#EEF1FF" border="#4D6BFE">
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <DeepSeekWhale size={64} bob={false} />
              <PixelText size={36}>多次不过 → 升级</PixelText>
            </div>
            <div style={{marginTop: 6}}>
              <PixelText size={24} color={PX.dim}>主管接手，自己来做</PixelText>
            </div>
          </PixelPanel>
        </div>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Experimental design；字节比对画面为示意</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ IPython harness
const TOOLS: {group: string; items: string[]; beat: number; color: string}[] = [
  {group: '读二进制', items: ['disasm', 'rodata', '…'], beat: 2, color: PX.blue},
  {group: '看它运行', items: ['trace', 'call_address'], beat: 3, color: PX.yellow},
  {group: '和原版比', items: ['diff_test', 'submit'], beat: 4, color: PX.green},
];

export const Harness: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const evo = prog(b[7], 30);
  return (
    <AbsoluteFill>
      <SceneTitle kicker="harness">基于 IPython 的极简 harness</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[1], 0, 0.92)}}>
        <PixelWindow w={1060} h={580} title="每个 agent 的工具箱" tag="所有人起步相同">
          <div style={{display: 'flex', flexDirection: 'column', gap: 40, marginTop: 12}}>
            {TOOLS.map((t) => (
              <div key={t.group} style={{display: 'flex', alignItems: 'center', gap: 20, ...appear(b[t.beat], 0)}}>
                <div style={{width: 220, padding: '10px 12px', background: t.color, boxShadow: `0 0 0 4px ${PX.ink}`}}>
                  <PixelText size={36} color="#fff">{t.group}</PixelText>
                </div>
                {t.items.map((it, k) => (
                  <div key={it} style={{padding: '8px 14px', background: '#fff', boxShadow: `0 0 0 3px ${PX.ink}`, ...appear(b[t.beat], 6 + k * 6)}}>
                    <span style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: PX.ink}}>{it}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{marginTop: 60, display: 'flex', alignItems: 'center', gap: 14, ...appear(b[0], 10)}}>
            <span style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: PX.dim}}>In [1]:</span>
            <span style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: PX.ink}}>{'disasm(0x1184)'.slice(0, Math.max(0, Math.floor((b[0] - 10) / 3)))}</span>
            <div style={{width: 14, height: 28, background: PX.ink, opacity: Math.floor(frame / 15) % 2}} />
          </div>
        </PixelWindow>
      </div>
      {/* lead extras */}
      <div style={{position: 'absolute', left: 1200, top: 250, width: 640, ...pop(b[5], 0, 0.85)}}>
        <PixelPanel w={640} h={300} bg="#EEF1FF" border="#4D6BFE">
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <DeepSeekWhale size={60} bob={false} />
            <PixelText size={36}>主管多两样</PixelText>
          </div>
          <div style={{marginTop: 14}}>
            <PixelText size={36}>· 记录共享地图</PixelText>
          </div>
          <div>
            <PixelText size={36}>· 发布任务</PixelText>
          </div>
        </PixelPanel>
      </div>
      <div style={{position: 'absolute', left: 1200, top: 590, width: 640, ...pop(b[6], 0, 0.85)}}>
        <PixelPanel w={640} h={240} bg="#FFF8E1" border={PX.ink}>
          <PixelText size={36} color={PX.red}>还能改工人的 harness</PixelText>
          <div style={{marginTop: 8}}>
            <PixelText size={24}>加工具，或者改核心部分</PixelText>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 16}}>
            {['v0', 'v1', 'v2'].map((v, i) => (
              <div key={v} style={{padding: '4px 12px', background: i / 3 < evo ? PX.green : '#E9E4FA', boxShadow: `0 0 0 3px ${PX.ink}`}}>
                <PixelText size={24} color={i / 3 < evo ? '#fff' : PX.dim}>{v}</PixelText>
              </div>
            ))}
            <div style={{opacity: evo}}>
              <PixelText size={24} color={PX.dim}> ← 看它怎么演化</PixelText>
            </div>
          </div>
        </PixelPanel>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 150, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Experimental design（工具名照原文）</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the pipeline figure
// node positions follow the article's figure (3 across the top + oracle, port and replay underneath), scaled up
type Node = {id: string; x: number; y: number; t: string; s: string; beat: number};
const NODES: Node[] = [
  {id: 'binary', x: 120, y: 330, t: 'Stripped binary', s: '去掉符号的二进制', beat: 1},
  {id: 'lead', x: 560, y: 330, t: 'Lead agent', s: 'DeepSeek V4.1', beat: 1},
  {id: 'board', x: 1000, y: 330, t: 'Task board', s: '共享看板', beat: 2},
  {id: 'worker', x: 1440, y: 330, t: 'Worker agent', s: 'Qwen3.5-9B', beat: 2},
  {id: 'oracle', x: 1440, y: 640, t: 'Oracle', s: 'diff_test', beat: 3},
  {id: 'port', x: 1000, y: 640, t: 'Python port', s: '通过的代码', beat: 4},
  {id: 'replay', x: 560, y: 640, t: 'Full replay', s: '和原程序逐帧比', beat: 5},
];
const NW = 340;
const NH = 120;

export const Pipeline: React.FC = () => {
  const th = useTh();
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const n = (id: string) => NODES.find((q) => q.id === id)!;
  const mid = (id: string, side: 'l' | 'r' | 't' | 'b'): [number, number] => {
    const q = n(id);
    return side === 'l' ? [q.x, q.y + NH / 2] : side === 'r' ? [q.x + NW, q.y + NH / 2] : side === 't' ? [q.x + NW / 2, q.y] : [q.x + NW / 2, q.y + NH];
  };
  const loop = prog(b[6], 20);
  // a travelling dot along the solid path, looping once the whole figure is up
  return (
    <AbsoluteFill>
      <SceneTitle kicker="原文配图">一个函数走完整条流水线</SceneTitle>
      {NODES.map((q) => {
        const lead = q.id === 'lead';
        const worker = q.id === 'worker';
        return (
          <div key={q.id} style={{position: 'absolute', left: q.x, top: q.y, ...pop(b[q.beat], q.id === 'board' || q.id === 'lead' ? 8 : 0, 0.8)}}>
            <Panel w={NW} h={NH} pad={14} accent={lead ? '#4D6BFE' : worker ? '#615CED' : undefined} style={{display: 'flex', alignItems: 'center', gap: 14}}>
              {lead && <DeepSeekWhale size={60} bob={false} />}
              {worker && <QwenMark size={58} />}
              <div>
                <Zh size={28} w={900}>{q.t}</Zh>
                <Zh size={20} w={700} color={C.sub}>{q.s}</Zh>
              </div>
            </Panel>
          </div>
        );
      })}
      <Arrow from={mid('binary', 'r')} to={mid('lead', 'l')} p={prog(b[1], 16, 6)} color={th.accent} />
      <Arrow from={mid('lead', 'r')} to={mid('board', 'l')} p={prog(b[2], 16)} color={th.accent} />
      <Arrow from={mid('board', 'r')} to={mid('worker', 'l')} p={prog(b[2], 16, 10)} color={th.accent} />
      <Arrow from={mid('worker', 'b')} to={mid('oracle', 't')} p={prog(b[3], 16)} color={th.accent} />
      <Arrow from={mid('oracle', 'l')} to={mid('port', 'r')} p={prog(b[4], 16)} color={GREEN} />
      <Arrow from={mid('port', 'l')} to={mid('replay', 'r')} p={prog(b[5], 16)} color={GREEN} />
      {/* dashed loops: worker → lead (escalate), lead → worker (harness) */}
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: loop}}>
        <path d={`M ${1440 + 60} 330 C 1400 220, 980 220, ${560 + NW - 40} 330`} fill="none" stroke="#4D6BFE" strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={-frame * 0.8} />
        <path d={`M ${560 + NW - 90} 330 C 920 260, 1340 260, ${1440 + 110} 330`} fill="none" stroke={AMBER} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={frame * 0.8} />
      </svg>
      <div style={{position: 'absolute', left: 900, top: 236, display: 'flex', gap: 18, opacity: loop}}>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 22, color: '#fff', background: '#4D6BFE', borderRadius: 8, padding: '4px 12px'}}>卡住 → 升级给主管</div>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 22, color: '#1E1E24', background: AMBER, borderRadius: 8, padding: '4px 12px'}}>主管改工人 harness</div>
      </div>
      <Big size={30} color={C.sub} style={{position: 'absolute', left: 130, top: 690, fontFamily: FONT_ZH, opacity: prog(b[5], 14, 10)}}>
        ✓ 逐帧一致
      </Big>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>原文交互配图「One function through the pipeline」（以第二题为例）重画</Src>
    </AbsoluteFill>
  );
};
