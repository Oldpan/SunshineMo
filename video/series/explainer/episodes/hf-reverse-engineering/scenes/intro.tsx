// Intro: cover (who, what, the two headline results) + why the authors tried this (the REA repository).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {appear, Big, C, DeepSeekWhale, FONT_MONO, FONT_NUM, FONT_ZH, GREEN, HFLogo, MonoT, Panel, prog, QwenMark, SceneTitle, Src, SRC_BLOG, useBeats, useBob, usePopIn, useTh, Zh} from './common';

export const Cover: React.FC = () => {
  const th = useTh();
  const b = useBeats();
  const pop = usePopIn();
  const bob = useBob(5, 80);
  const frame = useCurrentFrame();
  const workers = [0, 1, 2, 3];
  return (
    <AbsoluteFill>
      {/* left: title block */}
      <div style={{position: 'absolute', left: 84, top: 210, width: 900, ...appear(b[0], 0)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <HFLogo size={54} />
          <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 28, color: C.sub, letterSpacing: 1}}>Hugging Face 社区博文 · 2026-10-26</div>
        </div>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 92, color: th.ink, lineHeight: 1.08, marginTop: 34}}>大模型带小模型</div>
        <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 92, color: th.accent, lineHeight: 1.08}}>逆向二进制</div>
        <div style={{width: 640, height: 8, background: th.accent, borderRadius: 4, marginTop: 22, transformOrigin: 'left', transform: `scaleX(${prog(b[0], 20, 6)})`}} />
        <Zh size={30} w={700} color={C.sub} style={{marginTop: 24, ...appear(b[1], 0)}}>
          作者：Younes B · Nathan Habib · Lysandre
        </Zh>
        <div style={{display: 'flex', gap: 14, marginTop: 34, ...appear(b[3], 0)}}>
          {[
            ['38 / 38', 'HF logo 动画'],
            ['56 / 56', '太空射击'],
          ].map(([n, l], i) => (
            <div key={n} style={{background: '#fff', borderRadius: 16, padding: '14px 22px', border: `3px solid ${GREEN}`, ...appear(b[3], i * 8)}}>
              <Big size={48} color={GREEN}>{n}</Big>
              <Zh size={22} w={800} color={C.sub} style={{marginTop: 4}}>{l} · 函数全部还原</Zh>
            </div>
          ))}
        </div>
      </div>

      {/* right: lead + 4 workers */}
      <div style={{position: 'absolute', left: 1040, top: 210, ...pop(b[2], 0, 0.88)}}>
        <Panel w={780} h={640} accent={th.accent}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `translateY(${bob}px)`}}>
            <div style={{width: 130, height: 130, borderRadius: 26, background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <DeepSeekWhale size={100} bob={false} />
            </div>
            <div>
              <Zh size={22} w={800} color={C.faint}>主管 lead</Zh>
              <MonoT size={27} style={{marginTop: 2}}>DeepSeek-V4.1-Flash-1017</MonoT>
            </div>
          </div>
          <div style={{height: 2, background: C.line, margin: '26px 0'}} />
          <Zh size={22} w={800} color={C.faint}>工人 workers × 4</Zh>
          <div style={{display: 'flex', gap: 18, marginTop: 14}}>
            {workers.map((i) => (
              <div key={i} style={{width: 160, height: 190, borderRadius: 20, background: '#F2F1FE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, ...pop(b[2], 10 + i * 6, 0.6), transform: `${pop(b[2], 10 + i * 6, 0.6).transform} translateY(${Math.sin((frame + i * 20) / 14) * 3}px)`}}>
                <QwenMark size={100} />
                <MonoT size={18} color={C.sub}>Qwen3.5-9B</MonoT>
              </div>
            ))}
          </div>
          <div style={{marginTop: 40, display: 'flex', alignItems: 'center', gap: 12, ...appear(b[4], 0)}}>
            <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 26, color: '#fff', background: th.accent, borderRadius: 10, padding: '8px 16px', whiteSpace: 'nowrap'}}>主管改了 2 次工人提示词</div>
            <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 26, color: th.ink, background: th.accentSoft, borderRadius: 10, padding: '8px 16px', whiteSpace: 'nowrap'}}>
              + 写了 <span style={{fontFamily: FONT_MONO}}>lookup</span> 工具
            </div>
          </div>
        </Panel>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 184, ...appear(b[0], 20)}}>{SRC_BLOG}</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ REA
export const Rea: React.FC = () => {
  const th = useTh();
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  const stars = Math.round(370 * prog(b[1], 40));
  return (
    <AbsoluteFill>
      <SceneTitle kicker="起因">逆向项目 REA 火了</SceneTitle>
      {/* repo card, redrawn from the article's screenshot */}
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.9)}}>
        <div style={{width: 860, background: '#0D1117', borderRadius: 18, padding: '26px 30px', boxShadow: '0 18px 40px rgba(0,0,0,0.25)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <MonoT size={40} color="#E6EDF3">rea</MonoT>
            <div style={{border: '2px solid #30363D', borderRadius: 999, padding: '2px 14px', fontFamily: FONT_ZH, fontWeight: 700, fontSize: 20, color: '#8B949E'}}>Public</div>
            <div style={{marginLeft: 'auto', display: 'flex', gap: 12}}>
              {[
                ['Fork', '92.5k'],
                ['Star', `${stars}k`],
              ].map(([k, v]) => (
                <div key={k} style={{border: '2px solid #30363D', borderRadius: 10, padding: '6px 14px', fontFamily: FONT_NUM, fontWeight: 800, fontSize: 24, color: k === 'Star' ? '#F2CC60' : '#C9D1D9'}}>
                  {k} {v}
                </div>
              ))}
            </div>
          </div>
          <Zh size={28} w={600} color="#C9D1D9" style={{marginTop: 22}}>
            Reverse engineer anything with agents, from app behavior down to native binaries.
          </Zh>
          <Zh size={20} w={600} color="#8B949E" style={{marginTop: 18}}>
            github.com/morluto/rea · 原文截图重画
          </Zh>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 30, ...appear(b[1], 0)}}>
          <Zh size={30} w={800} color={C.sub}>原文写：超过</Zh>
          <Big size={88} color={th.accent}>37 万</Big>
          <Zh size={30} w={800} color={C.sub}>GitHub 星</Zh>
        </div>
      </div>

      {/* right: what people do with it + the question */}
      <div style={{position: 'absolute', left: 1010, top: 250, width: 830}}>
        <Zh size={28} w={900} color={th.accent} style={appear(b[2], 0)}>接上强模型，几乎什么软件都能逆向</Zh>
        <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18}}>
          {['重做 Adobe 的产品', '重做 Linux 扩展', '改造热门游戏'].map((t, i) => (
            <Panel key={t} w={560} pad={16} style={{display: 'flex', alignItems: 'center', gap: 14, ...appear(b[3], i * 8)}}>
              <div style={{width: 14, height: 14, borderRadius: 7, background: th.accent}} />
              <Zh size={28} w={800}>{t}</Zh>
              <Zh size={20} w={700} color={C.faint} style={{marginLeft: 'auto'}}>社区</Zh>
            </Panel>
          ))}
        </div>
        <Panel w={830} accent={th.accent} style={{marginTop: 30, ...pop(b[4], 0, 0.9)}}>
          <Zh size={22} w={800} color={C.faint}>作者的问题</Zh>
          <Zh size={36} w={900} style={{marginTop: 6}}>
            换成<span style={{color: th.accent}}>本地开源小模型</span>组队，能做到什么程度？
          </Zh>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, ...appear(b[5], 0)}}>
            <div style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 22, color: '#fff', background: C.sub, borderRadius: 8, padding: '4px 12px'}}>初步实验</div>
            <Zh size={22} w={700} color={C.sub}>preliminary experiments and results</Zh>
          </div>
        </Panel>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Introduction</Src>
    </AbsoluteFill>
  );
};
