// A custom scene: a terminal on the left that types a command when narration line 1 starts,
// and a result card that pops in on line 2. Copy this shape for new scenes; import the renderer as '@atv/lib/...'.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TipHeader} from '@atv/lib/chrome';
import {appear, Stage, Typed, useTh} from '@atv/lib/stage';
import {C} from '@atv/lib/theme';
import {prog, useBeats, usePop} from '@atv/lib/timing';
import type {Scene} from '@atv/lib/types';
import {Card, CheckBadge, T, Terminal} from '@atv/lib/ui';

export const Example: React.FC<{scene: Scene}> = ({scene}) => {
  const th = useTh();
  const b = useBeats(); // b[i] = frames since narration line i started (negative before it)
  const frame = useCurrentFrame();
  const pop = usePop();
  const d = scene.data ?? {};
  return (
    <AbsoluteFill>
      <TipHeader num={Number(d.num ?? 1)} title={d.title ?? '示例场景'} th={th} />
      <Stage style={{display: 'flex', gap: 40, alignItems: 'center'}}>
        <div style={{flex: 1, ...appear(frame, 6)}}>
          <Terminal title="Terminal" width={900}>
            <span style={{color: th.accent}}>$ </span>
            <Typed text={d.command ?? 'echo hello'} f={b[1]} caret />
          </Terminal>
        </div>
        <div style={pop(b[2], 0, 0.7)}>
          <Card style={{width: 620, display: 'flex', gap: 20, alignItems: 'center'}}>
            <CheckBadge p={prog(b[2], 12, 6)} />
            <T size={34} weight={800} color={C.ink}>
              {d.result ?? '完成'}
            </T>
          </Card>
        </div>
      </Stage>
    </AbsoluteFill>
  );
};
