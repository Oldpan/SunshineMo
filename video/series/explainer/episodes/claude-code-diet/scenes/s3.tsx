// Section 3: Opus 5.5 starts at medium (redraw of figure 3) and the migration pitfalls.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Board, Box, Cross, Hd, Head, HL, Mo, Note, prog, Src, Stamp, Term, Tick, usePopIn, W, Zh} from './common';

const LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'];

const Ladder: React.FC<{y: number; label: string; def: number; p: number; knob: number; color: string}> = ({y, label, def, p, knob, color}) => {
  const cell = 230;
  return (
    <div style={{position: 'absolute', left: 110, top: y, opacity: p}}>
      <div style={{position: 'absolute', left: 0, top: 22, width: 220}}>
        <Hd size={38}>{label}</Hd>
      </div>
      {LEVELS.map((l, i) => (
        <div
          key={l}
          style={{
            position: 'absolute',
            left: 240 + i * cell,
            top: 0,
            width: cell - 16,
            height: 90,
            borderRadius: 12,
            border: `3px solid ${W.ink}`,
            background: i === def ? color : W.card,
            boxShadow: i === def ? `7px 7px 0 ${W.ink}` : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mo size={30} w={700} color={i === def ? '#fff' : W.ink}>
            {l}
          </Mo>
          {i === def && (
            <div style={{position: 'absolute', top: -34}}>
              <Hd size={24} color={color}>
                默认
              </Hd>
            </div>
          )}
        </div>
      ))}
      {/* slider knob */}
      <div style={{position: 'absolute', left: 240 + knob * cell + (cell - 16) / 2 - 16, top: 100, width: 32, height: 32, borderRadius: 16, background: W.ink, opacity: knob >= 0 ? 1 : 0}} />
    </div>
  );
};

export const Default: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const slide = interpolate(prog(b[1], 30, 20), [0, 1], [2, 1]);
  return (
    <Board>
      <Head num="3" title="Opus 5.5 从 medium 起步" />
      <Ladder y={200} label="Opus 5" def={2} p={prog(b[0], 16, 10)} knob={-1} color={W.dim} />
      <Ladder y={360} label="Opus 5.5" def={1} p={prog(b[1], 16)} knob={slide} color={W.clay} />
      <Note x={1340} y={490} p={prog(b[1], 18, 50)} size={30} rot={-3}>
        默认降了一档（API 和 Claude Code）
      </Note>
      <Box x={110} y={560} w={860} h={150} p={prog(b[2], 18)} seed={180} bg={W.yellow} pad="18px 28px">
        <Hd size={32}>
          5.5 的 medium ≈ / ＞ 5 的 high
        </Hd>
        <Zh size={22} color={W.dim} style={{display: 'block', marginTop: 6}}>
          Anthropic 内部编码 / 知识工作基准；部分纯代码测试里 low 也很接近
        </Zh>
      </Box>
      <Stamp x={130} y={760} f={b[3]} size={30}>
        官方数据，自己的用例再跑一遍
      </Stamp>
      <Term
        x={1020}
        y={560}
        w={800}
        h={260}
        p={prog(b[4], 18)}
        size={23}
        lines={[
          ['> /effort medium', b[4] - 8, W.clay],
          ['{"model": "claude-opus-5-5",', b[4] - 40],
          [' "max_tokens": 128000,', b[5], '#F5C66B'],
          [' "output_config": {"effort": "medium"},', b[4] - 60],
          [' "messages": [...]}', b[4] - 74],
        ]}
      />
      <Note x={1040} y={826} p={prog(b[5], 18, 20)} size={26} rot={-1} w={780}>
        128000：给 thinking 和输出留足空间
      </Note>
      <Src>依据 Claude Platform Effort / Prompting Opus 5.5 与 Claude Code model-config 文档</Src>
    </Board>
  );
};

export const Migrate: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const PITS = [
    {k: '改了顶层 effort', v: 'Prompt Cache 直接失效', s: '中途切档用 per-message effort（beta 请求头）'},
    {k: 'thinking: {"type": "disabled"}', v: 'Opus 5.5 直接报 400', s: '想省成本，从 low 档起步测'},
    {k: 'user settings 顶层 effortLevel', v: '对 Opus 5.5 不生效', s: '写了 "high" 也还是走 medium'},
  ];
  return (
    <Board>
      <Head num="3" title="同名档位，思考量不一样" />
      <div style={{position: 'absolute', left: 110, top: 160, display: 'flex', gap: 40, alignItems: 'flex-end'}}>
        {[
          ['Opus 5', 0.45, W.dim],
          ['Opus 5.5', 0.75, W.clay],
        ].map(([n, h, c], i) => (
          <div key={n as string} style={{textAlign: 'center'}}>
            <div style={{width: 120, height: 180 * (h as number) * prog(b[0], 24, i * 10), background: c as string, border: `3px solid ${W.ink}`, borderRadius: 8}} />
            <Mo size={22}>{n as string}</Mo>
          </div>
        ))}
        <div style={{opacity: prog(b[0], 12, 20)}}>
          <Hd size={30}>同一档的思考 token</Hd>
          <Zh size={22} color={W.dim} style={{display: 'block'}}>
            xhigh、max 差得更多（示意高度）
          </Zh>
        </div>
      </div>
      <Note x={1060} y={210} p={prog(b[1], 20)} size={32} rot={-2} w={720}>
        照搬旧的 high / max → 白白浪费 token 和时间
      </Note>
      {PITS.map((p, i) => (
        <div key={p.k} style={{position: 'absolute', left: 110 + i * 580, top: 420, ...pop(b[3 + i], 0)}}>
          <Box x={0} y={0} w={540} h={290} p={prog(b[3 + i], 18)} seed={190 + i} pad="20px 26px">
            <Hd size={30} color={W.clay}>
              坑 {i + 1}
            </Hd>
            <Mo size={21} style={{display: 'block', marginTop: 8, whiteSpace: 'normal'}}>
              {p.k}
            </Mo>
            <Hd size={32} color={W.red} style={{display: 'block', marginTop: 10}}>
              → {p.v}
            </Hd>
            <Zh size={22} color={W.dim} style={{display: 'block', marginTop: 10}}>
              {p.s}
            </Zh>
          </Box>
        </div>
      ))}
      <div style={{position: 'absolute', left: 110, top: 360, opacity: prog(b[2], 12)}}>
        <Hd size={34}>迁移时的三个坑</Hd>
      </div>
      <div style={{position: 'absolute', left: 110, top: 760, ...pop(b[6], 0)}}>
        <Hd size={30}>
          比档位：同一组固定任务 → <HL p={prog(b[6], 20, 10)}>通过率 · 耗时 · token · 人工返工次数</HL>
        </Hd>
      </div>
      <Src>依据 Claude Platform Effort 与 Claude Code model-config 文档；/effort 加档位会存成默认，只想本次生效在滑块里按 s</Src>
    </Board>
  );
};
