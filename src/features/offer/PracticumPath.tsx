import type { JSX } from 'react';
import { motion } from 'motion/react';
import { Prose } from '../../ui/Prose';
import { cascadeDelay, spring, useReducedMotion } from '../../lib/motion';
import type { PracticumStep } from '../../content/types';

interface PracticumPathProps {
  name: string;
  steps: PracticumStep[];
  closingLine: string;
}

/**
 * Путь практикума «Лендос за вечер» — моноширинная нотация дела с визуальной
 * последовательностью (SPEC.md §4, экран 23; отчёт финальной доводки, пункт
 * 3): раньше пять шагов лежали `flex-wrap` без всякой связи между собой,
 * читались как список тегов, а не как путь. Стрелки между шагами и лёгкий
 * каскад появления — тот же приём, что у цепочки «Человек → … → ???» на
 * мосту экрана 15 (`Bridge2Screen`/`Chain`).
 */
export function PracticumPath({ name, steps, closingLine }: PracticumPathProps): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-3 uppercase tracking-[0.08em] text-paper">{name}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {steps.map((step, index) => (
          <span key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="font-mono text-3 text-fog">
                →
              </span>
            ) : null}
            <motion.span
              initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
              animate={{ opacity: 1, transform: 'scale(1)' }}
              transition={{ ...spring, delay: cascadeDelay(index) }}
              className="font-mono text-3 uppercase tracking-[0.04em] text-fog"
            >
              {step.label}
            </motion.span>
          </span>
        ))}
      </div>
      <Prose>{closingLine}</Prose>
    </div>
  );
}
