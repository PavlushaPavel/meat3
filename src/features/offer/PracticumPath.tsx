import type { JSX } from 'react';
import { Prose } from '../../ui/Prose';
import type { PracticumStep } from '../../content/types';

interface PracticumPathProps {
  name: string;
  steps: PracticumStep[];
  closingLine: string;
}

/** Путь практикума «Лендос за вечер» — шаги моноширинным (SPEC.md §4, экран 23). */
export function PracticumPath({ name, steps, closingLine }: PracticumPathProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-3 uppercase tracking-[0.08em] text-paper">{name}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {steps.map((step) => (
          <span key={step.id} className="font-mono text-3 uppercase tracking-[0.04em] text-fog">
            {step.label}
          </span>
        ))}
      </div>
      <Prose>{closingLine}</Prose>
    </div>
  );
}
