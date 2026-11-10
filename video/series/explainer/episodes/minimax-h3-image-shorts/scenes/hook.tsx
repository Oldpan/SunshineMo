// 1 · G 展厅画廊 · 0–12 s. The opening wall: five official samples are hung one after another under the spotlight
// while the title slams in; 「4096 × 4096」 replaces it with a stopwatch sweeping round; the last beat names the sources
// on a placard.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, Center, clamp01, EASE, Frame, FONT_NUM, GalleryStage, GKicker, IMG, Mono, Num, Placard, pop, prog, rise, Ring, Serif, shakeAt, slam, Sparkles, useSub, V} from './common';

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const name = sub(0, 1); // 叫 H3-Image
  const size = b[1];
  const fast = sub(1, 1); // 十来秒
  const src = b[2];
  const sh = shakeAt(frame, [name, size], 12);
  const t1 = 1 - prog(size, 10);
  return (
    <GalleryStage spot={820} shake={sh}>
      <GKicker f={b[0]}>MINIMAX · 2026.11.10 · 开源</GKicker>
      {/* title, then the size */}
      <Center y={390} style={{opacity: t1}}>
        <div style={pop(b[0], 4, 0.7)}>
          <Serif size={58} w={700} color={V.cream}>
            MiniMax 开源画图模型
          </Serif>
        </div>
      </Center>
      {name >= 0 && (
        <Center y={460} style={{opacity: t1}}>
          <div style={slam(name, 0, 2)}>
            <Num size={150} color={V.goldHi} style={{textShadow: '0 0 40px rgba(233,201,135,0.45)'}}>
              H3-Image
            </Num>
          </div>
        </Center>
      )}
      {size >= 0 && (
        <Center y={400} style={{opacity: 1 - prog(src, 10)}}>
          <div style={slam(size, 0, 1.8)}>
            <Num size={128} color={V.goldHi} style={{textShadow: '0 0 40px rgba(233,201,135,0.45)'}}>
              4096 × 4096
            </Num>
          </div>
          <div style={{...rise(size, 10), marginTop: 6}}>
            <Serif size={44} w={600} color={V.cream}>
              约 1600 万像素
            </Serif>
          </div>
        </Center>
      )}
      {/* the wall: five official samples hung in turn */}
      <Frame x={150} y={670} w={780} h={420} src={IMG.beetle} f={frame} delay={14} fx={0.5} fy={0.45} />
      <Frame x={110} y={1120} w={250} h={140} src={IMG.frog} f={frame} delay={34} />
      <Frame x={380} y={1120} w={150} h={140} src={IMG.rabbit} f={frame} delay={44} />
      <Frame x={550} y={1120} w={190} h={140} src={IMG.cow} f={frame} delay={54} fx={0.6} />
      <Frame x={760} y={1120} w={210} h={140} src={IMG.cherries} f={frame} delay={64} />
      {/* 十来秒: a stopwatch sweeps one lap over the big frame */}
      {fast >= 0 && src < 0 && (
        <Abs x={760} y={580} style={pop(fast, 0, 0.5)}>
          <svg width={200} height={200}>
            <circle cx={100} cy={100} r={86} fill="rgba(12,11,10,0.9)" stroke={V.gold} strokeWidth={6} />
            <circle cx={100} cy={100} r={70} fill="none" stroke={V.goldHi} strokeWidth={14} strokeDasharray={440} strokeDashoffset={440 * (1 - EASE(clamp01(fast / 40)))} transform="rotate(-90 100 100)" />
            <line x1={100} y1={100} x2={100 + 58 * Math.sin(EASE(clamp01(fast / 40)) * Math.PI * 2)} y2={100 - 58 * Math.cos(EASE(clamp01(fast / 40)) * Math.PI * 2)} stroke={V.cream} strokeWidth={6} strokeLinecap="round" />
          </svg>
          <div style={{position: 'absolute', left: 0, width: 200, top: 205, textAlign: 'center'}}>
            <span style={{fontFamily: FONT_NUM, fontSize: 40, fontWeight: 800, color: V.goldHi}}>十来秒</span>
          </div>
        </Abs>
      )}
      {fast >= 0 && <Sparkles x={860} y={680} f={fast - 40} n={8} color={V.goldHi} r={150} />}
      {name >= 0 && <Ring x={540} y={540} f={name} color={V.goldHi} max={520} width={8} />}
      {/* sources */}
      {src >= 0 && (
        <>
          <Placard x={150} y={520} f={src} title="图和数据都来自" sub="" />
          <Placard x={150} y={584} f={src} delay={14} title="MiniMax 官方博客 · Hugging Face 模型主页" hi />
        </>
      )}
      <Abs x={100} y={1268} style={{opacity: prog(frame, 20, 30)}}>
        <Mono size={22} color="rgba(242,237,226,0.5)">
          图源 MiniMax 官方
        </Mono>
      </Abs>
    </GalleryStage>
  );
};
