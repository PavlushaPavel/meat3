import type { JSX } from 'react';
import { useCase } from '../../store/case';
import { SUSPECTS, CLUE1_SUSPECTS_INTRO } from '../../content/suspects';
import { SuspectLineup } from '../../mechanics/SuspectLineup';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Prose } from '../../ui/Prose';
import { Stamp } from '../../ui/Stamp';

/**
 * Экран 7 — `clue1-suspects` (SPEC.md §4). Один выбор, без оценки
 * правильности: штамп «ВЕРСИЯ ПРИНЯТА» падает после любого выбора, разбор —
 * только на экране 8.
 */
export function Clue1SuspectsScreen(): JSX.Element {
  const suspectPick = useCase((s) => s.suspectPick);
  const setSuspect = useCase((s) => s.setSuspect);
  const goNext = useCase((s) => s.goNext);

  return (
    <Screen>
      <Prose>{CLUE1_SUSPECTS_INTRO.paragraph}</Prose>
      <Prose>{CLUE1_SUSPECTS_INTRO.question}</Prose>
      <SuspectLineup suspects={SUSPECTS} value={suspectPick} onPick={setSuspect} />
      {suspectPick ? <Stamp>{CLUE1_SUSPECTS_INTRO.acceptedStamp}</Stamp> : null}
      <BottomBar>
        <Button onClick={goNext} disabled={!suspectPick}>
          {CLUE1_SUSPECTS_INTRO.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
