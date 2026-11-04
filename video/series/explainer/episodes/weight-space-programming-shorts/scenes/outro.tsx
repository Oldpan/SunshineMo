// Outro: 「还很有限」 → the three things the authors released (logs, the edited model, the demo) as glowing cards →
// particles converge for the sign-off 「我是老潘，下期再见」.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Center, Field, G, Panel, POOL, pop, prog, Q, Ring, ringPts, rise, slam, Sparkles, Streaks, Swarm, useSub} from './common';

const LINKS: [string, string][] = [
  ['全部实验日志', '在 GitHub 上：发给 Astra 的、它回的、跑过的代码'],
  ['改好的千问模型', '在 Hugging Face 上，可以直接下载'],
  ['在线 Demo', '在 Hugging Face 上，打开网页就能看'],
];
const RING = ringPts(540, 800, 330, 48, 300);

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const open = sub(0, 1);
  const bye = b[1];
  return (
    <Field pool={POOL} bloom={bye >= 0 ? 0.6 : 0.2} cy={800}>
      <div style={{opacity: 1 - prog(bye, 12)}}>
        <Center y={340}>
          <div style={pop(b[0], 0)}>
            <G size={58} w={800}>
              这本事现在<span style={{color: Q.yellow}}>还很有限</span>
            </G>
          </div>
        </Center>
        {open >= 0 && (
          <Center y={440}>
            <div style={rise(open, 0)}>
              <G size={50} w={800} color={Q.green} glow={0.4}>
                实验记录全部公开
              </G>
            </div>
          </Center>
        )}
        {LINKS.map(([t, u], i) => (
          <Panel key={t} x={130} y={560 + i * 200} w={820} h={170} hot={b[0] >= 40 + i * 10} style={{...rise(b[0], 40 + i * 10), padding: '24px 34px'}}>
            <G size={50} w={800}>
              {t}
            </G>
            <div style={{marginTop: 8}}>
              <G size={32} w={600} color={Q.green}>
                {u}
              </G>
            </div>
          </Panel>
        ))}
      </div>
      {bye >= 0 && (
        <>
          <Swarm f={bye} to={RING.map((p, i) => ({x: 540 + (p.x - 540) * (1 + 0.04 * Math.sin(frame / 12 + i)), y: p.y}))} pool={POOL} seed={41} dur={24} spread={16} size={24} color={Q.green} />
          <Streaks f={bye - 4} cx={540} cy={800} />
          <Ring x={540} y={800} f={bye - 20} color={Q.green} max={460} />
          <Center y={700}>
            <div style={slam(bye, 4, 2)}>
              <G size={92} color={Q.ink} glow={0.5}>
                我是老潘
              </G>
            </div>
          </Center>
          <Center y={820}>
            <div style={slam(bye, 12, 2)}>
              <G size={92} color={Q.green} glow={1}>
                下期再见
              </G>
            </div>
          </Center>
          <Sparkles x={540} y={800} f={bye - 40} n={10} color={Q.green} r={300} />
        </>
      )}
    </Field>
  );
};
