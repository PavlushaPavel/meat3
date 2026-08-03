import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { ChoiceList } from '../../ui/ChoiceList';
import { useCase } from '../../store/case';
import { VERDICT_FIRST } from '../../content';

/**
 * Экран 3 — `verdict-first` (SPEC.md §4). Несущая механика воронки: ответ
 * сохраняется через `setVerdictFirst` и предъявляется на экране 22. Никакой
 * оценки выбора не даём ни в каком виде — `ChoiceList`/`Choice` (src/ui) уже
 * реализуют это правило (подсветка только цветом --signal, без «правильно/
 * неправильно»), экран здесь ничего не подмешивает поверх. Каскад появления
 * вариантов — тоже внутри ChoiceList, экран его не заворачивает отдельно.
 */
export function FirstVerdictScreen(): JSX.Element {
  const verdictFirst = useCase((s) => s.verdictFirst);
  const setVerdictFirst = useCase((s) => s.setVerdictFirst);
  const goNext = useCase((s) => s.goNext);

  const hasAnswer = verdictFirst !== null;

  return (
    <Screen>
      <Display size="lg">{VERDICT_FIRST.title}</Display>

      <ChoiceList options={VERDICT_FIRST.options} value={verdictFirst ?? ''} onChange={setVerdictFirst} />

      {hasAnswer ? <Prose>{VERDICT_FIRST.afterSelectCaption}</Prose> : null}

      <BottomBar>
        <Button onClick={goNext} disabled={!hasAnswer}>
          {VERDICT_FIRST.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
