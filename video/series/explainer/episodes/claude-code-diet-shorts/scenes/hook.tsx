// 0–7 s hook: a tower of rule slips slams in, gets slashed, 80% explodes, "−80%" lands, "核心测试成绩没掉" pops;
// then your own CLAUDE.md starts filling up with slips again.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Burst, Center, clamp01, Doc, flyOut, Illus, P, Pill, pop, prog, Ring, rng, shakeAt, slam, Slip, Sparkles, Stage, T} from './common';

const RULES = ['必须测试！！', '只做最小修改', '认真思考', '全面检查', '反复确认三遍', '不要加注释', '按需写文档', '先列计划再动手', 'think carefully', '请深入思考', '改完再检查一遍', '一定要仔细'];
const LAND = (i: number) => 2 + i * 4; // slip i lands
const CUT = 68; // slash
const BOOM = 73; // explosion + "−80%"
const KEEP = 3; // bottom slips that survive (≈20%)
const MINE = ['必须测试！！', '只做最小修改', '认真思考', '不要加注释', '按需写文档', '反复确认三遍'];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const r = rng(5);
  const slots = RULES.map((_, i) => ({x: 530 + (r() - 0.5) * 120, y: 1190 - i * 58, rot: (r() - 0.5) * 9, dx: (r() - 0.5) * 1500, dy: -300 - r() * 700, spin: (r() - 0.5) * 140}));
  const hits = [...RULES.map((_, i) => LAND(i)), BOOM];
  const sh = shakeAt(frame, hits, 7);
  const big = shakeAt(frame, [BOOM], 26);
  const out = b[2] >= 0 ? b[2] : -1; // part 2 starts
  const part1 = out < 0 ? 1 : 1 - prog(out, 12);
  const slashP = prog(frame, 6, CUT);
  return (
    <Stage shake={{dx: sh.dx + big.dx, dy: sh.dy + big.dy}} glow={clamp01(1 - Math.abs(frame - BOOM) / 30)} spin={frame < BOOM ? 0.12 : 0.35}>
      {/* ---------------- part 1: the tower */}
      <div style={{position: 'absolute', inset: 0, opacity: part1, transform: `translateY(${(1 - part1) * -200}px)`}}>
        <Center y={340}>
          <div style={pop(frame, 0)}>
            <Pill size={40}>Claude Code 团队</Pill>
          </div>
        </Center>
        <Center y={418}>
          <div style={pop(frame, 6)}>
            <T size={76}>自己的提示词</T>
          </div>
        </Center>
        {RULES.map((t, i) => {
          const s = slots[i];
          const land = LAND(i);
          const fall = clamp01((frame - land + 8) / 8);
          const y = s.y - (1 - fall) * 320 - (i < KEEP ? i * 16 * prog(frame, 14, BOOM + 4) : 0);
          const gone = i >= KEEP ? flyOut(frame, BOOM, s.dx, s.dy, s.spin) : {};
          if (frame < land - 8) return null;
          return (
            <div key={i} style={{position: 'absolute', left: s.x, top: y, transform: `translate(-50%, -50%) rotate(${s.rot}deg)`}}>
              <div style={gone}>
                <Slip text={t} size={38} bg={i % 3 === 0 ? P.white : i % 3 === 1 ? '#FFF4C2' : '#FFE1D8'} />
              </div>
            </div>
          );
        })}
        <div style={{opacity: frame < BOOM ? prog(frame, 8, 20) : 1 - prog(frame, 10, BOOM)}}>
          <Illus x={800} y={1140} />
        </div>
        {/* slash */}
        {frame >= CUT && frame < BOOM + 10 && (
          <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
            <path d="M120 1010 L960 420" stroke={P.white} strokeWidth={22 * (1 - prog(frame, 10, BOOM))} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - slashP} />
          </svg>
        )}
        <Ring x={530} y={700} f={frame - BOOM} max={620} />
        <Ring x={530} y={700} f={frame - BOOM - 5} color={P.yellow} max={460} width={10} />
        <Burst x={530} y={720} f={frame - BOOM} n={70} spread={620} seed={9} size={34} />
        {/* −80% */}
        <Center y={530}>
          <div style={slam(frame, BOOM + 1, 2.6)}>
            <T size={250} color={P.yellow} shadow={P.coral} style={{letterSpacing: -6}}>
              −80%
            </T>
          </div>
        </Center>
        {/* core tests did not drop */}
        <Center y={860}>
          <div style={slam(b[1], 0, 1.8)}>
            <Pill size={54} bg={P.mint} color="#0D2B1F">
              ✓ 核心测试成绩没掉
            </Pill>
          </div>
        </Center>
        <Sparkles x={530} y={900} f={b[1] - 4} n={8} r={330} />
      </div>

      {/* ---------------- part 2: your own CLAUDE.md fills up again */}
      {out >= 0 && (
        <>
          <Center y={360}>
            <div style={pop(out, 4)}>
              <T size={72}>你写给 AI 的规矩</T>
            </div>
          </Center>
          <div style={pop(out, 8, 0.6)}>
            <Doc x={250} y={500} w={560} h={560} thick={Math.min(8, Math.max(0, (out - 14) / 6))} title="你的 CLAUDE.md" lines={9} />
          </div>
          {MINE.map((t, i) => {
            const f = out - 14 - i * 7;
            if (f < 0) return null;
            const fall = clamp01(f / 7);
            const rr = rng(40 + i);
            const x = 300 + rr() * 260;
            const y = 600 + i * 70 - (1 - fall) * 400;
            return (
              <div key={t} style={{position: 'absolute', left: x, top: y, transform: `rotate(${(rr() - 0.5) * 14}deg)`, opacity: fall}}>
                <Slip text={t} size={32} bg={i % 2 ? P.white : '#FFE1D8'} />
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 640, top: 1030, ...slam(out, 52, 2)}}>
            <div style={{transform: 'rotate(-10deg)'}}>
              <Pill size={56} bg={P.coral} color={P.white}>
                太多了？
              </Pill>
            </div>
          </div>
          <Illus x={250} y={1110} />
        </>
      )}
    </Stage>
  );
};
