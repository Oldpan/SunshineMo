// Part 4: draw_particles (cmp + b.ls), the worker system prompts v0 → v1 → v2 with the lead's reasons (verbatim
// from the article), and the lookup tool. The figure-vs-text discrepancy on draw_particles is stated on screen.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  appear, C, clamp01, DeepSeekWhale, FONT_MONO, FONT_ZH, MarkerHL, PaperNote, PixelPanel, PixelText, PixelWindow, prog, PX, QwenMark, SceneTitle, Script,
  Src, SRC_BLOG, Sprite, Stamp, Tape, TornSheet, useBeats, usePopIn, Zh,
} from './common';

// ------------------------------------------------------------------ draw_particles
const ASM: [string, string, string][] = [
  ['11d0', 'ldrb', 'w4, [x19]'],
  ['11d4', 'cbz', 'w4, 11c4'],
  ['11d8', 'ldrsh', 'w1, [x23, x19, lsl #1]'],
  ['11dc', 'asr', 'w1, w1, #4'],
  ['11ec', 'cmp', 'w4, #0xc'],
  ['11f0', 'b.ls', '11bc'],
];

export const Particles: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const fails = b[1] > 0 && b[8] < 0;
  const hl = (m: string) => (m === 'cmp' && b[4] > 0) || (m === 'b.ls' && b[4] > 0);
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题二 · 一个例子">draw_particles 为什么一直写不对</SceneTitle>
      {/* disassembly */}
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.92)}}>
        <PixelWindow w={820} h={430} title="disasm(draw_particles)" tag="AArch64">
          {ASM.map(([a, m, o]) => (
            <div key={a} style={{display: 'flex', gap: 24, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, lineHeight: '42px', background: hl(m) ? '#FFF1C2' : 'transparent', ...appear(b[3], 0)}}>
              <span style={{color: PX.dim, width: 80}}>{a}</span>
              <span style={{color: hl(m) ? PX.red : PX.blue, width: 100}}>{m}</span>
              <span style={{color: PX.ink}}>{o}</span>
            </div>
          ))}
        </PixelWindow>
        <div style={{marginTop: 10, opacity: prog(b[3], 12)}}>
          <PixelText size={24} color={PX.dim}>指令行取自原文配图的同一函数</PixelText>
        </div>
      </div>
      {/* attempts */}
      <div style={{position: 'absolute', left: 84, top: 760, display: 'flex', gap: 14, ...appear(b[1], 0)}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const on = b[1] > i * 12;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, opacity: on ? 1 : 0.15}}>
              <QwenMark size={40} />
              <Sprite name="cross" px={4} />
            </div>
          );
        })}
        <div style={{alignSelf: 'center', opacity: fails ? 1 : 0.4}}>
          <PixelText size={24} color={PX.red}>diff_test：不一致</PixelText>
        </div>
      </div>
      {/* meaning */}
      <div style={{position: 'absolute', left: 960, top: 250, width: 880, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={appear(b[2], 0)}>
          <PixelPanel w={880} h={110}>
            <PixelText size={36}>结构看着对，问题在读指令</PixelText>
          </PixelPanel>
        </div>
        <div style={{display: 'flex', gap: 18}}>
          <div style={pop(b[5], 0, 0.8)}>
            <PixelPanel w={430} h={190} bg="#E9F8EF" border={PX.green}>
              <PixelText size={24} color={PX.dim}>b.ls 的真实含义</PixelText>
              <div>
                <PixelText size={48} color={PX.green}>x ≤ 12</PixelText>
              </div>
              <PixelText size={24}>无符号「小于或等于」</PixelText>
            </PixelPanel>
          </div>
          <div style={pop(b[6], 0, 0.8)}>
            <PixelPanel w={430} h={190} bg="#FFF1F3" border={PX.red}>
              <PixelText size={24} color={PX.dim}>工人写成</PixelText>
              <div>
                <PixelText size={48} color={PX.red}>x &lt; 12</PixelText>
              </div>
              <PixelText size={24}>普通的有符号小于</PixelText>
            </PixelPanel>
          </div>
        </div>
        <div style={appear(b[7], 0)}>
          <PixelText size={24} color={PX.red}>边界差一个 → 每次提交都失败（12 是 cmp w4, #0xc 里的常量）</PixelText>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, ...pop(b[8], 0, 0.85)}}>
          <PixelPanel w={880} h={200} bg="#EEF1FF" border="#4D6BFE">
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <DeepSeekWhale size={56} bob={false} />
              <PixelText size={36}>主管：好几个工人犯同一个错</PixelText>
            </div>
            <div style={{marginTop: 8, opacity: prog(b[9], 12)}}>
              <PixelText size={36} color="#4D6BFE">不接手 → 改工人的系统提示词</PixelText>
            </div>
            <div style={{opacity: prog(b[10], 12)}}>
              <PixelText size={24} color={PX.green}>之后工人自己完成（正文说法）</PixelText>
            </div>
          </PixelPanel>
        </div>
      </div>
      <Src style={{position: 'absolute', left: 960, bottom: 150, opacity: prog(frame, 12, 20)}}>来源：HF 社区博文 2026-10-26 · Problem 2</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ prompt v0 → v1
const V1: {n: number; zh: string; en: string}[] = [
  {n: 1, zh: '去 layout.py 查每个状态字段的偏移，直接按字节索引', en: 'Read port/layout.py for the offset of every state field …'},
  {n: 2, zh: '只调用 map.json 里有的函数，不许编函数名', en: "Never invent helper names like star_x/star_y."},
  {n: 3, zh: '提交恰好一个函数，参数照登记的签名', en: 'exactly one function def <name>(s, ...) …'},
  {n: 4, zh: '照提示字面写；b.hi / b.ls 是无符号比较', en: 'AArch64 traps: b.hi/b.ls compare UNSIGNED'},
  {n: 5, zh: '只错一两个像素：先查有无符号或循环边界差一', en: 'suspect a signedness or off-by-one in a loop bound'},
];

export const PromptV1: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题二 · 主管改提示词">工人提示词 v0 → v1</SceneTitle>
      {/* v0 */}
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.9)}}>
        <TornSheet w={620} h={560} seed={3} rotate={-1.2}>
          <Tape w={110} rotate={-6} style={{left: 250, top: -16}} />
          <Zh size={30} w={900}>v0 · 原始提示词</Zh>
          <div style={{fontFamily: FONT_MONO, fontWeight: 600, fontSize: 21, color: C.ink, lineHeight: 1.55, marginTop: 14}}>
            You are a worker on a reverse-engineering team. <MarkerHL p={prog(b[1], 18, 10)}>Rebuild exactly one function in Python until it passes 100% on the held-out cases.</MarkerHL> Read its disassembly, <MarkerHL p={prog(b[2], 18)}>submit a first version early</MarkerHL> with the submit tool, read the mismatches, fix, submit again. Keep edits small. If the map entry looks wrong, tell the lead with map_note.
          </div>
        </TornSheet>
      </div>
      {/* v1 additions */}
      <div style={{position: 'absolute', left: 750, top: 236, width: 1090}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, ...appear(b[3], 0)}}>
          <Stamp p={prog(b[3], 14)} rotate={-6}>v1</Stamp>
          <Zh size={30} w={900}>在 v0 后面加 5 条</Zh>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14}}>
          {V1.map((r) => (
            <div key={r.n} style={{...appear(b[3 + r.n], 0)}}>
              <PaperNote w={1090} color="#FFFDF8" tape={false} style={{padding: "12px 22px"}} rotate={r.n % 2 ? -0.4 : 0.4}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 30, color: '#EE4E8B', width: 32}}>{r.n}</div>
                  <div>
                    <Zh size={28} w={900}>{r.zh}</Zh>
                    <div style={{fontFamily: FONT_MONO, fontSize: 17, fontWeight: 600, color: C.sub}}>{r.en}</div>
                  </div>
                </div>
              </PaperNote>
            </div>
          ))}
        </div>
      </div>
      {/* reason */}
      <div style={{position: 'absolute', left: 84, top: 830, width: 1750, opacity: prog(b[9], 14)}}>
        <Script size={26}>主管写的理由：“Workers repeatedly fail on the same chores: they invent helper function names, ignore signed/unsigned distinctions, and do not use layout.py offsets.”</Script>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ v2
const V2: {tag: string; zh: string; en: string; beat: number}[] = [
  {tag: '1 改', zh: '字段偏移用 lookup 确认，别手算基址 + 偏移', en: 'Confirm an offset with lookup("<offset>") instead of recomputing base-pointer arithmetic by hand', beat: 1},
  {tag: '2 改', zh: '调用前先 lookup，参数个数和顺序照登记的来', en: "Before calling a callee run lookup('callee') and pass exactly the recorded number and order of arguments", beat: 2},
  {tag: '4 改', zh: 'cmp w,#0xc + b.ls = 无符号 x ≤ 12，不是 < 12', en: 'cmp w,#0xc + b.ls means x <= 12 unsigned, not < 12', beat: 3},
  {tag: '6 新', zh: '不要用编出来的签名调用 call_address', en: 'Never use call_address yourself with an invented signature', beat: 4},
];

export const PromptV2: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题二 · 主管改提示词">工人提示词 v2</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 236, width: 1000}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, ...appear(b[0], 0)}}>
          <Stamp p={prog(b[0], 14)} rotate={-6} color="#2C74F0">v2</Stamp>
          <Zh size={30} w={900}>v1 基础上：第 3、5 条不变</Zh>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16}}>
          {V2.map((r, i) => (
            <div key={r.tag} style={appear(b[r.beat], 0)}>
              <PaperNote w={1000} color="#FFFDF8" tape={false} style={{padding: "14px 22px"}} rotate={i % 2 ? 0.4 : -0.4}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 24, color: '#fff', background: r.tag.includes('新') ? '#EE4E8B' : '#2C74F0', borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap'}}>{r.tag}</div>
                  <div>
                    <Zh size={28} w={900}>{r.zh}</Zh>
                    <div style={{fontFamily: FONT_MONO, fontSize: 16, fontWeight: 600, color: C.sub}}>{r.en}</div>
                  </div>
                </div>
              </PaperNote>
            </div>
          ))}
        </div>
      </div>
      {/* reason: three repeated mistakes */}
      <div style={{position: 'absolute', left: 1140, top: 236, ...pop(b[5], 0, 0.9)}}>
        <TornSheet w={700} h={620} seed={7} rotate={1}>
          <Tape w={100} rotate={7} style={{right: -20, top: -16}} />
          <Zh size={28} w={900}>主管写的理由：三种反复出现的错</Zh>
          {[
            {zh: '把 cmp / b.ls 读成 <', ex: 'draw_particles, update_shots'},
            {zh: '调用时参数个数不对', ex: 'update_ufo / boxes_overlap TypeErrors'},
            {zh: '手算字段偏移', ex: '593 vs 625，581 vs 565'},
          ].map((m, i) => (
            <div key={m.zh} style={{marginTop: 22, ...appear(b[6], i * 10)}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{width: 34, height: 34, borderRadius: 17, background: '#E5484D', color: '#fff', fontFamily: FONT_ZH, fontWeight: 900, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
                <Zh size={30} w={900}>{m.zh}</Zh>
              </div>
              <div style={{fontFamily: FONT_MONO, fontSize: 21, fontWeight: 700, color: i === 2 && b[7] > 0 ? '#E5484D' : C.sub, marginLeft: 46, marginTop: 4}}>
                {i === 2 ? <MarkerHL p={prog(b[7], 16)}>{m.ex}</MarkerHL> : m.ex}
              </div>
            </div>
          ))}
        </TornSheet>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 150}}>{SRC_BLOG} · System prompt v2（英文为原文摘录）</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ lookup
export const Lookup: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const q1 = 'lookup("593")';
  const q2 = "lookup('put_pixel')";
  const n1 = Math.max(0, Math.min(q1.length, Math.floor((b[3] - 4) / 2)));
  const n2 = Math.max(0, Math.min(q2.length, Math.floor((b[3] - 50) / 2)));
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题二 · 新工具">lookup：主管给工人写的工具</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.9)}}>
        <PixelWindow w={980} h={430} title="worker harness v2" tag="+ lookup">
          <div style={{display: 'flex', alignItems: 'center', gap: 14, ...appear(b[1], 0)}}>
            <DeepSeekWhale size={48} bob={false} />
            <PixelText size={24}>写给</PixelText>
            {[0, 1, 2, 3].map((i) => (
              <QwenMark key={i} size={40} />
            ))}
          </div>
          <div style={{marginTop: 20, ...appear(b[2], 0)}}>
            <PixelText size={36}>团队记过的事，查就行，不用重推</PixelText>
          </div>
          <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, lineHeight: 1.6, marginTop: 20}}>
            <div style={{color: PX.ink}}>
              <span style={{color: PX.dim}}>&gt;&gt;&gt; </span>
              {q1.slice(0, n1)}
            </div>
            <div style={{color: PX.green, opacity: n1 === q1.length ? 1 : 0}}>part_life at 593..625 (593, 'u8', 32)</div>
            <div style={{color: PX.ink, opacity: n2 > 0 ? 1 : 0}}>
              <span style={{color: PX.dim}}>&gt;&gt;&gt; </span>
              {q2.slice(0, n2)}
            </div>
            <div style={{color: PX.green, opacity: n2 === q2.length ? 1 : 0}}>→ 登记的签名、参数范围、用途</div>
          </div>
        </PixelWindow>
        <div style={{marginTop: 10, opacity: prog(b[3], 12)}}>
          <PixelText size={24} color={PX.dim}>查询示例取自原文配图第 7 步</PixelText>
        </div>
      </div>
      {/* figure vs text */}
      <div style={{position: 'absolute', left: 1120, top: 250, width: 720, ...pop(b[4], 0, 0.9)}}>
        <PixelPanel w={720} h={560} bg="#FFF8E1">
          <PixelText size={24} color={PX.dim}>原文配图 · 分步演示</PixelText>
          <div>
            <PixelText size={36}>同一个 draw_particles</PixelText>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18, ...appear(b[5], 0)}}>
            {[
              ['worker-2 卡在 56%', PX.red],
              ['升级给主管', '#4D6BFE'],
              ['主管按 ldrsh（有符号）改对 → 100%', PX.green],
            ].map(([t, c], i) => (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, ...appear(b[5], i * 10)}}>
                <div style={{width: 20, height: 20, background: c, boxShadow: `0 0 0 3px ${PX.ink}`}} />
                <PixelText size={24}>{t}</PixelText>
              </div>
            ))}
          </div>
          <div style={{marginTop: 26, padding: 14, border: `3px dashed ${PX.ink}`, opacity: clamp01(prog(b[6], 14))}}>
            <PixelText size={24} color={PX.red}>正文：主管没接手，改提示词后工人做完</PixelText>
            <div>
              <PixelText size={24} color={PX.red}>配图：升级给主管修好。两处说法不一致</PixelText>
            </div>
          </div>
        </PixelPanel>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Problem 2；原文交互配图「One function through the pipeline」第 3–7 步</Src>
    </AbsoluteFill>
  );
};
