// Publishing covers (16:9 and 3:4), rendered by renderer/covers.mjs.
// A (swiss, the opening's look): 「天天用 AI 写代码 / 你已经是经理了」 + red band with the author.
// B (editorial, the article cover's look): 「管 agent = 管团队」 + you → 4 agents org chart.
// Switch VARIANT and re-run covers.mjs for the other one.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from '@atv/lib/Video';
import {COL, MX, Mono, OrgChart, Sans, Serif, useSerif} from './common';

const VARIANT: 'A' | 'B' = 'A';

const SwissA: React.FC<{w: number; h: number}> = ({w, h}) => {
  const tall = h > w;
  const big = tall ? 150 : 168;
  return (
    <AbsoluteFill style={{background: MX.swiss}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)', backgroundSize: '160px 100%'}} />
      <div style={{position: 'absolute', right: tall ? 0 : 120, top: 0, width: tall ? w : 300, height: tall ? 300 : h, bottom: tall ? 0 : undefined, background: COL.red, ...(tall ? {top: h - 300} : {})}} />
      <div style={{position: 'absolute', left: tall ? 70 : 110, top: tall ? 140 : 120}}>
        <Mono size={tall ? 30 : 30} color={COL.ink} w={700} style={{letterSpacing: 5}}>
          CODING AGENTS
        </Mono>
        <div style={{fontFamily: '"Noto Sans SC"', fontWeight: 900, fontSize: big, lineHeight: 1.06, letterSpacing: -4, color: COL.ink, marginTop: 20}}>
          天天用 AI
          <br />
          写代码
        </div>
        <div style={{fontFamily: '"Noto Sans SC"', fontWeight: 900, fontSize: big, lineHeight: 1.06, letterSpacing: -4, color: COL.red}}>
          你已经是
          {tall ? <br /> : null}
          经理了
        </div>
      </div>
      <div style={{position: 'absolute', left: tall ? 70 : undefined, right: tall ? undefined : 140, bottom: tall ? 90 : 90, width: tall ? 900 : 260, color: '#fff'}}>
        <Sans size={tall ? 46 : 36} w={900} color="#fff">
          10 个习惯
        </Sans>
        {tall ? <span style={{display: 'inline-block', width: 30}} /> : <br />}
        <Sans size={tall ? 32 : 26} w={600} color="#fff">
          Addy Osmani 长文
        </Sans>
      </div>
    </AbsoluteFill>
  );
};

const EditB: React.FC<{w: number; h: number}> = ({w, h}) => {
  const tall = h > w;
  return (
    <AbsoluteFill style={{background: MX.edit}}>
      <div style={{position: 'absolute', left: tall ? 80 : 120, top: tall ? 150 : 200}}>
        <Serif size={tall ? 130 : 150} w={900} color={COL.ink}>
          管 agent
        </Serif>
        <br />
        <Serif size={tall ? 130 : 150} w={900} color={COL.clay}>
          = 管团队
        </Serif>
        <div style={{width: 160, height: 8, background: COL.clay, margin: '30px 0'}} />
        <Sans size={tall ? 46 : 44} w={700}>
          10 个习惯 + 7 处不一样
        </Sans>
      </div>
      <OrgChart x={tall ? 120 : 1000} y={tall ? 900 : 360} n={4} f={999} w={tall ? 180 : 170} />
    </AbsoluteFill>
  );
};

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useFonts();
  useSerif();
  return VARIANT === 'A' ? <SwissA w={w} h={h} /> : <EditB w={w} h={h} />;
};
