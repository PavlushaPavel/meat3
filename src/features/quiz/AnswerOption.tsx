import { cn } from '@/lib/cn';

export type AnswerState = 'idle' | 'right' | 'wrong' | 'muted';

export interface AnswerOptionProps {
  text: string;
  state: AnswerState;
  disabled: boolean;
  onSelect: () => void;
}

/**
 * Один вариант ответа допуска. Грейд акта V: тревожный красный на чёрном —
 * `--color-accent` и `--color-danger` здесь оба красные, поэтому состояние
 * НИКОГДА не передаётся только цветом (docs/SPEC.md, требование
 * доступности): у верного варианта и у выбранного неверного есть собственный
 * знак (галка / крест) и собственная текстовая подпись — дальтоник обязан
 * понять, где правильный ответ, не различая оттенки одного и того же
 * тревожного красного.
 *
 * Цель под палец — минимум 44px по высоте (`min-h-[44px]`), допуск сдают
 * с телефона.
 */
export function AnswerOption({ text, state, disabled, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex min-h-[44px] w-full items-center justify-between gap-3',
        'rounded-sm border px-4 py-3.5 text-left',
        'transition-colors duration-150 ease-snap',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        state === 'idle' && 'border-line bg-scene-deep/50 text-ink',
        state === 'right' && 'border-accent bg-accent/15 text-ink',
        state === 'wrong' && 'border-danger bg-danger/15 text-ink',
        state === 'muted' && 'border-line/40 text-ink-dim',
      )}
    >
      <span className="min-w-0">{text}</span>
      {state === 'right' && <StatusMark kind="right" />}
      {state === 'wrong' && <StatusMark kind="wrong" />}
    </button>
  );
}

function StatusMark({ kind }: { kind: 'right' | 'wrong' }) {
  const label = kind === 'right' ? 'Верно' : 'Твой ответ';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-xs px-2 py-1',
        'font-legend text-[10px] uppercase tracking-[0.06em]',
        kind === 'right' ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger',
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3">
        {kind === 'right' ? (
          <path
            d="M2.2 6.4 L4.8 9 L9.8 3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M3 3 L9 9 M9 3 L3 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        )}
      </svg>
      {label}
    </span>
  );
}
