// Covers for the vertical cut: 9:16 (抖音), 3:4 (小红书), 6:7 (视频号) from one layout centred on the 6:7 band, in
// the gallery look of the opening. A (default): 「一张 4K 图 · 十来秒」 over the official beetle. B (offered):
// 「1600 万像素」 + four official samples. Switch VARIANT and re-run covers.mjs for the other one.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Frame, IMG, Num, Sans, Serif, useSerif, V} from './common';

const VARIANT: 'A' | 'B' = 'A';

const Pill: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'inline-block', border: `3px solid ${V.gold}`, padding: '8px 30px', background: 'rgba(12,11,10,0.8)'}}>
    <Sans size={40} w={800} color={V.goldHi} style={{letterSpacing: 4}}>
      {children}
    </Sans>
  </div>
);

export const poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  useSerif();
  const top = (h - 1260) / 2;
  const left = (w - 1080) / 2;
  const row = (y: number, children: React.ReactNode) => <div style={{position: 'absolute', left: 0, width: w, top: top + y, textAlign: 'center'}}>{children}</div>;
  const glow = {textShadow: '0 0 40px rgba(233,201,135,0.5)'};
  return (
    <AbsoluteFill style={{background: V.wall, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 45% at 50% ${top + 300}px, rgba(255,236,200,0.22) 0%, rgba(22,20,18,0) 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)'}} />
      {VARIANT === 'A' ? (
        <>
          {row(36, <Pill>MiniMax 开源生图模型</Pill>)}
          {row(
            140,
            <Num size={120} color={V.goldHi} style={glow}>
              H3-Image
            </Num>,
          )}
          {row(
            290,
            <Serif size={112} w={900} color={V.cream}>
              一张 4K 图
            </Serif>,
          )}
          {row(
            420,
            <Serif size={190} w={900} color={V.goldHi} style={glow}>
              十来秒
            </Serif>,
          )}
          <div style={{position: 'absolute', left, top: top + 680, width: 1080, height: 460}}>
            <Frame x={100} y={0} w={880} h={460} src={IMG.beetle} f={200} fx={0.5} fy={0.45} z1={1.02} />
          </div>
          {row(
            1170,
            <Sans size={40} w={700} color={V.cream}>
              4096×4096 · 6 步出图 · 权重开源
            </Sans>,
          )}
        </>
      ) : (
        <>
          {row(36, <Pill>MiniMax H3-Image · 开源</Pill>)}
          {row(
            140,
            <Num size={150} color={V.goldHi} style={glow}>
              1600 万像素
            </Num>,
          )}
          {row(
            320,
            <Serif size={84} w={900} color={V.cream}>
              AI 画的图，像真拍的
            </Serif>,
          )}
          <div style={{position: 'absolute', left, top: top + 480, width: 1080, height: 680}}>
            {[IMG.laundry, IMG.tea, IMG.flamingo, IMG.city].map((src, i) => (
              <Frame key={i} x={100 + (i % 2) * 450} y={Math.floor(i / 2) * 340} w={430} h={310} src={src} f={200} z1={1.02} mat={10} />
            ))}
          </div>
          {row(
            1180,
            <Sans size={38} w={700} color={V.cream}>
              一张 4K 图十来秒 · 图源 MiniMax 官方
            </Sans>,
          )}
        </>
      )}
    </AbsoluteFill>
  );
};
