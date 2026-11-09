// Blueprint scenes: h2 (set clear context, spec sheet), h8 (design the run that doesn't need you, pre-flight list).
import React from 'react';
import {useBeats} from '@atv/lib/timing';
import {Abs, BlueprintBg, BpBox, COL, Draw, Drift, Label, Mono, prog, rise, Sans} from './common';

const Head: React.FC<{n: string; t: string; f: number}> = ({n, t, f}) => (
  <Abs x={100} y={64}>
    <div style={rise(f, 10)}>
      <Label color={COL.bpFaint}>{`HABIT ${n} / 10`}</Label>
    </div>
    <div style={rise(f, 16)}>
      <Sans size={56} w={800} color="#E8F2FF">
        {t}
      </Sans>
    </div>
  </Abs>
);

const L: React.FC<{children: React.ReactNode; size?: number; w?: number; c?: string}> = ({children, size = 28, w = 600, c = '#E8F2FF'}) => (
  <Sans size={size} w={w} color={c}>
    {children}
  </Sans>
);

export const H2: React.FC = () => {
  const b = useBeats();
  const ph1 = 1 - prog(b[6], 16);
  const ph2 = prog(b[6], 16, 6);
  const specRows: [string, string, number][] = [
    ['目标', 'p95 加载时间 < 2s（1 万成员以上的组织）', 7],
    ['为什么', '企业管理员每天都开，慢加载是工单第一', 7],
    ['约束', '不改表结构，API 返回格式不变', 8],
    ['范围外', '不改 UI，不整页缓存', 8],
    ['检查', '跑 scripts/perf/team.sh，给出前后数字', 9],
  ];
  return (
    <>
      <BlueprintBg dwg="DWG 02 · 任务说明书" note={b[6] >= 0 ? '示例数字是原文举的例子' : '上下文，不是控制'} />
      <Drift zoom={0.015}>
        <Head n="02" t="讲清楚它不知道的" f={b[0]} />
        <div style={{opacity: ph1}}>
          {/* band 1: intent */}
          <BpBox x={110} y={220} w={430} h={110} p={prog(b[1], 24)}>
            <L>目标 · 约束</L>
            <Mono size={26} color={COL.bpLine}>经理讲清</Mono>
          </BpBox>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <Draw d="M540 275 H680" p={prog(b[1], 14, 18)} />
            <Draw d="M1460 330 V380" p={prog(b[3], 10)} color={COL.bpFaint} />
          </svg>
          <BpBox x={680} y={220} w={430} h={110} p={prog(b[1], 24, 22)}>
            <L>怎么做</L>
            <Mono size={26} color={COL.bpLine}>留给干活的人</Mono>
          </BpBox>
          <Abs x={1170} y={214} w={640} style={rise(b[2], 14)}>
            <L size={26} w={500}>军队：指挥官意图</L>
            <br />
            <L size={26} w={500}>Netflix：“context, not control”</L>
          </Abs>
          {/* band 2: what it reads vs what you write */}
          <BpBox x={110} y={390} w={760} h={420} p={prog(b[3], 20)} dashed>
            <Mono size={22} color={COL.bpFaint}>REPO · 它第一件事就是读代码</Mono>
            <div style={{marginTop: 18, opacity: prog(b[4], 14)}}>
              <L size={34}>目录结构 · 代码约定 · 测试怎么跑</L>
              <div style={{marginTop: 12}}>
                <L size={26} w={500} c={COL.bpFaint}>它读得比你讲得快，不用写</L>
              </div>
            </div>
          </BpBox>
          <BpBox x={960} y={390} w={850} h={420} p={prog(b[5], 24)}>
            <Mono size={22} color={COL.bpLine}>NOT IN REPO · 要你写</Mono>
            <div style={{marginTop: 18}}>
              <L size={34}>会上的决定 · 内部发布流程</L>
              <br />
              <L size={34}>为什么做 · 这次怎么算完</L>
            </div>
          </BpBox>
        </div>
        <div style={{opacity: ph2}}>
          <BpBox x={110} y={240} w={400} h={120} p={prog(b[6], 18, 6)} dashed>
            <L size={32}>「把看板弄快点」</L>
          </BpBox>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <Draw d="M510 300 H600" p={prog(b[6], 12, 26)} />
            <Draw d="M590 290 L600 300 L590 310" p={prog(b[6], 6, 36)} />
          </svg>
          <BpBox x={610} y={210} w={1200} h={480} p={prog(b[6], 26, 20)} style={{alignItems: 'flex-start', justifyContent: 'flex-start', padding: '26px 34px'}}>
            <Mono size={20} color={COL.bpFaint}>SPEC SHEET</Mono>
            {specRows.map(([k, v, bi]) => (
              <div key={k} style={{...rise(b[bi] - (k === '为什么' || k === '范围外' ? 24 : 0), 12), display: 'flex', gap: 24, marginTop: 16, textAlign: 'left'}}>
                <div style={{width: 120}}>
                  <Mono size={26} color={COL.marker} w={700}>
                    {k}
                  </Mono>
                </div>
                <L size={30} w={500}>
                  {v}
                </L>
              </div>
            ))}
          </BpBox>
          {/* b10: no spec yet? let the agent interview you */}
          {['没想清楚', 'agent 先采访你', '写成 spec 文件', '新会话去做'].map((t, i) => (
            <BpBox key={t} x={110 + i * 430} y={740} w={380} h={100} p={prog(b[10], 18, i * 8)}>
              <L size={28}>{t}</L>
            </BpBox>
          ))}
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            {[0, 1, 2].map((i) => (
              <Draw key={i} d={`M${490 + i * 430} 790 H${540 + i * 430}`} p={prog(b[10], 10, 14 + i * 8)} />
            ))}
          </svg>
        </div>
      </Drift>
    </>
  );
};

export const H8: React.FC = () => {
  const b = useBeats();
  const ph1 = 1 - prog(b[2], 16);
  const qs: [string, string][] = [
    ['它知道怎样算完吗？', '目标条件 / spec 文件 / 一个要变绿的测试'],
    ['它能自己验证吗？', '测试 / Stop hook / 评审'],
    ['边界在哪？', '权限 / 沙箱 / worktree / 唯一能推的分支'],
    ['护栏是什么？', '轮数上限 / 花费上限'],
    ['结果放哪，谁来批？', 'PR 或总结；不可逆的操作要人批'],
  ];
  return (
    <>
      <BlueprintBg dwg="DWG 08 · 起飞前检查单" note="放它过夜之前" />
      <Drift zoom={0.015}>
        <Head n="08" t="设计一个不用你盯的运行" f={b[0]} />
        <div style={{opacity: ph1}}>
          <BpBox x={760} y={260} w={400} h={110} p={prog(b[1], 20)}>
            <L size={32}>越级的经理</L>
          </BpBox>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <Draw d="M960 370 V430 M520 430 H1400 M520 430 V480 M960 430 V480 M1400 430 V480" p={prog(b[1], 22, 14)} />
          </svg>
          {['目标', '护栏', '检查点'].map((t, i) => (
            <BpBox key={t} x={360 + i * 440} y={480} w={320} h={110} p={prog(b[1], 18, 30 + i * 6)}>
              <L size={34}>{t}</L>
            </BpBox>
          ))}
          <Abs x={360} y={630} w={1200} style={{...rise(b[1] - 40, 14), textAlign: 'center'}}>
            <L size={28} w={500} c={COL.bpFaint}>
              不管每个人的活
            </L>
          </Abs>
        </div>
        <div style={{opacity: prog(b[2], 16, 8)}}>
          {qs.map(([q, h], i) => {
            const f = b[3 + i];
            const y = 210 + i * 112;
            return (
              <React.Fragment key={q}>
                <BpBox x={110} y={y} w={84} h={84} p={prog(b[2], 14, 10 + i * 4)}>
                  <span style={{fontSize: 46, color: COL.marker, opacity: prog(f, 10, 10), fontFamily: 'Noto Sans SC', fontWeight: 900}}>✓</span>
                </BpBox>
                <Abs x={230} y={y + 6} w={1560} style={{opacity: 0.45 + 0.55 * prog(f, 12)}}>
                  <L size={36} w={700}>
                    {q}
                  </L>
                  <span style={{marginLeft: 26, opacity: prog(f, 12, 10)}}>
                    <Mono size={26} color={COL.bpLine}>
                      {h}
                    </Mono>
                  </span>
                </Abs>
              </React.Fragment>
            );
          })}
          {['批量：先试 3 个文件', '新东西头几次要看着', '= 试用期'].map((t, i) => (
            <BpBox key={t} x={110 + i * 560} y={790} w={520} h={90} p={prog(b[8], 18, i * 10)} red={i === 2}>
              <L size={30}>{t}</L>
            </BpBox>
          ))}
        </div>
      </Drift>
    </>
  );
};
