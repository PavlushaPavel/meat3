import type { JSX } from 'react';

// React 19 больше не выставляет глобальный неймспейс JSX — импортируем его
// явно из 'react', иначе `JSX.Element` не резолвится (TS2503).
interface StepFallbackProps {
  id: string;
}

/**
 * Заглушка шага, который ещё не собран своим актом. Держит маршрут проходимым
 * от задачи 1 до того, как задачи 4/5/6 подставят настоящие экраны в
 * ACTS_A/B/C (SPEC.md §3).
 */
export function StepFallback({ id }: StepFallbackProps): JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-ink-900 px-gutter text-center">
      <p className="font-mono uppercase tracking-wide text-fog">Экран ещё не собран</p>
      <p className="font-mono text-signal">{id}</p>
    </div>
  );
}
