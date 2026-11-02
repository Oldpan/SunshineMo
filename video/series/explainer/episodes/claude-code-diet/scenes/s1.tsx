// Section 1: the task contract (redraw of the article's figure 1).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useBeats} from '@atv/lib/timing';
import {Arrow, Board, Box, Hd, Head, HL, Note, prog, Src, Strike, W, Zh} from './common';

const BLOCKS = [
  {k: '完整任务', v: ['把 src/api 下的旧 SDK 调用迁移到新 SDK'], note: ''},
  {k: '完成条件', v: ['响应字段、错误码、超时行为保持兼容', 'uv run pytest -q tests/api 通过，新增 3 类用例'], note: '业务约束 + 验收入口'},
  {k: '范围和停止点', v: ['不改无关模块，不删或跳过测试，不部署生产', '缺凭据、需求冲突、要改公共接口时先停下来问'], note: '权限红线'},
  {k: '汇报方式', v: ['diff 摘要、实际运行的命令和结果、未验证的部分'], note: ''},
];
const AGENT = ['先搜哪些文件', '函数怎么拆、按什么顺序改', '中间跑哪些临时命令', '什么时候拆给 subagent'];
const DROP = ['请认真思考', '务必全面检查', '完成前反复确认'];

export const Contract: React.FC = () => {
  const b = useBeats();
  const frame = useCurrentFrame();
  const ys = [190, 318, 486, 654];
  const hs = [104, 144, 144, 104];
  return (
    <Board>
      <Head num="1" title="一条任务提示里值得写的四块" />
      {BLOCKS.map((bl, i) => (
        <Box key={bl.k} x={100} y={ys[i]} w={1000} h={hs[i]} p={prog(b[0], 22, i * 8)} seed={20 + i} pad="16px 26px">
          <div style={{display: 'flex', gap: 26}}>
            <div style={{width: 200, flexShrink: 0}}>
              <Hd size={32} color={W.clay}>
                <HL p={i === 1 || i === 2 ? prog(b[1], 16, i === 1 ? 0 : 40) : 0}>{bl.k}</HL>
              </Hd>
            </div>
            <div>
              {bl.v.map((t) => (
                <div key={t}>
                  <Zh size={25}>{t}</Zh>
                </div>
              ))}
            </div>
          </div>
        </Box>
      ))}
      <Note x={790} y={410} p={prog(b[1], 24, 6)} rot={-3} size={28}>
        业务约束 · 验收入口
      </Note>
      <Note x={900} y={580} p={prog(b[1], 24, 44)} rot={-3} size={28}>
        权限红线
      </Note>

      {/* right: left to the agent */}
      <Arrow pts={[[1110, 420], [1170, 400], [1215, 420]]} p={prog(b[2], 18)} />
      <Box x={1230} y={190} w={590} h={360} p={prog(b[2], 24, 6)} seed={31} dash bg={W.paper} shadow={false} pad="22px 30px">
        <Hd size={34} color={W.blue}>
          交给 agent 自己定
        </Hd>
        {AGENT.map((t, i) => (
          <div key={t} style={{marginTop: 12, opacity: prog(b[2], 12, 16 + i * 8)}}>
            <Zh size={27}>· {t}</Zh>
          </div>
        ))}
      </Box>

      {/* bottom-right: sentences you can delete */}
      <Box x={1230} y={600} w={590} h={200} p={prog(b[3], 20, 10)} seed={33} bg={W.paper} shadow={false} pad="18px 30px">
        <Hd size={30} color={W.red}>
          可以删掉的句子
        </Hd>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px 26px', marginTop: 10}}>
          {DROP.map((t, i) => (
            <Strike key={t} p={prog(b[3], 14, 40 + i * 10)} w={t.length * 30}>
              <Hd size={30} w={500}>
                {t}
              </Hd>
            </Strike>
          ))}
        </div>
      </Box>
      <div style={{position: 'absolute', left: 1500, top: 120, opacity: prog(b[3], 12), transform: `rotate(-8deg) scale(${1.4 - 0.4 * prog(b[3], 12)})`}}>
        <div style={{border: `5px solid ${W.red}`, borderRadius: 12, padding: '2px 18px'}}>
          <Hd size={40} color={W.red}>
            任务契约
          </Hd>
        </div>
      </div>
      <Src>据原文图 1 重绘 · 示例提示里的目录和测试命令是假设的仓库</Src>
    </Board>
  );
};
