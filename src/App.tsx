import { useEffect, useRef, useState } from 'react';
import { stageOfStep, isFirstStepOfStage, type StageId } from '@/acts';
import { SCREENS } from '@/router/registry';
import { useFunnel } from '@/store/funnel';
import { initTelegram } from '@/lib/telegram';
import { ActStage } from '@/ui/ActStage';
import { StageCard } from '@/ui/StageCard';
import { Crystal } from '@/ui/Crystal';
import { PurityMeter } from '@/ui/PurityMeter';

/**
 * Оболочка воронки.
 *
 * Мир меняется вместе с этапом синтеза: сцена красит фон, свет, зерно и
 * виньетку по `data-stage`, а вход в новый этап объявляется карточкой стадии
 * — переход обязан читаться как событие, а не как смена фона (docs/SPEC.md
 * §1, §3.8). Прогресс виден всегда — показателем чистоты и кристаллом в
 * шапке, не шкалой (docs/SPEC.md §2): раньше здесь был бейдж допуска
 * (`Badge`), теперь его заменяют напрямую `PurityMeter` + `Crystal`
 * (docs/SPEC.md §1, приметы 1 и 2) — обёртка была не нужна, оба компонента
 * уже самодостаточны по пропу `stage`.
 */
export default function App() {
  const step = useFunnel((s) => s.step);
  const stage = stageOfStep(step);
  const Screen = SCREENS[step];

  // Какой этап уже объявлен карточкой. Первый этап объявляется тоже: воронка
  // начинается с показания прибора, как и всё остальное в ней.
  const announced = useRef<StageId | null>(null);
  const [cardStage, setCardStage] = useState<StageId | null>(null);

  useEffect(() => {
    initTelegram();
  }, []);

  useEffect(() => {
    // Карточка показывается только на ПЕРВОМ шаге этапа: внутри этапа
    // переходы между экранами карточкой не разрываются.
    if (announced.current !== stage && isFirstStepOfStage(step)) {
      announced.current = stage;
      setCardStage(stage);
    }
  }, [stage, step]);

  return (
    <ActStage stage={stage}>
      <header className="relative z-10 mx-auto flex w-full max-w-screen-sm items-center gap-3 px-4 pt-3">
        <Crystal stage={stage} />
        <PurityMeter stage={stage} className="flex-1" />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-screen-sm">
        <Screen />
      </main>

      {cardStage && <StageCard stage={cardStage} onDone={() => setCardStage(null)} />}
    </ActStage>
  );
}
