import { useEffect, useRef, useState } from 'react';
import { actOfStep, isFirstStepOfAct, type ActId } from '@/acts';
import { SCREENS } from '@/router/registry';
import { useFunnel } from '@/store/funnel';
import { initTelegram } from '@/lib/telegram';
import { ActStage } from '@/ui/ActStage';
import { ActTitleCard } from '@/ui/ActTitleCard';
import { Badge } from '@/ui/Badge';

/**
 * Оболочка воронки.
 *
 * Мир меняется вместе с актом: сцена красит фон, свет, зерно и виньетку по
 * `data-act`, а вход в новый акт объявляется титульной карточкой — переход
 * этапа обязан читаться как событие, а не как смена фона (docs/SPEC.md §1, §3.8).
 */
export default function App() {
  const step = useFunnel((s) => s.step);
  const act = actOfStep(step);
  const Screen = SCREENS[step];

  // Какой акт уже объявлен карточкой. Первый акт объявляется тоже: воронка
  // начинается с титра, как серия.
  const announced = useRef<ActId | null>(null);
  const [titleAct, setTitleAct] = useState<ActId | null>(null);

  useEffect(() => {
    initTelegram();
  }, []);

  useEffect(() => {
    // Карточка показывается только на ПЕРВОМ шаге акта: внутри акта переходы
    // между экранами титром не разрываются.
    if (announced.current !== act && isFirstStepOfAct(step)) {
      announced.current = act;
      setTitleAct(act);
    }
  }, [act, step]);

  return (
    <ActStage act={act}>
      <header className="relative z-10 mx-auto w-full max-w-screen-sm px-4 pt-3">
        <Badge act={act} />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-screen-sm">
        <Screen />
      </main>

      {titleAct && <ActTitleCard act={titleAct} onDone={() => setTitleAct(null)} />}
    </ActStage>
  );
}
