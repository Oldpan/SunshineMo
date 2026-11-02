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

// ------------------------------------------------------------------ thesis
export const Thesis: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const steps = ['第 1 步：先打开 a.py', '第 2 步：再改 b.py', '第 3 步：然后跑 lint', '第 4 步：最后……'];
  return (
    <Board>
      <div style={{position: 'absolute', left: 120, top: 90, ...rise(frame, 0)}}>
        <Hd size={44}>
          到了 <HL p={prog(frame, 20, 10)}>Opus 5.5</HL>，模型自己会规划、会拆步骤
        </Hd>
      </div>
      {/* left: hard-coded steps */}
      <Box x={120} y={200} w={700} h={330} p={prog(b[0], 22, 10)} seed={101} pad="22px 30px">
        <Zh size={22} color={W.dim}>
          Prompt 里一步步写死执行过程
        </Zh>
        {steps.map((s, i) => (
          <div key={s} style={{marginTop: 12, opacity: prog(b[0], 10, 22 + i * 7)}}>
            <Mo size={26}>{s}</Mo>
          </div>
        ))}
      </Box>
      <Sk x={120} y={200} w={700} h={330} p={prog(b[1], 18)} draw={(g) => [g.line(30, 300, 670, 40, roughOpts({stroke: W.red, sw: 7, seed: 102}))]} />
      {/* right: scope + acceptance */}
      <Sk x={840} y={340} w={160} h={40} p={prog(b[1], 16, 8)} draw={(g) => [g.line(0, 20, 150, 20, roughOpts({sw: 5, seed: 103})), g.linearPath([[126, 2], [150, 20], [126, 38]], roughOpts({sw: 5, seed: 104}))]} />
      <Box x={1030} y={220} w={760} h={290} p={prog(b[1], 22, 14)} seed={105} bg={W.yellow} pad="26px 34px">
        <Hd size={30} color={W.dim} w={500}>
          工程精力往前挪
        </Hd>
        <Hd size={56} style={{display: 'block', marginTop: 14}}>
          划定范围
        </Hd>
        <Hd size={56} color={W.clay} style={{display: 'block'}}>
          + 明确验收标准
        </Hd>
      </Box>
      {/* prerequisites */}
      <div style={{position: 'absolute', left: 120, top: 590, ...rise(b[2], 0)}}>
        <Hd size={32} color={W.red}>
          前提：
        </Hd>
      </div>
      {['跑得通的自动化验收', '清楚的权限边界', '按需挂载的 skills'].map((t, i) => (
        <div key={t} style={{position: 'absolute', left: 250 + i * 420, top: 580, ...pop(b[2], 8 + i * 10)}}>
          <Box x={0} y={0} w={380} h={90} p={prog(b[2], 18, 8 + i * 10)} seed={106 + i} pad="20px 26px">
            <Hd size={32}>{t}</Hd>
          </Box>
        </div>
      ))}
      {/* vague ask */}
      <div style={{position: 'absolute', left: 260, top: 720, ...pop(b[3], 0)}}>
        <span style={{background: W.card, border: `3px solid ${W.ink}`, borderRadius: 30, padding: '10px 30px', display: 'inline-block'}}>
          <Hd size={36}>“帮我优化下”</Hd>
        </span>
      </div>
      <Note x={680} y={735} p={prog(b[3], 24, 20)} size={34} rot={-2}>
        → 改到什么程度才算完？
      </Note>
    </Board>
  );
};
