// Section 4: Claude Code's own System Prompt cut by 80%+, and the three things that were cleaned up.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Board, Box, Hd, Head, HL, Mo, Note, prog, Src, Strike, Tick, usePopIn, W, Zh} from './common';

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
