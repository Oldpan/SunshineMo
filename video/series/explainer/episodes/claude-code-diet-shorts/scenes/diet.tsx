// 5: put old rules on a diet — back up, drop one group, re-run, delete only when it stays green, add back the few
// lines a regression needs; the built-in prompt audit; and the caveat about the 80%.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Burst, Card, Center, clamp01, Doc, IconCamera, IconCheck, IconCross, Illus, Mono, P, Pill, pop, prog, rise, slam, Slip, Stage, T, typed, useSub, Window} from './common';

const GROUP = ['认真思考', '反复确认三遍', '请深入思考'];
const AUDIT: [string, string, string][] = [
  ['- 测试：uv run pytest', '', ''],
  ['- 旧模型时期加的补丁', '过时', P.grey],
  ['- 参考 docs/old-api.md', '失效', P.coral],
  ['- 必须写注释', '打架', P.yellow],
  ['- 不要加注释', '打架', P.yellow],
];

export const Diet: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const partA = b[3] >= 0 ? 1 - prog(b[3], 12) : 1; // b0–b2
  const partB = b[4] >= 0 ? 1 - prog(b[4], 12) : 1; // b3
  const needle = b[1] >= 0 ? 0.85 - 0.35 * prog(sub(2, 0), 20, 30) : 0.85 * prog(b[0], 26, 6);
  const flash = b[1] >= 0 ? 1 - prog(sub(1, 0), 10, 6) : 0;
  const lift = prog(sub(1, 0), 16, 40); // the group is lifted out
  const gone = prog(sub(2, 0), 12, 40); // ...and deleted
  const back = prog(sub(2, 2), 16, 8); // one small line slides back
  const step = b[1] < 0 ? -1 : sub(1, 1) < 0 ? (lift > 0.5 ? 1 : 0) : 2;
  return (
    <Stage>
      {/* ---------------- b0–b2: the diet */}
      {partA > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: partA}}>
          <Center y={340}>
            <div style={pop(b[0], 0)}>
              <T size={78}>
                旧规则也要定期<span style={{color: P.yellow}}>减肥</span>
              </T>
            </div>
          </Center>
          {/* steps */}
          <Center y={460}>
            <div style={{display: 'inline-flex', gap: 16, ...pop(b[1], 0)}}>
              {['① 备份', '② 删一组', '③ 重跑'].map((t, i) => (
                <Pill key={t} size={36} bg={step >= i ? P.yellow : 'rgba(255,255,255,0.25)'} color={step >= i ? P.ink : P.white}>
                  {t}
                </Pill>
              ))}
            </div>
          </Center>
          {/* notebook on a scale */}
          <div style={pop(b[0], 4, 0.6)}>
            <Doc x={130} y={560} w={430} h={470} thick={Math.max(0, 10 - 6 * gone)} lines={8} />
            <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
              <rect x={110} y={1070} width={470} height={150} rx={36} fill={P.white} />
              <path d="M235 1170 A 110 110 0 0 1 455 1170" stroke={P.grey} strokeWidth={16} fill="none" />
              <path d="M405 1100 A 110 110 0 0 1 455 1170" stroke={P.coral} strokeWidth={16} fill="none" />
              <line x1={345} y1={1170} x2={345 + Math.cos(Math.PI * (1 - needle)) * 90} y2={1170 - Math.sin(Math.PI * (1 - needle)) * 90} stroke={P.ink} strokeWidth={10} strokeLinecap="round" />
              <circle cx={345} cy={1170} r={14} fill={P.ink} />
            </svg>
          </div>
          {/* backup snapshot */}
          {b[1] >= 0 && (
            <div style={{position: 'absolute', left: 620, top: 560, ...pop(sub(1, 0), 0)}}>
              <Card x={0} y={0} w={330} h={150} bg={P.white} pad="20px 24px" style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 18}}>
                <IconCamera s={80} />
                <T size={38} color={P.ink}>
                  先备份
                </T>
              </Card>
            </div>
          )}
          <div style={{position: 'absolute', inset: 0, background: P.white, opacity: flash * 0.7, pointerEvents: 'none'}} />
          {/* the group that gets lifted out, then deleted */}
          {GROUP.map((t, i) => (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: 170 + lift * 460,
                top: 700 + i * 70 + lift * 40,
                opacity: (b[1] >= 0 ? 1 : prog(b[0], 10, 10)) * (1 - gone),
                transform: `rotate(${(i - 1) * 4}deg) scale(${1 - gone * 0.6})`,
              }}
            >
              <Slip text={t} size={34} bg={lift > 0.5 ? '#FFE1D8' : P.white} />
            </div>
          ))}
          {lift > 0.2 && gone < 1 && (
            <div style={{position: 'absolute', left: 640, top: 960, opacity: lift * (1 - gone)}}>
              <T size={34} color={P.yellow}>
                这一组先拿掉
              </T>
            </div>
          )}
          <Burst x={760} y={800} f={sub(2, 0) - 42} n={44} spread={380} seed={41} />
          {/* re-run: daily tasks + the old bad cases */}
          {sub(1, 1) >= 0 && (
            <div style={{position: 'absolute', left: 620, top: 1040, ...rise(sub(1, 1), 0)}}>
              {['日常任务', '当初踩过的坑'].map((t, i) => (
                <div key={t} style={{marginBottom: 18}}>
                  <T size={30} style={{display: 'block'}}>
                    {t}
                  </T>
                  <div style={{width: 330, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.22)', marginTop: 6, overflow: 'hidden'}}>
                    <div style={{width: `${100 * prog(sub(1, 1), 40, 10 + i * 10)}%`, height: '100%', background: sub(2, 1) >= 0 && i === 1 ? P.coral : P.mint}} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* several runs stay green → delete for real */}
          {b[2] >= 0 && (
            <div style={{position: 'absolute', left: 620, top: 750, display: 'flex', gap: 14, opacity: 1 - prog(sub(2, 1), 10)}}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{...pop(sub(2, 0), k * 9)}}>
                  <div style={{width: 96, height: 96, borderRadius: 48, background: P.mint, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <IconCheck s={64} c="#0D2B1F" p={prog(sub(2, 0), 10, k * 9 + 4)} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* a regression → add back only the few lines it needs */}
          {sub(2, 1) >= 0 && (
            <>
              <div style={{position: 'absolute', left: 640, top: 740, ...slam(sub(2, 1), 0, 2)}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <IconCross s={84} p={prog(sub(2, 1), 10)} />
                  <T size={40}>出了问题</T>
                </div>
              </div>
              <div style={{position: 'absolute', left: 640 - back * 460, top: 880 + back * 30, opacity: prog(sub(2, 2), 8), transform: `rotate(${-4 * back}deg)`}}>
                <Slip text="+ 只加回那几行" size={34} bg={P.yellow} />
              </div>
            </>
          )}
          <Illus x={130} y={1236} />
        </div>
      )}

      {/* ---------------- b3: the built-in prompt audit */}
      {b[3] >= 0 && partB > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: partB}}>
          <Center y={340}>
            <div style={pop(sub(3, 0), 4)}>
              <T size={70}>
                自带的<span style={{color: P.yellow}}>体检命令</span>
              </T>
            </div>
          </Center>
          <div style={rise(sub(3, 0), 6, 120)}>
            <Window x={100} y={460} w={860} h={190} title="Claude Code">
              <Mono size={44} color={P.yellow}>
                {'> ' + '/doctor prompt-audit'.slice(0, typed(sub(3, 1) + 4, '/doctor prompt-audit', 30))}
              </Mono>
            </Window>
          </div>
          <div style={pop(sub(3, 1), 20, 0.7)}>
            <Doc x={100} y={700} w={860} h={470} lines={0} scan={sub(3, 2) >= 0 && sub(3, 4) < 0 ? clamp01((sub(3, 2) % 70) / 70) : -1}>
              {AUDIT.map(([t, tag, c], i) => {
                const f = i < 2 ? sub(3, 2) - 14 - i * 10 : sub(3, 3) - (i - 2) * 12;
                return (
                  <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 74}}>
                    <Mono size={32} color={P.ink} style={{opacity: tag && f >= 0 ? 0.55 : 1, textDecoration: tag && f >= 0 ? 'line-through' : undefined}}>
                      {t}
                    </Mono>
                    {tag && (
                      <div style={pop(f, 0)}>
                        <Pill size={30} bg={c} color={c === P.coral ? P.white : P.ink}>
                          {tag}
                        </Pill>
                      </div>
                    )}
                  </div>
                );
              })}
            </Doc>
          </div>
          {/* nothing changes until you confirm */}
          {sub(3, 4) >= 0 && (
            <div style={{position: 'absolute', left: 230, top: 880, ...slam(sub(3, 4), 0, 1.6)}}>
              <Card x={0} y={0} w={600} h={250} bg={P.white} pad="30px 40px" style={{position: 'relative', textAlign: 'center', boxShadow: `0 16px 0 ${P.shadow}, 0 0 0 2000px rgba(14,22,96,0.35)`}}>
                <T size={44} color={P.ink} style={{display: 'block'}}>
                  确认修改？
                </T>
                <div style={{display: 'flex', gap: 20, justifyContent: 'center', marginTop: 30}}>
                  <Pill size={36} bg={P.mint} color="#0D2B1F" style={{transform: `scale(${1 + 0.06 * Math.sin(frame / 5)})`}}>
                    确认
                  </Pill>
                  <Pill size={36} bg={P.grey}>
                    取消
                  </Pill>
                </div>
              </Card>
              <div style={{marginTop: 24, textAlign: 'center'}}>
                <T size={36}>你点头之前，不改文件</T>
              </div>
            </div>
          )}
          <Illus x={830} y={712} color={P.ink} />
        </div>
      )}

      {/* ---------------- b4: the caveat */}
      {b[4] >= 0 && (
        <>
          <Center y={340}>
            <div style={slam(sub(4, 0), 0, 2)}>
              <Pill size={56} bg={P.coral} color={P.white}>
                注意
              </Pill>
            </div>
          </Center>
          <div style={pop(sub(4, 1), 0, 0.6)}>
            <Card x={100} y={490} w={860} h={330} bg={P.yellow} pad="34px 40px">
              <T size={120} color={P.ink} style={{display: 'block', lineHeight: 1}}>
                −80%
              </T>
              <T size={46} color={P.ink} style={{display: 'block', marginTop: 20}}>
                删的是 Claude Code 自己的提示词
              </T>
            </Card>
          </div>
          <div style={pop(sub(4, 2), 0, 0.6)}>
            <Card x={100} y={870} w={860} h={330} bg={P.white} pad="34px 40px" style={{position: 'relative'}}>
              <T size={46} color={P.ink} style={{display: 'block'}}>
                你的 CLAUDE.md
              </T>
              <T size={60} color={P.coral} style={{display: 'block', marginTop: 16}}>
                别照这个比例硬砍
              </T>
              <div style={{position: 'absolute', right: 40, top: 60}}>
                <svg width={150} height={150} viewBox="0 0 150 150">
                  <circle cx={45} cy={110} r={24} fill="none" stroke={P.ink} strokeWidth={10} />
                  <circle cx={105} cy={110} r={24} fill="none" stroke={P.ink} strokeWidth={10} />
                  <path d="M60 92 L118 14 M90 92 L32 14" stroke={P.ink} strokeWidth={10} strokeLinecap="round" />
                </svg>
                <div style={{position: 'absolute', left: 0, top: 0}}>
                  <IconCross s={150} p={prog(sub(4, 2), 14, 16)} />
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </Stage>
  );
};

