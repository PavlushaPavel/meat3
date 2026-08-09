import { useEffect, useState } from 'react';
import { SCREENS } from '@/router/registry';
import { actOfStep } from '@/router/flow';
import { useFunnel } from '@/store/funnel';
import { initTelegram } from '@/lib/telegram';
import { track } from '@/lib/analytics';
import { stepIndex } from '@/router/flow';
import { CityStage } from '@/ui/CityStage';
import { DebugBar } from '@/ui/DebugBar';
import { isDebugEnabled } from '@/lib/debug';

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
  // Читается один раз за загрузку: флаг не меняется по ходу сессии.
  const [debug] = useState(isDebugEnabled);

  useEffect(() => {
    initTelegram();
  }, []);

  // Новый шаг — новый экран: прокрутка возвращается наверх. Без этого человек
  // приезжает на следующий экран в середину текста. Прокручивается документ,
  // а не контейнер: своей области прокрутки у оболочки нет.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  // Каждый показ экрана — событие. Из них и собирается воронка отвала: без
  // неё непонятно, на каком из тридцати с лишним шагов теряются люди.
  const district = useFunnel((s) => s.district);
  useEffect(() => {
    track('step', { step, index: stepIndex(step) + 1, district: district ?? '' });
  }, [step, district]);

  return (
    <>
      {/*
        Панель отладки живёт НАД сценой и в потоке документа: так она не может
        перекрыть ни главное действие внизу, ни счётчик зон на карте. Без
        `?debug` в адресе её нет в разметке вообще.
      */}
      {debug && <DebugBar />}
      <CityStage act={act} step={step}>
        <Screen />
      </CityStage>
    </>
  );
}
