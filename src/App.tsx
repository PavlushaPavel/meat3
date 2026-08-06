import { useEffect } from 'react';
import { GravityField } from '@/mechanics/GravityField';
import { STEP_LAW } from '@/router/flow';
import { SCREENS } from '@/router/registry';
import { useFunnel } from '@/store/funnel';
import { initTelegram } from '@/lib/telegram';
import { LeverBar } from '@/ui/LeverBar';

/**
 * Оболочка воронки.
 *
 * Поле гравитации лежит фоном на всех экранах и меняет закон вместе с шагом —
 * переход между экранами читается как смена состояния мира, а не как смена
 * страницы (docs/SPEC.md §1 «Движение»).
 */
export default function App() {
  const step = useFunnel((s) => s.step);
  const law = STEP_LAW[step];
  const Screen = SCREENS[step];

  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-garden-ground">
      {/* Декоративный слой: сад. Нажатия не перехватывает. */}
      <GravityField law={law} className="fixed inset-0 z-0" />

      {/* Та же мера, что у контента: иначе на десктопе рычаги разъезжаются
          по краям экрана и перестают читаться как одна полоса прогресса. */}
      <header className="relative z-10 mx-auto w-full max-w-screen-sm px-4 pt-3">
        <LeverBar />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-screen-sm">
        <Screen />
      </main>
    </div>
  );
}
