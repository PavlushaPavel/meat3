import { labEntry } from '@/content/lab';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend, TapeStrip } from '@/ui/Plate';
import { cn } from '@/lib/cn';

/**
 * Шаг 8. Вход в LAB 77. Стена с формулой связки.
 *
 * ТРАФИК подсвечен не потому, что он главный, а наоборот: человек пришёл сюда
 * специалистом ровно по одному множителю из четырёх, и увидеть это он должен
 * глазами, до того как прочитает подпись (docs/SPEC.md §3.4).
 */
export function LabScreen() {
  const { next } = useNav();

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-7">
        <Legend className="text-neon">{labEntry.legend}</Legend>

        <h1 className="mt-3 font-display text-hero font-bold uppercase leading-none tracking-tight">
          {labEntry.title}
        </h1>
        <p className="mt-2 text-base text-ink-dim">{labEntry.standfirst}</p>

        <TapeStrip className="mt-5" />

        {/* Формула на большой стене. */}
        <MetalPanel className="mt-6 p-5">
          <div className="space-y-2.5">
            {labEntry.formula.map((part, i) => {
              const isTraffic = part === 'ТРАФИК';
              return (
                <div key={part}>
                  {i > 0 && (
                    <p aria-hidden="true" className="py-1 text-center text-lg text-ink-dim">
                      ×
                    </p>
                  )}
                  <p
                    className={cn(
                      'rounded-plate border px-4 py-3 text-center font-display text-xl font-semibold uppercase tracking-wide',
                      isTraffic
                        ? 'neon-edge border-neon text-neon'
                        : 'border-line text-ink-dim',
                    )}
                  >
                    {part}
                    {isTraffic && (
                      <span className="legend mt-1 block text-ink-dim">ТВОЙ РАЙОН</span>
                    )}
                  </p>
                </div>
              );
            })}

            <p aria-hidden="true" className="py-1 text-center text-lg text-ink-dim">
              =
            </p>
            <p className="bg-hazard px-4 py-3 text-center font-display text-2xl font-bold uppercase tracking-wide text-on-hazard">
              {labEntry.result}
            </p>
          </div>
        </MetalPanel>

        <p className="mt-6 font-display text-lead font-semibold uppercase leading-snug text-ink">
          {labEntry.lead}
        </p>

        <div className="mt-4 space-y-2">
          {labEntry.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      <Button onClick={next}>{labEntry.cta}</Button>
    </Screen>
  );
}
