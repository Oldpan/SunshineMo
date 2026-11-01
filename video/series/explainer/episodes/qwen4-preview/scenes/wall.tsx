// All scenes of qwen4-preview: one evidence wall per section. Beat indexes follow script.yaml.
import React from 'react';
import {Img} from 'remotion';
import type {Scene} from '@atv/lib/types';
import {useBeats, useScene} from '@atv/lib/timing';
import {
  Card,
  Chalk,
  clamp01,
  Count,
  FONT_MONO,
  FONT_NUM,
  FONT_ZH,
  KIND,
  Legend,
  lerp,
  Mono,
  Note,
  prog,
  Ring,
  Shot,
  Stamp,
  Thread,
  Verdict,
  W,
  Wall,
  Zh,
} from '../../../shared/evidence';
import {A} from './assets';

type SC = React.FC<{scene: Scene}>;

/** Absolute start frame of each beat (for camera keys) and frames since each beat. */
const useB = () => {
  const scene = useScene();
  const t = useBeats();
  const B = scene.beats.map((b) => b.from);
  return {B, t, dur: scene.duration};
};

/** Inline marker highlight that sweeps over a phrase. */
const Mark: React.FC<{t: number; children: React.ReactNode; color?: string}> = ({t, children, color = W.hl}) => {
  const p = prog(t, 14);
  return (
    <span style={{backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: 'no-repeat', backgroundSize: `${p * 100}% 88%`, backgroundPosition: '0 60%'}}>
      {children}
    </span>
  );
};

/** Card header line: small grey label above the content. */
const Head: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: FONT_MONO, fontSize: 20, color: W.dim, letterSpacing: 1, marginBottom: 12, whiteSpace: 'nowrap'}}>{children}</div>
);

/** An X / Reddit post rendered as text (pages need a login to screenshot). */
const Post: React.FC<{who: string; handle: string; date: string; children: React.ReactNode; site?: string}> = ({who, handle, date, children, site = 'X'}) => (
  <div style={{fontFamily: FONT_ZH}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14}}>
      <span style={{fontSize: 30, fontWeight: 800, color: W.ink}}>{who}</span>
      <span style={{fontFamily: FONT_MONO, fontSize: 22, color: W.dim}}>{handle}</span>
      <span style={{marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 20, color: W.dim}}>
        {site} · {date}
      </span>
    </div>
    <div style={{fontSize: 33, lineHeight: 1.45, color: W.ink, fontWeight: 500}}>{children}</div>
  </div>
);

// ================================================================== hook
export const Hook: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1400, y: 860, z: 1.25},
    {f: B[2], x: 1400, y: 950, z: 1.15},
    {f: B[3], x: 2140, y: 960, z: 0.72},
    {f: B[4], x: 2130, y: 1100, z: 0.7},
  ];
  return (
    <Wall cams={cams} part="QWEN4 · 前瞻证据墙">
      <Chalk x={880} y={560} t={t[0]} size={54}>
        2026-10-29 · 阿姆斯特丹云栖大会
      </Chalk>
      <Card x={900} y={700} w={1020} t={t[1]} rot={-1.5} kind="live" src="现场幻灯片 · 据参会者 @jtdavies 拍照转述" bg="#101A2B" pad={40}>
        <div style={{fontFamily: FONT_NUM, color: '#fff', fontSize: 92, fontWeight: 800, lineHeight: 1.05}}>Qwen4 Series</div>
        <div style={{fontFamily: FONT_NUM, color: '#7FB2FF', fontSize: 70, fontWeight: 700, marginTop: 10}}>Coming Soon</div>
        <div style={{fontFamily: FONT_ZH, color: 'rgba(255,255,255,0.6)', fontSize: 24, marginTop: 26}}>（据现场照片复述的文字，非原图）</div>
      </Card>
      <Chalk x={920} y={1180} t={t[2]} size={46} color={W.chalk}>
        权重 <span style={{color: W.pin}}>✗</span>　文档 <span style={{color: W.pin}}>✗</span>　API 价格 <span style={{color: W.pin}}>✗</span>
      </Chalk>
      <Card x={2160} y={760} w={1220} t={t[3]} rot={1.2} kind="official" src="huggingface.co/Qwen/Qwen3.8-Flash-Next · config.json · 2026-08">
        <Head>Qwen3.8-Flash-Next / config.json</Head>
        <div style={{position: 'relative'}}>
          <Shot img={A.hfConfig} />
          <Ring x={0.19} y={0.5} w={0.36} h={0.16} t={t[3] - 22} />
        </div>
      </Card>
      <Thread a={[1410, 700]} b={[2770, 760]} t={t[3] - 30} sag={140} />
      <Chalk x={2170} y={1310} t={t[3] - 34} size={40} color={W.chalkDim}>
        Qwen4 架构的预览版，8 月就开源了
      </Chalk>
      <Legend x={1000} y={1480} t={t[4]} gap={7} />
    </Wall>
  );
};

// ================================================================== 01 official: HF + press release
export const OfficialHf: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1050, y: 715, z: 1.25},
    {f: B[3], x: 1680, y: 715, z: 0.68},
    {f: B[4], x: 1280, y: 1380, z: 1.08},
    {f: B[5], x: 1720, y: 1360, z: 0.76},
  ];
  return (
    <Wall cams={cams} part="01 · 官方说了什么">
      <Card x={380} y={480} w={1340} t={t[1]} rot={-1} kind="official" src="huggingface.co/Qwen/Qwen3.8-Flash-Next · 模型主页">
        <Shot img={A.hfHead} />
        <div style={{height: 14}} />
        <Shot img={A.hfPara} t={t[2]} hl={[{x: 0.02, y: 0.08, w: 0.96, h: 0.28, at: 0}, {x: 0.02, y: 0.36, w: 0.2, h: 0.26, at: 6}]} />
      </Card>
      <Card x={1880} y={540} w={1100} t={t[3]} rot={1.5} kind="official" src="config.json · model_type">
        <Shot img={A.hfConfig} />
        <div style={{position: 'absolute', left: 18, top: 18, right: 18, bottom: 18}}>
          <Ring x={0.19} y={0.5} w={0.36} h={0.16} t={t[3] - 14} />
        </div>
      </Card>
      <Thread a={[1050, 480]} b={[2430, 540]} t={t[3] - 8} sag={120} />
      <Card x={460} y={1250} w={1640} t={t[4]} rot={-0.6} kind="official" src="alibabagroup.com · Apsara 2026 新闻稿 · 2026-09-25">
        <Head>Alibaba Group · Apsara Conference 2026 新闻稿</Head>
        <Shot img={A.alibabaPara} t={t[4]} hl={[{x: 0.0, y: 0.08, w: 0.98, h: 0.3, at: 14}, {x: 0.0, y: 0.38, w: 0.98, h: 0.6, at: t[4] - t[5]}]} />
      </Card>
      <Note x={2250} y={1290} t={t[5] + 4} rot={3} w={660}>
        5–10T 参数 → Qwen4.5 / Qwen5
        <br />
        不是 Qwen4
      </Note>
    </Wall>
  );
};

// ================================================================== 01 official: qwen-code PRs
export const OfficialCode: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1050, y: 520, z: 1.2},
    {f: B[2], x: 1715, y: 580, z: 0.7},
    {f: B[3], x: 1180, y: 1330, z: 1.15},
    {f: B[5], x: 2630, y: 1370, z: 1.15},
    {f: B[6], x: 2630, y: 1500, z: 0.95},
  ];
  return (
    <Wall cams={cams} part="01 · 官方：Qwen 自己的 Qwen Code 仓库">
      <Chalk x={400} y={330} t={t[0]} size={50}>
        QwenLM/qwen-code
      </Chalk>
      <Card x={400} y={460} w={1300} t={t[1]} rot={-1} kind="official" src="github.com/QwenLM/qwen-code/pull/15762 · 2026-10-28 合并">
        <Shot img={A.p15762Head} />
      </Card>
      <Card x={1850} y={520} w={1180} t={t[2]} rot={1.2} kind="none" src="packages/core/src/core/tokenLimits.ts" bg="#0F1420" pad={30}>
        <Mono size={26} color="#9AA4B5">{'// qwen4 generation → 1M'}</Mono>
        <Mono size={34} color="#E8ECF4" w={600}>
          <span style={{color: '#5BD18B'}}>+ </span>[<span style={{color: '#F2C96B'}}>/^qwen4/</span>, LIMITS[<span style={{color: '#F2C96B'}}>'1m'</span>]],
        </Mono>
        <Mono size={24} color="#9AA4B5" style={{marginTop: 10}}>
          262,144 → 1,000,000 tokens
        </Mono>
      </Card>
      <Thread a={[1050, 460]} b={[2440, 520]} t={t[2] + 6} sag={100} />
      <Card x={480} y={1150} w={1400} t={t[3]} rot={0.8} kind="infer" stampLabel="1M 未确认" src="同一 PR 的 Risk & Scope 一节">
        <Shot img={A.p15762Risk} t={t[3]} hl={[{x: 0.04, y: 0.03, w: 0.93, h: 0.15, at: 12}, {x: 0.0, y: 0.17, w: 0.62, h: 0.15, at: 22}]} />
      </Card>
      <Card x={1980} y={1080} w={1300} t={t[5]} rot={-1.2} kind="official" src="github.com/QwenLM/qwen-code/pull/15987 · 2026-10-31">
        <Shot img={A.p15987Head} />
        <div style={{height: 12}} />
        <Shot img={A.p15987Para} t={t[6]} hl={[{x: 0.0, y: 0.5, w: 0.98, h: 0.14, at: 0}, {x: 0.0, y: 0.64, w: 0.5, h: 0.14, at: 8}]} />
      </Card>
      <Note x={2380} y={1800} t={t[6] + 14} rot={-2} w={760} size={36}>
        qwen4* → reasoning effort 分档
        <br />
        low / medium / xhigh（默认 xhigh）
      </Note>
    </Wall>
  );
};

// ================================================================== 02 live
export const Live: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1010, y: 560, z: 1.2},
    {f: B[3], x: 2310, y: 680, z: 1.2},
    {f: B[4], x: 1760, y: 1380, z: 0.95},
    {f: B[5], x: 2100, y: 1380, z: 0.72},
  ];
  return (
    <Wall cams={cams} part="02 · 现场说了什么">
      <Chalk x={420} y={330} t={t[0]} size={46} color={W.chalkDim}>
        Apsara Conference · Amsterdam · 2026-10-29
      </Chalk>
      <Card x={420} y={460} w={1180} t={t[1]} rot={-1.4} kind="live" src="x.com/jtdavies · 现场帖">
        <Post who="John T Davies" handle="@jtdavies" date="2026-10-29">
          From the @Alibaba_Qwen Cloud CTO, Dr. Feifei Li - “<Mark t={t[2]}>Qwen4 next week</Mark>”. Live from Apsara, Amsterdam.
        </Post>
      </Card>
      <Card x={1720} y={520} w={1180} t={t[3]} rot={1.3} kind="live" src="x.com/ruima">
        <Post who="Rui Ma" handle="@ruima" date="2026-10-29">
          Apparently Alibaba Cloud’s CTO said “Qwen4 next week” on stage at Apsara today, according to people in the room. … and <Mark t={t[3] + 30}>the slide still just says “coming soon.”</Mark>
        </Post>
      </Card>
      <Thread a={[1010, 460]} b={[2310, 520]} t={t[3] + 10} sag={110} />
      <Card x={900} y={1200} w={1720} t={t[4]} rot={-0.5} kind="live" src="Qwen 研究员 Xudong Guo 的幻灯片 · 据参会者转述" bg="#101A2B" pad={36}>
        <div style={{fontFamily: FONT_NUM, color: '#fff', fontSize: 44, fontWeight: 800, marginBottom: 24}}>Qwen4 Series · Coming Soon</div>
        <div style={{display: 'flex', gap: 22}}>
          {['Max', 'Plus', 'Flash', '27B'].map((n, i) => {
            const p = prog(t[4] - 10 - i * 6, 12);
            return (
              <div key={n} style={{flex: 1, border: '2px solid #4C7BC8', borderRadius: 12, padding: '26px 0', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
                <div style={{fontFamily: FONT_NUM, fontSize: 30, color: '#7FB2FF'}}>Qwen4-</div>
                <div style={{fontFamily: FONT_NUM, fontSize: 64, fontWeight: 800, color: '#fff'}}>{n}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <Note x={2740} y={1260} t={t[5] + 6} rot={4} w={560}>
        「下周」= 现场口头话
        <br />
        不是官方日期
      </Note>
    </Wall>
  );
};

// ================================================================== 03 community code
const ECO = [
  ['vLLM', '#64898', '[Perf][Qwen4Exp] Fuse HyperConnection up projection and gate mix', '10-31'],
  ['SGLang', '#46881', '[AMD] qwen4_exp: Fuse hyper-connection combine, norm and mix', '10-27'],
  ['TensorRT-LLM', '#21372', 'Qwen3.8-Flash-Next NVFP4 modeling_v2 on 4×GB300', '10-31'],
  ['vllm-ascend（昇腾）', '#20548', 'Add Ascend inference support for Qwen4Exp PLE INT8 tables', '11-01'],
  ['ROCm/ATOM', '#2847', 'perf(qwen4_exp): Flash-Next TP prefill follow-ups', '10-30'],
];
export const Ecosystem: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1000, y: 500, z: 1.2},
    {f: B[2], x: 1000, y: 630, z: 1.2},
    {f: B[3], x: 2480, y: 700, z: 1.2},
    {f: B[4], x: 1460, y: 1380, z: 0.75},
    {f: B[5], x: 3250, y: 1420, z: 1.05},
    {f: B[6], x: 2300, y: 1250, z: 0.55},
  ];
  return (
    <Wall cams={cams} part="03 · 推理框架的代码">
      <Chalk x={360} y={330} t={t[1]} size={50}>
        2026-08-26 · Flash-Next 开源当天
      </Chalk>
      <Card x={340} y={470} w={1320} t={t[2]} rot={-1} kind="code" src="github.com/ggml-org/llama.cpp/pull/27742 · 08-26 提交，08-27 合并">
        <Shot img={A.llamaHead} />
        <div style={{height: 12}} />
        <Shot img={A.llamaPara} t={t[2]} hl={[{x: 0.36, y: 0.05, w: 0.27, h: 0.3, at: 18}]} />
      </Card>
      <Card x={1820} y={520} w={1320} t={t[3]} rot={1.2} kind="code" src="github.com/vllm-project/vllm/pull/53909 · 08-26 提交">
        <Shot img={A.vllmHead} />
        <div style={{height: 12}} />
        <Shot img={A.vllmPara} />
      </Card>
      {ECO.map(([repo, num, title, date], i) => (
        <Card key={repo} x={i < 3 ? 300 + i * 800 : 700 + (i - 3) * 800} y={i < 3 ? 1150 : 1450} w={720} t={t[4] - i * 5} rot={i % 2 ? 1.5 : -1.5} kind={i === 0 ? 'code' : 'none'} pad={22}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <Zh size={32} w={800}>
              {repo}
            </Zh>
            <Mono size={20} color={W.dim}>
              {num} · {date}
            </Mono>
          </div>
          <Mono size={22} color="#33302B" style={{marginTop: 8, whiteSpace: 'normal'}}>
            {title}
          </Mono>
        </Card>
      ))}
      <Card x={2750} y={1250} w={1000} t={t[5]} rot={-0.8} kind="none" src="GitHub 搜索「qwen4 is:pr created:>=2026-10-25」 · 截至 2026-11-01" bg={W.paper} pad={34}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 26}}>
          <Count to={623} t={t[5] - 4} dur={36} style={{fontSize: 150, fontWeight: 800, color: W.string, lineHeight: 1}} />
          <Zh size={40} w={800}>
            个 PR 提到 qwen4
            <div style={{fontSize: 28, fontWeight: 500, color: W.dim}}>10 月 25 日以来</div>
          </Zh>
        </div>
      </Card>
      <Chalk x={2750} y={1700} t={t[6] + 4} size={46} color={W.chalk}>
        权重一出 → 主流框架首日就能跑
      </Chalk>
    </Wall>
  );
};

// ================================================================== 04 what is not there yet
export const Missing: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1800, y: 700, z: 0.8},
    {f: B[1], x: 1090, y: 870, z: 1.2},
    {f: B[2], x: 2460, y: 820, z: 1.25},
  ];
  return (
    <Wall cams={cams} part="04 · 还没有的（截至 2026-11-01）">
      <Card x={520} y={620} w={1140} t={t[1]} rot={-1.2} kind="official" stampLabel="官方账号 · 查无" src="huggingface.co/models?search=Qwen/Qwen4 · 2026-11-01">
        <div style={{position: 'relative'}}>
          <Shot img={A.hfSearch} />
          <Verdict text="0 个仓库" t={t[1] + 40} size={60} />
        </div>
      </Card>
      <Card x={1820} y={640} w={1280} t={t[2]} rot={1} kind="official" stampLabel="官方 API · 实测" src="阿里云百炼 API · dashscope.aliyuncs.com · 2026-11-01 实测" bg="#0F1420" pad={32}>
        <Mono size={24} color="#9AA4B5">
          $ curl …/compatible-mode/v1/chat/completions \
        </Mono>
        <Mono size={24} color="#9AA4B5" style={{paddingLeft: 40}}>
          -d '{'{'}"model": "<span style={{color: '#F2C96B'}}>qwen4-max</span>", …{'}'}'
        </Mono>
        <div style={{height: 18}} />
        <Mono size={25} color="#E8ECF4" style={{whiteSpace: 'normal', opacity: prog(t[2], 10, 20)}}>
          {'{"error": {"message": "The model `qwen4-max` does not exist or you do not have access to it.",'}
        </Mono>
        <Mono size={30} color="#FF6B5E" w={700} style={{opacity: prog(t[2], 10, 34)}}>
          {'  "code": "model_not_found"}}'}
        </Mono>
      </Card>
    </Wall>
  );
};

// ================================================================== 04 what to ignore
export const Debunk: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1750, y: 700, z: 0.75},
    {f: B[1], x: 960, y: 620, z: 1.25},
    {f: B[2], x: 2510, y: 660, z: 1.2},
    {f: B[3], x: 1800, y: 1380, z: 0.95},
    {f: B[4], x: 2130, y: 1400, z: 0.7},
  ];
  return (
    <Wall cams={cams} part="04 · 可以不用管的">
      <Card x={380} y={520} w={1160} t={t[1]} rot={-1.5} kind="rumor" src="reddit.com/r/LocalLLaMA · 2026-10-06">
        <Post who="r/LocalLLaMA" handle="转述合作伙伴爆料" date="2026-10-06" site="Reddit">
          Qwen 4 apparently coming out at the end of October
        </Post>
        <Verdict text="已跳票" t={t[1] + 40} />
      </Card>
      <Card x={1880} y={480} w={1260} t={t[2]} rot={1.2} kind="rumor" src="Hugging Face · 第三方账号" pad={30}>
        <Mono size={34} w={700}>
          stealth-model/Qwen4
        </Mono>
        <Zh size={26} w={500} color={W.dim} style={{marginBottom: 20}}>
          第三方写的介绍页，不是 Qwen 官方
        </Zh>
        <Mono size={34} w={700}>
          IteraCompute/Qwen4-27B-NVFP4
        </Mono>
        <Zh size={26} w={500} color={W.dim}>
          只有准备文档，没有权重
        </Zh>
        <Verdict text="非官方 · 无权重" t={t[2] + 50} size={54} rot={-8} />
      </Card>
      <Card x={860} y={1250} w={1880} t={t[3]} rot={-0.5} kind="official" stampLabel="官方 PR · 测试用例" src="github.com/QwenLM/qwen-code/pull/15762 · 测试里用到的模型 ID">
        <Shot
          img={A.p15762Ids}
          t={t[3]}
          hl={[
            {x: 0.875, y: 0.04, w: 0.12, h: 0.3, at: 14},
            {x: 0.0, y: 0.34, w: 0.08, h: 0.3, at: 18},
            {x: 0.49, y: 0.34, w: 0.21, h: 0.3, at: 26},
          ]}
        />
      </Card>
      <Note x={2820} y={1300} t={t[4] + 4} rot={3} w={600} size={38}>
        测试用例里的 ID
        <br />
        ≠ 发布名单
      </Note>
    </Wall>
  );
};

// ================================================================== 05 architecture
const PARTS = [
  ['GDN ×3 + QSA ×1', '每 4 层：3 层线性 GDN，留下的注意力层换成稀疏检索 QSA'],
  ['Gated Residual', '残差从 1 路拓宽到 4 路'],
  ['N-gram Embedding 51B', '放在第 2 层的静态查表，可以 offload 到 CPU'],
  ['Muon + MTP', '主优化器换成 Muon；1 层 MTP 做投机解码'],
];
export const Arch: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 950, y: 930, z: 0.78},
    {f: B[1], x: 2570, y: 520, z: 1.2},
    {f: B[4], x: 2570, y: 1370, z: 1.1},
    {f: B[8], x: 1780, y: 980, z: 0.6},
  ];
  const bars = [
    {label: '主模型（含 MoE）', v: 125, c: '#4A78C2', at: t[1]},
    {label: 'N-gram 查表', v: 51, c: '#D9822B', at: t[2]},
    {label: 'MTP', v: 4, c: '#7A57C9', at: t[2] + 12},
  ];
  const scale = 1260 / 180;
  return (
    <Wall cams={cams} part="05 · 架构，一分钟">
      <Card x={300} y={260} w={1300} t={t[0]} rot={-0.8} kind="official" src="Qwen3.8-Flash-Next 架构图 · QwenLM 官方 GitHub">
        <Shot img={A.arch} />
      </Card>
      <Card x={1880} y={330} w={1380} t={t[1]} rot={0.6} kind="official" src="config.json / 技术报告 · 文章整理" bg={W.paper} pad={34}>
        <Zh size={36} w={800} style={{marginBottom: 18}}>
          Qwen3.8-Flash-Next 的参数
        </Zh>
        <div style={{display: 'flex', height: 70, borderRadius: 6, overflow: 'hidden', background: '#E6E0D4'}}>
          {bars.map((b) => (
            <div key={b.label} style={{width: b.v * scale * prog(b.at, 18), background: b.c, position: 'relative'}} />
          ))}
        </div>
        {/* 6B active sliver inside the 125B bar */}
        <div style={{position: 'relative', height: 0}}>
          <div style={{position: 'absolute', left: 0, top: -70, width: 6 * scale, height: 70, background: '#F2C14E', opacity: prog(t[1], 12, 24)}} />
        </div>
        <div style={{display: 'flex', gap: 34, marginTop: 18, fontFamily: FONT_ZH, fontSize: 28, fontWeight: 600}}>
          <span style={{opacity: prog(t[1], 12, 10)}}>
            <b style={{color: '#4A78C2', fontFamily: FONT_NUM, fontSize: 40}}>125B</b> 主模型
          </span>
          <span style={{opacity: prog(t[1], 12, 26)}}>
            <b style={{color: '#B8860B', fontFamily: FONT_NUM, fontSize: 40}}>6B</b> 每 token 激活
          </span>
          <span style={{opacity: prog(t[2], 12, 6)}}>
            <b style={{color: '#D9822B', fontFamily: FONT_NUM, fontSize: 40}}>+51B</b> N-gram
          </span>
          <span style={{opacity: prog(t[2], 12, 16)}}>
            <b style={{color: '#7A57C9', fontFamily: FONT_NUM, fontSize: 40}}>+4B</b> MTP
          </span>
        </div>
        <Zh size={44} w={800} style={{marginTop: 18, opacity: prog(t[3], 12)}}>
          checkpoint 合计 ≈ <span style={{fontFamily: FONT_NUM, color: W.string}}>180B</span>
        </Zh>
      </Card>
      {PARTS.map(([name, desc], i) => {
        const at = [t[4] + 20, t[6], t[7], t[8]][i];
        return (
          <Card key={name} x={1880 + (i % 2) * 720} y={1030 + Math.floor(i / 2) * 430} w={660} t={at} rot={i % 2 ? 1.2 : -1.2} pad={26}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 52, height: 52, borderRadius: 26, background: W.string, color: '#fff', fontFamily: FONT_NUM, fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {i + 1}
              </div>
              <Mono size={30} w={800}>
                {name}
              </Mono>
            </div>
            <Zh size={28} w={500} color="#3A362F" style={{marginTop: 12}}>
              {desc}
            </Zh>
          </Card>
        );
      })}
    </Wall>
  );
};

export const ArchNum: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1650, y: 740, z: 0.95},
    {f: B[3], x: 1650, y: 1040, z: 0.7},
  ];
  return (
    <Wall cams={cams} part="05 · 技术报告的对比">
      <Card x={700} y={420} w={1900} t={t[0]} rot={-0.6} kind="official" src="arXiv 2608.30320 · On the Design of Qwen3.8-Next Architecture" bg={W.paper} pad={40}>
        <Zh size={40} w={800}>
          Qwen3.8-Flash-Next <span style={{color: W.dim, fontWeight: 500}}>vs</span> Qwen3.7-Plus（397B-A17B）
        </Zh>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 34}}>
          <div style={{display: 'flex', gap: 12}}>
            {Array.from({length: 14}).map((_, i) => {
              const p = prog(t[1] - i * 2, 8);
              const win = i < 8;
              return <div key={i} style={{width: 46, height: 46, borderRadius: 23, background: win ? W.string : 'transparent', border: `4px solid ${win ? W.string : '#9A958B'}`, transform: `scale(${p})`}} />;
            })}
          </div>
          <Zh size={38} w={800} style={{opacity: prog(t[1], 12, 30)}}>
            14 项<Mark t={t[1] - 30}>预训练</Mark> benchmark 赢 8 项
          </Zh>
        </div>
        <Zh size={26} w={500} color={W.dim} style={{marginTop: 10, opacity: prog(t[1], 12, 40)}}>
          其余 6 项差距都在 2.6 分以内
        </Zh>
        <div style={{display: 'flex', gap: 80, marginTop: 40}}>
          {[
            ['1/3', '激活参数'],
            ['1/9', '训练 FLOPs（约）'],
          ].map(([n, l], i) => (
            <div key={l} style={{opacity: prog(t[2], 12, i * 16)}}>
              <div style={{fontFamily: FONT_NUM, fontSize: 130, fontWeight: 800, color: W.ink, lineHeight: 1}}>{n}</div>
              <Zh size={32} w={600} color={W.dim}>
                {l}
              </Zh>
            </div>
          ))}
        </div>
      </Card>
      <Card x={1500} y={1520} w={1300} t={t[3]} rot={1.4} kind="infer" src="文章的判断" pad={30}>
        <Zh size={44} w={800}>
          Qwen4 ≈ 这套架构，按档位缩放
        </Zh>
      </Card>
    </Wall>
  );
};

// ================================================================== 06 deploy
export const Deploy: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 1900, y: 560, z: 1.0},
    {f: B[1], x: 1280, y: 820, z: 1.15},
    {f: B[2], x: 1280, y: 1000, z: 0.95},
    {f: B[3], x: 2575, y: 820, z: 1.15},
    {f: B[4], x: 2000, y: 1560, z: 1.05},
  ];
  const vram = prog(t[4], 30, 8);
  return (
    <Wall cams={cams} part="06 · 本地部署">
      <div style={{opacity: 1 - prog(t[1], 12)}}>
        <Chalk x={1900} y={440} t={t[0]} size={78} align="center">
          6B 激活 <span style={{color: W.string}}>≠</span> 只要 6B 的显存
        </Chalk>
      </div>
      <Card x={700} y={640} w={1150} t={t[1]} rot={-1} kind="none" src="原文按 config 计算 · 单条 1M 序列 · BF16" bg={W.paper} pad={32}>
        <Zh size={30} w={600} color={W.dim}>
          1M context 的 KV Cache
        </Zh>
        <div style={{fontFamily: FONT_NUM, fontSize: 110, fontWeight: 800, color: W.ink}}>
          <Count to={24.6} t={t[1]} decimals={1} dur={24} /> GB
        </div>
        <Mono size={22} color={W.dim}>
          12 层 QSA × 2(K/V) × 2 头 × 256 维 × 2 B = 24 KB / token
        </Mono>
      </Card>
      <Note x={720} y={1180} t={t[2]} rot={-3} w={620} size={36}>
        QSA 省算力和带宽
        <br />
        不省显存
      </Note>
      <Card x={2000} y={640} w={1150} t={t[3]} rot={1} kind="none" src="SGLang Cookbook · Qwen3.8-Flash-Next" bg={W.paper} pad={32}>
        <Zh size={30} w={600} color={W.dim}>
          N-gram 表（FP8）
        </Zh>
        <div style={{fontFamily: FONT_NUM, fontSize: 110, fontWeight: 800, color: '#D9822B'}}>
          <Count to={47.7} t={t[3]} decimals={1} dur={24} /> GiB
        </div>
        <Zh size={28} w={600}>→ offload 到主机内存</Zh>
      </Card>
      <Card x={1250} y={1420} w={1500} t={t[4]} rot={-0.5} kind="none" src="SGLang Cookbook · 单卡 RTX PRO 6000 · NVFP4" bg={W.paper} pad={32}>
        <Zh size={34} w={800}>
          RTX PRO 6000 · 96 GB
        </Zh>
        <div style={{position: 'relative', height: 64, background: '#E6E0D4', borderRadius: 8, marginTop: 16, overflow: 'hidden'}}>
          <div style={{width: `${(75 / 96) * 100 * vram}%`, height: '100%', background: '#4A78C2'}} />
          <div style={{position: 'absolute', left: 20, top: 8, fontFamily: FONT_NUM, fontSize: 38, fontWeight: 800, color: '#fff', opacity: clamp01(vram * 2)}}>
            显存常驻 ≈ 75 GB
          </div>
        </div>
        <Zh size={34} w={700} style={{marginTop: 18, opacity: prog(t[5], 12)}}>
          主机内存还要留 <span style={{fontFamily: FONT_NUM, color: W.string}}>64 GB</span>
        </Zh>
      </Card>
    </Wall>
  );
};

// ================================================================== outro
const TIERS = ['Max', 'Plus', 'Flash', '27B'];
export const Outro: SC = () => {
  const {B, t} = useB();
  const cams = [
    {f: 0, x: 2000, y: 760, z: 0.6},
    {f: B[1], x: 3110, y: 800, z: 1.0},
    {f: B[2], x: 2360, y: 800, z: 1.0},
    {f: B[3], x: 1930, y: 1150, z: 0.8},
    {f: B[6], x: 1930, y: 1250, z: 0.55},
  ];
  return (
    <Wall cams={cams} part="看点">
      {TIERS.map((n, i) => {
        const focus = n === 'Flash' || n === '27B';
        const dim = focus ? 0 : prog(t[0], 14, 10);
        return (
          <Card key={n} x={500 + i * 760} y={620} w={660} t={t[0] - i * 4} rot={i % 2 ? 1.3 : -1.3} kind="live" stampAt={6} bg="#101A2B" pad={34} dim={dim} src={focus ? undefined : '规格未公开'}>
            <div style={{fontFamily: FONT_NUM, fontSize: 34, color: '#7FB2FF'}}>Qwen4-</div>
            <div style={{fontFamily: FONT_NUM, fontSize: 96, fontWeight: 800, color: '#fff', lineHeight: 1.05}}>{n}</div>
          </Card>
        );
      })}
      <div style={{position: 'absolute', left: 2780, top: 980}}>
        <Stamp kind="infer" t={t[1] + 10} size={36} label="Dense？开源？待定" rot={-5} />
      </div>
      <div style={{position: 'absolute', left: 2020, top: 980}}>
        <Stamp kind="infer" t={t[2] + 6} size={36} label="≈ Flash-Next 调优" rot={4} />
      </div>
      <Note x={1080} y={1300} t={t[3]} rot={-2} w={1700} size={46}>
        等权重放出来，先测两件事：
        <div style={{opacity: prog(t[4], 12), fontSize: 40}}>① 51B N-gram 表在单卡上怎么 CPU offload 不爆显存</div>
        <div style={{opacity: prog(t[5], 12), fontSize: 40}}>② vLLM / SGLang 上真实的 decode 速度</div>
      </Note>
      {/* keep the closing still moving: a second string slowly ties Flash to 27B */}
      <Thread a={[2210, 620]} b={[2970, 620]} t={t[3] - 10} sag={160} />
    </Wall>
  );
};

// ================================================================== poster
// Cover A (default): "Qwen4 还没发 / 架构已开源两个月" + the config.json line. POSTER = 'B': the 1/9 training-cost hook.
export const POSTER: 'A' | 'B' = 'A';
export const Poster: React.FC<{w: number; h: number}> = ({w, h}) => {
  const tall = h > w;
  const k = tall ? 1080 / 1920 : 1;
  return (
    <div style={{width: w, height: h, background: W.wall, position: 'relative', overflow: 'hidden', fontFamily: FONT_ZH}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,240,220,0.04) 1.5px, transparent 2px), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '23px 23px, 120px 120px, 120px 120px',
        }}
      />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'}} />
      {POSTER === 'A' ? (
        <div style={{position: 'absolute', left: tall ? 70 : 110, top: tall ? 120 : 110, right: tall ? 70 : 110}}>
          <div style={{fontFamily: FONT_NUM, fontSize: tall ? 150 : 170, fontWeight: 900, color: W.chalk, lineHeight: 1}}>Qwen4</div>
          <div style={{fontSize: tall ? 96 : 104, fontWeight: 900, color: W.chalk, lineHeight: 1.2, marginTop: 18}}>
            还没发，
            {tall && <br />}
            <span style={{color: W.string}}>架构已开源</span>
          </div>
          <div style={{fontSize: tall ? 46 : 58, fontWeight: 700, color: W.chalkDim, marginTop: 14}}>官方代码、现场消息、传闻{tall ? <br /> : '，'}一条条核对</div>
        </div>
      ) : (
        <div style={{position: 'absolute', left: tall ? 70 : 110, top: tall ? 120 : 110, right: tall ? 70 : 110}}>
          <div style={{fontSize: tall ? 80 : 84, fontWeight: 900, color: W.chalk}}>Qwen4 架构预览</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 10}}>
            <span style={{fontFamily: FONT_NUM, fontSize: tall ? 250 : 280, fontWeight: 900, color: W.string, lineHeight: 1}}>1/9</span>
            <span style={{fontSize: tall ? 66 : 74, fontWeight: 900, color: W.chalk}}>训练算力</span>
          </div>
          <div style={{fontSize: tall ? 54 : 60, fontWeight: 800, color: W.chalk, marginTop: 10}}>14 项预训练 benchmark 赢 8 项</div>
          <div style={{fontSize: tall ? 38 : 40, fontWeight: 600, color: W.chalkDim, marginTop: 10}}>Qwen3.8-Flash-Next 对比 Qwen3.7-Plus · 技术报告</div>
        </div>
      )}
      {/* the evidence card */}
      <div
        style={{
          position: 'absolute',
          left: tall ? 70 : 1010,
          top: tall ? 800 : (POSTER === 'A' ? 600 : 700),
          width: tall ? 940 : (POSTER === 'A' ? 820 : 760),
          transform: `rotate(${POSTER === 'A' ? 1.5 : -1.5}deg)`,
          background: '#fff',
          padding: 18 * (tall ? 1.1 : 1),
          boxShadow: '0 24px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{fontFamily: FONT_MONO, fontSize: 20, color: W.dim, marginBottom: 10}}>Qwen3.8-Flash-Next / config.json</div>
        <div style={{position: 'relative', lineHeight: 0}}>
          <Img src={A.hfConfig} style={{width: '100%'}} />
          <svg style={{position: 'absolute', left: '17%', top: '46%', width: '40%', height: '24%', overflow: 'visible'}} viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx="50" cy="50" rx="52" ry="60" fill="none" stroke={W.string} strokeWidth="6" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div style={{position: 'absolute', left: -30, top: -34}}>
          <Stamp kind="official" t={100} size={tall ? 40 : 36} />
        </div>
        <div style={{position: 'absolute', left: '50%', top: -14, width: 30, height: 30, marginLeft: -15, borderRadius: 15, background: `radial-gradient(circle at 35% 35%, #FF8A80, ${W.pin} 55%, #8E1E18)`}} />
      </div>
      <div style={{position: 'absolute', left: tall ? 70 : 110, bottom: tall ? 80 : 90, display: 'flex', gap: 22}}>
        {(['official', 'live', 'rumor'] as const).map((kd, i) => (
          <Stamp key={kd} kind={kd} t={100} size={tall ? 40 : 36} rot={i % 2 ? 5 : -6} />
        ))}
      </div>
      {void k}
    </div>
  );
};
