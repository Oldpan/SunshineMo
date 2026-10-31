// 被裁的是谁：科技和信息服务公司（裁了不补），坐办公室的白领（电脑里的活）；斯坦福「煤矿里的金丝雀」研究。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {A, LOCX} from './assets';
import {
  At,
  Bean,
  Bubble,
  Burst,
  E,
  F_CJK,
  F_ROUND,
  GSSet,
  K,
  Layer,
  NewsTile,
  Pop,
  Punch,
  Screen,
  seg,
  ShadowCard,
  SO,
  Stamp,
  Sticker,
  Telop,
  TelopDiv,
  Title,
  useBeatFrames,
  useKit,
} from './common';

const FLOOR = 870;

/** Section tag (top-left) for the 被裁的是谁 part. */
const WhoTag: React.FC = () => (
  <div style={{position: 'absolute', left: 46, top: 40, transform: 'rotate(-3deg)'}}>
    <Sticker text="被裁的是谁" size={40} col={K.white} rot={0} />
  </div>
);

/** A door with a sign; beans stream through it (pure function of f). */
const Door: React.FC<{x: number; label: string; col: string; f: number; dir: 1 | -1; closed?: number; n?: number}> = ({x, label, col, f, dir, closed = 0, n = 3}) => {
  const period = 60;
  return (
    <g>
      <rect x={x - 110} y={FLOOR - 330} width={220} height={330} rx={14} fill={K.navy} {...SO} />
      {/* walkers */}
      {closed < 1 &&
        Array.from({length: n}).map((_, i) => {
          const t = (((f + (i * period) / n) % period) + period) % period / period;
          const px = x + dir * (t * 420 - 20);
          return (
            <g key={i} opacity={t < 0.08 ? t / 0.08 : 1}>
              <Bean x={px} y={FLOOR} scale={0.55} color={[K.blue, K.pink, K.green][i % 3]} belly={K.cream} hop={14} phase={i * 0.3} lean={dir * 6} />
            </g>
          );
        })}
      {/* door leaf */}
      <rect x={x - 100} y={FLOOR - 320} width={200 * (closed > 0 ? closed : 0.12)} height={320} rx={8} fill={col} {...SO} strokeWidth={6} />
      <g transform={`translate(${x} ${FLOOR - 380})`}>
        <rect x={-90} y={-44} width={180} height={76} rx={16} fill={col} {...SO} strokeWidth={6} />
        <Telop x={0} y={12} size={48} fill={K.white} sw={7}>
          {label}
        </Telop>
      </g>
    </g>
  );
};

export const Who: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="mint" pattern={ph >= 5 ? 'dots' : 'stripes'} floor={FLOOR} />
        {ph === 0 && (
          <>
            <Title text="被裁的是谁？" f0={4} y={230} size={130} />
            <Layer>
              <Bean x={960} y={FLOOR} scale={1.4} color={K.teal} belly={K.cream} item="magnifier" hop={12} hey={0.5} lean={-4} />
            </Layer>
            <Pop f0={at[0] + 50} x={420} y={560} rot={-5}>
              <Sticker text="特点 ①" size={56} col={K.yellow} />
            </Pop>
            <Pop f0={at[0] + 60} x={1260} y={560} rot={5}>
              <Sticker text="特点 ②" size={56} col={K.pink} />
            </Pop>
          </>
        )}
        {ph >= 1 && ph <= 4 && (
          <Pop f0={at[1]} x={960} y={200}>
            <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
              <Sticker text="① 科技公司 · 信息服务公司" size={52} col={K.yellow} rot={-2} />
            </div>
          </Pop>
        )}
        {ph === 1 && <City f={b[1]} />}
        {(ph === 2 || ph === 3) && (
          <>
            <Layer>
              <Door x={380} label="裁" col={K.red} f={f} dir={1} />
              <Door x={1100} label="招" col={K.green} f={f} dir={1} closed={ph === 3 ? E.out(seg(b[3], 6, 18)) : 0} />
            </Layer>
            <Pop f0={ph === 2 ? at[2] + 6 : at[3]} x={ph === 2 ? 1380 : 1360} y={420} origin="0 50%">
              {ph === 2 ? <Sticker text="别的行业：换岗" size={50} col={K.white} rot={3} /> : <Sticker text="科技公司：很多不补了" size={50} col={K.white} rot={3} />}
            </Pop>
            {ph === 3 && (
              <Stamp f0={at[3] + 20} x={1100} y={600} size={110} col={K.red}>
                不补
              </Stamp>
            )}
          </>
        )}
        {ph === 4 && <At f0={at[4]}><MetaJobs f={b[4]} /></At>}
        {ph >= 5 && ph <= 6 && (
          <Pop f0={at[5]} x={1180} y={190}>
            <Sticker text="② 坐办公室的白领" size={52} col={K.pink} rot={-2} />
          </Pop>
        )}
        {ph === 5 && (
          <>
            <Screen src={A.office} x={170} y={290} w={900} h={520} f0={at[5] + 6} credit={LOCX} label="办公室（1963）" focus={[50, 45]} tilt={-2} />
            <Layer>
              <Bean x={1450} y={FLOOR} scale={1.4} color={K.blue} belly={K.sky} item="laptop" hat="glasses" hop={10} ant="none" />
            </Layer>
          </>
        )}
        {ph === 6 && <At f0={at[6]}><AmazonSplit f={b[6]} /></At>}
        {ph === 7 && (
          <>
            <Layer>
              <Bean x={420} y={FLOOR} scale={1.4} color={K.orange} belly={K.cream} item="mic" hop={10} open={Math.floor(f / 7) % 2 === 0} hey={0.4} name="贾西" />
            </Layer>
            <Pop f0={at[7] + 4} x={640} y={250} origin="0 50%">
              <Bubble w={640} tail="left" size={46}>
                生成式 AI 会让公司的
                <br />
                白领岗位变少
                <div style={{fontFamily: F_CJK, fontWeight: 700, fontSize: 28, marginTop: 10, color: '#555'}}>亚马逊 CEO 贾西 · 2025 年 6 月</div>
              </Bubble>
            </Pop>
            <Layer>
              <DownArrow x={1380} y={760} f={b[7] - 50} />
            </Layer>
          </>
        )}
        {ph === 8 && <At f0={at[8]}><Laptop f={b[8]} /></At>}
        {ph === 9 && <At f0={at[9]}><Target f={b[9]} /></At>}
      </Punch>
      <WhoTag />
    </AbsoluteFill>
  );
};

/** Row of buildings: tech / info-service towers get hit, others stay. */
const City: React.FC<{f: number}> = ({f}) => {
  const bs = [
    {x: 230, h: 300, tech: false, icon: '🏭', name: '制造'},
    {x: 520, h: 420, tech: true, icon: '</>', name: '科技'},
    {x: 810, h: 260, tech: false, icon: '+', name: '医院'},
    {x: 1100, h: 460, tech: true, icon: '@', name: '信息服务'},
    {x: 1390, h: 280, tech: false, icon: '¥', name: '零售'},
    {x: 1680, h: 380, tech: true, icon: 'AI', name: '互联网'},
  ];
  return (
    <Layer>
      {bs.map((bd, i) => {
        const p = E.back(seg(f, i * 4, i * 4 + 10));
        const hit = bd.tech && f >= 40;
        return (
          <g key={i} transform={`translate(${bd.x} ${FLOOR}) scale(1 ${p})`}>
            <rect x={-110} y={-bd.h} width={220} height={bd.h} rx={10} fill={bd.tech ? K.sky : K.cream} {...SO} />
            {Array.from({length: Math.floor(bd.h / 90)}).map((_, r) =>
              [-55, 0, 55].map((wx) => <rect key={`${r}${wx}`} x={wx - 18} y={-bd.h + 30 + r * 80} width={36} height={44} rx={6} fill={hit && (r + wx) % 2 === 0 ? K.ol : K.white} stroke={K.ol} strokeWidth={4} />),
            )}
            <Telop x={0} y={-bd.h - 20} size={34} fill={bd.tech ? K.yellow : K.white} sw={6}>
              {bd.name}
            </Telop>
          </g>
        );
      })}
      {bs.filter((x) => x.tech).map((bd, i) => (
        <g key={i}>
          {f >= 40 + i * 6 && (
            <g transform={`translate(${bd.x} ${FLOOR - bd.h - 90}) scale(${E.back(seg(f, 40 + i * 6, 48 + i * 6))}) rotate(-8)`}>
              <rect x={-60} y={-34} width={120} height={60} rx={14} fill={K.red} {...SO} strokeWidth={6} />
              <Telop x={0} y={12} size={38} fill={K.white} sw={5}>
                裁员
              </Telop>
            </g>
          )}
        </g>
      ))}
    </Layer>
  );
};

/** Meta: 8,000 layoffs + 6,000 open roles closed (job cards stamped). */
const MetaJobs: React.FC<{f: number}> = ({f}) => (
  <>
    <Pop f0={0} x={150} y={330} from="left">
      <ShadowCard w={560} h={280} col={K.white} r={30}>
        <div style={{padding: '26px 36px'}}>
          <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 44, color: K.blue}}>Meta</div>
          <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 44, color: K.ol, marginTop: 6}}>裁员</div>
          <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 96, color: K.red}}>≈8,000</div>
        </div>
      </ShadowCard>
    </Pop>
    <Pop f0={30} x={790} y={300}>
      <Sticker text="＋ 关掉约 6,000 个招聘中的岗位" size={44} col={K.yellow} rot={-2} />
    </Pop>
    {Array.from({length: 6}).map((_, i) => {
      const c = i % 3;
      const r = Math.floor(i / 3);
      const t0 = 40 + i * 5;
      const sf = 70 + i * 6;
      return (
        <Pop key={i} f0={t0} x={800 + c * 330} y={420 + r * 215} rot={(c - 1) * 3}>
          <div style={{position: 'relative'}}>
            <ShadowCard w={290} h={180} col={K.cream} r={20} off={10}>
              <div style={{padding: '16px 22px', fontFamily: F_CJK, fontWeight: 900, color: K.ol}}>
                <div style={{fontSize: 34}}>招聘中</div>
                <div style={{height: 14, width: 200, background: K.gray, borderRadius: 7, marginTop: 14}} />
                <div style={{height: 14, width: 150, background: K.gray, borderRadius: 7, marginTop: 12}} />
              </div>
            </ShadowCard>
            {f >= sf && (
              <div style={{position: 'absolute', left: 40, top: 54, transform: `rotate(-14deg) scale(${1.6 - 0.6 * E.back(seg(f, sf, sf + 6))})`, border: `7px solid ${K.red}`, borderRadius: 14, padding: '0 14px', fontFamily: F_CJK, fontWeight: 900, fontSize: 44, color: K.red, background: 'rgba(255,255,255,0.85)'}}>
                已关闭
              </div>
            )}
          </div>
        </Pop>
      );
    })}
  </>
);

/** Amazon: corporate roles ✕ vs warehouse / delivery ✓. */
const AmazonSplit: React.FC<{f: number}> = ({f}) => (
  <>
    <Layer>
      <rect x={958} y={300} width={6} height={FLOOR - 300} fill={K.ol} />
      <Bean x={500} y={FLOOR} scale={1.25} color={K.blue} belly={K.sky} hat="glasses" item="laptop" hop={10} face={f >= 40 ? 'sad' : null} ant="none" />
      <Bean x={1340} y={FLOOR} scale={1.25} color={K.orange} belly={K.cream} hat="hardhat" item="box" hop={14} phase={0.5} />
      <Bean x={1640} y={FLOOR} scale={0.9} color={K.green} belly={K.cream} hat="cap" item="box" hop={14} phase={0.2} />
    </Layer>
 <Pop f0={6} x={240} y={330}>
      <Sticker text="公司职位（白领）" size={48} col={K.white} rot={-3} />
    </Pop>
    <Pop f0={20} x={1140} y={340}>
      <Sticker text="仓库 · 配送" size={48} col={K.white} rot={3} />
    </Pop>
    {f >= 40 && (
      <Stamp f0={40} x={760} y={480} size={120} col={K.red}>
        ✕ 裁
      </Stamp>
    )}
    {f >= 60 && (
      <Stamp f0={60} x={1220} y={480} size={100} col={K.lime}>
        不是这里
      </Stamp>
    )}
  </>
);

const DownArrow: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
  if (f < 0) return null;
  const p = E.out(seg(f, 0, 20));
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2, 3].map((i) => {
        const h = (260 - i * 55) * E.out(seg(f, i * 4, i * 4 + 12));
        return <rect key={i} x={i * 110} y={-h} width={86} height={h} rx={10} fill={i === 3 ? K.red : K.cream} {...SO} />;
      })}
      <path d={`M -20 -300 L ${-20 + 440 * p} ${-300 + 220 * p}`} stroke={K.red} strokeWidth={16} strokeLinecap="round" />
      <Telop x={200} y={-340} size={44} fill={K.white}>
        白领岗位
      </Telop>
    </g>
  );
};

/** Giant laptop; 文字 / 表格 / 代码 pop out of the screen. */
const Laptop: React.FC<{f: number}> = ({f}) => {
  const items = [
    {t: '文字', icon: '¶', col: K.yellow},
    {t: '表格', icon: '▦', col: K.lime},
    {t: '代码', icon: '</>', col: K.sky},
  ];
  return (
    <>
      <Title text="为什么先轮到白领？" f0={0} y={210} size={84} />
      <Layer>
        <g transform={`translate(760 ${FLOOR - 40})`}>
          <rect x={-300} y={-380} width={600} height={360} rx={24} fill={K.gray} {...SO} />
          <rect x={-260} y={-344} width={520} height={290} rx={12} fill={K.navy} {...SO} strokeWidth={6} />
          <rect x={-360} y={-24} width={720} height={44} rx={16} fill={K.steel} {...SO} />
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={-220} y={-310 + r * 60} width={(160 + ((r * 97) % 200)) * seg(f, 4 + r * 4, 20 + r * 4)} height={22} rx={11} fill={K.lime} />
          ))}
        </g>
        <Bean x={1620} y={FLOOR} scale={1.2} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hey={f >= 30 ? 1 : 0.3} hop={16} open={f >= 30} />
      </Layer>
      {items.map((it, i) => (
        <Pop key={i} f0={40 + i * 14} x={1080 + i * 0} y={330 + i * 150} from="left" origin="0 50%">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: 110, height: 110, borderRadius: 24, background: it.col, border: `7px solid ${K.ol}`, boxShadow: `8px 8px 0 ${K.ol}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F_ROUND, fontWeight: 700, fontSize: 52, color: K.ol}}>{it.icon}</div>
            <div style={{marginLeft: 22}}>
              <TelopDiv size={64}>{it.t}</TelopDiv>
            </div>
          </div>
        </Pop>
      ))}
    </>
  );
};

/** Office bean at a desk; a crosshair closes in on it. */
const Target: React.FC<{f: number}> = ({f}) => {
  const p = E.inOut(seg(f, 10, 50));
  const cx = 960 + (1 - p) * 520;
  const cy = 590 - (1 - p) * 240;
  const r = 300 - 120 * p;
  return (
    <>
      <Layer>
        <rect x={660} y={680} width={600} height={40} rx={10} fill={K.wood} {...SO} />
        <rect x={700} y={720} width={30} height={FLOOR - 720} fill={K.wood} {...SO} strokeWidth={6} />
        <rect x={1190} y={720} width={30} height={FLOOR - 720} fill={K.wood} {...SO} strokeWidth={6} />
        <Bean x={960} y={700} scale={1.15} color={K.blue} belly={K.sky} hat="glasses" ant="none" hop={4} face={f >= 50 ? 'x' : null} />
        <g transform="translate(1080 680)">
          <rect x={-70} y={-90} width={140} height={86} rx={10} fill={K.gray} {...SO} strokeWidth={6} />
        </g>
        <g transform={`translate(${cx} ${cy}) rotate(${f * 1.5})`}>
          <circle r={r} fill="none" stroke={K.red} strokeWidth={14} />
          <circle r={r * 0.55} fill="none" stroke={K.red} strokeWidth={10} />
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x={-8} y={-r - 50} width={16} height={100} fill={K.red} transform={`rotate(${a})`} />
          ))}
        </g>
        <Burst x={960} y={590} f0={52} size={1.4} col={K.red} />
      </Layer>
      <Pop f0={56} x={140} y={240}>
        <Sticker text="整天坐在电脑前处理信息" size={48} col={K.white} rot={-3} />
      </Pop>
      {f >= 70 && (
        <Stamp f0={70} x={1500} y={300} size={96} col={K.yellow}>
          撞在枪口上
        </Stamp>
      )}
    </>
  );
};

// ------------------------------------------------------------------ 斯坦福：煤矿里的金丝雀
export const Canary: React.FC = () => {
  useKit();
  const {b, at} = useBeatFrames();
  const ph = [7, 6, 5, 4, 3, 2, 1, 0].find((k) => b[k] >= 0) ?? 0;
  const tileP = E.inOut(seg(b[1], 0, 12));
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="sky" pattern="stripes" floor={FLOOR} />
        {ph <= 2 && (
          <div
            style={{
              position: 'absolute',
              left: 380 - 250 * tileP,
              top: 230 - 10 * tileP,
              transform: `scale(${(1 - 0.45 * tileP) * E.back(seg(b[0], 0, 10))}) rotate(-2deg)`,
              transformOrigin: '0 0',
            }}
          >
            <NewsTile src={A.newsStanford} w={1160} h={560} outlet="斯坦福数字经济实验室" date="2026.8 修订" focus="0% 0%" />
          </div>
        )}
        {ph >= 1 && ph <= 2 && (
          <>
            <Pop f0={at[1] + 8} x={130} y={620}>
              <Sticker text="AI 最容易接手的职业" size={44} col={K.yellow} rot={-3} />
            </Pop>
            <Pop f0={at[1] + 24} x={180} y={730}>
              <Sticker text="22–25 岁" size={52} col={K.white} rot={2} family={F_CJK} />
            </Pop>
            <Bars f={b[2]} />
          </>
        )}
        {ph === 3 && (
          <Layer>
            <Bean x={600} y={FLOOR} scale={1.35} color={K.blue} belly={K.sky} hat="glasses" item="laptop" hop={14} name="程序员" ant="none" />
            <Bean x={1300} y={FLOOR} scale={1.35} color={K.pink} belly={K.cream} hat="headset" item="none" hop={14} phase={0.5} name="客服" />
          </Layer>
        )}
        {ph === 3 && (
          <Pop f0={at[3] + 4} x={960} y={240}>
            <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
              <Sticker text="这类职业里就有……" size={52} col={K.white} rot={-2} />
            </div>
          </Pop>
        )}
        {ph === 4 && <At f0={at[4]}><NoHire f={b[4]} /></At>}
        {ph === 5 && <At f0={at[5]}><HelperBars f={b[5]} /></At>}
        {ph === 6 && (
          <>
            <Pop f0={at[6]} x={200} y={360} from="left">
              <ShadowCard w={680} h={300} col={K.red} r={34}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <TelopDiv size={80}>容易被替代</TelopDiv>
                </div>
              </ShadowCard>
            </Pop>
            <Pop f0={at[6] + 20} x={1040} y={360} from="right">
              <ShadowCard w={680} h={300} col={K.green} r={34}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <TelopDiv size={80}>不容易被替代</TelopDiv>
                </div>
              </ShadowCard>
            </Pop>
          </>
        )}
        {ph === 7 && <At f0={at[7]}><ThreeDoors f={b[7]} /></At>}
      </Punch>
      <WhoTag />
    </AbsoluteFill>
  );
};

/** Employment index: exposed young workers fall 19% behind their peers. */
const Bars: React.FC<{f: number}> = ({f}) => {
  if (f < 0) return null;
  const pts = (k: number) => {
    const xs = [0, 1, 2, 3, 4, 5, 6];
    return xs.map((i) => {
      const t = i / 6;
      const y = k === 0 ? 100 + 6 * t : 100 - 19 * Math.max(0, (t - 0.25) / 0.75);
      return [1010 + i * 120, 760 - (y - 75) * 16] as const;
    });
  };
  const p = E.inOut(seg(f, 4, 50));
  const path = (k: number) => {
    const ps = pts(k);
    const n = Math.max(1, Math.round(p * 6));
    return ps.slice(0, n + 1).map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  };
  return (
    <>
      <Layer>
        <rect x={960} y={200} width={820} height={610} rx={24} fill={K.white} {...SO} />
        <line x1={1000} y1={770} x2={1760} y2={770} stroke={K.ol} strokeWidth={5} />
        <path d={path(0)} fill="none" stroke={K.teal} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <path d={path(1)} fill="none" stroke={K.red} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <Telop x={1750} y={244} size={30} fill={K.teal} sw={0} anchor="end">
          其他职业的同龄人
        </Telop>
        <Telop x={1500} y={740} size={30} fill={K.red} sw={0} anchor="start">
          AI 最容易接手的职业
        </Telop>
        <Telop x={1000} y={250} size={28} fill={K.ol} sw={0} anchor="start" weight={700}>
          22–25 岁就业人数（相对走势）
        </Telop>
      </Layer>
      {f >= 50 && (
        <Stamp f0={50} x={1600} y={520} size={130} col={K.red}>
          −19%
        </Stamp>
      )}
    </>
  );
};

/** 招聘 sign flips to 暂停; queue of young beans waits. */
const NoHire: React.FC<{f: number}> = ({f}) => {
  const flip = seg(f, 30, 40);
  const sx = Math.abs(Math.cos(flip * Math.PI));
  return (
    <>
      <Layer>
        <rect x={1180} y={FLOOR - 400} width={300} height={400} rx={16} fill={K.navy} {...SO} />
        <rect x={1194} y={FLOOR - 386} width={272} height={386} rx={8} fill={K.red} {...SO} strokeWidth={6} />
        <g transform={`translate(1330 ${FLOOR - 470}) scale(${Math.max(sx, 0.04)} 1)`}>
          <rect x={-140} y={-50} width={280} height={96} rx={18} fill={flip < 0.5 ? K.green : K.gray} {...SO} />
          <Telop x={0} y={18} size={54} fill={K.white} sw={7}>
            {flip < 0.5 ? '招聘中' : '暂停招聘'}
          </Telop>
        </g>
        {[0, 1, 2, 3].map((i) => (
          <Bean key={i} x={1000 - i * 210} y={FLOOR} scale={0.8} color={[K.yellow, K.pink, K.sky, K.lime][i]} belly={K.cream} hop={f >= 40 ? 0 : 12} phase={i * 0.25} face={f >= 40 ? 'sad' : null} ant="sprout" />
        ))}
      </Layer>
      <Pop f0={6} x={150} y={250}>
        <Sticker text="不是被开除" size={50} col={K.white} rot={-3} />
      </Pop>
      {f >= 40 && (
        <Stamp f0={40} x={700} y={420} size={110} col={K.yellow}>
          是不招新人了
        </Stamp>
      )}
    </>
  );
};

/** AI-as-helper jobs: employment flat or rising. */
const HelperBars: React.FC<{f: number}> = ({f}) => (
  <>
    <Pop f0={4} x={140} y={220}>
      <Sticker text="AI 只是帮手的职业" size={54} col={K.lime} rot={-2} />
    </Pop>
    <Layer>
      {[0, 1, 2, 3, 4].map((i) => {
        const h = (200 + i * 50) * E.out(seg(f, 10 + i * 5, 24 + i * 5));
        return <rect key={i} x={360 + i * 170} y={FLOOR - h} width={120} height={h} rx={12} fill={i === 4 ? K.green : K.cream} {...SO} />;
      })}
      <g transform={`translate(1150 ${FLOOR - 480}) scale(${E.back(seg(f, 40, 50))})`}>
        <path d="M 0 -80 L 70 0 L 30 0 L 30 80 L -30 80 L -30 0 L -70 0 Z" fill={K.green} {...SO} />
      </g>
      <Bean x={1520} y={FLOOR} scale={1.2} color={K.orange} belly={K.cream} hey={f >= 40 ? 1 : 0.2} hop={18} open={f >= 40} />
      <g transform={`translate(1680 ${FLOOR}) scale(0.7)`}>
        <Bean x={0} y={0} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hop={18} phase={0.5} item="box" />
      </g>
    </Layer>
    {f >= 40 && (
      <Stamp f0={40} x={1350} y={250} size={80} col={K.yellow}>
        没降，有的还在涨
      </Stamp>
    )}
  </>
);

/** Three closed doors = three rounds. */
const ThreeDoors: React.FC<{f: number}> = ({f}) => {
  const rs = [
    {n: 1, t: '拍板兜底', col: K.orange},
    {n: 2, t: '现场', col: K.blue},
    {n: 3, t: '非你不可', col: K.pink},
  ];
  return (
    <>
      <Title text="分成三类，一类一关" f0={0} y={200} size={80} />
      <Layer>
        {rs.map((r, i) => {
          const x = 460 + i * 500;
          const p = E.back(seg(f, 10 + i * 8, 20 + i * 8));
          return (
            <g key={i} transform={`translate(${x} ${FLOOR}) scale(${p})`}>
              <rect x={-170} y={-500} width={340} height={500} rx={24} fill={r.col} {...SO} />
              <rect x={-130} y={-460} width={260} height={150} rx={18} fill={K.white} {...SO} strokeWidth={6} />
              <Telop x={0} y={-395} size={56} fill={K.ol} sw={0} family={F_ROUND} weight={700}>
                {`ROUND ${r.n}`}
              </Telop>
              <Telop x={0} y={-334} size={44} fill={K.ol} sw={0}>
                {r.t}
              </Telop>
              <circle cx={110} cy={-200} r={18} fill={K.yellow} {...SO} strokeWidth={6} />
            </g>
          );
        })}
        <Bean x={1800} y={FLOOR} scale={0.8} color={K.teal} belly={K.cream} hey={1} hop={20} open />
      </Layer>
    </>
  );
};
