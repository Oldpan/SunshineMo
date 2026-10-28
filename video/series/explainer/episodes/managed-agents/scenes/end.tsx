// Aside on distillation and preserved thinking blocks, then the three design questions and the callback to the crash.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GitPullRequest, Shield, ShieldOff, Wrench} from 'lucide-react';
import {ClaudeSpark} from '@atv/lib/brand/claude';
import {useBeats} from '@atv/lib/timing';
import {Box, Card, Code, FONT_SERIF, Head, K, Lab, Mo, NumBadge, Packet, Pill, prog, rise, Serif, Shell, SrcLine, usePopIn, Wire, Zh} from './common';

// ------------------------------------------------------------------ distillation
export const Distill: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const siphon = b[1] < 0 ? -1 : (b[1] % 50) / 50;
  const turns = [0, 1, 2];
  return (
    <Shell part="发布细节">
      <Head kicker="DISTILLATION · PRESERVED THINKING" title="顺带一提：防蒸馏" />
      {/* teacher -> student */}
      <div style={{position: 'absolute', left: 96, top: 250, width: 860, height: 320, ...rise(b[0], 10)}}>
        <Box x={0} y={40} w={280} h={200} bg={K.peach} radius={18} style={{border: '2px solid rgba(201,96,63,0.4)'}}>
          <ClaudeSpark size={54} color={K.orange} />
          <Zh size={26} w={800} style={{marginTop: 10}}>
            原模型
          </Zh>
        </Box>
        <div style={{position: 'absolute', left: 300, top: 70}}>
          <Code size={20}>thinking…</Code>
        </div>
        <Wire pts={[[290, 140], [560, 140]]} p={prog(b[1], 18, 6)} color={K.red} arrow />
        {siphon > 0 && <Packet pts={[[290, 140], [560, 140]]} t={siphon} color={K.red} />}
        <div style={{position: 'absolute', left: 300, top: 160}}>
          <Zh size={21} w={600} color={K.red} style={{opacity: prog(b[1], 12, 12)}}>
            把推理过程套出来
          </Zh>
        </div>
        <Box x={580} y={60} w={240} h={160} bg={K.stone} radius={18}>
          <Zh size={26} w={800}>
            蒸馏出的模型
          </Zh>
          <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, opacity: prog(b[2], 12, 10)}}>
            <ShieldOff size={26} color={K.red} />
            <Zh size={20} w={700} color={K.red}>
              可能没有安全分类器
            </Zh>
          </div>
        </Box>
      </div>
      <div style={{position: 'absolute', left: 96, top: 580, width: 860, ...rise(b[2], 0)}}>
        <Card style={{padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16}}>
          <Shield size={32} color={K.clay} />
          <Zh size={25} w={800}>
            担心的主要不是生意，是安全
          </Zh>
        </Card>
      </div>
      {/* preserved thinking across turns */}
      <div style={{position: 'absolute', left: 1020, top: 240, width: 804, ...rise(b[3], 0)}}>
        <Lab size={16} color={K.clay} w={700}>
          最近几代模型：多轮里保留 thinking block
        </Lab>
        <div style={{display: 'flex', gap: 14, marginTop: 14}}>
          {turns.map((i) => (
            <div key={i} style={{width: 250, ...pop(b[3], 8 + i * 8)}}>
              <Card style={{padding: '12px 14px'}}>
                <Lab size={13} color={K.faint}>
                  第 {i + 1} 轮
                </Lab>
                <div style={{marginTop: 8, height: 34, borderRadius: 6, background: K.peach, border: '1.5px solid rgba(201,96,63,0.4)', display: 'flex', alignItems: 'center', paddingLeft: 10}}>
                  <Mo size={15} color={K.clay}>
                    thinking ✓
                  </Mo>
                </div>
                <div style={{marginTop: 8, height: 22, borderRadius: 6, background: K.stone}} />
              </Card>
            </div>
          ))}
        </div>
      </div>
      {/* breaks harnesses */}
      <div style={{position: 'absolute', left: 1020, top: 470, width: 804, ...rise(b[4], 0)}}>
        <Card style={{padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, border: `2px solid ${K.red}`}}>
          <Wrench size={32} color={K.red} />
          <div>
            <Zh size={25} w={800}>
              会弄坏一些已有的 harness
            </Zh>
            <div>
              <Zh size={21} w={600} color={K.dim}>
                比如客户自己写的上下文压缩
              </Zh>
            </div>
          </div>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 1020, top: 610, width: 804, display: 'flex', gap: 14}}>
        <div style={pop(b[5], 0)}>
          <Card style={{padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, width: 395, boxSizing: 'border-box'}}>
            <GitPullRequest size={28} color={K.clay} />
            <Zh size={22} w={700}>
              提前找开源 harness 维护者
            </Zh>
          </Card>
        </div>
        <div style={pop(b[5], 12)}>
          <Card hot style={{padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, width: 395, boxSizing: 'border-box'}}>
            <Zh size={26} w={800} color={K.clay}>
              ✓
            </Zh>
            <Zh size={22} w={700}>
              API 补了新的压缩功能
            </Zh>
          </Card>
        </div>
      </div>
      <div style={{position: 'absolute', left: 96, top: 680, width: 860, ...rise(b[6], 0)}}>
        <Card hot style={{padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16}}>
          <Zh size={26} w={800} color={K.clay}>
            ✓
          </Zh>
          <Zh size={25} w={800}>
            能测到的指标上，蒸馏明显更难了
          </Zh>
        </Card>
      </div>
      <SrcLine f={b[0]}>来源：节目 8:17 起「Distillation and preserved thinking」一段（自动转写）</SrcLine>
    </Shell>
  );
};

// ------------------------------------------------------------------ outro
export const Outro: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const qs = ['哪些部分，必须活下来？', '哪些部分，在跑不可信的东西？', '哪些钥匙，真的需要出现在代码运行的地方？'];
  // callback: the document again, this time it resumes after the restart
  const f = b[5];
  const fill = f < 0 ? 0 : Math.min(0.87, 0.87 * prog(f, 30, 30)) + (f > 60 ? Math.min(0.13, (f - 60) / 300) : 0);
  return (
    <Shell part="收尾">
      <Head kicker="THREE QUESTIONS" title="换成你自己的 agent" />
      <div style={{position: 'absolute', left: 96, top: 240, width: 1000}}>
        {qs.map((q, i) => (
          <div key={q} style={{position: 'absolute', left: 0, top: i * 124, width: 1000, height: 102, border: `2px dashed ${K.line}`, borderRadius: 18, boxSizing: 'border-box', opacity: prog(b[0], 12, 10 + i * 6) * (1 - prog(b[i + 1], 8))}} />
        ))}
        {qs.map((q, i) => (
          <div key={q} style={{marginBottom: 22, ...rise(b[i + 1], 0)}}>
            <Card style={{padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 22}}>
              <NumBadge n={i + 1} size={52} />
              <Zh size={34} w={800}>
                {q}
              </Zh>
            </Card>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 96, top: 690, width: 1000, ...rise(b[4], 0)}}>
        <Serif size={44} style={{lineHeight: 1.35}}>
          好的系统，不是哪里都不会坏，
          <br />
          <span style={{color: K.clay}}>而是坏掉的那一块，不会带走别的。</span>
        </Serif>
      </div>
      {/* callback window */}
      <div style={{position: 'absolute', left: 1180, top: 300, width: 640, ...pop(b[5], 0)}}>
        <Card style={{padding: 0, overflow: 'hidden'}}>
          <div style={{height: 42, background: K.stone, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px'}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 11, height: 11, borderRadius: 11, background: K.line}} />
            ))}
            <Mo size={17} color={K.dim} style={{marginLeft: 12}}>
              第三章_草稿.docx
            </Mo>
          </div>
          <div style={{padding: '22px 28px'}}>
            <Pill bg={K.peach} border="rgba(201,96,63,0.35)" style={{fontSize: 20}}>
              重启后，已从别处恢复
            </Pill>
            <div style={{marginTop: 18}}>
              {[0.92, 0.8, 0.95, 0.66].map((w, i) => (
                <div key={i} style={{height: 14, width: `${w * 100}%`, background: K.stone, borderRadius: 4, marginBottom: 14}} />
              ))}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6}}>
              <Zh size={20} w={600} color={K.dim}>
                接着写
              </Zh>
              <Mo size={20} color={K.dim}>
                {Math.round(fill * 100)}%
              </Mo>
            </div>
            <div style={{marginTop: 8, height: 12, borderRadius: 12, background: K.stone}}>
              <div style={{height: 12, borderRadius: 12, width: `${fill * 100}%`, background: K.clay}} />
            </div>
          </div>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 690, width: 640, display: 'flex', alignItems: 'center', gap: 12, opacity: prog(b[5], 14, 50)}}>
        <div style={{width: 12, height: 12, borderRadius: 3, background: K.clay}} />
        <Zh size={22} w={600} color={K.dim}>
          Latent Space · Anthropic 工程博客 · 官方文档
        </Zh>
      </div>
    </Shell>
  );
};
