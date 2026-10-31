// 开场：2026 年的裁员新闻一个月一条（新闻截图一张张落下，再收进底部的月份格）+ 片名页。
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {A} from './assets';
import {
  Banner,
  Bean,
  Bubble,
  Burst,
  Confetti,
  E,
  F_CJK,
  F_ROUND,
  GSSet,
  K,
  Layer,
  NewsTile,
  Punch,
  seg,
  ShadowCard,
  Stamp,
  Sticker,
  TelopDiv,
  useBeatFrames,
  useKit,
} from './common';

const TILE = {x: 150, y: 150, w: 980, h: 430};
const SLOT_W = 400;
const SLOT_H = 172;
const SLOT_Y = 646;
const slotX = (i: number) => 110 + i * 430;

type Item = {src: string; outlet: string; date: string; month: string; who: string; tag: string; focus: string};
const ITEMS: Item[] = [
  {src: A.newsAmazon, outlet: 'TechCrunch', date: '2026.1.28', month: '1 月', who: '亚马逊', tag: '约 1.6 万', focus: '50% 40%'},
  {src: A.newsBlock, outlet: 'Fortune', date: '2026.2.27', month: '2 月', who: 'Block', tag: '4000+', focus: '0% 40%'},
  {src: A.newsOracle, outlet: 'The Next Web', date: '2026.3.31', month: '3 月', who: '甲骨文', tag: '估计 2–3 万', focus: '50% 30%'},
  {src: A.newsMeta, outlet: 'OPB / NPR', date: '2026.4.23', month: '4 月', who: 'Meta', tag: '约 8000', focus: '50% 9%'},
];

export const Open: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  // tile i is centre stage from its beat until the next tile's beat, then flies into slot i
  const enter = [at[1], at[4], at[6], at[7]];
  const leave = [at[4], at[6], at[7], 1e9];
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="purple" pattern="dots" floor={null} />
        {/* month slots */}
        {ITEMS.map((it, i) => {
          const p = E.back(seg(b[0], 6 + i * 3, 14 + i * 3));
          return (
            <div key={i} style={{position: 'absolute', left: slotX(i), top: SLOT_Y, width: SLOT_W, height: SLOT_H, transform: `scale(${p})`}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 22, border: `6px dashed ${K.white}`, opacity: 0.55}} />
            </div>
          );
        })}
        {/* tiles */}
        {ITEMS.map((it, i) => {
          const fi = f - enter[i];
          if (fi < 0) return null;
          const drop = E.out(seg(fi, 0, 9));
          const moveP = E.inOut(seg(f, leave[i], leave[i] + 12));
          const sc = 1 - (1 - (SLOT_W - 14) / TILE.w) * moveP;
          const x = TILE.x + (slotX(i) - TILE.x) * moveP;
          const y = TILE.y + (SLOT_Y - TILE.y) * moveP + (1 - drop) * -900;
          const wob = moveP < 1 ? Math.sin(fi / 11) * 0.8 * (1 - moveP) : 0;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${sc}) rotate(${-1.5 + wob}deg)`, transformOrigin: '0 0', zIndex: 2}}>
              <NewsTile src={it.src} w={TILE.w} h={TILE.h} outlet={it.outlet} date={it.date} focus={it.focus} />
              {moveP > 0.6 && (
                <div style={{position: 'absolute', right: 30, top: 40, transform: `scale(${1 / Math.max(sc, 0.2)}) rotate(6deg)`, transformOrigin: '100% 0'}}>
                  <Sticker text={it.tag} size={34} col={K.pink} rot={0} />
                </div>
              )}
            </div>
          );
        })}
        {ITEMS.map((it, i) => {
          const p = E.back(seg(b[0], 6 + i * 3, 14 + i * 3));
          return (
            <div key={i} style={{position: 'absolute', left: slotX(i) - 12, top: SLOT_Y - 34, transform: `scale(${p})`, zIndex: 3}}>
              <Sticker text={`${it.month} · ${it.who}`} size={30} col={K.yellow} rot={-5} />
            </div>
          );
        })}
        {/* first beat: a calendar flipping through the months */}
        {b[1] < 6 && <Calendar f={f} out={b[1]} />}
        {/* side notes, one per beat */}
        <div style={{position: 'absolute', left: 1210, top: 170, width: 640, height: 430}}>
          {b[1] >= 0 && b[4] < 0 && (
            <>
              <Stamp f0={at[1] + 8} x={320} y={70} size={104} col={K.yellow}>
                ≈16,000
              </Stamp>
              {b[1] >= 8 && (
                <div style={{position: 'absolute', left: 120, top: 140, fontFamily: F_CJK, fontWeight: 900, fontSize: 38, color: K.white}}>个公司职位</div>
              )}
              {b[2] >= 0 && (
                <div style={{position: 'absolute', left: 40, top: 210, transform: `scale(${E.back(seg(b[2], 0, 9))})`}}>
                  <Sticker text="2025.10 那轮 +14,000" size={32} col={K.white} rot={-3} />
                  <div style={{marginTop: 18, marginLeft: 40}}>
                    <TelopDiv size={88} color={K.yellow} family={F_ROUND}>
                      ≈ 3 万
                    </TelopDiv>
                  </div>
                </div>
              )}
              {b[3] >= 0 && (
                <div style={{position: 'absolute', left: -60, top: 120, transform: `scale(${E.back(seg(b[3], 0, 9))})`, transformOrigin: '30% 100%', zIndex: 5}}>
                  <Bubble w={520} tail="left" size={38}>
                    公司说法：
                    <br />
                    减少层级，少点官僚
                  </Bubble>
                </div>
              )}
            </>
          )}
          {b[4] >= 0 && b[6] < 0 && (
            <>
              {b[4] >= 8 && (
                <Stamp f0={at[4] + 8} x={300} y={60} size={110} col={K.yellow}>
                  4,000+
                </Stamp>
              )}
              <HeadBar f={b[4] - 14} />
              {b[5] >= 0 && (
                <div style={{position: 'absolute', left: -40, top: 250, transform: `scale(${E.back(seg(b[5], 0, 9))})`, transformOrigin: '20% 50%', zIndex: 5}}>
                  <Bubble w={560} tail="left" size={36}>
                    多尔西：原因就是 AI 工具
                    <div style={{fontFamily: F_ROUND, fontWeight: 500, fontSize: 26, marginTop: 6}}>“Intelligence tools have changed what it means to build and run a company”</div>
                  </Bubble>
                </div>
              )}
            </>
          )}
          {b[6] >= 0 && b[7] < 0 && (
            <>
              {b[6] >= 10 && (
                <Stamp f0={at[6] + 10} x={320} y={90} size={110} col={K.yellow}>
                  2–3 万?
                </Stamp>
              )}
              {b[6] >= 40 && (
                <div style={{position: 'absolute', left: 60, top: 200, transform: `scale(${E.back(seg(b[6], 40, 49))})`}}>
                  <Sticker text="公司没公布人数" size={34} col={K.white} rot={-3} />
                  <div style={{height: 22}} />
                  <Sticker text="分析师估计" size={34} col={K.sky} rot={2} />
                </div>
              )}
            </>
          )}
          {b[7] >= 0 && (
            <>
              {b[7] >= 8 && (
                <Stamp f0={at[7] + 8} x={320} y={70} size={110} col={K.yellow}>
                  ≈8,000
                </Stamp>
              )}
              {b[7] >= 30 && (
                <div style={{position: 'absolute', left: 90, top: 170, transform: `scale(${E.back(seg(b[7], 30, 39))})`}}>
                  <Sticker text="一成员工 · 5 月 20 日" size={36} col={K.white} rot={-3} />
                </div>
              )}
            </>
          )}
        </div>
        <Layer>
          {enter.map((e, i) => (
            <Burst key={i} x={TILE.x + TILE.w - 40} y={TILE.y + 30} f0={e + 9} col={K.yellow} size={0.9} />
          ))}
        </Layer>
      </Punch>
      <Banner title="2026 裁员潮" sub="大公司，一个月一条" col={K.red} f0={4} f1={at[1] + 6} />
    </AbsoluteFill>
  );
};

/** Block headcount: a bar that shrinks from 10,000+ to under 6,000. */
const HeadBar: React.FC<{f: number}> = ({f}) => {
  if (f < 0) return null;
  const p = E.inOut(seg(f, 10, 34));
  const w = 520 * (1 - 0.42 * p);
  return (
    <div style={{position: 'absolute', left: 60, top: 150, transform: `scale(${E.back(seg(f, 0, 9))})`, transformOrigin: '0 50%'}}>
      <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 32, color: K.white, marginBottom: 10}}>Block 员工数</div>
      <div style={{position: 'relative', width: 540, height: 70}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 520, height: 64, borderRadius: 18, border: `6px dashed ${K.white}`, opacity: 0.5}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: w, height: 64, borderRadius: 18, background: K.lime, border: `6px solid ${K.ol}`, boxShadow: `8px 8px 0 ${K.ol}`}} />
        <div style={{position: 'absolute', left: 18, top: 6, fontFamily: F_ROUND, fontWeight: 700, fontSize: 40, color: K.ol}}>{p < 0.5 ? '10,000+' : '< 6,000'}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ 片名
export const Title: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const line1 = 'AI 裁员潮里，';
  const line2 = '哪些工作还安全？';
  const glyph = (s: string, base: number, size: number, col: string) =>
    Array.from(s).map((ch, i) => {
      const p = E.back(seg(f, base + i * 1.5, base + i * 1.5 + 7));
      return (
        <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * -60}px) scale(${p})`, whiteSpace: 'pre'}}>
          <TelopDiv size={size} color={col}>
            {ch}
          </TelopDiv>
        </span>
      );
    });
  const rounds = [
    {n: 1, name: '拍板兜底', col: K.orange},
    {n: 2, name: '现场', col: K.blue},
    {n: 3, name: '非你不可', col: K.pink},
  ];
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="yellow" pattern="rays" floor={880} curtain={K.red} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{display: 'flex'}}>{glyph(line1, 2, 120, K.white)}</div>
          <div style={{display: 'flex', marginTop: 10}}>{glyph(line2, 14, 140, K.yellow)}</div>
        </div>
        {rounds.map((r, i) => {
          const p = E.back(seg(b[1], i * 5, i * 5 + 9));
          if (b[1] < i * 5) return null;
          return (
            <div key={r.n} style={{position: 'absolute', left: 250 + i * 520, top: 600, transform: `scale(${p}) rotate(${(i - 1) * 3}deg)`}}>
              <ShadowCard w={400} h={170} col={r.col} r={30} off={12}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 34, color: K.ol, background: K.white, border: `5px solid ${K.ol}`, borderRadius: 24, padding: '0 18px'}}>
                    第 {r.n} 关
                  </div>
                  <TelopDiv size={60} style={{marginTop: 10}}>
                    {r.name}
                  </TelopDiv>
                </div>
              </ShadowCard>
            </div>
          );
        })}
        <Layer>
          <Bean x={150} y={880} scale={0.62} color={K.blue} belly={K.sky} hop={18} phase={0} hey={b[1] >= 0 ? 1 : 0.2} open={b[1] >= 0} />
          <Bean x={1770} y={880} scale={0.62} color={K.green} belly={K.lime} hop={18} phase={0.5} ant="star" hey={b[1] >= 0 ? 1 : 0.2} open={b[1] >= 0} />
          <Confetti f0={at[1]} dur={50} />
        </Layer>
      </Punch>
    </AbsoluteFill>
  );
};

/** Opening beat: a desk calendar flipping 1 → 4 月 with a news bean shouting into a mic. */
const Calendar: React.FC<{f: number; out: number}> = ({f, out}) => {
  const o = out >= 0 ? E.in(seg(out, 0, 6)) : 0;
  const m = 1 + (Math.floor(f / 15) % 4);
  const flip = (f % 15) / 15;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translateY(${o * -900}px)`}}>
      <div style={{position: 'absolute', left: 620, top: 220, transform: `scale(${E.back(seg(f, 0, 10))}) rotate(-3deg)`}}>
        <ShadowCard w={520} h={380} col={K.white} r={30} off={16}>
          <div style={{height: 100, background: K.red, borderBottom: `7px solid ${K.ol}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <TelopDiv size={64} family={F_ROUND}>2026</TelopDiv>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 270, transform: `scaleY(${flip < 0.25 ? 0.6 + 1.6 * flip : 1})`}}>
            <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 180, color: K.ol}}>{m}</div>
            <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 80, color: K.ol, marginLeft: 12, marginTop: 50}}>月</div>
          </div>
        </ShadowCard>
      </div>
      <Layer>
        <Bean x={1430} y={600} scale={1.1} color={K.yellow} belly={K.cream} item="mic" hat="headset" hop={18} open={Math.floor(f / 8) % 2 === 0} hey={0.5} />
        <Bean x={430} y={600} scale={0.9} color={K.pink} belly={K.cream} item="laptop" hop={18} phase={0.5} face="sad" />
      </Layer>
    </div>
  );
};
