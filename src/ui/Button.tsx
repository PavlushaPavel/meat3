import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Law } from '@/content/types';

/**
 * Кнопка мира (docs/SPEC.md §1). Жёсткий прямоугольник — маленький радиус,
 * офсетная тень без размытия, «впечатывается» в поверхность по тапу
 * (тень уходит, содержимое сдвигается на её офсет). Никаких мягких
 * скруглений, никаких капель — предмет, а не оформление.
 *
 * Публичный API НЕ меняется относительно прежнего мира (эти пропы уже
 * использует каждый экран, который параллельно переделывает другой агент):
 * `law` остаётся в сигнатуре ради совместимости, но здесь игнорируется —
 * внешний вид кнопки теперь берётся из текущего акта через `ActStage`
 * (`--color-accent`/`--color-on-accent` и т.д. каскадом из `data-act`), а не
 * из закона, под которым жил конкретный экран в снесённом мире.
 */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Основное действие экрана — одно на экран. */
  tone?: 'primary' | 'quiet';
  /** @deprecated Оставлен для совместимости со старым миром. Игнорируется:
   * вид кнопки задаёт текущий акт (`ActStage`), а не закон экрана. */
  law?: Law;
  /** Растянуть на всю ширину — так живёт основное действие на телефоне. */
  full?: boolean;
}

/** Метка направления действия: жёсткая «галочка вперёд», не капля. */
function AdvanceMark() {
  return (
    <svg aria-hidden viewBox="0 0 10 16" className="h-4 w-2.5 shrink-0 opacity-80">
      <path
        d="M1.5 1L8.5 8L1.5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

const PRESSABLE_SHADOW =
  // Офсетная тень без блюра — карточка приподнята над сценой. По тапу
  // (см. `active:` ниже) содержимое сдвигается ровно на офсет тени, а сама
  // тень гасится — кнопка визуально впечатывается в поверхность, не пружинит.
  'shadow-[3px_3px_0_0_rgb(0_0_0_/_0.4)]';

export function Button({
  children,
  tone = 'primary',
  law,
  full = false,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  // Совместимость публичного API (см. комментарий у `ButtonProps.law` выше):
  // проп принимается и осознанно не используется — вид кнопки берёт текущий
  // акт, а не закон экрана.
  void law;

  return (
    <button
      {...rest}
      disabled={disabled}
      className={cn(
        'group relative inline-flex items-center justify-between gap-4',
        'rounded-sm px-5 py-3.5 text-left',
        'font-display text-base uppercase tracking-[0.02em]',
        'transition-[transform,opacity,background-color,box-shadow] duration-150 ease-snap',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        disabled
          ? // Недоступная кнопка — контурная и пунктирная, не просто тусклая
            // заливка: форма меняется, не только цвет (требование доступности).
            cn('border border-dashed border-line bg-transparent text-ink-dim')
          : tone === 'primary'
            ? cn('border border-line bg-accent text-on-accent', PRESSABLE_SHADOW, 'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none')
            : cn(
                'border-2 border-line bg-transparent text-ink',
                'active:translate-x-[1px] active:translate-y-[1px]',
              ),
        disabled && 'pointer-events-none opacity-70',
        full && 'w-full',
        className,
      )}
    >
      <span className="min-w-0">{children}</span>
      <AdvanceMark />
    </button>
  );
}
