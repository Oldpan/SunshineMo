// Outro (≈11 s): answer the title. She can move (she dances for a beat), so standing still may come from one of the
// five "understanding" jobs teaching her wrong: a cursor runs along the five bots with a question mark over each.
// Then STAGE CLEAR, 鲸鱼娘 waves, sign-off 「我是老潘，下期再见」.
import React from 'react';
import {PixelText, Sprite} from '@atv/lib/styles';
import {blink, Bot, Headline, Mascot, outline, PP, pxPop, Screen, snap, Tag, useT, WHALE, dance} from './common';

const BOT_X = [180, 360, 540, 720, 900];

export const Outro: React.FC = () => {
  const {f, b, at} = useT();
  const canMove = f >= at(0, '不一定') && f < b[1];
  const chain = f >= b[1] && f < b[2];
  const clear = f >= b[2];
  const cur = chain ? Math.min(4, Math.floor((f - b[1] - 8) / 14)) : -1;
  return (
    <Screen wipeOut={false}>
      {/* headline */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center'}}>
        {!clear ? (
          <div style={{transform: `scale(${pxPop(f, chain ? b[1] : b[0])})`}}>
            <PixelText size={36} color="#F6C445" style={{letterSpacing: 4, textShadow: `4px 4px 0 ${PP.ink}`}}>
              {chain ? '也可能是' : '经常一动不动'}
            </PixelText>
            <div style={{marginTop: 8}}>
              <Headline size={96}>{chain ? '哪一步教偏了' : '不一定是不会动'}</Headline>
            </div>
          </div>
        ) : (
          <div style={{transform: `scale(${pxPop(f, b[2])})`}}>
            <Headline size={120} drop="#F6C445" style={{opacity: blink(f - b[2], 16) || f - b[2] > 32 ? 1 : 0.7}}>
              STAGE CLEAR
            </Headline>
          </div>
        )}
      </div>
      {/* the five understanding jobs, scanned one by one */}
      {chain && (
        <>
          {BOT_X.map((x, i) => (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: x - 72, top: 520, width: 144, textAlign: 'center', transform: `scale(${pxPop(f, b[1] + i * 3)})`}}>
                <div style={{display: 'inline-block', position: 'relative', width: 120, height: 130}}>
                  <Bot px={6} x={60} y={120} bob={false} mood={i === cur ? 'sad' : 'ok'} />
                </div>
                <div>
                  <PixelText size={24} color="#B7AEDB">
                    LV{i + 1}
                  </PixelText>
                </div>
              </div>
              {i <= cur && (
                <div style={{position: 'absolute', left: x - 22, top: 450, transform: `scale(${pxPop(f, b[1] + 8 + i * 14)})`}}>
                  <PixelText size={60} color={PP.pink} style={{textShadow: `4px 4px 0 ${PP.ink}`}}>
                    ?
                  </PixelText>
                </div>
              )}
            </React.Fragment>
          ))}
          {cur >= 0 && <div style={{position: 'absolute', left: snap(BOT_X[cur] - 78, 6), top: 506, width: 156, height: 196, boxShadow: `0 0 0 6px #F6C445`}} />}
          {/* a dotted "teaching" line from the scanned job down to her */}
          {cur >= 0 &&
            Array.from({length: 7}, (_, k) => {
              const u = (k + 1) / 8;
              return <div key={k} style={{position: 'absolute', left: snap(BOT_X[cur] + (540 - BOT_X[cur]) * u, 6), top: snap(716 + (900 - 716) * u, 6), width: 12, height: 12, background: '#F6C445', opacity: (k + Math.floor(f / 3)) % 3 === 0 ? 1 : 0.45}} />;
            })}
        </>
      )}
      {/* 鲸鱼娘 */}
      <Mascot src={clear ? WHALE.wave : canMove ? dance(f, 7) : WHALE.still} x={540} y={1186} s={chain ? 0.5 : 0.58} />
      {canMove && (
        <div style={{position: 'absolute', left: 700, top: 820, transform: `scale(${pxPop(f, at(0, '不一定'))})`}}>
          <Tag bg="#3CC47C" fg="#fff" size={36}>
            她会动
          </Tag>
        </div>
      )}
      {!canMove && !chain && !clear && f >= b[0] + 6 && (
        <div style={{position: 'absolute', left: 720, top: 820, transform: `scale(${pxPop(f, b[0] + 6)})`}}>
          <Tag bg={PP.pink} fg="#fff" size={48}>
            ？
          </Tag>
        </div>
      )}
      {clear && (
        <>
          <Bot mood="happy" px={8} x={200} y={1180} />
          {[[150, 560], [880, 600], [260, 820], [820, 900], [520, 520]].map(([x, y], i) => (
            <div key={i} style={{position: 'absolute', left: x, top: y + snap(Math.sin((f + i * 9) / 6) * 8, 4), transform: `scale(${pxPop(f, b[2] + 4 + i * 3)})`}}>
              <Sprite name="star" px={6} style={outline()} />
            </div>
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', transform: `scale(${pxPop(f, b[2] + 6)})`}}>
            <Tag bg="#F6C445" size={36}>
              我是老潘 · 下期再见
            </Tag>
          </div>
        </>
      )}
    </Screen>
  );
};
