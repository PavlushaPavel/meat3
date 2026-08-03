import { useState, type JSX } from 'react';
import { useCase } from '../../store/case';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Shatter } from '../../mechanics/Shatter';
import { FINAL_STRIKE } from '../../content/final';

/**
 * Экран 21 (final-strike), SPEC.md §4: обвинение распадается на буквы,
 * на его месте проявляется новая строка. Кнопка «Ещё один вопрос» неактивна,
 * пока сцена не доиграна — она не должна прерывать кульминацию.
 *
 * Центрирование — на обёртке вокруг `Shatter`, не на самом `Screen`: `items-
 * center` на корневом флекс-контейнере экрана сжимал `BottomBar` (и лежащую
 * в нём `Button`) до ширины содержимого вместо полной ширины экрана — это и
 * была причина, по которой кнопка здесь единственная в сборке была не во всю
 * ширину (см. отчёт финальной доводки, пункт про хвосты интерфейса).
 */
export function FinalStrikeScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const [done, setDone] = useState(false);

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center">
        <Shatter text={FINAL_STRIKE.accusation} revealText={FINAL_STRIKE.result} onDone={() => setDone(true)} />
      </div>
      <BottomBar>
        <Button onClick={goNext} disabled={!done}>
          {FINAL_STRIKE.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
