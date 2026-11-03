"""Build the small JSON files the scenes read, from the post's own figure data and the authors' released logs.

usage: python build.py <blog dir> <logs dir>
  <blog dir>: a copy of https://rikiyat.github.io/blog/weight-space-programming/ assets (assets/traces/*.json,
              assets/gohand/gohand.json, assets/mathedit/*.json, assets/which_game/*.gif, assets/carjump_scene.svg)
  <logs dir>: a clone of https://github.com/RikiyaT/lm_understand-logs
Everything written here is a re-encoding of those files (no invented numbers).
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

BLOG, LOGS = Path(sys.argv[1]), Path(sys.argv[2])
OUT = Path(__file__).parent
A = BLOG / 'assets'
def dump(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, separators=(',', ':')))
    print(name, (OUT / name).stat().st_size)

# ---------------------------------------------------------------- exp1: gameplay GIFs -> 10x10 palette frames
games = {}
for g in ['breakout', 'pong', 'pacman', 'freeway']:
    im = Image.open(A / 'which_game' / f'{g}.gif')
    pal, frames, durs = [], [], []
    for k in range(im.n_frames):
        im.seek(k)
        rgb = im.convert('RGB')
        cell = rgb.size[0] // 10
        row = ''
        for r in range(10):
            for c in range(10):
                px = rgb.getpixel((c * cell + cell // 2, r * cell + cell // 2))
                h = '#%02x%02x%02x' % px
                if h not in pal: pal.append(h)
                row += chr(65 + pal.index(h))
        frames.append(row)
        durs.append(im.info.get('duration', 100))
    games[g] = {'pal': pal, 'frames': frames, 'ms': durs}
dump('games.json', games)

# ---------------------------------------------------------------- exp1: Breakout first-layer weights per input channel
z = np.load(LOGS / 'exp1_which_game/networks/a9f535cc.npz')
W1 = z['actor/dense1/kernel']  # (500, 32); input i = (row*10+col)*5 + channel
heat = {}
for ch in range(5):
    rows = W1[ch::5]  # 100 cells x 32
    heat[ch] = np.round(np.abs(rows).max(axis=1).reshape(10, 10), 3).tolist()  # strongest weight from each cell
traces = json.loads((A / 'traces/exp1_games.json').read_text())
br = next(it for it in traces['items'] if it['label'] == 'Breakout')
wall = [{'label': b['label'].split(':')[0], 'values': b['values'], 'marks': b['marks']}
        for b in br['prompt'] if isinstance(b, dict) and b.get('values')]
dump('exp1.json', {'heat_maxabs': heat, 'wall': wall,
                   'note': 'heat = max |W1| over the 32 hidden units, per grid cell, Breakout net a9f535cc'})

# ---------------------------------------------------------------- exp2: diffusion samples + Astra's drawings
d = json.loads((A / 'traces/exp1_diffusion.json').read_text())
diff = {}
for it in d['items']:
    pre = [b['pre'] for b in it['brief'] if 'pre' in b]
    diff[it['label']] = {'samples': it['samples'][:6], 'astra': pre[0].split('\n') if pre else []}
dump('exp2.json', diff)

# ---------------------------------------------------------------- exp4: car scene (SMIL keyframes -> arrays)
svg = (A / 'carjump_scene.svg').read_text()
bodies = []
for m in re.finditer(r'<g transform="translate\(([-\d.]+) ([-\d.]+)\)"><animateTransform[^>]*keyTimes="([^"]+)" values="([^"]+)"/>'
                     r'<g transform="rotate\(([-\d.]+)\)"><animateTransform[^>]*keyTimes="([^"]+)" values="([^"]+)"/>(.*?)</g></g>', svg):
    tv = [[float(x) for x in v.split()] for v in m.group(4).split(';')]
    rv = [float(v) for v in m.group(7).split(';')]
    kt = [float(x) for x in m.group(3).split(';')]
    inner = m.group(8)
    before = svg[:m.start()]
    faded = before.count('<g opacity="0.38">') > 0 and before.rfind('<g opacity="0.38">') > before.rfind('</g>\n<g>')
    bodies.append({'kt': kt, 't': tv, 'r': rv, 'svg': inner, 'faded': faded})
static = svg[svg.index('<g transform="translate(17 305)'):]
static = static[:static.index('<g transform="translate(0.1925')]
dump('car.json', {'dur': 5.2, 'static': static.split('\n', 1)[1], 'bodies': bodies})

# ---------------------------------------------------------------- exp5: Astra-written networks playing (handplay frames)
B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
DEC = {c: i for i, c in enumerate(B64)}
w = json.loads((A / 'traces/exp4_write.json').read_text())
plays = {}
for it in w['items']:
    p = it['play']
    cur = [0] * 100
    grids, cum, s = [], [], 0.0
    for t, f in enumerate(p['frames'][:600]):
        for k in range(0, len(f), 3):
            cur[DEC[f[k]] * 64 + DEC[f[k + 1]]] = DEC[f[k + 2]]
        grids.append(''.join(B64[v] for v in cur))
        if t: s += p['rewards'].get(str(t - 1), 0) if isinstance(p['rewards'], dict) else 0
        cum.append(s)
    plays[it['label']] = {'channels': p['channels'], 'grids': grids, 'score': cum, 'final': p['score']}
dump('play.json', plays)

# ---------------------------------------------------------------- exp6: Go
g = json.loads((A / 'gohand/gohand.json').read_text())
go = {'budgets': [{k: b[k] for k in ['passes', 'ppo_s0', 'ppo_s2', 'same_size']} for b in g['budgets']]}
steps = []
for st in g['budgets'][3]['steps']:
    e = {'kind': st['kind'], 'used': st['used']}
    if st.get('note'): e['note'] = st['note']
    if st.get('best'): e['best'] = True
    if st.get('opp', {}).get('strong'): e['vsPPO'] = st['opp']['strong'][1]  # practice win % vs the third PPO net
    steps.append(e)
go['steps50'] = steps
dump('go.json', go)

# ---------------------------------------------------------------- exp8: Qwen trajectory + benchmarks
t = json.loads((A / 'mathedit/trajectories.json').read_text())
r = next(x for x in t['runs'] if x['budget'] == 50)
turns = []
for tu in r['turns']:
    e = {'turn': tu['turn'], 'used': tu['used'], 'after': tu['used_after'], 'kind': tu['kind'], 'edit': bool(tu.get('edit'))}
    if tu.get('pass'):
        e['pass'] = {k: tu['pass'][k] for k in ['number', 'type', 'model', 'items', 'original', 'edited', 'cut', 'cut_original', 'cut_edited', 'failed'] if k in tu['pass']}
    if tu.get('hypothesis'): e['hyp'] = tu['hypothesis']
    turns.append(e)
bm = json.loads((A / 'mathedit/benchmarks.json').read_text())
dump('qwen.json', {'turns': turns, 'bench': [{'name': b['name'], 'group': b['group'], 'scores': [p['score'] for p in b['points']]} for b in bm['benchmarks']]})
