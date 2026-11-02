// Section 6: cloud sessions (figure 6) and Projects threads (figure 7).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Arrow, Board, Box, Cross, Hd, Head, HL, Mo, Note, Pill, prog, Src, Stamp, Tick, usePopIn, W, Zh} from './common';

export const Cloud: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const LOCAL = [
    {t: '已 commit 并 push 的代码', ok: true},
    {t: '未 push 的 commit', ok: false},
    {t: '工作区未提交的改动', ok: false},
    {t: '~/.claude 用户级配置', ok: false},
    {t: '本地 GPU、数据库、内网服务', ok: false},
  ];
  const lit = (i: number) => (i === 0 ? b[3] : i === 3 ? b[4] : b[3] + 20 + i * 8);
  return (
    <Board>
      <Head num="6.1" title="cloud session 有自己的机器" />
      <Note x={980} y={70} p={prog(b[1], 20)} size={28} rot={-2} w={840}>
        缺源码、依赖或测试数据，任务拆得再清楚也推不动
      </Note>
      {/* local */}
      <Box x={100} y={170} w={600} h={520} p={prog(b[0], 20, 6)} seed={260} pad="20px 26px">
        <Hd size={34}>你的电脑</Hd>
        {LOCAL.map((l, i) => (
          <div key={l.t} style={{position: 'relative', marginTop: 16, paddingLeft: 50}}>
            {l.ok ? <Tick x={0} y={2} p={prog(lit(i), 10)} s={32} /> : <Cross x={2} y={4} p={prog(lit(i), 10)} s={28} />}
            <Zh size={25} color={!l.ok && lit(i) > 0 ? W.dim : W.ink}>
              {l.t}
            </Zh>
          </div>
        ))}
      </Box>
      {/* github */}
      <Arrow pts={[[710, 290], [800, 290]]} p={prog(b[3], 14)} />
      <Note x={720} y={240} p={prog(b[3], 14)} size={24} rot={0}>
        push
      </Note>
      <Box x={810} y={210} w={300} h={260} p={prog(b[3], 18, 6)} seed={261} bg={W.card} pad="20px 24px">
        <Hd size={34}>GitHub</Hd>
        <Mo size={21} style={{display: 'block', marginTop: 10}}>
          当前分支
        </Mo>
        <Mo size={21} style={{display: 'block'}}>
          claude/ 工作分支
        </Mo>
        <Mo size={21} style={{display: 'block'}}>
          PR
        </Mo>
      </Box>
      <Arrow pts={[[1120, 290], [1210, 290]]} p={prog(b[3], 14, 16)} />
      <Note x={1124} y={240} p={prog(b[3], 14, 16)} size={24} rot={0}>
        clone
      </Note>
      {/* VM */}
      <Box x={1220} y={170} w={600} h={520} p={prog(b[2], 20)} seed={262} bg={W.yellow} pad="20px 26px">
        <Hd size={34}>云端 VM（每个任务一台）</Hd>
        <Hd size={40} color={W.clay} style={{display: 'block', marginTop: 8}}>
          4 vCPU · 16 GB · 30 GB
        </Hd>
        <Zh size={24} style={{display: 'block', marginTop: 10}}>
          clone 到新的 claude/ 分支，只能 push 自己的工作分支
        </Zh>
        <div style={{marginTop: 14, opacity: prog(b[4], 12)}}>
          <Zh size={24}>带过去：仓库里的 CLAUDE.md、rules、skills、agents、commands</Zh>
        </div>
        <div style={{marginTop: 10, opacity: prog(b[5], 12)}}>
          <Hd size={28} color={W.red}>
            空闲会被回收，重开是新 VM，没 commit 的会丢
          </Hd>
        </div>
      </Box>
      <Stamp x={260} y={740} f={b[3] + 50} size={32}>
        没 push 的、只在本机的，云端看不到
      </Stamp>
      <Src>据原文图 6 重绘 · 依据 Addy Osmani《Claude Code in the cloud》（2026-10-06）；无 GitHub remote 时改为上传仓库 bundle</Src>
    </Board>
  );
};

export const Projects: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const LOAD = ['项目指令（最多 16000 字符）', '项目 memory（启动读 MEMORY.md 索引）', '仓库根目录 CLAUDE.md 和 .claude/rules/', 'claude.ai 账号上的 connectors（MCP）', '项目 cloud 环境的网络、变量、凭据'];
  const NOT = ['子目录里的 CLAUDE.md', '按路径限定的 rules', '仓库里的 skills', '.mcp.json 里的 MCP server', '.claude/settings.json 的权限规则', '.claude/settings.json 的 hooks'];
  return (
    <Board>
      <Head num="6.2" title="Projects 的云端 thread 拿到哪些配置" />
      {/* main model + threads */}
      <div style={{position: 'absolute', left: 110, top: 160, ...pop(b[0], 0)}}>
        <Pill bg={W.yellow} size={28}>
          主模型：拆任务、调度
        </Pill>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: 500 + i * 420, top: 160, ...pop(b[0], 14 + i * 8)}}>
          <Pill size={24}>thread {i + 1}</Pill>
          <div style={{opacity: prog(b[1], 12, i * 6)}}>
            <Mo size={20} color={W.dim}>
              cloud session · 自己的分支
            </Mo>
          </div>
        </div>
      ))}
      <Box x={110} y={290} w={820} h={480} p={prog(b[2], 20)} seed={270} pad="20px 26px">
        <Hd size={34} color={W.green}>
          会加载
        </Hd>
        {LOAD.map((t, i) => (
          <div key={t} style={{position: 'relative', marginTop: 14, paddingLeft: 50, opacity: prog(b[2], 10, 12 + i * 8)}}>
            <Tick x={0} y={2} p={prog(b[2], 10, 14 + i * 8)} s={30} />
            <Zh size={25}>{t}</Zh>
          </div>
        ))}
      </Box>
      <Box x={990} y={290} w={830} h={480} p={prog(b[3], 20)} seed={271} pad="20px 26px">
        <Hd size={34} color={W.red}>
          不会加载
        </Hd>
        {NOT.map((t, i) => (
          <div key={t} style={{position: 'relative', marginTop: 12, paddingLeft: 50, opacity: prog(b[3], 10, 10 + i * 8)}}>
            <Cross x={2} y={4} p={prog(b[3], 10, 12 + i * 8)} s={26} />
            <Zh size={25}>{t}</Zh>
          </div>
        ))}
      </Box>
      <div style={{position: 'absolute', left: 110, top: 800, opacity: prog(b[4], 12)}}>
        <Hd size={30}>
          所有 thread 都要守的底线 → <HL p={prog(b[4], 18, 10)}>Project 指令 / Project Memory</HL>
        </Hd>
      </div>
      <Note x={1180} y={800} p={prog(b[5], 20)} size={26} rot={-2} w={640} color={W.blue}>
        要用本机 MCP、hooks、权限：Remote Control 跑在自己电脑上
      </Note>
      <Src>据原文图 7 重绘 · 依据 Claude Code Projects 文档（2026-10，beta）</Src>
    </Board>
  );
};
