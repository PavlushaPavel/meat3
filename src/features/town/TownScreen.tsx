import { townIntro } from '@/content/town';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { CitySkyline } from '@/ui/CitySkyline';
import { Screen } from '@/ui/CityStage';
import { Legend, TapeStrip } from '@/ui/Plate';

/**
 * Шаг 1. Первый экран приложения: ночной Traffic Town.
 *
 * ЗАДАЧА ЭКРАНА — не объяснить продукт, а поставить рамку: это город, у каждого
 * здесь свой кусок, и виноват всегда один и тот же человек. Карты тут ещё нет:
 * человек не выбрал район, показывать ему нечего, а пустая карта в тумане
 * выглядела бы как незагрузившийся экран (docs/SPEC.md §3.1).
 */
export function TownScreen() {
  const { next } = useNav();

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend className="text-hazard">{townIntro.legend}</Legend>

        <h1 className="mt-4 font-display text-hero font-bold uppercase leading-[0.92] tracking-tight">
          <span className="block">TRAFFIC</span>
          <span className="neon-ink block">TOWN</span>
        </h1>

        <TapeStrip className="mt-5 max-w-40" />

        <div className="mt-6 space-y-3">
          {townIntro.lines.map((line) => (
            <p key={line} className="max-w-[34ch] text-lead leading-snug text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div>
        <CitySkyline className="mb-6 opacity-90" />
        <Button onClick={next}>{townIntro.cta}</Button>
      </div>
    </Screen>
  );
}
