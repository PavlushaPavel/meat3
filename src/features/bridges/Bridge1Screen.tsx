import { useState } from 'react';
import type { JSX } from 'react';
import { useCase } from '../../store/case';
import { BRIDGE_1 } from '../../content/bridges';
import { ThoughtSwap } from '../../mechanics/ThoughtSwap';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Prose } from '../../ui/Prose';
import { SystemLabel } from '../../ui/SystemLabel';
import { LeverMeter } from '../../ui/LeverMeter';

/**
 * Экран 10 — `bridge-1` (SPEC.md §4). Кнопка «дальше» гейтится завершением
 * `ThoughtSwap`: смена мысли — весь смысл экрана, пропускать её на первом же
 * кадре нельзя (тот же принцип, что у экрана 4 «Пролистай все четыре»).
 */
export function Bridge1Screen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const [swapDone, setSwapDone] = useState(false);

  return (
    <Screen>
      <ThoughtSwap
        from={BRIDGE_1.thoughtSwap.from}
        to={BRIDGE_1.thoughtSwap.to}
        onDone={() => setSwapDone(true)}
      />
      <Prose>{BRIDGE_1.caption}</Prose>
      <div className="flex flex-col gap-2">
        <SystemLabel>{BRIDGE_1.leverCaption}</SystemLabel>
        <LeverMeter opened={1} />
      </div>
      <BottomBar>
        <Button onClick={goNext} disabled={!swapDone}>
          {BRIDGE_1.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
