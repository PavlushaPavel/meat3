import { useState } from 'react';
import type { JSX } from 'react';
import { useCase } from '../../store/case';
import { CLUE2_SLIPPERY } from '../../content/clues';
import { SlipperyOffer } from '../../mechanics/SlipperyOffer';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Prose } from '../../ui/Prose';
import { Stamp } from '../../ui/Stamp';

/**
 * Экран 12 — `clue2-slippery` (SPEC.md §4). Когда `SlipperyOffer` гасит все
 * шесть фраз, падает штамп `--alarm` (одно из ровно четырёх разрешённых мест
 * для этого цвета, SPEC.md §2.1) и открывается контрпример в рамке
 * `--evidence`. Кнопка «Дальше» недоступна, пока экран не отработал целиком.
 */
export function Clue2SlipperyScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const [allDimmed, setAllDimmed] = useState(false);

  return (
    <Screen>
      {CLUE2_SLIPPERY.intro.map((line) => (
        <Prose key={line}>{line}</Prose>
      ))}

      <SlipperyOffer phrases={CLUE2_SLIPPERY.phrases} onAllDimmed={() => setAllDimmed(true)} />

      {allDimmed ? (
        <div className="flex flex-col gap-4">
          <Stamp tone="alarm">{CLUE2_SLIPPERY.stamp}</Stamp>
          <div className="rounded-card border border-evidence px-4 py-4">
            <Prose>{CLUE2_SLIPPERY.counterExample}</Prose>
          </div>
          <Prose>{CLUE2_SLIPPERY.caption}</Prose>
        </div>
      ) : null}

      <BottomBar>
        <Button onClick={goNext} disabled={!allDimmed}>
          {CLUE2_SLIPPERY.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
