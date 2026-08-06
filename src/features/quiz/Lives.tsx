import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { LIVES } from '@/content/quiz';
import { useReducedMotionLive } from './useReducedMotionLive';

/**
 * Жизни допуска — не строчка «осталось 3», а ряд предметных жетонов
 * (docs/SPEC.md §1, §3.4). Грейд акта V: тревожный красный на чёрном, лампа
 * сверху — `--color-accent` здесь и так уже тревожный красный, поэтому живая
 * жизнь читается заливкой акцента, а погасшая — пустым контуром: форма и
 * заливка разные, не только оттенок (требование доступности допуска).
 *
 * Потеря жизни — событие, а не тихая смена цифры (docs/SPEC.md §1
 * «Движение»): жетон гаснет с коротким движением, не мгновенно. При
 * `prefers-reduced-motion` жетоны сразу стоят в текущем состоянии — без
 * анимации, но фигура (заливка/контур) всё равно отличает живую жизнь от
 * потерянной, поэтому воронка остаётся осмысленной и без движения.
 */
export interface LivesProps {
  /** Сколько жизней ещё цело, 0..LIVES. */
  lives: number;
  /** Момент допуска: жетоны получают тёплое свечение победы. */
  celebrate?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}

const CELL_SIZE: Record<NonNullable<LivesProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  lg: 'h-5 w-5',
};

function cellClass(alive: boolean, size: NonNullable<LivesProps['size']>, celebrate: boolean): string {
  return cn(
    'block shrink-0 border',
    CELL_SIZE[size],
    alive ? cn('border-accent bg-accent', celebrate && 'shadow-glow-accent') : 'border-ink-dim/50 bg-transparent',
  );
}

export function Lives({ lives, celebrate = false, size = 'sm', className }: LivesProps) {
  const reduced = useReducedMotionLive();
  const cells = Array.from({ length: LIVES }, (_, i) => i);

  return (
    <div
      role="group"
      aria-label={`Жизней: ${lives} из ${LIVES}`}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      {cells.map((i) => {
        const alive = i < lives;
        const cls = cellClass(alive, size, celebrate);
        return reduced ? (
          <span key={i} className={cls} />
        ) : (
          <motion.span
            key={i}
            initial={false}
            animate={{ opacity: alive ? 1 : 0.4, scale: alive ? 1 : 0.8 }}
            transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
            className={cls}
          />
        );
      })}
    </div>
  );
}
