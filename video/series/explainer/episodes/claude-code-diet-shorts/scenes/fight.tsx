// 2: rules fight each other (the official "documentation vs. no comments" example), get folded into one line,
// and the "think harder" lines can go because the model already thinks before it acts.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Burst, Card, Center, IconCross, Illus, P, Pill, pop, prog, Ring, shakeAt, slam, Slip, Sparkles, Stage, T, useSub} from './common';

export const Fight: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const bump = [frame - (b[0] - 14), frame - (b[0] - 30)];
  const sh = shakeAt(frame, b[1] < 0 ? bump : [], 12);
  // tug: the model circle sways toward each side while it can't decide
  const tugT = sub(1, 3);
  const sway = tugT >= 0 && b[2] < 0 ? Math.sin(tugT / 5) * 70 * Math.min(1, tugT / 10) : 0;
  const merge = b[2] >= 0 ? prog(b[2], 18, 4) : 0; // the two cards fly to the centre
  const MERGE_AT = 22;
  const part12 = b[3] >= 0 ? 1 - prog(b[3], 12) : 1;
  return (
    <Stage shake={sh}>
      {/* ---------------- b0: rules fight */}
      <Center y={340}>
        <div style={{...pop(b[0], 0), opacity: b[1] >= 0 ? 1 - prog(b[1], 10) : 1}}>
          <T size={80}>
            规矩一多，就会<span style={{color: P.yellow}}>打架</span>
          </T>
        </div>
      </Center>
      {b[1] < 12 && (
        <div style={{opacity: b[1] >= 0 ? 1 - prog(b[1], 10) : 1}}>
          <div style={{position: 'absolute', left: 140, top: 640, transform: `translateX(${Math.sin(Math.max(0, b[0]) / 3) * 18}px) rotate(-8deg)`, ...pop(b[0], 0)}}>
            <Slip text="必须写注释" size={50} bg={P.yellow} />
          </div>
          <div style={{position: 'absolute', left: 540, top: 820, transform: `translateX(${-Math.sin(Math.max(0, b[0]) / 3) * 18}px) rotate(7deg)`, ...pop(b[0], 6)}}>
            <Slip text="不要加注释" size={50} bg={P.coral} color={P.white} />
          </div>
          <Illus x={150} y={960} />
          <div style={{position: 'absolute', left: 440, top: 700, ...slam(b[0], 12, 2.4)}}>
            <svg width={140} height={180} viewBox="0 0 140 180">
              <path d="M80 0 L20 100 L64 100 L40 180 L124 66 L78 66 L104 0Z" fill={P.yellow} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* ---------------- b1–b2: the official example, then one line */}
      {b[1] >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: part12}}>
          <Center y={340}>
            <div style={pop(sub(1, 0), 4)}>
              <Pill size={42}>官方文章里的例子</Pill>
            </div>
          </Center>
          {/* ropes */}
          {merge < 1 && (
            <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - merge}}>
              <path d={`M330 600 Q ${430 + sway * 0.5} 700 ${530 + sway} 830`} stroke={P.white} strokeWidth={10} fill="none" strokeDasharray="20 14" opacity={prog(sub(1, 1), 10)} />
              <path d={`M730 1060 Q ${630 + sway * 0.5} 950 ${530 + sway} 830`} stroke={P.white} strokeWidth={10} fill="none" strokeDasharray="20 14" opacity={prog(sub(1, 2), 10)} />
            </svg>
          )}
          {/* left card: leave documentation as appropriate */}
          <div style={{position: 'absolute', left: 110 + merge * 220, top: 470 + merge * 300, transform: `scale(${1 - merge})`, transformOrigin: 'center', ...pop(sub(1, 1), 0)}}>
            <Card x={0} y={0} w={440} h={170} bg={P.yellow} pad="20px 28px">
              <T size={48} color={P.ink}>
                按需写文档
              </T>
              <T size={24} w={700} color={P.ink} style={{display: 'block', opacity: 0.7, marginTop: 6, fontFamily: '"JetBrains Mono", monospace'}}>
                leave documentation as appropriate
              </T>
            </Card>
          </div>
          {/* right card: DO NOT add comments */}
          <div style={{position: 'absolute', left: 510 - merge * 180, top: 1000 - merge * 230, transform: `scale(${1 - merge})`, transformOrigin: 'center', ...pop(sub(1, 2), 0)}}>
            <Card x={0} y={0} w={440} h={170} bg={P.coral} pad="20px 28px">
              <T size={48}>不要加注释</T>
              <T size={24} w={700} style={{display: 'block', opacity: 0.85, marginTop: 6, fontFamily: '"JetBrains Mono", monospace'}}>
                DO NOT add comments
              </T>
            </Card>
          </div>
          {/* the model in the middle */}
          {merge < 1 && (
            <div style={{position: 'absolute', left: 530 + sway - 105, top: 730, opacity: 1 - merge, ...pop(sub(1, 1), 10)}}>
              <div style={{width: 210, height: 210, borderRadius: 105, background: P.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 0 ${P.shadow}`}}>
                <T size={50}>模型</T>
              </div>
            </div>
          )}
          {[0, 1, 2].map((k) => (
            <div key={k} style={{position: 'absolute', left: [700, 290, 760][k], top: [700, 860, 880][k], opacity: 1 - merge, ...slam(tugT, 8 + k * 10, 2.2)}}>
              <T size={[110, 80, 70][k]} color={P.yellow} shadow={P.coral}>
                ？
              </T>
            </div>
          ))}
          {/* merged into one line */}
          <Burst x={530} y={830} f={b[2] - MERGE_AT} n={50} spread={520} seed={12} />
          <Ring x={530} y={830} f={b[2] - MERGE_AT} color={P.mint} />
          <Center y={560}>
            <div style={pop(sub(2, 0), 20)}>
              <T size={44} color={P.sky}>
                Claude Code 新版提示词收成一句
              </T>
            </div>
          </Center>
          <Center y={700}>
            <div style={slam(b[2], MERGE_AT, 2)}>
              <Card x={0} y={0} w={860} h={250} bg={P.mint} style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <T size={74} color="#0D2B1F">
                  照周围代码的写法来
                </T>
              </Card>
            </div>
          </Center>
          <Sparkles x={530} y={830} f={sub(2, 1)} n={8} r={460} />
        </div>
      )}

      {/* ---------------- b3: "think harder" lines go; the model thinks anyway */}
      {b[3] >= 0 && (
        <>
          <Center y={340}>
            <div style={pop(b[3], 6)}>
              <T size={66}>这类话也可以删</T>
            </div>
          </Center>
          {['认真思考', '反复检查'].map((t, i) => {
            const go = prog(sub(3, 0), 18, 52 + i * 8);
            return (
              <div key={t} style={{position: 'absolute', left: [150, 540][i], top: 480, opacity: 1 - go, transform: `translate(${(i ? 1 : -1) * go * 400}px, ${-go * 200}px) rotate(${(i ? 1 : -1) * (6 + go * 40)}deg)`}}>
                <div style={pop(sub(3, 0), i * 8)}>
                  <Slip text={`“${t}”`} size={54} />
                </div>
                <div style={{position: 'absolute', left: 30, top: -10, ...pop(sub(3, 0), 30 + i * 6)}}>
                  <IconCross s={110} p={prog(sub(3, 0), 14, 30 + i * 6)} />
                </div>
              </div>
            );
          })}
          {/* the model already thinks before it acts */}
          <div style={{position: 'absolute', left: 110, top: 680, ...pop(sub(3, 1), 0, 0.6)}}>
            <div style={{width: 840, height: 470, background: P.navy, borderRadius: 28, boxShadow: `0 14px 0 ${P.shadow}`, padding: '34px 44px', boxSizing: 'border-box'}}>
              <T size={34} color={P.sky}>
                新模型
              </T>
              <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 26}}>
                <div style={{width: 70, height: 70, borderRadius: 35, border: `10px solid ${P.yellow}`, borderTopColor: 'transparent', transform: `rotate(${frame * 12}deg)`, boxSizing: 'border-box'}} />
                <T size={60}>先想</T>
                <T size={60} color={P.yellow}>
                  →
                </T>
                <T size={60}>再动手</T>
              </div>
              <div style={{display: 'flex', gap: 14, marginTop: 40}}>
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <div key={k} style={{flex: 1, height: 22, borderRadius: 11, background: k / 6 < ((sub(3, 1) % 60) / 60) * 1.2 ? P.mint : 'rgba(255,255,255,0.15)'}} />
                ))}
              </div>
              <T size={30} color={P.sky} style={{display: 'block', marginTop: 30}}>
                输出前本来就会自己思考
              </T>
            </div>
          </div>
        </>
      )}
    </Stage>
  );
};
