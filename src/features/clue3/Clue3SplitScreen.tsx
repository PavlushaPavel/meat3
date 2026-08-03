import type { JSX } from 'react';
import { useCase } from '../../store/case';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Prose } from '../../ui/Prose';
import { LinkBreak } from '../../mechanics/LinkBreak';
import { CLUE3_SPLIT } from '../../content/clues';

/** Экран 17 (clue3-split), SPEC.md §4: разрыв логики после клика. */
export function Clue3SplitScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);

  return (
    <Screen>
      <LinkBreak left={CLUE3_SPLIT.adCard} right={CLUE3_SPLIT.landingCard} caption={CLUE3_SPLIT.breakLabel} />
      {CLUE3_SPLIT.paragraphs.map((paragraph) => (
        <Prose key={paragraph}>{paragraph}</Prose>
      ))}
      <BottomBar>
        <Button onClick={goNext}>{CLUE3_SPLIT.button}</Button>
      </BottomBar>
    </Screen>
  );
}
