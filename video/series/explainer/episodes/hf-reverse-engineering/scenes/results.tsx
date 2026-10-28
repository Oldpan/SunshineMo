// Parts 3 and 4: the two result tables (team vs solo) and the article's reading of each.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useSceneLeft} from '@atv/lib/timing';
import {
  appear, Big, Brick, C, clamp01, DeepSeekWhale, FONT_MONO, FONT_NUM, FONT_ZH, GREEN, HFLogo, LOGO_FNS, MonoT, Panel, PixelText, PixelWindow, prog, PX,
  QwenMark, SceneTitle, Src, SRC_BLOG, useBeats, usePopIn, useTh, Zh,
} from './common';

// ------------------------------------------------------------------ problem 1 recording (redrawn)
export const LogoRun: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  // bricks turn amber then green from beat 3 to the end of the scene; ~15 of 38 are finished by the lead (table)
  const left = useSceneLeft();
  const t = clamp01(b[3] / Math.max(1, b[3] + left - 40));
  const done = b[3] > 0 ? Math.floor(38 * t) : b[2] > 0 ? 2 : 0;
  const reveal = done / 38;
  const GRID = 16;
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题一">HF logo 动画 · 38 个函数</SceneTitle>
      {/* canvas: the official HF logo, revealed cell by cell as functions are accepted */}
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.92)}}>
        <PixelWindow w={620} h={620} title="还原出的画面" progress={reveal}>
          <div style={{position: 'relative', width: 568, height: 474, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
            <div style={{opacity: b[1] > 0 ? 1 : 0}}>
              <HFLogo size={400} />
            </div>
            {/* cover cells */}
            <div style={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${GRID}, 1fr)`}}>
              {Array.from({length: GRID * GRID * 0.84 | 0}, (_, i) => {
                const order = ((i * 97) % 211) / 211;
                const hidden = order >= reveal;
                return <div key={i} style={{background: hidden ? (Math.floor(i / GRID) + i) % 2 ? '#F2F2F2' : '#FBFBFB' : 'transparent'}} />;
              })}
            </div>
          </div>
        </PixelWindow>
        <div style={{marginTop: 14, ...appear(b[1], 0)}}>
          <PixelText size={24} color={PX.dim}>原文是像素版 HF logo；这里用官方 logo 示意</PixelText>
        </div>
      </div>
      {/* bricks */}
      <div style={{position: 'absolute', left: 760, top: 250, ...appear(b[2], 0)}}>
        <div style={{width: 1076, background: '#11131C', borderRadius: 16, padding: 20}}>
          <div style={{display: 'flex', gap: 22, marginBottom: 14}}>
            {['lead', 'worker-1', 'worker-2', 'worker-3', 'worker-4'].map((w, i) => (
              <div key={w} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                {i === 0 ? <DeepSeekWhale size={30} bob={false} /> : <QwenMark size={26} />}
                <span style={{fontFamily: FONT_MONO, fontSize: 18, color: '#9AA0B8'}}>{w}</span>
                <span style={{fontFamily: FONT_MONO, fontSize: 18, color: b[3] > 0 && done < 38 && (frame + i * 9) % 50 < 34 ? '#F6B21A' : '#5C6178'}}>{b[3] > 0 && done < 38 ? 'busy' : 'idle'}</span>
              </div>
            ))}
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8}}>
            {LOGO_FNS.map((name, i) => {
              const order = (i * 23) % 38;
              const state = order < done ? 2 : order < done + 3 && b[3] > 0 ? 1 : 0;
              return <Brick key={name} name={name} state={state as 0 | 1 | 2} w={252} />;
            })}
          </div>
          <div style={{display: 'flex', marginTop: 14}}>
            <span style={{fontFamily: FONT_MONO, fontSize: 20, color: '#9AA0B8'}}>{done}/38 functions rebuilt</span>
          </div>
        </div>
      </div>
      <Src style={{position: 'absolute', left: 760, top: 830, opacity: prog(frame, 12, 20)}}>原文录屏「REbuild: the Hugging Face logo …」重画；砖块变绿的顺序为示意</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ comparison table (both problems)
type Row = {k: string; team: string; solo: string; beat: number; hot?: 'team' | 'solo' | 'both'};

const Table: React.FC<{rows: Row[]; title: string; total: number}> = ({rows, title}) => {
  const th = useTh();
  const b = useBeats();
  return (
    <Panel w={1000} pad={0} style={{overflow: 'hidden'}}>
      <div style={{display: 'grid', gridTemplateColumns: '300px 1fr 1fr', background: th.accentSoft, padding: '16px 24px'}}>
        <Zh size={24} w={900} color={C.sub}>{title}</Zh>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <DeepSeekWhale size={36} bob={false} />
          <Zh size={26} w={900}>团队</Zh>
          <span style={{display: 'flex'}}>
            {[0, 1, 2, 3].map((i) => (
              <QwenMark key={i} size={24} style={{marginLeft: i ? -6 : 4}} />
            ))}
          </span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <DeepSeekWhale size={36} bob={false} />
          <Zh size={26} w={900}>主管单干</Zh>
        </div>
      </div>
      {rows.map((r, i) => {
        const f = b[r.beat];
        return (
          <div key={r.k} style={{display: 'grid', gridTemplateColumns: '300px 1fr 1fr', padding: '14px 24px', borderTop: `2px solid ${C.line}`, background: f > 0 && f < 9999 ? '#fff' : '#fff', ...appear(f, i % 2 ? 4 : 0)}}>
            <Zh size={26} w={800} color={C.sub}>{r.k}</Zh>
            {(['team', 'solo'] as const).map((side) => {
              const hot = r.hot === side || r.hot === 'both';
              return (
                <div key={side} style={{fontFamily: FONT_NUM, fontWeight: 800, fontSize: 30, color: hot ? th.accent : C.ink}}>
                  {side === 'team' ? r.team : r.solo}
                </div>
              );
            })}
          </div>
        );
      })}
    </Panel>
  );
};

const Bars: React.FC<{label: string; team: number; solo: number; unit: string; fmt: (v: number) => string; f: number; note?: string}> = ({label, team, solo, unit, fmt, f, note}) => {
  const th = useTh();
  const max = Math.max(team, solo);
  const p = prog(f, 24);
  return (
    <div style={{...appear(f, 0)}}>
      <Zh size={26} w={900}>{label}</Zh>
      {[
        ['团队', team, th.accent],
        ['单干', solo, '#4D6BFE'],
      ].map(([k, v, col]) => (
        <div key={k as string} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10}}>
          <Zh size={22} w={800} color={C.sub} style={{width: 56}}>{k}</Zh>
          <div style={{height: 34, width: 380 * ((v as number) / max) * p, background: col as string, borderRadius: 8}} />
          <div style={{fontFamily: FONT_NUM, fontWeight: 900, fontSize: 30, color: col as string, opacity: p, whiteSpace: 'nowrap'}}>
            {fmt(v as number)}
            <span style={{fontSize: 20, marginLeft: 4}}>{unit}</span>
          </div>
        </div>
      ))}
      {note && <Zh size={20} w={700} color={C.faint} style={{marginTop: 6}}>{note}</Zh>}
    </div>
  );
};

export const LogoTable: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const rows: Row[] = [
    {k: '通过的函数', team: '38 / 38', solo: '38 / 38', beat: 1, hot: 'both'},
    {k: '退回主管', team: '15', solo: '—', beat: 2, hot: 'team'},
    {k: '主管改 harness', team: '0 次', solo: '—', beat: 3},
    {k: '成本', team: '$2.97', solo: '$0.87', beat: 4, hot: 'solo'},
    {k: '活跃时间', team: '86 分钟（2 次启动）', solo: '14 分钟', beat: 5, hot: 'solo'},
    {k: '大模型 token 入/出', team: '7.79M / 0.21M', solo: '2.53M / 0.10M', beat: 6},
    {k: '小模型 token 入/出', team: '3.56M / 0.21M', solo: '—', beat: 6},
  ];
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题一 · 结果">团队 vs 主管单干</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 236, ...appear(b[0], 0)}}>
        <Table rows={rows} title="HF logo · 38 个函数" total={7} />
      </div>
      <div style={{position: 'absolute', left: 1130, top: 250, width: 700, display: 'flex', flexDirection: 'column', gap: 34}}>
        <Bars label="成本" team={2.97} solo={0.87} unit="美元" fmt={(v) => `$${v.toFixed(2)}`} f={b[4]} />
        <Bars label="时间" team={86} solo={14} unit="分钟" fmt={(v) => `${v}`} f={b[5]} />
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 150, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Problem 1 结果表（原表单干成本后有脚注标记 ⁴，原文未给脚注内容）</Src>
    </AbsoluteFill>
  );
};

export const LogoWhy: React.FC = () => {
  const th = useTh();
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题一 · 原文怎么说">更慢，也更贵</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.9)}}>
        <Panel w={820} h={270} accent={th.accent}>
          <Zh size={22} w={800} color={C.faint}>原文</Zh>
          <Zh size={34} w={800} style={{marginTop: 8, fontStyle: 'italic'}}>“Overall, the pipeline is slower and more expensive.”</Zh>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, ...appear(b[1], 0)}}>
            <Big size={56} color={th.accent}>15</Big>
            <Zh size={26} w={800} color={C.sub}>个函数：工人自己判断太难，退回主管</Zh>
          </div>
        </Panel>
      </div>
      <div style={{position: 'absolute', left: 84, top: 610, display: 'flex', gap: 24}}>
        {[
          {t: '题太简单', d: '主管一口气就能自己做完', beat: 3},
          {t: '函数太难', d: '对小模型来说，可能拆得不够细', beat: 4},
        ].map((c, i) => (
          <div key={c.t} style={pop(b[c.beat], 0, 0.85)}>
            <Panel w={398} h={240}>
              <Zh size={22} w={800} color={th.accent}>作者的猜测 {i + 1}</Zh>
              <Zh size={40} w={900} style={{marginTop: 6}}>{c.t}</Zh>
              <Zh size={26} w={700} color={C.sub} style={{marginTop: 8}}>{c.d}</Zh>
            </Panel>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 84, top: 550, ...appear(b[2], 0)}}>
        <Zh size={26} w={900} color={C.sub}>为什么？（perhaps…）</Zh>
      </div>
      {/* next: scale up */}
      <div style={{position: 'absolute', left: 1000, top: 250, width: 840, ...pop(b[5], 0, 0.85)}}>
        <Panel w={840} h={600} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          <Zh size={34} w={900}>函数再多一点呢？</Zh>
          <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
            <Big size={110} color={C.faint}>38</Big>
            <Big size={70} color={C.faint}>→</Big>
            <Big size={150} color={th.accent} style={{transform: `scale(${1 + Math.sin(frame / 18) * 0.02})`}}>56</Big>
          </div>
          <Zh size={28} w={800} color={C.sub}>第二道题：太空射击游戏</Zh>
        </Panel>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Problem 1</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ problem 2
export const ShooterTable: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const th = useTh();
  const rows: Row[] = [
    {k: '通过的函数', team: '56 / 56', solo: '56 / 56', beat: 1, hot: 'both'},
    {k: '退回主管', team: '20', solo: '—', beat: 2, hot: 'team'},
    {k: '主管改 harness', team: '3 次', solo: '—', beat: 2, hot: 'team'},
    {k: '成本', team: '$3.60', solo: '$3.28', beat: 4},
    {k: '活跃时间', team: '100 分钟（2 次启动）', solo: '54 分钟（4 次启动）', beat: 5},
    {k: '大模型 token 入/出', team: '8.96M / 0.30M', solo: '9.69M / 0.31M', beat: 6},
    {k: '小模型 token 入/出', team: '4.94M / 0.37M', solo: '—', beat: 6},
  ];
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题二 · 结果">太空射击 · 56 个函数</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 236, ...appear(b[0], 0)}}>
        <Table rows={rows} title="太空射击 · 56 个函数" total={7} />
      </div>
      <div style={{position: 'absolute', left: 1130, top: 250, width: 700, display: 'flex', flexDirection: 'column', gap: 30}}>
        <div style={{...appear(b[3], 0)}}>
          <Panel w={700} pad={18} accent={th.accent}>
            <Zh size={24} w={900}>3 次 harness 改动</Zh>
            <div style={{display: 'flex', gap: 12, marginTop: 10}}>
              {['提示词 v1', '提示词 v2', 'lookup 工具'].map((t, i) => (
                <div key={t} style={{fontFamily: FONT_ZH, fontWeight: 900, fontSize: 24, color: '#fff', background: i < 2 ? th.accent : '#1E1E24', borderRadius: 10, padding: '6px 14px', ...appear(b[3], i * 8)}}>{t}</div>
              ))}
            </div>
          </Panel>
        </div>
        <Bars label="成本" team={3.6} solo={3.28} unit="美元" fmt={(v) => `$${v.toFixed(2)}`} f={b[4]} />
        <Bars label="时间" team={100} solo={54} unit="分钟" fmt={(v) => `${v}`} f={b[5]} note="单干：4 次启动；团队：2 次启动" />
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 150, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Problem 2 结果表</Src>
    </AbsoluteFill>
  );
};

export const ShooterWhy: React.FC = () => {
  const th = useTh();
  const b = useBeats();
  const pop = usePopIn();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneTitle kicker="题二 · 原文怎么说">成本开始打平</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 250, display: 'flex', flexDirection: 'column', gap: 24}}>
        {[
          {q: '“In absolute cost, the pipeline now starts to tie with the solo run.”', z: '按绝对成本，开始和单干打平', beat: 0},
          {q: '“A solo run struggles handling this big task in a single long run.”', z: '单干很难一次跑完这么大的任务', beat: 1},
          {q: '“…scaling the number of functions to rewrite, highlights the advantage of using such pipeline.”', z: '函数一多，流水线的优势显出来', beat: 2},
        ].map((c) => (
          <div key={c.beat} style={pop(b[c.beat], 0, 0.9)}>
            <Panel w={1000} pad={20} accent={th.accent}>
              <Zh size={24} w={700} color={C.sub} style={{fontStyle: 'italic'}}>{c.q}</Zh>
              <Zh size={36} w={900} style={{marginTop: 6}}>{c.z}</Zh>
            </Panel>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 1140, top: 250, ...pop(b[3], 0, 0.85)}}>
        <Panel w={700} h={520} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22}}>
          <Zh size={30} w={900}>但时间上，团队还是更慢</Zh>
          {[
            ['团队', 100, th.accent],
            ['单干', 54, '#4D6BFE'],
          ].map(([k, v, col]) => (
            <div key={k as string} style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Zh size={26} w={800} color={C.sub} style={{width: 70}}>{k}</Zh>
              <div style={{height: 50, width: 3.4 * (v as number) * prog(b[3], 24), background: col as string, borderRadius: 10}} />
              <Big size={44} color={col as string} style={{whiteSpace: 'nowrap'}}>{v}<span style={{fontSize: 22}}> 分钟</span></Big>
            </div>
          ))}
          <Zh size={22} w={700} color={C.faint}>原文表格的活跃时间</Zh>
        </Panel>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Problem 2</Src>
    </AbsoluteFill>
  );
};

