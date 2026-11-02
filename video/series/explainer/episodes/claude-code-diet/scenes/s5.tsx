// Section 5: skills vs subagents.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Arrow, Board, Box, Cross, Hd, Head, HL, Item, Mo, Note, Pill, prog, Src, Stamp, Tick, usePopIn, W, Zh} from './common';

export const What: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const fan = [0, 1, 2, 3];
  return (
    <Board>
      <Head num="5" title="skills 和 subagents 分别解决什么" />
      {/* main session */}
      <Box x={110} y={170} w={620} h={360} p={prog(b[0], 20, 6)} seed={240} pad="20px 26px">
        <Hd size={34}>主 Agent 会话</Hd>
        <div style={{display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16}}>
          {['deploy skill', 'review skill', 'api-doc skill'].map((t, i) => (
            <div key={t} style={pop(b[1], 6 + i * 8)}>
              <Pill bg={W.yellow} size={22}>
                {t}
              </Pill>
            </div>
          ))}
        </div>
        <div style={{opacity: prog(b[1], 12, 30)}}>
          <Zh size={22} color={W.dim} style={{display: 'block', marginTop: 12}}>
            skills：特定阶段注入领域知识和流程规范
          </Zh>
        </div>
      </Box>
      {/* subagent */}
      <Arrow pts={[[740, 300], [840, 270], [930, 300]]} p={prog(b[2], 14)} />
      <Note x={760} y={210} p={prog(b[2], 14, 10)} size={24} rot={-2} color={W.blue}>
        一条指令
      </Note>
      <Box x={940} y={170} w={880} h={360} p={prog(b[2], 20, 8)} seed={241} bg={W.paper} dash pad="20px 26px">
        <Hd size={34}>subagent（隔离）</Hd>
        <Zh size={22} color={W.dim} style={{display: 'block', marginTop: 6}}>
          自己的上下文窗口 · System Prompt · 工具权限 · 沙盒；读不到主会话历史
        </Zh>
        <div style={{marginTop: 14, height: 130, overflow: 'hidden', opacity: prog(b[2], 10, 30)}}>
          {Array.from({length: 7}).map((_, k) => (
            <div key={k} style={{transform: `translateY(${-((frame * 0.8) % 30)}px)`}}>
              <Mo size={20} color={W.faint}>
                {['grep -r "TODO" services/', 'tail -n 400 logs/api.log', 'pytest -k retry …', 'cat config/prod.yaml', 'git log -p -- auth/', 'grep -r "TODO" services/', 'tail -n 400 logs/api.log'][k]}
              </Mo>
            </div>
          ))}
        </div>
      </Box>
      <Arrow pts={[[930, 470], [840, 500], [740, 470]]} p={prog(b[2], 14, 40)} color={W.green} />
      <Note x={760} y={510} p={prog(b[2], 14, 50)} size={24} rot={-2} color={W.green}>
        一份结构化摘要
      </Note>
      {/* don't force */}
      <div style={{position: 'absolute', left: 110, top: 600, opacity: prog(b[3], 12)}}>
        <Cross x={0} y={8} p={prog(b[3], 12, 6)} s={40} />
        <Hd size={34} style={{marginLeft: 60}}>“必须使用 subagents”“请派生 subagent 核查”</Hd>
        <Zh size={24} color={W.red} style={{display: 'block', marginLeft: 60, marginTop: 6}}>
          硬加只会让模型过度自查，浪费 token、拖慢响应（Opus 5 提示词指南建议删掉）
        </Zh>
      </div>
      {/* fan out */}
      <div style={{position: 'absolute', left: 110, top: 750, opacity: prog(b[4], 12)}}>
        <Tick x={0} y={6} p={prog(b[4], 12, 6)} s={40} />
        <Hd size={34} style={{marginLeft: 60}}>
          相互独立的大活：<HL p={prog(b[4], 18, 12)}>跨模块审计、多工程迁移、大批 Review</HL> → 并行 subagents
        </Hd>
      </div>
      {fan.map((k) => (
        <div key={k} style={{position: 'absolute', left: 1560 + (k % 2) * 120, top: 600 + Math.floor(k / 2) * 80, ...pop(b[4], 20 + k * 6)}}>
          <Pill size={20} bg={W.card}>
            sub {k + 1}
          </Pill>
        </div>
      ))}
      <Src>依据 Claude Code sub-agents 文档、Opus 5 提示词指南、Opus 5.5 playbook；终端内容为示意</Src>
    </Board>
  );
};

const SCN = [
  ['修改单个函数并补齐单元测试', '主 Agent 单会话'],
  ['按仓库规范生成 API 文档', '主 Agent 挂载 Skill'],
  ['排查多个独立微服务的同类漏洞', '按服务并行派 subagents'],
  ['检索海量日志并提炼根因', 'subagent 排查并回传证据'],
  ['对生成的 Diff 做独立安全审计', '另起会话 / 独立 Reviewer'],
];
export const Cost: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  return (
    <Board>
      <Head num="5" title="拆不拆，看能不能独立验收" />
      <Box x={110} y={160} w={1060} h={520} p={prog(b[0], 20)} seed={250} pad={0}>
        {SCN.map(([k, v], i) => {
          const f = i < 2 ? b[0] - 10 - i * 12 : b[1] - (i - 2) * 12;
          return (
            <div key={k} style={{position: 'absolute', left: 0, top: i * 104, width: 1060, height: 104, borderTop: i ? `2.5px dashed ${W.faint}` : undefined, display: 'flex', alignItems: 'center', opacity: 0.25 + 0.75 * prog(f, 12)}}>
              <div style={{width: 560, paddingLeft: 30}}>
                <Zh size={26}>{k}</Zh>
              </div>
              <Hd size={30} color={i < 2 ? W.clay : W.blue}>
                → {v}
              </Hd>
            </div>
          );
        })}
      </Box>
      <Note x={1220} y={180} p={prog(b[0], 18, 10)} size={28} rot={-2} w={600}>
        交互多、依赖上下文、怕延迟 → 主会话
      </Note>
      <Note x={1220} y={300} p={prog(b[1], 18, 10)} size={28} rot={-2} w={600} color={W.blue}>
        输出长、要限权限、只交结论 → subagent
      </Note>
      <div style={{position: 'absolute', left: 1220, top: 420, ...pop(b[2], 0)}}>
        <Box x={0} y={0} w={600} h={270} p={prog(b[2], 18)} seed={251} bg={W.yellow} pad="18px 26px">
          <Zh size={24}>每次调用单独计费，和主会话共用总用量</Zh>
          <Hd size={36} style={{display: 'block', marginTop: 10}}>
            最多 3 层嵌套
          </Hd>
          <Hd size={36} style={{display: 'block'}}>
            单次最多 20 个并行
          </Hd>
          <Zh size={22} color={W.dim} style={{display: 'block', marginTop: 8}}>
            内置 Explore / Plan 只读，不加载 CLAUDE.md
          </Zh>
        </Box>
      </div>
      <div style={{position: 'absolute', left: 110, top: 720, opacity: prog(b[3], 12)}}>
        <Hd size={32}>
          交得回 <HL p={prog(b[3], 18, 8)}>影响范围 · 代码位置 · 复现证据</HL>，主 Agent 才能审
        </Hd>
      </div>
      <div style={{position: 'absolute', left: 110, top: 790, opacity: prog(b[4], 12)}}>
        <Cross x={0} y={4} p={prog(b[4], 12, 6)} s={36} />
        <Hd size={32} color={W.red} style={{marginLeft: 56}}>
          “看起来没问题” × N 个 Agent ≠ 更可靠
        </Hd>
      </div>
      <Note x={1230} y={716} p={prog(b[2], 18, 30)} size={26} rot={-2} w={600}>
        基线场景：单 Agent + Skill 通常更快更省
      </Note>
      <Src>原文表格；依据 Claude Code sub-agents 文档</Src>
    </Board>
  );
};
