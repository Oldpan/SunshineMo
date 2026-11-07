// LEVEL 1 说明书 (≈20 s). A video + its text are what the video AI learns from; a line missing from the text (the dog)
// is a thing it never learns. Then the report's 17.7 s film clip (drawn as four pixel shots, 示意): the fluent caption
// writes the hard cut as a fade and drops a line of dialogue; Kling's caption even writes down the mirrored lettering
// on the door glass. Facts: ../kling-origin/source/article.md Figure 3.
import React from 'react';
import {PixelText, PixelWindow, Sprite} from '@atv/lib/styles';
import {blink, Bubble, Clip, Credit, LevelBanner, Mascot, PP, pxPop, Screen, seg, snap, Stars, Tag, typed, useT, WHALE} from './common';

/** the four shots of the 17.7 s clip, drawn as pixel thumbnails */
const Shot: React.FC<{k: number; w: number; h: number; f: number; glass?: number}> = ({k, w, h, f, glass = 0}) => {
  const box: React.CSSProperties = {position: 'relative', width: w, height: h, overflow: 'hidden', boxShadow: `0 0 0 4px ${PP.ink}`};
  if (k === 0)
    return (
      <div style={{...box, background: '#8FD3FF'}}>
        <div style={{position: 'absolute', left: 20, top: 26, width: 110, height: 60, background: '#FFFCF4', boxShadow: `0 0 0 3px ${PP.ink}`}} />
        <div style={{position: 'absolute', left: 50, top: 14, width: 50, height: 14, background: PP.pink}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 24, background: '#8C84B0'}} />
        <div style={{position: 'absolute', left: snap(w - ((f * 3) % (w + 60)), 6), bottom: 12, width: 54, height: 20, background: PP.ink}} />
      </div>
    );
  if (k === 1)
    return (
      <div style={{...box, background: '#BDE3FF'}}>
        <div style={{position: 'absolute', left: 16, top: 20, width: w - 32, height: h - 20, background: '#C9C3E3', boxShadow: `0 0 0 3px ${PP.ink}`}} />
        <div style={{position: 'absolute', left: 40, top: 34, width: w - 80, height: 16, background: '#2A5BC4'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center'}}>
          <PixelText size={24} color="#fff" style={{textShadow: `3px 3px 0 ${PP.ink}`}}>
            Meridian
          </PixelText>
        </div>
      </div>
    );
  if (k === 2)
    return (
      <div style={{...box, background: '#3A2A22'}}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{position: 'absolute', right: 10, top: 12 + i * 18, width: 60, height: 6, background: '#C9A46A'}} />
        ))}
        <div style={{position: 'absolute', left: 50, bottom: 0, width: 56, height: 70, background: '#5A4636', boxShadow: `0 0 0 3px ${PP.ink}`}} />
        <div style={{position: 'absolute', left: 62, bottom: 70, width: 32, height: 28, background: '#D9B48F', boxShadow: `0 0 0 3px ${PP.ink}`}} />
      </div>
    );
  return (
    <div style={{...box, background: '#6E7FA8'}}>
      <div style={{position: 'absolute', left: 8, top: 10, right: 8, height: 34, background: 'rgba(255,255,255,.25)', boxShadow: `0 0 0 3px ${PP.ink}`}}>
        <div style={{transform: `scaleX(-1) scale(${1 + glass})`, transformOrigin: '50% 50%', textAlign: 'center', marginTop: 4}}>
          <PixelText size={12} color="#FFF3B0">
            LAPD DETECTIVE SQUAD
          </PixelText>
        </div>
      </div>
      <div style={{position: 'absolute', left: w / 2 - 34, bottom: -6, width: 68, height: 62, background: '#D9B48F', boxShadow: `0 0 0 3px ${PP.ink}`}} />
    </div>
  );
};
const T = ['0s', '2.95s', '9.59s', '15.97s'];

export const Cap: React.FC = () => {
  const {f, b, at} = useT();
  const B = f >= b[3];
  const gone = f >= b[2];
  const tFade = at(4, '慢慢淡出');
  const tOne = at(4, '一份');
  const fade = f >= tFade;
  const line = f >= b[5];
  const glass = f >= b[6];
  // fluent caption, two lines; chars 9–12 of line 2 window = 慢慢淡出
  const fl = ['“……片名出现，随后画面', '慢慢淡出，转到办公室……”'];
  return (
    <Screen>
      <LevelBanner f={f - b[0]} n={1} name="说明书" />
      {!B && (
        <>
          <div style={{position: 'absolute', left: 100, top: 490, transform: `scale(${pxPop(f, b[1])})`}}>
            <PixelWindow w={420} h={300} title="一段视频">
              <Clip f={f} w={368} h={180} dog mark={gone} />
            </PixelWindow>
          </div>
          <div style={{position: 'absolute', left: 520, top: 600, width: 40, textAlign: 'center', transform: `scale(${pxPop(f, b[1] + 8)})`}}>
            <PixelText size={48} color="#F6C445">
              +
            </PixelText>
          </div>
          <div style={{position: 'absolute', left: 560, top: 490, transform: `scale(${pxPop(f, b[1] + 12)})`}}>
            <PixelWindow w={420} h={300} title="一段文字">
              {['一个人在路上走，', '天气很好，', '他牵着一条狗。'].map((t, i) => {
                const miss = i === 2 && gone;
                return (
                  <div key={i} style={{marginBottom: 8, position: 'relative', height: 48}}>
                    <PixelText size={36} color={miss ? PP.pink : PP.ink} style={{opacity: miss ? 0.2 : 1}}>
                      {typed(f, t, 20, b[1] + 16 + i * 14)}
                    </PixelText>
                    {miss && (
                      <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${pxPop(f, b[2])})`, transformOrigin: '0 50%'}}>
                        <Tag bg={PP.pink} fg="#fff" size={36}>
                          漏了这句
                        </Tag>
                      </div>
                    )}
                  </div>
                );
              })}
            </PixelWindow>
          </div>
          <Mascot src={WHALE.report} x={480} y={1186} s={0.48} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', transform: `scale(${pxPop(f, b[1] + 20)})`}}>
            <Tag bg="#BDE3FF">拍视频的 AI 在学</Tag>
          </div>
          {gone && (
            <div style={{position: 'absolute', left: 640, top: 860, transform: `scale(${pxPop(f, b[2] + 20)})`, transformOrigin: '0 100%'}}>
              <Bubble tail="left" size={36}>
                狗？没学过
              </Bubble>
            </div>
          )}
        </>
      )}
      {B && (
        <>
          {/* the clip as a timeline of four shots */}
          <div style={{position: 'absolute', left: 100, top: 440, transform: `scale(${pxPop(f, b[3])})`}}>
            <PixelWindow w={880} h={240} title="一段 17.7 秒的电影片段（示意）">
              <div style={{display: 'flex', gap: 16}}>
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} style={{position: 'relative', transform: `scale(${pxPop(f, b[3] + 6 + k * 5)})`}}>
                    <Shot k={k} w={192} h={108} f={f} glass={k === 3 && glass ? 0.5 * seg(f, b[6] + 20, b[6] + 34) : 0} />
                    <div style={{marginTop: 6}}>
                      <PixelText size={24} color="#8C84B0">
                        {T[k]}
                      </PixelText>
                    </div>
                    {k === 2 && fade && (
                      <div style={{position: 'absolute', left: -40, top: 22, transform: `scale(${pxPop(f, tFade)})`, opacity: blink(f, 14) ? 1 : 0.6}}>
                        <Tag bg="#F6C445" size={36}>
                          咔
                        </Tag>
                      </div>
                    )}
                    {k === 1 && line && (
                      <div style={{position: 'absolute', left: 40, top: -20, transform: `scale(${pxPop(f, b[5])})`}}>
                        <Tag bg={PP.pink} fg="#fff">
                          有台词
                        </Tag>
                      </div>
                    )}
                    {k === 3 && glass && (
                      <div style={{position: 'absolute', left: 112, top: 40, transform: `scale(${pxPop(f, b[6] + 14)})`}}>
                        <Sprite name="magnifier" px={5} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PixelWindow>
          </div>
          {/* fluent caption */}
          {f >= tOne && (
            <div style={{position: 'absolute', left: 100, top: 700, transform: `scale(${pxPop(f, tOne)})`}}>
              <PixelWindow w={860} h={250} title="读着很顺的说明">
                {fl.map((ln, li) => (
                  <div key={li} style={{height: 48}}>
                    {Array.from(typed(f, ln, 22, tOne + 4 + li * 16)).map((ch, i) => {
                      const hit = li === 1 && i < 4 && fade;
                      return (
                        <PixelText key={i} size={36} color={hit ? PP.pink : PP.ink} style={{textDecoration: hit ? 'line-through' : undefined, background: hit ? '#FFE0E6' : undefined}}>
                          {ch}
                        </PixelText>
                      );
                    })}
                  </div>
                ))}
                <div style={{position: 'absolute', right: 0, bottom: -6, display: 'flex', gap: 14}}>
                  {fade && (
                    <div style={{transform: `scale(${pxPop(f, tFade + 10)})`}}>
                      <Tag bg={PP.pink} fg="#fff" size={36}>
                        硬切写成淡出
                      </Tag>
                    </div>
                  )}
                  {line && (
                    <div style={{transform: `scale(${pxPop(f, b[5] + 8)})`}}>
                      <Tag bg={PP.pink} fg="#fff" size={36}>
                        漏了台词
                      </Tag>
                    </div>
                  )}
                </div>
              </PixelWindow>
            </div>
          )}
          {/* Kling caption */}
          {glass && (
            <div style={{position: 'absolute', left: 100, top: 970, transform: `scale(${pxPop(f, b[6])})`}}>
              <PixelWindow w={860} h={200} title="可灵的写法">
                <PixelText size={36}>{typed(f, '15.97s 硬切 → 年轻警探特写', 24, b[6] + 4)}</PixelText>
                <div style={{marginTop: 8, display: 'flex', alignItems: 'center', gap: 18, opacity: f >= b[6] + 34 ? 1 : 0}}>
                  <PixelText size={36}>门玻璃上</PixelText>
                  <div style={{background: '#6E7FA8', padding: '0 12px', boxShadow: `0 0 0 3px ${PP.ink}`}}>
                    <div style={{transform: 'scaleX(-1)'}}>
                      <PixelText size={36} color="#FFF3B0">
                        LAPD DETECTIVE SQUAD
                      </PixelText>
                    </div>
                  </div>
                </div>
              </PixelWindow>
              <div style={{position: 'absolute', right: 18, top: 70, transform: `scale(${pxPop(f, b[6] + 56)})`}}>
                <Stars n={Math.min(3, Math.max(0, Math.floor((f - b[6] - 56) / 5) + 1))} total={3} px={4} />
              </div>
            </div>
          )}
          <Credit f={f - b[3]}>出处：可灵技术报告 图 3（画面为示意）</Credit>
        </>
      )}
    </Screen>
  );
};
