import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Law } from '@/content/types';

/**
 * Таблетка мира: скруглённая кнопка с каплевым столбцом справа.
 *
 * Каплевый столбец — не украшение: три капли показывают закон, под которым
 * живёт действие, и это единственная форма кнопки во всём приложении.
 * Стоковых кнопок в этом мире нет.
 */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Основное действие экрана — одно на экран. */
  tone?: 'primary' | 'quiet';
  /** Закон, под которым живёт действие. Красит заливку и капли. */
  law?: Law;
  /** Растянуть на всю ширину — так живёт основное действие на телефоне. */
  full?: boolean;
}

const LAW_FILL: Record<Law, string> = {
  updraft: 'bg-updraft text-garden-deep',
  deflect: 'bg-deflect text-garden-deep',
  orbit: 'bg-orbit text-anchor',
  // Чёрная заливка на тёмной земле сама по себе почти не видна: основное
  // действие экрана обязано читаться, поэтому у ANCHOR есть светлый кант.
  anchor: 'bg-anchor text-orbit ring-1 ring-moss-veil/45',
};

const LAW_INK: Record<Law, string> = {
  updraft: 'text-updraft',
  deflect: 'text-deflect',
  orbit: 'text-orbit',
  anchor: 'text-orbit',
};

/**
 * Объём таблетки: тонкая светлая кромка сверху (роса на краю, изнутри —
 * `inset`) плюс мягкая тень снизу (переиспользует существующий токен
 * `--shadow-drop` из tokens.css, не заводит новый). Только активные
 * состояния — недоступная таблетка остаётся плоским контуром нарочно (её
 * задача не выглядеть как предмет, см. комментарий у `disabled` ниже).
 */
const ACTIVE_MATERIAL_SHADOW =
  // Кромка 0,28 и мягкая тень читались приборно, но не глазом: на снимке
  // таблетка оставалась плоским прямоугольником с радиусом. Кромка усилена,
  // тень опущена и растянута — предмет, а не заливка. Мир матовый, поэтому
  // глянцевого блика здесь по-прежнему нет.
  'shadow-[inset_0_1px_0_0_rgba(231,232,228,0.42),inset_0_-1px_0_0_rgba(14,15,16,0.18),0_4px_14px_-4px_rgba(14,15,16,0.55)]';

/** Каплевый столбец: три капли, падающие по закону кнопки. */
function DropColumn({ law }: { law: Law }) {
  return (
    <span aria-hidden className="flex flex-col items-center gap-[3px] opacity-70">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'block rounded-full bg-current',
            // Капли сужаются по ходу падения — у updraft порядок обратный.
            law === 'updraft'
              ? ['h-[3px] w-[3px]', 'h-[4px] w-[4px]', 'h-[5px] w-[5px]'][i]
              : ['h-[5px] w-[5px]', 'h-[4px] w-[4px]', 'h-[3px] w-[3px]'][i],
          )}
        />
      ))}
    </span>
  );
}

export function Button({
  children,
  tone = 'primary',
  law = 'updraft',
  full = false,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={cn(
        'group inline-flex items-center justify-between gap-4',
        'rounded-full px-6 py-4 text-left',
        'font-body text-base font-medium',
        'transition-[transform,opacity,background-color] duration-200 ease-drift',
        'active:scale-[0.985]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-updraft',
        // Неактивная кнопка обязана быть различимой, но НЕ похожей на рабочую:
        // залитая таблетка на 45% прозрачности читается как живая при беглом
        // просмотре, и человек считает, что действие доступно. Поэтому
        // недоступное состояние — всегда контурное, без заливки.
        disabled
          ? cn('border border-dashed border-moss-veil/45 bg-transparent', LAW_INK[law])
          : tone === 'primary'
            ? LAW_FILL[law]
            : cn('border border-moss-veil/40 bg-transparent', LAW_INK[law]),
        !disabled && ACTIVE_MATERIAL_SHADOW,
        disabled && 'pointer-events-none opacity-80',
        full && 'w-full',
        className,
      )}
    >
      <span className="min-w-0">{children}</span>
      <DropColumn law={law} />
    </button>
  );
}
