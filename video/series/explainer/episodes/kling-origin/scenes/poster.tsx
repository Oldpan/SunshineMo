// Covers for 「可灵是如何诞生的」 (16:9 1920×1080 and 3:4 1080×1440), editbay look.
// A (default): the title over a timeline whose five clips are the five understanding models.
// B: the reward-model hook — Kling's own DRM beats Gemini-4-Argon on its pairwise test (表 17).
import React from 'react';
import {EB, FONT_MONO, FONT_NUM, FONT_ZH} from './common';

export const POSTER = 'A' as 'A' | 'B';

const ROLES: [string, string][] = [
  ['Caption', EB.cap],
  ['提示词增强', EB.vid],
  ['文本编码器', EB.violet],
  ['奖励模型', EB.red],
  ['自动评测', EB.amber],
];

export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  const tall = h > w;
  const L = tall ? 70 : 110;
  return (
    <div style={{width: w, height: h, background: EB.bg, position: 'relative', overflow: 'hidden', fontFamily: FONT_ZH}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${EB.hair} 1px, transparent 1px), linear-gradient(90deg, ${EB.hair} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(255,122,61,0.16), transparent 60%)'}} />
      {/* top bar */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 56, background: EB.p1, borderBottom: `1px solid ${EB.line}`, display: 'flex', alignItems: 'center', padding: `0 ${L}px`, gap: 14}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.7}} />
        ))}
        <span style={{fontFamily: FONT_MONO, fontSize: 20, color: EB.dim, marginLeft: 12}}>可灵是如何诞生的.proj</span>
        <span style={{marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 22, color: EB.head}}>● REC 00:05:41:00</span>
      </div>

      {POSTER === 'A' ? (
        <div style={{position: 'absolute', left: L, right: L, top: tall ? 170 : 150}}>
          <div style={{fontFamily: FONT_MONO, fontSize: tall ? 30 : 30, color: EB.head, letterSpacing: 4}}>KLING TEAM · 38 页技术报告</div>
          <div style={{fontSize: tall ? 150 : 132, fontWeight: 900, color: EB.ink, lineHeight: 1.12, marginTop: 18}}>
            可灵是
            {tall && <br />}
            如何诞生的
          </div>
          <div style={{fontSize: tall ? 54 : 58, fontWeight: 800, color: EB.ink, marginTop: 26, lineHeight: 1.3}}>
            背后 <span style={{color: EB.head}}>5 个</span>负责「看懂视频」的模型
          </div>
        </div>
      ) : (
        <div style={{position: 'absolute', left: L, right: L, top: tall ? 150 : 130}}>
          <div style={{fontSize: tall ? 96 : 100, fontWeight: 900, color: EB.ink, lineHeight: 1.15}}>可灵是如何诞生的</div>
          <div style={{fontSize: tall ? 50 : 54, fontWeight: 800, color: EB.dim, marginTop: 16}}>自家奖励模型，打分比 Gemini 更准</div>
          <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 22, width: tall ? 940 : 1200}}>
            {[
              ['可灵 DRM', 77.86, EB.head],
              ['Gemini-4-Argon', 73.54, EB.faint],
            ].map(([n, v, c]) => (
              <div key={n as string} style={{display: 'flex', alignItems: 'center', gap: 24}}>
                <div style={{width: tall ? 300 : 340, fontSize: 40, fontWeight: 800, color: EB.ink}}>{n}</div>
                <div style={{height: 70, width: (tall ? 380 : 560) * ((v as number) / 100), background: c as string, borderRadius: 6}} />
                <span style={{fontFamily: FONT_NUM, fontSize: 64, fontWeight: 900, color: c as string}}>{(v as number).toFixed(2)}%</span>
              </div>
            ))}
            <div style={{fontFamily: FONT_MONO, fontSize: 22, color: EB.faint}}>可灵内部成对测试 · 宏平均准确率 · 原文表 17</div>
          </div>
        </div>
      )}

      {POSTER === 'A' && !tall && (
        <div style={{position: 'absolute', right: L, top: 200, width: 470, background: EB.p1, border: `1px solid ${EB.line}`, borderRadius: 10, padding: '22px 26px'}}>
          <div style={{fontFamily: FONT_MONO, fontSize: 18, color: EB.faint}}>检查器 · 奖励模型准确率</div>
          {[
            ['可灵 DRM', 77.86, EB.head],
            ['Gemini-4-Argon', 73.54, EB.faint],
          ].map(([n, v, c]) => (
            <div key={n as string} style={{marginTop: 18}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <span style={{fontSize: 30, fontWeight: 800, color: EB.ink}}>{n}</span>
                <span style={{fontFamily: FONT_NUM, fontSize: 48, fontWeight: 900, color: c as string}}>{(v as number).toFixed(2)}%</span>
              </div>
              <div style={{marginTop: 8, height: 14, borderRadius: 7, background: EB.p3}}>
                <div style={{height: 14, borderRadius: 7, width: `${v}%`, background: c as string}} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* timeline: five clips = five models */}
      <div style={{position: 'absolute', left: L, right: L, bottom: tall ? 110 : 90, background: EB.p1, border: `1px solid ${EB.line}`, borderRadius: 10, padding: tall ? '22px 22px' : '22px 26px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: 18, color: EB.faint, marginBottom: 14}}>
          <span>时间线 · 视频生成背后的理解</span>
          <span>arXiv 2611.04916</span>
        </div>
        <div style={{display: 'flex', flexDirection: tall ? 'column' : 'row', gap: 10, position: 'relative'}}>
          {ROLES.map(([n, c], i) => (
            <div
              key={n}
              style={{
                flex: 1,
                height: tall ? 64 : 92,
                marginLeft: tall ? i * 60 : 0,
                marginRight: tall ? (4 - i) * 60 : 0,
                borderRadius: 6,
                border: `2px solid ${c}`,
                background: `color-mix(in srgb, ${c} 22%, transparent)`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 18px',
              }}
            >
              <span style={{fontFamily: FONT_MONO, fontSize: 20, color: c, marginRight: 12}}>0{i + 1}</span>
              <span style={{fontSize: tall ? 32 : 32, fontWeight: 800, color: EB.ink, whiteSpace: 'nowrap'}}>{n}</span>
            </div>
          ))}
          <div style={{position: 'absolute', left: tall ? '78%' : 'calc(60% - 6px)', top: -20, bottom: -20, width: 3, background: EB.head, boxShadow: `0 0 12px ${EB.head}`}} />
        </div>
      </div>
    </div>
  );
};
