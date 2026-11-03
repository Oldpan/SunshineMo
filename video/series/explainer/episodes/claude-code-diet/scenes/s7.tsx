// Section 7: review after the work is done; summary and outro.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Arrow, Board, Box, Cross, Hd, Head, HL, Illus, Item, Mo, Note, Pill, prog, rise, Src, Stamp, Strike, Term, Tick, usePopIn, W, Zh} from './common';

export const Review: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const pct = Math.round(interpolate(prog(b[3], 40, 10), [0, 1], [16, 54]));
  return (
    <Board>
      <Head num="7" title="完成后仍然要审查" />
      <div style={{position: 'absolute', left: 110, top: 170, ...pop(b[1], 0)}}>
        <Box x={0} y={0} w={520} h={200} p={prog(b[1], 18)} seed={280} bg={W.yellow} pad="20px 28px">
          <Zh size={24}>Claude Code 自身的代码</Zh>
          <Hd size={70} color={W.clay} style={{display: 'block'}}>
            约 90%
          </Hd>
          <Zh size={24}>由 Claude 写</Zh>
        </Box>
      </div>
      {/* multi-agent review */}
      <Box x={700} y={170} w={1120} h={260} p={prog(b[2], 18)} seed={281} pad="20px 28px">
        <Hd size={30}>每个 PR 的多 Agent 审查</Hd>
        <div style={{display: 'flex', gap: 14, marginTop: 18, alignItems: 'center'}}>
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={pop(b[2], 10 + k * 6)}>
              <Pill size={22}>{k < 3 ? `扫缺陷 ${k + 1}` : '…× N'}</Pill>
            </div>
          ))}
          <Mo size={30} style={{opacity: prog(b[2], 10, 40)}}>
            →
          </Mo>
          <div style={pop(b[2], 44)}>
            <Pill size={22} bg={W.peach}>
              独立评审 Agent 投票
            </Pill>
          </div>
        </div>
        <Zh size={23} color={W.dim} style={{display: 'block', marginTop: 16, opacity: prog(b[2], 10, 50)}}>
          无关痛痒的风格问题直接过滤 · 本地可用 /code-review、/security-review
        </Zh>
      </Box>
      <div style={{position: 'absolute', left: 110, top: 480, opacity: prog(b[3], 12)}}>
        <Zh size={28}>能提出实质性审查意见的内部 PR 比例</Zh>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 30, marginTop: 10}}>
          <div style={{width: 1000, height: 70, border: `3px solid ${W.ink}`, borderRadius: 10, position: 'relative', background: W.card}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: W.clay, borderRadius: 7}} />
            <div style={{position: 'absolute', left: '16%', top: -10, bottom: -10, borderLeft: `3px dashed ${W.ink}`}} />
          </div>
          <Hd size={80} color={W.clay}>
            {pct}%
          </Hd>
        </div>
        <Zh size={22} color={W.dim}>
          上线前 16% → 上线后 54%（Claude Code 团队披露）
        </Zh>
      </div>
      <Stamp x={110} y={740} f={b[4]} size={32}>
        计费逻辑 · 自动更新 · CI/CD Workflow：资深工程师逐行把关
      </Stamp>
      <Src>依据 Qing Wang、Addy Osmani 等《How the Claude Code team does code review》（2026-10-15）</Src>
    </Board>
  );
};

const RP: [string, number][] = [
  ['根据这份 spec 审查最终 diff。', 1],
  ['重点检查行为兼容、异常路径、并发、数据安全和测试覆盖。', 1],
  ['', 1],
  ['把发现的问题全部列出来，按严重度排序，由我来决定改哪些。', 1],
  ['每个问题给出代码位置、触发条件、影响和可验证的证据。', 2],
  ['区分已证实的问题与需要进一步验证的疑点。', 2],
  ['没有证据的风格偏好，不作为 bug。', 2],
  ['', 3],
  ['本轮只报告，不修改文件、不提交、不发布。', 3],
];
export const ReviewPrompt: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const startOf = (i: number) => {
    const bt = RP[i][1];
    const k = RP.slice(0, i).filter((l) => l[1] === bt).length;
    return b[bt] - k * 14;
  };
  return (
    <Board>
      <Head num="7" title="另起一个全新的审查会话" />
      <div style={{position: 'absolute', left: 110, top: 160, display: 'flex', gap: 16, alignItems: 'center'}}>
        <div style={pop(b[0], 0)}>
          <Pill bg={W.yellow}>最初的 spec</Pill>
        </div>
        <div style={pop(b[0], 8)}>
          <Pill bg={W.yellow}>最终 diff</Pill>
        </div>
        <Mo size={30} style={{opacity: prog(b[0], 10, 16)}}>
          →
        </Mo>
        <div style={pop(b[0], 22)}>
          <Pill bg={W.peach}>全新审查会话（跨上下文独立验收）</Pill>
        </div>
      </div>
      <Box x={110} y={240} w={1240} h={480} p={prog(b[1], 18)} seed={290} bg={W.term} pad="24px 32px">
        {RP.map(([t], i) => (
          <div key={i} style={{background: i === 3 ? `rgba(217,119,79,${0.35 * prog(b[2], 12)})` : undefined, borderRadius: 6}}>
            <Typed t={t} f={startOf(i)} hot={i === 8} />
          </div>
        ))}
      </Box>
      <Note x={1380} y={300} p={prog(b[2], 18)} size={28} rot={-2} w={440}>
        全部列出、由人筛：只让它报高严重度，模型往往会按字面执行，少报漏报
      </Note>
      <Note x={1380} y={560} p={prog(b[3], 18, 20)} size={28} rot={-2} w={440} color={W.blue}>
        只报告，不改、不提交、不发布
      </Note>
      <Stamp x={130} y={765} f={b[4]} size={30}>
        生产发布、数据迁移、核心公共 API：原有审批一步不省
      </Stamp>
      <Src>原文审查 Prompt 模板；依据 Opus 5 提示词指南</Src>
    </Board>
  );
};
const Typed: React.FC<{t: string; f: number; hot?: boolean}> = ({t, f, hot}) => {
  const n = f < 0 ? 0 : Math.min(t.length, Math.floor((f / 30) * 60));
  return (
    <div style={{minHeight: 38}}>
      <Mo size={25} color={hot ? '#F0A08E' : W.termInk}>
        {t.slice(0, n)}
      </Mo>
    </div>
  );
};

export const Summary: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  // only the "think harder / check again" style lines go; scope and test rules stay (as the article says)
  const LINES: [string, boolean][] = [
    ['- 只做最小修改', false],
    ['- 认真思考，全面检查', true],
    ['- 改完反复确认三遍', true],
    ['- 请深入思考', true],
    ['- 请派生 subagent 核查', true],
  ];
  return (
    <Board>
      <div style={{position: 'absolute', left: 110, top: 70, ...rise(frame, 0)}}>
        <Hd size={52}>
          两件事：<HL p={prog(b[0], 20, 10)}>立好验收标准</HL> · <HL p={prog(b[0], 20, 30)} color={W.yellow}>给旧规则瘦身</HL>
        </Hd>
      </div>
      <Box x={110} y={190} w={800} h={640} p={prog(frame, 22)} seed={300} pad={0}>
        <div style={{height: 54, borderBottom: `3px solid ${W.ink}`, display: 'flex', alignItems: 'center', padding: '0 24px'}}>
          <Mo size={24} w={700}>
            CLAUDE.md
          </Mo>
        </div>
        <div style={{padding: '18px 28px'}}>
          {LINES.map(([t, cut], i) => (
            <div key={t} style={{marginTop: 12}}>
              {cut ? (
                <Strike p={prog(b[1], 12, i * 8)} w={t.length * 26}>
                  <Mo size={30}>{t}</Mo>
                </Strike>
              ) : (
                <Mo size={30}>{t}</Mo>
              )}
            </div>
          ))}
          {['## 完成条件', '- uv run pytest -q tests/api 通过', '## 继续还是停下', '- 被阻塞或要删数据时才问'].map((t, i) => (
            <div key={t} style={{marginTop: 12, ...rise(b[1], 40 + i * 8)}}>
              <Mo size={30} color={t.startsWith('#') ? W.clay : W.ink}>
                {t}
              </Mo>
            </div>
          ))}
        </div>
      </Box>
      <Illus x={780} y={204} />
      {[
        ['目标 · 边界 · 验证方式交代清楚', 1],
        ['Opus 5.5 从 medium 起步', 2],
        ['难题再加档、挂 subagent', 2],
        ['“怎么算做完”一开始就定好', 3],
      ].map(([t, bt], i) => (
        <div key={t as string} style={{position: 'absolute', left: 980, top: 210 + i * 160, ...pop(b[bt as number], 10 + (i === 2 ? 14 : 0))}}>
          <Box x={0} y={0} w={830} h={124} p={prog(b[bt as number], 18, 10 + (i === 2 ? 14 : 0))} seed={301 + i} bg={i === 3 ? W.yellow : W.card} pad="24px 28px">
            <Hd size={42}>{t as string}</Hd>
          </Box>
        </div>
      ))}
    </Board>
  );
};

export const Outro: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  return (
    <Board>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...pop(b[0], 0)}}>
        <Hd size={110}>
          我是<HL p={prog(b[0], 20, 10)}>老潘</HL>
        </Hd>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', ...rise(b[0], 16)}}>
        <Hd size={60} color={W.clay}>
          欢迎关注 · oldpan博客
        </Hd>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', opacity: prog(frame, 20, 30)}}>
        <Zh size={26} color={W.dim}>
          本期整理自老潘的文章《怎么别让 Claude Code 越用越蠢？提示词还是很重要，需要大减负》
        </Zh>
      </div>
    </Board>
  );
};
