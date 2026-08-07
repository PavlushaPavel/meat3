import { cn } from '@/lib/cn';
import { PROBE_SCALE_MAX } from './probeReadings';
import { useProbeCountUp } from './useProbeCountUp';

/**
 * Одно живое показание прибора ИИ на карточке пробы (docs/SPEC.md §3.3).
 * Деление за делением, не мгновенная цифра — см. `useProbeCountUp`.
 *
 * `aria-hidden`: числовое табло и шкала здесь чисто визуальные, точное
 * значение для скринридера озвучивает одна сводная фраза на всю карточку —
 * `ProbeCard.tsx` — а не два обрывка на каждый прибор по отдельности.
 */
export interface ProbeGaugeProps {
  /** Короткая подпись прибора: «причина», «готовность» — легенда, не абзац. */
  label: string;
  target: number;
  delayMs?: number;
  className?: string;
}

export function ProbeGauge({ label, target, delayMs = 0, className }: ProbeGaugeProps) {
  const value = useProbeCountUp(target, { delayMs });
  const divisions = Array.from({ length: PROBE_SCALE_MAX }, (_, i) => i);

  return (
    <div aria-hidden className={cn('flex min-w-0 flex-col gap-1', className)}>
      <div className="flex items-baseline justify-between gap-2 font-legend text-[10px] uppercase tracking-[0.1em] text-paper-ink-dim">
        <span>{label}</span>
        <span className="tabular-nums text-paper-ink">
          {String(value).padStart(2, '0')}
          <span className="text-paper-ink-dim">/{PROBE_SCALE_MAX}</span>
        </span>
      </div>
      <div className="flex gap-[2px]">
        {divisions.map((i) => (
          <span
            key={i}
            className={cn('h-1.5 flex-1 rounded-xs', i < value ? 'bg-accent' : 'bg-paper-ink-dim/20')}
          />
        ))}
      </div>
    </div>
  );
}
