import { cn } from '@/lib/cn';

export type AnswerState = 'idle' | 'right' | 'wrong' | 'muted';

export interface AnswerOptionProps {
  text: string;
  state: AnswerState;
  disabled: boolean;
  onSelect: () => void;
}

/**
 * Один вариант ответа теста.
 *
 * Состояние никогда не передаётся только цветом: у верного варианта и у
 * выбранного неверного есть собственный знак (галка / крест) и собственная
 * подпись — дальтоник обязан понять, где правильный ответ, не различая
 * красный и синий (docs/SPEC.md, требование доступности допуска).
 *
 * Цель под палец — минимум 44px по высоте (`min-h-[44px]`), тест сдают с
 * телефона.
 */
export function AnswerOption({ text, state, disabled, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex min-h-[44px] w-full items-center justify-between gap-3',
        'rounded-leaf border px-4 py-3.5 text-left',
        'transition-colors duration-200 ease-drift',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-updraft',
        state === 'idle' && 'border-moss-veil/25 bg-garden-deep/40 text-orbit',
        state === 'right' && 'border-updraft/70 bg-updraft/15 text-orbit',
        state === 'wrong' && 'border-deflect/70 bg-deflect/15 text-orbit',
        state === 'muted' && 'border-moss-veil/15 text-orbit/45',
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
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1',
        'font-legend text-[10px] uppercase tracking-[0.06em]',
        kind === 'right' ? 'bg-updraft/15 text-updraft' : 'bg-deflect/15 text-deflect',
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
