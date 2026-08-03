import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { ChoiceList } from '../../ui/ChoiceList';
import { useCase } from '../../store/case';
import { WANTS } from '../../content';

/**
 * Экран 5 — `wants` (SPEC.md §4). Множественный выбор через `toggleWant`,
 * кнопка активна от одного выбора, подтверждение появляется после первого.
 * Каскад появления вариантов — внутри ChoiceList, экран его не заворачивает
 * отдельно.
 */
export function WantsScreen(): JSX.Element {
  const wants = useCase((s) => s.wants);
  const toggleWant = useCase((s) => s.toggleWant);
  const goNext = useCase((s) => s.goNext);

  const hasSelection = wants.length > 0;

  return (
    <Screen>
      <div className="flex flex-col gap-2">
        <Display size="lg">{WANTS.title}</Display>
        <p className="font-body text-3 text-fog">{WANTS.subtitle}</p>
      </div>

      <ChoiceList options={WANTS.options} value={wants} onChange={toggleWant} multi />

      {hasSelection ? <Prose>{WANTS.afterFirstSelect}</Prose> : null}

      <BottomBar>
        <Button onClick={goNext} disabled={!hasSelection}>
          {WANTS.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
