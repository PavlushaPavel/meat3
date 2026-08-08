import type { ReactNode } from 'react';
import { map1, map2, mapFinal, zoomOut } from '@/content/town';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { FALLBACK_DISTRICT, districtById } from '@/world';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { TownMap } from '@/ui/TownMap';
import { Legend } from '@/ui/Plate';

/**
 * Экраны карты: шаги `zoomout`, `map1`, `map2`, `mapfinal`.
 *
 * Все четыре — один и тот же экран с разным текстом, и это не экономия. Карта
 * обязана выглядеть ОДИНАКОВО каждый раз: весь смысл в том, что меняется не
 * она, а количество открытого на ней. Если бы каждый переход рисовал свою
 * карту, сравнивать было бы нечего (docs/SPEC.md §3.8).
 */
function MapLayout({
  legend,
  title,
  children,
  cta,
  onNext,
}: {
  legend: string;
  title: string;
  children?: ReactNode;
  cta: string;
  onNext: () => void;
}) {
  const step = useFunnel((s) => s.step);
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;

  return (
    <Screen className="min-h-dvh justify-between gap-6">
      <div className="pt-6">
        <Legend className="text-neon">{legend}</Legend>
        <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
          {title}
        </h1>

        <TownMap step={step} district={district} className="mt-5" />

        {children && <div className="mt-6 space-y-3">{children}</div>}
      </div>

      <Button onClick={onNext}>{cta}</Button>
    </Screen>
  );
}

/** Шаг 6. Карта отдаляется: вокруг проступают безымянные территории. */
export function ZoomOutScreen() {
  const { next } = useNav();

  return (
    <MapLayout legend={zoomOut.legend} title={zoomOut.title} cta={zoomOut.cta} onNext={next}>
      {zoomOut.blocks.map((line) => (
        <p key={line} className="text-base text-ink-dim">
          {line}
        </p>
      ))}
      <p className="pt-1 font-display text-lead font-semibold uppercase leading-snug text-ink">
        {zoomOut.closing}
      </p>
    </MapLayout>
  );
}

/** Шаг 13. Открыт AUDIENCE ZONE. */
export function Map1Screen() {
  const { next } = useNav();

  return (
    <MapLayout legend={map1.legend} title={map1.title} cta={map1.cta} onNext={next}>
      {map1.blocks.map((line) => (
        <p key={line} className="text-base text-ink-dim">
          {line}
        </p>
      ))}
    </MapLayout>
  );
}

/** Шаг 16. Открыт OFFER MARKET. */
export function Map2Screen() {
  const { next } = useNav();

  return (
    <MapLayout legend={map2.legend} title={map2.title} cta={map2.cta} onNext={next}>
      {map2.blocks.map((line) => (
        <p key={line} className="text-base text-ink-dim">
          {line}
        </p>
      ))}
      <p className="pt-1 font-display text-lead font-semibold uppercase leading-snug text-neon">
        {map2.lead}
      </p>
      {map2.closing.map((line) => (
        <p key={line} className="text-base text-ink-dim">
          {line}
        </p>
      ))}
    </MapLayout>
  );
}

/**
 * Шаг 22. Финальная карта.
 *
 * Здесь впервые видна вся дорога и обводка «твоя зона влияния». Отдел продаж
 * остаётся серым, и про это говорится вслух — иначе рамка читалась бы как
 * обещание закрыть продажу целиком (docs/SPEC.md §4 правило 3).
 */
export function MapFinalScreen() {
  const { next } = useNav();

  return (
    <MapLayout
      legend={mapFinal.legend}
      title={mapFinal.title}
      cta={mapFinal.cta}
      onNext={next}
    >
      {mapFinal.blocks.map((line) => (
        <p key={line} className="text-base text-ink-dim">
          {line}
        </p>
      ))}

      <div className="mt-2 rounded-panel border border-line bg-scene-deep/60 p-4">
        <Legend>{mapFinal.sales.title}</Legend>
        <div className="mt-2 space-y-2">
          {mapFinal.sales.blocks.map((line) => (
            <p key={line} className="text-small text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      <p className="pt-2 font-display text-lead font-semibold uppercase leading-snug text-ink">
        {mapFinal.lead}
      </p>
      <p className="text-base text-ink-dim">{mapFinal.after}</p>
    </MapLayout>
  );
}
