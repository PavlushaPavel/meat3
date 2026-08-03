import { useEffect, type JSX } from 'react';
import { useCase } from '../../store/case';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Stamp } from '../../ui/Stamp';
import { Prose } from '../../ui/Prose';
import { SystemLabel } from '../../ui/SystemLabel';
import { LeverMeter } from '../../ui/LeverMeter';
import { VasyaScene } from '../../scene/VasyaScene';
import { CLUES, CLUE3_FOUND } from '../../content/clues';

const CLUE_3 = CLUES[2];

/**
 * Экран 19 (clue3-found), SPEC.md §4: третья и последняя улика. `findClue(3)`
 * фиксируется при монтировании — аналогично тому, как первая улика находится
 * на экране 8 (clue1-debrief), а не на экране разблокировки инструмента.
 */
export function Clue3FoundScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const findClue = useCase((s) => s.findClue);

  useEffect(() => {
    findClue(3);
  }, [findClue]);

  return (
    <Screen>
      <VasyaScene variant="assembling" />
      <Stamp tone="evidence">{CLUE_3.stamp}</Stamp>
      <Prose>{CLUE_3.verdict}</Prose>
      <div className="flex flex-col gap-2">
        <LeverMeter opened={3} />
        <SystemLabel>{CLUE3_FOUND.leverCaption}</SystemLabel>
      </div>
      <BottomBar>
        <Button onClick={goNext}>{CLUE3_FOUND.button}</Button>
      </BottomBar>
    </Screen>
  );
}
