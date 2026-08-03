import type { JSX } from 'react';
import { cn } from '../lib/cn';
import { haptics } from '../lib/telegram';

interface ChoiceProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  multi?: boolean;
}

/**
 * Вариант выбора (SPEC.md §4: инструмент — экран 1, покупатели — экран 3,
 * ответ на сайт — экран 6, квиз — экран 9). Оценки не даём ни в каком виде:
 * выбранный вариант просто подсвечивается голубым (--signal), без галочек и
 * без цвета «правильно/неправильно». Haptic `selectionChanged` — на каждый
 * выбор (SPEC.md §2.4), поэтому живёт здесь, а не в каждом экране отдельно.
 *
 * Граница — токен `--edge` (не `--ink-600`): `--ink-600` даёт 1.32:1 к фону —
 * на телефоне вечером это не линия, а её отсутствие. Заливка есть в обоих
 * состояниях (не только в невыбранном) — заливка и различимая граница вместе
 * дают понятную мишень для пальца, порознь не работает ни то ни другое.
 * Выбранное состояние меняет ещё и заливку (не только цвет линии/текста) —
 * иначе на телефоне разница читается как оттенок, а не как пятно.
 */
export function Choice({ label, selected, onSelect, multi = false }: ChoiceProps): JSX.Element {
  const handleClick = (): void => {
    haptics.select();
    onSelect();
  };

  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={handleClick}
      style={{
        background: selected ? 'color-mix(in srgb, var(--signal) 16%, var(--ink-800))' : undefined,
      }}
      className={cn(
        'w-full rounded-card border px-4 py-4 text-left font-body text-4 leading-[1.4]',
        'transition-[transform,background-color,border-color,color] duration-[180ms] ease-[var(--ease-out)] active:scale-[0.97]',
        selected ? 'border-signal text-signal' : 'border-[var(--edge)] bg-ink-800 text-paper'
      )}
    >
      {label}
    </button>
  );
}
