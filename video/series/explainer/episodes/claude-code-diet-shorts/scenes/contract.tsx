// 3: the task contract each task prompt should pin down — what to do, what not to touch, what proves it's done —
// filled with the playbook's migration example; the steps themselves are left to the model.
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Burst, Card, Center, IconCheck, IconFence, IconTarget, lerp, P, Pill, pop, prog, slam, Sparkles, Stage, T, useSub} from './common';

export const Contract: React.FC = () => {
  const b = useBeats();
  const sub = useSub();
  const shrink = b[3] >= 0 ? prog(b[3], 16) : 0; // cards compress to make room for the "steps" panel
  const cardAt = [sub(1, 0), sub(1, 0) - 26, sub(1, 1)];
  const H = lerp(200, 112, shrink);
  const GAP = lerp(228, 128, shrink);
  const TOP = lerp(540, 470, shrink);
  const CARDS: {k: string; v: string; vf: number; bg: string; icon: React.ReactNode; extra?: React.ReactNode; note?: string}[] = [
    {k: '要做什么', v: '迁移一批接口', note: '也就是把一批旧代码换成新写法', vf: sub(2, 0), bg: P.yellow, icon: <IconTarget s={lerp(130, 80, shrink)} />},
    {
      k: '不能碰什么',
      v: '不准部署到生产环境',
      note: '生产环境 = 正在给用户用的线上系统',
      vf: sub(2, 3),
      bg: P.coral,
      icon: <IconFence s={lerp(130, 80, shrink)} />,
      extra: (
        <div style={{position: 'absolute', right: 26, top: 20, ...slam(sub(2, 3), 20, 2)}}>
          <Pill size={34} bg={P.ink} color={P.white}>
            红线
          </Pill>
        </div>
      ),
    },
    {
      k: '拿什么证明做完了',
      v: '测试全部跑通 · 旧代码删干净',
      vf: sub(2, 1),
      bg: P.mint,
      icon: <IconCheck s={lerp(130, 80, shrink)} p={prog(sub(1, 1), 14, 10)} />,
      extra: (
        <div style={{position: 'absolute', right: 26, top: 20, ...slam(sub(2, 2), 4, 2)}}>
          <Pill size={34} bg={P.ink} color={P.white}>
            = 做完
          </Pill>
        </div>
      ),
    },
  ];
  return (
    <Stage>
      {/* "每次交任务" first, then the contract it should carry */}
      {sub(0, 1) < 10 && (
        <Center y={340}>
          <div style={{...pop(b[0], 2), opacity: sub(0, 1) >= 0 ? 1 - prog(sub(0, 1), 8) : 1}}>
            <T size={74}>
              每次<span style={{color: P.yellow}}>交任务</span>
            </T>
          </div>
        </Center>
      )}
      <Center y={340}>
        <div style={pop(sub(0, 1), 6)}>
          <T size={74}>
            一份<span style={{color: P.yellow}}>任务契约</span>
          </T>
        </div>
      </Center>
      {shrink < 1 && (
        <Center y={448} style={{opacity: 1 - shrink}}>
          <div style={pop(sub(0, 2), 0)}>
            <Pill size={40} bg={P.white}>
              就写清三件事
            </Pill>
          </div>
        </Center>
      )}
      {/* three empty slots wait for the cards */}
      {[0, 1, 2].map((i) =>
        cardAt[i] < 8 ? (
          <div key={i} style={{position: 'absolute', left: 100, top: TOP + i * GAP, width: 860, height: H, boxSizing: 'border-box', border: `6px dashed rgba(255,255,255,0.55)`, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: prog(sub(0, 1), 10, 8 + i * 6) * (cardAt[i] >= 0 ? 1 - prog(cardAt[i], 6) : 1)}}>
            <T size={90} color="rgba(255,255,255,0.7)">
              {'①②③'[i]}
            </T>
          </div>
        ) : null,
      )}
      {CARDS.map((c, i) => (
        <div key={c.k} style={{position: 'absolute', left: 100, top: TOP + i * GAP, ...pop(cardAt[i], 0, 0.5)}}>
          <Card x={0} y={0} w={860} h={H} bg={c.bg} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: lerp(30, 20, shrink), padding: `0 ${lerp(34, 24, shrink)}px`}}>
            {c.icon}
            <div>
              <T size={lerp(60, 44, shrink)} color={i === 1 ? P.white : P.ink} style={{display: 'block'}}>
                {c.k}
              </T>
              {shrink < 0.6 && (
                <T size={34} w={800} color={i === 1 ? P.white : P.ink} style={{display: 'block', marginTop: 6, opacity: prog(c.vf, 10) * (1 - shrink / 0.6)}}>
                  {c.v}
                </T>
              )}
              {shrink < 0.6 && c.note && (
                <T size={30} w={700} color={i === 1 ? P.white : P.ink} style={{display: 'block', marginTop: 4, opacity: 0.9 * prog(c.vf, 10, 14) * (1 - shrink / 0.6)}}>
                  {c.note}
                </T>
              )}
            </div>
            {shrink < 0.6 && <div style={{opacity: 1 - shrink / 0.6}}>{c.extra}</div>}
          </Card>
        </div>
      ))}
      <Burst x={530} y={540 + 2 * 228 + 100} f={sub(2, 1) + 10} n={30} spread={380} seed={21} />
      <Sparkles x={830} y={540 + 2 * 228 + 40} f={sub(2, 2)} n={6} r={110} />

      {/* the steps are left to the model: it draws its own route */}
      {b[3] >= 0 && (
        <div style={{position: 'absolute', left: 100, top: 880, ...pop(b[3], 6, 0.6)}}>
          <div style={{width: 860, height: 380, background: P.navy, borderRadius: 28, boxShadow: `0 14px 0 ${P.shadow}`, position: 'relative', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 30, top: 24, display: 'flex', gap: 14}}>
              {['先改哪个文件？', '步骤怎么拆？'].map((q, k) => (
                <div key={q} style={pop(sub(3, 0), k * 8)}>
                  <Pill size={30} bg={P.sky}>
                    {q}
                  </Pill>
                </div>
              ))}
            </div>
            <svg width={860} height={380} style={{position: 'absolute', left: 0, top: 0}}>
              <circle cx={90} cy={290} r={22} fill={P.white} />
              <path
                d="M90 290 C 200 160, 300 330, 420 230 S 640 120, 760 210"
                stroke={P.yellow}
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="1"
                pathLength={1}
                strokeDashoffset={1 - prog(sub(3, 1), 40)}
              />
              <path d="M760 130 L760 230 M760 130 L820 150 L760 172" stroke={P.mint} strokeWidth={10} fill={P.mint} strokeLinejoin="round" opacity={prog(sub(3, 1), 10)} />
            </svg>
            <div style={{position: 'absolute', right: 30, bottom: 22, ...pop(sub(3, 1), 10)}}>
              <T size={38} color={P.yellow}>
                交给它自己定
              </T>
            </div>
          </div>
        </div>
      )}
    </Stage>
  );
};
