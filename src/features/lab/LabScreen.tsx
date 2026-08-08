import { labEntry } from '@/content/lab';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { ScenePanel, Screen } from '@/ui/CityStage';
import { Legend, TapeStrip } from '@/ui/Plate';
import { cn } from '@/lib/cn';

/**
 * Шаг 8. Вход в TRAFFIC LAB. Стена с формулой связки.
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

        {/* Формула живёт на настоящей стене, а не в четырёх одинаковых карточках. */}
        <ScenePanel
          asset="formula-hall.webp"
          alt="Формульный зал Traffic Lab с четырьмя соединёнными рабочими станциями"
          className="mt-6 aspect-[4/5]"
        >
          <div className="flex h-full items-center p-4">
            <div className="w-full border border-line bg-scene-deep/85 p-3 backdrop-blur-[2px]">
              <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                {labEntry.formula.map((part, i) => {
                  const isTraffic = part === 'ТРАФИК';
                  return (
                    <div key={part} className="contents">
                      {i > 0 && i % 2 === 1 && (
                        <span aria-hidden="true" className="grid place-items-center text-ink-dim">
                          ×
                        </span>
                      )}
                      {i === 2 && <span aria-hidden="true" className="col-span-3 h-px bg-line" />}
                      <p
                        className={cn(
                          'grid min-h-16 place-items-center border px-2 py-3 text-center font-display text-base font-semibold uppercase tracking-wide',
                          i % 2 === 0 ? 'col-start-1' : 'col-start-3',
                          isTraffic
                            ? 'neon-edge border-neon text-neon'
                            : 'border-line bg-scene-deep/70 text-ink',
                        )}
                      >
                        <span>
                          {part}
                          {isTraffic && (
                            <span className="legend mt-1 block text-ink-dim">ТВОЙ РАЙОН</span>
                          )}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>

              <p aria-hidden="true" className="py-2 text-center text-lg text-ink-dim">
                =
              </p>
              <p className="bg-hazard px-4 py-3 text-center font-display text-2xl font-bold uppercase tracking-wide text-on-hazard">
                {labEntry.result}
              </p>
            </div>
          </div>
        </ScenePanel>

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
