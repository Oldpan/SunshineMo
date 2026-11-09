// Swiss grid-type scenes: open, h4 (requests vs requirements), h10 (decide what not to build).
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Abs, COL, Drift, Label, lerp, Mono, prog, rise, Sans, Serif, slideX, SwissBg, useSerif} from './common';

const Big: React.FC<{f: number; children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({f, children, size = 140, color = COL.ink, style}) => {
  const p = prog(f, 20);
  return (
    <div style={{overflow: 'hidden', ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 100}%)`, opacity: p, fontFamily: '"Noto Sans SC", sans-serif', fontWeight: 900, fontSize: size, lineHeight: 1.08, letterSpacing: -3, color}}>
        {children}
      </div>
    </div>
  );
};

export const Open: React.FC = () => {
  useSerif();
  const b = useBeats();
  return (
    <>
      <SwissBg band={{x: 1500, w: 280, f: b[1]}} />
      <Drift zoom={0.02} dy={-6}>
        <Abs x={156} y={110}>
          <div style={rise(b[0], 12)}>
            <Label color={COL.ink}>CODING AGENTS · 2026.11</Label>
          </div>
        </Abs>
        <Abs x={150} y={170} w={1300}>
          <Big f={b[0]}>天天用 AI</Big>
          <Big f={b[0] - 6}>写代码的人</Big>
          <Big f={b[0] - 22} color={COL.red}>
            已经是经理了
          </Big>
        </Abs>
        {/* author card inside the red band */}
        <Abs x={1530} y={560} w={230}>
          <div style={rise(b[1], 18)}>
            <Sans size={30} w={900} color="#fff">
              Addy Osmani
            </Sans>
            <div style={{height: 3, width: 60, background: '#fff', margin: '14px 0'}} />
            <Sans size={24} w={500} color="#fff">
              X 长文
            </Sans>
          </div>
          <div style={{...rise(b[2], 18), marginTop: 26}}>
            <Sans size={24} w={700} color="#fff">
              Anthropic
            </Sans>
            <br />
            <Sans size={24} w={500} color="#fff">
              Claude Code
            </Sans>
          </div>
        </Abs>
        <Abs x={156} y={655} w={1280}>
          <div style={rise(b[3], 20)}>
            <Serif size={46} w={600} color={COL.ink} style={{fontStyle: 'italic'}}>
              “Your coding agents made you a manager”
            </Serif>
          </div>
        </Abs>
        <Abs x={156} y={760} w={1300} style={{display: 'flex', gap: 80, alignItems: 'baseline'}}>
          <div style={rise(b[4], 20)}>
            <Sans size={96} w={900} color={COL.red}>
              10
            </Sans>
            <Sans size={34} w={700}>
              {' '}个习惯
            </Sans>
          </div>
          <div style={rise(b[4] - 14, 20)}>
            <Sans size={96} w={900} color={COL.ink}>
              7
            </Sans>
            <Sans size={34} w={700}>
              {' '}处不成立
            </Sans>
          </div>
        </Abs>
      </Drift>
    </>
  );
};

/** Habit header in the swiss look. */
const SwHead: React.FC<{n: string; title: string; f: number}> = ({n, title, f}) => (
  <>
    <Abs x={156} y={92}>
      <div style={rise(f, 10)}>
        <Label color={COL.red}>{`HABIT ${n} / 10`}</Label>
      </div>
    </Abs>
    <Abs x={150} y={136} w={1620}>
      <Big f={f} size={72} style={{letterSpacing: -1}}>
        {title}
      </Big>
    </Abs>
  </>
);

export const H4: React.FC = () => {
  const b = useBeats();
  // beats 1-2 Grove; 3 request; 4 requirement; 5-6 default/hard; 7 hook upgrade; 8 delete; 9 old habits; 10 punchline
  const grove = 1 - prog(b[3], 14);
  return (
    <>
      <SwissBg />
      <Drift zoom={0.02}>
        <SwHead n="04" title="默认让它做主，只锁死不能弯的" f={b[0]} />
        {/* Grove card, gives way to the two columns */}
        <Abs x={156} y={300} w={1500} style={{opacity: grove}}>
          <div style={rise(b[1], 20)}>
            <Label color={COL.ink}>ANDY GROVE · HIGH OUTPUT MANAGEMENT</Label>
            <div style={{marginTop: 18}}>
              <Sans size={88} w={900}>任务相关成熟度</Sans>
            </div>
          </div>
          <div style={{...rise(b[2], 20), marginTop: 30}}>
            <Sans size={36} w={500} color="#444">
              管多严，看他在<b style={{color: COL.red}}>这件事</b>上的表现，不看他整体多强
            </Sans>
          </div>
        </Abs>
        {/* request vs requirement */}
        <Abs x={156} y={290} w={760} style={rise(b[3], 24)}>
          <Sans size={170} w={900} style={{letterSpacing: -6, opacity: lerp(1, 0.9, prog(b[4], 10))}}>
            请求
          </Sans>
          <div style={{marginTop: 6}}>
            <Mono size={28} color="#333">
              提示词 · CLAUDE.md · skill
            </Mono>
          </div>
          <div style={{marginTop: 10}}>
            <Sans size={32} w={700}>模型会考虑，自己决定</Sans>
          </div>
        </Abs>
        <Abs x={1000} y={290} w={800} style={rise(b[4], 24)}>
          <Sans size={170} w={900} color={COL.red} style={{letterSpacing: -6}}>
            要求
          </Sans>
          <div style={{marginTop: 6}}>
            <Mono size={28} color="#333">
              hook · deny 规则 · managed settings
            </Mono>
          </div>
          <div style={{marginTop: 10}}>
            <Sans size={32} w={700}>一定执行</Sans>
          </div>
        </Abs>
        {/* rules row */}
        <Abs x={156} y={660} w={1640} style={{display: 'flex', gap: 24}}>
          {[
            {f: b[5], t: '大多数时候：让它判断', c: COL.ink},
            {f: b[6], t: '硬性要求才强制：永远不改生成的客户端', c: COL.red},
          ].map((r, i) => (
            <div key={i} style={{...slideX(r.f, 30), borderTop: `6px solid ${r.c}`, paddingTop: 12, flex: i ? 1.4 : 1}}>
              <Sans size={30} w={700} color={r.c}>
                {r.t}
              </Sans>
            </div>
          ))}
        </Abs>
        <Abs x={156} y={740} w={1640} style={{display: 'flex', gap: 24}}>
          <div style={{...slideX(b[7], 30), flex: 1}}>
            <Sans size={28} w={500}>
              CLAUDE.md 强调了还没用 → <b>改成 hook</b>
            </Sans>
          </div>
          <div style={{...slideX(b[8], 30), flex: 1.4}}>
            <Sans size={28} w={500}>
              hook 里只是偏好 → <b>删掉</b>
            </Sans>
          </div>
        </Abs>
        <Abs x={156} y={800} w={1640} style={rise(b[9], 14)}>
          <Mono size={28} color="#4A4A4A" style={{textDecorationThickness: 2, textDecoration: b[9] > 20 ? 'line-through' : 'none'}}>
            ALL CAPS 规则 · "think harder" · "don't be lazy"
          </Mono>
        </Abs>
        <Abs x={150} y={848} w={1640}>
          <div style={{height: 8, background: COL.red, transformOrigin: 'left', transform: `scaleX(${prog(b[10], 18)})`, width: 1620}} />
        </Abs>
        <Abs x={156} y={862} w={1600} style={rise(b[10] - 6, 16)}>
          <Sans size={50} w={900} color={COL.red}>
            过度流程 = 新的微观管理
          </Sans>
        </Abs>
      </Drift>
    </>
  );
};

export const H10: React.FC = () => {
  const b = useBeats();
  const no = prog(b[1], 24);
  return (
    <>
      <SwissBg />
      <Drift zoom={0.025}>
        <SwHead n="10" title="决定不做什么" f={b[0]} />
        <Abs x={120} y={250} style={{opacity: no, transform: `translateY(${(1 - no) * 60}px)`}}>
          <div style={{fontFamily: '"Montserrat", "Noto Sans SC", sans-serif', fontWeight: 900, fontSize: 400, lineHeight: 0.9, letterSpacing: -24, color: COL.red}}>NO</div>
          <div style={{marginTop: 10}}>
            <Sans size={34} w={700}>经理最重要的一个字：「不」</Sans>
          </div>
        </Abs>
        <Abs x={980} y={290} w={820}>
          <div style={rise(b[2], 18)}>
            <Label color={COL.ink}>开工几乎免费</Label>
            <div style={{marginTop: 8}}>
              <Sans size={36} w={700}>午饭前，任何点子都能变成一个 PR</Sans>
            </div>
          </div>
          <div style={{...rise(b[3], 18), marginTop: 26}}>
            <Label color={COL.red}>但每个 PR 都要</Label>
            <div style={{marginTop: 8, display: 'flex', gap: 14}}>
              {['有人审', '安全检查', '长期维护'].map((t, i) => (
                <span key={t} style={{...rise(b[3] - 6 - i * 5, 12), border: `3px solid ${COL.ink}`, padding: '6px 16px'}}>
                  <Sans size={30} w={700}>
                    {t}
                  </Sans>
                </span>
              ))}
            </div>
          </div>
          <div style={{...rise(b[4], 18), marginTop: 26}}>
            <Sans size={40} w={900}>
              稀缺的是 <span style={{color: COL.red}}>评审和验证</span>
            </Sans>
          </div>
        </Abs>
        <Abs x={156} y={700} w={1640} style={{display: 'flex', gap: 70}}>
          {['谁要的？', '怎么算成功？', '什么时候停？'].map((t, i) => (
            <div key={t} style={rise(b[5] - 8 - i * 12, 18)}>
              <Sans size={50} w={900}>
                {t}
              </Sans>
            </div>
          ))}
        </Abs>
        <Abs x={156} y={812} w={1640} style={rise(b[6], 16)}>
          <Sans size={36} w={500}>
            不再是「能不能做」，而是<b style={{color: COL.red}}>「该不该做」</b>
          </Sans>
        </Abs>
      </Drift>
    </>
  );
};
