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
 */
export function FinalStrikeScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const [done, setDone] = useState(false);

  return (
    <Screen className="items-center justify-center">
      <Shatter text={FINAL_STRIKE.accusation} revealText={FINAL_STRIKE.result} onDone={() => setDone(true)} />
      <BottomBar>
        <Button onClick={goNext} disabled={!done}>
          {FINAL_STRIKE.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
