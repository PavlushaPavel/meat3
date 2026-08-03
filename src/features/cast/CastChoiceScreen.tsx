import type { JSX } from 'react';
import { useFunnel } from '../../store/funnel';
import { castChoiceContent } from '../../content';
import { CastDeck } from '../../mechanics/CastDeck';
import { Screen } from '../../ui/Screen';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { BatchLabel } from '../../ui/BatchLabel';
import { Button } from '../../ui/Button';
import { BottomBar } from '../../ui/BottomBar';

/**
 * Экран 3 — `cast-choice` (SPEC.md §4). Интерактивная пауза внутри первого
 * видео: выбор сохраняется в `castPick` (SPEC.md §6), оценки правильности
 * нет ни в одном месте экрана — `CastDeck`/`Buyer` физически её не несут.
 */
export function CastChoiceScreen(): JSX.Element {
  const castPick = useFunnel((s) => s.castPick);
  const setCastPick = useFunnel((s) => s.setCastPick);
  const goNext = useFunnel((s) => s.goNext);

  return (
    <Screen>
      <Display size="lg">{castChoiceContent.title}</Display>
      <CastDeck buyers={castChoiceContent.buyers} value={castPick} onSelect={setCastPick} />
      {castChoiceContent.subcopy.map((paragraph, i) => (
        <Prose key={i}>{paragraph}</Prose>
      ))}
      {castPick ? <BatchLabel tone="lab">{castChoiceContent.confirmedLabel}</BatchLabel> : null}
      <BottomBar>
        <Button onClick={goNext} disabled={!castPick}>
          {castChoiceContent.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
