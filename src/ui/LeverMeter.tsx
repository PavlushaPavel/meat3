import type { JSX } from 'react';
import { cn } from '../lib/cn';

interface LeverMeterProps {
  opened: 0 | 1 | 2 | 3;
}

const SEGMENTS = [0, 1, 2] as const;

/**
 * Индикатор «N из 3 рычагов открыты» (SPEC.md экраны 10/19). Три деления,
 * открытые — жёлтые (--evidence), закрытые — волосяная линия --ink-600.
 * Никаких прогресс-колец (Задача 2, «Чего в этом мире быть не должно»).
 */
export function LeverMeter({ opened }: LeverMeterProps): JSX.Element {
  return (
    <div className="flex gap-2" role="meter" aria-valuemin={0} aria-valuemax={3} aria-valuenow={opened}>
      {SEGMENTS.map((index) => (
        <span
          key={index}
          data-filled={index < opened}
          className={cn(
            'h-1 flex-1 rounded-chip transition-[background-color] duration-200 ease-[var(--ease-out)]',
            index < opened ? 'bg-evidence' : 'bg-ink-600'
          )}
        />
      ))}
    </div>
  );
}
