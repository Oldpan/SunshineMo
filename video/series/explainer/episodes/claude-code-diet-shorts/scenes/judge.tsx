// 4: /goal — one model works, a small model grades from the evidence in the conversation; checkable criteria beat
// vague ones; before delivery a fresh session reviews and lists everything, you pick.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Burst, Card, Center, clamp01, IconCheck, IconLens, Illus, Mono, P, Pill, pop, prog, rise, slam, Sparkles, Stage, T, useSub, Window} from './common';

export const Judge: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const partA = b[3] >= 0 ? 1 - prog(b[3], 12) : 1; // b0–b2
  const partB = b[4] >= 0 ? 1 - prog(b[4], 12) : 1; // b3
  // evidence trips: first one is rejected, second one passes
  const trip1 = sub(2, 0);
  const trip2 = sub(2, 2) - 4;
  const paperT = (f: number) => clamp01(f / 22);
  return (
    <Stage>
      {/* ---------------- b0: grading */}
      {b[1] < 14 && (
        <div style={{position: 'absolute', inset: 0, opacity: b[1] >= 0 ? 1 - prog(b[1], 12) : 1}}>
          <Center y={340}>
            <div style={pop(sub(0, 1), 0)}>
              <T size={74}>
                请另一个模型来<span style={{color: P.yellow}}>判卷</span>
              </T>
            </div>
          </Center>
          <div style={{position: 'absolute', left: 230, top: 500, ...pop(b[0], 0, 0.6), transform: `${pop(b[0], 0, 0.6).transform} rotate(-4deg)`}}>
            <Card x={0} y={0} w={600} h={680} bg={P.white} pad="40px 50px" style={{position: 'relative'}}>
              <T size={44} color={P.ink}>
                完成条件
              </T>
              {['测试全部跑通', '旧代码删干净', '不碰生产环境'].map((t, i) => (
                <div key={t} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 34}}>
                  <IconCheck s={60} c={P.mint} p={prog(sub(0, 1), 10, 8 + i * 10)} />
                  <T size={40} w={800} color={P.ink}>
                    {t}
                  </T>
                </div>
              ))}
            </Card>
          </div>
          <div style={{position: 'absolute', left: 620, top: 980, ...slam(sub(0, 1), 40, 2.4)}}>
            <div style={{transform: 'rotate(-12deg)', border: `8px solid ${P.coral}`, borderRadius: 20, padding: '4px 22px'}}>
              <T size={70} color={P.coral}>
                ✓ 通过
              </T>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- b1–b2: /goal loop */}
      {b[1] >= 0 && partA > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: partA}}>
          <Center y={340}>
            <div style={pop(sub(1, 0), 4)}>
              <span style={{background: P.navy, borderRadius: 20, padding: '8px 34px', boxShadow: `0 10px 0 ${P.shadow}`, display: 'inline-block'}}>
                <Mono size={64} color={P.yellow}>
                  /goal
                </Mono>
              </span>
            </div>
          </Center>
          {/* worker */}
          <div style={pop(sub(1, 1), 0, 0.5)}>
            <Window x={100} y={520} w={400} h={360} title="干活的">
              <T size={40} style={{display: 'block'}}>
                Claude Code
              </T>
              <div style={{display: 'flex', gap: 10, marginTop: 30}}>
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} style={{flex: 1, height: 26, borderRadius: 13, background: ((frame / 6 + k) | 0) % 4 === 0 ? P.mint : 'rgba(255,255,255,0.18)'}} />
                ))}
              </div>
              <T size={28} color={P.sky} style={{display: 'block', marginTop: 26}}>
                改代码 · 跑测试
              </T>
            </Window>
          </div>
          {/* checker */}
          <div style={{position: 'absolute', left: 560, top: 560, ...pop(sub(1, 2), 0, 0.5)}}>
            <Card x={0} y={0} w={400} h={300} bg={P.white} pad="30px 34px" style={{position: 'relative'}}>
              <IconLens s={96} />
              <T size={44} color={P.ink} style={{display: 'block', marginTop: 16}}>
                检查的
              </T>
              <T size={30} w={800} color={P.ink} style={{display: 'block', opacity: 0.7}}>
                一个小模型
              </T>
            </Card>
          </div>
          {/* evidence paper → checker */}
          {[trip1, trip2].map((f, k) =>
            f >= 0 && f < 40 ? (
              <div key={k} style={{position: 'absolute', left: 300 + 360 * paperT(f), top: 900 - 220 * Math.sin(Math.PI * paperT(f)) * 0.5, opacity: 1 - prog(f, 8, 26), transform: `rotate(${-10 + 20 * paperT(f)}deg)`}}>
                <Card x={0} y={0} w={190} h={130} bg={P.yellow} r={16} pad="16px 18px">
                  <T size={30} color={P.ink}>
                    证据
                  </T>
                  <Mono size={20} color={P.ink} style={{display: 'block', marginTop: 6}}>
                    命令 · 结果
                  </Mono>
                </Card>
              </div>
            ) : null,
          )}
          <Center y={920}>
            <div style={pop(sub(2, 0), 0)}>
              <T size={40} color={P.sky}>
                只看对话里贴出来的证据
              </T>
            </div>
          </Center>
          {/* verdict 1: not yet → loop back */}
          {sub(2, 1) >= 0 && sub(2, 2) < 6 && (
            <>
              <div style={{position: 'absolute', left: 640, top: 760, ...slam(sub(2, 1), 0, 2.4)}}>
                <Pill size={44} bg={P.coral} color={P.white}>
                  ✕ 没达标
                </Pill>
              </div>
              <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
                <path d="M760 880 C 760 1120, 300 1120, 300 900" stroke={P.coral} strokeWidth={14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(sub(2, 1), 24, 8)} />
                <path d="M270 930 L300 890 L332 930" stroke={P.coral} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={prog(sub(2, 1), 6, 30)} />
              </svg>
              <div style={{position: 'absolute', left: 400, top: 1080, ...pop(sub(2, 1), 24)}}>
                <Pill size={38} bg={P.white}>
                  再来一轮
                </Pill>
              </div>
            </>
          )}
          {/* verdict 2: done → stop */}
          {sub(2, 2) >= 20 && (
            <>
              <div style={{position: 'absolute', left: 620, top: 760, ...slam(sub(2, 2), 20, 2.4)}}>
                <Pill size={44} bg={P.mint} color="#0D2B1F">
                  ✓ 达标 · 停
                </Pill>
              </div>
              <Burst x={760} y={800} f={sub(2, 2) - 22} n={40} spread={380} seed={31} />
            </>
          )}
          <Illus x={100} y={1160} />
        </div>
      )}

      {/* ---------------- b3: checkable beats vague */}
      {b[3] >= 0 && partB > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: partB}}>
          <Center y={340}>
            <div style={pop(b[3], 4)}>
              <T size={72}>
                能核对的才<span style={{color: P.yellow}}>管用</span>
              </T>
            </div>
          </Center>
          {(() => {
            const drop = 70 * prog(sub(3, 1), 22, 4); // the checkable side sinks
            const yAt = (x: number) => 620 + drop - ((x - 150) / 760) * 2 * drop;
            const pans = [
              {x: 100, cx: 265, f: sub(3, 0), bg: P.mint, t: '“测试全部通过”', s: '能核对', c: '#0D2B1F'},
              {x: 630, cx: 795, f: sub(3, 1), bg: P.white, t: '“代码质量过关”', s: '没法核对', c: P.ink},
            ];
            return (
              <>
                <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
                  <rect x={515} y={620} width={30} height={560} rx={12} fill={P.white} />
                  <rect x={410} y={1160} width={240} height={36} rx={18} fill={P.white} />
                  {pans.map((p) => (
                    <line key={p.cx} x1={p.cx} y1={yAt(p.cx)} x2={p.cx} y2={yAt(p.cx) + 70} stroke={P.white} strokeWidth={8} opacity={prog(p.f, 10)} />
                  ))}
                  <line x1={150} y1={yAt(150)} x2={910} y2={yAt(910)} stroke={P.white} strokeWidth={28} strokeLinecap="round" />
                  <circle cx={530} cy={620} r={30} fill={P.yellow} />
                </svg>
                {pans.map((p, k) => (
                  <div key={p.t} style={{position: 'absolute', left: p.x, top: yAt(p.cx) + 70, ...rise(p.f, 0, 80)}}>
                    <Card x={0} y={0} w={330} h={270} bg={p.bg} pad="26px 16px" style={{position: 'relative', textAlign: 'center'}}>
                      <T size={36} color={p.c} style={{display: 'block', whiteSpace: 'nowrap'}}>
                        {p.t}
                      </T>
                      <div style={{marginTop: 18, height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {k ? <T size={96} color={P.coral}>？</T> : <IconCheck s={96} c="#0D2B1F" p={prog(p.f, 12, 8)} />}
                      </div>
                      <T size={34} w={800} color={p.c} style={{display: 'block', marginTop: 8}}>
                        {p.s}
                      </T>
                    </Card>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      )}

      {/* ---------------- b4: a fresh review session lists everything, you choose */}
      {b[4] >= 0 && (
        <>
          <Center y={340}>
            <div style={pop(sub(4, 0), 4)}>
              <T size={70}>
                交付前：<span style={{color: P.yellow}}>换个新会话审查</span>
              </T>
            </div>
          </Center>
          <div style={rise(sub(4, 1), 0, 300)}>
            <Window x={100} y={480} w={860} h={700} title="全新会话 · 审查">
              {[
                ['高', P.coral],
                ['高', P.coral],
                ['中', P.yellow],
                ['低', P.sky],
              ].map(([lv, c], i) => {
                const f = sub(4, 2) - i * 8;
                const ticked = i < 2 && sub(4, 3) - 10 - i * 14 >= 0;
                return (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, height: 110, borderBottom: '2px solid rgba(255,255,255,0.12)', ...rise(f, 0, 30)}}>
                    <div style={{width: 64, height: 64, borderRadius: 14, border: `5px solid ${P.white}`, boxSizing: 'border-box', background: ticked ? P.mint : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      {ticked && <IconCheck s={50} c="#0D2B1F" p={prog(sub(4, 3), 10, 10 + i * 14)} />}
                    </div>
                    <Pill size={30} bg={c as string}>
                      {lv as string}
                    </Pill>
                    <div style={{flex: 1}}>
                      <div style={{height: 18, width: `${80 - i * 12}%`, background: 'rgba(255,255,255,0.55)', borderRadius: 9}} />
                      <div style={{height: 14, width: `${55 - i * 6}%`, background: 'rgba(255,255,255,0.25)', borderRadius: 7, marginTop: 12}} />
                    </div>
                  </div>
                );
              })}
              <div style={{marginTop: 28, ...pop(sub(4, 3), 0)}}>
                <T size={40} color={P.yellow}>
                  问题全列出来，由你决定改哪些
                </T>
              </div>
            </Window>
          </div>
          <Illus x={830} y={1196} />
          <Sparkles x={250} y={700} f={sub(4, 3)} n={5} r={160} />
        </>
      )}
    </Stage>
  );
};
