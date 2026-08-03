import type { JSX } from 'react';
import { motion } from 'motion/react';
import { Choice } from './Choice';
import { cascadeDelay, quick, useReducedMotion } from '../lib/motion';

export interface ChoiceOption {
  id: string;
  label: string;
}

interface ChoiceListProps {
  options: ChoiceOption[];
  value: string | string[];
  onChange: (id: string) => void;
  multi?: boolean;
}

/**
 * Список вариантов (SPEC.md §4, экраны 3/5/22). `value` — id для одиночного
 * выбора или массив id для множественного; какой из них передан, определяет
 * `multi`. Сам список не решает, что делать с повторным нажатием на уже
 * выбранный id (toggle/replace) — это логика `onChange`, которую пишет экран
 * поверх `useCase`.
 *
 * Появление — каскад 40 мс на элемент, максимум 6 (SPEC.md §2.4,
 * `cascadeDelay`), с уважением `prefers-reduced-motion` (только opacity, без
 * масштаба, см. `useReducedMotion`). Раньше это делала внешняя CSS-обёртка
 * `ChoiceCascade` (src/features/vasya), целившаяся в разметку через
 * `nth-child` поверх этого компонента — хрупко и молча ломалось при любой
 * правке разметки. Каскад — часть примитива, а не чужая надстройка над ним.
 */
export function ChoiceList({ options, value, onChange, multi = false }: ChoiceListProps): JSX.Element {
  const reduced = useReducedMotion();
  const isSelected = (id: string): boolean => (Array.isArray(value) ? value.includes(id) : value === id);

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, i) => (
        <motion.div
          key={option.id}
          initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={{ ...quick, delay: cascadeDelay(i) }}
        >
          <Choice label={option.label} selected={isSelected(option.id)} onSelect={() => onChange(option.id)} multi={multi} />
        </motion.div>
      ))}
    </div>
  );
}
