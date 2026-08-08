import { townIntro } from '@/content/town';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { Legend, TapeStrip } from '@/ui/Plate';

/**
 * Шаг 1. Первый экран приложения: ночной Traffic Town.
 *
 * ПЕРВЫМ ЭКРАНОМ НЕ БОЛЬ, А ОБЕЩАНИЕ МИРА (структура заказчика 08.08.2026).
 * Раньше воронка открывалась обвинением; теперь она открывается вопросом, на
 * который человек сам хочет ответ: почему один специалист ведёт три-пять
 * клиентов годами, а другой каждый месяц оправдывается. Боль переехала на
 * четвёртый экран, где у неё появилась ставка — потеря клиента и денег.
 *
 * Карты здесь нет: район ещё не выбран, показывать нечего (docs/SPEC.md §3.1).
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

        <p className="mt-6 text-lead leading-snug text-ink">{townIntro.welcome}</p>

        <div className="mt-4 space-y-3">
          {townIntro.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        {/* Отказ проговаривается вслух — это часть обещания, а не оговорка. */}
        <p className="mt-6 border-l-2 border-line pl-4 text-base text-ink-dim">
          {townIntro.not}
        </p>

        <p className="mt-6 text-base text-ink">{townIntro.lead}</p>
        <p className="mt-3 font-display text-lead font-semibold uppercase leading-snug text-neon">
          {townIntro.promise}
        </p>
        <p className="mt-5 text-base text-ink-dim">{townIntro.closing}</p>
      </div>

      <Button onClick={next}>{townIntro.cta}</Button>
    </Screen>
  );
}
