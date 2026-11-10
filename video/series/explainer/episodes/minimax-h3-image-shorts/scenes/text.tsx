// 8 · E 杂志编辑排版 · text rendering. The official Chinese reasoning-puzzle sample is laid on the page like a
// magazine plate; a red editor's pen underlines the puzzle title, boxes the worked reasoning (「答案是它推出来」),
// then rings the final answer box (丙、戊、己) and blows it up in a call-out (「再写到板子上的」).
import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Abs, clamp01, Credit, EASE, EditorialStage, EKicker, IMG, pop, prog, rise, Sans, Serif, slam, useSub, V} from './common';

const X0 = 100;
const Y0 = 470;
const W = 880;
const H = 510;
const px = (f: number) => X0 + W * f;
const py = (f: number) => Y0 + H * f;
const IW = 1448;
const IH = 840;

/** Red pen rectangle drawn around fractions of the plate. */
const PenBox: React.FC<{x0: number; y0: number; x1: number; y1: number; p: number; width?: number}> = ({x0, y0, x1, y1, p, width = 6}) => {
  if (p <= 0) return null;
  const x = px(x0) - 6;
  const y = py(y0) - 6;
  const w = px(x1) - px(x0) + 12;
  const h = py(y1) - py(y0) + 12;
  const per = 2 * (w + h);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={V.red} strokeWidth={width} strokeDasharray={per} strokeDashoffset={per * (1 - EASE(clamp01(p)))} />
    </svg>
  );
};
/** A crop of the plate (fractions) scaled to width `w`. */
const Crop: React.FC<{x0: number; y0: number; x1: number; y1: number; w: number}> = ({x0, y0, x1, y1, w}) => {
  const imgW = w / (x1 - x0);
  const imgH = (imgW * IH) / IW;
  const h = imgH * (y1 - y0);
  return (
    <div style={{width: w, height: h, overflow: 'hidden', position: 'relative'}}>
      <Img src={IMG.puzzleCn} style={{position: 'absolute', width: imgW, height: imgH, left: -x0 * imgW, top: -y0 * imgH}} />
    </div>
  );
};

export const Text: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeats();
  const sub = useSub();
  const reason = sub(1, 1);
  const board = sub(1, 2);
  const lift = Math.sin(frame / 40) * 3;
  return (
    <EditorialStage>
      <EKicker f={b[0]}>官方样图 · 文字</EKicker>
      <Abs x={100} y={330}>
        <div style={slam(b[0], 0, 1.6)}>
          <Serif size={88} w={900} color={V.ink}>
            字也能写对
          </Serif>
        </div>
      </Abs>
      {/* the plate */}
      <Abs x={X0} y={Y0 + lift} w={W} h={H} style={{...rise(b[0], 6, 40), boxShadow: '0 20px 50px rgba(0,0,0,0.18)', outline: `2px solid ${V.ink}`}}>
        <Img src={IMG.puzzleCn} style={{width: W, height: H, objectFit: 'cover'}} />
      </Abs>
      {/* 这道中文推理题: underline the title */}
      {b[1] >= 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d={`M${px(0.29)} ${py(0.145) + lift} L${px(0.29) + (px(0.71) - px(0.29)) * EASE(prog(b[1], 14))} ${py(0.145) + lift}`} stroke={V.red} strokeWidth={8} strokeLinecap="round" fill="none" />
        </svg>
      )}
      {b[1] >= 0 && (
        <Abs x={100} y={1000} style={rise(b[1], 6, 20)}>
          <Sans size={34} w={800} color={V.ink}>
            中文推理题 · 人员选派
          </Sans>
        </Abs>
      )}
      {/* 答案是它推出来: the worked reasoning */}
      <div style={{transform: `translateY(${lift}px)`}}>
        <PenBox x0={0.005} y0={0.8} x1={0.64} y1={0.965} p={prog(reason, 18)} />
        <PenBox x0={0.653} y0={0.82} x1={0.891} y1={0.947} p={prog(board, 16)} width={8} />
      </div>
      {reason >= 0 && (
        <Abs x={px(0.02)} y={py(0.8) - 62 + lift} style={pop(reason, 10)}>
          <span style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 30, fontWeight: 900, color: '#fff', background: V.red, padding: '4px 16px'}}>先推理</span>
        </Abs>
      )}
      {/* 再写到板子上的: blow up the final answer */}
      {board >= 0 && (
        <>
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <path d={`M${px(0.77)} ${py(0.95) + lift + 4} Q${px(0.8)} 1040 ${640} ${1060 + 30 * (1 - EASE(prog(board, 14, 8)))}`} stroke={V.red} strokeWidth={5} fill="none" opacity={prog(board, 8, 8)} />
          </svg>
          <Abs x={260} y={1060} style={{...pop(board, 12, 0.5), boxShadow: '0 16px 40px rgba(0,0,0,0.25)', outline: `6px solid ${V.red}`}}>
            <Crop x0={0.653} y0={0.82} x1={0.891} y1={0.947} w={500} />
          </Abs>
          <Abs x={100} y={1060} style={rise(board, 24, 16)}>
            <Sans size={30} w={900} color={V.red}>
              写在
            </Sans>
            <div>
              <Sans size={30} w={900} color={V.red}>
                板子上
              </Sans>
            </div>
          </Abs>
        </>
      )}
      <Credit y={1232} color="rgba(22,22,22,0.5)" />
    </EditorialStage>
  );
};
