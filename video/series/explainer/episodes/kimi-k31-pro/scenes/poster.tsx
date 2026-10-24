// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs. Same misty landscape and Kimi blue as the video.
// The hook is the scoreboard: an open model level with the closed flagships.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from '@atv/lib/Video';
import {FONT_MONO, FONT_SERIF, FONT_ZH, K, Mountains, Num, useSerifFonts} from './common';

// A: 「开源旗舰 / 逼近 Opus」 with the Terminal-Bench duel. B: 「开源模型 / 4 项跑赢闭源」 with the four table-firsts.
const VARIANT: 'A' | 'B' = 'A';

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.93)',
  borderRadius: 26,
  boxShadow: '0 22px 60px rgba(30,50,65,0.20)',
  border: '1px solid rgba(255,255,255,0.9)',
};

// Blog table, max effort; Opus 5.5 is "with fallback". Every one of these is the row's best score.
const FIRSTS = [
  {name: 'HLE 带工具', v: '70.0', opus: '67.7'},
  {name: 'BrowseComp', v: '92.1', opus: '90.8'},
  {name: 'AutomationBench', v: '73.3', opus: '69.5'},
  {name: 'OfficeQA Pro v2', v: '64.4', opus: '62.2'},
];

const Pill: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      fontFamily: FONT_ZH,
      fontSize: 26,
      fontWeight: 700,
      color: '#2B3A45',
      background: 'rgba(255,255,255,0.78)',
      borderRadius: 999,
      padding: '8px 22px',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

/** Terminal-Bench 4.0: Opus 66.4 vs K3.1 Pro 65.7, bars from zero. */
const Duel: React.FC<{w: number}> = ({w}) => {
  const barW = w - 300;
  const rows = [
    {name: 'Claude Opus 5.5', v: 66.4, c: K.grey2, ink: K.dim},
    {name: 'Kimi K3.1 Pro', v: 65.7, c: K.hero, ink: K.hero},
  ];
  return (
    <div style={{...CARD, width: w, padding: '34px 40px 30px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
        <span style={{fontFamily: FONT_SERIF, fontSize: 38, fontWeight: 700, color: K.ink}}>Terminal-Bench 4.0</span>
        <span style={{fontFamily: FONT_ZH, fontSize: 22, fontWeight: 600, color: K.faint}}>终端编程</span>
      </div>
      <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 22}}>
        {rows.map((r) => (
          <div key={r.name}>
            <div style={{fontFamily: FONT_ZH, fontSize: 24, fontWeight: 700, color: r.name.startsWith('Kimi') ? K.ink : K.dim}}>{r.name}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 8}}>
              <div style={{width: (barW * r.v) / 70, height: 46, background: r.c, borderRadius: 8}} />
              <Num size={60} color={r.ink}>
                {r.v.toFixed(1)}
              </Num>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop: 24, display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{fontFamily: FONT_ZH, fontSize: 30, fontWeight: 800, color: K.onHero, background: K.hero, borderRadius: 12, padding: '8px 20px'}}>只差 0.7 分</span>
        <span style={{fontFamily: FONT_ZH, fontSize: 22, fontWeight: 600, color: K.faint}}>官方博客跑分 · 思考强度 max</span>
      </div>
      <div style={{marginTop: 26, borderTop: `1px solid ${K.line}`, paddingTop: 20}}>
        <div style={{fontFamily: FONT_ZH, fontSize: 22, fontWeight: 700, color: K.dim}}>另有 4 项表内第一</div>
        <div style={{display: 'flex', gap: 12, marginTop: 12}}>
          {FIRSTS.map((x) => (
            <div key={x.name} style={{flex: 1, background: K.panel2, borderRadius: 14, padding: '12px 14px'}}>
              <Num size={44} color={K.hero}>
                {x.v}
              </Num>
              <div style={{fontFamily: FONT_ZH, fontSize: 17, fontWeight: 700, color: K.dim, marginTop: 6, whiteSpace: 'nowrap'}}>{x.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** The four table-firsts as big score tiles, each against Opus 5.5. */
const Firsts: React.FC<{w: number}> = ({w}) => (
  <div style={{...CARD, width: w, padding: '32px 36px 34px', boxSizing: 'border-box'}}>
    <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
      <span style={{fontFamily: FONT_SERIF, fontSize: 36, fontWeight: 700, color: K.ink}}>官方跑分 · 表内第一</span>
      <span style={{fontFamily: FONT_ZH, fontSize: 21, fontWeight: 600, color: K.faint}}>超过 Opus 5.5 与 GPT-6 Astra</span>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24}}>
      {FIRSTS.map((x) => (
        <div key={x.name} style={{background: K.panel2, borderRadius: 18, padding: '20px 24px 18px'}}>
          <div style={{fontFamily: FONT_ZH, fontSize: 24, fontWeight: 700, color: K.ink, whiteSpace: 'nowrap'}}>{x.name}</div>
          <div style={{marginTop: 10}}>
            <Num size={84} color={K.hero}>
              {x.v}
            </Num>
          </div>
          <div style={{fontFamily: FONT_MONO, fontSize: 21, fontWeight: 600, color: K.faint, marginTop: 8, whiteSpace: 'nowrap'}}>Opus 5.5 · {x.opus}</div>
        </div>
      ))}
    </div>
  </div>
);

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useFonts();
  useSerifFonts();
  const tall = h > w;
  const [l1, l2] = VARIANT === 'A' ? ['开源旗舰', '逼近 Opus'] : ['开源模型', '4 项跑赢闭源'];
  const titleSize = tall ? 132 : VARIANT === 'A' ? 156 : 132;
  const cardW = tall ? 920 : 720;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: tall ? 'scale(1.42)' : undefined, transformOrigin: '50% 100%'}}>
        <Mountains t={4} />
      </div>
      <div style={{position: 'absolute', left: tall ? 80 : 110, top: tall ? 90 : 190, width: tall ? 920 : 960}}>
        <span style={{fontFamily: FONT_ZH, fontSize: 32, fontWeight: 800, color: K.hero, letterSpacing: 2}}>Kimi K3.1 Pro · 全拆解</span>
        <div style={{marginTop: 18, lineHeight: 1.1}}>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: titleSize, color: K.ink, letterSpacing: -2, whiteSpace: 'nowrap'}}>{l1}</div>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: titleSize, color: K.hero, letterSpacing: -2, whiteSpace: 'nowrap'}}>{l2}</div>
        </div>
        <div style={{marginTop: 34, display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          <Pill>2.78 万亿参数</Pill>
          <Pill>1M 上下文</Pill>
          <Pill>开放权重</Pill>
        </div>
      </div>
      <div style={tall ? {position: 'absolute', left: 80, top: 620} : {position: 'absolute', right: 90, top: VARIANT === 'A' ? 200 : 210}}>
        {VARIANT === 'A' ? <Duel w={cardW} /> : <Firsts w={cardW} />}
      </div>
    </AbsoluteFill>
  );
};
