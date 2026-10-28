// Cover (the crash that loses three hours, then the split), who is talking, and what Claude Managed Agents is.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BookOpen, FileText, Mic, ShieldCheck} from 'lucide-react';
import {ClaudeSpark} from '@atv/lib/brand/claude';
import {useBeats} from '@atv/lib/timing';
import {Box, Brain, Card, Code, during, FONT_SERIF, Hand, Head, K, Lab, Mo, Pill, prog, rise, Serif, Shell, SrcLine, usePopIn, Zh} from './common';

// ------------------------------------------------------------------ cover
/** A document window whose progress climbs, then the machine hangs and the page goes blank. */
const CrashDoc: React.FC<{f: number; o: number}> = ({f, o}) => {
  const fill = Math.min(0.87, f / 60);
  const crash = prog(f, 8, 66);
  const shake = crash > 0 && crash < 1 ? Math.sin(f * 2.3) * 6 : 0;
  return (
    <div style={{position: 'absolute', left: 560, top: 250, width: 800, opacity: o, transform: `translateX(${shake}px)`}}>
      <Card style={{padding: 0, overflow: 'hidden'}}>
        <div style={{height: 46, background: K.stone, display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px'}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 12, height: 12, borderRadius: 12, background: K.line}} />
          ))}
          <Mo size={18} color={K.dim} style={{marginLeft: 14}}>
            第三章_草稿.docx
          </Mo>
        </div>
        <div style={{padding: '30px 36px', height: 300, position: 'relative'}}>
          <div style={{opacity: 1 - crash}}>
            {[0.92, 0.84, 0.95, 0.7, 0.88, 0.6].map((w, i) => (
              <div key={i} style={{height: 16, width: `${w * 100 * clamp(f / 12 - i)}%`, background: K.stone, borderRadius: 4, marginBottom: 18}} />
            ))}
          </div>
          {crash > 0 && (
            <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: crash}}>
              <Zh size={44} w={800} color={K.red}>
                程序无响应
              </Zh>
              <Zh size={24} w={500} color={K.dim} style={{marginTop: 10}}>
                未保存的更改已丢失
              </Zh>
            </div>
          )}
        </div>
        <div style={{padding: '0 36px 26px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <Zh size={20} w={600} color={K.dim}>
              已写 3 小时
            </Zh>
            <Mo size={20} color={K.dim}>
              {Math.round(fill * (1 - crash) * 100)}%
            </Mo>
          </div>
          <div style={{marginTop: 8, height: 12, borderRadius: 12, background: K.stone}}>
            <div style={{height: 12, borderRadius: 12, width: `${fill * (1 - crash) * 100}%`, background: K.clay}} />
          </div>
        </div>
      </Card>
    </div>
  );
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** One container holding brain + hand; at beat 1 it dies and takes both with it. */
const OneBox: React.FC<{f: number; o: number}> = ({f, o}) => {
  const die = prog(f, 14, 40);
  return (
    <div style={{position: 'absolute', left: 610, top: 240, width: 700, height: 440, opacity: o}}>
      <div style={{position: 'absolute', inset: 0, border: `3px dashed ${die > 0.5 ? K.red : K.line}`, borderRadius: 24}} />
      <div style={{position: 'absolute', left: 24, top: 16}}>
        <Lab size={18} color={die > 0.5 ? K.red : K.dim}>
          一个容器
        </Lab>
      </div>
      <div style={{opacity: 1 - die * 0.7, filter: `grayscale(${die})`}}>
        <Brain x={60} y={90} w={280} h={260} />
        <Hand x={380} y={150} w={260} h={170} label="沙箱" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: die}}>
        <Zh size={32} w={800} color={K.red}>
          容器一挂，agent 跟着没了
        </Zh>
      </div>
    </div>
  );
};

export const Cover: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const docO = during(b[0], 0, b[0] - b[1] + 4, 10);
  const boxO = during(b[1], 0, b[1] - b[2] + 4, 10);
  const t = prog(b[2], 18);
  const cut = prog(b[2], 22, 14);
  return (
    <Shell>
      {b[1] < 0 && <CrashDoc f={b[0]} o={docO} />}
      {b[1] >= 0 && b[2] < 4 && <OneBox f={b[1]} o={boxO} />}
      {/* title + split figure */}
      <div style={{opacity: t}}>
        <div style={{position: 'absolute', left: 110, top: 170}}>
          <div style={rise(b[2], 0)}>
            <Pill bg="#fff" style={{fontSize: 22}}>
              <ClaudeSpark size={26} color={K.orange} />
              Claude Managed Agents · 架构拆解
            </Pill>
          </div>
          <div style={{marginTop: 30, ...rise(b[2], 6, 30)}}>
            <Serif size={150} style={{display: 'block', lineHeight: 1.05}}>
              脑手
            </Serif>
            <Serif size={150} color={K.clay} style={{display: 'block', lineHeight: 1.05}}>
              分离
            </Serif>
          </div>
          <div style={{marginTop: 26, ...rise(b[2], 14)}}>
            <Zh size={32} w={500} color={K.dim}>
              Anthropic 把 agent 拆成了两半
            </Zh>
          </div>
          <div style={{marginTop: 34, display: 'flex', gap: 14}}>
            {['更快', '更稳', '更安全'].map((s, i) => (
              <div key={s} style={pop(b[3], i * 6)}>
                <Pill bg={i === 2 ? K.clay : '#fff'} color={i === 2 ? '#fff' : K.ink} border={i === 2 ? K.clay : undefined} style={{fontSize: 28}}>
                  {s}
                </Pill>
              </div>
            ))}
          </div>
        </div>
        <div style={{position: 'absolute', left: 900, top: 230, width: 920, height: 560}}>
          <Brain x={0} y={150 + (1 - t) * 30} w={320} h={260} />
          <svg width={920} height={560} style={{position: 'absolute', left: 0, top: 0}}>
            <path d={`M 330 280 L ${330 + 130 * cut} 280`} stroke={K.line} strokeWidth={3} strokeDasharray="10 9" />
            <path d="M 395 240 L 395 320" stroke={K.clay} strokeWidth={4} opacity={cut} strokeLinecap="round" />
          </svg>
          {[0, 1, 2].map((i) => (
            <div key={i} style={pop(b[2], 20 + i * 5)}>
              <Hand x={500 + (i % 2) * 40} y={40 + i * 170} w={330} h={140} label={`沙箱 ${i + 1}`} tag="可替换" />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ who
export const Who: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const people = [
    {i: 'KL', n: 'Katelyn Lesse', r: 'Claude 平台 · 工程负责人'},
    {i: 'AJ', n: 'Angela Jiang', r: 'Claude 平台 · 产品负责人'},
  ];
  const refs = [
    {ic: <FileText size={30} color={K.clay} />, t: 'Scaling Managed Agents', s: 'Anthropic 工程博客'},
    {ic: <ShieldCheck size={30} color={K.clay} />, t: 'How we contain Claude', s: 'Anthropic 官网'},
    {ic: <BookOpen size={30} color={K.clay} />, t: 'Dreams · Memory', s: 'Managed Agents 官方文档'},
  ];
  return (
    <Shell part="素材">
      <Head kicker="LATENT SPACE · 2026.10.27" title="这期素材从哪来" sub="一期播客 + 三份一手资料" />
      <div style={{position: 'absolute', left: 96, top: 236, width: 900, ...rise(b[0], 0)}}>
        <Card style={{padding: '30px 34px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <Mic size={30} color={K.clay} />
            <Lab size={18} color={K.clay} w={700}>
              podcast
            </Lab>
          </div>
          <div style={{marginTop: 14}}>
            <Serif size={40} style={{lineHeight: 1.25}}>
              How Anthropic ships Claude with Claude:
              <br />
              <span style={{color: K.clay}}>Separating the Brain from the Hands</span>
            </Serif>
          </div>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 96, top: 520, display: 'flex', gap: 26}}>
        {people.map((p, i) => (
          <div key={p.i} style={pop(b[1], i * 8)}>
            <Card style={{width: 437, padding: '24px 26px', display: 'flex', alignItems: 'center', gap: 22}}>
              <div style={{width: 84, height: 84, borderRadius: 84, background: K.peach, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontFamily: FONT_SERIF, fontSize: 36, fontWeight: 700, color: K.clay}}>{p.i}</span>
              </div>
              <div>
                <Zh size={30} w={800}>
                  {p.n}
                </Zh>
                <div style={{marginTop: 4}}>
                  <Zh size={22} w={500} color={K.dim}>
                    {p.r}
                  </Zh>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 96, top: 700, ...pop(b[2], 0)}}>
        <Pill bg={K.peach} border="rgba(201,96,63,0.35)" style={{fontSize: 26}}>
          <ClaudeSpark size={24} color={K.orange} />
          录于 Opus 5.5 发布的第二天
        </Pill>
      </div>
      <div style={{position: 'absolute', left: 1060, top: 236, width: 764}}>
        <div style={{opacity: prog(b[3], 12)}}>
          <Lab size={18} color={K.dim}>
            对照的一手资料
          </Lab>
        </div>
        {refs.map((r, i) => (
          <div key={r.t} style={{marginTop: i ? 18 : 16, ...rise(b[3], 4 + i * 6)}}>
            <Card style={{padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 20}}>
              {r.ic}
              <div>
                <Mo size={26} w={700}>
                  {r.t}
                </Mo>
                <div style={{marginTop: 2}}>
                  <Zh size={21} w={500} color={K.dim}>
                    {r.s}
                  </Zh>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
      <SrcLine f={b[0]}>来源：Latent Space《How Anthropic ships Claude with Claude》（2026-10-27）；嘉宾职务按节目介绍；录制时间据节目 20:19</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ what is CMA
export const Whatis: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const diy = ['循环', '工具', '运行环境'];
  const tune = ['新参数', '破坏性改动', '在 harness 里调好'];
  return (
    <Shell part="先说概念">
      <Head kicker="CLAUDE MANAGED AGENTS" title="Managed Agents 是什么" sub="比 Messages API 高一层" />
      {/* lower step: Messages API */}
      <div style={{position: 'absolute', left: 96, top: 640, width: 860, ...rise(b[0], 10)}}>
        <Box x={0} y={0} w={860} h={170} bg={K.stone} center={false} radius={14} style={{padding: '24px 30px'}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
            <Mo size={32} w={700}>
              Messages API
            </Mo>
            <Zh size={24} w={500} color={K.dim}>
              原始 token
            </Zh>
          </div>
          <div style={{marginTop: 22, display: 'flex', gap: 14, alignItems: 'center'}}>
            <Zh size={24} w={600} color={K.dim}>
              自己搭：
            </Zh>
            {diy.map((d, i) => (
              <div key={d} style={pop(b[1], 10 + i * 5)}>
                <Pill>{d}</Pill>
              </div>
            ))}
          </div>
        </Box>
      </div>
      <div style={{position: 'absolute', left: 300, top: 380, width: 860, height: 190, border: `2.5px dashed ${K.line}`, borderRadius: 14, boxSizing: 'border-box', opacity: prog(b[0], 12, 20) * (1 - prog(b[2], 10)), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Zh size={30} w={700} color={K.faint}>
          高一层：Claude Managed Agents
        </Zh>
      </div>
      {/* upper step: CMA */}
      <div style={{position: 'absolute', left: 300, top: 380, width: 860, ...rise(b[2], 0)}}>
        <Box x={0} y={0} w={860} h={190} bg={K.peach} center={false} radius={14} style={{padding: '24px 30px', border: '2px solid rgba(201,96,63,0.4)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <ClaudeSpark size={34} color={K.orange} />
            <Mo size={32} w={700}>
              Claude Managed Agents
            </Mo>
          </div>
          <div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={pop(b[2], 10)}>
              <Code>定义 agent</Code>
            </div>
            <Zh size={30} w={700} color={K.clay} style={{opacity: prog(b[2], 10, 16)}}>
              →
            </Zh>
            <div style={pop(b[2], 18)}>
              <Code>开 session</Code>
            </div>
            <Zh size={30} w={700} color={K.clay} style={{opacity: prog(b[2], 10, 24)}}>
              →
            </Zh>
            <div style={pop(b[2], 26)}>
              <Code hot>harness 现成</Code>
            </div>
          </div>
        </Box>
      </div>
      {/* right: launch tuning */}
      <div style={{position: 'absolute', left: 1220, top: 236, width: 604}}>
        <div style={rise(b[3], 0)}>
          <Card style={{padding: '24px 28px'}}>
            <Lab size={17} color={K.clay} w={700}>
              每次发新模型
            </Lab>
            {tune.map((s, i) => (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, ...rise(b[3], 10 + i * 8)}}>
                <div style={{width: 30, height: 30, background: K.clay, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 700}}>
                  {i + 1}
                </div>
                <Zh size={28} w={700}>
                  {s}
                </Zh>
              </div>
            ))}
            <div style={{marginTop: 18}}>
              <Zh size={21} w={500} color={K.dim}>
                官方先做完这些
              </Zh>
            </div>
          </Card>
        </div>
        <div style={{marginTop: 24, ...pop(b[4], 0)}}>
          <Card hot style={{padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 16}}>
            <Zh size={34} w={800} color={K.clay}>
              ✓
            </Zh>
            <Zh size={30} w={800}>
              你拿到手，直接能用
            </Zh>
          </Card>
        </div>
      </div>
      <SrcLine f={b[1]}>来源：节目 40:31–43:32（Messages API 与 Claude Managed Agents 的区别）</SrcLine>
    </Shell>
  );
};
