import type { JSX } from 'react';
import { motion } from 'motion/react';
import { Chip } from '../../ui/Chip';
import { cascadeDelay, quick, useReducedMotion } from '../../lib/motion';
import type { Chip as ChipData, Fact } from '../../content/types';

interface FactsListProps {
  facts: Fact[];
}

/**
 * Факты дела (SPEC.md §4, экран 2): каскад появления. Маркер — нейтральная
 * неразрывная черта фиксированной ширины, не порядковый номер: порядок
 * фактов ничего не сообщает (это не пронумерованная улика вроде
 * `УЛИКА 01 / 03`, где число — часть грамматики мира), а двузначные номера
 * `01`–`07` на 360px переносились сами по себе (цифра оставалась на одной
 * строке, следующая уезжала на другую). Маркер — отдельный flex-элемент
 * фиксированной ширины с `shrink-0`/`whitespace-nowrap`, поэтому вторая
 * строка длинного факта переносится вровень с первой (по левому краю текста,
 * а не под маркер) — вынесено в отдельный компонент, чтобы
 * VasyaIntroScreen.tsx не разрастался за 200 строк (PLAN.md «Общие
 * ограничения»).
 */
export function FactsList({ facts }: FactsListProps): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <ul className="flex flex-col gap-2">
      {facts.map((fact, i) => (
        <motion.li
          key={fact.id}
          initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={{ ...quick, delay: cascadeDelay(i) }}
          className="flex items-start gap-3"
        >
          <span aria-hidden="true" className="mt-[10px] h-px w-3 shrink-0 whitespace-nowrap bg-ink-600" />
          <span className="font-body text-4 text-paper">{fact.text}</span>
        </motion.li>
      ))}
    </ul>
  );
}

interface ChipsRowProps {
  chips: ChipData[];
}

/** Чипы-версии (SPEC.md §4, экран 2): каскад появления, знак вопроса уже
 *  часть текста в контенте (`Chip.label`). */
export function ChipsRow({ chips }: ChipsRowProps): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        <motion.div
          key={chip.id}
          initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={{ ...quick, delay: cascadeDelay(i) }}
        >
          <Chip>{chip.label}</Chip>
        </motion.div>
      ))}
    </div>
  );
}
