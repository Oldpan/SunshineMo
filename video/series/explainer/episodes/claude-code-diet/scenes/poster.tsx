// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs, in the episode's whiteboard look.
// A: 「Claude Code 官方删了 80%+ System Prompt」 with the shrinking bar. B: 「立好验收标准 / 给旧规则瘦身」 with a slimmed CLAUDE.md.
// Switch VARIANT and re-run covers.mjs for the other one.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from '@atv/lib/Video';
import {FONT_HANDW, Mo, W, Zh} from './common';

const VARIANT: 'A' | 'B' = 'A';

const Card: React.FC<{w: number; h: number; bg?: string; children: React.ReactNode}> = ({w, h, bg = W.card, children}) => (
  <div style={{position: 'relative', width: w, height: h}}>
    <div style={{position: 'absolute', left: 12, top: 12, width: w, height: h, background: W.ink, borderRadius: 18}} />
    <div style={{position: 'absolute', inset: 0, background: bg, border: `5px solid ${W.ink}`, borderRadius: 18, padding: '28px 34px', boxSizing: 'border-box'}}>{children}</div>
  </div>
);
const H: React.FC<{size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size, color = W.ink, children, style}) => (
  <div style={{fontFamily: FONT_HANDW, fontWeight: 700, fontSize: size, color, lineHeight: 1.12, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Mark: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = W.peach}) => (
  <span style={{backgroundImage: `linear-gradient(transparent 55%, ${color} 55%, ${color} 92%, transparent 92%)`, padding: '0 6px'}}>{children}</span>
);

const Bar: React.FC<{w: number}> = ({w}) => (
  <Card w={w} h={330}>
    <Zh size={30} color={W.dim}>
      Claude Code 自己的 System Prompt
    </Zh>
    <div style={{position: 'relative', height: 110, marginTop: 24}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: w - 80, height: 100, border: `5px dashed ${W.faint}`, borderRadius: 14}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: (w - 80) * 0.18, height: 100, background: `repeating-linear-gradient(-40deg, ${W.clay} 0 16px, #E89A78 16px 32px)`, border: `5px solid ${W.ink}`, borderRadius: 14}} />
      <div style={{position: 'absolute', left: (w - 80) * 0.18 + 40, top: -6}}>
        <H size={100} color={W.red}>
          −80%+
        </H>
      </div>
    </div>
    <Zh size={30} color={W.green} w={700} style={{display: 'block', marginTop: 22}}>
      ✓ 核心代码基准没掉
    </Zh>
  </Card>
);

const Slim: React.FC<{w: number}> = ({w}) => (
  <Card w={w} h={470}>
    <Mo size={30} w={700}>
      CLAUDE.md
    </Mo>
    {['- 必须测试！！', '- 认真思考，全面检查', '- 改完反复确认三遍'].map((t) => (
      <div key={t} style={{position: 'relative', marginTop: 14, width: 'fit-content'}}>
        <Mo size={32} color={W.faint}>
          {t}
        </Mo>
        <div style={{position: 'absolute', left: -6, right: -6, top: 22, height: 6, background: W.red, borderRadius: 3, transform: 'rotate(-2deg)'}} />
      </div>
    ))}
    <div style={{marginTop: 22}}>
      <Mo size={32} color={W.clay}>
        ## 完成条件
      </Mo>
    </div>
    <div style={{marginTop: 8}}>
      <Mo size={32}>- 测试退出码为 0</Mo>
    </div>
  </Card>
);

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useFonts();
  const tall = h > w;
  const A = VARIANT === 'A';
  const titleSize = tall ? 88 : 128;
  return (
    <AbsoluteFill style={{background: W.paper}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${W.grid} 2px, transparent 2px), linear-gradient(90deg, ${W.grid} 2px, transparent 2px)`,
          backgroundSize: '56px 56px',
        }}
      />
      <div style={{position: 'absolute', left: tall ? 80 : 100, top: tall ? 110 : 150}}>
        <span style={{background: W.ink, color: W.paper, fontFamily: FONT_HANDW, fontWeight: 700, fontSize: 36, borderRadius: 12, padding: '4px 20px'}}>Claude Code 提示词大减负</span>
        <div style={{marginTop: 36}}>
          {A ? (
            <>
              <H size={titleSize}>官方 System Prompt</H>
              <H size={titleSize} color={W.clay}>
                <Mark>删了 80%+</Mark>
              </H>
            </>
          ) : (
            <>
              <H size={titleSize}>别让 Claude Code</H>
              <H size={titleSize} color={W.clay}>
                <Mark>越用越蠢</Mark>
              </H>
            </>
          )}
        </div>
        <div style={{marginTop: 34, display: 'flex', gap: 16, flexWrap: 'wrap', width: tall ? 920 : 860}}>
          {(A ? ['删的是 Claude Code 自己的', '基准没掉', '你的 CLAUDE.md 别照搬比例'] : ['立好验收标准', '给旧规则瘦身', '/goal · medium']).map((t, i) => (
            <span key={t} style={{background: i === 0 ? W.yellow : W.card, border: `4px solid ${W.ink}`, borderRadius: 14, padding: '6px 22px', fontFamily: FONT_HANDW, fontWeight: 700, fontSize: 38, whiteSpace: 'nowrap'}}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div style={tall ? {position: 'absolute', left: 80, top: A ? 820 : 760} : {position: 'absolute', right: 100, top: A ? 620 : 540}}>
        {A ? <Bar w={tall ? 900 : 760} /> : <Slim w={tall ? 900 : 720} />}
      </div>
    </AbsoluteFill>
  );
};
