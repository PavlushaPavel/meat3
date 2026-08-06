import { cn } from '@/lib/cn';
import { ACTS, type ActId } from '@/acts';
import { BADGE_LEGEND, BADGE_STATUS } from '@/content/badge';

/**
 * Бейдж допуска — сквозной прогресс воронки, показанный предметно
 * (docs/SPEC.md §3.7): карточка-пропуск со статусом, а не проценты и не
 * абстрактная шкала. Статус меняется в момент перехода акта — от
 * «посторонний» в начале до «допущен» после теста, тексты живут в
 * `src/content/badge.ts`, компонент их не придумывает.
 *
 * Форма — сам пропуск: жёсткий прямоугольник (радиус мира маленький),
 * слева квадрат с римским номером текущего акта, справа легенда и статус.
 * Все три подписи набраны легендой мира (моноширинный) кроме самого
 * статуса — тот идёт дисплеем: это то единственное слово, которое должно
 * читаться с одного взгляда, а не проверяться, как номер.
 */

export interface BadgeProps {
  /** Текущий акт — определяет и римский номер, и статус пропуска. */
  act: ActId;
  className?: string;
}

export function Badge({ act, className }: BadgeProps) {
  const status = BADGE_STATUS[act];
  const roman = ACTS[act].roman;

  return (
    <div
      className={cn(
        'inline-flex items-stretch gap-0',
        'rounded-sm border border-line bg-scene-deep/45',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex w-7 shrink-0 items-center justify-center',
          'border-r border-line',
          'font-legend text-xs text-ink-dim',
        )}
      >
        {roman}
      </span>
      <span className="flex min-w-0 flex-col justify-center gap-0.5 px-2.5 py-1">
        <span className="font-legend text-[9px] leading-none uppercase tracking-[0.16em] text-ink-dim">
          {BADGE_LEGEND}
        </span>
        <span className="truncate font-display text-sm leading-none uppercase tracking-[0.01em] text-ink">
          {status}
        </span>
      </span>
    </div>
  );
}
