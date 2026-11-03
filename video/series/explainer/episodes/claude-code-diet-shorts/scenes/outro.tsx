// End: the two things, then the sign-off.
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Burst, Card, Center, IconCheck, P, Pill, pop, prog, Ring, slam, Sparkles, Stage, T, useSub} from './common';

export const Outro: React.FC = () => {
  const b = useBeats();
  const sub = useSub();
  const out = b[1] >= 0 ? prog(b[1], 12) : 0;
  return (
    <Stage spin={0.2}>
      {out < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translateY(${-out * 160}px)`}}>
          <Center y={340}>
            <div style={pop(sub(0, 0), 0)}>
              <T size={80}>
                说到底就<span style={{color: P.yellow}}>两件事</span>
              </T>
            </div>
          </Center>
          <div style={pop(sub(0, 1), 0, 0.5)}>
            <Card x={100} y={500} w={860} h={300} bg={P.mint} style={{display: 'flex', alignItems: 'center', gap: 34, padding: '0 44px'}}>
              <IconCheck s={140} c="#0D2B1F" p={prog(sub(0, 1), 14, 6)} />
              <div>
                <T size={44} color="#0D2B1F" style={{display: 'block'}}>
                  一开始就讲清楚
                </T>
                <T size={64} color="#0D2B1F" style={{display: 'block'}}>
                  怎么算做完
                </T>
              </div>
            </Card>
          </div>
          <div style={pop(sub(0, 2), 0, 0.5)}>
            <Card x={100} y={850} w={860} h={300} bg={P.yellow} style={{display: 'flex', alignItems: 'center', gap: 34, padding: '0 44px'}}>
              <svg width={140} height={140} viewBox="0 0 140 140">
                <rect x="14" y="74" width="112" height="52" rx="18" fill={P.ink} />
                <path d="M34 100 A 36 36 0 0 1 106 100" stroke={P.yellow} strokeWidth="8" fill="none" />
                <line x1="70" y1="100" x2={70 + 30 * Math.cos(Math.PI * (0.75 - 0.4 * prog(sub(0, 2), 20, 8)))} y2={100 - 30 * Math.sin(Math.PI * (0.75 - 0.4 * prog(sub(0, 2), 20, 8)))} stroke={P.yellow} strokeWidth="7" strokeLinecap="round" />
                <rect x="40" y="22" width="60" height="46" rx="8" fill={P.white} stroke={P.ink} strokeWidth="6" />
              </svg>
              <div>
                <T size={44} color={P.ink} style={{display: 'block'}}>
                  定期给旧规则
                </T>
                <T size={64} color={P.ink} style={{display: 'block'}}>
                  瘦身
                </T>
              </div>
            </Card>
          </div>
        </div>
      )}
      {b[1] >= 0 && (
        <>
          <Ring x={530} y={720} f={b[1] - 4} max={600} />
          <Burst x={530} y={720} f={b[1] - 4} n={70} spread={600} seed={51} />
          <Center y={560}>
            <div style={slam(b[1], 4, 2.4)}>
              <T size={150} shadow={P.coral}>
                我是<span style={{color: P.yellow}}>老潘</span>
              </T>
            </div>
          </Center>
          <Center y={820}>
            <div style={pop(b[1], 18)}>
              <Pill size={64}>欢迎关注</Pill>
            </div>
          </Center>
          <Sparkles x={530} y={760} f={b[1] - 20} n={10} r={380} />
        </>
      )}
    </Stage>
  );
};
