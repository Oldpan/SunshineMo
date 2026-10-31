// Part 1: what can be read out of a compiled binary (the article's six categories, pixel style), and what is
// left of the names once it is stripped (the article's interactive figure "Inside a compiled binary: hugface.so").
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {appear, clamp01, FONT_MONO, PixelPanel, PixelText, PixelWindow, prog, PX, SceneTitle, Sprite, Src, SRC_BLOG, useBeats, usePopIn} from './common';

// bytes from the top of an ELF64 header, then filler bytes for the scrolling dump
const HEAD = [0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0x03, 0x00, 0xb7, 0x00, 0x01, 0, 0, 0];
const byteAt = (i: number) => (i < HEAD.length ? HEAD[i] : (i * 73 + (i >> 3) * 29 + 11) & 0xff);

const HexDump: React.FC<{rows: number; offset: number}> = ({rows, offset}) => (
  <div style={{fontFamily: FONT_MONO, fontSize: 20, lineHeight: '30px', color: '#3A3360'}}>
    {Array.from({length: rows}, (_, r) => {
      const row = r + offset;
      return (
        <div key={r} style={{display: 'flex', gap: 14, whiteSpace: 'nowrap'}}>
          <span style={{color: PX.dim}}>{(row * 8).toString(16).padStart(6, '0')}</span>
          <span>
            {Array.from({length: 8}, (_, k) => byteAt(row * 8 + k).toString(16).padStart(2, '0')).join(' ')}
          </span>
        </div>
      );
    })}
  </div>
);

const CATS: {n: number; title: string; sub: string; sprite: string; beat: number; color: string}[] = [
  {n: 1, title: '机器码和控制流', sub: '循环 · 调用 · 条件跳转', sprite: 'gear', beat: 2, color: PX.blue},
  {n: 2, title: '字符串和数据', sub: '路径 · 报错信息 · 常量', sprite: 'doc', beat: 3, color: PX.yellow},
  {n: 3, title: '符号和函数名', sub: '函数名 · 全局变量 · 调试信息', sprite: 'flag', beat: 4, color: PX.red},
  {n: 4, title: '链接库和依赖', sub: '.so / .dll · ldd', sprite: 'folder', beat: 5, color: PX.green},
  {n: 5, title: '格式和架构', sub: 'ELF / PE · 目标架构 · 段布局', sprite: 'magnifier', beat: 5, color: PX.blue},
  {n: 6, title: '安全漏洞', sub: '写死的密钥 · 内存安全', sprite: 'lock', beat: 6, color: PX.red},
];

export const Binary: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const offset = Math.floor(frame / 10);
  return (
    <AbsoluteFill>
      <SceneTitle kicker="第一部分">二进制里能看到什么</SceneTitle>
      <div style={{position: 'absolute', left: 84, top: 250, ...pop(b[0], 0, 0.9)}}>
        <PixelWindow w={560} h={600} title="hugface.so" tag="编译好的二进制">
          <div style={{height: 380, overflow: 'hidden'}}>
            <HexDump rows={13} offset={offset} />
          </div>
          <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, ...appear(b[0], 16)}}>
            <Sprite name="cross" px={4} />
            <PixelText size={24} color={PX.red}>拿不回源代码</PixelText>
          </div>
        </PixelWindow>
      </div>
      <div style={{position: 'absolute', left: 700, top: 248, width: 1140}}>
        <div style={appear(b[1], 0)}>
          <PixelText size={36}>能提取的信息和结构：</PixelText>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18}}>
          {CATS.map((c) => {
            const f = b[c.beat];
            const hot = c.n === 3 && f > 0;
            return (
              <div key={c.n} style={{...pop(f, c.n === 5 ? 10 : 0, 0.7)}}>
                <PixelPanel w={548} h={150} bg={hot ? '#FFF1F3' : PX.panel} border={hot ? PX.red : PX.ink}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <div style={{width: 60, height: 60, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 4px ${PX.ink}`}}>
                      <PixelText size={36} color="#fff">{c.n}</PixelText>
                    </div>
                    <div>
                      <PixelText size={36}>{c.title}</PixelText>
                      <div>
                        <PixelText size={24} color={PX.dim}>{c.sub}</PixelText>
                      </div>
                    </div>
                  </div>
                </PixelPanel>
              </div>
            );
          })}
        </div>
      </div>
      <Src style={{position: 'absolute', left: 84, bottom: 184, opacity: prog(frame, 12, 20)}}>{SRC_BLOG} · Reverse Engineering in the context of software engineering</Src>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ stripped binary: 40 functions, 4 names
// [address, export name] for the 40 functions the article's figure lists (hugface.so, stripped mode)
const FNS: [string, string | null][] = [
  ['580', null], ['5a0', null], ['664', null], ['68c', null], ['6d4', null], ['73c', null], ['7ec', null], ['8a4', null],
  ['998', null], ['a3c', null], ['a8c', null], ['ab0', null], ['ad4', null], ['af8', null], ['b1c', null], ['b8c', null],
  ['bf4', null], ['c40', null], ['c78', null], ['ca4', null], ['cd0', null], ['cfc', null], ['d28', null], ['da0', null],
  ['e40', null], ['ed0', null], ['eec', null], ['f24', null], ['f84', null], ['fb8', null], ['1014', null], ['1054', null],
  ['1148', null], ['1200', null], ['1284', null], ['1308', null], ['1374', 'hf_state_size'], ['137c', 'hf_palette'], ['13a0', 'hf_new'], ['1400', 'hf_step'],
];

export const Names: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const pop = usePopIn();
  const shown = Math.round(40 * prog(b[3], 40));
  const dim = prog(b[4], 16);
  return (
    <AbsoluteFill>
      <SceneTitle kicker="这次抓哪一样">符号和函数名</SceneTitle>
      {/* left: the quote */}
      <div style={{position: 'absolute', left: 84, top: 250, width: 560, ...pop(b[0], 0, 0.9), opacity: pop(b[0], 0, 0.9).opacity * (1 - prog(b[1], 10))}}>
        <PixelPanel w={560} h={250} bg="#FFF1F3" border={PX.red}>
          <PixelText size={24} color={PX.red}>原文</PixelText>
          <div style={{marginTop: 8}}>
            <PixelText size={36}>This is the main piece we will exploit.</PixelText>
          </div>
        </PixelPanel>
      </div>
      <div style={{position: 'absolute', left: 84, top: 530, width: 560, zIndex: 3, ...appear(b[2], 0)}}>
        <PixelPanel w={560} h={300}>
          <PixelText size={24} color={PX.dim}>原文交互配图</PixelText>
          <div>
            <PixelText size={36}>Inside a compiled binary</PixelText>
          </div>
          <div style={{display: 'flex', gap: 10, marginTop: 18}}>
            <div style={{padding: '6px 12px', background: PX.ink}}>
              <PixelText size={24} color="#fff">stripped</PixelText>
            </div>
            <div style={{padding: '6px 12px', border: `3px solid ${PX.ink}`}}>
              <PixelText size={24}>unstripped</PixelText>
            </div>
          </div>
          <div style={{marginTop: 14}}>
            <PixelText size={24} color={PX.dim}>默认是 as shipped（发布时的样子）</PixelText>
          </div>
        </PixelPanel>
        </div>
      {/* right: 40 functions */}
      <div style={{position: 'absolute', left: 700, top: 250, ...appear(b[2], 10)}}>
        <PixelWindow w={1136} h={600} title="objdump -d hugface.so" progress={shown / 40}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10}}>
            {FNS.map(([addr, exp], i) => {
              const on = i < shown;
              const named = !!exp;
              const op = on ? (named ? 1 : 1 - 0.55 * dim) : 0;
              return (
                <div key={addr} style={{height: 40, background: named && dim > 0 ? PX.green : '#E9E4FA', border: `3px solid ${PX.ink}`, display: 'flex', alignItems: 'center', padding: '0 8px', opacity: op}}>
                  <span style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 17, color: named && dim > 0 ? '#fff' : PX.ink, whiteSpace: 'nowrap'}}>{named && dim > 0.5 ? exp : `sub_${addr}`}</span>
                </div>
              );
            })}
          </div>
          <div style={{display: 'flex', gap: 30, marginTop: 20}}>
            <div style={appear(b[3], 30)}>
              <PixelText size={36}>40 个函数</PixelText>
              <PixelText size={24} color={PX.dim}>（38 个属于程序，2 个编译器桩）</PixelText>
            </div>
            <div style={{marginLeft: 'auto', ...appear(b[4], 8)}}>
              <PixelText size={36} color={PX.green}>只剩 4 个有名字</PixelText>
            </div>
          </div>
        </PixelWindow>
      </div>
      {/* the article contradicts itself here: say so on screen */}
      <div style={{position: 'absolute', left: 84, top: 250, width: 560, ...pop(b[1], 0, 0.9), zIndex: 2}}>
        <PixelPanel w={560} h={250} bg="#FFF8E1" border={PX.ink}>
          <PixelText size={24} color={PX.red}>注意 · 原文前后不一致</PixelText>
          <div style={{marginTop: 6}}>
            <PixelText size={24}>正文：主要利用符号和函数名</PixelText>
          </div>
          <div>
            <PixelText size={24}>配图和录屏：用的是去掉符号的二进制，只剩导出函数有名字，其余由主管起名</PixelText>
          </div>
        </PixelPanel>
      </div>
      {/* the lead's first job */}
      <div style={{position: 'absolute', left: 84, top: 840, width: 560, opacity: clamp01(prog(b[6], 14))}}>
        <PixelText size={24} color={PX.blue}>→ 起名、猜用途：主管的第一件事</PixelText>
      </div>
      <Src style={{position: 'absolute', left: 700, bottom: 184, opacity: prog(frame, 12, 20)}}>原文交互配图「Inside a compiled binary: hugface.so」（stripped 模式）；地址取自配图数据</Src>
    </AbsoluteFill>
  );
};
