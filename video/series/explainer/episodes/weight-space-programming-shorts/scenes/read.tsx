// Experiment 1 for non-technical viewers: four game-playing nets, each just a block of ~17,000 numbers that all look
// alike → Astra's scan beam goes over each and the post's own gameplay GIF appears under a lock-on → zoom on Breakout:
// the post's heatmap of the "where am I" channel lights up the bottom row, and the paddle sits right there.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Center, Field, G, GameScreen, GlowHeat, gridPts, Lock, Panel, POOL, pop, prog, Q, Ring, rise, Scan, Sparkles, Swarm, Tag, useSub} from './common';

const GAMES: [string, string][] = [
  ['breakout', '打砖块'],
  ['pong', '乒乓'],
  ['pacman', '吃豆人'],
  ['freeway', '过马路'],
];
const BOX = 380;
const POS = [
  [120, 400],
  [580, 400],
  [120, 850],
  [580, 850],
];

export const Read: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const reveal = sub(1, 1);
  const zoom = b[2];
  const row = sub(2, 1);
  const pad = sub(2, 2);
  const grid = 1 - prog(zoom, 14);
  return (
    <Field pool={POOL} bloom={reveal >= 0 && reveal < 30 ? 0.6 : 0.2} cy={820}>
      {/* ---------- four nets */}
      <div style={{opacity: grid, transform: `scale(${1 + prog(zoom, 14) * 0.15})`, transformOrigin: '310px 590px'}}>
        <Center y={330}>
          <div style={{...pop(b[0], 0), opacity: (pop(b[0], 0).opacity as number) * (1 - prog(b[1], 10))}}>
            <G size={54} w={800} color={Q.mint}>
              四个玩小游戏的 AI
            </G>
          </div>
        </Center>
        {b[1] >= 0 && (
          <Center y={330}>
            <div style={rise(b[1], 4)}>
              <G size={54} w={800} color={Q.green} glow={0.4}>
                Astra 只看数字……
              </G>
            </div>
          </Center>
        )}
        {GAMES.map(([g, name], i) => {
          const [x, y] = POS[i];
          const pts = gridPts(x + 58, y + 50, 4, 9, 88, 36);
          const show = reveal - i * 10;
          return (
            <React.Fragment key={g}>
              <Panel x={x} y={y} w={BOX} h={BOX} hot={show >= 0} style={{...pop(b[0], 6 + i * 6, 0.6), overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 40, top: 40, opacity: prog(show, 14)}}>
                  <GameScreen game={g} t={frame - i * 7} size={300} />
                </div>
              </Panel>
              <div style={{opacity: 1 - prog(show, 12)}}>
                <Swarm f={b[0] - i * 6} to={pts} pool={POOL} seed={20 + i} dur={24} spread={20} size={21} color={Q.dim} />
              </div>
              <Scan f={b[1] - i * 8} x={x} w={BOX} y0={y} y1={y + BOX} dur={30} />
              <Lock x={x + 30} y={y + 30} w={320} h={320} p={prog(show, 10)} color={Q.green} />
              {show >= 0 && <Ring x={x + BOX / 2} y={y + BOX / 2} f={show} color={Q.green} max={260} width={8} />}
              <div style={{position: 'absolute', left: x, width: BOX, top: y + BOX - 70, textAlign: 'center', ...pop(show, 8)}}>
                <div style={{display: 'inline-block', background: Q.green, borderRadius: 14, padding: '0 22px'}}>
                  <G size={44} color={Q.bg}>
                    {name}
                  </G>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {/* 17,000+ numbers each; same structure, different numbers */}
        {sub(0, 1) >= 0 && b[1] < 0 && (
          <Center y={1238}>
            <div style={rise(sub(0, 1), 0)}>
              <div style={{display: 'inline-block', background: 'rgba(5,9,12,0.9)', border: `3px solid ${Q.yellow}`, borderRadius: 18, padding: '2px 26px'}}>
                <G size={44} w={800} color={Q.yellow}>
                  {sub(0, 3) >= 0 ? '结构一样 · 数字各不相同' : sub(0, 2) >= 0 ? '结构一模一样' : '每个 17,000+ 个数字'}
                </G>
              </div>
            </div>
          </Center>
        )}
        {sub(0, 2) >= 0 &&
          b[1] < 0 &&
          POS.map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 6, top: y - 6, width: BOX + 12, height: BOX + 12, borderRadius: 30, border: `4px solid ${Q.yellow}`, opacity: prog(sub(0, 2), 8) * (1 - prog(sub(0, 3), 10)) * (0.6 + 0.4 * Math.sin(frame / 4)), boxShadow: `0 0 30px ${Q.yellow}66`}} />)}
      </div>

      {/* ---------- Breakout close-up */}
      {zoom >= 0 && (
        <>
          <Center y={340}>
            <div style={rise(zoom, 6)}>
              <G size={58} w={800}>
                比如<span style={{color: Q.green}}>打砖块</span>那个
              </G>
            </div>
          </Center>
          <div style={{position: 'absolute', left: 100, top: 470, ...rise(zoom, 10)}}>
            <Tag color={Q.dim}>它的数字（画成格子）</Tag>
            <div style={{marginTop: 14}}>
              <GlowHeat ch={0} size={400} p={prog(zoom, 40, 10)} />
            </div>
          </div>
          <Lock x={92} y={514 + 8 * 40 - 8} w={416} h={56} p={prog(row, 12)} color={Q.yellow} />
          {row >= 0 && (
            <div style={{position: 'absolute', left: 100, top: 940, width: 420, ...rise(row, 8)}}>
              <G size={40} w={800} color={Q.yellow}>
                “自己在哪”的数字
              </G>
              <br />
              <G size={40} w={800} color={Q.yellow}>
                全挤在最底下
              </G>
            </div>
          )}
          {pad >= 0 && (
            <>
              <div style={{position: 'absolute', left: 520, top: 690, ...pop(pad, 0)}}>
                <G size={70} color={Q.green} glow={0.6}>
                  →
                </G>
              </div>
              <div style={{position: 'absolute', left: 590, top: 470, ...pop(pad, 6, 0.6)}}>
                <Tag color={Q.dim}>它玩的游戏</Tag>
                <div style={{marginTop: 14, border: `3px solid ${Q.green}`, boxShadow: `0 0 30px ${Q.green}55`}}>
                  <GameScreen game="breakout" t={pad} size={360} />
                </div>
              </div>
              <Lock x={582} y={514 + 8 * 36 - 8} w={376} h={52} p={prog(pad, 12, 14)} color={Q.yellow} />
              <div style={{position: 'absolute', left: 743, top: 884, ...pop(pad, 14)}}>
                <G size={44} color={Q.yellow} glow={0.6}>
                  ▲
                </G>
              </div>
              <div style={{position: 'absolute', left: 590, top: 940, width: 370, ...rise(pad, 18)}}>
                <G size={40} w={800} color={Q.green}>
                  底部有块挡板
                </G>
              </div>
              <Sparkles x={770} y={820} f={pad - 20} n={8} color={Q.yellow} r={200} />
            </>
          )}
        </>
      )}
    </Field>
  );
};
