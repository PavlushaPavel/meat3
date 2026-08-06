import { useCallback } from 'react';
import { haptics } from '@/lib/telegram';
import { useFunnel } from '@/store/funnel';
import { nextStep, type StepKey } from './flow';

/**
 * Навигация по воронке.
 *
 * Каждый переход даёт тактильный отклик — внутри Telegram это делает движение
 * физическим, вне его обёртка `telegram.ts` подставляет пустышку. Скролл
 * сбрасывается наверх: следующий экран обязан начинаться с начала, иначе
 * человек попадает в середину нового текста.
 */
export function useStepNav() {
  const goTo = useFunnel((s) => s.goTo);

  const go = useCallback(
    (step: StepKey) => {
      haptics.light();
      goTo(step);
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [goTo],
  );

  const next = useCallback(() => {
    const current = useFunnel.getState().step;
    const target = nextStep(current);
    if (target) go(target);
  }, [go]);

  return { go, next };
}
