import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { LIVES } from '@/content/quiz';
import { HazardTape } from '@/ui/HazardTape';
import { useReducedMotionLive } from './useReducedMotionLive';

/**
 * Реакция на потерю пробы, прямо над вопросом (docs/SPEC.md §3.4, §1
 * примета 3): «потеря пробы включает аварийную жёлтую разметку: партия
 * ближе к отбраковке». Этап 5 — один из двух, где `HazardTape` разрешена
 * (docs/SPEC.md §1, правило 4; `isHazardStage` в `src/acts.ts`).
 *
 * Это ВТОРОЙ, локальный слой разметки — не замена двум полосам, которые
 * `ActStage` уже держит вверху/внизу всего этапа 5 с постоянной
 * интенсивностью (та реагирует на этап в целом, не на ход теста). Здесь
 * интенсивность растёт с числом ПОТЕРЯННЫХ проб: пока все пять целы, полосы
 * нет вовсе — тревога появляется вместе с первой потерей, а не висит с
 * интро, и густеет по мере того, как проб остаётся всё меньше.
 *
 * Смена интенсивности при каждой новой потере — событие сцены (`flashKey`
 * приходит из `QuizScreen`, тот же счётчик, что раньше двигал полноэкранную
 * красную вспышку допросной снесённого мира актов): короткий наплыв, не
 * тихая подмена CSS-переменной. `prefers-reduced-motion` гасит наплыв —
 * полосы всё равно на нужной интенсивности, просто без движения.
 */
export interface ProbeAlarmProps {
  /** Сколько проб ещё цело — та же цифра, что в `Probes`. */
  probesLeft: number;
  /** Растёт при каждой потере пробы — форсирует наплыв на новую интенсивность. */
  flashKey: number;
  className?: string;
}

export function ProbeAlarm({ probesLeft, flashKey, className }: ProbeAlarmProps) {
  const reduced = useReducedMotionLive();
  const lost = LIVES - probesLeft;

  // Ни одна проба ещё не потеряна — полосы нет: тревога связана с фактом
  // потери, а не висит с первого кадра теста.
  if (lost <= 0) return null;

  // Гуще и быстрее с каждой следующей потерей: последняя цела проба — почти
  // полная тревога (0.35 → 1.0 по мере убывания LIVES - 1 потерь).
  const intensity = Math.min(1, 0.35 + (0.65 * lost) / Math.max(1, LIVES - 1));

  const tape = (
    <div className="relative h-3 w-full overflow-hidden">
      <HazardTape intensity={intensity} />
    </div>
  );

  return (
    <div aria-hidden className={cn('w-full', className)}>
      {reduced ? (
        tape
      ) : (
        <motion.div
          key={flashKey}
          initial={{ opacity: 0.25, scaleY: 0.5 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
        >
          {tape}
        </motion.div>
      )}
    </div>
  );
}
