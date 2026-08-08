import { useEffect } from 'react';
import { SCREENS } from '@/router/registry';
import { actOfStep } from '@/router/flow';
import { useFunnel } from '@/store/funnel';
import { initTelegram } from '@/lib/telegram';
import { CityStage } from '@/ui/CityStage';

/**
 * Оболочка воронки.
 *
 * Здесь ровно три обязанности и ни одной строки копирайта:
 *  1. поднять Telegram Mini App;
 *  2. объявить акт — от него зависит вся палитра сцены (tokens.css);
 *  3. показать экран текущего шага.
 *
 * ПРОГРЕССА В ШАПКЕ НЕТ, и это решение, а не пропуск. В прежнем мире вверху
 * висел прибор с показателем чистоты. Здесь индикатор прогресса — сама карта
 * города, и она появляется на своих шагах целым экраном. Второй индикатор
 * рядом отбирал бы у неё ровно тот смысл, ради которого построена воронка
 * (docs/SPEC.md §1, §3.8).
 */
export default function App() {
  const step = useFunnel((s) => s.step);
  const Screen = SCREENS[step];
  const act = actOfStep(step);

  useEffect(() => {
    initTelegram();
  }, []);

  // Новый шаг — новый экран: прокрутка возвращается наверх. Без этого человек
  // приезжает на следующий экран в середину текста. Прокручивается документ,
  // а не контейнер: своей области прокрутки у оболочки нет.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  return (
    <CityStage act={act}>
      <Screen />
    </CityStage>
  );
}
