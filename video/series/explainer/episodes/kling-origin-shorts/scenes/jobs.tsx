// 看懂视频 (≈20 s): pretty pictures are no longer the hard part (a sunset window, 5 stars, "已经不难"); understanding
// what you asked for is (a quest list: 动作 / 镜头 / 同一个人). So behind 可灵 there is one "understanding" model
// (the big TV-bot) that splits into five small bots, one per job, shown as a level-select menu; the three this
// video plays (LV1 说明书, LV2 改写, LV4 评委) get a 「本期」 flag.
import React from 'react';
import {PixelPanel, PixelText, PixelWindow, Sprite} from '@atv/lib/styles';
import {blink, Bot, Bubble, Clip, Headline, PP, PP_PAL, PP_SP, pxPop, Screen, seg, snap, Stars, Tag, useT, outline} from './common';

const PERSON = ['...kkkk...', '..kccccK..', '..kccccK..', '...kkkk...', '..kbbbbk..', '.kbbbbbbk.', 'kbkbbbbkbk', 'kbkbbbbkbk', 'kckbbbbkck', '..kbbbbk..', '..kBkkBk..', '..kBk.kBk.', '..kBk.kBk.', '.kkk...kkk'];
const PERSON_PAL = {c: PP.skin, K: PP.ink, B: '#2A5BC4'};

/** 30×18 pixel sunset: sky bands, sun, two hills. */
const SUNSET: string[] = Array.from({length: 18}, (_, y) =>
  Array.from({length: 30}, (_, x) => {
    const hill = Math.max(Math.round(6 - Math.abs(x - 7) * 0.7), Math.round(8 - Math.abs(x - 22) * 0.6), 2);
    if (y >= 18 - hill) return y >= 18 - hill + 2 ? 'G' : 'g';
    if ((x - 19) ** 2 + (y - 8) ** 2 <= 10) return 'y';
    return y < 5 ? 'p' : y < 10 ? 'o' : 'c';
  }).join(''),
);
const SUN_PAL = {p: '#FF9EB4', o: '#FFB870', c: '#FFE3A0', g: '#56C26A', G: '#1F8A50'};

const JOBS = [
  {n: 1, name: '写说明书的', word: '写说明书', on: true},
  {n: 2, name: '改写提示词的', word: '改写', on: true},
  {n: 3, name: '当翻译的', word: '当翻译', on: false},
  {n: 4, name: '当评委的', word: '当评委', on: true},
  {n: 5, name: '当考官的', word: '当考官', on: false},
];
const ROW_Y = (i: number) => 480 + i * 136;

const Header: React.FC<{f: number; kicker: string; title: string}> = ({f, kicker, title}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center'}}>
    <div style={{transform: `scale(${pxPop(f, 0)})`}}>
      <PixelText size={36} color="#F6C445" style={{letterSpacing: 4, textShadow: `4px 4px 0 ${PP.ink}`}}>
        {kicker}
      </PixelText>
    </div>
    <div style={{marginTop: 8, transform: `scale(${pxPop(f, 3)})`}}>
      <Headline size={96}>{title}</Headline>
    </div>
  </div>
);

export const Jobs: React.FC = () => {
  const {f, b, at} = useT();
  const phase = f < b[3] ? 0 : f < b[4] ? 1 : 2;
  const head = [
    {k: '现在 AI 拍视频', t: '难在听懂你', f0: b[0]},
    {k: '所以可灵背后', t: '有个看懂视频的 AI', f0: b[3]},
    {k: '它分成了', t: '五个岗位', f0: b[4]},
  ][phase];
  const quest = [
    {t: '动作对不对', icon: <Sprite name="bolt" px={5} />, f0: at(2, '动作')},
    {t: '镜头对不对', icon: <Sprite rows={PP_SP.film} px={5} pal={PP_PAL} />, f0: at(2, '镜头')},
    {t: '是不是同一个人', icon: <Sprite rows={PERSON} px={5} pal={PERSON_PAL} />, f0: at(2, '人物')},
  ];
  const flag = b[5] + 138;
  return (
    <Screen>
      <Header f={f - head.f0} kicker={head.k} title={head.t} />
      {phase === 0 && (
        <>
          {/* pretty pictures: not the hard part any more */}
          <div style={{position: 'absolute', left: 120, top: 470, transform: `scale(${pxPop(f, b[0] + 6)})`}}>
            <PixelWindow w={840} h={270} title="画面好不好看">
              <div style={{display: 'flex', alignItems: 'center', gap: 34}}>
                <div style={{boxShadow: `0 0 0 4px ${PP.ink}`}}>
                  <Sprite rows={SUNSET} px={6} pal={SUN_PAL} />
                </div>
                <div>
                  <Stars n={Math.min(5, Math.max(0, Math.floor((f - b[0] - 16) / 4)))} px={4} />
                  <div style={{marginTop: 22, transform: `scale(${pxPop(f, b[0] + 44)})`, transformOrigin: '0 50%'}}>
                    <Tag bg="#3CC47C" fg="#fff" size={36}>
                      已经不难了
                    </Tag>
                  </div>
                </div>
              </div>
            </PixelWindow>
          </div>
          {/* understanding what you asked for: the hard part */}
          {f >= b[1] && (
            <div style={{position: 'absolute', left: 120, top: 770, transform: `scale(${pxPop(f, b[1])})`}}>
              <PixelWindow w={840} h={390} title="听不听得懂你要什么">
                <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                  <Sprite rows={PERSON} px={5} pal={PERSON_PAL} />
                  <Bubble tail="none" size={36}>
                    你说：她转身挥手，镜头慢慢推近
                  </Bubble>
                </div>
                {quest.map((q, i) => (
                  <div key={q.t} style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 14, transform: `scale(${pxPop(f, q.f0)})`, transformOrigin: '0 50%'}}>
                    <div style={{width: 70, display: 'flex', justifyContent: 'center'}}>{q.icon}</div>
                    <PixelText size={36}>{q.t}</PixelText>
                    <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14}}>
                      <Tag bg={PP.pink} fg="#fff">
                        难
                      </Tag>
                      <div style={{width: 44, height: 44, background: '#fff', boxShadow: `0 0 0 4px ${PP.ink}`, textAlign: 'center'}}>
                        <PixelText size={36} color={PP.pink} style={{opacity: blink(f + i * 4, 16) ? 1 : 0.25}}>
                          ?
                        </PixelText>
                      </div>
                    </div>
                  </div>
                ))}
              </PixelWindow>
            </div>
          )}
        </>
      )}
      {phase === 1 && (
        <>
          <div style={{position: 'absolute', left: 240, top: 480, transform: `scale(${pxPop(f, b[3] + 4)})`}}>
            <PixelWindow w={600} h={290} title="它在看的视频">
              <Clip f={f} w={548} h={170} scan />
            </PixelWindow>
          </div>
          <Bot mood="happy" px={17} x={540} y={1150} />
          {[0, 1].map((k) => (
            <div key={k} style={{position: 'absolute', left: k ? 790 : 200, top: 880, transform: `scale(${pxPop(f, b[3] + 10 + k * 4)})`, opacity: blink(f + k * 6, 20) ? 1 : 0.5}}>
              <Sprite rows={PP_SP.eye} px={7} style={outline()} />
            </div>
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', transform: `scale(${pxPop(f, b[3] + 8)})`}}>
            <Tag bg="#BDE3FF" size={36}>
              看懂视频的 AI
            </Tag>
          </div>
        </>
      )}
      {phase === 2 && (
        <>
          {JOBS.map((j, i) => {
            const t0 = at(5, j.word);
            // the five small bots fly out from the centre at b4, then each row opens when its job is named
            const fly = seg(f, b[4] + i * 3, b[4] + i * 3 + 12);
            const bx = snap(540 + (190 - 540) * fly, 6);
            const by = snap(960 + (ROW_Y(i) + 100 - 960) * fly, 6);
            const open = f >= t0;
            const dim = f >= flag && !j.on;
            return (
              <React.Fragment key={j.n}>
                {open && (
                  <div style={{position: 'absolute', left: 120, top: ROW_Y(i), transform: `scale(${pxPop(f, t0)})`, transformOrigin: '0 50%', opacity: dim ? 0.4 : 1}}>
                    <PixelPanel w={840} h={112} bg={j.on && f >= flag ? '#FFF3B0' : PP.cream}>
                      <div style={{position: 'absolute', left: 150, top: 20, display: 'flex', alignItems: 'center', gap: 22}}>
                        <PixelText size={36} color="#8C84B0">
                          LV{j.n}
                        </PixelText>
                        <PixelText size={48}>{j.name}</PixelText>
                      </div>
                    </PixelPanel>
                  </div>
                )}
                <Bot mood={j.on && f >= flag ? 'happy' : 'ok'} px={5} x={bx} y={by} bob={false} />
                {j.on && f >= flag && (
                  <div style={{position: 'absolute', left: 790, top: ROW_Y(i) + 26, transform: `scale(${pxPop(f, flag + i * 3)})`}}>
                    <Tag bg={PP.pink} fg="#fff" size={36}>
                      本期
                    </Tag>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </>
      )}
    </Screen>
  );
};
