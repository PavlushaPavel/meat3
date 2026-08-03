import { useState, type JSX } from 'react';
import { useCase } from '../../store/case';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { ChainRebuild } from '../../mechanics/ChainRebuild';
import { CLUE3_REBUILD } from '../../content/clues';
import { BeforeAfterPanel } from './BeforeAfterPanel';

/**
 * Экран 18 (clue3-rebuild), SPEC.md §4: «Собери страницу так, чтобы она
 * продолжала объявление». Кнопка завершения неактивна, пока ChainRebuild не
 * сообщит о пятом верном тапе — до этого момента блока «Было / Стало» тоже
 * нет (SPEC.md: он появляется «когда собраны все пять»).
 */
export function Clue3RebuildScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const [completed, setCompleted] = useState(false);

  return (
    <Screen>
      <Display size="md">{CLUE3_REBUILD.title}</Display>
      <Prose>{CLUE3_REBUILD.subtitle}</Prose>
      <ChainRebuild
        blocks={CLUE3_REBUILD.blocks}
        restoredLabel={CLUE3_REBUILD.restoredLabel}
        onComplete={() => setCompleted(true)}
      />
      {completed ? (
        <BeforeAfterPanel
          before={CLUE3_REBUILD.beforeAfter.before}
          after={CLUE3_REBUILD.beforeAfter.after}
          closingLine={CLUE3_REBUILD.closingLine}
        />
      ) : null}
      <BottomBar>
        <Button onClick={goNext} disabled={!completed}>
          {CLUE3_REBUILD.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
