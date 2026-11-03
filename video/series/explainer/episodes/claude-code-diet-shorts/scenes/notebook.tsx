// 1: what Claude Code is, what a prompt and CLAUDE.md are, and how the rule notebook keeps growing.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Burst, Center, Doc, Illus, IconCross, Mono, P, Pill, pop, prog, rise, rng, shakeAt, slam, Slip, Stage, T, typed, useSub, Window} from './common';

const CODE = ['def migrate(client):', '    for ep in endpoints:', '        ep.use(new_sdk)', '    run_tests()', '# done'];
const MORE = ['认真思考', '全面检查', '反复确认三遍', '不要加注释', '按需写文档', 'think carefully', '先列计划再动手', '改完再检查一遍'];

export const Notebook: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  // phase A (b0–b1): the code window; phase B (b2–b4): the notebook
  const aOut = b[2] >= 0 ? prog(b[2], 14) : 0;
  // sub() counts frames since the chunk started: these land when the narration reaches the quoted rule
  const slapA = sub(3, 1) - 23; // "必须测试" lands
  const slapB = sub(3, 2) - 25; // "只做最小修改" lands
  const moreAt = (i: number) => b[4] - 8 - i * 8;
  const landed = MORE.filter((_, i) => moreAt(i) >= 0).length;
  const thick = (slapA >= 0 ? 1 : 0) + (slapB >= 0 ? 1 : 0) + landed;
  const sh = shakeAt(frame, [frame - slapA, frame - slapB, ...MORE.map((_, i) => frame - moreAt(i))], 6);
  return (
    <Stage shake={b[3] >= 0 ? sh : undefined}>
      {/* ---------------- phase A: Claude Code writes code by itself */}
      {aOut < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - aOut, transform: `translateY(${-aOut * 120}px)`}}>
          <Center y={340}>
            <div style={pop(frame, 0)}>
              <T size={88}>Claude Code</T>
            </div>
          </Center>
          <Center y={462}>
            <div style={pop(sub(0, 1), 0)}>
              <Pill size={40}>会自己读代码、改代码的 AI</Pill>
            </div>
          </Center>
          <div style={rise(b[0], 6, 120)}>
            <Window x={110} y={570} w={840} h={440}>
              {CODE.map((l, i) => {
                const n = typed(b[0] - 14 - i * 14, l, 40);
                return (
                  <div key={i} style={{height: 50}}>
                    <Mono size={32} color={i === 4 ? P.mint : P.white}>
                      {l.slice(0, n)}
                    </Mono>
                  </div>
                );
              })}
            </Window>
            <Illus x={840} y={590} color={P.sky} />
          </div>
          {/* the prompt bubble flies into the window */}
          {b[1] >= 0 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 130,
                  top: 1080 - 380 * prog(b[1], 22, 26),
                  opacity: 1 - prog(b[1], 8, 44),
                  transform: `scale(${1 - 0.5 * prog(b[1], 22, 26)})`,
                  transformOrigin: 'left top',
                }}
              >
                <div style={pop(b[1], 0)}>
                  <div style={{background: P.white, borderRadius: 30, padding: '20px 32px', boxShadow: `0 10px 0 ${P.shadow}`, position: 'relative'}}>
                    <T size={40} color={P.ink}>
                      把这批旧代码换成新写法
                    </T>
                    <div style={{position: 'absolute', left: 40, bottom: -26, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `30px solid ${P.white}`}} />
                  </div>
                </div>
              </div>
              <Center y={1110}>
                <div style={pop(b[1], 30)}>
                  <Pill size={46} bg={P.coral} color={P.white}>
                    提示词 = 你交代给它的话
                  </Pill>
                </div>
              </Center>
            </>
          )}
        </div>
      )}

      {/* ---------------- phase B: the notebook it reads every time */}
      {b[2] >= 0 && (
        <>
          <Center y={340}>
            <div style={pop(b[2], 6)}>
              <T size={70}>
                说明书
                {/* the file name arrives when the narration says it */}
                <span style={{color: P.yellow, display: 'inline-block', marginLeft: 24 * prog(sub(2, 1), 10), maxWidth: 640 * prog(sub(2, 1), 10), overflow: 'hidden', verticalAlign: 'bottom', whiteSpace: 'nowrap'}}>CLAUDE.md</span>
              </T>
            </div>
          </Center>
          <Center y={448}>
            <div style={{...pop(b[2], 16), opacity: b[4] >= 0 ? 1 - prog(b[4], 8) : 1}}>
              <Pill size={36} bg={P.white}>
                长期有效
              </Pill>
            </div>
          </Center>
          {b[4] >= 0 && (
            <Center y={448}>
              <div style={pop(sub(4, 0), 4)}>
                <Pill size={36} bg={P.sky}>
                  几代模型换下来
                </Pill>
              </div>
            </Center>
          )}
          <div style={{...pop(b[2], 10, 0.5)}}>
            <Doc x={150} y={560} w={560} h={580} title={sub(2, 1) >= 0 ? 'CLAUDE.md' : ''} thick={Math.min(12, thick * 1.4)} scan={sub(2, 2) >= 0 && b[3] < 0 ? (sub(2, 2) % 40) / 40 : -1} lines={10} />
          </div>
          {/* small Claude Code window that reads it */}
          <div style={{position: 'absolute', left: 740, top: 600, ...pop(sub(2, 2), 0)}}>
            <div style={{width: 210, height: 170, background: P.navy, borderRadius: 22, boxShadow: `0 10px 0 ${P.shadow}`, padding: 18, boxSizing: 'border-box'}}>
              <div style={{display: 'flex', gap: 8}}>
                {[P.coral, P.yellow, P.mint].map((c) => (
                  <span key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
                ))}
              </div>
              <T size={32} color={P.sky} style={{display: 'block', marginTop: 10}}>
                开工前
              </T>
              <T size={36} style={{display: 'block'}}>
                先读一遍
              </T>
            </div>
          </div>
          {sub(2, 2) >= 0 && (
            <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
              <path d="M715 760 C 760 740, 760 720, 790 720" stroke={P.white} strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(sub(2, 2), 14, 6)} />
            </svg>
          )}
          {/* a test was missed → a rule gets added */}
          {b[3] >= 0 && (
            <div style={{position: 'absolute', left: 740, top: 820, ...pop(sub(3, 0), 0)}}>
              <div style={{width: 210, background: P.white, borderRadius: 22, padding: '16px 10px', textAlign: 'center', boxShadow: `0 10px 0 ${P.shadow}`, opacity: b[4] >= 0 ? 1 - prog(b[4], 10) : 1}}>
                <IconCross s={70} p={prog(sub(3, 0), 12, 6)} style={{margin: '0 auto'}} />
                <T size={34} color={P.ink}>
                  漏跑测试
                </T>
              </div>
            </div>
          )}
          {[
            ['必须测试！！', slapA, 640, -6],
            ['只做最小修改', slapB, 740, 5],
          ].map(([t, f, y, rot]) =>
            (f as number) >= -10 ? (
              <div key={t as string} style={{position: 'absolute', left: 190, top: y as number, transform: `rotate(${rot}deg)`}}>
                <div style={slam(f as number, -10, 2.2)}>
                  <Slip text={t as string} size={44} bg={P.coral} color={P.white} />
                </div>
              </div>
            ) : null,
          )}
          {MORE.map((t, i) => {
            const f = moreAt(i);
            if (f < -10) return null;
            const r = rng(60 + i);
            return (
              <div key={t} style={{position: 'absolute', left: 150 + r() * 330, top: 820 + (i % 4) * 78 + Math.floor(i / 4) * 30, transform: `rotate(${(r() - 0.5) * 16}deg)`}}>
                <div style={slam(f, -10, 2)}>
                  <Slip text={t} size={36} bg={i % 2 ? P.white : '#FFE1D8'} />
                </div>
              </div>
            );
          })}
          {b[4] >= 0 && (
            <>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{position: 'absolute', left: [760, 860, 800][k], top: [960, 1020, 1110][k], ...slam(sub(4, 2), k * 6, 2.4)}}>
                  <T size={[110, 80, 96][k]} color={P.yellow} shadow={P.coral}>
                    ？
                  </T>
                </div>
              ))}
            </>
          )}
          <Illus x={130} y={1236} />
          <Burst x={330} y={700} f={slapA} n={18} spread={240} seed={4} size={20} />
          <Burst x={330} y={800} f={slapB} n={18} spread={240} seed={6} size={20} />
        </>
      )}
    </Stage>
  );
};
