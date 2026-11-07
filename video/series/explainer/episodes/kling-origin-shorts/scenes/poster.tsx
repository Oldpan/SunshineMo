// Covers for the vertical cut: 9:16 (抖音), 3:4 (小红书), 6:7 (视频号) from one layout centred on the 6:7 band.
// A (default): the title + the frozen 鲸鱼娘 with a full score and an empty motion bar.
// B: 「不动＝满分？」 headline with the judge bot and 鲸鱼娘. Switch VARIANT and re-run covers.mjs for the other one.
import React from 'react';
import {PixelBar, PixelText, PixelWindow, Sprite} from '@atv/lib/styles';
import {Bot, Headline, Hearts, Mascot, PixelStage, PP, Tag, WHALE} from './common';

const VARIANT: 'A' | 'B' = 'A';

export const poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  const y0 = (h - 1260) / 2; // the 6:7 band every size shares
  const A = VARIANT === 'A';
  return (
    <PixelStage w={w} h={h} floorY={y0 + 1150}>
      {A ? (
        <>
          <div style={{position: 'absolute', left: 0, width: w, top: y0 + 40, textAlign: 'center'}}>
            <Tag size={36}>可灵技术报告里的一个坑</Tag>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: y0 + 130, textAlign: 'center'}}>
            <Headline size={72} drop="#4C8DF6">
              为什么 AI 视频里的人
            </Headline>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: y0 + 230, textAlign: 'center'}}>
            <Headline size={144}>经常一动不动</Headline>
          </div>
          <div style={{position: 'absolute', left: 120, top: y0 + 450}}>
            <PixelWindow w={840} h={210} title="评分 · 只扣错误分">
              <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                <div style={{width: 130}}>
                  <PixelText size={36}>得分</PixelText>
                </div>
                <Hearts n={5} px={6} />
                <div style={{marginLeft: 'auto'}}>
                  <PixelText size={36} color="#1F8A50">
                    满分
                  </PixelText>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 14}}>
                <div style={{width: 130}}>
                  <PixelText size={36}>动作</PixelText>
                </div>
                <PixelBar p={0.03} n={14} w={430} h={22} color={PP.pink} />
                <div style={{marginLeft: 'auto'}}>
                  <PixelText size={36} color={PP.pink}>
                    0.02
                  </PixelText>
                </div>
              </div>
            </PixelWindow>
          </div>
          <Mascot src={WHALE.still} x={580} y={y0 + 1156} s={0.62} />
          <div style={{position: 'absolute', left: 70, top: y0 + 800, transform: 'rotate(-7deg)'}}>
            <Tag bg={PP.pink} fg="#fff" size={60}>
              不动＝满分？
            </Tag>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: y0 + 1172, textAlign: 'center'}}>
            <Tag bg="#BDE3FF" size={36}>
              像素小游戏讲清楚
            </Tag>
          </div>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', left: 0, width: w, top: y0 + 50, textAlign: 'center'}}>
            <Tag size={36}>AI 拍视频的评分陷阱</Tag>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: y0 + 140, textAlign: 'center'}}>
            <Headline size={156}>不动</Headline>
          </div>
          <div style={{position: 'absolute', left: 0, width: w, top: y0 + 340, textAlign: 'center'}}>
            <Headline size={156} drop="#F6C445">
              ＝满分？
            </Headline>
          </div>
          <Bot px={15} x={270} y={y0 + 1150} />
          <div style={{position: 'absolute', left: 360, top: y0 + 820}}>
            <Sprite name="magnifier" px={9} />
          </div>
          <Mascot src={WHALE.still} x={720} y={y0 + 1156} s={0.58} />
          <div style={{position: 'absolute', left: 0, width: w, top: y0 + 1170, textAlign: 'center'}}>
            <Tag bg="#BDE3FF" size={36}>
              为什么 AI 视频里的人，经常一动不动
            </Tag>
          </div>
        </>
      )}
    </PixelStage>
  );
};
