import type { JSX, ReactNode } from 'react';
import { cn } from '../lib/cn';

type ButtonVariant = 'primary' | 'ghost' | 'evidence';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  hint?: string;
}

// ghost: граница --edge (не --ink-600 — тот даёт 1.32:1 к фону, границы не
// видно) + заливка --ink-800, иначе кнопка читается как строка текста без
// намёка, что по ней можно нажать.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-signal text-ink-900',
  ghost: 'border border-[var(--edge)] bg-ink-800 text-paper',
  evidence: 'bg-evidence text-ink-900',
};

// Неактивное состояние раньше было тем же VARIANT_CLASS при opacity-40:
// заливка варианта гасла вместе с текстом и границей, и на телефоне вечером
// от кнопки не оставалось формы — читался серый текст, а не «кнопка, пока
// недоступна» (см. отчёт финальной доводки, пункт про хвосты интерфейса).
// Первая правка (полностью непрозрачная палитра с контуром --edge поверх
// --ink-800) оказалась регрессом: она буквально совпадает с VARIANT_CLASS.ghost
// (та же сплошная граница --edge, та же заливка --ink-800) — разница только в
// цвете текста. На UnlockScreen (экраны 9/14) настоящая ghost-кнопка стоит
// рядом с заблокированной, и на глаз они неотличимы: палец жмёт в тупик.
// Теперь disabled различается по форме, а не только по цвету текста:
// пунктирная граница вместо сплошной и отсутствие заливки — «место под
// кнопку, которое ещё не заполнено», совпадает по смыслу с миром воронки
// (материал ещё не подшит к делу).
const DISABLED_CLASS = 'cursor-not-allowed border border-dashed border-[var(--edge)] bg-transparent text-fog';

/**
 * Кнопка (SPEC.md §2.4, Задача 2). `disabled` не даёт нажатия и не вызывает
 * `onClick`, поэтому любой haptic, который навешивает вызывающий экран внутри
 * своего обработчика, тоже не сработает — Button ничего не решает за экран, а
 * просто не даёт дойти до обработчика. `:active` — только когда не disabled.
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  hint,
}: ButtonProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={cn(
          'w-full rounded-card px-6 py-4 text-center font-body text-4 font-medium',
          'transition-[transform,opacity] duration-[160ms] ease-[var(--ease-out)]',
          disabled ? DISABLED_CLASS : cn('cursor-pointer active:scale-[0.97]', VARIANT_CLASS[variant])
        )}
      >
        {children}
      </button>
      {disabled && hint ? <p className="font-body text-2 text-fog">{hint}</p> : null}
    </div>
  );
}
