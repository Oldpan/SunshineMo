// 千问 3.5 (Qwen3.5-0.8B), told plainly. A dense cloud of its numbers + an 8-亿 counter → the looping problem as a
// spinning vortex of its own repeated words while a length meter fills up red with no answer → Astra's scan finds
// layers 15 and 19 (of 24) and slashes the push away; the vortex collapses → "0.016%", then math 7.9 → 48.1 and
// instruction-following 21 → 62.3 → the Gemma 3 270M control stays flat → the rock-on-the-road picture: an edit can
// move the rock, it can't make a new road.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Bar, Burst, Center, clamp01, Field, G, Illus, Lock, Panel, POOL, pop, prog, Q, Ring, rise, Scan, shakeAt, slam, Sparkles, Streaks, Swarm, Tag, useSub} from './common';

const CLOUD = Array.from({length: 190}, (_, i) => {
  const a = i * 2.399963;
  const r = Math.sqrt(i / 190) * 380;
  return {x: 540 + Math.cos(a) * r, y: 820 + Math.sin(a) * r * 0.95};
});
// illustrative looping text (the post shows the model repeating itself; this wording is ours)
const LOOP = '等一下，再检查一遍……先算出每一项，再加起来……等一下，再检查一遍……';
const LAYERS = 24;
const LY = (i: number) => 410 + i * 31; // layer i (0-based, layer 1 at the top)

const Vortex: React.FC<{f: number; cx: number; cy: number; scale?: number; collapse?: number}> = ({f, cx, cy, scale = 1, collapse = 0}) => {
  const chars = [...LOOP.repeat(3)];
  const n = Math.min(chars.length, Math.floor(f * 1.6));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {chars.slice(0, n).map((c, k) => {
        const r = (70 + k * 3.6) * scale * (1 - collapse);
        const a = k * 0.2 + f / 14 + collapse * 6;
        return (
          <text key={k} x={cx + Math.cos(a) * r} y={cy + Math.sin(a) * r * 0.9} fontFamily='"Noto Sans SC"' fontSize={(26 + (k % 3) * 4) * scale} fontWeight={700} fill={k % 9 === 0 ? Q.red : Q.mint} opacity={(0.35 + 0.65 * clamp01(1 - k / chars.length)) * (1 - collapse)} textAnchor="middle" transform={`rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r * 0.9})`}>
            {c}
          </text>
        );
      })}
    </svg>
  );
};

export const Qwen: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const size8 = sub(0, 1);
  const loop = sub(1, 1);
  const write = sub(1, 2);
  const full = sub(1, 3);
  const cut = sub(2, 1);
  const math = sub(3, 1);
  const ife = sub(3, 2);
  const gflat = sub(4, 1);
  const rock = sub(5, 1);
  const noAdd = sub(5, 2);
  const sh = shakeAt(frame, [frame - cut, frame - b[3], frame - full], 16);
  return (
    <Field pool={POOL} shake={sh} bloom={b[0] >= 0 && b[1] < 0 ? 0.5 : cut >= 0 && cut < 40 ? 0.7 : 0.2} cy={820}>
      {/* ---------- the model: a cloud of 8亿 numbers */}
      {b[1] < 14 && (
        <div style={{opacity: 1 - prog(b[1], 14)}}>
          <Swarm f={b[0]} to={CLOUD} pool={POOL} seed={31} dur={30} spread={34} size={20} color={Q.dim} />
          <Streaks f={b[0] - 26} cx={540} cy={820} />
          <Center y={700}>
            <div style={slam(b[0], 0, 2.4)}>
              <div style={{display: 'inline-block', background: 'rgba(5,9,12,0.8)', borderRadius: 28, padding: '0 30px'}}>
                <G size={120} color={Q.green} glow={1}>
                  千问 3.5
                </G>
              </div>
            </div>
          </Center>
          {size8 >= 0 && (
            <Center y={1180}>
              <div style={rise(size8, 0)}>
                <G size={70} num color={Q.yellow} glow={0.5}>
                  {Math.round(800000000 * prog(size8, 40)).toLocaleString('en-US')}
                </G>
                <G size={44} w={800} color={Q.yellow}>
                  {' '}个数字
                </G>
              </div>
            </Center>
          )}
          <Center y={340}>
            <div style={rise(size8, 10)}>
              <G size={50} w={800} color={Q.mint}>
                一个真的大模型
              </G>
            </div>
          </Center>
        </div>
      )}

      {/* ---------- why it fails at math: looping */}
      {b[1] >= 0 && b[3] < 14 && (
        <div style={{opacity: prog(b[1], 12, 4) * (1 - prog(b[3], 14))}}>
          {b[2] < 0 && (
            <Center y={340}>
              <div style={rise(b[1], 4)}>
                <G size={56} w={900}>
                  数学差，<span style={{color: Q.green}}>不是不会算</span>
                </G>
              </div>
            </Center>
          )}
          {loop >= -40 && (
            <div style={{opacity: b[2] >= 0 ? 0.45 + 0.55 * (1 - prog(b[2], 14)) : 1, transform: `translate(${prog(b[2], 18) * 230}px, ${prog(b[2], 18) * 40}px) scale(${1 - prog(b[2], 18) * 0.45})`, transformOrigin: '540px 800px'}}>
              <Vortex f={loop + 40} cx={540} cy={800} collapse={prog(cut, 24, 4)} />
              <Center y={745}>
                <div style={{...slam(loop, 0, 2.2), opacity: (slam(loop, 0, 2.2).opacity as number) * (1 - prog(cut, 14))}}>
                  <G size={96} color={Q.red} glow={0.8}>
                    打转
                  </G>
                </div>
              </Center>
            </div>
          )}
          {write >= 0 && b[2] < 0 && <Illus x={840} y={1110} />}
          {write >= 0 && b[2] < 0 && (
            <div style={{position: 'absolute', left: 130, top: 1170, width: 820, ...rise(write, 0)}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <G size={34} w={800} color={Q.grey}>
                  写下的字数
                </G>
                <G size={34} w={800} color={full >= 0 ? Q.red : Q.grey}>
                  {full >= 0 ? '写满了 · 答案：？' : '上限'}
                </G>
              </div>
              <div style={{marginTop: 10, height: 30, border: `3px solid ${Q.deep}`, borderRadius: 15, overflow: 'hidden'}}>
                <div style={{width: `${100 * prog(write, 70)}%`, height: '100%', background: full >= 0 ? Q.red : Q.yellow, boxShadow: `0 0 20px ${full >= 0 ? Q.red : Q.yellow}`}} />
              </div>
            </div>
          )}
          {/* layers 15 and 19 */}
          {b[2] >= 0 && (
            <>
              <Center y={330}>
                <div style={rise(b[2], 0)}>
                  <G size={50} w={800}>
                    Astra 一层层找原因
                  </G>
                </div>
              </Center>
              {Array.from({length: LAYERS}, (_, i) => {
                const hot = (i === 14 || i === 18) && prog(b[2], 1, 60 + (i === 18 ? 14 : 0)) > 0;
                const fixed = cut >= 0;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 210,
                      top: LY(i),
                      width: 420 * prog(b[2], 14, i),
                      height: 22,
                      borderRadius: 6,
                      background: hot ? (fixed ? Q.green : Q.red) : '#0F2A1F',
                      border: `2px solid ${hot ? (fixed ? Q.green : Q.red) : Q.deep}`,
                      boxShadow: hot ? `0 0 24px ${fixed ? Q.green : Q.red}` : undefined,
                    }}
                  />
                );
              })}
              <Illus x={840} y={1130} />
              <Scan f={b[2] - 6} x={190} w={460} y0={LY(0) - 6} y1={LY(23) + 30} dur={50} />
              {[14, 18].map((i, k) => (
                <React.Fragment key={i}>
                  <Lock x={196} y={LY(i) - 10} w={448} h={42} p={prog(b[2], 10, 60 + k * 14)} color={cut >= 0 ? Q.green : Q.red} />
                  <div style={{position: 'absolute', left: 100, top: LY(i) - 12, ...pop(b[2], 64 + k * 14)}}>
                    <G size={38} num color={cut >= 0 ? Q.green : Q.red}>
                      {i + 1}
                    </G>
                  </div>
                </React.Fragment>
              ))}
              <div style={{position: 'absolute', left: 100, top: LY(0) - 6, opacity: prog(b[2], 10, 20)}}>
                <G size={28} num color={Q.dim}>
                  1
                </G>
              </div>
              <div style={{position: 'absolute', left: 100, top: LY(23) - 6, opacity: prog(b[2], 10, 20)}}>
                <G size={28} num color={Q.dim}>
                  24
                </G>
              </div>
              <div style={{position: 'absolute', left: 210, top: LY(23) + 50, ...rise(b[2], 90)}}>
                <G size={40} w={800} color={cut >= 0 ? Q.green : Q.red}>
                  {cut >= 0 ? '把这股劲减掉了' : '第 15、19 层：推着它打转的劲'}
                </G>
              </div>
              {cut >= 0 && (
                <>
                  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
                    <path d={`M170 ${LY(18) + 70} L690 ${LY(14) - 50}`} stroke={Q.ink} strokeWidth={14 * (1 - prog(cut, 14, 8))} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(cut, 6)} style={{filter: `drop-shadow(0 0 12px ${Q.green})`}} />
                  </svg>
                  <Burst x={420} y={LY(16)} f={cut - 4} n={40} spread={420} seed={15} size={20} colors={[Q.green, Q.mint, Q.ink]} />
                  <Ring x={420} y={LY(16)} f={cut - 4} color={Q.green} max={400} />
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ---------- the result */}
      {b[3] >= 0 && b[4] < 14 && (
        <div style={{opacity: 1 - prog(b[4], 14)}}>
          <Ring x={540} y={420} f={b[3]} color={Q.green} max={520} />
          <Center y={330} style={{transform: `scale(${1 - prog(math, 16) * 0.35})`, transformOrigin: '50% 0'}}>
            <div style={slam(b[3], 0, 2.8)}>
              <G size={56} w={800}>
                只动了{' '}
              </G>
              <G size={150} num color={Q.green} glow={1.2}>
                0.016%
              </G>
            </div>
          </Center>
          <Center y={560}>
            <div style={{...rise(b[3], 24), opacity: (rise(b[3], 24).opacity as number) * (1 - prog(math, 10))}}>
              <G size={64} num color={Q.yellow} glow={0.4}>
                13 万
              </G>
              <G size={44} w={800} color={Q.ink}>
                {' '}/ 8 亿个数字
              </G>
            </div>
          </Center>
          {math >= 0 && (
            <>
              <div style={{position: 'absolute', left: 110, top: 1180, width: 860, height: 4, background: Q.deep}} />
              <Bar x={140} base={1180} w={150} v={7.9} scale={10} p={prog(math, 16)} color={Q.grey} />
              <Bar x={320} base={1180} w={150} v={48.1} scale={10} p={prog(math, 40, 16)} />
              <div style={{position: 'absolute', left: 110, width: 390, top: 1196, textAlign: 'center', ...rise(math, 4, 20)}}>
                <G size={40} w={800} color={Q.green}>
                  数学答对率
                </G>
              </div>
              <Sparkles x={395} y={620} f={math - 50} n={7} color={Q.green} r={150} />
            </>
          )}
          {ife >= 0 && (
            <>
              <Bar x={590} base={1180} w={150} v={21} scale={10} p={prog(ife, 16)} color={Q.grey} dec={0} />
              <Bar x={760} base={1180} w={150} v={62.3} scale={10} p={prog(ife, 40, 16)} color={Q.cyan} />
              <div style={{position: 'absolute', left: 580, width: 390, top: 1196, textAlign: 'center', ...rise(ife, 4, 20)}}>
                <G size={40} w={800} color={Q.cyan}>
                  听指令
                </G>
              </div>
              <Sparkles x={835} y={560} f={ife - 50} n={7} color={Q.cyan} r={150} />
            </>
          )}
        </div>
      )}

      {/* ---------- control: a model that doesn't loop */}
      {b[4] >= 0 && b[5] < 14 && (
        <div style={{opacity: prog(b[4], 12, 6) * (1 - prog(b[5], 14))}}>
          <Center y={340}>
            <G size={52} w={800}>
              换一个<span style={{color: Q.yellow}}>本来就不打转</span>的小模型
            </G>
          </Center>
          <Center y={420}>
            <Tag color={Q.dim}>另一个小模型 · Gemma</Tag>
          </Center>
          <div style={{position: 'absolute', left: 210, top: 1180, width: 660, height: 4, background: Q.deep}} />
          <Bar x={270} base={1180} w={200} v={6.8} scale={11} p={prog(b[4], 20, 10)} color={Q.grey} />
          <Bar x={610} base={1180} w={200} v={7.7} scale={11} p={prog(gflat, 20)} color={Q.grey} />
          <div style={{position: 'absolute', left: 220, width: 300, top: 1196, textAlign: 'center'}}>
            <G size={36} w={800} color={Q.grey}>
              改之前
            </G>
          </div>
          <div style={{position: 'absolute', left: 560, width: 300, top: 1196, textAlign: 'center', opacity: prog(gflat, 10)}}>
            <G size={36} w={800} color={Q.grey}>
              改得最好的一次
            </G>
          </div>
          {gflat >= 0 && (
            <div style={{position: 'absolute', left: 0, width: 1080, top: 640, textAlign: 'center', transform: 'rotate(-5deg)'}}>
              <div style={slam(gflat, 10, 2.2)}>
                <div style={{display: 'inline-block', border: `6px solid ${Q.red}`, borderRadius: 20, padding: '6px 30px', background: 'rgba(5,9,12,0.9)'}}>
                  <G size={72} color={Q.red} glow={0.4}>
                    提不上去
                  </G>
                </div>
              </div>
            </div>
          )}
          {gflat >= 0 && (
            <Center y={860}>
              <div style={rise(gflat, 24)}>
                <G size={40} w={800} color={Q.grey}>
                  只差不到 1 个点，算不上提升
                </G>
              </div>
            </Center>
          )}
          <Center y={540}>
            <div style={{opacity: prog(b[4], 10, 20)}}>
              <G size={34} w={700} color={Q.grey}>
                数学答对率（%）
              </G>
            </div>
          </Center>
        </div>
      )}

      {/* ---------- the rock on the road */}
      {b[5] >= 0 && (
        <div style={{opacity: prog(b[5], 12, 4)}}>
          <Center y={340}>
            <G size={50} w={800} color={Q.mint}>
              作者说，在这个例子里
            </G>
          </Center>
          <Illus x={840} y={1210} />
          {/* row 1: the road with a rock */}
          <Panel x={110} y={440} w={860} h={330} hot={rock >= 0}>
            <div style={{position: 'absolute', left: 30, top: 18}}>
              <G size={36} w={800} color={Q.green}>
                ✓ 能搬走挡路的石头
              </G>
            </div>
          </Panel>
          <div style={{position: 'absolute', left: 150, top: 690, width: 780, height: 10, borderRadius: 5, background: Q.green, boxShadow: `0 0 16px ${Q.green}`}} />
          {(() => {
            const r = prog(rock, 22, 6);
            const ball = prog(rock, 40, 24);
            return (
              <>
                <div style={{position: 'absolute', left: 520 + r * 120, top: 600 - r * 140, transform: `rotate(${r * 50}deg)`, width: 110, height: 90, borderRadius: '45% 55% 40% 50%', background: '#5B6B66', border: '4px solid #8FA39A'}} />
                <div style={{position: 'absolute', left: 190 + ball * 640, top: 630, width: 60, height: 60, borderRadius: 30, background: Q.yellow, boxShadow: `0 0 30px ${Q.yellow}`}} />
                <div style={{position: 'absolute', left: 840, top: 560, opacity: prog(rock, 10, 50)}}>
                  <G size={60}>🏁</G>
                </div>
              </>
            );
          })()}
          {/* row 2: can't add a road that isn't there */}
          {noAdd >= 0 && (
            <>
              <Panel x={110} y={820} w={860} h={330} hot color={Q.red} style={rise(noAdd, 0)}>
                <div style={{position: 'absolute', left: 30, top: 18}}>
                  <G size={36} w={800} color={Q.red}>
                    ✗ 变不出本来没有的本事
                  </G>
                </div>
              </Panel>
              <div style={{position: 'absolute', left: 150, top: 1070, width: 280, height: 10, borderRadius: 5, background: Q.green, opacity: prog(noAdd, 10)}} />
              <div style={{position: 'absolute', left: 450, top: 1066, width: 480, height: 18, border: `4px dashed ${Q.red}`, borderRadius: 9, opacity: prog(noAdd, 10, 10) * (0.6 + 0.4 * Math.sin(frame / 5))}} />
              <div style={{position: 'absolute', left: 360, top: 1010, width: 60, height: 60, borderRadius: 30, background: Q.yellow, boxShadow: `0 0 30px ${Q.yellow}`, opacity: prog(noAdd, 10)}} />
              <div style={{position: 'absolute', left: 620, top: 960, ...pop(noAdd, 18)}}>
                <G size={90} color={Q.red} glow={0.6}>
                  ✗
                </G>
              </div>
            </>
          )}
        </div>
      )}
    </Field>
  );
};
