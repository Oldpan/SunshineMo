// Cover: a CLAUDE.md that keeps growing one patch at a time, then the source cards.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Board, Box, Hd, HL, Mo, Note, prog, rise, Sk, roughOpts, usePopIn, W, Zh} from './common';

const BASE = ['# 项目说明', '- 用 uv 管 Python 依赖', '- 测试：uv run pytest'];
const PATCHES = [
  {text: '- 必须测试！！', beat: 1},
  {text: '- 只做最小修改', beat: 2},
  {text: '- 认真思考，全面检查', beat: 3},
  {text: '- 改完反复确认三遍', beat: 3},
  {text: '- 不要乱加注释', beat: 3},
  {text: '- 必须写 docstring', beat: 3},
  {text: '- 先列计划再动手', beat: 3},
  {text: '- 别用 subagent / 多用 subagent', beat: 3},
];

export const Cover: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const lineH = 50;
  // patches that are in: stagger the ones that share beat 3
  const shown = PATCHES.map((pt, i) => {
    const same = PATCHES.filter((q, j) => q.beat === pt.beat && j < i).length;
    return b[pt.beat] - same * 9;
  });
  const total = BASE.length + shown.filter((f) => f > 0).length;
  const scroll = Math.max(0, total - 9) * lineH;
  const scrollAnim = scroll > 0 ? Math.min(scroll, (b[3] > 0 ? prog(b[3], 70) : 0) * scroll) : 0;
  const thumb = 1 - Math.min(0.62, (total - 3) * 0.075);
  return (
    <Board>
      {/* left: the editor */}
      <Box x={110} y={120} w={820} h={640} p={prog(frame, 26)} seed={2} pad={0}>
        <div style={{height: 56, borderBottom: `3px solid ${W.ink}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14}}>
          <Mo size={26} w={700}>
            CLAUDE.md
          </Mo>
          <Zh size={20} color={W.faint}>
            {total} 行
          </Zh>
        </div>
        <div style={{position: 'absolute', left: 30, top: 74, right: 50, bottom: 20, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scrollAnim}px)`}}>
            {BASE.map((t, i) => (
              <div key={t} style={{height: lineH, ...rise(frame, 8 + i * 5)}}>
                <Mo size={27} color={i === 0 ? W.clay : W.ink}>
                  {t}
                </Mo>
              </div>
            ))}
            {PATCHES.map((pt, i) =>
              shown[i] > 0 ? (
                <div key={i} style={{height: lineH, ...rise(shown[i], 0, 16)}}>
                  <Mo size={27}>
                    <HL p={prog(shown[i], 14, 4)} color={i < 2 ? W.peach : W.yellow}>
                      {pt.text}
                    </HL>
                  </Mo>
                </div>
              ) : null,
            )}
          </div>
        </div>
        {/* scrollbar: thumb shrinks as the file grows */}
        <div style={{position: 'absolute', right: 16, top: 76, width: 12, height: 540, borderRadius: 6, background: W.grid}}>
          <div style={{position: 'absolute', left: 0, top: (1 - thumb) * 540 * (scroll > 0 ? 1 : 0), width: 12, height: thumb * 540, borderRadius: 6, background: W.dim}} />
        </div>
      </Box>
      <Note x={720} y={370} p={prog(b[3], 20, 30)} rot={-8} size={64}>
        ？？？
      </Note>
      <Note x={560} y={790} p={prog(b[3], 30, 50)} rot={-2} size={32}>
        哪条还有用？说不清了
      </Note>

      {/* right: title */}
      <div style={{position: 'absolute', left: 1020, top: 150, width: 820}}>
        <div style={rise(frame, 6, 30)}>
          <Hd size={92} style={{display: 'block', lineHeight: 1.12}}>
            怎么别让
          </Hd>
          <Hd size={92} style={{display: 'block', lineHeight: 1.12}}>
            <HL p={prog(frame, 26, 22)}>Claude Code</HL>
          </Hd>
          <Hd size={92} color={W.clay} style={{display: 'block', lineHeight: 1.12}}>
            越用越蠢
          </Hd>
        </div>
        <div style={{marginTop: 22, ...rise(frame, 18)}}>
          <Hd size={38} color={W.dim} w={500}>
            提示词还是很重要，需要大减负
          </Hd>
        </div>
      </div>
      <Sk x={1020} y={545} w={720} h={20} p={prog(frame, 24, 30)} draw={(g) => [g.line(0, 10, 700, 6, roughOpts({sw: 3, seed: 12}))]} />

      {/* source cards */}
      <div style={{position: 'absolute', left: 1030, top: 600, ...pop(b[4], 0)}}>
        <Box x={0} y={0} w={330} h={150} p={prog(b[4], 22)} seed={4} bg={W.yellow} pad="20px 24px">
          <Zh size={22} color={W.dim}>
            这期讲的文章
          </Zh>
          <Hd size={34} style={{display: 'block', marginTop: 6}}>
            老潘 · 整理文章
          </Hd>
        </Box>
      </div>
      <div style={{position: 'absolute', left: 1400, top: 600, ...pop(b[4], 12)}}>
        <Box x={0} y={0} w={420} h={150} p={prog(b[4], 22, 12)} seed={5} pad="20px 24px">
          <Zh size={22} color={W.dim}>
            主线 · Addy Osmani（X 长文）
          </Zh>
          <Mo size={22} w={600} style={{display: 'block', marginTop: 8, whiteSpace: 'normal', lineHeight: 1.35}}>
            You're probably overprompting Claude
          </Mo>
        </Box>
      </div>
      <Note x={1400} y={772} p={prog(b[5], 26, 6)} rot={-2} size={28} color={W.blue}>
        Addy 在 Anthropic 主导 Claude Code
      </Note>
    </Board>
  );
};
