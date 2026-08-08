import { LIVES } from '@/content/quiz';
import { cn } from '@/lib/cn';

/**
 * Держатель с пятью образцами — он же индикатор жизней.
 *
 * ВИЗУАЛЬНО КОЛБЫ, НА СЛОВАХ ЖИЗНИ. Прямое указание заказчика: метафора мира не
 * должна съедать понятную механику. Человек видит лабораторный штатив, а в
 * тексте читает «у тебя пять жизней» (docs/SPEC.md §4.3).
 */
export function Vials({ lives, className }: { lives: number; className?: string }) {
  return (
    <div
      className={cn('flex items-end justify-center gap-2', className)}
      role="img"
      aria-label={`Осталось жизней: ${lives} из ${LIVES}`}
    >
      {Array.from({ length: LIVES }, (_, i) => (
        <Vial key={i} alive={i < lives} />
      ))}
    </div>
  );
}

function Vial({ alive }: { alive: boolean }) {
  return (
    <div aria-hidden="true" className="flex w-9 flex-col items-center">
      {/* Металлическая крышка держателя. */}
      <span className="metal-panel h-2 w-7 rounded-t-sm" />

      {/* Стекло. */}
      <span
        className={cn(
          'relative flex h-14 w-full items-center justify-center rounded-b-lg border-x border-b transition-colors duration-300',
          alive
            ? 'border-neon/40 bg-neon/5'
            : 'border-line bg-scene-deep',
        )}
      >
        {/* Блик на стекле — без него колба читается как пустая рамка. */}
        <span className="absolute left-1.5 top-2 h-8 w-1 rounded-full bg-white/10" />

        <svg
          viewBox="0 0 24 24"
          className={cn(
            'size-5 transition-colors duration-300',
            alive ? 'text-alarm' : 'text-line',
          )}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 21s-7.5-4.7-9.3-9.2C1.3 8.3 3.3 5 6.6 5c2 0 3.4 1.1 4.2 2.3l1.2 1.8 1.2-1.8C14 6.1 15.4 5 17.4 5c3.3 0 5.3 3.3 3.9 6.8C19.5 16.3 12 21 12 21z" />
        </svg>

        {alive && (
          <span className="absolute inset-x-0 bottom-0 h-1.5 rounded-b-lg bg-neon/50" />
        )}
      </span>
    </div>
  );
}
