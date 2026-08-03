import type { JSX } from 'react';
import { motion } from 'motion/react';
import type { Suspect } from '../content/types';
import { cn } from '../lib/cn';
import { haptics } from '../lib/telegram';
import { spring, useReducedMotion } from '../lib/motion';

interface SuspectLineupProps {
  suspects: Suspect[];
  value: string | null;
  onPick: (id: string) => void;
}

/** Каскад появления карточек — максимум 40 мс/элемент, не больше шести подряд
 *  (SPEC.md §2.4); пять подозреваемых укладываются в потолок без обрезки. */
const CASCADE_STEP = 0.04;

/**
 * Пять карточек-досье, одиночный выбор (SPEC.md §4, экран 7; PLAN.md
 * «Задача 5»). Собственный примитив, а не обёртка над Choice/ChoiceList: имя
 * и строка ситуации — два визуально разных ранга текста (как заголовок
 * DossierCard), а не одна строка варианта ответа.
 *
 * Никакой оценки правильности: `Suspect.tone` (alarm у Феди) сюда намеренно
 * не попадает — это поле служит только раскрытому досье экрана 8. Если бы
 * лайнап красил карточку Феди, экран 8 перестал бы быть открытием.
 */
export function SuspectLineup({ suspects, value, onPick }: SuspectLineupProps): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <div role="radiogroup" className="flex flex-col gap-3">
      {suspects.map((suspect, index) => {
        const selected = value === suspect.id;

        return (
          <motion.button
            key={suspect.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              haptics.select();
              onPick(suspect.id);
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            transition={{ ...spring, delay: index * CASCADE_STEP }}
            style={{
              background: selected ? 'color-mix(in srgb, var(--signal) 16%, var(--ink-800))' : undefined,
            }}
            className={cn(
              'flex w-full flex-col gap-1 rounded-card border px-4 py-4 text-left',
              'transition-[transform,background-color,border-color] duration-[180ms] ease-[var(--ease-out)] active:scale-[0.97]',
              selected ? 'border-signal' : 'border-[var(--edge)] bg-ink-800'
            )}
          >
            <span className={cn('font-body text-4 font-medium', selected ? 'text-signal' : 'text-paper')}>
              {suspect.name}
            </span>
            <span className={cn('font-body text-3', selected ? 'text-signal' : 'text-fog')}>{suspect.line}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
