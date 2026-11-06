// 开场 · 卡通综艺台 (user 2026-11-06: the first scene in a cartoon style, with DeepSeek's community mascot 鲸鱼娘).
// The contestant is 鲸鱼娘 standing for "a video model"; the judge is the reward model (gameshow bot with a judge's wig
// and a magnifier). She dances → the judge circles three defects and docks a point each → she learns to stand still →
// no defects, full marks. Then the report card, "not: drawing better", and the five understanding models.
import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {
  BEAT,
  Bean,
  Burst,
  Confetti,
  E,
  F_CJK,
  F_ROUND,
  GSSet,
  heartPath,
  hopY,
  Judge,
  K,
  Layer,
  Pop,
  Punch,
  seg,
  SETS,
  ShadowCard,
  Stamp,
  Sticker,
  TelopDiv,
  useBeatFrames,
  useGSFonts,
} from '../../../shared/gameshow';
import {WHALE} from './assets';

const FLOOR = 830;
const S = 0.8; // pose scale
const CX = 620; // body centre on stage
const IMG_W = 736 * S;
const IMG_H = 784 * S;
const LEFT0 = CX - 330 * S;
const TOP0 = FLOOR + 8 - 757 * S;
type Pose = keyof typeof WHALE;
const DANCE: Pose[] = ['wave', 'dance1', 'dance2', 'dance1'];
/** raised right hand per pose, in pose-image px */
const HAND: Partial<Record<Pose, [number, number]>> = {wave: [485, 330], dance1: [560, 322], dance2: [555, 300]};

const Ring: React.FC<{x: number; y: number; rx: number; ry?: number; f0: number; f: number; o?: number}> = ({x, y, rx, ry, f0, f, o = 1}) => {
  if (f < f0) return null;
  const p = E.back(seg(f, f0, f0 + 8));
  const r2 = ry ?? rx;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`} opacity={o}>
      <ellipse rx={rx + 6} ry={r2 + 6} fill="none" stroke={K.ol} strokeWidth={16} />
      <ellipse rx={rx} ry={r2} fill="none" stroke={K.red} strokeWidth={9} strokeDasharray="26 12" strokeDashoffset={-f * 2} />
    </g>
  );
};

const Hearts: React.FC<{n: number; max?: number; f: number}> = ({n, max = 5, f}) => (
  <svg width={max * 66} height={60} viewBox={`0 0 ${max * 66} 60`}>
    {Array.from({length: max}, (_, i) => {
      const on = i < n;
      const bob = on ? Math.sin(f / 6 + i) * 2 : 0;
      return <path key={i} d={heartPath(0.75)} transform={`translate(${33 + i * 66} ${32 + bob})`} fill={on ? K.red : K.cream} stroke={K.ol} strokeWidth={6} strokeLinejoin="round" />;
    })}
  </svg>
);

const ROLES: [string, string][] = [
  ['Caption', K.teal],
  ['提示词增强', K.blue],
  ['文本编码器', K.purple],
  ['奖励模型', K.red],
  ['自动评测', K.orange],
];

export const Cover: React.FC = () => {
  useGSFonts();
  const {f, b, at} = useBeatFrames();
  const frame = useCurrentFrame();
  // --- phases (scene frames)
  const d1 = at[1] + 70; // 手指多一根
  const d2 = at[1] + 104; // 物体穿模
  const d3 = at[1] + 124; // 画面闪烁
  const freeze = at[3] + 58; // 少动
  const outJudge = at[5];
  const moving = f < freeze;
  // --- the contestant
  const beatI = Math.floor(f / BEAT);
  const pose: Pose = moving ? DANCE[beatI % 4] : f < at[5] ? 'still' : f < at[7] ? 'report' : 'wave';
  const hop = moving ? hopY(f, 34) : f >= at[7] ? hopY(f, 14) : 0;
  const ph = ((f / BEAT) % 1 + 1) % 1;
  const sq = moving ? 1 + 0.05 * Math.cos(ph * Math.PI * 2) : 1 + 0.008 * Math.sin(f / 9);
  const sway = moving ? (beatI % 2 ? 5 : -5) * Math.sin(ph * Math.PI) : 0;
  const tremble = !moving && f < at[5] ? Math.sin(f * 1.7) * 1.6 : 0;
  const sink = f >= d2 && moving ? 84 * E.out(seg(f, d2, d2 + 6)) : 0;
  const dy = hop + sink;
  const pin = E.back(seg(f, 0, 12)); // drop-in at the start
  const enterY = (1 - pin) * -700;
  // hand anchor (for the 手指多一根 ring), rotated with the sway around the feet
  const hp = HAND[pose] ?? HAND.wave!;
  const ax = LEFT0 + hp[0] * S;
  const ay = TOP0 + hp[1] * S + dy;
  const rad = (sway * Math.PI) / 180;
  const fx = CX;
  const fy = FLOOR + 8 + dy;
  const hx = fx + (ax - fx) * Math.cos(rad) - (ay - fy) * Math.sin(rad);
  const hy = fy + (ax - fx) * Math.sin(rad) + (ay - fy) * Math.cos(rad);
  // --- scoring
  const docked = [0, 1, 2].filter((i) => f >= at[2] + i * 8).length;
  const score = f < at[4] + 24 ? 5 - docked : Math.round(2 + 3 * E.out(seg(f, at[4] + 24, at[4] + 50)));
  const amp = moving ? 0.82 + 0.05 * Math.sin(f / 4) : 0.82 - 0.8 * E.out(seg(f, freeze, freeze + 14));
  const defO = 1 - seg(f, freeze, freeze + 6);
  const flash = f >= d3 && f < d3 + 14 && Math.floor((f - d3) / 2) % 2 === 0 ? 0.55 : 0;
  const lens = f >= at[0] + 24 && f < at[5];
  const lx = CX + 40 + 170 * Math.sin(f / 19);
  const ly = 470 + 120 * Math.sin(f / 12);
  const judgeX = 1520 + 700 * E.in(seg(f, outJudge, outJudge + 12));
  const lean = f >= d1 && moving ? -10 : f >= at[4] ? 4 : 0;
  const Set = SETS.yellow;
  return (
    <Punch hits={[...at, d1, d2, d3, freeze]}>
      <GSSet set="yellow" pattern="rays" floor={FLOOR} curtain={K.red} />
      {/* spotlight on the contestant */}
      <Layer>
        <ellipse cx={CX} cy={FLOOR + 30} rx={300} ry={46} fill="rgba(255,255,255,0.35)" />
        <ellipse cx={CX} cy={FLOOR + 26} rx={150 * (1 - hop / 120)} ry={20} fill="rgba(27,27,27,0.22)" />
      </Layer>
      {/* the contestant: all poses mounted so swaps never wait for a load */}
      <div
        style={{
          position: 'absolute',
          left: LEFT0 + tremble,
          top: TOP0 + enterY,
          width: IMG_W,
          height: IMG_H,
          transform: `translateY(${dy}px) rotate(${sway}deg) scale(${(1 / Math.sqrt(sq)).toFixed(3)}, ${sq.toFixed(3)})`,
          transformOrigin: `${330 * S}px ${757 * S}px`,
        }}
      >
        {(Object.keys(WHALE) as Pose[]).map((k) => (
          <Img key={k} src={WHALE[k]} style={{position: 'absolute', inset: 0, width: IMG_W, height: IMG_H, opacity: k === pose ? 1 : 0}} />
        ))}
      </div>
      {/* 物体穿模: a strip of stage floor drawn over her feet while she sinks through it */}
      {sink > 0 && (
        <Layer>
          <rect x={250} y={FLOOR} width={760} height={260} fill={Set.floor} />
          <line x1={250} y1={FLOOR} x2={1010} y2={FLOOR} stroke={K.ol} strokeWidth={8} />
        </Layer>
      )}
      {/* name tag over her head */}
      <Pop f0={14} f1={freeze} x={CX - 130} y={TOP0 - 6 + hop * 0.6}>
        <Sticker text="视频模型" col={K.sky} size={40} rot={-4} />
      </Pop>
      {/* the judge = reward model */}
      <Layer>
        <g transform={`translate(${judgeX - 1520} 0)`}>
          <Bean x={1520} y={FLOOR} scale={1.3} kind="bot" color={K.red} belly={K.cream} hat="judge" item="magnifier" hey={f >= d1 && moving ? 0.55 : 0.2} hop={6} lean={lean} name="奖励模型" />
        </g>
        {lens && (
          <g transform={`translate(${lx} ${ly}) rotate(-20)`} opacity={moving ? 1 : 0.85}>
            <rect x={-12} y={66} width={24} height={110} rx={10} fill="#B07A4A" stroke={K.ol} strokeWidth={7} />
            <circle r={78} fill="rgba(255,255,255,0.28)" stroke={K.ol} strokeWidth={12} />
            <circle r={78} fill="none" stroke={K.white} strokeWidth={4} strokeDasharray="40 400" strokeDashoffset={-20} />
          </g>
        )}
        {/* defect rings */}
        <Ring x={hx} y={hy} rx={62} f0={d1} f={f} o={defO} />
        <Ring x={CX + 10} y={FLOOR + 4} rx={190} ry={44} f0={d2} f={f} o={defO} />
        {[d1, d2, d3].map((d, i) => (
          <Burst key={i} x={[hx, CX + 10, 250][i]} y={[hy, FLOOR, 250][i]} f0={d} col={K.red} size={0.8} />
        ))}
        {[0, 8, 16].map((d) => (
          <Burst key={d} x={1640} y={230} f0={at[2] + d} col={K.yellow} size={0.8} />
        ))}
      </Layer>
      {/* defect stickers (+ "−1" when docked) */}
      {[
        {t: '手指多一根', x: hx + 50, y: hy - 150, d: d1},
        {t: '物体穿模', x: 150, y: 690, d: d2},
        {t: '画面闪烁', x: 120, y: 190, d: d3},
      ].map((s, i) => (
        <React.Fragment key={s.t}>
          <Pop f0={s.d} f1={freeze + 6} x={s.x} y={s.y}>
            <Sticker text={s.t} col={K.red} fg={K.white} size={40} rot={i % 2 ? 4 : -5} />
          </Pop>
          {f >= at[2] + i * 8 && f < freeze + 6 && (
            <Stamp f0={at[2] + i * 8} x={s.x + 300} y={s.y - 14} size={80} col={K.yellow} rot={10}>
              −1
            </Stamp>
          )}
        </React.Fragment>
      ))}
      {/* 画面闪烁: the whole stage flickers */}
      {flash > 0 && <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash}} />}
      {/* scoreboard + motion meter */}
      <Pop f0={at[0] + 30} f1={outJudge + 8} x={1270} y={110} from="right">
        <ShadowCard w={460} h={226} col={K.cream} r={30}>
          <div style={{padding: '14px 26px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <Sticker text="得分" col={K.yellow} size={30} rot={-3} />
              <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 110, color: score >= 5 && f >= at[4] ? K.green : K.ol, lineHeight: 1, WebkitTextStroke: `4px ${K.ol}`}}>
                {f >= at[4] + 24 ? `${score}.0` : score}
              </div>
            </div>
            <div style={{marginTop: 10}}>
              <Hearts n={score} f={frame} />
            </div>
          </div>
        </ShadowCard>
      </Pop>
      <Pop f0={at[0] + 40} f1={outJudge + 8} x={1270} y={364} from="right">
        <ShadowCard w={460} h={104} col={K.white} r={24}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', height: '100%'}}>
            <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 30, color: K.ol, whiteSpace: 'nowrap'}}>运动幅度</div>
            <div style={{flex: 1, height: 30, borderRadius: 15, border: `5px solid ${K.ol}`, background: K.cream, overflow: 'hidden'}}>
              <div style={{width: `${amp * 100}%`, height: '100%', background: moving ? K.orange : K.sky}} />
            </div>
            <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 36, color: K.ol, width: 76, textAlign: 'right'}}>{amp.toFixed(2)}</div>
          </div>
        </ShadowCard>
      </Pop>
      <Pop f0={at[1] + 8} f1={d1} x={1000} y={540} rot={-4}>
        <Sticker text="只挑毛病" col={K.white} size={44} />
      </Pop>
      <Layer>
        <Judge word="扣分！" x={1150} y={660} f0={at[2] + 2} col={K.red} size={100} dur={34} />
        <Judge word="满分！" x={1150} y={680} f0={at[4] + 50} col={K.green} size={100} dur={30} />
      </Layer>
      {f >= at[4] + 6 && f < outJudge + 6 && (
        <Pop f0={at[4] + 6} f1={outJudge + 6} x={990} y={520} rot={3}>
          <Sticker text="未发现瑕疵 ✓" col={K.lime} size={42} />
        </Pop>
      )}
      {f >= freeze + 4 && f < at[4] + 36 && (
        <Stamp f0={freeze + 4} x={CX} y={140} size={120} col={K.white} rot={-6}>
          少动！
        </Stamp>
      )}
      {f >= at[4] + 36 && f < at[5] && (
        <Stamp f0={at[4] + 36} x={CX} y={140} size={84} col={K.yellow} rot={-4}>
          不动，分反而更高
        </Stamp>
      )}
      <Layer>
        <Confetti f0={at[4] + 50} dur={40} />
      </Layer>
      {/* --- the report */}
      <Pop f0={at[5] + 8} f1={at[6] + 4} x={1010} y={140} from="right">
        <ShadowCard w={840} h={560} col={K.cream} r={34} off={16}>
          <div style={{padding: '34px 40px'}}>
            <Sticker text="可灵技术报告" col={K.yellow} size={40} rot={-3} />
            <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 64, color: K.ol, marginTop: 22}}>Kling Team</div>
            <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 34, color: K.ol, marginTop: 6}}>2026-11-03 · arXiv 2611.04916 · 38 页</div>
            <div style={{fontFamily: F_ROUND, fontWeight: 500, fontSize: 27, color: '#5A5A66', marginTop: 16, lineHeight: 1.35}}>
              Behind Video Generation: Observations and Insights on Multimodal Understanding from Kling
            </div>
          </div>
        </ShadowCard>
      </Pop>
      <Pop f0={at[5] + 90} f1={at[6] + 4} x={1060} y={600} rot={-3}>
        <Sticker text="专门提醒：只罚瑕疵 = 奖励一动不动" col={K.red} fg={K.white} size={38} />
      </Pop>
      {/* --- not: drawing better */}
      <Pop f0={at[6] + 6} f1={at[7] + 4} x={1040} y={300} from="drop">
        <ShadowCard w={780} h={250} col={K.white} r={34}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
            <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 40, color: '#6A6A78'}}>报告讲的不是</div>
            <TelopDiv size={86} color={K.yellow} style={{marginTop: 6}}>
              怎么画得更好
            </TelopDiv>
          </div>
        </ShadowCard>
      </Pop>
      {/* strike through "怎么画得更好", then a ✕ badge on the card's corner */}
      {f >= at[6] + 30 && f < at[7] + 4 && (
        <div style={{position: 'absolute', left: 1160, top: 452, width: 540 * E.out(seg(f, at[6] + 30, at[6] + 38)), height: 16, background: K.red, border: `5px solid ${K.ol}`, borderRadius: 10, transform: 'rotate(-4deg)'}} />
      )}
      {f >= at[6] + 38 && f < at[7] + 4 && (
        <Stamp f0={at[6] + 38} x={1800} y={300} size={150} col={K.red} rot={-8}>
          ✕
        </Stamp>
      )}
      {/* --- but: the models that understand video */}
      {f >= at[7] && (
        <div style={{position: 'absolute', left: 1010, top: 110, width: 860, textAlign: 'center', transform: `scale(${E.back(seg(f, at[7], at[7] + 9))})`}}>
          <div style={{fontFamily: F_CJK, fontWeight: 900, fontSize: 40, color: K.ol}}>而是背后负责</div>
          <TelopDiv size={80} color={K.white} style={{marginTop: 4}}>
            「看懂视频」的模型
          </TelopDiv>
        </div>
      )}
      {ROLES.map(([n, c], i) => (
        <Pop key={n} f0={at[7] + 16 + i * 7} x={i < 3 ? 1010 + i * 290 : 1155 + (i - 3) * 290} y={i < 3 ? 330 : 520} from="drop" rot={[-3, 2, -2, 3, -1][i]}>
          <ShadowCard w={262} h={150} col={c} r={26}>
            <div style={{padding: '14px 20px'}}>
              <div style={{fontFamily: F_ROUND, fontWeight: 700, fontSize: 30, color: K.ol}}>0{i + 1}</div>
              <TelopDiv size={n.length > 4 ? 42 : 46} style={{marginTop: 10, whiteSpace: 'nowrap'}}>
                {n}
              </TelopDiv>
            </div>
          </ShadowCard>
        </Pop>
      ))}
      {f >= at[7] + 81 && (
        <Pop f0={at[7] + 81} x={1250} y={720} rot={-3}>
          <Sticker text="一个个怎么做出来的 →" col={K.yellow} size={40} />
        </Pop>
      )}
    </Punch>
  );
};
