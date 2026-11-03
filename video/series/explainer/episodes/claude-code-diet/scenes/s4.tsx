// Section 4: Claude Code's own System Prompt cut by 80%+, and the three things that were cleaned up.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Arrow, Board, Box, Cross, Hd, Head, HL, Item, Mo, Note, Pill, prog, rise, Src, Stamp, Strike, Term, Tick, usePopIn, W, Zh} from './common';

export const Eighty: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const cut = prog(b[1], 40, 6);
  const barW = interpolate(cut, [0, 1], [1100, 200]);
  const up = prog(b[3], 24); // bar block moves up to make room for the three cards
  const topY = interpolate(up, [0, 1], [230, 140]);
  const scale = interpolate(up, [0, 1], [1, 0.78]);
  return (
    <Board>
      <Head num="4.1" title="那个 80% 到底删了什么" />
      <div style={{position: 'absolute', left: 120, top: topY, transform: `scale(${scale})`, transformOrigin: 'left top', width: 1700}}>
        <Zh size={30} color={W.dim}>
          Claude Code 自己的 System Prompt（针对 Opus 5、Fable 5 等 Claude 5 代模型）
        </Zh>
        <div style={{position: 'relative', marginTop: 20, height: 120}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1100, height: 110, border: `4px dashed ${W.faint}`, borderRadius: 14, opacity: cut}} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: barW,
              height: 110,
              background: `repeating-linear-gradient(-40deg, ${W.clay} 0 14px, #E89A78 14px 28px)`,
              border: `4px solid ${W.ink}`,
              borderRadius: 14,
              boxShadow: `9px 9px 0 ${W.ink}`,
              opacity: prog(b[0], 16, 6),
            }}
          />
          <div style={{position: 'absolute', left: 1140, top: -6, ...pop(b[1], 30)}}>
            <Hd size={110} color={W.red}>
              −80%+
            </Hd>
          </div>
          <div style={{position: 'absolute', left: 1150, top: 120, opacity: prog(b[1], 14, 50)}}>
            <Tick x={0} y={0} p={prog(b[1], 14, 50)} s={44} />
            <Hd size={32} color={W.green} style={{marginLeft: 56, whiteSpace: 'nowrap'}}>
              核心代码基准没掉
            </Hd>
          </div>
        </div>
        <div style={{marginTop: 70, opacity: prog(b[2], 14)}}>
          <Hd size={36} color={W.red}>
            删的是 Claude Code 自己的 System Prompt，
            <HL p={prog(b[2], 20, 20)} color={W.yellow}>
              不是让你照这个比例砍 CLAUDE.md
            </HL>
          </Hd>
        </div>
      </div>

      {/* the three cleanups */}
      {[0, 1, 2].map((i) => (
        <Box key={i} x={100 + i * 580} y={390} w={540} h={410} p={prog(b[3], 22, i * 8)} seed={80 + i} pad="20px 26px">
          <Hd size={32} color={W.clay}>
            {['① 冲突的指令', '② 冗长示例和重复描述', '③ 常驻改成按需加载'][i]}
          </Hd>
        </Box>
      ))}
      {/* ① conflicting directives */}
      <div style={{position: 'absolute', left: 126, top: 460, width: 490, opacity: prog(b[3], 12, 16)}}>
        {[
          ['System Prompt', 'leave documentation as appropriate'],
          ['某个 skill', 'DO NOT add comments'],
          ['用户', '照旧版习惯来'],
        ].map(([who, say], i) => (
          <div key={who} style={{marginTop: 8, ...pop(b[4], i * 8)}}>
            <Zh size={18} color={W.faint}>
              {who}
            </Zh>
            <div>
              <Strike p={prog(b[4], 12, 70)} w={say.length * (i === 2 ? 26 : 13)}>
                <Mo size={21} style={{whiteSpace: 'normal'}}>
                  “{say}”
                </Mo>
              </Strike>
            </div>
          </div>
        ))}
        <div style={{marginTop: 18, ...pop(b[4], 80)}}>
          <Hd size={28} color={W.green}>
            → 看周围代码怎么写就怎么写
          </Hd>
        </div>
      </div>
      {/* ② TodoWrite */}
      <div style={{position: 'absolute', left: 706, top: 465, width: 490, opacity: prog(b[3], 12, 16)}}>
        <Mo size={24} w={700}>
          TodoWrite 用法说明
        </Mo>
        <div style={{position: 'relative', height: 120, marginTop: 10, overflow: 'hidden'}}>
          {Array.from({length: 9}).map((_, k) => (
            <div
              key={k}
              style={{
                height: 9,
                width: `${92 - ((k * 37) % 30)}%`,
                background: W.faint,
                borderRadius: 4,
                marginBottom: interpolate(prog(b[5], 30, 24), [0, 1], [5, -9]),
                opacity: (1 - prog(b[5], 30, 24)) * prog(b[5], 10),
              }}
            />
          ))}
          <div style={{position: 'absolute', right: 0, top: 0, opacity: prog(b[5], 10) * (1 - prog(b[5], 20, 30))}}>
            <Hd size={30} color={W.red}>
              ≈9100 字符
            </Hd>
          </div>
          <div style={{position: 'absolute', left: 0, top: 30, opacity: prog(b[5], 14, 50)}}>
            <Zh size={24}>一句话 +</Zh>
            <div style={{display: 'flex', gap: 8, marginTop: 6}}>
              {['pending', 'in_progress', 'completed'].map((s) => (
                <span key={s} style={{border: `2.5px solid ${W.ink}`, borderRadius: 18, padding: '0 10px'}}>
                  <Mo size={18}>{s}</Mo>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{opacity: prog(b[5], 14, 70)}}>
          <Hd size={25} color={W.green}>
            硬规则：同一时刻只有一个 in_progress
          </Hd>
        </div>
      </div>
      {/* ③ on demand */}
      <div style={{position: 'absolute', left: 1286, top: 465, width: 500, opacity: prog(b[3], 12, 16)}}>
        {['验证流程 → skill', 'Code Review → skill', '不常用工具 → 延迟加载'].map((t, i) => (
          <div key={t} style={{marginTop: 12, ...pop(b[6], i * 10)}}>
            <span style={{background: i < 2 ? W.yellow : W.peach, border: `3px solid ${W.ink}`, borderRadius: 10, padding: '4px 14px', display: 'inline-block'}}>
              <Zh size={24} w={600}>
                {t}
              </Zh>
            </span>
          </div>
        ))}
        <div style={{marginTop: 18, opacity: prog(b[6], 14, 40)}}>
          <Mo size={21} color={W.dim}>
            用之前先 ToolSearch 拉定义
          </Mo>
        </div>
      </div>
      <Note x={1300} y={820} p={prog(b[6], 20, 60)} rot={-2} size={26} color={W.blue}>
        能力没丢，每轮少塞一大段
      </Note>
      <Src>依据 Thariq Shihipar《The new rules of context engineering for Claude 5 generation models》（2026-07-24），样本量和评测细节未公开</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ /doctor prompt-audit
export const Audit: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  return (
    <Board>
      <Head num="4.2" title="先审查，再决定删什么" />
      <Box x={110} y={160} w={1700} h={110} p={prog(b[0], 18)} seed={200} bg={W.yellow} pad="22px 30px">
        <Hd size={34}>CLAUDE.md：一两句项目定位 + 模型看代码推不出来的反直觉约定和坑（Gotchas）</Hd>
      </Box>
      <Term
        x={110}
        y={320}
        w={1060}
        h={470}
        p={prog(b[1], 18)}
        size={23}
        title="Claude Code ≥ v2.1.283"
        lines={[
          ['> /doctor prompt-audit', b[1] - 14, W.clay],
          ['  过时指令  "think step by step before …"   ← 留给旧模型', b[2], '#F5C66B'],
          ['  失效路径  docs/old-api.md 不存在', b[2] - 14, '#F5C66B'],
          ['  规则冲突  "必须写注释" vs "不要加注释"', b[2] - 28, '#F5C66B'],
          ['  - 第 12–18 行建议删除（diff 预览）', b[2] - 48, '#F0A08E'],
          ['  + 合并成一条：跟周围代码的风格走', b[2] - 60, '#9FD28E'],
          ['  确认后才写盘 [y/N]', b[3], W.faint],
        ]}
      />
      <div style={{position: 'absolute', left: 1230, top: 340, ...pop(b[3], 10)}}>
        <Stamp x={0} y={0} f={b[3] - 10} size={30}>
          确认前不改磁盘
        </Stamp>
      </div>
      <Box x={1210} y={440} w={600} h={350} p={prog(b[4], 18)} seed={201} pad="20px 26px">
        <Hd size={30} color={W.clay}>
          官方原则
        </Hd>
        <Item f={b[4] - 10} size={25}>
          单文件尽量压在 200 行以内
        </Item>
        <Item f={b[4] - 24} size={25}>
          局部规则挪进 .claude/rules/，配 glob 路径，用到才加载
        </Item>
        <Item f={b[4] - 38} size={25}>
          @path 只拆文件，不省上下文
        </Item>
      </Box>
      <Note x={110} y={806} p={prog(b[2], 18, 70)} size={23} rot={0} w={1700}>
        报告内容为示意 · 默认扫 CLAUDE.md、CLAUDE.local.md、AGENTS.md 和 .claude/、~/.claude/ 下的 rules、skills 等
      </Note>
      <Src>依据 Claude Code memory / commands 文档；/checkup 是 /doctor 的别名，单跑 /doctor 查的是环境</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ six kinds of rules
const ROWS = [
  {k: '构建命令、目录关系、必须兼容的业务要求', v: '必须保留', c: W.green},
  {k: '验收条件、数据安全与权限边界', v: '保留，能下沉到测试 / 权限 / Hook 的优先下沉', c: W.green},
  {k: '“认真思考”“全面检查”“反复确认”', v: '测一下，没带来提升直接删', c: W.red},
  {k: '每个任务都要走的冗长流程', v: '拆成按需调用的 Skill', c: W.blue},
  {k: '只针对特定文件或子模块的规则', v: '带路径限定的 Rules 或 Skill', c: W.blue},
  {k: '修旧模型 bug 加的临时补丁', v: '拿当年的 bad case 重测，不报错就删', c: W.red},
];
export const Table: React.FC = () => {
  const b = useBeats();
  const at = [1, 2, 3, 4, 4, 5];
  return (
    <Board>
      <Head num="4.2" title="老潘的六类切法（经验，不是官方规范）" />
      <Box x={110} y={160} w={1700} h={680} p={prog(b[0], 22)} seed={210} pad={0}>
        {ROWS.map((r, i) => {
          const f = b[at[i]] - (i === 4 ? -14 : 0);
          return (
            <div key={r.k} style={{position: 'absolute', left: 0, top: i * 112, width: 1700, height: 112, borderTop: i ? `2.5px dashed ${W.faint}` : undefined, display: 'flex', alignItems: 'center'}}>
              <div style={{width: 860, paddingLeft: 34, opacity: 0.35 + 0.65 * prog(f, 12)}}>
                <Zh size={28}>{r.k}</Zh>
              </div>
              <div style={{width: 820, opacity: prog(f, 12, 8), transform: `translateX(${(1 - prog(f, 14, 8)) * 30}px)`}}>
                <Hd size={32} color={r.c}>
                  → {r.v}
                </Hd>
              </div>
            </div>
          );
        })}
      </Box>
      <Src>原文表格（作者经验整理）</Src>
    </Board>
  );
};

// ------------------------------------------------------------------ the deletion loop (figure 5)
export const Loop: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const STEPS = [
    {k: '备份', v: 'Git 标签 / 快照', beat: 0, d: 0},
    {k: '删一组', v: '只动一类规则', beat: 0, d: 14},
    {k: '复测', v: '日常任务 + 当初的 bad case', beat: 1, d: 0},
  ];
  return (
    <Board>
      <Head num="4.2" title="给旧规则做删减实验" />
      {STEPS.map((s, i) => (
        <React.Fragment key={s.k}>
          <div style={{position: 'absolute', left: 110 + i * 470, top: 170, ...pop(b[s.beat], s.d + i * 8)}}>
            <Box x={0} y={0} w={400} h={150} p={prog(b[s.beat], 18, s.d + i * 8)} seed={220 + i} pad="20px 26px">
              <Hd size={38}>{s.k}</Hd>
              <Zh size={24} color={W.dim} style={{display: 'block', marginTop: 4}}>
                {s.v}
              </Zh>
            </Box>
          </div>
          {i < 2 && <Arrow pts={[[515 + i * 470, 245], [575 + i * 470, 245]]} p={prog(b[s.beat], 12, s.d + 20)} seed={225 + i} />}
        </React.Fragment>
      ))}
      <Arrow pts={[[1330, 325], [1380, 345], [1410, 366]]} p={prog(b[2], 14)} color={W.green} seed={228} />
      <Arrow pts={[[1120, 325], [1000, 470], [900, 562]]} p={prog(b[3], 14)} color={W.red} seed={229} />
      <div style={{position: 'absolute', left: 1260, top: 370, ...pop(b[2], 10)}}>
        <Box x={0} y={0} w={550} h={160} p={prog(b[2], 18, 10)} seed={231} pad="18px 26px">
          <Hd size={32} color={W.green}>
            多轮都稳定通过
          </Hd>
          <Zh size={24} style={{display: 'block', marginTop: 4}}>
            这组可以删，进入下一组；跑通一次不算数
          </Zh>
        </Box>
      </div>
      <div style={{position: 'absolute', left: 620, top: 570, ...pop(b[3], 10)}}>
        <Box x={0} y={0} w={560} h={160} p={prog(b[3], 18, 10)} seed={232} pad="18px 26px">
          <Hd size={32} color={W.red}>
            出现回归
          </Hd>
          <Zh size={24} style={{display: 'block', marginTop: 4}}>
            只加回能解释这次失败的最小规则
          </Zh>
        </Box>
      </div>
      <div style={{position: 'absolute', left: 110, top: 760, ...pop(b[4], 0)}}>
        <Hd size={32}>
          硬红线 → <HL p={prog(b[4], 18, 10)}>PreToolUse hook 硬拦截</HL>
        </Hd>
        <Zh size={22} color={W.dim} style={{display: 'block', marginTop: 6}}>
          CLAUDE.md 和 Auto Memory 都只是软提示
        </Zh>
      </div>
      <Src>据原文图 5 重绘 · 工程上的整理方法，不是官方模板</Src>
    </Board>
  );
};
