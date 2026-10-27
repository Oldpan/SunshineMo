// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs. Same ivory + clay look as the video.
// A: 「别急着拆 / subagent」 with the runtime bar pair. B: 「5 层结构 / 换成 1 个循环」 with the before/after figure.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ClaudeSpark} from '@atv/lib/brand/claude';
import {useFonts} from '@atv/lib/Video';
import {FONT_MONO, FONT_SERIF, FONT_ZH, K, useSerifFonts} from './common';

const VARIANT: 'A' | 'B' = 'A';

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 26,
  boxShadow: '0 22px 60px rgba(60,40,20,0.12)',
  border: '1.5px solid rgba(20,20,19,0.08)',
  boxSizing: 'border-box',
};

const Pill: React.FC<{children: React.ReactNode; hot?: boolean}> = ({children, hot}) => (
  <span
    style={{
      fontFamily: FONT_ZH,
      fontSize: 28,
      fontWeight: 700,
      color: hot ? '#fff' : K.ink,
      background: hot ? K.clay : '#fff',
      border: `1.5px solid ${hot ? K.clay : 'rgba(20,20,19,0.12)'}`,
      borderRadius: 999,
      padding: '8px 24px',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

/** Runtime: multi-agent vs single loop, drawn at the article's "roughly 2x". */
const Speed: React.FC<{w: number}> = ({w}) => {
  const barW = w - 80;
  return (
    <div style={{...CARD, width: w, padding: '34px 40px 32px'}}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
        <span style={{fontFamily: FONT_SERIF, fontSize: 40, fontWeight: 700, color: K.ink}}>运行时间</span>
        <span style={{fontFamily: FONT_ZH, fontSize: 22, fontWeight: 600, color: K.faint}}>一位客户实测</span>
      </div>
      {[
        {n: '多 agent 架构', v: 1, c: K.stone2, ink: K.dim},
        {n: '单 agent 循环', v: 0.5, c: K.clay, ink: K.ink},
      ].map((r) => (
        <div key={r.n} style={{marginTop: 26}}>
          <div style={{fontFamily: FONT_ZH, fontSize: 28, fontWeight: 700, color: r.ink}}>{r.n}</div>
          <div style={{marginTop: 10, width: barW * r.v, height: 54, background: r.c, borderRadius: 6}} />
        </div>
      ))}
      <div style={{marginTop: 26, display: 'flex', alignItems: 'baseline', gap: 18}}>
        <span style={{fontFamily: FONT_SERIF, fontSize: 120, fontWeight: 700, color: K.clay, lineHeight: 1, letterSpacing: -3}}>≈2×</span>
        <span style={{fontFamily: FONT_ZH, fontSize: 34, fontWeight: 800, color: K.ink}}>更快</span>
      </div>
    </div>
  );
};

/** Before / after: five stacked layers vs one peach loop. */
const Figure: React.FC<{w: number}> = ({w}) => {
  const half = (w - 120) / 2;
  const box = (t: string, bg: string, h = 54) => (
    <div style={{height: h, background: bg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_ZH, fontSize: 22, fontWeight: 600, color: K.ink}}>{t}</div>
  );
  return (
    <div style={{...CARD, width: w, padding: '32px 36px', display: 'flex', gap: 48}}>
      <div style={{width: half}}>
        <div style={{fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: K.dim, letterSpacing: 2}}>常见做法</div>
        <div style={{fontFamily: FONT_SERIF, fontSize: 52, fontWeight: 700, color: K.dim, marginTop: 4}}>5 层结构</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16}}>
          {box('多 agent 编排器', K.stone2)}
          {box('意图分类器', K.stone)}
          {box('固定推理流水线', K.stone)}
          {box('用户分桶', K.stone)}
          {box('推荐分支', K.stone)}
        </div>
      </div>
      <div style={{width: half}}>
        <div style={{fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: K.clay, letterSpacing: 2}}>官方建议</div>
        <div style={{fontFamily: FONT_SERIF, fontSize: 52, fontWeight: 700, color: K.clay, marginTop: 4}}>1 个循环</div>
        <div style={{marginTop: 16, background: K.peach, borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
          {box('一个系统提示词', '#fff')}
          {box('模型', '#fff', 70)}
          <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{width: 40, height: 40, background: i < 4 ? K.clay : 'transparent', border: i === 4 ? `2px dashed ${K.clay}` : undefined, boxSizing: 'border-box'}} />
            ))}
          </div>
          {box('输出护栏', '#fff')}
        </div>
      </div>
    </div>
  );
};

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useFonts();
  useSerifFonts();
  const tall = h > w;
  const [l1, l2] = VARIANT === 'A' ? ['别急着拆', 'subagent'] : ['5 层结构', '换成 1 个循环'];
  const titleSize = tall ? 140 : 150;
  const cardW = tall ? 920 : VARIANT === 'A' ? 700 : 760;
  return (
    <AbsoluteFill style={{background: K.page}}>
      <AbsoluteFill
        style={{backgroundImage: 'radial-gradient(rgba(20,20,19,0.08) 1.6px, transparent 1.8px)', backgroundSize: '34px 34px', backgroundPosition: '17px 17px'}}
      />
      <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 100 : 250, width: tall ? 920 : 980}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <ClaudeSpark size={44} color={K.orange} />
          <span style={{fontFamily: FONT_ZH, fontSize: 32, fontWeight: 800, color: K.dim, letterSpacing: 1}}>Claude 官方 · 搭 agent 实战建议</span>
        </div>
        <div style={{marginTop: 26, lineHeight: 1.1}}>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: titleSize, color: K.ink, letterSpacing: -3, whiteSpace: 'nowrap'}}>{l1}</div>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: titleSize, color: K.clay, letterSpacing: -3, whiteSpace: 'nowrap'}}>{l2}</div>
        </div>
        <div style={{marginTop: 40, display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          {VARIANT === 'A' ? (
            <>
              <Pill hot>并回一个主循环</Pill>
              <Pill>有客户快约 2 倍</Pill>
              <Pill>迁移套件</Pill>
            </>
          ) : (
            <>
              <Pill hot>质量常更好</Pill>
              <Pill>成本、延迟更低</Pill>
            </>
          )}
        </div>
      </div>
      <div style={tall ? {position: 'absolute', left: 80, top: 640} : {position: 'absolute', right: 90, top: VARIANT === 'A' ? 240 : 220}}>
        {VARIANT === 'A' ? <Speed w={cardW} /> : <Figure w={cardW} />}
      </div>
    </AbsoluteFill>
  );
};
