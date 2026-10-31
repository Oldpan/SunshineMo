// 第一关 · 拍板兜底：拍板（调动钱、人、资源；最后拍板的目前还是人）和兜底（出了事有人负责；Mercy；盯着 AI 的人）。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {A, LOC} from './assets';
import {
  At,
  Bean,
  Bubble,
  Burst,
  Chip,
  Confetti,
  E,
  F_CJK,
  F_ROUND,
  GSSet,
  hitSq,
  Judge,
  K,
  Layer,
  Pop,
  Punch,
  RoundCard,
  RoundTag,
  Screen,
  seg,
  ShadowCard,
  SO,
  Stamp,
  Sticker,
  Telop,
  TelopDiv,
  useBeatFrames,
  useKit,
} from './common';

const COL = K.orange;
const FLOOR = 870;
export const R1Tag = () => <RoundTag n={1} name="拍板兜底" col={COL} />;

// ------------------------------------------------------------------ round card
export const R1Card: React.FC = () => {
  useKit();
  const {at, dur} = useBeatFrames();
  return (
    <AbsoluteFill>
      <Punch hits={[...at, 4]}>
        <GSSet set="tangerine" pattern="rays" floor={FLOOR} curtain={K.red} />
        <Layer>
          <Bean x={190} y={FLOOR} scale={0.75} color={K.blue} belly={K.sky} hop={20} hey={1} open />
          <Bean x={1730} y={FLOOR} scale={0.75} color={K.green} belly={K.lime} ant="star" hop={20} phase={0.5} hey={1} open />
        </Layer>
        <RoundCard num={1} name="拍板兜底" tag="能拍板的，和出了事能兜底的" col={COL} f0={2} f1={dur + 20} />
        <Layer>
          <Burst x={1420} y={210} f0={14} size={1.1} />
          <Confetti f0={10} dur={40} n={60} seed={11} />
        </Layer>
      </Punch>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 拍板
/** Wooden desk with a red 拍板 block on top; slapped at each `hits` frame. */
const Desk: React.FC<{x: number; y: number; hits: number[]; f: number}> = ({x, y, hits, f}) => {
  let sq = 1;
  for (const h of hits) sq = Math.min(sq, hitSq(f, h, 0.25));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-250} y={-150} width={500} height={150} rx={14} fill={K.wood} {...SO} />
      <rect x={-250} y={-176} width={500} height={34} rx={10} fill="#E0A66C" {...SO} />
      <rect x={-140} y={-110} width={280} height={70} rx={14} fill={K.cream} {...SO} strokeWidth={6} />
      <Telop x={0} y={-58} size={44} fill={K.red} sw={0} family={F_CJK}>
        决策席
      </Telop>
      <g transform={`translate(150 -176) scale(${1 / Math.sqrt(sq)} ${sq})`}>
        <rect x={-52} y={-40} width={104} height={40} rx={10} fill={K.red} {...SO} strokeWidth={6} />
      </g>
    </g>
  );
};

export const R1Power: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const podium = b[4] >= 0;
  const slaps = [at[0] + 18, at[1] + 40, at[3] + 30];
  const nod = b[1] >= 30 && b[1] < 60 ? Math.sin((b[1] - 30) / 3) * 6 : 0;
  const bossX = 470;
  const chips = [
    {icon: '¥', label: '钱', col: K.yellow, x: 160},
    {icon: '人', label: '人', col: K.sky, x: 390},
    {icon: '▣', label: '资源', col: K.lime, x: 620},
  ];
  return (
    <AbsoluteFill>
      <Punch hits={[...at, ...slaps]}>
        <GSSet set="tangerine" pattern="stripes" floor={FLOOR} />
        {!podium && (
          <>
            {chips.map((c, i) => (
              <Pop key={i} f0={at[0] + 30 + i * 6} f1={at[1]} x={c.x} y={235} from="drop">
                <Chip icon={c.icon} label={c.label} col={c.col} size={0.85} />
              </Pop>
            ))}
            <Layer>
              {/* boss behind the desk */}
              <Bean
                x={bossX}
                y={FLOOR - 100}
                scale={1.3}
                color={K.orange}
                belly={K.cream}
                ant={b[3] >= 0 ? 'none' : 'star'}
                hat={b[3] >= 12 ? 'crown' : 'none'}
                hop={8}
                face={b[1] >= 30 && b[1] < 70 ? 'up' : null}
                lean={nod}
                hey={slaps.some((s) => f >= s - 6 && f < s + 4) ? 0.8 : 0.15}
              />
              <Desk x={bossX} y={FLOOR + 6} hits={slaps} f={f} />
              {slaps.map((s, i) => (
                <g key={i}>
                  <Burst x={bossX + 150} y={FLOOR - 200} f0={s} size={0.6} col={K.white} />
                </g>
              ))}
              {/* bots doing the work */}
              {b[1] >= 0 &&
                [0, 1].map((i) => {
                  const fx = 1160 + i * 330;
                  const p = E.out(seg(b[1], i * 5, i * 5 + 12));
                  return (
                    <g key={i} transform={`translate(${(1 - p) * 900} 0)`}>
                      <Bean
                        x={fx}
                        y={FLOOR}
                        scale={0.95}
                        kind="bot"
                        color={K.steel}
                        belly={K.sky}
                        ant={b[2] >= 0 ? 'bolt' : 'ball'}
                        item={i ? 'laptop' : 'box'}
                        hop={16}
                        phase={i * 0.5}
                        hey={0.3}
                        lean={0}
                      />
                    </g>
                  );
                })}
            </Layer>
            {b[1] >= 30 && (
              <Stamp f0={at[1] + 30} x={bossX} y={300} size={92} col={K.yellow} rot={-6}>
                ✓ 你点头
              </Stamp>
            )}
            {b[2] >= 0 &&
              [0, 1].map((i) => (
                <Pop key={i} f0={at[2] + 8 + i * 5} f1={at[3]} x={1050 + i * 330} y={430} rot={i ? 5 : -5}>
                  <Sticker text="人造的工具" size={36} col={K.white} />
                </Pop>
              ))}
            {b[3] >= 0 && (
              <Pop f0={at[3] + 12} x={680} y={250} origin="0 50%">
                <Bubble w={460} tail="none" size={40}>
                  决定权：
                  <br />
                  目前还在人手里
                </Bubble>
              </Pop>
            )}
            {b[2] >= 0 && <Layer><Burst x={1300} y={480} f0={at[2] + 8} /></Layer>}
          </>
        )}
        {podium && <At f0={at[4]}><Podium f={b[4]} /></At>}
      </Punch>
      <R1Tag />
    </AbsoluteFill>
  );
};

/** 老板 / 管理者 / 法官 on three podiums. */
const Podium: React.FC<{f: number}> = ({f}) => {
  const cast = [
    {name: '老板', col: K.orange, belly: K.cream, hat: 'crown' as const, item: 'briefcase' as const},
    {name: '管理者', col: K.blue, belly: K.sky, hat: 'headset' as const, item: 'pen' as const},
    {name: '法官', col: K.purple, belly: '#B9A6F0', hat: 'judge' as const, item: 'gavel' as const},
  ];
  return (
    <>
      <Pop f0={4} x={0} y={0}>
        <div style={{position: 'absolute', left: 960, top: 190, transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
          <Sticker text="管钱 · 管人 · 管资源" size={56} col={K.yellow} rot={-2} />
        </div>
      </Pop>
      <Layer>
        {cast.map((c, i) => {
          const x = 520 + i * 440;
          const y = FLOOR - 40 - (i === 1 ? 40 : 0);
          const p = E.back(seg(f, 10 + i * 6, 20 + i * 6));
          return (
            <g key={i}>
              <g transform={`translate(${x} ${FLOOR}) scale(1 ${p})`}>
                <rect x={-150} y={-(FLOOR - y) - 4} width={300} height={FLOOR - y + 4 + 60} rx={10} fill={i === 1 ? K.yellow : K.cream} {...SO} />
              </g>
              {p > 0.5 && <Bean x={x} y={y} scale={1.05} color={c.col} belly={c.belly} hat={c.hat} item={c.item} hop={16} phase={i * 0.33} name={c.name} tagCol={K.ol} hey={0.3} />}
            </g>
          );
        })}
      </Layer>
      {f >= 50 && (
        <Pop f0={50} x={960} y={320}>
          <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
            <TelopDiv size={70} color={K.white}>
              短期都很难交给 AI
            </TelopDiv>
          </div>
        </Pop>
      )}
    </>
  );
};


// ------------------------------------------------------------------ 兜底
/** Coin that spins from 拍板 to 兜底. */
const Coin: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => {
  const ang = E.inOut(seg(f, 14, 40)) * Math.PI * 3; // 1.5 turns: ends on the back face
  const c = Math.cos(ang);
  const back = c < 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.max(Math.abs(c), 0.04)} 1)`}>
      <circle r={200} cx={14} cy={14} fill={K.ol} />
      <circle r={200} fill={back ? K.yellow : K.orange} {...SO} strokeWidth={10} />
      <circle r={160} fill="none" stroke={K.ol} strokeWidth={6} strokeDasharray="14 14" />
      <Telop x={0} y={36} size={104} fill={K.white} family={F_CJK}>
        {back ? '兜底' : '拍板'}
      </Telop>
    </g>
  );
};

/** A small car seen from the side with a bot at the wheel. */
const Car: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
  const wob = Math.sin(f / 3) * 2;
  return (
    <g transform={`translate(${x} ${y + wob})`}>
      <path d="M -260 -40 L -250 -130 Q -240 -160 -200 -160 L -110 -160 L -50 -240 L 120 -240 L 190 -160 L 250 -150 Q 280 -140 280 -100 L 280 -40 Z" fill={K.sky} {...SO} />
      <path d="M -30 -220 L 110 -220 L 160 -165 L -30 -165 Z" fill={K.cream} {...SO} strokeWidth={6} />
      <g transform="translate(60 -150) scale(0.42)">
        <Bean x={0} y={0} kind="bot" color={K.steel} belly={null} ant="bolt" />
      </g>
      {[-150, 170].map((wx) => (
        <g key={wx} transform={`translate(${wx} -40) rotate(${f * 12})`}>
          <circle r={48} fill={K.ol} />
          <circle r={20} fill={K.gray} />
          <rect x={-4} y={-40} width={8} height={30} fill={K.gray} />
        </g>
      ))}
    </g>
  );
};

/** Wok (锅) carried on the back. */
const Wok: React.FC = () => (
  <g>
    <path d="M -90 0 Q 0 90 90 0 Z" fill="#3A3A3A" {...SO} strokeWidth={7} />
    <rect x={86} y={-10} width={70} height={18} rx={8} fill={K.wood} {...SO} strokeWidth={5} />
  </g>
);

export const R1Blame: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = b[5] >= 0 ? 5 : b[4] >= 0 ? 4 : b[3] >= 0 ? 3 : b[2] >= 0 ? 2 : b[1] >= 0 ? 1 : 0;
  const pillars = ['执照', '问责', '赔偿', '法规'];
  const tilt = b[6] >= 0 ? Math.sin(b[6] / 2.4) * 5 * Math.exp(-Math.max(0, b[6] - 40) / 40) + 3 * seg(b[6], 0, 20) : 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="tangerine" pattern="dots" floor={FLOOR} />
        {ph === 0 && (
          <Layer>
            <Coin f={b[0]} x={960} y={520} />
            <Burst x={960} y={520} f0={40} size={1.6} />
          </Layer>
        )}
        {ph === 1 && (
          <>
            <Screen src={A.surgery} x={130} y={230} w={780} h={470} f0={at[1]} credit={LOC} label="手术" focus={[50, 45]} tilt={-2} />
            <Screen src={A.court} x={1010} y={230} w={780} h={470} f0={at[1] + 40} credit={LOC} label="判案" focus={[50, 50]} tilt={2} />
            <Stamp f0={at[1] + 80} x={960} y={470} size={120} col={K.yellow} rot={-8}>
              谁负责？
            </Stamp>
          </>
        )}
        {ph === 2 && (
          <>
            <Layer>
              <Bean x={480} y={FLOOR} scale={1.5} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hop={14} item="pen" />
            </Layer>
            <Pop f0={at[2]} x={200} y={250}>
              <Sticker text="AI 能给建议" size={50} col={K.white} rot={-3} />
            </Pop>
            {['被追责', '赔偿', '吊销执照'].map((t, i) => (
              <Pop key={t} f0={at[2] + 30 + i * 22} x={900} y={280 + i * 170} from="right">
                <ShadowCard w={820} h={130} col={K.cream} r={26} off={10}>
                  <div style={{display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 40}}>
                    <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 56, color: K.ol, flex: 1}}>没法{t}</div>
                    <div style={{width: 92, height: 92, borderRadius: 46, background: K.red, border: `7px solid ${K.ol}`, marginRight: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F_ROUND, fontWeight: 700, fontSize: 64, color: K.white}}>✕</div>
                  </div>
                </ShadowCard>
              </Pop>
            ))}
          </>
        )}
        {ph === 3 && (
          <>
            <Layer>
              <Car x={760 - 260 * E.out(seg(b[3], 0, 16)) + 260} y={FLOOR} f={f} />
              <Burst x={1150} y={640} f0={at[3] + 16} size={1.2} col={K.red} />
            </Layer>
            <Stamp f0={at[3] + 10} x={1450} y={330} size={110} col={K.yellow}>
              算谁的？
            </Stamp>
            {['车主', '车企', '写软件的'].map((t, i) => (
              <Pop key={t} f0={at[3] + 22 + i * 7} x={1180 + i * 220} y={470} rot={(i - 1) * 5}>
                <Sticker text={`${t}?`} size={38} col={[K.white, K.sky, K.lime][i]} />
              </Pop>
            ))}
          </>
        )}
        {ph >= 4 && (
          <Layer>
            <g transform={`rotate(${tilt} 960 ${FLOOR})`}>
              {/* platform of trust */}
              <rect x={420} y={420} width={1080} height={70} rx={12} fill={K.yellow} {...SO} />
              <Telop x={960} y={472} size={48} fill={K.ol} sw={0}>
                信任
              </Telop>
              {pillars.map((p, i) => {
                const px = 520 + i * 293;
                const swap = ph >= 5 && i === 1;
                const pp = E.back(seg(b[4], 6 + i * 6, 16 + i * 6));
                if (swap) {
                  const walk = E.out(seg(b[5], 0, 20));
                  return (
                    <g key={p} transform={`translate(${(1 - walk) * 700} 0)`}>
                      <g transform={`translate(${px + 10} ${FLOOR - 196}) rotate(-16)`}>
                        <Wok />
                      </g>
                      <Bean x={px} y={FLOOR} scale={1.1} kind="bot" color={K.steel} belly={K.sky} ant="none" hey={1} hop={b[6] >= 0 ? 0 : 10} lean={b[6] >= 0 ? Math.sin(b[6] / 2) * 8 : 0} />
                      <Telop x={px} y={FLOOR - 290} size={40} fill={K.white}>
                        AI 背锅
                      </Telop>
                    </g>
                  );
                }
                return (
                  <g key={p} transform={`translate(${px} ${FLOOR}) scale(1 ${pp}) translate(${-px} ${-FLOOR})`}>
                    <rect x={px - 60} y={490} width={120} height={FLOOR - 490} fill={K.cream} {...SO} />
                    {Array.from(p).map((ch, k) => (
                      <Telop key={k} x={px} y={570 + k * 64} size={50} fill={K.ol} sw={0}>
                        {ch}
                      </Telop>
                    ))}
                  </g>
                );
              })}
              {/* the public on top */}
              {[0, 1, 2].map((i) => (
                <Bean key={i} x={640 + i * 320} y={420} scale={0.62} color={[K.blue, K.pink, K.green][i]} belly={K.cream} hop={b[6] >= 0 ? 0 : 12} phase={i * 0.3} face={b[6] >= 0 ? 'x' : null} hey={b[6] >= 0 ? 1 : 0} />
              ))}
            </g>
            {ph >= 5 && (
              <g>
                <Bean x={240} y={FLOOR} scale={1.1} color={K.pink} belly={K.cream} hat="none" ant="none" lean={Math.sin(b[5] / 2.5) * 8} open={b[5] >= 30} name="病人" />
                <rect x={180} y={FLOOR - 200} width={120} height={22} rx={10} fill={K.white} {...SO} strokeWidth={5} transform={`rotate(-12 240 ${FLOOR - 190})`} />
              </g>
            )}
          </Layer>
        )}
        {ph === 4 && (
          <Pop f0={at[4] + 30} f1={at[5]} x={960} y={190}>
            <div style={{transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
              <Sticker text="医疗 · 司法：一整套追责体系" size={46} col={K.white} rot={-2} />
            </div>
          </Pop>
        )}
        {ph >= 5 && b[6] < 0 && (
          <Pop f0={at[5] + 30} x={60} y={520}>
            <Sticker text="病人不答应" size={46} col={K.white} rot={-4} />
          </Pop>
        )}
        {b[6] >= 0 && (
          <Stamp f0={at[6] + 6} x={960} y={220} size={110} col={K.red}>
            信用动摇
          </Stamp>
        )}
      </Punch>
      <R1Tag />
    </AbsoluteFill>
  );
};


// ------------------------------------------------------------------ Mercy
export const R1Mercy: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const left = Math.max(0, 90 * 60 - Math.max(0, b[1]) * 9); // 90:00 counting down, sped up
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(Math.floor(left % 60)).padStart(2, '0');
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="navy" pattern="rays" floor={FLOOR} />
        <Screen src={A.mercy} x={110} y={230} w={1180} h={420} f0={2} label="电影《Mercy》 2026" credit="图：《Mercy》官方宣传图（Apple TV 页面）" focus={[55, 40]} zoom={[1.0, 1.1]} />
        <Layer>
          <Bean x={1580} y={FLOOR} scale={1.35} kind="bot" color={K.purple} belly={K.yellow} hat="judge" item="gavel" hop={b[2] >= 0 ? 0 : 10} hey={b[2] >= 0 ? 0.9 : 0.3} name="AI 法官" tagCol={K.red} />
        </Layer>
        {b[1] >= 0 && (
          <Pop f0={at[1]} x={300} y={700}>
            <ShadowCard w={420} h={140} col={K.ol} r={24} off={10}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: F_ROUND, fontWeight: 700, fontSize: 96, color: K.red, letterSpacing: 4}}>
                {mm}:{ss}
              </div>
            </ShadowCard>
          </Pop>
        )}
        {b[1] >= 30 && (
          <Pop f0={at[1] + 30} x={780} y={720} origin="0 50%">
            <Sticker text="证明自己没有杀人" size={42} col={K.white} rot={-2} />
          </Pop>
        )}
        {b[2] >= 0 &&
          [0, 1, 2, 3, 4].map((i) => {
            const t = b[2] - i * 4;
            if (t < 0) return null;
            const x = 1580 + Math.cos(i * 1.3) * 260 * E.out(seg(t, 0, 20));
            const y = 470 + Math.sin(i * 1.7) * 140 * E.out(seg(t, 0, 20)) - 60;
            return (
              <div key={i} style={{position: 'absolute', left: x - 50, top: y - 36, transform: `rotate(${(i - 2) * 9 + Math.sin((f + i * 9) / 8) * 4}deg)`}}>
                <div style={{width: 100, height: 72, background: K.yellow, border: `6px solid ${K.ol}`, borderRadius: 8, fontFamily: F_CJK, fontWeight: 900, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>证据</div>
              </div>
            );
          })}
        {b[2] >= 0 && (
          <Stamp f0={at[2] + 70} x={960} y={330} size={110} col={K.yellow}>
            判错了，谁负责？
          </Stamp>
        )}
      </Punch>
      <R1Tag />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 盯着 AI 的人
const Monitor: React.FC<{x: number; y: number; f: number; i: number; alert?: boolean}> = ({x, y, f, i, alert}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={-110} width={300} height={200} rx={18} fill={alert ? K.red : K.navy} {...SO} />
    <rect x={-20} y={90} width={40} height={40} fill={K.gray} {...SO} strokeWidth={6} />
    <g transform={`translate(0 ${70 + Math.sin((f + i * 10) / 6) * 4}) scale(0.5)`}>
      <Bean x={0} y={0} kind="bot" color={K.steel} belly={null} ant="bolt" face={alert ? 'x' : null} />
    </g>
  </g>
);

export const R1Watch: React.FC = () => {
  useKit();
  const {f, b, at} = useBeatFrames();
  const ph = b[4] >= 0 ? 4 : b[3] >= 0 ? 3 : b[2] >= 0 ? 2 : b[1] >= 0 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Punch hits={at}>
        <GSSet set="teal" pattern="stripes" floor={FLOOR} />
        {ph <= 1 && (
          <Layer>
            {[0, 1, 2].map((i) => (
              <Monitor key={i} x={1000 + i * 320} y={430 + (i === 1 ? -40 : 0)} f={f} i={i} />
            ))}
            <Bean x={420} y={FLOOR} scale={1.4} color={K.orange} belly={K.cream} hat="headset" item="magnifier" hop={8} hey={0.55} lean={6} />
          </Layer>
        )}
        {ph === 0 && (
          <Pop f0={at[0] + 40} x={160} y={250}>
            <Sticker text="新岗位：盯着 AI 的人" size={50} col={K.yellow} rot={-3} />
          </Pop>
        )}
        {ph === 1 &&
          [
            {t: '能做什么', m: '✓', c: K.green},
            {t: '不能做什么', m: '✕', c: K.red},
            {t: '为谁做', m: '?', c: K.sky},
          ].map((r, i) => (
            <Pop key={i} f0={at[1] + 8 + i * 22} x={130} y={240 + i * 120} from="left">
              <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{width: 84, height: 84, borderRadius: 42, background: r.c, border: `6px solid ${K.ol}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F_ROUND, fontWeight: 700, fontSize: 54, color: K.white, WebkitTextStroke: `3px ${K.ol}`}}>{r.m}</div>
                <div style={{marginLeft: 18}}>
                  <Sticker text={r.t} size={44} col={K.cream} rot={0} />
                </div>
              </div>
            </Pop>
          ))}
        {ph === 1 && (
          <Pop f0={at[1] + 80} x={1060} y={640}>
            <Sticker text="由人来定" size={56} col={K.yellow} rot={-4} />
          </Pop>
        )}
        {ph === 2 && (
          <Layer>
            <g transform={`translate(560 ${FLOOR})`}>
              <Bean x={0} y={0} scale={1.4} color={K.orange} belly={K.cream} hat="headset" hey={0.7} />
              <g transform={`translate(260 -200) scale(${E.back(seg(b[2], 0, 10))})`}>
                <path d="M 0 -150 L 120 -110 L 110 40 Q 80 120 0 160 Q -80 120 -110 40 L -120 -110 Z" fill={K.sky} {...SO} strokeWidth={9} />
                <path d="M -40 0 L -10 34 L 50 -40" fill="none" stroke={K.ol} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
            {['诈骗', '造假', '诈骗', '造假'].map((t, i) => {
              const t0 = 20 + i * 18;
              const p = seg(b[2], t0, t0 + 16);
              if (p <= 0) return null;
              const bounce = b[2] - t0 - 16;
              // fly in from the right, hit the shield, settle beside it with a small recoil
              const xf = 900 + Math.floor(i / 2) * 230;
              const x = bounce < 0 ? 1800 - (1800 - xf) * p : xf + 30 * Math.exp(-bounce / 5) * Math.sin(bounce / 1.5);
              const y = 420 + (i % 2) * 180;
              const rot = bounce < 0 ? 0 : (i % 2 ? 6 : -6) * (1 - Math.exp(-bounce / 6));
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
                  <rect x={-90} y={-40} width={180} height={80} rx={18} fill={K.red} {...SO} strokeWidth={6} />
                  <Telop x={0} y={16} size={44} fill={K.white} sw={6}>
                    {t}
                  </Telop>
                </g>
              );
            })}
            {[0, 1, 2, 3].map((i) => (
              <Burst key={i} x={810} y={420 + (i % 2) * 180} f0={at[2] + 36 + i * 18} size={0.7} col={K.white} />
            ))}
          </Layer>
        )}
        {ph === 3 &&
          [
            {t: 'AI 安全', c: K.yellow, hat: 'headset' as const, col: K.orange},
            {t: '内容审核', c: K.sky, hat: 'glasses' as const, col: K.blue},
            {t: '合规', c: K.lime, hat: 'cap' as const, col: K.purple},
          ].map((r, i) => (
            <React.Fragment key={i}>
              <Layer>
                <g opacity={b[3] >= i * 14 ? 1 : 0}>
                  <Bean x={480 + i * 480} y={FLOOR - 10 + dropOff(b[3] - i * 14)} scale={1.15} color={r.col} belly={K.cream} hat={r.hat} hop={14} phase={i * 0.33} hey={0.4} />
                </g>
              </Layer>
              <Pop f0={at[3] + 8 + i * 14} x={480 + i * 480} y={300}>
                <div style={{transform: 'translateX(-50%)'}}>
                  <Sticker text={r.t} size={54} col={r.c} rot={(i - 1) * 4} />
                </div>
              </Pop>
            </React.Fragment>
          ))}
        {ph === 4 && (
          <>
            <Layer>
              {/* bots grow stronger one by one; the watcher keeps an eye on all of them */}
              {[0, 1, 2].map((i) => (
                <g key={i} opacity={b[4] >= i * 8 ? 1 : 0}>
                  <Bean x={330 + i * 300 + i * i * 30} y={FLOOR} scale={(0.6 + i * 0.32) * E.back(seg(b[4], i * 8, i * 8 + 10))} kind="bot" color={K.steel} belly={K.sky} ant="bolt" hop={12} phase={i * 0.3} />
                </g>
              ))}
              <Bean x={1450} y={FLOOR} scale={1.3} color={K.orange} belly={K.cream} hat="headset" item="magnifier" hey={b[4] >= 50 ? 1 : 0.5} open={b[4] >= 50} hop={22} lean={b[4] >= 50 ? 0 : 8} />
              <Judge word="过关！" x={1400} y={340} f0={at[4] + 50} col={K.yellow} dur={70} size={160} />
              <Confetti f0={at[4] + 50} dur={50} seed={21} />
            </Layer>
            <Pop f0={at[4] + 6} x={300} y={240}>
              <Sticker text="AI 越强，越需要有人盯着" size={52} col={K.white} rot={-3} />
            </Pop>
          </>
        )}
      </Punch>
      <R1Tag />
    </AbsoluteFill>
  );
};

const dropOff = (t: number) => (t < 0 ? -1200 : -900 * (1 - E.in(seg(t, 0, 9))));
