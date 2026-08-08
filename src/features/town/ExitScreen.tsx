import { cityExit } from '@/content/town';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { CitySkyline } from '@/ui/CitySkyline';
import { Screen } from '@/ui/CityStage';
import { Legend } from '@/ui/Plate';

/**
 * Шаг 23. Выход из лаборатории — ГЛАВНЫЙ КАТАРСИЧЕСКИЙ ЭКРАН ПРИЛОЖЕНИЯ.
 *
 * ПОЧЕМУ ОН ОТДЕЛЬНЫЙ, А НЕ КОНЦОВКА КАРТЫ. Мысль здесь ровно одна, и она
 * держится на пустоте вокруг: город не изменился, изменился человек. Если
 * поставить её под легенду маршрута, она станет подписью к схеме. Поэтому на
 * экране нет ни карты, ни приборов, ни списков — только горизонт и одна фраза
 * (решение согласовано 08.08.2026).
 *
 * Тот же силуэт города, что на первом экране, но теперь окна горят ярче: это
 * буквально тот же горизонт, посмотренный другими глазами.
 */
export function ExitScreen() {
  const { next } = useNav();

  return (
    <Screen className="min-h-dvh justify-between gap-10">
      <div className="pt-10">
        <Legend className="text-neon">ДВЕРИ ЛАБОРАТОРИИ ОТКРЫТЫ</Legend>

        <h1 className="mt-6 font-display text-hero font-bold uppercase leading-[0.94] tracking-tight">
          {cityExit.title}
        </h1>

        <p className="mt-6 text-lead leading-snug text-ink-dim">{cityExit.line}</p>
      </div>

      <div>
        <CitySkyline className="mb-8 opacity-100" />

        <p className="neon-ink mb-7 font-display text-lead font-semibold uppercase leading-snug">
          {cityExit.lead}
        </p>

        <Button onClick={next}>{cityExit.cta}</Button>
      </div>
    </Screen>
  );
}
