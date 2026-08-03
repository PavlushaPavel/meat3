import type { JSX } from 'react';
import { motion } from 'motion/react';
import { quick } from '../lib/motion';

interface LifeMeterProps {
  lives: number;
  total: number;
}

/**
 * Счётчик жизней квиза (SPEC.md §4, экран 9): деления, потерянное гаснет и
 * краснеет. Только переход цвета и прозрачности — никакой тряски и
 * пульсации (docs/PLAN.md «Задача 2»). Живое деление не красится в `--lab`:
 * «зелёный означает ровно одно — компонент чист/подтверждён» (SPEC.md
 * §2.2), а оставшаяся жизнь — не подтверждённый выбор, поэтому нейтральный
 * `--paper`. Потерянное — `--alarm`, одно из ровно трёх мест на всю
 * воронку, где красный допустим (SPEC.md §2.2, экран 9).
 *
 * Анимируется через `motion` (не CSS `transition`), поэтому не гасится
 * общей CSS-страховкой `prefers-reduced-motion` в globals.css: переходы
 * прозрачности обязаны оставаться и при reduced motion — они объясняют
 * смену состояния (SPEC.md §2.5). Здесь нет ни transform, ни сдвига, ни
 * поворота — только opacity/backgroundColor, поэтому ветвления на
 * `useReducedMotion()` не требуется вообще.
 */
export function LifeMeter({ lives, total }: LifeMeterProps): JSX.Element {
  return (
    <div
      className="flex gap-2"
      role="meter"
      aria-valuenow={lives}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      {Array.from({ length: total }, (_, i) => {
        const alive = i < lives;
        return (
          <motion.span
            key={i}
            data-alive={alive}
            className="h-2 flex-1 rounded-chip"
            animate={{
              backgroundColor: alive ? 'var(--paper)' : 'var(--alarm)',
              opacity: alive ? 1 : 0.4,
            }}
            transition={quick}
          />
        );
      })}
    </div>
  );
}
