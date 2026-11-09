// 第二个岗位：提示词增强 PE（蜡笔）。pe / cup / perl.
import React from 'react';
import {SceneTitle} from '@atv/lib/kit';
import {CR, CrayonArrow, CrayonCanvas, CrayonCheck, CrayonCircle, CrayonRect, CrayonText, CrayonX} from '@atv/lib/styles';
import {FONT_HAND, FONT_NUM, FONT_ZH} from '@atv/lib/theme';
import {EASE, prog, useBeats} from '@atv/lib/timing';
import {clamp01, Drift, rise, usePopIn} from './common';

const T: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 34, color = CR.ink, style}) => (
  <CrayonText size={size} color={color} style={style}>
    {children}
  </CrayonText>
);
const Zc: React.FC<{children: React.ReactNode; size?: number; color?: string; w?: number; style?: React.CSSProperties}> = ({children, size = 26, color = CR.ink, w = 600, style}) => (
  <span style={{fontFamily: FONT_ZH, fontSize: size, fontWeight: w, color, lineHeight: 1.45, ...style}}>{children}</span>
);
const SrcC: React.FC<{children: React.ReactNode; f?: number}> = ({children, f = 99}) => (
  <div style={{position: 'absolute', left: 96, bottom: 150, opacity: 0.8 * prog(f, 14), whiteSpace: 'nowrap', fontFamily: FONT_ZH, fontSize: 19, fontWeight: 500, color: '#857A6E'}}>{children}</div>
);
const rs = (stroke: string, seed: number, extra: Record<string, unknown> = {}) => ({stroke, strokeWidth: 5, roughness: 1.6, seed, ...extra});

/** Crayon film frame with stars (good shot) or a grey blob (plain shot). */
const Clip: React.FC<{w: number; h: number; good?: boolean; seed?: number}> = ({w, h, good, seed = 1}) => (
  <div style={{position: 'relative', width: w, height: h}}>
    <CrayonCanvas
      w={w}
      h={h}
      style={{left: 0, top: 0}}
      deps={[good]}
      draw={(g) => [
        g.rectangle(4, 4, w - 8, h - 8, rs(CR.ink, seed, {fill: good ? '#FFE7A8' : '#DDD8D0', fillStyle: 'hachure', hachureGap: 9})),
        g.line(4, 20, w - 4, 20, rs(CR.ink, seed + 1, {strokeWidth: 3})),
        g.line(4, h - 20, w - 4, h - 20, rs(CR.ink, seed + 2, {strokeWidth: 3})),
      ]}
    />
    <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 22, textAlign: 'center'}}>
      <T size={good ? (w < 200 ? 30 : 36) : w < 200 ? 18 : 28} color={good ? CR.orange : '#8A847C'}>
        {good ? '★★★' : '平平无奇'}
      </T>
    </div>
  </div>
);

// ------------------------------------------------------------------ pe
export const Pe: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const long = ['日落时的窗台，一只橘猫侧卧，', '尾巴慢慢甩动；镜头从窗外缓慢推近，', '暖色逆光，玻璃上有细小水珠……'];
  return (
    <>
      <SceneTitle kicker="岗位 02 · 提示词增强 PE">把一句话，改成生成器熟悉的写法</SceneTitle>
      <Drift amt={8}>
        {/* forward: user line → PE → long caption */}
        <div style={{position: 'absolute', left: 100, top: 250, ...pop(b[0], 20)}}>
          <CrayonRect w={420} h={200} stroke={CR.blue} seed={3} fill="#E3EEFF" fillStyle="hachure">
            <T size={28} color={CR.blue}>
              用户写的
            </T>
            <div style={{marginTop: 18}}>
              <Zc size={38} w={800}>“一只猫在窗边”</Zc>
            </div>
          </CrayonRect>
        </div>
        <CrayonArrow w={1920} h={1080} from={[540, 350]} to={[700, 350]} p={prog(b[2], 18)} color={CR.ink} />
        <div style={{position: 'absolute', left: 716, top: 278, ...pop(b[2])}}>
          <CrayonRect w={220} h={150} stroke={CR.orange} seed={8} fill="#FFDDBF" fillStyle="solid" pad={0}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <T size={64} color={CR.orange}>
                PE
              </T>
            </div>
          </CrayonRect>
        </div>
        <CrayonArrow w={1920} h={1080} from={[948, 350]} to={[1090, 350]} p={prog(b[2], 18, 10)} color={CR.ink} />
        <div style={{position: 'absolute', left: 1104, top: 232, ...rise(b[2], 14)}}>
          <CrayonRect w={720} h={240} stroke={CR.green} seed={5}>
            <T size={26} color={CR.green}>
              生成器训练时见过的写法
            </T>
            {long.map((l, i) => (
              <div key={i} style={{marginTop: i ? 2 : 10, opacity: prog(b[2], 12, 18 + i * 8)}}>
                <Zc size={25}>{l}</Zc>
              </div>
            ))}
          </CrayonRect>
        </div>
        <div style={{position: 'absolute', left: 726, top: 452, display: 'flex', alignItems: 'center', gap: 10, ...pop(b[3])}}>
          <CrayonCheck size={52} p={prog(b[3], 14)} />
          <T size={38} color={CR.green}>
            意思不变
          </T>
        </div>

        {/* backward: how the training data is made */}
        <div style={{position: 'absolute', left: 100, top: 560, opacity: prog(b[4], 12)}}>
          <T size={32} color={CR.purple}>
            训练数据是倒着造的
          </T>
        </div>
        <div style={{position: 'absolute', left: 100, top: 620, ...pop(b[4])}}>
          <Clip w={300} h={190} good seed={11} />
          <div style={{textAlign: 'center', marginTop: 6}}>
            <Zc size={24} w={700}>拍得好的视频</Zc>
          </div>
        </div>
        <CrayonArrow w={1920} h={1080} from={[420, 715]} to={[520, 715]} p={prog(b[4], 16, 8)} />
        <div style={{position: 'absolute', left: 536, top: 612, ...pop(b[4], 10)}}>
          <CrayonRect w={330} h={206} stroke={CR.green} seed={14} pad={22}>
            <T size={24} color={CR.green}>
              它的 caption
            </T>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{marginTop: 12, height: 10, width: [270, 240, 260, 180][i], background: 'rgba(59,165,92,0.35)', borderRadius: 5}} />
            ))}
          </CrayonRect>
        </div>
        <CrayonArrow w={1920} h={1080} from={[880, 715]} to={[980, 715]} p={prog(b[5], 16)} />
        <div style={{position: 'absolute', left: 996, top: 628, ...pop(b[5], 4)}}>
          <CrayonRect w={380} h={176} stroke={CR.blue} seed={17} fill="#E3EEFF" fillStyle="hachure">
            <T size={24} color={CR.blue}>
              反写：用户可能会怎么说
            </T>
            <div style={{marginTop: 14}}>
              <Zc size={30} w={800}>“猫在窗台晒太阳”</Zc>
            </div>
          </CrayonRect>
        </div>
        {/* warning: random sampling */}
        <div style={{position: 'absolute', left: 1440, top: 560, ...rise(b[6])}}>
          <CrayonRect w={390} h={300} stroke={CR.red} seed={22} pad={22}>
            <T size={28} color={CR.red}>
              要是随便抽
            </T>
            <div style={{display: 'flex', gap: 10, marginTop: 14}}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{opacity: prog(b[7], 10, i * 6)}}>
                  <Clip w={104} h={84} seed={30 + i} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 14, opacity: prog(b[7], 12, 16)}}>
              <Zc size={23} w={700}>
                所有请求，都扩写成
                <br />
                <span style={{color: CR.red}}>平平无奇的画面</span>
              </Zc>
            </div>
          </CrayonRect>
        </div>
        <CrayonCircle w={350} h={230} style={{left: 76, top: 596}} p={prog(b[6], 18, 6)} color={CR.orange} />
      </Drift>
      <SrcC f={b[4]}>原文 §5：从高质量视频的 caption 反向生成用户提示，组成训练对 · 猫的例子为示意</SrcC>
    </>
  );
};

// ------------------------------------------------------------------ cup
/** Stick figure: pose 0 walking, 1 opening door, 2 drinking with an empty hand. */
const Man: React.FC<{pose: number; x: number; y: number; seed?: number}> = ({pose, x, y, seed = 40}) => (
  <CrayonCanvas
    w={160}
    h={240}
    style={{left: x, top: y}}
    deps={[pose]}
    draw={(g) => {
      const s = (k: number) => rs(CR.ink, seed + k, {strokeWidth: 6});
      const parts = [g.circle(80, 36, 50, rs(CR.ink, seed, {strokeWidth: 6, fill: '#FBD9B5', fillStyle: 'solid'})), g.line(80, 62, 80, 150, s(1))];
      if (pose === 0) parts.push(g.line(80, 150, 50, 220, s(2)), g.line(80, 150, 112, 218, s(3)), g.line(80, 88, 44, 130, s(4)), g.line(80, 88, 120, 124, s(5)));
      if (pose === 1) parts.push(g.line(80, 150, 60, 222, s(2)), g.line(80, 150, 102, 222, s(3)), g.line(80, 88, 150, 104, s(4)), g.line(80, 88, 50, 136, s(5)));
      if (pose === 2) parts.push(g.line(80, 150, 60, 222, s(2)), g.line(80, 150, 102, 222, s(3)), g.line(80, 88, 150, 104, s(4)), g.linearPath([[80, 88], [40, 96], [66, 54]], s(5)));
      return parts;
    }}
  />
);
const Panel: React.FC<{x: number; f: number; seed: number; label: string; children: React.ReactNode}> = ({x, f, seed, label, children}) => (
  <div style={{position: 'absolute', left: x, top: 290, ...rise(f)}}>
    <CrayonRect w={540} h={350} seed={seed} pad={0}>
      {children}
    </CrayonRect>
    <div style={{marginTop: 8, textAlign: 'center'}}>
      <Zc size={26} w={700}>{label}</Zc>
    </div>
  </div>
);
export const Cup: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const scores = [
    {t: '忠实', c: CR.blue},
    {t: '合理', c: CR.orange},
    {t: '生动', c: CR.pink},
  ];
  const hot = clamp01(prog(b[1], 14));
  return (
    <>
      <SceneTitle kicker="三项打分">杯子已经放下了，他拿什么喝？</SceneTitle>
      <Drift amt={8}>
        <div style={{position: 'absolute', left: 1220, top: 170, display: 'flex', gap: 18}}>
          {scores.map((s, i) => (
            <div key={s.t} style={{...pop(b[0], i * 6), transform: `${pop(b[0], i * 6).transform} scale(${i === 1 ? 1 + 0.15 * hot : 1 - 0.08 * hot})`, opacity: (pop(b[0], i * 6).opacity as number) * (i === 1 ? 1 : 1 - 0.45 * hot)}}>
              <CrayonRect w={170} h={84} stroke={s.c} seed={50 + i} fill={i === 1 ? '#FFE2C2' : undefined} fillStyle="solid" pad={0}>
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <T size={36} color={s.c}>
                    {s.t}
                  </T>
                </div>
              </CrayonRect>
            </div>
          ))}
        </div>
        <Panel x={100} f={b[1]} seed={61} label="① 把杯子放在桌上，走向门口">
          <CrayonCanvas w={540} h={350} draw={(g) => [g.line(40, 250, 250, 250, rs(CR.brown, 62, {strokeWidth: 8})), g.line(70, 250, 70, 330, rs(CR.brown, 63)), g.line(220, 250, 220, 330, rs(CR.brown, 64)), g.rectangle(130, 196, 44, 54, rs(CR.blue, 65, {fill: '#CFE0FA', fillStyle: 'solid'}))]} />
          <Man pose={0} x={320} y={90} seed={70} />
        </Panel>
        <Panel x={690} f={b[2]} seed={66} label="② 一边开门">
          <CrayonCanvas w={540} h={350} draw={(g) => [g.rectangle(300, 40, 170, 300, rs(CR.brown, 67, {fill: '#E9C9A4', fillStyle: 'hachure', hachureGap: 12})), g.circle(318, 196, 18, rs(CR.ink, 68, {fill: CR.yellow, fillStyle: 'solid'}))]} />
          <Man pose={1} x={160} y={96} seed={72} />
        </Panel>
        <Panel x={1280} f={b[2] + 8} seed={69} label="③ 一边喝了一口">
          <CrayonCanvas w={540} h={350} draw={(g) => [g.rectangle(330, 40, 170, 300, rs(CR.brown, 71, {fill: '#E9C9A4', fillStyle: 'hachure', hachureGap: 12}))]} />
          <Man pose={2} x={170} y={96} seed={74} />
          <CrayonCircle w={130} h={110} style={{left: 175, top: 112}} p={prog(b[3], 16)} />
          <div style={{position: 'absolute', left: 40, top: 40, ...pop(b[3], 6)}}>
            <T size={96} color={CR.red}>
              ?
            </T>
          </div>
        </Panel>
        {/* what the generator has to invent */}
        <div style={{position: 'absolute', left: 100, top: 712, opacity: prog(b[4], 12)}}>
          <T size={34} color={CR.purple}>
            生成器只能自己编：
          </T>
        </div>
        {[
          {t: '凭空再变出一个杯子', f: b[5]},
          {t: '杯子瞬移到手里', f: b[5] + 14},
        ].map((o, i) => (
          <div key={i} style={{position: 'absolute', left: 470 + i * 520, top: 690, ...pop(o.f)}}>
            <CrayonRect w={470} h={110} stroke={CR.red} seed={80 + i} pad={0}>
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Zc size={32} w={800} color={CR.red}>
                  {o.t}
                </Zc>
              </div>
            </CrayonRect>
          </div>
        ))}
      </Drift>
      <SrcC f={b[1]}>原文 §5：合理性检查的例子（画面为示意）</SrcC>
    </>
  );
};

// ------------------------------------------------------------------ perl
const Range: React.FC<{y: number; lo: number; hi: number; mean: number; color: string; label: string; f: number; seed: number}> = ({y, lo, hi, mean, color, label, f, seed}) => {
  const X = (v: number) => 1040 + (v - 1) * 82;
  const p = EASE(prog(f, 22));
  return (
    <>
      <div style={{position: 'absolute', left: 1000, top: y - 56, opacity: prog(f, 10)}}>
        <Zc size={25} w={700}>{label}</Zc>
      </div>
      <CrayonCanvas
        w={1920}
        h={1080}
        style={{left: 0, top: 0}}
        p={p}
        deps={[lo, hi]}
        draw={(g) => [g.rectangle(X(lo), y - 16, X(hi) - X(lo), 32, rs(color, seed, {fill: color, fillStyle: 'hachure', hachureGap: 8}))]}
      />
      <div style={{position: 'absolute', left: X(mean) - 12, top: y - 12, width: 24, height: 24, borderRadius: 12, background: CR.ink, opacity: prog(f, 10, 16)}} />
    </>
  );
};
export const Perl: React.FC = () => {
  const b = useBeats();
  const pop = usePopIn();
  const phaseB = clamp01(prog(b[6], 14));
  const X = (v: number) => 1040 + (v - 1) * 82;
  return (
    <>
      <SceneTitle kicker="先便宜，后真拍">抬高下限，压低上限</SceneTitle>
      <Drift amt={8}>
        {/* left · phase A: two training stages */}
        <div style={{position: 'absolute', left: 100, top: 220, opacity: 1 - phaseB}}>
          <div style={rise(b[0])}>
            <CrayonRect w={800} h={170} stroke={CR.blue} seed={90}>
              <T size={30} color={CR.blue}>
                第一步 · 文本级 RL
              </T>
              <div style={{marginTop: 10}}>
                <Zc size={27}>拿三项分直接训，不用生成视频，</Zc>
                <Zc size={27} w={800} color={CR.green}>
                  很便宜
                </Zc>
              </div>
            </CrayonRect>
          </div>
          <div style={{marginTop: 30, ...rise(b[1])}}>
            <CrayonRect w={800} h={380} stroke={CR.orange} seed={91}>
              <T size={30} color={CR.orange}>
                第二步 · 接上真正的生成器
              </T>
              <div style={{display: 'flex', gap: 12, marginTop: 20}}>
                {[7.8, 5.1, 8.6, 6.4].map((s, i) => (
                  <div key={i} style={{textAlign: 'center', ...pop(b[2], i * 5)}}>
                    <Zc size={20} w={700} color="#7A7068">
                      改写 {i + 1}
                    </Zc>
                    <Clip w={160} h={106} good={s > 7} seed={95 + i} />
                    <div style={{marginTop: 6, fontFamily: FONT_NUM, fontWeight: 900, fontSize: 34, color: s > 7 ? CR.green : CR.red, opacity: prog(b[2], 10, 26 + i * 5)}}>{s.toFixed(1)}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop: 4, opacity: prog(b[2], 12, 40)}}>
                <Zc size={22} w={600} color="#7A7068">
                  各拍一段，用奖励模型打分（分数为示意）
                </Zc>
              </div>
            </CrayonRect>
          </div>
        </div>
        {/* left · phase B: long scripts */}
        <div style={{position: 'absolute', left: 100, top: 230, opacity: phaseB}}>
          <T size={32} color={CR.purple}>
            长剧本：AI 写的常常前后矛盾
          </T>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 24}}>
            {[
              {t: '先修故事', c: CR.blue, f: b[6]},
              {t: '检索 5 条好片的 caption', c: CR.green, f: b[7]},
              {t: '再交给 PE', c: CR.orange, f: b[7] + 12},
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <T size={40}>→</T>}
                <div style={pop(s.f)}>
                  <CrayonRect w={i === 1 ? 280 : 190} h={120} stroke={s.c} seed={110 + i} pad={0}>
                    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, textAlign: 'center'}}>
                      <Zc size={26} w={800} color={s.c}>
                        {s.t}
                      </Zc>
                    </div>
                  </CrayonRect>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{marginTop: 50, opacity: prog(b[8], 12)}}>
            <Zc size={26} w={700}>合理性拿到 4 分以上的比例</Zc>
            {[
              {n: '最初', v: 69.17, c: '#A59C92'},
              {n: '全部加上', v: 91.42, c: CR.green},
            ].map((r, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14}}>
                <div style={{width: 120}}>
                  <Zc size={24} w={700}>{r.n}</Zc>
                </div>
                <div style={{height: 44, width: 560 * (r.v / 100) * EASE(prog(b[8], 22, 6 + i * 10)), background: r.c, borderRadius: 6}} />
                <span style={{fontFamily: FONT_NUM, fontWeight: 900, fontSize: 40, color: r.c, opacity: prog(b[8], 10, 20 + i * 10)}}>{Math.round(r.v)}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* right: quality range chart */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: (b[3] >= 0 ? 1 : 0) * (1 - 0.35 * phaseB)}}>
          <div style={{position: 'absolute', left: 1000, top: 236, opacity: prog(b[3], 12)}}>
            <T size={30} color={CR.ink}>
              每次生成的质量范围
            </T>
            <span style={{marginLeft: 12, fontFamily: FONT_ZH, fontSize: 18, fontWeight: 700, color: '#8A847C', border: '2px solid #C9C0B4', borderRadius: 6, padding: '0 8px'}}>示意</span>
          </div>
          <CrayonCanvas w={1920} h={1080} style={{left: 0, top: 0}} p={prog(b[3], 16)} draw={(g) => [g.line(X(1), 700, X(10), 700, rs(CR.ink, 120, {strokeWidth: 4}))]} />
          {[1, 4, 7, 10].map((v) => (
            <div key={v} style={{position: 'absolute', left: X(v) - 30, width: 60, top: 712, textAlign: 'center', fontFamily: FONT_HAND, fontSize: 26, color: '#7A7068', opacity: prog(b[3], 12)}}>
              {v}
            </div>
          ))}
          <Range y={420} lo={1.6} hi={9.6} mean={5.6} color="#B7AEA4" label="接生成器之前" f={b[3]} seed={121} />
          <Range y={590} lo={4.2} hi={8.1} mean={6.4} color={CR.green} label="接生成器之后" f={b[3] + 14} seed={122} />
          <div style={{position: 'absolute', left: X(1.6), top: 470, ...pop(b[4])}}>
            <T size={28} color={CR.green}>
              烂片少了 ↑
            </T>
          </div>
          <div style={{position: 'absolute', left: X(7.6), top: 470, ...pop(b[4], 10)}}>
            <T size={28} color={CR.red}>
              最惊艳的也少了 ↓
            </T>
          </div>
          <div style={{position: 'absolute', left: 1000, top: 770, ...rise(b[5])}}>
            <CrayonRect w={800} h={110} stroke={CR.red} seed={125} pad={0}>
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Zc size={29} w={800}>
                  PE 学会了躲开 <span style={{color: CR.red}}>复杂动作</span> 和 <span style={{color: CR.red}}>大的运镜</span>
                </Zc>
              </div>
            </CrayonRect>
          </div>
        </div>
      </Drift>
      <SrcC f={b[8]}>原文 §5.3、表 13：先文本级 RL，再接生成器做视频级 RL · 「raises the floor but lowers the ceiling」</SrcC>
    </>
  );
};
export {CrayonX};
