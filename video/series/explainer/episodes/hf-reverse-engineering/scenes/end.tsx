// Part 5: the article's conclusions and open questions (crayon), then the outro with the source address.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  appear, C, CR, CrayonCheck, CrayonRect, CrayonText, DeepSeekWhale, FONT_MONO, FONT_ZH, HFLogo, prog, QwenMark, SceneTitle, Src, SRC_BLOG,
  useBeats, usePopIn, useTh, Zh,
} from './common';

const Ratio: React.FC<{label: string; n: number; total: number; f: number}> = ({label, n, total, f}) => {
  const p = prog(f, 30);
  const cols = 14;
  return (
    <div style={appear(f, 0)}>
      <CrayonText size={36}>{label}：{n} / {total}</CrayonText>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 22px)`, gap: 6, marginTop: 10}}>
        {Array.from({length: total}, (_, i) => (
          <div key={i} style={{width: 22, height: 22, borderRadius: 6, background: i < n && i / total < p ? '#4D6BFE' : i / total < p ? CR.green : '#E8E1CF'}} />
        ))}
      </div>
    </div>
  );
};

export const Conclusion: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneTitle kicker="结论">小模型要给对条件</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.9)}}>
        <CrayonRect w={820} h={330} stroke={CR.orange} p={prog(b[0], 20)} seed={4}>
          <CrayonText size={40}>条件给对，小模型也能做出关键的东西</CrayonText>
          <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 26}}>
            {['提示词：给一个做得了的范围', 'harness：给一个合适的工作环境'].map((t, i) => (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, ...appear(b[1], i * 12)}}>
                <div style={{width: 48, height: 48, position: 'relative'}}>
                  <CrayonCheck size={48} p={prog(b[1], 14, i * 12 + 6)} />
                </div>
                <CrayonText size={36}>{t}</CrayonText>
              </div>
            ))}
          </div>
        </CrayonRect>
      </div>
      <div style={{position: 'absolute', left: 84, top: 640, width: 820, display: 'flex', alignItems: 'center', gap: 18, ...appear(b[4], 0)}}>
        <DeepSeekWhale size={60} />
        <CrayonText size={36}>方向：不同大小、不同家族的工人池；一个或几个主管，带一群小模型</CrayonText>
      </div>
      <div style={{position: 'absolute', left: 980, top: 250, width: 860, display: 'flex', flexDirection: 'column', gap: 26}}>
        <div style={pop(b[2], 0, 0.85)}>
          <CrayonText size={44} color={CR.blue}>约四成函数需要主管</CrayonText>
        </div>
        <Ratio label="HF logo" n={15} total={38} f={b[3]} />
        <Ratio label="太空射击" n={20} total={56} f={b[3] - 12} />
        <div style={{display: 'flex', alignItems: 'center', gap: 10, ...appear(b[3], 20)}}>
          <div style={{width: 22, height: 22, borderRadius: 6, background: '#4D6BFE'}} />
          <Zh size={22} w={700} color={C.sub}>退回主管</Zh>
          <div style={{width: 22, height: 22, borderRadius: 6, background: CR.green, marginLeft: 14}} />
          <Zh size={22} w={700} color={C.sub}>工人完成</Zh>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1500, top: 700, display: 'flex', gap: 6, ...appear(b[5], 0)}}>
        {Array.from({length: 8}, (_, i) => (
          <div key={i} style={{transform: `translateY(${Math.sin((frame + i * 12) / 12) * 4}px)`}}>
            <QwenMark size={36} />
          </div>
        ))}
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Conclusion and open questions</Src>
    </AbsoluteFill>
  );
};

export const Open: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  // two data points on a sketch chart: functions vs (team cost / solo cost)
  const pts: [number, number, string][] = [
    [38, 2.97 / 0.87, 'HF logo'],
    [56, 3.6 / 3.28, '太空射击'],
  ];
  const X = (n: number) => 80 + (n - 30) * 18;
  const Y = (r: number) => 420 - (r - 0.8) * 110;
  return (
    <AbsoluteFill>
      <SceneTitle kicker="开放问题">只有两个数据点</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.9)}}>
        <div style={{width: 820, height: 520, background: '#FFFDF6', borderRadius: 18, position: 'relative', boxShadow: '0 10px 24px rgba(80,60,30,0.12)'}}>
          <svg width={820} height={520} style={{position: 'absolute', left: 0, top: 0}}>
            <line x1={70} y1={440} x2={780} y2={440} stroke={CR.ink} strokeWidth={4} />
            <line x1={70} y1={440} x2={70} y2={40} stroke={CR.ink} strokeWidth={4} />
            <line x1={X(38)} y1={Y(pts[0][1])} x2={X(56)} y2={Y(pts[1][1])} stroke={CR.orange} strokeWidth={4} strokeDasharray="12 10" opacity={prog(b[0], 20, 20)} />
            <line x1={70} y1={Y(1)} x2={780} y2={Y(1)} stroke={CR.blue} strokeWidth={2} strokeDasharray="6 8" opacity={0.7} />
          </svg>
          {pts.map(([n, r, l], i) => (
            <div key={l} style={{position: 'absolute', left: X(n) - 16, top: Y(r) - 16, ...pop(b[0], 8 + i * 10, 0.4)}}>
              <div style={{width: 32, height: 32, borderRadius: 16, background: CR.orange, border: '4px solid #fff'}} />
              <div style={{position: 'absolute', left: i ? -330 : 40, top: i ? -56 : -6, whiteSpace: 'nowrap'}}>
                <CrayonText size={28}>{l}：{n} 个函数 · 团队成本 {r.toFixed(1)} 倍</CrayonText>
              </div>
            </div>
          ))}
          <div style={{position: 'absolute', left: 560, top: Y(1) + 8}}>
            <Zh size={20} w={700} color={CR.blue}>持平线（团队 = 单干）</Zh>
          </div>
          <div style={{position: 'absolute', left: 300, top: 450}}>
            <Zh size={22} w={800} color={C.sub}>要还原的函数个数 →</Zh>
          </div>
        </div>
        <Zh size={20} w={700} color={C.faint} style={{marginTop: 8}}>团队成本 ÷ 单干成本，按原文两张表算；连线只是示意</Zh>
      </div>
      <div style={{position: 'absolute', left: 980, top: 250, width: 860, display: 'flex', flexDirection: 'column', gap: 22}}>
        <div style={appear(b[1], 0)}>
          <CrayonText size={40} color={CR.red}>“difficult to say, with only two data points”</CrayonText>
        </div>
        {[
          {t: '可能更适合：需要大量规划的长任务', beat: 2},
          {t: '也适合：能拆成很细小任务的问题', beat: 3},
          {t: '值得继续看：工人 harness 怎么演化', beat: 4},
        ].map((r) => (
          <div key={r.t} style={pop(b[r.beat], 0, 0.85)}>
            <CrayonRect w={860} h={96} stroke={CR.green} p={prog(b[r.beat], 16)} seed={r.beat} pad={22}>
              <CrayonText size={36}>{r.t}</CrayonText>
            </CrayonRect>
          </div>
        ))}
        <div style={{...appear(b[5], 0)}}>
          <CrayonText size={32} color={CR.brown}>注意：两道题都是 Claude Code 生成的小程序</CrayonText>
        </div>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 150, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Conclusion and open questions</Src>
    </AbsoluteFill>
  );
};

export const Outro: React.FC = () => {
  const th = useTh();
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 34, ...pop(b[0], 0, 0.7)}}>
        <HFLogo size={120} />
        <DeepSeekWhale size={130} color="#8EA2FF" />
        <div style={{display: 'flex', gap: 10}}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{transform: `translateY(${Math.sin((frame + i * 15) / 13) * 6}px)`}}>
              <QwenMark size={70} />
            </div>
          ))}
        </div>
      </div>
      <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 72, color: th.ink, marginTop: 40, ...appear(b[0], 10)}}>大模型带小模型，逆向二进制</div>
      <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: th.accent, marginTop: 30, ...appear(b[1], 0)}}>
        huggingface.co/blog/ybelkada/reverse-engineering-anything-with-small-local-mode
      </div>
      <div style={{fontFamily: FONT_ZH, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.7)', marginTop: 14, ...appear(b[1], 8)}}>
        原文含两张交互配图：Inside a compiled binary · One function through the pipeline
      </div>
    </AbsoluteFill>
  );
};
