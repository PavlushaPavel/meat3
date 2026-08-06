import { cn } from '@/lib/cn';
import { levers } from '@/content/offer';
import { useFunnel } from '@/store/funnel';

/**
 * Три рычага — сквозной прогресс воронки, видимый на всех экранах.
 *
 * Открытый рычаг светится UPDRAFT, неоткрытый лежит в ORBIT (docs/SPEC.md §2).
 * Это единственный индикатор прогресса: процентов и шагов «3 из 14» здесь нет,
 * потому что человеку важно не сколько осталось, а что он уже забрал.
 */
export function LeverBar({ className }: { className?: string }) {
  const unlocked = useFunnel((s) => s.levers);

  return (
    <nav
      aria-label="Рычаги, которые ты забрал"
      // Три подписи обязаны уместиться в 390px — самый узкий телефон, на
      // котором это открывают. Отсюда кегль 10px и узкий трекинг: полоса не
      // имеет права уезжать за край.
      className={cn('flex w-full items-center justify-between gap-1', className)}
    >
      {levers.map((lever) => {
        const isOpen = unlocked.includes(lever.id);
        return (
          <span
            key={lever.id}
            className={cn(
              'flex min-w-0 items-center gap-1.5 rounded-full px-2 py-1',
              'font-legend text-[10px] uppercase tracking-[0.02em]',
              'transition-colors duration-200 ease-drift',
              isOpen
                ? 'bg-updraft/15 text-updraft'
                : 'bg-transparent text-moss-veil/55',
            )}
          >
            {/* Капля: полная у открытого рычага, контурная у закрытого. */}
            <span
              aria-hidden
              className={cn(
                'block h-[7px] w-[7px] rounded-full',
                isOpen ? 'bg-updraft' : 'border border-moss-veil/50',
              )}
            />
            <span className="whitespace-nowrap">{lever.label}</span>
            <span className="sr-only">{isOpen ? '— забран' : '— пока закрыт'}</span>
          </span>
        );
      })}
    </nav>
  );
}
